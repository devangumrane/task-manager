import prisma from "../../core/database/prisma.js";
import ApiError from "../../core/errors/ApiError.js";

export const skillService = {
    // --------------------------------------------------------
    // CREATE SKILL
    // --------------------------------------------------------
    async createSkill(data) {
        const existing = await prisma.skill.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            throw new ApiError("SKILL_EXISTS", "Skill with this slug already exists", 409);
        }

        if (data.parentId) {
            const parent = await prisma.skill.findUnique({ where: { id: data.parentId } });
            if (!parent) {
                throw new ApiError("PARENT_NOT_FOUND", "Parent skill not found", 404);
            }
        }

        const skill = await prisma.skill.create({
            data,
        });

        return skill;
    },

    // --------------------------------------------------------
    // LIST SKILLS (Tree Structure)
    // --------------------------------------------------------
    async listSkills(category) {
        const where = {};
        if (category) {
            where.category = category;
        }

        const skills = await prisma.skill.findMany({
            where,
            include: {
                children: true, // Simple 1-level depth for now, can be recursive in frontend
            },
            orderBy: { level: "asc" },
        });

        return skills;
    },

    // --------------------------------------------------------
    // GET SINGLE SKILL
    // --------------------------------------------------------
    async getSkill(skillId) {
        const skill = await prisma.skill.findUnique({
            where: { id: skillId },
            include: {
                children: true,
                parent: true,
                missions: true,
            },
        });

        if (!skill) {
            throw new ApiError("SKILL_NOT_FOUND", "Skill not found", 404);
        }

        return skill;
    },

    // --------------------------------------------------------
    // UPDATE SKILL
    // --------------------------------------------------------
    async updateSkill(skillId, data) {
        const existing = await prisma.skill.findUnique({ where: { id: skillId } });
        if (!existing) {
            throw new ApiError("SKILL_NOT_FOUND", "Skill not found", 404);
        }

        const updated = await prisma.skill.update({
            where: { id: skillId },
            data,
        });

        return updated;
    },
};
