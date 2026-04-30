from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    company_name: str
    company_size: Optional[str] = None
    employee_size: Optional[str] = None
    marketing_budget: Optional[str] = None
    industry: Optional[str] = None
    company_needs: Optional[str] = None


class LeadPublic(BaseModel):
    id: UUID
    name: str
    email: str
    company_name: str
    company_size: Optional[str] = None
    employee_size: Optional[str] = None
    marketing_budget: Optional[str] = None
    industry: Optional[str] = None
    company_needs: Optional[str] = None
    grade: Optional[str] = None
    reasoning: Optional[str] = None
    marketing_relevance_score: Optional[int] = None
    signals: Optional[List[str]] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    scored_at: Optional[datetime] = None
