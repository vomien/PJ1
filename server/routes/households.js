const express = require("express");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
    "/",
    asyncHandler(async (_req, res) => {
        const [rows] = await pool.query(
            `SELECT h.id, h.code, h.owner, h.address, h.created_at AS createdAt, h.updated_at AS updatedAt,
                    COUNT(r.id) AS residentCount
             FROM households h
             LEFT JOIN residents r ON r.household_id = h.id
             GROUP BY h.id
             ORDER BY h.created_at DESC`,
        );
        res.json(rows);
    }),
);

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const { code, owner, address } = req.body || {};
        if (!code || !owner || !address) {
            return res.status(400).json({ message: "Thiếu thông tin hộ khẩu" });
        }
        await pool.query("INSERT INTO households (code, owner, address) VALUES (?, ?, ?)", [code, owner, address]);
        res.status(201).json({ message: "Đã thêm hộ khẩu" });
    }),
);

router.put(
    "/:id",
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { code, owner, address } = req.body || {};
        if (!code || !owner || !address) {
            return res.status(400).json({ message: "Thiếu thông tin hộ khẩu" });
        }
        await pool.query("UPDATE households SET code = ?, owner = ?, address = ? WHERE id = ?", [
            code,
            owner,
            address,
            id,
        ]);
        res.json({ message: "Đã cập nhật hộ khẩu" });
    }),
);

router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
        await pool.query("DELETE FROM households WHERE id = ?", [req.params.id]);
        res.json({ message: "Đã xóa hộ khẩu" });
    }),
);

module.exports = router;



