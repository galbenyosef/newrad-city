/* src/characters/50_character.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: Character runtime + G.chars API
 * Owned by: characters.
 *
 * Character = one SkinnedMesh (1 draw call) driven by a THREE.Bone rig.
 *   create(type, opts) → Character (added to G.scene unless opts.addToScene===false)
 *   char.root           Object3D positioned/rotated by the actor (yaw)
 *   char.parts          {head, torso, leftArm, rightArm, leftLeg, rightLeg}
 *                       Object3D markers at each part's centre (targeting);
 *                       marker.userData = {part, radius}
 *   setAnim(name,{loop,speed,inPlace,dir,force,part})   base animation
 *   playOneShot(name, opts)                             layered action
 *   update(dt)  setWeapon(obj|null, hold?)  lookAt(v|null)  setAim(bool)
 *   setFlashing(on, color)  flash(color, dur)  highlightPart(part|null, color)
 *   dismember(part, {dir, explode}) → gib Object3Ds
 *   disintegrate('ash'|'goo', dur)   raycast(origin, dir, max) → {part, dist, point}
 *   getPartWorldPos(part, out)  getMuzzle() → {pos, dir}  dropWeapon()  dispose()
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.chars || !G.chars._lib) return;
  const C = G.chars,
    L = C._lib,
    A = L.anim;
  const clamp = L.clamp,
    lerp = L.lerp,
    smooth = L.smooth;
  const PI = Math.PI;

  const GORE = {
    red: 0x5e0a06,
    green: 0x4a6a12,
    oil: 0x141412,
    blue: 0x2a4a6a,
    violet: 0x3e1640,
  };
  L.GORE = GORE;

  // ------------------------------------------------------------------
  // Type table (humans here; creatures/robots registered by 30_/40_)
  // ------------------------------------------------------------------
  const HUMAN_OUTFITS = [
    "cryo_suit",
    "raider",
    "raider_heavy",
    "settler",
    "drifter",
    "merchant",
    "doctor",
    "covenant_exo_rig",
    "continuity_exo_rig",
    "continuity_uniform",
    "combat_armor",
    "leather_armor",
    "survivor_layers",
    "glowkeeper_robes",
    "lab_coat",
    "director_suit",
    "dj",
  ];
  L.HUMAN_OUTFITS = HUMAN_OUTFITS;
  const BIPED_STYLE = {
    hunch: 0,
    armOut: 0.07,
    armFwd: 0.0,
    elbow: 0.14,
    stride: 1,
    armSwing: 1,
    stance: 0.02,
    shrug: 0,
  };
  L.infos.human = {
    kind: "biped",
    height: 1.8,
    radius: 0.35,
    gore: "red",
    isRobot: false,
    isCreature: false,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
    },
    gait: { walkStep: 0.72, runStep: 1.25, walkSpeed: 1.6, runSpeed: 4.6 },
    style: BIPED_STYLE,
    variants: 16,
    build: (opts, seed) => L.human.build(opts, seed),
  };

  /** Resolve public type names / aliases into {base, opts}. */
  function resolveId(type, opts) {
    opts = Object.assign({}, opts || {});
    let t = String(type || "human");
    if (L.CAST && L.CAST[t] && L.castOpts)
      return { base: "human", opts: L.castOpts(t, opts) }; // story cast presets (24_cast.js)
    if (HUMAN_OUTFITS.indexOf(t) >= 0) {
      opts.outfit = opts.outfit || t;
      return { base: "human", opts };
    }
    switch (t) {
      case "human":
      case "npc":
        return { base: "human", opts };
      case "raider": {
        const r = L.rng((opts.seed || 1) * 7 + 3);
        opts.outfit =
          opts.outfit ||
          (opts.variant === "heavy" ||
          (opts.variant === undefined && r.chance(0.25))
            ? "raider_heavy"
            : "raider");
        if (typeof opts.variant === "string") delete opts.variant;
        return { base: "human", opts };
      }
      case "continuity_soldier":
      case "continuity":
        opts.outfit = "continuity_exo_rig";
        return { base: "human", opts };
      case "continuity_officer":
        opts.outfit = "continuity_uniform";
        return { base: "human", opts };
      case "covenant_warden":
      case "covenant":
        opts.outfit = "covenant_exo_rig";
        if (opts.variant === undefined) opts.variant = "mk2";
        return { base: "human", opts };
      case "covenant_lancer":
        opts.outfit = "covenant_exo_rig";
        return { base: "human", opts };
      case "covenant_archivist":
      case "covenant_acolyte":
        opts.outfit = opts.outfit || "lab_coat";
        return { base: "human", opts };
      case "director":
        opts.outfit = "director_suit";
        return { base: "human", opts };
      case "glowkeeper":
        opts.outfit = "glowkeeper_robes";
        return { base: "human", opts };
      case "brute_hound":
        opts.variant = opts.variant || "wild";
        return { base: "dog", opts };
      case "biscuit":
        opts.variant = opts.variant || "biscuit";
        return { base: "dog", opts };
      case "roach":
        return { base: "giant_roach", opts };
      case "rat":
        return { base: "burrow_rat", opts };
      case "ant":
      case "giantant":
        return { base: "giant_ant", opts };
      case "fireant":
        return { base: "fire_ant", opts };
      case "bear":
        return { base: "ash_bear", opts };
      case "ox":
      case "oxen":
        opts.pack = opts.pack !== false;
        return { base: "pack_ox", opts };
      case "cow":
        return { base: "pack_ox", opts };
      case "coyote_dark":
        opts.variant = "dark";
        return { base: "coyote", opts };
      case "deer":
        return { base: "stag", opts };
      case "crawlers":
        return { base: "crawler", opts };
    }
    if (L.infos[t]) return { base: t, opts };
    return null; // unknown type: callers (combat) fall back to their own placeholder
  }
  function resolveType(type, opts) {
    return resolveId(type, opts);
  }
  /** Closest known type for an unknown name (used by create's fallback). */
  function fallbackType(type) {
    const t = String(type || "").toLowerCase();
    const rules = [
      [/coyote|jackal/, "coyote"],
      [/stag|deer|elk|moose/, "stag"],
      [/\bcrawler|tunnel/, "crawler"],
      [/sandhog|miner/, "sandhog"],
      [/bruiser/, "maniac_bruiser"],
      [/maniac|madman|lunatic/, "maniac"],
      [/colossus|giant_brute/, "colossus"],
      [/brute|overlord/, "brute"],
      [/ripjaw|lizard|croc/, "ripjaw"],
      [/matriarch/, "shellback_matriarch"],
      [/shell|crab|lobster/, "shellback"],
      [/sting|scorp/, "stinger"],
      [/fire.?ant/, "fire_ant"],
      [/\bant\b|ant_|_ant/, "giant_ant"],
      [/bear/, "ash_bear"],
      [/lurch/, "lurcher"],
      [/roach|bug|insect/, "giant_roach"],
      [/rat/, "burrow_rat"],
      [/fly|mosquito|wasp|gas/, "gasfly"],
      [/dog|hound|wolf/, "dog"],
      [/\box|cow|cattle|bull/, "pack_ox"],
      [/eye|drone/, "sky_eye"],
      [/valet_m|military_valet/, "valet_m"],
      [/valet|butler|nurse/, "valet"],
      [/striker/, "striker"],
      [/thinker|brain/, "thinker"],
      [/bulwark|turret|tank/, "bulwark"],
      [/robo|bot|patrol|android|machine/, "patrolman"],
      [/continuity|federal|soldier/, "continuity_soldier"],
      [/covenant|warden|lancer|knight/, "covenant_lancer"],
      [/raider|gang|bandit|slaver|merc/, "raider"],
      [/doctor|medic/, "doctor"],
      [/scien/, "lab_coat"],
      [/cryo|sleeper/, "cryo_suit"],
      [/trader|merchant|vendor/, "merchant"],
    ];
    for (const [re, v] of rules) if (re.test(t)) return v;
    return "settler";
  }
  const warnedTypes = new Set();
  function warnUnknown(type, where) {
    const k = String(type);
    if (warnedTypes.has(k)) return;
    warnedTypes.add(k);
    console.warn(
      '[characters] unknown character type "' +
        k +
        '" (' +
        where +
        ") — known: " +
        PUBLIC_TYPES.concat(HUMAN_OUTFITS).join(", "),
    );
  }

  /**
   * Template cache key. Tint-like options are QUANTISED so arbitrary per-NPC
   * colours/scales can't create unbounded templates: skin tones & hair colours
   * snap to the nearest palette entry (the exact colour is restored per
   * instance through the material-class tint uniforms, see applyVariety),
   * other colours snap to 3 bits per channel and scale to 0.05 steps.
   */
  const _qc1 = new THREE.Color(),
    _qc2 = new THREE.Color();
  function nearestPalette(hex, list) {
    _qc1.setHex(hex);
    let best = list[0],
      bd = 1e9;
    for (const c of list) {
      _qc2.setHex(c);
      const d =
        (_qc1.r - _qc2.r) ** 2 +
        (_qc1.g - _qc2.g) ** 2 +
        (_qc1.b - _qc2.b) ** 2;
      if (d < bd) {
        bd = d;
        best = c;
      }
    }
    return best;
  }
  function ratioOf(want, got) {
    _qc1.setHex(want);
    _qc2.setHex(got);
    const f = (a, b) => clamp((a + 0.02) / (b + 0.02), 0.4, 2.5);
    return [f(_qc1.r, _qc2.r), f(_qc1.g, _qc2.g), f(_qc1.b, _qc2.b)];
  }
  const q3 = (hex) => {
    const r = (hex >> 16) & 255,
      g = (hex >> 8) & 255,
      b = hex & 255;
    const q = (v) => Math.min(255, (v >> 5) * 32 + 16);
    return (q(r) << 16) | (q(g) << 8) | q(b);
  };
  function quantiseOpts(opts) {
    const o = Object.assign({}, opts);
    if (typeof o.skinTone === "number") {
      const n = nearestPalette(o.skinTone, Object.values(L.SKIN));
      o._skinRatio = ratioOf(o.skinTone, n);
      o.skinTone = n;
    }
    if (typeof o.hairColor === "number") {
      const n = nearestPalette(o.hairColor, L.HAIR);
      o._hairRatio = ratioOf(o.hairColor, n);
      o.hairColor = n;
    }
    if (typeof o.hatColor === "number") o.hatColor = q3(o.hatColor);
    if (typeof o.color === "number") o.color = q3(o.color);
    if (typeof o.scale === "number")
      o.scale = Math.round(clamp(o.scale, 0.3, 4) * 20) / 20;
    return o;
  }
  function templateFor(base, opts) {
    const info = L.infos[base];
    let seed =
      opts.seed === undefined
        ? Math.floor(Math.random() * 1e9)
        : typeof opts.seed === "string"
          ? L.hashStr(opts.seed)
          : Math.floor(Math.abs(Number(opts.seed) || 0)) >>> 0;
    const nv = info.variants || 4;
    const vseed = (seed % nv) + 1;
    const qo = quantiseOpts(opts);
    const keyOpts = {};
    if (typeof qo.age === "number")
      qo.age = Math.round(clamp(qo.age, 0, 1) * 4) / 4; // 5 age bands
    if (typeof qo.outfitColor === "number") qo.outfitColor = q3(qo.outfitColor);
    for (const k of [
      "outfit",
      "gender",
      "skinTone",
      "hair",
      "hairColor",
      "beard",
      "burn",
      "scars",
      "variant",
      "hat",
      "hatColor",
      "glasses",
      "scale",
      "security",
      "utility",
      "sleeve",
      "color",
      "pack",
      "age",
      "outfitColor",
      "acc",
      "preset",
    ])
      if (qo[k] !== undefined && qo[k] !== null) keyOpts[k] = qo[k];
    const key = base + "|" + vseed + "|" + JSON.stringify(keyOpts);
    const tpl = L.getTemplate(key, () => {
      const t0 = performance.now();
      const t = info.build(qo, vseed * 7919 + L.hashStr(base));
      t.buildMs = performance.now() - t0;
      return t;
    });
    return {
      tpl,
      info,
      seed,
      ratios: { skin: qo._skinRatio || null, hair: qo._hairRatio || null },
    };
  }

  // ------------------------------------------------------------------
  // Per-instance variety: templates are shared (≤16 per outfit), so every
  // character gets its own tint per material class + grime from the FULL
  // seed. Near-unlimited variety at zero geometry cost.
  // ------------------------------------------------------------------
  const HAIR_SHIFT = [
    [1, 1, 1],
    [1, 1, 1],
    [0.55, 0.52, 0.5],
    [1.35, 1.12, 0.85],
    [1.25, 0.78, 0.6],
    [1.6, 1.55, 1.5],
    [0.78, 0.72, 0.68],
    [1.15, 1.05, 0.9],
  ];
  const BLOOD_COLORS = {
    red: [0.2, 0.012, 0.008],
    green: [0.07, 0.15, 0.015],
    oil: [0.018, 0.018, 0.016],
    blue: [0.03, 0.06, 0.12],
  };
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
  class Character {
    constructor(type, base, tpl, info, opts, seed) {
      this.id = ++charCount;
      this.type = type;
      this.baseType = base;
      this.tpl = tpl;
      this.info = info;
      this.opts = opts;
      this.seed = seed;
      this.kind = tpl.kind || info.kind;
      const meta = tpl.meta || {};
      this.scale = meta.s || opts.scale || 1;
      this.height = meta.height || info.height;
      this.radius = meta.radius || info.radius * (meta.power ? 1.3 : 1);
      this.hipH = meta.hipH || this.height * 0.53;
      this.legLen = meta.legLen || this.hipH * 0.95;
      this.bodyThick = meta.bodyThick || 0.13 * this.scale * (meta.bulk || 1);
      this.bodyH = meta.bodyH || this.hipH;
      this.hover = meta.hover || 0;
      this.gore = meta.gore || info.gore || "red";
      this.style = Object.assign(
        {},
        BIPED_STYLE,
        info.style || {},
        meta.style || {},
      );
      this.gait = Object.assign(
        { walkStep: 0.72, runStep: 1.25, walkSpeed: 1.6, runSpeed: 4.6 },
        info.gait || {},
        meta.gait || {},
      );
      if (meta.power) {
        // exo-rig: heavy planted gait (see BI.gait 'power'), slower run
        this.style = Object.assign({}, this.style, {
          heavy: true,
          power: true,
          armOut: 0.22,
          stance: 0.06,
          armSwing: 0.42,
        });
        this.gait = Object.assign({}, this.gait, {
          walkStep: 0.8,
          runStep: 1.15,
          walkSpeed: 1.45,
          runSpeed: 4.0,
        });
      }
      if (meta.noFootIK) this.noFootIK = true;
      // Crowd far tier: explicit opts.crowd, else AUTO for actor-driven characters
      // (G.actors / combat pass their def with a `level`) — nobody else opted in, so
      // every standing NPC / idle enemy far away still cost a skinned draw call each.
      // Never the player's own body (opts.player / opts.noCrowd) or portraits.
      this.crowd =
        opts.crowd !== undefined
          ? !!opts.crowd
          : opts.level !== undefined &&
            !opts.player &&
            !opts.noCrowd &&
            !opts.essentialRig;
      this.seedPhase = (seed % 1000) * 0.0137;
      // --- scene graph ---
      this.root = new THREE.Group();
      this.root.name = "char:" + type;
      this.root.userData.character = this;
      this.rig = new THREE.Group();
      this.root.add(this.rig);
      this.bones = tpl.bones.map((b) => {
        const bone = new THREE.Bone();
        bone.name = b.name;
        bone.position.set(b.pos[0], b.pos[1], b.pos[2]);
        return bone;
      });
      tpl.bones.forEach((b, i) => {
        if (b.parent >= 0) this.bones[b.parent].add(this.bones[i]);
        else this.rig.add(this.bones[i]);
      });
      this.B = tpl.map;
      this.rest = this.bones.map((b) => b.position.clone());
      this.root.updateMatrixWorld(true);
      this.skeleton = new THREE.Skeleton(this.bones);
      this.material = L.makeMaterial();
      this.mesh = new THREE.SkinnedMesh(tpl.geometry, this.material);
      this.mesh.name = "charMesh";
      this.rig.add(this.mesh);
      this.mesh.bind(this.skeleton);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.boundingSphere = new THREE.Sphere(
        new THREE.Vector3(0, this.height * 0.5, 0),
        Math.max(this.height, this.radius * 3) * 0.75 + 3.5,
      );
      this.mesh.userData.character = this;
      // --- body part markers ---
      this.parts = {};
      for (const p of L.PART_NAMES) {
        const m = tpl.markers[p];
        const o = new THREE.Object3D();
        o.name = "part:" + p;
        o.userData = { part: p, radius: m ? m.r : 0.25, character: this };
        if (m) {
          o.position.set(m.pos[0], m.pos[1], m.pos[2]);
          this.bones[m.bone].add(o);
          o.userData.bone = m.bone;
        }
        this.parts[p] = o;
      }
      for (const p of L.PART_NAMES)
        if (!tpl.markers[p]) {
          // alias missing parts to torso marker
          const t = tpl.markers.torso ? this.parts.torso : null;
          if (t) {
            this.parts[p] = t;
          } else {
            this.rig.add(this.parts[p]);
            this.parts[p].position.set(0, this.height * 0.5, 0);
          }
        }
      // --- sockets ---
      this.sockets = {};
      for (const k in tpl.sockets) {
        const s = tpl.sockets[k];
        const o = new THREE.Object3D();
        o.name = "socket:" + k;
        o.position.set(s.pos[0], s.pos[1], s.pos[2]);
        o.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
        this.bones[s.bone].add(o);
        this.sockets[k] = o;
      }
      // --- animation state ---
      const n = this.bones.length;
      this.poseA = new A.Pose(n);
      this.poseB = new A.Pose(n);
      this.poseC = new A.Pose(n);
      this.poseT = new A.Pose(n);
      this.poseF = new A.Pose(n);
      this.poseG = new A.Pose(n);
      this.W = new A.Writer(this);
      this.lib = A.LIBS[this.kind] || A.LIBS.biped;
      this.anim = { name: "idle", t: 0, speed: 1, loop: true, opts: {} };
      this.prev = null;
      this.fade = 1;
      this.fadeDur = 0.22;
      this.one = null;
      this.oneFade = 0;
      this.animT = this.seedPhase * 10;
      this.phase = this.seedPhase * 3;
      this.speedM = 0;
      this.velLocal = { x: 0, z: 0 };
      this._lastPos = new THREE.Vector3(NaN, 0, 0);
      this.upperMask = this._makeMask(
        this.B.spine !== undefined ? "spine" : null,
      );
      this.lookTarget = null;
      this.lookYaw = 0;
      this.lookPitch = 0;
      this.aimFlag = false;
      this.ikW = 0;
      this.recoil = 0;
      this.lastFire = -99;
      this.weapon = null;
      this.holdType = null;
      this.dead = false;
      this.death = null;
      this._softDead = false; // lying down via setAnim('dead') (dormant Maniac / knocked out): gets up on the next anim
      this._getup = null; // {dur, next, nextOpts} while standing back up
      this._pendingOne = null; // one-shot queued while getting up
      this.dismembered = {};
      this._stumps = [];
      this.hitLocal = null;
      this.hitPart = null;
      this.attackAlt = false;
      this._flash = 0;
      this._flashColor = new THREE.Color(1, 0.2, 0.1);
      this._flashing = false;
      this._flashingColor = new THREE.Color(0.2, 1, 0.3);
      this._dissolve = null;
      this._extFrame = -99;
      this._lastTick = 0;
      this._acc = 0;
      this.autoUpdate = true;
      this.disposed = false;
      this.hidden = false;
      this.hitScale = meta.hitScale || 1;
      this.rigYaw = 0;
      this.rigYawTarget = 0;
      // cut map for dismemberment
      this.cut = Object.assign(
        {
          head: "head",
          leftArm: "armL",
          rightArm: "armR",
          leftLeg: "thighL",
          rightLeg: "thighR",
        },
        meta.cut || {},
      );
      // geometric LOD (same skeleton → free geometry swap)
      this._lod = 0;
      this.lodDist = clamp(this.height * 19, 9, 90);
      this._gen = L.resetGen || 0;
      tpl.users = (tpl.users || 0) + 1;
      this._ratios = opts._ratios || null;
      applyVariety(this);
      this._headK = 1;
      if (meta.face && !meta.power) {
        // per-INDIVIDUAL face on top of the per-template face map (moles,
        // freckle density, blotchy redness, Maniac scabs) + head size
        const fr = L.rng(((seed * 40503) ^ 0x2c1b3c6d) >>> 0),
          F = meta.face;
        const light =
          F.skin !== undefined
            ? (() => {
                const c = L.col(F.skin);
                return c.r * 0.3 + c.g * 0.6 + c.b * 0.1;
              })()
            : 0.4;
        const frk =
          !F.maniac && !F.mutant
            ? fr() < (light > 0.45 ? 0.35 : 0.12)
              ? fr.range(0.35, 1)
              : fr() * 0.15
            : 0;
        this.material.userData.uniforms.uFaceVar.value.set(
          frk,
          fr.range(0.1, 0.9) * (F.mutant ? 0.3 : 1),
          F.maniac ? fr.range(0.12, 0.3) : 0,
          1 + fr() * 97,
        );
        this._headK = F.mutant ? 1 : fr.range(0.965, 1.035);
      }
      // dialogue-grade face (humans, Maniacs, brutes): blinks, gaze, visemes, expressions
      this.face =
        tpl.meta && tpl.meta.faceRig && L.FaceCtl ? new L.FaceCtl(this) : null;
      this._faceTexT = 0;
      LIVE.add(this);
      this._evaluate(0);
    }

    /**
     * Corpse settle: sample the ground under the lying body's parts, fit a
     * plane (root-local, ridge-regularised: a body is nearly a line, so the
     * slope across it stays near flat unless the samples say otherwise) and
     * return the rig tilt + height that lays the body on it. null on flat
     * ground or without a world.
     */
    _computeSettle() {
      const W = G.world;
      if (!W || typeof W.groundHeight !== "function" || !this.root.parent)
        return null;
      this.root.updateMatrixWorld(true);
      const p0 = this.root.position,
        yaw = this.root.rotation.y,
        c = Math.cos(yaw),
        sn = Math.sin(yaw);
      const seen = new Set();
      let n = 0,
        sx = 0,
        sz = 0,
        sy = 0,
        sxx = 0,
        szz = 0,
        sxz = 0,
        sxy = 0,
        szy = 0,
        maxd = 0;
      for (const pn of [
        "torso",
        "head",
        "leftLeg",
        "rightLeg",
        "leftArm",
        "rightArm",
      ]) {
        const o = this.parts[pn];
        if (!o || seen.has(o) || this.dismembered[pn] !== undefined) continue;
        seen.add(o);
        o.getWorldPosition(_sv);
        let gh;
        try {
          gh = W.groundHeight(_sv.x, _sv.z, Math.max(_sv.y, p0.y) + 0.9, 0.12);
        } catch (e) {
          gh = NaN;
        }
        if (!isFinite(gh)) continue;
        const dy = clamp(gh - p0.y, -1.2, 1.2);
        const wx = _sv.x - p0.x,
          wz = _sv.z - p0.z;
        const lx = wx * c - wz * sn,
          lz = wx * sn + wz * c; // world → root-local
        n++;
        sx += lx;
        sz += lz;
        sy += dy;
        sxx += lx * lx;
        szz += lz * lz;
        sxz += lx * lz;
        sxy += lx * dy;
        szy += lz * dy;
        maxd = Math.max(maxd, Math.abs(dy));
      }
      if (n < 2 || maxd < 0.035) return null;
      // least squares dy = a + b·x + c·z with ridge λ on the slopes
      const lam = 0.06 * n;
      const M = [
          [n, sx, sz],
          [sx, sxx + lam, sxz],
          [sz, sxz, szz + lam],
        ],
        Y = [sy, sxy, szy];
      const det3 = (m) =>
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
      const D = det3(M);
      if (Math.abs(D) < 1e-9) return null;
      const sol = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        const Mi = M.map((r, j) => r.map((v, k) => (k === i ? Y[j] : v)));
        sol[i] = det3(Mi) / D;
      }
      const a = clamp(sol[0], -0.8, 0.8),
        b = clamp(sol[1], -0.55, 0.55),
        cz = clamp(sol[2], -0.55, 0.55);
      _sn.set(-b, 1, -cz).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(_yAxis, _sn);
      return { q, dy: a, k: 0 };
    }

    // ---------------------------------------------------------------
    // Crowd FAR TIER: a standing crowd member far away (or beyond the live
    // budget) hides its skinned mesh and joins its scene's far BATCH — one
    // static merged mesh of frozen baked poses (one draw call for the whole
    // distant crowd, no skinning, no animation, no shadow). Any animation
    // request, movement or approach brings the real rig back the same frame.
    // ---------------------------------------------------------------
    _farEnter() {
      if (this._far || this.disposed || !this.root.parent) return false;
      // a rig whose mesh somebody else hid (ambient_life dresses a borrowed
      // actor with its own model) must never reappear as a far impostor
      if (!this.mesh.visible || this._exploded) return false;
      const pool = FAR.pool(this);
      if (!pool) return false;
      pool.members.push(this);
      this._far = pool;
      this.mesh.visible = false;
      FAR.dirty = true;
      return true;
    }
    _farExit() {
      const pool = this._far;
      if (!pool) return;
      this._far = null;
      const i = pool.members.indexOf(this);
      if (i >= 0) pool.members.splice(i, 1);
      pool.dirty = true;
      FAR.release(this);
      this._farAt = null;
      if (
        !this._exploded &&
        !(this._dissolve && this._dissolve.t >= this._dissolve.dur)
      )
        this.mesh.visible = true;
      this._acc = 1e3; // re-pose on the next tick
      FAR.dirty = true;
    }

    _makeMask(rootName) {
      const n = this.bones.length;
      if (!rootName) return null;
      const ri = this.B[rootName];
      const m = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        let b = i;
        while (b >= 0) {
          if (b === ri) {
            m[i] = 1;
            break;
          }
          b = this.tpl.bones[b].parent;
        }
      }
      return m;
    }

    // ---------------------------------------------------------------
    // Public animation API
    // ---------------------------------------------------------------
    _resolveName(name) {
      if (!name) return "idle";
      name = String(name);
      if (name === "attack")
        return RANGED[this.holdType] || this.style.ranged
          ? "attack_ranged"
          : "attack_melee";
      if (A.ALIAS[name]) return A.ALIAS[name];
      return name;
    }
    /** Set the base (looping / static) animation. */
    setAnim(name, opts) {
      if (this.disposed) return;
      opts = opts || {};
      const n = this._resolveName(name);
      // (callers re-send the same anim every frame: only a CHANGE wakes a frozen far-tier member)
      if (this._far && (n !== this.anim.name || this.dead)) this._farExit();
      if (n === "death" || n === "dead") return this._die(n, opts);
      // one-shot names passed to setAnim play as one-shots (except loopable 'talk')
      if (A.ONESHOT[n] && n !== "talk" && !opts.loop)
        return this.playOneShot(n, opts);
      if (!this.lib[n] && !A.LOCO[n]) return;
      if (this.dead) {
        // Real corpses (killed via 'death', or restored with {corpse:true}) stay down unless
        // explicitly revived. A body that was merely POSED dead (dormant Maniac, knocked-out
        // essential NPC) climbs back up with a get-up transition.
        if (this._softDead || opts.revive) {
          this._startGetup(n, opts);
          return;
        }
        return;
      }
      if (this._getup) {
        this._getup.next = n;
        this._getup.nextOpts = opts;
        return;
      } // finish standing first
      const cur = this.anim;
      if (cur.name === n) {
        cur.speed = opts.speed || 1;
        cur.opts = opts;
        return;
      }
      this.prev = {
        name: cur.name,
        t: cur.t,
        speed: cur.speed,
        opts: cur.opts,
      };
      this.fade = 0;
      this.fadeDur = opts.fade !== undefined ? opts.fade : 0.22;
      this.anim = {
        name: n,
        t: 0,
        speed: opts.speed || 1,
        loop: opts.loop !== false,
        opts,
      };
      if (n === "aim") this.aimFlag = true;
    }
    /** Layered one-shot action (attack, hit, reload, talk gesture, throw, roar…). */
    playOneShot(name, opts) {
      if (this.disposed) return false;
      opts = opts || {};
      if (this._far && !this.dead) this._farExit();
      const n = this._resolveName(name);
      if (n === "death" || n === "dead") {
        this._die(n, opts);
        return true;
      }
      if (this.dead) return false;
      if (n === "hit") {
        this._addBlood(opts.part === "head" ? 0.09 : 0.06);
        if (this.face) this.face.hurt(opts.part === "head" ? 1 : 0.75);
      }
      if (this.face && n === "talk" && !this.face.isTalking())
        this.face.babble((opts.dur || 1.4) * 0.8);
      if (this.face && n === "roar")
        this.face.setEmotion(
          this.face.rig.maniac ? "maniac" : "angry",
          1.2,
          1.2,
        );
      if (this._getup) {
        // standing up: flinches still play (additive), actions wait until upright
        if (n !== "hit") {
          this._pendingOne = { name: n, opts, age: 0 };
          return true;
        }
      }
      if (!this.lib[n]) {
        if (n === "attack_ranged" || n === "reload") {
          this.recoil = n === "attack_ranged" ? 1 : this.recoil;
          if (n === "attack_ranged") this.lastFire = this.animT;
          return true;
        }
        return false;
      }
      const def = A.ONESHOT[n] || { dur: 0.6, mask: "full" };
      // callers often re-trigger every frame: don't restart an action that is still playing
      if (
        this.one &&
        this.one.name === n &&
        n !== "attack_ranged" &&
        n !== "hit" &&
        !opts.restart &&
        this.one.t < this.one.dur * 0.85
      )
        return true;
      if (n === "attack_melee") this.attackAlt = !this.attackAlt;
      if (n === "attack_ranged") {
        this.recoil = 1;
        this.lastFire = this.animT;
      }
      if (n === "hit") {
        this.hitPart = opts.part || null;
        if (opts.dir) {
          const d = this._toLocalDir(opts.dir);
          this.hitLocal = { x: d.x, z: d.z };
        } else this.hitLocal = { x: (Math.random() - 0.5) * 0.6, z: 1 };
        this.flash(opts.flashColor || 0xff4020, 0.12);
        // don't let hit reactions cancel an attack in progress
        if (
          this.one &&
          this.one.name !== "hit" &&
          this.one.t < this.one.dur * 0.8
        ) {
          this._hitAdd = { t: 0 };
          return true;
        }
      }
      this.one = {
        name: n,
        t: 0,
        dur: (opts.dur || def.dur) / (opts.speed || 1),
        speed: opts.speed || 1,
        mask: def.mask,
        additive: !!def.additive,
        opts,
      };
      return true;
    }
    setAim(on) {
      if (on && this._far) this._farExit();
      this.aimFlag = !!on;
    }
    /**
     * Bring a dead character back (respawn / Lazarus). revive() snaps upright;
     * revive(anim, {getup:true}) climbs back up with the get-up transition.
     */
    revive(anim, opts) {
      if (opts && opts.getup && this.dead) {
        this._startGetup(this._resolveName(anim || "idle"), {});
        return;
      }
      if (this.dead) this._revive();
      this._getup = null;
      this.anim = { name: "idle", t: 0, speed: 1, loop: true, opts: {} };
      this.prev = null;
      this.fade = 1;
      if (anim) this.setAnim(anim);
    }
    /** Is the character lying on the ground (dead, dormant or knocked out)? */
    isDown() {
      return this.dead;
    }
    /** Is it currently climbing back to its feet? */
    isGettingUp() {
      return !!this._getup;
    }
    /** Wear & tear: grime 0..1, blood 0..1 (blood also builds up automatically from hits). */
    setWear(o) {
      const U = this.material.userData.uniforms;
      if (o && o.dirt !== undefined) U.uDirt.value = clamp(o.dirt, 0, 1);
      if (o && o.blood !== undefined) U.uBlood.value = clamp(o.blood, 0, 1);
    }
    _addBlood(k) {
      if (this.gore === "oil" && this.info.isRobot) k *= 0.6;
      const U = this.material.userData.uniforms;
      U.uBlood.value = Math.min(0.75, U.uBlood.value + k);
    }
    lookAt(v) {
      if (!v) {
        this.lookTarget = null;
        return;
      }
      if (!this.lookTarget) this.lookTarget = new THREE.Vector3();
      this.lookTarget.copy(v);
    }
    /** Current one-shot {name, t, dur} or null (combat can time melee hits at ~45% of dur). */
    getOneShot() {
      return this.one
        ? { name: this.one.name, t: this.one.t, dur: this.one.dur }
        : null;
    }
    isBusy() {
      return !!this.one && this.one.name !== "hit";
    }
    get animName() {
      return this.dead ? "dead" : this.anim.name;
    }
    isDead() {
      return this.dead;
    }

    _toLocalDir(dirW) {
      const yaw = this.root.rotation.y + this.rigYaw;
      const c = Math.cos(-yaw),
        s = Math.sin(-yaw);
      // rotate world dir by -yaw around Y
      const x = dirW.x * c + dirW.z * s,
        z = -dirW.x * s + dirW.z * c;
      const l = Math.hypot(x, z) || 1;
      return { x: x / l, z: z / l };
    }

    _die(n, opts) {
      opts = opts || {};
      if (this.dead) {
        // already on the ground: a real death (or a corpse restore) makes it permanent
        if (n === "death" || opts.corpse || opts.restore || opts.sticky)
          this._softDead = false;
        return;
      }
      if (this._getup) {
        this._getup = null;
        this._pendingOne = null;
      }
      const rng = L.rng(this.seed * 31 + this.id * 17);
      let style = "back",
        side = rng.chance(0.5) ? 1 : -1;
      if (opts.dir) {
        const d = this._toLocalDir(opts.dir);
        // dir = travel direction of the killing blow (shooter → victim)
        if (d.z > 0.45) style = "back";
        else if (d.z < -0.45) style = "front";
        else {
          style = "side";
          side = d.x > 0 ? 1 : -1;
        }
        if (this.kind !== "biped") side = d.x > 0 ? 1 : -1;
      } else style = rng.pick(["back", "back", "front", "side"]);
      const force = opts.force || 0;
      if (
        (force > 45 || opts.explosive || opts.blast) &&
        this.kind === "biped" &&
        !this.style.heavy
      ) {
        style = "blast";
        if (opts.dir) {
          const d = this._toLocalDir(opts.dir);
          this.rigYawTarget = Math.atan2(d.x, d.z);
        }
      } else if (opts.dir && this.kind === "biped") {
        const d = this._toLocalDir(opts.dir);
        if (style === "back")
          this.rigYawTarget = clamp(Math.atan2(d.x, d.z), -0.5, 0.5);
        if (style === "front")
          this.rigYawTarget = clamp(Math.atan2(-d.x, -d.z), -0.5, 0.5);
      }
      if (this.style.heavy && style === "blast") style = "back";
      // don't fall through walls: if the chosen fall direction is blocked within a
      // body length, pick the first clear alternative (opposite, then either side)
      if (style !== "blast" && this.kind === "biped") {
        const pick = this._clearFall(style, side);
        if (pick) {
          if (pick.style !== style) this.rigYawTarget = 0;
          style = pick.style;
          side = pick.side;
        }
      }
      this.death = {
        style,
        side,
        var: rng(),
        dist: clamp(force / 25, 1.5, 3.5),
        moved: false,
      };
      if (style === "blast") this._planBlast(opts);
      this.dead = true;
      // 'dead' without a preceding 'death' = posed on the ground (dormant/knocked out), not a corpse
      this._softDead =
        n === "dead" && !(opts.corpse || opts.restore || opts.sticky);
      this.one = null;
      this.aimFlag = false;
      this.lookTarget = null;
      this._hitAdd = null;
      this.prev = {
        name: this.anim.name,
        t: this.anim.t,
        speed: this.anim.speed,
        opts: this.anim.opts,
      };
      this.fade = n === "dead" ? 1 : 0;
      this.fadeDur = 0.12;
      this.anim = {
        name: n === "dead" ? "dead" : "death",
        t: 0,
        speed: 1,
        loop: false,
        opts: opts,
      };
      if (n === "dead") {
        this.rigYaw = this.rigYawTarget;
        this.prev = null;
      }
    }
    /** First fall style whose landing zone is free of walls/props ({style, side}); null = no world. */
    _clearFall(style, side) {
      const W = G.world;
      if (!W || typeof W.raycast !== "function") return null;
      const yaw = this.root.rotation.y + this.rigYawTarget;
      const reach = Math.max(0.6, this.height * 0.85);
      const cands = [[style, side]];
      if (style === "back")
        cands.push(["front", side], ["side", side], ["side", -side]);
      else if (style === "front")
        cands.push(["back", side], ["side", side], ["side", -side]);
      else cands.push(["side", -side], ["back", side], ["front", side]);
      const p = this.root.position;
      for (const [st, sd] of cands) {
        // local fall direction: back = +Z, front = -Z, side = +X * sd (rig yaw applied)
        const lx = st === "side" ? sd : 0,
          lz = st === "back" ? 1 : st === "front" ? -1 : 0;
        const c = Math.cos(yaw),
          sn = Math.sin(yaw);
        _v2.set(lx * c + lz * sn, 0, -lx * sn + lz * c).normalize();
        let blocked = false;
        for (const h of [0.35, 0.9]) {
          _v1.set(p.x, p.y + Math.min(h, this.height * 0.5), p.z);
          try {
            const hit = W.raycast(_v1, _v2, reach, {
              ignoreTags: ["actor", "char"],
            });
            if (
              hit &&
              hit.dist !== undefined &&
              hit.dist < reach * (st === "front" ? 0.8 : 1)
            ) {
              blocked = true;
              break;
            }
          } catch (e) {
            return null;
          }
        }
        if (!blocked) return { style: st, side: sd };
      }
      return { style: "front", side }; // boxed in: crumple forward onto the knees
    }
    /**
     * Explosion/huge-hit death throw: the body flies `dist` metres along the blast.
     * Clamp the throw against walls up front; on landing the travelled offset is
     * moved into root.position (so loot, targeting, interactables & raycasts follow the body).
     * If the caller moves the root itself (combat's explosion corpse physics: opts.blast),
     * the rig only tumbles in place.
     */
    _planBlast(opts) {
      const d = this.death;
      if (opts.blast || opts.rootMoves) {
        d.dist = 0.35;
        d.inPlace = true;
        return;
      }
      const yaw = this.root.rotation.y + this.rigYawTarget;
      d.wdx = Math.sin(yaw);
      d.wdz = Math.cos(yaw);
      const W = G.world;
      if (W && typeof W.raycast === "function") {
        try {
          const o = _v1.set(
            this.root.position.x,
            this.root.position.y + Math.min(1.0, this.hipH),
            this.root.position.z,
          );
          const hit = W.raycast(
            o,
            _v2.set(d.wdx, 0, d.wdz),
            d.dist + this.radius + 0.4,
            { ignoreTags: ["actor", "char"] },
          );
          if (hit && hit.dist !== undefined)
            d.dist = clamp(hit.dist - this.radius - 0.25, 0.1, d.dist);
        } catch (e) {
          /* world optional */
        }
      }
    }
    /** Called when a thrown body lands: bake the rig's travel into the root position. */
    _landBlast() {
      const d = this.death;
      if (!d || d.moved) return;
      d.moved = true;
      if (d.inPlace || !(d.dist > 0.05)) return;
      // only blast deaths carry a planned travel (wdx/wdz); ordinary falls reach here after 4 s via the
      // 'death'→'dead' hand-off and must not move (undefined * dist = NaN used to teleport corpses to NaN)
      if (!isFinite(d.wdx) || !isFinite(d.wdz)) return;
      const p = this.root.position;
      let dx = d.wdx * d.dist,
        dz = d.wdz * d.dist;
      const W = G.world;
      try {
        if (W && typeof W.moveCircle === "function") {
          const r = W.moveCircle(p, 0.3, 1.0, dx, dz);
          if (r && isFinite(r.x) && isFinite(r.z)) {
            dx = r.x - p.x;
            dz = r.z - p.z;
          }
        }
      } catch (e) {
        /* ignore */
      }
      if (!isFinite(dx) || !isFinite(dz)) return;
      p.x += dx;
      p.z += dz;
      try {
        if (W && typeof W.groundHeight === "function") {
          const gh = W.groundHeight(p.x, p.z, p.y + 1.0, 0.3);
          if (isFinite(gh)) p.y = gh;
        }
      } catch (e) {
        /* ignore */
      }
      d.dist = 0; // the rig offset no longer carries the travel
      this._lastPos.copy(p);
    }
    /** Per-limb corpse drape: [{bi, q (parent-space delta), k}] or null. */
    _computeDrape() {
      const W = G.world;
      if (!W || typeof W.groundHeight !== "function") return null;
      if (this._camD2 !== undefined && this._camD2 > 40 * 40) {
        this._drapeTry = false;
        return null;
      } // retry when the player comes close
      const B = this.B,
        out = [];
      const chains = [
        ["armL", "handL", 0.035, "forearmL"],
        ["armR", "handR", 0.035, "forearmR"],
        ["thighL", "footL", 0.05, "shinL"],
        ["thighR", "footR", 0.05, "shinR"],
        ["neck", "head", 0.09, null],
      ];
      for (const [a, t, clr, mid] of chains) {
        const ai = B[a],
          ti = B[t];
        if (ai === undefined || ti === undefined) continue;
        let cut = false;
        for (const k in this.dismembered) {
          let b = ti;
          while (b >= 0) {
            if (b === this.dismembered[k]) {
              cut = true;
              break;
            }
            b = this.tpl.bones[b].parent;
          }
        }
        if (cut) continue;
        const ba = this.bones[ai],
          bt = this.bones[ti];
        ba.getWorldPosition(_dPr);
        bt.getWorldPosition(_dPt);
        let g;
        try {
          g = W.groundHeight(_dPt.x, _dPt.z, _dPt.y + 0.45, 0.05);
        } catch (e) {
          continue;
        }
        if (!isFinite(g)) continue;
        const e = g + clr * this.scale - _dPt.y;
        if (Math.abs(e) < 0.025 || e > 0.3 || e < -0.4) continue; // (bigger gaps: a wall / ledge edge, leave the limb be)
        _dD.subVectors(_dPt, _dPr);
        const len = _dD.length();
        if (len < 0.08) continue;
        _dN.crossVectors(_yAxis, _dD);
        if (_dN.lengthSq() < 1e-8) continue;
        _dN.normalize();
        _dV.crossVectors(_dN, _dD); // tip velocity for a unit rotation about _dN
        if (Math.abs(_dV.y) < 0.15 * len) continue;
        let th = clamp(e / _dV.y, -0.55, 0.55);
        // lowering a limb must not push its middle joint (elbow / knee) into the ground
        if (th * _dV.y < 0 && mid && B[mid] !== undefined) {
          this.bones[B[mid]].getWorldPosition(_dPt);
          let gm;
          try {
            gm = W.groundHeight(_dPt.x, _dPt.z, _dPt.y + 0.45, 0.05);
          } catch (err) {
            gm = NaN;
          }
          const vm = _dD.subVectors(_dPt, _dPr);
          const vmy = _dV.crossVectors(_dN, vm).y;
          if (isFinite(gm) && Math.abs(vmy) > 1e-4) {
            const room = _dPt.y - (gm + 0.03 * this.scale); // how far the joint may still drop
            const drop = -th * vmy; // how far it would drop
            if (drop > room) th *= Math.max(0, room) / drop;
          }
          if (Math.abs(th) < 0.02) continue;
        }
        const qw = new THREE.Quaternion().setFromAxisAngle(_dN, th);
        const qp = new THREE.Quaternion();
        ba.parent.getWorldQuaternion(qp);
        out.push({
          bi: ai,
          q: qp.clone().invert().multiply(qw).multiply(qp),
          k: 0,
        });
      }
      return out.length ? out : null;
    }
    /** World position of a corpse's torso (where the body actually lies). */
    getCorpsePos(out) {
      return this.getPartWorldPos("torso", out);
    }
    _revive() {
      this.dead = false;
      this._softDead = false;
      this.death = null;
      this.rigYaw = this.rigYawTarget = 0;
      this.rig.rotation.set(0, 0, 0);
      this.rig.position.set(0, 0, 0);
      this._settle = null;
      this._settleDone = false;
      this._drape = null;
      this._drapeTry = false;
      if (this._dissolve) {
        this._dissolve = null;
        this.material.userData.uniforms.uDissolve.value = 0;
      }
      if (!this._exploded) this.mesh.visible = true;
    }
    /** Climb back to the feet from the current lying pose, then play `next`. */
    _startGetup(next, nextOpts) {
      if (this._dissolve || this._exploded) return;
      this._settle = null;
      this._settleDone = false;
      this._drape = null;
      this._drapeTry = false;
      this.rig.position.set(0, 0, 0);
      const d = this.death || { style: "back", side: 1, var: 0, dist: 0 };
      d.dist = 0;
      this.dead = false;
      this._softDead = false;
      const dur =
        this.kind === "biped"
          ? this.style.wild
            ? 0.95
            : this.style.heavy
              ? 1.7
              : 1.35
          : 0.75;
      this._getup = {
        dur,
        death: d,
        next: next || "idle",
        nextOpts: nextOpts || {},
      };
      this.anim = { name: "getup", t: 0, speed: 1, loop: false, opts: {} };
      this.prev = null;
      this.fade = 1;
      this.rigYawTarget = 0;
    }
    _finishGetup() {
      const g = this._getup;
      this._getup = null;
      this.death = null;
      this.anim = { name: "idle", t: 0, speed: 1, loop: true, opts: {} };
      this.prev = null;
      this.fade = 1;
      const n = g && g.next ? g.next : "idle";
      if (n !== "idle" && n !== "getup") this.setAnim(n, g.nextOpts || {});
      if (this._pendingOne) {
        const p = this._pendingOne;
        this._pendingOne = null;
        if (p.age < 1.2) this.playOneShot(p.name, p.opts);
      }
    }

    // ---------------------------------------------------------------
    // Weapons
    // ---------------------------------------------------------------
    /** Attach an Object3D (grip at origin, barrel toward -Z, up +Y) to the right hand. Returns the previous weapon. */
    setWeapon(obj, hold) {
      if (this._far) this._farExit();
      const old = this.weapon;
      if (old && old.parent) old.parent.remove(old);
      this.weapon = obj || null;
      this.holdType = null;
      this._muzzle = null;
      if (!obj) return old;
      const sock = this.sockets.gripR;
      if (!sock) {
        this.weapon = null;
        return old;
      }
      this.holdType = inferHold(obj, hold);
      sock.add(obj);
      obj.position.set(0, 0, 0);
      obj.rotation.set(0, 0, 0);
      if (this.meta && this.meta.weaponScale)
        obj.scale.setScalar(this.meta.weaponScale);
      obj.traverse((o) => {
        if (o.isMesh) o.castShadow = true;
      });
      // muzzle: explicit userData.muzzle (Object3D/Vector3) or the -Z end of the bounding box
      const um = obj.userData && obj.userData.muzzle;
      if (um && um.isObject3D) this._muzzle = { obj: um };
      else {
        obj.updateMatrixWorld(true);
        const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
        const box = new THREE.Box3();
        obj.traverse((o) => {
          if (o.geometry) {
            if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
            box.union(
              o.geometry.boundingBox
                .clone()
                .applyMatrix4(
                  new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld),
                ),
            );
          }
        });
        this._muzzle = {
          local:
            um && um.isVector3
              ? um.clone()
              : box.isEmpty()
                ? new THREE.Vector3(0, 0.05, -0.4)
                : new THREE.Vector3(
                    0,
                    (box.min.y + box.max.y) / 2 +
                      (box.max.y - box.min.y) * 0.15,
                    box.min.z,
                  ),
        };
      }
      return old;
    }
    getHoldType() {
      return this.holdType;
    }
    /** World-space muzzle position & forward (weapon or built-in emitter). */
    getMuzzle(outPos, outDir) {
      // without out-params the result lives in per-character scratch vectors
      // (valid until the next getMuzzle call on this character) — no per-shot garbage
      if (!outPos) outPos = this._mzP || (this._mzP = new THREE.Vector3());
      if (!outDir) outDir = this._mzD || (this._mzD = new THREE.Vector3());
      this.root.updateMatrixWorld(true);
      if (this.weapon && this._muzzle) {
        if (this._muzzle.obj) this._muzzle.obj.getWorldPosition(outPos);
        else
          outPos.copy(this._muzzle.local).applyMatrix4(this.weapon.matrixWorld);
        this.weapon.getWorldQuaternion(_q1);
        outDir.set(0, 0, -1).applyQuaternion(_q1);
      } else if (this.sockets.muzzle) {
        this.sockets.muzzle.getWorldPosition(outPos);
        this.sockets.muzzle.getWorldQuaternion(_q1);
        outDir.set(0, 0, -1).applyQuaternion(_q1);
      } else if (this.sockets.eyes) {
        this.sockets.eyes.getWorldPosition(outPos);
        this.root.getWorldQuaternion(_q1);
        outDir.set(0, 0, -1).applyQuaternion(_q1);
      } else {
        this.parts.torso.getWorldPosition(outPos);
        this.root.getWorldQuaternion(_q1);
        outDir.set(0, 0, -1).applyQuaternion(_q1);
      }
      if (this.lookTarget) {
        outDir.subVectors(this.lookTarget, outPos).normalize();
      }
      const res = this._mzR || (this._mzR = { pos: null, dir: null });
      res.pos = outPos;
      res.dir = outDir;
      return res;
    }
    /** Detach the held weapon into the world with a little tumble; returns it. */
    dropWeapon() {
      const w = this.weapon;
      if (!w) return null;
      w.updateMatrixWorld(true);
      w.matrixWorld.decompose(_v1, _q1, _s1);
      if (w.parent) w.parent.remove(w);
      G.scene.add(w);
      w.position.copy(_v1);
      w.quaternion.copy(_q1);
      w.scale.copy(_s1);
      this.weapon = null;
      this.holdType = null;
      L.gibs.add(
        w,
        new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          2,
          (Math.random() - 0.5) * 2,
        ),
        4,
        { keep: true, radius: 0.05 },
      );
      return w;
    }

    // ---------------------------------------------------------------
    // Visual FX hooks
    // ---------------------------------------------------------------
    flash(color, dur) {
      if (this._far) this._farExit();
      this._flashColor.set(color === undefined ? 0xff3010 : color);
      this._flash = dur || 0.12;
      this._flashDur = this._flash;
    }
    setFlashing(on, color) {
      if (on && this._far) this._farExit();
      this._flashing = !!on;
      if (color !== undefined) this._flashingColor.set(color);
    }
    /** Targeting: glow one body part (or null to clear). */
    highlightPart(part, color) {
      const u = this.material.userData.uniforms;
      if (!part) {
        u.uHiPart.value = -1;
        return;
      }
      if (this._far) this._farExit(); // part highlighting must see the real rig
      const id = L.PART_IDS[part];
      u.uHiPart.value = id === undefined ? -1 : id;
      u.uHiColor.value
        .set(color === undefined ? 0x1aff60 : color)
        .multiplyScalar(0.55);
    }
    /** Laser/plasma disintegration: dissolve with glowing edges, leaves ash pile or goo puddle. */
    disintegrate(kind, dur) {
      if (this._dissolve) return;
      if (this._far) this._farExit();
      kind = kind === "goo" || kind === "plasma" ? "goo" : "ash";
      this._dissolve = { kind, t: 0, dur: dur || 1.6, left: false };
      this.material.userData.uniforms.uDissolveColor.value.set(
        kind === "goo" ? 0x46ff3a : 0xff7a20,
      );
      this._die("death", { dir: null }); // also makes a dormant/knocked-out body a permanent corpse
      this.mesh.castShadow = false;
    }
    setVisible(v) {
      this.hidden = !v;
      this.root.visible = !!v;
    }

    // ---------------------------------------------------------------
    // Hit testing (for combat / part targeting)
    // ---------------------------------------------------------------
    getPartWorldPos(part, out) {
      out = out || new THREE.Vector3();
      const m = this.parts[part] || this.parts.torso;
      this.root.updateMatrixWorld(true);
      return m.getWorldPosition(out);
    }
    /** Ray vs part capsules. Returns nearest {part, dist, point} or null. */
    raycast(origin, dir, maxDist) {
      maxDist = maxDist || 1e4;
      // quick reject with bounding sphere around root
      _v1.copy(this.root.position);
      _v1.y += this.height * 0.5;
      _v2.subVectors(_v1, origin);
      const tc = _v2.dot(dir);
      const d2 = _v2.lengthSq() - tc * tc;
      const R =
        Math.max(this.height, this.radius * 4) * 0.8 + (this.dead ? 2 : 0.5);
      if (d2 > R * R || tc < -R) return null;
      this.root.updateMatrixWorld(true);
      let best = null;
      for (const h of this.tpl.hit) {
        if (this._cutHides(h.bone)) continue;
        const bm = this.bones[h.bone].matrixWorld;
        _v3.set(h.a[0], h.a[1], h.a[2]).applyMatrix4(bm);
        _v4.set(h.b[0], h.b[1], h.b[2]).applyMatrix4(bm);
        const t = rayCapsule(origin, dir, _v3, _v4, h.r * (this.hitScale || 1));
        if (t !== null && t >= 0 && t <= maxDist && (!best || t < best.dist))
          best = {
            part: h.part,
            dist: t,
            point: new THREE.Vector3().copy(origin).addScaledVector(dir, t),
            character: this,
          };
      }
      return best;
    }
    _cutHides(bi) {
      for (const k in this.dismembered) {
        const cb = this.dismembered[k];
        let b = bi;
        while (b >= 0) {
          if (b === cb) return true;
          b = this.tpl.bones[b].parent;
        }
      }
      return false;
    }
    hasPart(part) {
      const bn = this.cut[part];
      const bi = bn !== undefined ? this.B[bn] : undefined;
      return !(bi !== undefined && this.dismembered[part] !== undefined);
    }

    // ---------------------------------------------------------------
    // Dismemberment
    // ---------------------------------------------------------------
    /**
     * Sever a part (head/leftArm/rightArm/leftLeg/rightLeg) or 'torso'/'all'
     * to explode the whole body. opts: {dir: Vector3 (impulse), explode: bool}
     * Returns the gib Object3Ds spawned.
     */
    dismember(part, opts) {
      opts = opts || {};
      if (this.disposed) return [];
      if (this._far) this._farExit();
      this.root.updateMatrixWorld(true);
      const goreC = GORE[this.gore] || GORE.red;
      const dir = opts.dir ? _v1.copy(opts.dir).normalize() : _v1.set(0, 0, 0);
      const gibs = [];
      if (part === "torso" || part === "all" || part === "body") {
        // full-body burst: the whole body comes apart
        const center = this.getPartWorldPos("torso", new THREE.Vector3());
        for (const p of ["head", "leftArm", "rightArm", "leftLeg", "rightLeg"])
          gibs.push(
            ...this.dismember(p, {
              dir: opts.dir,
              explode: p === "head" ? true : Math.random() < 0.4,
              quiet: true,
            }),
          );
        gibs.push(
          ...L.gibs.chunks(
            center,
            7 + Math.floor(Math.random() * 5),
            goreC,
            dir,
            this.gore === "oil",
            this.scale,
          ),
        );
        this.mesh.visible = false;
        this._exploded = true;
        if (this.weapon) this.dropWeapon();
        this._goreFx(center, dir, 3);
        return gibs;
      }
      const bn = this.cut[part];
      const bi = bn !== undefined ? this.B[bn] : undefined;
      if (bi === undefined || this.dismembered[part] !== undefined) return [];
      this.dismembered[part] = bi;
      const bone = this.bones[bi];
      bone.updateMatrixWorld(true);
      bone.matrixWorld.decompose(_v2, _q1, _s1);
      const jointPos = _v2.clone();
      if (opts.explode) {
        gibs.push(
          ...L.gibs.chunks(
            jointPos.clone().add(new THREE.Vector3(0, 0.1 * this.scale, 0)),
            5 + Math.floor(Math.random() * 4),
            goreC,
            dir,
            this.gore === "oil",
            this.scale,
          ),
        );
      } else {
        const geo = L.subtreeGeometry(this.tpl, bi, false);
        if (geo) {
          const m = new THREE.Mesh(geo, this._gibMaterial());
          m.castShadow = true;
          m.position.copy(jointPos);
          m.quaternion.copy(_q1);
          G.scene.add(m);
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 2.5,
            2.5 + Math.random() * 2.5,
            (Math.random() - 0.5) * 2.5,
          ).addScaledVector(dir, 4 + Math.random() * 3);
          L.gibs.add(m, vel, 6 + Math.random() * 8, {
            radius: 0.08 * this.scale,
            goreColor: goreC,
            bleed: this.gore !== "oil",
          });
          gibs.push(m);
          // a raw end on the severed piece
          const cap = L.gibs.stumpMesh(
            goreC,
            0.055 * this.scale * ((this.meta && this.meta.bulk) || 1),
            this.gore === "oil",
          );
          m.add(cap);
        }
      }
      // stump on the parent bone
      const pb = this.tpl.bones[bi].parent;
      if (pb >= 0) {
        const st = L.gibs.stumpMesh(
          goreC,
          0.06 * this.scale * ((this.tpl.meta && this.tpl.meta.bulk) || 1),
          this.gore === "oil",
        );
        st.position.copy(bone.position);
        this.bones[pb].add(st);
        this._stumps.push(st);
      }
      if (this.weapon && part === "rightArm") this.dropWeapon();
      if (!opts.quiet) this._goreFx(jointPos, dir, part === "head" ? 2 : 1.4);
      // hide the severed subtree on the body THIS frame (the flying gib already
      // shows it) and force a full re-pose on the next tick regardless of anim LOD
      bone.scale.setScalar(1e-4);
      bone.updateMatrixWorld(true);
      this._acc = 1e3;
      return gibs;
    }
    /** Material for severed parts: same per-instance tint/grime/blood as the body. */
    _gibMaterial() {
      if (this._gibMat) return this._gibMat;
      const m = L.makeMaterial();
      const a = this.material.userData.uniforms,
        b = m.userData.uniforms;
      for (let i = 0; i < 6; i++) b.uTints.value[i].copy(a.uTints.value[i]);
      b.uDirt.value = a.uDirt.value;
      b.uBlood.value = Math.max(0.3, a.uBlood.value);
      b.uBloodColor.value.copy(a.uBloodColor.value);
      b.uFaceMap.value = a.uFaceMap.value;
      m.userData.gib = true;
      this._gibMat = m;
      return m;
    }
    _goreFx(pos, dir, amount) {
      try {
        if (G.isStub("fx")) return;
        if (this.gore === "oil") {
          G.fx.sparks && G.fx.sparks(pos);
          G.fx.smoke && G.fx.smoke(pos, 0.5);
        } else
          G.fx.blood &&
            G.fx.blood(
              pos,
              dir.lengthSq() > 0 ? dir : new THREE.Vector3(0, 1, 0),
              amount,
              this.gore === "green" ? 0x5a8a1a : undefined,
            );
      } catch (e) {
        /* fx optional */
      }
    }

    // ---------------------------------------------------------------
    // Update
    // ---------------------------------------------------------------
    /** Advance & pose. Called by the owner (combat) each frame; auto-called otherwise. */
    update(dt) {
      this._extFrame = G.time ? G.time.frame : 0;
      this._tick(dt || 0);
    }
    _tick(dt) {
      if (this.disposed) return;
      dt = clamp(dt, 0, 0.1);
      // ---- distance LOD: update less often far away ----
      const cam = G.camera ? G.camera.position : null;
      let d2 = 0;
      if (cam) {
        const dx = this.root.position.x - cam.x,
          dz = this.root.position.z - cam.z;
        d2 = dx * dx + dz * dz;
      }
      this._camD2 = d2;
      this._updateLod(d2);
      // close-up face texture (per template, LRU-cached) once the camera comes near
      if (this.face && d2 < 16 * 16 && (this._faceTexT -= dt) <= 0) {
        this._faceTexT = 0.5;
        this.ensureFaceTexture(false, d2);
      }
      const interval =
        d2 < 45 * 45
          ? 0
          : d2 < 90 * 90
            ? 1 / 20
            : d2 < 180 * 180
              ? 1 / 8
              : 1 / 3;
      this._acc += dt;
      this._measure(dt);
      if (this._far) {
        // frozen impostor (crowd far tier): only watch for movement
        if (this.speedM > 0.35) this._farExit();
        else {
          this._acc = Math.min(this._acc, 1);
          return;
        }
      }
      if (this._acc < interval && this._posed) return;
      const step = this._acc;
      this._acc = 0;
      this.mesh.castShadow =
        d2 < 60 * 60 && !this._dissolve && this._shadowOk !== false;
      this._advance(step);
      this._evaluate(step);
    }
    /** Swap to a simplified proxy mesh at distance (with a little hysteresis). */
    _updateLod(d2) {
      if (this.noLod) return;
      const cur = this._lod,
        D = this.lodDist;
      const band = cur === 0 || cur === 3 ? 1.0 : 0.9; // step back in a bit closer than we step out
      const d1 = D * band,
        dd2 = D * 2.6 * (cur === 2 ? 0.9 : 1.0);
      let want = d2 > dd2 * dd2 ? 2 : d2 > d1 * d1 ? 1 : 0;
      // faces: the full dialogue-grade head only within ~10 m; beyond that a
      // lightly simplified template (level 3) keeps the body but drops face detail
      if (want === 0 && this.face) {
        const fc = cur === 0 ? 11 : 9.5;
        if (d2 > fc * fc) want = 3;
      }
      if (want === cur) return;
      this._lod = want;
      this.mesh.geometry = L.getLod(this.tpl, want);
    }
    /** Force a LOD level (null = automatic). Debug / cut-scenes. */
    setLod(level) {
      if (level === null || level === undefined) {
        this.noLod = false;
        return;
      }
      this.noLod = true;
      this._lod = level;
      this.mesh.geometry = L.getLod(this.tpl, level);
    }
    /** Is the full close-up template active? */
    get closeLod() {
      return this._lod === 0;
    }
    /** Measure actual ground speed from root movement (drives gait phase). */
    _measure(dt) {
      const p = this.root.position;
      if (isNaN(this._lastPos.x)) {
        this._lastPos.copy(p);
        return;
      }
      const dx = p.x - this._lastPos.x,
        dz = p.z - this._lastPos.z;
      this._lastPos.copy(p);
      if (dt <= 0) return;
      const dist = Math.hypot(dx, dz);
      if (dist > 3) return; // teleport
      const yaw = this.root.rotation.y;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      // world → local (rotate by -yaw)
      const lx = dx * c - dz * s,
        lz = dx * s + dz * c;
      const v = dist / dt;
      this.speedM = lerp(this.speedM, v, 1 - Math.exp(-dt * 8));
      this.velLocal.x = lerp(this.velLocal.x, lx / dt, 1 - Math.exp(-dt * 8));
      this.velLocal.z = lerp(this.velLocal.z, lz / dt, 1 - Math.exp(-dt * 8));
      this._distAcc = (this._distAcc || 0) + dist * (lz > 0.3 * dist ? -1 : 1);
    }
    _nominalSpeed(name) {
      const g = this.gait;
      return name === "run"
        ? g.runSpeed
        : name === "sneak"
          ? g.walkSpeed * 0.6
          : name === "walk"
            ? g.walkSpeed
            : 0;
    }
    _advance(dt) {
      const a = this.anim;
      this.animT += dt;
      a.t += dt * a.speed;
      if (this.prev) {
        this.prev.t += dt * (this.prev.speed || 1);
        this.fade = Math.min(1, this.fade + dt / Math.max(0.01, this.fadeDur));
        if (this.fade >= 1) this.prev = null;
      }
      if (this.one) {
        this.one.t += dt;
        if (this.one.t >= this.one.dur) this.one = null;
      }
      if (this.face && this._lod === 0) this.face.update(dt);
      if (this._hitAdd) {
        this._hitAdd.t += dt;
        if (this._hitAdd.t > 0.4) this._hitAdd = null;
      }
      if (this.dead && a.name === "death") {
        if (
          this.death &&
          this.death.style === "blast" &&
          !this.death.moved &&
          a.t >= 0.86
        )
          this._landBlast();
        if (a.t > 4) {
          if (this.death && !this.death.moved) this._landBlast();
          a.name = "dead";
        }
      }
      if (
        this.dead &&
        !this._settleDone &&
        !this._dissolve &&
        (a.name === "dead" || a.t > 1.15) &&
        !(this.death && this.death.style === "blast" && !this.death.moved)
      ) {
        this._settleDone = true;
        try {
          this._settle = this._computeSettle();
        } catch (e) {
          this._settle = null;
        }
      }
      if (this._getup) {
        if (this._pendingOne) this._pendingOne.age += dt;
        if (a.name === "getup" && a.t >= this._getup.dur) this._finishGetup();
      }
      // gait phase
      const isLoco = A.LOCO[a.name];
      const g = this.gait;
      let v = this.speedM;
      const inPlace = a.opts && a.opts.inPlace;
      if (inPlace) v = this._nominalSpeed(a.name) * (a.speed || 1);
      const k =
        a.name === "sneak"
          ? 0
          : smooth(g.walkSpeed * 1.05, g.runSpeed * 0.85, v);
      const stepLen =
        lerp(g.walkStep, g.runStep, k) * (a.name === "sneak" ? 0.7 : 1);
      let dist = inPlace ? v * dt : Math.abs(this._distAcc || 0);
      const back =
        !inPlace &&
        this.velLocal.z > 0.35 &&
        this.velLocal.z > Math.abs(this.velLocal.x) * 0.6;
      this._distAcc = 0;
      if (isLoco) this.phase += (dist / (2 * stepLen)) * PI * 2;
      this._k = k;
      this._v = v;
      this._back = back;
      this.recoil *= Math.exp(-dt * 11);
      if (this._flash > 0) this._flash = Math.max(0, this._flash - dt);
      // rig yaw (death alignment)
      this.rigYaw = lerp(
        this.rigYaw,
        this.rigYawTarget,
        1 - Math.exp(-dt * 10),
      );
      // look-at smoothing
      let ty = 0,
        tp = 0;
      if (this.lookTarget && !this.dead) {
        const r = this.root;
        _v1.copy(this.lookTarget);
        r.worldToLocal(_v1);
        ty = Math.atan2(-_v1.x, -_v1.z);
        tp = Math.atan2(_v1.y - this.height * 0.9, Math.hypot(_v1.x, _v1.z));
        const lim = this.style.lookLimit || 1.25;
        if (Math.abs(ty) > 2.2) ty = 0; // behind: don't break the neck
        ty = clamp(ty, -lim, lim);
        tp = clamp(tp, -0.8, 0.8);
      }
      const ls = 1 - Math.exp(-dt * 7);
      this.lookYaw += (ty - this.lookYaw) * ls;
      this.lookPitch += (tp - this.lookPitch) * ls;
      // disintegration
      if (this._dissolve) {
        const d = this._dissolve;
        d.t += dt;
        const u = clamp(d.t / d.dur, 0, 1);
        this.material.userData.uniforms.uDissolve.value = u * 1.02;
        if (u > 0.55 && !d.left) {
          d.left = true;
          L.gibs.remains(this, d.kind);
        }
        if (u >= 1) this.mesh.visible = false;
      }
    }

    _evalBase(P, name, t, opts) {
      P.clear();
      if (name === "getup") return this._evalGetup(P, t);
      const W = this.W.bind(P),
        lib = this.lib;
      if (A.LOCO[name]) {
        const v = this._v,
          k = this._k;
        const inPlace = opts && opts.inPlace;
        if (name === "sneak") {
          const amt = inPlace ? 1 : smooth(0.05, 0.5, v);
          if (lib.gait) lib.gait(W, this, this.phase, 0, amt, true, this._back);
          else lib.idle(W, this.animT, this);
          return;
        }
        let amt = inPlace ? (name === "idle" ? 0 : 1) : smooth(0.08, 0.55, v);
        if (!inPlace && name === "idle" && v < 0.05) amt = 0;
        if (amt < 1) lib.idle(W, this.animT, this, opts);
        if (amt > 0 && lib.gait) {
          const T = this.poseT.clear();
          lib.gait(this.W.bind(T), this, this.phase, k, 1, false, this._back);
          P.blend(T, amt);
          this.W.bind(P);
        }
        return;
      }
      const fn = lib[name] || lib.idle;
      fn(
        W,
        name === "death" || name === "dead"
          ? t
          : name === "idle" ||
              name === "aim" ||
              name === "talk" ||
              name === "sit" ||
              name === "cower" ||
              name === "work"
            ? this.animT
            : t,
        this,
        opts || {},
      );
    }

    /**
     * Get-up: lying pose → push up to a kneel/crouch (lib.getupMid) → idle.
     * Blending Euler poses between these three keys reads as rolling over,
     * planting a knee and standing.
     */
    _evalGetup(P, t) {
      const g = this._getup,
        lib = this.lib;
      const dur = g ? g.dur : 1;
      const u = clamp(t / dur, 0, 1);
      (lib.dead || lib.idle)(this.W.bind(P), 12, this, {});
      const M = this.poseT.clear();
      if (lib.getupMid) lib.getupMid(this.W.bind(M), u, this);
      else lib.idle(this.W.bind(M), this.animT, this, {});
      P.blend(M, smooth(0.0, 0.5, u));
      const I = this.poseG.clear();
      lib.idle(this.W.bind(I), this.animT, this, {});
      P.blend(I, smooth(0.45, 1.0, u));
      this.W.bind(P);
    }

    _evaluate(dt) {
      const F = this.poseF;
      this._evalBase(F, this.anim.name, this.anim.t, this.anim.opts);
      if (this.prev && this.fade < 1) {
        this._evalBase(this.poseB, this.prev.name, this.prev.t, this.prev.opts);
        // F = lerp(prev, cur, fade)
        const fe = smooth(0, 1, this.fade);
        this.poseB.blend(F, fe);
        F.copy(this.poseB);
      }
      // one-shot layer
      if (this.one) {
        const o = this.one,
          lib = this.lib;
        const P = this.poseC.clear();
        // hunched creatures keep their stance under full-body one-shots (else a
        // colossus/brute would straighten up for every swing)
        if (
          !o.additive &&
          o.mask !== "upper" &&
          lib.stance &&
          (this.style.hunch > 0.2 || this.style.crouch)
        )
          lib.stance(this.W.bind(P), this);
        lib[o.name](this.W.bind(P), o.t * (o.speed || 1), this, o.opts);
        const u = o.t / o.dur;
        const mask = o.mask === "upper" ? this.upperMask : null;
        if (o.additive) F.add(P, 1, mask);
        else {
          const w = A.envelope(u, 0.12, 0.2);
          if (
            o.mask === "full" &&
            this.kind === "biped" &&
            A.LOCO[this.anim.name] &&
            this._v > 0.5
          ) {
            // attacking while moving: keep the legs walking
            F.blend(P, w, this.upperMask);
          } else F.blend(P, w, mask);
        }
      }
      if (this._hitAdd && this.lib.hit) {
        const P = this.poseC.clear();
        this.lib.hit(this.W.bind(P), this._hitAdd.t, this);
        F.add(P, 1);
      }
      // look-at (additive on spine/neck/head)
      if (
        !this.dead &&
        (Math.abs(this.lookYaw) > 1e-3 || Math.abs(this.lookPitch) > 1e-3)
      ) {
        const W = this.W.bind(F);
        const y = this.lookYaw,
          p = this.lookPitch;
        if (this.kind === "biped") {
          W.r("chest", 0, y * 0.3, 0);
          W.r("neck", p * 0.35, y * 0.25, 0);
          W.r("head", p * 0.5, y * 0.45, 0);
        } else if (this.kind === "quad") {
          W.r("neck", p * 0.4, y * 0.5, 0);
          W.r("head", p * 0.4, y * 0.4, 0);
        } else if (this.kind === "hover") {
          W.r("body", 0, y * 0.9, 0);
          for (let i = 1; i <= 3; i++) W.r("stalk" + i, p * 0.6, y * 0.1, 0);
          W.r("eye", p, 0, 0);
        } else W.r("head", p * 0.5, y * 0.6, 0);
      }
      // TRIGGER FINGER: with a gun in hand the index lies straight along the frame
      // (trigger discipline) and only goes onto the trigger when aiming; it
      // squeezes on each shot
      if (
        this.kind === "biped" &&
        this.weapon &&
        !this.dead &&
        this.B.fingI1R !== undefined
      ) {
        const h = this.holdType;
        if (h === "pistol" || h === "rifle" || h === "heavy") {
          const on =
            this.one &&
            (this.one.name === "attack_ranged" || this.one.name === "attack");
          const k = on ? 0.02 : this.aimFlag ? 0.13 : 0.42;
          const W = this.W.bind(F);
          W.r("fingI1R", 0, 0, k);
          W.r("fingI2R", 0, 0, k * 0.85);
        }
      }
      // ---- apply to bones ----
      const bones = this.bones,
        rot = F.rot,
        scl = F.scl;
      for (let i = 0; i < bones.length; i++) {
        const b = bones[i];
        b.rotation.set(rot[i * 3], rot[i * 3 + 1], rot[i * 3 + 2]);
        const sc = scl[i];
        if (sc !== 1 || b.scale.x !== 1) b.scale.setScalar(sc);
      }
      const r0 = bones[0];
      r0.position.set(
        this.rest[0].x + F.off[0],
        this.rest[0].y + F.off[1],
        this.rest[0].z + F.off[2],
      );
      if (this._headK !== 1 && this.B.head !== undefined)
        bones[this.B.head].scale.multiplyScalar(this._headK);
      for (const k in this.dismembered)
        bones[this.dismembered[k]].scale.setScalar(1e-4);
      if (this.face && !this.dismembered.head) this.face.apply();
      // corpse settle: the lying body tilts onto the sampled ground plane
      // (slopes, rubble, stairs) instead of floating/clipping
      if (this._settle) {
        const st = this._settle;
        st.k = Math.min(1, st.k + (dt || 0.016) / 0.4);
        _sq1.setFromAxisAngle(_yAxis, this.rigYaw);
        _sq2.identity().slerp(st.q, smooth(0, 1, st.k));
        this.rig.quaternion.copy(_sq2).multiply(_sq1);
        this.rig.position.y = st.dy * smooth(0, 1, st.k);
      } else this.rig.rotation.set(0, this.rigYaw, 0);
      // LIMB DRAPE: once the body has landed (and tilted onto the ground plane),
      // each limb (arms, legs, neck) swings about its root joint so the hand /
      // foot / head rests on the ground sampled under it (steps, kerbs, rubble)
      // instead of floating above it or sinking in; computed once, eased in
      if (
        this.dead &&
        this.kind === "biped" &&
        this._settleDone &&
        !this._dissolve &&
        (!this._settle || this._settle.k >= 1)
      ) {
        if (!this._drape && !this._drapeTry) {
          this._drapeTry = true;
          this.rig.updateMatrixWorld(true);
          try {
            this._drape = this._computeDrape();
          } catch (e) {
            this._drape = null;
          }
        }
        if (this._drape)
          for (const d of this._drape) {
            d.k = Math.min(1, d.k + (dt || 0.016) / 0.3);
            this.bones[d.bi].quaternion.premultiply(
              _sq3.identity().slerp(d.q, smooth(0, 1, d.k)),
            );
          }
      }
      // weapon visibility (holstered while sitting/working)
      if (this.weapon)
        this.weapon.visible = !(
          this.anim.name === "sit" ||
          this.anim.name === "work" ||
          this.anim.name === "cower"
        );
      // ---- IK: feet on uneven ground (stairs, rubble, slopes), then hands on the gun ----
      this.root.updateMatrixWorld(true);
      this._footIK(dt);
      this._ik(dt);
      // ---- material FX ----
      const u = this.material.userData.uniforms;
      if (this._flash > 0) {
        u.uFlash.value
          .copy(this._flashColor)
          .multiplyScalar((this._flash / (this._flashDur || 0.12)) * 0.9);
      } else if (this._flashing) {
        u.uFlash.value
          .copy(this._flashingColor)
          .multiplyScalar(0.25 + 0.2 * Math.sin(this.animT * 8));
      } else u.uFlash.value.setRGB(0, 0, 0);
      this._posed = true;
    }

    /**
     * Cheap foot IK: sample the ground under each foot (G.world.groundHeight),
     * drop the pelvis to the lower foot and shorten the other leg analytically
     * in its own bend plane (knee via law of cosines, thigh swings to keep the
     * foot under the hip, foot pitch preserved). Smoothed; skipped far away,
     * on flat ground, for corpses, sitting and non-plantigrade rigs.
     */
    _footIK(dt) {
      const B = this.B,
        W = G.world;
      const fi = this._fik || (this._fik = { l: 0, r: 0 });
      let tl = 0,
        tr = 0;
      const ok =
        this.kind === "biped" &&
        !this.dead &&
        !this._getup &&
        !this.noFootIK &&
        W &&
        typeof W.groundHeight === "function" &&
        B.thighL !== undefined &&
        B.footR !== undefined &&
        !this.hover &&
        this.root.parent &&
        (this._camD2 === undefined || this._camD2 < 40 * 40) &&
        this.anim.name !== "sit";
      const bones = this.bones;
      if (ok) {
        const ry = this.root.position.y,
          lim = 0.45 * this.scale;
        bones[B.footL].getWorldPosition(_v1);
        bones[B.footR].getWorldPosition(_v2);
        try {
          const gl = W.groundHeight(_v1.x, _v1.z, ry + 0.5, 0.06),
            gr = W.groundHeight(_v2.x, _v2.z, ry + 0.5, 0.06);
          if (isFinite(gl)) tl = clamp(gl - ry, -lim, lim);
          if (isFinite(gr)) tr = clamp(gr - ry, -lim, lim);
        } catch (e) {
          tl = tr = 0;
        }
      }
      // foot PITCH (toe vs heel sample) and ROLL (inner vs outer edge) to the
      // ground under each foot, only where it isn't flat and close enough to see
      let pl = 0,
        pr = 0,
        rl = 0,
        rr = 0;
      if (
        ok &&
        this._camD2 < 25 * 25 &&
        (Math.abs(tl) > 0.008 ||
          Math.abs(tr) > 0.008 ||
          Math.abs(fi.pl || 0) > 0.01 ||
          Math.abs(fi.pr || 0) > 0.01 ||
          Math.abs(fi.rl || 0) > 0.01 ||
          Math.abs(fi.rr || 0) > 0.01)
      ) {
        const yaw = this.root.rotation.y,
          fx = -Math.sin(yaw),
          fz = -Math.cos(yaw),
          ry = this.root.position.y;
        const sx = Math.cos(yaw),
          sz = -Math.sin(yaw); // character's local +X (right) in world
        const toe = 0.13 * this.scale,
          heel = 0.06 * this.scale,
          side = 0.045 * this.scale;
        const gh = (x, z) => W.groundHeight(x, z, ry + 0.5, 0.03);
        const slope = (p) => {
          try {
            const a = gh(p.x + fx * toe, p.z + fz * toe),
              b = gh(p.x - fx * heel, p.z - fz * heel);
            return isFinite(a) && isFinite(b)
              ? clamp(Math.atan2(a - b, toe + heel), -0.45, 0.45)
              : 0;
          } catch (e) {
            return 0;
          }
        };
        const roll = (p) => {
          try {
            const a = gh(p.x + sx * side, p.z + sz * side),
              b = gh(p.x - sx * side, p.z - sz * side);
            return isFinite(a) && isFinite(b)
              ? clamp(Math.atan2(a - b, side * 2), -0.3, 0.3)
              : 0; // (+: right edge higher → +z roll lifts it)
          } catch (e) {
            return 0;
          }
        };
        pl = slope(_v1);
        pr = slope(_v2);
        rl = roll(_v1);
        rr = roll(_v2);
      }
      const k = dt > 0 ? 1 - Math.exp(-dt * 14) : 0;
      fi.l += (tl - fi.l) * k;
      fi.r += (tr - fi.r) * k;
      fi.pl = (fi.pl || 0) + (pl - (fi.pl || 0)) * k;
      fi.pr = (fi.pr || 0) + (pr - (fi.pr || 0)) * k;
      fi.rl = (fi.rl || 0) + (rl - (fi.rl || 0)) * k;
      fi.rr = (fi.rr || 0) + (rr - (fi.rr || 0)) * k;
      if (B.footL !== undefined) {
        const f = bones[B.footL];
        if (Math.abs(fi.pl) > 0.004) f.rotation.x += fi.pl;
        if (Math.abs(fi.rl) > 0.004) f.rotation.z += fi.rl;
      }
      if (B.footR !== undefined) {
        const f = bones[B.footR];
        if (Math.abs(fi.pr) > 0.004) f.rotation.x += fi.pr;
        if (Math.abs(fi.rr) > 0.004) f.rotation.z += fi.rr;
      }
      if (Math.abs(fi.l) < 0.006 && Math.abs(fi.r) < 0.006) {
        if (
          Math.abs(fi.pl) > 0.004 ||
          Math.abs(fi.pr) > 0.004 ||
          Math.abs(fi.rl) > 0.004 ||
          Math.abs(fi.rr) > 0.004
        )
          this.root.updateMatrixWorld(true);
        return;
      }
      const sy = this.root.scale.y || 1;
      const drop = Math.min(0, fi.l, fi.r);
      const hips = bones[0];
      hips.position.y += drop / sy;
      hips.updateMatrixWorld(true);
      for (const [S, d] of [
        ["L", fi.l],
        ["R", fi.r],
      ]) {
        const dy = d - drop;
        if (dy < 0.004) continue;
        const th = bones[B["thigh" + S]],
          sh = bones[B["shin" + S]],
          ft = bones[B["foot" + S]];
        // digitigrade legs (thigh → shin → METATARSAL → toes): the
        // shin + metatarsal pair is treated as one rigid lower segment (knee →
        // foot distance in the CURRENT pose); the toes take the angle
        // compensation so they stay planted flat
        const mt = B["meta" + S] !== undefined ? bones[B["meta" + S]] : null;
        const a = sh.position.length();
        let b = ft.position.length();
        if (mt) {
          sh.getWorldPosition(_fH);
          ft.getWorldPosition(_fF);
          b = _fH.distanceTo(_fF) / (sy || 1);
        }
        th.getWorldPosition(_fH);
        ft.getWorldPosition(_fF);
        const Lc = _fH.distanceTo(_fF);
        _fF.y += dy;
        const Lt = clamp(
          _fH.distanceTo(_fF),
          Math.abs(a - b) + 0.05 * a,
          (a + b) * 0.999,
        );
        const lc = clamp(Lc, Math.abs(a - b) + 0.05 * a, (a + b) * 0.999);
        const knee = (L_) =>
          Math.acos(clamp((a * a + b * b - L_ * L_) / (2 * a * b), -1, 1));
        const hipA = (L_) =>
          Math.acos(clamp((a * a + L_ * L_ - b * b) / (2 * a * L_), -1, 1));
        const dK = knee(Lt) - knee(lc),
          dA = hipA(Lt) - hipA(lc);
        th.rotation.x += dA;
        sh.rotation.x += dK;
        ft.rotation.x -= dA + dK; // (digitigrade: the toes re-level, the rigid shin+meta swings)
        th.updateMatrixWorld(true);
      }
    }

    /** Two-bone IK for ranged weapon holds (aiming, low-ready, recoil, reload). */
    _ik(dt) {
      const B = this.B;
      const hold = this.holdType;
      const armR = this.bones[B.armR],
        foreR = this.bones[B.forearmR],
        handR = this.bones[B.handR];
      let want = 0;
      const an = this.anim.name;
      if (
        this.weapon &&
        RANGED[hold] &&
        armR &&
        !this.dead &&
        !this.dismembered.rightArm &&
        this.kind === "biped"
      ) {
        want = an === "sit" || an === "work" || an === "cower" ? 0 : 1;
        if (
          this.one &&
          (this.one.name === "throw" ||
            this.one.name === "attack_melee" ||
            this.one.name === "roar" ||
            this.one.name === "leap")
        )
          want = 0;
      }
      this.ikW += (want - this.ikW) * (1 - Math.exp(-(dt || 0.016) * 10));
      if (this.ikW < 0.01 || this._camD2 > 70 * 70) return;
      const w = this.ikW;
      const s = this.scale;
      const aiming =
        this.aimFlag ||
        an === "aim" ||
        this.animT - this.lastFire < 1.8 ||
        (this.one && this.one.name === "attack_ranged");
      // frame axes from the chest bone
      const chest = this.bones[B.chest];
      chest.matrixWorld.decompose(_v1, _q1, _s1);
      this.root.getWorldQuaternion(_q2);
      _fwd.set(0, 0, -1).applyQuaternion(_q2);
      _up.set(0, 1, 0);
      armR.getWorldPosition(_v2); // right shoulder
      // aim direction
      if (aiming && this.lookTarget) {
        _v3.copy(this.lookTarget).sub(_v2).normalize();
        _fwd.lerp(_v3, 1);
        _fwd.normalize();
      } else if (aiming) {
        _fwd.applyAxisAngle(
          _right.crossVectors(_fwd, _up).normalize(),
          this.lookPitch,
        );
      }
      let pitchDown = 0,
        yawLeft = 0;
      if (!aiming) {
        pitchDown = hold === "pistol" ? 1.15 : hold === "heavy" ? 0.2 : 0.55;
        yawLeft = hold === "pistol" ? 0.1 : hold === "heavy" ? 0.05 : 0.55;
      }
      // reload: tilt the weapon
      let rel = 0;
      if (this.one && this.one.name === "reload")
        rel = Math.sin(clamp(this.one.t / this.one.dur, 0, 1) * PI);
      pitchDown += rel * 0.35;
      pitchDown -= this.recoil * 0.12;
      _right.crossVectors(_fwd, _up).normalize();
      if (yawLeft) _fwd.applyAxisAngle(_up, yawLeft);
      _right.crossVectors(_fwd, _up).normalize();
      if (pitchDown) _fwd.applyAxisAngle(_right, -pitchDown);
      _fwd.normalize();
      _up.crossVectors(_right, _fwd).normalize();
      // grip & support targets
      if (hold === "pistol") {
        if (aiming) {
          _grip
            .copy(_v2)
            .addScaledVector(_fwd, 0.48 * s)
            .addScaledVector(_right, -0.14 * s)
            .addScaledVector(_up, -0.05 * s);
          _sup
            .copy(_grip)
            .addScaledVector(_right, -0.045 * s)
            .addScaledVector(_up, -0.03 * s)
            .addScaledVector(_fwd, -0.02 * s);
        } else {
          _grip
            .copy(_v2)
            .addScaledVector(_up, -0.5 * s)
            .addScaledVector(_fwd, 0.14 * s)
            .addScaledVector(_right, 0.02 * s);
          _sup.set(NaN, 0, 0);
        }
      } else if (hold === "heavy") {
        this.bones[B.hips].getWorldPosition(_v4);
        _grip
          .copy(_v4)
          .addScaledVector(_right, 0.2 * s)
          .addScaledVector(_up, 0.3 * s)
          .addScaledVector(
            _fwd,
            Math.max(
              0.22 * s,
              ((this.meta && this.meta.chestD) || 0.13) + 0.12 * s,
            ),
          );
        _sup
          .copy(_grip)
          .addScaledVector(_fwd, 0.34 * s)
          .addScaledVector(_up, 0.12 * s)
          .addScaledVector(_right, -0.12 * s);
      } else {
        // rifle / shotgun / smg / launcher
        const cd = (this.meta && this.meta.chestD) || 0.13 * s;
        if (aiming)
          _grip
            .copy(_v2)
            .addScaledVector(_fwd, Math.max(0.2 * s, cd + 0.1 * s))
            .addScaledVector(_up, -0.09 * s)
            .addScaledVector(_right, -0.05 * s);
        else
          _grip
            .copy(_v1)
            .addScaledVector(_right, 0.12 * s)
            .addScaledVector(_up, -0.06 * s)
            .addScaledVector(_fwd, Math.max(0.24 * s, cd + 0.14 * s));
        _sup
          .copy(_grip)
          .addScaledVector(_fwd, 0.33 * s)
          .addScaledVector(_up, 0.015 * s)
          .addScaledVector(_right, -0.025 * s);
      }
      _grip.addScaledVector(_fwd, -0.06 * s * this.recoil);
      if (rel > 0 && !isNaN(_sup.x)) {
        // left hand goes to the belt pouch and back
        this.bones[B.hips].getWorldPosition(_v4);
        _v4
          .addScaledVector(_right, -0.14 * s)
          .addScaledVector(_fwd, 0.14 * s)
          .addScaledVector(_up, 0.02 * s);
        const u = clamp(this.one.t / this.one.dur, 0, 1);
        const k = smooth(0.1, 0.35, u) * (1 - smooth(0.55, 0.85, u));
        _sup.lerp(_v4, k);
      }
      // weapon frame orientation: X=right, Y=up, Z=-fwd
      _m1.makeBasis(_right, _up, _v3.copy(_fwd).negate());
      _q3.setFromRotationMatrix(_m1); // weapon world quat
      const sock = this.sockets.gripR;
      // hand world quat = Qw * inv(Qsocket)
      _q1.copy(sock.quaternion).invert();
      const handQ = _q2.copy(_q3).multiply(_q1);
      // wrist target = grip - handQ * socketPos
      _wrist.copy(sock.position).applyQuaternion(handQ);
      _wrist.subVectors(_grip, _wrist);
      // pole: elbow down & out
      _pole
        .copy(_v2)
        .addScaledVector(_right, 0.35 * s)
        .addScaledVector(_up, -0.7 * s)
        .addScaledVector(_fwd, -0.1 * s);
      L.solveIK2(
        armR,
        foreR,
        _wrist,
        _pole,
        foreR.position.length(),
        handR.position.length(),
        w,
      );
      armR.updateMatrixWorld(true);
      foreR.matrixWorld.decompose(_v4, _q1, _s1);
      _q1.invert().multiply(handQ);
      handR.quaternion.slerp(_q1, w);
      handR.updateMatrixWorld(true);
      // left (support) hand
      const armL = this.bones[B.armL],
        foreL = this.bones[B.forearmL],
        handL = this.bones[B.handL];
      if (armL && !isNaN(_sup.x) && !this.dismembered.leftArm) {
        armL.getWorldPosition(_v4);
        const sockL = this.sockets.gripL;
        _q1.copy(sockL ? sockL.quaternion : sock.quaternion).invert();
        const hq = _q2.copy(_q3).multiply(_q1);
        _wrist.copy(sockL ? sockL.position : sock.position).applyQuaternion(hq);
        _wrist.subVectors(_sup, _wrist);
        _pole
          .copy(_v4)
          .addScaledVector(_right, -0.4 * s)
          .addScaledVector(_up, -0.7 * s);
        L.solveIK2(
          armL,
          foreL,
          _wrist,
          _pole,
          foreL.position.length(),
          handL.position.length(),
          w,
        );
        armL.updateMatrixWorld(true);
        foreL.matrixWorld.decompose(_v4, _q1, _s1);
        _q1.invert().multiply(hq);
        handL.quaternion.slerp(_q1, w);
        handL.updateMatrixWorld(true);
      }
    }

    // ---------------------------------------------------------------
    // Face API (no-ops on faceless rigs: robots, creatures, exo-rig helmets)
    // ---------------------------------------------------------------
    /** Lip-sync a line: opts {emotion, rate, utterance, dur}. Returns the estimated duration (s). */
    say(text, opts) {
      if (!this.face) {
        this.playOneShot("talk");
        return 0;
      }
      this.ensureFaceTexture(true);
      return this.face.say(text, opts);
    }
    /** Wordless mouth movement (barks, grunts) for `sec` seconds. */
    babble(sec) {
      if (this.face) this.face.babble(sec);
    }
    stopTalking() {
      if (this.face) this.face.stop();
    }
    isTalking() {
      return !!(this.face && this.face.isTalking());
    }
    /** Expression: neutral|happy|angry|afraid|sad|surprised|disgust|pain|maniac|smug (k 0..1, hold seconds). */
    setExpression(name, k, hold) {
      if (this.face) this.face.setEmotion(name, k, hold);
    }
    /** Resting mood the face returns to (k 0..1). */
    setMood(name, k) {
      if (this.face) this.face.setMood(name, k);
    }
    /** Eye contact: Vector3 | Object3D | null. */
    lookAtEyes(t) {
      if (this.face) this.face.focusOn(t);
    }
    /** Upgrade this character's face from the generic map to its own painted face texture. */
    ensureFaceTexture(force, d2) {
      if (!this.face || !L.faceTexFor) return;
      const t = L.faceTexFor(this.tpl, force, d2);
      const U = this.material.userData.uniforms;
      if (t && U.uFaceMap.value !== t) U.uFaceMap.value = t;
    }

    dispose() {
      if (this.disposed) return;
      if (this._far) this._farExit();
      this.disposed = true;
      LIVE.delete(this);
      if (this.weapon && this.weapon.parent)
        this.weapon.parent.remove(this.weapon);
      for (const st of this._stumps) {
        if (st.geometry && !st.geometry.userData.shared) st.geometry.dispose();
      }
      if (this.root.parent) this.root.parent.remove(this.root);
      this.material.dispose();
      this.skeleton.dispose();
      this.tpl.users = Math.max(0, (this.tpl.users || 1) - 1);
      if (L.templates.size > L.MAX_TEMPLATES) L.evictTemplates();
    }
  }
  L.Character = Character;
  Object.defineProperty(Character.prototype, "meta", {
    get() {
      return this.tpl.meta;
    },
  });

  /** Ray vs capsule (segment a-b radius r). Returns t or null. */
  function rayCapsule(o, d, a, b, r) {
    // closest points between ray (o + t d) and segment (a + s (b-a))
    const bax = b.x - a.x,
      bay = b.y - a.y,
      baz = b.z - a.z;
    const oax = o.x - a.x,
      oay = o.y - a.y,
      oaz = o.z - a.z;
    const baba = bax * bax + bay * bay + baz * baz;
    const bard = bax * d.x + bay * d.y + baz * d.z;
    const baoa = bax * oax + bay * oay + baz * oaz;
    const rdoa = d.x * oax + d.y * oay + d.z * oaz;
    const oaoa = oax * oax + oay * oay + oaz * oaz;
    const aa = baba - bard * bard;
    let bb = baba * rdoa - baoa * bard;
    let cc = baba * oaoa - baoa * baoa - r * r * baba;
    let h = bb * bb - aa * cc;
    if (aa > 1e-9 && h >= 0) {
      const t = (-bb - Math.sqrt(h)) / aa;
      const y = baoa + t * bard;
      if (y > 0 && y < baba) return t;
    }
    // end domes (spheres)
    let best = null;
    for (const c of [a, b]) {
      const ocx = o.x - c.x,
        ocy = o.y - c.y,
        ocz = o.z - c.z;
      bb = ocx * d.x + ocy * d.y + ocz * d.z;
      cc = ocx * ocx + ocy * ocy + ocz * ocz - r * r;
      h = bb * bb - cc;
      if (h >= 0) {
        const t = -bb - Math.sqrt(h);
        if (best === null || t < best) best = t;
      }
    }
    return best;
  }
  L.rayCapsule = rayCapsule;

  // ------------------------------------------------------------------
  // Gibs: severed limbs, gore chunks, stumps, ash piles / goo puddles
  // ------------------------------------------------------------------
  const GIBS = (L.gibs = { list: [], max: 90 });
  let chunkGeo = null,
    stumpGeo = null;
  function chunkGeometry() {
    if (chunkGeo) return chunkGeo;
    const g = new THREE.IcosahedronGeometry(1, 0);
    L.prim.deform(g, (v) =>
      v.multiplyScalar(0.7 + L.hash3(v.x * 13, v.y * 13, v.z * 13) * 0.6),
    );
    chunkGeo = g;
    return g;
  }
  function paintGeo(geo, color, emis, rough, metal) {
    const g = geo;
    const n = g.attributes.position.count;
    const c = L.col(color),
      col = new Float32Array(n * 3),
      pbr = new Float32Array(n * 3),
      uv = new Float32Array(n * 2),
      part = new Float32Array(n).fill(9);
    const t = L.regionUV("white", 0.5, 0.5);
    for (let i = 0; i < n; i++) {
      const k =
        0.75 +
        L.hash3(
          g.attributes.position.getX(i) * 50,
          g.attributes.position.getY(i) * 50,
          i,
        ) *
          0.5;
      col[i * 3] = c.r * k;
      col[i * 3 + 1] = c.g * k;
      col[i * 3 + 2] = c.b * k;
      pbr[i * 3] = rough;
      pbr[i * 3 + 1] = metal;
      pbr[i * 3 + 2] = emis;
      uv[i * 2] = t[0];
      uv[i * 2 + 1] = t[1];
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.setAttribute("pbr", new THREE.BufferAttribute(pbr, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setAttribute("partId", new THREE.BufferAttribute(part, 1));
    g.setAttribute("mcls", new THREE.BufferAttribute(new Float32Array(n), 1));
    return g;
  }
  // Raw stump ends: one painted geometry per gore colour, shared by every stump.
  const stumpCache = new Map();
  GIBS.stumpMesh = function (color, r, oil) {
    if (!stumpGeo) {
      stumpGeo = new THREE.SphereGeometry(1, 8, 6);
      L.prim.deform(stumpGeo, (v) => {
        v.y *= 0.55;
        v.multiplyScalar(0.85 + L.hash3(v.x * 9, v.y * 9, v.z * 9) * 0.3);
      });
    }
    const key = (oil ? "oil" : "c") + color;
    let g = stumpCache.get(key);
    if (!g) {
      g = paintGeo(
        stumpGeo.clone(),
        oil ? 0x2a2a28 : color,
        oil ? 0 : 0.08,
        oil ? 0.4 : 0.35,
        oil ? 0.6 : 0,
      );
      g.userData.shared = true;
      stumpCache.set(key, g);
    }
    const m = new THREE.Mesh(g, L.sharedMaterial());
    m.scale.setScalar(r);
    m.name = "stump";
    return m;
  };

  // ------------------------------------------------------------------
  // Gore chunks: ONE InstancedMesh per chunk kind (flesh / bone / metal),
  // so a full-body burst costs no new geometry and ≤3 draw calls.
  // ------------------------------------------------------------------
  const POOL_SIZE = 72;
  const POOL_KINDS = {
    flesh: { rough: 0.35, metal: 0, emis: 0.02 },
    bone: { rough: 0.55, metal: 0, emis: 0 },
    metal: { rough: 0.5, metal: 0.7, emis: 0 },
  };
  const pools = {};
  const _zeroM = new THREE.Matrix4().makeScale(0, 0, 0);
  const _pc = new THREE.Color();
  function pool(kind) {
    let P = pools[kind];
    if (P && P.mesh.parent) return P;
    if (!P) {
      const d = POOL_KINDS[kind];
      const g = paintGeo(
        chunkGeometry().clone(),
        0xffffff,
        d.emis,
        d.rough,
        d.metal,
      );
      const mesh = new THREE.InstancedMesh(g, L.sharedMaterial(), POOL_SIZE);
      mesh.name = "gorePool:" + kind;
      mesh.frustumCulled = false;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let i = 0; i < POOL_SIZE; i++) {
        mesh.setMatrixAt(i, _zeroM);
        mesh.setColorAt(i, _pc.setRGB(1, 1, 1));
      }
      P = pools[kind] = { mesh, free: [], used: new Map(), dirty: true };
      for (let i = POOL_SIZE - 1; i >= 0; i--) P.free.push(i);
    }
    if (G.scene && !P.mesh.parent) G.scene.add(P.mesh);
    return P;
  }
  function takeSlot(P) {
    if (P.free.length) return P.free.pop();
    // pool full: recycle the oldest chunk of this kind
    let oldest = null;
    for (const g of P.used.values())
      if (!oldest || g.age > oldest.age) oldest = g;
    if (oldest) {
      const s = oldest.slot;
      GIBS.remove(oldest, true);
      P.free = P.free.filter((x) => x !== s);
      return s;
    }
    return 0;
  }

  /** Add a physics-driven gib (Object3D) to the world. o.pool → instanced chunk. */
  GIBS.add = function (obj, vel, life, o) {
    o = o || {};
    if (!o.pool && !obj.parent && G.scene) G.scene.add(obj);
    const g = {
      obj,
      vel: vel.clone(),
      ang: new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14,
      ),
      life,
      age: 0,
      radius: o.radius || 0.06,
      keep: !!o.keep,
      rest: false,
      bleed: o.bleed ? 0.8 : 0,
      pool: o.pool || null,
      slot: -1,
    };
    if (g.pool) {
      g.slot = takeSlot(g.pool);
      g.pool.used.set(g.slot, g);
      g.pool.mesh.visible = true;
      g.pool.mesh.setColorAt(g.slot, o.color || _pc.setRGB(1, 1, 1));
      if (g.pool.mesh.instanceColor)
        g.pool.mesh.instanceColor.needsUpdate = true;
    }
    GIBS.list.push(g);
    while (GIBS.list.length > GIBS.max) {
      const old =
        GIBS.list.find((x) => !x.keep && !x.pool) ||
        GIBS.list.find((x) => !x.keep) ||
        GIBS.list[0];
      GIBS.remove(old);
    }
    return g;
  };
  GIBS.remove = function (g, keepSlotBusy) {
    const i = GIBS.list.indexOf(g);
    if (i >= 0) GIBS.list.splice(i, 1);
    if (g.pool) {
      if (g.slot >= 0 && g.pool.used.get(g.slot) === g) {
        g.pool.used.delete(g.slot);
        g.pool.mesh.setMatrixAt(g.slot, _zeroM);
        g.pool.dirty = true;
        if (!keepSlotBusy) g.pool.free.push(g.slot);
        // no live chunks of this kind: stop drawing the pool (no idle draw call / vertex work)
        if (!g.pool.used.size && !keepSlotBusy) g.pool.mesh.visible = false;
      }
      return;
    }
    if (!g.keep) {
      if (g.obj.parent) g.obj.parent.remove(g.obj);
      g.obj.traverse((o) => {
        if (
          o.geometry &&
          o.geometry !== chunkGeo &&
          !o.geometry.userData.shared
        )
          o.geometry.dispose();
      });
    }
  };
  /** Spray of meat/bone (or metal) chunks — instanced. Returns lightweight Object3D handles. */
  GIBS.chunks = function (pos, n, color, dir, metal, scale) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const bone = !metal && Math.random() < 0.25;
      const P = pool(metal ? "metal" : bone ? "bone" : "flesh");
      const col = L.col(
        metal
          ? L.mix(0x5a5a58, 0x2a2a28, Math.random())
          : bone
            ? 0xd8ceb0
            : L.mix(color, 0x8a1a10, Math.random() * 0.4),
      );
      const m = new THREE.Object3D();
      const s = (0.04 + Math.random() * 0.07) * (scale || 1);
      m.scale.set(s * (bone ? 0.5 : 1), s * (bone ? 1.8 : 1), s);
      m.position
        .copy(pos)
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
          ),
        );
      m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        2 + Math.random() * 5,
        (Math.random() - 0.5) * 6,
      );
      if (dir) v.addScaledVector(dir, 3 + Math.random() * 4);
      const g = GIBS.add(m, v, 8 + Math.random() * 10, {
        radius: s,
        bleed: !metal,
        pool: P,
        color: col,
      });
      m.updateMatrix();
      P.mesh.setMatrixAt(g.slot, m.matrix);
      P.mesh.instanceMatrix.needsUpdate = true;
      out.push(m);
    }
    return out;
  };
  /** Ash pile or glowing goo puddle left by energy-weapon disintegration. */
  GIBS.remains = function (ch, kind) {
    const geo = new THREE.SphereGeometry(1, 12, 6, 0, PI * 2, 0, PI / 2);
    L.prim.deform(geo, (v) => {
      const n = L.noise3(v.x * 3, 0, v.z * 3);
      v.y *= 0.35 * (0.6 + n * 0.8);
      v.x *= 1 + (n - 0.5) * 0.4;
    });
    const goo = kind === "goo";
    paintGeo(geo, goo ? 0x3aa020 : 0x4a4640, goo ? 0.9 : 0, goo ? 0.25 : 1, 0);
    const m = new THREE.Mesh(geo, L.sharedMaterial());
    const r = 0.45 * ch.scale * (ch.kind === "biped" ? 1 : 0.8);
    m.scale.set(r * 1.3, goo ? r * 0.25 : r * 0.6, r);
    ch.getPartWorldPos("torso", m.position);
    const gh =
      G.world && G.world.groundHeight
        ? G.world.groundHeight(m.position.x, m.position.z, m.position.y + 0.5)
        : ch.root.position.y;
    m.position.y = gh;
    m.name = goo ? "goo_puddle" : "ash_pile";
    G.scene.add(m);
    GIBS.add(m, new THREE.Vector3(), 90, { radius: 0 }).rest = true;
    return m;
  };
  GIBS.update = function (dt) {
    if (dt <= 0) return;
    const W = G.world;
    for (let i = GIBS.list.length - 1; i >= 0; i--) {
      const g = GIBS.list[i];
      g.age += dt;
      if (!g.keep && g.age > g.life) {
        // sink & shrink out
        g.obj.scale.multiplyScalar(Math.max(0, 1 - dt * 2));
        if (g.pool) {
          g.obj.updateMatrix();
          g.pool.mesh.setMatrixAt(g.slot, g.obj.matrix);
          g.pool.dirty = true;
        }
        if (g.age > g.life + 1.2) GIBS.remove(g);
        continue;
      }
      if (g.rest) continue;
      const o = g.obj;
      g.vel.y -= 16 * dt;
      o.position.addScaledVector(g.vel, dt);
      o.rotation.x += g.ang.x * dt;
      o.rotation.y += g.ang.y * dt;
      o.rotation.z += g.ang.z * dt;
      const gh =
        W && W.groundHeight
          ? W.groundHeight(o.position.x, o.position.z, o.position.y + 0.3)
          : 0;
      if (o.position.y - g.radius < gh) {
        o.position.y = gh + g.radius;
        if (g.vel.y < 0) g.vel.y *= -0.3;
        g.vel.x *= 0.55;
        g.vel.z *= 0.55;
        g.ang.multiplyScalar(0.5);
        if (g.bleed > 0 && !G.isStub("fx") && G.fx.decal) {
          try {
            G.fx.decal(
              new THREE.Vector3(o.position.x, gh + 0.01, o.position.z),
              new THREE.Vector3(0, 1, 0),
              "blood",
            );
          } catch (e) {
            /* optional */
          }
          g.bleed = 0;
        }
        if (Math.abs(g.vel.y) < 0.6 && g.vel.lengthSq() < 0.3) g.rest = true;
      }
      if (g.pool) {
        o.updateMatrix();
        g.pool.mesh.setMatrixAt(g.slot, o.matrix);
        g.pool.dirty = true;
      }
    }
    for (const k in pools) {
      const P = pools[k];
      if (P.dirty) {
        P.mesh.instanceMatrix.needsUpdate = true;
        P.dirty = false;
      }
    }
  };
  GIBS.clear = function () {
    for (const g of GIBS.list.slice()) {
      g.keep = false;
      GIBS.remove(g);
    }
  };

  // ------------------------------------------------------------------
  // PLAYER ARMS (first-person, for the weapons module)
  // ------------------------------------------------------------------
  /**
   * Returns {root, bones:{shoulderL/R, armL/R, forearmL/R, handL/R}, gripR, gripL,
   *          solve(rightGripWorld, leftGripWorld|null, weaponQuatWorld), mesh}
   * Arms are built along -Z from the root (camera space): padded grey-white cryo-suit sleeves with
   * orange cuffs, bare wrists (no wrist device: the VIGIL goggles are the hero's interface).
   */
  C.createPlayerArms = function (opts) {
    opts = opts || {};
    const H = L.human;
    const b = H.proportions(opts.gender || "m", { scale: 1 });
    // viewmodel arms are traditionally stretched so hands reach a weapon held in front of the camera
    const reach = opts.reach || 1.35;
    b.upper *= reach;
    b.fore *= reach;
    const R = new L.Rig("arms");
    R.bone("root", null, 0, 0, 0, "torso");
    for (const [S, sg, part] of [
      ["L", -1, "leftArm"],
      ["R", 1, "rightArm"],
    ]) {
      R.bone("arm" + S, "root", sg * 0.19, -0.22, 0.08, part);
      R.bone("forearm" + S, "arm" + S, 0, -b.upper, 0, part);
      R.bone("hand" + S, "forearm" + S, 0, -b.fore, 0, part);
      const outfit = opts.outfit || "cryo_suit";
      const sleeve =
        outfit === "cryo_suit" ? L.PAL.cryoGrey : opts.sleeveColor || 0x4a4234;
      H.arm(R, b, S, {
        sleeve: "long",
        sleeveColor: sleeve,
        skin: opts.skinTone || L.SKIN.fair,
        glove: opts.glove || null,
        cuff: outfit === "cryo_suit" ? L.PAL.cryoOrange : null,
      });
    }
    R.socket("gripR", "handR", 0, -0.075, -0.01, -PI / 2, 0, 0);
    R.socket("gripL", "handL", 0, -0.075, -0.01, -PI / 2, 0, 0);
    const tpl = R.build();
    const root = new THREE.Group();
    root.name = "playerArms";
    const bones = tpl.bones.map((d) => {
      const bn = new THREE.Bone();
      bn.name = d.name;
      bn.position.set(d.pos[0], d.pos[1], d.pos[2]);
      return bn;
    });
    tpl.bones.forEach((d, i) => {
      if (d.parent >= 0) bones[d.parent].add(bones[i]);
      else root.add(bones[i]);
    });
    root.updateMatrixWorld(true);
    const sk = new THREE.Skeleton(bones);
    const mat = L.makeMaterial();
    const mesh = new THREE.SkinnedMesh(tpl.geometry, mat);
    mesh.frustumCulled = false;
    root.add(mesh);
    mesh.bind(sk);
    const map = {};
    bones.forEach((bn) => (map[bn.name] = bn));
    const sockets = {};
    for (const k in tpl.sockets) {
      const s = tpl.sockets[k];
      const o = new THREE.Object3D();
      o.position.set(s.pos[0], s.pos[1], s.pos[2]);
      o.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
      bones[s.bone].add(o);
      sockets[k] = o;
    }
    // scratch objects reused by solve() every frame (no per-frame allocation)
    const aHq = new THREE.Quaternion(),
      aRq = new THREE.Quaternion(),
      aWrist = new THREE.Vector3(),
      aSh = new THREE.Vector3(),
      aPole = new THREE.Vector3(),
      aOff = new THREE.Vector3();
    const arms = {
      root,
      mesh,
      bones: map,
      gripR: sockets.gripR,
      gripL: sockets.gripL,
      material: mat,
      /** Place hands so the weapon grip (and optional support point) land on world targets. */
      solve(rightGrip, leftGrip, weaponQuat, poleR, poleL) {
        root.updateMatrixWorld(true);
        const side = (S, target, sock) => {
          if (!target) return;
          const A1 = map["arm" + S],
            B1 = map["forearm" + S],
            H1 = map["hand" + S];
          const hq = aHq;
          if (weaponQuat)
            hq.copy(weaponQuat).multiply(_q1.copy(sock.quaternion).invert());
          else root.getWorldQuaternion(hq);
          const wrist = aWrist.copy(sock.position).applyQuaternion(hq);
          wrist.subVectors(target, wrist);
          const sh = A1.getWorldPosition(aSh);
          const pole =
            (S === "R" ? poleR : poleL) ||
            aPole
              .copy(sh)
              .add(
                aOff
                  .set(S === "R" ? 0.4 : -0.4, -0.6, 0.2)
                  .applyQuaternion(root.getWorldQuaternion(aRq)),
              );
          L.solveIK2(
            A1,
            B1,
            wrist,
            pole,
            B1.position.length(),
            H1.position.length(),
            1,
          );
          A1.updateMatrixWorld(true);
          B1.getWorldQuaternion(_q2);
          H1.quaternion.copy(_q2.invert().multiply(hq));
          H1.updateMatrixWorld(true);
        };
        side("R", rightGrip, sockets.gripR);
        side("L", leftGrip, sockets.gripL);
      },
      dispose() {
        if (root.parent) root.parent.remove(root);
        mat.dispose();
        sk.dispose();
      },
    };
    return arms;
  };

  // ------------------------------------------------------------------
  // CROWD FAR TIER & SHADOW BUDGET (driven from the module's lateUpdate)
  // ------------------------------------------------------------------
  const FAR = (L.far = {
    budget: 24, // crowd members animated with full skinned rigs (nearest first)
    dist: 42, // beyond this a standing crowd member becomes a frozen instance
    shadows: 12, // characters casting shadows (nearest first, < 60 m)
    pools: new Map(),
    dirty: false,
    frame: 0,
  });
  const _fm = new THREE.Matrix4(),
    _fInv = new THREE.Matrix4(),
    _fv = new THREE.Vector3(),
    _fn = new THREE.Vector3(),
    _fc = new THREE.Color();
  /** Bake the character's CURRENT pose of its far LOD into a static root-space geometry. */
  function bakePose(ch) {
    const src = L.getLod(ch.tpl, 2);
    const pa = src.attributes.position,
      na = src.attributes.normal,
      si = src.attributes.skinIndex,
      sw = src.attributes.skinWeight;
    if (!pa || !si || !sw) return null;
    ch.root.updateMatrixWorld(true);
    ch.skeleton.update();
    _fInv
      .copy(ch.root.matrixWorld)
      .invert()
      .multiply(ch.mesh.matrixWorld)
      .multiply(ch.mesh.bindMatrixInverse);
    const nb = ch.bones.length,
      BM = new Float32Array(nb * 16),
      bm = ch.skeleton.boneMatrices;
    for (let i = 0; i < nb; i++) {
      _fm
        .fromArray(bm, i * 16)
        .premultiply(_fInv)
        .multiply(ch.mesh.bindMatrix);
      BM.set(_fm.elements, i * 16);
    }
    const n = pa.count,
      P3 = new Float32Array(n * 3),
      N3 = new Float32Array(n * 3),
      e = new Float32Array(16);
    for (let v = 0; v < n; v++) {
      e.fill(0);
      for (let j = 0; j < 4; j++) {
        const w = sw.getComponent(v, j);
        if (w <= 0) continue;
        const o = si.getComponent(v, j) * 16;
        for (let q = 0; q < 16; q++) e[q] += BM[o + q] * w;
      }
      const x = pa.getX(v),
        y = pa.getY(v),
        z = pa.getZ(v);
      P3[v * 3] = e[0] * x + e[4] * y + e[8] * z + e[12];
      P3[v * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
      P3[v * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
      const nx = na.getX(v),
        ny = na.getY(v),
        nz = na.getZ(v);
      _fn
        .set(
          e[0] * nx + e[4] * ny + e[8] * nz,
          e[1] * nx + e[5] * ny + e[9] * nz,
          e[2] * nx + e[6] * ny + e[10] * nz,
        )
        .normalize();
      N3[v * 3] = _fn.x;
      N3[v * 3 + 1] = _fn.y;
      N3[v * 3 + 2] = _fn.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(P3, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(N3, 3));
    for (const k of ["uv", "color", "pbr", "partId", "mcls"])
      if (src.attributes[k]) g.setAttribute(k, src.attributes[k].clone());
    if (src.index) g.setIndex(src.index.clone());
    g.computeBoundingSphere();
    return g;
  }
  // One BATCH per parent group (street scene, interior cell): every far crowd
  // member under that parent is merged into ONE static mesh (its template's
  // baked pose, moved to the member's place and tinted with its cloth tint),
  // so a whole distant market is a single draw call. Rebuilt only when the
  // membership changes or a member is moved/hidden.
  FAR.pool = function (ch) {
    const parent = ch.root.parent;
    let P = FAR.pools.get(parent.uuid);
    if (P && P.parent !== parent) P = null;
    if (!P) {
      P = {
        key: parent.uuid,
        parent,
        mesh: null,
        mat: null,
        members: [],
        idle: 0,
        dirty: true,
      };
      FAR.pools.set(P.key, P);
    }
    const tpl = ch.tpl;
    if (!tpl._farGeo) {
      tpl._farGeo = bakePose(ch);
      if (!tpl._farGeo) return null;
      tpl.users = (tpl.users || 0) + 1; // keep the template (and its bake) alive while in use
      tpl._farRefs = 0;
    }
    tpl._farRefs = (tpl._farRefs || 0) + 1;
    P.dirty = true;
    return P;
  };
  FAR.release = function (ch) {
    const tpl = ch.tpl;
    if (tpl && tpl._farGeo && --tpl._farRefs <= 0) {
      tpl._farGeo.dispose();
      tpl._farGeo = null;
      tpl.users = Math.max(0, (tpl.users || 1) - 1);
    }
  };
  const _bm = new THREE.Matrix4(),
    _bn = new THREE.Matrix3();
  function rebuildBatch(P) {
    const list = P.members.filter(
      (ch) =>
        ch.root.parent === P.parent &&
        !ch.hidden &&
        ch.root.visible &&
        ch.tpl._farGeo,
    );
    let nv = 0,
      ni = 0;
    for (const ch of list) {
      const g = ch.tpl._farGeo;
      nv += g.attributes.position.count;
      ni += g.index ? g.index.count : g.attributes.position.count;
    }
    if (P.mesh) {
      P.mesh.geometry.dispose();
      P.mesh.visible = false;
    }
    if (!nv) return;
    const pos = new Float32Array(nv * 3),
      nor = new Float32Array(nv * 3),
      col = new Float32Array(nv * 3),
      uv = new Float32Array(nv * 2),
      pbr = new Float32Array(nv * 3),
      part = new Float32Array(nv),
      cls = new Float32Array(nv);
    const idx = new Uint32Array(ni);
    let vo = 0,
      io = 0;
    for (const ch of list) {
      const g = ch.tpl._farGeo,
        n = g.attributes.position.count;
      ch.root.updateMatrix();
      _bm.copy(ch.root.matrix);
      _bn.getNormalMatrix(_bm);
      const e = _bm.elements,
        ne = _bn.elements;
      const P3 = g.attributes.position.array,
        N3 = g.attributes.normal.array,
        C3 = g.attributes.color ? g.attributes.color.array : null;
      const t = ch.material.userData.uniforms.uTints.value[1],
        k = ch.material.userData.uniforms.uTints.value[2];
      for (let i = 0; i < n; i++) {
        const x = P3[i * 3],
          y = P3[i * 3 + 1],
          z = P3[i * 3 + 2],
          o = (vo + i) * 3;
        pos[o] = e[0] * x + e[4] * y + e[8] * z + e[12];
        pos[o + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
        pos[o + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
        const a = N3[i * 3],
          b = N3[i * 3 + 1],
          c = N3[i * 3 + 2];
        nor[o] = ne[0] * a + ne[3] * b + ne[6] * c;
        nor[o + 1] = ne[1] * a + ne[4] * b + ne[7] * c;
        nor[o + 2] = ne[2] * a + ne[5] * b + ne[8] * c;
        const cl = g.attributes.mcls ? g.attributes.mcls.array[i] : 0,
          tt = cl === 1 ? t : cl === 2 ? k : null;
        const r = C3 ? C3[i * 3] : 1,
          gg = C3 ? C3[i * 3 + 1] : 1,
          bb = C3 ? C3[i * 3 + 2] : 1;
        col[o] = tt ? r * tt.r : r;
        col[o + 1] = tt ? gg * tt.g : gg;
        col[o + 2] = tt ? bb * tt.b : bb;
      }
      if (g.attributes.uv) uv.set(g.attributes.uv.array, vo * 2);
      if (g.attributes.pbr) pbr.set(g.attributes.pbr.array, vo * 3);
      if (g.attributes.partId) part.set(g.attributes.partId.array, vo);
      if (g.attributes.mcls) {
        const m = g.attributes.mcls.array;
        for (let i = 0; i < n; i++)
          cls[vo + i] = m[i] === 1 || m[i] === 2 ? 0 : m[i];
      } // tint already baked
      if (g.index) {
        const ia = g.index.array;
        for (let i = 0; i < ia.length; i++) idx[io++] = ia[i] + vo;
      } else for (let i = 0; i < n; i++) idx[io++] = vo + i;
      vo += n;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setAttribute("pbr", new THREE.BufferAttribute(pbr, 3));
    geo.setAttribute("partId", new THREE.BufferAttribute(part, 1));
    geo.setAttribute("mcls", new THREE.BufferAttribute(cls, 1));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeBoundingSphere();
    if (!P.mat) {
      P.mat = L.makeMaterial();
      P.mat.userData.uniforms.uDirt.value = 0.35;
    }
    if (!P.mesh) {
      P.mesh = new THREE.Mesh(geo, P.mat);
      P.mesh.name = "charFarCrowd";
      P.mesh.castShadow = false;
      P.mesh.receiveShadow = true;
      P.mesh.matrixAutoUpdate = false;
      P.parent.add(P.mesh);
    } else P.mesh.geometry = geo;
    P.mesh.visible = true;
    // remember where everyone was baked (moved / hidden → rebuild)
    for (const ch of P.members) {
      const q = ch.root.position;
      ch._farAt = [
        q.x,
        q.y,
        q.z,
        ch.root.rotation.y,
        ch.hidden || !ch.root.visible ? 1 : 0,
      ];
    }
  }
  /**
   * Is the character actually rendered? (not disposed / hidden, root visible
   * and every ancestor visible up to a scene — an interior cell whose root is
   * hidden hides its NPCs too).
   */
  L.charShown = function (ch) {
    if (ch.disposed || ch.hidden || !ch.root.visible) return false;
    let o = ch.root.parent,
      n = 0;
    while (o && n++ < 48) {
      if (!o.visible) return false;
      if (o.isScene || !o.parent) return !!o.isScene;
      o = o.parent;
    }
    return false;
  };
  /**
   * Fresh horizontal camera distance² for budget ranking (Infinity when not
   * rendered). _camD2 is only refreshed while a character ticks, so hidden /
   * detached ones keep a stale (often tiny) value from when the player was near.
   */
  function visD2(ch, cam) {
    if (!cam || !L.charShown(ch)) return Infinity;
    let x, z;
    if (ch.root.parent === G.scene) {
      x = ch.root.position.x;
      z = ch.root.position.z;
    } else {
      const e = ch.root.matrixWorld.elements;
      x = e[12];
      z = e[14];
    }
    const dx = x - cam.x,
      dz = z - cam.z;
    return dx * dx + dz * dz;
  }
  /** Per-frame: far-tier decisions (every few frames), batch rebuilds, shadow budget. */
  L.crowdUpdate = function () {
    const cam = G.camera ? G.camera.position : null;
    FAR.frame++;
    // refresh the rendered-distance cache every other frame (used by the live /
    // shadow budgets below and by the face prefetch in 90_module)
    if (FAR.frame % 2 === 0) for (const ch of LIVE) ch._visD2 = visD2(ch, cam);
    if (cam && FAR.frame % 6 === 0) {
      // ---- decide who is far (hidden members never take a live slot) ----
      const crowd = [];
      for (const ch of LIVE)
        if (ch.crowd && !ch.disposed && ch.root.parent) crowd.push(ch);
      for (const ch of crowd)
        if (ch._visD2 === undefined) ch._visD2 = visD2(ch, cam);
      crowd.sort((a, b) =>
        a._visD2 === b._visD2 ? 0 : a._visD2 < b._visD2 ? -1 : 1,
      );
      const d2far = FAR.dist * FAR.dist,
        d2near = (FAR.dist - 4) * (FAR.dist - 4);
      crowd.forEach((ch, rank) => {
        const d2 = ch._visD2;
        const idle =
          !ch.dead &&
          !ch.one &&
          !ch._getup &&
          !ch._dissolve &&
          !ch.hidden &&
          ch.root.visible &&
          ch.speedM < 0.2 &&
          !(ch.face && ch.face.isTalking && ch.face.isTalking()) &&
          ch._posed;
        const over = rank >= FAR.budget && d2 > 18 * 18;
        if (ch._far) {
          if (!idle || (d2 < d2near && !over)) ch._farExit();
          else if (ch._farAt) {
            const q = ch.root.position,
              f = ch._farAt;
            if (
              Math.abs(q.x - f[0]) +
                Math.abs(q.y - f[1]) +
                Math.abs(q.z - f[2]) >
                0.05 ||
              Math.abs(ch.root.rotation.y - f[3]) > 0.02
            )
              ch._far.dirty = true;
          }
        } else if (idle && (d2 > d2far || over) && ch.autoFar !== false)
          ch._farEnter();
      });
    }
    for (const [key, P] of FAR.pools) {
      if (!P.members.length) {
        if (P.mesh) P.mesh.visible = false;
        if (++P.idle > 600) {
          // unused ~10 s: free it
          if (P.mesh) {
            P.parent.remove(P.mesh);
            P.mesh.geometry.dispose();
          }
          if (P.mat) P.mat.dispose();
          FAR.pools.delete(key);
        }
        continue;
      }
      P.idle = 0;
      // hidden/shown members (interiors toggling actors) → rebuild
      if (!P.dirty && FAR.frame % 6 === 3)
        for (const ch of P.members) {
          const h = ch.hidden || !ch.root.visible ? 1 : 0;
          if (!ch._farAt || ch._farAt[4] !== h) {
            P.dirty = true;
            break;
          }
        }
      if (P.dirty) {
        P.dirty = false;
        rebuildBatch(P);
      }
    }
    // ---- shadow budget: only the N nearest characters cast shadows ----
    if (FAR.frame % 4 === 0) {
      const cand = [];
      for (const ch of LIVE) {
        if (ch.disposed || !ch.root.parent || ch._far) continue;
        if (ch._visD2 === undefined) ch._visD2 = visD2(ch, cam);
        const d2 = ch._visD2;
        if (d2 === Infinity) {
          ch._shadowOk = false;
          ch.mesh.castShadow = false;
        } // hidden (interior cell / hidden rig): no slot
        else if (d2 < 3600) cand.push(ch);
        else ch._shadowOk = true;
      }
      if (cand.length > FAR.shadows) cand.sort((a, b) => a._visD2 - b._visD2);
      for (let i = 0; i < cand.length; i++) {
        const ok = i < FAR.shadows;
        cand[i]._shadowOk = ok;
        if (!ok) cand[i].mesh.castShadow = false;
      }
    }
  };
  /**
   * Budgets for crowded places: {live, farDist, shadows} or a number (= live).
   * live: crowd members animated at full rig (nearest first; the rest freeze
   * into the per-scene far batch once > 18 m away); farDist: distance beyond
   * which standing crowd members always freeze; shadows: shadow casters.
   */
  C.setCrowdBudget = function (o) {
    if (typeof o === "number") o = { live: o };
    o = o || {};
    if (o.live !== undefined) FAR.budget = Math.max(0, o.live | 0);
    if (o.farDist !== undefined)
      FAR.dist = Math.max(12, Number(o.farDist) || 42);
    if (o.shadows !== undefined) FAR.shadows = Math.max(0, o.shadows | 0);
    return { live: FAR.budget, farDist: FAR.dist, shadows: FAR.shadows };
  };
  C.crowdStats = function () {
    let far = 0,
      pools = 0;
    for (const [, P] of FAR.pools) {
      far += P.members.length;
      if (P.members.length && P.mesh && P.mesh.visible) pools++;
    }
    let crowd = 0,
      shadows = 0;
    for (const ch of LIVE) {
      if (ch.crowd && !ch.disposed) crowd++;
      if (ch.mesh.castShadow && ch.mesh.visible && ch.root.parent) shadows++;
    }
    return {
      crowd,
      far,
      farDrawCalls: pools,
      shadowCasters: shadows,
      budget: FAR.budget,
      farDist: FAR.dist,
      shadowBudget: FAR.shadows,
    };
  };

  /** Build (or bump) the shared template a create(type, opts) would use — no Character. */
  L.warmTemplate = function (type, opts) {
    const r = resolveType(type, opts || {});
    if (!r || !L.infos[r.base]) return null;
    return templateFor(r.base, r.opts).tpl;
  };

  // ------------------------------------------------------------------
  // PUBLIC API
  // ------------------------------------------------------------------
  C.create = function (type, opts) {
    opts = opts || {};
    let r = resolveType(type, opts);
    let info = r && L.infos[r.base];
    if (!info) {
      // Unknown type (typo / not-yet-supported creature): never throw — warn once and
      // build the closest known body plan so quests & landmarks still get an actor.
      warnUnknown(type, "create");
      r = resolveType(fallbackType(type), opts);
      info = r && L.infos[r.base];
      if (!info) {
        r = {
          base: "human",
          opts: Object.assign({}, opts, { outfit: "settler" }),
        };
        info = L.infos.human;
      }
    }
    const tf = templateFor(r.base, r.opts);
    const tpl = tf.tpl,
      seed = tf.seed;
    if (tf.ratios.skin || tf.ratios.hair) r.opts._ratios = tf.ratios;
    const ch = new Character(String(type), r.base, tpl, info, r.opts, seed);
    if (opts.addToScene !== false && G.scene) G.scene.add(ch.root);
    if (opts.pos)
      ch.root.position.set(opts.pos.x || 0, opts.pos.y || 0, opts.pos.z || 0);
    if (opts.yaw !== undefined) ch.root.rotation.y = opts.yaw;
    ch._lastPos.set(NaN, 0, 0);
    if (opts.anim) ch.setAnim(opts.anim, { inPlace: !!opts.inPlace });
    if (opts.weapon && opts.weapon.isObject3D)
      ch.setWeapon(opts.weapon, opts.hold);
    else if (
      typeof opts.weapon === "string" &&
      !G.isStub("weapons") &&
      G.weapons.createWorldModel
    ) {
      try {
        const w = G.weapons.createWorldModel(opts.weapon);
        if (w) {
          w.userData.weaponId = w.userData.weaponId || opts.weapon;
          ch.setWeapon(w, opts.hold);
        }
      } catch (e) {
        /* weapons optional */
      }
    }
    return ch;
  };
  const PUBLIC_TYPES = [
    "human",
    "raider",
    "continuity_soldier",
    "continuity_officer",
    "covenant_warden",
    "covenant_lancer",
    "maniac",
    "maniac_bruiser",
    "brute",
    "colossus",
    "ripjaw",
    "giant_roach",
    "burrow_rat",
    "gasfly",
    "shellback",
    "shellback_matriarch",
    "shellback_stalker",
    "shellback_spawn",
    "dog",
    "patrolman",
    "valet",
    "valet_m",
    "sky_eye",
    "bulwark",
    "stinger",
    "giant_stinger",
    "small_stinger",
    "giant_ant",
    "fire_ant",
    "ash_bear",
    "lurcher",
    "pack_ox",
    "thinker",
    "striker",
    "coyote",
    "stag",
    "crawler",
    "sandhog",
  ];
  C.types = function () {
    return PUBLIC_TYPES.filter((t) => {
      const r = resolveType(t, {});
      return !!(r && L.infos[r.base]);
    });
  };
  C.outfits = function () {
    return HUMAN_OUTFITS.slice();
  };
  /** Story cast presets (named characters + Glowkeeper / Unkindled ranks): [{id, name, desc, variants, ranked}]. */
  C.cast = function () {
    return L.CAST
      ? Object.keys(L.CAST).map((id) => {
          const c = L.CAST[id];
          return {
            id,
            name: c.name,
            desc: c.desc,
            variants: (c.variants || []).slice(),
            ranked: !!c.ranked,
          };
        })
      : [];
  };
  C.info = function (type) {
    const r = resolveType(type, {});
    const inf = r && L.infos[r.base];
    if (!inf) {
      warnUnknown(type, "info");
      return null;
    }
    const power =
      r.opts.outfit === "covenant_exo_rig" ||
      r.opts.outfit === "continuity_exo_rig";
    return {
      type: String(type),
      base: r.base,
      kind: inf.kind,
      height: power ? 2.02 : inf.height,
      radius: power ? 0.45 : inf.radius,
      gore: inf.gore || "red",
      parts: inf.parts.slice(),
      labels: Object.assign({}, inf.labels),
      isRobot: !!inf.isRobot,
      isCreature: !!inf.isCreature,
      hover: inf.hover || 0,
      walkSpeed: inf.gait ? inf.gait.walkSpeed : 1.6,
      runSpeed: inf.gait ? inf.gait.runSpeed : 4.6,
      outfit: r.opts.outfit || null,
      lodDist: clamp((power ? 2.02 : inf.height) * 19, 9, 90),
    };
  };
  C.list = function () {
    return Array.from(LIVE);
  };
  /** Pre-build templates so first spawns don't hitch. */
  C.preload = function (types, count) {
    for (const t of types || C.types()) {
      try {
        const r = resolveType(t, {});
        if (!r) continue;
        for (let i = 0; i < (count || 2); i++)
          templateFor(r.base, Object.assign({ seed: i }, r.opts));
      } catch (e) {
        G.reportError("chars.preload:" + t, e);
      }
    }
  };
  C.gibs = function (pos, n, color) {
    return GIBS.chunks(
      pos,
      n || 6,
      color === "green"
        ? GORE.green
        : color === "oil"
          ? GORE.oil
          : color || GORE.red,
      null,
      color === "oil",
      1,
    );
  };
  C.clearGibs = GIBS.clear;
  C.stats = function () {
    let tris = 0,
      liveTris = 0,
      lodCounts = [0, 0, 0, 0],
      inScene = 0;
    for (const [, t] of L.templates) tris += t.triangles;
    for (const ch of LIVE) {
      if (!ch.root.parent || !ch.mesh.visible) continue;
      inScene++;
      lodCounts[ch._lod]++;
      const g = ch.mesh.geometry;
      liveTris += g.index ? g.index.count / 3 : 0;
    }
    return {
      templates: L.templates.size,
      live: LIVE.size,
      inScene,
      lod: lodCounts,
      liveTris,
      gibs: GIBS.list.length,
      templateTris: tris,
    };
  };
  /** Triangle counts of a type at each LOD (debug/perf). */
  C.lodStats = function (type, opts) {
    const r = resolveType(type, opts || {});
    if (!r) return null;
    const { tpl } = templateFor(r.base, Object.assign({ seed: 1 }, r.opts));
    L.getLod(tpl, 1);
    L.getLod(tpl, 2);
    if (tpl.meta && tpl.meta.faceRig) L.getLod(tpl, 3);
    return {
      lod0: tpl.triangles,
      lod1: tpl.lodTris1,
      lod2: tpl.lodTris2,
      lodFace: tpl.lodTris3,
    };
  };
  C.Character = Character;
})();
