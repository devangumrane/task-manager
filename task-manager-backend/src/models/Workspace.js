import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Workspace = sequelize.define('Workspace', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    timestamps: true,
    tableName: 'workspaces',
});

export default Workspace;
