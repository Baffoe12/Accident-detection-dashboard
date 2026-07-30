import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Badge,
  TextField,
  InputAdornment,
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
  LocationOn,
  LocalBar,
  Speed,
  WifiCalling3,
  Event,
  Warning,
  Dangerous,
  Security,
  Search,
  Download,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { sanitizeInput } from '../utils/sanitize';

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

const ROWS_PER_PAGE = 10;

function SkeletonAccident() {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
        </Box>
      </Stack>
    </Paper>
  );
}

export default function AccidentLog() {
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);

  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log('AccidentLog: Fetching accident data...');
    api.getAccidents()
      .then(data => {
        console.log('AccidentLog: Data received:', data);
        const sanitized = sanitizeInput(data);
        setAccidents(sanitized);
        setLoading(false);
      })
      .catch(err => {
        console.error('AccidentLog: Error fetching accidents:', err);
        setError(`Failed to fetch accident log: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const filteredAccidents = useMemo(() => {
    let result = accidents;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a =>
        String(a.id).toLowerCase().includes(term) ||
        String(a.impact).toLowerCase().includes(term) ||
        String(a.alcohol).toLowerCase().includes(term) ||
        (a.lcd_display && a.lcd_display.toLowerCase().includes(term))
      );
    }

    if (severityFilter !== 'all') {
      result = result.filter(a => {
        const sev = getSeverity(a.impact);
        return sev.label.toLowerCase() === severityFilter;
      });
    }

    return result;
  }, [accidents, searchTerm, severityFilter]);

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
    api.getAccidents()
      .then(data => {
        const sanitized = sanitizeInput(data);
        setAccidents(sanitized);
        setLoading(false);
      })
      .catch(err => {
        setError(`Failed to fetch accident log: ${err.message}`);
        setLoading(false);
      });
  };

  const exportToCSV = () => {
    if (!filteredAccidents.length) return;
    const headers = ['id', 'timestamp', 'alcohol', 'vibration', 'distance', 'impact', 'lat', 'lng', 'severity'];
    const csvContent = [
      headers.join(','),
      ...filteredAccidents.map(a => [
        a.id,
        new Date(a.timestamp).toISOString(),
        a.alcohol,
        a.vibration,
        a.distance,
        a.impact,
        a.lat || '',
        a.lng || '',
        getSeverity(a.impact).label,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `accident_log_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 2 }} />
      <SkeletonAccident />
      <SkeletonAccident />
      <SkeletonAccident />
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

        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search accidents"
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
            aria-label="Search accident records"
          />
          <Chip
            label={severityFilter === 'all' ? 'All Severities' : severityFilter}
            onClick={() => setSeverityFilter(severityFilter === 'all' ? 'low' : severityFilter === 'low' ? 'medium' : severityFilter === 'medium' ? 'high' : 'all')}
            variant="outlined"
            size="small"
            clickable
            aria-label="Filter by severity"
          />
          <Button
            startIcon={<Download />}
            onClick={exportToCSV}
            variant="outlined"
            size="small"
            disabled={!filteredAccidents.length}
            aria-label="Export accident log to CSV"
          >
            Export CSV
          </Button>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} aria-label="Refresh accident data" size="large">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>

        <AnimatePresence>
          {filteredAccidents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((accident, index) => {
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
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
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
                  role="article"
                  aria-label={`Accident event ${accident.id}, severity ${severity.label}`}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
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
                                rel="noopener noreferrer"
                                sx={{ p: 0.5 }}
                                aria-label={`View location on map: ${accident.lat}, ${accident.lng}`}
                              >
                                <LocationOn fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    </Stack>

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

        {filteredAccidents.length > ROWS_PER_PAGE && (
          <Paper sx={{ borderRadius: 3 }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredAccidents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
            />
          </Paper>
        )}

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