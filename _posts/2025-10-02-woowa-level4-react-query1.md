---
layout: post
title: "[우테코] level-4 / React-Query와의 인연 (1)"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/default-img.png
---

> 요약 <br/>
> apiClient를 사용하다 React-Query를 도입하게 된 내용을 다룹니다.
> React-Query의 캐싱 기능과 동기화 기능을 사용하고자 도입하게 되었습니다.

<br/>

---

## 목차

- [목차](#목차)
- [서문](#서문)
- [Situation(상황) : 동기화되지 않는 데이터의 혼란](#situation상황--동기화되지-않는-데이터의-혼란)
- [왜 React-Query 였을까?](#왜-react-query-였을까)
  - [잠깐 개념 정리! ) React-Query란?](#잠깐-개념-정리--react-query란)
- [Task(과제) : 우리의 목표](#task과제--우리의-목표)
- [Action(행동1) : 코드로 보는 변화](#action행동1--코드로-보는-변화)
- [Action(행동2) : 핵심 기능 활용하여 문제 해결하기](#action행동2--핵심-기능-활용하여-문제-해결하기)
- [Result(결과) : 문제가 해결 되었을까?](#result결과--문제가-해결-되었을까)
- [결론](#결론)

---

## 서문

프론트엔드 개발을 하다보면 데이터 패칭과 상태 관리에 대한 고민을 하게 되는 시점이 오는 것 같다.

우리 팀 역시 프로젝트 초기엔 `fetch` API를 감싸 만든 `apiClient` 만으로도 큰 불편함 없이 잘 사용하고 있었다. <br/>
하지만 서비스가 복잡해지고, 많은 데이터를 다루게 되면서 한계가 드러나기 시작했다.

이 글은 우리 팀이 `useEffect` 기반의 데이터 패칭 방식에서 왜 `React-Query`로 전환하게 되었는지, 그리고 그 과정에서 무엇을 배우고 얻었는지를 다룬다.

<br>

## Situation(상황) : 동기화되지 않는 데이터의 혼란

---

관리자 대시보드 서비스를 개발하며 문제를 발견하게 되었다. 이 대시보드에는 사용자들이 남긴 피드백 목록이 **무한 스크롤**로 표시되고, 상단에는 **전체 피드백 개수, 완료된 피드백 개수**등을 보여주는 통계 패널이 있다.

![logic](/assets/images/blog/2025-10-02-woowa-level4-react-query1/logic.png)

<Br/>

문제는 관리자가 피드백 목록에서 특정 항목을 **삭제**하거나 **완료** 처리했을 때 발생했다.

**1. 데이터 불일치**

분명 목록에서 피드백을 처리했는데, 상단 통계 패널의 숫자는 그대로였다.<br>
변경 사항을 확인하려면 관리하는 페이지를 새로고침 해야만 했고, 사용자 관점에서 굉장히 혼란스럽고 불편한 경험이었다.

**2. 무한 스크롤**

더 큰 문제는 무한 스크롤이였다. <br/>
우리는 피드백을 무한 스크롤을 통해 데이터를 가져오는 중이였는데, 만약 관리자가 중간의 피드백을 하나 삭제했을 경우 변경된 데이터를 다시 불러와야 했다. <br/>

> '_하나의 데이터를 삭제하면, 그 전까지 불러왔던 모든 데이터를 다시 요청해야 하나? 만약 그렇다면 화면이 깜빡이면서 모든 리스트가 사라지고 나타나는 경험이 나타나게 될텐데.. 스크롤의 위치를 기억해서 적용도 해줘야 할 것 같아_' 이런 고민을 했던 것 같다.

<br>

핵심은 <strong style="color: chocolate;">실시간 동기화</strong>와 <strong style="color: chocolate;">자연스러운 UI 경험</strong>이었다.

기존의 `apiClient` 단순히 API를 호출하고 응답을 반환할 뿐, 위의 문제를 해결해주진 못했다.

![no-change](/assets/images/blog/2025-10-02-woowa-level4-react-query1/no-change.gif){: width="400" .mx-auto .d-block }

<br/>

## 왜 React-Query 였을까?

---

문제를 해결하기 위해 여러 선택지를 고민했다.

사실 데이터 동기화만을 생각한다면 '**상태 끌어올리기(Props Drilling)**'나 `Context API`를 사용해 전역적으로 상태를 관리하는 방법을 사용할수도 있었다.

하지만 그럼에도 여전히 **캐싱**문제가 남아있었고, 특히 무한 스크롤의 "깜빡임" 현상을 해결하고 불필요한 API 호출을 줄이는 것이 중요했다. <br/>
당시 무한스크롤 구현을 맡았던 우디가 `apiClient`에 직접 캐싱 로직을 구현하려고 해봤음에도 어렵다고 판단하게 되었다.

이에, React-Query에서 제공하는 기능을 필요한 곳에 사용하고자 도입하게 되었다.

#### 잠깐 개념 정리! ) React-Query란?

React-Query는 단순히 데이터를 가져오는 라이브러리가 아니라 **서버 상태 관리 라이브러리**이다. 우리가 주로 사용하고자 했던 핵심 기능은 아래와 같다.

- **캐싱** : API 응답 데이터를 메모리에 캐싱하고, 필요할 때 재사용한다. 이를 통해 불필요한 API 호출을 줄이고, 데이터를 즉시 보여주며 UI 경험을 샹상 시킨다.
- **동기화** : 데이터가 변경되었을 때, 관련된 모든 곳의 데이터를 최신 상태로 업데이트하는 것을 쉽게 도와준다.

<br/>

## Task(과제) : 우리의 목표

---

문제상황을 정리하고, React-Query를 도입하기 전 우리가 해결해야 하는 문제를 먼저 간단히 정의해봤다.

1. **피드백 ‘완료’ 또는 ‘삭제’ 시에 대시보드 패널에도 값이 즉각적으로 반영**되어야 한다.

2. **피드백 ‘삭제’시에 제거된 피드백을 제외한 상태가 변경되지 않은 피드백들을 다시 호출하지 않아야 한다.**

<br/>

## Action(행동1) : 코드로 보는 변화

---

React-Query의 도입은 기존 코드를 훨씬 더 선언적이고 간결하게 만들어주었다.

**Before: `useEffect`와 `useState`의 조합**

이전에는 `useEffect` 내에서 비동기 함수를 호출하고, `useState`를 통해 상태를 직접 관리하는 구조였다.

```jsx
export default function useUserOrganizationsStatistics() {
  const [statistics, setStatistics] = useState<StatisticsProps>({
    reflectionRate: '0',
    confirmedCount: '0',
    waitingCount: '0',
    totalCount: '0',
  });

  useEffect(() => {
    const getData = async () => {
      const response = (await getOrganizationStatistics({
        organizationId: 1,
      })) as GetOrganizationStatistics;
      setStatistics(response.data);
    };

    getData();
  }, []); // 최초 1회만 호출되어 데이터가 갱신되지 않음!

  return { statistics };
}
```

**After : `useQuery`로 간결해진 코드**

React-Query의 `useQuery` 훅을 사용해 로딩, 에러 상태를 포함한 데이터 상태를 모두 위임할 수 있었다. 훨씬 선언적으로 작성되었다고 생각한다.

```jsx
const EMPTY_STATISTICS: StatisticsProps = {
  reflectionRate: "0",
  confirmedCount: "0",
  waitingCount: "0",
  totalCount: "0",
};

export default function useUserOrganizationsStatistics() {
  const { data = EMPTY_STATISTICS } = useQuery({
    queryKey: ["organizationStatistics", 1], // 이 데이터의 고유 키
    queryFn: () => getOrganizationStatistics({ organizationId: 1 }),
    select: (res: GetOrganizationStatistics) => res.data,
  });

  return { statistics: data };
}
```

<br/>

## Action(행동2) : 핵심 기능 활용하여 문제 해결하기

---

**동기화 문제 해결**

가장 해결이 필요했던 '데이터 동기화' 문제는 `useMutation`과 `invalidateQueries` 조합으로 해결했다. <br/>
이는 피드백 상태를 변경하는 mutation이 성공했을 때 관련 데이터들을 **무효화** 시키며 데이터를 강제로 업데이트 해주는 방식이다.

`queryClient.invalidateQueries`가 호출되면 **해당 `queryKey`를 사용하는 모든 `useQuery`를 찾아 데이터를 자동으로 refetch** 해준다.

```jsx
const queryClient = useQueryClient();

const confirmMutation = useMutation({
  mutationFn: ({
    feedbackId,
    comment,
  }: {
    feedbackId: number,
    comment: string,
  }) => patchFeedbackStatus({ feedbackId, comment }),
  onSuccess: () => {
    // 1. 통계 패널 데이터 갱신
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.organizationStatistics(organizationId),
    });
    // 2. 무한 스크롤 피드백 리스트 갱신
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.infiniteFeedbacks });
  },
  onError: () => {
    // ... 에러 처리
  },
});
```

이제 피드백을 완료하면, `organizationStatistics` 키 값을 가진 데이터가 새로고침되어 화면에 반영된다.

<br/>

**2. 캐싱 문제 해결**

사실 초기 도입 단계에서는 'React-Query만 쓰면 캐싱이 되겠지' 라는 막연한 믿음만 있었다. <br/>
구체적으로 어떻게 캐싱 전략을 적용해야 최적의 성능을 낼 수 있는지에 대해서는 깊이 고민하지 못했던 것 같다.

이 부분은 추후 성능 최적화를 진행하며 더 깊이 학습하게 된 계기가 되었다.

<!-- 성능 향상을 위한 커스텀 캐싱 전략은 아래 글을 통해 보완할 수 있을 것 같다.  -->

<br/>

## Result(결과) : 문제가 해결 되었을까?

React-Query 도입 후, 우리는 문제를 해결할 수 있었다!

- **대시보드 패널의 즉각적인 반영** : 관리자가 피드백을 삭제하거나 완료하면, 새로고침 없이 대시보드 통계에 즉시 반영되었다.
- **깜빡임 없이 데이터 가져오기** : 무한 스크롤 데이터가 삭제/수정될 때, 화면이 깜빡이지 않고 자연스럽게 리스트가 갱신되었다.

![result](/assets/images/blog/2025-10-02-woowa-level4-react-query1/result.gif){: width="400" .mx-auto .d-block }

<br/>

## 결론

이전에는 React-Query를 단순히 데이터 패칭을 더 편리하게 할 수 있도록 도와주는 도구로서만 봤다면, 이번 경험을 통해 '**데이터의 상태**를 일관성 있게 관리하는걸 도와주는 도구라는 것을 알게 된 것 같다.
