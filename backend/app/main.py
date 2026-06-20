from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from ai_service import generate_ai_insight
import models
from schemas import VisitResponse
from typing import List
import os
import shutil
from datetime import date

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {"message": "FieldSense AI Backend Running Successfully"}


@app.post("/visits")
def create_visit(
    agent_name: str = Form(...),
    location: str = Form(...),
    visit_date: date = Form(...),
    program_area: str = Form(...),
    stakeholders: str = Form(...),
    notes: str = Form(...),
    photo: UploadFile = File(None)
):
    db = SessionLocal()

    if photo:
        photo_path = os.path.join(UPLOAD_FOLDER, photo.filename)
        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

    new_visit = models.Visit(
        agent_name=agent_name,
        location=location,
        visit_date=visit_date,
        program_area=program_area,
        stakeholders=stakeholders,
        notes=notes
    )

    db.add(new_visit)
    db.commit()
    db.refresh(new_visit)
    db.close()

    return {
        "message": "Visit saved successfully",
        "visit_id": new_visit.id,
        "photo_uploaded": photo.filename if photo else None
    }


@app.get("/visits", response_model=List[VisitResponse])
def get_visits():
    db = SessionLocal()
    visits = db.query(models.Visit).all()
    db.close()
    return visits


@app.get("/visits/{visit_id}", response_model=VisitResponse)
def get_visit_by_id(visit_id: int):
    db = SessionLocal()
    visit = db.query(models.Visit).filter(models.Visit.id == visit_id).first()
    db.close()
    return visit


@app.put("/visits/{visit_id}")
def update_visit(visit_id: int):
    db = SessionLocal()
    visit = db.query(models.Visit).filter(models.Visit.id == visit_id).first()

    if visit:
        db.commit()
        db.close()
        return {"message": "Visit updated successfully"}

    db.close()
    return {"message": "Visit not found"}


@app.delete("/visits/{visit_id}")
def delete_visit(visit_id: int):
    db = SessionLocal()
    visit = db.query(models.Visit).filter(models.Visit.id == visit_id).first()

    if visit:
        db.delete(visit)
        db.commit()
        db.close()
        return {"message": "Visit deleted successfully"}

    db.close()
    return {"message": "Visit not found"}


@app.post("/analyze/{visit_id}")
def analyze_visit(visit_id: int):
    db = SessionLocal()

    visit = db.query(models.Visit).filter(
        models.Visit.id == visit_id
    ).first()

    if not visit:
        db.close()
        return {"error": "Visit not found"}

    ai_data = generate_ai_insight(visit.notes)

    ai_result = models.AIInsight(
        visit_id=visit_id,
        summary=ai_data["summary"],
        key_findings=ai_data["key_findings"],
        sentiment=ai_data["sentiment"],
        follow_up=ai_data["follow_up"]
    )

    db.add(ai_result)
    db.commit()
    db.close()

    return ai_data


@app.get("/insights")
def get_insights():
    db = SessionLocal()
    insights = db.query(models.AIInsight).all()
    db.close()
    return insights


@app.get("/analytics")
def get_analytics():
    db = SessionLocal()

    total_visits = db.query(models.Visit).count()
    total_insights = db.query(models.AIInsight).count()

    negative_cases = db.query(models.AIInsight).filter(
        models.AIInsight.sentiment == "Negative"
    ).count()

    critical_issues = negative_cases

    follow_up_pending = db.query(models.AIInsight).filter(
        models.AIInsight.follow_up.isnot(None)
    ).count()

    region_data = {}
    program_data = {}

    visits = db.query(models.Visit).all()

    for visit in visits:
        location = visit.location
        program = visit.program_area

        region_data[location] = region_data.get(location, 0) + 1
        program_data[program] = program_data.get(program, 0) + 1

    db.close()

    return {
        "total_visits": total_visits,
        "total_insights": total_insights,
        "negative_cases": negative_cases,
        "critical_issues": critical_issues,
        "follow_up_pending": follow_up_pending,
        "region_wise_visits": region_data,
        "program_wise_visits": program_data
    }