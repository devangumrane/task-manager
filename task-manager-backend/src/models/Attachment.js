import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Attachment = sequelize.define('Attachment', {
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
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mimetype: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'attachments',
});

export default Attachment;
