import { describe, expect, it } from 'vitest';
import {
  createRunner,
  jumpRunner,
  duckRunner,
  pauseRunner,
  resumeRunner,
  stepRunner,
  runnerCollides,
  runnerSpeed,
  readRunnerBest,
  runnerPlayerX,
  type RunnerObstacle,
} from '../../src/lib/gilgame-runner';
const ground = (x: number): RunnerObstacle => ({
  id: 1,
  x,
  width: 28,
  height: 44,
  altitude: 0,
  kind: 'crystal',
  passed: false,
});
function advance(state: ReturnType<typeof createRunner>, seconds: number) {
  for (let i = 0; i < Math.round(seconds * 120); i++)
    stepRunner(state, 1 / 120, () => 0.5);
}
describe('Gilgame runner gameplay', () => {
  it('starts only on input and completes a jump without allowing a midair double jump', () => {
    const state = createRunner();
    stepRunner(state, 0.02);
    expect(state.score).toBe(0);
    jumpRunner(state);
    advance(state, 0.25);
    expect(state.phase).toBe('running');
    expect(state.height).toBeGreaterThan(90);
    const velocity = state.velocity;
    jumpRunner(state);
    expect(state.velocity).toBe(velocity);
    advance(state, 0.5);
    expect(state.height).toBe(0);
    expect(state.velocity).toBe(0);
  });
  it('collides with a grounded crystal but clears it at a sufficient jump height', () => {
    const state = createRunner();
    const crystal = ground(runnerPlayerX(state.width) + 14);
    expect(runnerCollides(state, crystal)).toBe(true);
    state.height = 70;
    expect(runnerCollides(state, crystal)).toBe(false);
    state.height = 0;
    jumpRunner(state);
    state.velocity = 0;
    state.obstacles = [crystal];
    stepRunner(state, 1 / 120);
    expect(state.phase).toBe('over');
  });
  it('allows ducking under floating crystals and releasing the duck', () => {
    const state = createRunner();
    state.phase = 'running';
    const floating = {
      ...ground(runnerPlayerX(state.width) + 14),
      kind: 'floating' as const,
      height: 28,
      altitude: 55,
    };
    expect(runnerCollides(state, floating)).toBe(true);
    duckRunner(state, true);
    expect(runnerCollides(state, floating)).toBe(false);
    duckRunner(state, false);
    expect(runnerCollides(state, floating)).toBe(true);
  });
  it('freezes scoring and obstacles while paused, then resumes', () => {
    const state = createRunner();
    jumpRunner(state);
    advance(state, 1);
    pauseRunner(state);
    const before = structuredClone(state);
    advance(state, 2);
    expect(state).toEqual(before);
    expect(state.ducking).toBe(false);
    resumeRunner(state);
    advance(state, 0.1);
    expect(state.elapsed).toBeGreaterThan(before.elapsed);
  });
  it('keeps the best score when restarting and removes old obstacles', () => {
    const state = createRunner(390, 80);
    jumpRunner(state);
    state.best = 100;
    state.phase = 'over';
    state.obstacles = [ground(10)];
    state.score = 70;
    jumpRunner(state);
    expect(state.best).toBe(100);
    expect(state.score).toBe(0);
    expect(state.obstacles).toEqual([]);
    expect(state.velocity).toBeGreaterThan(0);
  });
  it('ramps difficulty with a bounded speed and gives mobile players a lower initial speed', () => {
    const desktop = createRunner(960);
    const mobile = createRunner(320);
    expect(runnerSpeed(mobile)).toBeLessThan(runnerSpeed(desktop));
    const base = runnerSpeed(desktop);
    desktop.elapsed = 600;
    expect(runnerSpeed(desktop)).toBeCloseTo(base * 1.8);
  });
  it('introduces airborne obstacles after the opening and counts each cleared obstacle once', () => {
    const state = createRunner();
    state.phase = 'running';
    state.elapsed = 10.1;
    state.nextSpawn = 0;
    stepRunner(state, 1 / 120, () => 0);
    expect(state.obstacles[0].kind).toBe('floating');
    state.obstacles = [{ ...ground(runnerPlayerX(state.width) - 60) }];
    stepRunner(state, 1 / 120);
    stepRunner(state, 1 / 120);
    expect(state.cleared).toBe(1);
  });
  it('rejects invalid stored records and invalid frame durations', () => {
    for (const raw of ['-1', 'Infinity', 'NaN', '1.5', '10000001', '{}', ''])
      expect(readRunnerBest(raw)).toBe(0);
    expect(readRunnerBest('12345')).toBe(12345);
    const state = createRunner();
    jumpRunner(state);
    const before = structuredClone(state);
    stepRunner(state, Number.NaN);
    stepRunner(state, -10);
    expect(state).toEqual(before);
  });
});
