---
layout: post
title: "kangoll의 위키문서"
author: kangoll
categories: [wikipedia]
image: assets/images/thumbnail/wikipedia.png
featured: true
---

> 요약 )
> 공부하면서 생긴 나만의 기준을 정리합니다. <br/>
> 기억하고 싶은 내용이나 컨벤션 등을 간략히 정리합니다.

<br/>
<br/>

---

## 📚 목차

- [📚 목차](#-목차)
- [JavaScript](#javascript)
- [객체지향적인 코드를 작성하자](#객체지향적인-코드를-작성하자)
  - [class를 사용하는 기준 (2025.03)](#class를-사용하는-기준-202503)
  - [선언형 프로그래밍으로 작성하자. (2025.03)](#선언형-프로그래밍으로-작성하자-202503)
  - [높은 응집도, 낮은 결합도 (2025.03)](#높은-응집도-낮은-결합도-202503)
- [React 사용시 주의점(기억하고 싶은 내용)](#react-사용시-주의점기억하고-싶은-내용)
  - [setter를 노출시키기보다 handler로 감싸주기 (2025.06)](#setter를-노출시키기보다-handler로-감싸주기-202506)
- [DOM 의 성능 최적화](#dom-의-성능-최적화)
  - [DocumentFragment를 사용하자. (2025.03)](#documentfragment를-사용하자-202503)
- [HTML, CSS](#html-css)
- [자주 잊어버리는 문법들](#자주-잊어버리는-문법들)
  - [\[html\] html 토글 태그 (2025.03)](#html-html-토글-태그-202503)
  - [\[html\] addEventListner 대신 `<form>` 태그를 사용하자 (2025.03)](#html-addeventlistner-대신-form-태그를-사용하자-202503)
  - [\[css\] `inset` 속성으로 css 속성을 간단히 줄 수 있다. (2025.03)](#css-inset-속성으로-css-속성을-간단히-줄-수-있다-202503)

---

<br/>
<br/>

## JavaScript

## 객체지향적인 코드를 작성하자

---

#### class를 사용하는 기준 (2025.03)

상태를 관리해야 할 필요성이 있는지 판단해보기.

1. 변경된 상태를 관리하면서 가지고 있어야 한다. => `class` 사용하기
2. 값을 참조만 하는 경우 => `function`의 props로 받아와도 충분하다

- 왜 상태를 관리할땐 class를 써야할까? 단지 값을 가리기 위함이라면 closer를 사용해도 괜찮지 않을까?
  - 아직 개인적인 생각이긴 하지만 class가 가독성이 더 좋다고 생각된다. class에서만 사용할 수 있는 상속이라던가 생성자 같은 개념이 있기도 하고. (2025.04.16)

<br/>

#### 선언형 프로그래밍으로 작성하자. (2025.03)

코드가 그 과정을 나타내는 것이 아니라 **어떤 역할을 수행(What)**할 것인지를 표현할 수 있도록 하자.
코드를 선언적으로 사용하기 위해선 `map`, `reduce`, `forEach`와 같은 내장 메서드 들을 사용해서 나타낼 수 있다.

<br/>

#### 높은 응집도, 낮은 결합도 (2025.03)

**응집도**는 하나의 모듈 내의 구성요소들이 얼마나 밀접하게 연관되어 있는지를 의미하며, **결합도**는 하나의 모듈이 다른 모듈에 얼마나 의존하고 있는지를 의미한다.

높은 응집도 (모듈 내부가 일관된 목적을 가짐)와 낮은 결합도(모듈 간 독립적)를 갖출 수 있도록 하자

<br/>
<br/>

## React 사용시 주의점(기억하고 싶은 내용)

---

#### setter를 노출시키기보다 handler로 감싸주기 (2025.06)

하위 컴포넌트에서 상태의 수정 및 변경이 필요하다면 `setter`를 그대로 노출시키기 보다 `handler` 함수 또는 다른 함수로 감싸서 보내주기.

- 왜 이렇게 해야하나요?
  - 첫번재로는 자식 컴포넌트에서 setter로 어떤 작업을 할지 예측할 수 없다.
  - 캡슐화가 깨진다. 상태가 스스로의 상태나 행동을 정의하지 않고, 외부에 의존해서 내부 상태를 바꾸게 된다.
  - **높은 결합도**를 가진다. `setter`를 받는 자식 컴포넌트가 상위 컴포넌트와 강하게 결합되어, 다른 곳에서 재사용하기 어려워진다.
  - 요구사항이 변경되었을 때 유지보수가 어려워진다.

<br/>
<br/>

## DOM 의 성능 최적화

---

#### DocumentFragment를 사용하자. (2025.03)

`DocumentFragment`는 DOM에 연결되지 않는 **가상 노드 컨테이너**역할을 해준다. **여러 노드를 한번에 DOM에 삽입**할 때 DOM에서 일어나는 이벤트를 마지막에 append() 할 떼 한번만 수행한다는 장점이 있다.

```javascript
const fragment = document.createDocumentFragment();

const li = document.createElement("li");
fragment.appendChild(li);

document.querySelector("ul").appendChild(fragment);
```

요런식으로 사용가능

<br/>
<br/>

## HTML, CSS

## 자주 잊어버리는 문법들

---

#### [html] html 토글 태그 (2025.03)

```html
<details>
  <summary>자세히 보기</summary>
  <p>이 부분은 토글로 열고 닫을 수 있습니다.</p>
</details>
```

<br/>

#### [html] addEventListner 대신 `<form>` 태그를 사용하자 (2025.03)

`<form>` 태그 자체에서 제공해주는 유용한 기능들을 사용할 수 있다.

1. 폼 입력 후 엔터 키 자동 제출기능
2. HTML5 기본 유효성 검사 기능 제공 - `required`, `type="email"`과 같은 속성 검사
3. 브라우저의 자동완성 기능

<br/>

#### [css] `inset` 속성으로 css 속성을 간단히 줄 수 있다. (2025.03)

`position : absolute`의 경우에 top, right, bottom, left의 속성을 하나하나 주는 방식 대신 `inset`을 사용해 아래와 같이 간단히 나타낼 수 있다.

```css
inset: 0px 0px 0px 0px;
```

<br/>
<br/>
