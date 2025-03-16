import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Invoice from './components/Invoice';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const checkSession = () => {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('session'));
      if (!sessionData) return false;
      return sessionData.isAuthenticated === true && Date.now() < sessionData.expiresAt;
    } catch {
      return false;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Redirect root to login or invoice based on auth status */}
        <Route 
          path="/" 
          element={
            checkSession() 
              ? <Navigate to="/invoice" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
        
        {/* Login route with auth check */}
        <Route 
          path="/login" 
          element={
            checkSession() 
              ? <Navigate to="/invoice" replace /> 
              : <Login />
          } 
        />
        
        {/* Protected invoice route */}
        <Route
          path="/invoice"
          element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;