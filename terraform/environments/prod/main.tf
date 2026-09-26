terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source           = "../../modules/vpc"
  vpc_cidr         = var.vpc_cidr
  environment      = "prod"
  public_subnet_id = module.subnet.public_subnet_id
}

module "subnet" {
  source              = "../../modules/subnet"
  vpc_id              = module.vpc.vpc_id
  environment         = "prod"
  public_subnet_cidr  = "10.20.1.0/24"
  private_subnet_cidr = "10.20.2.0/24"
  availability_zone   = "${var.aws_region}a"
  igw_id              = module.vpc.igw_id
}

module "security" {
  source      = "../../modules/security"
  vpc_id      = module.vpc.vpc_id
  environment = "prod"
  onprem_cidr = var.onprem_cidr
  vpc_cidr    = var.vpc_cidr
}

module "ec2" {
  source            = "../../modules/ec2"
  environment       = "prod"
  instance_type     = "t3.medium"
  public_subnet_id  = module.subnet.public_subnet_id
  private_subnet_id = module.subnet.private_subnet_id
  bastion_sg_id     = module.security.bastion_sg_id
  app_sg_id         = module.security.app_sg_id
  key_name          = var.key_name
}

module "vpn" {
  source                       = "../../modules/vpn"
  private_route_table_id       = module.subnet.private_route_table_id
  onprem_cidr                  = var.onprem_cidr
  bastion_network_interface_id = module.ec2.bastion_instance_id
}
