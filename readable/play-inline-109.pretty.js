/* src/landmarks_a/05_parts.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 05_parts.js
 * Reusable procedural set-dressing built into a Builder: sandbag walls,
 * scrap barricades, shacks, market stalls, crates/barrels/tyres, statues
 * (standing, seated, flying, kneeling Atlas), lions, eagles, dead trees,
 * string lights, turrets, car hulks, spikes & skulls, gore sacks, cages,
 * Glowkeeper sun discs, a parked twin-rotor Rotorcraft, lamp posts, benches.
 * Every function takes the Builder first; colliders are added where the
 * player would bump into the object.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const K = G.LMA.kit;
  const T = K.T;
  const P = (K.parts = {});

  /** Local→world transform helper for yawed placements (three.js yaw). */
  function frame(x, y, z, yaw, s) {
    const c = Math.cos(yaw || 0),
      sn = Math.sin(yaw || 0);
    s = s || 1;
    return {
      p(lx, ly, lz) {
        return [
          x + (lx * c + lz * sn) * s,
          y + ly * s,
          z + (-lx * sn + lz * c) * s,
        ];
      },
      yaw: yaw || 0,
      s,
    };
  }
  P.frame = frame;

  // ------------------------------------------------------------------
  // Fortifications
  // ------------------------------------------------------------------
  /** Unit "pillow" (squashed superellipsoid): a filled sack with rounded seams, spanning [-0.5, 0.5]³. */
  let pillowGeo = null;
  function pillow() {
    if (pillowGeo) return pillowGeo;
    const g = new THREE.SphereGeometry(1, 8, 5);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const sx = Math.sign(x) * Math.pow(Math.abs(x), 0.45),
        sy = Math.sign(y) * Math.pow(Math.abs(y), 0.8),
        sz = Math.sign(z) * Math.pow(Math.abs(z), 0.5);
      // tied ends pinch in slightly
      const pinch = 1 - 0.18 * Math.pow(Math.abs(sx), 6);
      p.setXYZ(i, sx * 0.5, sy * 0.5 * pinch, sz * 0.5 * pinch);
    }
    g.computeVertexNormals();
    pillowGeo = g;
    return g;
  }
  K.T.pillow = pillow;
  /** Sandbag wall from A to B, `rows` high: overlapping khaki sacks, slumped and jittered. */
  P.sandbags = function (b, ax, az, bx, bz, rows, o) {
    o = o || {};
    rows = rows || 3;
    const L = Math.hypot(bx - ax, bz - az),
      dx = (bx - ax) / L,
      dz = (bz - az) / L;
    const yaw = Math.atan2(dx, dz) + Math.PI / 2; // local x along wall
    const r = K.rng(o.seed || ax * 13 + az * 7);
    const bagL = 0.66,
      bagH = 0.26,
      bagD = 0.44,
      y0 = o.y || 0,
      geo = pillow();
    const khaki = [0xc2ae82, 0xb4a076, 0xa89468, 0xc8b88e, 0x9c8a62];
    for (let row = 0; row < rows; row++) {
      const off = (row % 2) * bagL * 0.5;
      const n = Math.floor((L - off) / (bagL * 0.9));
      for (let i = 0; i < n; i++) {
        const t = off + bagL * 0.9 * (i + 0.5);
        const nOff = (r() - 0.5) * 0.06;
        const c = new THREE.Color(
          khaki[Math.floor(r() * khaki.length)],
        ).multiplyScalar(0.92 + r() * 0.14);
        b.geo("sandbag", geo, {
          x: ax + dx * t - dz * nOff,
          y: y0 + row * bagH * 0.86 + bagH * 0.5,
          z: az + dz * t + dx * nOff,
          ry: yaw + (r() - 0.5) * 0.18,
          rz: (r() - 0.5) * 0.08,
          rx: (r() - 0.5) * 0.06,
          sx: bagL * (0.95 + r() * 0.1),
          sy: bagH * (0.9 + r() * 0.2),
          sz: bagD * (0.9 + r() * 0.15),
          tint: c,
          grime: 0.12,
        });
      }
    }
    if (o.collide !== false)
      K.colRot(
        (ax + bx) / 2,
        (az + bz) / 2,
        L,
        bagD,
        y0,
        y0 + rows * bagH * 0.86 + 0.05,
        -Math.atan2(bz - az, bx - ax),
        { surface: "dirt", tag: "cover" },
      );
    return b;
  };

  /** Scrap-metal barricade A→B of height h (sheets, posts, spikes). */
  P.scrapWall = function (b, ax, az, bx, bz, h, o) {
    o = o || {};
    const L = Math.hypot(bx - ax, bz - az),
      dx = (bx - ax) / L,
      dz = (bz - az) / L;
    const yaw = Math.atan2(dx, dz) + Math.PI / 2;
    const r = K.rng(o.seed || ax * 3.1 + az * 5.7);
    let t = 0;
    const mats = o.mats || [
      "corrugated",
      "rust",
      "corrugated",
      "metal",
      "wood_rotten",
    ];
    const y0 = o.y || 0; // base height (e.g. a parapet on a platform)
    while (t < L) {
      const w = Math.min(L - t, 1.1 + r() * 1.6);
      if (w < 0.3) break;
      const m = mats[Math.floor(r() * mats.length)];
      const hh = h * (0.75 + r() * 0.35),
        tilt = (r() - 0.5) * 0.12;
      const cx = ax + dx * (t + w / 2),
        cz = az + dz * (t + w / 2);
      const nOff = (r() - 0.5) * 0.12;
      b.geo(m, T.box, {
        x: cx - dz * nOff,
        y: y0 + hh / 2 - 0.05,
        z: cz + dx * nOff,
        ry: yaw,
        rz: tilt,
        sx: w * 1.05,
        sy: hh,
        sz: 0.06,
        grime: 0.6,
      });
      t += w * 0.92;
    }
    // posts
    for (let s = 0; s <= L; s += 2.4)
      b.beam(
        "rust",
        ax + dx * s,
        y0,
        az + dz * s,
        ax + dx * s,
        y0 + h + 0.3,
        az + dz * s,
        0.12,
        { grime: 0.5 },
      );
    // top spikes / rebar
    if (o.spikes !== false)
      for (let s = 0.4; s < L; s += 0.9 + r() * 0.8) {
        const px = ax + dx * s,
          pz = az + dz * s,
          top = h * (0.9 + r() * 0.3);
        b.beam(
          "rust",
          px,
          y0 + top - 0.3,
          pz,
          px + (r() - 0.5) * 0.3,
          y0 + top + 0.5 + r() * 0.5,
          pz + (r() - 0.5) * 0.3,
          0.035,
        );
      }
    if (o.collide !== false)
      K.colRot(
        (ax + bx) / 2,
        (az + bz) / 2,
        L,
        0.5,
        y0,
        y0 + h,
        -Math.atan2(bz - az, bx - ax),
        { surface: "metal" },
      );
    return b;
  };

  /** Concrete jersey barrier segment. */
  P.jersey = function (b, x, z, yaw, o) {
    o = o || {};
    const f = frame(x, 0, z, yaw);
    const pts = [
      [-0.3, 0],
      [0.3, 0],
      [0.12, 0.3],
      [0.1, 0.82],
      [-0.1, 0.82],
      [-0.12, 0.3],
    ];
    const sh = new THREE.Shape();
    pts.forEach((p, i) => (i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])));
    b.extrude(o.mat || "concrete", sh, 3, {
      x,
      y: 0,
      z,
      ry: yaw + Math.PI / 2,
      tint: o.tint,
      grime: 0.7,
    });
    if (o.collide !== false)
      K.colRot(x, z, 3, 0.6, 0, 0.82, yaw, { tag: "cover" });
    void f;
    return b;
  };

  // ------------------------------------------------------------------
  // Shacks & stalls
  // ------------------------------------------------------------------
  /**
   * Scrap shack. Door on local +z side. o: {door:true, roofMat, seed, windows, sign}
   * Returns the door world position.
   */
  P.shack = function (b, x, z, w, d, h, yaw, o) {
    o = o || {};
    const r = K.rng(o.seed || x * 7 + z * 3);
    const f = frame(x, 0, z, yaw);
    const wallMats = o.mats || [
      "corrugated",
      "corrugated",
      "rust",
      "wood_rotten",
      "metal",
    ];
    const pick = () => wallMats[Math.floor(r() * wallMats.length)];
    const y0 = o.y || 0;
    // walls: back, left, right (panels), front with door gap
    const panelWall = (lx0, lz0, lx1, lz1, hh, gapAt, gapW) => {
      const L = Math.hypot(lx1 - lx0, lz1 - lz0);
      const ux = (lx1 - lx0) / L,
        uz = (lz1 - lz0) / L;
      let t = 0;
      while (t < L - 0.05) {
        const pw = Math.min(L - t, 0.9 + r() * 1.3);
        const mid = t + pw / 2;
        if (
          gapAt === undefined ||
          Math.abs(mid - gapAt) > gapW / 2 + pw / 2 - 0.05
        ) {
          const p = f.p(lx0 + ux * mid, 0, lz0 + uz * mid);
          const wy = yaw + Math.atan2(ux, uz) + Math.PI / 2;
          b.geo(pick(), T.box, {
            x: p[0],
            y: y0 + hh / 2,
            z: p[2],
            ry: wy,
            rz: (r() - 0.5) * 0.05,
            sx: pw * 1.04,
            sy: hh * (0.97 + r() * 0.06),
            sz: 0.05,
            grime: 0.55,
          });
        }
        t += pw;
      }
    };
    panelWall(-w / 2, -d / 2, w / 2, -d / 2, h + 0.35); // back (taller: lean roof)
    panelWall(-w / 2, -d / 2, -w / 2, d / 2, h + 0.1);
    panelWall(w / 2, -d / 2, w / 2, d / 2, h + 0.1);
    const doorW = o.door === false ? 0 : 1.2;
    panelWall(
      -w / 2,
      d / 2,
      w / 2,
      d / 2,
      h,
      o.door === false ? undefined : w * (o.doorAt || 0.5),
      doorW,
    );
    if (o.door !== false) {
      // door frame + hanging curtain / plank
      const dp = f.p(-w / 2 + w * (o.doorAt || 0.5), 0, d / 2);
      b.box("wood", dp[0], y0 + 2.05, dp[2], 1.4, 0.12, 0.12, {
        yaw,
        grime: 0.4,
      });
    }
    // lean-to roof
    const rp = f.p(0, 0, 0);
    b.geo(o.roofMat || "corrugated", T.box, {
      x: rp[0],
      y: y0 + h + 0.25,
      z: rp[2],
      ry: yaw,
      rx: -0.09,
      sx: w + 0.5,
      sy: 0.06,
      sz: d + 0.6,
      grime: 0.7,
    });
    // roof junk: tyre, stones
    if (r() < 0.6) {
      const tp = f.p((r() - 0.5) * w * 0.6, 0, (r() - 0.5) * d * 0.5);
      P.tire(b, tp[0], y0 + h + 0.32, tp[2], true);
    }
    // stovepipe
    if (r() < 0.5) {
      const sp = f.p(w * 0.3, 0, -d * 0.3);
      b.cyl("rust", sp[0], y0 + h, sp[2], 0.12, 0.12, 1.4, 6, { top: false });
    }
    // colliders (4 walls with door gap)
    if (o.collide !== false) {
      const c = (lx0, lz0, lx1, lz1) => {
        const a = f.p(lx0, 0, lz0),
          e = f.p(lx1, 0, lz1);
        K.colWall(a[0], a[2], e[0], e[2], 0.2, y0, y0 + h, []);
      };
      c(-w / 2, -d / 2, w / 2, -d / 2);
      c(-w / 2, -d / 2, -w / 2, d / 2);
      c(w / 2, -d / 2, w / 2, d / 2);
      if (o.door === false) c(-w / 2, d / 2, w / 2, d / 2);
      else {
        const da = w * (o.doorAt || 0.5);
        c(-w / 2, d / 2, -w / 2 + da - 0.65, d / 2);
        c(-w / 2 + da + 0.65, d / 2, w / 2, d / 2);
      }
    }
    return f.p(-w / 2 + w * (o.doorAt || 0.5), 0, d / 2 + 0.8);
  };

  /** Market stall: counter facing local +z, posts, fabric awning, goods. Returns the customer-side position. */
  P.stall = function (b, x, z, w, yaw, o) {
    o = o || {};
    const r = K.rng(o.seed || x * 5 + z * 11);
    const f = frame(x, 0, z, yaw);
    const y0 = o.y || 0;
    const cp = f.p(0, 0, 0.5);
    b.box(o.counterMat || "wood", cp[0], y0, cp[2], w, 1.05, 0.6, {
      yaw,
      grime: 0.5,
    });
    b.box("metal", cp[0], y0 + 1.05, cp[2], w + 0.1, 0.05, 0.7, {
      yaw,
      grime: 0.3,
    });
    // posts
    for (const sx of [-w / 2, w / 2])
      for (const sz of [-1.2, 0.8]) {
        const p = f.p(sx, 0, sz);
        b.beam("wood", p[0], y0, p[2], p[0], y0 + 2.6, p[2], 0.1);
      }
    // awning (sloped fabric, colour-tinted stripes via tint)
    const ap = f.p(0, 0, -0.2);
    const col =
      o.color ||
      [0xa83a2a, 0x3a6a8a, 0xc8a040, 0x5a7a3a, 0x8a5a8a][Math.floor(r() * 5)];
    b.geo("fabric", T.box, {
      x: ap[0],
      y: y0 + 2.62,
      z: ap[2],
      ry: yaw,
      rx: 0.22,
      sx: w + 0.5,
      sy: 0.03,
      sz: 2.4,
      tint: col,
      grime: 0.3,
    });
    // back shelves with goods
    const sp = f.p(0, 0, -1.15);
    b.box("wood_rotten", sp[0], y0, sp[2], w * 0.9, 1.9, 0.4, {
      yaw,
      grime: 0.5,
      faces: "nsewt",
    });
    for (let k = 0; k < 10; k++) {
      const gp = f.p((r() - 0.5) * w * 0.8, 0, -1.0 + (r() - 0.5) * 0.1);
      const gy = y0 + [0.55, 1.1, 1.62][Math.floor(r() * 3)];
      const gm = ["paint_red", "metal", "paint_blue", "paint_yellow", "glass"][
        Math.floor(r() * 5)
      ];
      if (r() < 0.5)
        b.cyl(gm, gp[0], gy, gp[2], 0.06, 0.06, 0.22, 6, { grime: 0.2 });
      else
        b.box(gm, gp[0], gy, gp[2], 0.22, 0.28, 0.16, { yaw: r(), grime: 0.2 });
    }
    // counter items
    for (let k = 0; k < 4; k++) {
      const gp = f.p((r() - 0.5) * w * 0.8, 0, 0.5);
      b.box(
        r() < 0.5 ? "paint_green" : "rust",
        gp[0],
        y0 + 1.1,
        gp[2],
        0.3,
        0.18,
        0.2,
        { yaw: r() * 3, grime: 0.3 },
      );
    }
    // crates beside
    const kp = f.p(w / 2 + 0.6, 0, 0.2);
    P.crate(b, kp[0], y0, kp[2], 0.7, yaw + r());
    if (r() < 0.6) P.crate(b, kp[0], y0 + 0.7, kp[2], 0.55, yaw + r() * 2);
    if (o.collide !== false)
      K.colRot(cp[0], cp[2], w, 0.6, y0, y0 + 1.1, yaw, {
        surface: "wood",
        tag: "cover",
      });
    const back = f.p(0, 0, -1.2);
    if (o.collide !== false)
      K.colRot(back[0], back[2], w * 0.9, 0.4, y0, y0 + 1.9, yaw, {
        surface: "wood",
      });
    return f.p(0, 0, 1.6); // customer stands here; vendor at f.p(0,0,-0.4)
  };

  // ------------------------------------------------------------------
  // Clutter
  // ------------------------------------------------------------------
  P.crate = function (b, x, y, z, s, yaw, o) {
    o = o || {};
    b.box(o.mat || "wood", x, y, z, s, s * 0.8, s, {
      yaw,
      grime: 0.5,
      tint: o.tint,
    });
    // slats
    b.box("wood_dark", x, y + s * 0.38, z, s * 1.02, s * 0.06, s * 1.02, {
      yaw,
      grime: 0.3,
    });
    return b;
  };
  P.barrel = function (b, x, y, z, kind, o) {
    o = o || {};
    const mat =
      kind === "red"
        ? "paint_red"
        : kind === "hazard"
          ? "paint_yellow"
          : kind === "blue"
            ? "paint_blue"
            : "rust";
    b.cyl(mat, x, y, z, 0.3, 0.3, 0.9, 10, {
      grime: 0.7,
      top: kind !== "fire",
    });
    b.cyl("rust", x, y + 0.28, z, 0.31, 0.31, 0.05, 10, {
      grime: 0.6,
      top: false,
    });
    b.cyl("rust", x, y + 0.62, z, 0.31, 0.31, 0.05, 10, {
      grime: 0.6,
      top: false,
    });
    if (kind === "fire") {
      b.cyl("rubble", x, y + 0.7, z, 0.27, 0.2, 0.12, 8, {
        grime: 1,
        tint: 0x333333,
      });
      if (o.glows) o.glows.add(x, y + 1.15, z, 0xff8a30, "m");
      K.fire(x, y + 0.95, z, 0.6);
    } // ('m': a 6 m 'l' halo at head height + the fx flames blew out to a white blob)
    if (kind === "hazard" && o.glows)
      o.glows.add(x, y + 0.95, z, 0xc8ff5a, "m");
    if (o.collide)
      K.colBox(x - 0.3, y, z - 0.3, x + 0.3, y + 0.9, z + 0.3, {
        surface: "metal",
        tag: "cover",
      });
    return b;
  };
  P.tire = function (b, x, y, z, flat) {
    b.geo("rubber", T.torusThick, {
      x,
      y: y + (flat ? 0 : 0.35),
      z,
      rx: flat ? Math.PI / 2 : 0,
      ry: x * 0.3,
      s: 0.32,
      grime: 0,
    });
    return b;
  };
  P.mattress = function (b, x, y, z, yaw) {
    b.box("fabric", x, y, z, 0.9, 0.18, 1.9, {
      yaw,
      tint: 0xb8a888,
      grime: 0.8,
    });
    return b;
  };
  P.table = function (b, x, y, z, yaw, o) {
    o = o || {};
    const f = frame(x, y, z, yaw);
    const w = o.w || 1.2,
      d = o.d || 0.7;
    b.box(o.mat || "wood", x, y + 0.72, z, w, 0.05, d, { yaw, grime: 0.4 });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = f.p(sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06));
        b.beam(o.mat || "wood", p[0], y, p[2], p[0], y + 0.72, p[2], 0.05);
      }
    return b;
  };
  P.chair = function (b, x, y, z, yaw, o) {
    o = o || {};
    const f = frame(x, y, z, yaw);
    const m = o.mat || "wood";
    if (o.fallen) {
      b.geo(m, T.box, {
        x,
        y: y + 0.22,
        z,
        ry: yaw,
        rx: Math.PI / 2,
        sx: 0.44,
        sy: 0.04,
        sz: 0.44,
      });
      b.geo(m, T.box, {
        x: f.p(0, 0, -0.25)[0],
        y: y + 0.05,
        z: f.p(0, 0, -0.25)[2],
        ry: yaw,
        sx: 0.44,
        sy: 0.04,
        sz: 0.5,
      });
      return b;
    }
    b.box(m, x, y + 0.44, z, 0.44, 0.04, 0.44, { yaw, grime: 0.4 });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = f.p(sx * 0.19, 0, sz * 0.19);
        b.beam(m, p[0], y, p[2], p[0], y + 0.44, p[2], 0.035);
      }
    const bp = f.p(0, 0, -0.2);
    b.box(m, bp[0], y + 0.46, bp[2], 0.44, 0.45, 0.04, { yaw, grime: 0.4 });
    return b;
  };
  P.bench = function (b, x, z, yaw, o) {
    o = o || {};
    const f = frame(x, 0, z, yaw);
    for (const sx of [-0.8, 0.8]) {
      const p = f.p(sx, 0, 0);
      b.box("black_metal", p[0], 0, p[2], 0.08, 0.45, 0.5, { yaw });
    }
    for (let k = 0; k < 3; k++) {
      const p = f.p(0, 0, -0.15 + k * 0.15);
      b.box(o.mat || "wood", p[0], 0.45, p[2], 1.9, 0.04, 0.12, {
        yaw,
        grime: 0.5,
      });
    }
    for (let k = 0; k < 2; k++) {
      const p = f.p(0, 0, -0.25);
      b.box(o.mat || "wood", p[0], 0.62 + k * 0.18, p[2], 1.9, 0.1, 0.03, {
        yaw,
        grime: 0.5,
      });
    }
    return b;
  };
  P.lampPost = function (b, glows, x, z, h, o) {
    o = o || {};
    h = h || 4.5;
    b.cyl("black_metal", x, 0, z, 0.14, 0.08, h, 8, { grime: 0.3 });
    b.cyl("black_metal", x, 0, z, 0.22, 0.2, 0.6, 8, { grime: 0.3 });
    if (o.globe !== false) {
      b.geo(o.broken ? "glass_broken" : "lit_warm", T.sphereLo, {
        x,
        y: h + 0.25,
        z,
        s: 0.25,
      });
      b.cyl("black_metal", x, h + 0.45, z, 0.1, 0.2, 0.12, 8);
      if (!o.broken && glows)
        glows.add(x, h + 0.25, z, o.color || 0xffc880, "m");
    }
    return b;
  };
  P.skeleton = function (b, x, y, z, yaw) {
    const f = frame(x, y, z, yaw);
    const sk = f.p(0, 0.12, 0.8);
    b.geo("bone", T.sphereLo, {
      x: sk[0],
      y: sk[1],
      z: sk[2],
      sx: 0.1,
      sy: 0.11,
      sz: 0.12,
    });
    const a = f.p(0, 0.08, 0.6),
      c = f.p(0, 0.08, -0.1);
    b.beam("bone", a[0], a[1], a[2], c[0], c[1], c[2], 0.05);
    for (let i = 0; i < 4; i++) {
      const p = f.p(0, 0.1, 0.5 - i * 0.1);
      const l = f.p(-0.14, 0.05, 0.5 - i * 0.1),
        rr = f.p(0.14, 0.05, 0.5 - i * 0.1);
      b.beam("bone", l[0], l[1], l[2], rr[0], rr[1], rr[2], 0.02);
      void p;
    }
    for (const s of [-1, 1]) {
      const h1 = f.p(s * 0.1, 0.05, -0.1),
        k = f.p(s * 0.15, 0.05, -0.55),
        ft = f.p(s * 0.12, 0.05, -0.95);
      b.beam("bone", h1[0], h1[1], h1[2], k[0], k[1], k[2], 0.035);
      b.beam("bone", k[0], k[1], k[2], ft[0], ft[1], ft[2], 0.03);
    }
    for (const s of [-1, 1]) {
      const sh = f.p(s * 0.17, 0.08, 0.55),
        el = f.p(s * 0.35, 0.05, 0.3),
        hd = f.p(s * 0.3, 0.05, 0.05);
      b.beam("bone", sh[0], sh[1], sh[2], el[0], el[1], el[2], 0.03);
      b.beam("bone", el[0], el[1], el[2], hd[0], hd[1], hd[2], 0.025);
    }
    return b;
  };
  P.rubblePile = function (b, x, z, r, h, o) {
    o = o || {};
    const rn = K.rng(o.seed || x * 17 + z * 13);
    b.geo("rubble", T.dodeca, {
      x,
      y: -h * 0.35,
      z,
      sx: r,
      sy: h,
      sz: r * (0.8 + rn() * 0.4),
      ry: rn() * 3,
      grime: 0.6,
    });
    const n = o.n || Math.round(r * 4);
    for (let i = 0; i < n; i++) {
      const a = rn() * Math.PI * 2,
        d = r * (0.4 + rn() * 0.8);
      const s = 0.2 + rn() * 0.6;
      b.geo(rn() < 0.7 ? o.mat || "concrete" : "brick_red", T.box, {
        x: x + Math.cos(a) * d,
        y: s * 0.3 + rn() * h * 0.4,
        z: z + Math.sin(a) * d,
        rx: rn() * 3,
        ry: rn() * 3,
        rz: rn() * 3,
        sx: s * 1.4,
        sy: s * 0.6,
        sz: s,
        grime: 0.6,
      });
    }
    // rebar
    for (let i = 0; i < 3; i++) {
      const a = rn() * 6.28,
        d = rn() * r * 0.6;
      b.beam(
        "rust",
        x + Math.cos(a) * d,
        h * 0.3,
        z + Math.sin(a) * d,
        x + Math.cos(a) * d + (rn() - 0.5) * 2,
        h * (0.6 + rn()),
        z + Math.sin(a) * d + (rn() - 0.5) * 2,
        0.03,
      );
    }
    if (o.collide)
      K.colRot(x, z, r * 1.3, r * 1.3, 0, h * 0.55, 0, { surface: "rubble" });
    return b;
  };
  /** Car hulk (rounded late-1950s sedan silhouette, tail fins). */
  P.car = function (b, x, z, yaw, o) {
    o = o || {};
    const r = K.rng(o.seed || x * 23 + z * 29);
    const f = frame(x, 0, z, yaw);
    const paints = [0x7a9aa0, 0xb04a3a, 0xd8c8a0, 0x4a6a4a, 0x2a3a5a, 0xc89a40];
    const tint = o.tint || paints[Math.floor(r() * paints.length)];
    const y0 = o.flipped ? 0 : 0.3;
    // body
    const bp = f.p(0, 0, 0);
    b.geo("metal", T.sphere, {
      x: bp[0],
      y: y0 + 0.45,
      z: bp[2],
      ry: yaw,
      sx: 0.95,
      sy: 0.42,
      sz: 2.4,
      tint,
      grime: 0.8,
    });
    b.box("metal", bp[0], y0 + 0.2, bp[2], 1.9, 0.5, 4.2, {
      yaw,
      tint,
      grime: 0.8,
    });
    // cabin
    const cp = f.p(0, 0, -0.2);
    b.geo("metal", T.sphere, {
      x: cp[0],
      y: y0 + 0.8,
      z: cp[2],
      ry: yaw,
      sx: 0.8,
      sy: 0.45,
      sz: 1.2,
      tint,
      grime: 0.8,
    });
    b.geo("glass_broken", T.sphere, {
      x: cp[0],
      y: y0 + 0.82,
      z: cp[2],
      ry: yaw,
      sx: 0.81,
      sy: 0.38,
      sz: 1.0,
    });
    // fins
    for (const s of [-1, 1]) {
      const fp = f.p(s * 0.8, 0, -1.9);
      b.geo("metal", T.box, {
        x: fp[0],
        y: y0 + 0.65,
        z: fp[2],
        ry: yaw,
        rx: -0.4,
        sx: 0.06,
        sy: 0.4,
        sz: 0.8,
        tint,
        grime: 0.8,
      });
    }
    // chrome bumpers
    for (const s of [-1, 1]) {
      const p = f.p(0, 0, s * 2.12);
      b.box("chrome", p[0], y0 + 0.05, p[2], 1.9, 0.18, 0.12, {
        yaw,
        grime: 0.6,
      });
    }
    // wheels (some missing)
    for (const sx of [-1, 1])
      for (const sz of [-1.3, 1.3]) {
        if (r() < 0.25) continue;
        const p = f.p(sx * 0.9, 0, sz);
        b.geo("rubber", T.cyl12, {
          x: p[0],
          y: 0.32,
          z: p[2],
          ry: yaw,
          rz: Math.PI / 2,
          sx: 0.32,
          sy: 0.22,
          sz: 0.32,
          grime: 0,
        });
      }
    if (o.collide !== false)
      K.colRot(x, z, 2.0, 4.4, 0, 1.4, yaw, { surface: "metal", tag: "cover" });
    return b;
  };
  P.spike = function (b, x, z, h, o) {
    o = o || {};
    b.beam("wood_rotten", x, 0, z, x + 0.1, h, z + 0.05, 0.1);
    if (o.skull !== false)
      b.geo("bone", T.sphereLo, {
        x: x + 0.1,
        y: h + 0.1,
        z: z + 0.05,
        sx: 0.12,
        sy: 0.14,
        sz: 0.15,
      });
    if (o.gore)
      b.geo("flesh", T.dodeca, { x: x + 0.05, y: h - 0.4, z, s: 0.18 });
    return b;
  };
  /** Hanging gore sack (Brute larder) under a chain from `top`. */
  P.meatBag = function (b, x, top, z, o) {
    o = o || {};
    const len = o.len || 1.2;
    b.beam("rust", x, top, z, x, top - len, z, 0.03);
    b.geo("flesh", T.sphere, {
      x,
      y: top - len - 0.5,
      z,
      sx: 0.38,
      sy: 0.6,
      sz: 0.34,
      ry: x,
      grime: 0.4,
    });
    b.geo("fabric", T.sphereLo, {
      x: x + 0.05,
      y: top - len - 0.3,
      z: z + 0.03,
      sx: 0.36,
      sy: 0.4,
      sz: 0.36,
      tint: 0x7a4a3a,
      grime: 0.6,
    });
    return b;
  };
  P.cage = function (b, x, z, w, h, o) {
    o = o || {};
    const y0 = o.y || 0;
    b.box("rust", x, y0, z, w, 0.1, w, { grime: 0.6 });
    b.box("rust", x, y0 + h, z, w, 0.08, w, { grime: 0.6 });
    for (let i = 0; i <= 6; i++)
      for (const side of [0, 1, 2, 3]) {
        const t = -w / 2 + (w * i) / 6;
        const px = side < 2 ? x + t : x + (side === 2 ? -w / 2 : w / 2),
          pz = side < 2 ? z + (side === 0 ? -w / 2 : w / 2) : z + t;
        b.beam("rust", px, y0, pz, px, y0 + h, pz, 0.04);
      }
    if (o.hollow) {
      // a cage somebody is locked IN: four thin barred walls (not a solid block around the prisoner), tagged like an
      // interactable's own collider so the bars stop you but you can still talk to whoever is inside
      const t = 0.06,
        hw = w / 2,
        co = { surface: "metal", tag: "interactable_self", walkable: false };
      K.colBox(x - hw, y0, z - hw, x + hw, y0 + h, z - hw + t, co);
      K.colBox(x - hw, y0, z + hw - t, x + hw, y0 + h, z + hw, co);
      K.colBox(x - hw, y0, z - hw, x - hw + t, y0 + h, z + hw, co);
      K.colBox(x + hw - t, y0, z - hw, x + hw, y0 + h, z + hw, co);
    } else if (o.collide !== false)
      K.colBox(x - w / 2, y0, z - w / 2, x + w / 2, y0 + h, z + w / 2, {
        surface: "metal",
      });
    return b;
  };

  // ------------------------------------------------------------------
  // Statuary
  // ------------------------------------------------------------------
  /**
   * Stylised human statue. pose: 'stand'|'raised'|'seated'|'flying'|'atlas'|'robed'|'reclined'.
   * Local frame: faces +z, height ≈ 2 m × s.
   */
  P.figure = function (b, mat, x, y, z, yaw, s, pose, o) {
    o = o || {};
    const f = frame(x, y, z, yaw, s);
    const limb = (a, c, r) => {
      const A = f.p(a[0], a[1], a[2]),
        C = f.p(c[0], c[1], c[2]);
      b.beam(mat, A[0], A[1], A[2], C[0], C[1], C[2], r * 2 * s, {
        round: 8,
        grime: o.grime,
      });
    };
    const blob = (p, sx, sy, sz, rx) => {
      const P0 = f.p(p[0], p[1], p[2]);
      b.geo(mat, T.sphere, {
        x: P0[0],
        y: P0[1],
        z: P0[2],
        ry: yaw,
        rx: rx || 0,
        sx: sx * s,
        sy: sy * s,
        sz: sz * s,
        grime: o.grime,
      });
    };
    let hip = [0, 0.95, 0],
      chest = [0, 1.35, 0],
      head = [0, 1.75, 0.02];
    let lean = 0;
    if (pose === "flying") {
      hip = [0, 0.9, -0.2];
      chest = [0, 1.3, 0.15];
      head = [0, 1.62, 0.35];
      lean = 0.6;
    }
    if (pose === "seated") {
      hip = [0, 0.55, -0.1];
      chest = [0, 0.98, -0.1];
      head = [0, 1.38, -0.08];
    }
    if (pose === "atlas") {
      hip = [0, 0.7, -0.1];
      chest = [0, 1.1, 0.05];
      head = [0, 1.42, 0.22];
      lean = 0.35;
    }
    if (pose === "reclined") {
      hip = [0, 0.35, -0.4];
      chest = [0, 0.6, 0.1];
      head = [0, 0.85, 0.45];
      lean = 1.0;
    }
    blob(chest, 0.23, 0.3, 0.15, lean);
    blob(hip, 0.2, 0.16, 0.14, lean * 0.5);
    limb(hip, chest, 0.14);
    blob(head, 0.12, 0.14, 0.13);
    limb(
      [chest[0], chest[1] + 0.2, chest[2]],
      [head[0], head[1] - 0.12, head[2]],
      0.055,
    );
    const sh = (sx) => [sx * 0.22, chest[1] + 0.16, chest[2]];
    // legs
    if (pose === "seated") {
      for (const sx of [-1, 1]) {
        limb(
          [sx * 0.11, hip[1], hip[2]],
          [sx * 0.13, hip[1] + 0.02, 0.4],
          0.085,
        );
        limb([sx * 0.13, hip[1] + 0.02, 0.4], [sx * 0.14, 0.05, 0.45], 0.07);
      }
    } else if (pose === "flying") {
      limb([-0.1, hip[1], hip[2]], [-0.14, 0.55, -0.55], 0.085);
      limb([-0.14, 0.55, -0.55], [-0.12, 0.25, -0.95], 0.07);
      limb([0.1, hip[1], hip[2]], [0.16, 0.35, -0.05], 0.085);
      limb([0.16, 0.35, -0.05], [0.14, 0.05, -0.5], 0.07);
    } else if (pose === "atlas") {
      limb([-0.1, hip[1], hip[2]], [-0.16, 0.5, 0.4], 0.09);
      limb([-0.16, 0.5, 0.4], [-0.16, 0.04, 0.45], 0.075);
      limb([0.1, hip[1], hip[2]], [0.16, 0.08, -0.25], 0.09);
      limb([0.16, 0.08, -0.25], [0.16, 0.06, -0.75], 0.075);
    } else if (pose === "reclined") {
      for (const sx of [-1, 1]) {
        limb([sx * 0.1, hip[1], hip[2]], [sx * 0.14, 0.2, -0.95], 0.085);
        limb([sx * 0.14, 0.2, -0.95], [sx * 0.14, 0.12, -1.5], 0.07);
      }
    } else {
      for (const sx of [-1, 1]) {
        limb([sx * 0.1, hip[1], 0], [sx * 0.12, 0.5, 0.02], 0.085);
        limb([sx * 0.12, 0.5, 0.02], [sx * 0.12, 0.06, 0], 0.07);
        blob([sx * 0.12, 0.04, 0.06], 0.06, 0.04, 0.12);
      }
    }
    if (pose === "robed" || o.robe) {
      const rp = f.p(0, 0, 0);
      b.geo(mat, T.cone8, {
        x: rp[0],
        y: y + 0.62 * s,
        z: rp[2],
        ry: yaw,
        sx: 0.36 * s,
        sy: 1.25 * s,
        sz: 0.3 * s,
        rx: Math.PI,
        grime: o.grime,
      });
    }
    // arms
    const arm = (sx, el, hand) => {
      limb(sh(sx), el, 0.06);
      limb(el, hand, 0.05);
      blob(hand, 0.05, 0.06, 0.05);
    };
    if (pose === "raised") {
      arm(1, [0.3, 1.8, 0.05], [0.32, 2.2, 0.08]);
      arm(-1, [-0.3, 1.1, 0.05], [-0.28, 0.82, 0.12]);
    } else if (pose === "flying") {
      arm(1, [0.35, 1.7, 0.4], [0.4, 2.05, 0.6]);
      arm(-1, [-0.4, 1.25, 0.2], [-0.62, 1.1, 0.0]);
    } else if (pose === "atlas") {
      arm(1, [0.42, 1.55, 0.05], [0.4, 1.95, 0.0]);
      arm(-1, [-0.42, 1.55, 0.05], [-0.4, 1.95, 0.0]);
    } else if (pose === "seated") {
      arm(1, [0.3, 0.8, 0.05], [0.3, 0.62, 0.3]);
      arm(-1, [-0.3, 0.85, 0.0], [-0.34, 0.65, 0.25]);
    } else if (pose === "reclined") {
      arm(1, [0.35, 0.45, 0.2], [0.4, 0.3, 0.5]);
      arm(-1, [-0.35, 0.6, 0.3], [-0.3, 0.9, 0.55]);
    } else {
      arm(1, [0.3, 1.12, 0.02], [0.32, 0.82, 0.06]);
      arm(-1, [-0.3, 1.12, 0.02], [-0.32, 0.82, 0.06]);
    }
    // wings on helmet (Mercury)
    if (o.wingedHat)
      for (const sx of [-1, 1]) {
        const a = f.p(sx * 0.1, head[1] + 0.05, head[2]),
          c = f.p(sx * 0.3, head[1] + 0.22, head[2] - 0.12);
        b.beam(mat, a[0], a[1], a[2], c[0], c[1], c[2], 0.03 * s, {
          d: 0.14 * s,
        });
      }
    return f;
  };

  /** Reclining library lion on its own (no pedestal). Faces local +z. */
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
  P.rotorcraft = function (b, x, y, z, yaw, o) {
    o = o || {};
    const f = frame(x, y, z, yaw);
    const hull = o.mat || "metal_dark",
      tint = o.tint || 0x5a6258;
    const P0 = (lx, ly, lz) => f.p(lx, ly, lz);
    // long boxy fuselage with a rounded nose and a glazed cockpit
    let p = P0(0, 0, -0.5);
    b.box(hull, p[0], 0.55, p[2], 2.7, 2.3, 10.5, { yaw, tint, grime: 0.5 });
    p = P0(0, 0, 5.0);
    b.geo(hull, T.sphere, {
      x: p[0],
      y: 1.65,
      z: p[2],
      ry: yaw,
      sx: 1.35,
      sy: 1.15,
      sz: 1.3,
      tint,
      grime: 0.5,
    });
    p = P0(0, 0, 5.3);
    b.geo("glass", T.sphere, {
      x: p[0],
      y: 2.0,
      z: p[2],
      ry: yaw,
      rx: 0.25,
      sx: 1.2,
      sy: 0.75,
      sz: 1.0,
    });
    // rear loading ramp (half down) and the two rotor pylons: a low one forward, a tall one aft
    p = P0(0, 0, -6.4);
    b.geo(hull, T.box, {
      x: p[0],
      y: 0.75,
      z: p[2],
      ry: yaw,
      rx: -0.5,
      sx: 2.5,
      sy: 0.12,
      sz: 2.0,
      tint,
    });
    const hubs = [
      [0, 3.35, 3.4, 0.9],
      [0, 4.4, -4.8, 1.9],
    ];
    for (const hq of hubs) {
      p = P0(hq[0], 0, hq[2]);
      b.box(hull, p[0], 2.85, p[2], 1.4, hq[1] - 2.85, 1.8, {
        yaw,
        tint,
        grime: 0.4,
      });
      b.cyl("black_metal", p[0], hq[1], p[2], 0.25, 0.25, 0.4, 8);
      // three drooping blades per rotor
      for (let k = 0; k < 3; k++) {
        const an = k * 2.094 + hq[2] * 0.3;
        b.beam(
          "black_metal",
          p[0],
          hq[1] + 0.35,
          p[2],
          p[0] + Math.cos(an) * 5.6,
          hq[1] + 0.1,
          p[2] + Math.sin(an) * 5.6,
          0.12,
          { d: 0.5 },
        );
      }
    }
    // side sponsons + fixed wheels
    for (const sx of [-1, 1]) {
      p = P0(sx * 1.55, 0, -0.8);
      b.box(hull, p[0], 0.25, p[2], 0.5, 0.7, 4.2, { yaw, tint, grime: 0.5 });
      for (const sz of [3.6, -2.0]) {
        const q = P0(sx * 1.35, 0, sz);
        b.geo("rubber", T.cyl12, {
          x: q[0],
          y: 0.32,
          z: q[2],
          ry: yaw,
          rz: Math.PI / 2,
          sx: 0.32,
          sy: 0.24,
          sz: 0.32,
          grime: 0,
        });
      }
    }
    // side door open + door gun
    p = P0(1.37, 1.4, 2.0);
    b.box("black_metal", p[0], 0.75, p[2], 0.1, 1.7, 1.4, {
      yaw,
      tint: 0x222222,
    });
    let a = P0(1.6, 1.6, 2.2),
      c = P0(2.6, 1.5, 2.8);
    b.beam("black_metal", a[0], a[1], a[2], c[0], c[1], c[2], 0.12, {
      round: 6,
    });
    if (o.collide !== false)
      K.colRot(x, z, 3.4, 12.5, 0, 3.0, yaw, { surface: "metal" });
    return b;
  };

  /** Flagpole with a waving flag (rect from K.flag). */
  P.flagpole = function (b, x, z, h, rect, face, o) {
    o = o || {};
    const y0 = o.y || 0;
    b.cyl(o.poleMat || "metal", x, y0, z, 0.08, 0.05, h, 6, { grime: 0.3 });
    b.geo(o.finialMat || "gold", T.sphereLo, {
      x,
      y: y0 + h + 0.08,
      z,
      s: 0.1,
    });
    if (rect)
      K.addFlag(
        b,
        rect,
        x,
        y0 + h - 0.15,
        z,
        face || 0,
        o.w || 2.4,
        o.h || 1.2,
      );
    return b;
  };

  /** Searchlight on stand (lens is emissive; beam optional as additive shaft). */
  P.searchlight = function (b, glows, x, y, z, yaw, pitch) {
    const f = frame(x, y, z, yaw);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      b.beam(
        "black_metal",
        x,
        y + 1.1,
        z,
        x + Math.cos(a) * 0.6,
        y,
        z + Math.sin(a) * 0.6,
        0.05,
      );
    }
    const p = f.p(0, 1.4, 0);
    b.geo("metal_dark", T.cyl12, {
      x: p[0],
      y: y + 1.4,
      z: p[2],
      ry: yaw,
      rx: Math.PI / 2 - (pitch || 0.3),
      sx: 0.4,
      sy: 0.7,
      sz: 0.4,
    });
    const l = f.p(0, 0, 0.36);
    b.geo("lit_white", T.cyl12, {
      x: l[0],
      y: y + 1.4 + Math.sin(pitch || 0.3) * 0.36,
      z: l[2],
      ry: yaw,
      rx: Math.PI / 2 - (pitch || 0.3),
      sx: 0.36,
      sy: 0.02,
      sz: 0.36,
    });
    // lens glint only ('m' on the lens): a 6 m 'l' halo at head height read as a white fog blob by day
    if (glows)
      glows.add(
        l[0],
        y + 1.4 + Math.sin(pitch || 0.3) * 0.36,
        l[2],
        0xfff4e0,
        "m",
      );
    return b;
  };

  /** Neon/painted sign board on posts or wall (uses atlas rect). face = three yaw of normal. */
  P.signBoard = function (b, mat, rect, cx, cy, cz, w, h, face, o) {
    o = o || {};
    if (o.backing !== false) {
      const nx = Math.sin(face),
        nz = Math.cos(face);
      b.box(
        o.backMat || "metal_dark",
        cx - nx * 0.06,
        cy - h / 2 - 0.06,
        cz - nz * 0.06,
        w + 0.12,
        h + 0.12,
        0.1,
        { yaw: face, grime: 0.5 },
      );
    }
    b.panel(mat, cx, cy, cz, w, h, face, {
      rect,
      off: 0.02,
      double: !!o.double,
    });
    return b;
  };
})();
