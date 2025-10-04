// src/app/(dashboard)/employee/history/page.js
'use client';
import { useState, useEffect } from 'react';
import Table from '../../../../components/common/Table';

export default function EmployeeHistoryPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () => localStorage.getItem('authToken');

    const fetchExpenses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/expenses', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (response.status === 401) throw new Error("Unauthorized. Please log in.");
            if (!response.ok) throw new Error("Failed to fetch expenses.");
            
            const data = await response.json();
            setExpenses(data);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const columns = [
        { header: 'Date', key: 'date', render: (date) => new Date(date).toLocaleDateString() },
        { header: 'Description', key: 'description' },
        { header: 'Category', key: 'category', render: (c) => c.charAt(0).toUpperCase() + c.slice(1) },
        { header: 'Submitted Amount', key: 'amount', render: (amount, row) => `${row.currency} ${amount.toFixed(2)}` },
        { header: 'Base Amount', key: 'convertedAmount', render: (amount, row) => `${row.baseCurrency} ${amount.toFixed(2)}` },
        { header: 'Status', key: 'status', render: (status) => (
            <span className={`p-1 rounded text-white ${
                status === 'Approved' ? 'bg-green-600' : 
                status === 'Rejected' ? 'bg-red-600' : 
                status === 'Waiting approval' ? 'bg-yellow-600' : 'bg-gray-600'
            }`}>
                {status}
            </span>
        ) },
        { header: 'Submitted', key: 'submittedAt', render: (date) => new Date(date).toLocaleString() },
    ];

    if (loading) return <div className="p-4">Loading expense history...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Employee Expense History</h1>
            
            {expenses.length === 0 ? (
                <div className="text-center p-10 border rounded-lg bg-gray-50 dark:bg-gray-700">
                    You have no expense records. Submit a new expense to get started.
                </div>
            ) : (
                <Table columns={columns} data={expenses} />
            )}
        </div>
    );
}
