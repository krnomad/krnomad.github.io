---
layout: post
date: 2025-08-03
title: "Dockerfile vs. Kubernetes "
pin: true
---


# Dockerfile vs. Kubernetes `command` / `args` (핵심 비교)


---


| **지시어 / 필드** | **주체**         | **역할**                           | **우선순위**                               | **기억 핵심**                    |
| ------------ | -------------- | -------------------------------- | -------------------------------------- | ---------------------------- |
| `ENTRYPOINT` | Dockerfile     | 컨테이너의 **실행 파일/주 프로그램**           | K8s `command`가 없으면 적용                  | **이미지의 "정체성" (항상 실행)**       |
| `CMD`        | Dockerfile     | `ENTRYPOINT`의 **기본 인수** 또는 기본 명령 | K8s `args`가 없으면 적용                     | **"정체성"의 "기본 설정" (바뀔 수 있음)** |
| `command`    | Kubernetes Pod | `ENTRYPOINT`를 **재정의**            | **최우선** (Dockerfile `ENTRYPOINT`를 덮어씀) | **K8s가 지정하는 "새 정체성"**        |
| `args`       | Kubernetes Pod | `CMD`를 **재정의**                   | **최우선** (Dockerfile `CMD`를 덮어씀)        | **K8s가 지정하는 "새 설정"**         |

undefined
### 핵심 요약: 쉽게 기억하는 방법


**`ENTRYPOINT`****는 컨테이너의 "진입점" 또는 "실행 파일" 역할**을 하고, **`CMD`****는** **`ENTRYPOINT`****에 전달되는 "인수" 또는 "기본 명령어" 역할**을 한다고 생각하면 됩니다.


### Kubernetes `command` / `args` (핵심 요약: 쉽게 기억하는 방법)


**`command`****는 컨테이너의 "최종 실행 파일" 역할을 하고,** **`args`****는** **`command`****에 전달되는 "최종 인수" 역할을 합니다. 이 둘은 Dockerfile의 설정을 덮어씁니다.**

<details>
  <summary>Dockerfile과 k8s pod spec 조합 문제</summary>


다음 두 조건하에서 k8s pod 생성시 실제 명령어는?


{% raw %}
```docker
FROM python:3.6-alpine

RUN pip install flask

COPY . /opt/

EXPOSE 8080

WORKDIR /opt

ENTRYPOINT ["python", "app.py"]

CMD ["--color", "red"]
```
{% endraw %}


{% raw %}
```yaml
apiVersion: v1 
kind: Pod 
metadata:
  name: webapp-green
  labels:
      name: webapp-green 
spec:
  containers:
  - name: simple-webapp
    image: kodekloud/webapp-color
    command: ["--color","green"]
```
{% endraw %}

<details>
  <summary>답</summary>


`--color green`



  </details>

  </details>
---


## Dockerfile `ENTRYPOINT` / `CMD` 작성 방식 (Shell vs. Exec Form)


Dockerfile의 `ENTRYPOINT`와 `CMD`는 두 가지 방식으로 작성할 수 있으며, 이 방식은 컨테이너 내부에서 명령어가 실행되는 방식에 중요한 차이를 만듭니다.


### 1. `exec form` (실행 폼): 권장 방식!

- **작성 방식:** `["executable", "param1", "param2"]`
undefined- **실행 방식:** 셸(`/bin/sh` 등)을 거치지 않고 **프로그램을 컨테이너의 PID 1으로 직접 실행**합니다.
- **핵심 이점:**
undefined- **주의:** 셸의 특수 기능(환경 변수 자동 확장, 파이프 `|`, 리다이렉션 `>` 등)은 직접 사용할 수 없습니다. (필요하면 `["/bin/sh", "-c", "your command here"]` 형태로 명시적으로 셸을 호출해야 함.)
- **기억:** **`["직접", "실행", "하라"]`** **(PID 1, 우아한 종료)**

### 2. `shell form` (셸 폼)

- **작성 방식:** `executable param1 param2`
undefined- **실행 방식:** Docker가 이 명령어를 `/bin/sh -c "명령어"` 형태로 **셸을 통해 실행**합니다.
- **핵심 이점:**
undefined- **주의:**
undefined- **기억:** **`"셸을 거쳐서 실행!"`** **(PID 1 문제, 간단한 스크립트용)**

---


### Best Practice (최고의 관행)

- **Dockerfile에서는** **`ENTRYPOINT`****와** **`CMD`** **모두** **`exec form`****을 사용하는 것을 강력히 권장합니다.**Dockerfile
undefinedundefined- **Kubernetes Pod 정의에서는** **`command`****와** **`args`** **필드를 가급적 사용하지 않는 것이 좋습니다.**YAML
undefined