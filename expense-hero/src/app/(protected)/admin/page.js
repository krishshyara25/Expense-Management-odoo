// src/app/(protected)/admin/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';

const userRoles = ['employee', 'approver', 'admin'];

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Protection Guard
  if (!isLoading && !user) {
    redirect('/login');
    return null;
  }
  if (!isLoading && user && user.role !== 'admin') {
    redirect('/dashboard');
    return null;
  }

  const fetchUsers = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    try {
      // GET /admin/users
      const usersData = await apiFetch('admin/users'); 
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load user list.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, fetchUsers]);
  
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setStatusMessage(null);
    try {
      // PUT /admin/users/:id/role
      const updatedUser = await apiFetch(`admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });

      setUsers(users.map(u => u._id === userId ? updatedUser : u));
      setStatusMessage({ type: 'success', text: `Role for ${updatedUser.email} updated to ${newRole}.` });
    } catch (err) {
      console.error('Role update failed:', err);
      setStatusMessage({ type: 'error', text: `Failed to update role: ${err.message}` });
    }
  };

  if (isLoading || dataLoading) {
    return <div className="text-center py-10">Loading Admin Panel...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Admin Dashboard</h1>

      {statusMessage && (
        <div className={`p-4 rounded-md ${statusMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {statusMessage.text}
        </div>
      )}

      {/* User Management Section */}
      <div className="bg-white shadow-xl sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-2xl leading-6 font-medium text-gray-900">User Management</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage user roles and permissions.</p>
        </div>
        
        {error ? (
            <div className="p-6 text-red-600">{error}</div>
        ) : (
            <div className="p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name/Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {u.name || 'N/A'} <br/>
                                        <span className="text-gray-500">{u.email}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {u._id !== user._id ? ( // Cannot change own role
                                            <select
                                                defaultValue={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                                disabled={dataLoading}
                                            >
                                                {userRoles.map(role => (
                                                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-gray-400">Current User</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>

      {/* Future Admin Sections (e.g., Company, Approval Flow Management) */}
      <div className="text-gray-500 p-4 border rounded-lg bg-yellow-50">
          *Note: Sections for Company, Exchange Rate, and Approval Flow Management can be built here using the respective routes from the backend (e.g., `/admin/company`, `/admin/approval-flows`, etc.).
      </div>
    </div>
  );
}