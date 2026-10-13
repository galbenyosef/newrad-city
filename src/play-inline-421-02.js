// play-inline-421 02 — math
// Lines 25-371 of readable/play-inline-421.pretty.js (statement-aligned).
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  // ------------------------------------------------------------------
  // Rotated frame
  // ------------------------------------------------------------------
  /**
   * Local frame at world (px,pz) rotated by three.js yaw `yaw` (local −z = forward).
   * F.w(lx,ly,lz) → world Vector3;  F.xz(lx,lz) → [x,z];  F.pyaw(localPlayerYaw) → world player yaw.
   */
  K.frame = function (px, pz, yaw) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    const F = { px, pz, yaw, c, s };
    F.xz = (lx, lz) => [px + lx * c + lz * s, pz - lx * s + lz * c];
    F.w = (lx, ly, lz) => {
      const p = F.xz(lx, lz);
      return new THREE.Vector3(p[0], ly, p[1]);
    };
    F.pyaw = (ly) => yaw + (ly || 0);
    /** world → local */
    F.local = (x, z) => {
      const dx = x - px,
        dz = z - pz;
      return [dx * c - dz * s, dx * s + dz * c];
    };
    return F;
  };
  /** Builder whose colliders follow frame F (geometry is rotated by K.finishXF). */
  K.xfBuilder = function (o, F) {
    const b = K.builder(o);
    b.F = F;
    b.col = function (x0, y0, z0, x1, y1, z1, oo) {
      const cx = (x0 + x1) / 2,
        cz = (z0 + z1) / 2,
        p = F.xz(cx, cz);
      const c = G.world.addCollider(
        p[0],
        p[1],
        Math.abs(x1 - x0),
        Math.abs(z1 - z0),
        Math.min(y0, y1),
        Math.max(y0, y1),
        -F.yaw,
        Object.assign({ tag: "poi_harbor2", surface: "concrete" }, oo || {}),
      );
      this.colliders.push(c);
      return c;
    };
    b.ocol = function (cx, cz, w, d, y0, y1, yaw, oo) {
      const p = F.xz(cx, cz);
      const c = G.world.addCollider(
        p[0],
        p[1],
        w,
        d,
        y0,
        y1,
        -(F.yaw + (yaw || 0)),
        Object.assign({ tag: "poi_harbor2", surface: "concrete" }, oo || {}),
      );
      this.colliders.push(c);
      return c;
    };
    return b;
  };
  /** Finish a frame builder: merged meshes in a group placed/rotated by its frame. */
  K.finishXF = function (b, parent) {
    const g = b.finish(null);
    if (b.F) {
      g.position.set(b.F.px, 0, b.F.pz);
      g.rotation.y = b.F.yaw;
      g.updateMatrix();
      g.updateMatrixWorld(true);
    }
    if (parent) parent.add(g);
    return g;
  };

  // ------------------------------------------------------------------
  // Ship hull
  // ------------------------------------------------------------------
  /**
   * Lofted hull along local z (bow at +z for kind 'bow'; both ends alike for 'double').
   * o: {cx, cz, len, beam, deck, keel, sheer, kind, nu, nv, boot (y of boot-top), bootTint, tint, rub (rub-rail mat), deckMat, noDeck}
   * Returns {edge(t, side) → [x,y,z] deck edge point, wf}
   */
  K.hull = function (b, mat, o) {
    const cx = o.cx || 0,
      cz = o.cz || 0,
      L = o.len,
      B = o.beam,
      dk = o.deck,
      kl = o.keel,
      sh = o.sheer || 0.6;
    const kind = o.kind || "double",
      nu = o.nu || 12,
      nv = o.nv || 24;
    const wf = (t) => {
      if (kind === "double") {
        const e = Math.abs(2 * t - 1);
        return 0.1 + 0.9 * Math.sqrt(Math.max(0, 1 - Math.pow(e, 3.2)));
      }
      if (t > 0.6)
        return Math.max(0.02, Math.pow(Math.cos(((t - 0.6) / 0.4) * HP), 0.75));
      if (t < 0.08) return 0.78 + 0.22 * (t / 0.08);
      return 1;
    };
    const endE = (t) =>
      kind === "double"
        ? Math.abs(2 * t - 1)
        : t > 0.5
          ? (t - 0.5) * 2
          : (0.5 - t) * 0.6;
    const sheerY = (t) => dk + sh * Math.pow(endE(t), 2);
    const keelY = (t) => kl + (dk - kl) * 0.45 * Math.pow(endE(t), 3);
    const P = [];
    for (let i = 0; i <= nv; i++) {
      const t = i / nv,
        z = cz - L / 2 + L * t,
        w = (wf(t) * B) / 2,
        sy = sheerY(t),
        ky = keelY(t);
      const row = [];
      for (let j = 0; j <= nu; j++) {
        const s = -1 + (2 * j) / nu,
          th = s * HP;
        const y = sy - (sy - ky) * Math.pow(Math.abs(Math.cos(th)), 0.32);
        row.push([cx + w * Math.sin(th), y, z]);
      }
      P.push(row);
    }
    const bk = b._b(mat);
    const base = bk.vc,
      tile = K.tileOf(mat),
      tint = K.tint(o.tint),
      boot = o.boot !== undefined ? o.boot : -0.9;
    const bootT = K.tint(o.bootTint || [0.32, 0.16, 0.12]);
    for (let i = 0; i <= nv; i++)
      for (let j = 0; j <= nu; j++) {
        const p = P[i][j];
        const pi0 = P[Math.max(0, i - 1)][j],
          pi1 = P[Math.min(nv, i + 1)][j],
          pj0 = P[i][Math.max(0, j - 1)],
          pj1 = P[i][Math.min(nu, j + 1)];
        const ax = pi1[0] - pi0[0],
          ay = pi1[1] - pi0[1],
          az = pi1[2] - pi0[2];
        const bx = pj1[0] - pj0[0],
          by = pj1[1] - pj0[1],
          bz = pj1[2] - pj0[2];
        let nx = ay * bz - az * by,
          ny = az * bx - ax * bz,
          nz = ax * by - ay * bx;
        // orient outward (away from the centre line)
        const ox = p[0] - cx,
          oy = p[1] - (dk + kl) / 2;
        if (nx * ox + ny * oy * 0.3 < 0) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }
        const nl = Math.hypot(nx, ny, nz) || 1;
        const tn = p[1] < boot ? bootT : tint;
        b._v(
          bk,
          p[0],
          p[1],
          p[2],
          nx / nl,
          ny / nl,
          nz / nl,
          p[2] / tile[0],
          p[1] / tile[1],
          tn,
          o.grime !== undefined ? o.grime : 0.35,
        );
      }
    const row = nu + 1;
    for (let i = 0; i < nv; i++)
      for (let j = 0; j < nu; j++) {
        const a = base + i * row + j;
        // j runs port deck edge → keel → starboard deck edge, i runs along +z: this winding faces outward
        bk.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    // end cappings (transom / blunt ends): fan from the deck-centre
    const cap = (i, sgn) => {
      const r0 = P[i],
        cyy = (r0[0][1] + r0[nu][1]) / 2,
        zc = r0[0][2];
      for (let j = 0; j < nu; j++) {
        const A = r0[j],
          Bp = r0[j + 1],
          C = [cx, cyy, zc];
        b.quadN(mat, A, Bp, C, C, [0, 0, sgn], {
          tint: A[1] < boot ? bootT : tint,
          grime: 0.35,
        });
      }
    };
    cap(0, -1);
    cap(nv, 1);
    // deck
    if (!o.noDeck) {
      const dm = o.deckMat || "deck";
      for (let i = 0; i < nv; i++) {
        const a = P[i][0],
          c = P[i][nu],
          d = P[i + 1][nu],
          e = P[i + 1][0];
        b.quadN(
          dm,
          [a[0], a[1] - 0.02, a[2]],
          [c[0], c[1] - 0.02, c[2]],
          [d[0], d[1] - 0.02, d[2]],
          [e[0], e[1] - 0.02, e[2]],
          [0, 1, 0],
          { tint: o.deckTint, grime: 0.5 },
        );
      }
    }
    // rub rail (fender band) along the sheer
    const rm = o.rub || "rubber";
    for (let i = 0; i < nv; i++)
      for (const j of [0, nu]) {
        const a = P[i][j],
          c = P[i + 1][j];
        b.beam(
          rm,
          a[0],
          a[1] - 0.25,
          a[2],
          c[0],
          c[1] - 0.25,
          c[2],
          0.28,
          0.3,
          { grime: 0.4 },
        );
      }
    return {
      wf,
      sheerY,
      edge: (t, side) => {
        const i = Math.round(t * nv);
        const r = P[Math.max(0, Math.min(nv, i))];
        return side < 0 ? r[0] : r[nu];
      },
      P,
    };
  };

  // ------------------------------------------------------------------
  // Marine hardware
  // ------------------------------------------------------------------
  /** Pile: timber post from the river bed to `top`; dark algae band under the tide line. */
  K.pile = function (b, x, z, top, r, o) {
    o = o || {};
    r = r || 0.22;
    b.cyl(o.mat || "wood_rotten", x, -1.0, z, r, r * 0.95, top + 1.0, 7, {
      tint: o.tint || [0.62, 0.56, 0.48],
      top: true,
    });
    b.cyl("slime", x, -6, z, r * 1.06, r * 1.06, 5.2, 7, {
      top: false,
      tint: [0.7, 0.8, 0.6],
    });
    if (o.cap) b.cyl("black_iron", x, top - 0.02, z, r * 1.1, r * 1.1, 0.06, 7);
  };
  /** Pile grid under a deck rect (x0..x1, z0..z1) with spacing; skip the inner rows when `edgeOnly`. */
  K.piles = function (b, x0, z0, x1, z1, top, step, o) {
    o = o || {};
    const r = K.rng(o.seed || (x0 * 7 + z0 * 3) | 0);
    for (let x = x0 + 0.3; x <= x1 - 0.3 + 1e-3; x += step)
      for (let z = z0 + 0.3; z <= z1 - 0.3 + 1e-3; z += step) {
        const edge =
          x - x0 < step * 0.9 ||
          x1 - x < step * 0.9 ||
          z - z0 < step * 0.9 ||
          z1 - z < step * 0.9;
        if (o.edgeOnly && !edge) continue;
        if (o.skip && o.skip(x, z)) continue;
        K.pile(
          b,
          x + (r() - 0.5) * 0.15,
          z + (r() - 0.5) * 0.15,
          top - (o.under || 0.3),
          o.r || 0.2,
          { tint: [0.55 + r() * 0.15, 0.5, 0.42] },
        );
      }
  };
  K.bollard = function (b, x, y, z) {
    b.cyl("cast_iron", x, y, z, 0.2, 0.17, 0.45, 9, {
      tint: [0.35, 0.33, 0.3],
    });
    b.cyl("cast_iron", x, y + 0.45, z, 0.26, 0.22, 0.12, 9, {
      tint: [0.35, 0.33, 0.3],
    });
  };
  K.cleat = function (b, x, y, z, yaw) {
    b.box("cast_iron", x, y, z, 0.12, 0.1, 0.12, { yaw });
    b.box("cast_iron", x, y + 0.1, z, 0.5, 0.06, 0.1, { yaw });
  };
  let _torus = null;
  K.torusGeo = () =>
    _torus || (_torus = new THREE.TorusGeometry(1, 0.22, 6, 14));
  /** Ring life-buoy hung on a wall facing (nx,nz), with its little rack. */
  K.lifebuoy = function (b, x, y, z, nx, nz) {
    const ry = Math.atan2(nx, nz);
    b.geo("flat", K.torusGeo(), {
      x: x + nx * 0.12,
      y,
      z: z + nz * 0.12,
      s: 0.34,
      ry,
      tint: [0.92, 0.5, 0.2],
    });
    for (let k = 0; k < 4; k++) {
      const a = k * HP + PI / 4,
        ux = nz,
        uz = -nx;
      b.box(
        "flat",
        x + nx * 0.13 + ux * Math.cos(a) * 0.34,
        y + Math.sin(a) * 0.34 - 0.04,
        z + nz * 0.13 + uz * Math.cos(a) * 0.34,
        0.1,
        0.08,
        0.1,
        { yaw: ry, tint: [0.92, 0.9, 0.85] },
      );
    }
    b.box(
      "black_iron",
      x + nx * 0.04,
      y + 0.3,
      z + nz * 0.04,
      0.06,
      0.1,
      0.08,
      { yaw: ry },
    );
  };
