import unittest
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

class TestMLEngine(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    # ------------------ RISK ENGINE TESTS ------------------
    def test_risk_engine_low_risk(self):
        input_data = ProjectRiskInput(
            projectId="p1",
            projectName="Website Launch",
            totalTasks=10,
            completedTasks=9,
            inProgressTasks=1,
            overdueTasks=0,
            teamSize=3
        )
        result = RiskEngine.assess_risk(input_data)
        self.assertEqual(result.projectId, "p1")
        self.assertEqual(result.riskLevel, "LOW")
        self.assertLess(result.riskScore, 40.0)

    def test_risk_engine_medium_risk(self):
        input_data = ProjectRiskInput(
            projectId="p_med",
            projectName="Mobile App Beta",
            totalTasks=20,
            completedTasks=8,
            inProgressTasks=6,
            overdueTasks=5,
            teamSize=3
        )
        result = RiskEngine.assess_risk(input_data)
        self.assertEqual(result.projectId, "p_med")
        self.assertEqual(result.riskLevel, "MEDIUM")
        self.assertGreaterEqual(result.riskScore, 35.0)
        self.assertLess(result.riskScore, 65.0)

    def test_risk_engine_high_risk(self):
        input_data = ProjectRiskInput(
            projectId="p2",
            projectName="Delayed Platform",
            totalTasks=20,
            completedTasks=2,
            inProgressTasks=3,
            overdueTasks=10,
            teamSize=2
        )
        result = RiskEngine.assess_risk(input_data)
        self.assertEqual(result.riskLevel, "HIGH")
        self.assertGreaterEqual(result.riskScore, 65.0)
        self.assertTrue(any("overdue" in r.lower() for r in result.recommendations))

    # ------------------ WORKLOAD ENGINE TESTS ------------------
    def test_workload_engine_overload_and_burnout(self):
        input_data = WorkloadAnalysisInput(
            members=[
                TeamMemberWorkload(userId="u1", userName="Alice", assignedTasks=12, estimatedHours=60.0),
                TeamMemberWorkload(userId="u2", userName="Bob", assignedTasks=3, estimatedHours=15.0)
            ],
            standardCapacityHours=40.0
        )
        result = WorkloadEngine.analyze_workload(input_data)
        self.assertEqual(result.overloadedCount, 1)
        self.assertEqual(result.members[0].isOverloaded, True)
        self.assertEqual(result.members[0].burnoutRisk, "HIGH")
        self.assertEqual(result.members[1].isOverloaded, False)
        self.assertEqual(result.members[1].burnoutRisk, "LOW")

    def test_workload_engine_balanced(self):
        input_data = WorkloadAnalysisInput(
            members=[
                TeamMemberWorkload(userId="u1", userName="Alice", assignedTasks=5, estimatedHours=35.0),
                TeamMemberWorkload(userId="u2", userName="Bob", assignedTasks=4, estimatedHours=32.0)
            ],
            standardCapacityHours=40.0
        )
        result = WorkloadEngine.analyze_workload(input_data)
        self.assertEqual(result.overloadedCount, 0)
        self.assertFalse(result.members[0].isOverloaded)
        self.assertFalse(result.members[1].isOverloaded)

    # ------------------ FASTAPI ENDPOINT TESTS ------------------
    def test_api_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertEqual(json_data.get("status"), "healthy")

    def test_api_predict_risk(self):
        payload = {
            "projectId": "proj-api-1",
            "projectName": "API Test Project",
            "totalTasks": 15,
            "completedTasks": 12,
            "inProgressTasks": 3,
            "overdueTasks": 0,
            "teamSize": 4
        }
        response = self.client.post("/predict/risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["projectId"], "proj-api-1")
        self.assertIn("riskLevel", data)
        self.assertIn("riskScore", data)
        self.assertIn("recommendations", data)

    def test_api_predict_delay(self):
        payload = {
            "totalTasks": 30,
            "completedTasks": 10,
            "velocityTasksPerWeek": 2.0,
            "remainingDays": 14
        }
        response = self.client.post("/predict/delay", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("delayProbability", data)
        self.assertIn("estimatedOverdueDays", data)
        self.assertIn("riskCategory", data)
        self.assertGreater(data["estimatedOverdueDays"], 0)

    def test_api_predict_workload(self):
        payload = {
            "members": [
                {
                    "userId": "usr-1",
                    "userName": "Sumit",
                    "assignedTasks": 15,
                    "estimatedHours": 75.0
                }
            ],
            "standardCapacityHours": 40.0
        }
        response = self.client.post("/predict/workload", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["overloadedCount"], 1)
        self.assertEqual(data["members"][0]["isOverloaded"], True)

if __name__ == "__main__":
    unittest.main()
