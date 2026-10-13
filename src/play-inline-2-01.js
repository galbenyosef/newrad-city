// play-inline-2 01 — the
// Lines 12-239 of readable/play-inline-2.pretty.js (statement-aligned).
  "use strict";
  const G = (window.G = window.G || {});

  // ---------------------------------------------------------------
  // Manhattan shoreline polygon (clockwise, x,z). Artistic, compressed.
  // ---------------------------------------------------------------
  const MANHATTAN = [
    [-330, -1000],
    [330, -1000],
    [335, -700],
    [338, -400],
    [345, -150],
    [335, 100],
    [310, 400],
    [285, 620],
    [255, 760],
    [190, 900],
    [110, 985],
    [-10, 1010],
    [-120, 990],
    [-210, 900],
    [-270, 760],
    [-315, 560],
    [-338, 300],
    [-345, 0],
    [-342, -400],
    [-335, -700],
  ];
  // Brooklyn waterfront (DUMBO / Navy Yard) across the East River
  const BROOKLYN = [
    [470, 380],
    [800, 380],
    [800, 980],
    [520, 980],
    [480, 900],
    [462, 760],
    [458, 600],
  ];
  // Liberty Island & Ellis Island (in the harbour, south-west)
  const LIBERTY = { x: -420, z: 1250, r: 55 };
  const ELLIS = { x: -520, z: 1090, r: 52 }; // enlarged to fit the Immigration Station site

  // Roosevelt (Blackwell's) Island in the East River — land built by the poi_roosevelt module
  const ROOSEVELT = [
    [378, -720],
    [434, -720],
    [434, -356],
    [378, -356],
  ];
  const WORLD = { minX: -760, maxX: 820, minZ: -1000, maxZ: 1420 };
  const WATER_LEVEL = -1.2;

  // ---------------------------------------------------------------
  // Street grid. Avenues run N-S (constant x), streets run E-W (constant z).
  // Corridor widths INCLUDE sidewalks.
  // ---------------------------------------------------------------
  const AVE_W = 20,
    AVE_ROAD = 12; // 4 m sidewalk each side
  const ST_W = 14,
    ST_ROAD = 8; // 3 m sidewalk each side
  const BROADWAY_W = 16,
    BROADWAY_ROAD = 10;
  const AVENUE_DEFS = [
    { x: -280, name: "10th Avenue" },
    { x: -200, name: "9th Avenue" },
    { x: -120, name: "8th Avenue" }, // Central Park West north of z=-420
    { x: -40, name: "7th Avenue" },
    { x: 40, name: "6th Avenue" },
    { x: 120, name: "5th Avenue" },
    { x: 200, name: "Park Avenue" },
    { x: 280, name: "Lexington Avenue" },
  ];
  const STREET_Z0 = -410,
    STREET_STEP = 45,
    STREET_COUNT = 31; // z = -410 .. 940
  // Artistic street numbering (compressed: one layout street every ~2–4 real blocks), anchored on the
  // landmarks: 59th = Central Park South, 47th = Duffy Square (north end of the Times Square bow-tie),
  // 42nd, 34th (Herald Sq / Empire State), 23rd (Flatiron / Madison Sq), 14th (Union Sq), Houston,
  // Canal, Chambers (City Hall), Wall Street. Monotonic north → south (round 1 fix: the old table
  // had duplicates and numbers running backwards south of 42nd).
  const STREET_NAMES = {};
  (function nameStreets() {
    const table = [
      "59th",
      "57th",
      "51st",
      "47th",
      "42nd",
      "40th",
      "37th",
      "34th",
      "32nd",
      "28th",
      "26th",
      "23rd",
      "20th",
      "17th",
      "16th",
      "15th",
      "14th",
      "11th",
      "8th",
      "Houston",
      "Grand",
      "Canal",
      "Worth",
      "Chambers",
      "Fulton",
      "John",
      "Liberty",
      "Wall",
      "Beaver",
      "Bridge",
      "State",
    ];
    for (let i = 0; i < STREET_COUNT; i++)
      STREET_NAMES[STREET_Z0 + i * STREET_STEP] =
        (table[i] || "Street " + i) + " Street";
  })();
  // Broadway: the only non-grid road (polyline, corridor BROADWAY_W incl. sidewalks).
  // Round 1 layout pass (city_layout, revised twice after critique):
  //  * starts at the centre of the COLUMBUS CIRCLE roundabout (8th Ave × 59th St, see CIRCLES) and leaves it on a
  //    DIAGONAL (≈31° off the avenues, SSE — as in NYC) straight to the Times Square bow-tie; Carnegie Hall keeps the
  //    7th Ave / 57th St corner EAST of it (its footprint is now a wedge whose west face is Broadway's kerb);
  //  * crosses 7th Ave in the Times Square bow-tie (the line through the Times Square site is unchanged —
  //    the Times Square lots are clipped to it; see BOWTIES), rides the 6th Ave slot through Herald /
  //    Greeley Square (34th → 32nd St, between Sterling's and the Empire State), runs SSE to 26th St, bends and crosses
  //    5th Ave INSIDE the 23rd St junction (centre-line crossing z≈72, the Flatiron prow on 23rd's south kerb):
  //    Worth Square is the small triangle north of the crossing (Broadway W, 5th E), Madison Square Park fills the
  //    NE quadrant (west edge 5th Ave, south edge 23rd St), then Broadway runs SE along the Flatiron's east face;
  //  * takes over the Park Avenue slot (x=200) from 17th St past Union Square (east of Broadway, as in NYC),
  //    Astor Place and Cooper Square; swings SW below Houston through SoHo (Washington Square stays WEST,
  //    Chinatown / Old St. Patrick's EAST) and takes over the 6th Avenue slot (x=40) from Canal St down to
  //    Bowling Green — so City Hall, the Tombs, the Federal Reserve are EAST of Broadway and the Woolworth,
  //    St. Paul's, Singer, Trinity WEST of it, as in NYC.
  const BROADWAY = [
    [-121.5, -408.5], // Columbus Circle (roundabout centre) → diagonal SSE out of the ring
    [-62.5, -312], // north edge of the Times Square site
    [-40, -262], // Times Square: the bow-tie crossing of 7th Avenue
    [-18.95, -212], // south edge of the Times Square site (same line as before through the site)
    [40, -104], // Herald Square: joins the 6th Ave slot at 35th St
    [40, -45], // Greeley Square: leaves the 6th Ave slot at 32nd St
    [80, 45], // 26th St: bends ESE (Worth Square in the V north of the 5th Ave crossing)
    [139.3, 85], // 23rd St junction: crosses 5th Ave (centre lines at z≈72), Flatiron prow on the south kerb
    [200, 171.6], // along the Flatiron's east face → joins the Park Avenue slot at 17th St
    [200, 442.5], // Union Square West · Astor Place · Cooper Square → Houston St
    [40, 535], // SoHo diagonal → joins the 6th Ave slot at Canal St
    [40, 897], // Bowling Green (Battery Park)
  ];
  // Roundabouts. rIsland = raised centre island (monument), rOuter = outer edge of the ring carriageway.
  const CIRCLES = [
    {
      id: "columbus_circle",
      name: "Columbus Circle",
      x: -121.5,
      z: -408.5,
      rIsland: 7,
      rOuter: 16,
    },
  ];
  // Avenue slots that Broadway takes over / renamed stretches (applied after the avenue sweep below).
  // An avenue segment is clipped to [z0,z1] windows; each window gets its own name. Consecutive windows
  // must share their boundary (no gap), or the ground model would put a kerb strip across the avenue.
  // (Where Broadway only rides an avenue for one block — 6th Ave 35th→32nd — the avenue stays and Broadway runs
  // inside its corridor.)
  const AVENUE_OVERRIDES = [
    {
      x: 200,
      keep: [
        { z1: 172, name: "Park Avenue" },
        { z0: 443, z1: 586, name: "Bowery" },
        { z0: 587, name: "Pearl Street" },
      ],
    },
    {
      x: 120,
      keep: [
        { z1: 406, name: "5th Avenue" },
        { z0: 459, z1: 490, name: "LaGuardia Place" },
        { z0: 490, z1: 664, name: "Centre Street" },
        { z0: 664, name: "Nassau Street" },
      ],
    },
    { x: 40, keep: [{ z1: 535, name: "6th Avenue" }] },
  ];
  // Street spans removed after the sweep (x0..x1 at street z): stubs swallowed by a wedge landmark.
  const STREET_CUTS = [
    {
      z: 130,
      x0: 128,
      x1: 166,
      why: "Flatiron wedge (20th St would run through the building up to Broadway)",
    },
  ];
  // Bow-ties: where Broadway crosses an avenue inside a landmark plaza. The carriageways (LAYOUT.isRoad(x,z,true))
  // stay open road; the pedestrian islands between them are computed below (L.BOWTIES[i].islands, L.bowtieAt).
  const BOWTIES = [
    {
      id: "times_square",
      site: "times_square",
      name: "Times Square",
      avenueX: -40,
      crossing: { x: -40, z: -262 },
      northZ: -312,
      southZ: -212,
      streets: [-275, -230],
      note: "Duffy Square (north island, 51st→47th) and the 42nd St island (south); The Neon lives on the islands and building-front sidewalks, the carriageways stay clear",
    },
  ];

  // Central Park (no grid inside; map module makes paths, lake, reservoir)
  const PARK = { x0: -110, x1: 110, z0: -1000, z1: -420 };
  const PARK_FEATURES = {
    lake: { x0: -80, x1: 40, z0: -645, z1: -585 }, // "The Lake" (water at y=-0.6, shallow)
    reservoir: { x0: -80, x1: 90, z0: -900, z1: -780 }, // water, fenced
    sheepMeadow: { x0: -90, x1: -10, z0: -540, z1: -460 },
    bethesda: { x: 0, z: -560 }, // terrace + Angel of the Waters fountain (landmarks_b)
    bowBridge: { x: -20, z: -615, yaw: 0 }, // spans the lake N-S (landmarks_b)
    belvedere: { x: -20, z: -700 }, // Belvedere Castle on rock (landmarks_b)
    northWoods: { x0: -100, x1: 100, z0: -1000, z1: -920 }, // ripjaw territory
  };

  // ---------------------------------------------------------------
  // LANDMARK SITES. Generic buildings must NOT be placed inside these
  // footprints. Owner = module responsible for building the landmark.
  // closesStreets: streets/avenues inside the footprint are not generated.
  // Heights are artistic (≈0.45–0.5× real).
  // ---------------------------------------------------------------
