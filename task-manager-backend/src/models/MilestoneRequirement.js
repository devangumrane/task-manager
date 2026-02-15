import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MilestoneRequirement = sequelize.define('MilestoneRequirement', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    milestoneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'milestones',
            key: 'id',
        },
    },
    skillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'skills',
            key: 'id',
        },
    },
    targetTaskCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
        comment: 'Number of tasks with this skill required to complete the requirement',
    }
}, {
    timestamps: true,
    tableName: 'milestone_requirements',
});

export default MilestoneRequirement;
