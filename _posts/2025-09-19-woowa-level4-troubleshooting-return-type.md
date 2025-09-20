---
layout: post
title: "[우테코] level-4 / 타입스크립트, 이렇게 쓰면 안돼요~"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/default-img.png
---

> 요약 <br/>
> 개발자의 타입 정의 실수로 인해 chrome 디버깅 툴과 함께 원인을 분석했던 과정을 정리합니다 <br/>
> 타입스크립트는 눈감아 .. 아무잘못 없어 ..

<br/>

---

## 목차

- [🚨 대쉬보드 화면 깨짐 문제 해결](#-대쉬보드-화면-깨짐-문제-해결)
  - [결론을 먼저 알고 넘어가기 ~ : 왜 에러가 났을까?](#결론을-먼저-알고-넘어가기---왜-에러가-났을까)
  - [문제 해결 과정 소개](#문제-해결-과정-소개)
    - [가설 1. `.some` 함수를 사용한 곳이 문제가 되었을 것.](#가설-1-some-함수를-사용한-곳이-문제가-되었을-것)
    - [가설 2. Array가 아닌 다른 값이 return 되고 있을 것이다.](#가설-2-array가-아닌-다른-값이-return-되고-있을-것이다)
    - [검증 2. 개발자 도구의 디버깅 툴을 확인해보자](#검증-2-개발자-도구의-디버깅-툴을-확인해보자)
    - [가설 3. useEffect에서 refetch 함수가 문제가 될 것이다.](#가설-3-useeffect에서-refetch-함수가-문제가-될-것이다)
    - [검증3. 개발자 도구의 디버깅툴과 함께 myFeedbacks 값을 관찰하기](#검증3-개발자-도구의-디버깅툴과-함께-myfeedbacks-값을-관찰하기)
    - [오류 개선 / But 여전히 남은 의문증](#오류-개선--but-여전히-남은-의문증)
    - [가설 4. queryFn의 return값에서 원인이 있지 않을까?](#가설-4-queryfn의-return값에서-원인이-있지-않을까)
    - [검증 4. getMyFeedbacks의 return 값을 확인하자](#검증-4-getmyfeedbacks의-return-값을-확인하자)
    - [가설 5. queryFn이 실행되지 않았을 것 같다.](#가설-5-queryfn이-실행되지-않았을-것-같다)
    - [검증 5. 의도적으로 myFeedbacks 생성해보기](#검증-5-의도적으로-myfeedbacks-생성해보기)
- [해결법](#해결법)
- [느낀점](#느낀점)

---

# 🚨 대쉬보드 화면 깨짐 문제 해결

![dashboard-Error](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/dashboard-Error.png)

---

## 결론을 먼저 알고 넘어가기 ~ : 왜 에러가 났을까?

**useQuery에서 data의 타입 추론과 실제로 api 호출 시 return type이 서로 달랐기 때문이다 ..**

사실 `getMyFeedbacks`의 타입은 아래와 같이 `{data:{}}` 와 같은 객체 형태인데, <br/> useQuery에서 `getMyFeedbacks`의 return값을 `FeedbackType[]` 으로 강제로 추론해서 런타임상 오류가 발견되지 않던 문제였다.

> GetMyFeedbacksResponse ≠ FeedbackType[]

```javascript
// return response as GetMyFeedbacksResponse << 이렇게 선언함
export interface GetMyFeedbacksResponse {
  data: {
    feedbacks: FeedbackType[];
  };
}

useQuery<
  GetMyFeedbacksResponse,
  ApiError,
  FeedbackType[] // 여기가 queryFn 실행 후 return 타입
>;
```

즉, useQuery에서 `data: myFeedbacks`의 타입을 `FeedbackType[]`으로 단언하는 바람에, <br/>
myFeedbacks을 사용하는 측에서도 `FeedbackType[]` 타입으로 추론되어 **컴파일 타임에 문제가 생기지 않았던 것**이다.

하지만 실제로는 return 타입이 다르기 때문에 잘못된 배열 객체 자체가 return 값으로 전달돼서 **런타임때 오류가 발생하게 된 케이스**이다.

<br>

## 문제 해결 과정 소개

---

### 가설 1. `.some` 함수를 사용한 곳이 문제가 되었을 것.

---

문제가 생겼을 때 맨 처음 확인할 수 있는건 오류메시지였다.

> 오류 메시지는 어디서, 어떤 문제가, 어떤 오류를 발생했는지 알 수 있는 힌트가 되기 때문에 문제를 잘 해결하는 사람은 오류 메시지를 잘 확인하는 사람이라는 말이 기억났다.

![dashboard-Error-check](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/dashboard-Error-check.png)

사진을 통해 알 수 있듯이, `Z.some` 이 함수가 아니다는 오류 메시지를 확인할 수 있었다. <br/>
그렇다면? `.some` 이라는 함수를 사용하는 곳을 찾아보자!

![some](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/some.png){: width="400" .mx-auto .d-block }

다행히도 우리 프로젝트에선 `.some` 이라는 함수를 세 군데서만 사용하고 있었고, 그중 오류가 난 userDashBoard 페이지와 가장 연관성이 높은 userFeedbackList 코드를 먼저 보게 되었다.

```tsx
  isMyFeedback={myFeedbacks.some( // ✅ 여기
    (myFeedback) => myFeedback.feedbackId === feedback.feedbackId
  )}
```

위에서 알 수 있듯이, myFeedbacks이라는 배열에서 some 함수를 호출하고 있었고, 당연하게도 myFeedbacks의 값을 호출하는 useMyFeedbackData 라는 훅을 문제의 원인으로 추론하게 되었다.

<br>

### 가설 2. Array가 아닌 다른 값이 return 되고 있을 것이다.

---

아까의 문제로 다시 돌아오자면, `.some` 이라는 함수를 호출할 수 없다는 에러 문구를 확인할 수 있었다.

즉, **`.some`은 배열에서만 사용할 수 있는 배열 내장 메서드이기 때문에 배열이 아닌 다른 Object에서 some을 호출하려 해서 문제가 생긴게 아닐까?** 하는 추론을 하게 되었다.

근데 막상 return 값을 확인하려니 **오류 페이지 때문에 콘솔 출력 값을 확인할 수 없는 문제**가 발생했다.

어디서 오류가 발생했는지 알 수 없으니 콘솔에 값이 찍힐 때 까지 하루종일 코드를 찾아다닐수도 없는 문제고 ,,,

### 검증 2. 개발자 도구의 디버깅 툴을 확인해보자

---

문제를 파악하기 위해선 로직이 어떻게 흘러가는지를 파악할 필요가 있다고 생각되었다.

queryFn이 실행은 되고 있는건지, myFeedback이라는 값에 무슨 값이 들어오고 있는지, 아니면 완전히 다른 곳에서 문제가 발생하고 있는건지

위의 모든 궁금증을 해결하기 위해선 코드의 흐름을 따라가야 했다.

> 디버깅 하는 과정 및 방법은 아래 글을 참고하면 좋을 것 같다!
>
> [![디버깅 블로그 썸네일](/assets/images/thumbnail/default-img.png)](https://mun-kyeong.github.io/woowa-level4-debuging/)

디버깅을 통해 알게 된 점은, myFeedbacks의 값이 예상했던 대로 Object 형태로 저장되고 있던 점이다.

![result-object](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/result-object.png)

**원래는 배열로 저장되여야 하는 값이 Object로 저장되어 있었으니 `.some` 함수를 실행하지 못하고 있었다는 결론을 내릴 수 있었다.**

하지만 왜 배열이 아닌 객체가 그대로 담겨오는지는 알 수 없었기에, AI의 도움을 받아 문제가 되는 부분을 먼저 하나씩 살펴보기로 했다.

<br/>

> 문제가 되는 부분을 대략적으로나마 확인해보기 위해 처음에는 GPT의 도움을 받았는데, AI의 답변으로는 useQuery 안의 queryKey를 검증하는 단계에서 배열이 아닌 다른 값을 받아서 .some 부분이 문제가 된다는 답을 받았다.
>
> 근데 이 잘못된 정보 때문에 tanstackQuery 내부 코드까지 찾아보고 실제 쿼리문 배열을 비교하는 코드까지 찾으면서 오만 고생을 다한 것 같다 …
> 에라이 GPT

```jsx
  const { data: myFeedbacks, refetch: refetchMyFeedbacks } = useQuery<
    GetMyFeedbacksResponse,
    ApiError,
    FeedbackType[]
  >({
    queryKey: QUERY_KEYS.myFeedbacks(
      organizationId!,
      feedbackIds,
      selectedSort
    ),
    queryFn: () => //  ✅ 여기
      getMyFeedbacks({
        organizationId,
        feedbackIds,
        orderBy: selectedSort,
      }),
    enabled: organizationId !== undefined && feedbackIds.length > 0,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    refetchMyFeedbacks(); // ✅ 여기
  }, [selectedSort, feedbackIds]);
```

AI는 useEffect에서 **refetch 하는 로직과 queryFn에서 호출하는 순간이 맞물리면서** data에 배열이 아닌 응답 객체 자체가 들어갈 수 있다는 답변을 내주었다.

<br/>

### 가설 3. useEffect에서 refetch 함수가 문제가 될 것이다.

---

우선 원인을 바로 알 순 없어서 AI의 답변을 토대로 useEffect 사용 전/후를 비교해보기로 했다.

<br/>

### 검증3. 개발자 도구의 디버깅툴과 함께 myFeedbacks 값을 관찰하기

---

AI의 답변을 바탕으로 각각 디버깅을 해본 결과 useEffect를 사용한 쪽에선 object 형태가 response로 들어갔고, useEffect를 사용하지 않은 쪽에선 기대된 대로 Array 형태가 들어가는 것을 확인할 수 있었다.

**useEffect를 사용했을 때**

```jsx
useEffect(() => {
  refetchMyFeedbacks();
}, [selectedSort, feedbackIds]);
```

![result-object](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/result-object.png)

**refetch를 사용하지 않았을 때**

![result-array](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/result-array.png)

<br>

### 오류 개선 / But 여전히 남은 의문증

useEffect를 사용하지 않으니 예상했던대로 Array가 data로 저장되었고, '해치웠나?' 하는 생각이 들었다.

하지만 여젼히 풀리지 않았던 의문은 **왜 Refetch 함수의 결과값으로는 Object가 들어가고, queryFn 함수의 결과값으로는 Array 형태가 들어가는거지?** 하는 부분이였다.

분명히 **queryFn**에서도 특별한 로직을 추가해주지 않았고, **refetch 함수**라고 해서 특별한 로직을 없앤것도 아닌데, 분명이 같은 결과값이 와야 하는 로직에서 서로 다른 형태로 값이 들어가니 이상하게 느껴졌다.

<br/>

### 가설 4. queryFn의 return값에서 원인이 있지 않을까?

---

그래서 다음으로 의심이 되었던 점은 queryFn에 대한 return 값이였다.

queryFn의 return 값이 data값이 되니 여기서 힌트를 얻을 수 있을 것 같았다.

### 검증 4. getMyFeedbacks의 return 값을 확인하자

---

그리고 queryFn의 return 타입을 확인해본 결과, 어딘가 이상한 부분을 찾게 되었다.<br/>
queryFn의 return값은 아래(`GetMyFeedbacksResponse`)와 같이 Object 형태로 들어가고 있었는데, queryFn의 data 값은 `FeedbackType[]`으로 추론되는 이상한 현상을 발견하게 되었다.

```tsx
export interface GetMyFeedbacksResponse {
  // ✅ queryFn의 return
  data: {
    feedbacks: FeedbackType[];
  };
}
```

![getMyFeedbacks-return](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/getMyFeedbacks-return.png)

알고보니 useQuery에서 queryFn에 대한 return값을 `FeedbackType[]`으로 명시해버린 바람에 **컴파일 타임때 오류가 발생하지 않고** 런타임때 오류가 발생해서 더 찾기가 어렵게 되었던 것 ..

```tsx
useQuery<
  GetMyFeedbacksResponse,
  ApiError,
  FeedbackType[] // 여기서 타입 강제를 해버림 .. 🥲
>;
```

스스로 강제한 타입때문에 되려 런타임때 고생하게 된 케이스랄까 …<br/>
**근데 그렇다면 왜 queryFn에서는 오류가 발생하지 않았던 걸까?**

<br/>

### 가설 5. queryFn이 실행되지 않았을 것 같다.

---

여기서 하나의 가설을 세우게 되었는데, 디버깅 툴에서 Array의 배열 값이 0으로 잡혔던걸 기억했다.

![result-array](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/result-array.png)

즉, myFeedbacks의 값이 존재하지 않아 return문의 분기처리에 의해 빈 배열이 나오게 된건 아닐까? 하는 생각이였다.

```jsx
return { myFeedbacks: myFeedbacks || [] };
```

같은 함수를 호출했으면 같은 값을 return해야하는데 한쪽만 빈 배열이 왔다는 점에서 의심을 하게 된 것이다.

<br/>

### 검증 5. 의도적으로 myFeedbacks 생성해보기

---

가설을 검증하기 위해서 의도적으로 myFeedbacks를 생성해보았고, 그순간 useEffect를 사용하지 않았음에도 맨 첫 페이지와 같은 오류를 확인할 수 있었다.

![dashboard-Error](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/dashboard-Error.png)

그리고 디버깅 툴에서는 아래와 같이 객체 형태의 값이 담긴 것을 검증할 수 있었다.

![objects](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/objects.png)

<br/>

알고보니 queryFn을 호출하기 전, localStorage에서 저장된 myFeedbacks 값을 찾을 수 없었고, useQuery를 호출할 때 enabled 조건을 받아 쿼리문이 실행되지 않았던 것이다.

```tsx
// ✅ 여기서 값을 찾지 못함 => feedbackIds 값이 없음
const feedbackIds = useMemo(
  () => [...new Set(getLocalStorage<number[]>("myFeedbacks") || [])],
  []
);
```

```tsx
const { data: myFeedbacks } = useQuery<
  GetMyFeedbacksResponse,
  ApiError,
  FeedbackType[]
>({
  queryKey: QUERY_KEYS.myFeedbacks(organizationId!, feedbackIds, selectedSort),
  queryFn: () =>
    getMyFeedbacks({
      organizationId,
      feedbackIds,
      orderBy: selectedSort,
    }),

  // ✅ feedbackIds와 관련된 enabled 조건 때문에 queryFn이 실행되지 않음
  enabled: organizationId !== undefined && feedbackIds.length > 0,
  staleTime: 0,
  gcTime: 5 * 60 * 1000,
});
```

**즉, useEffect에서 refetch 함수를 부를 땐 enabled의 조건에 영향받지 않고 강제로 실행되게 되면서 원래 생길 수 있었던 문제가 드러나게 된것이였다.**

<br/>

# 해결법

원인을 파악하니 해결법은 쉬웠다. <br/>
queryFn의 return값이 FeedbackType[]이 되도록 만들어주면 된다.

그리고 위의 목표는 useQuery의 `select: (res) => res.data.feedbacks,` 옵션을 통해 조절할 수 있었다

```jsx
  const { data: myFeedbacks } = useQuery<
    GetMyFeedbacksResponse,
    ApiError,
    FeedbackType[]
  >({
    queryKey: QUERY_KEYS.myFeedbacks(
      organizationId!,
      feedbackIds,
      selectedSort
    ),
    select: (res) => res.data.feedbacks, //✅ 여기
    queryFn: () =>
      getMyFeedbacks({
        organizationId,
        feedbackIds,
        orderBy: selectedSort,
      }),
    enabled: organizationId !== undefined && feedbackIds.length > 0,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
```

<br/>

그 결과 ,,,

![feed](/assets/images/blog/2025-09-19-woowa-level4-troubleshooting-return-type/feed.png){: width="400" .mx-auto .d-block }

드디어 3시간동안 보이지 않았던 화면을 볼 수 있었다 …

그리고 useQuery에서 queryKey 조건을 통해 `selectedSort, feedbackIds` 값을 관찰하고 있었기 때문에 사실 UseEffect도 필요 없었다!!

<br>

# 느낀점

타입 정의를 조심히, 그리고 잘 해야겠단 생각이 들었다

TypeScript는 컴파일때 개발자가 타입을 잘 추론할 수 있게 도와주긴 하지만, <br/>
이렇게 개발자의 실수로 타입을 잘못 설정하게 된다면 컴파일때 오류도 발생하지 않게 되고, 런타임에서 오류가 발생해버려서 오히려 어디서 문제가 발생하게 된건지 알기가 더 어려워 진다는 문제점을 알게 된 경험인 것 같다.
