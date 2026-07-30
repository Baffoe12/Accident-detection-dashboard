import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../api';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log('Fetching stats...');
    api.getStats()
      .then(data => {
        console.log('Stats data:', data);
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Stats fetch error:', err);
        setError(`Failed to fetch statistics: ${err.message}`);
        setLoading(false);
      });
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return <Alert severity="warning">No statistics available</Alert>;

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'fade', duration: 0.8 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom component={motion.h4}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          System Statistics
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(145deg, #f0f4ff 0%, #e6f0ff 100%)' }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>Total Accidents:</Box>
                <Box component="span" sx={{ fontSize: '1.2rem', color: '#e53935', fontWeight: 'bold' }}>
                  {stats.total_accidents}
                </Box>
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>Max Alcohol Level:</Box>
                <Box component="span" sx={{ fontSize: '1.2rem', color: '#ff9800', fontWeight: 'bold' }}>
                  {stats.max_alcohol.toFixed(2)}
                </Box>
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>Average Alcohol Level:</Box>
                <Box component="span" sx={{ fontSize: '1.2rem', color: '#ff9800', fontWeight: 'bold' }}>
                  {stats.avg_alcohol.toFixed(2)}
                </Box>
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>Max Impact Force:</Box>
                <Box component="span" sx={{ fontSize: '1.2rem', color: '#f44336', fontWeight: 'bold' }}>
                  {stats.max_impact.toFixed(2)}
                </Box>
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>Seatbelt Violations:</Box>
                <Box component="span" sx={{ fontSize: '1.2rem', color: '#e53935', fontWeight: 'bold' }}>
                  {stats.seatbelt_violations}
                </Box>
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>Total Sensor Data Points:</Box>
                <Box component="span" sx={{ fontSize: '1.2rem', color: '#2196f3', fontWeight: 'bold' }}>
                  {stats.total_sensor_points}
                </Box>
              </Typography>
            </motion.div>
          </motion.div>
        </Paper>
      </Box>
    </motion.div>
  );
}
