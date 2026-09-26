output "vpc_id" {
  value = module.vpc.vpc_id
}

output "bastion_public_ip" {
  value = module.ec2.bastion_public_ip
}

output "app_private_ip" {
  value = module.ec2.app_private_ip
}
