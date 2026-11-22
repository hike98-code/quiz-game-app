// spec: 대시보드 화면 및 데이터 지속성 (Dashboard & Data Persistence)
// seed: tests/seed.spec.ts

import { test, expect, Page } from '@playwright/test';

test.describe('대시보드 화면 및 데이터 지속성 (Dashboard & Data Persistence)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('quiz_game_history');
      localStorage.removeItem('quiz_player_stats');
      localStorage.removeItem('quiz_leaderboard');
    });
    await expect(page.locator('#home-screen.visible')).toBeVisible();
  });

  // Helper: 일반 프로필 → 카테고리별 → 세계사로 퀴즈 완료 (결과 화면 도달)
  async function completeQuiz(page: Page) {
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await page.getByText('🌍 일반 성인 기존 상식 퀴즈 (기본 모드)').click();
    await page.locator('#btn-profile-next').click();
    await page.getByText('🗂️ 카테고리별 분야 선택').click();
    await page.locator('.cat-card[data-id="history"]').click();
    await page.locator('#btn-start').click();
    // 퀴즈를 빠르게 완료: page.evaluate()로 선택지 자동 클릭 루프 사용
    await page.evaluate(async () => {
      for (let i = 0; i < 11; i++) {
        await new Promise(r => setTimeout(r, 300));
        const btns = document.querySelectorAll('#quiz-screen.visible .opt-btn');
        if (btns.length > 0) (btns[0] as HTMLElement).click();
        await new Promise(r => setTimeout(r, 400));
        const nextBtn = document.getElementById('btn-next') as HTMLElement;
        if (nextBtn && nextBtn.offsetParent !== null) nextBtn.click();
      }
    });
    await expect(page.getByText('퀴즈 결과').first()).toBeVisible();
  }

  test('TC-56: 첫 게임 후 대시보드 종합 요약 확인', async ({ page }) => {
    // 1. 일반 프로필 → 카테고리별 → 세계사로 퀴즈 완료 후 닉네임 등록
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('테스터');
    await page.locator('#btn-register').click();

    // 2. 홈 → '📊 내 통계 보기' 클릭
    await page.getByRole('button', { name: '🏠 홈으로' }).click();
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    // expect: '📊 내 통계' 제목이 표시된다
    await expect(page.getByRole('heading', { name: '📊 내 통계' })).toBeVisible();

    // expect: 총 게임 수(1)가 포함된 종합 요약 stat 카드 4개가 표시된다
    await expect(page.locator('.dash-stat-card')).toHaveCount(4);
    await expect(page.getByText('총 게임 수')).toBeVisible();
    await expect(page.getByText('평균 점수')).toBeVisible();
    await expect(page.getByText('평균 정답률')).toBeVisible();
    await expect(page.getByText('최고 콤보')).toBeVisible();
    await expect(page.locator('.dash-stat-card').first().locator('.dash-stat-value')).toHaveText('1');
  });

  test('TC-57: 대시보드 최고 기록 섹션 확인', async ({ page }) => {
    // 1. 게임 완료 후 대시보드 화면에서 '최고 기록' 섹션을 확인한다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('기록테스터');
    await page.locator('#btn-register').click();
    await page.getByRole('button', { name: '🏠 홈으로' }).click();
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    const bestRows = page.locator('.dash-best-card .dash-best-row');

    // expect: '🏆 역대 최고 점수'와 점수 및 날짜가 표시된다
    await expect(page.getByText('최고 기록')).toBeVisible();
    const bestScoreRow = bestRows.filter({ hasText: '🏆 역대 최고 점수' });
    await expect(bestScoreRow.locator('.dash-best-value')).toHaveText(/^\d+점$/);
    await expect(bestScoreRow.locator('.dash-best-date')).toHaveText(/^\d{4}-\d{2}-\d{2}$/);

    // expect: '🎯 역대 최고 정답률'과 정답률 및 날짜가 표시된다
    const bestAccuracyRow = bestRows.filter({ hasText: '🎯 역대 최고 정답률' });
    await expect(bestAccuracyRow.locator('.dash-best-value')).toHaveText(/^\d+%$/);
    await expect(bestAccuracyRow.locator('.dash-best-date')).toHaveText(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('TC-58: 대시보드 카테고리별 정답률 표시', async ({ page }) => {
    // 1. 카테고리별 모드로 세계사 퀴즈를 완료한 후 대시보드를 확인한다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('카테고리테스터');
    await page.locator('#btn-register').click();
    await page.getByRole('button', { name: '🏠 홈으로' }).click();
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    // expect: '카테고리별 정답률' 섹션에 플레이한 카테고리(세계사)의 정답률이 'N% (정답수/총문제수)' 형식으로 표시된다
    await expect(page.getByText('카테고리별 정답률')).toBeVisible();
    const catItem = page.locator('.dash-cat-item').filter({ hasText: '세계사' });
    await expect(catItem.locator('.dash-cat-name')).toContainText('세계사');
    await expect(catItem.locator('.dash-cat-stat')).toHaveText(/\d+%\s*\(\d+\/\d+문제\)/);
  });

  test("TC-59: 게임 모드별 통계 - 미플레이 모드는 '-' 표시", async ({ page }) => {
    // 1. 카테고리별 모드만 1회 플레이 후 대시보드의 '게임 모드별 통계' 섹션을 확인한다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('모드테스터');
    await page.locator('#btn-register').click();
    await page.getByRole('button', { name: '🏠 홈으로' }).click();
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    await expect(page.getByText('게임 모드별 통계')).toBeVisible();
    const modeCards = page.locator('.dash-mode-card');

    // expect: 카테고리별: 1회 및 최고 점수가 표시된다
    const categoryCard = modeCards.filter({ hasText: '카테고리별' });
    await expect(categoryCard.locator('.dash-mode-games')).toHaveText('1회');
    await expect(categoryCard.locator('.dash-mode-best')).toHaveText(/^최고 \d+점$/);

    // expect: 전체도전: 0회 및 '-'가 표시된다
    const allChallengeCard = modeCards.filter({ hasText: '전체도전' });
    await expect(allChallengeCard.locator('.dash-mode-games')).toHaveText('0회');
    await expect(allChallengeCard.locator('.dash-mode-best')).toHaveText('-');

    // expect: 스피드퀴즈: 0회 및 '-'가 표시된다
    const speedCard = modeCards.filter({ hasText: '스피드퀴즈' });
    await expect(speedCard.locator('.dash-mode-games')).toHaveText('0회');
    await expect(speedCard.locator('.dash-mode-best')).toHaveText('-');
  });

  test('TC-60: 최근 10게임 이력 테이블 확인', async ({ page }) => {
    // 1. 여러 게임을 완료한 후 대시보드의 '최근 10게임' 테이블을 확인한다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('이력테스터');
    await page.locator('#btn-register').click();
    await page.getByRole('button', { name: '🏠 홈으로' }).click();

    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('이력테스터');
    await page.locator('#btn-register').click();

    // 최대 10건 표시·정렬 검증을 위해, 실제 저장된 이력 형식을 기반으로 9건의 합성 기록을 추가해 총 11건으로 확장
    await page.evaluate(() => {
      const history = JSON.parse(localStorage.getItem('quiz_game_history')!);
      const synthetic = [];
      for (let i = 1; i <= 9; i++) {
        const day = String(i).padStart(2, '0');
        synthetic.push({
          id: 1786340000000 + i,
          date: `2026-07-${day}`,
          timestamp: 1786340000000 + i,
          mode: 'category',
          category: 'history',
          score: 100 + i,
          correct: i,
          total: 11,
          rate: 10 * i,
          maxCombo: i,
          duration: 20,
          scoreBreakdown: { base: 20, difficulty: 15, time: 6, hint: 4, combo: 0 },
        });
      }
      localStorage.setItem('quiz_game_history', JSON.stringify([...history, ...synthetic]));
    });
    await page.reload();
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    const table = page.locator('.dash-history-table');
    await expect(page.getByText('최근 10게임')).toBeVisible();

    // expect: 테이블에 날짜, 모드, 점수, 정답률, 콤보 컬럼이 표시된다
    await expect(table.locator('thead th')).toHaveText(['날짜', '모드', '점수', '정답률', '콤보']);

    const rows = table.locator('tbody tr');

    // expect: 최근 게임이 최상단에 위치한다 (가장 마지막에 추가된 기록이 1행에 표시)
    const firstRowCells = rows.first().locator('td');
    await expect(firstRowCells.nth(0)).toHaveText('2026-07-09');
    await expect(firstRowCells.nth(2)).toContainText('109점');

    // expect: 최대 10건의 기록만 표시된다
    await expect(rows).toHaveCount(10);
  });

  test('TC-61: 게임 미플레이 상태에서 대시보드 접근', async ({ page }) => {
    // 1. localStorage가 비어있는 초기 상태에서 홈 → '📊 내 통계 보기' 클릭
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    // expect: 대시보드 화면이 오류 없이 표시된다
    await expect(page.locator('#dashboard-screen.visible')).toBeVisible();
    await expect(page.getByRole('heading', { name: '📊 내 통계' })).toBeVisible();
  });

  test('TC-62: 전체 데이터 삭제 버튼 동작', async ({ page }) => {
    // 1. 게임 완료 후 대시보드 화면에서 '🗑️ 내 기록 전체 삭제' 버튼을 클릭한다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('삭제테스터');
    await page.locator('#btn-register').click();
    await page.getByRole('button', { name: '🏠 홈으로' }).click();
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '🗑️ 내 기록 전체 삭제' }).click();

    // expect: 홈 화면으로 자동 전환된다
    await expect(page.locator('#home-screen.visible')).toBeVisible();

    // expect: localStorage의 quiz_game_history, quiz_player_stats, quiz_leaderboard 키가 모두 삭제된다
    const history = await page.evaluate(() => localStorage.getItem('quiz_game_history'));
    const stats = await page.evaluate(() => localStorage.getItem('quiz_player_stats'));
    const leaderboard = await page.evaluate(() => localStorage.getItem('quiz_leaderboard'));
    expect(history).toBeNull();
    expect(stats).toBeNull();
    expect(leaderboard).toBeNull();
  });

  test('TC-63: 데이터 삭제 후 대시보드 재접근 시 빈 상태', async ({ page }) => {
    // 1. 전체 데이터 삭제 후 홈 → '📊 내 통계 보기' 순으로 이동한다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('삭제후재접근테스터');
    await page.locator('#btn-register').click();
    await page.getByRole('button', { name: '🏠 홈으로' }).click();
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '🗑️ 내 기록 전체 삭제' }).click();
    await expect(page.locator('#home-screen.visible')).toBeVisible();

    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    // expect: 대시보드가 초기화된 빈 상태로 표시된다
    await expect(page.locator('#dashboard-screen.visible')).toBeVisible();
    await expect(page.getByRole('heading', { name: '📊 내 통계' })).toBeVisible();

    // expect: 총 게임 수가 0이거나 게임 기록이 없음을 나타내는 상태가 표시된다
    await expect(page.locator('.dash-stat-card')).toHaveCount(0);
    await expect(page.locator('.dash-empty')).toHaveText('아직 플레이 기록이 없어요 🎮');
  });

  test('TC-64: 게임 완료 후 quiz_game_history 저장 확인', async ({ page }) => {
    // 1. 게임을 완료하고 결과 화면에서 닉네임 등록까지 마친다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('히스토리테스터');
    await page.locator('#btn-register').click();

    // expect: localStorage의 'quiz_game_history' 키에 게임 데이터가 저장된다
    const history = await page.evaluate(() => localStorage.getItem('quiz_game_history'));
    expect(history).not.toBeNull();
    expect(JSON.parse(history!).length).toBeGreaterThan(0);
  });

  test('TC-65: 순위 등록 후 quiz_leaderboard 저장 확인', async ({ page }) => {
    // 1. 결과 화면에서 닉네임 '리더테스터' 입력 후 '등록' 버튼을 클릭한다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('리더테스터');
    await page.locator('#btn-register').click();

    // expect: localStorage의 'quiz_leaderboard'에 name이 '리더테스터'인 항목이 저장된다
    const leaderboard = await page.evaluate(() => localStorage.getItem('quiz_leaderboard'));
    expect(leaderboard).not.toBeNull();
    const entries: Array<{ name: string }> = JSON.parse(leaderboard!);
    expect(entries.some(e => e.name === '리더테스터')).toBe(true);
  });

  test('TC-67: 페이지 새로고침 후 데이터 유지', async ({ page }) => {
    // 1. 게임 완료 및 순위 등록 후 페이지를 새로고침한다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('리더테스터');
    await page.locator('#btn-register').click();

    await page.reload();

    // expect: 홈 화면이 정상적으로 로드된다
    await expect(page.getByRole('heading', { name: '🧠 상식 퀴즈' })).toBeVisible();

    // expect: 순위 화면에 이전에 등록한 기록이 유지된다
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();
    await expect(page.getByRole('cell', { name: '리더테스터' })).toBeVisible();
  });

  test('TC-66: quiz_player_stats 누적 통계 업데이트 확인', async ({ page }) => {
    // 1. 2번의 게임을 순차적으로 완료한다
    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('누적테스터');
    await page.locator('#btn-register').click();
    await page.getByRole('button', { name: '🏠 홈으로' }).click();

    await completeQuiz(page);
    await page.locator('input[placeholder="닉네임을 입력하세요"]').fill('누적테스터');
    await page.locator('#btn-register').click();

    const statsRaw = await page.evaluate(() => localStorage.getItem('quiz_player_stats'));
    const historyRaw = await page.evaluate(() => localStorage.getItem('quiz_game_history'));
    expect(statsRaw).not.toBeNull();
    expect(historyRaw).not.toBeNull();

    const stats = JSON.parse(statsRaw!);
    const history: Array<{ score: number; correct: number; total: number }> = JSON.parse(historyRaw!);

    // expect: localStorage의 'quiz_player_stats' 키의 총 게임 수가 2로 업데이트된다
    expect(stats.totalGames).toBe(2);
    expect(history.length).toBe(2);

    // expect: 평균 점수 및 정답률이 두 게임의 평균으로 갱신된다
    const totalScore = history[0].score + history[1].score;
    const totalCorrect = history[0].correct + history[1].correct;
    const totalQuestions = history[0].total + history[1].total;
    const expectedAvgScore = Math.round(totalScore / 2);
    const expectedAvgRate = Math.round((totalCorrect / totalQuestions) * 100);

    expect(stats.avgScore).toBe(expectedAvgScore);
    expect(stats.avgRate).toBe(expectedAvgRate);
  });

  test('TC-88: 프로필 전용 카테고리(생물 등) 기록도 카테고리별 정답률에 표시', async ({ page }) => {
    // 1. 미취학 '생물' 카테고리와 초등 '태권도' 카테고리 게임 결과를 저장한 뒤 대시보드를 연다
    await page.evaluate(() => {
      const save = eval('saveGameResult');
      const base = { date: eval('localDateStr()'), timestamp: Date.now(), mode: 'category', maxCombo: 1, duration: 60, scoreBreakdown: [] };
      save({ ...base, id: 1, category: 'living', score: 120, correct: 12, total: 20, rate: 60 }, '');
      save({ ...base, id: 2, category: 'taekwondo', score: 90, correct: 9, total: 20, rate: 45 }, '');
    });
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    // expect: '카테고리 모드 기록이 없어요' 대신 생물·태권도 정답률이 표시된다
    await expect(page.getByText('카테고리 모드 기록이 없어요')).not.toBeVisible();
    await expect(page.locator('.dash-cat-item').filter({ hasText: '생물' }).locator('.dash-cat-stat')).toHaveText(/60%\s*\(12\/20문제\)/);
    await expect(page.locator('.dash-cat-item').filter({ hasText: '태권도' }).locator('.dash-cat-stat')).toHaveText(/45%\s*\(9\/20문제\)/);

    // expect: quiz_player_stats.categoryStats에 두 카테고리가 누적된다
    const cs = await page.evaluate(() => JSON.parse(localStorage.getItem('quiz_player_stats')!).categoryStats);
    expect(cs.living).toMatchObject({ games: 1, correct: 12, total: 20 });
    expect(cs.taekwondo).toMatchObject({ games: 1, correct: 9, total: 20 });
  });
});
