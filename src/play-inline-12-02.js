// play-inline-12 02 — ctx
// Lines 294-398 of readable/play-inline-12.pretty.js (statement-aligned).
  function crackPane(ctx, r, gx, gy, gw, gh) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(gx, gy, gw, gh);
    ctx.clip();
    ctx.strokeStyle = "rgba(215,225,215," + (0.35 + r() * 0.25) + ")";
    ctx.lineWidth = 0.6 + r() * 0.4;
    const kind = r();
    if (kind < 0.4) {
      // spiderweb from an impact point
      const cx = gx + gw * (0.2 + r() * 0.6),
        cy = gy + gh * (0.2 + r() * 0.6),
        n = 4 + ((r() * 5) | 0);
      const radius = Math.min(gw, gh) * (0.25 + r() * 0.5),
        ang = [];
      for (let k = 0; k < n; k++) ang.push((k / n) * TAU + (r() - 0.5) * 0.9);
      for (const a of ang) {
        // jagged radial legs
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        let px = cx,
          py = cy;
        const len = radius * (0.6 + r() * 0.9),
          seg = 3;
        for (let q = 1; q <= seg; q++) {
          px = cx + (Math.cos(a + (r() - 0.5) * 0.3) * len * q) / seg;
          py = cy + (Math.sin(a + (r() - 0.5) * 0.3) * len * q) / seg;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      for (let ring = 1; ring <= 2; ring++) {
        // concentric fracture segments
        const rr = radius * ring * 0.3;
        for (let k = 0; k < n; k++) {
          if (r() < 0.35) continue;
          const a0 = ang[k],
            a1 = ang[(k + 1) % n] + (k + 1 === n ? TAU : 0);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a0) * rr, cy + Math.sin(a0) * rr);
          ctx.lineTo(
            cx + Math.cos(a1) * rr * (0.85 + r() * 0.3),
            cy + Math.sin(a1) * rr * (0.85 + r() * 0.3),
          );
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(20,24,22,0.8)";
      ctx.beginPath();
      ctx.arc(cx, cy, 1.2, 0, TAU);
      ctx.fill();
    } else if (kind < 0.8) {
      // long meandering stress crack
      let x = r() < 0.5 ? gx : gx + gw,
        y = gy + r() * gh;
      const tx = x === gx ? gx + gw : gx,
        ty = gy + r() * gh;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let q = 1; q <= 7; q++) {
        const t = q / 7;
        ctx.lineTo(
          x + (tx - x) * t + (r() - 0.5) * gw * 0.12,
          y + (ty - y) * t + (r() - 0.5) * gh * 0.12,
        );
      }
      ctx.stroke();
      if (r() < 0.6) {
        const bx = gx + gw * (0.3 + r() * 0.4),
          by = gy + gh * (0.3 + r() * 0.4);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(
          bx + (r() - 0.5) * gw * 0.6,
          by + (r() < 0.5 ? -1 : 1) * gh * (0.2 + r() * 0.3),
        );
        ctx.stroke();
      }
    } else {
      // corner chip with a missing shard
      const cx = r() < 0.5 ? gx : gx + gw,
        cy = r() < 0.5 ? gy : gy + gh,
        sx = (cx === gx ? 1 : -1) * gw * (0.2 + r() * 0.25),
        sy = (cy === gy ? 1 : -1) * gh * (0.15 + r() * 0.2);
      ctx.fillStyle = "rgba(14,12,10,0.85)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + sx, cy);
      ctx.lineTo(cx + sx * 0.3, cy + sy * 0.4);
      ctx.lineTo(cx, cy + sy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + sx * 0.3, cy + sy * 0.4);
      ctx.lineTo(cx + sx * 1.6, cy + sy * 1.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Draw one window into ctx (colour), hc (height) and ec (emissive, half-res; coordinates scaled by 0.5).
   * o: {x,y,w,h, state, panes:[cols,rows], upperPanes?, frame:'#hex', sash:bool, arch:bool, reveal:px}
   */
