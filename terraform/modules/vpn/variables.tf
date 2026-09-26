variable "private_route_table_id" {
  type = string
}

variable "onprem_cidr" {
  type    = string
  default = "10.10.0.0/16"
}

variable "bastion_network_interface_id" {
  type = string
}
