import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Chip, Stack } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../api';

const chartColors = {
  alcohol: { line: '#ff9800', fill: 'rgba(255,152,0,0.1)', bg: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' },
  vibration: { line: '#f44336', fill: 'rgba(244,67,54,0.1)', bg: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' },
  distance: { line: '#2196f3', fill: 'rgba(33,150,243,0.1)', bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' },
  impact: { line: '#e91e63', fill: 'rgba(233,30,99,0.1)', bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' },
};

const sensorMeta = {
  alcohol: { label: 'Alcohol', icon: '🍺', warning: v => v > 0.05, unit: '', description: 'Higher values indicate potential intoxication' },
  vibration: { label: 'Vibration', icon: '📳', warning: v => v > 1000, unit: '', description: 'Spikes indicate potential accidents or road hazards' },
  distance: { label: 'Distance', icon: '📏', warning: v => v < 20, unit: 'm', description: 'Lower values indicate closer detected objects' },
  impact: { label: 'Impact', icon: '💥', warning: v => v > 2, unit: 'g', description: 'Spikes indicate sudden acceleration or collisions' },
};

export default function SensorHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSensor, setActiveSensor] = useState(null);

  useEffect(() => {
    console.log('SensorHistory: Fetching sensor history data...');
    api.getSensorHistory()
      .then(rawData => {
        console.log('SensorHistory: Raw data received:', rawData);
        const formatted = rawData.map(item => ({
          timestamp: new Date(parseInt(item.timestamp)).toLocaleTimeString(),
          alcohol: item.alcohol,
          vibration: item.vibration,
          distance: item.distance,
          impact: item.impact,
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error('SensorHistory: Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CircularProgress size={48} thickness={3} />
      </motion.div>
    </Box>
  );

  if (error) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
    </motion.div>
  );

  if (!data || data.length === 0) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert severity="info" sx={{ borderRadius: 2 }}>No sensor history data available</Alert>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Sensor Data History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Historical sensor readings from the SafeDrive Pro monitoring system
          </Typography>
        </motion.div>

        {/* Sensor filter chips */}
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
          {Object.entries(sensorMeta).map(([key, meta]) => (
            <Chip
              key={key}
              label={`${meta.icon} ${meta.label}`}
              onClick={() => setActiveSensor(activeSensor === key ? null : key)}
              sx={{
                fontWeight: 600,
                bgcolor: activeSensor === key ? chartColors[key].line : 'background.paper',
                color: activeSensor === key ? 'white' : 'text.primary',
                border: activeSensor === key ? 'none' : '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: chartColors[key].line, color: 'white' },
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Stack>

        <Grid container spacing={3}>
          {Object.entries(sensorMeta).map(([sensor, meta], index) => {
            if (activeSensor && activeSensor !== sensor) return null;
            const colors = chartColors[sensor];
            return (
              <Grid item xs={12} key={sensor}>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 70, damping: 10, delay: index * 0.1 + 0.2 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: colors.bg,
                      border: '1px solid',
                      borderColor: alpha(colors.line, 0.15),
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: 3,
                        background: `linear-gradient(90deg, transparent, ${colors.line}, transparent)`,
                        opacity: 0.6,
                      },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: colors.line }}>
                        {meta.icon} {meta.label} Readings
                      </Typography>
                      <Chip
                        label={meta.description}
                        variant="outlined"
                        size="small"
                        sx={{ borderColor: alpha(colors.line, 0.3), color: colors.line }}
                      />
                    </Stack>

                    <Box sx={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <defs>
                            <linearGradient id={`gradient-${sensor}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={colors.line} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={colors.line} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: `1px solid ${alpha(colors.line, 0.2)}`,
                              boxShadow: `0 4px 20px ${alpha(colors.line, 0.15)}`,
                              backdropFilter: 'blur(10px)',
                            }}
                            labelStyle={{ fontWeight: 600 }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey={sensor}
                            stroke={colors.line}
                            strokeWidth={2.5}
                            fill={`url(#gradient-${sensor})`}
                            dot={{ r: 3, fill: colors.line, strokeWidth: 2, stroke: 'white' }}
                            activeDot={{ r: 6, fill: colors.line, strokeWidth: 2, stroke: 'white', style: { filter: `drop-shadow(0 0 6px ${colors.line})` } }}
                            isAnimationActive={true}
                            animationDuration={1500}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Paper
            elevation={0}
            sx={{ mt: 3, p: 3, borderRadius: 3, bgcolor: alpha('#1976d2', 0.04), border: '1px solid', borderColor: alpha('#1976d2', 0.1) }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> This dashboard displays real-time sensor data from the SafeDrive Pro system.
              The system uses combined sensor detection logic to identify potential accidents when multiple sensors trigger simultaneously.
              When dangerous conditions are detected, the system can automatically disable the engine, slow down the vehicle, and place emergency calls.
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    </motion.div>
  );
}