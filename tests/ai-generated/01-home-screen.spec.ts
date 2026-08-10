// spec: 홈 화면 (Home Screen)
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('홈 화면 (Home Screen)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('quiz_game_history');
      localStorage.removeItem('quiz_player_stats');
      localStorage.removeItem('quiz_leaderboard');
    });
    await expect(page.locator('#home-screen.visible')).toBeVisible();
  });

  test('TC-01: 홈 화면 초기 로드 확인', async ({ page }) => {
    // 1. 브라우저에서 http://localhost:8765/ 를 연다
    // expect: 페이지 제목이 '🧠 상식 퀴즈'로 표시된다
    await expect(page.getByRole('heading', { name: '🧠 상식 퀴즈' })).toBeVisible();

    // expect: QUIZ GAME 뱃지와 h1 제목이 표시된다
    await expect(page.getByText('QUIZ GAME')).toBeVisible();

    // expect: '✏️ 퀴즈 시작하기' 버튼이 클릭 가능하다
    await expect(page.getByRole('button', { name: '✏️ 퀴즈 시작하기' })).toBeVisible();

    // expect: '🏆 순위 기록 보기' 버튼이 클릭 가능하다
    await expect(page.getByRole('button', { name: '🏆 순위 기록 보기' })).toBeVisible();

    // expect: '📊 내 통계 보기' 버튼이 클릭 가능하다
    await expect(page.getByRole('button', { name: '📊 내 통계 보기' })).toBeVisible();
  });

  test('TC-02: 순위 기록 보기 버튼으로 순위 화면 이동', async ({ page }) => {
    // 1. 홈 화면에서 '🏆 순위 기록 보기' 버튼을 클릭한다
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // expect: '🏆 리더보드' 제목이 표시되는 순위 화면으로 전환된다
    await expect(page.getByRole('heading', { name: '🏆 리더보드' })).toBeVisible();
  });

  test('TC-03: 내 통계 보기 버튼으로 대시보드 화면 이동', async ({ page }) => {
    // 1. 홈 화면에서 '📊 내 통계 보기' 버튼을 클릭한다
    await page.getByRole('button', { name: '📊 내 통계 보기' }).click();

    // expect: '📊 내 통계' 제목이 표시되는 대시보드 화면으로 전환된다
    await expect(page.getByRole('heading', { name: '📊 내 통계' })).toBeVisible();
  });
});
