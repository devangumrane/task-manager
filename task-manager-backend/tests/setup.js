import { beforeAll, afterAll, afterEach, jest } from '@jest/globals';
import sequelize from '../src/config/database.js';

// Global setup
beforeAll(async () => {
    // Connect to DB (maybe use a test DB in future, for now using existing but be careful)
    // For safety in this existing env, we might want to mock DB or use a transaction rollback strategy if possible.
    // However, given the "Stability" goal, let's just ensure connection.
    // Mock DB connection for unit tests
    if (process.env.NODE_ENV === 'test') {
        sequelize.authenticate = jest.fn().mockResolvedValue();
        sequelize.close = jest.fn().mockResolvedValue();
        return;
    }

    try {
        await sequelize.authenticate();
        // console.log('Test DB Connected');
    } catch (err) {
        console.error('Test DB Connection Failed:', err);
    }
});

afterAll(async () => {
    await sequelize.close();
});

jest.setTimeout(30000); // 30s timeout
