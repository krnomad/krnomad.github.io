---
layout: post
date: 2024-03-03
title: "k8s plugin으로 생산성 올리기 - krew "
tags: [krew, kubetail, ]
categories: [DevOps, K8S, kubernetes, ]
pin: true
---


krew는 kubectl에서 사용할 수 있는 유요한 plugin을 설치할 수 있게 도와준다.


`kubectrl krew install $pugin_name`과 같은 방법으로 plugin을 설치할 수 있다. package manager와 유사하게 다음과 같은 명령어들이 지원된다.

- kubectl krew list
- kubectl krew search

# 설치


Terminal 창에 다음 명령을 실행하면 손쉽게 krew가 설치되며, 이후 `kubectl krew`명령이 실행 가능해 진다.


{% raw %}
```bash
(
  set -x; cd "$(mktemp -d)" &&
  OS="$(uname | tr '[:upper:]' '[:lower:]')" &&
  ARCH="$(uname -m | sed -e 's/x86_64/amd64/' -e 's/\(arm\)\(64\)\?.*/\1\2/' -e 's/aarch64$/arm64/')" &&
  KREW="krew-${OS}_${ARCH}" &&
  curl -fsSLO "https://github.com/kubernetes-sigs/krew/releases/latest/download/${KREW}.tar.gz" &&
  tar zxvf "${KREW}.tar.gz" &&
  ./"${KREW}" install krew
)
```
{% endraw %}


zshrc나 bash에 다음 내용을 추가하자


{% raw %}
```dart
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"
```
{% endraw %}


### 공식 링크


[https://krew.sigs.k8s.io/docs/user-guide/quickstart/](https://krew.sigs.k8s.io/docs/user-guide/quickstart/)


[https://krew.sigs.k8s.io/docs/user-guide/setup/install/](https://krew.sigs.k8s.io/docs/user-guide/setup/install/)


# 추천 플러그인


## ctx


`.kube/config`에 kubectl이 사용하는 context들이 저장된다. 여러 k8s cluster를 관리하게 되면 이 config파일을 대체하거나 혹은 config에 context를 추가하는 방식으로 관리한다. 이 경우 context르 전환하는 것이 불편한데, ctx plugin은 이를 해결해준다. 


{% raw %}
```bash
kubectl krew install ctx
kubectl ctx
```
{% endraw %}


zsh plugin에서 제공되는 fzf를 함께 사용하면 k ctx 명령에 결과를 다음과 같이 방향키를 통해 선택할 수 있게 된다.


![0](/assets/img/2024-03-03-k8s-plugin으로-생산성-올리기---krew-.md/0.png)


## ns


k8s context와 마찬가지로 namespace를 손쉽게 전환하게 도와주는 plugin


{% raw %}
```bash
kubectl krew install ns
kubectl ns
```
{% endraw %}


## konfig 


`~/.kube/config` 에 여러 plugin이 존재할 때 이를 병합을 도와주는 plugin이다. 


{% raw %}
```bash
kubectl krew install konfig
kubectl konfig import ${file} # 이후 confg를 붙여넣기
```
{% endraw %}


cluster의 이름 기반으로 병합이 이뤄지기 때문에 cluster의 이름이 동일할 경우 병합 결과가 잘못될 수 있다. kconfig를 사용전 `~/.kube/config` 파일 내용을 수정 후 실행하는 것이 좋다.


## kubetail


`kubectl get logs`명령은 단일 pod의 container 1개에 대한 log만을 출력하지만 kubetail을 이용하면 `ns`, pod내 여러 container의 log를 동시에 출력하게 할 수 있다.


{% raw %}
```bash
sudo apt-get install kubetail
kubetail -n kube-system calico
```
{% endraw %}


# Link


https://gurumee92.tistory.com/302

