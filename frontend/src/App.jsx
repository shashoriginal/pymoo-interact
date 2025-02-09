import { useState } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  createTheme,
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Alert,
  Snackbar,
  Fade
} from '@mui/material';
import ProblemSelector from './components/ProblemSelector';
import AlgorithmSelector from './components/AlgorithmSelector';
import ParameterConfig from './components/ParameterConfig';
import OptimizationVisualizer from './components/OptimizationVisualizer';
import LandingPage from './components/LandingPage';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [parameters, setParameters] = useState({
    n_var: 10,
    n_obj: 2,
    pop_size: 100,
    n_gen: 200,
  });
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProblemChange = (problem) => {
    setSelectedProblem(problem);
    // Reset n_obj to 2 for ZDT problems
    if (problem.startsWith('zdt')) {
      setParameters(prev => ({ ...prev, n_obj: 2 }));
    }
  };

  const handleAlgorithmChange = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    // Adjust population size for MOEAD and NSGA3 with higher objectives
    if ((algorithm === 'moead' || algorithm === 'nsga3') && parameters.n_obj > 3) {
      setParameters(prev => ({ 
        ...prev,
        pop_size: Math.max(prev.pop_size, 200) // Ensure minimum population size for higher dimensions
      }));
    }
  };

  const handleParametersChange = (newParams) => {
    // Validate and adjust parameters based on problem and algorithm
    let adjustedParams = { ...newParams };

    // Force n_obj = 2 for ZDT problems
    if (selectedProblem?.startsWith('zdt')) {
      adjustedParams.n_obj = 2;
    }

    // Adjust population size for higher dimensions
    if ((selectedAlgorithm === 'moead' || selectedAlgorithm === 'nsga3') && adjustedParams.n_obj > 3) {
      adjustedParams.pop_size = Math.max(adjustedParams.pop_size, 200);
    }

    setParameters(adjustedParams);
  };

  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: selectedProblem,
          algorithm: selectedAlgorithm,
          ...parameters,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Optimization failed');
      }
      
      if (data.status === 'success') {
        setOptimizationResults(data.data);
      } else {
        throw new Error(data.message || 'Optimization failed');
      }
    } catch (err) {
      console.error('Error during optimization:', err);
      setError(err.message || 'Failed to run optimization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  if (showLanding) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <LandingPage onStart={() => setShowLanding(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
          background: 'linear-gradient(45deg, #0a1929 30%, #132f4c 90%)',
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: '#fff', 
              mb: 4, 
              textAlign: 'center',
              fontFamily: 'Uniform Rounded, Arial, sans-serif',
              fontSize: { xs: '2rem', md: '2.5rem' },
              background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            pym∞
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <ProblemSelector
                  selectedProblem={selectedProblem}
                  onProblemChange={handleProblemChange}
                />
              </Paper>
              
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <AlgorithmSelector
                  selectedAlgorithm={selectedAlgorithm}
                  onAlgorithmChange={handleAlgorithmChange}
                />
              </Paper>
              
              <Paper elevation={3} sx={{ p: 3 }}>
                <ParameterConfig
                  selectedProblem={selectedProblem}
                  selectedAlgorithm={selectedAlgorithm}
                  parameters={parameters}
                  onParametersChange={handleParametersChange}
                  onOptimize={handleOptimize}
                  disabled={!selectedProblem || !selectedAlgorithm || isLoading}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%', minHeight: '600px' }}>
                <OptimizationVisualizer 
                  results={optimizationResults}
                  isLoading={isLoading}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>

        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">
            Designed by{' '}
            <a
              href="https://github.com/shashoriginal"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2196f3',
                textDecoration: 'none',
              }}
            >
              Shashank Raj
            </a>
          </Typography>
        </Box>

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
