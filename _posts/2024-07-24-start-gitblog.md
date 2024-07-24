---
layout: post
title: "gitBlog 작성 시 마주한 문제와 해결 방법 "
author: munkyeong
categories: [study, etc]
image: assets/images/thumbnail/gitblog.png
---

> 요약
>
> GitBlog를 작성하며 마주했던 문제들과 그 해결 방법을 정리한 글입니다.

<br/>

### 1. CSS 스타일이 적용되지 않을 때: 캐싱 문제 해결하기

---

[ 문제상황 ]

프로필 페이지를 생성할 때 CSS가 적용되지 않는 문제 발견
local 환경에서는 적용이 되지 않았으나 배포 환경에서는 CSS가 적용되는 것을 확인

[ 해결방법 ]

`default.html` 파일에서

```html
<!-- 변경전 -->
<link href="{baseURL}/css/screen.css" />

<!-- 변경후 : ?after 추가-->
<link href="{baseURL}/css/screen.css?after" />
```

위의 코드 부분의 href 주소 코드 뒤에 `?after` 코드 추가

CSS가 적용되지 않았던 이유는 브라우저가 캐싱된 CSS 파일을 사용했기 때문입니다.

`?after`를 URL 뒤에 추가하는 것은 **브라우저 캐시를 무력화** 하는 역할을 합니다. 이를 통해 브라우저가 캐시된 버전이 아닌 **최신 버전의 CSS 파일을 로드**하도록 강제할 수 있습니다.
