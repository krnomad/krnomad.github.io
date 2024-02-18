---
layout: post
date: 2024-02-17
title: "vagrant + kubespray로 k8s cluster 구축하기"
tags: [k8s, vagrant, kubespray, ]
categories: [kubernetes, ]
pin: true
---


## 구축 환경


ubuntu20.04


python3.9


(참고) ubuntu20.04에서 python3.9 설치: [https://codechacha.com/ko/ubuntu-install-python39/](https://codechacha.com/ko/ubuntu-install-python39/)


# Vagrant 로 VM 구축


### vagant 다운로드 및 설치


{% raw %}
```bash
curl -O https://releases.hashicorp.com/vagrant/2.4.1/vagrant_2.4.1-1_amd64.deb
sudo apt install ./vagrant_2.4.1-1_amd64.deb
```
{% endraw %}


### `Vagranffile` 작성


ip는 virtualbox의 host전용 어뎁터 subnet 기준으로 변경 필요


{% raw %}
```bash
Vagrant.configure("2") do |config|
	# Define VM
	config.vm.define "k8s-node1" do |ubuntu|
		ubuntu.vm.box = "ubuntu/focal64"
		ubuntu.vm.hostname = "k8s-node1"
		ubuntu.vm.network "private_network", ip: "192.168.56.101"
		ubuntu.vm.provider "virtualbox" do |vb|
			vb.name = "k8s-node1"
			vb.cpus = 2
			vb.memory = 3000
		end
	end
	config.vm.define "k8s-node2" do |ubuntu|
		ubuntu.vm.box = "ubuntu/focal64"
		ubuntu.vm.hostname = "k8s-node2"
		ubuntu.vm.network "private_network", ip: "192.168.56.102"
		ubuntu.vm.provider "virtualbox" do |vb|
			vb.name = "k8s-node2"
			vb.cpus = 2
			vb.memory = 3000
		end
	end
	config.vm.define "k8s-node3" do |ubuntu|
		ubuntu.vm.box = "ubuntu/focal64"
		ubuntu.vm.hostname = "k8s-node3"
		ubuntu.vm.network "private_network", ip: "192.168.56.103"
		ubuntu.vm.provider "virtualbox" do |vb|
			vb.name = "k8s-node3"
			vb.cpus = 2
			vb.memory = 3000
		end
	end

	config.vm.provision "shell", inline: <<-SHELL
	  sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
	  sed -i 's/archive.ubuntu.com/mirror.kakao.com/g' /etc/apt/sources.list
	  sed -i 's/security.ubuntu.com/mirror.kakao.com/g' /etc/apt/sources.list
	  systemctl restart ssh
	SHELL
end
```
{% endraw %}


### Vagrant 실행


{% raw %}
```bash
vagrant up --provider=virtualbox
```
{% endraw %}


### SSH key 복사


vagrant 초기 암호는 vagrant이다. 기타 sshd_config로 암호 설정 취소


{% raw %}
```bash

ssh-copy-id vagrant@192.168.56.101
ssh-copy-id vagrant@192.168.56.102
ssh-copy-id vagrant@192.168.56.103
```
{% endraw %}


# Kubespray로 k8s cluster 구축


### package 설치


{% raw %}
```bash
pip3 install -r requirements.txt
```
{% endraw %}


### inventory 생성


{% raw %}
```bash
cp -rpf inventory/sample/ inventory/mycluster
```
{% endraw %}


### inventory.ini 변경


{% raw %}
```bash
[all]
node1 ansible_host=192.168.56.101 ip=192.168.56.101 ansible_ssh_user=vagrant
node2 ansible_host=192.168.56.102 ip=192.168.56.102 ansible_ssh_user=vagrant
node3 ansible_host=192.168.56.103 ip=192.168.56.103 ansible_ssh_user=vagrant
# node1 ansible_host=95.54.0.12  # ip=10.3.0.1 etcd_member_name=etcd1
# node2 ansible_host=95.54.0.13  # ip=10.3.0.2 etcd_member_name=etcd2
# node3 ansible_host=95.54.0.14  # ip=10.3.0.3 etcd_member_name=etcd3
# node4 ansible_host=95.54.0.15  # ip=10.3.0.4 etcd_member_name=etcd4
# node5 ansible_host=95.54.0.16  # ip=10.3.0.5 etcd_member_name=etcd5
# node6 ansible_host=95.54.0.17  # ip=10.3.0.6 etcd_member_name=etcd6

# ## configure a bastion host if your nodes are not directly reachable
# [bastion]
# bastion ansible_host=x.x.x.x ansible_user=some_user

[kube_control_plane]
node1
# node1
# node2
# node3

[etcd]
node1
# node1
# node2
# node3

[kube_node]
node1
node2
node3
# node2
# node3
# node4
# node5
# node6

[calico_rr]

[k8s_cluster:children]
kube_control_plane
kube_node
calico_rr
```
{% endraw %}


### group_vars 변경 (optional)


[https://kubespray.io/#/docs/vars](https://kubespray.io/#/docs/vars)


metalLB 관련: kube_proxy_strict_arp


audit관련: kubernetes_audit


### 실행


{% raw %}
```bash
ansible all -m ping -i inventory/mycluster/inventory.ini # 실행 전 test

ansible-playbook -i inventory/mycluster/inventory.ini cluster.yml -b
```
{% endraw %}


## 최종 확인


node1에 들어가서 kubectl 동작 확인


{% raw %}
```bash
vagrant@node1:~$ mkdir -p $HOME/.kube
vagrant@node1:~$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
vagrant@node1:~$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
vagrant@node1:~$ kubectl get nodes
NAME    STATUS   ROLES                  AGE     VERSION
node1   Ready    control-plane,master   7m59s   v1.22.8
node2   Ready    <none>                 6m56s   v1.22.8
node3   Ready    <none>                 6m56s   v1.22.8
vagrant@node1:~$
```
{% endraw %}


Krew를 통해 ctx, ns, konfig를 변경해서 사용


# Link


[https://nayoungs.tistory.com/entry/Kubernetes-Kubespray로-쿠버네티스-설치하기](https://nayoungs.tistory.com/entry/Kubernetes-Kubespray%EB%A1%9C-%EC%BF%A0%EB%B2%84%EB%84%A4%ED%8B%B0%EC%8A%A4-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0)

