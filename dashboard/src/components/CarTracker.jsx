import React, { useEffect, useState, useRef } from 'react';
import { Paper, Box, Typography, CircularProgress, Fade } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

// Fix default icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const carIcon = new L.DivIcon({
  html: '<div style="color: blue; font-size: 24px;"><svg xmlns="http://www.w3.org/2000/svg" fill="blue" viewBox="0 0 24 24" width="24" height="24"><path d="M5 16c-1.1 0-2 .9-2 2v1h2v-1h14v1h2v-1c0-1.1-.9-2-2-2H5zm14-5V7c0-1.1-.9-2-2-2h-3V3H10v2H7c-1.1 0-2 .9-2 2v4H3v2h18v-2h-2z"/></svg></div>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function CarTracker() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef();

  useEffect(() => {
    let intervalId;

    const fetchPosition = async () => {
      try {
        const res = await fetch('/api/car/position');
        if (!res.ok) throw new Error('Failed to fetch position');
        const data = await res.json();
        if (data.lat && data.lng) {
          setPositions(prev => {
            const newPositions = [...prev, [data.lat, data.lng]];
            // Keep only last 50 positions to limit memory
            return newPositions.length > 50 ? newPositions.slice(newPositions.length - 50) : newPositions;
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching car position:', err);
        setLoading(false);
      }
    };

    fetchPosition();
    intervalId = setInterval(fetchPosition, 3000); // fetch every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (mapRef.current && positions.length > 0) {
      const map = mapRef.current;
      map.flyTo(positions[positions.length - 1], 15, { duration: 1.5 });
    }
  }, [positions]);

  return (
    <Fade in timeout={700}>
      <Paper sx={{ p: 2, mb: 2, minHeight: 300 }}>
        <Typography variant="h6" gutterBottom>Car Tracker</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 250 }}>
            <CircularProgress />
          </Box>
        ) : positions.length === 0 ? (
          <Typography color="error">No car position data available</Typography>
        ) : (
          <MapContainer
            center={positions[positions.length - 1]}
            zoom={15}
            style={{ height: 250, width: '100%' }}
            whenCreated={mapInstance => { mapRef.current = mapInstance; }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={positions[positions.length - 1]} icon={carIcon} />
            <Polyline positions={positions} color="blue" />
          </MapContainer>
        )}
      </Paper>
    </Fade>
  );
}
