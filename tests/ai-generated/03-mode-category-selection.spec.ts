// spec: 모드 및 카테고리 선택 화면 (Mode & Category Selection Screen)
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('모드 및 카테고리 선택 화면 (Mode & Category Selection Screen)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#home-screen.visible')).toBeVisible();
  });

  async function navigateToModeScreen(page: any, profile: 'general' | 'elementary' | 'middle' | 'preschool') {
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    if (profile === 'general') {
      await page.getByText('🌍 일반 성인 기존 상식 퀴즈 (기본 모드)').click();
    } else if (profile === 'elementary') {
      await page.getByText('📚 초등학생 8~13').click();
    } else if (profile === 'preschool') {
      await page.getByText('🎈 미취학아동 7').click();
    } else {
      await page.getByText('🏫 중학생 13~15').click();
    }
    await page.getByRole('button', { name: '다음 →' }).click();
  }

  test('TC-09: 모드 선택 화면 초기 상태 - 시작하기 버튼 비활성화', async ({ page }) => {
    // 1. 홈 → 일반 프로필 선택 → '다음 →' 클릭
    await navigateToModeScreen(page, 'general');

    // expect: '게임 모드를 선택하세요' 제목의 화면이 표시된다
    await expect(page.getByRole('heading', { name: '게임 모드를 선택하세요' })).toBeVisible();

    // expect: 3개 모드 카드(전체 도전, 카테고리별, 스피드 퀴즈)가 표시된다
    await expect(page.getByText('전체 도전')).toBeVisible();
    await expect(page.getByText('카테고리별', { exact: true })).toBeVisible();
    await expect(page.getByText('스피드 퀴즈')).toBeVisible();

    // expect: '▶ 시작하기' 버튼이 비활성화 상태다
    await expect(page.getByRole('button', { name: '▶ 시작하기' })).toBeDisabled();
  });

  test('TC-10: 일반 프로필 전체 도전 모드 선택 (44문제 표시)', async ({ page }) => {
    await navigateToModeScreen(page, 'general');

    // 1. 모드 선택 화면에서 '🌟 전체 도전' 카드를 클릭한다
    await page.getByText('🌟 전체 도전 44문제 전부').click();

    // expect: 전체 도전 카드에 '44문제' 텍스트가 표시된다
    await expect(page.getByText('44문제 전부')).toBeVisible();

    // expect: '▶ 시작하기' 버튼이 활성화된다
    await expect(page.getByRole('button', { name: '▶ 시작하기' })).toBeEnabled();
  });

  test('TC-11: 일반 프로필 스피드 퀴즈 모드 선택 (20문제 랜덤)', async ({ page }) => {
    await navigateToModeScreen(page, 'general');

    // 1. '⚡ 스피드 퀴즈' 카드를 클릭한다
    await page.getByText('⚡ 스피드 퀴즈 20문제 랜덤').click();

    // expect: '20문제' 텍스트가 표시된다
    await expect(page.getByText('20문제 랜덤')).toBeVisible();

    // expect: '▶ 시작하기' 버튼이 활성화된다
    await expect(page.getByRole('button', { name: '▶ 시작하기' })).toBeEnabled();
  });

  test('TC-12: 일반 프로필 카테고리별 모드 - 4개 카테고리 표시', async ({ page }) => {
    await navigateToModeScreen(page, 'general');

    // 1. '🗂️ 카테고리별' 카드를 클릭한다
    await page.getByText('🗂️ 카테고리별 분야 선택').click();

    // expect: 카테고리 선택 패널이 나타난다
    await expect(page.locator('#cat-section').getByText('카테고리 선택')).toBeVisible();

    // expect: 세계사, 과학, 지리, 일반상식 4개 카테고리가 표시된다
    await expect(page.getByText('세계사', { exact: true })).toBeVisible();
    await expect(page.getByText('과학', { exact: true })).toBeVisible();
    await expect(page.getByText('지리', { exact: true })).toBeVisible();
    await expect(page.getByText('일반상식')).toBeVisible();
    await expect(page.locator('#cat-section .cat-card')).toHaveCount(4);

    // expect: 태권도 카테고리가 표시되지 않는다
    await expect(page.locator('#cat-section').getByText('태권도')).not.toBeVisible();

    // expect: '▶ 시작하기' 버튼은 여전히 비활성화 상태다
    await expect(page.getByRole('button', { name: '▶ 시작하기' })).toBeDisabled();

    // 2. '🏛️ 세계사' 카테고리를 클릭한다
    await page.getByText('🏛️ 세계사 11문제').click();

    // expect: '▶ 시작하기' 버튼이 활성화된다
    await expect(page.getByRole('button', { name: '▶ 시작하기' })).toBeEnabled();
  });

  test('TC-13: 초등학생 프로필 전체 도전 모드 (40문제 표시)', async ({ page }) => {
    // 1. 홈 → 초등학생 프로필 선택 → '다음 →' 클릭 후 '🌟 전체 도전' 카드를 확인한다
    await navigateToModeScreen(page, 'elementary');

    // expect: 전체 도전 카드에 '40문제' 텍스트가 표시된다
    await expect(page.getByText('40문제 전부')).toBeVisible();
  });

  test('TC-14: 초등학생 카테고리별 모드 - 태권도 포함 5개 카테고리', async ({ page }) => {
    await navigateToModeScreen(page, 'elementary');

    // 1. 초등학생 프로필로 모드 선택 화면에서 '카테고리별'을 선택한다
    await page.getByText('🗂️ 카테고리별 분야 선택').click();

    // expect: 세계사, 과학, 지리, 일반상식, 태권도 총 5개 카테고리가 표시된다
    await expect(page.locator('#cat-section .cat-card')).toHaveCount(5);
    await expect(page.getByText('세계사', { exact: true })).toBeVisible();
    await expect(page.getByText('과학', { exact: true })).toBeVisible();
    await expect(page.getByText('지리', { exact: true })).toBeVisible();
    await expect(page.getByText('일반상식')).toBeVisible();
    await expect(page.locator('#cat-section').getByText('태권도', { exact: true })).toBeVisible();
  });

  test('TC-15: 중학생 카테고리별 모드 - 태권도 없이 4개 카테고리', async ({ page }) => {
    await navigateToModeScreen(page, 'middle');

    // 1. 중학생 프로필로 모드 선택 화면에서 '카테고리별'을 선택한다
    await page.getByText('🗂️ 카테고리별 분야 선택').click();

    // expect: 세계사(7문제), 과학(9문제), 지리(2문제), 일반상식(2문제) 총 4개 카테고리가 표시된다
    await expect(page.locator('#cat-section .cat-card')).toHaveCount(4);
    await expect(page.getByText('🏛️ 세계사 7문제')).toBeVisible();
    await expect(page.getByText('🔬 과학 9문제')).toBeVisible();
    await expect(page.getByText('🌍 지리 2문제')).toBeVisible();
    await expect(page.getByText('💡 일반상식 2문제')).toBeVisible();

    // expect: 태권도 카테고리가 표시되지 않는다
    await expect(page.locator('#cat-section').getByText('태권도')).not.toBeVisible();
  });

  test('TC-16: 미취학아동 프로필 전체 도전 모드 (50문제 표시)', async ({ page }) => {
    // 1. 미취학아동 프로필로 모드 선택 화면에서 '전체 도전' 카드를 확인한다
    await navigateToModeScreen(page, 'preschool');

    // expect: 전체 도전 카드에 '50문제 전부' 텍스트가 표시된다 (기본 20 + 이웃집 토토로 30)
    await expect(page.getByText('50문제 전부')).toBeVisible();
  });

  test('TC-17: 카테고리별 모드에서 카테고리 미선택 시 시작 불가', async ({ page }) => {
    // 1. 일반 프로필 → 카테고리별 모드 선택 후 카테고리를 선택하지 않은 상태를 유지한다
    await navigateToModeScreen(page, 'general');
    await page.getByText('🗂️ 카테고리별 분야 선택').click();

    // expect: '▶ 시작하기' 버튼이 비활성화(disabled) 상태로 유지된다
    await expect(page.getByRole('button', { name: '▶ 시작하기' })).toBeDisabled();
  });

  test('TC-83: 미취학아동 카테고리별 모드 - 이웃집 토토로 카테고리', async ({ page }) => {
    await navigateToModeScreen(page, 'preschool');

    // 1. 미취학아동 프로필로 모드 선택 화면에서 '카테고리별'을 선택한다
    await page.getByText('🗂️ 카테고리별 분야 선택').click();

    // expect: 과학(8), 지리(2), 일반상식(10), 이웃집 토토로(30) 총 4개 카테고리가 표시된다
    await expect(page.locator('#cat-section .cat-card')).toHaveCount(4);
    await expect(page.getByText('🔬 과학 8문제')).toBeVisible();
    await expect(page.getByText('🌍 지리 2문제')).toBeVisible();
    await expect(page.getByText('💡 일반상식 10문제')).toBeVisible();
    await expect(page.getByText('🌳 이웃집 토토로 30문제')).toBeVisible();

    // 2. '이웃집 토토로'를 선택하고 시작한다
    await page.locator('.cat-card[data-id="totoro"]').click();
    await page.getByRole('button', { name: '▶ 시작하기' }).click();

    // expect: 진행 표시가 '1 / 30'으로 시작되고, 출제 문제가 모두 토토로 문제(PS-021~050)다
    await expect(page.getByText('1 / 30')).toBeVisible();
    const ids: string[] = await page.evaluate(() => eval('gameState.questions').map((q: any) => q.id));
    expect(ids).toHaveLength(30);
    expect(ids.every(id => /^PS-0(2[1-9]|[34]\d|50)$/.test(id))).toBe(true);
  });
});
