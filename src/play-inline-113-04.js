// play-inline-113 04 — math
// Lines 418-577 of readable/play-inline-113.pretty.js (statement-aligned).
  K.defineInterior("grand_central:paints", function () {
    K.paint("gc_tracks", 512, 96, (x, W2, H2) =>
      K.signText(x, W2, H2, "TRACKS 23 — 42", {
        bg: "#1a1a1a",
        fg: "#d8d0b0",
        size: 48,
        border: "#8a7a50",
      }),
    );
    K.paint("gc_mayor", 512, 96, (x, W2, H2) =>
      K.signText(x, W2, H2, "STATIONMASTER", {
        bg: "#2a2016",
        fg: "#e8c870",
        size: 44,
        font: "Georgia, serif",
        border: "#b8903a",
      }),
    );
    K.paint("gc_clinic", 256, 256, (x, W2, H2) => {
      x.fillStyle = "#e8e4d8";
      x.fillRect(0, 0, W2, H2);
      x.fillStyle = "#c01e1e";
      x.fillRect(W2 * 0.38, H2 * 0.12, W2 * 0.24, H2 * 0.56);
      x.fillRect(W2 * 0.14, H2 * 0.3, W2 * 0.72, H2 * 0.2);
      x.fillStyle = "#1a1a1a";
      x.font = 'bold 40px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.fillText("CLINIC", W2 / 2, H2 * 0.9);
      K.stains(x, W2, H2, 5, 55, 0.3);
    });
    for (const [k, t, bg] of [
      ["gc_s_guns", "GUNS & AMMO", "#3a2a1a"],
      ["gc_s_aid", "PILLS · AID", "#1a3a2a"],
      ["gc_s_scrap", "SCRAP & TRADE", "#3a3a3a"],
      ["gc_s_eats", "EATS", "#5a1a14"],
      ["gc_s_water", "CLEAN WATER", "#1a3a5a"],
      ["gc_s_junk", "ODDS & ENDS", "#4a3a1a"],
    ])
      K.paint(k, 512, 128, (x, W2, H2) =>
        K.signText(x, W2, H2, t, {
          bg,
          fg: "#f0e0b0",
          size: 64,
          border: "#c8a860",
        }),
      );
    K.paint("gc_clockface", 256, 256, (x, W2, H2) =>
      K.clockFace(x, W2, H2, { face: "#f2ead0", rim: "#c8a040", seed: 7 }),
    );
  });

  K.defineInterior("grand_central:neon", function () {
    K.neon("gc_whistle", "THE WHISTLE STOP", 0xff6a3a, {
      font: "italic bold 64px Georgia, serif",
      h: 110,
    });
    K.neon("gc_open", "OPEN", 0xff3a5a, { h: 100, border: true });
  });

  K.defineInterior("grand_central:waiting_room", function (ctx) {
    const { b, d, glows, P, FZ, X0, X1, IX0, IX1, WR, BAYS } = ctx;
    // ================= WAITING ROOM (inside façade block) =================
    b.boxMM("marble", X0, -0.2, WR.z0 - 1.5, X1, 0.04, FZ, {
      faces: "t",
      tint: 0xd8b8a0,
    });
    // back wall with 3 arched doorways into the concourse
    b.wall(
      "limestone",
      X0,
      WR.z0 - 0.75,
      X1,
      WR.z0 - 0.75,
      0,
      24,
      1.5,
      BAYS.map((c) => ({ at: c - X0, w: 5.6, h: 9, arch: true })),
      {},
    );
    // ceiling + coffers + chandeliers
    b.boxMM("plaster", IX0, 12, WR.z0, IX1, 12.5, FZ - 1.6, {
      faces: "b",
      tint: 0xcfc2a0,
    });
    for (let x = IX0 + 2; x < IX1; x += 4.4)
      d.boxMM("gold", x - 0.12, 11.6, WR.z0, x + 0.12, 12, FZ - 1.6, {
        faces: "nsewb",
        grime: 0.4,
      });
    for (const cx of [222, 231, 240, 249, 258]) {
      d.beam(
        "brass",
        cx,
        12,
        (WR.z0 + FZ) / 2 - 0.8,
        cx,
        9.4,
        (WR.z0 + FZ) / 2 - 0.8,
        0.05,
      );
      d.geo("brass", K.T.torus, {
        x: cx,
        y: 9.2,
        z: (WR.z0 + FZ) / 2 - 0.8,
        rx: Math.PI / 2,
        s: 1.2,
      });
      d.geo("brass", K.T.torus, {
        x: cx,
        y: 8.7,
        z: (WR.z0 + FZ) / 2 - 0.8,
        rx: Math.PI / 2,
        s: 0.8,
      });
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        if ((k + cx) % 5 === 0) continue;
        glows.add(
          cx + Math.cos(a) * 1.2,
          9.25,
          (WR.z0 + FZ) / 2 - 0.8 + Math.sin(a) * 1.2,
          0xffd090,
          "s",
        );
        d.geo("lit_warm", K.T.sphereLo, {
          x: cx + Math.cos(a) * 1.2,
          y: 9.3,
          z: (WR.z0 + FZ) / 2 - 0.8 + Math.sin(a) * 1.2,
          s: 0.12,
        });
      }
    }
    // waiting-room benches turned into bunks
    for (let i = 0; i < 6; i++) {
      const bx = 218 + i * 8.6,
        bz = -199.5;
      if (
        Math.abs(bx - 226) < 3 ||
        Math.abs(bx - 240) < 3 ||
        Math.abs(bx - 254) < 3
      )
        continue;
      d.box("wood_dark", bx, 0, bz, 5, 0.45, 1.2, { grime: 0.5 });
      d.box("wood_dark", bx, 0.45, bz - 0.5, 5, 0.9, 0.12, { grime: 0.5 });
      K.colBox(bx - 2.5, 0, bz - 0.6, bx + 2.5, 0.9, bz + 0.6, {
        surface: "wood",
        tag: "cover",
      });
      P.mattress(d, bx - 1, 0.46, bz + 0.1, Math.PI / 2);
    }
    // walls inside waiting room (marble wainscot)
    for (const z of [WR.z0 + 0.02, FZ - 1.62])
      d.boxMM("marble", IX0, 0, z - 0.02, IX1, 2.4, z + 0.02, {
        faces: z > WR.z0 + 1 ? "n" : "s",
        tint: 0xc8a888,
      });
    // guard posts at the inner doors
    P.sandbags(d, 244, -195.5, 246.5, -195.5, 3, { seed: 21 });
  });

