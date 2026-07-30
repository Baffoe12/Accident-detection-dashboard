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
  Typography
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
  WarningAmber
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MapCard from './MapCard';

const sensorCards = [
  { key: 'alcohol', label: 'Alcohol level', icon: LocalBar, unit: '', detail: 'Driver safety sensor', warning: value => value > 0.05 },
  { key: 'vibration', label: 'Vibration', icon: WarningAmber, unit: '', detail: 'Road and impact activity', warning: value => value > 1000 },
  { key: 'distance', label: 'Distance', icon: DirectionsCar, unit: ' cm', detail: 'Nearest detected object', warning: value => value < 20 },
  { key: 'impact', label: 'Impact force', icon: Speed, unit: ' g', detail: 'Acceleration force', warning: value => value > 2 }
];

const formatValue = (value, unit) => {
  if (value === undefined || value === null) return '—';
  return `${typeof value === 'number' ? value.toFixed(unit === ' g' ? 1 : 0) : value}${unit}`;
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState(null);
  const [accidents, setAccidents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = async () => {
    try {
      setError(null);
      const [sensorResult, accidentResult] = await Promise.allSettled([
        api.getLatestSensorData(),
        api.getAccidents()
      ]);

      if (sensorResult.status === 'rejected') throw sensorResult.reason;

      setSensorData(sensorResult.value);
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
          background: 'linear-gradient(120deg, #102a43 0%, #1976d2 100%)',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            borderRadius: '50%',
            zIndex: -1,
            opacity: 0.28,
            animation: 'float 8s ease-in-out infinite'
          },
          '&::before': { width: 260, height: 260, right: -70, top: -110, background: '#7dd3fc' },
          '&::after': { width: 180, height: 180, right: 180, bottom: -130, background: '#a5b4fc', animationDelay: '-4s' },
          '@keyframes float': {
            '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
            '50%': { transform: 'translate3d(-18px, 16px, 0) rotate(12deg)' }
          }
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.8 }}>SafeDrive monitoring</Typography>
            <Typography variant="h3" component="h1" fontWeight={700}>Vehicle overview</Typography>
            <Typography sx={{ mt: 1, opacity: 0.9 }}>Monitor current conditions and respond quickly to safety alerts.</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={error ? <ErrorOutline /> : <MonitorHeart />}
              label={error ? 'Connection unavailable' : isWarning ? 'Safety warning' : 'System normal'}
              color={error || isWarning ? 'warning' : 'success'}
              sx={{
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
                animation: error || isWarning ? 'statusPulse 1.5s ease-in-out infinite' : 'none',
                '@keyframes statusPulse': { '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 8px rgba(255, 183, 77, 0.18)' } }
              }}
            />
            <Button color="inherit" startIcon={<Refresh />} onClick={loadDashboard}>Refresh</Button>
          </Stack>
        </Stack>
      </Paper>

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>Live readings</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <NetworkCheck color={error ? 'warning' : 'success'} fontSize="small" />
              <Typography variant="body2" color="text.secondary">Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</Typography>
            </Stack>
          </Stack>

          <Grid container spacing={2.5}>
            {sensorCards.map(({ key, label, icon: Icon, unit, detail, warning }, index) => {
              const warningState = sensorData && warning(Number(sensorData[key]));
              return (
                <Grid item xs={12} sm={6} lg={3} key={key}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.35 }}
                    whileHover={{ y: -8, rotateX: 3, rotateY: -2, scale: 1.02 }}
                    style={{ height: '100%', perspective: 900 }}
                  >
                  <Card variant="outlined" sx={{ height: '100%', borderColor: warningState ? 'warning.main' : 'divider', transition: 'box-shadow 200ms ease', '&:hover': { boxShadow: 8 } }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="text.secondary">{label}</Typography>
                        <Icon color={warningState ? 'warning' : 'primary'} />
                      </Stack>
                      <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>{formatValue(sensorData?.[key], unit)}</Typography>
                      <Typography variant="body2" color={warningState ? 'warning.dark' : 'success.main'} sx={{ mt: 1 }}>
                        {warningState ? 'Attention required' : 'Within normal range'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{detail}</Typography>
                    </CardContent>
                  </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>Live Map</Typography>
                    <LocationOn color="primary" />
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  {hasLocation ? (
                    <>
                      <MapCard compact height={220} />
                      <Button sx={{ mt: 2 }} startIcon={<Map />} onClick={() => navigate('/map')}>Open full map</Button>
                    </>
                  ) : (
                    <Typography color="text.secondary">Waiting for a valid GPS location from the vehicle.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>Latest accident event</Typography>
                    <WarningAmber color={latestAccident ? 'warning' : 'disabled'} />
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  {latestAccident ? (
                    <Typography>
                      Impact: {formatValue(latestAccident.impact, ' g')} · {new Date(latestAccident.timestamp).toLocaleString()}
                    </Typography>
                  ) : (
                    <Typography color="text.secondary">No accident events are available.</Typography>
                  )}
                  <Button sx={{ mt: 2 }} startIcon={<History />} onClick={() => navigate('/accidents')}>View accident log</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} divider={<Divider orientation="vertical" flexItem />}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">DEVICE</Typography>
                <Typography fontWeight={600}>{sensorData?.device_id || 'SafeDrive vehicle unit'}</Typography>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Typography variant="caption" color="text.secondary">VEHICLE DISPLAY</Typography>
                <Typography fontWeight={600}>{sensorData?.lcd_display || 'No display status received'}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">ACCIDENT EVENTS</Typography>
                <Typography fontWeight={600}>{accidents.length} recorded</Typography>
              </Box>
            </Stack>
          </Paper>
        </>
      )}
    </Box>
  );
}
