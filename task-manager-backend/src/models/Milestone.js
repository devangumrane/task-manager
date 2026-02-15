import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Milestone = sequelize.define('Milestone', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    learningPathId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'learning_paths',
            key: 'id',
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    }
}, {
    timestamps: true,
    tableName: 'milestones',
});

export default Milestone;
