import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip, Divider } from '@mui/material';
import { Check, Warning, Speed, DisplaySettings } from '@mui/icons-material';

export default function StatusBar({ sensorData }) {
  const isDangerous = sensorData && (
    sensorData.alcohol > 0.05 ||
    sensorData.impact > 2.0 ||
    sensorData.distance < 20 ||
    !sensorData.seatbelt
  );

  return (
    <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isDangerous ? (
            <Warning color="error" />
          ) : (
            <Check color="success" />
          )}
          <Typography>
            System Status: {isDangerous ? 'Warning' : 'Normal'}
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DisplaySettings color="primary" />
            <Typography>
              LCD: {sensorData?.lcd_display || 'No Display Data'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            icon={<Speed />}
            label={`Distance: ${sensorData?.distance || '0'}m`}
            color={sensorData?.distance < 20 ? 'error' : 'default'}
            variant="outlined"
            size="small"
          />
          <Chip 
            label={`Impact: ${sensorData?.impact || '0'}g`}
            color={sensorData?.impact > 2.0 ? 'error' : 'default'}
            variant="outlined"
            size="small"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
