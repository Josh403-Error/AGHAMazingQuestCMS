import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './parallax-login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');
      const response = await fetch(`${API_BASE}/api/auth/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Password reset instructions have been sent to your email address.');
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to send password reset email.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
            <h2>Reset Password</h2>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>
          
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}
          
          {message && (
            <div className="alert-success">
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="parallax-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className={loading ? 'loading' : ''}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          
          <div className="parallax-footer">
            <button 
              onClick={() => navigate('/')} 
              className="parallax-btn-link"
              disabled={loading}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}