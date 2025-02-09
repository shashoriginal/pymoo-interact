import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

const ProblemSelector = ({ selectedProblem, onProblemChange }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('/api/problems');  // Updated to use relative path
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProblems(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching problems:', err);
        setError('Failed to load optimization problems');
        setLoading(false);
      }
    };

    fetchProblems();
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
      <Typography variant="h6" gutterBottom>
        Select Problem
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="problem-select-label">Optimization Problem</InputLabel>
        <Select
          labelId="problem-select-label"
          id="problem-select"
          value={selectedProblem}
          label="Optimization Problem"
          onChange={(e) => onProblemChange(e.target.value)}
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
          {problems.map((problem) => (
            <MenuItem key={problem.id} value={problem.id}>
              <Box>
                <Typography variant="subtitle1">
                  {problem.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {problem.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ProblemSelector;
