# Providers
terraform {
  required_providers {
    proxmox = {
      source  = "Telmate/proxmox"
      version = "2.7.4"
    }
  }
}

# Set TF_VAR_pm_user and TF_VAR_pm_password as Environement Variables 
variable "pm_user" {}
variable "pm_password" {}

# Connexion à Proxmox
provider "proxmox" {
  pm_api_url  = "https://192.168.1.200:8006/api2/json"
  pm_user     = var.pm_user
  pm_password = var.pm_password
  # Laisser à "true" si certificat auto-signé
  pm_tls_insecure = "true"
}

# Nombre de Workers à créer
variable "workers" {
  type        = number
  description = "Number of workers to deploy"

  validation {
    condition     = length(var.workers) >= 0
    error_message = "Must have at least 1 worker."
  }
}

# Définition du Node Master
resource "proxmox_vm_qemu" "proxmox_vm_master" {
  count = 1
  name  = "ticketing-master"

  # Nom du node sur lequel le déploiement aura lieu
  target_node = "pve"

  # The template name to clone this vm from and Full clone
  clone      = "centos-kube-template"
  full_clone = false

  # Activate QEMU agent for this VM
  agent = 1

  # The destination resource pool for the new VM
  pool = "Ticketing-project"

  # Specs
  os_type  = "cloud-init"
  cores    = 2
  sockets  = "1"
  cpu      = "host"
  memory   = 4096
  scsihw   = "virtio-scsi-pci"
  bootdisk = "virtio0"

  # Setup de l'IP statique
  ipconfig0  = "ip=192.168.1.111/24,gw=192.168.1.1"
  ciuser     = "imadsalki"
  cipassword = "worker"

  disk {
    size     = "15G"
    type     = "virtio"
    storage  = "local-lvm"
    iothread = 1
  }

  network {
    model  = "virtio"
    bridge = "vmbr0"
  }

  # Configuration relative à CloudInit
  # Clé SSH publique
  sshkeys = <<EOF
  ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDTDdkEt6n8BdG7bPiLyrXUmRNpiYbcoXjB27VbvCJ/uFe5EB/EEUDgvuViDznhl1ZaIwdR3EgGQeWa9CyUuJMBKPAo55TMSaXhFx6wTWvfEgNLRNcevC/CKqRGsgjsG+h8kHkmfhIvNOz2NNo0b/6e4/FgGj1Tt6uC0eQgsuBGsGCfu0EC58LqkT5fk96Z0V2Nh7lHrN+fUMgh0REOJkZXzTprlgckqWfeCI0aIQ4xbeIFRHodQqv5Fp7Sr3LWjJqwQnQ5zr9fWoxoKZ5+/j1takUs7zzvPmDujeezehqRHI+FvYHUAyoUO5crXoF6Mf44MIabt8GltmRq4minqSE5 imadsalki@mac-mini-de-imad.home
  EOF

  # Copie du fichier de creation du Cluster
  provisioner "file" {
    source      = "scripts/start-master-cluster.sh"
    destination = "/tmp/start-master-cluster.sh"
    connection {
      type        = "ssh"
      user        = "imadsalki"
      private_key = file("~/.ssh/id_rsa")
      host        = self.ssh_host
    }
  }

  # Exécution du script 
  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/start-master-cluster.sh",
      "/tmp/start-master-cluster.sh",
    ]
    connection {
      type        = "ssh"
      user        = "imadsalki"
      private_key = file("~/.ssh/id_rsa")
      host        = self.ssh_host
    }
  }
}

# Définition des Workers Nodes
resource "proxmox_vm_qemu" "proxmox_vm_worker" {

  # Depends on Master
  depends_on = [
    proxmox_vm_qemu.proxmox_vm_master,
  ]

  count = var.workers
  name  = "ticketing-worker-0${count.index + 1}"

  # Nom du node sur lequel le déploiement aura lieu
  target_node = "pve"

  # The template name to clone this vm from and Full clone
  clone      = "centos-kube-template"
  full_clone = false

  # Activate QEMU agent for this VM
  agent = 1

  # The destination resource pool for the new VM
  pool = "Ticketing-project"

  # Specs
  os_type  = "cloud-init"
  cores    = 2
  sockets  = "1"
  cpu      = "host"
  memory   = 4096
  scsihw   = "virtio-scsi-pci"
  bootdisk = "virtio0"

  # Setup de l'IP statique
  ipconfig0  = "ip=192.168.1.11${count.index + 2}/24,gw=192.168.1.1"
  ciuser     = "imadsalki"
  cipassword = "worker"

  disk {
    size     = "15G"
    type     = "virtio"
    storage  = "local-lvm"
    iothread = 1
  }

  network {
    model  = "virtio"
    bridge = "vmbr0"
  }

  # Configuration relative à CloudInit
  # Clé SSH publique
  sshkeys = <<EOF
  ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDTDdkEt6n8BdG7bPiLyrXUmRNpiYbcoXjB27VbvCJ/uFe5EB/EEUDgvuViDznhl1ZaIwdR3EgGQeWa9CyUuJMBKPAo55TMSaXhFx6wTWvfEgNLRNcevC/CKqRGsgjsG+h8kHkmfhIvNOz2NNo0b/6e4/FgGj1Tt6uC0eQgsuBGsGCfu0EC58LqkT5fk96Z0V2Nh7lHrN+fUMgh0REOJkZXzTprlgckqWfeCI0aIQ4xbeIFRHodQqv5Fp7Sr3LWjJqwQnQ5zr9fWoxoKZ5+/j1takUs7zzvPmDujeezehqRHI+FvYHUAyoUO5crXoF6Mf44MIabt8GltmRq4minqSE5 imadsalki@mac-mini-de-imad.home
  EOF
}
