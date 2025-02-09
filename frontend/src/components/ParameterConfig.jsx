import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Button,
  Grid,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TuneIcon from '@mui/icons-material/Tune';

const ParameterConfig = ({ selectedProblem, selectedAlgorithm, parameters, onParametersChange, onOptimize, disabled }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Validate parameters based on problem type
  useEffect(() => {
    if (selectedProblem && parameters) {
      // ZDT problems are always bi-objective
      if (selectedProblem.startsWith('zdt') && parameters.n_obj !== 2) {
        setValidationError('ZDT problems must have exactly 2 objectives');
        onParametersChange({ ...parameters, n_obj: 2 });
      } else {
        setValidationError(null);
      }
    }
  }, [selectedProblem, parameters]);

  const handleParameterChange = (param) => (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      // Apply constraints based on problem type
      if (param === 'n_obj') {
        if (selectedProblem?.startsWith('zdt')) {
          // Force n_obj to be 2 for ZDT problems
          onParametersChange({
            ...parameters,
            n_obj: 2
          });
          return;
        }
        // For other problems, limit n_obj between 2 and 5
        const constrainedValue = Math.min(Math.max(value, 2), 5);
        onParametersChange({
          ...parameters,
          [param]: constrainedValue
        });
      } else {
        onParametersChange({
          ...parameters,
          [param]: value
        });
      }
    }
  };

  const handleSliderChange = (param) => (_, value) => {
    // Apply the same constraints as above
    if (param === 'n_obj' && selectedProblem?.startsWith('zdt')) {
      onParametersChange({
        ...parameters,
        n_obj: 2
      });
    } else {
      onParametersChange({
        ...parameters,
        [param]: value
      });
    }
  };

  const handleOptimizeClick = async () => {
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsOptimizing(true);
    setError(null);
    try {
      await onOptimize();
    } catch (err) {
      console.error('Optimization error:', err);
      setError(err.message || 'Failed to run optimization');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getParameterConfig = () => {
    const baseConfigs = [
      {
        name: 'n_var',
        label: 'Number of Variables',
        min: 2,
        max: 30,
        tooltip: 'Number of decision variables in the optimization problem'
      },
      {
        name: 'n_obj',
        label: 'Number of Objectives',
        min: 2,
        max: 5,
        tooltip: selectedProblem?.startsWith('zdt') 
          ? 'ZDT problems are fixed to 2 objectives'
          : 'Number of objective functions to optimize (2-5)',
        disabled: selectedProblem?.startsWith('zdt')
      },
      {
        name: 'pop_size',
        label: 'Population Size',
        min: 50,
        max: 500,
        step: 50,
        tooltip: 'Size of the population in each generation'
      },
      {
        name: 'n_gen',
        label: 'Number of Generations',
        min: 50,
        max: 1000,
        step: 50,
        tooltip: 'Number of generations to run the optimization'
      }
    ];

    // Modify configs based on selected algorithm
    if (selectedAlgorithm === 'nsga3' || selectedAlgorithm === 'moead') {
      const n_objConfig = baseConfigs.find(c => c.name === 'n_obj');
      if (n_objConfig) {
        n_objConfig.tooltip += '\nNote: Higher dimensions (4-5) may increase computation time';
      }
    }

    return baseConfigs;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TuneIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Parameter Configuration
        </Typography>
      </Box>

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Collapse>

      <Grid container spacing={3}>
        {getParameterConfig().map((param) => (
          <Grid item xs={12} key={param.name}>
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                transition: 'background-color 0.3s',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Tooltip title={param.tooltip}>
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {param.label}
                  </Typography>
                </Tooltip>
                <TextField
                  size="small"
                  value={parameters[param.name]}
                  onChange={handleParameterChange(param.name)}
                  type="number"
                  disabled={param.disabled}
                  InputProps={{
                    inputProps: { 
                      min: param.min, 
                      max: param.max,
                      step: param.step || 1
                    }
                  }}
                  sx={{ 
                    width: 100,
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3',
                      },
                    },
                  }}
                />
              </Box>
              <Slider
                value={parameters[param.name]}
                onChange={handleSliderChange(param.name)}
                min={param.min}
                max={param.max}
                step={param.step || 1}
                disabled={param.disabled}
                marks={[
                  { value: param.min, label: param.min },
                  { value: param.max, label: param.max }
                ]}
                sx={{
                  '& .MuiSlider-thumb': {
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.2)',
                    },
                  },
                  '& .MuiSlider-markLabel': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleOptimizeClick}
          disabled={disabled || isOptimizing || !!validationError}
          startIcon={isOptimizing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          sx={{
            minWidth: 200,
            py: 1.5,
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2 30%, #1ba8d2 90%)',
            },
            '&.Mui-disabled': {
              background: 'rgba(255, 255, 255, 0.12)',
            }
          }}
        >
          {isOptimizing ? 'Optimizing...' : 'Start Optimization'}
        </Button>
      </Box>
    </Box>
  );
};

export default ParameterConfig;
