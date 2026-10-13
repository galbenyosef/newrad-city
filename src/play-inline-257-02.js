// play-inline-257 02 — ctx
// Lines 24-333 of readable/play-inline-257.pretty.js (statement-aligned).
  const PF = G._pbr;
  const BK = PF.bk,
    K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2;
  const UP = V3(0, 1, 0),
    XA = V3(1, 0, 0),
    ZA = V3(0, 0, 1);

  const M = (PF.MB = {
    zc: 573,
    deck: 20,
    z0: 561,
    z1: 585,
    road: { z0: 566.4, z1: 579.6 }, // centre band between the cable housings
    cables: [562.2, 565.2, 580.8, 583.8],
    legs: [563.7, 582.3],
    t1: 320,
    t2: 436,
    tTop: 72,
    ancM: { x0: 258, x1: 290, saddle0: 282 }, // Manhattan anchorage housings (+ saddle under the deck)
    ancB: { x0: 462, x1: 494, saddle1: 472 }, // Brooklyn anchorage
    rampM: { x0: 216, x1: 282 },
    rampB: { x0: 472, x1: 556 },
    ramp: { z0: 567.6, z1: 578.4 },
    arch: { x0: 226, x1: 236, z0: 560.5, z1: 585.5, open: 11, spring: 7.5 },
    lo: 13,
  });
  const midX = (M.t1 + M.t2) / 2,
    half = (M.t2 - M.t1) / 2;
  /** Main-cable height at x (parabola between the towers, straight backstays to the anchorages). */
  function cableY(x) {
    if (x >= M.t1 && x <= M.t2) {
      const u = (x - midX) / half;
      return M.tTop - (M.tTop - 22.5) * (1 - u * u);
    }
    if (x < M.t1) {
      const t = (M.t1 - x) / (M.t1 - 272);
      return M.tTop + (30 - M.tTop) * t + Math.sin(t * PI) * -2.5;
    }
    const t = (x - M.t2) / (480 - M.t2);
    return M.tTop + (30 - M.tTop) * t + Math.sin(t * PI) * -2.5;
  }
  M.cableY = cableY;
  const rampYM = (x) =>
    Math.max(
      0,
      Math.min(M.deck, ((x - M.rampM.x0) / (M.rampM.x1 - M.rampM.x0)) * M.deck),
    );
  const rampYB = (x) =>
    Math.max(
      0,
      Math.min(M.deck, ((M.rampB.x1 - x) / (M.rampB.x1 - M.rampB.x0)) * M.deck),
    );

  // =================================================================
  // Triumphal arch + colonnades (Carrère & Hastings, 1912)
  // =================================================================
  /** Canvas relief frieze: a buffalo hunt in low relief (light/shadow on stone). */
  function friezeTex() {
    return PF.canvasTex(
      "pbr_mb_frieze",
      1024,
      128,
      (ctx, w, h) => {
        const r = PF.rng(1912);
        ctx.fillStyle = "#b8b2a4";
        ctx.fillRect(0, 0, w, h);
        const fig = (x, y, s, kind) => {
          const draw = (dx, dy, col) => {
            ctx.fillStyle = col;
            ctx.beginPath();
            if (kind === "buffalo") {
              ctx.ellipse(x + dx, y + dy, 34 * s, 20 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.ellipse(
                x + dx - 30 * s,
                y + dy - 8 * s,
                16 * s,
                14 * s,
                0,
                0,
                Math.PI * 2,
              );
              ctx.fill();
              for (const lx of [-20, -8, 12, 24])
                ctx.fillRect(x + dx + lx * s, y + dy + 12 * s, 5 * s, 22 * s);
            } else {
              ctx.ellipse(
                x + dx,
                y + dy - 26 * s,
                7 * s,
                8 * s,
                0,
                0,
                Math.PI * 2,
              );
              ctx.fill();
              ctx.fillRect(x + dx - 6 * s, y + dy - 18 * s, 12 * s, 26 * s);
              ctx.beginPath();
              ctx.ellipse(
                x + dx,
                y + dy + 16 * s,
                26 * s,
                14 * s,
                0,
                0,
                Math.PI * 2,
              );
              ctx.fill();
              for (const lx of [-18, 16])
                ctx.fillRect(x + dx + lx * s, y + dy + 24 * s, 5 * s, 18 * s);
              ctx.fillRect(x + dx + 4 * s, y + dy - 14 * s, 30 * s, 3 * s);
            }
          };
          draw(3, 3, "rgba(60,54,44,0.55)");
          draw(-2, -2, "rgba(250,246,236,0.5)");
          draw(0, 0, "#aaa496");
        };
        for (let i = 0; i < 9; i++)
          fig(
            60 + i * 112 + r() * 20,
            70 + r() * 10,
            0.85 + r() * 0.2,
            i % 3 === 1 ? "rider" : "buffalo",
          );
        ctx.fillStyle = "rgba(40,36,30,0.35)";
        ctx.fillRect(0, 0, w, 6);
        ctx.fillRect(0, h - 6, w, 6);
        for (let i = 0; i < 60; i++) {
          ctx.fillStyle = "rgba(40,34,24," + r() * 0.2 + ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            10 + r() * 40,
            5 + r() * 20,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      },
      { clamp: true },
    );
  }
  function arch(b) {
    const A = M.arch,
      zc = M.zc,
      W2 = A.open / 2,
      key = "arch_stone";
    const xc = (A.x0 + A.x1) / 2;
    // pylons (north & south of the opening), rusticated base
    for (const [za, zb] of [
      [A.z0, zc - W2],
      [zc + W2, A.z1],
    ]) {
      b.boxMM(key, A.x0, 0, za, A.x1, 14.6, zb, { grime: 0.45, segLen: 3 });
      for (let y = 0; y < 5; y += 0.8)
        b.boxMM(
          "granite_block",
          A.x0 - 0.25,
          y,
          za - 0.25,
          A.x1 + 0.25,
          y + 0.72,
          zb + 0.25,
          { seg: false, grime: 0.55 },
        );
      PF.colMM(A.x0 - 0.25, 0, za - 0.25, A.x1 + 0.25, 21, zb + 0.25, {
        walkable: false,
      });
      // paired engaged columns on both faces
      const pc = (za + zb) / 2;
      for (const xf of [A.x0 - 0.55, A.x1 + 0.55])
        for (const dz of [-2.4, 2.4]) {
          b.box(key, xf, 5, pc + dz, 1.4, 0.6, 1.4, { seg: false, grime: 0.5 });
          b.cyl(key, xf, 5.6, pc + dz, 0.5, 0.56, 7.6, 14, {
            hSeg: 2,
            grime: 0.4,
          });
          b.box(key, xf, 13.2, pc + dz, 1.35, 0.7, 1.35, {
            seg: false,
            grime: 0.4,
          });
        }
      // niche with a carved medallion
      for (const xf of [A.x0 - 0.05, A.x1 + 0.05])
        b.cyl("arch_stone", xf, 10.5, pc, 1.0, 1.0, 0.25, 16, {
          rz: HP,
          hSeg: 1,
        });
    }
    // archivolt: coffered intrados + voussoirs, spandrels above the opening
    const R = W2;
    const sp = new THREE.Shape();
    sp.moveTo(-R, A.spring);
    sp.absarc(0, A.spring, R, PI, 0, true);
    sp.lineTo(R, 14.6);
    sp.lineTo(-R, 14.6);
    sp.closePath();
    const sg = new THREE.ExtrudeGeometry(sp, {
      depth: A.x1 - A.x0,
      bevelEnabled: false,
      curveSegments: 20,
    });
    b.add(key, sg, { m: PF.m4(A.x0, 0, zc, HP), grime: 0.4 });
    for (let k = 0; k <= 14; k++) {
      const a = (k / 14) * PI;
      for (const xf of [A.x0 - 0.12, A.x1 + 0.12])
        b.box(
          key,
          xf,
          A.spring + Math.sin(a) * (R + 0.6) - 0.6,
          zc + Math.cos(a) * (R + 0.6),
          0.5,
          1.2,
          0.8,
          { rx: a - HP, seg: false, grime: 0.4 },
        );
      // coffer ribs across the soffit
      const y = A.spring + Math.sin(a) * (R - 0.1),
        z = zc + Math.cos(a) * (R - 0.1);
      if (k % 2 === 0)
        b.box("granite_block", xc, y - 0.2, z, A.x1 - A.x0 - 0.4, 0.35, 0.35, {
          rx: a - HP,
          seg: false,
          grime: 0.4,
        });
    }
    for (const xf of [A.x0 - 0.3, A.x1 + 0.3])
      b.box(key, xf, A.spring + R - 0.2, zc, 1.0, 2.0, 1.6, {
        seg: false,
        grime: 0.4,
      }); // keystones
    // frieze band + attic + cornices
    b.boxMM(key, A.x0 - 0.8, 14.6, A.z0 - 0.8, A.x1 + 0.8, 15.4, A.z1 + 0.8, {
      seg: false,
      grime: 0.45,
    });
    const fz = PF.texMat("mb_frieze", friezeTex(), { rough: 0.9 });
    for (const [xf, ry] of [
      [A.x0 - 0.02, -HP],
      [A.x1 + 0.02, HP],
    ])
      b.quad(fz, xf, 16.4, zc, A.z1 - A.z0 - 2, 2.0, { ry, grime: 0.3 });
    b.boxMM(key, A.x0, 15.4, A.z0, A.x1, 17.4, A.z1, {
      seg: false,
      grime: 0.45,
    });
    b.boxMM(key, A.x0 - 1.0, 17.4, A.z0 - 1.0, A.x1 + 1.0, 18.1, A.z1 + 1.0, {
      seg: false,
      grime: 0.4,
    });
    b.boxMM(key, A.x0 + 0.4, 18.1, A.z0 + 1.5, A.x1 - 0.4, 20.6, A.z1 - 1.5, {
      seg: false,
      grime: 0.5,
    });
    b.boxMM(key, A.x0 + 0.1, 20.6, A.z0 + 1.2, A.x1 - 0.1, 21.1, A.z1 - 1.2, {
      seg: false,
      grime: 0.4,
    });
    const ins = PF.texMat(
      "mb_inscr",
      PF.signTex("mb_inscr", ["MANHATTAN BRIDGE"], "engraved", 1024, 128, {
        bg: "#c4beb0",
      }),
      { rough: 0.9 },
    );
    b.quad(ins, A.x0 + 0.38, 19.35, zc, 14, 1.3, { ry: -HP, grime: 0.2 });
    b.quad(ins, A.x1 - 0.38, 19.35, zc, 14, 1.3, { ry: HP, grime: 0.2 });
    // allegorical groups on plinths flanking the west face ("Spirit of Commerce" / "Spirit of Industry")
    for (const pz of [A.z0 + 3.5, A.z1 - 3.5]) {
      b.boxMM(
        "granite_block",
        A.x0 - 5.2,
        0,
        pz - 1.8,
        A.x0 - 1.6,
        3.2,
        pz + 1.8,
        { grime: 0.5 },
      );
      PF.colMM(A.x0 - 5.2, 0, pz - 1.8, A.x0 - 1.6, 3.2, pz + 1.8, {});
      const sx = A.x0 - 3.4;
      const rr = PF.rng(pz | 0);
      b.add("bronze_patina", new THREE.CapsuleGeometry(0.75, 2.2, 3, 8), {
        m: PF.m4(sx, 5.0, pz, 0, 0, 0.1),
        grime: 0.4,
      }); // standing figure
      b.sphere("bronze_patina", sx, 6.7, pz, 0.42, { ws: 8, hs: 6 });
      b.add("bronze_patina", new THREE.CapsuleGeometry(0.5, 1.4, 3, 8), {
        m: PF.m4(sx - 0.6, 4.1, pz + (pz < 573 ? 1.0 : -1.0), 0, 0.9, 0.3),
        grime: 0.4,
      }); // seated companion
      b.beam(
        "bronze_patina",
        V3(sx + 0.2, 5.8, pz),
        V3(sx - 0.4, 7.6 + rr(), pz + 0.8),
        0.14,
        0.14,
        {},
      ); // raised arm / torch
      b.box("bronze_patina", sx, 3.2, pz, 2.4, 0.5, 2.2, { seg: false });
    }
  }
