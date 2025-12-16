import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="auth-container">
      <div className="auth-form">
        <h2>Reset Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="auth-links">
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-link"
            disabled={loading}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}