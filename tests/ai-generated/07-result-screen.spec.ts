// spec: 결과 화면 (Result Screen) TC-37 ~ TC-46
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('결과 화면', () => {
  /**
   * 카테고리별 세계사 퀴즈 11문제를 모두 완료하고 결과 화면으로 이동하는 헬퍼 함수.
   * 홈 → 일반 프로필 → 다음 → 카테고리별 → 세계사 → 시작 → 11문제 자동 답변 → 결과 화면
   *
   * answerStrategy:
   *   'correct' - 모든 문제 정답 처리 (TC-45: S등급)
   *   'wrong'   - 모든 문제 오답 처리 (TC-46: D등급)
   *   'any'     - 첫 번째 선택지 클릭 (기본값, 결과 화면 도달용)
   */
  async function completeHistoryQuiz(
    page: any,
    answerStrategy: 'correct' | 'wrong' | 'any' = 'any'
  ): Promise<void> {
    // 홈 화면으로 이동 및 localStorage 초기화
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('quiz_game_history');
      localStorage.removeItem('quiz_player_stats');
      localStorage.removeItem('quiz_leaderboard');
    });
    await page.locator('#home-screen.visible').waitFor();

    // 홈 → 일반 프로필 → 다음 →
    await page.locator('button:has-text("✏️ 퀴즈 시작하기")').click();
    await page.locator('.profile-card:has-text("일반")').click();
    await page.locator('button:has-text("다음 →")').click();
    // 카테고리별 → 세계사 → 시작하기
    await page.locator('.mode-card:has-text("카테고리별")').click();
    await page.locator('.cat-card:has-text("세계사")').click();
    await page.locator('button:has-text("▶ 시작하기")').click();

    // 11문제 자동 답변 (page.evaluate 사용)
    // window.getQuestionPool()는 클로저를 통해 gameState에 접근 가능
    await page.evaluate(async (strategy: string) => {
      const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
      const pool: any[] = (window as any).getQuestionPool();

      for (let i = 0; i < 11; i++) {
        await delay(200);
        // 현재 문제 텍스트를 읽어 pool에서 정답 인덱스를 찾는다
        const qText =
          (document.querySelector('#quiz-q-text') as HTMLElement)?.textContent?.trim() ?? '';
        const matched = pool.find(
          (q: any) => q.question === qText || qText.includes(q.question)
        );
        const correctIdx: number = matched ? matched.answer : 0;

        let clickIdx: number;
        if (strategy === 'correct') {
          clickIdx = correctIdx;
        } else if (strategy === 'wrong') {
          // 정답이 아닌 다른 인덱스 선택
          clickIdx = correctIdx === 0 ? 1 : 0;
        } else {
          // 'any': 첫 번째 버튼 클릭
          clickIdx = 0;
        }

        const btns = document.querySelectorAll(
          '.opt-btn:not([disabled])'
        ) as NodeListOf<HTMLElement>;
        if (btns.length > clickIdx) btns[clickIdx].click();
        else if (btns.length > 0) btns[0].click();
        await delay(400);

        // 다음 문제 → 또는 결과 보기 → 클릭
        const nextBtn = Array.from(document.querySelectorAll('button')).find(
          (b) => b.textContent?.includes('다음 문제') || b.textContent?.includes('결과 보기')
        ) as HTMLElement | undefined;
        if (nextBtn) nextBtn.click();
        await delay(300);
      }
    }, answerStrategy);
  }

  test('TC-37: 결과 화면 기본 요소 확인', async ({ page }) => {
    // 일반 프로필 → 카테고리별 → 세계사 → 모든 문제 답변 → '결과 보기 →' 클릭으로 결과 화면으로 이동
    await completeHistoryQuiz(page);

    // expect: '퀴즈 결과' 제목이 표시된다
    await expect(page.getByRole('heading', { name: '퀴즈 결과' })).toBeVisible();

    // expect: 게임 모드 뱃지('🗂️ 카테고리별')가 표시된다
    await expect(page.getByText('🗂️ 카테고리별', { exact: true })).toBeVisible();

    // expect: 등급 아이콘(🥇🥈🥉)과 등급 문자(S/A/B/C/D)가 표시된다
    await expect(page.locator('#grade-emoji')).toBeVisible();
    await expect(page.locator('#grade-letter')).toBeVisible();

    // expect: 등급에 맞는 메시지가 표시된다
    await expect(page.locator('#grade-msg')).toBeVisible();

    // expect: '최종 점수' 와 점수 값이 표시된다
    await expect(page.getByText('최종 점수', { exact: true })).toBeVisible();
    await expect(page.locator('#res-score')).toBeVisible();

    // expect: '정답률' 과 백분율이 표시된다
    await expect(page.getByText('정답률')).toBeVisible();
    await expect(page.locator('#res-rate')).toBeVisible();

    // expect: '정답 수' (N / 11) 형식이 표시된다
    await expect(page.getByText('정답 수')).toBeVisible();
    await expect(page.locator('#res-total')).toHaveText('11');

    // expect: '최대 콤보' 값이 표시된다
    await expect(page.getByText('최대 콤보')).toBeVisible();
    await expect(page.locator('#res-max-combo')).toBeVisible();
  });

  test('TC-38: 결과 화면 점수 내역 테이블 확인', async ({ page }) => {
    // 결과 화면에서 점수 분석 테이블을 확인한다 (정답 전략으로 '+N' 형식 보장)
    await completeHistoryQuiz(page, 'correct');

    // expect: 기본, 난이도, 시간, 힌트, 콤보 5개 컬럼 헤더가 표시된다
    await expect(page.getByRole('columnheader', { name: '기본' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '난이도' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '시간' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '힌트' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '콤보' })).toBeVisible();

    // expect: 각 컬럼에 누적 점수 합계가 '+N' 형식으로 표시된다 (정답 시)
    await expect(page.locator('#bd-base')).toContainText('+');
    await expect(page.locator('#bd-difficulty')).toContainText('+');
    await expect(page.locator('#bd-time')).toContainText('+');
    await expect(page.locator('#bd-hint')).toContainText('+');

    // expect: 획득하지 못한 항목은 '-'로 표시된다 (오답 시 전체 '-' 검증)
    await completeHistoryQuiz(page, 'wrong');
    await expect(page.locator('#bd-base')).toHaveText('-');
    await expect(page.locator('#bd-difficulty')).toHaveText('-');
    await expect(page.locator('#bd-time')).toHaveText('-');
    await expect(page.locator('#bd-hint')).toHaveText('-');
    await expect(page.locator('#bd-combo')).toHaveText('-');
  });

  test('TC-39: 닉네임 미입력 시 등록 버튼 비활성화', async ({ page }) => {
    // 결과 화면의 '순위 등록' 섹션을 확인한다
    await completeHistoryQuiz(page);

    // expect: 닉네임 입력 필드에 '닉네임을 입력하세요' 플레이스홀더가 표시된다
    await expect(page.getByRole('textbox', { name: '닉네임을 입력하세요' })).toBeVisible();

    // expect: '등록' 버튼이 비활성화(disabled) 상태다
    await expect(page.getByRole('button', { name: '등록' })).toBeDisabled();
  });

  test('TC-40: 닉네임 입력 시 등록 버튼 활성화', async ({ page }) => {
    await completeHistoryQuiz(page);

    // 닉네임 입력 필드에 임의의 텍스트('홍길동')를 입력한다
    await page.getByRole('textbox', { name: '닉네임을 입력하세요' }).fill('홍길동');

    // expect: '등록' 버튼이 활성화(enabled) 상태로 변경된다
    await expect(page.getByRole('button', { name: '등록' })).toBeEnabled();
  });

  test('TC-41: 순위 등록 성공 - 등록 완료 메시지 표시', async ({ page }) => {
    await completeHistoryQuiz(page);

    // 닉네임 입력 후 '등록' 버튼을 클릭한다
    await page.getByRole('textbox', { name: '닉네임을 입력하세요' }).fill('홍길동');
    await page.getByRole('button', { name: '등록' }).click();

    // expect: '✅ 등록되었습니다!' 메시지가 표시된다
    await expect(page.getByText('✅ 등록되었습니다!')).toBeVisible();

    // expect: '등록' 버튼이 비활성화 상태로 전환된다(중복 등록 방지)
    await expect(page.getByRole('button', { name: '등록' })).toBeDisabled();
  });

  test('TC-42: 같은 모드로 다시 도전 버튼 동작', async ({ page }) => {
    await completeHistoryQuiz(page);

    // 결과 화면에서 '🔄 같은 모드로 다시 도전' 버튼을 클릭한다
    await page.getByRole('button', { name: '🔄 같은 모드로 다시 도전' }).click();

    // expect: 퀴즈 화면으로 바로 전환된다
    await expect(page.locator('#quiz-screen.visible')).toBeVisible();

    // expect: 동일한 프로필과 모드(카테고리 포함)로 새 게임이 시작된다
    await expect(page.getByText('🏛️ 세계사', { exact: true })).toBeVisible();

    // expect: 점수가 0점으로 초기화된다
    await expect(page.getByText('점수: 0점')).toBeVisible();

    // expect: 진행 표시가 '1 / N'으로 초기화된다
    await expect(page.getByText('1 / 11')).toBeVisible();
  });

  test('TC-43: 카테고리 선택으로 버튼 동작', async ({ page }) => {
    await completeHistoryQuiz(page);

    // 결과 화면에서 '🗂️ 카테고리 선택으로' 버튼을 클릭한다
    await page.getByRole('button', { name: '🗂️ 카테고리 선택으로' }).click();

    // expect: 모드·카테고리 선택 화면으로 전환된다
    await expect(page.locator('#category-screen.visible')).toBeVisible();
    await expect(page.getByRole('heading', { name: '게임 모드를 선택하세요' })).toBeVisible();
  });

  test('TC-44: 홈으로 버튼 동작', async ({ page }) => {
    await completeHistoryQuiz(page);

    // 결과 화면에서 '🏠 홈으로' 버튼을 클릭한다
    await page.locator('#result-screen button:has-text("홈으로")').click();

    // expect: 홈 화면으로 전환된다
    await expect(page.locator('#home-screen.visible')).toBeVisible();
    await expect(page.getByRole('heading', { name: '🧠 상식 퀴즈' })).toBeVisible();
  });

  test('TC-45: 전체 정답 시 S등급 표시 확인', async ({ page }) => {
    // 모든 문제를 힌트 없이 빠르게 정답 처리하여 최고 점수를 달성한 후 결과 화면으로 이동
    // page.evaluate()로 getQuestionPool()에서 각 문제의 answer를 읽어 정답 인덱스 버튼을 자동 클릭
    await completeHistoryQuiz(page, 'correct');

    // expect: 등급 S가 표시된다 (40문제 환산 점수 600점 이상 기준)
    await expect(page.locator('#grade-letter')).toHaveText('S');

    // expect: 등급에 맞는 긍정적 메시지가 표시된다
    await expect(page.locator('#grade-msg')).toHaveText('퀴즈 마스터! 완벽한 점수입니다');
  });

  test('TC-46: 모든 오답 시 D등급 표시 확인', async ({ page }) => {
    // 모든 문제를 의도적으로 오답 선택하여 최저 점수를 기록한 후 결과 화면으로 이동
    // 정답이 아닌 버튼을 자동 클릭 (answer와 다른 인덱스 선택)
    await completeHistoryQuiz(page, 'wrong');

    // expect: 등급 D 또는 최저 등급이 표시된다 (40문제 환산 점수 100점 미만 기준)
    await expect(page.locator('#grade-letter')).toHaveText('D');

    // expect: 정답률이 0%로 표시된다
    await expect(page.locator('#res-rate')).toHaveText('0%');
  });
});
