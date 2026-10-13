// play-inline-134 04 — math
// Lines 1874-2943 of readable/play-inline-134.pretty.js (statement-aligned).
  function buildStatue(b) {
    const V = "verdigris";
    const n0 = (b.parts.get(V) || []).length; // everything added in V from here on gets the patina pass at the end
    const o = { grime: 0, aoH: 5, ground: -2, uv: "keep" }; // cavity AO comes from the surfaces themselves (aoMul)
    const sm = LB.smooth;
    const gauss = (x, s) => Math.exp(-(x * x) / (s * s));
    const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const cr = (p0, p1, p2, p3, t) => {
      const t2 = t * t,
        t3 = t2 * t;
      return (
        0.5 *
        (2 * p1 +
          (-p0 + p2) * t +
          (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
          (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
      );
    };

    /** Fold profile: -1 at a sharp crease, rising steeply to broad rounded ridges (+1). */
    const crease = (x) => 2 * Math.sqrt(0.5 + 0.5 * Math.sin(x)) - 1;
    /**
     * Patina run-off on the copper skin (post-pass on a finished geometry's vertex colours, world space): long vertical
     * streaks — darker blue-green where rain runs, a paler mint bloom beside them, and a brown-copper tint where the
     * patina is thin (undersides, deep creases).
     */
    const patina = (g, amt) => {
      if (!g || !g.attributes.color) return g;
      amt = amt === undefined ? 1 : amt;
      const P = g.attributes.position,
        Cc = g.attributes.color,
        N = g.attributes.normal;
      for (let i = 0; i < P.count; i++) {
        const x = P.getX(i),
          y = P.getY(i),
          z = P.getZ(i);
        const hcoord = x * 0.83 + z * 0.56;
        const run =
          Math.max(0, U.noise2(hcoord * 2.3, y * 0.035 + 1.7) - 0.5) * 2.4; // dark rain runs
        const bloom =
          Math.max(0, U.noise2(hcoord * 1.1 + 9.2, y * 0.02) - 0.55) * 2.0; // pale mint bloom
        const under = N ? Math.max(0, -N.getY(i)) : 0; // thin patina below overhangs
        const kr = 1 - 0.34 * run + 0.1 * bloom + 0.18 * under,
          kg = 1 - 0.22 * run + 0.12 * bloom - 0.1 * under,
          kb = 1 - 0.12 * run + 0.1 * bloom - 0.28 * under;
        const f = amt;
        Cc.setXYZ(
          i,
          Cc.getX(i) * (1 + (kr - 1) * f),
          Cc.getY(i) * (1 + (kg - 1) * f),
          Cc.getZ(i) * (1 + (kb - 1) * f),
        );
      }
      Cc.needsUpdate = true;
      return g;
    };
    // ---- body section profile: [y, A (half width, x), B (half depth, z), zc (centre z), n (superellipse exponent)]
    const PROF = [
      [0.0, 6.0, 5.0, -0.75, 2.0],
      [1.2, 5.75, 4.6, -0.5, 2.0],
      [3.5, 5.4, 4.25, -0.3, 2.0],
      [7.0, 5.15, 4.0, -0.12, 2.0],
      [11.0, 5.0, 3.85, 0.0, 2.1],
      [14.0, 4.85, 3.7, 0.02, 2.2],
      [17.0, 4.55, 3.45, 0.05, 2.2],
      [20.0, 4.8, 3.55, 0.12, 2.35],
      [22.6, 5.12, 3.45, 0.06, 2.7],
      [24.3, 5.05, 3.15, 0.0, 3.0],
      [25.5, 4.35, 2.85, 0.0, 2.7],
      [26.25, 3.0, 2.3, 0.05, 2.3],
      [26.8, 1.72, 1.66, 0.1, 2.0],
      [27.5, 1.36, 1.38, 0.14, 2.0],
      [29.2, 1.2, 1.2, 0.18, 2.0],
    ];
    const Y_TOP = PROF[PROF.length - 1][0];
    function section(y) {
      let i = 0;
      while (i < PROF.length - 2 && PROF[i + 1][0] < y) i++;
      const a = PROF[Math.max(0, i - 1)],
        p = PROF[i],
        q = PROF[i + 1],
        c = PROF[Math.min(PROF.length - 1, i + 2)];
      const t = Math.max(0, Math.min(1, (y - p[0]) / (q[0] - p[0])));
      return [
        cr(a[1], p[1], q[1], c[1], t),
        cr(a[2], p[2], q[2], c[2], t),
        cr(a[3], p[3], q[3], c[3], t),
        cr(a[4], p[4], q[4], c[4], t),
      ];
    }
    /** Smooth body point (no folds) at angle th (0 = front +z, +π/2 = her left +x) and height y. Returns [x, z, r, zc]. */
    function bodyXZ(th, y) {
      const [A, B, zc, n] = section(y);
      const s = Math.sin(th),
        c = Math.cos(th),
        e = 2 / n;
      let x = A * Math.sign(s) * Math.pow(Math.abs(s), e),
        z = B * Math.sign(c) * Math.pow(Math.abs(c), e);
      // contrapposto: hips swing to her left, the raised right shoulder lifts & swells toward the arm
      x += 0.28 * gauss(y - 13, 4.5);
      const rs = gauss(y - 25.2, 1.1) * sm(0.2, 0.9, -s);
      x -= rs * 0.55;
      z += rs * 0.1;
      // bust
      const bust =
        gauss(y - 20.8, 1.5) *
        (gauss(wrapA(th - 0.42), 0.32) + gauss(wrapA(th + 0.42), 0.32)) *
        0.32;
      const r = Math.hypot(x, z) || 1e-3;
      x *= 1 + bust / r;
      z *= 1 + bust / r;
      return [x, z + zc, r + bust, zc];
    }
    // stola fold field (radial metres) + its cavity term
    function stolaFold(th, y) {
      const low = 1 - sm(13, 22, y);
      const ph = 0.55 * Math.sin(y * 0.19 + th * 2);
      // hammered-copper drapery: broad rounded ridges and narrow, knife-sharp creases (sqrt-shaped profile)
      let d =
        low *
        (0.4 * crease(9 * th + ph * 3) +
          0.16 * crease(15 * th - y * 0.11 + 1.3) +
          0.06 * Math.sin(23 * th + y * 0.23) -
          0.1);
      if (y < 2.2) d *= 1 + (2.2 - y) * 0.35; // hem pools on the plinth
      // fine chest pleats (front, under the neckline)
      const chest =
        sm(18.5, 21, y) * (1 - sm(24, 25.6, y)) * sm(-0.1, 0.8, Math.cos(th));
      d += chest * 0.07 * Math.sin(27 * th + 0.4);
      if (d < 0) d *= 1.35; // deeper valleys, rounder ridges
      // advancing right knee & the straight left shin
      d += 0.6 * gauss(wrapA(th + 0.38), 0.34) * gauss(y - 10.3, 2.5);
      d +=
        0.3 *
        gauss(wrapA(th - 0.4), 0.26) *
        (y < 10.5 ? 1 : gauss(y - 10.5, 2.2));
      return d;
    }
    const STOLA_ENV = (y) => (1 - sm(13, 22, y)) * 0.5 + (y < 2.2 ? 0.25 : 0);

    // ---- STOLA (inner robe): full closed surface, hem to neck ----
    const NU = 168;
    const stola = LB.surface(
      (u, v, out) => {
        const th = u * TAU,
          y = v * Y_TOP;
        const [x, z, r, zc] = bodyXZ(th, y);
        const d = stolaFold(th, y);
        const k = 1 + d / r;
        out.set(x * k, y, zc + (z - zc) * k);
        if (y < 3) out.z -= (3 - y) * 0.22 * (Math.cos(th) < 0 ? 1 : 0.35); // hem sweeps back behind the trailing right foot
        return 0.5 + 0.5 * sm(-0.34, 0.16, d);
      },
      NU,
      80,
      { wrap: true, us: 5, vs: 5 },
    );
    b.add(V, stola, o);
    // hem underside cap (closes the bottom so the plinth never shows through)
    b.add(
      V,
      new THREE.CircleGeometry(5.6, 24),
      Object.assign({}, o, {
        m: LB.m4(0, 0.03, -0.6, 0, Math.PI / 2, 0, 1.08, 0.9, 1),
      }),
    );

    // ---- PALLA (mantle): band between lower edge Lo(th) and upper edge Up(th) ----
    // control points around the body (th, lower, upper) — front diagonal, left shoulder, the whole back.
    const MC = [
      [-Math.PI, 2.4, 26.0],
      [-2.3, 3.6, 25.4],
      [-1.75, 7.5, 21.5],
      [-1.3, 11.0, 16.8],
      [-0.85, 11.8, 14.6],
      [-0.4, 10.4, 16.4],
      [0.0, 9.0, 18.8],
      [0.45, 7.8, 21.8],
      [0.95, 5.8, 24.6],
      [1.55, 4.2, 25.9],
      [2.3, 3.0, 26.0],
    ];
    function mantleEdges(th) {
      const n = MC.length;
      let i = 0;
      while (i < n - 1 && MC[i + 1][0] <= th) i++;
      const p = MC[i],
        q = i + 1 < n ? MC[i + 1] : [MC[0][0] + TAU, MC[0][1], MC[0][2]];
      const a = MC[(i - 1 + n) % n],
        c = MC[(i + 2) % n];
      const t = (th - p[0]) / (q[0] - p[0]);
      return [cr(a[1], p[1], q[1], c[1], t), cr(a[2], p[2], q[2], c[2], t)];
    }
    function mantleFold(th, y, w) {
      const F = sm(-0.15, 0.7, Math.cos(th)); // 1 on the front, 0 on back & sides
      const swag =
        Math.sin(w * Math.PI * 4.2 + th * 1.3) * 0.2 * (1 - sm(0.75, 1, w)) +
        Math.sin(w * Math.PI * 9 + 1) * 0.05;
      const vert =
        0.3 * crease(7 * th + 0.7 + y * 0.03) +
        0.13 * crease(13 * th + y * 0.16) +
        0.06 * Math.sin(21 * th - y * 0.2) -
        0.08;
      let d = F * swag + (1 - F) * vert * (1 - sm(22, 26, y) * 0.7);
      if (d < 0) d *= 1.3;
      return d;
    }
    function mantlePoint(th, w, out, extra) {
      const [lo, up] = mantleEdges(wrapA(th));
      const y = lo + (up - lo) * w;
      const [x, z, r, zc] = bodyXZ(th, y);
      const thick =
        (0.34 + (extra || 0)) *
          (w < 0.06 ? 0.8 + (0.2 * w) / 0.06 : 1) *
          (1 - sm(0.8, 1.0, w) * 0.85) +
        STOLA_ENV(y) * (1 - sm(0.85, 1, w));
      const d = mantleFold(th, y, w) * (1 - sm(0.9, 1, w));
      const k = 1 + (thick + d) / r;
      out.set(x * k, y, zc + (z - zc) * k);
      return d;
    }
    const mantle = LB.surface(
      (u, v, out) => {
        const th = u * TAU - Math.PI;
        const d = mantlePoint(th, v, out, 0);
        return (0.5 + 0.5 * sm(-0.32, 0.18, d)) * (0.88 + 0.12 * v);
      },
      NU,
      48,
      { wrap: true, us: 5, vs: 4 },
    );
    b.add(V, mantle, o);
    // rolled edges: the long diagonal roll across the front (upper edge) and the hanging lower hem
    const edgePts = (wv, th0, th1, n, extra) => {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const th = th0 + ((th1 - th0) * i) / n;
        const p = new THREE.Vector3();
        mantlePoint(th, wv, p, extra);
        pts.push(p);
      }
      return pts;
    };
    b.add(
      V,
      LB.organicTube(
        edgePts(0.93, -1.55, 1.15, 16, 0.12),
        (t) => 0.42 * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t * 1.15))),
        {
          radial: 10,
          seg: 40,
          disp: (t, a) => 0.05 * Math.sin(t * 60 + a * 2),
        },
      ),
      Object.assign({}, o),
    );
    b.add(
      V,
      LB.organicTube(
        edgePts(0.0, -Math.PI + 0.02, Math.PI - 0.02, 36, 0.05),
        () => 0.3,
        { radial: 8, seg: 96, disp: (t) => 0.06 * Math.sin(t * 90) },
      ),
      Object.assign({}, o),
    );
    // a heavy fold of the mantle hanging from the left forearm down her left side
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(5.6, 18.4, 1.2),
          new THREE.Vector3(6.05, 14.5, 0.6),
          new THREE.Vector3(6.1, 10.0, 0.1),
          new THREE.Vector3(5.7, 6.2, -0.4),
        ],
        (t) => 0.95 - t * 0.35,
        { radial: 12, seg: 18, disp: (t, a) => 0.16 * Math.sin(a * 4 + t * 3) },
      ),
      Object.assign({}, o),
    );

    // ---- feet, sandals, broken shackle & chain ----
    const foot = (x, z, ry, len, lift) => {
      b.sphere(
        V,
        x,
        0.42 + lift,
        z,
        1,
        Object.assign({}, o, {
          sx: 0.95,
          sy: 0.5,
          sz: len,
          ry,
          ws: 14,
          hs: 8,
          uv: "box",
        }),
      );
      for (let k = 0; k < 5; k++) {
        // toes
        const tx =
            x + Math.sin(ry) * (len * 0.85) + Math.cos(ry) * (-0.55 + k * 0.27),
          tz =
            z + Math.cos(ry) * (len * 0.85) - Math.sin(ry) * (-0.55 + k * 0.27);
        b.sphere(
          V,
          tx,
          0.26 + lift * 0.6,
          tz,
          0.17 - Math.abs(k - 1) * 0.015,
          Object.assign({}, o, { sz: 1.5, ry, ws: 8, hs: 6, uv: "box" }),
        );
      }
      b.box(V, x, 0.62 + lift, z + Math.cos(ry) * 0.2, 1.7, 0.1, 0.18, {
        ry,
        seg: false,
        grime: 0.1,
      }); // sandal strap
    };
    foot(1.7, 4.7, 0.12, 1.55, 0); // left foot forward
    b.sphere(
      V,
      -2.2,
      1.0,
      -5.9,
      1,
      Object.assign({}, o, { sx: 0.9, sy: 0.75, sz: 1.2, rx: -0.5, uv: "box" }),
    ); // right heel, lifted
    for (let i = 0; i < 8; i++) {
      const ring = new THREE.TorusGeometry(0.34, 0.1, 6, 12);
      b.add(
        V,
        ring,
        Object.assign({}, o, {
          uv: "box",
          m: LB.m4(
            3.1 + i * 0.48,
            0.13 + (i % 2) * 0.12,
            4.4 - i * 0.22 + (i > 4 ? (i - 4) * 0.4 : 0),
            i * 0.9,
            i % 2 ? Math.PI / 2 : 0.2,
          ),
        }),
      );
    }
    b.add(
      V,
      new THREE.TorusGeometry(0.75, 0.22, 8, 16, Math.PI * 1.55),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(-1.2, 0.3, 5.0, 0.4, Math.PI / 2 - 0.1),
      }),
    ); // snapped shackle

    // ---- RIGHT ARM (raised): sleeve bunched & flared at the elbow, bare forearm, fist on the torch ----
    const TX = -6.15,
      TZ = -0.3; // torch handle axis
    const slv = [
      new THREE.Vector3(-4.1, 23.6, 0.25),
      new THREE.Vector3(-4.85, 26.6, 0.1),
      new THREE.Vector3(-5.45, 29.8, -0.12),
      new THREE.Vector3(-5.72, 32.2, -0.25),
    ];
    const slvR = (t) =>
      1.62 + 0.18 * Math.sin(t * Math.PI) + sm(0.55, 1, t) * 0.55;
    b.add(
      V,
      LB.organicTube(slv, slvR, {
        radial: 16,
        seg: 22,
        disp: (t, a) =>
          (0.2 * Math.sin(a * 6 + t * 5) + 0.07 * Math.sin(a * 13 - t * 9)) *
          sm(0.05, 0.4, t),
        ao: (t, a) => 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(a * 6 + t * 5)),
      }),
      o,
    );
    // inside of the flared sleeve mouth (flipped, dark) + thick rolled rim
    const slvIn = [slv[2].clone().lerp(slv[3], 0.2), slv[3].clone()];
    b.add(
      V,
      LB.organicTube(slvIn, (t) => slvR(0.85 + t * 0.15) - 0.16, {
        radial: 16,
        seg: 4,
        flip: true,
        ao: () => 0.35,
      }),
      o,
    );
    {
      const dir = new THREE.Vector3().subVectors(slv[3], slv[2]).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        dir,
      );
      const rim = new THREE.TorusGeometry(slvR(1) - 0.05, 0.2, 8, 22);
      LB.deform(rim, (v) => {
        const a = Math.atan2(v.y, v.x);
        v.x *= 1 + 0.05 * Math.sin(a * 6);
        v.y *= 1 + 0.05 * Math.sin(a * 6);
        v.z += 0.12 * Math.sin(a * 6);
      });
      b.add(
        V,
        rim,
        Object.assign({}, o, {
          m: new THREE.Matrix4().compose(slv[3], q, new THREE.Vector3(1, 1, 1)),
        }),
      );
    }
    // drapery hanging from the underside of the raised sleeve toward her head
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(-4.6, 29.5, 0.9),
          new THREE.Vector3(-4.0, 27.4, 1.1),
          new THREE.Vector3(-3.4, 25.6, 1.3),
        ],
        (t) => 0.75 - t * 0.3,
        { radial: 10, seg: 10, disp: (t, a) => 0.12 * Math.sin(a * 3 + t * 4) },
      ),
      o,
    );
    // bare forearm (slight muscle swell) and wrist
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(-5.6, 31.2, -0.2),
          new THREE.Vector3(-5.85, 33.6, -0.26),
          new THREE.Vector3(-6.05, 35.6, -0.3),
          new THREE.Vector3(TX, 36.7, TZ),
        ],
        (t) => 0.98 + 0.1 * Math.sin(t * Math.PI * 0.8) - t * 0.3,
        { radial: 14, seg: 16 },
      ),
      Object.assign({}, o, { grime: 0.1 }),
    );
    // fist: palm mass + four curled fingers wrapped around the handle + thumb
    b.sphere(
      V,
      TX + 0.05,
      37.45,
      TZ - 0.12,
      1,
      Object.assign({}, o, {
        sx: 0.95,
        sy: 1.2,
        sz: 0.85,
        ws: 14,
        hs: 10,
        uv: "box",
      }),
    );
    for (let k = 0; k < 4; k++) {
      const fg = new THREE.TorusGeometry(
        0.66,
        0.235 - k * 0.012,
        7,
        12,
        Math.PI * 1.2,
      );
      b.add(
        V,
        fg,
        Object.assign({}, o, {
          uv: "box",
          m: LB.m4(
            TX,
            36.95 + k * 0.43,
            TZ,
            0.35 + Math.PI * 0.2,
            Math.PI / 2,
            0,
          ),
        }),
      );
    }
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(TX + 0.55, 37.3, TZ - 0.4),
          new THREE.Vector3(TX + 0.75, 37.9, TZ + 0.1),
          new THREE.Vector3(TX + 0.45, 38.3, TZ + 0.55),
        ],
        (t) => 0.26 - t * 0.06,
        { radial: 8, seg: 6 },
      ),
      o,
    );
    // torch: handle with rings, cup, gallery with railing, gilded flame
    b.cyl(
      V,
      TX,
      36.4,
      TZ,
      0.5,
      0.42,
      4.0,
      14,
      Object.assign({}, o, { uv: "box" }),
    );
    for (const yy of [39.0, 39.8])
      b.add(
        V,
        new THREE.TorusGeometry(0.52, 0.11, 6, 16),
        Object.assign({}, o, {
          uv: "box",
          m: LB.m4(TX, yy, TZ, 0, Math.PI / 2),
        }),
      );
    b.lathe(
      V,
      [
        [0.5, 0],
        [0.75, 0.25],
        [1.2, 0.7],
        [1.75, 1.45],
        [2.0, 1.95],
        [2.12, 2.25],
      ],
      22,
      TX,
      40.3,
      TZ,
      Object.assign({}, o, {
        uv: "box",
        deform: (v) => {
          const a = Math.atan2(v.x, v.z);
          const k = 1 + 0.04 * Math.sin(a * 12) * sm(0.3, 1.8, v.y);
          v.x *= k;
          v.z *= k;
        },
      }),
    );
    b.add(
      V,
      new THREE.CylinderGeometry(2.7, 2.6, 0.2, 28, 1),
      Object.assign({}, o, { uv: "box", m: LB.m4(TX, 42.55, TZ) }),
    );
    b.add(
      V,
      new THREE.TorusGeometry(2.62, 0.06, 4, 32),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(TX, 43.55, TZ, 0, Math.PI / 2),
      }),
    );
    b.add(
      V,
      new THREE.TorusGeometry(2.62, 0.04, 4, 32),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(TX, 43.05, TZ, 0, Math.PI / 2),
      }),
    );
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * TAU;
      b.box(
        V,
        TX + Math.sin(a) * 2.62,
        42.65,
        TZ + Math.cos(a) * 2.62,
        0.07,
        0.9,
        0.07,
        { seg: false, grime: 0.1 },
      );
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      b.beam(
        V,
        new THREE.Vector3(TX + Math.sin(a) * 1.0, 41.4, TZ + Math.cos(a) * 1.0),
        new THREE.Vector3(
          TX + Math.sin(a) * 2.5,
          42.55,
          TZ + Math.cos(a) * 2.5,
        ),
        0.1,
        0.1,
        { grime: 0.1 },
      );
    }
    // gilded flame (gold-leaf): a tall pointed tear-drop core with five twisting licks that sharpen
    // toward a tip blown slightly leeward, wrapped by seven upright flat tongues — a flame silhouette, not a bulb.
    const FY = 42.65,
      FH = 5.9;
    b.lathe(
      "gold",
      [
        [0.82, 0],
        [1.08, 0.4],
        [1.14, 1.0],
        [1.02, 1.9],
        [0.8, 2.8],
        [0.56, 3.7],
        [0.32, 4.5],
        [0.13, 5.25],
        [0.01, FH],
      ],
      30,
      TX,
      FY,
      TZ,
      {
        grime: 0,
        noAO: true,
        uv: "box",
        sx: 1.18,
        sy: 1.18, // round 1 revise: flame +18 % for long-range readability
        deform: (v) => {
          const h = v.y / FH;
          const tw = v.y * 0.5; // twist grows with height
          const th = Math.atan2(v.x, v.z) + tw;
          const lobe =
            1 +
            0.34 *
              Math.pow(Math.max(0, Math.sin(th * 5)), 1.6) *
              sm(0.05, 0.35, h) -
            0.12 * sm(0.1, 0.4, h) +
            0.06 * Math.sin(th * 11 - v.y * 2);
          const r = Math.hypot(v.x, v.z) * lobe;
          const a = Math.atan2(v.x, v.z) + tw * 0.3;
          v.x = Math.sin(a) * r + Math.sin(h * 2.6) * 0.3 * h * h; // S-lean in the wind
          v.z = Math.cos(a) * r - 0.12 * h * h;
        },
      },
    );
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + 0.3,
        h = 3.1 + ((i * 5) % 7) * 0.36,
        bulge = 0.3 + (i % 3) * 0.1;
      const pg = new THREE.SphereGeometry(1, 10, 14);
      LB.deform(pg, (v) => {
        const t = (v.y + 1) / 2; // 0 base → 1 tip
        const w =
          Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.95)), 0.7) *
          (1 - t * 0.6);
        v.x *= 0.78 * w;
        v.z *= 0.26 * w; // flat tongue, widest low down
        v.y = t * h;
        v.x += Math.sin(t * 3.4) * 0.45 * t; // S-curl
        v.z += Math.sin(Math.PI * t) * bulge - t * t * 1.0; // bellies out, tip licks in toward the axis
      });
      b.add("gold", pg, {
        m: LB.m4(
          TX + Math.sin(a) * 1.18,
          FY + 0.05,
          TZ + Math.cos(a) * 1.18,
          a + Math.PI * 0.08,
          0,
          0,
          1.18,
        ),
        grime: 0,
        noAO: true,
        uv: "box",
      });
    }
    // ---- LEFT ARM (under the mantle) + the tablet ----
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(4.1, 25.0, 0.2),
          new THREE.Vector3(5.2, 23.4, 0.3),
          new THREE.Vector3(5.75, 21.4, 0.55),
          new THREE.Vector3(5.95, 19.8, 0.85),
        ],
        (t) => 1.55 - t * 0.25,
        {
          radial: 14,
          seg: 16,
          disp: (t, a) => 0.14 * Math.sin(a * 5 + t * 6),
          ao: (t, a) => 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(a * 5 + t * 6)),
        },
      ),
      o,
    );
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(5.95, 19.9, 0.8),
          new THREE.Vector3(5.9, 19.2, 1.7),
          new THREE.Vector3(5.55, 18.8, 2.5),
          new THREE.Vector3(5.2, 18.7, 3.0),
        ],
        (t) => 1.15 - t * 0.38,
        {
          radial: 12,
          seg: 10,
          disp: (t, a) => 0.08 * Math.sin(a * 7) * (1 - t),
        },
      ),
      o,
    );
    b.sphere(
      V,
      5.1,
      18.55,
      3.2,
      1,
      Object.assign({}, o, {
        sx: 0.75,
        sy: 0.55,
        sz: 0.95,
        ws: 12,
        hs: 8,
        uv: "box",
      }),
    );
    const TM = LB.m4(5.55, 22.1, 2.05, -0.45, -0.2, 0.1);
    for (let k = 0; k < 4; k++) {
      // fingers curling around the tablet's bottom corner
      b.add(
        V,
        new THREE.CapsuleGeometry(0.16, 0.7, 3, 6),
        Object.assign({}, o, {
          uv: "box",
          m: new THREE.Matrix4().multiplyMatrices(
            TM,
            LB.m4(-1.3 + k * 0.34, -3.75, 0.52, 0, Math.PI / 2 - 0.3, 0),
          ),
        }),
      );
    }
    // keystone tablet (wider at the top) with a raised border
    {
      const ks = new THREE.Shape();
      ks.moveTo(-2.0, -3.7);
      ks.lineTo(2.0, -3.7);
      ks.lineTo(2.25, 3.7);
      ks.lineTo(-2.25, 3.7);
      ks.closePath();
      const tg = new THREE.ExtrudeGeometry(ks, {
        depth: 0.6,
        bevelEnabled: true,
        bevelSize: 0.1,
        bevelThickness: 0.1,
        bevelSegments: 1,
      });
      tg.translate(0, 0, -0.3);
      b.add(V, tg, Object.assign({}, o, { uv: "box", m: TM }));
      const bs = new THREE.Shape();
      bs.moveTo(-2.0, -3.7);
      bs.lineTo(2.0, -3.7);
      bs.lineTo(2.25, 3.7);
      bs.lineTo(-2.25, 3.7);
      bs.closePath();
      const hole = new THREE.Path();
      hole.moveTo(-1.72, -3.4);
      hole.lineTo(1.72, -3.4);
      hole.lineTo(1.94, 3.4);
      hole.lineTo(-1.94, 3.4);
      hole.closePath();
      bs.holes.push(hole);
      b.add(
        V,
        new THREE.ExtrudeGeometry(bs, { depth: 0.14, bevelEnabled: false }),
        Object.assign({}, o, {
          uv: "box",
          m: new THREE.Matrix4().multiplyMatrices(TM, LB.m4(0, 0, 0.38)),
        }),
      );
      const tabK = LB.texMat(
        "liberty_tablet",
        LB.canvasTex("lb_tablet", 256, 512, (ctx, w, h) => {
          const vt = LB.verdigrisTex().image;
          ctx.drawImage(vt, 0, 0, w, h);
          ctx.fillStyle = "rgba(28,52,44,0.85)";
          ctx.textAlign = "center";
          ctx.font = 'bold 46px "Times New Roman", serif';
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText("JULY IV", 0, -30);
          ctx.fillText("MDCCLXXVI", 0, 34);
          ctx.restore();
        }),
      );
      b.add(tabK, new THREE.PlaneGeometry(3.9, 6.9), {
        m: new THREE.Matrix4().multiplyMatrices(TM, LB.m4(0, 0, 0.415)),
        uv: "keep",
        grime: 0.1,
      });
    }

    // ---- NECK, HEAD & HAIR (one displaced ellipsoid) ----
    const HC = new THREE.Vector3(0, 30.5, 0.3),
      HR = [1.92, 2.45, 2.1];
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(0, 26.9, 0.05),
          new THREE.Vector3(0, 28.1, 0.18),
          new THREE.Vector3(0, 29.1, 0.3),
        ],
        (t) => 1.28 - t * 0.12,
        { radial: 16, seg: 6 },
      ),
      o,
    );
    // robe neckline: a soft rolled collar where the stola meets the neck
    {
      const col = new THREE.TorusGeometry(1.62, 0.26, 8, 28);
      LB.deform(col, (v) => {
        const a = Math.atan2(v.y, v.x);
        v.z += 0.08 * Math.sin(a * 7);
      });
      b.add(
        V,
        col,
        Object.assign({}, o, {
          uv: "box",
          m: LB.m4(0, 26.75, 0.16, 0, Math.PI / 2 + 0.08, 0, 1, 1.04, 1),
        }),
      );
    }
    const headDeform = (v) => {
      // v on the unit sphere (SphereGeometry radius 1) → displaced & later scaled by HR
      const x = v.x,
        y = v.y,
        z = v.z;
      let d = 0;
      const front = sm(0.25, 0.75, z);
      d += 0.13 * gauss(y - 0.2, 0.08) * gauss(x, 0.5) * front; // brow ridge
      for (const sx of [-0.31, 0.31]) {
        d -= 0.17 * gauss(x - sx, 0.13) * gauss(y - 0.07, 0.09) * front; // eye sockets
        d += 0.08 * gauss(x - sx, 0.09) * gauss(y - 0.05, 0.05) * front; // heavy lids / eyeballs
        d += 0.05 * gauss(x - sx * 1.45, 0.16) * gauss(y + 0.14, 0.14) * front; // cheekbones
      }
      d +=
        0.28 *
        gauss(x, 0.07) *
        sm(0.17, -0.02, y) *
        sm(-0.31, -0.19, y) *
        front *
        (0.45 + 0.55 * sm(0.14, -0.22, y)); // straight Greek nose
      d += 0.09 * gauss(x, 0.15) * gauss(y + 0.27, 0.05) * front; // nostril wings
      d += 0.07 * gauss(x, 0.2) * gauss(y + 0.37, 0.035) * front; // upper lip
      d -= 0.07 * gauss(x, 0.19) * gauss(y + 0.415, 0.022) * front; // mouth line
      d += 0.07 * gauss(x, 0.17) * gauss(y + 0.46, 0.035) * front; // lower lip
      d += 0.11 * gauss(x, 0.24) * gauss(y + 0.66, 0.1) * front; // chin
      d -= 0.05 * gauss(x, 0.3) * gauss(y + 0.56, 0.05) * front; // mentolabial groove
      // hair: everything above the hairline and around the back sits proud, with combed waves
      const hairline =
        sm(0.28, 0.42, y + (1 - front) * 0.6) *
        (1 - front * sm(0.4, 0.2, y) * 0);
      const hairMask = Math.max(
        sm(0.3, 0.42, y),
        (1 - front) * sm(-0.55, -0.1, y + 0.1 * Math.abs(x)),
      );
      const th = Math.atan2(x, z);
      d +=
        hairMask *
        (0.09 +
          0.035 * Math.sin(th * 16 + y * 7) +
          0.02 * Math.sin(th * 31 - y * 11));
      void hairline;
      v.multiplyScalar(1 + d);
      // jaw taper & flatter face plane
      if (y < -0.2) {
        const k = 1 - 0.17 * sm(-0.2, -0.9, y) * (0.5 + 0.5 * front);
        v.x *= k;
      }
      if (z > 0.5) v.z -= (z - 0.5) * 0.18;
    };
    // cavity occlusion for the face (per-vertex aoMul): the verdigris is nearly uniform, so without it the sculpted
    // features vanish under flat daylight. Sockets, the shadow under brow/nose/lower lip, the mouth line, the hair
    // grooves and the jaw underside darken; nose ridge, brow, cheekbones and lids catch a little extra light.
    const headAO = (x, y, z) => {
      const front = sm(0.25, 0.75, z);
      let a = 1;
      for (const sx of [-0.31, 0.31]) {
        a -= 0.55 * gauss(x - sx, 0.12) * gauss(y - 0.06, 0.08) * front; // eye sockets
        a += 0.18 * gauss(x - sx, 0.07) * gauss(y - 0.04, 0.035) * front; // lids catch light
        a -= 0.3 * gauss(x - sx * 0.55, 0.06) * gauss(y - 0.02, 0.09) * front; // inner corners beside the nose
        a += 0.1 * gauss(x - sx * 1.45, 0.14) * gauss(y + 0.12, 0.1) * front; // cheekbones
        a -= 0.22 * gauss(x - sx * 0.62, 0.1) * gauss(y + 0.33, 0.06) * front; // nasolabial folds
      }
      a +=
        0.14 * gauss(x, 0.05) * sm(0.15, -0.05, y) * sm(-0.3, -0.18, y) * front; // nose ridge
      a -= 0.45 * gauss(x, 0.13) * gauss(y + 0.25, 0.035) * front; // under the nose
      a -= 0.55 * gauss(x, 0.17) * gauss(y + 0.415, 0.022) * front; // mouth line
      a -= 0.3 * gauss(x, 0.16) * gauss(y + 0.52, 0.035) * front; // under the lower lip
      a -=
        0.25 * gauss(y - 0.16, 0.05) * gauss(x, 0.5) * front * sm(0.2, 0.6, z); // brow shadow line
      if (y < -0.55) a -= 0.35 * sm(-0.55, -0.95, y) * (1 - front * 0.5); // under the jaw
      const hairMask = Math.max(
        sm(0.3, 0.42, y),
        (1 - front) * sm(-0.55, -0.1, y + 0.1 * Math.abs(x)),
      );
      const th = Math.atan2(x, z);
      a -= hairMask * 0.3 * Math.max(0, -Math.sin(th * 16 + y * 7)); // combed hair grooves
      return Math.max(0.3, Math.min(1.15, a));
    };
    {
      const hg = new THREE.SphereGeometry(1, 56, 42);
      const hp = hg.attributes.position,
        ao = new Float32Array(hp.count),
        hv = new THREE.Vector3();
      for (let i = 0; i < hp.count; i++) {
        hv.set(hp.getX(i), hp.getY(i), hp.getZ(i));
        ao[i] = headAO(hv.x, hv.y, hv.z);
        headDeform(hv);
        hp.setXYZ(i, hv.x, hv.y, hv.z);
      }
      LB.weldNormals(hg);
      hg.setAttribute("aoMul", new THREE.BufferAttribute(ao, 1));
      b.add(
        V,
        hg,
        Object.assign({}, o, {
          m: LB.m4(HC.x, HC.y, HC.z, 0, 0, 0, HR[0], HR[1], HR[2]),
          grime: 0.05,
          uv: "box",
          uvScale: 3,
        }),
      );
    }
    // hair knot at the nape + locks over the ears
    b.sphere(
      V,
      0,
      29.35,
      -1.35,
      1,
      Object.assign({}, o, {
        sx: 1.55,
        sy: 1.2,
        sz: 1.15,
        ws: 18,
        hs: 12,
        uv: "box",
        deform: (v) => {
          const a = Math.atan2(v.x, v.y);
          v.multiplyScalar(1 + 0.08 * Math.sin(a * 9));
        },
      }),
    );
    for (const sx of [-1, 1])
      b.sphere(
        V,
        sx * 1.55,
        29.9,
        0.0,
        1,
        Object.assign({}, o, {
          sx: 0.42,
          sy: 0.85,
          sz: 0.75,
          ws: 10,
          hs: 8,
          uv: "box",
        }),
      );

    // ---- CROWN: diadem band with windows, rim mouldings, seven faceted rays ----
    const CZ0 = 0.18;
    const band = new THREE.CylinderGeometry(2.08, 2.2, 1.0, 36, 1, true);
    b.add(
      V,
      band,
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(0, 32.35, CZ0, 0, 0, 0, 1, 1, 1.12),
      }),
    );
    b.add(
      V,
      new THREE.TorusGeometry(2.14, 0.13, 6, 36),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(0, 32.86, CZ0, 0, Math.PI / 2, 0, 1, 1.12, 1),
      }),
    );
    b.add(
      V,
      new THREE.TorusGeometry(2.27, 0.12, 6, 36),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(0, 31.86, CZ0, 0, Math.PI / 2, 0, 1, 1.12, 1),
      }),
    );
    for (let i = 0; i < 13; i++) {
      const a = -1.1 + i * (2.2 / 12);
      b.quad(
        "window_lit",
        Math.sin(a) * 2.22,
        32.36,
        CZ0 + Math.cos(a) * 2.22 * 1.12,
        0.26,
        0.44,
        { ry: a, noAO: true, grime: 0 },
      );
      b.box(
        V,
        Math.sin(a + 0.085) * 2.24,
        32.1,
        CZ0 + Math.cos(a + 0.085) * 2.24 * 1.12,
        0.06,
        0.55,
        0.08,
        { ry: a, seg: false, grime: 0 },
      ); // mullions
    }
    // seven rays: long, needle-sharp square spikes (a 4-sided lathe: stout socket, fast taper, long slender blade) fanning
    // out and up from the diadem — the centre ray tallest and steepest, the outer pair almost level
    for (let i = 0; i < 7; i++) {
      const a = -1.5 + i * 0.5,
        off = Math.abs(i - 3);
      const len = 5.0 + (i === 3 ? 0.5 : 0) - off * 0.15; // round 1 revise: +22 % so the crown reads at harbour range
      const ray = new THREE.LatheGeometry(
        [
          [0.001, -0.05],
          [0.46, -0.05],
          [0.42, 0.3],
          [0.29, len * 0.28],
          [0.16, len * 0.62],
          [0.001, len],
        ].map((p) => new THREE.Vector2(p[0], p[1])),
        4,
      );
      ray.rotateY(Math.PI / 4);
      ray.scale(1, 1, 0.72); // flattened blade: broad face to the front
      const rayF = ray.toNonIndexed();
      rayF.computeVertexNormals(); // flat facets: crisp arrises catch the light
      const dir = new THREE.Vector3(
        Math.sin(a) * 0.86,
        0.62 - off * 0.09,
        Math.cos(a) * 0.86 * 1.08,
      ).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir,
      );
      q.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a),
      ); // blade face turned outward
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(Math.sin(a) * 2.05, 32.75, CZ0 + Math.cos(a) * 2.2),
        q,
        new THREE.Vector3(1, 1, 1),
      );
      b.add(V, rayF, Object.assign({}, o, { uv: "box", m }));
      b.sphere(
        V,
        Math.sin(a) * 2.1,
        32.72,
        CZ0 + Math.cos(a) * 2.28,
        0.28,
        Object.assign({}, o, { uv: "box", ws: 8, hs: 6 }),
      ); // ray socket boss
    }
    // patina pass over every copper piece of the statue
    const vs = b.parts.get(V) || [];
    for (let i = n0; i < vs.length; i++) patina(vs[i], 0.85);
  }

  // ====================================================================
  // Waving flag (plane with per-frame vertex displacement)
  // ====================================================================
  // The wave runs in the vertex shader (one shared time uniform, analytic normals), so a flag costs no CPU per frame.
  // opts.hang: hanging banner (amplitude grows downward from the top edge) instead of a pole flag (grows along x).
