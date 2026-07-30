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
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';

// API Configuration with correct endpoints
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://safedrive-backend-4h5k.onrender.com',
  ENDPOINTS: {
    SENSOR: '/api/sensor',
    ACCIDENTS: '/api/accidents',
    STATS: '/api/stats',
    HEALTH: '/api/health'
  },
  TIMEOUT: 10000, // 10 seconds
  RETRIES: 2 // Number of retry attempts
};

// Mock data for fallback
const MOCK_DATA = {
  sensor: { data: [
    { id: 1, timestamp: new Date().toISOString(), value: 25.4, unit: 'km/h' },
    { id: 2, timestamp: new Date().toISOString(), value: 0.78, unit: 'g' }
  ] },
  accidents: [
    { id: 1, timestamp: new Date().toISOString(), severity: 'moderate', location: '40.7128,-74.0060' }
  ],
  stats: {
    totalReadings: 42,
    lastUpdated: new Date().toISOString()
  }
};

export default function DownloadPage() {
  const [sensorData, setSensorData] = useState([]);
  const [accidentData, setAccidentData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [usingMockData, setUsingMockData] = useState(false);

  // Show notification
  const showNotification = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  // Enhanced fetch with retries and timeout
  const fetchWithRetry = useCallback(async (url, options = {}, retries = API_CONFIG.RETRIES) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Endpoint not found (404): ${url}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (retries > 0) {
        console.log(`Retrying ${url}... (${retries} attempts left)`);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }, []);

  // Check API health
  const checkApiHealth = useCallback(async () => {
    try {
      await fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`);
      return true;
    } catch {
      return false;
    }
  }, [fetchWithRetry]);

  // Load all data with error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const isApiHealthy = await checkApiHealth();
        if (!isApiHealthy) {
          setUsingMockData(true);
          showNotification('API unavailable. Using demo data.', 'warning');
          setSensorData(MOCK_DATA.sensor.data);
          setAccidentData(MOCK_DATA.accidents);
          setStats(MOCK_DATA.stats);
          setLoading(false);
          return;
        }

        const [sensorRes, accidentRes, statsRes] = await Promise.allSettled([
          fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SENSOR}`),
          fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCIDENTS}`),
          fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STATS}`)
        ]);

        // Process each response
        const processResponse = (response, setData, defaultData) => {
          if (response.status === 'fulfilled') {
            setData(response.value?.data || response.value || defaultData);
            return true;
          } else {
            console.error('Fetch error:', response.reason);
            setData(defaultData);
            return false;
          }
        };

        const results = [
          processResponse(sensorRes, setSensorData, []),
          processResponse(accidentRes, setAccidentData, []),
          processResponse(statsRes, setStats, null)
        ];

        if (!results.some(Boolean)) {
          throw new Error('All API requests failed');
        }

      } catch (error) {
        console.error('Data loading error:', error);
        setError(error.message);
        showNotification('Some data failed to load', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [checkApiHealth, fetchWithRetry, showNotification]);

  // Download file utility
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
    } catch (error) {
      console.error('Download failed:', error);
      showNotification('Download failed. Please try again.', 'error');
      return false;
    }
  }, [showNotification]);

  // Download all data as JSON
  const downloadAllData = useCallback(() => {
    const evidencePackage = {
      timestamp: new Date().toISOString(),
      metadata: {
        source: usingMockData ? 'demo-data' : 'api-data',
        generatedAt: new Date().toISOString()
      },
      sensor_data: sensorData,
      accident_data: accidentData,
      statistics: stats
    };
    
    const dataStr = JSON.stringify(evidencePackage, null, 2);
    const filename = `safedrive_evidence_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    if (downloadFile(dataStr, filename)) {
      showNotification('Download complete!', 'success');
    }
  }, [sensorData, accidentData, stats, downloadFile, showNotification, usingMockData]);

  // Convert data to CSV
  const convertToCSV = useCallback((data) => {
    if (!data || !data.length) return null;
    
    const headers = Object.keys(data[0]);
    const escapeCsv = (value) => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    
    return [
      headers.join(','),
      ...data.map(row => 
        headers.map(field => 
          escapeCsv(row[field] ?? '')
        ).join(',')
      )
    ].join('\n');
  }, []);

  // Download data as CSV
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

  // Generate PDF report
  const downloadPDFReport = useCallback(async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Report header
      doc.setFontSize(18);
      doc.text('SafeDrive Pro Report', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Data Source: ${usingMockData ? 'Demo Data' : 'Live API'}`, 14, 40);
      
      // Data summary
      doc.setFontSize(14);
      doc.text('Data Summary', 14, 50);
      doc.setFontSize(12);
      doc.text(`• Sensor Readings: ${sensorData.length}`, 20, 60);
      doc.text(`• Accident Events: ${accidentData.length}`, 20, 70);
      
      // Save PDF
      const filename = `safedrive_report_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
      
      showNotification('PDF report generated', 'success');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showNotification('Failed to generate PDF', 'error');
    }
  }, [sensorData, accidentData, showNotification, usingMockData]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {usingMockData ? 'Loading demo data...' : 'Connecting to API...'}
        </Typography>
      </Box>
    );
  }

  // Error state (only if no data at all)
  if (error && !sensorData.length && !accidentData.length && !stats) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1">Failed to load data: {error}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Download Evidence Data
        </Typography>
        
        {usingMockData && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body1">
              Note: Currently showing demo data. Real API is unavailable.
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              Partial data loaded. {error}
            </Typography>
          </Alert>
        )}
        
        {/* Main download card */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FileDownloadIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Typography variant="h5" component="div">
                Complete Evidence Package
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">
                Package Contents:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Sensor Data" 
                    secondary={`${sensorData.length} records`} 
                  />
                  <Chip 
                    label={sensorData.length ? "Available" : "No Data"} 
                    color={sensorData.length ? "success" : "error"} 
                    icon={sensorData.length ? <CheckCircleIcon /> : <WarningIcon />}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Accident Events" 
                    secondary={`${accidentData.length} records`} 
                  />
                  <Chip 
                    label={accidentData.length ? "Available" : "No Data"} 
                    color={accidentData.length ? "success" : "error"} 
                    icon={accidentData.length ? <CheckCircleIcon /> : <WarningIcon />}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="System Statistics" 
                    secondary={stats ? "Available" : "Not available"} 
                  />
                  <Chip 
                    label={stats ? "Available" : "No Data"} 
                    color={stats ? "success" : "error"} 
                    icon={stats ? <CheckCircleIcon /> : <WarningIcon />}
                  />
                </ListItem>
              </List>
            </Box>
            
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
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Download Package
                </Button>
              </motion.div>
            </Box>
          </CardContent>
        </Card>
        
        {/* Individual download options */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Individual Data Downloads
        </Typography>
        
        <Grid container spacing={3}>
          {[
            { 
              title: "Sensor Data (CSV)", 
              description: "Raw sensor readings for analysis",
              data: sensorData,
              filename: "sensor_data.csv",
              disabled: !sensorData.length
            },
            { 
              title: "Accident Events (CSV)", 
              description: "Accident event details",
              data: accidentData,
              filename: "accidents.csv",
              disabled: !accidentData.length
            },
            { 
              title: "PDF Report", 
              description: "Formatted report with analysis",
              action: downloadPDFReport,
              disabled: false
            }
          ].map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<FileDownloadIcon />}
                      onClick={item.action || (() => downloadAsCSV(item.data, item.filename))}
                      disabled={item.disabled}
                      fullWidth
                    >
                      Download {item.title.split(' ')[0]}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Notification system */}
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