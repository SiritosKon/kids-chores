import confetti from 'canvas-confetti';

export function celebrate(color = '#FF9F0A'): void {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
  } catch {}

  const end = Date.now() + 1200;
  const colors = [color, '#FDD835', '#ffffff'];

  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 55, startVelocity: 55, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 55, startVelocity: 55, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
