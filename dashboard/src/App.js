import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardHome from './components/DashboardHome';
import SensorHistory from './components/SensorHistory';
import AccidentLog from './components/AccidentLog';
import MapPage from './components/MapPage';
import StatsPage from './components/StatsPage';
import DownloadPage from './components/DownloadPage';
import StatusBar from './components/StatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './components/DashboardLayout';
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
    <Router>
      <div className="app-container" style={{ paddingBottom: '64px' }}>
        <ErrorBoundary>
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
            </Routes>
          </div>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
