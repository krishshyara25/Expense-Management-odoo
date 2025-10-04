// src/services/WorkflowService.js
import User from '../models/User';
import Company from '../models/Company';
import ApprovalRule from '../models/ApprovalRule';
import Expense from '../models/Expense';

/**
 * Finds the correct ApprovalRule for a given expense and generates the sequence.
 */
export async function generateApprovalSteps(expenseData, employee) {
    const company = await Company.findById(employee.companyId).lean();
    
    // Rule Matching: Find best fitting rule by highest threshold amount <= expense amount
    const rule = await ApprovalRule.findOne({ 
        companyId: company._id, 
        thresholdAmount: { $lte: expenseData.amount } 
    }).sort({ thresholdAmount: -1 }).lean(); 

    // Fallback: Use Admin if no rule matches
    if (!rule) {
        const admin = await User.findOne({ companyId: employee.companyId, role: 'Admin' });
        return {
            ruleId: null,
            steps: [{
                approverId: admin._id,
                role: 'Admin',
                status: 'Pending',
                sequenceOrder: 1,
                isRequired: true,
            }]
        };
    }

    let steps = [];
    let sequenceOrder = 1;

    // 1. Check if Manager is first approver
    if (rule.isManagerFirst && employee.managerId) {
        steps.push({
            approverId: employee.managerId,
            role: 'Manager',
            status: 'Pending',
            sequenceOrder: sequenceOrder++,
            isRequired: true, 
        });
    }

    // 2. Add remaining Sequential Steps from the rule
    for (const step of rule.sequentialSteps) {
        let approverId = step.approverId;
        
        // If specific approver not set, try to find a user by role (e.g., 'Finance' or 'Director')
        if (!approverId) {
            // Simplification: Find first user with 'Manager' role for non-specific roles
            const roleApprover = await User.findOne({ companyId: employee.companyId, role: 'Manager' }); 
            if (roleApprover) approverId = roleApprover._id;
        }

        if (approverId) {
            steps.push({
                approverId: approverId,
                role: step.role,
                status: 'Pending',
                sequenceOrder: sequenceOrder++,
                isRequired: step.isRequired,
                minPercentage: step.minPercentage,
            });
        }
    }
    
    // Fallback if no steps were generated (e.g., employee has no manager and no rule steps)
    if (steps.length === 0) {
        const admin = await User.findOne({ companyId: employee.companyId, role: 'Admin' });
        steps.push({
            approverId: admin._id,
            role: 'Admin',
            status: 'Pending',
            sequenceOrder: 1,
            isRequired: true,
        });
    }
    
    return { ruleId: rule._id, steps };
}

/**
 * Core function to process an approval or rejection step.
 */
export async function processApprovalStep(expense, stepIndex, status, comments, approverId) {
    // Find the step by the sequence index
    const step = expense.approvalSteps[stepIndex]; 

    if (!step || step.approverId.toString() !== approverId.toString() || step.status !== 'Pending') {
        throw new Error('Invalid or un-authorized approval step or already processed.');
    }

    // 1. Update the current step
    expense.approvalSteps[stepIndex].status = status;
    expense.approvalSteps[stepIndex].comments = comments;
    expense.approvalSteps[stepIndex].updatedAt = new Date();

    // Check for immediate REJECTION (by any approver)
    if (status === 'Rejected') {
        expense.status = 'Rejected';
    } else {
        // 2. Approval Logic
        
        // Find the next sequential pending step
        const nextStepIndex = expense.approvalSteps.findIndex(s => s.status === 'Pending' && s.sequenceOrder > stepIndex + 1);

        if (nextStepIndex !== -1) {
            // Move to the next sequential step
            expense.currentStepIndex = nextStepIndex;
        } else {
            // No more sequential steps, check overall completion/conditional rules
            
            const approvedSteps = expense.approvalSteps.filter(s => s.status === 'Approved');
            const totalRequiredApprovers = expense.approvalSteps.length;
            
            // Basic completion check
            let shouldApprove = (approvedSteps.length === totalRequiredApprovers);
            
            // Check Hybrid/Percentage Rule fulfillment
            if (!shouldApprove && expense.approvalRuleId) {
                const rule = await ApprovalRule.findById(expense.approvalRuleId);
                const totalApproveableSteps = expense.approvalSteps.length; // Max possible approvals
                
                // Specific Approver Rule check: Any step marked as isRequired
                const requiredApproversApproved = expense.approvalSteps
                    .filter(s => s.isRequired)
                    .every(s => s.status === 'Approved');

                // Percentage Rule check
                const minPercentage = rule.sequentialSteps.reduce((max, r) => Math.max(max, r.minPercentage || 0), 0);
                const percentageApproved = (approvedSteps.length / totalApproveableSteps) * 100;
                
                // Hybrid Logic (Required Approvers AND/OR Percentage)
                if (requiredApproversApproved || percentageApproved >= minPercentage) {
                    shouldApprove = true;
                }
            }

            if (shouldApprove) {
                expense.status = 'Approved';
                expense.currentStepIndex = totalRequiredApprovers; // Mark as finished
            }
        }
    }

    await expense.save();
    return expense;
}