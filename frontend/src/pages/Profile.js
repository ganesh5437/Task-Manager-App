import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';

function Profile() {
  const { user, token, updateUser } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => { setName(user?.name || ''); }, [user]);
  useEffect(() => {
    axios.get('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data)).catch(() => {});
  }, [token]);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await axios.put('/api/users/profile', { name }, { headers: { Authorization: `Bearer ${token}` } });
      updateUser(res.data); addToast('Profile updated', 'success');
    } catch (err) { addToast('Failed to update profile', 'error'); }
    finally { setSaving(false); }
  };

  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <Layout title="Profile" subtitle="Manage your account settings">
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar lg">{initials}</div>
          <div className="profile-info">
            <h3>{user?.name || 'User'}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Account Settings</div>
          <form className="profile-form" onSubmit={save}>
            <div className="form-group"><label>Full Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
            <div className="form-group"><label>Email Address</label><input value={user?.email || ''} disabled style={{opacity:.6}} /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
        <div className="profile-stats">
          <div className="profile-stat"><div className="value">{stats?.totalTasks || 0}</div><div className="label">Total Tasks</div></div>
          <div className="profile-stat"><div className="value">{stats?.completedTasks || 0}</div><div className="label">Completed</div></div>
          <div className="profile-stat"><div className="value">{stats?.totalProjects || 0}</div><div className="label">Projects</div></div>
        </div>
      </div>
    </Layout>
  );
}
export default Profile;
