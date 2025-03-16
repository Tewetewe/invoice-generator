import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateCredentials } from '../utils/auth';
import logo from '../assets/suitlabs-logo.png';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const isValid = await validateCredentials(
        credentials.username, 
        credentials.password
      );
      
      if (isValid) {
        // Set session data
        const sessionData = {
          isAuthenticated: true,
          timestamp: Date.now(),
          expiresAt: Date.now() + (8 * 60 * 60 * 1000), // 8 hours
          username: credentials.username
        };
        
        // Store session data
        sessionStorage.setItem('session', JSON.stringify(sessionData));
        navigate('/invoice', { replace: true });
      } else {
        setError('Invalid username or password');
        setCredentials(prev => ({
          ...prev,
          password: ''
        }));
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Suitlabs Logo" className="login-logo" />
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Username"
              required
              autoComplete="username"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 