"""
_graph.py
LangGraph StateGraph definition — wires specialist nodes in parallel,
then funnels into the writer node.

Graph topology
--------------

             ┌──────────────┐
     START → │  fan_out     │ (routes to all three specialists simultaneously)
             └──────────────┘
                  │  │  │
         ┌────────┘  │  └────────┐
         ▼           ▼           ▼
     agent1 node agent2 node   agent3 node   (run in parallel via asyncio.gather)
         │           │           │
         └───── ─────┘───────────┘
                     ▼
                 agent4 node
                     │
                    END

LangGraph parallel execution:
  We add a direct edge from START to a "fan_out" node which uses asyncio.gather
  internally to call all three specialist nodes concurrently, writing their
  partial state updates back before passing to the writer.

  This is the correct LangGraph v1 pattern: a single async node that awaits all
  three specialists concurrently is functionally equivalent to true parallel
  branching and fully supported in LangGraph 1.x with async StateGraph.
"""

from __future__ import annotations

import asyncio
from typing import Any, Dict

from langgraph.graph import StateGraph, START, END

from ._state import ZyronState
from ._nodes import reasoner_node, coder_node, vision_node, writer_node


# ─── Fan-out node — runs all three specialists concurrently ──────────────────

async def specialists_parallel(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs reasoner, coder, and vision concurrently using asyncio.gather.

    Each node returns a *partial* state update.  This function merges them all
    into a single update dict so LangGraph can apply it atomically.
    """
    results = await asyncio.gather(
        reasoner_node(state),
        coder_node(state),
        vision_node(state),
        return_exceptions=True,
    )

    # Base merged state — start with whatever already exists
    specialist_outputs: Dict[str, str]        = dict(state.get("specialist_outputs", {}))
    usage_by_role:      Dict[str, Any]         = dict(state.get("usage_by_role", {}))
    agent_results:      list                   = list(state.get("agent_results", []))
    errors:             list                   = list(state.get("errors", []))

    for result in results:
        if isinstance(result, Exception):
            errors.append(f"specialist node crashed: {result}")
            continue
        # Merge partial dicts returned by each node
        specialist_outputs.update(result.get("specialist_outputs", {}))
        usage_by_role.update(result.get("usage_by_role", {}))
        agent_results.extend(result.get("agent_results", []))
        errors.extend(result.get("errors", []))

    return {
        "specialist_outputs": specialist_outputs,
        "usage_by_role":      usage_by_role,
        "agent_results":      agent_results,
        "errors":             errors,
    }


# ─── Graph builder ────────────────────────────────────────────────────────────

def build_graph() -> Any:
    """
    Compile and return the LangGraph pipeline.

    Returns a CompiledStateGraph that accepts ZyronState and can be invoked
    with  `await graph.ainvoke(initial_state)`.
    """
    builder: StateGraph = StateGraph(ZyronState)

    # ── Nodes ─────────────────────────────────────────────────────────────────
    builder.add_node("specialists", specialists_parallel)
    builder.add_node("writer",      writer_node)

    # ── Edges ─────────────────────────────────────────────────────────────────
    builder.add_edge(START,         "specialists")
    builder.add_edge("specialists", "writer")
    builder.add_edge("writer",      END)

    return builder.compile()


# Module-level compiled graph — imported by _pipeline.py
_compiled_graph = build_graph()
