import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'workspace_id', // Map to snake_case if preferred, but existing prisma was likely camelCase or mapped. Let's stick to consistent snake_case in DB
        references: {
            model: 'workspaces',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id',
        },
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'task_id',
        references: {
            model: 'tasks',
            key: 'id',
        },
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'project_id',
        references: {
            model: 'projects',
            key: 'id',
        },
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'activity_logs',
});

export default ActivityLog;
