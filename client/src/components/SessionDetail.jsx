import React, { useState, useEffect } from 'react';
import { fetchSessionEvents } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function SessionDetail({ sessionId, onBack }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvents = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSessionEvents(sessionId);
      setEvents(Array.isArray(data) ? data : (data.events || []));
    } catch (err) {
      setError(err.message || 'Failed to load session events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [sessionId]);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="pb-4 border-b border-surface-200">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors mb-3 group"
        >
          <svg
            className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sessions
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-surface-900 tracking-tight">Session Details</h2>
            <p className="mt-1 text-xs sm:text-sm font-mono text-surface-600 bg-surface-100 px-3 py-1.5 rounded-lg inline-block break-all border border-surface-200">
              {sessionId}
            </p>
          </div>
          <button
            onClick={loadEvents}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-100 focus:outline-none transition-colors shadow-xs disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="Fetching event stream..." />}

      {error && !loading && <ErrorMessage message={error} onRetry={loadEvents} />}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-surface-300 p-8">
          <p className="text-surface-500 font-medium">No telemetry events found for this session.</p>
        </div>
      )}

      {/* Event Timeline */}
      {!loading && !error && events.length > 0 && (
        <div className="relative pl-6 border-l-2 border-surface-200 ml-4 space-y-6 py-2">
          {events.map((evt, idx) => {
            const isClick = evt.event_type === 'click';
            const isPageView = evt.event_type === 'page_view';
            const timestamp = evt.timestamp || evt.created_at;

            return (
              <div key={evt.id || idx} className="relative group">
                {/* Timeline Dot */}
                <span
                  className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                    isPageView
                      ? 'bg-blue-600'
                      : isClick
                      ? 'bg-emerald-600'
                      : 'bg-primary-600'
                  }`}
                />

                {/* Event Card */}
                <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-surface-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          isPageView
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : isClick
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-surface-100 text-surface-700 border border-surface-200'
                        }`}
                      >
                        {evt.event_type}
                      </span>
                      {isClick && (evt.click_x !== null && evt.click_y !== null) && (
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-surface-100 text-surface-700">
                          x: {evt.click_x}, y: {evt.click_y}
                        </span>
                      )}
                    </div>
                    <time className="text-xs text-surface-500">
                      {formatDate(timestamp)}
                    </time>
                  </div>

                  <div className="mt-3 flex items-start gap-2">
                    <span className="text-xs font-medium text-surface-400 shrink-0 mt-0.5">URL:</span>
                    <a
                      href={evt.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-primary-600 hover:text-primary-800 break-all underline decoration-primary-200 hover:decoration-primary-600"
                    >
                      {evt.page_url}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
