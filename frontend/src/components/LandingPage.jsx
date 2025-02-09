import { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const particleAnimation = keyframes`
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(var(--tx), var(--ty));
  }
`;

const Particle = ({ size, color, delay, tx, ty }) => (
  <Box
    sx={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: '50%',
      position: 'absolute',
      opacity: 0.6,
      animation: `${particleAnimation} 3s infinite`,
      animationDelay: `${delay}s`,
      '--tx': tx,
      '--ty': ty,
    }}
  />
);

const LandingPage = ({ onStart }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 10 + 5,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      delay: Math.random() * 2,
      tx: `${(Math.random() - 0.5) * 200}px`,
      ty: `${(Math.random() - 0.5) * 200}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: particle.left,
            top: particle.top,
          }}
        >
          <Particle {...particle} />
        </Box>
      ))}
      
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontFamily: 'Uniform Rounded, Arial, sans-serif',
            fontSize: { xs: '3rem', md: '5rem' },
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          pym∞
        </Typography>

        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Discover the Power of Multi-Objective Optimization
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 6,
            color: 'text.secondary',
            maxWidth: '600px',
            fontSize: '1.1rem',
          }}
        >
          Experience real-time visualization of evolutionary algorithms solving complex multi-objective optimization problems.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={onStart}
          startIcon={<PlayArrowIcon />}
          sx={{
            py: 2,
            px: 4,
            fontSize: '1.2rem',
            borderRadius: 2,
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            animation: `${pulse} 2s infinite`,
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2 30%, #1ba8d2 90%)',
            },
          }}
        >
          Start Optimizing
        </Button>

        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'text.secondary',
            zIndex: 2,
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
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Shashank Raj
            </a>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LandingPage;
