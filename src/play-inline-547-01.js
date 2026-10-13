// play-inline-547 01 — changes
// Lines 23-220 of readable/play-inline-547.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;

  // ---------------- 1. the retired prize hunt ----------------
  const BOTTLE_SCRIP = 10;
  const OLD_HUNT_QUEST = "arc_" + "fizzo_hunt";
  const ITEM_MAP = { arc_fizzo_victory: "fizzo_blue" }; // old id → new id
  const ITEM_DROP = { arc_note_fizzo_card: true }; // old id → removed
  const OLD_REWARDS = /^blue\d+$/;

  // ---------------- 2. renamed businesses: id tokens (old → new), longest first ----------------
  const TOKENS = [
    ["bloomingdales", "bellamys"],
    ["bloomingdale", "bellamy"],
    ["bloomies", "bellamys"],
    ["mcsorleys", "orourkes"],
    ["mcsorley", "orourke"],
    ["daily_news", "journal_bldg"],
    ["chumleys", "bedfords"],
    ["club_21", "club_52"],
    ["club21", "club52"],
    ["con_ed", "five_boro"],
    ["coned", "fiveboro"],
    ["hardart", "penny"],
    ["macys", "sterlings"],
  ];
  // display names in the save slot's "place" line
  const PLACES = [
    ["Macy's Herald Square", "Sterling's of Herald Square"],
    ["Bloomingdale's", "Bellamy's"],
    ["McSorley's", "O'Rourke's"],
    ["Chumley's", "Bedford's"],
    ["Con Edison Tower of Light", "Five Boroughs Tower of Light"],
    ["Daily News Building", "First Journal Building"],
    ["Horn & Hardart", "Penny & Price"],
    ["21 Club", "The 52 Club"],
  ];
  const ID_LIKE = /^[A-Za-z0-9_.:@,\/\-]+$/;
  const TOKEN_RE = new RegExp(TOKENS.map((t) => t[0]).join("|"), "g");
  const TOKEN_MAP = {};
  for (const t of TOKENS) TOKEN_MAP[t[0]] = t[1];
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  let changes = 0;
  function retoken(str) {
    if (typeof str !== "string" || !ID_LIKE.test(str)) return str;
    TOKEN_RE.lastIndex = 0;
    if (!TOKEN_RE.test(str)) return str;
    TOKEN_RE.lastIndex = 0;
    changes++;
    return str.replace(TOKEN_RE, (m) => TOKEN_MAP[m]);
  }
  function walk(v, keyHint) {
    if (Array.isArray(v)) {
      // [id, count, …] tuple (inventory, containers, merchant stock, pickups)
      if (
        v.length >= 2 &&
        typeof v[0] === "string" &&
        typeof v[1] === "number"
      ) {
        if (has(ITEM_MAP, v[0])) {
          v[0] = ITEM_MAP[v[0]];
          changes++;
        } else if (has(ITEM_DROP, v[0]) && v[1] !== 0) {
          v[1] = 0;
          changes++;
        }
      }
      for (let i = 0; i < v.length; i++) {
        const x = v[i];
        if (typeof x === "string") {
          if (has(ITEM_DROP, x) || x === OLD_HUNT_QUEST) {
            v[i] = keyHint === "favs" ? null : x;
            if (keyHint === "favs") changes++;
            continue;
          }
          if (has(ITEM_MAP, x)) {
            v[i] = ITEM_MAP[x];
            changes++;
            continue;
          }
          v[i] = retoken(x);
        } else v[i] = walk(x, keyHint);
      }
      return v;
    }
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        const val = walk(v[k], k);
        let nk = has(ITEM_MAP, k) ? ITEM_MAP[k] : retoken(k);
        if (has(ITEM_DROP, k)) {
          delete v[k];
          changes++;
          continue;
        }
        if (nk !== k) {
          delete v[k];
          changes++;
          if (v[nk] === undefined) v[nk] = val;
          else if (typeof v[nk] === "number" && typeof val === "number")
            v[nk] += val;
          else if (Array.isArray(v[nk]) && Array.isArray(val)) {
            for (const x of val) if (v[nk].indexOf(x) < 0) v[nk].push(x);
          }
        } else v[k] = val;
      }
      return v;
    }
    if (typeof v === "string") {
      if (has(ITEM_MAP, v)) {
        changes++;
        return ITEM_MAP[v];
      }
      return retoken(v);
    }
    return v;
  }

  /** The old hunt's state in the arcade block → scrip; returns the scrip owed. */
  function retireHunt(mods) {
    let owed = 0;
    const a = mods.arcade;
    if (a && typeof a === "object") {
      if (Array.isArray(a.blue)) {
        owed +=
          a.blue.filter((x) => typeof x === "string").length * BOTTLE_SCRIP;
        delete a.blue;
        changes++;
      }
      if (has(a, "drunk")) {
        delete a.drunk;
        changes++;
      }
      if (Array.isArray(a.rewards)) {
        const n = a.rewards.length;
        a.rewards = a.rewards.filter((x) => !OLD_REWARDS.test(String(x)));
        if (a.rewards.length !== n) changes++;
      }
    }
    const q = mods.quests;
    if (q && typeof q === "object") {
      if (q.q && has(q.q, OLD_HUNT_QUEST)) {
        delete q.q[OLD_HUNT_QUEST];
        changes++;
      }
      if (q.tracked === OLD_HUNT_QUEST) {
        q.tracked = null;
        changes++;
      }
    }
    return owed;
  }

  function migrateSave(data) {
    if (!data || typeof data !== "object" || !data.modules) return data;
    changes = 0;
    let owed = 0;
    try {
      owed = retireHunt(data.modules);
    } catch (e) {
      G.reportError("arcade:migrate:hunt", e);
    }
    try {
      walk(data.modules);
    } catch (e) {
      G.reportError("arcade:migrate:walk", e);
    }
    // the slot list's place name (display text)
    if (typeof data.place === "string") {
      const p0 = data.place;
      for (const n of PLACES) data.place = data.place.split(n[0]).join(n[1]);
      if (data.place !== p0) changes++;
    }
    if (owed > 0) {
      const inv = data.modules.rpg && data.modules.rpg.inv;
      if (inv && Array.isArray(inv.items)) {
        inv.items.push(["scrip", owed]);
        changes++;
      }
    }
    if (changes) {
      try {
        console.info(
          "[arcade] migrated " +
            changes +
            " retired references in the save" +
            (owed ? " (" + owed + " scrip for old prize bottles)" : ""),
        );
      } catch (e) {
        /* ignore */
      }
    }
    return data;
  }
  G.arcade._.migrateSave = migrateSave;
  G.arcade._.MIGRATE = { TOKENS, ITEM_MAP, ITEM_DROP, BOTTLE_SCRIP };
  if (G.save && Array.isArray(G.save.migrations))
    G.save.migrations.push(migrateSave);
