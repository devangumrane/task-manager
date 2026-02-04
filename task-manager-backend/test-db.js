import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
console.log("Testing URL:", url);

try {
    const parsed = new URL(url);
    console.log("Parsed Password:", parsed.password);
    console.log("Parsed Host:", parsed.hostname);
} catch (e) {
    console.error("URL Parse Error:", e.message);
}

const sequelize = new Sequelize(url, {
    dialect: 'mysql',
    logging: false,
});

sequelize.authenticate()
    .then(() => console.log('✅ Connection has been established successfully.'))
    .catch(err => console.error('❌ Unable to connect to the database:', err.message));
