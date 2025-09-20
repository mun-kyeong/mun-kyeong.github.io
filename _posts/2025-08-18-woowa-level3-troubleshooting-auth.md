---
layout: post
title: "[우테코] level-3 / 401 권한 리다이렉트 리렌더링 이슈"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/woowa-level3-401.png
---

> 요약 <br/>
> 401 권한 에러가 생겼을 때 유저 정보를 초기화 시키고 로그인 페이지로 리다이렉트 시키는 과정에서 겪었던 짧은 트러블슈팅 내용입니다.
> <br/> 절대로 router 안에서 함수 실행 결과를 넣어선 안돼..

<br/>

---

## 목차

- [🚨 401 에러 핸들링: 무한 리렌더링 트러블 슈팅](#-401-에러-핸들링-무한-리렌더링-트러블-슈팅)
  - [첫 번째 문제: 401 에러와 로그아웃 API](#첫-번째-문제-401-에러와-로그아웃-api)
  - [두 번째 문제: 무한 리렌더링의 늪](#두-번째-문제-무한-리렌더링의-늪)
  - [문제의 원인](#문제의-원인)
  - [해결책: 태그로 컴포넌트 감싸기](#해결책-태그로-컴포넌트-감싸기)
  - [후기](#후기)

---

# 🚨 401 에러 핸들링: 무한 리렌더링 트러블 슈팅

로그인, 회원가입 로직을 추가하면서 권한 문제로 인한 리다이렉션 처리가 필요했다. <Br/>
특히 401(Unauthorized) 에러는 사용자 인증이 되지 않았다는 뜻이므로 사용자 정보를 초기화해야 했다.

백엔드 팀과 논의한 끝에, 만료되거나 유효하지 않은 세션 ID를 지우고 로컬 스토리지에 저장된 유저 정보를 삭제한 다음 **로그인 페이지로 리다이렉트하기로 결정**했다.

## 첫 번째 문제: 401 에러와 로그아웃 API

초반에 문제가 됐던 건 401(Forbidden) 에러였다.

백엔드에서는 **올바른 세션 ID가 있을 때만 로그아웃 API가 정상 작동**하도록 설계됐던 것이다.

하지만 사용자가 악의적으로 세션 ID를 수정하면 유효하지 않은 토큰이 되므로 <br/>**로그아웃 API 호출 시 401 에러가 발생**했고, 결국 토큰을 삭제하는 로직을 실행할 수 없었다.

이 문제는 백엔드에서 해결해 주었다.

유효하지 않은 세션 ID가 들어오면 잘못된 토큰으로 인식하고 무효화 처리하는 로직을 추가했다. <br/>덕분에 프론트엔드에서는 사용자를 로그인 페이지로 강제 리다이렉션하는 로직만 구현하면 되었다.

## 두 번째 문제: 무한 리렌더링의 늪

401 에러가 발생했을 때 서버에서 무효화 처리는 잘 작동했다.<br/> 로컬 스토리지에서 auth 정보도 성공적으로 지웠다.

그런데 **로그인 페이지로 리다이렉션하는 과정에서 무한 리렌더링 문제가 발생**했다.

## 문제의 원인

문제의 원인은 **‘로그인 상태인지’**를 확인하고 라우팅을 처리하는 로직 때문이었다.

<strong style="color: chocolate;">현재 로그인 상태</strong>라면 <span style="color: tan;">로그인/회원가입 페이지 접근 시 dashboard로 리다이렉션</span>하고, <br/>
<strong style="color: chocolate;"> 401 에러가 발생</strong>하면 <span style="color: tan;">다른 모든 페이지에서 로그인 페이지로 리다이렉션</span>하는 로직이 꼬인 것이다.

이 현상은 Router 설정에 문제가 있었는데, 코드를 살펴보면 다음과 같다.

```javascript

// router.tsx
{
  path: ROUTES.SIGN_UP,
  element: getAuthRedirectElement(<SignUp />),
},

const getAuthRedirectElement = (Component: React.ReactNode) => {
  return isAuthenticated() ? (
    <Navigate to={ADMIN_BASE + ROUTES.ADMIN_HOME} replace />
  ) : (
    Component
  );
};

// 401 에러일 때 실행되는 함수
const handleApiError = async (error: ApiError) => {
  if (error.status === 401) {
    try {
      await postAdminLogout();
      resetLocalStorage('auth');
      showErrorModal(error, '로그인 권한 없음');
      navigate('/login');
    } catch (e) {
      console.log('로그아웃 실패', e);
    }
  }
};
```

코드만 봐서는 문제가 없어 보였지만, 여기에 치명적인 실수가 숨어있었다.

바로 `element: getAuthRedirectElement(<SignUp />)` 이 부분이다. 무한 리렌더링의 정확한 과정은 다음과 같다.

1. 401 에러 발생 및 handleApiError 함수 실행.

2. Maps('/login')으로 라우팅을 시도한다.

3. router.tsx에서 <Login /> 매칭

   - element: getAuthRedirectElement(<Login />) 실행
   - 내부에서 isAuthenticated() 호출

4. isAuthenticated() 결과 확인

   - 로그인 토큰이 지워졌으므로 false 반환. 따라서 `<Login/>` ReactNode가 리턴

5. Router가 <Login /> 렌더링

   - 하지만 여기서 중요한 점은 Router는 단순히 “JSX 트리”를 받는 게 아니라,<strong style="color: chocolate;">
     매번 라우팅할 때마다 getAuthRedirectElement()를 다시 호출해서 새로운 ReactNode 인스턴스를 받는다는 것.</strong>

6. React는 새로운 element로 인식

   - getAuthRedirectElement(<Login />) 실행 결과는 이전 렌더와 같은 <Login /> 모양이지만,
     매번 **새로운 객체(ReactNode 인스턴스)**가 만들어짐
   - React Router는 이를 “다른 element”라고 보고, 다시 라우팅 매칭

7. Router 재매칭 → getAuthRedirectElement 재호출
   - Router는 또 /login 경로를 매칭
   - 다시 getAuthRedirectElement(<Login />) 실행
   - 또 <Login />을 반환
   - React는 다시 새로운 element로 인식

이렇게 위 과정이 무한히 반복되게 되는 것이다.

처음에는 도저히 원인을 찾지 못해 하루를 통째로 디버깅에 쏟아부었다. <br/>
정말 답답해서 포기하고 싶은 마음이 들었지만, 지금 해결하지 못하면 나중에 더 큰 문제로 돌아올 것을 알기에 디버깅 하는 데에만 하루를 다 쏟았던 것 같다.

## 해결책: 태그로 컴포넌트 감싸기

문제의 원인을 깨닫고 나니 해결책은 의외로 간단했다 <br/>router에서 함수를 직접 실행하는 방식이 문제였다.

router.tsx가 로딩될 때 한 번만 실행되도록 태그로 감싸서 현재 페이지를 검증하는 방식으로 코드를 수정했다.

```javascript

// 기존 방식:
element: getAuthRedirectElement(<Login />),

// 수정 후 방식:
element: (
  <AuthRedirectRoute>
    <Login />
  </AuthRedirectRoute>
),

```

이렇게 컴포넌트로 감싸는 방식으로 변경하니 무한 리렌더링이 깔끔하게 해결되었다.

AuthRedirectRoute 컴포넌트 내에서 인증 상태를 확인하고 라우팅을 처리하게 함으로써, 라우팅이 반복적으로 재실행되는 것을 막을 수 있었다.

## 후기

이번 경험을 통해 router에서 함수를 직접 실행하는 방식이 얼마나 위험한지 깨달았다.

특히 리액트 라우터와 상태 관리를 함께 사용할 때는 컴포넌트 라이프사이클과 렌더링 과정을 정확하게 이해하는 것이 정말 중요함을 다시 한번 느끼게 된 것 같다.
