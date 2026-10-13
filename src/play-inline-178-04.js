// play-inline-178 04 — yaw
// Lines 887-1041 of readable/play-inline-178.pretty.js (statement-aligned).
  function gg1(b, glows, x, y, z, yaw, tilt) {
    // stylised GG1-type streamlined electric locomotive: stepped hood profile extruded 3 m wide
    const L = 22,
      W = 3.0;
    const sh = new THREE.Shape();
    sh.moveTo(-L / 2, 0.9);
    sh.lineTo(L / 2, 0.9);
    sh.lineTo(L / 2, 1.8);
    sh.quadraticCurveTo(L / 2 - 0.3, 3.0, L / 2 - 2.2, 3.1);
    sh.lineTo(3.2, 3.2);
    sh.quadraticCurveTo(2.6, 4.4, 1.2, 4.5);
    sh.lineTo(-1.2, 4.5);
    sh.quadraticCurveTo(-2.6, 4.4, -3.2, 3.2);
    sh.lineTo(-L / 2 + 2.2, 3.1);
    sh.quadraticCurveTo(-L / 2 + 0.3, 3.0, -L / 2, 1.8);
    sh.lineTo(-L / 2, 0.9);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: W,
      bevelEnabled: true,
      bevelThickness: 0.25,
      bevelSize: 0.25,
      bevelSegments: 2,
      curveSegments: 6,
    });
    g.translate(0, 0, -W / 2);
    b.geo("paint_green", g, {
      x,
      y,
      z,
      ry: yaw,
      rz: tilt,
      tint: 0x24382a,
      grime: 0.7,
    });
    g.dispose();
    const P = (lx, ly, lz) => {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      const ct = Math.cos(tilt),
        st = Math.sin(tilt);
      const rx = lx * ct - ly * st,
        ry = lx * st + ly * ct;
      return [x + rx * c + lz * s, y + ry, z - rx * s + lz * c];
    };
    // five gold pinstripes ("cat whiskers") converging at the nose
    for (const sgn of [-1, 1])
      for (let k = 0; k < 5; k++) {
        const a = P(-7, 1.4 + k * 0.28, sgn * (W / 2 + 0.26)),
          c2 = P(-L / 2 + 0.1, 1.45 + k * 0.1, sgn * 0.2 * k);
        b.beam("gold", a[0], a[1], a[2], c2[0], c2[1], c2[2], 0.06, {
          grime: 0.3,
        });
        const a2 = P(7, 1.4 + k * 0.28, sgn * (W / 2 + 0.26)),
          c3 = P(L / 2 - 0.1, 1.45 + k * 0.1, sgn * 0.2 * k);
        b.beam("gold", a2[0], a2[1], a2[2], c3[0], c3[1], c3[2], 0.06, {
          grime: 0.3,
        });
      }
    // cab windows, headlights, running gear, pantographs
    for (const sgn of [-1, 1]) {
      const w = P(sgn * 1.8, 3.9, 0);
      b.box("glass_broken", w[0], w[1] - 0.35, w[2], 0.9, 0.7, W + 0.55, {
        yaw,
        grime: 0.2,
      });
    }
    for (const e of [-1, 1]) {
      const hl = P(e * (L / 2 + 0.2), 2.2, 0);
      b.geo("lamp_warm", T.sphereLo, {
        x: hl[0],
        y: hl[1],
        z: hl[2],
        s: 0.22,
        tint: 0x3a3a30,
        grime: 0,
      });
    }
    for (let k = -4; k <= 4; k++) {
      if (k === 0) continue;
      for (const sgn of [-1, 1]) {
        const wp = P(k * 2.3, 0.75, sgn * (W / 2 - 0.1));
        b.geo("black_metal", T.cyl12, {
          x: wp[0],
          y: wp[1],
          z: wp[2],
          sx: 0.62,
          sy: 0.18,
          sz: 0.62,
          rx: HP,
          ry: yaw,
          rz: 0,
        });
      }
    }
    const fr = P(0, 0.35, 0);
    b.box("black_metal", fr[0], fr[1], fr[2], L - 1, 0.55, W - 0.4, {
      yaw,
      rz: tilt,
    });
    for (const e of [-1, 1]) {
      const base = P(e * 3.6, 4.6, 0);
      b.box("black_metal", base[0], base[1], base[2], 1.2, 0.2, 1.4, { yaw });
      const top = P(e * 3.0, 5.9, 0),
        mid1 = P(e * 4.1, 5.3, 0);
      b.beam(
        "black_metal",
        base[0],
        base[1] + 0.2,
        base[2],
        mid1[0],
        mid1[1],
        mid1[2],
        0.06,
      );
      b.beam(
        "black_metal",
        mid1[0],
        mid1[1],
        mid1[2],
        top[0],
        top[1],
        top[2],
        0.06,
      );
      b.beam(
        "chrome",
        top[0] - Math.sin(yaw + HP) * 1,
        top[1],
        top[2] - Math.cos(yaw + HP) * 1,
        top[0] + Math.sin(yaw + HP) * 1,
        top[1],
        top[2] + Math.cos(yaw + HP) * 1,
        0.05,
      );
    }
    const nb = P(-L / 2 + 1.5, 2.6, W / 2 + 0.27);
    b.panel("atlas_paint", nb[0], nb[1], nb[2], 0.9, 0.9, yaw, {
      rect: K.paint("penn_prr", 256, 256),
      grime: 0.3,
    });
    K.colRot(x, z, L, W + 0.6, y, y + 4.2, yaw, { surface: "metal" });
    void glows;
  }
  function track(b, x0, x1, z, y) {
    for (const dz of [-0.72, 0.72])
      b.box("rust", (x0 + x1) / 2, y + 0.18, z + dz, x1 - x0, 0.14, 0.09, {
        tint: 0x6a5a4a,
        grime: 0.3,
      });
    for (let x = x0 + 0.3; x < x1; x += 0.8)
      b.box("wood_rotten", x, y, z, 0.25, 0.16, 2.4, {
        tint: 0x4a3a2a,
        grime: 0.7,
      });
  }
