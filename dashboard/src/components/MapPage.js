import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Paper, Grid, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import {
  DirectionsCar,
  LocationOn,
  Speed,
  WarningAmber,
  Navigation,
  Route,
  Refresh,
  AccessTime,
} from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import api from '../api';
import MapCard from './MapCard';

const carIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/car--v1.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const accidentIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/high-priority.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

api.getMapData = api.getMapData || (() => api.getAccidents());

function CarMarker({ position, sensorData }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker position={position} icon={carIcon}>
      <Popup>
        <Box sx={{ fontFamily: 'Arial', fontSize: '14px', minWidth: '220px' }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            Live Vehicle Tracking
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Position:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lat: {sensorData?.lat?.toFixed(6) || position[0].toFixed(6)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lng: {sensorData?.lng?.toFixed(6) || position[1].toFixed(6)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Vehicle Speed:</strong> {sensorData?.speed || 0} km/h
            </Typography>
            <Typography variant="body2">
              <strong>LCD Display:</strong> {sensorData?.lcd_display || 'No data'}
            </Typography>
            <Typography variant="body2">
              <strong>GPS Status:</strong> {sensorData?.gps_valid !== false ? 'Valid' : 'Invalid'}
            </Typography>
          </Box>
        </Box>
      </Popup>
    </Marker>
  );
}

function useReverseGeocode(lat, lng) {
  const [address, setAddress] = useState('');
  useEffect(() => {
    if (lat && lng) {
      setAddress('Loading address...');
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => setAddress(data.display_name || 'Address not found'))
        .catch(() => setAddress('Address not found'));
    }
  }, [lat, lng]);
  return address;
}

function MapPage() {
  const [locations, setLocations] = useState([]);
  const [carPos, setCarPos] = useState(null);
  const [carPath, setCarPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carPathRef = useRef([]);
  const [addresses, setAddresses] = useState({});
  const [gpsInfo, setGpsInfo] = useState({
    lat: 0,
    lng: 0,
    speed: 0,
    lcd_display: '',
    gps_valid: false,
  });
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    console.log('MapPage: Fetching accident locations...');
    api.getMapData()
      .then(data => {
        console.log('MapPage: Received accident locations:', data);
        setLocations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('MapPage: Error fetching accident locations:', err);
        setError('Failed to fetch accident locations');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const sensorData = await api.getLatestSensorData();
        if (sensorData?.lat && sensorData?.lng) {
          const pos = [sensorData.lat, sensorData.lng];
          setCarPos(pos);
          setGpsInfo({
            lat: sensorData.lat,
            lng: sensorData.lng,
            speed: sensorData.speed || 0,
            lcd_display: sensorData.lcd_display || '',
            gps_valid: sensorData.gps_valid !== false,
          });
          setLastUpdate(new Date());

          if ((sensorData.gps_valid !== false) &&
              (!carPathRef.current.length ||
               carPathRef.current[carPathRef.current.length - 1][0] !== pos[0] ||
               carPathRef.current[carPathRef.current.length - 1][1] !== pos[1])) {
            carPathRef.current = [...carPathRef.current, pos];
            setCarPath([...carPathRef.current]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch car position:', err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      const validLocations = locations.filter(loc =>
        loc &&
        typeof loc.lat === 'number' &&
        !isNaN(loc.lat) &&
        typeof loc.lng === 'number' &&
        !isNaN(loc.lng)
      );

      if (validLocations.length === 0) {
        console.log('No valid locations to geocode');
        return;
      }

      const promises = validLocations.map(loc => {
        return fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lng}`)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(data => ({
            id: loc.id,
            address: data.display_name || 'Address not found'
          }))
          .catch(err => {
            console.warn(`Failed to fetch address for location ${loc.id}:`, err);
            return { id: loc.id, address: 'Address lookup failed' };
          });
      });

      try {
        const resolvedAddresses = await Promise.all(promises);
        const addressesObj = resolvedAddresses.reduce((acc, curr) => ({
          ...acc,
          [curr.id]: curr.address
        }), {});
        setAddresses(addressesObj);
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      }
    };

    if (locations.length > 0) {
      fetchAddresses();
    }
  }, [locations]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CircularProgress />
      </motion.div>
    </Box>
  );

  if (error) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography color="error">{error}</Typography>
    </motion.div>
  );

  const center = carPos || (locations.length && locations[0].lat && locations[0].lng
    ? [locations[0].lat, locations[0].lng]
    : [5.6545, -0.1869]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
        >
          <Typography variant="h5" mb={2}>
            Car Tracking
            <Box component="span" sx={{ ml: 2, fontSize: '1rem', color: gpsInfo.gps_valid ? 'success.main' : 'error.main' }}>
              {gpsInfo.gps_valid ? '● Live' : '● No Signal'} |
              Lat: {gpsInfo.lat.toFixed(6)}, Lng: {gpsInfo.lng.toFixed(6)} |
              Speed: {gpsInfo.speed} km/h |
              LCD: {gpsInfo.lcd_display || 'No data'}
            </Box>
          </Typography>
        </motion.div>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 80, delay: 0.3 }}
            >
              <Paper sx={{ height: 450, overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {locations.map((loc, i) => {
                    if (!loc || typeof loc.lat === 'undefined' || typeof loc.lng === 'undefined') {
                      return null;
                    }
                    return (
                      <Marker key={i} position={[loc.lat, loc.lng]} icon={accidentIcon}>
                        <Popup>
                          <Box sx={{ fontFamily: 'Arial', fontSize: '14px' }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                              Accident #{loc.id}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <strong>Time:</strong> {new Date(loc.timestamp).toLocaleString()}<br />
                              <strong>Location:</strong> {(loc.lat || 0).toFixed(4)}, {(loc.lng || 0).toFixed(4)}<br />
                              <strong>Address:</strong> <span style={{ color: '#1976d2' }}>
                                {addresses[loc.id] || 'Loading address...'}
                              </span>
                            </Box>
                            <Box sx={{ mt: 1 }}>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#1976d2', textDecoration: 'none' }}
                              >
                                View on Google Maps
                              </a>
                            </Box>
                          </Box>
                        </Popup>
                      </Marker>
                    );
                  })}
                  {carPath.length > 1 && (
                    <Polyline
                      positions={carPath}
                      color="#2196f3"
                      weight={3}
                      opacity={0.7}
                      dashArray="5, 10"
                    />
                  )}
                  <CarMarker position={carPos} sensorData={gpsInfo} />
                </MapContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <MapCard compact height={220} />

              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Tracking Details
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Navigation color="primary" fontSize="small" />
                    <Typography variant="body2">
                      Position: {carPos ? `${carPos[0].toFixed(5)}, ${carPos[1].toFixed(5)}` : 'Acquiring...'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed color="primary" fontSize="small" />
                    <Typography variant="body2">
                      Speed: {gpsInfo.speed} km/h
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="primary" fontSize="small" />
                    <Typography variant="body2">
                      Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Route color="primary" fontSize="small" />
                    <Typography variant="body2">
                      Path points: {carPath.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmber
                      color={gpsInfo.gps_valid ? 'success' : 'error'}
                      fontSize="small"
                    />
                    <Typography variant="body2">
                      GPS: {gpsInfo.gps_valid ? 'Valid' : 'Invalid'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Accident Locations
                </Typography>
                {locations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No accident locations recorded
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {locations.slice(0, 5).map((loc, i) => (
                      <Chip
                        key={i}
                        icon={<WarningAmber color="error" />}
                        label={`Accident #${loc.id} — ${(loc.lat || 0).toFixed(4)}, ${(loc.lng || 0).toFixed(4)}`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                    {locations.length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        +{locations.length - 5} more locations
                      </Typography>
                    )}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Note:</strong> The map shows accident locations detected by the SafeDrive Pro system.
            When the MPU6050 detects strong impact or multiple sensors trigger simultaneously,
            the system logs the accident location and can automatically place emergency calls.
          </Typography>
        </motion.div>
      </Box>
    </motion.div>
  );
}

export default MapPage;