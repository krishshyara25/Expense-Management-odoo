// src/components/ExpenseCard.js
import React from 'react';
import Link from 'next/link';

const statusStyles = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Draft: 'bg-gray-100 text-gray-800',
};

export default function ExpenseCard({ expense, showApprover, children }) {
  const statusClassName = statusStyles[expense.status] || 'bg-blue-100 text-blue-800';

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
        <div>
          <h3 className="text-2xl leading-6 font-bold text-gray-900">
            {expense.description}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {expense.category}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusClassName}`}>
          {expense.status}
        </span>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-lg font-bold text-gray-900 sm:mt-0 sm:col-span-2">
              {expense.currency} {parseFloat(expense.amount).toFixed(2)}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Date Submitted</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {new Date(expense.date).toLocaleDateString()}
            </dd>
          </div>
          {showApprover && expense.user && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {expense.user.name || expense.user.email}
              </dd>
            </div>
          )}
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Receipt</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {expense.receiptUrl ? (
                <a 
                  href={expense.receiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  View Receipt
                </a>
              ) : (
                <span className="text-gray-400">No Receipt Uploaded</span>
              )}
            </dd>
          </div>
          {expense.currentApprover && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Approver</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {expense.currentApprover.name || expense.currentApprover.email}
              </dd>
            </div>
          )}
        </dl>
      </div>
      
      {/* Action/Approval Slot */}
      {children && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}