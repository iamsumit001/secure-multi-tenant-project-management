const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./auth/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
const roleRoutes = require("./routes/role.routes");
const permissionRoutes = require("./routes/permission.routes");
const commentRoutes = require("./routes/comment.routes");
const notificationRoutes = require("./routes/notification.routes");
const tenantRoutes = require("./routes/tenant.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
}));

// Request size limit — prevents large payload attacks
app.use(express.json({ limit: "10kb" }));

// Rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // max 100 requests per 15 min
    message: { success: false, message: "Too many requests, please try again after 15 minutes." }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // max 20 auth attempts per 15 min
    message: { success: false, message: "Too many login attempts, please try again after 15 minutes." }
});

app.use("/api/v1", generalLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

app.use(cors({
    origin: function (origin, callback) {
        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            process.env.NODE_ENV === "development" ||
            /^https:\/\/.*\.vercel\.app$/.test(origin)
        ) {
            callback(null, true);
            return;
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Secure Multi-Tenant Backend is running",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.use(errorHandler);

module.exports = app;
