import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './parallax-login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && (window.location.port === '3000' || window.location.port === '3001' || window.location.port === '3002')) ? 'http://localhost:8000' : '');
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          const message = data.detail || data.message || JSON.stringify(data);
          console.error('Login failed:', res.status, data);
          setError(message);
        } else {
          try { localStorage.setItem('access', data.access); localStorage.setItem('refresh', data.refresh); } catch (e) { }
          if (onLogin) {
            try { onLogin({ access: data.access, refresh: data.refresh }); } catch (e) { console.error('onLogin callback threw', e); }
          } else {
            window.location.href = '/dashboard';
          }
        }
      } else {
        const text = await res.text();
        console.error('Login failed with non-JSON response:', res.status, text);
        setError(`HTTP ${res.status}: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
      }
    } catch (err) {
      console.error('Network error during login:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parallax-wrapper">
      {/* Parallax background elements */}
      <div className="parallax-layer parallax-back">
        <div className="parallax-element element-1"></div>
      </div>
      <div className="parallax-layer parallax-base">
        <div className="parallax-element element-2"></div>
      </div>
      <div className="parallax-layer parallax-front">
        <div className="parallax-element element-3"></div>
        <div className="parallax-element element-4"></div>
      </div>
      
      <div className="parallax-container">
        <form onSubmit={submit} className="parallax-form">
          <div className="parallax-card">
            <div className="parallax-header">
              <div className="parallax-logo-container">
                <img 
                  src="/apcseal.webp" 
                  alt="APC Seal" 
                  className="parallax-logo apc-logo"
                />
                <img 
                  src="/dost-stiilogo.jpg" 
                  alt="DOST-STII Logo" 
                  className="parallax-logo dost-logo"
                />
              </div>
              <h1>AGHAMazing Quest CMS</h1>
              <p>Sign in to access the content management system</p>
            </div>
            
            {error && (
              <div className="alert-error">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className={loading ? 'loading' : ''}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div className="parallax-footer">
              <button 
                type="button" 
                className="parallax-btn-link"
                onClick={() => navigate('/forgot-password')}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}