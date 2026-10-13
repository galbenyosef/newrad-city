// play-inline-534 04 — the
// Lines 795-993 of readable/play-inline-534.pretty.js (statement-aligned).
  function mats() {
    if (MATS) return MATS;
    const tx = (fn, n) => {
      try {
        if (G.isStub("tex")) return null;
        const t = G.tex[fn](n);
        return t && t.isTexture ? t : null;
      } catch (e) {
        return null;
      }
    };
    // pine: the colour comes from the vertex tints (per board); the plank texture only lends its grain
    // relief through the normal map (its albedo is dark, stained floorboard — wrong for a bench top)
    const w = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.78,
      metalness: 0,
      normalMap: tx("normal", "wood_planks"),
    });
    if (w.normalMap) w.normalScale.set(0.7, 0.7);
    // painted / cast / brass parts: moderately metallic, polished enough that the brass and the red press catch light
    const m = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.38,
      metalness: 0.55,
    });
    // lantern glass: a warm emissive, turned up at night (X.benchTick)
    const g = new THREE.MeshStandardMaterial({
      color: 0xffe0a0,
      roughness: 0.2,
      metalness: 0,
      emissive: 0xffa040,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.92,
    });
    // benches under a roof (Grand Central concourse, a trading post) keep the lantern lit all day
    const gi = g.clone();
    gi.emissiveIntensity = 2.2;
    w.userData.shared = true;
    m.userData.shared = true;
    g.userData.shared = true;
    gi.userData.shared = true;
    return (MATS = { wood: w, metal: m, glass: g, glassIn: gi });
  }
  let glowT = 0;
  /** Lantern glow follows the time of day (cheap: one shared material, twice a second). */
  X.benchTick = function (realDt) {
    if (!MATS || !X.reloadBenches.length) return;
    glowT -= realDt;
    if (glowT > 0) return;
    glowT = 0.5;
    const h = (G.time && G.time.hour) || 12;
    const night =
      h < 6 || h > 19.5
        ? 1
        : h < 7.5
          ? (7.5 - h) / 1.5
          : h > 18
            ? (h - 18) / 1.5
            : 0;
    MATS.glass.emissiveIntensity = 0.45 + night * 2.2;
  };

  // ------------------------------------------------------------------
  // Placement: reloading benches live where gun people work:
  // next to a settlement's gun merchant or armoury, backed against a wall,
  // with open floor in front. Each entry: [site, anchor names, fallback x/z,
  // search radius min/max, note]. The anchor is read from landmarks/POIs at
  // initDone (static world); the bench keeps >= 2 m clear of it (an NPC
  // or a stall usually stands there).
  // ------------------------------------------------------------------
  X.RELOAD_BENCHES = [
    // pin (optional): a hand-checked spot {x, z, k (yaw = k·π/2)} tried first; still validated like any other
    [
      "grand_central",
      ["merchant1", "guns", "merchant4"],
      { x: 224, z: -255 },
      3,
      9,
      "Grand Central Market (gun stall)",
      { x: 229.1, z: -243.72, k: 2 },
    ],
    [
      "times_square",
      ["repairman", "butcher", "plaza"],
      { x: -56, z: -257 },
      2.5,
      12,
      "The Neon (repair cart)",
    ],
    [
      "rockefeller",
      ["workbench", "armory", "quartermaster"],
      { x: 77, z: -337 },
      2.2,
      9,
      "Iron Covenant outpost armoury",
    ],
    [
      "flatiron",
      ["merchant1", "merchant2", "entrance"],
      { x: 146, z: 90 },
      3,
      11,
      "Flatiron Trading Post",
    ],
  ];
  X.reloadBenches = [];
  function anchorOf(site, names) {
    for (const n of names) {
      let v = null;
      try {
        if (
          !G.isStub("landmarks") &&
          G.landmarks &&
          typeof G.landmarks.getAnchor === "function"
        )
          v = G.landmarks.getAnchor(site, n);
      } catch (e) {
        v = null;
      }
      if (!v) {
        try {
          if (
            G.pois &&
            !G.pois.__stub &&
            typeof G.pois.getAnchor === "function"
          )
            v = G.pois.getAnchor(site, n);
        } catch (e) {
          v = null;
        }
      }
      if (v && isFinite(v.x) && isFinite(v.z)) {
        // a stall's customer spot tells which way the counter faces: keep that corridor free
        let cu = null;
        try {
          if (!G.isStub("landmarks") && G.landmarks.getAnchor)
            cu = G.landmarks.getAnchor(site, n + "_customer");
        } catch (e) {
          cu = null;
        }
        let face = null;
        if (cu && isFinite(cu.x)) {
          const fx = cu.x - v.x,
            fz = cu.z - v.z,
            l = Math.hypot(fx, fz);
          if (l > 0.3) face = [fx / l, fz / l];
        }
        return {
          x: v.x,
          y: isFinite(v.y) ? v.y : null,
          z: v.z,
          name: n,
          face,
          eye: cu && isFinite(cu.x) ? { x: cu.x, z: cu.z } : null,
        };
      }
    }
    return null;
  }
  // axis rays from a candidate spot: +x, -x, +z, -z (the street grid is axis-aligned)
  const AX = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const _o = new THREE.Vector3(),
    _d = new THREE.Vector3();
  function rayDist(x, y, z, dx, dz, max, heights) {
    let best = max;
    for (const hy of heights || [0.35, 0.95, 1.55]) {
      let h = null;
      try {
        h = G.world.raycast(_o.set(x, y + hy, z), _d.set(dx, 0, dz), max, {
          ignoreTags: ["actor", "foliage"],
        });
      } catch (e) {
        h = null;
      }
      if (h && h.dist < best) best = h.dist;
    }
    return best;
  }
  // yaw k·π/2 → [front, back, right, left] as indices into AX (front = local −Z, right = local +X)
  const YAW_DIRS = [
    [3, 2, 0, 1],
    [1, 0, 3, 2],
    [2, 3, 1, 0],
    [0, 1, 2, 3],
  ];
  /**
   * Best bench spot near an anchor: on flat ground at the anchor's level, back to a wall (≤ 1.8 m),
   * ≥ 2.2 m of open floor in front, room for the crate on its right. Returns {x, y, z, yaw, score} | null.
   */
