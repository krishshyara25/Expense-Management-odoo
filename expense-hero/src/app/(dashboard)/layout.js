// src/app/(dashboard)/layout.js
import Navbar from '../../components/layout/Navbar';

export default function DashboardLayout({ children }) {
    return (
        <div>
            <Navbar />
            <main className="container mx-auto p-4 mt-4">
                {children}
            </main>
        </div>
    );
}