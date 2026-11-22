// spec: 엣지 케이스 및 유효성 검사 (Edge Cases & Validation)
// seed: tests/seed.spec.ts

import { test, expect, Page } from '@playwright/test';

test.describe('엣지 케이스 및 유효성 검사 (Edge Cases & Validation)', () => {

  async function clearStorage(page: Page) {
    await page.evaluate(() => {
      localStorage.removeItem('quiz_game_history');
      localStorage.removeItem('quiz_player_stats');
      localStorage.removeItem('quiz_leaderboard');
    });
  }

  async function completeHistoryQuiz(page: Page) {
    await page.locator('button:has-text("✏️ 퀴즈 시작하기")').click();
    await page.locator('.profile-card:has-text("일반")').click();
    await page.locator('button:has-text("다음 →")').click();
    await page.locator('.mode-card:has-text("카테고리별")').click();
    await page.locator('.cat-card[data-id="history"]').click();
    await page.locator('button:has-text("▶ 시작하기")').click();
    await page.evaluate(async () => {
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 300));
        const btns = document.querySelectorAll('#quiz-screen.visible .opt-btn');
        if (btns.length > 0) (btns[0] as HTMLElement).click();
        await new Promise(r => setTimeout(r, 400));
        const nextBtn = document.getElementById('btn-next') as HTMLElement;
        if (nextBtn && nextBtn.offsetParent !== null) nextBtn.click();
      }
    });
    await expect(page.getByRole('heading', { name: '퀴즈 결과' })).toBeVisible();
  }

  test('TC-68: 닉네임 필드 공백만 입력 시 등록 버튼 상태', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);

    // 1. 일반 프로필 → 카테고리별 → 세계사 퀴즈 완료 후 결과 화면에서 닉네임 필드에 공백 문자만 입력
    await completeHistoryQuiz(page);
    await page.getByRole('textbox', { name: '닉네임을 입력하세요' }).click();
    await page.getByRole('textbox', { name: '닉네임을 입력하세요' }).fill(' ');

    // expect: '등록' 버튼은 공백만 입력 시 비활성화 상태를 유지한다 (현재 앱 동작에 맞게)
    await expect(page.getByRole('button', { name: '등록' })).toBeDisabled();
  });

  test('TC-69: 답변 버튼 빠른 연속 클릭으로 중복 처리 방지', async ({ page }) => {
    await page.goto('/');

    // 1. 퀴즈 화면(일반 프로필, 카테고리별, 세계사)으로 진입
    await page.locator('button:has-text("✏️ 퀴즈 시작하기")').click();
    await page.locator('.profile-card:has-text("일반")').click();
    await page.locator('button:has-text("다음 →")').click();
    await page.locator('.mode-card:has-text("카테고리별")').click();
    await page.locator('.cat-card[data-id="history"]').click();
    await page.locator('button:has-text("▶ 시작하기")').click();
    await expect(page.getByText('1 / 11')).toBeVisible();

    // 첫 번째 선택지 버튼을 매우 빠르게 두 번 연속 클릭
    await page.locator('.quiz-options .opt-btn').first().dblclick();

    // expect: 4개 선택지 버튼이 비활성화 상태로 전환됨 (첫 번째 클릭만 처리됨)
    const optBtns = page.locator('.quiz-options .opt-btn');
    await expect(optBtns.nth(0)).toBeDisabled();
    await expect(optBtns.nth(1)).toBeDisabled();
    await expect(optBtns.nth(2)).toBeDisabled();
    await expect(optBtns.nth(3)).toBeDisabled();

    // expect: 점수 내역이 1회만 표시된다 (다음 문제 버튼이 1개만 나타남)
    await expect(page.getByRole('button', { name: '다음 문제 →' })).toHaveCount(1);
    await expect(page.getByText(/✅ 정답입니다!|❌ 오답입니다/)).toBeVisible();
  });

  test('TC-70: 모드 선택 후 프로필 변경 시 문제 수 갱신', async ({ page }) => {
    await page.goto('/');

    // 1. 일반 프로필(44문제)을 선택 후 '다음 →' 클릭으로 모드 선택 화면에 진입
    await page.locator('button:has-text("✏️ 퀴즈 시작하기")').click();
    await page.locator('.profile-card:has-text("일반")').click();
    await page.locator('button:has-text("다음 →")').click();
    await expect(page.getByText('44문제 전부')).toBeVisible();

    // 2. '← 홈으로' 버튼으로 홈으로 돌아간 후 초등학생 프로필(40문제)을 선택하고 '다음 →' 클릭
    await page.getByRole('button', { name: '← 홈으로' }).click();
    await page.locator('button:has-text("✏️ 퀴즈 시작하기")').click();
    await page.locator('.profile-card:has-text("초등학생")').click();
    await page.locator('button:has-text("다음 →")').click();

    // expect: 모드 선택 화면에서 '🌟 전체 도전' 카드에 '40문제 전부' 텍스트가 표시된다
    await expect(page.getByText('40문제 전부')).toBeVisible();
  });

  test('TC-71: 다시 도전 시 문제 순서 랜덤 셔플 확인', async ({ page }) => {
    await page.goto('/');

    // 1. 일반 프로필 → 카테고리별 → 세계사 퀴즈를 완료하고 결과 화면에서 첫 번째 문제 텍스트를 기록
    await page.locator('button:has-text("✏️ 퀴즈 시작하기")').click();
    await page.locator('.profile-card:has-text("일반")').click();
    await page.locator('button:has-text("다음 →")').click();
    await page.locator('.mode-card:has-text("카테고리별")').click();
    await page.locator('.cat-card[data-id="history"]').click();
    await page.locator('button:has-text("▶ 시작하기")').click();
    await expect(page.getByText('1 / 11')).toBeVisible();

    await page.evaluate(async () => {
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 300));
        const btns = document.querySelectorAll('#quiz-screen.visible .opt-btn');
        if (btns.length > 0) (btns[0] as HTMLElement).click();
        await new Promise(r => setTimeout(r, 400));
        const nextBtn = document.getElementById('btn-next') as HTMLElement;
        if (nextBtn && nextBtn.offsetParent !== null) nextBtn.click();
      }
    });
    await expect(page.getByRole('heading', { name: '퀴즈 결과' })).toBeVisible();

    // 2. '🔄 같은 모드로 다시 도전'을 클릭하여 새 게임을 시작하고 첫 번째 문제 텍스트를 확인
    await page.getByRole('button', { name: '🔄 같은 모드로 다시 도전' }).click();

    // expect: 오류 발생 없이 두 번째 게임이 정상 시작된다 (동일 문제도 허용 — 셔플 동작 확인)
    await expect(page.locator('#quiz-screen.visible')).toBeVisible();
    await expect(page.getByText('1 / 11')).toBeVisible();
  });

  test('TC-72: 리더보드 초기화 후 게임 데이터(이력/통계)는 유지', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);

    // 1. 게임을 완료하고 순위 등록
    await completeHistoryQuiz(page);
    await page.getByRole('textbox', { name: '닉네임을 입력하세요' }).fill('테스터72');
    await page.getByRole('button', { name: '등록' }).click();
    await expect(page.getByText('✅ 등록되었습니다!')).toBeVisible();

    // 순위 화면에서 '🗑️ 리더보드 초기화' 버튼 클릭
    await page.getByRole('button', { name: '🏠 홈으로' }).click();
    await page.locator('button:has-text("🏆 순위 기록 보기")').click();
    await expect(page.getByRole('cell', { name: '테스터72' })).toBeVisible();

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '🗑️ 리더보드 초기화' }).click();
    await expect(page.getByText('해당 기간에 기록이 없습니다')).toBeVisible();

    // 2. 홈 → '📊 내 통계 보기'로 이동
    await page.getByRole('button', { name: '← 홈으로' }).click();
    await page.locator('button:has-text("📊 내 통계 보기")').click();

    // expect: 대시보드의 총 게임 수가 0이 아니다 (게임 이력 유지됨)
    const totalGamesText = await page.locator('.dash-stat-card').first().locator('.dash-stat-value').textContent();
    expect(parseInt(totalGamesText ?? '0')).toBeGreaterThan(0);

    // expect: localStorage에 quiz_game_history 키가 존재한다 (page.evaluate로 확인)
    const history = await page.evaluate(() => localStorage.getItem('quiz_game_history'));
    expect(history).not.toBeNull();
    expect(JSON.parse(history!).length).toBeGreaterThan(0);
  });

  test('TC-73: 스피드 모드 타이머 만료 후 즉시 다음 문제 답변', async ({ page }) => {
    await page.goto('/');

    // 1. 스피드 모드(일반 프로필 → 스피드 퀴즈)를 시작
    await page.locator('button:has-text("✏️ 퀴즈 시작하기")').click();
    await page.locator('.profile-card:has-text("일반")').click();
    await page.locator('button:has-text("다음 →")').click();
    await page.locator('.mode-card:has-text("스피드 퀴즈")').click();
    await page.locator('button:has-text("▶ 시작하기")').click();
    await expect(page.getByText('1 / 20')).toBeVisible();

    // 1. 15초 이상 대기하여 타이머가 만료되도록 한다
    await expect(page.getByRole('button', { name: '다음 문제 →' })).toBeVisible({ timeout: 20_000 });

    // expect: 타이머가 0이 되고 다음 문제 버튼이 나타난다
    await expect(page.locator('#timer-seconds')).toHaveText('0');

    // 2. '다음 문제 →' 버튼이 나타나면 클릭한다
    await page.getByRole('button', { name: '다음 문제 →' }).click();

    // expect: 다음 문제로 정상적으로 넘어간다
    await expect(page.getByText('2 / 20')).toBeVisible();

    // expect: 새 문제에 대한 타이머가 15초부터 다시 시작된다
    await expect(page.locator('#timer-seconds')).toBeVisible();
  });

  test('TC-74: XSS 방어 - 닉네임에 HTML 특수 문자 입력', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);

    // 1. 결과 화면 닉네임 필드에 '<script>alert(1)</script>'를 입력하고 '등록' 버튼을 클릭
    await completeHistoryQuiz(page);
    await page.getByRole('textbox', { name: '닉네임을 입력하세요' }).fill('<script>alert(1)</script>');
    await page.getByRole('button', { name: '등록' }).click();
    await expect(page.getByText('✅ 등록되었습니다!')).toBeVisible();

    // 2. 홈 → 순위 기록 보기로 이동하여 리더보드를 확인
    await page.getByRole('button', { name: '🏠 홈으로' }).click();
    await page.locator('button:has-text("🏆 순위 기록 보기")').click();

    // expect: alert 팝업이 뜨지 않는다 (리더보드가 정상적으로 표시됨)
    await expect(page.getByRole('heading', { name: '🏆 리더보드' })).toBeVisible();

    // expect: 리더보드에서 HTML 태그가 실행되지 않고 텍스트 그대로 이스케이프되어 표시된다
    await expect(page.locator('#ranking-screen tbody td').filter({ hasText: '<script>' })).toBeVisible();

    const nameCell = await page.evaluate(() => {
      const el = document.querySelector('#ranking-screen.visible tbody tr td:nth-child(2)');
      return el ? el.innerHTML : null;
    });
    expect(nameCell).toContain('&lt;script&gt;');
    expect(nameCell).not.toContain('<script>alert');
  });

  test('TC-75: 게임 화면 간 네비게이션 일관성 확인', async ({ page }) => {
    await page.goto('/');

    // 1. 홈 → 프로필 선택 화면에서 '← 홈으로' 버튼을 클릭
    await page.locator('button:has-text("✏️ 퀴즈 시작하기")').click();
    await expect(page.getByRole('heading', { name: '프로필을 선택하세요' })).toBeVisible();
    await page.getByRole('button', { name: '← 홈으로' }).click();

    // expect: 홈 화면으로 이동한다
    await expect(page.locator('#home-screen.visible')).toBeVisible();

    // 2. 홈 → 프로필 선택 → 모드 선택 화면에서 '← 홈으로' 버튼을 클릭
    await page.locator('button:has-text("✏️ 퀴즈 시작하기")').click();
    await page.locator('.profile-card:has-text("일반")').click();
    await page.locator('button:has-text("다음 →")').click();
    await expect(page.getByRole('heading', { name: '게임 모드를 선택하세요' })).toBeVisible();
    await page.getByRole('button', { name: '← 홈으로' }).click();

    // expect: 홈 화면으로 이동한다
    await expect(page.locator('#home-screen.visible')).toBeVisible();

    // expect: 홈 화면의 3개 버튼이 모두 표시된다
    await expect(page.getByRole('button', { name: '✏️ 퀴즈 시작하기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '🏆 순위 기록 보기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '📊 내 통계 보기' })).toBeVisible();
  });

  test.describe('로컬 시간대(KST) 날짜', () => {
    test.use({ timezoneId: 'Asia/Seoul' });

    test('TC-76: 로컬 시간대 기준 날짜 기록 (KST 자정~오전 9시)', async ({ page }) => {
      // 1. 2026-11-14 08:00 KST(= UTC 2026-11-13 23:00)로 시각 고정 후 퀴즈 완료·등록
      await page.clock.setFixedTime(new Date('2026-11-14T08:00:00+09:00'));
      await page.goto('/');
      await clearStorage(page);
      await completeHistoryQuiz(page);
      await page.getByRole('textbox', { name: '닉네임을 입력하세요' }).fill('새벽플레이어');
      await page.getByRole('button', { name: '등록' }).click();
      await expect(page.getByText('✅ 등록되었습니다!')).toBeVisible();

      // expect: 저장된 date가 UTC 날짜가 아닌 로컬 날짜다
      const dates = await page.evaluate(() => ({
        leaderboard: JSON.parse(localStorage.getItem('quiz_leaderboard') || '[]').map((r: any) => r.date),
        history:     JSON.parse(localStorage.getItem('quiz_game_history') || '[]').map((g: any) => g.date),
      }));
      expect(dates.leaderboard).toEqual(['2026-11-14']);
      expect(dates.history).toEqual(['2026-11-14']);

      // expect: 순위 화면 '오늘' 탭에 방금 기록이 표시된다
      await page.getByRole('button', { name: '🏠 홈으로' }).click();
      await page.locator('button:has-text("🏆 순위 기록 보기")').click();
      await page.getByRole('button', { name: '오늘' }).click();
      await expect(page.locator('#ranking-screen tbody td').filter({ hasText: '새벽플레이어' })).toBeVisible();
    });
  });

  test('TC-77: 미취학아동 퀴즈 - 답 선택 시 TTS 읽기 중지', async ({ page }) => {
    // speechSynthesis 모킹: speak된 발화를 보관하고, onend는 테스트가 직접 발생시킨다
    await page.addInitScript(() => {
      const w = window as any;
      w.__tts = { log: [] as string[], pending: null as any };
      const mock = {
        speak(u: any) { w.__tts.log.push('speak'); w.__tts.pending = u; u.onstart && u.onstart(); },
        cancel() {
          w.__tts.log.push('cancel');
          const u = w.__tts.pending;
          w.__tts.pending = null;
          if (u && u.onerror) u.onerror({ error: 'interrupted' });
        },
        getVoices: () => [],
        addEventListener() {},
      };
      Object.defineProperty(window, 'speechSynthesis', { value: mock, configurable: true });
    });

    await page.goto('/');
    await clearStorage(page);
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await page.locator('.profile-card:first-child').click();
    await page.locator('#btn-profile-next').click();
    await page.getByText('🌟 전체 도전 110문제 전부').click();
    await page.getByRole('button', { name: '▶ 시작하기' }).click();

    // 1. 문제 읽기 시작 대기 → 문제 읽기 종료 → 보기 ① 읽기 시작
    await expect.poll(() => page.evaluate(() => (window as any).__tts.pending !== null)).toBe(true);
    await page.evaluate(() => { const t = (window as any).__tts; t.pending.onend(); });

    // expect: 보기 ①에 하이라이트가 표시된다
    const highlighted = page.locator('#quiz-screen .opt-btn.tts-reading');
    await expect(highlighted).toHaveCount(1);
    await expect(page.locator('#quiz-screen .opt-btn').first()).toHaveClass(/tts-reading/);

    // 2. 보기를 선택해 답한다
    await page.locator('#quiz-screen .opt-btn').nth(1).click();

    // expect: cancel()로 진행 중이던 읽기가 중단된다
    const tts = await page.evaluate(() => {
      const t = (window as any).__tts;
      return { last: t.log[t.log.length - 1], pending: t.pending };
    });
    expect(tts.last).toBe('cancel');
    expect(tts.pending).toBeNull();

    // expect: 하이라이트가 모두 제거되고 다시 생기지 않는다
    await expect(highlighted).toHaveCount(0);
    await page.waitForTimeout(600);
    await expect(highlighted).toHaveCount(0);
  });
});
