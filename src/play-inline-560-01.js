// play-inline-560 01 — ids
// Lines 21-365 of readable/play-inline-560.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const N = () => L.neonTown;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const TS = { x: -40, z: -262 };
  const IXM = () => (G.LAYOUT ? G.LAYOUT.INTERIOR_X_MIN : 2500);
  const npcM = (id, label) => ({ npc: id, label });
  const QID = "sq_neon_contract";

  // ==================================================================
  // Contracts
  // ==================================================================
  const KINDS = [
    {
      k: "maniacs",
      what: "a Maniac nest",
      minL: 1,
      pack: (l) => [
        ["maniac", 4 + (l >= 6 ? 1 : 0)],
        l >= 8 ? ["maniac_bruiser", 1] : null,
      ],
      brief:
        "A Maniac pack came up a subway vent and they're nesting in the wreck of a crosstown bus. The night watch can hear them howling from the north gate. Go make it quiet.",
    },
    {
      k: "raiders",
      what: "a raider crew",
      minL: 1,
      pack: (l) => [["raider", 3 + (l >= 5 ? 1 : 0) + (l >= 10 ? 1 : 0)]],
      brief:
        "Terminal Boys stragglers set up a toll on a Midtown corner. Charging wagons to pass. We don't allow tolls. Except ours. Go end theirs.",
    },
    {
      k: "burrowrats",
      what: "a burrow rat warren",
      minL: 1,
      maxL: 9,
      pack: () => [["burrow_rat", 5]],
      brief:
        "Burrow rats dug up through a water main and now they're eating the Depot's grain as it goes past. Bev wants the meat. I want them gone. Everybody wins except the rats.",
    },
    {
      k: "dogs",
      what: "a wild dog pack",
      minL: 1,
      maxL: 12,
      pack: (l) => [["dog", 4 + (l >= 6 ? 1 : 0)]],
      brief:
        "Wild dogs have been running down porters on the avenue. Big ones. Hungry ones. Smart ones, which is the worst kind.",
    },
    {
      k: "ants",
      what: "giant ants",
      minL: 3,
      pack: (l) => [["giant_ant", 4], l >= 7 ? ["fire_ant", 1] : null],
      brief:
        "Giant ants. Out of a storm drain, big as a dog, marching on the market like they've got a shopping list. Burn the column before it finds the noodle stand.",
    },
    {
      k: "stingers",
      what: "Stingers",
      minL: 6,
      pack: (l) => [["stinger", 2 + (l >= 10 ? 1 : 0)]],
      brief:
        "Stingers. In Manhattan. Don't ask me how — the Captain thinks a wagon brought eggs up from the Jersey flats. Kill them before they lay more.",
    },
    {
      k: "brutes",
      what: "a Brute patrol",
      minL: 7,
      pack: (l) => [["brute", 2 + (l >= 11 ? 1 : 0)]],
      brief:
        "Brutes scouting down from Herald Square. A patrol this close means a war party behind it. Kill the scouts, the war party loses its eyes.",
    },
    {
      k: "ashbear",
      what: "an Ash bear",
      minL: 10,
      pack: (l) => [["ash_bear", 1], l >= 14 ? ["dog", 2] : null],
      brief:
        "An Ash bear walked out of the Park and down the avenue like it owns the lease. It killed two pack oxen and a porter's hat. The porter was in the hat. Put it down.",
    },
  ];
  const FRIENDLY = [
    "times_square",
    "radio_city",
    "grand_central",
    "rockefeller",
    "st_patricks",
    "carnegie_hall",
    "plaza_hotel",
    "flatiron",
    "cryo_c9",
  ];
  let siteCache = null;
  /** Real Midtown intersections for contracts: open street, off every site / location, on land. */
  function contractSites() {
    if (siteCache) return siteCache;
    const Ly = G.LAYOUT,
      out = [];
    if (!Ly || !Ly.avenues || !Ly.streets) return (siteCache = out);
    for (const a of Ly.avenues)
      for (const s of Ly.streets) {
        if (s.park) continue;
        const x = a.x,
          z = s.z;
        if (z < a.z0 + 8 || z > a.z1 - 8 || x < s.x0 + 8 || x > s.x1 - 8)
          continue;
        const d = Math.hypot(x - TS.x, z - TS.z);
        if (d < 150 || d > 520) continue;
        if (!Ly.isLand(x, z) || (Ly.inPark && Ly.inPark(x, z))) continue;
        if (Ly.siteAt(x, z, 18)) continue;
        if (Ly.locationAt(x, z)) continue;
        let bad = false;
        for (const id of FRIENDLY) {
          const l = Ly.getLocation(id);
          if (l && Math.hypot(x - l.x, z - l.z) < l.r + 70) {
            bad = true;
            break;
          }
        }
        if (bad) continue;
        const st = Ly.streetNameAt(x, z),
          av = Ly.avenueNameAt(x, z);
        out.push({
          x,
          z,
          name: (st || "the cross street") + " & " + (av || "the avenue"),
        });
      }
    return (siteCache = out);
  }
  const C = () => L.flag("neon_contract") || null;
  function lvl() {
    return Math.max(1, L.level());
  }
  function newContract() {
    const l = lvl();
    const kinds = KINDS.filter((k) => l >= k.minL && (!k.maxL || l <= k.maxL));
    const last = C();
    const kind = pick(
      kinds.filter((k) => !last || k.k !== last.kind).length
        ? kinds.filter((k) => !last || k.k !== last.kind)
        : kinds,
    );
    const sites = contractSites().filter(
      (s) => !last || Math.hypot(s.x - last.x, s.z - last.z) > 60,
    );
    let site = null;
    for (let tries = 0; tries < 12 && sites.length; tries++) {
      const s = pick(sites);
      const f = L.freeSpot(s.x, s.z, 0, { maxR: 10 });
      if (f && !f.forced) {
        site = { x: f.x, y: f.y, z: f.z, name: s.name };
        break;
      }
    }
    if (!site) return null;
    const n = (Number(L.flag("neon_contract_n")) || 0) + 1;
    const pack = kind.pack(l).filter(Boolean);
    const ids = [];
    pack.forEach(([type, cnt]) => {
      for (let i = 0; i < cnt; i++)
        ids.push({ id: "nc" + n + "_" + ids.length, type });
    });
    const pay = Math.round((55 + l * 12 + ids.length * 8) / 5) * 5;
    return {
      n,
      kind: kind.k,
      what: kind.what,
      brief: kind.brief,
      x: site.x,
      y: site.y,
      z: site.z,
      place: site.name,
      ids,
      lvl: l,
      pay,
      xp: 60 + l * 12,
    };
  }
  function spawnContract(c) {
    if (!c) return;
    const K = KINDS.find((k) => k.k === c.kind) || KINDS[0];
    c.ids.forEach((t, i) => {
      if (L.isDead(t.id)) return;
      const ang = i * 2.39996,
        r = 2 + (i % 3) * 2.2;
      const s = L.freeSpot(
        c.x + Math.cos(ang) * r,
        c.z + Math.sin(ang) * r,
        c.y || 0,
        { maxR: 6 },
      ) || { x: c.x, y: c.y || 0, z: c.z };
      const boss =
        t.type === "maniac_bruiser" ||
        t.type === "ash_bear" ||
        (K.k === "raiders" && i === 0);
      const def = {
        id: t.id,
        type: t.type,
        level: c.lvl + (boss ? 2 : 0),
        pos: { x: s.x, y: s.y, z: s.z },
        ai: "guard",
        home: { x: s.x, z: s.z, r: 9 },
        hostile: true,
        noRespawn: true,
      };
      if (t.type === "raider") {
        def.faction = "raiders";
        def.voice = "raider";
        if (boss) {
          def.name = pick([
            "Toll Boss Vic",
            "Crowbar Kate",
            "Two-Tooth Tommy",
            "Big Mouth Benny",
          ]);
          def.weapon = c.lvl >= 6 ? "assault_rifle" : "combat_shotgun";
        }
      }
      L.spawnNPC(def);
    });
  }
  function aliveTargets(c, extraDead) {
    return c ? c.ids.filter((t) => t.id !== extraDead && !L.isDead(t.id)) : [];
  }
  function contractMarker() {
    const c = C();
    if (!c) return [];
    const alive = aliveTargets(c)
      .map((t) => L.npc(t.id))
      .filter((a) => a && !a.dead && a.pos);
    if (
      alive.length &&
      alive.some((a) => Math.hypot(a.pos.x - c.x, a.pos.z - c.z) < 60)
    ) {
      let x = 0,
        z = 0;
      alive.forEach((a) => {
        x += a.pos.x;
        z += a.pos.z;
      });
      return [
        {
          x: x / alive.length,
          z: z / alive.length,
          label: "Contract: " + c.what,
        },
      ];
    }
    return [{ x: c.x, z: c.z, label: "Contract: " + c.what }];
  }
  function acceptContract() {
    const c = newContract();
    if (!c) {
      L.notify("The bounty board is empty. Come back tomorrow.");
      return false;
    }
    // radiant: the quest id is reused — clear its old completed/failed record first
    if (Q.isComplete(QID) || Q.isFailed(QID)) L.STATE.delete(QID);
    cleanupOld();
    L.setFlag("neon_contract_n", c.n);
    L.setFlag("neon_contract", c);
    spawnContract(c);
    Q.start(QID);
    Q.setTracked(QID);
    return true;
  }
  function cleanupOld() {
    const prev = L.flag("neon_contract_prev");
    if (prev && prev.ids) for (const t of prev.ids) L.removeNPC(t.id);
    L.setFlag("neon_contract_prev", null);
  }
  function payContract() {
    const c = C();
    if (!c) return;
    const done = L.incFlag("neon_contracts_done");
    const def = L.DEFS.get(QID);
    def.rewards = { xp: c.xp, scrip: c.pay, standing: 10 };
    Q.complete(QID);
    L.setFlag("neon_contract_day", G.time.day);
    L.setFlag("neon_contract_prev", { ids: c.ids });
    L.setFlag("neon_contract", null);
    if (done === 3) {
      L.giveScrip(100);
      L.notify(
        'Contract bonus: +100 scrip. "Three for three. You\'re starting to look like a guard."',
      );
    }
    if (done === 5) {
      L.setFlag("neon_marksman", true);
      marksman();
      L.notify(
        "Neon Marksman: Sergeant Mulroney pins a tin sharpshooter's badge on your collar. +1 Senses, +3 Firearms.",
      );
      L.news(
        'Word from the Neon: the Guard\'s newest contract hunter has cleared five nests around Midtown. Sergeant Mulroney says the avenues are "almost boring now. Almost."',
      );
    }
    if (done === 10) {
      L.giveScrip(300);
      L.standing(50, "Ten contracts for the Neon Guard");
      L.news(
        "The Neon Guard toasts its busiest contractor: ten nests, crews and packs cleared from the streets around Times Square. Mayor Crowe has proposed a statue. Nobody has seconded it.",
      );
    }
  }
  function abandonContract() {
    const c = C();
    if (!c) return;
    Q.fail(QID);
    L.setFlag("neon_contract_prev", { ids: c.ids });
    L.setFlag("neon_contract", null);
    L.setFlag("neon_contract_day", G.time.day);
  }
  /** 5-contract reward: a permanent effect (re-applied after every load, like the companion bonuses). */
  function marksman() {
    if (!L.flag("neon_marksman") || G.isStub("rpg") || !G.rpg.addEffect) return;
    try {
      G.rpg.removeEffect && G.rpg.removeEffect("neon_marksman");
      G.rpg.addEffect({
        id: "neon_marksman",
        name: "Neon Marksman",
        kind: "buff",
        duration: 0,
        mods: { attrs: { senses: 1 }, skills: { firearms: 3 } },
        source: "quest",
        desc: "Mulroney's tin sharpshooter's pin. +1 Senses, +3 Firearms.",
      });
    } catch (e) {
      G.reportError("quests:neonMarksman", e);
    }
  }
  const canTakeContract = () =>
    !!L.flag("neon_guard_member") &&
    !Q.isActive(QID) &&
    L.flag("neon_contract_day") !== G.time.day;

  // ==================================================================
  // Word on the Street (rumour leads)
  // ==================================================================
  const RID = "misc_neon_rumors";
