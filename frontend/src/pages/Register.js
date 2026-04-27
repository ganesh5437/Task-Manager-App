import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 8 ? 2 : 3;
  const strengthColor = ['#ef4444', '#f59e0b', '#22c55e'][strength - 1] || '#2a2e3d';

  const registerUser = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters"); return; }
    setLoading(true);
    try {
      await axios.post('/api/users/register', { email, password, name });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration Failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="logo">TaskFlow</div>
          <p>Join thousands of teams managing their projects efficiently with TaskFlow.</p>
          <div className="features">
            <div className="feat"><div className="feat-icon">🚀</div> Get started in under 60 seconds</div>
            <div className="feat"><div className="feat-icon">📈</div> Track progress with analytics</div>
            <div className="feat"><div className="feat-icon">🎯</div> Stay focused on priorities</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create account</h2>
          <p className="auth-subtitle">Start managing your projects today</p>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={registerUser}>
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
              {password && <div className="password-strength"><div className="bar" style={{width: `${strength*33}%`, background: strengthColor}} /></div>}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{width:'100%',marginTop:8}} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-link">Already have an account? <Link to="/">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
export default Register;