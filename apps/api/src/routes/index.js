import { Router } from 'express';
import healthCheck from './health-check.js';
import integratedAiRouter from './integrated-ai.js';
import subscriptionsRouter from './ecommerce/subscriptions.js';
import adminRouter from './admin.js';
import { pocketbaseUser } from '../middleware/pb-user.js';

const router = Router();

export default () => {
	router.get('/health', healthCheck);
	router.use('/integrated-ai', integratedAiRouter);
	router.use('/ecommerce/subscriptions', pocketbaseUser, subscriptionsRouter);
	router.use('/admin', adminRouter);
	return router;
};
