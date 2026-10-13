// play-inline-19 09 — tex
// Lines 3181-3329 of readable/play-inline-19.pretty.js (statement-aligned).
  X.ICONS = ICONS;
  function iconCanvas(name, color) {
    const s = 128,
      cv = X.canvas(s, s),
      c = cv.ctx;
    c.strokeStyle = color || "#ffffff";
    c.fillStyle = color || "#ffffff";
    c.lineWidth = 5;
    c.lineJoin = "round";
    c.lineCap = "round";
    const fn = ICONS[name] || ICONS.misc;
    ICOL = color || "#ffffff";
    try {
      fn(c);
    } catch (e) {
      G.reportError("textures:icon:" + name, e);
    }
    return cv.c;
  }
  X.iconTex = function (name) {
    name = String(name || "misc");
    if (iconCache.has(name)) return iconCache.get(name);
    if (!ICONS[name]) {
      const t = X.iconTex("misc");
      iconCache.set(name, t);
      return t;
    } // alias, no new texture
    const tex = X.toTexture(iconCanvas(name), {
      repeat: false,
      name: "icon_" + name,
      regen: () => iconCanvas(name),
    });
    tex.userData.alpha = true;
    iconCache.set(name, tex);
    return tex;
  };
  X.iconURL = function (name, color) {
    const key = name + "|" + (color || "#cfeefa");
    if (iconURLCache.has(key)) return iconURLCache.get(key);
    const cv = iconCanvas(name, color || "#cfeefa");
    let url = null;
    try {
      url = cv.toDataURL("image/png");
    } catch (e) {
      url = null;
    }
    iconURLCache.set(key, url);
    return url;
  };

  // Debug listing for the contact sheet
  X.debugSigns = function () {
    const nd = (label, t) => [
      { label, tex: t },
      { label: label + " (day albedo)", tex: X.neonDayTex(t) },
    ];
    return [
      ...nd(
        "neon pink",
        X.neonTex("The Neon", "pink", { border: true, icon: "star" }),
      ),
      ...nd(
        "neon red sub",
        X.neonTex("Fizzo Cola", "red", { sub: "ICE COLD", icon: "cola" }),
      ),
      {
        label: "neon pink",
        tex: X.neonTex("The Neon", "pink", { border: true, icon: "star" }),
      },
      {
        label: "neon green",
        tex: X.neonTex("BAR", "green", {
          font: "deco",
          icon: "martini",
          border: true,
        }),
      },
      {
        label: "neon red sub",
        tex: X.neonTex("Fizzo Cola", "red", { sub: "ICE COLD", icon: "cola" }),
      },
      {
        label: "neon blue",
        tex: X.neonTex("HOTEL", "blue", { font: "deco", broken: 0.3 }),
      },
      {
        label: "neon yellow",
        tex: X.neonTex("Radio Free Manhattan", "yellow", { font: "condensed" }),
      },
      { label: "street", tex: X.signTex("Broadway", "street") },
      { label: "street W", tex: X.signTex("42 St", "street", { sub: "W" }) },
      {
        label: "subway",
        tex: X.signTex("Times Sq - 42 St", "subway", {
          routes: ["1", "2", "3", "N", "S"],
        }),
      },
      {
        label: "shop",
        tex: X.signTex("Hardware", "shop", { sub: "TOOLS · KEYS" }),
      },
      {
        label: "wood",
        tex: X.signTex("GRAND CENTRAL MARKET", "wood", {
          sub: "NO GUNS DRAWN",
        }),
      },
      { label: "wood toll", tex: X.signTex("TOLL 20 SCRIP", "wood") },
      { label: "wood 2", tex: X.signTex("CLINIC", "wood") },
      { label: "metal", tex: X.signTex("AUTHORIZED ONLY", "metal") },
      { label: "warning", tex: X.signTex("RADIATION HAZARD", "warning") },
      { label: "danger", tex: X.signTex("HIGH VOLTAGE", "danger") },
      {
        label: "enamel",
        tex: X.signTex("Drink Fizzo Cola", "enamel", {
          bg: "#b8201a",
          font: "script",
        }),
      },
      { label: "cryo", tex: X.signTex("CRYO UNIT C-9", "cryo") },
      { label: "marquee", tex: X.signTex("RADIO CITY\nMUSIC HALL", "marquee") },
      { label: "lightbox", tex: X.signTex("DINER", "lightbox") },
      {
        label: "plaque",
        tex: X.signTex("EMPIRE STATE BUILDING", "plaque", {
          sub: "Completed 1931 · 102 Stories",
        }),
      },
      { label: "exit", tex: X.signTex("EXIT", "exit") },
      { label: "gilt", tex: X.signTex("ROCKEFELLER PLAZA", "gilt") },

      {
        label: "banner covenant",
        tex: X.signTex("THE IRON COVENANT", "banner", {
          bg: "#5a4a32",
          fg: "#e8dcc0",
          emblem: "covenant",
        }),
      },
      {
        label: "banner glow",
        tex: X.signTex("THE GLOWKEEPERS", "banner", {
          bg: "#6a2a0e",
          fg: "#f2c25a",
          emblem: "sun",
        }),
      },
    ];
  };
