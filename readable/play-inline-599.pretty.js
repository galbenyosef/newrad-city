/* src/ui_hud/26_mapicons.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : MAP MARKER GLYPHS
 *
 * Every map marker carries a small vector pictogram that says what kind
 * of place it is (cryo site, settlement skyline, subway tunnel, monument,
 * factory, office tower, military star, sewer, natural landmark, camp…).
 * Hollow = known but not yet visited, solid = discovered.
 *
 *   H.locIconKind(loc)                     → icon kind id (string)
 *   H.locKindLabel(kind)                   → 'SUBWAY', 'MONUMENT'…
 *   H.drawMapIcon(ctx, kind, x, y, scale, filled, col, cutCol?)
 *   H.mapIconURL(kind, col, filled)        → small cached PNG data URL
 *
 * Icons are drawn in a ±7 unit box with canvas paths (crisp at any size).
 * Each icon has a silhouette ("body") and inner detail lines: hollow icons
 * stroke both in the goggle colour; filled icons paint the silhouette
 * solid and cut the details out in the display's dark colour.
 * Used by the HUD ring minimap (20_hud.js) and the goggles MAP (34_gg_map.js).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const H = G.hud._;

  // ------------------------------------------------------------------
  // Icon geometry: body(g) builds the silhouette path, detail(g) the
  // inner lines (stroked). Coordinates in [-7, 7].
  // ------------------------------------------------------------------
  const poly = (g, pts) => {
    g.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
    g.closePath();
  };
  const ICONS = {
    cryo: {
      // cryo site: hexagonal pod hatch with a frost star
      body(g) {
        poly(g, [0, -7.2, 6.2, -3.6, 6.2, 3.6, 0, 7.2, -6.2, 3.6, -6.2, -3.6]);
      },
      detail(g) {
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI) / 3;
          g.moveTo(Math.cos(a) * 3.6, Math.sin(a) * 3.6);
          g.lineTo(-Math.cos(a) * 3.6, -Math.sin(a) * 3.6);
        }
      },
    },
    city: {
      // settlement: three-building skyline
      body(g) {
        poly(
          g,
          [
            -7, 6, -7, -1, -4.5, -1, -4.5, -4, -1.5, -4, -1.5, -1.5, 0.5, -1.5,
            0.5, -7, 3.5, -7, 3.5, -0.5, 7, -0.5, 7, 6,
          ],
        );
      },
      detail(g) {
        g.moveTo(-5.8, 1.5);
        g.lineTo(-5.8, 4.5);
        g.moveTo(-3, -2);
        g.lineTo(-3, 4.5);
        g.moveTo(2, -5);
        g.lineTo(2, 4.5);
        g.moveTo(5.3, 1.5);
        g.lineTo(5.3, 4.5);
      },
    },
    metro: {
      // Metro: tunnel mouth with rails
      body(g) {
        g.moveTo(-7, 6);
        g.lineTo(-7, -0.5);
        g.arc(0, -0.5, 7, Math.PI, 0);
        g.lineTo(7, 6);
        g.closePath();
      },
      detail(g) {
        g.moveTo(-3.8, 6);
        g.lineTo(-3.8, 0);
        g.arc(0, 0, 3.8, Math.PI, 0);
        g.lineTo(3.8, 6);
        g.moveTo(-1.6, 6);
        g.lineTo(-0.7, 1.5);
        g.moveTo(1.6, 6);
        g.lineTo(0.7, 1.5);
      },
    },
    monument: {
      // classical façade: pediment, columns, stylobate
      body(g) {
        poly(
          g,
          [
            -7, 6.5, -7, 4.5, -6, 4.5, -6, -2, -7, -2, 0, -7, 7, -2, 6, -2, 6,
            4.5, 7, 4.5, 7, 6.5,
          ],
        );
      },
      detail(g) {
        for (const x of [-3.4, -1.1, 1.1, 3.4]) {
          g.moveTo(x, -1);
          g.lineTo(x, 4);
        }
        g.moveTo(-3, -3.3);
        g.lineTo(3, -3.3);
      },
    },
    church: {
      // chapel with a cross on the gable
      body(g) {
        poly(g, [-5.5, 6.5, -5.5, 0, 0, -3.5, 5.5, 0, 5.5, 6.5]);
        g.moveTo(-0.7, -3.2);
        g.lineTo(-0.7, -7);
        g.lineTo(0.7, -7);
        g.lineTo(0.7, -3.2);
        g.closePath();
        g.rect(-2.3, -6, 4.6, 1.3);
      },
      detail(g) {
        g.moveTo(-1.5, 6.5);
        g.lineTo(-1.5, 2.8);
        g.arc(0, 2.8, 1.5, Math.PI, 0);
        g.lineTo(1.5, 6.5);
      },
    },
    factory: {
      // saw-tooth roof and a smokestack
      body(g) {
        poly(
          g,
          [
            -7, 6.5, -7, -0.5, -4, -3, -4, -0.5, -1, -3, -1, -0.5, 2, -3, 2,
            -0.5, 3.4, -0.5, 3.4, -7, 5.8, -7, 5.8, -0.5, 7, -0.5, 7, 6.5,
          ],
        );
      },
      detail(g) {
        g.rect(-5.4, 1.8, 2.2, 2);
        g.rect(-1.8, 1.8, 2.2, 2);
        g.rect(1.8, 1.8, 2.2, 2);
      },
    },
    office: {
      // high-rise with a setback crown and a low wing
      body(g) {
        poly(
          g,
          [
            -7, 6.5, -7, 0, -3.5, 0, -3.5, -3.5, -2, -3.5, -2, -5.5, -0.8, -5.5,
            -0.8, -7.2, 0.8, -7.2, 0.8, -5.5, 2, -5.5, 2, -3.5, 3.5, -3.5, 3.5,
            6.5,
          ],
        );
      },
      detail(g) {
        for (let y = -2; y <= 4.6; y += 2.2) {
          g.moveTo(-2.2, y);
          g.lineTo(2.2, y);
        }
        g.moveTo(-5.3, 2.2);
        g.lineTo(-5.3, 5);
      },
    },
    military: {
      // stencilled five-point star in a ring
      body(g) {
        g.moveTo(7, 0);
        g.arc(0, 0, 7, 0, Math.PI * 2);
      },
      detail(g) {
        for (let i = 0; i <= 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5,
            r = i % 2 ? 2.1 : 5;
          if (i === 0) g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
      },
    },
    hospital: {
      // clinic: rounded plate with a cross
      body(g) {
        if (g.roundRect) g.roundRect(-6.5, -6.5, 13, 13, 2.2);
        else g.rect(-6.5, -6.5, 13, 13);
      },
      detail(g) {
        poly(
          g,
          [
            -1.6, -4.3, 1.6, -4.3, 1.6, -1.6, 4.3, -1.6, 4.3, 1.6, 1.6, 1.6,
            1.6, 4.3, -1.6, 4.3, -1.6, 1.6, -4.3, 1.6, -4.3, -1.6, -1.6, -1.6,
          ],
        );
      },
    },
    natural: {
      // natural landmark: a lone pine
      body(g) {
        poly(
          g,
          [0, -7.2, 4.2, -2, 2.4, -2, 6, 3.2, -6, 3.2, -2.4, -2, -4.2, -2],
        );
        g.rect(-1.1, 3.2, 2.2, 3.6);
      },
      detail(g) {
        g.moveTo(0, -3.8);
        g.lineTo(0, 1.8);
      },
    },
    cave: {
      // cave / sewer: rock mound with a dark mouth
      body(g) {
        g.moveTo(-7.2, 6);
        g.bezierCurveTo(-6.5, -3, -3, -6.8, 0.5, -6.8);
        g.bezierCurveTo(4.5, -6.8, 7.2, -2, 7.2, 6);
        g.closePath();
      },
      detail(g) {
        g.moveTo(-2.6, 6);
        g.lineTo(-2.6, 2);
        g.bezierCurveTo(-2.6, -0.6, 2.6, -0.6, 2.6, 2);
        g.lineTo(2.6, 6);
      },
    },
    bridge: {
      // suspension bridge: two towers, deck and cables
      body(g) {
        g.rect(-5.4, -6.5, 2.2, 12.5);
        g.rect(3.2, -6.5, 2.2, 12.5);
        g.rect(-7.2, 1.2, 14.4, 1.8);
      },
      detail(g) {
        g.moveTo(-7.2, -3);
        g.quadraticCurveTo(-5.5, 0.5, -4.3, -5.6);
        g.quadraticCurveTo(0, 1.5, 4.3, -5.6);
        g.quadraticCurveTo(5.5, 0.5, 7.2, -3);
      },
    },
    docks: {
      // piers / harbour: an anchor
      body(g) {
        g.moveTo(1.6, -5);
        g.arc(0, -5, 1.6, 0, Math.PI * 2);
        g.rect(-0.9, -3.4, 1.8, 9);
        g.rect(-3.6, -2.4, 7.2, 1.6);
        g.moveTo(-6.4, 1.4);
        g.quadraticCurveTo(-5.2, 6.8, 0, 6.8);
        g.quadraticCurveTo(5.2, 6.8, 6.4, 1.4);
        g.lineTo(4.4, 2.4);
        g.quadraticCurveTo(3, 5, 0, 5);
        g.quadraticCurveTo(-3, 5, -4.4, 2.4);
        g.closePath();
      },
      detail() {
        /* solid glyph */
      },
    },
    camp: {
      // encampment: a tent with an open flap
      body(g) {
        poly(g, [-7.2, 6.2, -0.6, -6.5, 0.6, -6.5, 7.2, 6.2]);
      },
      detail(g) {
        g.moveTo(0, -3);
        g.lineTo(-2.4, 6.2);
        g.moveTo(0, -3);
        g.lineTo(2.4, 6.2);
      },
    },
    store: {
      // storefront with an awning
      body(g) {
        poly(
          g,
          [
            -6.5, 6.5, -6.5, -2.5, -7.2, -2.5, -5.5, -6.2, 5.5, -6.2, 7.2, -2.5,
            6.5, -2.5, 6.5, 6.5,
          ],
        );
      },
      detail(g) {
        g.moveTo(-7.2, -2.5);
        g.lineTo(7.2, -2.5);
        g.moveTo(-3.6, -6.2);
        g.lineTo(-4.1, -2.5);
        g.moveTo(0, -6.2);
        g.lineTo(0, -2.5);
        g.moveTo(3.6, -6.2);
        g.lineTo(4.1, -2.5);
        g.rect(-4.5, 0, 4, 3.5);
        g.moveTo(1.6, 6.5);
        g.lineTo(1.6, 0);
        g.lineTo(4.4, 0);
        g.lineTo(4.4, 6.5);
      },
    },
    ruins: {
      // ruined building: broken roofline
      body(g) {
        poly(
          g,
          [
            -6.5, 6.5, -6.5, -3.5, -4.2, -6.8, -2.8, -3.8, -1, -5.4, 0.8, -2.2,
            2.6, -4.6, 4.2, -2.8, 6.5, -5.2, 6.5, 6.5,
          ],
        );
      },
      detail(g) {
        g.rect(-4.4, -1.2, 2.2, 2);
        g.rect(1.4, -0.4, 2.2, 2);
        g.rect(-4.4, 2.8, 2.2, 2);
        g.moveTo(1.4, 5.2);
        g.lineTo(3.8, 3);
      },
    },
    landmark: {
      // generic point of interest: an obelisk / spire
      body(g) {
        poly(
          g,
          [
            0, -7.4, 1.8, -4.6, 2.4, 5, 4.6, 5, 4.6, 6.8, -4.6, 6.8, -4.6, 5,
            -2.4, 5, -1.8, -4.6,
          ],
        );
      },
      detail(g) {
        g.moveTo(-1.8, -4.6);
        g.lineTo(1.8, -4.6);
      },
    },
    marker: {
      // unknown / fallback: diamond
      body(g) {
        poly(g, [0, -7, 7, 0, 0, 7, -7, 0]);
      },
      detail(g) {
        g.moveTo(0, -2.6);
        g.lineTo(2.6, 0);
        g.lineTo(0, 2.6);
        g.lineTo(-2.6, 0);
        g.closePath();
      },
    },
  };
  const LABELS = {
    cryo: "CRYO SITE",
    city: "SETTLEMENT",
    metro: "SUBWAY",
    monument: "MONUMENT",
    church: "CHURCH",
    factory: "FACTORY",
    office: "OFFICE BUILDING",
    military: "MILITARY",
    hospital: "HOSPITAL",
    natural: "NATURAL LANDMARK",
    cave: "CAVE / SEWER",
    bridge: "BRIDGE",
    docks: "DOCKS",
    camp: "ENCAMPMENT",
    store: "STORE",
    ruins: "RUINS",
    landmark: "LANDMARK",
    marker: "LOCATION",
  };

  // ------------------------------------------------------------------
  // Classification — keyword rules on id + name, then type/faction.
  // (Locations may carry an explicit `icon` that wins.)
  // ------------------------------------------------------------------
  const RULES = [
    ["cryo", /cryo|long winter|long_winter|municipal building/],
    [
      "metro",
      /subway|station|bus terminal|\bmetro\b|\bpath\b|tunnels?\b|grand central/,
    ],
    ["cave", /sewer|drain|pumping|cave|culvert|storm/],
    ["bridge", /bridge/],
    [
      "military",
      /armory|navy|\buss\b|fort\b|military|bunker|barracks|arsenal|continuity|covenant|outpost|checkpoint|missile|silo/,
    ],
    [
      "hospital",
      /hospital|asylum|clinic|bellevue|smallpox|medical|octagon|infirmary/,
    ],
    ["church", /cathedral|church|chapel|temple|synagogue|abbey|trinity/],
    ["docks", /pier|seaport|dock|harbou?r|marina|ferry|wharf|drydock|slip\b/],
    [
      "factory",
      /factory|refinery|plant\b|power|five borough|five_boro|fiveboro|sugar|biscuit|nabisco|works\b|mill\b|foundry|brewery|garage|depot|yard\b|tower of light/,
    ],
    [
      "natural",
      /park\b|woods|reservoir|zoo|garden|lake|ramble|meadow|high line|pond|lawn|conservatory|green\b/,
    ],
    [
      "monument",
      /museum|library|city hall|\bhall\b|capitol|memorial|monument|statue|liberty|federal|castle|terrace|collection|mansion|exchange|guggenheim|\bmet\b|metropolitan museum|frick|morgan|cooper|arch\b|obelisk|rotunda|courthouse|tombs|ellis/,
    ],
    [
      "store",
      /theat(er|re)|club\b|deli|sterling|bellamy|tiffany|market|diner|saloon|\bbar\b|shop|store|automat|restaurant|tavern|o'rourke|orourke|cafe|hotel\b|hotel |casino|neon/,
    ],
    [
      "office",
      /tower|building|\bbank\b|trust|center|centre|plaza|empire state|chrysler|office|wall st|trade|flatiron|woolworth|singer|helmsley|headquarters|\bhq\b|tudor|ansonia|dakota|apartments?/,
    ],
  ];
  const cacheKind = new Map();
  H.locIconKind = function (l) {
    if (!l) return "marker";
    if (l.icon && ICONS[l.icon]) return l.icon;
    const key = l.id || l.name;
    if (key && cacheKind.has(key)) return cacheKind.get(key);
    const s = (
      String(l.id || "").replace(/_/g, " ") +
      " " +
      String(l.name || "")
    ).toLowerCase();
    let k = null;
    if (l.type === "cryo") k = "cryo";
    for (let i = 0; !k && i < RULES.length; i++)
      if (RULES[i][1].test(s)) k = RULES[i][0];
    if (!k) {
      if (l.type === "settlement") k = "city";
      else if (l.type === "landmark") k = "monument";
      else if (l.type === "hostile")
        k = l.faction === "raiders" || l.faction === "brutes" ? "camp" : "cave";
      else if (l.type === "dungeon") k = "ruins";
      else k = "marker";
    }
    // a friendly settlement inside a famous building still reads as a town on the map
    if (
      l.type === "settlement" &&
      !l.hostile &&
      k !== "cryo" &&
      k !== "military" &&
      k !== "church" &&
      k !== "hospital"
    )
      k = "city";
    if (key) cacheKind.set(key, k);
    return k;
  };
  H.locKindLabel = function (k) {
    return LABELS[k] || "LOCATION";
  };
  H.MAP_ICON_KINDS = Object.keys(ICONS);

  /**
   * Draw a marker pictogram centred at (x, y).  scale 1 → ±7 px.
   * filled: solid silhouette with cut-out details; else outline only.
   * cutCol: colour for the cut-outs (defaults to the display black).
   */
  H.drawMapIcon = function (g, kind, x, y, scale, filled, col, cutCol) {
    const ic = ICONS[kind] || ICONS.marker;
    g.save();
    g.translate(x, y);
    g.scale(scale, scale);
    g.lineJoin = "round";
    g.lineCap = "round";
    g.strokeStyle = col;
    g.fillStyle = col;
    const lw = 1.35;
    if (filled) {
      g.beginPath();
      ic.body(g);
      g.fill("nonzero");
      g.lineWidth = lw * 0.7;
      g.stroke();
      g.shadowBlur = 0;
      g.strokeStyle = cutCol || "#03080c";
      g.lineWidth = 1.15;
      g.beginPath();
      ic.detail(g);
      g.stroke();
    } else {
      // hollow: faint tinted fill so the pictogram reads over busy map detail
      g.beginPath();
      ic.body(g);
      const a = g.globalAlpha;
      g.globalAlpha = a * 0.16;
      g.fill("nonzero");
      g.globalAlpha = a;
      g.lineWidth = lw;
      g.stroke();
      g.lineWidth = lw * 0.8;
      g.beginPath();
      ic.detail(g);
      g.stroke();
    }
    g.restore();
  };

  /** Small raster of a marker (for DOM lists): data URL, cached per kind + colour. */
  const urlCache = new Map();
  H.mapIconURL = function (kind, col, filled) {
    const key = kind + "|" + col + "|" + (filled ? 1 : 0);
    let u = urlCache.get(key);
    if (u) return u;
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 36;
      H.drawMapIcon(
        c.getContext("2d"),
        kind,
        18,
        18,
        2.2,
        filled !== false,
        col,
        "rgba(0,0,0,0)",
      );
      u = c.toDataURL("image/png");
    } catch (e) {
      u = "";
    }
    urlCache.set(key, u);
    return u;
  };
})();
