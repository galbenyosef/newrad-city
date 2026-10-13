// play-inline-187 01 — near
// Lines 1-369 of readable/play-inline-187.pretty.js (statement-aligned).
/* src/poi_midtown/96_decay.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN · 96 clutter & decay pass
 * Runs G.poiClutter (94_clutter.js) over each interior after every site was built (called
 * from 99_main init), through a second kit Builder that shares the interior builder's baked
 * lights/ambient/yOff, so debris is lit like the room. Vignette props + notes go into the
 * content lists (A.content[poi]) and spawn with the rest of the POI at initDone.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
  const A = G.PMID,
    K = A.kit;

  const ROLE = {
    concrete: ["concrete", 0xc0bab0],
    plaster: ["plaster"],
    rubble: ["rubble"],
    brick: ["brick_red"],
    wood: ["wood"],
    paper: ["paper"],
    dark: ["black_metal"],
    tile: ["ceil_tile"],
    metal: ["rust"],
    glass: ["paint_green"],
    fabric: ["fabric"],
    brass: ["brass"],
    candle: ["lamp_amber"],
    sheet: ["corrugated", 0xb8b0a0],
    bulb: ["lamp_amber"],
  };
  const INT_BUILDER = {
    waldorf: "waldorf_int",
    msg: "msg_int",
    penn_station: "penn_int",
    metlife_tower: "ml_int",
    bellevue: "bv_int",
  };

  const NOTES = {
    pmid_vn_waldorf_manager: [
      "Night Manager's Log",
      "WALDORF-ASTORIA — NIGHT MANAGER, MAR 1967",
      "The gentlemen from the Department arrived at 4 a.m. in unmarked cars and took the entire Towers. Presidential Suite, 35th floor, the lot. Paid in gold certificates.\n\nThey asked for a list of every guest. Then they asked for a list of every employee. Then they asked which of us had family outside the city.\n\nI gave them the lists. God forgive me, I gave them the lists.\n\nThe sirens started at 9:47. The Towers elevators were locked off at 9:48. They knew.",
    ],
    pmid_vn_msg_roll: [
      "Chalk Roll of Honour",
      "THE PIT — THEY FOUGHT HERE",
      '"Iron" Sal Ricci — 31 bouts. Knee gave out.\nBig Martha — 22 bouts. Ripjaw (don\'t ask).\nKid Tuesday — 4 bouts. Walked into the ring on a Wednesday.\nThe Mole — 17 bouts. Went back to the tunnels.\nDoc Ferris — 1 bout. Was the ref.\n\nRing the bell twice for them.',
    ],
    pmid_vn_penn_commuter: [
      "Commuter's Letter",
      "Dearest June,",
      'They have stopped all trains. The man at the ticket window says the 10:15 to Philadelphia is "delayed indefinitely", which is the most honest thing the Pennsylvania Railroad has ever said.\n\nThere are two thousand of us under the big glass roof. People are singing. A porter is handing out sandwiches from the dining car. The ceiling shook a few minutes ago and dust came down like snow in the light.\n\nIf this reaches you, I got on a train after all.\n\nYour Walter',
    ],
    pmid_vn_metlife_memo: [
      "Interoffice Memorandum",
      "METROPOLITAN LIFE — CLAIMS DIVISION, 5 MAR 1967",
      'TO: All adjusters\nRE: Claims arising from "acts of war"\n\nPer Policy Section 14(c), losses resulting from nuclear attack are NOT covered. Do not open new files. Do not accept telephone claims. Do not, under any circumstances, promise anyone anything.\n\nThe Actuarial Engine has recalculated our exposure. It has also recalculated the life expectancy of this office.\n\nThe number is small.\n\nPlease have your desks cleared by Friday.',
    ],
    pmid_vn_bellevue_nurse: [
      "Nurse's Scrawl",
      "WARD B — IF ANYONE READS THIS",
      'The men from Kessler-Haas took twelve of our patients to the annex on Tuesday. "Transfer for specialised care." They came back on Friday. Not all of them. Not the same.\n\nThe big one who used to be Mr. Albert knows my name. He says it through the door at night. Very politely.\n\nI have locked the pharmacy and taken the key. I have locked the ward. I am going to lock myself in the morgue, because nothing in there is going to get up.\n\nI hope.',
    ],
  };
  const CFG = {
    waldorf: {
      style: "hotel",
      density: 0.85,
      decals: 0.9,
      collapses: 1,
      vignettes: [
        {
          kind: "trail",
          near: "lobby",
          note: "pmid_vn_waldorf_manager",
          r: 16,
        },
        { kind: "last_stand", near: "alley", r: 14 },
        { kind: "lovers", near: "ballroom", r: 16 },
      ],
    },
    msg: {
      style: "settled",
      density: 0.75,
      decals: 0.8,
      collapses: 1,
      vignettes: [
        { kind: "shrine", near: "ring", note: "pmid_vn_msg_roll", r: 26 },
      ],
    },
    penn_station: {
      style: "ruin",
      density: 1.3,
      decals: 1.3,
      collapses: 2,
      vignettes: [
        {
          kind: "last_stand",
          near: "concourse",
          note: "pmid_vn_penn_commuter",
          r: 18,
        },
        { kind: "camp", near: "baggage_car", dead: true, r: 16 },
        { kind: "lovers", near: "waiting_room", r: 18 },
      ],
    },
    metlife_tower: {
      style: "office",
      density: 1.25,
      decals: 1.0,
      collapses: 1,
      vignettes: [
        {
          kind: "barricade",
          near: "claims",
          note: "pmid_vn_metlife_memo",
          r: 14,
        },
        { kind: "trail", near: "exec", r: 14 },
        { kind: "last_stand", near: "clockroom", r: 10 },
      ],
    },
    bellevue: {
      style: "hospital",
      density: 1.2,
      decals: 1.4,
      collapses: 1,
      vignettes: [
        {
          kind: "trail",
          near: "corridor",
          note: "pmid_vn_bellevue_nurse",
          r: 14,
        },
        { kind: "barricade", near: "morgue", r: 12 },
        { kind: "last_stand", near: "pharmacy", r: 10 },
      ],
    },
  };

  /** Fill light for the dark areas of an interior builder, right before it bakes (called from Builder.finish). */
  A.fillCell = function (b, parent) {
    if (!G.poiClutter || !G.poiClutter.fill) return;
    const id = Object.keys(INT_BUILDER).find((k) => INT_BUILDER[k] === b.name);
    if (!id) return;
    const rec = A.records[id];
    const I = rec && G.LAYOUT.INTERIORS[rec.interiorKey];
    if (!I) return;
    const yOff = b.yOff || 0,
      amb = b.ambient === null ? 1 : b.ambient;
    const boost =
      {
        msg: 0.45,
        penn_station: 0.2,
        metlife_tower: 0.15,
        bellevue: 0.15,
        waldorf: 0.15,
      }[id] || 0;
    const glows = K.glowSet(b.name + "_fill");
    const nOld = b.lights.length,
      oldLights = b.lights.slice();
    const inv = new THREE.Matrix4().makeTranslation(0, -yOff, 0);
    G.poiClutter.fill({
      key: rec.interiorKey,
      ox: I.origin.x,
      oz: I.origin.z,
      half: 150,
      threshold: amb + 0.3,
      max: 22,
      spacing: 10,
      radius: 12,
      intensity: 1.0,
      color: id === "bellevue" || id === "metlife_tower" ? 0xe8f0ff : 0xffc27a,
      lum: (x, y, z) => {
        const c = b._lit(x, y - yOff, z, 0, 1, 0);
        return 0.3 * c[0] + 0.55 * c[1] + 0.15 * c[2];
      },
      adapter: {
        add(role, geom, m) {
          const r = ROLE[role] || ROLE.concrete;
          b.geo(r[0], geom, {
            matrix: inv.clone().multiply(m),
            tint: r[1],
            grime: 0.2,
          });
        },
        light(x, y, z, c, i, r) {
          b.light(x, y - yOff, z, r, c, i);
        },
        glow(x, y, z, c) {
          glows.add(x, y - yOff, z, c, "m");
        },
      },
    });
    // this kit bakes light into vertex colours as geometry is added → re-light what is already there:
    // colour × (light with the new fixtures / light without them)
    const ambOld = b.ambient;
    if (boost && b.ambient !== null) b.ambient += boost;
    if (b.lights.length > nOld || boost) {
      const allL = b.lights;
      for (const [mat, bk] of b.bk) {
        const md = K.MATDEF && K.MATDEF[mat];
        if (md && (md.basic || md.unlit)) continue;
        const P = bk.p,
          N = bk.n,
          C = bk.c;
        for (let i = 0; i < bk.vc; i++) {
          const x = P[i * 3],
            y = P[i * 3 + 1],
            z = P[i * 3 + 2];
          let near = !!boost;
          for (let k = nOld; k < allL.length; k++) {
            const L = allL[k],
              dx = L.x - x,
              dy = L.y - y,
              dz = L.z - z;
            if (dx * dx + dy * dy + dz * dz < L.r2) {
              near = true;
              break;
            }
          }
          if (!near) continue;
          b.lights = oldLights;
          const an = b.ambient;
          b.ambient = ambOld;
          const lo = b._lit(x, y, z, N[i * 3], N[i * 3 + 1], N[i * 3 + 2]);
          b.ambient = an;
          b.lights = allL;
          const ln = b._lit(x, y, z, N[i * 3], N[i * 3 + 1], N[i * 3 + 2]);
          for (let j = 0; j < 3; j++)
            C[i * 3 + j] *= ln[j] / Math.max(0.05, lo[j]);
        }
      }
      b.lights = allL;
    }
    if (parent) glows.finish(parent, { interior: true, nightOpacity: 0.95 });
  };
  A.decay = function () {
    if (!G.poiClutter) return;
    const doorPts = [];
    for (const d of G.world.doors || []) {
      const df = d.def || d;
      if (df.pos) doorPts.push(df.pos);
      if (df.target) doorPts.push(df.target);
    }
    for (const id in CFG) {
      const rec = A.records[id];
      if (!rec) continue;
      const I = G.LAYOUT.INTERIORS[rec.interiorKey];
      if (!I) continue;
      const b = (K.builders || [])
        .filter((q) => q.name === INT_BUILDER[id])
        .sort((p, q) => q.lights.length - p.lights.length)[0];
      if (!b) continue;
      const cfg = CFG[id],
        C = A.content[id];
      const avoid = [];
      for (const k in rec.anchors) {
        const v = rec.anchors[k];
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
      if (C) {
        for (const p of C.props) avoid.push({ x: p.x, y: p.y, z: p.z, r: 1.1 });
        for (const p of C.notes.concat(C.pickups))
          avoid.push({ x: p.x, y: p.y, z: p.z, r: 0.6 });
      }
      const vign = [];
      for (const v of cfg.vignettes) {
        const a = rec.anchors[v.near];
        if (a)
          vign.push(Object.assign({}, v, { at: { x: a.x, y: a.y, z: a.z } }));
      }
      const yOff = b.yOff || 0;
      const nb = K.builder(INT_BUILDER[id] + "_decay", {
        grime: 0.3,
        ambient: b.ambient === null ? 1 : b.ambient,
        maxLight: b.maxLight,
        yOff,
      });
      nb.lights = b.lights;
      const inv = new THREE.Matrix4().makeTranslation(0, -yOff, 0);
      const res = G.poiClutter.run({
        key: rec.interiorKey,
        ox: I.origin.x,
        oz: I.origin.z,
        half: 150,
        style: cfg.style,
        density: cfg.density,
        decals: cfg.decals,
        collapses: cfg.collapses,
        avoid,
        vignettes: vign,
        root: rec.interiorRoot,
        decalGain: 0.75,
        lightAt: (x, y, z) => b._lit(x, y - yOff, z, 0, 1, 0),
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
            nb.finish(rec.interiorRoot, { cast: false });
          },
        },
      });
      // vignette props / notes join the POI's own content (spawned into interiorRoot at initDone)
      if (C) {
        let n = 900;
        for (const pr of res.props) {
          const o = pr.opts;
          C.props.push({
            type: pr.type,
            x: o.x,
            y: o.y,
            z: o.z,
            yaw: o.yaw || 0,
            opts: Object.assign({}, o),
            idx: n++,
          });
        }
        for (const nt of res.notes) {
          const d = NOTES[nt.note];
          if (!d) continue;
          if (!A.items.some((q) => q && q.id === nt.note))
            A.items.push({
              id: nt.note,
              type: "note",
              name: d[0],
              title: d[1],
              text: d[2],
              weight: 0,
              value: 0,
              tags: ["note"],
            });
          C.notes.push({
            id: nt.note,
            x: nt.x,
            y: nt.y - 0.02,
            z: nt.z,
            type: "note",
          });
        }
      }
    }
  };
})();

// ---------------------------------------------------------------------------
// Settlement life at The Pit: sandbox roamers & small talk (G.poiSandbox, 93_sandbox.js)
// ---------------------------------------------------------------------------
