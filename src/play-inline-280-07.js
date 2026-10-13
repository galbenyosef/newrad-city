// play-inline-280 07 — math
// Lines 1546-1614 of readable/play-inline-280.pretty.js (statement-aligned).
  P.wallPanels = function (b, key, axis, c, a0, a1, y0, h, n, o) {
    o = o || {};
    const w = o.w || 1.8,
      gap = o.gap || 0.5,
      t = o.t || 0.05,
      d = o.d || 0.04,
      fill = o.fill;
    const cnt = Math.max(1, Math.floor((a1 - a0 + gap) / (w + gap)));
    const used = cnt * w + (cnt - 1) * gap,
      start = a0 + (a1 - a0 - used) / 2;
    for (let i = 0; i < cnt; i++) {
      const u0 = start + i * (w + gap),
        u1 = u0 + w;
      const bars = [
        [u0, y0, u1, y0 + t],
        [u0, y0 + h - t, u1, y0 + h],
        [u0, y0, u0 + t, y0 + h],
        [u1 - t, y0, u1, y0 + h],
      ];
      for (const [p0, q0, p1, q1] of bars) {
        if (axis === "x")
          b.box(
            key,
            p0,
            q0,
            Math.min(c, c + n * d),
            p1,
            q1,
            Math.max(c, c + n * d),
            { seg: false, noAO: true },
          );
        else
          b.box(
            key,
            Math.min(c, c + n * d),
            q0,
            p0,
            Math.max(c, c + n * d),
            q1,
            p1,
            { seg: false, noAO: true },
          );
      }
      if (fill) {
        if (axis === "x")
          b.box(
            fill,
            u0 + t,
            y0 + t,
            Math.min(c, c + n * 0.012),
            u1 - t,
            y0 + h - t,
            Math.max(c, c + n * 0.012),
            { seg: false, noAO: true },
          );
        else
          b.box(
            fill,
            Math.min(c, c + n * 0.012),
            y0 + t,
            u0 + t,
            Math.max(c, c + n * 0.012),
            y0 + h - t,
            u1 - t,
            { seg: false, noAO: true },
          );
      }
    }
  };
