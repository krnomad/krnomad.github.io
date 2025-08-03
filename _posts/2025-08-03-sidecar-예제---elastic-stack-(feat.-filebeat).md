---
layout: post
date: 2025-08-03
title: "sidecar 예제 - elastic stack (feat. filebeat)"
pin: true
---


### Filebeat 사이드카 컨테이너 예제


Filebeat를 사이드카 컨테이너로 구성하고 Elasticsearch(ES)로 인증 관련 정보를 보내는 예제는 다음과 같습니다. 이 예제에서는 **`ConfigMap`**을 사용하여 Filebeat 설정을 관리하고, **`Secret`**을 사용하여 Elasticsearch 인증 정보를 안전하게 저장합니다.


### 1. Filebeat 설정 파일 (`ConfigMap`으로 정의)


`filebeat.yml` 설정 파일을 `ConfigMap`에 저장합니다. 이 설정 파일은 Filebeat가 로그를 수집하고 Elasticsearch로 보내는 방법을 정의합니다.


{% raw %}
```yaml
apiVersion: v1kind: ConfigMapmetadata:  name: filebeat-config  namespace: elastic-stackdata:  filebeat.yml: |    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*.log
    output.elasticsearch:
      hosts: ["${ES_HOST}"]
      username: "${ES_USERNAME}"
      password: "${ES_PASSWORD}"
      ssl.certificate_authorities: ["/etc/certs/ca.crt"]
```
{% endraw %}


위 설정에서 `${ES_HOST}`, `${ES_USERNAME}`, `${ES_PASSWORD}`는 나중에 Pod에서 환경 변수로 주입됩니다. `ssl.certificate_authorities`는 Elasticsearch와 통신할 때 사용할 CA(Certificate Authority) 인증서의 경로를 지정합니다.


---


### 2. Elasticsearch 인증 정보 (`Secret`으로 정의)


Elasticsearch에 접속하기 위한 사용자 이름과 비밀번호를 `Secret`에 저장합니다. Base64로 인코딩된 값입니다.


{% raw %}
```yaml
apiVersion: v1kind: Secretmetadata:  name: elastic-credentials  namespace: elastic-stacktype: Opaquedata:  username: dXNlcg==  # 'user'를 Base64로 인코딩한 값  password: cGFzc3dvcmQ=  # 'password'를 Base64로 인코딩한 값
```
{% endraw %}


---


### 3. Pod 정의 (사이드카 컨테이너 포함)


이제 `Pod` 정의에서 위에서 만든 `ConfigMap`과 `Secret`을 볼륨으로 마운트하고 환경 변수로 주입합니다.


{% raw %}
```yaml
apiVersion: v1kind: Podmetadata:  name: my-app  namespace: elastic-stackspec:  containers:  - name: my-app-container    image: kodekloud/event-simulator    volumeMounts:    - name: log-volume      mountPath: /var/log/app  initContainers:  - name: filebeat-sidecar    image: docker.elastic.co/beats/filebeat:8.11.1    imagePullPolicy: Always    command: ["/bin/bash", "-c", "cp /usr/share/filebeat/filebeat.yml /etc/filebeat/ && /usr/bin/filebeat"]    env:      - name: ES_HOST        value: "elasticsearch.elastic-stack.svc.cluster.local:9200"      - name: ES_USERNAME        valueFrom:          secretKeyRef:            name: elastic-credentials            key: username      - name: ES_PASSWORD        valueFrom:          secretKeyRef:            name: elastic-credentials            key: password    resources: {}    restartPolicy: Always    volumeMounts:    - name: config-volume      mountPath: /etc/filebeat/    - name: logs-volume      mountPath: /var/log/app    - name: certs-volume      mountPath: /etc/certs/  volumes:  - name: log-volume    emptyDir: {}  - name: config-volume    configMap:      name: filebeat-config  - name: certs-volume    secret:      secretName: elastic-ca-cert
```
{% endraw %}


**설명**:

- **`volumes`**:
undefined- **`initContainers`**:
undefined
Elasticsearch에 더 많은 정보를 추가하기 위해 Filebeat 설정을 수정하여 Kubernetes 메타데이터를 로그에 포함시킬 수 있습니다. Filebeat는 기본적으로 Pod, Namespace, Container 등의 정보를 자동으로 수집하여 로그에 추가하는 기능을 제공합니다.


### Filebeat 설정 수정 예제


`ConfigMap`에 저장된 `filebeat.yml` 설정을 다음과 같이 수정하여 Kubernetes 메타데이터를 추가할 수 있습니다.


{% raw %}
```yaml
apiVersion: v1kind: ConfigMapmetadata:  name: filebeat-config  namespace: elastic-stackdata:  filebeat.yml: |    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*.log
      processors:
      - add_kubernetes_metadata:
          in_cluster: true
    output.elasticsearch:
      hosts: ["${ES_HOST}"]
      username: "${ES_USERNAME}"
      password: "${ES_PASSWORD}"
      ssl.certificate_authorities: ["/etc/certs/ca.crt"]
```
{% endraw %}

- **`processors`**: `filebeat.inputs` 아래에 `processors` 섹션을 추가했습니다.
- **`add_kubernetes_metadata`**: 이 프로세서는 Filebeat가 실행 중인 Pod의 컨테이너 로그에 Kubernetes 메타데이터(Pod 이름, Namespace, 레이블 등)를 자동으로 추가하도록 지시합니다.
- **`in_cluster: true`**: Filebeat가 클러스터 내에서 실행되고 있음을 명시하여 Kubernetes API 서버에 연결하여 메타데이터를 가져오도록 합니다.

이 설정은 Filebeat가 로그를 읽을 때 로그 이벤트에 `kubernetes`라는 필드를 추가하고, 이 필드에 **네임스페이스, Pod 이름, 컨테이너 이름, Pod 레이블** 등의 정보를 포함시킵니다. 따라서 Elasticsearch에서 로그를 분석할 때 이 정보를 활용하여 특정 애플리케이션이나 네임스페이스의 로그만 쉽게 필터링하고 검색할 수 있습니다.


### 유사한 다른 정보


`add_kubernetes_metadata` 프로세서는 Filebeat 컨테이너가 **Kubernetes API 서버**와 통신하여 메타데이터를 가져오는 방식으로 동작합니다. 다음은 그 원리에 대한 자세한 설명과 추가 정보입니다.


---


### `add_kubernetes_metadata`의 원리

1. **권한 부여**: `in_cluster: true` 옵션은 Filebeat가 Kubernetes 클러스터 내부에서 실행 중임을 알려줍니다. 이 설정을 통해 Filebeat는 Pod에 할당된 **ServiceAccount**를 사용하여 Kubernetes API 서버에 인증하고 접근합니다.
2. **API 서버 연결**: Filebeat는 Kubernetes API 서버에 연결하여 현재 Pod의 메타데이터(Pod 이름, 네임스페이스, 컨테이너 ID 등)를 조회합니다.
3. **메타데이터 조회**: 컨테이너 로그가 Filebeat에 의해 처리될 때, Filebeat는 각 로그 라인에 해당하는 컨테이너 ID를 기반으로 Kubernetes API 서버에서 가져온 메타데이터를 검색합니다.
4. **로그에 메타데이터 추가**: 조회된 메타데이터는 로그 이벤트에 `kubernetes`라는 이름의 JSON 필드로 추가됩니다. 이 필드에는 Pod 이름, 네임스페이스, 레이블, 볼륨 정보 등 다양한 정보가 담기게 됩니다.
5. **Elasticsearch로 전송**: 메타데이터가 추가된 로그 이벤트는 최종적으로 Elasticsearch로 전송됩니다.

이러한 과정을 통해 Filebeat는 로그 자체에 포함되지 않은 Pod의 실행 환경 정보를 동적으로 추가할 수 있으며, 이 정보는 Elasticsearch에서 로그를 검색하고 분석할 때 강력한 필터링 및 시각화 수단으로 사용됩니다.


---


### 유사한 다른 설정 및 Elasticsearch에서의 인덱싱


### 1. `add_fields` 프로세서


`add_kubernetes_metadata`와 비슷하지만, 정적(static) 정보를 추가할 때 사용됩니다. 예를 들어, 모든 로그 이벤트에 특정 환경(예: `production`, `staging`) 정보를 추가하고 싶을 때 유용합니다.


{% raw %}
```yaml
  processors:
  - add_fields:
      fields:
        env: production
```
{% endraw %}


### 2. `add_tags` 프로세서


로그에 태그를 추가하여 특정 로그를 식별하는 데 사용됩니다. 예를 들어, `app` 컨테이너의 로그에 `app-log`라는 태그를 추가할 수 있습니다.


{% raw %}
```yaml
  processors:
  - add_fields:
      fields:
        env: production
```
{% endraw %}

