import React, { useState, useEffect } from 'react';
import { Button, Tooltip, CircularProgress } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';

export default function ConnectionStatusButton() {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(false);

  // Simulate checking connection status
  const checkConnection = () => {
    setChecking(true);
    // Simulate async check (replace with real check if available)
    setTimeout(() => {
      // Randomly set connected or disconnected for demo
      setConnected(Math.random() > 0.3);
      setChecking(false);
    }, 1000);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Tooltip title={connected ? "Connected" : "Disconnected"}>
      <Button
        variant="outlined"
        color={connected ? "success" : "error"}
        startIcon={checking ? <CircularProgress size={20} /> : (connected ? <WifiIcon /> : <WifiOffIcon />)}
        onClick={checkConnection}
        size="small"
      >
        {checking ? "Checking..." : connected ? "Connected" : "Disconnected"}
      </Button>
    </Tooltip>
  );
}
