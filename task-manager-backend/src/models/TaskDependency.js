import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TaskDependency = sequelize.define('TaskDependency', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // The task that IS BLOCKING
    blocker_task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    // The task that IS BLOCKED
    blocked_task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    dependency_type: {
        type: DataTypes.ENUM('finish_to_start'),
        defaultValue: 'finish_to_start',
    },
}, {
    tableName: 'task_dependencies',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['blocker_task_id', 'blocked_task_id'],
        },
    ],
});

export default TaskDependency;
