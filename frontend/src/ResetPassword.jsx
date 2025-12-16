import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');
      const response = await fetch(`${API_BASE}/api/auth/password-reset-confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          new_password: password
        }),
      });

      if (response.ok) {
        setMessage('Your password has been reset successfully. You can now log in with your new password.');
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to reset password. The reset link may have expired.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>Invalid Reset Link</h2>
          <p>The password reset link is invalid or has expired.</p>
          <button 
            onClick={() => navigate('/forgot-password')} 
            className="btn btn-primary"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Reset Password</h2>
        <p>Please enter your new password below.</p>
        
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
        
        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={loading}
                minLength="8"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        {message && (
          <div className="auth-links">
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-primary"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}