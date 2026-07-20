"""
document_extractor.py
Extracts plain text from PDF, DOCX, and TXT files given a base64-encoded payload.
"""

from __future__ import annotations

import base64
import io
import logging

log = logging.getLogger("zyron.document_extractor")


def extract_text(filename: str, base64_data: str, mime_type: str) -> dict:
    """
    Decode *base64_data* and extract plain text according to *mime_type* / *filename*.

    Returns:
        {"text": str, "success": bool, "error": str | None}
    """
    try:
        raw_bytes = base64.b64decode(base64_data)
    except Exception as exc:
        log.warning("base64 decode failed: %s", exc)
        return {"text": "", "success": False, "error": f"base64 decode error: {exc}"}

    # ── TXT ──────────────────────────────────────────────────────────────────
    if mime_type == "text/plain" or filename.lower().endswith(".txt"):
        try:
            text = raw_bytes.decode("utf-8", errors="replace")
            return {"text": text.strip(), "success": True, "error": None}
        except Exception as exc:
            return {"text": "", "success": False, "error": str(exc)}

    # ── PDF ──────────────────────────────────────────────────────────────────
    if mime_type == "application/pdf" or filename.lower().endswith(".pdf"):
        try:
            from pdfminer.high_level import extract_text as pdfminer_extract
            text = pdfminer_extract(io.BytesIO(raw_bytes))
            return {"text": (text or "").strip(), "success": True, "error": None}
        except Exception as exc:
            log.warning("pdfminer extraction failed: %s", exc)
            return {"text": "", "success": False, "error": str(exc)}

    # ── DOCX ─────────────────────────────────────────────────────────────────
    docx_types = {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    }
    if mime_type in docx_types or filename.lower().endswith((".docx", ".doc")):
        try:
            import docx
            doc = docx.Document(io.BytesIO(raw_bytes))
            text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            return {"text": text.strip(), "success": True, "error": None}
        except Exception as exc:
            log.warning("python-docx extraction failed: %s", exc)
            return {"text": "", "success": False, "error": str(exc)}

    return {"text": "", "success": False, "error": f"Unsupported file type: {mime_type}"}
