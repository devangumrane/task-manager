import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubTask = sequelize.define('SubTask', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'task_id',
        references: {
            model: 'tasks',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_completed',
    },
}, {
    timestamps: true,
    tableName: 'sub_tasks',
});

export default SubTask;
