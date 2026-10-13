// play-inline-374 02 — grid
// Lines 35-200 of readable/play-inline-374.pretty.js (statement-aligned).
  const P = G._m3,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  // footprint & massing
  const WX = 212.3,
    EX = 267.7,
    NZ = -311.7,
    SZ = -284.3;
  const BH = 40; // base height (portal blocks + centre)
  const PORTALS = [
    [216, 225],
    [255, 264],
  ];
  const PR = 4.5,
    PSPRING = 4.0; // portal arch radius / springing height
  const LOBBY_X = 240;
  // base floor grid (8 storeys over the granite ground storey); the end wings step down two storeys
  const BYB = 9.7,
    BFL = 3.64,
    HW = BYB + 6 * BFL + 1.2; // wing height ≈ 32.7
  const COURT_D = 11,
    COURT_Y = BYB + BFL; // north light courts over the portals (open to 51st St)
  // tower + crown
  const TX0 = 227,
    TX1 = 253,
    TZ0 = -305.5,
    TZ1 = SZ,
    TH = 96;
  const TYB = BH + 1.4,
    TFL = 3.6; // tower floor grid
  const AT = TH + 5.6,
    CY = AT; // attic drum top = crown terrace
  const PIN = 2.0,
    PX0 = TX0 + PIN,
    PX1 = TX1 - PIN,
    PZ0 = TZ0 + PIN,
    PZ1 = TZ1 - PIN,
    PY0 = CY + 0.8,
    PY1 = CY + 26;
  const PCX = 240,
    PCZ = (PZ0 + PZ1) / 2;
  const LH_ = 3.5,
    LX0 = PCX - LH_,
    LX1 = PCX + LH_,
    LZ0 = PCZ - LH_,
    LZ1 = PCZ + LH_; // lantern (7 m square)
  // the blown-out north-east corner of the tower (three storeys, a bay each way)
  const NOTCH = {
    x0: 253 - 3.7,
    x1: 253,
    z0: TZ0,
    z1: -284.3 - 17.27,
    y0: TYB + 7 * TFL,
    y1: TYB + 10 * TFL,
  };
  P.HELMS = { WX, EX, NZ, SZ, TX0, TX1, TZ0, TZ1, TH, CY, PORTALS };

  /** Frustum (4 sloped faces) from a rectangle at y0 to a smaller rectangle at y1. */
  function frustum(x0, z0, x1, z1, y0, ix0, iz0, ix1, iz1, y1) {
    const v = [];
    const quad = (a, b2, c, d) => {
      v.push(...a, ...b2, ...c, ...a, ...c, ...d);
    };
    const A = [x0, y0, z1],
      B = [x1, y0, z1],
      C = [x1, y0, z0],
      Dd = [x0, y0, z0];
    const a = [ix0, y1, iz1],
      b2 = [ix1, y1, iz1],
      c = [ix1, y1, iz0],
      d = [ix0, y1, iz0];
    quad(A, B, b2, a);
    quad(B, C, c, b2);
    quad(C, Dd, d, c);
    quad(Dd, A, a, d);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }
  P.frustum = frustum;

  /**
   * Window-bay wall: textured bay atlas (8×8 bays per tile) on a region [u0,u1]×[y0,y1] of facade F, split into bands of
   * ≤ 4 storeys, each band with its own random whole-bay/whole-storey atlas offset (no two bands repeat the same tile);
   * + projecting piers on the bay grid and a sill course per storey (real relief → the windows read recessed).
   * grid = {uBase, bayW, yBase, flH, tex, r, pier, pierMain:[u...], sill}
   */
  function bayWall(F, grid, u0, u1, y0, y1, o) {
    o = o || {};
    const nbu = (u1 - u0) / grid.bayW;
    const fl0 = Math.round((y0 - grid.yBase) / grid.flH),
      fl1 = Math.round((y1 - grid.yBase) / grid.flH);
    for (let f = fl0; f < fl1; f += 4) {
      const fe = Math.min(fl1, f + 4);
      const ya = grid.yBase + f * grid.flH,
        yb = grid.yBase + fe * grid.flH;
      const uo =
          Math.floor(grid.r() * 8) / 8 + (u0 - grid.uBase) / grid.bayW / 8,
        vo = Math.floor(grid.r() * 8) / 8;
      F.quad(grid.tex, (u0 + u1) / 2, (ya + yb) / 2, u1 - u0, yb - ya, 0.03, {
        us: nbu / 8,
        vs: (fe - f) / 8,
        uo,
        vo,
        ws: Math.max(1, Math.round(nbu)),
        hs: fe - f,
      });
    }
    if (o.piers !== false) {
      const k0 = Math.round((u0 - grid.uBase) / grid.bayW),
        k1 = Math.round((u1 - grid.uBase) / grid.bayW);
      for (let k = k0; k <= k1; k++) {
        const u = grid.uBase + k * grid.bayW,
          main = grid.pierMain && grid.pierMain.indexOf(k) >= 0;
        F.box(
          main ? "limestone" : grid.pier,
          u - (main ? 0.45 : 0.2),
          u + (main ? 0.45 : 0.2),
          y0 - (o.pierDrop || 0),
          y1,
          0,
          main ? 0.55 : 0.28,
          { seg: false },
        );
      }
    }
    for (let f = fl0; f < fl1; f++) {
      const y = grid.yBase + f * grid.flH + grid.flH * 0.13;
      F.box(grid.sill || "limestone", u0, u1, y - 0.16, y, 0, 0.16, {
        seg: false,
        grime: 0.6,
      });
    }
  }
  /** Cornice + parapet on one stretch [u0,u1] of a facade (the kit's F.cornice spans the whole facade). */
  function corniceSeg(F, key, u0, u1, y, proj, parapet, ext) {
    const e = ext === undefined ? proj : ext;
    F.box(key, u0 - e * 0.4, u1 + e * 0.4, y, y + 0.25, 0, proj * 0.4, {
      seg: false,
    });
    F.box(key, u0 - e * 0.7, u1 + e * 0.7, y + 0.25, y + 0.55, 0, proj * 0.7, {
      seg: false,
    });
    F.box(key, u0 - e, u1 + e, y + 0.55, y + 0.85, 0, proj, { seg: false });
    const n = Math.max(1, Math.floor((u1 - u0) / 1.1));
    for (let i = 0; i <= n; i++) {
      const u = u0 + (i * (u1 - u0)) / n;
      F.box(
        key,
        u - 0.09,
        u + 0.09,
        y + 0.12,
        y + 0.55,
        proj * 0.3,
        proj * 0.85,
        { seg: false },
      );
    }
    if (parapet)
      F.box(key, u0 - 0.2, u1 + 0.2, y + 0.9, y + 2.2, 0, 0.3, { seg: false });
  }

