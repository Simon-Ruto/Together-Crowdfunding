import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import ProjectList from './pages/ProjectList'
import ProjectDetail from './pages/ProjectDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateProject from './pages/CreateProject'
import Profile from './pages/Profile'
import PaymentSuccess from './pages/PaymentSuccess'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import About from './pages/About'
import Contact from './pages/Contact'
import { useTheme } from './theme'
import { AuthProvider, useAuth } from './auth'
import ProtectedRoute from './ProtectedRoute'

function Navbar(){
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  
  return (
    <nav style={{ 
      padding: '16px 12px', 
      borderBottom: '1px solid rgba(255,255,255,0.06)', 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      background: 'var(--card)',
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ flex: '0 0 200px' }}>
        <Link to="/" style={{ 
          fontSize: '1.2em', 
          fontWeight: 600,
          color: 'var(--accent)'
        }}>Together</Link>
      </div>

      {/* Only show main navigation links when a user is logged in */}
      {user && (
        <div style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          margin: '0 20px',
          flexWrap: 'wrap'
        }}>
          <Link to="/" style={{ fontSize: '1.1em', fontWeight: 500 }}>Home</Link>
          <Link to="/projects" style={{ fontSize: '1.1em', fontWeight: 500 }}>Projects</Link>
          <Link to="/create" style={{ fontSize: '1.1em', fontWeight: 500 }}>Create Project</Link>
          <Link to="/about" style={{ fontSize: '1.1em', fontWeight: 500 }}>About</Link>
          <Link to="/contact" style={{ fontSize: '1.1em', fontWeight: 500 }}>Contact</Link>
        </div>
      )}
      
      <div style={{ flex: '0 0 200px', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'flex-end' }}>
        {user ? (
          <div style={{ 
            display: 'flex', 
            gap: 24, 
            alignItems: 'center'
          }}>
            <button 
              className="btn" 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #ddd',
                color: '#666',
                borderRadius: '4px'
              }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link 
              to={`/profile/${user._id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                textDecoration: 'none'
              }}
            >
              {user.avatar && (
                <img 
                  src={`http://localhost:5000${user.avatar}`}
                  alt={user.username}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
              {user.username}
            </Link>
            <button 
              className="btn" 
              onClick={logout}
              style={{
                padding: '8px 16px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" style={{ fontWeight: 500 }}>Login</Link>
            <Link to="/register" style={{ fontWeight: 500 }}>Register</Link>
            {/* Show forgot password link only on the login page itself (handled in Login.jsx) */}
          </>
        )}
      </div>
    </nav>
  )
}
export default function App() {
  const { theme, setTheme } = useTheme()
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Navbar />
        </div>
        <main className="container" style={{ flex: 1 }}>
          <Routes>
            {/* Home is protected: show only to authenticated users. Unauthenticated users are redirected to /login */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          </Routes>
        </main>
        <footer style={{ 
          borderTop: '1px solid rgba(255,255,255,0.06)', 
          padding: '24px',
          textAlign: 'center',
          color: 'var(--muted)',
          marginTop: 'auto',
          background: 'var(--card)',
          fontSize: '0.9em'
        }}>
          Together © {new Date().getFullYear()}
        </footer>
      </div>
    </AuthProvider>
  )
}
