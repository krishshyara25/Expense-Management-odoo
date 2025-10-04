// src/app/(protected)/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  if (!isLoading && !user) {
    redirect('/login');
    return null; // Stop rendering
  }

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch user's submitted expenses
          const expensesData = await apiFetch('expenses');
          setExpenses(expensesData.slice(0, 5)); // Show recent 5

          // Fetch pending approvals (only if user is an approver)
          if (user.role === 'approver' || user.role === 'admin') {
            const approvalsData = await apiFetch('approvals');
            setApprovals(approvalsData.slice(0, 5)); // Show recent 5
          }
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
          // Handle error (e.g., show a toast/notification)
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (isLoading || dataLoading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome Back, {user.name || user.email}!
      </h1>
      <Link
        href="/expenses/new"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
      >
        + Submit New Expense
      </Link>

      {/* --- Recent Expenses Card --- */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Recent Submissions</h3>
        </div>
        <div className="border-t border-gray-200">
          {expenses.length === 0 ? (
            <p className="p-4 text-gray-500">No recent expenses found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <li key={expense._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">{expense.description}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()} &middot; Status: {expense.status}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* --- Approvals Pending Card (Only for approvers/admins) --- */}
      {(user.role === 'approver' || user.role === 'admin') && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Approvals</h3>
          </div>
          <div className="border-t border-gray-200">
            {approvals.length === 0 ? (
              <p className="p-4 text-gray-500">No expenses awaiting your approval.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {approvals.map((approval) => (
                  <li key={approval._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        Approval needed for: {approval.user.name || approval.user.email}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {approval.description} &middot; {approval.currency} {approval.amount.toFixed(2)}
                      </p>
                    </div>
                    <Link
                        href={`/approvals/${approval._id}`} // Link to a detail page
                        className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md"
                    >
                        Review
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}