// spec: 순위 화면 (Ranking Screen) TC-47 ~ TC-55
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('순위 화면', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('quiz_game_history');
      localStorage.removeItem('quiz_player_stats');
      localStorage.removeItem('quiz_leaderboard');
    });
    await expect(page.locator('#home-screen.visible')).toBeVisible();
  });

  /**
   * 게임을 완료하고 닉네임으로 순위 등록하는 헬퍼 함수.
   * 홈 → 일반 프로필 → 카테고리별 → 세계사 → 시작 → 11문제 자동 답변 → 닉네임 등록 → 홈
   */
  async function registerScore(page: any, nickname: string): Promise<void> {
    // 홈 → 일반 프로필 → 카테고리별 → 세계사 → 시작
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await page.getByText('🌍 일반 성인 기존 상식 퀴즈 (기본 모드)').click();
    await page.locator('button:has-text("다음 →")').click();
    await page.getByText('🗂️ 카테고리별 분야 선택').click();
    await page.getByText('🏛️ 세계사 11문제').click();
    await page.locator('button:has-text("▶ 시작하기")').click();

    // 퀴즈 화면이 렌더링되어 gameState.questions가 채워질 때까지 대기
    await expect(page.locator('#quiz-screen.visible')).toBeVisible();
    await expect(page.locator('.opt-btn').first()).toBeVisible();

    // 11문제 자동 답변 (page.evaluate 활용 — 게임 내부 상태 접근 필요)
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

      // Q1 정답 클릭
      // 참고: index.html에서 gameState는 최상위 스크립트의 const로 선언되어
      // window.gameState로는 접근할 수 없다 (전역 렉시컬 스코프 바인딩만 존재).
      // page.evaluate는 페이지와 동일한 realm에서 실행되므로 식별자를 직접 참조한다.
      const q0 = gameState.questions[0];
      const opts0 = document.querySelectorAll('.opt-btn');
      (opts0[q0.answer] as HTMLElement)?.click();
      await delay(300);

      // Q1 → Q2 이동 ('다음 문제 →' 버튼)
      const firstNext = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent?.includes('다음 문제')
      );
      (firstNext as HTMLElement)?.click();
      await delay(400);

      // Q2 ~ Q11 정답 클릭 및 다음으로 이동
      const questions = gameState.questions;
      for (let i = 1; i < questions.length; i++) {
        const q = questions[i];
        await delay(200);
        const opts = document.querySelectorAll('.opt-btn:not([disabled])');
        (opts[q.answer] as HTMLElement)?.click();
        await delay(500);
        const nextBtn = Array.from(document.querySelectorAll('button')).find(
          b => b.textContent?.includes('다음 문제') || b.textContent?.includes('결과 보기')
        );
        (nextBtn as HTMLElement)?.click();
        await delay(400);
      }
    });

    // 결과 화면에서 닉네임 입력 후 등록
    await page.getByRole('textbox', { name: '닉네임을 입력하세요' }).fill(nickname);
    await page.getByRole('button', { name: '등록' }).click();

    // 홈으로 이동
    await page.getByRole('button', { name: '🏠 홈으로' }).click();
  }

  test('TC-47: 순위 화면 기본 레이아웃 확인', async ({ page }) => {
    // 테이블 컬럼과 초기화 버튼은 데이터가 있을 때만 표시되므로 데이터 주입
    await page.evaluate(() => {
      const data = [
        {
          name: '테스터',
          score: 120,
          accuracy: 81.8,
          maxCombo: 3,
          mode: 'category',
          category: 'history',
          date: new Date().toISOString(),
          totalQuestions: 11,
          correctAnswers: 9,
        },
      ];
      localStorage.setItem('quiz_leaderboard', JSON.stringify(data));
    });

    // 홈 화면에서 '🏆 순위 기록 보기' 버튼을 클릭한다
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // expect: '🏆 리더보드' 제목이 표시된다
    await expect(page.getByRole('heading', { name: '🏆 리더보드' })).toBeVisible();

    // expect: 기간 필터 탭(전체, 이번 주, 오늘)이 표시된다
    await expect(page.locator('#rank-tabs-period').getByRole('button', { name: '전체' })).toBeVisible();
    await expect(page.getByRole('button', { name: '이번 주' })).toBeVisible();
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();

    // expect: 모드 필터 탭(전체, 전체도전, 카테고리별, 스피드퀴즈)이 표시된다
    await expect(page.locator('#rank-tabs-mode').getByRole('button', { name: '전체', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '전체도전' })).toBeVisible();
    await expect(page.getByRole('button', { name: '카테고리별' })).toBeVisible();
    await expect(page.getByRole('button', { name: '스피드퀴즈' })).toBeVisible();

    // expect: 테이블 컬럼(#, 이름, 점수, 정답률, 최대콤보, 모드, 날짜)이 표시된다
    await expect(page.getByRole('columnheader', { name: '#' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '이름' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '점수' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '정답률' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '최대콤보' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '모드' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '날짜' })).toBeVisible();

    // expect: '🗑️ 리더보드 초기화' 버튼이 표시된다
    await expect(page.getByRole('button', { name: '🗑️ 리더보드 초기화' })).toBeVisible();

    // expect: '← 홈으로' 버튼이 표시된다
    await expect(page.getByRole('button', { name: '← 홈으로' })).toBeVisible();
  });

  test('TC-48: 등록된 점수 리더보드에 표시', async ({ page }) => {
    // 결과 화면에서 닉네임 '테스터'로 순위 등록 후 홈 → 순위 기록 보기 순으로 이동한다
    await registerScore(page, '테스터');
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // expect: 리더보드 테이블에 '테스터'의 기록이 표시된다
    await expect(page.getByRole('cell', { name: '테스터' })).toBeVisible();

    // expect: 닉네임, 점수, 정답률, 최대콤보, 모드, 날짜 정보가 올바르게 표시된다
    await expect(page.getByRole('cell', { name: '242점' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '100%' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '🔥 11' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '카테고리별' })).toBeVisible();

    // expect: 1위 항목에 🥇 아이콘이 표시된다
    await expect(page.getByRole('cell', { name: '🥇' })).toBeVisible();
  });

  test('TC-49: 기간 탭 - 이번 주 필터링', async ({ page }) => {
    await registerScore(page, '테스터');
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // 순위 화면에서 '이번 주' 탭을 클릭한다
    await page.getByRole('button', { name: '이번 주' }).click();

    // expect: '이번 주' 탭이 활성 상태로 강조된다
    await expect(page.locator('#rank-tabs-period .rank-tab.active')).toHaveText('이번 주');

    // expect: 이번 주에 등록된 기록만 표시된다
    await expect(page.getByRole('cell', { name: '테스터' })).toBeVisible();
  });

  test('TC-50: 기간 탭 - 오늘 필터링', async ({ page }) => {
    await registerScore(page, '테스터');
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // 순위 화면에서 '오늘' 탭을 클릭한다
    await page.getByRole('button', { name: '오늘' }).click();

    // expect: '오늘' 탭이 활성 상태로 강조된다
    await expect(page.locator('#rank-tabs-period .rank-tab.active')).toHaveText('오늘');

    // expect: 오늘 날짜에 등록된 기록만 표시된다
    await expect(page.getByRole('cell', { name: '테스터' })).toBeVisible();
  });

  test('TC-51: 모드 탭 - 스피드퀴즈 필터링', async ({ page }) => {
    // 카테고리별 모드로 등록한 기록만 있는 상태에서 스피드퀴즈 탭 클릭
    await registerScore(page, '테스터');
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // 순위 화면에서 '스피드퀴즈' 모드 탭을 클릭한다
    await page.getByRole('button', { name: '스피드퀴즈' }).click();

    // expect: '스피드퀴즈' 탭이 활성 상태로 강조된다
    await expect(page.locator('#rank-tabs-mode .rank-tab.active')).toHaveText('스피드퀴즈');

    // expect: 스피드퀴즈 기록이 없으면 '해당 기간에 기록이 없습니다 🎯' 메시지가 표시된다
    await expect(page.getByText('해당 기간에 기록이 없습니다 🎯')).toBeVisible();
  });

  test('TC-52: 모드 탭 - 카테고리별 필터링', async ({ page }) => {
    // 카테고리별 모드로 게임 완료 후 등록한 뒤 순위 화면에서 '카테고리별' 탭을 클릭한다
    await registerScore(page, '테스터');
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // '카테고리별' 모드 탭을 클릭한다
    await page.getByRole('button', { name: '카테고리별' }).click();

    // expect: 카테고리별 모드 기록만 표시된다
    await expect(page.getByRole('cell', { name: '테스터' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '카테고리별' })).toBeVisible();
  });

  test('TC-53: 기간 + 모드 복합 필터링 (데이터 없는 경우)', async ({ page }) => {
    // 카테고리별 모드 기록만 있는 상태 준비
    await registerScore(page, '테스터');
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // 순위 화면에서 '이번 주' 기간 탭을 선택하고
    await page.getByRole('button', { name: '이번 주' }).click();

    // '전체도전' 모드 탭을 선택한다
    await page.getByRole('button', { name: '전체도전' }).click();

    // expect: 이번 주에 전체도전 모드로 등록된 기록이 없으면 빈 상태 메시지가 표시된다
    await expect(page.getByText('해당 기간에 기록이 없습니다 🎯')).toBeVisible();

    // expect: 두 필터가 동시에 적용된다
    await expect(page.locator('#rank-tabs-period .rank-tab.active')).toHaveText('이번 주');
    await expect(page.locator('#rank-tabs-mode .rank-tab.active')).toHaveText('전체도전');
  });

  test('TC-54: 리더보드 초기화 버튼 동작', async ({ page }) => {
    // 리더보드에 1건 이상의 기록이 있는 상태 준비
    await registerScore(page, '테스터');
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();
    await expect(page.getByRole('cell', { name: '테스터' })).toBeVisible();

    // '🗑️ 리더보드 초기화' 버튼을 클릭한다 (confirm 다이얼로그 수락)
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '🗑️ 리더보드 초기화' }).click();

    // expect: 리더보드 테이블에서 모든 기록이 삭제되고 빈 상태 메시지가 표시된다
    await expect(page.getByText('해당 기간에 기록이 없습니다 🎯')).toBeVisible();

    // expect: localStorage의 quiz_leaderboard 키가 비워진다
    const leaderboardData = await page.evaluate(() => localStorage.getItem('quiz_leaderboard'));
    expect(leaderboardData).toBeNull();
  });

  test('TC-55: 리더보드 최대 10건 표시 확인', async ({ page }) => {
    // 홈 화면에서 순위 기록 보기로 이동
    await page.getByRole('button', { name: '🏆 순위 기록 보기' }).click();

    // 10건을 초과하는 게임 기록을 localStorage에 직접 주입 후 순위 화면 재렌더링
    await page.evaluate(() => {
      const entries: object[] = [];
      for (let i = 1; i <= 11; i++) {
        entries.push({
          name: `플레이어${i}`,
          score: 200 - i * 10,
          accuracy: 100 - i,
          maxCombo: 11 - i,
          mode: 'category',
          category: 'history',
          date: new Date().toISOString(),
          totalQuestions: 11,
          correctAnswers: 11 - i + 1,
        });
      }
      localStorage.setItem('quiz_leaderboard', JSON.stringify(entries));
      (window as any).showScreen('ranking-screen');
    });

    // expect: 순위 화면에는 최대 10건만 표시된다
    await expect(page.locator('#rank-body tbody tr')).toHaveCount(10);

    // expect: 11위 이하의 기록은 표시되지 않는다
    await expect(page.getByRole('cell', { name: '플레이어11' })).not.toBeVisible();
  });
});
