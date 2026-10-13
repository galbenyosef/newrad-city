/* src/ui_interact/25_locks.js */
/* =====================================================================
 * NEW RAD CITY — ui_interact / 25_locks.js
 * G.locks — the shared registry of every lock in the city (REBRAND §5).
 *
 *  A lock is unlocked by exactly one or more of:
 *    key:      '<item id>'   a physical key / keycard (held in the inventory)
 *    code:     '4719'        4-6 digits typed on the goggle keypad (26_keypad.js)
 *    passcode: 'MARIGOLD'    a word typed on a teletype prompt (30_terminal.js)
 *
 *  spec: { id, label, key?, code?, passcode?, hint?, kind?:'door'|'container'|'terminal'|'safe'|...,
 *          consume?:bool (key is used up), learnedFrom?: label|[labels], keyFrom?: label|[labels] }
 *
 *  G.locks.register(spec)               declare a lock (every content module registers every lock it makes)
 *  G.locks.open(specOrId, onOpen, opts) player interaction: key → opens; code → keypad; passcode → teletype prompt
 *                                       opts: {onCancel(), label}
 *  G.locks.isOpen(id) / unlock(id) / relock(id)
 *  G.locks.learn(id|[ids], sourceLabel?)  the player read/heard the code → Goggles → NOTES → CODES
 *  G.locks.learnableFrom(id, label)     declare where a code can be learned (for the audit)
 *  G.locks.obtainableFrom(itemId, label) declare where a key can be had (scripted gifts, NPC loot, rewards)
 *  G.locks.known()                      learned codes/passcodes for the goggles NOTES → CODES tab
 *  G.locks.audit(opts)                  → [{id, label, problems:[...]}]   (see NOTES.md "Locks audit")
 *  G.locks.revealAll()                  cheat: learn every code and passcode, hand over every key
 *
 *  Declarative learning (no code needed in content):
 *    - item defs (notes, tape reels) with `learn: 'lock_id'|[...]` teach on pickup (and on 'noteRead')
 *    - terminal entries `{title, text, learn}` teach when printed (30_terminal.js)
 *    - dialogue nodes / responses `{learn}` teach when shown / chosen (10_dialogue.js)
 *
 * Events: lockRegistered(spec), lockOpened(id, how), lockBlocked(id), codeLearned(id, entry), codeRejected(id)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G._uix;

  const specs = new Map(); // id → spec
  const opened = new Set(); // ids unlocked this playthrough (saved)
  const learned = new Map(); // id → {n, src, day, hour} (saved)
  const learnSrc = new Map(); // id → Set(labels) declared places a code is learnable
  const keySrc = new Map(); // item id → Set(labels) declared places a key can be had
  const unconverted = new Map(); // call site → {where, kind, ids:Set, count}
  let learnN = 0;

  const arr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const addSrc = (map, id, label) => {
    if (!id) return;
    let s = map.get(id);
    if (!s) map.set(id, (s = new Set()));
    s.add(String(label || "declared"));
  };
  const now = () => ({
    day: (G.time && G.time.day) || 1,
    hour: (G.time && G.time.hour) || 0,
  });

  // ------------------------------------------------------------------
  // Registry
  // ------------------------------------------------------------------
  function register(spec) {
    if (typeof spec === "string") spec = { id: spec };
    if (!spec || !spec.id) {
      G.reportError("locks", new Error("G.locks.register: spec without id"));
      return null;
    }
    const id = String(spec.id);
    const s = specs.get(id) || { id };
    for (const k of [
      "label",
      "key",
      "hint",
      "kind",
      "consume",
      "owner",
      "legacy",
    ])
      if (spec[k] !== undefined) s[k] = spec[k];
    if (spec.code !== undefined && spec.code !== null) {
      s.code = String(spec.code).replace(/\D/g, "");
      if (!/^\d{4,6}$/.test(s.code))
        console.warn(
          '[locks] lock "' +
            id +
            '": code must be 4-6 digits (got "' +
            spec.code +
            '")',
        );
    }
    if (spec.passcode !== undefined && spec.passcode !== null)
      s.passcode = String(spec.passcode).toUpperCase().trim();
    if (!s.label) s.label = X.prettify(id.replace(/^[a-z]+:/, ""));
    for (const l of arr(spec.learnedFrom)) addSrc(learnSrc, id, l);
    if (s.key) for (const l of arr(spec.keyFrom)) addSrc(keySrc, s.key, l);
    const fresh = !specs.has(id);
    specs.set(id, s);
    if (fresh) G.events.emit("lockRegistered", s);
    return s;
  }
  function specOf(specOrId) {
    if (!specOrId) return null;
    if (typeof specOrId === "string")
      return specs.get(specOrId) || register({ id: specOrId });
    return register(specOrId);
  }

  // ------------------------------------------------------------------
  // Opening
  // ------------------------------------------------------------------
  function markOpen(s, how) {
    opened.add(s.id);
    G.events.emit("lockOpened", s.id, how);
    if (how === "code" || how === "passcode") {
      X.useSkill("electronics", 1, how === "code" ? "keypad" : "terminal");
      // a code that worked is worth remembering even if it was a guess
      if (!learned.has(s.id))
        learn(
          s.id,
          how === "code" ? "Entered at the keypad" : "Entered at the terminal",
          { silent: true },
        );
    }
  }
  function open(specOrId, onOpen, opts) {
    opts = opts || {};
    const s = specOf(specOrId);
    if (!s) return false;
    const done = () => {
      if (onOpen) {
        try {
          onOpen(s.id);
        } catch (e) {
          G.reportError("locks:onOpen:" + s.id, e);
        }
      }
    };
    if (opened.has(s.id)) {
      done();
      return true;
    }
    if (s.key && X.invCount(s.key) > 0) {
      if (s.consume) X.invRemove(s.key, 1);
      markOpen(s, "key");
      X.sfx("lock_key", { volume: 0.7 }, "ui_select");
      try {
        G.notify("Unlocked with " + X.itemName(s.key) + ".");
      } catch (e) {
        /* ignore */
      }
      done();
      return true;
    }
    const ok = (how) => () => {
      markOpen(s, how);
      done();
    };
    if (s.code && X.keypad) return X.keypad.open(s, ok("code"), opts);
    if (s.passcode && X.terminal && X.terminal.prompt)
      return X.terminal.prompt(s, ok("passcode"), opts);
    // key-only lock (or a lock that declares nothing — the audit reports those)
    X.sfx("door_locked", { volume: 0.8 });
    try {
      G.notify(
        s.key ? "Locked. It needs " + X.itemName(s.key) + "." : "It's locked.",
      );
    } catch (e) {
      /* ignore */
    }
    G.events.emit("lockBlocked", s.id);
    if (opts.onCancel) {
      try {
        opts.onCancel("locked");
      } catch (e) {
        G.reportError("locks:onCancel", e);
      }
    }
    return false;
  }

  // ------------------------------------------------------------------
  // Codes the player knows
  // ------------------------------------------------------------------
  function learn(id, src, opts) {
    opts = opts || {};
    if (Array.isArray(id)) {
      let any = false;
      for (const i of id) any = learn(i, src, opts) || any;
      return any;
    }
    if (!id) return false;
    id = String(id);
    if (learned.has(id)) return false;
    const s = specs.get(id);
    if (s && !s.code && !s.passcode) return false; // key-only lock: nothing to write down
    const e = Object.assign(
      { n: ++learnN, src: src ? String(src) : "" },
      now(),
    );
    learned.set(id, e);
    if (s && !opts.silent) {
      try {
        G.notify("Code logged: " + s.label + " — " + (s.code || s.passcode), {
          kind: "code",
        });
      } catch (err) {
        /* ignore */
      }
      X.sfx("code_logged", { volume: 0.6 }, "ui_select");
    }
    G.events.emit("codeLearned", id, entryOf(id));
    return true;
  }
  function entryOf(id) {
    const s = specs.get(id),
      e = learned.get(id);
    if (!s || !e || !(s.code || s.passcode)) return null;
    return {
      id,
      label: s.label,
      kind: s.code ? "code" : "passcode",
      value: s.code || s.passcode,
      code: s.code || null,
      passcode: s.passcode || null,
      source: e.src,
      day: e.day,
      hour: e.hour,
      open: opened.has(id),
      n: e.n,
    };
  }
  /** Learned codes/passcodes, oldest first: [{id, label, kind, value, source, day, hour, open}] (goggles NOTES → CODES). */
  function known() {
    const out = [];
    for (const id of learned.keys()) {
      const e = entryOf(id);
      if (e) out.push(e);
    }
    return out.sort((a, b) => a.n - b.n);
  }

  // ------------------------------------------------------------------
  // Declarative learning from item defs (notes, tape reels): `learn: 'lock_id'|[...]`
  // ------------------------------------------------------------------
  let loading = false; // inventory restored by a load re-emits itemAdded: learn quietly then
  G.events.on("reset", (o) => {
    loading = !!(o && o.loading);
  });
  G.events.on("loaded", () => {
    loading = false;
  });
  function itemTeach(id) {
    let d = null;
    try {
      d = X.live("items") && G.items.get ? G.items.get(id) : null;
    } catch (e) {
      d = null;
    }
    if (d && d.learn)
      learn(d.learn, d.name || X.prettify(id), { silent: loading });
  }
  G.events.on("itemAdded", (id) => itemTeach(id));
  G.events.on("noteRead", (id) => itemTeach(id));

  // ------------------------------------------------------------------
  // Audit — proves every lock has a reachable unlock
  // ------------------------------------------------------------------
  const safe = (fn, d) => {
    try {
      const v = fn();
      return v == null ? d : v;
    } catch (e) {
      return d;
    }
  };
  function pairs(items) {
    if (!items) return [];
    if (items instanceof Map) return Array.from(items.keys());
    if (Array.isArray(items))
      return items
        .map((e) => (Array.isArray(e) ? e[0] : (e && (e.id || e.item)) || e))
        .filter((x) => typeof x === "string");
    if (typeof items === "object") return Object.keys(items);
    return [];
  }
  /** Map item id → [labels of places it can be obtained] from the live world + declarations. */
  function itemSources() {
    const out = new Map();
    const add = (id, l) => {
      if (!id) return;
      if (!out.has(id)) out.set(id, []);
      out.get(id).push(l);
    };
    for (const [id, set] of keySrc) for (const l of set) add(id, l);
    if (X.live("items"))
      for (const p of safe(() => G.items.pickups(), []))
        add(p && p.id, "world pickup");
    if (X.live("containers")) {
      for (const c of safe(() => G.containers.list(), [])) {
        if (!c) continue;
        for (const id of pairs(c.items))
          add(id, "container: " + (c.name || c.id || "?"));
        for (const id of pairs(c.fixed || c.guaranteed))
          add(id, "container: " + (c.name || c.id || "?"));
      }
    }
    if (X.live("actors")) {
      for (const a of safe(() => G.actors.list(), [])) {
        if (!a) continue;
        const who = "NPC: " + (a.name || a.id || a.type || "?");
        for (const id of pairs(a.inventory)) add(id, who);
        for (const id of pairs(a.def && a.def.inventory)) add(id, who);
        if (a.merchant)
          for (const id of pairs(a.merchant.stock)) add(id, who + " (sells)");
      }
    }
    if (X.live("quests")) {
      const qs = safe(
        () =>
          typeof G.quests.all === "function" ? G.quests.all() : G.quests.list(),
        [],
      );
      for (const q of qs) {
        const r = q && q.rewards;
        if (r)
          for (const id of pairs(r.items))
            add(id, "quest reward: " + (q.name || q.id));
      }
    }
    return out;
  }
  /** Every place a code is declared learnable: lock id → [labels]. */
  function learnSources() {
    const out = new Map();
    const add = (id, l) => {
      if (!id) return;
      if (!out.has(id)) out.set(id, []);
      out.get(id).push(l);
    };
    for (const [id, set] of learnSrc) for (const l of set) add(id, l);
    for (const [id, ls] of safe(() => X.terminal.learnSources(), new Map()))
      for (const l of ls) add(id, l);
    for (const [id, ls] of safe(() => X.dialogue.learnSources(), new Map()))
      for (const l of ls) add(id, l);
    if (X.live("items")) {
      for (const d of safe(() => G.items.all(), []))
        if (d && d.learn)
          for (const id of arr(d.learn))
            add(id, "item: " + (d.name || d.id) + "#" + d.id);
    }
    return out;
  }
  /** Pick up locks declared on world doors / containers that were never registered, and legacy numeric locks. */
  function scanWorld() {
    const doors = safe(() => G.world.doors, []) || [];
    for (const d of doors) {
      const def = d && d.def;
      if (!def) continue;
      if (def.lock && def.lock.id) {
        if (!specs.has(def.lock.id))
          register(Object.assign({ kind: "door", label: def.label }, def.lock));
      } else if (def.locked > 0)
        noteUnconverted(
          'door "' + (def.label || "?") + '" @' + posKey(def.pos),
          "door",
          null,
        );
    }
    if (X.live("containers")) {
      for (const c of safe(() => G.containers.list(), [])) {
        if (!c) continue;
        if (c.lock && c.lock.id) {
          if (!specs.has(c.lock.id))
            register(
              Object.assign({ kind: "container", label: c.name }, c.lock),
            );
        } else if (typeof c.locked === "number" && c.locked > 0)
          noteUnconverted(
            'container "' + (c.name || c.id || "?") + '" @' + posKey(c.pos),
            "container",
            null,
          );
      }
    }
  }
  /**
   * opts: {problemsOnly:bool} → [{id, label, kind, key?, code?, passcode?, learnable:[...], keySources:[...], problems:[...]}]
   * plus one pseudo-entry per unconverted legacy call site (id 'unconverted:<where>').
   */
  function audit(opts) {
    opts = opts || {};
    scanWorld();
    const items = itemSources(),
      lsrc = learnSources();
    const out = [];
    for (const s of specs.values()) {
      const p = [];
      const learnable = lsrc.get(s.id) || [];
      let keySources = [];
      if (!s.key && !s.code && !s.passcode) p.push("no key, code or passcode");
      if (s.code && !/^\d{4,6}$/.test(s.code))
        p.push('code "' + s.code + '" is not 4-6 digits');
      if (s.key) {
        const def = safe(
          () => (X.live("items") ? G.items.get(s.key) : null),
          null,
        );
        keySources = items.get(s.key) || [];
        if (X.live("items") && !def)
          p.push('key item "' + s.key + '" is not defined');
        else if (!keySources.length)
          p.push(
            'key "' +
              s.key +
              '" is never obtainable (not in the world, a container, an NPC inventory or a quest reward; declare scripted gifts with G.locks.obtainableFrom)',
          );
      }
      if ((s.code || s.passcode) && !learnable.length)
        p.push(
          (s.code ? "code" : "passcode") +
            " is never learnable (no note, tape reel, terminal entry or dialogue teaches it; declare with G.locks.learnableFrom or a `learn` field)",
        );
      for (const l of learnable) {
        const m = /#([\w.-]+)$/.exec(l); // notes / tape reels: the item itself must be obtainable
        if (m && !items.has(m[1]))
          p.push('teaching item "' + m[1] + '" is never obtainable');
      }
      if (s.legacy) p.push("unconverted legacy lock (" + s.legacy + ")");
      if (!opts.problemsOnly || p.length) {
        out.push({
          id: s.id,
          label: s.label,
          kind: s.kind || "",
          key: s.key || null,
          code: s.code || null,
          passcode: s.passcode || null,
          learnable,
          keySources,
          problems: p,
        });
      }
    }
    for (const id of lsrc.keys())
      if (!specs.has(id))
        out.push({
          id,
          label: "(unregistered)",
          kind: "",
          learnable: lsrc.get(id),
          keySources: [],
          problems: ["a learn source names a lock that was never registered"],
        });
    for (const id of learned.keys())
      if (!specs.has(id) && !lsrc.has(id))
        out.push({
          id,
          label: "(unregistered)",
          kind: "",
          learnable: [],
          keySources: [],
          problems: [
            "G.locks.learn() was called for a lock that was never registered",
          ],
        });
    for (const u of unconverted.values()) {
      if (u.ids.size) continue; // already reported on its lock entries
      out.push({
        id: "unconverted:" + u.where,
        label: u.where,
        kind: u.kind,
        learnable: [],
        keySources: [],
        problems: ["unconverted legacy " + u.kind + " lock at " + u.where],
      });
    }
    return out;
  }
  function auditSummary() {
    const a = audit();
    const bad = a.filter((e) => e.problems.length);
    return {
      locks: specs.size,
      ok: a.length - bad.length,
      withProblems: bad.length,
      unconverted: unconverted.size,
      byProblem: bad.reduce((m, e) => {
        for (const p of e.problems) {
          const k = p
            .replace(/"[^"]*"/g, '"…"')
            .replace(/\(.*$/, "")
            .trim();
          m[k] = (m[k] || 0) + 1;
        }
        return m;
      }, {}),
    };
  }

  // ------------------------------------------------------------------
  // Cheat: "Reveal all codes & keys"
  // ------------------------------------------------------------------
  function revealAll(opts) {
    opts = opts || {};
    let codes = 0,
      keys = 0;
    for (const s of specs.values()) {
      if ((s.code || s.passcode) && learn(s.id, "Revealed", { silent: true }))
        codes++;
      if (s.key && opts.keys !== false && X.invCount(s.key) <= 0) {
        X.invAdd(s.key, 1);
        keys++;
      }
    }
    try {
      G.notify("Revealed " + codes + " codes and " + keys + " keys.");
    } catch (e) {
      /* ignore */
    }
    return { codes, keys };
  }

  // ------------------------------------------------------------------
  // Unconverted call sites (legacy numeric difficulty locks)
  // ------------------------------------------------------------------
  function posKey(p) {
    return p ? Math.round(p.x) + "," + Math.round(p.z) : "?";
  }
  function noteUnconverted(where, kind, lockId) {
    let u = unconverted.get(where);
    if (!u) {
      unconverted.set(where, (u = { where, kind, ids: new Set(), count: 0 }));
      console.warn("[locks] unconverted " + kind + " call at " + where);
    }
    u.count++;
    if (lockId) u.ids.add(lockId);
    return u;
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  G.locks = {
    register,
    get: (id) => specs.get(id) || null,
    list: () => Array.from(specs.values()),
    open,
    isOpen: (id) => opened.has(String(id)),
    unlock(id, how) {
      const s = specs.get(String(id)) || register({ id: String(id) });
      if (!opened.has(s.id)) markOpen(s, how || "script");
      return true;
    },
    relock(id) {
      opened.delete(String(id));
    },
    learn,
    isKnown: (id) => learned.has(String(id)),
    learnableFrom(id, label) {
      addSrc(learnSrc, String(id), label);
    },
    obtainableFrom(itemId, label) {
      addSrc(keySrc, String(itemId), label);
    },
    known,
    audit,
    auditSummary,
    unconverted: () =>
      Array.from(unconverted.values()).map((u) => ({
        where: u.where,
        kind: u.kind,
        count: u.count,
        ids: Array.from(u.ids),
      })),
    revealAll,
    isKeypadOpen: () => !!(X.keypad && X.keypad.isOpen()),
  };

  // ------------------------------------------------------------------
  // Save / load / reset
  // ------------------------------------------------------------------
  G.events.on("reset", () => {
    opened.clear();
    learned.clear();
    learnN = 0;
    try {
      if (X.keypad) X.keypad.close(true);
    } catch (e) {
      /* ignore */
    }
  });
  G.save.register("locks", {
    save: () => ({
      open: Array.from(opened),
      learned: Array.from(learned.entries()).map(([id, e]) => [
        id,
        e.src,
        e.day,
        e.hour,
      ]),
    }),
    load: (d) => {
      opened.clear();
      learned.clear();
      learnN = 0;
      if (!d) return;
      for (const id of d.open || []) opened.add(id);
      for (const e of d.learned || [])
        learned.set(e[0], {
          n: ++learnN,
          src: e[1] || "",
          day: e[2] || 1,
          hour: e[3] || 0,
        });
    },
  });
})();
