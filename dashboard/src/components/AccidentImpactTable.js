import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, CircularProgress
} from '@mui/material';
import api from '../api';

export default function AccidentImpactTable() {
  const [accidentImpacts, setAccidentImpacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleRowClick = (row) => {
    setSelected(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAccidents = async () => {
      try {
        const data = await api.getAccidents();
        if (isMounted) {
          setAccidentImpacts(data);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load accident data');
          setLoading(false);
        }
      }
    };

    fetchAccidents();
    const interval = setInterval(fetchAccidents, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Box my={5}>
      <Typography variant="h5" fontWeight="bold" mb={2} color="#000">
        Accident Impact Log
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, background: 'linear-gradient(135deg,#f5f5f5 0%,#e0e0e0 100%)', boxShadow: 8 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Time</TableCell>
                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Impact Level</TableCell>
                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Summary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accidentImpacts.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ cursor: 'pointer', ':hover': { background: 'rgba(229,57,53,0.09)' } }}
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell sx={{ color: '#000' }}>{row.type || 'Unknown'}</TableCell>
                  <TableCell sx={{ color: '#000' }}>{new Date(row.timestamp || row.time).toLocaleString()}</TableCell>
                  <TableCell sx={{ color: row.impactLevel === 'High' ? '#e53935' : row.impactLevel === 'Medium' ? '#ffb300' : '#43a047', fontWeight: 'bold' }}>
                    {row.impactLevel || 'Unknown'}
                  </TableCell>
                  <TableCell sx={{ color: '#000' }}>{row.summary || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for report detail */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Accident Report Detail</DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {selected.type || 'Unknown'} ({selected.impactLevel || 'Unknown'})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Time: {new Date(selected.timestamp || selected.time).toLocaleString()}
              </Typography>
              <Typography variant="body1" mt={2}>
                {selected.details || ''}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
