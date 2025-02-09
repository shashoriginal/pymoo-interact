import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  IconButton, 
  Tooltip, 
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import Plot from 'react-plotly.js';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    {...other}
  >
    {value === index && (
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const OptimizationVisualizer = ({ results, isLoading }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const getPlotLayout = (title) => ({
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#fff' },
    showlegend: true,
    legend: {
      x: 0,
      y: 1,
      font: { color: '#fff' }
    },
    margin: { t: 80, r: 50, b: 70, l: 50 },
    title: {
      text: title,
      font: { size: 20, color: '#fff' },
      y: 0.95,
      x: 0.5,
      xanchor: 'center',
      yanchor: 'top'
    },
    xaxis: {
      gridcolor: '#444444',
      titlefont: { size: 16, color: '#fff' },
      tickfont: { size: 14, color: '#fff' }
    },
    yaxis: {
      gridcolor: '#444444',
      titlefont: { size: 16, color: '#fff' },
      tickfont: { size: 14, color: '#fff' }
    },
    autosize: true,
    hovermode: 'closest'
  });

  const renderParetoFront = () => {
    if (!results || !results.pareto_front) return null;

    const { objectives } = results.pareto_front;
    const numObjectives = objectives[0].length;

    if (numObjectives === 2) {
      return (
        <Plot
          data={[
            {
              x: objectives.map(point => point[0]),
              y: objectives.map(point => point[1]),
              type: 'scattergl',
              mode: 'markers',
              marker: {
                color: objectives.map((_, i) => i),
                colorscale: 'Viridis',
                size: 10,
                opacity: 0.8,
                line: {
                  color: 'white',
                  width: 1
                }
              },
              name: 'Pareto Front'
            }
          ]}
          layout={{
            ...getPlotLayout('Pareto Front'),
            xaxis: { 
              ...getPlotLayout('').xaxis,
              title: 'Objective 1'
            },
            yaxis: { 
              ...getPlotLayout('').yaxis,
              title: 'Objective 2'
            }
          }}
          style={{ width: '100%', height: isFullscreen ? '90vh' : '500px' }}
          config={{ 
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            toImageButtonOptions: {
              format: 'png',
              filename: 'pareto_front',
              height: 1080,
              width: 1920,
              scale: 2
            }
          }}
        />
      );
    } else if (numObjectives === 3) {
      return (
        <Plot
          data={[
            {
              type: 'scatter3d',
              mode: 'markers',
              x: objectives.map(point => point[0]),
              y: objectives.map(point => point[1]),
              z: objectives.map(point => point[2]),
              marker: {
                color: objectives.map((_, i) => i),
                colorscale: 'Viridis',
                size: 6,
                opacity: 0.8,
                line: {
                  color: 'white',
                  width: 0.5
                }
              },
              name: 'Pareto Front'
            }
          ]}
          layout={{
            ...getPlotLayout('3D Pareto Front'),
            scene: {
              xaxis: { 
                title: 'Objective 1',
                gridcolor: '#444444',
                titlefont: { size: 14, color: '#fff' },
                tickfont: { size: 12, color: '#fff' }
              },
              yaxis: { 
                title: 'Objective 2',
                gridcolor: '#444444',
                titlefont: { size: 14, color: '#fff' },
                tickfont: { size: 12, color: '#fff' }
              },
              zaxis: { 
                title: 'Objective 3',
                gridcolor: '#444444',
                titlefont: { size: 14, color: '#fff' },
                tickfont: { size: 12, color: '#fff' }
              },
              camera: {
                eye: { x: 1.5, y: 1.5, z: 1.5 }
              }
            }
          }}
          style={{ width: '100%', height: isFullscreen ? '90vh' : '500px' }}
          config={{ 
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }}
        />
      );
    } else {
      const dimensions = Array.from({ length: numObjectives }, (_, i) => ({
        range: [
          Math.min(...objectives.map(point => point[i])),
          Math.max(...objectives.map(point => point[i]))
        ],
        label: `Objective ${i + 1}`,
        values: objectives.map(point => point[i])
      }));

      return (
        <Plot
          data={[
            {
              type: 'parcoords',
              line: {
                color: objectives.map((_, i) => i),
                colorscale: 'Viridis'
              },
              dimensions: dimensions
            }
          ]}
          layout={{
            ...getPlotLayout('Parallel Coordinates Plot'),
            margin: { t: 80, r: 80, b: 70, l: 80 }
          }}
          style={{ width: '100%', height: isFullscreen ? '90vh' : '500px' }}
          config={{ 
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }}
        />
      );
    }
  };

  const renderConvergence = () => {
    if (!results || !results.history) return null;

    const generations = results.history.map(gen => gen.n_gen);
    const metrics = ['igd', 'gd', 'hv'].filter(metric => results.history[0][metric] !== undefined);

    return (
      <Plot
        data={metrics.map(metric => ({
          x: generations,
          y: results.history.map(gen => gen[metric]),
          type: 'scattergl',
          mode: 'lines+markers',
          name: metric.toUpperCase(),
          line: {
            width: 2
          },
          marker: {
            size: 4
          }
        }))}
        layout={{
          ...getPlotLayout('Convergence History'),
          xaxis: { 
            ...getPlotLayout('').xaxis,
            title: 'Generation'
          },
          yaxis: { 
            ...getPlotLayout('').yaxis,
            title: 'Metric Value',
            type: 'log'
          }
        }}
        style={{ width: '100%', height: isFullscreen ? '90vh' : '500px' }}
        config={{ 
          responsive: true,
          displayModeBar: true,
          displaylogo: false
        }}
      />
    );
  };

  const renderPopulationSize = () => {
    if (!results || !results.history) return null;

    const generations = results.history.map(gen => gen.n_gen);
    
    return (
      <Plot
        data={[
          {
            x: generations,
            y: results.history.map(gen => gen.n_nds),
            type: 'scattergl',
            mode: 'lines+markers',
            name: 'Non-dominated Solutions',
            line: {
              color: '#2196f3',
              width: 2
            },
            marker: {
              size: 6,
              color: '#2196f3'
            }
          }
        ]}
        layout={{
          ...getPlotLayout('Non-dominated Solutions per Generation'),
          xaxis: { 
            ...getPlotLayout('').xaxis,
            title: 'Generation'
          },
          yaxis: { 
            ...getPlotLayout('').yaxis,
            title: 'Number of Solutions'
          }
        }}
        style={{ width: '100%', height: isFullscreen ? '90vh' : '500px' }}
        config={{ 
          responsive: true,
          displayModeBar: true,
          displaylogo: false
        }}
      />
    );
  };

  return (
    <Box ref={containerRef}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Optimization Results
        </Typography>
        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
          <IconButton 
            onClick={toggleFullscreen}
            sx={{ 
              color: 'primary.main',
              '&:hover': {
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s'
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          minHeight: isFullscreen ? '90vh' : '500px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            minHeight: '500px'
          }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Running Optimization...
            </Typography>
          </Box>
        ) : results ? (
          <>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Tab icon={<BubbleChartIcon />} label="Pareto Front" />
              <Tab icon={<TimelineIcon />} label="Convergence" />
              <Tab icon={<BarChartIcon />} label="Population" />
            </Tabs>
            
            <TabPanel value={activeTab} index={0}>
              {renderParetoFront()}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              {renderConvergence()}
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              {renderPopulationSize()}
            </TabPanel>

            <Box sx={{ mt: 3, px: 3, pb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Optimization Statistics
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Execution Time"
                    value={`${results.execution_time.toFixed(2)}s`}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Generations"
                    value={results.generation}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Population Size"
                    value={results.statistics.pop_size}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Convergence Status"
                    value={results.success ? "Converged" : "Not Converged"}
                    color={results.success ? "#4caf50" : "#ff9800"}
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            minHeight: '500px'
          }}>
            <Typography variant="body1" color="text.secondary">
              Run an optimization to see results
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const StatCard = ({ title, value, color }) => (
  <Paper
    sx={{
      p: 2,
      bgcolor: 'rgba(255, 255, 255, 0.05)',
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 0,
      width: '100%',
      '& .MuiTypography-root': {
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }}
  >
    <Typography 
      variant="body2" 
      color="text.secondary" 
      gutterBottom
      sx={{ fontSize: '0.875rem', lineHeight: 1.2 }}
    >
      {title}
    </Typography>
    <Typography 
      variant="h6"
      sx={{ 
        color: color || 'inherit',
        fontSize: '1.125rem',
        lineHeight: 1.3,
        mt: 0.5
      }}
    >
      {value}
    </Typography>
  </Paper>
);

export default OptimizationVisualizer;
