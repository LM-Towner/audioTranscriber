#!/usr/bin/env python3
"""
Whisper launcher for Electron app
"""

import os
import sys
import subprocess
import json

def get_whisper_path():
    """Get the path to the Whisper executable"""
    # Add current directory to Python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    try:
        import whisper
        return sys.executable
    except ImportError:
        return None

def run_whisper(args):
    """Run Whisper with given arguments"""
    whisper_path = get_whisper_path()
    
    if not whisper_path:
        print(json.dumps({
            "error": "Whisper not found. Please run setup.py first."
        }))
        sys.exit(1)
    
    try:
        # Run whisper command
        result = subprocess.run([
            whisper_path, '-m', 'whisper'
        ] + args, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(result.stdout)
        else:
            print(json.dumps({
                "error": result.stderr
            }))
            sys.exit(result.returncode)
            
    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    run_whisper(sys.argv[1:])
