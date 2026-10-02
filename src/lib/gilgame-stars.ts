export const STARS_BEST_KEY = 'gilgame:stars:best:v1';
export const STARS_DURATION = 30;
export const STAR_FALL_SECONDS = 2.6;
export const STARS_POINTS = 10;
const MAX_BEST = 10_000_000;
const FRAME_LIMIT = 0.05;
const TIME_EPSILON = 1e-9;

export type StarLane = 0 | 1 | 2;
export type StarsPhase = 'ready' | 'running' | 'paused' | 'over';
export type FallingStar = {
  id: number;
  lane: StarLane;
  progress: number;
};
export type StarsState = {
  phase: StarsPhase;
  elapsed: number;
  score: number;
  best: number;
  lane: StarLane;
  star: FallingStar | null;
  nextId: number;
  caught: number;
  missed: number;
};

function boundedBest(best: number) {
  return Number.isFinite(best)
    ? Math.min(MAX_BEST, Math.max(0, Math.floor(best)))
    : 0;
}

export function readStarsBest(raw: string | null): number {
  const value = raw?.trim();
  if (!value || !/^\d{1,8}$/.test(value)) return 0;
  const best = Number(value);
  return Number.isSafeInteger(best) && best <= MAX_BEST ? best : 0;
}

export function createStars(best = 0): StarsState {
  return {
    phase: 'ready',
    elapsed: 0,
    score: 0,
    best: boundedBest(best),
    lane: 1,
    star: null,
    nextId: 1,
    caught: 0,
    missed: 0,
  };
}

export function startStars(state: StarsState) {
  if (state.phase !== 'ready' && state.phase !== 'over') return;
  Object.assign(state, createStars(state.best), { phase: 'running' });
  state.star = { id: state.nextId++, lane: 1, progress: 0 };
}

export function selectStarsLane(state: StarsState, lane: StarLane) {
  if (state.phase === 'running' && (lane === 0 || lane === 1 || lane === 2))
    state.lane = lane;
}

export function moveStars(state: StarsState, direction: -1 | 1) {
  if (direction !== -1 && direction !== 1) return;
  selectStarsLane(
    state,
    Math.max(0, Math.min(2, state.lane + direction)) as StarLane,
  );
}

export function pauseStars(state: StarsState) {
  if (state.phase === 'running') state.phase = 'paused';
}

export function resumeStars(state: StarsState) {
  if (state.phase === 'paused') state.phase = 'running';
}

function randomLane(random: () => number): StarLane {
  const value = random();
  return Number.isFinite(value)
    ? (Math.max(0, Math.min(2, Math.floor(value * 3))) as StarLane)
    : 1;
}

// A large frame must not skip a star. The UI pauses when its tab is hidden.
export function stepStars(
  state: StarsState,
  seconds: number,
  random = Math.random,
): StarsPhase {
  if (state.phase !== 'running' || !Number.isFinite(seconds) || seconds <= 0)
    return state.phase;

  const dt = Math.min(
    seconds,
    FRAME_LIMIT,
    Math.max(0, STARS_DURATION - state.elapsed),
  );
  state.elapsed = Math.min(STARS_DURATION, state.elapsed + dt);
  let remaining = dt;

  while (state.star && remaining > 0) {
    const fallRemaining = (1 - state.star.progress) * STAR_FALL_SECONDS;
    if (remaining + TIME_EPSILON < fallRemaining) {
      state.star.progress += remaining / STAR_FALL_SECONDS;
      break;
    }

    remaining = Math.max(0, remaining - fallRemaining);
    if (state.star.lane === state.lane) {
      state.caught++;
      state.score += STARS_POINTS;
      state.best = Math.max(state.best, state.score);
    } else {
      state.missed++;
    }
    state.star = {
      id: state.nextId++,
      lane: randomLane(random),
      progress: 0,
    };
  }

  if (state.elapsed + TIME_EPSILON >= STARS_DURATION) {
    state.elapsed = STARS_DURATION;
    state.phase = 'over';
    state.star = null;
  }
  return state.phase;
}
