// play-inline-468 08 — inf
// Lines 3747-3908 of readable/play-inline-468.pretty.js (statement-aligned).
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
