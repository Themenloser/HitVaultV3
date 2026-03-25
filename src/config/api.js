// Central API configuration for HitVaultV3
import { addLog } from '../screens/SettingsScreen';

export const BACKEND_BASE_URL = 'https://yt-is06.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  SEARCH: '/search',
  STREAM: '/stream',  // For streaming (returns JSON with streamUrl)
  AUDIO: '/audio',    // For audio download (returns MP3 file)
  VIDEO: '/video',    // For video download (returns MP4 file)
  INFO: '/info',      // Get video info and available formats
  DOWNLOAD_VIDEO: '/download/video',  // Download video with format selection
  DOWNLOAD_AUDIO: '/download/audio',  // Download audio with quality selection
};

// Robust API client with error handling and logging
export const apiClient = {
  // Generic request method with comprehensive logging
  async request(endpoint, options = {}) {
    const url = `${BACKEND_BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    
    addLog('API', `${method} ${url}`, options.body);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      addLog('API', `Response ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        addLog('API_ERROR', `HTTP ${response.status}`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      addLog('API_SUCCESS', 'Response received', { keys: Object.keys(data) });
      return data;
    } catch (error) {
      addLog('API_ERROR', 'Request failed', error.message);
      throw error;
    }
  },

  // Search endpoint - GET /search?q=query
  async search(query) {
    if (!query || !query.trim()) {
      throw new Error('Suchbegriff darf nicht leer sein');
    }

    try {
      addLog('SEARCH', `Searching for: ${query}`);
      const data = await this.request(`${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query.trim())}`);
      return data.results || [];
    } catch (error) {
      if (error.message.includes('Suchbegriff')) {
        throw error;
      }
      throw new Error('Backend ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut.');
    }
  },

  // Get stream URL for playback - /stream endpoint returns JSON with streamUrl
  async getStreamUrl(videoIdOrUrl) {
    if (!videoIdOrUrl) {
      throw new Error('Video-ID oder URL ist erforderlich');
    }

    addLog('STREAM', `Getting stream for: ${videoIdOrUrl}`);

    // Determine if it's a full URL or just an ID
    const isFullUrl = videoIdOrUrl.startsWith('http');
    const param = isFullUrl ? 'url' : 'id';
    const value = isFullUrl ? videoIdOrUrl : videoIdOrUrl;

    const attempts = [
      // POST with JSON body
      {
        endpoint: API_ENDPOINTS.STREAM,
        options: {
          method: 'POST',
          body: JSON.stringify({ [param]: value }),
        },
      },
      // GET with query param
      {
        endpoint: `${API_ENDPOINTS.STREAM}?${param}=${encodeURIComponent(value)}`,
        options: { method: 'GET' },
      },
    ];

    let lastError = null;
    for (const attempt of attempts) {
      try {
        addLog('STREAM_ATTEMPT', `Trying ${attempt.options.method}`);
        const data = await this.request(attempt.endpoint, attempt.options);
        
        // Backend returns: { streamUrl, title, artist, thumbnail, duration }
        if (data.streamUrl || data.url) {
          addLog('STREAM_SUCCESS', 'Got stream URL', { 
            url: (data.streamUrl || data.url).substring(0, 50) + '...',
            title: data.title 
          });
          return {
            url: data.streamUrl || data.url,
            title: data.title,
            artist: data.artist || data.uploader,
            thumbnail: data.thumbnail,
            duration: data.duration,
          };
        }
      } catch (error) {
        lastError = error;
        addLog('STREAM_ATTEMPT_FAILED', error.message);
        continue;
      }
    }

    throw new Error(lastError?.message || 'Stream-URL konnte nicht abgerufen werden.');
  },

  // Download audio file - /audio endpoint returns MP3 blob
  async downloadAudio(videoIdOrUrl) {
    if (!videoIdOrUrl) {
      throw new Error('Video-ID oder URL ist erforderlich');
    }

    addLog('DOWNLOAD_AUDIO', `Downloading audio for: ${videoIdOrUrl}`);

    const isFullUrl = videoIdOrUrl.startsWith('http');
    const param = isFullUrl ? 'url' : 'id';
    const value = isFullUrl ? videoIdOrUrl : videoIdOrUrl;

    const attempts = [
      // POST with JSON body
      {
        endpoint: API_ENDPOINTS.AUDIO,
        options: {
          method: 'POST',
          body: JSON.stringify({ [param]: value }),
        },
      },
      // GET with query param
      {
        endpoint: `${API_ENDPOINTS.AUDIO}?${param}=${encodeURIComponent(value)}`,
        options: { method: 'GET' },
      },
    ];

    let lastError = null;
    for (const attempt of attempts) {
      try {
        addLog('DOWNLOAD_ATTEMPT', `Trying ${attempt.options.method} ${attempt.endpoint}`);
        
        const url = `${BACKEND_BASE_URL}${attempt.endpoint}`;
        const response = await fetch(url, {
          ...attempt.options,
          headers: {
            'Accept': 'audio/mpeg, */*',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Get the blob from response
        const blob = await response.blob();
        addLog('DOWNLOAD_SUCCESS', `Got audio blob: ${blob.size} bytes`);
        
        return {
          blob,
          size: blob.size,
          type: blob.type,
        };
      } catch (error) {
        lastError = error;
        addLog('DOWNLOAD_ATTEMPT_FAILED', error.message);
        continue;
      }
    }

    throw new Error(lastError?.message || 'Audio konnte nicht heruntergeladen werden.');
  },

  // Download video file - /video endpoint returns MP4 blob
  async downloadVideo(videoIdOrUrl) {
    if (!videoIdOrUrl) {
      throw new Error('Video-ID oder URL ist erforderlich');
    }

    addLog('DOWNLOAD_VIDEO', `Downloading video for: ${videoIdOrUrl}`);

    const isFullUrl = videoIdOrUrl.startsWith('http');
    const param = isFullUrl ? 'url' : 'id';
    const value = isFullUrl ? videoIdOrUrl : videoIdOrUrl;

    const attempts = [
      // POST with JSON body
      {
        endpoint: API_ENDPOINTS.VIDEO,
        options: {
          method: 'POST',
          body: JSON.stringify({ [param]: value }),
        },
      },
      // GET with query param
      {
        endpoint: `${API_ENDPOINTS.VIDEO}?${param}=${encodeURIComponent(value)}`,
        options: { method: 'GET' },
      },
    ];

    let lastError = null;
    for (const attempt of attempts) {
      try {
        addLog('DOWNLOAD_ATTEMPT', `Trying ${attempt.options.method} ${attempt.endpoint}`);
        
        const url = `${BACKEND_BASE_URL}${attempt.endpoint}`;
        const response = await fetch(url, {
          ...attempt.options,
          headers: {
            'Accept': 'video/mp4, */*',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        addLog('DOWNLOAD_SUCCESS', `Got video blob: ${blob.size} bytes`);
        
        return {
          blob,
          size: blob.size,
          type: blob.type,
        };
      } catch (error) {
        lastError = error;
        addLog('DOWNLOAD_ATTEMPT_FAILED', error.message);
        continue;
      }
    }

    throw new Error(lastError?.message || 'Video konnte nicht heruntergeladen werden.');
  },

  // Get video info and available formats - POST /info
  async getVideoInfo(url) {
    if (!url) {
      throw new Error('URL ist erforderlich');
    }

    addLog('VIDEO_INFO', `Getting info for: ${url}`);

    try {
      const data = await this.request(API_ENDPOINTS.INFO, {
        method: 'POST',
        body: JSON.stringify({ url }),
      });

      addLog('VIDEO_INFO_SUCCESS', 'Got video info', { 
        formats: data.formats?.length || 0,
        title: data.title 
      });

      return data;
    } catch (error) {
      addLog('VIDEO_INFO_ERROR', error.message);
      throw new Error('Video-Informationen konnten nicht abgerufen werden.');
    }
  },

  // Download video with format selection - POST /download/video
  async downloadVideoWithFormat(url, formatId, mergeTo = 'mp4') {
    if (!url || !formatId) {
      throw new Error('URL und Format-ID sind erforderlich');
    }

    addLog('DOWNLOAD_VIDEO_FORMAT', `Downloading video: ${url}, format: ${formatId}, merge: ${mergeTo}`);

    try {
      const data = await this.request(API_ENDPOINTS.DOWNLOAD_VIDEO, {
        method: 'POST',
        body: JSON.stringify({ 
          url, 
          format_id: formatId, 
          merge_to: mergeTo 
        }),
      });

      addLog('DOWNLOAD_VIDEO_FORMAT_SUCCESS', 'Video download ready', { 
        filename: data.filename,
        download_url: data.download_url 
      });

      return data;
    } catch (error) {
      addLog('DOWNLOAD_VIDEO_FORMAT_ERROR', error.message);
      throw new Error('Video-Download mit Format-Auswahl fehlgeschlagen.');
    }
  },

  // Download audio with quality selection - POST /download/audio
  async downloadAudioWithQuality(url, audioFormat = 'mp3', audioQuality = '192') {
    if (!url) {
      throw new Error('URL ist erforderlich');
    }

    addLog('DOWNLOAD_AUDIO_QUALITY', `Downloading audio: ${url}, format: ${audioFormat}, quality: ${audioQuality}`);

    try {
      const data = await this.request(API_ENDPOINTS.DOWNLOAD_AUDIO, {
        method: 'POST',
        body: JSON.stringify({ 
          url, 
          audio_format: audioFormat, 
          audio_quality: audioQuality 
        }),
      });

      addLog('DOWNLOAD_AUDIO_QUALITY_SUCCESS', 'Audio download ready', { 
        filename: data.filename,
        download_url: data.download_url 
      });

      return data;
    } catch (error) {
      addLog('DOWNLOAD_AUDIO_QUALITY_ERROR', error.message);
      throw new Error('Audio-Download mit Qualität-Auswahl fehlgeschlagen.');
    }
  },

  // Download file from /file/{filename} endpoint
  async downloadFile(filename) {
    if (!filename) {
      throw new Error('Filename ist erforderlich');
    }

    addLog('DOWNLOAD_FILE', `Downloading file: ${filename}`);

    try {
      const url = `${BACKEND_BASE_URL}/file/${encodeURIComponent(filename)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      addLog('DOWNLOAD_FILE_SUCCESS', `Got file blob: ${blob.size} bytes`);
      
      return {
        blob,
        size: blob.size,
        type: blob.type,
      };
    } catch (error) {
      addLog('DOWNLOAD_FILE_ERROR', error.message);
      throw new Error('Datei konnte nicht heruntergeladen werden.');
    }
  },
};

export default apiClient;
