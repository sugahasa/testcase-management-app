import { test, expect } from '@playwright/test';

const pause = (ms = 700) => new Promise((r) => setTimeout(r, ms));

async function createTestCase(
  page: import('@playwright/test').Page,
  opts: {
    title: string;
    priority: string;
    testType: string;
    precondition: string;
    steps: { summary: string; detail: string }[];
  }
) {
  await page.goto('/testcases');
  await pause();

  await page.getByRole('button', { name: '+ 新規作成' }).click();
  await pause();

  await page.getByPlaceholder('テストケースの概要を入力').fill(opts.title);
  await page.locator('#priority').selectOption(opts.priority);
  await page.locator('#testType').selectOption(opts.testType);
  await page.getByPlaceholder('テスト実行前に満たすべき条件を入力').fill(opts.precondition);
  await pause();
  await page.getByRole('button', { name: '作成', exact: true }).click();
  await pause();

  // 詳細ページへ
  await page.getByRole('link', { name: opts.title }).first().click();
  await pause();

  for (const step of opts.steps) {
    await page.getByRole('button', { name: '+ ステップ追加' }).click();
    await page.getByPlaceholder('ステップの概要').fill(step.summary);
    await page.getByPlaceholder('具体的な手順・入力値・確認内容など').fill(step.detail);
    await pause();
    await page.getByRole('button', { name: '追加', exact: true }).click();
    await pause();
  }
}

test('テストケース作成・プロジェクト作成・実行結果変更のデモ', async ({ page, request }) => {
  // テスト開始前にデータをリセット
  await request.post('/api/dev/reset');
  await pause();

  // ── テストケース 1 ─────────────────────────────────────────────
  await createTestCase(page, {
    title: 'ログイン機能の検証',
    priority: 'HIGH',
    testType: 'FUNCTIONAL',
    precondition: 'ブラウザが起動していること\nテスト用アカウントが存在すること',
    steps: [
      {
        summary: 'ログインページを開く',
        detail: 'ブラウザでアプリのURLにアクセスする',
      },
      {
        summary: 'ユーザー名とパスワードを入力する',
        detail: 'ユーザー名: test@example.com\nパスワード: password123',
      },
      {
        summary: 'ログインボタンを押してダッシュボードに遷移することを確認する',
        detail: '「ログイン」ボタンをクリックし、ダッシュボード画面に遷移することを確認する',
      },
    ],
  });

  await expect(page.getByText('#3')).toBeVisible();

  // ── テストケース 2 ─────────────────────────────────────────────
  await createTestCase(page, {
    title: '商品検索機能の検証',
    priority: 'MEDIUM',
    testType: 'REGRESSION',
    precondition: 'ログイン済みであること\n商品データが登録されていること',
    steps: [
      {
        summary: '検索ボックスにキーワードを入力する',
        detail: '検索ボックスに「テスト商品」と入力する',
      },
      {
        summary: '検索ボタンをクリックする',
        detail: '虫眼鏡アイコンまたは「検索」ボタンをクリックする',
      },
      {
        summary: '検索結果に該当商品が表示されることを確認する',
        detail: '検索結果リストに「テスト商品」が含まれることを確認する',
      },
      {
        summary: '存在しないキーワードで検索したとき「結果なし」が表示されることを確認する',
        detail: '「存在しない商品xyzabc」と入力して検索し、適切なメッセージが表示されることを確認する',
      },
    ],
  });

  await expect(page.getByText('#4')).toBeVisible();

  // ── テスト実行プロジェクトを作成 ──────────────────────────────
  await page.goto('/projects');
  await pause();

  await page.getByRole('button', { name: '+ 新規作成' }).click();
  await pause();

  await page.getByPlaceholder('プロジェクト名').fill('v1.0 リリース前テスト');
  await page.getByPlaceholder('プロジェクトの目的や対象範囲など').fill('v1.0リリース前の回帰テスト・機能テストを実施する');
  await pause();
  await page.getByRole('button', { name: '作成', exact: true }).click();
  await page.getByRole('link', { name: 'v1.0 リリース前テスト' }).waitFor({ state: 'visible', timeout: 15000 });
  await pause();

  // プロジェクト詳細へ（最新のものを選択）
  await page.getByRole('link', { name: 'v1.0 リリース前テスト' }).first().click();
  await pause();

  // テストケース 1 を追加
  await page.getByRole('button', { name: '+ ケースを追加' }).click();
  await pause();
  await page.getByRole('button', { name: '追加', exact: true }).first().click();
  await pause();

  // テストケース 2 を追加
  await page.getByRole('button', { name: '+ ケースを追加' }).click();
  await pause();
  await page.getByRole('button', { name: '追加', exact: true }).first().click();
  await pause();

  // ── テストステップを展開して実行結果を変更 ────────────────────

  // ケース 1 を展開
  await page.getByRole('button', { name: '▶' }).first().click();
  await pause();

  const selects1 = page.locator('select');
  await selects1.nth(0).selectOption('PASSED');
  await pause(500);
  await selects1.nth(1).selectOption('PASSED');
  await pause(500);
  await selects1.nth(2).selectOption('FAILED');
  await pause();

  // ケース 2 を展開
  await page.getByRole('button', { name: '▶' }).first().click();
  await pause();

  const selects2 = page.locator('select');
  await selects2.nth(3).selectOption('PASSED');
  await pause(500);
  await selects2.nth(4).selectOption('PASSED');
  await pause(500);
  await selects2.nth(5).selectOption('BLOCKED');
  await pause(500);
  await selects2.nth(6).selectOption('NOT_EXECUTED');
  await pause();

  // 最終確認 - いずれかのケースで結果が記録されていることを確認
  await expect(page.getByText(/合格\s*\d+\s*\/\s*不合格\s*\d+/).first()).toBeVisible({ timeout: 10000 });
  await pause(1500);
});
