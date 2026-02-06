import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Tag = sequelize.define('Tag', {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#94A3B8', // Default slate color
    },
}, {
    tableName: 'tags',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['workspace_id', 'name'],
        },
    ],
});

export default Tag;
