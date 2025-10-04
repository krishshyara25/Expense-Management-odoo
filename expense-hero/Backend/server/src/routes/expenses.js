import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { Expense } from '../models/Expense.js';
import { User } from '../models/User.js';
import { convertToCompanyCurrency } from '../services/currency.js';
import { ApprovalFlow } from '../models/ApprovalFlow.js';
import { ApprovalAssignment } from '../models/ApprovalAssignment.js';
import { createAssignmentsForStep, evaluateAndAdvance } from '../services/approvalEngine.js';

const router = Router();

router.post('/', auth, async (req, res) => {
  try {
    const { amount, currency, category, description, date, lines = [], receipts = [] } = req.body;
    if (!amount || !currency || !category || !date) return res.status(400).json({ error: 'Missing fields' });
    const companyCurrency = req.user.company.currencyCode;
    const converted = await convertToCompanyCurrency(currency, companyCurrency, amount);
    const expense = await Expense.create({
      employee: req.user._id,
      company: req.user.company._id,
      amountOriginal: amount,
      currencyOriginal: currency,
      amountCompany: converted,
      currencyCompany: companyCurrency,
      category,
      description,
      date,
      lines,
      receipts,
      status: 'PENDING',
    });

    // Attach active approval flow and create initial assignments
    const companyActiveFlowId = req.user.company.activeFlow;
    if (companyActiveFlowId) {
      const flow = await ApprovalFlow.findById(companyActiveFlowId);
      if (flow) {
        expense.flow = flow._id;
        expense.stepOrder = 1;
        await expense.save();
        const step = flow.steps.find(s => s.order === 1) || flow.steps[0];
        if (step) {
          await createAssignmentsForStep({ expense, step });
          // Evaluate right away in case the step has zero approvers or rules auto-pass
          await evaluateAndAdvance({ expense });
        }
      }
    }

    res.status(201).json(expense);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Create expense failed' });
  }
});

router.get('/mine', auth, async (req, res) => {
  const expenses = await Expense.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.json(expenses);
});

router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('employee', 'email');
    if (!expense) return res.status(404).json({ error: 'Not found' });
    const isOwner = expense.employee._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';
    let isApprover = false;
    if (!isOwner && !isAdmin) {
      const { ApprovalAssignment } = await import('../models/ApprovalAssignment.js');
      const a = await ApprovalAssignment.findOne({ expense: expense._id, approver: req.user._id });
      isApprover = !!a;
    }
    if (!(isOwner || isAdmin || isApprover)) return res.status(403).json({ error: 'Forbidden' });

    const { ApprovalAssignment } = await import('../models/ApprovalAssignment.js');
    const approvals = await ApprovalAssignment.find({ expense: expense._id })
      .populate('approver', 'email role')
      .sort({ createdAt: 1 });
    res.json({ expense, approvals });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

router.get('/team', auth, requireRole('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const team = await User.find({ 'profile.manager': req.user._id, company: req.user.company._id }).select('_id');
    const teamIds = team.map(u => u._id);
    const expenses = await Expense.find({ employee: { $in: teamIds } }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Team expenses failed' });
  }
});

router.get('/all', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const expenses = await Expense.find({ company: req.user.company._id }).populate('employee', 'email role').sort({ createdAt: -1 });
    res.json(expenses);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'All expenses failed' });
  }
});

export default router;
