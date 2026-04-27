import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { token, user } = useAuth();
  
  const [alert, setAlert] = useState(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await axios.get('/api/companies', { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const sendRequest = async (companyId) => {
    try {
      await axios.post('/api/requests', { companyId }, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: 'success', message: 'Your application request has been sent to the company successfully!' });
      setModalOpen(false);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to send request. You may already have a pending application.' });
      setModalOpen(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlert(null), 5000);
  };

  const openCompany = (company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };

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
        
        <div className="page-header">
          <div>
            <h1>Explore Companies</h1>
            <p>Discover top organizations and connect with their administration teams.</p>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '4rem', color: 'var(--text-muted)'}}>
            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
            Loading company directory...
          </div>
        ) : (
          <div className="grid">
            {companies.map(company => (
              <div className="card" key={company._id}>
                <div className="card-header">
                  <div className="card-header-bg"></div>
                  <div className="company-logo-wrapper">
                    <div className="company-emoji">{company.logo}</div>
                    <div>
                      <h3 style={{fontSize: '1.35rem', marginBottom: '0.15rem'}}>{company.name}</h3>
                      <span className="badge badge-admin" style={{fontSize: '0.65rem'}}>{company.industry}</span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <p>{company.description}</p>
                </div>
                <div className="card-footer">
                  <div style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    👥 {company.employees?.length || 0} Employees
                  </div>
                  <button className="btn btn-primary" style={{padding: '0.5rem 1.25rem'}} onClick={() => openCompany(company)}>
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && selectedCompany && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="company-logo-wrapper">
                <div className="company-emoji" style={{width: '56px', height: '56px', fontSize: '2.5rem'}}>{selectedCompany.logo}</div>
                <div>
                  <h2 style={{fontSize: '1.5rem'}}>{selectedCompany.name}</h2>
                  <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{selectedCompany.industry}</span>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)'}}>✕</button>
            </div>
            
            <div className="modal-body">
              <h3 style={{fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem'}}>About</h3>
              <p style={{lineHeight: '1.6', color: 'var(--secondary)', marginBottom: '2rem'}}>{selectedCompany.description}</p>
              
              <h3 style={{fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between'}}>
                <span>Key Personnel</span>
                <span>{selectedCompany.employees?.length || 0}</span>
              </h3>
              
              {selectedCompany.employees?.length > 0 ? (
                <ul className="employee-list">
                  {selectedCompany.employees.map(emp => (
                    <li className="employee-item" key={emp._id}>
                      <div className="employee-avatar">{emp.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{fontWeight: 600, color: 'var(--secondary)'}}>{emp.name}</div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem'}}>{emp.position}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{padding: '1.5rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: '0.5rem', color: 'var(--text-muted)'}}>
                  No employees listed publicly.
                </div>
              )}
            </div>
            
            {user?.role === 'user' && (
              <div className="modal-footer">
                <button className="btn btn-primary" style={{width: '100%', padding: '0.875rem', fontSize: '1.05rem'}} onClick={() => sendRequest(selectedCompany._id)}>
                  Submit Application Request
                </button>
                <p style={{textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem'}}>
                  Your profile details will be shared with {selectedCompany.name}'s administrators.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Companies;
