// play-inline-257 05 — the
// Lines 940-1146 of readable/play-inline-257.pretty.js (statement-aligned).
  function ramps(b) {
    const RZ = M.ramp,
      w = RZ.z1 - RZ.z0,
      zc = (RZ.z0 + RZ.z1) / 2;
    for (const [x0, x1, yf, dirUp] of [
      [M.rampM.x0, M.rampM.x1, rampYM, 1],
      [M.rampB.x0, M.rampB.x1, rampYB, -1],
    ]) {
      const len = x1 - x0,
        ang = Math.atan2(M.deck, len) * dirUp,
        L = Math.hypot(len, M.deck);
      b.add("asphalt", new THREE.BoxGeometry(L, 0.5, w, 18, 1, 1), {
        m: PF.m4((x0 + x1) / 2, M.deck / 2 - 0.25, zc, 0, 0, ang),
        grime: 0.6,
      });
      // solid masonry approach under the slope (viaduct walls with arches on the faces)
      const sh = new THREE.Shape();
      if (dirUp > 0) {
        sh.moveTo(x0, 0);
        sh.lineTo(x1, 0);
        sh.lineTo(x1, M.deck - 0.5);
        sh.closePath();
      } else {
        sh.moveTo(x0, 0);
        sh.lineTo(x1, 0);
        sh.lineTo(x0, M.deck - 0.5);
        sh.closePath();
      }
      const vg = new THREE.ExtrudeGeometry(sh, {
        depth: w - 0.2,
        bevelEnabled: false,
      });
      b.add("granite_block", vg, { m: PF.m4(0, 0, RZ.z0 + 0.1), grime: 0.6 });
      // arcade reliefs on the viaduct faces
      for (let x = x0 + 6; x < x1 - 4; x += 6) {
        const hTop = yf(x) - 1.2;
        if (hTop < 3) continue;
        for (const zf of [RZ.z0 + 0.05, RZ.z1 - 0.05])
          b.boxMM(
            "concrete_dark",
            x - 1.8,
            0,
            zf - 0.05,
            x + 1.8,
            Math.min(hTop, 8),
            zf + 0.05,
            { seg: false, grime: 0.8 },
          );
      }
      PF.stepPath(
        dirUp > 0 ? x0 : x1,
        zc,
        dirUp > 0 ? HP : -HP,
        w,
        len,
        (t) => t * M.deck,
        { maxRise: 0.25, thick: 0.8, maxLen: 1.2 },
      );
      const pts = (z) => {
        const o = [];
        for (let x = x0; x <= x1 + 0.01; x += 6) o.push([x, z, yf(x)]);
        if (o[o.length - 1][0] < x1) o.push([x1, z, yf(x1)]);
        return o;
      };
      BK.rail(b, pts(RZ.z0 + 0.15), { post: 2.5 });
      BK.rail(b, pts(RZ.z1 - 0.15), { post: 2.5 });
    }
    // through the arch the ramp is flanked by the pylons: the rail colliders there are harmless
  }

  // =================================================================
  // Dressing: wrecks, the dangling subway car, Brute territory markers
  // =================================================================
  function dress(b, anchors) {
    const d = M.deck;
    PF.car(b, 300, d, 571, HP + 0.2, { seed: 21 });
    PF.car(b, 334, d, 575.5, HP - 0.35, { seed: 22, paint: "paint_teal" });
    PF.car(b, 352, d, 569.5, HP + 0.9, { seed: 23, flipped: true });
    PF.car(b, 391, d, 576, HP, { seed: 24, paint: "rust" });
    PF.car(b, 418, d, 570, HP - 0.15, { seed: 25 });
    PF.car(b, 455, d, 575.8, HP + 0.3, { seed: 26, paint: "paint_cream" });
    PF.skeleton(b, 336.5, d + 0.02, 572.6, 1.2);
    // bus wreck across two lanes near midspan
    b.boxMM("paint_orange", 372, d + 0.5, 568.2, 383, d + 3.6, 571, {
      rz: 0.03,
      grime: 0.8,
      seg: false,
    });
    b.boxMM("glass_broken", 372.1, d + 2.0, 568.15, 382.9, d + 3.0, 571.05, {
      seg: false,
    });
    PF.colMM(372, d, 568.2, 383, d + 3.6, 571, { surface: "metal" });
    // the derailed D-train car hanging out of the lower level, over the river
    const car = PF.m4(356, M.lo + 0.2, M.cables[0] - 1.5, 0.18, 0, -0.55);
    const cg = new THREE.BoxGeometry(15, 3.4, 3.0);
    cg.translate(4, 1.7, 0);
    b.add("subway_car", cg, {
      m: car.clone().multiply(new THREE.Matrix4().makeRotationY(0.25)),
      grime: 0.7,
    });
    for (let i = 0; i < 6; i++) {
      const wg = new THREE.PlaneGeometry(1.1, 0.9);
      wg.translate(-1.5 + i * 2.2, 2.2, 1.52);
      b.add("glass_broken", wg, {
        m: car.clone().multiply(new THREE.Matrix4().makeRotationY(0.25)),
        uv: "keep",
        noAO: true,
      });
    }
    const lg = PF.texMat(
      "mb_dtrain",
      PF.signTex("mb_dtrain", ["D"], "enamel", 128, 128, {
        bg: "#e8702a",
        fg: "#ffffff",
      }),
      { rough: 0.8 },
    );
    const lp = new THREE.PlaneGeometry(0.7, 0.7);
    lp.translate(11.45, 2.4, 0);
    lp.rotateY(HP);
    b.add(lg, lp, {
      m: car.clone().multiply(new THREE.Matrix4().makeRotationY(0.25)),
      uv: "keep",
      noAO: true,
    });
    // Brute territory: meat bags on the arch & at the anchorage door, spiked barricade, bonfire
    for (const [x, z] of [
      [227.5, 570],
      [227.5, 576],
      [274, 587.5],
      [279, 587.5],
    ]) {
      b.beam("rust", V3(x, 6.5, z), V3(x, 4.2, z), 0.03, 0.03, {});
      b.sphere("gore", x, 3.6, z, 0.45, { ws: 8, hs: 6, sy: 1.5 });
    }
    PF.scrapWall(b, 266, 590.5, 270, 590.5, 1.8, { seed: 31 });
    PF.barrel(b, 283, 0, 590, { fire: true });
    PF.skeleton(b, 280.5, 0.02, 589.2, 2.4);
    D.rubble(b, 266, 0, 588.5, 1.1, 6, 32);
    const gr2 = PF.texMat(
      "mb_graf2",
      PF.graffitiTex("mb_graf2", ["TOLL = 1 HUMIE"], 512, 192, {
        color: "#d8302a",
      }),
      { transparent: true, rough: 1 },
    );
    b.quad(gr2, M.arch.x0 - 0.06, 3.2, M.zc - 8.5, 5, 1.9, {
      ry: -HP,
      grime: 0.1,
    });
    // lamps along the span (all dead) and the old bridge sign
    for (let x = 300; x < 460; x += 20) {
      BK.lamp(b, x, d, M.z1 - 0.8, PI, false);
      BK.lamp(b, x + 10, d, M.z0 + 0.8, 0, false);
    }
    const hs = PF.texMat(
      "mb_hwy",
      PF.signTex(
        "mb_hwy",
        ["MANHATTAN BRIDGE", "TO BROOKLYN · FLATBUSH AV"],
        "enamel",
        1024,
        320,
        { bg: "#1f5a3c" },
      ),
      { rough: 0.7 },
    );
    BK.gantry(
      b,
      250,
      rampYM(250),
      M.ramp.z0 - 0.3,
      M.ramp.z1 + 0.3,
      5.4,
      hs,
      5.6,
      1.7,
      -HP,
    );
    anchors.plaza = PF.anchor(210, 0, 573, -HP);
    anchors.arch = PF.anchor(222, 0, 573, -HP);
    anchors.deck_mid = PF.anchor(378, d, 573, -HP);
    anchors.brooklyn_foot = PF.anchor(558, 0, 573, HP);
    anchors.guard1 = PF.anchor(273, 0, 590, PI);
    anchors.guard2 = PF.anchor(279.5, 0, 591.5, PI);
  }

  // =================================================================
  // BUILD
  // =================================================================
  PF.buildManhattanExterior = function (root) {
    const b = PF.batch("mb_ext");
    const anchors = {};
    arch(b);
    colonnades(b);
    anchorage(b, M.ancM, true, anchors);
    anchorage(b, M.ancB, false, anchors);
    tower(b, M.t1);
    tower(b, M.t2);
    deck(b);
    cables(b);
    ramps(b);
    dress(b, anchors);
    b.build(root);
    anchors.entrance = anchors.anchorage_door;
    return anchors;
  };
