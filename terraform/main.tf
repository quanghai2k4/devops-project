provider "aws" {
  region = "ap-southeast-1" # Đổi region tùy bạn
}

resource "aws_security_group" "web_sg" {
  name        = "devops-monitoring-sg"
  description = "Security group for DevOps Monitoring Dashboard"

  # SSH access
  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access (Nginx - Frontend + API proxy)
  ingress {
    description = "HTTP Web from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access (optional for future)
  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API port (for development/debugging)
  ingress {
    description = "Backend API"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress - allow all outbound traffic
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "devops-monitoring-sg"
    Project = "DevOps Monitoring Dashboard"
  }
}

resource "aws_instance" "web_server" {
  ami           = "ami-00d8fc944fb171e29" # Ubuntu 22.04 LTS (ap-southeast-1)
  instance_type = "t3.micro"              # Free tier eligible
  key_name      = "devops-key-pair"       # Your SSH key pair name

  vpc_security_group_ids = [aws_security_group.web_sg.id]

  # Increase root volume for applications
  root_block_device {
    volume_size = 10
    volume_type = "gp3"
  }

  tags = {
    Name        = "DevOps-Monitoring-Server"
    Project     = "DevOps Monitoring Dashboard"
    Environment = "Production"
  }

  # User data script to update packages on first boot
  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              EOF
}

output "server_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.web_server.public_ip
}

output "server_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.web_server.public_dns
}

output "ssh_connection" {
  description = "SSH connection command"
  value       = "ssh -i devops-key-pair.pem ubuntu@${aws_instance.web_server.public_ip}"
}

output "dashboard_url" {
  description = "Dashboard URL"
  value       = "http://${aws_instance.web_server.public_ip}"
}
