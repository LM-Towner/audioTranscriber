# Audio Transcriber - Electron Desktop App

A beautiful, cross-platform desktop application for audio transcription using OpenAI's Whisper model. This Electron app provides an intuitive GUI for transcribing audio files with multiple output formats and options.

## 🚀 Features

- **🎨 Modern UI**: Beautiful, responsive interface with drag-and-drop support
- **🎵 Multi-format Support**: MP3, WAV, M4A, WebM, MP4, OGG, FLAC, AAC
- **⏱️ Timestamp Options**: Include precise timestamps in transcripts
- **🎯 Multiple Models**: Choose from tiny, base, small, medium, large Whisper models
- **📄 Multiple Formats**: Export as TXT, SRT, or JSON
- **🌐 Web API Fallback**: Use OpenAI's Whisper API when local Whisper isn't available
- **🔄 Hybrid Mode**: Try local first, fallback to web API
- **📱 Cross-Platform**: Windows, macOS, and Linux support
- **🛡️ Privacy**: Process audio locally when possible

## 📋 Prerequisites

### Required
- **Node.js 14+** and npm
- **FFmpeg**: For audio format conversion
- **Python 3.8+**: For Whisper (optional, can use web API)

### FFmpeg Installation

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install ffmpeg
```

**Windows:**
Download from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/audio-transcriber.git
cd audio-transcriber
npm install
```

### 2. Setup Whisper (Optional)

For local Whisper processing:

```bash
# Run the setup script
npm run setup-whisper

# Install Python dependencies
python3 python-whisper/setup.py
```

### 3. Run the App

**Development mode:**
```bash
npm run electron-dev
```

**Production mode:**
```bash
npm run electron
```

## 🏗️ Building for Distribution

### Build for All Platforms

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build-mac    # macOS
npm run build-win    # Windows
npm run build-linux  # Linux
```

### Build Options

The app supports different Whisper configurations:

1. **Local Whisper** (Recommended for privacy)
   - Processes audio locally
   - No internet required after setup
   - Requires Python and Whisper installation

2. **Web API** (Requires internet)
   - Uses OpenAI's Whisper API
   - Requires API key
   - Faster processing, no local setup

3. **Hybrid Mode** (Best of both)
   - Tries local first, falls back to web API
   - Automatic failover

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# OpenAI API Key (for web API mode)
OPENAI_API_KEY=your_api_key_here

# Custom Whisper path
WHISPER_PATH=/path/to/whisper

# Web API endpoint (optional)
WHISPER_API_ENDPOINT=https://api.openai.com/v1/audio/transcriptions
```

### App Settings

The app automatically detects:
- FFmpeg installation
- Whisper availability
- Python environment
- Internet connectivity

## 🎯 Usage

### Basic Workflow

1. **Launch the app**
2. **Select audio file** (drag & drop or browse)
3. **Choose settings**:
   - Whisper model (tiny → large)
   - Output format (TXT, SRT, JSON)
   - Include timestamps
4. **Start transcription**
5. **Save or copy results**

### Advanced Features

- **Batch Processing**: Process multiple files sequentially
- **Custom Models**: Use different Whisper model sizes
- **Format Conversion**: Convert between output formats
- **Progress Tracking**: Real-time progress updates

## 🔒 Privacy & Security

### Local Processing
- Audio files processed locally when using Whisper
- No data sent to external servers
- Temporary files automatically cleaned up

### Web API Mode
- Audio sent to OpenAI's servers
- Requires internet connection
- Subject to OpenAI's privacy policy

### Data Handling
- Temporary files stored in system temp directory
- Automatic cleanup on app exit
- No persistent storage of audio files

## 🐛 Troubleshooting

### Common Issues

**"FFmpeg not found"**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from ffmpeg.org and add to PATH
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
- Run as administrator (Windows)

**"Empty transcript"**
- Audio file might be too quiet
- Try different Whisper model
- Check audio file format

### Debug Mode

Enable verbose logging:

```bash
# Development
DEBUG=audio-transcriber npm run electron-dev

# Production
DEBUG=audio-transcriber npm run electron
```

### Logs

Logs are stored in:
- **macOS**: `~/Library/Logs/audio-transcriber/`
- **Windows**: `%APPDATA%/audio-transcriber/logs/`
- **Linux**: `~/.config/audio-transcriber/logs/`

## 🔧 Development

### Project Structure

```
audio-transcriber/
├── electron/                 # Electron app files
│   ├── main.js              # Main process
│   ├── preload.js           # Preload script
│   └── renderer/            # UI files
│       ├── index.html       # Main UI
│       ├── styles.css       # Styles
│       └── renderer.js      # UI logic
├── python-whisper/          # Python/Whisper setup
├── scripts/                 # Build scripts
├── index.js                 # Core transcriber
├── cli.js                   # Command line interface
└── package.json             # Project config
```

### Adding Features

1. **UI Changes**: Edit `electron/renderer/`
2. **Backend Logic**: Edit `electron/main.js`
3. **Transcription**: Edit `index.js`
4. **Build Process**: Edit `package.json` build config

### Testing

```bash
# Run tests
npm test

# Test Electron app
npm run electron-dev
```

## 📦 Distribution

### Creating Installers

The app uses `electron-builder` for packaging:

```bash
# Build installers
npm run build

# Custom build
npx electron-builder --config electron-builder.json
```

### Supported Formats

- **macOS**: `.dmg`, `.pkg`
- **Windows**: `.exe`, `.msi`
- **Linux**: `.AppImage`, `.deb`, `.rpm`

### Code Signing

For production releases, configure code signing in `package.json`:

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name"
    },
    "win": {
      "certificateFile": "path/to/certificate.p12"
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for the Whisper model
- FFmpeg for audio processing
- Electron team for the framework
- The open-source community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/audio-transcriber/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/audio-transcriber/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/audio-transcriber/wiki)

---

**Made with ❤️ for the audio transcription community** 