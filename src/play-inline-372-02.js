// play-inline-372 02 — three
// Lines 25-266 of readable/play-inline-372.pretty.js (statement-aligned).
  const P = G._m3,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  const SILKS = [
    "silk_red",
    "silk_yellow",
    "silk_green",
    "silk_blue",
    "silk_orange",
    "silk_purple",
    "silk_white",
  ];
  P.SILKS = SILKS;

  /**
   * Cast-iron lawn jockey on a small plinth (local coords of batch b), facing +z rotated by ry.
   * o: {silk, silk2 (cap/sleeves), s (scale), skull (raider trophy), ring (hand ring/lantern), lantern, lit, pose:'ring'|'salute',
   *     rx/rz (knocked over), grime}
   */
  P.jockey = function (b, x, y, z, ry, o) {
    o = o || {};
    const s = o.s || 1;
    const M = P.m4(x, y, z, ry, o.rx || 0, o.rz || 0, s);
    const silk = o.silk || "silk_red",
      silk2 = o.silk2 || silk,
      blk = "jockey_black",
      wht = "silk_white";
    // all silks share ONE vertex-tinted material (P.silkKey) — 7 fewer draw calls per site
    const add = (k, g, m) => {
      const sk = P.silkKey(k);
      return b.geo(sk[0], g, m ? M.clone().multiply(m) : M.clone(), {
        noAO: true,
        grime: o.grime === undefined ? 0.45 : o.grime,
        c: sk[1],
      });
    };
    const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
    const limb = (k, A, B, r0, r1) => {
      const a = V(A),
        c = V(B),
        d = new THREE.Vector3().subVectors(c, a),
        len = d.length();
      if (len < 1e-3) return;
      const g = new THREE.CylinderGeometry(r1, r0, len, 6, 1, false);
      g.translate(0, len / 2, 0);
      add(
        k,
        g,
        new THREE.Matrix4().compose(
          a,
          new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            d.normalize(),
          ),
          new THREE.Vector3(1, 1, 1),
        ),
      );
    };
    const ball = (k, p, r, sx, sy, sz) =>
      add(
        k,
        new THREE.SphereGeometry(r, 7, 5),
        P.m4(p[0], p[1], p[2], 0, 0, 0, sx || 1, sy || 1, sz || 1),
      );
    // plinth
    add(blk, new THREE.BoxGeometry(0.3, 0.08, 0.3).translate(0, 0.04, 0));
    add(blk, new THREE.BoxGeometry(0.24, 0.05, 0.24).translate(0, 0.105, 0));
    const y0 = 0.13;
    // boots + white breeches
    for (const sd of [-1, 1]) {
      const hip = [sd * 0.06, y0 + 0.4, 0],
        knee = [sd * 0.07, y0 + 0.2, 0.02],
        ank = [sd * 0.07, y0 + 0.03, 0];
      limb(blk, ank, knee, 0.038, 0.042); // riding boot
      add(
        blk,
        new THREE.BoxGeometry(0.07, 0.05, 0.14).translate(
          sd * 0.07,
          y0 + 0.025,
          0.03,
        ),
      );
      limb(wht, knee, hip, 0.042, 0.055); // breeches
      ball(wht, knee, 0.044);
    }
    ball(wht, [0, y0 + 0.42, 0], 0.085, 1.25, 0.8, 0.9); // seat
    // silks: torso + belt
    const tor = new THREE.LatheGeometry(
      [
        [0.001, 0],
        [0.08, 0.01],
        [0.085, 0.1],
        [0.095, 0.18],
        [0.085, 0.24],
        [0.04, 0.27],
        [0.001, 0.275],
      ].map((p) => new THREE.Vector2(p[0], p[1])),
      8,
    );
    tor.scale(1.1, 1, 0.8);
    add(silk, tor, P.m4(0, y0 + 0.43, 0));
    add(
      blk,
      new THREE.CylinderGeometry(0.088, 0.088, 0.025, 8)
        .scale(1.1, 1, 0.8)
        .translate(0, y0 + 0.455, 0),
    );
    // silks diamond / hoop detail in the second colour
    add(
      silk2,
      new THREE.BoxGeometry(0.19, 0.035, 0.155).translate(0, y0 + 0.57, 0),
    );
    const shY = y0 + 0.66;
    // neck + head (weathered iron-grey face) + jockey cap with visor
    limb("jockey_face", [0, shY, 0], [0, shY + 0.05, 0.005], 0.03, 0.028);
    const hy = shY + 0.11;
    if (o.skull) {
      ball("bone", [0, hy, 0.01], 0.06, 0.95, 1.05, 1.05);
      add(
        "jockey_black",
        new THREE.BoxGeometry(0.02, 0.018, 0.01).translate(
          -0.022,
          hy + 0.005,
          0.064,
        ),
      );
      add(
        "jockey_black",
        new THREE.BoxGeometry(0.02, 0.018, 0.01).translate(
          0.022,
          hy + 0.005,
          0.064,
        ),
      );
    } else {
      ball("jockey_face", [0, hy, 0.005], 0.058, 0.95, 1.1, 1.0);
      add(
        "jockey_face",
        new THREE.ConeGeometry(0.012, 0.03, 4)
          .rotateX(HP)
          .translate(0, hy - 0.005, 0.064),
      );
    }
    add(
      silk2,
      new THREE.SphereGeometry(0.062, 8, 5, 0, TAU, 0, HP).translate(
        0,
        hy + 0.012,
        0,
      ),
    );
    add(
      blk,
      new THREE.BoxGeometry(0.1, 0.012, 0.06).translate(0, hy + 0.012, 0.075),
    );
    add(
      silk2,
      new THREE.SphereGeometry(0.012, 5, 4).translate(0, hy + 0.074, 0),
    );
    // arms: left on the hip, right raised holding the hitching ring (or a lantern / salute)
    const shL = [-0.1, shY - 0.02, 0],
      shR = [0.1, shY - 0.02, 0];
    ball(silk2, shL, 0.035);
    ball(silk2, shR, 0.035);
    limb(silk2, shL, [-0.15, shY - 0.14, 0.01], 0.03, 0.026);
    limb(
      silk2,
      [-0.15, shY - 0.14, 0.01],
      [-0.1, shY - 0.22, 0.04],
      0.025,
      0.022,
    );
    ball("jockey_face", [-0.09, shY - 0.23, 0.05], 0.022);
    if (o.pose === "salute") {
      limb(silk2, shR, [0.16, shY + 0.04, 0.07], 0.03, 0.026);
      limb(
        silk2,
        [0.16, shY + 0.04, 0.07],
        [0.06, hy + 0.02, 0.07],
        0.025,
        0.022,
      );
    } else {
      const el = [0.17, shY - 0.1, 0.1],
        hd = [0.18, shY + 0.02, 0.22];
      limb(silk2, shR, el, 0.03, 0.026);
      limb(silk2, el, hd, 0.025, 0.022);
      ball("jockey_face", hd, 0.022);
      if (o.lantern) {
        add(
          "iron",
          new THREE.CylinderGeometry(0.004, 0.004, 0.06, 3).translate(
            hd[0],
            hd[1] - 0.04,
            hd[2],
          ),
        );
        add(
          "iron",
          new THREE.CylinderGeometry(0.035, 0.03, 0.09, 6).translate(
            hd[0],
            hd[1] - 0.11,
            hd[2],
          ),
        );
        add(
          o.lit ? "lamp_amber" : "glass_dark",
          new THREE.CylinderGeometry(0.028, 0.028, 0.06, 6).translate(
            hd[0],
            hd[1] - 0.11,
            hd[2],
          ),
        );
      } else
        add(
          "iron",
          new THREE.TorusGeometry(0.05, 0.008, 4, 10).translate(
            hd[0],
            hd[1] - 0.055,
            hd[2],
          ),
        );
    }
  };

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  const X0 = 51.3,
    XM = 66.8,
    X1 = 76.8,
    FZ = -248.3,
    BZ0 = -266.8;
  const H21 = 13.2,
    H19 = 12.2,
    DOOR_X = 59.0,
    HATCH_X = 73.2;
  const PLUME = [0, 0, 0.5, 1];

