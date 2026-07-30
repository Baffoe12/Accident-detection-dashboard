import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import api from '../api';

export default function ApiTest() {
  const [sensorData, setSensorData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test sensor data endpoint
    api.getLatestSensorData()
      .then(data => {
        console.log('Sensor data:', data);
        setSensorData(data);
      })
      .catch(err => {
        console.error('Failed to fetch sensor data:', err);
        setError(err.message);
      });
  }, []);

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6">Sensor Data Test</Typography>
      {error && <Typography color="error">Error: {error}</Typography>}
      {sensorData && (
        <Box>
          <Typography>Alcohol: {sensorData.alcohol}</Typography>
          <Typography>Distance: {sensorData.distance}</Typography>
          <Typography>Impact: {sensorData.impact}</Typography>
          <Typography>Seatbelt: {sensorData.seatbelt ? 'Yes' : 'No'}</Typography>
        </Box>
      )}
    </Paper>
  );
}
