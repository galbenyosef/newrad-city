// play-inline-508 01 — head
// Lines 15-348 of readable/play-inline-508.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.__cmb;

  const matCache = new Map();
  function mat(hex, opts) {
    const key = hex + (opts ? JSON.stringify(opts) : "");
    let m = matCache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial(
        Object.assign(
          { color: hex, roughness: 0.85, metalness: 0.05 },
          opts || {},
        ),
      );
      m.userData.shared = true;
      matCache.set(key, m);
    }
    return m;
  }
  const geoCache = new Map();
  function box(w, h, d) {
    const k = "b" + w + "," + h + "," + d;
    let g = geoCache.get(k);
    if (!g) {
      g = new THREE.BoxGeometry(w, h, d);
      geoCache.set(k, g);
    }
    return g;
  }
  function sph(r, ws, hs) {
    const k = "s" + r + "," + (ws || 10);
    let g = geoCache.get(k);
    if (!g) {
      g = new THREE.SphereGeometry(r, ws || 10, hs || 8);
      geoCache.set(k, g);
    }
    return g;
  }
  function cyl(rt, rb, h, s) {
    const k = "c" + rt + "," + rb + "," + h + "," + (s || 8);
    let g = geoCache.get(k);
    if (!g) {
      g = new THREE.CylinderGeometry(rt, rb, h, s || 8);
      geoCache.set(k, g);
    }
    return g;
  }
  function cone(r, h) {
    const k = "k" + r + "," + h;
    let g = geoCache.get(k);
    if (!g) {
      g = new THREE.ConeGeometry(r, h, 6);
      geoCache.set(k, g);
    }
    return g;
  }
  function mesh(geo, m, x, y, z, parent) {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x || 0, y || 0, z || 0);
    o.castShadow = true;
    if (parent) parent.add(o);
    return o;
  }
  function pivot(name, x, y, z, parent) {
    const o = new THREE.Group();
    o.name = name;
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  }

  // Colour schemes per type / outfit
  const SCHEMES = {
    raider: {
      skin: 0xc79a78,
      top: 0x4a3a2c,
      legs: 0x3a3226,
      head: 0x7a2a1a,
      accent: 0x777777,
    },
    raider_heavy: {
      skin: 0xc79a78,
      top: 0x55504a,
      legs: 0x2e2a24,
      head: 0x444444,
      accent: 0x888888,
    },
    settler: {
      skin: 0xd8b08c,
      top: 0x6b6e4a,
      legs: 0x4a4238,
      head: 0x5a4030,
      accent: 0x886644,
    },
    drifter: {
      skin: 0xc8a080,
      top: 0x7a6650,
      legs: 0x4a3f33,
      head: 0x6a5040,
      accent: 0x886644,
    },
    cryo_suit: {
      skin: 0xe0b894,
      top: 0xd8dcd8,
      legs: 0xd8dcd8,
      head: 0x3a2a1a,
      accent: 0xe0701a,
    },
    survivor_layers: {
      skin: 0xc8a284,
      top: 0x4a4436,
      legs: 0x3a3428,
      head: 0x6a6460,
      accent: 0x5a5040,
    },
    glowkeeper_robes: {
      skin: 0xd0a880,
      top: 0x8a8070,
      legs: 0x7a7262,
      head: 0x8a8070,
      accent: 0xf0c040,
    },
    combat_armor: {
      skin: 0xd0a880,
      top: 0x3a3a34,
      legs: 0x3a3a34,
      head: 0x2a2a26,
      accent: 0x55554a,
    },
    covenant_exo_rig: {
      skin: 0x6a6a60,
      top: 0x6f6f66,
      legs: 0x5a5a52,
      head: 0x707068,
      accent: 0x9a5a30,
      bulk: 1.25,
    },
    continuity_exo_rig: {
      skin: 0x4a5236,
      top: 0x4a5236,
      legs: 0x3e4430,
      head: 0x2e3424,
      accent: 0xe8e8e0,
      bulk: 1.25,
      eyes: 0xd8f0e0,
    },
    maniac: {
      skin: 0xb88a6c,
      top: 0x4a4440,
      legs: 0x3a3632,
      head: 0xb88a6c,
      accent: 0x5a2a20,
    },
    maniac_bruiser: {
      skin: 0xa07458,
      top: 0x3a3430,
      legs: 0x2e2a26,
      head: 0xa07458,
      accent: 0x5a2a20,
    },
    brute: {
      skin: 0x6a5a78,
      top: 0x5a4a38,
      legs: 0x4a3c2c,
      head: 0x6a5a78,
      accent: 0xd8d0c0,
      bulk: 1.6,
    },
    ripjaw: {
      skin: 0x3a3428,
      top: 0x3a3428,
      legs: 0x2e2a20,
      head: 0x3a3428,
      accent: 0xd8d0b0,
    },
  };

  /** Humanoid rig. h = height; bulk = width scale. */
  function buildHumanoid(ch, s, h, bulk) {
    const u = h / 1.8;
    bulk = bulk || 1;
    const body = ch.body;
    const hips = pivot("hips", 0, 0.95 * u, 0, body);
    const torso = pivot("torso", 0, 0, 0, hips);
    mesh(
      box(0.42 * u * bulk, 0.58 * u, 0.24 * u * bulk),
      mat(s.top),
      0,
      0.3 * u,
      0,
      torso,
    );
    mesh(
      box(0.38 * u * bulk, 0.14 * u, 0.22 * u * bulk),
      mat(s.accent),
      0,
      0.02 * u,
      0,
      torso,
    ); // belt
    const head = pivot("head", 0, 0.66 * u, 0, torso);
    mesh(box(0.22 * u, 0.26 * u, 0.24 * u), mat(s.skin), 0, 0.1 * u, 0, head);
    mesh(
      box(0.24 * u, 0.08 * u, 0.26 * u),
      mat(s.head),
      0,
      0.23 * u,
      0.01,
      head,
    );
    if (s.eyes) {
      const em = mat(s.eyes, { emissive: s.eyes, emissiveIntensity: 2 });
      mesh(
        box(0.05 * u, 0.03 * u, 0.02),
        em,
        -0.05 * u,
        0.13 * u,
        -0.125 * u,
        head,
      );
      mesh(
        box(0.05 * u, 0.03 * u, 0.02),
        em,
        0.05 * u,
        0.13 * u,
        -0.125 * u,
        head,
      );
    }
    const armX = 0.27 * u * bulk;
    const lA = pivot("leftArm", -armX, 0.55 * u, 0, torso),
      rA = pivot("rightArm", armX, 0.55 * u, 0, torso);
    for (const a of [lA, rA]) {
      mesh(
        box(0.12 * u * bulk, 0.34 * u, 0.12 * u * bulk),
        mat(s.top),
        0,
        -0.17 * u,
        0,
        a,
      );
      mesh(
        box(0.1 * u * bulk, 0.3 * u, 0.1 * u * bulk),
        mat(s.skin),
        0,
        -0.48 * u,
        0,
        a,
      );
    }
    const hand = pivot("hand", 0, -0.62 * u, -0.02, rA);
    const lL = pivot("leftLeg", -0.11 * u * bulk, 0, 0, hips),
      rL = pivot("rightLeg", 0.11 * u * bulk, 0, 0, hips);
    for (const l of [lL, rL]) {
      mesh(
        box(0.15 * u * bulk, 0.48 * u, 0.16 * u * bulk),
        mat(s.legs),
        0,
        -0.24 * u,
        0,
        l,
      );
      mesh(
        box(0.13 * u * bulk, 0.44 * u, 0.14 * u * bulk),
        mat(s.legs),
        0,
        -0.68 * u,
        0,
        l,
      );
      mesh(
        box(0.14 * u, 0.08 * u, 0.24 * u),
        mat(0x2a2218),
        0,
        -0.9 * u,
        -0.04,
        l,
      );
    }
    Object.assign(ch.parts, {
      head,
      torso,
      leftArm: lA,
      rightArm: rA,
      leftLeg: lL,
      rightLeg: rL,
    });
    ch.hand = hand;
    ch.hips = hips;
    ch.kind = "biped";
  }

  function buildQuadruped(ch, col, len, hgt, wid) {
    const body = ch.body;
    const torso = pivot("torso", 0, hgt * 0.6, 0, body);
    mesh(box(wid, hgt * 0.5, len), mat(col), 0, 0, 0, torso);
    const head = pivot("head", 0, hgt * 0.15, -len * 0.55, torso);
    mesh(
      box(wid * 0.7, hgt * 0.4, len * 0.35),
      mat(col),
      0,
      0,
      -len * 0.12,
      head,
    );
    mesh(
      box(wid * 0.4, hgt * 0.2, len * 0.2),
      mat(0x221a14),
      0,
      -hgt * 0.08,
      -len * 0.3,
      head,
    );
    const legs = {};
    const lx = wid * 0.4,
      lz = len * 0.38,
      lh = hgt * 0.6;
    [
      ["leftArm", -lx, -lz],
      ["rightArm", lx, -lz],
      ["leftLeg", -lx, lz],
      ["rightLeg", lx, lz],
    ].forEach(([k, x, z]) => {
      const p = pivot(k, x, -hgt * 0.1, z, torso);
      mesh(box(wid * 0.22, lh, wid * 0.22), mat(col), 0, -lh / 2, 0, p);
      legs[k] = p;
    });
    Object.assign(ch.parts, { head, torso }, legs);
    ch.kind = "quad";
  }

  /** Build the rig for a type (with outfit variation). */
