---
layout: post
date: 2024-08-17
title: "Jenkins pipeline deep deive - #4 "
tags: [Jenkins, ]
categories: [Jenkins, DevOps, ]
pin: true
---


기본적으로 Jenkins DSL에서 로그를 출력할 때는 `sh`, `echo`, `println`을 많이 사용한다. 이 3개의 함수는 DSL에 정의된 함수로 이중 println은 DSL에도 정의돼 있지만, System.out.println으로 사전에 정의된 함수이기도 하다.


만약 DSL에 정의된 println이 아니라 System.out.println을 사용하게 되면 log가 jenkins console log에 출력되지 앟는다.


아래에서는 jenkins console로그가 어떻게 출력되는지를 분석해보면서 어떤 경우 jenkins에서 log가 제대로 출력되지 않는지를 분석해 보았다.


# jenkins DSL println


Jenkins에 표시되는 console log의 경우 내부적으로는 **file에 로그를 기록하고 이렇게 기록된 내용이 보이게 되는 구조**이다.


어떻게 println을 통해 file에 로그를 기록하는지 살펴보자.println 함수는 `System.out.println`으로 System.out은 `PrintStream`객체가 담겨져 있다.아래와 같이 PrintStream에 file path를 지정하고 out을 설정하면 이후 println은 화면 대신 파일로 output이 출력된다.


{% raw %}
```text
      PrintStream stream = new PrintStream(file);
      System.out.println("From now on "+file.getAbsolutePath()+" will be your console");
      System.setOut(stream);
      //Printing values to file
      System.out.println("Hello, how are you");
```
{% endraw %}


Jenkins groovy DSL에서는 println함수가 DSL로 선언돼 있고, 실제로는 아래와 같은 함수가 호출된다.


{% raw %}
```text
getListener().getLogger().println
```
{% endraw %}


여기서 `getLogger()`는 다음과 같이 PrintStream 객체를 return해주고, `getLogger`의 구현체에서 PrintStream 객체를 생성할 때 특정 파일의 이름을 param으로 전달하게 된다.


{% raw %}
```text
@NonNull
    PrintStream getLogger();
```
{% endraw %}


이를 통해 화면(tty)대신 file로 출력하게 함으로서 Jenkins에서는 해당 file을 읽어 client에 전달해 web browser에서 log가 출력되된다.


쉽게 이해해 보면, jenkins groovy DSL에서 로그를 출력하게 하기 위해서 **java의 println을 그대로 사용하지 않고** DSL에서 **새롭게 정의된 println**을 사용한다.


# Log가 출력되지 않는예


예를 들어 다음과 같이 pipeline 코드를 작성했을 때,


{% raw %}
```text
class TestClass {
	void hello() {
        println("hello world")
    }
}

def test = new TestClass()
test.hello()
```
{% endraw %}


log가 jenkins console log로 출력되지 않는다.


{% raw %}
```text
[Pipeline] Start of Pipeline
[Pipeline] End of Pipeline
Finished: SUCCESS
```
{% endraw %}


그러면 `hello world`라는 String은 어디에 출력됐을까?기본적으로 pipeline에 작성되는 모든 groovy script는 Jenkins controller가 동작하는 환경 위해서 실행되기 때문에, 해당 log는 jenkins contoller application의 log에 출력된다.아래는 위 코드를 실행 시켰을 때 jenkins service의 실제 로그이다.


{% raw %}
```text
hello world
2022-10-01 14:40:06.687+0000 [id=179]   INFO    o.j.p.workflow.job.WorkflowRun#finish: simple_ci_example #8 completed: SUCCESS
```
{% endraw %}


# 실패 없이 println으로 로그 출력 방법


앞서 설명한 대로 `System.out.println`이 아니라 DSL에서 제공된 `println`이 사용되게 만들면 된다.모든 pipeline 코드는 Runtime시 WorkflowScript라고 하는 자동으로 생성되는 class를 통해 실행된다. WorkflowScript를 통해 실행되는 println은 기본적으로 DSL이기 때문에 항상 jenkins console log에 로그가 출력된다.


# println을 호출했음에도 로그가 출력되지 않는 경우


`DSL`에서 제공하는 `println`이 아니라, 일반 println함수를 호출하는 경우 로그가 출력되지 않는다.


만약 script에서 클래스를 선언하고 그 안에서 일반 println을 실행할 경우 Jenkins controller가 동작하고 있는 jvm의 터미널로 해당 내용이 출력된다.


다음의 예를 통해 해당 내용을 이해해보면,


{% raw %}
```text
void log(String s) {
    println(s)
}

class C {
    public void log(String s) {
        println(s)
    }
}

class S {
    private static S gInstance
    static void init() {
        S.gInstance = new S()
    }

    public static void log(String s) {
        gInstance.println(s)
    }
}

C c = new C()
S.init()

node {
    stage('tty test') {
        log("1") 	// jenkins console 로그로 호출 됨
        c.log("2")  // jenkins controller가 동작하고 있는 JVM환경에서 console 로그로 출력됨
        S.log("3")	// jenkins controller가 동작하고 있는 JVM환경에서 console 로그로 출력됨
    }
}
```
{% endraw %}


**위 실행에서 Jenkins console로그에는 1만 출력된다.**


Jenkins pipeline은 DSL(Domain specific Language)를 이용해 Jenkins 환경에서 실행할 수 있는 특정 함수를 사용가능하게 만드는데, 위 예에서 node, stage라는 예약어는 일반 groovy에 존재하지 않는 Jenkins DSL이다.이러한 이유로 pipelin code가 jenkins pipeline에서 실행 가능하게 하기 위해서 일반 groovy code로 변경이 필요하고 이렇게 일반 groovy code로 변경하는 과정을 CPS transform이라고 한다.


Pipeline 코드는 CPS변경에 의해 WorkflowScript라고 하는 클래스로 변경되고, Jenkins contoller는 WokrflowRun이라는 대리자를 통해 WorkflowScript를 실행한다.


위 예에서 `log(String s)`는 WorkflowScript 내부 method로 이해하면 되고, WorkflowScript가 가지는 println함수의 출력 스트림은 파일로 재정의 돼 있으므로 console창에 `1`이라는 string 출력이 가능해 진다.


하지만, `2`, `3`과 같은 string 출력의 경우 WorksflowScript가 아닌 custom class(`class S`, `class C`)의 method이므로 println이 갖는 기본 output인 tty로 문자가 출력된다. (Jenkins controller가 동작하고 있는 JVM환경에서 console로그)JVM환경에서 console 로그는 Jenkins service의 log를 뜻하며 다음 명령어로 출력할 수 있다.(Docker로 jenkins를 동작시킬 경우 docker logs 명령으로 Jenkins container의 로그를 출력하면 같은 결과를 확인할 수 있다)


{% raw %}
```text
sudo journalctl -xeu jenkins.service
 9월 17 10:43:18 jwkang2-ThinkCentre-M70t jenkins[1137]: 2
 9월 17 10:43:18 jwkang2-ThinkCentre-M70t jenkins[1137]: 3
```
{% endraw %}


위 예에서 `Class C`, `Class S`가 갖는 method에서 log를 JVM console이 아닌 Jenkins console로 출력하려면 어떻게 해야할까? 다음은 위 예를 수정한 코드이다. Pipeline 코드는 WorkflowScript로 변경되기 때문에 WorkflowScript의 instance는 `this`를 통해 얻어올 수 있다. 이렇게 얻어온 객체(`this`)를 각 class의 member변수로 저장하고 이를 사용하게 되면 custom class에서도 println을 통해 로그를 jenkins colsole log로 출력할 수 있다.


{% raw %}
```text
void log(String s) {
    println(s)
}

class C {
    def script
    public C(def script) {
        this.script = script
    }
    public void log(String s) {
        script.println(s)
    }
}

class S {
    private static S gInstance
    private static def script

    static void init(def script) {
        this.script = script
        S.gInstance = new S()
    }

    public static void log(String s) {
        gInstance.script.println(s)
    }
}

void proxyCall(Closure c) {
    c.call()
}

def script = this
C c = new C(script) // or new C(this)
S.init(this) // or S.init(script)

node {
    stage('tty test') {
        log("1")
        c.log("2")
        S.log("3")
    }
}
```
{% endraw %}


# Jenkins Logger class 만들기


위 내용을 바탕으로 Jenkins Logger를 만든 예이다. (logger를 호출하는 함수가 CPS/NonCPS인지 관계 없이 사용이 가능하다)


{% raw %}
```text
class TestClass {
	@NonCPS
    void hello() {
        Logger.info("hello world")
    }
}

class Logger {
    private static def workflowScript = null

    static void init(def workflowScript) {
        this.workflowScript = workflowScript
    }

    @NonCPS
    static void info(String message) {
        if ( workflowScript ) {
            workflowScript.println("INFO: " + message);
        } else {
            println("INFO: " + message)
        }
    }
}

Logger.init(this)
def test = new TestClass()
test.hello()
```
{% endraw %}

