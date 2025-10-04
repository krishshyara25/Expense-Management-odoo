// src/components/auth/LoginForm.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

// Note: The backend authenticates purely on email/password, 
// but we use the selected role here for initial client-side routing convenience.

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    selectedRole: 'employee' // Default to employee
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Only sending email and password to the API
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      // Success: Store token
      localStorage.setItem('authToken', data.token);
      
      // Determine actual role from token payload (safest method)
      const decodedUser = jwt.decode(data.token);
      const actualRole = decodedUser ? decodedUser.role : formData.selectedRole;
      
      let redirectPath = '/';
      if (actualRole === 'admin') redirectPath = '/admin/users';
      else if (actualRole === 'manager') redirectPath = '/manager/approvals';
      else if (actualRole === 'employee') redirectPath = '/employee/history';
      
      setMessage(`Login successful as ${actualRole.toUpperCase()}. Redirecting...`);
      
      // FIX: Call router.refresh() to clear the router cache before redirecting
      router.refresh(); 
      router.push(redirectPath);

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-xl space-y-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-extrabold text-center text-indigo-600 dark:text-indigo-400">Sign In</h2>
      
      <div className="form-group space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="form-group space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      {/* New Role Selector Field */}
      <div className="form-group space-y-1">
        <label htmlFor="selectedRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Role for Login</label>
        <select
          id="selectedRole"
          value={formData.selectedRole}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      {message && <p className={`mt-4 text-center text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        First time setup? <a href="/signup" className="text-indigo-600 hover:underline font-medium">Create Company & Admin</a>
      </p>
    </form>
  );
}