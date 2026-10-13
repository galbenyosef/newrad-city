// play-inline-553 01 — items
// Lines 23-364 of readable/play-inline-553.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;

  const KEYS = ["malone", "tull", "rook"];
  const KID_SPOT = { x: -82, z: -5 }; // 34th Street, west of 7th Avenue: the ruins of the Garden
  const now = () => (G.time ? G.time.elapsed : 0);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const tier = () => L.standingTier(); // 0 Trusted … 4 Feared
  const LOCK_ROOK = {
    id: "q_comp_rook_lockbox",
    label: "Rook's Lockbox",
    code: "0312",
    kind: "container",
    hint: "Rook tells you the combination when she asks you to fetch the box.",
    learnedFrom: ["Rook (Washington Square Arch)"],
  };
  function learnLock(id, src) {
    if (G.locks && G.locks.learn) {
      try {
        G.locks.learn(id, src);
      } catch (e) {
        /* */
      }
    }
  }
  function knows(id) {
    return !!(G.locks && G.locks.isKnown && G.locks.isKnown(id));
  }

  // ------------------------------------------------------------------
  // Per-companion state (persistent, inside quest flags)
  // ------------------------------------------------------------------
  function st(k) {
    let s = L.flag("comp_" + k);
    if (!s || typeof s !== "object") {
      s = {
        met: false,
        rec: false,
        hired: false,
        wait: null,
        far: false,
        melee: false,
        passive: false,
        inv: null,
        left: false,
        dismissed: false,
        hostile: false,
        paid: 0,
        n: 0,
        lastDay: -1,
      };
      L.setFlag("comp_" + k, s);
    }
    return s;
  }
  const cfg = {}; // roster, filled below
  const actor = (k) => L.npc(cfg[k].id);
  /** The human companion currently hired (following or waiting), or null. */
  function current() {
    for (const k of KEYS) {
      const s = st(k);
      if (s.rec && !s.hostile) return k;
    }
    return null;
  }
  function following(k) {
    const s = st(k);
    const a = actor(k);
    return s.rec && !s.wait && a && !a.dead ? a : null;
  }
  /** Response ids that change after every command, so orders never show as "already said". */
  const cid = (k, name) => name + "#" + (st(k).n || 0);
  const bump = (k) => {
    const s = st(k);
    s.n = (s.n || 0) + 1;
  };

  // ------------------------------------------------------------------
  // Inventory & weapons
  // ------------------------------------------------------------------
  function resolveInv(list) {
    const out = [];
    for (const e of list) {
      const id = L.item(e[0]);
      if (id) out.push([id, e[1]]);
    }
    return out;
  }
  function ensureInv(k) {
    const s = st(k);
    if (!Array.isArray(s.inv)) s.inv = resolveInv(cfg[k].startInv);
    return s.inv;
  }
  function weaponInfo(id) {
    if (!id || id === "scrip" || G.isStub("items") || !G.items.get) return null;
    const d = G.items.get(id);
    if (!d || d.type !== "weapon") return null;
    let w = d.weapon || null;
    if (!w && !G.isStub("weapons") && G.weapons.getDef) {
      try {
        const wd = G.weapons.getDef(id);
        w = wd && (wd.weapon || wd);
      } catch (e) {
        w = null;
      }
    }
    if (!w) return null;
    if (w.skill === "explosives" || /grenade|mine/.test(id)) return null; // thrown things stay in the pack
    const sk = w.skill;
    const melee = !!(w.melee || sk === "melee" || w.reloadType === "melee");
    const dps =
      (w.damage || 5) *
      Math.max(0.3, Math.min(6, w.rof || 1)) *
      (w.pellets || 1);
    return { id, melee, score: dps + (d.value || 0) * 0.02 };
  }
  /** Companions use the best weapon they carry, of the preferred kind if they have one. */
  function ensureWeapon(k, force) {
    const a = actor(k);
    const s = st(k);
    if (!a || a.dead || typeof a.equipWeapon !== "function") return;
    const ws = ensureInv(k)
      .map((e) => weaponInfo(e[0]))
      .filter(Boolean);
    if (!ws.length) {
      // everything was taken off them: fight with fists, don't keep swinging a gun they no longer carry
      if (a.weaponId) {
        try {
          a.equipWeapon(null);
        } catch (e) {
          G.reportError("quests:companionWeapon", e);
        }
      }
      return;
    }
    const pref = ws.filter((w) => w.melee === !!s.melee);
    const pool = pref.length ? pref : ws;
    pool.sort((x, y) => y.score - x.score);
    const best = pool[0].id;
    if (force || a.weaponId !== best) {
      try {
        a.equipWeapon(best);
      } catch (e) {
        G.reportError("quests:companionWeapon", e);
      }
    }
  }
  function openInventory(k) {
    const a = actor(k);
    const s = st(k);
    const c0 = cfg[k];
    if (!a || a.dead) return;
    if (G.isStub("containers") || !G.containers.create) {
      L.notify(c0.short + " shrugs. (No container system.)");
      return;
    }
    const cid2 = "q_comp_inv_" + k;
    let c = G.containers.get ? G.containers.get(cid2) : null;
    if (!c)
      c = G.containers.create({
        id: cid2,
        name: c0.short,
        items: [],
        model: false,
        interact: false,
        owner: null,
      });
    if (!c) return;
    // The quest flags are authoritative: refill from them every time.
    const items = new Map(),
      conds = new Map();
    for (const e of ensureInv(k)) {
      if (e[1] > 0) {
        items.set(e[0], (items.get(e[0]) || 0) + e[1]);
        if (Array.isArray(e[2]) && e[2].length) conds.set(e[0], e[2].slice());
      }
    }
    c.items = items;
    c.conds = conds;
    c.owner = null;
    c.locked = 0;
    c.playerStored = true;
    c.onClose = function () {
      const before = a.weaponId;
      s.inv = [];
      for (const [id, n] of c.items)
        if (n > 0)
          s.inv.push(
            c.conds.has(id) ? [id, n, c.conds.get(id).slice()] : [id, n],
          );
      a.inventory = s.inv.map((e) => [e[0], e[1]]);
      ensureWeapon(k);
      if (a.weaponId && a.weaponId !== before) {
        const wn = (G.items.get(a.weaponId) || {}).name || "this";
        L.later(0.4, () => bark(k, c0.newWeapon(wn), 4, true));
      }
    };
    if (G.ui && typeof G.ui.openContainer === "function" && !G.isStub("ui"))
      G.ui.openContainer(c);
    else if (G.containers.open) G.containers.open(c);
  }

  // ------------------------------------------------------------------
  // Talents (companion bonuses through rpg's effect system)
  // ------------------------------------------------------------------
  const talentOn = {};
  const FX = "comp_talent_";
  function syncTalent(k) {
    if (G.isStub("rpg") || !G.rpg.addEffect) return;
    const s = st(k);
    const want = s.rec && !s.hostile;
    const p = cfg[k].talent();
    const sig = want ? p.name + JSON.stringify(p.mods) : "";
    if (talentOn[k] === sig) return;
    try {
      G.rpg.removeEffect(FX + k);
    } catch (e) {
      /* */
    }
    if (want) {
      try {
        G.rpg.addEffect({
          id: FX + k,
          name: p.name,
          kind: "buff",
          duration: 0,
          mods: p.mods,
          source: "companion",
          desc: p.desc,
        });
      } catch (e) {
        G.reportError("quests:companionTalent", e);
      }
    }
    talentOn[k] = sig;
  }

  // ------------------------------------------------------------------
  // Commands
  // ------------------------------------------------------------------
  function homeOf(k) {
    const c0 = cfg[k];
    if (!c0._home) c0._home = c0.home() || { x: 0, y: 0, z: 0 };
    return c0._home;
  }
  function setGuard(a, x, z, r) {
    a.aiMode = "guard";
    a.home = { x, z, r: r || 2 };
    try {
      a.follow(null);
    } catch (e) {
      /* */
    }
  }
  function startFollow(k) {
    const a = actor(k);
    const s = st(k);
    s.wait = null;
    if (!a || a.dead) return;
    a.faction = "player";
    a.essential = true;
    try {
      if (a.setHostile) a.setHostile(false);
    } catch (e) {
      /* */
    }
    a.aiMode = "follow";
    try {
      a.follow("player");
    } catch (e) {
      G.reportError("quests:follow", e);
    }
  }
  function recruit(k, how) {
    const s = st(k);
    const c0 = cfg[k];
    const other = current();
    if (other && other !== k) return false;
    s.rec = true;
    s.hired = true;
    s.met = true;
    s.left = false;
    s.dismissed = false;
    s.wait = null;
    s.how = how || s.how || "hired";
    s.hiredAt = G.time ? G.time.day : 1;
    startFollow(k);
    ensureWeapon(k, true);
    syncTalent(k);
    setBarks(k);
    bump(k);
    L.notify(c0.short + " has joined you.");
    L.hint(
      "companions",
      "Talk to your companion to give orders: wait or follow, keep your distance, switch weapons, change combat stance, or trade items. Only one hired companion can travel with you at a time.",
      1.2,
    );
    return true;
  }
  function doWait(k) {
    const a = actor(k);
    const s = st(k);
    bump(k);
    if (!a) return;
    s.wait = {
      x: +a.pos.x.toFixed(2),
      y: +a.pos.y.toFixed(2),
      z: +a.pos.z.toFixed(2),
    };
    setGuard(a, s.wait.x, s.wait.z, 1.5);
  }
  function doFollow(k) {
    bump(k);
    startFollow(k);
  }
  /** Part ways (dismiss or standing walk-out): they head home and keep their gear. */
  function release(k, why) {
    const a = actor(k);
    const s = st(k);
    const h = homeOf(k);
    s.rec = false;
    s.wait = null;
    bump(k);
    if (why === "standing") {
      s.left = true;
      s.leftTier = tier();
    } else s.dismissed = true;
    if (a && !a.dead) {
      a.faction = cfg[k].faction;
      setGuard(a, h.x, h.z, 2);
      try {
        if (a.moveTo) a.moveTo(h.x, h.z);
      } catch (e) {
        /* */
      }
      a._compHomeT = now();
    }
    syncTalent(k);
    setBarks(k);
  }
