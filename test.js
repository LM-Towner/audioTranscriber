const AudioTranscriber = require('./index.js');
const path = require('path');

async function runTests() {
  console.log('🧪 Audio Transcriber Test Suite\n');

  // Test 1: Check Whisper availability
  console.log('1. Testing Whisper availability...');
  const transcriber = new AudioTranscriber();
  const whisperCheck = await transcriber.checkWhisperAvailability();
  
  if (whisperCheck.available) {
    console.log(`✅ Whisper found: ${whisperCheck.path}`);
  } else {
    console.log(`⚠️  Whisper not available: ${whisperCheck.error}`);
    console.log('📝 Will use mock mode for testing');
  }

  // Test 2: Test SRT to timestamped text conversion
  console.log('\n2. Testing SRT to timestamped text conversion...');
  const sampleSrt = `1
00:00:00,000 --> 00:00:03,500
Hello, this is a test transcription.

2
00:00:03,500 --> 00:00:07,200
It contains multiple segments with timestamps.

3
00:00:07,200 --> 00:00:10,000
This is the final segment.`;

  const timestampedText = transcriber.convertSrtToTimestampedText(sampleSrt);
  console.log('✅ SRT conversion successful');
  console.log('Sample output:');
  console.log(timestampedText);

  // Test 3: Test mock transcription
  console.log('\n3. Testing mock transcription...');
  const mockResult = transcriber.generateMockTranscription('test.mp3', 1024000, 'audio/mp3');
  console.log('✅ Mock transcription generated');
  console.log('Sample output:');
  console.log(mockResult.substring(0, 200) + '...');

  // Test 4: Test with actual file (if available)
  console.log('\n4. Testing with actual file...');
  
  // Look for test files in common locations
  const testFiles = [
    path.join(__dirname, '../debug/debug_audio_1753810013081.webm'),
    path.join(__dirname, '../debug/debug_audio_1753810013081.wav'),
    path.join(process.env.HOME, 'Downloads/test-audio.mp3'),
    path.join(process.env.HOME, 'Downloads/test-audio.m4a')
  ];

  let testFile = null;
  for (const file of testFiles) {
    try {
      const fs = require('fs-extra');
      if (await fs.pathExists(file)) {
        testFile = file;
        break;
      }
    } catch (error) {
      // Continue to next file
    }
  }

  if (testFile) {
    console.log(`📁 Found test file: ${testFile}`);
    
    try {
      const result = await transcriber.transcribe(testFile, {
        includeTimestamps: true
      });
      
      console.log('✅ Actual transcription successful!');
      console.log(`📊 File: ${result.file_info.filename}`);
      console.log(`📏 Size: ${result.file_info.size_kb} KB`);
      console.log(`⏱️  Processing time: ${result.file_info.processing_time_ms}ms`);
      console.log(`🎯 Model: ${result.file_info.model}`);
      console.log(`📄 Method: ${result.file_info.method}`);
      console.log('\n📝 Transcript preview:');
      console.log(result.text.substring(0, 300) + (result.text.length > 300 ? '...' : ''));
      
    } catch (error) {
      console.log(`❌ Actual transcription failed: ${error.message}`);
    }
  } else {
    console.log('📁 No test files found. Skipping actual transcription test.');
    console.log('💡 To test with real files, place an audio file in one of these locations:');
    testFiles.forEach(file => console.log(`   - ${file}`));
  }

  console.log('\n🎉 Test suite completed!');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
}); 