import { BANK_VERSION, CATEGORIES, QUESTIONS, QUESTION_BY_ID } from './questions.js';

export const EXAM_LENGTH = 20;
export const PASS_SCORE = 90;
export const STORAGE_KEY = 'sunday-drive:progress';

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
  const categories = shuffle(Object.keys(CATEGORIES), random);
  const selected = categories.flatMap((category, index) =>
    shuffle(QUESTIONS.filter(question => question.category === category), random).slice(0, index < 2 ? 4 : 3));
  const previousSet = new Set(previousIds);
  if (selected.every(question => previousSet.has(question.id))) {
    const replacement = QUESTIONS.find(question => question.category === selected[0].category && !previousSet.has(question.id));
    if (replacement) selected[0] = replacement;
  }
  return makeAttempt(selected, 'exam', random);
}

export function wrongQuestions(attempt) {
  return attempt.items.filter(item => item.answer !== null && item.answer !== QUESTION_BY_ID.get(item.id).answer).map(item => QUESTION_BY_ID.get(item.id));
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
  return { version: 1, bankVersion: BANK_VERSION, screen: 'home', attempt: null, lastExam: null };
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
    if (!state || state.version !== 1 || state.bankVersion !== BANK_VERSION) return freshState();
    if (!['home', 'quiz', 'result'].includes(state.screen)) return freshState();
    if (state.attempt !== null && !isValidAttempt(state.attempt)) return freshState();
    if (state.lastExam !== null && (!isValidAttempt(state.lastExam) || state.lastExam.mode !== 'exam' || state.lastExam.index !== state.lastExam.items.length)) return freshState();
    if (state.screen !== 'home' && !state.attempt) return freshState();
    if (state.screen === 'quiz' && state.attempt.index === state.attempt.items.length) return freshState();
    if (state.screen === 'result' && state.attempt.index !== state.attempt.items.length) return freshState();
    return { version: 1, bankVersion: BANK_VERSION, screen: state.screen, attempt: state.attempt, lastExam: state.lastExam };
  } catch {
    return freshState();
  }
}
