#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

/**
 * Setup script to bundle Python and Whisper with the Electron app
 * This creates a portable Python environment that can be distributed with the app
 */

const APP_ROOT = path.resolve(__dirname, '..');
const PYTHON_DIR = path.join(APP_ROOT, 'python-whisper');
const REQUIREMENTS_FILE = path.join(PYTHON_DIR, 'requirements.txt');
const SETUP_SCRIPT = path.join(PYTHON_DIR, 'setup.py');

async function setupWhisper() {
  console.log('🔧 Setting up Whisper for Electron app...\n');

  try {
    // Create Python directory
    await fs.ensureDir(PYTHON_DIR);
    console.log('✅ Created python-whisper directory');

    // Create requirements.txt
    const requirements = [
      'openai-whisper==20231117',
      'torch>=2.0.0',
      'torchaudio>=2.0.0',
      'numpy>=1.20.0',
      'ffmpeg-python>=0.2.0'
    ];

    await fs.writeFile(REQUIREMENTS_FILE, requirements.join('\n'));
    console.log('✅ Created requirements.txt');

    // Create setup script
    const setupScript = `#!/usr/bin/env python3
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
    
    print("\\n🎉 Setup completed successfully!")
    print("\\nYou can now build your Electron app with:")
    print("npm run build")

if __name__ == "__main__":
    main()
`;

    await fs.writeFile(SETUP_SCRIPT, setupScript);
    await fs.chmod(SETUP_SCRIPT, '755');
    console.log('✅ Created setup.py');

    // Create launcher script
    const launcherScript = `#!/usr/bin/env python3
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
`;

    const launcherPath = path.join(PYTHON_DIR, 'whisper-launcher.py');
    await fs.writeFile(launcherPath, launcherScript);
    await fs.chmod(launcherPath, '755');
    console.log('✅ Created whisper-launcher.py');

    // Create batch/shell scripts for different platforms
    const batchScript = `@echo off
REM Whisper launcher for Windows
python "%~dp0whisper-launcher.py" %*
`;

    const shellScript = `#!/bin/bash
# Whisper launcher for macOS/Linux
python3 "$(dirname "$0")/whisper-launcher.py" "$@"
`;

    await fs.writeFile(path.join(PYTHON_DIR, 'whisper.bat'), batchScript);
    await fs.writeFile(path.join(PYTHON_DIR, 'whisper.sh'), shellScript);
    await fs.chmod(path.join(PYTHON_DIR, 'whisper.sh'), '755');
    console.log('✅ Created platform-specific launchers');

    // Create README
    const readme = `# Whisper Setup for Electron App

This directory contains the Python environment and Whisper installation for the Electron app.

## Setup Instructions

1. **Install Python** (if not already installed):
   - Windows: Download from https://python.org
   - macOS: \`brew install python\`
   - Linux: \`sudo apt install python3\`

2. **Run the setup script**:
   \`\`\`bash
   python3 setup.py
   \`\`\`

3. **Build the Electron app**:
   \`\`\`bash
   npm run build
   \`\`\`

## Files

- \`requirements.txt\` - Python dependencies
- \`setup.py\` - Setup script to install Whisper
- \`whisper-launcher.py\` - Python launcher for Whisper
- \`whisper.bat\` - Windows batch launcher
- \`whisper.sh\` - Unix shell launcher

## Usage in Electron

The Electron app will automatically detect and use the bundled Whisper installation.

## Troubleshooting

- If Whisper is not found, run \`python3 setup.py\` again
- Make sure Python 3.8+ is installed
- On Windows, ensure Python is in your PATH
`;

    await fs.writeFile(path.join(PYTHON_DIR, 'README.md'), readme);
    console.log('✅ Created README.md');

    console.log('\n🎉 Whisper setup completed!');
    console.log('\nNext steps:');
    console.log('1. Install Python 3.8+ if not already installed');
    console.log('2. Run: python3 python-whisper/setup.py');
    console.log('3. Build your Electron app: npm run build');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupWhisper();
}

module.exports = { setupWhisper }; 