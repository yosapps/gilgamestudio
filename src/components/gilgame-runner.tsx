'use client';
import { useEffect, useRef, useState } from 'react';
import './gilgame-runner.css';
import { Pause, Play, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { useTranslator } from './language-provider';
import { useHydrated } from './use-hydrated';
import {
  runnerAtlas,
  createRunnerAnimation,
  selectRunnerFrame,
  runnerSpriteScale,
  type RunnerSpriteFrame,
} from '@/lib/gilgame-runner-animation';
import {
  createRunner,
  jumpRunner,
  duckRunner,
  pauseRunner,
  resumeRunner,
  stepRunner,
  runnerPlayerX,
  readRunnerBest,
  RUNNER_BEST_KEY,
  RUNNER_GROUND,
  RUNNER_HEIGHT,
  RUNNER_DUCKING_HEIGHT,
  RUNNER_STANDING_HEIGHT,
  type RunnerPhase,
  type RunnerState,
} from '@/lib/gilgame-runner';

type Display = {
  phase: RunnerPhase;
  score: number;
  best: number;
  cleared: number;
  ducking: boolean;
};
type Controls = {
  jump: () => void;
  duck: (pressed: boolean) => void;
  pause: () => void;
};

type RunnerSprites = { sheet: HTMLImageElement; fallback: HTMLImageElement };

function drawScene(
  ctx: CanvasRenderingContext2D,
  game: RunnerState,
  sprites: RunnerSprites,
  selectedFrame: RunnerSpriteFrame,
  reduced: boolean,
) {
  const width = game.width;
  ctx.clearRect(0, 0, width, RUNNER_HEIGHT);
  const sky = ctx.createLinearGradient(0, 0, 0, RUNNER_HEIGHT);
  sky.addColorStop(0, '#e4f5ff');
  sky.addColorStop(1, '#fff9e6');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, RUNNER_HEIGHT);
  // Slow scenery gives a sense of movement without competing with obstacles.
  const offset = reduced ? 0 : game.distance * 0.12;
  ctx.fillStyle = '#ffffffb8';
  for (let i = 0; i < 4; i++) {
    const x =
      ((((i * 230 + 150 - offset) % (width + 230)) + width + 230) %
        (width + 230)) -
      80;
    const y = 55 + (i % 2) * 26;
    ctx.beginPath();
    ctx.ellipse(x, y, 34, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 6, y - 7, 20, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#c6e5eb8c';
  ctx.beginPath();
  ctx.moveTo(0, RUNNER_GROUND);
  for (let x = 0; x <= width + 10; x += 10)
    ctx.lineTo(x, 178 + Math.sin((x + offset) / 105) * 12);
  ctx.lineTo(width, RUNNER_GROUND);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f3e2b7';
  ctx.fillRect(0, RUNNER_GROUND, width, RUNNER_HEIGHT - RUNNER_GROUND);
  ctx.strokeStyle = '#bdc9a8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, RUNNER_GROUND);
  ctx.lineTo(width, RUNNER_GROUND);
  ctx.stroke();
  ctx.strokeStyle = '#b9a77b';
  ctx.lineWidth = 2;
  for (let x = -(game.distance % 44); x < width; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, RUNNER_GROUND + 15);
    ctx.lineTo(x + 9, RUNNER_GROUND + 15);
    ctx.stroke();
  }
  for (const obstacle of game.obstacles) {
    const { x, width: w, height: h, altitude } = obstacle;
    const bottom = RUNNER_GROUND - altitude;
    const top = bottom - h;
    ctx.fillStyle = obstacle.kind === 'floating' ? '#6cbfe7' : '#127bb8';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, top);
    ctx.lineTo(x + w, top + h * 0.42);
    ctx.lineTo(x + w * 0.78, bottom);
    ctx.lineTo(x + w * 0.2, bottom);
    ctx.lineTo(x, top + h * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#b8edff';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, top + 3);
    ctx.lineTo(x + w * 0.48, bottom - 3);
    ctx.lineTo(x + 3, top + h * 0.43);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#075284';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (obstacle.kind === 'floating') {
      ctx.strokeStyle = '#dcb541';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, top + h / 2, w * 0.7, 5, -0.25, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const x = runnerPlayerX(width);
  const centerX = x + 26;
  const groundY = RUNNER_GROUND - game.height;
  ctx.fillStyle = '#6d785833';
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    RUNNER_GROUND + 2,
    Math.max(12, 24 - game.height * 0.09),
    4,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.save();
  const { sheet, fallback } = sprites;
  if (
    sheet.complete &&
    sheet.naturalWidth === runnerAtlas.width &&
    sheet.naturalHeight === runnerAtlas.height
  ) {
    const frame = runnerAtlas.clips[selectedFrame.clip][selectedFrame.index];
    const scale = runnerSpriteScale(selectedFrame.clip);
    // Clip the generated pose at its foot pivot. Do not stretch or rotate the character.
    ctx.drawImage(
      sheet,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      centerX - frame.pivotX * scale,
      groundY - frame.pivotY * scale,
      frame.width * scale,
      frame.height * scale,
    );
  } else if (
    selectedFrame.clip !== 'duck' &&
    fallback.complete &&
    fallback.naturalWidth > 0
  ) {
    ctx.drawImage(
      fallback,
      310,
      161,
      665,
      941,
      centerX - 26,
      groundY - RUNNER_STANDING_HEIGHT,
      52,
      RUNNER_STANDING_HEIGHT,
    );
  } else {
    const h =
      selectedFrame.clip === 'duck'
        ? RUNNER_DUCKING_HEIGHT
        : RUNNER_STANDING_HEIGHT;
    ctx.translate(centerX, groundY - h / 2);
    ctx.fillStyle = '#4dcce9';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.17, 26, h * 0.31, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4c548';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.23, 17, h * 0.27, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#123453';
    ctx.fillRect(-12, -h * 0.2, 4, 5);
    ctx.fillRect(8, -h * 0.2, 4, 5);
  }
  ctx.restore();
}

export function GilgameRunner({
  variant = 'not-found',
}: {
  variant?: 'not-found' | 'minigames';
}) {
  const t = useTranslator();
  const hydrated = useHydrated();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useRef<Controls | null>(null);
  const [display, setDisplay] = useState<Display>({
    phase: 'ready',
    score: 0,
    best: 0,
    cleared: 0,
    ducking: false,
  });
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      const timer = setTimeout(() => setAvailable(false), 0);
      return () => clearTimeout(timer);
    }
    let savedBest = 0;
    try {
      savedBest = readRunnerBest(localStorage.getItem(RUNNER_BEST_KEY));
    } catch {
      /* Storage is optional. */
    }
    const game = createRunner(canvas.getBoundingClientRect().width, savedBest);
    const sprites: RunnerSprites = {
      sheet: new window.Image(),
      fallback: new window.Image(),
    };
    const animation = createRunnerAnimation();
    let active = true;
    let frameId = 0;
    let lastTime = 0;
    let accumulator = 0;
    let lastPublished = '';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const publish = () => {
      const next = {
        phase: game.phase,
        score: game.score,
        best: game.best,
        cleared: game.cleared,
        ducking: game.ducking,
      };
      const signature = JSON.stringify(next);
      if (signature !== lastPublished) {
        lastPublished = signature;
        setDisplay(next);
      }
    };
    const persistBest = () => {
      try {
        const previous = readRunnerBest(localStorage.getItem(RUNNER_BEST_KEY));
        localStorage.setItem(
          RUNNER_BEST_KEY,
          String(Math.max(game.best, previous)),
        );
      } catch {
        /* The game also works with browser storage disabled. */
      }
    };
    const requestFrame = () => {
      if (active && !frameId) frameId = requestAnimationFrame(frame);
    };
    const frame = (time: number) => {
      frameId = 0;
      if (!active) return;
      if (game.phase === 'running') {
        accumulator += lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
        let ended = false;
        while (accumulator >= 1 / 120 && game.phase === 'running') {
          ended = stepRunner(game, 1 / 120) === 'over';
          accumulator -= 1 / 120;
        }
        if (ended) persistBest();
      }
      lastTime = game.phase === 'running' ? time : 0;
      const selectedFrame = selectRunnerFrame(game, animation, motion.matches);
      drawScene(ctx, game, sprites, selectedFrame, motion.matches);
      publish();
      if (game.phase === 'running') requestFrame();
    };
    const resize = () => {
      const width = Math.max(
        320,
        Math.min(960, Math.round(canvas.getBoundingClientRect().width)),
      );
      if (width !== game.width) pauseRunner(game);
      game.width = width;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(RUNNER_HEIGHT * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      requestFrame();
    };
    const stop = () => {
      pauseRunner(game);
      lastTime = 0;
      accumulator = 0;
      persistBest();
      requestFrame();
    };
    const visibility = () => {
      if (document.visibilityState === 'hidden') stop();
    };
    controls.current = {
      jump: () => {
        if (document.visibilityState === 'hidden') return;
        jumpRunner(game);
        requestFrame();
        canvas.focus({ preventScroll: true });
      },
      duck: (pressed) => {
        duckRunner(game, pressed);
        requestFrame();
      },
      pause: () => {
        if (game.phase === 'running') stop();
        else {
          resumeRunner(game);
          lastTime = 0;
          accumulator = 0;
          requestFrame();
          canvas.focus({ preventScroll: true });
        }
      },
    };
    for (const image of [sprites.sheet, sprites.fallback]) {
      image.onload = requestFrame;
      image.onerror = requestFrame;
    }
    sprites.fallback.src = '/gilgame.png';
    sprites.sheet.src = runnerAtlas.source;
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', stop);
    motion.addEventListener('change', requestFrame);
    resize();
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      persistBest();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', stop);
      motion.removeEventListener('change', requestFrame);
      for (const image of [sprites.sheet, sprites.fallback]) {
        image.onload = null;
        image.onerror = null;
      }
      controls.current = null;
    };
  }, []);

  const running = display.phase === 'running';
  const paused = display.phase === 'paused';
  const over = display.phase === 'over';
  const interactable = hydrated && available;
  return (
    <section
      className="gilgame-runner"
      aria-labelledby="runner-title"
      data-phase={display.phase}
      onKeyDown={(event) => {
        if (event.target !== canvasRef.current) return;
        if (
          ['Space', 'ArrowUp', 'ArrowDown', 'KeyP', 'Escape'].includes(
            event.code,
          )
        )
          event.preventDefault();
        if (event.repeat) return;
        if (event.code === 'Space' || event.code === 'ArrowUp')
          controls.current?.jump();
        else if (event.code === 'ArrowDown') controls.current?.duck(true);
        else if (event.code === 'KeyP' || event.code === 'Escape')
          controls.current?.pause();
      }}
      onKeyUp={(event) => {
        if (event.code === 'ArrowDown') {
          event.preventDefault();
          controls.current?.duck(false);
        }
      }}
    >
      <div className="runner-heading">
        <div>
          <p className="eyebrow">
            {variant === 'minigames'
              ? 'JUMP. DUCK. KEEP GOING.'
              : 'A LITTLE DETOUR'}
          </p>
          <h2 id="runner-title">GILGAME RUN</h2>
        </div>
        <div className="runner-scores">
          <div>
            <span>{t('スコア')}</span>
            <output aria-label={t('スコア')}>
              {String(display.score).padStart(5, '0')}
            </output>
          </div>
          <div>
            <span>{t('自己ベスト')}</span>
            <output aria-label={t('自己ベスト')}>
              {String(display.best).padStart(5, '0')}
            </output>
          </div>
        </div>
      </div>
      <div className="runner-stage">
        <canvas
          ref={canvasRef}
          width="720"
          height={RUNNER_HEIGHT}
          tabIndex={0}
          role="img"
          aria-label={t('ギルガメのランニングゲーム')}
          aria-describedby="runner-instructions"
          onPointerDown={(event) => {
            if (!interactable) return;
            event.preventDefault();
            controls.current?.jump();
          }}
        >
          {t('スペースキー・↑キー・タップでジャンプ。↓キーでしゃがみます。')}
        </canvas>
        {!running && available && (
          <div className="runner-overlay">
            <p role="status">
              {t(
                over
                  ? 'ナイスラン！もう一度、冒険へ。'
                  : paused
                    ? 'ちょっと、ひと休み。'
                    : variant === 'minigames'
                      ? 'ギルガメと、ひと走り。'
                      : '迷い道も、小さな冒険。',
              )}
            </p>
            {over && (
              <p className="runner-result">
                {t('スコア')}: {display.score} · {t('避けた障害物')}:{' '}
                {display.cleared}
              </p>
            )}
            <button
              type="button"
              className="button button-primary"
              disabled={!interactable}
              onClick={() =>
                paused ? controls.current?.pause() : controls.current?.jump()
              }
            >
              {over ? <RotateCcw size={17} /> : <Play size={17} />}
              {t(
                over ? 'もう一度遊ぶ' : paused ? 'つづける' : '冒険をはじめる',
              )}
            </button>
          </div>
        )}
      </div>
      {!available && (
        <p role="status">
          {t(
            'このブラウザではゲームを表示できません。ホームから冒険を続けてください。',
          )}
        </p>
      )}
      <div className="runner-controls">
        <button
          type="button"
          className="button button-outline"
          disabled={!interactable}
          onClick={() => controls.current?.jump()}
        >
          <ArrowUp size={16} />
          {t('ジャンプ')}
        </button>
        <button
          type="button"
          className="button button-outline runner-duck"
          disabled={!interactable || !running}
          aria-pressed={display.ducking}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            controls.current?.duck(true);
          }}
          onPointerUp={() => controls.current?.duck(false)}
          onPointerCancel={() => controls.current?.duck(false)}
          onLostPointerCapture={() => controls.current?.duck(false)}
          onKeyDown={(event) => {
            if (event.code === 'Space' || event.code === 'Enter') {
              event.preventDefault();
              controls.current?.duck(true);
            }
          }}
          onKeyUp={(event) => {
            if (event.code === 'Space' || event.code === 'Enter') {
              event.preventDefault();
              controls.current?.duck(false);
            }
          }}
          onBlur={() => controls.current?.duck(false)}
        >
          <ArrowDown size={16} />
          {t('しゃがむ')}
        </button>
        <button
          type="button"
          className="button button-ghost"
          disabled={!interactable || (!running && !paused)}
          onClick={() => controls.current?.pause()}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {t(paused ? 'つづける' : '一時停止')}
        </button>
      </div>
      <p className="runner-instructions" id="runner-instructions">
        {t('スペースキー・↑キー・タップでジャンプ。↓キーでしゃがみます。')}
        <br />
        {t(
          '青いクリスタルを避けよう。P・Escで一時停止。自己ベストはこのブラウザに保存されます。',
        )}
      </p>
      <noscript>
        <p>{t('ゲームを遊ぶにはJavaScriptを有効にしてください。')}</p>
      </noscript>
    </section>
  );
}
