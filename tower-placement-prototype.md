---
layout: post
title: "풍운지기 프로토타입 공개 - GitHub Pages에서 바로 플레이하기"
date: 2026-03-26 09:05:00 +0900
permalink: /posts/tower-placement-prototype/
categories: [game, prototype]
tags: [html5, javascript, github-pages, tower-defense]
pin: false
toc: true
comments: true
---

이번에는 슬롯 기반 영웅 배치와 웨이브 디펜스를 결합한 작은 프로토타입 **풍운지기**를 GitHub Pages에 올려 바로 플레이할 수 있게 정리했습니다.

이 페이지는 블로그 포스트처럼 읽을 수 있는 소개 페이지이고, 실제 플레이는 아래 링크에서 바로 열립니다.

> [풍운지기 바로 플레이](https://krnomad.github.io/games/tower-placement/)

## 어떤 방식으로 올렸나?

- 게임 본체는 정적 파일 그대로 `games/tower-placement/` 경로에 배치했습니다.
- 그래서 별도 서버나 빌드 단계 없이 GitHub Pages에서 바로 열립니다.
- 소개 글은 `/posts/tower-placement-prototype/` 경로로 분리해서 공유하기 쉽게 만들었습니다.

## 플레이 링크

<p>
  <a href="https://krnomad.github.io/games/tower-placement/" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#c08a3f;color:#111;text-decoration:none;font-weight:700;">
    게임 실행하기
  </a>
</p>

## 조작 방법

1. 우측 패널에서 영웅을 선택합니다.
2. 맵의 빈 슬롯을 눌러 배치합니다.
3. `▶ 시작` 버튼으로 웨이브를 시작합니다.
4. 배치된 영웅을 다시 누르면 강화하거나 매각할 수 있습니다.

## 플레이 메모

- 모바일은 가로 화면에서 가장 잘 동작합니다.
- 터치 입력 기준으로 다듬어져 있어서 휴대폰에서도 바로 테스트 가능합니다.
- 본문 안 미리보기보다 별도 페이지로 열었을 때 훨씬 쾌적합니다.

## 페이지 안에서 미리보기

<iframe
  src="/games/tower-placement/"
  title="풍운지기 프로토타입 미리보기"
  loading="lazy"
  style="width:100%;aspect-ratio:16/9;border:1px solid rgba(255,255,255,0.12);border-radius:16px;background:#0a0a15;"
></iframe>

iframe 안에서는 화면이 작게 느껴질 수 있으니, 본격적으로 플레이할 때는 위의 **게임 실행하기** 버튼을 눌러 별도 페이지로 여는 것을 추천합니다.
