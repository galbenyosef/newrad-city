/* src/characters/60_crowd.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: CROWD LOOKS
 * Owned by: characters.
 *
 * Distinctive, seed-stable appearances for populated places (The Neon's
 * 30–40 townsfolk & traders, trade wagons, settlements). A role + seed gives a
 * full create() option set — outfit, gender, hat, glasses,
 * hair, beard, idle attitude, a slight height variation — so callers never
 * hand-roll looks and two neighbours rarely match.
 *
 *   G.chars.crowdLook(role, seed)            → {type, ...opts}
 *   G.chars.createCrowd(role, seed, extra)   → Character (extra = pos/yaw/anim/…)
 *   G.chars.crowdRoles()                     → role names
 *
 * Cost: the seed picks one of 8 archetypes per role for everything that
 * shapes the template (outfit, dye, hat, age, gender, props, scale); the full
 * seed adds per-instance tints / grime / skin & hair shifts on top. A crowd of
 * 40 over 5–6 roles builds ≲ 25 templates (≤ 8 per role, ever) and each extra
 * NPC costs one draw call (+1 shadow within 60 m) with the usual LODs.
 * {unique:true} gives a one-off look (story NPCs built from crowdLook).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.chars || !G.chars._lib) return;
  const C = G.chars,
    L = C._lib;

  const HATS_CIVIL = ["fedora", "cap", "cowboy", "beret", "bandana", "hardhat"];
  // winter survivor wear: knit watch hats, head wraps, hoods, work hats, the odd old fedora
  const HATS_LAYERS = [
    "knit",
    "knit",
    "wrap",
    "cap",
    "hood",
    "hardhat",
    "fedora",
  ];
  const EYES_LAYERS = ["weldup", "weld", "specs", "specs"];
  const HAT_COLORS = [
    0x4a3a2a, 0x3e3a36, 0x5a4a34, 0x2e2a26, 0x6a5a3a, 0x4a4640, 0x5c2a22,
    0x2a3440,
  ];
  // faded street dyes for civilian outfits (null = the outfit's own colours)
  // (no light tans: on light shirts / close-fitting suits they read as bare skin)
  const DYES = [
    null,
    null,
    0x6a5a44,
    0x4a5a3a,
    0x4a4a52,
    0x3a4a5a,
    0x4e4232,
    0x5a4636,
    0x5a5a52,
    0x5a3a30,
    0x3e4638,
    0x3a3a44,
  ];
  /** archetypes per role (template-shaping looks); see crowdLook */
  const POOL = 8;
  const DYEABLE = {
    settler: 1,
    drifter: 1,
    merchant: 1,
    survivor_layers: 0,
    lab_coat: 0,
    doctor: 0,
    dj: 1,
    leather_armor: 1,
  };
  const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
  const acc = (r, table) => {
    const out = [];
    for (const [name, p] of table) if (r() < p) out.push(name);
    return out.length ? out.join(",") : null;
  };

  /**
   * role → fn(r, seed) returning create opts. `r` is a seeded rng.
   * Town roles (the Neon's people: stall keepers, barkeeps, guards, showfolk)
   * mix the winter survivor layers with civilian clothes. Every role also
   * gets (below, from the seed): explicit gender, age band, hair, a cloth
   * dye for dyeable outfits and role props (aprons, satchels, bandoliers…).
   */
  const ROLES = {
    survivor: (r) => ({
      type: "human",
      outfit: pick(r, [
        "survivor_layers",
        "survivor_layers",
        "survivor_layers",
        "settler",
        "drifter",
        "merchant",
      ]),
      hat: r() < 0.3 ? pick(r, HATS_LAYERS) : null,
      glasses: r() < 0.2 ? pick(r, EYES_LAYERS) : null,
      acc: acc(r, [
        ["satchel", 0.2],
        ["pack", 0.08],
      ]),
    }),
    stall_keeper: (r) => ({
      type: "human",
      outfit: pick(r, [
        "merchant",
        "survivor_layers",
        "survivor_layers",
        "settler",
        "drifter",
      ]),
      hat: r() < 0.5 ? pick(r, HATS_LAYERS) : null,
      glasses: r() < 0.25 ? pick(r, EYES_LAYERS) : null,
      acc: acc(r, [
        ["apron", 0.45],
        ["ledger", 0.35],
        ["satchel", 0.2],
      ]),
    }),
    town_guard: (r) => ({
      type: "human",
      outfit: pick(r, [
        "combat_armor",
        "leather_armor",
        "combat_armor",
        "raider_heavy",
      ]),
      hat: r() < 0.5 ? "helmet" : null,
      idle: r() < 0.5 ? "crossed" : "behind",
      acc: acc(r, [["bandolier", 0.5]]),
      weapon:
        r() < 0.6
          ? pick(r, ["hunting_rifle", "assault_rifle", "combat_shotgun"])
          : null,
    }),
    town_doctor: (r) => ({
      type: "human",
      outfit: pick(r, ["doctor", "lab_coat"]),
      glasses: r() < 0.5 ? "specs" : null,
      hat: r() < 0.4 ? "wrap" : null,
      acc: acc(r, [["satchel", 0.3]]),
    }),
    town_bartender: (r) => ({
      type: "human",
      outfit: pick(r, ["survivor_layers", "survivor_layers", "merchant"]),
      idle: pick(r, ["hips", "crossed", "relaxed"]),
      hat: r() < 0.4 ? pick(r, ["knit", "wrap"]) : null,
      acc: acc(r, [
        ["apron", 0.7],
        ["rag", 0.8],
      ]),
    }),
    performer: (r) => ({
      type: "human",
      outfit: pick(r, ["dj", "survivor_layers"]),
      hat: r() < 0.5 ? pick(r, ["beret", "wrap"]) : null,
      glasses: r() < 0.4 ? "sun" : null,
    }),
    mayor: () => ({
      type: "human",
      outfit: "survivor_layers",
      hat: "wrap",
      hatColor: 0x8e4e34,
      glasses: "specs",
      idle: "behind",
      gender: "m",
      age: 1,
      acc: "ledger",
    }),
    trader: (r) => ({
      type: "human",
      outfit: pick(r, ["merchant", "merchant", "drifter", "settler"]),
      hat: r() < 0.55 ? pick(r, ["cowboy", "fedora", "cap", "bandana"]) : null,
      glasses: r() < 0.12 ? "goggles" : null,
      acc: acc(r, [
        ["apron", 0.35],
        ["ledger", 0.3],
        ["satchel", 0.25],
      ]),
    }),
    wagoneer: (r) => ({
      type: "human",
      outfit: pick(r, ["merchant", "drifter", "leather_armor"]),
      hat: r() < 0.7 ? pick(r, ["cowboy", "bandana", "cap"]) : null,
      glasses: r() < 0.25 ? "goggles" : null,
      acc: acc(r, [
        ["bigpack", 0.55],
        ["bandolier", 0.3],
        ["satchel", 0.2],
      ]),
      weapon: r() < 0.35 ? pick(r, ["hunting_rifle", "pistol_10mm"]) : null,
    }),
    townsfolk: (r) => ({
      type: "human",
      outfit: pick(r, [
        "settler",
        "settler",
        "drifter",
        "merchant",
        "lab_coat",
      ]),
      hat: r() < 0.35 ? pick(r, HATS_CIVIL) : null,
      acc: acc(r, [["satchel", 0.15]]),
    }),
    drifter: (r) => ({
      type: "human",
      outfit: pick(r, ["drifter", "drifter", "settler"]),
      hat: r() < 0.5 ? pick(r, ["bandana", "cap", "hood"]) : null,
      glasses: r() < 0.3 ? "goggles" : null,
      acc: acc(r, [
        ["pack", 0.4],
        ["bandolier", 0.15],
      ]),
    }),
    guard: (r) => ({
      type: "human",
      outfit: pick(r, ["combat_armor", "leather_armor"]),
      hat: r() < 0.6 ? "helmet" : null,
      idle: r() < 0.5 ? "crossed" : "behind",
      acc: acc(r, [["bandolier", 0.4]]),
      weapon:
        r() < 0.6
          ? pick(r, ["hunting_rifle", "assault_rifle", "combat_shotgun"])
          : null,
    }),
    doctor: (r) => ({
      type: "human",
      outfit: pick(r, ["doctor", "lab_coat"]),
      glasses: r() < 0.4 ? "specs" : null,
    }),
    scientist: (r) => ({
      type: "human",
      outfit: "lab_coat",
      glasses: r() < 0.6 ? "specs" : null,
    }),
    cryo_tech: () => ({ type: "human", outfit: "cryo_suit" }),
    cook: (r) => ({
      type: "human",
      outfit: pick(r, ["settler", "merchant", "survivor_layers"]),
      acc: "apron" + (r() < 0.6 ? ",rag" : ""),
      hat: r() < 0.3 ? "bandana" : null,
      idle: pick(r, ["hips", "relaxed"]),
    }),
    porter: (r) => ({
      type: "human",
      outfit: pick(r, ["settler", "drifter", "survivor_layers"]),
      acc: pick(r, ["bigpack", "pack,satchel", "bigpack"]),
      hat: r() < 0.5 ? pick(r, ["cap", "bandana", "hardhat"]) : null,
    }),
  };
  // aliases
  ROLES.merchant = ROLES.trader;
  ROLES.settler = ROLES.townsfolk;
  ROLES.neon_guard = ROLES.town_guard;
  ROLES.bartender = ROLES.town_bartender;
  ROLES.vendor = ROLES.trader;

  C.crowdRoles = () => Object.keys(ROLES);

  /** Full create() options for (role, seed). Unknown roles → townsfolk. */
  C.crowdLook = function (role, seed, opt) {
    const s =
      typeof seed === "string"
        ? L.hashStr(seed)
        : Math.floor(Math.abs(Number(seed) || 0)) >>> 0;
    const unique = !!(opt && opt.unique);
    const rh = L.hashStr(String(role || ""));
    // Template-shaping traits come from one of POOL archetypes per role (the
    // seed picks which), so a 40-strong crowd builds ≤ POOL templates per role
    // instead of one 17k-tri / ~1 MB template per NPC (and no multi-second
    // spawn hitch). The FULL seed still drives each NPC's per-instance tints,
    // grime and skin/hair shifts. {unique:true} → a one-off look (named NPCs).
    const arch = unique ? s : s % POOL;
    const r = L.rng((((arch + 1) * 2654435761) ^ rh) >>> 0);
    const fn = ROLES[role] || ROLES.townsfolk;
    const o = fn(r, s);
    // seed % 16 selects the template's geometry variant: pin it to the archetype
    o.seed = unique
      ? s
      : (((s >>> 3) & 0x0fffffff) * 16 + ((arch + rh) & 15)) >>> 0;
    if (o.hat && o.hatColor === undefined) o.hatColor = pick(r, HAT_COLORS);
    // explicit individual traits from the seed (not left to template randomness);
    // pooled roles get a fixed gender mix across their archetypes (≈ 3–4 of 8 women)
    if (o.gender === undefined)
      o.gender = unique
        ? r() < 0.45
          ? "f"
          : "m"
        : ((arch * 5 + rh) & 7) < 4
          ? "f"
          : "m";
    if (o.age === undefined) {
      const a = r();
      o.age =
        a < 0.35 ? 0 : a < 0.65 ? 0.25 : a < 0.85 ? 0.5 : a < 0.95 ? 0.75 : 1;
    }
    if (o.hair === undefined && o.age >= 0.75 && r() < 0.5)
      o.hair =
        o.gender === "m"
          ? pick(r, ["balding", "bald", "short"])
          : pick(r, ["bun", "bob"]);
    if (o.age >= 0.75 && o.hairColor === undefined && r() < 0.7)
      o.hairColor = pick(r, [0x9a9690, 0xc8c3b8, 0x7a7670]);
    if (o.outfitColor === undefined && DYEABLE[o.outfit]) {
      const d = pick(r, DYES);
      if (d !== null) o.outfitColor = d;
    }
    // a few of the city's people carry an old burn scar from March '67 (older faces only)
    if (o.burn === undefined && o.age >= 0.5 && r() < 0.18)
      o.burn = r() < 0.5 ? "L" : "R";
    for (const k of ["hat", "glasses", "acc", "weapon", "burn"])
      if (!o[k]) delete o[k];
    if (o.scale === undefined)
      o.scale = Math.round((0.93 + r() * 0.14) * 40) / 40; // 0.925 … 1.075 in 2.5 % steps
    return o;
  };

  /**
   * Pre-build the archetype templates of crowd roles on spare frames (one per
   * cheap frame, from lateUpdate) so the spawn of a big crowd later finds
   * them cached — call it when the player heads toward a populated place.
   * roles: role name or array; returns the number queued.
   */
  const WARM = [];
  C.warmCrowd = function (roles) {
    let n = 0;
    for (const role of [].concat(roles || []))
      for (let a = 0; a < POOL; a++) {
        WARM.push([role, a]);
        n++;
      }
    return n;
  };
  L.crowdWarmStep = function () {
    if (!WARM.length || !L.warmTemplate) return false;
    const [role, a] = WARM.shift();
    try {
      const o = C.crowdLook(role, a);
      const type = o.type || "human";
      delete o.type;
      L.warmTemplate(type, o);
    } catch (e) {
      if (G.reportError) G.reportError("chars.warmup", e);
    }
    return true;
  };

  /**
   * Build a crowd member: extra overrides/adds (pos, yaw, anim, weapon, …).
   * Crowd members join the crowd LOD system (far members freeze into
   * per-template instances, see G.chars.setCrowdBudget) — pass
   * {crowd:false} for someone who must stay a full rig (quest giver).
   */
  C.createCrowd = function (role, seed, extra) {
    const o = Object.assign(C.crowdLook(role, seed, extra), extra || {});
    delete o.unique;
    if (o.crowd === undefined) o.crowd = true;
    const type = o.type || "human";
    delete o.type;
    return C.create(type, o);
  };
})();
