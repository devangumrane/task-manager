import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WorkspaceMember = sequelize.define('WorkspaceMember', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    workspace_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'workspaces',
            key: 'id',
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    role: {
        type: DataTypes.ENUM('admin', 'member', 'viewer'),
        defaultValue: 'member',
    },
}, {
    timestamps: true,
    tableName: 'workspace_members',
});

export default WorkspaceMember;
