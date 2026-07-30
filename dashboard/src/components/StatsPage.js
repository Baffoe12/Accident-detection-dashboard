import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Warning,
  Speed,
  Sensors,
  Timeline,
  Analytics,
  Shield,
  Dashboard,
  AutoFixHigh,
} from '@mui/icons-material';
import api from '../api';

function AnimatedCounter({ value, suffix = '', color = 'primary', duration = 1500 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = null;
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(eased * value);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <Typography variant="h3" fontWeight={700} sx={{ color: `${color}.main`, fontFamily: "'JetBrains Mono', monospace" }}>
      {displayValue.toFixed(value % 1 !== 0 ? 2 : 0)}{suffix}
    </Typography>
  );
}

function StatGauge({ value, maxValue, label, color, icon: Icon }) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        textAlign: 'center',
        background: alpha(color, 0.06),
        border: `1px solid ${alpha(color, 0.15)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 4px 20px ${alpha(color, 0.12)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="38"
            fill="none"
            stroke={alpha(color, 0.1)}
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="38"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <Icon fontSize="small" color="action" />
        </Box>
      </Box>
      <AnimatedCounter value={value} color={color} />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {label}
      </Typography>
    </Paper>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching stats...');
    api.getStats()
      .then(data => {
        console.log('Stats data:', data);
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Stats fetch error:', err);
        setError(`Failed to fetch statistics: ${err.message}`);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <CircularProgress size={48} thickness={3} />
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  if (!stats) return <Alert severity="warning" sx={{ borderRadius: 2 }}>No statistics available</Alert>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Analytics color="primary" /> System Statistics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Overview of SafeDrive Pro system performance and safety metrics
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {/* Total Accidents */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 80 }}
            >
              <StatGauge
                value={stats.total_accidents}
                maxValue={Math.max(stats.total_accidents, 10)}
                label="Total Accidents"
                color="#f44336"
                icon={Warning}
              />
            </motion.div>
          </Grid>

          {/* Max Alcohol */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
            >
              <StatGauge
                value={stats.max_alcohol}
                maxValue={1}
                label="Max Alcohol"
                color="#ff9800"
                icon={Speed}
              />
            </motion.div>
          </Grid>

          {/* Avg Alcohol */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 80 }}
            >
              <StatGauge
                value={stats.avg_alcohol}
                maxValue={1}
                label="Avg Alcohol"
                color="#ff5722"
                icon={Sensors}
              />
            </motion.div>
          </Grid>

          {/* Max Impact */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 80 }}
            >
              <StatGauge
                value={stats.max_impact}
                maxValue={Math.max(stats.max_impact, 10)}
                label="Max Impact"
                color="#e91e63"
                icon={TrendingUp}
              />
            </motion.div>
          </Grid>

          {/* Total Sensor Points */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 80 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha('#1976d2', 0.04),
                  border: `1px solid ${alpha('#1976d2', 0.12)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: alpha('#2196f3', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Timeline color="primary" sx={{ fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Total Sensor Data Points
                  </Typography>
                  <AnimatedCounter value={stats.total_sensor_points} color="primary" />
                </Box>
                <Dashboard color="action" />
              </Paper>
            </motion.div>
          </Grid>

          {/* Safety Score */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 80 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(76,175,80,0.06) 0%, rgba(13,71,161,0.06) 100%)',
                  border: `1px solid ${alpha('#4caf50', 0.12)}`,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Shield color="success" sx={{ fontSize: 40 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>Safety Score</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Based on accident frequency, alcohol levels, and impact severity
                    </Typography>
                  </Box>
                  <AnimatedCounter
                    value={stats.total_accidents === 0 ? 100 : Math.max(0, 100 - stats.total_accidents * 10 - stats.max_impact * 2)}
                    suffix="%"
                    color={stats.total_accidents === 0 ? 'success' : 'warning'}
                  />
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
}