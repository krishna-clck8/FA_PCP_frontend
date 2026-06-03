import { useState, useEffect } from 'react';
import api from '../utils/api';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [issueFilter, setIssueFilter] = useState('');

  useEffect(() => { fetchComments(); fetchIssues(); }, [page, issueFilter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      let res;
      if (issueFilter) {
        res = await api.get(`/comments/${issueFilter}`, { params });
      } else {
        res = await api.get('/comments', { params });
      }
      setComments(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
      setTotalPages(res.data.data.totalPages || 1);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const fetchIssues = async () => {
    try { const res = await api.get('/issues?limit=100'); setIssues(res.data.data.data || []); } catch { /* empty */ }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedIssue || !message.trim()) return;
    try {
      await api.post('/comments', { message, issue: selectedIssue });
      setMessage('');
      setSelectedIssue('');
      fetchComments();
    } catch { /* empty */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try { await api.delete(`/comments/${id}`); fetchComments(); } catch { /* empty */ }
  };

  return (
    <div className="page">
      <h1>Comments</h1>
      <div className="comment-form">
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <select value={selectedIssue} onChange={e => setSelectedIssue(e.target.value)} required>
              <option value="">Select Issue</option>{issues.map(i => <option key={i._id} value={i._id}>{i.issueId} - {i.title}</option>)}
            </select>
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write a comment..." required />
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </form>
      </div>
      <div className="filters">
        <select value={issueFilter} onChange={e => { setIssueFilter(e.target.value); setPage(1); }}>
          <option value="">All Issues</option>{issues.map(i => <option key={i._id} value={i._id}>{i.issueId} - {i.title}</option>)}
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <div className="comments-list">
            {comments.length > 0 ? comments.map(c => (
              <div key={c._id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-user">{c.user?.name || 'Unknown'}</span>
                  <span className="comment-issue">on {c.issue?.issueId || ''}</span>
                  <span className="comment-date">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="comment-message">{c.message}</p>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
              </div>
            )) : <p className="no-data">No comments found</p>}
          </div>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span>Page {page} of {totalPages} ({total} total)</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Comments;
