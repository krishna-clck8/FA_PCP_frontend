import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Projects from './pages/Projects';
import Issues from './pages/Issues';
import Comments from './pages/Comments';
import Profile from './pages/Profile';
import './App.css';

window.appState = {
  authUser: null,
  token: null,
  users: [],
  projects: [],
  issues: [],
  comments: [],
  filters: {},
  analytics: {},
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute roles={['admin', 'manager']}><Users /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
              <Route path="/comments" element={<ProtectedRoute><Comments /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
