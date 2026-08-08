import { test, expect, Page } from '@playwright/test';

// ────────────────────────────────────────────────
// 헬퍼 함수
// ────────────────────────────────────────────────

/** localStorage 초기화 후 홈 화면으로 이동 */
async function gotoHome(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('quiz_game_history');
    localStorage.removeItem('quiz_player_stats');
    localStorage.removeItem('quiz_leaderboard');
  });
}

/** 프로필 선택 화면까지 이동 */
async function gotoProfile(page: Page) {
  await page.getByRole('button', { name: /퀴즈 시작하기/ }).click();
  await page.locator('#profile-screen.visible').waitFor();
}

/** 모드/카테고리 화면까지 이동 (프로필 지정) */
async function gotoCategory(page: Page, profile: '미취학아동' | '초등학생' | '중학생' | '일반') {
  await gotoProfile(page);
  await page.locator('.profile-card').filter({ hasText: profile }).click();
  await page.locator('#btn-profile-next').click();
  await page.locator('#category-screen.visible').waitFor();
}

/** 퀴즈 화면까지 이동 */
async function startQuiz(
  page: Page,
  mode: '전체 도전' | '스피드 퀴즈' | '카테고리별',
  category?: string,
) {
  await gotoCategory(page, '일반');
  await page.locator('.mode-card').filter({ hasText: mode }).click();
  if (mode === '카테고리별' && category) {
    await page.locator('.cat-card').filter({ hasText: category }).click();
  }
  await page.locator('#btn-start').click();
  await page.locator('#quiz-screen.visible').waitFor();
}

/** 남은 문제를 JS로 자동 완료 후 결과 화면 대기 */
async function autoCompleteQuiz(page: Page) {
  await page.evaluate(async () => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let i = 0; i < 120; i++) {
      if (document.querySelector('#result-screen.visible')) break;
      const nextBtn = [...document.querySelectorAll('button')].find(
        (b) => b.textContent?.includes('다음 문제') && !(b as HTMLButtonElement).disabled,
      ) as HTMLButtonElement | undefined;
      if (nextBtn) { nextBtn.click(); await delay(80); continue; }
      const opts = [...document.querySelectorAll('.opt-btn:not([disabled])')] as HTMLButtonElement[];
      if (opts.length) { opts[0].click(); await delay(100); }
      else { await delay(150); }
    }
  });
  await page.locator('#result-screen.visible').waitFor({ timeout: 15_000 });
}

// ────────────────────────────────────────────────
// TC-01: 홈 화면 → 프로필 선택 화면
// ────────────────────────────────────────────────
test('TC-01: 홈 화면 → 프로필 선택 화면', async ({ page }) => {
  await gotoHome(page);

  // 홈 화면 확인
  await expect(page.locator('#home-screen.visible')).toBeVisible();
  await expect(page.getByRole('heading', { name: /상식 퀴즈/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /퀴즈 시작하기/ })).toBeVisible();

  // 프로필 화면 이동
  await page.getByRole('button', { name: /퀴즈 시작하기/ }).click();
  await expect(page.locator('#profile-screen.visible')).toBeVisible();
  await expect(page.getByRole('heading', { name: /프로필/ })).toBeVisible();

  // 4개 카드 확인
  const cards = page.locator('.profile-card');
  await expect(cards).toHaveCount(4);
  for (const label of ['미취학아동', '초등학생', '중학생', '일반']) {
    await expect(cards.filter({ hasText: label })).toBeVisible();
  }

  // 선택 전 다음 버튼 비활성화
  await expect(page.locator('#btn-profile-next')).toBeDisabled();
});

// ────────────────────────────────────────────────
// TC-02: 일반 프로필 → 전체 도전 → 퀴즈 화면
// ────────────────────────────────────────────────
test('TC-02: 일반 프로필 → 전체 도전 → 퀴즈 화면', async ({ page }) => {
  await gotoHome(page);
  await gotoProfile(page);

  // 프로필 선택 → 다음 버튼 활성화
  await page.locator('.profile-card').filter({ hasText: '일반' }).click();
  await expect(page.locator('#btn-profile-next')).toBeEnabled();
  await page.locator('#btn-profile-next').click();

  // 모드 화면 확인 / 시작 버튼 비활성화
  await expect(page.locator('#category-screen.visible')).toBeVisible();
  await expect(page.locator('#btn-start')).toBeDisabled();

  // 전체 도전 선택 → 시작 버튼 활성화
  await page.locator('.mode-card').filter({ hasText: '전체 도전' }).click();
  await expect(page.locator('#btn-start')).toBeEnabled();
  await page.locator('#btn-start').click();

  // 퀴즈 화면 확인
  await expect(page.locator('#quiz-screen.visible')).toBeVisible();
  await expect(page.locator('#quiz-badge')).toContainText('전체');
  await expect(page.locator('#quiz-current')).toHaveText('1');
  await expect(page.locator('#quiz-total')).toHaveText('44');
  await expect(page.locator('.opt-btn')).toHaveCount(4);
});

// ────────────────────────────────────────────────
// TC-03: 힌트·정답·오답 피드백
// ────────────────────────────────────────────────
test('TC-03: 힌트·정답·오답 피드백', async ({ page }) => {
  await gotoHome(page);
  await startQuiz(page, '전체 도전');

  // 힌트 클릭 → 텍스트 표시·버튼 비활성화
  await page.locator('#btn-hint').click();
  await expect(page.locator('#hint-text')).not.toBeEmpty();
  await expect(page.locator('#btn-hint')).toBeDisabled();

  // 정답 선택
  const correctIdx = await page.evaluate(() => gameState.questions[0].answer as number);
  await page.locator('.opt-btn').nth(correctIdx).click();

  await expect(page.locator('#quiz-feedback.show')).toBeVisible();
  await expect(page.locator('#feedback-result')).toContainText('정답');
  await expect(page.locator('.opt-btn').nth(correctIdx)).toHaveClass(/correct/);

  // 점수 증가 확인
  const score = await page.evaluate(() => gameState.score as number);
  expect(score).toBeGreaterThan(0);

  // 다음 문제
  await page.getByRole('button', { name: /다음 문제/ }).click();

  // 오답 선택
  const { correct: correctIdx2 } = await page.evaluate(() => ({
    correct: gameState.questions[1].answer as number,
  }));
  const wrongIdx = correctIdx2 === 0 ? 1 : 0;
  await page.locator('.opt-btn').nth(wrongIdx).click();

  await expect(page.locator('#feedback-result')).toContainText('오답');
  await expect(page.locator('.opt-btn').nth(wrongIdx)).toHaveClass(/wrong/);
  await expect(page.locator('.opt-btn').nth(correctIdx2)).toHaveClass(/correct/);
});

// ────────────────────────────────────────────────
// TC-04: 결과 화면 + 순위 등록
// ────────────────────────────────────────────────
test('TC-04: 결과 화면 + 순위 등록', async ({ page }) => {
  await gotoHome(page);
  await startQuiz(page, '전체 도전');
  await autoCompleteQuiz(page);

  // 결과 화면 필수 요소 확인
  await expect(page.locator('#grade-letter')).toBeVisible();
  await expect(page.locator('#res-score')).toBeVisible();
  await expect(page.locator('#res-rate')).toBeVisible();
  await expect(page.locator('#res-max-combo')).toBeVisible();
  await expect(page.locator('.score-summary-table')).toBeVisible();

  // 등록 전 버튼 비활성화
  await expect(page.locator('#btn-register')).toBeDisabled();

  // 닉네임 입력 → 등록
  await page.locator('#name-input').fill('playwright-테스터');
  await expect(page.locator('#btn-register')).toBeEnabled();
  await page.locator('#btn-register').click();
  await expect(page.locator('#register-done')).toContainText('등록');
});

// ────────────────────────────────────────────────
// TC-05: 스피드 모드 (타이머·20문제 제한)
// ────────────────────────────────────────────────
test('TC-05: 스피드 모드 (타이머·20문제 제한)', async ({ page }) => {
  await gotoHome(page);
  await startQuiz(page, '스피드 퀴즈');

  // 배지·문제 수 확인
  await expect(page.locator('#quiz-badge')).toContainText('스피드');
  await expect(page.locator('#quiz-current')).toHaveText('1');
  await expect(page.locator('#quiz-total')).toHaveText('20');

  // 타이머 표시 확인
  await expect(page.locator('#quiz-timer.show')).toBeVisible();
  const t1 = Number(await page.locator('#timer-seconds').textContent());
  expect(t1).toBeGreaterThan(0);

  // 2초 후 카운트다운 확인
  await page.waitForTimeout(2_000);
  const t2 = Number(await page.locator('#timer-seconds').textContent());
  expect(t2).toBeLessThan(t1);

  // gameState 20문제 확인
  const total = await page.evaluate(() => gameState.questions.length as number);
  expect(total).toBe(20);
});

// ────────────────────────────────────────────────
// TC-06: 카테고리 모드 (태권도 숨김·카테고리 필터)
// ────────────────────────────────────────────────
test('TC-06: 카테고리 모드 (태권도 숨김·카테고리 필터)', async ({ page }) => {
  await gotoHome(page);
  await gotoCategory(page, '일반');

  // 카테고리별 선택 → 카테고리 섹션 표시
  await page.locator('.mode-card').filter({ hasText: '카테고리별' }).click();

  // 일반 프로필: 태권도 없음, 4개 카테고리만
  await expect(page.locator('.cat-card').filter({ hasText: '태권도' })).toHaveCount(0);
  await expect(page.locator('.cat-card')).toHaveCount(4);

  // 세계사 선택 → 시작
  await page.locator('.cat-card').filter({ hasText: '세계사' }).click();
  await page.locator('#btn-start').click();
  await page.locator('#quiz-screen.visible').waitFor();

  // 배지 확인
  await expect(page.locator('#quiz-badge')).toContainText('세계사');

  // 전체 문제가 history 카테고리, 11문제
  const { allHistory, total } = await page.evaluate(() => ({
    allHistory: gameState.questions.every((q: any) => q.category === 'history') as boolean,
    total: gameState.questions.length as number,
  }));
  expect(allHistory).toBe(true);
  expect(total).toBe(11);
});

// ────────────────────────────────────────────────
// TC-07: 순위 기록 화면 (탭 필터)
// ────────────────────────────────────────────────
test('TC-07: 순위 기록 화면 (탭 필터)', async ({ page }) => {
  await gotoHome(page);
  await startQuiz(page, '전체 도전');
  await autoCompleteQuiz(page);
  await page.locator('#name-input').fill('필터테스터');
  await page.locator('#btn-register').click();

  // 순위 화면 이동
  await page.evaluate(() => (window as any).showScreen('ranking-screen'));
  await expect(page.locator('#ranking-screen.visible')).toBeVisible();

  // 기본(전체): 1행 표시
  await expect(page.locator('#rank-body tbody tr')).toHaveCount(1);

  // 기간 탭 - 이번 주
  await page.locator('#rank-tabs-period button').filter({ hasText: '이번 주' }).click();
  await expect(page.locator('#rank-body tbody tr')).toHaveCount(1);

  // 기간 탭 - 오늘
  await page.locator('#rank-tabs-period button').filter({ hasText: '오늘' }).click();
  await expect(page.locator('#rank-body tbody tr')).toHaveCount(1);

  // 모드 탭 - 스피드퀴즈 (기록 없음)
  await page.locator('#rank-tabs-period button').filter({ hasText: '전체' }).click();
  await page.locator('#rank-tabs-mode button').filter({ hasText: '스피드퀴즈' }).click();
  await expect(page.locator('.rank-empty')).toBeVisible();
});

// ────────────────────────────────────────────────
// TC-08: 대시보드(내 통계) 화면
// ────────────────────────────────────────────────
test('TC-08: 대시보드(내 통계) 화면', async ({ page }) => {
  await gotoHome(page);
  await startQuiz(page, '전체 도전');
  await autoCompleteQuiz(page);
  await page.locator('#name-input').fill('대시테스터');
  await page.locator('#btn-register').click();

  // 대시보드 이동
  await page.evaluate(() => (window as any).showScreen('dashboard-screen'));
  await expect(page.locator('#dashboard-screen.visible')).toBeVisible();

  // 종합 요약 4개 stat 카드
  await expect(page.locator('.dash-stat-card')).toHaveCount(4);
  await expect(page.locator('.dash-stat-card').first()).toContainText('1');

  // 게임 모드별 통계 3개 카드
  await expect(page.locator('.dash-mode-card')).toHaveCount(3);

  // 최근 10게임 테이블 1행
  await expect(page.locator('#dash-body table tbody tr')).toHaveCount(1);

  // 내 기록 전체 삭제 버튼
  await expect(page.locator('#btn-clear-all')).toBeVisible();
});

// ────────────────────────────────────────────────
// TC-09: 초등 프로필 → 태권도 카테고리 표시
// ────────────────────────────────────────────────
test('TC-09: 초등 프로필 → 태권도 카테고리 표시', async ({ page }) => {
  await gotoHome(page);
  await gotoCategory(page, '초등학생');

  // 전체 도전: 40문제
  await expect(page.locator('.mode-card').filter({ hasText: '전체 도전' })).toContainText('40문제');

  // 카테고리별 선택 → 태권도 카드 표시
  await page.locator('.mode-card').filter({ hasText: '카테고리별' }).click();
  const taekwondo = page.locator('.cat-card').filter({ hasText: '태권도' });
  await expect(taekwondo).toBeVisible();
  await expect(taekwondo).toContainText('20문제');
});

// ────────────────────────────────────────────────
// TC-10: localStorage 3키 저장 확인
// ────────────────────────────────────────────────
test('TC-10: localStorage 3키 저장 확인', async ({ page }) => {
  await gotoHome(page);
  await startQuiz(page, '전체 도전');
  await autoCompleteQuiz(page);
  await page.locator('#name-input').fill('스토리지테스터');
  await page.locator('#btn-register').click();

  const storage = await page.evaluate(() => ({
    history:     JSON.parse(localStorage.getItem('quiz_game_history')  ?? '[]'),
    stats:       JSON.parse(localStorage.getItem('quiz_player_stats')  ?? 'null'),
    leaderboard: JSON.parse(localStorage.getItem('quiz_leaderboard')   ?? '[]'),
  }));

  expect(storage.history.length).toBeGreaterThan(0);
  expect(storage.stats).not.toBeNull();
  expect(storage.leaderboard.length).toBeGreaterThan(0);
  expect(storage.leaderboard[0].name).toBe('스토리지테스터');
});
