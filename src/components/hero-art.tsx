'use client';
import dynamic from 'next/dynamic';
import { Component, useRef, type ReactNode } from 'react';
import { useInView } from 'motion/react';
import Image from 'next/image';
const Scene = dynamic(() => import('./scene'), {
  ssr: false,
  loading: () => null,
});
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export function HeroArt() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: '100px' });
  return (
    <div ref={ref} className="hero-art">
      <div className="hero-halo" aria-hidden="true" />
      <Image
        src="/gilgame.png"
        alt="手を振って迎える、水色のカメのキャラクター「ギルガメ」"
        fill
        priority
        className="hero-character"
        sizes="(max-width:760px) 100vw, 55vw"
      />
      <Boundary>
        <Scene active={visible} />
      </Boundary>
      <span className="character-hello">
        こんにちは、ギルガメです。<span>LET’S GO ON AN ADVENTURE!</span>
      </span>
      <span className="art-coordinate">YOUR LITTLE COMPANION / GILGAME</span>
    </div>
  );
}
