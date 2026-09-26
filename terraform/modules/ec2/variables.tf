variable "environment" {
  type    = string
  default = "dev"
}

variable "ami_id" {
  type    = string
  default = "ami-0c7217cdde317cfec" # Amazon Linux 2023 in us-east-1
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "public_subnet_id" {
  type = string
}

variable "private_subnet_id" {
  type = string
}

variable "bastion_sg_id" {
  type = string
}

variable "app_sg_id" {
  type = string
}

variable "key_name" {
  type    = string
  default = ""
}
