import express from 'express';
import { getLearningPaths, createLearningPath } from './learning-path.controller.js';
import { requireAuth } from '../../core/middlewares/auth.middleware.js';
// import { roleGuard } from '../../core/middlewares/role.middleware.js'; // If we want to restrict creation

const router = express.Router();

router.get('/', requireAuth, getLearningPaths);
router.post('/', requireAuth, createLearningPath); // TODO: Add admin check

export default router;
