---
layout: post
title: "우테코 1단계 2주차"
author: munkyeong
categories: [woowa-mission1]
image: assets/images/thumbnail/0214_racingCar.png
---

> 요약
> 우테코 2단계 첫주차 회고 글입니다.
> 미션을 진행하며 배운 점과 기억하고자 하는 점들을 담았습니다.

<br/>
<br/>

---

## 목차

- [미션 3단계](#미션-3단계)
  - [공부 내용](#공부-내용)
    - [📌 Q1) JavaScript에서 this 바인딩 오류](#-q1-javascript에서-this-바인딩-오류)

---

<br/>
<br/>

# 미션 3단계

## 공부 내용

<!--
### 📌 Q1) 나의 나쁜 습관들 : 변수명을 대충 짓는다.

> 코드를 빠르게 읽을 때, 인터페이스만 보고 코드를 읽습니다. 즉, 함수명, 변수명, 인자명만 보죠. 그렇게만 봐도, 어떤 흐름으로 어플리케이션이 돌아가는지 이해할 수 있어야 합니다. 하지만 캉골의 코드는 읽을때 중간에 턱턱 막힙니다. 사실 대부분의 코드에서 읽다가 막혀서, 세부 구현 자체를 살펴보아야 했습니다.
>
> 그래서 캉골이 변수명을 대충 짓는 습관이 있다고 추론하게 되었어요. -->

#### 📌 Q1) JavaScript에서 this 바인딩 오류

---

< 문제 코드 >

```javascript

//FoodInventory.js
  addFoodItem() {
    const foodInfo = this.#getFoodItem();
    if (!foodInfo) return;
    this.#updateFoodList(foodInfo);
    Modal.close();
  }

  //FoodForm.js
  Button({
    cssType: "primary",
    innerText: "추가하기",
    onClick: foodInventory.addFoodItem,
  })
  ..
```

위 코드에서는 `foodInventory.addFoodItem`을 직접 **addEventListener**에 전달하고 있습니다. 하지만 이렇게 하면 **this**가 foodInventory 인스턴스를 가리키지 않고 undefined가 되어 오류가 발생하게 된다.

위 상황을 해결할 수 있는 방법으로는

1. **bind 사용하기 (해결한 방법)**

`bind`를 사용하여 `this`를 명확하게 바인딩할 수 있다. `bind`를 사용해서 내가 전달하고싶은 this가 무엇인지를 전달하는 과정이라고 생각하면 될 것 같다! 이렇게 하면 `addFoodItem` 내부에서 `this`가 `foodInventory`를 유지하게 됩니다.

```javascript
onClick: foodInventory.addFoodItem.bind(foodInventory),
```

2. **화살표 함수 사용하기**
   화살표 함수를 사용하면 `this`가 외부 스코프(foodInventory)의 `this`를 유지할 수 있다. 하지만 이 방법은 `addFoodItem`이 호출될 때마다 새로운 함수가 생성된다는 단점이 있습니다.

```javascript
onClick: () => foodInventory.addFoodItem(),
```

3. **클래스 메서드를 화살표 함수로 변경**
   다만 위 방식을 사용하게 된다면 클래스 내부에서 함수 작성 방식을 변경해야 하므로 사용하지 않았다!

```javascript
addFoodItem = () => {
  const foodInfo = this.#getFoodItem();
  Modal.close();
};
```
