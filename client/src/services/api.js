const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMessage = data.error;
      } else if (data && data.message) {
        errorMessage = data.message;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // Fallback to status text
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function fetchHealth() {
  return request('/health');
}

export async function fetchSessions() {
  return request('/sessions');
}

export async function fetchSessionEvents(sessionId) {
  return request(`/sessions/${encodeURIComponent(sessionId)}/events`);
}

export async function fetchHeatmapPages() {
  return request('/heatmap/pages');
}

export async function fetchHeatmapClicks(pageUrl) {
  return request(`/heatmap/clicks?pageUrl=${encodeURIComponent(pageUrl)}`);
}
