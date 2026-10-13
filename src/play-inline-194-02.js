// play-inline-194 02 — size
// Lines 33-320 of readable/play-inline-194.pretty.js (statement-aligned).
  const PV = G._pv;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const LANE = { x0: 154, x1: 166, z0: 497, z1: 518 };
  // loop round 1: the flanking blocks run out to the site's building lines (Centre St x 130, Bowery x 190,
  // Canal St z 529) — flush with the sidewalks
  const REST = { x0: 149, x1: 171, z0: 518.5, z1: 529 }; // Golden Dragon (faces north onto the lane)
  const WEST = { x0: 130, x1: 153.5, z0: 498, z1: 529 };
  const EAST = { x0: 166.5, x1: 190, z0: 498, z1: 529 };
  const MANHOLE = { x: 160, z: 512 };
  const BUNK = -6.0; // bunker floor (local)
  /** The station's assault rifle (shared id), with a generic fallback while the item registry converts. */
  const RIFLE = () => K.firstItem("mat49_smg", "assault_rifle");

  // ------------------------------------------------------------------
  // Locks (G.locks): every unlock is placed in this file
  // ------------------------------------------------------------------
  const LK = {
    commander: K.regLock({
      id: "pv_lk_ct_commander",
      label: "Commandant Delorme's Teletype",
      kind: "terminal",
      passcode: "MARGUERITE",
      hint: "Sgt. Brault's diary in the station barracks (on the bunk by the skeleton) names the Commandant's word.",
      learnedFrom: "Sgt. Brault's Diary (barracks)",
    }),
    armory: K.regLock({
      id: "pv_lk_ct_armory",
      label: "Shade Suit Locker",
      kind: "container",
      key: "pv_key_ct_armory",
      hint: "Commandant Delorme carries the armory key; his teletype can also release the locker.",
      keyFrom: "Carried by Commandant Delorme",
    }),
    safe: K.regLock({
      id: "pv_lk_ct_safe",
      label: "Commandant's Safe",
      kind: "safe",
      code: "1407",
      hint: "The Commandant's personal log on his teletype gives the combination.",
      learnedFrom: "Commandant Delorme's teletype (personal log)",
    }),
    manhole: K.regLock({
      id: "pv_lk_ct_manhole",
      label: "Mott Street Manhole",
      kind: "door",
      key: "pv_ct_manhole_lifter",
      hint: "Bolted from below: a manhole lifter hangs by the station's escape ladder, or climb out that way once.",
      keyFrom: "Generator room, by the escape ladder",
    }),
  };

  // ------------------------------------------------------------------
  // Procedural calligraphy (pseudo-glyph brush strokes — reads as signage from afar)
  // ------------------------------------------------------------------
  function glyphs(x, X, Y, size, n, seed, color, vertical) {
    const r = K.rng(seed);
    x.strokeStyle = color;
    x.fillStyle = color;
    x.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const gx = vertical ? X : X + i * size * 1.1,
        gy = vertical ? Y + i * size * 1.1 : Y;
      const strokes = 4 + ((r() * 6) | 0);
      for (let s = 0; s < strokes; s++) {
        x.lineWidth = size * (0.07 + r() * 0.06);
        const t = r();
        x.beginPath();
        if (t < 0.35) {
          const yy = gy + size * (0.15 + r() * 0.7);
          x.moveTo(gx + size * (0.1 + r() * 0.2), yy);
          x.lineTo(
            gx + size * (0.6 + r() * 0.3),
            yy + (r() - 0.5) * size * 0.08,
          );
        } else if (t < 0.7) {
          const xx = gx + size * (0.15 + r() * 0.7);
          x.moveTo(xx, gy + size * (0.05 + r() * 0.2));
          x.lineTo(
            xx + (r() - 0.5) * size * 0.1,
            gy + size * (0.6 + r() * 0.35),
          );
        } else if (t < 0.85) {
          const cx = gx + size * (0.2 + r() * 0.6),
            cy = gy + size * (0.2 + r() * 0.6);
          x.moveTo(cx, cy);
          x.quadraticCurveTo(
            cx - size * 0.2,
            cy + size * 0.25,
            cx - size * 0.35,
            cy + size * 0.35,
          );
        } else {
          x.arc(
            gx + size * (0.2 + r() * 0.6),
            gy + size * (0.2 + r() * 0.6),
            size * 0.05,
            0,
            6.3,
          );
          x.fill();
          continue;
        }
        x.stroke();
      }
    }
  }
  K.glyphs = glyphs;
  /** Vertical Chinese-style signboard cell. */
  function vboard(key, n, bg, fg, border) {
    return K.paint("art", key, 96, 96 * n + 48, function (x, X, Y, W, H) {
      x.fillStyle = bg;
      x.fillRect(X, Y, W, H);
      if (border) {
        x.strokeStyle = border;
        x.lineWidth = 5;
        x.strokeRect(X + 5, Y + 5, W - 10, H - 10);
      }
      glyphs(x, X + W * 0.14, Y + 24, W * 0.7, n, key, fg, true);
      K.stains(x, X, Y, W, H, 6, 3, 0.4);
      K.streaks(x, X, Y, W, H, 6, 4, 0.3);
    });
  }
  function hboard(key, text, n, bg, fg, border) {
    return K.paint("art", key, 128 * n + 64, 160, function (x, X, Y, W, H) {
      x.fillStyle = bg;
      x.fillRect(X, Y, W, H);
      if (border) {
        x.strokeStyle = border;
        x.lineWidth = 5;
        x.strokeRect(X + 5, Y + 5, W - 10, H - 10);
      }
      glyphs(x, X + 30, Y + 14, 86, n, key, fg, false);
      if (text) {
        x.fillStyle = fg;
        x.font = "bold 30px Arial, sans-serif";
        x.textAlign = "center";
        x.fillText(text, X + W / 2, Y + H - 16, W - 20);
      }
      K.stains(x, X, Y, W, H, 6, 3, 0.4);
    });
  }
  function poster(key, slogan) {
    return K.paint("art", key, 192, 272, function (x, X, Y, W, H) {
      const r = K.rng(key);
      x.fillStyle = "#16233f";
      x.fillRect(X, Y, W, H);
      const g = x.createRadialGradient(
        X + W / 2,
        Y + H * 0.32,
        5,
        X + W / 2,
        Y + H * 0.32,
        W * 0.7,
      );
      g.addColorStop(0, "rgba(230,236,255,0.35)");
      g.addColorStop(1, "rgba(230,236,255,0)");
      x.fillStyle = g;
      x.fillRect(X, Y, W, H);
      // tricolour band down the left edge
      for (const [i, c] of [
        [0, "#22397a"],
        [1, "#f0ece0"],
        [2, "#c8241c"],
      ]) {
        x.fillStyle = c;
        x.fillRect(X + 8 + i * 9, Y + 8, 9, H - 16);
      }
      // the Bureau Sept emblem: a stencilled 7 inside an ear-shaped ring
      x.strokeStyle = "#f0ece0";
      x.lineWidth = 6;
      x.beginPath();
      x.ellipse(X + W * 0.58, Y + H * 0.3, 34, 46, 0, -1.9, 2.6);
      x.stroke();
      x.fillStyle = "#f0ece0";
      x.font = "bold 64px Georgia, serif";
      x.textAlign = "center";
      x.fillText("7", X + W * 0.6, Y + H * 0.3 + 22);
      // a man in a trench coat with headphones
      x.fillStyle = "#060a14";
      x.beginPath();
      x.arc(X + W * 0.58, Y + H * 0.58, 15, 0, 6.3);
      x.fill();
      x.strokeStyle = "#060a14";
      x.lineWidth = 4;
      x.beginPath();
      x.arc(X + W * 0.58, Y + H * 0.58, 19, PI * 1.05, PI * 1.95);
      x.stroke();
      x.beginPath();
      x.moveTo(X + W * 0.42, Y + H * 0.9);
      x.lineTo(X + W * 0.47, Y + H * 0.63);
      x.lineTo(X + W * 0.69, Y + H * 0.63);
      x.lineTo(X + W * 0.75, Y + H * 0.9);
      x.closePath();
      x.fill();
      x.fillStyle = "#c8241c";
      x.font = "bold 11px Arial, sans-serif";
      x.fillText("BUREAU SEPT", X + W * 0.58, Y + H * 0.08 + 6);
      x.fillStyle = "#f0ece0";
      x.font = "bold 13px Arial, sans-serif";
      x.textAlign = "center";
      x.fillText(slogan || "", X + W / 2 + 10, Y + H - 10, W - 34);
      K.stains(x, X, Y, W, H, 8, (r() * 99) | 0, 0.45);
      K.streaks(x, X, Y, W, H, 10, 5, 0.3);
    });
  }

  // ------------------------------------------------------------------
  // Chinese roof (tiered, upturned eaves) — local helper, world coords
  // ------------------------------------------------------------------
  /** Hip roof over rect cx,cz w×d at height y, rising h, eave overhang o, corner upturn u. */
  function pagodaRoof(b, cx, y, cz, w, d, h, o, u, tint) {
    const hw = w / 2 + o,
      hd = d / 2 + o,
      rw = Math.max(0.3, w * 0.12),
      rd = 0.04;
    const E = (sx, sz) => [cx + sx * hw, y + u, cz + sz * hd]; // upturned corners
    const M = (sx, sz) => [
      cx + sx * hw * (sx === 0 ? 0 : 1),
      y,
      cz + sz * hd * (sz === 0 ? 0 : 1),
    ]; // mid-edge (lower)
    const R = (sx) => [cx + sx * rw, y + h, cz];
    const T = tint || [0.35, 0.6, 0.45];
    // four faces, each split at the mid-edge so the eave "sags" and corners curl up
    // tiled top + a red-lacquered rafter soffit underneath (seen from the street below the eaves)
    const dn = (p) => [p[0], p[1] - 0.07, p[2]];
    const face = (p0, p1, p2, p3, n) => {
      b.quadN("rooftile", p0, p1, p2, p3, n, { tint: T, grime: 0.35 });
      b.quadN(
        "paint_red",
        dn(p0),
        dn(p1),
        dn(p2),
        dn(p3),
        [-n[0], -n[1], -n[2]],
        { tint: [0.42, 0.1, 0.07], grime: 0.3 },
      );
    };
    // front (−z) and back (+z)
    for (const sz of [-1, 1]) {
      const n = [0, 0.7, sz];
      face(E(-1, sz), M(0, sz), [cx, y + h, cz + sz * rd], R(-1), n);
      face(M(0, sz), E(1, sz), R(1), [cx, y + h, cz + sz * rd], n);
    }
    for (const sx of [-1, 1]) {
      const n = [sx, 0.7, 0];
      face(E(sx, -1), [cx + sx * hw, y, cz], R(sx), R(sx), n);
      face([cx + sx * hw, y, cz], E(sx, 1), R(sx), R(sx), n);
    }
    // ridge + ridge ends
    b.beam(
      "rooftile",
      cx - rw - 0.1,
      y + h + 0.08,
      cz,
      cx + rw + 0.1,
      y + h + 0.08,
      cz,
      0.22,
      0.22,
      { tint: [T[0] * 0.8, T[1] * 0.8, T[2] * 0.8] },
    );
    for (const sx of [-1, 1])
      b.cyl("gold", cx + sx * (rw + 0.15), y + h, cz, 0.12, 0.02, 0.5, 6);
    // eave boards (red)
    b.beam(
      "paint_red",
      E(-1, -1)[0],
      y - 0.05,
      E(-1, -1)[2],
      E(1, -1)[0],
      y - 0.05,
      E(1, -1)[2],
      0.12,
      0.2,
      { tint: [0.7, 0.15, 0.1] },
    );
  }

  /**
   * The street (north, −z) façade of a flanking block: side shop windows, a full-width
   * green-tile pagoda canopy with lanterns, upper-storey windows with lacquered frames,
   * and a big vertical signboard on the outer corner — so the block reads as Chinatown
   * from the avenue, not as a blank brick box.
   */
