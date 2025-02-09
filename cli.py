import os
import sys
import subprocess
import venv
from pathlib import Path

def is_venv_exists():
    """Check if virtual environment exists"""
    return (Path('.venv').exists() or 
            Path('venv').exists() or 
            Path('env').exists())

def get_venv_path():
    """Get the path of the virtual environment"""
    if Path('.venv').exists():
        return '.venv'
    elif Path('venv').exists():
        return 'venv'
    elif Path('env').exists():
        return 'env'
    return '.venv'  # default name

def create_venv():
    """Create a virtual environment if it doesn't exist"""
    if is_venv_exists():
        print("Virtual environment already exists!")
        return
    
    print("Creating virtual environment...")
    venv.create(get_venv_path(), with_pip=True)
    print("Virtual environment created successfully!")

def get_python_executable():
    """Get the Python executable path based on the operating system"""
    venv_path = get_venv_path()
    if sys.platform == 'win32':
        return os.path.join(venv_path, 'Scripts', 'python.exe')
    return os.path.join(venv_path, 'bin', 'python')

def get_pip_executable():
    """Get the pip executable path based on the operating system"""
    venv_path = get_venv_path()
    if sys.platform == 'win32':
        return os.path.join(venv_path, 'Scripts', 'pip.exe')
    return os.path.join(venv_path, 'bin', 'pip')

def get_npm_path():
    """Get the full path to npm executable"""
    if hasattr(get_npm_path, 'cached_path'):
        return get_npm_path.cached_path

    try:
        # On Windows, try common npm installation paths
        if sys.platform == "win32":
            print("\nDebug: Checking for npm in Windows...")
            
            program_files = [
                os.environ.get("ProgramFiles", "C:\\Program Files"),
                os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)")
            ]
            print(f"Debug: Program Files paths: {program_files}")
            
            npm_paths = [
                os.path.join(p, "nodejs", "npm.cmd") for p in program_files
            ]
            print(f"Debug: Checking npm paths: {npm_paths}")
            
            for npm_path in npm_paths:
                print(f"Debug: Checking {npm_path}")
                if os.path.exists(npm_path):
                    print(f"Debug: Found npm at {npm_path}")
                    result = subprocess.run([npm_path, '--version'], capture_output=True, check=True)
                    get_npm_path.cached_path = npm_path
                    return npm_path
            
            # Also try the full system PATH
            print("\nDebug: Checking system PATH...")
            paths = os.environ.get("PATH", "").split(os.pathsep)
            print(f"Debug: PATH entries: {paths}")
            
            for path in paths:
                npm_cmd = os.path.join(path, "npm.cmd")
                print(f"Debug: Checking {npm_cmd}")
                if os.path.exists(npm_cmd):
                    print(f"Debug: Found npm at {npm_cmd}")
                    result = subprocess.run([npm_cmd, '--version'], capture_output=True, check=True)
                    get_npm_path.cached_path = npm_cmd
                    return npm_cmd
            
            print("Debug: npm not found in any location")
        else:
            # On Unix-like systems, just use 'npm'
            result = subprocess.run(['npm', '--version'], capture_output=True, check=True)
            get_npm_path.cached_path = 'npm'
            return 'npm'
        return None
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"Debug: Error checking npm: {e}")
        return None

def check_npm():
    """Check if npm is available"""
    return get_npm_path() is not None

def install_dependencies():
    """Install project dependencies"""
    # Ensure virtual environment is activated before installing dependencies
    if not is_venv_exists():
        print("Virtual environment not found. Creating one...")
        create_venv()
    
    print("Activating virtual environment...")
    activate_venv()
    
    print("Installing backend dependencies...")
    try:
        subprocess.run([get_pip_executable(), 'install', '-r', 'backend/requirements.txt'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error installing backend dependencies: {e}")
        sys.exit(1)
    
    print("\nChecking npm installation...")
    has_npm = check_npm()
    if not has_npm:
        print("\nWarning: npm is not installed or not in PATH.")
        print("\nTo install Node.js and npm:")
        print("1. Visit https://nodejs.org/")
        print("2. Download the LTS (Long Term Support) version")
        print("3. Run the installer and follow the installation steps")
        print("4. Restart your terminal/command prompt")
        print("5. Verify installation with: npm --version")
        
        while True:
            response = input("\nDo you want to proceed with backend only? (y/n): ").lower()
            if response == 'y':
                return False  # Indicate frontend setup should be skipped
            elif response == 'n':
                print("\nPlease install npm and run this command again: python cli.py run")
                sys.exit(1)
            else:
                print("Please enter 'y' or 'n'")
    
    if has_npm:
        print("Installing frontend dependencies...")
        os.chdir('frontend')
        try:
            npm_cmd = get_npm_path()
            subprocess.run([npm_cmd, "install"], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error installing frontend dependencies: {e}")
            sys.exit(1)
        finally:
            os.chdir('..')
    
    return has_npm  # Return True if npm is available, False if running backend-only

def activate_venv():
    """Activate the virtual environment by modifying PATH and environment variables"""
    venv_path = get_venv_path()
    
    # Store original PATH for npm checks
    if "ORIGINAL_PATH" not in os.environ:
        os.environ["ORIGINAL_PATH"] = os.environ.get("PATH", "")
    
    if sys.platform == "win32":
        scripts_path = os.path.join(venv_path, "Scripts")
        if not os.path.exists(scripts_path):
            print(f"Error: Scripts directory not found at {scripts_path}")
            sys.exit(1)
        # Modify PATH to prioritize virtual environment
        os.environ["PATH"] = os.pathsep.join([scripts_path, os.environ.get("PATH", "")])
        os.environ["VIRTUAL_ENV"] = os.path.abspath(venv_path)
    else:
        bin_path = os.path.join(venv_path, "bin")
        if not os.path.exists(bin_path):
            print(f"Error: bin directory not found at {bin_path}")
            sys.exit(1)
        # Modify PATH to prioritize virtual environment
        os.environ["PATH"] = os.pathsep.join([bin_path, os.environ.get("PATH", "")])
        os.environ["VIRTUAL_ENV"] = os.path.abspath(venv_path)
    
    # Remove PYTHONHOME if it exists
    os.environ.pop("PYTHONHOME", None)
    
    print(f"Virtual environment activated: {venv_path}")

def run_project(with_frontend=True):
    """Run the project"""
    try:
        # Ensure virtual environment exists and is activated
        if not is_venv_exists():
            print("Virtual environment not found. Creating one...")
            create_venv()
        
        print("Activating virtual environment...")
        activate_venv()
        
        # Start backend
        print("Starting backend server...")
        backend_process = subprocess.Popen([get_python_executable(), 'backend/app.py'])
        frontend_process = None
        
        # Start frontend if requested
        if with_frontend:
            print("Starting frontend development server...")
            os.chdir('frontend')
            try:
                npm_cmd = get_npm_path()
                frontend_process = subprocess.Popen([npm_cmd, "run", "dev"])
            except subprocess.CalledProcessError as e:
                print(f"Error starting frontend server: {e}")
                backend_process.terminate()
                sys.exit(1)
            finally:
                os.chdir('..')
        
        print("\nProject is running!")
        print("Backend API: http://localhost:5000")
        if with_frontend:
            print("Frontend UI: http://localhost:5173")
        else:
            print("Running in backend-only mode")
        print("\nPress Ctrl+C to stop the servers")
        
        try:
            backend_process.wait()
            if frontend_process:
                frontend_process.wait()
        except KeyboardInterrupt:
            print("\nShutting down servers...")
            backend_process.terminate()
            if frontend_process:
                frontend_process.terminate()
            print("Servers stopped successfully")
    except Exception as e:
        print(f"\nError running the project: {e}")
        if 'backend_process' in locals():
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python cli.py [create|run]")
        sys.exit(1)

    command = sys.argv[1]

    if command == 'create':
        create_venv()
    elif command == 'run':
        if not is_venv_exists():
            print("Virtual environment not found. Creating one...")
            create_venv()
        
        print("Checking and installing dependencies...")
        with_frontend = install_dependencies()
        
        print("\nStarting the project...")
        run_project(with_frontend)
    else:
        print(f"Unknown command: {command}")
        print("Available commands: create, run")
        sys.exit(1)

if __name__ == '__main__':
    main()
