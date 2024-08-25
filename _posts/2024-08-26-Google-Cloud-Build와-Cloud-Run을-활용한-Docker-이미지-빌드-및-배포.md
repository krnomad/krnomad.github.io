---
layout: post
date: 2024-08-26
title: "Google Cloud Build와 Cloud Run을 활용한 Docker 이미지 빌드 및 배포"
tags: [cloud, GCP, cloud run, gcloud, ]
categories: [cloud, GCP, ]
pin: true
---


### 개요


소프트웨어 개발에서 빠르고 안정적인 빌드 및 배포는 성공적인 애플리케이션 개발의 핵심입니다. Docker와 같은 컨테이너 기술은 이를 가능하게 하는 주요 도구로 자리 잡고 있습니다. 오늘은 Docker에 익숙한 개발자들이 Google Cloud Build를 사용하여 Docker 이미지를 클라우드 환경에서 빌드하고, Google Cloud Run을 통해 쉽게 배포하는 방법을 알아보겠습니다. 예제를 통해 Google Cloud Build와 Cloud Run의 기능과 장점을 직접 체험해보세요!


### Google Cloud Build와 Docker: 클라우드 기반 빌드의 이점


Google Cloud Build는 Google Cloud Platform(GCP)의 관리형 빌드 서비스로, Docker 이미지를 클라우드 환경에서 손쉽게 빌드하고 배포할 수 있게 해줍니다. 이 서비스를 사용하면 다음과 같은 이점을 얻을 수 있습니다:

- **확장성**: Google의 클라우드 인프라를 활용해 여러 빌드를 동시에 빠르게 처리할 수 있습니다.
- **일관성 있는 빌드 환경**: 모든 빌드는 Google Cloud의 관리형 환경에서 수행되므로, "로컬에서는 되는데..."라는 문제를 피할 수 있습니다.
- **자동화된 CI/CD 파이프라인**: 코드 변경 시 자동으로 빌드, 테스트, 배포까지 이어지는 자동화 파이프라인을 쉽게 설정할 수 있습니다.

### 단계별 가이드: Google Cloud Build와 Docker, Cloud Run 사용하기


이제 Docker 애플리케이션을 Google Cloud Build로 빌드하고 Cloud Run에 배포하는 전체 과정을 단계별로 살펴보겠습니다.


### 1단계: Dockerfile 작성


우선, Docker 이미지를 빌드하기 위해 `Dockerfile`을 작성합니다. 다음은 간단한 Python Flask 애플리케이션을 위한 예제 Dockerfile입니다:


{% raw %}
```text
# Python 베이스 이미지 사용
FROM python:3.9-slim

# 작업 디렉토리 설정
WORKDIR /app

# 필요 패키지 설치
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 애플리케이션 실행
CMD ["python", "app.py"]

```
{% endraw %}


이 예제에서는 Python 3.9 슬림 베이스 이미지를 사용하고, Flask 애플리케이션을 실행하기 위한 환경을 설정합니다.


### 2단계: Google Cloud Build를 사용하여 Docker 이미지 빌드 및 푸시


Google Cloud SDK가 설치되어 있다고 가정하고, 다음 명령어를 사용해 빌드를 클라우드로 제출하고 이미지를 Google Container Registry(GCR)에 푸시합니다.


{% raw %}
```shell
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/helloworld

```
{% endraw %}


이 명령어는 현재 디렉토리의 소스 코드와 `Dockerfile`을 사용하여 Docker 이미지를 빌드하고, GCR에 `helloworld`라는 이름으로 이미지를 푸시합니다. `$GOOGLE_CLOUD_PROJECT`는 현재 활성화된 Google Cloud 프로젝트의 ID를 나타내는 환경 변수입니다.


### 3단계: Google Cloud의 인증 설정


Google Cloud의 Container Registry에 저장된 이미지를 로컬 Docker에서 사용하려면 인증이 필요합니다. 다음 명령어로 Docker를 Google Cloud와 인증합니다:


{% raw %}
```shell
gcloud auth configure-docker

```
{% endraw %}


이 명령어는 Docker 클라이언트가 Google Container Registry와 통신할 수 있도록 인증 정보를 설정합니다.


### 4단계: 푸시된 이미지 확인


이미지가 GCR에 제대로 푸시되었는지 확인하려면 다음 명령어를 사용합니다:


{% raw %}
```shell
gcloud container images list

```
{% endraw %}


이 명령어는 현재 Google Cloud 프로젝트에 저장된 모든 이미지를 나열합니다. 여기서 `helloworld` 이미지가 목록에 나타나야 합니다.


### 5단계: Docker 이미지 로컬에서 실행 (선택 사항)


로컬 환경에서 이미지를 테스트하고자 한다면, 다음 명령어로 이미지를 실행해볼 수 있습니다:


{% raw %}
```shell
docker run -d -p 8080:8080 gcr.io/$GOOGLE_CLOUD_PROJECT/helloworld

```
{% endraw %}


이 명령어는 `helloworld` 이미지를 로컬에서 실행하고, 호스트의 8080 포트를 컨테이너의 8080 포트에 매핑합니다. 애플리케이션이 실행되고, 브라우저에서 `http://localhost:8080`을 열어 애플리케이션이 정상적으로 실행되는지 확인할 수 있습니다.


### 6단계: Cloud Run에 배포


이제 Google Cloud Run을 사용하여 Docker 이미지를 클라우드에 배포합니다. Cloud Run은 완전 관리형 서버리스 플랫폼으로, Docker 컨테이너를 배포하고 실행할 수 있습니다. 다음 명령어를 사용하여 Cloud Run에 배포합니다:


{% raw %}
```shell
gcloud run deploy --image gcr.io/$GOOGLE_CLOUD_PROJECT/helloworld --allow-unauthenticated --region=$LOCATION

```
{% endraw %}


여기서:

- `-image` 플래그는 배포할 Docker 이미지의 URL을 지정합니다.
- `-allow-unauthenticated` 옵션은 인증되지 않은 사용자가 이 서비스를 사용할 수 있도록 설정합니다.
- `-region` 옵션은 서비스를 배포할 Cloud Run 지역을 지정합니다. `$LOCATION` 변수에 원하는 지역(예: `us-central1`)을 설정해야 합니다.

배포 명령어를 실행하면 Google Cloud Run이 지정된 이미지로 서비스를 생성하고, 배포가 완료되면 서비스 URL을 제공합니다. 이 URL을 통해 브라우저에서 애플리케이션에 접속할 수 있습니다.


### 결론


Google Cloud Build와 Cloud Run은 Docker에 익숙한 개발자들이 클라우드에서 손쉽게 빌드하고 배포할 수 있는 강력한 도구입니다. 클라우드 기반의 일관된 빌드 환경, 확장성, 보안, 자동화된 CI/CD 파이프라인 설정 등의 이점을 통해 개발 효율성을 크게 향상시킬 수 있습니다. Docker와 함께 Google Cloud Build와 Cloud Run을 사용하여, 보다 신뢰성 있고 효율적인 빌드 및 배포 프로세스를 구축할 수 있습니다.


## Link

- [https://cloud.google.com/run/docs/building/containers?hl=ko](https://cloud.google.com/run/docs/building/containers?hl=ko)
- [https://cloud.google.com/run/docs/developing?hl=ko](https://cloud.google.com/run/docs/developing?hl=ko)
