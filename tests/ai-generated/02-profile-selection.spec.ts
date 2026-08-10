// spec: 프로필 선택 화면 (Profile Selection Screen)
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('프로필 선택 화면 (Profile Selection Screen)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#home-screen.visible')).toBeVisible();
  });

  test('TC-04: 프로필 선택 화면 초기 상태 - 다음 버튼 비활성화', async ({ page }) => {
    // 1. 홈 화면에서 '✏️ 퀴즈 시작하기' 버튼을 클릭한다
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();

    // expect: '프로필을 선택하세요' 제목의 프로필 선택 화면으로 전환된다
    await expect(page.getByRole('heading', { name: '프로필을 선택하세요' })).toBeVisible();

    // expect: 4개 프로필 카드(미취학아동, 초등학생, 중학생, 일반)가 표시된다
    await expect(page.locator('#profile-grid .profile-card')).toHaveCount(4);

    // expect: '다음 →' 버튼이 비활성화(disabled) 상태다
    await expect(page.locator('#btn-profile-next')).toBeDisabled();

    // expect: '← 홈으로' 버튼이 활성화 상태다
    await expect(page.getByRole('button', { name: '← 홈으로' })).toBeEnabled();
  });

  test('TC-05: 4개 프로필 카드 내용 확인', async ({ page }) => {
    // 1. 홈 화면에서 프로필 선택 화면으로 이동한다
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await expect(page.getByRole('heading', { name: '프로필을 선택하세요' })).toBeVisible();

    // expect: 미취학아동 카드: '7세 이하' 텍스트가 표시된다
    await expect(page.locator('#profile-grid .profile-card').nth(0).locator('.profile-age')).toHaveText('7세 이하');

    // expect: 초등학생 카드: '8~13세' 텍스트가 표시된다
    await expect(page.locator('#profile-grid .profile-card').nth(1).locator('.profile-age')).toHaveText('8~13세');

    // expect: 중학생 카드: '13~15세' 텍스트가 표시된다
    await expect(page.locator('#profile-grid .profile-card').nth(2).locator('.profile-age')).toHaveText('13~15세');

    // expect: 일반 카드: '성인' 텍스트가 표시된다
    await expect(page.locator('#profile-grid .profile-card').nth(3).locator('.profile-age')).toHaveText('성인');
  });

  test('TC-06: 일반 프로필 선택 후 다음 버튼 활성화', async ({ page }) => {
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await expect(page.getByRole('heading', { name: '프로필을 선택하세요' })).toBeVisible();

    // 1. 프로필 선택 화면에서 '일반' 카드를 클릭한다
    await page.locator('.profile-card:last-child').click();

    // expect: '다음 →' 버튼이 활성화(enabled) 상태로 변경된다
    await expect(page.locator('#btn-profile-next')).toBeEnabled();
  });

  test('TC-07: 프로필 변경 - 선택 후 다른 프로필 선택', async ({ page }) => {
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await expect(page.getByRole('heading', { name: '프로필을 선택하세요' })).toBeVisible();

    // 1. '중학생' 카드를 클릭한다 - expect: '다음 →' 버튼이 활성화된다
    await page.locator('#profile-grid .profile-card').nth(2).click();
    await expect(page.locator('#btn-profile-next')).toBeEnabled();

    // 2. '미취학아동' 카드를 클릭한다
    await page.locator('#profile-grid .profile-card').first().click();

    // expect: 미취학아동 카드가 선택 강조 상태로 전환된다
    await expect(page.locator('#profile-grid .profile-card').first()).toHaveClass(/selected/);

    // expect: '다음 →' 버튼이 여전히 활성화 상태를 유지한다
    await expect(page.locator('#btn-profile-next')).toBeEnabled();
  });

  test('TC-08: 홈으로 버튼 - 프로필 화면에서 홈으로 복귀', async ({ page }) => {
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await expect(page.getByRole('heading', { name: '프로필을 선택하세요' })).toBeVisible();

    // 1. 프로필 선택 화면에서 '← 홈으로' 버튼을 클릭한다
    await page.getByRole('button', { name: '← 홈으로' }).click();

    // expect: 홈 화면으로 전환된다
    await expect(page.locator('#home-screen.visible')).toBeVisible();
  });
});
