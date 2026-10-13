// play-inline-461 02 — rng
// Lines 18-363 of readable/play-inline-461.pretty.js (statement-aligned).
  const L = G.chars._lib,
    H = L.human;
  const P = L.prim,
    PAL = L.PAL,
    M = H.mat;
  const K = L.creatureKit,
    seg = K.seg,
    claw = K.claw,
    bodyZ = K.bodyZ,
    skinMat = K.skinMat,
    sixLegRig = K.sixLegRig,
    smoothstep = K.smoothstep,
    ALL6 = K.ALL6,
    LBL = K.LBL;
  const lerp = L.lerp,
    clamp = L.clamp;
  const PI = Math.PI;

  // ==================================================================
  // MANIACS — ordinary people whose minds radiation sickness burned out.
  // Normal skin under ground-in dirt, scabs and the odd old burn; bloodshot
  // eyes, wild matted hair, unkempt beards; the filthy, torn remains of the
  // clothes they wore when their minds went (shirts, cardigans, office
  // jackets, housecoats), often barefoot. Crouched, twitchy, clawing hands.
  // The bruiser: a big heavy-set one, shirt long gone, the one the pack follows.
  // ==================================================================
  // faded, filthy everyday clothes (a white shirt gone grey, a blue work shirt, a brown cardigan …)
  const CLOTH = [
    0xb8b2a2, 0x7e90a0, 0x9a8a6c, 0x6e7660, 0xa8927a, 0x8a6a52, 0x9898a2,
    0xb4a07e, 0x6e8494, 0x9a6650, 0xc8bea8,
  ];
  const PANTS = [0x3a3a3e, 0x4a4234, 0x2e3440, 0x5a5040, 0x3e3a34];
  const DIRTY_LINEN = [0xa89e88, 0x9a907a, 0xb4aa94, 0x8a8270];
  // What they were before '67, read from what is left of their clothes (weights = how common).
  const ARCH = [
    { id: "street", w: 4 },
    {
      id: "office",
      w: 2,
      shirt: [0xd8d4c8, 0xc8ccd4, 0xd4ccb8],
      pants: [0x2e3038, 0x3a3a40, 0x403a34],
      top: "shirt",
      tie: [0x7a2e1e, 0x2a3a5a, 0x3a4a2a, 0x5a2a4a],
    },
    {
      id: "labor",
      w: 2,
      shirt: [0x4a5a6a, 0x5a6a7a, 0x6a5a3a, 0x7a3a2a],
      pants: [0x34445a, 0x2e3e54, 0x4a4030],
      top: "shirt",
      sleeve: "rolled",
    },
    {
      id: "patient",
      w: 1,
      shirt: [0xc8d4d8, 0xb8c8c8, 0xd0d4cc],
      pants: null,
      top: "shirt",
      sleeve: "short",
      gown: true,
    },
    {
      id: "army",
      w: 1,
      shirt: [0x5a5e3a, 0x4e5434, 0x5e5a40],
      pants: [0x4a4e30, 0x44482e],
      top: "jacket",
    },
    {
      id: "uniform",
      w: 1,
      shirt: [0x6a2a2a, 0x2a3a5a, 0x3a3a3e],
      pants: [0x2a2a30, 0x1e2230],
      top: "jacket",
      brass: true,
    },
    {
      id: "housedress",
      w: 2,
      f: true,
      shirt: [0x9a7a8a, 0x7a9aaa, 0xb09a70, 0x8aa07a, 0xb08a7a],
      pants: null,
      top: "shirt",
      sleeve: "short",
      gown: true,
    },
  ];
  function pickArch(rng, gender, big) {
    const list = ARCH.filter(
      (x) =>
        (!x.f || gender === "f") && !(big && (x.gown || x.id === "office")),
    );
    let t = list.reduce((n, x) => n + x.w, 0) * rng.range(0, 1);
    for (const x of list) {
      t -= x.w;
      if (t <= 0) return x;
    }
    return list[0];
  }
  const tear = (seedK, amt) => (v) => {
    if (v.y < 0) v.y += (L.hash3(v.x * 300 + seedK, 3, v.z * 300) - 0.5) * amt;
  };
  function buildManiac(opts, seed, big) {
    const rng = L.rng(seed);
    const gender = opts.gender || (rng.chance(big ? 0.1 : 0.3) ? "f" : "m");
    const b = big
      ? H.proportions(gender, {
          scale: rng.range(1.06, 1.12),
          muscle: rng.range(0.45, 0.75),
          shoulderMul: 1.06,
        })
      : H.proportions(gender, {
          scale: rng.range(0.9, 1.05),
          thin: rng.chance(0.75),
          muscle: rng.range(0, 0.35),
        });
    const old = rng.chance(0.3); // was already middle-aged in '67: greyer hair
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const tones = Object.keys(L.SKIN);
    const skin = L.shade(L.SKIN[rng.pick(tones)], rng.range(0.86, 0.95)); // an ordinary skin tone, dulled by dirt
    const burn = rng.chance(big ? 0.45 : 0.25)
      ? rng.chance(0.5)
        ? "L"
        : "R"
      : null;
    const sm = () =>
      skinMat(skin, {
        region: "skin",
        paint: H.grimePaint({ burn }),
        noise: 0.1,
      });
    const grime = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const n = L.noise3(wx * 8, wy * 8, wz * 8);
      if (n > 0.62) {
        out[0] *= 0.7;
        out[1] *= 0.66;
        out[2] *= 0.6;
      } else if (n < 0.3) {
        out[0] *= 0.88;
        out[1] *= 0.85;
        out[2] *= 0.8;
      }
    };
    const rag = (c) => M.cloth(c, { region: "rags", paint: grime });
    const arch = pickArch(rng, gender, big);
    const shirtC = arch.shirt
      ? L.shade(rng.pick(arch.shirt), rng.range(0.8, 1))
      : rng.pick(CLOTH);
    const pantC = arch.gown
        ? shirtC
        : arch.pants
          ? rng.pick(arch.pants)
          : rng.pick(PANTS),
      linen = rng.pick(DIRTY_LINEN);
    const shirtM = rag(shirtC),
      pantM = rag(pantC);
    const top =
      arch.top && !(big && rng.chance(0.5))
        ? arch.top
        : gender === "f"
          ? rng.pick(["shirt", "shirt", "jacket"])
          : big
            ? rng.pick(["none", "none", "shirt"])
            : rng.pick(["shirt", "shirt", "jacket", "jacket", "shirt", "none"]);
    const barefoot = rng.chance(big ? 0.7 : 0.55);
    const look = {
      skin,
      grime: true,
      topMat: top === "none" ? sm() : shirtM,
      abdomenMat: top === "none" ? sm() : shirtM,
      bottomMat: pantM,
      pantsMat: pantM,
      sleeve:
        top === "jacket"
          ? "long"
          : top === "shirt"
            ? arch.sleeve || rng.pick(["short", "none", "rolled"])
            : "none",
      sleeveMat: shirtM,
      shorts: arch.gown ? false : rng.chance(big ? 0.4 : 0.25),
      boot: rng.pick([0x2a241e, 0x3a2a1e, 0x1e1c1a]),
      bootMat: barefoot ? sm() : null,
      bootH: barefoot ? 0 : 0.12,
      laces: false,
      barefoot,
    };
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    // torn hems: ragged shirt hem over the belly, shreds hanging off one side
    if (top !== "none") {
      const hem = P.loft(H.scaleRings(rings.abdomen.slice(0, 3), 1.05), {
        seg: 16,
      });
      P.deform(hem, tear(seed % 97, 0.08 * b.s));
      R.add("spine", hem, shirtM);
      const a0 = rng.range(-1.2, 0.6);
      const shred = P.loft(H.scaleRings(rings.chest.slice(0, 3), 1.06), {
        seg: 6,
        a0,
        a1: a0 + rng.range(0.6, 1.2),
      });
      P.deform(shred, (v) => {
        v.y -= 0.07 * b.s * L.hash3(v.x * 200, 9, v.z * 200);
      });
      R.add("chest", shred, shirtM);
    }
    if (arch.tie && top !== "none" && rng.chance(0.8)) {
      // what's left of a necktie, loosened and askew
      const tc = M.cloth(rng.pick(arch.tie), { region: "rags", paint: grime }),
        zf = -rings.chest[2].rz * 1.05,
        tilt = rng.range(-0.25, 0.25);
      R.add(
        "chest",
        P.xf(
          P.box(0.03 * b.s, rng.range(0.12, 0.24) * b.s, 0.008 * b.s, 0.003),
          0,
          0.07 * b.s,
          zf,
          0.08,
          0,
          tilt,
        ),
        tc,
      );
      R.add(
        "chest",
        P.xf(
          P.box(0.032 * b.s, 0.022 * b.s, 0.014 * b.s, 0.004),
          0,
          0.2 * b.s,
          -rings.chest[2].rz,
          0.1,
          0,
          tilt,
        ),
        tc,
      );
    }
    if (arch.brass && top === "jacket")
      for (let i = 0; i < 4; i++) {
        // a doorman's / conductor's brass buttons, some torn off
        if (rng.chance(0.25)) continue;
        R.add(
          "chest",
          P.xf(
            P.sphere(0.011 * b.s, 0.011 * b.s, 0.006 * b.s, 6, 4),
            0.035 * b.s,
            (0.2 - i * 0.075) * b.s,
            -rings.chest[2].rz * 1.06,
          ),
          M.cloth(0xb08a3a, { region: "metal", rough: 0.45, metal: 0.65 }),
        );
      }
    if (arch.gown) {
      // a hospital gown or housedress: a torn skirt hanging below the hips
      const sk = P.loft(H.scaleRings(rings.pelvis.slice(0, 4), 1.12, 1.25), {
        seg: 16,
      });
      P.deform(sk, (v) => {
        v.y -=
          rng.range(0.1, 0.18) *
          b.s *
          (0.6 + 0.4 * L.hash3(v.x * 160, 3, v.z * 160));
      });
      R.add("hips", sk, shirtM);
    }
    const hem = P.loft(H.scaleRings(rings.pelvis.slice(1, 4), 1.06), {
      seg: 16,
    });
    P.deform(hem, tear(seed % 13, 0.07 * b.s));
    R.add("hips", hem, pantM);
    // what is left of an overcoat on some: a torn drape over the shoulders
    if (!big && rng.chance(0.35)) {
      const sh = P.loft(H.scaleRings(rings.chest.slice(2, 5), 1.14, 1.2), {
        seg: 14,
        a0: rng.range(-0.6, 0.2),
        a1: PI * rng.range(1.2, 1.7),
      });
      P.deform(sh, tear(seed % 31, 0.08 * b.s));
      R.add("chest", sh, rag(rng.pick(CLOTH)));
    }
    // filthy strips of cloth tied round a hand or a shin (old wounds)
    if (rng.chance(0.35))
      H.wraps(R, b, linen, rng.chance(0.5) ? "arms" : "legs", {
        armTop: rng.range(0.55, 0.75),
      });
    if (barefoot)
      for (const S of ["L", "R"])
        for (let i = 0; i < 3; i++)
          R.add(
            "foot" + S,
            P.xf(
              P.sphere(0.014 * b.s, 0.012 * b.s, 0.02 * b.s, 6, 5),
              (i - 1) * 0.026 * b.s,
              -b.ankle + 0.012 * b.s,
              -0.19 * b.s,
            ),
            sm(),
          );
    // long, broken, filthy nails
    for (const S of ["L", "R"]) {
      const sg = S === "L" ? -1 : 1;
      for (let i = 0; i < 3; i++)
        claw(
          R,
          "hand" + S,
          [
            [-sg * 0.03 * b.s, -0.13 * b.s, (i - 1) * 0.022 * b.s],
            [-sg * 0.034 * b.s, -0.142 * b.s, (i - 1) * 0.023 * b.s],
          ],
          0.0035 * b.s,
          { color: 0x4a3a2a, rough: 0.6 },
        );
    }
    const hair = big
      ? rng.pick(["patchy", "buzz", "wild", "bald"])
      : gender === "f"
        ? rng.pick(["wild", "wild", "long", "patchy"])
        : rng.pick(["wild", "wild", "long", "patchy", "balding"]);
    const beard =
      gender === "m" && rng.chance(0.7)
        ? rng.pick(["full", "full", "stubble"])
        : null;
    H.head(R, b, {
      skin,
      gender,
      maniac: true,
      hair,
      hairColor: old
        ? L.shade(
            rng.pick([0x8a8680, 0x9a968e, 0x6e6a64]),
            rng.range(0.85, 1.05),
          )
        : rng.pick(L.HAIR),
      beard,
      burn,
      dirt: 1,
      jawW: gender === "f" ? 0.74 : big ? 0.9 : 0.8,
      seed: ((seed >>> 0) % 1000003) + 1,
    });
    const tpl = R.build();
    tpl.meta.bodyThick = big ? 0.13 : 0.11;
    tpl.meta.dirt = [0.6, 0.95];
    return tpl;
  }
