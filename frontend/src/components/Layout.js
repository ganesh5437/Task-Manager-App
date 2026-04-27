import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">TF</div>
          <h1>TaskFlow</h1>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Main Menu</div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">✅</span> Tasks
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📁</span> Projects
          </NavLink>
          <div className="nav-section">Account</div>
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">👤</span> Profile
          </NavLink>
          <button className="nav-link" onClick={handleLogout}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => { navigate('/profile'); setSidebarOpen(false); }}>
            <div className="avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{user?.name || 'User'}</div>
              <div className="email">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div>
              <h2>{title}</h2>
              {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
            </div>
          </div>
          <div className="topbar-right">
            <div className="avatar" onClick={() => navigate('/profile')} style={{cursor:'pointer'}}>{initials}</div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
export default Layout;
