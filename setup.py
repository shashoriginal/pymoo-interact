import os
import subprocess
import sys
from pathlib import Path
from setuptools import setup, find_packages

def create_directories():
    """Create necessary directories if they don't exist"""
    directories = [
        'backend/optimization',
        'frontend/src/components',
        'frontend/public'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)

def main():
    create_directories()
    
    setup(
        name="pymoo-interact",
        version="0.1.0",
        packages=find_packages(),
        python_requires=">=3.7",
        install_requires=[
            "flask",
            "flask-cors",
            "pymoo",
            "numpy"
        ],
        entry_points={
            'console_scripts': [
                'pymoo-interact=cli:main',
            ],
        },
    )

if __name__ == "__main__":
    main()
