variable "vpc_cidr" {
  description = "CIDR block for the AWS VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "environment" {
  description = "Target environment: dev or prod"
  type        = string
  default     = "dev"
}

variable "public_subnet_id" {
  description = "Public subnet ID for NAT Gateway allocation"
  type        = string
  default     = ""
}
