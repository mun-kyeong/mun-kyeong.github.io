---
layout: post
title: "[우테코] Lv.4 / 성능 최적화 : 네트워크 요청 우선순위를 조절하자"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/default-img.png
---

> 요약 <br/>
> 로딩 성능 개선 중 **코드 레벨의 로딩 최적화**에 대한 내용을 다룹니다. <br/> **빌드/런타임 단계에서 JS 코드(컴포넌트)**를 어떻게 분리하고 불러올지를 결정하는 애플리케이션 레벨의 최적화 기법입니다.

---

## 목차

- [⛳️ 로딩 성능 개선 - Part 2. 필요한 것만 필요한 때에 요청하기](#️-로딩-성능-개선---part-2-필요한-것만-필요한-때에-요청하기)
  - [2-1. 요청 수 줄이기](#2-1-요청-수-줄이기)
    - [✅ 불필요한 리소스가 없는가?](#-불필요한-리소스가-없는가)
    - [✅ Tree Shacking](#-tree-shacking)
    - [**✅ 지금 화면에서 필요 없는 것들은 나중에 요청하기**](#-지금-화면에서-필요-없는-것들은-나중에-요청하기)
    - [✅ 질문 1 ) Dynamic import VS React.lazy](#-질문-1--dynamic-import-vs-reactlazy)

<br/>
<br/>

# ⛳️ 로딩 성능 개선 - Part 2. 필요한 것만 필요한 때에 요청하기

## 2-1. 요청 수 줄이기

---

![start](/assets/images/blog/2025-10-28-woowa-performance-optimization-4-code-level/start.png)

이전 ‘요청 크기 줄이기’ 시간에는 요청 하나하나의 크기를 줄였다면, 이번에는 **요청 목록을 줄이고, 필요한 것만 요청**할 수 있게 최적화 하는 작업이다.

이번 글에서는 **코드 레벨에서의 로딩 최적화** - 즉, 불필요한 코드 제거와 **지연 로딩(lazy loading)을 줌심으로 다룰 예정이다. <br/>
다음 포스팅에서는 **네트워크 레벨에서의 사전 로딩(`preloading`, `prefetch`등)\*\* 기법을 통해, 브라우저의 리소스 요청 타이밍을 제어해볼 예정이다.

<br/>

### ✅ 불필요한 리소스가 없는가?

---

가장 먼저 할 일은 "정말 이 요청이 필요한가?"를 점검하는 것이다. <br/>
불필요한 리소스가 없는지 확인하는 일은 가장 간단하면서도 의외로 놓치기 쉬운 부분이다.

- 오래전에 사용했지만 지금은 사용되지 않는 CSS 파일이 `<link>`로 연결되어 있지는 않는가?
- 테스트용으로 넣었던 스크립트가 여전히 사용되는가?

위와 같은 질문을 통해 **사용되지 않는 코드를 찾아 제거하는 것 만으로도 요청 수를 줄일 수 있다.**

<br/>

### ✅ Tree Shacking

---

두번째는 **트리 쉐이킹(Tree Shacking)**을 활용하는 것이다. <br/>
나무를 흔들어 마른 잎(사용하지 않는 코드)를 떨어뜨린다는 의미로, 빌드 과정에서 실제로 사용되지 않는 코드를 자동으로 제거하는 기능이다.

![treeshacking](/assets/images/blog/2025-10-28-woowa-performance-optimization-4-code-level/treeshacking.gif)
[출처 : tree-shaking](https://www.patterns.dev/vanilla/tree-shaking/)

<br/>

위 그림처럼, `import`는 했지만 코드 내에서 사용하지 않는 모듈은 최종 번들 파일에 포함시키지 않는다. <Br/>
하지만 Tree shacking이 자동으로 동작하려면 몇가지 조건이 필요하다.

1. **ES Module(ESM) 형식이여야 한다.**

즉, `import/export` 구조여야 ee Shacking이 가능하며, 동적으로 모듈을 불러오는 CommonJS 방식(`require`)은 불가능하다.

- ESM(가능) : `import sub, { add } from './math.mjs'`
- CommonJS(불가) : `const math = require('./math');`

2. **`production` 모드로 빌드해야 한다.**

Webpack, Vite와 같은 번들러는 `development` (개발)모드에서는 Tree Shacking을 비활성화 한다. <Br/>
Tree Shacking은 정적 분석(static analysis) 과정을 포함하기 때문에 CPU 비용이 크다. <br/>
개발 모드의 핵심은 빠른 피드백(빌드 속도)이므로, Tree Shacking, 압축, 난독과 등은 비활성화 한다.

3. **번들러(패키지) 설정에서 `sideEffects: false`를 명시한다.**

Tree Shacking의 가장 큰 고민은 **이 코드를 지워도 정말 안전한가?**에 대한 고민이다. <br/>
어떤 모듈은 `import`하는 것 만으로도 전역 스타일에 영향을 주거나 부작용(Side Effect)을 가질 수 있다.<br/>
따라서 번들러는 기본적으로 **"혹시 부작용이 있을 수도 있으니 남겨두자"**라는 보수적인 전략을 취한다. <br/>

`sideEffects : false`는 개발자가 번들러에게 "_내 모듈은 `import` 해도 아무런 부작용이 없으니, 사용되지 않는 export는 전부 지워도 안전해!_" 라고 확신을 주는 설정이다. <br/>
이 속성이 있어야 번들러가 안심하고 Tree Shacking을 수행할 수 있다.

<br/>

### **✅ 지금 화면에서 필요 없는 것들은 나중에 요청하기**

---

요청 수를 줄이는 것만큼이나 중요한 것이 **요청 시점**을 관리하는 것이다. 모든 리소스를 페이지 진입 시점에 한꺼번에 불러올 필요는 없기 때문이다.
<br/>
지금 당장 보이지 않는 화면의 리소스는 **필요한 시점**에 로드하도록 미루어, 초기 로딩 속도를 개선할 수 있다.

1. **Lazy Loading (지연 로딩)**

가장 대표적인 기법이다. <br/>
사용자가 스크롤하여 **화면에 보이기 직전** 혹은 **특정 영역에 접근**했을 때 비로소 해당 리소스를 로드하는 방식이다.

가장 쉬운 예는 이미지 지연 로딩이다.

```jsx
<img src="thumbnail.jpg" loading="lazy" alt="..." />
```

이러한 지연 로딩 전략을 JS 코드에 적용하는 구현 수단이 바로 **"Code Splitting"**과 **"Dynamic Import"** 이다.

<br/>

2. **Lazy Loading - Code Splitting(코드 분할)**

Webpack이나 vite와 같은 번들러는 기본적으로 모든 JS 코드를 `bundle.js`라는 하나의 커대한 파일로 만든다. <br/>
이 파일이 클수록 초기 로딩 속도는 당연히 느려지며, 당장 사용하지 않는 기능의 코드까지 모두 다운로드 해야한다.

따라서 **코드 분할(Code Splitting)**을 통해 이 거대한 번들을 **기능별, 혹은 라우트별로 여러 개의 작은 조각(chunk)**으로 나눌 수 있다.

아래는 [patterns의 code splittting 코드 예시](https://www.patterns.dev/vanilla/import-on-interaction/)이다.

```jsx
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import EmojiPicker from './EmojiPicker';

const Channel = () => {
  ...
  return (
    <div>
      <MessageList />
      <MessageInput />
      {emojiPickerOpen && <EmojiPicker />}
    </div>
  );
};
```

![code-split](/assets/images/blog/2025-10-28-woowa-performance-optimization-4-code-level/code-split.png)

`<MessageList>`, `<MessageInput>`와 `<EmojiPicker>` 구성요소를 포함하는 채팅 기반 애플리케이션이 있다고 가정해보자. <br/>
초기 페이지 로드 시 이런 모든 구성 요소를 즉시 로드하는 것이 일반적이다.

하지만 `<EmojiPicker>` 의 경우 **사용자가 이모지 아이콘을 누르기 전까지**는 사용되지 않는다. 따라서 code splitting을 통해 ‘필요한 때에 요청’되도록 아래와 같이 수정해볼 수 있다.

`React.lazy` 방법을 통해 lazy loading을 사용하면 code splitting을 쉽게 분할할 수 있다.

```jsx
import React, { lazy, Suspense } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const EmojiPicker = lazy(
  () => import('./EmojiPicker') // ✅ 여기 !!
);

const Channel = () => {
  ...
  return (
    <div>
      <MessageList />
      <MessageInput />
      {emojiPickerOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <EmojiPicker />
        </Suspense>
      )}
    </div>
  )
}
```

위의 코드 예시를 통해 `EmojiPicker`를 lazy load 할 수 있다. <br/>
즉, 사용자가 이모지 창을 열 때(`emojiPickerOpen === true`)만 모듈이 비동기로 로드된다.

초기 번들 파일을 구성할 때 `EmojiPicker`는 lazy loading으로 인해 제외되므로 `bundle.js` 파일이 더 짧고 빠르게 만들어진다. <br/>
코드 스플릿을 적용할 때의 주의점은, **Suspense로 감싸야 하고, 에러 핸들링은 별도로 처리**가 필요하다.

> Question ) 그럼 이모지 창을 열 때 마다 해당 파일이 load 되는 건가요? <br/>
> Answer ) ❌ 아닙니다. <br/>
> 이모지 창을 처음 한 번 열 때만 해당 파일(EmojiPicker.js)이 네트워크에서 로드되고, 그 이후엔 캐싱되어 다시 로드되지 않습니다.

<br/>

3. **Lazy Loading - Dynamic Import (동적 임포트)**

Dynamic Import 방식은 Code Splitting 방식과 혼동하기 쉬운데, 두 개념은 역할의 차이가 있다.

Dynamic Import 방식은 `import()` 함수를 이용해 **런타임(실행 중)**에 모듈을 불러오는 방식이다. <br/>
이에 반해, Code Splitting 방식은 번들러가 **코드를 여러 개의 청크(chunk)로 나누어 빌드**하는 최적화 기법을 의미한다.

Dynamic Import는 “**코드를 언제 로드할지**” 를 결정하는 런타임 기술이고,
Code Splitting은 “**코드를 어떻게 나눌지**” 를 결정하는 빌드타임 최적화 기법인 셈이다.

<br/>

Dynamic Import를 구현하기 위해서는 `import()` 문법을 사용할 수 있다.

기존의 `import` 문은 빌드 시점에 모듈을 가져오는 **정적**방식인 반면, `import()`는 **런타임**에 모듈을 비동기적으로 불러오는 **동적**방식이다.

```jsx
// 1. 기존: 정적 import (빌드 시점에 무조건 포함됨)
import { chart } from "./chart.js";
chart();

// 2. 동적 import (실행 시점에 필요할 때 로드)
button.addEventListener("click", async () => {
  const module = await import("./chart.js");
  module.chart(); // 모듈 로드가 완료된 후 실행
});
```

위의 코드를 바탕으로 설명해보자면, 사용자가 버튼을 클릭하는 순간에만 './chart.js' 파일을 요청하는 것이다.

이 방식은 **'YouTube Lite Embed'**에서 효과적으로사용할 수 있다.<Br/>
페이지 로드 시에는 가벼운 썸네일과 재생 버튼만 표시하고, 사용자가 **재생 버튼을 클릭하는 순간** `import()`를 호출하여 YouTube 플레이어 코드를 **동적으로 로드**하는 것이다.

클릭하지 않는 사용자는 불필요한 리소스 비용을 전혀 지불하지 않게 된다.

![youtube_embed](/assets/images/blog/2025-10-28-woowa-performance-optimization-4-code-level/youtube_embed.gif)
(_Youtube 임베드 이미지를 클릭하면 Youtube 플에이어 api가 호출된다_)

<br/>

**Dynamic Import 예시**

앞서 Code Splitting으로 보여줬던 이모지 예시를 Dynamic Import로도 구현해볼 수 있다.

```jsx
const Channel = () => {
  const [emojiPickerEl, setEmojiPickerEl] = useState(null);

  const openEmojiPicker = () => {
    import(/* webpackChunkName: "emoji-picker" */ "./EmojiPicker")
      .then((module) => module.default)
      .then((emojiPicker) => {
        setEmojiPickerEl(createElement(emojiPicker));
      });
  };

....

  return (
    <ErrorBoundary>
        ...
        <MessageInput onClick={openEmojiPicker} />
        ...
    </ErrorBoundary>
  );
};
```

위의 코드에서 `openEmojiPicker` 함수를 보면 `<MessageInput>` 컴포넌트에서 `onClick` 이벤트가 생겼을 때 이모지 코드를 불러오는 것을 확인할 수 있다.

Dynamic import의 경우엔 `React.lazy`와는 별개로, 프로그래머가 직접 로딩 시점과 로딩 후 동작을 제어해야 한다/

![dynamic-import](/assets/images/blog/2025-10-28-woowa-performance-optimization-4-code-level/dynamic-import.png)

### ✅ 질문 1 ) Dynamic import VS React.lazy

**✔️ Question** ) Dynamic import를 직접 사용하는 것보다, React.lazy를 사용해 React에게 코드 분할 및 로딩 시점을 제어하게 하는 것이 더 좋고 안전한 방법인가?

**✔️ Answer** ) 대부분의 경우에는 맞고, `React.lazy()`가 (공식문서에서도) 더 권장되는 방식이다.<br/>
하지만 무조건 좋은건 아니고, ‘**무엇을 제어하고 싶은가**’에 따라 달라진다.

`React.lazy`의 경우 React의 렌더링 사이클과 자연스럽게 통합되므로 개발자는 ‘언제 렌더링 되는가’만 신경쓰면 되며, 비동기 처리나 Promise 관리가 필요없다.

하지만 `React.lazy`는 렌더링 시점 기반이므로, ‘렌더링이 일어나야 import’가 된다. <br/>
즉, **이벤트 기반 사전 로딩(preloading)**, 사용자 클릭 전 미리 로드 같은건 어렵다. <br/>
아래처럼 ‘미리 로드’전략을 쓰려면 `React.lazy`만으로는 부족하고, 직접 `import()` 호출이 필요하다.

> ### 참고자료
>
> https://www.patterns.dev/vanilla/tree-shaking/ (Tree-shacking)
> https://www.patterns.dev/vanilla/import-on-interaction/ (Import On Interaction)
