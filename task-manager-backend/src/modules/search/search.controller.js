import asyncHandler from "express-async-handler";
import { searchService } from "./search.service.js";

export const searchController = {
    globalSearch: asyncHandler(async (req, res) => {
        const { q } = req.query;

        // Pass to service
        const results = await searchService.searchAll(req.user.id, q);

        res.json({
            success: true,
            data: results
        });
    })
};
