terraform {
  required_providers {
    proxmox = {
      source  = "Telmate/proxmox"
      version = "2.7.4"
    }
  }
}

provider "proxmox" {
  pm_api_url  = "https://192.168.1.200:8006/api2/json"
  pm_user     = "root@pam"
  pm_password = "SERVEURImad1911"
  # Laisser à "true" si certificat auto-signé
  pm_tls_insecure = "true"
}

# Création variable pour nombre de VMs à déployer (récupéré via l'argument -var 'nombre=X')
variable "nombre" {
  type = number
}

# Définition de la VM à créer
resource "proxmox_vm_qemu" "proxmox_vm" {
  count = var.nombre
  name  = "worker-0${count.index}"

  # Nom du node sur lequel le déploiement aura lieu
  target_node = "pve"

  # The template name to clone this vm from and Full clone
  clone      = "debian-template"
  full_clone = true

  # Activate QEMU agent for this VM
  agent = 1

  # Specs
  os_type  = "cloud-init"
  cores    = 2
  sockets  = "1"
  cpu      = "host"
  memory   = 2048
  scsihw   = "virtio-scsi-pci"
  bootdisk = "virtio0"

  # Setup de l'IP statique
  ipconfig0  = "ip=192.168.1.11${count.index + 1}/24,gw=192.168.1.1"
  ciuser     = "imadsalki"
  cipassword = "worker"

  disk {
    size     = "20G"
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
