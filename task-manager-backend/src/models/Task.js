import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Task = sequelize.define('Task', {
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
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'projects',
            key: 'id',
        },
    },
    workspace_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'workspaces',
            key: 'id',
        },
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true, // or false depending on logic, typically false
        references: {
            model: 'users',
            key: 'id',
        },
    },
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
        defaultValue: 'pending',
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: 'tasks',
});

export default Task;
