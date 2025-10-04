// src/app/(dashboard)/layout.js
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import Header from '../../components/common/Header';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            // Note: Decoding locally is for convenience/UI, proper auth check is server-side
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ firstName: payload.role, lastName: 'User', role: payload.role }); // Simplified user object
            setLoading(false);
        } catch (error) {
            console.error("Token decoding failed:", error);
            localStorage.removeItem('authToken');
            router.push('/login');
        }
    };

    useEffect(() => {
        checkAuth();
        // Run on mount and when token changes (though token changes require manual handling or context)
    }, []); 

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading Dashboard...</div>
            </div>
        );
    }
    
    // Simple check: if not logged in, wait for router.push to redirect
    if (!user) return null; 

    return (
        <div className="min-h-screen flex flex-col">
            <Header 
                title="Expense Hero Dashboard" 
                user={user} 
                onLogout={handleLogout} 
            />
            <main className="flex-grow p-4">
                {children}
            </main>
        </div>
    );
}