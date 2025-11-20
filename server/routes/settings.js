const express = require("express");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
    "/",
    asyncHandler(async (_req, res) => {
        const [rows] = await pool.query("SELECT organization, contact_email AS contactEmail, announcement FROM settings WHERE id = 1");
        res.json(rows[0] || {});
    }),
);

router.put(
    "/",
    asyncHandler(async (req, res) => {
        const { organization, contactEmail, announcement } = req.body || {};
        await pool.query(
            `INSERT INTO settings (id, organization, contact_email, announcement)
             VALUES (1, ?, ?, ?)
             ON DUPLICATE KEY UPDATE organization = VALUES(organization), contact_email = VALUES(contact_email), announcement = VALUES(announcement)`,
            [organization || null, contactEmail || null, announcement || null],
        );
        res.json({ message: "Đã lưu cài đặt" });
    }),
);

module.exports = router;



