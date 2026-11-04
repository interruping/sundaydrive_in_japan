import { heroArt, sceneArt } from './art.js';
import { CATEGORIES, QUESTION_BY_ID, SOURCES } from './questions.js';
import { STORAGE_KEY, EXAM_LENGTH, PASS_SCORE, createExam, createReview, wrongQuestions, answerCurrent, nextQuestion, scoreAttempt, freshState, restoreState } from './engine.js';

const main = document.querySelector('#main');
const leaveDialog = document.querySelector('#leave-dialog');
const compactScene = matchMedia('(max-width: 700px)');
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const icon = (name, size = 24) => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 7a8 8 0 0 1 13-1L20 8M4 16l1.5 2a8 8 0 0 0 13-1"/>',
    book: '<path d="M12 6v15M3 4c3-1 6 0 9 2 3-2 6-3 9-2v14c-3-1-6 0-9 2-3-2-6-3-9-2Z"/>',
    external: '<path d="M14 4h6v6m0-6-10 10M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};

let storageAvailable = true;
let state;
try { state = restoreState(localStorage.getItem(STORAGE_KEY)); }
catch { state = freshState(); storageAvailable = false; }

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { storageAvailable = false; }
}

const mark = '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><rect width="40" height="40" rx="13" fill="currentColor"/><path d="M13 35V25c0-9 14-5 14-14V5" fill="none" stroke="#edf3ee" stroke-width="11"/><path d="M13 35V25c0-9 14-5 14-14V5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="3 3"/></svg>';

function homeView() {
  const hasProgress = state.attempt && state.attempt.index < state.attempt.items.length;
  return `<section class="home" aria-label="선데이 드라이브 홈">
    <div class="home-brand">
      <div class="hero-art">${heroArt()}</div>
      <h1 class="wordmark" tabindex="-1" aria-label="Sunday Drive, 일본 운전 연습"><span>Sunday</span><span>drive<span class="wordmark-dot">.</span></span></h1>
      <p class="brand-caption">일본 운전 연습</p>
    </div>
    <button class="button start-button" data-action="start"><span>${hasProgress ? '이어서 풀기' : '시작하기'}</span><span class="button-arrow">${icon('arrow')}</span></button>
  </section>`;
}

function header(right) {
  return `<header class="app-header"><button class="brand-button" data-action="home" aria-label="홈으로">${mark}<span>Sunday drive<span class="mini-dot">.</span></span></button>${right}</header>`;
}

function quizView() {
  const { attempt } = state;
  const item = attempt.items[attempt.index];
  const question = QUESTION_BY_ID.get(item.id);
  const answered = item.answer !== null;
  const correct = item.answer === question.answer;
  const count = attempt.items.length;
  const number = String(attempt.index + 1).padStart(2, '0');
  const progress = attempt.index + (answered ? 1 : 0);
  const source = SOURCES[question.source];
  return `<section class="quiz-shell">
    ${header(`<div class="question-count"><span>${attempt.mode === 'review' ? '오답 복습' : CATEGORIES[question.category]}</span><strong>${number}<span> / ${String(count).padStart(2, '0')}</span></strong></div>`)}
    <div class="progress-track" role="progressbar" aria-label="풀이 진행" aria-valuemin="0" aria-valuemax="${count}" aria-valuenow="${progress}"><span style="width:${progress / count * 100}%"></span></div>
    <div class="quiz-body">
      <div class="scene-frame">
        <div class="scene-legend"><span><i class="car-dot"></i> 내 차</span>${question.scene.nav ? '<span class="nav-hint">그림과 내비를 함께 봐 주세요</span>' : '<span class="nav-hint">그림 속 상황을 살펴보세요</span>'}</div>
        ${sceneArt({ ...question.scene, compact: compactScene.matches }, question.description)}
      </div>
      <div class="question-area">
        <div class="question-intro"><span class="question-badge">${attempt.mode === 'review' ? '다시 한 번' : '어떻게 할까요?'}</span>${attempt.mode === 'exam' ? '<span class="points-note">한 문제 5점</span>' : ''}</div>
        <h1 id="question-title" tabindex="-1">${escape(question.prompt)}</h1>
        <div class="choices" role="group" aria-labelledby="question-title">
          ${item.order.map((choice, index) => {
            const isCorrect = answered && choice === question.answer;
            const isWrong = answered && choice === item.answer && !correct;
            const chosen = item.answer === choice;
            return `<button class="choice ${isCorrect ? 'choice-correct' : ''} ${isWrong ? 'choice-wrong' : ''} ${answered && !isCorrect && !isWrong ? 'choice-muted' : ''}" data-action="answer" data-choice="${choice}" ${answered ? 'disabled' : ''} aria-pressed="${chosen}">
              <span class="choice-key">${isCorrect ? icon('check', 20) : isWrong ? icon('close', 20) : index + 1}</span>
              <span class="choice-text">${escape(question.choices[choice])}</span>
              ${answered && (isCorrect || chosen) ? `<span class="choice-tag">${isCorrect ? '정답' : '내 선택'}</span>` : ''}
            </button>`;
          }).join('')}
        </div>
        ${answered ? `<section class="feedback ${correct ? 'feedback-correct' : 'feedback-wrong'}" aria-labelledby="feedback-title">
          <div class="feedback-copy"><h2 id="feedback-title" tabindex="-1">${correct ? '맞았어요!' : '이 상황은 이렇게 기억해요.'}</h2><p>${escape(question.explanation)}</p>
          <a class="source-link" href="${source.url}" target="_blank" rel="noopener noreferrer">${escape(source.name)} ${icon('external', 13)}<span class="sr-only"> (새 창)</span></a></div>
          <button class="button next-button" data-action="next">${attempt.index === count - 1 ? '결과 보기' : '다음 문제'} ${icon('arrow', 22)}</button>
        </section>` : `<p class="quiz-note">${attempt.mode === 'review' ? '헷갈렸던 상황을 다시 익혀 봐요.' : `${EXAM_LENGTH}문제 중 18문제를 맞히면 통과해요.`}</p>`}
        ${!storageAvailable ? '<p class="storage-note" role="status">이 브라우저에서는 진행 상황이 저장되지 않아요. 창을 닫기 전에 끝까지 풀어 주세요.</p>' : ''}
      </div>
    </div>
  </section>`;
}

function resultView() {
  const { attempt } = state;
  const { correct, total, score, passed } = scoreAttempt(attempt);
  const mistakes = wrongQuestions(attempt);
  const reviewing = attempt.mode === 'review';
  const allReviewed = reviewing && mistakes.length === 0;
  const positive = reviewing ? allReviewed : passed;
  const heading = reviewing ? (allReviewed ? '이제 더 잘 알겠죠?' : '한 번 더 익혀 볼까요?') : (passed ? '일본 운전, 한 걸음 더 가까이!' : '조금만 더 연습해 볼까요?');
  const description = reviewing ? (allReviewed ? '헷갈렸던 상황을 모두 맞혔어요.' : `${mistakes.length}가지 상황을 다시 살펴보면 좋아요.`) : (passed ? '오늘 익힌 규칙을 기억하고, 안전하게 다녀오세요.' : '틀린 상황을 익히고 다시 도전해 보세요.');
  const categories = Object.entries(CATEGORIES).map(([key, name]) => {
    const items = attempt.items.filter(item => QUESTION_BY_ID.get(item.id).category === key);
    if (!items.length) return '';
    const correctCount = items.filter(item => item.answer === QUESTION_BY_ID.get(item.id).answer).length;
    return `<li><span>${name}</span><span class="category-dots" aria-label="${items.length}문제 중 ${correctCount}개 정답">${items.map(item => `<i class="${item.answer === QUESTION_BY_ID.get(item.id).answer ? 'dot-correct' : 'dot-wrong'}"></i>`).join('')}</span><strong>${correctCount}<span> / ${items.length}</span></strong></li>`;
  }).join('');
  return `<section class="result-shell">
    ${header('<span class="result-header-label">' + (reviewing ? '복습 결과' : '오늘의 드라이브') + '</span>')}
    <div class="result-content">
      <div class="result-stamp ${positive ? 'stamp-pass' : 'stamp-practice'}" aria-hidden="true"><div>${positive ? icon('check', 40) : icon('refresh', 37)}<span>${reviewing ? '한 번 더 성장' : positive ? '준비 완료' : '연습 중'}</span></div><span class="stamp-star star-one">✦</span><span class="stamp-star star-two">✦</span></div>
      <span class="result-label">${reviewing ? '오답 복습 완료' : passed ? '통과했어요' : `${PASS_SCORE}점부터 통과예요`}</span>
      <div class="score"><strong>${reviewing ? correct : score}</strong><span>${reviewing ? ` / ${total}개` : '점'}</span></div>
      <h1 tabindex="-1">${heading}</h1><p class="result-description">${description}</p>
      <div class="result-details"><div class="details-heading"><span>${reviewing ? '다시 풀어본 상황' : '내가 익힌 운전 규칙'}</span><strong>${correct} / ${total} 정답</strong></div><ul>${categories}</ul></div>
      <div class="result-actions">
        ${mistakes.length ? `<button class="button" data-action="review">${icon('book', 22)} ${reviewing ? '남은 오답 다시 풀기' : '틀린 문제 복습하기'}<span class="count-pill">${mistakes.length}</span></button>` : ''}
        <button class="button ${mistakes.length ? 'button-secondary' : ''}" data-action="retry">${icon('refresh', 22)} ${reviewing ? '새 시험 보기' : '다시 시험 보기'}</button>
        ${reviewing && state.lastExam ? '<button class="text-button" data-action="exam-result">시험 결과로 돌아가기</button>' : ''}
      </div>
      <p class="result-footnote">일반 승용차 기준의 학습 퀴즈예요.<br>실제 도로에서는 현장 신호와 표지, 경찰의 지시를 따라요.</p>
    </div>
  </section>`;
}

function render({ focus = false, feedback = false } = {}) {
  document.body.dataset.screen = state.screen;
  main.innerHTML = state.screen === 'home' ? homeView() : state.screen === 'quiz' ? quizView() : resultView();
  const titles = { home: '선데이 드라이브 · 일본 운전 연습', quiz: `${state.attempt?.mode === 'review' ? '오답 복습' : '운전 연습'} · 선데이 드라이브`, result: '결과 · 선데이 드라이브' };
  document.title = titles[state.screen];
  if (focus) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.querySelector('h1')?.focus({ preventScroll: true });
  }
  if (feedback) {
    const message = main.querySelector('#feedback-title');
    message?.focus({ preventScroll: true });
    const region = main.querySelector('.feedback');
    if (region && region.getBoundingClientRect().bottom > window.innerHeight) {
      region.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }
}

function beginExam() {
  const previous = state.lastExam || (state.attempt?.mode === 'exam' ? state.attempt : null);
  state.attempt = createExam(previous?.items.map(item => item.id) || []);
  state.screen = 'quiz';
  save(); render({ focus: true });
}

function answer(choice) {
  if (state.screen !== 'quiz') return;
  const next = answerCurrent(state.attempt, choice);
  if (next === state.attempt) return;
  state.attempt = next;
  save(); render({ feedback: true });
}

main.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  switch (button.dataset.action) {
    case 'start':
      if (state.attempt && state.attempt.index < state.attempt.items.length) {
        state.screen = 'quiz'; save(); render({ focus: true });
      } else beginExam();
      break;
    case 'answer': answer(Number(button.dataset.choice)); break;
    case 'next':
      state.attempt = nextQuestion(state.attempt);
      if (state.attempt.index === state.attempt.items.length) {
        state.screen = 'result';
        if (state.attempt.mode === 'exam') state.lastExam = structuredClone(state.attempt);
      }
      save(); render({ focus: true }); break;
    case 'retry': beginExam(); break;
    case 'review':
      state.attempt = createReview(state.attempt);
      state.screen = 'quiz'; save(); render({ focus: true }); break;
    case 'exam-result':
      state.attempt = structuredClone(state.lastExam);
      state.screen = 'result'; save(); render({ focus: true }); break;
    case 'home':
      if (state.screen === 'quiz') { leaveDialog.returnValue = ''; leaveDialog.showModal(); }
      else { state.screen = 'home'; save(); render({ focus: true }); }
      break;
  }
});

leaveDialog.addEventListener('close', () => {
  if (leaveDialog.returnValue === 'leave') {
    state.screen = 'home'; save(); render({ focus: true });
  }
});

document.addEventListener('keydown', event => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || leaveDialog.open || state.screen !== 'quiz') return;
  if (event.key === '1' || event.key === '2') {
    event.preventDefault();
    answer(state.attempt.items[state.attempt.index].order[Number(event.key) - 1]);
  }
});

compactScene.addEventListener('change', () => { if (state.screen === 'quiz') render(); });
render();
