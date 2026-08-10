// spec: 퀴즈 진행 - 일반 및 카테고리 모드 (TC-18 ~ TC-26)
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('퀴즈 진행 - 일반 및 카테고리 모드', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('quiz_game_history');
      localStorage.removeItem('quiz_player_stats');
      localStorage.removeItem('quiz_leaderboard');
    });
    await expect(page.locator('#home-screen.visible')).toBeVisible();
  });

  /** 일반 프로필 → 카테고리별 세계사 퀴즈 화면까지 이동하는 헬퍼 */
  async function navigateToHistoryCategoryQuiz(page: any) {
    await page.locator('button:has-text(\'✏️ 퀴즈 시작하기\')').click();
    await page.locator('.profile-card:has-text(\'일반\')').click();
    await page.locator('button:has-text(\'다음 →\')').click();
    await page.locator('.mode-card:has-text(\'카테고리별\')').click();
    await page.locator('.cat-card:has-text(\'세계사\')').click();
    await page.locator('button:has-text(\'▶ 시작하기\')').click();
  }

  test('TC-18: 퀴즈 화면 초기 상태 확인', async ({ page }) => {
    // 일반 프로필 → 카테고리별 → 세계사 → 시작하기 순으로 진행한다
    await navigateToHistoryCategoryQuiz(page);

    // expect: 카테고리 뱃지(🏛️ 세계사)가 표시된다
    await expect(page.getByText('🏛️ 세계사', { exact: true })).toBeVisible();

    // expect: 진행 표시(1 / 11)가 표시된다
    await expect(page.getByText('/ 11')).toBeVisible();

    // expect: 점수 표시('점수: 0점')가 표시된다
    await expect(page.getByText('점수: 0점')).toBeVisible();

    // expect: Q1. 번호와 문제 텍스트가 표시된다
    await expect(page.getByText('Q1.')).toBeVisible();

    // expect: 4개 선택지 버튼(① ② ③ ④)이 활성화 상태다
    const optBtns = page.locator('.opt-btn');
    await expect(optBtns).toHaveCount(4);
    await expect(optBtns.nth(0)).toBeEnabled();
    await expect(optBtns.nth(1)).toBeEnabled();
    await expect(optBtns.nth(2)).toBeEnabled();
    await expect(optBtns.nth(3)).toBeEnabled();

    // expect: '💡 힌트 보기' 버튼이 활성화 상태다
    await expect(page.locator('#btn-hint')).toBeEnabled();

    // expect: 타이머가 표시되지 않는다(스피드 모드 아님)
    await expect(page.locator('#quiz-timer')).not.toBeVisible();
  });

  test('TC-19: 정답 선택 시 피드백 및 점수 증가', async ({ page }) => {
    // 퀴즈 화면에서 정답 선택지를 클릭한다
    await navigateToHistoryCategoryQuiz(page);

    // page.evaluate()로 gameState.questions[gameState.currentIndex].answer를 읽어 정답 버튼 인덱스를 확인하고 클릭한다
    const answerIndex = await page.evaluate('gameState.questions[gameState.currentIndex].answer') as number;
    await page.locator('.opt-btn').nth(answerIndex).click();

    // expect: '✅ 정답입니다!' 메시지가 표시된다
    await expect(page.locator('#feedback-result')).toHaveText('✅ 정답입니다!');

    // expect: 점수 내역(기본 +10, 난이도 배수 점수 등)이 표시된다
    await expect(page.locator('#score-breakdown')).toBeVisible();

    // expect: '→ 이번 획득: +N점' 형식의 획득 점수가 표시된다
    await expect(page.locator('.score-breakdown-total')).toContainText('→ 이번 획득: +');

    // expect: 문제 해설 텍스트가 표시된다
    await expect(page.locator('#feedback-explanation')).not.toBeEmpty();

    // expect: 상단 점수 표시가 증가한다
    await expect(page.getByText('점수: 0점')).not.toBeVisible();

    // expect: 4개 선택지 버튼이 모두 비활성화된다
    const optBtns = page.locator('.opt-btn');
    await expect(optBtns.nth(0)).toBeDisabled();
    await expect(optBtns.nth(1)).toBeDisabled();
    await expect(optBtns.nth(2)).toBeDisabled();
    await expect(optBtns.nth(3)).toBeDisabled();

    // expect: '다음 문제 →' 버튼이 나타난다
    await expect(page.getByRole('button', { name: '다음 문제 →' })).toBeVisible();
  });

  test('TC-20: 오답 선택 시 피드백 및 점수 유지', async ({ page }) => {
    // 퀴즈 화면에서 오답 선택지를 클릭한다
    await navigateToHistoryCategoryQuiz(page);

    // 정답이 아닌 다른 인덱스 버튼을 클릭한다. answer가 0이면 인덱스 1을, 아니면 인덱스 0을 클릭
    const answerIndex = await page.evaluate('gameState.questions[gameState.currentIndex].answer') as number;
    const wrongIndex = answerIndex === 0 ? 1 : 0;
    await page.locator('.opt-btn').nth(wrongIndex).click();

    // expect: '❌ 오답입니다' 메시지가 표시된다
    await expect(page.locator('#feedback-result')).toContainText('❌ 오답입니다');

    // expect: 점수 내역 없이 해설 텍스트만 표시된다
    await expect(page.locator('#score-breakdown')).not.toBeVisible();

    // expect: 상단 점수 표시가 증가하지 않는다
    await expect(page.getByText('점수: 0점')).toBeVisible();

    // expect: 4개 선택지 버튼이 모두 비활성화된다
    const optBtns = page.locator('.opt-btn');
    await expect(optBtns.nth(0)).toBeDisabled();
    await expect(optBtns.nth(1)).toBeDisabled();
    await expect(optBtns.nth(2)).toBeDisabled();
    await expect(optBtns.nth(3)).toBeDisabled();

    // expect: '다음 문제 →' 버튼이 나타난다
    await expect(page.getByRole('button', { name: '다음 문제 →' })).toBeVisible();
  });

  test('TC-21: 힌트 버튼 클릭 - 힌트 표시 및 버튼 비활성화', async ({ page }) => {
    // 퀴즈 화면에서 '💡 힌트 보기' 버튼을 클릭한다
    await navigateToHistoryCategoryQuiz(page);

    await page.locator('#btn-hint').click();

    // expect: 힌트 텍스트가 버튼 아래에 나타난다
    await expect(page.locator('#hint-text')).toBeVisible();

    // expect: '💡 힌트 보기' 버튼이 비활성화(disabled) 상태로 변경된다
    await expect(page.locator('#btn-hint')).toBeDisabled();

    // expect: 선택지 버튼은 여전히 활성화 상태다
    const optBtns = page.locator('.opt-btn');
    await expect(optBtns.nth(0)).toBeEnabled();
    await expect(optBtns.nth(1)).toBeEnabled();
    await expect(optBtns.nth(2)).toBeEnabled();
    await expect(optBtns.nth(3)).toBeEnabled();
  });

  test('TC-22: 힌트 사용 시 힌트 보너스 점수 감소 확인', async ({ page }) => {
    // 힌트를 사용하지 않고 정답을 맞혔을 때의 점수 내역을 기록한다
    await navigateToHistoryCategoryQuiz(page);

    // Q1: 힌트 미사용 상태에서 정답 클릭
    const ans1 = await page.evaluate('gameState.questions[gameState.currentIndex].answer') as number;
    await page.locator('.opt-btn').nth(ans1).click();

    // expect: 힌트 미사용 정답의 점수 내역에는 '힌트 +2' 항목이 포함된다
    await expect(page.getByText('힌트 +2')).toBeVisible();

    // 이어서 다음 문제에서 힌트를 사용한 후 정답을 맞힌다
    await page.getByRole('button', { name: '다음 문제 →' }).click();

    // Q2: 힌트 사용 후 정답 클릭
    await page.locator('#btn-hint').click();
    const ans2 = await page.evaluate('gameState.questions[gameState.currentIndex].answer') as number;
    await page.locator('.opt-btn').nth(ans2).click();

    // expect: 힌트를 사용한 경우, 힌트 보너스 점수 항목에 '+2'가 표시되지 않는다
    await expect(page.getByText('힌트 +2')).not.toBeVisible();
  });

  test('TC-23: 다음 문제로 이동 시 힌트 상태 초기화', async ({ page }) => {
    // 첫 번째 문제에서 힌트를 사용한 후 답변하고 '다음 문제 →'를 클릭한다
    await navigateToHistoryCategoryQuiz(page);

    // Q1: 힌트 사용 후 정답 제출
    await page.locator('#btn-hint').click();
    const ans1 = await page.evaluate('gameState.questions[gameState.currentIndex].answer') as number;
    await page.locator('.opt-btn').nth(ans1).click();
    await page.getByRole('button', { name: '다음 문제 →' }).click();

    // expect: 두 번째 문제로 넘어갔을 때 '💡 힌트 보기' 버튼이 다시 활성화 상태다
    await expect(page.locator('#btn-hint')).toBeEnabled();

    // expect: 힌트 텍스트가 표시되지 않는다
    await expect(page.locator('#hint-text')).not.toBeVisible();
  });

  test('TC-24: 마지막 문제 후 \'결과 보기 →\' 버튼 표시', async ({ page }) => {
    // 카테고리별 세계사(11문제) 퀴즈의 마지막(11번째) 문제에 답변한다
    await navigateToHistoryCategoryQuiz(page);

    // 11문제를 전부 진행하기 위해 page.evaluate()를 활용하여 Q1~Q10 반복 자동 답변 처리
    await page.evaluate(`(async function() {
      const delay = ms => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < 10; i++) {
        const idx = gameState.questions[gameState.currentIndex].answer;
        const btns = document.querySelectorAll('.opt-btn');
        if (btns[idx] && !btns[idx].disabled) {
          btns[idx].click();
          await delay(300);
          const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('다음 문제'));
          if (nextBtn) { nextBtn.click(); await delay(300); }
        }
      }
    })()`);

    // expect: 진행 표시가 '11 / 11'로 표시된다
    await expect(page.getByText('Q11.')).toBeVisible();
    await expect(page.getByText('/ 11')).toBeVisible();

    // Q11 정답 클릭
    const ans11 = await page.evaluate('gameState.questions[gameState.currentIndex].answer') as number;
    await page.locator('.opt-btn').nth(ans11).click();

    // expect: '다음 문제 →' 대신 '결과 보기 →' 버튼이 표시된다
    await expect(page.getByRole('button', { name: '결과 보기 →' })).toBeVisible();
    await expect(page.getByRole('button', { name: '다음 문제 →' })).not.toBeVisible();
  });

  test('TC-25: 연속 정답 시 콤보 보너스 점수 확인', async ({ page }) => {
    // 3문제 이상 연속으로 정답을 선택한다
    await navigateToHistoryCategoryQuiz(page);

    // Q1, Q2 자동 정답 처리하여 Q3으로 이동 (콤보 2 누적)
    await page.evaluate(`(async function() {
      const delay = ms => new Promise(r => setTimeout(r, ms));
      // Q1 정답 클릭
      const ans1 = gameState.questions[gameState.currentIndex].answer;
      document.querySelectorAll('.opt-btn')[ans1].click();
      await delay(300);
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('다음 문제'))?.click();
      await delay(300);
      // Q2 정답 클릭
      const ans2 = gameState.questions[gameState.currentIndex].answer;
      document.querySelectorAll('.opt-btn')[ans2].click();
      await delay(300);
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('다음 문제'))?.click();
      await delay(300);
    })()`);

    // Q3: 3번째 연속 정답 클릭으로 콤보 보너스 발동
    const ans3 = await page.evaluate('gameState.questions[gameState.currentIndex].answer') as number;
    await page.locator('.opt-btn').nth(ans3).click();

    // expect: 3번째 연속 정답 이후 점수 내역에 콤보 보너스(+2 이상)가 표시된다
    await expect(page.getByText('콤보 +2')).toBeVisible();
  });

  test('TC-26: 전체 도전 모드 44문제 확인 (일반 프로필)', async ({ page }) => {
    // 일반 프로필 → 전체 도전 모드를 선택하고 시작한다
    await page.locator('button:has-text(\'✏️ 퀴즈 시작하기\')').click();
    await page.locator('.profile-card:has-text(\'일반\')').click();
    await page.locator('button:has-text(\'다음 →\')').click();
    await page.locator('.mode-card:has-text(\'전체 도전\')').click();
    await page.locator('button:has-text(\'▶ 시작하기\')').click();

    // expect: 퀴즈 화면에서 진행 표시가 '1 / 44'로 시작된다
    await expect(page.getByText('/ 44')).toBeVisible();
    await expect(page.getByText('Q1.')).toBeVisible();
  });
});
