# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

단일 파일(`index.html`, 약 5,400줄) 상식 퀴즈 게임 웹앱. 외부 라이브러리 없이 Vanilla HTML/CSS/JS만 사용.

백업 파일 명명 규칙: `index.backup.YYYYMMDD.html` (예: `index.backup.20260704.html`)
선생님 모드 출력 파일: `teacher-report-YYYYMMDD.html` (프로젝트 루트에 생성)

## 개발 및 실행

빌드 도구 없음. 브라우저에서 직접 열거나 로컬 서버로 실행.

```bash
# MCP 브라우저 도구 사용 시 (file:// 접근 불가) — 로컬 서버 필요
# .claude/settings.local.json에 사전 허가된 포트: 8765
python -m http.server 8765
# → http://localhost:8765 에서 확인

# 8080도 사용 가능하나 권한 승인 필요
# python -m http.server 8080
```

## 테스트 (Playwright)

```bash
npm install                 # @playwright/test 설치 (최초 1회)
npx playwright test         # 전체 스위트 실행
npx playwright test tests/ai-generated/04-quiz-standard.spec.ts   # 단일 파일 실행
npx playwright test -g "TC-12"                                    # 이름/TC 번호로 필터
npm run test:headed         # 헤드풀 모드
npm run test:ui             # Playwright UI 모드
```

- `playwright.config.ts`: `webServer`가 `python -m http.server 8765`를 자동 기동(`reuseExistingServer: true`) — 별도 서버 실행 불필요. `baseURL`은 `http://localhost:8765`, 뷰포트는 모바일 크기(390×844) 고정.
- 테스트 스위트 2벌 공존:
  - `tests/quiz.spec.ts` — 초기 작성된 단일 파일 스위트(10 TC)
  - `tests/ai-generated/`(`01-home-screen.spec.ts` ~ `11-edge-cases.spec.ts`, 총 86 TC) — `specs/quiz-app-test-plan.md` 테스트 계획서를 기반으로 화면별로 분리 생성된 스위트. 신규 테스트는 이쪽에 추가. 계획서 10번 섹션(데이터 지속성)은 별도 파일 없이 `09-dashboard-and-storage.spec.ts`에 합쳐져 있어 `10-*` 파일이 없음. 테스트 이름은 `TC-NN: ...` 형식.
- `tests/seed.spec.ts`: 테스트 계획서의 각 섹션이 `**Seed:**`로 참조하는 시드 테스트(홈 화면 로드 + localStorage 3종 키 삭제). 다른 spec 실행 전에 자동 실행되는 것이 아니므로, 격리는 각 spec의 `test.beforeEach`에서 `localStorage.removeItem('quiz_game_history' | 'quiz_player_stats' | 'quiz_leaderboard')` 3종을 반복해 확보함 — 새 spec도 동일 패턴 적용. `testDir: './tests'`라 전체 실행 시 seed도 1개 테스트로 함께 실행됨.
- `.mcp.json`이 `playwright-test` MCP 서버(`npx playwright run-test-mcp-server`)를 등록 — `.claude/agents/`에 정의된 `playwright-test-planner`/`playwright-test-generator`/`playwright-test-healer` 에이전트가 이 서버를 통해 계획 수립·테스트 생성·실패 테스트 수정을 수행.
- `playwright-report/`, `test-results/`, `test-report-*.html`, `teacher-report-*.html`, `index.backup.*.html`은 생성물로 `.gitignore` 대상.
- TTS 테스트는 실제 음성 대신 `page.addInitScript`로 `window.speechSynthesis`를 모킹해 발화 텍스트를 기록하고 `onend`를 테스트가 직접 발생시킴 (`06-quiz-preschool.spec.ts`의 'TTS 음성 안내' describe 참고). `gameState`는 최상위 `const`라 `window`에 없으므로 `page.evaluate` 안에서 `eval('gameState...')`로 접근.
- `specs/quiz-app-test-plan.md`: 화면별 TC 목록과 각 TC의 seed·steps·expect가 정의된 원본 테스트 계획서. 새 TC 추가 시 이 문서를 먼저 갱신.

## 아키텍처

### 화면 전환 방식
- 7개의 `<section class="screen">` 존재. `.visible` 클래스 유무로 표시/숨김 처리
- `showScreen(screenId)` → `clearInterval(timerInterval)` + `stopSpeech()` → `.visible` 교체 → `init*()` 호출
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
  category,       // 선택된 카테고리 id ('all' | 'history' | 'science' | 'geo' | 'general' | 'taekwondo' | 'totoro' | 'living' | 'dessert' | null)
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
| `preschool` | 미취학아동 (7세 이하) | PS-001~090 (90문제: 일반 상식 PS-001~020 all easy + 이웃집 토토로 PS-021~050 easy 20·medium 10 + 생물 PS-051~070·디저트 PS-071~090 각 easy 15·medium 5) | TTS 자동 재생, 보기 하이라이트, 보기 이미지 |
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

파일 내 선언 순서: `SCORE_CONFIG` → `QUESTIONS` → `PROFILES`/`MODES`/`CATEGORIES` → `PREFIXES` → `GRADE_TABLE` → `STORAGE_*`

| 상수 | 설명 |
|---|---|
| `QUESTIONS` | 문제 배열 총 194개 (일반 44 + preschool 90 + elementary 40 + middle 20) |
| `PREFIXES` | 선택지 접두어 배열 `['①','②','③','④']` |
| `PROFILES` | 프로필 메타데이터 (4개) |
| `CATEGORIES` | 카테고리 메타데이터 (8개: history·science·geo·general·taekwondo·totoro·living·dessert) |
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

**날짜**: 기록의 `date`(`YYYY-MM-DD`)와 '오늘' 필터는 `localDateStr()`(로컬 시간대 기준)로 생성. `toISOString()`은 UTC라 KST 00~09시에 전날로 기록되므로 날짜 문자열 생성에 쓰지 말 것.

**리더보드 조회**: `getLeaderboard({ period, mode })` — period: `'all'|'week'|'day'`, mode: `'all'|'speed'|'category'|null`. 저장은 최대 50건(`RANKING_MAX`)이지만 조회 결과는 항상 상위 10건으로 잘려 반환됨(`slice(0, 10)`).

**데이터 초기화**:
- `clearRanking()` — 리더보드만 삭제 (`STORAGE_LEADERBOARD`)
- `clearAllData()` — 이력·통계·리더보드 전체 삭제 후 홈 화면 전환 (대시보드 화면에서만 노출)

### TTS (미취학아동 전용)

- Web Speech API (`SpeechSynthesisUtterance`) 사용. `_ttsVoice`는 IIFE 클로저 `let` 변수 (window에 노출 안 됨).
- `renderQuestion()` 끝에서 preschool이면 `stopSpeech()`로 이전 해설 읽기를 끊은 뒤 `setTimeout(readQuestionAloud, 450)` 예약.
- `readQuestionAloud()`: 문제 읽기 → 보기를 '일번, {보기}.' ~ '사번, {보기}.'로(`TTS_OPTION_NUMS` — '1번'으로 넘기면 TTS가 '한 번'으로 읽으므로 한글 표기) **onend 체이닝** 방식 순차 재생 (Chrome 큐 방식 onstart 불안정 이슈 회피).
- `showHint()`: 진행 중인 읽기를 끊고 '힌트예요. {힌트}'를 읽음 (`speakText()`가 내부에서 `stopSpeech()` 호출).
- `handleAnswer()` 끝: 300ms 후 정답이면 '정답이에요! {해설}', 오답이면 '아쉬워요. 정답은 {일번~사번}, {정답}이에요/예요. {해설}'을 읽음. 조사는 `copulaFor()`가 받침 유무로 결정. 이 예약도 `ttsStartTimer`를 공유해 다음 문제로 넘어가면 취소됨.
- 현재 읽는 보기에 `.tts-reading` 클래스 추가 → `.quiz-options .opt-btn.tts-reading` 선택자로 하이라이트 (특이성 확보 필수).
- `stopSpeech()`가 음성 취소 + 하이라이트 제거 + 자동 읽기 예약(`ttsStartTimer`, 450ms `setTimeout`) 취소를 담당. `showScreen()`과 `handleAnswer()`가 항상 호출 → 답 선택 후에는 남은 보기를 읽지 않음.

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

문제 추가·수정 시 확인 사항(4항목 검증 체크리스트)은 `.claude/commands/quiz-add.md`의 "Step 3 — 검증" 참고.

문제 객체 형식:

```js
{
  id: 'XX-NNN',          // 일반: WH/SC/GE/GN + 3자리 번호 / 프로필: PS/EL/MS + 3자리 번호
  profile: '...',        // 프로필 문제만 명시 ('preschool'|'elementary'|'middle'). 일반 문제는 생략.
  category: '...',       // 'history' | 'science' | 'geo' | 'general' | 'taekwondo' | 'totoro' | 'living' | 'dessert'
  difficulty: '...',     // 'easy' | 'medium' | 'hard'
  question: '...',
  options: ['...', '...', '...', '...'],  // 반드시 4개
  optionImages: ['...', '...', '...', '...'],  // preschool 문제만, 반드시 4개 (아래 '보기 이미지' 참고)
  answer: N,             // 0-based index (0~3)
  hint: '...',           // 정답을 직접 노출하지 않는 1~2문장
  explanation: '...',    // 정답 근거 + 오답 이유 포함 2~3문장
}
```

**보기 이미지 (preschool 전용)**: `optionImages[i]`가 `options[i]` 오른쪽에 표시됨 (`optionImageHtml()`, `aria-hidden`).
- `'#rrggbb'` → 색 동그라미(색깔 보기), 숫자 문자열(`'5'`) → 점 개수 그림(최대 12), 그 외 → 이모지 (`'🐱🚌'`처럼 여러 개 가능)
- 보기 글자 내용만 그림으로 옮기고, 문제의 정답 대상을 그리지 않음 (예: '강아지는 어떻게 짖을까요?'의 소리 보기는 동물 대신 모두 🔊)
- 토토로 캐릭터는 저작물이라 일반 아이콘으로 대체: 사츠키 👧 · 메이 🧒 · 칸타 👦 · 토토로 🐾
- Unicode 15 이모지(🩶 🩷 🪽 🪈 등)는 구형 기기에서 깨지므로 사용하지 않음

권장 난이도 비율: easy 30% / medium 50% / hard 20%  
권장 정답 번호 분포: 각 번호(1~4번) 40% 미만, 0% 없도록 유지  
현재 달성 현황: elementary(태권도 포함)·middle 각 번호 정확히 25%, preschool(90문제) 26/26/24/24%

### 카테고리별 문제 현황

| 카테고리 | id | 프로필 | 문제 수 |
|---|---|---|---|
| 세계사 | `history` | general + elementary + middle | — |
| 과학 | `science` | general + elementary + middle | — |
| 지리 | `geo` | general + elementary + middle | — |
| 일반상식 | `general` | general + elementary + middle | — |
| 태권도 | `taekwondo` | **elementary 전용** (EL-021~040) | 20문제 |
| 이웃집 토토로 | `totoro` | **preschool 전용** (PS-021~050) | 30문제 |
| 생물 | `living` | **preschool 전용** (PS-051~070, 동물 10·곤충 5·식물 5) | 20문제 |
| 디저트 | `dessert` | **preschool 전용** (PS-071~090, 서양 디저트 + 한국 간식, 상품명 미사용) | 20문제 |

`CATEGORIES`에 없는 카테고리 카드는 `initCategory()`에서 자동 숨김 (`count === 0` 조건). 새 카테고리 추가 시 반드시 `CATEGORIES`에 등록해야 결과 분석 화면(`renderAnalysis`)에서 표시됨.
