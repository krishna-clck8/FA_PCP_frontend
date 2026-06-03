import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { authUser } = useAuth();

  if (!authUser) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Profile</h1>
      <div className="profile-card">
        <div className="profile-field"><label>User ID</label><span>{authUser.userId}</span></div>
        <div className="profile-field"><label>Name</label><span>{authUser.name}</span></div>
        <div className="profile-field"><label>Email</label><span>{authUser.email}</span></div>
        <div className="profile-field"><label>Role</label><span className={`badge badge-${authUser.role}`}>{authUser.role}</span></div>
        <div className="profile-field"><label>Department</label><span>{authUser.department || 'General'}</span></div>
        <div className="profile-field"><label>Status</label><span className={`badge badge-${authUser.status}`}>{authUser.status}</span></div>
        <div className="profile-field"><label>Joined</label><span>{new Date(authUser.createdAt).toLocaleDateString()}</span></div>
      </div>
    </div>
  );
};

export default Profile;
