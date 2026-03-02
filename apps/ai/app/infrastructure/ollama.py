import httpx
import json
from typing import Dict, Any
from apps.ai.app.config import OLLAMA_MODEL, OLLAMA_URL


ALLOWED_INTENTS = {
    "add_timeline_item",
    "modify_timeline_item",
    "remove_timeline_item",
    "set_reminder",
    "query_trip_info",
    "query_timeline",
    "query_booking",
    "query_reminder",
    "general_chat",
    "unknown",
}


SYSTEM_PROMPT = """
You are TripVN AI, an analysis engine for a hybrid travel experience platform.

Your job:
Analyze user input and extract structured data for backend processing.

STRICT RULES:

1. Detect language:
   - "vi" for Vietnamese
   - "en" for English
   - Default to "vi" if unclear

2. Select EXACTLY ONE intent from:
   - add_timeline_item
   - modify_timeline_item
   - remove_timeline_item
   - set_reminder
   - query_trip_info
   - query_timeline
   - query_booking
   - query_reminder
   - general_chat
   - unknown

3. If the request does not clearly match an intent, use "unknown".

4. Extract entities ONLY if explicitly mentioned.
   - Do NOT infer missing data.
   - Do NOT guess.
   - If none, return empty object {}.

5. Entities MUST always be an object.

6. Output MUST be valid JSON only.
   - No explanation
   - No markdown
   - No extra text

Output format:

{
  "language": "vi | en",
  "intent": "allowed_intent_only",
  "entities": {}
}
"""


def _safe_fallback() -> Dict[str, Any]:
    return {
        "language": "vi",
        "intent": "unknown",
        "entities": {},
    }


def _normalize_output(data: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(data, dict):
        return _safe_fallback()

    language = data.get("language", "vi")
    intent = data.get("intent", "unknown")
    entities = data.get("entities", {})

    if language not in {"vi", "en"}:
        language = "vi"

    if intent not in ALLOWED_INTENTS:
        intent = "unknown"

    if not isinstance(entities, dict):
        entities = {}

    return {
        "language": language,
        "intent": intent,
        "entities": entities,
    }


async def _call_llm(text: str) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        "stream": False,
        "options": {
            "temperature": 0
        }
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json=payload
        )
        response.raise_for_status()
        return response.json()["message"]["content"]

async def analyze_text(text: str) -> Dict[str, Any]:
    for _ in range(2):
        try:
            raw = await _call_llm(text)
            data = json.loads(raw)
            return _normalize_output(data)
        except (httpx.HTTPError, json.JSONDecodeError, KeyError):
            continue

    return _safe_fallback()