/* src/poi_uptown/96_decay_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 96 clutter & decay pass
 * Runs G.poiClutter (94_clutter_interior.js) over each of our five interiors once all builders ran
 * (called from 90_main_interior.js at init), through a second baked Batch that shares the interior's lights,
 * so debris is lit exactly like the room around it. Also authors the per-POI environmental
 * story vignettes (skeletons, camps, barricades) and their notes; props/notes spawn at initDone.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pu) return;
  const P = G._pu;

  // role → uptown material key (+ tint)
  const ROLE = {
    concrete: ["concrete", 0xb8b2a6],
    plaster: ["plaster_ruin", 0xd0c8b4],
    rubble: ["rubble"],
    brick: ["brick_red"],
    wood: ["wood"],
    paper: ["paper", 0xe0d8c0],
    dark: ["paint_black", 0x202020],
    tile: ["plaster_ruin", 0xe8e2d0],
    metal: ["rust"],
    glass: ["paint_green", 0x4a6a40],
    fabric: ["fabric"],
    brass: ["gold", 0xb08a40],
    candle: ["candle"],
    sheet: ["corrugated", 0xb0a898],
    bulb: ["lamp_dim"],
  };

  // Notes found at the vignettes (one or two per POI).
  const NOTES = {
    pu_vn_amnh_guard: [
      "Guard's Log, Scrap",
      "MUSEUM SECURITY — DUTY LOG, SUN MAR 5 1967",
      "Sirens at 9:47. Director says lock the Rotunda, nobody in or out, protect the collection.\n\nProtect it from WHAT, Harold? The sky is on fire.\n\nForty-one Sunday-school kids from the morning planetarium show are in the Akeley hall with us. Their teacher keeps counting them. I let the guy with the hot dog cart in too. Director can write me up.\n\nMar 11. Water is out. Kids are eating the cafeteria's old pudding cups. Something big is walking around in the dinosaur wing at night. It is NOT a dinosaur. I checked. Twice.\n\nApr 16. Moving everybody up to the Ocean hall. The whale has always made them feel safe. Taking the shotgun and the last box of shells. I'll hold the Rotunda.",
    ],
    pu_vn_amnh_intern: [
      "Collections Intern's Note",
      "TO WHOEVER FINDS THIS",
      "I tagged everything. Every bone, every beetle drawer, every glass eye. Catalogue numbers in the green binder.\n\nDr. Osei said the eggs in the Hall of Dinosaurs were plaster. They are not plaster anymore. They are warm.\n\nI am not going back in there for the binder.",
    ],
    pu_vn_dakota_party: [
      "Invitation, Water-Stained",
      "The Residents' Committee of The Dakota",
      "requests the pleasure of your company at a CANDLELIGHT SUPPER in the Lounge,\nMonday, March the sixth, nineteen sixty-seven...\n\n(The printed card is smudged. Someone has written across it, in shaking pencil:)\n\nIt is still on. We will NOT go down to the shelter with the doormen. We have standards. Bring the good silver. Mrs. Pell says the air is fine if you keep the windows shut.",
    ],
    pu_vn_dakota_barricade: [
      "Scrawled Warning",
      "DO NOT GO UP",
      "Barricaded the third floor landing with the Van Rensselaers' dining set. The Hollis woman is still singing up there. The baby stopped a week ago. The singing did not.\n\nIf you hear a music box: RUN.",
    ],
    pu_vn_plaza_memo: [
      "Plaza Society Minutes",
      "MINUTES — HOUSE COMMITTEE, 1981",
      'Item 1: The ceiling in the east corridor has come down again. Motion to call it "a rustic feature" carried, 6 to 1 (Mr. Farnsworth dissenting, loudly).\n\nItem 2: Whoever is keeping a pack oxen calf in Suite 614 will be fined.\n\nItem 3: The Pemberton rule stands. No raiders, no Brutes, no one wearing a sack as a garment. Exceptions for scrip.',
    ],
    pu_vn_carnegie_program: [
      "Concert Program, 1967",
      "CARNEGIE HALL — SUNDAY, MARCH 5, 1967 — 9:00 AM (OPEN DRESS REHEARSAL)",
      'This morning: the New York Philharmonic rehearses tonight\'s PATRIOTIC GALA for the Troops in Iceland. Admission free; coffee in the lobby.\n\nMahler, Symphony No. 2 "Resurrection"\n\n(In the margin, in pencil:) We got as far as the fourth movement. The conductor told us to keep playing. Half the orchestra did. I have never heard the hall sound like that and I never will again.',
    ],
    pu_vn_tiffany_raider: [
      "Raider's Tally",
      "SHINY ROCK COUNT",
      "Day 1: 14 shiny rocks. Boss took 12.\nDay 2: 3 shiny rocks. Boss took 3.\nDay 3: found a WATCH. Boss took it. Boss can't tell time.\nDay 4: Skinner says the big round door downstairs has the REAL rocks. Skinner went down there with a crowbar.\nDay 5: Skinner is still down there. The water is humming.\nDay 6: I am keeping the next rock.",
    ],
    pu_vn_tiffany_clerk: [
      "Floor Manager's Memo",
      "TIFFANY & CO. — STAFF ONLY",
      "In the event of a nuclear attack, staff will proceed calmly to the basement vault. Customers are NOT to be admitted to the vault under any circumstances.\n\nInventory is to be locked before evacuation.\n\n(Underneath, a different hand:) We locked the inventory. Mr. Delacroix locked the vault. From the inside.",
    ],
  };

  const CFG = {
    amnh_int: {
      key: "amnh",
      style: "ruin",
      density: 1.15,
      decals: 1.2,
      collapses: 2,
      vignettes: [
        {
          kind: "last_stand",
          near: "rotunda",
          note: "pu_vn_amnh_guard",
          r: 14,
        },
        { kind: "trail", near: "storage", note: "pu_vn_amnh_intern", r: 12 },
        { kind: "camp", near: "akeley", dead: true, r: 14 },
      ],
    },
    dakota_int: {
      key: "dakota",
      style: "hotel",
      density: 1.0,
      decals: 1.1,
      collapses: 1,
      vignettes: [
        { kind: "lovers", near: "lounge", note: "pu_vn_dakota_party", r: 10 },
        {
          kind: "barricade",
          near: "stair_hall",
          note: "pu_vn_dakota_barricade",
          r: 10,
        },
        { kind: "trail", near: "storage", r: 10 },
      ],
    },
    plaza_int: {
      key: "plaza_hotel",
      style: "settled",
      density: 0.6,
      decals: 0.6,
      collapses: 1,
      vignettes: [
        { kind: "shrine", near: "ballroom", note: "pu_vn_plaza_memo", r: 14 },
        { kind: "last_stand", near: "kitchen", r: 10 },
      ],
    },
    carnegie_int: {
      key: "carnegie_hall",
      style: "settled",
      density: 0.55,
      decals: 0.6,
      collapses: 1,
      vignettes: [
        {
          kind: "shrine",
          near: "lobby",
          note: "pu_vn_carnegie_program",
          r: 10,
        },
        { kind: "lovers", near: "tier1", r: 10 },
      ],
    },
    tiffany_int: {
      key: "tiffany",
      style: "raider",
      density: 1.25,
      decals: 1.4,
      collapses: 1,
      vignettes: [
        {
          kind: "camp",
          near: "silver_floor",
          note: "pu_vn_tiffany_raider",
          r: 12,
        },
        {
          kind: "last_stand",
          near: "security",
          note: "pu_vn_tiffany_clerk",
          r: 10,
        },
        { kind: "trail", near: "sales_floor", r: 14 },
      ],
    },
  };

  const results = [];
  function lightFn(b) {
    return (x, y, z) => {
      let r = b.ambient ? b.ambient.r : 0.2,
        g = b.ambient ? b.ambient.g : 0.2,
        bb = b.ambient ? b.ambient.b : 0.2;
      for (const l of b.lights) {
        const dx = l.p.x - x,
          dy = l.p.y - y,
          dz = l.p.z - z,
          d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > l.r * l.r) continue;
        const d = Math.sqrt(d2) || 1e-3,
          f = 1 - d / l.r,
          att = f * f * l.i,
          w = att * (0.22 + 0.78 * Math.max(0, dy / d));
        r += l.c.r * w;
        g += l.c.g * w;
        bb += l.c.b * w;
      }
      // uptown lit materials: albedo × (bake × 1.5) + the dim interior scene light
      return [
        Math.min(1.8, r) * 1.5 + 0.06,
        Math.min(1.8, g) * 1.5 + 0.06,
        Math.min(1.8, bb) * 1.5 + 0.06,
      ];
    };
  }

  /** Fill light for dark areas of an interior site, before its batch bakes (called from S.build). */
  P.fillCell = function (S) {
    if (!G.poiClutter || !G.poiClutter.fill) return;
    const I = G.LAYOUT.INTERIORS[S.interiorKey];
    if (!I) return;
    const lf = lightFn(S.b);
    G.poiClutter.fill({
      key: S.interiorKey,
      ox: I.origin.x,
      oz: I.origin.z,
      half: 150,
      threshold: 0.55,
      max: 14,
      spacing: 10,
      intensity: 1.1,
      radius: 10,
      lum: (x, y, z) => {
        const c = lf(x, y, z);
        return 0.3 * c[0] + 0.55 * c[1] + 0.15 * c[2];
      },
      adapter: {
        add(role, geom, m) {
          const r = ROLE[role] || ROLE.concrete;
          S.b.geo(
            r[0],
            geom,
            new THREE.Matrix4()
              .makeTranslation(-S.ox, -S.oy, -S.oz)
              .multiply(m),
            { c: r[1], grime: 0.2 },
          );
        },
        light(x, y, z, c, i, r) {
          S.b.light(x - S.ox, y - S.oy, z - S.oz, c, r, i);
        },
        glow(x, y, z, c, size) {
          S.glow(x - S.ox, y - S.oy, z - S.oz, c, size);
        },
      },
    });
  };
  P.decay = function () {
    if (!G.poiClutter) return;
    const doorPts = [];
    for (const d of G.world.doors || []) {
      const df = d.def || d;
      if (df.pos) doorPts.push(df.pos);
      if (df.target) doorPts.push(df.target);
    }
    for (const S of P.sites) {
      const cfg = CFG[S.id];
      if (!cfg || !S.b) continue;
      const I = G.LAYOUT.INTERIORS[cfg.key];
      if (!I) continue;
      const poiAnchors = S.anchors || {};
      const avoid = [];
      for (const k in poiAnchors) {
        const v = poiAnchors[k];
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
      // keep every doorway cut into a wall clear (debris was being dropped straight into the Dakota flats' doors etc.)
      for (const w of S.holes || [])
        for (const h of w.holes) {
          if (h[2] > 0.5) continue; // windows / high openings
          const y = S.oy + w.y0 + h[2];
          for (
            let u = h[0];
            u <= h[1] + 1e-6;
            u += Math.max(0.5, Math.min(1.0, (h[1] - h[0]) / 2))
          )
            for (const dd of [-0.9, 0, 0.9]) {
              const x = w.axis === "x" ? u + S.ox : w.c + dd + S.ox,
                z = w.axis === "x" ? w.c + dd + S.oz : u + S.oz;
              avoid.push({ x, y, z, r: 1.0 });
            }
        }
      for (const pr of S.props)
        if (pr.opts)
          avoid.push({ x: pr.opts.x, y: pr.opts.y, z: pr.opts.z, r: 1.1 });
      for (const c of S.containers)
        if (c.pos) avoid.push({ x: c.pos.x, y: c.pos.y, z: c.pos.z, r: 1.0 });
      for (const pk of S.pickups)
        if (pk.pos)
          avoid.push({ x: pk.pos.x, y: pk.pos.y, z: pk.pos.z, r: 0.6 });
      const vign = [];
      for (const v of cfg.vignettes) {
        const a = poiAnchors[v.near];
        if (a)
          vign.push(Object.assign({}, v, { at: { x: a.x, y: a.y, z: a.z } }));
      }
      const nb = new P.Batch(S.id + "_decay", {
        ox: S.ox,
        oy: S.oy,
        oz: S.oz,
        lit: true,
      });
      nb.ambient = S.b.ambient;
      nb.lights = S.b.lights;
      nb.grime = 0.35;
      const inv = new THREE.Matrix4().makeTranslation(-S.ox, -S.oy, -S.oz);
      const res = G.poiClutter.run({
        key: cfg.key,
        ox: I.origin.x,
        oz: I.origin.z,
        half: 150,
        style: cfg.style,
        density: cfg.density,
        decals: cfg.decals,
        collapses: cfg.collapses,
        avoid,
        vignettes: vign,
        root: S.root,
        lightAt: lightFn(S.b),
        decalGain: 1,
        adapter: {
          add(role, geom, m) {
            const r = ROLE[role] || ROLE.concrete;
            nb.geo(r[0], geom, inv.clone().multiply(m), {
              c: r[1],
              grime: 0.3,
            });
          },
          finish() {
            // merge into the site's main batch group (same materials → no extra draw calls); leftovers get their own group
            const host = S.root.children.find((c) => c.name === "pu_" + S.id);
            nb.build(S.root, { interior: true, mergeInto: host || null });
          },
        },
      });
      results.push(res);
    }
  };

  // notes + vignette props at initDone
  P.onReady.push(function () {
    const hasItems = !G.isStub("items") && typeof G.items.define === "function";
    if (hasItems)
      for (const id in NOTES)
        P.safe("vnote:" + id, () => {
          if (!G.items.get(id))
            G.items.define({
              id,
              type: "note",
              name: NOTES[id][0],
              title: NOTES[id][1],
              text: NOTES[id][2],
              weight: 0,
              value: 0,
              tags: ["note"],
            });
        });
    for (const res of results) {
      G.poiClutter.spawn(res, (n) => {
        if (
          hasItems &&
          typeof G.items.spawnPickup === "function" &&
          G.items.get(n.note)
        )
          G.items.spawnPickup(n.note, 1, new THREE.Vector3(n.x, n.y, n.z), {
            static: true,
            keepY: true,
          });
      });
    }
  });
})();

// ---------------------------------------------------------------------------
// Settlement life: sandbox roamers & small talk (G.poiSandbox, 93_sandbox_interior.js)
// ---------------------------------------------------------------------------
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G._pu) return;
  const P = G._pu;
  const PLAZA = [
    [
      "Did you see what she wore to luncheon? Leather. LEATHER.",
      "Raider chic. It will pass, like the Unpleasantness.",
    ],
    [
      "The soup was tepid again.",
      "Everything is tepid, Reginald. We live in a tepid age.",
    ],
    [
      "I hear the Waldorf has been let to soldiers.",
      "New money. Exo-rigged new money.",
    ],
    [
      "Is it true a ripjaw ate the Van Rensselaers?",
      "Only the parts that mattered, dear.",
    ],
    [
      "Pemberton says we are out of caviar.",
      "Then we shall eat the pack oxen and CALL it caviar.",
    ],
  ];
  const CARNEGIE = [
    [
      "Bar forty-two again. The horns keep dragging.",
      "The horns are two rust-buckets and a man with one lung.",
    ],
    [
      "If the dynamo runs, we play Friday.",
      "We said that last Friday. And in '71.",
    ],
    [
      "Rudy is tuning the piano again.",
      "It has not been in tune since the war. Neither has Rudy.",
    ],
    [
      "Do you think anyone will actually come?",
      "Someone always comes to hear music. Even here. Especially here.",
    ],
  ];
  G.events.on("initDone", () =>
    P.safe("sandbox", () => {
      const SB = G.poiSandbox;
      if (!SB) return;
      const spots = (poi, names) =>
        names
          .map((n) => P.anchor(poi, n))
          .filter(Boolean)
          .map((v) => ({ x: v.x, y: v.y, z: v.z, yaw: v.yaw || 0 }));
      SB.add("pu_social4", {
        group: "plaza",
        spots: spots("plaza_hotel", [
          "npc3",
          "palm_court",
          "oak_bar",
          "ballroom",
          "stage",
        ]),
        chat: PLAZA,
      });
      SB.add("pu_social2", {
        group: "plaza",
        spots: spots("plaza_hotel", ["npc2", "oak_bar", "palm_court", "lobby"]),
        chat: PLAZA,
        chatChance: 0.5,
      });
      SB.add("pu_clara", {
        group: "carnegie",
        spots: spots("carnegie_hall", [
          "violinist",
          "greenroom",
          "lobby",
          "auditorium",
        ]),
        chat: CARNEGIE,
        chatChance: 0.5,
      });
      SB.add("pu_cellist", {
        group: "carnegie",
        spots: spots("carnegie_hall", [
          "cellist",
          "greenroom",
          "lobby",
          "office",
        ]),
        chat: CARNEGIE,
        chatChance: 0.4,
      });
      SB.add("pu_stagehand", {
        group: "carnegie_bots",
        spots: spots("carnegie_hall", [
          "stagehand",
          "dynamo",
          "greenroom",
          "auditorium",
        ]),
      });
    }),
  );
})();
