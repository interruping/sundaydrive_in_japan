import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { QUESTIONS } from '../dist/questions.js';

const scene = (id, mobile = false) => readFile(new URL(`../dist/scenes/${id}${mobile ? '.mobile' : ''}.svg`, import.meta.url), 'utf8');
const count = (svg, attribute) => svg.split(attribute).length - 1;

test('every question has a separate valid-looking asset and exactly one directly identified own car', async () => {
  for (const q of QUESTIONS) for (const mobile of [false, true]) {
    const svg = await scene(q.id, mobile);
    assert.match(svg, /^<svg /);
    assert.ok(svg.includes(`data-question-id="${q.id}"`));
    assert.equal(count(svg, 'data-vehicle-role="own"'), 1, q.id);
    assert.ok(svg.includes('내 차'), q.id);
    assert.ok(!svg.includes('undefined'), q.id);
    assert.ok(!svg.includes('<script'), q.id);
  }
});

test('scenarios differ visually after question titles and all drawing text are removed', async () => {
  const seen = new Map();
  for (const q of QUESTIONS) {
    const drawing = (await scene(q.id))
      .replace(/<(title|desc|text)\b[^>]*>[\s\S]*?<\/\1>/g, '')
      .replace(/\s(?:aria-[\w-]+|data-[\w-]+)="[^"]*"/g, '')
      .replace(/\s+/g, ' ');
    assert.ok(!seen.has(drawing), `${q.id} only changes text from ${seen.get(drawing)}`);
    seen.set(drawing, q.id);
  }
});

test('railway alarm and road signal are distinct devices with the specified scope and gate state', async () => {
  for (const q of QUESTIONS.filter(q => q.category === 'railway')) {
    const svg = await scene(q.id);
    assert.equal(count(svg, 'data-signal-type="rail-alarm"'), 1, q.id);
    assert.equal(count(svg, 'data-signal-type="road"'), q.scene.signal ? 1 : 0, q.id);
    assert.ok(svg.includes(`data-gate="${q.scene.gate}"`), q.id);
    assert.ok(svg.includes(`data-alarm-state="${q.scene.alarm}"`), q.id);
    if (q.scene.signalScope === 'separate-intersection') assert.ok(svg.includes('data-junction="separate-intersection"'));
  }
});

test('lane arrows belong to actual lanes leading into a real intersection', async () => {
  for (const q of QUESTIONS.filter(q => q.scene.kind === 'lane-junction')) {
    const svg = await scene(q.id);
    assert.ok(svg.includes('data-intersection="true"'), q.id);
    for (const [index, side] of ['left', 'right'].entries()) {
      assert.ok(svg.includes(`data-lane="${side}" data-lane-directions="${q.scene.laneDirections[index].join(',')}"`), q.id);
    }
    assert.ok(svg.includes(`data-boundary="${q.scene.boundary}"`), q.id);
  }
});

test('solid signal stop lines and internal waiting guides remain separate', async () => {
  for (const id of ['turn-01', 'turn-02', 'turn-03', 'turn-04']) {
    const svg = await scene(id);
    assert.equal(count(svg, 'data-marking="stop-line"'), 2, id);
    assert.equal(count(svg, 'data-marking="waiting-guide"'), 0, id);
  }
  for (const id of ['turn-05', 'turn-06', 'turn-07']) {
    const svg = await scene(id);
    assert.equal(count(svg, 'data-marking="stop-line"'), 1, id);
    assert.equal(count(svg, 'data-marking="waiting-guide"'), 1, id);
  }
});

test('destination entry diagrams distinguish center lines, signs, sidewalks and driveway navigation', async () => {
  for (const q of QUESTIONS.filter(q => q.category === 'entry')) {
    const svg = await scene(q.id);
    assert.ok(svg.includes('data-road-layout="two-way-two-lane"'), q.id);
    assert.ok(svg.includes(`data-center-line="${q.scene.centerLine}"`), q.id);
    assert.ok(svg.includes(`data-has-sidewalk="${Boolean(q.scene.sidewalk)}"`), q.id);
    if (q.scene.sign) assert.ok(svg.includes(`data-sign="${q.scene.sign}"`), q.id);
  }
  assert.ok((await scene('entry-07')).includes('data-nav-layout="driveway"'));
  assert.ok((await scene('lane-07')).includes('data-nav-position="past-fork"'));
});
