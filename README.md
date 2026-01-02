# DevOps Monitoring Dashboard 🚀

Real-time monitoring dashboard for DevOps infrastructure. Monitor server metrics, logs, and deployments with a beautiful terminal-inspired UI.

![DevOps](https://img.shields.io/badge/DevOps-Monitoring-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18-blue)
![AWS](https://img.shields.io/badge/AWS-EC2-orange)

## ✨ Features

- 📊 **Real-time Metrics** - CPU, Memory, Disk, Network monitoring
- 📝 **Live Log Streaming** - Nginx access & error logs
- 🚀 **Deployment Tracking** - Version, status, health checks
- ⚡ **WebSocket Updates** - Live data streaming every 2 seconds
- 🎨 **Modern UI** - Terminal/cyberpunk theme with JetBrains Mono font

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

**Backend:** Node.js, Express, Socket.io, systeminformation  
**Frontend:** React 18, Vite, Chart.js, socket.io-client  
**Infrastructure:** Terraform (AWS EC2), Ansible, Nginx  
**DevOps:** GitHub Actions, PM2, Nix

## 📦 Project Structure

```
devops/
├── backend/              # Node.js API Server
├── frontend/             # React Dashboard
├── terraform/            # AWS Infrastructure
├── ansible/              # Deployment Automation
├── .github/workflows/    # CI/CD Pipelines
└── scripts/              # Helper Scripts
```

## 🚀 Quick Deployment

### Prerequisites

- AWS account with credentials configured
- Terraform installed
- Ansible installed
- SSH key pair created on AWS (`devops-key-pair`)

### Deploy in 2 Steps

```bash
# 1. Create EC2 instance with Terraform
cd terraform
terraform init
terraform apply

# 2. Deploy application with Ansible
cd ../ansible
# Update inventory.ini with EC2 public IP from terraform output
ansible-playbook -i inventory.ini playbook.yml
```

**That's it!** Access dashboard at `http://[EC2_PUBLIC_IP]`

> 📚 **Detailed Guide:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions

## 🖥️ Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
# Server runs at http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Dashboard runs at http://localhost:5173
```

## 📊 API Endpoints

- `GET /api/health` - Health check
- `GET /api/metrics/current` - Current system metrics
- `GET /api/logs/access` - Nginx access logs
- `GET /api/deployment/current` - Deployment info
- `GET /api/deployment/health` - Service health status
- `WS /socket.io` - WebSocket for real-time updates

## 🎨 Screenshots

**Dashboard Overview**
- Real-time metrics cards (CPU, Memory, Disk, Uptime)
- Historical metrics chart (2-minute history)
- Live log viewer with auto-scroll toggle
- Service status monitoring

## 🔧 Configuration

### Backend Environment Variables

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=*
METRICS_INTERVAL=2000
LOG_LEVEL=info
NGINX_ACCESS_LOG=/var/log/nginx/access.log
NGINX_ERROR_LOG=/var/log/nginx/error.log
```

### Frontend Environment Variables

```env
VITE_API_URL=http://your-server-ip
VITE_WS_URL=http://your-server-ip
```

## 📝 Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md) - Deployment verification guide
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Architecture & design details
- [backend/README.md](./backend/README.md) - Backend API documentation
- [frontend/README.md](./frontend/README.md) - Frontend development guide

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Quang Hai**  
GitHub: [@quanghai2k4](https://github.com/quanghai2k4)

## 🙏 Acknowledgments

- [systeminformation](https://github.com/sebhildebrandt/systeminformation) - System metrics library
- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [Socket.io](https://socket.io/) - Real-time communication
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) - Developer font

---

⭐ **Star this repo if you find it helpful!**
