/* src/map/31_parkpieces.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 31 CENTRAL PARK SET PIECES
 * Round 1 (fan-out): the park was lawns, dead trees and rocks between the
 * landmarks. Five set pieces give it Central Park's real landmarks and a
 * story of the '67 War to find on a walk through the park:
 *   - a crashed Rotorcraft nosed into the Ramble's rocky knolls (twin-rotor
 *     tandem troop carrier: long hull, bent blades on both rotor pylons,
 *     torn-out gearbox, trench & scorch, the pilot's bones)
 *   - Cleopatra's Needle behind the Met (granite obelisk with weathered
 *     hieroglyph columns, bronze crabs, stepped base, broken iron fence)
 *   - the Naumburg Bandshell at the head of the Mall (limestone half-dome
 *     with coffers, a bite blown out of it, stage, rotten benches, a piano)
 *   - the Carousel (brick octagon with arched bays, sagging roof with a
 *     hole, the carousel platform tilted, peeling horses on bent poles)
 *   - a playground at the south-west corner (rusted swings, slide, jungle
 *     gym dome, merry-go-round, seesaw, sandbox, low fence)
 * Everything is static, batched into the chunk buffers like the rest of
 * the park; footprints are flattened in the park heightfield (30_park.js
 * reads M.PARK_PIECES) and kept clear of trees / rocks / tufts (parkExcl).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  // footprints (world rects) — flattened to y = 0 and kept free of park scatter
  const PIECES = {
    rotorcraft: { x: -70, z: -675, x0: -83, x1: -57, z0: -688, z1: -661 },
    needle: { x: 74, z: -731, x0: 67, x1: 81, z0: -738, z1: -724 },
    bandshell: { x: 33, z: -520, x0: 22, x1: 43, z0: -532, z1: -508 },
    carousel: { x: -36, z: -444, x0: -47, x1: -25, z0: -455, z1: -433 },
    playground: { x: -93, z: -437, x0: -104, x1: -82, z0: -445, z1: -429 },
  };
  M.PARK_PIECES = PIECES;
  for (const k in PIECES) {
    const p = PIECES[k];
    M.parkExcl.push({
      x0: p.x0 - 1.5,
      x1: p.x1 + 1.5,
      z0: p.z0 - 1.5,
      z1: p.z1 + 1.5,
    });
  }

  const W = [1, 1, 1];
  const v3n = (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };

  /**
   * Loft along local +z through superellipse sections {z, w, h, y, e} (e = squareness 2..6).
   * Emitted under the current transform. o: {seg, c (colour fn (t, ring angle) or array), s}
   */
  function loft(b, secs, o) {
    o = o || {};
    const seg = o.seg || 12,
      s = o.s || 2;
    const ring = (S, a) => {
      const ca = Math.cos(a),
        sa = Math.sin(a),
        e = 2 / (S.e || 3);
      const x = (Math.sign(ca) * Math.pow(Math.abs(ca), e) * S.w) / 2,
        y = (Math.sign(sa) * Math.pow(Math.abs(sa), e) * S.h) / 2;
      return [x, (S.y || 0) + y, S.z];
    };
    b.reserve(secs.length * (seg + 1), (secs.length - 1) * seg * 6);
    const base = b.vn;
    let vAcc = 0;
    for (let i = 0; i < secs.length; i++) {
      if (i > 0) vAcc += Math.abs(secs[i].z - secs[i - 1].z);
      for (let k = 0; k <= seg; k++) {
        const a = (k / seg) * Math.PI * 2;
        const p = ring(secs[i], a);
        // normal from neighbouring ring points (around) and the section slope (along)
        const pa = ring(secs[i], a + 0.01),
          pb = ring(secs[i], a - 0.01);
        const tx = pa[0] - pb[0],
          ty = pa[1] - pb[1];
        let n = v3n([ty, -tx, 0]);
        const j = Math.min(secs.length - 1, i + 1),
          jm = Math.max(0, i - 1);
        const q1 = ring(secs[j], a),
          q0 = ring(secs[jm], a),
          dz = q1[2] - q0[2] || 1;
        const dr = ((q1[0] - q0[0]) * n[0] + (q1[1] - q0[1]) * n[1]) / dz;
        n = v3n([n[0], n[1], -dr]);
        const c =
          typeof o.c === "function" ? o.c(i / (secs.length - 1), a) : o.c || W;
        b.v(
          p[0],
          p[1],
          p[2],
          n[0],
          n[1],
          n[2],
          (k / seg) * 4,
          vAcc / s,
          c[0],
          c[1],
          c[2],
        );
      }
    }
    for (let i = 0; i < secs.length - 1; i++)
      for (let k = 0; k < seg; k++) {
        const a = base + i * (seg + 1) + k,
          a1 = a + 1,
          c = a + seg + 1,
          c1 = c + 1;
        // rings run CCW seen from -z; outward winding
        b.tri(a, c1, a1);
        b.tri(a, c, c1);
      }
  }
  /** Flat cap of a loft section (facing dir = ±1 along z). */
  function loftCap(b, S, dir, c, seg) {
    seg = seg || 12;
    const e = 2 / (S.e || 3);
    b.reserve(seg + 2, seg * 3);
    const ctr = b.v(0, S.y || 0, S.z, 0, 0, dir, 0.5, 0.5, c[0], c[1], c[2]);
    for (let k = 0; k <= seg; k++) {
      const a = (k / seg) * Math.PI * 2,
        ca = Math.cos(a),
        sa = Math.sin(a);
      b.v(
        (Math.sign(ca) * Math.pow(Math.abs(ca), e) * S.w) / 2,
        (S.y || 0) + (Math.sign(sa) * Math.pow(Math.abs(sa), e) * S.h) / 2,
        S.z,
        0,
        0,
        dir,
        0.5 + ca * 0.5,
        0.5 + sa * 0.5,
        c[0],
        c[1],
        c[2],
      );
    }
    for (let k = 0; k < seg; k++) {
      if (dir > 0) b.tri(ctr, ctr + 1 + k, ctr + 2 + k);
      else b.tri(ctr, ctr + 2 + k, ctr + 1 + k);
    }
  }

  // -------------------------------------------------------------------
  // 1. Crashed Rotorcraft (the Ramble): a twin-rotor tandem troop carrier
  // -------------------------------------------------------------------
  function buildRotorcraft() {
    const P = PIECES.rotorcraft,
      r = M.rng("rotorcraft");
    const x = P.x,
      z = P.z;
    const yaw = 0.62,
      pitch = -0.11,
      roll = 0.38; // nose down into the knoll, rolled onto its port side
    const VS = 1.4; // model units → metres (a tandem-rotor troop carrier is long)
    const hull = M.buf("metal_painted", x, z, "main"),
      det = M.buf("metal_painted", x, z, "detail");
    const rust = M.buf("rust", x, z, "main"),
      glass = M.buf("glass_dirty", x, z, "main");
    const blades = M.buf("metal_painted", x, z, "detail");
    const OL = [0.5, 0.52, 0.45],
      OLD = [0.26, 0.27, 0.24],
      BL = [0.3, 0.3, 0.28]; // military olive-grey, soot at the burn, blade grey
    const hc = (t, a) => {
      const burn =
        M.smooth(0.55, 0.9, t) * 0.5 + (Math.sin(a) < -0.3 ? 0.18 : 0);
      return M.mixc(
        M.mulc(OL, 0.85 + 0.2 * M.hash(t * 40, a * 9, 3)),
        OLD,
        burn,
      );
    };
    M.pushXF(M.mtx(x, 1.05 * VS, z, yaw, pitch, roll, VS));
    // fuselage: rounded glazed nose → one long slab-sided cabin → tail swept up under the aft rotor pylon
    const secs = [
      { z: -6.4, w: 1.0, h: 1.0, y: -0.2, e: 2.4 },
      { z: -5.8, w: 2.0, h: 1.9, y: -0.1, e: 2.8 },
      { z: -4.9, w: 2.6, h: 2.5, y: 0.05, e: 3.6 },
      { z: -3.8, w: 2.8, h: 2.7, y: 0.1, e: 5 },
      { z: 3.6, w: 2.8, h: 2.7, y: 0.1, e: 5 },
      { z: 5.2, w: 2.6, h: 2.2, y: 0.45, e: 4.4 },
      { z: 6.4, w: 2.2, h: 1.5, y: 0.85, e: 3.6 },
    ];
    loft(hull, secs, { seg: 14, c: hc });
    loftCap(hull, secs[0], -1, M.mulc(OL, 0.7), 14);
    loftCap(rust, secs[secs.length - 1], 1, [0.4, 0.3, 0.24], 14); // the open tail where the ramp tore away
    // cockpit glazing: dark panes wrapped round the nose
    for (const sd of [-1, 1]) {
      M.quad(
        glass,
        [sd * 0.98, 0.0, -5.7],
        [sd * 1.3, 0.1, -4.8],
        [sd * 1.2, 0.95, -4.8],
        [sd * 0.85, 0.75, -5.7],
        [sd, 0.4, -0.5],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.18, 0.2, 0.2],
      );
    }
    M.quad(
      glass,
      [-0.85, 0.75, -5.7],
      [0.85, 0.75, -5.7],
      [0.95, 1.15, -4.8],
      [-0.95, 1.15, -4.8],
      [0, 0.8, -0.6],
      [0, 0, 1, 0, 1, 1, 0, 1],
      [0.12, 0.14, 0.14],
    );
    // a row of small cabin windows down both flanks
    for (const sd of [-1, 1])
      for (let zz = -2.6; zz < 3.2; zz += 1.15) {
        M.quad(
          glass,
          [sd * 1.43, 0.35, zz],
          [sd * 1.43, 0.35, zz + 0.5],
          [sd * 1.43, 0.85, zz + 0.5],
          [sd * 1.43, 0.85, zz],
          [sd, 0, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.14, 0.16, 0.16],
        );
      }
    // open crew door (forward, starboard): dark hole + the slid-back door panel
    M.quad(
      M.buf("rubber", x, z, "main"),
      [1.44, -0.8, -3.6],
      [1.44, -0.8, -2.4],
      [1.44, 0.95, -2.4],
      [1.44, 0.95, -3.6],
      [1, 0, 0],
      [0, 0, 1, 0, 1, 1, 0, 1],
      [0.35, 0.35, 0.35],
    );
    M.box(det, 1.46, -0.85, -2.5, 1.58, 1.0, -1.3, {
      s: 1,
      c: M.mulc(OL, 0.9),
      skip: 0,
    });
    // riveted frame bands over the cabin roof
    for (const zz of [-3.4, -1.2, 1.0, 3.2])
      M.beam(det, -1.42, 1.42, zz, 1.42, 1.42, zz, 0.06, 0.04, { c: OLD });
    // long fuel sponsons along the lower flanks (the port one crushed flat into the ground)
    M.box(hull, 1.3, -1.1, -1.6, 1.9, -0.35, 3.4, {
      s: 2,
      c: M.mulc(OL, 0.88),
      skip: 0,
    });
    M.box(rust, -1.75, -1.15, -1.2, -1.3, -0.75, 3.0, {
      s: 1,
      c: [0.45, 0.36, 0.3],
      skip: 0,
    });
    // forward rotor: a low pylon over the cockpit, hub, one blade bent down over the flank, two snapped stubs
    M.box(hull, -0.5, 1.3, -5.0, 0.5, 1.95, -3.6, {
      s: 1,
      c: M.mulc(OL, 0.85),
      skip: 0,
    });
    M.cyl(rust, 0, 1.95, -4.4, 0.32, 0.26, 0.55, 10, {
      c: [0.45, 0.38, 0.32],
      capTop: true,
    });
    M.beam(blades, 0, 2.45, -4.4, 2.6, 2.35, -5.3, 0.34, 0.06, {
      c: BL,
      skip: 0,
    });
    M.beam(blades, 2.6, 2.35, -5.3, 4.6, 0.7, -6.1, 0.34, 0.06, {
      c: BL,
      skip: 0,
    }); // bent down past the nose
    M.beam(blades, 0, 2.45, -4.4, -1.5, 2.6, -3.3, 0.34, 0.06, {
      c: BL,
      skip: 0,
    });
    M.beam(blades, 0, 2.45, -4.4, -0.5, 2.5, -6.1, 0.34, 0.06, {
      c: BL,
      skip: 0,
    });
    // aft rotor: the tall pylon over the tail, hub, two drooping blades, one snapped
    M.box(hull, -0.75, 1.2, 3.4, 0.75, 3.0, 6.2, {
      s: 2,
      c: M.mulc(OL, 0.9),
      skip: 0,
    });
    M.box(det, -0.6, 3.0, 4.0, 0.6, 3.25, 5.9, { s: 1, c: OLD, skip: 0 });
    M.cyl(rust, 0, 3.25, 5.2, 0.32, 0.26, 0.55, 10, {
      c: [0.45, 0.38, 0.32],
      capTop: true,
    });
    M.beam(blades, 0, 3.75, 5.2, -2.8, 3.5, 6.3, 0.34, 0.06, {
      c: BL,
      skip: 0,
    });
    M.beam(blades, -2.8, 3.5, 6.3, -5.4, 1.3, 7.3, 0.34, 0.06, {
      c: BL,
      skip: 0,
    }); // drooped to the port side
    M.beam(blades, 0, 3.75, 5.2, 0.6, 3.4, 7.2, 0.34, 0.06, { c: BL, skip: 0 });
    M.beam(blades, 0.6, 3.4, 7.2, 1.0, 1.4, 8.0, 0.34, 0.06, {
      c: BL,
      skip: 0,
    }); // folded down over the tail
    M.beam(blades, 0, 3.75, 5.2, 2.2, 3.9, 4.3, 0.34, 0.06, { c: BL, skip: 0 }); // snapped stub
    // landing-gear struts (two pairs) with the tyres burst flat
    for (const sd of [-1, 1])
      for (const zz of [-3.2, 2.6]) {
        M.beam(rust, sd * 0.95, -1.15, zz, sd * 1.15, -1.55, zz, 0.12, 0.12, {
          c: [0.35, 0.33, 0.3],
        });
        M.box(
          M.buf("rubber", x, z, "main"),
          sd * 1.15 - 0.15,
          -1.75,
          zz - 0.4,
          sd * 1.15 + 0.15,
          -1.45,
          zz + 0.4,
          { s: 1, c: [0.3, 0.3, 0.3], skip: 0 },
        );
      }
    M.popXF();
    // ---- ground: gouged trench behind it, the torn-off rotor gearbox, scattered panels, scorch ----
    const ca = Math.cos(yaw),
      sa = Math.sin(yaw);
    const L = (lx, lz) => [
      x + (lx * ca + lz * sa) * VS,
      z + (-lx * sa + lz * ca) * VS,
    ];
    const mk = M.buf("my/markings", x, z, "fine");
    for (let i = 0; i < 5; i++) {
      const p = L(r.range(-1, 1), 8 + i * 3.2);
      M.decal(
        mk,
        p[0],
        0.06,
        p[1],
        3.2,
        3.6,
        yaw + r.range(-0.2, 0.2),
        M.MARK.DIRT,
        [0.8, 0.7, 0.6],
      );
    }
    for (let i = 0; i < 3; i++) {
      const p = L(r.range(-3, 3), r.range(-4, 4));
      M.decal(
        mk,
        p[0],
        0.07,
        p[1],
        r.range(4, 7),
        r.range(4, 7),
        r() * 6,
        M.MARK.SCORCH,
        [0.9, 0.9, 0.9],
      );
    }
    // a rotor gearbox housing torn out of a pylon, lying on its side
    const np = L(-6.5, 5.5);
    M.pushXF(M.mtx(np[0], 0.55, np[1], yaw + 1.2, Math.PI / 2 - 0.2, 0));
    M.cyl(
      M.buf("metal_painted", x, z, "main"),
      0,
      -1.3,
      0,
      0.6,
      0.45,
      2.6,
      10,
      { c: [0.3, 0.31, 0.28], capTop: true, capBot: true },
    );
    M.popXF();
    M.ocol(np[0], np[1], 3, 1.4, 0, 1.1, yaw + 1.2, {
      tag: "wreck",
      surface: "metal",
    });
    // a rotor blade stuck in the dirt, loose hull panels, a crate of spilled ammo cans
    const bp = L(4, -8);
    M.beam(
      M.buf("metal_painted", x, z, "detail"),
      bp[0],
      -0.3,
      bp[1],
      bp[0] + 1.2,
      3.4,
      bp[1] + 0.6,
      0.36,
      0.06,
      { c: BL, skip: 0 },
    );
    for (let i = 0; i < 9; i++) {
      const p = L(r.range(-7, 7), r.range(-7, 9));
      if (Math.abs(p[0] - x) < 2.5 && Math.abs(p[1] - z) < 5) continue;
      M.obox(
        M.buf("metal_painted", x, z, "detail"),
        p[0],
        0.05,
        p[1],
        r.range(0.5, 1.4),
        0.04,
        r.range(0.4, 1.1),
        r() * 6,
        {
          c: M.mulc(OL, r.range(0.6, 1)),
          s: 1,
          pitch: r.range(-0.2, 0.2),
          roll: r.range(-0.3, 0.3),
        },
      );
    }
    const cp = L(3.2, 3.5);
    M.obox(
      M.buf("metal_painted", x, z, "detail"),
      cp[0],
      0.25,
      cp[1],
      0.9,
      0.5,
      0.6,
      yaw + 0.3,
      { c: [0.3, 0.34, 0.24], s: 1 },
    );
    M.obox(
      M.buf("metal_painted", x, z, "detail"),
      cp[0] + 0.7,
      0.15,
      cp[1] + 0.4,
      0.4,
      0.3,
      0.25,
      yaw + 1.1,
      { c: [0.32, 0.36, 0.26], s: 1 },
    );
    // the pilot didn't make it far
    const sk = L(3.6, -1.8);
    if (M.skeleton) M.skeleton(sk[0], sk[1], yaw + 2.4, r, false);
    // colliders: forward cabin, aft cabin + tall rotor pylon
    const hp = L(0, -2.6),
      tp = L(0, 3.8);
    M.ocol(hp[0], hp[1], 3.0 * VS, 7.6 * VS, 0, 2.6 * VS, yaw, {
      tag: "wreck",
      surface: "metal",
    });
    M.ocol(tp[0], tp[1], 3.0 * VS, 5.2 * VS, 0, 3.6 * VS, yaw, {
      tag: "wreck",
      surface: "metal",
    });
  }

  // -------------------------------------------------------------------
  // 2. Cleopatra's Needle
  // -------------------------------------------------------------------
  M.defineAtlas("hieroglyphs", function () {
    const Wd = 256,
      H = 1024,
      cv = M.canvas(Wd, H),
      ctx = cv.getContext("2d");
    const r = M.rng("glyphs");
    // weathered rose granite
    const img = ctx.createImageData(Wd, H),
      d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = r(),
        sp = r() < 0.06 ? -40 : r() < 0.05 ? 30 : 0;
      d[i] = 150 + n * 34 + sp;
      d[i + 1] = 118 + n * 26 + sp;
      d[i + 2] = 108 + n * 22 + sp;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // rain streaks & soot, darker lower down
    for (let i = 0; i < 60; i++) {
      const x = r() * Wd,
        w = 2 + r() * 10;
      ctx.fillStyle = "rgba(40,30,28," + (0.05 + r() * 0.1).toFixed(2) + ")";
      ctx.fillRect(x, r() * H * 0.3, w, H);
    }
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(30,24,20,0.35)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, Wd, H);
    // one central column of glyphs (the real Needle: a single inscribed column per face), worn away at the bottom
    const glyph = (cx, cy, s, k, a) => {
      ctx.strokeStyle = "rgba(52,36,32," + a + ")";
      ctx.fillStyle = "rgba(52,36,32," + a + ")";
      ctx.lineWidth = s * 0.12;
      ctx.lineCap = "round";
      ctx.beginPath();
      if (k === 0) {
        ctx.ellipse(cx, cy, s * 0.42, s * 0.22, 0, 0, 7);
        ctx.moveTo(cx - s * 0.1, cy);
        ctx.arc(cx, cy, s * 0.1, 0, 7);
      } // eye
      else if (k === 1) {
        ctx.moveTo(cx - s * 0.4, cy + s * 0.3);
        ctx.quadraticCurveTo(
          cx - s * 0.1,
          cy - s * 0.5,
          cx + s * 0.35,
          cy - s * 0.1,
        );
        ctx.lineTo(cx + s * 0.4, cy + s * 0.35);
        ctx.moveTo(cx + s * 0.35, cy - s * 0.1);
        ctx.lineTo(cx + s * 0.45, cy - s * 0.3);
      } // bird
      else if (k === 2) {
        for (let j = 0; j < 4; j++) {
          ctx.moveTo(cx - s * 0.45 + j * s * 0.22, cy);
          ctx.lineTo(cx - s * 0.34 + j * s * 0.22, cy - s * 0.12);
          ctx.lineTo(cx - s * 0.23 + j * s * 0.22, cy);
        }
      } // water
      else if (k === 3) {
        ctx.arc(cx, cy - s * 0.2, s * 0.16, 0, 7);
        ctx.moveTo(cx, cy - s * 0.04);
        ctx.lineTo(cx, cy + s * 0.42);
        ctx.moveTo(cx - s * 0.25, cy + s * 0.08);
        ctx.lineTo(cx + s * 0.25, cy + s * 0.08);
      } // ankh
      else if (k === 4) {
        ctx.moveTo(cx - s * 0.1, cy - s * 0.45);
        ctx.lineTo(cx - s * 0.1, cy + s * 0.4);
        ctx.moveTo(cx - s * 0.1, cy - s * 0.45);
        ctx.quadraticCurveTo(
          cx + s * 0.3,
          cy - s * 0.4,
          cx + s * 0.1,
          cy - s * 0.15,
        );
      } // reed
      else if (k === 5) {
        ctx.rect(cx - s * 0.35, cy - s * 0.2, s * 0.7, s * 0.4);
      } // house / pool
      else if (k === 6) {
        ctx.moveTo(cx - s * 0.4, cy + s * 0.3);
        ctx.lineTo(cx, cy - s * 0.4);
        ctx.lineTo(cx + s * 0.4, cy + s * 0.3);
      } // pyramid
      else {
        ctx.arc(cx, cy, s * 0.3, Math.PI, 0);
        ctx.moveTo(cx - s * 0.3, cy);
        ctx.lineTo(cx + s * 0.3, cy);
      } // bread / sun
      ctx.stroke();
    };
    ctx.strokeStyle = "rgba(60,42,36,0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(78, 36, 100, H - 120);
    for (let y = 70; y < H - 100; y += 44) {
      const wear = M.clamp(1 - (y - H * 0.55) / (H * 0.4), 0.15, 1);
      if (r() < 0.12) continue;
      if (r() < 0.25) {
        glyph(108, y, 34, r.int(0, 7), (0.75 * wear).toFixed(2));
        glyph(148, y, 34, r.int(0, 7), (0.75 * wear).toFixed(2));
      } else glyph(128, y, 44, r.int(0, 7), (0.8 * wear).toFixed(2));
    }
    // cartouche near the top
    ctx.strokeStyle = "rgba(52,36,32,0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(128, 160, 34, 70, 0, 0, 7);
    ctx.stroke();
    // cracks, chips, a spray-painted Glowkeeper sun-disc scrawl low on one face
    for (let i = 0; i < 16; i++) {
      let x = r() * Wd,
        y = r() * H;
      ctx.strokeStyle = "rgba(30,20,18,0.6)";
      ctx.lineWidth = 1 + r() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += (r() - 0.5) * 20;
        y += 8 + r() * 16;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(128, H - 128);
    ctx.rotate(-0.08);
    ctx.strokeStyle = ctx.fillStyle = "rgba(214,138,38,0.6)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, 7);
    ctx.fill(); // the sun disc …
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30);
      ctx.lineTo(
        Math.cos(a) * (k % 2 ? 40 : 48),
        Math.sin(a) * (k % 2 ? 40 : 48),
      );
      ctx.stroke();
    }
    ctx.font = "bold 27px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("THE SUN SAW US", 0, 82, 236); // … and its gospel
    ctx.restore();
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, roughness: 0.9, bump: 0.6 };
  });
  function buildNeedle() {
    const P = PIECES.needle,
      x = P.x,
      z = P.z,
      r = M.rng("needle");
    const gr = M.buf("granite", x, z, "main");
    const GC = [0.72, 0.7, 0.68];
    // stepped granite base
    let y = 0;
    for (const [hw, h] of [
      [6, 0.4],
      [5, 0.4],
      [4, 0.45],
      [2.1, 1.7],
    ]) {
      M.box(gr, x - hw, y, z - hw, x + hw, y + h, z + hw, {
        s: 2,
        c: M.mulc(GC, 0.85 + 0.1 * r()),
        skip: 8,
      });
      y += h;
    }
    // bronze crabs under the four corners of the shaft (the Needle really stands on them)
    const br = M.buf("metal_painted", x, z, "detail");
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      M.obox(
        br,
        x + sx * 1.35,
        y + 0.18,
        z + sz * 1.35,
        0.9,
        0.36,
        0.7,
        Math.atan2(sx, sz),
        { c: [0.32, 0.5, 0.42], s: 1 },
      );
      for (let k = 0; k < 3; k++)
        M.beam(
          br,
          x + sx * 1.35,
          y + 0.2,
          z + sz * 1.35,
          x + sx * (1.8 + k * 0.1),
          y,
          z + sz * (1.1 + k * 0.25),
          0.07,
          0.07,
          { c: [0.3, 0.46, 0.4] },
        );
    }
    // the shaft: tapered square frustum with the glyph atlas on every face, pyramidion on top
    const y0 = y + 0.3,
      H = 13.5,
      bw = 1.25,
      tw = 0.8,
      py = 1.2;
    const gb = M.buf("my/hieroglyphs", x, z, "main");
    M.box(gr, x - 1.45, y, z - 1.45, x + 1.45, y0, z + 1.45, {
      s: 2,
      c: [0.5, 0.42, 0.4],
      skip: 8,
    });
    const lean = 0.012; // the smallest list after a century of New York frost
    const C = (sx, sz, top) => [
      x + sx * (top ? tw : bw) + (top ? lean * H : 0),
      top ? y0 + H : y0,
      z + sz * (top ? tw : bw),
    ];
    const faces = [
      [
        [-1, -1],
        [1, -1],
        [0, 0, -1],
      ],
      [
        [1, -1],
        [1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1],
        [-1, 1],
        [0, 0, 1],
      ],
      [
        [-1, 1],
        [-1, -1],
        [-1, 0, 0],
      ],
    ];
    for (const [a, b2, n] of faces) {
      const nn = v3n([n[0], (bw - tw) / H, n[2]]);
      M.quad(
        gb,
        C(a[0], a[1], false),
        C(b2[0], b2[1], false),
        C(b2[0], b2[1], true),
        C(a[0], a[1], true),
        nn,
        [1, 0, 0, 0, 0, 1, 1, 1],
        [0.95, 0.92, 0.9],
        [1.05, 1.02, 1],
      );
      const apex = [x + lean * H, y0 + H + py, z];
      const tA = C(a[0], a[1], true),
        tB = C(b2[0], b2[1], true);
      M.tri(
        gr,
        tA,
        tB,
        apex,
        v3n([n[0], 0.7, n[2]]),
        [0, 0, 1, 0, 0.5, 1],
        [0.66, 0.54, 0.5],
      );
    }
    // a slab spalled off one corner, lying at the foot
    M.obox(gr, x + 2.9, y - 1.2, z + 1.6, 1.3, 0.35, 0.8, 0.7, {
      c: [0.62, 0.5, 0.46],
      s: 1,
      roll: 0.3,
    });
    // low cast-iron fence ring round the plinth (bent & broken in places)
    const fb = M.buf("metal_painted", x, z, "detail");
    const R = 6.6,
      n = 32;
    for (let i = 0; i < n; i++) {
      if (i % 11 === 4 || i % 11 === 5) continue; // gaps
      const a0 = (i / n) * Math.PI * 2,
        a1 = ((i + 1) / n) * Math.PI * 2;
      const p0 = [x + Math.cos(a0) * R, z + Math.sin(a0) * R],
        p1 = [x + Math.cos(a1) * R, z + Math.sin(a1) * R];
      const bend = i % 7 === 2 ? 0.45 : 0;
      M.beam(fb, p0[0], 0.95 - bend, p0[1], p1[0], 0.95, p1[1], 0.04, 0.04, {
        c: [0.16, 0.16, 0.15],
      });
      M.vbar(
        fb,
        p0[0],
        p0[1],
        0,
        1.05 - bend,
        0.04,
        Math.cos(a0),
        Math.sin(a0),
        [0.16, 0.16, 0.15],
        true,
      );
    }
    // colliders
    M.box3(x - 6, 0, z - 6, x + 6, 0.4, z + 6, {
      tag: "monument",
      surface: "concrete",
    });
    M.box3(x - 5, 0.4, z - 5, x + 5, 0.8, z + 5, {
      tag: "monument",
      surface: "concrete",
    });
    M.box3(x - 4, 0.8, z - 4, x + 4, 1.25, z + 4, {
      tag: "monument",
      surface: "concrete",
    });
    M.box3(x - 2.1, 1.25, z - 2.1, x + 2.1, y0 + H, z + 2.1, {
      tag: "monument",
      walkable: false,
    });
    M.needle = { x, z, top: y0 + H + py };
  }

  // -------------------------------------------------------------------
  // 3. Naumburg Bandshell (head of the Mall, opening west onto the promenade)
  // -------------------------------------------------------------------
  function buildBandshell() {
    const P = PIECES.bandshell,
      x = P.x,
      z = P.z,
      r = M.rng("bandshell");
    const st = M.buf("stone_limestone", x, z, "main"),
      cn = M.buf("concrete", x, z, "main");
    const LC = [0.86, 0.83, 0.76];
    const SY = 1.3; // stage top
    const bx = x + 5.5; // back of the shell (dome centre plane at x = bx - R)
    // stage: stone plinth, rotten plank floor, steps down to the Mall on the west
    M.box(st, x - 3.5, 0, z - 8, x + 6.5, SY, z + 8, {
      s: 3,
      c: M.mulc(LC, 0.85),
      skip: 8,
    });
    const wb = M.buf("wood_rotten", x, z, "main");
    M.box(wb, x - 3.4, SY, z - 7.9, x + 6.4, SY + 0.05, z + 7.9, {
      s: 2,
      c: [0.62, 0.55, 0.45],
      skip: 8 + 1 + 2 + 16 + 32,
    });
    for (let i = 0; i < 4; i++)
      M.box(
        st,
        x - 3.5 - (i + 1) * 0.45,
        0,
        z - 4,
        x - 3.5 - i * 0.45,
        (SY * (4 - i)) / 4.5,
        z + 4,
        { s: 2, c: M.mulc(LC, 0.8), skip: 8 },
      );
    // the half-dome: quarter sphere opening west, radius R, thickness 0.5; a bite blown out of the upper north side
    const R = 6.2,
      T = 0.5,
      cx = bx - 0.3,
      cy = SY,
      cz = z;
    const NA = 12,
      NB = 8;
    const hole = (ia, ib) => ia >= 7 && ia <= 9 && ib >= 4 && ib <= 6;
    const dir = (ia, ib) => {
      const th = -Math.PI / 2 + (Math.PI * ia) / NA,
        ph = ((Math.PI / 2) * ib) / NB;
      return [
        Math.cos(ph) * Math.cos(th),
        Math.sin(ph),
        Math.cos(ph) * Math.sin(th),
      ];
    };
    for (let ia = 0; ia < NA; ia++)
      for (let ib = 0; ib < NB; ib++) {
        if (hole(ia, ib)) continue;
        const d00 = dir(ia, ib),
          d10 = dir(ia + 1, ib),
          d11 = dir(ia + 1, ib + 1),
          d01 = dir(ia, ib + 1);
        const Pt = (d, rr) => [cx + d[0] * rr, cy + d[1] * rr, cz + d[2] * rr];
        const dm = v3n([
          (d00[0] + d11[0]) / 2,
          (d00[1] + d11[1]) / 2,
          (d00[2] + d11[2]) / 2,
        ]);
        // coffers: every other cell recessed-dark on the inside, the ribs stay pale
        const coffer = (ia + ib) % 2 === 0;
        const ci = coffer ? M.mulc(LC, 0.62) : M.mulc(LC, 0.9 - ib * 0.02);
        M.quad(
          st,
          Pt(d00, R),
          Pt(d10, R),
          Pt(d11, R),
          Pt(d01, R),
          [-dm[0], -dm[1], -dm[2]],
          [
            ia / 3,
            ib / 3,
            (ia + 1) / 3,
            ib / 3,
            (ia + 1) / 3,
            (ib + 1) / 3,
            ia / 3,
            (ib + 1) / 3,
          ],
          ci,
        );
        M.quad(
          st,
          Pt(d00, R + T),
          Pt(d01, R + T),
          Pt(d11, R + T),
          Pt(d10, R + T),
          dm,
          [
            ia / 3,
            ib / 3,
            ia / 3,
            (ib + 1) / 3,
            (ia + 1) / 3,
            (ib + 1) / 3,
            (ia + 1) / 3,
            ib / 3,
          ],
          M.mulc(LC, 0.8 + 0.08 * r()),
        );
        // broken edges round the bite
        const edge = [
          [ia - 1, ib],
          [ia + 1, ib],
          [ia, ib - 1],
          [ia, ib + 1],
        ].some(([a, b2]) => hole(a, b2));
        if (edge)
          M.quad(
            st,
            Pt(d10, R),
            Pt(d10, R + T),
            Pt(d11, R + T),
            Pt(d11, R),
            [d10[2], 0, -d10[0]],
            [0, 0, 0.2, 0, 0.2, 1, 0, 1],
            M.mulc(LC, 0.55),
          );
      }
    // proscenium arch: flat semicircular band on the opening plane (x = cx), 0.9 m wide, with a keystone
    for (let ia = 0; ia < NA; ia++) {
      const a0 = (Math.PI * ia) / NA,
        a1 = (Math.PI * (ia + 1)) / NA;
      const Q = (a, rr) => [
        cx - 0.02,
        cy + Math.sin(a) * rr,
        cz - Math.cos(a) * rr,
      ];
      M.quad(
        st,
        Q(a0, R),
        Q(a0, R + 0.95),
        Q(a1, R + 0.95),
        Q(a1, R),
        [-1, 0, 0],
        [0, 0, 1, 0, 1, 0.3, 0, 0.3],
        M.mulc(LC, 0.95),
      );
      if (ia === NA / 2 - 1 || ia === NA / 2)
        M.box(
          st,
          cx - 0.35,
          cy + R + 0.1,
          cz - 0.4,
          cx + 0.05,
          cy + R + 1.3,
          cz + 0.4,
          { s: 1, c: LC },
        );
    }
    // rubble from the bite, a toppled light rig, the upright piano, a mic stand, sandbags (someone made a stand here)
    M.rubblePile(cx - 1.2, z + 3.2, 1.8, 0.7, r, { y: SY });
    const mb = M.buf("metal_painted", x, z, "detail");
    M.obox(
      M.buf("wood_rotten", x, z, "detail"),
      x + 2.8,
      SY + 0.65,
      z - 3.2,
      0.7,
      1.3,
      1.6,
      0.25,
      { c: [0.3, 0.2, 0.16], s: 1 },
    );
    M.obox(
      M.buf("wood_rotten", x, z, "detail"),
      x + 2.3,
      SY + 0.75,
      z - 3.1,
      0.5,
      0.08,
      1.4,
      0.25,
      { c: [0.85, 0.82, 0.72], s: 1 },
    ); // keys
    M.pipe(mb, x - 1.8, SY, z + 0.4, x - 1.7, SY + 1.5, z + 0.35, 0.02, 4, {
      c: [0.3, 0.3, 0.3],
    });
    M.beam(
      mb,
      x + 0.5,
      SY + 0.2,
      z + 5.5,
      x + 3.5,
      SY + 0.8,
      z + 6.4,
      0.12,
      0.12,
      { c: [0.25, 0.25, 0.24] },
    );
    const sb = M.buf("fabric", x, z, "detail");
    for (let i = 0; i < 7; i++)
      M.obox(
        sb,
        x - 3.0 + (i % 4) * 0.02,
        SY + 0.18 + Math.floor(i / 4) * 0.34,
        z - 2.4 + (i % 4) * 0.9,
        0.5,
        0.36,
        0.86,
        0.05 * ((i % 3) - 1),
        { c: [0.58, 0.53, 0.4], s: 1 },
      );
    // rows of rotten benches facing the stage (some toppled, some missing)
    const bb = M.buf("wood_rotten", x, z, "detail");
    for (let row = 0; row < 3; row++)
      for (let k = -1; k <= 1; k++) {
        if (r() < 0.25) continue;
        const bxp = x - 9 - row * 2.6,
          bzp = z + k * 4.2,
          tip = r() < 0.2;
        M.obox(bb, bxp, tip ? 0.2 : 0.45, bzp, 0.45, 0.06, 3.2, 0, {
          c: [0.5, 0.42, 0.34],
          s: 1,
          roll: tip ? 1.3 : 0,
        });
        if (!tip) {
          M.obox(bb, bxp + 0.24, 0.75, bzp, 0.06, 0.4, 3.2, 0, {
            c: [0.45, 0.38, 0.3],
            s: 1,
          });
          for (const e of [-1.4, 1.4])
            M.box(
              mb,
              bxp - 0.2,
              0,
              bzp + e - 0.03,
              bxp + 0.2,
              0.45,
              bzp + e + 0.03,
              { s: 1, c: [0.2, 0.2, 0.2] },
            );
        }
      }
    // colliders: stage (walkable), steps, shell back
    M.box3(x - 3.5, 0, z - 8, x + 6.5, SY, z + 8, {
      tag: "stage",
      surface: "wood",
    });
    for (let i = 0; i < 4; i++)
      M.box3(
        x - 3.5 - (i + 1) * 0.45,
        0,
        z - 4,
        x - 3.5 - i * 0.45,
        (SY * (4 - i)) / 4.5,
        z + 4,
        { tag: "stairs", surface: "concrete" },
      );
    M.box3(cx + R * 0.72, SY, z - R - 0.5, cx + R + 0.6, SY + R, z + R + 0.5, {
      tag: "bandshell",
      walkable: false,
    });
    M.box3(cx - 0.3, SY, z - R - 1, cx + R * 0.72, SY + 4, z - R + 0.2, {
      tag: "bandshell",
      walkable: false,
    });
    M.box3(cx - 0.3, SY, z + R - 0.2, cx + R * 0.72, SY + 4, z + R + 1, {
      tag: "bandshell",
      walkable: false,
    });
  }

  // -------------------------------------------------------------------
  // 4. The Carousel
  // -------------------------------------------------------------------
  function horse(b, px, py, pz, yaw, col, pitch) {
    M.pushXF(M.mtx(px, py, pz, yaw, pitch || 0, 0));
    const c = col,
      cd = M.mulc(col, 0.7);
    M.obox(b, 0, 0, 0, 0.36, 0.42, 1.1, 0, { c, s: 1 }); // barrel
    M.obox(b, 0, 0.32, -0.55, 0.22, 0.6, 0.28, 0, { c, s: 1, pitch: -0.6 }); // neck
    M.obox(b, 0, 0.58, -0.8, 0.2, 0.22, 0.46, 0, { c, s: 1, pitch: 0.35 }); // head
    M.obox(b, 0, 0.62, -0.55, 0.06, 0.34, 0.3, 0, {
      c: [0.2, 0.18, 0.16],
      s: 1,
      pitch: -0.5,
    }); // mane
    for (const [lx, lz, a] of [
      [-0.12, -0.42, -0.7],
      [0.12, -0.42, -0.4],
      [-0.12, 0.42, 0.6],
      [0.12, 0.42, 0.9],
    ])
      M.obox(b, lx, -0.38, lz + Math.sin(a) * 0.12, 0.09, 0.55, 0.09, 0, {
        c: cd,
        s: 1,
        pitch: a,
      });
    M.obox(b, 0, 0.12, 0.6, 0.06, 0.1, 0.4, 0, {
      c: [0.2, 0.18, 0.16],
      s: 1,
      pitch: 0.9,
    }); // tail
    M.obox(b, 0, 0.23, -0.05, 0.4, 0.06, 0.45, 0, {
      c: [0.5, 0.18, 0.14],
      s: 1,
    }); // saddle
    M.popXF();
  }
  function buildCarousel() {
    const P = PIECES.carousel,
      x = P.x,
      z = P.z,
      r = M.rng("carousel");
    const bk = M.buf("brick_red", x, z, "main"),
      st = M.buf("stone_limestone", x, z, "main");
    const R = 9.2,
      WH = 4.6,
      n = 8;
    const corner = (i) => {
      const a = ((i + 0.5) / n) * Math.PI * 2;
      return [x + Math.cos(a) * R, z + Math.sin(a) * R];
    };
    // octagon: each side = two brick piers + an arched opening (lintel band above) — one side walled
    for (let i = 0; i < n; i++) {
      const a = corner(i),
        b2 = corner(i + 1);
      const len = Math.hypot(b2[0] - a[0], b2[1] - a[1]),
        ux = (b2[0] - a[0]) / len,
        uz = (b2[1] - a[1]) / len;
      const nx = uz,
        nz = -ux; // outward (a→b runs CCW seen from above with +z south → right-hand side is out)
      const Pp = (t) => [a[0] + ux * t, a[1] + uz * t];
      const pier = 1.1;
      const walled = i === 5;
      const segs = walled
        ? [[0, len]]
        : [
            [0, pier],
            [len - pier, len],
          ];
      for (const [t0, t1] of segs) {
        const p0 = Pp(t0),
          p1 = Pp(t1);
        M.wall(
          bk,
          p0[0],
          p0[1],
          p1[0],
          p1[1],
          0,
          WH,
          t0 / 2.7,
          t1 / 2.7,
          0,
          WH / 2.7,
          [0.62, 0.52, 0.46],
          [0.8, 0.7, 0.62],
        );
        M.wall(
          bk,
          p1[0] - nx * 0.45,
          p1[1] - nz * 0.45,
          p0[0] - nx * 0.45,
          p0[1] - nz * 0.45,
          0,
          WH,
          t1 / 2.7,
          t0 / 2.7,
          0,
          WH / 2.7,
          [0.5, 0.42, 0.38],
          [0.66, 0.58, 0.52],
        );
        M.ocol(
          (p0[0] + p1[0]) / 2 - nx * 0.22,
          (p0[1] + p1[1]) / 2 - nz * 0.22,
          t1 - t0,
          0.45,
          0,
          WH,
          -Math.atan2(uz, ux),
          { tag: "building_wall" },
        );
      }
      if (!walled) {
        // jambs of the opening + the arch spandrel above it (segmental arch approximated by a stepped band)
        const o0 = Pp(pier),
          o1 = Pp(len - pier);
        for (const [q, s2] of [
          [o0, 1],
          [o1, -1],
        ])
          M.quad(
            bk,
            [q[0], 0, q[1]],
            [q[0] - nx * 0.45, 0, q[1] - nz * 0.45],
            [q[0] - nx * 0.45, WH, q[1] - nz * 0.45],
            [q[0], WH, q[1]],
            [ux * s2, 0, uz * s2],
            [0, 0, 0.2, 0, 0.2, 1.7, 0, 1.7],
            [0.6, 0.5, 0.44],
          );
        const open = len - 2 * pier,
          steps = 6;
        for (let k = 0; k < steps; k++) {
          const t0 = pier + (open * k) / steps,
            t1 = pier + (open * (k + 1)) / steps,
            tm = (k + 0.5) / steps;
          const yb = 3.2 + 0.7 * Math.sin(Math.PI * tm);
          const p0 = Pp(t0),
            p1 = Pp(t1);
          M.wall(
            bk,
            p0[0],
            p0[1],
            p1[0],
            p1[1],
            yb,
            WH,
            t0 / 2.7,
            t1 / 2.7,
            yb / 2.7,
            WH / 2.7,
            [0.66, 0.56, 0.5],
            [0.8, 0.7, 0.62],
          );
          M.quad(
            st,
            [p0[0], yb, p0[1]],
            [p1[0], yb, p1[1]],
            [p1[0] - nx * 0.45, yb, p1[1] - nz * 0.45],
            [p0[0] - nx * 0.45, yb, p0[1] - nz * 0.45],
            [0, -1, 0],
            [0, 0, 1, 0, 1, 0.2, 0, 0.2],
            [0.7, 0.68, 0.62],
          );
        }
      }
      // limestone cornice band
      const c0 = corner(i),
        c1 = corner(i + 1);
      M.beam(
        st,
        c0[0] + (c0[0] - x) * 0.02,
        WH + 0.2,
        c0[1] + (c0[1] - z) * 0.02,
        c1[0] + (c1[0] - x) * 0.02,
        WH + 0.2,
        c1[1] + (c1[1] - z) * 0.02,
        0.6,
        0.4,
        { c: [0.8, 0.78, 0.72] },
      );
    }
    // roof: shallow octagonal pyramid with a lantern; two facets caved in (rafters showing)
    const rb = M.buf("roof_tar", x, z, "main"),
      rf = M.buf("wood_rotten", x, z, "detail");
    const RH = 3.2;
    for (let i = 0; i < n; i++) {
      const a = corner(i),
        b2 = corner(i + 1);
      const A = [a[0] + (a[0] - x) * 0.07, WH + 0.4, a[1] + (a[1] - z) * 0.07],
        B = [b2[0] + (b2[0] - x) * 0.07, WH + 0.4, b2[1] + (b2[1] - z) * 0.07];
      const top = [x, WH + 0.4 + RH, z];
      const mx = (A[0] + B[0]) / 2 - x,
        mz = (A[2] + B[2]) / 2 - z;
      const nn = v3n([mx, R * 1.1, mz]);
      if (i === 1 || i === 2) {
        // collapsed: only the rafters remain, the sheathing hangs into the hall
        for (let k = 1; k < 5; k++) {
          const t = k / 5;
          M.beam(
            rf,
            A[0] + (B[0] - A[0]) * t,
            A[1],
            A[2] + (B[2] - A[2]) * t,
            x + (A[0] + (B[0] - A[0]) * t - x) * 0.25,
            top[1] - 0.8 + (i === 2 && k === 3 ? -1.8 : 0),
            z + (A[2] + (B[2] - A[2]) * t - z) * 0.25,
            0.12,
            0.18,
            { c: [0.45, 0.38, 0.3] },
          );
        }
        M.quad(
          rb,
          A,
          [A[0] + (x - A[0]) * 0.35, A[1] - 1.6, A[2] + (z - A[2]) * 0.35],
          [B[0] + (x - B[0]) * 0.35, B[1] - 2.1, B[2] + (z - B[2]) * 0.35],
          B,
          [0, 1, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.45, 0.43, 0.4],
        );
        continue;
      }
      M.tri(rb, A, B, top, nn, [0, 0, 2, 0, 1, 1.5], [0.5, 0.48, 0.45]);
      M.tri(
        rb,
        B,
        A,
        top,
        [-nn[0], -nn[1], -nn[2]],
        [0, 0, 2, 0, 1, 1.5],
        [0.3, 0.28, 0.26],
      ); // underside (seen from inside)
    }
    M.cyl(
      M.buf("metal_painted", x, z, "main"),
      x,
      WH + 0.4 + RH - 0.4,
      z,
      1.1,
      0.9,
      1.2,
      8,
      { c: [0.35, 0.45, 0.4], capTop: true },
    );
    M.cyl(
      M.buf("metal_painted", x, z, "main"),
      x,
      WH + 0.4 + RH + 0.8,
      z,
      0.9,
      0.05,
      1.1,
      8,
      { c: [0.33, 0.43, 0.38] },
    );
    // floor + the carousel: tilted platform (a bearing gave way), centre column, canopy stub, horses on bent poles
    M.poly(
      M.buf("concrete", x, z, "main"),
      Array.from({ length: n }, (_, i) => corner(i)),
      0.04,
      { s: 3, c: [0.55, 0.53, 0.5], convex: true },
    );
    const tilt = 0.06,
      pr = 6.2;
    const cm = M.buf("metal_painted", x, z, "main"),
      hb = M.buf("metal_painted", x, z, "detail");
    M.pushXF(M.mtx(x, 0.35, z, 0.3, tilt, 0));
    M.cyl(M.buf("wood_rotten", x, z, "main"), 0, 0, 0, pr, pr, 0.3, 24, {
      c: [0.55, 0.45, 0.36],
      capTop: true,
    });
    M.cyl(cm, 0, 0.3, 0, 0.9, 0.9, 3.9, 12, { c: [0.6, 0.3, 0.25] }); // centre column (mirror panels long gone)
    M.cyl(cm, 0, 4.2, 0, pr + 0.3, 1.0, 1.1, 24, {
      c: [0.55, 0.48, 0.3],
      capBot: true,
    }); // canopy cone
    const cols = [
      [0.82, 0.78, 0.7],
      [0.55, 0.36, 0.28],
      [0.3, 0.3, 0.32],
      [0.78, 0.66, 0.4],
      [0.6, 0.62, 0.58],
    ];
    for (let ring = 0; ring < 2; ring++) {
      const rr = ring === 0 ? pr - 0.9 : pr - 2.4,
        cnt = ring === 0 ? 12 : 8;
      for (let i = 0; i < cnt; i++) {
        const a = (i / cnt) * Math.PI * 2 + ring * 0.2;
        const hx = Math.cos(a) * rr,
          hz = Math.sin(a) * rr;
        const k = r();
        if (k < 0.12) continue; // missing
        if (k < 0.24) {
          horse(hb, hx * 0.95, 0.55, hz * 0.95, -a, r.pick(cols), 1.45);
          continue;
        } // fallen off its pole
        const hy = 1.25 + Math.sin(i * 1.7) * 0.35;
        M.pipe(hb, hx, 0.3, hz, hx + (k < 0.35 ? 0.3 : 0), 4.2, hz, 0.035, 5, {
          c: [0.75, 0.66, 0.4],
        });
        horse(hb, hx, hy, hz, -a, r.pick(cols), (r() - 0.5) * 0.2);
      }
    }
    M.popXF();
    // colliders: platform (walkable), centre column
    M.ocol(x, z, pr * 1.4, pr * 1.4, 0, 0.7, 0.3, {
      tag: "platform",
      surface: "wood",
    });
    M.box3(x - 0.9, 0.5, z - 0.9, x + 0.9, 4.5, z + 0.9, {
      tag: "column",
      walkable: false,
    });
    // leaves blown in, a skeleton slumped against the column
    const mk = M.buf("my/markings", x, z, "fine");
    for (let i = 0; i < 6; i++)
      M.decal(
        mk,
        x + r.range(-7, 7),
        0.06,
        z + r.range(-7, 7),
        r.range(2, 4),
        r.range(2, 4),
        r() * 6,
        r() < 0.6 ? M.MARK.LEAVES : M.MARK.DIRT,
      );
  }

  // -------------------------------------------------------------------
  // 5. Playground (south-west corner)
  // -------------------------------------------------------------------
  function buildPlayground() {
    const P = PIECES.playground,
      x = P.x,
      z = P.z,
      r = M.rng("playground");
    const rs = M.buf("rust", x, z, "detail"),
      mp = M.buf("metal_painted", x, z, "detail");
    const RC = [0.55, 0.38, 0.3];
    // safety-surface patch (cracked rubber) and sand
    M.poly(
      M.buf("concrete", x, z, "main"),
      [
        [P.x0 + 1, P.z0 + 1],
        [P.x1 - 1, P.z0 + 1],
        [P.x1 - 1, P.z1 - 1],
        [P.x0 + 1, P.z1 - 1],
      ],
      0.03,
      { s: 2, c: [0.62, 0.42, 0.36], convex: true },
    ); // faded red safety surface
    const mk = M.buf("my/markings", x, z, "fine");
    for (let i = 0; i < 8; i++)
      M.decal(
        mk,
        x + r.range(-9, 9),
        0.05,
        z + r.range(-6, 6),
        r.range(2, 4),
        r.range(2, 4),
        r() * 6,
        r.pick([M.MARK.CRACKS, M.MARK.DIRT, M.MARK.LEAVES, M.MARK.PUDDLE]),
      );
    // swings: A-frame, three seats (one chain snapped, one wrapped over the bar)
    const sx = x - 5,
      sz = z - 3.5;
    for (const e of [-3, 3]) {
      M.beam(rs, sx + e, 0, sz - 1.4, sx + e, 2.6, sz, 0.09, 0.09, { c: RC });
      M.beam(rs, sx + e, 0, sz + 1.4, sx + e, 2.6, sz, 0.09, 0.09, { c: RC });
    }
    M.pipe(rs, sx - 3, 2.6, sz, sx + 3, 2.6, sz, 0.07, 6, { c: RC });
    for (let k = 0; k < 3; k++) {
      const px = sx - 2 + k * 2;
      if (k === 1) {
        M.pipe(mp, px - 0.2, 2.6, sz, px - 0.25, 0.9, sz + 0.1, 0.012, 3, {
          c: [0.3, 0.3, 0.3],
        });
        M.obox(
          M.buf("rubber", x, z, "detail"),
          px,
          0.08,
          sz + 0.5,
          0.5,
          0.05,
          0.2,
          0.4,
          { c: [0.2, 0.2, 0.2], s: 1 },
        );
        continue;
      }
      const sw = k === 2 ? 0.35 : 0;
      for (const o of [-0.22, 0.22])
        M.pipe(mp, px + o, 2.6, sz, px + o, 0.55, sz + sw, 0.012, 3, {
          c: [0.3, 0.3, 0.3],
        });
      M.obox(
        M.buf("rubber", x, z, "detail"),
        px,
        0.53,
        sz + sw,
        0.5,
        0.04,
        0.2,
        0,
        { c: [0.2, 0.2, 0.2], s: 1 },
      );
    }
    // slide: ladder + deck + chute
    const lx = x + 4,
      lz = z - 4;
    for (const e of [-0.3, 0.3])
      M.pipe(rs, lx + e, 0, lz - 1.1, lx + e, 2.0, lz - 0.4, 0.04, 5, {
        c: RC,
      });
    for (let k = 1; k < 6; k++)
      M.pipe(
        rs,
        lx - 0.3,
        k * 0.33,
        lz - 1.1 + k * 0.12,
        lx + 0.3,
        k * 0.33,
        lz - 1.1 + k * 0.12,
        0.025,
        4,
        { c: RC },
      );
    M.box(mp, lx - 0.5, 1.9, lz - 0.5, lx + 0.5, 2.0, lz + 0.5, {
      s: 1,
      c: [0.5, 0.45, 0.4],
      skip: 0,
    });
    for (const [ex, ez] of [
      [-0.45, -0.45],
      [0.45, -0.45],
      [-0.45, 0.45],
      [0.45, 0.45],
    ])
      M.pipe(rs, lx + ex, 0, lz + ez, lx + ex, 2.9, lz + ez, 0.04, 5, {
        c: RC,
      });
    M.obox(
      M.buf("metal_painted", x, z, "main"),
      lx,
      1.0,
      lz + 1.9,
      0.7,
      0.06,
      3.3,
      0,
      { c: [0.7, 0.66, 0.6], s: 1, pitch: 0.62 },
    );
    for (const e of [-0.38, 0.38])
      M.obox(mp, lx + e, 1.1, lz + 1.9, 0.05, 0.22, 3.3, 0, {
        c: [0.6, 0.3, 0.2],
        s: 1,
        pitch: 0.62,
      });
    // jungle-gym dome of bent pipe
    const jx = x + 4.5,
      jz = z + 3.5,
      JR = 2.2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      let prev = null;
      for (let k = 0; k <= 4; k++) {
        const ph = ((k / 4) * Math.PI) / 2,
          p = [
            jx + Math.cos(a) * Math.cos(ph) * JR,
            Math.sin(ph) * JR,
            jz + Math.sin(a) * Math.cos(ph) * JR,
          ];
        if (prev && !(i === 3 && k === 3))
          M.pipe(rs, prev[0], prev[1], prev[2], p[0], p[1], p[2], 0.035, 4, {
            c: RC,
          });
        prev = p;
      }
    }
    for (const h of [0.7, 1.4]) {
      const rr = Math.sqrt(JR * JR - h * h);
      for (let i = 0; i < 8; i++) {
        const a0 = (i / 8) * Math.PI * 2,
          a1 = ((i + 1) / 8) * Math.PI * 2;
        M.pipe(
          rs,
          jx + Math.cos(a0) * rr,
          h,
          jz + Math.sin(a0) * rr,
          jx + Math.cos(a1) * rr,
          h,
          jz + Math.sin(a1) * rr,
          0.03,
          4,
          { c: RC },
        );
      }
    }
    // merry-go-round (tipped on its hub) and a seesaw
    const gx = x - 3.5,
      gz = z + 3.8;
    M.pushXF(M.mtx(gx, 0.25, gz, 0.4, 0.12, 0));
    M.cyl(mp, 0, 0, 0, 1.5, 1.5, 0.1, 16, {
      c: [0.45, 0.4, 0.34],
      capTop: true,
    });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      M.pipe(
        rs,
        Math.cos(a) * 1.3,
        0.1,
        Math.sin(a) * 1.3,
        Math.cos(a) * 0.3,
        0.9,
        Math.sin(a) * 0.3,
        0.025,
        4,
        { c: RC },
      );
    }
    M.popXF();
    M.pipe(rs, x - 8.5, 0, z + 1.5, x - 8.5, 0.5, z + 1.5, 0.08, 6, { c: RC });
    M.obox(
      M.buf("wood_rotten", x, z, "detail"),
      x - 8.5,
      0.35,
      z + 1.5,
      0.25,
      0.06,
      3.6,
      0,
      { c: [0.5, 0.42, 0.34], s: 1, pitch: 0.28 },
    );
    // sandbox with a rotten timber edge, a toy bucket, a bench with a skeleton reading a paper
    const bw = M.buf("wood_rotten", x, z, "detail");
    for (const [a0, a1, b0, b1] of [
      [-1.5, 1.5, -1.5, -1.3],
      [-1.5, 1.5, 1.3, 1.5],
      [-1.5, -1.3, -1.3, 1.3],
      [1.3, 1.5, -1.3, 1.3],
    ])
      M.box(bw, x + a0, 0, z + b0, x + a1, 0.3, z + b1, {
        s: 1,
        c: [0.45, 0.38, 0.3],
      });
    M.poly(
      M.buf("dirt", x, z, "detail"),
      [
        [x - 1.3, z - 1.3],
        [x + 1.3, z - 1.3],
        [x + 1.3, z + 1.3],
        [x - 1.3, z + 1.3],
      ],
      0.2,
      { s: 2, c: [0.95, 0.85, 0.65], convex: true },
    );
    M.cyl(
      M.buf("metal_painted", x, z, "detail"),
      x + 0.5,
      0.2,
      z - 0.3,
      0.12,
      0.15,
      0.2,
      8,
      { c: [0.7, 0.2, 0.15] },
    );
    if (M.parkBench) M.parkBench(x - 9.5, z - 5, Math.PI / 2, false);
    if (M.skeleton) M.skeleton(x - 9.3, z - 5, -Math.PI / 2, r, true);
    // low painted-iron fence with two gates
    const fb = M.buf("metal_painted", x, z, "detail");
    const pts = [
      [P.x0, P.z0],
      [P.x1, P.z0],
      [P.x1, P.z1],
      [P.x0, P.z1],
    ];
    for (let i = 0; i < 4; i++) {
      const a = pts[i],
        b2 = pts[(i + 1) % 4],
        len = Math.hypot(b2[0] - a[0], b2[1] - a[1]),
        ux = (b2[0] - a[0]) / len,
        uz = (b2[1] - a[1]) / len;
      const gate = i === 1 || i === 3 ? [len / 2 - 1, len / 2 + 1] : null;
      const spans = gate
        ? [
            [0, gate[0]],
            [gate[1], len],
          ]
        : [[0, len]];
      for (const [t0, t1] of spans) {
        const p0 = [a[0] + ux * t0, a[1] + uz * t0],
          p1 = [a[0] + ux * t1, a[1] + uz * t1];
        M.beam(fb, p0[0], 0.9, p0[1], p1[0], 0.9, p1[1], 0.04, 0.04, {
          c: [0.2, 0.3, 0.24],
        });
        for (let t = t0; t <= t1; t += 0.35)
          M.vbar(
            fb,
            a[0] + ux * t,
            a[1] + uz * t,
            0,
            0.95,
            0.03,
            uz,
            -ux,
            [0.2, 0.3, 0.24],
            true,
          );
        M.ocol(
          (p0[0] + p1[0]) / 2,
          (p0[1] + p1[1]) / 2,
          t1 - t0,
          0.1,
          0,
          0.95,
          -Math.atan2(uz, ux),
          { tag: "fence" },
        );
      }
    }
    // colliders on the big pieces (the dome and swings are climb-through-able on purpose: low)
    M.box3(lx - 0.5, 0, lz - 0.5, lx + 0.5, 2.0, lz + 0.5, { tag: "slide" });
    M.ocol(jx, jz, JR * 1.6, JR * 1.6, 0, 1.2, 0, {
      tag: "jungle_gym",
      surface: "metal",
    });
  }

  M.buildParkPieces = function () {
    for (const [name, fn] of [
      ["rotorcraft", buildRotorcraft],
      ["needle", buildNeedle],
      ["bandshell", buildBandshell],
      ["carousel", buildCarousel],
      ["playground", buildPlayground],
    ]) {
      try {
        fn();
      } catch (e) {
        G.reportError("map:parkpiece:" + name, e);
      }
    }
  };
})();
