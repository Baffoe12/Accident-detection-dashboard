import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import api from '../api';

export default function SensorTest() {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getLatestSensorData();
        console.log('Sensor data received:', data);
        setSensorData(data);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>Sensor Data Test</Typography>
      {loading && <CircularProgress size={20} />}
      {error && <Typography color="error">Error: {error}</Typography>}
      {sensorData && (
        <Box sx={{ mt: 2 }}>
          <Typography>Alcohol: {sensorData.alcohol}</Typography>
          <Typography>Vibration: {sensorData.vibration}</Typography>
          <Typography>Distance: {sensorData.distance}</Typography>
          <Typography>Seatbelt: {sensorData.seatbelt ? 'Fastened' : 'Unfastened'}</Typography>
          <Typography>Impact: {sensorData.impact}</Typography>
          <Typography>LCD Display: {sensorData.lcd_display}</Typography>
        </Box>
      )}
    </Paper>
  );
}
