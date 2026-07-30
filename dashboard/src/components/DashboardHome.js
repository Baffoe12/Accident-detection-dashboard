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
  Refresh,
  Speed,
  WarningAmber
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const sensorCards = [
  { key: 'alcohol', label: 'Alcohol level', icon: LocalBar, unit: '', warning: value => value > 0.05 },
  { key: 'vibration', label: 'Vibration', icon: WarningAmber, unit: '', warning: value => value > 1000 },
  { key: 'distance', label: 'Distance', icon: DirectionsCar, unit: ' cm', warning: value => value < 20 },
  { key: 'impact', label: 'Impact force', icon: Speed, unit: ' g', warning: value => value > 2 }
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
          background: 'linear-gradient(120deg, #102a43 0%, #1976d2 100%)'
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
              sx={{ color: 'white', '& .MuiChip-icon': { color: 'white' } }}
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
            <Typography variant="body2" color="text.secondary">Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</Typography>
          </Stack>

          <Grid container spacing={2.5}>
            {sensorCards.map(({ key, label, icon: Icon, unit, warning }) => {
              const warningState = sensorData && warning(Number(sensorData[key]));
              return (
                <Grid item xs={12} sm={6} lg={3} key={key}>
                  <Card variant="outlined" sx={{ height: '100%', borderColor: warningState ? 'warning.main' : 'divider' }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="text.secondary">{label}</Typography>
                        <Icon color={warningState ? 'warning' : 'primary'} />
                      </Stack>
                      <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>{formatValue(sensorData?.[key], unit)}</Typography>
                      <Typography variant="body2" color={warningState ? 'warning.dark' : 'success.main'} sx={{ mt: 1 }}>
                        {warningState ? 'Attention required' : 'Within normal range'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>Current location</Typography>
                    <LocationOn color="primary" />
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  {hasLocation ? (
                    <>
                      <Typography>{Number(sensorData.lat).toFixed(5)}, {Number(sensorData.lng).toFixed(5)}</Typography>
                      <Button sx={{ mt: 2 }} startIcon={<Map />} onClick={() => navigate('/map')}>Open map</Button>
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
        </>
      )}
    </Box>
  );
}
