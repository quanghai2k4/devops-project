# DevOps Monitoring Dashboard

Real-time monitoring dashboard for DevOps infrastructure with live metrics, log streaming, and service health monitoring.

## Features

- **Real-time Metrics** - CPU, Memory, Disk, Network monitoring with live charts
- **Live Log Streaming** - Nginx access & error logs with WebSocket
- **Service Health Checks** - Backend, Frontend, Nginx status monitoring
- **Modern UI** - Terminal/cyberpunk theme with JetBrains Mono font
- **Auto-refresh** - Updates every 2 seconds via WebSocket

## Tech Stack

**Backend:** Node.js, Express, Socket.io, systeminformation  
**Frontend:** React 18, Vite, Chart.js, socket.io-client  
**Infrastructure:** Terraform (AWS EC2), Ansible, Nginx  
**DevOps:** GitHub Actions, PM2

## Quick Deployment

### Prerequisites

- AWS account with credentials configured
- Terraform installed
- Ansible installed
- SSH key pair created on AWS (`devops-key-pair`)

### Steps

```bash
# 1. Create EC2 instance
cd terraform
terraform init
terraform apply

# 2. Deploy application (update inventory.ini with EC2 IP from terraform output)
cd ../ansible
ansible-playbook -i inventory.ini playbook.yml
```

Access dashboard at `http://[EC2_PUBLIC_IP]`

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev  # http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev  # http://localhost:5173
```
