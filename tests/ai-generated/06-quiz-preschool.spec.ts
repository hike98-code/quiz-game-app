// spec: 미취학아동 프로필 퀴즈 (Preschool Profile Quiz)
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('미취학아동 프로필 퀴즈 (Preschool Profile Quiz)', () => {
  async function startPreschoolQuiz(page: any) {
    await page.goto('/');
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await page.locator('.profile-card:first-child').click();
    await page.locator('#btn-profile-next').click();
    await page.getByText('🌟 전체 도전 110문제 전부').click();
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

    // expect: 진행 표시가 '1 / 110'으로 시작된다 (미취학아동 문제 풀은 기본 20 + 이웃집 토토로 30 + 생물 20 + 디저트 20 + 공룡 20)
    await expect(page.getByText('1 / 110')).toBeVisible();
  });

  test('TC-84: 미취학아동 퀴즈 - 보기 오른쪽에 보기 이미지 표시', async ({ page }) => {
    // 1. 미취학아동 프로필로 전체 도전 모드를 시작한다
    await startPreschoolQuiz(page);

    // expect: 4개 보기 버튼마다 이미지(.opt-img)가 1개씩 표시된다
    const buttons = page.locator('#quiz-options .opt-btn');
    await expect(buttons).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(buttons.nth(i).locator('.opt-img')).toHaveCount(1);
      await expect(buttons.nth(i).locator('.opt-img')).toBeVisible();
    }

    // expect: 이미지는 보기 글자의 오른쪽에 있고 버튼 밖으로 넘치지 않는다
    const box = await buttons.first().boundingBox();
    const img = await buttons.first().locator('.opt-img').boundingBox();
    expect(img!.x).toBeGreaterThan(box!.x + box!.width / 2);
    expect(img!.x + img!.width).toBeLessThanOrEqual(box!.x + box!.width);

    // expect: 이미지는 aria-hidden이라 버튼의 접근성 이름(보기 글자)에 섞이지 않는다
    await expect(buttons.first().locator('.opt-img')).toHaveAttribute('aria-hidden', 'true');

    // expect: 미취학 110문제 모두 보기 수와 같은 4개의 이미지를 가지고 있다
    const counts: number[] = await page.evaluate(() =>
      eval('QUESTIONS').filter((q: any) => q.profile === 'preschool')
        .map((q: any) => (q.optionImages || []).filter((x: string) => x).length));
    expect(counts).toHaveLength(110);
    expect(counts.every(n => n === 4)).toBe(true);
  });

  test('TC-85: 미취학아동 외 프로필은 보기 이미지 없음', async ({ page }) => {
    // 1. 일반 프로필로 전체 도전 모드를 시작한다
    await page.goto('/');
    await page.getByRole('button', { name: '✏️ 퀴즈 시작하기' }).click();
    await page.locator(".profile-card:has-text('일반')").click();
    await page.locator('#btn-profile-next').click();
    await page.locator(".mode-card:has-text('전체 도전')").click();
    await page.getByRole('button', { name: '▶ 시작하기' }).click();

    // expect: 보기 버튼에 이미지가 표시되지 않는다
    await expect(page.locator('#quiz-options .opt-btn')).toHaveCount(4);
    await expect(page.locator('#quiz-options .opt-img')).toHaveCount(0);

    // expect: 미취학 외 문제에는 optionImages 필드가 없다
    const withImages: number = await page.evaluate(() =>
      eval('QUESTIONS').filter((q: any) => q.profile !== 'preschool' && q.optionImages).length);
    expect(withImages).toBe(0);
  });

  test.describe('TTS 음성 안내 (speechSynthesis 모킹)', () => {
    // speak된 발화 텍스트를 기록하고, onend는 테스트가 직접 발생시킨다
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        const w = window as any;
        w.__tts = { log: [] as string[], pending: null as any };
        const mock = {
          speak(u: any) { w.__tts.log.push(u.text); w.__tts.pending = u; u.onstart && u.onstart(); },
          cancel() {
            w.__tts.log.push('<cancel>');
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
      await page.evaluate(() => {
        localStorage.removeItem('quiz_game_history');
        localStorage.removeItem('quiz_player_stats');
        localStorage.removeItem('quiz_leaderboard');
      });
    });

    const spoken = (page: any): Promise<string[]> =>
      page.evaluate(() => (window as any).__tts.log.filter((t: string) => t !== '<cancel>'));
    const currentQuestion = (page: any) =>
      page.evaluate(() => {
        // gameState는 최상위 const라 window 속성이 아님 → 전역 스코프 eval로 접근
        const q = eval('gameState.questions[gameState.currentIndex]');
        return { question: q.question, options: q.options, answer: q.answer, hint: q.hint, explanation: q.explanation };
      });
    const finishCurrentUtterance = (page: any) =>
      page.evaluate(() => { const t = (window as any).__tts; const u = t.pending; t.pending = null; u.onend(); });
    async function waitQuestionSpeech(page: any) {
      await startPreschoolQuiz(page);
      await expect.poll(async () => (await spoken(page)).some(t => t.endsWith(' 보기.'))).toBe(true);
    }

    test('TC-78: 미취학아동 TTS - 보기를 일번~사번으로 읽기', async ({ page }) => {
      // 1. 문제 읽기 → 보기 4개 읽기를 끝까지 진행
      await waitQuestionSpeech(page);
      const q = await currentQuestion(page);
      for (let i = 0; i < 4; i++) await finishCurrentUtterance(page);

      // expect: 보기 발화가 '일번, {보기}.' ~ '사번, {보기}.' 형식이다
      const nums = ['일번', '이번', '삼번', '사번'];
      const optionLines = (await spoken(page)).filter(t => /^(일|이|삼|사)번, /.test(t));
      expect(optionLines).toEqual(q.options.map((o: string, i: number) => `${nums[i]}, ${o}.`));
      // expect: '한 번'(횟수)으로 읽히는 아라비아 숫자나 '하나·둘…'을 쓰지 않는다
      expect((await spoken(page)).some(t => /^(\d번|하나|둘|셋|넷), /.test(t))).toBe(false);
    });

    test('TC-79: 미취학아동 TTS - 힌트 보기 클릭 시 힌트 읽기', async ({ page }) => {
      // 1. 문제를 읽는 도중 힌트 버튼 클릭
      await waitQuestionSpeech(page);
      const q = await currentQuestion(page);
      await page.getByRole('button', { name: '💡 힌트 보기' }).click();

      // expect: 진행 중인 읽기가 중단되고 힌트를 읽는다
      const log: string[] = await page.evaluate(() => (window as any).__tts.log);
      expect(log.slice(-2)).toEqual(['<cancel>', `힌트예요. ${q.hint}`]);
      await expect(page.locator('#hint-text')).toHaveText(q.hint);
    });

    test('TC-80: 미취학아동 TTS - 정답 시 칭찬 + 해설 읽기', async ({ page }) => {
      await waitQuestionSpeech(page);
      const q = await currentQuestion(page);

      // 1. 정답 보기 선택
      await page.locator('#quiz-screen .opt-btn').nth(q.answer).click();

      // expect: '정답이에요! {해설}'을 읽는다
      await expect.poll(() => spoken(page)).toContain(`정답이에요! ${q.explanation}`);
    });

    test('TC-81: 미취학아동 TTS - 오답 시 정답 안내 + 해설 읽기', async ({ page }) => {
      await waitQuestionSpeech(page);
      const q = await currentQuestion(page);
      const wrong = (q.answer + 1) % 4;

      // 1. 오답 보기 선택
      await page.locator('#quiz-screen .opt-btn').nth(wrong).click();

      // expect: '아쉬워요. 정답은 {일번~사번}, {정답}이에요/예요. {해설}'을 읽는다
      const answerText = q.options[q.answer];
      const last = (s: string) => s.charCodeAt(s.length - 1) - 0xAC00;
      const code = last(answerText);
      const copula = code >= 0 && code <= 11171 && code % 28 === 0 ? '예요' : '이에요';
      await expect.poll(() => spoken(page))
        .toContain(`아쉬워요. 정답은 ${['일번', '이번', '삼번', '사번'][q.answer]}, ${answerText}${copula}. ${q.explanation}`);

      // expect: 받침 유무에 따라 조사가 달라진다
      const copulas = await page.evaluate(() => [(window as any).copulaFor('빨간색'), (window as any).copulaFor('무지개')]);
      expect(copulas).toEqual(['이에요', '예요']);
    });

    test('TC-82: 미취학아동 TTS - 해설 읽기 전에 다음 문제로 넘어가면 해설 읽기 취소', async ({ page }) => {
      await waitQuestionSpeech(page);

      // 1. 보기 선택 직후(300ms 이내) 다음 문제 클릭 — 같은 태스크에서 연속 실행
      await page.evaluate(() => {
        (document.querySelector('#quiz-screen .opt-btn') as HTMLElement).click();
        (document.getElementById('btn-next') as HTMLElement).click();
      });
      await expect(page.getByText('2 / 110')).toBeVisible();
      const q2 = await currentQuestion(page);

      // expect: 다음 문제 읽기가 시작된다
      await expect.poll(() => spoken(page)).toContain(`${q2.question} 보기.`);

      // expect: 이전 문제의 정답/오답 안내·해설은 읽지 않는다
      await page.waitForTimeout(500);
      expect((await spoken(page)).some(t => /^(정답이에요!|아쉬워요\.)/.test(t))).toBe(false);
    });
  });
});
