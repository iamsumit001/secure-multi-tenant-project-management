require("dotenv").config();
const prisma = require("../src/config/prisma");

const TENANT_ID = "ed447280-948b-4b49-af79-402f4aa20337";
const USER_ID = "0daffd07-25a3-4f84-be85-e4a18471a832";

const projectsData = [
  // --- 1. LOW RISK (On Track) ---
  {
    name: "Core API Microservices Migration",
    description: "Decomposing legacy monolith into lightweight Dockerized REST microservices.",
    priority: "HIGH",
    startDate: new Date(Date.now() - 30 * 86400000),
    endDate: new Date(Date.now() + 15 * 86400000),
    tasks: [
      { title: "Define proto schemas", status: "COMPLETED", priority: "HIGH", hours: 12, daysAgo: 20 },
      { title: "Implement Auth service", status: "COMPLETED", priority: "CRITICAL", hours: 24, daysAgo: 15 },
      { title: "Setup Kafka event bus", status: "COMPLETED", priority: "HIGH", hours: 16, daysAgo: 10 },
      { title: "Dockerize user service", status: "COMPLETED", priority: "MEDIUM", hours: 8, daysAgo: 8 },
      { title: "Database sharding policy", status: "COMPLETED", priority: "HIGH", hours: 14, daysAgo: 5 },
      { title: "API Gateway routing rules", status: "COMPLETED", priority: "MEDIUM", hours: 10, daysAgo: 3 },
      { title: "Load balancer health checks", status: "IN_PROGRESS", priority: "MEDIUM", hours: 6, daysAhead: 5 },
      { title: "End-to-end integration test", status: "TODO", priority: "HIGH", hours: 10, daysAhead: 10 }
    ],
    ml: {
      riskScore: 18.5,
      riskLevel: "LOW",
      delayProbability: 0.12,
      workloadIndex: 3.2,
      recommendations: "Project execution velocity is strong. Minimal risk of deadline slippage."
    }
  },
  {
    name: "Mobile App Dark Mode UI",
    description: "Complete dark theme implementation across all screens and user components.",
    priority: "MEDIUM",
    startDate: new Date(Date.now() - 20 * 86400000),
    endDate: new Date(Date.now() + 10 * 86400000),
    tasks: [
      { title: "Audit color tokens", status: "COMPLETED", priority: "MEDIUM", hours: 6, daysAgo: 18 },
      { title: "Update Tailwind palette", status: "COMPLETED", priority: "MEDIUM", hours: 8, daysAgo: 12 },
      { title: "Settings toggle persistence", status: "COMPLETED", priority: "LOW", hours: 4, daysAgo: 8 },
      { title: "Design review & polish", status: "COMPLETED", priority: "MEDIUM", hours: 6, daysAgo: 3 },
      { title: "Contrast accessibility checks", status: "IN_PROGRESS", priority: "HIGH", hours: 5, daysAhead: 4 },
      { title: "Release beta build to QA", status: "TODO", priority: "MEDIUM", hours: 4, daysAhead: 7 }
    ],
    ml: {
      riskScore: 22.0,
      riskLevel: "LOW",
      delayProbability: 0.15,
      workloadIndex: 2.5,
      recommendations: "Healthy progress. Accessibility test verification recommended."
    }
  },
  {
    name: "Database Indexing & Caching Layer",
    description: "Redis caching and multi-column B-tree index optimization for 10x read latency reduction.",
    priority: "HIGH",
    startDate: new Date(Date.now() - 15 * 86400000),
    endDate: new Date(Date.now() + 12 * 86400000),
    tasks: [
      { title: "Slow query log analysis", status: "COMPLETED", priority: "HIGH", hours: 10, daysAgo: 14 },
      { title: "Add composite indexes on tasks", status: "COMPLETED", priority: "CRITICAL", hours: 8, daysAgo: 9 },
      { title: "Setup Redis cluster", status: "COMPLETED", priority: "HIGH", hours: 14, daysAgo: 6 },
      { title: "Cache tenant permissions", status: "COMPLETED", priority: "MEDIUM", hours: 6, daysAgo: 2 },
      { title: "Benchmark read queries", status: "IN_PROGRESS", priority: "MEDIUM", hours: 6, daysAhead: 6 }
    ],
    ml: {
      riskScore: 16.0,
      riskLevel: "LOW",
      delayProbability: 0.10,
      workloadIndex: 2.8,
      recommendations: "Optimal velocity. Performance benchmarks tracking ahead of target."
    }
  },

  // --- 2. MEDIUM RISK (Moderate Pressure) ---
  {
    name: "Real-Time WebSocket Notification Gateway",
    description: "Pub/Sub WebSocket server for instant collaborative mentions, task changes, and alerts.",
    priority: "HIGH",
    startDate: new Date(Date.now() - 25 * 86400000),
    endDate: new Date(Date.now() + 8 * 86400000),
    tasks: [
      { title: "Socket connection handshake", status: "COMPLETED", priority: "HIGH", hours: 8, daysAgo: 20 },
      { title: "JWT token validation in ws header", status: "COMPLETED", priority: "CRITICAL", hours: 6, daysAgo: 14 },
      { title: "Room join logic for tenants", status: "COMPLETED", priority: "MEDIUM", hours: 8, daysAgo: 10 },
      { title: "Broadcast task state changes", status: "IN_PROGRESS", priority: "HIGH", hours: 12, daysAhead: 3 },
      { title: "Offline message queueing", status: "IN_PROGRESS", priority: "MEDIUM", hours: 10, daysAhead: 5 },
      { title: "Reconnect exponential backoff", status: "TODO", priority: "MEDIUM", hours: 8, daysOverdue: 2 },
      { title: "Stress test 5000 concurrent sockets", status: "TODO", priority: "HIGH", hours: 14, daysOverdue: 4 }
    ],
    ml: {
      riskScore: 48.5,
      riskLevel: "MEDIUM",
      delayProbability: 0.45,
      workloadIndex: 5.2,
      recommendations: "2 overdue tasks detected. Recommended: Reassign socket stress testing to QA engineer."
    }
  },
  {
    name: "OAuth2 & SSO Federation Hub",
    description: "Enterprise Single Sign-On integration supporting Okta, Google Workspace, and Microsoft Azure AD.",
    priority: "HIGH",
    startDate: new Date(Date.now() - 20 * 86400000),
    endDate: new Date(Date.now() + 6 * 86400000),
    tasks: [
      { title: "SAML 2.0 metadata parser", status: "COMPLETED", priority: "HIGH", hours: 12, daysAgo: 18 },
      { title: "Google OAuth callback handler", status: "COMPLETED", priority: "MEDIUM", hours: 6, daysAgo: 12 },
      { title: "Azure AD app registration", status: "IN_PROGRESS", priority: "HIGH", hours: 10, daysAhead: 2 },
      { title: "Token exchange security test", status: "TODO", priority: "CRITICAL", hours: 12, daysOverdue: 3 },
      { title: "User provisioning SCIM webhook", status: "TODO", priority: "MEDIUM", hours: 14, daysOverdue: 5 }
    ],
    ml: {
      riskScore: 54.0,
      riskLevel: "MEDIUM",
      delayProbability: 0.52,
      workloadIndex: 5.6,
      recommendations: "Security audit overdue. Fast-track SCIM integration to prevent deployment hold."
    }
  },
  {
    name: "Billing & Stripe Multi-Tier Subscriptions",
    description: "Usage-based metered billing, invoices generation, and webhook event reconciliation.",
    priority: "CRITICAL",
    startDate: new Date(Date.now() - 30 * 86400000),
    endDate: new Date(Date.now() + 5 * 86400000),
    tasks: [
      { title: "Stripe customer creation API", status: "COMPLETED", priority: "HIGH", hours: 8, daysAgo: 24 },
      { title: "Checkout session redirection", status: "COMPLETED", priority: "HIGH", hours: 10, daysAgo: 18 },
      { title: "Tier upgrade/downgrade logic", status: "IN_PROGRESS", priority: "CRITICAL", hours: 14, daysAhead: 2 },
      { title: "Invoice PDF generator service", status: "TODO", priority: "MEDIUM", hours: 10, daysOverdue: 3 },
      { title: "Handle charge.failed webhooks", status: "TODO", priority: "HIGH", hours: 8, daysOverdue: 4 }
    ],
    ml: {
      riskScore: 58.2,
      riskLevel: "MEDIUM",
      delayProbability: 0.58,
      workloadIndex: 6.1,
      recommendations: "Approaching deadline with 2 critical webhook tasks overdue. Recommend 1-week buffer."
    }
  },
  {
    name: "Automated CI/CD Deployment Pipeline",
    description: "GitHub Actions workflow with automated unit testing, Docker image building, and canary deployments.",
    priority: "MEDIUM",
    startDate: new Date(Date.now() - 18 * 86400000),
    endDate: new Date(Date.now() + 10 * 86400000),
    tasks: [
      { title: "Write lint and test action", status: "COMPLETED", priority: "MEDIUM", hours: 6, daysAgo: 15 },
      { title: "Docker multi-stage build caching", status: "COMPLETED", priority: "MEDIUM", hours: 8, daysAgo: 9 },
      { title: "Setup staging environment runner", status: "IN_PROGRESS", priority: "HIGH", hours: 10, daysAhead: 4 },
      { title: "Slack build notification webhook", status: "TODO", priority: "LOW", hours: 4, daysOverdue: 1 },
      { title: "Automated database rollback script", status: "TODO", priority: "CRITICAL", hours: 12, daysAhead: 6 }
    ],
    ml: {
      riskScore: 42.0,
      riskLevel: "MEDIUM",
      delayProbability: 0.38,
      workloadIndex: 4.5,
      recommendations: "Workload manageable. Priority should shift to automated rollback scripting."
    }
  },

  // --- 3. HIGH RISK (Critical Slippage & Overdue) ---
  {
    name: "AI Recommendation & Risk Engine V2",
    description: "Deep learning transformer model for auto-assigning developers based on commit history and workload.",
    priority: "CRITICAL",
    startDate: new Date(Date.now() - 40 * 86400000),
    endDate: new Date(Date.now() - 5 * 86400000), // Deadline already passed!
    tasks: [
      { title: "Scrape historical commit history", status: "COMPLETED", priority: "MEDIUM", hours: 14, daysAgo: 35 },
      { title: "Feature engineering in Pandas", status: "COMPLETED", priority: "HIGH", hours: 20, daysAgo: 25 },
      { title: "Train Scikit-learn random forest", status: "IN_PROGRESS", priority: "CRITICAL", hours: 28, daysOverdue: 12 },
      { title: "Hyperparameter tuning grid search", status: "TODO", priority: "HIGH", hours: 20, daysOverdue: 10 },
      { title: "FastAPI inference endpoint latency optimization", status: "TODO", priority: "HIGH", hours: 18, daysOverdue: 8 },
      { title: "A/B testing harness integration", status: "TODO", priority: "CRITICAL", hours: 22, daysOverdue: 6 },
      { title: "Model accuracy drift monitoring", status: "TODO", priority: "MEDIUM", hours: 15, daysOverdue: 4 }
    ],
    ml: {
      riskScore: 88.4,
      riskLevel: "HIGH",
      delayProbability: 0.94,
      workloadIndex: 8.4,
      recommendations: "CRITICAL: Project has exceeded target deadline by 5 days. 5 major deliverable tasks are overdue. Immediate milestone restructuring required."
    }
  },
  {
    name: "Legacy Monolith Refactoring & Decoupling",
    description: "Extracting 150k lines of legacy backend code into decoupled domain services.",
    priority: "CRITICAL",
    startDate: new Date(Date.now() - 50 * 86400000),
    endDate: new Date(Date.now() + 3 * 86400000),
    tasks: [
      { title: "Map dependency graph", status: "COMPLETED", priority: "HIGH", hours: 18, daysAgo: 45 },
      { title: "Extract User domain models", status: "COMPLETED", priority: "CRITICAL", hours: 24, daysAgo: 30 },
      { title: "Decouple billing queries", status: "IN_PROGRESS", priority: "CRITICAL", hours: 32, daysOverdue: 14 },
      { title: "Replace direct DB calls with API client", status: "TODO", priority: "HIGH", hours: 30, daysOverdue: 10 },
      { title: "Refactor legacy session storage", status: "TODO", priority: "HIGH", hours: 20, daysOverdue: 7 },
      { title: "Re-run full regression test suite", status: "TODO", priority: "CRITICAL", hours: 25, daysOverdue: 5 },
      { title: "Deprecate legacy routing table", status: "TODO", priority: "MEDIUM", hours: 16, daysOverdue: 2 }
    ],
    ml: {
      riskScore: 92.5,
      riskLevel: "HIGH",
      delayProbability: 0.98,
      workloadIndex: 9.1,
      recommendations: "SEVERE RISK: 5 overdue tasks. Task velocity is insufficient for upcoming delivery date. Recommend splitting deliverables into 2 distinct phases."
    }
  },
  {
    name: "SOC-2 Enterprise Compliance & Security Audit",
    description: "Penetration testing, encryption at rest verification, and access audit logging certification.",
    priority: "CRITICAL",
    startDate: new Date(Date.now() - 35 * 86400000),
    endDate: new Date(Date.now() + 4 * 86400000),
    tasks: [
      { title: "Enforce TLS 1.3 across all routes", status: "COMPLETED", priority: "CRITICAL", hours: 10, daysAgo: 30 },
      { title: "Enable AES-256 database encryption at rest", status: "COMPLETED", priority: "HIGH", hours: 14, daysAgo: 20 },
      { title: "Third-party penetration testing fixes", status: "IN_PROGRESS", priority: "CRITICAL", hours: 24, daysOverdue: 8 },
      { title: "Role-Based Access Control audit report", status: "TODO", priority: "HIGH", hours: 16, daysOverdue: 6 },
      { title: "Data retention & deletion automation", status: "TODO", priority: "MEDIUM", hours: 12, daysOverdue: 4 },
      { title: "Final compliance certification signoff", status: "TODO", priority: "CRITICAL", hours: 8, daysAhead: 3 }
    ],
    ml: {
      riskScore: 78.0,
      riskLevel: "HIGH",
      delayProbability: 0.85,
      workloadIndex: 7.2,
      recommendations: "High security compliance risk. 3 audit mitigation tasks overdue. Recommend dedicating senior backend lead exclusively to audit items."
    }
  }
];

async function seed() {
  console.log("Seeding 10 projects for tenant:", TENANT_ID, "(User:", USER_ID, ")");

  for (const p of projectsData) {
    const project = await prisma.project.create({
      data: {
        name: p.name,
        description: p.description,
        status: "active",
        priority: p.priority,
        startDate: p.startDate,
        endDate: p.endDate,
        tenantId: TENANT_ID
      }
    });

    // Add user as project member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: USER_ID,
        role: "ADMIN"
      }
    });

    // Create tasks
    for (const t of p.tasks) {
      let dueDate = new Date();
      if (t.daysAgo) {
        dueDate = new Date(Date.now() - t.daysAgo * 86400000);
      } else if (t.daysOverdue) {
        dueDate = new Date(Date.now() - t.daysOverdue * 86400000);
      } else if (t.daysAhead) {
        dueDate = new Date(Date.now() + t.daysAhead * 86400000);
      }

      await prisma.task.create({
        data: {
          title: t.title,
          description: `Deliverable task for ${p.name}`,
          status: t.status,
          priority: t.priority,
          dueDate,
          estimatedHours: t.hours,
          actualHours: t.status === "COMPLETED" ? t.hours : t.hours * 0.4,
          projectId: project.id,
          assigneeId: USER_ID,
          tenantId: TENANT_ID
        }
      });
    }

    // Persist ML Analysis snapshot
    await prisma.mLAnalysis.create({
      data: {
        projectId: project.id,
        riskScore: p.ml.riskScore,
        riskLevel: p.ml.riskLevel,
        delayProbability: p.ml.delayProbability,
        workloadIndex: p.ml.workloadIndex,
        recommendations: p.ml.recommendations
      }
    });

    console.log(`✅ Created: [${p.ml.riskLevel}] ${project.name}`);
  }

  console.log("\n🎉 Finished seeding 10 diverse ML projects successfully!");
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
