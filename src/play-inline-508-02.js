// play-inline-508 02 — torso
// Lines 349-685 of readable/play-inline-508.pretty.js (statement-aligned).
  function build(type, opts) {
    const td = C.typeDef(type);
    const root = new THREE.Group();
    root.name = "ph_" + type;
    const body = new THREE.Group();
    root.add(body);
    const ch = {
      root,
      body,
      type,
      parts: {},
      placeholder: true,
      height: td.height || 1.8,
      radius: td.radius || 0.35,
      _anim: "idle",
      _animT: 0,
      _speed: 1,
      _oneShot: null,
      _oneShotT: 0,
      _dead: false,
      _deathT: 0,
      _hidden: new Set(),
    };
    const outfit = (opts && opts.outfit) || null;
    switch (type) {
      case "giant_roach": {
        const torso = pivot("torso", 0, 0.16, 0, body);
        mesh(box(0.34, 0.14, 0.62), mat(0x5a3218), 0, 0, 0, torso);
        const head = pivot("head", 0, 0.02, -0.36, torso);
        mesh(box(0.2, 0.12, 0.16), mat(0x3a2210), 0, 0, 0, head);
        const la = pivot("leftArm", -0.06, 0.05, -0.08, head),
          ra = pivot("rightArm", 0.06, 0.05, -0.08, head);
        mesh(box(0.02, 0.02, 0.45), mat(0x2a1a0a), -0.05, 0, -0.2, la);
        mesh(box(0.02, 0.02, 0.45), mat(0x2a1a0a), 0.05, 0, -0.2, ra);
        const ll = pivot("leftLeg", -0.2, -0.04, 0, torso),
          rl = pivot("rightLeg", 0.2, -0.04, 0, torso);
        for (const [p, s] of [
          [ll, -1],
          [rl, 1],
        ])
          for (let i = -1; i <= 1; i++) {
            const m = mesh(
              box(0.28, 0.03, 0.03),
              mat(0x3a2210),
              s * 0.12,
              -0.05,
              i * 0.18,
              p,
            );
            m.rotation.z = s * -0.5;
          }
        Object.assign(ch.parts, {
          head,
          torso,
          leftArm: la,
          rightArm: ra,
          leftLeg: ll,
          rightLeg: rl,
        });
        ch.kind = "bug";
        break;
      }
      case "burrow_rat":
        buildQuadruped(ch, 0x9a7a6a, 1.0, 0.5, 0.42);
        mesh(
          box(0.08, 0.14, 0.04),
          mat(0xe8e0c0),
          0,
          -0.1,
          -0.52,
          ch.parts.head,
        );
        break;
      case "dog":
        buildQuadruped(ch, 0x6a5038, 1.0, 0.8, 0.3);
        break;
      case "gasfly": {
        const torso = pivot("torso", 0, 0, 0, body);
        mesh(sph(0.26), mat(0x8a8a5a), 0, 0, 0, torso);
        const head = pivot("head", 0, 0.02, -0.28, torso);
        mesh(sph(0.12), mat(0x5a2a1a), 0, 0, 0, head);
        const la = pivot("leftArm", -0.15, 0.18, 0, torso),
          ra = pivot("rightArm", 0.15, 0.18, 0, torso);
        const wm = mat(0xcce0cc, { transparent: true, opacity: 0.45 });
        mesh(box(0.5, 0.01, 0.22), wm, -0.25, 0, 0, la);
        mesh(box(0.5, 0.01, 0.22), wm, 0.25, 0, 0, ra);
        const ll = pivot("leftLeg", 0, -0.2, -0.05, torso);
        mesh(box(0.14, 0.14, 0.14), mat(0x3a2a1a), 0, 0, 0, ll);
        const rl = pivot("rightLeg", 0, 0.02, 0.3, torso);
        mesh(sph(0.2), mat(0xa0a070), 0, 0, 0.1, rl);
        Object.assign(ch.parts, {
          head,
          torso,
          leftArm: la,
          rightArm: ra,
          leftLeg: ll,
          rightLeg: rl,
        });
        ch.kind = "fly";
        break;
      }
      case "sky_eye": {
        const torso = pivot("torso", 0, 0, 0, body);
        mesh(
          sph(0.3, 14, 10),
          mat(0x7a7e84, { metalness: 0.7, roughness: 0.4 }),
          0,
          0,
          0,
          torso,
        );
        mesh(
          cyl(0.12, 0.12, 0.05, 12),
          mat(0xff3322, { emissive: 0xff2211, emissiveIntensity: 1.5 }),
          0,
          0,
          -0.29,
          torso,
        ).rotation.x = Math.PI / 2;
        const head = pivot("head", 0, 0.28, 0.05, torso);
        mesh(cyl(0.01, 0.01, 0.5), mat(0x333333), 0, 0.25, 0, head);
        mesh(sph(0.03), mat(0xff4422, { emissive: 0xff2200 }), 0, 0.5, 0, head);
        const la = pivot("leftArm", -0.3, 0, 0.05, torso),
          ra = pivot("rightArm", 0.3, 0, 0.05, torso);
        mesh(box(0.12, 0.02, 0.2), mat(0x55585c), -0.05, 0, 0, la);
        mesh(box(0.12, 0.02, 0.2), mat(0x55585c), 0.05, 0, 0, ra);
        const ll = pivot("leftLeg", 0, -0.3, 0.05, torso);
        mesh(cyl(0.08, 0.04, 0.12), mat(0x444444), 0, 0, 0, ll);
        const rl = pivot("rightLeg", 0, 0, 0.3, torso);
        mesh(box(0.2, 0.16, 0.05), mat(0x333333), 0, 0, 0, rl);
        Object.assign(ch.parts, {
          head,
          torso,
          leftArm: la,
          rightArm: ra,
          leftLeg: ll,
          rightLeg: rl,
        });
        ch.kind = "float";
        break;
      }
      case "valet":
      case "valet_m": {
        const torso = pivot("torso", 0, 0.2, 0, body);
        mesh(
          sph(0.42, 14, 10),
          mat(0x5a6a50, { metalness: 0.6, roughness: 0.45 }),
          0,
          0,
          0,
          torso,
        );
        const head = pivot("head", 0, 0.38, 0, torso);
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2;
          const st = mesh(
            cyl(0.02, 0.02, 0.35),
            mat(0x333333),
            Math.sin(a) * 0.12,
            0.15,
            Math.cos(a) * 0.12 - 0.05,
            head,
          );
          st.rotation.x = -0.3;
          mesh(
            sph(0.07),
            mat(0xeeeecc, { emissive: 0x333322 }),
            Math.sin(a) * 0.14,
            0.33,
            Math.cos(a) * 0.14 - 0.12,
            head,
          );
        }
        const la = pivot("leftArm", -0.4, -0.05, -0.1, torso),
          ra = pivot("rightArm", 0.4, -0.05, -0.1, torso),
          rl = pivot("rightLeg", 0, -0.1, 0.4, torso);
        for (const a of [la, ra]) {
          mesh(
            cyl(0.035, 0.035, 0.5),
            mat(0x444444),
            0,
            -0.2,
            -0.1,
            a,
          ).rotation.x = 0.6;
        }
        mesh(
          cyl(0.12, 0.12, 0.02, 14),
          mat(0xaaaaaa, { metalness: 0.8 }),
          0,
          -0.45,
          -0.3,
          la,
        ).rotation.x = Math.PI / 2;
        mesh(cyl(0.035, 0.035, 0.45), mat(0x444444), 0, 0, 0.1, rl).rotation.x =
          -0.8;
        const ll = pivot("leftLeg", 0, -0.45, 0, torso);
        mesh(cone(0.2, 0.35), mat(0x333333), 0, 0, 0, ll).rotation.x = Math.PI;
        Object.assign(ch.parts, {
          head,
          torso,
          leftArm: la,
          rightArm: ra,
          leftLeg: ll,
          rightLeg: rl,
        });
        ch.kind = "float";
        break;
      }
      case "shellback":
      case "shellback_matriarch": {
        const q = type === "shellback_matriarch" ? 3.2 : 1;
        const torso = pivot("torso", 0, 0.7 * q, 0, body);
        mesh(
          sph(0.7 * q, 12, 8),
          mat(0x6a5a3a, { roughness: 0.6 }),
          0,
          0,
          0.1 * q,
          torso,
        ).scale.set(1.1, 0.6, 1.2);
        const head = pivot("head", 0, -0.05 * q, -0.75 * q, torso);
        mesh(box(0.35 * q, 0.3 * q, 0.2 * q), mat(0xb0906a), 0, 0, 0, head);
        const la = pivot("leftArm", -0.6 * q, -0.1 * q, -0.5 * q, torso),
          ra = pivot("rightArm", 0.6 * q, -0.1 * q, -0.5 * q, torso);
        for (const a of [la, ra]) {
          mesh(
            box(0.2 * q, 0.2 * q, 0.6 * q),
            mat(0x7a6040),
            0,
            0,
            -0.3 * q,
            a,
          );
          mesh(
            box(0.28 * q, 0.14 * q, 0.35 * q),
            mat(0x8a3a2a),
            0,
            0,
            -0.7 * q,
            a,
          );
        }
        const ll = pivot("leftLeg", -0.5 * q, -0.3 * q, 0.2 * q, torso),
          rl = pivot("rightLeg", 0.5 * q, -0.3 * q, 0.2 * q, torso);
        for (const l of [ll, rl]) {
          mesh(
            box(0.12 * q, 0.5 * q, 0.12 * q),
            mat(0x5a4a30),
            0,
            -0.2 * q,
            0,
            l,
          );
        }
        Object.assign(ch.parts, {
          head,
          torso,
          leftArm: la,
          rightArm: ra,
          leftLeg: ll,
          rightLeg: rl,
        });
        ch.kind = "crab";
        break;
      }
      case "patrolman":
      case "bulwark": {
        buildHumanoid(
          ch,
          {
            skin: 0x7a7e70,
            top: 0x6a7a66,
            legs: 0x5a6258,
            head: 0x9aa090,
            accent: 0x333333,
            eyes: 0x66ccff,
          },
          type === "bulwark" ? 2.3 : 2.0,
          1.2,
        );
        mesh(
          sph(0.16),
          mat(0x88bbcc, { transparent: true, opacity: 0.6 }),
          0,
          0.22,
          0,
          ch.parts.head,
        );
        break;
      }
      case "ripjaw": {
        buildHumanoid(ch, SCHEMES.ripjaw, 1.6, 1.5);
        const hm = mat(0xd8d0b0);
        mesh(
          cone(0.05, 0.35),
          hm,
          -0.12,
          0.45,
          0.02,
          ch.parts.head,
        ).rotation.z = 0.4;
        mesh(cone(0.05, 0.35), hm, 0.12, 0.45, 0.02, ch.parts.head).rotation.z =
          -0.4;
        for (const a of [ch.parts.leftArm, ch.parts.rightArm])
          for (let i = -1; i <= 1; i++) {
            const c = mesh(cone(0.03, 0.4), hm, i * 0.05, -1.05, -0.12, a);
            c.rotation.x = Math.PI + 0.4;
          }
        ch.body.rotation.x = -0.25; // hunched
        break;
      }
      default: {
        let scheme = SCHEMES[outfit] || SCHEMES[type] || SCHEMES.drifter;
        let h = td.height || 1.78,
          bulk = scheme.bulk || 1;
        if (type === "raider") scheme = SCHEMES[outfit] || SCHEMES.raider;
        if (type === "continuity_soldier") scheme = SCHEMES.continuity_exo_rig;
        if (type === "covenant_warden") scheme = SCHEMES.covenant_exo_rig;
        if (type === "brute") {
          scheme = SCHEMES.brute;
          bulk = 1.6;
        }
        if (type === "colossus") {
          scheme = SCHEMES.brute;
          bulk = 1.9;
        }
        buildHumanoid(ch, scheme, h, bulk);
      }
    }
    ch.height = td.height || ch.height;
    return ch;
  }

  // ------------------------------------------------------------------
  // Animation (procedural): walk/run cycles, attack swings, death fall
  // ------------------------------------------------------------------
