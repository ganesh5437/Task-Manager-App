import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

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
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p>Join our platform today</p>
          
          {error && <div className="error-msg">{error}</div>}
          
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={4}/>
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="user">Candidate / User</option>
                <option value="company_admin">Company Administrator</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{width:'100%', padding:'0.75rem', marginTop:'1rem'}} disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
          
          <div style={{textAlign:'center', marginTop:'1.5rem', fontSize:'0.875rem'}}>
            Already have an account? <Link to="/">Login here</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;