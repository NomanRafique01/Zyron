"""
orchestrator.py  (stub)
─────────────────────────────────────────────────────────────────────────────
Backwards-compatibility shim.  All real logic lives in the orchestrator/ package:

  orchestrator/_state.py     — ZyronState TypedDict
  orchestrator/_utils.py     — trim_output, build_quality_report,
                               build_fallback_answer, build_token_usage
  orchestrator/_nodes.py     — reasoner_node, coder_node, vision_node,
                               writer_node (each calls prompt_builder + providers)
  orchestrator/_graph.py     — LangGraph StateGraph: parallel specialists → writer
  orchestrator/_pipeline.py  — run_pipeline() public entry point
  orchestrator/__init__.py   — re-exports

Import from the package directly:
    from orchestrator import run_pipeline, ZyronState
"""

from orchestrator import run_pipeline, ZyronState  # noqa: F401

__all__ = ["run_pipeline", "ZyronState"]
