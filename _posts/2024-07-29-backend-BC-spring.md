---
layout: post
title: "PNU backend-bootcamp 0729 키워드 "
author: munkyeong
categories: [study]
image: assets/images/thumbnail/backend-bootcamp.png
---

> 요약 <br/>
> PNU 백엔드 부트캠프 1일차 - 수업을 들으며 공부한 내용을 정리한 글입니다.

<br/>

## 1. Spring Boot VS Spring

---

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

> 요약 <br/> > **Spring Framework** > <br/>많은 설정 작업이 필요하기에 초기 설정이 복잡할 수 있으나, 더 많은 유연성과 통제력을 제공한다.
>
> **Spring Boot** > <br/>자동 설정 기능과 스타터 종속성을 통해 애플리케이션을 빠르게 시작할 수 있다. 특정 상황에서는 수동 설정이 필요할수도 있으나 개발 생산성과 편의성을 극대화 한다는 장점이 있다.

이번 실습의 경우 [Spring initializr](https://start.spring.io/) 를 통해 프로젝트를 생성하고 github에 upload 하여 사용하였다.

<br/>

## 2. Spring Boot Controller

---

Controller의 역할 : URL에 대한 매핑을 추가하는 역할을 한다.

브라우저와 같은 클라이언트의 페이지 요청 발생 시 spring boot는 **가장 먼저 controller에 등록된 URL 매핑**을 찾고, 해당 URL 매핑을 발견하면 해당 매서드를 실행시킨다.

`@GetMapping` 또는 `@PostMapping` 과 같은 어노테이션을 통해 URL 메서드를 연결시킬 수 있다.

- Controller 제작방법

```java
@Controller
public class MainController {
  @GetMpping("/sbb")
  @ResponseBody
  public String index() {
    return "index";
  }
}
```

- MainController 클래스에 `@Controller` 어노테이션을 적용시켜 주면 해당 MainController 클래스는 spring boot의 컨트롤러가 된다.
- index() 메서드에 `@GetMapping` 어노테이션을 적용시켜 해당 URL(/sbb) 을 요청할 때에 실행되는 메서드가 된다.
- index() 메서드에 `@ResponseBody` 어노테이션을 적용시켜 주면 URL에 요청에 대한 응답으로 String 문자열을 return 하겠다는 의미로 사용된다.
  - `@ResponseBody` 어노테이션이 없다면 'index' 라는 문자열을 return 하는것이 아닌 **'index'라는 이름의 템플릿 파일**을 찾는다.

<br/>
<br/>

## 3. H2 DataBase 정의

---

H2 DataBase는 주로 개발환경에서 사용하는 Java 기반의 가벼운 DBMS(데이터베이스 관리 소프트웨어)이다.
주로 개발, 테스트, 소형 에플리케이션에서 사용된다.

- H2 DataBase 사용 방법 간략 정리

1. `build.gradle` 파일에 `runtimeOnly 'com.h2database:h2'`코드 추가
2. `application.properties` 파일에 DataBase 설정 추가

```java
//DataBase
spring.h2.console.enabled=true          //h2 콘솔 접속 true
spring.h2.console.path=/h2-console      //h2 콘솔 접속 URL 경로
spring.datasource.url=jdbc:h2:~/local   //database 접속 경로
spring.datasource.driverClassName=org.h2.Driver //database 드라이버 클래스명
spring.datasource.username=sa           //database 사용자명
spring.datasource.password=             //database 사용자 비밀번호
```

3. `spring.datasource.url` 경로에서 database 파일 생성
   `touch db_dev.mv.db` 터미널에 입력

4. `MainApplication` Run 시작 후 `http://localhost:[port번호]/h2-console` 경로로 접속
   위에서 설정해둔 DataBase 설정을 그대로 따른다면 h2 Database에 접근 가능하다.
   <br/>
   <br/>

## 4. ORM 정의

---

- `ORM` : Object Relational Mapping

데이터베이스는 java 언어를 이해하지 못하므로 `ORM` 이라는 도구를 통해 Java 문법으로도 데이터베이스를 다룰 수 있게 만들 수 있다.

### ORM VS SQL

<table style="border: 1px solid; border-collapse: collapse; width: 100%; text-align: left;">
  <tr style="background-color: #f2f2f2;">
    <th style="border: 1px solid; padding: 10px;">id</th>
    <th style="border: 1px solid; padding: 10px;">subject</th>
    <th style="border: 1px solid; padding: 10px;">content</th>
  </tr>
  <tr>
    <td style="border: 1px solid; padding: 10px;">1</td>
    <td style="border: 1px solid; padding: 10px;">안녕하세요</td>
    <td style="border: 1px solid; padding: 10px;">본문 내용입니다</td>
  </tr>
  <tr>
    <td style="border: 1px solid; padding: 10px;">2</td>
    <td style="border: 1px solid; padding: 10px;">ORM의 설명을</td>
    <td style="border: 1px solid; padding: 10px;">돕기 위한 글입니다</td>
  </tr>
</table>

위의 table과 같은 형식으로 데이터를 저장하기 위해서 SQL 쿼리문과 ORM 코드를 비교해보자면

```SQL
  -- SQL
  insert into question (id, subject, content) values (1,  '안녕하세요', '본문 내용입니다')

```

```java
//ORM
  Question q1 = new Question();
  q1.setId(1);
  q1.setSubject("안녕하세요");
  q1.setContent("본문 내용입니다");
  this.questionRepository.save(q1);
```

이와 같은 차이를 확인할 수 있다.
간단히 요약자하면, ORM을 사용하면 MySQL, 오라클 DB 등과 같은 DBMS(데이터베이스 관리 소프트웨어) 종류에 관계 없이 **일관된 자바 코드**를 작성할 수 있어서 프로그램의 유지/보수에 편하다.

<br/>
<br/>

## 5. Lombok이란

---

Lombok은 Java 개발을 보다 간편하게 만들어주는 라이브러리로, 반복적인 코드 작성을 줄여주는 어노테이션을 지원해준다.

Lombok을 사용하면 코드 가독성과 유지보수성이 좋아지고 개발 시간도 절약가능하다.

- Lombok의 주요기능

1. `@Getter` `@Setter` <br/>
   클래스 필드에 대한 getter, stter 메서드 자동생성

2. `@ToString`<br/>
   클래스의 toString 메서드 자동생성

3. `@EqualsAndHashCode`<br/>
   equals와 hashCode 메서드를 자동으로 생성해줌

4. `@RequiredArgsConstructor`<br/>
   필요한 필드를 인수로 받는 생성자를 자동생성

5. `@Data`<br/>
   위의 1,2,3,4 어노테이션을 한번에 적용시켜줌

위의 어노테이션 등이 존재하며, 해당 어노테이션을 통해 필요한 메서드들을 매우 간편하게 사용할 수 있다.
