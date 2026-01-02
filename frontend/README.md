# DevOps Monitoring Frontend

Modern React dashboard for monitoring DevOps infrastructure in real-time. Features beautiful terminal-style UI with live charts and WebSocket updates.

## Features

- 📊 Real-time metrics visualization with Chart.js
- 📈 Live updating line charts for CPU and Memory
- 📝 Streaming Nginx logs viewer
- 🚀 Deployment status and health monitoring
- 🔌 WebSocket connection for instant updates
- 🎨 Terminal/cyberpunk inspired dark theme
- 📱 Responsive design

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Charts:** Chart.js + react-chartjs-2
- **WebSocket:** socket.io-client
- **HTTP Client:** Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173
```

The dev server has proxy configured to forward `/api` and `/socket.io` requests to the backend.

### Build for Production

```bash
# Build static files
npm run build

# Output will be in dist/ directory

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Header/         # Top navigation bar
│   ├── MetricsCards/   # Metric cards (CPU, RAM, etc)
│   ├── MetricsChart/   # Line chart for metrics history
│   ├── LogViewer/      # Nginx logs viewer
│   └── DeploymentInfo/ # Deployment status
├── services/           # API and WebSocket services
│   ├── api.js         # REST API client
│   └── websocket.js   # WebSocket client
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

For production, update these to your server's URL.

## Deployment

### Static Hosting (Nginx)

After building, copy `dist/` contents to your web server:

```bash
npm run build
scp -r dist/* user@server:/var/www/html/
```

### Nginx Configuration

```nginx
server {
    listen 80;
    
    # Serve React app
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Proxy WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Linting

```bash
npm run lint
```

## License

MIT
