---
layout: post
title: "PNU backend-bootcamp 0729 키워드"
author: munkyeong
categories: [study]
image: assets/images/thumbnail/backend-bootcamp.png
---

> 요약 <br/>
> PNU 백엔드 부트캠프 1일차 - 수업을 들으며 공부한 내용을 정리한 글입니다.
>
> 1.  Spring VS Spring Boot
> 2.  Spring Boot Controller
> 3.  H2 DataBase
> 4.  ORM
> 5.  Lombok이란

<br/>

## 1. Spring Boot VS Spring

Spring과 Spring Boot 모두 java 기반의 애플리케이션 개발을 위한 프레임워크이지만 사용 방식과 목적에 따라 차이가 있다.

### Spring

Spring framework라고도 불리는데 주로 java EE (Enterprise Edition : 분산 ) 애플리케이션을 빌드할 수 있게 해주는 오픈소스 프레임워크이다.

Spring framework가 가지고 있는 특징으로는

1. `유연성` : 필요한 모듈만 선택적으로 가져와 사용가능하다. ( xml, annotation, class 등을 통해 설정)
2. `모듈화` : 다양한 모듈을 제공한다. 스프링 MVC, 스프링 시큐리티 등
3. `DI (의존성 주입)` : spring의 의존성 주입을 통해 객체 간의 관계를 설정해준다.

  <br/>

### Spring Boot

스프링 프레임워크를 기반으로 하며, 설정 작업을 최소화 하고 빠르게 애플리케이션을 개발할 수 있도록 도와주는 확장 프로젝트이다.
Spring Boot는 프로덕션 준비 기능을 포함하고 있어 애플리케이션을 더욱 쉽고 배포하고 운영할 수 있다.

Spring Boot의 특징으로는

1. `자동설정` : 다양한 기본 설정을 자동으로 제공하기에 설정 작업에 투자하는 시간이 줄어든다.
   +) `@SpringBootApplication` annotation 하나로 여러 설정을 간단하게 활성화 가능하다
2. `임베디드 서버` : 임베디드 톰캣 , 제티 등을 내장하고 있어 별도의 서버 설정 없이 애플리케이션을 바로 실행 가능하다
3. `Starter 종속성` : Spring Boot Starter를 통해 기능에 필요한 의존성을 쉽게 추가 가능

  <br/>

> 요약 <br/> > **Spring Framework** :많은 설정 작업이 필요하기에 초기 설정이 복잡할 수 있으나, 더 많은 유연성과 통제력을 제공한다. <br/> > **Spring Boot** : 자동 설정 기능과 스타터 종속성을 통해 애플리케이션을 빠르게 시작할 수 있다. 특정 상황에서는 수동 설정이 필요할수도 있으나 개발 생산성과 편의성을 극대화 한다는 장점이 있다.

이번 실습의 경우 [Spring initializr](https://start.spring.io/) 를 통해 프로젝트를 생성하고 github에 upload 하여 사용하였다.

이전 부트캠프때는 DI 의존성 주입부터 시작해서 Spring 환경 설정에 더 많은 시간을 쏟아부었었는데 확연히 Spring Boot를 사용해보니 전보다 더 빠르게 사용되는걸 확인할 수 있었다.

<br/>
<br/>

## 2. Spring Boot Controller

<br/>
<br/>

## 3. H2 DataBase 정의

<br/>
<br/>

## 4. ORM 정의

<br/>
<br/>

## 5. Lombok이란
