import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  Email,
  Badge,
  Logout,
  ChevronRight,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Profile
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main' }}>
              <AccountCircle sx={{ fontSize: 48 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {user.name || 'User'}
              </Typography>
              <Chip label={user.role || 'admin'} size="small" color="primary" sx={{ mt: 1 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Account Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <Badge sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText primary="Username" secondary={user.username || 'admin'} />
            </ListItem>
            <Divider component="li" sx={{ my: 1 }} />
            <ListItem disablePadding>
              <Email sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText primary="Role" secondary={user.role || 'admin'} />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ChevronRight />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}
