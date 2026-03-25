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
  // Generic request method with better debugging
  async request(endpoint, options = {}) {
    try {
      const url = `${BACKEND_BASE_URL}${endpoint}`;
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      console.log('Request body:', options.body);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
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

  // Get audio download/stream URL - try different formats
  async getAudio(videoId) {
    if (!videoId) {
      throw new Error('Video-ID ist erforderlich');
    }

    // Try different request formats
    const attempts = [
      // Standard POST with JSON
      {
        endpoint: API_ENDPOINTS.AUDIO,
        options: {
          method: 'POST',
          body: JSON.stringify({ id: videoId }),
        },
      },
      // Try with video_id field
      {
        endpoint: API_ENDPOINTS.AUDIO,
        options: {
          method: 'POST',
          body: JSON.stringify({ video_id: videoId }),
        },
      },
      // Try GET with query param
      {
        endpoint: `${API_ENDPOINTS.AUDIO}?id=${videoId}`,
        options: {
          method: 'GET',
        },
      },
    ];

    for (const attempt of attempts) {
      try {
        console.log(`Attempting audio request with:`, attempt);
        const data = await this.request(attempt.endpoint, attempt.options);
        
        if (data && (data.url || data.stream_url || data.download_url)) {
          return {
            url: data.url || data.stream_url || data.download_url,
            ...data,
          };
        }
      } catch (error) {
        console.log(`Attempt failed:`, error.message);
        continue;
      }
    }

    throw new Error('Audio-URL konnte nicht abgerufen werden. Bitte überprüfen Sie die Video-ID.');
  },

  // Get video download URL - try different formats
  async getVideo(videoId) {
    if (!videoId) {
      throw new Error('Video-ID ist erforderlich');
    }

    // Try different request formats
    const attempts = [
      // Standard POST with JSON
      {
        endpoint: API_ENDPOINTS.VIDEO,
        options: {
          method: 'POST',
          body: JSON.stringify({ id: videoId }),
        },
      },
      // Try with video_id field
      {
        endpoint: API_ENDPOINTS.VIDEO,
        options: {
          method: 'POST',
          body: JSON.stringify({ video_id: videoId }),
        },
      },
      // Try GET with query param
      {
        endpoint: `${API_ENDPOINTS.VIDEO}?id=${videoId}`,
        options: {
          method: 'GET',
        },
      },
    ];

    for (const attempt of attempts) {
      try {
        console.log(`Attempting video request with:`, attempt);
        const data = await this.request(attempt.endpoint, attempt.options);
        
        if (data && (data.url || data.stream_url || data.download_url)) {
          return {
            url: data.url || data.stream_url || data.download_url,
            ...data,
          };
        }
      } catch (error) {
        console.log(`Attempt failed:`, error.message);
        continue;
      }
    }

    throw new Error('Video-URL konnte nicht abgerufen werden. Bitte überprüfen Sie die Video-ID.');
  },
};

export default apiClient;
