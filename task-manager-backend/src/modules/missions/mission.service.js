import prisma from "../../core/database/prisma.js";
import ApiError from "../../core/errors/ApiError.js";

export const missionService = {
    // CREATE
    async createMission(data) {
        const existing = await prisma.mission.findUnique({
            where: { slug: data.slug },
        });
        if (existing) throw new ApiError("EXISTS", "Mission slug already exists", 409);

        const skill = await prisma.skill.findUnique({ where: { id: data.skillId } });
        if (!skill) throw new ApiError("NOT_FOUND", "Skill not found", 404);

        return prisma.mission.create({ data });
    },

    // GET LIST (by Skill)
    async listMissions(skillId) {
        const where = {};
        if (skillId) where.skillId = Number(skillId);

        return prisma.mission.findMany({
            where,
            orderBy: { xpReward: "asc" },
            include: { skill: { select: { name: true, level: true } } }
        });
    },

    // GET ONE
    async getMission(missionId, userId) {
        const mission = await prisma.mission.findUnique({
            where: { id: missionId },
            include: {
                skill: true,
            },
        });

        if (!mission) throw new ApiError("NOT_FOUND", "Mission not found", 404);

        // TODO: Add Unlock Check Logic here based on user progress
        // const isUnlocked = await checkPrerequisites(userId, mission);

        return mission;
    },

    // UPDATE
    async updateMission(missionId, data) {
        const existing = await prisma.mission.findUnique({ where: { id: missionId } });
        if (!existing) throw new ApiError("NOT_FOUND", "Mission not found", 404);

        return prisma.mission.update({
            where: { id: missionId },
            data,
        });
    },
};
