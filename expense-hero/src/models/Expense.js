// src/models/Expense.js
import mongoose from 'mongoose';

const ApprovalStepSchema = new mongoose.Schema({
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Admin', 'Manager', 'Employee', 'System'] },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    comments: { type: String },
    sequenceOrder: { type: Number, required: true },
    isRequired: { type: Boolean, default: false }, // Inherited from RuleStep/ManagerFirst
    updatedAt: { type: Date }
});

const ExpenseSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    
    // Fields from Submission/OCR
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },       // Submitted amount
    currency: { type: String, required: true },     // Submitted currency
    
    // Workflow Fields
    status: { 
        type: String, 
        enum: ['Draft', 'Submitted', 'Waiting approval', 'Approved', 'Rejected'], 
        default: 'Draft' 
    },
    approvalRuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalRule' },
    approvalSteps: [ApprovalStepSchema],
    currentStepIndex: { type: Number, default: 0 },
    submittedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);