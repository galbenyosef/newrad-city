/* src/poi_theater/30_port_authority.js */
/* =====================================================================
 * NEW RAD CITY — POI THEATER · 30 Port Authority Bus Terminal
 *
 * EXTERIOR (site x -190..-130, z -224..-191; Eighth Avenue front, east):
 *   the 1950 modernist terminal — a long, low buff-brick block with
 *   continuous ribbon windows, a cantilevered steel canopy over the
 *   glazed Eighth Avenue entrance, PORT AUTHORITY BUS TERMINAL in steel
 *   letters along the parapet, the corner pylon "BUSES" sign, the roof
 *   bus deck with its parapet and the concrete ramp spiralling down to
 *   the Lincoln Tunnel approach on the west side (a bus still stuck on
 *   it). Raiders have walled the entrance with scrap, bus doors and
 *   spikes ("PORT OF NO RETURN").
 * INTERIOR (cell 'port_authority', origin 8200,0,400) — raider den:
 *   the tiled main concourse (ticket counters of the long-gone bus lines,
 *   the split-flap departures board, benches, newsstand, lunch counter,
 *   the coin lockers with Locker 417), the raiders' camp and cages; the
 *   stalled escalators up to the upper bus deck (loading gates 201–208,
 *   rusted buses nosed in, the boss's glass dispatcher office, a ramp
 *   portal choked with wrecks), the gate stair back down; and the baggage
 *   room in the basement (carousel, Lost & Found cage, flooded corner).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pt) return;
  const P = G._pt,
    D = P.dress,
    K = P.parts;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  const X0 = -189.5,
    X1 = -130.5,
    Z0 = -223.5,
    Z1 = -191.5;
  const H = 21; // roof bus deck (parapet +1.3)
  const DOOR_Z = -207.5; // main entrance on Eighth Avenue

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function buildExterior() {
    const S = P.site("pa_ext", { grime: 0.6 });
    const b = S.b;
    b.box("sidewalk", X0 - 0.3, 0, Z0 - 0.3, X1 + 0.3, 0.04, Z1 + 0.3, {
      segLen: 8,
      grime: 0.55,
      noAO: true,
    });
    // main block (leaving the west 10 m for the ramp structure)
    const RX = X0 + 11; // ramp zone x X0..RX
    b.box("brick_buff", RX, 5.2, Z0, X1, H, Z1);
    b.box("concrete", RX, 0, Z0, X1, 5.2, Z1);
    S.col(RX, 0, Z0, X1, H, Z1);
    b.box("concrete", RX + 0.3, H, Z0 + 0.3, X1 - 0.3, H + 0.15, Z1 - 0.3, {
      noAO: true,
    });
    // roof parapet (bus deck)
    for (const [x0, z0, x1, z1] of [
      [RX, Z0, X1, Z0 + 0.4],
      [RX, Z1 - 0.4, X1, Z1],
      [X1 - 0.4, Z0, X1, Z1],
    ]) {
      b.box("concrete", x0, H, z0, x1, H + 1.3, z1, { seg: false });
      S.col(x0, H, z0, x1, H + 1.3, z1, { walkable: false });
    }
    for (let x = RX + 3; x < X1 - 3; x += 3.2)
      b.box("rust", x, H + 1.3, Z0 + 0.1, x + 0.12, H + 2.1, Z0 + 0.3, {
        seg: false,
      });

    // ---------------- EAST FACADE (Eighth Avenue) ----------------
    const FE = P.face(S, "e", Z0, Z1, X1); // u = Z1 - z, len 32
    const uD = Z1 - DOOR_Z; // 16
    // ground floor: steel-framed glazing band + doors
    FE.box("stainless", 0, FE.len, 0, 0.5, 0, 0.2, { seg: false });
    for (let u = 0.6; u < FE.len - 0.5; u += 2.2) {
      const door = Math.abs(u + 1.1 - uD) < 5;
      FE.box(
        door
          ? "glass_dark"
          : ((u * 7) | 0) % 3 === 0
            ? "glass_broken"
            : "glass_dark",
        u + 0.06,
        u + 2.14,
        0.5,
        door ? 3.0 : 3.6,
        0.05,
        0.09,
        { seg: false },
      );
      FE.box("stainless", u - 0.05, u + 0.05, 0.5, 4.0, 0.0, 0.16, {
        seg: false,
      });
    }
    FE.box("stainless", 0, FE.len, 3.6, 4.0, 0, 0.16, { seg: false });
    FE.box("stainless", uD - 5, uD + 5, 3.0, 3.1, 0.02, 0.16, { seg: false });
    // cantilevered canopy with the terminal name on its fascia + soffit lights
    FE.box("steel", uD - 12, uD + 12, 4.3, 4.9, 0, 4.2, { seg: false });
    FE.box("stainless", uD - 12.05, uD + 12.05, 4.85, 4.95, 0, 4.25, {
      seg: false,
    });
    const fas = P.texMat(
      "pa_fascia",
      P.signTex(
        "pa_fascia",
        ["PORT AUTHORITY BUS TERMINAL"],
        "default",
        1024,
        64,
        { bg: "#1c2a38", fg: "#e8e4d8" },
      ),
      { rough: 0.5, emissive: 0.15 },
    );
    {
      const p = FE.pt(uD, 4.22);
      b.quad(fas, p[0], 4.6, p[1], 22, 0.55, { ry: FE.ry });
    }
    for (let k = -5; k <= 5; k++) {
      const p = FE.pt(uD + k * 2.1, 2.2);
      b.box(
        (k + 5) % 3 === 0 ? "glass_dark" : "lamp_dim",
        p[0] - 0.5,
        4.26,
        p[1] - 0.2,
        p[0] + 0.5,
        4.3,
        p[1] + 0.2,
        { seg: false, noAO: true },
      );
    }
    {
      const p = FE.pt(uD, 2.4);
      S.glow(p[0], 4.0, p[1], 0xe8f0ff, 3.8, { flicker: 0.25 });
    }
    for (const s of [-1, 1]) {
      const a = FE.pt(uD + s * 10, 4.0),
        c = FE.pt(uD + s * 10, 0.1);
      b.rod("steel", [a[0], 4.9, a[1]], [c[0], 8.4, c[1]], 0.05, 4);
    }
    // upper floors: continuous ribbon windows between brick spandrels (three bands)
    for (let k = 0; k < 3; k++) {
      const y = 6.4 + k * 4.4;
      FE.box("concrete", 0, FE.len, y - 0.25, y, 0, 0.35, { seg: false });
      FE.box("concrete", 0, FE.len, y + 2.1, y + 2.3, 0, 0.25, { seg: false });
      for (let u = 0.4; u < FE.len - 0.3; u += 1.6) {
        const st = ((u * 13 + k * 7) | 0) % 5;
        FE.box(
          st === 0 ? "glass_broken" : "glass_dark",
          u + 0.05,
          u + 1.55,
          y,
          y + 2.1,
          0.02,
          0.06,
          { seg: false },
        );
        FE.box("stainless", u - 0.03, u + 0.03, y, y + 2.1, 0, 0.1, {
          seg: false,
        });
        if (st === 3 && k === 1)
          FE.box(
            "wood_rotten",
            u + 0.1,
            u + 1.5,
            y + 0.3,
            y + 1.8,
            0.08,
            0.12,
            { seg: false },
          );
      }
    }
    // parapet lettering (steel letters on the brick above the top band)
    const nm = P.texMat(
      "pa_name",
      P.signTex(
        "pa_name",
        ["PORT AUTHORITY BUS TERMINAL"],
        "bronze",
        1024,
        96,
        { c0: "#d8d4c8", c1: "#8a8a84", font: P.FONTS.SANS },
      ),
      { transparent: true, rough: 0.4, metal: 0.5 },
    );
    FE.quad(nm, uD, 19.6, 28, 1.7, 0.05);
    // the corner pylon (south-east): vertical BUSES sign with neon arrow
    const pu = 0.9,
      pl = P.texMat(
        "pa_buses",
        K.bladeTex("pa_buses", "BUSES", {
          bg: "#12202e",
          neon: "#6ab8ff",
          frame: "#d8d4c8",
          dead: [3],
        }),
        { emissive: 0.9, rough: 0.5 },
      );
    FE.box("stainless", pu - 0.35, pu + 0.35, 5.5, 19.5, 0.3, 3.2, {
      seg: false,
    });
    for (const s of [-1, 1]) {
      const p = FE.pt(pu + s * 0.36, 1.75);
      b.quad(pl, p[0], 12.5, p[1], 2.8, 13.6, { ry: s < 0 ? 0 : PI });
    }
    {
      const a = FE.pt(pu, 3.25);
      K.bulbs(b, [a[0], 5.8, a[1]], [a[0], 19.2, a[1]], 0.4, {
        key: "neon_blue",
        dead: 0.3,
      });
    }
    {
      const p = FE.pt(pu, 1.75);
      S.glow(p[0], 9, p[1], 0x6ab8ff, 3.2);
      S.glow(p[0], 15, p[1], 0x6ab8ff, 3.2, { flicker: 0.3 });
    }

    // ---------------- NORTH (42nd Street) + SOUTH (40th) ----------------
    for (const side of ["n", "s", "w"]) {
      const F =
        side === "n"
          ? P.face(S, "n", RX, X1, Z0)
          : side === "s"
            ? P.face(S, "s", RX, X1, Z1)
            : P.face(S, "w", Z0, Z1, RX);
      F.box("concrete", 0, F.len, 0, 0.5, 0, 0.2, { seg: false });
      for (let k = 0; k < 3; k++) {
        const y = 6.4 + k * 4.4;
        F.box("concrete", 0, F.len, y - 0.25, y, 0, 0.35, { seg: false });
        for (let u = 0.4; u < F.len - 0.3; u += 1.6) {
          const st = ((u * 11 + k * 5 + (side === "n" ? 3 : 0)) | 0) % 6;
          F.box(
            st === 0 ? "glass_broken" : "glass_dark",
            u + 0.05,
            u + 1.55,
            y,
            y + 2.1,
            0.02,
            0.06,
            { seg: false },
          );
          F.box("stainless", u - 0.03, u + 0.03, y, y + 2.1, 0, 0.1, {
            seg: false,
          });
        }
      }
      // ground: bus exit portals + shop fronts (boarded)
      for (let u = 3; u < F.len - 4; u += 8) {
        F.box("concrete_dark", u, u + 6, 0, 4.4, 0.0, 0.05, { seg: false });
        F.box(
          u % 16 === 3 ? "corrugated" : "wood_rotten",
          u + 0.2,
          u + 5.8,
          0.1,
          4.2,
          0.05,
          0.1,
          { seg: false },
        );
      }
      if (side !== "w")
        try {
          if (!G.isStub("mats") && G.mats.billboard) {
            const k = P.texMat(
              "pa_ad_" + side,
              G.mats.billboard(side === "n" ? "eagle_motors" : "hi_octane").map,
              { rough: 0.9 },
            );
            F.quad(k, F.len * 0.55, 13, 11, 4.2, 0.4);
          }
        } catch (e) {
          /* optional */
        }
    }
    // raider graffiti across the Eighth Avenue front
    const gr1 = P.texMat(
      "pa_graf1",
      P.signTex("pa_graf1", ["PORT OF NO RETURN"], "raider", 1024, 192, {
        fg: "#c42a1e",
      }),
      { transparent: true, rough: 1 },
    );
    FE.quad(gr1, 25, 2.2, 9, 1.7, 0.2);
    const gr2 = P.texMat(
      "pa_graf2",
      P.signTex("pa_graf2", ["TOLL: EVERYTHING"], "raider", 512, 128, {
        fg: "#e8d84a",
      }),
      { transparent: true, rough: 1 },
    );
    FE.quad(gr2, 6.5, 2.6, 5, 1.2, 0.2);

    // ---------------- WEST: the tunnel ramp structure ----------------
    // a concrete helix (two turns) from the roof deck down to 9th Ave, on round piers
    const cx = X0 + 5.5,
      cz = (Z0 + Z1) / 2,
      R = 4.6;
    b.cyl("concrete", cx, 0, cz, 1.4, 1.6, H + 1.3, 14);
    for (let i = 0; i < 40; i++) {
      const t0 = i / 40,
        t1 = (i + 1) / 40,
        a0 = t0 * TAU * 2 + PI * 0.5,
        a1 = t1 * TAU * 2 + PI * 0.5;
      const y0 = H * (1 - t0),
        y1 = H * (1 - t1);
      const p0 = [cx + Math.cos(a0) * R, cz + Math.sin(a0) * R],
        p1 = [cx + Math.cos(a1) * R, cz + Math.sin(a1) * R];
      const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]),
        ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
      const M = new THREE.Matrix4().compose(
        new THREE.Vector3(
          (p0[0] + p1[0]) / 2,
          (y0 + y1) / 2,
          (p0[1] + p1[1]) / 2,
        ),
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, -ang, Math.atan2(y1 - y0, L), "YXZ"),
        ),
        new THREE.Vector3(1, 1, 1),
      );
      b.geo("concrete", new THREE.BoxGeometry(L + 0.05, 0.5, 4.2), M, {});
      b.geo(
        "concrete",
        new THREE.BoxGeometry(L + 0.05, 1.0, 0.25).translate(0, 0.65, 2.0),
        M,
        {},
      );
      b.geo(
        "concrete",
        new THREE.BoxGeometry(L + 0.05, 1.0, 0.25).translate(0, 0.65, -2.0),
        M,
        {},
      );
      if (i % 5 === 0) {
        const px = cx + Math.cos(a0) * (R + 1.6),
          pz = cz + Math.sin(a0) * (R + 1.6);
        b.cyl("concrete", px, 0, pz, 0.35, 0.4, Math.max(0.5, y0 - 0.3), 8);
      }
    }
    S.col(X0, 0, Z0 + 3, RX, H + 1.3, Z1 - 3, { walkable: false });
    // bridge from the helix to the roof deck + a bus stuck on the ramp
    b.box("concrete", RX - 2.5, H - 0.5, cz - 2.1, RX + 0.2, H, cz + 2.1, {
      seg: false,
    });
    K.bus(b, cx + R + 0.3, H * 0.62, cz - 1.2, 0.35, {
      paint: "bus_green",
      stripe: "paint_cream",
      roll: 0.12,
    });
    // spikes, skulls, a hanging skeleton cage at the ramp's foot
    for (let k = 0; k < 7; k++)
      b.rod(
        "rust",
        [X0 + 1 + k * 1.2, 0, Z1 - 1.2],
        [X0 + 1.3 + k * 1.2, 2.4 + (k % 2) * 0.6, Z1 - 0.8],
        0.04,
        4,
      );

    // ---------------- raider front: scrap wall with a bus-door gate, spikes, fire ----------------
    const sw = (u0, u1, h) => {
      for (let u = u0; u < u1; u += 1.2) {
        const p = FE.pt(u + 0.6, 3.2 + (((u * 3) | 0) % 2) * 0.2);
        b.box(
          ((u * 5) | 0) % 3 === 0 ? "rust" : "scrap",
          p[0] - 0.15,
          0,
          p[1] - 0.62,
          p[0] + 0.15,
          h + (((u * 7) | 0) % 3) * 0.3,
          p[1] + 0.62,
          { ry: (((u * 1.7) % 1) - 0.5) * 0.2, seg: false },
        );
      }
      const a = FE.pt(u0, 3.2),
        c = FE.pt(u1, 3.2);
      S.col(
        Math.min(a[0], c[0]) - 0.2,
        0,
        Math.min(a[1], c[1]),
        Math.max(a[0], c[0]) + 0.2,
        h,
        Math.max(a[1], c[1]),
        { walkable: false },
      );
    };
    sw(uD - 11, uD - 2, 2.6);
    sw(uD + 2, uD + 11, 2.6);
    for (let k = 0; k < 8; k++) {
      const p = FE.pt(uD - 10 + k * 2.6 + (k > 3 ? 1.5 : 0), 3.6);
      b.rod(
        "rust",
        [p[0], 2.3, p[1]],
        [p[0] + 0.5, 3.4, p[1] + ((k % 2) - 0.5) * 0.4],
        0.035,
        4,
      );
      b.sphere("bone", p[0] + 0.5, 3.45, p[1] + ((k % 2) - 0.5) * 0.4, 0.12, {
        ws: 6,
        hs: 5,
        sy: 1.2,
      });
    }
    {
      const p = FE.pt(uD, 3.4);
      b.box("bus_paint", p[0] - 0.1, 0, p[1] - 1.8, p[0], 2.4, p[1] - 0.9, {
        seg: false,
        ry: 0.4,
      });
    }
    S.prop("barrel", X1 + 4.4, 0, DOOR_Z - 3.5, 0, { burning: true });
    S.prop("barrel", X1 + 4.4, 0, DOOR_Z + 3.6, 0, { burning: true });
    const warn = P.texMat(
      "pa_warn",
      P.signTex(
        "pa_warn",
        ["ALL ARRIVALS", "PAY THE TOLL", "ALL DEPARTURES", "ARE FINAL"],
        "raider",
        512,
        384,
        { fg: "#f0f0e0" },
      ),
      { transparent: true, rough: 1 },
    );
    {
      const p = FE.pt(uD - 6.5, 3.55);
      b.quad(warn, p[0], 1.6, p[1], 2.0, 1.5, { ry: FE.ry });
    }
    // wrecked buses at the kerb
    K.bus(b, X1 + 6.8, 0, DOOR_Z - 13, PI + 0.06, {
      paint: "bus_paint",
      flat: true,
    });
    K.bus(b, X1 + 7.2, 0, Z0 - 6.5, HP - 0.25, {
      paint: "bus_green",
      stripe: "paint_cream",
      flat: true,
    });
    S.col(X1 + 5.5, 0, DOOR_Z - 18.3, X1 + 8.1, 3.0, DOOR_Z - 7.7, {
      walkable: false,
    });
    // a rooftop billboard over the corner
    try {
      if (!G.isStub("mats") && G.mats.billboard) {
        const k = P.texMat("pa_bb", G.mats.billboard("fizzo_cola").map, {
          rough: 0.9,
        });
        b.quad(k, X1 - 8, H + 5.5, Z0 + 2.2, 12, 5, { ry: PI });
        b.box("rust", X1 - 14, H + 2.8, Z0 + 2.3, X1 - 2, H + 3.0, Z0 + 2.6, {
          seg: false,
        });
        for (let k2 = 0; k2 < 4; k2++)
          b.rod(
            "rust",
            [X1 - 13 + k2 * 3.4, H, Z0 + 2.45],
            [X1 - 13 + k2 * 3.4, H + 8, Z0 + 2.45],
            0.07,
            4,
          );
      }
    } catch (e) {
      /* optional */
    }
    K.waterTower(b, X1 - 6, H + 0.15, Z1 - 6, 1.8, 3.0, { legH: 2.2 });

    S.anchor("exterior_entrance", X1 + 2.2, 0, DOOR_Z, -HP);
    S.anchor("sniper", X1 - 3, H, Z0 + 3, -HP);
    S.build({ shadow: true, lod: 300 });
    return S;
  }

  // ===================================================================
  // INTERIOR (local; entrance on the east wall x=30)
  // Levels: concourse 0 · upper bus deck 6.5 · baggage room -4.5 · dispatcher office 6.5 (+ glass booth)
  // ===================================================================
  const Y_UP = 6.5,
    Y_LOW = -4.5;
  // lifted so the baggage level (local -4.5) sits at world y 0 (the engine's ground never goes below it)
  const LIFT = 4.5;

  function buildInterior() {
    const O = P.I("port_authority");
    const S = P.site("pa_int", {
      ox: O.x,
      oy: O.y + LIFT,
      oz: O.z,
      lit: true,
      ambient: 0x5e5c52,
      ambI: 0.44,
      interiorKey: "port_authority",
      grime: 0.65,
    });
    const b = S.b;
    const r = P.rng("pa_int");

    // ================= CONCOURSE (x -30..30, z -18..18, h 6.5) =================
    // floor with holes: baggage stair x 18.3..24, z -16.6..-14.4
    S.floor("terrazzo", -30, -18, 30, -16.6, 0, {});
    S.floor("terrazzo", -30, -14.4, 30, 18, 0, {});
    S.floor("terrazzo", -30, -16.6, 18.3, -14.4, 0, {});
    S.floor("terrazzo", 24, -16.6, 30, -14.4, 0, {});
    S.wallX("tile_cream", -18, -30.2, 30.2, 0, Y_UP, 0.4, []);
    S.wallX("tile_cream", 18, -30.2, 30.2, 0, Y_UP, 0.4, []);
    S.wallZ(
      "tile_cream",
      -30,
      -18,
      18,
      0,
      Y_UP,
      0.4,
      [
        [-3, -1.5, 0, 2.3],
        [1.5, 3, 0, 2.3],
      ],
      { frame: "stainless" },
    );
    S.wallZ("tile_cream", 30, -18, 18, 0, Y_UP, 0.4, [[-1.6, 1.6, 0, 3.0]], {
      frame: "stainless",
    });
    // upper deck slab = concourse ceiling, with holes for the escalators (x -8.2..0, z -8.6..-4.8) and the gate stair (x 12..20.2, z 14.9..17.2)
    const slab = (x0, z0, x1, z1) =>
      S.floor("concrete", x0, z0, x1, z1, Y_UP, { under: "plaster", t: 0.4 });
    slab(-40, -22, 30, -8.6);
    slab(-40, -8.6, -8.2, -4.8);
    slab(0, -8.6, 30, -4.8);
    slab(-40, -4.8, 30, 3.8);
    slab(-40, 3.8, 27.3, 12.1);
    slab(-40, 12.1, 30, 22);
    // tiled columns on an 8 m grid + fluorescent troughs
    for (let x = -24; x <= 24; x += 8)
      for (let z = -12; z <= 12; z += 8) {
        if (x === -8 && z === -4) continue;
        b.box(
          "tile_green",
          x - 0.45,
          0,
          z - 0.45,
          x + 0.45,
          Y_UP - 0.4,
          z + 0.45,
          { segLen: 2 },
        );
        b.box("stainless", x - 0.48, 0, z - 0.48, x + 0.48, 0.25, z + 0.48, {
          seg: false,
        });
        S.col(x - 0.45, 0, z - 0.45, x + 0.45, Y_UP, z + 0.45, {
          walkable: false,
        });
      }
    for (let z = -14; z <= 14; z += 4)
      for (let x = -26; x < 26; x += 6) {
        const lit = r() < 0.28;
        b.box(
          "iron",
          x,
          Y_UP - 0.55,
          z - 0.15,
          x + 3.6,
          Y_UP - 0.42,
          z + 0.15,
          { seg: false, noAO: true },
        );
        b.box(
          lit ? "lamp" : "glass_dark",
          x + 0.1,
          Y_UP - 0.58,
          z - 0.1,
          x + 3.5,
          Y_UP - 0.55,
          z + 0.1,
          { seg: false, noAO: true, noBake: true },
        );
        if (lit) {
          S.light(x + 1.8, Y_UP - 1.0, z, 0xe8f4ff, 8, 0.75);
          S.glow(x + 1.8, Y_UP - 0.7, z, 0xe8f4ff, 1.4, {
            flicker: r() < 0.4 ? 0.5 : 0,
          });
        }
      }
    // ticket counters of the bus lines along the north wall
    const lines = [
      ["SILVER ARROW LINES", "#1c3a6a", "#e8e4d8"],
      ["KEYSTONE COACH", "#6a1a14", "#f0d890"],
      ["ATLANTIC SHORE", "#1e5a4a", "#e8e4d8"],
      ["TRANS-AMERICAN", "#e8c040", "#1a1a1a"],
    ];
    for (let i = 0; i < 4; i++) {
      const x0 = -28 + i * 6,
        x1 = x0 + 5.4;
      b.box("formica", x0, 0, -16.2, x1, 1.05, -15.4);
      b.box("stainless", x0 - 0.05, 1.05, -16.25, x1 + 0.05, 1.12, -15.35, {
        seg: false,
      });
      S.col(x0, 0, -16.25, x1, 1.12, -15.35, { walkable: false });
      b.box("glass", x0 + 0.1, 1.12, -15.8, x1 - 0.1, 2.3, -15.76, {
        seg: false,
        noAO: true,
      });
      const L = lines[i],
        k = P.texMat(
          "pa_line" + i,
          P.signTex("pa_line" + i, [L[0]], "default", 512, 96, {
            bg: L[1],
            fg: L[2],
          }),
          { emissive: 0.25 },
        );
      b.quad(k, (x0 + x1) / 2, 3.0, -17.78, 5.0, 0.8, { ry: 0 });
      S.prop("cash_register", x0 + 1.2, 1.12, -15.9, PI, { parent: S.root });
    }
    // split-flap departures board
    const dep = P.texMat(
      "pa_depart",
      P.canvasTex("pt_pa_depart", 1024, 384, (ctx, w, h) => {
        const rr = P.rng("padep");
        ctx.fillStyle = "#101214";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#f0d060";
        ctx.font = "bold 36px " + P.FONTS.SANS;
        ctx.textAlign = "left";
        ctx.fillText("DEPARTURES", 24, 44);
        ctx.font = "bold 26px monospace";
        const rows = [
          ["8:05", "BOSTON", "201", "CANCELLED"],
          ["8:15", "PHILADELPHIA", "203", "CANCELLED"],
          ["8:30", "ATLANTIC CITY", "204", "CANCELLED"],
          ["8:40", "PITTSBURGH", "206", "BOARDING"],
          ["8:55", "ALBANY", "207", "CANCELLED"],
          ["9:10", "WASHINGTON D.C.", "208", "DELAYED 22 YRS"],
        ];
        rows.forEach((row, i) => {
          const y = 92 + i * 46;
          row.forEach((t, j) => {
            const x = [24, 140, 620, 720][j];
            for (let c = 0; c < t.length; c++) {
              ctx.fillStyle = "#262a2e";
              ctx.fillRect(x + c * 17 - 1, y - 24, 16, 32);
              ctx.fillStyle =
                rr() < 0.05
                  ? "#555"
                  : j === 3 && t !== "CANCELLED"
                    ? "#ff8a40"
                    : "#e8e4d0";
              ctx.fillText(t[c], x + c * 17, y);
            }
          });
        });
        P.blotches(ctx, w, h, rr, 20, 0.3);
      }),
      { emissive: 0.55 },
    );
    b.box("paint_black", -20.5, 3.6, -17.8, -3.5, 6.0, -17.55, { seg: false });
    b.quad(dep, -12, 4.8, -17.52, 16.6, 2.3, { ry: 0 });
    S.light(-12, 4.4, -16, 0xffe0a0, 6, 0.4);
    // benches (rows, back to back)
    for (const x of [-4, 4, 12])
      for (const z of [0, 6]) {
        for (const s of [-1, 1]) {
          b.box(
            "wood_oak",
            x - 2.8,
            0.42,
            z + s * 0.45 - 0.25,
            x + 2.8,
            0.5,
            z + s * 0.45 + 0.25,
            { seg: false },
          );
          b.box(
            "wood_oak",
            x - 2.8,
            0.5,
            z + s * 0.05 - 0.04,
            x + 2.8,
            1.15,
            z + s * 0.05 + 0.04,
            { seg: false },
          );
        }
        for (const dx of [-2.6, 0, 2.6])
          b.box(
            "iron",
            x + dx - 0.05,
            0,
            z - 0.6,
            x + dx + 0.05,
            1.15,
            z + 0.6,
            { seg: false },
          );
        S.col(x - 2.8, 0, z - 0.7, x + 2.8, 1.15, z + 0.7, { walkable: false });
      }
    // newsstand kiosk (x 10..14, z -12.5..-9.5)
    b.box("wood_dark", 10, 0, -12.5, 14, 1.1, -9.5);
    b.box("wood_dark", 10, 2.5, -12.6, 14, 2.8, -9.4, { seg: false });
    for (const [x, z] of [
      [10, -12.5],
      [14, -12.5],
      [10, -9.5],
      [14, -9.5],
    ])
      b.box("iron", x - 0.05, 1.1, z - 0.05, x + 0.05, 2.5, z + 0.05, {
        seg: false,
      });
    for (let k = 0; k < 14; k++)
      b.box(
        ["paper", "paint_red", "paint_blue", "paper"][k % 4],
        10.1 + (k % 7) * 0.55,
        1.1,
        -12.4 + Math.floor(k / 7) * 2.4,
        10.5 + (k % 7) * 0.55,
        1.13,
        -11.9 + Math.floor(k / 7) * 2.4,
        { ry: r() * 0.4, seg: false, noAO: true },
      );
    S.col(10, 0, -12.5, 14, 1.1, -9.5, { walkable: false });
    const news = P.texMat(
      "pa_news",
      P.signTex(
        "pa_news",
        ["THE FIRST JOURNAL · CIGARS · CANDY"],
        "default",
        512,
        64,
        { bg: "#e8d8a8", fg: "#6a1a14" },
      ),
    );
    b.quad(news, 12, 2.65, -9.38, 3.8, 0.3, { ry: 0 });
    S.pickup("pt_note_pa_newspaper", 1, 11.1, 1.14, -10.2);
    // lunch counter (south wall, x -6..8): stools, counter, pie case, menu board
    b.box("formica", -6, 0, 14.4, 8, 1.05, 15.2);
    b.box("stainless", -6.05, 1.05, 14.35, 8.05, 1.1, 15.25, { seg: false });
    S.col(-6, 0, 14.35, 8, 1.1, 15.25, { walkable: false });
    for (let x = -5.4; x < 7.8; x += 1.0) {
      b.cyl("chrome", x, 0, 13.7, 0.04, 0.1, 0.72, 6);
      b.cyl(r() < 0.3 ? "rust" : "seat_red", x, 0.72, 13.7, 0.2, 0.2, 0.1, 10);
    }
    b.box("stainless", -6, 0, 17.2, 8, 1.0, 17.8);
    b.box("stainless", -6, 1.0, 17.5, 8, 2.2, 17.8, { seg: false });
    for (let k = 0; k < 4; k++)
      b.box("glass", -4 + k * 3, 1.1, 14.6, -3 + k * 3, 1.5, 15.0, {
        seg: false,
        noAO: true,
      });
    const menu = P.texMat(
      "pa_menu",
      P.signTex(
        "pa_menu",
        [
          "TERMINAL LUNCH",
          "COFFEE 5¢ · PIE 15¢",
          "BLUE PLATE SPECIAL 45¢",
          "FRANKS · EGG CREAM · SODA",
        ],
        "default",
        512,
        256,
        { bg: "#1a1a1a", fg: "#f0e8d0" },
      ),
      { emissive: 0.2 },
    );
    b.quad(menu, 1, 3.4, 17.72, 4.4, 2.2, { ry: PI });
    S.container("Lunch Counter Fridge", 6.8, 0, 17.0, {
      loot: "fridge",
      kind: "fridge",
    });
    // coin lockers (south-west, x -29.6..-20, z 12..17.8): Locker 417 is marked
    for (let i = 0; i < 12; i++)
      for (let j = 0; j < 4; j++) {
        const x = -29.5 + i * 0.8,
          y = 0.1 + j * 0.62,
          is417 = i === 7 && j === 1;
        b.box(
          is417 ? "paint_red" : "metal",
          x,
          y,
          17.25,
          x + 0.78,
          y + 0.6,
          17.75,
          { seg: false, grime: 0.6 },
        );
        b.box("chrome", x + 0.62, y + 0.25, 17.2, x + 0.7, y + 0.35, 17.25, {
          seg: false,
          noAO: true,
        });
        if ((i * 5 + j * 3) % 7 === 0)
          b.box("iron", x, y, 17.0, x + 0.05, y + 0.6, 17.25, {
            ry: 0.9,
            seg: false,
          }); // sprung doors
      }
    S.col(-29.6, 0, 17.2, -19.9, 2.6, 17.8, { walkable: false });
    const lk = P.texMat(
      "pa_lockers",
      P.signTex(
        "pa_lockers",
        ["COIN LOCKERS", "25¢ · 24 HRS"],
        "default",
        512,
        96,
        { bg: "#2a3a4a", fg: "#e8e4d8" },
      ),
    );
    b.quad(lk, -24.7, 3.0, 17.18, 3.2, 0.6, { ry: PI });
    S.anchor("locker417", -23.5 + 0.39, 0.72, 16.9, PI);
    // restrooms (west wall doors) + mural
    const rest = P.texMat(
      "pa_rest",
      P.signTex("pa_rest", ["MEN          WOMEN"], "default", 512, 64, {
        bg: "#e8e4d8",
        fg: "#1a1a1a",
      }),
    );
    b.quad(rest, -29.78, 2.7, 0, 5.8, 0.4, { ry: HP });
    const mural = P.texMat(
      "pa_mural",
      P.canvasTex("pt_pa_mural", 1024, 384, (ctx, w, h) => {
        const rr = P.rng("pamural");
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#e8c888");
        g.addColorStop(1, "#c86a3a");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#6a3a2a";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.7);
        for (let x = 0; x <= w; x += 40) ctx.lineTo(x, h * (0.45 + rr() * 0.2));
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(0, h * 0.84, w, h * 0.06);
        ctx.fillStyle = "#d8d0c0";
        ctx.fillRect(w * 0.3, h * 0.66, 220, 70);
        ctx.fillStyle = "#1c3a6a";
        ctx.fillRect(w * 0.3, h * 0.74, 220, 10);
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(w * 0.3 + 40, h * 0.86, 16, 0, TAU);
        ctx.arc(w * 0.3 + 180, h * 0.86, 16, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#1c3a6a";
        ctx.font = "bold 56px " + P.FONTS.DECO;
        ctx.textAlign = "center";
        ctx.fillText("SEE AMERICA BY BUS", w / 2, 70);
        P.blotches(ctx, w, h, rr, 50, 0.35);
        P.speckle(ctx, w, h, rr, 2500, 0.3, 0.1);
      }),
      { rough: 0.95 },
    );
    b.quad(mural, -29.78, 4.4, -10, 10, 3.6, { ry: HP });
    // escalators (x -8.2..0, two flights side by side, climbing west to the deck); the south one is wrecked
    S.stairs("steel", 0, -7.6, "w", 1.6, 0, Y_UP, {
      run: 0.3,
      surface: "metal",
      nosing: "iron",
    });
    for (const z of [-8.5, -6.7, -4.9]) {
      b.rod("rubber", [0.8, 1.0, z], [-8.2, Y_UP + 1.0, z], 0.08, 6, {
        square: true,
        r2: 0.05,
      });
      b.rod("stainless", [0.8, 0.0, z], [-8.2, Y_UP, z], 0.05, 4, {
        square: true,
        r2: 0.5,
      });
    }
    for (const z of [-8.5, -6.7])
      S.colR(-3.7, z, 9.5, 0.12, 0, Y_UP + 1.1, 0, { walkable: false });
    // wrecked south escalator: collapsed treads and rubble at its foot
    for (let i = 0; i < 9; i++)
      b.box(
        "steel",
        -1.5 - i * 0.7,
        0.2 + i * 0.25,
        -6.5,
        -0.9 - i * 0.7,
        0.28 + i * 0.25,
        -5.1,
        { rx: (r() - 0.5) * 0.6, seg: false },
      );
    D.rubble(S, -3.5, 0, -5.8, 1.8, { n: 9, col: true, colH: 0.5 });
    S.col(-8.2, 0, -6.6, 0, Y_UP - 0.4, -4.9, { walkable: false });
    // gate stair (east wall, climbing north to the deck)
    S.stairs("concrete", 28.4, 12.1, "n", 2.2, 0, Y_UP, {
      rail: "stainless",
      railSides: [-1],
      nosing: "iron",
      solid: false,
      soffit: "concrete",
    });
    const gs = P.texMat(
      "pa_gatesign",
      P.signTex(
        "pa_gatesign",
        ["↑ GATES 201-206", "UPPER LEVEL BUS DEPARTURES"],
        "default",
        512,
        128,
        { bg: "#1c3a6a", fg: "#ffffff" },
      ),
      { emissive: 0.3 },
    );
    b.quad(gs, 29.75, 2.6, 13.4, 2.6, 0.65, { ry: -HP });
    // baggage stair (north-east, descending)
    S.stairs("concrete", 18.3, -15.5, "e", 2.0, Y_LOW, 0, {
      rail: "stainless",
      railSides: [1],
      solid: false,
      soffit: "concrete",
    });
    S.rail(
      "stainless",
      [
        [18.3, -16.6],
        [24, -16.6],
      ],
      0,
      1.0,
      {},
    );
    S.rail(
      "stainless",
      [
        [18.3, -14.4],
        [18.3, -16.6],
      ],
      0,
      1.0,
      {},
    );
    const bs = P.texMat(
      "pa_bagsign",
      P.signTex(
        "pa_bagsign",
        ["↓ BAGGAGE · LOST & FOUND"],
        "default",
        512,
        96,
        { bg: "#1c3a6a", fg: "#ffffff" },
      ),
      { emissive: 0.3 },
    );
    b.quad(bs, 21, 3.2, -17.78, 3.0, 0.55, { ry: 0 });

    // ---- the raiders' camp: scrap barricade at the doors, mattresses, fires, a cage, meat hooks ----
    for (const zz of [
      [-8, -2.2],
      [2.2, 8],
    ]) {
      for (let z = zz[0]; z < zz[1]; z += 1.1)
        b.box(
          ((z * 3) | 0) % 2 ? "scrap" : "rust",
          24.8,
          0,
          z,
          25.1,
          2.0 + (((z * 7) | 0) % 3) * 0.25,
          z + 1.15,
          { ry: 0.06, seg: false },
        );
      S.col(24.75, 0, zz[0], 25.15, 2.1, zz[1], { walkable: false });
    }
    for (let k = 0; k < 6; k++)
      b.rod(
        "rust",
        [24.9, 1.8, -7 + k * 2.8],
        [25.8, 2.6, -7 + k * 2.8],
        0.03,
        4,
      );
    const graf = P.texMat(
      "pa_graf3",
      P.signTex(
        "pa_graf3",
        ["WELCOME", "TO THE", "TERMINAL"],
        "raider",
        512,
        384,
        { fg: "#d82a1e" },
      ),
      { transparent: true, rough: 1 },
    );
    b.quad(graf, 29.75, 3.6, -8, 3.0, 2.2, { ry: -HP });
    const camp = [
      [-18, -2],
      [-14, 3],
      [-20, 5],
      [-16, -6],
    ];
    for (const [x, z] of camp) {
      b.box("mattress", x - 0.9, 0, z - 0.5, x + 0.9, 0.2, z + 0.5, {
        ry: r() * 3,
        seg: false,
        grime: 0.8,
      });
    }
    S.prop("barrel", -16.5, 0, 1.0, 0, { burning: true, parent: S.root });
    S.light(-16.5, 1.4, 1.0, 0xff8a40, 8, 1.1);
    S.prop("barrel", 22.5, 0, 9, 0, { burning: true, parent: S.root });
    S.light(22.5, 1.4, 9, 0xff8a40, 7, 1.0);
    // cage with a skeleton
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU;
      b.rod(
        "rust",
        [-22 + Math.cos(a) * 1.1, 0, 10 + Math.sin(a) * 1.1],
        [-22 + Math.cos(a) * 1.1, 2.3, 10 + Math.sin(a) * 1.1],
        0.025,
        4,
      );
    }
    b.torus("rust", -22, 2.3, 10, 1.1, 0.04, TAU, { rx: HP, ts: 16, rs: 4 });
    b.torus("rust", -22, 0.1, 10, 1.1, 0.04, TAU, { rx: HP, ts: 16, rs: 4 });
    S.col(-23.1, 0, 8.9, -20.9, 2.3, 11.1, { walkable: false });
    S.prop("skeleton", -22, 0, 10, 0.4, { pose: "curled", parent: S.root });
    for (let k = 0; k < 4; k++) {
      b.rod(
        "iron",
        [-12 + k * 0.8, Y_UP - 0.4, 9],
        [-12 + k * 0.8, 3.4, 9],
        0.01,
        3,
      );
      b.torus("rust", -12 + k * 0.8, 3.3, 9, 0.12, 0.015, PI * 1.5, {
        ts: 8,
        rs: 3,
      });
    }
    S.container("Raider Stash", -19.2, 0, -7.2, {
      loot: "raider_stash",
      kind: "footlocker",
      owner: "raiders",
    });
    S.container("Ammo Crate", 23.5, 0, -6.5, {
      loot: "ammo_box",
      kind: "ammo_box",
      owner: "raiders",
    });
    D.papers(b, 0, 0, 2, 6, 30);
    D.rubble(S, -26, 0, -12, 1.4, { n: 6 });
    S.pickup("pt_note_pa_claimcheck", 1, -21.6, 0.02, 9.6);
    S.anchor("spawn1", -15, 0, 0, HP);
    S.anchor("spawn2", 21.5, 0, -2, -HP);
    S.anchor("entrance", 28.6, 0, 0, HP);

    // ================= UPPER BUS DECK (x -40..30, z -22..22, y 6.5, h 5.2) =================
    const YU = Y_UP,
      HU = 5.2;
    S.ceil("concrete_dark", -40, -22, 30, 22, YU + HU);
    S.wallX("concrete", -22, -40.2, 30.2, YU, YU + HU, 0.4, []);
    S.wallX("concrete", 22, -40.2, 30.2, YU, YU + HU, 0.4, []);
    S.wallZ("concrete", 30, -22, 22, YU, YU + HU, 0.4, []);
    S.wallZ("concrete", -40, -22, 22, YU, YU + HU, 0.4, [[-6, 6, 0, 4.6]]); // ramp portal (choked)
    // deck columns (concrete, 10 m grid) + ceiling beams
    for (let x = -34; x <= 26; x += 10)
      for (const z of [-11, 0, 11]) {
        if (Math.abs(x + 4) < 1 && z === -11) continue;
        b.box("concrete", x - 0.5, YU, z - 0.5, x + 0.5, YU + HU, z + 0.5, {
          segLen: 3,
        });
        b.box(
          "hazard",
          x - 0.53,
          YU + 0.05,
          z - 0.53,
          x + 0.53,
          YU + 0.95,
          z + 0.53,
          { seg: false, noAO: true, grime: 0.3 },
        );
        S.col(x - 0.5, YU, z - 0.5, x + 0.5, YU + HU, z + 0.5, {
          walkable: false,
        });
      }
    for (let x = -34; x <= 26; x += 10)
      b.box(
        "concrete_dark",
        x - 0.3,
        YU + HU - 0.7,
        -22,
        x + 0.3,
        YU + HU,
        22,
        { seg: false },
      );
    // lane markings + oil stains
    for (let x = -38; x < 28; x += 3)
      b.box("paint_cream", x, YU + 0.005, -0.12, x + 1.5, YU + 0.012, 0.12, {
        seg: false,
        noAO: true,
      });
    // loading islands along the south wall (gates 201-206) with buses nosed in between the deck columns
    for (let i = 0; i < 6; i++) {
      const bx = -29 + i * 10;
      b.box("concrete", bx + 1.6, YU, 15.6, bx + 3.6, YU + 0.3, 21.8, {});
      b.box("concrete", bx - 3.2, YU, 20.3, bx + 3.6, YU + 0.3, 21.8, {});
      b.box(
        "cryo_orange",
        bx + 1.58,
        YU + 0.02,
        15.58,
        bx + 1.66,
        YU + 0.31,
        21.8,
        { seg: false, noAO: true },
      );
      S.col(bx + 1.6, YU, 15.6, bx + 3.6, YU + 0.3, 21.8, {
        surface: "concrete",
      });
      S.col(bx - 3.2, YU, 20.3, bx + 3.6, YU + 0.3, 21.8, {
        surface: "concrete",
      });
      b.box("stainless", bx + 2.5, YU + 0.3, 16.0, bx + 2.6, YU + 2.8, 16.1, {
        seg: false,
      });
      const gn = P.texMat(
        "pa_gate" + i,
        P.signTex(
          "pa_gate" + i,
          [
            "GATE " + (201 + i),
            [
              "BOSTON",
              "PHILADELPHIA",
              "ATLANTIC CITY",
              "ALBANY",
              "PITTSBURGH",
              "THE COMMONWEALTH",
            ][i],
          ],
          "default",
          256,
          128,
          { bg: "#1c3a6a", fg: "#ffffff" },
        ),
        { emissive: 0.3 },
      );
      b.quad(gn, bx, YU + 3.4, 21.76, 1.6, 0.8, { ry: PI });
      b.box(
        i % 2 ? "glass_broken" : "glass_dark",
        bx - 1.5,
        YU + 0.3,
        21.74,
        bx + 1.5,
        YU + 2.9,
        21.78,
        { seg: false },
      );
      if (i !== 2 && i !== 5) {
        K.bus(b, bx, YU, 13.2, 0.08 * (i % 2 ? 1 : -1), {
          paint: i % 3 === 0 ? "bus_green" : "bus_paint",
          stripe: i % 2 ? "paint_red" : "paint_blue",
          flat: i % 2 === 0,
        });
        S.colR(bx, 13.2, 2.6, 10.6, YU, YU + 3.0, 0.08 * (i % 2 ? 1 : -1), {
          walkable: false,
        });
      }
    }
    // the ramp portal to the Lincoln Tunnel approach: choked with a jack-knifed bus and rubble
    K.bus(b, -35, YU, -1.5, HP + 0.5, {
      paint: "bus_green",
      stripe: "paint_cream",
      flat: true,
      roll: 0.05,
    });
    S.colR(-35, -1.5, 2.7, 10.7, YU, YU + 3.2, -(HP + 0.5), {
      walkable: false,
    });
    D.rubble(S, -38, YU, 4, 2.5, {
      n: 12,
      slab: true,
      rebar: true,
      col: true,
      colH: 1.2,
    });
    D.rubble(S, -38, YU, -5, 2.2, { n: 10, rebar: true, col: true, colH: 1.0 });
    const tun = P.texMat(
      "pa_tunnel",
      P.signTex(
        "pa_tunnel",
        ["LINCOLN TUNNEL ← ", "NEW JERSEY"],
        "default",
        512,
        128,
        { bg: "#1e5a2a", fg: "#ffffff" },
      ),
      { rough: 0.8 },
    );
    b.quad(tun, -39.75, YU + 4.3, 0, 3.4, 0.85, { ry: HP });
    // deck lighting: caged sodium lamps (some lit), a raider fire in a drum, strung lights around the boss's office
    for (let x = -34; x <= 26; x += 10)
      for (const z of [-5.5, 5.5]) {
        const lit = ((x + z * 3) | 0) % 3 !== 0;
        b.box(
          "iron",
          x - 0.3,
          YU + HU - 0.3,
          z - 0.3,
          x + 0.3,
          YU + HU - 0.05,
          z + 0.3,
          { seg: false },
        );
        b.sphere(lit ? "lamp_dim" : "glass_dark", x, YU + HU - 0.4, z, 0.18, {
          ws: 6,
          hs: 4,
          noAO: true,
          noBake: true,
        });
        if (lit) {
          S.light(x, YU + HU - 0.8, z, 0xffc070, 12, 1.15);
          S.glow(x, YU + HU - 0.45, z, 0xffc070, 1.6);
        }
      }
    S.prop("barrel", -12, YU, 3, 0, { burning: true, parent: S.root });
    S.light(-12, YU + 1.4, 3, 0xff8a40, 8, 1.0);
    for (const [x, z] of [
      [-14, 5],
      [-10, 5.4],
      [-11, 1],
    ])
      b.box("mattress", x - 0.9, YU, z - 0.5, x + 0.9, YU + 0.2, z + 0.5, {
        ry: r() * 3,
        seg: false,
        grime: 0.8,
      });
    // escalator landing rail + gate stair landing rail
    S.rail(
      "stainless",
      [
        [-8.2, -8.6],
        [0, -8.6],
      ],
      YU,
      1.0,
      {},
    );
    S.rail(
      "stainless",
      [
        [0, -8.6],
        [0, -4.8],
      ],
      YU,
      1.0,
      {},
    );
    S.rail(
      "stainless",
      [
        [-8.2, -4.8],
        [0, -4.8],
      ],
      YU,
      1.0,
      {},
    );
    S.rail(
      "stainless",
      [
        [27.3, 3.8 + 0.6],
        [27.3, 12.1],
      ],
      YU,
      1.0,
      {},
    );
    S.rail(
      "stainless",
      [
        [27.3, 12.1],
        [29.8, 12.1],
      ],
      YU,
      1.0,
      {},
    );
    S.anchor("spawn3", -18, YU, 0, -HP);
    S.anchor("spawn4", -28, YU, 8, -HP);
    S.anchor("deck", -4, YU, 0, HP);

    // ---- the dispatcher's office (glass booth, north-east of the deck): the Raider Boss ----
    const bx0 = 18,
      bx1 = 29.6,
      bz0 = -21.6,
      bz1 = -13;
    b.box("concrete", bx0, YU, bz0, bx1, YU + 0.6, bz1, { seg: false });
    S.col(bx0, YU, bz0, bx1, YU + 0.6, bz1, { surface: "concrete" });
    S.stairs("concrete", 21, -12.1, "n", 2.0, YU, YU + 0.6, { run: 0.35 });
    const YO = YU + 0.6;
    for (const [x0, z0, x1, z1] of [
      [bx0, bz1 - 0.1, 20, bz1],
      [22, bz1 - 0.1, bx1, bz1],
      [bx0, bz0, bx0 + 0.1, bz1],
    ]) {
      b.box("stainless", x0, YO, z0, x1, YO + 1.0, z1, { seg: false });
      b.box("glass", x0, YO + 1.0, z0, x1, YO + 3.0, z1, {
        seg: false,
        noAO: true,
      });
      b.box("stainless", x0, YO + 3.0, z0, x1, YO + 3.2, z1, { seg: false });
      S.col(x0, YO, z0, x1, YO + 3.2, z1, { walkable: false });
    }
    b.box("stainless", bx0, YO + 3.2, bz0, bx1, YO + 3.35, bz1, { seg: false });
    const disp = P.texMat(
      "pa_disp",
      P.signTex("pa_disp", ["DISPATCHER"], "default", 512, 96, {
        bg: "#1c3a6a",
        fg: "#ffffff",
      }),
      { emissive: 0.2 },
    );
    b.quad(disp, 24.6, YO + 3.6, bz1 + 0.02, 3.2, 0.55, { ry: 0 });
    const boss = P.texMat(
      "pa_boss",
      P.signTex("pa_boss", ["THE BOSS", "KNOCK FIRST"], "raider", 512, 256, {
        fg: "#e8d84a",
      }),
      { transparent: true, rough: 1 },
    );
    b.quad(boss, 25.5, YO + 2.0, bz1 + 0.07, 2.2, 1.1, { ry: 0 });
    // inside: dispatch console, schedule board, the boss's "throne" (bus seats), loot, a map of routes
    b.box("paint_cream", 26, YO, bz0 + 0.3, 29.4, YO + 1.0, bz0 + 1.4);
    b.box(
      "formica",
      25.95,
      YO + 1.0,
      bz0 + 0.25,
      29.45,
      YO + 1.06,
      bz0 + 1.45,
      { seg: false },
    );
    S.col(26, YO, bz0 + 0.3, 29.4, YO + 1.06, bz0 + 1.4, { walkable: false });
    for (let k = 0; k < 6; k++)
      b.box(
        k % 2 ? "lamp_green" : "lamp_red",
        26.3 + k * 0.5,
        YO + 1.06,
        bz0 + 0.6,
        26.4 + k * 0.5,
        YO + 1.1,
        bz0 + 0.7,
        { seg: false, noAO: true },
      );
    S.prop("terminal", 27.8, YO + 1.06, bz0 + 0.9, PI, {
      terminalId: "pt_pa_dispatch",
      mount: "bare",
      parent: S.root,
    });
    const routes = P.texMat(
      "pa_routes",
      P.canvasTex("pt_pa_routes", 512, 384, (ctx, w, h) => {
        const rr = P.rng("parts");
        ctx.fillStyle = "#e8e0c8";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#1c3a6a";
        ctx.lineWidth = 4;
        for (let k = 0; k < 7; k++) {
          ctx.beginPath();
          ctx.moveTo(w * 0.6, h * 0.45);
          ctx.lineTo(rr() * w, rr() * h);
          ctx.stroke();
        }
        ctx.fillStyle = "#6a1a14";
        ctx.font = "bold 28px " + P.FONTS.SANS;
        ctx.fillText("ROUTE MAP", 20, 36);
        ctx.fillStyle = "#c42a1e";
        ctx.font = "bold 40px Impact, sans-serif";
        ctx.fillText("MINE", w * 0.55, h * 0.5);
        P.blotches(ctx, w, h, rr, 30, 0.35);
      }),
      { rough: 0.9 },
    );
    b.quad(routes, bx1 - 0.08, YO + 1.9, -17.5, 2.6, 2.0, { ry: -HP });
    for (let k = 0; k < 3; k++) {
      b.box(
        "seat_red",
        19.2 + k * 0.62,
        YO,
        -20.9,
        19.75 + k * 0.62,
        YO + 0.45,
        -20.3,
        { seg: false },
      );
      b.box(
        "seat_red",
        19.2 + k * 0.62,
        YO + 0.45,
        -21.2,
        19.75 + k * 0.62,
        YO + 1.2,
        -21.0,
        { seg: false },
      );
    }
    b.box("bone", 19.4, YO + 1.25, -21.15, 20.9, YO + 1.35, -21.05, {
      seg: false,
    });
    for (let k = 0; k < 3; k++)
      b.sphere("bone", 19.5 + k * 0.6, YO + 1.45, -21.1, 0.12, {
        ws: 6,
        hs: 5,
        sy: 1.15,
      });
    S.container("Boss's Footlocker", 22.2, YO, -21.0, {
      loot: "raider_boss",
      kind: "footlocker",
      owner: "raiders",
      items: [
        ["pt_prompt_book", 1],
        ["scrip", 85],
      ],
    });
    S.anchor("prompt_book", 22.2, YO, -21.0, 0);
    S.container("Dispatcher's Safe", 29.1, YO, -14.2, {
      loot: "safe",
      kind: "safe",
      locked: 0,
      lock: P.LOCKS.pa_safe,
      owner: "raiders",
    });
    for (let k = 0; k < 10; k++) {
      const x = 18.5 + k * 1.1;
      b.sphere(
        ["bulb", "neon_red", "neon_green", "glass_dark"][k % 4],
        x,
        YO + 3.5 - Math.sin((k / 9) * PI) * 0.3,
        bz1 + 0.15,
        0.07,
        { ws: 5, hs: 4, noAO: true, noBake: true },
      );
    }
    S.light(24, YO + 2.6, -17, 0xffd8a0, 8, 0.8);
    S.glow(24, YO + 3.4, bz1 + 0.2, 0xffe0b0, 2.0);
    S.anchor("boss", 23.5, YO, -18.5, PI);
    S.anchor("spawn6", 16, YU, -10, PI);

    // ================= BAGGAGE ROOM (x 12..30, z -18..-4, y -4.5) =================
    const YL = Y_LOW,
      HL = 3.6;
    S.room({
      x0: 12,
      z0: -18,
      x1: 30,
      z1: -4,
      y: YL,
      h: HL,
      wall: "tile_cream",
      floor: "concrete_dark",
      ceil: false,
    });
    for (const [x0, z0, x1, z1] of [
      [12, -18, 30, -16.6],
      [12, -14.4, 30, -4],
      [12, -16.6, 18.3, -14.4],
      [24, -16.6, 30, -14.4],
    ])
      S.ceil("concrete_dark", x0, z0, x1, z1, YL + HL);
    // (the stair shaft x 18.3..24, z -16.6..-14.4 comes down inside the room; the room's ceiling below the concourse floor is fine)
    // baggage carousel (oval steel belt)
    b.box("stainless", 16, YL, -10.5, 26, YL + 0.5, -8.5);
    for (let k = 0; k < 2; k++)
      b.cyl("stainless", 16 + k * 10, YL, -9.5, 1.0, 1.0, 0.5, 14);
    b.box("rubber", 15.5, YL + 0.5, -11, 26.5, YL + 0.56, -8, { seg: false });
    S.col(15, YL, -11, 27, YL + 0.56, -8, { walkable: false });
    const bagR = P.rng("pabags");
    for (let k = 0; k < 14; k++) {
      const x = 15.6 + bagR() * 10.6,
        z = bagR() < 0.5 ? -10.7 : -8.3;
      b.box(
        ["leather", "fabric", "paint_blue", "hide_tan"][k % 4],
        x - 0.35,
        YL + 0.56,
        z - 0.22,
        x + 0.35,
        YL + 0.56 + 0.3 + bagR() * 0.2,
        z + 0.22,
        { ry: bagR() * 0.6, seg: false },
      );
    }
    // Lost & Found cage (x 12..17, z -18..-13.5)
    for (let x = 12.2; x < 17; x += 0.25)
      b.rod("iron", [x, YL, -13.6], [x, YL + 2.8, -13.6], 0.012, 3, {
        noAO: true,
      });
    for (let z = -17.8; z < -13.6; z += 0.25)
      b.rod("iron", [17, YL, z], [17, YL + 2.8, z], 0.012, 3, { noAO: true });
    S.col(12, YL, -13.7, 17.05, YL + 2.8, -13.5, { walkable: false });
    S.col(16.95, YL, -18, 17.05, YL + 2.8, -15.4, { walkable: false });
    b.box("iron", 16.96, YL, -15.4, 17.04, YL + 2.2, -13.7, {
      ry: -0.9,
      seg: false,
    }); // gate ajar
    for (let k = 0; k < 6; k++)
      b.box(
        "wood",
        12.2,
        YL + 0.3 + k * 0.45,
        -17.9,
        16.8,
        YL + 0.33 + k * 0.45,
        -17.2,
        { seg: false },
      );
    for (let k = 0; k < 20; k++)
      b.box(
        ["leather", "fabric", "paint_red", "hide_tan", "paper"][k % 5],
        12.4 + (k % 8) * 0.55,
        YL + 0.33 + Math.floor(k / 8) * 0.45,
        -17.8,
        12.8 + (k % 8) * 0.55,
        YL + 0.6 + Math.floor(k / 8) * 0.45,
        -17.35,
        { seg: false },
      );
    const lf = P.texMat(
      "pa_lostfound",
      P.signTex(
        "pa_lostfound",
        ["LOST & FOUND", "Unclaimed items held 30 days"],
        "default",
        512,
        128,
        { bg: "#e8e4d8", fg: "#1c3a6a" },
      ),
    );
    b.quad(lf, 14.5, YL + 3.0, -13.52, 2.6, 0.65, { ry: 0 });
    b.box("wood_dark", 13, YL, -15.8, 15.2, YL + 0.85, -15);
    S.col(13, YL, -15.8, 15.2, YL + 0.85, -15, { walkable: false });
    S.pickup("pt_key_locker417", 1, 14.4, YL + 0.87, -15.4);
    S.anchor("lost_found", 14.4, YL, -15.4, 0);
    S.container("Unclaimed Luggage", 13.2, YL, -17, {
      loot: "luggage",
      kind: "luggage",
    });
    S.container("Unclaimed Suitcase", 28.6, YL, -5.5, {
      loot: "luggage",
      kind: "luggage",
    });
    // flooded corner (irradiated seepage)
    b.box("water_toxic", 23, YL + 0.03, -7.2, 29.8, YL + 0.08, -4.2, {
      seg: false,
      noAO: true,
    });
    S.light(26, YL + 0.8, -5.7, 0x6aff5a, 6, 0.6);
    S.glow(26, YL + 0.3, -5.7, 0x6aff5a, 2.2);
    S.anchor("radpool", 26, YL, -5.7, 0);
    for (const x of [15, 22, 28]) {
      b.box(
        "iron",
        x - 0.3,
        YL + HL - 0.12,
        -12.1,
        x + 0.3,
        YL + HL - 0.02,
        -11.9,
        { seg: false },
      );
      b.box(
        x === 22 ? "glass_dark" : "lamp_dim",
        x - 0.28,
        YL + HL - 0.15,
        -12.08,
        x + 0.28,
        YL + HL - 0.12,
        -11.92,
        { seg: false, noAO: true },
      );
      if (x !== 22) S.light(x, YL + HL - 0.6, -12, 0xe8f0d8, 7, 0.7);
    }
    S.prop("skeleton", 19.5, YL, -6, 2.2, { pose: "lying", parent: S.root });
    S.pickup("pt_reel_pa_porter", 1, 19.1, YL + 0.02, -5.5);
    S.anchor("spawn5", 21, YL, -12.5, 0);
    S.anchor("baggage", 21, YL, -12.5, 0);
    S.anchor("loot1", 22.2, YO, -21.0, 0);
    S.anchor("loot2", 13.2, YL, -17, 0);
    return S;
  }

  P.addBuilder(
    "port_authority",
    () => {
      const E = buildExterior();
      const I = buildInterior();
      I.build({ interior: true, lod: 60 });
      P.addInterior("port_authority", I.root);
      const O = P.I("port_authority");
      E.door(
        X1 + 0.8,
        1.5,
        DOOR_Z,
        "Port Authority Bus Terminal",
        { x: O.x + 28.4, y: O.y + LIFT + 0.05, z: O.z, yaw: HP },
        { id: "pt_pa_in" },
      );
      I.door(
        29.6,
        1.5,
        0,
        "Eighth Avenue",
        { x: X1 + 2.4, y: 0.1, z: DOOR_Z, yaw: -HP },
        { verb: "Exit", id: "pt_pa_out" },
      );
      P.register("port_authority", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "port_authority",
        anchors: Object.assign({}, E.anchors, I.anchors),
        name: "Port Authority Bus Terminal",
      });
      // irradiated seepage in the baggage room
      try {
        const O2 = O;
        G.world.addRadSource({
          x: O2.x + 26,
          y: O2.y + LIFT - 4.5,
          z: O2.z - 5.7,
          radius: 4,
          strength: 3,
        });
      } catch (e) {
        /* optional */
      }
    },
    30,
  );
})();
