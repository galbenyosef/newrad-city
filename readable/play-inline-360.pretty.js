/* src/poi_wallst/12_stpauls_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI WALL STREET — 12_stpauls_interior.js
 * ST. PAUL'S CHAPEL interior (cell 'st_pauls_chapel', origin 9400,0,800)
 * — "St. Paul's Refuge", a friendly shelter run by Sister Constance.
 *
 * Levels (y):  UNDER 0   the undercroft: brick piers, the refuge's stores,
 *                        burial vaults, the locked Reliquary (reward)
 *              MAIN 3.2  narthex; the Georgian nave (pale pink walls,
 *                        white Corinthian columns, box pews, 7 Waterford
 *                        chandeliers, the barrel vault), the chancel with
 *                        L'Enfant's gilded "Glory", the pulpit with its
 *                        coronet & feathers, WASHINGTON'S PEW (the Great
 *                        Seal painting above it is missing — quest), the
 *                        clinic (north vestry) and the rector's office
 *              GAL 7.6   U-shaped galleries on three sides, organ loft
 *              BELFRY    the bell chamber in the steeple (separate area,
 *                        door from the west gallery; locked stash)
 * Loops: nave → vestry stair → undercroft → narthex stair → nave;
 *        NW gallery stair → galleries → SW gallery stair.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pws) return;
  const PF = G._pws;
  const D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "st_pauls_chapel";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const UNDER = 0,
    MAIN = 3.2,
    GAL = 7.6,
    SPRING = MAIN + 9.2,
    CROWN = MAIN + 11.6;
  const XW = -18,
    XN = -11,
    XE = 16.5,
    ZN = -8.5,
    ZS = 8.5; // shell; XN = narthex/nave partition
  const CH0 = 13; // chancel starts
  const BX = 0,
    BZ = -46,
    BY = 20; // belfry chamber (separate area)

  /** Inward-facing elliptical barrel vault along x (x0..x1), centred on zc, half-width hw, rise, spring y. */
  function innerVault(b, key, x0, x1, zc, hw, rise, y, segs) {
    segs = segs || 14;
    const pos = [];
    const pt = (i, j) => {
      const t = (PI * j) / segs;
      return [i ? x1 : x0, y + rise * Math.sin(t), zc - hw * Math.cos(t)];
    };
    for (let j = 0; j < segs; j++) {
      const a = pt(0, j),
        bq = pt(1, j),
        c = pt(1, j + 1),
        d = pt(0, j + 1);
      pos.push(...a, ...bq, ...c, ...a, ...c, ...d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    b.add(key, g, { grime: 0.25, noAO: true });
  }
  PF.innerVault = innerVault;

  PF.addBuilder(
    "st_pauls_int",
    function () {
      const cell = PF.cell(KEY);
      const root = cell.root;
      const b = PF.batch("sp_int");
      b.ground = UNDER;
      b.aoH = 2.4;
      const r = PF.rng("sp_int");

      // ---------- light plan: grey daylight from the tall windows, candle-lit chandeliers, cook fire ----------
      const L = [];
      const light = (x, y, z, color, rad, i) =>
        L.push({ x: X(x), y, z: Z(z), color, r: rad, i });
      for (const x of [-6, -1, 4, 9])
        light(x, MAIN + 8.2, 0, 0xffe0b0, 11, 0.55); // chandeliers (lit ones)
      for (const x of [-8, -2, 4, 10])
        for (const z of [ZN + 1, ZS - 1]) {
          light(x, MAIN + 2.6, z, 0xc8d4d8, 7, 0.45);
          light(x, GAL + 2.6, z, 0xc8d4d8, 7, 0.45);
        } // window daylight
      light(15, MAIN + 5, 0, 0xffd080, 9, 0.9); // the Glory + altar candles
      light(-14, MAIN + 2.4, 5, 0xffa050, 8, 0.9); // soup kitchen fire
      light(-14, MAIN + 2.6, -4, 0xffd8a0, 8, 0.6); // narthex lantern
      light(12, MAIN + 2.4, -11.5, 0xf0f4ff, 7, 0.9); // clinic
      light(12, MAIN + 2.4, 11.5, 0xffd090, 7, 0.75); // rector's office
      for (const x of [-12, -2, 8]) light(x, UNDER + 2.2, 0, 0xffb060, 8, 0.6); // undercroft lanterns
      light(12, UNDER + 2.2, -11.5, 0xffb060, 6, 0.5);
      light(BX, BY + 3.2, BZ, 0xd0d8c8, 7, 1.0); // belfry (daylight through louvres)
      b.setLights(L, 0xa89890, 0.14);

      const box = (k, x, y, z, w, h, d, o) =>
        b.box(k, X(x), y, Z(z), w, h, d, o);
      const bmm = (k, x0, y0, z0, x1, y1, z1, o) =>
        b.boxMM(k, X(x0), y0, Z(z0), X(x1), y1, Z(z1), o);
      const col = (x0, y0, z0, x1, y1, z1, o) =>
        PF.colMM(
          X(x0),
          y0,
          Z(z0),
          X(x1),
          y1,
          Z(z1),
          Object.assign({ walkable: false }, o || {}),
        );
      const solid = (k, x0, y0, z0, x1, y1, z1, o) => {
        bmm(k, x0, y0, z0, x1, y1, z1, o);
        col(x0, y0, z0, x1, y1, z1, {
          walkable: !!(o && o.walk),
          surface: (o && o.surface) || "wood",
        });
      };
      const slab = (k, x0, z0, x1, z1, y, t, o) =>
        PF.slab(b, k, X(x0), Z(z0), X(x1), Z(z1), y, t, o);
      const wall = (k, axis, a0, a1, f0, f1, y0, y1, gaps, o) => {
        const off = axis === "x" ? OX : OZ,
          foff = axis === "x" ? OZ : OX;
        PF.wall(
          b,
          k,
          axis,
          a0 + off,
          a1 + off,
          f0 + foff,
          f1 + foff,
          y0,
          y1,
          (gaps || []).map((g) => ({ c: g.c + off, w: g.w, y0: g.y0, h: g.h })),
          o,
        );
      };
      const quad = (k, x, y, z, w, h, o) => b.quad(k, X(x), y, Z(z), w, h, o);

      // =====================================================================
      // SHELL: outer walls (undercroft → spring), gable ends, floors
      // =====================================================================
      wall("sp_plaster", "x", XW, XE, ZN - 0.6, ZN, UNDER, SPRING, [
        { c: 12, w: 1.8, y0: MAIN, h: 2.7 },
        { c: 10.5, w: 2.4, y0: UNDER, h: 2.7 },
      ]);
      wall("sp_plaster", "x", XW, XE, ZS, ZS + 0.6, UNDER, SPRING, [
        { c: 12, w: 1.8, y0: MAIN, h: 2.7 },
      ]);
      wall("sp_plaster", "z", ZN, ZS, XW - 0.6, XW, UNDER, SPRING, [
        { c: 0, w: 2.2, y0: MAIN, h: 3.4 },
      ]);
      wall("sp_plaster", "z", ZN, ZS, XE, XE + 0.6, UNDER, CROWN + 0.3, []);
      // undercroft: brick lining on the lower walls (0..MAIN)
      bmm(
        "brick_brown",
        XW + 0.02,
        UNDER,
        ZN + 0.02,
        XE - 0.02,
        MAIN - 0.35,
        ZN + 0.12,
        { segLen: 4, noAO: false },
      );
      bmm(
        "brick_brown",
        XW + 0.02,
        UNDER,
        ZS - 0.12,
        XE - 0.02,
        MAIN - 0.35,
        ZS - 0.02,
        { segLen: 4 },
      );
      bmm("brick_brown", XW + 0.02, UNDER, ZN, XW + 0.12, MAIN - 0.35, ZS, {
        segLen: 4,
      });
      bmm("brick_brown", XE - 0.12, UNDER, ZN, XE - 0.02, MAIN - 0.35, ZS, {
        segLen: 4,
      });
      // floors: undercroft (stone flags), main floor slab with the narthex stair hole
      slab("flagstone", XW, -14, XE, ZS, UNDER + 0.05, 0.3, {});
      slab("sp_flags", XW, ZN, XE, 1.6, MAIN, 0.35, { surface: "concrete" });
      slab("sp_flags", XW, 1.6, -17.4, 3.3, MAIN, 0.35, {
        surface: "concrete",
      });
      slab("sp_flags", -11.8, 1.6, XE, 3.3, MAIN, 0.35, {
        surface: "concrete",
      });
      slab("sp_flags", XW, 3.3, XE, ZS, MAIN, 0.35, { surface: "concrete" });
      // pew platforms (wooden floor under the box pews) + centre aisle runner
      bmm("planks", -6.8, MAIN, ZN + 0.2, CH0 - 1, MAIN + 0.03, -1.3, {
        segLen: 4,
        noAO: true,
      });
      bmm("planks", -6.8, MAIN, 1.3, CH0 - 1, MAIN + 0.03, ZS - 0.2, {
        segLen: 4,
        noAO: true,
      });
      bmm("carpet_red", -11, MAIN + 0.01, -0.9, CH0, MAIN + 0.035, 0.9, {
        segLen: 4,
        noAO: true,
        grime: 0.7,
      });
      // gable wall above the spring at the west (over the galleries) + side ceilings over the galleries
      bmm("sp_plaster", XN - 0.4, SPRING, ZN, XN, CROWN + 0.3, ZS, {
        seg: false,
      });
      bmm("sp_white", XN, SPRING - 0.25, ZN, XE, SPRING, -4.6, {
        segLen: 6,
        noAO: true,
      });
      bmm("sp_white", XN, SPRING - 0.25, 4.6, XE, SPRING, ZS, {
        segLen: 6,
        noAO: true,
      });
      // the barrel vault (inward faces) + ribs & a plaster rosette
      innerVault(
        b,
        "sp_white",
        X(XN),
        X(XE),
        Z(0),
        4.8,
        CROWN - SPRING,
        SPRING,
        16,
      );
      for (let x = -7; x <= 13; x += 4) {
        for (let j = 0; j < 12; j++) {
          const t0 = (PI * j) / 12,
            t1 = (PI * (j + 1)) / 12;
          b.beam(
            "sp_white",
            P(
              x,
              SPRING + (CROWN - SPRING) * Math.sin(t0) - 0.1,
              -4.8 * Math.cos(t0),
            ),
            P(
              x,
              SPRING + (CROWN - SPRING) * Math.sin(t1) - 0.1,
              -4.8 * Math.cos(t1),
            ),
            0.35,
            0.18,
            { noAO: true, grime: 0.2 },
          );
        }
      }
      // narthex ceiling (under the tower) and the narthex/nave partition
      bmm("sp_white", XW, GAL - 0.3, ZN, XN, GAL, ZS, {
        segLen: 6,
        noAO: true,
      });
      wall("sp_plaster", "z", ZN, ZS, XN - 0.4, XN, GAL, SPRING, []);
      wall("sp_plaster", "z", ZN, ZS, XN - 0.4, XN, MAIN, GAL, [
        { c: 0, w: 3.0, y0: MAIN, h: 3.3 },
        { c: -6.2, w: 1.6, y0: MAIN, h: 2.6 },
        { c: 6.2, w: 1.6, y0: MAIN, h: 2.6 },
      ]);
      // exterior roof closure above the vault (never seen, blocks the void)
      bmm(
        "slate_roof",
        XW,
        CROWN + 0.3,
        ZN - 0.6,
        XE + 0.6,
        CROWN + 0.6,
        ZS + 0.6,
        { seg: false, noAO: true },
      );

      // =====================================================================
      // WINDOWS: two tiers of round-headed daylight windows (N & S walls), the
      // Palladian east window over the Glory, the west oculus
      // =====================================================================
      for (const [z, ry] of [
        [ZN + 0.05, 0],
        [ZS - 0.05, PI],
      ]) {
        for (let i = 0; i < 5; i++) {
          const x = -8 + i * 5;
          const broken = r() < 0.2;
          PF.archBay(b, X(x), MAIN + 0.9, Z(z), ry, 1.6, 2.6, {
            pane: "sky_view",
            paneRect: PF.skyRect(r, 1.6, 2.6),
            ring: "sp_white",
            ringW: 0.22,
            n: 9,
            sash: true,
            sashKey: "sp_white",
          });
          PF.archBay(b, X(x), GAL + 0.8, Z(z), ry, 1.8, 3.6, {
            pane: "sky_view",
            paneRect: PF.skyRect(r, 1.8, 3.6),
            ring: "sp_white",
            ringW: 0.22,
            n: 9,
            sash: !broken,
            sashKey: "sp_white",
          });
          if (r() < 0.25)
            for (let k = 0; k < 3; k++)
              box(
                "planks",
                x + (k - 1) * 0.1,
                MAIN + 1.3 + k * 0.6,
                z + (ry === 0 ? 0.08 : -0.08),
                1.9,
                0.2,
                0.04,
                { rz: (k - 1) * 0.15, seg: false },
              );
        }
      }
      // Palladian window (east) high above the altar
      PF.archBay(b, X(XE - 0.05), MAIN + 6.2, Z(0), -HP, 2.2, 4.4, {
        pane: "sky_view",
        paneRect: PF.skyRect(r, 2.2, 4.4),
        ring: "sp_white",
        ringW: 0.26,
        n: 11,
        sash: true,
        sashKey: "sp_white",
      });
      for (const sg of [-1, 1])
        PF.classicWindow(
          b,
          X(XE - 0.05),
          MAIN + 6.2,
          Z(sg * 2.3),
          -HP,
          1.0,
          2.6,
          {
            pane: "daylight_dim",
            frame: "sp_white",
            muntins: [2, 3],
            muntinKey: "sp_white",
          },
        );
      // west door (inside) + oculus above it
      for (const sg of [-1, 1])
        bmm(
          "oak_ws",
          XW + 0.02,
          MAIN,
          sg * 0.05,
          XW + 0.12,
          MAIN + 3.2,
          sg * 1.1,
          { seg: false },
        );
      b.cyl("daylight", X(XW + 0.06), MAIN + 4.9, Z(0), 0.6, 0.6, 0.04, 14, {
        rz: HP,
        hSeg: 1,
        noAO: true,
      });

      // =====================================================================
      // COLUMNS + GALLERIES (north, south, west) with panelled white fronts
      // =====================================================================
      const colXs = [-7, -3, 1, 5, 9];
      for (const z of [-4.6, 4.6])
        for (const x of colXs)
          PF.corinthian(
            b,
            "sp_white",
            X(x),
            MAIN,
            Z(z),
            SPRING - MAIN - 0.25,
            0.34,
            { capKey: "gilt", cheap: false },
          );
      for (const z of [-4.6, 4.6])
        PF.corinthian(
          b,
          "sp_white",
          X(XN + 3.6),
          MAIN,
          Z(z),
          SPRING - MAIN - 0.25,
          0.34,
          { capKey: "gilt", cheap: true },
        );
      // gallery floors (holes over the two gallery stairs: x -9.6..-5, |z| 6.8..8.4)
      slab("planks", XN, ZN, XE - 0.2, -8.4, GAL, 0.35, { surface: "wood" });
      slab("planks", XN, -8.4, -9.6, -6.8, GAL, 0.35, { surface: "wood" });
      slab("planks", -5, -8.4, CH0 - 1, -6.8, GAL, 0.35, { surface: "wood" });
      slab("planks", XN, -6.8, CH0 - 1, -4.2, GAL, 0.35, { surface: "wood" });
      slab("planks", XN, 4.2, CH0 - 1, 6.8, GAL, 0.35, { surface: "wood" });
      slab("planks", XN, 6.8, -9.6, 8.4, GAL, 0.35, { surface: "wood" });
      slab("planks", -5, 6.8, CH0 - 1, 8.4, GAL, 0.35, { surface: "wood" });
      slab("planks", XN, 8.4, XE - 0.2, ZS, GAL, 0.35, { surface: "wood" });
      slab("planks", XN, -4.2, XN + 3.6, 4.2, GAL, 0.35, { surface: "wood" }); // west gallery (organ loft)
      // soffits under the galleries (white panelled) + gallery fronts (parapets) with a gilt rail
      bmm("sp_white", XN, GAL - 0.5, ZN, CH0 - 1, GAL - 0.35, -4.2, {
        segLen: 6,
        noAO: true,
      });
      bmm("sp_white", XN, GAL - 0.5, 4.2, CH0 - 1, GAL - 0.35, ZS, {
        segLen: 6,
        noAO: true,
      });
      const parapet = (x0, z0, x1, z1) => {
        bmm("sp_white", x0, GAL - 0.6, z0, x1, GAL + 1.05, z1, {
          seg: false,
          grime: 0.3,
        });
        col(x0, GAL - 0.6, z0, x1, GAL + 1.05, z1);
        const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
        const len = alongX ? x1 - x0 : z1 - z0;
        for (let k = 0.6; k < len - 0.3; k += 1.2) {
          const px = alongX ? x0 + k : (x0 + x1) / 2,
            pz = alongX ? (z0 + z1) / 2 : z0 + k;
          box(
            "sp_plaster",
            px,
            GAL - 0.1,
            pz,
            alongX ? 0.8 : 0.26,
            0.9,
            alongX ? 0.26 : 0.8,
            { seg: false, noAO: true },
          );
        }
        bmm("gilt", x0, GAL + 1.05, z0, x1, GAL + 1.12, z1, {
          seg: false,
          noAO: true,
        });
      };
      parapet(XN + 3.4, -4.35, CH0 - 1, -4.05);
      parapet(XN + 3.4, 4.05, CH0 - 1, 4.35);
      parapet(XN + 3.45, -4.2, XN + 3.75, 4.2);
      parapet(CH0 - 1.3, ZN, CH0 - 1, -4.2);
      parapet(CH0 - 1.3, 4.2, CH0 - 1, ZS);
      // gallery pews (plain benches, stepped)
      for (const zs of [-1, 1])
        for (let x = -7; x < CH0 - 2; x += 1.6) {
          for (let k = 0; k < 2; k++)
            solid(
              "box_pew",
              x,
              GAL,
              zs * (5.3 + k * 1.3) - 0.25,
              x + 1.2,
              GAL + 0.5,
              zs * (5.3 + k * 1.3) + 0.25,
              { seg: false, walk: true },
            );
        }
      // the organ (west gallery): case with gilt pipes
      bmm("mahog_ws", XN + 0.1, GAL, -3.2, XN + 1.6, GAL + 3.6, 3.2, {
        seg: false,
      });
      col(XN + 0.1, GAL, -3.2, XN + 1.6, GAL + 3.6, 3.2);
      for (let k = 0; k < 17; k++) {
        const z = -2.8 + k * 0.35,
          hh = 1.4 + Math.abs(Math.sin(k * 0.6)) * 1.6 + (k === 8 ? 0.8 : 0);
        b.cyl("gilt", X(XN + 1.7), GAL + 3.6, Z(z), 0.12, 0.12, hh, 8, {
          hSeg: 1,
        });
      }
      bmm("mahog_ws", XN + 1.4, GAL + 0.8, -1.2, XN + 2.1, GAL + 1.0, 1.2, {
        seg: false,
      }); // console
      solid("box_pew", XN + 2.4, GAL, -0.5, XN + 2.9, GAL + 0.5, 0.5, {
        seg: false,
        walk: true,
      });

      // gallery stairs: NW and SW, from the nave floor (x -5) climbing west to the gallery (x -9.6)
      for (const zc of [-7.6, 7.6]) {
        PF.stairs(b, "oak_ws", X(-4.9), Z(zc), -HP, 1.5, 4.7, MAIN, GAL, {
          base: MAIN - 0.05,
          grime: 0.4,
        });
        // stringer panel + handrail on the open side
        const zo = zc < 0 ? zc + 0.8 : zc - 0.8;
        b.beam(
          "mahog_ws",
          P(-4.9, MAIN + 1.0, zo),
          P(-9.6, GAL + 1.0, zo),
          0.07,
          0.07,
          {},
        );
        for (let k = 0; k <= 5; k++) {
          const t = k / 5;
          b.beam(
            "sp_white",
            P(-4.9 - 4.7 * t, MAIN + (GAL - MAIN) * t, zo),
            P(-4.9 - 4.7 * t, MAIN + (GAL - MAIN) * t + 1.0, zo),
            0.04,
            0.04,
            {},
          );
        }
        PF.colWall(X(-4.9), Z(zo), X(-9.6), Z(zo), 0.12, MAIN, GAL + 1.0, {
          walkable: false,
        });
        // rail around the gallery-floor hole (on the gallery side)
        PF.rail(
          b,
          X(-5),
          Z(zc < 0 ? -6.8 : 6.8),
          X(-9.6),
          Z(zc < 0 ? -6.8 : 6.8),
          GAL,
          { key: "sp_white" },
        );
        PF.rail(
          b,
          X(-5),
          Z(zc < 0 ? -6.8 : 6.8),
          X(-5),
          Z(zc < 0 ? -8.4 : 8.4),
          GAL,
          { key: "sp_white" },
        );
      }

      // =====================================================================
      // NAVE FURNISHINGS: box pews (some pushed aside for cots), chancel & Glory,
      // pulpit, Washington's pew, Clinton's pew, chandeliers
      // =====================================================================
      const pewRow = (x, z0, z1, gone) => {
        if (gone) return;
        solid("box_pew", x - 0.05, MAIN, z0, x + 0.05, MAIN + 1.15, z1, {
          seg: false,
        });
        bmm("box_pew", x + 0.95, MAIN, z0, x + 1.05, MAIN + 1.15, z1, {
          seg: false,
        });
        col(x + 0.95, MAIN, z0, x + 1.05, MAIN + 1.15, z1);
        bmm("box_pew", x, MAIN, z0, x + 1.0, MAIN + 1.15, z0 + 0.08, {
          seg: false,
        });
        col(x, MAIN, z0, x + 1.0, MAIN + 1.15, z0 + 0.08);
        bmm(
          "box_pew",
          x + 0.3,
          MAIN,
          z0 + 0.1,
          x + 0.6,
          MAIN + 0.45,
          z1 - 0.1,
          { seg: false },
        );
        bmm("mahog_ws", x - 0.06, MAIN + 1.15, z0, x + 0.06, MAIN + 1.2, z1, {
          seg: false,
        });
      };
      let pewN = 0;
      for (let x = -6.5; x < CH0 - 2; x += 1.25) {
        pewRow(x, -4.2, -1.1, pewN % 3 === 1);
        pewRow(x, 1.1, 4.2, pewN % 4 === 2);
        pewN++;
      }
      // side aisles: the refuge's cots
      const cots = [];
      for (let x = -6; x < CH0 - 2; x += 2.6)
        for (const z of [-6.4, 6.4]) {
          if (Math.abs(x - 0.5) < 1.8 && z < 0) continue; // Washington's pew
          if (Math.abs(x - 0.5) < 1.8 && z > 0) continue; // Clinton's pew
          cots.push([x, z]);
          solid(
            "rust",
            x - 0.95,
            MAIN,
            z - 0.4,
            x + 0.95,
            MAIN + 0.45,
            z + 0.4,
            { seg: false, walk: true, surface: "metal" },
          );
          bmm(
            "linen_ws",
            x - 0.9,
            MAIN + 0.45,
            z - 0.36,
            x + 0.9,
            MAIN + 0.55,
            z + 0.36,
            { seg: false, c: [0xffffff, 0xc8c0b0, 0xb8c0c8][cots.length % 3] },
          );
          bmm(
            "canvas_ws",
            x - 0.2,
            MAIN + 0.55,
            z - 0.38,
            x + 0.9,
            MAIN + 0.62,
            z + 0.38,
            { seg: false, c: 0x8a7a60 },
          );
          if (r() < 0.5)
            D.crates(
              b,
              X(x - 1.3),
              MAIN,
              Z(z + (z < 0 ? -0.7 : 0.7)),
              1,
              x * 3 + z,
            );
        }
      // Washington's pew (north aisle): canopied box pew, the empty frame where the Great Seal hung
      {
        const x0 = -0.8,
          x1 = 1.8,
          z0 = ZN + 0.2,
          z1 = -5.4;
        solid("box_pew", x0, MAIN, z1 - 0.1, x1, MAIN + 1.25, z1, {
          seg: false,
        });
        solid("box_pew", x0, MAIN, z0, x0 + 0.1, MAIN + 1.25, z1, {
          seg: false,
        });
        solid("box_pew", x1 - 0.1, MAIN, z0, x1, MAIN + 1.25, z1 - 1.2, {
          seg: false,
        });
        bmm(
          "carpet_red",
          x0 + 0.1,
          MAIN + 0.4,
          z0 + 0.1,
          x1 - 0.1,
          MAIN + 0.5,
          z0 + 0.6,
          { seg: false },
        );
        bmm(
          "carpet_green",
          x0 + 0.1,
          MAIN + 0.04,
          z0,
          x1 - 0.1,
          MAIN + 0.06,
          z1 - 0.1,
          { seg: false, noAO: true },
        );
        // canopy on turned posts
        for (const [x, z] of [
          [x0 + 0.1, z1 - 0.1],
          [x1 - 0.1, z1 - 0.1],
        ])
          b.cyl("sp_white", X(x), MAIN + 1.25, Z(z), 0.06, 0.06, 1.8, 8, {
            hSeg: 1,
          });
        bmm("sp_white", x0, MAIN + 3.05, z0, x1, MAIN + 3.25, z1, {
          seg: false,
        });
        bmm(
          "carpet_red",
          x0 + 0.05,
          MAIN + 2.75,
          z0,
          x1 - 0.05,
          MAIN + 3.05,
          z0 + 0.05,
          { seg: false },
        );
        // the painting's frame on the wall above (empty — pale ghost of the Seal, nail holes)
        const fx = (x0 + x1) / 2,
          fz = ZN + 0.06;
        bmm(
          "gilt",
          fx - 0.85,
          MAIN + 3.5,
          fz,
          fx + 0.85,
          MAIN + 3.62,
          fz + 0.1,
          { seg: false },
        );
        bmm(
          "gilt",
          fx - 0.85,
          MAIN + 5.08,
          fz,
          fx + 0.85,
          MAIN + 5.2,
          fz + 0.1,
          { seg: false },
        );
        bmm(
          "gilt",
          fx - 0.85,
          MAIN + 3.5,
          fz,
          fx - 0.73,
          MAIN + 5.2,
          fz + 0.1,
          { seg: false },
        );
        bmm(
          "gilt",
          fx + 0.73,
          MAIN + 3.5,
          fz,
          fx + 0.85,
          MAIN + 5.2,
          fz + 0.1,
          { seg: false },
        );
        quad("sp_white", fx, MAIN + 4.35, fz + 0.03, 1.4, 1.4, {
          ry: 0,
          grime: 0.05,
          noAO: true,
        });
        PF.sp = PF.sp || {};
        PF.sp.sealPos = P(fx, MAIN + 4.35, fz + 0.05);
        const pl = PF.texMat(
          "sp_pewplaque",
          PF.signTex(
            "sp_pewplaque",
            [
              "GEORGE WASHINGTON'S PEW",
              "He worshipped here after his inauguration",
              "April 30, 1789",
            ],
            "bronze",
            512,
            160,
          ),
          {},
        );
        quad(pl, x1 + 0.02, MAIN + 0.8, (z0 + z1) / 2 + 0.4, 0.9, 0.28, {
          ry: HP,
          grime: 0.3,
        });
        PF.readable(
          P(x1 + 0.1, MAIN + 0.8, (z0 + z1) / 2 + 0.4),
          "Washington's Pew",
          "George Washington knelt here on April 30, 1789, after taking the oath of office on Wall Street. Above the pew hung the first painting of the Great Seal of the United States. The frame is empty now; four clean nail holes and a pale square where it hung.",
        );
      }
      // Governor Clinton's pew (south aisle) with the arms of New York
      {
        const x0 = -0.8,
          x1 = 1.8,
          z0 = 5.4,
          z1 = ZS - 0.2;
        solid("box_pew", x0, MAIN, z0, x1, MAIN + 1.25, z0 + 0.1, {
          seg: false,
        });
        solid("box_pew", x0, MAIN, z0, x0 + 0.1, MAIN + 1.25, z1, {
          seg: false,
        });
        solid("box_pew", x1 - 0.1, MAIN, z0 + 1.2, x1, MAIN + 1.25, z1, {
          seg: false,
        });
        bmm(
          "carpet_green",
          x0 + 0.1,
          MAIN + 0.04,
          z0 + 0.1,
          x1 - 0.1,
          MAIN + 0.06,
          z1,
          { seg: false, noAO: true },
        );
        const ny = PF.texMat(
          "sp_nyarms",
          PF.signTex("sp_nyarms", ["EXCELSIOR"], "enamel", 256, 256, {
            bg: "#1e3a5a",
            fg: "#e0c070",
            size: 34,
          }),
          {},
        );
        quad(ny, (x0 + x1) / 2, MAIN + 4.2, ZS - 0.1, 1.2, 1.2, {
          ry: PI,
          grime: 0.3,
        });
      }
      // chancel: raised floor, curved altar rail, altar, reredos & the Glory
      {
        solid("marble_vein", CH0, MAIN, ZN + 0.2, XE, MAIN + 0.45, ZS - 0.2, {
          seg: false,
          walk: true,
          surface: "concrete",
        });
        PF.stairs(
          b,
          "marble_vein",
          X(CH0 - 0.7),
          Z(0),
          -HP * -1,
          3.0,
          0.7,
          MAIN,
          MAIN + 0.45,
          { base: MAIN - 0.05 },
        );
        // rail (a gap in the middle)
        for (const [z0, z1] of [
          [-4.2, -1.3],
          [1.3, 4.2],
        ]) {
          bmm(
            "mahog_ws",
            CH0 + 0.1,
            MAIN + 0.45 + 0.85,
            z0,
            CH0 + 0.3,
            MAIN + 0.45 + 0.95,
            z1,
            { seg: false },
          );
          for (let z = z0; z <= z1; z += 0.22)
            b.lathe(
              "sp_white",
              [
                [0.04, 0],
                [0.07, 0.12],
                [0.05, 0.45],
                [0.08, 0.65],
                [0.04, 0.85],
              ],
              6,
              X(CH0 + 0.2),
              MAIN + 0.45,
              Z(z),
              {},
            );
          col(CH0 + 0.1, MAIN + 0.45, z0, CH0 + 0.3, MAIN + 1.4, z1);
          bmm("carpet_red", CH0 - 0.35, MAIN, z0, CH0 + 0.05, MAIN + 0.2, z1, {
            seg: false,
          }); // kneeler
        }
        // altar table (with the refuge's candles), reredos panels, the Glory above
        solid(
          "mahog_ws",
          XE - 2.2,
          MAIN + 0.45,
          -1.6,
          XE - 1.3,
          MAIN + 1.45,
          1.6,
          { seg: false },
        );
        bmm(
          "linen_ws",
          XE - 2.25,
          MAIN + 1.45,
          -1.7,
          XE - 1.25,
          MAIN + 1.5,
          1.7,
          { seg: false },
        );
        PF.candles(b, X(XE - 1.8), MAIN + 1.5, Z(-1.1), 7, 51, root);
        PF.candles(b, X(XE - 1.8), MAIN + 1.5, Z(1.1), 6, 52, root);
        bmm(
          "sp_white",
          XE - 0.4,
          MAIN + 0.45,
          -3.5,
          XE - 0.05,
          MAIN + 5.6,
          3.5,
          { seg: false },
        );
        for (const z of [-2.6, 2.6])
          PF.corinthian(
            b,
            "sp_white",
            X(XE - 0.5),
            MAIN + 0.45,
            Z(z),
            5.0,
            0.2,
            { capKey: "gilt", cheap: true, collide: false },
          );
        const tab = PF.texMat(
          "sp_tablets",
          PF.signTex(
            "sp_tablets",
            ["THE LORD'S PRAYER", "·", "THE CREED"],
            "engraved",
            512,
            256,
            { bg: "#e8e0cc" },
          ),
          {},
        );
        quad(tab, XE - 0.42, MAIN + 2.9, 0, 2.6, 1.3, { ry: -HP, grime: 0.2 });
        quad(PF.gloryKey(), XE - 0.3, MAIN + 8.0, 0, 5.2, 5.2, {
          ry: -HP,
          grime: 0.1,
          noAO: true,
        });
        PF.glow(P(XE - 0.6, MAIN + 8.0, 0), 0xffd070, 3.2, root, {
          intensity: 0.7,
        });
      }
      // pulpit (north side of the chancel): wineglass pulpit, stair, sounding board with coronet & feathers
      {
        const px = CH0 - 2.4,
          pz = -3.4;
        b.cyl("sp_white", X(px), MAIN, Z(pz), 0.18, 0.28, 1.6, 10, { hSeg: 1 });
        b.cyl("sp_white", X(px), MAIN + 1.6, Z(pz), 0.75, 0.55, 1.3, 8, {
          hSeg: 1,
        });
        b.cyl("mahog_ws", X(px), MAIN + 2.9, Z(pz), 0.8, 0.8, 0.08, 8, {
          hSeg: 1,
        });
        col(px - 0.75, MAIN, pz - 0.75, px + 0.75, MAIN + 2.9, pz + 0.75);
        for (let k = 0; k < 5; k++)
          solid(
            "oak_ws",
            px - 1.9 + k * 0.28,
            MAIN,
            pz - 0.3 - 0.9,
            px - 1.62 + k * 0.28,
            MAIN + 0.3 + k * 0.3,
            pz - 0.3,
            { seg: false, walk: true },
          );
        b.cyl("sp_white", X(px), MAIN + 5.4, Z(pz), 1.0, 1.0, 0.3, 8, {
          hSeg: 1,
        });
        b.cyl("sp_white", X(px + 0.15), MAIN + 3.0, Z(pz), 0.06, 0.06, 2.4, 6, {
          hSeg: 1,
        });
        b.cyl("gilt", X(px), MAIN + 5.7, Z(pz), 0.35, 0.45, 0.3, 8, {
          hSeg: 1,
        }); // coronet
        for (const a of [-0.35, 0, 0.35])
          b.beam(
            "sp_white",
            P(px, MAIN + 6.0, pz),
            P(px + Math.sin(a) * 0.4, MAIN + 6.9, pz),
            0.14,
            0.05,
            { twist: a },
          ); // three feathers
      }
      // chandeliers: 7 along the nave (4 lit with candles by the refuge) + small ones under the galleries
      const chX = [-6, -3.5, -1, 1.5, 4, 6.5, 9];
      chX.forEach((x, i) =>
        PF.chandelier(
          b,
          X(x),
          MAIN + 7.3,
          Z(0),
          0.75,
          i % 2 === 0,
          root,
          CROWN - 0.2,
        ),
      );
      for (const x of [-4, 3, 10])
        for (const z of [-6.5, 6.5])
          PF.chandelier(b, X(x), GAL - 1.6, Z(z), 0.35, false, root, GAL - 0.5);
      // memorial tablets on the walls (Montgomery inside, other colonial monuments)
      for (const [x, z, ry, t, lines] of [
        [
          XE - 0.08,
          -5.8,
          -HP,
          "sp_m1",
          [
            "SACRED TO THE MEMORY OF",
            "a parish that did not leave",
            "MARCH 1967",
          ],
        ],
        [
          -8.6,
          ZS - 0.08,
          PI,
          "sp_m2",
          ["IN HONOR OF THE", "RESCUE WORKERS", "who rested here"],
        ],
        [
          6,
          ZN + 0.08,
          0,
          "sp_m3",
          [
            "THIS CHAPEL",
            "SURVIVED THE GREAT FIRE",
            "OF 1776 · AND THE",
            "FIRES OF 1967",
          ],
        ],
      ]) {
        const k = PF.texMat(
          t,
          PF.signTex(t, lines, "engraved", 256, 192, { bg: "#e2dcd0" }),
          {},
        );
        quad(k, x, MAIN + 2.2, z, 1.2, 0.9, { ry, grime: 0.3 });
        bmm(
          "marble_ws",
          x - (Math.abs(ry) === HP ? 0.05 : 0.7),
          MAIN + 1.65,
          z - (Math.abs(ry) === HP ? 0.7 : 0.05),
          x + (Math.abs(ry) === HP ? 0.05 : 0.7),
          MAIN + 1.72,
          z + (Math.abs(ry) === HP ? 0.7 : 0.05),
          { seg: false },
        );
      }

      // =====================================================================
      // NARTHEX (x -18..-11): the refuge's soup kitchen, notice board, stair down
      // =====================================================================
      {
        // soup kitchen: trestle table, kettle over a brazier, bowls, water barrels
        solid("oak_ws", -16.6, MAIN, 4.6, -12.4, MAIN + 0.85, 5.6, {
          seg: false,
        });
        for (let k = 0; k < 8; k++)
          b.cyl(
            "paint_cream",
            X(-16.2 + k * 0.5),
            MAIN + 0.85,
            Z(5.1),
            0.1,
            0.07,
            0.07,
            8,
            { hSeg: 1 },
          );
        PF.barrel(b, X(-14), MAIN, Z(7.3), { fire: true });
        b.lathe(
          "iron",
          [
            [0.02, 0],
            [0.32, 0.02],
            [0.38, 0.28],
            [0.34, 0.46],
            [0.001, 0.46],
          ],
          10,
          X(-14),
          MAIN + 0.95,
          Z(7.3),
          {},
        );
        for (const x of [-17.2, -16.4])
          PF.barrel(b, X(x), MAIN, Z(7.6), { key: "paint_teal" });
        // notice board
        bmm(
          "oak_ws",
          XW + 0.05,
          MAIN + 1.0,
          -6.4,
          XW + 0.15,
          MAIN + 2.6,
          -3.2,
          { seg: false },
        );
        const nb = PF.texMat(
          "sp_notice",
          PF.signTex(
            "sp_notice",
            [
              "REFUGE RULES",
              "1. Weapons holstered inside",
              "2. No pills in the chapel",
              "3. Everybody works",
              "4. Soup at sundown",
              "5. Sister C.'s word is final",
            ],
            "enamel",
            320,
            320,
            { bg: "#d8d0b8", fg: "#2a2a3a" },
          ),
          {},
        );
        quad(nb, XW + 0.17, MAIN + 1.8, -4.8, 1.4, 1.4, { ry: HP, grime: 0.3 });
        // stair down to the undercroft (south side), rail around the hole
        PF.stairs(
          b,
          "flagstone",
          X(-17.2),
          Z(2.45),
          HP,
          1.6,
          5.3,
          UNDER + 0.05,
          MAIN,
          { base: UNDER, grime: 0.5 },
        );
        PF.rail(b, X(-17.4), Z(1.55), X(-11.8), Z(1.55), MAIN, { key: "iron" });
        PF.rail(b, X(-17.4), Z(3.35), X(-11.8), Z(3.35), MAIN, { key: "iron" });
        // lantern + benches
        PF.cageLamp(b, X(-14), GAL - 0.9, Z(-4), 0xffd8a0, root);
        PF.bench(b, X(-15.5), MAIN, Z(-7.6), 0);
        PF.bench(b, X(-12.5), MAIN, Z(-7.6), 0);
        D.crates(b, X(-17.2), MAIN, Z(-7.6), 2, 61);
        // Georgian dress: white-painted panelled wainscot with a dado rail on every narthex wall (door gaps kept
        // clear), fielded panels, and the marble memorial tablets St. Paul's walls are known for
        const wains = (ax, az, bx, bz, nx, nz) => {
          const len = Math.hypot(bx - ax, bz - az),
            ux = (bx - ax) / len,
            uz = (bz - az) / len;
          const ry = Math.atan2(nx, nz),
            cx = (ax + bx) / 2 + nx * 0.03,
            cz = (az + bz) / 2 + nz * 0.03;
          box(
            "box_pew",
            cx,
            MAIN,
            cz,
            Math.abs(ux) * len + Math.abs(nx) * 0.06,
            1.1,
            Math.abs(uz) * len + Math.abs(nz) * 0.06,
            { seg: false, grime: 0.55 },
          );
          box(
            "box_pew",
            cx + nx * 0.04,
            MAIN + 1.1,
            cz + nz * 0.04,
            Math.abs(ux) * len + Math.abs(nx) * 0.1,
            0.08,
            Math.abs(uz) * len + Math.abs(nz) * 0.1,
            { seg: false, grime: 0.4 },
          );
          box(
            "box_pew",
            cx + nx * 0.03,
            MAIN,
            cz + nz * 0.03,
            Math.abs(ux) * len + Math.abs(nx) * 0.08,
            0.16,
            Math.abs(uz) * len + Math.abs(nz) * 0.08,
            { seg: false, grime: 0.7, c: 0xa8a090 },
          ); // skirting
          const n = Math.max(1, Math.round(len / 0.9));
          for (let i = 0; i < n; i++) {
            const t = ((i + 0.5) * len) / n;
            box(
              "box_pew",
              ax + ux * t + nx * 0.07,
              MAIN + 0.3,
              az + uz * t + nz * 0.07,
              Math.abs(ux) * (len / n - 0.22) + Math.abs(nx) * 0.03,
              0.6,
              Math.abs(uz) * (len / n - 0.22) + Math.abs(nz) * 0.03,
              { seg: false, grime: 0.45, c: 0xe8e2d4 },
            );
          }
          void ry;
        };
        wains(XW, ZN, XN - 0.4, ZN, 0, 1);
        wains(XW, ZS, XN - 0.4, ZS, 0, -1); // N & S walls
        wains(XW, ZN, XW, -6.6, 1, 0);
        wains(XW, -3.0, XW, -1.1, 1, 0);
        wains(XW, 1.1, XW, 1.4, 1, 0);
        wains(XW, 3.4, XW, ZS, 1, 0); // W wall around the notice board, door & stair
        wains(XN - 0.4, ZN, XN - 0.4, -7.0, -1, 0);
        wains(XN - 0.4, -5.4, XN - 0.4, -1.5, -1, 0); // partition (west face) between its doors
        wains(XN - 0.4, 3.4, XN - 0.4, 5.4, -1, 0);
        wains(XN - 0.4, 7.0, XN - 0.4, ZS, -1, 0);
        // door surrounds (fluted white architraves + a small pediment over the nave door)
        for (const [zc, w, h] of [
          [0, 3.0, 3.3],
          [-6.2, 1.6, 2.6],
          [6.2, 1.6, 2.6],
        ]) {
          for (const sg of [-1, 1])
            box(
              "box_pew",
              XN - 0.45,
              MAIN,
              zc + sg * (w / 2 + 0.1),
              0.12,
              h + 0.05,
              0.22,
              { seg: false, grime: 0.4 },
            );
          box("box_pew", XN - 0.47, MAIN + h, zc, 0.16, 0.22, w + 0.5, {
            seg: false,
            grime: 0.4,
          });
        }
        PF.kit.pediment(
          b,
          "box_pew",
          X(XN - 0.5),
          MAIN + 3.52,
          Z(0),
          3.8,
          0.5,
          0.2,
          -HP,
          {},
        );
        // memorial tablets (white marble on dark slate backs)
        [
          [
            "IN MEMORY OF",
            "THE PARISHIONERS",
            "WHO KEPT THIS CHAPEL",
            "1776 · 1967",
          ],
          [
            "SACRED TO THE MEMORY",
            "OF THE REFUGE DEAD",
            "THEY WERE FED HERE",
            "AND WERE NOT ALONE",
          ],
          [
            "NEAR THIS PLACE",
            "WORSHIPPED",
            "GEORGE WASHINGTON",
            "APRIL 30, 1789",
          ],
        ].forEach((lines, i) => {
          const zc = [-3.5, 3.5, 0][i],
            xw = i === 2 ? XW + 0.06 : XN - 0.46,
            ry = i === 2 ? HP : -HP,
            nx = i === 2 ? 1 : -1;
          const zz = i === 2 ? -1.9 : zc;
          const tk = PF.texMat(
            "sp_tablet" + i,
            PF.signTex("sp_tablet" + i, lines, "engraved", 256, 320, {
              bg: "#e4e0d6",
            }),
            { rough: 0.4 },
          );
          box("slate", xw + nx * 0.02, MAIN + 1.55, zz, 0.06, 1.25, 1.0, {
            seg: false,
          });
          quad(tk, xw + nx * 0.06, MAIN + 2.15, zz, 0.8, 1.0, {
            ry,
            grime: 0.35,
          });
          box("marble_ws", xw + nx * 0.06, MAIN + 1.5, zz, 0.12, 0.08, 1.05, {
            seg: false,
          });
        });
      }

      // =====================================================================
      // NORTH VESTRY = the clinic (x 8..16.5, z -14..-8.5), stair to the undercroft
      // =====================================================================
      {
        const x0 = 8,
          x1 = XE,
          z0 = -14,
          z1 = ZN - 0.6;
        wall("sp_plaster", "x", x0, x1, z0 - 0.4, z0, UNDER, MAIN + 3.8, []);
        wall("sp_plaster", "z", z0, z1, x0 - 0.4, x0, UNDER, MAIN + 3.8, []);
        wall("sp_plaster", "z", z0, z1, x1, x1 + 0.4, UNDER, MAIN + 3.8, []);
        bmm("sp_white", x0, MAIN + 3.5, z0, x1, MAIN + 3.8, z1, {
          seg: false,
          noAO: true,
        });
        slab("tile_floor", x0, z0, 13.9, z1, MAIN, 0.35, {});
        slab("tile_floor", 15.9, z0, x1, z1, MAIN, 0.35, {});
        slab("tile_floor", 13.9, -9.6, 15.9, z1, MAIN, 0.35, {});
        PF.stairs(
          b,
          "flagstone",
          X(14.9),
          Z(-13.7),
          0,
          2.0,
          4.1,
          UNDER + 0.05,
          MAIN,
          { base: UNDER, grime: 0.5 },
        );
        PF.rail(b, X(13.85), Z(-9.6), X(13.85), Z(-13.9), MAIN, {
          key: "iron",
        });
        // clinic: two beds with sheets, a screen, the doctor's table, cabinet, IV stand
        for (const [x, z] of [
          [9.2, -12.6],
          [11.4, -12.6],
        ]) {
          solid("rust", x - 0.5, MAIN, z - 1.0, x + 0.5, MAIN + 0.55, z + 1.0, {
            seg: false,
            walk: true,
            surface: "metal",
          });
          bmm(
            "linen_ws",
            x - 0.46,
            MAIN + 0.55,
            z - 0.98,
            x + 0.46,
            MAIN + 0.66,
            z + 0.98,
            { seg: false },
          );
          b.cyl("chrome", X(x + 0.6), MAIN, Z(z - 0.6), 0.02, 0.02, 1.8, 4, {
            hSeg: 1,
          });
          b.box(
            "glass_dark",
            X(x + 0.6),
            MAIN + 1.6,
            Z(z - 0.6),
            0.14,
            0.24,
            0.06,
            { seg: false },
          );
        }
        solid("oak_ws", 8.4, MAIN, -10.6, 10.4, MAIN + 0.85, -9.4, {
          seg: false,
        });
        b.box("paint_cream", X(9), MAIN + 0.85, Z(-10), 0.4, 0.12, 0.3, {
          seg: false,
        });
        bmm("white_paint", 12.6, MAIN, -13.95, 13.6, MAIN + 1.9, -13.4, {
          seg: false,
        });
        const cs = PF.texMat(
          "sp_clinic",
          PF.signTex(
            "sp_clinic",
            ["INFIRMARY", "Doc Ainsworth · stitches & rad flush"],
            "enamel",
            512,
            128,
            { bg: "#e8e0c8", fg: "#8a1a1a" },
          ),
          {},
        );
        quad(cs, 12, MAIN + 2.95, ZN - 0.62, 1.8, 0.45, { ry: PI, grime: 0.2 });
      }
      // SOUTH annex = rector's office (x 8..16.5, z 8.5..14): Sister Constance's desk, terminal, safe, bookcases
      {
        const x0 = 8,
          x1 = XE,
          z0 = ZS + 0.6,
          z1 = 14;
        wall("sp_plaster", "x", x0, x1, z1, z1 + 0.4, UNDER, MAIN + 3.8, []);
        wall("sp_plaster", "z", z0, z1, x0 - 0.4, x0, UNDER, MAIN + 3.8, []);
        wall("sp_plaster", "z", z0, z1, x1, x1 + 0.4, UNDER, MAIN + 3.8, []);
        bmm("sp_white", x0, MAIN + 3.5, z0, x1, MAIN + 3.8, z1, {
          seg: false,
          noAO: true,
        });
        solid("oak_ws", x0, UNDER, z0, x1, MAIN, z1, {
          seg: false,
          walk: true,
          surface: "wood",
        });
        bmm(
          "carpet_red",
          x0 + 0.5,
          MAIN,
          z0 + 0.5,
          x1 - 0.5,
          MAIN + 0.02,
          z1 - 0.5,
          { seg: false, noAO: true },
        );
        solid("mahog_ws", 12.6, MAIN, 11.6, 14.6, MAIN + 0.8, 12.6, {
          seg: false,
        });
        D.chair(b, X(13.6), MAIN, Z(13.1), PI, false, "oak_ws");
        for (let k = 0; k < 3; k++)
          D.shelf(b, X(9.2 + k * 1.6), MAIN, Z(13.7), PI, 1.4, 4, 70 + k);
        D.painting(b, 3, X(XE - 0.07), MAIN + 2.1, Z(11.3), 1.2, 0.9, -HP);
        D.papers(b, X(12.5), MAIN, Z(10.5), 0.8, 8, 81);
      }

      // =====================================================================
      // UNDERCROFT (y 0..2.85): brick piers, the refuge's stores, burial vaults,
      // the Reliquary (locked grille, reward)
      // =====================================================================
      {
        for (const [x0, z0, x1, z1] of [
          [XW, ZN, XE, 1.6],
          [-11.8, 1.6, XE, 3.3],
          [XW, 3.3, XE, ZS],
        ])
          bmm("brick_brown", x0, MAIN - 0.36, z0, x1, MAIN - 0.35, z1, {
            segLen: 6,
            noAO: true,
          });
        for (const x of [-13, -7, -1, 5, 11])
          for (const z of [-4.3, 4.3]) {
            solid(
              "brick_brown",
              x - 0.45,
              UNDER,
              z - 0.45,
              x + 0.45,
              MAIN - 0.35,
              z + 0.45,
              { seg: false, surface: "concrete" },
            );
            bmm(
              "brick_brown",
              x - 0.45,
              MAIN - 0.8,
              z - 0.45,
              x + 0.45,
              MAIN - 0.35,
              z + 0.45,
              { seg: false },
            );
          }
        // arches between the piers along z (suggested by brick lintels)
        for (const x of [-13, -7, -1, 5, 11])
          bmm(
            "brick_brown",
            x - 0.3,
            MAIN - 0.9,
            -4.3,
            x + 0.3,
            MAIN - 0.35,
            4.3,
            { seg: false },
          );
        // stores: crates, barrels, sacks, shelves of canned goods, water drums
        for (let k = 0; k < 6; k++)
          D.crates(
            b,
            X(-10 + k * 1.3),
            UNDER + 0.05,
            Z(-7.6),
            1 + (k % 3),
            90 + k,
          );
        for (let k = 0; k < 4; k++)
          PF.barrel(b, X(-3 + k * 0.75), UNDER + 0.05, Z(-7.7), {
            key: k % 2 ? "paint_teal" : "rust",
          });
        D.shelf(b, X(2.5), UNDER + 0.05, Z(-8.1), 0, 2.6, 4, 95);
        D.shelf(b, X(5.5), UNDER + 0.05, Z(-8.1), 0, 2.6, 4, 96);
        for (let k = 0; k < 5; k++)
          b.box(
            "canvas_ws",
            X(-15 + k * 0.7),
            UNDER + 0.05,
            Z(-6.5),
            0.6,
            0.5,
            0.45,
            { ry: k * 0.3, seg: false, c: 0xc8b088 },
          );
        // burial vaults: loculi walls along the south side (sealed slabs, some broken open with bones)
        // the family vaults: a wall of loculi, each sealed with an inscribed marble tablet in a brick reveal;
        // a few broken open (lid on the floor, bones in the dark), the refuge's candles & paper flowers below
        const plq = PF.plaqueKey();
        let li = 0;
        for (let x = -15; x < 7; x += 1.25)
          for (let row = 0; row < 2; row++) {
            const y0 = UNDER + 0.4 + row * 1.1,
              open = (li * 7 + row * 3) % 11 === 4;
            bmm(
              "brick_brown",
              x - 0.62,
              y0 - 0.06,
              ZS - 0.52,
              x + 0.62,
              y0 + 1.01,
              ZS - 0.12,
              { seg: false, grime: 0.7 },
            );
            if (open) {
              quad("glass_broken", x, y0 + 0.47, ZS - 0.53, 0.98, 0.84, {
                ry: PI,
                noAO: true,
                grime: 0,
              });
              b.box(
                "bone",
                X(x - 0.15),
                y0 + 0.02,
                Z(ZS - 0.6),
                0.42,
                0.05,
                0.06,
                { ry: 0.3, seg: false },
              );
              b.sphere("bone", X(x + 0.2), y0 + 0.1, Z(ZS - 0.62), 0.09, {
                ws: 7,
                hs: 5,
              });
              b.box(
                "marble_ws",
                X(x + 0.3),
                UNDER + 0.05,
                Z(ZS - 1.0),
                1.0,
                0.85,
                0.08,
                { rx: -0.35, ry: 0.2, seg: false, grime: 0.7 },
              );
              D.rubble(b, X(x), UNDER + 0.05, Z(ZS - 0.9), 0.25, 3, 600 + li);
            } else {
              bmm(
                (li + row) % 3 ? "marble_ws" : "slate",
                x - 0.5,
                y0 + 0.02,
                ZS - 0.56,
                x + 0.5,
                y0 + 0.93,
                ZS - 0.5,
                { seg: false, grime: 0.6 },
              );
              const pi = (li * 3 + row * 5) % 8,
                u0 = (pi % 4) * 0.25,
                v0 = pi < 4 ? 0.5 : 0;
              quad(plq, x, y0 + 0.47, ZS - 0.565, 0.84, 0.44, {
                ry: PI,
                uvRect: [u0, v0, u0 + 0.25, v0 + 0.5],
                grime: 0.4,
                noAO: true,
              });
            }
            li++;
          }
        for (const x of [-12.5, -6.2, 1.3]) {
          PF.candles(b, X(x), UNDER + 0.05, Z(ZS - 0.85), 5, 610 + x, root);
          for (let k = 0; k < 4; k++) {
            b.cyl(
              "grass",
              X(x + 0.3 + k * 0.08),
              UNDER + 0.05,
              Z(ZS - 0.8),
              0.006,
              0.006,
              0.3,
              3,
              { hSeg: 1, rz: (k - 1.5) * 0.15 },
            );
            b.sphere(
              k % 2 ? "paint_red" : "linen_ws",
              X(x + 0.3 + k * 0.08 + (k - 1.5) * 0.04),
              UNDER + 0.35,
              Z(ZS - 0.8),
              0.035,
              { ws: 6, hs: 4 },
            );
          }
        }
        col(-15.6, UNDER, ZS - 0.5, 6.6, UNDER + 2.6, ZS - 0.1);
        const vk = PF.texMat(
          "sp_vaults",
          PF.signTex(
            "sp_vaults",
            ["FAMILY VAULTS", "REST IN PEACE"],
            "engraved",
            512,
            128,
            { bg: "#cfc8b8" },
          ),
          {},
        );
        quad(vk, -4, UNDER + 2.55, ZS - 0.52, 2.6, 0.5, { ry: PI, grime: 0.3 });
        // lanterns
        for (const x of [-12, -2, 8])
          PF.cageLamp(b, X(x), MAIN - 0.9, Z(0), 0xffb060, root);
        // the Reliquary: a bricked niche behind an iron grille (lock 50) under the chancel
        const rx0 = 11.8,
          rx1 = 16.4,
          rz0 = 3.4,
          rz1 = 8.4;
        wall("brick_brown", "x", rx0, rx1, rz0 - 0.3, rz0, UNDER, MAIN - 0.35, [
          { c: 14.1, w: 1.4, y0: UNDER, h: 2.2 },
        ]);
        wall(
          "brick_brown",
          "z",
          rz0,
          rz1,
          rx0 - 0.3,
          rx0,
          UNDER,
          MAIN - 0.35,
          [],
        );
        for (let k = 0; k < 7; k++)
          box("iron", 13.45 + k * 0.2, UNDER, rz0 - 0.15, 0.04, 2.2, 0.04, {
            seg: false,
          });
        solid("marble_ws", 13.4, UNDER, 6.8, 15.8, UNDER + 0.95, 8.2, {
          seg: false,
        }); // General's sarcophagus
        bmm("marble_ws", 13.3, UNDER + 0.95, 6.7, 15.9, UNDER + 1.1, 8.3, {
          seg: false,
        });
        const rq = PF.texMat(
          "sp_reliq",
          PF.signTex(
            "sp_reliq",
            ["RELIQUARY", "of the Parish"],
            "engraved",
            256,
            96,
            { bg: "#b8b0a0" },
          ),
          {},
        );
        quad(rq, 14.1, UNDER + 2.45, rz0 - 0.32, 1.4, 0.5, {
          ry: PI,
          grime: 0.3,
        });
        PF.sp = PF.sp || {};
        PF.sp.reliqDoor = P(14.1, UNDER + 1.1, rz0 - 0.4);
        PF.candles(b, X(15.4), UNDER + 1.1, Z(7.2), 4, 58, root);
        // the parish treasures: a gilt reliquary casket, chalices & paten, the processional cross on the wall
        b.box("gilt", X(14.1), UNDER + 1.1, Z(7.5), 0.6, 0.32, 0.36, {
          seg: false,
        });
        for (const sx of [-1, 1])
          b.lathe(
            "gilt",
            [
              [0.02, 0],
              [0.05, 0.03],
              [0.02, 0.1],
              [0.04, 0.14],
              [0.001, 0.18],
            ],
            6,
            X(14.1 + sx * 0.26),
            UNDER + 1.42,
            Z(7.5),
            {},
          );
        for (const [x, z] of [
          [13.7, 7.0],
          [14.6, 7.05],
        ])
          b.lathe(
            "gilt",
            [
              [0.001, 0],
              [0.07, 0.005],
              [0.02, 0.03],
              [0.015, 0.12],
              [0.06, 0.16],
              [0.07, 0.24],
              [0.001, 0.24],
            ],
            10,
            X(x),
            UNDER + 1.1,
            Z(z),
            {},
          );
        b.cyl("gilt", X(15.0), UNDER + 1.1, Z(7.3), 0.12, 0.12, 0.01, 12, {
          hSeg: 1,
        });
        b.box("gilt", X(14.1), UNDER + 1.4, Z(8.35), 0.08, 1.1, 0.06, {
          seg: false,
        });
        b.box("gilt", X(14.1), UNDER + 2.15, Z(8.35), 0.55, 0.08, 0.06, {
          seg: false,
        });
        PF.glow(P(14.4, UNDER + 1.4, 7.4), 0xffc060, 1.0, root, {
          intensity: 0.8,
          flicker: 0.2,
        });
      }

      // =====================================================================
      // BELFRY (separate area): octagonal bell chamber with louvred openings,
      // the bell on its yoke, the lookout's nest, the locked stash
      // =====================================================================
      {
        const R0 = 3.2;
        slab("planks", BX - 4, BZ - 4, BX + 4, BZ + 4, BY, 0.3, {
          surface: "wood",
        });
        for (let i = 0; i < 8; i++) {
          const a0 = (i / 8) * TAU + PI / 8,
            a1 = ((i + 1) / 8) * TAU + PI / 8;
          const pA = [BX + Math.cos(a0) * R0, BZ + Math.sin(a0) * R0],
            pB = [BX + Math.cos(a1) * R0, BZ + Math.sin(a1) * R0];
          const mx = (pA[0] + pB[0]) / 2,
            mz = (pA[1] + pB[1]) / 2,
            len = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]);
          const ry = Math.atan2(-(pB[1] - pA[1]), pB[0] - pA[0]);
          b.box("sp_white", X(mx), BY, Z(mz), len + 0.1, 1.0, 0.3, {
            ry,
            seg: false,
          });
          b.box("sp_white", X(mx), BY + 4.2, Z(mz), len + 0.1, 1.4, 0.3, {
            ry,
            seg: false,
          });
          // louvres with daylight behind
          const nrm = Math.atan2(
            Math.cos((a0 + a1) / 2),
            Math.sin((a0 + a1) / 2),
          );
          void nrm;
          const ox = Math.cos((a0 + a1) / 2) * 0.2,
            oz = Math.sin((a0 + a1) / 2) * 0.2;
          {
            const inRy = Math.atan2(-ox, -oz);
            quad("sky_view", mx + ox, BY + 2.6, mz + oz, len - 0.3, 3.2, {
              ry: inRy,
              noAO: true,
              uvRect: PF.skyRect(r, len - 0.3, 3.2),
            });
          }
          for (let k = 0; k < 7; k++)
            b.box(
              "rotten",
              X(mx),
              BY + 1.2 + k * 0.45,
              Z(mz),
              len - 0.3,
              0.06,
              0.34,
              { ry, rx: 0.5, seg: false, noAO: true },
            );
          PF.colWall(
            X(pA[0]),
            Z(pA[1]),
            X(pB[0]),
            Z(pB[1]),
            0.35,
            BY,
            BY + 5.6,
            { walkable: false },
          );
          // columns at the corners
          b.cyl(
            "sp_white",
            X(BX + Math.cos(a0) * R0),
            BY,
            Z(BZ + Math.sin(a0) * R0),
            0.2,
            0.22,
            5.6,
            8,
            { hSeg: 1 },
          );
        }
        bmm(
          "sp_white",
          BX - 3.6,
          BY + 5.6,
          BZ - 3.6,
          BX + 3.6,
          BY + 5.9,
          BZ + 3.6,
          { seg: false, noAO: true },
        );
        // bell on a timber yoke
        bmm(
          "oak_ws",
          BX - 2.6,
          BY + 3.3,
          BZ - 0.2,
          BX + 2.6,
          BY + 3.6,
          BZ + 0.2,
          { seg: false },
        );
        for (const sx of [-2.4, 2.4])
          solid(
            "oak_ws",
            BX + sx - 0.15,
            BY,
            BZ - 0.15,
            BX + sx + 0.15,
            BY + 3.3,
            BZ + 0.15,
            { seg: false },
          );
        b.lathe(
          "bronze",
          [
            [0.05, 0],
            [0.9, 0],
            [0.8, 0.25],
            [0.6, 0.9],
            [0.45, 1.3],
            [0.05, 1.35],
          ],
          16,
          X(BX),
          BY + 1.95,
          Z(BZ),
          {},
        );
        b.cyl("iron", X(BX), BY + 2.1, Z(BZ), 0.06, 0.1, 0.9, 6, { hSeg: 1 });
        b.beam(
          "rope",
          P(BX + 0.3, BY + 3.3, BZ),
          P(BX + 0.6, BY + 0.5, BZ + 0.4),
          0.02,
          0.02,
          {},
        );
        // Hezekiah's lookout nest: a sandbag rest under the east louvres, bedroll, binoculars, the rifle rack,
        // empty cans, the lookout log
        D.chair(b, X(BX - 2.0), BY, Z(BZ + 1.6), -2.4, false, "oak_ws");
        solid("oak_ws", BX + 1.2, BY, BZ + 1.8, BX + 2.4, BY + 0.8, BZ + 2.4, {
          seg: false,
        });
        PF.sandbags(b, X(BX + 2.3), Z(BZ - 0.9), X(BX + 2.3), Z(BZ + 0.9), 2, {
          y: BY,
          noCollide: true,
        });
        D.mattress(b, X(BX - 1.2), BY + 0.01, Z(BZ + 2.0), HP + 0.2, 0x6a5a48);
        b.cyl(
          "black_enamel",
          X(BX + 1.55),
          BY + 0.8,
          Z(BZ + 2.05),
          0.035,
          0.035,
          0.14,
          8,
          { rz: HP, hSeg: 1 },
        );
        b.cyl(
          "black_enamel",
          X(BX + 1.55),
          BY + 0.8,
          Z(BZ + 2.16),
          0.035,
          0.035,
          0.14,
          8,
          { rz: HP, hSeg: 1 },
        ); // binoculars
        bmm("oak_ws", BX - 0.6, BY, BZ + 2.55, BX + 0.6, BY + 1.4, BZ + 2.65, {
          seg: false,
        });
        for (let k = 0; k < 3; k++)
          box(
            "oak_ws",
            -0.4 + k * 0.4 + BX,
            BY + 0.3,
            BZ + 2.5,
            0.06,
            0.06,
            0.2,
            { seg: false },
          );
        b.beam(
          "iron",
          P(BX - 0.3, BY + 0.35, BZ + 2.45),
          P(BX - 0.2, BY + 1.45, BZ + 2.5),
          0.05,
          0.08,
          {},
        ); // the hunting rifle in the rack
        b.beam(
          "oak_ws",
          P(BX - 0.3, BY + 0.2, BZ + 2.45),
          P(BX - 0.28, BY + 0.6, BZ + 2.47),
          0.07,
          0.1,
          {},
        );
        for (let k = 0; k < 6; k++)
          b.cyl(
            "rust",
            X(BX + 0.6 + r() * 1.2),
            BY + (r() < 0.5 ? 0.02 : 0.05),
            Z(BZ - 1.5 + r() * 1.2),
            0.035,
            0.035,
            0.1,
            7,
            { hSeg: 1, open: true, rz: r() < 0.6 ? HP : 0, ry: r() * 3 },
          );
        PF.readable(
          P(BX + 1.8, BY + 0.85, BZ + 2.0),
          "Lookout Log",
          '"Day 311. Stitchers flashing a lamp from the Singer lantern again, 3 long 2 short. Day 312. Convoy in at the Custom House, 4 pack oxen, 1 limping. Day 315. Something big moving on Broadway at night. Not a ripjaw. Worse: a Patrolman that still thinks it\'s a crossing guard. — H."',
        );
        // the locked stash: an iron-bound chest in a locked cage (combination from Hezekiah, or scratched on the bell frame)
        PF.scrawlAt(
          P(BX - 2.5, BY + 1.2, BZ - 0.9),
          "Scratch marks on the bell frame",
          '"1-7-6-6. In case I forget. I won\'t. — H."',
          "pws_lk_sp_belfry",
        );
        bmm("iron", BX - 2.5, BY, BZ - 2.5, BX - 0.9, BY + 1.6, BZ - 2.45, {
          seg: false,
        });
        for (let k = 0; k < 8; k++)
          box("iron", BX - 2.45 + k * 0.2, BY, BZ - 0.95, 0.04, 1.6, 0.04, {
            seg: false,
          });
        col(BX - 2.6, BY, BZ - 1.0, BX - 0.8, BY + 1.6, BZ - 0.9);
        col(BX - 0.9, BY, BZ - 2.6, BX - 0.8, BY + 1.6, BZ - 0.9);
        bmm(
          "iron",
          BX - 2.5,
          BY + 1.6,
          BZ - 2.5,
          BX - 0.8,
          BY + 1.64,
          BZ - 0.95,
          { seg: false },
        );
        // the hatch down (ladder)
        bmm(
          "oak_ws",
          BX + 1.2,
          BY + 0.01,
          BZ - 2.4,
          BX + 2.4,
          BY + 0.05,
          BZ - 1.2,
          { seg: false },
        );
        for (let k = 0; k < 4; k++)
          box(
            "iron",
            BX + 1.8,
            BY + 0.06,
            BZ - 2.2 + k * 0.3,
            0.9,
            0.04,
            0.05,
            { seg: false },
          );
      }

      PF.flushGlows(root);
      PF.flushFires();
      b.build(root, { lodDistInt: 400 });

      // =====================================================================
      // anchors, doors, props, NPC placement
      // =====================================================================
      const A = {
        entrance: PF.anchor(X(-16.2), MAIN + 0.05, Z(-1.2), -HP),
        constance: PF.anchor(X(CH0 - 0.8), MAIN, Z(0.6), HP),
        doctor: PF.anchor(X(10.2), MAIN, Z(-10.9), -HP * 0.3),
        mercy: PF.anchor(X(-15.2), MAIN, Z(6.3), 0),
        wendell: PF.anchor(X(0.5), MAIN + 0.05, Z(-7.2), -HP),
        refugee1: PF.anchor(X(3.2), MAIN, Z(7.6), -HP),
        refugee2: PF.anchor(X(5.7), MAIN, Z(-7.7), HP),
        refugee3: PF.anchor(X(-8.5), GAL, Z(-2.5), -HP),
        lookout: PF.anchor(X(BX - 1.2), BY, Z(BZ + 1.4), -2.4),
        office: PF.anchor(X(12.4), MAIN, Z(10.4), PI),
        nave: PF.anchor(X(0), MAIN, Z(0), HP),
        undercroft: PF.anchor(X(-4), UNDER + 0.05, Z(0), HP),
        reliquary: PF.anchor(X(14.6), UNDER + 0.05, Z(6.0), 0),
        belfry: PF.anchor(X(BX + 1.8), BY, Z(BZ - 0.4), PI),
        gallery_w: PF.anchor(X(XN + 2.8), GAL, Z(1.8), -HP),
        seal: PF.sp.sealPos,
      };
      Object.assign(A, {
        npc1: A.constance,
        npc2: A.doctor,
        npc3: A.mercy,
        npc4: A.wendell,
        merchant: A.mercy,
        spawn1: A.nave,
        spawn2: P(-6, MAIN, 6.4),
        spawn3: P(6, GAL, -6),
        spawn4: P(-14, MAIN, -4),
        spawn5: A.undercroft,
        spawn6: P(6, UNDER + 0.05, 0),
        loot1: A.reliquary,
        loot2: A.belfry,
        loot3: A.office,
      });
      PF.sp.int = A;
      const SPX = PF.SP;
      const door0 = SPX.door;
      PF.door({
        id: "pws_sp_in",
        pos: door0,
        label: "St. Paul's Chapel",
        verb: "Enter",
        radius: 1.4,
        target: { x: A.entrance.x, y: A.entrance.y, z: A.entrance.z, yaw: -HP },
        sound: "door_open",
      });
      PF.door({
        id: "pws_sp_out",
        pos: P(XW + 0.3, MAIN + 1.5, 0),
        label: "8th Avenue",
        verb: "Exit",
        radius: 1.4,
        target: { x: door0.x - 2.6, y: 0.25, z: door0.z, yaw: HP },
        sound: "door_open",
      });
      // tower stair: west gallery ↔ belfry (the ladder hatch)
      PF.door({
        id: "pws_sp_belfry_up",
        pos: P(XN + 0.15, GAL + 1.3, 3.6),
        label: "Tower Stair (Belfry)",
        verb: "Climb",
        radius: 1.0,
        target: { x: X(BX + 1.8), y: BY + 0.05, z: Z(BZ - 0.3), yaw: PI },
        sound: "door_open",
      });
      bmm("oak_ws", XN + 0.02, GAL, 3.0, XN + 0.12, GAL + 2.4, 4.2, {
        seg: false,
      });
      PF.door({
        id: "pws_sp_belfry_down",
        pos: P(BX + 1.8, BY + 0.4, BZ - 1.8),
        label: "Ladder down (West Gallery)",
        verb: "Climb",
        radius: 0.9,
        target: { x: X(XN + 1.9), y: GAL + 0.05, z: Z(3.6), yaw: PI },
        sound: "door_open",
      });
      // containers, terminal, beds, clinic supplies
      PF.prop("terminal", {
        x: X(13.1),
        y: MAIN + 0.8,
        z: Z(12.3),
        yaw: PI,
        terminalId: "pws_sp_parish",
        mount: "bare",
        id: "pws_sp_term",
      });
      PF.prop("safe", {
        x: X(9.1),
        y: MAIN,
        z: Z(9.6),
        yaw: HP,
        lock: PF.lockSpec("pws_lk_sp_safe"),
        loot: "safe",
        id: "pws_sp_safe",
        owner: "settlers",
        name: "Rector's Safe",
      });
      PF.prop("first_aid", {
        x: X(12.4),
        y: MAIN + 1.4,
        z: Z(-13.85),
        yaw: 0,
        id: "pws_sp_aid",
        owner: "settlers",
      });
      PF.prop("bed", {
        x: X(-6),
        y: MAIN + 0.45,
        z: Z(6.4),
        yaw: HP,
        id: "pws_sp_cot",
        owner: "settlers",
        name: "Refuge Cot",
      });
      PF.prop("footlocker", {
        x: X(-9.6),
        y: UNDER + 0.05,
        z: Z(-7.4),
        yaw: 0,
        loot: "footlocker",
        id: "pws_sp_stores",
        owner: "settlers",
        name: "Refuge Stores",
      });
      PF.prop("radio", {
        x: X(-12.8),
        y: MAIN + 0.85,
        z: Z(5.1),
        yaw: HP,
        id: "pws_sp_radio",
      });
      PF.prop("footlocker", {
        x: X(15.2),
        y: UNDER + 0.05,
        z: Z(4.4),
        yaw: PI,
        items: [
          ["pws_montgomery_saber", 1],
          ["old_dollars", 6],
          ["pws_communion_silver", 1],
          ["pws_note_1776", 1],
        ],
        id: "pws_sp_reliquary",
        name: "Reliquary Chest",
      });
      PF.prop("footlocker", {
        x: X(BX - 1.7),
        y: BY,
        z: Z(BZ - 1.8),
        yaw: 0,
        lock: PF.lockSpec("pws_lk_sp_belfry"),
        items: [
          ["pws_reliq_key", 1],
          ["ammo_308", 24],
          ["rally_tonic", 2],
          ["iodine_tabs", 1],
          ["pws_note_lookout", 1],
        ],
        id: "pws_sp_belfry_stash",
        name: "Lookout's Strongbox",
      });
      PF.pickup("pws_reel_constance", 1, P(13.9, MAIN + 0.82, 11.9));
      PF.pickup("pws_note_soup", 1, P(-15.8, MAIN + 0.87, 5.0));
      for (const [id, n, x, y, z] of [
        ["morphine_syrette", 1, 9.8, MAIN + 0.87, -9.8],
        ["iodine_tabs", 1, 9.1, MAIN + 0.98, -10.2],
        ["purified_water", 2, 2.6, UNDER + 1.29, -7.95],
        ["franks_and_beans", 1, 5.2, UNDER + 0.84, -7.95],
        ["golden_plain_jerky", 1, 5.8, UNDER + 1.29, -7.95],
        ["salisbury_steak", 1, -2.4, UNDER + 0.95, -7.7],
        ["dirty_water", 1, -14.7, MAIN + 0.87, 4.8],
        ["duct_tape", 1, 12.9, MAIN + 0.82, 11.8],
        ["freedom_flakes", 1, -13.2, MAIN + 0.87, 5.4],
        ["ammo_308", 8, BX + 1.7, BY + 0.82, BZ + 2.2],
      ])
        PF.pickup(id, n, P(x, y, z), { owner: "settlers" });
      // the reliquary grille (locked door within the undercroft; opens in place)
      const grille = PF.use({
        pos: PF.sp.reliqDoor,
        radius: 0.9,
        range: 2.6,
        label: () =>
          PF.flag("sp_reliq_open") ? "Reliquary (open)" : "Reliquary Grille",
        verb: () => (PF.flag("sp_reliq_open") ? "Look" : "Open"),
        locked: () =>
          PF.flag("sp_reliq_open") || PF.inv.count("pws_reliq_key") > 0
            ? null
            : "Locked — needs the Reliquary key",
        onInteract() {
          if (PF.flag("sp_reliq_open")) {
            G.notify(
              "The General's sarcophagus and the parish reliquary. Somebody still lights candles down here.",
            );
            return;
          }
          PF.lockOpen("pws_lk_sp_reliq", () =>
            openReliq(
              "You unlock the grille with Sister Constance's old iron key.",
            ),
          );
        },
      });
      void grille;
      function openReliq(msg) {
        PF.setFlag("sp_reliq_open", true);
        G.notify(msg);
        PF.sfx("door_open", PF.sp.reliqDoor);
        PF.say(
          "pws_sp_constance",
          "You found the Reliquary? Take what you need — just leave the General his rest.",
          5,
        );
      }
      // grille blocks the niche until opened
      const gCol = PF.colMM(
        X(13.4),
        UNDER,
        Z(3.2),
        X(14.8),
        UNDER + 2.2,
        Z(3.45),
        { walkable: false },
      );
      PF.flagWatch.push(() => {
        if (!gCol) return;
        const open = !!PF.flag("sp_reliq_open");
        if (open) {
          gCol.minY = -99;
          gCol.maxY = -98;
        } else {
          gCol.minY = UNDER;
          gCol.maxY = UNDER + 2.2;
        }
      });
      PF.onReset.push(() => {
        if (gCol) {
          gCol.minY = UNDER;
          gCol.maxY = UNDER + 2.2;
        }
      });

      // The Great Seal painting: shown above Washington's pew once returned (quest pws_seal)
      const sealMesh = PF.mesh(
        PF.sealKey(false),
        new THREE.PlaneGeometry(1.45, 1.45),
      );
      sealMesh.position.copy(PF.sp.sealPos);
      sealMesh.position.z += 0.02;
      sealMesh.visible = false;
      root.add(sealMesh);
      PF.flagWatch.push(() => {
        sealMesh.visible = !!PF.flag("seal_returned");
      });
      PF.onReset.push(() => {
        sealMesh.visible = false;
      });

      // ---------- NPCs (friendly refuge) ----------
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      PF.npc({
        id: "pws_sp_constance",
        type: "human",
        name: "Sister Constance",
        outfit: "settler",
        gender: "f",
        faction: "settlers",
        level: 8,
        pos: pos(A.constance),
        yaw: A.constance.yaw,
        ai: "guard",
        home: { x: A.constance.x, z: A.constance.z, r: 2.0 },
        dialogue: "pws_dlg_constance",
        essential: true,
        weapon: "none",
        seed: 7301,
        voice: "female",
        noRespawn: true,
        barks: [
          "Peace be with you.",
          "Mind the cots, friend.",
          "There's soup at sundown.",
          "The chapel stood through two great fires. It will stand through us.",
        ],
      });
      PF.npc({
        id: "pws_sp_doc",
        type: "human",
        name: "Doc Ainsworth",
        outfit: "doctor",
        gender: "m",
        faction: "settlers",
        level: 7,
        pos: pos(A.doctor),
        yaw: A.doctor.yaw,
        ai: "guard",
        home: { x: A.doctor.x, z: A.doctor.z, r: 1.5 },
        dialogue: "pws_dlg_doc",
        essential: true,
        weapon: "none",
        seed: 7302,
        merchant: {
          scrip: 400,
          stock: [
            ["rally_tonic", 6],
            ["prussian_blue", 4],
            ["iodine_tabs", 3],
            ["morphine_syrette", 1],
            ["purified_water", 4],
          ],
          restock: 3,
        },
        barks: [
          "Next!",
          "Hold still. This'll sting. Everything stings.",
          "Twenty-two years of practice and I still hate needles.",
        ],
      });
      PF.npc({
        id: "pws_sp_mercy",
        type: "human",
        name: "Mercy Tolliver",
        outfit: "merchant",
        gender: "f",
        faction: "settlers",
        level: 5,
        pos: pos(A.mercy),
        yaw: A.mercy.yaw,
        ai: "guard",
        home: { x: A.mercy.x, z: A.mercy.z, r: 1.8 },
        dialogue: "pws_dlg_mercy",
        weapon: "none",
        seed: 7303,
        merchant: {
          scrip: 250,
          stock: [
            ["purified_water", 6],
            ["golden_plain_jerky", 4],
            ["franks_and_beans", 3],
            ["pigeon_on_a_stick", 3],
            ["ox_steak", 2],
            ["fizzo_cola", 3],
          ],
          restock: 3,
        },
        barks: [
          "Soup's thin but it's hot.",
          "Wash your hands. Or don't. It's the apocalypse.",
          "Bowls back on the table when you're done!",
        ],
      });
      PF.npc({
        id: "pws_sp_wendell",
        type: "human",
        name: "Old Wendell",
        outfit: "survivor",
        gender: "m",
        faction: "settlers",
        level: 2,
        pos: pos(A.wendell),
        yaw: A.wendell.yaw,
        ai: "sit",
        home: { x: A.wendell.x, z: A.wendell.z, r: 0.3 },
        dialogue: "pws_dlg_wendell",
        weapon: "none",
        seed: 7304,
        barks: [
          "Washington sat right here, you know.",
          "My granddad fixed the steeple clock.",
          "They took the eagle. Heathens.",
        ],
      });
      [
        ["pws_sp_ref1", "Refugee", A.refugee1, "f", "settler"],
        ["pws_sp_ref2", "Refugee", A.refugee2, "m", "survivor"],
        ["pws_sp_ref3", "Choir Kid", A.refugee3, "f", "settler"],
      ].forEach(([id, nm, a, g, o], i) =>
        PF.npc({
          id,
          type: "human",
          name: nm,
          outfit: o,
          gender: g,
          faction: "settlers",
          level: 1 + i,
          pos: pos(a),
          yaw: a.yaw,
          ai: i === 1 ? "sit" : "guard",
          home: { x: a.x, z: a.z, r: 1.2 },
          weapon: "none",
          seed: 7310 + i,
          barks: [
            [
              "Is it safe out there yet?",
              "Sister Constance found me under a bus.",
            ],
            ["First roof I've slept under in a year.", "Don't touch my cot."],
            [
              "La la laaa... I'm practising!",
              "Sister says I sing like an angel. A loud one.",
            ],
          ][i],
        }),
      );
      PF.npc({
        id: "pws_sp_lookout",
        type: "human",
        name: "Hezekiah the Lookout",
        outfit: "leather_armor",
        gender: "m",
        faction: "settlers",
        level: 6,
        pos: pos(A.lookout),
        yaw: A.lookout.yaw,
        ai: "guard",
        home: { x: A.lookout.x, z: A.lookout.z, r: 0.8 },
        dialogue: "pws_dlg_hezekiah",
        weapon: "hunting_rifle",
        seed: 7320,
        barks: [
          "Seen smoke over the Singer again.",
          "Stitchers up in that lantern have a better view than me. Galls me.",
        ],
      });
      // exterior guards
      const E = PF.SP.anchors || {};
      if (E.guard)
        PF.npc({
          id: "pws_sp_ramona",
          type: "human",
          name: "Ramona Diaz",
          outfit: "combat_armor",
          gender: "f",
          faction: "settlers",
          level: 8,
          pos: pos(E.guard),
          yaw: E.guard.yaw || 0,
          ai: "guard",
          home: { x: E.guard.x, z: E.guard.z, r: 2.0 },
          dialogue: "pws_dlg_ramona",
          weapon: "combat_shotgun",
          seed: 7330,
          barks: [
            "Weapons holstered past the gate.",
            "Keep walking or come in. Don't loiter.",
            "Evening. Soup's on at sundown.",
          ],
        });
      if (E.portico)
        PF.npc({
          id: "pws_sp_gate2",
          type: "human",
          name: "Refuge Guard",
          outfit: "settler",
          gender: "m",
          faction: "settlers",
          level: 5,
          pos: pos(E.portico),
          yaw: E.portico.yaw || 0,
          ai: "guard",
          home: { x: E.portico.x, z: E.portico.z, r: 3.0 },
          weapon: "hunting_rifle",
          seed: 7331,
          barks: [
            "Quiet out tonight.",
            "That old church has seen worse than us.",
          ],
        });
      if (E.cook)
        PF.npc({
          id: "pws_sp_cook",
          type: "human",
          name: "Brother Amos",
          outfit: "settler",
          gender: "m",
          faction: "settlers",
          level: 3,
          pos: pos(E.cook),
          yaw: E.cook.yaw || 0,
          ai: "guard",
          home: { x: E.cook.x, z: E.cook.z, r: 1.0 },
          weapon: "none",
          seed: 7332,
          barks: ["Pigeon stew. Mostly pigeon.", "Stir, stir, stir..."],
        });

      PF.register(
        "st_pauls_chapel",
        PF.root || null,
        Object.assign({}, SPX.anchors || {}, A, {
          exterior_entrance: (SPX.anchors || {}).entrance,
        }),
        { interiorRoot: root, interiorKey: KEY },
      );
    },
    12,
  );
})();
