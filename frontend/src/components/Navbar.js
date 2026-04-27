import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="nav-brand">
        🏢 ReqSystem
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.role === 'user' && <Link to="/companies">Companies</Link>}
            <div style={{marginLeft:'1rem', display:'flex', alignItems:'center', gap:'1rem'}}>
              <span style={{fontWeight:600, color:'var(--primary)'}}>{user.name}</span>
              <span className="badge badge-pending" style={{background:'var(--bg-main)', color:'var(--text-muted)', border:'1px solid var(--border)'}}>
                {user.role === 'company_admin' ? 'Admin' : 'User'}
              </span>
              <button onClick={handleLogout} className="btn btn-outline" style={{padding:'0.25rem 0.75rem'}}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
