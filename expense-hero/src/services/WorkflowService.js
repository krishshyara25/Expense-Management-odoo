// Core approval logic (Phase 3)
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import Company from '../models/Company.js';

class WorkflowService {
  async submitExpenseForApproval(expenseId, employeeId) {
    try {
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.employeeId.toString() !== employeeId) {
        throw new Error('Unauthorized');
      }

      const employee = await User.findById(employeeId);
      const company = await Company.findById(employee.companyId);

      // Determine approval workflow
      const approvers = await this.getApprovers(employee, company, expense.amount);
      
      // Create approval entries
      expense.approvals = approvers.map(approverId => ({
        approverId,
        status: 'pending'
      }));

      expense.status = 'submitted';
      expense.submittedAt = new Date();

      await expense.save();

      // Send notifications to approvers
      await this.notifyApprovers(expense, approvers);

      return expense;
    } catch (error) {
      console.error('Workflow submission error:', error);
      throw error;
    }
  }

  async getApprovers(employee, company, amount) {
    const approvers = [];

    // Single level approval - just the manager
    if (company.settings.approvalWorkflow === 'single') {
      if (employee.managerId) {
        approvers.push(employee.managerId);
      }
    } else {
      // Multi-level approval based on amount
      if (employee.managerId) {
        approvers.push(employee.managerId);
      }

      // Add higher level approvers for large amounts
      if (amount > company.settings.maxExpenseAmount) {
        const adminUsers = await User.find({
          companyId: company._id,
          role: 'admin'
        });
        adminUsers.forEach(admin => {
          if (!approvers.includes(admin._id)) {
            approvers.push(admin._id);
          }
        });
      }
    }

    return approvers;
  }

  async approveExpense(expenseId, approverId, comments) {
    try {
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }

      const approvalIndex = expense.approvals.findIndex(
        approval => approval.approverId.toString() === approverId
      );

      if (approvalIndex === -1) {
        throw new Error('Not authorized to approve this expense');
      }

      expense.approvals[approvalIndex].status = 'approved';
      expense.approvals[approvalIndex].comments = comments;
      expense.approvals[approvalIndex].approvedAt = new Date();

      // Check if all approvals are complete
      const allApproved = expense.approvals.every(
        approval => approval.status === 'approved'
      );

      if (allApproved) {
        expense.status = 'approved';
        expense.approvedAt = new Date();
      }

      await expense.save();

      // Send notification to employee
      await this.notifyEmployee(expense, 'approved');

      return expense;
    } catch (error) {
      console.error('Approval error:', error);
      throw error;
    }
  }

  async rejectExpense(expenseId, approverId, comments) {
    try {
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }

      const approvalIndex = expense.approvals.findIndex(
        approval => approval.approverId.toString() === approverId
      );

      if (approvalIndex === -1) {
        throw new Error('Not authorized to reject this expense');
      }

      expense.approvals[approvalIndex].status = 'rejected';
      expense.approvals[approvalIndex].comments = comments;
      expense.approvals[approvalIndex].approvedAt = new Date();

      expense.status = 'rejected';

      await expense.save();

      // Send notification to employee
      await this.notifyEmployee(expense, 'rejected');

      return expense;
    } catch (error) {
      console.error('Rejection error:', error);
      throw error;
    }
  }

  async getPendingApprovals(approverId) {
    try {
      const expenses = await Expense.find({
        'approvals.approverId': approverId,
        'approvals.status': 'pending',
        status: 'submitted'
      }).populate('employeeId', 'firstName lastName email');

      return expenses;
    } catch (error) {
      console.error('Get pending approvals error:', error);
      throw error;
    }
  }

  async notifyApprovers(expense, approvers) {
    // Email notification logic would go here
    // For now, just log
    console.log(`Notifying approvers for expense ${expense._id}:`, approvers);
  }

  async notifyEmployee(expense, action) {
    // Email notification logic would go here
    console.log(`Notifying employee ${expense.employeeId} that expense ${expense._id} was ${action}`);
  }
}

export default new WorkflowService();