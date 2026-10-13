// play-inline-579 02 — spots
// Lines 328-1380 of readable/play-inline-579.pretty.js (statement-aligned).
  QX.hook("world", function () {
    O = ORIGIN();
    const k = K();
    const root = new THREE.Group();
    root.position.set(O.x, 0, O.z);
    root.name = "qx_cryo_c4";
    G.scene.add(root);
    V.root = root;
    root.visible = false; // shown only while the player is inside (see 'always' hook)
    const b = k.builder();
    const M = {
      // frost-white glazed tile walls, grey terrazzo floor, Long Winter orange band
      wall: k.tint("qx_c4_tile", 0xc5cccf, {
        roughness: 0.45,
        metalness: 0.05,
      }),
      floor: k.tint("qx_c4_floor", 0x6f777a, { roughness: 0.7 }),
      ceil: k.mat("metal_panel", 0x3c4246),
      trimO: k.tint("qx_c4_orange", 0xd8641e, { roughness: 0.6 }),
      trimW: k.tint("qx_c4_white", 0xe8eef0, { roughness: 0.5 }),
      skirt: k.mat("rust", 0x5a3a22),
      rust: k.mat("rust", 0x5a3a22),
      metal: k.mat("metal_painted", 0x55606a),
      conc: k.mat("concrete_dark", 0x4a4844),
      pipe: k.tint("qx_c4_pipe", 0x4f5a52, { roughness: 0.55, metalness: 0.6 }),
      dark: k.tint("qx_c4_dark", 0x14171a, { roughness: 0.9 }),
      lamp: k.tint("qx_c4_lamp", 0xe8f0e0, {
        emissive: 0xcfe0c8,
        emissiveIntensity: 1.2,
        roughness: 0.4,
      }),
      red: k.tint("qx_c4_red", 0x801810, {
        emissive: 0xff2a10,
        emissiveIntensity: 1.4,
      }),
      crt: k.tint("qx_c4_crt", 0x3a2408, {
        emissive: 0xffa020,
        emissiveIntensity: 0.9,
      }), // amber indicator glass
      glass: k.tint("qx_c4_podglass", 0xd8e6ea, {
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
      frost: k.tint("qx_c4_frost", 0xf2f6f8, {
        roughness: 0.95,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
      shell: k.tint("qx_c4_podshell", 0xd4d8d6, {
        roughness: 0.5,
        metalness: 0.35,
      }),
      slime: k.tint("qx_c4_slime", 0x2e3a22, { roughness: 1 }),
      wood: k.mat("wood_planks", 0x6a4a2a),
      fabric: k.mat("fabric", 0x6a6a5a),
      sand: k.tint("qx_c4_sand", 0x8a7a58, { roughness: 1 }),
    };

    // --- shells ---
    room(b, M, R.shaft, { s: [[-1.7, 1.7, 2.8]] });
    room(
      b,
      M,
      R.tunnel,
      { n: [[-1.7, 1.7, 3.2]], s: [[-1.7, 1.7, 3.2]] },
      { noTrim: false },
    );
    room(b, M, R.atrium, {
      n: [[-1.7, 1.7, 3.2]],
      w: [[31, 35, 2.8]],
      e: [[30.8, 33.2, 2.6]],
      s: [[-1.3, 1.3, 2.6]],
    });
    room(b, M, R.quarters, { e: [[31, 35, 2.8]] });
    room(b, M, R.office, { w: [[30.8, 33.2, 2.6]] });
    room(b, M, R.pumps, { n: [[-1.3, 1.3, 2.6]] });

    // --- pressure-door frames round every doorway (jambs + lintel, orange/black hazard-striped
    //     inner faces, rivet strip) so each opening reads as a door at a glance ---
    const hzY = k.tint("qx_c4_hazard", 0xd8641e, { roughness: 0.7 }),
      hzK = k.tint("qx_c4_hazard_d", 0x1c1c1a, { roughness: 0.8 });
    /** axis 'z': opening in a wall at z=c spanning x a0..a1; axis 'x': wall at x=c spanning z a0..a1. */
    const frame = (axis, c, a0, a1, top) => {
      const J = 0.32,
        D = 0.62; // jamb width, depth through the wall
      const put = (w, h, d, u, y, v, m) =>
        axis === "z"
          ? k.box(b, m, w, h, d, u, y, c + v)
          : k.box(b, m, d, h, w, c + v, y, u);
      for (const [u, sgn] of [
        [a0 - J / 2, 1],
        [a1 + J / 2, -1],
      ]) {
        put(J, top + J, D, u, (top + J) / 2, 0, M.metal);
        for (let y = 0.15; y < top; y += 0.5)
          put(
            0.02,
            0.24,
            D + 0.02,
            u + sgn * (J / 2 + 0.005),
            y + 0.12,
            0,
            Math.round(y * 2) % 2 ? hzY : hzK,
          );
      }
      put(a1 - a0 + J * 2, J, D, (a0 + a1) / 2, top + J / 2, 0, M.metal);
      put(a1 - a0, 0.04, D + 0.02, (a0 + a1) / 2, top - 0.02, 0, hzY);
      for (const v of [-D / 2 - 0.01, D / 2 + 0.01])
        put(
          a1 - a0 + J * 2 - 0.1,
          0.06,
          0.03,
          (a0 + a1) / 2,
          top + J * 0.55,
          v,
          M.rust,
        );
    };
    frame("z", 3, -1.7, 1.7, 2.8); // shaft → tunnel
    frame("z", 21, -1.7, 1.7, 3.2); // tunnel → pod hall
    frame("x", -12, 31, 35, 2.8); // pod hall → crew quarters
    frame("x", 12, 30.8, 33.2, 2.6); // pod hall → Director's office
    frame("z", 45, -1.3, 1.3, 2.6); // pod hall → pump room
    // structural ribs up the pod-hall walls (riveted-panel rhythm)
    for (let x = -10; x <= 10; x += 4) {
      if (Math.abs(x) < 3 || (x > -10.5 && x < -2.5)) {
        /* tunnel mouth / pressure door */
      } else tbox(b, M.metal, 0.34, 8, 0.16, x, 4, 21.08, 2);
      if (Math.abs(x) > 2.2) tbox(b, M.metal, 0.34, 8, 0.16, x, 4, 44.92, 2);
    }
    for (let z = 23; z <= 43; z += 4) {
      if (z < 30 || z > 36) {
        tbox(b, M.metal, 0.16, 8, 0.34, -11.92, 4, z, 2);
        tbox(b, M.metal, 0.16, 8, 0.34, 11.92, 4, z, 2);
      }
    }
    // --- shaft: ladder, hatch disc at the top, the roll's tin, puddles ---
    for (let i = 0; i < 2; i++)
      tbox(b, M.rust, 0.08, 7.2, 0.08, -0.35 + i * 0.7, 3.6, -2.8, 1);
    for (let y = 0.35; y < 7.2; y += 0.35)
      tbox(b, M.rust, 0.7, 0.05, 0.05, 0, y, -2.8, 1);
    k.cyl(b, M.metal, 0.9, 0.2, 0, 7.4, -2.2, 16);
    k.box(b, M.metal, 0.28, 0.2, 0.18, SPOTS.roll[0], 0.1, SPOTS.roll[1]); // tin box
    k.box(b, M.trimO, 0.29, 0.03, 0.19, SPOTS.roll[0], 0.2, SPOTS.roll[1]);
    // --- tunnel: pipes both sides, bulkhead ribs, drips ---
    for (const s of [-1, 1]) {
      k.cyl(b, M.pipe, 0.16, 18, s * 1.4, 2.4, 12, 8, Math.PI / 2);
      k.cyl(b, M.pipe, 0.09, 18, s * 1.45, 2.85, 12, 8, Math.PI / 2);
      k.cyl(b, M.rust, 0.11, 18, s * 1.45, 0.6, 12, 8, Math.PI / 2);
    }
    for (let z = 5; z < 21; z += 4) {
      tbox(b, M.metal, 3.6, 0.25, 0.3, 0, 3.05, z, 2);
      tbox(b, M.metal, 0.25, 3.2, 0.3, -1.65, 1.6, z, 2);
      tbox(b, M.metal, 0.25, 3.2, 0.3, 1.65, 1.6, z, 2);
    }
    // --- pod hall: the coolant manifold column, balcony stubs, flooded furniture, catwalk ---
    const cx = 0,
      cz = 33;
    k.cyl(b, M.conc, 1.6, 8, cx, 4, cz, 16);
    k.cyl(b, M.trimO, 1.66, 0.35, cx, 1.3, cz, 16);
    k.cyl(b, M.trimW, 1.67, 0.08, cx, 1.52, cz, 16);
    for (let i = 0; i < 6; i++) {
      // coolant risers round the column
      const a = (i / 6) * Math.PI * 2 + 0.26,
        px = cx + Math.cos(a) * 1.78,
        pz = cz + Math.sin(a) * 1.78;
      k.cyl(b, M.pipe, 0.11, 7.6, px, 3.8, pz, 8);
      for (const y of [2.4, 4.6, 6.8])
        k.cyl(b, M.frost, 0.15, 0.32, px, y, pz, 8); // frost collars where the old coolant still sweats
    }
    k.cyl(b, M.frost, 1.63, 0.6, cx, 5.6, cz, 16); // rime band where the manifold ring runs
    collider(cx, cz, 3.8, 3.8, 0, 8, "concrete");
    // upper balcony ring (decorative, out of reach) with railings
    // (the north run stops short of the pressure door, which rises through it)
    for (const s of [-1, 1]) {
      if (s > 0) {
        tbox(b, M.metal, 24, 0.25, 2.4, 0, 4.2, 43.8, 2);
        tbox(b, M.metal, 24, 0.9, 0.06, 0, 4.8, 42.6, 2);
      } else {
        tbox(b, M.metal, 14.4, 0.25, 2.4, 4.8, 4.2, 22.2, 2);
        tbox(b, M.metal, 14.4, 0.9, 0.06, 4.8, 4.8, 23.4, 2);
        tbox(b, M.metal, 0.06, 0.9, 2.4, -2.4, 4.8, 22.2, 2);
      }
      tbox(b, M.metal, 2.4, 0.25, 24, s * 10.8, 4.2, 33, 2);
      tbox(b, M.metal, 0.06, 0.9, 24, s * 9.6, 4.8, 33, 2);
    }
    // PRESSURE DOOR 1 — the rectangular freight bulkhead on the north wall, sealed since day nine
    // (the hydraulics are under water; everyone left by the freight hatch). A heavy steel leaf in a
    // concrete surround, orange/black chevrons on the frame, three locking dogs, a wired viewport,
    // salt-frost along every seam, and an Office of Civil Defense stencil on the leaf.
    {
      const DX = -6.6,
        DZ = 21,
        HW = 2.3,
        HH = 4.4; // leaf half-width, height
      const hz = k.tint("qx_c4_hazard", 0xd8641e, { roughness: 0.7 });
      const hzd = k.tint("qx_c4_hazard_d", 0x1c1c1a, { roughness: 0.8 });
      const leaf = k.tint("qx_c4_leafsteel", 0x8a8e90, {
        roughness: 0.45,
        metalness: 0.75,
      });
      // concrete surround + shadow gap
      tbox(
        b,
        M.conc,
        HW * 2 + 1.6,
        HH + 0.9,
        0.5,
        DX,
        (HH + 0.9) / 2,
        DZ + 0.22,
        2,
      );
      k.box(
        b,
        M.dark,
        HW * 2 + 0.2,
        HH + 0.12,
        0.06,
        DX,
        (HH + 0.12) / 2,
        DZ + 0.5,
      );
      // chevrons up both jambs and across the head
      for (let i = 0; i < 9; i++) {
        const y = 0.3 + i * 0.52;
        for (const sx of [-1, 1])
          k.box(
            b,
            i % 2 ? hz : hzd,
            0.6,
            0.5,
            0.04,
            DX + sx * (HW + 0.5),
            y,
            DZ + 0.49,
            0,
            0,
            sx * 0.6,
          );
      }
      for (let i = 0; i < 9; i++)
        k.box(
          b,
          i % 2 ? hz : hzd,
          0.6,
          0.38,
          0.04,
          DX - HW - 0.2 + i * 0.6,
          HH + 0.45,
          DZ + 0.49,
          0,
          0,
          0.6,
        );
      // the leaf: plate, horizontal stiffeners, three locking dogs, the wired viewport
      k.box(b, leaf, HW * 2, HH, 0.5, DX, HH / 2, DZ + 0.62);
      for (const y of [0.9, 2.2, 3.5])
        k.box(b, leaf, HW * 2 - 0.2, 0.18, 0.12, DX, y, DZ + 0.92);
      for (const y of [1.1, 2.2, 3.3]) {
        k.box(b, M.metal, 0.5, 0.26, 0.2, DX + HW - 0.35, y, DZ + 0.98);
        k.box(b, M.rust, 1.1, 0.1, 0.1, DX + HW + 0.2, y, DZ + 1.0); // dog bar, thrown home
      }
      k.box(b, M.dark, 0.9, 0.5, 0.06, DX, 3.0, DZ + 0.9);
      for (let i = 0; i < 4; i++)
        k.box(
          b,
          M.metal,
          0.02,
          0.5,
          0.02,
          DX - 0.36 + i * 0.24,
          3.0,
          DZ + 0.94,
        );
      // salt-frost along the seams and the head (the room breathes cold off the coolant)
      for (let i = 0; i < 12; i++)
        k.box(
          b,
          M.frost,
          0.5 + (i % 3) * 0.2,
          0.06,
          0.05,
          DX - HW + 0.3 + i * 0.36,
          HH - 0.05 - (i % 2) * 0.08,
          DZ + 0.9,
        );
      for (const sx of [-1, 1])
        for (let i = 0; i < 6; i++)
          k.box(
            b,
            M.frost,
            0.07,
            0.4 + (i % 2) * 0.3,
            0.05,
            DX + sx * (HW - 0.04),
            1.0 + i * 0.6,
            DZ + 0.9,
          );
      k.box(b, M.slime, HW * 2 + 1.4, 0.5, 0.05, DX, 0.9, DZ + 0.96); // twenty-two years of tide line
      collider(DX, DZ + 0.5, HW * 2 + 1.6, 1.0, 0, HH + 0.9, "metal");
      // hydraulic ram housing — sheared, rusting in the water
      tbox(b, M.metal, 1.1, 1.3, 1.2, DX + HW + 1.5, 3.1, DZ + 0.7, 1);
      k.cyl(b, M.pipe, 0.2, 2.4, DX + HW + 1.5, 1.2, DZ + 0.7, 10);
      k.cyl(b, M.rust, 0.12, 1.3, DX + HW + 1.3, 0.35, DZ + 1.5, 8, 1.1);
      // door control podium (dead) and a pair of emergency lamps flanking the door
      const PX = DX - HW - 1.55,
        PZ = DZ + 1.3;
      tbox(b, M.metal, 0.9, 1.1, 0.6, PX, 0.55, PZ, 1);
      k.box(b, M.metal, 0.9, 0.08, 0.6, PX, 1.16, PZ - 0.05, 0, -0.45);
      k.box(b, M.red, 0.14, 0.14, 0.06, PX - 0.2, 1.2, PZ - 0.18, 0, -0.45);
      k.box(b, M.crt, 0.3, 0.12, 0.04, PX + 0.15, 1.22, PZ - 0.2, 0, -0.45);
      k.cyl(b, M.metal, 0.03, 0.4, PX + 0.3, 1.35, PZ, 6); // the lever, thrown, for all the good it did
      collider(PX, PZ, 0.9, 0.6, 0, 1.2, "metal");
      V.pdoor = { x: DX, y: HH / 2, z: DZ, hw: HW, hh: HH, podium: [PX, PZ] };
    }
    // --- the pod rows: Project Long Winter cryo pods along the east and west walls, lids cracked
    //     open for the emergency thaw on day eight. Grey-white shells, orange collar rings, frosted
    //     glass (some of it shattered), a stencilled number on each plinth. Pod 61 is still sealed.
    V.pods = [];
    const pod = (px, pz, face, n, opts) => {
      opts = opts || {};
      const ox = face * 0.42; // glass side toward the hall
      k.box(b, M.metal, 1.25, 0.3, 1.25, px, 0.15, pz); // plinth
      k.cyl(b, M.shell, 0.58, 2.2, px - face * 0.08, 1.4, pz, 14); // back shell
      k.cyl(b, M.trimO, 0.62, 0.12, px - face * 0.08, 0.5, pz, 14); // orange collar rings
      k.cyl(b, M.trimO, 0.62, 0.12, px - face * 0.08, 2.48, pz, 14);
      k.cyl(b, M.shell, 0.5, 0.3, px - face * 0.08, 2.7, pz, 14); // crown + coolant stub
      k.cyl(b, M.pipe, 0.07, 1.4, px - face * 0.08, 3.5, pz, 6);
      if (!opts.broken) {
        k.box(b, M.glass, 0.06, 1.8, 0.86, px + ox, 1.45, pz); // the lid's glass
        for (let i = 0; i < 4; i++)
          k.box(
            b,
            M.frost,
            0.07,
            0.18 + (i % 2) * 0.3,
            0.3 + (i % 3) * 0.12,
            px + ox + face * 0.005,
            0.7 + i * 0.42,
            pz - 0.25 + (i % 2) * 0.4,
          );
        if (opts.cracked)
          for (let i = 0; i < 5; i++)
            k.box(
              b,
              M.dark,
              0.075,
              0.5 + (i % 2) * 0.25,
              0.012,
              px + ox + face * 0.01,
              1.5 + (i - 2) * 0.12,
              pz + (i - 2) * 0.09,
              0,
              0.5 + i * 0.6,
            );
      } else {
        for (let i = 0; i < 6; i++)
          k.box(
            b,
            M.glass,
            0.18,
            0.012,
            0.12,
            px + face * (0.9 + (i % 3) * 0.2),
            0.02,
            pz - 0.3 + i * 0.12,
            i * 0.9,
          ); // shards on the floor
        k.box(b, M.fabric, 0.06, 1.5, 0.5, px - face * 0.25, 1.35, pz); // the padded liner, sagging
      }
      if (opts.sealed) {
        k.box(b, M.frost, 0.08, 1.75, 0.8, px + ox + face * 0.02, 1.45, pz);
        k.box(b, M.crt, 0.04, 0.1, 0.1, px + ox + face * 0.06, 2.25, pz + 0.3);
      }
      collider(px, pz, 1.3, 1.3, 0, 2.8, "metal");
      const pl = k.plate(String(n), 0.34, 0.2, {
        fg: "#1c1c1a",
        bg: "#dfe3e2",
      });
      pl.position.set(px + face * 0.64, 0.15, pz);
      pl.rotation.y = face > 0 ? Math.PI / 2 : -Math.PI / 2;
      root.add(pl);
      V.pods.push({ x: px, z: pz, n });
    };
    // west row (faces +x), east row (faces -x); door gaps at z 31..35 (west) and 30.8..33.2 (east)
    pod(-10.6, 37.6, 1, 12, { cracked: true });
    pod(-10.6, 40.0, 1, 13, { broken: true });
    pod(-10.6, 42.4, 1, 14, { cracked: true });
    pod(10.6, 36.6, -1, 58, { broken: true });
    pod(10.6, 39.0, -1, 59, { cracked: true });
    pod(SPOTS.pod61[0], SPOTS.pod61[1], -1, 61, { sealed: true });
    // flooded canteen tables & chairs, a toppled Fizzo Cola machine
    for (const [tx, tz] of [
      [-6, 29],
      [-7.5, 38],
      [6.5, 27.5],
      [5.5, 40.5],
    ]) {
      k.cyl(b, M.metal, 0.5, 0.05, tx, 0.74, tz, 12);
      k.cyl(b, M.metal, 0.05, 0.72, tx, 0.37, tz, 6);
      for (let i = 0; i < 2; i++) {
        const a = i * 2.4 + tx;
        k.box(
          b,
          M.trimO,
          0.42,
          0.06,
          0.42,
          tx + Math.cos(a) * 0.8,
          0.45,
          tz + Math.sin(a) * 0.8,
          a,
        );
        k.box(
          b,
          M.trimO,
          0.42,
          0.45,
          0.05,
          tx + Math.cos(a) * 1.0,
          0.7,
          tz + Math.sin(a) * 1.0,
          a,
        );
      }
    }
    k.box(b, M.red, 1.0, 0.8, 1.8, 9.8, 0.4, 24.5, 0.3); // toppled Fizzo Cola machine (lit panel face)
    collider(9.8, 24.5, 1.4, 2, 0, 0.8, "metal");
    // tape-reel desk (the Director's day-12 reel)
    k.box(b, M.metal, 1.6, 0.08, 0.8, SPOTS.reel[0], 0.78, SPOTS.reel[1]);
    k.box(b, M.metal, 1.5, 0.74, 0.7, SPOTS.reel[0], 0.37, SPOTS.reel[1]);
    collider(SPOTS.reel[0], SPOTS.reel[1], 1.6, 0.8, 0, 0.82, "metal");
    // pump-control panel housing on the south wall
    k.box(
      b,
      M.metal,
      1.6,
      2.2,
      0.5,
      SPOTS.pumpTerm[0],
      1.1,
      SPOTS.pumpTerm[1] + 0.15,
    );
    for (let i = 0; i < 4; i++)
      k.box(
        b,
        i % 2 ? M.red : M.crt,
        0.12,
        0.12,
        0.05,
        SPOTS.pumpTerm[0] - 0.5 + i * 0.3,
        1.9,
        SPOTS.pumpTerm[1] - 0.12,
      );
    // big overhead pipes into the pump room + a warning sign
    k.cyl(b, M.pipe, 0.35, 24, -9, 6.8, 33, 10, Math.PI / 2);
    k.cyl(b, M.pipe, 0.35, 24, 9, 6.8, 33, 10, Math.PI / 2);
    // slime tide line on the walls (the water used to be higher)
    tbox(b, M.slime, 24.2, 0.12, 0.02, 0, 1.75, 21.02, 4);
    tbox(b, M.slime, 24.2, 0.12, 0.02, 0, 1.75, 44.98, 4);
    tbox(b, M.slime, 0.02, 0.12, 24.2, -11.98, 1.75, 33, 4);
    tbox(b, M.slime, 0.02, 0.12, 24.2, 11.98, 1.75, 33, 4);
    // --- quarters: bunks, lockers, Marcus's chair and radio ---
    const [qx0, qx1, qz0, qz1] = R.quarters;
    for (let i = 0; i < 4; i++) {
      const bz = qz0 + 2 + i * 3.4;
      for (const lvl of [0.45, 1.6]) {
        tbox(b, M.metal, 2.0, 0.12, 0.95, qx0 + 1.2, lvl, bz, 2);
        tbox(b, M.fabric, 1.9, 0.14, 0.85, qx0 + 1.2, lvl + 0.13, bz, 1);
      }
      for (const px of [qx0 + 0.25, qx0 + 2.15])
        tbox(b, M.metal, 0.06, 2.0, 0.06, px, 1.0, bz - 0.44, 1);
      collider(qx0 + 1.2, bz, 2.0, 1.0, 0, 2.0, "metal");
    }
    for (let i = 0; i < 5; i++) {
      tbox(b, M.shell, 0.6, 1.9, 0.5, qx0 + 5 + i * 0.64, 0.95, qz0 + 0.3, 1);
      tbox(b, M.trimO, 0.61, 0.08, 0.51, qx0 + 5 + i * 0.64, 1.7, qz0 + 0.3, 1);
    }
    collider(qx0 + 6.3, qz0 + 0.3, 3.3, 0.55, 0, 1.9, "metal");
    k.box(b, M.wood, 0.6, 0.5, 0.45, SPOTS.radio[0], 0.25, SPOTS.radio[1]); // side table
    k.box(b, M.wood, 0.46, 0.3, 0.26, SPOTS.radio[0], 0.65, SPOTS.radio[1]); // the radio
    k.box(
      b,
      M.crt,
      0.2,
      0.08,
      0.02,
      SPOTS.radio[0] + 0.05,
      0.7,
      SPOTS.radio[1] + 0.135,
    );
    k.box(b, M.fabric, 0.7, 0.45, 0.7, SPOTS.marcus[0], 0.45, SPOTS.marcus[1]); // armchair
    k.box(
      b,
      M.fabric,
      0.7,
      0.6,
      0.15,
      SPOTS.marcus[0],
      0.95,
      SPOTS.marcus[1] + 0.3,
    );
    collider(
      SPOTS.marcus[0],
      SPOTS.marcus[1] + 0.2,
      1.1,
      1.0,
      0,
      0.9,
      "carpet",
    );
    // --- office: sandbags in the doorway, desk, the transmitter rack, the window ---
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++)
        k.box(
          b,
          M.sand,
          0.72,
          0.2,
          0.42,
          11.4,
          0.1 + j * 0.2,
          31.2 + i * 0.8 + (j ? 0.4 : 0),
          0.05 * (i - 1),
        );
    collider(11.4, 32, 0.5, 2.4, 0, 0.42, "rubble"); // step over (0.42 m)
    tbox(
      b,
      M.wood,
      2.2,
      0.08,
      1.0,
      SPOTS.office[0],
      0.78,
      SPOTS.office[1] + 1.6,
      1,
    );
    tbox(
      b,
      M.wood,
      2.1,
      0.74,
      0.9,
      SPOTS.office[0],
      0.37,
      SPOTS.office[1] + 1.6,
      1,
    );
    collider(SPOTS.office[0], SPOTS.office[1] + 1.6, 2.2, 1.0, 0, 0.82, "wood");
    tbox(
      b,
      M.metal,
      0.8,
      2.3,
      2.6,
      SPOTS.transmitter[0],
      1.15,
      SPOTS.transmitter[1],
      1,
    );
    for (let i = 0; i < 6; i++)
      k.box(
        b,
        i % 3 === 0 ? M.red : M.crt,
        0.03,
        0.08,
        0.14,
        SPOTS.transmitter[0] - 0.41,
        0.8 + i * 0.22,
        SPOTS.transmitter[1] - 0.8 + (i % 3) * 0.4,
      );
    k.box(
      b,
      M.dark,
      0.03,
      0.7,
      1.2,
      SPOTS.transmitter[0] - 0.41,
      1.75,
      SPOTS.transmitter[1],
    ); // tape reels bay
    for (const rz of [-0.3, 0.3])
      k.cyl(
        b,
        M.metal,
        0.22,
        0.04,
        SPOTS.transmitter[0] - 0.43,
        1.75,
        SPOTS.transmitter[1] + rz,
        14,
        0,
        Math.PI / 2,
      );
    collider(
      SPOTS.transmitter[0],
      SPOTS.transmitter[1],
      0.9,
      2.7,
      0,
      2.3,
      "metal",
    );
    k.cyl(
      b,
      M.metal,
      0.03,
      3.0,
      SPOTS.transmitter[0],
      3.4,
      SPOTS.transmitter[1],
      5,
    ); // mast through the ceiling
    // the cot she sleeps on (she doesn't)
    tbox(b, M.metal, 0.9, 0.35, 2.0, 13.3, 0.35, 35.4, 1);
    tbox(b, M.fabric, 0.85, 0.1, 1.9, 13.3, 0.55, 35.4, 1);
    collider(13.3, 35.4, 0.9, 2.0, 0, 0.6, "metal");
    // tally marks: twenty-two years of days, scratched into the tile above the cot
    const tally = k.sign(
      "||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| |||||\n||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| |||||\n||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| ||||| |||||\nDAY 8,012",
      "wood",
      2.6,
      0.9,
      { fg: "#2a2a28", bg: "#b9c2c5" },
    );
    tally.position.set(12.04, 1.8, 35.2);
    tally.rotation.y = Math.PI / 2;
    root.add(tally);
    // --- pump room: the pumps, and the armory cage at the back ---
    for (const px of [-2.6, 2.6]) {
      k.cyl(b, M.pipe, 1.0, 2.6, px, 1.3, 49, 14);
      k.cyl(b, M.rust, 0.45, 3.4, px, 3.5, 49, 10);
    }
    for (let i = 0; i < 6; i++)
      tbox(b, M.metal, 0.05, 2.5, 0.05, -2.5 + i, 1.25, 53, 1);
    collider(-2.6, 49, 2, 2, 0, 2.6, "metal");
    collider(2.6, 49, 2, 2, 0, 2.6, "metal");

    // --- lights: fluorescent tubes (baked emissive), emergency reds (flicker) ---
    const tubes = [
      [0, 7.2, 0],
      [0, 3.0, 8],
      [0, 3.0, 16],
      [-6, 7.7, 27],
      [6, 7.7, 27],
      [-6, 7.7, 39],
      [6, 7.7, 39],
      [-18, 3.3, 30],
      [-18, 3.3, 37],
      [16.5, 3.3, 31],
      [0, 4.8, 51],
    ];
    for (const t of tubes) {
      k.box(b, M.lamp, 1.3, 0.06, 0.18, t[0], t[1], t[2]);
    }
    k.flush(b, root, false);
    for (const t of tubes)
      V.lamps.push(
        glow(t[0], t[1] - 0.2, t[2], 0xcfe8c8, t[1] < 4 ? 1.7 : 3.2),
      ); // smaller halos under the low ceilings
    for (const r of [
      [0, 2.8, 20.7],
      [-11.7, 3.2, 33],
      [11.7, 3.2, 26],
      [0, 3.2, 44.7],
      [-1.5, 3.2, 2.7],
    ]) {
      k.box(b, M.red, 0.3, 0.18, 0.18, r[0], r[1], r[2]);
      const gs = glow(r[0], r[1], r[2], 0xff3018, 1.6, 0.8);
      if (gs) V.emergency.push(gs);
    }
    k.flush(b, root, false);

    // --- water: one transparent sheet for the tunnel + atrium + quarters, a deep one in the pump room ---
    const wm = new THREE.MeshStandardMaterial({
      color: 0x223328,
      roughness: 0.08,
      metalness: 0.5,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
    wm.userData.shared = true;
    const sheet = (x0, x1, z0, z1, y) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), wm);
      m.rotation.x = -Math.PI / 2;
      m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
      m.renderOrder = 2;
      root.add(m);
      V.water.push(m);
      return m;
    };
    sheet(-1.7, 1.7, 1.5, 21, WATER_Y * 0.7);
    sheet(-12, 12, 21, 45, WATER_Y);
    sheet(-24, -12, 25, 41, WATER_Y);
    V.deepWater = sheet(-5, 5, 45, 57, 3.1);
    // wading surface (footsteps splash) — thin walkable slabs at floor level
    for (const r of [
      [-1.7, 1.7, 3, 21],
      [-12, 12, 21, 45],
      [-24, -12, 25, 41],
    ])
      collider(
        (r[0] + r[1]) / 2,
        (r[2] + r[3]) / 2,
        r[1] - r[0],
        r[3] - r[2],
        -0.3,
        0.0,
        "water",
        "qx_c4_wade",
      );
    // the flooded pump-room doorway: blocks until the pumps are restarted
    const pd = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.12), M.rust);
    pd.position.set(0, 1.3, 45.1);
    root.add(pd);
    V.pumpDoorMesh = pd;
    V.pumpDoorCol = collider(0, 45.1, 2.8, 0.3, 0, 2.6, "metal");
    // the office bulkhead (slides up when unlocked)
    const bh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 2.4), M.metal);
    bh.position.set(12.05, 1.3, 32);
    root.add(bh);
    V.bulkheadMesh = bh;
    V.bulkheadCol = collider(12.1, 32, 0.3, 2.5, 0, 2.6, "metal");
    const plate = (text, w, h, x, y, z, ry, o) => {
      const p = k.plate(text, w, h, o || { fg: "#1c1c1a", bg: "#dfe3e2" });
      p.position.set(x, y, z);
      p.rotation.y = ry || 0;
      root.add(p);
      return p;
    };
    plate("FACILITY DIRECTOR", 1.4, 0.3, 11.8, 2.85, 32, -Math.PI / 2, {
      fg: "#e8eaea",
      bg: "#c4561a",
    });
    plate(
      "OFFICE OF CIVIL DEFENSE — PROJECT LONG WINTER\nCRYO UNIT C-4\nSLEEP SOUND. AMERICA KEEPS WATCH.",
      3.6,
      1.0,
      0,
      5.9,
      21.2,
      0,
      { fg: "#1c1c1a", bg: "#dfe3e2", stripe: "#d8641e" },
    );
    // the way out: a stencilled placard beside the ladder, lit by the shaft's own tube
    plate("FREIGHT HATCH\n↑ SEAWALL ↑", 1.1, 0.5, 1.25, 2.1, -2.84, 0, {
      fg: "#1c1c1a",
      bg: "#dfe3e2",
      stripe: "#d8641e",
    });
    // the stencilled door number (on the leaf) + the podium placard
    if (V.pdoor) {
      plate(
        "PRESSURE DOOR 1\nC-4",
        1.6,
        0.62,
        V.pdoor.x,
        1.9,
        V.pdoor.z + 0.99,
        0,
        { fg: "#e8eaea", bg: "#5e6264" },
      );
      plate(
        "PRESSURE DOOR\nCYCLE CONTROL",
        0.7,
        0.26,
        V.pdoor.podium[0],
        1.45,
        V.pdoor.podium[1] - 0.29,
        0,
        { fg: "#1c1c1a", bg: "#d8641e" },
      );
      for (const sx of [-1, 1]) {
        const gl = glow(
          V.pdoor.x + sx * (V.pdoor.hw + 1.0),
          5.2,
          V.pdoor.z + 0.35,
          0xff3018,
          1.3,
          0.6,
        );
        if (gl) V.emergency.push(gl);
      }
    }
    plate("PUMP ROOM\nAUTHORIZED PERSONNEL", 1.4, 0.45, 0, 3.0, 44.8, Math.PI, {
      fg: "#1c1c1a",
      bg: "#d8641e",
    });
    plate(
      "POD BAY — EAST\n58 · 59 · 61",
      1.4,
      0.4,
      11.84,
      3.2,
      39.0,
      -Math.PI / 2,
    );
    plate(
      "POD BAY — WEST\n12 · 13 · 14",
      1.4,
      0.4,
      -11.84,
      3.2,
      40.0,
      Math.PI / 2,
    );
    // radiation in the standing water (mild)
    G.world.addRadSource({
      x: O.x,
      y: 0,
      z: O.z + 33,
      radius: 13,
      strength: 0.6,
    });
    G.world.addRadSource({
      x: O.x - 18,
      y: 0,
      z: O.z + 33,
      radius: 7,
      strength: 0.4,
    });

    // --- doors: seawall freight hatch ↔ the bottom of the shaft ---
    const H = QX.world.c4Hatch || QX.radioSpots.hatch;
    G.world.addDoor({
      id: "qx_c4_hatch",
      pos: QX.V3(H.x, (H.y || 0) + 0.6, H.z),
      radius: 1.3,
      label: "Cryo Unit C-4 Freight Hatch",
      verb: "Climb Down",
      sound: "door_metal",
      target: {
        x: O.x + SPOTS.arrive[0],
        y: 0,
        z: O.z + SPOTS.arrive[1],
        yaw: Math.PI,
      },
      onEnter: () => V.entered(),
    });
    G.world.addDoor({
      id: "qx_c4_ladder",
      pos: QX.V3(O.x, 1.4, O.z - 2.5),
      radius: 1.0,
      label: "Ladder to the Seawall",
      verb: "Climb Up",
      sound: "door_metal",
      target: { x: H.x + 2.2, y: H.y || 0, z: H.z, yaw: -Math.PI / 2 },
    });

    // --- interactables ---
    if (V.pdoor)
      QX.interact({
        pos: QX.V3(O.x + V.pdoor.podium[0], 1.2, O.z + V.pdoor.podium[1]),
        radius: 0.7,
        label: "Pressure Door Control",
        verb: "Press",
        priority: 2,
        onInteract: () => {
          QX.sfx(QX.flag("c4_pumps") ? ALARM_SFX : "ui_error");
          QX.notify(
            QX.flag("c4_pumps")
              ? "A klaxon whoops once. Behind the leaf, something enormous groans, shifts an inch, and stops. Frost cracks off the seams like gunfire. The ram is sheared clean through. This door is never opening again."
              : 'Click. Nothing. The door hydraulics are somewhere under the water, and they have been since day nine. A strip of tape on the button reads: "USE THE HATCH. — J.B."',
          );
        },
      });
    QX.interact({
      pos: QX.V3(O.x + 11.55, 1.6, O.z + 32),
      radius: 1.1,
      label: "Director's Office — Bulkhead",
      verb: "Open",
      priority: 2,
      locked: () => (QX.flag("c4_bulkhead") ? null : "Locked (key or keypad)"),
      enabled: () => !QX.flag("c4_bulkhead"),
      onInteract: () => V.tryBulkhead(),
    });
    QX.interact({
      pos: QX.V3(O.x + SPOTS.pod61[0] - 0.7, 1.5, O.z + SPOTS.pod61[1]),
      radius: 0.7,
      label: "Cryo Pod 61",
      verb: "Examine",
      priority: 1,
      onInteract: () =>
        QX.notify(
          "The only pod still sealed. Frost has grown across the glass from the inside, thick as a fingernail; the amber lamp says EMPTY — READY. " +
            'The plinth plate reads: "61 — RESERVED — FACILITY DIRECTOR." Somebody has scratched underneath it, very neatly: "Not yet."',
        ),
    });
    QX.interact({
      pos: QX.V3(O.x + SPOTS.intercom[0], 1.5, O.z + SPOTS.intercom[1]),
      radius: 0.5,
      label: "Intercom",
      verb: "Press",
      priority: 3,
      enabled: () => !QX.flag("c4_bulkhead") && QX.alive("qx_brandt"),
      onInteract: () => {
        QX.sfx("ui_click");
        QX.talk("qx_dlg_brandt", "qx_brandt");
      },
    });
    QX.interact({
      pos: QX.V3(O.x + SPOTS.marcus[0], 1.0, O.z + SPOTS.marcus[1]),
      radius: 0.8,
      label: "Marcus Abernathy",
      verb: "Examine",
      priority: 1,
      onInteract: () => V.marcus(),
    });
    QX.interact({
      pos: QX.V3(O.x + SPOTS.radio[0], 0.7, O.z + SPOTS.radio[1]),
      radius: 0.4,
      label: "Marcus's Radio",
      verb: "Turn Knob",
      priority: 2,
      onInteract: () => V.marcusRadio(),
    });
    QX.interact({
      pos: QX.V3(
        O.x + SPOTS.transmitter[0] - 0.4,
        1.6,
        O.z + SPOTS.transmitter[1],
      ),
      radius: 0.8,
      label: "Distress Beacon Transmitter",
      verb: "Examine",
      priority: 1,
      onInteract: () =>
        QX.notify(
          QX.flag("c4_beacon_off")
            ? "The reels have stopped. The VU needle lies on its pin. For the first time in twenty-two years, 91.7 is empty."
            : 'Two reels of tape turn, stop, rewind, turn. The splice has been re-taped so many times it is more tape than tape. A card on the rack: "RE-RECORDED — 11th TIME. KEEP DAY COUNT AT NINE."',
        ),
    });

    // terminals
    QX.terminalProp(
      "qx_term_c4_pumps",
      {
        x: O.x + SPOTS.pumpTerm[0] - 1.4,
        y: 0,
        z: O.z + SPOTS.pumpTerm[1] - 0.25,
      },
      Math.PI,
    );
    QX.terminalProp(
      "qx_term_c4_qm",
      { x: O.x + SPOTS.qmTerm[0] + 0.4, y: 0, z: O.z + SPOTS.qmTerm[1] },
      -Math.PI / 2,
    );
    QX.terminalProp(
      "qx_term_c4_director",
      { x: O.x + SPOTS.dirTerm[0], y: 0, z: O.z + SPOTS.dirTerm[1] - 0.2 },
      Math.PI,
    );

    // containers
    const mk = (id, name, lx, lz, yaw, kind, items, extra) => {
      if (!QX.live("containers") || !G.containers.create) return null;
      return QX.safe("ctr:" + id, () =>
        G.containers.create(
          Object.assign(
            {
              id,
              kind,
              name,
              pos: { x: O.x + lx, y: 0, z: O.z + lz },
              yaw,
              items: items.filter(
                (e) => e[0] === QX.SCRIP_ID || QX.itemExists(e[0]),
              ),
            },
            extra || {},
          ),
        ),
      );
    };
    for (const L of Object.values(LOCKS)) QX.registerLock(L);
    QX.keyFrom(
      "qx_c4_director_key",
      "Facility Director Brandt (Water Rising: every ending; carried if she dies)",
    );
    QX.world.c4Stash = mk(
      "qx_c4_stash",
      "Director's Footlocker",
      SPOTS.stash[0],
      SPOTS.stash[1],
      Math.PI,
      "footlocker",
      [
        ["qx_c4_cryo_suit", 1],
        [QX.SCRIP_ID, 160],
        ["rally_tonic", 3],
        ["prussian_blue", 2],
        ["pistol_10mm", 1],
        ["ammo_10mm", 48],
        ["focus_pills", 1],
        ["cigarettes", 2],
      ],
      { lock: LOCKS.footlocker },
    );
    QX.world.c4Armory = mk(
      "qx_c4_armory",
      "C-4 Security Cage",
      SPOTS.armory[0],
      SPOTS.armory[1],
      Math.PI,
      "locker",
      [
        ["assault_rifle", 1],
        ["ammo_556", 90],
        ["frag_grenade", 4],
        ["rally_tonic", 2],
        ["security_armor", 1],
        ["security_helmet", 1],
        ["morphine_syrette", 1],
      ],
      { lock: LOCKS.armory },
    );
    mk("qx_c4_locker1", "Crew Locker", -19.5, 25.4, 0, "locker", [
      ["purified_water", 2],
      ["golden_plain_jerky", 1],
      ["scrap_metal", 3],
    ]);
    mk("qx_c4_locker2", "Crew Locker", -16.9, 25.4, 0, "locker", [
      ["freedom_flakes", 1],
      ["old_world_book", 1],
      ["prussian_blue", 1],
      [QX.SCRIP_ID, 22],
    ]);
    mk(
      "qx_c4_qm",
      "Quartermaster's Cabinet",
      -11.4,
      26.2,
      -Math.PI / 2,
      "file_cabinet",
      [
        ["scrap_electronics", 3],
        ["duct_tape", 1],
        ["dry_cell", 1],
      ],
    );
  });

  // ------------------------------------------------------------------
  // Session content: pickups (roll, day-12 tape), actors
  // ------------------------------------------------------------------
