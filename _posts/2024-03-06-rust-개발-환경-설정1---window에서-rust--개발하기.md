---
layout: post
date: 2024-03-06
title: "rust 개발 환경 설정1 - window에서 rust  개발하기"
tags: [rust, ]
categories: [rust, ]
pin: true
---

1. Rust 설치하기
Rust를 설치하려면 [여기](https://www.rust-lang.org/tools/install)에서 rustup 설치 스크립트를 다운로드하세요. 자신의 운영 체제에 맞는 것을 선택하여 실행하세요. Visual Studio가 설치되어 있지 않다면 [여기](https://visualstudio.microsoft.com/ko/downloads/)에서 Visual Studio용 Build Tools를 설치하세요.
2. Rust 및 Cargo 버전 확인하기
설치가 완료되면 터미널에서 다음 명령어를 입력하여 Rust와 Cargo 버전을 확인하세요:
undefined3. 툴체인 설정하기
기본 툴체인이 gnu로 설정되어 있다면 msvc로 변경해야 합니다:
undefined4. 프로젝트 생성 및 VS Code에서 열기
새로운 Rust 프로젝트를 만들고 VS Code에서 해당 프로젝트 폴더를 엽니다:
undefined5. 확장 프로그램 설치하기
VS Code에서 확장 프로그램을 설치하세요. Ctrl + Shift + P를 눌러 Command Palette를 열고 다음 명령어들을 입력하여 설치하세요:
undefined6. VS Code 재시작하기
VS Code를 다시 시작하세요. 오른쪽 아래에 rust-analyzer를 설치할 것인지 묻는 알림이 뜰 것입니다. "Download now"를 눌러 설치하세요.
7. rust-analyzer 설정하기
rust-analyzer를 설정하기 위해 settings.json 파일에 다음 문장을 붙여 넣고 다시 VS Code를 리로드하세요:
undefined8. 코드 확인하기
main.rs 파일을 다음 코드로 바꾸고 println!()에 커서를 올려 설명이 잘 나오는지 확인하세요
undefined
이제 Rust 개발 환경이 VS Code에서 준비되었습니다! 🦀

