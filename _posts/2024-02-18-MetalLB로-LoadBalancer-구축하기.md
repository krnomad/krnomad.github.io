---
layout: post
date: 2024-02-18
title: "MetalLB로 LoadBalancer 구축하기"
tags: [MetalLB, LoadBalancer, k8s, ]
categories: [kubernetes, ]
pin: true
---


### 환경


metallb 0.12.1 설정


{% raw %}
```bash
helm pull metallb/metallb --version=0.12.1
```
{% endraw %}


아래와 같이 Main PC에 VM3개를 띄워 cluster를 구축했다고 가정했을 때


{% raw %}
```mermaid
graph TD
  MainPC --> VM1(192.168.56.101)
  MainPC --> VM2(192.168.56.102)
  MainPC --> VM3(192.168.56.103)
```
{% endraw %}


LoadBalanacer에 사용할 ip 대역을 192.168.56.150~192.168.56.180으로 설정하려고 한다.

1. LoadBalancer에 할당할 외부에서 접속 가능한 IP 대역 지정하기
undefined2. 헬름을 이용해 MetalLB 설치
