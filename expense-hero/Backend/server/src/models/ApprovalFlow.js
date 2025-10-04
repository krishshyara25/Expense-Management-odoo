import mongoose from 'mongoose';

const approvalStepSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  approvers: [{ type: String, required: true }], // e.g., 'MANAGER' or 'USER:<id>' or 'ROLE:MANAGER'
  isManagerFirst: { type: Boolean, default: false },
});

const approvalRuleSchema = new mongoose.Schema({
  type: { type: String, enum: ['PERCENTAGE', 'SPECIFIC_APPROVER', 'HYBRID'], required: true },
  threshold: Number,
  specificApproverId: String,
  logic: { type: String, enum: ['OR', 'AND'], default: 'OR' },
});

const approvalFlowSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    steps: [approvalStepSchema],
    rules: [approvalRuleSchema],
  },
  { timestamps: true }
);

export const ApprovalFlow = mongoose.model('ApprovalFlow', approvalFlowSchema);
