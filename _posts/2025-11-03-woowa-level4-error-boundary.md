---
layout: post
title: "[우테코] level-4 / 우아한 에러바운더리"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/woowa-level4-error-boundary.png
---

> 요약 <br/>
> 대시보드 UI 깨짐 문제의 근본 원인을 해결하기 위해 전역 에러 처리 구조를 재설계했습니다. <br/>
> Toast와 Fallback UI로 에러 유형을 분리하고, React Query와 ErrorBoundary를 결합해 <br>
> 사용자 경험을 해치지 않는 안정적인 에러 처리 흐름을 구축했습니다.

<br/>

---

## 목차

- [TanStack Query 기반 Toast ErrorBoundary 설계기](#tanstack-query-기반-toast-errorboundary-설계기)
- [1. 상황(Situation) — 왜 에러 바운더리가 필요했을까?](#1-상황situation--왜-에러-바운더리가-필요했을까)
- [2. 업무(Task) - 어떤 형태의 ErrorBoundary를 설계할 것인가?](#2-업무task---어떤-형태의-errorboundary를-설계할-것인가)
  - [2-1. React에서의 에러 바운더리란?](#2-1-react에서의-에러-바운더리란)
  - [2-2. 두가지 에러 바운더리 (Tost 메시지, FallBack UI)](#2-2-두가지-에러-바운더리-tost-메시지-fallback-ui)
- [3. 활동 (Action) — Toast 기반 ErrorBoundary 구현](#3-활동-action--toast-기반-errorboundary-구현)
  - [3-1. 기존 코드의 문제점](#3-1-기존-코드의-문제점)
  - [3-2. “Toast를 위한 ErrorBoundary”를 구상하기](#3-2-toast를-위한-errorboundary를-구상하기)
  - [3-3. QueryClientBoundary — TanStack Query의 에러를 전역에서 잡기](#3-3-queryclientboundary--tanstack-query의-에러를-전역에서-잡기)
  - [3-4. ErrorProvider \& ErrorCatcher 도입](#3-4-errorprovider--errorcatcher-도입)
  - [3-5. 구현 결과 — 선언적이고 깔끔한 에러 처리](#3-5-구현-결과--선언적이고-깔끔한-에러-처리)
- [4. 결과(Result) — 성공적으로 동작하는 Toast ErrorBoundary](#4-결과result--성공적으로-동작하는-toast-errorboundary)
  - [4-1. 토스트 기반 mutation 에러 처리](#4-1-토스트-기반-mutation-에러-처리)
  - [4-2. mutateAsync 에서 uncaught 오류가 난 이유](#4-2-mutateasync-에서-uncaught-오류가-난-이유)
  - [4-3. QueryCache와 Local ErrorBoundary 충돌 해결](#4-3-querycache와-local-errorboundary-충돌-해결)
- [5.마무리](#5마무리)
  - [5-1. 전체 코드](#5-1-전체-코드)
  - [참고 자료](#참고-자료)

<br/>
<br/>

# TanStack Query 기반 Toast ErrorBoundary 설계기

> 이전에 작성했던 '대시보드 UI 깨짐 현상 해결'과 연결되는 부분이다 <br/>
>
> [![디버깅 블로그 썸네일](/assets/images/thumbnail/woowa-level4-return-type.png){: width="300" .d-block }](https://mun-kyeong.github.io/woowa-level4-troubleshooting-return-type/)

# 1. 상황(Situation) — 왜 에러 바운더리가 필요했을까?

---

이전에 피드줍줍 대시보드에서 화면이 깨져버리는 문제가 있었다. <br/>
단순히 오류 메시지가 보이는 것뿐 아니라, 사용자 입장에서는 아무런 안내 없이 치명적인 에러 페이지가 그대로 표시되는 경험이 이어졌다.

이 문제를 되짚어보니, 예측 불가능한 에러를 전역적으로 안전하게 처리할 장치가 부족했다는 점, 즉 **에러 바운더리의 부재**가 핵심 원인이었다.

![dashboard-crash](/assets/images/blog/2025-11-03-woowa-level4-error-boundary/dashboard-crash.png){: width="500" .mx-auto .d-block }

이 경험을 통해 다음과 같은 목표를 세웠다. <br/>
**예상치 못한 에러가 발생해도 사용자에게 친화적인 UI와 안내를 제공하자!**

<br/>
<br/>

# 2. 업무(Task) - 어떤 형태의 ErrorBoundary를 설계할 것인가?

---

에러 바운더리에 대해 간단한 정의를 짚고 넘어가보자면

### 2-1. React에서의 에러 바운더리란?

에러 바운더리는 자식 컴포넌트에서 발생한 렌더링 **오류를 자동으로 감지**하고, U**I가 완전히 깨지는 것을 방지**하며, **대신 Fallback UI**를 보여주는 컴포넌트다.

[공식 문서](https://ko.legacy.reactjs.org/docs/error-boundaries.html)에서 제공하는 기본 형태는 다음과 같다.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

React 애플리케이션에서 **에러 바운더리(Error Boundary)**를 검색하면, <br/>
위에서 본 것처럼 클래스형 컴포넌트 형태가 공식 문서에서 권장되는 표준 방식이라는 걸 알 수 있다.

에러 바운더리를 이해하기 위해서 첫번째로 접근해본 방식은 “**에러바운더리는 왜 class로 이루어져있을까?**” 라는 질문이였다.

간단히 정리해 보자면, React 내부의 에러 복구 로직이 `componentDidCatch`, `getDerivedStateFromError` 같은 **클래스 전용 라이프사이클 메서드**를 기반으로 동작하기 때문이다.<br/>
즉, React 자체가 **클래스 인스턴스**를 전제로 에러 경계를 찾고 복구 지점을 제공하도록 설계되었기 때문에,<br/>
에러 바운더리는 오직 클래스형 컴포넌트로만 구현할 수 있었다.

> **조금 더 상세히 이해하고싶다면 ⬇️** <br/>
> React의 렌더링은 **Fiber 루프 내부에서 스케줄링되는 과정**이며, <br/>
> 렌더링 중 에러가 발생하면 React는 트리를 거슬러 올라가며 `componentDidCatch`나 `getDerivedStateFromError` 메서드를 가진 에러 바운더리를 찾는다.
>
> 이 메서드들은 **클래스 인스턴스(`this`)를 전제로 한 라이프사이클 메서드이기** 때문에,<br/>
> React는 **오직 클래스형 컴포넌트만을 에러 복구 지점으로 인식할 수 있는 것이다.**

따라서 우리는 이 ErrorBoundary를 사용해서 **렌더링 중 발생할 수 있는 에러**를 잡고,<br/>
사용자 친화적인 인터페이스를 제공하고자 한다.

<br/>

### 2-2. 두가지 에러 바운더리 (Tost 메시지, FallBack UI)

피드줍줍은 크게 두 종류의 에러를 처리해야 했다.

1. **Toast ErrorBoundary (Mutation 중심) — 내가 담당한 영역**

- `POST/PUT/DELETE` 같은 액션 기반 에러
- 화면 흐름을 막지 않고, 즉각적인 피드백만 주면 되는 상황
- → **Toast**로 가볍게 전달하면 충분

2. **Fallback ErrorBoundary (GET/권한 오류 등)**

- `GET` 실패, `인증/인가 오류`(401·403)
- 데이터를 아예 보여줄 수 없어 UI가 붕괴되는 경우
- → 페이지 이동·재시도 버튼 등 **Fallback UI**가 필요
- Global / Local ErrorBoundary 모두 사용
  - Global 에러 바운더리 : `<App>` 전체를 감싸는 에러 바운더리. <br/>
    앱 전체의 안정성을 유지하고 치명적 오류에서 사용자에게 탈출 경로를 제공한다.
  - Local 에러 바운더리 : 나머지 앱 흐름은 유지하면서 특정 컴포넌트에서 실패 지점만 격리 및 복구 한다.

> 에러 바운더리의 경우, 팀원인 `우디`와 함께 진행했고, <br/>
> 나는 Toast ErrorBoundary를, 우디는 Fallback ErrorBoundary를 맡아서 진행했다. <br/>
> 피드줍줍은 `Tanstack-query`의 `mutation`을 사용해서 데이터들을 다루고 있으므로, <br/>
> 이를 활용한 Tost 에러 바운더리를 만들어 볼 예정이다.

<br/>
<br/>

# 3. 활동 (Action) — Toast 기반 ErrorBoundary 구현

전체 구조
![diagram](/assets/images/blog/2025-11-03-woowa-level4-error-boundary/diagram.png)

### 3-1. 기존 코드의 문제점

기존에는 모든 API 커스텀 훅마다 직접 handleApiError를 넣어야 했다.

```jsx
onError: (error) => {
  handleApiError(error);
};
```

문제는 다음과 같다.

- 개발자가 **에러 처리를 반드시 기억**해야 한다
- 중복 코드가 많고 유지보수성이 떨어짐
- 에러 처리가 누락되면 예상치 못한 UI가 나타날 수 있음

즉, 개별 API 훅에서 에러를 관리하는 구조는 한계가 있었다. <br/>
**→ 전역에서 일관되게 에러를 처리하는 방식**이 필요했다.

<Br/>

### 3-2. “Toast를 위한 ErrorBoundary”를 구상하기

기존 ErrorBoundary는 Fallback UI에 최적화된 구조다.

```tsx
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
```

에러 바운더리의 `render()` 함수를 가져와봤는데, <Br/>
Toast는 **UI 대체**가 아닌 **“부가적 안내**”이므로 ErrorBoundary의 렌더링 흐름을 그대로 사용할 수 없다.

토스트를 띄우기 위해선 `children`을 유지한 채로 토스트 컴포넌트를 보여줘야 하는데, <br/>
children을 그대로 렌더링하면 무한 루프를 일으키기 때문이다.

그래서 ErrorBoundary의 장점인 **“전역에서 에러를 한 번에 감지한다”** <br/>
이 부분만 가져와, TanStack Query의 전역 캐시에서 발생하는 에러를 Toast로 전달하는 구조를 설계했다.

> **✨ 왜 mutation(POST/PUT/DELETE) 에러는 Toast로 처리해야 할까?**
>
> 앞서 말했듯이 mutation 계열 에러는 대부분 다음과 같은 성격을 가진다.
>
> - 사용자의 "행동"에 의해 발생
> - 화면 전체가 깨질 정도로 치명적이지 않음
> - 원래 UI는 그대로 유지되고, **단지 성공/실패 여부만 피드백**이 필요
>
> 여기서 중요한 이유가 하나 더 있는데, **ErrorBoundary는 비동기 오류를 잡을 수 없다는 것이다.** <br/>
> React의 ErrorBoundary는 **렌더링 단계에서 발생한 오류**만 감지할 수 있다. <br/>
> 즉, 다음과 같은 비동기 코드에서 발생하는 에러는 ErrorBoundary가 잡지 못한다.
>
> ```tsx
> async function handleSubmit() {
>   await api.post(...); // ❌ 여기에서 throw 되어도 ErrorBoundary는 감지 불가
> }
> ```
>
> React 공식 문서에서도 명시되어 있다. <br/>
> ErrorBoundary는 **이벤트 핸들러, Promise 내부, async/await 내부에서 발생한 에러를 잡을 수 없다.** <br/>
> 따라서 mutation 에러를 ErrorBoundary로 보내는 것은 구조적으로 맞지 않다.<br/>
> 실행 맥락 자체가 렌더링과 분리되어 있기 때문이다.

<br/>

### 3-3. QueryClientBoundary — TanStack Query의 에러를 전역에서 잡기

TanStack Query의 에러 레벨은 3단계다.

1. 로컬 : 각 훅에서 개별 처리 - `useQuery.onError`
2. 전역 캐시 : 앱 전체 공통 처리 - `queryCache.onError`
3. ErrorBoundary로 던지기 : 렌더 단계에서 throw - `throwOnError`

여기서 Toast ErrorBoundary는 **2단계(전역 캐시)**를 활용한다.

```tsx
queryCache: new QueryCache({
  onError: (error) => {
    throw error;
  }
}),
mutationCache: new MutationCache({
  onError: (error) => {
    updateAppError(error);
  },
}),
```

- mutation 오류 → Toast로 안내해야 함 → `updateAppError`
- query 오류 → Fallback UI로 넘겨야 함 → `throw error`

<br/>

### 3-4. ErrorProvider & ErrorCatcher 도입

TanStack Query의 전역 캐시(`QueryCache`, `MutationCache`)는 React 렌더링 트리 밖에서 동작한다. <br/>
그래서 이 위치에서 throw를 해도 React ErrorBoundary가 절대 잡지 못한다. <br/>

왜냐면 ErrorBoundary는 렌더링 중 발생한 오류만 감지할 수 있고, <br/>
비동기(onError, Promise, 네트워크 요청)에서 발생한 에러는 React가 추적하지 않기 때문이다. <br/>

이 문제를 해결하기 위해서는 <br/>
TanStack Query 내부(Promise 기반)에서 발생한 에러를 **React 렌더링 트리(Fiber) 안으로 다시 끌어오는 장치**가 필요했다. <br/>
이 역할을 수행하는 것이 바로 `ErrorProvider` + `ErrorCatcher` 조합이다.

전역 캐시에서 발생한 에러는 React의 ErrorBoundary가 직접 잡지 못하기 때문에, <br/>
먼저 `ErrorProvider`가 에러를 전역 상태로 저장하고,
`ErrorCatcher`가 이 상태 변화를 감지하여 **React가 이해할 수 있는 방식으로 오류를 다시 전파**한다.

**1. ErrorProvider — 비동기 에러를 React 상태로 끌어오기**

- `QueryCache/MutationCache`에서 발생한 에러를 ErrorProvider에서 `appError`라는 전역 상태로 저장하면 **“React의 상태 변경 → 컴포넌트 리렌더링”** 흐름을 타게 된다.<br/> 즉, 비동기 에러를 React 트리 내부로 가져오는 브릿지 역할을 수행하게 되는 것이다.

**2. ErrorCatcher — 상태 변화 감지 후 React 방식으로 재전파**

- ErrorProvider에 저장된 `appError` 값이 변경되면 ErrorCatcher가 리렌더링된다.
- 이때 다음과 같은 분기 처리를 수행하게 된다.

```tsx
if (appError instanceof ApiError) {
  showToast(appError.message);
} else {
  throw appError;
}
```

이 분기문에서는 Mutation 오류와 Query 오류를 서로 다른 방식으로 처리 하여 <br/>
사용자 경험과 React의 에러 처리 구조를 모두 만족시키는 역할을 한다.

- **Mutation 오류 → Toast로 처리**

Mutation(POST/PUT/DELETE)은 비동기 액션이며,
ErrorBoundary가 포착할 수 없는 영역에서 발생한다. <br/>
따라서 `ApiError`로 분류된 경우에는
UI를 깨지 않고 Toast 형태로 가볍게 사용자에게 알린다.

- **Query 오류 → ErrorBoundary로 재-던짐**

Query(GET)는 렌더링 중 실행되며,
React Query에서 `throwOnError: true`를 통해<br/>
React 렌더링 단계로 에러를 전달할 수 있다.

![full-logic](/assets/images/blog/2025-11-03-woowa-level4-error-boundary/full-logic.png)

![diagram](/assets/images/blog/2025-11-03-woowa-level4-error-boundary/diagram.png)

<br/>

### 3-5. 구현 결과 — 선언적이고 깔끔한 에러 처리

이제 개별 훅은 에러 처리 코드를 넣을 필요 없이
오직 성공 로직만 작성하면 된다

```jsx
const { mutate } = useMutation({
  mutationFn: postAdminLogout,
});
```

전역에서 에러를 캐치하므로 훨씬 간결해졌다.

<br/>
<br/>

# 4. 결과(Result) — 성공적으로 동작하는 Toast ErrorBoundary

<br/>

### 4-1. 토스트 기반 mutation 에러 처리

before : 모달창으로 보이던 에러 메시지
![before](/assets/images/blog/2025-11-03-woowa-level4-error-boundary/before.gif){: width="400" .mx-auto .d-block }

after : 토스트 형식으로 변경
![after](/assets/images/blog/2025-11-03-woowa-level4-error-boundary/after.gif){: width="400" .mx-auto .d-block }

기존의 복잡했던 onError 로직이 사라지고,
모든 mutation 에러는 전역 ErrorCatcher를 통해 Toast로 처리된다.

- 개별 컴포넌트 예시

```tsx
// before
export function useLogout() {
  const { goPath } = useNavigation();
  //   const { showErrorModal } = useErrorModalContext();  -> 제거

  const { mutate: handleLogout } = useMutation({
    mutationFn: postAdminLogout,
    // onError: (e) => {                -> 전역으로 옮겨짐 (제거)
    //   showErrorModal(e, '에러');
    // },
    onSuccess: () => {
      resetLocalStorage("auth");
      goPath("/");
    },
    onSettled: () => {
      NotificationService.removeToken();
    },
  });

  return {
    handleLogout,
  };
}
```

- QueryClient (전역)

```tsx
// updateAppError로 에러 context 상태 변경
mutationCache: new MutationCache({
  onError: (error: Error) => {
    updateAppError(error);
  },
}),
```

- ErrorCatcher (전역)

```tsx
// appError로 에러 context 구독 & 상태 변경 시 토스트 띄우기.
// 만약 에러가 ApiError 타입이 아니라면 ErrorBoundary로 위임
export const ErrorCatcher = () => {
  const { appError } = useErrorContext();
  const { showToast } = useToast();

  if (!appError) return;
  if (appError instanceof ApiError) {
    showToast(appError.message);
    return;
  }
  throw appError;

  return <></>;
};
```

<br/>

### 4-2. mutateAsync 에서 uncaught 오류가 난 이유

아래 코드처럼 mutateAsync는 try-catch가 없으면 함수 호출부로 에러가 전파된다.

- before

```tsx
await deleteMutation.mutateAsync(); // 에러 발생 시 uncaught
```

- after : try-catch로 감싸 해결

```tsx
try {
  await deleteMutation.mutateAsync({ feedbackId });
} catch (e) {
  console.error(e);
  return;
}
```

<br/>

### 4-3. QueryCache와 Local ErrorBoundary 충돌 해결

```tsx
new QueryClient({
  defaultOptions: {
    mutations: {
      networkMode: "always",
    },
    queries: {
      throwOnError: false,
    },
  },
  // 이 부분을 제거해서 query 오류일 경우 'throwOnError' 속성을 통해 에러가 전파되도록!
  //   queryCache: new QueryCache({
  //     onError: (error: Error) => {
  //       updateAppError(error);
  //     },
  //   }),
  mutationCache: new MutationCache({
    onError: (error: Error) => {
      updateAppError(error);
    },
  }),
});
```

- Query는 Fallback UI로 보내야 하므로 `queryCache` 부분을 제거해 <br/> 에러 발생시 `throwOnError`를 통해 상위로 전파되도록 한다.
  ![query](/assets/images/blog/2025-11-03-woowa-level4-error-boundary/query.png)

- Mutation은 Toast로 보내야 하므로 `mutationCache`에서 `updateAppError`를 호출해 <Br/> 에러 상태 업데이트를 통한 토스트 메시지를 보여준다.
  ![mutation](/assets/images/blog/2025-11-03-woowa-level4-error-boundary/mutation.png)

<br/>
<br/>

# 5.마무리

---

이번 작업을 통해 다음과 같은 결과를 얻었다.

- 전역 단위에서 선언적으로 에러를 관리
- mutation 오류는 Toast, query 오류는 Fallback UI로 분리
- TanStack Query 기반 ErrorBoundary 구조 완성
- 코드 중복 제거 및 유지보수성 향상

특히 QueryClient + ErrorContext + ErrorBoundary를 조합함으로써 <br/>
UI 안정성과 사용자 경험을 한층 강화할 수 있었다.

<br/>

### 5-1. 전체 코드

- `QueryClientBoundary`

  ```tsx
  export default function QueryClientBoundary({
    children,
  }: QueryClientBoundaryProps) {
    const { updateAppError } = useErrorContext();

    const [queryClient] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            mutations: {
              networkMode: "always",
            },

            queries: {
              // ✔ Query 에러는 throwOnError로 ErrorBoundary에 자동 전파됨
              //    (쿼리가 렌더링 중 실패하면 훅이 직접 throw → ErrorBoundary에서 catch)
              throwOnError: true,
            },
          },

          mutationCache: new MutationCache({
            // ✔ Mutation 에러는 React 렌더링 외부에서 발생하므로
            //    ErrorBoundary가 자동으로 잡을 수 없음.
            //    따라서 에러를 전역 상태(appError)에 넣어
            //    ErrorCatcher가 렌더링 중에 다시 throw하도록 만든다.
            onError: (error: Error) => {
              updateAppError(error);
            },
          }),
        }),
    );

    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  ```

- `ErrorCatcher`

  ```tsx
  export const ErrorCatcher = () => {
    const { appError } = useErrorContext();
    const { showToast } = useToast();

    // ✔ 전역 appError 변경 시 ErrorCatcher가 다시 렌더링됨
    //    (Context의 상태 변경 → 리렌더)
    //    이 렌더링 과정에서 throw가 일어나야 ErrorBoundary가 감지할 수 있음.

    if (!appError) return null;

    if (appError instanceof ApiError) {
      // ✔ 비즈니스 레벨 에러는 Toast로만 처리하고 ErrorBoundary로 넘기지 않음
      showToast(appError.message || "알 수 없는 오류가 발생했습니다.");
      return null;
    }

    // ✔ 예상치 못한 오류는 렌더링 중 throw → ErrorBoundary가 정확하게 catch함
    throw appError;
  };
  ```

- 라우터 구조

  ```tsx
  <ErrorProvider>
    {/* 전역 에러 상태(appError) 저장 */}

    <QueryClientBoundary>
      {/* TanStack Query 설정: 
        - Query 에러 → throwOnError로 ErrorBoundary로 직접 전달
        - Mutation 에러 → appError에 저장 */}

      <GlobalErrorBoundary fallback={GlobalErrorFallback}>
        {/* 렌더링 중 throw되는 에러를 catch하는 실제 ErrorBoundary */}

        <ErrorCatcher />
        {/* appError 감지 → 
          ApiError면 Toast,
          그 외엔 렌더링 중 throw → ErrorBoundary가 catch */}

        <Suspense fallback={<Loading />}>
          <App />
        </Suspense>
      </GlobalErrorBoundary>
    </QueryClientBoundary>
  </ErrorProvider>
  ```

## 참고 자료

- https://www.youtube.com/watch?v=012IPbMX_y4
- https://www.youtube.com/watch?v=RvsMwyysUHI
- https://happysisyphe.tistory.com/52
