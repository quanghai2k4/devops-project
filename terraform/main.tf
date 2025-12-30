provider "aws" {
  region = "ap-southeast-1" # Đổi region tùy bạn
}

resource "aws_security_group" "web_sg" {
  name        = "devops-project-sg"
  description = "Allow SSH and HTTP traffic"

  # Ingress: Cho phép chiều vào
  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Chấp nhận mọi IP (Demo thì OK, thực tế nên hạn chế)
  }

  ingress {
    description = "HTTP Web from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress: Cho phép chiều ra (để Server tải được Nginx từ internet)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "web_server" {
  ami           = "ami-00d8fc944fb171e29" # Ubuntu 22.04 (check AMI ID theo region của bạn)
  instance_type = "t3.micro"
  key_name      = "devops-key-pair" # Tên key pair bạn đã tạo trên AWS

  tags = {
    Name = "DevOps"
  }
  
  # Security group mở port 22 (SSH) và 80 (Web) - Nên cấu hình thêm resource aws_security_group
  vpc_security_group_ids = [aws_security_group.web_sg.id]
}

output "server_ip" {
  value = aws_instance.web_server.public_ip
}
