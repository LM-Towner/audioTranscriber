# Audio Transcriber

A standalone audio transcription library using OpenAI's Whisper model. This library provides both a Node.js API and a command-line interface for transcribing audio files.

## Features

- 🎵 **Multiple Audio Formats**: Supports WebM, WAV, MP3, M4A, MP4, OGG, FLAC, AAC
- ⏱️ **Optional Timestamps**: Include timestamps in your transcripts
- 🎯 **Multiple Whisper Models**: Choose from tiny, base, small, medium, large
- 🔧 **Flexible Output Formats**: TXT, SRT, JSON
- 🛡️ **Error Handling**: Graceful fallback to mock mode if Whisper isn't available
- 🧹 **Auto Cleanup**: Automatically cleans up temporary files
- 📱 **Cross-Platform**: Works on macOS, Linux, and Windows

## Installation

### Prerequisites

1. **FFmpeg**: Required for audio conversion
   ```bash
   # macOS
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

2. **Whisper** (Optional): For actual transcription
   ```bash
   # Install Whisper
   pip install openai-whisper
   
   # Or use a virtual environment
   python -m venv whisper-env
   source whisper-env/bin/activate  # On Windows: whisper-env\Scripts\activate
   pip install openai-whisper
   ```

### Install the Library

```bash
# Clone the repository
git clone https://github.com/yourusername/audio-transcriber.git
cd audio-transcriber

# Install dependencies
npm install

# Make CLI globally available (optional)
npm link
```

## Usage

### Command Line Interface

#### Basic Usage

```bash
# Transcribe an audio file
transcribe audio.mp3

# With timestamps
transcribe audio.m4a --timestamps

# Specify output format
transcribe audio.wav --format srt

# Use a specific Whisper model
transcribe audio.webm --model large
```

#### Advanced Options

```bash
# Full command with all options
transcribe "My Audio File.m4a" \
  --timestamps \
  --model medium \
  --format txt \
  --output transcript.txt \
  --whisper-path /path/to/whisper
```

#### Command Line Options

| Option | Short | Description |
|--------|-------|-------------|
| `--timestamps` | `-t` | Include timestamps in the transcript |
| `--format <format>` | `-f` | Output format: txt, srt, json (default: txt) |
| `--model <model>` | `-m` | Whisper model: tiny, base, small, medium, large (default: medium) |
| `--whisper-path <path>` | `-w` | Custom path to Whisper executable |
| `--output <file>` | `-o` | Output file path (default: auto-generated) |
| `--help` | `-h` | Show help message |

### Node.js API

#### Basic Usage

```javascript
const AudioTranscriber = require('audio-transcriber');

async function transcribeAudio() {
  // Initialize transcriber
  const transcriber = new AudioTranscriber({
    whisperModel: 'medium',        // Optional: 'tiny', 'base', 'small', 'medium', 'large'
    whisperPath: '/path/to/whisper', // Optional: custom Whisper path
    tmpDir: './tmp',               // Optional: temporary directory
    cleanupTempFiles: true         // Optional: auto-cleanup (default: true)
  });

  try {
    // Transcribe with timestamps
    const result = await transcriber.transcribe('audio.mp3', {
      includeTimestamps: true,
      outputFormat: 'txt'
    });

    console.log('Transcript:', result.text);
    console.log('File info:', result.file_info);
    
  } catch (error) {
    console.error('Transcription failed:', error.message);
  }
}

transcribeAudio();
```

#### API Reference

##### `new AudioTranscriber(options)`

Creates a new AudioTranscriber instance.

**Options:**
- `whisperModel` (string): Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
- `whisperPath` (string): Custom path to Whisper executable
- `tmpDir` (string): Directory for temporary files
- `cleanupTempFiles` (boolean): Whether to auto-cleanup temp files

##### `transcriber.transcribe(inputFilePath, options)`

Transcribes an audio file.

**Parameters:**
- `inputFilePath` (string): Path to the audio file
- `options` (object):
  - `includeTimestamps` (boolean): Include timestamps in output
  - `outputFormat` (string): Output format ('txt', 'srt', 'json')

**Returns:**
```javascript
{
  text: string,           // The transcribed text
  file_info: {
    filename: string,     // Original filename
    size: number,         // File size in bytes
    content_type: string, // MIME type
    size_kb: string,      // File size in KB
    processing_time_ms: number, // Processing time
    include_timestamps: boolean, // Whether timestamps were included
    output_format: string,      // Output format used
    model: string,        // Whisper model used
    method: string,       // 'whisper' or 'mock'
    whisper_path: string  // Path to Whisper executable
  }
}
```

##### `transcriber.checkWhisperAvailability()`

Checks if Whisper is available in the system.

**Returns:**
```javascript
{
  available: boolean,     // Whether Whisper is available
  path: string,          // Path to Whisper executable
  error: string          // Error message if not available
}
```

## Examples

### Example 1: Basic Transcription

```javascript
const AudioTranscriber = require('audio-transcriber');

const transcriber = new AudioTranscriber();

transcriber.transcribe('meeting-recording.m4a')
  .then(result => {
    console.log('Transcript:', result.text);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

### Example 2: With Timestamps

```javascript
const AudioTranscriber = require('audio-transcriber');

const transcriber = new AudioTranscriber();

transcriber.transcribe('podcast.mp3', { includeTimestamps: true })
  .then(result => {
    console.log('Transcript with timestamps:', result.text);
    // Output: [00:00:00,000] Hello, this is the beginning...
  });
```

### Example 3: Custom Configuration

```javascript
const AudioTranscriber = require('audio-transcriber');

const transcriber = new AudioTranscriber({
  whisperModel: 'large',
  whisperPath: '/Users/me/venvs/whisper/bin/whisper',
  tmpDir: '/tmp/audio-transcription',
  cleanupTempFiles: false
});

transcriber.transcribe('lecture.wav', {
  includeTimestamps: true,
  outputFormat: 'srt'
});
```

## Output Formats

### Plain Text (default)
```
Hello, this is a transcription of the audio file.
It contains the spoken words without any timestamps.
```

### With Timestamps
```
[00:00:00,000] Hello, this is a transcription of the audio file.

[00:00:03,500] It contains the spoken words with timestamps.

[00:00:07,200] Each segment shows when it was spoken.
```

### SRT Format
```
1
00:00:00,000 --> 00:00:03,500
Hello, this is a transcription of the audio file.

2
00:00:03,500 --> 00:00:07,200
It contains the spoken words with timestamps.
```

## Error Handling

The library handles various error scenarios gracefully:

- **Whisper not available**: Falls back to mock transcription
- **Invalid audio file**: Throws descriptive error
- **FFmpeg conversion failure**: Attempts alternative approaches
- **File system errors**: Provides helpful error messages

## Troubleshooting

### Common Issues

1. **"FFmpeg not found"**
   - Install FFmpeg: `brew install ffmpeg` (macOS) or `sudo apt install ffmpeg` (Ubuntu)

2. **"Whisper not available"**
   - Install Whisper: `pip install openai-whisper`
   - Or specify custom path: `--whisper-path /path/to/whisper`

3. **"Permission denied"**
   - Check file permissions
   - Ensure write access to output directory

4. **"Empty transcript"**
   - Audio file might be too quiet or corrupted
   - Try a different Whisper model
   - Check audio file format compatibility

### Debug Mode

Enable verbose logging by setting the environment variable:
```bash
DEBUG=audio-transcriber transcribe audio.mp3
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- OpenAI for the Whisper model
- FFmpeg for audio processing capabilities
- The open-source community for inspiration and tools 