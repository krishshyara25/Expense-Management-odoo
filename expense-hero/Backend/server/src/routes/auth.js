import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { getCompanyCurrencyByCountry } from '../services/currency.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, companyName, countryCode } = req.body;
    if (!email || !password || !companyName || !countryCode) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'User already exists' });

    const currencyCode = await getCompanyCurrencyByCountry(countryCode);

    const company = await Company.create({ name: companyName, countryCode, currencyCode });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      role: 'ADMIN',
      company: company._id,
    });

    // Create a default approval flow and set as active
    const { ApprovalFlow } = await import('../models/ApprovalFlow.js');
    const defaultFlow = await ApprovalFlow.create({
      company: company._id,
      name: 'Default',
      steps: [
        { order: 1, approvers: ['MANAGER'], isManagerFirst: true }
      ],
      rules: [],
    });
    company.activeFlow = defaultFlow._id;
    await company.save();

    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role }, company });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('company');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role }, company: user.company });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
