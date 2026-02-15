import { LearningPath, Milestone, MilestoneRequirement, Skill, User } from '../src/models/index.js';
import sequelize from '../src/config/database.js';

async function seedAndVerify() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Ensure a Skill exists
        const [skill, created] = await Skill.findOrCreate({
            where: { name: 'React' },
            defaults: { category: 'TECHNICAL', description: 'Frontend Library' }
        });
        console.log(`Skill 'React' ready. ID: ${skill.id}`);

        // 2. Create a Learning Path
        const path = await LearningPath.create({
            title: 'Frontend Mastery',
            description: 'Become a Senior Frontend Engineer',
            category: 'Frontend'
        });
        console.log(`Learning Path created. ID: ${path.id}`);

        // 3. Add a Milestone
        const milestone = await Milestone.create({
            title: 'React Fundamentals',
            description: 'Learn components and hooks',
            order: 0,
            learningPathId: path.id
        });
        console.log(`Milestone created. ID: ${milestone.id}`);

        // 4. Add a Requirement
        await MilestoneRequirement.create({
            milestoneId: milestone.id,
            skillId: skill.id,
            targetTaskCount: 3
        });
        console.log('Requirement added.');

        // 5. Verify Fetch
        const paths = await LearningPath.findAll({
            where: { id: path.id },
            include: [{
                model: Milestone,
                as: 'milestones',
                include: [{
                    model: MilestoneRequirement,
                    as: 'requirements',
                    include: ['skill']
                }]
            }]
        });

        if (paths.length > 0 && paths[0].milestones.length > 0) {
            console.log('✅ Verification Successful: Path with milestones fetched correctly.');
            console.log(JSON.stringify(paths[0].toJSON(), null, 2));
        } else {
            console.error('❌ Verification Failed: Path structure incorrect.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close(); // Close connection but don't kill process immediately if needed, though script should exit
    }
}

seedAndVerify();
