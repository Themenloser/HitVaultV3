// Central API configuration for HitVaultV3
export const BACKEND_BASE_URL = 'https://yt-is06.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  SEARCH: '/search',
  AUDIO: '/audio',
  VIDEO: '/video',
};

// Robust API client with error handling
export const apiClient = {
  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const url = `${BACKEND_BASE_URL}${endpoint}`;
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  },

  // Search endpoint
  async search(query) {
    if (!query || !query.trim()) {
      throw new Error('Suchbegriff darf nicht leer sein');
    }

    try {
      const data = await this.request(`${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query.trim())}`);
      return data.results || [];
    } catch (error) {
      if (error.message.includes('Suchbegriff')) {
        throw error;
      }
      throw new Error('Backend ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut.');
    }
  },

  // Get audio download/stream URL
  async getAudio(videoId) {
    if (!videoId) {
      throw new Error('Video-ID ist erforderlich');
    }

    try {
      const data = await this.request(API_ENDPOINTS.AUDIO, {
        method: 'POST',
        body: JSON.stringify({ id: videoId }),
      });
      return data;
    } catch (error) {
      if (error.message.includes('Video-ID')) {
        throw error;
      }
      throw new Error('Audio-URL konnte nicht abgerufen werden. Bitte versuchen Sie es später erneut.');
    }
  },

  // Get video download URL
  async getVideo(videoId) {
    if (!videoId) {
      throw new Error('Video-ID ist erforderlich');
    }

    try {
      const data = await this.request(API_ENDPOINTS.VIDEO, {
        method: 'POST',
        body: JSON.stringify({ id: videoId }),
      });
      return data;
    } catch (error) {
      if (error.message.includes('Video-ID')) {
        throw error;
      }
      throw new Error('Video-URL konnte nicht abgerufen werden. Bitte versuchen Sie es später erneut.');
    }
  },
};

export default apiClient;
