import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import api from '../api';

export default function TestConnection() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getHealth()
      .then(data => {
        console.log('Health check successful:', data);
        setHealth(data);
      })
      .catch(err => {
        console.error('Health check failed:', err);
        setError(err.message);
      });
  }, []);

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6">API Connection Test</Typography>
      {error && <Typography color="error">Error: {error}</Typography>}
      {health && <Typography color="success.main">Connected! Server time: {health.time}</Typography>}
    </Paper>
  );
}
