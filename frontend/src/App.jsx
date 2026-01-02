import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import MetricsCards from './components/MetricsCards/MetricsCards';
import MetricsChart from './components/MetricsChart/MetricsChart';
import LogViewer from './components/LogViewer/LogViewer';
import DeploymentInfo from './components/DeploymentInfo/DeploymentInfo';
import wsService from './services/websocket';

function App() {
  const [metrics, setMetrics] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const socket = wsService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Subscribe to metrics
    wsService.subscribeToMetrics((data) => {
      setMetrics(data);
      
      // Add to history (keep last 60 points = 2 minutes at 2s intervals)
      setMetricsHistory(prev => {
        const newHistory = [...prev, data];
        return newHistory.slice(-60);
      });
    });

    // Cleanup on unmount
    return () => {
      wsService.unsubscribeAll();
      wsService.disconnect();
    };
  }, []);

  return (
    <div className="app">
      <Header isConnected={isConnected} />
      
      <main className="main-content">
        <div className="container">
          {/* Metrics Cards */}
          <MetricsCards metrics={metrics} />

          {/* Metrics History Chart */}
          <MetricsChart metricsHistory={metricsHistory} />

          {/* Bottom Row: Logs and Deployment Info */}
          <div className="bottom-row">
            <LogViewer />
            <DeploymentInfo />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
