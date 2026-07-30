import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Fade, Paper, Grow, Stack, CircularProgress } from '@mui/material';
import LiveSensorCard from './LiveSensorCard';
import StatsCard from './StatsCard';
import DownloadReportButton from './DownloadReportButton';
import HeartRateCard from './HeartRateCard';
import AccidentImpactTable from './AccidentImpactTable'; // Import the new component
import ConnectionStatusButton from './ConnectionStatusButton'; // Import the new component
import RealTimeSensor from './RealTimeSensor';
import api from '../api';

function AnimatedStat({ children, delay = 0 }) {
  return (
    <Grow in timeout={800} style={{ transitionDelay: `${delay}ms` }}>
      <Box>{children}</Box>
    </Grow>
  );
}

export default function DashboardHome() {
  const [show, setShow] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setShow(true);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getLatestSensorData();
        setSensorData(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch sensor data:', err);
        setError('Unable to connect to server. Please check your internet connection.');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);

  }, [retryCount]);

  return (
    <Fade in={show} timeout={700}>
      <Box sx={{
        minHeight: '100vh',
        background: '#fff',
        py: 8,
        px: { xs: 3, md: 10 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
      }}>
        {/* Animated Divider Top */}
        <Box sx={{position:'absolute',top:0,left:0,width:'100%',height:90,overflow:'hidden',zIndex:1}}>
          <svg viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
            <path d="M0,50 Q720,140 1440,50 L1440,0 L0,0 Z" fill="#fff" opacity="0.7">
              <animate attributeName="d" values="M0,50 Q720,140 1440,50 L1440,0 L0,0 Z;M0,35 Q720,100 1440,35 L1440,0 L0,0 Z;M0,50 Q720,140 1440,50 L1440,0 L0,0 Z" dur="8s" repeatCount="indefinite" />
            </path>
          </svg>
        </Box>
        {/* Homepage topic/title - centered with space above */}
        <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', mt:6, mb:2}}>
          <Typography variant="h2" fontWeight="bold" sx={{ letterSpacing: 2, textAlign: 'center', textShadow:'0 4px 16px #2c5364', color: '#1976d2' }}>
            SafeDrive Public Safety Dashboard
          </Typography>
        </Box>
        {/* Image, Message, and Connection Status Button - responsive layout */}
        <Box sx={{
          display:'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems:'center',
          justifyContent:'center',
          gap:2,
          mb:3
        }}>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG2BJIdWAZI4w_mCWYb_HzGCNAgcBlL-Bf9CqaKoSjMgtlqXo&s" alt="Two Cars Crash" style={{height: 200, width: 320, borderRadius: 12, boxShadow:'0 4px 18px #aaa', objectFit: 'cover', maxWidth: '90vw'}} />
          <Box sx={{
            display:'flex',
            flexDirection:'column',
            height: { xs: 'auto', sm: 200 },
            justifyContent:'flex-end',
            alignItems:'flex-end',
            ml: { xs: 0, sm: 2 },
            mt: { xs: 2, sm: 0 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Box sx={{
              background:'#000',
              px:2, py:1, borderRadius:2, width: { xs: '100%', sm: 260 },
              textAlign:{ xs: 'center', sm: 'right' }, mb:2
            }}>
              <Typography sx={{color:'#fff', fontWeight:'bold', fontSize:22, letterSpacing:1.2}}>
                Life is precious. Drive Safe. Arrive Alive!
              </Typography>
            </Box>
            <Box sx={{alignSelf:{ xs: 'center', sm: 'flex-start' }, mt:'auto'}}>
              <ConnectionStatusButton />
            </Box>
          </Box>
        </Box>
        {/* Animated Divider Middle */}
        <Box sx={{width:'100%',maxWidth:1400,mt:3,mb:6,position:'relative',zIndex:2}}>
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'40px',display:'block'}}>
            <path d="M0,30 Q720,80 1440,30" stroke="#1e3c72" strokeWidth="3" fill="none">
              <animate attributeName="d" values="M0,30 Q720,80 1440,30;M0,15 Q720,40 1440,15;M0,30 Q720,80 1440,30" dur="7s" repeatCount="indefinite" />
            </path>
          </svg>
        </Box>
        {/* Main sensor widgets row with LiveSensorCard between CarTracker and HeartPulse */}
        <Grid container spacing={5} justifyContent="center" alignItems="stretch" sx={{maxWidth: 1400, mb: 3, zIndex:2}}>
          <Grid item xs={12} md={8}>
            <AnimatedStat delay={300}>
              <Card sx={{
                minHeight: 320,
                minWidth: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 5,
                boxShadow: 12,
                background: 'linear-gradient(135deg,#232526 0%,#2c5364 100%)',
                transition: 'transform 0.4s cubic-bezier(.25,1.25,.5,1.1), box-shadow 0.4s',
                ':hover': {
                  transform: 'scale(1.11) rotate(-3deg)',
                  boxShadow: '0 12px 36px #0f2027cc',
                  background: 'linear-gradient(135deg,#2c5364 0%,#232526 100%)',
                },
                m: 'auto',
                p: 3,
              }}>
              
                <LiveSensorCard />
              </Card>
            </AnimatedStat>
          </Grid>
          <Grid item xs={12} md={4}>
            <AnimatedStat delay={400}>
              <Card sx={{
                minHeight: 320,
                minWidth: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 5,
                boxShadow: 12,
                background: 'linear-gradient(135deg,#232526 0%,#2c5364 100%)',
                transition: 'transform 0.4s cubic-bezier(.25,1.25,.5,1.1), box-shadow 0.4s',
                ':hover': {
                  transform: 'scale(1.11) rotate(3deg)',
                  boxShadow: '0 12px 36px #0f2027cc',
                  background: 'linear-gradient(135deg,#2c5364 0%,#232526 100%)',
                },
                m: 'auto',
                p: 3,
              }}>
                <HeartRateCard />
              </Card>
            </AnimatedStat>
          </Grid>
        </Grid>
        {/* Real-time Sensor Data Section */}
        <Grid container spacing={3} justifyContent="center" sx={{maxWidth: 1400, mb: 4, zIndex:2}}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Vehicle Status
                </Typography>
                {loading ? (
                  <CircularProgress />
                ) : sensorData ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography color={sensorData.alcohol > 0.05 ? 'error' : 'textPrimary'}>
                        Alcohol Level: {sensorData.alcohol}
                      </Typography>
                    </Grid>
                    {/* Add more sensor readings */}
                  </Grid>
                ) : (
                  <Typography color="error">No sensor data available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      {/* StatsCards Section - moved above Accident Impact Table */}
<Box sx={{width:'100%', maxWidth:900, mb:4, zIndex:2, mx:'auto'}}>
  <AnimatedStat delay={500}>
    <StatsCard />  {/* Changed from StatsCards */}
  </AnimatedStat>
</Box>
        {/* Accident Impact Table Section */}
        <Grid container justifyContent="center" sx={{maxWidth: 1400, mx: 'auto', mb: 4}}>
          <Grid item xs={12}>
            <AccidentImpactTable />
          </Grid>
        </Grid>
        {/* RealTimeSensor Component */}
        <Grid container spacing={3} justifyContent="center" sx={{maxWidth: 1400, mb: 4, zIndex:2}}>
          <Grid item xs={12}>
            <RealTimeSensor />
          </Grid>
        </Grid>
        {/* Animated Divider Bottom */}
        <Box sx={{width:'100%',maxWidth:1400,mb:4,position:'relative',zIndex:2}}>
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'40px',display:'block'}}>
            <path d="M0,15 Q720,40 1440,15" stroke="#1e3c72" strokeWidth="3" fill="none">
              <animate attributeName="d" values="M0,15 Q720,40 1440,15;M0,30 Q720,80 1440,30;M0,15 Q720,40 1440,15" dur="7s" repeatCount="indefinite" />
            </path>
          </svg>
        </Box>
        <Grow in={show} timeout={1200} style={{ transitionDelay: '600ms' }}>
          <Card sx={{ mt: 6, mb: 3, borderRadius: 5, boxShadow: 14, background: 'linear-gradient(100deg,#232526 0%,#414345 100%)', border: 0, maxWidth: 1400, mx: 'auto', zIndex:2, minHeight: 440, p: 3 }} elevation={14}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <img src="https://img.icons8.com/fluency/128/ambulance.png" alt="Rescue" style={{marginRight: 32, filter: 'drop-shadow(0 2px 16px #1e3c72)'}}/>
                <Typography variant="h3" fontWeight="bold" color="#fff" sx={{ letterSpacing: 1, fontSize: 48 }}>Safe Driving & Rescue Measures</Typography>
              </Box>
              <Typography variant="h6" color="#b0bec5" mb={2} sx={{fontSize: 26}}>
                <i>Empowering you to respond confidently and safely in emergencies.</i>
              </Typography>
              <Box component="ol" sx={{pl: 4, mb: 2, fontSize: 26, color: '#fff'}}>
                <li><b>Stay Calm:</b> Assess the situation and prioritize your safety first.</li>
                <li><b>Locate the Incident:</b> Use the dashboard map to pinpoint the accident site, view the address, and trace the route.</li>
                <li><b>Navigate with Confidence:</b> Click <span style={{color:'#90caf9',fontWeight:'bold'}}>Navigate</span> on the map popup for instant GPS directions.</li>
                <li><b>Alert Authorities:</b> Call emergency services and share the dashboard address for a swift response.</li>
                <li><b>Provide Aid:</b> Offer first aid only if you are trained. Do not move the injured unless absolutely necessary.</li>
                <li><b>Share Information:</b> Relay all dashboard data to responders on arrival for better care.</li>
                <li><b>Drive Responsibly:</b> Obey traffic laws and stay alert when traveling to or from accident scenes.</li>
              </Box>
              <Box bgcolor="#232526" p={3} borderRadius={3} boxShadow={3} textAlign="center" mt={3}>
                <Typography variant="h5" color="#90caf9" fontWeight="bold" sx={{fontSize: 32}}>
                  SafeDrive Pro: Real-time accident location, live tracking, and emergency alerts—because every second counts.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grow>
      </Box>
    </Fade>
  );
}
