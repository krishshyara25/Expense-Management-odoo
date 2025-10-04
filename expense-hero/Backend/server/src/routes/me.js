import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { Expense } from '../models/Expense.js'
import { ApprovalAssignment } from '../models/ApprovalAssignment.js'

const router = Router()

router.get('/activity', auth, async (req, res) => {
  try {
    const myExpenses = await Expense.find({ employee: req.user._id }).sort({ createdAt: -1 }).limit(100)
    const myApprovals = await ApprovalAssignment.find({ approver: req.user._id, status: { $ne: 'PENDING' } })
      .populate({ path: 'expense', select: 'category amountCompany currencyCompany date employee status', populate: { path: 'employee', select: 'email' } })
      .sort({ decidedAt: -1 })
      .limit(100)

    // Manager info
    const { User } = await import('../models/User.js')
    const me = await User.findById(req.user._id).populate('profile.manager', 'email role')
    const managerEmail = me?.profile?.manager?.email || null

    res.json({ myExpenses, myApprovals, managerEmail })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Activity fetch failed' })
  }
})

export default router
