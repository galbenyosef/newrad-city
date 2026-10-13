// play-inline-517 02 — out
// Lines 27-176 of readable/play-inline-517.pretty.js (statement-aligned).
  const OLD_FACTION = { ferals: "maniacs", scorched: "settlers" };
  // exact ids (any context)
  const EXACT = {
    feral: "maniac",
    kindled: "maniac_bruiser",
    ferals: "maniacs",
    scorched_rags: "survivor_layers",
    scorched_f: "settler",
    scorched_m: "settler",
    scorched_growl: "maniac_idle",
    scorched_scream: "maniac_scream",
    scorched_idle: "maniac_idle",
    scorched_pain: "maniac_pain",
    scorched_death: "maniac_death",
    scorched_attack: "maniac_attack",
    feral_scream: "maniac_scream",
    feral_claw: "maniac_swipe",
    kindled_claw: "maniac_maul",
    scorched_townsfolk: "survivor",
    scorched_trader: "stall_keeper",
    scorched_guard: "town_guard",
    scorched_doctor: "town_doctor",
    scorched_bartender: "town_bartender",
    scorched_performer: "performer",
    scorched_mayor: "mayor",
    n_scorched: "n_maniac",
    o_ferals: "o_maniacs",
    ms_booth_ferals: "ms_booth_maniacs",
    ms_ferals_spawned: "ms_maniacs_spawned",
  };
  // 'scorched' alone depends on where it sits
  const SCORCHED_BY_KEY = {
    v: "settler",
    voice: "settler",
    loot: "settler",
    table: "settler",
    pool: "neon",
  };
  // stable NPC ids / flags that embedded the old word (also inside `dead_<id>` style keys)
  const ID_RE =
    /(pc_sp_|pf_tr_|ph_ellis_|pr_oct_|uw_ans_|msg_|ms_un_|qx_kd_)feral/g;
  const NAME_KEYS = { n: 1, name: 1, what: 1, label: 1 };

  let changes = 0;
  function mapString(v, keyHint) {
    if (typeof v !== "string") return v;
    let out = v;
    if (Object.prototype.hasOwnProperty.call(EXACT, out)) out = EXACT[out];
    else if (out === "scorched") out = SCORCHED_BY_KEY[keyHint] || "settlers";
    else if (ID_RE.test(out)) {
      ID_RE.lastIndex = 0;
      out = out.replace(ID_RE, "$1maniac");
    } else if (
      out.indexOf("|") > 0 &&
      /(^|\|)(ferals|scorched)(\||$)/.test(out)
    )
      out = out
        .split("|")
        .map((f) => OLD_FACTION[f] || f)
        .join("|");
    else if (NAME_KEYS[keyHint] && /\b(Ferals?|Kindled|Scorched)\b/.test(out)) {
      out = out
        .replace(/\bKindled Zealot\b/g, "Glowkeeper Zealot")
        .replace(/\bKindled Digger\b/g, "Glowkeeper Digger")
        .replace(/\bFeral nest\b/g, "Maniac nest")
        .replace(/\bFerals\b/g, "Maniacs")
        .replace(/\bFeral\b/g, "Maniac")
        .replace(/\bKindled\b/g, "Maniac Bruiser")
        .replace(/\bScorched Settler\b/g, "Old Settler")
        .replace(/\bScorched\b/g, "Neon");
    }
    ID_RE.lastIndex = 0;
    if (out !== v) changes++;
    return out;
  }
  function walk(v, keyHint) {
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) v[i] = walk(v[i], keyHint);
      return v;
    }
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        const val = walk(v[k], k);
        if (k.indexOf("|") > 0 && /(^|\|)scorched(\||$)/.test(k)) {
          delete v[k];
          changes++;
          continue;
        }
        const nk = mapString(k, "");
        if (nk !== k) {
          delete v[k];
          if (v[nk] === undefined) v[nk] = val;
          else if (typeof v[nk] === "number" && typeof val === "number")
            v[nk] += val; // tallies merge
        } else v[k] = val;
      }
      return v;
    }
    return mapString(v, keyHint);
  }

  function migrateSave(data) {
    if (!data || typeof data !== "object" || !data.modules) return data;
    changes = 0;
    // the radio's kill tally counted the Maniacs under the old kind name
    for (const m of Object.values(data.modules)) {
      if (
        m &&
        typeof m === "object" &&
        m.kills &&
        typeof m.kills === "object" &&
        typeof m.kills.scorched === "number"
      ) {
        m.kills.maniac = (m.kills.maniac || 0) + m.kills.scorched;
        delete m.kills.scorched;
        changes++;
      }
    }
    // population snapshots: the old burn-skin flag has no meaning any more
    const cm = data.modules.combat;
    const dropSc = (list) => {
      if (Array.isArray(list))
        for (const m of list)
          if (m && m.sc !== undefined) {
            delete m.sc;
            changes++;
          }
    };
    if (cm && typeof cm === "object") {
      if (cm.groups)
        for (const g of Object.values(cm.groups)) if (g) dropSc(g.m);
      if (Array.isArray(cm.roam)) for (const r of cm.roam) if (r) dropSc(r.m);
    }
    walk(data.modules);
    if (changes) {
      try {
        console.info(
          "[combat] migrated " +
            changes +
            " Maniac / townsfolk references in the save",
        );
      } catch (e) {
        /* ignore */
      }
    }
    return data;
  }
  G.save.migrations.push(migrateSave);
  // exposed for tests
  G.__cmb && (G.__cmb.migrateManiacs = migrateSave);
