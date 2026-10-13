/* src/poi_harbor2/07_geo.js */
/* =====================================================================
 * NEW RAD CITY — poi_harbor2 / 07_geo.js (adapted from poi_fidi3/07_fidi.js)
 * Extra geometry helpers for the waterfront POIs (local coords, kit builder `b`):
 *   K.dome        inward (or outward) elliptical dome / lathe with its own UVs (coffers)
 *   K.annulus     flat ring (rotunda gallery, soffits, oculus rims)
 *   K.tri         single triangle (pediments / gables), normal forced to n
 *   K.gable       Greek pediment: tympanum + raking cornices, facing ±z
 *   K.chandelier  crystal chandelier (lamp beads + baked light + glow)
 *   K.oneWay / K.ringCollar / K.clutter  level-flow & set-dressing helpers
 * Atlas painters:  K.skyline (ruined Manhattan panorama for window plates),
 *   K.flagCell (tattered US flag / raider banner).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI;

  /**
   * Elliptical dome (or any lathe) centred (cx, y0, cz): radius R at the base, rising H, open top radius rTop.
   * Built from rings of quads with u = around × uRep, v = up × vRep. inward=true: faces the centre.
   */
  K.dome = function (b, mat, cx, y0, cz, R, H, rTop, segs, rings, inward, o) {
    o = o || {};
    const bk = b._b(mat);
    const tint = K.tint(o.tint),
      grime = o.grime !== undefined ? o.grime : b.grime * 0.5;
    const uRep = o.uRep || 16,
      vRep = o.vRep || 5;
    // elevation parameter: r = R cos(t), y = H sin(t), t from 0 to tMax where R cos(tMax) = rTop
    const tMax = Math.acos(Math.max(-1, Math.min(1, (rTop || 0) / R)));
    const base = bk.vc;
    for (let j = 0; j <= rings; j++) {
      const t = (tMax * j) / rings,
        r = R * Math.cos(t),
        y = y0 + H * Math.sin(t);
      // ellipse normal (outward): (cos t / R, sin t / H) direction in (r, y)
      let nr = Math.cos(t) / R,
        ny = Math.sin(t) / H;
      const nl = Math.hypot(nr, ny) || 1;
      nr /= nl;
      ny /= nl;
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * PI * 2,
          ca = Math.cos(a),
          sa = Math.sin(a);
        const s = inward ? -1 : 1;
        b._v(
          bk,
          cx + ca * r,
          y,
          cz - sa * r,
          s * ca * nr,
          s * ny,
          -s * sa * nr,
          (i / segs) * uRep,
          (j / rings) * vRep * (tMax / (PI / 2)),
          tint,
          grime,
        );
      }
    }
    const row = segs + 1;
    for (let j = 0; j < rings; j++)
      for (let i = 0; i < segs; i++) {
        const a = base + j * row + i;
        if (inward) bk.i.push(a, a + row, a + row + 1, a, a + row + 1, a + 1);
        else bk.i.push(a, a + row + 1, a + row, a, a + 1, a + row + 1);
      }
    return b;
  };

  /** Flat horizontal ring between r0 and r1 at height y; up=true faces up, else down. */
  K.annulus = function (b, mat, cx, y, cz, r0, r1, segs, up, o) {
    o = o || {};
    const a0 = o.a0 || 0,
      arc = o.arc || PI * 2;
    for (let i = 0; i < segs; i++) {
      const t0 = a0 + (arc * i) / segs,
        t1 = a0 + (arc * (i + 1)) / segs;
      const P = (r, t) => [cx + Math.cos(t) * r, y, cz - Math.sin(t) * r];
      b.quadN(
        mat,
        P(r0, t0),
        P(r1, t0),
        P(r1, t1),
        P(r0, t1),
        [0, up ? 1 : -1, 0],
        { tint: o.tint, grime: o.grime },
      );
    }
    return b;
  };

  /**
   * Vertical wall face from A to B (floor-plan points), y0 up h, whose normal points to (nx, nz).
   * Textured along the wall (u = metres from the western/northern end so neighbouring runs line up).
   */
  K.fwall = function (b, mat, ax, az, bx, bz, y0, h, nx, nz, o) {
    o = o || {};
    let ux = bx - ax,
      uz = bz - az;
    const len = Math.hypot(ux, uz);
    if (len < 1e-3 || h <= 0) return b;
    ux /= len;
    uz /= len;
    // normal of (U × Y) = (-uz, 0, ux)
    if (-uz * nx + ux * nz < 0) {
      const tx = ax,
        tz = az;
      ax = bx;
      az = bz;
      bx = tx;
      bz = tz;
      ux = -ux;
      uz = -uz;
    }
    b.face(
      mat,
      ax,
      y0,
      az,
      ux,
      0,
      uz,
      0,
      1,
      0,
      len,
      h,
      Object.assign(
        {
          uo:
            o.uo !== undefined
              ? o.uo
              : Math.abs(ux) > 0.5
                ? ax * Math.sign(ux)
                : az * Math.sign(uz),
        },
        o,
      ),
    );
    return b;
  };

  /** Triangle with forced normal n (degenerate quad → one visible triangle). */
  K.tri = function (b, mat, p0, p1, p2, n, o) {
    return b.quadN(mat, p0, p1, p2, p2, n, o);
  };

  /**
   * Greek pediment on a façade line z = fz, from x0 to x1, base at y, apex height h, facing nz (±1).
   * o: {mat, tint, corniceMat, depth (roof depth behind, for the raking soffit), recess}
   */
  K.gable = function (b, x0, x1, fz, y, h, nz, o) {
    o = o || {};
    const mat = o.mat || "limestone",
      cm = o.corniceMat || mat,
      tint = o.tint;
    const xm = (x0 + x1) / 2,
      rec = o.recess !== undefined ? o.recess : 0.45;
    // tympanum (set back)
    K.tri(
      b,
      mat,
      [x0 + 0.3, y, fz - nz * rec],
      [x1 - 0.3, y, fz - nz * rec],
      [xm, y + h - 0.05, fz - nz * rec],
      [0, 0, nz],
      { tint: tint ? tint.map((v) => v * 0.93) : [0.86, 0.84, 0.78] },
    );
    // horizontal cornice (the pediment floor)
    b.boxMM(cm, x0, y - 0.1, fz - nz * rec, x1, y + 0.3, fz + nz * 0.25, {
      tint,
      faces: "nsewtb",
    });
    // raking cornices
    const slope = Math.atan2(h, xm - x0);
    const L = Math.hypot(xm - x0, h);
    for (const s of [-1, 1]) {
      const ax = s < 0 ? x0 - 0.2 : x1 + 0.2,
        bx = xm;
      b.beam(
        cm,
        ax,
        y + 0.15,
        fz - (nz * (rec - 0.35)) / 2,
        bx,
        y + h + 0.15,
        fz - (nz * (rec - 0.35)) / 2,
        rec + 0.35,
        0.8,
        { tint },
      );
    }
    void slope;
    void L;
  };

  // ------------------------------------------------------------------
  // Dressing
  // ------------------------------------------------------------------
  K.chandelier = function (b, x, y, z, ceil, o) {
    o = o || {};
    const col = K.tint(o.color || [1, 0.82, 0.55]),
      R = o.r || 0.9;
    b.pipe("brass", x, y + 0.3, z, x, ceil, z, 0.02, 4);
    b.cyl("brass", x, y - 0.05, z, 0.12, 0.2, 0.35, 8, { bottom: true });
    b.cyl("brass", x, y + 0.05, z, R, R, 0.04, 16, { top: true });
    const n = o.arms || 8;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * PI * 2,
        px = x + Math.cos(a) * R,
        pz = z - Math.sin(a) * R;
      b.pipe("brass", x, y + 0.02, z, px, y + 0.1, pz, 0.012, 3);
      b.cyl("brass", px, y + 0.1, pz, 0.05, 0.04, 0.06, 6);
      if (!o.dead) {
        b.geo("lamp", K.sphereGeo(), {
          x: px,
          y: y + 0.2,
          z: pz,
          s: 0.04,
          tint: col,
        });
        b.glow(
          px,
          y + 0.2,
          pz,
          col.map((v) => v * 0.5),
          0.5,
        );
      }
      // crystal drops
      for (let d = 0; d < 3; d++)
        b.geo("crystal", K.sphereGeo(), {
          x: x + Math.cos(a + 0.2) * R * (0.4 + d * 0.3),
          y: y - 0.12 - d * 0.06,
          z: z - Math.sin(a + 0.2) * R * (0.4 + d * 0.3),
          sx: 0.02,
          sy: 0.05,
          sz: 0.02,
          tint: o.dead ? [0.35, 0.35, 0.38] : [0.55, 0.5, 0.42],
        });
    }
    for (let k = 0; k < 8; k++)
      b.geo("crystal", K.sphereGeo(), {
        x,
        y: y - 0.3 - k * 0.07,
        z,
        sx: 0.035,
        sy: 0.04,
        sz: 0.035,
        tint: o.dead ? [0.35, 0.35, 0.38] : [0.6, 0.55, 0.45],
      });
    if (!o.dead) {
      b.light(
        x,
        y - 0.2,
        z,
        col,
        o.intensity || 1.2,
        o.radius || 9,
        o.lightOpts,
      );
      b.glow(
        x,
        y,
        z,
        col.map((v) => v * 0.6),
        o.glowSize || 2.2,
      );
    }
  };

  /** Silver cloche on a plate (dining). */
  /** Ruined Manhattan skyline panorama (for window plates in high rooms). variant = seed. */
  K.skyline = function (variant, w, h) {
    w = w || 512;
    h = h || 256;
    return K.paint(
      "pics",
      "ph2_skyline_" + variant,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("sky" + variant);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#8e9a78");
        g.addColorStop(0.55, "#c4b98c");
        g.addColorStop(0.8, "#a89a70");
        g.addColorStop(1, "#5a5444");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        // sun haze
        const sg = x.createRadialGradient(
          X + W * 0.7,
          Y + H * 0.35,
          0,
          X + W * 0.7,
          Y + H * 0.35,
          H * 0.5,
        );
        sg.addColorStop(0, "rgba(255,240,190,0.55)");
        sg.addColorStop(1, "rgba(255,240,190,0)");
        x.fillStyle = sg;
        x.fillRect(X, Y, W, H);
        // three layers of towers, far → near (darker, taller, more broken)
        for (let layer = 0; layer < 3; layer++) {
          const base = Y + H * (0.62 + layer * 0.12),
            shade = 150 - layer * 45;
          let px = X - 10;
          while (px < X + W) {
            const bw = 10 + r() * (18 + layer * 10),
              bh = H * (0.12 + r() * (0.3 + layer * 0.12));
            x.fillStyle =
              "rgb(" +
              ((shade * 0.85) | 0) +
              "," +
              ((shade * 0.88) | 0) +
              "," +
              ((shade * 0.78) | 0) +
              ")";
            x.beginPath();
            x.moveTo(px, base);
            x.lineTo(px, base - bh);
            if (r() < 0.35) {
              const k = r() * bw;
              x.lineTo(px + k, base - bh - r() * 12);
              x.lineTo(px + k + 3, base - bh + r() * 20);
            } // broken top
            else if (r() < 0.2) {
              x.lineTo(px + bw / 2, base - bh - bh * 0.25);
            } // spire
            x.lineTo(px + bw, base - bh);
            x.lineTo(px + bw, base);
            x.fill();
            if (layer === 2) {
              x.fillStyle = "rgba(20,20,15,0.5)";
              for (let k = 0; k < 6; k++)
                x.fillRect(
                  px + 2 + r() * (bw - 4),
                  base - bh + 4 + r() * (bh - 8),
                  2,
                  3,
                );
            }
            px += bw + r() * 4;
          }
        }
        // dust & smoke columns
        for (let k = 0; k < 3; k++) {
          const sx = X + r() * W;
          const sg2 = x.createLinearGradient(sx, Y + H * 0.2, sx, Y + H * 0.7);
          sg2.addColorStop(0, "rgba(70,65,55,0)");
          sg2.addColorStop(1, "rgba(70,65,55,0.35)");
          x.fillStyle = sg2;
          x.fillRect(sx - 12, Y + H * 0.2, 24, H * 0.5);
        }
        K.grain(x, X, Y, W, H, 25, 700 + variant);
      },
    );
  };

  /** Tattered flag / banner with alpha holes. kind: 'us' | 'us_upside' | 'raider' */
  K.flagCell = function (kind, w, h) {
    w = w || 256;
    h = h || 160;
    return K.paint("art", "ph2_flag_" + kind, w, h, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      x.save();
      if (kind === "us_upside") {
        x.translate(X + W / 2, Y + H / 2);
        x.rotate(PI);
        x.translate(-(X + W / 2), -(Y + H / 2));
      }
      if (kind === "raider") {
        x.fillStyle = "#6e1e16";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#e8dcc0";
        x.font =
          "bold " + Math.round(H * 0.2) + "px Impact, Arial Black, sans-serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("THE CONGRESS", X + W / 2, Y + H * 0.18, W * 0.9);
        // skull with a tricorn hat
        const cx = X + W / 2,
          cy = Y + H * 0.58;
        x.beginPath();
        x.arc(cx, cy, H * 0.17, 0, PI * 2);
        x.fill();
        x.fillRect(cx - H * 0.09, cy + H * 0.1, H * 0.18, H * 0.12);
        x.fillStyle = "#6e1e16";
        x.beginPath();
        x.arc(cx - H * 0.065, cy, H * 0.045, 0, PI * 2);
        x.arc(cx + H * 0.065, cy, H * 0.045, 0, PI * 2);
        x.fill();
        x.fillStyle = "#1a1410";
        x.beginPath();
        x.moveTo(cx - H * 0.28, cy - H * 0.1);
        x.lineTo(cx, cy - H * 0.32);
        x.lineTo(cx + H * 0.28, cy - H * 0.1);
        x.closePath();
        x.fill();
        x.fillStyle = "#e8dcc0";
        x.font =
          "bold " + Math.round(H * 0.11) + "px Impact, Arial Black, sans-serif";
        x.fillText("IN SESSION", X + W / 2, Y + H * 0.9, W * 0.8);
      } else {
        const sh = H / 13;
        for (let i = 0; i < 13; i++) {
          x.fillStyle = i % 2 ? "#e4dccb" : "#8e2a22";
          x.fillRect(X, Y + i * sh, W, sh + 0.5);
        }
        x.fillStyle = "#23305a";
        x.fillRect(X, Y, W * 0.4, sh * 7);
        x.fillStyle = "#e4dccb";
        for (let j = 0; j < 9; j++)
          for (let i = 0; i < (j % 2 ? 5 : 6); i++) {
            x.beginPath();
            x.arc(
              X + W * 0.4 * ((i + (j % 2 ? 1 : 0.5)) / 6.2),
              Y + sh * 7 * ((j + 0.7) / 9.6),
              1.8,
              0,
              PI * 2,
            );
            x.fill();
          }
      }
      x.restore();
      // grime + burn holes + frayed fly end
      K.stains(x, X, Y, W, H, 10, 7 + kind.length, 0.5, [40, 30, 20]);
      const r = K.rng("flag" + kind);
      x.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 9; k++) {
        x.beginPath();
        x.arc(X + W * (0.2 + r() * 0.8), Y + r() * H, 3 + r() * 12, 0, PI * 2);
        x.fill();
      }
      for (let k = 0; k < 14; k++) {
        const yy = Y + r() * H;
        x.beginPath();
        x.moveTo(X + W, yy);
        x.lineTo(X + W - 10 - r() * 40, yy + 4);
        x.lineTo(X + W, yy + 10);
        x.fill();
      }
      x.globalCompositeOperation = "source-over";
    });
  };

  /** Round floor medallion (compass star / eagle seal) with alpha. */
  // ------------------------------------------------------------------
  // Level-flow & set-dressing helpers (revision 2)
  // ------------------------------------------------------------------
  /**
   * One-way shortcut (the classic "barred from the other side" door). o: {flag, radius,
   *   open:{pos (world), label, verb, target{x,y,z,yaw}, msg}  — the side that unbars it (deep in the level)
   *   barred:{pos, label, verb, target}                        — the side near the entrance (locked until flag)}
   */
  K.oneWay = function (ctx, o) {
    const go = (t, label) =>
      K.safe("oneway", () => {
        K.sfx(o.sound || "door_open", null);
        G.fadeTransition(() => {
          G.player.teleport(t.x, t.y, t.z, t.yaw || 0);
          G.events.emit("doorTransition", { id: o.flag, label, target: t });
        });
      });
    ctx.interactables.push(
      G.world.addInteractable({
        pos: o.open.pos,
        radius: o.radius || 1.1,
        label: o.open.label,
        verb: o.open.verb || "Open",
        priority: 1,
        onInteract: () => {
          if (!PV.flag(o.flag)) {
            PV.setFlag(o.flag, true);
            if (o.open.msg) K.notify(o.open.msg);
          }
          go(o.open.target, o.open.label);
        },
      }),
    );
    ctx.interactables.push(
      G.world.addInteractable({
        pos: o.barred.pos,
        radius: o.radius || 1.1,
        label: o.barred.label,
        verb: o.barred.verb || "Open",
        priority: 1,
        locked: () => (PV.flag(o.flag) ? null : "Barred from the other side"),
        onInteract: () => {
          if (!PV.flag(o.flag)) {
            K.sfx("door_locked", null);
            K.notify(o.barred.msg || "It is barred from the other side.");
            return;
          }
          go(o.barred.target, o.barred.label);
        },
      }),
    );
  };

  /**
   * Vertical ring collar (steel frame round an arched opening): RingGeometry r0..r1 in a wall plane.
   * (x,y,z) centre, facing (nx,nz) — one of the axes.
   */
  K.ringCollar = function (b, mat, x, y, z, nx, nz, r0, r1, o) {
    o = o || {};
    const ry = Math.atan2(nx, nz);
    b.geo(mat, new THREE.RingGeometry(r0, r1, o.seg || 32, 1), {
      x,
      y,
      z,
      ry,
      tint: o.tint,
      grime: o.grime,
    });
    // bolt heads on the collar
    if (o.bolts)
      for (let k = 0; k < o.bolts; k++) {
        const a = (k / o.bolts) * PI * 2,
          rr = (r0 + r1) / 2,
          ux = nz,
          uz = -nx;
        b.geo(mat, K.sphereGeo(), {
          x: x + ux * Math.cos(a) * rr + nx * 0.02,
          y: y + Math.sin(a) * rr,
          z: z + uz * Math.cos(a) * rr + nz * 0.02,
          s: 0.05,
          tint: o.tint,
        });
      }
  };

  /**
   * Room set-dressing: dense ruin-style clutter scattered over a floor rect (merged geometry, no colliders
   * except the few big pieces, which stay low). o: {n, seed, kinds[], avoid:[[x0,z0,x1,z1]…], office, tint}
   *   kinds: 'chair' fallen chairs · 'paper' paper drifts · 'box' file boxes · 'panel' fallen ceiling tiles ·
   *          'debris' plaster piles · 'glass' broken glass · 'can' cans & bottles · 'books' book heaps
   */
  K.clutter = function (b, x0, z0, x1, z1, y, o) {
    o = o || {};
    const r = K.rng(o.seed || (x0 * 13 + z0 * 7) | 0);
    const kinds = o.kinds || [
      "chair",
      "paper",
      "box",
      "panel",
      "debris",
      "glass",
      "can",
    ];
    const avoid = o.avoid || [];
    const free = (x, z, pad) => {
      for (const a of avoid)
        if (
          x > a[0] - pad &&
          x < a[2] + pad &&
          z > a[1] - pad &&
          z < a[3] + pad
        )
          return false;
      return true;
    };
    const n = o.n || 20;
    for (let i = 0; i < n; i++) {
      const k = kinds[i % kinds.length];
      const x = x0 + 0.4 + r() * (x1 - x0 - 0.8),
        z = z0 + 0.4 + r() * (z1 - z0 - 0.8),
        yaw = r() * PI * 2;
      if (!free(x, z, 0.6)) continue;
      if (k === "chair")
        K.chair(b, x, y, z, yaw, {
          fallen: true,
          mat: o.chairMat || "wood_dark",
          tint: [0.5, 0.36, 0.24],
        });
      else if (k === "paper") {
        b.hplate(
          "decal",
          x,
          y + 0.011 + r() * 0.002,
          z,
          1.2 + r(),
          1 + r() * 0.6,
          yaw,
          K.decal("grime", 200 + (i % 6)),
        );
        for (let q = 0; q < 7; q++)
          b.box(
            "flat",
            x + (r() - 0.5) * 1.3,
            y + 0.004 + q * 0.0015,
            z + (r() - 0.5) * 1.1,
            0.21,
            0.002,
            0.29,
            {
              yaw: r() * 6,
              tint: r.pick([
                [0.86, 0.84, 0.76],
                [0.78, 0.76, 0.66],
                [0.9, 0.88, 0.82],
              ]),
            },
          );
      } else if (k === "box") {
        const h = 0.28,
          c = r.pick([
            [0.62, 0.5, 0.34],
            [0.55, 0.45, 0.3],
          ]);
        b.box("wood", x, y, z, 0.38, h, 0.3, { yaw, tint: c, faces: "nsewt" });
        if (r() < 0.6)
          b.box("wood", x + 0.08, y + h, z - 0.04, 0.38, h, 0.3, {
            yaw: yaw + (r() - 0.5) * 0.5,
            tint: c.map((v) => v * 0.92),
            faces: "nsewt",
          });
        for (let q = 0; q < 3; q++)
          b.box(
            "flat",
            x + (r() - 0.5) * 0.9,
            y + 0.004,
            z + (r() - 0.5) * 0.9,
            0.22,
            0.003,
            0.3,
            { yaw: r() * 6, tint: [0.84, 0.82, 0.74] },
          );
      } else if (k === "panel") {
        // a fallen acoustic/plaster ceiling panel, one edge propped on debris, + the dust it brought down
        const L = 1.2,
          W = 0.6,
          c = Math.cos(yaw),
          s = Math.sin(yaw),
          h = 0.12 + r() * 0.25,
          pt = o.panelTint || [0.72, 0.7, 0.64];
        const P = (u, v, yy) => [x + u * c + v * s, y + yy, z - u * s + v * c];
        b.quadN(
          o.panelMat || "plaster",
          P(-L / 2, -W / 2, 0.02),
          P(L / 2, -W / 2, h),
          P(L / 2, W / 2, h),
          P(-L / 2, W / 2, 0.02),
          [-(h / L) * c, 1, (h / L) * s],
          { tint: pt },
        );
        b.hplate(
          "decal",
          x,
          y + 0.012,
          z,
          1.6,
          1.4,
          yaw,
          K.decal("grime", 210 + (i % 4)),
        );
        b.box(
          "concrete",
          x + (L / 2 - 0.1) * c,
          y,
          z - (L / 2 - 0.1) * s,
          0.25,
          h,
          0.3,
          { yaw, tint: [0.62, 0.6, 0.56] },
        );
      } else if (k === "debris") {
        K.rubble(b, x, y, z, 0.45 + r() * 0.4, 0.25 + r() * 0.2, {
          seed: 300 + i,
          col: false,
          n: 5,
          tint: o.debrisTint || [0.78, 0.76, 0.72],
        });
      } else if (k === "glass") {
        for (let q = 0; q < 6; q++) {
          const gx = x + (r() - 0.5) * 1.2,
            gz = z + (r() - 0.5) * 1.2,
            gs = 0.08 + r() * 0.16;
          b.quadN(
            "glass",
            [gx, y + 0.006, gz],
            [gx + gs, y + 0.006, gz + r() * 0.05],
            [gx + gs * 0.6, y + 0.006, gz + gs],
            [gx, y + 0.006, gz + gs * 0.5],
            [0, 1, 0],
            { tint: [0.55, 0.62, 0.62] },
          );
        }
      } else if (k === "can") {
        for (let q = 0; q < 4; q++) {
          const cx = x + (r() - 0.5) * 0.9,
            cz = z + (r() - 0.5) * 0.9;
          if (r() < 0.5)
            b.cyl("rust", cx, y, cz, 0.035, 0.035, 0.12, 6, {
              tint: [0.7, 0.55, 0.4],
            });
          else
            b.geo("glass", K.unitCyl(6), {
              x: cx,
              y: y + 0.035,
              z: cz,
              rz: PI / 2,
              ry: r() * 6,
              sx: 0.035,
              sy: 0.24,
              sz: 0.035,
              tint: r.pick([
                [0.35, 0.5, 0.3],
                [0.5, 0.35, 0.18],
              ]),
            });
        }
      } else if (k === "books") {
        for (let q = 0; q < 6; q++)
          b.box(
            "leather",
            x + (r() - 0.5) * 0.6,
            y + (q > 3 ? 0.04 : 0),
            z + (r() - 0.5) * 0.6,
            0.16,
            0.04,
            0.24,
            {
              yaw: r() * 6,
              tint: r.pick([
                [0.45, 0.18, 0.12],
                [0.2, 0.28, 0.35],
                [0.3, 0.35, 0.2],
                [0.5, 0.42, 0.3],
              ]),
            },
          );
      }
    }
  };
})();
