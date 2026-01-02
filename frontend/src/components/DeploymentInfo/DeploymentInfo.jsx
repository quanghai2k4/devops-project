import { useState, useEffect } from 'react';
import { deploymentAPI } from '../../services/api';
import wsService from '../../services/websocket';
import './DeploymentInfo.css';

function DeploymentInfo() {
  const [deployment, setDeployment] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeploymentInfo();
    fetchHealth();

    // Subscribe to deployment updates
    wsService.subscribeToDeployment((data) => {
      setDeployment(data);
    });

    // Refresh health every 30 seconds
    const healthInterval = setInterval(fetchHealth, 30000);

    return () => {
      wsService.unsubscribeFromDeployment();
      clearInterval(healthInterval);
    };
  }, []);

  const fetchDeploymentInfo = async () => {
    try {
      setLoading(true);
      const response = await deploymentAPI.getCurrent();
      setDeployment(response.data);
    } catch (error) {
      console.error('Error fetching deployment info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await deploymentAPI.getHealth();
      setHealth(response.data);
    } catch (error) {
      console.error('Error fetching health:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="deployment-info">
        <div className="deployment-header">
          <h2 className="deployment-title">
            <span className="icon">🚀</span>
            Deployment Info
          </h2>
        </div>
        <div className="deployment-content">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="deployment-info">
      <div className="deployment-header">
        <h2 className="deployment-title">
          <span className="icon">🚀</span>
          Deployment Info
        </h2>
        <button 
          className="refresh-btn"
          onClick={() => {
            fetchDeploymentInfo();
            fetchHealth();
          }}
          title="Refresh"
        >
          ↻
        </button>
      </div>

      <div className="deployment-content">
        <div className="info-section">
          <div className="info-row">
            <span className="info-label">Version:</span>
            <span className="info-value version">{deployment?.version || 'Unknown'}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Deployed:</span>
            <span className="info-value">{formatDate(deployment?.deployedAt)}</span>
          </div>
          
          {deployment?.commitHash && (
            <div className="info-row">
              <span className="info-label">Commit:</span>
              <span className="info-value commit">{deployment.commitHash.substring(0, 7)}</span>
            </div>
          )}
          
          {deployment?.deployedBy && (
            <div className="info-row">
              <span className="info-label">By:</span>
              <span className="info-value">{deployment.deployedBy}</span>
            </div>
          )}
        </div>

        {health && (
          <div className="health-section">
            <h3 className="section-title">Service Status</h3>
            
            <div className="service-status">
              <ServiceStatus 
                name="Backend" 
                status={health.backend?.status}
                details={`Port ${health.backend?.port} • Uptime: ${formatUptime(health.backend?.uptime)}`}
              />
              <ServiceStatus 
                name="Frontend" 
                status={health.frontend?.status}
              />
              <ServiceStatus 
                name="Nginx" 
                status={health.nginx?.status}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceStatus({ name, status, details }) {
  const getStatusColor = (status) => {
    if (status === 'running' || status === 'active') return 'success';
    if (status === 'unknown') return 'warning';
    return 'error';
  };

  const statusColor = getStatusColor(status);

  return (
    <div className="service-item">
      <div className="service-header">
        <span className="service-name">{name}</span>
        <span className={`service-badge ${statusColor}`}>
          <span className="badge-dot"></span>
          {status || 'unknown'}
        </span>
      </div>
      {details && <div className="service-details">{details}</div>}
    </div>
  );
}

export default DeploymentInfo;
