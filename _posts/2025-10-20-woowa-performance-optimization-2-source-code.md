---
layout: post
title: "[우테코] Lv.4 / 성능 최적화 : 소스코드(.js) 줄이기"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/woowa-performance-optimization-2-source-code.png
---

> 요약 <br/>
> 성능 최적화를 위한 4가지 섹션 증 첫번째인 **필요한 것만 요청하기(로딩 성능 개선)**에 대한 내용을 다룹니다.<br/>
> 소스코드(.js)를 줄임으로써 로딩 성능을 개선해봅니다.

---

## 목차

- [⛳️ 로딩 성능 개선 - Part 1. 요청 크기 줄이기](#️-로딩-성능-개선---part-1-요청-크기-줄이기)
  - [1-1. 소스코드(.js) 줄이기](#1-1-소스코드js-줄이기)
    - [**✅ minify \& uglify**](#-minify--uglify)
        - [**✔️ 최소화(minify)**](#️-최소화minify)
        - [**✔️ 난독화(uglify)**](#️-난독화uglify)
    - [**✅ gzip, brotli**](#-gzip-brotli)
        - [**✔️ Gzip**](#️-gzip)
        - [**✔️ Brotli**](#️-brotli)

<br/>
<br/>

# ⛳️ 로딩 성능 개선 - Part 1. 요청 크기 줄이기

![part1](/assets/images/blog/2025-10-05-woowa-performance-optimization-1/part1.png)

<br/>

**요약**

첫 번째 목표는 요청 크기를 줄이는 것이다. <br/>
개발자 도구의 네트워크 창을 통해 각 요청을 처리하기 위한 시간을 확인할 수 있는데, 사진의 경우 hero.png의 요청 크기(시간)가 가장 오래 걸리는 것을 확인할 수 있다.

![waterfall-1](/assets/images/blog/2025-10-05-woowa-performance-optimization-1/waterfall-1.png)

![waterfall-2](/assets/images/blog/2025-10-05-woowa-performance-optimization-1/waterfall-2.png)

해당 waterfall에 마우스를 올리면 위와 같이 상세 정보를 확인할 수 있다.<br/>
주로 성능 개선을 위해선 ‘**content download**’ 시간을 줄이는 것을 목표로 한다.

<br/>

## 1-1. 소스코드(.js) 줄이기

### **✅ minify & uglify**

---

소스코드를 줄이는 대표적인 예시로 최소화(minify)와 난독화(uglify)를 들 수 있다.

##### **✔️ 최소화(minify)**

최소화(minify)란 **파일 크기를 줄여서 로딩 속도를 개선하는 것**을 의미한다.<br/>
예를 들어 불필요한 공백, 주석 등을 제거하는 것이 대표적인 예이다. 또한 사람이 읽기 쉽게 작성된 변수명을 더 짧게 바꿔 코드 크기를 줄이는 것도 minify의 한 예시가 될 수 있다. (예: variableName → a)

![minify](/assets/images/blog/2025-10-05-woowa-performance-optimization-1/minify.png)_캡션: minify 적용 전/후 빌드된 소스코드 비교_

<br/>

##### **✔️ 난독화(uglify)**

난독화(uglify)는 **코드를 사람이 읽기 어렵게 변환**하여 분석이나 복제를 어렵게 만드는 과정을 의미한다. <br/>
예를 들어, 함수명이나 변수명을 짧게 바꾸거나, 코드의 구조를 재배열하여 원래 의도를 파악하기 힘들게 만드는 것이 대표적인 예이다.

![uglify](/assets/images/blog/2025-10-05-woowa-performance-optimization-1/uglify.png)
_캡션: 난독화 적용 전/후 코드 비교_

> [UglifyJS 3 페이지](https://skalman.github.io/UglifyJS-online/)에서 코드 난독화 결과를 확인해볼 수 있다.

🔝 [목차](#목차)로 돌아가기

<br/><br/>

### **✅ gzip, brotli**

---

압축도 코드의 용량을 줄이기 위한 예시로 들 수 있다. <br/>
대표적으로는 gzip과 brotli 타입을 들 수 있다.

##### **✔️ Gzip**

Gzip은 웹에서 가장 오래되고 널리 쓰이는 압축 방식으로, 파일 크기를 줄여 전송 속도를 높이는 데 사용된다. <br/>
압축 속도가 빠르고 CPU 부담이 적어 동적 콘텐츠에 적합하다.

<br/>

##### **✔️ Brotli**

반면 Brotli는 최근에 Google에서 개발한 압축 알고리즘으로, **Gzip보다 약 15~25% 더 높은 압축률**을 제공한다. 압축 과정은 다소 느리지만, 한 번만 압축해 여러 번 전송하는 정적 파일에 효과적이다. <br/>
나의 경우 CloudFront에서 ‘Compress objects automatically’ 속성을 통해 gzip, br 타입으로 자동 압축되도록 설정했다.

<br/>

어떤 방식으로 소스코드가 압축되었는지를 알고싶다면, 네트워크 창에서 `Content-Encoding` 값을 보면 된다. <br/>
`gzip`과 `br(Brotli)` 타입으로 확인할 수 있다.

![brotli](/assets/images/blog/2025-10-05-woowa-performance-optimization-1/brotli.png)

> **요약**
>
> **Gzip(gzip)** : 처리 속도가 빠르다. 동적 응답에 효과적이다.<Br/> **Brotli(br)** : 용량 절감 효율이 높다. 정적 리소스애 효과적이다.

🔝 [목차](#목차)로 돌아가기
