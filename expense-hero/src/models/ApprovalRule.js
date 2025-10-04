// src/models/ApprovalRule.js
import mongoose from 'mongoose';

const RuleStepSchema = new mongoose.Schema({
    sequenceOrder: { type: Number, required: true },
    role: { type: String, enum: ['Manager', 'Finance', 'Director'], default: 'Manager' }, // Role placeholder
    isRequired: { type: Boolean, default: false }, // Specific approver rule (Required)
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Specific approver ID
});

const ApprovalRuleSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    thresholdAmount: { type: Number, default: 0 }, // For different thresholds
    
    // Core Approval Logic Fields
    isManagerFirst: { type: Boolean, default: false }, // Is manager the first approver
    minPercentage: { type: Number, default: 0 },     // Percentage rule (e.g., 60%)
    
    // Hybrid Logic: Steps are required AND must meet percentage rule
    sequentialSteps: [RuleStepSchema], 
}, { timestamps: true });

export default mongoose.models.ApprovalRule || mongoose.model('ApprovalRule', ApprovalRuleSchema);