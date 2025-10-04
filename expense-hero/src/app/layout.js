// src/app/layout.js

import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import './globals.css'; // Ensure you have this file with Tailwind imports

export const metadata = {
  title: 'ExpenseFlow | Next.js',
  description: 'Expense Management System Frontend',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <Header />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}