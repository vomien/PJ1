const express = require("express");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const keyword = req.query.keyword?.trim();
        const scope = req.query.scope || "all";

        if (!keyword) {
            return res.status(400).json({ message: "Vui lòng nhập từ khóa" });
        }

        const like = `%${keyword}%`;
        const result = {};

        if (scope === "all" || scope === "households") {
            const [households] = await pool.query(
                `SELECT id, code, owner, address FROM households
                 WHERE code LIKE ? OR owner LIKE ? OR address LIKE ?
                 ORDER BY owner ASC`,
                [like, like, like],
            );
            result.households = households;
        }

        if (scope === "all" || scope === "residents") {
            const [residents] = await pool.query(
                `SELECT r.id, r.name, r.birth_year AS birthYear, r.relation,
                        h.code AS householdCode, h.owner AS householdOwner
                 FROM residents r
                 JOIN households h ON h.id = r.household_id
                 WHERE r.name LIKE ? OR r.relation LIKE ? OR h.code LIKE ?
                 ORDER BY r.name ASC`,
                [like, like, like],
            );
            result.residents = residents;
        }

        if (scope === "all" || scope === "contributions") {
            const [contributions] = await pool.query(
                `SELECT c.id, c.description, c.amount, c.contributed_at AS contributedAt,
                        h.code AS householdCode, h.owner AS householdOwner
                 FROM contributions c
                 JOIN households h ON h.id = c.household_id
                 WHERE c.description LIKE ? OR h.code LIKE ? OR h.owner LIKE ?
                 ORDER BY c.contributed_at DESC`,
                [like, like, like],
            );
            result.contributions = contributions;
        }

        res.json(result);
    }),
);

module.exports = router;



