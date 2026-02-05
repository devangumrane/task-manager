import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Skill = sequelize.define('Skill', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    category: {
        type: DataTypes.ENUM('TECHNICAL', 'SOFT_SKILL', 'DOMAIN', 'OTHER'),
        defaultValue: 'TECHNICAL',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'skills',
});

export default Skill;
