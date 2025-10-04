import { ApprovalFlow } from '../models/ApprovalFlow.js'
import { ApprovalAssignment } from '../models/ApprovalAssignment.js'
import { User } from '../models/User.js'

// Resolve approver identifiers to user IDs
async function resolveApprovers({ employee, companyId, approverKeys }) {
  const ids = new Set()
  const employeeDoc = await User.findById(employee).populate('profile.manager')

  for (const key of approverKeys) {
    if (!key) continue
    if (key === 'MANAGER' || key === 'ROLE:MANAGER') {
      const m = employeeDoc?.profile?.manager
      if (m) ids.add(m._id.toString())
    } else if (key.startsWith('USER:')) {
      const id = key.slice(5)
      ids.add(id)
    } else if (key.startsWith('ROLE:')) {
      const role = key.slice(5).toUpperCase()
      const users = await User.find({ company: companyId, role })
      users.forEach(u => ids.add(u._id.toString()))
    }
  }
  return Array.from(ids)
}

export async function createAssignmentsForStep({ expense, step }) {
  const approverIds = await resolveApprovers({
    employee: expense.employee,
    companyId: expense.company,
    approverKeys: step.approvers?.length ? step.approvers : ['MANAGER']
  })
  const docs = await ApprovalAssignment.insertMany(
    approverIds.map(approverId => ({
      expense: expense._id,
      stepId: step._id.toString(),
      approver: approverId,
      status: 'PENDING',
    }))
  )
  return docs
}

function computeThreshold(total, percent) {
  const need = Math.ceil((percent / 100) * total)
  return need <= 0 ? 1 : need
}

export async function evaluateAndAdvance({ expense }) {
  await expense.populate('flow')
  const flow = expense.flow || await ApprovalFlow.findOne({ _id: expense.flow })
  if (!flow) return expense
  const step = flow.steps.find(s => s.order === expense.stepOrder)
  if (!step) {
    // no more steps -> approve if still pending
    if (expense.status === 'PENDING') {
      expense.status = 'APPROVED'
      await expense.save()
    }
    return expense
  }
  const assignments = await ApprovalAssignment.find({ expense: expense._id, stepId: step._id.toString() })
  const total = assignments.length
  const approved = assignments.filter(a => a.status === 'APPROVED')
  const rejected = assignments.filter(a => a.status === 'REJECTED')

  const rules = flow.rules || []
  const hasSpecificRule = rules.some(r => r.type === 'SPECIFIC_APPROVER' || r.type === 'HYBRID')
  const specificIds = rules
    .filter(r => r.specificApproverId)
    .map(r => r.specificApproverId)

  const percentRule = rules.find(r => r.type === 'PERCENTAGE' || r.type === 'HYBRID')
  const threshold = percentRule?.threshold ? computeThreshold(total, percentRule.threshold) : total // default all approvers

  const specificApproved = assignments.some(a => a.status === 'APPROVED' && specificIds.includes(a.approver.toString()))
  const percentSatisfied = approved.length >= threshold

  let stepApproved = false
  if (rules.length === 0) {
    // default: need all approvers in the step
    stepApproved = approved.length === total
  } else {
    // HYBRID: treat as OR between percentage and specific approver
    if (hasSpecificRule && percentRule) {
      stepApproved = percentSatisfied || specificApproved
    } else if (hasSpecificRule) {
      stepApproved = specificApproved
    } else if (percentRule) {
      stepApproved = percentSatisfied
    }
  }

  // Early rejection if it's impossible to reach threshold anymore
  let impossibleToApprove = false
  if (percentRule) {
    const maxPossibleApprovals = approved.length + (total - approved.length - rejected.length)
    impossibleToApprove = maxPossibleApprovals < threshold && !specificApproved
  } else {
    // default all-approvers rule: any reject makes it impossible to get all approvals
    impossibleToApprove = rejected.length > 0 && rules.length === 0
  }

  if (rejected.length > 0 && !stepApproved && impossibleToApprove) {
    expense.status = 'REJECTED'
    await expense.save()
    return expense
  }

  if (stepApproved) {
    // Advance to next step or finalize
    const nextOrder = expense.stepOrder + 1
    const nextStep = flow.steps.find(s => s.order === nextOrder)
    if (nextStep) {
      expense.stepOrder = nextOrder
      await expense.save()
      await createAssignmentsForStep({ expense, step: nextStep })
    } else {
      expense.status = 'APPROVED'
      await expense.save()
    }
  }
  return expense
}
