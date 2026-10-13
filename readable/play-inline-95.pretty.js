/* src/map/50_cryo.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 50 CRYO UNIT C-9 (shared helpers + street door)
 * Project Long Winter's secret cryo sub-basement under the Manhattan
 * Municipal Building. This file holds what the cell (50_cryo_interior.js)
 * and the street share:
 *   - the enamel sign atlas `my/cryosigns` + `M.cryoSign(text, …)`
 *   - the Long Winter / Office of Civil Defense emblem `my/cdlogo` + `M.cryoLogo`
 *   - the anchor record `M.cryoAnchors` (ext_* keys are world coordinates)
 *   - the street side: a steel service door with a stencilled warning in the
 *     west wall of the Municipal Building's Chambers Street arch
 *     (`M.buildCryoStreetDoor`, called by M.buildCryo)
 *   - `M.skeleton` (static remains, also used by the park set pieces)
 * The interior cell, the blast door and the street <-> cell doors live in
 * 50_cryo_interior.js.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  const LAYER = "cryo"; // default layer of the shared sign/logo emitters (the interior cell)
  M.cryoAnchors = M.cryoAnchors || {}; // shared anchor record (filled by both cryo files)
  M.anchors = M.anchors || {};

  // -------------------------------------------------------------------
  // Emblem: the Office of Civil Defense triangle-in-a-circle with the
  // Long Winter snowflake in the triangle (white enamel, orange & black).
  // -------------------------------------------------------------------
  M.defineAtlas("cdlogo", function () {
    const S = 512,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const c = S / 2;
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = "#e9e6dc";
    ctx.beginPath();
    ctx.arc(c, c, 240, 0, 7);
    ctx.fill();
    ctx.strokeStyle = "#1b1d1f";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(c, c, 222, 0, 7);
    ctx.stroke();
    ctx.fillStyle = "#d0682a";
    ctx.beginPath();
    ctx.moveTo(c, c - 190);
    ctx.lineTo(c + 166, c + 100);
    ctx.lineTo(c - 166, c + 100);
    ctx.closePath();
    ctx.fill();
    // snowflake
    ctx.strokeStyle = "#e9e6dc";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    const fy = c + 8;
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3,
        ex = c + Math.cos(a) * 74,
        ey = fy + Math.sin(a) * 74;
      ctx.beginPath();
      ctx.moveTo(c, fy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      for (const s of [-1, 1]) {
        const bx = c + Math.cos(a) * 46,
          by = fy + Math.sin(a) * 46;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(
          bx + Math.cos(a + s * 0.8) * 22,
          by + Math.sin(a + s * 0.8) * 22,
        );
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#1b1d1f";
    ctx.font = 'bold 44px "Arial Black", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LONG WINTER", c, c + 160, 300);
    // wear
    const r = M.rng("cdlogo");
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 220; i++) {
      ctx.globalAlpha = r() * 0.45;
      ctx.fillRect(r() * S, r() * S, 2 + r() * 12, 1 + r() * 5);
    }
    ctx.restore();
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, transparent: true, alphaTest: 0.1, roughness: 0.55 };
  });

  // -------------------------------------------------------------------
  // Enamel signs (white plates, black lettering; hazard ones orange)
  // -------------------------------------------------------------------
  const CSIGNS = [
    "CRYO UNIT C-9",
    "POD BAY",
    "DIRECTOR'S OFFICE",
    "INFIRMARY",
    "MAINTENANCE",
    "SECURITY",
    "SUIT PREP",
    "COMPUTER ROOM",
    "BLAST DOOR",
    "EXIT",
    "DANGER · COOLANT",
    "AUTHORIZED PERSONNEL ONLY",
    "PROJECT LONG WINTER",
    "SERVICE STAIR",
    "MUNICIPAL BLDG · SUB-BASEMENT 3",
    "SLEEP SAFE. WAKE STRONG.",
  ];
  M.defineAtlas("cryosigns", function () {
    const cols = 2,
      rows = 8,
      CW = 512,
      CH = 128;
    const cv = M.canvas(cols * CW, rows * CH),
      ctx = cv.getContext("2d");
    const r = M.rng("cryosigns");
    CSIGNS.forEach((txt, i) => {
      const x = (i % cols) * CW,
        y = Math.floor(i / cols) * CH;
      const danger = /DANGER|AUTHORIZED|BLAST/.test(txt);
      ctx.fillStyle = danger ? "#d0682a" : "#e6e2d6";
      ctx.fillRect(x, y, CW, CH);
      ctx.strokeStyle = "#1b1d1f";
      ctx.lineWidth = 7;
      ctx.strokeRect(x + 9, y + 9, CW - 18, CH - 18);
      ctx.fillStyle = "#1b1d1f";
      ctx.font = 'bold 50px "Arial Black", Arial, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(txt, x + CW / 2, y + CH / 2 + 3, CW - 54);
      // chipped enamel & rust blooms
      for (let k = 0; k < 46; k++) {
        ctx.fillStyle =
          r() < 0.6
            ? "rgba(40,30,20," + r() * 0.3 + ")"
            : "rgba(120,60,25," + r() * 0.35 + ")";
        ctx.fillRect(x + r() * CW, y + r() * CH, 2 + r() * 9, 1 + r() * 5);
      }
    });
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, roughness: 0.55, emissive: 0.2 };
  });
  /** Wall sign: centre, facing normal (nx,nz), width w (height w/4). Coordinates are in the current transform. */
  function sign(text, x, y, z, nx, nz, w, layer) {
    const i = Math.max(0, CSIGNS.indexOf(text)),
      uv = M.cellUV(i, 2, 8);
    const rx = nz,
      rz = -nx,
      h = w / 4;
    const bb = M.buf("my/cryosigns", x, z, layer || LAYER);
    M.quad(
      bb,
      [x - (rx * w) / 2 + nx * 0.03, y - h / 2, z - (rz * w) / 2 + nz * 0.03],
      [x + (rx * w) / 2 + nx * 0.03, y - h / 2, z + (rz * w) / 2 + nz * 0.03],
      [x + (rx * w) / 2 + nx * 0.03, y + h / 2, z + (rz * w) / 2 + nz * 0.03],
      [x - (rx * w) / 2 + nx * 0.03, y + h / 2, z - (rz * w) / 2 + nz * 0.03],
      [nx, 0, nz],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
    );
  }
  M.cryoSign = sign;
  /** Emblem decal (floor when ny > 0.5, else wall facing nx/nz). */
  function logo(x, y, z, nx, ny, nz, size, layer) {
    const bb = M.buf("my/cdlogo", x, z, layer || LAYER);
    const hs = size / 2;
    if (ny > 0.5) {
      M.quad(
        bb,
        [x - hs, y, z + hs],
        [x + hs, y, z + hs],
        [x + hs, y, z - hs],
        [x - hs, y, z - hs],
        [0, 1, 0],
        [0, 0, 1, 0, 1, 1, 0, 1],
      );
      return;
    }
    const rx = nz,
      rz = -nx;
    M.quad(
      bb,
      [x - rx * hs + nx * 0.03, y - hs, z - rz * hs + nz * 0.03],
      [x + rx * hs + nx * 0.03, y - hs, z + rz * hs + nz * 0.03],
      [x + rx * hs + nx * 0.03, y + hs, z + rz * hs + nz * 0.03],
      [x - rx * hs + nx * 0.03, y + hs, z - rz * hs + nz * 0.03],
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 1, 0, 1],
    );
  }
  M.cryoLogo = logo;

  // -------------------------------------------------------------------
  // Street side: the service door in the west wall of the Municipal
  // Building's Chambers Street arch (the arch passage runs north-south
  // at x 154.5–165.5; the building's own lobby door is on the east wall).
  // A recessed steel door, a stencilled Civil Defense warning and a caged
  // bulb. World coordinates, 'detail' layer.
  // -------------------------------------------------------------------
  const STREET_DOOR = { x: 154.62, z: 609.5, w: 1.3, h: 2.25 };
  M.cryoStreetDoor = STREET_DOOR;
  function buildStreetDoor() {
    const D = STREET_DOOR,
      x = D.x,
      z = D.z;
    const bb = (k) => M.buf(k, x, z, "detail");
    const steel = bb("metal_painted");
    // frame (proud of the granite) and the door leaf
    M.box(
      steel,
      x - 0.02,
      0.02,
      z - D.w / 2 - 0.16,
      x + 0.1,
      D.h + 0.16,
      z - D.w / 2,
      { s: 1, c: [0.32, 0.33, 0.33] },
    );
    M.box(
      steel,
      x - 0.02,
      0.02,
      z + D.w / 2,
      x + 0.1,
      D.h + 0.16,
      z + D.w / 2 + 0.16,
      { s: 1, c: [0.32, 0.33, 0.33] },
    );
    M.box(steel, x - 0.02, D.h, z - D.w / 2, x + 0.1, D.h + 0.16, z + D.w / 2, {
      s: 1,
      c: [0.32, 0.33, 0.33],
    });
    M.box(steel, x - 0.01, 0.02, z - D.w / 2, x + 0.05, D.h, z + D.w / 2, {
      s: 1,
      c: [0.42, 0.44, 0.43],
    });
    // panel ribs, hinge straps, the push bar
    for (const yy of [0.5, 1.2, 1.9])
      M.box(
        steel,
        x + 0.05,
        yy,
        z - D.w / 2 + 0.08,
        x + 0.07,
        yy + 0.06,
        z + D.w / 2 - 0.08,
        { s: 1, c: [0.36, 0.38, 0.37] },
      );
    M.box(bb("rust"), x + 0.05, 1.0, z - 0.45, x + 0.09, 1.05, z + 0.45, {
      s: 1,
      c: [0.8, 0.7, 0.6],
    });
    // stencil plate + emblem above the door
    sign(
      "AUTHORIZED PERSONNEL ONLY",
      x + 0.11,
      D.h + 0.45,
      z,
      1,
      0,
      1.6,
      "detail",
    );
    logo(x + 0.11, D.h + 1.25, z, 1, 0, 0, 0.9, "detail");
    // caged bulb
    M.cyl(
      bb("metal_painted"),
      x + 0.18,
      D.h + 0.2,
      z + D.w / 2 + 0.35,
      0.07,
      0.07,
      0.12,
      6,
      { c: [0.25, 0.25, 0.25] },
    );
    M.cyl(
      bb("emissive_window@lamp"),
      x + 0.18,
      D.h + 0.05,
      z + D.w / 2 + 0.35,
      0.05,
      0.05,
      0.15,
      6,
      { capTop: true },
    );
    // threshold scuffs
    if (M.decal && M.MARK)
      M.decal(
        M.buf("my/markings", x, z, "fine"),
        x + 0.7,
        0.03,
        z,
        1.2,
        1.6,
        0,
        M.MARK.DIRT,
        [0.7, 0.7, 0.7],
      );
    M.cryoAnchors.ext_door = [x + 0.6, 0, z]; // world coords (ext_*)
    M.extraFixtures = (M.extraFixtures || []).concat([
      {
        pos: new THREE.Vector3(x + 0.18, D.h, z + D.w / 2 + 0.35),
        color: 0xffd9a0,
        opts: { range: 6, intensity: 0.6 },
      },
    ]);
  }
  M.buildCryoStreetDoor = buildStreetDoor;

  // -------------------------------------------------------------------
  /** Weathered skeleton lying (or slumped) on the ground — static set dressing (world coords, 'detail' layer). */
  function skeleton(x, z, yaw, r, sitting, layer, y) {
    const bb = M.buf("bone", x, z, layer || "detail");
    const c = M.mulc([0.86, 0.82, 0.72], r.range(0.8, 1));
    const ca = Math.cos(yaw),
      sa = Math.sin(yaw);
    const yb = y || 0;
    const P = (a, b, yy) => [x + a * ca + b * sa, yy + yb, z - a * sa + b * ca];
    const y0 = sitting ? 0.45 : 0.08;
    // skull
    const sk = sitting ? P(0, 0, 0.95) : P(0, -0.85, 0.12);
    M.cyl(bb, sk[0], sk[1] - 0.1, sk[2], 0.09, 0.1, 0.2, 7, {
      capTop: true,
      c,
    });
    M.cyl(bb, sk[0], sk[1] + 0.02, sk[2], 0.1, 0.05, 0.1, 7, {
      capTop: true,
      c,
    });
    // spine & ribs
    const s0 = sitting ? P(0, 0.05, 0.25) : P(0, -0.1, y0),
      s1 = sitting ? P(0, 0.05, 0.85) : P(0, -0.75, y0);
    M.pipe(bb, s0[0], s0[1], s0[2], s1[0], s1[1], s1[2], 0.03, 4, { c });
    for (let i = 0; i < 5; i++) {
      const t = 0.3 + i * 0.12;
      const m = [
        s0[0] + (s1[0] - s0[0]) * t,
        s0[1] + (s1[1] - s0[1]) * t,
        s0[2] + (s1[2] - s0[2]) * t,
      ];
      for (const sd of [-1, 1]) {
        const q = sitting
          ? P(sd * 0.17, 0.12, m[1] - yb - 0.04)
          : [m[0] + sd * 0.17 * ca, yb + y0 + 0.08, m[2] - sd * 0.17 * sa];
        M.pipe(bb, m[0], m[1], m[2], q[0], q[1], q[2], 0.015, 3, { c });
      }
    }
    // pelvis, limbs
    const pe = s0;
    for (const sd of [-1, 1]) {
      const kn = sitting
        ? P(sd * 0.18, -0.35, 0.5)
        : P(sd * 0.15 + r.range(-0.05, 0.05), 0.45, y0);
      const ft = sitting
        ? P(sd * 0.22, -0.8, 0.06)
        : P(sd * 0.2 + r.range(-0.1, 0.1), 0.9, y0);
      M.pipe(bb, pe[0], pe[1], pe[2], kn[0], kn[1], kn[2], 0.025, 4, { c });
      M.pipe(bb, kn[0], kn[1], kn[2], ft[0], ft[1], ft[2], 0.022, 4, { c });
      const sh = sitting ? P(sd * 0.2, 0.05, 0.8) : P(sd * 0.2, -0.65, y0);
      const el = sitting
        ? P(sd * 0.3, -0.15, 0.5)
        : P(sd * 0.35 + r.range(-0.1, 0.1), -0.35 + r.range(-0.2, 0.2), y0);
      const hd = sitting
        ? P(sd * 0.3, -0.35, 0.35)
        : P(sd * 0.4 + r.range(-0.2, 0.2), -0.05 + r.range(-0.2, 0.2), y0);
      M.pipe(bb, sh[0], sh[1], sh[2], el[0], el[1], el[2], 0.02, 4, { c });
      M.pipe(bb, el[0], el[1], el[2], hd[0], hd[1], hd[2], 0.018, 4, { c });
    }
    if (!layer || layer === "detail")
      M.decal(
        M.buf("my/markings", x, z, "fine"),
        x,
        yb + 0.05,
        z,
        1.8,
        1.8,
        r() * 6,
        M.MARK.STAIN,
        [0.8, 0.8, 0.8],
      );
  }
  M.skeleton = skeleton;
})();
