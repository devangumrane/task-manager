import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'task_id',
        references: { model: 'tasks', key: 'id' },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: { model: 'users', key: 'id' },
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'parent_id',
    },
}, {
    timestamps: true,
    tableName: 'comments',
});

export default Comment;
