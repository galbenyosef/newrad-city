// play-inline-457 13 — look
// Lines 3093-3385 of readable/play-inline-457.pretty.js (statement-aligned).
  H.wraps = function (R, b, color, where, opts) {
    opts = opts || {};
    const lr = b.limbR * 0.93,
      s = b.s;
    const spiral = (x, y, z, nx, ny, nz, out) => {
      const a = Math.atan2(x, z);
      const k = Math.abs(Math.sin((y / s) * 70 + a));
      if (k < 0.2) {
        out[0] *= 0.68;
        out[1] *= 0.66;
        out[2] *= 0.64;
      } else if (k > 0.9) {
        out[0] *= 1.05;
        out[1] *= 1.05;
        out[2] *= 1.04;
      }
    };
    const m = cloth(color, { region: "rags", paint: spiral, rough: 1 });
    const fray = (g, y0) =>
      P.deform(g, (v) => {
        if (Math.abs(v.y - y0) < 0.004 * s)
          v.y += (L.hash3(v.x * 400, 7, v.z * 400) - 0.5) * 0.02 * s;
      });
    for (const S of ["L", "R"]) {
      if (where.indexOf("arms") >= 0 && (!opts.one || S === opts.one)) {
        const F = b.fore,
          top = opts.armTop === undefined ? 0.3 : opts.armTop,
          len = F * (0.97 - top);
        const g = P.cyl(0.05 * lr * 1.12, 0.036 * lr * 1.2, len, 12, true);
        fray(g, len / 2);
        R.add(
          "forearm" + S,
          P.xf(g, 0, -F * top - len / 2, 0, 0, 0, 0, 1, 1, 0.94),
          m,
        );
      }
      if (where.indexOf("legs") >= 0) {
        const Sh = b.shin,
          len = Sh * 0.52,
          k = b.limbR;
        const g = P.cyl(0.066 * k * 1.07, 0.046 * k * 1.14, len, 12, true);
        fray(g, len / 2);
        R.add(
          "shin" + S,
          P.xf(g, 0, -Sh * 0.4 - len / 2, 0, 0, 0, 0, 1, 1, 0.97),
          m,
        );
      }
    }
  };

  /** Straps crossing the chest (bandolier / harness). */
  H.strap = function (R, b, color, from, to, width, withRounds) {
    const s = b.s;
    const rings = H.torsoRings(b);
    const D = rings.chest[2].rz * 1.1,
      W = rings.chest[2].rx * 1.05;
    // straps across the front surface: sample points & push out onto the ellipse
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const x = lerp(from[0], to[0], t) * W,
        y = lerp(from[1], to[1], t) * s;
      const zf = -Math.sqrt(Math.max(0, 1 - Math.pow(x / (W * 1.05), 2))) * D;
      pts.push([x, y, zf - 0.006 * s]);
    }
    const g = P.sweep(pts, 0.012 * s * (width || 1), { seg: 12, rs: 4 });
    g.scale(1, 1, 1);
    R.add("chest", g, leatherM(color || PAL.leatherDark));
    if (withRounds)
      for (let i = 1; i < 6; i++) {
        const p = pts[i];
        R.add(
          "chest",
          P.xf(
            P.cyl(0.006 * s, 0.006 * s, 0.035 * s, 6),
            p[0],
            p[1],
            p[2] - 0.01 * s,
            0,
            0,
            Math.atan2(to[1] - from[1], ((to[0] - from[0]) * W) / s) + PI / 2,
          ),
          metalM(0xb8a050, { metal: 0.8 }),
        );
      }
  };

  /** Spiked shoulder pauldron (on arm bone). */
  H.pauldron = function (R, b, S, color, spikes, scale) {
    const sg = S === "L" ? -1 : 1,
      s = b.s * (scale || 1);
    if (color === "tire") {
      const g = P.sphere(
        0.095 * s,
        0.075 * s,
        0.1 * s,
        12,
        8,
        0,
        PI * 2,
        0,
        PI * 0.55,
      );
      P.xf(g, sg * 0.01 * s, 0.015 * s, 0, 0, 0, sg * -0.35);
      R.add("arm" + S, g, { color: 0x1e1e1e, region: "tire", rough: 0.9 });
    } else {
      // articulated SPAULDER (scavenged plate): a low domed cap over the
      // shoulder + three overlapping lames stepping down the upper arm, each
      // flaring at its lower edge, riveted — instead of one smooth half-egg
      const m = metalM(color || PAL.rust, { rough: 0.7, metal: 0.4 });
      const cap = P.sphere(
        0.09 * s,
        0.05 * s,
        0.095 * s,
        12,
        6,
        0,
        PI * 2,
        0,
        PI * 0.5,
      );
      P.xf(cap, sg * 0.012 * s, 0.022 * s, 0, 0, 0, sg * -0.3);
      R.add("arm" + S, cap, m);
      const arc = PI * 1.25,
        th0 = (sg > 0 ? PI / 2 : -PI / 2) - arc / 2;
      for (let i = 0; i < 3; i++) {
        const r0 = (0.083 - i * 0.004) * s,
          r1 = r0 + 0.012 * s,
          h = 0.042 * s;
        const band = new THREE.CylinderGeometry(
          r0,
          r1,
          h,
          12,
          1,
          true,
          th0,
          arc,
        );
        const tx = sg * (0.018 - i * 0.004) * s,
          ty = (-0.004 - i * 0.034) * s,
          rz = sg * (-0.26 + i * 0.07);
        P.xf(band, tx, ty, 0, 0, 0, rz);
        R.add("arm" + S, band, Object.assign({}, m, { grad: [0.72, 1.08] })); // lower edge lit, upper edge in the lame above's shadow
        const ra = sg > 0 ? PI / 2 : -PI / 2; // rivets on the outer face
        for (const da of [-0.5, 0.5])
          R.add(
            "arm" + S,
            P.xf(
              P.xf(
                P.sphere(0.006 * s, 0.006 * s, 0.006 * s, 5, 4),
                Math.sin(ra + da) * (r0 + 0.009 * s),
                0,
                Math.cos(ra + da) * (r0 + 0.009 * s),
              ),
              tx,
              ty,
              0,
              0,
              0,
              rz,
            ),
            metalM(0x8a8478, { rough: 0.4, metal: 0.8 }),
          );
      }
    }
    for (let i = 0; i < (spikes || 0); i++) {
      const a = (i / Math.max(1, spikes - 1) - 0.5) * 1.6;
      const base = [
        sg * 0.03 * s + Math.sin(a) * 0.03 * s * sg,
        0.07 * s,
        Math.sin(a) * 0.06 * s,
      ];
      R.add(
        "arm" + S,
        P.sweep(
          [base, [base[0] + sg * 0.03 * s, base[1] + 0.08 * s, base[2] * 1.2]],
          (t) => (1 - t) * 0.014 * s + 0.001,
          { seg: 3, rs: 5 },
        ),
        metalM(0x8a8a86, { rough: 0.35, metal: 0.8 }),
      );
    }
  };

  // ------------------------------------------------------------------
  // Standard clothed body (everything except exo-rigs)
  // ------------------------------------------------------------------
  /** look: {skin, top, bottom, sleeve, sleeveColor, glove, boot, bootH, ...} */
  H.body = function (R, b, look) {
    H.torso(R, b, look);
    const skinPaint = look.grime ? H.grimePaint({}) : null;
    const skinRegion = "skin";
    // grimy necks: lighter than the limbs (no scabs: on a 12-sided tube they read as a dark band under the jaw)
    const neckPaint = look.grime ? H.grimePaint({ noScab: true }) : null;
    H.neck(
      R,
      b,
      look.neckMat || skinM(look.skin, { paint: neckPaint, region: "skin" }),
    );
    for (const S of ["L", "R"]) {
      H.arm(R, b, S, {
        sleeve: look.sleeve || "long",
        sleeveColor: look.sleeveColor || look.top,
        sleeveRegion: look.sleeveRegion || look.topRegion,
        paintSleeve: look.paintSleeve || look.paintTop,
        sleeveMat: look.sleeveMat,
        skin: look.skin,
        skinPaint: look["skinPaint" + S] || skinPaint,
        skinRegion,
        skinEmis: look.glow ? 0.5 : 0,
        glove: look["glove" + S] !== undefined ? look["glove" + S] : look.glove,
        cuff: look.cuff,
        mul: look.armMul,
      });
      H.leg(R, b, S, {
        pants: look.bottom,
        pantsRegion: look.bottomRegion,
        pantsMat: look.pantsMat,
        paint: look.paintBottom,
        boot: look.boot,
        bootH: look.bootH,
        bootMat: look.bootMat,
        barefoot: look.barefoot,
        shorts: look.shorts,
        skin: look.skin,
        skinPaint,
        skinRegion,
        skinEmis: look.glow ? 0.5 : 0,
        laces: look.laces,
        mul: look.legMul,
      });
    }
  };

  // Paint helpers for clothing patterns
  H.plaid = function (c2, scale) {
    const k = scale || 38;
    return function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
      const a = Math.sin(wx * k + wz * k * 0.7) > 0.55,
        bb = Math.sin(wy * k) > 0.55;
      if (a || bb) {
        const m = a && bb ? 0.55 : 0.75;
        const c = L.col(c2);
        out[0] = lerp(out[0], c.r, 1 - m);
        out[1] = lerp(out[1], c.g, 1 - m);
        out[2] = lerp(out[2], c.b, 1 - m);
      }
    };
  };
  H.stripeV = function (c2, halfW) {
    // vertical stripe down the front centre (zip placket)
    const c = L.col(c2);
    return function (x, y, z, nx, ny, nz, out) {
      if (Math.abs(x) < halfW && nz < -0.2) {
        out[0] = c.r;
        out[1] = c.g;
        out[2] = c.b;
      }
    };
  };

  // ==================================================================
  //  OUTFITS
  // ==================================================================
  const OUT = (H.outfits = {});

  /**
   * Project Long Winter cryo suit: grey-white PADDED suit — quilted torso &
   * limbs (stitched channels, puffed panels), a raised ORANGE collar ring,
   * grey boots & gloves, a darker zip placket, the C-9 unit patch on the
   * back and the Long Winter crystal on the left chest.
   */
  const quiltPaint = (pitch, k) => (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
    const q = Math.abs(Math.sin(wy * pitch)),
      d = Math.abs(Math.sin((wx + wz) * pitch * 0.7));
    if (q < 0.12) {
      out[0] *= 1 - k;
      out[1] *= 1 - k;
      out[2] *= 1 - k * 0.9;
    } // stitched channel
    else if (q > 0.85) {
      out[0] *= 1.05;
      out[1] *= 1.05;
      out[2] *= 1.04;
    } // puffed ridge catches light
    if (d < 0.05) {
      out[0] *= 1 - k * 0.5;
      out[1] *= 1 - k * 0.5;
      out[2] *= 1 - k * 0.45;
    } // diamond cross-stitch
  };
