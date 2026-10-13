// play-inline-468 03 — three
// Lines 375-518 of readable/play-inline-468.pretty.js (statement-aligned).
  function applyVariety(ch) {
    const meta = ch.tpl.meta || {},
      info = ch.info;
    const r = L.rng(((ch.seed * 2654435761) ^ 0x5bd1e995) >>> 0);
    const U = ch.material.userData.uniforms,
      T = U.uTints.value;
    const amt =
      meta.tintAmt !== undefined
        ? meta.tintAmt
        : info.isRobot
          ? 0.45
          : info.isCreature
            ? 0.6
            : 1;
    const jit = (k) => 1 + (r() - 0.5) * k * amt;
    const br = jit(0.34);
    T[1].setRGB(br * jit(0.14), br * jit(0.1), br * jit(0.14)); // cloth
    const sb = jit(0.22),
      warm = (r() - 0.5) * 0.08 * amt;
    T[2].setRGB(sb * (1 + warm), sb, sb * (1 - warm * 1.4)); // skin
    const h = HAIR_SHIFT[Math.floor(r() * HAIR_SHIFT.length)];
    T[3].setRGB(lerp(1, h[0], amt), lerp(1, h[1], amt), lerp(1, h[2], amt)); // hair / fur
    // exact caller colours restored on top of the quantised template (see quantiseOpts)
    const rt = ch._ratios;
    if (rt && rt.skin) {
      T[2].setRGB(rt.skin[0], rt.skin[1], rt.skin[2]);
    }
    if (rt && rt.hair) {
      T[3].setRGB(rt.hair[0], rt.hair[1], rt.hair[2]);
    }
    const lb = jit(0.36);
    T[4].setRGB(lb * jit(0.06), lb, lb * jit(0.08)); // leather
    const mb = jit(0.14);
    T[5].setRGB(mb, mb * jit(0.03), mb * jit(0.05)); // paint / metal
    const d = meta.dirt || info.dirt || [0.15, 0.45];
    U.uDirt.value = lerp(d[0], d[1], r());
    const bc = BLOOD_COLORS[ch.gore] || BLOOD_COLORS.red;
    U.uBloodColor.value.setRGB(bc[0], bc[1], bc[2]);
    U.uBlood.value = meta.blood ? lerp(meta.blood[0], meta.blood[1], r()) : 0;
  }

  // ------------------------------------------------------------------
  // Hold-type inference for weapons held by NPCs
  // ------------------------------------------------------------------
  function inferHold(obj, hint) {
    const norm = (h) => {
      if (!h) return null;
      h = String(h).toLowerCase();
      if (/unarmed|fist|knuckle/.test(h)) return "unarmed";
      if (
        /2h|sledge|bat|cue|two|axe|board/.test(h) &&
        /melee|sledge|bat|cue|2h|axe|board/.test(h)
      )
        return "melee2h";
      if (/melee|knife|pipe|machete|sword|club|1h|blade|wrench|cleaver/.test(h))
        return "melee1h";
      if (/minigun|gatling|heavy|flamer|big/.test(h)) return "heavy";
      if (/pistol|revolver|magnum|handgun|blaster/.test(h)) return "pistol";
      if (/rifle|shotgun|smg|launcher|fat ?man|carbine|sniper|gun/.test(h))
        return "rifle";
      return null;
    };
    let h =
      norm(hint) ||
      (obj &&
        obj.userData &&
        (norm(obj.userData.hold) ||
          norm(obj.userData.holdType) ||
          norm(obj.userData.kind) ||
          norm(obj.userData.viewmodel)));
    if (
      !h &&
      obj &&
      obj.userData &&
      obj.userData.weaponId &&
      !G.isStub("weapons") &&
      G.weapons.getDef
    ) {
      try {
        const d = G.weapons.getDef(obj.userData.weaponId);
        const w = d && (d.weapon || d);
        if (w) {
          if (w.skill === "melee_weapons")
            h = /sledge|bat|cue|super/.test(
              String(d.name || obj.userData.weaponId).toLowerCase(),
            )
              ? "melee2h"
              : "melee1h";
          else if (w.skill === "unarmed") h = "unarmed";
          else h = norm(w.viewmodel) || norm(d.name) || null;
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (!h && obj) h = norm(obj.name);
    if (!h && obj) {
      const box = new THREE.Box3().setFromObject(obj);
      const sz = box.getSize(new THREE.Vector3());
      const len = Math.max(sz.x, sz.z);
      h = len < 0.38 ? "pistol" : sz.x > 0.3 && sz.y > 0.3 ? "heavy" : "rifle";
    }
    return h || "rifle";
  }
  const RANGED = { pistol: 1, rifle: 1, heavy: 1 };

  // ------------------------------------------------------------------
  // Scratch objects
  // ------------------------------------------------------------------
  const _v1 = new THREE.Vector3(),
    _v2 = new THREE.Vector3(),
    _v3 = new THREE.Vector3(),
    _v4 = new THREE.Vector3();
  const _fwd = new THREE.Vector3(),
    _up = new THREE.Vector3(),
    _right = new THREE.Vector3();
  const _q1 = new THREE.Quaternion(),
    _q2 = new THREE.Quaternion(),
    _q3 = new THREE.Quaternion();
  const _m1 = new THREE.Matrix4(),
    _s1 = new THREE.Vector3();
  const _fH = new THREE.Vector3(),
    _fF = new THREE.Vector3();
  const _dPr = new THREE.Vector3(),
    _dPt = new THREE.Vector3(),
    _dD = new THREE.Vector3(),
    _dN = new THREE.Vector3(),
    _dV = new THREE.Vector3(),
    _sq3 = new THREE.Quaternion();
  const _grip = new THREE.Vector3(),
    _sup = new THREE.Vector3(),
    _pole = new THREE.Vector3(),
    _wrist = new THREE.Vector3();
  const _sq1 = new THREE.Quaternion(),
    _sq2 = new THREE.Quaternion(),
    _yAxis = new THREE.Vector3(0, 1, 0),
    _sv = new THREE.Vector3(),
    _sn = new THREE.Vector3();
  const LIVE = (L.live = new Set());
  let charCount = 0;

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------
