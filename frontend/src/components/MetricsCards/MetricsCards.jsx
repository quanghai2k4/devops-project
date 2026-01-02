import './MetricsCards.css';

function MetricsCards({ metrics }) {
  if (!metrics) {
    return (
      <div className="metrics-cards">
        <MetricCard title="CPU" value="--" unit="%" loading />
        <MetricCard title="Memory" value="--" unit="%" loading />
        <MetricCard title="Disk" value="--" unit="%" loading />
        <MetricCard title="Uptime" value="--" unit="" loading />
      </div>
    );
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="metrics-cards">
      <MetricCard 
        title="CPU" 
        value={metrics.cpu.usage.toFixed(1)} 
        unit="%" 
        color="blue"
        subtitle={`${metrics.cpu.cores} cores @ ${metrics.cpu.speed} MHz`}
      />
      <MetricCard 
        title="Memory" 
        value={metrics.memory.usagePercent.toFixed(1)} 
        unit="%" 
        color="green"
        subtitle={`${(metrics.memory.used / 1024 / 1024 / 1024).toFixed(1)} GB / ${(metrics.memory.total / 1024 / 1024 / 1024).toFixed(1)} GB`}
      />
      <MetricCard 
        title="Disk" 
        value={metrics.disk.usagePercent.toFixed(1)} 
        unit="%" 
        color="yellow"
        subtitle={`${(metrics.disk.free / 1024 / 1024 / 1024).toFixed(1)} GB free`}
      />
      <MetricCard 
        title="Uptime" 
        value={formatUptime(metrics.uptime)} 
        unit="" 
        color="purple"
        subtitle={`Load: ${metrics.loadAverage[0]}`}
      />
    </div>
  );
}

function MetricCard({ title, value, unit, color = 'blue', subtitle, loading = false }) {
  return (
    <div className={`metric-card ${color} ${loading ? 'loading' : ''}`}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <span className="metric-icon">●</span>
      </div>
      <div className="metric-value">
        <span className="value">{value}</span>
        <span className="unit">{unit}</span>
      </div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );
}

export default MetricsCards;
