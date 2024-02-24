---
layout: post
date: 2024-02-24
title: "K8s Loadbalance service"
tags: [k8s, LoadBalancer, ]
categories: [kubernetes, ]
pin: true
---


`ipvsadm -Ln`명령을 통해 Loadbalance에 할당된 IP가 pod까지 전달되는 라우팅 정보를 확인할 수 있다.


Layer 4와 유사 (cf. ingress는 layer7 와 유사)


### Metallb에 Loadbalance service가 추가


192.168.56.151이 생성된 것을 확인 


![0](/assets/img/2024-02-24-K8s-Loadbalance-service.md/0.png)


### External-IP 확인 및 Pod 연결


![1](/assets/img/2024-02-24-K8s-Loadbalance-service.md/1.png)


Node에 접속해 `ipvadm -Ln`명령으로 라우팅 정보 확인


![2](/assets/img/2024-02-24-K8s-Loadbalance-service.md/2.png)


Pod 정보 확인. ExternalIP 192.168.56.151:80이 Pod ip 10.233.96.117.80로 연결되는 것을 확인할 수 있다. Replicas가 여러개라면 192.168.56.151을 통해 여러 pod IP로 라우팅 될 수 있다 (로그밸런싱)


![3](/assets/img/2024-02-24-K8s-Loadbalance-service.md/3.png)

