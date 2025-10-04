import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { ApprovalFlow } from '../models/ApprovalFlow.js';
import { Company } from '../models/Company.js';

const router = Router();

router.post('/approval-flows', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, steps = [], rules = [] } = req.body;
    const flow = await ApprovalFlow.create({
      company: req.user.company._id,
      name,
      steps,
      rules,
    });
    res.status(201).json(flow);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Create flow failed' });
  }
});

router.post('/approval-flows/:id/activate', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const flow = await ApprovalFlow.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!flow) return res.status(404).json({ error: 'Flow not found' });
    const company = await Company.findById(req.user.company._id);
    company.activeFlow = flow._id;
    await company.save();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Activate flow failed' });
  }
});

router.patch('/users/:id', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!role) return res.status(400).json({ error: 'Missing role' });
    const { User } = await import('../models/User.js');
    const user = await User.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ id: user._id, role: user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Change role failed' });
  }
});

router.post('/expenses/:id/override', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status, comment } = req.body || {};
    if (!['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const { Expense } = await import('../models/Expense.js');
    const { ApprovalAssignment } = await import('../models/ApprovalAssignment.js');
    const expense = await Expense.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    expense.status = status;
    await expense.save();
    await ApprovalAssignment.updateMany(
      { expense: expense._id, status: 'PENDING' },
      { $set: { status: status, comment: (comment || 'Overridden by admin'), decidedAt: new Date() } }
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Override failed' });
  }
});

// Admin history: list all company expenses with basic data
router.get('/history', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { Expense } = await import('../models/Expense.js');
    const expenses = await Expense.find({ company: req.user.company._id })
      .populate('employee', 'email role')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'History fetch failed' });
  }
});

export default router;
