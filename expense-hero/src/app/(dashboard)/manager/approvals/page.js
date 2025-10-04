// src/app/(dashboard)/manager/approvals/page.js
import Link from 'next/link';

// Manager Approval Dashboard
export default function ManagerApprovalsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Expense Approvals Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link 
            href="/manager/users"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Manage Employees
          </Link>
          <Link 
            href="/employee/submit" // Managers can also submit expenses
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Submit Expense
          </Link>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Pending Approvals (To be implemented)</h2>
      <div className="p-10 border rounded-lg bg-gray-50 dark:bg-gray-700">
        <p className="text-gray-600 dark:text-gray-300">
          The list of expenses awaiting your approval will be displayed here.
        </p>
      </div>
    </div>
  );
}