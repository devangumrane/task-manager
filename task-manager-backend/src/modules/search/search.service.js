import { Op } from "sequelize";
import { Task, Project, Workspace, User } from "../../models/index.js";

export const searchService = {
    async searchAll(userId, query) {
        if (!query || query.length < 2) {
            return { tasks: [], projects: [], workspaces: [] };
        }

        const lowerQuery = `%${query.toLowerCase()}%`;

        // Run searches in parallel
        const [tasks, projects, workspaces] = await Promise.all([
            // 1. Search Tasks (that user is assigned to OR created)
            Task.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: lowerQuery } },
                        { description: { [Op.like]: lowerQuery } }
                    ],
                    [Op.or]: [
                        { assigned_to: userId },
                        { created_by: userId }
                    ]
                },
                limit: 5,
                include: [
                    {
                        model: Project,
                        as: 'project',
                        attributes: ['id', 'name', 'workspace_id'],
                        include: { // Nested include for workspace name if needed
                            model: Workspace,
                            as: 'workspace',
                            attributes: ['id', 'name']
                        }
                    }
                ]
            }),

            // 2. Search Projects (that user is a member of - via workspace usually, but for now checking visibility or workspace membership might be complex. 
            // Simplified: Find projects in workspaces the user is a member of)
            Project.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: lowerQuery } },
                        { description: { [Op.like]: lowerQuery } }
                    ]
                },
                include: [{
                    model: Workspace,
                    as: 'workspace',
                    required: true,
                    include: [{
                        model: User,
                        as: 'members',
                        where: { id: userId },
                        attributes: [] // Check existence only
                    }]
                }],
                limit: 5
            }),

            // 3. Search Workspaces (that user is a member of)
            Workspace.findAll({
                where: {
                    name: { [Op.like]: lowerQuery }
                },
                include: [{
                    model: User,
                    as: 'members',
                    where: { id: userId },
                    attributes: []
                }],
                limit: 3
            })
        ]);

        return {
            tasks,
            projects,
            workspaces
        };
    }
};
