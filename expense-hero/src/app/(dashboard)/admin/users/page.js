// src/app/(dashboard)/admin/users/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import Table from '../../../../components/common/Table';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter(); // Initialize router
    
    // State for the creation form
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('employee');
    const [newUserManager, setNewUserManager] = useState('');

    // Utility function to get the token (in a real app, use React Context or a hook)
    const getToken = () => localStorage.getItem('authToken');

    const fetchUsers = async () => {
        const token = getToken();
        if (!token) {
            setError("Authentication token missing.");
            router.push('/login'); // Redirect to login if token is missing
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                // If unauthorized/forbidden by the server, remove token and redirect
                localStorage.removeItem('authToken');
                router.push('/login');
                throw new Error("Session expired or unauthorized access.");
            }
            if (!response.ok) throw new Error("Failed to fetch users.");
            
            const data = await response.json();
            setUsers(data);
            setManagers(data.filter(u => u.role === 'manager'));
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        
        const managerEmail = newUserRole === 'employee' ? newUserManager : null;

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}` 
                },
                body: JSON.stringify({ 
                    name: newUserName, 
                    email: newUserEmail, 
                    role: newUserRole, 
                    managerEmail: managerEmail 
                })
            });

            if (!response.ok) throw new Error((await response.json()).message || "Failed to create user.");
            
            const data = await response.json();
            alert(`User created! Temporary Password: ${data.user.tempPassword}`);
            
            // Reset form and refresh
            setNewUserName('');
            setNewUserEmail('');
            setNewUserRole('employee');
            setNewUserManager('');
            fetchUsers();

        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    // Table Columns definition
    const columns = [
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Role', key: 'role', render: (role) => <span className={`tag tag-${role} p-1 rounded bg-opacity-70 ${role === 'admin' ? 'bg-red-500' : role === 'manager' ? 'bg-blue-500' : 'bg-green-500'}`}>{role.toUpperCase()}</span> },
        { header: 'Manager', key: 'managerId', render: (manager) => manager ? manager.name : 'N/A' },
    ];

    if (loading) return <div className="p-4">Loading users...</div>;
    // Only show the error if it's not the redirection error
    if (error && error !== "Session expired or unauthorized access." && error !== "Authentication token missing.") return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin User Management</h1>
            
            <form onSubmit={handleCreateUser} className="mb-8 p-6 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Create New Employee/Manager</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} required className="p-2 border rounded" />
                    <input type="email" placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required className="p-2 border rounded" />
                    
                    <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required className="p-2 border rounded">
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                    </select>

                    {newUserRole === 'employee' && (
                        <select value={newUserManager} onChange={e => setNewUserManager(e.target.value)} className="p-2 border rounded">
                            <option value="">Select Manager (Optional)</option>
                            {managers.map(manager => (
                                <option key={manager._id} value={manager.email}>
                                    {manager.name} ({manager.email})
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <button type="submit" className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Create User
                </button>
            </form>

            <h2 className="text-2xl font-semibold mb-4">All Users ({users.length})</h2>
            <Table columns={columns} data={users} />
        </div>
    );
}