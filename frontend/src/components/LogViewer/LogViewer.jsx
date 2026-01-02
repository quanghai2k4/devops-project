import { useState, useEffect, useRef } from 'react';
import { logsAPI } from '../../services/api';
import wsService from '../../services/websocket';
import './LogViewer.css';

function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const logsEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Fetch initial logs
    fetchLogs();

    // Subscribe to real-time logs
    wsService.subscribeToLogs((newLog) => {
      setLogs(prev => {
        const updated = [...prev, newLog];
        return updated.slice(-50); // Keep last 50 logs
      });
    });

    return () => {
      wsService.unsubscribeFromLogs();
    };
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logsAPI.getAccess(50);
      if (response.data.logs) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'info';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="log-viewer">
      <div className="log-header">
        <h2 className="log-title">
          <span className="icon">📝</span>
          Nginx Access Logs
        </h2>
        <div className="log-controls">
          <button 
            className={`auto-scroll-btn ${autoScroll ? 'active' : ''}`}
            onClick={() => setAutoScroll(!autoScroll)}
            title="Auto-scroll"
          >
            {autoScroll ? '🔄' : '⏸'}
          </button>
          <button 
            className="refresh-btn"
            onClick={fetchLogs}
            title="Refresh logs"
          >
            ↻
          </button>
        </div>
      </div>

      <div 
        className="log-content" 
        ref={containerRef}
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="log-placeholder">
            <div className="loading-spinner"></div>
            <p>Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="log-placeholder">
            <p>No logs available</p>
          </div>
        ) : (
          <>
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">{log.timestamp}</span>
                <span className={`log-status ${getStatusColor(log.status)}`}>
                  {log.status}
                </span>
                <span className="log-method">{log.method}</span>
                <span className="log-path">{log.path}</span>
                <span className="log-ip">{log.ip}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        )}
      </div>
    </div>
  );
}

export default LogViewer;
