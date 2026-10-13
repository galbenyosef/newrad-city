// play-inline-231 03 — math
// Lines 263-1485 of readable/play-inline-231.pretty.js (statement-aligned).
  function build() {
    const C = LI.cell(KEY);
    C.site = "nyse";
    const b = C.b,
      T = art();
    b.ambient(0x2a2620, 1);
    // ------------- lights -------------
    b.light(-26, 10, -2, 0xd8e0c0, 30, 0.9); // the great window
    for (const [x, z] of [
      [-14, -10],
      [14, -10],
      [-14, 8],
      [14, 8],
      [0, 14],
      [0, -14],
    ])
      b.light(x, 16, z, 0xffe0b0, 18, 0.5);
    b.light(0, 7, -2, 0xfff0d0, 12, 1.0); // pit floodlights
    for (const [x, z] of [
      [-6, -8],
      [6, -8],
      [-6, 4],
      [6, 4],
    ])
      b.light(x, 5, z, 0xffe8c0, 9, 0.6);
    b.light(0, 8.5, -18, 0xffc070, 10, 0.9);
    b.light(14, 8, -20.5, 0xffc070, 8, 0.6);
    for (const [x, z] of [
      [-18, -12],
      [18, -12],
      [-18, 6],
      [18, 6],
    ])
      b.light(x, 5.2, z, 0x60ff90, 7, 0.45);
    b.light(0, 3, 24, 0xffd8a0, 8, 0.7);
    b.light(0, 3, 20, 0xffd8a0, 7, 0.5);
    for (const [x, z] of [
      [9, -30],
      [19, -30],
    ])
      b.light(x, 10.5, z, 0xffd090, 11, 0.9);
    b.light(-10, 3.8, -30, 0xfff0c8, 12, 0.9);
    b.light(1.5, 7.5, -30, 0xffd8a0, 7, 0.5);
    b.light(-19, 1.2, 10, 0xff9040, 6, 0.8);
    b.light(19, 1.2, -16, 0xff9040, 6, 0.8);

    // ==============================================================
    // MAIN TRADING ROOM (x -28..28, z -22..18, y 0..21)
    // ==============================================================
    const X0 = -28,
      X1 = 28,
      Z0 = -22,
      Z1 = 18,
      H = 21;
    A.floor(C, "wood", X0, Z0, X1, Z1, 0.02, { col: false, th: 0.05 });
    // walls: marble dado, cream plaster, gilt cornice; openings
    A.wall(C, "marble_warm", { x0: X0, x1: X1, z: Z0 - 0.2 }, 0, 4, 0.4, [
      { a: -11, b: -9, top: 2.6 },
    ]);
    A.wall(C, "plaster_warm", { x0: X0, x1: X1, z: Z0 - 0.2 }, 4, H, 0.4, [
      { a: 13, b: 15, top: 8.3, sill: 5.5 },
    ]);
    A.wall(C, "marble_warm", { x0: X0, x1: X1, z: Z1 + 0.2 }, 0, 4, 0.4, [
      { a: -2, b: 2, top: 3.2 },
    ]);
    A.wall(C, "plaster_warm", { x0: X0, x1: X1, z: Z1 + 0.2 }, 4, H, 0.4, []);
    A.wall(C, "marble_warm", { z0: Z0, z1: Z1, x: X1 + 0.2 }, 0, 4, 0.4, []);
    A.wall(C, "plaster_warm", { z0: Z0, z1: Z1, x: X1 + 0.2 }, 4, H, 0.4, []);
    // west: the great window wall (three bays)
    const bays = [
      [-18, -7],
      [-5, 5],
      [7, 16],
    ];
    A.wall(
      C,
      "marble_warm",
      { z0: Z0, z1: Z1, x: X0 - 0.2 },
      0,
      H,
      0.4,
      bays.map((q) => ({ a: q[0], b: q[1], sill: 2.6, top: 16.5 })),
    );
    for (const [z0, z1] of bays) {
      for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 5)
        b.box("iron", X0 - 0.3, 2.6, z - 0.06, X0 - 0.1, 16.5, z + 0.06);
      for (let y = 2.6; y <= 16.6; y += 1.75)
        b.box("iron", X0 - 0.3, y - 0.05, z0, X0 - 0.1, y + 0.05, z1);
      b.quad(
        T.window,
        X0 - 2.5,
        9.5,
        (z0 + z1) / 2,
        z1 - z0 + 2,
        15,
        Math.PI / 2,
        { noAO: true },
      );
      const r = LI.rng((z0 * 7) | 0);
      for (let k = 0; k < 14; k++) {
        if (r() < 0.35) continue;
        const zz = z0 + ((z1 - z0) * (Math.floor(r() * 5) + 0.5)) / 5,
          yy = 3.4 + Math.floor(r() * 8) * 1.75;
        b.quad(
          "glass",
          X0 - 0.2,
          yy,
          zz,
          (z1 - z0) / 5 - 0.12,
          1.65,
          Math.PI / 2,
          { double: true },
        );
      }
      b.box("black", X0 - 3, 0, z0 - 1, X0 - 2.6, 18, z1 + 1, { noBake: true });
    }
    b.box("gold", X0, 4.0, Z0, X1, 4.18, Z0 + 0.05);
    b.box("gold", X0, 4.0, Z1 - 0.05, X1, 4.18, Z1);
    b.box("gold", X1 - 0.05, 4.0, Z0, X1, 4.18, Z1);
    b.box("gold", X0, H - 1.4, Z0, X1, H - 0.9, Z0 + 0.3);
    b.box("gold", X0, H - 1.4, Z1 - 0.3, X1, H - 0.9, Z1);
    b.box("gold", X1 - 0.3, H - 1.4, Z0, X1, H - 0.9, Z1);
    b.box("gold", X0, H - 1.4, Z0, X0 + 0.3, H - 0.9, Z1);
    // gilded coffered ceiling
    A.ceil(C, "gold_leaf", X0, Z0, X1, Z1, H);
    for (let x = X0; x <= X1 + 0.01; x += 4)
      b.box("plaster_warm", x - 0.3, H - 1.0, Z0, x + 0.3, H, Z1);
    for (let z = Z0; z <= Z1 + 0.01; z += 4)
      b.box("plaster_warm", X0, H - 1.0, z - 0.3, X1, H, z + 0.3);
    for (let x = X0 + 2; x < X1; x += 4)
      for (let z = Z0 + 2; z < Z1; z += 4)
        b.cyl("gold", x, H - 0.2, z, 0.35, 0.5, 0.2, 8);
    for (const [x, z] of [
      [-14, -10],
      [14, -10],
      [-14, 8],
      [14, 8],
      [0, 14],
      [0, -14],
    ])
      A.chandelier(C, x, H - 3.4, z, H - 1, 1.3, {
        light: false,
        bulb: (x + z) % 3 === 0 ? "glass_dark" : "lamp",
      });
    // ticker bands (north, south, east) + the big board over the corridor door
    const TKY = 11;
    b.quad(T.ticker, 0, TKY, Z0 + 0.02, X1 - X0 - 0.4, 1.1, 0, {
      us: 1.6,
      noAO: true,
    });
    b.quad(T.ticker, 0, TKY, Z1 - 0.02, X1 - X0 - 0.4, 1.1, Math.PI, {
      us: 1.6,
      noAO: true,
    });
    b.quad(T.ticker, X1 - 0.02, TKY, -2, Z1 - Z0 - 0.4, 1.1, -Math.PI / 2, {
      us: 1.2,
      noAO: true,
    });
    for (const [pz, ry] of [
      [Z0 + 0.1, 0],
      [Z1 - 0.1, Math.PI],
    ])
      b.box(
        "metal_dark",
        X0 + 0.3,
        TKY - 0.65,
        pz - 0.08,
        X1 - 0.3,
        TKY - 0.55,
        pz + 0.08,
      );
    b.quad(T.board, 0, 7.5, Z1 - 0.03, 12, 6, Math.PI, { noAO: true });
    b.box("metal_dark", -6.3, 4.3, Z1 - 0.2, 6.3, 10.7, Z1 - 0.05);
    const tkMat = LI.mat(T.ticker);
    LI.animators.push({
      cell: C,
      fn: (dt, t) => {
        if (tkMat.map) tkMat.map.offset.x = (t * 0.03) % 1;
      },
    });

    // ---------- trading posts ----------
    const post = (x, z, seed, live) => {
      b.cyl("paint_cream", x, 0, z, 2.3, 2.4, 1.15, 8);
      b.cyl("wood_dark", x, 1.15, z, 2.55, 2.55, 0.1, 8);
      b.cyl("iron", x, 1.25, z, 0.22, 0.22, 3.5, 8);
      b.cyl("paint_cream", x, 4.4, z, 2.8, 2.8, 1.0, 8, { open: true });
      b.cyl("metal_dark", x, 5.4, z, 2.85, 2.85, 0.1, 8);
      b.cyl("metal_dark", x, 4.3, z, 2.85, 2.85, 0.1, 8);
      const r = LI.rng(seed);
      for (let i = 0; i < 8; i++) {
        const a = ((i + 0.5) / 8) * TAU;
        b.quad(
          r() < (live ? 0.7 : 0.35) ? "screen" : "glass_dark",
          x + Math.sin(a) * 2.62,
          4.9,
          z + Math.cos(a) * 2.62,
          1.6,
          0.8,
          a,
          { noAO: true },
        );
      }
      for (let i = 0; i < 4; i++) {
        const a = r() * TAU;
        F.monitor(C, x + Math.sin(a) * 1.9, 1.25, z + Math.cos(a) * 1.9, a, {
          dead: r() < 0.5,
        });
      }
      b.rod(
        "rubber",
        [x, 5.4, z],
        [x + (r() - 0.5) * 8, H - 1, z + (r() - 0.5) * 6],
        0.04,
      );
      C.col(x - 2.4, 0, z - 2.4, x + 2.4, 1.25, z + 2.4, {
        walkable: false,
        surface: "metal",
      });
      F.papers(C, x, 0.03, z, 4.5, 16, seed * 3);
    };
    post(-18, -12, 1, true);
    post(18, -12, 2, false);
    post(-18, 7, 3, false);
    post(18, 7, 4, true);
    post(-9, 13.5, 5, false);
    // post 6 fell over into a flooded, electrified hole (hazard)
    // (round 2: was a neon-green 'goo' disc that read as a render bug — now dark standing water in a broken floor,
    //  a torn rim of terrazzo, and the severed feed cable arcing where it touches the surface)
    const HX = 9.5,
      HZ = 13;
    {
      const rr = LI.rng(66),
        N = 28,
        pts = [],
        rim = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * TAU,
          r = 2.45 + (rr() - 0.5) * 0.55 + Math.sin(a * 3 + 1) * 0.18;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
        rim.push([a, r]);
      }
      const sh = new THREE.Shape();
      sh.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < N; i++) sh.lineTo(pts[i][0], pts[i][1]);
      sh.closePath();
      const wg = new THREE.ShapeGeometry(sh, 2);
      wg.rotateX(-Math.PI / 2);
      const P = wg.attributes.position,
        uv = new Float32Array(P.count * 2);
      for (let i = 0; i < P.count; i++) {
        uv[i * 2] = P.getX(i) / 6 + 0.5;
        uv[i * 2 + 1] = -P.getZ(i) / 6 + 0.5;
      }
      wg.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      const waterK = LI.texMat(
        "nyse_water",
        LI.canvasTex(
          "nyse_water",
          512,
          512,
          (x, W, H) => {
            const g = x.createRadialGradient(
              W * 0.5,
              H * 0.5,
              4,
              W * 0.5,
              H * 0.5,
              W * 0.5,
            );
            g.addColorStop(0, "#2c3a3c");
            g.addColorStop(0.55, "#1a2224");
            g.addColorStop(1, "#0e1212");
            x.fillStyle = g;
            x.fillRect(0, 0, W, H);
            x.globalAlpha = 0.5;
            x.strokeStyle = "#6a8a90";
            x.lineWidth = 2; // ripples from the arc
            for (let k = 1; k < 7; k++) {
              x.beginPath();
              x.ellipse(W * 0.47, H * 0.53, k * 26, k * 24, 0.2, 0, TAU);
              x.stroke();
              x.globalAlpha *= 0.72;
            }
            x.globalAlpha = 0.35;
            x.fillStyle = "#8aa0a0"; // oily sheen + floating paper
            for (let i = 0; i < 40; i++)
              x.fillRect(
                Math.random() * W,
                Math.random() * H,
                2 + Math.random() * 18,
                1.5,
              );
            x.globalAlpha = 0.8;
            x.fillStyle = "#b8b0a0";
            for (let i = 0; i < 7; i++) {
              x.save();
              x.translate(60 + Math.random() * 390, 60 + Math.random() * 390);
              x.rotate(Math.random() * 3);
              x.fillRect(-14, -10, 28, 20);
              x.restore();
            }
            x.globalAlpha = 1;
          },
          { clamp: true },
        ),
        { rough: 0.06, metal: 0.55, emissive: 0.22 },
      );
      b.add(waterK, wg, {
        m: LI.M4(HX, 0.035, HZ),
        noAO: true,
        noBake: true,
        keepUV: true,
      });
      // torn rim: tilted terrazzo slabs and chunks around the edge
      for (let i = 0; i < N; i += 1) {
        if (rr() < 0.35) continue;
        const [a, r] = rim[i],
          cx = HX + Math.cos(a) * (r + 0.15),
          cz = HZ + Math.sin(a) * (r + 0.15);
        b.obox(
          "terrazzo",
          cx,
          0.05,
          cz,
          0.4 + rr() * 0.5,
          0.08,
          0.25 + rr() * 0.3,
          -a + Math.PI / 2,
          { rx: (rr() - 0.5) * 0.3, rz: 0.12 + rr() * 0.25 },
        );
      }
      F.rubble(C, HX - 2.6, 0, HZ + 1.4, 0.8, 67, {
        h: 0.3,
        n: 6,
        chunk: "concrete",
      });
    }
    b.obox("paint_cream", HX + 0.4, 0.8, HZ - 0.8, 4.4, 1.1, 1.8, 0.6, {
      rz: 1.2,
    });
    b.rod("iron", [HX - 0.5, 0.2, HZ + 0.4], [HX + 3.5, 1.4, HZ + 3.4], 0.2);
    // the severed feed cable: hangs from a torn ceiling tray, sags, and its stripped end lies in the water
    const cab = [
      [HX + 1, H - 1, HZ - 4],
      [HX + 0.8, H - 3, HZ - 3.1],
      [HX + 0.5, 2.2, HZ - 1.8],
      [HX + 0.25, 0.6, HZ - 0.7],
      [HX + 0.1, 0.06, HZ - 0.15],
    ];
    for (let i = 0; i < cab.length - 1; i++)
      b.rod("rubber", cab[i], cab[i + 1], 0.045, { seg: 6 });
    b.box(
      "metal_dark",
      HX + 0.2,
      H - 1.08,
      HZ - 5.2,
      HX + 1.8,
      H - 0.95,
      HZ - 3.4,
    );
    b.cyl("copper", HX + 0.1, 0.03, HZ - 0.15, 0.03, 0.02, 0.14, 6, {
      rz: 1.3,
    });
    // the arc: a jagged blue-white bolt that flickers between the stripped copper and the water
    {
      const arc = new THREE.Group();
      arc.position.set(HX + 0.1, 0.1, HZ - 0.15);
      C.root.add(arc);
      const am = new THREE.MeshBasicMaterial({
        color: 0xd8ecff,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const bolts = [];
      for (let k = 0; k < 3; k++) {
        const pts3 = [];
        const r3 = LI.rng(70 + k);
        for (let i = 0; i <= 6; i++)
          pts3.push(
            new THREE.Vector3(
              (r3() - 0.5) * 0.25 + i * 0.05 * (k - 1),
              0.02 + (1 - i / 6) * 0.35 + (r3() - 0.5) * 0.05,
              (r3() - 0.5) * 0.25,
            ),
          );
        const m = new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(pts3),
            12,
            0.008,
            4,
            false,
          ),
          am,
        );
        m.visible = false;
        arc.add(m);
        bolts.push(m);
      }
      C.glow(HX + 0.1, 0.35, HZ - 0.15, 0x9ac8ff, 0.9, {
        fixture: true,
        intensity: 1.6,
        range: 5,
        flicker: 0.95,
      });
      let tA = 0;
      LI.animators.push({
        cell: C,
        fn(dt) {
          tA -= dt;
          if (tA <= 0) {
            tA = 0.05 + Math.random() * 0.5;
            const on = Math.random() < 0.55;
            for (const m of bolts) {
              m.visible = on && Math.random() < 0.7;
              m.rotation.y = Math.random() * TAU;
            }
            am.opacity = 0.6 + Math.random() * 0.4;
          }
        },
      });
    }
    C.hazard = { x: HX, z: HZ, r: 2.4 };

    // ---------- THE PIT ----------
    const PX = 0,
      PZ = -2,
      PR = 7.5;
    b.cyl("dirt", PX, 0.03, PZ, PR, PR, 0.04, 36);
    if (T.blood) {
      b.flat(T.blood, PX + 1.5, 0.08, PZ - 1, 3, 3, 0.4, { noAO: true });
      b.flat(T.blood, PX - 2.5, 0.08, PZ + 2.5, 2.2, 2.2, 1.9, { noAO: true });
    }
    const gates = [Math.PI / 2, -Math.PI / 2];
    for (let i = 0; i < 24; i++) {
      const a0 = (i / 24) * TAU,
        a1 = ((i + 1) / 24) * TAU,
        am = (a0 + a1) / 2;
      if (
        gates.some(
          (g) =>
            Math.abs(
              LI.clamp(
                ((((am - g + Math.PI) % TAU) + TAU) % TAU) - Math.PI,
                -9,
                9,
              ),
            ) < 0.2,
        )
      )
        continue;
      const cx = PX + Math.cos(am) * PR,
        cz = PZ + Math.sin(am) * PR,
        L = 2 * PR * Math.sin(Math.PI / 24) + 0.05,
        ry = -am + Math.PI / 2;
      const mat = i % 4 === 0 ? "corrugated" : i % 4 === 2 ? "rust" : null;
      if (mat)
        b.obox(mat, cx, 1.25, cz, L, 2.5, 0.06, ry, {
          rz: ((i % 3) - 1) * 0.03,
        });
      else {
        for (let k = 0; k <= 4; k++) {
          const t = k / 4 - 0.5,
            p = LI.rot(t * L, 0, cx, cz, ry);
          b.box(
            "iron",
            p[0] - 0.02,
            0,
            p[1] - 0.02,
            p[0] + 0.02,
            2.5,
            p[1] + 0.02,
          );
        }
        b.obox("iron", cx, 2.45, cz, L, 0.05, 0.05, ry);
        b.obox("iron", cx, 1.25, cz, L, 0.03, 0.03, ry);
        b.obox("glass", cx, 1.25, cz, L, 2.4, 0.02, ry, { noBake: true });
      }
      C.colRot(cx, cz, L, 0.2, 0, 2.5, ry, {
        walkable: false,
        surface: "metal",
      });
      if (i % 3 === 0) {
        b.rod("rust", [cx, 2.5, cz], [cx, 3.2, cz], 0.02);
        b.sphere("bone", cx, 3.3, cz, 0.13, { sy: 1.15 });
      }
    }
    // gate frames
    for (const g of gates) {
      for (const s of [-1, 1]) {
        const a = g + s * 0.2;
        b.box(
          "rust",
          PX + Math.cos(a) * PR - 0.15,
          0,
          PZ + Math.sin(a) * PR - 0.15,
          PX + Math.cos(a) * PR + 0.15,
          3.4,
          PZ + Math.sin(a) * PR + 0.15,
        );
      }
    }
    // bleachers of scrap (east & west of the pit, beyond the gates' axis)
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++) {
        const x0 = s > 0 ? PX + PR + 1.2 + k * 1.0 : PX - PR - 2.2 - k * 1.0,
          y = (k + 1) * 0.45;
        b.box(
          k % 2 ? "wood_rotten" : "rust",
          x0,
          0,
          PZ - 6 + k * 0.3,
          x0 + 1.0,
          y,
          PZ - 2.5,
          { fy: 0 },
        );
        b.box(
          k % 2 ? "wood_rotten" : "rust",
          x0,
          0,
          PZ + 1.5,
          x0 + 1.0,
          y,
          PZ + 6 - k * 0.3,
          { fy: 0 },
        );
        C.col(x0, 0, PZ - 6 + k * 0.3, x0 + 1.0, y, PZ - 2.5, {
          surface: "wood",
        });
        C.col(x0, 0, PZ + 1.5, x0 + 1.0, y, PZ + 6 - k * 0.3, {
          surface: "wood",
        });
      }
    // floodlights (car headlamps on poles) + meat-hook post + betting board
    for (const [x, z] of [
      [-9.5, -10],
      [9.5, -10],
      [-9.5, 6],
      [9.5, 6],
    ]) {
      b.box("rust", x - 0.1, 0, z - 0.1, x + 0.1, 5.5, z + 0.1);
      b.obox(
        "metal_dark",
        x,
        5.6,
        z,
        0.7,
        0.4,
        0.4,
        Math.atan2(PX - x, PZ - z),
        { rx: 0.5 },
      );
      b.sphere("lamp", x + (PX - x) * 0.04, 5.55, z + (PZ - z) * 0.04, 0.16);
      C.col(x - 0.15, 0, z - 0.15, x + 0.15, 5.5, z + 0.15, {
        walkable: false,
      });
    }
    b.cyl("rust", PX + 2.5, 0, PZ - 3.5, 0.08, 0.1, 3.4, 8);
    b.rod("rust", [PX + 2.5, 3.3, PZ - 3.5], [PX + 3.3, 3.3, PZ - 3.5], 0.04);
    b.rod("iron", [PX + 3.2, 3.3, PZ - 3.5], [PX + 3.2, 2.5, PZ - 3.5], 0.01);
    C.col(PX + 2.35, 0, PZ - 3.65, PX + 2.65, 3.3, PZ - 3.35, {
      walkable: false,
    });
    b.box("wood_rotten", -14.2, 0, -2.6, -14, 3.4, 2.6);
    b.quad(T.odds, -13.98, 2.2, 0, 4.2, 3.1, Math.PI / 2, { noAO: true });
    C.col(-14.3, 0, -2.6, -14, 3.4, 2.6, { walkable: false });
    // cages (one holds the captive)
    const cage = (x, z) => {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        b.box(
          "iron",
          x + Math.cos(a) * 1.2 - 0.03,
          0,
          z + Math.sin(a) * 1.2 - 0.03,
          x + Math.cos(a) * 1.2 + 0.03,
          2.5,
          z + Math.sin(a) * 1.2 + 0.03,
        );
      }
      b.cyl("iron", x, 2.5, z, 1.3, 1.3, 0.08, 12);
      b.torus("iron", x, 1.2, z, 1.2, 0.03, { ts: 16 });
    };
    cage(20, -4);
    cage(22.5, -1);
    // (tagged like an interactable's own collider: the bars still stop you, but you can talk to Nate through them —
    //  the solid box used to fail the focus line-of-sight, so his dialogue could never open)
    C.col(18.8, 0, -5.2, 21.2, 2.6, -2.8, {
      walkable: false,
      tag: "interactable_self",
      surface: "metal",
    });
    C.col(21.3, 0, -2.2, 23.7, 2.6, 0.2, {
      walkable: false,
      tag: "interactable_self",
      surface: "metal",
    });
    C.prop("skeleton", 22.5, 0, -1, 0.5, { pose: "curled", collide: false });
    // raider camp dressing
    for (const [x, z, ry] of [
      [-22, 14, 0.3],
      [-24, 11, 1.4],
      [23, 14, -0.4],
      [24.5, 10, 1.7],
    ])
      b.obox("fabric", x, 0.12, z, 0.9, 0.2, 1.9, ry, { c: 0x8a7a5a });
    C.prop("barrel", -19, 0, 10, 0, { burning: true });
    C.prop("barrel", 19, 0, -16, 0, { burning: true });
    const pitSign = T.sign(
      "pit",
      ["THE PIT", "LOSERS FEED THE BURROW RATS"],
      {
        bg: "#6a6456",
        fg: "#f2d64a",
        size: 64,
        font: "bold %spx Impact, sans-serif",
      },
      768,
      192,
    );
    b.box("rust", -5.5, 12.7, Z1 - 0.3, 5.5, 15.3, Z1 - 0.1);
    b.quad(pitSign, 0, 14, Z1 - 0.32, 10.6, 2.5, Math.PI, { noAO: true });
    for (const [x, z] of [
      [-24, -18],
      [24, 15],
      [-22, -6],
    ])
      F.crates(C, x, 0, z, 3, 0.3, { key: "wood_rotten" });
    C.prop("fizzo_machine", 27.4, 0, 12, -Math.PI / 2, {});
    C.prop("footlocker", -25.5, 0, 15.8, 0, {
      loot: "raider_stash",
      owner: "raiders",
    });
    C.prop("ammo_box", 25.8, 0, -18.5, -Math.PI / 2, {
      loot: "ammo_box",
      owner: "raiders",
    });
    for (const [x, z, pose] of [
      [-17.2, -9.9, "sitting"],
      [16.3, 9.3, "reaching"],
      [-7.5, 15.4, "lying"],
    ])
      C.prop("skeleton", x, 0, z, (x + z) % 6, { pose, collide: false });

    // ==============================================================
    // THE BELL BALCONY (y 5.5) + east stair
    // ==============================================================
    const BY = 5.5;
    b.box("marble_warm", -20, BY - 0.45, Z0, 27.8, BY, -19, { fy: BY - 1 });
    C.col(-20, BY - 0.45, Z0, 27.8, BY, -19, {});
    for (let x = -18; x < 26; x += 4) {
      b.box("marble_warm", x - 0.25, 0, -19.6, x + 0.25, BY - 0.45, -19.1);
      C.col(x - 0.25, 0, -19.6, x + 0.25, BY - 0.45, -19.1, {
        walkable: false,
      });
    }
    A.balustrade(C, "marble_warm", [-20, -19.05], [-2.2, -19.05], BY, 1.0);
    A.balustrade(C, "marble_warm", [2.2, -19.05], [24.8, -19.05], BY, 1.0);
    A.balustrade(C, "marble_warm", [-20, -19.05], [-20, Z0], BY, 1.0);
    // podium with the bell (projecting)
    b.box("marble_warm", -2.2, BY - 0.45, -19.05, 2.2, BY, -17.2);
    C.col(-2.2, BY - 0.45, -19.05, 2.2, BY, -17.2, {});
    A.balustrade(C, "marble_warm", [-2.2, -17.25], [2.2, -17.25], BY, 1.05);
    A.balustrade(C, "marble_warm", [-2.2, -19.05], [-2.2, -17.25], BY, 1.05, {
      col: true,
    });
    A.balustrade(C, "marble_warm", [2.2, -19.05], [2.2, -17.25], BY, 1.05, {
      col: true,
    });
    b.box("wood_dark", -1.1, BY, -18.8, 1.1, BY + 1.1, -18.3);
    b.box("brass", -0.8, BY + 1.1, -18.7, 0.8, BY + 1.15, -18.4);
    b.box("iron", 1.3, BY, -18.9, 1.45, BY + 2.4, -18.75);
    b.box("iron", 0.9, BY + 2.3, -18.9, 1.45, BY + 2.42, -18.75);
    b.lathe(
      "brass",
      [
        [0.02, 0],
        [0.22, 0.04],
        [0.32, 0.3],
        [0.3, 0.45],
        [0.08, 0.54],
      ],
      14,
      1.0,
      BY + 2.28,
      -18.82,
      { rx: Math.PI },
    );
    const exSign = T.sign(
      "ex",
      ["THE EXCHANGE", "EST. 1792 · RE-EST. BY FORCE"],
      { bg: "#10181c", fg: "#e8c860", border: "#e8c860", size: 60 },
      768,
      192,
    );
    b.box("marble_warm", -4.2, BY + 2.4, Z0 + 0.2, 4.2, BY + 5.4, Z0 + 0.5);
    b.quad(exSign, 0, BY + 3.9, Z0 + 0.52, 7.8, 2.0, 0, { noAO: true });
    for (const s of [-1, 1]) {
      b.box(
        "gold",
        s * 4.4 - 0.2,
        BY,
        Z0 + 0.2,
        s * 4.4 + 0.2,
        BY + 5.8,
        Z0 + 0.6,
      );
      b.sphere("lamp", s * 4.4, BY + 6.0, Z0 + 0.5, 0.22);
    }
    // east stair up to the balcony
    A.stairs(C, "marble_warm", 26.2, -4, "n", 2.8, 0, BY, { nose: "brass" });
    b.box("marble_warm", 24.8, BY - 0.45, -19, 27.8, BY, -11.4, { fy: BY - 1 });
    C.col(24.8, BY - 0.45, -19, 27.8, BY, -11.4, {});
    A.balustrade(C, "marble_warm", [24.75, -4], [24.75, -18.9], 0, 1.0, {
      col: false,
    });
    A.rail(
      C,
      "brass",
      [
        [24.7, -4],
        [24.7, -11.4],
      ],
      0,
      BY + 1,
      { col: false, mid: false, step: 1.5 },
    );
    A.balustrade(C, "marble_warm", [24.75, -11.4], [24.75, -18.9], BY, 1.0);

    // ==============================================================
    // MEMBERS' CORRIDOR (arrival) x -3..3, z 18.4..30
    // ==============================================================
    A.floor(C, "terrazzo", -3, Z1 + 0.4, 3, 30, 0.02, { col: false });
    A.ceil(C, "plaster_warm", -3, Z1 + 0.4, 3, 30, 3.6);
    // oak-panelled members' corridor: marble dado, panelling, a brass picture rail
    for (const s of [-1, 1]) {
      A.wall(
        C,
        "wood",
        { z0: Z1 + 0.4, z1: 30, x: s * 3.15 },
        1.0,
        3.6,
        0.3,
        [],
      );
      A.wall(
        C,
        "marble_warm",
        { z0: Z1 + 0.4, z1: 30, x: s * 3.15 },
        0,
        1.0,
        0.3,
        [],
      );
      b.box(
        "wood_dark",
        s * 2.99 - 0.03,
        0.98,
        Z1 + 0.4,
        s * 2.99 + 0.03,
        1.06,
        30,
      );
      b.box(
        "brass",
        s * 2.99 - 0.02,
        2.72,
        Z1 + 0.4,
        s * 2.99 + 0.02,
        2.76,
        30,
      );
      for (let z = Z1 + 1.9; z < 29.5; z += 3) {
        // raised oak panels (mid oak: the old dark ones read as black holes)
        b.box(
          "wood_light",
          s * 2.99 - 0.03,
          1.2,
          z - 1.25,
          s * 2.99 + 0.03,
          2.55,
          z + 1.25,
          { c: 0xb89a74 },
        );
        b.box(
          "wood_dark",
          s * 2.99 - 0.045,
          1.16,
          z - 1.29,
          s * 2.99 + 0.045,
          1.2,
          z + 1.29,
        );
        b.box(
          "wood_dark",
          s * 2.99 - 0.045,
          2.55,
          z - 1.29,
          s * 2.99 + 0.045,
          2.59,
          z + 1.29,
        );
      }
    }
    A.wall(C, "wood_dark", { x0: -3.3, x1: 3.3, z: 30.15 }, 0, 3.6, 0.3, []);
    // the way out: steel fire doors with push bars and a lit EXIT box (the old dark slab read as a wall)
    LI.doorway(C, LI.doorFrame(0, 29.98, 0), 0, {
      w: 2.2,
      h: 2.6,
      frame: "metal_dark",
      leaf: "metal",
      glass: "glass_dark",
      lamp: false,
      sill: "concrete_dark",
    });
    for (const s of [-1, 1])
      b.box("steel", s * 0.55 - 0.45, 1.0, 29.86, s * 0.55 + 0.45, 1.06, 29.9);
    b.box("metal_dark", -0.42, 2.98, 29.82, 0.42, 3.26, 29.98);
    b.quad(
      LI.texMat(
        "nyse_exitbox",
        LI.signTex(
          "nyse_exitbox",
          ["EXIT"],
          {
            bg: "#1c0303",
            fg: "#ff4a36",
            size: 84,
            glow: "#ff2010",
            wear: 0.15,
          },
          256,
          96,
        ),
        { emissive: 1.3 },
      ),
      0,
      3.12,
      29.81,
      0.76,
      0.24,
      Math.PI,
      { noBake: true, noAO: true },
    );
    C.glow(0, 3.12, 29.7, 0xff3020, 0.5, { dayFactor: 1 });
    for (let z = 20.5; z < 30; z += 3) {
      A.sconce(C, -2.95, 2.2, z, Math.PI / 2, { r: 4.5, i: 0.75 });
      A.sconce(C, 2.95, 2.2, z, -Math.PI / 2, { r: 4.5, i: 0.75 });
    }
    const memSign = T.sign(
      "mem",
      ["MEMBERS ONLY", "TRADING FLOOR ▲"],
      { bg: "#10181c", fg: "#e8c860", size: 52 },
      512,
      128,
    );
    b.quad(memSign, 0, 2.9, Z1 + 0.62, 2.4, 0.6, Math.PI);
    const outSign = T.sign(
      "out",
      ["EXIT", "FRONT HALL · BROAD STREET ▸"],
      { bg: "#10181c", fg: "#e8c860", size: 52 },
      512,
      128,
    );
    b.quad(outSign, -2.9, 2.4, 28.6, 1.6, 0.4, Math.PI / 2);
    C.prop("skeleton", 1.8, 0, 24, -1.2, { pose: "sitting", collide: false });

    // ==============================================================
    // BOARD ROOM (x 4.3..24, z -38..-22.6, floor 5.5)
    // ==============================================================
    const RX0 = 4.3,
      RX1 = 24,
      RZ0 = -38,
      RZ1 = -22.6,
      RH = BY + 6;
    C.col(RX0, 0, RZ0, RX1, BY, RZ1, {});
    A.floor(C, "carpet_red", RX0, RZ0, RX1, RZ1, BY + 0.01, {
      col: false,
      th: 0.05,
    });
    A.wall(
      C,
      "wood_dark",
      { x0: RX0, x1: RX1, z: RZ0 - 0.15 },
      BY,
      RH,
      0.3,
      [],
    );
    A.wall(
      C,
      "wood_dark",
      { z0: RZ0, z1: RZ1, x: RX1 + 0.15 },
      BY,
      RH,
      0.3,
      [],
    );
    A.wall(
      C,
      "wood_dark",
      { z0: RZ0, z1: RZ1, x: RX0 - 0.15 },
      BY,
      RH,
      0.3,
      [{ a: -36.5, b: -34.3, top: BY + 2.6 }],
      { casing: "gold" },
    );
    A.ceil(C, "plaster_warm", RX0, RZ0, RX1, RZ1, RH);
    b.flat(T.sunburst, 14.15, RH - 0.02, -30.3, 12, 12, 0, {
      rx: Math.PI,
      noAO: true,
    });
    b.torus("gold", 14.15, RH - 0.05, -30.3, 6.05, 0.1, { ts: 48 });
    F.table(C, 14.15, BY, -30.3, 11, 2.4, 0, { key: "wood_dark", h: 0.8 });
    for (let k = 0; k < 5; k++)
      for (const s of [-1, 1])
        F.chair(C, 10 + k * 2.1, BY, -30.3 + s * 1.6, s > 0 ? 0 : Math.PI, {
          key: "wood_dark",
          seat: "leather",
          toppled: k === 3 && s > 0,
        });
    for (let i = 0; i < 4; i++)
      F.frame(
        C,
        T.portraits,
        7.5 + i * 4.3,
        BY + 3.2,
        RZ0 + 0.05,
        1.4,
        2.6,
        0,
        { uvRect: [i * 0.25, 0, i * 0.25 + 0.25, 1] },
      );
    // the original stock ticker under a glass bell
    b.cyl("wood_dark", 22.5, BY, -24.2, 0.4, 0.45, 1.0, 12);
    b.cyl("brass", 22.5, BY + 1.0, -24.2, 0.22, 0.28, 0.25, 10);
    b.sphere("glass", 22.5, BY + 1.35, -24.2, 0.36, {
      sy: 1.3,
      pl: Math.PI / 2,
    });
    b.rod("paper", [22.5, BY + 1.2, -24.2], [22.9, BY + 0.3, -23.9], 0.012);
    C.col(22.05, BY, -24.65, 22.95, BY + 1.5, -23.75, { walkable: false });
    for (const x of [8, 20])
      A.chandelier(C, x, RH - 1.4, -30.3, RH, 0.9, { light: false });
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++)
        C.prop(
          "skeleton",
          12 + k * 2.1,
          BY + 0.25,
          -30.3 + s * 1.6,
          s > 0 ? 0 : Math.PI,
          { pose: "seated", collide: false },
        );
    F.desk(C, 22, BY, -35.5, 2.4, 1.0, -Math.PI / 2, { key: "wood_dark" });
    C.prop("terminal", 21.9, BY + 0.77, -35.5, -Math.PI / 2, {
      terminalId: "li_nyse_board",
      mount: "bare",
    });
    C.prop("safe", 23.4, BY, -37.3, -Math.PI / 2, {
      loot: "raider_boss",
      locked: 0,
      lock: LI.LOCKS.nyse_gov_safe,
      owner: "raiders",
      name: "Governors' Safe",
    });
    const brSign = T.sign(
      "br",
      ["BOARD OF GOVERNORS", "NEW YORK STOCK EXCHANGE"],
      { bg: "#1a120a", fg: "#e8c860", border: "#e8c860", size: 44 },
      512,
      128,
    );
    b.quad(brSign, 14, BY + 3.4, RZ1 - 0.16, 2.6, 0.65, Math.PI);

    // ==============================================================
    // STRONGROOM STAIR + EXCHANGE STRONGROOM (y 0)
    // ==============================================================
    A.stairs(C, "concrete", 1.4, -24, "n", 2.4, 0, BY, { nose: "metal_dark" });
    A.floor(C, "concrete", -0.2, -38, 4.1, -31.5, BY, { th: 0.3 });
    A.floor(C, "concrete", -0.2, -31.5, 4.1, -22.6, 0.02, { col: false });
    A.wall(C, "concrete", { z0: -38, z1: -22.6, x: 4.25 }, 0, BY, 0.3, []);
    A.wall(C, "concrete", { z0: -38, z1: -22.6, x: -0.35 }, 0, RH, 0.3, [
      { a: -26.2, b: -24, top: 2.6 },
    ]);
    A.wall(C, "concrete", { x0: -0.5, x1: 4.4, z: -38.15 }, 0, RH, 0.3, []);
    A.ceil(C, "concrete_dark", -0.5, -38, 4.4, -22.6, RH);
    b.box("iron", 0.1, 0, -24, 0.2, BY + 1, -23.9);
    const VX0 = -20,
      VX1 = -0.5,
      VZ0 = -38,
      VZ1 = -22.6,
      VH = 4.4;
    A.floor(C, "metal", VX0, VZ0, VX1, VZ1, 0.02, { col: false });
    A.ceil(C, "concrete", VX0, VZ0, VX1, VZ1, VH);
    A.wall(C, "concrete", { x0: VX0, x1: VX1, z: VZ0 - 0.15 }, 0, VH, 0.3, []);
    A.wall(C, "concrete", { z0: VZ0, z1: VZ1, x: VX0 - 0.15 }, 0, VH, 0.3, []);
    // the round strongroom door, closed across the opening (swings open on its hinge when unlocked)
    const vdoor = new THREE.Group();
    vdoor.position.set(-0.55, 1.3, -23.95);
    C.root.add(vdoor);
    const disk = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.25, 0.5, 28),
      LI.mat("steel"),
    );
    disk.rotation.z = Math.PI / 2;
    disk.position.set(-0.25, 0, -1.2);
    vdoor.add(disk);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12),
      LI.mat("chrome"),
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.set(0.05, 0, -1.2);
    vdoor.add(hub);
    for (let k = 0; k < 3; k++) {
      const sp = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 1.6, 0.08),
        LI.mat("chrome"),
      );
      sp.position.set(0.12, 0, -1.2);
      sp.rotation.x = (k / 3) * Math.PI;
      vdoor.add(sp);
    }
    C.strong = {
      door: vdoor,
      col: C.col(-1.3, 0, -26.3, -0.2, 2.6, -23.9, {
        walkable: false,
        surface: "metal",
      }),
      open: false,
    };
    // deposit boxes, gold, bonds
    for (const z of [VZ0 + 0.3, VZ1 - 0.3])
      for (let x = VX0 + 1; x < VX1 - 2; x += 1.2)
        for (let y = 0.2; y < 3.6; y += 0.5)
          b.box("steel", x, y, z - 0.15, x + 1.1, y + 0.45, z + 0.15);
    for (let x = VX0 + 0.5; x < VX1 - 1.6; x += 1.2) {
      C.col(x, 0, VZ0, x + 1.2, 3.7, VZ0 + 0.45, { walkable: false });
      C.col(x, 0, VZ1 - 0.45, x + 1.2, 3.7, VZ1, { walkable: false });
    }
    F.table(C, -10, 0, -30.3, 4, 1.4, 0, { key: "metal_dark", h: 0.9 });
    for (let i = 0; i < 9; i++)
      b.box(
        "gold",
        -11.4 + (i % 3) * 0.32,
        0.9 + Math.floor(i / 3) * 0.1,
        -30.6 + (i % 2) * 0.35,
        -11.15 + (i % 3) * 0.32,
        0.98 + Math.floor(i / 3) * 0.1,
        -30.45 + (i % 2) * 0.35,
      );
    b.box("paper", -9.2, 0.9, -30.7, -8.4, 1.05, -30.1, { c: 0xd8d0a8 });
    C.prop("safe", -19.4, 0, -36.8, Math.PI / 2, {
      items: [
        ["li_trader_jacket", 1],
        ["stock_certificate", 4],
        ["old_dollars", 6],
        ["book_pushcart_king", 1],
      ],
      locked: 0,
      lock: LI.LOCKS.nyse_box_1929,
      owner: "raiders",
      name: "Deposit Box 1929",
    });
    C.prop("skeleton", -16, 0, -25, 2.2, { pose: "sitting", collide: false });
    // barred emergency exit back onto the trading floor (opens from inside)
    b.box("rust", -11.1, 0, -22.75, -8.9, 2.6, -22.55);
    C.anchor("bar_door", -10, 0, -23.3, 0);
    C.exitBar = {
      col: C.col(-11.2, 0, -22.8, -8.8, 2.7, -22.2, {
        walkable: false,
        surface: "metal",
      }),
    };
    const bars = new THREE.Group();
    C.root.add(bars);
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.14, 0.14),
        LI.mat("iron"),
      );
      m.position.set(-10, 0.7 + k * 0.7, -22.95);
      bars.add(m);
    }
    C.exitBar.mesh = bars;
    const exitSign = T.sign(
      "exit",
      ["EMERGENCY EXIT", "BARRED — OPEN FROM STRONGROOM SIDE"],
      { bg: "#300806", fg: "#ff5a40", size: 44 },
      512,
      128,
    );
    b.quad(exitSign, -10, 3.0, -22.05, 2.2, 0.55, Math.PI);

    // ==============================================================
    // doors + anchors
    // ==============================================================
    const WD = { x: 8.5, z: 841.55 };
    C.door({
      pos: C.W(0, 1.3, 29.6),
      label: "The Exchange — Front Hall",
      verb: "Exit",
      radius: 1.4,
      target: { x: WD.x, y: 0.06, z: 839.7, yaw: 0 },
      id: "li_nyse_out",
    });
    C.anchor("entrance", 0, 0, 26.5, 0);
    C.anchor("boss", 0, BY, -18.1, Math.PI);
    C.anchor("pit", PX, 0, PZ, 0);
    C.anchor("captive", 20, 0, -4, -Math.PI / 2);
    C.anchor("spawn1", -6, 0, 12, 0);
    C.anchor("spawn2", 12, 0, -14, 0);
    C.anchor("spawn3", -12, 0, -14, 0);
    C.anchor("spawn4", 20, BY, -20.5, Math.PI / 2);
    C.anchor("spawn5", -12, BY, -20.5, -Math.PI / 2);
    C.anchor("spawn6", 14, BY, -28, Math.PI);
    C.anchor("loot1", -25.5, 0, 15.8);
    C.anchor("loot2", 23.4, BY, -37.3);
    C.anchor("loot3", -19.4, 0, -36.8);
    C.anchor("spare_key", -9.4, 1.26, 13.5);
    C.pickup("li_note_margin_call", 1, -17.3, 1.27, -12.4, 0.5);
    C.pickup("li_reel_closing_bell", 1, 0.2, BY + 1.16, -18.55, 0);
    C.pickup("gold_bar", 1, -10.6, 0.92, -29.9, 0.2);
    C.pickup("gold_bar", 1, -10.2, 0.92, -29.9, 0.5);
    C.pickup("old_dollars", 3, -8.8, 1.06, -30.4, 0);
    C.pickup("li_note_board_minutes", 1, 13.0, BY + 0.81, -30.0, 0.4);
    C.pickup("rally_tonic", 2, 26.0, 1.25, 12.0, 0);
    C.finish();

    // ==============================================================
    // WORLD: the steel door in the back wall of The Exchange's front hall
    // ==============================================================
    const Wc = LI.cell("nyse_world", { world: true });
    const wb = Wc.b;
    wb.ambient(0x3a3026, 1);
    wb.light(WD.x, 2.6, WD.z - 1.2, 0xffc070, 5, 0.8);
    wb.box("iron", WD.x - 1.3, 0.06, WD.z - 0.12, WD.x + 1.3, 2.9, WD.z + 0.2);
    wb.box(
      "steel",
      WD.x - 1.1,
      0.06,
      WD.z - 0.18,
      WD.x - 0.02,
      2.7,
      WD.z - 0.1,
    );
    wb.box(
      "steel",
      WD.x + 0.02,
      0.06,
      WD.z - 0.18,
      WD.x + 1.1,
      2.7,
      WD.z - 0.1,
    );
    for (const s of [-1, 1])
      wb.box(
        "brass",
        WD.x + s * 0.2 - 0.03,
        1.1,
        WD.z - 0.25,
        WD.x + s * 0.2 + 0.03,
        1.5,
        WD.z - 0.18,
      );
    const wsign = LI.texMat(
      "nyse_wsign",
      LI.signTex(
        "nyse_wsign",
        ["TRADING FLOOR", "▸ THE PIT ◂"],
        {
          bg: "#6a6456",
          fg: "#f2d64a",
          size: 56,
          font: "bold %spx Impact, sans-serif",
        },
        512,
        160,
      ),
      { rough: 0.8 },
    );
    wb.quad(wsign, WD.x, 3.35, WD.z - 0.22, 2.6, 0.8, Math.PI);
    // caged work lamp over the door on a bent conduit (a real pool of light when the player is near, day or night)
    wb.rod(
      "iron",
      [WD.x + 1.5, 2.95, WD.z - 0.05],
      [WD.x + 1.5, 2.95, WD.z - 0.55],
      0.015,
    );
    wb.rod(
      "iron",
      [WD.x + 1.5, 2.95, WD.z - 0.55],
      [WD.x + 1.5, 2.75, WD.z - 0.55],
      0.01,
    );
    wb.cyl("rust", WD.x + 1.5, 2.46, WD.z - 0.55, 0.1, 0.12, 0.08, 8);
    wb.cyl("lamp_amber", WD.x + 1.5, 2.54, WD.z - 0.55, 0.08, 0.09, 0.2, 8);
    wb.cyl("rust", WD.x + 1.5, 2.74, WD.z - 0.55, 0.05, 0.1, 0.06, 8);
    Wc.glow(WD.x + 1.5, 2.6, WD.z - 0.6, 0xffb060, 0.7, {
      fixture: true,
      intensity: 1.1,
      range: 7,
      flicker: 0.15,
      dayFactor: 0.4,
    });
    Wc.door({
      pos: new THREE.Vector3(WD.x, 1.3, WD.z - 0.3),
      label: "NYSE Trading Floor — The Pit",
      verb: "Enter",
      radius: 1.3,
      target: { x: C.O.x, y: 0, z: C.O.z + 26.5, yaw: 0 },
      id: "li_nyse_in",
    });
    Wc.finish();
    return C;
  }

