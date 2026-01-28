import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import Login from './components/Login/Login';
import MainDashboard from './components/Dashboard/MainDashboard';
import TestLogin from './components/TestLogin';
import UserList from './components/Users/UserList';
import OutletList from './components/Outlets/OutletList';
import VisitSchedule from './components/Visits/VisitSchedule';
import DailyReport from './components/Reports/DailyReport';
import AuthUserList from './components/Auth/AuthUserList';
import Layout from './components/Layout/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// History Manager Component
function HistoryManager() {
  const location = useLocation();
  
  useEffect(() => {
    // Prevent history manipulation by ensuring user interaction
    const handleUserInteraction = () => {
      // Mark that user has interacted with the page
      window.history.replaceState({ interacted: true }, '', location.pathname);
    };
    
    // Add event listeners for user interactions
    const events = ['click', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [location]);
  
  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <HistoryManager />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/test" element={<TestLogin />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<MainDashboard />} />
                    <Route path="/auth-users" element={<AuthUserList />} />
                    <Route path="/users" element={<UserList />} />
                    <Route path="/outlets" element={<OutletList />} />
                    <Route path="/visits" element={<VisitSchedule />} />
                    <Route path="/reports" element={<DailyReport />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
