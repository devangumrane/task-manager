import prisma from "./task-manager-backend/src/core/database/prisma.js";

async function testDashboard() {
    try {
        const userId = 1; // Assuming user ID 1 exists
        console.log("Testing with userId:", userId);

        console.log("1. Workspace count...");
        const workspaceCount = await prisma.workspace.count({
            where: {
                members: {
                    some: { userId },
                },
            },
        });
        console.log("Workspaces:", workspaceCount);

        console.log("2. Project count...");
        const projectCount = await prisma.project.count({
            where: {
                workspace: {
                    members: {
                        some: { userId },
                    },
                },
            },
        });
        console.log("Projects:", projectCount);

        console.log("3. Pending tasks...");
        const pendingTaskCount = await prisma.task.count({
            where: {
                assignedTo: userId,
                status: { in: ["todo", "in_progress"] },
            },
        });
        console.log("Pending Tasks:", pendingTaskCount);

        console.log("4. Completed tasks...");
        const completedTaskCount = await prisma.task.count({
            where: {
                assignedTo: userId,
                status: "done",
            },
        });
        console.log("Completed Tasks:", completedTaskCount);

        console.log("✅ Success!");
    } catch (err) {
        console.error("❌ Failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

testDashboard();
