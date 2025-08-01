const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const AudioTranscriber = require('../index.js');

let mainWindow;
let transcriber;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize transcriber
async function initializeTranscriber() {
  transcriber = new AudioTranscriber({
    tmpDir: path.join(app.getPath('temp'), 'audio-transcriber'),
    whisperModel: 'medium',
    cleanupTempFiles: true
  });

  // Check Whisper availability
  const whisperCheck = await transcriber.checkWhisperAvailability();
  return whisperCheck;
}

// IPC Handlers
ipcMain.handle('app-ready', async () => {
  const whisperCheck = await initializeTranscriber();
  return {
    whisperAvailable: whisperCheck.available,
    whisperPath: whisperCheck.path,
    whisperError: whisperCheck.error
  };
});

ipcMain.handle('select-audio-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: 'Audio Files',
        extensions: ['mp3', 'wav', 'm4a', 'webm', 'mp4', 'ogg', 'flac', 'aac']
      },
      {
        name: 'All Files',
        extensions: ['*']
      }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('transcribe-audio', async (event, options) => {
  try {
    const {
      filePath,
      includeTimestamps = false,
      outputFormat = 'txt',
      whisperModel = 'medium'
    } = options;

    // Update transcriber model if needed
    if (whisperModel !== transcriber.whisperModel) {
      transcriber.whisperModel = whisperModel;
    }

    const result = await transcriber.transcribe(filePath, {
      includeTimestamps,
      outputFormat
    });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('save-transcript', async (event, { content, defaultName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'SRT Files', extensions: ['srt'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    try {
      await fs.writeFile(result.filePath, content, 'utf8');
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Save cancelled' };
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app quit
app.on('before-quit', () => {
  // Cleanup temporary files
  if (transcriber && transcriber.tmpDir) {
    try {
      fs.removeSync(transcriber.tmpDir);
    } catch (error) {
      console.error('Failed to cleanup temp directory:', error);
    }
  }
}); 