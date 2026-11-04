import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { QUESTION_BY_ID, QUESTIONS } from '../dist/questions.js';
import { createExam, freshState, STORAGE_KEY } from '../dist/engine.js';

const baseURL = process.env.BASE_URL || 'http://localhost:4173';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await mkdir('test-results', { recursive: true });

const state = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
const click = action => page.locator(`button[data-action="${action}"]`).click();
const screenshot = name => page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
async function installExam() {
  const attempt = createExam();
  await page.evaluate(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), { key: STORAGE_KEY, saved: { ...freshState(), screen: 'quiz', attempt } });
  await page.reload();
  return attempt;
}
async function finishWith(correctCount) {
  for (let i = 0; i < 20; i++) {
    const saved = await state();
    const question = QUESTION_BY_ID.get(saved.attempt.items[i].id);
    await page.locator(`[data-action="answer"][data-choice="${i < correctCount ? question.answer : 1 - question.answer}"]`).click();
    assert.equal(await page.locator('.choice:enabled').count(), 0);
    await click('next');
  }
}
async function assertNoOverflow() {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'No horizontal overflow');
}

try {
  await page.goto(baseURL);
  assert.equal(await page.getByRole('button').count(), 1);
  assert.equal(await page.getByRole('button', { name: '시작하기' }).count(), 1);
  await screenshot('home-desktop');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await assertNoOverflow();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await screenshot('home-mobile');
  await click('start');
  assert.equal(await page.locator('.choice:enabled').count(), 2);
  assert.equal(await page.locator('.scene-frame svg[role="img"]').count(), 1);
  await page.keyboard.press('1');
  const answeredState = await state();
  assert.notEqual(answeredState.attempt.items[0].answer, null);
  await page.reload();
  assert.deepEqual(await state(), answeredState);
  assert.equal(await page.locator('#feedback-title').count(), 1);
  await click('home');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.quiz-shell').count(), 1);
  await click('home');
  await page.locator('dialog button[value="leave"]').click();
  await page.getByRole('button', { name: '이어서 풀기' }).waitFor({ state: 'visible' });
  assert.equal(await page.getByRole('button', { name: '이어서 풀기' }).count(), 1);
  await click('start');
  assert.deepEqual((await state()).attempt, answeredState.attempt);
  await click('home');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.quiz-shell').count(), 1, 'Escape remains on quiz after an earlier confirmed leave');
  console.log('PASS start, keyboard answers, reload, pause and resume');

  const firstExam = await installExam();
  await finishWith(18);
  assert.equal(await page.locator('.score strong').textContent(), '90');
  assert.equal(await page.locator('.result-label').textContent(), '통과했어요');
  await screenshot('pass-mobile');
  const result = await state();
  await page.reload();
  assert.deepEqual(await state(), result);
  await click('review');
  assert.equal((await state()).attempt.items.length, 2);
  for (let i = 0; i < 2; i++) {
    const saved = await state();
    const question = QUESTION_BY_ID.get(saved.attempt.items[i].id);
    await page.locator(`[data-action="answer"][data-choice="${question.answer}"]`).click();
    await click('next');
  }
  assert.match(await page.locator('.result-content h1').textContent(), /이제 더 잘/);
  assert.equal(await page.locator('[data-action="review"]').count(), 0);
  await click('exam-result');
  assert.equal(await page.locator('.score strong').textContent(), '90');
  await click('retry');
  assert.notDeepEqual((await state()).attempt.items.map(item => item.id).sort(), firstExam.items.map(item => item.id).sort());
  console.log('PASS 90-point pass, mistake-only review, original result and fresh retry');

  await installExam();
  await finishWith(17);
  assert.equal(await page.locator('.score strong').textContent(), '85');
  assert.equal(await page.locator('.result-label').textContent(), '90점부터 통과예요');
  assert.equal(await page.locator('[data-action="retry"]').count(), 1);
  await screenshot('retry-mobile');
  console.log('PASS 85-point retry');

  // Display each real scenario on mobile, including navigation, long prompts and feedback.
  const attempt = createExam();
  for (const question of QUESTIONS) {
    const fixture = structuredClone(attempt);
    fixture.items = [{ id: question.id, order: [0, 1], answer: null }, ...fixture.items.filter(item => item.id !== question.id)].slice(0, 20);
    await page.evaluate(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), { key: STORAGE_KEY, saved: { ...freshState(), screen: 'quiz', attempt: fixture } });
    await page.reload();
    assert.equal(await page.locator('h1').textContent(), question.prompt);
    await assertNoOverflow();
    assert.ok(await page.locator('.scene-art').getAttribute('aria-label'));
    const xmlOkay = await page.locator('.scene-art').evaluate(svg => !new DOMParser().parseFromString(svg.outerHTML, 'image/svg+xml').querySelector('parsererror'));
    assert.ok(xmlOkay, `Valid SVG: ${question.id}`);
    if (['signal-02', 'signal-05', 'safety-01', 'turn-08', 'railway-02', 'highway-04'].includes(question.id)) await screenshot(`${question.id}-mobile`);
  }
  console.log('PASS all 60 illustrated scenarios at mobile size');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await installExam();
  await screenshot('quiz-desktop');
  await assertNoOverflow();

  // Storage-unavailable browsers must still run the complete UI.
  const noStorage = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await noStorage.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  const privatePage = await noStorage.newPage();
  await privatePage.goto(baseURL);
  await privatePage.getByRole('button', { name: '시작하기' }).click();
  assert.equal(await privatePage.locator('.choice:enabled').count(), 2);
  assert.equal(await privatePage.locator('.storage-note').count(), 1);
  await noStorage.close();
  console.log('PASS storage unavailable fallback');
  assert.deepEqual(errors, []);
  console.log('PASS no uncaught browser errors');
} finally {
  await context.close();
  await browser.close();
}
