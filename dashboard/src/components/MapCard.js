import React, { useEffect, useState, useRef } from 'react';
import { Paper, Box, Typography, CircularProgress, Fade } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from '../api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const carIcon = new L.DivIcon({
  html: '<div style="color: #1976d2; font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"><svg xmlns="http://www.w3.org/2000/svg" fill="#1976d2" viewBox="0 0 24 24" width="28" height="28"><path d="M5 16c-1.1 0-2 .9-2 2v1h2v-1h14v1h2v-1c0-1.1-.9-2-2-2H5zm14-5V7c0-1.1-.9-2-2-2h-3V3H10v2H7c-1.1 0-2 .9-2 2v4H3v2h18v-2h-2z"/></svg></div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function useMapCenter(mapRef, position) {
  useEffect(() => {
    if (mapRef.current && position) {
      const map = mapRef.current;
      map.setView(position, 15, { animate: true, duration: 0.8 });
    }
  }, [position]);
}

export default function MapCard({ compact = false, height = 300 }) {
  const [position, setPosition] = useState(null);
  const [path, setPath] = useState([]);
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsValid, setGpsValid] = useState(false);
  const mapRef = useRef();
  const pathRef = useRef([]);

  useEffect(() => {
    let intervalId;

    const fetchPosition = async () => {
      try {
        const [sensorResult, carResult] = await Promise.allSettled([
          api.getLatestSensorData(),
          api.getCarPosition(),
        ]);

        const sensor = sensorResult.status === 'fulfilled' ? sensorResult.value : null;
        const car = carResult.status === 'fulfilled' ? carResult.value : null;

        const lat = sensor?.lat ?? car?.lat;
        const lng = sensor?.lng ?? car?.lng;

        if (lat && lng) {
          const pos = [lat, lng];
          setPosition(pos);
          setSensorData(sensor);
          setGpsValid(sensor?.gps_valid !== false);

          pathRef.current = [...pathRef.current, pos];
          if (pathRef.current.length > 100) {
            pathRef.current = pathRef.current.slice(-100);
          }
          setPath([...pathRef.current]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching car position:', err);
        setLoading(false);
      }
    };

    fetchPosition();
    intervalId = setInterval(fetchPosition, 3000);

    return () => clearInterval(intervalId);
  }, []);

  useMapCenter(mapRef, position);

  const speed = sensorData?.speed ?? 0;
  const motorSpeed = sensorData?.motor_speed ?? 0;

  return (
    <Fade in timeout={600}>
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsCarIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Live Vehicle Tracking
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: gpsValid ? 'success.main' : 'error.main',
                animation: gpsValid ? 'pulse 2s infinite' : 'none',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {gpsValid ? 'GPS Active' : 'No Signal'}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height }}>
            <CircularProgress size={32} />
          </Box>
        ) : !position ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height }}>
            <Typography variant="body2" color="text.secondary">
              Waiting for vehicle position...
            </Typography>
          </Box>
        ) : (
          <>
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: compact ? 200 : height, width: '100%' }}
              zoomControl={false}
              attributionControl={false}
              whenCreated={(map) => { mapRef.current = map; }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              {path.length > 1 && (
                <Polyline
                  positions={path}
                  color="#1976d2"
                  weight={3}
                  opacity={0.6}
                  dashArray="4, 8"
                />
              )}
              <Marker position={position} icon={carIcon} />
            </MapContainer>

            {!compact && (
              <Box sx={{ display: 'flex', gap: 2, mt: 1.5, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SpeedIcon fontSize="small" color="primary" />
                  <Typography variant="caption" fontWeight={600}>
                    {speed} km/h
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon fontSize="small" color="primary" />
                  <Typography variant="caption" fontWeight={600}>
                    {position[0].toFixed(4)}, {position[1].toFixed(4)}
                  </Typography>
                </Box>
                {motorSpeed > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Motor: {motorSpeed}%
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Fade>
  );
}