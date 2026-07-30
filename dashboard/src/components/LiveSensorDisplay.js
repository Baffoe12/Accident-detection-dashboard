import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, Grid } from '@mui/material';
import { LocalBar, Vibration, Speed, AirlineSeatReclineNormal } from '@mui/icons-material';
import api from '../api';

export default function LiveSensorDisplay() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sensorData = await api.getLatestSensorData();
        setData(sensorData);
      } catch (err) {
        console.error('Failed to fetch sensor data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const dangerousCondition = data.alcohol > 0.05 || data.distance < 20 || data.vibration > 1.0 || !data.seatbelt;

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>Live Sensor Data</Typography>

      {dangerousCondition && (
        <Typography variant="h6" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
          Warning: Dangerous conditions detected!
        </Typography>
      )}

      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="h5" align="center" fontFamily="monospace" color="primary.main">
          {data.lcd_display || 'NO DATA'}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalBar color={data.alcohol > 0.05 ? 'error' : 'primary'} />
              <Box>
                <Typography variant="body2" color="text.secondary">Alcohol Level</Typography>
                <Typography variant="h6">{data.alcohol.toFixed(3)}</Typography>
                {data.alcohol > 0.05 && (
                  <Chip size="small" color="error" label="Above Limit" />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed color={data.distance < 20 ? 'error' : 'primary'} />
              <Box>
                <Typography variant="body2" color="text.secondary">Distance</Typography>
                <Typography variant="h6">{data.distance.toFixed(1)}m</Typography>
                {data.distance < 20 && (
                  <Chip size="small" color="error" label="Too Close" />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Vibration color={data.vibration > 1.0 ? 'warning' : 'primary'} />
              <Box>
                <Typography variant="body2" color="text.secondary">Vibration</Typography>
                <Typography variant="h6">{data.vibration.toFixed(2)}g</Typography>
                {data.vibration > 1.0 && (
                  <Chip size="small" color="warning" label="High" />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AirlineSeatReclineNormal color={data.seatbelt ? 'success' : 'error'} />
              <Box>
                <Typography variant="body2" color="text.secondary">Seatbelt</Typography>
                <Chip 
                  label={data.seatbelt ? 'BUCKLED' : 'UNBUCKLED'}
                  color={data.seatbelt ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Device ID: {data.device_id || 'Unknown'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last Update: {new Date(data.timestamp).toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
}
