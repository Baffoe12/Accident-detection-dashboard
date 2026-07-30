import React, { useEffect, useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, Alert, Grid } from '@mui/material';
import api from '../api';
import SensorGauge from './SensorGauge';

export default function RealTimeSensor() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const sensorData = await api.getLatestSensorData(abortControllerRef.current.signal);
        setData(sensorData);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to fetch sensor data');
          console.error(err);
        } else {
          console.log('Fetch aborted');
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const isDangerous = (data) => {
    return data.alcohol > 0.05 || 
           data.impact > 2.0 || 
           data.distance < 20 || 
           !data.seatbelt;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>Real-Time Sensor Data</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {data && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {isDangerous(data) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Warning: Dangerous conditions detected!
                </Alert>
              )}
            </Grid>
            <Grid item xs={12} container spacing={2} justifyContent="center">
              <Grid item>
                <SensorGauge 
                  value={data.alcohol} 
                  maxValue={0.1} 
                  label="Alcohol" 
                  dangerThreshold={0.05}
                />
              </Grid>
              <Grid item>
                <SensorGauge 
                  value={data.impact} 
                  maxValue={5} 
                  label="Impact" 
                  dangerThreshold={2.0}
                  unit="g"
                />
              </Grid>
              <Grid item>
                <SensorGauge 
                  value={data.distance} 
                  maxValue={200} 
                  label="Distance" 
                  dangerThreshold={20}
                  unit="m"
                />
              </Grid>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
