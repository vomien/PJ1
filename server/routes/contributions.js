const express = require("express");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
    "/",
    asyncHandler(async (_req, res) => {
        const [rows] = await pool.query(
            `SELECT c.id, c.household_id AS householdId, c.description, c.amount, c.contributed_at AS contributedAt,
                    h.code AS householdCode, h.owner AS householdOwner
             FROM contributions c
             JOIN households h ON h.id = c.household_id
             ORDER BY c.contributed_at DESC, c.id DESC`,
        );
        res.json(rows);
    }),
);

router.get(
    "/summary",
    asyncHandler(async (_req, res) => {
        const [rows] = await pool.query(
            `SELECT h.id AS householdId, h.owner AS householdOwner, SUM(c.amount) AS totalAmount
             FROM contributions c
             JOIN households h ON h.id = c.household_id
             GROUP BY h.id`,
        );
        res.json(rows);
    }),
);

const normalizeDate = (value) => {
    if (!value) return new Date().toISOString().slice(0, 10);
    return new Date(value).toISOString().slice(0, 10);
};

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const { householdId, description, amount, contributedAt } = req.body || {};
        if (!householdId || !description || !amount) {
            return res.status(400).json({ message: "Thiếu thông tin đóng góp" });
        }
        await pool.query(
            "INSERT INTO contributions (household_id, description, amount, contributed_at) VALUES (?, ?, ?, ?)",
            [householdId, description, amount, normalizeDate(contributedAt)],
        );
        res.status(201).json({ message: "Đã ghi nhận đóng góp" });
    }),
);

router.put(
    "/:id",
    asyncHandler(async (req, res) => {
        const { householdId, description, amount, contributedAt } = req.body || {};
        if (!householdId || !description || !amount) {
            return res.status(400).json({ message: "Thiếu thông tin đóng góp" });
        }
        await pool.query(
            "UPDATE contributions SET household_id = ?, description = ?, amount = ?, contributed_at = ? WHERE id = ?",
            [householdId, description, amount, normalizeDate(contributedAt), req.params.id],
        );
        res.json({ message: "Đã cập nhật đóng góp" });
    }),
);

router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
        await pool.query("DELETE FROM contributions WHERE id = ?", [req.params.id]);
        res.json({ message: "Đã xóa đóng góp" });
    }),
);

module.exports = router;

