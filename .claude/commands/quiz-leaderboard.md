브라우저의 localStorage에서 퀴즈 리더보드 데이터를 읽어 플레이어 점수를 집계하고 순위를 출력해줘.

$ARGUMENTS 형식: "$1 $2"
- $1 = 기간 필터: all(전체) | week(이번 주) | day(오늘) — 생략 시 all
- $2 = 모드 필터: all | speed | category | challenge — 생략 시 all

## 실행 순서

### Step 1 — 브라우저 연결 및 데이터 추출
MCP 브라우저 도구(mcp__claude-in-chrome__)를 사용해:
1. 현재 탭 목록을 확인한다 (tabs_context_mcp).
2. http://localhost:8080 탭이 없으면 새 탭을 열고 이동한다.
3. JavaScript로 localStorage에서 데이터를 읽는다:

```js
JSON.parse(localStorage.getItem('quiz_leaderboard') || '[]')
```

데이터가 없으면 "리더보드 기록이 없습니다. 게임을 플레이한 후 다시 시도해주세요." 출력 후 종료.

### Step 2 — 필터 적용

$1(기간)에 따라 records를 필터링:
- all  : 전체 records 사용
- week : record.date가 이번 주 월요일 이후인 것만
- day  : record.date가 오늘(YYYY-MM-DD)인 것만

$2(모드)에 따라 추가 필터링:
- all       : 모든 모드
- speed     : record.mode === 'speed'
- category  : record.mode === 'category'
- challenge : record.mode === 'all'

### Step 3 — 점수 집계

필터된 records를 플레이어(name)별로 집계:
- 최고 점수 (bestScore)
- 플레이 횟수 (playCount)
- 평균 정답률 (avgRate)
- 최대 콤보 (maxCombo)
- 최근 플레이 날짜 (lastDate)

집계 후 bestScore 내림차순 → playCount 내림차순으로 정렬.

### Step 4 — 리더보드 출력

#### 헤더
```
🏆 리더보드 — [기간 레이블] | [모드 레이블]
집계 기준: [오늘 날짜]  총 N명 / N게임
```

#### 순위표 (상위 10명)
| 순위 | 플레이어 | 최고점수 | 평균정답률 | 플레이수 | 최대콤보 | 최근기록 |
|---|---|---|---|---|---|---|
| 🥇 1 | 이름 | 000점 | 00% | N회 | N | YYYY-MM-DD |
| 🥈 2 | ... |
| 🥉 3 | ... |
| 4 | ... |

1~3위는 🥇🥈🥉 이모지 표시.
11위 이하는 "(이하 생략)" 메시지.

#### 모드별 1위
각 모드(전체도전/카테고리별/스피드퀴즈)의 최고 점수 1위를 별도로 표시:
```
⚡ 스피드퀴즈  1위: [이름] [점수]점
🗂 카테고리별  1위: [이름] [점수]점
🌍 전체도전   1위: [이름] [점수]점
```
해당 모드 기록이 없으면 "-" 표시.

### Step 5 — 갱신 안내

리더보드 데이터를 읽기만 하고 수정하지 않는다.
새 게임 결과는 게임 종료 시 자동으로 localStorage에 저장된다.
마지막에 아래 안내를 출력한다:
```
※ 리더보드는 게임 완료 시 자동 갱신됩니다.
※ /quiz-leaderboard week speed 형태로 필터를 적용할 수 있습니다.
```
