index.html 파일의 QUIZ_DATA 배열에 있는 모든 문제의 정답 정확성을 검증해줘.

$ARGUMENTS에 카테고리가 지정된 경우 해당 카테고리만, 없으면 전체 문제를 대상으로 해.
카테고리: history | science | geo | general

## 실행 순서

### Step 1 — 데이터 로드
index.html을 읽어 QUIZ_DATA 배열 전체(또는 지정 카테고리)를 추출한다.
각 문제의 id, category, difficulty, question, options, answer, explanation 필드를 파악한다.

### Step 2 — 항목별 정확성 검증
각 문제에 대해 아래 5가지 항목을 순서대로 점검한다:

1. **구조 무결성**
   - options 배열이 정확히 4개인가?
   - answer 값이 0~3 범위의 정수인가?
   - hint, explanation 필드가 비어 있지 않은가?

2. **정답 사실 검증**
   - options[answer]가 question에 대한 실제 정답인가?
   - Claude의 지식을 기반으로 교차 검증한다.
   - 확신도를 HIGH / MEDIUM / LOW 3단계로 표시한다.

3. **오답 타당성**
   - 나머지 3개 선택지가 오답으로 명확히 구분되는가?
   - 오답 중 정답으로 해석될 여지가 있는 선택지가 있으면 지적한다.

4. **explanation 일치성**
   - explanation의 설명이 options[answer]와 일치하는가?
   - explanation에서 언급하는 사실이 정답 선택지와 모순되지 않는가?

5. **최상급·절대 표현 기준**
   - "가장, 최초, 최대, 최소, 최장, 최단, 최고, 최저, 유일, 처음, 먼저" 포함 시
     explanation에 측정 기준(면적/연도/범위 등)이 명시되어 있는가?

### Step 3 — 결과 출력

각 문제를 아래 형식으로 표시:

```
[ID] question 앞 30자...
  정답: [N+1]번 "options[answer]"
  ① 구조 무결성   : ✅ / ⚠️ (사유)
  ② 사실 검증     : ✅ HIGH / ⚠️ MEDIUM (사유) / ❌ LOW (사유)
  ③ 오답 타당성   : ✅ / ⚠️ (사유)
  ④ explanation   : ✅ / ⚠️ (사유)
  ⑤ 최상급 기준   : ✅ / N/A
```

⚠️ 또는 ❌가 하나라도 있는 문제는 마지막에 **요주의 문제 목록**으로 별도 정리한다.

### Step 4 — 종합 요약

- 검증 대상 문제 수
- 전체 이상 없음(✅) / 주의(⚠️) / 오류(❌) 각 건수
- 확신도 LOW 문제 목록 (재검토 권장)
- 즉시 수정이 필요한 문제가 있으면 수정 방향 제시
