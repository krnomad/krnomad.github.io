---
layout: post
date: 2024-08-17
title: "Jenkins pipeline deep deive - #1 "
tags: [Jenkins, ]
categories: [Jenkins, DevOps, ]
pin: true
---


Jenkins pipeline script는 jvm 방언 중 하나인groovy로 작성하지만, 일반적인 프로그래밍 언어와 다르게 CPS tranform이라는 과정을 거쳐 스크립트가 jenkins위에서 동작하게 된다. 


NonCPS annotation을 통해 CPS transform을 배제시킬 수 있는데, 처음 코드를 작성하다 보면 어떤 경우에 NonCPS를 사용하는지 알기가 힘들다.
NonCPS를 사용하는 큰 이유 중 하나는 성능에 민만한 코드를 실행시킬 경우 이다.


[https://github.com/cloudbees/groovy-cps/blob/master/lib/src/main/java/com/cloudbees/groovy/cps/NonCPS.java](https://github.com/cloudbees/groovy-cps/blob/master/lib/src/main/java/com/cloudbees/groovy/cps/NonCPS.java)


{% raw %}
```text
 * Useful for performance sensitive code or where you need to call into libraries and pass in closures
 * that cannot be CPS-transformed.

```
{% endraw %}


아래에서 CPS, NonCPS 성능이 어느정도 차이가 나는지 비교해 보고 NonCPS를 사용함에도 성능 문제를 만드는 anti pattern에 대해 살펴본다.


# CPS와 NonCPS 성능 비교


CPS와 NonCPS는 큰 성능 차이가 있는데 CPS의 경우 모든 상태를 serialize하기 하면서 동작하기 때문에 일반적인 프로그래밍 언어와 같은 최적화가 진행되지 않는다.
아래와 같이 10만 번의 iteration이 있는 코드를 통해 얼마나 성능 차이가 있는지 살펴보자


{% raw %}
```text
  int a=0
  for( int i=0; i<100000; i++) {
    if( i%1000 == 0 ) {
      a += i
    }
  }

  println("a=>$a")

```
{% endraw %}


아래는 성능 테스트를 위한 jenkins pipeline script이다.


{% raw %}
```text

long currentTime

@NonCPS
def nonCPSForLoop() {
  int a=0
  for( int i=0; i<100000; i++) {
    if( i%1000 == 0 ) {
      a += i
    }
  }

  println("a=>$a")
}

def CPSForLoop() {
  int a=0
  for( int i=0; i<100000; i++) {
    if( i%1000 == 0 ) {
      a += i
    }
  }

  println("a=>$a")
}

node {
  stage('CPS') {
    currentTime = System.currentTimeMillis()
    CPSForLoop()
    println("CPS Elapse => ${System.currentTimeMillis() - currentTime}")
  }

  stage('NonCPS') {
    currentTime = System.currentTimeMillis()
    nonCPSForLoop()
    println("NonCPS Elapse => ${System.currentTimeMillis() - currentTime}")
  }
}

```
{% endraw %}


결과


{% raw %}
```text
a=>4950000
CPS Elapse => 8311

a=>4950000
NonCPS Elapse => 326

```
{% endraw %}


10만번의 연산을 하는데 CPS는 8.3초 NonCPS 0.3초가 걸리는 것을 확인할 수 있다. _NonCPS가 CPS보다 약 25배 정도 빠르게 연산하는 것을 확인할 수 있다._`NonCPS`를 통해 CPS transform을 배제 시키면 serialize를 고려하지 않고 program.dat에도 상태값을 update하지 않기 때문에 엄청나게 큰 성능 차이가 나타나는 것을 확인할 수 있다. (실제 program.dat는 filesystem에 저장하기 때문에 비용이 큰 IO를 생략하는 것을 볼 수 있다.)


# NonCPS에서 성능 이슈 만들기


위 예에서 forLoop의 내용을 아래와 같이 변경해 보자


{% raw %}
```text
@NonCPS
def nonCPSForLoop() {
  int a=0
  for( int i=0; i<100000; i++) {
    if( i%1000 == 0 ) {
      a += i
      println("a=>$a")
    }
  }
}

```
{% endraw %}


NonCPS임에도 37초나 걸리 것을 확인할 수 있다. (100배 이상 성능에 차이가 난다)


`println(”a⇒$a”)`라는 구문이 iteration에 추가됐고, 실제 for-loop는 `i%1000`에 의해 적게 실행함(100번)에도 불구하고, 훨씬 더 많은 시간이 소요된다. 


{% raw %}
```text
a=>4950000
NonCPS Elapse => 37475

```
{% endraw %}


결론적으로 100번에 로그를 출력했을 뿐인데, for loop에서 로그를 출력하는 것이 큰 성능 저하를 만드는 것을 확인할 수 있다. 


# 결론

- 성능이 민감한 코드를 실행할 경우 NonCPS 사용을 고려하자
- NonCPS든 CPS든 for loop안에서 log를 출력하는 것은 삼가하자
