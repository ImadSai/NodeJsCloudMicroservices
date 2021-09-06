#!/bin/bash
# startup.sh

# Mise à jour des dépôts & paquets
sudo apt-get update && sudo apt-get upgrade && sudo apt-get dist-upgrade -y

# Installation dépendances pour Docker
sudo apt -y install software-properties-common apt-transport-https ca-certificates curl gnupg2 software-properties-common

# Ajout du dépôt Docker 
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" -y

# Ajout du dépôt Kubernetes
sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
sudo echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee -a /etc/apt/sources.list.d/kubernetes.list

# Seconde mise à jour des dépôts & installation Docker + paquets de base + Quemu guest Agent + démarrage docker au boot
sudo apt-get update 
sudo apt install -y docker-ce docker-ce-cli htop vim 
sudo apt install -y kubelet kubeadm kubernetes-cni
sudo systemctl enable docker 
sudo systemctl start docker
sudo usermod -aG docker $USER
sudo apt install -y qemu-guest-agent 
sudo systemctl start qemu-guest-agent
sudo systemctl enable qemu-guest-agent