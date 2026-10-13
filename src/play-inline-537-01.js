// play-inline-537 01 — the
// Lines 24-243 of readable/play-inline-537.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;

  // ------------------------------------------------------------------
  // Hub (shared between this module's files)
  // ------------------------------------------------------------------
  const AR = {
    games: {}, // gameId → game implementation (registered by 30_* files)
    STATE: null, // run state (per playthrough; saved)
    ui: null, // cabinet screen + ledger overlay (20_crt.js)
    audio: null, // cabinet sound chip (10_audio.js)
    world: null, // cabinets & collectibles in the world (40_world.js)
    KEY: "KeyK", // opens the collections ledger
  };

  // ------------------------------------------------------------------
  // Data: the cabinet games. board = the high-score table burned into the
  // cabinet's memory before the bombs (its top line is the "house record").
  // ------------------------------------------------------------------
  AR.GAME_DEFS = [
    {
      id: "skypatrol",
      title: "SKY PATROL",
      sub: "SAUCER RAID ON MANHATTAN",
      maker: "Starline Amusements · 1965",
      goal: "Hold the line through Wave 5",
      style: "space",
      art: { bg: "#0b1030", a: "#ffd23a", b: "#ff4a8a", c: "#5fe0ff" },
      board: [
        ["DOT", 8800],
        ["GUS", 7150],
        ["ACE", 5600],
        ["MAX", 4200],
        ["LOU", 2900],
      ],
      blurb:
        "Saucers from beyond the Moon are raining fire on the greatest skyline in the world. Three flak batteries. " +
        "Six landmarks. One steady hand on the trackball. Aim ahead of the falling bombs and let the sky light up.",
    },
    {
      id: "catacomb",
      title: "CATACOMB CRAWL",
      sub: "THE CROWN OF THE BONE KING",
      maker: "Empire Coin Machine Co. · 1966",
      goal: "Defeat the Bone King",
      style: "chrome",
      art: { bg: "#1a0d06", a: "#ffb347", b: "#c04aff", c: "#f2e6c8" },
      board: [
        ["RAY", 3000],
        ["BEA", 2400],
        ["SAL", 1800],
        ["VIC", 1200],
        ["IDA", 700],
      ],
      blurb:
        "Five floors down, under the ruined abbey of Greyhollow, the Bone King sits on a throne of his own subjects, " +
        "wearing the Sunstone Crown. Sir Bran does not read maps. Sir Bran does not knock. Sir Bran goes DOWN.",
    },
    {
      id: "steelworks",
      title: "STEELWORKS",
      sub: "TOPPING OUT ON 34TH STREET",
      maker: "Bowery Amusement Works · 1964",
      goal: "Top out three towers",
      style: "wood",
      art: { bg: "#1c0a0a", a: "#ff6a2a", b: "#ffd23a", c: "#7ad0ff" },
      board: [
        ["MAC", 9500],
        ["JOE", 8000],
        ["RIV", 6200],
        ["PAT", 4400],
        ["DEE", 3000],
      ],
      blurb:
        "Goliath, the runaway steam riveter, has climbed the steelwork of a half-built tower and is rolling red-hot " +
        "rivet kegs down the girders. Climb the ladders, hop the kegs, ring the topping-out bell. Hard hats required.",
    },
  ];
  AR.gameDef = (id) => AR.GAME_DEFS.find((g) => g.id === id) || null;

  // ------------------------------------------------------------------
  // Data: arcade cabinets in the world.
  //   fixed: exact floor spot (inside a venue other modules built; checked by hand against its furniture), yaw faces the room
  //   hint : street-level search origin (spiral spot finder) — cabinets hauled out to the sidewalk, run off a car battery
  // ------------------------------------------------------------------
  AR.CABINETS = [
    // The Rad Room (Times Square, the Neon): west wall, either side of the door (door opening z -294.7 … -292.3)
    {
      id: "rr_skypatrol",
      game: "skypatrol",
      style: "space",
      fixed: { x: -19.04, z: -296.4, yaw: Math.PI / 2 },
      area: "the Rad Room, Times Square",
      indoor: true,
    },
    {
      id: "rr_steelworks",
      game: "steelworks",
      style: "wood",
      fixed: { x: -19.04, z: -295.6, yaw: Math.PI / 2 },
      area: "the Rad Room, Times Square",
      indoor: true,
    },
    {
      id: "rr_catacomb",
      game: "catacomb",
      style: "chrome",
      fixed: { x: -19.04, z: -290.5, yaw: Math.PI / 2 },
      area: "the Rad Room, Times Square",
      indoor: true,
    },
    // street level
    {
      id: "st_radiocity",
      game: "catacomb",
      style: "chrome",
      hint: { x: 0, z: -320 },
      area: "Radio City",
      battery: true,
    },
    {
      id: "st_grandcentral",
      game: "steelworks",
      style: "wood",
      hint: { x: 240, z: -183 },
      area: "Grand Central",
      battery: true,
    },
    {
      id: "st_park",
      game: "skypatrol",
      style: "space",
      hint: { x: -57, z: -692 },
      allowSite: true,
      area: "Central Park",
      battery: true,
    },
  ];
  AR.cabinetDef = (id) => AR.CABINETS.find((c) => c.id === id) || null;

  // ------------------------------------------------------------------
  // Data: landmark miniatures (die-cast souvenirs) — one per NYC landmark
  // hint: search origin for a free outdoor spot; allowSite: open plaza/park site
  // ------------------------------------------------------------------
  AR.MINIS = [
    {
      id: "empire",
      name: "Empire State Building",
      site: "empire_state",
      hint: { x: 44, z: -72 },
      desc: "The Empire State Building in painted pot metal, three inches tall. The mast is a bent pin. It still stands straighter than the real one.",
    },
    {
      id: "liberty",
      name: "Statue of Liberty",
      site: "statue_of_liberty",
      hint: { x: -395, z: 1226 },
      allowSite: true, // on the island by the ferry dock
      desc: "Lady Liberty, torch held high, painted that hopeful copper-green. Somebody has touched up the flame with nail varnish.",
    },
    {
      id: "chrysler",
      name: "Chrysler Building",
      site: "chrysler",
      hint: { x: 286, z: -208 },
      desc: "The Chrysler spire in miniature, every sunburst window picked out in silver paint. Made in Newark. Says so on the bottom.",
    },
    {
      id: "bridge",
      name: "Brooklyn Bridge",
      site: "brooklyn_bridge",
      hint: { x: 132, z: 662 },
      desc: 'Two gothic towers and a web of silver thread. "GREETINGS FROM BROOKLYN" on the base, half scratched away.',
    },
    {
      id: "grand_central",
      name: "Grand Central Terminal",
      site: "grand_central",
      hint: { x: 204, z: -230 },
      desc: "The Beaux-Arts facade with a gold clock face no bigger than a shirt button. The clock says 9:47. Someone painted it that way on purpose.",
    },
    {
      id: "flatiron",
      name: "Flatiron Building",
      site: "flatiron",
      hint: { x: 150, z: 86 },
      desc: "A wedge of a building on a felt-bottomed base. It looks like it is sailing up Fifth Avenue, which it has been doing for eighty-odd years.",
    },
    {
      id: "times_square",
      name: "Times Square",
      site: "times_square",
      hint: { x: -40, z: -262 },
      allowSite: true,
      desc: "A crush of tiny billboards around a tinier ball drop. The paint is supposed to be neon. It is mostly rust now.",
    },
    {
      id: "central_park",
      name: "Central Park",
      site: "bethesda",
      hint: { x: 0, z: -560 },
      allowSite: true,
      desc: "The Angel of the Waters over her fountain, ringed by little bottle-brush trees. Greener than anything left around the real one.",
    },
  ];

  // ------------------------------------------------------------------
  // Data: the Keys to the City. Sixteen ceremonial gold keys Mayor Francis X.
  // Delahunt (and the two mayors before him) presented between 1954 and 1967.
  // Every one was cut with a working bit: together they open the Mayor's
  // vault under Gracie Mansion. In February 1967 the Mayor's office began
  // calling them home for an exhibition ("The Keys Come Home", Gracie
  // Mansion, Sunday March 12, 1967); on March 5 they were wherever this
  // table says.
  //   site + anchors : where the key lies (landmark / POI anchor names, tried in order);
  //                    the key is set down on a free floor spot near the anchor
  //   set            : what it lies on — 'case' (display case), 'desk' (writing desk),
  //                    'suite' (hotel side table + lamp), 'lectern' (presentation lectern)
  //   hint           : exterior map position (filled in below from the site's location)
  // ------------------------------------------------------------------
