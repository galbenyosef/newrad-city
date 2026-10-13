/* src/poi_village/40_chinatown.js */
/* =====================================================================
 * NEW RAD CITY — poi_village / 40_chinatown.js
 * CHINATOWN (Mott Street) — the Golden Dragon and the relay station beneath it.
 *
 * EXTERIOR (site x 130..190, z 496..529): a pedestrian lane through the
 *   block entered under a red PAIFANG gate (tiered green-tile roofs,
 *   upturned eaves), pagoda-roofed three-storey storefronts both sides
 *   (tea, herbs, bakery, chop suey), red lanterns strung across the lane,
 *   vertical signboards with calligraphy, and at the end of the lane the
 *   GOLDEN DRAGON restaurant with its serpentine gold dragon and neon.
 * INTERIOR (cell chinatown):
 *   dining room (round tables & lazy susans, lacquer columns, dragon mural,
 *   broken aquarium, lucky cat) → kitchen (woks, steamers, hanging ducks)
 *   → storeroom — a shelf that moves → the hidden stairway → POSTE DRAGON,
 *   a Bureau Sept (French intelligence) listening post and relay station
 *   dug under the restaurant through a front company in 1962: guard post,
 *   poster corridor, radio-intercept room (the transmitter is still
 *   running), barracks, commandant's office, armory (the Bureau Sept shade
 *   suit, key / terminal release), generator room and the escape tunnel up
 *   to a manhole in the lane (loop).
 * The Golden Dragon's own family were ordinary New Yorkers who never knew
 * what their landlord rented out below them. Hostile: the station's
 * ex-agents, half-mad after twenty-two years holding the post + the location's Maniacs.
 * QUEST "Static Over Canal Street" (absorbed into the main story as mq31 "Poste Dragon", Act 5:
 *   the main story adds the SIROCCO codebook in the cipher safe and the Glowkeepers' race).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
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
  function streetFacade(b, r, blk, side, H) {
    const z = blk.z0,
      cx = (blk.x0 + blk.x1) / 2,
      w = blk.x1 - blk.x0;
    const green = [0.3, 0.58, 0.42],
      redT = [0.55, 0.12, 0.1];
    // small shop windows either side of the big storefront
    for (const dx of [-7.6, 7.6]) {
      K.window(b, cx + dx, 1.6, z, 0, -1, 3.6, 2.6, {
        state: r() < 0.5 ? "broken" : "glass",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: redT,
        inset: 0.18,
      });
      b.boxMM(
        "corrugated",
        cx + dx - 1.8,
        2.0,
        z - 0.24,
        cx + dx + 1.8,
        2.9,
        z - 0.2,
        { tint: [0.6, 0.55, 0.45] },
      );
    }
    // full-width canopy (tiles on top, red rafters beneath), upturned corners
    const x0 = blk.x0 + 0.4,
      x1 = blk.x1 - 0.4,
      yT = 6.0,
      yE = 5.1,
      dz = 1.7;
    b.quadN(
      "rooftile",
      [x0, yT, z],
      [x1, yT, z],
      [x1 + 0.3, yE, z - dz],
      [x0 - 0.3, yE, z - dz],
      [0, 1, -0.6],
      { tint: green, grime: 0.4 },
    );
    b.quadN(
      "paint_red",
      [x0, yT - 0.07, z],
      [x1, yT - 0.07, z],
      [x1 + 0.3, yE - 0.07, z - dz],
      [x0 - 0.3, yE - 0.07, z - dz],
      [0, -1, 0.6],
      { tint: [0.42, 0.1, 0.07], grime: 0.3 },
    );
    b.beam(
      "paint_red",
      x0 - 0.3,
      yE - 0.1,
      z - dz,
      x1 + 0.3,
      yE - 0.1,
      z - dz,
      0.14,
      0.2,
      { tint: [0.65, 0.14, 0.1] },
    );
    b.beam(
      "rooftile",
      x0 - 0.3,
      yT + 0.05,
      z - 0.05,
      x1 + 0.3,
      yT + 0.05,
      z - 0.05,
      0.2,
      0.2,
      { tint: [green[0] * 0.8, green[1] * 0.8, green[2] * 0.8] },
    );
    for (const [ex, sx] of [
      [x0 - 0.3, -1],
      [x1 + 0.3, 1],
    ]) {
      b.beam(
        "rooftile",
        ex,
        yE,
        z - dz,
        ex + sx * 0.4,
        yE + 0.55,
        z - dz - 0.45,
        0.18,
        0.12,
        { tint: green },
      );
      b.cyl(
        "gold",
        ex + sx * 0.4,
        yE + 0.55,
        z - dz - 0.45,
        0.06,
        0.02,
        0.3,
        5,
      );
    }
    for (let x = x0 + 0.9; x < x1; x += 1.9)
      K.lamp(b, x, 4.55, z - dz + 0.15, "lantern", [1, 0.35, 0.2], 0, 0, {
        ceil: yE - 0.1,
        size: 0.3,
        glowSize: 1.2,
      });
    // upper storeys: lacquered windows (and a painted band between floors)
    const nW = Math.max(3, Math.floor(w / 3.3));
    for (const wy of [8.0, 11.0]) {
      if (wy + 1 > H) continue;
      for (let k = 0; k < nW; k++) {
        const wx = blk.x0 + ((k + 0.5) * w) / nW;
        K.window(b, wx, wy, z, 0, -1, 1.2, 1.8, {
          state: r() < 0.3 ? "boarded" : r() < 0.5 ? "broken" : "glass",
          frame: "paint_green",
          lintel: 0.15,
          trimTint: [0.7, 0.66, 0.58],
          reveal: "brick_tan",
        });
      }
    }
    b.boxMM("paint_red", blk.x0, 6.5, z - 0.12, blk.x1, 6.75, z, {
      tint: redT,
    });
    b.boxMM("paint_red", blk.x0, 9.45, z - 0.1, blk.x1, 9.6, z, { tint: redT });
    // vertical signboard on the outer corner (perpendicular to the façade)
    const vx = side > 0 ? blk.x0 + 1.4 : blk.x1 - 1.4;
    b.boxMM("paint_black", vx - 0.12, 6.9, z - 1.5, vx + 0.12, 12.2, z, {});
    const key = "ct_street_vb" + (side > 0 ? "w" : "e");
    for (const s of [-1, 1])
      b.plate(
        "art",
        vx + s * 0.13,
        9.55,
        z - 0.75,
        s,
        0,
        1.3,
        5.1,
        vboard(
          key,
          6,
          side > 0 ? "#7a1a12" : "#1a1a1a",
          side > 0 ? "#f0d060" : "#e03020",
          "#c8a040",
        ),
        { off: 0.01 },
      );
    for (const y of [7.4, 11.6])
      b.beam("black_iron", vx, y, z - 1.5, vx, y + 0.5, z, 0.04, 0.04);
    b.glow(
      vx,
      9.5,
      z - 1.4,
      side > 0 ? [0.9, 0.5, 0.2] : [0.9, 0.2, 0.15],
      3.0,
    );
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  /**
   * The avenue (outer) and Canal St (rear) faces of a flanking block: Chinatown tenement walls — sash windows on
   * the upper floors, rolled-down shop shutters with hand-painted signs at street level, zig-zag fire escapes,
   * a painted ghost sign. They used to be blank brick. (blk = WEST/EAST, side = +1 west block / −1 east block)
   */
  function outerFacades(b, r, blk, side, H) {
    const ox = side > 0 ? blk.x0 : blk.x1,
      nx = -side; // outer avenue face
    const len = blk.z1 - blk.z0;
    const nBay = Math.floor(len / 5.2);
    const floors = [5.6, 9.6];
    for (let k = 0; k < nBay; k++) {
      const zc = blk.z0 + ((k + 0.5) * len) / nBay;
      if (k === 0) continue; // the corner bay belongs to the street façade
      // ground: roll-down shutter + painted board
      K.window(b, ox, 1.6, zc, nx, 0, 3.4, 2.7, {
        state: "dark",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: [0.5, 0.12, 0.1],
        inset: 0.16,
      });
      b.boxMM(
        "corrugated",
        ox + nx * 0.17,
        0.25,
        zc - 1.7,
        ox + nx * 0.21,
        2.9,
        zc + 1.7,
        {
          tint: r.pick([
            [0.62, 0.56, 0.45],
            [0.5, 0.52, 0.5],
            [0.6, 0.45, 0.35],
          ]),
        },
      );
      if (k % 2)
        b.plate(
          "decal",
          ox + nx * 0.23,
          1.5,
          zc,
          nx,
          0,
          2.8,
          1.0,
          K.tag(
            r.pick([
              "CLOSED",
              "NO RADS HERE",
              "DRAGON RETURNS",
              "福",
              "KEEP OUT",
            ]),
            r.pick(["#e8d040", "#e04030", "#f0f0e0"]),
            256,
            96,
            { rot: (r() - 0.5) * 0.1 },
          ),
        );
      for (const wy of floors)
        for (const dz of [-1.2, 1.2])
          K.window(b, ox, wy, zc + dz, nx, 0, 1.0, 1.7, {
            state:
              r() < 0.3
                ? "boarded"
                : r() < 0.45
                  ? "broken"
                  : r() < 0.55
                    ? "lit"
                    : "glass",
            frame: "paint_green",
            lintel: 0.15,
            trimTint: [0.7, 0.66, 0.58],
            reveal: "brick_tan",
          });
    }
    // fire escapes over two bays + a painted ghost sign high on the blank end
    K.fireEscape(
      b,
      ox,
      blk.z0 + (1.5 * len) / nBay + (len / nBay) * 0.5,
      nx,
      0,
      5.6,
      [4.5, 8.5, 12.1],
      { seed: 70 + side },
    );
    K.ghostSign(
      b,
      ox,
      10.0,
      blk.z0 + ((nBay - 0.9) * len) / nBay,
      nx,
      0,
      (len / nBay) * 1.6,
      3.0,
      side > 0
        ? ["GOLDEN LOTUS TRADING CO.", "IMPORTERS · TEAS · SILKS"]
        : ["CANAL ST. FISH", "WHOLESALE · RETAIL"],
      { key: "ct_ghost" + side, bg: "rgba(90,24,18,0.45)" },
    );
    // string courses on the outer face
    for (const y of [4.6, 8.6])
      b.boxMM(
        "paint_red",
        ox,
        y - 0.08,
        blk.z0,
        ox + nx * 0.12,
        y + 0.08,
        blk.z1,
        { tint: [0.45, 0.14, 0.1] },
      );
    // rear (Canal St) face: upper windows + a fire escape
    const rz = blk.z1,
      rlen = blk.x1 - blk.x0;
    for (let x = blk.x0 + 2.4; x < blk.x1 - 1.5; x += 3.6) {
      for (const wy of floors)
        K.window(b, x, wy, rz, 0, 1, 1.0, 1.7, {
          state: r() < 0.35 ? "boarded" : "glass",
          frame: "paint_green",
          lintel: 0.15,
          trimTint: [0.7, 0.66, 0.58],
          reveal: "brick_tan",
        });
      K.window(b, x, 1.6, rz, 0, 1, 2.2, 2.4, {
        state: r() < 0.5 ? "boarded" : "dark",
        sill: false,
        reveal: "brick_tan",
        inset: 0.14,
      });
    }
    K.fireEscape(b, blk.x0 + rlen * 0.5, rz, 0, 1, 5.2, [4.5, 8.5], {
      seed: 80 + side,
    });
  }

  /** Cornice ring (red lacquer, 0.3 m proud on the lane & street) + a 0.9 m brick parapet round a block's roof. */
  function roofRing(b, blk, side, H, brickT) {
    const red = [0.45, 0.12, 0.1],
      lane = side > 0 ? "e" : "w";
    const out = (e) => (e === "n" || e === lane ? 0.3 : 0.1);
    const edges = [
      ["n", blk.x0, blk.z0 - out("n"), blk.x1, blk.z0 + 0.35],
      ["s", blk.x0, blk.z1 - 0.35, blk.x1, blk.z1 + out("s")],
      ["w", blk.x0 - out("w"), blk.z0, blk.x0 + 0.35, blk.z1],
      ["e", blk.x1 - 0.35, blk.z0, blk.x1 + out("e"), blk.z1],
    ];
    for (const [, x0, z0, x1, z1] of edges) {
      b.boxMM("paint_red", x0, H - 0.1, z0, x1, H + 0.3, z1, { tint: red });
      b.boxMM(
        "brick_tan",
        Math.max(x0, blk.x0),
        H + 0.3,
        Math.max(z0, blk.z0),
        Math.min(x1, blk.x1),
        H + 1.1,
        Math.min(z1, blk.z1),
        { tint: brickT.map((v) => v * 0.9) },
      );
    }
  }
  /** Tar roof clutter on a flanking block: water tank on a stand, stair bulkhead, vent stacks, laundry, a rooftop pigeon coop. */
  function rooftop(b, r, blk, side, H) {
    const w = blk.x1 - blk.x0,
      d = blk.z1 - blk.z0;
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        blk.x0 + 2 + r() * (w - 4),
        H + 0.02 + k * 0.001,
        blk.z0 + 10 + r() * (d - 13),
        2.5 + r() * 3,
        2 + r() * 2,
        r() * 3,
        K.decal(k % 2 ? "grime" : "puddle", k % 4),
      );
    // water tank (rear outer corner)
    const wx = side > 0 ? blk.x0 + 4 : blk.x1 - 4,
      wz = blk.z1 - 5,
      top = H + 3.2;
    for (const [ox, oz] of [
      [-1.2, -1.2],
      [1.2, -1.2],
      [-1.2, 1.2],
      [1.2, 1.2],
    ])
      b.beam(
        "rust",
        wx + ox,
        H,
        wz + oz,
        wx + ox * 0.85,
        top,
        wz + oz * 0.85,
        0.16,
        0.16,
      );
    b.boxMM(
      "rust",
      wx - 1.4,
      top,
      wz - 1.4,
      wx + 1.4,
      top + 0.18,
      wz + 1.4,
      {},
    );
    b.cyl("wood_rotten", wx, top + 0.18, wz, 1.55, 1.55, 3.2, 14, {
      tint: [0.55, 0.45, 0.36],
    });
    for (let k = 0; k < 3; k++)
      b.cyl("rust", wx, top + 0.5 + k * 0.95, wz, 1.58, 1.58, 0.07, 14, {
        top: false,
      });
    b.cyl("wood_rotten", wx, top + 3.38, wz, 1.65, 0.14, 1.1, 14, {
      tint: [0.4, 0.35, 0.3],
    });
    b.col(wx - 1.5, H, wz - 1.5, wx + 1.5, top + 3.4, wz + 1.5, {
      tag: "roof_kit",
      walkable: false,
    });
    // stair bulkhead
    const bx = (blk.x0 + blk.x1) / 2 + side * 2,
      bz = blk.z0 + d * 0.55;
    b.boxMM("brick_tan", bx - 1.8, H, bz - 1.5, bx + 1.8, H + 2.7, bz + 1.5, {
      tint: [0.7, 0.6, 0.5],
    });
    b.boxMM(
      "metal",
      bx - 2.0,
      H + 2.7,
      bz - 1.7,
      bx + 2.0,
      H + 2.85,
      bz + 1.7,
      { tint: [0.35, 0.33, 0.3] },
    );
    b.plate("wood_dark", bx, H + 1.05, bz - 1.52, 0, -1, 0.95, 2.05, null, {
      tint: [0.45, 0.14, 0.1],
    });
    b.col(bx - 1.8, H, bz - 1.5, bx + 1.8, H + 2.85, bz + 1.5, {
      tag: "roof_kit",
    });
    // vent stacks & laundry
    for (let k = 0; k < 4; k++)
      b.cyl(
        "rust",
        blk.x0 + 3 + r() * (w - 6),
        H,
        blk.z0 + 12 + r() * (d - 16),
        0.14,
        0.14,
        1.0 + r() * 0.8,
        6,
        { tint: [0.5, 0.42, 0.36] },
      );
    const lx0 = blk.x0 + 2,
      lx1 = blk.x1 - 2,
      lz = blk.z1 - 11;
    for (const x of [lx0, lx1])
      b.beam("wood_rotten", x, H, lz, x, H + 2.0, lz, 0.08, 0.08);
    b.pipe("black_iron", lx0, H + 1.95, lz, lx1, H + 1.95, lz, 0.008, 3);
    for (let k = 0; k < 7; k++) {
      const x = lx0 + 1 + (k * (lx1 - lx0 - 2)) / 6;
      b.box("fabric", x, H + 1.35, lz, 0.7, 0.6, 0.02, {
        tint: r.pick([
          [0.8, 0.3, 0.25],
          [0.3, 0.4, 0.6],
          [0.85, 0.82, 0.72],
          [0.55, 0.65, 0.35],
          [0.9, 0.75, 0.3],
        ]),
      });
    }
    // pigeon coop (west block) / satellite-ish antenna (east block)
    if (side > 0) {
      const cx = blk.x0 + 6,
        cz = blk.z0 + 16;
      b.boxMM("wood_rotten", cx - 1.5, H, cz - 1, cx + 1.5, H + 1.6, cz + 1, {
        tint: [0.6, 0.5, 0.4],
      });
      b.quadN(
        "corrugated",
        [cx - 1.7, H + 1.9, cz - 1.2],
        [cx + 1.7, H + 1.9, cz - 1.2],
        [cx + 1.7, H + 1.5, cz + 1.2],
        [cx - 1.7, H + 1.5, cz + 1.2],
        [0, 1, 0.2],
        { tint: [0.55, 0.5, 0.45] },
      );
      b.col(cx - 1.5, H, cz - 1, cx + 1.5, H + 1.9, cz + 1, {
        tag: "roof_kit",
      });
    } else {
      const ax = blk.x1 - 5,
        az = blk.z0 + 14;
      b.pipe("black_iron", ax, H, az, ax, H + 7, az, 0.05, 4);
      for (let k = 0; k < 4; k++)
        b.pipe(
          "black_iron",
          ax - 1.2 + k * 0.15,
          H + 4 + k * 0.9,
          az,
          ax + 1.2 - k * 0.15,
          H + 4 + k * 0.9,
          az,
          0.02,
          3,
        );
      b.cyl("metal", ax + 0.6, H + 2.5, az, 0.05, 0.6, 0.35, 10, {
        tint: [0.6, 0.6, 0.58],
      });
    }
  }

  function exterior(ctx) {
    const b = K.builder({ name: "chinatown_ext", grime: 0.6 });
    const r = K.rng("ct_ext");
    const brickT = [0.78, 0.66, 0.56];

    // ---- flanking blocks: 3 buildings each side, facing the lane ----
    const shopNames = [
      ["TEA", "#1a3a2a", "#e8d8a0"],
      ["HERBS", "#3a1a10", "#f0c850"],
      ["BAKERY", "#7a1a12", "#f8e8c0"],
      ["CHOP SUEY", "#141414", "#ff5040"],
      ["FISH MARKET", "#1a2a3a", "#e0e8f0"],
      ["NOODLES", "#5a1410", "#ffd860"],
    ];
    for (const [blk, side] of [
      [WEST, 1],
      [EAST, -1],
    ]) {
      const fx = side > 0 ? blk.x1 : blk.x0; // façade line on the lane
      const n = [side, 0];
      const H = 13 + (side > 0 ? 1.5 : 0);
      // body
      b.face(
        "brick_tan",
        blk.x0,
        0,
        blk.z0,
        0,
        0,
        1,
        0,
        1,
        0,
        blk.z1 - blk.z0,
        H,
        { tint: brickT },
      ); // west face
      b.face(
        "brick_tan",
        blk.x1,
        0,
        blk.z1,
        0,
        0,
        -1,
        0,
        1,
        0,
        blk.z1 - blk.z0,
        H,
        { tint: brickT },
      ); // east face
      b.face(
        "brick_tan",
        blk.x1,
        0,
        blk.z0,
        -1,
        0,
        0,
        0,
        1,
        0,
        blk.x1 - blk.x0,
        H,
        { tint: brickT },
      ); // north face (street)
      b.face(
        "brick_tan",
        blk.x0,
        0,
        blk.z1,
        1,
        0,
        0,
        0,
        1,
        0,
        blk.x1 - blk.x0,
        H,
        { tint: brickT },
      ); // south
      b.face(
        "concrete_dark",
        blk.x0,
        H,
        blk.z1,
        1,
        0,
        0,
        0,
        0,
        -1,
        blk.x1 - blk.x0,
        blk.z1 - blk.z0,
        { uv: "top", tint: [0.5, 0.5, 0.48] },
      );
      b.col(blk.x0, 0, blk.z0, blk.x1, H, blk.z1, { tag: "building" });
      // three shopfronts along the lane
      for (let k = 0; k < 3; k++) {
        const z0 = blk.z0 + k * 6.8 + 0.3,
          zc = z0 + 3.2,
          si = (side > 0 ? 0 : 3) + k;
        const [nm, bg, fg] = shopNames[si];
        // storefront (roll-down shutter half closed)
        K.window(b, fx, 1.7, zc, n[0], 0, 4.6, 2.9, {
          state: k === 1 ? "dark" : "glass",
          sill: false,
          frame: "paint_red",
          surround: "paint_red",
          surroundTint: [0.55, 0.12, 0.1],
          inset: 0.2,
        });
        b.boxMM(
          "corrugated",
          fx + side * 0.21,
          1.9,
          zc - 2.3,
          fx + side * 0.25,
          3.2,
          zc + 2.3,
          { tint: [0.6, 0.55, 0.45] },
        );
        // shop sign board (horizontal, glyphs + English)
        b.boxMM(
          "paint_red",
          Math.min(fx, fx + side * 0.3),
          3.35,
          zc - 2.5,
          Math.max(fx, fx + side * 0.3),
          4.35,
          zc + 2.5,
          { tint: [0.5, 0.1, 0.08] },
        );
        b.plate(
          "art",
          fx + side * 0.31,
          3.85,
          zc,
          n[0],
          0,
          4.8,
          0.95,
          hboard("ct_shop" + si, nm, 4, bg, fg, "#c8a040"),
          { off: 0.01 },
        );
        // pagoda eave over the 2nd floor + balcony
        const eaveY = 7.2;
        b.quadN(
          "rooftile",
          [fx, eaveY + 0.9, zc - 3.2],
          [fx, eaveY + 0.9, zc + 3.2],
          [fx + side * 1.4, eaveY, zc + 3.5],
          [fx + side * 1.4, eaveY, zc - 3.5],
          [side, 1, 0],
          { tint: [0.3, 0.58, 0.42], grime: 0.4 },
        );
        b.quadN(
          "paint_red",
          [fx, eaveY + 0.83, zc - 3.2],
          [fx, eaveY + 0.83, zc + 3.2],
          [fx + side * 1.4, eaveY - 0.07, zc + 3.5],
          [fx + side * 1.4, eaveY - 0.07, zc - 3.5],
          [-side, -1, 0],
          { tint: [0.42, 0.1, 0.07], grime: 0.3 },
        );
        for (const e of [-1, 1])
          b.beam(
            "rooftile",
            fx + side * 1.4,
            eaveY,
            zc + e * 3.5,
            fx + side * 1.7,
            eaveY + 0.45,
            zc + e * 3.9,
            0.18,
            0.12,
            { tint: [0.3, 0.58, 0.42] },
          );
        b.beam(
          "paint_red",
          fx + side * 1.4,
          eaveY - 0.05,
          zc - 3.5,
          fx + side * 1.4,
          eaveY - 0.05,
          zc + 3.5,
          0.14,
          0.18,
          { tint: [0.65, 0.14, 0.1] },
        );
        // 2nd/3rd floor windows
        for (const wy of [5.6, 9.6])
          for (const dz of [-1.6, 1.6])
            K.window(b, fx, wy, zc + dz, n[0], 0, 1.1, 1.7, {
              state: r() < 0.35 ? "boarded" : r() < 0.5 ? "broken" : "glass",
              frame: "paint_green",
              lintel: 0.15,
              trimTint: [0.7, 0.66, 0.58],
              reveal: "brick_tan",
            });
        b.boxMM(
          "paint_red",
          Math.min(fx, fx + side * 1.0),
          4.9,
          zc - 2.6,
          Math.max(fx, fx + side * 1.0),
          5.0,
          zc + 2.6,
          { tint: [0.55, 0.12, 0.1] },
        ); // balcony slab
        for (let t = -2.5; t <= 2.5; t += 0.35)
          b.beam(
            "paint_red",
            fx + side * 1.0,
            5.0,
            zc + t,
            fx + side * 1.0,
            5.9,
            zc + t,
            0.04,
            0.04,
            { tint: [0.6, 0.14, 0.1] },
          );
        b.beam(
          "paint_red",
          fx + side * 1.0,
          5.9,
          zc - 2.6,
          fx + side * 1.0,
          5.9,
          zc + 2.6,
          0.08,
          0.06,
          { tint: [0.6, 0.14, 0.1] },
        );
        // vertical signboard
        b.boxMM(
          "paint_black",
          Math.min(fx, fx + side * 1.2),
          8.2,
          zc + 2.8,
          Math.max(fx, fx + side * 1.2),
          12.2,
          zc + 3.05,
          {},
        );
        for (const s of [-1, 1])
          b.plate(
            "art",
            fx + side * 0.6,
            10.2,
            zc + 2.925 + s * 0.13,
            0,
            s,
            1.1,
            3.8,
            vboard(
              "ct_vb" + si,
              5,
              ["#7a1a12", "#1a1a1a", "#e8c040"][k % 3],
              ["#f0d060", "#e03020", "#7a1010"][k % 3],
              "#c8a040",
            ),
            { off: 0.01 },
          );
        // produce crates on the sidewalk (fish market / bakery)
        if (si === 4 || si === 2)
          for (let c = 0; c < 3; c++) {
            b.box(
              "wood_rotten",
              fx + side * 1.2,
              0,
              zc - 1.5 + c * 1.5,
              0.9,
              0.5,
              0.6,
              { tint: [0.6, 0.5, 0.36] },
            );
            b.col(
              fx + side * 0.75 - 0.05,
              0,
              zc - 1.8 + c * 1.5,
              fx + side * 1.65 + 0.05,
              0.5,
              zc - 1.2 + c * 1.5,
              {},
            );
          }
      }
      // cornice & parapet with small pagoda on the street corner
      // (round 2: this used to be ONE red box over the whole footprint — every aerial showed two bright red slabs.
      //  Now a lacquered cornice ring + brick parapet round a tar roof with NYC rooftop clutter.)
      roofRing(b, blk, side, H, brickT);
      rooftop(b, r, blk, side, H);
      const px = side > 0 ? blk.x1 - 4 : blk.x0 + 4,
        pz = blk.z0 + 4;
      b.boxMM("brick_tan", px - 3, H, pz - 3, px + 3, H + 3, pz + 3, {
        tint: brickT,
      });
      for (const s of [-1, 1])
        for (const t of [-1, 1])
          b.cyl(
            "paint_red",
            px + s * 2.6,
            H + 3,
            pz + t * 2.6,
            0.18,
            0.18,
            2.2,
            8,
            { tint: [0.6, 0.12, 0.1] },
          );
      pagodaRoof(b, px, H + 5.2, pz, 6.2, 6.2, 1.8, 1.1, 0.7);
      pagodaRoof(b, px, H + 3.0, pz, 6.8, 6.8, 0.5, 1.2, 0.5);
      // street-side (north) storefront with a big neon
      K.window(b, (blk.x0 + blk.x1) / 2, 1.7, blk.z0, 0, -1, 8, 2.9, {
        state: "broken",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: [0.55, 0.12, 0.1],
        inset: 0.2,
      });
      streetFacade(b, r, blk, side, H);
      outerFacades(b, r, blk, side, H);
    }
    b.plate(
      "neon",
      (WEST.x0 + WEST.x1) / 2,
      4.1,
      WEST.z0 - 0.1,
      0,
      -1,
      6.5,
      1.1,
      K.neonCell("ct_neon_w", "CHINATOWN", 512, 96, {
        color: "#ffcc30",
        font: "Georgia, serif",
        border: true,
      }),
    );
    b.plate(
      "neon",
      (EAST.x0 + EAST.x1) / 2,
      4.1,
      EAST.z0 - 0.1,
      0,
      -1,
      6.5,
      1.1,
      K.neonCell("ct_neon_e", "JADE PALACE", 512, 96, {
        color: "#40ff90",
        font: "Georgia, serif",
        broken: 2,
      }),
    );
    b.glow((WEST.x0 + WEST.x1) / 2, 4.1, WEST.z0 - 0.8, [1, 0.75, 0.2], 4);

    // ---- the lane: paving, lanterns, trash ----
    b.face(
      "sidewalk",
      LANE.x0 - 0.5,
      0.02,
      REST.z0,
      1,
      0,
      0,
      0,
      0,
      -1,
      LANE.x1 - LANE.x0 + 1,
      REST.z0 - LANE.z0 + 1,
      { uv: "top", tint: [0.7, 0.66, 0.6] },
    );
    for (let z = 501; z < 518; z += 3.2) {
      b.pipe("black_iron", WEST.x1, 7.0, z, EAST.x0, 7.0, z + 0.4, 0.008, 3);
      for (let x = WEST.x1 + 1.2; x < EAST.x0 - 0.8; x += 1.6) {
        const sag = Math.sin(((x - WEST.x1) / (EAST.x0 - WEST.x1)) * PI) * 0.5;
        K.lamp(b, x, 6.45 - sag, z + 0.2, "lantern", [1, 0.35, 0.2], 0, 0, {
          ceil: 7.0 - sag,
          size: 0.3,
          glowSize: 1.2,
        });
      }
    }
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        156 + r() * 8,
        0.03 + k * 0.001,
        500 + r() * 16,
        1.6,
        1.6,
        r() * 6,
        K.decal(k % 2 ? "grime" : "scorch", k),
      );
    b.hplate("metal_dark", MANHOLE.x, 0.04, MANHOLE.z, 0.9, 0.9, 0.3, null, {
      tint: [0.35, 0.33, 0.3],
    });
    b.cyl("rust", MANHOLE.x, 0.02, MANHOLE.z, 0.55, 0.55, 0.03, 12, {
      tint: [0.4, 0.35, 0.3],
    });

    // ---- the PAIFANG gate at the lane mouth (z ≈ 498) ----
    {
      const gz = 496.8,
        gx = 160;
      const red = [0.7, 0.12, 0.08];
      for (const [x, h, rr] of [
        [-4.2, 9.6, 0.4],
        [4.2, 9.6, 0.4],
        [-7.2, 6.8, 0.32],
        [7.2, 6.8, 0.32],
      ]) {
        b.cyl("paint_red", gx + x, 0, gz, rr, rr * 0.9, h, 12, { tint: red });
        b.boxMM(
          "granite",
          gx + x - rr * 1.5,
          0,
          gz - rr * 1.5,
          gx + x + rr * 1.5,
          0.7,
          gz + rr * 1.5,
          { tint: [0.5, 0.48, 0.45] },
        );
        b.col(gx + x - rr, 0, gz - rr, gx + x + rr, h, gz + rr, {
          tag: "gate",
          walkable: false,
        });
      }
      // lintels & bracket sets (main bay: tie beam, red lintel, green frieze with the plaque, gold dougong brackets)
      b.boxMM(
        "paint_red",
        gx - 4.5,
        6.9,
        gz - 0.25,
        gx + 4.5,
        7.25,
        gz + 0.25,
        { tint: red },
      );
      b.boxMM("paint_red", gx - 4.8, 7.8, gz - 0.4, gx + 4.8, 8.5, gz + 0.4, {
        tint: red,
      });
      b.boxMM(
        "paint_green",
        gx - 4.6,
        8.55,
        gz - 0.34,
        gx + 4.6,
        9.5,
        gz + 0.34,
        { tint: [0.25, 0.45, 0.4] },
      );
      for (let x = -4.4; x <= 4.4; x += 0.55)
        b.boxMM(
          "gold",
          gx + x - 0.13,
          9.5,
          gz - 0.45,
          gx + x + 0.13,
          9.9,
          gz + 0.45,
          {},
        );
      for (const s of [-1, 1]) {
        b.boxMM(
          "paint_red",
          gx + s * 7.7,
          5.3,
          gz - 0.3,
          gx + s * 3.9,
          5.9,
          gz + 0.3,
          { tint: red },
        );
        b.boxMM(
          "paint_green",
          gx + s * 7.5,
          5.0,
          gz - 0.2,
          gx + s * 4.3,
          5.3,
          gz + 0.2,
          { tint: [0.25, 0.45, 0.4] },
        );
        for (let x = 4.3; x <= 7.4; x += 0.55)
          b.boxMM(
            "gold",
            gx + s * x - 0.1,
            5.9,
            gz - 0.38,
            gx + s * x + 0.1,
            6.2,
            gz + 0.38,
            {},
          );
      }
      // central plaque (gold glyphs on blue) both sides
      const plaque = hboard(
        "ct_gate_plaque",
        "",
        3,
        "#1a3a5a",
        "#f0d060",
        "#e0b040",
      );
      b.plate("art", gx, 9.02, gz - 0.35, 0, -1, 3.6, 0.9, plaque, {
        off: 0.01,
      });
      b.plate("art", gx, 9.02, gz + 0.35, 0, 1, 3.6, 0.9, plaque, {
        off: 0.01,
      });
      // roofs: main (tall, two tiers) + side roofs
      pagodaRoof(b, gx, 10.0, gz, 9.6, 1.2, 1.8, 1.2, 0.8);
      for (const s of [-1, 1])
        pagodaRoof(b, gx + s * 5.8, 6.3, gz, 3.9, 1.0, 1.1, 0.9, 0.55);
      // red lanterns hanging in the main bay
      for (const x of [-2.6, 0, 2.6])
        K.lamp(b, gx + x, 6.3, gz, "lantern", [1, 0.35, 0.2], 0, 0, {
          ceil: 6.9,
          size: 0.45,
          glowSize: 1.8,
        });
      b.burn(gx + 3, 7, gz, 3, 0.5);
      // guardian lions (stylised)
      for (const s of [-1, 1]) {
        const lx = gx + s * 5.6,
          lz = gz - 1.4;
        b.boxMM("granite", lx - 0.6, 0, lz - 0.6, lx + 0.6, 1.0, lz + 0.6, {
          tint: [0.55, 0.52, 0.48],
        });
        b.geo("granite", K.sphereGeo(), {
          x: lx,
          y: 1.6,
          z: lz,
          sx: 0.45,
          sy: 0.6,
          sz: 0.4,
          tint: [0.55, 0.52, 0.48],
        });
        b.geo("granite", K.sphereGeo(), {
          x: lx,
          y: 2.3,
          z: lz - 0.1,
          s: 0.34,
          tint: [0.55, 0.52, 0.48],
        });
        b.col(lx - 0.6, 0, lz - 0.6, lx + 0.6, 2.4, lz + 0.6, {
          walkable: false,
        });
      }
    }

    // ---- the GOLDEN DRAGON restaurant ----
    {
      const R = REST,
        fz = R.z0,
        Hh = 10;
      b.face("brick_tan", R.x1, 0, fz, -1, 0, 0, 0, 1, 0, R.x1 - R.x0, Hh, {
        tint: [0.7, 0.2, 0.16],
      }); // front (−z) painted red
      b.face("brick_tan", R.x0, 0, fz, 0, 0, 1, 0, 1, 0, R.z1 - R.z0, Hh, {
        tint: brickT,
      });
      b.face("brick_tan", R.x1, 0, R.z1, 0, 0, -1, 0, 1, 0, R.z1 - R.z0, Hh, {
        tint: brickT,
      });
      b.col(R.x0, 0, fz, R.x1, Hh, R.z1, { tag: "building" });
      // columns & doors
      for (const x of [R.x0 + 2, 156.5, 163.5, R.x1 - 2]) {
        b.cyl("paint_red", x, 0, fz - 0.6, 0.3, 0.3, 4.6, 12, {
          tint: [0.72, 0.12, 0.08],
        });
        b.col(x - 0.3, 0, fz - 0.9, x + 0.3, 4.6, fz - 0.3, {
          walkable: false,
        });
        b.cyl("gold", x, 4.5, fz - 0.6, 0.38, 0.3, 0.2, 12);
      }
      b.boxMM("paint_red", R.x0, 4.6, fz - 1.2, R.x1, 5.0, fz, {
        tint: [0.55, 0.1, 0.08],
      });
      b.boxMM("paint_black", 158.3, 0, fz - 0.05, 161.7, 3.4, fz, {
        tint: [0.1, 0.08, 0.06],
      });
      for (const s of [-1, 1]) {
        b.plate(
          "lacquer",
          160 + s * 0.82,
          1.65,
          fz - 0.08,
          0,
          -1,
          1.55,
          3.1,
          null,
          { tint: [0.9, 0.9, 0.9] },
        );
        b.cyl("gold", 160 + s * 0.15, 1.5, fz - 0.14, 0.09, 0.09, 0.04, 10);
      }
      for (const x of [152.5, 167.5])
        K.window(b, x, 2.1, fz, 0, -1, 3.4, 2.6, {
          state: "glass",
          sill: false,
          frame: "gold",
          surround: "paint_red",
          surroundTint: [0.55, 0.12, 0.1],
          inset: 0.2,
        });
      // pagoda roof over the front + upper storey
      pagodaRoof(b, 160, 5.0, fz + 1.2, R.x1 - R.x0, 3.6, 1.6, 1.2, 0.7);
      for (let x = R.x0 + 2.5; x < R.x1 - 1; x += 3.4)
        K.window(b, x, 7.8, fz, 0, -1, 1.3, 1.8, {
          state: r() < 0.5 ? "broken" : "glass",
          frame: "gold",
          lintel: 0.15,
          trimTint: [0.8, 0.7, 0.4],
        });
      pagodaRoof(
        b,
        160,
        Hh,
        (fz + R.z1) / 2,
        R.x1 - R.x0 - 1,
        R.z1 - fz - 1,
        2.6,
        1.0,
        0.8,
        [0.75, 0.6, 0.25],
      );
      // big sign + neon
      const gd = K.neonCell("ct_gd", "GOLDEN DRAGON", 768, 128, {
        color: "#ffc830",
        font: "Georgia, serif",
        border: true,
      });
      b.plate("paint_black", 160, 6.2, fz - 1.25, 0, -1, 12, 1.4, null, {
        tint: [0.25, 0.1, 0.08],
      });
      b.plate("neon", 160, 6.2, fz - 1.3, 0, -1, 11.4, 1.25, gd);
      b.glow(160, 6.2, fz - 2, [1, 0.7, 0.2], 5);
      const cs = K.neonCell("ct_chopsuey", "CHOP SUEY", 96, 512, {
        color: "#ff3a2a",
        vertical: true,
        font: "Arial Black, sans-serif",
      });
      b.boxMM(
        "paint_black",
        R.x1 - 1.2,
        5.5,
        fz - 1.6,
        R.x1 - 0.9,
        9.8,
        fz,
        {},
      );
      b.plate("neon", R.x1 - 1.05, 7.65, fz - 1.62, 0, -1, 0.7, 4.1, cs, {
        off: 0.01,
      });
      b.plate("neon", R.x1 - 1.22, 7.65, fz - 0.8, -1, 0, 1.4, 4.1, cs, {
        off: 0.01,
      });
      b.glow(R.x1 - 1.05, 7.65, fz - 2.2, [1, 0.25, 0.15], 4);
      // THE DRAGON: a serpentine gold body across the upper façade
      const pts = [];
      for (let k = 0; k <= 36; k++) {
        const t = k / 36;
        pts.push([
          R.x0 + 1.5 + t * (R.x1 - R.x0 - 3),
          8.6 + Math.sin(t * PI * 3) * 0.7,
          fz - 0.35 - Math.sin(t * PI * 3 + 1) * 0.12,
        ]);
      }
      for (let k = 0; k < pts.length - 1; k++) {
        const a = pts[k],
          c = pts[k + 1],
          rr = 0.22 * (0.5 + 0.5 * Math.sin((k / 36) * PI));
        b.pipe("gold", a[0], a[1], a[2], c[0], c[1], c[2], rr + 0.06, 8, {
          tint: [0.95, 0.75, 0.3],
        });
        if (k % 2 === 0)
          b.box("paint_red", a[0], a[1] + rr, a[2], 0.18, 0.25, 0.08, {
            tint: [0.8, 0.2, 0.1],
          });
      }
      const head = pts[pts.length - 1];
      b.geo("gold", K.sphereGeo(), {
        x: head[0] + 0.3,
        y: head[1] + 0.1,
        z: head[2],
        sx: 0.55,
        sy: 0.4,
        sz: 0.35,
        tint: [0.95, 0.75, 0.3],
      });
      b.box(
        "paint_red",
        head[0] + 0.8,
        head[1] - 0.05,
        head[2],
        0.5,
        0.12,
        0.25,
        { tint: [0.8, 0.15, 0.1] },
      ); // jaw
      for (const s of [-1, 1])
        b.pipe(
          "gold",
          head[0] + 0.2,
          head[1] + 0.3,
          head[2] + s * 0.1,
          head[0] - 0.4,
          head[1] + 0.9,
          head[2] + s * 0.25,
          0.05,
          5,
        ); // horns
      b.glow(head[0] + 0.55, head[1] + 0.2, head[2] - 0.3, [1, 0.3, 0.1], 0.6);
      // lanterns under the eave
      for (let x = R.x0 + 1; x < R.x1; x += 2.2)
        K.lamp(b, x, 4.1, fz - 1.0, "lantern", [1, 0.35, 0.2], 0, 0, {
          ceil: 4.6,
          size: 0.34,
          glowSize: 1.4,
        });
    }
    // burnt cars & rubble in the lane / street
    K.rubble(b, 150, 0, 495, 2.4, 1.1, { seed: 4 });
    b.burn(163, 1, 510, 4, 0.6);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_chinatown_ext";
    K.anchor(ctx, "door", 160, 0, REST.z0 - 2.2, false);
    K.anchor(ctx, "gate", 160, 0, 496, false);
    K.anchor(ctx, "manhole", MANHOLE.x, 0, MANHOLE.z, false);
    K.loot(ctx, "car", 172, 0, 492, 0.3, { world: true, burnt: true });
    K.loot(ctx, "barrel", 157, 0, 506, 0, {
      world: true,
      radioactive: true,
      container: false,
    });
    K.loot(ctx, "dumpster", 165, 0, 515, -HP, {
      world: true,
      loot: "dumpster",
    });
    K.skel(ctx, 158.5, 0, 509, 1.2, "lying", { world: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
  let shelf = null; // the movable shelf {group, col, open}
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "chinatown_int",
      off: O,
      lit: true,
      amb: [0.11, 0.095, 0.08],
      floors: [0, BUNK],
      grime: 0.5,
    });
    const r = K.rng("ct_int");
    const lacq = [0.62, 0.14, 0.1];
    const DR = [-10.1, -0.2, -14.1, 10.1, 4.2, 0.1];

    // ---------------- dining room (x −10..10, z −14..0) ----------------
    K.gap(ctx, 0, 0, 2.0, 0, 3.0);
    K.gap(ctx, 6, -14, 1.3, 0, 2.3);
    K.gap(ctx, -3, -14, 1.2, 0, 2.3);
    K.room(b, ctx, {
      x0: -10,
      z0: -14,
      x1: 10,
      z1: 0,
      y: 0,
      h: 4,
      floor: "carpet",
      fc: [0.75, 0.3, 0.22],
      wall: "lacquer",
      wc: [0.9, 0.85, 0.8],
      wain: "wood_dark",
      wainC: [0.4, 0.14, 0.1],
      wainH: 1.0,
      ceil: "lacquer",
      cc: [0.55, 0.3, 0.2],
      cornice: true,
      corniceMat: "gold",
    });
    // lacquer columns with gold dragons coiling (stylised rings)
    for (const [x, z] of [
      [-5, -4.5],
      [5, -4.5],
      [-5, -10],
      [5, -10],
    ]) {
      b.cyl("paint_red", x, 0, z, 0.32, 0.32, 4, 12, {
        tint: [0.75, 0.14, 0.1],
      });
      for (let k = 0; k < 7; k++) {
        const y = 0.6 + k * 0.45,
          a = k * 0.9;
        b.geo("gold", K.sphereGeo(), {
          x: x + Math.cos(a) * 0.33,
          y,
          z: z + Math.sin(a) * 0.33,
          s: 0.1,
          tint: [0.95, 0.75, 0.3],
        });
      }
      b.col(x - 0.32, 0, z - 0.32, x + 0.32, 4, z + 0.32, { walkable: false });
    }
    // dragon mural (north wall)
    const mural = K.paint(
      "art",
      "ct_mural",
      512,
      192,
      function (x, X, Y, W, H) {
        x.fillStyle = "#7a1a10";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#e8b040";
        x.lineWidth = 16;
        x.lineCap = "round";
        x.beginPath();
        for (let k = 0; k <= 60; k++) {
          const t = k / 60,
            px = X + 30 + t * (W - 90),
            py = Y + H / 2 + Math.sin(t * 12) * H * 0.25;
          if (k) x.lineTo(px, py);
          else x.moveTo(px, py);
        }
        x.stroke();
        x.lineWidth = 3;
        x.strokeStyle = "#7a1a10";
        for (let k = 0; k < 60; k++) {
          const t = k / 60,
            px = X + 30 + t * (W - 90),
            py = Y + H / 2 + Math.sin(t * 12) * H * 0.25;
          x.beginPath();
          x.arc(px, py, 4, 0, PI);
          x.stroke();
        }
        x.fillStyle = "#e8b040";
        x.beginPath();
        x.ellipse(
          X + W - 55,
          Y + H / 2 + Math.sin(12) * H * 0.25,
          32,
          22,
          0,
          0,
          6.3,
        );
        x.fill();
        x.fillStyle = "#ffffff";
        x.beginPath();
        x.arc(X + W - 45, Y + H / 2 + Math.sin(12) * H * 0.25 - 6, 5, 0, 6.3);
        x.fill();
        x.fillStyle = "rgba(255,240,200,0.8)";
        x.beginPath();
        x.arc(X + 60, Y + 40, 18, 0, 6.3);
        x.fill(); // pearl
        for (let k = 0; k < 20; k++) {
          x.fillStyle = "rgba(240,200,120,0.3)";
          x.beginPath();
          x.arc(
            X + Math.random() * W,
            Y + Math.random() * H,
            10 + Math.random() * 20,
            0,
            6.3,
          );
          x.fill();
        }
        K.stains(x, X, Y, W, H, 10, 5, 0.4);
      },
    );
    K.framed(b, 0, 2.4, -13.88, 0, 1, 7.5, 2.6, mural, {
      frame: "gold",
      fw: 0.14,
    });
    // round tables, lazy susans, stools
    for (const [tx, tz] of [
      [-7.5, -2.5],
      [-2.5, -2.2],
      [2.5, -2.2],
      [7.5, -2.5],
      [-7.5, -7.3],
      [0, -7.3],
      [7.5, -7.3],
      [-7.5, -11.5],
      [-2, -11.6],
      [2.8, -11.6],
    ]) {
      const up = r() < 0.8;
      if (up) {
        K.roundTable(b, tx, 0, tz, 0.85, {
          mat: "wood_dark",
          cloth: [0.9, 0.85, 0.75],
        });
        b.cyl("wood_dark", tx, 0.76, tz, 0.4, 0.4, 0.04, 16, {
          tint: [0.5, 0.25, 0.15],
        }); // lazy susan
        for (let k = 0; k < 4; k++) {
          const a = (k * PI) / 2 + r();
          b.cyl(
            "ceramic",
            tx + Math.cos(a) * 0.25,
            0.8,
            tz + Math.sin(a) * 0.25,
            0.1,
            0.08,
            0.05,
            8,
            { tint: [0.9, 0.9, 0.95] },
          );
        }
        for (let k = 0; k < 6; k++) {
          const a = (k * PI) / 3;
          K.chair(
            b,
            tx + Math.cos(a) * 1.2,
            0,
            tz + Math.sin(a) * 1.2,
            Math.atan2(Math.cos(a), Math.sin(a)),
            { mat: "wood_dark", fallen: r() < 0.15, tint: [0.6, 0.3, 0.2] },
          );
        }
      } else {
        b.box("wood_dark", tx, 0, tz, 1.7, 0.06, 1.7, {
          yaw: r(),
          tint: [0.5, 0.3, 0.2],
        });
        b.box("wood_dark", tx + 0.5, 0, tz, 0.08, 0.7, 0.08, { yaw: 1.3 });
      }
    }
    // hanging lanterns
    for (const [x, z] of [
      [-7.5, -2.5],
      [-2.5, -2.2],
      [2.5, -2.2],
      [7.5, -2.5],
      [-7.5, -7.3],
      [0, -7.3],
      [7.5, -7.3],
      [-2, -11.6],
      [2.8, -11.6],
    ])
      K.lamp(
        b,
        x,
        2.9,
        z,
        "lantern",
        [1, 0.45, 0.25],
        r() < 0.3 ? 0 : 0.7,
        5.5,
        { ceil: 4, size: 0.42, dead: r() < 0.2, lightOpts: { box: DR } },
      );
    b.light(0, 3.6, -7, [1, 0.55, 0.35], 0.5, 12, { box: DR });
    // cashier + lucky cat, aquarium, screen, altar
    b.boxMM("lacquer", 6.4, 0, -1.8, 9.8, 1.1, -0.9, { tint: [0.8, 0.8, 0.8] });
    b.col(6.4, 0, -1.8, 9.8, 1.1, -0.9, { tag: "counter" });
    b.geo("ceramic", K.sphereGeo(), {
      x: 7.2,
      y: 1.28,
      z: -1.35,
      sx: 0.14,
      sy: 0.18,
      sz: 0.12,
      tint: [0.95, 0.92, 0.85],
    });
    b.geo("ceramic", K.sphereGeo(), {
      x: 7.2,
      y: 1.5,
      z: -1.35,
      s: 0.11,
      tint: [0.95, 0.92, 0.85],
    });
    b.pipe("ceramic", 7.29, 1.35, -1.35, 7.33, 1.62, -1.35, 0.035, 5, {
      tint: [0.95, 0.92, 0.85],
    }); // the waving paw
    b.boxMM("glass_clear", -9.8, 0.8, -9, -8.9, 1.9, -5, {
      tint: [0.5, 0.7, 0.65],
    });
    b.boxMM("wood_dark", -9.8, 0, -9, -8.9, 0.8, -5, {});
    b.col(-9.8, 0, -9, -8.9, 1.9, -5, {});
    b.light(-9, 1.4, -7, [0.3, 0.8, 0.7], 0.5, 3, { box: DR });
    for (let k = 0; k < 4; k++)
      b.hplate(
        "decal",
        -8.4,
        0.013 + k * 0.001,
        -8.5 + k,
        0.8,
        0.8,
        r() * 6,
        K.decal("puddle", k),
      );
    b.boxMM("lacquer", 8.9, 0, -9, 9.8, 1.0, -6, { tint: [0.8, 0.7, 0.6] }); // ancestor altar
    b.col(8.9, 0, -9, 9.8, 1.0, -6, {});
    for (let k = 0; k < 3; k++)
      b.cyl("gold", 9.3, 1.0, -8.5 + k * 0.9, 0.08, 0.1, 0.15, 8);
    b.glow(9.3, 1.3, -7.5, [1, 0.5, 0.2], 0.4);
    b.light(9, 1.4, -7.5, [1, 0.5, 0.2], 0.5, 3, { box: DR });
    K.framed(
      b,
      9.88,
      2.4,
      -7.5,
      -1,
      0,
      1.2,
      1.6,
      K.photo("family", 3, 128, 176),
      { frame: "wood_dark" },
    );
    for (let k = 0; k < 6; k++)
      K.framed(
        b,
        -9.88,
        2.6,
        -1.5 - k * 1.9,
        1,
        0,
        0.5,
        1.2,
        vboard("ct_scroll" + k, 4, "#e8dcc0", "#1a1410", null),
        { frame: "wood_dark", fw: 0.04 },
      );
    K.litter(b, -9.5, -13.5, 9.5, -0.5, 0, 24, 31);
    // the dead Vanguard scavenger with the intercept tape reel
    K.skel(ctx, -3.8, 0, -5.8, 2.4, "reaching");
    K.note(ctx, "pv_reel_ct_intercept", -3.3, 0.03, -5.4, {
      type: "tape",
      name: "Tape Reel: Strange Signal",
      title: "Recorded by R. Nnadi (Vanguard scavenger)",
      text: "[Static. A man, whispering.]\n\n\"Day two tracking the numbers station. It's not on any band the Vanguard radio knows. It's coming from UNDER the Golden Dragon. Same sequence every hour — numbers, then a march, then a woman reading a list in French. French, in Chinatown. Old Mrs. Lum from the bakery says the restaurant's landlord was some import company nobody ever met.\n\nThe storeroom. There's a draft behind the big shelf. Cold air. Machine oil.\n\nThe Maniacs don't go in the storeroom. They go around it. Like they're... told to.\n\nSomething's moving in the kitchen. Stopping the tape—\"\n\n[End of recording.]",
    });

    // ---------------- kitchen (x 2..10, z −24..−14) ----------------
    const KB = [1.9, -0.2, -24.1, 10.1, 3.8, -13.9];
    K.gap(ctx, 2, -19, 1.2, 0, 2.2);
    K.room(b, ctx, {
      x0: 2,
      z0: -24,
      x1: 10,
      z1: -14,
      y: 0,
      h: 3.6,
      floor: "tile",
      fc: [0.65, 0.62, 0.55],
      wall: "tile",
      wc: [0.78, 0.76, 0.68],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.44],
    });
    b.boxMM("steel", 8.8, 0, -23.8, 9.9, 0.95, -15, {
      tint: [0.55, 0.56, 0.55],
    }); // wok line
    for (let z = -23; z < -15.5; z += 1.6) {
      b.cyl("black_iron", 9.35, 0.95, z, 0.34, 0.12, 0.2, 12, {
        top: false,
        tint: [0.3, 0.3, 0.3],
      });
      b.glow(9.35, 0.9, z, [0.3, 0.5, 1], 0.3);
    }
    b.boxMM("steel", 8.6, 2.0, -23.9, 10, 2.6, -15, {
      tint: [0.45, 0.45, 0.44],
    }); // hood
    b.col(8.8, 0, -23.8, 9.9, 0.95, -15, { tag: "counter" });
    for (let k = 0; k < 4; k++) {
      const sz = -23 + k * 0.6;
      for (let j = 0; j < 3; j++)
        b.cyl("wood", 3, 0.9 + j * 0.16, sz, 0.28, 0.28, 0.15, 12, {
          tint: [0.75, 0.62, 0.42],
        });
    }
    b.boxMM("steel", 2.2, 0, -23.8, 3.8, 0.9, -21.2, {
      tint: [0.55, 0.56, 0.55],
    });
    b.col(2.2, 0, -23.8, 3.8, 0.9, -21.2, { tag: "counter" });
    b.pipe("steel", 4.5, 2.4, -17, 8.2, 2.4, -17, 0.02, 4);
    for (let k = 0; k < 6; k++) {
      const x = 4.8 + k * 0.6;
      b.pipe("steel", x, 2.4, -17, x, 2.0, -17, 0.008, 3);
      b.geo("meat", K.sphereGeo(), {
        x,
        y: 1.6,
        z: -17,
        sx: 0.18,
        sy: 0.35,
        sz: 0.14,
        tint: [0.55, 0.3, 0.18],
      });
    } // roast ducks (long dead)
    b.boxMM("wood", 4.4, 0, -20.4, 7.6, 0.9, -19.4, {
      tint: [0.6, 0.45, 0.32],
    });
    b.col(4.4, 0, -20.4, 7.6, 0.9, -19.4, { tag: "counter" });
    b.cyl("wood", 5, 0.9, -19.9, 0.35, 0.35, 0.18, 12, {
      tint: [0.55, 0.4, 0.28],
    }); // chopping block
    for (let k = 0; k < 5; k++)
      b.box("fabric", 9.4 - k * 0.1, 0, -14.8 + (k % 2) * 0.1, 0.5, 0.35, 0.7, {
        yaw: k * 0.3,
        tint: [0.85, 0.8, 0.65],
      }); // rice sacks
    K.lamp(b, 6, 3.3, -19, "tube", [0.9, 0.95, 1.0], 0.8, 7, {
      ceil: 3.6,
      len: 1.4,
      lightOpts: { box: KB },
    });
    for (let k = 0; k < 4; k++)
      b.hplate(
        "decal",
        3 + r() * 6,
        0.012 + k * 0.001,
        -23 + r() * 8,
        1.3,
        1.3,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", k + 40),
      );
    K.loot(ctx, "fridge", 2.5, 0, -15.2, HP, { loot: "fridge" });
    // fresh digging in the kitchen corner: the Glowkeepers are tunnelling toward the Commandant's office (mq31)
    b.hplate("decal", 6.1, 0.014, -22.7, 1.6, 1.6, 0.3, K.decal("scorch", 77));
    b.cyl("rubble", 6.1, -0.05, -22.7, 0.75, 0.55, 0.1, 10, {
      tint: [0.12, 0.1, 0.09],
    });
    K.rubble(b, 6.9, 0, -23.3, 0.6, 0.45, { seed: 71, col: false });
    K.rubble(b, 5.2, 0, -23.2, 0.5, 0.35, { seed: 72, col: false });
    K.anchor(ctx, "dig", 6.1, 0.3, -22.2);
    K.anchor(ctx, "glow1", 6.4, 0, -20.9);
    K.anchor(ctx, "glow2", 5.3, 0, -16.2);

    // ---------------- storeroom (x −10..2, z −24..−14) + the moving shelf ----------------
    const SB = [-10.1, -0.2, -24.1, 2.1, 3.8, -13.9];
    K.gap(ctx, -4, -24, 1.4, 0, 2.3); // the secret doorway (hidden by the shelf)
    K.room(b, ctx, {
      x0: -10,
      z0: -24,
      x1: 2,
      z1: -14,
      y: 0,
      h: 3.6,
      floor: "concrete",
      fc: [0.55, 0.52, 0.48],
      wall: "brick_tan",
      wc: [0.6, 0.52, 0.45],
      ceil: "plaster",
      cc: [0.45, 0.43, 0.4],
      trim: false,
    });
    K.shelf(b, -9.75, 0, -19, HP, 5.0, {
      mat: "wood",
      items: ["jar", "box", "can", "jar"],
      seed: 5,
    });
    K.shelf(b, -1, 0, -14.3, PI, 3.5, {
      mat: "wood",
      items: ["box", "box", "jar"],
      seed: 6,
    });
    for (let k = 0; k < 10; k++)
      b.box(
        "fabric",
        -8 + (k % 5) * 0.9,
        k > 4 ? 0.4 : 0,
        -15.2,
        0.8,
        0.4,
        0.55,
        { yaw: (r() - 0.5) * 0.3, tint: [0.85, 0.8, 0.65] },
      );
    b.col(-8.5, 0, -15.6, -4, 0.8, -14.8, {});
    K.lamp(b, -4, 3.2, -19, "bulb", [1, 0.8, 0.55], 0.95, 7.5, {
      ceil: 3.6,
      lightOpts: { box: SB },
    });
    b.hplate("decal", -4, 0.012, -23.2, 1.8, 1.0, 0, K.decal("grime", 60)); // drag marks by the shelf
    for (let k = 0; k < 5; k++)
      b.hplate(
        "flat",
        -5 + k * 0.5,
        0.013,
        -22.6 + (k % 2) * 0.3,
        0.05,
        1.2,
        0.1,
        null,
        { tint: [0.25, 0.22, 0.2] },
      );
    K.loot(ctx, "crate", -9, 0, -23, 0.2, {
      loot: "food_oldworld",
      name: "Dry Goods",
    });

    // ---------------- hidden stairway (x −5..−3, z −37..−24) ----------------
    const HB = [-5.2, BUNK - 0.2, -37.2, -2.8, 3.8, -23.8];
    K.room(b, ctx, {
      x0: -5,
      z0: -37,
      x1: -3,
      z1: -24,
      y: BUNK,
      h: 3.6 - BUNK,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "concrete",
      wc: [0.55, 0.53, 0.5],
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      trim: false,
    });
    b.boxMM("concrete", -5, -0.3, -25.2, -3, 0, -24, {
      tint: [0.5, 0.48, 0.45],
    });
    b.col(-5, -0.3, -25.2, -3, 0, -24, { tag: "floor" });
    K.stairs(b, -5, -36, -3, -25.2, BUNK, 0, "+z", {
      mat: "concrete",
      tint: [0.5, 0.48, 0.45],
      rail: "l",
      railMat: "metal_dark",
      handMat: "metal_dark",
    });
    for (const [z, y] of [
      [-27, -0.5],
      [-32, -3.4],
    ])
      K.lamp(b, -4, y + 2.4, z, "cage", [1, 0.15, 0.1], 0.9, 5, {
        ceil: y + 2.8,
        lightOpts: { box: HB },
      });
    b.plate(
      "art",
      -4,
      BUNK + 2.2,
      -36.88,
      0,
      1,
      1.4,
      1.0,
      poster("ct_post_stair", "VIGILANCE"),
      {},
    );

    // ---------------- POSTE DRAGON — the Bureau Sept relay station (y −6) ----------------
    const Y = BUNK;
    const wallC = [0.52, 0.55, 0.5],
      floorC = [0.45, 0.46, 0.44];
    // guard post (x −8..8, z −46..−37)
    const GP = [-8.1, Y - 0.2, -46.1, 8.1, Y + 3.4, -36.9];
    K.gap(ctx, -4, -37, 2.0, Y, 2.6);
    K.gap(ctx, 0, -46, 2.4, Y, 2.8);
    K.room(b, ctx, {
      x0: -8,
      z0: -46,
      x1: 8,
      z1: -37,
      y: Y,
      h: 3.2,
      floor: "concrete",
      fc: floorC,
      wall: "metal",
      wc: wallC,
      ceil: "metal_dark",
      cc: [0.4, 0.42, 0.4],
      trim: false,
    });
    for (let k = 0; k < 5; k++)
      b.box("fabric", -1.8 + k * 0.9, Y, -43.2, 0.85, 0.45, 0.5, {
        tint: [0.6, 0.55, 0.42],
      });
    for (let k = 0; k < 4; k++)
      b.box("fabric", -1.35 + k * 0.9, Y + 0.45, -43.2, 0.85, 0.45, 0.5, {
        tint: [0.55, 0.5, 0.4],
      });
    b.col(-2.3, Y, -43.5, 2.3, Y + 0.9, -42.9, { tag: "sandbags" });
    const gdt = K.table(b, 5.5, Y, -40, 1.6, 0.8, {
      mat: "metal",
      tint: [0.5, 0.55, 0.5],
    });
    K.terminal(
      ctx,
      "pv_term_ct_guard",
      5.9,
      gdt,
      -40.2,
      0,
      termGuard(),
      "bare",
    );
    b.plate(
      "art",
      7.88,
      Y + 1.8,
      -41.5,
      -1,
      0,
      0.9,
      1.3,
      poster("ct_post1", "LA FRANCE VOUS ÉCOUTE"),
      {},
    );
    b.plate(
      "art",
      -7.88,
      Y + 1.8,
      -41.5,
      1,
      0,
      0.9,
      1.3,
      poster("ct_post2", "LE SILENCE EST UNE ARME"),
      {},
    );
    // the blast door (open, rolled aside)
    b.boxMM("metal_dark", -2.9, Y, -46.35, -1.3, Y + 2.9, -45.7, {
      tint: [0.45, 0.5, 0.42],
    });
    b.cyl("metal_dark", -2.1, Y + 1.5, -45.7, 0.5, 0.5, 0.08, 16, {
      tint: [0.35, 0.4, 0.33],
    });
    b.boxMM("paint_yellow", -1.25, Y, -46.1, 1.25, Y + 0.05, -45.8, {
      tint: [0.8, 0.65, 0.2],
    });
    K.lamp(b, 0, Y + 2.9, -41, "cage", [1, 0.2, 0.15], 1.0, 8, {
      ceil: Y + 3.2,
      lightOpts: { box: GP },
    });
    K.lamp(b, 5.5, Y + 2.9, -39, "tube", [0.85, 1.0, 0.9], 0.6, 5, {
      ceil: Y + 3.2,
      lightOpts: { box: GP },
    });

    // main corridor (x −2..2, z −72..−46)
    const CB = [-2.1, Y - 0.2, -72.1, 2.1, Y + 3.4, -45.9];
    K.gap(ctx, -2, -52.5, 1.3, Y, 2.3);
    K.gap(ctx, 2, -53.5, 1.3, Y, 2.3);
    K.gap(ctx, -2, -65, 1.3, Y, 2.3);
    K.gap(ctx, 2, -65, 1.3, Y, 2.3);
    K.gap(ctx, 0, -72, 1.8, Y, 2.4);
    K.room(b, ctx, {
      x0: -2,
      z0: -72,
      x1: 2,
      z1: -46,
      y: Y,
      h: 3.0,
      floor: "concrete",
      fc: floorC,
      wall: "metal",
      wc: wallC,
      ceil: "metal_dark",
      cc: [0.38, 0.4, 0.38],
      trim: false,
    });
    for (let z = -70; z < -47; z += 3) {
      b.beam("metal_dark", -2, Y + 2.9, z, 2, Y + 2.9, z, 0.2, 0.2, {
        tint: [0.4, 0.42, 0.38],
      });
    }
    b.pipe("rust", 1.8, Y + 2.6, -46, 1.8, Y + 2.6, -72, 0.07, 5);
    b.pipe("paint_red", -1.8, Y + 2.7, -46, -1.8, Y + 2.7, -72, 0.04, 5, {
      tint: [0.6, 0.15, 0.1],
    });
    for (const z of [-49, -57, -61, -69]) {
      const sd = z === -57 || z === -69 ? 1 : -1;
      b.plate(
        "art",
        sd * 1.88,
        Y + 1.7,
        z,
        -sd,
        0,
        0.85,
        1.2,
        poster(
          "ct_post_c" + z,
          [
            "ÉCOUTER. NOTER. TRANSMETTRE.",
            "LA MISSION CONTINUE",
            "PARIS ATTEND VOS RAPPORTS",
            "LA PATIENCE EST UN DEVOIR",
          ][Math.abs(z) % 4],
        ),
        {},
      );
    }
    for (const z of [-50, -58, -66])
      K.lamp(b, 0, Y + 2.7, z, "cage", [1, 0.25, 0.18], 1.1, 7, {
        ceil: Y + 3.0,
        lightOpts: { box: CB },
      });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        (r() - 0.5) * 2.5,
        Y + 0.012 + k * 0.001,
        -48 - r() * 22,
        1.4,
        1.4,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", k + 50),
      );

    // radio-intercept room (x −14..−2, z −59..−47)
    const RB = [-14.1, Y - 0.2, -59.1, -1.9, Y + 3.4, -46.9];
    K.room(b, ctx, {
      x0: -14,
      z0: -59,
      x1: -2,
      z1: -47,
      y: Y,
      h: 3.2,
      floor: "metal",
      fc: [0.4, 0.42, 0.4],
      wall: "metal",
      wc: [0.45, 0.5, 0.45],
      ceil: "metal_dark",
      cc: [0.35, 0.37, 0.35],
      trim: false,
      surface: "metal",
    });
    // banks of radio equipment along the west & north walls
    for (let z = -58.5; z < -47.8; z += 1.3) radioBank(b, -13.95, Y, z, 1, r);
    for (let x = -12.8; x < -3; x += 1.3) radioBank(b, x, Y, -58.95, 2, r);
    for (let k = 0; k < 4; k++) {
      const cx = -12.2,
        cz = -57.5 + k * 2.6;
      K.chair(b, cx, Y, cz, -HP, { mat: "metal", tint: [0.4, 0.4, 0.38] });
    }
    // the map table with Manhattan and pins
    const mapTex = K.paint(
      "art",
      "ct_map",
      384,
      256,
      function (x, X, Y2, W, H) {
        x.fillStyle = "#d8ceb0";
        x.fillRect(X, Y2, W, H);
        x.fillStyle = "#9ab0b8";
        x.fillRect(X, Y2, W * 0.28, H);
        x.fillRect(X + W * 0.72, Y2, W * 0.28, H);
        x.fillStyle = "#c8bca0";
        x.beginPath();
        x.moveTo(X + W * 0.42, Y2 + 5);
        x.lineTo(X + W * 0.6, Y2 + 5);
        x.lineTo(X + W * 0.66, Y2 + H * 0.6);
        x.lineTo(X + W * 0.52, Y2 + H - 5);
        x.lineTo(X + W * 0.36, Y2 + H * 0.6);
        x.closePath();
        x.fill();
        x.strokeStyle = "#6a5a40";
        x.lineWidth = 1;
        for (let k = 0; k < 20; k++) {
          x.beginPath();
          x.moveTo(X + W * 0.36, Y2 + k * 12);
          x.lineTo(X + W * 0.66, Y2 + k * 12);
          x.stroke();
        }
        const pins = [
          [0.5, 0.2, "#ff2020"],
          [0.55, 0.45, "#ff2020"],
          [0.46, 0.62, "#ffd020"],
          [0.52, 0.85, "#ff2020"],
          [0.8, 0.9, "#2060ff"],
          [0.2, 0.95, "#2060ff"],
        ];
        for (const [px, py, c] of pins) {
          x.fillStyle = c;
          x.beginPath();
          x.arc(X + W * px, Y2 + H * py, 5, 0, 6.3);
          x.fill();
        }
        x.fillStyle = "#22397a";
        x.font = "bold 12px Georgia, serif";
        x.textAlign = "left";
        x.fillText("MANHATTAN — CIBLES D'ÉCOUTE", X + 10, Y2 + 18);
        x.fillText("Rouge: relais · Bleu: ports", X + 10, Y2 + H - 10);
        K.stains(x, X, Y2, W, H, 8, 3, 0.35);
      },
    );
    const mt = K.table(b, -7, Y, -53, 3.0, 2.0, {
      mat: "metal",
      tint: [0.45, 0.48, 0.44],
    });
    b.hplate("art", -7, mt + 0.01, -53, 2.8, 1.85, 0, mapTex);
    K.lamp(b, -7, Y + 2.3, -53, "pendant", [1, 0.9, 0.7], 1.0, 5, {
      ceil: Y + 3.2,
      shade: "paint_green",
      lightOpts: { box: RB },
    });
    // reel-to-reel recorders
    for (const x of [-10.5, -9]) {
      b.boxMM("metal", x - 0.5, Y, -48.4, x + 0.5, Y + 1.2, -47.2, {
        tint: [0.5, 0.52, 0.5],
      });
      for (const s of [-1, 1])
        b.cyl(
          "metal_dark",
          x + s * 0.22,
          Y + 1.0,
          -47.18,
          0.18,
          0.18,
          0.03,
          12,
        );
      b.col(x - 0.5, Y, -48.4, x + 0.5, Y + 1.2, -47.2, {});
    }
    // THE TRANSMITTER (still running) — interactable
    b.boxMM("paint_green", -4.6, Y, -58.9, -2.3, Y + 2.3, -57.4, {
      tint: [0.35, 0.45, 0.35],
    });
    for (let k = 0; k < 6; k++)
      b.geo("lamp", K.sphereGeo(), {
        x: -4.2 + k * 0.33,
        y: Y + 1.9,
        z: -57.38,
        s: 0.05,
        tint: k % 2 ? [1, 0.3, 0.2] : [0.3, 1, 0.3],
      });
    b.col(-4.6, Y, -58.9, -2.3, Y + 2.3, -57.4, { tag: "machine" });
    b.light(-3.4, Y + 1.5, -56.5, [0.4, 1.0, 0.5], 0.8, 5, { box: RB });
    b.glow(-3.4, Y + 1.9, -57.3, [0.3, 0.9, 0.4], 1.2);
    b.light(-12.5, Y + 1.4, -52, [0.4, 1.0, 0.5], 0.6, 6, { box: RB });
    K.anchor(ctx, "transmitter", -3.45, Y + 1.2, -57.2);
    K.terminal(
      ctx,
      "pv_term_ct_radio",
      -12.3,
      Y + 0.9,
      -49,
      HP,
      termRadio(),
      "bare",
    );
    b.boxMM("metal", -13.2, Y, -49.6, -11.4, Y + 0.9, -48.4, {
      tint: [0.45, 0.48, 0.44],
    });
    b.col(-13.2, Y, -49.6, -11.4, Y + 0.9, -48.4, {});

    // barracks (x 2..14, z −60..−47)
    const BB = [1.9, Y - 0.2, -60.1, 14.1, Y + 3.4, -46.9];
    K.room(b, ctx, {
      x0: 2,
      z0: -60,
      x1: 14,
      z1: -47,
      y: Y,
      h: 3.2,
      floor: "concrete",
      fc: floorC,
      wall: "concrete",
      wc: [0.5, 0.52, 0.48],
      ceil: "metal_dark",
      cc: [0.36, 0.38, 0.36],
      trim: false,
    });
    for (let k = 0; k < 4; k++) {
      const z = -58.5 + k * 2.8;
      for (const x of [4, 12]) {
        // bunk beds
        for (const lvl of [0, 1.1]) {
          b.boxMM(
            "metal",
            x - 1.0,
            Y + 0.35 + lvl,
            z - 0.45,
            x + 1.0,
            Y + 0.45 + lvl,
            z + 0.45,
            { tint: [0.4, 0.45, 0.4] },
          );
          b.boxMM(
            "cloth_green",
            x - 0.95,
            Y + 0.45 + lvl,
            z - 0.42,
            x + 0.95,
            Y + 0.6 + lvl,
            z + 0.42,
            { tint: [0.45, 0.5, 0.4] },
          );
        }
        for (const s of [-1, 1])
          for (const t of [-1, 1])
            b.beam(
              "metal",
              x + s * 0.98,
              Y,
              z + t * 0.43,
              x + s * 0.98,
              Y + 1.9,
              z + t * 0.43,
              0.05,
              0.05,
            );
        b.col(x - 1.0, Y, z - 0.45, x + 1.0, Y + 1.9, z + 0.45, {
          tag: "furniture",
        });
      }
    }
    b.plate(
      "art",
      8,
      Y + 1.9,
      -59.88,
      0,
      1,
      2.2,
      1.5,
      K.paint("art", "ct_flag", 256, 170, function (x, X, Y2, W, H) {
        const cw = W / 3;
        x.fillStyle = "#22397a";
        x.fillRect(X, Y2, cw, H);
        x.fillStyle = "#ece6d6";
        x.fillRect(X + cw, Y2, cw, H);
        x.fillStyle = "#c8241c";
        x.fillRect(X + cw * 2, Y2, W - cw * 2, H);
        x.fillStyle = "#16233f";
        x.font = "bold 40px Georgia, serif";
        x.textAlign = "center";
        x.fillText("B7", X + W / 2, Y2 + H / 2 + 14);
        K.stains(x, X, Y2, W, H, 8, 9, 0.5, [30, 10, 5]);
      }),
      {},
    );
    for (let k = 0; k < 3; k++)
      K.loot(ctx, "footlocker", 4 + (k % 2) * 8, Y, -56 + k * 2.8, 0, {
        loot: "footlocker",
      });
    K.lamp(b, 8, Y + 2.9, -53.5, "cage", [1, 0.75, 0.45], 0.8, 8, {
      ceil: Y + 3.2,
      lightOpts: { box: BB },
    });
    K.skel(ctx, 12, Y + 0.6, -50.1, 0, "lying");

    // armory (x −12..−2, z −71..−60)
    const AB = [-12.1, Y - 0.2, -71.1, -1.9, Y + 3.4, -59.9];
    K.room(b, ctx, {
      x0: -12,
      z0: -71,
      x1: -2,
      z1: -60,
      y: Y,
      h: 3.2,
      floor: "concrete",
      fc: floorC,
      wall: "metal",
      wc: [0.48, 0.52, 0.46],
      ceil: "metal_dark",
      cc: [0.36, 0.38, 0.36],
      trim: false,
    });
    for (let z = -70; z < -61; z += 2) {
      b.boxMM("wood", -11.9, Y + 0.4, z - 0.8, -11.5, Y + 1.8, z + 0.8, {
        tint: [0.4, 0.3, 0.2],
      });
      for (let k = 0; k < 4; k++)
        b.box(
          "metal_dark",
          -11.65,
          Y + 0.45,
          z - 0.6 + k * 0.4,
          0.08,
          1.2,
          0.1,
          { tint: [0.25, 0.25, 0.22] },
        );
    }
    b.col(-12, Y, -70.8, -11.5, Y + 1.8, -61.2, {});
    // the cage with the stealth armour mannequin
    const cx0 = -8,
      cx1 = -3,
      cz0 = -70.8,
      cz1 = -66;
    for (let x = cx0; x <= cx1; x += 0.25)
      b.pipe("metal_dark", x, Y, cz1, x, Y + 2.6, cz1, 0.015, 4);
    for (let z = cz0; z <= cz1; z += 0.25)
      b.pipe("metal_dark", cx0, Y, z, cx0, Y + 2.6, z, 0.015, 4);
    b.beam("metal_dark", cx0, Y + 2.6, cz1, cx1, Y + 2.6, cz1, 0.06, 0.06);
    b.beam("metal_dark", cx0, Y + 1.3, cz1, cx1, Y + 1.3, cz1, 0.05, 0.05);
    b.col(cx0 - 0.05, Y, cz1 - 0.05, cx1, Y + 2.6, cz1 + 0.05, {
      tag: "cage",
      walkable: false,
    });
    b.col(cx0 - 0.05, Y, cz0, cx0 + 0.05, Y + 2.6, cz1, {
      tag: "cage",
      walkable: false,
    });
    b.boxMM("metal", -5.8, Y, -69.4, -5.2, Y + 0.3, -68.8, {});
    b.pipe("metal", -5.5, Y + 0.3, -69.1, -5.5, Y + 1.0, -69.1, 0.03, 5);
    b.box("metal_dark", -5.5, Y + 1.0, -69.1, 0.46, 0.7, 0.26, {
      tint: [0.25, 0.28, 0.25],
    }); // armour torso (dark, sleek)
    b.geo("metal_dark", K.sphereGeo(), {
      x: -5.5,
      y: Y + 1.9,
      z: -69.1,
      s: 0.16,
      tint: [0.2, 0.22, 0.2],
    });
    b.glow(-5.5, Y + 1.9, -68.95, [1, 0.2, 0.1], 0.25); // visor glint
    b.light(-5.5, Y + 2.8, -68.4, [0.9, 0.3, 0.2], 1.2, 6, { box: AB });
    b.light(-5.5, Y + 1.2, -67.0, [0.7, 0.75, 0.8], 0.7, 4, { box: AB }); // display spot on the armour
    b.plate(
      "art",
      -5.5,
      Y + 2.9,
      -65.95,
      0,
      1,
      1.4,
      0.35,
      K.signCell("ct_cage_sign", "SECTION OMBRE — ACCÈS RÉSERVÉ", 512, 96, {
        bg: "#1a1a1a",
        fg: "#e03020",
        font: "Arial, sans-serif",
      }),
      {},
    );
    K.loot(ctx, "locker", -5.5, Y, -70.4, 0, {
      items: [["bureau_stealth_suit", 1]],
      lock: LK.armory,
      name: "Shade Suit Locker",
      tag: "armory",
    });
    K.loot(ctx, "ammo_box", -10.5, Y, -61, 0, {
      loot: "ammo_box",
      large: true,
    });
    K.loot(ctx, "crate", -3.5, Y, -61, 0, {
      items: [
        [RIFLE(), 1],
        ["ammo_556", 60],
      ],
      kind: "army",
      name: "Station Weapons Crate",
    });
    K.loot(ctx, "crate", -10.8, Y, -69.5, 0.3, {
      loot: "weapon_crate",
      kind: "army",
    });
    K.lamp(b, -7, Y + 2.9, -63, "cage", [1, 0.2, 0.15], 0.8, 7, {
      ceil: Y + 3.2,
      lightOpts: { box: AB },
    });

    // commander's office (x 2..12, z −71..−60)
    const OB = [1.9, Y - 0.2, -71.1, 12.1, Y + 3.4, -59.9];
    K.room(b, ctx, {
      x0: 2,
      z0: -71,
      x1: 12,
      z1: -60,
      y: Y,
      h: 3.2,
      floor: "wood",
      fc: [0.45, 0.35, 0.28],
      wall: "lacquer",
      wc: [0.7, 0.62, 0.58],
      wain: "wood_dark",
      wainC: [0.35, 0.2, 0.14],
      ceil: "metal_dark",
      cc: [0.36, 0.34, 0.32],
      surface: "wood",
    });
    const cdt = K.table(b, 8, Y, -68, 2.2, 1.0, { mat: "mahogany" });
    K.chair(b, 8, Y, -69, PI, { mat: "leather" });
    K.terminal(
      ctx,
      "pv_term_ct_commander",
      8.5,
      cdt,
      -68.2,
      0,
      termCommander(),
      "bare",
    );
    K.lamp(b, 7.2, cdt + 0.35, -68.1, "pendant", [1, 0.85, 0.6], 0.8, 4.5, {
      ceil: cdt + 0.45,
      shade: "paint_green",
      lightOpts: { box: OB },
    });
    b.box("brass", 7.2, cdt, -68.1, 0.15, 0.4, 0.15, {});
    b.plate(
      "art",
      7,
      Y + 2.0,
      -70.88,
      0,
      1,
      2.4,
      1.6,
      K.paint("art", "ct_flag", 256, 170, () => {}),
      {},
    );
    K.framed(
      b,
      11.88,
      Y + 1.8,
      -64,
      -1,
      0,
      1.2,
      1.5,
      K.photo("family", 7, 128, 176),
      { frame: "gold" },
    );
    K.framed(
      b,
      2.12,
      Y + 1.8,
      -66,
      1,
      0,
      0.9,
      2.0,
      K.signCell("ct_office_charter", "POSTE DRAGON · 1962", 128, 280, {
        bg: "#e8dcc0",
        fg: "#22397a",
        font: "Georgia, serif",
      }),
      { frame: "wood_dark" },
    );
    b.boxMM("wood_dark", 2.2, Y, -62, 3.6, Y + 1.0, -60.2, {
      tint: [0.4, 0.25, 0.18],
    });
    b.col(2.2, Y, -62, 3.6, Y + 1.0, -60.2, {});
    b.cyl("ceramic", 2.9, Y + 1.0, -61, 0.1, 0.08, 0.12, 8, {
      tint: [0.85, 0.9, 0.95],
    }); // tea set
    K.lamp(b, 7, Y + 2.9, -64, "bulb", [1, 0.8, 0.55], 0.5, 6, {
      ceil: Y + 3.2,
      lightOpts: { box: OB },
    });
    K.loot(ctx, "safe", 11.8, Y, -70, -HP, {
      loot: "safe",
      lock: LK.safe,
      name: "Commandant's Safe",
    });
    // mq31 (main story): the Commandant's grey cipher safe behind his desk, door open, dial rusted at zero: the SIROCCO
    // codebook's home (the main story puts its "Cipher Safe" beat at anchor 'cipher_safe')
    b.boxMM("metal", 5.9, Y, -70.95, 6.9, Y + 1.05, -70.2, {
      tint: [0.52, 0.54, 0.52],
    });
    b.boxMM("metal_dark", 5.98, Y + 0.08, -70.22, 6.82, Y + 0.97, -70.18, {
      tint: [0.12, 0.12, 0.12],
    }); // the dark open mouth
    b.boxMM("metal", 6.9, Y + 0.06, -70.2, 6.95, Y + 0.99, -69.35, {
      tint: [0.5, 0.52, 0.5],
    }); // the door, swung open
    b.cyl("steel", 6.97, Y + 0.6, -69.8, 0.09, 0.09, 0.03, 12, {
      tint: [0.6, 0.5, 0.35],
    });
    b.col(5.9, Y, -70.95, 6.95, Y + 1.05, -70.2, { tag: "furniture" });
    K.anchor(ctx, "cipher_safe", 6.4, Y + 0.6, -69.7);
    b.cyl("black_iron", 11.2, Y, -62.4, 0.38, 0.38, 0.9, 12, {
      tint: [0.2, 0.2, 0.2],
    });
    b.pipe("black_iron", 11.2, Y + 0.9, -62.4, 11.2, Y + 3.2, -62.4, 0.08, 6);
    b.glow(11.2, Y + 0.45, -62.05, [1, 0.45, 0.15], 0.35);
    b.col(10.8, Y, -62.8, 11.6, Y + 0.9, -62.0, { tag: "furniture" });
    K.anchor(ctx, "stove", 10.6, Y + 0.8, -62.4);
    // the east wall is cracked and bulging: something is digging on the other side (the Glowkeepers' tunnel, mq31)
    b.plate(
      "decal",
      11.9,
      Y + 1.3,
      -65.2,
      -1,
      0,
      2.2,
      2.0,
      K.decal("grime", 78),
    );
    K.rubble(b, 11.4, Y, -65.2, 0.6, 0.3, { seed: 73, col: false });
    K.anchor(ctx, "crack", 11.1, Y + 1.2, -65.2);
    K.anchor(ctx, "breach", 10.6, Y, -65.0);
    K.anchor(ctx, "boss", 6, Y, -64.5);
    K.note(ctx, "pv_note_ct_orders", 7.4, cdt + 0.01, -67.7, {
      name: "Standing Orders (translated)",
      title:
        'ORDRES PERMANENTS — Poste "Dragon", Bureau Sept (English pencilled in the margin)',
      text: "1. Record every transmission. Every one. Paris will want them.\n2. Do not engage. We are ears, not teeth.\n3. When the operation ends, await extraction.\n\n(Margin, in English, much later, shaky:)\nThe operation ended in March '67, with the sky. Nobody came. The sickness came instead. It took our hair, then our teeth, then, slowly, our minds. We have been awaiting extraction for twenty-two years.\n\nThe men are forgetting their names. Some went up into the streets and did not come back as themselves. I still remember mine. That is my last order to myself: remember.\n— Cdt. A. Delorme",
    });
    // the duty sergeant's diary in the barracks: the Commandant's teletype word
    K.note(ctx, "pv_note_ct_diary", 11.3, Y + 0.61, -50.1, {
      name: "Sgt. Brault's Diary",
      title: "Carnet — Sgt. Ph. Brault (English, cramped)",
      learn: LK.commander.id,
      text: "The Commandant changes his teletype word every year on his daughter's birthday. Except he hasn't, not since the sky went white. It is still her name. MARGUERITE. He types it every morning and stares at the screen.\n\nHe thinks I don't know. Everyone knows. We are eleven men in a hole under a noodle restaurant; there are no secrets here except the ones we keep from Paris.\n\nThe Lums upstairs never knew we were here. Good people. They fed us through the dumbwaiter for a month after the Bombing, thinking we were squatters. Then they left for Queens. I hope they made it.",
    });

    // generator room + escape tunnel (x −4..4, z −84..−72)
    const EB = [-4.1, Y - 0.2, -84.1, 4.1, Y + 3.6, -71.9];
    K.room(b, ctx, {
      x0: -4,
      z0: -84,
      x1: 4,
      z1: -72,
      y: Y,
      h: 3.4,
      floor: "concrete",
      fc: floorC,
      wall: "concrete",
      wc: [0.5, 0.5, 0.46],
      ceil: "concrete",
      cc: [0.36, 0.36, 0.34],
      trim: false,
    });
    b.boxMM("paint_green", -3.8, Y, -80, -1.2, Y + 2.2, -76, {
      tint: [0.35, 0.42, 0.34],
    });
    b.cyl("metal", -2.5, Y + 2.2, -78, 0.4, 0.4, 0.6, 10);
    b.col(-3.8, Y, -80, -1.2, Y + 2.2, -76, { tag: "machine" });
    b.glow(-1.15, Y + 1.6, -78, [1, 0.6, 0.2], 0.5);
    K.rubble(b, 2.5, Y, -82.5, 1.6, 1.2, { seed: 9 });
    for (let k = 0; k < 12; k++)
      b.beam(
        "black_iron",
        -0.45,
        Y + 0.3 + k * 0.28,
        -83.85,
        0.45,
        Y + 0.3 + k * 0.28,
        -83.85,
        0.03,
        0.03,
      );
    for (const s of [-1, 1])
      b.beam(
        "black_iron",
        s * 0.45,
        Y,
        -83.85,
        s * 0.45,
        Y + 3.4,
        -83.85,
        0.05,
        0.05,
      );
    b.plate(
      "art",
      0,
      Y + 2.8,
      -83.88,
      0,
      1,
      1.2,
      0.3,
      K.signCell("ct_exit", "EXIT ↑ (MOTT ST)", 256, 64, {
        bg: "#1a2a1a",
        fg: "#80ff80",
        font: "Arial, sans-serif",
      }),
      {},
    );
    b.light(0, Y + 3.2, -83, [0.6, 0.7, 0.8], 0.8, 5, { box: EB }); // daylight down the manhole
    b.glow(0, Y + 3.3, -83.5, [0.4, 0.45, 0.5], 1.5);
    K.lamp(b, 1, Y + 3.0, -76, "cage", [1, 0.7, 0.4], 0.6, 6, {
      ceil: Y + 3.4,
      lightOpts: { box: EB },
    });
    // the manhole lifter (a hooked iron bar) hangs on the ladder rail: from above, it unbolts the lane manhole
    K.anchor(ctx, "lifter", 1.1, Y + 0.05, -83.2);

    // ---------------- the moving shelf (own mesh, not merged) ----------------
    {
      const sb = K.builder({
        name: "ct_shelf",
        off: { x: O.x, y: O.y, z: O.z },
        lit: true,
        amb: [0.35, 0.3, 0.25],
      });
      K.shelf(sb, 0, 0, 0, 0, 2.4, {
        mat: "wood",
        items: ["jar", "box", "jar", "can"],
        h: 2.4,
        d: 0.5,
        seed: 77,
        col: false,
      });
      const grp = sb.finish(null);
      grp.position.set(-4, 0, -23.7);
      grp.children.forEach((m) => {
        if (m.isMesh || m.isPoints) m.matrixAutoUpdate = true;
      });
      const col = G.world.addBox(
        O.x - 5.25,
        O.y,
        O.z - 23.95,
        O.x - 2.75,
        O.y + 2.4,
        O.z - 23.45,
        { tag: "poi_village", walkable: false },
      );
      shelf = { group: grp, col, open: false, t: 0, O };
    }

    // ---------------- doors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pv_ct_in",
      pos: new THREE.Vector3(160, 1.3, REST.z0 - 0.4),
      label: "The Golden Dragon",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.4, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("chinatown")),
    });
    K.door(ctx, {
      id: "pv_ct_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.3),
      label: "Mott Street",
      verb: "Leave",
      target: { x: 160, y: 0, z: REST.z0 - 2.4, yaw: 0 },
    });
    K.door(ctx, {
      id: "pv_ct_escape",
      pos: new THREE.Vector3(OX, OY + Y + 1.4, OZ - 83.5),
      label: "Ladder — Mott Street (manhole)",
      verb: "Climb",
      sound: "footstep_metal",
      target: { x: MANHOLE.x + 1.2, y: 0, z: MANHOLE.z, yaw: -HP }, // arrive beside the manhole, facing up the lane (away from it)
      onEnter: () => {
        PV.setFlag("ct_manhole_open", true);
        K.lockUnlock(LK.manhole.id);
      },
    });
    const mh = K.door(ctx, {
      id: "pv_ct_manhole",
      pos: new THREE.Vector3(MANHOLE.x, 0.4, MANHOLE.z),
      label: "Manhole",
      verb: "Climb down",
      lock: LK.manhole,
      sound: "footstep_metal",
      target: { x: OX, y: OY + Y, z: OZ - 82.4, yaw: PI },
    }); // land at the foot of the ladder facing into the generator room
    ctx.manhole = mh;

    // ---------------- anchors & interactables ----------------
    K.anchor(ctx, "entrance", 0, 0, -1.4);
    K.anchor(ctx, "shelf", -4, 1.2, -23.3);
    const sp = [
      [-6, 0, -9],
      [6, 0, -4],
      [6, 0, -20],
      [-7, 0, -18],
      [0, Y, -52],
      [0, Y, -66],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "soldier1", 3, Y, -41);
    K.anchor(ctx, "soldier2", -8, Y, -55);
    K.anchor(ctx, "soldier3", 8, Y, -52);
    K.anchor(ctx, "soldier4", 0, Y, -68);
    K.anchor(ctx, "loot1", -5.5, Y, -70.4);
    K.anchor(ctx, "loot2", 11.8, Y, -70);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_chinatown_int";
    ctx.intRoot.add(shelf.group);
  }
  function radioBank(b, x, y, z, face, r) {
    // face 1 = against the west wall (facing +x); 2 = against the north wall (facing +z)
    const w = 1.2,
      d = 0.6,
      h = 2.2;
    if (face === 1)
      b.boxMM("paint_green", x, y, z - w / 2, x + d, y + h, z + w / 2, {
        tint: [0.35, 0.42, 0.36],
      });
    else
      b.boxMM("paint_green", x - w / 2, y, z, x + w / 2, y + h, z + d, {
        tint: [0.35, 0.42, 0.36],
      });
    const fx = face === 1 ? x + d + 0.01 : x,
      fz = face === 1 ? z : z + d + 0.01,
      nx = face === 1 ? 1 : 0,
      nz = face === 1 ? 0 : 1;
    for (let k = 0; k < 6; k++) {
      const u = ((k % 3) - 1) * 0.35,
        v = 0.9 + Math.floor(k / 3) * 0.55;
      const px = fx + (face === 1 ? 0 : u),
        pz = fz + (face === 1 ? u : 0);
      b.cyl("lamp", px, y + v, pz, 0.07, 0.07, 0.01, 10, {
        tint: r() < 0.5 ? [0.9, 0.7, 0.3] : [0.3, 0.9, 0.4],
      });
    }
    b.plate("glass", fx, y + 1.8, fz, nx, nz, 0.9, 0.35, null, {
      tint: [0.2, 0.5, 0.3],
    });
    if (face === 1) b.col(x, y, z - w / 2, x + d, y + h, z + w / 2, {});
    else b.col(x - w / 2, y, z, x + w / 2, y + h, z + d, {});
  }

  // ------------------------------------------------------------------
  // terminals
  // ------------------------------------------------------------------
  // The station ran captured-and-rebadged American line terminals (KESTREL TELETYPE, bought through the front company).
  function termGuard() {
    // left logged in: the last guard on duty never signed off
    return {
      title: "POSTE DRAGON — GUARD STATION",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\nLANGUE: FRANÇAIS/ENGLISH (AUTO)",
      entries: [
        {
          title: "Duty Roster (auto-translated)",
          text: "Watch 1: Sgt. Brault\nWatch 2: Cpl. Vasseur\nWatch 3: Agent Roux (went up to the street, did not return)\nWatch 4: Agent Roux (returned, is not Agent Roux)\n\nNote: Do not let Agent Roux back in.",
        },
        {
          title: "Incident Log",
          text: "5 March '67, Sunday morning: The sky over the Bronx went white. Paris does not answer.\nDay 30: Men sick. Hair falling out. Gums bleeding.\nYear 2: The sick ones who lived are not the same. Bad tempers. Bad dreams. Forgetting.\nYear 7 (1974): Mlle Lys's courier at the Mott Street ladder again. Commandant's order: no answer. \"Let her think the Dragon died clean.\"\nYear 9: Three men lost their minds. Now they run the streets above, screaming. They still salute.\nYear 22: The Maniacs in the restaurant guard the storeroom. We do not know if they remember why. Some days, neither do we.",
        },
      ],
    };
  }
  function termRadio() {
    return {
      title: "RENSEIGNEMENT — INTERCEPT ARCHIVE",
      header: "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL",
      entries: [
        {
          title: "Intercept 1967-03-05, 09:31",
          text: 'SOURCE: US civil defense band.\nCONTENT: "...this is not a drill. Proceed to your designated public shelter..."\nANALYST NOTE: They expected Moscow. It was us. God forgive the men who gave the order. Recording anyway.',
        },
        {
          title: "Intercept 1974",
          text: 'SOURCE: Federal band, heavily encrypted. Speaker calls himself "Acting President."\nANALYST NOTE: The American government survived, after a fashion, and still believes it is 1967. We are recording an enemy who does not know we exist, for a service that may no longer exist. This is the most Bureau thing I have ever done.',
        },
        {
          title: "Intercept 1988",
          text: "SOURCE: Unlicensed Manhattan band.\nCONTENT: Swing music. A DJ tells jokes about the Bombing.\nANALYST NOTE: The jokes are not funny. The music is very good. Played it twice. Do not tell the Commandant.",
        },
        {
          title: "Transmitter Status",
          text: "BEACON: ACTIVE — broadcasting request for extraction, every hour, since March 1967.\nReplies received: 0.",
        },
      ],
    };
  }
  function termCommander() {
    return {
      title: "COMMANDANT — A. DELORME",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\nBUREAU SEPT · POSTE DRAGON · CHEF DE POSTE",
      lock: LK.commander,
      entries: [
        {
          title: "Personal Log — Year 22",
          learn: LK.safe.id,
          text: () => {
            K.learn(LK.safe.id);
            return "I have kept the post. I have kept the records. I have kept the shade suit clean, though no agent will come down that ladder to wear it.\n\nIf an American reads this: I am sorry. We were sent to listen, not to burn your city. Whoever gave the order is beyond your reach and mine.\n\nParis sent us the SIROCCO codebook in February of '67, so that we could read the strike flight's traffic. We were to listen to our own bombers. It is in the grey cipher safe behind my desk; the dial rusted at zero years ago and I never had it fixed. One of their two planes never arrived; if the sun people who scratch at my kitchen wall ever reach that book, God help this city twice. Burn it in my stove if you must. I never could.\n\nThe suit is in the armory locker; the release is below. My own safe is set to the Fête nationale, day then month: 1-4-0-7. Take what you like. Wear it better than we did.";
          },
        },
        {
          title: "Armory Access",
          text: "Authorization accepted. Armory locker released.",
          action: () => {
            PV.unlockTagged("chinatown", "armory");
            PV.setFlag("ct_armory_open", true);
            K.notify("The shade suit locker is unlocked.");
            advance("armory");
          },
        },
        {
          title: "Transmitter — Shut Down Beacon",
          text: "Beacon powered down. After twenty-two years, the Golden Dragon goes silent.",
          action: () => {
            if (!PV.flag("ct_beacon_off")) {
              PV.setFlag("ct_beacon_off", true);
              K.xp(100, "Silenced the Bureau Sept beacon");
              K.notify("The Bureau Sept beacon falls silent.");
            }
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA, QUEST, SPAWN, UPDATE
  // "Static Over Canal Street" (pv_red_star) — absorbed into the main story as mq31 "Poste Dragon" (Act 5).
  //   passage (the storeroom shelf) → bunker (the listening post) → office (deal with Commandant Delorme / reach his
  //   office) → COMPLETE. Optional: Delorme, the shade suit, the beacon. G.quests.start('pv_red_star') works at any
  //   time (stage synced to the world). The main story (src/quests/67_ms_act5.js) owns the Act 5 beats on top of this:
  //   the SIROCCO codebook in the Commandant's cipher safe (anchor 'cipher_safe'), the Glowkeepers' race and breach,
  //   Brault's 1970 page. This POI provides the set: the open grey cipher safe behind the desk, the Glowkeepers'
  //   fresh digging in the kitchen, the cracked east wall of the office, and the texts that point at all three.
  // ==================================================================
  function wantStage() {
    if (PV.flag("ct_office_seen") || PV.flag("ct_cdt_dead")) return "done";
    if (PV.flag("ct_bunker_seen") || PV.flag("ct_shelf_open")) return "bunker";
    return "passage";
  }
  function sync() {
    if (!K.q.active("pv_red_star")) return;
    const w = wantStage();
    if (w === "done") {
      K.q.complete("pv_red_star");
      return;
    }
    if (K.q.stage("pv_red_star") !== w) K.q.set("pv_red_star", w);
  }
  function advance(to) {
    if (to === "bunker") PV.setFlag("ct_bunker_seen", true);
    if (to === "office") {
      PV.setFlag("ct_bunker_seen", true);
      PV.setFlag("ct_office_seen", true);
    }
    if (!K.q.started("pv_red_star")) K.q.start("pv_red_star");
    sync();
  }
  /** Act 5 (the main story's mq31 running): the Glowkeepers are digging toward the post. */
  const act5 = () => {
    try {
      return (
        !G.isStub("quests") &&
        (G.quests.isStarted("mq31") || G.quests.isComplete("mq30"))
      );
    } catch (e) {
      return false;
    }
  };
  function data(ctx) {
    if (!G.isStub("quests") && G.quests.define) {
      const anchorMarker = (name, label, dz) => () => {
        const a = PV.anchor("chinatown", name);
        return a ? { x: a.x, z: a.z + (dz || 0), y: a.y, label } : null;
      };
      G.quests.define({
        id: "pv_red_star",
        name: "Static Over Canal Street",
        giver: "A scavenger's tape reel",
        location: "Chinatown",
        desc: "A Vanguard scavenger tracked a numbers station to the Golden Dragon restaurant in Chinatown before something in the kitchen found him. The signal comes from underground, and the woman reading the numbers speaks French.",
        stages: [
          {
            id: "passage",
            text: "Find the hidden passage in the Golden Dragon's storeroom.",
            markers: [anchorMarker("shelf", "Storeroom", 1.2)],
          }, // on the open floor in front of the shelf
          {
            id: "bunker",
            text: "Get into the Bureau Sept listening post beneath the Golden Dragon and deal with Commandant Delorme in his office.",
            markers: [anchorMarker("boss", "Commandant's Office")],
          },
          // legacy stage id (saves from before the main story): migrated by sync()
          {
            id: "armory",
            text: "Get into the Bureau Sept listening post beneath the Golden Dragon and deal with Commandant Delorme in his office.",
            hidden: true,
            markers: [anchorMarker("boss", "Commandant's Office")],
          },
          {
            id: "rs_delorme",
            text: "(Optional) Deal with Commandant Delorme.",
            sideObjective: true,
            optional: true,
            showIf: () => !!PV.flag("ct_bunker_seen"),
            doneIf: () => !!PV.flag("ct_cdt_dead"),
          },
          {
            id: "rs_suit",
            text: "(Optional) Claim the Bureau Sept shade suit from the armory (Commandant Delorme's key, or his teletype).",
            sideObjective: true,
            optional: true,
            showIf: () => !!PV.flag("ct_bunker_seen"),
            doneIf: () => !!PV.flag("ct_suit_taken"),
          },
          {
            id: "rs_beacon",
            text: "(Optional) Shut down the Bureau Sept transmitter.",
            sideObjective: true,
            optional: true,
            showIf: () => !!PV.flag("ct_bunker_seen"),
            doneIf: () => !!PV.flag("ct_beacon_off"),
          },
        ],
        rewards: { xp: 400 },
      });
    }
    // keys of this POI
    K.defineItem({
      id: "pv_key_ct_armory",
      type: "key",
      name: "Armory Key (Poste Dragon)",
      weight: 0,
      value: 0,
      desc: "A heavy brass key on a tricolour ribbon, stamped B7 — ARMURERIE.",
    });
    K.defineItem({
      id: "pv_ct_manhole_lifter",
      type: "key",
      name: "Manhole Lifter",
      weight: 1,
      value: 5,
      desc: 'A hooked iron bar for prising up street manhole covers. Someone has scratched "SORTIE" into the handle.',
    });
    // interactables: the shelf, the transmitter, the stove, the fresh digging, the cracked wall
    G.world.addInteractable({
      pos: ctx.anchors.shelf,
      radius: 1.3,
      label: "Heavy Shelf",
      verb: () => (shelf && shelf.open ? "" : "Push"),
      priority: 1,
      enabled: () => !!shelf && !shelf.open,
      onInteract() {
        openShelf(true);
      },
    });
    G.world.addInteractable({
      pos: ctx.anchors.transmitter,
      radius: 1.0,
      label: "Bureau Sept Transmitter",
      verb: "Smash",
      priority: 1,
      enabled: () => !PV.flag("ct_beacon_off"),
      onInteract() {
        PV.setFlag("ct_beacon_off", true);
        K.sfx("robot_death", ctx.anchors.transmitter);
        K.safe("fx", () => G.fx.sparks && G.fx.sparks(ctx.anchors.transmitter));
        K.xp(100, "Silenced the Bureau Sept beacon");
        K.notify(
          "The Bureau Sept beacon falls silent. The agents below will not be pleased.",
        );
      },
    });
    if (ctx.anchors.stove)
      G.world.addInteractable({
        pos: ctx.anchors.stove,
        radius: 1.0,
        label: "Commandant's Stove",
        verb: "Examine",
        priority: 1,
        onInteract() {
          K.notify(
            "A squat iron stove, still warm. The Commandant keeps a fire in it for his tea. A tin of sugar cubes sits on the warming shelf, the lid rusted shut.",
          );
        },
      });
    if (ctx.anchors.dig)
      G.world.addInteractable({
        pos: ctx.anchors.dig,
        radius: 1.2,
        label: "Fresh Digging",
        verb: "Examine",
        priority: 1,
        onInteract() {
          K.notify(
            act5()
              ? "A hole broken through the kitchen tiles, shored with chair legs and candle crates, angled down and south toward the old station. Wax drips on the rubble, still soft. They are close."
              : "A hole broken through the kitchen tiles and shored with chair legs, angled down toward the old station. Wax drips on the rubble. Someone has been digging here, on and off, for a long time.",
          );
        },
      });
    if (ctx.anchors.crack)
      G.world.addInteractable({
        pos: ctx.anchors.crack,
        radius: 1.0,
        label: "Cracked Wall",
        verb: "Listen",
        priority: 1,
        onInteract() {
          K.notify(
            act5()
              ? "You put your ear to the bulging plaster. Picks, close. Somebody on the other side is chanting under their breath, counting rays."
              : "You put your ear to the bulging plaster. Nothing. Then, very faint, a scrape, and a long silence.",
          );
        },
      });
    // contract (src/quests/NOTES.md): the main story may start the quest at any time
    G.events.on("questStarted", (q) => {
      if (q && q.id === "pv_red_star") setTimeout(sync, 0);
    });
    G.events.on("loaded", () => setTimeout(sync, 0));
  }
  function openShelf(byPlayer) {
    if (!shelf || shelf.open) return;
    shelf.open = true;
    shelf.t = byPlayer ? 0 : 1;
    PV.setFlag("ct_shelf_open", true);
    if (shelf.col) {
      G.world.removeCollider(shelf.col);
      shelf.col = null;
    }
    if (byPlayer) {
      K.sfx("door_open", shelf.group.getWorldPosition(new THREE.Vector3()), {
        pitch: 0.6,
      });
      K.notify(
        "The shelf grinds aside. Cold air, machine oil: a stairway leads down.",
      );
      advance("bunker");
    }
  }
  function closeShelf() {
    if (!shelf) return;
    shelf.open = false;
    shelf.t = 0;
    shelf.group.position.x = -4;
    if (!shelf.col) {
      const O = shelf.O;
      shelf.col = G.world.addBox(
        O.x - 5.25,
        O.y,
        O.z - 23.95,
        O.x - 2.75,
        O.y + 2.4,
        O.z - 23.45,
        { tag: "poi_village", walkable: false },
      );
    }
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    if (PV.flag("ct_shelf_open")) {
      openShelf(false);
      shelf.group.position.x = -6.6;
    } else closeShelf();
    if (PV.flag("ct_manhole_open")) K.lockUnlock(LK.manhole.id);
    if (!PV.flag("ct_lifter_taken"))
      K.safe("lifter", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv_ct_manhole_lifter", 1, v(A.lifter), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    if (PV.flag("ct_armory_open")) PV.unlockTagged("chinatown", "armory");
    // the station's ex-agents: half-mad after twenty-two years underground, still holding the post (hostile)
    const soldier = (id, name, p, lvl, weapon, extra) =>
      PV.spawnActor(
        ctx,
        Object.assign(
          {
            id,
            type: "human",
            gender: "m",
            outfit: "combat_armor",
            name,
            faction: "maniacs",
            level: lvl,
            hostile: true,
            pos: v(p),
            yaw: 0,
            ai: "guard",
            home: "here",
            homeR: 5,
            noRespawn: true,
            weapon: K.itemExists(weapon) ? weapon : undefined,
            inventory: K.stock([["ammo_556", 20]]),
            loot: "settler",
            barks: [
              "...écoutez... the post...",
              "Halte! Identify yourself! ...What year is it?",
              "Extraction... is coming...",
            ],
          },
          extra || {},
        ),
      );
    soldier("pv_ct_soldier1", "Bureau Sept Sentry", A.soldier1, 6, RIFLE());
    soldier(
      "pv_ct_soldier2",
      "Bureau Sept Signals Officer",
      A.soldier2,
      6,
      RIFLE(),
    );
    soldier(
      "pv_ct_soldier3",
      "Bureau Sept Agent",
      A.soldier3,
      5,
      "combat_knife",
    );
    soldier("pv_ct_soldier4", "Bureau Sept Agent", A.soldier4, 6, RIFLE());
    soldier("pv_ct_delorme", "Commandant Armand Delorme", A.boss, 10, RIFLE(), {
      hp: 260,
      dr: 18,
      aggroRange: 30,
      xp: 150,
      homeR: 3,
      inventory: K.stock([
        ["ammo_556", 40],
        ["rally_tonic", 2],
      ]), // his armory key is handed over on death (below)
      onDeath: () => {
        PV.setFlag("ct_cdt_dead", true);
        K.give("pv_key_ct_armory", 1);
        PV.unlockTagged("chinatown", "armory");
        PV.setFlag("ct_armory_open", true);
        K.notify(
          "You take the Commandant's armory key. The shade suit locker clicks open.",
        );
        sync();
      },
      barks: [
        "I remember my name! Do YOU remember yours?",
        "Le poste tient! The post is always held!",
        "The book stays in the post!",
      ],
    });
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  function update(dt, realDt, ctx) {
    if (shelf && shelf.open && shelf.t < 1) {
      shelf.t = Math.min(1, shelf.t + dt * 0.6);
      shelf.group.position.x = -4 - 2.6 * (1 - Math.pow(1 - shelf.t, 2));
    }
    const p = G.player && G.player.pos;
    if (!p || !ctx.inside) return;
    const lx = p.x - ctx.O.x,
      lz = p.z - ctx.O.z,
      below = p.y < ctx.O.y - 4;
    // quest progression by position: entering the bunker; reaching the Commandant's office
    if (below && -lz > 38 && !PV.flag("ct_bunker_seen")) advance("bunker");
    if (
      below &&
      lx > 2 &&
      lx < 12 &&
      lz < -60 &&
      lz > -71 &&
      !PV.flag("ct_office_seen")
    )
      advance("office");
  }
  G.events.on("itemAdded", (id) => {
    if (id === "pv_reel_ct_intercept") advance("passage");
    if (id === "pv_ct_manhole_lifter") PV.setFlag("ct_lifter_taken", true);
    if (id === "bureau_stealth_suit") PV.setFlag("ct_suit_taken", true);
  });

  PV.define({
    id: "chinatown",
    name: "Chinatown",
    interior: "chinatown",
    order: 40,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset() {
      closeShelf();
    },
  });
})();
