import atlas from './gilgame-runner-atlas.json';
import {
  RUNNER_DUCKING_HEIGHT,
  RUNNER_STANDING_HEIGHT,
  type RunnerState,
} from './gilgame-runner';
export const runnerAtlas = atlas;
export type RunnerSpriteFrame = {
  clip: 'run' | 'jump' | 'duck';
  index: number;
};
export type RunnerAnimation = {
  frame: RunnerSpriteFrame;
  airborne: boolean;
  landingUntil: number;
  lastElapsed: number;
};
export function createRunnerAnimation(): RunnerAnimation {
  return {
    frame: { clip: 'run', index: 0 },
    airborne: false,
    landingUntil: 0,
    lastElapsed: 0,
  };
}
// Use one scale per action and a foot pivot per frame, preserving the generated anatomy.
export function runnerSpriteScale(clip: RunnerSpriteFrame['clip']) {
  return clip === 'duck'
    ? RUNNER_DUCKING_HEIGHT / 206
    : RUNNER_STANDING_HEIGHT / 269;
}
export function selectRunnerFrame(
  game: RunnerState,
  animation: RunnerAnimation,
  reduced = false,
): RunnerSpriteFrame {
  if (game.phase === 'paused' || game.phase === 'over') return animation.frame;
  if (game.phase === 'ready' || game.elapsed < animation.lastElapsed)
    Object.assign(animation, createRunnerAnimation());
  animation.lastElapsed = game.elapsed;
  if (game.phase === 'ready') return animation.frame;
  if (game.height > 0 || game.velocity > 0) {
    animation.airborne = true;
    animation.landingUntil = 0;
    let index: number;
    if (reduced) index = 2;
    else if (game.velocity > 0 && game.height < 25) index = 0;
    else if (game.velocity > 360) index = 1;
    else if (game.velocity > 80) index = 2;
    else if (game.velocity > -160) index = 3;
    else if (game.height < 24) index = 5;
    else index = 4;
    animation.frame = { clip: 'jump', index };
  } else {
    if (animation.airborne) {
      animation.landingUntil = game.elapsed + 0.09;
      animation.airborne = false;
    }
    if (game.ducking) {
      animation.landingUntil = 0;
      animation.frame = {
        clip: 'duck',
        index: reduced
          ? 0
          : Math.floor(game.distance / 26) % atlas.clips.duck.length,
      };
    } else if (!reduced && game.elapsed < animation.landingUntil) {
      animation.frame = { clip: 'jump', index: 5 };
    } else {
      animation.frame = {
        clip: 'run',
        index: reduced
          ? 0
          : Math.floor(game.distance / 28) % atlas.clips.run.length,
      };
    }
  }
  return animation.frame;
}
