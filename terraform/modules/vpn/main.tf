# Static Route from AWS Private Subnets to Docker On-Premises via Bastion/WireGuard ENI
resource "aws_route" "to_onprem" {
  route_table_id         = var.private_route_table_id
  destination_cidr_block = var.onprem_cidr
  network_interface_id   = var.bastion_network_interface_id
}
