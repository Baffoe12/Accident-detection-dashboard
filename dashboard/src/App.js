import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import DashboardHome from './components/DashboardHome';
import SensorHistory from './components/SensorHistory';
import AccidentLog from './components/AccidentLog';
import MapPage from './components/MapPage';
import StatsPage from './components/StatsPage';
import DownloadPage from './components/DownloadPage';
import StatusBar from './components/StatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';
import api from './api';
import './App.css';

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getLatestSensorData();
        setSensorData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch sensor data:', err);
        setError(err.message);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app-container" style={{ paddingBottom: '64px' }}>
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <>
                        <StatusBar sensorData={sensorData} error={error} />
                        <DashboardLayout />
                        <div className="main-content">
                          <Routes>
                            <Route path="/" element={<DashboardHome />} />
                            <Route path="/history" element={<SensorHistory />} />
                            <Route path="/accidents" element={<AccidentLog />} />
                            <Route path="/map" element={<MapPage />} />
                            <Route path="/stats" element={<StatsPage />} />
                            <Route path="/download" element={<DownloadPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </div>
                      </>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;