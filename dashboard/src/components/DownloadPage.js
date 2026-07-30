import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import api, { API_BASE_URL } from '../api';

export default function DownloadPage() {
  const [sensorData, setSensorData] = useState([]);
  const [accidentData, setAccidentData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showNotification = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const fetchWithRetry = useCallback(async (url, options = {}, retries = 2) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (retries > 0) return fetchWithRetry(url, options, retries - 1);
      throw err;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [sensorRes, accidentRes, statsRes] = await Promise.allSettled([
          fetchWithRetry(`${API_BASE_URL}/api/sensor/history`),
          fetchWithRetry(`${API_BASE_URL}/api/accidents`),
          fetchWithRetry(`${API_BASE_URL}/api/stats`),
        ]);

        if (sensorRes.status === 'fulfilled') setSensorData(sensorRes.value || []);
        if (accidentRes.status === 'fulfilled') setAccidentData(accidentRes.value || []);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value || null);
      } catch (err) {
        console.error('Data loading error:', err);
        setError(err.message);
        showNotification('Some data failed to load', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchWithRetry, showNotification]);

  const downloadFile = useCallback((content, filename, type = 'application/json') => {
    try {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Download failed:', err);
      showNotification('Download failed. Please try again.', 'error');
      return false;
    }
  }, [showNotification]);

  const downloadAllData = useCallback(() => {
    const evidencePackage = {
      timestamp: new Date().toISOString(),
      sensor_data: sensorData,
      accident_data: accidentData,
      statistics: stats,
    };
    const dataStr = JSON.stringify(evidencePackage, null, 2);
    const filename = `safedrive_evidence_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    if (downloadFile(dataStr, filename)) {
      showNotification('Evidence package downloaded successfully!', 'success');
    }
  }, [sensorData, accidentData, stats, downloadFile, showNotification]);

  const convertToCSV = useCallback((data) => {
    if (!data || !data.length) return null;
    const headers = Object.keys(data[0]);
    const escapeCsv = (value) =>
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    return [
      headers.join(','),
      ...data.map(row => headers.map(field => escapeCsv(row[field] ?? '')).join(',')),
    ].join('\n');
  }, []);

  const downloadAsCSV = useCallback((data, filename) => {
    const csvContent = convertToCSV(data);
    if (!csvContent) {
      showNotification('No data available to download', 'warning');
      return;
    }
    if (downloadFile(csvContent, filename, 'text/csv')) {
      showNotification(`${filename} downloaded`, 'success');
    }
  }, [convertToCSV, downloadFile, showNotification]);

  const downloadPDFReport = useCallback(async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('SafeDrive Pro Report', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Sensor Readings: ${sensorData.length}`, 14, 40);
      doc.text(`Accident Events: ${accidentData.length}`, 14, 50);
      if (stats) {
        doc.text(`Total Accidents: ${stats.total_accidents}`, 14, 60);
        doc.text(`Max Impact: ${stats.max_impact}g`, 14, 70);
      }
      const filename = `safedrive_report_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
      showNotification('PDF report generated', 'success');
    } catch (err) {
      console.error('PDF generation failed:', err);
      showNotification('Failed to generate PDF', 'error');
    }
  }, [sensorData, accidentData, stats, showNotification]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress size={48} thickness={3} />
    </Box>
  );

  if (error && !sensorData.length && !accidentData.length && !stats) return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body1">Failed to load data: {error}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => window.location.reload()}>Retry</Button>
      </Alert>
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FileDownloadIcon color="primary" /> Download Evidence Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Export sensor data, accident reports, and system statistics
          </Typography>
        </motion.div>

        {/* Complete Evidence Package */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3, overflow: 'hidden', position: 'relative' }}>
          <Box sx={{ height: 4, background: 'linear-gradient(90deg, #1976d2, #0d47a1, #1976d2)' }} />
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: alpha('#1976d2', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileDownloadIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>Complete Evidence Package</Typography>
                <Typography variant="body2" color="text.secondary">
                  All data in a single downloadable file
                </Typography>
              </Box>
            </Stack>

            <List dense>
              <ListItem>
                <ListItemText primary="Sensor Data" secondary={`${sensorData.length} records`} />
                <Chip label={sensorData.length ? 'Available' : 'No Data'} color={sensorData.length ? 'success' : 'error'} icon={sensorData.length ? <CheckCircleIcon /> : <WarningIcon />} size="small" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Accident Events" secondary={`${accidentData.length} records`} />
                <Chip label={accidentData.length ? 'Available' : 'No Data'} color={accidentData.length ? 'success' : 'error'} icon={accidentData.length ? <CheckCircleIcon /> : <WarningIcon />} size="small" />
              </ListItem>
              <ListItem>
                <ListItemText primary="System Statistics" secondary={stats ? 'Available' : 'Not available'} />
                <Chip label={stats ? 'Available' : 'No Data'} color={stats ? 'success' : 'error'} icon={stats ? <CheckCircleIcon /> : <WarningIcon />} size="small" />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={downloadAllData}
                  disabled={!sensorData.length && !accidentData.length && !stats}
                  sx={{ px: 5, py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                >
                  Download Package
                </Button>
              </motion.div>
            </Box>
          </CardContent>
        </Card>

        {/* Individual Downloads */}
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4, mb: 2 }}>
          Individual Downloads
        </Typography>

        <Grid container spacing={3}>
          {[
            {
              title: 'Sensor Data (CSV)',
              description: 'Raw sensor readings for analysis and export',
              data: sensorData,
              filename: 'sensor_data.csv',
              icon: <FileDownloadIcon color="primary" sx={{ fontSize: 32 }} />,
              color: '#2196f3',
            },
            {
              title: 'Accident Events (CSV)',
              description: 'Accident event details for review and reporting',
              data: accidentData,
              filename: 'accidents.csv',
              icon: <FileDownloadIcon color="error" sx={{ fontSize: 32 }} />,
              color: '#f44336',
            },
            {
              title: 'PDF Report',
              description: 'Formatted report with analysis and summary',
              action: downloadPDFReport,
              icon: <FileDownloadIcon color="success" sx={{ fontSize: 32 }} />,
              color: '#4caf50',
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, type: 'spring', stiffness: 80 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: 2,
                    border: `1px solid ${alpha(item.color, 0.15)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 8px 30px ${alpha(item.color, 0.15)}`,
                      borderColor: alpha(item.color, 0.3),
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2, color: item.color }}>{item.icon}</Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={item.action || (() => downloadAsCSV(item.data, item.filename))}
                        disabled={item.data && !item.data.length}
                        fullWidth
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                        color={item.color === '#2196f3' ? 'primary' : item.color === '#f44336' ? 'error' : 'success'}
                      >
                        Download
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </motion.div>
  );
}