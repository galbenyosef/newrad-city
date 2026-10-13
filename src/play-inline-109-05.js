// play-inline-109 05 — math
// Lines 1001-1352 of readable/play-inline-109.pretty.js (statement-aligned).
  P.lion = function (b, mat, x, y, z, yaw, s) {
    const f = frame(x, y, z, yaw, s);
    const blob = (p, sx, sy, sz, rx) => {
      const q = f.p(p[0], p[1], p[2]);
      b.geo(mat, T.sphere, {
        x: q[0],
        y: q[1],
        z: q[2],
        ry: yaw,
        rx: rx || 0,
        sx: sx * s,
        sy: sy * s,
        sz: sz * s,
      });
    };
    const limb = (a, c, r) => {
      const A = f.p(a[0], a[1], a[2]),
        C = f.p(c[0], c[1], c[2]);
      b.beam(mat, A[0], A[1], A[2], C[0], C[1], C[2], r * 2 * s, { round: 8 });
    };
    blob([0, 0.42, -0.2], 0.42, 0.36, 0.95); // body
    blob([0, 0.5, -0.9], 0.42, 0.42, 0.45); // haunch
    blob([0, 0.82, 0.6], 0.5, 0.52, 0.42, -0.3); // mane
    blob([0, 0.9, 0.9], 0.24, 0.26, 0.3); // face
    blob([0, 0.82, 1.15], 0.13, 0.11, 0.12); // muzzle
    for (const sx of [-1, 1]) {
      limb([sx * 0.22, 0.35, 0.55], [sx * 0.22, 0.12, 1.25], 0.11); // forelegs extended
      blob([sx * 0.22, 0.08, 1.32], 0.12, 0.08, 0.16);
      limb([sx * 0.3, 0.35, -0.95], [sx * 0.33, 0.1, -0.3], 0.1); // hind leg tucked
    }
    limb([0, 0.3, -1.3], [0.4, 0.08, -1.2], 0.04);
    limb([0.4, 0.08, -1.2], [0.7, 0.08, -0.7], 0.035); // tail
    return b;
  };

  /** Stylised eagle. o.head=true → gargoyle head only (Chrysler). */
  P.eagle = function (b, mat, x, y, z, yaw, s, o) {
    o = o || {};
    const f = frame(x, y, z, yaw, s);
    const blob = (p, sx, sy, sz, rx) => {
      const q = f.p(p[0], p[1], p[2]);
      b.geo(mat, T.sphere, {
        x: q[0],
        y: q[1],
        z: q[2],
        ry: yaw,
        rx: rx || 0,
        sx: sx * s,
        sy: sy * s,
        sz: sz * s,
      });
    };
    if (o.head) {
      blob([0, 0, 0], 0.3, 0.32, 0.9, -0.1); // neck
      blob([0, 0.12, 0.85], 0.32, 0.34, 0.42); // head
      const bk = f.p(0, 0.05, 1.3);
      b.geo(mat, T.cone6, {
        x: bk[0],
        y: bk[1],
        z: bk[2],
        ry: yaw,
        rx: Math.PI / 2 + 0.4,
        sx: 0.12 * s,
        sy: 0.45 * s,
        sz: 0.16 * s,
      });
      // stylised feather fins
      for (let i = 0; i < 3; i++) {
        const p = f.p(0, 0.3 - i * 0.05, 0.3 - i * 0.35);
        b.geo(mat, T.box, {
          x: p[0],
          y: p[1],
          z: p[2],
          ry: yaw,
          rx: -0.5,
          sx: 0.5 * s,
          sy: 0.05 * s,
          sz: 0.4 * s,
        });
      }
      return b;
    }
    blob([0, 0.5, 0], 0.35, 0.55, 0.35, 0.2); // body
    blob([0, 1.1, 0.12], 0.2, 0.22, 0.24); // head
    const bk = f.p(0, 1.07, 0.38);
    b.geo(mat, T.cone6, {
      x: bk[0],
      y: bk[1],
      z: bk[2],
      ry: yaw,
      rx: Math.PI / 2 + 0.6,
      sx: 0.07 * s,
      sy: 0.25 * s,
      sz: 0.09 * s,
    });
    for (const sx of [-1, 1]) {
      const a = f.p(sx * 0.3, 0.8, -0.05),
        c = f.p(sx * (o.spread || 1.3), o.wingsUp ? 1.5 : 0.95, -0.2);
      b.beam(mat, a[0], a[1], a[2], c[0], c[1], c[2], 0.08 * s, { d: 0.5 * s });
      const d2 = f.p(
        sx * (o.spread || 1.3) * 0.8,
        o.wingsUp ? 1.2 : 0.6,
        -0.25,
      );
      b.beam(mat, c[0], c[1], c[2], d2[0], d2[1] - 0.4 * s, d2[2], 0.06 * s, {
        d: 0.4 * s,
      });
    }
    const t = f.p(0, 0.05, -0.35);
    b.geo(mat, T.box, {
      x: t[0],
      y: t[1],
      z: t[2],
      ry: yaw,
      rx: 0.5,
      sx: 0.4 * s,
      sy: 0.06 * s,
      sz: 0.5 * s,
    });
    return b;
  };

  /** Dead tree (trunk + recursive bare branches). */
  P.deadTree = function (b, x, z, h, o) {
    o = o || {};
    const r = K.rng(o.seed || x * 31 + z * 17);
    const y0 = o.y || 0;
    const trunkR = h * 0.035;
    b.cyl(
      o.mat || "wood_dark",
      x,
      y0,
      z,
      trunkR * 1.3,
      trunkR * 0.7,
      h * 0.55,
      6,
      { top: false, grime: 0.3 },
    );
    const branch = (px, py, pz, ang, pitch, len, rds, depth) => {
      const ex = px + Math.cos(ang) * Math.cos(pitch) * len,
        ey = py + Math.sin(pitch) * len,
        ez = pz + Math.sin(ang) * Math.cos(pitch) * len;
      b.beam(o.mat || "wood_dark", px, py, pz, ex, ey, ez, rds * 2, {
        round: 6,
        grime: 0.2,
      });
      if (depth <= 0) return;
      const n = 2 + (r() < 0.4 ? 1 : 0);
      for (let i = 0; i < n; i++)
        branch(
          ex,
          ey,
          ez,
          ang + (r() - 0.5) * 1.6,
          Math.max(0.1, pitch + (r() - 0.4) * 0.6),
          len * (0.55 + r() * 0.2),
          rds * 0.6,
          depth - 1,
        );
    };
    const n = 3 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++)
      branch(
        x,
        y0 + h * (0.4 + r() * 0.15),
        z,
        r() * Math.PI * 2,
        0.5 + r() * 0.6,
        h * 0.4,
        trunkR * 0.7,
        o.depth !== undefined ? o.depth : 2,
      );
    if (o.collide !== false)
      K.colBox(
        x - trunkR,
        y0,
        z - trunkR,
        x + trunkR,
        y0 + h * 0.5,
        z + trunkR,
        { surface: "wood" },
      );
    return b;
  };

  /** String of bulbs along points [[x,y,z]...] with sag. Wire into builder, bulbs into glow set. */
  P.bulbs = function (b, glows, pts, o) {
    o = o || {};
    const spacing = o.spacing || 1.2;
    const cols = o.colors || [0xffd9a0];
    let n = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1];
      const L = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
      const sag = o.sag !== undefined ? o.sag : L * 0.06;
      const cable = b.cable(
        "black_metal",
        a[0],
        a[1],
        a[2],
        c[0],
        c[1],
        c[2],
        sag,
        0.03,
        Math.max(4, Math.round(L / 1.6)),
      );
      const m = Math.floor(L / spacing);
      for (let k = 1; k < m; k++) {
        const t = k / m;
        const x = a[0] + (c[0] - a[0]) * t,
          y = a[1] + (c[1] - a[1]) * t - sag * 4 * t * (1 - t) - 0.08,
          z = a[2] + (c[2] - a[2]) * t;
        if (o.broken && K.rng(n * 7 + 3)() < o.broken) {
          n++;
          continue;
        }
        glows.add(x, y, z, cols[n % cols.length], o.size || "s");
        if (o.bulbMesh !== false) {
          b.geo("lit_warm", T.sphereLo, {
            x,
            y,
            z,
            s: 0.06,
            tint: cols[n % cols.length],
          });
          b.box("black_metal", x, y + 0.035, z, 0.04, 0.055, 0.04, {
            grime: 0,
          }); // socket: the bulb hangs off the wire, it doesn't float under it
        }
        n++;
      }
      void cable;
    }
    return n;
  };

  /** Automated turret on tripod (static prop; combat may animate its own). Faces local +z. */
  P.turret = function (b, x, y, z, yaw, o) {
    o = o || {};
    const f = frame(x, y, z, yaw);
    const m = o.mat || "metal_dark";
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      b.beam(
        m,
        x,
        y + 1.0,
        z,
        x + Math.cos(a) * 0.7,
        y,
        z + Math.sin(a) * 0.7,
        0.06,
      );
    }
    b.cyl(m, x, y + 0.95, z, 0.18, 0.18, 0.2, 8);
    const bp = f.p(0, 1.3, 0);
    b.box(o.bodyMat || "paint_green", bp[0], y + 1.12, bp[2], 0.55, 0.42, 0.7, {
      yaw,
      grime: 0.5,
    });
    for (const sx of [-0.12, 0.12]) {
      const a = f.p(sx, 1.3, 0.3),
        c = f.p(sx, 1.3, 1.1);
      b.beam("black_metal", a[0], y + 1.33, a[2], c[0], y + 1.33, c[2], 0.07, {
        round: 6,
      });
    }
    const sp = f.p(0, 0, 0.36);
    b.geo("lit_red", T.sphereLo, { x: sp[0], y: y + 1.5, z: sp[2], s: 0.05 });
    const ab = f.p(0.4, 0, -0.1);
    b.box("paint_green", ab[0], y + 1.0, ab[2], 0.25, 0.25, 0.35, { yaw });
    if (o.collide !== false)
      K.colBox(x - 0.4, y, z - 0.4, x + 0.4, y + 1.4, z + 0.4, {
        surface: "metal",
      });
    return b;
  };

  /**
   * Static (decorative) turret exported as a named, hideable prop: its own tiny merged group + collider,
   * so combat can swap it for a live turret via G.landmarks.setStaticTurret(site, name, false).
   */
  K.staticTurret = function (rec, name, x, y, z, yaw, o) {
    const tb = K.builder("turret_" + rec.id + "_" + name, { grime: 0.5 });
    P.turret(tb, x, y, z, yaw, Object.assign({}, o || {}, { collide: false }));
    const group = tb.finish(rec.root, { lod: 220 });
    const box = [x - 0.4, y, z - 0.4, x + 0.4, y + 1.4, z + 0.4];
    rec.staticTurrets = rec.staticTurrets || {};
    rec.staticTurrets[name] = {
      group,
      box,
      collider: K.colBox(box[0], box[1], box[2], box[3], box[4], box[5], {
        surface: "metal",
      }),
      parent: rec.root,
      visible: true,
    };
    return group;
  };

  /** Glowkeeper sun disc: a flat emissive disc in a ring with twelve wedge rays (faces local +z after yaw). */
  P.sunDisc = function (b, x, y, z, s, yaw, o) {
    o = o || {};
    const m = o.mat || "lit_warm",
      tint = o.tint || 0xffc04a;
    const f = frame(x, y, z, yaw);
    b.geo(m, T.cyl12, {
      x,
      y,
      z,
      ry: yaw,
      rx: Math.PI / 2,
      sx: s * 0.42,
      sy: 0.06,
      sz: s * 0.42,
      tint,
    });
    b.geo(m, T.torus, {
      x,
      y,
      z,
      ry: yaw,
      sx: s * 0.6,
      sy: s * 0.6,
      sz: s * 0.6,
      tint,
    });
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6,
        L = s * (i % 2 ? 0.25 : 0.38),
        rr = s * 0.66 + L / 2;
      const p = f.p(Math.cos(a) * rr, Math.sin(a) * rr, 0);
      b.geo(m, T.box, {
        x: p[0],
        y: p[1],
        z: p[2],
        ry: yaw,
        rz: a - Math.PI / 2,
        sx: s * 0.08,
        sy: L,
        sz: 0.05,
        tint,
      });
    }
    if (o.glows) o.glows.add(x, y, z, 0xffb040, s > 1.5 ? "xl" : "l");
    return b;
  };

  /** Parked twin-rotor Rotorcraft (tandem rotors fore and aft, boxy hull, no wings). Nose toward local +z. */
