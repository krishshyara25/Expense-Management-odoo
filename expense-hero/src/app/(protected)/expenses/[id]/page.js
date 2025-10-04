// src/app/(protected)/expenses/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import ExpenseCard from '@/components/ExpenseCard';

export default function ExpenseDetailPage({ params }) {
  const { user, isLoading } = useAuth();
  const [expense, setExpense] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  const expenseId = params.id;

  if (!isLoading && !user) {
    redirect('/login');
    return null;
  }

  useEffect(() => {
    if (user && expenseId) {
      const fetchExpense = async () => {
        try {
          // GET /expenses/:id
          const data = await apiFetch(`expenses/${expenseId}`);
          setExpense(data);
        } catch (err) {
          console.error('Failed to fetch expense:', err);
          setError(err.message || 'Could not load expense details.');
        } finally {
          setDataLoading(false);
        }
      };
      fetchExpense();
    }
  }, [user, expenseId]);

  if (isLoading || dataLoading) {
    return <div className="text-center py-10">Loading expense details...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (!expense) {
    return <div className="text-center py-10 text-gray-600">Expense not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Expense Details</h1>
      <ExpenseCard expense={expense} showApprover={false}>
        {/* User actions here (e.g., delete/edit if status is 'Draft') */}
        {expense.status === 'Draft' && (
          <p className="text-sm text-gray-500">
            This expense is a draft. You can continue editing or delete it.
          </p>
        )}
      </ExpenseCard>
    </div>
  );
}