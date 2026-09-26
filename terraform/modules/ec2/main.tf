resource "aws_instance" "bastion" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [var.bastion_sg_id]
  associate_public_ip_address = true
  key_name                    = var.key_name

  tags = {
    Name        = "${var.environment}-netfusion-bastion"
    Role        = "Bastion-WireGuard"
    Environment = var.environment
  }
}

resource "aws_instance" "app" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = var.private_subnet_id
  vpc_security_group_ids = [var.app_sg_id]
  key_name               = var.key_name

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y python3
              cat << 'APP' > /home/ec2-user/server.py
              import http.server, socketserver, json
              class H(http.server.SimpleHTTPRequestHandler):
                  def do_GET(self):
                      self.send_response(200)
                      self.send_header('Content-Type', 'application/json')
                      self.end_headers()
                      self.wfile.write(b'{"status":"UP","node":"aws-private-app-01","vpc":"10.20.0.0/16"}')
              with socketserver.TCPServer(("", 8080), H) as s:
                  s.serve_forever()
              APP
              nohup python3 /home/ec2-user/server.py &
              EOF

  tags = {
    Name        = "${var.environment}-netfusion-app-ec2"
    Role        = "Private-Application"
    Environment = var.environment
  }
}
