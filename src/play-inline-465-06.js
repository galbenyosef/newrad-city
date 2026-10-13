// play-inline-465 06 — out
// Lines 1023-1239 of readable/play-inline-465.pretty.js (statement-aligned).
  function buildSandhog(opts, seed) {
    const rng = L.rng(seed);
    const b = H.proportions("m", { scale: rng.range(0.96, 1.04), muscle: 0.1 });
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const skin = L.shade(L.SKIN[rng.pick(Object.keys(L.SKIN))], 0.86); // ordinary skin, dimmed by tunnel grime
    const slicker = rng.chance(0.4);
    const canvas = slicker
      ? rng.pick([0x2e2c28, 0x3a3a30, 0x8a6a1e])
      : rng.pick([0x6a5e44, 0x5e5a48, 0x72643e]);
    const grime = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const n = L.noise3(wx * 6, wy * 6, wz * 6);
      const low = 1 - sm(0.2, 0.9, wy); // caked mud up the legs
      const k = clamp(low * 0.7 + (n > 0.6 ? 0.35 : 0), 0, 0.8);
      out[0] = lerp(out[0], out[0] * 0.55, k);
      out[1] = lerp(out[1], out[1] * 0.52, k);
      out[2] = lerp(out[2], out[2] * 0.48, k);
      if (L.noise3(wx * 23, wy * 23 + 3, wz * 23) > 0.8) {
        out[0] *= 0.7;
        out[1] *= 0.66;
        out[2] *= 0.6;
      } // oil & soot
    };
    const look = {
      skin,
      top: canvas,
      bottom: canvas,
      topRegion: slicker ? "rubber" : "cloth",
      bottomRegion: slicker ? "rubber" : "cloth",
      paintTop: grime,
      paintBottom: grime,
      sleeve: "long",
      cuff: L.shade(canvas, 0.8),
      glove: 0x2e241a,
      boot: 0x241c16,
      bootH: 0.36,
      laces: true,
    };
    H.body(R, b, look);
    H.belt(R, b, 0x2a1e14, 0x8a8070, 3);
    const rings = H.torsoRings(b);
    // coverall bib + shoulder straps
    R.add(
      "chest",
      P.loft(H.scaleRings(rings.chest.slice(0, 3), 1.035), {
        seg: 10,
        a0: -PI * 0.3,
        a1: PI * 0.3,
      }),
      M.cloth(L.shade(canvas, 0.85), { paint: grime }),
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.035 * b.s, 0.3 * b.s, 0.24 * b.s, 0.01 * b.s),
          sg * 0.085 * b.s,
          0.14 * b.s,
          0.005 * b.s,
        ),
        M.leather(0x2a1e14),
      );
    // tool roll & a coil of fuse cord on the back
    const cz = rings.chest[2].rz + 0.04 * b.s;
    R.add(
      "chest",
      P.xf(
        P.cyl(0.05 * b.s, 0.05 * b.s, 0.3 * b.s, 10),
        0,
        0.18 * b.s,
        cz,
        0,
        0,
        PI / 2,
      ),
      M.cloth(0x5a4a34, { region: "rags" }),
    );
    R.add(
      "chest",
      P.xf(
        P.torus(0.07 * b.s, 0.012 * b.s, 5, 14),
        0.02 * b.s,
        0.02 * b.s,
        cz + 0.01 * b.s,
      ),
      { color: 0x3a2a1e, region: "rubber", rough: 0.8 },
    );
    // knee & elbow pads
    for (const S of ["L", "R"]) {
      R.add(
        "shin" + S,
        P.xf(
          P.sphere(
            0.055 * b.s,
            0.065 * b.s,
            0.03 * b.s,
            10,
            6,
            0,
            PI * 2,
            0,
            PI * 0.6,
          ),
          0,
          0.02 * b.s,
          -0.05 * b.s,
          -PI / 2,
          0,
          0,
        ),
        M.leather(0x3a2c1e),
      );
      R.add(
        "forearm" + S,
        P.xf(
          P.sphere(
            0.04 * b.s,
            0.05 * b.s,
            0.03 * b.s,
            10,
            6,
            0,
            PI * 2,
            0,
            PI * 0.6,
          ),
          0,
          0.01 * b.s,
          0.035 * b.s,
          PI / 2,
          0,
          0,
        ),
        M.leather(0x3a2c1e),
      );
    }
    H.head(R, b, {
      skin,
      gender: "m",
      hair: "bald",
      jawW: 0.82,
      seed: ((seed >>> 0) % 1000003) + 29,
    });
    H.mask(R, b, "respirator");
    H.glasses(R, b, "goggles");
    // hard hat (dented, filthy) + HEADLAMP with a glowing lens
    const hs = b.headS,
      C = [0, 0.105 * hs, -0.01 * hs];
    H.hat(R, b, "hardhat", rng.pick([0xa08028, 0x8a7a50, 0x9a6a28]));
    const top = C[1] + 0.07 * hs;
    R.add(
      "head",
      P.xf(
        P.cyl(0.028 * hs, 0.032 * hs, 0.05 * hs, 12),
        0,
        top + 0.005 * hs,
        C[2] - 0.108 * hs,
        PI / 2 - 0.15,
        0,
        0,
      ),
      M.metal(0x3a3a34, { rough: 0.5 }),
    );
    R.add(
      "head",
      P.xf(
        P.cyl(0.026 * hs, 0.026 * hs, 0.006 * hs, 12),
        0,
        top + 0.001 * hs,
        C[2] - 0.134 * hs,
        PI / 2 - 0.15,
        0,
        0,
      ),
      {
        color: 0xfff0b0,
        emis: 2.2,
        rough: 0.1,
        keepLod: true,
        rigid: true,
        cls: 0,
      },
    );
    R.add(
      "head",
      P.xf(
        P.box(0.03 * hs, 0.012 * hs, 0.02 * hs, 0.003 * hs),
        0,
        top + 0.025 * hs,
        C[2] - 0.095 * hs,
      ),
      M.metal(0x2a2a26),
    );
    R.socket("lamp", "head", 0, top + 0.001 * hs, C[2] - 0.14 * hs);
    const tpl = R.build();
    tpl.meta.bodyThick = 0.13;
    return tpl;
  }
  L.infos.sandhog = {
    kind: "biped",
    height: 1.8,
    radius: 0.34,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: LBL,
    gait: { walkStep: 0.7, runStep: 1.25, walkSpeed: 1.5, runSpeed: 4.8 },
    style: {
      hunch: 0.28,
      shrug: 0.06,
      armOut: 0.12,
      stride: 0.95,
      armSwing: 0.9,
    },
    variants: 4,
    build: buildSandhog,
  };
