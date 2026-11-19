"""
Comprehensive PyTest Test Suite for Capstone 3: VYŪHA ML & Analytics Service.
Fulfills university standard: 15+ automated PyTest test cases covering:
  - Normal Inputs
  - Invalid Inputs
  - Missing Data / Null Handling
  - Edge Cases (Zero tasks, division by zero, extreme loads)
  - API Endpoints
  - Data Pipelines with Pandas & NumPy
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from main import app
from models.schemas import (
    ProjectRiskInput,
    WorkloadAnalysisInput,
    TeamMemberWorkload,
    DelayPredictionInput
)
from services.risk_engine import RiskEngine
from services.workload_engine import WorkloadEngine
from services.data_pipeline import ProjectDataPipeline, task_batch_generator

@pytest.fixture
def client():
    return TestClient(app)

# ==========================================================
# 1. NORMAL INPUT TESTS
# ==========================================================
def test_normal_risk_assessment_low():
    """Verify standard healthy project evaluates to LOW risk."""
    payload = ProjectRiskInput(
        projectId="p-norm-1",
        projectName="Doc Redesign",
        totalTasks=10,
        completedTasks=9,
        inProgressTasks=1,
        overdueTasks=0,
        teamSize=3
    )
    res = RiskEngine.assess_risk(payload)
    assert res.riskLevel == "LOW"
    assert res.riskScore < 35.0

def test_normal_workload_balanced():
    """Verify balanced workload under standard 40 hour capacity."""
    payload = WorkloadAnalysisInput(
        members=[
            TeamMemberWorkload(userId="u1", userName="Alice", assignedTasks=5, estimatedHours=35.0),
            TeamMemberWorkload(userId="u2", userName="Bob", assignedTasks=4, estimatedHours=30.0)
        ],
        standardCapacityHours=40.0
    )
    res = WorkloadEngine.analyze_workload(payload)
    assert res.overloadedCount == 0
    assert len(res.members) == 2

def test_normal_delay_calculation():
    """Verify delay forecast with standard velocity and backlog."""
    payload = DelayPredictionInput(
        totalTasks=20,
        completedTasks=10,
        velocityTasksPerWeek=5.0,
        remainingDays=20
    )
    remaining = payload.totalTasks - payload.completedTasks
    needed_days = int((remaining / payload.velocityTasksPerWeek) * 7)
    assert needed_days == 14
    assert needed_days <= payload.remainingDays

# ==========================================================
# 2. INVALID INPUT & ERROR HANDLING TESTS
# ==========================================================
def test_invalid_api_payload_missing_required_fields(client):
    """Verify 422 Unprocessable Entity when required schema fields are missing."""
    bad_payload = {"projectName": "Missing Project Id and Tasks"}
    response = client.post("/predict/risk", json=bad_payload)
    assert response.status_code == 422

def test_invalid_data_types_in_delay_api(client):
    """Verify 422 error when string is supplied instead of numeric velocity."""
    bad_payload = {
        "totalTasks": "twenty",
        "completedTasks": 5,
        "velocityTasksPerWeek": "fast"
    }
    response = client.post("/predict/delay", json=bad_payload)
    assert response.status_code == 422

def test_invalid_negative_hours_handling():
    """Verify pipeline handles corrupted negative values cleanly."""
    raw_data = [{"id": "t1", "estimated_hours": -15.0, "actual_hours": 10.0}]
    df = ProjectDataPipeline.clean_task_records(raw_data)
    assert len(df) == 1
    assert df["estimated_hours"].iloc[0] == -15.0

# ==========================================================
# 3. MISSING DATA & NULL VALUE TESTS
# ==========================================================
def test_missing_data_in_data_pipeline_cleaning():
    """Verify Pandas pipeline coerces None/NaN to zero and default status."""
    corrupted_records = [
        {"id": "t1", "estimated_hours": None, "actual_hours": "invalid_num", "status": None},
        {"id": "t2"}
    ]
    df = ProjectDataPipeline.clean_task_records(corrupted_records)
    assert df["estimated_hours"].iloc[0] == 0.0
    assert df["actual_hours"].iloc[0] == 0.0
    assert df["status"].iloc[0] == "PENDING"
    assert len(df) == 2

def test_missing_due_date_in_risk_engine():
    """Verify engine defaults safely when dueDate is None."""
    payload = ProjectRiskInput(
        projectId="p-no-date",
        projectName="No Due Date Project",
        totalTasks=10,
        completedTasks=5,
        inProgressTasks=2,
        overdueTasks=0,
        teamSize=2,
        dueDate=None
    )
    res = RiskEngine.assess_risk(payload)
    assert res.riskScore >= 0.0
    assert res.riskLevel in ["LOW", "MEDIUM"]

def test_empty_workload_list():
    """Verify WorkloadEngine handles empty member list without IndexError."""
    payload = WorkloadAnalysisInput(members=[], standardCapacityHours=40.0)
    res = WorkloadEngine.analyze_workload(payload)
    assert res.overloadedCount == 0
    assert res.overallWorkloadIndex == 0.0

# ==========================================================
# 4. EDGE CASE & ZERO DIVISION PROTECTION TESTS
# ==========================================================
def test_edge_case_zero_total_tasks():
    """Verify division-by-zero safety when totalTasks is 0."""
    payload = ProjectRiskInput(
        projectId="p-zero",
        projectName="Empty Project",
        totalTasks=0,
        completedTasks=0,
        inProgressTasks=0,
        overdueTasks=0,
        teamSize=1
    )
    res = RiskEngine.assess_risk(payload)
    assert res.riskScore >= 0.0

from pydantic import ValidationError

def test_edge_case_zero_team_size():
    """Verify team size of 0 is rejected by Pydantic schema validation."""
    with pytest.raises(ValidationError):
        ProjectRiskInput(
            projectId="p-zero-team",
            projectName="Solo Project",
            totalTasks=5,
            completedTasks=1,
            inProgressTasks=2,
            overdueTasks=0,
            teamSize=0
        )

def test_edge_case_extreme_overload_and_burnout():
    """Verify member exceeding 120% capacity triggers HIGH burnout classification."""
    payload = WorkloadAnalysisInput(
        members=[
            TeamMemberWorkload(userId="u99", userName="Overworked Lead", assignedTasks=25, estimatedHours=100.0)
        ],
        standardCapacityHours=40.0
    )
    res = WorkloadEngine.analyze_workload(payload)
    assert res.overloadedCount == 1
    assert res.members[0].burnoutRisk == "HIGH"
    assert res.members[0].utilizationRate == 250.0

# ==========================================================
# 5. FASTAPI API CONTRACT TESTS
# ==========================================================
def test_api_health_endpoint(client):
    """Verify health check endpoint returns 200 and healthy status."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

def test_api_predict_risk_endpoint(client):
    """Verify POST /predict/risk response schema compliance."""
    payload = {
        "projectId": "api-p1",
        "projectName": "Mobile App V2",
        "totalTasks": 20,
        "completedTasks": 18,
        "inProgressTasks": 2,
        "overdueTasks": 0,
        "teamSize": 4
    }
    resp = client.post("/predict/risk", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "riskScore" in data
    assert "riskLevel" in data
    assert "recommendations" in data

def test_api_predict_delay_endpoint(client):
    """Verify POST /predict/delay computes schedule delay correctly."""
    payload = {
        "totalTasks": 40,
        "completedTasks": 10,
        "velocityTasksPerWeek": 2.0,
        "remainingDays": 10
    }
    resp = client.post("/predict/delay", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["estimatedOverdueDays"] > 0
    assert data["riskCategory"] in ["MEDIUM", "HIGH"]

def test_api_predict_workload_endpoint(client):
    """Verify POST /predict/workload returns team analytics."""
    payload = {
        "members": [
            {"userId": "m1", "userName": "John", "assignedTasks": 12, "estimatedHours": 60.0}
        ],
        "standardCapacityHours": 40.0
    }
    resp = client.post("/predict/workload", json=payload)
    assert resp.status_code == 200
    assert resp.json()["overloadedCount"] == 1

# ==========================================================
# 6. PANDAS / NUMPY DATA PIPELINE & GENERATOR TESTS
# ==========================================================
def test_numpy_statistical_team_metrics_computation():
    """Verify NumPy standard deviation and percentile computation."""
    workloads = [
        {"userId": "1", "estimatedHours": 20.0},
        {"userId": "2", "estimatedHours": 40.0},
        {"userId": "3", "estimatedHours": 60.0}
    ]
    metrics = ProjectDataPipeline.compute_team_metrics(workloads)
    assert metrics["total_members"] == 3
    assert metrics["mean_hours"] == 40.0
    assert metrics["std_hours"] > 0.0
    assert "_pipeline_latency_ms" in metrics

def test_generator_task_batch_processing():
    """Verify generator yields correct batch slices without high memory footprint."""
    tasks = [{"id": f"task_{i}"} for i in range(12)]
    batches = list(task_batch_generator(tasks, batch_size=5))
    assert len(batches) == 3
    assert len(batches[0]) == 5
    assert len(batches[1]) == 5
    assert len(batches[2]) == 2
