import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";
import { createMissionSchema, updateMissionSchema } from "./mission.schemas.js";
import { missionService } from "./mission.service.js";

export const missionController = {
    create: asyncHandler(async (req, res) => {
        const parsed = createMissionSchema.parse(req.body);
        const mission = await missionService.createMission(parsed);
        res.status(201).json({ success: true, data: mission });
    }),

    list: asyncHandler(async (req, res) => {
        const { skillId } = req.query;
        const missions = await missionService.listMissions(skillId);
        res.json({ success: true, data: missions });
    }),

    get: asyncHandler(async (req, res) => {
        const missionId = Number(req.params.missionId);
        if (!missionId) throw new ApiError("INVALID_ID", "Invalid Mission ID", 400);

        const mission = await missionService.getMission(missionId, req.user.id);
        res.json({ success: true, data: mission });
    }),

    update: asyncHandler(async (req, res) => {
        const missionId = Number(req.params.missionId);
        if (!missionId) throw new ApiError("INVALID_ID", "Invalid Mission ID", 400);

        const parsed = updateMissionSchema.parse(req.body);
        const mission = await missionService.updateMission(missionId, parsed);
        res.json({ success: true, data: mission });
    }),
};
