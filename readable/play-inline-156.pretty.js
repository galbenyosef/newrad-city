/* src/poi_uptown/40_carnegie.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 40 Carnegie Hall
 *
 * EXTERIOR (round-1 wedge site x -104.5..-50, z -403..-372: main front on 57th Street,
 *   side on Seventh Avenue, the diagonal west face along Broadway out of Columbus Circle): Renaissance-Revival block of Roman brick
 *   and terracotta — rusticated base with the arched entrance arcade and
 *   marquee, the piano-nobile loggia of tall arched windows between
 *   pilasters, the CARNEGIE HALL frieze, attic, heavy cornice and the
 *   studio mansard with its skylights; the musicians' banner.
 * INTERIOR: see 40_carnegie_interior.js (cell geometry, lighting, props, anchors and the
 *   street<->interior doors; it also registers the G.pois entry).
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

  function posterTex(i) {
    const titles = [
      ["THE CARNEGIE CONSORT", "TONIGHT", "All Welcome", "No Guns In The Hall"],
      ["NEW YORK PHILHARMONIC", "Winter Season 1967", "Beethoven · Brahms"],
      ["JAZZ AT CARNEGIE", "One Night Only", "The Atomic Swing Orchestra"],
      ["DR. STRANGEWOOD'S", "THEREMIN", "SPECTACULAR"],
    ];
    const cols = [
      ["#e0d0a0", "#7a1f18"],
      ["#1e2a4a", "#e8d8b0"],
      ["#e8c860", "#1a1a1a"],
      ["#3a1e3a", "#f0c060"],
    ];
    return P.signTex("carn_poster" + i, titles[i], "poster", 320, 480, {
      bg: cols[i][0],
      fg: cols[i][1],
      art: (ctx, w, h, r) => {
        ctx.strokeStyle = cols[i][1];
        ctx.lineWidth = 4;
        if (i === 0 || i === 1) {
          for (let k = 0; k < 5; k++) {
            ctx.beginPath();
            ctx.moveTo(30, h * 0.62 + k * 12);
            ctx.lineTo(w - 30, h * 0.62 + k * 12);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(w * 0.4, h * 0.66, 10, 0, TAU);
          ctx.fill();
        } else if (i === 2) {
          ctx.beginPath();
          ctx.moveTo(w * 0.3, h * 0.9);
          ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.7, h * 0.55);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(w * 0.7, h * 0.55, 20, 0, TAU);
          ctx.stroke();
        } else {
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.7, 14 + k * 14, PI * 1.1, PI * 1.9);
            ctx.stroke();
          }
        }
        void r;
      },
    });
  }
  P.carnegiePosterTex = posterTex; // shared with 40_carnegie_interior.js (lobby posters)

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function buildExterior() {
    const S = P.site("carnegie_ext", { grime: 0.5 });
    const b = S.b;
    // Round-1 wedge (layout SITES.carnegie_hall.poly): 59th St north, 7th Ave east, 57th St south (main front),
    // and the diagonal west face along Broadway's east kerb as Broadway leaves Columbus Circle. The building keeps
    // a ~2 m sidewalk margin inside the site on every side:
    //   A (57th St / Broadway corner) → B (kink where the diagonal meets the short 59th St return) → C (NW corner).
    const X0 = -88.4,
      X1 = -52,
      Z0 = -401,
      Z1 = -374,
      H = 23;
    const A = [-88.4, -374],
      B = [-101.9, -397],
      C = [-101.9, -401];
    const FOOT = [A, B, C, [X1, Z0], [X1, Z1]]; // building footprint (x, z), counter-clockwise seen from above
    const polyShape = (pts) => {
      const sh = new THREE.Shape();
      pts.forEach((p, i) =>
        i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1]),
      );
      sh.closePath();
      return sh;
    };
    const flat = (key, pts, y0, y1, o) =>
      b.extrude(
        key,
        polyShape(pts),
        y1 - y0,
        P.m4(0, y0, 0, 0, -HP),
        Object.assign({ seg: false }, o || {}),
      );
    // sidewalk over the exact site footprint (never into Broadway's corridor)
    const L = G.LAYOUT,
      site = L && L.getSite ? L.getSite("carnegie_hall") : null;
    const sitePoly =
      site && site.poly
        ? site.poly
        : [
            [-104.5, -403],
            [-50, -403],
            [-50, -372],
            [-104.5, -372],
          ];
    flat("sidewalk", sitePoly, 0, 0.03, { grime: 0.5, noAO: true });
    // masses: the 7th Ave block, the 59th St return and the Broadway wing (a slab along the diagonal)
    const FD = P.face(S, [B[0], B[1], A[0], A[1]]); // the Broadway (diagonal) facade, u from B to A
    for (const [key, y0, y1] of [
      ["terracotta", 0, 6],
      ["brick_roman", 6, H],
    ]) {
      b.box(key, X0, y0, Z0, X1, y1, Z1);
      b.box(key, C[0], y0, Z0, X0, y1, B[1]);
      FD.box(key, 0, FD.len, y0, y1, -6, 0);
    }
    flat("concrete", FOOT, H - 0.35, H + 0.05, { grime: 0.7 }); // roof deck over the whole wedge
    S.col(X0, 0, Z0, X1, H, Z1);
    S.col(C[0], 0, Z0, X0, H, B[1]);
    {
      const m = FD.pt(FD.len / 2, -3);
      S.colR(m[0], m[1], FD.len, 6, 0, H, Math.atan2(-FD.dz, FD.dx));
    }
    const DOOR_U = 13.4; // entrance arcade centre on the 57th St front (x = X0 + 13.4 = -75)
    const front = (side, a0, a1, c, main) => {
      const F = P.face(S, side, a0, a1, c);
      // rusticated base
      for (let y = 0.75; y < 6; y += 0.75)
        F.box("terracotta", 0, F.len, y - 0.04, y + 0.04, 0.01, 0.06, {
          seg: false,
          grime: 0.8,
        });
      F.band("terracotta", 5.7, 6.3, 0, 0.45);
      // pilasters + tall arched loggia windows (piano nobile)
      const nb = main ? 9 : Math.round(F.len / 6);
      for (let i = 0; i <= nb; i++) {
        const u = 2 + (i * (F.len - 4)) / nb;
        F.box("brick_roman", u - 0.35, u + 0.35, 6.3, 15.6, 0, 0.3);
        F.box("terracotta", u - 0.5, u + 0.5, 15.0, 15.6, 0, 0.45, {
          seg: false,
        });
        F.box("terracotta", u - 0.45, u + 0.45, 6.3, 6.8, 0, 0.4, {
          seg: false,
        });
      }
      for (let i = 0; i < nb; i++) {
        const u = 2 + ((i + 0.5) * (F.len - 4)) / nb;
        F.window(u, 7.4, 2.3, 6.6, {
          arch: true,
          style: i % 4 === 1 ? "broken" : "dark",
          frame: "wood_dark",
          sill: "terracotta",
          keystone: "terracotta",
          mull: true,
        });
        F.arch("terracotta", u, 7.4 + 6.6 - 1.15, 1.15, 0.35, 0, 0.3);
        // balustrade under each window
        for (let k = -3; k <= 3; k++)
          F.box(
            "terracotta",
            u + k * 0.3 - 0.06,
            u + k * 0.3 + 0.06,
            6.8,
            7.4,
            0.2,
            0.35,
            { seg: false },
          );
        F.box("terracotta", u - 1.2, u + 1.2, 7.35, 7.45, 0.15, 0.4, {
          seg: false,
        });
        // attic: paired small arched windows
        for (const s of [-0.55, 0.55])
          F.window(u + s, 17.8, 0.8, 2.6, {
            arch: true,
            style: "dark",
            frame: "wood_dark",
            sill: false,
            mull: false,
          });
      }
      F.band("terracotta", 15.6, 16.1, 0, 0.5);
      F.band("terracotta", 16.9, 17.2, 0, 0.3);
      F.cornice("terracotta", 22.0, 1.2, { step: 0.8 });
      // ground floor windows / doors
      if (!main)
        for (let i = 0; i < nb; i++) {
          const u = 2 + ((i + 0.5) * (F.len - 4)) / nb;
          F.window(u, 1.2, 1.6, 3.6, {
            arch: true,
            style: "dark",
            frame: "iron",
            sill: "terracotta",
            mull: false,
          });
        }
      return F;
    };
    const FS = front("s", X0, X1, Z1, true);
    front("e", Z0, Z1, X1, false);
    front([B[0], B[1], A[0], A[1]], 0, 0, 0, false); // the Broadway face gets the full loggia treatment
    const FN = P.face(S, "n", C[0], X1, Z0),
      FW = P.face(S, "w", Z0, B[1], C[0]);
    // Broadway parapet over the diagonal cornice
    FD.box("terracotta", 0, FD.len, H, H + 1.1, -0.5, 0, { seg: false });
    for (const F of [FN, FW]) {
      F.cornice("terracotta", 22.0, 0.7, { mods: false });
      for (let u = 3; u < F.len - 2; u += 4)
        for (const y of [2, 8, 13, 18])
          F.window(u, y, 1.2, 2.4, {
            style: "dark",
            frame: "wood_dark",
            sill: "terracotta",
            mull: false,
          });
    }
    // name frieze (terracotta lettering) + founder inscription on 7th Ave
    const nm = P.texMat(
      "carn_name",
      P.signTex("carn_name", ["CARNEGIE HALL"], "engraved", 1024, 96, {
        bg: "#b88064",
        fg: "rgba(60,30,20,0.9)",
        spacing: 18,
      }),
      { rough: 0.9 },
    );
    FS.quad(nm, FS.len / 2, 16.5, 22, 0.8, 0.52);
    const FE = P.face(S, "e", Z0, Z1, X1);
    const nm2 = P.texMat(
      "carn_name2",
      P.signTex(
        "carn_name2",
        ["MUSIC HALL · FOUNDED 1891"],
        "engraved",
        1024,
        64,
        { bg: "#b88064", fg: "rgba(60,30,20,0.9)", spacing: 6 },
      ),
      { rough: 0.9 },
    );
    FE.quad(nm2, FE.len / 2, 16.5, 18, 0.6, 0.52);
    FD.quad(nm, FD.len / 2, 16.5, 17, 0.62, 0.52); // the name also faces Columbus Circle
    // entrance arcade: five arched doorways + the marquee
    for (let k = -2; k <= 2; k++) {
      const u = DOOR_U + k * 3.6;
      FS.box("terracotta", u - 1.8, u + 1.8, 0, 5.4, 0, 0.5);
      FS.box("wood_dark", u - 1.2, u + 1.2, 0, 3.4, 0.48, 0.55, { seg: false });
      FS.box("glass_dark", u - 1.0, u + 1.0, 1.2, 3.2, 0.55, 0.57, {
        seg: false,
      });
      FS.halfDisc("glass_dark", u, 3.4, 1.2, 0.56);
      FS.arch("terracotta", u, 3.4, 1.2, 0.4, 0.3, 0.75);
      for (const s of [-1, 1])
        FS.box(
          "brick_roman",
          u + s * 1.55 - 0.18,
          u + s * 1.55 + 0.18,
          0,
          3.4,
          0.5,
          0.75,
          { seg: false },
        );
    }
    FS.box("steel", DOOR_U - 10, DOOR_U + 10, 5.6, 6.3, 0, 3.0, { seg: false });
    FS.box("paint_white", DOOR_U - 9.9, DOOR_U + 9.9, 5.4, 5.6, 0.2, 2.9, {
      seg: false,
    });
    const mq = P.texMat(
      "carn_marquee",
      P.signTex("carn_marquee", ["CARNEGIE HALL"], "marquee", 1024, 96, {
        bg: "#241410",
        fg: "#f4e0b0",
        spacing: 10,
      }),
      { rough: 0.5, emissive: 0.4 },
    );
    b.quad(mq, X0 + DOOR_U, 5.95, Z1 + 3.02, 19.6, 0.65, { ry: 0 });
    for (let k = -8; k <= 8; k++)
      b.sphere("lamp_dim", X0 + DOOR_U + k * 1.15, 5.33, Z1 + 2.6, 0.07, {
        ws: 5,
        hs: 4,
      });
    S.glow(X0 + DOOR_U, 5.0, Z1 + 2.2, 0xffd8a0, 2.2);
    for (const s of [-1, 1])
      b.rod(
        "steel",
        [X0 + DOOR_U + s * 8, 6.3, Z1 + 2.9],
        [X0 + DOOR_U + s * 8, 9.8, Z1 + 0.1],
        0.05,
        4,
      );
    // the Consort's hand-painted banner across the loggia
    const ban = P.texMat(
      "carn_banner",
      P.signTex(
        "carn_banner",
        [
          "THE CARNEGIE CONSORT",
          "MUSIC NIGHTLY · ALL WELCOME · NO GUNS IN THE HALL",
        ],
        "banner",
        1024,
        192,
        { bg: "#d8ccb0", fg: "#6a1a14", top: 0.18 },
      ),
      { double: true, rough: 1 },
    );
    const bg = new THREE.PlaneGeometry(18, 3.2, 10, 1);
    {
      const p = bg.attributes.position;
      for (let v = 0; v < p.count; v++)
        p.setZ(v, Math.sin(p.getX(v) * 0.5) * 0.12);
    }
    b.geo(ban, bg, P.m4(X0 + DOOR_U, 11.8, Z1 + 0.62), {
      uv: "keep",
      noAO: true,
      grime: 0.2,
    });
    for (const s of [-1, 1])
      b.rod(
        "rust",
        [X0 + DOOR_U + s * 9, 13.4, Z1 + 0.3],
        [X0 + DOOR_U + s * 9, 13.4, Z1 + 0.7],
        0.03,
        3,
      );
    // concert posters on the base
    for (let i = 0; i < 4; i++) {
      const pk = P.texMat("carn_p" + i, posterTex(i), { rough: 0.9 });
      FS.quad(pk, 24.6 + i * 2.9, 2.2, 1.1, 1.65, 0.53);
      FD.quad(pk, 3.5 + i * 5.6, 2.2, 1.1, 1.65, 0.53);
      if (i === 0) FS.quad(pk, 2.3, 2.2, 1.1, 1.65, 0.53);
    }
    // studio mansard + skylights
    P.mansard(
      b,
      "terracotta",
      (X0 + X1) / 2,
      (Z0 + Z1) / 2,
      X1 - X0 - 3,
      Z1 - Z0 - 1,
      true,
      H + 1.1,
      H + 7.5,
      12,
      { crest: false },
    );
    for (let x = X0 + 5; x < X1 - 4; x += 6.5) {
      b.box("iron", x - 1.6, H + 5.6, Z1 - 6.6, x + 1.6, H + 5.8, Z1 - 3.8, {
        seg: false,
        rx: 0.9,
      });
      b.box(
        (x | 0) % 3 === 0 ? "glass_broken" : "glass",
        x - 1.5,
        H + 5.5,
        Z1 - 6.5,
        x + 1.5,
        H + 5.6,
        Z1 - 3.9,
        { seg: false, rx: 0.9 },
      );
    }
    // Broadway wing roof: a timber water tank on its steel stand, and the collapsed studio corner at the
    // 59th St kink (charred rafters + rubble)
    {
      const tx = -93.2,
        tz = -391.5,
        ty = H + 0.05;
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.rod(
          "iron",
          [tx + sx * 1.3, ty, tz + sz * 1.3],
          [tx + sx * 1.1, ty + 4.2, tz + sz * 1.1],
          0.07,
          5,
        );
      b.box(
        "iron",
        tx - 1.5,
        ty + 4.2,
        tz - 1.5,
        tx + 1.5,
        ty + 4.4,
        tz + 1.5,
        { seg: false },
      );
      b.cyl("wood_rotten", tx, ty + 4.4, tz, 1.55, 1.6, 3.6, 16, { hSeg: 3 });
      for (const y of [5.2, 6.4, 7.5])
        b.torus("rust", tx, ty + y, tz, 1.6, 0.035, TAU, {
          rx: HP,
          ts: 20,
          rs: 3,
        });
      b.cyl("wood_dark", tx, ty + 8.0, tz, 0.05, 1.75, 1.2, 16);
      b.rod(
        "iron",
        [tx + 1.2, ty + 4.4, tz + 1.2],
        [tx + 1.3, ty, tz + 2.6],
        0.03,
        4,
      );
      S.col(tx - 1.6, ty, tz - 1.6, tx + 1.6, ty + 8, tz + 1.6, {
        walkable: false,
      });
      for (let i = 0; i < 6; i++)
        b.rod(
          "wood_rotten",
          [-99.2 + i * 0.7, H + 0.1, -399.4],
          [-98.4 + i * 0.6, H + 3.6 - (i % 2), -395.2],
          0.09,
          4,
          { square: true },
        );
      D.rubble(S, -97.5, H + 0.05, -398.2, 1.5, { n: 6 });
    }
    // settlers' sandbags + a burning drum + string lights over the door
    for (const s of [-1, 1]) {
      for (let k = 0; k < 5; k++)
        b.box(
          "fabric",
          X0 + DOOR_U + s * 11.5 - 0.5 + (k % 2) * 0.1,
          (k >> 1) * 0.28,
          Z1 + 1.2 + (k % 2) * 0.6,
          X0 + DOOR_U + s * 11.5 + 0.5,
          (k >> 1) * 0.28 + 0.3,
          Z1 + 1.7 + (k % 2) * 0.6,
          { seg: false, grime: 0.6 },
        );
      S.col(
        X0 + DOOR_U + s * 11.5 - 0.6,
        0,
        Z1 + 1.1,
        X0 + DOOR_U + s * 11.5 + 0.6,
        0.85,
        Z1 + 2.4,
        { walkable: false },
      );
    }
    S.prop("barrel", X0 + DOOR_U + 13.5, 0, Z1 + 2.5, 0, { burning: true });
    for (let k = 0; k < 14; k++) {
      const x = X0 + DOOR_U - 9 + k * 1.4;
      b.sphere(
        k % 4 === 2 ? "glass_dark" : "lamp",
        x,
        6.9 - Math.sin((k / 13) * PI) * 0.5,
        Z1 + 0.35,
        0.06,
        { ws: 5, hs: 4 },
      );
    }
    S.anchor("exterior_entrance", X0 + DOOR_U, 0, Z1 + 3.5, PI);
    S.anchor("front", X0 + DOOR_U, 0, Z1 + 6, PI);
    S.build({ shadow: true, lod: 280 });
    return { S, doorX: X0 + DOOR_U, doorZ: Z1 };
  }

  // ===================================================================
  // Registration: right after the exterior is built, 40_carnegie_interior.js
  // (P.interiorBuilders.carnegie_hall) builds the interior cell, the street<->interior doors
  // and registers the G.pois entry (see P.finishSite in 00_kit.js).
  // ===================================================================
  P.addBuilder(
    "carnegie_hall",
    function () {
      P.finishSite("carnegie_hall", buildExterior());
    },
    40,
  );
})();
