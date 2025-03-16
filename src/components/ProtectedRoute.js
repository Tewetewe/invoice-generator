import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const checkSession = () => {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('session'));
      
      if (!sessionData) {
        console.log('No session data found');
        return false;
      }

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        console.log('Session expired');
        sessionStorage.removeItem('session');
        return false;
      }

      return sessionData.isAuthenticated === true;
    } catch (error) {
      console.log('Error checking session:', error);
      return false;
    }
  };

  // Add effect to check session periodically
  useEffect(() => {
    const isAuthenticated = checkSession();
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
    
    // Check session every minute
    const intervalId = setInterval(() => {
      const isStillAuthenticated = checkSession();
      if (!isStillAuthenticated) {
        navigate('/login', { replace: true });
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [navigate]);

  const isAuthenticated = checkSession();

  if (!isAuthenticated) {
    // Redirect to login while preserving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 