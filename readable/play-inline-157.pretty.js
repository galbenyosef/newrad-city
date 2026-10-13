/* src/poi_uptown/40_carnegie_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 40 Carnegie Hall — interior
 *
 * INTERIOR (cell 'carnegie_hall', origin 5000,0,1200) — friendly
 *   settlement of the Carnegie Consort: lobby (box office, bust of the
 *   founder), the west stair hall up to the First Tier and the Dress
 *   Circle, the Stern Auditorium (parquet, three horseshoe tiers, the
 *   arched stage with its organ pipes, grand piano and orchestra), and
 *   backstage: the commune's green room, the dynamo room and the
 *   Maestro's office.
 * EXTERIOR: see 40_carnegie.js (its builder calls P.interiorBuilders.carnegie_hall below).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pu) return;
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const posterTex = (i) => P.carnegiePosterTex(i); // shared with the exterior (40_carnegie.js)
  // ===================================================================
  // INTERIOR
  // ===================================================================
  /** Horseshoe tier: slab (outer = hall walls, inner = offset horseshoe), parapet, seats, colliders. */
  function tier(S, y, d, seatsRows, o) {
    o = o || {};
    const b = S.b;
    const AX = 22,
      AZB = 4,
      AZE = 16,
      ZS = -24; // side walls x ±22 from z ZS up to AZB, back ellipse to AZE
    const ia = AX - d,
      ib = AZE - AZB - d;
    // inner path (from east-front, down the east side, around the back, up the west side)
    const inner = [];
    inner.push([ia, ZS]);
    inner.push([ia, AZB]);
    const N = 18;
    for (let k = 1; k < N; k++) {
      const a = (k / N) * PI;
      inner.push([ia * Math.cos(a), AZB + ib * Math.sin(a)]);
    }
    inner.push([-ia, AZB]);
    inner.push([-ia, ZS]);
    const sh = new THREE.Shape();
    sh.moveTo(-AX, ZS);
    sh.lineTo(-AX, AZE);
    sh.lineTo(AX, AZE);
    sh.lineTo(AX, ZS);
    for (const p of inner) sh.lineTo(p[0], p[1]);
    sh.closePath();
    const slab = new THREE.ExtrudeGeometry(sh, {
      depth: 0.45,
      bevelEnabled: false,
      curveSegments: 4,
    }).rotateX(HP);
    b.geo(o.floor || "carpet_red", slab, P.m4(0, y, 0), { grime: 0.4 });
    // soffit (underside plaster, slightly lower)
    // parapet with gilded rail along the inner edge
    for (let i = 0; i < inner.length - 1; i++) {
      const a = inner[i],
        c = inner[i + 1],
        L = Math.hypot(c[0] - a[0], c[1] - a[1]),
        ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
      const cx = (a[0] + c[0]) / 2,
        cz = (a[1] + c[1]) / 2;
      b.boxC("plaster_cream", cx, y, cz, L + 0.08, 1.05, 0.22, {
        ry: -ang,
        seg: false,
      });
      b.boxC("gold", cx, y + 1.05, cz, L + 0.1, 0.1, 0.34, {
        ry: -ang,
        seg: false,
      });
      b.boxC("gold", cx, y - 0.62, cz, L + 0.1, 0.18, 0.3, {
        ry: -ang,
        seg: false,
      });
      b.boxC("plaster_red", cx, y + 0.3, cz, L * 0.92, 0.45, 0.24, {
        ry: -ang,
        seg: false,
      });
      S.colR(cx, cz, L + 0.1, 0.3, y, y + 1.1, -ang, { walkable: false });
      // little lamp under the parapet every few segments
      if (i % 3 === 1 && o.lamps !== false) {
        b.sphere("lamp_dim", cx, y - 0.8, cz, 0.08, { ws: 5, hs: 4 });
        S.light(cx, y - 1.0, cz, 0xffd8a0, 6, 0.6);
      }
    }
    // colliders: side strips + sliced back band
    S.col(-AX, y - 0.45, ZS, -ia, y, AZB, { surface: "carpet" });
    S.col(ia, y - 0.45, ZS, AX, y, AZB, { surface: "carpet" });
    for (let z = AZB; z < AZE; z += 1.5) {
      const zm = Math.min(AZE, z + 1.5),
        zc = (z + zm) / 2 - AZB;
      const xi =
        zc < ib ? ia * Math.sqrt(Math.max(0, 1 - (zc / ib) * (zc / ib))) : 0;
      if (xi <= 0.05) S.col(-AX, y - 0.45, z, AX, y, zm, { surface: "carpet" });
      else {
        S.col(-AX, y - 0.45, z, -xi, y, zm, { surface: "carpet" });
        S.col(xi, y - 0.45, z, AX, y, zm, { surface: "carpet" });
      }
    }
    // seats: rows following the horseshoe, facing the stage
    const rn = P.rng(y * 13);
    for (let r = 0; r < seatsRows; r++) {
      const off = 0.9 + r * 1.0,
        ra = ia + off,
        rb = ib + off;
      const pts = [];
      for (let z = ZS + 2; z < AZB; z += 0.62) pts.push([ra, z]);
      const n = Math.round((PI * (ra + rb)) / 2 / 0.62);
      for (let k = 0; k <= n; k++) {
        const a = (k / n) * PI;
        pts.push([ra * Math.cos(a), AZB + rb * Math.sin(a)]);
      }
      for (let z = AZB; z > ZS + 2; z -= 0.62) pts.push([-ra, z]);
      for (const [x, z] of pts) {
        if (Math.abs(x) > AX - 0.4 || z > AZE - 0.5 || rn() < 0.1) continue;
        if (o.skipSeat && o.skipSeat(x, z)) continue;
        const ry = Math.atan2(0 - x, -30 - z) + PI;
        const M = P.m4(x, y, z, ry);
        b.geo(
          "velvet",
          new THREE.BoxGeometry(0.46, 0.1, 0.42).translate(0, 0.42, 0),
          M,
          { noAO: true, grime: 0.35 },
        );
        b.geo(
          "velvet",
          new THREE.BoxGeometry(0.48, 0.5, 0.08).translate(0, 0.72, 0.2),
          M,
          { noAO: true, grime: 0.35 },
        );
        b.geo(
          "iron",
          new THREE.BoxGeometry(0.05, 0.42, 0.4).translate(0.26, 0.21, 0),
          M,
          { noAO: true },
        );
      }
    }
    return inner;
  }

  function buildInterior() {
    const O = P.I("carnegie_hall");
    const S = P.site("carnegie_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x7a6650,
      ambI: 0.4,
      interiorKey: "carnegie_hall",
    });
    const b = S.b;
    // ---------------- lobby ----------------
    S.room({
      x0: -14,
      z0: 16,
      x1: 14,
      z1: 30,
      y: 0,
      h: 7,
      wall: "plaster_cream",
      floor: "marble",
      ceil: "plaster_cream",
      holes: { w: [[18, 22, 0, 3]] },
      skip: "n",
      trim: "gold",
    });
    S.wallX("plaster_cream", 16, -14.15, 14.15, 0, 7, 0.3, [
      [-9, -6, 0, 3.2],
      [6, 9, 0, 3.2],
      [-1.6, 1.6, 0, 3.2],
    ]);
    D.rug(b, -3, 17, 3, 29.5, 0.01, "carpet_red");
    for (const x of [-10, -4, 4, 10]) {
      b.box("terracotta", x - 0.4, 0, 29.6, x + 0.4, 7, 30, { seg: false });
    }
    D.exitDoor(S, 0, 0, 29.82, PI, {
      leaf: "wood_dark",
      frame: "gold",
      w: 2.6,
      h: 3.0,
      text: "EXIT",
      sub: "57th STREET",
    }); // the way back out, under the lobby's south arcade
    // box office (east)
    b.box("wood_dark", 10, 0, 18, 13.8, 2.6, 24, { segLen: 2 });
    b.box("glass", 9.98, 1.1, 18.4, 10.0, 2.4, 23.6, { seg: false });
    for (let z = 18.6; z < 23.6; z += 0.2)
      b.box("gold", 9.96, 1.1, z - 0.01, 9.98, 2.4, z + 0.01, { seg: false });
    b.box("marble_dark", 9.6, 1.0, 20, 10.1, 1.08, 22, { seg: false });
    S.col(10, 0, 18, 13.8, 2.6, 24, { walkable: false });
    const bo = P.texMat(
      "carn_boxoffice",
      P.signTex("carn_boxoffice", ["BOX OFFICE"], "gilt", 512, 96),
      { rough: 0.5 },
    );
    b.quad(bo, 9.95, 3.0, 21, 2.2, 0.42, { ry: -HP });
    S.anchor("vendor", 9.2, 0, 21, HP);
    // bust of the founder on a pedestal, off the entrance axis (it used to stand 3 m in front of the arrival point,
    // a black block filling the first view of the lobby) — faces the entrance across the red runner
    {
      const bx = -7.2,
        bz = 21.4;
      b.box(
        "marble_dark",
        bx - 0.45,
        0,
        bz - 0.45,
        bx + 0.45,
        0.12,
        bz + 0.45,
        { seg: false },
      );
      b.box(
        "marble_dark",
        bx - 0.34,
        0.12,
        bz - 0.34,
        bx + 0.34,
        1.2,
        bz + 0.34,
        { seg: false },
      );
      b.box("gold", bx - 0.4, 1.2, bz - 0.4, bx + 0.4, 1.28, bz + 0.4, {
        seg: false,
      });
      b.sphere("bronze", bx, 1.42, bz, 0.4, {
        sx: 1,
        sy: 0.42,
        sz: 0.55,
        ws: 16,
        hs: 10,
      }); // shoulders & chest
      b.cyl("bronze", bx, 1.5, bz, 0.085, 0.1, 0.22, 10); // neck
      b.sphere("bronze", bx, 1.84, bz, 0.165, { sy: 1.22, ws: 14, hs: 10 }); // head
      b.sphere("bronze", bx, 1.73, bz + 0.07, 0.135, {
        sy: 0.95,
        sz: 0.8,
        ws: 12,
        hs: 8,
      }); // the famous beard
      b.sphere("bronze", bx, 1.9, bz - 0.02, 0.172, {
        sy: 0.9,
        p0: 0,
        pl: TAU,
        t0: 0,
        tl: PI * 0.45,
        ws: 14,
        hs: 6,
      }); // hair
      S.col(bx - 0.45, 0, bz - 0.45, bx + 0.45, 1.3, bz + 0.45, {
        walkable: false,
      });
      D.label(
        b,
        "founder",
        [
          "ANDREW CARNEGIE",
          "1835 · 1919",
          '"Music is the one thing that is enough."',
        ],
        bx,
        0.75,
        bz + 0.35,
        0.62,
        0.3,
        0,
        "label",
      );
    }
    // concert posters on the north wall piers (they used to hang across the west doorway to the stair hall)
    [-11.6, -3.8, 3.8, 11.6].forEach((x, i) => {
      const pk = P.texMat("carn_p" + i, posterTex(i), { rough: 0.9 });
      b.box("gold", x - 0.72, 1.05, 16.15, x + 0.72, 3.15, 16.2, {
        seg: false,
      });
      b.quad(pk, x, 2.1, 16.215, 1.3, 1.95, { ry: 0 });
    });
    // lobby architecture (Carnegie's white-and-gold Renaissance lobby): dark marble dado, fluted plaster pilasters
    // with gilt capitals on the long walls, a gilt entablature and a coffered ceiling grid
    for (const [x0, z0, x1, z1] of [
      [-13.86, 16.3, -13.7, 18],
      [-13.86, 22, -13.7, 24.4],
      [13.7, 16.3, 13.86, 18],
      [13.7, 24.1, 13.86, 29.7],
      [-14, 16.16, -9, 16.3],
      [-6, 16.16, -1.6, 16.3],
      [1.6, 16.16, 6, 16.3],
      [9, 16.16, 14, 16.3],
    ]) {
      b.box("marble_dark", x0, 0, z0, x1, 1.0, z1, { segLen: 3 });
      b.box(
        "gold",
        Math.min(x0, x1) - 0.02,
        1.0,
        Math.min(z0, z1),
        Math.max(x0, x1) + 0.02,
        1.07,
        Math.max(z0, z1),
        { seg: false },
      );
    }
    for (const [x, zs, s] of [
      [-13.85, [17, 23], 1],
      [13.85, [17, 25.4, 28.8], -1],
    ])
      for (const z of zs) {
        b.box("plaster_cream", x, 0, z - 0.38, x + s * 0.2, 5.5, z + 0.38, {
          seg: false,
        });
        for (const dz of [-0.2, 0, 0.2])
          b.box(
            "plaster",
            x + s * 0.2,
            1.1,
            z + dz - 0.03,
            x + s * 0.23,
            5.0,
            z + dz + 0.03,
            { seg: false },
          ); // flutes
        b.box("marble_dark", x, 0, z - 0.45, x + s * 0.26, 0.5, z + 0.45, {
          seg: false,
        });
        b.box("gold", x, 5.0, z - 0.45, x + s * 0.3, 5.5, z + 0.45, {
          seg: false,
        });
      }
    for (const [x0, z0, x1, z1] of [
      [-13.85, 16.3, -13.55, 29.7],
      [13.55, 16.3, 13.85, 29.7],
      [-13.85, 16.3, 13.85, 16.6],
      [-13.85, 29.4, 13.85, 29.7],
    ]) {
      b.box("plaster_cream", x0, 5.5, z0, x1, 6.3, z1, { seg: false });
      b.box("gold", x0 - 0.03, 6.25, z0 - 0.03, x1 + 0.03, 6.4, z1 + 0.03, {
        seg: false,
      });
    }
    for (let x = -12; x <= 12; x += 4)
      b.box("plaster", x - 0.15, 6.55, 16.3, x + 0.15, 7, 29.7, {
        seg: false,
        noAO: true,
      });
    for (let z = 18.5; z < 29.5; z += 3.5)
      b.box("plaster", -13.85, 6.55, z - 0.15, 13.85, 7, z + 0.15, {
        seg: false,
        noAO: true,
      });
    for (let x = -10; x <= 10; x += 4)
      for (let z = 20.25; z < 29.5; z += 3.5)
        if (!(Math.abs(x) < 3 && Math.abs(z - 23) < 2.5))
          b.sphere("gold", x, 6.93, z, 0.16, { ws: 6, hs: 4, noAO: true });
    for (const x of [-8, 8])
      D.chandelier(S, x, 6.6, 23, 0.7, {
        tiers: 1,
        lr: 7,
        li: 0.7,
        chain: 0.5,
      });
    D.chandelier(S, 0, 6.6, 23, 1.0, { tiers: 2, lr: 11, li: 1.1, chain: 0.6 });
    D.sconce(S, 13.83, 3.2, 27, -HP, { r: 5, i: 0.6 });
    D.sconce(S, -13.83, 3.2, 27, HP, { r: 5, i: 0.6 });
    S.anchor("entrance", 0, 0, 28, 0);
    S.anchor("lobby", 0, 0, 22, PI);
    // the Consort lives here: coat check turned gun check, laundry lines, bedrolls, music stands
    b.box("wood_dark", -13.8, 0, 24.6, -11.6, 1.1, 28.6, { segLen: 2 });
    b.box("marble_dark", -13.9, 1.1, 24.5, -11.5, 1.17, 28.7, { seg: false });
    S.col(-13.9, 0, 24.5, -11.5, 1.17, 28.7, { walkable: false });
    for (let k = 0; k < 7; k++)
      b.rod(
        "iron",
        [-13.75, 1.2, 24.9 + k * 0.55],
        [-13.75, 2.6, 24.9 + k * 0.55],
        0.012,
        3,
      ); // coat hooks
    for (let k = 0; k < 4; k++)
      b.box(
        k % 2 ? "rust" : "iron",
        -13.72,
        1.5,
        25.1 + k * 1.0,
        -13.62,
        2.3,
        25.2 + k * 1.0,
        { rz: 0.1, seg: false },
      ); // rifles hung on the hooks
    const gc = P.texMat(
      "carn_guncheck",
      P.signTex(
        "carn_guncheck",
        ["GUN CHECK", "Firearms surrendered here", "Returned after the encore"],
        "gilt",
        512,
        200,
      ),
      { rough: 0.5 },
    );
    b.quad(gc, -11.48, 2.1, 26.6, 1.3, 0.5, { ry: HP });
    S.anchor("npc2", -10.6, 0, 26.6, -HP);
    for (const [z, n] of [[27.4, 4]]) {
      // laundry line over the Consort's corner (kept clear of the doorways and the exit)
      b.rod("iron", [-10, 3.4, z], [-3, 3.4, z], 0.01, 3);
      for (let k = 0; k < n; k++) {
        const x = -9 + k * (5.6 / n);
        b.quad(
          ["fabric", "fabric_white", "velvet", "fabric_pink"][k % 4],
          x,
          2.95,
          z,
          0.8,
          0.9,
          { uv: "box", noAO: true, grime: 0.5, rz: ((k % 3) - 1) * 0.05 },
        );
        b.quad(
          ["fabric", "fabric_white", "velvet", "fabric_pink"][k % 4],
          x,
          2.95,
          z,
          0.8,
          0.9,
          { uv: "box", noAO: true, grime: 0.5, ry: PI },
        );
      }
    }
    for (const [x, z, r] of [
      [11.8, 25.6, HP],
      [11.8, 27.8, HP],
    ])
      S.prop("mattress", x, 0, z, r, {});
    for (let k = 0; k < 5; k++) {
      const x = -6 + k * 3,
        z = 17.2 + (k % 2) * 0.6;
      b.rod("iron", [x, 0, z], [x, 1.15, z], 0.015, 3);
      b.box("iron", x - 0.28, 1.1, z - 0.02, x + 0.28, 1.45, z + 0.02, {
        rx: -0.25,
        seg: false,
      });
      b.box("paper", x - 0.25, 1.13, z + 0.01, x + 0.25, 1.43, z + 0.03, {
        rx: -0.25,
        seg: false,
      });
    }
    D.papers(b, 5, 0, 20, 3, 18);
    D.candles(S, 12.8, 0, 29, 4, { r: 5, i: 0.6 });
    const wel = P.texMat(
      "carn_welcome",
      P.signTex(
        "carn_welcome",
        ["THE CARNEGIE CONSORT", "WELCOMES YOU"],
        "gilt",
        1024,
        200,
      ),
      { rough: 0.5, emissive: 0.15 },
    );
    b.quad(wel, 0, 4.1, 16.17, 3.6, 0.7, { ry: 0 });
    // ---------------- west stair hall ----------------
    const WX0 = -22,
      WX1 = -14.3;
    S.room({
      x0: WX0,
      z0: 16,
      x1: WX1,
      z1: 30,
      y: 0,
      h: 12,
      wall: "plaster_red",
      floor: "marble",
      ceil: "plaster_cream",
      skip: "ne",
    });
    S.stairs("marble", -16.4, 29.5, "n", 2.4, 0, 4, {
      run: 0.3,
      rail: "gold",
      railSides: [-1],
      nosing: "carpet_red",
    });
    S.floor("marble", WX0, 16, WX1, 24.3, 4, { t: 0.35 });
    S.stairs("marble", -20.6, 17.4, "s", 2.4, 4, 7.5, {
      run: 0.3,
      rail: "gold",
      railSides: [1],
      nosing: "carpet_red",
    });
    S.floor("marble", WX0, 22.0, WX1, 30, 7.5, { t: 0.35 });
    S.floor("marble", -17.6, 16, WX1, 22.0, 7.5, { t: 0.35 });
    // (a rail along x −19.1 on the First Tier landing cut the landing in two: the tier door and the second flight were unreachable)
    S.rail(
      "gold",
      [
        [-17.6, 16.3],
        [-17.6, 22.0],
        [-19.2, 22.0],
      ],
      7.5,
      1.0,
      { r: 0.04 },
    );
    S.rail(
      "gold",
      [
        [-17.7, 24.3],
        [-17.7, 29.8],
      ],
      4,
      1.0,
      { r: 0.04 },
    );
    for (const y of [4, 7.5])
      D.sconce(S, WX0 + 0.16, y + 2.4, 20, HP, { r: 6, i: 0.8 });
    D.sconce(S, WX0 + 0.16, 2.2, 27, HP, { r: 6, i: 0.8 });
    const tierSign = P.texMat(
      "carn_tiers",
      P.signTex(
        "carn_tiers",
        ["FIRST TIER ↑", "DRESS CIRCLE ↑↑", "BALCONY — CLOSED"],
        "gilt",
        512,
        256,
      ),
      { rough: 0.5 },
    );
    b.quad(tierSign, -14.47, 2.2, 26.5, 1.4, 0.7, { ry: -HP });
    S.anchor("stairs", -16.4, 0, 28, 0);
    // ---------------- Stern Auditorium ----------------
    const AX = 22,
      ZB = -40,
      ZF = 16,
      AH = 16.5;
    S.floor("parquet", -AX, -26, AX, ZF, 0, { surface: "wood" });
    S.wallZ("plaster_cream", -AX, ZB, ZF, 0, AH, 0.4, []);
    S.wallZ("plaster_cream", AX, ZB, ZF, 0, AH, 0.4, []);
    S.wallX("plaster_cream", ZF, -AX - 0.2, AX + 0.2, 7, AH, 0.4, [
      [-17.4, -15.4, 0.5, 3.2],
    ]);
    S.wallZ("plaster_red", -14.3, 16, 30, 7, 12, 0.3, []);
    S.wallX("plaster_cream", ZF, -AX - 0.2, -14.2, 0, 7, 0.4, [
      [-21.5, -18.5, 4, 6.7],
    ]);
    S.wallX("plaster_cream", ZF, 14.2, AX + 0.2, 0, 7, 0.4, []);
    S.ceil("plaster_cream", -AX, ZB, AX, ZF, AH);
    // ornamental ceiling: oval coffer rings + a ring of lamps
    for (const r of [5, 8, 11])
      b.geo(
        "gold",
        new THREE.TorusGeometry(r, 0.12, 4, 40).rotateX(HP).scale(1.25, 1, 1),
        P.m4(0, AH - 0.15, -6),
        { noAO: true },
      );
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU,
        x = Math.cos(a) * 8 * 1.25,
        z = -6 + Math.sin(a) * 8;
      b.sphere("lamp_dim", x, AH - 0.35, z, 0.18, { ws: 8, hs: 6 });
      S.light(x, AH - 1.2, z, 0xffe0b0, 9, 0.5);
    }
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU;
      S.glow(Math.cos(a) * 10, AH - 0.4, -6 + Math.sin(a) * 8, 0xffe0b0, 0.5);
    }
    for (const s of [-1, 1])
      for (let z = -20; z <= 12; z += 6.5)
        D.sconce(S, s * (AX - 0.22), 2.5, z, s > 0 ? -HP : HP, {
          r: 6,
          i: 0.7,
          size: 0.4,
        });
    // tiers: First Tier (boxes), Dress Circle, Balcony
    const T1 = 4,
      T2 = 7.5,
      T3 = 11;
    tier(S, T1, 3.6, 2, { skipSeat: (x, z) => z > 14 && x < -14 });
    tier(S, T2, 3.2, 2, { skipSeat: (x, z) => z > 13.5 && x < -14 });
    tier(S, T3, 4.2, 3, {});
    // box partitions on the First Tier
    for (let z = -22; z < 4; z += 2.6)
      for (const s of [-1, 1]) {
        b.box(
          "plaster_cream",
          s * AX - s * 3.6,
          T1,
          z - 0.05,
          s * AX,
          T1 + 1.9,
          z + 0.05,
          { seg: false },
        );
      }
    // tier access doors (west stair hall side)
    // (the pair of leaves stands OPEN against the jambs — a closed leaf drawn across the opening had no collider,
    //  so the player walked through a solid-looking door)
    for (const x of [-21.42, -18.62]) {
      b.box("wood_dark", x - 0.03, T1, 14.45, x + 0.03, T1 + 2.65, 15.78, {
        seg: false,
      });
      b.box("gold", x - 0.05, T1 + 1.0, 14.6, x + 0.05, T1 + 1.08, 14.9, {
        seg: false,
      });
    }
    // stage + proscenium
    const SY = 1.2;
    b.box("wood_dark", -15, 0, ZB, 15, SY, -26);
    S.col(-15, 0, ZB, 15, SY, -26, { surface: "wood" });
    b.box("wood", -15, SY - 0.02, ZB, 15, SY, -26, { segLen: 2, uvScale: 2 });
    S.stairs("wood_dark", 0, -25.2, "n", 4, 0, SY, { run: 0.28 });
    for (let x = -14; x <= 14; x += 0.9)
      b.box("lamp", x - 0.15, SY - 0.1, -26.05, x + 0.15, SY, -25.95, {
        seg: false,
      });
    S.light(0, SY + 0.6, -27, 0xffd8a0, 16, 1.2);
    S.light(0, 3, -10, 0xffe0b0, 18, 0.6);
    // stage walls + the rounded proscenium shell
    S.wallZ("plaster_cream", -15, ZB, -26, 0, AH, 0.4, [
      [-38.5, -36.5, SY, SY + 2.6],
    ]);
    S.wallZ("plaster_cream", 15, ZB, -26, 0, AH, 0.4, [
      [-38.5, -36.5, SY, SY + 2.6],
    ]);
    S.wallX("plaster_cream", ZB, -15.2, 15.2, 0, AH, 0.4, [
      [-12, -10, SY, SY + 2.6],
      [10, 12, SY, SY + 2.6],
    ]);
    for (const x of [-AX, AX])
      b.box(
        "plaster_cream",
        Math.min(x, x > 0 ? 15 : -15),
        0,
        -26.4,
        Math.max(x, x > 0 ? 15 : -15),
        AH,
        -25.8,
      );
    for (const s of [-1, 1])
      S.col(
        Math.min(s * AX, s * 15),
        0,
        -26.4,
        Math.max(s * AX, s * 15),
        AH,
        -25.8,
        { walkable: false },
      );
    b.geo(
      "gold",
      new THREE.TorusGeometry(15, 0.45, 6, 30, PI).scale(1, 0.62, 1),
      P.m4(0, 6.2, -26.0),
      { noAO: true },
    );
    b.geo(
      "gold",
      new THREE.TorusGeometry(14.2, 0.2, 5, 30, PI).scale(1, 0.62, 1),
      P.m4(0, 6.2, -25.8),
      { noAO: true },
    );
    {
      const sh = new THREE.Shape();
      sh.moveTo(-15.2, 0);
      sh.lineTo(-15.2, 16.5);
      sh.lineTo(15.2, 16.5);
      sh.lineTo(15.2, 0);
      sh.absarc(0, 0, 15.2, 0, PI, false);
      b.extrude(
        "plaster_cream",
        sh,
        0.6,
        P.m4(0, 6.2, -26.4, 0, 0, 0, 1, 0.62, 1),
      );
    }
    for (const s of [-1, 1])
      b.box("gold", s * 15.2 - 0.3, 0, -26.2, s * 15.2 + 0.3, 6.2, -25.7, {
        seg: false,
      });
    // stage back: organ pipes + orchestra shell
    D.organ(b, 0, SY, ZB + 0.4, 18, 8, 0);
    S.col(-9.5, SY, ZB, 9.5, SY + 9, ZB + 1.0, { walkable: false });
    for (let x = -12; x <= 12; x += 3)
      for (let z = -35; z <= -29; z += 2.5) {
        if (Math.abs(x) < 3 && z > -31) continue;
        D.chair(b, x, SY, z, 0, { wood: "iron", seat: "velvet" });
        b.rod("iron", [x, SY, z - 0.55], [x, SY + 1.05, z - 0.55], 0.012, 3);
        b.box(
          "paper",
          x - 0.25,
          SY + 0.95,
          z - 0.57,
          x + 0.25,
          SY + 1.3,
          z - 0.54,
          { rx: 0.3, seg: false },
        );
      }
    D.piano(b, -6.5, SY, -31.5, 0.35, { key: "paint_black" });
    b.box("wood_dark", -0.6, SY, -28.2, 0.6, SY + 0.3, -27.2, { seg: false }); // conductor's podium
    b.rod("iron", [0, SY + 0.3, -28.0], [0, SY + 1.4, -28.3], 0.015, 3);
    b.box("paper", -0.35, SY + 1.3, -28.35, 0.35, SY + 1.7, -28.3, {
      rx: 0.4,
      seg: false,
    });
    for (let k = 0; k < 3; k++) {
      b.cyl("wood", 7 + k * 1.3, SY, -36.5, 0.28, 0.28, 0.9, 10, { rx: 0.15 });
    } // timpani
    b.box("wood_dark", 10, SY, -34, 11, SY + 1.9, -33.6, { seg: false }); // double bass
    S.light(0, 9, -32, 0xffe8c8, 18, 1.0);
    // house seats on the parquet
    // Parquet in two banks per side with a cross aisle (z −6.9..−3.4) between them; each bank is ONE solid
    // collider (seat rows are 0.55 m apart — nobody fits between them), so the player, Clara, the cellist and
    // the roamers use the centre aisle, the side aisles along the walls and the cross aisle, as in a real hall.
    const banks = [
      [-22, -7.3],
      [-3.2, 12.2],
    ];
    for (const [za, zb] of banks) {
      let zl = za;
      for (let z = za; z <= zb; z += 1.05) {
        D.seatRow(b, -18.5, -2.4, 0, z, PI, { missing: 0.12 });
        D.seatRow(b, 2.4, 18.5, 0, z, PI, { missing: 0.12 });
        zl = z;
      }
      for (const s of [-1, 1])
        S.col(
          s < 0 ? -18.5 : 2.4,
          0,
          za - 0.3,
          s < 0 ? -2.4 : 18.5,
          1.0,
          zl + 0.35,
          { walkable: false, surface: "wood" },
        );
    }
    // aisle runners (worn red carpet) so the walkable routes read from the doors
    b.box("carpet_red", -1.1, 0.005, -22.5, 1.1, 0.02, 14.5, {
      seg: false,
      grime: 0.7,
    });
    b.box("carpet_red", -21.4, 0.005, -6.6, 21.4, 0.02, -3.7, {
      seg: false,
      grime: 0.7,
    });
    // dress the parquet: a collapsed chunk of the balcony, papers, programs
    D.rubble(S, 14, 0, 8, 2.4, { n: 12, slab: true, slabKey: "plaster_cream" });
    b.box("carpet_red", 11, 0, 5, 16, 0.45, 9, {
      rz: 0.25,
      ry: 0.4,
      seg: false,
    });
    D.papers(b, 0, 0, 0, 8, 26);
    S.anchor("auditorium", 0, 0, 2, PI);
    S.anchor("maestro", 0, SY + 0.3, -27.7, PI);
    S.anchor("pianist", -7.3, SY, -32.2, 0.35 + PI);
    S.anchor("violinist", -3, SY, -32.5, PI);
    S.anchor("cellist", 3, SY, -32.5, PI);
    S.anchor("seat", 0, 0, -12, PI);
    S.anchor("tier1", -15, T1, 10, PI);
    // ---------------- backstage (y = stage level) ----------------
    const BY = SY,
      BZ0 = -52;
    S.room({
      x0: -22,
      z0: BZ0,
      x1: -6,
      z1: ZB,
      y: BY,
      h: 4.2,
      wall: "brick_red",
      floor: "wood",
      ceil: "concrete",
      skip: "se",
      surface: "wood",
    }); // east/west party walls (with doors) built below
    S.room({
      x0: -6,
      z0: BZ0,
      x1: 8,
      z1: ZB,
      y: BY,
      h: 4.2,
      wall: "concrete",
      floor: "concrete",
      ceil: "concrete",
      skip: "swe",
    });
    S.room({
      x0: 8,
      z0: BZ0,
      x1: 22,
      z1: ZB,
      y: BY,
      h: 4.2,
      wall: "wood_oak",
      floor: "carpet",
      ceil: "plaster_cream",
      skip: "sw",
      surface: "carpet",
    });
    S.wallZ("brick_red", -6, BZ0, ZB, BY, BY + 4.2, 0.3, [[-47, -45, 0, 2.4]]);
    S.wallZ("wood_oak", 8, BZ0, ZB, BY, BY + 4.2, 0.3, [[-47, -45, 0, 2.4]]);
    S.floor("wood", -22, ZB, -15, -26, BY, { surface: "wood" });
    S.floor("wood", 15, ZB, 22, -26, BY, { surface: "wood" });
    // green room: the Consort's commune
    for (let k = 0; k < 4; k++) {
      D.bed(b, -20.5 + k * 3.3, BY, -50.8, 0, {
        w: 1.0,
        wood: "wood_rotten",
        cover: ["fabric", "velvet", "fabric_white", "fabric_pink"][k],
      });
    }
    S.prop("campfire", -14, BY, -45, 0, {});
    S.light(-14, BY + 1.0, -45, 0xff9a40, 9, 1.1);
    S.glow(-14, BY + 0.6, -45, 0xff9040, 1.0);
    for (let k = 0; k < 8; k++) {
      const x = -21 + k * 2;
      b.sphere(
        k % 3 === 1 ? "glass_dark" : "lamp",
        x,
        BY + 3.6 - Math.sin((k / 7) * PI) * 0.4,
        -43,
        0.07,
        { ws: 5, hs: 4 },
      );
    }
    b.rod("iron", [-21, BY + 3.6, -43], [-7, BY + 3.6, -43], 0.008, 3);
    for (let k = 0; k < 4; k++)
      S.light(-19 + k * 4, BY + 3.2, -43, 0xffd890, 5, 0.45);
    for (let k = 0; k < 5; k++)
      b.box(
        "leather",
        -21.5,
        BY,
        -48 + k * 0.9,
        -20.4,
        BY + 0.35,
        -47.3 + k * 0.9,
        { ry: 0.1 * k, seg: false },
      ); // instrument cases
    b.cyl("wood", -18.5, BY, -41.2, 0.35, 0.3, 1.1, 8); // cello by the wall
    S.prop("workbench", -8.2, BY, -50.9, 0, {});
    S.prop("footlocker", -21.3, BY, -41, HP, {
      loot: "footlocker",
      owner: "settlers",
    });
    S.anchor("violinist_home", -16, BY, -47, 0);
    S.anchor("greenroom", -14, BY, -47, 0);
    S.anchor("npc1", -18, BY, -46, HP);
    // dynamo room
    b.geo(
      "paint_green",
      new THREE.CylinderGeometry(1.4, 1.4, 3.0, 16).rotateZ(HP),
      P.m4(1, BY + 1.6, -48),
      {},
    );
    b.geo(
      "chrome",
      new THREE.CylinderGeometry(0.5, 0.5, 3.4, 12).rotateZ(HP),
      P.m4(1, BY + 1.6, -48),
      {},
    );
    b.box("iron", -1.2, BY, -49.6, 3.2, BY + 0.4, -46.4, { seg: false });
    b.box("panel", 4.5, BY, -51.6, 7.6, BY + 2.4, -51.0, { seg: false });
    for (let k = 0; k < 6; k++)
      b.box(
        k < 2 ? "lamp_green" : "glass_dark",
        4.9 + k * 0.45,
        BY + 1.7,
        -50.98,
        5.2 + k * 0.45,
        BY + 1.9,
        -50.95,
        { seg: false },
      );
    for (let k = 0; k < 3; k++)
      b.rod(
        "rubber",
        [3.2, BY + 1.6 + k * 0.1, -48],
        [4.6, BY + 2.2, -51.0],
        0.03,
        4,
      );
    S.col(-1.2, BY, -49.7, 3.2, BY + 3.0, -46.3, { walkable: false });
    S.col(4.5, BY, -51.7, 7.6, BY + 2.4, -50.9, { walkable: false });
    const dyn = P.texMat(
      "carn_dynamo",
      P.signTex(
        "carn_dynamo",
        ["STAGE DYNAMO No. 2", "Westinghouse Electric", "DANGER · 440 VOLTS"],
        "brass",
        512,
        192,
      ),
      { rough: 0.4, metal: 0.5 },
    );
    b.quad(dyn, 1, BY + 1.6, -46.58, 1.6, 0.6, { ry: 0 });
    b.box("lamp", -3, BY + 4.1, -46, -1, BY + 4.15, -45.8, { seg: false });
    S.light(-2, BY + 3.4, -46, 0xe0f0e0, 8, 0.7);
    S.anchor("dynamo", 1, BY, -45.6, PI);
    S.anchor("stagehand", 3, BY, -44.5, PI);
    S.prop("toolbox", -5.3, BY, -41, HP, {
      loot: "toolbox",
      owner: "settlers",
    });
    // Maestro's office
    S.prop("desk", 15, BY, -50.8, 0, { loot: "desk", owner: "settlers" });
    S.prop("terminal", 15.6, BY + 0.78, -51.0, 0, {
      terminalId: "pu_carnegie_stage",
      mount: "bare",
    });
    S.prop("bed", 20.5, BY, -48, -HP, { name: "Maestro's Cot", owned: false });
    D.bookcase(b, 10, BY, -51.75, 0, { w: 2.6, h: 2.4 });
    D.painting(b, 21.83, BY + 2.2, -44, 1.2, 1.5, -HP, 1);
    for (let k = 0; k < 10; k++)
      b.box(
        "paper",
        12 + (k % 5) * 0.7,
        BY + 0.01,
        -44 - Math.floor(k / 5) * 0.8,
        12.5 + (k % 5) * 0.7,
        BY + 0.03,
        -43.4 - Math.floor(k / 5) * 0.8,
        { ry: k, seg: false },
      );
    D.candles(S, 14.5, BY + 0.78, -51.2, 3, { r: 5, i: 0.8 });
    S.light(15, BY + 3.2, -46, 0xffd8a0, 8, 0.6);
    S.pickup("pu_note_bell", 1, 14.2, BY + 0.79, -50.6);
    S.anchor("office", 15, BY, -46, 0);
    // hostile spawn spots (contract: every interior)
    [
      [4, 0, 22, PI],
      [-6, 0, -5.2, PI],
      [20.2, 0, -16, PI],
      [0, SY, -30, 0],
      [-12, BY, -44, 0],
      [-18, 4, 20, 0],
    ].forEach((p, i) => S.anchor("spawn" + (i + 1), p[0], p[1], p[2], p[3]));
    b.ground = 0;
    S.build({ interior: true });
    P.addInterior("carnegie_hall", S.root);
    // concert stage glows (toggled during the performance)
    const concert = new THREE.Group();
    concert.name = "carn_concert";
    concert.visible = false;
    S.root.add(concert);
    P.carnegieConcert = {
      group: concert,
      stage: S.W(0, SY + 2, -32),
      glows: [],
    };
    if (!G.isStub("fx") && G.fx.glowSprite) {
      for (let k = -2; k <= 2; k++)
        P.carnegieConcert.glows.push(
          G.fx.glowSprite(S.W(k * 5, 12, -18), 0xffe8c0, 2.4, {
            parent: concert,
            intensity: 1.4,
            dayFactor: 1,
          }),
        );
      for (let k = -6; k <= 6; k++)
        P.carnegieConcert.glows.push(
          G.fx.glowSprite(S.W(k * 2.2, SY + 0.25, -26.1), 0xffd8a0, 0.7, {
            parent: concert,
            intensity: 1.2,
            dayFactor: 1,
          }),
        );
    }
    return S;
  }

  // ===================================================================
  // Street <-> interior doors & registration — called by 40_carnegie.js's builder right
  // after buildExterior() (E = its site context).
  // ===================================================================
  P.interiorBuilders.carnegie_hall = function (EX) {
    const E = EX.S;
    const I = buildInterior();
    const O = P.I("carnegie_hall");
    E.door(
      EX.doorX,
      1.6,
      EX.doorZ + 0.8,
      "Carnegie Hall",
      { x: O.x, y: O.y, z: O.z + 28, yaw: 0 },
      {
        radius: 1.8,
        onEnter: () => P.safe("disc", () => G.discover("carnegie_hall")),
      },
    );
    I.door(
      0,
      1.5,
      29.6,
      "57th Street",
      { x: EX.doorX, y: 0, z: EX.doorZ + 3.2, yaw: PI },
      { verb: "Exit", radius: 1.6 },
    );
    P.register("carnegie_hall", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "carnegie_hall",
      anchors: Object.assign({}, E.anchors, I.anchors),
    });
  };
})();
