import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RecurringTask = sequelize.define('RecurringTask', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // Template task to copy from
    original_task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id',
        },
    },
    cron_expression: {
        type: DataTypes.STRING,
        allowNull: false,
        // e.g. "0 9 * * 1" (Every Monday at 9AM)
    },
    next_run: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    last_run: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'recurring_tasks',
    timestamps: true,
});

export default RecurringTask;
