#!/bin/bash
# startup.sh

# Initialisation du Cluster
sudo kubeadm init --apiserver-advertise-address=192.168.1.111 --node-name $HOSTNAME --pod-network-cidr=10.244.0.0/16

# Copy the config
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Ajout du Pod network
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml

# Ajout de Ingress Controller (Load Balancer)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.0.0/deploy/static/provider/cloud/deploy.yaml

# Updtae StrictARP
kubectl get configmap kube-proxy -n kube-system -o yaml | sed -e "s/strictARP: false/strictARP: true/" | kubectl apply -f - -n kube-system

# Ajout de Metallb
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.10.2/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.10.2/manifests/metallb.yaml