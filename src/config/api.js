// Central API configuration for HitVaultV3
import { addLog } from '../screens/SettingsScreen';

export const BACKEND_BASE_URL = 'https://yt-is06.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  SEARCH: '/search',
  STREAM: '/stream',  // For streaming (returns JSON with streamUrl)
  AUDIO: '/audio',    // For audio download (returns MP3 file)
  VIDEO: '/video',    // For video download (returns MP4 file)
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
};

export default apiClient;
