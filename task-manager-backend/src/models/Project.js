import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'archived', 'completed'),
        defaultValue: 'active',
    },
    workspace_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'workspaces',
            key: 'id',
        },
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    timestamps: true,
    tableName: 'projects',
});

export default Project;
