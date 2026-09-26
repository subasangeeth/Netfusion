variable "vpc_id" {
  type = string
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "admin_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "onprem_cidr" {
  type    = string
  default = "10.10.0.0/16"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}
