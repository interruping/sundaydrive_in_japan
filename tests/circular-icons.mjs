import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { circularArrows } from '../dist/symbols.js';

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 950, height: 620 }, deviceScaleFactor: 1 });
const refresh = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${circularArrows({ color: '#173e38' })}</svg>`;
const roundaboutGlyph = circularArrows({ cx:32, cy:32, radius:18, count:3, color:'#fffef7', strokeWidth:3.5, headLength:5, headWidth:7.5, startAngle:-90, gapAngle:40 });
const roundabout = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#4e85ab"/>${roundaboutGlyph}</svg>`;
try {
  for (const { markup, expected, sizes } of [
    { markup: refresh, expected: 2, sizes: [18, 22, 24, 37, 96] },
    { markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${roundaboutGlyph}</svg>`, expected: 3, sizes: [28, 40, 58, 160] },
  ]) {
    for (const size of sizes) {
      const components = await page.evaluate(async ({ markup, size }) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const context = canvas.getContext('2d');
        const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
        const image = new Image();
        image.src = url;
        await image.decode();
        context.drawImage(image, 0, 0, size, size);
        URL.revokeObjectURL(url);
        const rgba = context.getImageData(0, 0, size, size).data;
        const visited = new Uint8Array(size * size);
        let count = 0;
        for (let index = 0; index < visited.length; index++) {
          if (visited[index] || rgba[index * 4 + 3] < 100) continue;
          count++;
          const stack = [index];
          visited[index] = 1;
          while (stack.length) {
            const current = stack.pop(), x = current % size, y = Math.floor(current / size);
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              const xx = x + dx, yy = y + dy, next = yy * size + xx;
              if (xx < 0 || yy < 0 || xx >= size || yy >= size || visited[next] || rgba[next * 4 + 3] < 100) continue;
              visited[next] = 1;
              stack.push(next);
            }
          }
        }
        return count;
      }, { markup, size });
      assert.equal(components, expected, `${expected}-arrow symbol at ${size}px: each head must be connected to exactly one arc`);
    }
  }
  await mkdir('test-results', { recursive: true });
  await page.setContent(`<html lang="ko"><meta charset="utf-8"><style>body{font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;background:#edf3ee;color:#173e38;padding:32px;display:flex;gap:70px}section{width:360px}h2{font-size:23px}.samples{display:flex;align-items:center;gap:32px;height:210px}.normal svg{width:24px;height:24px}.normal.sign svg{width:40px;height:40px}.large svg{width:180px;height:180px}p{font-size:16px}</style><section><h2>다시 시험 보기</h2><div class="samples"><div class="normal">${refresh}</div><div class="large">${refresh}</div></div><p>실제 크기 24px / 확대</p></section><section><h2>회전교차로 표지</h2><div class="samples"><div class="normal sign">${roundabout}</div><div class="large">${roundabout}</div></div><p>실제 크기 40px / 확대</p></section></html>`);
  await page.screenshot({ path: 'test-results/circular-arrows.png', fullPage: true });
  console.log('PASS connected arrowheads at all 9 tested rendered sizes; inspection image saved.');
} finally {
  await browser.close();
}
