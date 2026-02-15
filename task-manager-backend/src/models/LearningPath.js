import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LearningPath = sequelize.define('LearningPath', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING, // e.g., 'Frontend', 'Backend', 'DevOps'
        defaultValue: 'General',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true,
    tableName: 'learning_paths',
});

export default LearningPath;
