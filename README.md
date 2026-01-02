# DevOps Monitoring Dashboard 🚀

Real-time monitoring dashboard for DevOps infrastructure. Monitor server metrics, logs, and deployments with a beautiful terminal-inspired UI.

![DevOps](https://img.shields.io/badge/DevOps-Monitoring-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![AWS](https://img.shields.io/badge/AWS-EC2-orange)

## 📖 Overview

Full-stack monitoring solution với:
- **Real-time metrics** - CPU, Memory, Disk, Network
- **Log monitoring** - Nginx access và error logs
- **Deployment tracking** - Version, status, health checks
- **WebSocket updates** - Live data streaming
- **Modern UI** - Terminal/cyberpunk design với Chart.js

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│            AWS EC2                      │
│  ┌───────────────────────────────────┐ │
│  │  Nginx (Reverse Proxy)            │ │
│  │  ├─ / → Frontend (React)          │ │
│  │  └─ /api → Backend (Node.js)      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌──────────┐      ┌─────────────┐    │
│  │ Backend  │◄────►│  Monitoring │    │
│  │ Express  │      │  Services   │    │
│  │ Socket.io│      │             │    │
│  └──────────┘      └─────────────┘    │
└─────────────────────────────────────────┘
```

## 🛠 Tech Stack

### Infrastructure & DevOps
- **IaC:** Terraform
- **Configuration Management:** Ansible
- **Cloud Provider:** AWS EC2
- **Web Server:** Nginx
- **Development Environment:** Nix Flake
- **CI/CD:** GitHub Actions

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **WebSocket:** Socket.io
- **Metrics:** systeminformation
- **Security:** Helmet, CORS, Rate Limiting

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Charts:** Chart.js + react-chartjs-2
- **WebSocket Client:** socket.io-client
- **HTTP Client:** Axios

## 📁 Project Structure

```
devops/
├── backend/              # Node.js API Server
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── websocket/   # Socket.io handlers
│   │   ├── config/      # Configuration
│   │   └── server.js    # Entry point
│   └── package.json
│
├── frontend/            # React Dashboard
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API & WebSocket
│   │   └── App.jsx
│   └── package.json
│
├── terraform/           # Infrastructure as Code
│   └── main.tf
│
├── ansible/            # Configuration Management
│   ├── playbook.yml
│   └── inventory.ini
│
├── .github/
│   └── workflows/      # CI/CD pipelines
│
├── flake.nix           # Nix environment
└── IMPLEMENTATION_PLAN.md  # Detailed plan
```

## 🚀 Quick Start

### Prerequisites

- Nix package manager (with flakes enabled)
- AWS account với credentials configured
- SSH key pair cho EC2

### 1. Setup Development Environment

```bash
# Enter Nix development shell
nix develop

# Nix sẽ tự động cài:
# - Terraform
# - Ansible
# - AWS CLI
# - Node.js 20
# - npm, nodemon, git
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env

# Edit .env if needed
nano .env

# Start development server
npm run dev
```

Backend sẽ chạy tại `http://localhost:3001`

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env

# Start development server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

### 4. Test Locally

Mở browser và truy cập `http://localhost:5173` để xem dashboard.

## 🌩️ AWS Deployment

### TL;DR - Chỉ 2 lệnh!

```bash
# 1. Tạo EC2
cd terraform && terraform apply

# 2. Deploy (cập nhật IP trong inventory.ini trước)
cd ../ansible && ansible-playbook -i inventory.ini playbook.yml
```

Xong! Truy cập: `http://<YOUR_EC2_IP>`

**Chi tiết đầy đủ:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

### Step 1: Provision Infrastructure

```bash
cd terraform
terraform init
terraform apply

# Lưu lại server_ip từ output
```

### Step 2: Deploy Application

```bash
cd ansible

# Cập nhật IP trong inventory.ini
nano inventory.ini

# Chạy playbook - Ansible sẽ:
# ✅ Cài Node.js, Nginx, PM2
# ✅ Deploy backend + start with PM2
# ✅ Build frontend trên server (tự động lấy public IP)
# ✅ Configure Nginx reverse proxy
ansible-playbook -i inventory.ini playbook.yml
```

### Step 3: Access Dashboard

Mở browser: `http://<YOUR_EC2_IP>`

**Features:**
- ✅ Không cần build trên local
- ✅ Tự động lấy Public IP từ EC2 metadata
- ✅ Frontend auto-scroll TẮT mặc định
- ✅ PM2 tự động restart backend

## 📊 Features

### Real-time Metrics
- CPU usage với multi-core support
- Memory usage (used/free/total)
- Disk space monitoring
- System uptime và load average
- Network I/O statistics

### Log Monitoring
- Nginx access logs streaming
- Error log tracking
- Request statistics (status codes, paths)
- Real-time log viewer với color coding

### Deployment Info
- Current version tracking
- Deployment history
- Service health checks (Backend, Frontend, Nginx)
- Commit hash tracking

### WebSocket Features
- Live metrics updates (every 2 seconds)
- Real-time log streaming
- Deployment notifications
- Auto-reconnection

## 🔧 Development

### Backend Development

```bash
cd backend

# Run with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📖 API Documentation

Xem chi tiết tại: [backend/README.md](backend/README.md)

### Key Endpoints

```
GET  /api/health                 # Health check
GET  /api/metrics/current        # Current metrics
GET  /api/logs/access            # Access logs
GET  /api/deployment/current     # Deployment info
WS   /socket.io                  # WebSocket connection
```

## 🔐 Security

- Rate limiting trên API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation
- Environment variables cho sensitive data
- Restricted file system access

## 📝 Configuration Files

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
METRICS_INTERVAL=2000
NGINX_ACCESS_LOG=/var/log/nginx/access.log
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📚 Documentation

- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Detailed project plan
- [Backend README](backend/README.md) - Backend documentation
- [Frontend README](frontend/README.md) - Frontend documentation

## 🎯 Demo Tips

1. **Start with architecture diagram** - Show full stack
2. **Live demo:**
   - Show real-time metrics updating
   - Generate load để show CPU spike
   - Show logs streaming live
3. **Code walkthrough:**
   - Backend: metrics collector, WebSocket handler
   - Frontend: React components, Chart.js integration
   - DevOps: Terraform, Ansible, CI/CD
4. **Highlight DevOps practices:**
   - Infrastructure as Code
   - Configuration Management
   - CI/CD automation
   - Real-time monitoring

## 🤝 Contributing

Đây là project thực hành môn học. Contributions welcome!

## 📄 License

MIT

## 👨‍💻 Author

DevOps Practice Project - 2025

---

**Note:** Đọc [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) để hiểu chi tiết về architecture và implementation roadmap.
