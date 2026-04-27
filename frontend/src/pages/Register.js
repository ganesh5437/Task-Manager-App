import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/register', form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-hero" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'}}>
        <h1>Start your journey</h1>
        <p>Create an account to browse top industry companies, view their employees, and send connection applications directly to their administration teams.</p>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-card">
          <h2>Create an account</h2>
          <p>Enter your information to get started.</p>
          
          {error && (
            <div className="alert alert-error">
              <span style={{fontSize: '1.25rem'}}>⚠️</span> {error}
            </div>
          )}
          
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="name@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Create a strong password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={4}/>
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="user">Candidate (Apply to Companies)</option>
                <option value="company_admin">Company Administrator (Manage Requests)</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '1rem', marginTop: '0.5rem', fontSize: '1rem'}} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          
          <div style={{textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)'}}>
            Already have an account? <Link to="/" style={{fontWeight: 600}}>Log in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;