import mongoose from 'mongoose';

const approvalAssignmentSchema = new mongoose.Schema(
  {
    expense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true },
    stepId: { type: String, required: true },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    comment: String,
    decidedAt: Date,
  },
  { timestamps: true }
);

export const ApprovalAssignment = mongoose.model('ApprovalAssignment', approvalAssignmentSchema);
