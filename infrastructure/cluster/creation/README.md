### Informations 📎

- Pour un premier lancement utiliser une image de type **Cloud-init** inclure ces **provisioner** dans le fichier **main.tf** ce qui permettera d'avoir un VM complete. (env. 5 min)

- Transformer cette VM en template pour l'utiliser en base pour les prochains lancement et clean le **main.tf** pour accélérer les prochain déploiment. (env. 2.3min for 3Vms) ⬆️

- Next step -> Accélérer plus le déploiment : Viser 1 min. 🔥

```javascript
# Déclaration du script de démarrage, en utilisant user + clé SSH privée
  provisioner "file" {
    source      = "./startup-base.sh"
    destination = "/tmp/startup-base.sh"
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
      "chmod +x /tmp/startup-base.sh",
      "/tmp/startup-base.sh",
    ]
    connection {
      type        = "ssh"
      user        = "imadsalki"
      private_key = file("~/.ssh/id_rsa")
      host        = self.ssh_host
    }
  }
```

### UPDATE the base Image with this before first start:

```shell
sudo apt install -y qemu-guest-agent
sudo systemctl start qemu-guest-agent
```

### CLI Commands

- To see a VM configuration :

```
qm config [VM-ID]
```

- To see where a volume is stored in the node :

```
pvesm path [VOLUME-ID]
```

- To convert Volume to image:

```
qemu-img convert -O qcow2 -f raw INPUT-PATH  OUTPUT.qcow2
```

- Création d'une VM avec ID 1000 nommée centos-kube-template, 4Go RAM, 1 proco, 2 coeurs

```
qm create 1000 -name centos-kube-template -memory 4096 -net0 virtio,bridge=vmbr0 -cores 2 -sockets 1 -cpu cputype=kvm64 -kvm 1 -numa 1
```

- Import du disque

```
qm importdisk 1000 centos-kube.qcow2 local-lvm
```

- Attachement du disque à la VM

```
qm set 1000 -scsihw virtio-scsi-pci -virtio0 local-lvm:vm-1000-disk-0
```

- Ajout lecteur CD pour cloudinit

```
qm set 1000 -ide2 local-lvm:cloudinit
qm set 1000 -serial0 socket
```

- Boot sur disque principal

```
qm set 1000 -boot c -bootdisk virtio0
qm set 1000 -agent 1
qm set 1000 -hotplug disk,network,usb,memory,cpu
```

- 2 cores x1 sockets = 2 Vcpus

```
qm set 1000 -vcpus 2
qm set 1000 -vga qxl
```

- Copie clé SSH publique de l'hôte proxmox-01

```
qm set 1000 --sshkey ~/.ssh/id_rsa.pub
```

- Passage en template

```
qm template 1000
```

- Passage taille du disque à 20Go et non plus 2Go

```
qm resize 1000 virtio0 +18G
```

- Create Cluster and copy config

```
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
sudo mkdir -p $HOME/.kube
sudo kubernetes-master:~$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

- Deploy POD Network

```
sudo kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

- Access to kubernetes Container

```
kubectl exec --stdin --tty orders-depl-df859cd88-28phw -- /bin/sh
```
