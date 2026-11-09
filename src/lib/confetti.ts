/**
 * A small confetti cannon on a canvas: bursts from the left and right edges toward the middle.
 * Paper ribbons, squares and dots in the site's red, ink and paper plus the soft journey tints.
 * The canvas sizes itself to its parent; frames run only while pieces are alive.
 */

type Piece = {
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; flip: number; vf: number;
  w: number; h: number; color: string; shape: 0 | 1 | 2; life: number;
};

export function createConfetti(canvas: HTMLCanvasElement, colors: string[]) {
  const ctx = canvas.getContext("2d")!;
  let pieces: Piece[] = [];
  let raf = 0;
  let last = 0;
  let W = 0;
  let H = 0;
  let dpr = 1;

  const size = () => {
    const r = canvas.parentElement!.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(canvas.parentElement!);

  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  const tick = (now: number) => {
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const g = H * 1.1; // gravity scales with the stage
    pieces = pieces.filter((p) => p.y < H + 40 && p.life > 0);
    for (const p of pieces) {
      p.vx *= Math.pow(0.32, dt); // air drag
      p.vy = p.vy * Math.pow(0.5, dt) + g * dt;
      p.x += p.vx * dt + Math.sin(p.flip) * 18 * dt; // a little flutter
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.flip += p.vf * dt;
      p.life -= dt;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / 0.6);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.flip)); // turning over in the air
      ctx.fillStyle = p.color;
      if (p.shape === 2) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    raf = pieces.length ? requestAnimationFrame(tick) : 0;
    if (!raf) ctx.clearRect(0, 0, W, H);
  };

  const burst = (count = 110) => {
    const s = Math.max(0.7, Math.min(1.2, W / 1200));
    for (const side of [-1, 1]) {
      for (let i = 0; i < count; i++) {
        const shape = (Math.random() < 0.5 ? 1 : Math.random() < 0.6 ? 0 : 2) as Piece["shape"];
        const ang = rand(-80, -20) * (Math.PI / 180); // up and in
        const sp = rand(0.55, 1.25) * Math.max(W, H) * 1.05;
        const w = (shape === 1 ? rand(5, 8) : rand(7, 11)) * s;
        pieces.push({
          x: side < 0 ? rand(-10, 20) : W - rand(-10, 20),
          y: H * rand(0.62, 0.9),
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          rot: rand(0, Math.PI * 2),
          vr: rand(-9, 9),
          flip: rand(0, Math.PI * 2),
          vf: rand(6, 14),
          w,
          h: shape === 1 ? w * rand(2.2, 3.4) : w,
          color: colors[(Math.random() * colors.length) | 0],
          shape,
          life: rand(2.6, 4),
        });
        // right side flies left
        if (side > 0) pieces[pieces.length - 1].vx *= -1;
      }
    }
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const destroy = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    pieces = [];
  };

  return { burst, destroy };
}
