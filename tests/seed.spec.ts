import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('quiz_game_history');
      localStorage.removeItem('quiz_player_stats');
      localStorage.removeItem('quiz_leaderboard');
    });
    await expect(page.locator('#home-screen.visible')).toBeVisible();
  });
});
