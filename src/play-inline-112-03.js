// play-inline-112 03 — boxmm
// Lines 179-728 of readable/play-inline-112.pretty.js (statement-aligned).
  function build(rec) {
    const b = K.builder("gc_shell", { grime: 0.45 });
    const d = K.builder("gc_detail", { grime: 0.5 }); // interior dressing (LOD)
    const s = K.builder("gc_fx", { grime: 0 }); // shafts (never cast shadows)
    const glows = K.glowSet("gc");
    const P = K.parts;

    b.burn(252, 31, -219, 10, 0.8)
      .burn(214, 2, -188, 5, 0.5)
      .burn(268, 12, -240, 8, 0.4);

    // shell dimensions + builders shared with the interior hooks (20_grand_central_interior.js)
    const ctx = {
      rec,
      b,
      d,
      s,
      glows,
      P,
      shaft,
      FZ,
      X0,
      X1,
      IX0,
      IX1,
      WR,
      CZ0,
      CZ1,
      CZC,
      SPRING,
      CROWN,
      BAL_Y,
      BAYS,
      HOLE,
    };

    // ================= FAÇADE (south, z = -192) =================
    // front wall with three giant arched openings (door + window)
    const ops = BAYS.map((c) => ({ at: c - X0, w: 9.4, h: 22, arch: true }));
    b.wall("limestone", X0, FZ - 0.8, X1, FZ - 0.8, 0, 26, 1.6, ops, {
      collide: false,
    });
    // colliders: piers + lower side panels, leaving 4.5 m doors
    let prev = X0;
    for (const c of BAYS) {
      K.colBox(prev, 0, FZ - 1.6, c - 4.7, 26, FZ);
      K.colBox(c - 4.7, 0, FZ - 1.6, c - 2.25, 26, FZ);
      K.colBox(c + 2.25, 0, FZ - 1.6, c + 4.7, 26, FZ);
      K.colBox(c - 2.25, 5.5, FZ - 1.6, c + 2.25, 26, FZ);
      prev = c + 4.7;
    }
    K.colBox(prev, 0, FZ - 1.6, X1, 26, FZ);
    for (const c of BAYS) {
      // transom band + bronze side panels + door frame
      b.boxMM("limestone", c - 4.75, 5.5, FZ - 1.4, c + 4.75, 6.6, FZ - 0.2, {
        grime: 0.5,
      });
      d.boxMM("bronze", c - 4.7, 0, FZ - 1.0, c - 2.25, 5.5, FZ - 0.8, {
        grime: 0.5,
      });
      d.boxMM("bronze", c + 2.25, 0, FZ - 1.0, c + 4.7, 5.5, FZ - 0.8, {
        grime: 0.5,
      });
      d.boxMM("bronze", c - 2.4, 0, FZ - 1.1, c - 2.2, 5.5, FZ - 0.5, {});
      d.boxMM("bronze", c + 2.2, 0, FZ - 1.1, c + 2.4, 5.5, FZ - 0.5, {});
      // glazing (arched)
      const sh = new THREE.Shape();
      sh.moveTo(-4.7, 0);
      sh.lineTo(4.7, 0);
      sh.lineTo(4.7, 15.5 - 4.7);
      sh.absarc(0, 15.5 - 4.7, 4.7, 0, Math.PI, false);
      sh.lineTo(-4.7, 0);
      b.extrude("gc_glass", sh, 0.06, { x: c, y: 6.6, z: FZ - 1.0 });
      // mullion frame
      for (let k = -2; k <= 2; k++)
        d.beam(
          "black_metal",
          c + k * 1.9,
          6.6,
          FZ - 1.0,
          c + k * 1.9,
          k === 0
            ? 22
            : 6.6 + 10.8 + Math.sqrt(Math.max(0, 22 - k * k * 3.6)) * 0.9,
          FZ - 1.0,
          0.14,
        );
      for (let y = 9.6; y < 17.5; y += 3)
        d.beam("black_metal", c - 4.7, y, FZ - 1.0, c + 4.7, y, FZ - 1.0, 0.12);
    }
    // plinth + paired engaged columns
    for (const seg of [
      [X0, BAYS[0] - 2.4],
      [BAYS[0] + 2.4, BAYS[1] - 2.4],
      [BAYS[1] + 2.4, BAYS[2] - 2.4],
      [BAYS[2] + 2.4, X1],
    ]) {
      b.boxMM("granite", seg[0], 0, FZ - 0.2, seg[1], 3.2, FZ + 0.95, {
        faces: "nsewt",
        grime: 0.7,
      });
      K.colBox(seg[0], 0, FZ - 0.2, seg[1], 3.2, FZ + 0.95);
    }
    const colXs = [217.6, 220.2, 231.8, 234.2, 245.8, 248.2, 259.8, 262.4];
    for (const cx of colXs) {
      b.cyl("limestone", cx, 3.2, FZ + 0.1, 0.62, 0.55, 18.6, 12, {
        top: false,
        grime: 0.4,
      });
      b.boxMM("limestone", cx - 0.9, 3.2, FZ - 0.6, cx + 0.9, 3.8, FZ + 0.9, {
        grime: 0.5,
      });
      b.boxMM(
        "limestone",
        cx - 0.95,
        21.8,
        FZ - 0.6,
        cx + 0.95,
        23,
        FZ + 0.95,
        { grime: 0.5 },
      );
      // volutes
      for (const sx of [-0.7, 0.7])
        b.geo("limestone", K.T.cyl8, {
          x: cx + sx,
          y: 22.3,
          z: FZ + 0.9,
          rx: Math.PI / 2,
          sx: 0.28,
          sy: 0.3,
          sz: 0.28,
        });
    }
    // side sections (lower wings)
    for (const sx of [X0, X1])
      b.boxMM(
        "limestone",
        sx === X0 ? X0 : X1 - 0.01,
        0,
        FZ - 1.6,
        sx === X0 ? X0 + 0.01 : X1,
        26,
        FZ,
        { faces: "ew" },
      );
    // entablature, frieze, cornice
    b.boxMM("limestone", X0 - 0.3, 23, FZ - 0.9, X1 + 0.3, 25.8, FZ + 1.1, {
      faces: "nsewtb",
      grime: 0.55,
    });
    b.boxMM(
      "limestone_dark",
      X0 - 0.5,
      25.8,
      FZ - 1.0,
      X1 + 0.5,
      26.5,
      FZ + 1.6,
      { faces: "nsewtb", grime: 0.6 },
    );
    // attic + clock + statuary
    b.boxMM("limestone", 219, 26.5, FZ - 1.6, 261, 31, FZ, { grime: 0.5 });
    b.boxMM("limestone_dark", 218.6, 31, FZ - 1.9, 261.4, 31.6, FZ + 0.3, {
      faces: "nsewtb",
    });
    for (let x = 221; x < 260; x += 5.2)
      b.boxMM("limestone", x - 0.7, 26.5, FZ - 0.1, x + 0.7, 31, FZ + 0.25, {});
    const clockR = K.paint("gc_tiffany", 256, 256);
    b.geo("brass", K.T.cyl12, {
      x: 240,
      y: 28.6,
      z: FZ + 0.2,
      rx: Math.PI / 2,
      sx: 2.5,
      sy: 0.4,
      sz: 2.5,
      grime: 0.3,
    });
    b.panel("atlas_paint_glow", 240, 28.6, FZ + 0.43, 4.4, 4.4, 0, {
      rect: clockR,
    });
    K.parts.figure(b, "limestone_dark", 240, 31.6, FZ - 0.8, 0, 3.3, "raised", {
      wingedHat: true,
      robe: false,
      grime: 0.6,
    });
    K.parts.figure(
      b,
      "limestone_dark",
      231.5,
      31.6,
      FZ - 0.4,
      0.25,
      2.9,
      "reclined",
      { grime: 0.6 },
    );
    K.parts.figure(
      b,
      "limestone_dark",
      248.5,
      31.6,
      FZ - 0.4,
      -0.25,
      2.9,
      "reclined",
      { robe: true, grime: 0.6 },
    );
    K.parts.eagle(b, "limestone_dark", 220, 31.6, FZ - 0.6, 0, 1.5, {
      wingsUp: true,
    });
    K.parts.eagle(b, "limestone_dark", 260, 31.6, FZ - 0.6, 0, 1.5, {
      wingsUp: true,
    });
    // banners & signs on the façade
    b.panel("atlas_paint", 240, 24.4, FZ + 1.15, 22, 2.3, 0, {
      rect: K.paint("gc_banner", 1024, 160),
    });
    d.panel("atlas_neon", 240, 6.05, FZ + 0.15, 8.4, 1.1, 0, {
      rect: K.atlases.neon.slots.gc_neon.rect,
    });
    d.panel("atlas_paint", 226, 6.05, FZ + 0.12, 4.2, 1.2, 0, {
      rect: K.paint("gc_welcome", 512, 160),
    });

    // ================= WAITING ROOM (inside façade block) — roof slab over it; the room is interior =================
    b.boxMM("limestone", X0, 12, WR.z0, X1, 26.5, FZ - 1.6, { faces: "t" });
    K.colBox(X0, 12, WR.z0 - 1.5, X1, 26.5, FZ);
    K.interior("grand_central:waiting_room", ctx);

    // ================= CONCOURSE =================
    // outer long walls (west/east) with arched windows, continuous from façade to north wall
    const winOps = [-236, -226, -216].map((zc) => ({
      z: zc,
      w: 7.6,
      h: 17,
      y: 9,
      arch: true,
    }));
    b.wall(
      "limestone",
      X0 + 0.75,
      -246,
      X0 + 0.75,
      -206,
      0,
      31,
      1.5,
      winOps.map((o) => ({
        at: o.z + 246,
        w: o.w,
        h: o.h,
        y: o.y,
        arch: true,
      })),
      {},
    );
    b.wall(
      "limestone",
      X1 - 0.75,
      -206,
      X1 - 0.75,
      -246,
      0,
      31,
      1.5,
      winOps.map((o) => ({
        at: -206 - o.z,
        w: o.w,
        h: o.h,
        y: o.y,
        arch: true,
      })),
      {},
    );
    b.wall(
      "limestone",
      X0 + 0.75,
      -206,
      X0 + 0.75,
      -193.6,
      0,
      26.5,
      1.5,
      [],
      {},
    );
    b.wall(
      "limestone",
      X1 - 0.75,
      -193.6,
      X1 - 0.75,
      -206,
      0,
      26.5,
      1.5,
      [],
      {},
    );
    // window mullions (see-through grid)
    for (const wx of [X0 + 0.75, X1 - 0.75])
      for (const o of winOps) {
        for (let k = -1; k <= 1; k++)
          d.beam(
            "black_metal",
            wx,
            9,
            o.z + k * 1.9,
            wx,
            9 + 17 - (Math.abs(k) ? 0.6 : 0),
            o.z + k * 1.9,
            0.12,
          );
        for (let y = 11.5; y < 22; y += 2.6)
          d.beam("black_metal", wx, y, o.z - 3.8, wx, y, o.z + 3.8, 0.1);
        d.beam("black_metal", wx, 22.2, o.z - 3.8, wx, 22.2, o.z + 3.8, 0.35);
      }
    // north wall with track gates
    const gates = [222, 231, 240, 249, 258];
    // + the sealed lower-level stair west of Track 23 (main story, mq09: an iron grate; see the interior file)
    b.wall(
      "limestone",
      X1,
      -245.25,
      X0,
      -245.25,
      0,
      31,
      1.5,
      gates
        .map((g) => ({ at: X1 - g, w: 4.2, h: 7, arch: true }))
        .concat([{ at: X1 - 218.55, w: 1.8, h: 3.3, arch: true }]),
      { collide: false },
    );
    K.colBox(X0, 0, -246, X1, 31, -244.5);
    // (track gates' grilles + platform tunnels: interior)
    // zodiac barrel-vaulted ceiling: exterior copper roof skin here; the painted inner skin is interior (ctx.vy)
    const nX = 14,
      nZ = 24,
      span = (CZ1 - CZ0) / 2,
      rise = CROWN - SPRING;
    const vy = (z) =>
      SPRING + rise * Math.sqrt(Math.max(0, 1 - Math.pow((z - CZC) / span, 2)));
    const roofY = (z) => vy(z) + 0.6;
    ctx.vy = vy;
    for (let i = 0; i < nX; i++)
      for (let j = 0; j < nZ; j++) {
        const xa = IX0 + ((IX1 - IX0) * i) / nX,
          xb = IX0 + ((IX1 - IX0) * (i + 1)) / nX;
        const za = CZ0 + ((CZ1 - CZ0) * j) / nZ,
          zb = CZ0 + ((CZ1 - CZ0) * (j + 1)) / nZ;
        const cx = (xa + xb) / 2,
          cz = (za + zb) / 2;
        const inHole =
          cx > HOLE.x0 && cx < HOLE.x1 && cz > HOLE.z0 && cz < HOLE.z1;
        if (inHole) continue;
        // exterior roof skin (copper)
        b.quad(
          "verdigris",
          [xa, roofY(zb), zb],
          [xb, roofY(zb), zb],
          [xb, roofY(za), za],
          [xa, roofY(za), za],
          {
            rect: [
              cx / 3,
              za / 3,
              cx / 3 + (xb - xa) / 3,
              za / 3 + (zb - za) / 3,
            ],
            grime: 0.4,
          },
        );
      }
    // roof eaves (flat parapet ring) & lunette fill on end walls handled by walls to y=31
    b.boxMM("limestone_dark", X0 - 0.4, 31, -246.4, X1 + 0.4, 31.8, -244, {
      faces: "nsewt",
    });
    b.boxMM("limestone_dark", X0 - 0.4, 31, -208.5, X1 + 0.4, 31.8, -206, {
      faces: "nsewt",
    });
    b.boxMM("limestone", X0, 24, -207.5, X1, 31.8, -206, { faces: "nst" });
    b.boxMM("limestone", X0, 24, -244.5, X1, 31, -244.4, { faces: "s" });
    K.colBox(X0, 31, -246, X1, 32, -206);
    // hole: jagged girders + light shaft + rubble
    for (let k = 0; k < 6; k++) {
      const hx = HOLE.x0 + (HOLE.x1 - HOLE.x0) * (k / 5);
      d.beam(
        "rust",
        hx,
        vy(HOLE.z0),
        HOLE.z0 - 0.4,
        hx + (k % 2 ? 1.2 : -0.6),
        vy(HOLE.z0) - 3 - k * 0.4,
        HOLE.z0 + 2.5,
        0.25,
      );
      d.beam(
        "rust",
        hx,
        vy(HOLE.z1),
        HOLE.z1 + 0.4,
        hx - 0.5,
        vy(HOLE.z1) - 2.2,
        HOLE.z1 - 2,
        0.2,
      );
    }
    ctx.winOps = winOps;
    K.interior("grand_central:concourse", ctx);

    // ================= NORTH BLOCK (office building over the tracks) =================
    b.boxMM("fac_esb_low", X0, 0, -268, X1, 18, -246, { faces: "newt" });
    K.colBox(X0, 0, -268, X1, 18, -246);
    b.boxMM("limestone_dark", X0 - 0.3, 18, -268.3, X1 + 0.3, 18.8, -246, {
      faces: "nsewt",
    });

    // rooftop water tower on the north block (the market's water supply)
    K.parts.waterTower(d, 230, 18.8, -257, 3.2);
    d.cable("rust", 230, 22, -254, 236, 18.8, -247, 0.5, 0.08, 6);
    rec.anchor("water_tower", 230, 18.8, -252.5, 0);
    rec.anchor("roof_tank", 230, 18.8, -252.5, 0);
    K.colBox(212, 18.8, -268, 268, 19, -246, { surface: "concrete" });

    // ================= FORTIFIED FORECOURT (south, on the sidewalk) =================
    P.sandbags(d, 212.5, FZ + 3.2, 221.5, FZ + 3.2, 4, { seed: 41 });
    P.sandbags(d, 230.8, FZ + 3.2, 235.2, FZ + 3.2, 4, { seed: 42 });
    P.sandbags(d, 244.8, FZ + 3.2, 249.2, FZ + 3.2, 4, { seed: 43 });
    P.sandbags(d, 258.5, FZ + 3.2, 267.5, FZ + 3.2, 4, { seed: 44 });
    P.jersey(d, 226, FZ + 5.5, 0);
    P.jersey(d, 254, FZ + 5.5, 0);
    // watchtower (west corner) with searchlight + platform
    const tx = 214.5,
      tz = FZ + 5.5,
      th = 5;
    for (const o of [
      [-1.3, -1.3],
      [1.3, -1.3],
      [1.3, 1.3],
      [-1.3, 1.3],
    ])
      d.beam(
        "wood",
        tx + o[0],
        0,
        tz + o[1],
        tx + o[0] * 0.8,
        th,
        tz + o[1] * 0.8,
        0.2,
      );
    d.box("wood", tx, th, tz, 3.2, 0.2, 3.2, { grime: 0.5 });
    P.sandbags(d, tx - 1.5, tz - 1.5, tx + 1.5, tz - 1.5, 2, {
      y: th + 0.2,
      collide: false,
    });
    P.sandbags(d, tx - 1.5, tz + 1.5, tx + 1.5, tz + 1.5, 2, {
      y: th + 0.2,
      collide: false,
    });
    P.searchlight(d, glows, tx + 0.6, th + 0.2, tz + 0.6, 0.3, 0.2);
    d.geo("corrugated", K.T.box, {
      x: tx,
      y: th + 2.6,
      z: tz,
      rx: 0.1,
      sx: 3.6,
      sy: 0.06,
      sz: 3.6,
    });
    for (const o of [
      [-1.4, -1.4],
      [1.4, -1.4],
      [1.4, 1.4],
      [-1.4, 1.4],
    ])
      d.beam(
        "wood",
        tx + o[0],
        th,
        tz + o[1],
        tx + o[0],
        th + 2.5,
        tz + o[1],
        0.1,
      );
    K.colBox(tx - 1.6, 0, tz - 1.6, tx + 1.6, th + 0.2, tz + 1.6, {
      surface: "wood",
    });
    P.signBoard(
      d,
      "atlas_paint",
      K.paint("gc_welcome", 512, 160),
      240,
      2.6,
      FZ + 6.5,
      4.2,
      1.3,
      0,
      {},
    );
    d.beam("wood", 238, 0, FZ + 6.5, 238, 2, FZ + 6.5, 0.12);
    d.beam("wood", 242, 0, FZ + 6.5, 242, 2, FZ + 6.5, 0.12);
    P.turret(d, 262, 0, FZ + 5.5, 0.2, {});
    // notice board (bounties, lost & found)
    d.beam("wood", 231.3, 0, FZ + 6.5, 231.3, 2.6, FZ + 6.5, 0.12);
    d.beam("wood", 233.7, 0, FZ + 6.5, 233.7, 2.6, FZ + 6.5, 0.12);
    d.box("wood_dark", 232.5, 1.2, FZ + 6.5, 2.6, 1.3, 0.1, { grime: 0.5 });
    for (let k = 0; k < 7; k++)
      d.panel(
        "paint_white",
        231.6 + (k % 4) * 0.55,
        1.45 + Math.floor(k / 4) * 0.55,
        FZ + 6.44,
        0.36,
        0.44,
        Math.PI,
        { tint: [0xe8e0c8, 0xd8c8a0, 0xf0e8d8][k % 3], grime: 0.4 },
      );
    K.colBox(231.2, 0, FZ + 6.4, 233.8, 2.6, FZ + 6.6);
    P.barrel(d, 229, 0, FZ + 4.5, "fire", { glows, collide: true });

    // ================= ANCHORS =================
    rec.anchor("entrance", 240, 0, FZ + 8, 0);
    rec.anchor("door_west", 226, 0, FZ + 2.5, 0);
    rec.anchor("door_center", 240, 0, FZ + 2.5, 0);
    rec.anchor("door_east", 254, 0, FZ + 2.5, 0);
    rec.anchor("guard1", 236.2, 0, FZ + 4.4, 0);
    rec.anchor("guard2", 243.8, 0, FZ + 4.4, 0);
    rec.anchor("guard5", tx, th + 0.2, tz, 0);
    rec.anchor("notice_board", 232.5, 0, FZ + 7.4, Math.PI);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 260 });
    s.finish(rec.root, { cast: false, receive: false });
    glows.finish(rec.root, { dayOpacity: 0.55, nightOpacity: 1 });

    // shafts fade at night / with overcast
    const sm = K.mat("shaft");
    K.animate((dt, t, night) => {
      sm.color
        .setRGB(0.32, 0.29, 0.22)
        .multiplyScalar(
          Math.max(0.05, 1 - night) * (0.85 + 0.15 * Math.sin(t * 0.3)),
        );
    });
  }

