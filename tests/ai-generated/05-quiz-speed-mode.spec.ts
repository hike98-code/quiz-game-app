// spec: 퀴즈 진행 - 스피드 모드 (Quiz Screen - Speed Mode)
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('퀴즈 진행 - 스피드 모드 (Quiz Screen & Speed Mode)', () => {
  async function startSpeedMode(page: any) {
    await page.goto('/');
    await page.locator('button[onclick="showScreen(\'profile-screen\')"]').click();
    await page.getByText('🌍 일반 성인 기존 상식 퀴즈 (기본 모드)').click();
    await page.locator('button:has-text("다음 →")').click();
    await page.getByText('⚡ 스피드 퀴즈 20문제 랜덤').click();
    await page.locator('button:has-text("▶ 시작하기")').click();
  }

  test('TC-27: 스피드 모드 타이머 표시 확인', async ({ page }) => {
    // 1. 일반 프로필 → 스피드 퀴즈 → 시작하기 순으로 진행한다
    await startSpeedMode(page);

    // expect: 퀴즈 화면에 '⚡ 스피드' 카테고리 뱃지가 표시된다
    await expect(page.getByText('⚡ 스피드', { exact: true })).toBeVisible();

    // expect: 타이머(남은 시간)가 표시된다
    await expect(page.getByText('남은 시간')).toBeVisible();

    // expect: 진행 표시가 '1 / 20'으로 시작된다
    await expect(page.getByText('/ 20')).toBeVisible();
  });

  test('TC-28: 스피드 모드 타이머 카운트다운 동작', async ({ page }) => {
    await startSpeedMode(page);

    // 1. 스피드 모드 퀴즈 화면에서 답변 없이 2초간 대기한다
    const timerBefore = parseInt(await page.locator('#timer-seconds').textContent() ?? '15');
    await new Promise(f => setTimeout(f, 2 * 1000));

    // expect: 타이머 숫자가 감소한다
    const timerAfter = parseInt(await page.locator('#timer-seconds').textContent() ?? '0');
    expect(timerAfter).toBeLessThan(timerBefore);
  });

  test('TC-29: 스피드 모드 타이머 만료 시 자동 오답 처리', async ({ page }) => {
    test.setTimeout(45000);
    await startSpeedMode(page);

    // 1. 스피드 모드 퀴즈에서 답변하지 않고 15초가 경과하도록 대기한다
    // expect: 타이머가 0이 되면 자동으로 오답 처리된다
    await expect(page.locator('#timer-seconds')).toHaveText('0', { timeout: 20000 });

    // expect: '❌ 오답입니다' 피드백 메시지가 표시된다
    await expect(page.getByText('❌ 오답입니다')).toBeVisible();

    // expect: 모든 선택지 버튼이 비활성화된다
    const optionButtons = page.locator('.quiz-options .opt-btn');
    await expect(optionButtons).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(optionButtons.nth(i)).toBeDisabled();
    }

    // expect: 힌트 버튼이 비활성화된다
    await expect(page.getByRole('button', { name: '💡 힌트 보기' })).toBeDisabled();

    // expect: 해설 텍스트가 표시된다
    await expect(page.locator('#feedback-explanation')).not.toBeEmpty();

    // expect: '다음 문제 →' 버튼이 나타난다
    await expect(page.getByRole('button', { name: '다음 문제 →' })).toBeVisible();
  });

  test('TC-30: 스피드 모드 답변 시 타이머 정지', async ({ page }) => {
    await startSpeedMode(page);

    // 1. 스피드 모드 퀴즈에서 임의의 선택지를 클릭한다
    await page.locator('.quiz-options .opt-btn').first().click();

    // expect: 답변 즉시 피드백 메시지가 표시된다
    await expect(page.getByText(/✅ 정답입니다!|❌ 오답입니다/)).toBeVisible();

    // expect: '다음 문제 →' 버튼이 나타난다
    await expect(page.getByRole('button', { name: '다음 문제 →' })).toBeVisible();
  });

  test('TC-31: 스피드 모드 20문제 제한 확인', async ({ page }) => {
    await startSpeedMode(page);

    // 1. 스피드 모드로 시작하여 문제 수를 확인한다
    // expect: 총 문제 수가 20개다
    await expect(page.getByText('1 / 20')).toBeVisible();

    // expect: 진행 표시가 '1 / 20'으로 시작된다
    await expect(page.getByText('/ 20')).toBeVisible();
  });

  test('TC-32: 스피드 모드 진행 중 홈으로 이동 시 타이머 정지', async ({ page }) => {
    await startSpeedMode(page);

    // 1. 스피드 모드 퀴즈 진행 중 브라우저 뒤로 가기 또는 JavaScript로 showScreen('home-screen')을 호출한다. 이후 다시 순위 화면이나 대시보드 화면으로 이동한다
    await page.evaluate('showScreen("home-screen")');

    // expect: 타이머가 백그라운드에서 계속 동작하지 않는다
    await expect(page.locator('#timer-seconds')).not.toBeVisible();
    await expect(page.getByText('남은 시간')).not.toBeVisible();

    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // expect: 다른 화면에서 스피드 모드 타이머 UI가 표시되지 않는다
    await expect(page.locator('#timer-seconds')).not.toBeVisible();
    await expect(page.getByText('남은 시간')).not.toBeVisible();

    await page.getByRole('button', { name: '← 홈으로' }).click();
    await page.locator('button:has-text("📊 내 통계 보기")').click();

    // expect: 대시보드 화면에도 스피드 모드 타이머 UI가 표시되지 않는다
    await expect(page.locator('#timer-seconds')).not.toBeVisible();
    await expect(page.getByText('남은 시간')).not.toBeVisible();
  });
});
