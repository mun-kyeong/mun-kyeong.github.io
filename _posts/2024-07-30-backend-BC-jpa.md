---
layout: post
title: "PNU backend-bootcamp 0729 키워드 "
author: munkyeong
categories: [study]
image: assets/images/thumbnail/backend-bootcamp.png
---

> 요약 <br/>
> PNU 백엔드 부트캠프 2일차 - 수업을 들으며 공부한 내용을 정리한 글입니다.

<br/>

## 1. 엔티티 속성 구성

---

엔티티는 데이터베이스 테이블과 매칭되는 자바 클래스로, **모델** 또는 **도메인 모델** 이라고도 불린다.

실습에서는 `Question` 이라는 클래스를 엔티티로 부여하였는데, 어떤 클래스를 엔티티로 만들기 위해서는 `@Entity` 어노테이션이 필요하다.

```java
@Getter   //lombok annotation
@Setter   //lombok annotation
@Entity
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createDate;
}
```

- 각 속성에 적용한 어노테이션에 대한 간략한 설명글

1. `@Id` <br/>
   id 속성의 고유 번호들은 각 데이터를 구분하기 위한 값이므로 중복되어선 안된다.
   데이터베이스에서의 **기본키(Primary key)** 로써 중요한 역할을 한다

2. `@GeneratedValue` <br/>
   데이터를 저장할 때 해당 속성에 값을 일일이 입력하지 않아도 자동으로 1씩 증가하여 저장된다. <br/>
   `strategy = GenerationType.IDENTITY` 옵션은 해당 속성만 별도로 번호가 차례대로 늘어나도록 할대 사용한다.

   - 해당 옵션이 없을 경우 `@GeneratedValue`가 지정된 모든 속성에 번호를 차례대로 생성한다.

3. `@Cloumn` <br/>
   엔티티의 속성은 테이블의 열 이름과 일치한다. 이때 추가적인 속성 (length, columnDefinition(데이터 속성)) 을 주고싶을 때 사용할 수 있다.

<br/>
<br/>

## 2. 엔티티 사이 관계 (1:N)

---

답변을 통해 질문의 제목을 알고싶다면 `answer.getQuestoin().getSubject()` 를 사용해 접근할 수 있다.

이때 `Answer` 클래스에 단순히

```java
private Qeustion question;
```

과 같은 속성을 추가하면 안되고, `Question` 엔티티와 연결된 속성이라는걸 표시하기 위해서 `@ManyToOne` 어노테이션을 추가해 질문과 답변 엔티티를 연결시킬 수 있다.

- **ManyToOne** 설명 <br/>
  하나의 질문(부모)에 대해 여러개의 답변(자식)이 달릴 수 있으므로 `N:1`의 관계를 나타내는 `@ManyToOne` 어노테이션을 사용해준다

(이때 실제 데이타베이스에서는 외래키 (foreign key) 관계가 생성된다.)

답변의 입장에선 반대로 `1:N`의 관계를 가지므로 `@OneToMany` 어노테이션을 사용할 수 있다.

> `cascade = CascadeType.REMOVE` 속성은 부모를 삭제했을 때 그와 연관된 자식들도 삭제되도록 하는 것

<br/>
<br/>

## 3. Thymeleaf : 데이터를 템플릿에 전달

---

이전에는 `@ResponseBody` 어노테이션을 통해 그저 return 된 값을 화면에 보여주기만 했다면 이제는 템플릿을 통해 원하는 페이지를 화면에 띄워보려고 한다.

이 기능을 가능하게 해주는 템플릿이 `타임리프(Thymeleaf)`로 받아온 데이터를 템플릿을 통해 화면에 전달하는 방법은 아래와 같다.

```java
// Controller - java 파일
@RequiredArgsConstructor
@Controller
public class QuestionController {

    private final QuestionRepository questionRepository;

    @GetMapping("/question/list")
    public String list(Model model) {
        List<Question> questionList = this.questionRepository.findAll();
        model.addAttribute("questionList", questionList);
        return "question_list";
    }
}
```

우선 템플릿으로 데이터를 넘겨줄 Controller의 java 코드이다.

1. `@RequiredArgsConstructor` 어노테이션을 통해 해당 controller를 생성할 때 `QuestionRepository` 객체가 자동으로 주입된다.
2. QuestionRepository의 `findAll` 메서드를 통해 질문 목록 데이터를 받아와 `Model` 객체에 **"questionList"** 라는 이름으로 저장한다.
   > 이때 Model 객체는 자바와 템플릿 간의 연결 고리 역할을 하기에 템플릿에서 해당 이름으로 데이터를 사용할 수 있다.

<br/>

controller에서 넘겨준 데이터를 바탕으로 `question_list.html` 템플릿에서 아래와 같이 사용할 수 있다.

<br/>

```html
<table>
  <thead>
    <tr>
      <th>제목</th>
      <th>작성일시</th>
    </tr>
  </thead>
  <tbody>
    <tr th:each="question : ${questionList}">
      <td th:text="${question.subject}"></td>
      <td th:text="${question.createDate}"></td>
    </tr>
  </tbody>
</table>
```

위에서 알 수 있듯이, `questionList` 라는 이름으로 데이터를 받아와 `th:each` 구문을 통해 반복문을 돌리는 코드를 확인할 수 있다.

<br/>
<br/>

## 4. @Autowired 와 스프링 빈

---

실습 test를 진행하다 보면

```java
@Autowired
    private QuestionRepository questionRepository;
```

와 같은 코드를 확인할 수 있었는데, 여기서 질문 엔티티의 데이터를 생성할 때 저장소(이때는 `QuestionRepository`의미)가 필요하므로, `@Autowired` 어노테이션을 통해 **"의존성 주입(DI)"**을 해주는것을 알 수 있다.

> 여기서 **의존성주입(DI)** 이란, 스프링이 객체를 대신 생성하여 주입하는 기법이다.

<br/>

### Bean

Autowired에 대해 설명하기 전에, **Spring Bean** 개념이 먼저 필요한데, Spring Bean이란, **IoC (Inversion of Control) 컨테이너** 에 의해 관리되는 객체를 의미한다.

Bean은 애플리케이션의 핵심 부분을 구성하며, spring container에 의해 생성, 초기화, 소멸 등의 생명주기를 관리받는다.

> Spring 애플리케이션은 기본적으로 `@Component`, `@Service`, `@Repository`, `@Controller` 등의 어노테이션의 붙은 클래스를 빈으로 등록해준다.

<br/>

### Autowired Annotation

간단히 말해 spring framework에서 의존성 주입(DI)를 위해 사용되는 어노테이션이다.
주로 필드, 생성자, 메서드 등에 사용되며 spring container가 해당 **Bean**을 자동으로 주입해준다.

위의 코드를 예시로 들어보자면, `questionRepository` 변수의 경우, 선언만 되어 있고 그 값이 비어있지만 `@Autowired` 어노테이션을 통해 Spring Boot가 해당 변수 객체를 자동으로 만들어 주입해준다.
