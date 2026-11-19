"""
Data Engineering and Pipeline Module for VYŪHA ML Intelligence.
Demonstrates:
  - Pandas & NumPy for data preprocessing, cleaning, and statistical feature engineering.
  - Decorators for performance profiling.
  - Generator functions for memory-efficient batch processing.
  - Type Hints and PEP 8 compliance.
"""

import time
import functools
from typing import Dict, Any, List, Generator
import numpy as np
import pandas as pd

def timing_profiler(func):
    """Decorator to measure and log the execution time of pipeline functions."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        duration_ms = (time.perf_counter() - start_time) * 1000.0
        # Attach execution telemetry if result is dict
        if isinstance(result, dict):
            result["_pipeline_latency_ms"] = round(duration_ms, 3)
        return result
    return wrapper

def task_batch_generator(tasks: List[Dict[str, Any]], batch_size: int = 5) -> Generator[List[Dict[str, Any]], None, None]:
    """Generator to yield tasks in memory-efficient batches."""
    for i in range(0, len(tasks), batch_size):
        yield tasks[i:i + batch_size]

class ProjectDataPipeline:
    """Enterprise Data Pipeline for statistical feature extraction and preprocessing."""

    @staticmethod
    def clean_task_records(raw_records: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Cleans raw task inputs, handles missing values, and coerces numeric types
        using Pandas DataFrame operations.
        """
        if not raw_records:
            return pd.DataFrame(columns=["id", "estimated_hours", "actual_hours", "status", "priority"])

        df = pd.DataFrame(raw_records)
        
        # Data Cleaning: Fill missing numeric metrics with median / zeros
        if "estimated_hours" in df.columns:
            df["estimated_hours"] = pd.to_numeric(df["estimated_hours"], errors="coerce").fillna(0.0)
        else:
            df["estimated_hours"] = 0.0

        if "actual_hours" in df.columns:
            df["actual_hours"] = pd.to_numeric(df["actual_hours"], errors="coerce").fillna(0.0)
        else:
            df["actual_hours"] = 0.0

        if "status" in df.columns:
            df["status"] = df["status"].fillna("PENDING").astype(str)
        else:
            df["status"] = "PENDING"

        return df

    @staticmethod
    @timing_profiler
    def compute_team_metrics(member_workloads: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates descriptive statistics, variance, and standard deviation
        across team capacity using NumPy and Pandas.
        """
        if not member_workloads:
            return {
                "total_members": 0,
                "mean_hours": 0.0,
                "std_hours": 0.0,
                "percentile_90_hours": 0.0,
                "workload_imbalance_detected": False
            }

        df = pd.DataFrame(member_workloads)
        hours = df["estimatedHours"].to_numpy(dtype=float)

        mean_val = float(np.mean(hours))
        std_val = float(np.std(hours)) if len(hours) > 1 else 0.0
        p90 = float(np.percentile(hours, 90))

        # Imbalance flagged if coefficient of variation > 0.5
        cv = (std_val / mean_val) if mean_val > 0 else 0.0

        return {
            "total_members": len(member_workloads),
            "mean_hours": round(mean_val, 2),
            "std_hours": round(std_val, 2),
            "percentile_90_hours": round(p90, 2),
            "workload_imbalance_detected": bool(cv > 0.45)
        }
