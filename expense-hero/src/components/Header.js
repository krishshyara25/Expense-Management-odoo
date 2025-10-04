// src/components/Header.js
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
          ExpenseFlow
        </Link>
        {user && (
          <nav className="flex space-x-6 items-center">
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
              Dashboard
            </Link>
            <Link href="/expenses/new" className="text-gray-700 hover:text-indigo-600">
              Submit Expense
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin" className="text-gray-700 hover:text-indigo-600">
                Admin
              </Link>
            )}
            <div className="text-sm text-gray-500">
              Hi, {user.name || user.email.split('@')[0]}
            </div>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}