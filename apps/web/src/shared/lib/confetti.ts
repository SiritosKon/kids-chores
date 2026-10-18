import confetti from 'canvas-confetti';
import {
  CELEBRATION_Z_INDEX,
  DEFAULT_CELEBRATION_COLOR,
  FESTIVE_COLORS,
  FIRE_SPARK_COLORS,
} from './constants';
import type { Burst } from './types';

const prefersReducedMotion = (): boolean => {
  try {
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  } catch {
    return false;
  }
};

const shoot = (options: confetti.Options): void => {
  void confetti({ zIndex: CELEBRATION_Z_INDEX, ...options });
};

const pick = (colors: string[]): string =>
  colors[Math.floor(Math.random() * colors.length)] ?? DEFAULT_CELEBRATION_COLOR;

const sideCannons: Burst = (colors) => {
  const end = Date.now() + 1800;
  const frame = () => {
    shoot({ particleCount: 5, angle: 60, spread: 60, startVelocity: 62, scalar: 1.3, origin: { x: 0, y: 0.85 }, colors });
    shoot({ particleCount: 5, angle: 120, spread: 60, startVelocity: 62, scalar: 1.3, origin: { x: 1, y: 0.85 }, colors });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

const risingFire = (): void => {
  const scalar = 3;
  const shapes = [confetti.shapeFromText({ text: '🔥', scalar })];
  const end = Date.now() + 2200;
  const puff = () => {
    shoot({
      shapes,
      scalar,
      particleCount: 2,
      angle: 90,
      spread: 16,
      startVelocity: 14,
      gravity: -2,
      ticks: 210,
      flat: true,
      origin: { x: 0.05 + Math.random() * 0.9, y: 1.05 },
    });
    shoot({
      particleCount: 5,
      angle: 90,
      spread: 30,
      startVelocity: 16,
      gravity: -1.6,
      ticks: 180,
      scalar: 0.9,
      shapes: ['circle'],
      origin: { x: Math.random(), y: 1.02 },
      colors: FIRE_SPARK_COLORS,
    });
    if (Date.now() < end) {
      setTimeout(puff, 90);
    }
  };
  puff();
};

const fireworks: Burst = (colors) => {
  const end = Date.now() + 3000;
  const shell = () => {
    shoot({
      particleCount: 90,
      startVelocity: 17,
      spread: 360,
      ticks: 80,
      gravity: 0.35,
      decay: 0.9,
      scalar: 1.3,
      shapes: ['circle'],
      origin: { x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.6 },
      colors: [pick(colors), pick(colors), '#FFFFFF'],
    });
    if (Date.now() < end) {
      setTimeout(shell, 250);
    }
  };
  shell();
};

const palette = (childColors: readonly string[]): string[] => {
  const own = childColors.length > 0 ? childColors : [DEFAULT_CELEBRATION_COLOR];
  return [...own, ...own, ...FESTIVE_COLORS];
};

export const celebrate = (childColors: readonly string[] = []): void => {
  if (prefersReducedMotion()) {
    return;
  }
  sideCannons(palette(childColors));
};

export const celebrateStreak = (): void => {
  if (prefersReducedMotion()) {
    return;
  }
  risingFire();
};

export const celebrateReward = (color = DEFAULT_CELEBRATION_COLOR): void => {
  if (prefersReducedMotion()) {
    return;
  }
  fireworks(palette([color]));
};
