/* src/poi_eastside/10_journal_bldg.js */
/* =====================================================================
 * NEW RAD CITY — POI EASTSIDE · 10 The First Journal Building
 *
 * EXTERIOR (site x 292..330, z -268..-237, front on 42nd Street): Raymond
 *   Hood's 1930 slab — unbroken vertical stripes of white brick piers
 *   between russet spandrels and dark window columns, flat cut-off tops
 *   with setbacks (tower, setback, crown — the crown's north-east corner
 *   blown away, girders bared), the tall limestone entrance portal with
 *   the carved sunburst relief "THE JOURNAL", east wing with a rooftop water
 *   tower and the loading dock, a lattice antenna on the crown. Settled
 *   as the "Daily Ruin": hand-painted banner, amber sign, sandbags,
 *   newsstand, guard booth, newsboxes.
 * INTERIOR (cell 'journal_bldg', origin 8200,0,2000):
 *   vestibule → the ROTUNDA (black-glass dome, the GIANT GLOBE turning in
 *   its sunken, lit well, bronze compass-rose floor with city distances,
 *   world clocks, barometer & wind dials, thermometer columns, headline
 *   board, LED news ticker) → west: the NEWSROOM (desks, typewriters,
 *   copy desk, editor's glass office) → north hall → stairs down to the
 *   PRESSROOM (two rotary press lines, paper reels, folders & conveyor,
 *   catwalk, press control, main drive motor & lever, loading dock → out
 *   to the street: loop) → east hall (brass elevators) → quarters & clinic
 *   and upstairs THE MORGUE (archive stacks, microfilm, wire room).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pe) return;
  const P = G._pe,
    D = P.dress,
    E = P.dress2;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const DN = (P.dn = P.dn || {});

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  /** Striped facade on one face of a block: piers, window columns, spandrels. */
  function stripeFace(S, side, a0, a1, c, y0, y1, o) {
    o = o || {};
    const F = P.face(S, side, a0, a1, c);
    const r = P.rng("dn_face" + side + a0 + c + y0);
    const bay = o.bay || 1.5,
      n = Math.max(2, Math.round(F.len / bay)),
      bw = F.len / n;
    const fh = o.floorH || 3.3,
      wy0 = o.winStart !== undefined ? o.winStart : y0 + 1.0;
    const skip = o.skip || (() => false);
    // piers
    for (let k = 0; k <= n; k++) {
      const u = k * bw,
        corner = k === 0 || k === n,
        pw = corner ? 0.95 : 0.58;
      const ua = corner ? (k === 0 ? -0.35 : u - 0.6) : u - pw / 2,
        ub = corner ? (k === 0 ? 0.6 : u + 0.35) : u + pw / 2;
      // pier may be interrupted by the entrance portal
      let ya = y0;
      if (o.portal && u > o.portal[0] - 0.3 && u < o.portal[1] + 0.3)
        ya = Math.max(y0, o.portal[2]);
      if (o.broken && o.broken(u, y1)) {
        const top = o.broken(u, y1);
        if (top > ya + 1)
          F.box(o.pier || "dn_brick", ua, ub, ya, top, 0, 0.34, { segLen: 6 });
        continue;
      }
      F.box(o.pier || "dn_brick", ua, ub, ya, y1 + (o.pierTop || 0), 0, 0.34, {
        segLen: 6,
      });
    }
    // parapet band tying the piers at the top
    if (!o.noCap)
      F.box(
        o.pier || "dn_brick",
        -0.35,
        F.len + 0.35,
        y1 - 0.5,
        y1 + 0.15,
        0,
        0.36,
        { seg: false },
      );
    // windows per bay per floor
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) * bw;
      if (o.portal && u > o.portal[0] - 0.6 && u < o.portal[1] + 0.6) {
        if (o.portal[2] > y1) continue;
      }
      for (let y = wy0; y + 1.9 < y1 - 0.6; y += fh) {
        if (
          o.portal &&
          u > o.portal[0] - 0.6 &&
          u < o.portal[1] + 0.6 &&
          y < o.portal[2]
        )
          continue;
        if (skip(u, y)) continue;
        const q = r();
        const key =
          q < 0.06
            ? "glass_broken"
            : q < 0.1 && y < 30
              ? "wood_rotten"
              : q < 0.115 && y < 40
                ? "window_lit"
                : "glass_dark";
        F.box(key, u - bw * 0.3, u + bw * 0.3, y, y + 1.95, -0.01, 0.05, {
          seg: false,
          grime: 0.15,
          noAO: true,
        });
        // thin dark sill under each window
        F.box(
          "concrete_dark",
          u - bw * 0.32,
          u + bw * 0.32,
          y - 0.12,
          y,
          0,
          0.1,
          { seg: false, noAO: true },
        );
      }
    }
    return F;
  }

  function buildExterior() {
    const S = P.site("dn_ext", { grime: 0.45 });
    const b = S.b;
    const rn = P.rng("dn_ext");
    // pavement apron
    b.box("sidewalk", 292, 0, -268, 330, 0.06, -237, {
      segLen: 8,
      grime: 0.5,
      noAO: true,
    });
    // ---------------- massing ----------------
    const TX0 = 297,
      TX1 = 321,
      TZ0 = -262,
      TZ1 = -238; // tower
    const DOOR_X = 309; // entrance centre on 42nd St
    const portalU = [DOOR_X - 4.2 - TX0, DOOR_X + 4.2 - TX0, 13.4];
    // tower core (russet spandrel brick behind the stripes)
    b.box("dn_spandrel", TX0, 0, TZ0, TX1, 86, TZ1, { segLen: 8 });
    S.col(TX0 - 0.35, 0, TZ0 - 0.35, TX1 + 0.35, 86, TZ1 + 0.35);
    stripeFace(S, "s", TX0, TX1, TZ1, 0, 86, {
      winStart: 5.6,
      portal: portalU,
    });
    stripeFace(S, "n", TX0, TX1, TZ0, 30, 86, { winStart: 31 });
    stripeFace(S, "w", TZ0, TZ1, TX0, 20, 86, { winStart: 20.9 });
    stripeFace(S, "e", TZ0, TZ1, TX1, 38, 86, { winStart: 38.9 });
    // setback
    b.box("dn_spandrel", 299, 86, -260, 319, 98, -240, { segLen: 8 });
    S.col(299 - 0.35, 86, -260 - 0.35, 319 + 0.35, 98, -240 + 0.35);
    const ne = (u, y) => false;
    void ne;
    stripeFace(S, "s", 299, 319, -240, 86, 98, { winStart: 86.9 });
    stripeFace(S, "n", 299, 319, -260, 86, 98, {
      winStart: 86.9,
      skip: (u, y) => u < 6 && y > 92,
    });
    stripeFace(S, "w", -260, -240, 299, 86, 98, { winStart: 86.9 });
    stripeFace(S, "e", -260, -240, 319, 86, 98, {
      winStart: 86.9,
      skip: (u, y) => u > 14 && y > 92,
    });
    // crown: L-shaped — its north-east quarter is gone
    b.box("dn_spandrel", 302, 98, -257, 310, 106, -243, { segLen: 8 });
    b.box("dn_spandrel", 310, 98, -250, 316, 106, -243, { segLen: 8 });
    b.box("dn_spandrel", 310, 98, -257, 316, 100.5, -250, { segLen: 8 });
    S.col(301.6, 98, -257.4, 310.4, 106, -242.6);
    S.col(310, 98, -250.4, 316.4, 106, -242.6);
    stripeFace(S, "s", 302, 316, -243, 98, 106, { winStart: 98.9 });
    stripeFace(S, "w", -257, -243, 302, 98, 106, { winStart: 98.9 });
    stripeFace(S, "n", 302, 316, -257, 98, 106, {
      winStart: 98.9,
      broken: (u, y1) => (u < 6.5 ? 100.2 + (u % 2) * 0.8 : 0),
      skip: (u, y) => u < 6.5,
    });
    stripeFace(S, "e", -257, -243, 316, 98, 106, {
      winStart: 98.9,
      broken: (u, y1) => (u > 6.5 ? 100.4 + (u % 2) : 0),
      skip: (u, y) => u > 6.5,
    });
    // exposed broken floor edges + girders in the missing quarter
    b.box("concrete_dark", 310, 98, -250.2, 316, 106, -249.9, {
      segLen: 3,
      grime: 0.8,
    });
    b.box("concrete_dark", 309.9, 98, -257, 310.2, 106, -250, {
      segLen: 3,
      grime: 0.8,
    });
    for (let i = 0; i < 4; i++)
      E.girder(
        b,
        [310.2 + i * 1.8, 103.2, -250],
        [310.2 + i * 1.6 + rn(), 103.2 - rn() * 1.6, -256.5 + rn() * 2],
        0.22,
      );
    for (let i = 0; i < 3; i++)
      E.girder(
        b,
        [310, 100.7 + i * 1.8, -251 - i * 2],
        [315.8 - rn() * 2, 100.7 + i * 1.6 - rn(), -251 - i * 2 + rn()],
        0.2,
      );
    for (let i = 0; i < 5; i++)
      E.girder(
        b,
        [310.5 + i * 1.3, 100.5, -250.5],
        [310.5 + i * 1.3 + (rn() - 0.5), 104 + rn() * 3.5, -250.6 - rn() * 1.5],
        0.16,
      );
    D.rubble(S, 313, 100.5, -254, 2.6, { n: 14, rebar: true });
    D.rubble(S, 304, 98.1, -258.6, 1.4, { n: 6 });
    // east wing
    b.box("dn_spandrel", 321, 0, -266, 329, 38, -238, { segLen: 8 });
    S.col(321, 0, -266.35, 329.35, 38, -237.65);
    stripeFace(S, "s", 321, 329, -238, 0, 38, { winStart: 5.6 });
    stripeFace(S, "e", -266, -238, 329, 0, 38, {
      winStart: 5.6,
      skip: (u, y) => y < 5 || (u > 11 && u < 17 && y < 6),
    });
    stripeFace(S, "n", 321, 329, -266, 0, 38, { winStart: 5.6 });
    b.box("dn_spandrel", 321, 38, -264, 327, 46, -240, { segLen: 8 });
    S.col(321, 38, -264.35, 327.35, 46, -239.65);
    stripeFace(S, "s", 321, 327, -240, 38, 46, { winStart: 38.9 });
    stripeFace(S, "e", -264, -240, 327, 38, 46, { winStart: 38.9 });
    stripeFace(S, "n", 321, 327, -264, 38, 46, { winStart: 38.9 });
    // west wing + rear block
    b.box("dn_spandrel", 293, 0, -266, 297, 20, -238, { segLen: 8 });
    S.col(292.65, 0, -266.35, 297, 20, -237.65);
    stripeFace(S, "s", 293, 297, -238, 0, 20, { winStart: 5.6, bay: 1.3 });
    stripeFace(S, "w", -266, -238, 293, 0, 20, { winStart: 5.6 });
    stripeFace(S, "n", 293, 297, -266, 0, 20, { winStart: 5.6, bay: 1.3 });
    b.box("dn_spandrel", 297, 0, -267, 321, 30, -262, { segLen: 8 });
    S.col(297, 0, -267.35, 321, 30, -262);
    stripeFace(S, "n", 297, 321, -267, 0, 30, { winStart: 5.6 });
    // roofs (tar + gravel) and rooftop clutter
    for (const r of [
      [299, -260, 319, -240, 86],
      [302, -257, 316, -243, 106],
      [321, -266, 327, -238, 38],
      [321, -264, 327, -240, 46],
      [293, -266, 297, -238, 20],
      [297, -267, 321, -262, 30],
      [297, -262, 321, -238, 86],
    ]) {
      b.box(
        "tar",
        r[0] + 0.2,
        r[4],
        r[1] + 0.2,
        r[2] - 0.2,
        r[4] + 0.08,
        r[3] - 0.2,
        { segLen: 6, noAO: true },
      );
    }
    // tower top: flat, bare — the piers are simply cut off (Hood's "unfinished" top)
    E.waterTower(b, 324, 46, -252, 0.9);
    E.mast(S, 306, 106, -252, 14, { w: 1.4, glow: 2.6 });
    for (let i = 0; i < 3; i++)
      b.rod(
        "iron",
        [306, 118.5 - i * 3, -252],
        [302.5 + i * 0.2, 106.1, -247 + i * 1.5],
        0.012,
        3,
        { noAO: true },
      );
    b.box("metal", 313, 106, -248, 315.4, 107.8, -245, { seg: false }); // mechanical house
    // ---------------- 42nd Street ground floor ----------------
    const FS = P.face(S, "s", TX0, TX1, TZ1);
    FS.box("granite_dark", -0.4, FS.len + 0.4, 0, 1.1, 0, 0.42, { seg: false });
    FS.box("limestone", -0.4, FS.len + 0.4, 4.4, 5.0, 0, 0.44, { seg: false });
    for (let k = 0; k < 16; k++) {
      const u = (k + 0.5) * 1.5;
      if (u > portalU[0] - 0.6 && u < portalU[1] + 0.6) continue;
      FS.box(
        k % 5 === 2 ? "glass_broken" : "glass_dark",
        u - 0.46,
        u + 0.46,
        1.2,
        4.2,
        0,
        0.06,
        { seg: false, noAO: true },
      );
      if (k % 4 === 1)
        FS.box("wood_rotten", u - 0.5, u + 0.5, 1.4, 3.8, 0.06, 0.1, {
          seg: false,
        });
    }
    // ---------------- the entrance portal ----------------
    const pu0 = portalU[0],
      pu1 = portalU[1],
      pm = (pu0 + pu1) / 2;
    // stepped limestone jambs (3 orders)
    for (let k = 0; k < 3; k++) {
      const inset = k * 0.45,
        dz = 0.9 - k * 0.3;
      FS.box(
        "limestone",
        pu0 + inset - 0.55,
        pu0 + inset,
        0,
        13.4 - k * 0.5,
        0,
        dz,
      );
      FS.box(
        "limestone",
        pu1 - inset,
        pu1 - inset + 0.55,
        0,
        13.4 - k * 0.5,
        0,
        dz,
      );
      FS.box(
        "limestone",
        pu0 + inset - 0.55,
        pu1 - inset + 0.55,
        13.4 - k * 0.5 - 0.55,
        13.4 - k * 0.5,
        0,
        dz,
      );
    }
    // the relief panel (sunburst over the tower, the crowd, THE JOURNAL)
    const relief = P.texMat("dn_relief", P.reliefTex(), { rough: 0.95 });
    FS.quad(relief, pm, 8.45, 5.6, 7.0, 0.1);
    FS.box("limestone", pu0 + 0.9, pu1 - 0.9, 4.75, 4.95, 0, 0.3, {
      seg: false,
    });
    // black glass & brass doors + transom
    FS.box("black_glass", pu0 + 1.0, pu1 - 1.0, 0, 4.75, -0.2, 0.02, {
      seg: false,
    });
    for (let k = 0; k < 3; k++) {
      const u = pu0 + 1.6 + k * ((pu1 - pu0 - 3.2) / 2);
      FS.box("brass", u - 0.75, u + 0.75, 0.05, 3.0, 0.02, 0.08, {
        seg: false,
      });
      FS.box("glass_dark", u - 0.62, u + 0.62, 0.3, 2.85, 0.08, 0.1, {
        seg: false,
      });
      FS.box("brass", u - 0.03, u + 0.03, 0.3, 2.85, 0.1, 0.13, { seg: false });
    }
    FS.box("brass", pu0 + 1.0, pu1 - 1.0, 3.1, 3.25, 0.02, 0.12, {
      seg: false,
    });
    for (let k = 0; k < 9; k++)
      FS.box(
        "brass",
        pu0 + 1.3 + k * 0.62,
        pu0 + 1.36 + k * 0.62,
        3.25,
        4.7,
        0.02,
        0.1,
        { seg: false },
      );
    // steps
    FS.box("granite", pu0 - 0.4, pu1 + 0.4, 0, 0.18, 0, 1.6, { seg: false });
    // ---------------- Daily Ruin dressing ----------------
    const ban = P.texMat(
      "dn_banner",
      P.signTex(
        "dn_banner",
        ["THE DAILY RUIN", "PRINTED ON THE FIRST JOURNAL'S OWN PRESSES"],
        "banner",
        1024,
        256,
        { bg: "#d8ccb0", fg: "#1a1612", top: 0.14 },
      ),
      { double: true, rough: 1 },
    );
    const bg = new THREE.PlaneGeometry(15, 3.6, 12, 1);
    {
      const p = bg.attributes.position;
      for (let v = 0; v < p.count; v++)
        p.setZ(v, Math.sin(((p.getX(v) + 7.5) / 15) * PI) * 0.25);
    }
    b.geo(ban, bg, P.m4(DOOR_X, 17.2, TZ1 + 0.55), {
      uv: "keep",
      noAO: true,
      grime: 0.2,
    });
    for (const s of [-1, 1])
      b.rod(
        "rust",
        [DOOR_X + s * 7.5, 19, TZ1 + 0.36],
        [DOOR_X + s * 7.5, 19, TZ1 + 0.7],
        0.03,
        3,
      );
    // amber scrap sign on the portal head
    const sign = P.texMat(
      "dn_sign",
      P.signTex(
        "dn_sign",
        ["THE DAILY RUIN · NEWS · TRADE · SAFE HAVEN"],
        "marquee",
        1024,
        96,
        { bg: "#1a120a", fg: "#ffcf80", maxW: 0.84 },
      ),
      { rough: 0.5, emissive: 0.75 },
    );
    b.box(
      "rust",
      DOOR_X - 5.2,
      13.6,
      TZ1 + 0.4,
      DOOR_X + 5.2,
      14.9,
      TZ1 + 0.75,
      { seg: false },
    );
    b.quad(sign, DOOR_X, 14.25, TZ1 + 0.77, 10.2, 1.05, { ry: 0 });
    for (let k = -9; k <= 9; k++)
      b.sphere(
        k % 5 === 3 ? "glass_dark" : "neon_amber",
        DOOR_X + k * 0.56,
        13.5,
        TZ1 + 0.8,
        0.06,
        { ws: 5, hs: 4 },
      );
    S.glow(DOOR_X, 14.2, TZ1 + 1.4, 0xffb050, 3.4, { dayFactor: 0.2 });
    S.glow(DOOR_X, 3.2, TZ1 + 1.2, 0xffd8a0, 2.0);
    // sandbag chicane + guard booth + newsstand
    E.sandbags(S, DOOR_X - 8.5, TZ1 + 1.6, DOOR_X - 4.8, TZ1 + 1.6, 0, 3);
    E.sandbags(S, DOOR_X + 4.8, TZ1 + 1.6, DOOR_X + 8.5, TZ1 + 1.6, 0, 3);
    E.sandbags(S, DOOR_X - 8.5, TZ1 + 1.6, DOOR_X - 8.9, TZ1 + 0.4, 0, 3);
    E.booth(S, DOOR_X - 10.6, 0, TZ1 + 1.4, 0, { w: 1.8, d: 1.4 });
    E.booth(S, DOOR_X + 11.2, 0, TZ1 + 1.5, 0, {
      w: 2.6,
      d: 1.4,
      key: "wood_rotten",
    });
    const nst = P.texMat(
      "dn_newsstand",
      P.signTex("dn_newsstand", ["NEWS · 1 SCRIP"], "poster", 512, 128, {
        bg: "#e8d8a8",
        fg: "#8a1a10",
      }),
      { rough: 0.9 },
    );
    b.quad(nst, DOOR_X + 11.2, 2.75, TZ1 + 2.33, 2.4, 0.6, { ry: 0 });
    for (let i = 0; i < 5; i++)
      b.box(
        "newsprint",
        DOOR_X + 10.1 + i * 0.45,
        1.0,
        TZ1 + 2.05,
        DOOR_X + 10.45 + i * 0.45,
        1.06 + (i % 3) * 0.05,
        TZ1 + 2.4,
        { seg: false },
      );
    S.prop("newsbox", DOOR_X - 6.2, 0.06, TZ1 + 2.6, PI);
    S.prop("newsbox", DOOR_X - 5.5, 0.06, TZ1 + 2.7, PI + 0.1);
    S.prop("newsbox", DOOR_X + 14.4, 0.06, TZ1 + 2.5, PI - 0.2);
    S.prop("barrel", DOOR_X + 6.2, 0.06, TZ1 + 3.1, 0, { burning: true });
    // string lights over the door
    for (let k = 0; k < 16; k++) {
      const x = DOOR_X - 7.5 + k;
      b.sphere(
        k % 5 === 2 ? "glass_dark" : "lamp",
        x,
        5.6 - Math.sin((k / 15) * PI) * 0.6,
        TZ1 + 0.9,
        0.06,
        { ws: 5, hs: 4 },
      );
    }
    // loading dock on the east wing (the pressroom's way out)
    const FE = P.face(S, "e", -266, -238, 329);
    FE.box("concrete", 11, 17, 0, 0.9, 0, 0.95, { seg: false });
    FE.box("corrugated", 11.6, 16.4, 0.9, 4.6, -0.05, 0.08, {
      seg: false,
      grime: 0.7,
    });
    FE.box("rust", 11.3, 16.7, 4.6, 5.0, 0, 0.4, { seg: false });
    const dock = P.texMat(
      "dn_docksign",
      P.signTex(
        "dn_docksign",
        ["PRESSROOM · LOADING DOCK", "DELIVERIES — KNOCK TWICE"],
        "poster",
        512,
        128,
        { bg: "#c8b890", fg: "#2a2016" },
      ),
      { rough: 0.9 },
    );
    FE.quad(dock, 14, 5.6, 4.4, 1.1, 0.42);
    S.glow(330.5, 4.9, -252, 0xffc880, 1.2);
    S.prop("crate", 330.2, 0.06, -256.5, 0.3, { kind: "plain" });
    S.prop("barrel", 330.4, 0.06, -247.2, 0);
    // anchors
    S.anchor("ext_entrance", DOOR_X, 0, TZ1 + 2.4, PI);
    S.anchor("ext_dock", 331.2, 0, -252, -HP);
    S.anchor("ext_guard1", DOOR_X - 6.8, 0, TZ1 + 3.2, PI);
    S.anchor("ext_guard2", DOOR_X + 7.2, 0, TZ1 + 3.4, PI);
    S.anchor("ext_newsie", DOOR_X + 11.2, 0, TZ1 + 3.3, PI);
    S.build({ shadow: true, lod: 320 });
    return { S, doorX: DOOR_X, doorZ: TZ1 };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
  const RC = { x: 0, z: 8 },
    RR = 11,
    RH = 8.5; // rotunda centre / radius / wall height
  const WELL = 3.35; // globe well radius
  const OPENINGS = [
    // angle (0 = south, +HP = east), width, height
    { a: 0, w: 6.4, h: 5.2 },
    { a: -HP, w: 4.2, h: 4.0 },
    { a: PI, w: 5.2, h: 5.0 },
    { a: HP, w: 4.2, h: 4.0 },
  ];
  const wrap = (a) => {
    while (a > PI) a -= TAU;
    while (a < -PI) a += TAU;
    return a;
  };
  const atR = (a, r) => [RC.x + Math.sin(a) * r, RC.z + Math.cos(a) * r];

  function rotunda(S) {
    const b = S.b;
    const N = 40,
      seg = TAU / N,
      chord = 2 * RR * Math.sin(seg / 2) + 0.12;
    for (let i = 0; i < N; i++) {
      const a = i * seg;
      let op = null;
      for (const o of OPENINGS) {
        const ha = Math.asin(o.w / 2 / RR);
        if (Math.abs(wrap(a - o.a)) < ha + seg * 0.25) op = o;
      }
      const [cx, cz] = atR(a, RR + 0.22);
      const yb = op ? op.h : 0;
      if (yb < 4.2)
        b.boxC("black_marble", cx, yb, cz, chord, 4.2 - yb, 0.44, {
          ry: a,
          seg: false,
        });
      b.boxC(
        "plaster_cream",
        cx,
        Math.max(4.2, yb),
        cz,
        chord,
        RH - Math.max(4.2, yb),
        0.44,
        { ry: a, seg: false },
      );
      S.colR(cx, cz, chord, 0.44, yb, RH, a, { walkable: false });
      // bronze dado band + skirting
      if (!op) {
        const [bx, bz] = atR(a, RR - 0.02);
        b.boxC("brass", bx, 4.15, bz, chord, 0.14, 0.06, {
          ry: a,
          seg: false,
          noAO: true,
        });
        b.boxC("brass", bx, 0, bz, chord, 0.16, 0.05, {
          ry: a,
          seg: false,
          noAO: true,
        });
      }
    }
    // opening frames: bronze architraves on the real (segment-quantized) opening edges
    for (const o of OPENINGS) {
      let edge = 0;
      for (let i = 0; i < N; i++) {
        const a = i * seg,
          d = Math.abs(wrap(a - o.a));
        if (d < Math.asin(o.w / 2 / RR) + seg * 0.25)
          edge = Math.max(edge, d + seg / 2);
      }
      for (const s of [-1, 1]) {
        const ea = o.a + s * edge;
        const [px, pz] = atR(ea, RR + 0.05);
        b.boxC("brass", px, 0, pz, 0.3, o.h + 0.25, 0.62, {
          ry: ea,
          seg: false,
        });
      }
      const hw = RR * Math.sin(edge);
      const [cx, cz] = atR(o.a, RR * Math.cos(edge) - 0.05);
      b.boxC("brass", cx, o.h, cz, hw * 2 + 0.3, 0.32, 0.4, {
        ry: o.a,
        seg: false,
      });
    }
    // bronze torcheres between the openings (warm fill on the lower walls)
    for (const a of [PI / 4, -PI / 4, (3 * PI) / 4, (-3 * PI) / 4]) {
      const [px, pz] = atR(a, RR - 0.9);
      b.cyl("brass", px, 0, pz, 0.18, 0.26, 0.12, 10);
      b.cyl("brass", px, 0.1, pz, 0.04, 0.05, 2.1, 6);
      b.cyl("brass", px, 2.2, pz, 0.42, 0.12, 0.3, 12, { open: true });
      b.cyl("lamp", px, 2.35, pz, 0.36, 0.36, 0.05, 12);
      S.light(px, 2.9, pz, 0xffd8a0, 8.5, 0.9);
      S.glow(px, 2.5, pz, 0xffd8a0, 1.0);
    }
    // cornice ring + cove lamp strip
    b.torus("brass", RC.x, RH - 0.05, RC.z, RR - 0.08, 0.12, TAU, {
      rx: HP,
      ts: 64,
      rs: 5,
    });
    b.torus("lamp_cool", RC.x, RH - 0.3, RC.z, RR - 0.28, 0.05, TAU, {
      rx: HP,
      ts: 64,
      rs: 4,
    });
    // the black glass dome
    const dome = new THREE.SphereGeometry(RR + 0.3, 40, 10, 0, TAU, 0, HP);
    b.inside("black_glass", dome, P.m4(RC.x, RH, RC.z, 0, 0, 0, 1, 0.42, 1), {
      noAO: true,
      grime: 0.05,
    });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      let prev = null;
      for (let k = 0; k <= 8; k++) {
        const t = (k / 8) * HP * 0.98,
          rr = (RR + 0.15) * Math.cos(t),
          yy = RH + (RR + 0.15) * 0.42 * Math.sin(t);
        const p = [RC.x + Math.sin(a) * rr, yy, RC.z + Math.cos(a) * rr];
        if (prev) b.rod("brass", prev, p, 0.05, 4, { noAO: true });
        prev = p;
      }
    }
    b.cyl("lamp_cool", RC.x, RH + RR * 0.42 - 0.12, RC.z, 1.1, 1.1, 0.1, 20, {
      noAO: true,
    });
    b.torus("brass", RC.x, RH + RR * 0.42 - 0.12, RC.z, 1.15, 0.08, TAU, {
      rx: HP,
      ts: 24,
      rs: 4,
    });
    // baked lights: cove ring, oculus, well
    for (let i = 0; i < 8; i++) {
      const [lx, lz] = atR((i / 8) * TAU + 0.2, RR - 1.2);
      S.light(lx, RH - 0.6, lz, 0xe8e4d8, 10, 0.7);
    }
    S.light(RC.x, RH + 3.5, RC.z, 0xdce8ff, 14, 0.8);
    S.glow(RC.x, RH + RR * 0.42 - 0.3, RC.z, 0xdce8ff, 2.4);
    // ---- floor: compass rose ring + the well ----
    const ring = new THREE.RingGeometry(WELL, RR + 0.3, 64, 2).rotateX(-HP);
    b.geo(P.compassMat(), ring, P.m4(RC.x, 0.012, RC.z), {
      uv: "keep",
      noAO: true,
      grime: 0.1,
    });
    // floor colliders (leave a square hole inscribed in the well)
    const hh = 2.3;
    S.col(
      RC.x - RR - 0.5,
      -0.3,
      RC.z - RR - 0.5,
      RC.x + RR + 0.5,
      0,
      RC.z - hh,
    );
    S.col(
      RC.x - RR - 0.5,
      -0.3,
      RC.z + hh,
      RC.x + RR + 0.5,
      0,
      RC.z + RR + 0.5,
    );
    S.col(RC.x - RR - 0.5, -0.3, RC.z - hh, RC.x - hh, 0, RC.z + hh);
    S.col(RC.x + hh, -0.3, RC.z - hh, RC.x + RR + 0.5, 0, RC.z + hh);
    // radiating distance lines (bronze strips) toward the eight cities
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + PI / 8;
      const [x0, z0] = atR(a, WELL + 0.4),
        [x1, z1] = atR(a, RR - 0.3);
      b.rod("brass", [x0, 0.02, z0], [x1, 0.02, z1], 0.035, 4, {
        square: true,
        r2: 0.005,
        noAO: true,
      });
    }
    // the well (lit from below)
    b.inside(
      "marble_cream",
      new THREE.CylinderGeometry(WELL, WELL, 1.9, 40, 1, true),
      P.m4(RC.x, -0.95, RC.z),
      { noAO: true },
    );
    b.cyl("black_marble", RC.x, -2.0, RC.z, WELL, WELL, 0.1, 40, {
      noAO: true,
    });
    b.torus("well_glow", RC.x, -1.8, RC.z, WELL - 0.3, 0.07, TAU, {
      rx: HP,
      ts: 48,
      rs: 4,
    });
    b.torus("brass", RC.x, 0.02, RC.z, WELL + 0.05, 0.08, TAU, {
      rx: HP,
      ts: 48,
      rs: 4,
    });
    for (let i = 0; i < 4; i++) {
      const [lx, lz] = atR((i / 4) * TAU + PI / 4, 2.2);
      S.light(lx, -1.4, lz, 0x9ad0ff, 6.5, 1.25);
      S.glow(lx, -1.5, lz, 0x9ad0ff, 1.3);
    }
    // bronze railing around the well
    const RL = WELL + 0.2;
    b.torus("brass", RC.x, 1.0, RC.z, RL, 0.045, TAU, {
      rx: HP,
      ts: 56,
      rs: 5,
    });
    b.torus("brass", RC.x, 0.55, RC.z, RL, 0.025, TAU, {
      rx: HP,
      ts: 56,
      rs: 4,
    });
    for (let i = 0; i < 24; i++) {
      const [px, pz] = atR((i / 24) * TAU, RL);
      b.cyl("brass", px, 0, pz, 0.03, 0.04, 1.0, 5, { noAO: true });
    }
    for (let i = 0; i < 14; i++) {
      const a0 = (i / 14) * TAU,
        a1 = ((i + 1) / 14) * TAU;
      const [x0, z0] = atR(a0, RL),
        [x1, z1] = atR(a1, RL);
      S.colR(
        (x0 + x1) / 2,
        (z0 + z1) / 2,
        Math.hypot(x1 - x0, z1 - z0) + 0.05,
        0.15,
        0,
        1.1,
        -Math.atan2(z1 - z0, x1 - x0),
        { walkable: false },
      );
    }
    // ---- the GLOBE (separate mesh — it turns) ----
    const pivot = new THREE.Group();
    pivot.position.copy(S.W(RC.x, 0.35, RC.z));
    pivot.rotation.z = (23.4 / 180) * PI;
    const gmat = new THREE.MeshStandardMaterial({
      map: P.globeTex ? P.globeTex() : null,
      roughness: 0.5,
      metalness: 0.05,
      emissive: new THREE.Color(0x2a3634),
      emissiveIntensity: 0.9,
    });
    try {
      gmat.emissiveMap = gmat.map;
    } catch (e) {
      /* */
    }
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1.85, 64, 40), gmat);
    globe.name = "dn_globe";
    pivot.add(globe);
    const brassM = new THREE.MeshStandardMaterial({
      color: 0xb08840,
      metalness: 0.8,
      roughness: 0.35,
      emissive: 0x2a1a08,
      emissiveIntensity: 0.6,
    });
    const meridian = new THREE.Mesh(
      new THREE.TorusGeometry(2.02, 0.05, 6, 64, PI * 1.25),
      brassM,
    );
    meridian.rotation.z = -PI * 0.125 + HP;
    meridian.rotation.y = HP * 0.0;
    pivot.add(meridian);
    const axis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 4.3, 6),
      brassM,
    );
    pivot.add(axis);
    DN.globe = globe;
    DN.globePivot = pivot;
    S._extra = S._extra || [];
    S._extra.push(pivot);
    // globe stand (static)
    b.cyl("brass", RC.x, -2.0, RC.z, 0.5, 0.8, 0.3, 16);
    b.cyl("brass", RC.x, -1.7, RC.z, 0.12, 0.2, 0.6, 10);
    // ---- weather instruments on the wall ----
    const dialK = P.texMat("dn_dials", P.dialTex(), { rough: 0.5, vc: true });
    const dialAng = [
      PI / 4 - 0.16,
      PI / 4 + 0.16,
      -PI / 4 - 0.16,
      -PI / 4 + 0.16,
      (3 * PI) / 4 - 0.16,
      (3 * PI) / 4 + 0.16,
      (-3 * PI) / 4 - 0.16,
      (-3 * PI) / 4 + 0.16,
    ];
    const order = [0, 1, 2, 3, 4, 5, 6, 7];
    dialAng.forEach((a, i) => {
      const [px, pz] = atR(a, RR - 0.06);
      b.quad(dialK, px, 5.9, pz, 1.25, 1.25, {
        ry: a + PI,
        uvRect: P.dialRect(order[i]),
      });
      const [fx, fz] = atR(a, RR - 0.02);
      b.torus("brass", fx, 5.9, fz, 0.66, 0.05, TAU, {
        ry: a + PI,
        ts: 24,
        rs: 4,
      });
      const [lx, lz] = atR(a, RR - 1.2);
      S.light(lx, 5.2, lz, 0xffe8c0, 3.4, 0.4);
    });
    // thermometer columns (glass tube, red spirit) between the dial pairs
    for (const a of [(3 * PI) / 4, (-3 * PI) / 4]) {
      const [px, pz] = atR(a, RR - 0.18);
      b.boxC("brass", px, 1.0, pz, 0.34, 3.4, 0.08, { ry: a, seg: false });
      b.cyl(
        "glass",
        px - Math.sin(a) * 0.05,
        1.2,
        pz - Math.cos(a) * 0.05,
        0.05,
        0.05,
        3.0,
        8,
        { noAO: true },
      );
      b.cyl(
        "lamp_red",
        px - Math.sin(a) * 0.05,
        1.2,
        pz - Math.cos(a) * 0.05,
        0.03,
        0.03,
        a > 0 ? 1.7 : 2.3,
        6,
        { noAO: true },
      );
      b.sphere(
        "lamp_red",
        px - Math.sin(a) * 0.05,
        1.18,
        pz - Math.cos(a) * 0.05,
        0.09,
        { ws: 6, hs: 5 },
      );
    }
    // weather map panel + "WEATHER" lettering above the north arch
    const wmap = P.texMat(
      "dn_wmap",
      P.signTex(
        "dn_wmap",
        ["TODAY'S WEATHER", "MAR 5 1967: GREY, FLURRIES, THEN ASH"],
        "label",
        768,
        256,
        {},
      ),
      { rough: 0.8 },
    );
    {
      const [px, pz] = atR(PI, RR - 0.1);
      b.quad(wmap, px, 7.35, pz, 4.0, 1.3, { ry: 0 });
    }
  }

  function buildInterior() {
    const O = P.I("journal_bldg");
    const S = P.site("dn_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x6a6458,
      ambI: 0.46,
      interiorKey: "journal_bldg",
    });
    const b = S.b;
    const rn = P.rng("dn_int");
    DN.S = S;
    // =============== vestibule ===============
    S.floor("terrazzo", -4.4, 18.2, 4.4, 27.2, 0);
    S.ceil("plaster_cream", -4.4, 18.6, 4.4, 27.2, 5.2);
    S.wallZ("black_marble", -4.4, 18.3, 27.2, 0, 5.2, 0.4);
    S.wallZ("black_marble", 4.4, 18.3, 27.2, 0, 5.2, 0.4);
    S.wallX("black_marble", 27.2, -4.6, 4.6, 0, 5.2, 0.4);
    for (let k = -1; k <= 1; k++) {
      b.box("brass", k * 2 - 0.8, 0, 26.9, k * 2 + 0.8, 3.0, 27.0, {
        seg: false,
      });
      b.box("glass_dark", k * 2 - 0.65, 0.3, 26.95, k * 2 + 0.65, 2.85, 27.0, {
        seg: false,
      });
    }
    b.box("glass", -3.2, 3.2, 26.95, 3.2, 4.8, 27.0, { seg: false });
    S.light(0, 4.4, 25, 0xffe0b0, 7, 0.7);
    b.cyl("lamp", 0, 5.0, 25, 0.5, 0.5, 0.12, 16);
    // settlers' checkpoint
    E.sandbags(S, -4.1, 21.2, -1.1, 21.2, 0, 3);
    E.sandbags(S, 1.1, 21.2, 4.1, 21.2, 0, 3);
    D.label(
      b,
      "dn_rules",
      [
        "THE DAILY RUIN — HOUSE RULES",
        "No shooting in the lobby.",
        "No shooting the globe. Ever.",
        "Tips go to the newsies.",
        "Deadline is sunset. — M.K.",
      ],
      4.17,
      2.2,
      23.5,
      1.2,
      1.0,
      -HP,
    );
    // =============== the rotunda ===============
    rotunda(S);
    // headline board (chalkboard on an easel) — drawn live by 80_content
    DN.boardPos = S.W(-6.6, 0, 15.2);
    b.box("wood_dark", -8.2, 0, 15.0, -8.1, 3.0, 15.1, { seg: false });
    b.box("wood_dark", -5.1, 0, 15.0, -5.0, 3.0, 15.1, { seg: false });
    b.box("wood_dark", -8.2, 1.0, 14.95, -5.0, 1.05, 15.3, { seg: false });
    DN.boardQuad = { x: -6.6, y: 2.05, z: 15.12, w: 3.0, h: 1.9, ry: 0 };
    // news ticker over the north arch (drawn live)
    DN.tickerQuad = { x: 0, y: 5.62, z: -2.55, w: 6.6, h: 0.42, ry: 0 };
    b.box("press_dark", -3.5, 5.35, -2.72, 3.5, 5.95, -2.6, { seg: false });
    // Nickel's newsstand inside the rotunda (south-east)
    E.booth(S, 5.9, 0, 14.1, -PI * 0.76, {
      w: 2.4,
      d: 1.4,
      key: "wood_dark",
      counter: "wood_dark",
    });
    for (let i = 0; i < 4; i++) {
      const t = (i - 1.5) * 0.4;
      b.box(
        "newsprint",
        5.4 + t * 0.8 - 0.17,
        1.0,
        13.7 - t * 0.6 - 0.2,
        5.4 + t * 0.8 + 0.17,
        1.08 + (i % 2) * 0.05,
        13.7 - t * 0.6 + 0.2,
        { ry: -PI * 0.76, seg: false },
      );
    }
    E.hangLamp(S, 5.6, RH, 13.8, { chain: 5.2, color: 0xffc880 });
    // benches around the well
    for (const a of [PI / 4 + PI / 2, -PI / 4 - PI / 2]) {
      const [px, pz] = atR(a, 6.6);
      b.boxC("wood_oak", px, 0.42, pz, 2.4, 0.08, 0.5, {
        ry: a + HP,
        seg: false,
      });
      b.boxC("brass", px, 0, pz, 2.2, 0.42, 0.3, { ry: a + HP, seg: false });
      S.colR(px, pz, 2.4, 0.5, 0, 0.5, a + HP, { walkable: true });
    }
    D.papers(b, 3, 0.012, 3, 3, 10);
    D.papers(b, -5, 0.012, 12, 2.5, 8);
    // =============== west corridor → newsroom ===============
    S.floor("terrazzo", -16.2, 5.4, -10.4, 10.6, 0);
    S.ceil("plaster_cream", -16.2, 5.4, -10.9, 10.6, 4.0);
    S.wallX("black_marble", 5.4, -16.2, -10.8, 0, 4.0, 0.3);
    S.wallX("black_marble", 10.6, -16.2, -10.8, 0, 4.0, 0.3);
    S.light(-13, 3.4, 8, 0xffe0b0, 5, 0.6);
    b.cyl("lamp", -13, 3.85, 8, 0.3, 0.3, 0.1, 12);
    D.label(
      b,
      "dn_to_news",
      ["CITY ROOM →"],
      -13,
      3.2,
      5.58,
      1.6,
      0.35,
      0,
      "brass",
    );
    // =============== the NEWSROOM ===============
    const NX0 = -40,
      NX1 = -16,
      NZ0 = -10,
      NZ1 = 22,
      NH = 4.8;
    S.room({
      x0: NX0,
      z0: NZ0,
      x1: NX1,
      z1: NZ1,
      y: 0,
      h: NH,
      wall: "plaster_green",
      floor: "lino",
      ceil: "plaster",
      trim: "wood_dark",
      holes: { e: [[5.4, 10.6, 0, 4.0]] },
    });
    // tall windows (boarded) on the west wall with daylight slits
    for (let z = NZ0 + 3; z < NZ1 - 2; z += 4) {
      b.box("glass_dark", NX0 + 0.16, 1.2, z - 0.9, NX0 + 0.2, 4.0, z + 0.9, {
        seg: false,
      });
      for (let k = 0; k < 4; k++)
        b.box(
          "wood_rotten",
          NX0 + 0.2,
          1.4 + k * 0.72,
          z - 1.05,
          NX0 + 0.28,
          1.72 + k * 0.72,
          z + 1.05,
          { seg: false, rz: 0.02 },
        );
      for (let k = 0; k < 3; k++)
        b.box(
          "lamp_dim",
          NX0 + 0.19,
          1.74 + k * 0.72,
          z - 0.9,
          NX0 + 0.21,
          1.8 + k * 0.72,
          z + 0.9,
          { seg: false, noAO: true },
        );
      S.light(NX0 + 1.2, 2.6, z, 0xd8e0c8, 4.5, 0.45);
    }
    // desk rows (4 × 4), hanging lamps over each pair
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const x = -34 + col * 4.4,
          z = 2 + row * 4.4;
        if (row === 0 && col === 3) continue; // Scoop's desk is special (below)
        E.desk(b, x, 0, z, PI, { phone: (row + col) % 2 === 0, clutter: true });
        D.chair(b, x, 0, z - 0.8, 0, {
          seat: "leather",
          wood: "metal",
          toppled: rn() < 0.2,
        });
        if (col % 2 === 0)
          E.hangLamp(S, x + 2.2, NH, z, {
            chain: 2.3,
            lit: rn() < 0.75,
            shade: "paint_green",
          });
      }
    }
    // Scoop Delaney's desk — photos pinned, empty chair
    E.desk(b, -20.8, 0, 2, PI, { phone: true });
    D.chair(b, -20.8, 0, 1.2, 0.4, { seat: "leather", wood: "metal" });
    E.deskLamp(S, -21.4, 0.765, 2.1, true);
    const pin = P.texMat(
      "dn_scoopboard",
      P.signTex(
        "dn_scoopboard",
        [
          "LEADS:",
          'TUDOR "COURT" — who is the king?',
          "bear @ Madison Sq (!!)",
          "Continuity @ UN?? ask Rocky",
        ],
        "label",
        512,
        384,
      ),
      { rough: 0.9 },
    );
    b.box("wood", -19.5, 1.0, -9.84, -16.5, 3.0, -9.8, { seg: false });
    b.quad(pin, -18, 2.0, -9.78, 2.8, 1.8, { ry: 0 });
    // the copy desk (horseshoe)
    for (let i = 0; i < 7; i++) {
      const a = -HP + (i / 6) * PI,
        x = -26 + Math.sin(a) * 2.0,
        z = 19.3 + Math.cos(a) * 2.0;
      E.desk(b, x, 0, z, a + PI, {
        w: 1.2,
        typewriter: i % 2 === 0,
        clutter: true,
      });
    }
    E.hangLamp(S, -26, NH, 19.3, { chain: 2.0, color: 0xffd8a0, r: 7 });
    // editor's glass office (north-west)
    const ex0 = NX0,
      ex1 = -31,
      ez0 = NZ0,
      ez1 = -1;
    const glassWall = (axis, c, a0, a1, door) => {
      const pieces = door
        ? [
            [a0, door[0]],
            [door[1], a1],
          ]
        : [[a0, a1]];
      for (const pc of pieces) {
        if (axis === "x") {
          b.box("wood_dark", pc[0], 0, c - 0.08, pc[1], 1.1, c + 0.08, {
            seg: false,
          });
          b.box("glass", pc[0], 1.1, c - 0.03, pc[1], 4.3, c + 0.03, {
            seg: false,
            noAO: true,
          });
          b.box("wood_dark", pc[0], 4.3, c - 0.08, pc[1], NH, c + 0.08, {
            seg: false,
          });
          b.box("wood_dark", pc[0], 2.95, c - 0.06, pc[1], 3.05, c + 0.06, {
            seg: false,
          });
          S.col(pc[0], 0, c - 0.1, pc[1], NH, c + 0.1, { walkable: false });
          for (let u = pc[0]; u <= pc[1] + 0.01; u += 1.5)
            b.box(
              "wood_dark",
              u - 0.05,
              1.1,
              c - 0.06,
              u + 0.05,
              4.3,
              c + 0.06,
              { seg: false },
            );
        } else {
          b.box("wood_dark", c - 0.08, 0, pc[0], c + 0.08, 1.1, pc[1], {
            seg: false,
          });
          b.box("glass", c - 0.03, 1.1, pc[0], c + 0.03, 4.3, pc[1], {
            seg: false,
            noAO: true,
          });
          b.box("wood_dark", c - 0.08, 4.3, pc[0], c + 0.08, NH, pc[1], {
            seg: false,
          });
          b.box("wood_dark", c - 0.06, 2.95, pc[0], c + 0.06, 3.05, pc[1], {
            seg: false,
          });
          S.col(c - 0.1, 0, pc[0], c + 0.1, NH, pc[1], { walkable: false });
          for (let u = pc[0]; u <= pc[1] + 0.01; u += 1.5)
            b.box(
              "wood_dark",
              c - 0.06,
              1.1,
              u - 0.05,
              c + 0.06,
              4.3,
              u + 0.05,
              { seg: false },
            );
        }
      }
      if (door) {
        if (axis === "x") {
          b.box("wood_dark", door[0], 2.3, c - 0.08, door[1], 2.45, c + 0.08, {
            seg: false,
          });
          b.box("glass", door[0], 2.45, c - 0.03, door[1], 4.3, c + 0.03, {
            seg: false,
          });
          b.box("wood_dark", door[0], 4.3, c - 0.08, door[1], NH, c + 0.08, {
            seg: false,
          });
        } else {
          b.box("wood_dark", c - 0.08, 2.3, door[0], c + 0.08, 2.45, door[1], {
            seg: false,
          });
          b.box("glass", c - 0.03, 2.45, door[0], c + 0.03, 4.3, door[1], {
            seg: false,
          });
          b.box("wood_dark", c - 0.08, 4.3, door[0], c + 0.08, NH, door[1], {
            seg: false,
          });
        }
      }
    };
    glassWall("x", ez1, ex0 + 0.15, ex1, null);
    glassWall("z", ex1, ez0 + 0.15, ez1, [-6.2, -4.8]);
    D.label(
      b,
      "dn_editor_door",
      ["M. KOWALCZYK", "EDITOR-IN-CHIEF"],
      ex1 + 0.1,
      2.6,
      -6.9,
      0.9,
      0.36,
      HP,
      "brass",
    );
    D.rug(b, -39, -9, -32, -2, 0.012, "carpet_red");
    E.desk(b, -36, 0, -6.5, PI, {
      w: 2.0,
      d: 0.9,
      phone: true,
      typewriter: true,
    });
    E.deskLamp(S, -36.8, 0.765, -6.8, true);
    D.chair(b, -36, 0, -7.4, 0, { seat: "leather", arms: true });
    D.bookcase(b, -39.6, 0, -4.5, HP, { w: 2.2 });
    for (let i = 0; i < 3; i++)
      E.cabinet(b, -39.5, 0, -8.8 + i * 0.6 + 0.1, HP);
    const pagesK = P.texMat("dn_pages", P.pagesTex(), { rough: 0.9 });
    b.box("wood_dark", -35.2, 1.4, -9.85, -32.8, 3.1, -9.8, { seg: false });
    b.quad(pagesK, -34, 2.25, -9.78, 1.5, 1.5, {
      ry: 0,
      uvRect: P.pageRect(0),
    });
    // wall clocks & framed front pages along the newsroom
    for (let i = 0; i < 4; i++) {
      b.box(
        "wood_dark",
        -30 + i * 3.6 - 0.72,
        2.0,
        NZ1 - 0.2,
        -30 + i * 3.6 + 0.72,
        3.5,
        NZ1 - 0.16,
        { seg: false },
      );
      b.quad(pagesK, -30 + i * 3.6, 2.75, NZ1 - 0.15, 1.3, 1.3, {
        ry: PI,
        uvRect: P.pageRect(i),
      });
    }
    b.quad(
      P.texMat("dn_dials", P.dialTex(), { rough: 0.5, vc: true }),
      NX1 + 0.18,
      3.6,
      16,
      1.0,
      1.0,
      { ry: -HP, uvRect: P.dialRect(0) },
    );
    // pneumatic tube + filing wall along the north
    for (let i = 0; i < 10; i++)
      E.cabinet(b, -28.5 + i * 0.62, 0, NZ0 + 0.45, 0, { open: rn() < 0.2 });
    b.rod("brass", [-29, 4.2, NZ0 + 0.3], [-17, 4.2, NZ0 + 0.3], 0.08, 8);
    b.rod("brass", [-17, 4.2, NZ0 + 0.3], [-17, 1.2, NZ0 + 0.3], 0.08, 8);
    D.papers(b, -28, 0.012, 8, 6, 30);
    D.papers(b, -22, 0.012, 16, 4, 14);
    S.prop("skeleton", -31.2, 0, 13.4, 1.2, { pose: "seated" });
    // ceiling fans
    for (const [fx, fz] of [
      [-30, 6],
      [-22, 14],
    ]) {
      b.cyl("brass", fx, NH - 0.6, fz, 0.12, 0.12, 0.2, 8);
      b.rod("iron", [fx, NH - 0.4, fz], [fx, NH, fz], 0.02, 3);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU + 0.3;
        b.box(
          "wood_dark",
          fx - 0.08,
          NH - 0.58,
          fz,
          fx + 0.08,
          NH - 0.55,
          fz + 0.75,
          { ry: a, seg: false },
        );
      }
    }
    // =============== north hall + stair down to the pressroom ===============
    S.floor("terrazzo", -3, -14, 3, -2.6, 0);
    S.ceil("plaster_cream", -3.2, -21.6, 3.2, -2.6, 5.0);
    S.wallZ("black_marble", -3, -14, -2.9, 0, 5.0, 0.3);
    S.wallZ("black_marble", 3, -14, -2.9, 0, 5.0, 0.3);
    S.wallZ("brick_buff", -2.6, -21.6, -14, -6, 5.0, 0.3);
    S.wallZ("brick_buff", 2.6, -21.6, -14, -6, 5.0, 0.3);
    S.wallX("black_marble", -14.1, -3.1, -2.45, 0, 5.0, 0.2);
    S.wallX("black_marble", -14.1, 2.45, 3.1, 0, 5.0, 0.2);
    S.stairs("concrete", 0, -21.5, "s", 4.9, -6, 0, {
      rail: "iron",
      railCol: false,
      nosing: "brass",
    });
    D.label(
      b,
      "dn_to_press",
      ["PRESSROOM ↓", "EAR PROTECTION REQUIRED"],
      0,
      3.6,
      -13.95,
      2.0,
      0.6,
      0,
      "poster",
    );
    S.light(0, 3.8, -8, 0xffe0b0, 6, 0.6);
    b.cyl("lamp", 0, 4.9, -8, 0.3, 0.3, 0.1, 12);
    E.tube(S, 0, 4.9, -18, HP, { len: 2.0, drop: 0.3, r: 7, i: 0.7 });
    // =============== the PRESSROOM ===============
    const PX0 = -24,
      PX1 = 24,
      PZ0 = -50,
      PZ1 = -21.5,
      PY = -6,
      PH = 9;
    S.room({
      x0: PX0,
      z0: PZ0,
      x1: PX1,
      z1: PZ1,
      y: PY,
      h: PH,
      wall: "brick_buff",
      floor: "concrete",
      ceil: "concrete_dark",
      trim: null,
      holes: { s: [[-2.5, 2.5, 0, 3.0]], e: [[-33.6, -28.4, 0, 4.6]] },
    });
    // painted safety stripe along the walls + steel columns
    for (const [x, z] of [
      [-18, -25],
      [-6, -25],
      [6, -25],
      [18, -25],
      [-18, -47],
      [-6, -47],
      [6, -47],
    ]) {
      b.boxC("iron", x, PY, z, 0.4, PH, 0.4, { seg: false });
      b.boxC("iron", x, PY + PH - 0.5, z, 1.0, 0.5, 0.3, { seg: false });
      S.col(x - 0.2, PY, z - 0.2, x + 0.2, PY + PH, z + 0.2, {
        walkable: false,
      });
    }
    b.box(
      "paint_cream",
      PX0 + 0.16,
      PY + 1.0,
      PZ0 + 0.16,
      PX0 + 0.2,
      PY + 1.25,
      PZ1 - 0.2,
      { seg: false, noAO: true },
    );
    for (let x = PX0 + 1; x < PX1 - 1; x += 1.2)
      b.box(
        Math.round(x / 1.2) % 2 ? "paint_black" : "paint_cream",
        x,
        PY + 0.005,
        -36.9,
        x + 1.2,
        PY + 0.012,
        -36.75,
        { seg: false, noAO: true },
      );
    // two rotary press lines
    DN.rollers = [];
    const pressLine = (lz, tag) => {
      // units
      for (let u = 0; u < 6; u++) {
        const ux = -14 + u * 3.6;
        for (const s of [-1, 1]) {
          const fz0 = lz + s * 1.35 - 0.16,
            fz1 = lz + s * 1.35 + 0.16;
          b.box("press_green", ux - 1.5, PY, fz0, ux - 1.12, PY + 4.6, fz1, {
            segLen: 2,
          });
          b.box("press_green", ux + 1.12, PY, fz0, ux + 1.5, PY + 4.6, fz1, {
            segLen: 2,
          });
          b.box(
            "press_green",
            ux - 1.12,
            PY + 4.15,
            fz0,
            ux + 1.12,
            PY + 4.6,
            fz1,
            { seg: false },
          );
          b.box("press_green", ux - 1.12, PY, fz0, ux + 1.12, PY + 0.9, fz1, {
            seg: false,
          });
          b.box(
            "press_green",
            ux - 1.12,
            PY + 2.02,
            fz0 + 0.05,
            ux + 1.12,
            PY + 2.12,
            fz1 - 0.05,
            { seg: false },
          );
          for (const yy of [1.6, 2.55])
            for (const xx of [-0.6, 0.6]) {
              b.cyl(
                "brass",
                ux + xx,
                PY + yy - 0.02,
                lz + s * 1.52,
                0.2,
                0.2,
                0.04,
                12,
                { rx: HP, noAO: true },
              );
              b.cyl(
                "press_dark",
                ux + xx,
                PY + yy - 0.25,
                lz + s * 1.35,
                0.12,
                0.12,
                0.5,
                8,
                { rx: HP, noAO: true },
              );
            }
          b.box(
            "press_dark",
            ux - 1.2,
            PY + 0.2,
            lz + s * 1.55 - 0.03,
            ux + 1.2,
            PY + 0.8,
            lz + s * 1.55 + 0.03,
            { seg: false },
          );
          b.cyl(
            "press_dark",
            ux + 0.8,
            PY + 3.2 - 0.03,
            lz + s * 1.56,
            0.62,
            0.62,
            0.06,
            20,
            { rx: HP, noAO: true },
          );
          b.torus(
            "brass",
            ux + 0.8,
            PY + 3.2,
            lz + s * 1.56 + s * 0.02,
            0.62,
            0.05,
            TAU,
            { ts: 24, rs: 4 },
          );
          for (let k = 0; k < 6; k++)
            b.sphere(
              "brass",
              ux - 1.35 + k * 0.54,
              PY + 4.45,
              lz + s * 1.52,
              0.05,
              { ws: 4, hs: 3 },
            );
        }
        S.col(ux - 1.55, PY, lz - 1.55, ux + 1.55, PY + 4.6, lz + 1.55, {
          walkable: false,
        });
        b.box(
          "press_green",
          ux - 1.5,
          PY + 4.6,
          lz - 1.5,
          ux + 1.5,
          PY + 4.8,
          lz + 1.5,
          { seg: false },
        );
        // cylinders (their texture scrolls when the press runs)
        const cyl = (x, y, r) =>
          b.cyl("roller", x, PY + y - 1.2, lz, r, r, 2.4, 20, {
            rx: HP,
            uv: "keep",
            us: 3,
            noAO: true,
            grime: 0.2,
          });
        cyl(ux - 0.6, 1.6, 0.44);
        cyl(ux + 0.6, 1.6, 0.44);
        cyl(ux - 0.6, 2.55, 0.44);
        cyl(ux + 0.6, 2.55, 0.44);
        for (let k = 0; k < 5; k++)
          cyl(ux - 1.0 + k * 0.5, 3.5 + (k % 2) * 0.28, 0.15);
        b.box(
          "ink",
          ux - 1.1,
          PY + 3.9,
          lz - 1.15,
          ux + 1.1,
          PY + 4.3,
          lz + 1.15,
          { seg: false },
        );
        b.box(
          "press_dark",
          ux - 1.4,
          PY,
          lz - 1.2,
          ux + 1.4,
          PY + 0.4,
          lz + 1.2,
          { seg: false },
        );
      }
      // paper web running the length of the line
      b.box("web", -19, PY + 2.06, lz - 1.1, 7.8, PY + 2.09, lz + 1.1, {
        uv: "keep",
        us: 12,
        seg: false,
        noAO: true,
        grime: 0.05,
      });
      // reel stand + paper roll at the west end
      for (const s of [-1, 1])
        b.box(
          "press_green",
          -19.2,
          PY,
          lz + s * 1.35 - 0.15,
          -17.2,
          PY + 2.6,
          lz + s * 1.35 + 0.15,
          { seg: false },
        );
      b.cyl("paper", -18.2, PY + 1.6 - 1.15, lz, 0.95, 0.95, 2.3, 24, {
        rx: HP,
        noAO: true,
      });
      b.cyl("press_dark", -18.2, PY + 1.6 - 1.3, lz, 0.12, 0.12, 2.6, 8, {
        rx: HP,
        noAO: true,
      });
      S.col(-19.3, PY, lz - 1.5, -17.1, PY + 2.6, lz + 1.5, {
        walkable: false,
      });
      // folder + delivery conveyor at the east end
      b.box("press_green", 8.6, PY, lz - 1.4, 12.4, PY + 5.6, lz + 1.4, {
        segLen: 2,
      });
      b.box("press_dark", 8.5, PY + 1.2, lz - 1.45, 12.5, PY + 2.2, lz + 1.45, {
        seg: false,
      });
      b.box("web", 8.52, PY + 2.06, lz - 1.0, 8.58, PY + 5.2, lz + 1.0, {
        uv: "keep",
        seg: false,
        noAO: true,
      });
      S.col(8.5, PY, lz - 1.45, 12.5, PY + 5.6, lz + 1.45, { walkable: false });
      b.box("iron", 12.4, PY + 0.9, lz - 0.6, 21.5, PY + 1.05, lz + 0.6, {
        seg: false,
      });
      b.box("web", 12.4, PY + 1.05, lz - 0.55, 21.5, PY + 1.07, lz + 0.55, {
        uv: "keep",
        us: 10,
        seg: false,
        noAO: true,
      });
      for (let x = 12.8; x < 21.5; x += 1.4) {
        b.box("iron", x - 0.05, PY, lz - 0.55, x + 0.05, PY + 0.9, lz - 0.45, {
          seg: false,
        });
        b.box("iron", x - 0.05, PY, lz + 0.45, x + 0.05, PY + 0.9, lz + 0.55, {
          seg: false,
        });
        b.box(
          "newsprint",
          x + 0.3,
          PY + 1.07,
          lz - 0.35,
          x + 0.9,
          PY + 1.25,
          lz + 0.35,
          { seg: false },
        );
      }
      S.col(12.4, PY, lz - 0.62, 21.5, PY + 1.1, lz + 0.62, {
        walkable: true,
        surface: "metal",
      });
      void tag;
    };
    pressLine(-30.5, "A");
    pressLine(-41.5, "B");
    // catwalk between the lines with stairs at the east end, control desk
    E.catwalk(S, -14.5, -36.8, 12.6, -35.2, PY + 3.0, {
      rails: ["n", "s"],
      posts: PY,
    });
    S.stairs("panel", 16.4, -36, "w", 1.5, PY, PY + 3.0, {
      rail: "iron",
      railCol: true,
      solid: false,
    });
    b.box("panel", 12.6, PY + 2.92, -36.8, 12.9, PY + 3.0, -35.2, {
      seg: false,
    });
    S.col(12.5, PY + 2.75, -36.8, 12.9, PY + 3.0, -35.2, { surface: "metal" });
    DN.pressCtl = S.W(-13.4, PY + 3.0, -36);
    b.box("press_dark", -14.4, PY + 3.0, -36.6, -13.2, PY + 4.1, -35.4, {
      seg: false,
    });
    b.box("lamp_green", -14.35, PY + 3.9, -36.3, -13.25, PY + 4.02, -35.7, {
      seg: false,
      noAO: true,
    });
    for (let k = 0; k < 6; k++)
      b.sphere(
        k % 2 ? "lamp_red" : "lamp_green",
        -14.2 + k * 0.17,
        PY + 4.12,
        -35.5,
        0.03,
        { ws: 4, hs: 3 },
      );
    // main drive motor + the big lever (west end, between the lines)
    b.box("press_dark", -23.4, PY, -38.6, -19.8, PY + 2.2, -33.4, {
      segLen: 2,
    });
    b.cyl("press_green", -21.6, PY + 2.2, -36, 1.2, 1.2, 1.3, 20, {
      rz: HP,
      noAO: true,
    });
    b.cyl("roller", -20.2 - 0.3, PY + 1.3 - 0.05, -36, 1.45, 1.45, 0.3, 24, {
      rz: HP,
      uv: "keep",
      us: 4,
      noAO: true,
    });
    for (let k = 0; k < 3; k++)
      b.box(
        "rubber",
        -20.3,
        PY + 0.2 + k * 0.08,
        -37.2,
        -18.6,
        PY + 0.26 + k * 0.08,
        -34.8,
        { seg: false, noAO: true },
      );
    S.col(-23.5, PY, -38.7, -19.2, PY + 3.4, -33.3, { walkable: false });
    const motorPlate = P.texMat(
      "dn_motor",
      P.signTex(
        "dn_motor",
        ["GOSS HEADLINER", "MAIN DRIVE No.1", "600 V — KEEP CLEAR"],
        "brass",
        512,
        256,
      ),
      { rough: 0.5 },
    );
    b.quad(motorPlate, -19.78, PY + 1.3, -36, 1.2, 0.6, { ry: HP });
    DN.motorPos = S.W(-19.3, PY + 1.2, -36);
    DN.leverPos = S.W(-18.4, PY + 1.1, -32.9);
    b.box("press_dark", -18.8, PY, -33.2, -18.0, PY + 1.0, -32.6, {
      seg: false,
    });
    DN.leverLocal = { x: -18.4, y: PY + 1.0, z: -32.9 };
    // paper roll storage + bundled papers + ink drums
    for (let i = 0; i < 6; i++)
      b.cyl(
        "paper",
        16.5 + (i % 3) * 2.1,
        PY + (i < 3 ? 0 : 1.9),
        -47.5 + (i < 3 ? 0 : 0),
        0.95,
        0.95,
        1.9,
        20,
        { noAO: true },
      );
    S.col(15.4, PY, -48.5, 22.2, PY + 3.8, -46.5, { walkable: false });
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++)
        b.box(
          "newsprint",
          17 + i * 1.2,
          PY + 0.15 + j * 0.3,
          -43 + (i % 2) * 0.1,
          18 + i * 1.2,
          PY + 0.43 + j * 0.3,
          -42.2,
          { seg: false },
        );
    b.box("wood", 16.8, PY, -43.2, 21.9, PY + 0.15, -42, { seg: false });
    for (let i = 0; i < 6; i++)
      S.prop("barrel", -22.8 + i * 1.0, PY, -49.1, 0, { chem: i % 3 === 0 });
    S.prop("workbench", -8, PY, -49.0, 0);
    S.prop("toolbox", -6.4, PY + 0.95, -49.1, 0.2, { loot: "toolbox" });
    // dock: raised platform, roll-up door, pallets
    b.box("concrete", 19.5, PY, -34.5, 24, PY + 1.0, -27.5, { seg: false });
    S.col(19.5, PY, -34.5, 24, PY + 1.0, -27.5, { surface: "concrete" });
    S.stairs("concrete", 18.3, -33.3, "e", 2.4, PY, PY + 1.0, { solid: true });
    b.box(
      "corrugated",
      PX1 - 0.12,
      PY + 1.0,
      -33.4,
      PX1 - 0.04,
      PY + 4.6,
      -28.6,
      { seg: false, grime: 0.6 },
    );
    b.box("rust", PX1 - 0.3, PY + 4.6, -33.8, PX1, PY + 5.0, -28.2, {
      seg: false,
    });
    S.prop("crate", 21.2, PY + 1.0, -33.4, 0.1, { kind: "plain" });
    S.prop("crate", 22.4, PY + 1.0, -28.6, 0.5, { kind: "plain" });
    DN.dockDoor = S.W(PX1 - 0.3, PY + 2.4, -31);
    // fluorescent fixtures
    for (let x = -18; x <= 18; x += 7.2)
      for (const z of [-26, -36, -46])
        E.tube(S, x, PY + PH, z, 0, {
          len: 2.6,
          drop: 1.0,
          lit: rn() > 0.15,
          r: 13,
          i: 1.25,
          size: 1.0,
        });
    for (const [lx, lz] of [
      [-10, -30.5],
      [2, -30.5],
      [-10, -41.5],
      [2, -41.5],
    ])
      S.light(lx, PY + 5.4, lz, 0xc8d8e8, 8, 0.6);
    // press-hall dressing: skeleton of the night foreman, spilled bundles
    S.prop("skeleton", -2.2, PY, -47.8, 0.5, { pose: "lying" });
    D.papers(b, 4, PY + 0.01, -36, 8, 40);
    const sfty = P.texMat(
      "dn_safety",
      P.signTex(
        "dn_safety",
        ["1,873 DAYS WITHOUT", "AN ACCIDENT"],
        "poster",
        512,
        192,
        { bg: "#e8d8a8", fg: "#1a3a1a" },
      ),
      { rough: 0.9 },
    );
    b.quad(sfty, 0, PY + 5.2, PZ0 + 0.18, 3.0, 1.1, { ry: 0 });
    b.quad(
      P.texMat(
        "dn_safety2",
        P.signTex(
          "dn_safety2",
          ["2,871 DAYS SINCE", "THE LAST EDITION"],
          "raider",
          512,
          192,
          { fg: "#e8e0c0" },
        ),
        { transparent: true },
      ),
      0,
      PY + 4.1,
      PZ0 + 0.2,
      3.0,
      1.0,
      { ry: 0 },
    );
    // =============== east hall: brass elevators + stair up ===============
    const HX0 = 11,
      HX1 = 19,
      HZ0 = -10,
      HZ1 = 16;
    S.floor("terrazzo", HX0 - 0.6, HZ0, HX1, HZ1, 0);
    S.wallX("black_marble", HZ0, HX0, HX1, 0, 5.0, 0.3);
    S.wallX("black_marble", HZ1, HX0, HX1, 0, 5.0, 0.3);
    S.wallZ("black_marble", HX0, HZ0, 5.4, 0, 5.0, 0.3);
    S.wallZ("black_marble", HX0, 10.6, HZ1, 0, 5.0, 0.3);
    S.wallZ("plaster_ruin", HX1, HZ1, 22, 0, 5.0, 0.3);
    S.wallZ("black_marble", HX1, HZ0, HZ1, 0, 5.0, 0.3, [[1.0, 4.0, 0, 2.6]]);
    // floor-2 slab with the stair opening (x 13..17, z -7..-0.4)
    S.floor("parquet", HX0, HZ0, 34, -6.7, 5.0, { under: "plaster" });
    S.floor("parquet", HX0, -6.7, 13, -0.4, 5.0, { under: "plaster" });
    S.floor("parquet", 17, -6.7, 34, -0.4, 5.0, { under: "plaster" });
    S.floor("parquet", HX0, -0.4, 34, 22, 5.0, { under: "plaster" });
    S.stairs("marble_cream", 15, -0.4, "n", 3.2, 0, 5.0, {
      rail: "brass",
      nosing: "brass",
      railCol: true,
    });
    S.rail(
      "brass",
      [
        [13, -6.7],
        [13, -0.4],
      ],
      5.0,
      1.0,
      { r: 0.04 },
    );
    S.rail(
      "brass",
      [
        [17, -6.7],
        [17, -0.4],
      ],
      5.0,
      1.0,
      { r: 0.04 },
    );
    S.rail(
      "brass",
      [
        [13, -0.4],
        [17, -0.4],
      ],
      5.0,
      1.0,
      { r: 0.04 },
    );
    // elevator doors (the middle one pried open onto a black shaft)
    for (let i = 0; i < 3; i++) {
      const z = 7.5 + i * 2.8;
      b.box("brass", HX1 - 0.2, 0, z - 0.95, HX1 - 0.14, 3.2, z + 0.95, {
        seg: false,
      });
      if (i === 1) {
        b.box(
          "paint_black",
          HX1 - 0.16,
          0.02,
          z - 0.7,
          HX1 - 0.1,
          2.6,
          z + 0.7,
          { seg: false, noAO: true },
        );
        b.box("brass", HX1 - 0.3, 0, z - 0.95, HX1 - 0.15, 2.6, z - 0.7, {
          seg: false,
        });
        b.rod(
          "iron",
          [HX1 - 0.12, 2.6, z],
          [HX1 - 0.12, 0.1, z + 0.2],
          0.02,
          3,
        );
      } else {
        b.box("chrome", HX1 - 0.22, 0.02, z - 0.72, HX1 - 0.16, 2.6, z - 0.02, {
          seg: false,
        });
        b.box("chrome", HX1 - 0.22, 0.02, z + 0.02, HX1 - 0.16, 2.6, z + 0.72, {
          seg: false,
        });
      }
      b.box("brass", HX1 - 0.24, 2.7, z - 0.4, HX1 - 0.18, 3.05, z + 0.4, {
        seg: false,
      });
      for (let k = 0; k < 7; k++)
        b.sphere(
          k === 3 ? "lamp_dim" : "glass_dark",
          HX1 - 0.25,
          2.88,
          z - 0.3 + k * 0.1,
          0.025,
          { ws: 4, hs: 3 },
        );
    }
    S.prop("skeleton", HX1 - 0.9, 0, 10.8, -HP, { pose: "reaching" });
    E.tube(S, 15, 5.0, 4, HP, { len: 2.2, drop: 0.3, r: 8, i: 0.7 });
    E.tube(S, 15, 5.0, 12, HP, {
      len: 2.2,
      drop: 0.3,
      r: 8,
      i: 0.7,
      lit: false,
    });
    D.label(
      b,
      "dn_to_morgue",
      ["↑ THE MORGUE (ARCHIVES)", "→ QUARTERS · CLINIC"],
      14.2,
      3.4,
      -9.8,
      2.2,
      0.6,
      0,
      "brass",
    );
    // =============== quarters & clinic (ground, east) ===============
    S.room({
      x0: 19,
      z0: -10,
      x1: 34,
      z1: 22,
      y: 0,
      h: 4.7,
      wall: "wallpaper",
      floor: "wood",
      ceil: false,
      skip: "w",
    });
    for (let i = 0; i < 5; i++) {
      S.prop("bed", 32.8, 0, 12 + i * 2.1 - 8, -HP);
    }
    for (let i = 0; i < 3; i++) S.prop("mattress", 21.2 + i * 1.5, 0, 20.4, 0);
    S.prop("locker", 33.5, 0, 16.4, -HP, {
      count: 3,
      loot: "locker",
      owner: "settlers",
      name: "Settler Lockers",
    });
    S.prop("footlocker", 31.0, 0, 7.2, -HP, {
      loot: "footlocker",
      owner: "settlers",
    });
    S.prop("barrel", 25.5, 0, 12.5, 0, { burning: true });
    S.light(25.5, 1.4, 12.5, 0xff9a40, 9, 1.1);
    D.table(b, 25.5, 0, 16.5, {
      rect: [2.2, 1.0],
      top: "wood",
      leg: "wood_dark",
    });
    for (const s of [-1, 1])
      for (const t of [-0.6, 0.6])
        D.chair(b, 25.5 + t, 0, 16.5 + s * 0.8, s > 0 ? PI : 0, {
          seat: "wood",
          wood: "wood",
        });
    b.rod("iron", [20, 3.2, 19], [33.5, 3.2, 21], 0.01, 3);
    for (let i = 0; i < 6; i++)
      b.box(
        i % 2 ? "fabric_white" : "fabric",
        21 + i * 2 - 0.3,
        2.4,
        19.1 + i * 0.3,
        21 + i * 2 + 0.3,
        3.2,
        19.14 + i * 0.3,
        { seg: false, noAO: true },
      );
    // clinic corner
    D.bed(b, 22, 0, -6.5, HP, { w: 0.95, cover: "fabric_white" });
    D.bed(b, 22, 0, -3.5, HP, { w: 0.95, cover: "fabric_white" });
    S.prop("first_aid", 19.25, 1.3, -8, HP, {
      loot: "first_aid",
      owner: "settlers",
    });
    E.hangLamp(S, 24, 4.7, -5, {
      chain: 1.4,
      shade: "paint_white",
      color: 0xf0f0e0,
      r: 7,
    });
    b.box("fabric_white", 26.4, 0, -9.8, 26.45, 2.2, -1.5, { seg: false });
    E.hangLamp(S, 26, 4.7, 4, { chain: 1.6, color: 0xffc880 });
    // =============== THE MORGUE (archive, floor 2) ===============
    const MY = 5.0;
    S.wallX("plaster", -10, HX0, 34, MY, MY + 4.4, 0.3);
    S.wallX("plaster", 22, HX0, 34, MY, MY + 4.4, 0.3);
    S.wallZ("plaster", HX0, -10, 22, MY, MY + 4.4, 0.3);
    S.wallZ("plaster", 34, -10, 22, MY, MY + 4.4, 0.3);
    S.ceil("plaster", HX0, -10, 34, 22, MY + 4.4);
    for (let row = 0; row < 5; row++) {
      const z = 1.5 + row * 3.2;
      for (let k = 0; k < 4; k++)
        D.bookcase(b, 20 + k * 1.7, MY, z, 0, {
          w: 1.7,
          h: 2.6,
          shelves: 6,
          empty: 0.25,
          wood: "wood_dark",
        });
      for (let k = 0; k < 4; k++)
        D.bookcase(b, 20 + k * 1.7, MY, z + 0.45, PI, {
          w: 1.7,
          h: 2.6,
          shelves: 6,
          empty: 0.25,
          wood: "wood_dark",
        });
      S.col(19.1, MY, z - 0.25, 26.9, MY + 2.6, z + 0.7, { walkable: false });
    }
    for (let i = 0; i < 8; i++)
      E.cabinet(b, 33.4, MY, -8.5 + i * 0.62, -HP, { open: i === 3 });
    // reading table + microfilm reader + terminal
    D.table(b, 15, MY, 8, {
      rect: [2.6, 1.2],
      top: "wood_dark",
      leg: "wood_dark",
    });
    E.deskLamp(S, 14.2, MY + 0.75, 7.8, true);
    E.deskLamp(S, 15.8, MY + 0.75, 8.2, false);
    for (let k = 0; k < 3; k++)
      b.box(
        "newsprint",
        14.8 + k * 0.1,
        MY + 0.75 + k * 0.08,
        7.8,
        15.4 + k * 0.1,
        MY + 0.83 + k * 0.08,
        8.4,
        { seg: false },
      );
    E.desk(b, 13.2, MY, 18, 0, { w: 1.4, typewriter: false });
    b.box("press_dark", 12.8, MY + 0.77, 17.9, 13.6, MY + 1.35, 18.3, {
      seg: false,
    });
    b.box("screen", 12.9, MY + 0.95, 18.31, 13.5, MY + 1.3, 18.32, {
      seg: false,
      noAO: true,
    });
    S.light(13.2, MY + 1.2, 18.6, 0x80ff90, 3, 0.4);
    // wire room (south-east corner) with teletypes and the settlement transmitter
    for (let i = 0; i < 4; i++) E.teletype(b, 28 + i * 1.3, MY, 20.6, PI);
    b.box("press_dark", 32.2, MY, 12.5, 33.8, MY + 3.2, 16.5, { segLen: 1 });
    for (let k = 0; k < 8; k++)
      b.cyl(
        k % 3 === 0 ? "lamp_dim" : "glass",
        32.15,
        MY + 1.0 + (k % 4) * 0.5,
        13 + Math.floor(k / 4) * 2.6,
        0.06,
        0.06,
        0.2,
        6,
        { rz: HP, noAO: true },
      );
    S.col(32.2, MY, 12.5, 34, MY + 3.2, 16.5, { walkable: false });
    b.rod("rust", [33, MY + 3.2, 14.5], [33, MY + 4.4, 14.5], 0.08, 6);
    S.light(31, MY + 2, 14.5, 0xffb060, 4.5, 0.6);
    S.glow(32.1, MY + 1.8, 14.5, 0xffa040, 0.6);
    E.hangLamp(S, 15, MY + 4.4, 8, { chain: 1.6, color: 0xffd8a0 });
    for (let row = 0; row < 5; row++)
      E.hangLamp(S, 23, MY + 4.4, 3.1 + row * 3.2, {
        chain: 1.2,
        color: 0xffd8a0,
        r: 6,
        i: row === 2 ? 0 : 0.75,
        lit: row !== 2,
      });
    for (let x = 12; x < 34; x += 4)
      b.box("wood_dark", x, MY + 4.1, -10, x + 0.3, MY + 4.4, 22, {
        seg: false,
      });
    E.hangLamp(S, 30, MY + 4.4, 18, { chain: 1.4, color: 0xffd0a0 });
    E.hangLamp(S, 28, MY + 4.4, -5, { chain: 1.4, color: 0xffd0a0, i: 0.6 });
    S.prop("skeleton", 30.5, MY, -2.4, 2.2, { pose: "seated" });
    D.papers(b, 22, MY + 0.01, 10, 5, 22);
    // =============== props (containers / terminals / pickups) ===============
    S.prop("terminal", -36.0, 0.765, -6.1, 0, {
      terminalId: "pe_dn_editor",
      mount: "bare",
    });
    S.prop("terminal", 13.0, MY, 12.0, HP, {
      terminalId: "pe_dn_morgue",
      mount: "own_desk",
    });
    S.prop("terminal", -13.8, PY + 3.0, -35.6, HP, {
      terminalId: "pe_dn_press",
      mount: "own_desk",
    });
    S.prop("terminal", -7.6, 0, 3.0, 0.99, {
      terminalId: "pe_dn_globe",
      mount: "own_desk",
    });
    S.prop("safe", 31.5, MY, -9.4, 0, {
      locked: 0,
      lock: P.LOCKS.dn_morgue_safe,
      name: "Morgue Safe",
      items: [
        ["scrip", 120],
        ["rally_tonic", 2],
        ["pe_dn_press_photo", 1],
      ],
    });
    S.prop("desk", -39.2, 0, -1.8, HP, {
      loot: "desk",
      owner: "settlers",
      name: "Editor's Desk",
    });
    S.prop("file_cabinet", -29.2, 0, -9.4, 0, {
      loot: "file_cabinet",
      owner: "settlers",
    });
    S.prop("file_cabinet", 33.5, MY, 6.2, -HP, { loot: "file_cabinet" });
    S.prop("ammo_box", 22.4, PY + 1.0, -30.5, 0.2, {
      loot: "ammo_box",
      owner: "settlers",
    });
    S.prop("radio", 15.8, MY + 0.76, 8.4, 0.4);
    S.prop("fizzo_machine", -8.7, 0, 12.7, 2.07);
    S.pickup("pe_reel_lastedition", 1, 14.6, MY + 0.8, 8.1);
    S.pickup("pe_note_foreman", 1, -2.0, PY + 0.05, -47.3);
    S.pickup("pe_note_style", 1, -24.3, 0.8, 5.9);
    S.pickup("rally_tonic", 1, 22.3, 0.8, -6.3);
    // =============== anchors ===============
    S.anchor("entrance", 0, 0, 24.5, 0);
    S.anchor("editor", -36, 0, -7.4, PI);
    S.anchor("scoop", -20.8, 0, 1.1, PI);
    S.anchor("lou", -17.6, PY, -36.0, -HP);
    S.anchor("merchant", 6.3, 0, 14.6, -PI * 0.76 + PI);
    S.anchor("doc", 24.2, 0, -5.2, -HP);
    S.anchor("guard1", -1.8, 0, 20.2, PI);
    S.anchor("guard2", 20.5, PY + 1.0, -31, -HP);
    S.anchor("npc1", -30, 0, 7, 0);
    S.anchor("npc2", -25.6, 0, 16.2, PI);
    S.anchor("npc3", 25.5, 0, 15.2, 0);
    S.anchor("npc4", 16.5, MY, 12, -HP);
    S.anchor("npc5", 4.5, PY, -36, HP);
    S.anchor("globe", 0, 0, 8 + WELL + 0.8, PI);
    S.anchor("press_motor", -19.0, PY, -36, -HP);
    S.anchor("press_lever", -18.4, PY, -32.4, 0);
    S.anchor("press_ctl", -12.8, PY + 3.0, -36, HP);
    S.anchor("dock", 22.6, PY + 1.0, -32.8, HP);
    S.anchor("morgue", 22, MY, 8, 0);
    S.anchor("loot1", 31.5, MY, -8.6, 0);
    S.anchor("loot2", -39, 0, -1.8, 0);
    S.anchor("loot3", 22.4, PY + 1.0, -30.5, 0);
    for (const [i, p] of [
      [1, [-8, 0, 0]],
      [2, [8, 0, 1]],
      [3, [-28, 0, 10]],
      [4, [0, PY, -26]],
      [5, [-4, PY, -46]],
      [6, [26, 0, 6]],
    ])
      S.anchor("spawn" + i, p[0], p[1], p[2], 0);
    S.build({ interior: true });
    for (const o of S._extra || []) S.root.add(o);
    // the live board & ticker quads (their canvases are redrawn by 80_content)
    DN.boardTexKey = null;
    return S;
  }

  // roller / web scroll materials (own textures so the scroll never leaks)
  P.CUSTOM.roller_tex = [
    256,
    128,
    (ctx, w, h) => {
      const r = P.rng("roller");
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#2a2c2a");
      g.addColorStop(0.5, "#707470");
      g.addColorStop(1, "#2a2c2a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = "rgba(10,10,12,0.8)";
        ctx.fillRect((i * w) / 6, 0, 6, h);
      }
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = "rgba(10,10,12," + r() * 0.4 + ")";
        ctx.fillRect(r() * w, 0, 2, h);
      }
    },
  ];
  P.CUSTOM.web_tex = [
    512,
    128,
    (ctx, w, h) => {
      const r = P.rng("web");
      ctx.fillStyle = "#dcd4bc";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(40,36,30,0.45)";
      for (let x = 8; x < w; x += 64)
        for (let y = 10; y < h - 6; y += 6)
          ctx.fillRect(x, y, 44 * (0.6 + r() * 0.4), 2);
    },
  ];
  P.MAT.roller = {
    custom: "roller_tex",
    color: 0x606460,
    metal: 0.6,
    rough: 0.4,
    uv: 1,
    keep: true,
  };
  P.MAT.web = {
    custom: "web_tex",
    color: 0xd8d0b8,
    rough: 1,
    uv: 1,
    keep: true,
    noShadow: true,
  };

  P.addBuilder(
    "journal_bldg",
    function () {
      const EX = buildExterior(),
        ES = EX.S;
      const I = buildInterior();
      const O = P.I("journal_bldg");
      P.addInterior("journal_bldg", I.root);
      DN.extRoot = ES.root;
      ES.door(
        EX.doorX,
        1.6,
        EX.doorZ + 0.35,
        "First Journal Building",
        { x: O.x, y: O.y, z: O.z + 24.2, yaw: 0 },
        {
          id: "pe_dn_front",
          radius: 2.0,
          onEnter: () => P.safe("disc", () => G.discover("journal_bldg")),
        },
      );
      I.door(
        0,
        1.5,
        26.7,
        "42nd Street",
        { x: EX.doorX, y: 0, z: EX.doorZ + 2.6, yaw: PI },
        { id: "pe_dn_front_in", verb: "Exit", radius: 1.8 },
      );
      // loading dock loop: pressroom ⇄ east side of the building
      I.door(
        23.6,
        -6 + 2.4,
        -31,
        "Loading Dock (outside)",
        { x: 331.4, y: 0, z: -252, yaw: -HP },
        { id: "pe_dn_dock_in", verb: "Exit", radius: 1.8, sound: "door_open" },
      );
      ES.door(
        329.3,
        1.6,
        -252,
        "First Journal — Pressroom Dock",
        { x: O.x + 22.6, y: O.y - 6 + 1.0, z: O.z - 32.8, yaw: 2.0 },
        { id: "pe_dn_dock", radius: 1.8 },
      ); // arrival faces west along the dock apron (clear), away from the dock door
      P.register("journal_bldg", {
        root: ES.root,
        interiorRoot: I.root,
        interiorKey: "journal_bldg",
        anchors: Object.assign({}, ES.anchors, I.anchors),
      });
    },
    10,
  );
})();
