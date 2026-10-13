// play-inline-465 05 — rng
// Lines 776-1022 of readable/play-inline-465.pretty.js (statement-aligned).
  L.infos.stag = {
    kind: "quad",
    height: 1.95,
    radius: 0.75,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Hind Leg",
      rightLeg: "Right Hind Leg",
    },
    gait: { walkStep: 0.9, runStep: 2.1, walkSpeed: 1.5, runSpeed: 9.0 },
    style: { stride: 0.9, pant: false, wag: false, tailUp: 0.1, graze: true },
    variants: 4,
    build: buildStag,
  };

  // ==================================================================
  // CRAWLER — tunnel dwellers: knuckle-dragging, pallid, sore-covered
  // ==================================================================
  function buildTrog(opts, seed) {
    const rng = L.rng(seed);
    const gender = opts.gender || (rng.chance(0.25) ? "f" : "m");
    const b = H.proportions(gender, {
      scale: rng.range(0.9, 0.98),
      thin: true,
      muscle: 0.15,
    });
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const skin = rng.pick([0x8c7c72, 0x86766e, 0x928076, 0x7e7068]);
    const vein = L.col(0x5a3a52),
      sore = L.col(0x7a2a22),
      pale = L.col(0xd0c0b0);
    const ph = rng.range(0, 30);
    const trogPaint = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const n =
        L.noise3(wx * 5 + ph, wy * 5, wz * 5) * 0.6 +
        L.noise3(wx * 13, wy * 13 + ph, wz * 13) * 0.4;
      if (n > 0.56)
        mixTo(out, pale, Math.min(0.6, (n - 0.56) * 2.2)); // blotchy pallor
      else if (n < 0.4) {
        out[0] *= 0.86;
        out[1] *= 0.8;
        out[2] *= 0.84;
      } // bruised, purplish mottling
      // filth: caked hands, feet & shins
      const low = 1 - sm(0.1, 0.55, wy);
      if (low > 0) {
        const k = low * 0.55;
        out[0] *= 1 - k * 0.5;
        out[1] *= 1 - k * 0.55;
        out[2] *= 1 - k * 0.6;
      }
      // purple vein network (ridged noise)
      const v = Math.abs(L.noise3(wx * 26 + ph, wy * 26, wz * 26) - 0.5);
      if (v < 0.02) mixTo(out, vein, ((0.02 - v) / 0.02) * 0.45);
      // weeping sores
      const s2 = L.noise3(wx * 17, wy * 17 + ph, wz * 17);
      if (s2 > 0.83) mixTo(out, sore, sm(0.83, 0.88, s2) * 0.8);
      if (ny < -0.4) {
        out[0] *= 0.85;
        out[1] *= 0.82;
        out[2] *= 0.82;
      }
    };
    const skinMat = (extra) =>
      Object.assign(
        {
          color: skin,
          region: "skin",
          rough: 0.55,
          noise: 0.18,
          grad: [0.85, 1.05],
          paint: trogPaint,
        },
        extra || {},
      );
    const ragM = M.cloth(rng.pick([0x4a3a2a, 0x3a3228, 0x5a4a38]), {
      region: "rags",
    });
    const look = {
      skin,
      topMat: skinMat(),
      abdomenMat: skinMat(),
      bottomMat: ragM,
      pantsMat: ragM,
    };
    // (H.body without its human skin paint: the crawler's sores & veins run down the limbs too)
    H.torso(R, b, look);
    H.neck(R, b, skinMat());
    for (const S of ["L", "R"]) {
      H.arm(R, b, S, {
        sleeve: "none",
        skin,
        skinPaint: trogPaint,
        skinRegion: "skin",
        mul: 1.04,
      });
      H.leg(R, b, S, {
        pantsMat: ragM,
        shorts: true,
        barefoot: true,
        boot: skin,
        bootH: 0,
        skin,
        skinPaint: trogPaint,
        skinRegion: "skin",
      });
    }
    // loincloth flaps front & back
    const rings = H.torsoRings(b);
    const hem = P.loft(H.scaleRings(rings.pelvis.slice(1, 4), 1.07), {
      seg: 16,
    });
    P.deform(hem, (v) => {
      if (v.y < 0) v.y += (L.hash3(v.x * 200, 1, v.z * 200) - 0.5) * 0.07;
    });
    R.add("hips", hem, ragM);
    for (const zs of [-1, 1])
      R.add(
        "hips",
        P.xf(
          P.box(0.14 * b.s, 0.2 * b.s, 0.01 * b.s, 0.004 * b.s),
          0,
          -0.2 * b.s,
          zs * 0.105 * b.s,
          zs * 0.08,
          0,
          0,
        ),
        ragM,
      );
    // lumpy growths over the shoulders, spine & one arm
    for (let i = 0; i < 9; i++) {
      const bone = rng.pick(["chest", "chest", "spine", "armL", "armR"]);
      const r = rng.range(0.018, 0.04) * b.s;
      const a = rng.range(-2.4, 2.4),
        y =
          bone === "chest"
            ? rng.range(0.08, 0.22) * b.s
            : bone === "spine"
              ? rng.range(0.02, 0.14) * b.s
              : -rng.range(0.05, 0.2) * b.s;
      const rr = bone.startsWith("arm") ? 0.045 * b.s : 0.13 * b.s;
      R.add(
        bone,
        P.xf(
          P.sphere(r, r * 0.8, r, 7, 5),
          Math.sin(a) * rr,
          y,
          Math.cos(a) * rr * 0.8 + (bone.startsWith("arm") ? 0 : 0.01 * b.s),
        ),
        skinMat({ color: L.shade(skin, 1.08) }),
      );
    }
    // knobbly spine ridge down the hunched back
    for (let i = 0; i < 6; i++)
      R.add(
        i < 3 ? "chest" : "spine",
        P.xf(
          P.sphere(0.014 * b.s, 0.012 * b.s, 0.012 * b.s, 6, 4),
          0,
          (i < 3 ? 0.2 - i * 0.07 : 0.14 - (i - 3) * 0.06) * b.s,
          0.115 * b.s,
        ),
        skinMat(),
      );
    // long broken nails, gnarled toes
    for (const S of ["L", "R"]) {
      const sg = S === "L" ? -1 : 1;
      for (let i = 0; i < 4; i++)
        claw(
          R,
          "hand" + S,
          [
            [-sg * 0.03 * b.s, -0.13 * b.s, (i - 1.5) * 0.018 * b.s],
            [-sg * 0.045 * b.s, -0.165 * b.s, (i - 1.5) * 0.02 * b.s],
          ],
          0.0045 * b.s,
          { color: 0x4a3a28, rough: 0.6 },
        );
    }
    for (const S of ["L", "R"])
      for (let i = 0; i < 4; i++)
        R.add(
          "foot" + S,
          P.xf(
            P.sphere(0.013 * b.s, 0.011 * b.s, 0.02 * b.s, 6, 5),
            (i - 1.5) * 0.022 * b.s,
            -b.ankle + 0.011 * b.s,
            -0.19 * b.s,
          ),
          skinMat(),
        );
    H.head(R, b, {
      skin,
      gender,
      maniac: true,
      hair: rng.chance(0.25) ? "patchy" : "bald",
      hairColor: 0x2a2420,
      jawW: 0.92,
      noseSize: 1.2,
      mood: "maniac",
      seed: ((seed >>> 0) % 1000003) + 11,
      skinPaint: trogPaint,
    });
    const tpl = R.build();
    tpl.meta.bodyThick = 0.11;
    return tpl;
  }
  L.infos.crawler = {
    kind: "biped",
    height: 1.5,
    radius: 0.34,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: LBL,
    gait: { walkStep: 0.6, runStep: 1.35, walkSpeed: 1.4, runSpeed: 6.6 },
    // knuckle-dragging crouch: deep hunch, bent knees, long arms hanging forward
    style: {
      hunch: 1.15,
      neckK: 0.5,
      crouch: 0.5,
      shrug: 0.2,
      wild: true,
      claws: true,
      armFwd: 0.7,
      elbow: 0.45,
      armOut: 0.22,
      stride: 0.95,
      armSwing: 1.3,
      lookLimit: 1.4,
    },
    variants: 5,
    build: buildTrog,
  };

  // ==================================================================
  // SANDHOG — tunnel workers: rubber slicker or canvas coveralls,
  // half-face respirator, safety goggles, miner's helmet with a lit headlamp
  // ==================================================================
