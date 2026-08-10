// spec: 미취학아동 프로필 퀴즈 (Preschool Profile Quiz)
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('미취학아동 프로필 퀴즈 (Preschool Profile Quiz)', () => {
  async function startPreschoolQuiz(page: any) {
    await page.goto('/');
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await page.locator('.profile-card:first-child').click();
    await page.locator('#btn-profile-next').click();
    await page.getByText('🌟 전체 도전 20문제 전부').click();
    await page.getByRole('button', { name: '▶ 시작하기' }).click();
  }

  test('TC-33: 미취학아동 퀴즈 - TTS 다시 듣기 버튼 표시', async ({ page }) => {
    // 1. 미취학아동 프로필 → 전체 도전 → 시작하기 순으로 진행한다
    await startPreschoolQuiz(page);

    // expect: 퀴즈 화면에 '🔊 다시 듣기' 버튼이 표시된다
    await expect(page.getByRole('button', { name: '🔊 다시 듣기' })).toBeVisible();

    // expect: 힌트 버튼도 함께 표시된다
    await expect(page.getByRole('button', { name: '💡 힌트 보기' })).toBeVisible();

    // expect: 타이머가 표시되지 않는다 (남은 시간 레이블 없음)
    await expect(page.getByText('남은 시간')).not.toBeVisible();
  });

  test('TC-34: 미취학아동 퀴즈 - 다시 듣기 버튼 클릭 가능', async ({ page }) => {
    await startPreschoolQuiz(page);

    // 1. 미취학아동 퀴즈 화면에서 '🔊 다시 듣기' 버튼을 클릭한다
    const ttsButton = page.getByRole('button', { name: '🔊 다시 듣기' });

    // expect: 버튼이 클릭 가능한 상태다
    await expect(ttsButton).toBeEnabled();
    await ttsButton.click();

    // expect: 버튼 클릭 시 오류(console error)가 발생하지 않는다 (퀴즈 화면이 그대로 유지됨)
    await expect(ttsButton).toBeVisible();
  });

  test('TC-35: 미취학아동 퀴즈 화면에 타이머 없음 확인', async ({ page }) => {
    // 1. 미취학아동 프로필의 전체 도전 모드 퀴즈 화면을 확인한다
    await startPreschoolQuiz(page);

    // expect: '남은 시간' 타이머 요소가 표시되지 않는다
    await expect(page.getByText('남은 시간')).not.toBeVisible();

    // expect: #timer 요소가 DOM에 존재하지 않는다
    await expect(page.locator('#timer')).not.toBeAttached();
  });

  test('TC-36: 미취학아동 퀴즈 - 일반 프로필과 다른 문제 풀', async ({ page }) => {
    // 1. 미취학아동 프로필로 전체 도전 모드를 시작한다
    await startPreschoolQuiz(page);

    // expect: 진행 표시가 '1 / 20'으로 시작된다 (미취학아동 문제 풀은 20개)
    await expect(page.getByText('1 / 20')).toBeVisible();
  });
});
