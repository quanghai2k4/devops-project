# DevOps Monitoring Dashboard - Implementation Plan

## 🎯 Project Overview

Transform the current static DevOps deployment project into a **real-time monitoring dashboard** with:
- Live server metrics (CPU, RAM, Disk)
- Real-time Nginx access logs
- Deployment status tracking
- WebSocket-based updates
- Modern React UI with charts
- CI/CD automation with GitHub Actions

---

## 🏗️ Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS EC2                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Nginx (Reverse Proxy)                                 │ │
│  │  ├─ / → Frontend (React SPA)                          │ │
│  │  └─ /api → Backend (Node.js)                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────┐      ┌──────────────────────────┐  │
│  │  Backend Service   │      │   Monitoring Services    │  │
│  │                    │      │                          │  │
│  │  • Express API     │◄────►│  • Metrics Collector     │  │
│  │  • Socket.io       │      │  • Log Watcher           │  │
│  │  • REST Endpoints  │      │  • System Info           │  │
│  │  • Port: 3001      │      │                          │  │
│  └────────────────────┘      └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/WebSocket
                          │
                    ┌─────▼─────┐
                    │  Browser  │
                    │  (React)  │
                    └───────────┘
```

### Project Structure

```
devops/
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard/
│   │   │   ├── MetricsCard/
│   │   │   ├── Charts/
│   │   │   └── LogViewer/
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API & WebSocket services
│   │   ├── utils/            # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/                   # Node.js API
│   ├── src/
│   │   ├── routes/           # Express routes
│   │   │   ├── metrics.js
│   │   │   ├── logs.js
│   │   │   └── deployment.js
│   │   ├── services/         # Business logic
│   │   │   ├── metricsCollector.js
│   │   │   ├── logWatcher.js
│   │   │   └── systemInfo.js
│   │   ├── websocket/        # Socket.io handlers
│   │   │   └── socketHandler.js
│   │   ├── middleware/       # Express middleware
│   │   ├── config/           # Configuration
│   │   ├── utils/            # Utilities
│   │   └── server.js         # Entry point
│   ├── package.json
│   ├── .env.example
│   └── ecosystem.config.js   # PM2 config
│
├── terraform/                 # Infrastructure as Code
│   ├── main.tf               # Updated with backend port
│   └── variables.tf          # (new)
│
├── ansible/                   # Configuration Management
│   ├── playbook.yml          # Updated for full stack
│   ├── inventory.ini
│   └── roles/                # (new) Ansible roles
│       ├── nginx/
│       ├── nodejs/
│       └── monitoring/
│
├── .github/
│   └── workflows/            # CI/CD
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── deploy.yml
│
├── scripts/                  # Deployment scripts
│   ├── deploy.sh
│   ├── build-all.sh
│   └── setup-env.sh
│
├── docs/                     # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
│
└── README.md                 # Updated with new features
```

---

## 🔧 Tech Stack Detail

### Backend
- **Runtime:** Node.js 18+ (LTS)
- **Framework:** Express.js 4.x
- **WebSocket:** Socket.io 4.x
- **System Metrics:** systeminformation npm package
- **Process Manager:** PM2 (for production)
- **Testing:** Jest + Supertest
- **Linting:** ESLint + Prettier

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5.x
- **Charts:** Chart.js 4.x + react-chartjs-2
- **WebSocket Client:** socket.io-client
- **HTTP Client:** Axios
- **Styling:** CSS Modules / Tailwind CSS (optional)
- **State Management:** React Context API (simple state)
- **Testing:** Vitest + React Testing Library

### Infrastructure
- **IaC:** Terraform 1.x
- **CM:** Ansible 2.x
- **Web Server:** Nginx 1.x (reverse proxy)
- **Cloud:** AWS EC2 (t3.micro)
- **CI/CD:** GitHub Actions

---

## 📊 Features Breakdown

### 1. Server Metrics Monitoring (Priority: HIGH)

**Metrics to Display:**
- CPU Usage (%) - live graph
- Memory Usage (%) - live graph
- Disk Usage (GB/%) - gauge chart
- Uptime - counter
- Network I/O - line chart
- Process count - badge
- Load Average - indicator

**API Endpoints:**
```
GET  /api/metrics/current        # Current snapshot
GET  /api/metrics/system-info    # Static system info
WS   /socket.io                  # Real-time updates
```

**Implementation:**
- Use `systeminformation` package for metrics
- Emit updates every 2 seconds via WebSocket
- Store last 100 data points for historical graphs (in-memory)

---

### 2. Nginx Log Monitoring (Priority: HIGH)

**Features:**
- Real-time access log viewer
- Error log monitoring
- Request statistics (total requests, status codes)
- Recent requests table (last 50)
- Filter by status code

**API Endpoints:**
```
GET  /api/logs/access?limit=50   # Recent access logs
GET  /api/logs/errors?limit=20   # Recent error logs
GET  /api/logs/stats             # Request statistics
WS   /socket.io (event: log)     # Real-time log stream
```

**Implementation:**
- Use `fs.watch()` to monitor Nginx log files
- Parse logs with regex (Nginx default format)
- Stream new entries via WebSocket
- Permission: Ensure Node.js can read `/var/log/nginx/`

---

### 3. Deployment Status (Priority: HIGH)

**Features:**
- Current deployment info (version, timestamp)
- Deployment history (last 10 deployments)
- Service status (Backend, Frontend, Nginx)
- Quick health check

**API Endpoints:**
```
GET  /api/deployment/current     # Current deployment info
GET  /api/deployment/history     # Deployment history
GET  /api/deployment/health      # Health check all services
POST /api/deployment/trigger     # (Optional) Trigger redeploy
```

**Implementation:**
- Store deployment info in JSON file on server
- Update during Ansible deployment
- Health check: ping endpoints + process status

---

### 4. Real-time Updates (Priority: HIGH)

**WebSocket Events:**
```javascript
// Server → Client
socket.emit('metrics:update', data)
socket.emit('log:new', logEntry)
socket.emit('deployment:status', status)
socket.emit('alert', { type, message })

// Client → Server
socket.emit('subscribe:metrics')
socket.emit('subscribe:logs')
socket.emit('unsubscribe:all')
```

---

## 🎨 Frontend UI Design

### Dashboard Layout

```
┌────────────────────────────────────────────────────────┐
│  HEADER                                     [ONLINE ●] │
│  DevOps Monitoring Dashboard                           │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ CPU 45%  │  │ RAM 68%  │  │ DISK 52% │            │
│  │ [chart]  │  │ [chart]  │  │ [gauge]  │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  CPU & Memory History (Last 5 min)            │   │
│  │  [Line Chart - Real-time updating]            │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │  Nginx Access Logs   │  │  Deployment Info     │  │
│  │  [Live log stream]   │  │  Version: v1.2.3     │  │
│  │                      │  │  Status: ✓ Healthy   │  │
│  └──────────────────────┘  └──────────────────────┘  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

**Design Style:**
- Keep the current terminal/cyberpunk aesthetic
- Dark theme with green/blue accents
- Monospace font for logs
- Smooth animations for charts
- Responsive layout (desktop first, mobile compatible)

---

## 🚀 Implementation Roadmap

### Phase 1: Backend Foundation (Week 1)
- [x] Setup backend project structure
- [ ] Install dependencies (Express, Socket.io, systeminformation)
- [ ] Create basic Express server
- [ ] Implement metrics collection service
- [ ] Create REST API endpoints for metrics
- [ ] Setup Socket.io for real-time updates
- [ ] Test API endpoints with Postman/curl

**Deliverable:** Working API that returns system metrics

---

### Phase 2: Frontend Foundation (Week 1-2)
- [ ] Setup React project with Vite
- [ ] Install dependencies (Chart.js, Socket.io-client, Axios)
- [ ] Create component structure
- [ ] Build MetricsCard component
- [ ] Implement real-time chart component
- [ ] Connect to backend API
- [ ] Implement WebSocket connection

**Deliverable:** React dashboard showing live metrics

---

### Phase 3: Log Monitoring (Week 2)
- [ ] Implement log file watcher in backend
- [ ] Create log parsing utility
- [ ] Build log viewer API endpoints
- [ ] Stream logs via WebSocket
- [ ] Create LogViewer component in React
- [ ] Add log filtering/search

**Deliverable:** Real-time log monitoring feature

---

### Phase 4: Deployment Status (Week 2-3)
- [ ] Create deployment tracking system
- [ ] Implement health check endpoints
- [ ] Build deployment info API
- [ ] Create DeploymentStatus component
- [ ] Add deployment history view

**Deliverable:** Deployment monitoring feature

---

### Phase 5: Infrastructure Update (Week 3)
- [ ] Update Terraform configuration
  - Add port 3001 for backend API
  - Update security groups
- [ ] Update Ansible playbook
  - Install Node.js
  - Deploy backend service
  - Setup PM2 for backend
  - Configure Nginx reverse proxy
  - Build and deploy frontend
- [ ] Update Nginx configuration
  - Serve React app on /
  - Proxy /api to backend
  - Proxy /socket.io to backend

**Deliverable:** Full stack deployment on AWS

---

### Phase 6: CI/CD Pipeline (Week 3-4)
- [ ] Create GitHub Actions workflows
  - Backend CI: lint, test, build
  - Frontend CI: lint, test, build
  - Deployment workflow
- [ ] Setup environment secrets in GitHub
- [ ] Implement automated deployment
- [ ] Add deployment notifications

**Deliverable:** Automated CI/CD pipeline

---

### Phase 7: Polish & Testing (Week 4)
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Add reconnection logic for WebSocket
- [ ] Write unit tests (backend)
- [ ] Write component tests (frontend)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Mobile responsive fixes

**Deliverable:** Production-ready application

---

### Phase 8: Documentation (Week 4)
- [ ] Update main README.md
- [ ] Write API documentation
- [ ] Create deployment guide
- [ ] Write development setup guide
- [ ] Add code comments
- [ ] Create demo video/screenshots

**Deliverable:** Complete documentation

---

## 📝 Key API Specifications

### Metrics API

```javascript
// GET /api/metrics/current
{
  "timestamp": "2025-01-02T10:30:00Z",
  "cpu": {
    "usage": 45.2,          // percentage
    "cores": 2,
    "speed": 2400           // MHz
  },
  "memory": {
    "total": 1073741824,    // bytes
    "used": 730472448,
    "free": 343269376,
    "usagePercent": 68.0
  },
  "disk": {
    "total": 10737418240,
    "used": 5579776000,
    "free": 5157642240,
    "usagePercent": 51.9
  },
  "uptime": 3600,           // seconds
  "loadAverage": [1.5, 1.3, 1.1]
}
```

### Logs API

```javascript
// GET /api/logs/access?limit=10
{
  "logs": [
    {
      "timestamp": "2025-01-02T10:30:15Z",
      "ip": "192.168.1.1",
      "method": "GET",
      "path": "/api/metrics",
      "status": 200,
      "size": 1024,
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "total": 150
}
```

### Deployment API

```javascript
// GET /api/deployment/current
{
  "version": "v1.2.3",
  "deployedAt": "2025-01-02T09:00:00Z",
  "commitHash": "b7687f6",
  "deployedBy": "github-actions",
  "services": {
    "backend": { "status": "running", "port": 3001, "uptime": 3600 },
    "frontend": { "status": "active" },
    "nginx": { "status": "active" }
  }
}
```

---

## 🔒 Security Considerations

1. **API Security:**
   - Add rate limiting (express-rate-limit)
   - CORS configuration
   - Input validation (joi/express-validator)
   - Helmet.js for security headers

2. **File System Access:**
   - Backend runs with limited permissions
   - Only read access to log files
   - No write access to system files

3. **Environment Variables:**
   - Never commit .env files
   - Use GitHub Secrets for CI/CD
   - Separate dev/prod configs

4. **WebSocket:**
   - Implement connection authentication (optional)
   - Rate limit socket events
   - Validate incoming data

---

## 🧪 Testing Strategy

### Backend Testing
```javascript
// Example: metrics.test.js
describe('Metrics API', () => {
  test('GET /api/metrics/current returns valid data', async () => {
    const res = await request(app).get('/api/metrics/current');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cpu');
    expect(res.body).toHaveProperty('memory');
  });
});
```

### Frontend Testing
```javascript
// Example: MetricsCard.test.jsx
describe('MetricsCard', () => {
  test('renders CPU percentage', () => {
    render(<MetricsCard type="cpu" value={45} />);
    expect(screen.getByText(/45%/)).toBeInTheDocument();
  });
});
```

---

## 📦 Deployment Process

### Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev     # nodemon on port 3001

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev     # Vite on port 5173
```

### Production (AWS EC2)
```bash
# 1. Infrastructure
cd terraform
terraform init
terraform apply

# 2. Configuration & Deployment
cd ../ansible
ansible-playbook -i inventory.ini playbook.yml

# 3. Verify
curl http://<EC2_IP>              # Frontend
curl http://<EC2_IP>/api/health   # Backend API
```

---

## 🎓 Demo Presentation Tips

1. **Start with Architecture Diagram** - Show the full stack
2. **Live Demo:**
   - Show real-time metrics updating
   - Trigger some load (stress test) to show CPU spike
   - Show logs streaming live
   - Refresh page to show data persistence
3. **Code Walkthrough:**
   - Backend: Show metrics collector service
   - Frontend: Show WebSocket integration
   - DevOps: Show Ansible playbook, CI/CD pipeline
4. **Highlight DevOps Practices:**
   - Infrastructure as Code (Terraform)
   - Configuration Management (Ansible)
   - CI/CD automation (GitHub Actions)
   - Monitoring & Observability
   - Reproducible environments (Nix)

---

## 🐛 Troubleshooting Guide

### Common Issues

1. **WebSocket connection fails:**
   - Check Nginx WebSocket proxy config
   - Verify port 3001 is open in security group
   - Check CORS settings

2. **Metrics not updating:**
   - Verify backend service is running (pm2 status)
   - Check backend logs (pm2 logs)
   - Test API endpoint directly

3. **Frontend not loading:**
   - Check Nginx is serving correct directory
   - Verify build was successful
   - Check browser console for errors

---

## 📚 Learning Outcomes

By completing this project, you will learn:

- ✅ Full-stack JavaScript development (Node.js + React)
- ✅ Real-time communication with WebSocket
- ✅ System monitoring and metrics collection
- ✅ RESTful API design
- ✅ Modern frontend development with React hooks
- ✅ Infrastructure automation with Terraform
- ✅ Configuration management with Ansible
- ✅ CI/CD pipeline implementation
- ✅ Nginx reverse proxy configuration
- ✅ Production deployment best practices
- ✅ Testing strategies (unit + integration)
- ✅ Git workflow and version control

---

## 🎯 Success Criteria

The project is complete when:

- [x] Backend API returns accurate system metrics
- [ ] Frontend displays metrics with live charts
- [ ] WebSocket updates work without page refresh
- [ ] Nginx logs are streamed in real-time
- [ ] Deployment info is tracked and displayed
- [ ] Full stack deploys successfully to AWS EC2
- [ ] CI/CD pipeline runs on push to main
- [ ] Application is accessible via public IP
- [ ] Documentation is complete
- [ ] Code is well-tested and linted

---

## 📞 Next Steps

Ready to start implementation? Let's begin with:

1. **Setup Backend** - Create the Node.js project structure
2. **Setup Frontend** - Initialize React with Vite
3. **Implement Core Feature** - Get metrics working end-to-end
4. **Iterate** - Add features incrementally

Let's build this! 🚀
