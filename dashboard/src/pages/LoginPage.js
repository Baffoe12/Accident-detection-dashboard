import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'safedrive2024',
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
        login(
          { username, role: 'admin', name: 'Administrator' },
          'demo-jwt-token-safedrive-2024'
        );
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1976d2 100%)',
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
        <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 3, boxShadow: 6 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <LockOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                SafeDrive Pro
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your dashboard
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                required
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                inputProps={{ 'aria-label': 'Username' }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                inputProps={{ 'aria-label': 'Password' }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !username || !password}
                sx={{ mt: 2, mb: 1, py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2">
           redentials: <strong>Your Safety is in your Hands</strong> / <strong> </strong>
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}