import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { QUESTIONS, RETIRED_QUESTIONS } from '../dist/questions.js';

const scene = (id, mobile = false) => readFile(new URL(`../dist/scenes/${id}${mobile ? '.mobile' : ''}.svg`, import.meta.url), 'utf8');
const count = (svg, attribute) => svg.split(attribute).length - 1;

test('every question has a separate valid-looking asset and exactly one directly identified own car', async () => {
  for (const q of [...QUESTIONS, ...RETIRED_QUESTIONS]) for (const mobile of [false, true]) {
    const svg = await scene(q.id, mobile);
    assert.match(svg, /^<svg /);
    assert.ok(svg.includes(`data-question-id="${q.id}"`));
    assert.equal(count(svg, 'data-vehicle-role="own"'), 1, q.id);
    assert.ok(svg.includes('내 차'), q.id);
    assert.ok(!svg.includes('undefined'), q.id);
    assert.ok(!svg.includes('<script'), q.id);
  }
});

test('the replacement entry scenario shows a stopped van, approaching bike and crossing entry path', async () => {
  assert.ok(!QUESTIONS.some(q => q.id === 'entry-04'));
  for (const mobile of [false, true]) {
    const svg = await scene('entry-13', mobile);
    assert.match(svg, /data-vehicle-role="yielding" data-vehicle-state="stopped"/);
    assert.match(svg, /data-vehicle-role="motorcycle" data-vehicle-state="approaching"/);
    assert.match(svg, /data-travel-direction="toward-viewer"/);
    assert.match(svg, /data-driveway="right"/);
    assert.match(svg, /data-intended-route="right"/);
    assert.match(svg, /data-motorcycle-route="straight"/);
    assert.equal(count(svg, 'data-vehicle-role="'), 3);
    assert.doesNotMatch(svg, /data-sign=|data-signal-type=/);
    for (const role of ['내 차', '양보한 차', '오토바이']) assert.ok(svg.includes(role));
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
    assert.ok(svg.includes('data-lane="opposing" data-travel-direction="toward-viewer"'), q.id);
    assert.ok(svg.includes('흰 중앙선'), q.id);
  }
});

test('the real-case reconstruction separates the entry stop line from a deep internal waiting guide', async () => {
  for (const q of QUESTIONS.filter(q => q.scene.kind === 'deep-intersection')) {
    const id = q.id;
    const svg = await scene(id);
    assert.equal(count(svg, 'data-marking="stop-line"'), 1, id);
    assert.equal(count(svg, 'data-marking="waiting-guide"'), 1, id);
    const entry = Number(svg.match(/data-entry-line-y="(\d+)"/)[1]);
    const waiting = Number(svg.match(/data-waiting-line-y="(\d+)"/)[1]);
    const carLength = Number(svg.match(/data-car-length="(\d+)"/)[1]);
    assert.ok(entry - waiting >= carLength * 5, `${id}: internal waiting position must be visibly deep, not a small stop-line offset`);
    const ownY = Number(svg.match(/data-vehicle-role="own"[^>]*data-car-y="(\d+)"/)[1]);
    if (q.scene.stage === 'before-entry') assert.ok(ownY - carLength / 2 > entry, id);
    if (q.scene.stage === 'at-waiting') assert.ok(ownY - carLength / 2 > waiting && ownY < entry - carLength * 4, id);
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

test('new sign scenarios show the visual conditions that change the answer', async () => {
  for (const mobile of [false, true]) {
    const straight = await scene('lane-09', mobile);
    assert.match(straight, /data-sign="straight-only"/);
    assert.match(straight, /data-vehicle-role="oncoming"/);
    assert.doesNotMatch(straight, /data-signal-type="road"/);
    const restricted = await scene('lane-10', mobile);
    assert.match(restricted, /data-sign="straight-left"/);
    assert.match(restricted, /data-navigation="right"/);
    for (const id of ['signal-13', 'signal-14']) {
      const svg = await scene(id, mobile);
      assert.match(svg, /data-arrow="right" data-lit="true"/);
      assert.match(svg, /data-navigation="uturn"/);
      assert.equal(svg.includes('data-sign="no-uturn"'), id === 'signal-14');
    }
    const blind = await scene('priority-09', mobile);
    assert.equal(count(blind, 'data-marking="stop-line"'), 1);
    assert.match(blind, /data-occlusion="buildings"/);
    assert.match(blind, /data-check-position="B"/);
    assert.doesNotMatch(blind, /data-signal-type="road"/);
    const pedestrian = await scene('priority-10', mobile);
    assert.match(pedestrian, /data-sign="pedestrian-only"/);
    assert.match(pedestrian, /data-vehicle-role="permitted"/);
  }
});

test('roadside pictures distinguish waiting, dropoff, time limits, distance and injury', async () => {
  for (const mobile of [false, true]) {
    for (const [id, sign, passenger] of [
      ['roadside-01', 'no-parking', 'immediate-dropoff'],
      ['roadside-02', 'no-parking', 'waiting-in-shop'],
      ['roadside-03', 'no-stopping', 'immediate-dropoff'],
    ]) {
      const svg = await scene(id, mobile);
      assert.ok(svg.includes(`data-sign="${sign}"`));
      assert.ok(svg.includes(`data-passenger-state="${passenger}"`));
    }
    const duringHours = await scene('roadside-04', mobile);
    assert.match(duringHours, /data-restriction-hours="8–20"/);
    assert.match(duringHours, /data-current-time="14:00"/);
    const afterHours = await scene('roadside-05', mobile);
    assert.match(afterHours, /data-current-time="21:00"/);
    assert.match(afterHours, /data-crosswalk-distance-m="3"/);
    assert.match(afterHours, /data-crosswalk="true"/);
    assert.match(await scene('roadside-06', mobile), /data-damage-detail="scratch"/);
    assert.doesNotMatch(await scene('roadside-06', mobile), /data-injured-person="true"/);
    assert.match(await scene('roadside-07', mobile), /data-injured-person="true"/);
    const controls = await scene('roadside-08', mobile);
    assert.match(controls, /data-gear="P" data-speed="0"/);
    assert.match(controls, /data-control="turn-signal" data-option="B"/);
  }
});
