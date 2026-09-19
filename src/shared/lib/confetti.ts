import confetti from 'canvas-confetti';

type Burst = (colors: string[]) => void;

const prefersReducedMotion = (): boolean => {
  try {
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  } catch {
    return false;
  }
};

const schoolPride: Burst = (colors) => {
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 55, startVelocity: 55, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 55, startVelocity: 55, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

const cannon: Burst = (colors) => {
  confetti({ particleCount: 140, spread: 80, startVelocity: 55, origin: { y: 0.75 }, colors });
};

const fireworks: Burst = (colors) => {
  const end = Date.now() + 2000;
  const shell = () => {
    confetti({
      particleCount: 60,
      startVelocity: 26,
      spread: 360,
      ticks: 70,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.2 + Math.random() * 0.4 },
      colors,
    });
    if (Date.now() < end) {
      setTimeout(shell, 280);
    }
  };
  shell();
};

const stars: Burst = (colors) => {
  const shoot = (particleCount: number, scalar: number) => {
    confetti({
      particleCount,
      scalar,
      spread: 360,
      ticks: 70,
      gravity: 0.2,
      decay: 0.94,
      startVelocity: 24,
      shapes: ['star'],
      origin: { y: 0.55 },
      colors,
    });
  };
  shoot(30, 1.2);
  setTimeout(() => shoot(14, 0.8), 120);
  setTimeout(() => shoot(24, 1.6), 240);
};

const emojiBurst = (symbols: string[]): Burst => {
  return (colors) => {
    const shapes = symbols.map((text) => confetti.shapeFromText({ text, scalar: 2.4 }));
    confetti({
      shapes,
      scalar: 2.4,
      particleCount: 34,
      spread: 90,
      startVelocity: 45,
      origin: { y: 0.7 },
      colors,
    });
  };
};

const PRESETS: Burst[] = [schoolPride, cannon, fireworks, stars, emojiBurst(['⭐', '🎉', '🏆'])];

const palette = (color: string): string[] => [color, '#FDD835', '#ffffff'];

export const celebrate = (color = '#FF9F0A'): void => {
  if (prefersReducedMotion()) {
    return;
  }
  const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)] ?? cannon;
  preset(palette(color));
};

export const celebrateStreak = (color = '#FF9F0A'): void => {
  if (prefersReducedMotion()) {
    return;
  }
  const colors = palette(color);
  fireworks(colors);
  emojiBurst(['🔥'])(colors);
};
