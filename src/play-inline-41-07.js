// play-inline-41 07 — cls
// Lines 1725-2067 of readable/play-inline-41.pretty.js (statement-aligned).
  const MAP = {
    subway: "tunnel",
    empire_lobby: "gallery",
    liberty_pedestal: "gallery",
    old_st_patricks: "cathedral",
    trinity_church: "cathedral",
    st_pauls_chapel: "cathedral",
    penn_station: "concourse",
    port_authority: "concourse",
    whitehall_terminal: "concourse",
    farley_post_office: "concourse",
    ellis_island: "concourse",
    un_assembly: "concourse",
    nyse_floor: "concourse",
    park_ave_armory: "concourse",
    msg: "concourse",
    amnh: "gallery",
    moma: "gallery",
    frick: "gallery",
    cooper_hewitt: "gallery",
    morgan_library: "gallery",
    woolworth_lobby: "gallery",
    city_hall_rotunda: "gallery",
    custom_house: "gallery",
    federal_hall: "gallery",
    tiffany: "gallery",
    bellamys: "gallery",
    jefferson_market: "gallery",
    cp_zoo_arsenal: "gallery",
    queensboro_bridge: "bridge",
    manhattan_bridge: "bridge",
    bankers_trust: "gallery",
    forty_wall: "gallery",
    journal_bldg: "office",
    flatiron_interior: "office",
    metlife_tower: "office",
    municipal_building: "office",
    police_hq: "office",
    singer_building: "office",
    new_york_life: "office",
    helmsley: "office",
    cooper_union: "office",
    dakota: "residence",
    plaza_hotel: "residence",
    waldorf: "residence",
    chelsea_hotel: "residence",
    algonquin: "residence",
    ansonia: "residence",
    san_remo: "residence",
    hotel_new_yorker: "residence",
    hotel_pennsylvania: "residence",
    tudor_city: "residence",
    gracie_mansion: "residence",
    bellevue: "hospital",
    roosevelt_octagon: "hospital",
    smallpox_hospital: "hospital",
    orourkes: "bar",
    bedfords: "bar",
    fraunces_tavern: "bar",
    katz_deli: "bar",
    automat: "bar",
    empire_diner: "bar",
    club_52: "bar",
    delmonicos: "bar",
    tavern_on_green: "bar",
    village_vanguard: "bar",
    carnegie_hall: "auditorium",
    lyceum_theatre: "auditorium",
    ed_sullivan: "auditorium",
    webster_hall: "auditorium",
    tammany_hall: "auditorium",
    chinatown: "bunker",
    federal_reserve: "strongroom",
    tombs: "jail",
    domino_sugar: "industrial",
    nabisco_factory: "industrial",
    empire_stores: "industrial",
    five_boro_tower: "powerplant",
    uss_hudson: "ship",
    seaport: "pier",
    pier_a: "pier",
    rockefeller_30rock: "citadel",
    high_line: "outdoor",
    neon_interiors: "neon",
  };
  const NAME_RULES = [
    [/cathedral|church|chapel|basilica|synagogue|temple/i, "cathedral"],
    [
      /station|terminal|concourse|arena|garden|hall of|assembly|armory|post office|exchange/i,
      "concourse",
    ],
    [/museum|gallery|library|collection|lobby|rotunda|bank|court/i, "gallery"],
    [/hospital|clinic|asylum|infirmary|sanitar/i, "hospital"],
    [
      /bar\b|tavern|saloon|pub|ale house|diner|deli|automat|club|caf[eé]|restaurant|bistro/i,
      "bar",
    ],
    [/theat|opera|music hall|carnegie|ballroom|cinema/i, "auditorium"],
    [/hotel|apartment|mansion|house|residence|tenement|dakota/i, "residence"],
    [/bunker|cryo|shelter|jail|prison|tombs|cell|strongroom/i, "bunker"],
    [
      /factory|refinery|plant|mill|warehouse|works|foundry|depot/i,
      "industrial",
    ],
    [/ship|uss |boat|ferry|pier|dock|wharf/i, "pier"],
    [/subway|tunnel|sewer|metro|underground/i, "tunnel"],
    [/tower|building|office|headquarters|hq|plaza/i, "office"],
  ];
  S.spaceArch = ARCH;
  S.spaceRules = NAME_RULES; // 68_story_cues.js adds the lair's archetypes (candlehall, sunroom, track61)
  const archCache = {};
  /** Archetype key for an interior cell (flags on the INTERIORS entry win: `acoustics: '<archetype>'`). */
  function archOf(key) {
    if (!key) return "generic";
    if (archCache[key]) return archCache[key];
    const def = (G.LAYOUT.INTERIORS && G.LAYOUT.INTERIORS[key]) || {};
    let a = def.acoustics && ARCH[def.acoustics] ? def.acoustics : MAP[key];
    if (!a) {
      const nm = def.name || key;
      for (const r of NAME_RULES)
        if (r[0].test(nm)) {
          a = r[1];
          break;
        }
    }
    return (archCache[key] = a || "generic");
  }
  /** Settlement interiors (friendly LOCATIONS entry linked by interior or id). */
  const settleCache = {};
  function isSettlement(key) {
    if (key in settleCache) return settleCache[key];
    let s = false;
    try {
      const loc = (G.LAYOUT.LOCATIONS || []).find(
        (l) => l.interior === key || l.id === key,
      );
      s = !!(loc && !loc.hostile && loc.type === "settlement");
    } catch (e) {
      /* */
    }
    return (settleCache[key] = s);
  }

  // ------------------------------------------------------------------
  // 5. Acoustic probe
  // ------------------------------------------------------------------
  const IGN = [
    "actor",
    "prop_small",
    "interactable_self",
    "furniture",
    "counter",
    "cover",
    "rail",
    "railing",
    "prop",
    "skill_book",
    "column",
    "bars",
    "machine",
    "rubble",
  ];
  const RAYS = [];
  for (let i = 0; i < 8; i++)
    RAYS.push({
      x: Math.cos((i * Math.PI) / 4),
      y: 0,
      z: Math.sin((i * Math.PI) / 4),
    });
  const UP = { x: 0, y: 1, z: 0 };
  const PMAX = 50;
  const SP = (S.spaces = {
    probe: {
      valid: false,
      d: new Array(8).fill(20),
      span: 20,
      ceil: 12,
      cls: 1,
      hits: 0,
    },
    cls: -1,
    pendCls: -1,
    pendN: 0,
    key: null,
    arch: "generic",
    people: 0,
    peopleT: 0,
    rateK: 1,
    envName: null,
    ARCH,
    MAP,
  });
  function runProbe(p) {
    const pr = SP.probe,
      o = { x: p.x, y: p.y + 2.1, z: p.z };
    let hits = 0;
    try {
      for (let i = 0; i < 8; i++) {
        const h = G.world.raycast(o, RAYS[i], PMAX, { ignoreTags: IGN });
        if (h && h.collider) {
          pr.d[i] = Math.max(0.5, h.dist);
          hits++;
        } else pr.d[i] = PMAX;
      }
      const u = G.world.raycast({ x: p.x, y: p.y + 1.7, z: p.z }, UP, 60, {
        ignoreTags: IGN,
      });
      pr.ceilHit = !!(u && u.collider);
      pr.ceil = pr.ceilHit ? Math.max(2.4, u.dist + 1.7) : 14; // many cells have no ceiling collider
    } catch (e) {
      hits = 0;
    }
    pr.hits = hits;
    pr.valid = hits >= 3;
    // room size: twice the mean of the 5 shortest of the 8 wall distances (the 3 longest usually run out through a
    // doorway, an arch or down a corridor), so a nave reads by its width, a bar by its walls, not by its front door
    const sd = pr.d.slice(0).sort((x, y) => x - y);
    pr.span = (2 * (sd[0] + sd[1] + sd[2] + sd[3] + sd[4])) / 5;
    let cls = pr.span < 6 ? 0 : pr.span < 12 ? 1 : pr.span < 22 ? 2 : 3;
    if (pr.ceilHit && cls >= 2 && pr.ceil < 4.2) cls--; // a low ceiling is never a hall
    if (pr.ceilHit && cls === 1 && pr.ceil > 9) cls = 2; // a tall narrow space (stairwell, atrium) rings like one
    pr.cls = cls;
    return pr;
  }

  // ------------------------------------------------------------------
  // 6. Per-tick API used by the ambience system (60_ambience.js)
  // ------------------------------------------------------------------
  /** Called from sampleContext (2 Hz) for interiors: probe + archetype + occupancy. */
  SP.sample = function (c, p) {
    if (c.interior !== SP.key) {
      SP.key = c.interior;
      SP.arch = archOf(c.interior);
      SP.cls = -1;
      SP.pendCls = -1;
      SP.entered = true;
      hintArch(SP.arch);
    }
    const A = ARCH[SP.arch];
    if (A.fam) {
      const pr = runProbe(p);
      if (pr.valid) {
        if (SP.cls < 0) SP.cls = pr.cls;
        else if (pr.cls !== SP.cls) {
          if (pr.cls === SP.pendCls) {
            if (++SP.pendN >= 2) {
              SP.cls = pr.cls;
              SP.pendN = 0;
            }
          } else {
            SP.pendCls = pr.cls;
            SP.pendN = 1;
          }
        } else SP.pendN = 0;
      }
    } else SP.probe.valid = false;
    // friendly people around (1×/s)
    SP.peopleT -= 0.5;
    if (SP.peopleT <= 0) {
      SP.peopleT = 1;
      SP.people = countPeople(p, 14);
    }
    c.arch = SP.arch;
    c.probe = SP.probe;
    c.people = SP.people;
  };
  /** Reverb for the current interior sample. */
  SP.env = function (c) {
    if (S.isStartLab(c.interior)) return "cryo";
    const A = ARCH[SP.arch] || ARCH.generic;
    if (!A.fam || !SP.probe.valid || SP.cls < 0) return A.def;
    return (A.over && A.over[SP.cls]) || FAMILY[A.fam][SP.cls] || A.def;
  };
  /** Fill ambience-bed targets for an interior. Returns false for cells the legacy path keeps (Cryo Unit C-9). */
  SP.beds = function (c, t) {
    if (S.isStartLab(c.interior)) return false;
    const A = ARCH[SP.arch] || ARCH.generic;
    // bigger rooms get more of the big-space air, tiny rooms less
    const cls = SP.probe.valid ? SP.cls : 1,
      sizeK = [0.7, 0.9, 1.05, 1.2][Math.max(0, cls)];
    for (const b in A.beds)
      t[b] = A.beds[b] * (b === "amb_int_air" ? sizeK : 1);
    if (A.wind) t.amb_wind = (t.amb_wind || 0) + A.wind;
    if (A.rain && (c.weather === "rain" || c.weather === "thunderstorm"))
      t.amb_int_rain = A.rain * (c.weather === "thunderstorm" ? 1.15 : 1);
    // a handful of people → a murmuring room (settlements, bars; never for 1–2 NPCs, who bark for themselves)
    const mk = A.murmur || (isSettlement(c.interior) ? 0.55 : 0);
    if (mk && c.people >= 3)
      t.amb_int_murmur = mk * clamp(0.18 + (c.people - 3) * 0.08, 0.18, 0.5);
    return true;
  };
  function countPeople(p, r) {
    let n = 0;
    try {
      const list =
        G.actors && !G.isStub("actors") && G.actors.list
          ? G.actors.list()
          : null;
      if (!list) return 0;
      for (const a of list) {
        if (!a || a.dead || !a.pos || a.isCreature || a.isRobot) continue;
        if (
          Math.abs(a.pos.x - p.x) > r ||
          Math.abs(a.pos.z - p.z) > r ||
          Math.abs(a.pos.y - p.y) > 5
        )
          continue;
        if (a.hostile || (a.isHostile && a.isHostile())) continue;
        n++;
      }
    } catch (e) {
      return 0;
    }
    return n;
  }
  function nearPerson(p, r) {
    try {
      const list =
        G.actors && !G.isStub("actors") && G.actors.list
          ? G.actors.list()
          : null;
      if (!list) return null;
      const c = [];
      for (const a of list) {
        if (!a || a.dead || !a.pos || a.isCreature || a.isRobot || a.hostile)
          continue;
        if (
          Math.hypot(a.pos.x - p.x, a.pos.z - p.z) < r &&
          Math.abs(a.pos.y - p.y) < 4
        )
          c.push(a);
      }
      return c.length ? S.pick(c) : null;
    } catch (e) {
      return null;
    }
  }
  function hintArch(a) {
    const A = ARCH[a];
    if (!A) return;
    for (const s of A.spots) S.hintBake(s[0], 4);
  }
  /** A position for a spot sound inside (or, `far`, beyond) the measured room. */
