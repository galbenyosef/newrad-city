// play-inline-457 25 — opts
// Lines 6482-6638 of readable/play-inline-457.pretty.js (statement-aligned).
  H.build = function (opts, seed) {
    const rng = L.rng(seed);
    const outfit = opts.outfit || "settler";
    const gender =
      opts.gender ||
      (outfit === "covenant_exo_rig" ||
      outfit === "continuity_exo_rig" ||
      outfit === "raider_heavy"
        ? rng.chance(0.15)
          ? "f"
          : "m"
        : rng.chance(0.42)
          ? "f"
          : "m");
    const power =
      outfit === "covenant_exo_rig" || outfit === "continuity_exo_rig";
    const cast = opts.preset && L.CAST ? L.CAST[opts.preset] : null; // story cast preset (24_cast.js)
    const bo = (cast && cast.body) || {};
    const b = H.proportions(gender, {
      scale:
        (opts.scale || 1) * (power ? 1.1 : bo.scale || rng.range(0.96, 1.04)),
      muscle: power
        ? 0.4
        : bo.muscle !== undefined
          ? bo.muscle
          : rng.range(0, 0.4) * (gender === "f" ? 0.5 : 1),
      shoulderMul: power ? 1.2 : bo.shoulderMul || 1,
      hipMul: bo.hipMul,
      headMul: bo.headMul,
      thin: bo.thin,
    });
    const R = new L.Rig("biped");
    if (power) {
      b.hitBulk = 1.7;
      b.neckY *= 1.3;
      b.height += (b.neckY * 0.3) / 1.3;
    }
    H.skeleton(R, b, power ? { softK: 0.55 } : {});
    const tones = Object.keys(L.SKIN);
    let skin =
      typeof opts.skinTone === "number"
        ? opts.skinTone
        : L.SKIN[opts.skinTone] || L.SKIN[rng.pick(tones)];
    const hairColor =
      opts.hairColor !== undefined
        ? opts.hairColor
        : outfit === "director_suit"
          ? rng.pick([0x9a9690, 0xc8c3b8, 0x5a5048])
          : rng.pick(L.HAIR);
    let hair =
      opts.hair || (gender === "f" ? rng.pick(HAIR_F) : rng.pick(HAIR_M));
    if (outfit === "raider" && !opts.hair && rng.chance(0.45)) hair = "mohawk";
    if (outfit === "dj" && !opts.hair) hair = "pompadour";
    const beard =
      opts.beard !== undefined
        ? opts.beard
        : gender === "m" && rng.chance(0.35)
          ? rng.pick(["stubble", "stubble", "full", "moustache", "goatee"])
          : null;
    const age =
      typeof opts.age === "number"
        ? clamp(opts.age, 0, 1)
        : outfit === "director_suit"
          ? 0.8
          : rng() * 0.6;
    const face = {
      skin,
      gender,
      hair,
      hairColor:
        outfit === "raider" && hair === "mohawk"
          ? rng.pick([0xa02018, 0x20a040, 0x1a1a1a, 0xd0c040])
          : hairColor,
      beard,
      age,
      paint: outfit === "raider" && rng.chance(0.6) ? "raider" : null,
      paintSeed: rng.int(0, 9),
      noseSize: rng.range(0.85, 1.2),
      jawW: gender === "f" ? rng.range(0.68, 0.76) : rng.range(0.76, 0.86),
      angry: outfit === "raider" || outfit === "raider_heavy",
      seed: ((((seed >>> 0) ^ 0x9e3779b9) >>> 0) % 1000003) + 1,
    };
    if (cast && cast.face) Object.assign(face, cast.face);
    if (opts.burn) face.burn = opts.burn; // an old burn scar down one side (March '67)
    if (opts.scars !== undefined) face.scars = opts.scars;
    const look = { skin };
    if (power) {
      if (outfit === "continuity_exo_rig") H.continuityRig(R, b, rng, opts);
      else H.exoRig(R, b, rng, opts);
      if ((opts.glasses || opts.hat) && G.DEBUG && !H._warnedPA) {
        H._warnedPA = true;
        console.warn(
          "[characters] exo-rigs ignore opts.glasses / opts.hat (the helmet replaces them)",
        );
      }
    } else {
      const fn = OUT[outfit] || OUT.settler;
      fn(R, b, rng, look, opts);
      H.head(R, b, face);
      // Hats/hair: helmets/hoods already added by outfits; optional extra hat
      let hat = opts.hat !== undefined ? opts.hat : null;
      if (hat) H.hat(R, b, hat, opts.hatColor || 0x4a3a2a);
      if (opts.glasses)
        H.glasses(R, b, opts.glasses === true ? "specs" : opts.glasses);
      // eyewear is placed on the sculpted face by 22_face.js's H.head; if that
      // head never ran (fallback head / error), fit it to the generic skull so
      // requested glasses never silently vanish
      if (b._pendingGlasses && b._pendingGlasses.length) {
        const hs = b.headS,
          C = HC(b),
          z = C[2] - 0.103 * hs;
        b._eyeFit = {
          x: 0.033 * hs,
          y: C[1] + 0.014 * hs,
          cornea: z + 0.004 * hs,
          re: 0.012 * hs,
          side: 0.085 * hs,
          sideZ: z + 0.06 * hs,
          back: C[2] + 0.1 * hs,
          brow: z,
          nose: z + 0.004 * hs,
        };
        const pend = b._pendingGlasses;
        b._pendingGlasses = null;
        if (G.DEBUG)
          console.warn(
            "[characters] eyewear placed with the fallback fit (sculpted head unavailable)",
          );
        for (const k of pend) H.glasses(R, b, k);
      }
    }
    if (cast && cast.kit && !power)
      cast.kit(
        R,
        b,
        L.rng(seed * 17 + 11),
        look,
        opts,
        L.castFlags(opts.variant),
        face,
      );
    if (!power && opts.acc)
      H.accessories(R, b, String(opts.acc).split(","), rng);
    if (!power && typeof opts.outfitColor === "number")
      H.dye(R, opts.outfitColor);
    const tpl = R.build();
    tpl.meta.bulk = b.bulk;
    tpl.meta.gender = gender;
    tpl.meta.power = power;
    // wear & variety (per-instance tint strength, grime range, starting blood)
    const W = (cast && cast.wear) || OUTFIT_WEAR[outfit] || OUTFIT_WEAR.settler;
    tpl.meta.dirt = W[0];
    tpl.meta.tintAmt = W[1];
    if (W[2]) tpl.meta.blood = W[2];
    return tpl;
  };
  void OUTFIT_GENDER;
