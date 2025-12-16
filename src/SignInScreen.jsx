import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import LogosContainer from './LogosContainer'; 
import './styles.css';

// Simple email validation function
const isValidEmail = (email) => {
    // Basic regex for email format validation (name@domain.tld)
    return /\S+@\S+\.\S+/.test(email);
};

const SignInScreen = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState(''); // Initialize with empty string for a proper login flow
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState(''); // New state for error messages

    const handleContinue = () => {
        setError(''); // Clear previous errors

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            console.log('Login failed: Invalid email format.');
            return; // Stop the function if validation fails
        }
        
        // --- Successful Login Simulation ---
        console.log('Login successful. Redirecting to Dashboard.');
        // In a real app, you would verify credentials here.
        navigate('/dashboard'); 
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked. Redirecting to Google Auth Screen.');
        navigate('/google-auth'); 
    };

    return (
        <React.Fragment> 
            <div className="login3-container">
                <div className="login3-card">
                    
                    <h1>Sign In to AGHAMazing Quest</h1>
                    <LogosContainer />
                    
                    <input 
                        type="email" 
                        id="email-input" 
                        placeholder="Enter your email" // Changed placeholder for better UX
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login3-input" 
                    />
                    
                    {/* Display Error Message if validation fails */}
                    {error && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '-10px', marginBottom: '10px' }}>{error}</p>}

                    <div className="login3-remember-me">
                        <input 
                            type="checkbox" 
                            id="remember-me" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember-me">Remember me on this computer</label>
                    </div>

                    <button className="login3-continue-btn" onClick={handleContinue}>
                        Continue
                    </button>
                    
                    <div className="separator">or continue with</div> 
                    <button className="login3-google-btn-alt" onClick={handleGoogleLogin}>
                        <img 
                            src="https://github.com/Marianne-101/pictures/blob/main/google-icon.png?raw=true" 
                            alt="Google Icon" 
                            className="google-icon" 
                        /> 
                        Sign in with Google
                    </button>
                    
                    <p className="terms-policy">
                        By clicking continue, you agree to our 
                        <a href="/terms-of-service"> **Terms of Service** </a> 
                        and 
                        <a href="/privacy-policy"> **Privacy Policy**</a>
                    </p>
                    
                    <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                        Don't have an account? 
                        <a href="/signup" className="sign-up-link" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Sign Up</a>
                    </p>
                </div>
            </div>
            
        </React.Fragment>
    );
}; 

export default SignInScreen;