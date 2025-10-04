// src/app/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        
        // Determine redirect path
        let redirectPath = '/';
        if (payload.role === 'admin') {
          redirectPath = '/admin/users';
        } else if (payload.role === 'manager') {
          redirectPath = '/manager/approvals';
        } else if (payload.role === 'employee') {
          redirectPath = '/employee/history';
        }

        // FIX: Call router.refresh() before push for clean navigation
        router.refresh(); 
        router.push(redirectPath);
        
        // Return null here to stop rendering the component
        // until the navigation is complete.
        return; 

      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is set but the redirect hasn't fully completed yet, 
  // return null or the loading screen to avoid flicker. 
  // The logic in useEffect above should now prevent it from reaching here and showing "Redirecting..."
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Expense Hero
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Streamline your expense management with intelligent approval workflows, 
            OCR receipt processing, and real-time currency conversion.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Smart Approval Workflow</h3>
            <p className="text-gray-600">
              Configure complex approval rules with sequential steps, percentage requirements, 
              and role-based approvals.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">OCR Receipt Processing</h3>
            <p className="text-gray-600">
              Upload receipt images and automatically extract expense details 
              using advanced OCR technology.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Multi-Currency Support</h3>
            <p className="text-gray-600">
              Handle expenses in multiple currencies with real-time conversion 
              to your company's base currency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}