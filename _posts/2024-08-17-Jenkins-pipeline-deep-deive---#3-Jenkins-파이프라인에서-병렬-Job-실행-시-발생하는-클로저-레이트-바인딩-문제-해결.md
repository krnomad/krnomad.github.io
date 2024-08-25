---
layout: post
date: 2024-08-17
title: "Jenkins pipeline deep deive - #3 Jenkins 파이프라인에서 병렬 Job 실행 시 발생하는 클로저 레이트 바인딩 문제 해결"
tags: [Jenkins, ]
categories: [Jenkins, DevOps, ]
pin: true
---


---


Jenkins 파이프라인에서 여러 Job을 병렬로 실행할 때, Groovy의 클로저(clousure)와 관련된 레이트 바인딩(late binding) 문제로 인해 의도치 않은 Job이 실행되는 경우가 있습니다. 


### 문제 상황: 병렬 실행 시 동일한 Job이 실행되는 버그


우선, `JobEntity`라는 클래스를 사용해 두 개의 Jenkins Job(A와 B)을 병렬로 실행하려는 파이프라인을 작성한다고 가정해봅시다. `JobEntity` 클래스는 간단하게 Job 이름을 저장하는 역할을 합니다.


{% raw %}
```groovy
class JobEntity {
    String job
}
```
{% endraw %}


이제 이 `JobEntity`를 활용해 병렬 Job 실행을 시도하는 코드입니다.


{% raw %}
```groovy
pipeline {
    agent any

    stages {
        stage('Parallel Jobs') {
            steps {
                script {
                    // List of JobEntity
                    List<JobEntity> jobEntities = [
                        new JobEntity(job: 'A'),
                        new JobEntity(job: 'B')
                    ]

                    // Parallel execution of jobs A and B
                    def parallelJobs = [:]

                    for (jobEntity in jobEntities) {
                        parallelJobs[jobEntity.job] = {
                            build job: jobEntity.job,
                                  wait: true,    // 각 Job의 완료를 기다림
                                  propagate: true // 각 Job의 결과를 현재 파이프라인에 반영
                        }
                    }

                    // Execute the jobs in parallel
                    parallel parallelJobs
                }
            }
        }
    }
}

```
{% endraw %}


이 코드를 실행하면, A와 B Job을 병렬로 실행하고자 했지만 두 Job 모두 B Job만 실행되는 버그가 발생할 수 있습니다.


### 문제의 원인: Groovy 클로저와 레이트 바인딩


이 문제는 Groovy의 클로저와 레이트 바인딩 특성에서 발생합니다. Groovy에서 클로저는 실행 시점에 변수를 바인딩하는데, 이를 레이트 바인딩(late binding)이라고 합니다. 위 코드에서는 `for` 루프가 실행되는 동안 `jobEntity` 변수는 계속해서 변합니다. 클로저가 실행될 때 `jobEntity`는 루프의 마지막 값(B Job)으로 바인딩되기 때문에, 두 클로저 모두 B Job을 참조하게 됩니다.


### Groovy 클로저의 레이트 바인딩 이해


Groovy에서 클로저는 함수나 메서드와 유사하게, 변수와의 연결을 실행 시점에 결정합니다. 이 특징은 클로저 내에서 외부 변수를 참조할 때 유용할 수 있지만, 반복문 내에서 클로저를 정의하고 이 클로저가 반복문의 변수를 참조할 때는 의도치 않은 결과를 초래할 수 있습니다. 특히, 반복문이 끝난 후 클로저가 실행된다면, 클로저는 항상 마지막 반복에서의 변수 값을 참조하게 됩니다.


### 해결 방법: 변수 고정(Capturing Variables)


이 문제를 해결하려면, 클로저가 사용하는 변수를 각 반복 시점에서 고정해야 합니다. 이를 위해 `jobEntity` 변수를 각 반복에서 새로운 변수로 캡처(capture)하여 클로저 내부에서 사용하도록 수정할 수 있습니다.


{% raw %}
```groovy
pipeline {
    agent any

    stages {
        stage('Parallel Jobs') {
            steps {
                script {
                    // List of JobEntity
                    List<JobEntity> jobEntities = [
                        new JobEntity(job: 'A'),
                        new JobEntity(job: 'B')
                    ]

                    // Parallel execution of jobs A and B
                    def parallelJobs = [:]

                    for (jobEntity in jobEntities) {
                        def currentJobEntity = jobEntity  // 클로저 내에서 사용할 변수를 캡처
                        parallelJobs[currentJobEntity.job] = {
                            build job: currentJobEntity.job,
                                  wait: true,    // 각 Job의 완료를 기다림
                                  propagate: true // 각 Job의 결과를 현재 파이프라인에 반영
                        }
                    }

                    // Execute the jobs in parallel
                    parallel parallelJobs
                }
            }
        }
    }
}

```
{% endraw %}


### 코드 설명

- **변수 캡처(Capturing Variables)**: `def currentJobEntity = jobEntity`를 사용하여, 반복문의 `jobEntity` 변수를 각 반복에서 고정된 값으로 설정합니다. 이 `currentJobEntity`는 클로저가 실행될 때마다 해당 반복 시점의 `jobEntity` 값을 유지하게 됩니다.
- **올바른 병렬 실행**: 이렇게 수정된 코드에서는 A와 B Job이 각각 올바르게 병렬로 실행됩니다. 각 클로저는 자신만의 고유한 `JobEntity` 값을 가지며, 이를 통해 서로 다른 Jenkins Job을 트리거할 수 있습니다.

### 결론


Jenkins 파이프라인에서 병렬 작업을 처리할 때, Groovy 클로저의 레이트 바인딩 문제로 인해 의도치 않은 동작이 발생할 수 있습니다. 이 문제를 해결하기 위해서는 클로저 내에서 변수를 사용할 때, 해당 변수를 각 반복에서 고정된 값으로 캡처하여 사용해야 합니다. 이를 통해 병렬 Job이 의도한 대로 올바르게 실행되도록 할 수 있습니다.

