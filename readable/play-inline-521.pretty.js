/* src/ambient_life/30_convoys.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 30: trade convoys
 *
 * Four named convoys (trader + two hired guns + one or two pack oxen)
 * walk fixed loops along the street grid between friendly settlements,
 * stopping a few game hours at each and making camp at night.
 *
 *   Mad Eddie Moss        scrap & salvage   Grand Central / The Neon / Radio City / The Pit
 *   Doc Rosalind Thorne   drugs & medicine  Flatiron / Automat / Empire Diner / Chelsea / Vanguard / O'Rourke's
 *   Big Sal Castellano    guns & ammo       Trinity / Fraunces / Custom House / St. Paul's
 *   Old Maureen Kells     general goods     Grand Central / Flatiron / Vanguard / Trinity (the long haul)
 *
 * Off-screen they're simulated abstractly (position along the route,
 * persisted). Within ~165 m of the player they materialise as combat
 * actors; the trader barters (`merchant` object persisted across
 * materialisations, restocks every 3 days) and talks (route, rumours,
 * a bit of biography). Killed traders stay dead for 4 days, then a
 * relative takes over the route.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;

  const SPEED = 1.3; // abstract walking speed (m/s of world time)
  const DRIFTER = () => K.outfit("drifter", "settler");

  const TRADERS = [
    {
      key: "eddie",
      name: "Mad Eddie Moss",
      heir: "Rudy Moss",
      title: "scrap & salvage",
      outfit: DRIFTER,
      gender: "m",
      hat: "cap",
      pack: 0,
      oxen: 1,
      stops: ["grand_central", "times_square", "radio_city", "msg"],
      funds: [260, 420],
      stock: [
        ["scrap_metal", 8],
        ["scrap_electronics", 4],
        ["duct_tape", 4],
        ["tuff_bond", 2],
        ["dry_cell", 3],
        ["relay_board", 2],
        ["vacuum_tube", 4],
        ["conductor", 2],
        ["bolt_rifle_32", 1],
        ["lead_pipe", 1],
        ["ammo_32", 60],
        ["ammo_10mm", 40],
        ["homeguard_cleanser", 2],
        ["lighter", 2],
        ["fizzo_cola", 3],
      ],
      greet: [
        "Eddie Moss! Mad Eddie, if you're nasty. Everything's junk till somebody needs it.",
        "Step right up! If it rattles, I sell it. If it doesn't, I'll shake it till it does.",
        "Hey hey, the walking wallet returns!",
      ],
      bio: "Used to salvage the subway cars under Grand Central till the folks down there voted me out. Now I haul the good junk topside. Bessie back there? Best ox on the island. She's got opinions about me. Several.",
      idle: [
        "Scrap for sale! Scrap for sale!",
        "Bessie, stop eating the merchandise.",
        "Buy one bent tin can, get the second bent tin can at full price!",
      ],
    },
    {
      key: "pike",
      name: "Doc Rosalind Thorne",
      heir: "Nurse June Thorne",
      title: "drugs & medicine",
      outfit: () => "doctor",
      gender: "f",
      pack: 1,
      oxen: 1,
      stops: [
        "flatiron",
        "automat",
        "empire_diner",
        "chelsea_hotel",
        "village_vanguard",
        "orourkes",
      ],
      funds: [320, 520],
      stock: [
        ["rally_tonic", 6],
        ["rally_tonic_extra", 1],
        ["prussian_blue", 4],
        ["iodine_tabs", 4],
        ["morphine_syrette", 2],
        ["bull_tabs", 2],
        ["focus_pills", 2],
        ["rush", 3],
        ["rage", 1],
        ["field_surgery_kit", 1],
        ["blood_pack", 2],
        ["root_poultice", 3],
        ["purified_water", 6],
        ["surgical_tubing", 2],
      ],
      greet: [
        "Doc Thorne. Stitches, pills, and advice you won't take. Where does it hurt?",
        "You look like hell. That's a professional opinion, by the way. No charge.",
        "Hold still. No, that's just how you look. What do you need?",
      ],
      bio: "Twelve years at the Bellevue free clinic, until the Brutes moved in. Now the clinic walks. The Village pays in gnarlberries and gratitude; the Neon pays in scrip. Guess which route I like.",
      idle: [
        "Medicine! Pills! Bandages that are mostly clean!",
        "Don't pick at that.",
        "Prussian Blue, folks! Flushes the glow right out of you!",
      ],
    },
    {
      key: "sal",
      name: "Big Sal Castellano",
      heir: "Little Sal Castellano",
      title: "guns & ammunition",
      outfit: () => "combat_armor",
      gender: "m",
      hat: "fedora",
      pack: 2,
      oxen: 2,
      stops: [
        "trinity_church",
        "fraunces_tavern",
        "custom_house",
        "st_pauls_chapel",
      ],
      funds: [400, 650],
      stock: [
        ["pistol_10mm", 1],
        ["smg_10mm", 1],
        ["hunting_rifle", 1],
        ["combat_shotgun", 1],
        ["assault_rifle", 1],
        ["magnum_44", 1],
        ["mat49_smg", 1],
        ["ammo_10mm", 120],
        ["ammo_556", 90],
        ["ammo_308", 30],
        ["ammo_12ga", 36],
        ["ammo_44", 24],
        ["ammo_gyrojet", 18],
        ["frag_grenade", 4],
        ["combat_knife", 1],
      ],
      greet: [
        "Sal Castellano. Guns, bullets, and the good sense to use 'em. What are we shooting today?",
        "Easy with the hands, friend. Customers keep 'em where I can see 'em.",
        "Welcome back. Your gun looks thirsty.",
      ],
      bio: "My grandpappy ran numbers on Mulberry Street, my pappy ran guns for the Exchange, and I run guns for whoever's paying and ain't a raider. That's called family values.",
      idle: [
        "Ammunition! Every caliber that still goes bang!",
        "You want it to go bang, I got it.",
        "Keep moving, Tony. Eyes on the rooftops.",
      ],
    },
    {
      key: "maureen",
      name: "Old Maureen Kells",
      heir: "Young Maureen Kells",
      title: "general goods",
      outfit: () => "merchant",
      gender: "f",
      hat: "bandana",
      pack: 1,
      oxen: 2,
      stops: [
        "grand_central",
        "flatiron",
        "village_vanguard",
        "trinity_church",
      ],
      funds: [300, 480],
      stock: [
        ["purified_water", 8],
        ["dirty_water", 4],
        ["golden_plain_jerky", 5],
        ["franks_and_beans", 4],
        ["freedom_flakes", 2],
        ["frank_in_a_bun", 3],
        ["ox_steak", 3],
        ["pigeon_on_a_stick", 3],
        ["ox_milk", 3],
        ["fizzo_cola", 4],
        ["prairie_root_beer", 3],
        ["leather_armor", 1],
        ["patched_workwear", 1],
        ["biker_leathers", 1],
        ["rally_tonic", 2],
      ],
      greet: [
        "Maureen Kells. Food, water, clothes. The things that keep a body going, dearie.",
        "Eat something, you're all skin and bone.",
        "Oh, it's you. Still alive! Good for business, that.",
      ],
      bio: "Twenty-two years walking this island since the Bombing, every one of 'em behind an ox. Outlived three husbands, two road partners and one very ambitious ripjaw. The secret is clean water and minding your own business.",
      idle: [
        "Water! Clean water! Only a little bit hot!",
        "Fresh ox steak, practically still bellowing!",
        "Keep up, you two. Legs don't rust.",
      ],
    },
  ];
  const RUMORS = [
    "Raiders at the Brooklyn Bridge are charging a toll again. Toll's your life, mostly.",
    "Somebody's sniping from the top of the Chrysler. Stay under awnings on 42nd.",
    "Brutes holed up in the Empire State. Grey hide, bone plates, bad tempers. Don't go climbing.",
    "There's a distress call on the radio down by Battery Park. Some government cellar full of frozen sleepers, Cryo Unit C-4 or something. Flooded, they say. Poor souls.",
    "The Continuity's been flying those twin-rotor birds low over the East Side. Never a good sign.",
    "Heard the Iron Covenant at Rockefeller is recruiting. Or conscripting. Hard to tell with them.",
    "Something big lives in the North Woods. Big, clawed, and not interested in trade.",
    "The Neon throws the best parties in the city. Nobody there's been counted since '67 and they like it that way.",
    "Shellbacks crawling all over the Seaport again. Their meat's good, their manners ain't.",
    "Somebody saw a man in a grey hat on 5th Avenue at midnight. Then they didn't.",
    "The Glowkeepers want you to go sunbathing at ground zero. I'd rather hug a raider.",
    "Rats are getting bigger in the subway. Not giant-roach big. Worse. Rat big.",
    "Some Frenchman was asking questions at the Neon. Paid in real francs. Nobody knew what to do with 'em.",
    "There's a girl with a scope rifle on the Tudor City roofs. Calls herself Flint. Keeps that big red sign lit for the Court. Never misses, they say.",
    "Glowkeepers stand about with lanterns outside the Municipal Building, watching the doors. Waiting on something. Or somebody.",
    'Old-timers at Grand Central still talk about the Candle Lady. Gave every kid on the lower level a candle, back in sixty-seven. "For the people who are sleeping."',
    "You hear the Dawn Hour? Five forty-seven every morning, a woman reading scripture right over the top of Rocky. Calm as milk. Gives me the creeps.",
    "The Glowkeepers paint their sun on everything. Count the rays sometime. Always twelve. Never eleven, never thirteen.",
    "Continuity's reading names on the radio again. The '67 enrolment rolls. Anybody born since ain't on 'em, and that's half the city.",
  ];
  const LOCNAME = (id) => {
    const l = G.LAYOUT.getLocation(id);
    return l ? l.name.replace(/ —.*$/, "") : id;
  };

  // ------------------------------------------------------------------
  // Street-grid routing (Dijkstra over avenue × street intersections)
  // ------------------------------------------------------------------
  let GRAPH = null;
  function buildGraph() {
    const Ly = G.LAYOUT;
    const avX = Ly.AVENUE_DEFS.map((a) => a.x);
    const stZ = [];
    for (let i = 0; i < Ly.STREET_COUNT; i++)
      stZ.push(Ly.STREET_Z0 + i * Ly.STREET_STEP);
    const avSeg = (x, z0, z1) =>
      Ly.avenues.some(
        (s) =>
          s.x === x &&
          s.z0 <= Math.min(z0, z1) + 0.5 &&
          s.z1 >= Math.max(z0, z1) - 0.5,
      );
    const stSeg = (z, x0, x1) =>
      Ly.streets.some(
        (s) =>
          s.z === z &&
          !s.park &&
          s.x0 <= Math.min(x0, x1) + 0.5 &&
          s.x1 >= Math.max(x0, x1) - 0.5,
      );
    const nodes = [],
      idx = new Map();
    for (let a = 0; a < avX.length; a++)
      for (let s = 0; s < stZ.length; s++) {
        const x = avX[a],
          z = stZ[s];
        if (avSeg(x, z, z) && stSeg(z, x, x)) {
          idx.set(a + "," + s, nodes.length);
          nodes.push({ x, z, a, s, e: [] });
        }
      }
    const link = (i, j) => {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z);
      nodes[i].e.push([j, d]);
      nodes[j].e.push([i, d]);
    };
    for (const n of nodes) {
      const i = idx.get(n.a + "," + n.s);
      const up = idx.get(n.a + "," + (n.s + 1));
      if (up !== undefined && avSeg(n.x, n.z, stZ[n.s + 1])) link(i, up);
      const rt = idx.get(n.a + 1 + "," + n.s);
      if (rt !== undefined && stSeg(n.z, n.x, avX[n.a + 1])) link(i, rt);
    }
    GRAPH = { nodes };
  }
  function nearestNode(x, z) {
    let best = -1,
      bd = 1e9;
    GRAPH.nodes.forEach((n, i) => {
      const d = Math.hypot(n.x - x, n.z - z);
      if (d < bd && n.e.length) {
        bd = d;
        best = i;
      }
    });
    return best;
  }
  function shortest(from, to) {
    const N = GRAPH.nodes.length,
      dist = new Float64Array(N).fill(Infinity),
      prev = new Int32Array(N).fill(-1),
      done = new Uint8Array(N);
    dist[from] = 0;
    for (;;) {
      let u = -1,
        bd = Infinity;
      for (let i = 0; i < N; i++)
        if (!done[i] && dist[i] < bd) {
          bd = dist[i];
          u = i;
        }
      if (u < 0 || u === to) break;
      done[u] = 1;
      for (const [v, w] of GRAPH.nodes[u].e)
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          prev[v] = u;
        }
    }
    if (!isFinite(dist[to])) return null;
    const path = [];
    for (let v = to; v >= 0; v = prev[v]) path.unshift(v);
    return path;
  }
  /** Waypoint loop for a trader: [{x,z,stop?}], with cumulative lengths. */
  function buildRoute(T) {
    const stops = T.stops.map((id) => G.LAYOUT.getLocation(id)).filter(Boolean);
    if (stops.length < 2) return null;
    const pts = [];
    for (let k = 0; k < stops.length; k++) {
      const A = stops[k],
        B = stops[(k + 1) % stops.length];
      const na = nearestNode(A.x, A.z),
        nb = nearestNode(B.x, B.z);
      if (na < 0 || nb < 0) return null;
      // stop point: pulled from the intersection toward the settlement, onto the street
      const n = GRAPH.nodes[na];
      const dx = A.x - n.x,
        dz = A.z - n.z,
        dl = Math.hypot(dx, dz) || 1;
      const pull = Math.min(10, dl * 0.4);
      const ax = Math.abs(dx) > Math.abs(dz); // pull along the road axis that points at it
      const sx = n.x + (ax ? Math.sign(dx) * pull : 0),
        sz = n.z + (ax ? 0 : Math.sign(dz) * pull);
      // The Neon: trade inside the Convoy Depot when the exterior has built it (35_neon_depot)
      const dep =
        A.id === "times_square" && K.neonDepotStop ? K.neonDepotStop() : null;
      if (dep) {
        pts.push({ x: sx, z: sz });
        pts.push({ x: dep.x, z: dep.z, stop: A.id });
        pts.push({ x: sx, z: sz });
      } else pts.push({ x: sx, z: sz, stop: A.id });
      const path = shortest(na, nb);
      if (!path) return null;
      for (const i of path) {
        const q = GRAPH.nodes[i];
        const last = pts[pts.length - 1];
        if (Math.hypot(last.x - q.x, last.z - q.z) > 2)
          pts.push({ x: q.x, z: q.z });
      }
    }
    // cumulative lengths (closed loop)
    let L = 0;
    for (let i = 0; i < pts.length; i++) {
      pts[i].s = L;
      const b = pts[(i + 1) % pts.length];
      L += Math.hypot(b.x - pts[i].x, b.z - pts[i].z);
    }
    return { pts, length: L };
  }

  // ------------------------------------------------------------------
  // Convoy state
  // ------------------------------------------------------------------
  let CONVOYS = []; // dynamic, per game
  let ROUTES = []; // static (per trader index)
  let campFire = null;

  function freshMerchant(T) {
    return K.merchant(K.randInt(T.funds[0], T.funds[1]), K.stock(T.stock));
  }
  function newConvoy(ti) {
    const T = TRADERS[ti],
      R = ROUTES[ti];
    const stopIdx = R.pts
      .map((p, i) => (p.stop ? i : -1))
      .filter((i) => i >= 0);
    const wp = K.pick(stopIdx);
    return {
      ti,
      wp,
      x: R.pts[wp].x,
      z: R.pts[wp].z,
      state: "stop",
      stopUntil: K.gameHours() + K.rand(0.5, 3.5),
      alive: true,
      deadDay: 0,
      gen: 0,
      merchant: freshMerchant(T),
      restockDay: K.day(),
      live: null,
      stuckT: 0,
    };
  }
  function traderName(c) {
    const T = TRADERS[c.ti];
    return c.gen > 0 ? T.heir : T.name;
  }
  function nextStopName(c) {
    const R = ROUTES[c.ti];
    for (let k = 0; k < R.pts.length; k++) {
      const p = R.pts[(c.wp + k + (c.state === "stop" ? 1 : 0)) % R.pts.length];
      if (p.stop) return LOCNAME(p.stop);
    }
    return "somewhere";
  }
  function currentStop(c) {
    const p = ROUTES[c.ti].pts[c.wp];
    return c.state === "stop" && p.stop ? p.stop : null;
  }

  /** Abstract travel along the loop by `dist` metres. */
  function advance(c, dist) {
    const R = ROUTES[c.ti];
    let guard = 0;
    while (dist > 0 && guard++ < 50) {
      const t = R.pts[c.wp];
      const dx = t.x - c.x,
        dz = t.z - c.z,
        d = Math.hypot(dx, dz);
      if (d <= dist) {
        c.x = t.x;
        c.z = t.z;
        dist -= d;
        if (t.stop) {
          arriveStop(c);
          return;
        }
        c.wp = (c.wp + 1) % R.pts.length;
      } else {
        c.x += (dx / d) * dist;
        c.z += (dz / d) * dist;
        dist = 0;
      }
    }
  }
  function arriveStop(c) {
    c.state = "stop";
    c.stopUntil = K.gameHours() + K.rand(2, 4);
    // restock every three days
    if (K.day() - c.restockDay >= 3) {
      const T = TRADERS[c.ti],
        fresh = freshMerchant(T);
      K.setFunds(c.merchant, Math.max(K.funds(c.merchant), K.funds(fresh)));
      const have = new Map((c.merchant.stock || []).map((e) => [e[0], e[1]]));
      for (const [id, n] of fresh.stock)
        have.set(id, Math.max(have.get(id) || 0, n));
      c.merchant.stock = Array.from(have.entries());
      c.restockDay = K.day();
    }
  }
  function departStop(c) {
    c.state = "travel";
    c.wp = (c.wp + 1) % ROUTES[c.ti].pts.length;
  }
  /** Stop timer / night camp. Returns true if the convoy should leave now. */
  function stopOver(c) {
    if (K.gameHours() < c.stopUntil) return false;
    if (K.isBedTime(0) || K.isStormy()) {
      c.stopUntil = K.gameHours() + 0.5;
      return false;
    } // camp for the night / sit out the storm
    return true;
  }

  // ------------------------------------------------------------------
  // Materialisation
  // ------------------------------------------------------------------
  function guardWeapon(lvl) {
    const pool =
      lvl >= 8
        ? ["assault_rifle", "combat_shotgun", "hunting_rifle"]
        : ["hunting_rifle", "combat_shotgun", "pistol_10mm", "smg_10mm"];
    const ok = pool.filter((w) => K.itemExists(w) || G.isStub("items"));
    return ok.length ? K.pick(ok) : "none";
  }
  function materialize(c) {
    const T = TRADERS[c.ti];
    const spot =
      K.freeSpotNear(c.x, c.z, 5, 16) || K.freeSpotNear(c.x, c.z, 10, 16);
    if (!spot) return false;
    const R = ROUTES[c.ti];
    const tgt = R.pts[c.wp];
    const yaw = K.yawTo(spot.x, spot.z, tgt.x, tgt.z);
    const pl = K.level();
    const trader = K.spawnActor({
      type: "human",
      outfit: T.outfit(),
      gender: T.gender,
      hat: T.hat,
      faction: "settlers",
      name: traderName(c),
      level: 8,
      pos: spot,
      yaw,
      ai: "patrol",
      patrol: [{ x: tgt.x, z: tgt.z }],
      weapon: K.itemExists("pistol_10mm") ? "pistol_10mm" : "none",
      voice: "merchant",
      merchant: c.merchant,
      dialogue: "amb_dlg_" + T.key,
      barks: { greet: T.greet, idle: T.idle },
      noRespawn: true,
      seed: "amb_" + T.key + c.gen,
      inventory: K.stock([
        [K.SCRIP, K.randInt(20, 60)],
        ["rally_tonic", 1],
      ]),
      hp: 150,
    });
    if (!trader) return false;
    trader._ambConvoy = c;
    const live = {
      trader,
      guards: [],
      oxen: [],
      spawnT: K.now(),
      lastX: spot.x,
      lastZ: spot.z,
      moveT: K.now(),
      outsideT: 0,
    };
    for (let i = 0; i < 2; i++) {
      const gp =
        K.freeSpotNear(
          spot.x - Math.sin(yaw) * -3 + (i ? 2 : -2),
          spot.z - Math.cos(yaw) * -3,
          3,
          10,
        ) || spot;
      const lvl = Math.max(6, pl + K.randInt(-1, 1));
      const g = K.spawnActor({
        type: "human",
        outfit: K.pick(["combat_armor", "leather_armor", DRIFTER()]),
        faction: "settlers",
        name: "Convoy Guard",
        voice: "guard",
        level: lvl,
        pos: gp,
        yaw,
        ai: "follow",
        weapon: guardWeapon(lvl),
        noRespawn: true,
        gender: Math.random() < 0.7 ? "m" : "f",
      });
      if (g) {
        try {
          g.follow(trader);
        } catch (e) {
          /* ignore */
        }
        live.guards.push(g);
      }
    }
    for (let i = 0; i < T.oxen; i++) {
      const bp = K.freeSpotNear(
        spot.x + Math.sin(yaw) * (3 + i * 3),
        spot.z + Math.cos(yaw) * (3 + i * 3),
        3,
        10,
      );
      if (!bp) continue;
      const b = K.oxen.spawnActor({
        pos: bp,
        yaw,
        variant: T.pack + i,
        ai: "follow",
        follow: trader,
        name: "Pack Ox",
      });
      if (b) live.oxen.push(b);
    }
    c.live = live;
    K.log("convoy materialised", T.key, spot);
    return true;
  }
  function dematerialize(c) {
    const lv = c.live;
    if (!lv) return;
    if (K.actorAlive(lv.trader)) {
      c.x = lv.trader.pos.x;
      c.z = lv.trader.pos.z;
    }
    for (const a of [lv.trader].concat(lv.guards, lv.oxen)) K.removeActor(a);
    c.live = null;
    if (campFire && campFire.convoy === c) {
      K.removeProp(campFire.h);
      campFire = null;
    }
  }

  function liveAll(lv) {
    return [lv.trader].concat(lv.guards, lv.oxen);
  }

  /** Drive a materialised convoy (2 Hz). */
  function driveLive(c, dt) {
    const lv = c.live,
      a = lv.trader,
      P = G.player,
      t = K.now();
    if (!a || a.removed || a._ambGone) {
      c.live = null;
      return;
    }
    if (a.dead) {
      if (c.alive) {
        c.alive = false;
        c.deadDay = K.day();
        K.log("convoy trader died", traderName(c));
      }
      // survivors mill around; despawn with distance
    } else {
      c.x = a.pos.x;
      c.z = a.pos.z;
      const R = ROUTES[c.ti];
      const calm =
        a.state === "idle" || a.state === "move" || a.state === "follow";
      const busy = K.actorBusy(a);
      if (c.state === "stop") {
        if (calm && a.aiMode !== "merchant") {
          a.aiMode = "merchant";
        }
        const sp = R.pts[c.wp];
        if (calm && Math.hypot(a.pos.x - sp.x, a.pos.z - sp.z) > 4 && !busy) {
          a.aiMode = "patrol";
          a.patrol = [{ x: sp.x, z: sp.z }];
          a.patrolIdx = 0;
        }
        if (!busy && stopOver(c)) {
          departStop(c);
          a.aiMode = "patrol";
          a.say &&
            K.say(
              a,
              K.pick([
                "Pack it up, we're moving out!",
                "Alright, let's go. " +
                  nextStopName(c) +
                  " won't trade with itself.",
                "Heads up, moving on.",
              ]),
              3.5,
            );
        }
      } else {
        const tp = R.pts[c.wp];
        if (calm && !busy) {
          if (a.aiMode !== "patrol") a.aiMode = "patrol";
          if (
            !a.patrol ||
            !a.patrol.length ||
            a.patrol[0].x !== tp.x ||
            a.patrol[0].z !== tp.z
          ) {
            a.patrol = [{ x: tp.x, z: tp.z }];
            a.patrolIdx = 0;
          }
        }
        if (Math.hypot(a.pos.x - tp.x, a.pos.z - tp.z) < 3.5) {
          if (tp.stop) {
            arriveStop(c);
            a.aiMode = "merchant";
            K.say(
              a,
              "Here we are — " + LOCNAME(tp.stop) + ". Open for business!",
              3.5,
            );
          } else c.wp = (c.wp + 1) % R.pts.length;
        }
        // stuck detection (a car wreck in the way, a collapsed street...)
        if (Math.hypot(a.pos.x - lv.lastX, a.pos.z - lv.lastZ) > 1.2) {
          lv.lastX = a.pos.x;
          lv.lastZ = a.pos.z;
          lv.moveT = t;
        } else if (calm && !busy && t - lv.moveT > 25) {
          lv.moveT = t;
          const nx = tp.x,
            nz = tp.z;
          if (
            !K.inView(a.pos.x, a.pos.y + 1, a.pos.z, 2, true) &&
            !K.inView(nx, 1, nz, 2, true)
          ) {
            const s = K.freeSpotNear(nx, nz, 4, 10);
            if (s)
              for (const m of liveAll(lv))
                if (K.actorAlive(m)) {
                  m.pos.set(
                    s.x + (Math.random() - 0.5) * 3,
                    s.y,
                    s.z + (Math.random() - 0.5) * 3,
                  );
                  if (m.nav) {
                    m.nav.path = null;
                    m.nav.search = null;
                  }
                }
          }
        }
      }
    }
    // followers drift back into formation after a fight
    for (const m of lv.guards.concat(lv.oxen)) {
      if (!K.actorAlive(m) || !K.actorAlive(a)) continue;
      if (m.state === "idle" && m.followTarget !== a) {
        try {
          m.follow(a);
        } catch (e) {
          /* ignore */
        }
      }
    }
    // camp fire at a night stop
    if (
      c.state === "stop" &&
      K.isDark() &&
      K.actorAlive(a) &&
      !campFire &&
      Math.hypot(P.pos.x - c.x, P.pos.z - c.z) < 120
    ) {
      const s = K.freeSpotNear(c.x + 3, c.z + 2, 3, 8);
      if (s) {
        const h = K.spawnProp("campfire", {
          x: s.x,
          y: s.y,
          z: s.z,
          yaw: Math.random() * 6.28,
          pot: true,
        });
        if (h) campFire = { h, convoy: c };
      }
    }
    if (
      campFire &&
      campFire.convoy === c &&
      (c.state !== "stop" || !K.isDark())
    ) {
      K.removeProp(campFire.h);
      campFire = null;
    }
    // dematerialise with distance (never mid-conversation / while fighting the player nearby)
    const d = Math.hypot(P.pos.x - c.x, P.pos.z - c.z);
    if (d < 25 && c.alive) c.met = true;
    const inside = K.isInterior(P.pos.x);
    lv.outsideT = inside ? lv.outsideT + dt : 0;
    const fightingPlayer = liveAll(lv).some(
      (m) => K.actorAlive(m) && m.inCombat && m.target === "player",
    );
    if (
      (d > K.CFG.CONVOY_DESPAWN_R || lv.outsideT > 6) &&
      !K.actorBusy(a) &&
      !(fightingPlayer && d < 300)
    )
      dematerialize(c);
  }

  let tickT = 0;
  function update(dt) {
    if (!ROUTES.length || !CONVOYS.length) return;
    if (dt <= 0) return;
    tickT += dt;
    if (tickT < 0.5) return;
    const step = tickT;
    tickT = 0;
    const P = G.player;
    const outdoors = K.playerOutdoors();
    let liveN = 0;
    for (const c of CONVOYS) if (c.live) liveN++;
    for (const c of CONVOYS) {
      // a replacement trader takes over a dead route after 4 days
      if (!c.alive && !c.live && K.day() - c.deadDay >= 4) {
        const fresh = newConvoy(c.ti);
        fresh.gen = c.gen + 1;
        Object.assign(c, fresh);
      }
      if (c.live) {
        driveLive(c, step);
        continue;
      }
      if (!c.alive) continue;
      // abstract simulation
      if (c.state === "stop") {
        if (stopOver(c)) departStop(c);
      } else advance(c, SPEED * step);
      // materialise near the player
      if (
        outdoors &&
        liveN < K.CFG.CONVOY_LIVE_MAX &&
        G.state === "play" &&
        Math.hypot(P.pos.x - c.x, P.pos.z - c.z) < K.CFG.CONVOY_SPAWN_R
      ) {
        if (materialize(c)) liveN++;
      }
    }
  }

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
  function convoyOf(key) {
    const ti = TRADERS.findIndex((T) => T.key === key);
    return CONVOYS.find((c) => c.ti === ti) || null;
  }
  function registerDialogues() {
    for (const T of TRADERS) {
      const id = "amb_dlg_" + T.key;
      const rumorSeen = new Set();
      K.registerDialogue(id, {
        start: "hello",
        nodes: {
          hello: {
            text: () => {
              const c = convoyOf(T.key);
              const k = K.standing();
              let line = K.pick(T.greet);
              if (c && c.gen > 0)
                line =
                  "Name's " +
                  traderName(c) +
                  ". Took over the route after " +
                  T.name.split(" ").slice(-1)[0] +
                  " got... retired. Same prices, same oxen.";
              if (k <= -750)
                line += " ...And keep your hands where my guards can see them.";
              else if (k >= 750)
                line += " Heard good things about you, by the way.";
              return line;
            },
            responses: [
              {
                text: "Let's see what you're selling.",
                barter: true,
                end: true,
              },
              { text: "Where's the convoy headed?", next: "route" },
              { text: "Heard any news on the road?", next: "rumor" },
              { text: "Tell me about yourself.", next: "bio" },
              { text: "Goodbye.", end: true },
            ],
          },
          route: {
            text: () => {
              const c = convoyOf(T.key);
              const loop = T.stops.map(LOCNAME).join(", ");
              const here = c ? currentStop(c) : null;
              return (
                (here
                  ? "We're trading here at " +
                    LOCNAME(here) +
                    " for a few hours, then on to "
                  : "Next stop's ") +
                (c ? nextStopName(c) : LOCNAME(T.stops[0])) +
                ". The loop runs " +
                loop +
                ", and round again. We make camp at sundown — only fools and raiders walk Manhattan at night."
              );
            },
            responses: [
              { text: "Back to business.", next: "hello" },
              { text: "Safe travels.", end: true },
            ],
          },
          rumor: {
            text: () => {
              let pool = RUMORS.filter((r) => !rumorSeen.has(r));
              if (!pool.length) {
                rumorSeen.clear();
                pool = RUMORS;
              }
              const r = K.pick(pool);
              rumorSeen.add(r);
              return "Road talk? " + r;
            },
            responses: [
              { text: "Anything else?", next: "rumor2" },
              { text: "Back to business.", next: "hello" },
            ],
          },
          rumor2: {
            text: () => {
              let pool = RUMORS.filter((r) => !rumorSeen.has(r));
              if (!pool.length) pool = RUMORS;
              const r = K.pick(pool);
              rumorSeen.add(r);
              return "Let me think... " + r;
            },
            responses: [
              { text: "Back to business.", next: "hello" },
              { text: "Thanks. Goodbye.", end: true },
            ],
          },
          bio: {
            text: () => T.bio,
            responses: [
              {
                text: "Must be lonely work. Lonely enough for a discount?",
                check: { skill: "trade", value: 45 },
                next: "discount",
                failNext: "nodiscount",
              },
              { text: "Back to business.", next: "hello" },
            ],
          },
          discount: {
            text: "Ha! Lonely, no. Charmed, maybe. Here — a little something for the road, on the house.",
            onEnter: () => {
              const gift =
                T.key === "sal"
                  ? ["ammo_10mm", 20]
                  : T.key === "pike"
                    ? ["rally_tonic", 1]
                    : T.key === "eddie"
                      ? ["duct_tape", 2]
                      : ["purified_water", 2];
              if (K.give(gift[0], gift[1])) K.sfx("pickup");
            },
            responses: [{ text: "Much obliged.", next: "hello" }],
          },
          nodiscount: {
            text: "Nice try. Prices are prices, friend.",
            responses: [{ text: "Worth a shot.", next: "hello" }],
          },
        },
      });
    }
  }

  // ------------------------------------------------------------------
  // System
  // ------------------------------------------------------------------
  K.system({
    name: "convoys",
    order: 30,
    init() {
      try {
        buildGraph();
      } catch (e) {
        G.reportError("ambient:convoy graph", e);
        GRAPH = { nodes: [] };
      }
      ROUTES = TRADERS.map((T) => {
        try {
          return buildRoute(T);
        } catch (e) {
          G.reportError("ambient:route " + T.key, e);
          return null;
        }
      });
      if (ROUTES.some((r) => !r)) {
        console.warn(
          "[ambient] some convoy routes could not be built",
          ROUTES.map((r) => !!r),
        );
      }
      // hurt a pack ox and the whole convoy turns on you
      G.events.on("factionAngered", (faction, actor) => {
        try {
          if (faction !== "amb_oxen" || !actor) return;
          for (const c of CONVOYS) {
            const lv = c.live;
            if (!lv || lv.oxen.indexOf(actor) < 0) continue;
            for (const m of [lv.trader].concat(lv.guards))
              if (K.actorAlive(m) && !m.hostile()) {
                m.wasFriendly = true;
                m.setHostile(true);
              }
            K.say(
              lv.trader,
              K.pick([
                "That's my ox, you animal!",
                "Hey! Leave the livestock alone!",
                "Guards! They're going for the oxen!",
              ]),
              3,
            );
          }
        } catch (e) {
          G.reportError("ambient:convoy anger", e);
        }
      });
    },
    initDone() {
      registerDialogues();
    },
    newGame() {
      registerDialogues();
      CONVOYS = [];
      TRADERS.forEach((T, i) => {
        if (ROUTES[i]) CONVOYS.push(newConvoy(i));
      });
    },
    reset() {
      for (const c of CONVOYS) c.live = null; // combat clears its actors itself on reset
      CONVOYS = [];
      campFire = null;
    },
    loaded() {
      if (!CONVOYS.length)
        TRADERS.forEach((T, i) => {
          if (ROUTES[i]) CONVOYS.push(newConvoy(i));
        });
    },
    update,
    save() {
      return CONVOYS.map((c) => {
        const x =
            c.live && K.actorAlive(c.live.trader) ? c.live.trader.pos.x : c.x,
          z = c.live && K.actorAlive(c.live.trader) ? c.live.trader.pos.z : c.z;
        return {
          ti: c.ti,
          wp: c.wp,
          x,
          z,
          state: c.state,
          stopUntil: c.stopUntil,
          alive: c.alive,
          deadDay: c.deadDay,
          gen: c.gen,
          merchant: c.merchant,
          restockDay: c.restockDay,
          met: !!c.met,
        };
      });
    },
    load(d) {
      CONVOYS = [];
      if (!Array.isArray(d)) return;
      for (const s of d) {
        if (!ROUTES[s.ti]) continue;
        const c = newConvoy(s.ti);
        Object.assign(c, {
          wp: s.wp % ROUTES[s.ti].pts.length,
          x: s.x,
          z: s.z,
          state: s.state,
          stopUntil: s.stopUntil,
          alive: s.alive !== false,
          deadDay: s.deadDay || 0,
          gen: s.gen || 0,
          restockDay: s.restockDay || K.day(),
          met: !!s.met,
        });
        if (s.merchant && Array.isArray(s.merchant.stock))
          c.merchant = s.merchant;
        CONVOYS.push(c);
      }
    },
  });

  K.convoys = {
    list: () => CONVOYS,
    routes: () => ROUTES,
    traders: TRADERS,
    materialize,
    dematerialize,
    /** Debug/test: put convoy i right next to (x,z) and materialise it. */
    bringTo(i, x, z) {
      const c = CONVOYS[i];
      if (!c) return null;
      if (c.live) dematerialize(c);
      // nearest waypoint on its own route
      const R = ROUTES[c.ti];
      let best = 0,
        bd = 1e9;
      R.pts.forEach((p, k) => {
        const d = Math.hypot(p.x - x, p.z - z);
        if (d < bd) {
          bd = d;
          best = k;
        }
      });
      c.wp = best;
      c.x = x;
      c.z = z;
      c.state = "travel";
      c.alive = true;
      materialize(c);
      return c.live;
    },
    name: traderName,
  };
})();
