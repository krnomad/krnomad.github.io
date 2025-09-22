---
layout: post
date: 2024-08-17
title: "Jenkins pipeline deep deive - #2 Jenkins slave 깊게 파보기"
tags: [Jenkins, ]
categories: [Jenkins, DevOps, ]
pin: true
---


## Jenkins master slave 구조


Jenkins를 처음 설정하고 Jenkins job을 실행하면 Jenkins가 설치된 서버위에서 job이 실행된다.Jenkins가 설치된 PC를 master node 혹은 built-node라고 Jenkins가 설치된 서버 이외의 다른 server(node)를 slave라고 부른다.


Jenkins는 여러 서버에서 빌드 또는 작업을 실행하는 데 도움이 되는 마스터-슬레이브 기능을 제공한다.


Jenkins slave 노드를 사용하기 위해서는 master노드에 slave노드의 연결 정보를 입력시켜야 한다.Jenkins는 job이 실행될 때 등록된 slave node 위에서 실행되게 만든다.


![0](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/0.png)


## Jenkins slave를 설치하는 여러가지 방법


Jenkins에 slave를 등록시키는 과정은 다음과 같다.1. Jenkins 설치2. Jenkins slave를 Linux 혹은 Windows에 설치3. Jenkins 마스터에 새 슬레이브 노드 추가


Jenkins 최초 설치 후


jenkins 관리 -> Node관리에 들어가보면, 다음과 같이 1대의 사용가능한 node가 존재하다는 것을 볼 수 있다.


[http://localhost:8080/manage/computer/](http://localhost:8080/manage/computer/)


![1](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/1.png)


Jenkins에 등록된 node들은 이 Node management page에 보이게 되는데, 가장 쉽게는 신규 노드라는 메뉴 버튼을 통해 Jenkins slave 노드를 등록할 수 있다.


![2](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/2.png)


아래 실습 환경을 통해 어떻게 Master에 slave 노드를 추가할 수있는지 자세히 살펴 보도록 하겠다.


### 실습 환경 구성


윈도우에 docker를 설치하고 jenkins(Jenkins controller) container 1개를 실행 시킨다.slave로 사용할 ubuntu 이미지는 java가 실행가능해야 하기 때문에 openjdk 11를 설치돼 있고, openssh server가 설치돼 있어 ssh로 접속이 가능해야 한다. curl 명령도 실행돼야 하므로 curl pacakage도 ubuntu image에 설치돼 있어야 한다.

- 실습 ubuntu image
undefined
slave 노드로 사용할 ubuntu container 3개를 띄운다. slave는 각각 host network 8023, 8025, 8026 port를 22번 포트로 연결시켜 hostIP:port로 ssh로 접속이 가능하게 설정돼 있다.


![3](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/3.png)


![4](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/4.png)


**주의 사항**


Jenkins controller의 접속 URL을 Jenkins 설정을 통해 update해줘야 한다.


Jenkins controller의 node 추가 메뉴로 부터 생성되는 command는 Jenkins의 환경 변수를 참조해 생성된다.


특히 Jenkins 접속 URL의 설정이 많은 곳에서 사용되는데, 접속 URL은 기본적으로


{% raw %}
```text
http://localhost:8080
```
{% endraw %}


으로 설정돼 있다. 이 값은 local 환경에서만 유효하므로 다른 server로 부터 Jenkins controller로 접속할 수 있게 하기 위해 접속 URL 설정을 변경해 줘야 한다. (Jenkins -> Jenkins 관리 -> 시스템 설정 -> Jenkins Location)


![5](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/5.png)


Jenkins controller는 기본적으로 50000번 port를 항상 listen 상태로 두어 agent가 접속 설정할 수 있도록 port를 열어 두는데(TCP), 이때 Jenkins 접속 URL의 환경변수가 사용된다. 이러한 이유로 slave node가 해당 접속 URL을 통해 접다이 불가능할 경우 에러가 발생해 connection이 이뤄지지 않는다. (WebSocket을 통한 연결 설정시 50000포트는 사용되지 않는다)


{% raw %}
```text
INFO: Agent discovery successful
  Agent address: 192.168.1.152
  Agent port:    50000
  Identity:      03:c8:f0:8b:89:80:21:90:82:55:62:97:ab:51:a1:64
```
{% endraw %}


### agent.jar


Jenkins contoller는 jnlp, ssh 등과 같은 프로토콜을 이용해 slave와 통신할 수 있다.Jenkins가 slave 노드를 연결할 때는 agent.jar라는 파일을 이용한다. 이 agent파일을 시작시키는 방법을 Launch method라고 하며, Jenkins는 3가지 Launch mode를 제공한다.


Jenkins 관리 -> 노드 관리 -> 신규 노드 메뉴를 통해 node를 추가할 때 아래와 같이 3가지 Launch method중 하나를 선택할 수 있다.


![6](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/6.png)


Jenkins와 slave간 연결을 크게 두가지로 나누어 보면, Jenkins contoller가 직접 agent파일을 실행시키는 방식과 slave에서 직접 agent파일을 실행시켜 contoller와 연결하는 방식(jnlp inbound)으로 나눌 수 있다.


### Launch agent by connecting it to the controller (jnlp 사용)


slave에서 agent를 실행시켜 Jenkins controller와 연결하는 모드이다.실제 production 환경에서 가장 많이 사용되는 옵션으로 에이전트가 준비될 때마다 Jenkins 컨트롤러에 연결할 수 있게 할 수 있다.


agent와 컨트롤러는 TCP로 연결을 설정하고, 이때 50000번 포트가 사용된다. 그러므로 agent를 실행시키는 slave node입장에서 jenkins controller의 IP + 50000번 포트가 허용돼야 한다. Configure Global Security 메뉴를 통해 agent연결을 listen하는 port 변경도 가능하다.


![7](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/7.png)


agent -> Jenkins controller로 TCP연결만 가능하면 되므로 Jenkins controller -> slave로 네트워크 연결이 허용되지 않더라도 사용이 가능하다.web socket을 이용해 agent 연결도 가능한데, 이 경우 TCP 50000번 포트가 open되지 않더라도 사용이 가능하다.


이 launch method를 통해 신규 노드 설정을 완료하면 아래와 같은 command를 slave agent에서 실행하라는 메세지가 출력된다.Node와 연결은 slave 노드에서 아래 명령을 실행시키기 전까지는 오프라인 상태로 표시되며, 아래 명령을 실행시킨 이후에는 온라인 상태로 변경된다.


{% raw %}
```text
curl -sO http://192.168.1.152:8080/jnlpJars/agent.jar
java -jar agent.jar -jnlpUrl http://192.168.1.152:8080/computer/slave1/jenkins-agent.jnlp -secret XXXXX -workDir "/home/jwkang2"
```
{% endraw %}


이렇게 연결된 agent는 jnlp(Java Network Launch Protocol)를 통해 agent로 명령이 실행된다.


{% raw %}
```text
Inbound agent connected from 172.17.0.1/172.17.0.1:37130
Remoting version: 3046.v38db_38a_b_7a_86
Launcher: JNLPLauncher
Communication Protocol: JNLP4-connect
This is a Unix agent
Agent successfully connected and online
```
{% endraw %}


참고로 container 오케스트레이션 환경(kubernetes, docker swarm 등)에서는 slave agent가 동적으로 생성되고 제거돼야 하는데, 이때 Jenkins controller는 이 luanch method를 사용해 Node를 생성하고, container가 동작 할 때 agent command를 실행시켜 동적으로 slave node를 생성하게 된다.


### Launch agent via execution of command on the controller


Jenkins controller에 특정 명령을 실행시켜 slave 시스템에서 agent를 원격으로 실행시킬 수 있을 때 옵션이다.앞서 설명한 method는 TCP+50000포트 또는 web socket을 이용해 slave node -> Jenkins controller로 연결을 했던 반면에, 이 모드는 Jenkins controller -> slave node로 연결하는 모드이다.


Jenkins contoroller 위에서 ssh명령을 실행 시켜 slave에 agent.jar를 실행시키는 예로 살펴보면,다음과 같이 설정할 수 있을 것이다.


![8](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/8.png)


ssh로 slave 접속시 암호를 입력하지 않고 사용하기 위해 jenkins contoller가 갖는 public key를 slave에 등록시켜야 위 설정으로 slave 등록이 가능하다.


{% raw %}
```text
$ ssh-copy-id -i ~/.ssh/id_rsa.pub -p 8025 jwkang2@192.168.1.152
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/var/jenkins_home/.ssh/id_rsa.pub"
The authenticity of host '[192.168.1.152]:8025 ([192.168.1.152]:8025)' can't be established.
ECDSA key fingerprint is SHA256:YtTfuoRRR5qStSVA5UuznGamA/dvf+djbIT6Y48IYD0.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
jwkang2@192.168.1.152's password:

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh -p '8025' 'jwkang2@192.168.1.152'"
and check to make sure that only the key(s) you wanted were added.

$ ssh jwkang2@192.168.1.152 -p 8025
jwkang2@5448ef6a9075:~$
```
{% endraw %}


slave node에는 미리 agent.jar를 미리 다운시켜 놔야하는데, 참고로 Jenkins controller가 배포될 때 아래 주소에 agent.jar도 함께 배포된다.[http://${jenkins접속IP}:8080/jnlpJars/agent.jar](/)


Jenkins contoller가 성공적으로 아래 명령을 실행하게 되면, Jenkins는 아 channel을 통해 remote agent에 명령들을 실행시킬 수 있다.


{% raw %}
```text
ssh jwkang2@192.168.1.152 -p 8025 java -jar ~/bin/agent.jar
[09/18/22 16:08:06] Launching agent
$ ssh jwkang2@192.168.1.152 -p 8025 java -jar ~/bin/agent.jar
<===[JENKINS REMOTING CAPACITY]===>channel started
Remoting version: 3046.v38db_38a_b_7a_86
Launcher: CommandLauncher
Communication Protocol: Standard in/out
This is a Unix agent
```
{% endraw %}


### Launch agents via SSH


jenkins contoller로 부터 SSH를 통해 command를 전달시켜 slave agent를 등록시키는 메뉴이다. 이를 사용하기 위해서는 에이전트는 Jenkins 컨트롤러에 연결할 수 있어야 하며 slave 시스템에 로그인할 수 있는 계정정보가 제공돼야 한다.


![9](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/9.png)


이 메뉴를 통하면 Jenkins controller는 SSH를 통해 `remoting.jar`파일을 slave에 전달 시킨다.이후 `java -jar remoting.jar`를 실행 시켜 slave는 server와 연결된다.이후 Jenkins controller로 부터 agent로의 명령은 SSH를 사용해 전달된다.


{% raw %}
```text
<===[JENKINS REMOTING CAPACITY]===>channel started
Remoting version: 3046.v38db_38a_b_7a_86
Launcher: SSHLauncher
Communication Protocol: Standard in/out
This is a Unix agent
WARNING: An illegal reflective access operation has occurred
WARNING: Illegal reflective access by jenkins.slaves.StandardOutputSwapper$ChannelSwapper to constructor java.io.FileDescriptor(int)
WARNING: Please consider reporting this to the maintainers of jenkins.slaves.StandardOutputSwapper$ChannelSwapper
WARNING: Use --illegal-access=warn to enable warnings of further illegal reflective access operations
WARNING: All illegal access operations will be denied in a future release
Evacuated stdout
Agent successfully connected and online
```
{% endraw %}


위 3 launch method를 이용해 각각 slave1, slave2, slave3을 설정했고, 최종적으로 jenkins contoller에서 모두 online 상태로 보이는 것을 확인할 수 있다.


![10](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/10.png)


![11](/assets/img/2024-08-17-Jenkins-pipeline-deep-deive---#2-Jenkins-slave-깊게-파보기.md/11.png)


## jnlp-slave


JNLP(Java Network Launch Protocol)를 사용하면 원격 서버(slave node)에서 호스팅되는 리소스를 사용하여 클라이언트 데스크톱(jenkins controller)에서 애플리케이션을 시작할 수 있게 한다.


jenkins slave연결 방법 중 첫번째로 설명한 "Launch agent by connecting it to the controller (jnlp 사용)" 방식을 다시 살펴보면,1. slave가 될 노드에서 jenkins controller로으 50000 포트(TCP) 혹은 web socket을 통한 연결이 가능해야 하고2. agent.jar 파일이 필요하며3. slave와 master는 jnlp를 사용해 명령이 전달된다.


[https://hub.docker.com/r/jenkins/jnlp-slave](https://hub.docker.com/r/jenkins/jnlp-slave) 와 같은 docker 이미지는 agent.jar와 java 실행환경을 미리 컨테이너화 시키고, secret과 agent name을 param으로 받아 실행할 수 있게 하는 구조이다.


{% raw %}
```text
docker run --init jenkins/inbound-agent -url http://jenkins-server:port <secret> <agent name>
```
{% endraw %}


여기서 tocken은 node를 "Launch agent by connecting it to the controller" method로 설정한 후 확인이 가능하다.docker-swarm plugin, kubenernetes plugin등과 같이 container 오케스트레이션 툴 위에서 slave node를 동작시키는 경우 plugin은 이 mthod로 node를 설정한 후 agent cotainer가 실행되는 시점에 online이 되게 된다.이렇게 연결된 slave agent는 앞서 설명한대로 jnlp를 이용해 jenkins로 부터 명령을 전달받아 slave 위에서 실행할 수 있게 된다.


{% raw %}
```text
INFO: Remoting server accepts the following protocols: [JNLP4-connect, Ping]
Sep 18, 2022 5:15:53 PM hudson.remoting.jnlp.Main$CuiListener status
INFO: Agent discovery successful
  Agent address: 192.168.1.152
  Agent port:    50000
  Identity:      03:c8:f0:8b:89:80:21:90:82:55:62:97:ab:51:a1:64
```
{% endraw %}


컨테이너 오케스트레이션을 사용하는 Production jenkins환경에서는 기본적으로 이러한 jnlp를 사용하는 agnet 방식을 사용해 slave를 기동시킨다. 이러한 이유로 보통 remote agent를 지칭할 때 jnlp-slave대신 jnlp라는 용어로도 많이 사용된다.


## Link

- [https://www.jenkins.io/projects/remoting/](https://www.jenkins.io/projects/remoting/)
- [https://docs.cloudbees.com/docs/cloudbees-ci/latest/cloud-setup-guide/configure-ports-jnlp-agents](https://docs.cloudbees.com/docs/cloudbees-ci/latest/cloud-setup-guide/configure-ports-jnlp-agents)
