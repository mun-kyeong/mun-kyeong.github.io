---
layout: post
title: "[우테코] Lv.4 / 성능 최적화 : 폰트 요청 크기 줄이기"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/woowa-performance-optimization-4-font.png
---

> 요약 <br/>
> 폰트 크기를 줄임으로써 로딩 성능을 개선해봅니다.
> 수이의 테코톡 영상도 있으니 많관부~

<br/>

---

## 목차

- [⛳️ 로딩 성능 개선 - Part 1. 요청 크기 줄이기](#️-로딩-성능-개선---part-1-요청-크기-줄이기)
  - [1-3. 웹 폰트 파일 용량 줄이기](#1-3-웹-폰트-파일-용량-줄이기)
    - [**✅ 폰트 파일 용량 줄이기**](#-폰트-파일-용량-줄이기)
        - [**✔️ WOFF 2.0 형식 폰트 사용**](#️-woff-20-형식-폰트-사용)
        - [**✔️ 서브셋(Subset) 폰트 사용**](#️-서브셋subset-폰트-사용)
    - [**✅ 텍스트가 항상 보이게 하기**](#-텍스트가-항상-보이게-하기)

<br/>
<br/>

# ⛳️ 로딩 성능 개선 - Part 1. 요청 크기 줄이기

## 1-3. 웹 폰트 파일 용량 줄이기

---

이 주제에 대해서는 수이가 발표한 테코톡 영상을 참고하면 더욱 쉽게 이해할 수 있다.<br/>

<iframe width="392" height="220" src="https://www.youtube.com/embed/3h5gD7lJqs0" frameborder="0" allowfullscreen></iframe>

<br/>
웹 폰트 최적화를 위해 시도해볼 만한 주요 방법들을 정리했다.

### **✅ 폰트 파일 용량 줄이기**

웹 폰트는 네트워크를 통해 다운로드하는 리소스이다. 따라서 **파일 용량이 크면** 폰트가 화면에 적용되기까지 시간이 오래 걸린다. <br/>
파일 용량을 줄일 수 있는 효과적인 방법은 다음과 같다.

##### **✔️ WOFF 2.0 형식 폰트 사용**

---

[눈누](https://noonnu.cc/)나 [배민 폰트](https://www.woowahan.com/fonts)를 다운받아 보면 `TTF`나 `OTF` 파일 형식을 볼 수 있다. <br/>
우리가 이렇게 흔히 사용하는 `TTF`나 `OTF`는 원본 폰트 형식이며, <br/>
주로 디자이너나 PC 시스템 폰트용으로 쓰인다.

![baemin-font](/assets/images/blog/2025-10-21-woowa-performance-optimization-4-font/baemin-font.png){: width="400" .mx-auto .d-block }

<br/>

이를 웹용으로 압축한 포맷이 `WOFF`와 `WOFF2`이다. <br/>
이 중에서 `WOFF2`가 가장 최신 압축 포맷으로, `WOFF`보다 용량이 작다.

![woff2](/assets/images/blog/2025-10-21-woowa-performance-optimization-4-font/woff2.png){: width="400" .mx-auto .d-block }

 <br/>

`WOFF2`형식은 IE(Internet Explorer)를 제외한 대부분의 최신 브라우저에서 지원된다.

<br/>

##### **✔️ 서브셋(Subset) 폰트 사용**

---

서브셋 폰트는 폰트 파일에서 불필요한 글자를 제거하고, **사용할 글자만 남겨둔** 폰트를 말한다.

예를들어, 아래 이미지의 노란색으로 표시된 글자처럼 실생활에서 거의 쓰이지 않는 글자들을 제거하는 방식이다. <br/>
자주 사용하는 글자만 포함하므로 폰트 용량을 획기적으로 줄일 수 있다.

![subset-font](/assets/images/blog/2025-10-21-woowa-performance-optimization-4-font/subset-font.png)

![result](/assets/images/blog/2025-10-21-woowa-performance-optimization-4-font/result.png)

<br/>

🔝 [목차](#목차)로 돌아가기

<br/><br/>

### **✅ 텍스트가 항상 보이게 하기**

브라우저는 웹 폰트가 다운로드되기 전까지 해당 텍스트의 렌더링을 차단한다.<br/>
아래 이미지처럼 "Not"이라는 글자가 보이지 않는 현상이 바로 이 때문이다.

![not-font](/assets/images/blog/2025-10-21-woowa-performance-optimization-4-font/not-font.png)

이때 브라우저의 렌더링 방식은 크게 FOUT와 FOIN으로 나뉜다.

- **FOUT (Flash of Unstyled Text)**

  - 웹 폰트가 로딩되기 전, 우선 **폴백 폰트(기본 폰트)**로 텍스트를 보여주고, 로딩이 완료되면 웹 폰트로 '교체'하는 방식이다.
  - ![fout](/assets/images/blog/2025-10-21-woowa-performance-optimization-4-font/fout.png)

- **FOIN (Flash of Invisible Text)**

  - 웹 폰트가 로딩될 때까지 텍스트를 아예 **보여주지 않다가**(투명 처리), 로딩이 완료되면 텍스트를 보여주는 방식이다.
  - ![foit](/assets/images/blog/2025-10-21-woowa-performance-optimization-4-font/foit.png)

사용자가 콘텐츠를 바로 볼 수 있게 하려면, **FOUT** 방식처럼 일단 기본 폰트를 먼저 보여주는 것이 좋다. <br/>
CSS에서 `font-display: swap;` 속성을 적용하면,<br/>
브라우저가 FOIN 대신 FOUT 방식으로 폰트를 처리하도록 간단히 설정할 수 있다.

🔝 [목차](#목차)로 돌아가기

> **참고 자료** <br/> > [Naver D2 - 웹 폰트 사용과 최적화의 최근 동향](https://d2.naver.com/helloworld/4969726)
