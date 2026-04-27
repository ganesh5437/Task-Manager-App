import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-hero">
        <h1>ReqSystem Platform</h1>
        <p>The industry standard for managing company applications and connection requests. Join thousands of candidates and companies today.</p>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p>Please enter your details to sign in.</p>
          
          {error && (
            <div className="alert alert-error">
              <span style={{fontSize: '1.25rem'}}>⚠️</span> {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '1rem', marginTop: '0.5rem', fontSize: '1rem'}} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div style={{textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)'}}>
            Don't have an account? <Link to="/register" style={{fontWeight: 600}}>Sign up now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;