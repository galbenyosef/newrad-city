// play-inline-252 03 — ctx
// Lines 368-697 of readable/play-inline-252.pretty.js (statement-aligned).
  PF.onReset.push(() => {
    for (const t of PF.triggers) {
      t.fired = false;
      t.inside = false;
    }
  });

  // -------------------------------------------------------------------
  // Glow sprites (fake light) — parented so they hide with the cell
  // -------------------------------------------------------------------
  PF.glowQ = [];
  PF.glow = function (pos, color, size, parent, opts) {
    const rec = {
      pos: pos.clone ? pos.clone() : V3(pos.x, pos.y, pos.z),
      color,
      size,
      parent: parent || null,
      opts: opts || {},
    };
    if (!PF.makeGlow(rec)) PF.glowQ.push(rec);
    return rec;
  };
  PF.makeGlow = function (rec) {
    if (!PF.live("fx") || typeof G.fx.glowSprite !== "function") return false;
    return !!PF.safe("glow", () => {
      const o = Object.assign({}, rec.opts);
      if (rec.parent) o.parent = rec.parent;
      const s = G.fx.glowSprite(rec.pos, rec.color, rec.size, o);
      if (s && s.isObject3D && !s.parent) (rec.parent || G.scene).add(s);
      rec.sprite = s;
      return true;
    });
  };

  // -------------------------------------------------------------------
  // Static world pickups (notes, tape reels, uniques) — spawned at initDone
  // -------------------------------------------------------------------
  PF.pickupQ = [];
  PF.pickup = function (id, n, pos, opts) {
    PF.pickupQ.push({
      id,
      n: n || 1,
      pos: pos.clone ? pos.clone() : V3(pos.x, pos.y, pos.z),
      opts: opts || {},
    });
  };
  PF.spawnPickups = function () {
    if (!PF.live("items") || typeof G.items.spawnPickup !== "function") return;
    for (const p of PF.pickupQ)
      PF.safe("pickup:" + p.id, () =>
        G.items.spawnPickup(
          p.id,
          p.n,
          p.pos,
          Object.assign({ static: true }, p.opts),
        ),
      );
  };

  // -------------------------------------------------------------------
  // Persistent props (containers, terminals, lamps...) — spawned at initDone
  // -------------------------------------------------------------------
  PF.propQ = [];
  PF.prop = function (type, opts) {
    PF.propQ.push({ type, opts });
  };
  PF.spawnProps = function () {
    for (const p of PF.propQ) PF.spawnProp(p.type, p.opts);
  };

  // -------------------------------------------------------------------
  // Custom interactables with a label that can change (switches, nests...)
  // -------------------------------------------------------------------
  PF.use = function (def) {
    return PF.safe("interactable", () =>
      G.world.addInteractable(
        Object.assign({ radius: 0.8, range: 2.8, priority: 1 }, def),
      ),
    );
  };
  /** Interior load door with stable id. */
  PF.door = function (def) {
    return PF.safe("door", () =>
      G.world.addDoor(Object.assign({ radius: 1.3 }, def)),
    );
  };

  // -------------------------------------------------------------------
  // Custom materials for this module (added to the lib's table)
  // -------------------------------------------------------------------
  const TAU = Math.PI * 2;
  const U = G.util;
  // --- custom canvas textures (registered into the lib's CUSTOM_TEX so MAT_DEFS can use them) ---
  /** Guastavino tile vaulting: thin buff/salmon terracotta tiles laid in herringbone, lime joints, soot & damp. */
  function guastavinoDraw(ctx, w, h) {
    const r = U.rng(1909);
    ctx.fillStyle = "#9c8a6a";
    ctx.fillRect(0, 0, w, h); // joint colour
    const T = 32,
      L = 64; // tile short/long side (px); 512 px ≈ 8 × 16 tiles
    const tone = () => {
      const k = r();
      return k < 0.55
        ? [214, 196, 158]
        : k < 0.8
          ? [206, 172, 132]
          : k < 0.93
            ? [226, 212, 180]
            : [188, 150, 110];
    };
    // herringbone: alternating horizontal / vertical tiles on a stepped lattice
    for (let j = -2; j < h / T + 2; j++) {
      for (let i = -2; i < w / T + 2; i++) {
        const x = i * T * 2 + (j % 2) * T,
          y = j * T;
        const c1 = tone(),
          c2 = tone();
        const f = (c) =>
          "rgb(" +
          ((c[0] + (r() - 0.5) * 16) | 0) +
          "," +
          ((c[1] + (r() - 0.5) * 16) | 0) +
          "," +
          ((c[2] + (r() - 0.5) * 14) | 0) +
          ")";
        ctx.fillStyle = f(c1);
        ctx.fillRect(x + 2, y + 2, L - 4, T - 4); // horizontal tile
        ctx.fillStyle = f(c2);
        ctx.fillRect(x + 2, y + T + 2, T - 4, L - 4); // vertical tile
        // glaze sheen + edge shade
        ctx.fillStyle = "rgba(255,250,235,0.10)";
        ctx.fillRect(x + 3, y + 3, L - 10, 4);
        ctx.fillStyle = "rgba(40,28,12,0.12)";
        ctx.fillRect(x + 2, y + T - 5, L - 4, 3);
      }
    }
    // damp stains & soot blooms
    for (let i = 0; i < 40; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 20 + r() * 90;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(50,40,24," + (0.06 + r() * 0.16) + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = r() < 0.5 ? "rgba(20,14,8,0.3)" : "rgba(255,248,230,0.2)";
      ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
    // a few missing tiles (dark holes)
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = "rgba(60,48,34,0.7)";
      ctx.fillRect(
        (((r() * w) / T) | 0) * T + 2,
        (((r() * h) / T) | 0) * T + 2,
        T - 4,
        T - 4,
      );
    }
  }
  /** Red quarry-tile floor: 30 cm squares, worn paths, grime in the joints. */
  function quarryDraw(ctx, w, h) {
    const r = U.rng(59);
    ctx.fillStyle = "#4a3226";
    ctx.fillRect(0, 0, w, h);
    const n = 8,
      s = w / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const k = r();
        const c =
          k < 0.6 ? [138, 72, 52] : k < 0.85 ? [120, 64, 46] : [150, 92, 64];
        ctx.fillStyle =
          "rgb(" +
          ((c[0] + (r() - 0.5) * 20) | 0) +
          "," +
          ((c[1] + (r() - 0.5) * 14) | 0) +
          "," +
          ((c[2] + (r() - 0.5) * 12) | 0) +
          ")";
        ctx.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
        if (r() < 0.12) {
          ctx.strokeStyle = "rgba(30,18,12,0.7)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(i * s + r() * s, j * s);
          ctx.lineTo(i * s + r() * s, j * s + s);
          ctx.stroke();
        }
      }
    for (let i = 0; i < 50; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 10 + r() * 60;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(30,22,14," + (0.08 + r() * 0.2) + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = "rgba(20,14,8," + r() * 0.3 + ")";
      ctx.fillRect(r() * w, r() * h, 1.4, 1.4);
    }
  }
  /** Riveted plate steel with paint peeling to rust (bridge members); tint via material colour. */
  function rivetDraw(ctx, w, h) {
    const r = U.rng(77);
    ctx.fillStyle = "#c8c8c0";
    ctx.fillRect(0, 0, w, h);
    // plate seams
    ctx.fillStyle = "rgba(40,40,36,0.45)";
    for (let y = 0; y < h; y += 128) ctx.fillRect(0, y, w, 3);
    for (let x = 0; x < w; x += 170) ctx.fillRect(x, 0, 3, h);
    // rivet rows along the seams
    for (let y = 0; y < h; y += 128)
      for (let x = 8; x < w; x += 16) {
        ctx.fillStyle = "rgba(255,255,250,0.35)";
        ctx.beginPath();
        ctx.arc(x, y + 9, 3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(30,30,26,0.4)";
        ctx.beginPath();
        ctx.arc(x + 1, y + 10, 3, 0, TAU);
        ctx.fill();
      }
    // peeling paint → rust blooms and run-off streaks
    for (let i = 0; i < 70; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 6 + r() * 40;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(120,58,24," + (0.35 + r() * 0.45) + ")");
      g.addColorStop(0.6, "rgba(110,60,30,0.2)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      if (r() < 0.6) {
        const sg = ctx.createLinearGradient(0, y, 0, y + 60 + r() * 120);
        sg.addColorStop(0, "rgba(110,52,20,0.45)");
        sg.addColorStop(1, "rgba(110,52,20,0)");
        ctx.fillStyle = sg;
        ctx.fillRect(x - 2, y, 3 + r() * 4, 180);
      }
    }
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle =
        r() < 0.5
          ? "rgba(20,20,18," + r() * 0.3 + ")"
          : "rgba(255,255,250," + r() * 0.2 + ")";
      ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
  }
  /** Rough-dressed granite pier masonry: big rusticated blocks. */
  function pierStoneDraw(ctx, w, h) {
    const r = U.rng(4);
    ctx.fillStyle = "#5c5a55";
    ctx.fillRect(0, 0, w, h);
    const rows = 4;
    for (let row = 0; row < rows; row++) {
      const bh = h / rows,
        cols = 2 + (row % 2),
        bw = w / cols,
        off = (row % 2) * bw * 0.5;
      for (let c = -1; c <= cols; c++) {
        const x0 = c * bw + off + 4,
          y0 = row * bh + 4,
          ww = bw - 8,
          hh = bh - 8;
        const v = 128 + (r() - 0.5) * 36;
        ctx.fillStyle =
          "rgb(" +
          (v | 0) +
          "," +
          ((v * 0.98) | 0) +
          "," +
          ((v * 0.93) | 0) +
          ")";
        ctx.fillRect(x0, y0, ww, hh);
        // rock-faced: noisy bumps
        for (let k = 0; k < 60; k++) {
          ctx.fillStyle =
            r() < 0.5 ? "rgba(255,255,250,0.08)" : "rgba(0,0,0,0.12)";
          ctx.beginPath();
          ctx.arc(x0 + r() * ww, y0 + r() * hh, 3 + r() * 12, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = "rgba(255,255,245,0.15)";
        ctx.fillRect(x0, y0, ww, 5);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(x0, y0 + hh - 6, ww, 6);
      }
    }
    for (let i = 0; i < 30; i++) {
      const x = r() * w;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(30,26,20,0.12)");
      g.addColorStop(1, "rgba(30,26,20,0.02)");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, 3 + r() * 8, h);
    }
  }
  /** Mutant gore / meat sacks: glistening red-brown with fat marbling. */
  function goreDraw(ctx, w, h) {
    const r = U.rng(666);
    ctx.fillStyle = "#5a1812";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle =
        r() < 0.3
          ? "rgba(220,190,150," + (0.2 + r() * 0.3) + ")"
          : r() < 0.6
            ? "rgba(120,20,16,0.6)"
            : "rgba(30,6,4,0.5)";
      ctx.beginPath();
      ctx.ellipse(r() * w, r() * h, 3 + r() * 18, 2 + r() * 8, r() * 3, 0, TAU);
      ctx.fill();
    }
  }
  Object.assign(PF.CUSTOM_TEX || {}, {
    guastavino: [512, 512, guastavinoDraw],
    quarry: [256, 256, quarryDraw],
    rivet_plate: [512, 512, rivetDraw],
    pier_stone: [512, 512, pierStoneDraw],
    gore: [128, 128, goreDraw],
  });

  const MD = PF.MAT_DEFS;
