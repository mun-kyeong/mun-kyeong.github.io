---
layout: post
title: "PNU backend-bootcamp 0731 키워드 "
author: munkyeong
categories: [study]
image: assets/images/thumbnail/backend-bootcamp.png
---

> 요약 <br/>
> PNU 백엔드 부트캠프 3일차 - 수업을 들으며 공부한 내용을 정리한 글입니다. <br/> > [service]

<br/>

# 1. 서비스(Service)가 필요한 이유

---

서비스는 Spring에서 데이터 처리를 위해 작성하는 클래스이다.
<br/> 서비스 없이도 이전처럼 Controller에서 Repository에 바로 접근하여 데이터를 처리할 수 있지만 서비스 클래스가 필요한 이유는 다음과 같다.

### 1.복잡한 코드의 모듈화

서로 다른 Controller a,b 에서 하나의 Repository의 동일한 메서드를 실행해야 할 경우, a,b Controller가 중복된 코드를 가지게 된다. <br/>
이런 경우 해당 Repository의 메서드를 호출하는 기능을 가지는 서비스를 만들고 해당 서비스를 각 Controller에서 호출하여 사용할 수 있다.

### 2. 엔티티를 DTO 객체로 변환

앞서 작성한 엔티티 클래스들 (`Question`, `Answer`)은 데이터베이스와 바로 맞닿아있으므로 Controller 또는 템플릿에 그대로 사용하는것은 데이터 노출 위험이 있으므로 적절하지 않다. <br/>
따라서 엔티티 클래스를 대신해 사용할 **DTO-Data Transfer Object** 객체가 필요하게 되며 엔티티 클래스를 DTO로 변환하는 작업 또한 서비스에서 맡아 처리하게 된다. <br/>

> 즉, 서비스는 Controller <-> Repository 사이의 엔티티 객체와 DTO 객체를 서로 변환하여 전달하는 역할을 한다.

### [ 서비스 구현 로직 ]

---

#### - 서비스 만들기

```java
@RequiredArgsConstructor
@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public List<Question> getList() {
        return this.questionRepository.findAll();
    }
}
```

`@Service` 어노테이션을 통해 Spring Boot에게 해당 클래스가 서비스임을 알릴 수 있고, `@RequiredArgsConstructor` 어노테이션을 통해 QuestionRepository에 대한 생성자 주입을 할 수 있다.

> `@QuestionRepository` 어노테이션에 의한 생성자 주입이란, 생성자(ConStructor)를 직접 코드를 통해 구현하는 것이 아닌, `final`이 붙거나 `@NotNull` 이 붙은 필드의 생성자를 자동으로 생성해주는 룸북(lombok)의 기능을 뜻한다.

```java
// @QuestionRepository 기능을 사용하지 않을 경우 아래와 같이 생성자(Constructor)를 직접 작성 필요
public QuestionService(QuestionRepository qestionRepository){
  this.qestionRepository = qestionRepository;
}
```

#### - Controller에 서비스 적용

```java
  @GetMapping("/question/list")
    public String list(Model model) {
        List<Question> questionList = this.questionService.getList();   //수정된 부분
        model.addAttribute("questionList", questionList);
        return "question_list";
  }
```

Controller에 위와 같은 방식으로 서비스 적용이 가능하며, **컨트롤러 -> 서비스 -> 리포지터리** 순서를 거쳐 데이터를 주고받게 된다.
