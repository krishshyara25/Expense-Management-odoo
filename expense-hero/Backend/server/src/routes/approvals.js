import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { ApprovalAssignment } from '../models/ApprovalAssignment.js';
import { Expense } from '../models/Expense.js';
import { evaluateAndAdvance } from '../services/approvalEngine.js';

const router = Router();

router.get('/pending', auth, requireRole('MANAGER', 'ADMIN'), async (req, res) => {
  const viewAll = req.query.all && req.user.role === 'ADMIN';
  let query;
  if (viewAll) {
    // Admin can view all pending approvals in the company
    const { Expense } = await import('../models/Expense.js');
    const expIds = await Expense.find({ company: req.user.company._id }).distinct('_id');
    query = { status: 'PENDING', expense: { $in: expIds } };
  } else {
    query = { approver: req.user._id, status: 'PENDING' };
  }
  const items = await ApprovalAssignment.find(query)
    .populate({ path: 'expense', select: 'amountOriginal currencyOriginal amountCompany currencyCompany category description date status stepOrder receipts', populate: { path: 'employee', select: 'email' } })
    .populate({ path: 'approver', select: 'email role' })
    .sort({ createdAt: -1 });
  res.json(items);
});

router.post('/:id/approve', auth, requireRole('MANAGER', 'ADMIN'), async (req, res) => {
  const { comment } = req.body || {};
  const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, approver: req.user._id };
  const assignment = await ApprovalAssignment.findOne(query);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (assignment.status !== 'PENDING') return res.status(400).json({ error: 'Already decided' });
  assignment.status = 'APPROVED';
  assignment.comment = (req.user.role === 'ADMIN' ? `[Admin decision] ${comment || ''}`.trim() : (comment || null));
  assignment.decidedAt = new Date();
  await assignment.save();

  const expense = await Expense.findById(assignment.expense);
  await evaluateAndAdvance({ expense });
  res.json({ ok: true });
});

router.post('/:id/reject', auth, requireRole('MANAGER', 'ADMIN'), async (req, res) => {
  const { comment } = req.body || {};
  const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, approver: req.user._id };
  const assignment = await ApprovalAssignment.findOne(query);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (assignment.status !== 'PENDING') return res.status(400).json({ error: 'Already decided' });
  assignment.status = 'REJECTED';
  assignment.comment = (req.user.role === 'ADMIN' ? `[Admin decision] ${comment || ''}`.trim() : (comment || null));
  assignment.decidedAt = new Date();
  await assignment.save();

  const expense = await Expense.findById(assignment.expense);
  await evaluateAndAdvance({ expense });
  res.json({ ok: true });
});

export default router;
