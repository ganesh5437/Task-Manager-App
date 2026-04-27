import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const circumference = 2 * Math.PI * 52;
  const offset = stats ? circumference - (stats.completionRate / 100) * circumference : circumference;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (loading) return <Layout title="Dashboard"><div className="loading-spinner"><div className="spinner" /></div></Layout>;

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name || 'User'}`}>
      <div className="stats-grid">
        <div className="stat-card primary"><div className="stat-icon">📋</div><div className="stat-value">{stats?.totalTasks || 0}</div><div className="stat-label">Total Tasks</div></div>
        <div className="stat-card success"><div className="stat-icon">✅</div><div className="stat-value">{stats?.completedTasks || 0}</div><div className="stat-label">Completed</div></div>
        <div className="stat-card warning"><div className="stat-icon">⏳</div><div className="stat-value">{stats?.inProgressTasks || 0}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card danger"><div className="stat-icon">🚨</div><div className="stat-value">{stats?.overdueTasks || 0}</div><div className="stat-label">Overdue</div></div>
      </div>

      <div className="progress-section">
        <div className="card">
          <div className="card-title">Completion Rate</div>
          <div className="progress-ring-container">
            <div className="progress-ring">
              <svg width="120" height="120"><circle cx="60" cy="60" r="52" className="ring-bg"/><circle cx="60" cy="60" r="52" className="ring-fill" strokeDasharray={circumference} strokeDashoffset={offset}/></svg>
              <div className="ring-text"><span className="ring-value">{stats?.completionRate || 0}%</span><span className="ring-label">Complete</span></div>
            </div>
            <div>
              <div style={{fontSize:14,color:'var(--text2)',marginBottom:8}}>{stats?.completedTasks} of {stats?.totalTasks} tasks done</div>
              <div style={{fontSize:13,color:'var(--text3)'}}>{stats?.totalProjects || 0} active projects</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Tasks by Priority</div>
          <div className="priority-bars">
            {[{l:'Urgent',k:'urgent',c:'#f43f5e'},{l:'High',k:'high',c:'#f97316'},{l:'Medium',k:'medium',c:'#f59e0b'},{l:'Low',k:'low',c:'#22c55e'}].map(p=>(
              <div className="priority-bar" key={p.k}>
                <span className="label">{p.l}</span>
                <div className="bar-track"><div className="bar-fill" style={{width:`${stats?.totalTasks?((stats.tasksByPriority[p.k]||0)/stats.totalTasks*100):0}%`,background:p.c}}/></div>
                <span className="count">{stats?.tasksByPriority?.[p.k]||0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Recent Activity</div>
        {stats?.recentTasks?.length === 0 && <div className="empty-state"><p>No tasks yet. Create your first task!</p></div>}
        <div className="task-list">
          {stats?.recentTasks?.map(t => (
            <div className={`task-card ${t.status === 'completed' ? 'completed' : ''}`} key={t._id}>
              <div className={`task-checkbox ${t.status === 'completed' ? 'checked' : ''}`}>{t.status === 'completed' ? '✓' : ''}</div>
              <div className="task-info">
                <h4 className={t.status === 'completed' ? 'done' : ''}>{t.title}
                  <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                </h4>
                <div className="task-meta">
                  <span className={`status-badge status-${t.status}`}>{t.status}</span>
                  {t.deadline && <span>📅 {formatDate(t.deadline)}</span>}
                  {t.project && <span className="project-tag"><span className="dot" style={{background:t.project.color}}/>{t.project.name}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
export default Dashboard;