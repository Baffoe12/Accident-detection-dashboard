import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function SensorGauge({ value, maxValue, label, dangerThreshold, unit = '' }) {
  const normalizedValue = (value / maxValue) * 100;
  const isDangerous = value >= dangerThreshold;
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={normalizedValue}
          size={80}
          thickness={4}
          sx={{ color: isDangerous ? 'error.main' : 'primary.main' }}
        />
        <Box sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Typography variant="caption" color={isDangerous ? 'error' : 'text.secondary'}>
            {value}{unit}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}
