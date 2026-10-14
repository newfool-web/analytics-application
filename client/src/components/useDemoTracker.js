import { useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function useDemoTracker() {
  useEffect(() => {
    if (window.__causalfunnel_initialized || document.getElementById('causalfunnel-tracker')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'causalfunnel-tracker';
    script.src = '/tracker.js';
    script.dataset.apiUrl = API_BASE_URL;
    script.defer = true;
    document.head.appendChild(script);
  }, []);
}
