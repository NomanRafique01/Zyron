"""
memory/suggestions.py
Follow-up suggestion generator for the Zyron writer/synthesizer node.

After the writer produces its main response this module fires a lightweight
LLM call (same provider/model as the writer) that returns 2-3 short follow-up
question strings.

The suggestions are returned as a Python list[str] and stored in ZyronState
under the key ``suggestions``.  On any error an empty list is returned so the
pipeline is never blocked.

Public API
----------
  generate_suggestions(writer_output, query, agent_configs)
      Returns List[str] — 2 or 3 short follow-up strings, or [] on failure.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List

from providers import call_agent, ProviderApiError

log = logging.getLogger(__name__)

# Hard cap on context fed to the suggestion model
_MAX_RESPONSE_CHARS = 800
# Number of suggestions to request
_N = 3


def _build_suggestion_prompt(query: str, writer_output: str) -> List[Dict[str, str]]:
    """
    Build the minimal single-turn messages list for suggestion generation.
    Requests a JSON array of short follow-up strings — nothing else.
    """
    excerpt = writer_output.strip()[:_MAX_RESPONSE_CHARS]
    prompt = (
        f"The user asked: \"{query.strip()}\"\n\n"
        f"The AI responded (excerpt): \"{excerpt}\"\n\n"
        f"Generate exactly {_N} short follow-up questions or prompts the user might want to ask next. "
        "Rules:\n"
        "- Each suggestion must be under 8 words.\n"
        "- Be specific to the topic — avoid generic phrases like 'Tell me more'.\n"
        "- Output ONLY a valid JSON array of strings, nothing else.\n"
        "  Example: [\"What are the trade-offs?\", \"Show me an example\", \"How does X compare to Y?\"]"
    )
    return [{"role": "user", "content": prompt}]


def _parse_suggestions(raw: str) -> List[str]:
    """
    Extract a JSON array of strings from the LLM output.
    Falls back to a line-split heuristic if JSON parsing fails.
    """
    # Try direct JSON parse
    raw = raw.strip()
    try:
        result = json.loads(raw)
        if isinstance(result, list):
            return [s.strip() for s in result if isinstance(s, str) and s.strip()][:_N]
    except json.JSONDecodeError:
        pass

    # Try to find a JSON array in the text
    match = re.search(r'\[.*?\]', raw, re.DOTALL)
    if match:
        try:
            result = json.loads(match.group())
            if isinstance(result, list):
                return [s.strip() for s in result if isinstance(s, str) and s.strip()][:_N]
        except json.JSONDecodeError:
            pass

    # Line-split fallback: grab non-empty lines that look like questions/prompts
    lines = [
        re.sub(r'^[\s\-\*\d\.\)"\']+', '', line).strip()
        for line in raw.splitlines()
        if line.strip()
    ]
    suggestions = [l for l in lines if l and len(l) < 80][:_N]
    return suggestions


async def generate_suggestions(
    query: str,
    writer_output: str,
    agent_configs: Dict[str, Any],
) -> List[str]:
    """
    Generate 2-3 follow-up suggestion strings using the writer agent's provider.

    Returns an empty list on any error — the pipeline is never blocked.
    """
    if not writer_output or not writer_output.strip():
        return []

    cfg = agent_configs.get("writer") or next(iter(agent_configs.values()), None)
    if not cfg:
        return []

    if hasattr(cfg, "model_dump"):
        cfg = cfg.model_dump()

    try:
        messages = _build_suggestion_prompt(query, writer_output)
        result = await call_agent(
            provider   = cfg["provider"],
            model      = cfg.get("model", ""),
            key        = cfg["key"],
            messages   = messages,
            timeout_ms = 8_000,   # generous but bounded — suggestions are non-critical
        )
        raw = result.get("output", "")
        suggestions = _parse_suggestions(raw)
        log.debug("[Suggestions] Generated %d suggestions for query=%r", len(suggestions), query[:60])
        return suggestions
    except ProviderApiError as exc:
        log.debug("[Suggestions] Provider error (non-fatal): %s", exc)
        return []
    except Exception as exc:
        log.debug("[Suggestions] Unexpected error (non-fatal): %s", exc)
        return []
