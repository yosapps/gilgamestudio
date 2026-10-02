'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  MoveHorizontal,
  Pause,
  Play,
  RotateCcw,
  Star,
} from 'lucide-react';
import { useTranslator } from './language-provider';
import { useHydrated } from './use-hydrated';
import {
  createStars,
  startStars,
  selectStarsLane,
  moveStars,
  pauseStars,
  resumeStars,
  stepStars,
  readStarsBest,
  STARS_BEST_KEY,
  STARS_DURATION,
  type StarLane,
  type StarsState,
} from '@/lib/gilgame-stars';
import styles from './gilgame-stars.module.css';

type Controls = {
  start: () => void;
  select: (lane: StarLane) => void;
  move: (direction: -1 | 1) => void;
  pause: () => void;
};
const lanes = [0, 1, 2] as const;
const laneLabels = [
  'ギルガメを左に移動',
  'ギルガメを中央に移動',
  'ギルガメを右に移動',
] as const;

export function GilgameStars() {
  const t = useTranslator();
  const hydrated = useHydrated();
  const sectionRef = useRef<HTMLElement>(null);
  const controls = useRef<Controls | null>(null);
  const [display, setDisplay] = useState<StarsState>(() => createStars());

  useEffect(() => {
    let best = 0;
    try {
      best = readStarsBest(localStorage.getItem(STARS_BEST_KEY));
    } catch {
      /* Saving is optional. */
    }
    const game = createStars(best);
    let active = true;
    let frameId = 0;
    let lastTime = 0;
    let savedBest = best;
    const persistBest = () => {
      if (game.best <= savedBest) return;
      try {
        const previous = readStarsBest(localStorage.getItem(STARS_BEST_KEY));
        localStorage.setItem(
          STARS_BEST_KEY,
          String(Math.max(game.best, previous)),
        );
        savedBest = game.best;
      } catch {
        /* Play still works when browser storage is unavailable. */
      }
    };
    const publish = () =>
      setDisplay({ ...game, star: game.star ? { ...game.star } : null });
    const requestFrame = () => {
      if (active && !frameId) frameId = requestAnimationFrame(frame);
    };
    const frame = (time: number) => {
      frameId = 0;
      if (!active) return;
      if (game.phase === 'running') {
        if (lastTime) {
          let remaining = Math.min(
            (time - lastTime) / 1000,
            STARS_DURATION - game.elapsed,
          );
          while (remaining > 0 && game.phase === 'running') {
            const step = Math.min(remaining, 0.05);
            stepStars(game, step);
            remaining -= step;
          }
        }
        persistBest();
      }
      lastTime = game.phase === 'running' ? time : 0;
      publish();
      if (game.phase === 'running') requestFrame();
    };
    const focus = () => sectionRef.current?.focus({ preventScroll: true });
    const stop = () => {
      pauseStars(game);
      lastTime = 0;
      persistBest();
      requestFrame();
    };
    const visibility = () => {
      if (document.visibilityState === 'hidden') stop();
    };
    controls.current = {
      start: () => {
        if (document.visibilityState === 'hidden') return;
        startStars(game);
        lastTime = 0;
        requestFrame();
        focus();
      },
      select: (lane) => {
        selectStarsLane(game, lane);
        requestFrame();
        focus();
      },
      move: (direction) => {
        moveStars(game, direction);
        requestFrame();
      },
      pause: () => {
        if (game.phase === 'running') stop();
        else if (
          game.phase === 'paused' &&
          document.visibilityState !== 'hidden'
        ) {
          resumeStars(game);
          lastTime = 0;
          requestFrame();
          focus();
        }
      },
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', stop);
    requestFrame();
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      persistBest();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', stop);
      controls.current = null;
    };
  }, []);

  const running = display.phase === 'running';
  const paused = display.phase === 'paused';
  const over = display.phase === 'over';
  const remaining = Math.max(0, Math.ceil(STARS_DURATION - display.elapsed));
  const status = over
    ? t('星あつめ、おつかれさま！')
    : paused
      ? t('ちょっと、ひと休み。')
      : t('ギルガメと星を集めよう。');

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      className={styles.game}
      aria-labelledby="stars-title"
      aria-describedby="stars-instructions"
      data-testid="gilgame-stars"
      data-phase={display.phase}
      data-lane={display.lane}
      onKeyDown={(event) => {
        if (!hydrated || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
          event.preventDefault();
          controls.current?.move(event.code === 'ArrowLeft' ? -1 : 1);
        } else if (event.code === 'KeyP' || event.code === 'Escape') {
          event.preventDefault();
          if (!event.repeat) controls.current?.pause();
        } else if (
          event.code === 'Space' &&
          event.target === event.currentTarget
        ) {
          event.preventDefault();
          if (event.repeat) return;
          if (paused) controls.current?.pause();
          else if (!running) controls.current?.start();
        }
      }}
    >
      <div className={styles.heading}>
        <h2 id="stars-title">
          <Star size={20} aria-hidden="true" />
          STAR CATCH
        </h2>
        <div className={styles.scores}>
          <div>
            <span>{t('スコア')}</span>
            <output
              aria-label={t('スコア')}
              aria-live="off"
              data-testid="stars-score"
            >
              {display.score}
            </output>
          </div>
          <div>
            <span>{t('自己ベスト')}</span>
            <output
              aria-label={t('自己ベスト')}
              aria-live="off"
              data-testid="stars-best"
            >
              {display.best}
            </output>
          </div>
          <div>
            <span>{t('のこり時間')}</span>
            <output
              aria-label={t('のこり時間')}
              aria-live="off"
              data-testid="stars-time"
            >
              {remaining}
              <small>{t('秒')}</small>
            </output>
          </div>
        </div>
      </div>
      <div
        className={styles.stage}
        onPointerDown={(event) => {
          if (!running || !hydrated) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const lane = Math.max(
            0,
            Math.min(
              2,
              Math.floor(((event.clientX - rect.left) / rect.width) * 3),
            ),
          ) as StarLane;
          controls.current?.select(lane);
        }}
      >
        <div className={styles.lanes} aria-hidden="true">
          {lanes.map((lane) => (
            <div
              key={lane}
              className={lane === display.lane ? styles.selected : ''}
            />
          ))}
        </div>
        <div className={styles.skyDots} aria-hidden="true">
          ✧<span>✧</span>✦
        </div>
        {running && display.star && (
          <Star
            key={display.star.id}
            size={38}
            className={styles.fallingStar}
            aria-hidden="true"
            data-testid="stars-star"
            data-lane={display.star.lane}
            style={{
              left: ((display.star.lane + 0.5) / 3) * 100 + '%',
              top: 22 + display.star.progress * 166 + 'px',
            }}
          />
        )}
        <div
          className={styles.player}
          aria-hidden="true"
          style={{ left: ((display.lane + 0.5) / 3) * 100 + '%' }}
        >
          <span className={styles.shadow} />
          <Image
            src="/gilgame.png"
            alt=""
            width={148}
            height={148}
            sizes="148px"
            priority
            draggable={false}
          />
        </div>
        {running && (
          <p className={styles.catchNotice} role="status">
            {display.caught > 0
              ? t('集めた星') + ': ' + display.caught + ' ✦'
              : t('星の下へ移動しよう！')}
          </p>
        )}
        {!running && (
          <div className={styles.overlay}>
            <p role="status">{status}</p>
            <span>
              {over
                ? t('集めた星') +
                  ': ' +
                  display.caught +
                  ' · ' +
                  t('スコア') +
                  ': ' +
                  display.score
                : paused
                  ? t('準備ができたら、つづけよう。')
                  : t('取り逃しても大丈夫。30秒でいくつ集められるかな？')}
            </span>
            <button
              type="button"
              className="button button-primary"
              disabled={!hydrated}
              onClick={() =>
                paused ? controls.current?.pause() : controls.current?.start()
              }
            >
              {over ? (
                <RotateCcw size={17} aria-hidden="true" />
              ) : (
                <Play size={17} aria-hidden="true" />
              )}
              {t(
                over
                  ? 'もう一度あそぶ'
                  : paused
                    ? 'つづける'
                    : '星あつめをはじめる',
              )}
            </button>
          </div>
        )}
      </div>
      <div className={styles.controls}>
        <div className={styles.laneControls}>
          {lanes.map((lane) => (
            <button
              key={lane}
              type="button"
              className={styles.laneButton}
              disabled={!hydrated || !running}
              aria-label={t(laneLabels[lane])}
              aria-pressed={display.lane === lane}
              onClick={() => controls.current?.select(lane)}
            >
              {lane === 0 ? (
                <ArrowLeft size={19} aria-hidden="true" />
              ) : lane === 2 ? (
                <ArrowRight size={19} aria-hidden="true" />
              ) : (
                <MoveHorizontal size={19} aria-hidden="true" />
              )}
              {t(lane === 0 ? '左' : lane === 2 ? '右' : '中央')}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={'button button-ghost ' + styles.pause}
          disabled={!hydrated || !running}
          onClick={() => controls.current?.pause()}
        >
          <Pause size={16} aria-hidden="true" />
          {t('一時停止')}
        </button>
      </div>
      <p id="stars-instructions" className={styles.instructions}>
        {t('画面のタップ・下のボタン・← → キーで移動。P・Escで一時停止。')}
        <br />
        {t('星は1つ10点。自己ベストはこのブラウザに保存されます。')}
      </p>
      <p className={styles.screenReaderStatus} role="status">
        {running && display.star
          ? t('星の場所') +
            ': ' +
            t(['左', '中央', '右'][display.star.lane]) +
            ' · ' +
            t('星') +
            ' ' +
            display.star.id
          : ''}
      </p>
      <noscript>
        <p className={styles.instructions}>
          {t('ゲームを遊ぶにはJavaScriptを有効にしてください。')}
        </p>
      </noscript>
    </section>
  );
}
