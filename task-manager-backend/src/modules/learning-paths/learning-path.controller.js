import { LearningPath, Milestone, MilestoneRequirement, Skill, UserSkill } from '../../models/index.js';

export const getLearningPaths = async (req, res) => {
    try {
        const paths = await LearningPath.findAll({
            where: { isActive: true },
            include: [
                {
                    model: Milestone,
                    as: 'milestones',
                    include: [
                        {
                            model: MilestoneRequirement,
                            as: 'requirements',
                            include: [{ model: Skill, as: 'skill' }]
                        }
                    ],
                    order: [['order', 'ASC']]
                }
            ]
        });

        // If user is logged in, calculate their progress
        const userId = req.user?.id;
        let enrichedPaths = paths;

        if (userId) {
            // Fetch user's skill proficiency
            // We need to count TASKS completed per skill, not just the proficiency level (if that's what UserSkill stores)
            // Assuming UserSkill has a 'tasks_completed' field or similar. 
            // Let's quickly verify UserSkill model structure in a separate step if unsure, but for now assuming standard pattern.
            // Actually, let's look at how SkillMatrix fetches data. It uses userSkill.tasks_completed.

            const userSkills = await UserSkill.findAll({
                where: { user_id: userId }
            });

            const userSkillMap = {}; // skillId -> tasks_completed
            userSkills.forEach(us => {
                userSkillMap[us.skill_id] = us.tasks_completed || 0;
            });

            enrichedPaths = paths.map(path => {
                const pathJson = path.toJSON();

                let pathTotalRequirements = 0;
                let pathCompletedRequirements = 0;

                pathJson.milestones = pathJson.milestones.map(milestone => {
                    let milestoneCompleted = true;

                    milestone.requirements = milestone.requirements.map(req => {
                        const userTaskCount = userSkillMap[req.skillId] || 0;
                        const isMet = userTaskCount >= req.targetTaskCount;

                        pathTotalRequirements++;
                        if (isMet) pathCompletedRequirements++;
                        if (!isMet) milestoneCompleted = false;

                        return {
                            ...req,
                            userProgress: userTaskCount,
                            isMet
                        };
                    });

                    return {
                        ...milestone,
                        isCompleted: milestoneCompleted
                    };
                });

                pathJson.progress = pathTotalRequirements === 0 ? 0 : Math.round((pathCompletedRequirements / pathTotalRequirements) * 100);
                return pathJson;
            });
        }

        res.json({ data: enrichedPaths });
    } catch (error) {
        console.error('Error fetching learning paths:', error);
        res.status(500).json({ error: 'Failed to fetch learning paths' });
    }
};

export const createLearningPath = async (req, res) => {
    try {
        const { title, description, category, milestones } = req.body;

        // Simple transaction could be used here for safety
        const path = await LearningPath.create({ title, description, category });

        if (milestones && milestones.length > 0) {
            for (const [index, m] of milestones.entries()) {
                const milestone = await Milestone.create({
                    title: m.title,
                    description: m.description,
                    order: index,
                    learningPathId: path.id
                });

                if (m.requirements && m.requirements.length > 0) {
                    for (const req of m.requirements) {
                        await MilestoneRequirement.create({
                            milestoneId: milestone.id,
                            skillId: req.skillId,
                            targetTaskCount: req.targetTaskCount
                        });
                    }
                }
            }
        }

        res.status(201).json({ data: path });
    } catch (error) {
        console.error('Error creating learning path:', error);
        res.status(500).json({ error: 'Failed to create learning path' });
    }
};
