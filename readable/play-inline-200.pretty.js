/* src/poi_village/96_decay.js */
/* =====================================================================
 * NEW RAD CITY — poi_village / 96 clutter & decay pass
 * Runs G.poiClutter (94_clutter.js) over each interior after buildAll (called from 90_main),
 * through a second kit Builder sharing the interior builder's baked lights (same self-lit look).
 * Vignette props join ctx.loot (spawned on newGame/loaded) and notes join ctx.notes (initDone).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._pv) return;
  const PV = G._pv,
    K = PV.kit;

  const ROLE = {
    concrete: ["concrete"],
    plaster: ["plaster_stained"],
    rubble: ["rubble"],
    brick: ["brick_red"],
    wood: ["wood"],
    paper: ["plaster", 0xf0e8d0],
    dark: ["black_iron", 0x505050],
    tile: ["plaster", 0xe0dcd0],
    metal: ["rust"],
    glass: ["paint_green"],
    fabric: ["fabric"],
    brass: ["brass"],
    candle: ["lamp", 0xffc070],
    sheet: ["corrugated"],
    bulb: ["lamp", 0xffd090],
  };
  const NOTES = {
    pv_vn_chelsea_poem: [
      "Poem on Hotel Stationery",
      "HOTEL CHELSEA — 222 WEST 23RD STREET",
      "The bombs fell on a Sunday\nand nobody at the Chelsea woke\nbefore noon, which is to say\nwe missed the end of the world\nthe way we missed everything:\nbeautifully, and late.\n\nWe opened the good wine. We read each other the bad poems.\nThe radiator still knocks, three times, like it always did.\nWe let it in.",
    ],
    pv_vn_vanguard_digger: [
      "Tunnel Crew Chit",
      "FIVE BOROUGHS — STEAM TUNNEL 7th AVE SOUTH — WORK ORDER",
      "Crew of four sent down to find the leak under the club at 09:15, that March Sunday, slush to our ankles.\nFound it. At 09:47 the whole avenue shook down on top of us.\n\nWe got the cellar hatch open. The musicians rehearsing upstairs kept playing through it, the crazy bastards. We could hear the bass through the bricks for three days.\n\nThen we couldn't.",
    ],
    pv_vn_katz_counterman: [
      "Counterman's Last Order",
      "KATZ'S — TICKET #0001077",
      "Pastrami on rye, extra mustard, to go.\n\n(On the back:) Guy never came back for it. Sirens. Everybody ran. I stayed, somebody's gotta watch the brine.\n\nDay 9: the roaches are the size of cats. Day 12: the size of dogs. Day 15: I have locked myself in the office with the ledger. If Mrs. Dorfman comes asking, the recipe is in the ledger and the ledger is NOT for the roaches.",
    ],
    pv_vn_chinatown_soldier: [
      "Water-Stained Field Diary (translated)",
      "CARNET — CROSSED IN FRENCH AND ENGLISH",
      "Day 41 since Paris went silent. The Commandant says hold the transmitter until relieved.\n\nDay 200. No relief.\n\nYear 3. My hair comes out in the comb and my gums bleed when I smile, and I am still alive. The Commandant says this is our penance for what our masters did to this city. The Commandant has always had a strange sense of humour.\n\nYear 22, or near enough. I have stopped counting. The radio still hums. Someone, somewhere, must still be listening.",
    ],
    pv_vn_tombs_prisoner: [
      "Scratched Cell Plate",
      "BLOCK C — CELL 14",
      "THEY LEFT US LOCKED IN\nGUARDS WENT UP THE BRIDGE OF SIGHS AND NEVER CAME BACK\nWATER TAP WORKS 2 MORE DAYS\nTOMMY SAYS THE RAIDERS WILL FREE US\nTOMMY WAS WRONG\nTHEY SELL US NOW\n\n(a tally of marks, then:)\nIF YOU READ THIS GET THE KEY OFF MADDOX",
    ],
  };
  const CFG = {
    chelsea: {
      style: "settled",
      density: 0.65,
      decals: 0.7,
      collapses: 1,
      vignettes: [
        {
          kind: "lovers",
          near: "penthouse",
          note: "pv_vn_chelsea_poem",
          r: 12,
        },
        { kind: "shrine", near: "npc3", r: 12 },
      ],
    },
    vanguard: {
      style: "settled",
      density: 0.55,
      decals: 0.7,
      collapses: 1,
      vignettes: [
        {
          kind: "camp",
          near: "roach1",
          dead: true,
          note: "pv_vn_vanguard_digger",
          r: 12,
        },
      ],
    },
    katz: {
      style: "ruin",
      density: 1.35,
      decals: 1.4,
      collapses: 1,
      vignettes: [
        {
          kind: "last_stand",
          near: "ledger",
          note: "pv_vn_katz_counterman",
          r: 10,
        },
        { kind: "trail", near: "hoard", r: 10 },
      ],
    },
    chinatown: {
      style: "bunker",
      density: 1.05,
      decals: 1.1,
      collapses: 1,
      vignettes: [
        {
          kind: "last_stand",
          near: "transmitter",
          note: "pv_vn_chinatown_soldier",
          r: 12,
        },
        { kind: "camp", near: "gate", dead: true, r: 12 },
      ],
    },
    tombs: {
      style: "raider",
      density: 1.2,
      decals: 1.3,
      collapses: 1,
      vignettes: [
        { kind: "trail", near: "blockc", note: "pv_vn_tombs_prisoner", r: 12 },
        { kind: "camp", near: "raider2", r: 12 },
        { kind: "last_stand", near: "prison6", r: 10 },
      ],
    },
  };

  /** Fill light for the dark areas of an interior builder, right before it bakes (called from Builder.finish). */
  PV.fillCell = function (b) {
    if (!G.poiClutter || !G.poiClutter.fill) return;
    const id = b.name.replace(/_int$/, "");
    const def = (PV.defs || []).find((d) => d.id === id);
    const I = def && G.LAYOUT.INTERIORS[def.interior];
    if (!I) return;
    const off = b.off,
      tmp = [0, 0, 0];
    const lift =
      {
        katz: 0.05,
        chinatown: 0.05,
        vanguard: 0.04,
        tombs: 0.03,
        chelsea: 0.03,
      }[id] || 0;
    if (lift) b.amb = b.amb.map((v) => v + lift);
    G.poiClutter.fill({
      key: def.interior,
      ox: I.origin.x,
      oz: I.origin.z,
      half: 150,
      threshold: 0.3,
      max: 24,
      spacing: 7.5,
      radius: 9,
      intensity: 0.9,
      color: id === "chinatown" ? 0xffb070 : 0xffc27a,
      lum: (x, y, z) => {
        const c = b.lightAt(x, y, z, 0, 1, 0, tmp);
        return 0.3 * c[0] + 0.55 * c[1] + 0.15 * c[2];
      },
      adapter: {
        add(role, geom, m) {
          const r = ROLE[role] || ROLE.concrete;
          b.geo(r[0], geom, {
            matrix: new THREE.Matrix4()
              .makeTranslation(-off.x, -off.y, -off.z)
              .multiply(m),
            tint: r[1],
            grime: 0.2,
          });
        },
        light(x, y, z, c, i, r) {
          b.light(x - off.x, y - off.y, z - off.z, c, i, r);
        },
        glow(x, y, z, c, size) {
          b.glow(x - off.x, y - off.y, z - off.z, c, size);
        },
      },
    });
  };
  PV.decay = function (ctxs) {
    if (!G.poiClutter) return;
    const doorPts = [];
    for (const d of G.world.doors || []) {
      const df = d.def || d;
      if (df.pos) doorPts.push(df.pos);
      if (df.target) doorPts.push(df.target);
    }
    for (const ctx of ctxs) {
      const cfg = CFG[ctx.id];
      if (!cfg || !ctx.intRoot) continue;
      const I = G.LAYOUT.INTERIORS[ctx.key];
      if (!I) continue;
      const b = (K.builders || [])
        .filter((q) => q.name === ctx.id + "_int" && q.lit)
        .sort((p, q) => q.lights.length - p.lights.length)[0];
      if (!b) continue;
      const avoid = [];
      for (const k in ctx.anchors) {
        const v = ctx.anchors[k];
        avoid.push({
          x: v.x,
          y: v.y,
          z: v.z,
          r: /^(spawn|loot)/.test(k) ? 0.8 : 1.6,
        });
      }
      for (const p of doorPts)
        if (
          Math.abs(p.x - I.origin.x) < 170 &&
          Math.abs(p.z - I.origin.z) < 170
        )
          avoid.push({ x: p.x, y: p.y, z: p.z, r: 2.4 });
      for (const l of ctx.loot) avoid.push({ x: l.x, y: l.y, z: l.z, r: 1.1 });
      for (const n of ctx.notes) avoid.push({ x: n.x, y: n.y, z: n.z, r: 0.6 });
      const vign = [];
      for (const v of cfg.vignettes) {
        const a = ctx.anchors[v.near];
        if (a)
          vign.push(Object.assign({}, v, { at: { x: a.x, y: a.y, z: a.z } }));
      }
      const nb = K.builder({
        name: ctx.id + "_decay",
        off: b.off,
        lit: true,
        floors: b.floors,
        grime: 0.3,
      });
      nb.amb = b.amb.slice();
      nb.lights = b.lights;
      nb.burns = [];
      const off = b.off,
        inv = new THREE.Matrix4().makeTranslation(-off.x, -off.y, -off.z);
      const tmp = [0, 0, 0];
      const res = G.poiClutter.run({
        key: ctx.key,
        ox: I.origin.x,
        oz: I.origin.z,
        half: 150,
        style: cfg.style,
        density: cfg.density,
        decals: cfg.decals,
        collapses: cfg.collapses,
        avoid,
        vignettes: vign,
        root: ctx.intRoot,
        decalGain: 1.1,
        lightAt: (x, y, z) => b.lightAt(x, y, z, 0, 1, 0, tmp).slice(),
        adapter: {
          add(role, geom, m) {
            const r = ROLE[role] || ROLE.concrete;
            nb.geo(r[0], geom, {
              matrix: inv.clone().multiply(m),
              tint: r[1],
              grime: 0.3,
            });
          },
          finish() {
            const g = nb.finish(null);
            if (g) ctx.intRoot.add(g);
          },
        },
      });
      for (const pr of res.props) {
        const o = Object.assign({}, pr.opts);
        ctx.loot.push(
          Object.assign(
            { type: pr.type, yaw: o.yaw || 0, container: false },
            o,
          ),
        );
      }
      for (const nt of res.notes) {
        const d = NOTES[nt.note];
        if (!d) continue;
        ctx.notes.push({
          id: nt.note,
          name: d[0],
          title: d[1],
          text: d[2],
          type: "note",
          x: nt.x,
          y: nt.y,
          z: nt.z,
        });
      }
    }
  };
})();

// ---------------------------------------------------------------------------
// Settlement life: sandbox roamers & small talk (G.poiSandbox, 93_sandbox.js)
// ---------------------------------------------------------------------------
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G._pv) return;
  const PV = G._pv;
  const CHELSEA = [
    [
      "The radiator knocked three times last night.",
      "Mr. Moretz. He always did want to be let in.",
    ],
    [
      "I am painting nothing but green this year.",
      "Everything IS green this year.",
    ],
    ["Stanley says rent is due.", "Rent has been due since '67."],
    [
      "Leopold offered me twelve scrip for my sonnet.",
      "Take it. Sonnets are not what they were.",
    ],
  ];
  const VANGUARD = [
    [
      "The drummer has a new fill.",
      "He has had the same fill for twenty-two years. It is still new to me.",
    ],
    [
      "You think the robots know it is jazz?",
      "Hon, they know it better than we do.",
    ],
    ["Mags is watering the gin again.", "Mags is watering the WATER again."],
  ];
  G.events.on("initDone", () => {
    try {
      const SB = G.poiSandbox;
      if (!SB) return;
      const spots = (poi, names) =>
        names
          .map((n) => PV.anchor(poi, n))
          .filter(Boolean)
          .map((v) => ({ x: v.x, y: v.y, z: v.z, yaw: v.yaw || 0 }));
      SB.add("pv_chelsea_res1", {
        group: "chelsea",
        spots: spots("chelsea", ["npc1", "stanley", "merchant", "npc2"]),
        chat: CHELSEA,
        chatChance: 0.5,
      });
      SB.add("pv_chelsea_res2", {
        group: "chelsea",
        spots: spots("chelsea", ["npc3", "npc2", "vivienne", "npc1"]),
        chat: CHELSEA,
        chatChance: 0.5,
      });
      SB.add("pv_vv_settler", {
        group: "vanguard",
        spots: spots("vanguard", ["yard", "stage", "bartender", "npc3"]),
        chat: VANGUARD,
        chatChance: 0.6,
      });
      SB.add("pv_vv_bouncer", {
        group: "vanguard",
        spots: spots("vanguard", ["npc3", "stage", "npc3", "bartender"]),
        chat: VANGUARD,
        chatChance: 0.3,
      });
    } catch (e) {
      G.reportError("poi_village:sandbox", e);
    }
  });
})();
