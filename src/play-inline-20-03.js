// play-inline-20 03 — ctx
// Lines 855-1179 of readable/play-inline-20.pretty.js (statement-aligned).
  if (X.EXTRA_POSTERS.long_winter_recruit) {
    X.EXTRA_POSTERS.long_winter_recruit = function (ctx) {
      K.bg(ctx, 400, 600, "solid", "#eef4f6");
      A.cryoPod(ctx, 120, 260, 70, {});
      A.longWinter(ctx, 285, 200, 90, {});
      X.text(ctx, "THEY SLEEP", 200, 430, {
        font: "deco",
        size: 38,
        color: "#1c2e52",
        maxW: 370,
      });
      X.text(ctx, "SO THE NATION MAY WAKE", 200, 475, {
        font: "deco",
        size: 28,
        color: "#e8742a",
        maxW: 370,
      });
      X.text(
        ctx,
        "Office of Civil Defense · Continuity of Government · 1968",
        200,
        540,
        {
          font: "condensed",
          size: 18,
          color: "#1c2e52",
          spacing: 1,
          maxW: 370,
        },
      );
    };
  }

  // ------------------------------------------------------------------
  // DECALS
  // ------------------------------------------------------------------
  const DEC = X.DECALS;
  const SIZE = (X.DECAL_SIZE = X.DECAL_SIZE || {});
  const gold = "#f2b23a";
  function decal(name, size, fn) {
    DEC[name] = fn;
    SIZE[name] = size;
  }
  decal("graffiti_keep_light", 512, (ctx, s, r) => {
    ctx.save();
    ctx.shadowColor = gold;
    ctx.shadowBlur = s * 0.02;
    sunRays(
      ctx,
      s / 2,
      s * 0.3,
      s * 0.2,
      "rgba(242,178,58,0.92)",
      s * 0.022,
      r,
      { wobble: 0.1 },
    );
    ctx.restore();
    X.spray(ctx, "SOMEBODY HAS TO", s / 2, s * 0.64, s * 0.085, gold, r, -0.02);
    X.spray(ctx, "KEEP THE LIGHT ON", s / 2, s * 0.8, s * 0.085, gold, r, 0.01);
  });
  decal("graffiti_dimanche", 256, (ctx, s, r) => {
    sunRays(
      ctx,
      s * 0.5,
      s * 0.3,
      s * 0.18,
      "rgba(244,240,224,0.9)",
      s * 0.02,
      r,
      { wobble: 0.12 },
    );
    X.spray(ctx, "A DIMANCHE", s / 2, s * 0.7, s * 0.14, "#f4f0e0", r, -0.05);
  });
  decal("graffiti_list", 256, (ctx, s, r) => {
    X.spray(ctx, "THE LIST", s / 2, s * 0.4, s * 0.15, "#f4f0e0", r, -0.04);
    X.spray(ctx, "HAS RETURNED", s / 2, s * 0.62, s * 0.11, "#f4f0e0", r, 0.02);
    sunRays(
      ctx,
      s * 0.84,
      s * 0.2,
      s * 0.09,
      "rgba(242,178,58,0.9)",
      s * 0.015,
      r,
      { wobble: 0.12 },
    );
  });
  decal("graffiti_ninety_days", 512, (ctx, s, r) => {
    X.spray(
      ctx,
      "90 DAYS OF WINTER",
      s / 2,
      s * 0.4,
      s * 0.09,
      "#e8eef2",
      r,
      -0.03,
    );
    X.spray(ctx, "& THEN THE SPRING", s / 2, s * 0.58, s * 0.09, gold, r, 0.02);
    sunRays(
      ctx,
      s / 2,
      s * 0.8,
      s * 0.08,
      "rgba(242,178,58,0.9)",
      s * 0.012,
      r,
      { wobble: 0.12 },
    );
  });
  decal("graffiti_second_sun", 512, (ctx, s, r) => {
    ctx.save();
    ctx.shadowColor = gold;
    ctx.shadowBlur = s * 0.03;
    A.sunDisc(ctx, s / 2, s * 0.34, s * 0.24, {
      color: "rgba(242,178,58,0.92)",
      ink: null,
    });
    ctx.restore();
    X.spray(ctx, "SUNDAY 9:47", s / 2, s * 0.78, s * 0.12, "#f4f0e0", r, -0.03);
  });
  decal("graffiti_unkindled", 256, (ctx, s, r) => {
    // a candle crossed out, and the runaways' motto
    ctx.save();
    ctx.strokeStyle = "rgba(230,226,214,0.9)";
    ctx.lineWidth = s * 0.03;
    ctx.lineCap = "round";
    ctx.strokeRect(s * 0.44, s * 0.2, s * 0.12, s * 0.3);
    ctx.beginPath();
    ctx.moveTo(s / 2, s * 0.2);
    ctx.quadraticCurveTo(s * 0.46, s * 0.12, s / 2, s * 0.06);
    ctx.stroke();
    ctx.strokeStyle = "rgba(216,38,26,0.95)";
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(s * 0.32, s * 0.08);
    ctx.lineTo(s * 0.68, s * 0.52);
    ctx.stroke();
    ctx.restore();
    X.spray(ctx, "NO CANDLES", s / 2, s * 0.68, s * 0.12, "#d8261a", r, -0.04);
    X.spray(ctx, "SPARKS ONLY", s / 2, s * 0.86, s * 0.11, "#f4f0e0", r, 0.03);
  });
  /** White chalk twelve-ray sun (Track 61 bulkhead, the sealed stair, the Hall of Candles). */
  decal("chalk_sun", 512, (ctx, s, r) => {
    for (let pass = 0; pass < 3; pass++)
      sunRays(
        ctx,
        s / 2 + (r() - 0.5) * 3,
        s / 2 + (r() - 0.5) * 3,
        s * 0.42,
        "rgba(236,234,226," + (0.35 + pass * 0.15) + ")",
        s * (0.012 + pass * 0.004),
        r,
        { wobble: 0.08 },
      );
    // chalk grain: knock holes out of the strokes
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 2600; k++) {
      ctx.fillStyle = "rgba(0,0,0," + (0.3 + r() * 0.6) + ")";
      ctx.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2);
    }
    ctx.restore();
  });
  /** Nicole's ballpoint signature: a quick twelve-ray sun in blue ink. */
  decal("sun_doodle", 256, (ctx, s, r) => {
    sunRays(ctx, s / 2, s / 2, s * 0.4, "rgba(36,52,120,0.9)", s * 0.018, r, {
      wobble: 0.14,
    });
  });
  /** A soot plume on a wall above a candle ledge (place with its bottom edge on the ledge). */
  decal("candle_soot", 512, (ctx, s, r) => {
    for (let k = 0; k < 14; k++) {
      const x = s * (0.5 + (r() - 0.5) * 0.25),
        y = s * (0.95 - r() * 0.75),
        w = s * (0.08 + r() * 0.16),
        h = s * (0.25 + r() * 0.4);
      const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h));
      g.addColorStop(0, "rgba(18,14,10," + (0.16 + r() * 0.14) + ")");
      g.addColorStop(1, "rgba(18,14,10,0)");
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(w / Math.max(w, h), h / Math.max(w, h));
      ctx.translate(-x, -y);
      ctx.fillStyle = g;
      ctx.fillRect(
        x - Math.max(w, h),
        y - Math.max(w, h),
        Math.max(w, h) * 2,
        Math.max(w, h) * 2,
      );
      ctx.restore();
    }
    const g = ctx.createLinearGradient(0, s * 0.7, 0, s);
    g.addColorStop(0, "rgba(10,8,6,0)");
    g.addColorStop(1, "rgba(10,8,6,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(s * 0.3, s * 0.7, s * 0.4, s * 0.3);
  });
  function waxDrip(ctx, x, y, len, w, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x - w * 0.35, y + len);
    ctx.arc(x, y + len, w * 0.4, Math.PI, 0, true);
    ctx.lineTo(x + w / 2, y);
    ctx.closePath();
    ctx.fill();
  }
  decal("wax_drips", 256, (ctx, s, r) => {
    const cols = [
      "rgba(238,226,196,0.95)",
      "rgba(226,204,150,0.95)",
      "rgba(200,60,40,0.9)",
      "rgba(246,240,224,0.95)",
    ];
    for (let k = 0; k < 9; k++) {
      ctx.fillStyle = cols[(r() * cols.length) | 0];
      X.smoothBlob(
        ctx,
        s * (0.2 + r() * 0.6),
        s * (0.25 + r() * 0.5),
        s * (0.05 + r() * 0.12),
        s * (0.04 + r() * 0.08),
        r,
        10,
        0.5,
      );
      ctx.fill();
    }
    for (let k = 0; k < 10; k++)
      waxDrip(
        ctx,
        s * (0.15 + r() * 0.7),
        s * 0.5,
        s * (0.08 + r() * 0.35),
        s * (0.02 + r() * 0.03),
        cols[(r() * 2) | 0],
      );
  });
  /** A ledge-full of melted candles under a chalk sun (the sealed stair in mq09; the Hall of Candles). */
  decal("candle_shrine", 512, (ctx, s, r) => {
    sunRays(
      ctx,
      s / 2,
      s * 0.26,
      s * 0.2,
      "rgba(236,234,226,0.75)",
      s * 0.012,
      r,
      { wobble: 0.08 },
    );
    const cols = ["#efe4c8", "#e2cc96", "#f6efe0", "#d8c08a"];
    for (let k = 0; k < 46; k++) {
      const x = s * (0.06 + r() * 0.88),
        base = s * (0.86 + r() * 0.1),
        h = s * (0.04 + r() * 0.18),
        w = s * (0.025 + r() * 0.03),
        c = cols[(r() * cols.length) | 0];
      ctx.fillStyle = c;
      ctx.fillRect(x - w / 2, base - h, w, h);
      for (let d = 0; d < 3; d++)
        waxDrip(
          ctx,
          x + (r() - 0.5) * w,
          base - h,
          h * (0.2 + r() * 0.7),
          w * 0.35,
          c,
        );
      ctx.fillStyle = "rgba(30,24,18,0.9)";
      ctx.fillRect(x - 1, base - h - s * 0.012, 2, s * 0.012);
    }
    ctx.fillStyle = "rgba(232,220,190,0.95)";
    X.smoothBlob(ctx, s / 2, s * 0.95, s * 0.48, s * 0.05, r, 18, 0.3);
    ctx.fill();
  });
  /** The great gilt sun painted across the M42 ceiling: twelve rays, flaking paint, soot at the edges. */
  decal("sun_mural", 1024, (ctx, s, r) => {
    const c = s / 2;
    const glow = ctx.createRadialGradient(c, c, s * 0.1, c, c, s * 0.5);
    glow.addColorStop(0, "rgba(200,120,30,0.5)");
    glow.addColorStop(1, "rgba(200,120,30,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, s, s);
    A.sunDisc(ctx, c, c, s * 0.46, {
      color: "#d89a2a",
      ink: "#3a2408",
      inner: "#8a5a12",
      core: "#f8e2a0",
    });
    // gilt highlights
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let k = 0; k < 300; k++) {
      const a = r() * TAU,
        rr = r() * s * 0.4;
      ctx.fillStyle = "rgba(255,220,140," + (0.05 + r() * 0.1) + ")";
      ctx.fillRect(
        c + Math.cos(a) * rr,
        c + Math.sin(a) * rr,
        2 + r() * 6,
        1 + r() * 2,
      );
    }
    ctx.restore();
    // flaking: chips knocked out of the paint
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 160; k++) {
      X.blobPath(ctx, r() * s, r() * s, 2 + r() * 14, r, 7, 0.7);
      ctx.fillStyle = "rgba(0,0,0," + (0.5 + r() * 0.5) + ")";
      ctx.fill();
    }
    ctx.restore();
    X.blotches(ctx, s, s, r, {
      count: 14,
      color: "#120c06",
      alpha: 0.25,
      rmin: s * 0.04,
      rmax: s * 0.14,
    });
  });
  /** The Kindling stone in St. Patrick's garden. */
