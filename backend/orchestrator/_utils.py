"""
_utils.py
Output-formatting utilities for the orchestrator.

Ported from src/agents/utils/outputFormatter.utils.js:
  - trim_output()
  - build_quality_report()
  - build_fallback_answer()
  - build_token_usage()

Also re-exports deduplicate_outputs (pass-through, matching the JS behaviour).
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

# Hard character cap per specialist fed to the writer.
# 3 × 4 000 chars ≈ 12 000 chars input (~3 000 tokens) — fits every free-tier
# context window after adding the ~2 000-token system prompt.
WRITER_SPECIALIST_CAP = 4_000

# Minimum chars a specialist must produce to be considered "contributed".
# Mirrors MIN_SPECIALIST_CHARS in orchestrator.js.
MIN_SPECIALIST_CHARS = 10


# ─── trim_output ─────────────────────────────────────────────────────────────

def trim_output(text: str, max_chars: int = WRITER_SPECIALIST_CAP) -> str:
    """
    Cap a specialist output at max_chars, cutting at a sentence boundary when
    possible so the writer receives a coherent excerpt.
    """
    if not text:
        return ""
    t = text.strip()
    if len(t) <= max_chars:
        return t
    # Look for a sentence boundary near the cap
    cutzone = t[: max_chars + 200]
    match = re.search(r"[.!?] [A-Z\n](?!.*[.!?] [A-Z\n])", cutzone)
    if match and match.start() > max_chars // 2:
        cut = match.start() + 1
    else:
        cut = max_chars
    return t[:cut].rstrip() + "\n\n*(output truncated for context window — full analysis available)*"


# ─── deduplicate_outputs ─────────────────────────────────────────────────────

def deduplicate_outputs(outputs_by_role: Dict[str, str]) -> Dict[str, str]:
    """
    Pass-through — deduplication is intentionally disabled (mirrors JS behaviour).
    Specialists cover the same topic from different angles; word-overlap similarity
    cannot distinguish "same angle" from "same words about a different angle."
    The writer's synthesis rules handle redundancy elimination at the semantic level.
    """
    return dict(outputs_by_role)


# ─── _score_output (private) ─────────────────────────────────────────────────

def _score_output(text: str, role: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Heuristic quality score 0–10 for one specialist's output."""
    if not text or not text.strip():
        return {"score": 0, "emphasis": "none"}

    words = len(text.strip().split())
    has_math    = bool(re.search(r"\\\(|\\\[|\\frac|\\sum|\\int|\\sqrt", text))
    has_code    = bool(re.search(r"```[\w]*\n", text))
    has_bullets = bool(re.search(r"^\s*[-*•]\s", text, re.MULTILINE))
    has_headers = bool(re.search(r"^#{1,3}\s", text, re.MULTILINE))
    has_numbered = bool(re.search(r"^\s*\d+\.\s", text, re.MULTILINE))

    score = 5  # baseline

    if words < 40:  score -= 2
    if words < 20:  score -= 2
    if words > 150: score += 1
    if words > 300: score += 1

    needs_math = analysis.get("needs_math", False)
    needs_code = analysis.get("needs_code", False)

    if needs_math and has_math:      score += 2
    if needs_math and not has_math:  score -= 2
    if needs_code and has_code:      score += 2
    if has_bullets or has_headers or has_numbered: score += 1

    if role == "coder"   and has_code and needs_code: score += 1
    if role == "reasoner" and (has_bullets or has_numbered): score += 1

    clamped = max(0, min(10, score))
    emphasis = (analysis.get("agent_focus") or {}).get(role, {}).get("emphasis", "medium")
    return {"score": clamped, "emphasis": emphasis}


# ─── build_quality_report ────────────────────────────────────────────────────

def build_quality_report(
    outputs_by_role: Dict[str, str],
    analysis: Dict[str, Any],
) -> Dict[str, Dict[str, Any]]:
    """Return a {role: {score, emphasis}} quality report for all non-empty outputs."""
    return {
        role: _score_output(text, role, analysis)
        for role, text in outputs_by_role.items()
        if text and text.strip()
    }


# ─── build_fallback_answer ───────────────────────────────────────────────────

def build_fallback_answer(
    outputs_by_role: Dict[str, str],
    analysis: Dict[str, Any],
) -> str:
    """
    Best-effort fallback when the writer fails.
    Returns the highest-scoring non-empty output (top 2 concatenated when available).
    """
    scored = sorted(
        [
            {"role": role, "text": text, "score": _score_output(text, role, analysis)["score"]}
            for role, text in outputs_by_role.items()
            if text and text.strip()
        ],
        key=lambda x: x["score"],
        reverse=True,
    )
    if not scored:
        return ""
    if len(scored) >= 2:
        return f"{scored[0]['text']}\n\n---\n\n{scored[1]['text']}"
    return scored[0]["text"]


# ─── build_token_usage ───────────────────────────────────────────────────────

def build_token_usage(
    agent_results: List[Dict[str, Any]],
    usage_by_role: Dict[str, Dict[str, int]],
) -> Dict[str, Dict[str, int]]:
    """
    Build a per-agent token usage map keyed by agent display name.
    Mirrors buildTokenUsage() in orchestrator.js.
    """
    token_usage: Dict[str, Dict[str, int]] = {}
    for agent in agent_results:
        role  = agent.get("role", "")
        name  = agent.get("name", role)
        usage = usage_by_role.get(role) or {"prompt_tokens": 0, "completion_tokens": 0}
        pt = usage.get("prompt_tokens", 0)
        ct = usage.get("completion_tokens", 0)
        token_usage[name] = {
            "prompt_tokens":     pt,
            "completion_tokens": ct,
            "total_tokens":      pt + ct,
        }
    return token_usage
