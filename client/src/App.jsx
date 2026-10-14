import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SessionList from './components/SessionList';
import SessionDetail from './components/SessionDetail';
import HeatmapView from './components/HeatmapView';
import DemoPage from './components/DemoPage';
import DemoProductsPage from './components/DemoProductsPage';
import DemoFeaturesPage from './components/DemoFeaturesPage';

const DEMO_ROUTES = {
  '/demo': DemoPage,
  '/demo/products': DemoProductsPage,
  '/demo/features': DemoFeaturesPage,
};

export default function App() {
  const [activeView, setActiveView] = useState('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const demoPath = window.location.pathname.replace(/\/$/, '') || '/';
  const DemoComponent = DEMO_ROUTES[demoPath];

  if (DemoComponent) {
    return <DemoComponent />;
  }

  const handleViewChange = (view) => {
    setActiveView(view);
    // Reset session drilldown when navigating views
    setSelectedSessionId(null);
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
  };

  const handleBackToSessions = () => {
    setSelectedSessionId(null);
  };

  return (
    <div className="flex min-h-screen bg-surface-50 font-sans antialiased text-surface-900">
      {/* Sidebar navigation */}
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeView === 'sessions' && (
            <>
              {selectedSessionId ? (
                <SessionDetail
                  sessionId={selectedSessionId}
                  onBack={handleBackToSessions}
                />
              ) : (
                <SessionList onSelectSession={handleSelectSession} />
              )}
            </>
          )}

          {activeView === 'heatmap' && <HeatmapView />}
        </div>
      </main>
    </div>
  );
}
