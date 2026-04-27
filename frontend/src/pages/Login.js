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

  const loginUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/users/login', { email, password });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="logo">TaskFlow</div>
          <p>Enterprise-grade project management for modern teams and organizations.</p>
          <div className="features">
            <div className="feat"><div className="feat-icon">📊</div> Real-time analytics & insights</div>
            <div className="feat"><div className="feat-icon">📁</div> Project-based task organization</div>
            <div className="feat"><div className="feat-icon">⚡</div> Priority & status tracking</div>
            <div className="feat"><div className="feat-icon">🔒</div> Secure & authenticated access</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to your TaskFlow account</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={loginUser}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{width:'100%',marginTop:8}} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-link">Don't have an account? <Link to="/register">Create account</Link></p>
        </div>
      </div>
    </div>
  );
}
export default Login;