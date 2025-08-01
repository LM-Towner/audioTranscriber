# Whisper Setup for Electron App

This directory contains the Python environment and Whisper installation for the Electron app.

## Setup Instructions

1. **Install Python** (if not already installed):
   - Windows: Download from https://python.org
   - macOS: `brew install python`
   - Linux: `sudo apt install python3`

2. **Run the setup script**:
   ```bash
   python3 setup.py
   ```

3. **Build the Electron app**:
   ```bash
   npm run build
   ```

## Files

- `requirements.txt` - Python dependencies
- `setup.py` - Setup script to install Whisper
- `whisper-launcher.py` - Python launcher for Whisper
- `whisper.bat` - Windows batch launcher
- `whisper.sh` - Unix shell launcher

## Usage in Electron

The Electron app will automatically detect and use the bundled Whisper installation.

## Troubleshooting

- If Whisper is not found, run `python3 setup.py` again
- Make sure Python 3.8+ is installed
- On Windows, ensure Python is in your PATH
