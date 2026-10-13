// play-inline-86 02 — roomd
// Lines 315-554 of readable/play-inline-86.pretty.js (statement-aligned).
  M.buildShellInterior = function (S) {
    const {
      r,
      cx,
      cz,
      gf,
      hw,
      dep,
      roomW,
      roomD,
      rl,
      rr,
      T,
      doorL,
      doorR,
      piersL,
      toW,
      colL,
      flip,
    } = S;
    // inner faces of the front piers
    for (const [a, b] of piersL) {
      if (b - a < 0.05) continue;
      const ib = M.buf("plaster_stained", cx, cz);
      M.wall(
        ib,
        b,
        T,
        a,
        T,
        0,
        gf,
        0,
        (b - a) / 3,
        0,
        gf / 3,
        [0.55, 0.52, 0.47],
        [0.78, 0.74, 0.66],
      );
    }
    // interior shell
    const ib = M.buf("plaster_stained", cx, cz);
    const ic0 = [0.55, 0.52, 0.47],
      ic1 = [0.8, 0.76, 0.68];
    M.wall(ib, rl, T, rl, roomD, 0, gf, 0, roomD / 3, 0, gf / 3, ic0, ic1); // left wall faces +x
    M.wall(ib, rr, roomD, rr, T, 0, gf, 0, roomD / 3, 0, gf / 3, ic0, ic1); // right wall faces -x
    M.wall(ib, rl, roomD, rr, roomD, 0, gf, 0, roomW / 3, 0, gf / 3, ic0, ic1); // back wall faces -z
    // side strips between room and outer walls (front inner face beyond the room)
    const flb = M.buf(r() < 0.5 ? "wood_planks" : "tile_cryo", cx, cz);
    M.quad(
      flb,
      [rl, SY + 0.03, T],
      [rr, SY + 0.03, T],
      [rr, SY + 0.03, roomD],
      [rl, SY + 0.03, roomD],
      [0, 1, 0],
      [0, 0, roomW / 2, 0, roomW / 2, roomD / 2, 0, roomD / 2],
      [0.7, 0.66, 0.6],
    );
    M.quad(
      M.buf("plaster_stained", cx, cz),
      [rl, gf - 0.2, T],
      [rr, gf - 0.2, T],
      [rr, gf - 0.2, roomD],
      [rl, gf - 0.2, roomD],
      [0, -1, 0],
      [0, 0, 3, 0, 3, 3, 0, 3],
      [0.5, 0.48, 0.44],
    );
    colL(rl - T, T, rl, roomD, 0, gf);
    colL(rr, T, rr + T, roomD, 0, gf);
    colL(rl, roomD, rr, roomD + T, 0, gf);
    if (rl - T > -hw + 0.1) colL(-hw, T, rl - T, dep, 0, gf);
    if (rr + T < hw - 0.1) colL(rr + T, T, hw, dep, 0, gf);
    if (roomD + T < dep - 0.1) colL(rl - T, roomD + T, rr + T, dep, 0, gf);
    // counter, shelves, junk (only when the props module won't dress the shop itself), fallen ceiling panels, dirt
    const wb = M.buf("wood_planks", cx, cz, "detail");
    const cz0 = roomD * 0.5;
    const selfDress = G.isStub("props");
    if (selfDress) {
      M.box(
        wb,
        rl + 1,
        0,
        cz0 - 0.35,
        rl + 1 + roomW * 0.45,
        1.05,
        cz0 + 0.35,
        { s: 1.5, c: [0.55, 0.45, 0.35] },
      );
      M.box(
        wb,
        rl + 0.95,
        1.05,
        cz0 - 0.4,
        rl + 1.05 + roomW * 0.45,
        1.1,
        cz0 + 0.4,
        { s: 1.5, c: [0.4, 0.34, 0.28] },
      );
      colL(
        rl + 1,
        cz0 - 0.35,
        rl + 1 + roomW * 0.45,
        cz0 + 0.35,
        0,
        1.1,
        "furniture",
      );
      // cash register
      M.box(
        M.buf("metal_panel", cx, cz, "detail"),
        rl + 1.4,
        1.1,
        cz0 - 0.2,
        rl + 1.9,
        1.4,
        cz0 + 0.2,
        { s: 1, c: [0.5, 0.45, 0.3] },
      );
      for (const sx of [rl + 0.05, rr - 0.45]) {
        M.box(wb, sx, 0, T + 1, sx + 0.4, 2.2, roomD - 1.2, {
          s: 1.5,
          c: [0.5, 0.42, 0.34],
        });
        for (let y = 0.5; y < 2.2; y += 0.55)
          M.box(wb, sx - 0.02, y, T + 1, sx + 0.42, y + 0.04, roomD - 1.2, {
            s: 1,
            c: [0.6, 0.5, 0.4],
          });
        colL(sx, T + 1, sx + 0.4, roomD - 1.2, 0, 2.2, "furniture");
        const jb = M.buf("metal_panel", cx, cz, "fine");
        for (let k = 0; k < 10; k++) {
          const y = 0.54 + 0.55 * r.int(0, 2),
            z = T + 1.2 + r() * (roomD - 2.8);
          M.cyl(jb, sx + 0.2, y, z, 0.05, 0.05, 0.13, 6, {
            c: r.pick([
              [0.8, 0.3, 0.25],
              [0.7, 0.7, 0.5],
              [0.4, 0.5, 0.7],
            ]),
            capTop: true,
          });
        }
      }
    }
    const db = M.buf("my/markings", cx, cz, "fine");
    for (let k = 0; k < 5; k++)
      M.decal(
        db,
        rl + 1 + r() * (roomW - 2),
        SY + 0.05,
        T + 1 + r() * (roomD - 2),
        r.range(1.5, 3),
        r.range(1.5, 3),
        r() * 6,
        r.pick([M.MARK.LITTER, M.MARK.DIRT, M.MARK.STAIN, M.MARK.BLOOD]),
      );
    const pb = M.buf("plaster_stained", cx, cz, "detail");
    for (let k = 0; k < 3; k++)
      M.obox(
        pb,
        rl + 1.5 + r() * (roomW - 3),
        0.3,
        T + 1.5 + r() * (roomD - 3),
        1.2,
        0.05,
        0.6,
        r() * 3,
        { pitch: r.range(-0.4, 0.4), s: 1, c: [0.7, 0.68, 0.62] },
      );
    // hanging light fixture (dead)
    M.pipe(
      M.buf("metal_panel", cx, cz, "detail"),
      0,
      gf - 0.2,
      roomD * 0.5,
      0,
      gf - 1.0,
      roomD * 0.5,
      0.02,
      4,
      { c: [0.2, 0.2, 0.2] },
    );
    M.cyl(
      M.buf("glass_dirty", cx, cz, "detail"),
      0,
      gf - 1.3,
      roomD * 0.5,
      0.25,
      0.1,
      0.3,
      8,
      { c: [0.6, 0.6, 0.5] },
    );
    const L2W = (lx, lz) => {
      const w = toW(lx, lz);
      return { x: w[0], z: w[1] };
    };
    const yawOut = flip ? Math.PI : 0; // yaw facing into the room from the door (local +z)
    const toYaw = (lyaw) => lyaw + (flip ? Math.PI : 0);
    const loot = [
      Object.assign(L2W(rr - 0.9, roomD - 0.7), {
        type: r() < 0.5 ? "file_cabinet" : "safe",
        yaw: toYaw(Math.PI),
      }),
      Object.assign(L2W(rl + 1 + roomW * 0.25, cz0 + 0.9), {
        type: r.pick([
          "crate",
          "footlocker",
          "first_aid",
          "toolbox",
          "ammo_box",
        ]),
        yaw: toYaw(0),
      }),
    ];
    if (r() < 0.45)
      loot.push(
        Object.assign(L2W(rl + 1 + roomW * 0.6, roomD - 0.6), {
          type: "fizzo_machine",
          yaw: toYaw(Math.PI),
        }),
      );
    const c = L2W(0, roomD / 2),
      dpt = L2W((doorL + doorR) / 2, -1.2);
    M.shells.push({
      id: "shop_" + M.shells.length,
      x: c.x,
      z: c.z,
      yaw: yawOut,
      floorY: SY + 0.03,
      y: SY + 0.03,
      w: roomW,
      d: roomD - T,
      door: dpt,
      loot,
      dressed: selfDress,
    });
  };
