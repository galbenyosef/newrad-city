// play-inline-357 05 — ctx
// Lines 876-1222 of readable/play-inline-357.pretty.js (statement-aligned).
  PF.sealTex = function (faded) {
    return PF.canvasTex(
      "pws_seal" + (faded ? "f" : ""),
      256,
      256,
      (ctx, w, h) => {
        const r = PF.rng("seal");
        const cx = w / 2,
          cy = h / 2;
        ctx.fillStyle = "#16233a";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#e6dcc0";
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.44, h * 0.44, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#b88a30";
        ctx.lineWidth = 8;
        ctx.stroke();
        // eagle wings
        ctx.fillStyle = "#6a4a2a";
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx, cy - 10);
          ctx.quadraticCurveTo(cx + s * 70, cy - 70, cx + s * 96, cy - 20);
          ctx.quadraticCurveTo(cx + s * 70, cy - 10, cx + s * 40, cy + 20);
          ctx.fill();
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.moveTo(cx + s * (40 + k * 9), cy + 10 - k * 4);
            ctx.lineTo(cx + s * (48 + k * 9), cy + 30 - k * 5);
            ctx.lineTo(cx + s * (52 + k * 9), cy + 6 - k * 5);
            ctx.fill();
          }
        }
        // head
        ctx.fillStyle = "#f0ece0";
        ctx.beginPath();
        ctx.arc(cx, cy - 44, 14, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#d8a020";
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy - 46);
        ctx.lineTo(cx + 22, cy - 42);
        ctx.lineTo(cx + 10, cy - 38);
        ctx.fill();
        // shield: stripes + blue chief
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy - 28);
        ctx.lineTo(cx + 26, cy - 28);
        ctx.lineTo(cx + 26, cy + 10);
        ctx.quadraticCurveTo(cx, cy + 44, cx - 26, cy + 10);
        ctx.closePath();
        ctx.clip();
        for (let k = 0; k < 13; k++) {
          ctx.fillStyle = k % 2 ? "#e8e0cc" : "#a02820";
          ctx.fillRect(cx - 26 + k * 4, cy - 28, 4, 80);
        }
        ctx.fillStyle = "#1e3a78";
        ctx.fillRect(cx - 26, cy - 28, 52, 14);
        ctx.restore();
        // olive branch & arrows
        ctx.strokeStyle = "#3a5a24";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy + 34);
        ctx.quadraticCurveTo(cx - 50, cy + 40, cx - 64, cy + 30);
        ctx.stroke();
        ctx.fillStyle = "#4a7a30";
        for (let k = 0; k < 6; k++) {
          ctx.beginPath();
          ctx.ellipse(
            cx - 28 - k * 7,
            cy + 36 - (k % 2) * 6,
            4,
            2,
            0.5,
            0,
            TAU,
          );
          ctx.fill();
        }
        ctx.strokeStyle = "#5a4020";
        ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(cx + 20, cy + 34);
          ctx.lineTo(cx + 60, cy + 20 + k * 8);
          ctx.stroke();
        }
        // stars in a glory over the head
        ctx.fillStyle = "#d8b050";
        for (let k = 0; k < 13; k++) {
          const a = -HP + (k - 6) * 0.2;
          PF.drawStar(
            ctx,
            cx + Math.cos(a) * 64,
            cy - 30 + Math.sin(a) * 44,
            5,
          );
        }
        ctx.fillStyle = "#3a2a18";
        ctx.font = "bold 13px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("E PLURIBUS UNUM", cx, cy + 78);
        if (faded)
          for (let i = 0; i < 70; i++) {
            ctx.fillStyle = "rgba(60,44,24," + (0.05 + r() * 0.2) + ")";
            ctx.beginPath();
            ctx.arc(r() * w, r() * h, 3 + r() * 14, 0, TAU);
            ctx.fill();
          }
      },
      { clamp: true },
    );
  };
  PF.sealKey = function (faded) {
    return PF.texMat("seal" + (faded ? "f" : ""), PF.sealTex(faded), {
      rough: 0.6,
      emissive: 0.12,
    });
  };

  /** Wall of brass safe-deposit box doors (numbers, keyholes, a few forced open). */
  PF.boxesTex = function () {
    return PF.canvasTex("pws_boxes", 512, 512, (ctx, w, h) => {
      const r = PF.rng("boxes");
      ctx.fillStyle = "#2a2418";
      ctx.fillRect(0, 0, w, h);
      const cols = 8,
        rows = 12,
        cw = w / cols,
        chh = h / rows;
      let n = 1000;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const x = i * cw + 2,
            y = j * chh + 2,
            bw = cw - 4,
            bh = chh - 4;
          const open = r() < 0.12;
          if (open) {
            ctx.fillStyle = "#0a0806";
            ctx.fillRect(x, y, bw, bh);
            continue;
          }
          const g = ctx.createLinearGradient(x, y, x + bw, y + bh);
          g.addColorStop(0, "#b8964e");
          g.addColorStop(1, "#7a5e2c");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, bw, bh);
          ctx.strokeStyle = "rgba(40,28,10,0.8)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 3, y + 3, bw - 6, bh - 6);
          ctx.fillStyle = "#2a1e0c";
          ctx.beginPath();
          ctx.arc(x + bw * 0.3, y + bh / 2, 3, 0, TAU);
          ctx.arc(x + bw * 0.7, y + bh / 2, 3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#f0e0b0";
          ctx.fillRect(x + bw / 2 - 11, y + 4, 22, 9);
          ctx.fillStyle = "#2a1e0c";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(n + j * cols + i), x + bw / 2, y + 11);
          if (r() < 0.25) {
            ctx.fillStyle = "rgba(40,60,40," + (0.2 + r() * 0.3) + ")";
            ctx.fillRect(x, y, bw, bh);
          }
        }
      void n;
    });
  };
  PF.boxesKey = function () {
    return PF.texMat("boxes", PF.boxesTex(), { rough: 0.45, metal: 0.6 });
  };

  /** Big incised name band on stone (e.g. "BANK OF THE MANHATTAN COMPANY"). */
  PF.bandKey = function (key, lines, opts) {
    opts = opts || {};
    return PF.texMat(
      key,
      PF.signTex(
        key,
        lines,
        opts.style || "engraved",
        opts.w || 1024,
        opts.h || 128,
        opts.extra || {},
      ),
      { rough: 0.85 },
    );
  };
  /** Transparent graffiti quad material. */
  PF.grafKey = function (key, lines, color, extra) {
    return PF.texMat(
      "graf_" + key,
      PF.graffitiTex(
        key,
        lines,
        512,
        256,
        Object.assign({ color }, extra || {}),
      ),
      { transparent: true, rough: 0.9, noShadow: true },
    );
  };

  // -------------------------------------------------------------------
  // Helpers (copied from poi_chelsea/04_mats.js, same semantics)
  // -------------------------------------------------------------------
  PF.flushGlows = function (parent) {
    for (const g of PF.glows.splice(0))
      PF.glow(g.pos, g.color, g.size, parent || null, {
        intensity: g.intensity || 1.2,
        flicker: g.flicker || 0,
      });
  };
  PF.flushFires = function () {
    const list = PF.fires.splice(0);
    PF.onInitDone.push(() => {
      if (!PF.live("fx") || typeof G.fx.fire !== "function") return;
      for (const p of list) PF.safe("fire", () => G.fx.fire(p.clone(), 0.5));
    });
  };
  /** Horizontal slab with a walkable collider (floors, platforms). Top at y, thickness t. */
  PF.slab = function (b, key, x0, z0, x1, z1, y, t, opts) {
    opts = opts || {};
    t = t || 0.3;
    b.boxMM(key, x0, y - t, z0, x1, y, z1, {
      grime: opts.grime,
      segLen: opts.segLen || 6,
      c: opts.c,
      noAO: opts.noAO,
    });
    if (!opts.noCollide)
      PF.colMM(x0, y - (opts.colT || Math.max(t, 0.5)), z0, x1, y, z1, {
        surface: opts.surface || "concrete",
      });
  };
  /** Steel-stringer stair with treads, rails and step colliders (≤0.3 m rise). Climbs toward local +Z of ry. */
  PF.steelStair = function (b, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const key = opts.key || "steel";
    const rise = y1 - y0,
      n = Math.max(1, Math.ceil(Math.abs(rise) / 0.3));
    const sr = run / n,
      sh = rise / n;
    const P = (lx, ly, lz) => {
      const [wx, wz] = PF.rot(x, z, ry, lx, lz);
      return V3(wx, ly, wz);
    };
    for (let i = 0; i < n; i++) {
      const top = y0 + sh * (i + 1);
      const [wx, wz] = PF.rot(x, z, ry, 0, sr * (i + 0.5));
      if (opts.solid)
        b.box(
          opts.tread || "diamond",
          wx,
          y0 - 0.05,
          wz,
          width,
          top - y0 + 0.05,
          sr + 0.02,
          { ry, seg: false, grime: 0.4 },
        );
      else
        b.box(
          opts.tread || "diamond",
          wx,
          top - 0.06,
          wz,
          width,
          0.06,
          sr + 0.04,
          { ry, seg: false, grime: 0.4 },
        );
      PF.col(wx, wz, width, sr + 0.04, top - 0.35, top, ry, {
        surface: opts.surface || "metal",
      });
    }
    for (const sg of [-1, 1]) {
      if (!opts.solid)
        b.beam(
          key,
          P((sg * width) / 2, y0 - 0.1, 0),
          P((sg * width) / 2, y1 - 0.1, run),
          0.08,
          0.3,
          { twist: ry },
        );
      if (opts.rails !== false && !(opts.railSide && opts.railSide !== sg)) {
        b.beam(
          opts.railKey || key,
          P(sg * (width / 2 + 0.02), y0 + 1.0, 0),
          P(sg * (width / 2 + 0.02), y1 + 1.0, run),
          0.05,
          0.05,
          {},
        );
        for (let k = 0; k <= n; k += 3) {
          const t = k / n;
          b.beam(
            opts.railKey || key,
            P(sg * (width / 2 + 0.02), y0 + rise * t, run * t),
            P(sg * (width / 2 + 0.02), y0 + rise * t + 1.0, run * t),
            0.04,
            0.04,
            {},
          );
        }
        const [cx, cz] = PF.rot(x, z, ry, sg * (width / 2 + 0.05), run / 2);
        PF.col(cx, cz, 0.1, run, Math.min(y0, y1), Math.max(y0, y1) + 1.0, ry, {
          walkable: false,
          surface: "metal",
        });
      }
    }
    return n;
  };
  /** Railing run between two points at y (posts + 2 rails) with optional collider. */
  PF.rail = function (b, x0, z0, x1, z1, y, opts) {
    opts = opts || {};
    const key = opts.key || "iron",
      h = opts.h || 1.05;
    b.beam(key, V3(x0, y + h, z0), V3(x1, y + h, z1), 0.06, 0.06, {
      grime: 0.3,
    });
    b.beam(key, V3(x0, y + h * 0.5, z0), V3(x1, y + h * 0.5, z1), 0.04, 0.04, {
      grime: 0.3,
    });
    const len = Math.hypot(x1 - x0, z1 - z0),
      n = Math.max(1, Math.round(len / (opts.step || 1.6)));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      b.box(key, x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, 0.06, h, 0.06, {
        seg: false,
        grime: 0.3,
      });
    }
    if (!opts.noCollide)
      PF.colWall(x0, z0, x1, z1, 0.2, y - 0.2, y + h + 0.2, {
        walkable: false,
        surface: "metal",
      });
  };
  /** extra: optional fields merged into the def, e.g. {learn: 'lock_id'} (reading it teaches that code / passcode). */
