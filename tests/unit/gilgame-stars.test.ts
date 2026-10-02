import { describe, expect, it } from 'vitest';
import {
  createStars,
  startStars,
  selectStarsLane,
  moveStars,
  pauseStars,
  resumeStars,
  stepStars,
  readStarsBest,
  STAR_FALL_SECONDS,
  STARS_DURATION,
  STARS_POINTS,
  type StarsState,
} from '../../src/lib/gilgame-stars';

function advance(state: StarsState, seconds: number, random = () => 0.5) {
  for (let i = 0; i < Math.round(seconds * 120); i++)
    stepStars(state, 1 / 120, random);
}

describe('Gilgame star catching gameplay', () => {
  it('waits for an explicit start and gives the first center star a full descent', () => {
    const state = createStars();
    moveStars(state, -1);
    selectStarsLane(state, 2);
    stepStars(state, 0.05);
    expect(state).toMatchObject({
      phase: 'ready',
      lane: 1,
      elapsed: 0,
      star: null,
    });
    startStars(state);
    expect(state.star).toEqual({ id: 1, lane: 1, progress: 0 });
    advance(state, STAR_FALL_SECONDS - 0.05);
    expect(state.score).toBe(0);
    expect(state.star?.progress).toBeLessThan(1);
    advance(state, 0.05);
    expect(state.score).toBe(STARS_POINTS);
    expect(state.caught).toBe(1);
    expect(state.star).toMatchObject({ id: 2, lane: 1 });
    expect(state.star?.progress).toBeCloseTo(0);
  });

  it('spawns one star at a time in injected random lanes and counts catches once', () => {
    const state = createStars();
    startStars(state);
    advance(state, STAR_FALL_SECONDS, () => 0);
    expect(state.star?.lane).toBe(0);
    selectStarsLane(state, 0);
    advance(state, STAR_FALL_SECONDS, () => 0.999);
    expect(state).toMatchObject({ score: 20, caught: 2, missed: 0 });
    expect(state.star).toMatchObject({ id: 3, lane: 2 });
    stepStars(state, 1 / 120);
    expect(state.score).toBe(20);
  });

  it('keeps the round running after a miss without deducting points', () => {
    const state = createStars();
    startStars(state);
    advance(state, STAR_FALL_SECONDS, () => 0);
    advance(state, STAR_FALL_SECONDS, () => 0.999);
    expect(state).toMatchObject({
      phase: 'running',
      score: 10,
      caught: 1,
      missed: 1,
    });
    selectStarsLane(state, 2);
    advance(state, STAR_FALL_SECONDS);
    expect(state).toMatchObject({ score: 20, caught: 2, missed: 1 });
  });

  it('bounds movement to the three lanes without restarting an active round', () => {
    const state = createStars();
    startStars(state);
    moveStars(state, -1);
    moveStars(state, -1);
    expect(state.lane).toBe(0);
    moveStars(state, 1);
    moveStars(state, 1);
    moveStars(state, 1);
    expect(state.lane).toBe(2);
    advance(state, 1);
    const before = structuredClone(state);
    startStars(state);
    expect(state).toEqual(before);
  });

  it('freezes the timer, star and movement while paused and resumes the same round', () => {
    const state = createStars();
    startStars(state);
    advance(state, 1);
    pauseStars(state);
    const before = structuredClone(state);
    selectStarsLane(state, 0);
    advance(state, 5);
    expect(state).toEqual(before);
    startStars(state);
    expect(state).toEqual(before);
    resumeStars(state);
    advance(state, 0.1);
    expect(state.elapsed).toBeCloseTo(1.1);
    expect(state.star?.progress).toBeGreaterThan(before.star!.progress);
  });

  it('ends at thirty seconds, clears the falling star and stops further scoring', () => {
    const state = createStars();
    startStars(state);
    advance(state, STARS_DURATION);
    expect(state).toMatchObject({
      phase: 'over',
      elapsed: 30,
      star: null,
      score: 110,
      caught: 11,
    });
    const before = structuredClone(state);
    advance(state, 5);
    moveStars(state, 1);
    expect(state).toEqual(before);
  });

  it('limits the final frame to time left so a star after the deadline cannot score', () => {
    const state = createStars();
    startStars(state);
    state.elapsed = STARS_DURATION - 0.01;
    state.star!.progress = 1 - 0.02 / STAR_FALL_SECONDS;
    stepStars(state, 0.05);
    expect(state).toMatchObject({
      phase: 'over',
      elapsed: 30,
      star: null,
      score: 0,
      caught: 0,
    });
  });

  it('retains the best record while resetting the lane, timer and catches on replay', () => {
    const state = createStars(60);
    startStars(state);
    advance(state, STARS_DURATION);
    selectStarsLane(state, 0);
    startStars(state);
    expect(state).toMatchObject({
      phase: 'running',
      elapsed: 0,
      lane: 1,
      score: 0,
      best: 110,
      caught: 0,
      missed: 0,
    });
    expect(state.star).toEqual({ id: 1, lane: 1, progress: 0 });
  });

  it('ignores invalid frame durations and caps large frames to avoid skipped stars', () => {
    const state = createStars();
    startStars(state);
    const before = structuredClone(state);
    for (const seconds of [0, -1, Number.NaN, Infinity])
      stepStars(state, seconds);
    expect(state).toEqual(before);
    stepStars(state, 30);
    expect(state.elapsed).toBe(0.05);
    expect(state.star?.progress).toBeCloseTo(0.05 / STAR_FALL_SECONDS);
    expect(state.score).toBe(0);
  });

  it('accepts bounded whole-number records and rejects corrupt stored values', () => {
    expect(readStarsBest(null)).toBe(0);
    expect(readStarsBest(' 90 ')).toBe(90);
    expect(readStarsBest('10000000')).toBe(10_000_000);
    for (const raw of [
      '',
      '-1',
      '1.5',
      'Infinity',
      'NaN',
      '{}',
      '10000001',
      '1e2',
    ])
      expect(readStarsBest(raw)).toBe(0);
    expect(createStars(-10).best).toBe(0);
    expect(createStars(Infinity).best).toBe(0);
    expect(createStars(20.9).best).toBe(20);
    expect(createStars(20_000_000).best).toBe(10_000_000);
  });
});
