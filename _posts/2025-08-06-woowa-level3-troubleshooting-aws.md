---
layout: post
title: "[우테코] level-3 / S3·CloudFront 트러블슈팅"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/woowa-level3-aws.png
---

> 요약 <br/>
> 개발/운영 분리 과정에서 발생한 HTTPS·S3·CloudFront 이슈 정리입니다.

<br/>

---

## 목차

- [목차](#목차)
- [S3와 CloudFront? 그게 뭐지?](#s3와-cloudfront-그게-뭐지)
  - [Amazon S3 (Simple Storage Service)](#amazon-s3-simple-storage-service)
  - [Amazon CloudFront](#amazon-cloudfront)
- [문제 상황](#문제-상황)
  - [💥 첫 번째 난관: HTTPS와 HTTP의 충돌](#-첫-번째-난관-https와-http의-충돌)
  - [🪏 S3 삽질 시작...](#-s3-삽질-시작)
    - [**1. S3 버킷 주소 노출 문제**](#1-s3-버킷-주소-노출-문제)
    - [**2. HTML 파일 접근 문제**](#2-html-파일-접근-문제)
  - [😩 두번째 난관 : CORS와 리디렉션](#-두번째-난관--cors와-리디렉션)
- [결론: 돌고 돌아 제자리 🚶](#결론-돌고-돌아-제자리-)

---

<br/>
<br/>

## S3와 CloudFront? 그게 뭐지?

문제 상황을 설명하기에 앞서, S3와 CloudFront에 대해 간략히 짚고 넘어가면 좋을 것 같다.

![s3 + cloudFront](/assets/images/blog/2025-08-06-woowa-level3-troubleshooting/s3-cloudFront.png)

<br/>

### Amazon S3 (Simple Storage Service)

S3는 쉽게 말해서 파일을 보관하는 아주 큰 창고다. <Br/>
우리가 만든 HTML, CSS, JS, 이미지 같은 정적 파일들을 올려두면, 인터넷을 통해 언제든 꺼내 쓸 수 있다.

- <strong style="color: chocolate;">정적 웹사이트 호스팅</strong>: 서버를 따로 두지 않고, S3에 올린 파일을 그대로 웹사이트처럼 보여줄 수 있다.
- <strong style="color: chocolate;">안정성</strong>: 웬만해서는 파일이 사라지지 않고 안전하게 보관된다.
- <strong style="color: chocolate;">공개 접근 가능</strong>: 퍼블릭 설정을 하면 누구든 주소(URL)만 알면 접근할 수 있다.

하지만 한계가 있다.<br/>
👉 S3에서 제공하는 **정적 웹사이트 호스팅 엔드포인트**는 HTTP만 지원한다.<br/>
즉, 안전하게 HTTPS로 사이트를 서비스하려면 CloudFront 같은 다른 도구를 붙여야 한다.<br/>

<br/>

### Amazon CloudFront

CloudFront는 AWS가 제공하는 콘텐츠 배달 서비스(CDN)다. <br/>
쉽게 비유하자면, S3 창고 앞에 놓은 편의점 체인망이다.

- <strong style="color: chocolate;">빠름</strong>: 사용자가 멀리 있어도 가까운 CloudFront 지점(엣지 서버)에서 콘텐츠를 가져오니 속도가 빠르다.
- <strong style="color: chocolate;">HTTPS 지원</strong>: CloudFront에 도메인을 연결하고 인증서를 붙이면, HTTPS 보안 연결을 쉽게 제공할 수 있다.
- <strong style="color: chocolate;">보안 강화</strong>: CloudFront만을 통해서 S3에 접근하도록 막을 수 있어, S3가 외부에 직접 노출되지 않는다.

즉, CloudFront는 S3에서 꺼낸 파일을 빠르고 안전하게 전 세계 사용자에게 전달하는 배달망이다. <br/>
S3 혼자서는 HTTP만 가능한데, CloudFront를 붙이면 HTTPS도 되고, 속도와 보안도 챙길 수 있다.

<br/>

## 문제 상황

---

먼저 문제 상황부터 풀어보면, 프로덕션 환경은 이미 S3와 CloudFront를 기반으로 구축되어 있었다.

하지만, 프로덕션 환경과 별개로 백엔드 개발자들이 자유롭게 테스트할 수 있는 **개발 환경**을 구축해야 했다. <br/>
기존 배포 환경(S3 + CloudFront)과 동일하게 만들려고 했는데, 여기서부터 문제가 시작됐다.

---

### 💥 첫 번째 난관: HTTPS와 HTTP의 충돌

**CloudFront는 HTTPS 인증서를 자동으로 붙여주는데, 우리 개발 서버 API 주소는 HTTP였다.** <br/>
프론트엔드에서 HTTPS로 HTTP API에 요청을 보내는 건 보안상 불가능했다. 그래서 두 가지 선택지 중 하나를 택해야 했다.

<p style="color: darkgray;">(데모데이까지 얼마 남지 않은 상황이라 http에 인증서를 붙이는 일이 조금 번거로웠다고 전해 들었다.)</p>

1. CloudFront를 사용하지 않고 S3에 직접 접근해서 <strong style="color: chocolate;">HTTP로 통신하기</strong><br/>
   <p style="color: darkgray;">S3(http) + API 개발 서버 주소 (http)</p>

2. API 주소에 HTTPS 인증서를 붙이고 CloudFront를 통해 <strong style="color: chocolate;">HTTPS로 통신하기</strong> <br/>
   <p style="color: darkgray;">cloudFront(https) + API 개발 서버 주소 + 인증서 (https)</p>

백엔드팀과 논의 끝에, 우선은 비용 부담이 적은 첫 번째 방법으로 가기로 했다. <br/>
어차피 내부에서만 쓸 **'개발 서버'**니까 S3에 직접 접근하는 것도 괜찮다고 판단했다.

---

### 🪏 S3 삽질 시작...

S3에 직접 접근하기로 마음먹었지만, 해결해야 할 문제가 많았다.

##### **1. S3 버킷 주소 노출 문제**

S3 버킷 주소는 공개되어 있어서 누구나 요청을 보낼 수 있다는 점이 문제가 되었다.

이 버킷은 우리 팀만 쓰는 것이 아니라 우테코 7기 모든 팀이 함께 사용하는 공용 버킷이었기에, <br/>
S3 주소가 노출되면 팀 전체에 영향을 미칠 수 있었다.

##### **2. HTML 파일 접근 문제**

빌드한 프로젝트를 S3에 업로드했는데, HTML 파일이 보이지 않았다. <br/>

S3 웹사이트 호스팅은 **도메인 루트를 버킷 루트와 매핑**하기 때문에, 특정 폴더를 도메인 루트로 바로 연결할 수 없었다. <br/>
우리는 버킷 안에 팀별로 폴더를 만들고 그 안에 `index.html`을 넣어두었던 게 문제였다.

이 문제를 해결하기 위해 개발 환경과 프로덕션 환경의 basename을 서로 다르게 설정해야 했다. <br/>
로컬에서는 `/`를 루트로 사용하지만, 공용 버킷 안의 팀 전용 폴더(`feedzupzup/`)에 접근하려면 라우팅 경로가 `/feedzupzup/...` 형태여야 했다. <br/>
즉, 개발 환경에서는 `/feedzupzup/...` 경로를 기준으로, 프로덕션 환경에서는 `/`를 기준으로 라우팅하도록 구분해야 했던 것이다.

![s3-cloud-code](/assets/images/blog/2025-08-06-woowa-level3-troubleshooting/s3-cloud-code.png)

---

### 😩 두번째 난관 : CORS와 리디렉션

basename 설정을 마치고 나니 이제 CORS 오류가 발생했다..... 😥 <br/>
이 문제를 해결하기 위해 백엔드팀과 함께 서브 도메인을 이용해 S3 버킷 주소로 리디렉션하는 방안을 논의했다.

그런데 이것도 안 됐다. <br/>
**도메인으로 설정할 수 있는 주소는 S3 버킷의 루트 경로까지만 가능**했던 것이다.

`{버킷주소}.amazonaws.com` 까지는 가능하지만, 그 안에 있는 특정 폴더(feedzupzup/index.html)로는 리디렉션이 불가능했다.

결국, 이 방법은 포기해야 했다.

<br/>

## 결론: 돌고 돌아 제자리 🚶

수많은 시도와 삽질 끝에, 우리는 결국 처음으로 돌아왔다.

**"그냥 개발 환경도 API 도메인 주소에 HTTPS 인증서를 붙이고 CloudFront를 통해 접근하자!"**

가장 복잡하고 비용이 많이 드는 것처럼 보였던 방법이 사실은 가장 안정적인 길이었다.

많이 돌고돌았지만 .. S3 버킷의 동작 방식, cloudFront를 조금 더 잘 이해할 수 있는 시간이였다.
