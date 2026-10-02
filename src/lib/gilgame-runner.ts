export const RUNNER_HEIGHT = 260;
export const RUNNER_GROUND = 214;
export const RUNNER_STANDING_HEIGHT = 74;
export const RUNNER_DUCKING_HEIGHT = 50;
export const RUNNER_BEST_KEY = 'gilgame:runner:best:v1';
export type RunnerPhase = 'ready' | 'running' | 'paused' | 'over';
export type RunnerObstacle = {
  id: number;
  x: number;
  width: number;
  height: number;
  altitude: number;
  kind: 'crystal' | 'floating';
  passed: boolean;
};
export type RunnerState = {
  phase: RunnerPhase;
  width: number;
  elapsed: number;
  distance: number;
  score: number;
  best: number;
  height: number;
  velocity: number;
  ducking: boolean;
  cleared: number;
  nextSpawn: number;
  nextId: number;
  obstacles: RunnerObstacle[];
};
export function readRunnerBest(raw: string | null): number {
  if (!raw || !/^\d{1,8}$/.test(raw)) return 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value <= 10_000_000 ? value : 0;
}
export function runnerPlayerX(width: number) {
  return width < 600 ? 36 : 80;
}
export function createRunner(width = 720, best = 0): RunnerState {
  return {
    phase: 'ready',
    width: Math.max(320, Math.min(960, width)),
    elapsed: 0,
    distance: 0,
    score: 0,
    best: Number.isFinite(best) ? Math.max(0, Math.floor(best)) : 0,
    height: 0,
    velocity: 0,
    ducking: false,
    cleared: 0,
    nextSpawn: 0.85,
    nextId: 1,
    obstacles: [],
  };
}
export function jumpRunner(state: RunnerState) {
  if (state.phase === 'ready' || state.phase === 'over') {
    Object.assign(state, createRunner(state.width, state.best), {
      phase: 'running',
    });
  } else if (state.phase === 'paused') {
    state.phase = 'running';
  }
  if (state.phase !== 'running' || state.height > 0) return;
  state.ducking = false;
  state.velocity = 640;
}
export function duckRunner(state: RunnerState, pressed: boolean) {
  state.ducking = pressed && state.phase === 'running';
}
export function pauseRunner(state: RunnerState) {
  if (state.phase === 'running') {
    state.phase = 'paused';
    state.ducking = false;
  }
}
export function resumeRunner(state: RunnerState) {
  if (state.phase === 'paused') state.phase = 'running';
}
export function runnerSpeed(state: RunnerState) {
  const base = Math.max(180, Math.min(320, state.width * 0.47));
  return base * (1 + Math.min(0.8, state.elapsed / 75));
}
export function runnerCollides(state: RunnerState, obstacle: RunnerObstacle) {
  const playerHeight =
    state.ducking && state.height === 0
      ? RUNNER_DUCKING_HEIGHT
      : RUNNER_STANDING_HEIGHT;
  const player = {
    left: runnerPlayerX(state.width) + 9,
    right: runnerPlayerX(state.width) + 43,
    top: RUNNER_GROUND - state.height - playerHeight + 7,
    bottom: RUNNER_GROUND - state.height - 5,
  };
  const target = {
    left: obstacle.x + 4,
    right: obstacle.x + obstacle.width - 4,
    top: RUNNER_GROUND - obstacle.altitude - obstacle.height + 5,
    bottom: RUNNER_GROUND - obstacle.altitude - 2,
  };
  return (
    player.left < target.right &&
    player.right > target.left &&
    player.top < target.bottom &&
    player.bottom > target.top
  );
}
// The animation loop supplies fixed 1/120-second steps, so physics do not depend on screen refresh rate.
export function stepRunner(
  state: RunnerState,
  seconds: number,
  random = Math.random,
): RunnerPhase {
  if (state.phase !== 'running' || !Number.isFinite(seconds) || seconds <= 0)
    return state.phase;
  const dt = Math.min(seconds, 0.05);
  state.elapsed += dt;
  const speed = runnerSpeed(state);
  state.distance += speed * dt;
  state.score = Math.floor(state.elapsed * 10);
  state.best = Math.max(state.best, state.score);
  if (state.height > 0 || state.velocity > 0) {
    state.velocity -= (state.ducking ? 2600 : 1800) * dt;
    state.height = Math.max(0, state.height + state.velocity * dt);
    if (state.height === 0) state.velocity = 0;
  }
  state.nextSpawn -= dt;
  if (state.nextSpawn <= 0) {
    const floating = state.score >= 100 && random() < 0.3;
    const wide = !floating && state.score >= 180 && random() < 0.3;
    state.obstacles.push({
      id: state.nextId++,
      x: state.width + 20,
      width: floating ? 34 : wide ? 48 : 28,
      height: floating ? 28 : wide ? 46 : 36 + Math.floor(random() * 12),
      altitude: floating ? 55 : 0,
      kind: floating ? 'floating' : 'crystal',
      passed: false,
    });
    state.nextSpawn = 1.25 + random() * 0.65;
  }
  for (const obstacle of state.obstacles) {
    obstacle.x -= speed * dt;
    if (runnerCollides(state, obstacle)) {
      state.phase = 'over';
      state.ducking = false;
      return state.phase;
    }
    if (
      !obstacle.passed &&
      obstacle.x + obstacle.width < runnerPlayerX(state.width)
    ) {
      obstacle.passed = true;
      state.cleared++;
    }
  }
  state.obstacles = state.obstacles.filter(
    (obstacle) => obstacle.x + obstacle.width > -20,
  );
  return state.phase;
}
