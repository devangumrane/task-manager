import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TimeEntry = sequelize.define('TimeEntry', {
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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true, // Null means currently running
    },
    duration: {
        type: DataTypes.INTEGER, // Duration in seconds
        defaultValue: 0,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'time_entries',
    timestamps: true,
});

export default TimeEntry;
