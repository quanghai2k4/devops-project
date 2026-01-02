# DevOps Monitoring Backend

Backend API server for the DevOps Monitoring Dashboard. Provides real-time system metrics, Nginx log monitoring, and deployment tracking via REST API and WebSocket.

## Features

- 📊 Real-time system metrics (CPU, Memory, Disk, Network)
- 📝 Nginx access and error log monitoring
- 🚀 Deployment status tracking
- 🔌 WebSocket support for live updates
- 🔒 Security features (rate limiting, CORS, Helmet)

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **WebSocket:** Socket.io
- **System Metrics:** systeminformation
- **Security:** Helmet, express-rate-limit, CORS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Access to system metrics (Linux/macOS/Windows)
- Nginx installed (for log monitoring)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Development

```bash
# Start development server with hot reload
npm run dev

# The server will start on http://localhost:3001
```

### Production

```bash
# Start production server
npm start

# Or use PM2
pm2 start src/server.js --name devops-monitoring
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Metrics
```
GET /api/metrics/current         # Get current system metrics
GET /api/metrics/system-info     # Get static system information
```

### Logs
```
GET /api/logs/access?limit=50    # Get recent access logs
GET /api/logs/errors?limit=20    # Get recent error logs
GET /api/logs/stats              # Get log statistics
```

### Deployment
```
GET  /api/deployment/current     # Get current deployment info
GET  /api/deployment/history     # Get deployment history
GET  /api/deployment/health      # Check all services health
POST /api/deployment/update      # Update deployment info
```

## WebSocket Events

### Client → Server
- `subscribe:metrics` - Start receiving metrics updates
- `subscribe:logs` - Start receiving log updates
- `unsubscribe:metrics` - Stop metrics updates
- `unsubscribe:logs` - Stop log updates
- `unsubscribe:all` - Stop all updates

### Server → Client
- `metrics:update` - Real-time metrics data
- `log:new` - New log entry
- `deployment:update` - Deployment status change
- `error` - Error message

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin
- `METRICS_INTERVAL` - Metrics update interval in ms
- `NGINX_ACCESS_LOG` - Path to Nginx access log
- `NGINX_ERROR_LOG` - Path to Nginx error log

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Linting

```bash
# Check code style
npm run lint

# Fix issues automatically
npm run lint:fix
```

## License

MIT
