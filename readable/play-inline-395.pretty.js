/* src/poi_village3/07_v3.js */
/* =====================================================================
 * NEW RAD CITY — poi_village3 / 07_v3.js
 * Extra construction helpers for this module's three buildings
 * (all local coords on a kit builder `b`):
 *   K.lancet       High-Victorian-Gothic pointed window, polychrome voussoirs
 *   K.pitchRoof    gabled roof (slopes + gable ends + eaves + iron cresting)
 *   K.pyramid      pyramid / spire roof on a rectangle
 *   K.bands        stone string-courses proud of a façade line
 *   K.clockCell    clock face painted into the 'art' (day) or 'neon' (lit) atlas
 *   K.bookJacket   fake old-world book jackets (Bedford's walls) — original titles
 *   K.ironFence    wrought-iron spear fence along a line
 *   K.deadTree     leafless street tree (trunk + forked branches)
 *   K.gearWheel    toothed gear disc (clock works)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pv3;
  const K = PV.kit;
  const PI = Math.PI;

  /**
   * Pointed (equilateral) Gothic window. (x,z) centre on the wall surface, yb = sill, facing (nx,nz),
   * w wide, h total height to the apex. o: {state, paneTint, surround, tintA, tintB (alternating voussoirs),
   * fw, depth, sill, mullion, rose (small oculus in the head)}
   */
  K.lancet = function (b, x, yb, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz,
      rz = -nx,
      R = w / 2;
    const apex = w * 0.866;
    const hr = Math.max(0.15, h - apex);
    const P = (u, v, d) => [x + rx * u + nx * d, yb + v, z + rz * u + nz * d];
    const n = [nx, 0, nz];
    const st = o.state || "glass";
    const back =
      st === "glass"
        ? "glass"
        : st === "lit"
          ? "lamp"
          : st === "boarded"
            ? "wood_rotten"
            : "paint_black";
    const tint =
      o.paneTint ||
      (st === "glass"
        ? [0.36, 0.44, 0.44]
        : st === "lit"
          ? [0.95, 0.66, 0.36]
          : st === "boarded"
            ? [0.55, 0.47, 0.4]
            : [0.03, 0.03, 0.03]);
    const d0 = 0.015,
      N = 6;
    // arch curve points (left half then right half), u/v in wall space
    const arc = [];
    for (let i = 0; i <= N; i++) {
      const t = PI - ((PI / 3) * i) / N;
      arc.push([R + w * Math.cos(t), hr + w * Math.sin(t)]);
    }
    for (let i = N - 1; i >= 0; i--) {
      const q = arc[i];
      arc.push([-q[0], q[1]]);
    }
    b.quadN(back, P(-R, 0, d0), P(R, 0, d0), P(R, hr, d0), P(-R, hr, d0), n, {
      tint,
      grime: 0.2,
    });
    for (let i = 0; i < arc.length - 1; i++) {
      const A = P(arc[i][0], arc[i][1], d0),
        B = P(arc[i + 1][0], arc[i + 1][1], d0),
        C = P(0, hr, d0);
      b.quadN(back, C, A, B, B, n, { tint, grime: 0.2 });
    }
    if (st === "broken") {
      const r = K.rng((x * 13 + yb * 7 + z * 3) | 0);
      for (let k = 0; k < 3; k++) {
        const u = (r() - 0.5) * w * 0.7;
        b.quadN(
          "glass",
          P(u - 0.1, 0, d0 + 0.004),
          P(u + 0.14, 0, d0 + 0.004),
          P(u + 0.03, 0.3 + r() * 0.6, d0 + 0.004),
          P(u, 0.2 + r() * 0.5, d0 + 0.004),
          n,
          { tint: [0.45, 0.52, 0.52] },
        );
      }
    }
    if (st === "boarded") {
      const r = K.rng((x * 11 + yb * 5 + z * 7) | 0);
      for (let i = 0; i < 3; i++) {
        const yy = 0.3 + (i * (hr - 0.3)) / 2;
        const a = P(-R - 0.08, yy + (r() - 0.5) * 0.2, 0.1),
          c = P(R + 0.08, yy + (r() - 0.5) * 0.2, 0.1);
        b.beam("wood_rotten", a[0], a[1], a[2], c[0], c[1], c[2], 0.22, 0.03, {
          tint: [0.7, 0.6, 0.5],
        });
      }
    } else if (o.mullion !== false) {
      const fm = o.frame || "paint_black";
      const m0 = P(0, 0, d0 + 0.03),
        m1 = P(0, hr + apex * 0.55, d0 + 0.03);
      b.beam(fm, m0[0], m0[1], m0[2], m1[0], m1[1], m1[2], 0.06, 0.05, {
        grime: 0.2,
      });
      for (const v of [hr * 0.5, hr]) {
        const t0 = P(-R, v, d0 + 0.03),
          t1 = P(R, v, d0 + 0.03);
        b.beam(fm, t0[0], t0[1], t0[2], t1[0], t1[1], t1[2], 0.05, 0.04, {
          grime: 0.2,
        });
      }
      if (o.rose !== false && w > 0.9) {
        const c = P(0, hr + apex * 0.5, d0 + 0.035);
        b.geo(fm, new THREE.TorusGeometry(R * 0.36, 0.035, 4, 12), {
          x: c[0],
          y: c[1],
          z: c[2],
          ry: Math.atan2(nx, nz),
          grime: 0.2,
        });
      }
    }
    // polychrome surround: jambs + voussoirs alternating light stone / red brick
    const sm = o.surround || "limestone",
      fw = o.fw || 0.2,
      dep = o.depth !== undefined ? o.depth : 0.14;
    const tA = o.tintA || [0.9, 0.86, 0.76],
      tB = o.tintB || [0.72, 0.38, 0.3];
    for (const s of [-1, 1]) {
      const a = P(s * (R + fw / 2), 0, dep / 2),
        c = P(s * (R + fw / 2), hr, dep / 2);
      b.beam(sm, a[0], a[1], a[2], c[0], c[1], c[2], fw, dep, { tint: tA });
    }
    const ring = [];
    const Rr = w + fw / 2; // radius of the voussoir ring centreline
    for (let i = 0; i <= N; i++) {
      const t = PI - ((PI / 3) * i) / N;
      ring.push([R + Rr * Math.cos(t), hr + Rr * Math.sin(t)]);
    }
    for (let i = N - 1; i >= 0; i--) {
      const q = ring[i];
      ring.push([-q[0], q[1]]);
    }
    for (let i = 0; i < ring.length - 1; i++) {
      const A = P(ring[i][0], ring[i][1], dep / 2),
        B = P(ring[i + 1][0], ring[i + 1][1], dep / 2);
      b.beam(sm, A[0], A[1], A[2], B[0], B[1], B[2], fw, dep, {
        tint: i % 2 ? tB : tA,
      });
    }
    if (o.sill !== false) {
      const s = P(0, -0.07, dep * 0.6);
      b.box(
        o.sillMat || sm,
        s[0],
        s[1] - 0.06,
        s[2],
        w + fw * 2 + 0.2,
        0.13,
        dep * 1.5,
        { yaw: Math.atan2(nx, nz), tint: tA },
      );
    }
  };

  /**
   * Gabled roof over x0..x1 / z0..z1. axis 'x' → ridge runs along x (slopes face ±z). yE eave, yR ridge.
   * o: {mat (roof), tint, gable (wall mat for the triangle ends, false = none), gableTint, over (eave overhang),
   *     crest (iron cresting on the ridge), ends: 'both'|'a'|'b'|'none'}
   */
  K.pitchRoof = function (b, x0, x1, z0, z1, yE, yR, axis, o) {
    o = o || {};
    const mat = o.mat || "slate",
      t = o.tint || [0.42, 0.44, 0.48],
      ov = o.over !== undefined ? o.over : 0.4;
    const ends = o.ends || "both";
    if (axis === "x") {
      const zm = (z0 + z1) / 2;
      b.quadN(
        mat,
        [x0 - ov, yE - 0.15, z1 + ov],
        [x1 + ov, yE - 0.15, z1 + ov],
        [x1 + ov, yR, zm],
        [x0 - ov, yR, zm],
        [0, 1, 1],
        { tint: t, grime: 0.4 },
      );
      b.quadN(
        mat,
        [x1 + ov, yE - 0.15, z0 - ov],
        [x0 - ov, yE - 0.15, z0 - ov],
        [x0 - ov, yR, zm],
        [x1 + ov, yR, zm],
        [0, 1, -1],
        { tint: t.map((v) => v * 0.85), grime: 0.4 },
      );
      if (o.gable !== false) {
        const gm = o.gable || "brick_red",
          gt = o.gableTint || [0.8, 0.5, 0.4];
        if (ends === "both" || ends === "a")
          b.quadN(
            gm,
            [x0, yE, z1],
            [x0, yE, z0],
            [x0, yR - 0.05, zm],
            [x0, yR - 0.05, zm],
            [-1, 0, 0],
            { tint: gt },
          );
        if (ends === "both" || ends === "b")
          b.quadN(
            gm,
            [x1, yE, z0],
            [x1, yE, z1],
            [x1, yR - 0.05, zm],
            [x1, yR - 0.05, zm],
            [1, 0, 0],
            { tint: gt },
          );
      }
      b.beam(
        "black_iron",
        x0 - ov,
        yR + 0.05,
        zm,
        x1 + ov,
        yR + 0.05,
        zm,
        0.14,
        0.12,
        { tint: [0.25, 0.24, 0.22] },
      );
      if (o.crest)
        for (let x = x0; x <= x1; x += 0.35)
          b.beam(
            "black_iron",
            x,
            yR + 0.1,
            zm,
            x,
            yR + 0.45 + (Math.round((x - x0) / 0.35) % 3 === 0 ? 0.2 : 0),
            zm,
            0.03,
            0.03,
          );
    } else {
      const xm = (x0 + x1) / 2;
      b.quadN(
        mat,
        [x1 + ov, yE - 0.15, z1 + ov],
        [x1 + ov, yE - 0.15, z0 - ov],
        [xm, yR, z0 - ov],
        [xm, yR, z1 + ov],
        [1, 1, 0],
        { tint: t, grime: 0.4 },
      );
      b.quadN(
        mat,
        [x0 - ov, yE - 0.15, z0 - ov],
        [x0 - ov, yE - 0.15, z1 + ov],
        [xm, yR, z1 + ov],
        [xm, yR, z0 - ov],
        [-1, 1, 0],
        { tint: t.map((v) => v * 0.85), grime: 0.4 },
      );
      if (o.gable !== false) {
        const gm = o.gable || "brick_red",
          gt = o.gableTint || [0.8, 0.5, 0.4];
        if (ends === "both" || ends === "a")
          b.quadN(
            gm,
            [x0, yE, z0],
            [x1, yE, z0],
            [xm, yR - 0.05, z0],
            [xm, yR - 0.05, z0],
            [0, 0, -1],
            { tint: gt },
          );
        if (ends === "both" || ends === "b")
          b.quadN(
            gm,
            [x1, yE, z1],
            [x0, yE, z1],
            [xm, yR - 0.05, z1],
            [xm, yR - 0.05, z1],
            [0, 0, 1],
            { tint: gt },
          );
      }
      b.beam(
        "black_iron",
        xm,
        yR + 0.05,
        z0 - ov,
        xm,
        yR + 0.05,
        z1 + ov,
        0.14,
        0.12,
        { tint: [0.25, 0.24, 0.22] },
      );
      if (o.crest)
        for (let z = z0; z <= z1; z += 0.35)
          b.beam(
            "black_iron",
            xm,
            yR + 0.1,
            z,
            xm,
            yR + 0.45 + (Math.round((z - z0) / 0.35) % 3 === 0 ? 0.2 : 0),
            z,
            0.03,
            0.03,
          );
    }
  };

  /** Pyramid roof / spire over a w×d rectangle centred (cx,cz), base y0, height h. o: {mat, tint, over, apex:[dx,dz]} */
  K.pyramid = function (b, cx, cz, w, d, y0, h, o) {
    o = o || {};
    const mat = o.mat || "slate",
      t = o.tint || [0.42, 0.44, 0.48],
      ov = o.over || 0;
    const hw = w / 2 + ov,
      hd = d / 2 + ov,
      A = [cx, y0 + h, cz];
    const c = [
      [cx - hw, y0, cz + hd],
      [cx + hw, y0, cz + hd],
      [cx + hw, y0, cz - hd],
      [cx - hw, y0, cz - hd],
    ];
    const nrm = [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, -1],
      [-1, 1, 0],
    ];
    for (let i = 0; i < 4; i++)
      b.quadN(mat, c[i], c[(i + 1) % 4], A, A, nrm[i], {
        tint: t.map((v) => v * (0.8 + 0.07 * i)),
        grime: o.grime !== undefined ? o.grime : 0.35,
      });
  };

  /** Stone string-courses along a façade line A→B (wall surface), projecting to (nx,nz), at the given heights. */
  K.bands = function (b, ax, az, bx, bz, nx, nz, ys, o) {
    o = o || {};
    const dep = o.depth || 0.08,
      h = o.h || 0.22,
      mat = o.mat || "limestone",
      t = o.tint || [0.9, 0.86, 0.76];
    for (const y of ys)
      b.beam(
        mat,
        ax + (nx * dep) / 2,
        y,
        az + (nz * dep) / 2,
        bx + (nx * dep) / 2,
        y,
        bz + (nz * dep) / 2,
        dep,
        h,
        { tint: t, grime: 0.35 },
      );
  };

  /**
   * Clock face cell. o: {lit (neon atlas, black bg → additive glow), hour, minute, roman (default true), ring colour, face colour, broken}
   */
  K.clockCell = function (key, o) {
    o = o || {};
    const lit = !!o.lit;
    return K.paint(
      lit ? "neon" : "art",
      "clock_" + key,
      256,
      256,
      function (x, X, Y, W, H) {
        const cx = X + W / 2,
          cy = Y + H / 2,
          R = W * 0.47;
        if (lit) {
          x.fillStyle = "#000";
          x.fillRect(X, Y, W, H);
        } else x.clearRect(X, Y, W, H);
        // dial
        const g = x.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
        if (lit) {
          g.addColorStop(0, o.glowIn || "#c8b070");
          g.addColorStop(1, o.glowOut || "#6a5020");
        } else {
          g.addColorStop(0, o.face || "#e8e0c8");
          g.addColorStop(1, "#b8ae94");
        }
        x.fillStyle = g;
        x.beginPath();
        x.arc(cx, cy, R, 0, PI * 2);
        x.fill();
        x.lineWidth = W * 0.035;
        x.strokeStyle = lit ? "#2a1c08" : o.ring || "#2a2620";
        x.beginPath();
        x.arc(cx, cy, R * 0.97, 0, PI * 2);
        x.stroke();
        x.lineWidth = W * 0.01;
        x.beginPath();
        x.arc(cx, cy, R * 0.72, 0, PI * 2);
        x.stroke();
        x.fillStyle = lit ? "#1a1204" : "#1e1a14";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.font = "bold " + Math.round(W * 0.085) + "px Georgia, serif";
        const ROM = [
          "XII",
          "I",
          "II",
          "III",
          "IIII",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
        ];
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * PI * 2 - PI / 2;
          if (o.roman !== false)
            x.fillText(
              ROM[i],
              cx + Math.cos(a) * R * 0.84,
              cy + Math.sin(a) * R * 0.84,
            );
          else {
            x.fillRect(
              cx + Math.cos(a) * R * 0.84 - 4,
              cy + Math.sin(a) * R * 0.84 - 10,
              8,
              20,
            );
          }
        }
        for (let i = 0; i < 60; i++) {
          const a = (i / 60) * PI * 2;
          x.fillRect(
            cx + Math.cos(a) * R * 0.93 - 1,
            cy + Math.sin(a) * R * 0.93 - 1,
            i % 5 ? 2 : 4,
            i % 5 ? 2 : 4,
          );
        }
        // hands (stopped at the moment the bombs fell unless told otherwise)
        const hr = o.hour !== undefined ? o.hour : 9,
          mn = o.minute !== undefined ? o.minute : 47;
        const ha = (((hr % 12) + mn / 60) / 12) * PI * 2 - PI / 2,
          ma = (mn / 60) * PI * 2 - PI / 2;
        x.strokeStyle = lit ? "#120c02" : "#14110c";
        x.lineCap = "round";
        x.lineWidth = W * 0.035;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ha) * R * 0.45, cy + Math.sin(ha) * R * 0.45);
        x.stroke();
        x.lineWidth = W * 0.022;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ma) * R * 0.66, cy + Math.sin(ma) * R * 0.66);
        x.stroke();
        x.fillStyle = lit ? "#120c02" : "#14110c";
        x.beginPath();
        x.arc(cx, cy, W * 0.03, 0, PI * 2);
        x.fill();
        if (o.broken) {
          // a shattered section of the glass dial
          const r = K.rng(key);
          x.fillStyle = lit ? "#000" : "rgba(0,0,0,0)";
          x.save();
          x.beginPath();
          x.moveTo(cx + R * 0.1, cy - R * 0.2);
          for (let k = 0; k < 7; k++) {
            const a = -0.3 + k * 0.28;
            x.lineTo(
              cx + Math.cos(a) * R * (0.6 + r() * 0.4),
              cy + Math.sin(a) * R * (0.6 + r() * 0.4),
            );
          }
          x.closePath();
          x.globalCompositeOperation = lit ? "source-over" : "destination-out";
          x.fill();
          x.restore();
        }
        if (!lit) {
          K.stains(x, X, Y, W, H, 8, 41, 0.35, [60, 45, 25]);
        }
      },
    );
  };

  // ------------------------------------------------------------------
  // Bedford's: framed book jackets of the regulars (fake, original titles & authors)
  // ------------------------------------------------------------------
  const BOOKS = [
    ["THE GREEN GLOW", "Harriet Vane-Smythe"],
    ["NIGHT COURT", "J. D. Pelham"],
    ["A DRINK ON BEDFORD", "Marcus Tolliver"],
    ["THE ATOMIC HEART", "Ruth Ainsley"],
    ["EIGHTY-SIX", "Frank Lowell"],
    ["MANHATTAN, UNDONE", "Celia March"],
    ["POEMS FOR A SHELTER", "O. P. Quade"],
    ["THE LAST STREETCAR", "Leo Brandeis"],
    ["BOWERY BLUES", "Dorothy Kaye"],
    ["SMOKE OVER THE HUDSON", "Wendell Price"],
    ["THE SPEAKEASY", "Ambrose Hallam"],
    ["CHROME & SORROW", "Iris Mandel"],
    ["CELLAR OF DREAMS", "Pauline Ashe"],
    ["A FIRE ESCAPE SUMMER", "Tom Carrow"],
    ["THE ROBOT WHO WEPT", "Gene Hollister"],
    ["NO SIGN ON THE DOOR", "L. S. Bedford"],
    ["GRANITE & GIN", "Walter Pickard"],
    ["THE BERLIN LETTERS", "Mae Donnelly"],
    ["ASHFALL SONNETS", "Bertrand Vail"],
    ["THE COURTHOUSE CLOCK", "Inez Ortega"],
    ["LIGHT ON 14th STREET", "Hugh Garrity"],
    ["BLACKOUT", "Sylvia Rourke"],
    ["GREENWICH RAIN", "Arthur Kell"],
    ["WHAT THE BARTENDER SAW", "Anon."],
  ];
  K.BOOKS = BOOKS;
  K.bookJacket = function (i) {
    const bk = BOOKS[i % BOOKS.length];
    return K.paint("pics", "v3_book_" + i, 96, 144, function (x, X, Y, W, H) {
      const r = K.rng("book" + i);
      const pal = [
        ["#7a2a1e", "#e8d8b0"],
        ["#1e3a5a", "#f0e0b8"],
        ["#2a4a2a", "#e8dcb0"],
        ["#d8c8a0", "#3a2014"],
        ["#1a1a1a", "#d8b050"],
        ["#6a4a8a", "#f0e8d0"],
        ["#b04a20", "#1a1410"],
        ["#e0d8c0", "#8a1a14"],
      ][(i * 5 + 3) % 8];
      x.fillStyle = pal[0];
      x.fillRect(X, Y, W, H);
      // graphic motif
      x.fillStyle = pal[1];
      x.globalAlpha = 0.35;
      const m = i % 4;
      if (m === 0) {
        x.beginPath();
        x.arc(X + W / 2, Y + H * 0.55, W * 0.28, 0, PI * 2);
        x.fill();
      } else if (m === 1) {
        for (let k = 0; k < 5; k++)
          x.fillRect(X, Y + H * (0.3 + k * 0.1), W, H * 0.04);
      } else if (m === 2) {
        x.beginPath();
        x.moveTo(X + W * 0.1, Y + H * 0.85);
        x.lineTo(X + W * 0.5, Y + H * 0.3);
        x.lineTo(X + W * 0.9, Y + H * 0.85);
        x.fill();
      } else {
        for (let k = 0; k < 7; k++) {
          x.fillRect(
            X + W * (0.1 + k * 0.12),
            Y + H * (0.45 + r() * 0.2),
            W * 0.08,
            H * 0.4,
          );
        }
      }
      x.globalAlpha = 1;
      x.fillStyle = pal[1];
      x.textAlign = "center";
      x.textBaseline = "middle";
      const words = bk[0].split(" ");
      let line = "",
        yy = Y + H * 0.14;
      const lines = [];
      for (const w of words) {
        if ((line + w).length > 10) {
          lines.push(line.trim());
          line = "";
        }
        line += w + " ";
      }
      lines.push(line.trim());
      x.font = "bold " + Math.round(W * 0.14) + "px Georgia, serif";
      for (const ln of lines) {
        x.fillText(ln, X + W / 2, yy, W * 0.9);
        yy += W * 0.16;
      }
      x.font = "italic " + Math.round(W * 0.1) + "px Georgia, serif";
      x.fillText(bk[1], X + W / 2, Y + H * 0.9, W * 0.9);
      K.stains(x, X, Y, W, H, 5, i + 11, 0.4, [60, 40, 20]);
      x.fillStyle = "rgba(150,110,50,0.15)";
      x.fillRect(X, Y, W, H);
    });
  };

  /** Wrought-iron spear fence from A to B at ground y. o: {h, step, col} */
  K.ironFence = function (b, ax, az, bx, bz, y, o) {
    o = o || {};
    const h = o.h || 1.6,
      step = o.step || 0.14,
      len = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.round(len / step));
    for (const yy of [y + 0.18, y + h - 0.2])
      b.beam("black_iron", ax, yy, az, bx, yy, bz, 0.04, 0.04, {
        tint: [0.18, 0.17, 0.16],
      });
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        px = ax + (bx - ax) * t,
        pz = az + (bz - az) * t;
      if (
        o.gapAt !== undefined &&
        Math.abs(t * len - o.gapAt) < (o.gapW || 1.2) / 2
      )
        continue;
      if (o.bent && (i * 7) % 11 === 0) {
        b.beam(
          "black_iron",
          px,
          y,
          pz,
          px + 0.15,
          y + h * 0.8,
          pz + 0.1,
          0.022,
          0.022,
          { tint: [0.18, 0.17, 0.16] },
        );
        continue;
      }
      b.beam("black_iron", px, y, pz, px, y + h, pz, 0.022, 0.022, {
        tint: [0.18, 0.17, 0.16],
      });
      b.cyl("black_iron", px, y + h, pz, 0.035, 0.0, 0.12, 4, {
        tint: [0.18, 0.17, 0.16],
      });
    }
    if (o.col !== false) {
      const minx = Math.min(ax, bx) - 0.06,
        maxx = Math.max(ax, bx) + 0.06,
        minz = Math.min(az, bz) - 0.06,
        maxz = Math.max(az, bz) + 0.06;
      if (o.gapAt === undefined)
        b.col(minx, y, minz, maxx, y + h, maxz, {
          tag: "fence",
          walkable: false,
          surface: "metal",
        });
      else {
        const ux = (bx - ax) / len,
          uz = (bz - az) / len,
          g0 = o.gapAt - (o.gapW || 1.2) / 2,
          g1 = o.gapAt + (o.gapW || 1.2) / 2;
        const seg = (t0, t1) => {
          const x0 = ax + ux * t0,
            z0 = az + uz * t0,
            x1 = ax + ux * t1,
            z1 = az + uz * t1;
          b.col(
            Math.min(x0, x1) - 0.06,
            y,
            Math.min(z0, z1) - 0.06,
            Math.max(x0, x1) + 0.06,
            y + h,
            Math.max(z0, z1) + 0.06,
            { tag: "fence", walkable: false, surface: "metal" },
          );
        };
        if (g0 > 0.05) seg(0, g0);
        if (g1 < len - 0.05) seg(g1, len);
      }
    }
  };

  /** Leafless tree. */
  K.deadTree = function (b, x, y, z, h, seed) {
    const r = K.rng(seed || (x * 31 + z * 17) | 0);
    const t = [0.3, 0.26, 0.22];
    b.cyl("wood_rotten", x, y, z, 0.2, 0.12, h * 0.55, 7, { tint: t });
    const branch = (px, py, pz, len, a, pitch, depth) => {
      const ex = px + Math.cos(a) * Math.cos(pitch) * len,
        ey = py + Math.sin(pitch) * len,
        ez = pz + Math.sin(a) * Math.cos(pitch) * len;
      b.pipe(
        "wood_rotten",
        px,
        py,
        pz,
        ex,
        ey,
        ez,
        0.1 * Math.pow(0.6, 3 - depth),
        4,
        { tint: t },
      );
      if (depth > 0)
        for (let k = 0; k < 2; k++)
          branch(
            ex,
            ey,
            ez,
            len * 0.62,
            a + (r() - 0.5) * 1.6,
            pitch + (r() - 0.4) * 0.5,
            depth - 1,
          );
    };
    for (let k = 0; k < 4; k++)
      branch(
        x,
        y + h * (0.45 + r() * 0.12),
        z,
        h * 0.3,
        r() * PI * 2,
        0.6 + r() * 0.5,
        2,
      );
    b.col(x - 0.2, y, z - 0.2, x + 0.2, y + h * 0.5, z + 0.2, {
      tag: "tree",
      walkable: false,
      surface: "wood",
    });
  };

  /** Toothed gear disc, axle along x (a vertical wheel seen from ±x). */
  K.gearWheel = function (b, x, y, z, r, th, teeth, o) {
    o = o || {};
    const mat = o.mat || "brass",
      t = o.tint;
    b.geo(mat, new THREE.CylinderGeometry(r, r, th, Math.max(12, teeth)), {
      x,
      y,
      z,
      rz: PI / 2,
      tint: t,
    });
    for (let k = 0; k < teeth; k++) {
      const a = (k / teeth) * PI * 2;
      b.box(
        mat,
        x,
        y + Math.sin(a) * (r + 0.03) - 0.04,
        z + Math.cos(a) * (r + 0.03),
        th,
        0.08,
        0.08,
        { tint: t },
      );
    }
    b.geo(
      o.hub || "steel",
      new THREE.CylinderGeometry(r * 0.18, r * 0.18, th * 1.8, 8),
      { x, y, z, rz: PI / 2 },
    );
  };
  /**
   * The inside face of a street door — so the way OUT always reads as a door (as in any lived-in interior: a solid
   * door leaf, daylight through the transom/glass, an EXIT sign or lamp over it), never a black hole.
   * Local coords on builder b. (x,y,z) = centre of the opening at floor level on the wall plane; (nx,nz) =
   * axis-aligned normal pointing INTO the room; w,h = opening size.
   * o: {mat, tint, leaves (1|2), glass (upper panels frosted & daylit), transom (text or true), sign ('EXIT' | text | false),
   *     signColor, day ([r,g,b] outside light colour), lightBox ([x0,y0,z0,x1,y1,z1] local), lamp (brass lantern instead of sign)}
   */
  K.exitDoor = function (b, x, y, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz !== 0 ? -nz : 0,
      rz = nx !== 0 ? nx : 0; // right-hand axis seen from inside
    const box = (mat, u0, v0, d0, u1, v1, d1, opts) => {
      const ax = x + rx * u0 + nx * d0,
        az = z + rz * u0 + nz * d0,
        bx = x + rx * u1 + nx * d1,
        bz = z + rz * u1 + nz * d1;
      b.boxMM(
        mat,
        Math.min(ax, bx),
        y + v0,
        Math.min(az, bz),
        Math.max(ax, bx),
        y + v1,
        Math.max(az, bz),
        opts || {},
      );
    };
    const P = (u, v, d) => [x + rx * u + nx * d, y + v, z + rz * u + nz * d];
    // daylight through frosted glass is a NEON-atlas plate, not 'lamp' geometry: atmosphere auto-adds a glow
    // sprite + pooled light to every 'lamp' cluster in an interior, which put glare blobs on the door leaves
    const dayCell = K.paint(
      "neon",
      "pv3_daylight_frost",
      64,
      64,
      function (c, X, Y, W, H) {
        const g = c.createLinearGradient(X, Y, X, Y + H);
        g.addColorStop(0, "#f4f0e0");
        g.addColorStop(1, "#c8c4b4");
        c.fillStyle = g;
        c.fillRect(X, Y, W, H);
        const r = K.rng("pv3_frost");
        for (let k = 0; k < 60; k++) {
          c.fillStyle = "rgba(90,86,70," + (r() * 0.25).toFixed(2) + ")";
          c.fillRect(X + r() * W, Y + r() * H, 1 + r() * 5, 1 + r() * 3);
        }
      },
    );
    const dayPlate = (uc, vc, d, pw, ph, k) => {
      const q = P(uc, vc, d);
      b.plate("neon", q[0], q[1], q[2], nx, nz, pw, ph, dayCell, {
        off: 0.002,
        tint: day.map((c) => c * k),
      });
    };
    const mat = o.mat || "wood_dark",
      tint = o.tint || [0.32, 0.2, 0.12];
    const day = o.day || [0.95, 0.9, 0.72];
    const hasTransom = !!o.transom;
    const hd = hasTransom ? h - Math.min(0.7, h * 0.22) : h; // leaf height
    const leaves = o.leaves || (w > 1.5 ? 2 : 1);
    const lw = w / leaves;
    // black backing behind everything (no see-through slivers into the void)
    box("paint_black", -w / 2 - 0.05, 0, -0.06, w / 2 + 0.05, h + 0.05, -0.02, {
      tint: [0.02, 0.02, 0.02],
    });
    for (let i = 0; i < leaves; i++) {
      const u0 = -w / 2 + i * lw + 0.015,
        u1 = u0 + lw - 0.03;
      box(mat, u0, 0.01, 0.0, u1, hd, 0.06, { tint });
      // stiles & rails proud of the slab, raised panels between them
      const pw = u1 - u0 - 0.26;
      const rows = o.glass
        ? [
            [0.25, hd * 0.42],
            [hd * 0.5, hd - 0.14],
          ]
        : [
            [0.25, hd * 0.44],
            [hd * 0.52, hd - 0.14],
          ];
      rows.forEach(([v0, v1], k) => {
        const upperGlass = o.glass && k === 1;
        if (upperGlass) {
          box("paint_black", u0 + 0.13, v0, 0.055, u0 + 0.13 + pw, v1, 0.058, {
            tint: [0.02, 0.02, 0.02],
          });
          dayPlate(u0 + 0.13 + pw / 2, (v0 + v1) / 2, 0.058, pw, v1 - v0, 0.62);
          // glazing bars
          box(
            "black_iron",
            u0 + 0.13 + pw / 2 - 0.015,
            v0,
            0.062,
            u0 + 0.13 + pw / 2 + 0.015,
            v1,
            0.075,
            {},
          );
          box(
            "black_iron",
            u0 + 0.13,
            (v0 + v1) / 2 - 0.015,
            0.062,
            u0 + 0.13 + pw,
            (v0 + v1) / 2 + 0.015,
            0.075,
            {},
          );
        } else {
          box(mat, u0 + 0.13, v0, 0.06, u0 + 0.13 + pw, v1, 0.085, {
            tint: tint.map((c) => c * 1.15),
          });
          box(
            mat,
            u0 + 0.19,
            v0 + 0.06,
            0.085,
            u0 + 0.07 + pw,
            v1 - 0.06,
            0.1,
            { tint: tint.map((c) => c * 0.9) },
          );
        }
      });
      // kick plate + push bar / pull handle on the meeting edge
      box("brass", u0 + 0.05, 0.02, 0.06, u1 - 0.05, 0.24, 0.07, {
        tint: [0.62, 0.5, 0.3],
      });
      const edge = leaves === 2 ? (i === 0 ? u1 - 0.12 : u0 + 0.12) : u1 - 0.14;
      box("brass", edge - 0.02, 0.9, 0.1, edge + 0.02, 1.35, 0.14, {
        tint: [0.75, 0.6, 0.34],
      });
      box("brass", edge - 0.035, 0.88, 0.06, edge + 0.035, 0.92, 0.14, {
        tint: [0.7, 0.56, 0.32],
      });
      box("brass", edge - 0.035, 1.33, 0.06, edge + 0.035, 1.37, 0.14, {
        tint: [0.7, 0.56, 0.32],
      });
    }
    // bright crack of daylight at the sill and between the leaves
    dayPlate(0, 0.014, 0.062, w - 0.06, 0.026, 0.9);
    if (leaves === 2) dayPlate(0, hd / 2, 0.062, 0.016, hd - 0.04, 0.8);
    if (hasTransom) {
      box(mat, -w / 2, hd, 0.0, w / 2, hd + 0.09, 0.09, { tint });
      box(
        "paint_black",
        -w / 2 + 0.05,
        hd + 0.09,
        0.03,
        w / 2 - 0.05,
        h - 0.04,
        0.036,
        { tint: [0.02, 0.02, 0.02] },
      );
      dayPlate(
        0,
        (hd + 0.09 + h - 0.04) / 2,
        0.036,
        w - 0.1,
        h - 0.13 - hd,
        0.72,
      );
      const n = Math.max(2, Math.round(w / 0.45));
      for (let k = 1; k < n; k++) {
        const u = -w / 2 + (w * k) / n;
        box(
          "black_iron",
          u - 0.012,
          hd + 0.09,
          0.04,
          u + 0.012,
          h - 0.04,
          0.06,
          {},
        );
      }
      if (typeof o.transom === "string")
        K.letters(
          b,
          P(0, 0, 0.065)[0],
          y + (hd + h) / 2 + 0.02,
          P(0, 0, 0.065)[2],
          nx,
          nz,
          w * 0.86,
          (h - hd) * 0.5,
          o.transom,
          { fg: "#d8b060", font: "Georgia, serif", off: 0.005, shadow: false },
        );
      const g = P(0, (hd + h) / 2, 0.2);
      b.glow(
        g[0],
        g[1],
        g[2],
        day.map((c) => c * 0.55),
        w * 0.9,
      );
    }
    // the light that comes in with it (baked)
    const L = P(0, 1.3, 1.1);
    b.light(
      L[0],
      L[1],
      L[2],
      day,
      o.lightI || 0.55,
      o.lightR || 4.5,
      o.lightBox ? { box: o.lightBox } : undefined,
    );
    // EXIT sign (neon) or a brass lantern over the door
    if (o.sign !== false && !o.lamp) {
      const txt = o.sign || "EXIT",
        col = o.signColor || "#ff3a26";
      const sw = Math.max(0.62, txt.length * 0.13),
        sy = h + 0.32;
      box(
        "metal",
        -sw / 2 - 0.04,
        sy - 0.17,
        0.0,
        sw / 2 + 0.04,
        sy + 0.17,
        0.1,
        { tint: [0.16, 0.16, 0.15] },
      );
      const s = P(0, 0, 0.102);
      b.plate(
        "neon",
        s[0],
        sy + y,
        s[2],
        nx,
        nz,
        sw,
        0.26,
        K.neonCell("pv3_exit_" + txt, txt, Math.round((64 * sw) / 0.26), 64, {
          color: col,
        }),
        { off: 0.003 },
      );
      const gg = P(0, sy, 0.3);
      b.glow(gg[0], gg[1], gg[2], [1, 0.3, 0.2], 0.9);
    } else if (o.lamp) {
      const l = P(w / 2 + 0.35, h - 0.2, 0.18);
      K.lamp(b, l[0], l[1], l[2], "cage", [1, 0.72, 0.4], 0.45, 3.5, {
        ceil: l[1] + 0.25,
        lightOpts: o.lightBox ? { box: o.lightBox } : undefined,
      });
    }
  };
})();
