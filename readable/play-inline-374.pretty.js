/* src/poi_midtown3/20_helmsley.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 3 · 20 Helmsley Building — exterior
 *
 * SITE x 212..268, z -312..-284 (the block north of Grand Central, as in
 * the real city: 230 Park Avenue, the old New York Central Building).
 *   - the H-plan base in buff brick over a rusticated granite ground
 *     storey: end wings two storeys lower than the centre, light courts
 *     over the portals open to the north, and the two famous ROAD
 *     PORTALS (arched vehicle tunnels running right through the building,
 *     north ↔ south, with dropped kerbs to 47th/51st St) either side of
 *     the bronze lobby doors; NEW YORK CENTRAL carved over each;
 *   - 8×8 window-bay atlases (one offset per 4-storey band, projecting
 *     piers + sill courses for relief) with a night-lit mask: warm offices,
 *     cold-white Continuity floors; soot plumes, cornice streaks, burnt-out
 *     floors, a fallen cornice, and a blown-out north-east tower corner;
 *   - the sculpture group and clock at the top of the base;
 *   - the central tower (96 m) and the GILDED CROWN: an arcaded attic drum
 *     flush with the tower (gold-lit arches), floodlights, the balustraded
 *     terrace, a steep 26 m copper pyramid with gilt hips and three tiers
 *     of lit gold dormers, the 7 m colonnaded lantern and finial — never
 *     distance-culled, so the skyline keeps its crown;
 *   - the CONTINUITY COMMS RELAY bolted onto it: lattice mast with a
 *     blinking beacon, dish antennas & equipment racks on the crown
 *     terrace (walkable — reached from the relay room inside), Continuity
 *     banners, a sweeping searchlight at night, and a checkpoint in the
 *     west portal.
 * INTERIOR: see 20_helmsley_interior.js (doors + G.pois entry).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._m3) return;
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

  function buildExterior() {
    const S = P.site("helmsley_ext", { grime: 0.5, segLen: 8 });
    const b = S.b;
    const r = P.rng("helmsley_ext");
    const soot = P.sootMat();
    const SOOT_PLUME = [0, 0, 0.5, 1],
      SOOT_STREAK = [0.5, 0, 1, 1];
    const sootQ = (F, u, y, w, h, rect, d) =>
      F.quad(soot, u, y, w, h, d === undefined ? 0.07 : d, {
        uvRect: rect,
        noAO: true,
        grime: 0,
      });
    b.box("sidewalk", WX - 0.2, 0, SZ, EX + 0.2, 0.03, -283.9, {
      segLen: 6,
      noAO: true,
      grime: 0.6,
    });

    // ================= BASE (H-plan: end wings two storeys lower, light courts over the portals on the north) =================
    const CZ = NZ + COURT_D; // south wall of the courts
    const vol = (xa, xb, za, zb, y0, y1, key) => {
      b.box(key, xa, y0, za, xb, y1, zb);
      S.col(xa, y0, za, xb, y1, zb, { walkable: false });
    };
    for (const [xa, xb, h] of [
      [WX, PORTALS[0][0], HW],
      [PORTALS[0][1], PORTALS[1][0], BH],
      [PORTALS[1][1], EX, HW],
    ]) {
      b.box("granite", xa, 0, NZ, xb, 9, SZ, { grime: 0.45 });
      vol(xa, xb, NZ, SZ, 9, h, "brick_buff");
      S.col(xa, 0, NZ, xb, 9, SZ, { walkable: false });
    }
    for (const [xa, xb] of PORTALS) {
      const cx = (xa + xb) / 2;
      b.box("granite", xa, PSPRING + PR, NZ, xb, 9, SZ);
      vol(xa, xb, NZ, SZ, 9, COURT_Y, "brick_buff");
      vol(xa, xb, CZ, SZ, COURT_Y, BH, "brick_buff");
      // ceiling colliders stepped to follow the vault (no invisible lid at the springing line)
      const hw = PR * 0.5,
        hw2 = PR * 0.866;
      S.col(cx - hw, PSPRING + PR * 0.866, NZ, cx + hw, 9, SZ, {
        walkable: false,
      });
      for (const sx of [-1, 1]) {
        S.col(cx + sx * hw, PSPRING + PR * 0.5, NZ, cx + sx * hw2, 9, SZ, {
          walkable: false,
        });
        S.col(cx + sx * hw2, PSPRING, NZ, cx + sx * PR, 9, SZ, {
          walkable: false,
        });
      }
      // vaulted tunnel: inside half-cylinder along z
      const vg = new THREE.CylinderGeometry(
        PR,
        PR,
        SZ - NZ,
        18,
        6,
        true,
        -HP,
        PI,
      );
      vg.rotateX(-HP);
      b.inside("limestone", vg, P.m4(cx, PSPRING, (NZ + SZ) / 2), {
        grime: 0.7,
      });
      // roadway + sidewalks + lane line
      b.box("asphalt", xa, 0, NZ - 0.2, xb, 0.04, SZ + 0.3, {
        segLen: 6,
        grime: 0.8,
      });
      for (const [sa, sb] of [
        [xa, xa + 1.3],
        [xb - 1.3, xb],
      ]) {
        b.box("sidewalk", sa, 0.04, NZ, sb, 0.16, SZ, {
          seg: false,
          grime: 0.7,
        });
        S.col(sa, 0, NZ, sb, 0.16, SZ, { surface: "concrete" });
      }
      for (let z = NZ + 1; z < SZ - 1; z += 3)
        b.box("paint_cream", cx - 0.06, 0.04, z, cx + 0.06, 0.05, z + 1.5, {
          seg: false,
          noAO: true,
          grime: 0.8,
        });
      // tunnel lamps along both walls (most dead)
      for (let z = NZ + 3; z < SZ - 2; z += 6)
        for (const sx of [-1, 1]) {
          const x = sx < 0 ? xa + 0.05 : xb - 0.05,
            on = ((z | 0) + sx * 3) % 4 === 0;
          b.box("gilt_dull", x - 0.12, 3.2, z - 0.2, x + 0.12, 3.9, z + 0.2, {
            seg: false,
          });
          b.box(
            on ? "lamp_amber" : "glass_dark",
            x - 0.16 * -sx,
            3.3,
            z - 0.15,
            x + 0.02 * sx,
            3.8,
            z + 0.15,
            { seg: false },
          );
          if (on) {
            S.light(x - sx * 0.6, 3.4, z, 0xffc070, 7, 0.9);
            S.glow(x - sx * 0.25, 3.55, z, 0xffb060, 0.5);
          }
        }
      // dropped kerbs: the portal lanes cross the street sidewalks to 47th St (south) and 51st St (north)
      const la = xa + 1.3,
        lb = xb - 1.3;
      for (const [z0, z1, zr, dir] of [
        [SZ + 0.3, -279.25, -278.75, 1],
        [NZ - 0.2, -315.75, -316.25, -1],
      ]) {
        const zlo = Math.min(z0, z1),
          zhi = Math.max(z0, z1);
        b.box("asphalt", la, 0.02, zlo, lb, 0.14, zhi, {
          segLen: 4,
          grime: 0.85,
          noAO: true,
        });
        S.col(la, 0, zlo, lb, 0.14, zhi, { surface: "concrete" });
        b.box(
          "asphalt",
          la,
          -0.05,
          Math.min(z1, zr),
          lb,
          0.05,
          Math.max(z1, zr),
          { seg: false, rx: dir * 0.18, grime: 0.85, noAO: true },
        );
        for (const x of [la, lb])
          b.box("granite_dark", x - 0.16, 0, zlo, x + 0.16, 0.16, zhi, {
            seg: false,
            noAO: true,
          });
        for (let x = la + 0.4; x < lb - 0.3; x += 0.9)
          b.box(
            "paint_white",
            x,
            0.141,
            zlo + 0.4,
            x + 0.45,
            0.145,
            zhi - 0.4,
            { seg: false, noAO: true, grime: 0.9 },
          );
      }
    }
    // court floors (roofs over the portals) + court walls
    for (const [xa, xb] of PORTALS)
      b.box("roof_tar", xa, COURT_Y - 0.1, NZ, xb, COURT_Y + 0.02, CZ, {
        grime: 0.85,
      });

    const FS = P.face(S, "s", WX, EX, SZ);
    const FN = P.face(S, "n", WX, EX, NZ);
    const FW = P.face(S, "w", NZ, SZ, WX);
    const FE = P.face(S, "e", NZ, SZ, EX);
    // rustication channels on the granite ground storey (per solid pier on the portal faces)
    const solidX = [
      [WX, PORTALS[0][0]],
      [PORTALS[0][1], PORTALS[1][0]],
      [PORTALS[1][1], EX],
    ];
    const segsOf = (F) =>
      F === FS
        ? solidX.map(([a, c]) => [a - WX, c - WX])
        : F === FN
          ? solidX.map(([a, c]) => [EX - c, EX - a])
          : [[0, F.len]];
    for (const F of [FS, FN, FW, FE]) {
      for (const [u0, u1] of segsOf(F)) {
        for (let y = 1.2; y < 8.8; y += 0.9)
          F.box(
            "granite_dark",
            u0 - 0.05,
            u1 + 0.05,
            y,
            y + 0.06,
            -0.02,
            0.03,
            { seg: false },
          );
        F.box("granite_dark", u0 - 0.1, u1 + 0.1, 0, 0.6, 0, 0.2, {
          seg: false,
        });
      }
      F.box("limestone", -0.15, F.len + 0.15, 8.8, 9.5, 0, 0.35, {
        seg: false,
      }); // belt course
    }
    // ---- portal faces (both ends): voussoir arch, keystone, NEW YORK CENTRAL plaque (the building's 1929 name) ----
    const plaque = P.texMat(
      "helms_nyc",
      P.signTex("helms_nyc", ["NEW YORK CENTRAL"], "engraved", 512, 96, {
        bg: "#b8ae98",
      }),
      { rough: 0.85 },
    );
    for (const [xa, xb] of PORTALS) {
      const cx = (xa + xb) / 2;
      for (const F of [FS, FN]) {
        const u = F.side === "s" ? cx - WX : EX - cx;
        const sh = new THREE.Shape();
        sh.moveTo(PR, 0);
        sh.lineTo(PR, PR + 0.6);
        sh.lineTo(-PR, PR + 0.6);
        sh.lineTo(-PR, 0);
        sh.absarc(0, 0, PR, PI, 0, true);
        S.b.extrude("granite", sh, 0.62, F.mat(u, PSPRING, -0.6), {
          curve: 16,
        });
        F.arch("limestone", u, PSPRING, PR, 0.55, 0, 0.35);
        F.box(
          "limestone",
          u - 0.35,
          u + 0.35,
          PSPRING + PR - 0.2,
          PSPRING + PR + 1.0,
          0,
          0.5,
          { seg: false },
        );
        for (const sx of [-1, 1])
          F.box(
            "limestone",
            u + sx * (PR + 0.3) - 0.3,
            u + sx * (PR + 0.3) + 0.3,
            0,
            PSPRING,
            0,
            0.35,
            { seg: false },
          );
        F.quad(plaque, u, PSPRING + PR + 1.5, 4.6, 0.86, 0.36);
      }
    }
    // lobby entrance: tall bronze-framed arch with the doors, 230 over it, name in gilt letters
    const lu = LOBBY_X - WX;
    FS.box("granite_dark", lu - 4.2, lu + 4.2, 0, 8.6, 0, 0.25, { seg: false });
    FS.box("bronze", lu - 2.4, lu + 2.4, 0, 4.4, 0.25, 0.3, { seg: false });
    for (let k = -2; k <= 2; k++)
      FS.box(
        "bronze",
        lu + k * 0.95 - 0.05,
        lu + k * 0.95 + 0.05,
        0,
        4.4,
        0.3,
        0.38,
        { seg: false },
      );
    FS.box("glass_dark", lu - 2.3, lu + 2.3, 0.2, 4.3, 0.3, 0.32, {
      seg: false,
    });
    FS.box("bronze", lu - 2.6, lu + 2.6, 4.4, 4.7, 0.25, 0.45, { seg: false });
    FS.halfDisc("glass_dark", lu, 4.7, 2.4, 0.27);
    for (let k = 0; k < 7; k++) {
      const a = (PI * (k + 0.5)) / 7;
      FS.box(
        "bronze",
        lu + Math.cos(a) * 1.2 - 0.03,
        lu + Math.cos(a) * 1.2 + 0.03,
        4.7 + Math.sin(a) * 0.3,
        4.7 + Math.sin(a) * 2.3,
        0.28,
        0.33,
        { seg: false },
      );
    }
    FS.arch("limestone", lu, 4.7, 2.45, 0.5, 0.25, 0.6);
    const nm = P.texMat(
      "helms_name",
      P.signTex(
        "helms_name",
        ["NEW YORK CENTRAL BUILDING"],
        "bronze",
        1024,
        128,
        { font: P.FONTS.SERIF, c0: "#f4d890", c1: "#9a7430" },
      ),
      { transparent: true, metal: 0.5, rough: 0.35 },
    );
    FS.quad(nm, lu, 7.9, 7.6, 0.95, 0.3);
    const n230 = P.texMat(
      "helms_230",
      P.signTex("helms_230", ["230"], "gilt", 256, 128, { bg: "#2a2418" }),
      { rough: 0.5 },
    );
    FS.quad(n230, lu - 3.6, 3.0, 0.9, 0.45, 0.28);
    FS.quad(n230, lu + 3.6, 3.0, 0.9, 0.45, 0.28);
    // big arched ground-storey windows between portals and lobby, and on the flanks
    for (const u of [lu - 7.4, lu + 7.4]) {
      FS.window(u, 1.2, 2.2, 6.6, {
        style: "dark",
        frame: "bronze",
        arch: true,
        sill: "granite_dark",
        keystone: "limestone",
        mull: true,
      });
    }
    for (const F of [FW, FE])
      for (let u = 3.5; u < F.len - 2; u += 5.5)
        F.window(u, 1.2, 2.2, 6.2, {
          style: ((u * 7) | 0) % 3 === 0 ? "broken" : "dark",
          frame: "bronze",
          arch: true,
          sill: "granite_dark",
          keystone: "limestone",
        });
    for (const u of [2.0, FN.len - 2.0, FN.len / 2 - 4.5, FN.len / 2 + 4.5])
      FN.window(u, 1.2, 2.0, 6.0, {
        style: "broken",
        frame: "bronze",
        arch: true,
        sill: "granite_dark",
      });
    FS.window(2.0, 1.2, 2.0, 6.0, {
      style: "dark",
      frame: "bronze",
      arch: true,
      sill: "granite_dark",
    });
    FS.window(FS.len - 2.0, 1.2, 2.0, 6.0, {
      style: "broken",
      frame: "bronze",
      arch: true,
      sill: "granite_dark",
    });

    // ---- window bays: 8×8 atlas with a night-lit mask (warm offices, cold-white Continuity floors) ----
    const BASE_O = {
      wall: "#bfa47a",
      trim: "#e0d4b8",
      course: 7,
      win: 0.5,
      winH: 0.58,
      broken: 0.26,
      lit: 0.05,
      cold: 0.25,
      boarded: 0.1,
      burnt: 0.12,
      nx: 8,
      ny: 8,
      res: 1024,
    };
    const TOWER_O = {
      wall: "#c4aa80",
      trim: "#e6dcc4",
      course: 6,
      win: 0.56,
      winH: 0.64,
      broken: 0.2,
      lit: 0.1,
      cold: 0.45,
      boarded: 0.05,
      burnt: 0.14,
      spandrel: "rgba(70,56,40,0.55)",
      nx: 8,
      ny: 8,
      res: 1024,
    };
    const baseTex = P.texMat("helms_bays8", P.bayTex("helms_base8", BASE_O), {
      rough: 0.9,
      emissive: 1,
      emissiveMap: P.bayLitTex("helms_base8", BASE_O),
      glow: [0, 1.3],
    });
    const towerTex = P.texMat(
      "helms_tbays8",
      P.bayTex("helms_tower8", TOWER_O),
      {
        rough: 0.9,
        emissive: 1,
        emissiveMap: P.bayLitTex("helms_tower8", TOWER_O),
        glow: [0, 1.4],
      },
    );
    const bgrid = (u0, u1, n) => ({
      uBase: u0,
      bayW: (u1 - u0) / n,
      yBase: BYB,
      flH: BFL,
      tex: baseTex,
      r,
      pier: "brick_buff",
    });
    const nBays = (w) => Math.max(1, Math.round(w / 3.25));
    const baseRun = (F, u0, u1, y0, y1) => {
      const g = bgrid(u0, u1, nBays(u1 - u0));
      bayWall(F, g, u0, u1, y0, y1);
      return g;
    };
    const baseTop = (h) => BYB + Math.round((h - 1.2 - BYB) / BFL) * BFL;
    // south (47th St): wing | portal block | centre | portal block | wing
    const sSegs = [
      [0, PORTALS[0][0] - WX, HW],
      [PORTALS[0][0] - WX, PORTALS[0][1] - WX, BH],
      [PORTALS[0][1] - WX, PORTALS[1][0] - WX, BH],
      [PORTALS[1][0] - WX, PORTALS[1][1] - WX, BH],
      [PORTALS[1][1] - WX, FS.len, HW],
    ];
    for (const [u0, u1, h] of sSegs)
      baseRun(FS, u0 + 0.3, u1 - 0.3, BYB, baseTop(h));
    // north (51st St): the courts open above the first storey over each portal
    const nSegs = sSegs.map(([u0, u1, h]) => [FN.len - u1, FN.len - u0, h]);
    for (const [u0, u1, h] of nSegs) {
      const courtOver = h === BH && u1 - u0 < 10;
      baseRun(FN, u0 + 0.3, u1 - 0.3, BYB, courtOver ? COURT_Y : baseTop(h));
    }
    for (const F of [FW, FE]) baseRun(F, 0.4, F.len - 0.4, BYB, baseTop(HW));
    // cornices/parapets per volume; a stretch of the east wing's cornice has fallen (rubble on the sidewalk below)
    for (const [u0, u1, h] of sSegs) {
      if (u0 > 50) {
        corniceSeg(FS, "limestone", u0, u0 + 0.9, h - 1.0, 0.9, true, 0.2);
        corniceSeg(FS, "limestone", u1 - 0.6, u1, h - 1.0, 0.9, true, 0.9);
      } else
        corniceSeg(
          FS,
          "limestone",
          u0,
          u1,
          h - 1.0,
          0.9,
          true,
          u0 < 1 || u1 > FS.len - 1 ? 0.9 : 0.2,
        );
    }
    for (const [u0, u1, h] of nSegs) {
      const courtOver = h === BH && u1 - u0 < 10;
      corniceSeg(
        FN,
        "limestone",
        u0,
        u1,
        (courtOver ? COURT_Y : h) - 1.0,
        courtOver ? 0.5 : 0.9,
        !courtOver,
        0.2,
      );
    }
    for (const F of [FW, FE])
      corniceSeg(F, "limestone", 0, F.len, HW - 1.0, 0.9, true, 0.9);
    // the two-storey step at the wings' inner ends: cornice returns on the taller blocks
    for (const [x, sx] of [
      [PORTALS[0][0], 1],
      [PORTALS[1][1], -1],
    ]) {
      const F = P.face(S, sx > 0 ? "w" : "e", CZ, SZ, x);
      bayWall(
        F,
        {
          uBase: 0.4,
          bayW: (F.len - 0.8) / nBays(F.len - 0.8),
          yBase: BYB,
          flH: BFL,
          tex: baseTex,
          r,
          pier: "brick_buff",
        },
        0.4,
        F.len - 0.4,
        BYB + 6 * BFL,
        baseTop(BH),
      );
      corniceSeg(F, "limestone", 0, F.len, BH - 1.0, 0.9, true, 0.2);
    }
    // light-court walls (bays, simple cornice, rusted fire escapes, grime)
    for (const [xa, xb] of PORTALS) {
      const walls = [
        P.face(S, "n", xa, xb, CZ),
        P.face(S, "e", NZ, CZ, xa),
        P.face(S, "w", NZ, CZ, xb),
      ];
      for (const F of walls) {
        const top =
          F === walls[0]
            ? BH
            : F === walls[1]
              ? xa === PORTALS[0][0]
                ? HW
                : BH
              : xb === PORTALS[1][1]
                ? HW
                : BH;
        const g = bgrid(0.3, F.len - 0.3, nBays(F.len - 0.6));
        g.tex = baseTex;
        bayWall(F, g, 0.3, F.len - 0.3, COURT_Y, baseTop(top), { pierDrop: 0 });
        corniceSeg(F, "limestone", 0, F.len, top - 1.0, 0.5, false, 0.1);
        sootQ(F, F.len / 2, top - 4.2, F.len - 0.4, 6.0, SOOT_STREAK, 0.08);
      }
      // fire escape on the court's south wall
      const F = walls[0];
      for (let k = 1; k < 7; k++) {
        const y = BYB + k * BFL + 0.1;
        F.box("rust", 1.2, F.len - 1.2, y, y + 0.06, 0, 1.1, {
          seg: false,
          grime: 0.9,
        });
        F.box("rust", 1.2, F.len - 1.2, y + 0.9, y + 0.95, 1.05, 1.1, {
          seg: false,
        });
        if (k < 6) {
          const p0 = F.pt(k % 2 ? 2.0 : F.len - 2.0, 0.8),
            p1 = F.pt(k % 2 ? 4.2 : F.len - 4.2, 0.8);
          b.rod("rust", [p0[0], y, p0[1]], [p1[0], y + BFL, p1[1]], 0.03, 4);
        }
      }
    }
    // corner quoins (to each block's own height)
    for (const [x, z, h] of [
      [WX, SZ, HW],
      [EX, SZ, HW],
      [WX, NZ, HW],
      [EX, NZ, HW],
    ])
      for (let y = 9.5; y < h - 1.2; y += 1.4)
        b.box("limestone", x - 0.35, y, z - 0.35, x + 0.35, y + 0.7, z + 0.35, {
          seg: false,
        });
    // grime streaks under the base cornices (street faces)
    for (const [u0, u1, h] of sSegs)
      sootQ(FS, (u0 + u1) / 2, h - 4.6, u1 - u0 - 0.6, 6.5, SOOT_STREAK, 0.3);
    for (const F of [FW, FE])
      sootQ(F, F.len / 2, HW - 4.6, F.len - 1, 6.5, SOOT_STREAK, 0.3);
    // a gutted floor over the west portal (fire plume up the facade)
    sootQ(
      FS,
      PORTALS[0][0] - WX + 4.5,
      BYB + 3 * BFL + 4.0,
      8.0,
      9.0,
      SOOT_PLUME,
      0.3,
    );
    sootQ(
      FN,
      EX - (PORTALS[0][1] + 7),
      BYB + 5 * BFL + 4.0,
      7.0,
      8.0,
      SOOT_PLUME,
      0.3,
    );

    // ---- the clock & sculpture group at the top of the base (south, over the lobby) ----
    const ck = P.texMat("helms_clock", P.clockTex("helms"), { rough: 0.5 });
    FS.box("limestone", lu - 5.5, lu + 5.5, BH - 7.5, BH + 3.2, 0, 0.9, {
      seg: false,
    });
    FS.box("limestone", lu - 5.8, lu + 5.8, BH + 3.2, BH + 3.7, 0, 1.2, {
      seg: false,
    });
    const cm = FS.mat(lu, BH - 1.8, 0.95);
    b.geo(ck, new THREE.CircleGeometry(2.2, 32), cm, {
      uv: "keep",
      noAO: true,
      grime: 0.15,
    });
    b.geo("gilt", new THREE.TorusGeometry(2.3, 0.16, 5, 32), cm, {
      noAO: true,
    });
    for (let k = 0; k < 12; k++) {
      if (k === 7) continue;
      const a = (k / 12) * TAU;
      b.geo(
        "gilt",
        new THREE.BoxGeometry(0.16, 0.5, 0.1)
          .rotateZ(a - HP)
          .translate(Math.cos(a) * 2.75, Math.sin(a) * 2.75, 0),
        cm,
        { noAO: true },
      );
    }
    FS.box("limestone", lu - 5.8, lu + 5.8, BH - 4.55, BH - 4.3, 0.9, 2.1, {
      seg: false,
    }); // ledge for the figures
    for (const sx of [-1, 1]) {
      const p = FS.pt(lu + sx * 3.9, 1.1);
      D.figure(
        b,
        "gilt_dull",
        p[0],
        BH - 4.3,
        p[1],
        sx < 0 ? 0.3 : -0.3,
        1.9,
        "sit",
        { grime: 0.6 },
      );
    }
    FS.box("gilt", lu - 0.6, lu + 0.6, BH + 3.7, BH + 5.4, 0.3, 0.9, {
      seg: false,
    }); // eagle plinth
    b.sphere("gilt", LOBBY_X, BH + 5.8, SZ + 0.6, 0.55, { sx: 1.6, sy: 0.8 });
    for (const sx of [-1, 1])
      b.box(
        "gilt",
        LOBBY_X + sx * 0.4,
        BH + 5.6,
        SZ + 0.3,
        LOBBY_X + sx * 1.9,
        BH + 6.0,
        SZ + 0.9,
        { rz: sx * 0.4, seg: false },
      );
    // ---- roofs ----
    for (const [xa, xb] of PORTALS)
      b.box("roof_tar", xa, BH, CZ, xb, BH + 0.1, SZ - 0.3, { grime: 0.8 });
    b.box(
      "roof_tar",
      WX + 0.3,
      HW,
      NZ + 0.3,
      PORTALS[0][0],
      HW + 0.1,
      SZ - 0.3,
      { grime: 0.8 },
    );
    b.box(
      "roof_tar",
      PORTALS[1][1],
      HW,
      NZ + 0.3,
      EX - 0.3,
      HW + 0.1,
      SZ - 0.3,
      { grime: 0.8 },
    );
    b.box("roof_tar", PORTALS[0][1], BH, NZ + 0.3, TX0, BH + 0.1, SZ - 0.3, {
      grime: 0.8,
    });
    b.box("roof_tar", TX1, BH, NZ + 0.3, PORTALS[1][0], BH + 0.1, SZ - 0.3, {
      grime: 0.8,
    });
    b.box("roof_tar", TX0, BH, NZ + 0.3, TX1, BH + 0.1, TZ0, { grime: 0.8 });
    for (const [x, z] of [
      [221.5, -288.5],
      [258.5, -288.5],
      [240, -309],
    ])
      b.box("panel", x - 1.6, BH + 0.1, z - 1.2, x + 1.6, BH + 2.4, z + 1.2, {
        seg: false,
      });
    for (const [x, z] of [
      [220.5, -296.2],
      [259.5, -296.2],
    ]) {
      for (const [dx, dz] of [
        [-1.3, -1.3],
        [1.3, -1.3],
        [-1.3, 1.3],
        [1.3, 1.3],
      ])
        b.rod(
          "iron",
          [x + dx, BH, z + dz],
          [x + dx * 0.9, BH + 3.4, z + dz * 0.9],
          0.08,
          5,
        );
      b.cyl("wood_rotten", x, BH + 3.4, z, 1.6, 1.65, 3.8, 14, { grime: 0.6 });
      b.lathe(
        "wood_rotten",
        [
          [1.7, 0],
          [1.1, 0.8],
          [0.001, 1.3],
        ],
        14,
        x,
        BH + 7.2,
        z,
      );
    }

    // ================= TOWER (with the blown-out north-east corner) =================
    const N = NOTCH;
    b.box("brick_buff", TX0, BH, TZ0, TX1, N.y0, TZ1);
    b.box("brick_buff", TX0, N.y0, TZ0, N.x0, N.y1, TZ1);
    b.box("brick_buff", N.x0, N.y0, N.z1, TX1, N.y1, TZ1);
    b.box("brick_buff", TX0, N.y1, TZ0, TX1, TH, TZ1);
    S.col(TX0, BH, TZ0, TX1, TH, TZ1, { surface: "concrete" });
    const TS = P.face(S, "s", TX0, TX1, TZ1),
      TN = P.face(S, "n", TX0, TX1, TZ0),
      TW = P.face(S, "w", TZ0, TZ1, TX0),
      TE = P.face(S, "e", TZ0, TZ1, TX1);
    const tgrid = (F) => {
      const n = F === TS || F === TN ? 8 : 6;
      return {
        uBase: 0.6,
        bayW: (F.len - 1.2) / n,
        yBase: TYB,
        flH: TFL,
        tex: towerTex,
        r,
        pier: "brick_buff",
        pierMain: [0, n / 2, n],
      };
    };
    const TY1 = TYB + 14 * TFL;
    for (const F of [TS, TN, TW, TE]) {
      const g = tgrid(F),
        u0 = 0.6,
        u1 = F.len - 0.6,
        y0 = F === TS ? TYB + TFL : TYB;
      if (F === TN) {
        bayWall(F, g, u0, u1, y0, N.y0);
        bayWall(F, g, TX1 - N.x0, u1, N.y0, N.y1);
        bayWall(F, g, u0, u1, N.y1, TY1);
      } else if (F === TE) {
        bayWall(F, g, u0, u1, y0, N.y0);
        bayWall(F, g, u0, -284.3 - N.z1, N.y0, N.y1);
        bayWall(F, g, u0, u1, N.y1, TY1);
      } else bayWall(F, g, u0, u1, y0, TY1);
      F.box("limestone", -0.2, F.len + 0.2, TH - 2.4, TH - 1.4, 0, 0.35, {
        seg: false,
      });
      F.cornice("limestone", TH - 1.4, 0.8, { step: 1.2 });
      if (F !== TS)
        F.box("limestone", -0.2, F.len + 0.2, BH + 0.1, BH + 1.4, 0, 0.3, {
          seg: false,
        });
      // grime hanging from the tower cornice
      sootQ(F, F.len / 2, TH - 6.4, F.len - 1.4, 8.0, SOOT_STREAK, 0.6);
    }
    // burnt-out floors: fire plumes up the west and south faces
    sootQ(TW, 6.5, TYB + 4 * TFL + 5.5, 9.0, 12.0, SOOT_PLUME, 0.62);
    sootQ(TS, 19.0, TYB + 9 * TFL + 4.5, 8.0, 10.0, SOOT_PLUME, 0.62);
    // the notch: gutted floors, slab stubs, rebar, soot, rubble on the ledge
    {
      const nx0 = N.x0,
        nz1 = N.z1;
      b.box(
        "concrete_dark",
        nx0 - 0.05,
        N.y0,
        TZ0 + 0.02,
        nx0 + 0.02,
        N.y1,
        nz1 + 0.05,
        { seg: false, grime: 0.9 },
      );
      b.box(
        "concrete_dark",
        nx0 - 0.05,
        N.y0,
        nz1 - 0.02,
        TX1 - 0.02,
        N.y1,
        nz1 + 0.05,
        { seg: false, grime: 0.9 },
      );
      for (let f = 1; f < 3; f++) {
        const y = N.y0 + f * TFL;
        b.box(
          "concrete",
          nx0,
          y - 0.3,
          nz1 - 1.6 - f * 0.4,
          nx0 + 1.3 + f * 0.3,
          y,
          nz1,
          { seg: false, grime: 0.8, rz: 0.06 * f },
        );
        b.box("concrete", nx0, y - 0.3, TZ0 + 0.4, nx0 + 0.8, y, nz1, {
          seg: false,
          grime: 0.8,
          rx: -0.05,
        });
        for (let k = 0; k < 7; k++) {
          const z = TZ0 + 0.6 + r() * (nz1 - TZ0 - 1),
            x = nx0 + 0.3 + r() * 1.2;
          b.rod(
            "rust",
            [x, y - 0.15, z],
            [x + 0.6 + r() * 1.4, y - 0.4 - r() * 1.4, z + (r() - 0.5) * 0.8],
            0.02,
            3,
            { noAO: true },
          );
        }
      }
      b.box("rubble", nx0, N.y0, TZ0, TX1, N.y0 + 0.4, nz1, {
        seg: false,
        grime: 0.9,
      });
      for (let k = 0; k < 10; k++)
        b.rock(
          "rubble",
          nx0 + 0.4 + r() * 3,
          N.y0 + 0.4,
          TZ0 + 0.4 + r() * 3.4,
          0.3 + r() * 0.5,
          { flat: 0.6 },
        );
      sootQ(TN, (TX1 - nx0) / 2 + 0.4, N.y1 + 5.5, 7.5, 12.0, SOOT_PLUME, 0.62);
      sootQ(TE, -284.3 - nz1 + 2.0, N.y1 + 5.5, 7.5, 12.0, SOOT_PLUME, 0.62);
      S.glow(nx0 + 1.8, N.y0 + 1.2, TZ0 + 1.8, 0xff7a30, 1.6, {
        dayFactor: 0.2,
        flicker: 0.5,
      });
      // fallen masonry on the north base roof below the notch
      for (let k = 0; k < 8; k++)
        b.rock(
          "rubble",
          247 + r() * 6,
          BH + 0.2,
          TZ0 - 1.5 - r() * 3.6,
          0.4 + r() * 0.7,
          { flat: 0.7 },
        );
    }

    // ================= CROWN =================
    // attic drum flush with the tower: rusticated limestone with round-arched openings (the gold-lit ring at night)
    b.box("limestone", TX0, TH, TZ0, TX1, AT - 0.6, TZ1);
    S.col(TX0, TH, TZ0, TX1, AT, TZ1, { surface: "concrete" });
    for (const F of [TS, TN, TW, TE]) {
      const n = Math.round((F.len - 2) / 2.6);
      for (let k = 0; k < n; k++) {
        const u = 1 + ((k + 0.5) * (F.len - 2)) / n;
        F.window(u, TH + 0.9, 1.3, 3.2, {
          style: (k + (F === TN ? 1 : 0)) % 3 === 1 ? "dark" : "lit",
          frame: "gilt_dull",
          arch: true,
          sill: "limestone",
          mull: false,
          keystone: "gilt",
        });
      }
      F.box("limestone", -0.1, F.len + 0.1, TH + 0.1, TH + 0.5, 0, 0.25, {
        seg: false,
      });
      F.box("limestone", -0.4, F.len + 0.4, AT - 1.2, AT - 0.6, 0, 0.5, {
        seg: false,
      });
      // floodlights on the drum ledge, aimed up at the gilded roof (the famous gold crown at night)
      const nf = F.len > 24 ? 4 : 3;
      for (let k = 0; k < nf; k++) {
        const u = ((k + 0.5) * F.len) / nf,
          p = F.pt(u, -PIN * 0.4);
        b.box(
          "continuity_black",
          p[0] - 0.25,
          CY,
          p[1] - 0.25,
          p[0] + 0.25,
          CY + 0.35,
          p[1] + 0.25,
          { seg: false },
        );
        b.box(
          "lamp_gold",
          p[0] - 0.18,
          CY + 0.35,
          p[1] - 0.18,
          p[0] + 0.18,
          CY + 0.4,
          p[1] + 0.18,
          { seg: false, noAO: true },
        );
        const q = F.pt(u, -PIN * 0.9);
        S.glow(q[0], CY + 4.5, q[1], 0xffc050, 7.5, {
          dayFactor: 0,
          intensity: 0.75,
          noLight: true,
        });
      }
    }
    b.box(
      "limestone",
      TX0 - 0.6,
      CY - 0.6,
      TZ0 - 0.6,
      TX1 + 0.6,
      CY,
      TZ1 + 0.6,
      { seg: false },
    );
    // balustrade around the terrace
    const bal = [
      [TX0 - 0.3, TZ1 + 0.3],
      [TX1 + 0.3, TZ1 + 0.3],
      [TX1 + 0.3, TZ0 - 0.3],
      [TX0 - 0.3, TZ0 - 0.3],
      [TX0 - 0.3, TZ1 + 0.3],
    ];
    S.rail("limestone", bal, CY, 1.15, { baluster: true, step: 0.45, r: 0.12 });
    for (const [x, z] of [
      [TX0 - 0.3, TZ1 + 0.3],
      [TX1 + 0.3, TZ1 + 0.3],
      [TX1 + 0.3, TZ0 - 0.3],
      [TX0 - 0.3, TZ0 - 0.3],
    ]) {
      b.box("limestone", x - 0.5, CY, z - 0.5, x + 0.5, CY + 1.5, z + 0.5, {
        seg: false,
      });
      b.lathe(
        "gilt",
        [
          [0.001, 0],
          [0.3, 0],
          [0.18, 0.2],
          [0.35, 0.6],
          [0.2, 1.0],
          [0.08, 1.3],
          [0.001, 1.9],
        ],
        10,
        x,
        CY + 1.5,
        z,
      ); // gilt urn-finials
    }
    // the pyramid roof: steep (26 m), copper with gilt hips and bands
    b.box("limestone", PX0 - 0.3, CY, PZ0 - 0.3, PX1 + 0.3, PY0, PZ1 + 0.3, {
      seg: false,
    });
    b.geo(
      "copper_gilt",
      frustum(PX0, PZ0, PX1, PZ1, PY0, LX0, LZ0, LX1, LZ1, PY1),
      null,
      { grime: 0.35 },
    );
    for (const [a, c] of [
      [
        [PX0, PY0, PZ1],
        [LX0, PY1, LZ1],
      ],
      [
        [PX1, PY0, PZ1],
        [LX1, PY1, LZ1],
      ],
      [
        [PX1, PY0, PZ0],
        [LX1, PY1, LZ0],
      ],
      [
        [PX0, PY0, PZ0],
        [LX0, PY1, LZ0],
      ],
    ])
      b.rod("gilt", a, c, 0.22, 6, { noAO: true });
    const at = (t) => ({
      x0: PX0 + (LX0 - PX0) * t,
      x1: PX1 + (LX1 - PX1) * t,
      z0: PZ0 + (LZ0 - PZ0) * t,
      z1: PZ1 + (LZ1 - PZ1) * t,
      y: PY0 + (PY1 - PY0) * t,
    });
    for (const t of [0.27, 0.55, 0.8]) {
      const q = at(t),
        rr = 0.11;
      b.rod("gilt", [q.x0, q.y, q.z1], [q.x1, q.y, q.z1], rr, 4, {
        noAO: true,
      });
      b.rod("gilt", [q.x1, q.y, q.z1], [q.x1, q.y, q.z0], rr, 4, {
        noAO: true,
      });
      b.rod("gilt", [q.x1, q.y, q.z0], [q.x0, q.y, q.z0], rr, 4, {
        noAO: true,
      });
      b.rod("gilt", [q.x0, q.y, q.z0], [q.x0, q.y, q.z1], rr, 4, {
        noAO: true,
      });
    }
    // terrace door housing on the south slope (the relay-room hatch)
    const DZ1 = PZ1 + 0.45;
    b.box("copper_roof", 238.8, CY, PZ1 - 0.8, 241.2, CY + 2.9, DZ1, {
      seg: false,
    });
    {
      const sh = new THREE.Shape();
      sh.moveTo(-1.4, 0);
      sh.lineTo(1.4, 0);
      sh.lineTo(0, 1.1);
      sh.closePath();
      b.extrude("gilt", sh, 1.35, P.m4(240, CY + 2.9, PZ1 - 0.85), {});
    }
    b.box("continuity_black", 239.3, CY, DZ1, 240.7, CY + 2.4, DZ1 + 0.05, {
      seg: false,
    });
    b.box(
      "lamp_red",
      239.9,
      CY + 2.5,
      DZ1 + 0.01,
      240.1,
      CY + 2.62,
      DZ1 + 0.07,
      { seg: false },
    );
    S.col(238.8, CY, PZ1 - 0.8, 241.2, CY + 2.9, DZ1, { walkable: false });
    // pyramid colliders (stepped, not walkable)
    for (let k = 0; k < 8; k++) {
      const t = (k + 0.5) / 8,
        y = PY0 + ((PY1 - PY0) * k) / 8;
      S.col(
        PX0 + (LX0 - PX0) * t,
        y - 0.8,
        PZ0 + (LZ0 - PZ0) * t,
        PX1 + (LX1 - PX1) * t,
        y + (PY1 - PY0) / 8,
        PZ1 + (LZ1 - PZ1) * t,
        { walkable: false },
      );
    }
    S.col(PX0, CY, PZ0, PX1, PY0 + 1.5, PZ1, { walkable: false });
    // dormers: three tiers standing proud of the steep slopes, gold-lit windows (the night crown)
    const dormer = (x, y, z, ry, s, oculus) => {
      const m = P.m4(x, y, z, ry, 0, 0, s);
      b.geo(
        "copper_roof",
        new THREE.BoxGeometry(1.6, 1.9, 2.2).translate(0, 0.95, -0.2),
        m,
      );
      if (oculus) {
        b.geo(
          "gilt",
          new THREE.TorusGeometry(0.5, 0.1, 5, 16).translate(0, 1.0, 0.92),
          m,
          { noAO: true },
        );
        b.geo(
          "lamp_gold",
          new THREE.CircleGeometry(0.46, 14).translate(0, 1.0, 0.91),
          m,
          { uv: "keep", noAO: true },
        );
      } else {
        const sh = new THREE.Shape();
        sh.moveTo(-0.95, 0);
        sh.lineTo(0.95, 0);
        sh.lineTo(0, 1.1);
        sh.closePath();
        b.geo(
          "gilt",
          new THREE.ExtrudeGeometry(sh, {
            depth: 2.2,
            bevelEnabled: false,
          }).translate(0, 1.9, -1.3),
          m,
        );
        b.geo(
          "lamp_gold",
          new THREE.PlaneGeometry(0.85, 1.3).translate(0, 0.9, 0.91),
          m,
          { uv: "keep", noAO: true },
        );
        b.geo(
          "gilt",
          new THREE.BoxGeometry(0.06, 1.3, 0.06).translate(0, 0.9, 0.93),
          m,
          { noAO: true },
        );
        b.geo(
          "gilt",
          new THREE.BoxGeometry(1.05, 0.1, 0.12).translate(0, 1.6, 0.92),
          m,
          { noAO: true },
        );
        b.geo(
          "gilt",
          new THREE.BoxGeometry(1.2, 0.12, 0.3).translate(0, 0.05, 0.85),
          m,
          { noAO: true },
        );
      }
    };
    const dPts = [];
    for (const [t, n, s, oc] of [
      [0.12, 3, 1.35, false],
      [0.4, 2, 1.15, false],
      [0.66, 1, 0.9, true],
    ]) {
      const q = at(t);
      for (let k = 0; k < n; k++) {
        const fx = q.x0 + ((q.x1 - q.x0) * (k + 1)) / (n + 1),
          fz = q.z0 + ((q.z1 - q.z0) * (k + 1)) / (n + 1);
        dormer(fx, q.y, q.z1 + 0.2, 0, s, oc);
        dormer(fx, q.y, q.z0 - 0.2, PI, s, oc);
        dormer(q.x1 + 0.2, q.y, fz, HP, s, oc);
        dormer(q.x0 - 0.2, q.y, fz, -HP, s, oc);
        dPts.push(
          [fx, q.y + 1.2 * s, q.z1 + 1.6],
          [fx, q.y + 1.2 * s, q.z0 - 1.6],
          [q.x1 + 1.6, q.y + 1.2 * s, fz],
          [q.x0 - 1.6, q.y + 1.2 * s, fz],
        );
      }
    }
    for (const p of dPts)
      S.glow(p[0], p[1], p[2], 0xffc860, 1.8, { dayFactor: 0.15 });
    // the lantern: square drum, arched openings, corner columns, gilt cap & finial
    const LY = PY1,
      LCH = 7.0;
    b.box(
      "limestone",
      LX0 - 0.4,
      LY - 0.3,
      LZ0 - 0.4,
      LX1 + 0.4,
      LY + 0.5,
      LZ1 + 0.4,
      { seg: false },
    );
    for (const [x, z] of [
      [LX0, LZ0],
      [LX1, LZ0],
      [LX0, LZ1],
      [LX1, LZ1],
    ])
      b.cyl("gilt", x, LY + 0.5, z, 0.38, 0.44, LCH, 10);
    b.box(
      "lamp_gold",
      LX0 + 0.35,
      LY + 0.5,
      LZ0 + 0.35,
      LX1 - 0.35,
      LY + LCH + 0.5,
      LZ1 - 0.35,
      { seg: false },
    );
    for (const F of [
      P.face(S, "s", LX0, LX1, LZ1 - 0.25),
      P.face(S, "n", LX0, LX1, LZ0 + 0.25),
      P.face(S, "w", LZ0, LZ1, LX0 + 0.25),
      P.face(S, "e", LZ0, LZ1, LX1 - 0.25),
    ]) {
      for (const u of [1.75, 3.5, 5.25]) {
        F.box("gilt", u - 0.72, u - 0.52, LY + 0.5, LY + 5.4, 0, 0.35, {
          seg: false,
        });
        F.box("gilt", u + 0.52, u + 0.72, LY + 0.5, LY + 5.4, 0, 0.35, {
          seg: false,
        });
        F.arch("gilt", u, LY + 5.4, 0.6, 0.16, 0, 0.35);
      }
      F.box(
        "gilt",
        -0.4,
        F.len + 0.4,
        LY + LCH + 0.5,
        LY + LCH + 1.3,
        0,
        0.55,
        { seg: false },
      );
      F.box("gilt", -0.2, F.len + 0.2, LY + 2.0, LY + 2.15, 0, 0.3, {
        seg: false,
      });
    }
    const CAPY = LY + LCH + 1.3;
    b.lathe(
      "gilt",
      [
        [5.3, 0],
        [5.0, 0.6],
        [3.6, 2.0],
        [1.8, 3.8],
        [0.8, 5.4],
        [0.4, 6.6],
        [0.001, 6.9],
      ],
      4,
      PCX,
      CAPY,
      PCZ,
      { ry: PI / 4 },
    );
    b.cyl("gilt", PCX, CAPY + 6.6, PCZ, 0.18, 0.32, 2.8, 8);
    b.sphere("gilt", PCX, CAPY + 9.8, PCZ, 0.6);
    S.glow(PCX, LY + 3.5, PCZ, 0xffd070, 9, { dayFactor: 0.1 });
    S.glow(PCX, CAPY + 2.5, PCZ, 0xffc860, 7, { dayFactor: 0.05 });
    // ================= CONTINUITY COMMS RELAY =================
    const MY = CAPY + 10.4;
    for (let k = 0; k < 4; k++) {
      const a = k * HP + PI / 4;
      b.rod(
        "continuity_black",
        [PCX + Math.cos(a) * 0.8, MY, PCZ + Math.sin(a) * 0.8],
        [PCX + Math.cos(a) * 0.15, MY + 16, PCZ + Math.sin(a) * 0.15],
        0.07,
        4,
        { noAO: true },
      );
    }
    for (let y = MY + 1; y < MY + 15; y += 1.6) {
      const w = 0.8 - ((y - MY) / 16) * 0.65;
      b.box(
        "continuity_black",
        PCX - w,
        y,
        PCZ - w,
        PCX + w,
        y + 0.07,
        PCZ + w,
        { seg: false, noAO: true },
      );
    }
    for (const [x, z] of [
      [TX0 + 0.4, TZ1 - 0.4],
      [TX1 - 0.4, TZ1 - 0.4],
      [TX1 - 0.4, TZ0 + 0.4],
      [TX0 + 0.4, TZ0 + 0.4],
    ])
      b.rod("steel", [x, CY + 0.2, z], [PCX, MY + 9, PCZ], 0.025, 3, {
        noAO: true,
      });
    for (const sx of [-1, 1]) {
      b.rod(
        "continuity_black",
        [PCX, MY + 12, PCZ],
        [PCX + sx * 2.4, MY + 12, PCZ],
        0.06,
        4,
      );
      b.rod(
        "steel",
        [PCX + sx * 2.4, MY + 12, PCZ],
        [PCX + sx * 2.4, MY + 15.5, PCZ],
        0.03,
        3,
      );
    }
    b.rod("steel", [PCX, MY + 16, PCZ], [PCX, MY + 20, PCZ], 0.035, 3);
    // dish antennas & equipment on the terrace corners, cable runs up the slopes
    const dish = (x, z, ry, s) => {
      b.cyl("continuity_black", x, CY, z, 0.2, 0.3, 1.6 * s, 8);
      b.sphere("continuity_panel", x, CY + 2.2 * s, z, 1.2 * s, {
        pl: TAU,
        t0: 0,
        tl: 0.9,
        rx: -HP + 0.5,
        ry,
        sy: 0.55,
      });
      b.rod(
        "continuity_black",
        [x, CY + 1.6 * s, z],
        [x + Math.sin(ry) * 0.9 * s, CY + 2.6 * s, z + Math.cos(ry) * 0.9 * s],
        0.04,
        4,
      );
    };
    dish(TX1 - 1.0, TZ1 - 1.0, 0.8, 0.85);
    dish(TX0 + 1.0, TZ0 + 1.0, PI + 0.6, 0.85);
    dish(TX0 + 1.0, TZ1 - 3.4, -0.6, 0.7);
    for (const [x, z] of [
      [TX1 - 0.9, TZ0 + 4.5],
      [TX1 - 0.9, TZ0 + 6.2],
    ]) {
      b.box(
        "continuity_black",
        x - 0.45,
        CY,
        z - 0.7,
        x + 0.45,
        CY + 2.0,
        z + 0.7,
        { seg: false },
      );
      b.box(
        "screen",
        x - 0.47,
        CY + 1.2,
        z - 0.4,
        x - 0.45,
        CY + 1.6,
        z + 0.4,
        { seg: false },
      );
      S.col(x - 0.45, CY, z - 0.7, x + 0.45, CY + 2.0, z + 0.7, {
        walkable: false,
      });
    }
    for (const [x, z] of [
      [TX1 - 1.0, TZ1 - 1.0],
      [TX0 + 1.0, TZ0 + 1.0],
    ])
      b.rod(
        "rubber",
        [x, CY + 0.1, z],
        [PCX + Math.sign(x - PCX) * LH_, LY, PCZ + Math.sign(z - PCZ) * LH_],
        0.045,
        4,
        { noAO: true },
      );
    const flag = P.texMat("helms_eflag", P.continuityFlagTex(false), {
      double: true,
      rough: 0.9,
    });
    b.cyl("steel", TX0 + 0.9, CY, TZ1 - 0.9, 0.05, 0.07, 7, 6);
    b.quad(flag, TX0 + 2.0, CY + 6.0, TZ1 - 0.9, 2.2, 1.2, {
      ry: 0,
      ws: 4,
      hs: 2,
    });
    // searchlight mount (the drum + beam are live meshes, see below)
    const SLX = TX1 - 0.9,
      SLZ = TZ1 - 3.6;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      b.rod(
        "continuity_black",
        [SLX + Math.cos(a) * 0.5, CY, SLZ + Math.sin(a) * 0.5],
        [SLX, CY + 1.3, SLZ],
        0.04,
        4,
      );
    }
    S.col(SLX - 0.5, CY, SLZ - 0.5, SLX + 0.5, CY + 1.6, SLZ + 0.5, {
      walkable: false,
    });
    // vertical Continuity banners down the base (south), over the portals
    const vflag = P.texMat("helms_eflag_v", P.continuityFlagTex(true), {
      double: true,
      rough: 0.95,
    });
    for (const [xa, xb] of PORTALS) {
      const u = (xa + xb) / 2 - WX;
      FS.quad(vflag, u, BH - 9.5, 4.2, 8.4, 0.5, { ws: 2, hs: 6 });
      FS.box(
        "continuity_black",
        u - 2.3,
        u + 2.3,
        BH - 5.3,
        BH - 5.0,
        0.1,
        0.8,
        { seg: false },
      );
    }
    // ================= checkpoint in the west portal / wrecks in the east =================
    const [wa, wb] = PORTALS[0];
    S.prop("jersey_barrier", wa + 3.2, 0, SZ - 3.0, 0, {});
    S.prop("jersey_barrier", wb - 2.6, 0, SZ - 3.4, 0.1, {});
    S.prop("sandbags", wa + 2.6, 0.04, SZ - 6.5, 0, { curved: true });
    S.prop("sandbags", wb - 2.6, 0.04, NZ + 5, PI, {});
    const cp = P.texMat(
      "helms_checkpoint",
      P.signTex(
        "helms_checkpoint",
        ["RESTRICTED AREA", "CONTINUITY CHECKPOINT 7", "PAPERS OR DEATH"],
        "label",
        512,
        256,
        { bg: "#d8d4c4" },
      ),
      { rough: 0.7 },
    );
    b.box("continuity_black", wa + 5.6, 0, SZ - 3.3, wa + 5.7, 2.3, SZ - 3.2, {
      seg: false,
    });
    b.quad(cp, wa + 5.65, 2.6, SZ - 3.19, 1.6, 0.8, { ry: 0 });
    b.rod(
      "continuity_black",
      [wa + 2.0, 0.16, SZ - 1.4],
      [wa + 2.0, 3.4, SZ - 1.4],
      0.05,
      5,
    );
    b.box(
      "continuity_black",
      wa + 1.6,
      3.3,
      SZ - 1.7,
      wa + 2.4,
      3.8,
      SZ - 1.1,
      { seg: false },
    );
    b.box("lamp", wa + 1.65, 3.35, SZ - 1.1, wa + 2.35, 3.75, SZ - 1.08, {
      seg: false,
    });
    S.light(wa + 2.0, 3.0, SZ + 1.5, 0xe8f0ff, 10, 1.1);
    const [ea, eb] = PORTALS[1];
    S.prop("car", (ea + eb) / 2 - 1.5, 0, -297.5, 0.12, {});
    S.prop("car", (ea + eb) / 2 + 1.6, 0, -305.5, PI - 0.25, {});
    D.rubble(S, (ea + eb) / 2, 0.04, -291, 2.2, {
      n: 18,
      slab: true,
      rebar: true,
    });
    S.prop("car", (wa + wb) / 2 + 1.4, 0, -304, PI + 0.05, {});
    // fallen cornice blocks from the east wing (the relay's install broke the parapet)
    D.rubble(S, EX - 2.0, 0, SZ + 1.2, 1.8, { n: 14 });
    for (let k = 0; k < 4; k++)
      b.box(
        "limestone",
        EX - 3.6 + k * 0.9,
        0.03,
        SZ + 0.5 + (k % 2) * 0.7,
        EX - 3.0 + k * 0.9,
        0.6,
        SZ + 1.4 + (k % 2) * 0.7,
        { seg: false, ry: k * 0.5, rz: 0.2 * (k % 2), grime: 0.8 },
      );
    // anchors
    S.anchor("exterior_entrance", LOBBY_X, 0, SZ + 1.6, PI);
    S.anchor("terrace", PCX, CY, TZ1 - 1.0, PI);
    S.anchor("checkpoint", (wa + wb) / 2, 0.04, SZ - 4, PI);
    S.anchor("beacon", PCX, MY + 16.2, PCZ, 0);
    // the crown and the facade atlases are the skyline silhouette: never distance-culled (small street dressing still is).
    // Only keys that read at 400 m+ are kept (every one reaches the crown/tower); soot decals, the wing roofs' tar,
    // the relay's panels, cable rubber and the 24-vert copper_gilt trim LOD out like any other detail (fewer far calls).
    S.build({
      shadow: true,
      lod: 320,
      lodKeep: [
        "limestone",
        "copper_roof",
        "gilt",
        "gilt_dull",
        "lamp_gold",
        "window_lit",
        "glass_dark",
        "continuity_black",
        "steel",
        "brick_buff",
        baseTex,
        towerTex,
      ],
    });
    // blinking relay beacon (own material so it can pulse) — animated in 80_content_interior.js via P.helmsBeacon
    const bm = new THREE.MeshStandardMaterial({
      color: 0x401010,
      emissive: 0xff2a1a,
      emissiveIntensity: 2.4,
    });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), bm);
    beacon.position.set(PCX, MY + 16.2, PCZ);
    S.root.add(beacon);
    const beacon2 = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), bm);
    beacon2.position.set(PCX, MY + 9, PCZ + 0.5);
    S.root.add(beacon2);
    let glow = null;
    P.safe("beaconGlow", () => {
      if (!G.isStub("fx") && G.fx.glowSprite)
        glow = G.fx.glowSprite(beacon.position.clone(), 0xff3020, 3.6, {
          parent: S.root,
          intensity: 1.4,
          dayFactor: 0.6,
        });
    });
    // Continuity searchlight: a lamp drum on a yaw pivot + a soft additive beam (vertex-faded), sweeping the avenue at night
    const search = P.safe("searchlight", () => {
      const pivot = new THREE.Group();
      pivot.position.set(SLX, CY + 1.45, SLZ);
      pivot.name = "m3_helms_search";
      const tilt = new THREE.Group();
      tilt.rotation.x = -0.52;
      pivot.add(tilt);
      const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.8, 12).rotateX(HP),
        P.mat("continuity_black"),
      );
      tilt.add(drum);
      const lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.38, 12).rotateY(PI).translate(0, 0, -0.41),
        new THREE.MeshBasicMaterial({ color: 0xeef4ff }),
      );
      tilt.add(lens);
      const L = 150;
      const cg = new THREE.CylinderGeometry(0.4, 9, L, 18, 6, true);
      cg.translate(0, -L / 2, 0);
      cg.rotateX(HP);
      const pos = cg.attributes.position,
        col = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        const f = Math.pow(1 - Math.min(1, -pos.getZ(i) / L), 1.6);
        col[i * 3] = f;
        col[i * 3 + 1] = f;
        col[i * 3 + 2] = f;
      }
      cg.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xcfdcff,
        vertexColors: true,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      const beam = new THREE.Mesh(cg, beamMat);
      beam.renderOrder = 5;
      beam.frustumCulled = false;
      tilt.add(beam);
      S.root.add(pivot);
      return { pivot, beam, beamMat, lens };
    });
    P.helmsBeacon = { mat: bm, meshes: [beacon, beacon2], glow, t: 0, search };
    return { S, SZ, LOBBY_X, CY, TZ1, DZ1 };
  }

  P.addBuilder(
    "helmsley",
    function () {
      P.finishSite("helmsley", buildExterior());
    },
    20,
  );
})();
