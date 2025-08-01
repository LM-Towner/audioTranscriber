#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const AudioTranscriber = require('./index.js');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputFile: null,
    includeTimestamps: false,
    outputFormat: 'txt',
    whisperModel: 'medium',
    whisperPath: null,
    outputFile: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--timestamps':
      case '-t':
        options.includeTimestamps = true;
        break;
      case '--format':
      case '-f':
        options.outputFormat = args[++i] || 'txt';
        break;
      case '--model':
      case '-m':
        options.whisperModel = args[++i] || 'medium';
        break;
      case '--whisper-path':
      case '-w':
        options.whisperPath = args[++i];
        break;
      case '--output':
      case '-o':
        options.outputFile = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (!options.inputFile && !arg.startsWith('-')) {
          options.inputFile = arg;
        }
        break;
    }
  }

  return options;
}

// Show help information
function showHelp() {
  console.log(`
Audio Transcriber - A standalone audio transcription library using Whisper

Usage: transcribe <audio-file> [options]

Options:
  -t, --timestamps           Include timestamps in the transcript
  -f, --format <format>      Output format: txt, srt, json (default: txt)
  -m, --model <model>        Whisper model: tiny, base, small, medium, large (default: medium)
  -w, --whisper-path <path>  Custom path to Whisper executable
  -o, --output <file>        Output file path (default: auto-generated)
  -h, --help                 Show this help message

Examples:
  transcribe audio.mp3
  transcribe audio.m4a --timestamps
  transcribe audio.wav --format srt --model large
  transcribe audio.webm --output transcript.txt
  transcribe "My Audio File.m4a" --timestamps --model small

Supported audio formats:
  .webm, .wav, .mp3, .m4a, .mp4, .ogg, .flac, .aac

Requirements:
  - FFmpeg installed and available in PATH
  - Whisper installed (will use mock mode if not available)
`);
}

// Main CLI function
async function main() {
  const options = parseArgs();

  if (options.help || !options.inputFile) {
    showHelp();
    process.exit(options.help ? 0 : 1);
  }

  try {
    // Initialize transcriber
    const transcriber = new AudioTranscriber({
      whisperModel: options.whisperModel,
      whisperPath: options.whisperPath
    });

    console.log(`\n🎵 Audio Transcriber v1.0.0`);
    console.log(`📁 Input: ${options.inputFile}`);
    console.log(`🎯 Model: ${options.whisperModel}`);
    console.log(`⏱️  Timestamps: ${options.includeTimestamps ? 'Yes' : 'No'}`);
    console.log(`📄 Format: ${options.outputFormat}`);
    console.log('');

    // Check Whisper availability
    const whisperCheck = await transcriber.checkWhisperAvailability();
    if (whisperCheck.available) {
      console.log(`✅ Whisper found: ${whisperCheck.path}`);
    } else {
      console.log(`⚠️  Whisper not available: ${whisperCheck.error}`);
      console.log(`📝 Will use mock transcription mode`);
    }

    console.log('\n🔄 Starting transcription...\n');

    // Transcribe the file
    const result = await transcriber.transcribe(options.inputFile, {
      includeTimestamps: options.includeTimestamps,
      outputFormat: options.outputFormat
    });

    // Determine output file path
    let outputPath = options.outputFile;
    if (!outputPath) {
      const inputDir = path.dirname(options.inputFile);
      const inputName = path.basename(options.inputFile, path.extname(options.inputFile));
      const suffix = options.includeTimestamps ? '_transcript_with_timestamps' : '_transcript';
      const extension = options.outputFormat === 'txt' ? '.txt' : `.${options.outputFormat}`;
      outputPath = path.join(inputDir, `${inputName}${suffix}${extension}`);
    }

    // Save the transcript
    await fs.writeFile(outputPath, result.text, 'utf8');

    // Display results
    console.log('\n✅ Transcription completed successfully!');
    console.log('\n📊 File Information:');
    console.log(`   Filename: ${result.file_info.filename}`);
    console.log(`   Size: ${result.file_info.size_kb} KB`);
    console.log(`   Duration: ${(result.file_info.processing_time_ms / 1000).toFixed(1)}s processing time`);
    console.log(`   Model: ${result.file_info.model}`);
    console.log(`   Method: ${result.file_info.method}`);

    console.log('\n📄 Transcript Preview:');
    const preview = result.text.length > 200 
      ? result.text.substring(0, 200) + '...'
      : result.text;
    console.log(preview);

    console.log(`\n💾 Saved to: ${outputPath}`);
    console.log(`📏 Transcript length: ${result.text.length} characters`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { parseArgs, showHelp, main }; 