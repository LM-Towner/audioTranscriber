const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App initialization
  appReady: () => ipcRenderer.invoke('app-ready'),
  
  // File operations
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  saveTranscript: (options) => ipcRenderer.invoke('save-transcript', options),
  
  // Transcription
  transcribeAudio: (options) => ipcRenderer.invoke('transcribe-audio', options),
  
  // System
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Progress updates (if needed)
  onProgress: (callback) => {
    ipcRenderer.on('transcription-progress', callback);
    return () => {
      ipcRenderer.removeAllListeners('transcription-progress');
    };
  }
}); 