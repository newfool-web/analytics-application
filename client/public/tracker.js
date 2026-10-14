(function() {
  'use strict';

  // Prevent double initialization
  if (window.__causalfunnel_initialized) return;
  window.__causalfunnel_initialized = true;

  // Read API URL from script tag's data attribute
  const scriptTag = document.currentScript || document.querySelector('script[data-api-url]');
  const API_URL = scriptTag?.getAttribute('data-api-url');
  if (!API_URL) {
    console.warn('[CausalFunnel] No data-api-url attribute found. Tracking disabled.');
    return;
  }

  // Session ID management
  function getSessionId() {
    const STORAGE_KEY = 'causalfunnel_session_id';
    try {
      let sessionId = localStorage.getItem(STORAGE_KEY);
      if (sessionId) return sessionId;
      sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
          });
      localStorage.setItem(STORAGE_KEY, sessionId);
      return sessionId;
    } catch (e) {
      // localStorage unavailable — generate non-persistent ID
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  }

  const sessionId = getSessionId();
  let isSending = false; // prevent recursive tracking

  function getPageUrl() {
    var url = new URL(window.location.href);
    url.hash = '';
    return url.toString();
  }

  function sendEvent(payload) {
    if (isSending) return;
    isSending = true;
    try {
      var url = API_URL + '/events';
      var body = JSON.stringify(payload);
      // Use fetch as primary delivery — explicit no-credentials to avoid CORS preflight issues
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
        credentials: 'omit',
        mode: 'cors'
      }).catch(function() {}).finally(function() { isSending = false; });
      return;
    } catch (e) {
      // Never break the host page
    }
    isSending = false;
  }

  // Track page view
  sendEvent({
    session_id: sessionId,
    event_type: 'page_view',
    page_url: getPageUrl(),
    timestamp: new Date().toISOString(),
    click_x: null,
    click_y: null
  });

  // Track clicks
  document.addEventListener('click', function(e) {
    sendEvent({
      session_id: sessionId,
      event_type: 'click',
      page_url: getPageUrl(),
      timestamp: new Date().toISOString(),
      click_x: e.clientX,
      click_y: e.clientY
    });
  }, true); // capture phase to avoid missing events
})();
