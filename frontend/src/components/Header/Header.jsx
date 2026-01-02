import './Header.css';

function Header({ isConnected }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="terminal-icon">
            <span className="bracket">&gt;</span>
            <span className="underscore">_</span>
          </div>
          <h1 className="title">DevOps Monitoring Dashboard</h1>
        </div>
        
        <div className="header-right">
          <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
