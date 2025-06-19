import pandas as pd
import numpy as np
import hashlib
import logging
from sklearn.ensemble import IsolationForest
from datetime import datetime
from typing import List, Tuple, Union

from app.database import SessionLocal
from app.models import AnalysisResult

# Logging
logging.basicConfig(
    filename="logs/anomaly_detection.log",
    level=logging.INFO,
    format="%(asctime)s — %(levelname)s — %(message)s",
)


cache: dict[str, List[int]] = {}

# Utility helpers

def hash_dataframe(df: pd.DataFrame) -> str:
    
    return hashlib.sha256(pd.util.hash_pandas_object(df, index=True).values).hexdigest()


def validate_schema(df: pd.DataFrame) -> pd.DataFrame:
    
    if df.empty:
        raise ValueError("Input DataFrame is empty.")

    df = df.select_dtypes(include="number").fillna(0)

    if df.empty:
        raise ValueError("No numeric columns available after filtering.")

    if not np.isfinite(df.values).all():
        raise ValueError("Data contains infinite or non‑numeric values.")

    return df





def _compute_reasons(df: pd.DataFrame, preds: List[int], top_n: int = 3) -> List[str]:
    
    med = df.median()
    mad = (df - med).abs().median() + 1e-9  
    reasons: List[str] = []
    for i, row in df.iterrows():
        if preds[i] == 0:
            reasons.append("")
            continue

        z_scores = ((row - med).abs() / mad).sort_values(ascending=False)
        top_features = z_scores.head(top_n).index.tolist()
        reason = f"High deviation in {', '.join(top_features)}"
        reasons.append(reason)

    return reasons


def _log_anomalies(df: pd.DataFrame, preds: List[int], reasons: List[str]) -> None:
    
    for idx, (row, pred, why) in enumerate(zip(df.iterrows(), preds, reasons)):
        if pred == 1:
            logging.info(
                "Anomaly at index %s | Reason: %s | Row snapshot: %s",
                idx,
                why,
                row[1].to_dict(),
            )



# Public API

def detect_anomalies(
    df_raw: pd.DataFrame,
    *,
    user_uid: str,
    file_name: str,
    contamination: float = 0.05,
    return_reasons: bool = False,
) -> Union[List[int], Tuple[List[int], List[str]]]:
    
    # 1 Validate & preprocess
    df_proc = validate_schema(df_raw)

    # 2️ Cache lookup
    df_hash = hash_dataframe(df_proc)
    if df_hash in cache:
        preds = cache[df_hash]
    else:
        model = IsolationForest(contamination=contamination, random_state=42)
        model.fit(df_proc)
        pred_raw = model.predict(df_proc)  # -1 for anomaly, 1 for normal
        preds = [1 if p == -1 else 0 for p in pred_raw]
        cache[df_hash] = preds

    
    reasons = _compute_reasons(df_proc, preds)

    
    _store_summary(
        user_uid=user_uid,
        file_name=file_name,
        total_records=len(preds),
        anomaly_count=sum(preds),
    )

   
    _log_anomalies(df_proc, preds, reasons)

    return (preds, reasons) if return_reasons else preds



# Internal helpers


def _store_summary(*, user_uid: str, file_name: str, total_records: int, anomaly_count: int) -> None:
    
    db = SessionLocal()
    try:
        db.add(
            AnalysisResult(
                user_id=user_uid,
                file_name=file_name,
                total_records=total_records,
                anomaly_count=anomaly_count,
                timestamp=datetime.utcnow(),
            )
        )
        db.commit()
    finally:
        db.close()
