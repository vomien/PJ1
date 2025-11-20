const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const { requireAuth, createAuthRouter } = require("./routes/auth");
const householdRouter = require("./routes/households");
const residentRouter = require("./routes/residents");
const contributionRouter = require("./routes/contributions");
const searchRouter = require("./routes/search");
const settingsRouter = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 4000;

// Cấu hình CORS chi tiết
const corsOptions = {
    origin: function (origin, callback) {
        // Cho phép tất cả origin (bao gồm null cho file:// và localhost)
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('file://')) {
            callback(null, true);
        } else {
            const allowedOrigins = process.env.CLIENT_ORIGIN?.split(",") || ["*"];
            if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(null, true); // Vẫn cho phép để tránh lỗi
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Xử lý preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", createAuthRouter());
app.use("/api/households", requireAuth, householdRouter);
app.use("/api/residents", requireAuth, residentRouter);
app.use("/api/contributions", requireAuth, contributionRouter);
app.use("/api/search", requireAuth, searchRouter);
app.use("/api/settings", requireAuth, settingsRouter);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || "Đã xảy ra lỗi không xác định",
    });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});


