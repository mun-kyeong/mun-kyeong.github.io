---
layout: post
title: "gitBlog 작성 시 마주한 문제와 해결 방법 "
author: munkyeong
categories: [study, etc]
image: assets/images/thumbnail/gitblog.png
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
