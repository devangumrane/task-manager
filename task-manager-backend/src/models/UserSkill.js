import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserSkill = sequelize.define('UserSkill', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
    },
    skill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'skills', key: 'id' },
    },
    tasks_completed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    last_used_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true,
    tableName: 'user_skills',
});

export default UserSkill;
