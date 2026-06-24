import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const [alert, setAlert] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const endpoint = user.role === 'company_admin' ? '/api/requests/company-requests' : '/api/requests/my-requests';
      const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, user.role]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/requests/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: 'success', message: `Request has been ${status.toLowerCase()} successfully.` });
      fetchRequests();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update request. Please try again.' });
    }
    setTimeout(() => setAlert(null), 4000);
  };

  const getBadgeClass = (status) => {
    if (status === 'Accepted') return 'badge-accepted';
    if (status === 'Rejected') return 'badge-rejected';
    return 'badge-pending';
  };

  const rejectedRequestsCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <>
      <Navbar />
      <div className="container">
        
        {alert && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <span style={{fontSize: '1.25rem'}}>{alert.type === 'success' ? '✅' : '⚠️'}</span> 
            {alert.message}
          </div>
        )}
        
        {user.role === 'user' && rejectedRequestsCount > 0 && (
          <div className="alert alert-error" style={{padding: '1.5rem', marginBottom: '2rem', alignItems: 'flex-start'}}>
            <span style={{fontSize: '2rem', marginTop: '-0.2rem'}}>⚠️</span>
            <div>
              <strong style={{fontSize: '1.1rem', display: 'block', marginBottom: '0.25rem'}}>Update on your applications</strong>
              <p style={{color: '#991b1b'}}>Your request was rejected. Please send a request to another company from the explore page.</p>
            </div>
          </div>
        )}

        <div className="page-header">
          <div>
            <h1>{user.role === 'company_admin' ? 'Manage Applications' : 'My Requests'}</h1>
            <p>{user.role === 'company_admin' ? 'Review and process incoming candidate requests.' : 'Track the status of your company connection requests.'}</p>
          </div>
          {user.role === 'user' && (
            <Link to="/companies" className="btn btn-primary">
              Explore Companies <span>→</span>
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '4rem', color: 'var(--text-muted)'}}>
            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
            Loading your data...
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state-hero">
            <div style={{fontSize: '4rem', marginBottom: '1.5rem'}}>🚀</div>
            <h2>{user.role === 'user' ? 'Ready to make your next big move?' : 'Your inbox is clear'}</h2>
            <p>
              {user.role === 'user' 
                ? 'You haven\'t sent any connection requests yet. Browse our curated list of industry leaders and submit your first application today.' 
                : 'There are currently no pending requests for the companies you manage. Check back later!'}
            </p>
            {user.role === 'user' && (
              <Link to="/companies" className="btn btn-primary" style={{padding: '0.875rem 1.5rem', fontSize: '1.05rem'}}>
                Browse Top Companies
              </Link>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{user.role === 'user' ? 'Target Company' : 'Candidate Details'}</th>
                  <th>Submission Date</th>
                  <th>Current Status</th>
                  {user.role === 'company_admin' && <th style={{textAlign: 'right'}}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req._id}>
                    <td>
                      {user.role === 'user' ? (
                        <div className="td-company-info">
                          <span className="company-emoji" style={{width: '40px', height: '40px', fontSize: '1.5rem', borderRadius: '0.5rem'}}>{req.companyId?.logo}</span>
                          <span style={{fontWeight: 600, color: 'var(--secondary)', fontSize: '1.05rem'}}>{req.companyId?.name}</span>
                        </div>
                      ) : (
                        <div>
                          <div style={{fontWeight: 600, color: 'var(--secondary)', fontSize: '1.05rem'}}>{req.userId?.name}</div>
                          <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem'}}>{req.userId?.email}</div>
                          <div style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase'}}>
                            Applying to: {req.companyId?.name}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{color: 'var(--text-muted)'}}>
                      {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(req.status)}`}>
                        {req.status === 'Pending' ? '⏳ Pending' : req.status === 'Accepted' ? '✅ Accepted' : '❌ Rejected'}
                      </span>
                    </td>
                    {user.role === 'company_admin' && (
                      <td style={{textAlign: 'right'}}>
                        {req.status === 'Pending' ? (
                          <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                            <button className="btn btn-success" style={{padding: '0.4rem 1rem'}} onClick={() => updateStatus(req._id, 'Accepted')}>Accept</button>
                            <button className="btn btn-outline" style={{padding: '0.4rem 1rem', color: '#b91c1c'}} onClick={() => updateStatus(req._id, 'Rejected')}>Reject</button>
                          </div>
                        ) : (
                          <span style={{color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic'}}>Processed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;