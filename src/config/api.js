// Central API configuration for HitVaultV3
import { addLog } from '../screens/SettingsScreen';

export const BACKEND_BASE_URL = 'https://yt-is06.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  SEARCH: '/search',
  AUDIO: '/audio',
  VIDEO: '/video',
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

  // Search endpoint
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

  // Get audio stream URL - yt-dlp compatible format
  async getAudio(videoId) {
    if (!videoId) {
      throw new Error('Video-ID ist erforderlich');
    }

    addLog('AUDIO', `Getting audio for: ${videoId}`);

    // Try different request formats that yt-dlp backends typically use
    const attempts = [
      {
        endpoint: API_ENDPOINTS.AUDIO,
        options: {
          method: 'POST',
          body: JSON.stringify({ id: videoId }),
        },
      },
      {
        endpoint: API_ENDPOINTS.AUDIO,
        options: {
          method: 'POST',
          body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` }),
        },
      },
      {
        endpoint: `${API_ENDPOINTS.AUDIO}?id=${videoId}&format=audio`,
        options: { method: 'GET' },
      },
    ];

    let lastError = null;
    for (const attempt of attempts) {
      try {
        addLog('AUDIO_ATTEMPT', `Trying ${attempt.options.method} ${attempt.endpoint}`);
        const data = await this.request(attempt.endpoint, attempt.options);
        
        // yt-dlp backends typically return url in various formats
        const streamUrl = data.url || data.stream_url || data.download_url || data.audio_url || data.link;
        
        if (streamUrl) {
          addLog('AUDIO_SUCCESS', 'Got audio URL', { url: streamUrl.substring(0, 50) + '...' });
          return {
            url: streamUrl,
            title: data.title,
            artist: data.artist || data.uploader,
            duration: data.duration,
            ...data,
          };
        }
        
        // If no URL but has formats array (yt-dlp style response)
        if (data.formats && data.formats.length > 0) {
          const audioFormat = data.formats.find(f => f.acodec !== 'none' && f.vcodec === 'none') || 
                             data.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3') ||
                             data.formats[0];
          
          if (audioFormat && audioFormat.url) {
            addLog('AUDIO_SUCCESS', 'Got audio URL from formats', { format: audioFormat.format_id });
            return {
              url: audioFormat.url,
              title: data.title,
              artist: data.artist || data.uploader,
              duration: data.duration,
              format: audioFormat.format_id,
              ...data,
            };
          }
        }
      } catch (error) {
        lastError = error;
        addLog('AUDIO_ATTEMPT_FAILED', error.message);
        continue;
      }
    }

    throw new Error(lastError?.message || 'Audio-URL konnte nicht abgerufen werden. Bitte überprüfen Sie die Video-ID.');
  },

  // Get video download URL - yt-dlp compatible format
  async getVideo(videoId) {
    if (!videoId) {
      throw new Error('Video-ID ist erforderlich');
    }

    addLog('VIDEO', `Getting video for: ${videoId}`);

    const attempts = [
      {
        endpoint: API_ENDPOINTS.VIDEO,
        options: {
          method: 'POST',
          body: JSON.stringify({ id: videoId }),
        },
      },
      {
        endpoint: API_ENDPOINTS.VIDEO,
        options: {
          method: 'POST',
          body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` }),
        },
      },
      {
        endpoint: `${API_ENDPOINTS.VIDEO}?id=${videoId}&format=video`,
        options: { method: 'GET' },
      },
    ];

    let lastError = null;
    for (const attempt of attempts) {
      try {
        addLog('VIDEO_ATTEMPT', `Trying ${attempt.options.method} ${attempt.endpoint}`);
        const data = await this.request(attempt.endpoint, attempt.options);
        
        const streamUrl = data.url || data.stream_url || data.download_url || data.video_url || data.link;
        
        if (streamUrl) {
          addLog('VIDEO_SUCCESS', 'Got video URL', { url: streamUrl.substring(0, 50) + '...' });
          return {
            url: streamUrl,
            title: data.title,
            artist: data.artist || data.uploader,
            duration: data.duration,
            ...data,
          };
        }
        
        // yt-dlp formats array
        if (data.formats && data.formats.length > 0) {
          const videoFormat = data.formats.find(f => f.vcodec !== 'none' && f.height >= 720) ||
                             data.formats.find(f => f.vcodec !== 'none') ||
                             data.formats[0];
          
          if (videoFormat && videoFormat.url) {
            addLog('VIDEO_SUCCESS', 'Got video URL from formats', { format: videoFormat.format_id });
            return {
              url: videoFormat.url,
              title: data.title,
              artist: data.artist || data.uploader,
              duration: data.duration,
              format: videoFormat.format_id,
              ...data,
            };
          }
        }
      } catch (error) {
        lastError = error;
        addLog('VIDEO_ATTEMPT_FAILED', error.message);
        continue;
      }
    }

    throw new Error(lastError?.message || 'Video-URL konnte nicht abgerufen werden. Bitte überprüfen Sie die Video-ID.');
  },
};

export default apiClient;
