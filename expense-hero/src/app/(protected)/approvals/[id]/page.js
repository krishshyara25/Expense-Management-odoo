// src/app/(protected)/approvals/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { redirect, useRouter } from 'next/navigation';
import ExpenseCard from '@/components/ExpenseCard';

export default function ApprovalReviewPage({ params }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [expense, setExpense] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');

  const expenseId = params.id;

  if (!isLoading && !user) {
    redirect('/login');
    return null;
  }
  
  // Guard for non-approvers
  if (!isLoading && user && user.role !== 'approver' && user.role !== 'admin') {
      redirect('/dashboard');
      return null;
  }

  const fetchExpense = async () => {
    setDataLoading(true);
    try {
      // GET /approvals/:expenseId - Fetches the expense targeted for approval
      const data = await apiFetch(`approvals/${expenseId}`);
      setExpense(data);
    } catch (err) {
      console.error('Failed to fetch approval expense:', err);
      setError(err.message || 'Could not load expense for approval.');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && expenseId) {
      fetchExpense();
    }
  }, [user, expenseId]);

  const handleApprovalAction = async (action) => {
    setIsProcessing(true);
    setError(null);
    try {
      // POST /approvals/:expenseId
      await apiFetch(`approvals/${expenseId}`, {
        method: 'POST',
        body: JSON.stringify({ action, note: approvalNote }), // action: 'approve' or 'reject'
      });
      
      // Navigate away or refresh data
      alert(`Expense ${action}d successfully!`);
      router.push('/dashboard'); 
    } catch (err) {
      console.error(`Failed to ${action} expense:`, err);
      setError(err.message || `Action failed. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || dataLoading) {
    return <div className="text-center py-10">Loading approval review...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (!expense || expense.status !== 'Pending') {
    return <div className="text-center py-10 text-gray-600">This expense is not pending your review or has already been processed.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Review Expense for Approval</h1>
      <ExpenseCard expense={expense} showApprover={true}>
        <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-700">Action:</h4>
            
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Approval/Rejection Note (Optional)
              </label>
              <textarea
                id="note"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Enter reason for rejection or any special comments..."
              ></textarea>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleApprovalAction('approve')}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleApprovalAction('reject')}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </button>
            </div>
        </div>
      </ExpenseCard>
    </div>
  );
}