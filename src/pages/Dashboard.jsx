import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { authUser } = useAuth();
  const [issueStats, setIssueStats] = useState({ totalIssues: 0, openIssues: 0, resolvedIssues: 0, closedIssues: 0 });
  const [projectStats, setProjectStats] = useState([]);
  const [devStats, setDevStats] = useState({ developers: [], highestResolvedIssueCount: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [syncResult, setSyncResult] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchRecent();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [issues, projects, devs] = await Promise.all([
        api.get('/analytics/issues').catch(() => ({ data: { data: {} } })),
        api.get('/analytics/projects').catch(() => ({ data: { data: [] } })),
        api.get('/analytics/developers').catch(() => ({ data: { data: { developers: [], highestResolvedIssueCount: 0 } } })),
      ]);
      setIssueStats(issues.data.data || {});
      setProjectStats(projects.data.data || []);
      setDevStats(devs.data.data || { developers: [], highestResolvedIssueCount: 0 });
    } catch { /* empty */ }
  };

  const fetchRecent = async () => {
    try {
      const [issues, projects] = await Promise.all([
        api.get('/issues?limit=5&sortBy=createdAt&sortOrder=desc').catch(() => ({ data: { data: { data: [] } } })),
        api.get('/projects?limit=5&sortBy=createdAt&sortOrder=desc').catch(() => ({ data: { data: { data: [] } } })),
      ]);
      setRecentIssues(issues.data.data?.data || []);
      setRecentProjects(projects.data.data?.data || []);
    } catch { /* empty */ }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/sync');
      setSyncResult(res.data.data);
      fetchAnalytics();
    } catch (err) {
      setSyncResult({ error: err.response?.data?.message || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        {authUser && (authUser.role === 'admin' || authUser.role === 'manager') && (
          <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Sync Dataset'}
          </button>
        )}
      </div>

      {syncResult && (
        <div className="sync-result">
          <h3>Sync Result</h3>
          {syncResult.error ? (
            <p className="error-msg">{syncResult.error}</p>
          ) : (
            <div className="stats-row">
              <div className="stat-item"><span className="stat-label">Fetched</span><span className="stat-value">{syncResult.totalFetched}</span></div>
              <div className="stat-item"><span className="stat-label">Inserted</span><span className="stat-value">{syncResult.inserted}</span></div>
              <div className="stat-item"><span className="stat-label">Duplicates</span><span className="stat-value">{syncResult.duplicates}</span></div>
              <div className="stat-item"><span className="stat-label">Rejected</span><span className="stat-value">{syncResult.rejected}</span></div>
            </div>
          )}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card blue"><h3>{issueStats.totalIssues || 0}</h3><p>Total Issues</p></div>
        <div className="stat-card orange"><h3>{issueStats.openIssues || 0}</h3><p>Open Issues</p></div>
        <div className="stat-card green"><h3>{issueStats.resolvedIssues || 0}</h3><p>Resolved Issues</p></div>
        <div className="stat-card red"><h3>{issueStats.closedIssues || 0}</h3><p>Closed Issues</p></div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header"><h2>Project Analytics</h2><Link to="/projects">View All</Link></div>
          {projectStats.length > 0 ? (
            <table className="data-table">
              <thead><tr><th>Project</th><th>Total</th><th>Open</th><th>Closed</th></tr></thead>
              <tbody>{projectStats.map((p, i) => (
                <tr key={i}><td>{p.title}</td><td>{p.totalIssues}</td><td>{p.openIssues}</td><td>{p.closedIssues}</td></tr>
              ))}</tbody>
            </table>
          ) : <p className="no-data">No project data available</p>}
        </div>

        <div className="dashboard-section">
          <div className="section-header"><h2>Developer Analytics</h2></div>
          {devStats.developers && devStats.developers.length > 0 ? (
            <table className="data-table">
              <thead><tr><th>Developer</th><th>Resolved</th><th>Avg Time (hrs)</th></tr></thead>
              <tbody>{devStats.developers.map((d, i) => (
                <tr key={i}><td>{d.name}</td><td>{d.resolvedIssues}</td><td>{d.averageResolutionTime}</td></tr>
              ))}</tbody>
            </table>
          ) : <p className="no-data">No developer data available</p>}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header"><h2>Recent Issues</h2><Link to="/issues">View All</Link></div>
          {recentIssues.length > 0 ? (
            <table className="data-table">
              <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Priority</th></tr></thead>
              <tbody>{recentIssues.map((i) => (
                <tr key={i._id}><td>{i.issueId}</td><td>{i.title}</td><td><span className={`badge badge-${i.status}`}>{i.status}</span></td><td><span className={`badge badge-${i.priority}`}>{i.priority}</span></td></tr>
              ))}</tbody>
            </table>
          ) : <p className="no-data">No recent issues</p>}
        </div>

        <div className="dashboard-section">
          <div className="section-header"><h2>Recent Projects</h2><Link to="/projects">View All</Link></div>
          {recentProjects.length > 0 ? (
            <table className="data-table">
              <thead><tr><th>ID</th><th>Title</th><th>Status</th></tr></thead>
              <tbody>{recentProjects.map((p) => (
                <tr key={p._id}><td>{p.projectId}</td><td>{p.title}</td><td><span className={`badge badge-${p.status}`}>{p.status}</span></td></tr>
              ))}</tbody>
            </table>
          ) : <p className="no-data">No recent projects</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
