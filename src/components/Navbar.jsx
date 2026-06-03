import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!authUser) return null;

  return (
    <nav className="sidebar">
      <div className="sidebar-top">
        <div className="nav-brand"><NavLink to="/dashboard">BugTracker</NavLink></div>
        <div className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/issues">Issues</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/comments">Comments</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="nav-user">
          <div>
            <div className="nav-user-name">{authUser.name}</div>
            <div className="nav-user-role">{authUser.role}</div>
          </div>
          <button className="btn btn-sm btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
