import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage'; // <-- NEW IMPORT
import { useAuth } from './context/AuthContext';
import ContactUsPage from './pages/ContactUsPage';
import TemplatePage from './pages/TemplatePage';
// Private Route Component (remains the same)
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading authentication...</div>; 
  if (!isAuthenticated) return <Navigate to="/" replace />; // <-- Redirects to landing page now
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* New Home Route */}
        <Route path="/" element={<LandingPage />} /> 

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/templates" element={<TemplatePage />} />
        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/document/:documentId" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;