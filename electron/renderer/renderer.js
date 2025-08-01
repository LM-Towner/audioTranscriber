// DOM Elements
const elements = {
    version: document.getElementById('version'),
    dropZone: document.getElementById('dropZone'),
    selectFileBtn: document.getElementById('selectFileBtn'),
    selectedFile: document.getElementById('selectedFile'),
    filename: document.getElementById('filename'),
    filesize: document.getElementById('filesize'),
    changeFileBtn: document.getElementById('changeFileBtn'),
    whisperModel: document.getElementById('whisperModel'),
    outputFormat: document.getElementById('outputFormat'),
    includeTimestamps: document.getElementById('includeTimestamps'),
    whisperStatus: document.getElementById('whisperStatus'),
    statusIcon: document.getElementById('statusIcon'),
    statusTitle: document.getElementById('statusTitle'),
    statusMessage: document.getElementById('statusMessage'),
    transcribeBtn: document.getElementById('transcribeBtn'),
    progressSection: document.getElementById('progressSection'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    resultsSection: document.getElementById('resultsSection'),
    resultsInfo: document.getElementById('resultsInfo'),
    transcriptText: document.getElementById('transcriptText'),
    copyBtn: document.getElementById('copyBtn'),
    saveBtn: document.getElementById('saveBtn'),
    helpLink: document.getElementById('helpLink')
};

// App state
let appState = {
    selectedFilePath: null,
    whisperAvailable: false,
    isProcessing: false,
    currentResult: null
};

// Initialize app
async function initializeApp() {
    try {
        // Get app version
        const version = await window.electronAPI.getAppVersion();
        elements.version.textContent = `v${version}`;

        // Check Whisper availability
        const whisperCheck = await window.electronAPI.appReady();
        appState.whisperAvailable = whisperCheck.whisperAvailable;
        
        updateWhisperStatus(whisperCheck);
        
        // Enable transcribe button if file is selected
        updateTranscribeButton();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to initialize application');
    }
}

// Update Whisper status display
function updateWhisperStatus(whisperCheck) {
    if (whisperCheck.whisperAvailable) {
        elements.statusIcon.className = 'fas fa-check-circle status-success';
        elements.statusTitle.textContent = 'Whisper Available';
        elements.statusMessage.textContent = `Using: ${whisperCheck.whisperPath || 'System Whisper'}`;
    } else {
        elements.statusIcon.className = 'fas fa-exclamation-triangle status-warning';
        elements.statusTitle.textContent = 'Whisper Not Available';
        elements.statusMessage.textContent = 'Will use mock mode for testing. Install Whisper for full functionality.';
    }
}

// File selection
async function selectFile() {
    try {
        const filePath = await window.electronAPI.selectAudioFile();
        if (filePath) {
            setSelectedFile(filePath);
        }
    } catch (error) {
        console.error('Failed to select file:', error);
        showError('Failed to select file');
    }
}

// Set selected file
function setSelectedFile(filePath) {
    appState.selectedFilePath = filePath;
    
    // Get file info
    const fileName = filePath.split(/[\\/]/).pop();
    const fileSize = getFileSize(filePath); // This would need to be implemented
    
    // Update UI
    elements.filename.textContent = fileName;
    elements.filesize.textContent = fileSize || 'Unknown size';
    
    elements.dropZone.style.display = 'none';
    elements.selectedFile.style.display = 'block';
    
    updateTranscribeButton();
}

// Get file size (placeholder - would need actual implementation)
function getFileSize(filePath) {
    // In a real implementation, you'd get this from the file system
    return 'Unknown';
}

// Change file
function changeFile() {
    appState.selectedFilePath = null;
    elements.dropZone.style.display = 'block';
    elements.selectedFile.style.display = 'none';
    updateTranscribeButton();
}

// Update transcribe button state
function updateTranscribeButton() {
    const canTranscribe = appState.selectedFilePath && !appState.isProcessing;
    elements.transcribeBtn.disabled = !canTranscribe;
}

// Start transcription
async function startTranscription() {
    if (!appState.selectedFilePath || appState.isProcessing) return;
    
    try {
        appState.isProcessing = true;
        updateTranscribeButton();
        
        // Show progress
        elements.progressSection.style.display = 'block';
        elements.resultsSection.style.display = 'none';
        
        // Update progress
        updateProgress(0, 'Preparing transcription...');
        
        // Get settings
        const options = {
            filePath: appState.selectedFilePath,
            includeTimestamps: elements.includeTimestamps.checked,
            outputFormat: elements.outputFormat.value,
            whisperModel: elements.whisperModel.value
        };
        
        // Start transcription
        updateProgress(25, 'Processing audio...');
        
        const result = await window.electronAPI.transcribeAudio(options);
        
        if (result.success) {
            appState.currentResult = result.data;
            updateProgress(100, 'Transcription complete!');
            
            // Show results after a brief delay
            setTimeout(() => {
                showResults(result.data);
            }, 500);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Transcription failed:', error);
        showError(`Transcription failed: ${error.message}`);
    } finally {
        appState.isProcessing = false;
        updateTranscribeButton();
    }
}

// Update progress bar
function updateProgress(percentage, text) {
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressText.textContent = text;
}

// Show results
function showResults(result) {
    elements.progressSection.style.display = 'none';
    elements.resultsSection.style.display = 'block';
    
    // Update results info
    const info = `
        File: ${result.file_info.filename} | 
        Size: ${result.file_info.size_kb} KB | 
        Processing time: ${result.file_info.processing_time_ms}ms | 
        Model: ${result.file_info.model} | 
        Method: ${result.file_info.method}
    `;
    elements.resultsInfo.textContent = info;
    
    // Update transcript text
    elements.transcriptText.value = result.text;
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Copy transcript
async function copyTranscript() {
    try {
        await navigator.clipboard.writeText(elements.transcriptText.value);
        showSuccess('Transcript copied to clipboard!');
    } catch (error) {
        console.error('Failed to copy:', error);
        showError('Failed to copy transcript');
    }
}

// Save transcript
async function saveTranscript() {
    if (!appState.currentResult) return;
    
    try {
        const fileName = appState.currentResult.file_info.filename;
        const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        const extension = elements.outputFormat.value;
        const defaultName = `${baseName}_transcript.${extension}`;
        
        const result = await window.electronAPI.saveTranscript({
            content: elements.transcriptText.value,
            defaultName: defaultName
        });
        
        if (result.success) {
            showSuccess(`Transcript saved to: ${result.filePath}`);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to save:', error);
        showError(`Failed to save transcript: ${error.message}`);
    }
}

// Drag and drop handlers
function setupDragAndDrop() {
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('dragover');
    });
    
    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('dragover');
    });
    
    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (isAudioFile(file.name)) {
                setSelectedFile(file.path);
            } else {
                showError('Please select a valid audio file');
            }
        }
    });
    
    elements.dropZone.addEventListener('click', selectFile);
}

// Check if file is audio
function isAudioFile(filename) {
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.webm', '.mp4', '.ogg', '.flac', '.aac'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return audioExtensions.includes(extension);
}

// Show success message
function showSuccess(message) {
    // Simple success notification - could be enhanced with a proper notification system
    alert(message);
}

// Show error message
function showError(message) {
    // Simple error notification - could be enhanced with a proper notification system
    alert(`Error: ${message}`);
}

// Open help
function openHelp() {
    window.electronAPI.openExternal('https://github.com/yourusername/audio-transcriber');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupDragAndDrop();
    
    // Button event listeners
    elements.selectFileBtn.addEventListener('click', selectFile);
    elements.changeFileBtn.addEventListener('click', changeFile);
    elements.transcribeBtn.addEventListener('click', startTranscription);
    elements.copyBtn.addEventListener('click', copyTranscript);
    elements.saveBtn.addEventListener('click', saveTranscript);
    elements.helpLink.addEventListener('click', openHelp);
    
    // Settings change listeners
    elements.whisperModel.addEventListener('change', updateTranscribeButton);
    elements.outputFormat.addEventListener('change', updateTranscribeButton);
    elements.includeTimestamps.addEventListener('change', updateTranscribeButton);
}); 