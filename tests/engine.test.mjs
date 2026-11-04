import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, QUESTION_BY_ID, CATEGORIES, SOURCES, EXAM_QUOTAS } from '../dist/questions.js';
import { EXAM_LENGTH, REQUIRED_TOPICS, createExam, createReview, answerCurrent, nextQuestion, scoreAttempt, isValidAttempt, freshState, restoreState } from '../dist/engine.js';

function complete(attempt, rightCount) {
  let result = attempt;
  for (let index = 0; index < attempt.items.length; index++) {
    const question = QUESTION_BY_ID.get(result.items[index].id);
    result = nextQuestion(answerCurrent(result, index < rightCount ? question.answer : 1 - question.answer));
  }
  return result;
}

test('60 distinct scenarios each have a picture, two choices, explanation and an official source', () => {
  assert.equal(QUESTIONS.length, 60);
  assert.equal(QUESTION_BY_ID.size, 60);
  assert.equal(new Set(QUESTIONS.map(q => q.prompt)).size, 60);
  for (const q of QUESTIONS) {
    assert.ok(CATEGORIES[q.category]);
    assert.equal(q.choices.length, 2);
    assert.notEqual(q.choices[0], q.choices[1]);
    assert.ok([0, 1].includes(q.answer));
    assert.ok(q.scene.kind && q.description && q.explanation);
    for (const key of q.sources) assert.match(SOURCES[key].url, /^https:\/\/(www\.npa\.go\.jp|www\.qsr\.mlit\.go\.jp|www\.police\.pref\.[a-z]+\.(jp|lg\.jp)|www\.pref\.hiroshima\.lg\.jp|laws\.e-gov\.go\.jp|jaf\.or\.jp|jafmate\.jp)\//);
  }
  assert.ok(QUESTIONS.filter(q => q.scene.nav).length >= 8);
});

test('exam draws 20 unique questions covering every category and shuffles answer positions', () => {
  const firstChoices = new Set();
  const questionSets = new Set();
  for (let i = 0; i < 100; i++) {
    const exam = createExam();
    assert.ok(isValidAttempt(exam));
    assert.equal(exam.items.length, EXAM_LENGTH);
    assert.equal(new Set(exam.items.map(item => item.id)).size, 20);
    for (const category of Object.keys(CATEGORIES)) {
      const count = exam.items.filter(item => QUESTION_BY_ID.get(item.id).category === category).length;
      assert.equal(count, EXAM_QUOTAS[category]);
    }
    exam.items.forEach(item => firstChoices.add(item.order[0]));
    questionSets.add(exam.items.map(item => item.id).sort().join(','));
    for (const topic of REQUIRED_TOPICS) {
      assert.ok(exam.items.map(item => QUESTION_BY_ID.get(item.id)).filter(q => q.category === topic.category && topic.matches(q)).length >= topic.count);
    }
  }
  assert.equal(firstChoices.size, 2);
  assert.ok(questionSets.size > 95);
});

test('retry guarantees a different set even with the same random sequence', () => {
  const exam = createExam([], () => 0.5);
  const next = createExam(exam.items.map(item => item.id), () => 0.5);
  assert.notDeepEqual(exam.items.map(item => item.id).sort(), next.items.map(item => item.id).sort());
});

test('a question cannot be skipped or answered twice', () => {
  const exam = createExam();
  assert.equal(nextQuestion(exam), exam);
  const answered = answerCurrent(exam, 0);
  assert.equal(answerCurrent(answered, 1), answered);
  assert.equal(nextQuestion(answered).index, 1);
  assert.throws(() => answerCurrent(exam, 2), RangeError);
});

test('18 correct is 90 and passes; 17 correct is 85 and fails', () => {
  assert.deepEqual(scoreAttempt(complete(createExam(), 18)), { correct: 18, total: 20, score: 90, passed: true });
  assert.deepEqual(scoreAttempt(complete(createExam(), 17)), { correct: 17, total: 20, score: 85, passed: false });
  assert.equal(scoreAttempt(complete(createExam(), 20)).score, 100);
  assert.equal(scoreAttempt(complete(createExam(), 0)).score, 0);
});

test('review contains only mistakes and leaves the original exam score untouched', () => {
  const exam = complete(createExam(), 17);
  const snapshot = JSON.stringify(exam);
  const review = createReview(exam);
  assert.equal(review.mode, 'review');
  assert.equal(review.items.length, 3);
  assert.deepEqual(new Set(review.items.map(item => item.id)), new Set(exam.items.slice(17).map(item => item.id)));
  assert.ok(review.items.every(item => item.answer === null));
  assert.ok(isValidAttempt(review));
  complete(review, 3);
  assert.equal(JSON.stringify(exam), snapshot);
  assert.equal(createReview(complete(createExam(), 20)), null);
});

test('reload restores the exact in-progress question, choice order, and revealed answer', () => {
  let attempt = nextQuestion(answerCurrent(createExam(), 1));
  attempt = answerCurrent(attempt, 0);
  const state = { ...freshState(), screen: 'quiz', attempt };
  assert.deepEqual(restoreState(JSON.stringify(state)), state);
  const exam = complete(createExam(), 18);
  const finished = { ...freshState(), screen: 'result', attempt: exam, lastExam: exam };
  assert.deepEqual(restoreState(JSON.stringify(finished)), finished);
});

test('corrupt, stale, mismatched and tampered saves recover safely', () => {
  for (const raw of ['{', 'null', '{}', '[]', JSON.stringify({ ...freshState(), bankVersion: 'old' })]) {
    assert.deepEqual(restoreState(raw), freshState());
  }
  const baseline = { ...freshState(), screen: 'quiz', attempt: createExam() };
  const changes = [
    state => { state.attempt.items[0].id = 'missing'; },
    state => { state.attempt.index = 99; },
    state => { state.attempt.items[0].order = [0, 0]; },
    state => { state.attempt.items[4].answer = 1; },
    state => { state.attempt.index = 1; },
    state => { state.attempt.items[0] = null; },
    state => { state.attempt.items.pop(); },
    state => { state.screen = 'result'; },
    state => { state.lastExam = createExam(); },
  ];
  for (const mutate of changes) {
    const state = structuredClone(baseline);
    mutate(state);
    assert.deepEqual(restoreState(JSON.stringify(state)), freshState());
  }
});
