from pydantic import BaseModel
from datetime import date


class VisitCreate(BaseModel):
    agent_name: str
    location: str
    visit_date: date
    program_area: str
    stakeholders: str
    notes: str


class VisitResponse(BaseModel):
    id: int
    agent_name: str
    location: str
    visit_date: date
    program_area: str
    stakeholders: str
    notes: str

    class Config:
        from_attributes = True


class AIInsightResponse(BaseModel):
    summary: str
    key_findings: str
    sentiment: str
    follow_up: str