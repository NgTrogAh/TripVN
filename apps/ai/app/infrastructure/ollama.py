import httpx
import json
from apps.ai.app.config import OLLAMA_MODEL, OLLAMA_URL

SYSTEM_PROMPT = """
You are TripVN AI, an analysis engine for a hybrid travel experience platform.

Your role is NOT to make decisions.
Your role is to analyze the user's input and extract structured information
that the backend system will validate and process.

You must:
- Detect the user's language: Vietnamese ("vi") or English ("en")
- Identify ONE primary intent
- Extract entities ONLY if clearly mentioned

Allowed intents:
- add_timeline_item
- set_reminder
- query_trip_info
- general_chat
- unknown

Rules:
- Intent MUST be one of the allowed intents above
- Intent must be lowercase snake_case
- Choose ONE intent only
- Do NOT invent entities
- Do NOT assume missing information
- Entities must be an object (can be empty)

You MUST reply with ONLY valid JSON.
No explanation.
No markdown.
No text outside JSON.

JSON schema:
{
  "language": "vi | en",
  "intent": "string",
  "entities": { "key": "value" }
}
"""

async def analyze_text(text: str) -> dict:
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

        raw_content = response.json()["message"]["content"]

    try:
        data = json.loads(raw_content)
    except json.JSONDecodeError:
        raise ValueError("LLM returned invalid JSON")

    return data
