export default function AuthLayout({ children }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            {children}
        </div>
    );
}
