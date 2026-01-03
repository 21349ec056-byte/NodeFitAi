import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Landing from './pages/Landing';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import FoodCamera from './pages/FoodCamera';
import FoodHistory from './pages/FoodHistory';
import CycleTracker from './pages/CycleTracker';
import SettingsPage from './pages/SettingsPage';

// Components
import AppShell from './components/AppShell';

import './index.css';

// Protected Route - requires auth
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/signin" />;
}

// Public Route - redirect to app if already authenticated
function PublicRoute({ children }) {
  const { isAuthenticated, hasProfile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  // If authenticated, redirect based on profile status
  if (isAuthenticated) {
    return hasProfile ? <Navigate to="/app/dashboard" /> : <Navigate to="/onboarding" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/signin" element={<PublicRoute><Signin /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Onboarding (requires auth but no profile) */}
      <Route path="/onboarding" element={
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      } />

      {/* App routes (with sidebar) */}
      <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="food" element={<FoodCamera />} />
        <Route path="history" element={<FoodHistory />} />
        <Route path="cycle" element={<CycleTracker />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
