import { analyticsService } from "./analytics.service.js";
import { successResponse } from "../../core/utils/response.js";
import { Skill } from "../../models/index.js"; // Direct access for simple CRUD
import { Op } from "sequelize";

export const analyticsController = {
    async getMySkills(req, res, next) {
        try {
            const skills = await analyticsService.getUserSkills(req.user.id);
            successResponse(res, skills);
        } catch (err) {
            next(err);
        }
    },

    async listAllSkills(req, res, next) {
        try {
            const { search } = req.query;
            const where = {};
            if (search) {
                where.name = { [Op.like]: `%${search}%` };
            }
            const skills = await Skill.findAll({ where, limit: 20 });
            successResponse(res, skills);
        } catch (err) {
            next(err);
        }
    },

    async createSkill(req, res, next) {
        try {
            const { name, category } = req.body;
            // Simple check or allow dupes handling by DB unique constraint
            const skill = await Skill.create({ name, category });
            successResponse(res, skill, 201);
        } catch (err) {
            next(err);
        }
    }
};
