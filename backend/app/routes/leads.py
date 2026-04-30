from typing import List
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.lead import LeadCreate, LeadPublic
from app.services.supabase_client import supabase
from app.services.scoring import score_lead

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("/score", status_code=202)
async def create_lead(lead: LeadCreate, background_tasks: BackgroundTasks):
    """
    Submit a lead for scoring. Returns 202 Accepted and the lead ID.
    """
    try:
        # Insert lead with pending status
        data = lead.model_dump()
        response = supabase.from_("leads").insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save lead")
            
        new_lead = response.data[0]
        lead_id = new_lead["id"]
        
        # Trigger AI scoring in the background
        background_tasks.add_task(score_lead, lead_id, data)
        
        return {"id": lead_id, "status": "pending"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[LeadPublic])
async def list_leads(limit: int = 50, offset: int = 0):
    """
    List all leads, newest first.
    """
    try:
        response = supabase.from_("leads") \
            .select("*") \
            .order("created_at", desc=True) \
            .range(offset, offset + limit - 1) \
            .execute()
            
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}", response_model=LeadPublic)
async def get_lead(id: str):
    """
    Fetch a lead by ID.
    """
    try:
        response = supabase.from_("leads").select("*").eq("id", id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Lead not found")
            
        return response.data[0]
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
