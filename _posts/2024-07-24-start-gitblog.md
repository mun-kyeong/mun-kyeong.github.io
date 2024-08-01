---
layout: post
title: "gitBlog 작성 시 마주한 문제와 해결 방법 "
author: munkyeong
categories: [project, etc]
image: assets/images/thumbnail/gitblog.png
featured: true
---

> 요약 <br/>
> GitBlog를 작성하며 마주했던 문제들과 그 해결 방법을 정리한 글입니다.
> [ Cashing, font style]

<br/>

## 1. CSS 미적용 : 캐싱 문제 해결

---

프로필 페이지를 생성할 때 CSS가 적용되지 않는 문제 발견
local 환경에서는 적용이 되지 않았으나 배포 환경에서는 CSS가 적용되는 것을 확인

`default.html` 파일에서

```html
<!-- 변경전 -->
<link href="{baseURL}/css/screen.css" />

<!-- 변경후 : ?after 추가-->
<link href="{baseURL}/css/screen.css?after" />
```

위의 코드 부분의 href 주소 코드 뒤에 `?after` 코드 추가

CSS가 적용되지 않았던 이유는 브라우저가 캐싱된 CSS 파일을 사용하고 있었기 때문이였다.

`?after`를 URL 뒤에 추가하는 것은 브라우저 캐시를 무력화 하며, 브라우저가 캐시된 버전이 아닌 **최신 버전의 CSS 파일을 로드**하도록 강제할 수 있다.

+) 추가 : 위의 방법을 통해서도 변경된 CSS가 적용 안되는 경우가 있었는데 그 부분들은 chrome 시크릿 창으로 접속했더니 적용된 CSS를 확인 할 수 있있다!

<br/><br/>

## 2. Font Style 변경

---

기본 템플릿은 영어에 맞춰져있어서 한글용 새 폰트 스타일을 새로 적용하게 되었다.

[폰트 템플릿 URL - 눈누](https://noonnu.cc/index?order_by=vd&category_style_ids=1&size=25) 해당 사이트에서 원하는 폰트 스타일을 가져온 후 `main.scss` 파일에 아래 코드를 삽입

```scss
@font-face {
  font-family: "Pretendard-Regular";
  src: url("https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff")
    format("woff");
  font-weight: 300;
  font-style: normal;
}
```

`screen.css` 파일에서 원하는 class의 `font-family` 속성으로 가져온 폰트 스타일을 적용시켜주었다!

```css
.article-post {
  /* 수정된 부분 */
  font-family: "Pretendard-Regular";
  font-size: 1.1rem;
  line-height: 1.84;
  color: rgba(0, 0, 0, 0.8);
}
```

<br/><br/>

## 3. 사이드 목록 만들기 (TOC)

글이 길어질수록 목록이 필요하다는 생각이 들었다.

원래는 사이드바에 공유 탭이 같이 움직였었는데 이 공유 탭을 목차 탭으로 변경했다. <br/>
[TOC 구현하기 참고 사이트](https://wookshin.github.io/2022/04/19/toc.html)의 도움을 많이 받았고, 해당 블로그와의 템플릿이 달랐기때문에 나의 환경에 맞게 조금씩 변경하면서 적용했다.

추가로 위의 블로그의 경우, html과 JS, CSS를 하나의 .html 파일 안에서 작성중이였기에 나는 따로 `toc.js` 파일과 `screen.css` 파일에 나누어 작성했다. .html 파일 안에 꼭 필요한게 아니라면 JS나 CSS의 역할은 구분하고 싶었기에,,

```javascript
window.onload = async () => {
  if (!document.querySelector(".posttitle")) return;
  await createToc();
};
```

위 방식과 같이 document 중에서 'posttitle' 이라는 class 이름을 가진 태그가 나온다면 (`post.html` 에 해당 class 이름을 가진 태그가 존재) `createToc()` 함수를 실행시키는 방식으로 구현했다.

<br/><br/>

## 4. github.io 잔디 옮기기

git블로그 환경 세팅을 포함해서 변경된 UI 확인도 할겸 commit 과 push 를 굉장히 열심히 했었는데,, 어느순간 보니까 내 github에 기록이 잔디로 안남아있었다,,

알고보니 fork()를 통해 clone한 repository의 경우 commit 기록이 안남는다나,,
(내 깃블로그의 경우 템플릿 fork()를 통해 생성된 리포지토리에서 작업중이였다)

이왕 깃블로그 쓰는거라면 잔디 기록을 놓치는게 아까워서 누락된 commit 기록을 추가할 수 있는 방법을 찾아보니 [깃허브 잔디 누락 현상](https://kdjun97.github.io/git-github/plant-grass/) 이 블로그의 도움을 많이 받았다.

결과만 말하자면

1. 원래 fork() 된 채로 남아있던 `mun-kyeong.github.io` 리포지토리 이름 변경 -> `mun-kyeong.blog` 이라 부르겟음

2. 잔디 기록을 남길 수 있는 `mun-kyeong.github.io` 리포지토리 생성 (fork()된 리포지토리가 아니라 완전 새로 생성된 리포지토리다)

3. 로컬에서 아무런 폴서 생성 후 이전의 `munkyeong.blog` clone 받기

   1. 이때, mac에서 clone 명령어 실행 시에는 인증토큰 문제가 있을 텐데 [Github 연동 사용법 - Mac OS](https://wg-cy.tistory.com/343) 여길 참고해도 되고 나같은 경우는
      `https://[깃헙 인증토큰]@github.com/[사용자 이름]/[리포지토리 경로]`
      위의 github 경로를 clone 했더니 인증 토근문제 해결되었다

4. 로컬에서 이전 `munkyeong.blog` 깃헙 clone 받고 `munkyeong.github.io` 리포지토리로 mirror push
   1. 이때 여기서도 마찬가지로 **인증토큰** 사용해서 github url 로 push 해야함!

> 위의 과정 명령어는 [깃허브 잔디 누락 현상](https://kdjun97.github.io/git-github/plant-grass/) 여기 블로그에 정리 잘 되어있다! 여기 참고하면 될듯
> 알아야 할 점이라면 mac OS일 경우 인증토큰 있어야 clone + mirror push 제대로 가능하다는거
