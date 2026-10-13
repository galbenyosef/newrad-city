// play-inline-617 01 — spec
// Lines 33-351 of readable/play-inline-617.pretty.js (statement-aligned).
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
