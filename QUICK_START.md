# Quick Start Guide - Audio Transcriber Electron App

Get your audio transcription desktop app running in minutes!

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install FFmpeg (required)
# macOS:
brew install ffmpeg

# Ubuntu/Debian:
sudo apt update && sudo apt install ffmpeg

# Windows: Download from https://ffmpeg.org/download.html
```

### 2. Setup Whisper (Choose One Option)

#### Option A: Local Whisper (Recommended for privacy)
```bash
# Setup Python environment
npm run setup-whisper

# Install Whisper
python3 python-whisper/setup.py
```

#### Option B: Web API (Requires internet + API key)
```bash
# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

#### Option C: Hybrid (Best of both)
```bash
# Setup both local and web API
npm run setup-whisper
python3 python-whisper/setup.py
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

### 3. Run the App

```bash
# Development mode
npm run electron-dev

# Or production mode
npm run electron
```

## 🎯 How It Works

### Whisper Processing Options

1. **Local Whisper** (Default)
   - ✅ Privacy: Audio stays on your computer
   - ✅ No internet required after setup
   - ❌ Requires Python + Whisper installation
   - ❌ Slower processing

2. **Web API** (Fallback)
   - ✅ Fast processing
   - ✅ No local setup required
   - ❌ Requires internet + API key
   - ❌ Audio sent to OpenAI servers

3. **Hybrid Mode** (Smart)
   - ✅ Tries local first, falls back to web API
   - ✅ Best of both worlds
   - ✅ Automatic failover

### App Features

- **Drag & Drop**: Simply drag audio files onto the app
- **Multiple Formats**: MP3, WAV, M4A, WebM, MP4, OGG, FLAC, AAC
- **Output Options**: TXT, SRT, JSON with optional timestamps
- **Model Selection**: Choose from tiny, base, small, medium, large
- **Progress Tracking**: Real-time progress updates
- **Auto Cleanup**: Temporary files automatically removed

## 🔧 Troubleshooting

### Common Issues

**"FFmpeg not found"**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian  
sudo apt install ffmpeg

# Windows: Download from ffmpeg.org
```

**"Whisper not available"**
```bash
# Install Python dependencies
npm run setup-whisper
python3 python-whisper/setup.py
```

**"Permission denied"**
- Check file permissions
- Ensure write access to output directory

### Debug Mode

```bash
# Enable verbose logging
DEBUG=audio-transcriber npm run electron-dev
```

## 📦 Building for Distribution

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build-mac    # macOS
npm run build-win    # Windows  
npm run build-linux  # Linux
```

## 🎉 You're Ready!

Your audio transcription desktop app is now ready to use! 

- **Select audio files** by dragging and dropping
- **Choose your settings** (model, format, timestamps)
- **Start transcribing** with one click
- **Save or copy** your results

The app will automatically use the best available method (local Whisper → web API → mock mode) based on what's installed and configured.

---

**Need help?** Check the full [ELECTRON_README.md](ELECTRON_README.md) for detailed documentation. 