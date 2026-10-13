// play-inline-284 03 — box
// Lines 45-481 of readable/play-inline-284.pretty.js (statement-aligned).
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
