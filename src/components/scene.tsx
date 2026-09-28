'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useSyncExternalStore } from 'react';
import type { Group } from 'three';
const subscribe = (callback: () => void) => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
function Crystals() {
  const group = useRef<Group>(null);
  useFrame(({ clock, pointer }) => {
    if (group.current) {
      group.current.rotation.y =
        Math.sin(clock.elapsedTime * 0.2) * 0.12 + pointer.x * 0.06;
      group.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.09;
    }
  });
  return (
    <group ref={group}>
      {[
        [-2.1, 1.1, 0.5],
        [2.1, 1.4, -0.5],
        [1.9, -1.4, 0],
        [-1.7, -1.3, -0.4],
      ].map((position, i) => (
        <mesh
          key={i}
          position={position as [number, number, number]}
          rotation={[0.1, Math.PI / 4, i % 2 ? 0.35 : -0.35]}
          scale={[0.28, i === 0 ? 0.7 : 0.45, 0.28]}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={i % 2 ? '#1b8deb' : '#6de5f5'}
            metalness={0.18}
            roughness={0.24}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}
export default function Scene({ active }: { active: boolean }) {
  const reduced = useSyncExternalStore(
    subscribe,
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => true,
  );
  if (reduced) return null;
  return (
    <Canvas
      aria-hidden="true"
      className="hero-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.25]}
      camera={{ position: [0, 0, 7], fov: 48 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      fallback={null}
    >
      <ambientLight intensity={1.7} />
      <directionalLight position={[2, 4, 5]} intensity={3} />
      <pointLight position={[-3, -1, 3]} intensity={8} color="#39ceff" />
      <Crystals />
    </Canvas>
  );
}
