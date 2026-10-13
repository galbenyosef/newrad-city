// play-inline-206 04 — ctx
// Lines 974-3043 of readable/play-inline-206.pretty.js (statement-aligned).
  function buildInterior(cell, ext) {
    const O = cell.origin,
      ox = O.x,
      oy = O.y + BASE,
      oz = O.z;
    const X = (x) => ox + x,
      Z = (z) => oz + z;
    const P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    const A = (x, y, z, yaw) => PF.anchor(ox + x, oy + y, oz + z, yaw || 0);
    const anchors = {};
    const root = cell.root;
    const r = PF.rng("fed_int");
    const W = (key, ax, a0, a1, f0, f1, y0, y1, gaps, o) =>
      PF.wall(
        b,
        key,
        ax,
        ax === "x" ? X(a0) : Z(a0),
        ax === "x" ? X(a1) : Z(a1),
        ax === "x" ? Z(f0) : X(f0),
        ax === "x" ? Z(f1) : X(f1),
        oy + y0,
        oy + y1,
        (gaps || []).map((g) => ({
          c: ax === "x" ? X(g.c) : Z(g.c),
          w: g.w,
          y0: oy + g.y0,
          h: g.h,
        })),
        o,
      );
    const floor = (key, x0, z0, x1, z1, y, t, o) => {
      b.boxMM(
        key,
        X(x0),
        oy + y - (t || 0.5),
        Z(z0),
        X(x1),
        oy + y,
        Z(z1),
        o || { grime: 0.5 },
      );
      PF.colMM(X(x0), oy + y - (t || 0.5), Z(z0), X(x1), oy + y, Z(z1));
    };
    const ceil = (key, x0, z0, x1, z1, y, o) =>
      b.boxMM(
        key,
        X(x0),
        oy + y,
        Z(z0),
        X(x1),
        oy + y + 0.4,
        Z(z1),
        o || { seg: false, grime: 0.3 },
      );

    // ---------------- lights ----------------
    const L = [];
    // banking hall: soft coffer bounce (high, wide), the two chandeliers still on emergency power, grey daylight
    // falling through the clerestory lunettes on both side walls, and a warm pool in the vestibule.
    for (let x = -12; x <= 12; x += 8)
      for (let z = 2; z <= 18; z += 8)
        L.push({
          x: X(x),
          y: oy + 9.5,
          z: Z(z),
          color: 0xffe8c0,
          r: 17,
          i: 0.42,
        });
    for (const [x, z] of [
      [8, 5],
      [-8, 16],
    ])
      L.push({
        x: X(x),
        y: oy + 8.2,
        z: Z(z),
        color: 0xffd8a0,
        r: 12,
        i: 0.95,
      });
    for (const sx of [-1, 1])
      for (let i = 0; i < 6; i++)
        L.push({
          x: X(sx * 13.5),
          y: oy + 7.5,
          z: Z(0.5 + i * 3.6),
          color: 0xb8c8d8,
          r: 9,
          i: 0.4,
        });
    L.push({ x: X(0), y: oy + 6.5, z: Z(0), color: 0xffe0b0, r: 10, i: 0.55 }); // over the clock & frieze
    L.push({ x: X(0), y: oy + 4.2, z: Z(24), color: 0xfff0d8, r: 10, i: 0.75 });
    L.push({ x: X(0), y: oy + 3, z: Z(-6), color: 0xff4030, r: 7, i: 0.55 }); // checkpoint red
    L.push({ x: X(9), y: oy + 2.6, z: Z(-7), color: 0x60ff90, r: 7, i: 0.55 }); // security office CRTs
    L.push({ x: X(-9), y: oy + 3, z: Z(-7), color: 0xd8e0ff, r: 7, i: 0.35 }); // records
    L.push({ x: X(0), y: oy + 3, z: Z(-14), color: 0xffe0b0, r: 8, i: 0.5 }); // elevator lobby
    L.push({
      x: X(10),
      y: oy + 2.6,
      z: Z(-14),
      color: 0xffe0b0,
      r: 7,
      i: 0.35,
    });
    for (let y = -22; y <= -2; y += 5)
      L.push({
        x: X(19),
        y: oy + y + 2.5,
        z: Z(-18),
        color: 0xff6040,
        r: 8,
        i: 0.45,
      }); // stair emergency lights
    // vault level
    L.push({
      x: X(0),
      y: oy + VY + 3,
      z: Z(-14),
      color: 0xffe0b0,
      r: 8,
      i: 0.5,
    });
    for (let z = -38; z <= -20; z += 6)
      L.push({
        x: X(0),
        y: oy + VY + 3,
        z: Z(z),
        color: 0xd0e0ff,
        r: 7,
        i: 0.5,
      });
    L.push({
      x: X(-7),
      y: oy + VY + 2.6,
      z: Z(-29),
      color: 0xffd8a0,
      r: 7,
      i: 0.4,
    });
    L.push({
      x: X(6),
      y: oy + VY + 2.6,
      z: Z(-29),
      color: 0x60ff90,
      r: 7,
      i: 0.6,
    });
    for (const [x, z] of [
      [-6, -44],
      [6, -44],
      [-6, -55],
      [6, -55],
    ])
      L.push({
        x: X(x),
        y: oy + VY + 6,
        z: Z(z),
        color: 0xd8e4ff,
        r: 11,
        i: 0.45,
      });
    L.push({
      x: X(0),
      y: oy + VY + 3,
      z: Z(-58),
      color: 0xff3020,
      r: 9,
      i: 0.5,
    });
    for (let x = -14; x <= 14; x += 7)
      for (let z = -88; z <= -66; z += 7)
        L.push({
          x: X(x),
          y: oy + VY + 4.2,
          z: Z(z),
          color: 0xffe0a8,
          r: 9,
          i: 0.52,
        });
    L.push({
      x: X(0),
      y: oy + VY + 2.6,
      z: Z(-95),
      color: 0xffd090,
      r: 7,
      i: 0.6,
    });
    L.push({
      x: X(12),
      y: oy + VY + 2.5,
      z: Z(-34),
      color: 0xff6040,
      r: 8,
      i: 0.35,
    });
    L.push({
      x: X(25),
      y: oy - 15 + 2.4,
      z: Z(-19),
      color: 0xffb070,
      r: 7,
      i: 0.5,
    });
    const b = PF.batch("fed_int");
    b.ground = oy + VY;
    b.aoH = 3;
    b.setLights(L, 0x9098a8, 0.13);

    // =========================== GROUND FLOOR ===========================
    // vestibule x -5..5, z 20..28
    floor("marble", -5, 20, 5, 28.6, 0);
    W("fed_stone", "x", -5.6, 5.6, 28, 28.6, 0, 6, [
      { c: 0, w: 3.0, y0: 0, h: 3.6 },
    ]);
    PF.exitDoor(b, X(0), oy, Z(28.2), PI, 3.0, 3.6, {
      key: "bronze",
      frame: "bronze",
    }); // the street doors, daylight in the lites
    W("fed_stone", "z", 20, 28.6, -5.6, -5, 0, 6);
    W("fed_stone", "z", 20, 28.6, 5, 5.6, 0, 6);
    ceil("plaster_w", -5, 20, 5, 28, 5.6);
    // revolving door drum (wrecked) and bronze doors
    b.cyl("bronze", X(0), oy, Z(25.5), 1.4, 1.4, 0.15, 16, { hSeg: 1 });
    b.cyl("bronze", X(0), oy + 3.0, Z(25.5), 1.4, 1.4, 0.25, 16, { hSeg: 1 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.4;
      b.box(
        "glass_broken",
        X(Math.cos(a) * 0.65),
        oy + 0.15,
        Z(25.5 + Math.sin(a) * 0.65),
        1.3,
        2.8,
        0.04,
        { ry: -a, seg: false },
      );
    }
    b.box("bronze", X(0), oy + 0.15, Z(25.5), 0.12, 2.85, 0.12, { seg: false });
    PF.col(X(0), Z(25.5), 0.3, 0.3, oy, oy + 3, 0, { walkable: false });
    anchors.entrance = A(0, 0, 23.4, 0); // in front of the wrecked revolving drum, looking straight through the arch into the banking hall
    PF.door({
      id: "pf_fed_exit",
      pos: P(0, 1.6, 27.8),
      label: "Liberty Street",
      verb: "Exit",
      radius: 1.5,
      target: { x: ext.entrance.x, y: 0.05, z: ext.entrance.z, yaw: 0 },
      sound: "door_open",
    }); // face north, away from the portal
    const vestSign = PF.texMat(
      "fed_vest",
      PF.signTex(
        "fed_vest",
        ["ALL VISITORS MUST", "PRESENT IDENTIFICATION", "AT THE SECURITY DESK"],
        "enamel",
        512,
        256,
        { bg: "#1e2a24", fg: "#d8c890" },
      ),
    );
    b.quad(vestSign, X(4.95), oy + 2.2, Z(23), 1.6, 0.8, { ry: -HP });

    // banking hall x -16..16, z -2..20, H 12
    floor("marble_floor", -16, -2, 16, 20, 0);
    W("fed_stone", "x", -16.6, 16.6, 20, 20.6, 0, 12, [
      { c: 0, w: 4, y0: 0, h: 4.4 },
    ]);
    W("fed_stone", "z", -2.6, 20.6, -16.6, -16, 0, 12);
    W("fed_stone", "z", -2.6, 20.6, 16, 16.6, 0, 12);
    // coffered ceiling
    ceil("plaster_w", -16, -2, 16, 20, 12);
    for (let x = -16; x <= 16; x += 4)
      b.box("fed_stone", X(x), oy + 11.2, Z(9), 0.6, 0.8, 22, {
        seg: false,
        grime: 0.2,
      });
    for (let z = -2; z <= 20; z += 4)
      b.box("fed_stone", X(0), oy + 11.2, Z(z), 32, 0.8, 0.6, {
        seg: false,
        grime: 0.2,
      });
    for (let x = -14; x <= 14; x += 4)
      for (let z = 0; z <= 18; z += 4)
        b.box("gilt", X(x), oy + 11.95, Z(z), 0.5, 0.05, 0.5, { seg: false });
    // Florentine blind arcade on the side walls + clerestory lunettes
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const z = 0.5 + i * 3.6;
        b.box("fed_rust", X(sx * 15.7), oy, Z(z - 1.8), 0.7, 7.6, 0.8, {
          seg: false,
          grime: 0.4,
        });
        archWindow(
          b,
          X(sx * 15.95),
          oy + 1.2,
          Z(z),
          sx > 0 ? -HP : HP,
          2.2,
          5.6,
          { glass: "wallpaper_g", frame: "fed_stone" },
        );
        b.add("lamp_blue", PF.shapeGeo(roundShape(2.0, 1.6), 8), {
          m: PF.m4(X(sx * 15.97), oy + 8.6, Z(z), sx > 0 ? -HP : HP),
          uv: "keep",
          noAO: true,
        });
      }
      b.box("fed_rust", X(sx * 15.7), oy, Z(19.3), 0.7, 7.6, 0.8, {
        seg: false,
      });
    }
    // teller line (z 1.4..2.2) with brass grille cages, gap for the staff gate at x -1..1
    for (const [x0, x1] of [
      [-15.4, -1.2],
      [1.2, 15.4],
    ]) {
      b.boxMM("marble_dark", X(x0), oy, Z(1.4), X(x1), oy + 1.15, Z(2.2), {
        grime: 0.4,
      });
      b.boxMM(
        "marble",
        X(x0 - 0.05),
        oy + 1.15,
        Z(1.3),
        X(x1 + 0.05),
        oy + 1.25,
        Z(2.3),
        { seg: false },
      );
      PF.colMM(X(x0), oy, Z(1.4), X(x1), oy + 2.8, Z(2.2), { walkable: false });
      for (let x = x0 + 0.1; x < x1; x += 0.16)
        b.box("brass", X(x), oy + 1.25, Z(1.8), 0.025, 1.5, 0.025, {
          seg: false,
          grime: 0.2,
        });
      b.boxMM("brass", X(x0), oy + 2.7, Z(1.72), X(x1), oy + 2.8, Z(1.88), {
        seg: false,
      });
      for (let x = x0 + 1.4; x < x1 - 0.5; x += 2.8) {
        b.boxMM(
          "marble",
          X(x - 0.35),
          oy + 1.25,
          Z(1.5),
          X(x + 0.35),
          oy + 1.6,
          Z(2.1),
          { seg: false },
        ); // teller window gap frame
        const plate = PF.texMat(
          "fed_teller",
          PF.signTex("fed_teller", ["TELLER"], "enamel", 256, 64, {
            bg: "#1e2a24",
            fg: "#d8c890",
          }),
        );
        b.quad(plate, X(x), oy + 2.45, Z(2.3), 0.7, 0.18, {});
      }
    }
    // staff gate (half door, swung open)
    b.box("mahogany", X(-0.3), oy, Z(1.0), 0.06, 1.1, 1.2, {
      ry: 0.6,
      seg: false,
    });
    // behind the counter: desks, coin counters, a dead teller-bot
    for (let x = -13; x <= 13; x += 5.2) {
      if (Math.abs(x) < 2) continue;
      b.box("mahogany", X(x), oy, Z(-0.6), 1.6, 0.78, 0.8, {
        seg: false,
        grime: 0.5,
      });
      D.monitor(b, X(x + 0.3), oy + 0.78, Z(-0.7), 0, false);
      PF.col(X(x), Z(-0.6), 1.6, 0.8, oy, oy + 0.8, 0, { walkable: false });
    }
    // check-writing islands + the eagle seal mosaic
    for (const [x, z] of [
      [-7, 9],
      [7, 9],
      [-7, 15],
      [7, 15],
    ]) {
      b.box("marble_dark", X(x), oy, Z(z), 3.4, 1.05, 1.2, {
        seg: false,
        grime: 0.4,
      });
      b.box("marble", X(x), oy + 1.05, Z(z), 3.6, 0.08, 1.4, { seg: false });
      b.cyl("brass", X(x), oy + 1.13, Z(z), 0.04, 0.04, 0.5, 5, { hSeg: 1 });
      b.sphere("lamp_warm", X(x), oy + 1.65, Z(z), 0.12, { ws: 6, hs: 4 });
      PF.col(X(x), Z(z), 3.6, 1.4, oy, oy + 1.13, 0, { walkable: false });
      D.papers(b, X(x), oy + 1.14, Z(z), 1.0, 5, x * 7 + z);
    }
    const eagleK = PF.texMat(
      "fed_eagle_floor",
      PF.canvasTex(
        "pf_fed_eagle_floor",
        512,
        512,
        (ctx, w) => {
          ctx.fillStyle = "#c8b890";
          ctx.fillRect(0, 0, w, w);
          ctx.fillStyle = "#6a2a1c";
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 6, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#d8c8a0";
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 40, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#2a2a3a";
          const cx = w / 2;
          for (const sg of [-1, 1]) {
            // spread wings: stacked feather strokes
            for (let f = 0; f < 7; f++) {
              ctx.beginPath();
              ctx.moveTo(cx + sg * 30, 230 + f * 6);
              ctx.quadraticCurveTo(
                cx + sg * (90 + f * 12),
                150 + f * 14,
                cx + sg * (175 - f * 8),
                150 + f * 28,
              );
              ctx.lineTo(cx + sg * (160 - f * 8), 175 + f * 28);
              ctx.quadraticCurveTo(
                cx + sg * (80 + f * 10),
                190 + f * 14,
                cx + sg * 30,
                262 + f * 5,
              );
              ctx.closePath();
              ctx.fill();
            }
          }
          ctx.beginPath();
          ctx.ellipse(cx, 255, 40, 70, 0, 0, TAU);
          ctx.fill(); // body
          ctx.beginPath();
          ctx.arc(cx, 165, 26, 0, TAU);
          ctx.fill(); // head
          ctx.beginPath();
          ctx.moveTo(cx + 20, 160);
          ctx.lineTo(cx + 44, 172);
          ctx.lineTo(cx + 20, 178);
          ctx.fill(); // beak
          ctx.beginPath();
          ctx.moveTo(cx - 40, 320);
          ctx.lineTo(cx, 360);
          ctx.lineTo(cx + 40, 320);
          ctx.fill(); // tail
          ctx.fillStyle = "#8a2a20";
          ctx.fillRect(cx - 26, 225, 52, 56); // shield
          ctx.fillStyle = "#d8c8a0";
          for (let k = 0; k < 4; k++)
            ctx.fillRect(cx - 22 + k * 12, 240, 6, 38);
          ctx.fillStyle = "#26345a";
          ctx.fillRect(cx - 26, 225, 52, 15);
          ctx.strokeStyle = "#2a2a3a";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cx - 90, 300);
          ctx.lineTo(cx - 40, 285);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 40, 285);
          ctx.lineTo(cx + 95, 305);
          ctx.stroke();
          ctx.fillStyle = "#a88838";
          ctx.font = "bold 30px Georgia";
          ctx.textAlign = "center";
          ctx.fillText("IN GOLD WE TRUST", w / 2, w - 70);
          for (let i = 0; i < 2500; i++) {
            ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.25 + ")";
            ctx.fillRect(Math.random() * w, Math.random() * w, 3, 3);
          }
        },
        { clamp: true },
      ),
      { rough: 0.5 },
    );
    b.quad(eagleK, X(0), oy + 0.02, Z(12), 6, 6, { rx: -HP, grime: 0.3 });
    // chandeliers (iron rings with dead bulbs), two still glowing on emergency power
    for (const [x, z, lit] of [
      [-8, 5, false],
      [8, 5, true],
      [-8, 16, true],
      [8, 16, false],
    ]) {
      b.cyl("iron", X(x), oy + 8.4, Z(z), 0.02, 0.02, 3.6, 3, { hSeg: 1 });
      b.add("brass", new THREE.TorusGeometry(1.1, 0.06, 5, 18), {
        m: PF.m4(X(x), oy + 8.4, Z(z), 0, HP),
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.sphere(
          lit ? "lamp_warm" : "glass_broken",
          X(x + Math.cos(a) * 1.1),
          oy + 8.55,
          Z(z + Math.sin(a) * 1.1),
          0.08,
          { ws: 5, hs: 4 },
        );
      }
      if (lit)
        PF.glow(P(x, 8.5, z), 0xffe0b0, 2.6, root, {
          intensity: 0.9,
          flicker: 0.1,
        });
    }
    // the centre chandelier came down: bent ring on the floor, chain coiled beside it, shattered bulbs & plaster
    b.add("brass", new THREE.TorusGeometry(1.1, 0.06, 5, 18), {
      m: PF.m4(X(0.4), oy + 0.12, Z(9.6), 0.3, HP - 0.18, 0.1),
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      b.sphere(
        "glass_broken",
        X(0.4 + Math.cos(a) * 1.1),
        oy + 0.12 + Math.sin(a) * 0.19,
        Z(9.6 + Math.sin(a) * 1.08),
        0.08,
        { ws: 5, hs: 4 },
      );
    }
    b.cyl("iron", X(0), oy + 8.4, Z(10), 0.02, 0.02, 3.6, 3, { hSeg: 1 });
    b.beam("iron", P(-0.9, 0.05, 11.2), P(-2.4, 0.05, 12.6), 0.05, 0.05);
    D.rubble(b, X(1.6), oy, Z(8.4), 0.45, 6, 4471);
    for (let i = 0; i < 14; i++)
      b.box(
        "gilt",
        X(-1.5 + ((i * 37) % 30) / 10),
        oy + 0.02,
        Z(8 + ((i * 53) % 36) / 10),
        0.5,
        0.05,
        0.5,
        { ry: i, rx: (i % 3) * 0.2, seg: false },
      ); // fallen coffer rosettes
    // north wall: the Florentine blind arcade continues, pilasters, the great clock over the checkpoint & the name frieze
    for (const x of [-15.3, -11.4, -4, 4, 11.4, 15.3])
      b.box("fed_rust", X(x), oy, Z(-1.65), 0.8, 7.6, 0.7, {
        seg: false,
        grime: 0.4,
      });
    for (const x of [-13.35, -6.3, 6.3, 13.35])
      archWindow(b, X(x), oy + 1.2, Z(-1.96), 0, 2.4, 5.6, {
        glass: "wallpaper_g",
        frame: "fed_stone",
      });
    b.boxMM("fed_rust", X(-16), oy + 7.6, Z(-2), X(16), oy + 8.1, Z(-1.55), {
      seg: false,
      grime: 0.3,
    });
    b.boxMM("fed_stone", X(-16), oy + 10.3, Z(-2), X(16), oy + 10.7, Z(-1.6), {
      seg: false,
      grime: 0.3,
    });
    const friezeK = PF.texMat(
      "fed_frieze",
      PF.signTex(
        "fed_frieze",
        ["FEDERAL RESERVE BANK OF NEW YORK"],
        "engraved",
        2048,
        128,
        { bg: "#b8a888", fg: "#3a3020" },
      ),
    );
    b.quad(friezeK, X(0), oy + 9.2, Z(-1.97), 22, 1.3, { grime: 0.3 });
    const clockK = PF.texMat(
      "fed_clock",
      PF.canvasTex(
        "pf_fed_clock",
        512,
        512,
        (ctx, w) => {
          const c = w / 2;
          ctx.fillStyle = "#6a5a38";
          ctx.fillRect(0, 0, w, w);
          ctx.fillStyle = "#e8dcc0";
          ctx.beginPath();
          ctx.arc(c, c, c - 22, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#a88838";
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.arc(c, c, c - 20, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#2a2418";
          ctx.font = "bold 44px Georgia";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const RN = [
            "XII",
            "I",
            "II",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
            "XI",
          ];
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU - HP;
            ctx.fillText(
              RN[i],
              c + Math.cos(a) * (c - 80),
              c + Math.sin(a) * (c - 80),
            );
          }
          // stopped at 9:47, the moment the bombs fell
          const hand = (a, len, wd) => {
            ctx.lineWidth = wd;
            ctx.beginPath();
            ctx.moveTo(c, c);
            ctx.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
            ctx.stroke();
          };
          ctx.strokeStyle = "#1a1610";
          hand(((9 + 47 / 60) / 12) * TAU - HP, 120, 14);
          hand((47 / 60) * TAU - HP, 185, 8);
          ctx.fillStyle = "#1a1610";
          ctx.beginPath();
          ctx.arc(c, c, 14, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "rgba(30,20,10,0.6)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(c - 40, 70);
          ctx.lineTo(c + 10, 190);
          ctx.lineTo(c - 20, 260);
          ctx.stroke(); // crack
          for (let i = 0; i < 1600; i++) {
            ctx.fillStyle = "rgba(40,30,10," + Math.random() * 0.22 + ")";
            ctx.fillRect(Math.random() * w, Math.random() * w, 3, 3);
          }
        },
        { clamp: true },
      ),
      { rough: 0.6 },
    );
    b.cyl("bronze", X(0), oy + 5.6, Z(-1.75), 1.35, 1.35, 0.3, 24, {
      hSeg: 1,
      rx: HP,
    });
    b.quad(clockK, X(0), oy + 5.6, Z(-1.58), 2.4, 2.4, { grime: 0.2 });
    b.boxMM("bronze", X(-0.9), oy + 6.95, Z(-1.9), X(0.9), oy + 7.3, Z(-1.5), {
      seg: false,
    }); // eagle perch
    b.box("bronze", X(0), oy + 7.3, Z(-1.7), 0.5, 0.7, 0.35, { seg: false });
    for (const sg of [-1, 1])
      b.box("bronze", X(sg * 0.7), oy + 7.45, Z(-1.7), 1.0, 0.12, 0.25, {
        rz: sg * -0.35,
        seg: false,
      });
    // bank notes everywhere: the last crew tore open a cash cart in the middle of the hall
    for (const [x, z, rr, n] of [
      [-3, 13, 3.2, 70],
      [5, 4, 2.4, 40],
      [-10, 4, 2, 26],
      [11, 15, 2.2, 30],
      [0, -1, 1.5, 18],
    ]) {
      const rn = PF.rng("fed_notes" + x + z);
      for (let i = 0; i < n; i++) {
        const a = rn() * TAU,
          d = Math.sqrt(rn()) * rr;
        b.box(
          "money",
          X(x + Math.cos(a) * d),
          oy + 0.012 + rn() * 0.02,
          Z(z + Math.sin(a) * d),
          0.16,
          0.004,
          0.07,
          { ry: rn() * TAU, rx: (rn() - 0.5) * 0.2, seg: false, noAO: true },
        );
      }
    }
    // cash cart tipped on its side (the wheels stick out sideways), lid torn off
    b.box("vault_steel", X(-3.4), oy, Z(13.4), 1.6, 0.8, 0.9, {
      ry: 0.5,
      seg: false,
      grime: 0.6,
    });
    for (const dx of [-0.6, 0.6])
      for (const dy of [0.15, 0.65]) {
        const c5 = Math.cos(0.5),
          s5 = Math.sin(0.5);
        b.cyl(
          "tire",
          X(-3.4 + dx * c5 - 0.5 * s5),
          oy + dy,
          Z(13.4 - dx * s5 - 0.5 * c5),
          0.12,
          0.12,
          0.08,
          8,
          { hSeg: 1, rx: HP, ry: 0.5 },
        );
      }
    b.box("vault_steel", X(-4.6), oy + 0.02, Z(14.6), 1.5, 0.05, 0.85, {
      ry: 1.2,
      rx: 0.08,
      seg: false,
      grime: 0.6,
    });
    PF.col(X(-3.4), Z(13.4), 1.0, 1.7, oy, oy + 0.9, 0.5, { walkable: false });
    // the guards' last stand: sandbags & an overturned desk across the checkpoint arch, spent brass, a riot shield
    for (let i = 0; i < 9; i++) {
      const x = -3.6 + i * 0.9;
      if (Math.abs(x) < 1.0) continue;
      b.box("sandbag", X(x), oy + (i % 2) * 0.02, Z(0.2), 0.85, 0.32, 0.5, {
        ry: ((i % 3) - 1) * 0.08,
        seg: false,
        grime: 0.6,
      });
      b.box("sandbag", X(x + 0.4), oy + 0.32, Z(0.25), 0.8, 0.3, 0.48, {
        ry: 0.1,
        seg: false,
        grime: 0.6,
      });
    }
    PF.colMM(X(-3.9), oy, Z(-0.05), X(-1.0), oy + 0.62, Z(0.45), {
      walkable: false,
    });
    PF.colMM(X(1.0), oy, Z(-0.05), X(4.2), oy + 0.62, Z(0.45), {
      walkable: false,
    });
    D.chair(b, X(-2.2), oy, Z(0.9), 1.2, true, "mahogany");
    for (let i = 0; i < 24; i++)
      b.cyl(
        "brass",
        X(-2.5 + ((i * 29) % 50) / 10),
        oy + 0.015,
        Z(0.8 + ((i * 17) % 20) / 10),
        0.006,
        0.006,
        0.03,
        4,
        { hSeg: 1, rz: HP, ry: i },
      );
    b.box("glass_dark", X(2.3), oy + 0.05, Z(1.0), 0.6, 0.04, 1.0, {
      ry: 0.3,
      rz: 0.2,
      seg: false,
    });
    PF.skeleton(b, X(-1.6), oy + 0.02, Z(-0.4), 0.2);
    // wreckage: toppled robot, raider corpses (they got this far)
    b.rock("rubble", X(-11), oy, Z(12), 1.1, { flat: 0.5 });
    for (const [x, z, a] of [
      [3, 16, 0.6],
      [-4.5, 6, 2.4],
      [11.5, 11, -1.2],
    ])
      PF.skeleton(b, X(x), oy + 0.02, Z(z), a);
    D.papers(b, X(0), oy + 0.01, Z(6), 9, 40, 99);
    anchors.hall = A(0, 0, 10, 0);
    anchors.spawn1 = A(-10, 0, 14, 0);
    anchors.spawn2 = A(10, 0, 6, 0);
    anchors.spawn3 = A(0, 0, -6, 0);

    // ---- checkpoint 1 (x -4..4, z -10..-2): detector arches, booth, locked gate ----
    floor("terrazzo", -4, -10, 4, -2, 0);
    W("fed_stone", "x", -16.6, 16.6, -2.6, -2, 0, 12, [
      { c: 0, w: 3.6, y0: 0, h: 3.4 },
      { c: 9, w: 1.4, y0: 0, h: 2.4 },
      { c: -9, w: 1.4, y0: 0, h: 2.4 },
    ]);
    W("fed_stone", "z", -12, -2.6, -4.6, -4, 0, 4.5);
    W("fed_stone", "z", -12, -2.6, 4, 4.6, 0, 4.5, [
      { c: -6, w: 2.6, y0: 1.0, h: 1.5 },
    ]); // booth window
    ceil("panel", -4, -10, 4, -2, 4.2);
    for (const z of [-4.2, -6.6]) {
      for (const sx of [-1, 1])
        b.box("paint_cream", X(sx * 1.1), oy, Z(z), 0.3, 2.3, 0.6, {
          seg: false,
          grime: 0.5,
        });
      b.box("paint_cream", X(0), oy + 2.3, Z(z), 2.5, 0.3, 0.6, { seg: false });
      PF.col(X(-1.1), Z(z), 0.3, 0.6, oy, oy + 2.3, 0, { walkable: false });
      PF.col(X(1.1), Z(z), 0.3, 0.6, oy, oy + 2.3, 0, { walkable: false });
    }
    b.quad("glass_dark", X(4.02), oy + 1.75, Z(-6), 2.6, 1.5, {
      ry: -HP,
      noAO: true,
    });
    for (const x of [-3, 3]) {
      b.box("rust", X(x), oy, Z(-8.2), 1.6, 1.0, 0.4, { seg: false });
      PF.col(X(x), Z(-8.2), 1.6, 0.4, oy, oy + 1, 0, { walkable: false });
    } // turnstiles (walled)
    const cpK = PF.texMat(
      "fed_cp",
      PF.signTex(
        "fed_cp",
        ["SECURITY CHECKPOINT", "AUTHORIZED PERSONNEL ONLY"],
        "enamel",
        512,
        160,
        { bg: "#7a1c14", fg: "#f0e0c0" },
      ),
    );
    b.quad(cpK, X(0), oy + 3.7, Z(-2.66), 3.2, 1.0, { ry: PI });
    b.quad(cpK, X(0), oy + 3.7, Z(-2.0 + 0.04), 3.2, 1.0, {});
    // checkpoint gate (bars) at z -9.6 — scripted open/close
    const cpGate = barGate(root, X(0), oy, Z(-9.6), 3.6, 3.2, "fed_gate", 0, {
      lock: FED_LOCKS.gate,
      label: "Checkpoint Gate",
    });
    PF.codeReadable(
      P(4.9, 1.6, -6),
      "Card in the Booth Window",
      '"GATE KEYPAD 5107. Do NOT give this to the robots. — R.O."',
      FED_LOCKS.gate.id,
    );
    void cpGate;
    anchors.checkpoint = A(0, 0, -5, 0);
    anchors.turret_cp = A(0, 3.2, -9.9, 0);

    // ---- security office (x 4.6..14, z -11.4..-2.6) ----
    floor("tile_floor", 4.6, -11.4, 16, -2.6, 0);
    W("fed_stone", "z", -12, -2.6, 16, 16.6, 0, 4.5);
    W("fed_stone", "x", 4.6, 16.6, -12, -11.4, 0, 4.5);
    ceil("panel", 4.6, -11.4, 16, -2.6, 4.2);
    // CRT wall + desk
    for (let i = 0; i < 6; i++)
      D.monitor(
        b,
        X(7 + (i % 3) * 0.7),
        oy + 1.2 + Math.floor(i / 3) * 0.5,
        Z(-11.1),
        0,
        i !== 4,
      );
    b.boxMM("panel", X(6.3), oy, Z(-11.4), X(9.6), oy + 1.2, Z(-10.6), {
      seg: false,
    });
    PF.colMM(X(6.3), oy, Z(-11.4), X(9.6), oy + 1.2, Z(-10.6), {
      walkable: false,
    });
    b.box("mahogany", X(12), oy, Z(-8), 2.2, 0.78, 1.0, { seg: false });
    PF.col(X(12), Z(-8), 2.2, 1.0, oy, oy + 0.8, 0, { walkable: false });
    D.chair(b, X(12), oy, Z(-7.1), PI, false, "panel");
    D.fluoro(b, X(10), oy + 3.8, Z(-7), 0, 2.2, true, oy + 4.2);
    anchors.sec_terminal = A(8, 0, -9.8, 0);
    anchors.sec_lockers = A(15.6, 0, -5, -HP);
    anchors.sec_desk = A(12, 0.8, -8, 0);
    anchors.loot1 = A(15.2, 0, -10.6, 0);

    // ---- records room (x -16..-4.6, z -11.4..-2.6), keypad door (code in the Chief's memo) ----
    floor("planks", -16, -11.4, -4.6, -2.6, 0);
    W("fed_stone", "z", -12, -2.6, -16.6, -16, 0, 4.5);
    W("fed_stone", "x", -16.6, -4.6, -12, -11.4, 0, 4.5);
    ceil("panel", -16, -11.4, -4.6, -2.6, 4.2);
    for (let i = 0; i < 6; i++) {
      b.box("panel", X(-15.3), oy, Z(-10.6 + i * 1.3), 0.8, 1.5, 1.0, {
        seg: false,
        grime: 0.5,
      });
      for (let k = 0; k < 4; k++)
        b.box(
          "iron",
          X(-14.88),
          oy + 0.2 + k * 0.35,
          Z(-10.6 + i * 1.3),
          0.02,
          0.05,
          0.3,
          { seg: false },
        );
    }
    PF.colMM(X(-15.8), oy, Z(-11.2), X(-14.8), oy + 1.5, Z(-3.2), {
      walkable: false,
    });
    b.box("mahogany", X(-9), oy, Z(-8.5), 2.4, 0.78, 1.2, { seg: false });
    PF.col(X(-9), Z(-8.5), 2.4, 1.2, oy, oy + 0.8, 0, { walkable: false });
    D.papers(b, X(-9), oy + 0.02, Z(-6), 4, 30, 71);
    for (let i = 0; i < 4; i++)
      b.box(
        "paper",
        X(-9 + (r() - 0.5) * 2),
        oy + 0.8,
        Z(-8.5 + (r() - 0.5) * 0.9),
        0.3,
        0.02,
        0.22,
        { ry: r() * 3, seg: false },
      );
    PF.skeleton(b, X(-7), oy + 0.02, Z(-9.8), 1.9); // the Chief of Security
    anchors.chief = A(-7, 0, -9.8, 0);
    D.fluoro(b, X(-10), oy + 3.8, Z(-7), 0, 2.2, false, oy + 4.2);
    doorBlock(
      root,
      X(-9),
      oy,
      Z(-2.3),
      1.4,
      2.4,
      FED_LOCKS.records,
      "Records Room",
      "fed_records",
    );

    // ---- elevator lobby (x -4..4, z -18..-10) + back corridor to the egress stair ----
    floor("terrazzo", -4, -18, 4, -10, 0);
    W("fed_stone", "x", -4.6, 4.6, -18.6, -18, 0, 5);
    W("fed_stone", "z", -18.6, -10, -4.6, -4, 0, 5, [
      { c: -14, w: 1.8, y0: 0, h: 2.8 },
    ]); // elevator door (west)
    W("fed_stone", "z", -18.6, -12, 4, 4.6, 0, 5, [
      { c: -14, w: 2.2, y0: 0, h: 2.8 },
    ]); // to back corridor
    ceil("panel", -4, -18, 4, -10, 4.6);
    elevatorFront(b, X(-3.98), oy, Z(-14), HP, "VAULT");
    b.box("planks", X(-3.9), oy + 0.4, Z(-16.6), 0.1, 2.2, 1.6, {
      rz: 0.1,
      seg: false,
    }); // boarded second car
    const oooK = PF.texMat(
      "fed_ooo",
      PF.signTex("fed_ooo", ["OUT OF ORDER"], "raider", 256, 96, {
        bg: "#c8c0a8",
        fg: "#1a1a1a",
      }),
    );
    b.quad(oooK, X(-3.82), oy + 1.6, Z(-16.6), 1.1, 0.4, { ry: HP });
    anchors.elevator_up = A(-2.6, 0, -14, -HP);
    // back corridor x 4.6..16, z -16..-12.6
    floor("terrazzo", 4.6, -16, 16, -12, 0);
    W("fed_stone", "x", 4.6, 16, -16.6, -16, 0, 4);
    ceil("panel", 4.6, -16, 16, -12, 3.6);
    D.fluoro(b, X(10), oy + 3.3, Z(-14), HP, 2.0, true, oy + 3.6);

    // ============================ ELEVATOR ============================
    // (a load door pair: the car ride is a fade; the shaft is five levels deep)
    // vault level elevator lobby at the same x/z, VY below
    floor("terrazzo", -4, -18, 4, -10, VY);
    W("vault_dark", "x", -4.6, 4.6, -10, -9.4, VY, VY + 5);
    W("vault_dark", "z", -18.6, -9.4, -4.6, -4, VY, VY + 5, [
      { c: -14, w: 1.8, y0: VY, h: 2.8 },
    ]);
    W("vault_dark", "z", -18.6, -9.4, 4, 4.6, VY, VY + 5);
    W("vault_dark", "x", -4.6, 4.6, -18.6, -18, VY, VY + 5, [
      { c: 0, w: 3.0, y0: VY, h: 3.0 },
    ]);
    ceil("panel", -4, -18, 4, -10, VY + 4.6);
    elevatorFront(b, X(-3.98), oy + VY, Z(-14), HP, "VAULT");
    const lvK = PF.texMat(
      "fed_lv",
      PF.signTex(
        "fed_lv",
        ["LEVEL V — VAULT", "SECURITY CLEARANCE REQUIRED BEYOND THIS POINT"],
        "enamel",
        1024,
        160,
        { bg: "#1e2a24", fg: "#e0c870" },
      ),
    );
    b.quad(lvK, X(0), oy + VY + 3.6, Z(-10.06), 4.4, 0.7, { ry: PI });
    anchors.elevator_down = A(-2.6, VY, -14, -HP);
    const elev = (from, to, label) =>
      PF.use({
        pos: P(-3.7, (from === "up" ? 0 : VY) + 1.5, -14),
        radius: 1.1,
        range: 2.8,
        label,
        verb: () => (PF.flag("fed_power") ? "Ride" : "Call"),
        locked: () => (PF.flag("fed_power") ? null : "No power"),
        onInteract() {
          if (!PF.flag("fed_power")) {
            PF.sfx("door_locked");
            G.notify(
              "The call button is dead. The vault elevator has no power — the security office should control it.",
            );
            return;
          }
          PF.sfx("hum_electric", null, { volume: 0.6 });
          G.fadeTransition(() => {
            const a =
              to === "down" ? anchors.elevator_down : anchors.elevator_up;
            G.player.teleport(a.x, a.y + 0.05, a.z, a.yaw);
            if (to === "down") {
              PF.q.advance(
                "pf_gold",
                ["meet", "enter", "power", "descend"],
                "door",
              );
              PF.sfx("door_open");
            }
          }, 1.2);
        },
      });
    elev("up", "down", "Vault Elevator (Level V)");
    elev("down", "up", "Vault Elevator (Ground Floor)");

    // ============================ VAULT LEVEL ============================
    // checkpoint 2 corridor x -2.5..2.5, z -40..-18 (laser grid at z -25.5)
    floor("vault_dark", -2.5, -40, 2.5, -18, VY);
    W("vault_dark", "z", -40, -18, -3.1, -2.5, VY, VY + 4, [
      { c: -30, w: 1.6, y0: VY, h: 2.6 },
    ]);
    W("vault_dark", "z", -40, -18, 2.5, 3.1, VY, VY + 4, [
      { c: -30, w: 1.6, y0: VY, h: 2.6 },
    ]);
    ceil("vault_dark", -2.5, -40, 2.5, -18, VY + 3.6);
    for (let z = -38; z <= -20; z += 3) {
      b.box("vault_steel", X(-2.45), oy + VY, Z(z), 0.1, 3.6, 0.4, {
        seg: false,
      });
      b.box("vault_steel", X(2.45), oy + VY, Z(z), 0.1, 3.6, 0.4, {
        seg: false,
      });
    }
    for (let z = -38; z <= -20; z += 6)
      D.fluoro(b, X(0), oy + VY + 3.3, Z(z), HP, 1.6, z !== -32, oy + VY + 3.6);
    // yellow/black hazard stripes at the grid
    const hazK = PF.texMat(
      "fed_haz",
      PF.canvasTex("pf_fed_haz", 256, 64, (ctx, w, h) => {
        ctx.fillStyle = "#d8b020";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#141414";
        for (let x = -h; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, h);
          ctx.lineTo(x + 20, h);
          ctx.lineTo(x + 20 + h, 0);
          ctx.lineTo(x + h, 0);
          ctx.fill();
        }
      }),
      { rough: 0.8 },
    );
    b.quad(hazK, X(0), oy + VY + 0.01, Z(-25.5), 5, 0.6, { rx: -HP });
    for (const sx of [-1, 1]) {
      b.box("vault_steel", X(sx * 2.3), oy + VY, Z(-25.5), 0.3, 2.4, 0.4, {
        seg: false,
      });
      b.box(
        "lamp_red",
        X(sx * 2.14),
        oy + VY + 2.2,
        Z(-25.5),
        0.04,
        0.12,
        0.12,
        { seg: false },
      );
    }
    // laser beams (dynamic group, toggled)
    const grid = new THREE.Group();
    grid.name = "pf_fed_grid";
    {
      const gb = PF.batch("fed_grid");
      for (const y of [0.35, 0.75, 1.15, 1.55, 1.95])
        gb.box("laser", 0, y, 0, 4.3, 0.025, 0.025, {
          seg: false,
          noAO: true,
          grime: 0,
        });
      for (const x of [-1.2, 0, 1.2])
        gb.box("laser", x, 0.1, 0, 0.025, 2.1, 0.025, {
          seg: false,
          noAO: true,
          grime: 0,
        });
      gb.build(grid, { noLOD: true, castShadow: false });
      grid.position.set(X(0), oy + VY, Z(-25.5));
      root.add(grid);
    }
    PF.glow(P(0, VY + 1.2, -25.5), 0xff2010, 2.4, grid, {
      intensity: 1.2,
      flicker: 0.2,
    });
    anchors.laser_grid = A(0, VY, -25.5, 0);
    anchors.turret_vault = A(0, VY + 3.1, -39.6, 0);

    // barracks (west, x -12..-3.1, z -36..-24)
    floor("tile_floor", -12, -36, -3.1, -24, VY);
    W("vault_dark", "x", -12.6, -3.1, -36.6, -36, VY, VY + 3.6);
    W("vault_dark", "x", -12.6, -3.1, -24, -23.4, VY, VY + 3.6);
    W("vault_dark", "z", -36.6, -23.4, -12.6, -12, VY, VY + 3.6);
    ceil("panel", -12, -36, -3.1, -24, VY + 3.4);
    for (let i = 0; i < 3; i++) {
      const z = -34.5 + i * 3.2;
      for (const y of [0.35, 1.5]) {
        b.box("iron", X(-10.8), oy + VY + y, Z(z), 2.0, 0.06, 0.9, {
          seg: false,
        });
        b.box("army", X(-10.8), oy + VY + y + 0.06, Z(z), 1.9, 0.14, 0.85, {
          seg: false,
        });
      }
      for (const dz of [-0.42, 0.42])
        for (const dx of [-0.95, 0.95])
          b.box("iron", X(-10.8 + dx), oy + VY, Z(z + dz), 0.05, 2.0, 0.05, {
            seg: false,
          });
      PF.col(X(-10.8), Z(z), 2.0, 0.9, oy + VY, oy + VY + 2.0, 0, {
        walkable: false,
      });
    }
    for (let i = 0; i < 5; i++)
      b.box("army", X(-4.0), oy + VY, Z(-34.8 + i * 0.7), 0.6, 1.9, 0.62, {
        seg: false,
        grime: 0.5,
      });
    PF.colMM(X(-4.3), oy + VY, Z(-35.2), X(-3.7), oy + VY + 1.9, Z(-31.5), {
      walkable: false,
    });
    b.box("panel", X(-7.5), oy + VY, Z(-26), 1.6, 0.76, 0.9, { seg: false });
    D.chair(b, X(-7.5), oy + VY, Z(-26.8), 0.3, true, "panel");
    const cardK = PF.texMat(
      "fed_cards",
      PF.signTex(
        "fed_cards",
        [
          "GIN RUMMY — RUNNING SCORE",
          "PVT. KOWALCZYK 8,114",
          "SGT. BELL 8,112",
          "THE ROBOTS: DO NOT PLAY",
        ],
        "engraved",
        512,
        256,
        { bg: "#d8d0b8", fg: "#2a2418" },
      ),
    );
    b.quad(cardK, X(-3.16), oy + VY + 1.8, Z(-27), 1.2, 0.6, { ry: -HP });
    PF.codeReadable(
      P(-3.5, VY + 1.6, -27),
      "Gin Rummy Scoreboard",
      'SGT. BELL 8,112 — and pencilled under it, in the Sergeant\'s hand: "SAFE = MY SCORE. NOBODY ELSE CAN REMEMBER IT ANYWAY."',
      FED_LOCKS.barracks.id,
    );
    PF.skeleton(b, X(-6.5), oy + VY + 0.02, Z(-28.8), 0.8);
    D.fluoro(b, X(-7.5), oy + VY + 3.1, Z(-30), 0, 2.0, true, oy + VY + 3.4);
    anchors.barracks = A(-7.5, VY, -30, HP);
    anchors.barracks_safe = A(-11.7, VY, -25.2, HP);
    anchors.spawn4 = A(-7.5, VY, -32, 0);

    // vault control room (east, x 3.1..9.4, z -36..-24)
    floor("tile_floor", 3.1, -36, 9.4, -24, VY);
    W("vault_dark", "x", 3.1, 10, -36.6, -36, VY, VY + 3.6);
    W("vault_dark", "x", 3.1, 10, -24, -23.4, VY, VY + 3.6);
    W("vault_dark", "z", -36.6, -23.4, 9.4, 10, VY, VY + 3.6);
    ceil("panel", 3.1, -36, 9.4, -24, VY + 3.4);
    for (let i = 0; i < 9; i++)
      D.monitor(
        b,
        X(5 + (i % 3) * 0.7),
        oy + VY + 1.1 + Math.floor(i / 3) * 0.48,
        Z(-35.7),
        0,
        i % 4 !== 1,
      );
    b.boxMM("panel", X(4.2), oy + VY, Z(-36), X(7.6), oy + VY + 1.1, Z(-35.1), {
      seg: false,
    });
    PF.colMM(X(4.2), oy + VY, Z(-36), X(7.6), oy + VY + 1.1, Z(-35.1), {
      walkable: false,
    });
    // big status board (vault door schematic)
    const schK = PF.texMat(
      "fed_schem",
      PF.canvasTex("pf_fed_schem", 512, 256, (ctx, w, h) => {
        ctx.fillStyle = "#120a02";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#ffb347";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(150, 130, 80, 0, TAU);
        ctx.stroke();
        ctx.strokeRect(126, 60, 48, 140);
        ctx.font = "bold 18px monospace";
        ctx.fillStyle = "#ffc870";
        ctx.fillText("CYLINDER DOOR — 90 TONS", 260, 50);
        ctx.fillText("STATUS: SEALED", 260, 90);
        ctx.fillText("FRAME: 140 TONS", 260, 130);
        ctx.fillText("ROTATION: 90 DEG", 260, 170);
        ctx.fillText("SENTINEL: ACTIVE", 260, 210);
        for (let y = 0; y < h; y += 3) {
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(0, y, w, 1);
        }
      }),
      { emissive: 1.0, noShadow: true },
    );
    b.quad(schK, X(9.38), oy + VY + 1.9, Z(-30), 2.8, 1.4, {
      ry: -HP,
      noAO: true,
    });
    PF.skeleton(b, X(6), oy + VY + 0.02, Z(-27), 2.5); // the vault manager
    D.chair(b, X(6.2), oy + VY, Z(-34.4), PI, false, "panel");
    anchors.vault_terminal = A(6.3, VY, -34.9, 0);
    anchors.control = A(6, VY, -30, 0);
    anchors.spawn5 = A(0, VY, -22, 0);

    // ---- antechamber x -10..10, z -60..-40 (H 8) ----
    floor("vault_dark", -10, -60, 10, -40, VY);
    W("vault_steel", "x", -10.6, 10.6, -40, -39.4, VY, VY + 8, [
      { c: 0, w: 5, y0: VY, h: 3.6 },
    ]);
    W("vault_steel", "z", -60, -39.4, -10.6, -10, VY, VY + 8);
    W("vault_steel", "z", -60, -39.4, 10, 10.6, VY, VY + 8, [
      { c: -45, w: 1.6, y0: VY, h: 2.6 },
    ]);
    ceil("vault_dark", -10, -60, 10, -40, VY + 8);
    for (let x = -9; x <= 9; x += 3)
      b.box("vault_dark", X(x), oy + VY + 7.4, Z(-50), 0.4, 0.6, 20, {
        seg: false,
      });
    for (const sx of [-1, 1])
      for (let z = -58; z <= -42; z += 4)
        b.box("vault_steel", X(sx * 9.8), oy + VY, Z(z), 0.4, 8, 0.8, {
          seg: false,
          grime: 0.3,
        });
    for (const [x, z] of [
      [-6, -44],
      [6, -44],
      [-6, -55],
      [6, -55],
    ]) {
      b.box("lamp_warm", X(x), oy + VY + 7.2, Z(z), 1.8, 0.12, 0.5, {
        seg: false,
        noAO: true,
      });
      PF.glow(P(x, VY + 7.1, z), 0xe8f0ff, 2.2, root, { intensity: 0.8 });
    }
    // the cylinder door frame (north wall z -60..-63)
    W("vault_steel", "x", -10.6, 10.6, -63.6, -60, VY, VY + 8, [
      { c: 0, w: 4.4, y0: VY, h: 4.2 },
    ]);
    b.boxMM(
      "vault_dark",
      X(-2.4),
      oy + VY,
      Z(-63.6),
      X(2.4),
      oy + VY + 0.1,
      Z(-60),
      { seg: false },
    );
    // frame ring around the cylinder cavity
    b.add("vault_steel", new THREE.TorusGeometry(2.25, 0.35, 8, 28), {
      m: PF.m4(X(0), oy + VY + 2.0, Z(-59.9), 0, 0),
    });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      b.cyl(
        "chrome",
        X(Math.cos(a) * 2.25),
        oy + VY + 2.0 + Math.sin(a) * 2.25,
        Z(-59.6),
        0.12,
        0.12,
        0.25,
        8,
        { hSeg: 1, rx: HP },
      );
    }
    // the 140-ton frame the cylinder turns in: stepped steel jambs & head, rivet rows, hydraulic locking rams,
    // hazard-striped sweep on the floor, stencilled level plate
    for (const [x0, x1, y0, y1] of [
      [-3.6, -2.2, 0, 4.2],
      [2.2, 3.6, 0, 4.2],
      [-3.6, 3.6, 4.2, 5.6],
    ]) {
      b.boxMM(
        "vault_steel",
        X(x0),
        oy + VY + y0,
        Z(-60.05),
        X(x1),
        oy + VY + y1,
        Z(-59.7),
        { grime: 0.3 },
      );
      b.boxMM(
        "vault_dark",
        X(x0 + 0.15),
        oy + VY + y0 + (y0 ? 0.15 : 0),
        Z(-59.72),
        X(x1 - 0.15),
        oy + VY + y1 - 0.15,
        Z(-59.6),
        { seg: false, grime: 0.4 },
      );
    }
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      for (const sx of [-1, 1])
        b.sphere(
          "chrome",
          X(sx * 3.35),
          oy + VY + 0.3 + t * 5.0,
          Z(-59.62),
          0.06,
          { ws: 5, hs: 3 },
        );
      b.sphere("chrome", X(-3.3 + t * 6.6), oy + VY + 5.38, Z(-59.62), 0.06, {
        ws: 5,
        hs: 3,
      });
    }
    for (const sx of [-1, 1]) {
      b.cyl("vault_dark", X(sx * 5.0), oy + VY, Z(-59.6), 0.42, 0.42, 5.2, 12, {
        hSeg: 2,
        grime: 0.4,
      });
      PF.col(X(sx * 5.0), Z(-59.6), 0.9, 0.9, oy + VY, oy + VY + 6.6, 0, {
        walkable: false,
        surface: "metal",
      });
      b.cyl(
        "chrome",
        X(sx * 5.0),
        oy + VY + 5.2,
        Z(-59.6),
        0.18,
        0.18,
        1.4,
        10,
        { hSeg: 1 },
      );
      b.box(
        "vault_steel",
        X(sx * 5.0),
        oy + VY + 6.5,
        Z(-59.75),
        1.2,
        0.5,
        0.5,
        { seg: false },
      );
      for (const y of [0.6, 4.6])
        b.box(
          "vault_steel",
          X(sx * 5.0),
          oy + VY + y,
          Z(-59.85),
          1.1,
          0.3,
          0.4,
          { seg: false },
        );
      b.beam(
        "rust",
        P(sx * 5.0, VY + 3.2, -59.2),
        P(sx * 3.0, VY + 3.2, -59.55),
        0.08,
        0.08,
        {},
      ); // hydraulic line
    }
    b.quad(hazK, X(0), oy + VY + 0.012, Z(-59.1), 7.2, 0.9, {
      rx: -HP,
      noAO: true,
    });
    b.quad(hazK, X(0), oy + VY + 0.012, Z(-55.6), 7.2, 0.5, {
      rx: -HP,
      noAO: true,
    });
    const lv5K = PF.texMat(
      "fed_level5",
      PF.signTex(
        "fed_level5",
        [
          "VAULT LEVEL V",
          "80 FT BELOW LIBERTY STREET",
          "COUNTERWEIGHTED ROTATING DOOR — STAND CLEAR",
        ],
        "stencil",
        512,
        192,
        { bg: "#2a2c2c", fg: "#d8d0b0" },
      ),
    );
    b.quad(lv5K, X(-6.9), oy + VY + 2.4, Z(-59.95), 2.4, 0.9, {});
    const vK = PF.texMat(
      "fed_vaultsign",
      PF.signTex("fed_vaultsign", ["GOLD VAULT"], "enamel", 512, 128, {
        bg: "#1a1a1a",
        fg: "#e0c060",
      }),
    );
    b.quad(vK, X(0), oy + VY + 6.3, Z(-59.95), 3.2, 0.8, {});
    // alarm beacons (rotating red lights when the alarm is tripped)
    const beacons = [];
    for (const [x, z] of [
      [-9.6, -41],
      [9.6, -41],
      [-9.6, -59],
      [9.6, -59],
      [0, -39.6],
    ]) {
      b.cyl("iron", X(x), oy + VY + 6, Z(z), 0.18, 0.2, 0.2, 8, { hSeg: 1 });
      const bc = PF.mesh(
        "lamp_red",
        new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8),
      );
      bc.position.set(X(x), oy + VY + 6.35, Z(z));
      root.add(bc);
      bc.visible = false;
      beacons.push(bc);
      const gl = PF.glow(P(x, VY + 6.4, z), 0xff2010, 2.8, root, {
        intensity: 1.6,
        flicker: 0.9,
      });
      beacons.push(gl);
    }
    // gantry & cable clutter, a crate barricade the last crew built
    D.crates(b, X(-6), oy + VY, Z(-47), 2, 5, true);
    D.crates(b, X(-4.8), oy + VY, Z(-46.2), 1, 6, true);
    PF.sandbags(b, X(-7.6), Z(-48.4), X(-3.6), Z(-48.4), 3, { y: oy + VY });
    for (const [x, z, a] of [
      [-5, -50, 0.7],
      [-2.2, -44.8, 2.9],
      [3.8, -52, -0.5],
    ])
      PF.skeleton(b, X(x), oy + VY + 0.02, Z(z), a);
    anchors.antechamber = A(0, VY, -48, 0);
    anchors.boss = A(0, VY, -53.5, PI);
    anchors.spawn6 = A(6, VY, -50, 0);

    // ---- maintenance passage x 10.6..14, z -46..-12.6 → egress stair ----
    floor("vault_dark", 10.6, -46, 14, -12.6, VY);
    W("vault_dark", "z", -46.6, -16, 14, 14.6, VY, VY + 3.2);
    W("vault_dark", "x", 10, 14.6, -46.6, -46, VY, VY + 3.2);
    W("vault_dark", "z", -39.4, -12, 10, 10.6, VY, VY + 3.2);
    W("vault_dark", "x", 10, 16, -12.6, -12, VY, VY + 3.2);
    ceil("panel", 10.6, -46, 14, -12.6, VY + 3);
    for (let z = -44; z <= -14; z += 7) {
      b.cyl("rust", X(13.6), oy + VY + 2.6, Z(z), 0.14, 0.14, 7, 8, {
        hSeg: 2,
        rx: HP,
      });
      D.fluoro(
        b,
        X(12.3),
        oy + VY + 2.8,
        Z(z),
        HP,
        1.4,
        z % 14 === 0,
        oy + VY + 3,
      );
    }
    floor("vault_dark", 14, -16, 16, -12.6, VY); // stub to the shaft door
    W("vault_dark", "x", 14, 16, -16.6, -16, VY, VY + 3.2);
    anchors.passage = A(12.3, VY, -30, 0);

    // ---- EGRESS STAIRWELL (x 16..22, z -24..-12), vault (VY) → ground (0) ----
    const SX0 = 16.6,
      SX1 = 21.4,
      SZ0 = -23.4,
      SZ1 = -12.6,
      LZ0 = -21.8,
      LZ1 = -14.2,
      FW = 2.0;
    W("fed_stone", "z", -24, -12, 16, 16.6, VY, 4, [
      { c: -13.4, w: 1.4, y0: VY, h: 2.5 },
      { c: -13.4, w: 1.4, y0: 0, h: 2.5 },
    ]);
    W("fed_stone", "z", -24, -12, 21.4, 22, VY, 4, [
      { c: -13.4, w: 1.3, y0: -15, h: 2.5 },
    ]);
    W("fed_stone", "x", 16, 22, -24, -23.4, VY, 4);
    W("fed_stone", "x", 16, 22, -12.6, -12, VY, 4);
    ceil("concrete_dark", 16.6, -23.4, 21.4, -12.6, 3.6);
    floor("concrete", SX0, SZ1 - 1.6, SX1, SZ1, VY);
    const lv = [];
    for (let y = VY; y <= 0.01; y += 2.5) lv.push(y);
    for (let i = 0; i < lv.length - 1; i++) {
      const y0 = lv[i],
        y1 = lv[i + 1];
      const north = i % 2 === 0; // bottom landing is south; first flight climbs north
      if (north)
        PF.stairs(
          b,
          "concrete",
          X(SX0 + FW / 2),
          Z(LZ1),
          PI,
          FW,
          LZ1 - LZ0,
          oy + y0,
          oy + y1,
          { base: oy + y0 - 0.3 },
        );
      else
        PF.stairs(
          b,
          "concrete",
          X(SX1 - FW / 2),
          Z(LZ0),
          0,
          FW,
          LZ1 - LZ0,
          oy + y0,
          oy + y1,
          { base: oy + y0 - 0.3 },
        );
      const lz0 = north ? SZ0 : LZ1,
        lz1 = north ? LZ0 : SZ1;
      b.boxMM(
        "concrete",
        X(SX0),
        oy + y1 - 0.3,
        Z(lz0),
        X(SX1),
        oy + y1,
        Z(lz1),
        { grime: 0.6 },
      );
      PF.colMM(X(SX0), oy + y1 - 0.3, Z(lz0), X(SX1), oy + y1, Z(lz1));
      // level signs on the landings
      if (!north && y1 < -0.1) {
        const lvl = Math.round(-y1 / 5);
        const sk = PF.texMat(
          "fed_b" + lvl,
          PF.signTex(
            "fed_b" + lvl,
            [
              "SUB-BASEMENT B" + lvl,
              lvl === 3 ? "CURRENCY DESTRUCTION" : "SEALED — FLOODING",
            ],
            "enamel",
            256,
            128,
            { bg: "#1e2a24", fg: "#e0d8b8" },
          ),
        );
        b.quad(sk, X(21.35), oy + y1 + 1.8, Z(-13.4), 1.0, 0.5, { ry: -HP });
      }
    }
    b.boxMM(
      "concrete",
      X(SX0 + FW + 0.05),
      oy + VY,
      Z(LZ0),
      X(SX1 - FW - 0.05),
      oy + 0.2,
      Z(LZ1),
      { grime: 0.6 },
    );
    PF.colMM(
      X(SX0 + FW + 0.05),
      oy + VY,
      Z(LZ0),
      X(SX1 - FW - 0.05),
      oy + 0.2,
      Z(LZ1),
      { walkable: false },
    );
    for (let y = VY + 2.4; y < 0; y += 5) {
      b.box("lamp_red", X(19), oy + y, Z(-23.35), 0.3, 0.15, 0.08, {
        seg: false,
        noAO: true,
      });
      PF.glow(P(19, y, -23.2), 0xff5030, 0.9, root, {
        intensity: 0.8,
        flicker: 0.4,
      });
    }
    // sealed sub-basement doors (rubble / chained)
    for (const y of [-5, -10, -20]) {
      b.box("rust", X(16.7), oy + y, Z(-13.4), 0.1, 2.4, 1.4, { seg: false });
      b.rock("rubble", X(17.3), oy + y, Z(-13.8), 0.5, { flat: 0.5 });
    }
    // B3: currency incinerator room (x 22..28, z -24..-14) off the east wall at y -15
    floor("concrete", 22, -20, 28, -12, -15);
    W("fed_stone", "x", 22, 28.6, -20.6, -20, -15, -11);
    W("fed_stone", "x", 22, 28.6, -12, -11.4, -15, -11);
    W("fed_stone", "z", -20.6, -11.4, 28, 28.6, -15, -11);
    ceil("concrete_dark", 22, -20, 28, -12, -11.4);
    b.box("rust", X(26.3), oy - 15, Z(-17.5), 2.4, 2.6, 2.6, {
      seg: false,
      grime: 0.7,
    });
    b.cyl("rust", X(26.3), oy - 12.4, Z(-17.5), 0.4, 0.4, 1.0, 8, { hSeg: 1 });
    b.box("fire", X(25.05), oy - 14.4, Z(-17.5), 0.05, 0.6, 0.9, {
      seg: false,
    });
    PF.col(X(26.3), Z(-17.5), 2.4, 2.6, oy - 15, oy - 12.4, 0, {
      walkable: false,
    });
    D.papers(b, X(24.3), oy - 14.98, Z(-15.5), 1.5, 30, 303);
    const incK = PF.texMat(
      "fed_inc",
      PF.signTex(
        "fed_inc",
        ["UNFIT CURRENCY", "DESTRUCTION LOG", "$1,140,000,000 — MAR 4"],
        "engraved",
        512,
        256,
        { bg: "#b8b0a0", fg: "#2a2418" },
      ),
    );
    b.quad(incK, X(22.04), oy - 13.2, Z(-18), 1.2, 0.6, { ry: HP });
    anchors.b3 = A(24.2, -15, -17.5, 0);
    // top of the stair: bolted door onto the ground-floor back corridor
    boltDoor(root, X(16.3), oy, Z(-13.4), anchors);
    // vault-level door into the stair (from the passage) — open steel door frame
    b.box("vault_steel", X(16.3), oy + VY + 2.5, Z(-13.4), 0.6, 0.3, 1.8, {
      seg: false,
    });
    const exK = PF.texMat(
      "fed_egress",
      PF.signTex(
        "fed_egress",
        ["EMERGENCY EGRESS", "STAIR TO GROUND"],
        "enamel",
        512,
        128,
        { bg: "#1c5a2a", fg: "#f0f0e0" },
      ),
    );
    b.quad(exK, X(15.9), oy + VY + 3.0, Z(-13.4), 1.4, 0.35, { ry: -HP });
    anchors.egress_bottom = A(18.8, VY, -13.4, 0);

    // ============================ THE GOLD VAULT ============================
    const VZ0 = -92,
      VZ1 = -63.6;
    floor("vault_dark", -18, VZ0, 18, VZ1, VY);
    W("vault_steel", "x", -18.6, 18.6, VZ0 - 0.6, VZ0, VY, VY + 5, [
      { c: 0, w: 2.2, y0: VY, h: 2.6 },
    ]);
    W("vault_steel", "z", VZ0 - 0.6, VZ1, -18.6, -18, VY, VY + 5);
    W("vault_steel", "z", VZ0 - 0.6, VZ1, 18, 18.6, VY, VY + 5);
    W("vault_steel", "x", -18.6, -10.6, -63.6, -63, VY, VY + 5);
    W("vault_steel", "x", 10.6, 18.6, -63.6, -63, VY, VY + 5);
    floor("vault_dark", -2.4, -63.6, 2.4, -60, VY);
    ceil("vault_dark", -18, VZ0, 18, VZ1, VY + 5);
    for (let x = -16; x <= 16; x += 4)
      b.box(
        "vault_steel",
        X(x),
        oy + VY + 4.7,
        Z((VZ0 + VZ1) / 2),
        0.3,
        0.3,
        VZ1 - VZ0,
        { seg: false },
      );
    // caged ceiling lamps over the aisles (baked light above) + warm glow sprites
    for (const x of [-12, 0, 12])
      for (let z = -88; z <= -66; z += 7) {
        b.box("lamp_warm", X(x), oy + VY + 4.45, Z(z), 0.5, 0.1, 0.5, {
          seg: false,
          noAO: true,
        });
        b.box("iron", X(x), oy + VY + 4.55, Z(z), 0.62, 0.05, 0.62, {
          seg: false,
        });
        if (x === 0)
          PF.glow(P(x, VY + 4.3, z), 0xffd890, 1.6, root, { intensity: 0.75 }); // sprites on the main aisle only (draw calls)
      }
    // compartments: rows of 3 m cages. Row faces: west wall row (front x -14, facing +x), block A (-10..-2), block B (2..10), east row (front x 14)
    const rows = [
      { back: -18, front: -14, dir: 1 },
      { back: -6, front: -10, dir: -1 },
      { back: -6, front: -2, dir: 1 },
      { back: 6, front: 2, dir: -1 },
      { back: 6, front: 10, dir: 1 },
      { back: 18, front: 14, dir: -1 },
    ];
    const comps = [];
    let num = 1;
    // compartments with an open cage door and a lootable bullion crate inside (lock = the crate's G.locks spec)
    const COMPS_LOOT = {
      1: { n: 6, name: "Compartment 001 (forced open)" },
      46: { n: 6, name: "Compartment 046 (forced open)" },
      12: {
        n: 10,
        name: "Bullion Crate — Compartment 012",
        lock: PF.regLock({
          id: "pf_lk_fed_comp012",
          label: "Bullion Crate — Compartment 012",
          code: "4825",
          kind: "container",
          hint: "Bullion Inventory on the Level V vault-control teletype.",
        }),
      },
      30: {
        n: 14,
        name: "Bullion Crate — Compartment 030",
        lock: PF.regLock({
          id: "pf_lk_fed_comp030",
          label: "Bullion Crate — Compartment 030",
          code: "9361",
          kind: "container",
          hint: "Compartment audit on the Vault Manager's teletype.",
        }),
      },
      24: {
        n: 20,
        name: "Bullion Crate — Compartment 024 (RESERVE)",
        lock: PF.regLock({
          id: "pf_lk_fed_comp024",
          label: "Reserve Crate — Compartment 024",
          key: "pf_fed_reserve_key",
          kind: "container",
          hint: "The reserve key is in the Vault Manager's safe.",
        }),
      },
      26: {
        n: 4,
        name: "Bullion Crate — Compartment 026",
        lock: PF.regLock({
          id: "pf_lk_fed_comp026",
          label: "Bullion Crate — Compartment 026",
          code: "2604",
          kind: "container",
          hint: "Brass tag wired to the cage of compartment 026.",
        }),
      },
    };
    PF.fedSpecial = COMPS_LOOT;
    for (const row of rows) {
      for (let k = 0; k < 8; k++) {
        const z0 = VZ0 + 1 + k * 3.1,
          z1 = z0 + 3.0,
          zc = (z0 + z1) / 2;
        const xa = Math.min(row.back, row.front),
          xb = Math.max(row.back, row.front);
        comps.push({
          xa,
          xb,
          zc,
          z0,
          z1,
          front: row.front,
          dir: row.dir,
          num: num++,
          last: k === 7,
        });
      }
    }
    for (const c of comps) {
      const sp = COMPS_LOOT[c.num];
      const divider = (zz) => {
        b.boxMM(
          "vault_steel",
          X(c.xa),
          oy + VY,
          Z(zz - 0.05),
          X(c.xb),
          oy + VY + 3.2,
          Z(zz + 0.05),
          { seg: false, grime: 0.3 },
        );
        PF.colMM(
          X(c.xa),
          oy + VY,
          Z(zz - 0.06),
          X(c.xb),
          oy + VY + 3.2,
          Z(zz + 0.06),
          { walkable: false },
        );
      };
      divider(c.z0);
      if (c.last) divider(c.z1);
      b.boxMM(
        "vault_steel",
        X(c.xa),
        oy + VY + 3.2,
        Z(c.z0),
        X(c.xb),
        oy + VY + 3.3,
        Z(c.z1),
        { seg: false },
      );
      for (const yy of [3.1])
        b.box("iron", X(c.front), oy + VY + yy, Z(c.zc), 0.06, 0.08, 3.0, {
          seg: false,
        });
      if (sp) {
        // the cage door hangs open: bars on a swung leaf, frame posts only
        const hx = X(c.front),
          hz = Z(c.z0 + 0.1);
        const M = PF.m4(hx, oy + VY, hz, c.dir > 0 ? -1.2 : PI + 1.2);
        for (let i = 0; i < 14; i++)
          b.add("iron", new THREE.BoxGeometry(0.04, 3.0, 0.04), {
            m: new THREE.Matrix4().multiplyMatrices(
              M,
              PF.m4(0.1 + i * 0.2, 1.5, 0),
            ),
          });
        for (const yy of [0.2, 1.5, 2.9])
          b.add("iron", new THREE.BoxGeometry(2.8, 0.07, 0.05), {
            m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(1.4, yy, 0)),
          });
        if (!sp.lock) {
          b.rock(
            "rubble",
            X(c.front + c.dir * 0.8),
            oy + VY,
            Z(c.zc + 0.8),
            0.25,
            { flat: 0.6 },
          );
          b.box(
            "brass",
            X(c.front + c.dir * 0.5),
            oy + VY + 0.02,
            Z(c.zc - 1.0),
            0.2,
            0.06,
            0.15,
            { ry: 0.7, seg: false },
          );
        }
        c.open = true;
        continue;
      }
      for (let zz = c.z0 + 0.2; zz < c.z1; zz += 0.2)
        b.box("iron", X(c.front), oy + VY, Z(zz), 0.04, 3.2, 0.04, {
          seg: false,
          grime: 0.1,
        });
      for (const yy of [0.1, 1.6])
        b.box("iron", X(c.front), oy + VY + yy, Z(c.zc), 0.06, 0.08, 3.0, {
          seg: false,
        });
      PF.colMM(
        X(c.front - 0.08),
        oy + VY,
        Z(c.z0),
        X(c.front + 0.08),
        oy + VY + 3.2,
        Z(c.z1),
        { walkable: false },
      );
      b.box(
        "brass",
        X(c.front + c.dir * 0.06),
        oy + VY + 1.2,
        Z(c.zc + 0.9),
        0.05,
        0.25,
        0.18,
        { seg: false },
      ); // padlock hasp
    }
    PF.fedComps = comps;
    // the last back wall of each double block
    for (const x of [-6, 6])
      b.boxMM(
        "vault_steel",
        X(x - 0.06),
        oy + VY,
        Z(VZ0 + 1),
        X(x + 0.06),
        oy + VY + 3.3,
        Z(VZ0 + 1 + 8 * 3.1),
        { seg: false },
      );
    // number plates
    const numTex = PF.canvasTex(
      "pf_fed_nums",
      512,
      512,
      (ctx) => {
        ctx.fillStyle = "#20201c";
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = "#e8d8a0";
        ctx.font = "bold 34px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < 64; i++)
          ctx.fillText(
            String(i + 1).padStart(3, "0"),
            (i % 8) * 64 + 32,
            Math.floor(i / 8) * 64 + 32,
          );
      },
      { clamp: true },
    );
    const numK = PF.texMat("fed_nums", numTex, { rough: 0.6 });
    for (const c of comps) {
      const i = c.num - 1,
        u0 = (i % 8) / 8,
        v0 = 1 - (Math.floor(i / 8) + 1) / 8;
      b.quad(
        numK,
        X(c.front + c.dir * 0.09),
        oy + VY + 2.75,
        Z(c.zc),
        0.36,
        0.36,
        {
          ry: c.dir > 0 ? HP : -HP,
          uvRect: [u0, v0, u0 + 1 / 8, v0 + 1 / 8],
          grime: 0.1,
          noAO: true,
        },
      );
    }
    // cross aisle: scales table, bullion carts, counting table
    b.box("marble_dark", X(-9), oy + VY, Z(-65.5), 3.4, 0.9, 1.2, {
      seg: false,
    });
    b.cyl("brass", X(-9), oy + VY + 0.9, Z(-65.5), 0.12, 0.2, 1.3, 8, {
      hSeg: 1,
    });
    b.box("brass", X(-9), oy + VY + 2.2, Z(-65.5), 2.4, 0.08, 0.1, {
      rz: 0.08,
      seg: false,
    });
    for (const sx of [-1, 1]) {
      b.cyl(
        "brass",
        X(-9 + sx * 1.15),
        oy + VY + 1.5,
        Z(-65.5),
        0.4,
        0.35,
        0.08,
        12,
        { hSeg: 1 },
      );
      b.beam(
        "brass",
        P(-9 + sx * 1.15, VY + 2.2 + sx * -0.09, -65.5),
        P(-9 + sx * 1.15, VY + 1.58, -65.5),
        0.015,
        0.015,
      );
    }
    PF.col(X(-9), Z(-65.5), 3.4, 1.2, oy + VY, oy + VY + 0.9, 0, {
      walkable: false,
    });
    for (const [x, z, a] of [
      [8, -65.6, 0.2],
      [4.5, -66, -0.4],
    ]) {
      b.box("vault_steel", X(x), oy + VY + 0.35, Z(z), 1.8, 0.1, 0.9, {
        ry: a,
        seg: false,
      });
      for (const dx of [-0.7, 0.7])
        for (const dz of [-0.3, 0.3])
          b.cyl(
            "tire",
            X(x + dx * Math.cos(a) + dz * Math.sin(a)),
            oy + VY,
            Z(z - dx * Math.sin(a) + dz * Math.cos(a)),
            0.12,
            0.12,
            0.08,
            8,
            { hSeg: 1, rz: HP },
          );
      PF.col(X(x), Z(z), 1.9, 1.0, oy + VY, oy + VY + 0.9, a, {
        walkable: false,
      });
    }
    anchors.vault = A(0, VY, -70, 0);
    anchors.scales = A(-9, VY, -66.8, 0);

    // ---- vault office (x -6..6, z -99..-92.6) ----
    floor("carpet", -6, -99, 6, VZ0 - 0.6, VY);
    W("vault_steel", "x", -6.6, 6.6, -99.6, -99, VY, VY + 3.6);
    W("vault_steel", "z", -99.6, VZ0 - 0.6, -6.6, -6, VY, VY + 3.6);
    W("vault_steel", "z", -99.6, VZ0 - 0.6, 6, 6.6, VY, VY + 3.6);
    ceil("plaster_w", -6, -99, 6, VZ0 - 0.6, VY + 3.4);
    b.box("mahogany", X(0), oy + VY, Z(-96.5), 2.6, 0.8, 1.2, { seg: false });
    PF.col(X(0), Z(-96.5), 2.6, 1.2, oy + VY, oy + VY + 0.8, 0, {
      walkable: false,
    });
    D.chair(b, X(0), oy + VY, Z(-97.6), 0, false, "velvet");
    // display case for the Gold Standard pistol
    b.box("mahogany", X(-4.4), oy + VY, Z(-96), 1.2, 0.9, 0.7, { seg: false });
    b.box("glass_dark", X(-4.4), oy + VY + 0.9, Z(-96), 1.2, 0.35, 0.7, {
      seg: false,
    });
    PF.col(X(-4.4), Z(-96), 1.2, 0.7, oy + VY, oy + VY + 1.25, 0, {
      walkable: false,
    });
    for (let i = 0; i < 3; i++)
      D.painting(
        b,
        4 + i,
        X(-3 + i * 3),
        oy + VY + 2.0,
        Z(-98.95),
        1.0,
        0.8,
        0,
        { frame: "gilt" },
      );
    b.box("lamp_warm", X(0), oy + VY + 3.2, Z(-95.8), 0.4, 0.08, 0.4, {
      seg: false,
      noAO: true,
    });
    PF.glow(P(0, VY + 3.1, -95.8), 0xffd8a0, 1.2, root, { intensity: 0.9 });
    anchors.office = A(0, VY, -94, PI);
    anchors.ledger = A(0.5, VY + 0.82, -96.4, 0);
    anchors.pistol = A(-4.4, VY + 0.92, -96, 0);
    anchors.office_terminal = A(3.9, VY, -98.3, 0);
    anchors.office_safe = A(5.7, VY + 1.0, -95.5, -HP);

    const g = b.build(root, { lodDistInt: 400 });
    g.name = "fed_interior";

    // ---------------- gold bars (one instanced draw call) ----------------
    goldBars(root, comps, X, Z, oy + VY, anchors);
    // ---------------- the cylinder door ----------------
    cylinderDoor(root, X(0), oy + VY, Z(-61.4), anchors);

    // ---------------- dynamic systems ----------------
    const applyAlarm = () => {
      const on = !!PF.flag("fed_alarm");
      for (const bc of beacons) if (bc) bc.visible = on;
    };
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "fed_alarm") applyAlarm();
      if (k === "*" || k === "fed_grid") grid.visible = !!PF.flag("fed_grid");
    });
    PF.onReset.push(() => {
      grid.visible = true;
      for (const bc of beacons) if (bc) bc.visible = false;
    });
    let hitCD = 0,
      spin = 0;
    PF.updaters.push((dt) => {
      const p = G.player.pos;
      // laser grid: crossing it while active burns and trips the alarm
      if (hitCD > 0) hitCD -= dt;
      if (
        PF.flag("fed_grid") &&
        hitCD <= 0 &&
        Math.abs(p.x - X(0)) < 2.6 &&
        Math.abs(p.z - Z(-25.5)) < 0.45 &&
        p.y > oy + VY - 0.5 &&
        p.y < oy + VY + 2.2
      ) {
        hitCD = 1.2;
        try {
          G.player.damage(28, { type: "energy", source: "laser_grid" });
        } catch (e) {
          /* ignore */
        }
        PF.sfx("laser_impact", P(0, VY + 1.2, -25.5));
        PF.sfx("gun_laser", P(0, VY + 1.2, -25.5), { volume: 0.6 });
        try {
          G.fx.sparks(V3(p.x, p.y + 1.0, p.z));
        } catch (e) {
          /* optional */
        }
        tripAlarm();
      }
      if (PF.flag("fed_alarm")) {
        spin += dt;
        for (const bc of beacons) if (bc && bc.isMesh) bc.rotation.y = spin * 6;
      }
    });
    return anchors;
  }

  /** Alarm: siren, beacons, every robot in the cell turns on the player. */
