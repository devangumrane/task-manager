import prisma from "../../core/database/prisma.js";

export const gamificationService = {
    // --------------------------------------------------------
    // CALCULATE LEVEL
    // Level = sqrt(XP / 100) (Simple formula)
    // --------------------------------------------------------
    calculateLevel(xp) {
        if (xp < 0) return 1;
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    },

    // --------------------------------------------------------
    // AWARD XP
    // --------------------------------------------------------
    async awardXP(userId, amount) {
        const stats = await prisma.userStats.upsert({
            where: { userId },
            create: { userId, totalXP: amount, currentLevel: this.calculateLevel(amount) },
            update: { totalXP: { increment: amount } },
        });

        // Check for level up
        const newLevel = this.calculateLevel(stats.totalXP);
        if (newLevel > stats.currentLevel) {
            await prisma.userStats.update({
                where: { userId },
                data: { currentLevel: newLevel },
            });
            // TODO: Emit "Level Up" event or notification
        }

        return stats;
    },

    // --------------------------------------------------------
    // GET USER STATS
    // --------------------------------------------------------
    async getUserStats(userId) {
        const stats = await prisma.userStats.findUnique({
            where: { userId },
            include: {
                user: { select: { name: true, profileImage: true } },
            },
        });

        if (!stats) {
            // Initialize if missing
            return this.awardXP(userId, 0);
        }

        return stats;
    },
};
