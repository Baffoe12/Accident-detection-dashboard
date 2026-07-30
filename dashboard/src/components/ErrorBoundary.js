import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Error caught by boundary:', { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, m: 2, bgcolor: '#fff3f3', borderRadius: 2, textAlign: 'center' }} role="alert">
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            An unexpected error occurred. Please try refreshing the page.
          </Typography>
          <Button
            onClick={() => this.setState({ hasError: false })}
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
            aria-label="Try again after error"
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
