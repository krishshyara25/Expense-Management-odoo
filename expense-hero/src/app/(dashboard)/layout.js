// Shared Layout/Auth check for dashboard
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <header>
        <h1>Expense Management Dashboard</h1>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}