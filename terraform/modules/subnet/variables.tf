variable "vpc_id" {
  type = string
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "public_subnet_cidr" {
  type    = string
  default = "10.20.1.0/24"
}

variable "private_subnet_cidr" {
  type    = string
  default = "10.20.2.0/24"
}

variable "availability_zone" {
  type    = string
  default = "us-east-1a"
}

variable "igw_id" {
  type = string
}
