import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createRunner } from '../../src/lib/gilgame-runner';
import {
  createRunnerAnimation,
  selectRunnerFrame,
  runnerAtlas,
  runnerSpriteScale,
} from '../../src/lib/gilgame-runner-animation';
describe('Generated runner animation', () => {
  it('uses 18 full-body source rectangles inside the shipped transparent PNG', () => {
    const png = readFileSync(
      new URL('../../public/game/gilgame-runner-sheet.png', import.meta.url),
    );
    expect(png.readUInt32BE(16)).toBe(runnerAtlas.width);
    expect(png.readUInt32BE(20)).toBe(runnerAtlas.height);
    expect(png[25]).toBe(6);
    for (const clip of Object.values(runnerAtlas.clips)) {
      expect(clip).toHaveLength(6);
      for (const frame of clip) {
        expect(frame.x).toBeGreaterThanOrEqual(0);
        expect(frame.y).toBeGreaterThanOrEqual(0);
        expect(frame.x + frame.width).toBeLessThanOrEqual(runnerAtlas.width);
        expect(frame.y + frame.height).toBeLessThanOrEqual(runnerAtlas.height);
        expect(frame.pivotY).toBeLessThan(frame.height);
        expect(frame.pivotY).toBeGreaterThan(frame.height * 0.95);
      }
    }
    // Source poses retain their aspect ratio; a crouch is a genuinely lower silhouette.
    expect(
      runnerAtlas.clips.duck[0].pivotY * runnerSpriteScale('duck'),
    ).toBeLessThan(51);
    expect(
      runnerAtlas.clips.run[0].pivotY * runnerSpriteScale('run'),
    ).toBeGreaterThan(70);
  });
  it('selects takeoff, rising, apex, falling, and landing based on jump physics', () => {
    const game = createRunner();
    game.phase = 'running';
    const animation = createRunnerAnimation();
    for (const [height, velocity, expected] of [
      [0, 640, 0],
      [70, 430, 1],
      [95, 180, 2],
      [110, 0, 3],
      [75, -360, 4],
      [10, -600, 5],
    ]) {
      game.height = height;
      game.velocity = velocity;
      expect(selectRunnerFrame(game, animation)).toEqual({
        clip: 'jump',
        index: expected,
      });
    }
    game.height = 0;
    game.velocity = 0;
    game.elapsed = 1;
    expect(selectRunnerFrame(game, animation)).toEqual({
      clip: 'jump',
      index: 5,
    });
    game.elapsed += 0.1;
    expect(selectRunnerFrame(game, animation).clip).toBe('run');
  });
  it('loops articulated run and duck poses while freezing paused and reduced-motion cycles', () => {
    const game = createRunner();
    game.phase = 'running';
    const animation = createRunnerAnimation();
    game.distance = 60;
    const running = selectRunnerFrame(game, animation);
    expect(running.index).toBeGreaterThan(0);
    game.phase = 'paused';
    game.distance = 200;
    expect(selectRunnerFrame(game, animation)).toEqual(running);
    game.phase = 'running';
    game.ducking = true;
    expect(selectRunnerFrame(game, animation).clip).toBe('duck');
    expect(selectRunnerFrame(game, animation, true)).toEqual({
      clip: 'duck',
      index: 0,
    });
    game.ducking = false;
    expect(selectRunnerFrame(game, animation, true)).toEqual({
      clip: 'run',
      index: 0,
    });
    game.phase = 'ready';
    expect(selectRunnerFrame(game, animation)).toEqual({
      clip: 'run',
      index: 0,
    });
  });
});
