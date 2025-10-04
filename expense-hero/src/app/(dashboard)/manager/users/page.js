// src/app/(dashboard)/manager/users/page.js
'use client';
import { useState, useEffect } from 'react';
import Table from '../../../../components/common/Table';
import Link from 'next/link';

export default function ManagerUsersPage() {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for the creation form
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    // Role is fixed to 'employee' on this page
    
    const getToken = () => localStorage.getItem('authToken');

    const fetchTeamMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch team members from the manager-specific API
            const response = await fetch('/api/manager/users', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (response.status === 401) throw new Error("Unauthorized. Please log in.");
            if (!response.ok) throw new Error("Failed to fetch team members.");
            
            const data = await response.json();
            setTeamMembers(data);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        
        try {
            // Post to the manager API route
            const response = await fetch('/api/manager/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}` 
                },
                body: JSON.stringify({ 
                    name: newUserName, 
                    email: newUserEmail, 
                    // role is implicitly 'employee' and managerId is set on the backend
                })
            });

            if (!response.ok) throw new Error((await response.json()).message || "Failed to create employee.");
            
            const data = await response.json();
            alert(`Employee created! Temporary Password: ${data.user.tempPassword}`);
            
            // Reset form and refresh
            setNewUserName('');
            setNewUserEmail('');
            fetchTeamMembers();

        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, []);
    
    // Table Columns definition
    const columns = [
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Role', key: 'role', render: (role) => <span className={`tag tag-${role} p-1 rounded bg-opacity-70 ${role === 'employee' ? 'bg-green-500' : 'bg-gray-500'}`}>{role.toUpperCase()}</span> },
        { header: 'Joined', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
    ];

    if (loading) return <div className="p-4">Loading team members...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <Link href="/manager/approvals" className="text-indigo-600 hover:underline mb-4 block">
                &larr; Back to Approvals Dashboard
            </Link>
            <h1 className="text-3xl font-bold mb-6">Team Management (Manager)</h1>
            
            <form onSubmit={handleCreateUser} className="mb-8 p-6 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Add New Employee</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} required className="p-2 border rounded" />
                    <input type="email" placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required className="p-2 border rounded" />
                </div>
                <div className="mt-4 text-gray-600 dark:text-gray-300">
                    *New user will be automatically assigned the **Employee** role and report to you.
                </div>
                <button type="submit" className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Create Employee Account
                </button>
            </form>

            <h2 className="text-2xl font-semibold mb-4">My Team ({teamMembers.length})</h2>
            <Table columns={columns} data={teamMembers} />
        </div>
    );
}