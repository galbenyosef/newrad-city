// play-inline-599 02 — key
// Lines 373-523 of readable/play-inline-599.pretty.js (statement-aligned).
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
