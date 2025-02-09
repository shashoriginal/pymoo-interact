from pymoo.problems import get_problem
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.algorithms.moo.moead import MOEAD
from pymoo.algorithms.moo.nsga3 import NSGA3
from pymoo.optimize import minimize
from pymoo.util.ref_dirs import get_reference_directions
import numpy as np

class OptimizationHandler:
    def __init__(self, problem_id, algorithm_id, n_var=10, n_obj=2, pop_size=100, n_gen=200):
        self.problem_id = problem_id
        self.algorithm_id = algorithm_id
        self.n_var = n_var
        self.n_obj = n_obj
        self.pop_size = pop_size
        self.n_gen = n_gen
        
        # Initialize problem
        self.problem = self._get_problem()
        
        # Initialize algorithm
        self.algorithm = self._get_algorithm()

    def _get_problem(self):
        """Initialize the optimization problem"""
        try:
            problem_params = {"n_var": self.n_var}
            
            # ZDT problems are always bi-objective
            if self.problem_id in ["zdt1", "zdt2"]:
                if self.n_obj != 2:
                    raise ValueError(f"ZDT problems are bi-objective only. Got n_obj={self.n_obj}")
                return get_problem(self.problem_id, **problem_params)
            
            # DTLZ problems can have variable number of objectives
            elif self.problem_id in ["dtlz1", "dtlz2"]:
                problem_params["n_obj"] = self.n_obj
                return get_problem(self.problem_id, **problem_params)
            else:
                raise ValueError(f"Unsupported problem: {self.problem_id}")
        except Exception as e:
            raise ValueError(f"Failed to initialize problem {self.problem_id}: {str(e)}")

    def _get_algorithm(self):
        """Initialize the optimization algorithm"""
        try:
            if self.algorithm_id == "nsga2":
                return NSGA2(
                    pop_size=self.pop_size,
                    eliminate_duplicates=True
                )
            elif self.algorithm_id == "moead":
                # MOEAD specific settings
                n_partitions = 12
                if self.n_obj >= 4:
                    n_partitions = 5  # Reduce partitions for higher dimensions
                elif self.n_obj == 3:
                    n_partitions = 8
                
                ref_dirs = get_reference_directions(
                    "das-dennis", 
                    n_dim=self.n_obj,
                    n_partitions=n_partitions
                )
                
                return MOEAD(
                    ref_dirs=ref_dirs,
                    n_neighbors=15,
                    prob_neighbor_mating=0.7,
                )
            elif self.algorithm_id == "nsga3":
                # NSGA3 specific settings
                n_partitions = 12
                if self.n_obj >= 4:
                    n_partitions = 5  # Reduce partitions for higher dimensions
                elif self.n_obj == 3:
                    n_partitions = 8
                
                ref_dirs = get_reference_directions(
                    "das-dennis", 
                    n_dim=self.n_obj,
                    n_partitions=n_partitions
                )
                
                return NSGA3(
                    ref_dirs=ref_dirs,
                    pop_size=self.pop_size
                )
            else:
                raise ValueError(f"Unknown algorithm: {self.algorithm_id}")
        except Exception as e:
            raise ValueError(f"Failed to initialize algorithm {self.algorithm_id}: {str(e)}")

    def _check_convergence(self, result):
        """Check if the optimization has converged based on various metrics"""
        if not hasattr(result, 'history') or len(result.history) < 2:
            return False
            
        # Get the last few generations (reduced from 10 to 5)
        last_gens = result.history[-5:]
        
        # Check objective values stability
        if len(last_gens) >= 2:
            obj_values = [np.mean(gen.opt.get('F')) for gen in last_gens]
            obj_improvement = np.abs(np.diff(obj_values))
            if np.mean(obj_improvement) < 1e-3:  # Relaxed threshold
                return True
        
        # Check if the hypervolume improvement is minimal
        if all(hasattr(gen, 'hv') for gen in last_gens):
            hv_values = [gen.hv for gen in last_gens]
            hv_improvement = np.abs(np.diff(hv_values))
            if np.mean(hv_improvement) < 1e-3:  # Relaxed threshold
                return True
                
        # Check if the number of non-dominated solutions is stable
        if all(hasattr(gen, 'n_nds') for gen in last_gens):
            nds_values = [gen.n_nds for gen in last_gens]
            if len(set(nds_values)) == 1:  # All values are the same
                return True
            # Also check if the variation is minimal
            nds_variation = np.std(nds_values) / np.mean(nds_values)
            if nds_variation < 0.05:  # 5% variation threshold
                return True
                
        # Check if the IGD improvement is minimal
        if all(hasattr(gen, 'igd') for gen in last_gens):
            igd_values = [gen.igd for gen in last_gens]
            igd_improvement = np.abs(np.diff(igd_values))
            if np.mean(igd_improvement) < 1e-3:  # Relaxed threshold
                return True
        
        return False

    def run(self):
        """Execute the optimization"""
        try:
            # Validate problem and algorithm compatibility
            if self.problem_id in ["zdt1", "zdt2"] and self.n_obj != 2:
                raise ValueError(f"ZDT problems are bi-objective only. Got n_obj={self.n_obj}")
            
            from pymoo.indicators.igd import IGD
            from pymoo.indicators.gd import GD
            from pymoo.indicators.hv import HV

            # Get the true Pareto front if available
            pf = self.problem.pareto_front() if hasattr(self.problem, 'pareto_front') else None
            
            # Initialize performance indicators
            igd = IGD(pf) if pf is not None else None
            gd = GD(pf) if pf is not None else None
            
            # Calculate reference point for hypervolume
            if self.n_obj <= 3:
                # Use normalized reference point [1.1, 1.1, ...] for hypervolume calculation
                # This works with the normalized objectives
                ref_point = np.array([1.1] * self.n_obj)
                hv = HV(ref_point=ref_point)
            else:
                hv = None
            
            result = minimize(
                problem=self.problem,
                algorithm=self.algorithm,
                termination=('n_gen', self.n_gen),
                seed=1,
                save_history=True,
                verbose=True
            )

            # Calculate metrics for each generation
            if hasattr(result, 'history'):
                for entry in result.history:
                    F = entry.opt.get("F")
                    if igd is not None:
                        entry.igd = igd.do(F)
                    if gd is not None:
                        entry.gd = gd.do(F)
                    if hv is not None:
                        # Normalize objectives using ideal and nadir points
                        if hasattr(self.problem, 'ideal_point') and hasattr(self.problem, 'nadir_point'):
                            ideal = self.problem.ideal_point()
                            nadir = self.problem.nadir_point()
                            F_norm = (F - ideal) / (nadir - ideal)
                            entry.hv = hv.do(F_norm)
                        else:
                            entry.hv = hv.do(F)
            
            # Check convergence
            has_converged = self._check_convergence(result)
            
            # Process history data
            history = []
            if hasattr(result, 'history'):
                for gen in result.history:
                    entry = {
                        'n_gen': gen.n_gen,
                        'n_eval': gen.evaluator.n_eval,
                        'n_nds': len(gen.opt.get('F')),
                    }
                    
                    # Add metrics if available
                    if hasattr(gen, 'igd'):
                        entry['igd'] = float(gen.igd)
                    if hasattr(gen, 'gd'):
                        entry['gd'] = float(gen.gd)
                    if hasattr(gen, 'hv'):
                        entry['hv'] = float(gen.hv)
                        
                    history.append(entry)
            
            # Extract optimization metrics
            metrics = {
                'X': result.X.tolist(),  # Decision variables
                'F': result.F.tolist(),  # Objective values
                'generation': result.algorithm.n_gen,  # Number of generations
                'success': has_converged,  # Use our convergence check
                'execution_time': result.exec_time,
                'problem_name': self.problem_id,
                'algorithm_name': self.algorithm_id,
                'statistics': {
                    'n_var': self.n_var,
                    'n_obj': self.n_obj,
                    'pop_size': self.pop_size,
                    'n_gen': self.n_gen,
                },
                'pareto_front': {
                    'objectives': result.F.tolist(),
                    'variables': result.X.tolist()
                },
                'history': history,  # Add processed history
                'convergence': {
                    'ideal_point': result.problem.ideal_point().tolist() if hasattr(result.problem, 'ideal_point') else None,
                    'nadir_point': result.problem.nadir_point().tolist() if hasattr(result.problem, 'nadir_point') else None,
                }
            }
            
            return metrics
            
        except Exception as e:
            raise RuntimeError(f"Optimization failed: {str(e)}")
