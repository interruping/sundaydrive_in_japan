import { BANK_VERSION, COMPATIBLE_BANK_VERSIONS, EXAM_QUOTAS, QUESTIONS, QUESTION_BY_ID } from './questions.js';

export const EXAM_LENGTH = 20;
export const PASS_SCORE = 90;
export const STORAGE_KEY = 'sunday-drive:progress';

// Core confusions are covered in every exam, not left to chance.
export const REQUIRED_TOPICS = [
  { category: 'signals', count: 2, matches: q => q.scene.arrows?.length >= 2 },
  { category: 'turns', count: 1, matches: q => q.id === 'turn-01' },
  { category: 'turns', count: 1, matches: q => q.id === 'turn-02' },
  { category: 'entry', count: 1, matches: q => q.id === 'entry-01' },
  { category: 'entry', count: 1, matches: q => q.scene.sign === 'no-crossing' },
  { category: 'lanes', count: 1, matches: q => q.scene.kind === 'lane-junction' },
  { category: 'railway', count: 1, matches: q => q.scene.signalScope === 'crossing' },
  // A signal beyond the railway belongs to a separate junction; it does not
  // control the crossing or exempt its stop. Include that confusion here too.
  { category: 'railway', count: 1, matches: q => q.scene.signalScope !== 'crossing' },
];

const coversTopics = questions => REQUIRED_TOPICS.every(topic => questions.filter(q => q.category === topic.category && topic.matches(q)).length >= topic.count);

export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeAttempt(questions, mode, random) {
  return {
    mode,
    index: 0,
    items: shuffle(questions, random).map(question => ({ id: question.id, order: shuffle([0, 1], random), answer: null })),
  };
}

export function createExam(previousIds = [], random = Math.random) {
  const selected = Object.entries(EXAM_QUOTAS).flatMap(([category, count]) => {
    const pool = QUESTIONS.filter(question => question.category === category);
    const chosen = [];
    for (const topic of REQUIRED_TOPICS.filter(topic => topic.category === category)) {
      const needed = topic.count - chosen.filter(topic.matches).length;
      chosen.push(...shuffle(pool.filter(q => !chosen.includes(q) && topic.matches(q)), random).slice(0, Math.max(0, needed)));
    }
    return [...chosen, ...shuffle(pool.filter(q => !chosen.includes(q)), random).slice(0, count - chosen.length)];
  });
  const previousSet = new Set(previousIds);
  if (selected.every(question => previousSet.has(question.id))) {
    outer: for (let index = 0; index < selected.length; index++) {
      for (const replacement of QUESTIONS.filter(q => q.category === selected[index].category && !previousSet.has(q.id))) {
        const candidate = selected.map((q, i) => i === index ? replacement : q);
        if (coversTopics(candidate)) { selected[index] = replacement; break outer; }
      }
    }
  }
  return makeAttempt(selected, 'exam', random);
}

export function wrongQuestions(attempt) {
  return attempt.items.filter(item => item.answer !== null && item.answer !== QUESTION_BY_ID.get(item.id).answer).map(item => QUESTION_BY_ID.get(item.id));
}

export function correctAnswers(attempt) {
  return attempt.items.filter(item => item.answer === QUESTION_BY_ID.get(item.id).answer);
}

export function createReview(exam, random = Math.random) {
  const mistakes = wrongQuestions(exam);
  return mistakes.length ? makeAttempt(mistakes, 'review', random) : null;
}

export function answerCurrent(attempt, answer) {
  if (![0, 1].includes(answer)) throw new RangeError('Choose one of the two answers.');
  const current = attempt.items[attempt.index];
  if (!current || current.answer !== null) return attempt;
  return { ...attempt, items: attempt.items.map((item, index) => index === attempt.index ? { ...item, answer } : item) };
}

export function nextQuestion(attempt) {
  const current = attempt.items[attempt.index];
  if (!current || current.answer === null) return attempt;
  return { ...attempt, index: attempt.index + 1 };
}

export function scoreAttempt(attempt) {
  const correct = attempt.items.filter(item => item.answer === QUESTION_BY_ID.get(item.id).answer).length;
  const score = Math.round(correct / attempt.items.length * 100);
  return { correct, total: attempt.items.length, score, passed: score >= PASS_SCORE };
}

export function freshState() {
  return { version: 1, bankVersion: BANK_VERSION, screen: 'home', attempt: null, lastExam: null, correctReviewIndex: 0 };
}

export function isValidAttempt(attempt) {
  if (!attempt || !['exam', 'review'].includes(attempt.mode) || !Array.isArray(attempt.items)) return false;
  const { items, index, mode } = attempt;
  if (mode === 'exam' && items.length !== EXAM_LENGTH) return false;
  if (mode === 'review' && (items.length < 1 || items.length > EXAM_LENGTH)) return false;
  if (!Number.isInteger(index) || index < 0 || index > items.length) return false;
  if (new Set(items.map(item => item?.id)).size !== items.length) return false;
  return items.every((item, i) => {
    if (!item || !QUESTION_BY_ID.has(item.id) || !Array.isArray(item.order) || item.order.length !== 2) return false;
    if (!((item.order[0] === 0 && item.order[1] === 1) || (item.order[0] === 1 && item.order[1] === 0))) return false;
    if (![null, 0, 1].includes(item.answer)) return false;
    if (i < index && item.answer === null) return false;
    if (i > index && item.answer !== null) return false;
    return true;
  });
}

export function restoreState(raw) {
  try {
    const state = JSON.parse(raw);
    if (!state || state.version !== 1 || (state.bankVersion !== BANK_VERSION && !COMPATIBLE_BANK_VERSIONS.includes(state.bankVersion))) return freshState();
    if (!['home', 'quiz', 'result', 'correct-review'].includes(state.screen)) return freshState();
    if (state.attempt !== null && !isValidAttempt(state.attempt)) return freshState();
    if (state.lastExam !== null && (!isValidAttempt(state.lastExam) || state.lastExam.mode !== 'exam' || state.lastExam.index !== state.lastExam.items.length)) return freshState();
    if (state.screen !== 'home' && !state.attempt) return freshState();
    if (state.screen === 'quiz' && state.attempt.index === state.attempt.items.length) return freshState();
    if (state.screen === 'result' && state.attempt.index !== state.attempt.items.length) return freshState();
    const correctReviewIndex = state.correctReviewIndex ?? 0;
    if (state.screen === 'correct-review' && (state.attempt.index !== state.attempt.items.length || !Number.isInteger(correctReviewIndex) || correctReviewIndex < 0 || correctReviewIndex >= correctAnswers(state.attempt).length)) return freshState();
    return { version: 1, bankVersion: BANK_VERSION, screen: state.screen, attempt: state.attempt, lastExam: state.lastExam, correctReviewIndex: state.screen === 'correct-review' ? correctReviewIndex : 0 };
  } catch {
    return freshState();
  }
}
