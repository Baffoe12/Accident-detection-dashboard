import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { Search, Download, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../api';
import { sanitizeInput } from '../utils/sanitize';

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

const ROWS_PER_PAGE = 10;

function SkeletonChart() {
  return (
    <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress size={32} />
    </Box>
  );
}

function SkeletonTable() {
  return (
    <Box sx={{ p: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
      ))}
    </Box>
  );
}

export default function SensorHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSensor, setActiveSensor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);

  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log('SensorHistory: Fetching sensor history data...');
    api.getSensorHistory()
      .then(rawData => {
        console.log('SensorHistory: Raw data received:', rawData);
        const sanitized = sanitizeInput(rawData);
        const formatted = sanitized.map(item => ({
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

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(v =>
        v !== null && v !== undefined && String(v).toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    api.getSensorHistory()
      .then(rawData => {
        const sanitized = sanitizeInput(rawData);
        const formatted = sanitized.map(item => ({
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
        setError(err.message);
        setLoading(false);
      });
  };

  const exportToCSV = () => {
    if (!filteredData.length) return;
    const headers = ['timestamp', 'alcohol', 'vibration', 'distance', 'impact'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => headers.map(h => row[h] ?? '').join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={280} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
    </Box>
  );

  if (error) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
        {error}
        <Button startIcon={<Refresh />} onClick={handleRefresh} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
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

        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
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
              aria-pressed={activeSensor === key}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Search records"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 300 }}
            aria-label="Search sensor history records"
          />
          <Button
            startIcon={<Download />}
            onClick={exportToCSV}
            variant="outlined"
            size="small"
            disabled={!filteredData.length}
            aria-label="Export sensor history to CSV"
          >
            Export CSV
          </Button>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} aria-label="Refresh sensor data" size="large">
              <Refresh />
            </IconButton>
          </Tooltip>
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

        <Paper sx={{ mt: 3, borderRadius: 3 }}>
          <TableContainer>
            <Table aria-label="Sensor history data table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>Alcohol</strong></TableCell>
                  <TableCell><strong>Vibration</strong></TableCell>
                  <TableCell><strong>Distance (m)</strong></TableCell>
                  <TableCell><strong>Impact (g)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">No records match your search</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{row.timestamp}</TableCell>
                    <TableCell>{row.alcohol}</TableCell>
                    <TableCell>{row.vibration}</TableCell>
                    <TableCell>{row.distance}</TableCell>
                    <TableCell>{row.impact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
          />
        </Paper>

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