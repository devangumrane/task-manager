import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";
import { createSkillSchema, updateSkillSchema } from "./skill.schemas.js";
import { skillService } from "./skill.service.js";

export const skillController = {
    // POST /skills
    create: asyncHandler(async (req, res) => {
        // TODO: Add RBAC check (Admin only)
        const parsed = createSkillSchema.parse(req.body);
        const skill = await skillService.createSkill(parsed);

        res.status(201).json({
            success: true,
            data: skill,
        });
    }),

    // GET /skills
    list: asyncHandler(async (req, res) => {
        const { category } = req.query;
        const skills = await skillService.listSkills(category);

        res.json({
            success: true,
            data: skills,
        });
    }),

    // GET /skills/:skillId
    get: asyncHandler(async (req, res) => {
        const skillId = Number(req.params.skillId);
        if (!skillId) throw new ApiError("INVALID_ID", "Invalid Skill ID", 400);

        const skill = await skillService.getSkill(skillId);

        res.json({
            success: true,
            data: skill,
        });
    }),

    // PATCH /skills/:skillId
    update: asyncHandler(async (req, res) => {
        const skillId = Number(req.params.skillId);
        if (!skillId) throw new ApiError("INVALID_ID", "Invalid Skill ID", 400);

        const parsed = updateSkillSchema.parse(req.body);
        const skill = await skillService.updateSkill(skillId, parsed);

        res.json({
            success: true,
            data: skill,
        });
    }),
};
