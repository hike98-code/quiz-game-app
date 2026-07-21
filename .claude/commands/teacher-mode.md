선생님 모드를 실행해줘. 학생들의 퀴즈 성적을 단계별로 분석하고 종합 보고서를 출력한다.

$ARGUMENTS 형식: "$1" — 예: "홍길동" (특정 학생 상세 조회 포함 시)
- $1 = 상세 조회할 학생 이름 (생략 가능. 생략 시 전체 현황만 출력)

---

## 실행 원칙

각 단계는 순서대로 실행한다.
단계가 실패하면 **즉시 중단**하고 오류를 보고한다:

```
❌ [Step N 실패] 단계명
원인: <오류 내용>
조치: <해결 방법 제안>
```

---

## Step 0 — 사전 준비

MCP 브라우저 도구(mcp__claude-in-chrome__)를 사용해:
1. 현재 탭 목록 확인 (tabs_context_mcp)
2. http://localhost:8080 탭이 없으면 새 탭을 열고 이동
3. 아래 JavaScript로 데이터를 한 번에 읽어 이후 단계에서 재사용:

```js
JSON.stringify({
  leaderboard: JSON.parse(localStorage.getItem('quiz_leaderboard') || '[]'),
  history:     JSON.parse(localStorage.getItem('quiz_game_history') || '[]'),
  stats:       JSON.parse(localStorage.getItem('quiz_player_stats') || 'null')
})
```

데이터가 완전히 비어 있으면:
```
⚠️ 선생님 모드: 플레이 기록이 없습니다.
학생들이 게임을 완료한 후 다시 실행해주세요.
```
출력 후 종료.

성공 시:
```
✅ Step 0 완료 — 데이터 로드
  · leaderboard: N건 / game_history: N건
  · 참여 학생 수: N명
```

---

## Step 1 — 학급 전체 현황 (teacher-overview 실행)

leaderboard 전체를 분석해 아래를 출력한다:

**1-A. 기본 현황**
```
👥 참여 학생: N명
🎮 총 플레이: N회  (1인 평균 N.N회)
⭐ 전체 평균 점수: N점
🎯 전체 평균 정답률: N%
🏆 최고 점수: N점 — [학생명]
🎯 최고 정답률: N% — [학생명]
```

**1-B. 모드별 현황 테이블**
| 모드 | 플레이 수 | 평균 점수 | 평균 정답률 |
|---|---|---|---|
| 전체도전 | N | N점 | N% |
| 카테고리별 | N | N점 | N% |
| 스피드퀴즈 | N | N점 | N% |

**1-C. 등급 분포**
| 등급 | 기준 | 달성 횟수 | 비율 |
|---|---|---|---|
| S | 600점↑ | N | N% |
| A | 400점↑ | N | N% |
| B | 250점↑ | N | N% |
| C | 100점↑ | N | N% |
| D | 100점↓ | N | N% |

```
✅ Step 1 완료 — 전체 현황 출력
```

---

## Step 2 — 학생 성적 순위표 (teacher-ranking 실행)

leaderboard를 name 기준으로 그룹화해 학생별 지표를 계산한다:
- 최고 점수 / 평균 점수 / 평균 정답률 / 플레이 수 / 최대 콤보 / 개선도 / 최근 기록일

최고 점수 내림차순으로 정렬해 아래 형식으로 출력:

| 순위 | 학생명 | 최고점수 | 평균점수 | 평균정답률 | 플레이 | 최대콤보 | 개선도 | 최근기록 |
|---|---|---|---|---|---|---|---|---|
| 🥇 1 | ... | ... | ... | ... | N회 | N | ±N점 | YYYY-MM-DD |

**주목 학생** (각 항목 1위):
```
🏆 최고 점수    : [이름] N점
📈 가장 큰 성장 : [이름] +N점 향상
🎯 정답률 1위   : [이름] N%
🎮 가장 성실    : [이름] N회 플레이
```

```
✅ Step 2 완료 — 순위표 출력
```

---

## Step 3 — 카테고리·모드별 성취 분석 (teacher-analysis 실행)

**3-A. 카테고리별 학급 평균 정답률**
카테고리 모드(mode === 'category') 기록만 사용.
카테고리별 평균 정답률을 계산하고, 가장 낮은 카테고리에 ⚠️ 표시.

| 카테고리 | 플레이 수 | 평균 정답률 | 최고 점수 (학생명) | 판정 |
|---|---|---|---|---|
| 세계사 | N | N% | N점 (이름) | ✅/⚠️ |
| 과학 | N | N% | N점 (이름) | ✅/⚠️ |
| 지리 | N | N% | N점 (이름) | ✅/⚠️ |
| 일반상식 | N | N% | N점 (이름) | ✅/⚠️ |

카테고리 모드 기록이 없으면 "카테고리별 분석 데이터 없음" 출력.

**3-B. 학생별 모드 선호 & 최고 성과 비교**
| 학생명 | 선호 모드 | 전체도전 | 카테고리별 | 스피드퀴즈 | 강점 카테고리 |
|---|---|---|---|---|---|
| ... | ... | N점 | N점 | N점 | ... |

```
✅ Step 3 완료 — 성취 분석 출력
```

---

## Step 4 — 특정 학생 상세 조회 (teacher-student 실행)

$1 인수가 있는 경우에만 실행. 없으면 이 단계를 건너뛴다.

name === $1 인 레코드를 필터링해 아래를 출력:

**4-A. 종합 성적 요약**
| 항목 | 값 |
|---|---|
| 총 플레이 수 | N회 |
| 최고 점수 | N점 |
| 평균 점수 | N.N점 |
| 평균 정답률 | N.N% |
| 최대 콤보 | N |
| 활동 기간 | YYYY-MM-DD ~ YYYY-MM-DD (N일간) |
| 점수 개선도 | 첫 게임 N점 → 최근 N점 (±N점) |

**4-B. 게임 이력 타임라인 (오래된 순)**
```
[N회차] YYYY-MM-DD | [모드] | [카테고리] | N점 | N% | 콤보 N  ↑↓
```

**4-C. 카테고리별 성과** (카테고리 모드 기록이 있는 경우만)
| 카테고리 | 플레이 | 최고 점수 | 평균 정답률 | 성취도 |
|---|---|---|---|---|
| ... | N | N점 | N% | 우수/보통/미흡 |

**4-D. 교사 코멘트** (아래 기준으로 자동 생성):
- 평균 정답률 70%↑: 성취 인정 + 심화 도전 권유
- 40~69%: 약한 카테고리 집중 학습 권유
- 40%↓: 기초 강화 + easy 모드 추천
- 플레이 5회↑: 성실함 칭찬 추가

```
✅ Step 4 완료 — 학생 상세 조회 출력
```

---

## Step 5 — 종합 보고서 출력

모든 단계 완료 후 아래 형식으로 최종 요약을 출력한다:

```
══════════════════════════════════════
📋 선생님 모드 — 종합 보고서
실행 일시: YYYY-MM-DD
══════════════════════════════════════

[Step 1] 학급 전체 현황    ✅
[Step 2] 학생 순위표       ✅
[Step 3] 성취 분석         ✅
[Step 4] 학생 상세 조회    ✅ ($1) / ⏭ 건너뜀 (인수 없음)

── 핵심 인사이트 ────────────────────
• 참여 학생 N명 중 평균 정답률 70% 이상: N명 (N%)
• 학급 취약 카테고리: [카테고리명] (평균 N%)
• 가장 성장한 학생: [이름] (+N점)
• 추가 집중 지도 권장 학생: [정답률 40% 미만 학생 이름 나열]

══════════════════════════════════════
```

---

## Step 6 — HTML 리포트 생성

Step 5까지 수집한 모든 데이터를 바탕으로 HTML 파일을 생성한다.

**파일명 규칙**: `teacher-report-YYYYMMDD.html`  
**저장 위치**: index.html과 동일한 디렉터리 (C:\ClaudeCode\Study-03\)

### 6-A. HTML 구조

아래 구조로 완전한 단일 HTML 파일을 작성한다:

```
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>선생님 리포트 — YYYY-MM-DD</title>
  <style>
    /* ── 기본 레이아웃 ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
      background: #f0f4f8;
      color: #2d3748;
      padding: 32px 16px;
    }
    .report-wrap { max-width: 900px; margin: 0 auto; }

    /* ── 헤더 ── */
    .report-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border-radius: 16px;
      padding: 36px 40px;
      margin-bottom: 28px;
      box-shadow: 0 8px 32px rgba(102,126,234,0.3);
    }
    .report-header h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 6px; }
    .report-header .meta { font-size: 0.9rem; opacity: 0.85; }

    /* ── 섹션 카드 ── */
    .section {
      background: #fff;
      border-radius: 12px;
      padding: 28px 32px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #667eea;
      border-left: 4px solid #667eea;
      padding-left: 12px;
      margin-bottom: 20px;
    }

    /* ── 스탯 카드 그리드 ── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #f7f9fc;
      border-radius: 10px;
      padding: 16px;
      text-align: center;
    }
    .stat-card .label { font-size: 0.78rem; color: #718096; margin-bottom: 6px; }
    .stat-card .value { font-size: 1.4rem; font-weight: 700; color: #2d3748; }
    .stat-card .sub   { font-size: 0.75rem; color: #a0aec0; margin-top: 4px; }

    /* ── 테이블 ── */
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th {
      background: #edf2ff;
      color: #4a5568;
      font-weight: 600;
      padding: 10px 12px;
      text-align: center;
      border-bottom: 2px solid #c3d1f7;
    }
    td {
      padding: 9px 12px;
      text-align: center;
      border-bottom: 1px solid #e8ecf4;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f7f9fc; }

    /* ── 등급 배지 ── */
    .grade { display: inline-block; padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 0.8rem; }
    .grade-S { background: #ffd700; color: #7a5800; }
    .grade-A { background: #c8e6c9; color: #1b5e20; }
    .grade-B { background: #bbdefb; color: #0d47a1; }
    .grade-C { background: #fff9c4; color: #7a6000; }
    .grade-D { background: #ffcdd2; color: #b71c1c; }

    /* ── 인사이트 박스 ── */
    .insight-box {
      background: linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%);
      border-radius: 10px;
      padding: 20px 24px;
    }
    .insight-box ul { list-style: none; }
    .insight-box ul li {
      padding: 6px 0;
      border-bottom: 1px dashed #c3d1f7;
      font-size: 0.9rem;
    }
    .insight-box ul li:last-child { border-bottom: none; }

    /* ── 타임라인 ── */
    .timeline { font-size: 0.85rem; }
    .timeline-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #edf2ff;
    }
    .timeline-item:last-child { border-bottom: none; }
    .tl-round { background: #667eea; color: #fff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .tl-content { flex: 1; }
    .tl-score { font-weight: 700; color: #667eea; }
    .tl-up   { color: #38a169; font-weight: 700; }
    .tl-down { color: #e53e3e; font-weight: 700; }

    /* ── 교사 코멘트 ── */
    .comment-box {
      background: #fffbeb;
      border-left: 4px solid #f6c90e;
      border-radius: 0 10px 10px 0;
      padding: 16px 20px;
      font-size: 0.9rem;
      line-height: 1.7;
    }

    /* ── 푸터 ── */
    .report-footer {
      text-align: center;
      margin-top: 32px;
      font-size: 0.8rem;
      color: #a0aec0;
    }

    /* ── 경고 배지 ── */
    .warn { color: #e53e3e; font-weight: 700; }
    .ok   { color: #38a169; font-weight: 700; }

    /* ── 내보내기 툴바 ── */
    .export-toolbar {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      border-radius: 12px;
      padding: 10px 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.13);
      z-index: 1000;
    }
    .export-label { font-size: 0.78rem; color: #718096; font-weight: 600; margin-right: 2px; }
    .export-btn {
      padding: 7px 15px;
      border: none;
      border-radius: 8px;
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s, color 0.18s;
    }
    .csv-btn { background: #e6fffa; color: #2c7a7b; }
    .csv-btn:hover { background: #2c7a7b; color: #fff; }
    .pdf-btn { background: #fff5f5; color: #c53030; }
    .pdf-btn:hover { background: #c53030; color: #fff; }
    .export-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    @media print { .export-toolbar { display: none !important; } }
  </style>
  <!-- CSV/PDF 내보내기 라이브러리 -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>
<body>

<!-- ── 내보내기 툴바 ── -->
<div class="export-toolbar">
  <span class="export-label">내보내기</span>
  <button class="export-btn csv-btn" onclick="downloadCSV()">⬇ CSV</button>
  <button class="export-btn pdf-btn" onclick="downloadPDF()">⬇ PDF</button>
</div>

<div class="report-wrap">

  <!-- 헤더 -->
  <div class="report-header">
    <h1>📋 선생님 모드 — 종합 리포트</h1>
    <div class="meta">생성 일시: YYYY-MM-DD &nbsp;|&nbsp; 참여 학생: N명 &nbsp;|&nbsp; 총 플레이: N회</div>
  </div>

  <!-- Section 1: 학급 전체 현황 -->
  <div class="section">
    <div class="section-title">📊 학급 전체 현황</div>
    <div class="stat-grid">
      <!-- 각 stat-card는 Step 1 데이터로 채운다 -->
      <div class="stat-card">
        <div class="label">참여 학생</div>
        <div class="value">N명</div>
      </div>
      <div class="stat-card">
        <div class="label">총 플레이</div>
        <div class="value">N회</div>
        <div class="sub">1인 평균 N.N회</div>
      </div>
      <div class="stat-card">
        <div class="label">전체 평균 점수</div>
        <div class="value">N점</div>
      </div>
      <div class="stat-card">
        <div class="label">전체 평균 정답률</div>
        <div class="value">N%</div>
      </div>
      <div class="stat-card">
        <div class="label">최고 점수</div>
        <div class="value">N점</div>
        <div class="sub">[학생명]</div>
      </div>
      <div class="stat-card">
        <div class="label">최고 정답률</div>
        <div class="value">N%</div>
        <div class="sub">[학생명]</div>
      </div>
    </div>

    <!-- 모드별 현황 테이블 -->
    <table>
      <thead>
        <tr><th>모드</th><th>플레이 수</th><th>평균 점수</th><th>평균 정답률</th></tr>
      </thead>
      <tbody>
        <tr><td>전체도전</td><td>N</td><td>N점</td><td>N%</td></tr>
        <tr><td>카테고리별</td><td>N</td><td>N점</td><td>N%</td></tr>
        <tr><td>스피드퀴즈</td><td>N</td><td>N점</td><td>N%</td></tr>
      </tbody>
    </table>

    <!-- 등급 분포 테이블 -->
    <br>
    <table>
      <thead>
        <tr><th>등급</th><th>기준</th><th>달성 횟수</th><th>비율</th></tr>
      </thead>
      <tbody>
        <tr><td><span class="grade grade-S">S</span></td><td>600점↑</td><td>N</td><td>N%</td></tr>
        <tr><td><span class="grade grade-A">A</span></td><td>400점↑</td><td>N</td><td>N%</td></tr>
        <tr><td><span class="grade grade-B">B</span></td><td>250점↑</td><td>N</td><td>N%</td></tr>
        <tr><td><span class="grade grade-C">C</span></td><td>100점↑</td><td>N</td><td>N%</td></tr>
        <tr><td><span class="grade grade-D">D</span></td><td>100점↓</td><td>N</td><td>N%</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Section 2: 학생 순위표 -->
  <div class="section">
    <div class="section-title">🏆 학생 성적 순위표</div>
    <table>
      <thead>
        <tr>
          <th>순위</th><th>학생명</th><th>최고점수</th><th>평균점수</th>
          <th>평균정답률</th><th>플레이</th><th>최대콤보</th><th>개선도</th><th>최근기록</th>
        </tr>
      </thead>
      <tbody>
        <!-- Step 2 데이터로 채운다. 순위 아이콘: 1위 🥇, 2위 🥈, 3위 🥉, 그 외 숫자 -->
        <tr>
          <td>🥇 1</td><td>[학생명]</td><td>N점</td><td>N점</td>
          <td>N%</td><td>N회</td><td>N</td><td>±N점</td><td>YYYY-MM-DD</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Section 3: 카테고리·모드별 성취 분석 -->
  <div class="section">
    <div class="section-title">📚 카테고리·모드별 성취 분석</div>
    <!-- 카테고리 모드 기록이 없으면 "카테고리별 분석 데이터 없음" 단락만 출력 -->
    <table>
      <thead>
        <tr><th>카테고리</th><th>플레이 수</th><th>평균 정답률</th><th>최고 점수 (학생명)</th><th>판정</th></tr>
      </thead>
      <tbody>
        <tr><td>세계사</td><td>N</td><td>N%</td><td>N점 (이름)</td><td class="ok">✅</td></tr>
        <tr><td>과학</td>  <td>N</td><td>N%</td><td>N점 (이름)</td><td class="ok">✅</td></tr>
        <tr><td>지리</td>  <td>N</td><td>N%</td><td>N점 (이름)</td><td class="warn">⚠️</td></tr>
        <tr><td>일반상식</td><td>N</td><td>N%</td><td>N점 (이름)</td><td class="ok">✅</td></tr>
      </tbody>
    </table>
    <br>
    <!-- 학생별 모드 선호 테이블 -->
    <table>
      <thead>
        <tr><th>학생명</th><th>선호 모드</th><th>전체도전</th><th>카테고리별</th><th>스피드퀴즈</th><th>강점 카테고리</th></tr>
      </thead>
      <tbody>
        <tr><td>[이름]</td><td>[모드]</td><td>N점</td><td>N점</td><td>N점</td><td>[카테고리]</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Section 4: 특정 학생 상세 조회 ($1 있을 때만 포함) -->
  <!-- $1이 없으면 이 section 블록 전체를 HTML에서 제거한다 -->
  <div class="section">
    <div class="section-title">👤 학생 상세 조회 — [$1]</div>
    <!-- 4-A. 종합 성적 -->
    <table>
      <thead><tr><th>항목</th><th>값</th></tr></thead>
      <tbody>
        <tr><td>총 플레이 수</td><td>N회</td></tr>
        <tr><td>최고 점수</td><td>N점</td></tr>
        <tr><td>평균 점수</td><td>N.N점</td></tr>
        <tr><td>평균 정답률</td><td>N.N%</td></tr>
        <tr><td>최대 콤보</td><td>N</td></tr>
        <tr><td>활동 기간</td><td>YYYY-MM-DD ~ YYYY-MM-DD (N일간)</td></tr>
        <tr><td>점수 개선도</td><td>첫 게임 N점 → 최근 N점 (±N점)</td></tr>
      </tbody>
    </table>
    <br>
    <!-- 4-B. 타임라인 -->
    <div class="timeline">
      <!-- 각 게임 기록을 오래된 순으로 timeline-item으로 출력 -->
      <div class="timeline-item">
        <div class="tl-round">1</div>
        <div class="tl-content">YYYY-MM-DD &nbsp;|&nbsp; [모드] &nbsp;|&nbsp; [카테고리] &nbsp;|&nbsp;
          <span class="tl-score">N점</span> &nbsp;|&nbsp; N% &nbsp;|&nbsp; 콤보 N
        </div>
        <div class="tl-up">↑</div>
      </div>
    </div>
    <br>
    <!-- 4-D. 교사 코멘트 -->
    <div class="comment-box">
      [교사 코멘트 자동 생성 내용]
    </div>
  </div>

  <!-- Section 5: 핵심 인사이트 -->
  <div class="section">
    <div class="section-title">💡 핵심 인사이트</div>
    <div class="insight-box">
      <ul>
        <li>• 참여 학생 N명 중 평균 정답률 70% 이상: <strong>N명 (N%)</strong></li>
        <li>• 학급 취약 카테고리: <strong>[카테고리명]</strong> (평균 N%)</li>
        <li>• 가장 성장한 학생: <strong>[이름]</strong> (+N점)</li>
        <li>• 추가 집중 지도 권장: <strong>[정답률 40% 미만 학생 이름]</strong></li>
      </ul>
    </div>
  </div>

  <!-- 푸터 -->
  <div class="report-footer">
    🧠 상식 퀴즈 &nbsp;|&nbsp; 선생님 모드 리포트 &nbsp;|&nbsp; 생성: YYYY-MM-DD
  </div>

</div>

<script>
  /* ── 파일명 기준 (YYYYMMDD 부분만 실제 날짜로 교체) ── */
  const REPORT_BASENAME = 'teacher-report-YYYYMMDD';

  /* ────────────────────────────────
     CSV 내보내기
  ──────────────────────────────── */
  function downloadCSV() {
    const rows = [];

    // 리포트 제목·날짜
    rows.push(['"선생님 모드 종합 리포트"', '"생성일: YYYY-MM-DD"']);
    rows.push([]);

    // 각 섹션의 제목 + 테이블을 순서대로 추출
    document.querySelectorAll('.section').forEach(section => {
      const title = section.querySelector('.section-title')?.textContent?.trim() ?? '';
      if (title) rows.push([`"${title}"`]);

      section.querySelectorAll('table').forEach(table => {
        table.querySelectorAll('tr').forEach(tr => {
          const cells = [...tr.querySelectorAll('th, td')].map(
            cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`
          );
          if (cells.length) rows.push(cells);
        });
        rows.push([]); // 테이블 간 빈 줄
      });
    });

    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n'); // BOM: Excel 한글 호환
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, REPORT_BASENAME + '.csv');
  }

  /* ────────────────────────────────
     PDF 내보내기 (html2canvas + jsPDF)
  ──────────────────────────────── */
  async function downloadPDF() {
    const pdfBtn = document.querySelector('.pdf-btn');
    pdfBtn.textContent = '생성 중…';
    pdfBtn.disabled = true;

    try {
      const { jsPDF } = window.jspdf;
      const el = document.querySelector('.report-wrap');

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f0f4f8',
        scrollY: -window.scrollY
      });

      const imgData  = canvas.toDataURL('image/png');
      const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW    = pdf.internal.pageSize.getWidth();
      const pageH    = pdf.internal.pageSize.getHeight();
      const imgH     = (canvas.height * pageW) / canvas.width;

      let remaining = imgH;
      let yPos      = 0;

      // 여러 페이지 자동 분할
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, yPos, pageW, imgH);
        remaining -= pageH;
        yPos      -= pageH;
        if (remaining > 0) pdf.addPage();
      }

      pdf.save(REPORT_BASENAME + '.pdf');
    } catch (err) {
      alert('PDF 생성 실패: ' + err.message);
    } finally {
      pdfBtn.textContent = '⬇ PDF';
      pdfBtn.disabled = false;
    }
  }

  /* ── 공통 다운로드 트리거 ── */
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>
</body>
</html>
```

### 6-B. 작성 규칙

- 위 HTML 골격의 모든 `N`, `[학생명]` 등 플레이스홀더를 Step 1~4에서 수집한 **실제 값**으로 채운다.
- $1(특정 학생) 인수가 없으면 "Section 4: 특정 학생 상세 조회" `<div class="section">` 블록 전체를 HTML에서 **제거**한다.
- 카테고리 분석 데이터가 없으면 Section 3의 테이블을 `<p>카테고리별 분석 데이터 없음</p>`으로 대체한다.
- 날짜는 오늘 날짜(YYYY-MM-DD)를 사용한다.
- 파일은 **Write 도구**로 저장한다.

### 6-C. 저장 후 검증

파일이 정상 생성되었는지 Glob으로 확인한다.

성공 시 출력:
```
✅ Step 6 완료 — HTML 리포트 생성
  · 파일명: teacher-report-YYYYMMDD.html
  · 저장 위치: C:\ClaudeCode\Study-03\
```

---

## 사용 예시

```
/teacher-mode              # 전체 현황 + 순위 + 분석 + HTML 리포트
/teacher-mode 홍길동        # 전체 현황 + 순위 + 분석 + 홍길동 상세 조회 + HTML 리포트
```
