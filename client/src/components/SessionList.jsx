import React, { useState, useEffect } from 'react';
import { fetchSessions } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function SessionList({ onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSessions();
      setSessions(Array.isArray(data) ? data : (data.sessions || []));
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toLocaleString();
    } catch {
      return isoString;
    }
  };

  const truncateId = (id) => {
    if (!id) return '';
    return id.length > 8 ? `${id.slice(0, 8)}...` : id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-surface-200">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Active & Past Sessions</h2>
          <p className="text-sm text-surface-500 mt-1">
            Browse tracked visitor sessions and telemetry history
          </p>
        </div>
        <button
          onClick={loadSessions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-100 hover:text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-xs disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {loading && <LoadingSpinner text="Fetching visitor sessions..." />}

      {error && !loading && <ErrorMessage message={error} onRetry={loadSessions} />}

      {!loading && !error && sessions.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-surface-300 p-8 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-400 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-surface-900">No sessions recorded yet</h3>
          <p className="mt-1 text-sm text-surface-500 max-w-sm mx-auto">
            Install the tracker script on your site to begin capturing user sessions and interactions.
          </p>
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 text-left text-sm">
              <thead className="bg-surface-50 text-surface-700 uppercase font-semibold text-xs tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Session ID</th>
                  <th scope="col" className="px-6 py-3.5">Events</th>
                  <th scope="col" className="px-6 py-3.5">First Seen</th>
                  <th scope="col" className="px-6 py-3.5">Last Seen</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 bg-white">
                {sessions.map((session, idx) => {
                  const sId = session.session_id || session.sessionId || session.id;
                  const eventCount = session.total_events ?? session.event_count ?? session.events ?? 0;
                  const firstSeen = session.first_seen || session.firstSeen;
                  const lastSeen = session.last_seen || session.lastSeen;

                  return (
                    <tr
                      key={sId || idx}
                      onClick={() => onSelectSession(sId)}
                      className="hover:bg-primary-50/40 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-surface-900 whitespace-nowrap">
                        <span className="bg-surface-100 group-hover:bg-primary-100/60 px-2.5 py-1 rounded-md text-surface-700 group-hover:text-primary-700 transition-colors">
                          {truncateId(sId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-100 text-surface-700">
                          {eventCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-surface-600 whitespace-nowrap">
                        {formatDate(firstSeen)}
                      </td>
                      <td className="px-6 py-4 text-surface-600 whitespace-nowrap">
                        {formatDate(lastSeen)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                        <span className="text-primary-600 group-hover:text-primary-800 inline-flex items-center gap-1">
                          View details
                          <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
