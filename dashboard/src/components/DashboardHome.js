import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar,
  ErrorOutline,
  History,
  LocalBar,
  LocationOn,
  Map,
  MonitorHeart,
  NetworkCheck,
  Refresh,
  Speed,
  WarningAmber,
  Shield,
  GpsFixed,
  Timeline,
  Analytics,
  Security,
  Dashboard,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MapCard from './MapCard';

const sensorCards = [
  { key: 'alcohol', label: 'Alcohol Level', icon: LocalBar, unit: '', detail: 'Driver safety sensor', warning: value => value > 0.05, color: '#ff9800' },
  { key: 'vibration', label: 'Vibration', icon: WarningAmber, unit: '', detail: 'Road and impact activity', warning: value => value > 1000, color: '#f44336' },
  { key: 'distance', label: 'Distance', icon: DirectionsCar, unit: ' cm', detail: 'Nearest detected object', warning: value => value < 20, color: '#2196f3' },
  { key: 'impact', label: 'Impact Force', icon: Speed, unit: ' g', detail: 'Acceleration force', warning: value => value > 2, color: '#e91e63' },
];

const formatValue = (value, unit) => {
  if (value === undefined || value === null) return '—';
  return `${typeof value === 'number' ? value.toFixed(unit === ' g' ? 1 : 0) : value}${unit}`;
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [sensorData, setSensorData] = useState(null);
  const [accidents, setAccidents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [animatedValues, setAnimatedValues] = useState({ alcohol: 0, vibration: 0, distance: 0, impact: 0 });

  const loadDashboard = async () => {
    try {
      setError(null);
      const [sensorResult, accidentResult] = await Promise.allSettled([
        api.getLatestSensorData(),
        api.getAccidents(),
      ]);

      if (sensorResult.status === 'fulfilled') {
        setSensorData(sensorResult.value);
        setAnimatedValues({
          alcohol: sensorResult.value.alcohol || 0,
          vibration: sensorResult.value.vibration || 0,
          distance: sensorResult.value.distance || 0,
          impact: sensorResult.value.impact || 0,
        });
      }

      setAccidents(accidentResult.status === 'fulfilled' && Array.isArray(accidentResult.value) ? accidentResult.value : []);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError('Live sensor data is currently unavailable. Check the device or API connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const isWarning = useMemo(() => sensorData && sensorCards.some(card => card.warning(Number(sensorData[card.key]))), [sensorData]);
  const latestAccident = accidents[0];
  const hasLocation = Number.isFinite(Number(sensorData?.lat)) && Number.isFinite(Number(sensorData?.lng)) && (Number(sensorData.lat) !== 0 || Number(sensorData.lng) !== 0);

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
      {/* Hero Header with animated gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            color: 'white',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            isolation: 'isolate',
            background: 'linear-gradient(135deg, #0a1628 0%, #102a43 30%, #1976d2 70%, #0d47a1 100%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(25,118,210,0.3) 0%, transparent 70%)',
              zIndex: -1,
              animation: 'pulse-glow 4s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(13,71,161,0.4) 0%, transparent 70%)',
              zIndex: -1,
              animation: 'pulse-glow 4s ease-in-out infinite 2s',
            },
            '@keyframes pulse-glow': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
              '50%': { transform: 'scale(1.2)', opacity: 1 },
            },
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.7, fontWeight: 600 }}>
                <Shield sx={{ verticalAlign: 'middle', mr: 1 }} /> SafeDrive Pro
              </Typography>
              <Typography variant="h3" component="h1" fontWeight={700} sx={{ mt: 1 }}>
                Vehicle Overview
              </Typography>
              <Typography sx={{ mt: 1, opacity: 0.85, fontSize: '1rem' }}>
                Monitor real-time conditions and respond to safety alerts instantly.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                icon={error ? <ErrorOutline /> : <MonitorHeart />}
                label={error ? 'Offline' : isWarning ? 'Warning' : 'All Clear'}
                color={error || isWarning ? 'warning' : 'success'}
                sx={{
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                  fontWeight: 600,
                  animation: error || isWarning ? 'statusPulse 1.5s ease-in-out infinite' : 'none',
                  '@keyframes statusPulse': { '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 8px rgba(255,183,77,0.2)' } },
                  bgcolor: error || isWarning ? 'rgba(255,152,0,0.9)' : 'rgba(76,175,80,0.9)',
                }}
              />
              <Button
                color="inherit"
                startIcon={<Refresh />}
                onClick={loadDashboard}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.5)' },
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </motion.div>

      {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={48} thickness={3} />
        </Box>
      ) : (
        <>
          {/* Live Readings Header */}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2.5 }}>
            <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Analytics color="primary" /> Live Readings
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <NetworkCheck color={error ? 'warning' : 'success'} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
              </Typography>
            </Stack>
          </Stack>

          {/* Sensor Cards Grid */}
          <Grid container spacing={2.5}>
            {sensorCards.map(({ key, label, icon: Icon, unit, detail, warning, color }, index) => {
              const warningState = sensorData && warning(Number(sensorData[key]));
              return (
                <Grid item xs={12} sm={6} lg={3} key={key}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.35 }}
                    whileHover={{ y: -6, rotateX: 2, rotateY: -1, scale: 1.02 }}
                    style={{ height: '100%', perspective: 900 }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        borderColor: warningState ? 'warning.main' : 'divider',
                        borderWidth: warningState ? 2 : 1,
                        transition: 'all 0.3s ease',
                        boxShadow: warningState ? '0 0 20px rgba(244,67,54,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                        '&:hover': {
                          boxShadow: warningState ? '0 0 30px rgba(244,67,54,0.25)' : '0 8px 24px rgba(0,0,0,0.12)',
                          transform: 'translateY(-2px)',
                        },
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Top accent bar */}
                      <Box
                        sx={{
                          height: 4,
                          background: warningState
                            ? `linear-gradient(90deg, #f44336, #ff9800)`
                            : `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`,
                          width: '100%',
                        }}
                      />
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography color="text.secondary" variant="body2" fontWeight={500}>
                            {label}
                          </Typography>
                          <Icon
                            color={warningState ? 'error' : 'primary'}
                            sx={{
                              filter: warningState ? 'drop-shadow(0 0 6px rgba(244,67,54,0.5))' : 'none',
                              transition: 'filter 0.3s ease',
                            }}
                          />
                        </Stack>
                        <Typography variant="h3" fontWeight={700} sx={{ mt: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>
                          {formatValue(sensorData?.[key], unit)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, fontWeight: 600 }}
                          color={warningState ? 'error.main' : 'success.main'}
                        >
                          {warningState ? '⚠ Attention required' : '✓ Within normal range'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {detail}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* Bottom Row: Map + Accident + Device Info */}
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Map color="primary" /> Live Map
                    </Typography>
                    <GpsFixed color="primary" fontSize="small" />
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  {hasLocation ? (
                    <>
                      <MapCard compact height={200} />
                      <Button sx={{ mt: 2 }} startIcon={<Map />} onClick={() => navigate('/map')} variant="outlined" size="small">
                        Open full map
                      </Button>
                    </>
                  ) : (
                    <Typography color="text.secondary" sx={{ py: 2 }}>Waiting for a valid GPS location from the vehicle.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningAmber color={latestAccident ? 'warning' : 'disabled'} /> Latest Incident
                    </Typography>
                    <Timeline fontSize="small" color="action" />
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  {latestAccident ? (
                    <Box>
                      <Typography variant="body1">
                        Impact: <strong>{formatValue(latestAccident.impact, ' g')}</strong> ·{' '}
                        {new Date(latestAccident.timestamp).toLocaleString()}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                        {latestAccident.alcohol > 0.05 && <Chip label="Alcohol" color="error" size="small" />}
                        {latestAccident.vibration > 1000 && <Chip label="Vibration" color="warning" size="small" />}
                        {latestAccident.distance < 20 && <Chip label="Proximity" color="error" size="small" />}
                      </Stack>
                    </Box>
                  ) : (
                    <Typography color="text.secondary" sx={{ py: 2 }}>No accident events recorded.</Typography>
                  )}
                  <Button sx={{ mt: 2 }} startIcon={<History />} onClick={() => navigate('/history')} variant="outlined" size="small">
                    View full history
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Device Status Bar */}
          <Paper
            variant="outlined"
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderColor: alpha(theme.palette.primary.main, 0.15),
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} divider={<Divider orientation="vertical" flexItem />}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Device
                </Typography>
                <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Dashboard fontSize="small" color="primary" />
                  {sensorData?.device_id || 'SafeDrive vehicle unit'}
                </Typography>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Vehicle Display
                </Typography>
                <Typography fontWeight={600}>{sensorData?.lcd_display || 'No display status received'}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Accidents
                </Typography>
                <Typography fontWeight={600}>{accidents.length} recorded</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  GPS Status
                </Typography>
                <Typography fontWeight={600} color={hasLocation ? 'success.main' : 'error.main'}>
                  {hasLocation ? 'Active' : 'No Signal'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </>
      )}
    </Box>
  );
}