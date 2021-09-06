#!/bin/bash
# startup.sh

# Mise à jour des dépôts & paquets
sudo apt-get update && sudo apt-get upgrade && sudo apt-get dist-upgrade -y

sudo docker run --privileged -d --restart=unless-stopped -p 80:80 -p 443:443 rancher/rancher