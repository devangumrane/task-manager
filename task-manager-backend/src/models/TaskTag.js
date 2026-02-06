import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TaskTag = sequelize.define('TaskTag', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id',
        },
    },
    tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tags',
            key: 'id',
        },
    },
}, {
    tableName: 'task_tags',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['task_id', 'tag_id'],
        },
    ],
});

export default TaskTag;
