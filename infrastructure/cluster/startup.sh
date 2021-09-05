#!/bin/bash
# startup.sh
# Les "sleep" sont obligatoires sinon délais trop courts et plantage

# Mise à jour des dépôts & paquets
sudo apt-get update && sudo apt-get upgrade && sudo apt-get dist-upgrade -y

# Installation dépendances pour Docker
sudo apt -y install software-properties-common apt-transport-https ca-certificates curl gnupg2 software-properties-common && sleep 30

# Ajout du dépôt Docker et de la clé 
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/debian \
   $(lsb_release -cs) \
   stable"
   
# Ajout du dépôt Kubernetes et de la clé puis installation de kubelet/kube-adm/kubenetes-cni
sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
sudo echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee -a /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update && sleep 10 && sudo apt-get install -y kubelet kubeadm kubernetes-cni

# Seconde mise à jour des dépôts & installation Docker + paquets de base + Quemu guest Agent + démarrage docker au boot
sudo apt-get update && sudo apt -y install docker-ce docker-ce-cli htop vim qemu-guest-agent && sudo systemctl enable docker && sudo systemctl start docker && sudo systemctl start qemu-guest-agent


  # Déclaration du script de démarrage, en utilisant user + clé SSH privée
  provisioner "file" {
    source      = "./startup.sh"
    destination = "/tmp/startup.sh"
    connection {
      type        = "ssh"
      user        = "imadsalki"
      private_key = file("~/.ssh/id_rsa")
      host        = self.ssh_host
    }
  }

  # Exécution du script de démarrage
  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/startup.sh",
      "/tmp/startup.sh",
    ]
    connection {
      type        = "ssh"
      user        = "imadsalki"
      private_key = file("~/.ssh/id_rsa")
      host        = self.ssh_host
    }
  }


qm create 1000 -name debian-template -memory 3072 -net0 virtio,bridge=vmbr0 -cores 2 -sockets 1 -cpu cputype=kvm64 -kvm 1 -numa 1