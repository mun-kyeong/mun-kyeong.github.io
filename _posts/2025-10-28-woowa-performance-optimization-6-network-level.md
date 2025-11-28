---
layout: post
title: "[우테코] Lv.4 / 성능 최적화 : 요청 우선순위를 조정하자"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/woowa-performance-optimization-6-network-level.png
---

> 요약 <br/>
> 로딩 성능 개선 중 **요청 우선순위 조절**에 대한 내용을 다룹니다.
> 자원을 미리 받아오기 위한 `preload`, `prefetch`, `preconnect`와 자원을 나중으로 미루기 위한 `defer`,`async`를 다룹니다.

<br/>

---

## 목차

- [⛳️ 로딩 성능 개선 - Part 2. 필요한 것만 필요한 때에 요청하기](#️-로딩-성능-개선---part-2-필요한-것만-필요한-때에-요청하기)
- [2-2. 요청 우선순위 조절하기](#2-2-요청-우선순위-조절하기)
  - [✅ 중요한 리소스 미리 가져오기 (preload, prefetch, preconnect)](#-중요한-리소스-미리-가져오기-preload-prefetch-preconnect)
    - [**`preload`**](#preload)
    - [**`prefetch`**](#prefetch)
    - [**`preconnect`**](#preconnect)
  - [✅ 중요도 낮은 리소스 미루기 (defer, async)](#-중요도-낮은-리소스-미루기-defer-async)
    - [기본 `<script>` 태그의 문제점](#기본-script-태그의-문제점)
    - [질문 1 ) JS는 싱글 스레드인데, 어떻게 HTML 파싱과 JS 다운로드가 동시에 가능한가요](#질문-1--js는-싱글-스레드인데-어떻게-html-파싱과-js-다운로드가-동시에-가능한가요)
    - [`defer`](#defer)
    - [`async`](#async)
    - [질문 2) JS가 HTML을 변경할 수 있는데, `defer`와 `async`는 왜 안전한가요?](#질문-2-js가-html을-변경할-수-있는데-defer와-async는-왜-안전한가요)

<br/>
<br/>

# ⛳️ 로딩 성능 개선 - Part 2. 필요한 것만 필요한 때에 요청하기

지난 포스팅에서는 애플리케이션 '내부'의 코드 레벨 성능 최적화 방법을 알아봤다.<br/>
이번에는 시야를 조금 더 넓혀, 우리 코드가 사용자에게 전달되는 '과정' 자체를 최적화하는 **네트워크 레벨의 성능 최적화 방법**을 다룰 예정이다.

<br/>

# 2-2. 요청 우선순위 조절하기

---

'필요한 때에만 요청하기'의 두 번째 핵심 전략은 바로 **'요청 우선순위 조정'**이다. 웹 페이지를 구성하는 모든 리소스가 같은 중요도를 갖지는 않는다.

- **지금 당장 필요한 리소스**: `preload` 방식을 사용해 "이것부터 빨리 가져와!"라고 알려준다.
- **나중에 필요한 리소스**: `defer`나 `async` 방식을 사용해 "이건 천천히 가져와도 돼"라고 우선순위를 미룬다.

이렇게 브라우저에게 리소스 간의 우선순위 **'힌트(Hint)'**를 주면, 브라우저는 더 효율적으로 리소스를 불러올 수 있다.

<br/>

## ✅ 중요한 리소스 미리 가져오기 (preload, prefetch, preconnect)

---

브라우저에게 "이 리소스는 중요하니 미리 준비해줘!"라고 알리는 방법이다.

### **`preload`**

---

```tsx
<link rel="preload" href="/style.css" as="style" />
<link rel="preload"
      href="/fonts/Pacifico.woff2"
      as="font"
      type="font/woff2"
      crossorigin>
```

`rel="preload"`는 브라우저에게 '이 리소스는 **우선순위가 매우 높으며** 현재 페이지에서 즉시 필요하다'고 알리는 가장 강력한 힌트이다. <br/>
중요한 점은 리소스를 미리 가져오기(fetch)만 할 뿐, 즉시 실행(execute)하지는 않는다는 것이다.

![preload](/assets/images/blog/2025-10-28-woowa-performance-optimization-5-network-level/preload.png)
[Web.dev](https://web.dev/articles/preload-critical-assets)에서 제공해준 예시 이미지를 참고해보자.

`preload`는 일반적으로 브라우저가 나중에 발견할 리소스에 가장 효과적이다. <Br/>
위의 사진에서는 브라우저가 가장 늦게 발견한 폰트 리소스가 그 대상이 될 수 있다.<br/>
보통 폰트는 CSS의 `@font-face` 규칙에서 선언되므로 아래와 같이 구성되어 있을 것이라 추측 가능하다

```jsx
/* style.css */
@font-face {
  font-family: 'Pacifico';
  src: url('/fonts/Pacifico.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

```jsx
<link rel="stylesheet" href="/css/style.css">
```

위와 같은 상황에서 브라우저의 작업 순서는 아래와 같이 예측할 수 있다.

- 1. HTML을 파싱하다 style.css를 만난다
- 2. CSS 파일을 다운로드 한다
- 3. CSS 파일을 모두 읽은 뒤에야 비로소 '아, `/fonts/Pacifico.woff2` 폰트 파일이 필요하네!'라고 깨닫고 폰트 다운로드를 시작한다.

![preload-result](/assets/images/blog/2025-10-28-woowa-performance-optimization-5-network-level/preload-result.png)

`preload`는 이 과정을 단축시켜 준다. <Br/>
HTML의 <head>에 폰트를 preload 하라고 명시하면, 브라우저는 CSS 파일을 파싱하기 전에 폰트 다운로드를 시작할 수 있다.

```html
<!-- 🔥 핵심 코드 -->
<link
  rel="preload"
  href="/fonts/Pacifico.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- 스타일시트는 그대로 -->
<link rel="stylesheet" href="/css/style.css" />
```

따라서 `preload`는 초기 렌더링에 반드시 필요한 폰트, 이미지, 스크립트 등에 사용하기 좋다.

<br/>

### **`prefetch`**

---

`rel="prefetch"`는 현재 페이지는 아니지만, 사용자가 **다음 페이지**에서 사용할 것 같은 리소스를 미리 다운로드하라는 힌트이다.

`preload`와 달리 우선순위가 낮으며, 브라우저가 여유가 있을 떄(보통 현재 페이지 로드가 완료된 후) 다운로드 한다. <br/> 따라서 현재 페이지 로드 시간에는 영향을 주진 않지만, **다음 페이지 로드 시간(FCP, TTL)을 개선**할 수 있다.

하지만 당장 필요하지 않은 리소스를 받기 때문에, **사용자의 다음 행동이 거의 확실**할 때 신중하게 사용해야 한다.

- 예시 ) **페이지 이동 예측** : 쇼핑 카트 페이지에서 결제 페이지로 이동할 확률이 높을 때, 결제 페이지의 주요 리소스를 `prefetch` 한다.
- 예시 ) **핵심 리소스 미리 로드** : Netflix는 로그인 화면에서 사용자가 대기하는 동안, 로그인 후에 필요한 React 라이브러리를 미리 `prefetch` 하여 앱 실행 속도를 높인다.

**브라우저 prefetch 동작 과정**
![prefetch](/assets/images/blog/2025-10-28-woowa-performance-optimization-5-network-level/prefetch.png)

- step1. 페이지 로드
  사용ㅈ가 `http://example.com`에 접속하면 브라우저가 해당 페이지를 불러온다,

- step2. prefetch 탐색
  페이지 로드 후, 브라우저는 HTML 내에 포함된 prefetch 링크(`rel="prefetch"`)를 탐색한다.

- step3. prefetch 실행
  브라우저는 prefetch 링크를 **백그라운드(유휴 시간)**에 미리 다운로드 한다. <br/>
  이때 받아온 데이터는 **브라우저 캐시**에 저장되며, 사용자가 실제로 해당 링크를 클릭하면 **즉시 페이지가 로드된다.**

<br/>

### **`preconnect`**

---

```jsx
<link rel="preconnect" href="https://example.com">
```

`rel="preconnect"`는 **특정 도메인과 미리 연결**을 맺어두라는 힌트이다.

![preconnect](/assets/images/blog/2025-10-28-woowa-performance-optimization-5-network-level/preconnect.png)

브라우저가 다른 서버에 리소스를 요청하기 위해서는 여러 단계의 연결 설정 과정(DNS, TCP, TLS) 등이 필요하다. <br/>
`preconnect`는 이 연결 과정을 미리 수행하여, 실제 리소스 요청 시 발생하는 **지연시간을 크게 줄여준다.**

Google Fonts, CDN 서버, 외부 API 서버 등 현재 페이지에서 곧 사용할 것이 확실한 제3자(3rd-party) 도메인에 연결할 때 유용하다.

<br/>
<br/>

## ✅ 중요도 낮은 리소스 미루기 (defer, async)

---

반대로, 중요도가 낮은 리소스는 로딩을 미루 **초기 렌더링을 방해하지 않도록**해야 한다. <br/>
특히 자바스크립트 파일이 여기에 해당된다.

<br/>

### 기본 `<script>` 태그의 문제점

---

![script](/assets/images/blog/2025-10-28-woowa-performance-optimization-5-network-level/script.png)

브라우저가 위와 같은 기본 `<script>` 태그를 만나면, **HTML 파싱을 즉시 멈춘다.**<br/>
그리고 `<main.js>` 파일을 다운로드하고, 실행이 완료된 다음에야 다시 HTML 파싱을 재개한다. <br/>
따라서 JS 파일 용량이 크다면 사용자는 하얀 화면을 더 오래 봐야 한다.

이 문제를 해결하기 위해 `defer`와 `async` 속성이 등장했다.

<br/>

### 질문 1 ) JS는 싱글 스레드인데, 어떻게 HTML 파싱과 JS 다운로드가 동시에 가능한가요

**자바스크립트 엔진은 싱글 스레드**로 동작하는 것이 맞다. <br/> 하지만 **브라우저는 멀티 스레드**환경이다.

![browser-thread](/assets/images/blog/2025-10-28-woowa-performance-optimization-5-network-level/browser-thread.png)

지금부터 소개할 `defer`와 `async`는 이 네트워크 스레드를 활용한다. <br/>
즉, **JS 파일 다운로드는 네트워크 스레드**가 백그라운드에서 처리하고, **HTML 파싱은 메인 스레드**에서 계속 진행된다.

다만, 다운로드가 완료된 JS를 **실행**하는 순간에는 메인 스레드가 사용되므로, 이때는 HTML 파싱이 잠시 멈출 수 있다.

<br/>

### `defer`

---

```jsx
<script src="main.js" defer></script>
```

![defer](/assets/images/blog/2025-10-28-woowa-performance-optimization-5-network-level/defer.png)

`defer`는 브라우저가 HTML 파싱을 멈추지 않고 JS 파일을 백그라운드에서 다운로드 한다. <br/>
그리고 **HTML 파싱이 모두 끝난 후,** `<script>` 태그가 선언된 순서대로 JS를 실행한다.

- 예시 : DOM 구조가 완성되어야 실행 가능한 메인 앱 로직 (React 초기화 코드), DOM을 조작하는 스크립트 등 **순서**가 중요한 경우에 적합니다.

<br/>

### `async`

---

```jsx
<script src="analytics.js" async></script>
```

![async](/assets/images/blog/2025-10-28-woowa-performance-optimization-5-network-level/async.png)

`async` 역시 HTML의 파싱과 동시에 JS 파일을 백그라운드에서 다운로드 한다. <br/>
하지만 `defer`와 달리, **다운로드가 완료되는 즉시 HTML 파싱을 중단**하고 JS를 실행한다. <br/>
여러 `async` 스크립트가 있다면, 다운로드가 끝나는 순서대로 실행되며, **실행 순서가 보장되지 않는다**.

- 예시 : 페이지의 다른 스크립트나 DOM과 의존성이 없는 **독립적인 외부 스크립트**(구글 에널리틱스, 광고 스크립트, 로그 수집기)에 적합하다.

<br/>

### 질문 2) JS가 HTML을 변경할 수 있는데, `defer`와 `async`는 왜 안전한가요?

---

앞서 `<script>` 태그가 HTML 파싱을 멈추는 이유는 **JS가 HTML 구조 자체를 동적으로 변경**할 수 있기 때문이다고 언급한 바 있다. <Br/>
만약 파싱과 JS실행이 동시에 일어난다면 DOM 상태가 꼬일 수 있기 때문에, 안정성을 위해 파싱을 중단하는 것이다.

그렇다면 왜 `defer`와 `async`는 파싱을 멈추지 않고도 안전할까?

바로 **개발자의 약속** 때문이다. <br/>
`<script>`에 `defer`나 `async` 속성을 추가하는 행위는, 브라우저에게 **이 스크립트는 파싱 도중 DOM을 수정하지 않는 안전한 코드야** 라고 명시적으로 약속하는 것이다.

브라우저는 이 약속을 믿고, 해당 스크립트를 'HTML 파서를 방해하지 않는 코드'로 간주하여 파싱과 다운로드를 병렬로 처리한다.

- **defer** : DOM이 완성된 후에 실행하므로 DOM 수정에서 자유롭다
- **async** : DOM을 수정하지 않는 독립적인 스크립트라는 전제 하에 사용된다.

> ### 참고자료
>
> https://web.dev/articles/preload-critical-assets (preload)
> https://web.dev/articles/link-prefetch (prefetch)
> https://www.keycdn.com/blog/resource-hints (prefetch)
> https://web.dev/articles/preconnect-and-dns-prefetch (preconnect)
