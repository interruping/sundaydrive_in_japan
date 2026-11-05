import { mkdir, writeFile } from 'node:fs/promises';
import { QUESTIONS, RETIRED_QUESTIONS } from '../dist/questions.js';
import { sceneArt } from '../dist/art.js';
import { entryScene, laneScene } from './scene-parts/entry-lanes.js';
import { priorityScene } from './scene-parts/priority.js';
import { deepTurnScene } from './scene-parts/deep-turn.js';
import { roadRuleScene } from './scene-parts/road-rules.js';

const directory = new URL('../dist/scenes/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const question of [...QUESTIONS, ...RETIRED_QUESTIONS]) {
  const render = question.scene.kind === 'road-rule' ? roadRuleScene : question.scene.kind === 'deep-intersection' ? deepTurnScene : question.scene.kind === 'entry' ? entryScene : question.scene.kind === 'lane-junction' ? laneScene : question.scene.kind === 'priority' ? priorityScene : sceneArt;
  for (const mobile of [false, true]) {
    const source = render({ ...question.scene, questionId: question.id, compact: mobile, mobile }, question.description);
    const svg = source.replace('<svg ', `<svg data-question-id="${question.id}" `);
    await writeFile(new URL(`${question.id}${mobile ? '.mobile' : ''}.svg`, directory), svg);
  }
}
console.log(`Generated ${QUESTIONS.length} active and ${RETIRED_QUESTIONS.length} historical question pictures in desktop and mobile layouts.`);
