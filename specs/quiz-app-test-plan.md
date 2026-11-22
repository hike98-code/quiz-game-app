# 상식 퀴즈 게임 전체 기능 테스트 계획서

## Application Overview

단일 파일(index.html) Vanilla JS 상식 퀴즈 웹앱에 대한 포괄적 테스트 계획서. 앱은 7개의 화면(홈/프로필/카테고리·모드/퀴즈/결과/순위/대시보드)으로 구성되며, 4개 연령 프로필(미취학아동·초등학생·중학생·일반)과 3개 게임 모드(전체도전·카테고리별·스피드퀴즈)를 제공한다. 데이터는 localStorage 3개 키(quiz_game_history, quiz_player_stats, quiz_leaderboard)에 저장된다. 테스트 전 localStorage를 초기 상태(빈 상태)로 가정한다.

## Test Scenarios

### 1. 홈 화면 (Home Screen)

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-01: 홈 화면 초기 로드 확인

**File:** `specs/01-home-screen.spec.ts`

**Steps:**
  1. 브라우저에서 http://localhost:8765/ 를 연다
    - expect: 페이지 제목이 '🧠 상식 퀴즈' 로 표시된다
    - expect: QUIZ GAME 뱃지와 'h1' 제목이 표시된다
    - expect: 부제목 '4개 카테고리 · 40문제 · 랜덤 출제' 가 표시된다
  2. 홈 화면의 3개 버튼을 확인한다
    - expect: '✏️ 퀴즈 시작하기' 버튼이 클릭 가능하다
    - expect: '🏆 순위 기록 보기' 버튼이 클릭 가능하다
    - expect: '📊 내 통계 보기' 버튼이 클릭 가능하다
  3. 게임 방법 섹션을 확인한다
    - expect: '게임 방법' 제목이 표시된다
    - expect: 카테고리 선택, 제한 시간 안에 풀기, 결과 & 순위 확인 총 3개 항목이 나열된다

#### 1.2. TC-02: 순위 기록 보기 버튼으로 순위 화면 이동

**File:** `specs/01-home-screen.spec.ts`

**Steps:**
  1. 홈 화면에서 '🏆 순위 기록 보기' 버튼을 클릭한다
    - expect: '🏆 리더보드' 제목이 표시되는 순위 화면으로 전환된다

#### 1.3. TC-03: 내 통계 보기 버튼으로 대시보드 화면 이동

**File:** `specs/01-home-screen.spec.ts`

**Steps:**
  1. 홈 화면에서 '📊 내 통계 보기' 버튼을 클릭한다
    - expect: '📊 내 통계' 제목이 표시되는 대시보드 화면으로 전환된다

### 2. 프로필 선택 화면 (Profile Selection Screen)

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-04: 프로필 선택 화면 초기 상태 - 다음 버튼 비활성화

**File:** `specs/02-profile-selection.spec.ts`

**Steps:**
  1. 홈 화면에서 '✏️ 퀴즈 시작하기' 버튼을 클릭한다
    - expect: '프로필을 선택하세요' 제목의 프로필 선택 화면으로 전환된다
    - expect: 4개 프로필 카드(미취학아동, 초등학생, 중학생, 일반)가 표시된다
    - expect: '다음 →' 버튼이 비활성화(disabled) 상태다
    - expect: '← 홈으로' 버튼이 활성화 상태다

#### 2.2. TC-05: 4개 프로필 카드 내용 확인

**File:** `specs/02-profile-selection.spec.ts`

**Steps:**
  1. 홈 화면에서 프로필 선택 화면으로 이동한다
    - expect: 미취학아동 카드: 🎈 아이콘, '7세 이하', '동물·색깔·숫자 등 쉬운 문제' 텍스트가 표시된다
    - expect: 초등학생 카드: 📚 아이콘, '8~13세', '기초 상식·한국 지리·자연 과학·태권도' 텍스트가 표시된다
    - expect: 중학생 카드: 🏫 아이콘, '13~15세', '세계사·과학 개념·지리' 텍스트가 표시된다
    - expect: 일반 카드: 🌍 아이콘, '성인', '기존 상식 퀴즈 (기본 모드)' 텍스트가 표시된다

#### 2.3. TC-06: 일반 프로필 선택 후 다음 버튼 활성화

**File:** `specs/02-profile-selection.spec.ts`

**Steps:**
  1. 프로필 선택 화면에서 '일반' 카드를 클릭한다
    - expect: 일반 카드가 선택된 상태로 강조 표시된다
    - expect: '다음 →' 버튼이 활성화(enabled) 상태로 변경된다

#### 2.4. TC-07: 프로필 변경 - 선택 후 다른 프로필 선택

**File:** `specs/02-profile-selection.spec.ts`

**Steps:**
  1. 프로필 선택 화면에서 '중학생' 카드를 클릭한다
    - expect: 중학생 카드가 선택 강조 상태가 된다
    - expect: '다음 →' 버튼이 활성화된다
  2. 이어서 '미취학아동' 카드를 클릭한다
    - expect: 미취학아동 카드가 선택 강조 상태로 전환된다
    - expect: 중학생 카드의 선택 강조가 해제된다
    - expect: '다음 →' 버튼이 여전히 활성화 상태를 유지한다

#### 2.5. TC-08: 홈으로 버튼 - 프로필 화면에서 홈으로 복귀

**File:** `specs/02-profile-selection.spec.ts`

**Steps:**
  1. 프로필 선택 화면에서 '← 홈으로' 버튼을 클릭한다
    - expect: 홈 화면으로 전환된다
    - expect: '🧠 상식 퀴즈' 홈 화면의 3개 버튼이 표시된다

### 3. 모드 및 카테고리 선택 화면 (Mode & Category Selection Screen)

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-09: 모드 선택 화면 초기 상태 - 시작하기 버튼 비활성화

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 홈 → 일반 프로필 선택 → '다음 →' 클릭 순으로 진행한다
    - expect: '게임 모드를 선택하세요' 제목의 화면이 표시된다
    - expect: 3개 모드 카드(전체 도전, 카테고리별, 스피드 퀴즈)가 표시된다
    - expect: '▶ 시작하기' 버튼이 비활성화 상태다
    - expect: '← 홈으로' 버튼이 활성화 상태다

#### 3.2. TC-10: 일반 프로필 전체 도전 모드 선택 (44문제 표시)

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 모드 선택 화면에서 '🌟 전체 도전' 카드를 클릭한다
    - expect: 전체 도전 카드에 '44문제 전부' 텍스트가 표시된다
    - expect: '▶ 시작하기' 버튼이 활성화된다
    - expect: 카테고리 선택 패널이 표시되지 않는다

#### 3.3. TC-11: 일반 프로필 스피드 퀴즈 모드 선택 (20문제 랜덤)

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 모드 선택 화면에서 '⚡ 스피드 퀴즈' 카드를 클릭한다
    - expect: 스피드 퀴즈 카드에 '20문제 랜덤' 텍스트가 표시된다
    - expect: '▶ 시작하기' 버튼이 활성화된다

#### 3.4. TC-12: 일반 프로필 카테고리별 모드 - 4개 카테고리 표시

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 모드 선택 화면에서 '🗂️ 카테고리별' 카드를 클릭한다
    - expect: 카테고리 선택 패널이 나타난다
    - expect: 세계사(11문제), 과학(11문제), 지리(11문제), 일반상식(11문제) 4개 카테고리가 표시된다
    - expect: '▶ 시작하기' 버튼은 여전히 비활성화 상태다
  2. '🏛️ 세계사' 카테고리를 클릭한다
    - expect: 세계사 카테고리가 선택 강조 상태가 된다
    - expect: '▶ 시작하기' 버튼이 활성화된다

#### 3.5. TC-13: 초등학생 프로필 전체 도전 모드 (40문제 표시)

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 홈 → 초등학생 프로필 선택 → '다음 →' 클릭 후 '🌟 전체 도전' 카드를 확인한다
    - expect: 전체 도전 카드에 '40문제 전부' 텍스트가 표시된다 (일반 프로필의 44문제와 다름)

#### 3.6. TC-14: 초등학생 카테고리별 모드 - 태권도 포함 5개 카테고리

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 초등학생 프로필로 모드 선택 화면에서 '카테고리별'을 선택한다
    - expect: 세계사(5문제), 과학(7문제), 지리(6문제), 일반상식(2문제), 태권도(20문제) 총 5개 카테고리가 표시된다
    - expect: 태권도(🥋) 카테고리가 초등학생 전용으로 표시된다

#### 3.7. TC-15: 중학생 카테고리별 모드 - 태권도 없이 4개 카테고리

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 중학생 프로필로 모드 선택 화면에서 '카테고리별'을 선택한다
    - expect: 세계사(7문제), 과학(9문제), 지리(2문제), 일반상식(2문제) 총 4개 카테고리가 표시된다
    - expect: 태권도 카테고리가 표시되지 않는다

#### 3.8. TC-16: 미취학아동 프로필 전체 도전 모드 (90문제 표시)

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 미취학아동 프로필로 모드 선택 화면에서 '전체 도전' 카드를 확인한다
    - expect: 전체 도전 카드에 '90문제 전부' 텍스트가 표시된다 (기본 20 + 이웃집 토토로 30 + 생물 20 + 디저트 20)

#### 3.9. TC-17: 카테고리별 모드에서 카테고리 미선택 시 시작 불가

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 일반 프로필 → 카테고리별 모드 선택 후 카테고리를 선택하지 않은 상태를 유지한다
    - expect: '▶ 시작하기' 버튼이 비활성화(disabled) 상태로 유지된다

#### 3.10. TC-83: 미취학아동 카테고리별 모드 - 이웃집 토토로 카테고리

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 미취학아동 프로필로 모드 선택 화면에서 '카테고리별'을 선택한다
    - expect: 과학(8문제), 지리(2문제), 일반상식(10문제), 이웃집 토토로(30문제), 생물(20문제), 디저트(20문제) 총 6개 카테고리가 표시된다
  2. '🌳 이웃집 토토로'를 선택하고 '▶ 시작하기'를 클릭한다
    - expect: 진행 표시가 '1 / 30'으로 시작된다
    - expect: 출제 문제가 모두 토토로 문제(PS-021~050)다

#### 3.11. TC-86: 미취학아동 카테고리별 모드 - 생물·디저트 카테고리

**File:** `specs/03-mode-category-selection.spec.ts`

**Steps:**
  1. 미취학아동 프로필로 '카테고리별' → '🐞 생물'을 선택하고 시작한다
    - expect: 진행 표시가 '1 / 20'으로 시작되고, 출제 문제가 모두 생물 문제(PS-051~070)다
  2. 같은 방법으로 '🍰 디저트'를 선택하고 시작한다
    - expect: 진행 표시가 '1 / 20'으로 시작되고, 출제 문제가 모두 디저트 문제(PS-071~090)다

### 4. 퀴즈 진행 - 일반 및 카테고리 모드 (Quiz Screen - Standard)

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-18: 퀴즈 화면 초기 상태 확인

**File:** `specs/04-quiz-standard.spec.ts`

**Steps:**
  1. 일반 프로필 → 카테고리별 → 세계사 → 시작하기 순으로 진행한다
    - expect: 퀴즈 화면이 표시된다
    - expect: 카테고리 뱃지(🏛️ 세계사)가 표시된다
    - expect: 진행 표시(1 / 11)가 표시된다
    - expect: 점수 표시('점수: 0점')가 표시된다
    - expect: Q1. 번호와 문제 텍스트가 표시된다
    - expect: 4개 선택지 버튼(① ② ③ ④)이 활성화 상태다
    - expect: '💡 힌트 보기' 버튼이 활성화 상태다
    - expect: 타이머가 표시되지 않는다(스피드 모드 아님)

#### 4.2. TC-19: 정답 선택 시 피드백 및 점수 증가

**File:** `specs/04-quiz-standard.spec.ts`

**Steps:**
  1. 퀴즈 화면에서 정답 선택지를 클릭한다
    - expect: '✅ 정답입니다!' 메시지가 표시된다
    - expect: 점수 내역(기본 +10, 난이도 배수 점수 등)이 표시된다
    - expect: '→ 이번 획득: +N점' 형식의 획득 점수가 표시된다
    - expect: 문제 해설 텍스트가 표시된다
    - expect: 상단 점수 표시가 증가한다
    - expect: 4개 선택지 버튼이 모두 비활성화된다
    - expect: '다음 문제 →' 버튼이 나타난다

#### 4.3. TC-20: 오답 선택 시 피드백 및 점수 유지

**File:** `specs/04-quiz-standard.spec.ts`

**Steps:**
  1. 퀴즈 화면에서 오답 선택지를 클릭한다
    - expect: '❌ 오답입니다' 메시지가 표시된다
    - expect: 점수 내역 없이 해설 텍스트만 표시된다
    - expect: 상단 점수 표시가 증가하지 않는다
    - expect: 4개 선택지 버튼이 모두 비활성화된다
    - expect: '다음 문제 →' 버튼이 나타난다

#### 4.4. TC-21: 힌트 버튼 클릭 - 힌트 표시 및 버튼 비활성화

**File:** `specs/04-quiz-standard.spec.ts`

**Steps:**
  1. 퀴즈 화면에서 '💡 힌트 보기' 버튼을 클릭한다
    - expect: 힌트 텍스트가 버튼 아래에 나타난다
    - expect: '💡 힌트 보기' 버튼이 비활성화(disabled) 상태로 변경된다
    - expect: 선택지 버튼은 여전히 활성화 상태다

#### 4.5. TC-22: 힌트 사용 시 힌트 보너스 점수 감소 확인

**File:** `specs/04-quiz-standard.spec.ts`

**Steps:**
  1. 힌트를 사용하지 않고 정답을 맞혔을 때의 점수 내역을 기록한다. 이어서 다음 문제에서 힌트를 사용한 후 정답을 맞힌다
    - expect: 힌트를 사용한 경우, 힌트 보너스 점수 항목에 '+2' 가 표시되지 않거나 감소된 값이 표시된다
    - expect: 힌트 미사용 정답의 점수 내역에는 '힌트 +2' 항목이 포함된다

#### 4.6. TC-23: 다음 문제로 이동 시 힌트 상태 초기화

**File:** `specs/04-quiz-standard.spec.ts`

**Steps:**
  1. 첫 번째 문제에서 힌트를 사용한 후 답변하고 '다음 문제 →'를 클릭한다
    - expect: 두 번째 문제로 넘어갔을 때 '💡 힌트 보기' 버튼이 다시 활성화 상태다
    - expect: 힌트 텍스트가 표시되지 않는다

#### 4.7. TC-24: 마지막 문제 후 '결과 보기 →' 버튼 표시

**File:** `specs/04-quiz-standard.spec.ts`

**Steps:**
  1. 카테고리별 세계사(11문제) 퀴즈의 마지막(11번째) 문제에 답변한다
    - expect: '다음 문제 →' 대신 '결과 보기 →' 버튼이 표시된다
    - expect: 진행 표시가 '11 / 11'로 표시된다

#### 4.8. TC-25: 연속 정답 시 콤보 보너스 점수 확인

**File:** `specs/04-quiz-standard.spec.ts`

**Steps:**
  1. 3문제 이상 연속으로 정답을 선택한다
    - expect: 3번째 연속 정답 이후 점수 내역에 콤보 보너스(+2 이상)가 표시된다

#### 4.9. TC-26: 전체 도전 모드 44문제 확인 (일반 프로필)

**File:** `specs/04-quiz-standard.spec.ts`

**Steps:**
  1. 일반 프로필 → 전체 도전 모드를 선택하고 시작한다
    - expect: 퀴즈 화면에서 진행 표시가 '1 / 44'로 시작된다
    - expect: 마지막 문제에서 '44 / 44'가 표시된다

### 5. 퀴즈 진행 - 스피드 모드 (Quiz Screen - Speed Mode)

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-27: 스피드 모드 타이머 표시 확인

**File:** `specs/05-quiz-speed-mode.spec.ts`

**Steps:**
  1. 일반 프로필 → 스피드 퀴즈 → 시작하기 순으로 진행한다
    - expect: 퀴즈 화면에 '⚡ 스피드' 카테고리 뱃지가 표시된다
    - expect: '남은 시간' 레이블과 함께 15 이하의 숫자 타이머가 표시된다
    - expect: 진행 표시가 '1 / 20'으로 시작된다

#### 5.2. TC-28: 스피드 모드 타이머 카운트다운 동작

**File:** `specs/05-quiz-speed-mode.spec.ts`

**Steps:**
  1. 스피드 모드 퀴즈 화면에서 답변 없이 몇 초간 대기한다
    - expect: 타이머 숫자가 매 초마다 1씩 감소한다
    - expect: 타이머가 15초에서 시작하여 0을 향해 감소한다

#### 5.3. TC-29: 스피드 모드 타이머 만료 시 자동 오답 처리

**File:** `specs/05-quiz-speed-mode.spec.ts`

**Steps:**
  1. 스피드 모드 퀴즈에서 답변하지 않고 15초가 경과하도록 대기한다
    - expect: 타이머가 0이 되면 자동으로 오답 처리된다
    - expect: '❌ 오답입니다' 피드백 메시지가 표시된다
    - expect: 모든 선택지 버튼이 비활성화된다
    - expect: 힌트 버튼이 비활성화된다
    - expect: 해설 텍스트가 표시된다
    - expect: '다음 문제 →' 버튼이 나타난다

#### 5.4. TC-30: 스피드 모드 답변 시 타이머 정지

**File:** `specs/05-quiz-speed-mode.spec.ts`

**Steps:**
  1. 스피드 모드 퀴즈에서 임의의 선택지를 클릭한다
    - expect: 답변 즉시 타이머가 정지된다
    - expect: 피드백 메시지와 함께 '다음 문제 →' 버튼이 나타난다

#### 5.5. TC-31: 스피드 모드 20문제 완료 확인

**File:** `specs/05-quiz-speed-mode.spec.ts`

**Steps:**
  1. 스피드 모드로 20문제를 모두 답변한다
    - expect: 마지막 문제에서 '20 / 20' 진행 표시가 나타난다
    - expect: 마지막 문제 답변 후 '결과 보기 →' 버튼이 표시된다

#### 5.6. TC-32: 스피드 모드 진행 중 홈으로 이동 시 타이머 정지

**File:** `specs/05-quiz-speed-mode.spec.ts`

**Steps:**
  1. 스피드 모드 퀴즈 진행 중 브라우저 뒤로 가기 또는 JavaScript로 showScreen('home-screen')을 호출한다. 이후 다시 순위 화면이나 대시보드 화면으로 이동한다
    - expect: 타이머가 백그라운드에서 계속 동작하지 않는다
    - expect: 다른 화면에서 스피드 모드 타이머 UI가 표시되지 않는다

### 6. 미취학아동 프로필 퀴즈 (Preschool Profile Quiz)

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-33: 미취학아동 퀴즈 - TTS 다시 듣기 버튼 표시

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 미취학아동 프로필 → 전체 도전 → 시작하기 순으로 진행한다
    - expect: 퀴즈 화면에 '🔊 다시 듣기' 버튼이 표시된다
    - expect: 힌트 버튼도 함께 표시된다
    - expect: 타이머가 표시되지 않는다
    - expect: 문제가 쉬운 수준(동물, 색깔, 숫자 등)으로 표시된다

#### 6.2. TC-34: 미취학아동 퀴즈 - 다시 듣기 버튼 클릭 가능

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 미취학아동 퀴즈 화면에서 '🔊 다시 듣기' 버튼을 클릭한다
    - expect: 버튼 클릭 시 오류가 발생하지 않는다
    - expect: Web Speech API TTS 재생이 시도된다 (브라우저 TTS 지원 여부에 따라 음성 재생이 될 수 있음)

#### 6.3. TC-35: 미취학아동 퀴즈 화면에 타이머 없음 확인

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 미취학아동 프로필의 전체 도전 모드 퀴즈 화면을 확인한다
    - expect: '남은 시간' 타이머가 표시되지 않는다
    - expect: 시간 제한 없이 자유롭게 답변할 수 있다

#### 6.4. TC-36: 미취학아동 퀴즈 - 일반 프로필과 다른 문제 풀

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 미취학아동 프로필로 전체 도전 모드를 시작한다
    - expect: 진행 표시가 '1 / 90'으로 시작된다 (미취학아동 문제 풀은 기본 20 + 이웃집 토토로 30 + 생물 20 + 디저트 20)
    - expect: 문제 ID가 PS-001~PS-090 범위에 해당하는 미취학 문제들이 출제된다

#### 6.5. TC-78: 미취학아동 TTS - 보기를 '일번~사번'으로 읽기

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. speechSynthesis를 모킹한 상태로 미취학아동 퀴즈를 시작하고 문제·보기 읽기를 끝까지 진행한다
    - expect: 보기 발화가 순서대로 '일번, {보기1}.' ~ '사번, {보기4}.' 형식이다 ('하나·둘…' 또는 '한 번'으로 읽히는 '1번' 표기 아님)

#### 6.6. TC-79: 미취학아동 TTS - 힌트 보기 클릭 시 힌트 읽기

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 문제를 읽는 도중 '💡 힌트 보기' 버튼을 클릭한다
    - expect: 진행 중인 읽기가 즉시 중단(cancel)된다
    - expect: '힌트예요. {힌트}'를 읽는다

#### 6.7. TC-80: 미취학아동 TTS - 정답 시 칭찬 + 해설 읽기

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 정답 보기를 선택한다
    - expect: '정답이에요! {해설}'을 읽는다

#### 6.8. TC-81: 미취학아동 TTS - 오답 시 정답 안내 + 해설 읽기

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 오답 보기를 선택한다
    - expect: '아쉬워요. 정답은 {일번~사번}, {정답 보기}이에요/예요. {해설}'을 읽는다 (받침 유무에 따라 '이에요'/'예요')

#### 6.9. TC-82: 미취학아동 TTS - 해설 읽기 전에 다음 문제로 넘어가면 해설 읽기 취소

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 보기를 선택한 직후(300ms 이내) '다음 문제 →'를 클릭한다
    - expect: 이전 문제의 정답/오답 안내·해설을 읽지 않는다
    - expect: 다음 문제 읽기가 시작된다

#### 6.10. TC-84: 미취학아동 퀴즈 - 보기 오른쪽에 보기 이미지 표시

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 미취학아동 프로필로 전체 도전 모드를 시작한다
    - expect: 4개 보기 버튼마다 이미지(.opt-img)가 1개씩 표시된다
    - expect: 이미지는 보기 글자의 오른쪽에 있고 버튼 밖으로 넘치지 않는다
    - expect: 이미지는 aria-hidden이라 버튼의 접근성 이름에 섞이지 않는다
    - expect: 미취학 90문제 모두 4개의 보기 이미지(optionImages)를 가지고 있다

#### 6.11. TC-85: 미취학아동 외 프로필은 보기 이미지 없음

**File:** `specs/06-quiz-preschool.spec.ts`

**Steps:**
  1. 일반 프로필로 전체 도전 모드를 시작한다
    - expect: 보기 버튼에 이미지가 표시되지 않는다
    - expect: 미취학 외 문제에는 optionImages 필드가 없다

### 7. 결과 화면 (Result Screen)

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-37: 결과 화면 기본 요소 확인

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 일반 프로필 → 카테고리별 → 세계사 → 모든 문제 답변 → '결과 보기 →' 클릭으로 결과 화면으로 이동한다
    - expect: '퀴즈 결과' 제목이 표시된다
    - expect: 게임 모드 뱃지('🗂️ 카테고리별')가 표시된다
    - expect: 등급 아이콘(🥇🥈🥉)과 등급 문자(S/A/B/C/D)가 표시된다
    - expect: 등급에 맞는 메시지가 표시된다
    - expect: '최종 점수' 와 점수 값이 표시된다
    - expect: '정답률' 과 백분율이 표시된다
    - expect: '정답 수' (N / 11) 형식이 표시된다
    - expect: '최대 콤보' 값이 표시된다

#### 7.2. TC-38: 결과 화면 점수 내역 테이블 확인

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 결과 화면에서 점수 분석 테이블을 확인한다
    - expect: 기본, 난이도, 시간, 힌트, 콤보 5개 컬럼 헤더가 표시된다
    - expect: 각 컬럼에 누적 점수 합계가 '+N' 형식으로 표시된다
    - expect: 획득하지 못한 항목은 '-'로 표시된다

#### 7.3. TC-39: 닉네임 미입력 시 등록 버튼 비활성화

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 결과 화면의 '순위 등록' 섹션을 확인한다
    - expect: 닉네임 입력 필드에 '닉네임을 입력하세요' 플레이스홀더가 표시된다
    - expect: '등록' 버튼이 비활성화(disabled) 상태다

#### 7.4. TC-40: 닉네임 입력 시 등록 버튼 활성화

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 닉네임 입력 필드에 임의의 텍스트(예: '홍길동')를 입력한다
    - expect: '등록' 버튼이 활성화(enabled) 상태로 변경된다

#### 7.5. TC-41: 순위 등록 성공 - 등록 완료 메시지 표시

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 닉네임 입력 후 '등록' 버튼을 클릭한다
    - expect: '✅ 등록되었습니다!' 메시지가 표시된다
    - expect: '등록' 버튼이 비활성화 상태로 전환된다(중복 등록 방지)

#### 7.6. TC-42: 같은 모드로 다시 도전 버튼 동작

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 결과 화면에서 '🔄 같은 모드로 다시 도전' 버튼을 클릭한다
    - expect: 퀴즈 화면으로 바로 전환된다
    - expect: 동일한 프로필과 모드(카테고리 포함)로 새 게임이 시작된다
    - expect: 점수가 0점으로 초기화된다
    - expect: 진행 표시가 '1 / N'으로 초기화된다

#### 7.7. TC-43: 카테고리 선택으로 버튼 동작

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 결과 화면에서 '🗂️ 카테고리 선택으로' 버튼을 클릭한다
    - expect: 모드·카테고리 선택 화면으로 전환된다

#### 7.8. TC-44: 홈으로 버튼 동작

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 결과 화면에서 '🏠 홈으로' 버튼을 클릭한다
    - expect: 홈 화면으로 전환된다

#### 7.9. TC-45: 전체 정답 시 S등급 표시 확인

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 모든 문제를 힌트 없이 빠르게 정답 처리하여 최고 점수를 달성한 후 결과 화면으로 이동한다
    - expect: 등급 S가 표시된다 (40문제 환산 점수 600점 이상 기준)
    - expect: 등급에 맞는 긍정적 메시지가 표시된다

#### 7.10. TC-46: 모든 오답 시 D등급 표시 확인

**File:** `specs/07-result-screen.spec.ts`

**Steps:**
  1. 모든 문제를 의도적으로 오답 선택하여 최저 점수를 기록한 후 결과 화면으로 이동한다
    - expect: 등급 D 또는 최저 등급이 표시된다 (40문제 환산 점수 100점 미만 기준)
    - expect: 정답률이 0%로 표시된다

### 8. 순위 화면 (Ranking / Leaderboard Screen)

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-47: 순위 화면 기본 레이아웃 확인

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 홈 화면에서 '🏆 순위 기록 보기' 버튼을 클릭한다
    - expect: '🏆 리더보드' 제목이 표시된다
    - expect: 기간 필터 탭(전체, 이번 주, 오늘)이 표시된다
    - expect: 모드 필터 탭(전체, 전체도전, 카테고리별, 스피드퀴즈)이 표시된다
    - expect: 테이블 컬럼(#, 이름, 점수, 정답률, 최대콤보, 모드, 날짜)이 표시된다
    - expect: '🗑️ 리더보드 초기화' 버튼이 표시된다
    - expect: '← 홈으로' 버튼이 표시된다

#### 8.2. TC-48: 등록된 점수 리더보드에 표시

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 결과 화면에서 닉네임 '테스터'로 순위 등록 후 홈 → 순위 기록 보기 순으로 이동한다
    - expect: 리더보드 테이블에 '테스터'의 기록이 표시된다
    - expect: 닉네임, 점수, 정답률, 최대콤보, 모드, 날짜 정보가 올바르게 표시된다
    - expect: 1위 항목에 🥇 아이콘이 표시된다

#### 8.3. TC-49: 기간 탭 - 이번 주 필터링

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 순위 화면에서 '이번 주' 탭을 클릭한다
    - expect: '이번 주' 탭이 활성 상태로 강조된다
    - expect: 이번 주에 등록된 기록만 표시된다
    - expect: 이번 주에 기록이 없는 경우 '해당 기간에 기록이 없습니다 🎯' 메시지가 표시된다

#### 8.4. TC-50: 기간 탭 - 오늘 필터링

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 순위 화면에서 '오늘' 탭을 클릭한다
    - expect: '오늘' 탭이 활성 상태로 강조된다
    - expect: 오늘 날짜에 등록된 기록만 표시된다

#### 8.5. TC-51: 모드 탭 - 스피드퀴즈 필터링

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 순위 화면에서 '스피드퀴즈' 모드 탭을 클릭한다
    - expect: '스피드퀴즈' 탭이 활성 상태로 강조된다
    - expect: 스피드퀴즈 모드로 등록된 기록만 표시된다
    - expect: 스피드퀴즈 기록이 없으면 '해당 기간에 기록이 없습니다 🎯' 메시지가 표시된다

#### 8.6. TC-52: 모드 탭 - 카테고리별 필터링

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 카테고리별 모드로 게임 완료 후 등록한 뒤 순위 화면에서 '카테고리별' 탭을 클릭한다
    - expect: 카테고리별 모드 기록만 표시된다
    - expect: 다른 모드(전체도전, 스피드퀴즈) 기록은 필터링되어 숨겨진다

#### 8.7. TC-53: 기간 + 모드 복합 필터링 (데이터 없는 경우)

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 순위 화면에서 '이번 주' 기간 탭을 선택하고, '전체도전' 모드 탭을 선택한다
    - expect: 이번 주에 전체도전 모드로 등록된 기록이 없으면 빈 상태 메시지가 표시된다
    - expect: 두 필터가 동시에 적용된다

#### 8.8. TC-54: 리더보드 초기화 버튼 동작

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 리더보드에 1건 이상의 기록이 있는 상태에서 '🗑️ 리더보드 초기화' 버튼을 클릭한다
    - expect: 리더보드 테이블에서 모든 기록이 삭제된다
    - expect: 빈 상태 메시지 또는 빈 테이블이 표시된다
    - expect: localStorage의 quiz_leaderboard 키가 비워진다

#### 8.9. TC-55: 리더보드 최대 10건 표시 확인

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 10건을 초과하는 게임 기록을 등록한 후 순위 화면을 확인한다
    - expect: 순위 화면에는 최대 10건만 표시된다
    - expect: 11위 이하의 기록은 표시되지 않는다

#### 8.10. TC-87: 모바일 화면 폭에서 리더보드 표가 화면 안에 표시됨

**File:** `specs/08-ranking-screen.spec.ts`

**Steps:**
  1. 긴 닉네임과 모든 모드가 섞인 기록을 넣고 뷰포트 390px에서 순위 화면을 연다
    - expect: 표가 카드 폭을 넘지 않고, 페이지에 가로 스크롤이 생기지 않는다
    - expect: 순위 번호(첫 열)와 날짜(마지막 열)가 화면 안에 보인다 (모바일에서 날짜는 MM-DD)
    - expect: 머리글 '정답률'이 한 줄로 표시된다

### 9. 대시보드 화면 (Dashboard Screen)

**Seed:** `tests/seed.spec.ts`

#### 9.1. TC-56: 첫 게임 후 대시보드 종합 요약 확인

**File:** `specs/09-dashboard-screen.spec.ts`

**Steps:**
  1. 한 게임을 완료한 후 홈 → '📊 내 통계 보기' 순으로 이동한다
    - expect: '📊 내 통계' 제목이 표시된다
    - expect: '종합 요약' 섹션에 총 게임 수(1), 평균 점수, 평균 정답률, 최고 콤보 4개 지표가 표시된다

#### 9.2. TC-57: 대시보드 최고 기록 섹션 확인

**File:** `specs/09-dashboard-screen.spec.ts`

**Steps:**
  1. 게임 완료 후 대시보드 화면에서 '최고 기록' 섹션을 확인한다
    - expect: '🏆 역대 최고 점수'와 점수 및 날짜가 표시된다
    - expect: '🎯 역대 최고 정답률'과 정답률 및 날짜가 표시된다

#### 9.3. TC-58: 대시보드 카테고리별 정답률 표시

**File:** `specs/09-dashboard-screen.spec.ts`

**Steps:**
  1. 카테고리별 모드로 세계사 퀴즈를 완료한 후 대시보드를 확인한다
    - expect: '카테고리별 정답률' 섹션에 플레이한 카테고리(세계사)의 정답률이 'N% (정답수/총문제수)' 형식으로 표시된다

#### 9.4. TC-59: 게임 모드별 통계 - 미플레이 모드는 '-' 표시

**File:** `specs/09-dashboard-screen.spec.ts`

**Steps:**
  1. 카테고리별 모드만 1회 플레이 후 대시보드의 '게임 모드별 통계' 섹션을 확인한다
    - expect: 카테고리별: 1회 및 최고 점수가 표시된다
    - expect: 전체도전: 0회 및 '-'가 표시된다
    - expect: 스피드퀴즈: 0회 및 '-'가 표시된다

#### 9.5. TC-60: 최근 10게임 이력 테이블 확인

**File:** `specs/09-dashboard-screen.spec.ts`

**Steps:**
  1. 여러 게임을 완료한 후 대시보드의 '최근 10게임' 테이블을 확인한다
    - expect: 테이블에 날짜, 모드, 점수, 정답률, 콤보 컬럼이 표시된다
    - expect: 최근 게임이 최상단에 위치한다
    - expect: 최대 10건의 기록만 표시된다

#### 9.6. TC-61: 게임 미플레이 상태에서 대시보드 접근

**File:** `specs/09-dashboard-screen.spec.ts`

**Steps:**
  1. localStorage가 비어있는 초기 상태(또는 전체 삭제 후)에서 '📊 내 통계 보기'를 클릭한다
    - expect: 대시보드 화면이 오류 없이 표시된다
    - expect: 총 게임 수가 0으로 표시되거나 빈 상태 메시지가 표시된다

#### 9.7. TC-62: 전체 데이터 삭제 버튼 동작

**File:** `specs/09-dashboard-screen.spec.ts`

**Steps:**
  1. 대시보드 화면에서 '🗑️ 내 기록 전체 삭제' 버튼을 클릭한다
    - expect: 모든 게임 기록이 삭제된다
    - expect: 홈 화면으로 자동 전환된다
    - expect: localStorage의 quiz_game_history, quiz_player_stats, quiz_leaderboard 키가 모두 삭제된다

#### 9.8. TC-63: 데이터 삭제 후 대시보드 재접근 시 빈 상태

**File:** `specs/09-dashboard-screen.spec.ts`

**Steps:**
  1. 전체 데이터 삭제 후 홈 → '📊 내 통계 보기' 순으로 이동한다
    - expect: 대시보드가 초기화된 빈 상태로 표시된다
    - expect: 총 게임 수가 0이거나 게임 기록이 없음을 나타내는 상태가 표시된다

#### 9.9. TC-88: 프로필 전용 카테고리(생물 등) 기록도 카테고리별 정답률에 표시

**File:** `specs/09-dashboard-and-storage.spec.ts`

**Steps:**
  1. 미취학 '생물'과 초등 '태권도' 카테고리 게임 결과를 저장한 뒤 대시보드를 연다
    - expect: '카테고리 모드 기록이 없어요' 대신 생물·태권도 정답률이 'N% (정답/총문제)'로 표시된다
    - expect: quiz_player_stats.categoryStats에 두 카테고리가 누적된다

#### 9.10. TC-89: 닉네임 등록 없이도 이력·통계 자동 저장, 등록은 순위에만 추가

**File:** `specs/09-dashboard-and-storage.spec.ts`

**Steps:**
  1. 퀴즈를 완료해 결과 화면에 도달한다 (닉네임 등록 안 함)
    - expect: quiz_game_history·quiz_player_stats에 1판이 저장되고, quiz_leaderboard는 비어 있다
    - expect: '기록은 내 통계에 자동으로 저장돼요' 안내 문구가 표시된다
  2. 닉네임을 입력하고 등록한다
    - expect: 리더보드에만 1건 추가되고 이력·통계는 중복 집계되지 않는다
  3. 홈 → '🏆 순위 기록 보기'
    - expect: '📌 내 최고기록' 카드가 표시된다

### 10. 데이터 지속성 및 localStorage (Data Persistence)

**Seed:** `tests/seed.spec.ts`

#### 10.1. TC-64: 게임 완료 후 quiz_game_history 저장 확인

**File:** `specs/10-data-persistence.spec.ts`

**Steps:**
  1. 게임을 완료하고 결과 화면에서 순위 등록까지 마친다
    - expect: 브라우저 개발자 도구의 localStorage에서 'quiz_game_history' 키에 게임 데이터가 JSON 형식으로 저장된다
    - expect: 저장된 데이터에 모드, 점수, 정답률, 날짜 정보가 포함된다

#### 10.2. TC-65: 순위 등록 후 quiz_leaderboard 저장 확인

**File:** `specs/10-data-persistence.spec.ts`

**Steps:**
  1. 결과 화면에서 닉네임 입력 후 '등록' 버튼을 클릭한다
    - expect: localStorage의 'quiz_leaderboard' 키에 닉네임, 점수, 모드 정보가 저장된다

#### 10.3. TC-66: quiz_player_stats 누적 통계 업데이트 확인

**File:** `specs/10-data-persistence.spec.ts`

**Steps:**
  1. 2번의 게임을 순차적으로 완료한다
    - expect: localStorage의 'quiz_player_stats' 키의 총 게임 수가 2로 업데이트된다
    - expect: 평균 점수 및 정답률이 두 게임의 평균으로 갱신된다

#### 10.4. TC-67: 페이지 새로고침 후 데이터 유지

**File:** `specs/10-data-persistence.spec.ts`

**Steps:**
  1. 게임 완료 및 순위 등록 후 페이지를 새로고침(F5)한다
    - expect: 홈 화면이 정상적으로 로드된다
    - expect: 순위 화면을 열면 이전에 등록한 기록이 유지된다
    - expect: 대시보드를 열면 이전 게임 통계가 유지된다

### 11. 엣지 케이스 및 유효성 검사 (Edge Cases & Validation)

**Seed:** `tests/seed.spec.ts`

#### 11.1. TC-68: 닉네임 필드 공백만 입력 시 등록 버튼 상태

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. 결과 화면의 닉네임 입력 필드에 공백 문자(' ')만 입력한다
    - expect: '등록' 버튼이 활성화되거나 비활성화 상태인지 확인한다
    - expect: 공백만으로 등록이 허용된다면 리더보드에서의 표시 방식을 확인한다

#### 11.2. TC-69: 답변 버튼 빠른 연속 클릭으로 중복 처리 방지

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. 퀴즈 화면에서 선택지 버튼을 매우 빠르게 두 번 연속 클릭한다
    - expect: 첫 번째 클릭만 처리된다
    - expect: 두 번째 이후 클릭은 무시된다 (버튼이 이미 비활성화되어 중복 처리 불가)

#### 11.3. TC-70: 모드 선택 후 프로필 변경 시 문제 수 갱신

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. 일반 프로필(44문제)을 선택한 후 뒤로 가서 초등학생 프로필(40문제)로 변경한다
    - expect: 모드 선택 화면에서 전체 도전 문제 수가 40문제로 갱신된다
    - expect: 카테고리별 선택 시 초등학생 카테고리 목록이 표시된다

#### 11.4. TC-71: 다시 도전 시 문제 순서 랜덤 셔플 확인

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. 동일한 카테고리 모드로 두 번 연속 플레이한다. 첫 번째와 두 번째 게임의 첫 문제를 비교한다
    - expect: 두 번 이상 플레이하면 문제 출제 순서가 동일하지 않을 가능성이 높다 (랜덤 셔플 확인)

#### 11.5. TC-72: 리더보드 초기화 후 게임 데이터(이력/통계)는 유지

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. 게임을 완료하고 순위 등록 후, 순위 화면에서 '🗑️ 리더보드 초기화' 버튼을 클릭한다. 이후 홈 → 대시보드로 이동한다
    - expect: 대시보드의 게임 이력과 통계(총 게임 수, 점수 등)는 삭제되지 않고 유지된다
    - expect: 리더보드 초기화는 quiz_leaderboard 키만 삭제한다

#### 11.6. TC-73: 스피드 모드 타이머 만료 후 즉시 다음 문제 답변

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. 스피드 모드에서 타이머가 만료된 직후(0초) '다음 문제 →' 버튼을 클릭한다
    - expect: 다음 문제로 정상적으로 넘어간다
    - expect: 새 문제에 대한 타이머가 15초부터 다시 시작된다

#### 11.7. TC-74: XSS 방어 - 닉네임에 HTML 특수 문자 입력

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. 결과 화면 닉네임 필드에 '<script>alert(1)</script>' 또는 '<b>굵은글씨</b>' 를 입력하고 등록한다
    - expect: 리더보드에서 HTML 태그가 실행되지 않고 텍스트 그대로 이스케이프되어 표시된다
    - expect: XSS 공격이 차단된다 (escHtml 함수 적용 확인)

#### 11.8. TC-75: 게임 화면 간 네비게이션 일관성 확인

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. 홈 → 프로필 → 모드 선택 순서로 이동한 후, 각 화면의 '← 홈으로' 버튼을 클릭한다
    - expect: 어느 화면에서든 '← 홈으로' 버튼 클릭 시 홈 화면으로 이동한다
    - expect: 홈 화면의 3개 버튼이 모두 정상 표시된다

#### 11.9. TC-76: 로컬 시간대 기준 날짜 기록 (KST 자정~오전 9시)

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. 브라우저 시간대를 Asia/Seoul, 현재 시각을 2026-11-14 08:00 KST(= UTC 11-13 23:00)로 고정한 뒤 세계사 카테고리 퀴즈를 완료하고 닉네임을 등록한다
    - expect: quiz_leaderboard·quiz_game_history에 저장된 date가 UTC 날짜(2026-11-13)가 아닌 로컬 날짜 '2026-11-14'이다
    - expect: 순위 화면 '오늘' 탭에 방금 등록한 기록이 표시된다

#### 11.10. TC-77: 미취학아동 퀴즈 - 답 선택 시 TTS 읽기 중지

**File:** `specs/11-edge-cases.spec.ts`

**Steps:**
  1. speechSynthesis를 모킹한 상태로 미취학아동 퀴즈를 시작하고, 문제 읽기가 끝나 보기 ① 읽기(하이라이트)가 시작되게 한다
    - expect: 보기 ①에 .tts-reading 하이라이트가 표시된다
  2. 보기를 선택해 답한다
    - expect: speechSynthesis.cancel()이 호출되어 진행 중이던 읽기가 중단된다
    - expect: 모든 보기에서 .tts-reading 하이라이트가 제거되고 이후에도 다시 생기지 않는다
