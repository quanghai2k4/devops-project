# 🚀 Hướng dẫn Deploy - DevOps Monitoring Dashboard

Chỉ cần 2 lệnh: **Terraform** + **Ansible**

---

## 📋 Yêu cầu

- Terraform đã cài đặt
- Ansible đã cài đặt
- AWS CLI đã cấu hình (credentials)
- SSH key pair `devops-key-pair` đã tạo trên AWS

---

## 🎯 Deployment Steps

### Bước 1: Tạo EC2 Instance với Terraform

```bash
cd terraform
terraform init
terraform apply
```

**Output sẽ hiển thị:**
- `server_ip` = Public IP của EC2
- `ssh_connection` = Lệnh SSH
- `dashboard_url` = URL dashboard

**Ví dụ output:**
```
Outputs:

dashboard_url = "http://18.143.163.127"
server_ip = "18.143.163.127"
server_public_dns = "ec2-18-143-163-127.ap-southeast-1.compute.amazonaws.com"
ssh_connection = "ssh -i devops-key-pair.pem ubuntu@18.143.163.127"
```

### Bước 2: Cập nhật Ansible Inventory

Mở file `ansible/inventory.ini` và thay IP:

```ini
[webservers]
18.143.163.127 ansible_user=ubuntu ansible_ssh_private_key_file=devops-key-pair.pem
```

**Thay `18.143.163.127` bằng IP từ terraform output.**

### Bước 3: Deploy với Ansible

```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

**Ansible sẽ tự động:**
1. ✅ Cài đặt Node.js 20, Nginx, PM2
2. ✅ Copy backend source code lên server
3. ✅ Cài dependencies và start backend với PM2
4. ✅ Copy frontend source code lên server
5. ✅ **Lấy Public IP từ EC2 metadata** (IMDSv2)
6. ✅ **Build frontend trực tiếp trên server** với đúng Public IP
7. ✅ Deploy frontend vào `/var/www/html/`
8. ✅ Cấu hình Nginx reverse proxy
9. ✅ Reload Nginx

**Output cuối cùng:**
```
TASK [Display deployment info] ***
ok: [18.143.163.127] => {
    "msg": [
        "==========================================",
        "✅ Deployment Complete!",
        "==========================================",
        "Dashboard URL: http://18.143.163.127",
        "Backend API: http://18.143.163.127/api",
        "Backend Status: pm2 status",
        "Backend Logs: pm2 logs devops-monitoring-backend",
        "=========================================="
    ]
}
```

---

## 🎉 Hoàn tất!

Truy cập dashboard tại: **http://[YOUR_SERVER_IP]**

Ví dụ: http://18.143.163.127

---

## 🔄 Update Code (Chỉ chạy Ansible)

Khi bạn có thay đổi code và muốn deploy lại:

```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

Ansible sẽ:
- Sync code mới
- Rebuild frontend trên server
- Restart backend với PM2
- Reload Nginx

**KHÔNG CẦN chạy terraform lại!**

---

## 🧪 Kiểm tra Services

### Test API
```bash
curl http://[YOUR_IP]/api/health
curl http://[YOUR_IP]/api/metrics/current
```

### SSH vào server
```bash
ssh -i ansible/devops-key-pair.pem ubuntu@[YOUR_IP]

# Kiểm tra backend
sudo pm2 status
sudo pm2 logs devops-monitoring-backend

# Kiểm tra Nginx
sudo systemctl status nginx
sudo nginx -t
```

---

## 🔧 Troubleshooting

### Lỗi: "Permission denied (publickey)"
```bash
# Kiểm tra key pair
ls -la ansible/devops-key-pair.pem
chmod 400 ansible/devops-key-pair.pem
```

### Lỗi: "Failed to connect to the host"
```bash
# Kiểm tra security group có mở port 22
# Kiểm tra IP trong inventory.ini đúng chưa
```

### Lỗi: "401 Unauthorized" khi lấy metadata
- Đã sửa! Playbook giờ dùng IMDSv2 với token

### Frontend hiển thị "OFFLINE"
```bash
# SSH vào server
ssh -i ansible/devops-key-pair.pem ubuntu@[YOUR_IP]

# Kiểm tra backend có chạy không
sudo pm2 status

# Xem logs
sudo pm2 logs

# Kiểm tra port 3001
sudo netstat -tulpn | grep 3001
```

### Web tự động cuộn xuống
- Đã sửa! `autoScroll` giờ mặc định là `false`
- Người dùng có thể bật/tắt bằng nút 🔄 trong Log Viewer

---

## 📁 Cấu trúc Project

```
devops/
├── terraform/
│   ├── main.tf           # AWS EC2, Security Group
│   └── .terraform/       # (tạo tự động)
├── ansible/
│   ├── playbook.yml      # Main deployment playbook
│   ├── inventory.ini     # Server list (cập nhật IP ở đây)
│   ├── ansible.cfg       # Ansible config
│   └── devops-key-pair.pem  # SSH private key
├── backend/              # Node.js backend source
└── frontend/             # React frontend source
```

---

## 🎯 Key Features của Playbook

### 1. Lấy Public IP tự động
```yaml
- name: Get IMDSv2 token
  uri:
    url: http://169.254.169.254/latest/api/token
    method: PUT
    headers:
      X-aws-ec2-metadata-token-ttl-seconds: "21600"
    return_content: yes
  register: imds_token

- name: Get public IP from EC2 metadata
  uri:
    url: http://169.254.169.254/latest/meta-data/public-ipv4
    headers:
      X-aws-ec2-metadata-token: "{{ imds_token.content }}"
    return_content: yes
  register: ec2_public_ip
```

### 2. Build Frontend trên Server
```yaml
- name: Create production environment file for frontend
  copy:
    dest: /tmp/frontend-build/.env.production
    content: |
      VITE_API_URL=http://{{ ec2_public_ip.content }}
      VITE_WS_URL=http://{{ ec2_public_ip.content }}

- name: Build frontend for production
  shell: npm run build
  args:
    chdir: /tmp/frontend-build
```

### 3. PM2 Process Manager
```yaml
- name: Start backend with PM2
  shell: |
    cd {{ backend_dir }}
    pm2 start src/server.js --name devops-monitoring-backend --time
    pm2 save

- name: Setup PM2 startup script
  shell: pm2 startup systemd -u root --hp /root
```

---

## 🌟 Ưu điểm

✅ **Không cần build trên local** - Mọi thứ build trên server  
✅ **Tự động lấy Public IP** - Không cần hardcode  
✅ **Idempotent** - Chạy nhiều lần không bị lỗi  
✅ **Zero-downtime** - PM2 tự restart backend  
✅ **Rollback dễ dàng** - Chỉ cần chạy lại với code cũ  

---

## 📊 Kết quả

- Backend chạy trên port 3001 (managed by PM2)
- Frontend phục vụ bởi Nginx từ `/var/www/html/`
- Nginx reverse proxy:
  - `/` → Frontend (React SPA)
  - `/api` → Backend (Node.js)
  - `/socket.io` → WebSocket
- Real-time metrics mỗi 2 giây
- Auto-scroll logs TẮT mặc định

---

**Deployment time:** ~3-5 phút cho lần đầu  
**Update time:** ~2-3 phút cho các lần sau  

🎉 **Happy Deploying!**
