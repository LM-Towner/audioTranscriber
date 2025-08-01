#!/usr/bin/env python3
"""
Setup script for Whisper in Electron app
"""

import os
import sys
import subprocess
import platform

def install_requirements():
    """Install required packages"""
    print("Installing Whisper requirements...")
    
    try:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
        ])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def download_models():
    """Download Whisper models"""
    print("Downloading Whisper models...")
    
    models = ['tiny', 'base', 'small', 'medium', 'large']
    
    for model in models:
        try:
            print(f"Downloading {model} model...")
            subprocess.check_call([
                sys.executable, '-c', 
                f'import whisper; whisper.load_model("{model}")'
            ])
            print(f"✅ {model} model downloaded")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Failed to download {model} model: {e}")

def main():
    """Main setup function"""
    print("🚀 Whisper Setup for Electron App")
    print("=" * 40)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Download models
    download_models()
    
    print("\n🎉 Setup completed successfully!")
    print("\nYou can now build your Electron app with:")
    print("npm run build")

if __name__ == "__main__":
    main()
