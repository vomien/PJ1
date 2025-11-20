const express = require("express");
const { randomUUID } = require("crypto");

const activeTokens = new Map();

function createAuthRouter() {
    const router = express.Router();

    router.post("/login", (req, res) => {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ message: "Thiếu tên đăng nhập hoặc mật khẩu" });
        }

        if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
        }

        const token = randomUUID();
        activeTokens.set(token, { username, issuedAt: Date.now() });
        res.json({ token, username });
    });

    router.post("/logout", requireAuth, (req, res) => {
        activeTokens.delete(req.token);
        res.json({ success: true });
    });

    return router;
}

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Thiếu token xác thực" });
    }
    const token = authHeader.slice(7);
    const session = activeTokens.get(token);
    if (!session) {
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
    req.user = session;
    req.token = token;
    next();
}

module.exports = {
    createAuthRouter,
    requireAuth,
};



