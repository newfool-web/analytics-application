import React, { useState, useEffect } from 'react';
import { fetchHeatmapPages, fetchHeatmapClicks } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const ASSUMED_VIEWPORT_WIDTH = 1920;
const ASSUMED_VIEWPORT_HEIGHT = 1080;

export default function HeatmapView() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [clicks, setClicks] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingClicks, setLoadingClicks] = useState(false);
  const [error, setError] = useState(null);

  // Load list of available pages
  const loadPages = async () => {
    try {
      setLoadingPages(true);
      setError(null);
      const data = await fetchHeatmapPages();
      const rawList = Array.isArray(data) ? data : (data.pages || []);
      const normalizedPages = rawList.map((item) =>
        typeof item === 'string' ? item : (item.page_url || item.url || '')
      ).filter(Boolean);

      setPages(normalizedPages);
      if (normalizedPages.length > 0 && !selectedPage) {
        setSelectedPage(normalizedPages[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tracked pages');
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  // Fetch clicks whenever selectedPage changes
  useEffect(() => {
    if (!selectedPage) {
      setClicks([]);
      return;
    }

    const loadClicks = async () => {
      try {
        setLoadingClicks(true);
        setError(null);
        const data = await fetchHeatmapClicks(selectedPage);
        const clickList = Array.isArray(data) ? data : (data.clicks || []);
        setClicks(clickList);
      } catch (err) {
        setError(err.message || 'Failed to fetch clicks for selected page');
      } finally {
        setLoadingClicks(false);
      }
    };

    loadClicks();
  }, [selectedPage]);

  // Clamp normalized coordinates between 0% and 100%
  const getNormalizedPos = (x, y) => {
    const leftPct = Math.min(100, Math.max(0, (x / ASSUMED_VIEWPORT_WIDTH) * 100));
    const topPct = Math.min(100, Math.max(0, (y / ASSUMED_VIEWPORT_HEIGHT) * 100));
    return { leftPct, topPct };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-surface-200 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Click Heatmap</h2>
          <p className="text-sm text-surface-500 mt-1">
            Analyze click density and user focus areas across recorded pages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPages}
            disabled={loadingPages}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-100 transition-colors shadow-xs disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${loadingPages ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reload Pages
          </button>
        </div>
      </div>

      {loadingPages && <LoadingSpinner text="Loading tracked pages..." />}

      {error && <ErrorMessage message={error} onRetry={loadPages} />}

      {!loadingPages && !error && pages.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-surface-300 p-8 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-400 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-surface-900">No pages tracked yet</h3>
          <p className="mt-1 text-sm text-surface-500 max-w-sm mx-auto">
            Once users browse pages instrumented with your tracking code, they will appear here.
          </p>
        </div>
      )}

      {!loadingPages && pages.length > 0 && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <label htmlFor="page-select" className="block text-xs font-semibold uppercase tracking-wider text-surface-600 mb-1.5">
                Select Page URL
              </label>
              <select
                id="page-select"
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full bg-surface-50 border border-surface-300 text-surface-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 font-mono"
              >
                {pages.map((p, idx) => (
                  <option key={idx} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-surface-200 pt-3 md:pt-0 md:pl-6">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Total Clicks
                </span>
                <span className="text-2xl font-bold text-surface-900 font-mono">
                  {loadingClicks ? '...' : clicks.length}
                </span>
              </div>
            </div>
          </div>

          {/* Visualization Container */}
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-surface-900">
                  Viewport Visualization (1920×1080 assumed)
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Clicks are mapped to a standard 16:9 canvas using normalized client coordinates.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <span className="inline-block w-3 h-3 rounded-full bg-primary-600 opacity-60"></span>
                <span>Click Density Marker</span>
              </div>
            </div>

            {loadingClicks ? (
              <div className="aspect-video w-full max-w-5xl mx-auto rounded-lg bg-surface-100 flex items-center justify-center border border-surface-200">
                <LoadingSpinner text="Rendering click heatmap..." />
              </div>
            ) : clicks.length === 0 ? (
              <div className="aspect-video w-full max-w-5xl mx-auto rounded-lg bg-surface-100 flex flex-col items-center justify-center border border-dashed border-surface-300 text-surface-400">
                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-sm font-medium">No click coordinates recorded for this URL.</p>
              </div>
            ) : (
              <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-lg bg-surface-100 border-2 border-surface-300 shadow-inner overflow-hidden select-none">
                {/* Simulated grid background for viewport feel */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Render Clicks */}
                {clicks.map((c, idx) => {
                  const x = c.click_x ?? c.x ?? 0;
                  const y = c.click_y ?? c.y ?? 0;
                  const { leftPct, topPct } = getNormalizedPos(x, y);

                  return (
                    <div
                      key={c.id || idx}
                      title={`Click at (${x}, ${y})`}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary-600 opacity-60 hover:opacity-100 hover:scale-150 ring-2 ring-primary-300/40 transition-all cursor-pointer pointer-events-auto"
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
