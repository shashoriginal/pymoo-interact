# Pymoo Interactive Optimizer

<div align="center">
  <img src="frontend/public/pymoo.png" alt="Pymoo Interactive Logo" width="150"/>
  <h3>Real-time Multi-Objective Optimization Visualization</h3>
  <p>An interactive web interface for the Pymoo optimization framework, enabling real-time visualization and analysis of multi-objective optimization problems.</p>
</div>

## 🚀 Quick Start

Getting started is as simple as running a single command! Our CLI tool handles everything automatically:

```bash
python cli.py run
```

This command will:
- Create a virtual environment if it doesn't exist
- Install all required dependencies (both backend and frontend)
- Start the backend server
- Start the frontend development server
- Open the application in your default browser

The application will be available at (Example):
- Frontend UI: http://localhost:5175
- Backend API: http://localhost:5000

To stop the application, press Ctrl+C in the terminal.

## 🌟 Features

- **Interactive Problem Configuration**
  - Dynamic parameter adjustment
  - Real-time validation
  - Support for multiple test problems (ZDT, DTLZ)

- **Advanced Visualization**
  - Real-time Pareto front visualization
  - Interactive 2D and 3D plots
  - Convergence history tracking
  - Population diversity analysis

- **Algorithm Support**
  - NSGA-II (Non-dominated Sorting Genetic Algorithm II)
  - MOEA/D (Multi-objective Evolutionary Algorithm based on Decomposition)
  - NSGA-III (Non-dominated Sorting Genetic Algorithm III)

- **Performance Metrics**
  - Hypervolume indicator
  - Generational distance
  - Inverted generational distance
  - Real-time metric tracking

## 📊 Supported Problems

### Test Problems
- **ZDT1**: Simple, convex Pareto-optimal front
- **ZDT2**: Non-convex Pareto-optimal front
- **DTLZ1**: Linear Pareto-optimal front
- **DTLZ2**: Spherical Pareto-optimal front

### Optimization Algorithms
1. **NSGA-II**
   - Fast non-dominated sorting
   - Crowding distance sorting
   - Binary tournament selection

2. **MOEA/D**
   - Decomposition-based
   - Neighborhood relations
   - Efficient resource allocation

3. **NSGA-III**
   - Reference point based
   - Improved diversity preservation
   - Suitable for many-objective optimization

## 📈 Visualization Features

- **Pareto Front Visualization**
  - Real-time updates
  - Interactive zoom and pan
  - Multiple view options (2D/3D)

- **Convergence Metrics**
  - Generation-wise progress
  - Multiple performance indicators
  - Statistical analysis

- **Population Statistics**
  - Diversity measures
  - Distribution analysis
  - Real-time updates

## 👨‍💻 Authors and Citations

### Pymoo Interactive
**Author**: Shashank Raj

### Pymoo Framework
If you use this software in your research, please cite the Pymoo framework:

```bibtex
@ARTICLE{pymoo,
    author={J. {Blank} and K. {Deb}},
    journal={IEEE Access},
    title={pymoo: Multi-Objective Optimization in Python},
    year={2020},
    volume={8},
    number={},
    pages={89497-89509},
}
```

## 🙏 Libraries and Frameworks

This project is built upon several excellent open-source libraries:

### Backend
- **[Pymoo](https://pymoo.org/)** - Multi-objective optimization framework
- **[Flask](https://flask.palletsprojects.com/)** - Lightweight WSGI web application framework
- **[NumPy](https://numpy.org/)** - Fundamental package for scientific computing
- **[SciPy](https://scipy.org/)** - Scientific computation and optimization

### Frontend
- **[React](https://reactjs.org/)** - JavaScript library for building user interfaces
- **[Material-UI](https://mui.com/)** - React UI framework
- **[Plotly.js](https://plotly.com/javascript/)** - Interactive visualization library
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling

### Development
- **[Python](https://www.python.org/)** - Backend programming language
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[npm](https://www.npmjs.com/)** - Package manager for JavaScript

---

<div align="center">
  Made with ❤️ by Shashank Raj
</div>
