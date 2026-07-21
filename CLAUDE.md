# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

단일 파일(`index.html`, 약 4,700줄) 상식 퀴즈 게임 웹앱. 외부 라이브러리 없이 Vanilla HTML/CSS/JS만 사용.

백업 파일 명명 규칙: `index.backup.YYYYMMDD.html` (예: `index.backup.20260704.html`)

## 개발 및 실행

빌드 도구 없음. 브라우저에서 직접 열거나 로컬 서버로 실행.

```bash
# MCP 브라우저 도구 사용 시 (file:// 접근 불가) — 로컬 서버 필요
python -m http.server 8080
# → http://localhost:8080 에서 확인
```

## 아키텍처

### 화면 전환 방식
- 7개의 `<section class="screen">` 존재. `.visible` 클래스 유무로 표시/숨김 처리
- `showScreen(screenId)` → `clearInterval(timerInterval)` + `speechSynthesis.cancel()` → `.visible` 교체 → `init*()` 호출
- **timerInterval은 화면 전환·답안 제출 시 반드시 `clearInterval` 호출**

### 화면 목록 & 초기화 함수

| 화면 ID | 초기화 함수 | 역할 |
|---|---|---|
| `#home-screen` | `initHome()` | 정적 (퀴즈 시작 버튼) |
| `#profile-screen` | `initProfile()` | 연령 프로필 선택 (2×2 카드 그리드) |
| `#category-screen` | `initCategory()` | 모드·카테고리 선택 |
| `#quiz-screen` | `initQuiz()` | 문제 풀 선택 후 `renderQuestion(0)` |
| `#result-screen` | `initResult()` | 점수·등급·문항 분석 |
| `#ranking-screen` | `initRanking()` | 리더보드 (기간·모드 탭 필터) |
| `#dashboard-screen` | `initDashboard()` | 개인 통계 (게임 이력 기반) |

### 전역 상태 (`gameState` 객체)

```js
{
  currentScreen,  // 현재 화면 id
  profile,        // 'preschool' | 'elementary' | 'middle' | 'general' | null
  category,       // 선택된 카테고리 id ('all' | 'history' | 'science' | 'geo' | 'general' | null)
  questions,      // 현재 게임 문제 배열 (셔플된 풀의 부분집합)
  currentIndex,   // 현재 문제 인덱스
  score,          // 누적 점수 (calculateScore() 합산)
  answers,        // [{ questionId, chosen, correct, breakdown }]
  playerName,     // 플레이어 이름
  mode,           // 'all' | 'category' | 'speed'
  combo,          // 현재 연속 정답 수
  maxCombo,       // 최대 콤보
  hintUsed,       // 현재 문제 힌트 사용 여부
  startTime,      // 현재 문제 시작 시각 (Date.now()) — 문제별 타이머용
  gameStartTime,  // 게임 전체 시작 시각 (Date.now()) — duration 계산용, initQuiz()에서 1회 설정
}
```

### 프로필 시스템

| 프로필 id | 대상 | 문제 풀 | 특이사항 |
|---|---|---|---|
| `preschool` | 미취학아동 (7세 이하) | PS-001~020 (20문제, all easy) | TTS 자동 재생, 보기 하이라이트 |
| `elementary` | 초등학생 (8~13세) | EL-001~040 (40문제, 태권도 포함) | — |
| `middle` | 중학생 (13~15세) | MS-001~020 (20문제) | — |
| `general` | 일반/성인 | WH/SC/GE/GN (44문제, profile 필드 없음) | — |

`getQuestionPool()`: `gameState.profile` 읽어 필터 — `!q.profile` → general, `q.profile === p` → 해당 프로필

### 게임 모드

| 모드 id | 문제 수 | 문제 풀 |
|---|---|---|
| `all` | 전체 | 전체 문제 순서 셔플 |
| `category` | 카테고리 전체 | 선택한 카테고리의 basePool 필터 결과 (slice 없음) |
| `speed` | 20문제 | 전체 랜덤 셔플 + 15초 타이머 |

### 점수 계산 (`calculateScore`)

시그니처: `calculateScore(isCorrect, difficulty, timeSpent, hintUsed, currentCombo)`

- 기본 10점 + 난이도 배수(easy×1 / medium×1.5 / hard×2)
- 보너스: 빠른 응답(10초 미만 +3), 힌트 미사용(+2), 콤보(3번째→+2, 5번째→+5, 10번째→+20)
- `calcGrade(score, total)`: 40문제 기준 환산(`score × 40/total`) 후 S/A/B/C/D 등급 판정

### 주요 전역 상수

파일 내 선언 순서: `SCORE_CONFIG` → `QUESTIONS` → `PREFIXES` → `PROFILES`/`MODES`/`CATEGORIES` → `GRADE_TABLE` → `STORAGE_*`

> **주의**: `index.html` 내부의 `/* 문제 데이터 (40문제) */` 주석은 stale — 실제 문제 수는 124개.

| 상수 | 설명 |
|---|---|
| `QUESTIONS` | 문제 배열 총 124개 (일반 44 + preschool 20 + elementary 40 + middle 20) |
| `PREFIXES` | 선택지 접두어 배열 `['①','②','③','④']` |
| `PROFILES` | 프로필 메타데이터 (4개) |
| `CATEGORIES` | 카테고리 메타데이터 (5개: history·science·geo·general·taekwondo) |
| `MODES` | 게임 모드 메타데이터 (3개) |
| `SCORE_CONFIG` | 점수 계산 파라미터 |
| `GRADE_TABLE` | 등급 기준표 (40문제 환산 기준: S≥600, A≥400, B≥250, C≥100, D<100) |
| `timerInterval` | 스피드 모드 타이머 핸들 (전역 `let`) |

### localStorage 구조

3개의 키로 분리 관리. **`quizRanking`(구 키)는 마이그레이션 IIFE로 자동 변환 후 삭제됨.**

| 상수 | 키 | 내용 | 상한 |
|---|---|---|---|
| `STORAGE_HISTORY` | `quiz_game_history` | 게임 이력 전체 | 100건 |
| `STORAGE_STATS` | `quiz_player_stats` | 플레이어 누적 통계 | 1개 객체 |
| `STORAGE_LEADERBOARD` | `quiz_leaderboard` | 점수 순위표 | 50건 |

**저장 진입점**: 결과 화면에서 `registerScore()` → `saveGameResult(gameData, playerName)` 호출.  
내부에서 `getGameHistory()` → `updatePlayerStats()` → `saveToLeaderboard()` 순으로 처리.

**리더보드 조회**: `getLeaderboard({ period, mode })` — period: `'all'|'week'|'day'`, mode: `'all'|'speed'|'category'|null`

**데이터 초기화**:
- `clearRanking()` — 리더보드만 삭제 (`STORAGE_LEADERBOARD`)
- `clearAllData()` — 이력·통계·리더보드 전체 삭제 후 홈 화면 전환 (대시보드 화면에서만 노출)

### TTS (미취학아동 전용)

- Web Speech API (`SpeechSynthesisUtterance`) 사용. `_ttsVoice`는 IIFE 클로저 `let` 변수 (window에 노출 안 됨).
- `renderQuestion()` 끝에서 preschool이면 `setTimeout(readQuestionAloud, 450)` 자동 호출.
- `readQuestionAloud()`: 문제 읽기 → 보기① ~ ④를 **onend 체이닝** 방식으로 순차 재생 (Chrome 큐 방식 onstart 불안정 이슈 회피).
- 현재 읽는 보기에 `.tts-reading` 클래스 추가 → `.quiz-options .opt-btn.tts-reading` 선택자로 하이라이트 (특이성 확보 필수).
- `showScreen()` 호출 시 항상 `speechSynthesis.cancel()` 실행.

### 핵심 함수 목록 (퀴즈 흐름)

| 함수 | 역할 |
|---|---|
| `getQuestionPool()` | `gameState.profile`로 문제 풀 필터링 반환 |
| `renderQuestion(index)` | 문제 렌더링 — `clearInterval` 후 보기 버튼 생성, preschool이면 TTS 예약 |
| `handleAnswer(selectedIndex)` | 답안 처리 — 정오 판정·점수 계산·`gameState.answers` push |
| `calculateScore(...)` | 점수 산출 (정오·난이도·시간·힌트·콤보) |
| `calcGrade(score, total)` | 40문제 환산 후 S/A/B/C/D 등급 반환 |
| `registerScore()` | 결과 화면에서 호출 → `saveGameResult()` 진입점 |
| `escHtml(str)` | XSS 방지용 HTML 이스케이프 — 동적 렌더링 시 반드시 사용 |

### CSS 규칙

- 모든 색상은 `:root`의 CSS Variables 사용 (`--color-primary`, `--color-accent` 등)
- 반응형 기준점: `max-width: 480px`
- 폰트: `Noto Sans KR` (Google Fonts CDN)
- 애니메이션 바차트: `data-target` 속성 + double `requestAnimationFrame` 패턴 사용

## 커스텀 슬래시 명령어 (`.claude/commands/`)

| 명령어 | 기능 | 주요 인수 |
|---|---|---|
| `/quiz-add` | QUESTIONS에 문제 1개 추가 (5단계 자동화) | `[카테고리] [난이도]` |
| `/quiz-range` | 순번 범위별 문제 검토 (난이도·정답 분포) | `[start] [end]` |
| `/quiz-validate` | 최상급·절대 표현 포함 문제 기준 검증 | `[카테고리]` |
| `/quiz-check` | 전체 정답 사실 검증 (확신도 HIGH/MEDIUM/LOW) | `[카테고리]` |
| `/quiz-stats` | 전체 통계 분석 (난이도·정답 분포·ID 체계) | `[카테고리]` |
| `/quiz-leaderboard` | localStorage 리더보드 출력 | `[기간] [모드]` |
| `/quiz-daily` | 일일 유지보수 루틴 (7단계, 백업 자동 생성) | `[난이도]` |
| `/teacher-mode` | 학급 전체 현황·순위·분석 종합 보고서 (MCP 브라우저 필요) | `[학생명]` |
| `/teacher-overview` | localStorage에서 학급 전체 플레이 현황 요약 | — |
| `/teacher-ranking` | 학생별 성적 순위표 출력 | `[모드]` |
| `/teacher-analysis` | 카테고리·모드별 성취 분석 | — |
| `/teacher-student` | 특정 학생 상세 성적 조회 | `학생명` (필수) |

## 퀴즈 문제 작성 가이드라인

문제 추가·수정 시 확인 사항:

1. **정답이 하나뿐인가?** — 다른 해석 가능 시 조건 명시 (예: 면적 기준, 2026년 기준)
2. **최상급 표현에 기준이 있는가?** — "가장 큰", "최초의" 등에 측정 기준 명시
3. **시간과 범위가 명확한가?** — 변할 수 있는 정보는 시점 명시, 지리적·분류적 범위 한정
4. **교차 검증했는가?** — 의심스러운 정보는 주류 학설 기준, 논란 있는 내용 지양

문제 객체 형식:

```js
{
  id: 'XX-NNN',          // 일반: WH/SC/GE/GN + 3자리 번호 / 프로필: PS/EL/MS + 3자리 번호
  profile: '...',        // 프로필 문제만 명시 ('preschool'|'elementary'|'middle'). 일반 문제는 생략.
  category: '...',       // 'history' | 'science' | 'geo' | 'general' | 'taekwondo'
  difficulty: '...',     // 'easy' | 'medium' | 'hard'
  question: '...',
  options: ['...', '...', '...', '...'],  // 반드시 4개
  answer: N,             // 0-based index (0~3)
  hint: '...',           // 정답을 직접 노출하지 않는 1~2문장
  explanation: '...',    // 정답 근거 + 오답 이유 포함 2~3문장
}
```

권장 난이도 비율: easy 30% / medium 50% / hard 20%  
권장 정답 번호 분포: 각 번호(1~4번) 40% 미만, 0% 없도록 유지  
현재 달성 현황: preschool·elementary(태권도 포함)·middle 모두 각 번호 정확히 25%

### 카테고리별 문제 현황

| 카테고리 | id | 프로필 | 문제 수 |
|---|---|---|---|
| 세계사 | `history` | general + elementary + middle | — |
| 과학 | `science` | general + elementary + middle | — |
| 지리 | `geo` | general + elementary + middle | — |
| 일반상식 | `general` | general + elementary + middle | — |
| 태권도 | `taekwondo` | **elementary 전용** (EL-021~040) | 20문제 |

`CATEGORIES`에 없는 카테고리 카드는 `initCategory()`에서 자동 숨김 (`count === 0` 조건). 새 카테고리 추가 시 반드시 `CATEGORIES`에 등록해야 결과 분석 화면(`renderAnalysis`)에서 표시됨.
