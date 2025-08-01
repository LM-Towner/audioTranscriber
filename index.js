const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class AudioTranscriber {
  constructor(options = {}) {
    this.tmpDir = options.tmpDir || path.join(process.cwd(), 'tmp');
    this.whisperModel = options.whisperModel || 'medium';
    this.whisperPath = options.whisperPath || null;
    this.cleanupTempFiles = options.cleanupTempFiles !== false; // default true
    
    // Web API options
    this.useWebAPI = options.useWebAPI || false;
    this.webAPIKey = options.webAPIKey || null;
    this.webAPIEndpoint = options.webAPIEndpoint || 'https://api.openai.com/v1/audio/transcriptions';
    
    // Ensure tmp directory exists
    fs.ensureDirSync(this.tmpDir);
  }

  /**
   * Check if Whisper is available in the system
   * @returns {Promise<{available: boolean, path: string, error?: string}>}
   */
  async checkWhisperAvailability() {
    try {
      let whisperCommand = 'whisper';
      
      // Try custom path if provided
      if (this.whisperPath && fs.existsSync(this.whisperPath)) {
        whisperCommand = this.whisperPath;
        return { available: true, path: whisperCommand };
      }
      
      // Try common virtual environment paths
      const commonPaths = [
        '/Users/kasperjones/venvs/whisper310-py10/bin/whisper',
        path.join(process.env.HOME, 'venvs/whisper310-py10/bin/whisper'),
        path.join(process.env.HOME, '.virtualenvs/whisper/bin/whisper'),
        path.join(process.env.HOME, 'anaconda3/envs/whisper/bin/whisper'),
        path.join(process.env.HOME, 'miniconda3/envs/whisper/bin/whisper')
      ];
      
      for (const venvPath of commonPaths) {
        if (fs.existsSync(venvPath)) {
          whisperCommand = venvPath;
          return { available: true, path: whisperCommand };
        }
      }
      
      // Try system Whisper
      await execAsync('whisper --help');
      return { available: true, path: whisperCommand };
      
    } catch (error) {
      return { 
        available: false, 
        path: null, 
        error: error.message 
      };
    }
  }

  /**
   * Check if web API is available
   * @returns {Promise<{available: boolean, error?: string}>}
   */
  async checkWebAPIAvailability() {
    if (!this.webAPIKey) {
      return { available: false, error: 'No API key provided' };
    }
    
    try {
      // Simple connectivity test
      const https = require('https');
      const url = require('url');
      
      const parsedUrl = url.parse(this.webAPIEndpoint);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.path,
        method: 'HEAD',
        timeout: 5000
      };
      
      return new Promise((resolve) => {
        const req = https.request(options, (res) => {
          resolve({ available: true });
        });
        
        req.on('error', (error) => {
          resolve({ available: false, error: error.message });
        });
        
        req.on('timeout', () => {
          req.destroy();
          resolve({ available: false, error: 'Connection timeout' });
        });
        
        req.end();
      });
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  /**
   * Convert SRT format to timestamped text
   * @param {string} srtContent - SRT subtitle content
   * @returns {string} - Timestamped text
   */
  convertSrtToTimestampedText(srtContent) {
    const lines = srtContent.split('\n');
    let timestampedText = '';
    let currentText = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and subtitle numbers
      if (!line || /^\d+$/.test(line)) {
        continue;
      }
      
      // Check if this is a timestamp line (format: 00:00:00,000 --> 00:00:00,000)
      if (line.includes(' --> ')) {
        // If we have accumulated text, add it with the previous timestamp
        if (currentText) {
          timestampedText += currentText + '\n\n';
          currentText = '';
        }
        
        // Extract start time
        const startTime = line.split(' --> ')[0];
        timestampedText += `[${startTime}] `;
      } else {
        // This is text content
        currentText += line + ' ';
      }
    }
    
    // Add any remaining text
    if (currentText) {
      timestampedText += currentText.trim();
    }
    
    return timestampedText;
  }

  /**
   * Generate mock transcription for testing
   * @param {string} filename - Original filename
   * @param {number} size - File size in bytes
   * @param {string} mimetype - File MIME type
   * @returns {string} - Mock transcription text
   */
  generateMockTranscription(filename, size, mimetype) {
    const mockTexts = [
      "Hello, this is a mock transcription of the audio file. Since Whisper is not available, this is a placeholder text that simulates what a real transcription would look like.",
      "Welcome to this audio recording. This is a demonstration of the transcription service. The actual audio content would be converted to text here if Whisper was properly installed and configured.",
      "This is a sample transcription that shows how the output would appear. The text would contain the actual spoken words from your audio file, with proper punctuation and formatting.",
      "In a real transcription, you would see the actual words spoken in the audio file. This mock text is just for demonstration purposes when Whisper is not available on the system."
    ];
    
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    return `[MOCK TRANSCRIPTION] ${randomText}\n\nFile: ${filename}\nSize: ${(size / 1024).toFixed(2)} KB\nType: ${mimetype}`;
  }

  /**
   * Transcribe audio using web API
   * @param {string} inputFilePath - Path to audio file
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribeWithWebAPI(inputFilePath, options = {}) {
    try {
      const https = require('https');
      const fs = require('fs');
      
      // Read file as buffer
      const audioBuffer = fs.readFileSync(inputFilePath);
      
      // Create form data
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
      let body = '';
      
      // Add file
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="file"; filename="${path.basename(inputFilePath)}"\r\n`;
      body += `Content-Type: audio/wav\r\n\r\n`;
      body += audioBuffer.toString('binary');
      body += '\r\n';
      
      // Add model
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="model"\r\n\r\n`;
      body += `whisper-1\r\n`;
      
      // Add response format
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="response_format"\r\n\r\n`;
      body += options.outputFormat === 'srt' ? 'srt' : 'json\r\n';
      
      body += `--${boundary}--\r\n`;
      
      // Make request
      const url = require('url');
      const parsedUrl = url.parse(this.webAPIEndpoint);
      
      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.webAPIKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(body)
        }
      };
      
      return new Promise((resolve, reject) => {
        const req = https.request(requestOptions, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                const result = JSON.parse(data);
                resolve({
                  text: result.text || result,
                  format: options.outputFormat
                });
              } else {
                reject(new Error(`API request failed: ${res.statusCode} - ${data}`));
              }
            } catch (error) {
              reject(new Error(`Failed to parse API response: ${error.message}`));
            }
          });
        });
        
        req.on('error', (error) => {
          reject(new Error(`API request error: ${error.message}`));
        });
        
        req.write(body);
        req.end();
      });
      
    } catch (error) {
      throw new Error(`Web API transcription failed: ${error.message}`);
    }
  }

  /**
   * Clean up temporary files
   * @param {Array} files - Array of file paths to clean up
   */
  async cleanupFiles(files) {
    if (!this.cleanupTempFiles) return;
    
    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          await fs.remove(file);
        }
      } catch (error) {
        console.warn(`Failed to cleanup file ${file}:`, error.message);
      }
    }
  }

  /**
   * Main transcription method
   * @param {string} inputFilePath - Path to the audio file
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribe(inputFilePath, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate input file
      if (!fs.existsSync(inputFilePath)) {
        throw new Error(`Input file not found: ${inputFilePath}`);
      }
      
      const fileStats = fs.statSync(inputFilePath);
      const fileSize = fileStats.size;
      const fileName = path.basename(inputFilePath);
      const fileExt = path.extname(inputFilePath).toLowerCase();
      
      // Get MIME type
      const mimeTypes = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
        '.webm': 'audio/webm',
        '.mp4': 'video/mp4',
        '.ogg': 'audio/ogg',
        '.flac': 'audio/flac',
        '.aac': 'audio/aac'
      };
      
      const contentType = mimeTypes[fileExt] || 'audio/unknown';
      
      // Check Whisper availability
      const whisperCheck = await this.checkWhisperAvailability();
      
      let transcriptionText = '';
      let method = 'mock';
      let whisperPath = null;
      
      if (whisperCheck.available) {
        // Use local Whisper
        method = 'whisper';
        whisperPath = whisperCheck.path;
        
        // Convert to WAV if needed
        let audioFile = inputFilePath;
        const tempFiles = [];
        
        if (fileExt !== '.wav') {
          const wavFile = path.join(this.tmpDir, `${Date.now()}_converted.wav`);
          const ffmpegCmd = `ffmpeg -i "${inputFilePath}" -acodec pcm_s16le -ar 16000 -ac 1 "${wavFile}" -y`;
          
          try {
            await execAsync(ffmpegCmd);
            audioFile = wavFile;
            tempFiles.push(wavFile);
          } catch (error) {
            throw new Error(`FFmpeg conversion failed: ${error.message}`);
          }
        }
        
        // Run Whisper
        const whisperCmd = `"${whisperPath}" "${audioFile}" --model ${this.whisperModel} --output_format srt --output_dir "${this.tmpDir}"`;
        
        try {
          await execAsync(whisperCmd);
          
          // Read SRT output
          const srtFile = path.join(this.tmpDir, `${path.basename(audioFile, '.wav')}.srt`);
          if (fs.existsSync(srtFile)) {
            const srtContent = fs.readFileSync(srtFile, 'utf8');
            
            if (options.includeTimestamps) {
              transcriptionText = this.convertSrtToTimestampedText(srtContent);
            } else {
              // Extract just the text without timestamps
              const lines = srtContent.split('\n');
              const textLines = lines.filter(line => 
                line.trim() && 
                !/^\d+$/.test(line.trim()) && 
                !line.includes(' --> ')
              );
              transcriptionText = textLines.join(' ').trim();
            }
            
            tempFiles.push(srtFile);
          } else {
            throw new Error('Whisper did not generate SRT output');
          }
          
        } catch (error) {
          throw new Error(`Whisper transcription failed: ${error.message}`);
        } finally {
          // Cleanup temp files
          await this.cleanupFiles(tempFiles);
        }
        
      } else if (this.useWebAPI && this.webAPIKey) {
        // Try web API
        const webAPICheck = await this.checkWebAPIAvailability();
        
        if (webAPICheck.available) {
          method = 'web-api';
          
          try {
            const result = await this.transcribeWithWebAPI(inputFilePath, options);
            transcriptionText = result.text;
          } catch (error) {
            console.warn(`Web API failed, falling back to mock: ${error.message}`);
            transcriptionText = this.generateMockTranscription(fileName, fileSize, contentType);
          }
        } else {
          console.warn(`Web API not available: ${webAPICheck.error}`);
          transcriptionText = this.generateMockTranscription(fileName, fileSize, contentType);
        }
      } else {
        // Fallback to mock
        transcriptionText = this.generateMockTranscription(fileName, fileSize, contentType);
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        text: transcriptionText,
        file_info: {
          filename: fileName,
          size: fileSize,
          content_type: contentType,
          size_kb: (fileSize / 1024).toFixed(2),
          processing_time_ms: processingTime,
          include_timestamps: options.includeTimestamps || false,
          output_format: options.outputFormat || 'txt',
          model: this.whisperModel,
          method: method,
          whisper_path: whisperPath
        }
      };
      
    } catch (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }
}

module.exports = AudioTranscriber; 