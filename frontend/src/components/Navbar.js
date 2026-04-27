import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="nav-brand">
        🏢 <span>ReqSystem</span>
      </Link>
      
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
            {user.role === 'user' && (
              <Link to="/companies" className={location.pathname === '/companies' ? 'active' : ''}>Explore Companies</Link>
            )}
            
            <div className="user-profile-badge">
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                <span style={{fontWeight: 700, color: 'var(--secondary)', fontSize: '0.9rem'}}>{user.name}</span>
                <span className={`badge ${user.role === 'company_admin' ? 'badge-admin' : ''}`} style={{fontSize: '0.65rem', padding: '0.15rem 0.5rem', marginTop: '0.2rem', background: user.role !== 'company_admin' ? 'var(--bg-main)' : undefined, border: user.role !== 'company_admin' ? '1px solid var(--border)' : undefined, color: user.role !== 'company_admin' ? 'var(--text-muted)' : undefined}}>
                  {user.role === 'company_admin' ? 'Administrator' : 'Candidate'}
                </span>
              </div>
              <div className="user-avatar">{getInitials(user.name)}</div>
              <button onClick={handleLogout} className="btn btn-outline" style={{padding: '0.4rem 0.75rem', marginLeft: '0.5rem'}}>Log out</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Sign In</Link>
            <Link to="/register" className="btn btn-primary">Create Account</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
