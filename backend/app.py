from flask import Flask, request, jsonify
from flask_cors import CORS
from optimization.optimizer import OptimizationHandler
import numpy as np
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/api/problems', methods=['GET'])
def get_problems():
    """Get list of available optimization problems"""
    problems = [
        {"id": "zdt1", "name": "ZDT1", "description": "ZDT1 benchmark problem"},
        {"id": "zdt2", "name": "ZDT2", "description": "ZDT2 benchmark problem"},
        {"id": "dtlz1", "name": "DTLZ1", "description": "DTLZ1 benchmark problem"},
        {"id": "dtlz2", "name": "DTLZ2", "description": "DTLZ2 benchmark problem"}
    ]
    return jsonify(problems)

@app.route('/api/algorithms', methods=['GET'])
def get_algorithms():
    """Get list of available optimization algorithms"""
    algorithms = [
        {"id": "nsga2", "name": "NSGA-II", "description": "Non-dominated Sorting Genetic Algorithm II"},
        {"id": "moead", "name": "MOEA/D", "description": "Multi-objective Evolutionary Algorithm based on Decomposition"},
        {"id": "nsga3", "name": "NSGA-III", "description": "Non-dominated Sorting Genetic Algorithm III"}
    ]
    return jsonify(algorithms)

@app.route('/api/optimize', methods=['POST'])
def optimize():
    """Handle optimization request"""
    try:
        data = request.json
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400

        required_fields = ['problem', 'algorithm']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400

        # Create optimization handler with parameters
        handler = OptimizationHandler(
            problem_id=data['problem'],
            algorithm_id=data['algorithm'],
            n_var=int(data.get('n_var', 10)),
            n_obj=int(data.get('n_obj', 2)),
            pop_size=int(data.get('pop_size', 100)),
            n_gen=int(data.get('n_gen', 200))
        )

        # Run optimization
        result = handler.run()

        return jsonify({
            'status': 'success',
            'data': result
        })

    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'type': 'ValueError'
        }), 400
    except Exception as e:
        print("Error during optimization:", traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': str(e),
            'type': 'Exception',
            'traceback': traceback.format_exc()
        }), 400

if __name__ == '__main__':
    app.run(debug=True)
