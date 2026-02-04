import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TaskReminder = sequelize.define('TaskReminder', {
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
    reminderTime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'reminder_time',
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'sent', 'cancelled'),
        defaultValue: 'scheduled',
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'task_reminders',
});

export default TaskReminder;
