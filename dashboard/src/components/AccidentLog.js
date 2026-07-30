import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, IconButton, Tooltip, Stack, Badge } from '@mui/material';
import { LocationOn, LocalBar, Speed, WifiCalling3, Event, Warning, Dangerous, Security } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const severityConfig = {
  high: { label: 'Critical', color: '#f44336', bg: 'rgba(244,67,54,0.08)', icon: Dangerous, pulse: true },
  medium: { label: 'Warning', color: '#ff9800', bg: 'rgba(255,152,0,0.08)', icon: Warning, pulse: false },
  low: { label: 'Minor', color: '#4caf50', bg: 'rgba(76,175,80,0.08)', icon: Security, pulse: false },
};

const getSeverity = (impact) => {
  if (impact > 8) return severityConfig.high;
  if (impact > 5) return severityConfig.medium;
  return severityConfig.low;
};

export default function AccidentLog() {
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AccidentLog: Fetching accident data...');
    api.getAccidents()
      .then(data => {
        console.log('AccidentLog: Data received:', data);
        setAccidents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('AccidentLog: Error fetching accidents:', err);
        setError(`Failed to fetch accident log: ${err.message}`);
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

  if (!accidents || accidents.length === 0) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert severity="info" sx={{ borderRadius: 2 }}>No accident data available</Alert>
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
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Dangerous color="error" /> Accident Event Log
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {accidents.length} incident{accidents.length !== 1 ? 's' : ''} recorded by the SafeDrive Pro system
          </Typography>
        </motion.div>

        <AnimatePresence>
          {accidents.map((accident, index) => {
            const severity = getSeverity(accident.impact);
            const SeverityIcon = severity.icon;
            const factors = [];
            if (accident.alcohol > 0.05) factors.push({ label: 'Alcohol', color: 'error' });
            if (accident.vibration > 5) factors.push({ label: 'Vibration', color: 'warning' });
            if (accident.distance < 10) factors.push({ label: 'Proximity', color: 'error' });
            if (accident.impact > 8) factors.push({ label: 'Severe Impact', color: 'error' });
            if (accident.impact > 5) factors.push({ label: 'High Impact', color: 'warning' });

            return (
              <motion.div
                key={accident.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 80, damping: 12 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    mb: 2,
                    background: severity.bg,
                    border: `1px solid ${alpha(severity.color, 0.15)}`,
                    borderLeft: `4px solid ${severity.color}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 4px 24px ${alpha(severity.color, 0.12)}`,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    {/* Left: Severity + Info */}
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: alpha(severity.color, 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          animation: severity.pulse ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                          '@keyframes pulse-glow': {
                            '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(severity.color, 0.3)}` },
                            '50%': { boxShadow: `0 0 0 12px ${alpha(severity.color, 0)}` },
                          },
                        }}
                      >
                        <SeverityIcon sx={{ color: severity.color, fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="h6" fontWeight={700}>
                            Accident #{accident.id}
                          </Typography>
                          <Chip
                            label={severity.label}
                            size="small"
                            sx={{
                              bgcolor: severity.color,
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        </Stack>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Event fontSize="small" /> {new Date(accident.timestamp).toLocaleString()}
                          </Typography>
                          {accident.lat && accident.lng && (
                            <Tooltip title={`${accident.lat.toFixed(4)}, ${accident.lng.toFixed(4)}`}>
                              <IconButton
                                size="small"
                                color="primary"
                                component="a"
                                href={`https://www.google.com/maps/search/?api=1&query=${accident.lat},${accident.lng}`}
                                target="_blank"
                                sx={{ p: 0.5 }}
                              >
                                <LocationOn fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    </Stack>

                    {/* Right: Impact + Factors */}
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                      <Chip
                        icon={<Speed />}
                        label={`Impact: ${accident.impact.toFixed(1)}g`}
                        color={accident.impact > 5 ? 'error' : 'warning'}
                        variant="outlined"
                        size="small"
                      />
                      {factors.map((factor, i) => (
                        <Chip
                          key={i}
                          label={factor.label}
                          color={factor.color}
                          size="small"
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  </Stack>

                  {/* Details row */}
                  <Stack direction="row" spacing={3} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalBar fontSize="small" /> Alcohol: {accident.alcohol.toFixed(3)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Warning fontSize="small" /> Vibration: {accident.vibration.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" /> Distance: {accident.distance.toFixed(1)}m
                    </Typography>
                    {accident.emergency_call && (
                      <Chip
                        icon={<WifiCalling3 />}
                        label="Emergency Called"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {accident.lcd_display && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', bgcolor: 'background.default', px: 1, borderRadius: 1 }}>
                        {accident.lcd_display}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </motion.div>
            );
          })}
        </AnimatePresence>

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
              <strong>Note:</strong> The accident log displays events detected by the SafeDrive Pro system's combined sensor detection logic.
              When the system detects dangerous conditions (high impact, alcohol, or multiple sensor triggers), it logs the event,
              disables the engine, and can place emergency calls to preset numbers.
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    </motion.div>
  );
}