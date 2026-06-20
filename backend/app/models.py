from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from database import Base


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(100))
    location = Column(String(100))
    visit_date = Column(Date)
    program_area = Column(String(100))
    stakeholders = Column(Text)
    notes = Column(Text)


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, ForeignKey("visits.id"))
    summary = Column(Text)
    key_findings = Column(Text)
    sentiment = Column(String(50))
    follow_up = Column(Text)