import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Paper,
  Tooltip,
  CircularProgress
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const AlgorithmSelector = ({ selectedAlgorithm, onAlgorithmChange }) => {
  const [algorithms, setAlgorithms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const response = await fetch('/api/algorithms');  // Updated to use relative path
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAlgorithms(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching algorithms:', err);
        setError('Failed to load optimization algorithms');
        setLoading(false);
      }
    };

    fetchAlgorithms();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mr: 1 }}>
          Select Algorithm
        </Typography>
        <Tooltip title="Choose the optimization algorithm that best suits your problem">
          <InfoIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        </Tooltip>
      </Box>
      
      <FormControl fullWidth>
        <InputLabel id="algorithm-select-label">Optimization Algorithm</InputLabel>
        <Select
          labelId="algorithm-select-label"
          id="algorithm-select"
          value={selectedAlgorithm}
          label="Optimization Algorithm"
          onChange={(e) => onAlgorithmChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2196f3',
            },
          }}
        >
          {algorithms.map((algorithm) => (
            <MenuItem key={algorithm.id} value={algorithm.id}>
              <Box>
                <Typography variant="subtitle1">
                  {algorithm.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {algorithm.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedAlgorithm && (
        <Paper 
          variant="outlined" 
          sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)'
          }}
        >
          <Typography variant="body2" color="primary">
            {algorithms.find(a => a.id === selectedAlgorithm)?.description}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AlgorithmSelector;
