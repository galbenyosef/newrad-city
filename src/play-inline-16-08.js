// play-inline-16 08 — ctx
// Lines 2322-2473 of readable/play-inline-16.pretty.js (statement-aligned).
  def("forever_franks", {
    name: "Forever Franks",
    colors: ["#c8201a", "#f4c21e", "#fbf0d8"],
    slogans: [
      "So good they’ll outlive you!",
      "Frank-in-a-Bun · sealed fresh with Miracle-Keep",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "sunburst", "#c8201a", "#d6301e", {
        cx: 260,
        cy: 330,
        rays: 28,
      });
      ctx.fillStyle = "#fbf0d8";
      ctx.fillRect(0, 440, 1000, 60);
      ctx.fillStyle = "#c8201a";
      for (let x = 0; x < 1000; x += 50) {
        ctx.beginPath();
        ctx.arc(x + 25, 440, 25, 0, Math.PI);
        ctx.fill();
      }
      A.frankMascot(ctx, 255, 452, 76, {});
      X.text(ctx, "FOREVER", 690, 92, {
        font: "rounded",
        size: 96,
        color: "#fbf0d8",
        stroke: INK,
        strokeW: 9,
        maxW: 500,
        extrude: { color: "#5a0a06", n: 6 },
      });
      X.text(ctx, "FRANKS", 690, 196, {
        font: "rounded",
        size: 116,
        color: "#f4c21e",
        stroke: INK,
        strokeW: 10,
        maxW: 500,
        extrude: { color: "#5a0a06", n: 7 },
      });
      K.scriptLogo(
        ctx,
        "So good they’ll outlive you!",
        690,
        290,
        56,
        "#fff",
        "#5a0a06",
        { maxW: 500 },
      );
      X.text(ctx, "HOT DOGS · FRANK-IN-A-BUN · ROOT BEER", 690, 352, {
        font: "condensed",
        size: 26,
        color: "#fbf0d8",
        spacing: 3,
        maxW: 480,
      });
      K.fine(
        ctx,
        "Now with Miracle-Keep*",
        690,
        398,
        "rgba(255,240,216,0.9)",
        18,
      );
      X.text(ctx, "AT CARTS & COUNTERS ALL OVER TOWN · 10¢", 640, 478, {
        font: "condensed",
        size: 26,
        color: "#c8201a",
        spacing: 2,
        maxW: 560,
      });
      K.fine(
        ctx,
        "*a Forever Franks freshness process",
        160,
        488,
        "rgba(200,32,26,0.75)",
        12,
      );
    },
    art(ctx, cx, cy, s) {
      A.frankMascot(ctx, cx - s * 0.1, cy + s * 1.75, s * 0.75, {});
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "sunburst", "#c8201a", "#d6301e", {
        cx: 200,
        cy: 330,
      });
      A.frankMascot(ctx, 190, 470, 74, {});
      X.text(ctx, "FOREVER FRANKS", 200, 55, {
        font: "rounded",
        size: 54,
        color: "#f4c21e",
        stroke: INK,
        strokeW: 7,
        maxW: 370,
      });
      K.ribbonText(
        ctx,
        "SO GOOD THEY’LL OUTLIVE YOU!",
        200,
        530,
        360,
        50,
        "#f4c21e",
        "#a8800a",
        INK,
      );
      K.fine(
        ctx,
        "Now with Miracle-Keep",
        200,
        578,
        "rgba(255,240,216,0.9)",
        16,
      );
    },
  });

  /** Canonical billboard brand order (the city's list, G.LAYOUT.BRANDS, maps onto it 1:1). */
  X.BRAND_ORDER = [
    "fizzo_cola",
    "fizzo_blue",
    "long_winter",
    "prairie_root_beer",
    "liberty_jetliner",
    "first_journal",
    "pizza_galaxy",
    "empire_brew",
    "silver_torch",
    "burger_brigade",
    "excalibur_gardens",
    "junior_rocketeer",
    "miracle_mane",
    "big_apple_cab",
    "mama_marinara",
    "hi_octane",
    "vigil",
    "freedom_flakes",
    "chocolate_zeppelin",
    "golden_plain",
    "homeguard",
    "lonly_tv",
    "eagle_motors",
    "super_sergeant",
    "american_automaton",
    "forever_franks",
    "sky_patrol",
    "worlds_fair",
  ];
  X.EXTRA_BRANDS = [];
