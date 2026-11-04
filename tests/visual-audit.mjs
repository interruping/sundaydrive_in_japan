import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { QUESTIONS } from '../dist/questions.js';
const base = process.env.BASE_URL || 'http://localhost:4173';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1160,height:1100},deviceScaleFactor:1});
await mkdir('test-results/visual-audit',{recursive:true});
const escape=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
for(let offset=0;offset<QUESTIONS.length;offset+=4){
  await page.setContent(`<html lang="ko"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:16px;background:#fff;font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;color:#173e38;display:grid;grid-template-columns:1fr 1fr;gap:20px}article{border:1px solid #bccfbf;border-radius:14px;padding:16px}h2{font-size:22px;line-height:1.4;margin:8px 0;min-height:62px}small{font-size:13px}img{width:100%;height:360px;object-fit:contain}p{font-size:17px;margin:8px 0;line-height:1.5}</style>${QUESTIONS.slice(offset,offset+4).map(q=>`<article><small>${q.id} · 정답 ${q.answer+1}</small><h2>${escape(q.prompt)}</h2><img src="${base}/scenes/${q.id}.svg"><p>1. ${escape(q.choices[0])}<br>2. ${escape(q.choices[1])}</p></article>`).join('')}</html>`);
  await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  await page.screenshot({path:`test-results/visual-audit/sheet-${String(offset/4+1).padStart(2,'0')}.png`,fullPage:true});
}
await browser.close();
console.log('Rendered all 60 questions in 15 visual review sheets.');
