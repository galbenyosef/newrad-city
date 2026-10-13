// play-inline-521 01 — nodes
// Lines 22-375 of readable/play-inline-521.pretty.js (statement-aligned).
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
