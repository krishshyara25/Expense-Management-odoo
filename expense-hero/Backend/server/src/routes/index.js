import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import expenseRoutes from './expenses.js';
import approvalRoutes from './approvals.js';
import adminRoutes from './admin.js';
import utilRoutes from './util.js';
import ocrRoutes from './ocr.js';
import meRoutes from './me.js';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/expenses', expenseRoutes);
router.use('/approvals', approvalRoutes);
router.use('/admin', adminRoutes);
router.use('/utils', utilRoutes);
router.use('/ocr', ocrRoutes);
router.use('/me', meRoutes);
