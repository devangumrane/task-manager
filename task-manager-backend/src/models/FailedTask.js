import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FailedTask = sequelize.define('FailedTask', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    originalTaskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'original_task_id',
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    data: {
        type: DataTypes.JSON,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'failed_tasks',
});

export default FailedTask;
