const express = require("express");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
    "/",
    asyncHandler(async (_req, res) => {
        const [rows] = await pool.query(
            `SELECT r.id, r.household_id AS householdId, r.name, r.birth_year AS birthYear,
                    r.relation, h.code AS householdCode, h.owner AS householdOwner
             FROM residents r
             JOIN households h ON h.id = r.household_id
             ORDER BY r.created_at DESC`,
        );
        res.json(rows);
    }),
);

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const { householdId, name, birthYear, relation } = req.body || {};
        if (!householdId || !name || !relation) {
            return res.status(400).json({ message: "Thiếu thông tin cư dân" });
        }
        await pool.query(
            "INSERT INTO residents (household_id, name, birth_year, relation) VALUES (?, ?, ?, ?)",
            [householdId, name, birthYear ?? null, relation],
        );
        res.status(201).json({ message: "Đã thêm cư dân" });
    }),
);

router.put(
    "/:id",
    asyncHandler(async (req, res) => {
        const { householdId, name, birthYear, relation } = req.body || {};
        if (!householdId || !name || !relation) {
            return res.status(400).json({ message: "Thiếu thông tin cư dân" });
        }
        await pool.query(
            "UPDATE residents SET household_id = ?, name = ?, birth_year = ?, relation = ? WHERE id = ?",
            [householdId, name, birthYear ?? null, relation, req.params.id],
        );
        res.json({ message: "Đã cập nhật cư dân" });
    }),
);

router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
        await pool.query("DELETE FROM residents WHERE id = ?", [req.params.id]);
        res.json({ message: "Đã xóa cư dân" });
    }),
);

module.exports = router;



