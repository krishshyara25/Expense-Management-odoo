// Reusable Header component
export default function Header({ title, user, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>{title}</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.firstName} {user.lastName}</span>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}