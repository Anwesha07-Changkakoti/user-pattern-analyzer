from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from pathlib import Path

from app.database import get_db
from app.models import AnalysisResult
from app.utils.firebase_auth import get_current_user 

router = APIRouter(tags=["History"])


DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

@router.get("/results/history")
def get_past_results(
    start_date: Optional[str] = Query(None, description="DD-MM-YYYY"),
    end_date:   Optional[str] = Query(None, description="DD-MM-YYYY"),
    filename:   Optional[str] = Query(None, description="Partial or full file name"),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    query = db.query(AnalysisResult).filter(AnalysisResult.user_id == user["uid"])

    #  filename filter
    if filename:
        query = query.filter(AnalysisResult.file_name.ilike(f"%{filename}%"))

    #  date filters
    fmt = "%d-%m-%Y"
    try:
        if start_date:
            query = query.filter(
                AnalysisResult.timestamp >= datetime.strptime(start_date, fmt)
            )
        if end_date:
            
            end_dt = datetime.strptime(end_date, fmt) + timedelta(days=1)
            query = query.filter(AnalysisResult.timestamp < end_dt)
    except ValueError:
        raise HTTPException(status_code=400, detail="Dates must be DD-MM-YYYY")

    rows = query.order_by(AnalysisResult.timestamp.desc()).all()

    return [
        {
            "file_name":      r.file_name,
            "timestamp":      r.timestamp.strftime("%d/%m/%Y, %H:%M:%S"),
            "total_records":  r.total_records,
            "anomaly_count":  r.anomaly_count,
        }
        for r in rows
    ]


@router.get("/results/download/{file_name}")
def download_by_filename(
    file_name: str,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    
   
    row = (
        db.query(AnalysisResult)
        .filter(
            AnalysisResult.user_id == user["uid"],
            AnalysisResult.file_name == file_name,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Result not found for user")

    
    csv_path = DATA_DIR / file_name
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="CSV not found on server")

    return FileResponse(
        csv_path,
        filename=file_name,
        media_type="text/csv",
    )
