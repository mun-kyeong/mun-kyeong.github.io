---
layout: post
title: "[우테코] level-3 / 로그인 페이지 제작기"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/woowa-level3-form.png
---

> 요약 <br/>
> 로그인 및 회원가입 페이지를 제작하며 고민했던 생각의 과정을 정리했습니다. <br/>
> 역할과 책임, 응집도에 대해 고민한 흔적입니다.

<br/>

---

## 목차

- [🏝️ 들어가기 전에 ~](#️-들어가기-전에-)
- [고민의 기록](#고민의-기록)
  - [회원가입/로그인 페이지, 폼 유효성 검사를 만들며 배운 것들 💡](#회원가입로그인-페이지-폼-유효성-검사를-만들며-배운-것들-)
  - [고민 1 ) 에러 메시지는 언제 보여줘야 할까? 🤔](#고민-1--에러-메시지는-언제-보여줘야-할까-)
    - [결론](#결론)
  - [고민 2 ) 폼 유효성 검사, 응집도는 어디에 둬야 할까? 👨‍💻](#고민-2--폼-유효성-검사-응집도는-어디에-둬야-할까-)
    - [결론](#결론-1)
  - [고민 3 ) 유효성 검사 로직은 어떻게 관리할까? 📦](#고민-3--유효성-검사-로직은-어떻게-관리할까-)
    - [결론](#결론-2)
  - [고민 4 ) 비밀번호 확인 필드는 어떻게 처리할까? 🔒](#고민-4--비밀번호-확인-필드는-어떻게-처리할까-)
    - [결론](#결론-3)
- [마음껏 고민해본 후기](#마음껏-고민해본-후기)

---

<br/>
<br/>

# 🏝️ 들어가기 전에 ~

이번 블로그 글에서 '**폼의 응집도**'라는 내용을 다루게 된다.

홍보는 아니지만 ㅎㅎ 이전에 내가 '**응집도**'와 '**결합도**'를 주제로 테코톡 발표를 한 영상이 있는데, <br/>
이번 블로그 글을 읽기 전에 영상을 본다면 조금 도움이 될 것 같아서 첨부해둔다.

> 🦘 캉골의 테코톡 🦘
>
> 주제 : 좋은 코드를 위한 기준 - 응집도와 결합도
>
> <iframe width="560" height="315"  src="https://www.youtube.com/embed/xNr7p1gSNkI?si=8p4nbXnb0pg2PcgG" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br/>

# 고민의 기록

### 회원가입/로그인 페이지, 폼 유효성 검사를 만들며 배운 것들 💡

회원가입과 로그인 페이지는 사용자 경험의 첫인상을 결정하는 중요한 부분이다. <br/>

이 페이지를 만드는 과정에서 단순한 기능 구현을 넘어, 사용자에게 더 나은 경험을 제공하기 위해 어떤 고민을 했는지 기록해 두었다.

<br>

### 고민 1 ) 에러 메시지는 언제 보여줘야 할까? 🤔

폼 제츨 페이지를 만들면서 가장 먼저 떠오른 질문은 "**언제 에러 메시지를 표시할 것인가?**"였다. <br/>
아래와 같이 두가지 선택지가 있었다.

- <strong style="color: chocolate;">onBlur일 때</strong>: 사용자가 필드에서 포커스를 벗어났을 때 검증한다.

  - 사용자가 입력하는 중에 이벤트가 일어나지 않기 때문에 <strong style="color: tan;">입력에 집중할 수 있다</strong>
  - 모든 정보를 다 입력하고 나서야 에러를 알 수 있기 때문에 <strong style="color: tan;">즉각적인 피드백이 어렵다</strong>

  <Br/>

- <strong style="color: chocolate;">onChange에서 실시간으로</strong>: 사용자가 입력하는 즉시 검증한다.
  - 사용자가 입력하는 동안 <strong style="color: tan;">실시간으로 검증하고, 피드백을 제공할 수 있다</strong>
  - input 필드에 포커싱이 된 순간부터 검증을 하기 때문에, <strong style="color: tan;">검증을 완료하기 전까지의 입력이 오류처럼 느껴질 수 있다</strong>

#### 결론

| **onChang에서 실시간으로 검증하기로 했다.** 사용자가 입력하는 동안 즉각적인 피드백을 제공함으로써, 더 직관적이고 쾌적한 입력 경험을 줄 수 있다고 판단했다. <br/><br/> 그리고 '검증을 완료하기 전까지의 입력이 오류처럼 느껴질 수 있다'는 단점이 있다고 생각했는데, <br/>분주가 오히려 <u>오류를 없애기 위한 퀘스트</u> 처럼 느껴질 수도 있을 것 같다는 의견을 줘서 수용하게 됐다!

<br/>

### 고민 2 ) 폼 유효성 검사, 응집도는 어디에 둬야 할까? 👨‍💻

각 입력에 대한 유효성 검증 방법을 결정한 다음에는 자연스럽게 '**어떻게 유효성 로직을 관리할 것인가?**" 에 대한 고민을 하게 되었다.

폼 단위의 응집도와, 각 input 필드 단위의 응집도를 고려해볼 수 있었다.

- <strong style="color: chocolate;">input 단위</strong>: 각 필드마다 유효성 검사 훅을 따로 만들어 관리한다.

  - input 단위의 경우, <strong style="color: tan;">필드 하나가 추가될 때마다 새로운 훅</strong>이 만들어진다. 컴포넌트별로 개별적으로 관리할 수 있다.
  - 폼 전체를 한 번에 관리하지 못하면 데이터 흐름이 복잡해질 수 있다.

<br/>

- <strong style="color: chocolate;">폼 단위</strong>: useAuthForm과 같이 폼 전체를 관리하는 하나의 훅을 사용한다.
  - 폼 전체 단위의 경우 <strong style="color: tan;">상태를 객체로 묶어서 관리</strong>하기 때문에, id를 입력하는 중에 password 필드가 리렌더링이 일어나는 문제가 발생한다.

#### 결론

| **폼 단위로 응집도**를 가져가되, 특정 input이 변경될 때 다른 input에 영향을 주지 않도록 **memo**로 감싸서 성능을 최적화하기로 했다. <br/> 이를 통해 관리의 효율성과 컴포넌트의 독립성을 모두 잡을 수 있었다. <br/><br/> ![render](/assets/images/blog/2025-08-08-woowa-level3-troubleshooting/render.png)

<br/>

### 고민 3 ) 유효성 검사 로직은 어떻게 관리할까? 📦

회원가입 폼에는 아이디, 비밀번호, 이름 등 여러 필드가 있고, 각 필드마다 다른 유효성 검사 규칙이 필요했다.

처음에는 모든 로직을 훅 안에 넣으려고 했지만, <strong style="color: chocolate;">코드가 길어지고 가독성이 떨어졌다.</strong>

더 나은 방법은 재사용 가능한 유효성 검사 함수를 만드는 것이었다.<br/> 예를 들어, validateName 함수나 lengthAtLeast, mustMatch와 같은 규칙을 상수화하여 관리하는 방식이다.

#### 결론

| 유효성 검사 로직을 별도의 파일로 분리하고, 재사용 가능한 함수들로 구성했다. <br/>이렇게 하니 코드가 깔끔해졌고, 새로운 필드를 추가하거나 기존 규칙을 변경할 때 훨씬 수월해졌다. <br/><br/>![validate](/assets/images/blog/2025-08-08-woowa-level3-troubleshooting/validate.png)

<br/>

### 고민 4 ) 비밀번호 확인 필드는 어떻게 처리할까? 🔒

password와 passwordConfirm 필드의 유효성 검사는 특별한 케이스였다. <br/>
처음에는 passwordConfirm의 값도 다른 필드들과 동일하게 `useAuthForm` 훅을 통해서 처리하려고 했다.

하지만 **passwordConfirm의 유효성 검사가 password의 값에 의존**하던 탓에,<br/> 다른 필드의 경우 자기 자신의 value만 받아서 검증하는 반면, 비밀번호 검증 필드의 경우엔
**자기 자신 value + 비밀번호 value 받아서 검증**하게 되었다.

`useAuthForm`을 구현할 때 **추상화 레벨을 높이려고 제네릭 `<T>` 타입**을 사용한게 문제가 되었다.

다른 validate의 경우엔 Input의 props가 하나였던 반면, 비밀번호 확인 validate의 경우엔 Input의 props가 두개가 들어오게 되면서 **예외가 발생**하게 된 것이다.

---

문제를 해결하는 방법에는 두가지 정도가 있었다.

- <strong style="color: chocolate;">useAuthForm에서 분기처리</strong>

  - useAuthForm의 추상화 레벨을 높여놓은 상태라, 분기처리를 위해선 `key=passwordConfirm` 이라는 조건문이 들어가야 했다.

<br/>

- <strong style="color: chocolate;">usePasswordConfirm이라는 별도의 훅 제작하기</strong>
  - useAuthForm과 usePasswordConfirm 두 개의 훅을 동시에 사용하면서 코드가 복잡해졌다.

#### 결론

| **usePasswordConfirm이라는 별도의 훅**을 제작하게 되었다. <br/> useAuthForm에서 분기처리를 하더라도 결국 password의 변경점을 useEffect를 사용해서 잡아줘야 했고, 무엇보다도 추상화된 코드에 `key=passwordConfirm`과 같은 분기처리가 들어가는게 마음에 들지 않았다.

<br>

# 마음껏 고민해본 후기

처음에 회원가입, 로그인 페이지를 맡았을 땐 '그냥 UI 개발이 되겠구나' 하는 생각을 가졌던 것 같다.

하지만 개발을 하다보니 딱 **명확한 정답을 알 수 없는 고민**들이 많았던 것 같다. <br/>
**응집도를 어떻게 관리할 것인지, 추상화 레벨을 얼마나 둘 것인지에** 대한 고민 등을 많이 했다.

남이 본다먼 언뜻 '로그인 회원가입 페이지? 그거 그냥 금방 할 수 있는거 아냐?' 라고 생각할수도 있겠지만, <br/>
더 좋은 사용자 경험을 위해, 코드의 확장성을 위해 마음껏 고민하고, 주변 크루들에게 의견을 물어보기도 하면서 **나만의 기준을 만들고 고민하는 시간**이 되었던 것 같다.
