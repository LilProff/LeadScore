import json
import logging
from datetime import datetime
from openai import OpenAI
from app.config import settings
from app.services.supabase_client import supabase

logger = logging.getLogger(__name__)

def score_lead_v2(lead_id: str, lead_data: dict):
    """
    Background task to score a lead using AI and update Supabase.
    """
    try:
        client = OpenAI(
            base_url=settings.openrouter_base_url,
            api_key=settings.ai_api_key,
            default_headers={
                "HTTP-Referer": "https://github.com/LilProff/LeadScore",
                "X-Title": "LeadScore Dashboard",
            }
        )

        system_prompt = """
You are a B2B lead qualification analyst. You score inbound leads on an A–F
scale based on their marketing fit and budget. The product being sold is a
marketing service, so leads are valuable in proportion to (a) the strength
of their marketing need and (b) their ability to pay.

Grade rubric:
- A: Explicit marketing need + strong budget + good industry fit.
- B: Clear marketing intent OR strong budget; one strong signal.
- C: Moderate fit; ambiguous needs or modest budget.
- D: Weak signals; low budget; unclear fit.
- F: No marketing relevance. Disqualified.

The `company_needs` field is the most important signal. If it explicitly
mentions marketing, ads, SEO, growth, acquisition, branding, content, or
similar — weight that heavily upward. If it mentions something unrelated
(e.g. "we need an accounting tool"), grade D or F regardless of budget.

`marketing_budget` is the second most important signal. Higher is better,
but only matters if there is a real marketing need.

Return ONLY a JSON object with this exact shape, no prose, no markdown:

{
  "grade": "A" | "B" | "C" | "D" | "F",
  "reasoning": "2-4 sentences explaining the grade in plain English.",
  "marketing_relevance_score": 0-100,
  "signals": ["short_snake_case_tags", ...]
}
"""

        response = client.chat.completions.create(
            model=settings.ai_model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(lead_data)}
            ],
            temperature=0.2,
            max_tokens=400
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("OpenRouter returned empty content")

        # Strip markdown if present
        if content.startswith("```"):
            content = content.strip("`").strip("json").strip()

        result = json.loads(content)

        # Update Supabase
        supabase.from_("leads").update({
            "grade": result.get("grade"),
            "reasoning": result.get("reasoning"),
            "marketing_relevance_score": result.get("marketing_relevance_score"),
            "signals": result.get("signals"),
            "status": "scored",
            "scored_at": datetime.now().isoformat()
        }).eq("id", lead_id).execute()

        logger.info(f"Successfully scored lead {lead_id}")

    except Exception as e:
        logger.error(f"Error scoring lead {lead_id}: {str(e)}")
        supabase.from_("leads").update({
            "status": "error",
            "error_message": str(e)
        }).eq("id", lead_id).execute()
