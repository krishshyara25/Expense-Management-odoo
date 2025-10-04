import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { User } from '../models/User.js';

const router = Router();

router.get('/', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const users = await User.find({ company: req.user.company._id })
      .select('email role profile.manager')
      .populate({ path: 'profile.manager', select: 'email role' });
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'List users failed' });
  }
});

router.post('/', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
    const bcrypt = (await import('bcryptjs')).default;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      role,
      company: req.user.company._id,
    });
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Create user failed' });
  }
});

router.post('/manager-relations', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { employeeId, managerId } = req.body;
    const employee = await User.findOne({ _id: employeeId, company: req.user.company._id });
    const manager = await User.findOne({ _id: managerId, company: req.user.company._id });
    if (!employee || !manager) return res.status(404).json({ error: 'User not found' });
    employee.profile.manager = manager._id;
    await employee.save();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Set manager failed' });
  }
});

export default router;
