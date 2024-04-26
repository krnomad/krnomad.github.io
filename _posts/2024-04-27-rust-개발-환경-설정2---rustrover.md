---
layout: post
date: 2024-04-27
title: "rust 개발 환경 설정2 - rustrover"
tags: [rust, ]
categories: [rust, ]
pin: true
---


# vscode 설정


vscode 설정에서 check command라고 검색하면 Rust-analyzer의 Check command를 변경할 수 있다.


최초에 다음과 같이 check로 돼 있는데,


![0](/assets/img/2024-04-27-rust-개발-환경-설정2---rustrover.md/0.png)


이것을 clippy로 변경하면 lint가 cargo check에서 cargo clippy로 변경된다.


![1](/assets/img/2024-04-27-rust-개발-환경-설정2---rustrover.md/1.png)


# Rustrover 설정


Rustrover의 최초 lint 설정은 cargo check로 돼있다. 이것을 cargo clippy로 변경하기 위해서는 다음과 같이 IDE하단부에 `Cargo Check`를 클릭 후


![2](/assets/img/2024-04-27-rust-개발-환경-설정2---rustrover.md/2.png)


External tool을 Check에서 `Clippy`로 변경해주면 된다.


![3](/assets/img/2024-04-27-rust-개발-환경-설정2---rustrover.md/3.png)


# Test


다음과 같이 code를 작성해보면


{% raw %}
```rust
fn area_of(x: i32, y: i32) -> i32 {
    return x*y;
}
```
{% endraw %}


`rust check` 사용시 문제로 report되지 않지만, `rust clippy` 사용 시 다음과 같이 warning이 출력되는 것을 확인할 수 있다.


![4](/assets/img/2024-04-27-rust-개발-환경-설정2---rustrover.md/4.png)

