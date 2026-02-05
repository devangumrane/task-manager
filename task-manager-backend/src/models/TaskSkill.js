import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TaskSkill = sequelize.define('TaskSkill', {
    task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'tasks', key: 'id' },
    },
    skill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'skills', key: 'id' },
    },
}, {
    timestamps: true,
    tableName: 'task_skills',
});

export default TaskSkill;
