
import sequelize from '../src/config/database.js';
import * as models from '../src/models/index.js';

async function testModels() {
    console.log("Loading models...");
    try {
        console.log("Models loaded:", Object.keys(models));
        await sequelize.authenticate();
        console.log("DB Connected.");
        // await sequelize.sync({ force: false }); // Try sync?
        // console.log("Sync success.");
    } catch (error) {
        console.error("Model Error:", error);
    } finally {
        await sequelize.close();
    }
}

testModels();
