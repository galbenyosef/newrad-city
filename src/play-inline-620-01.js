// play-inline-620 01 — basey
// Lines 15-361 of readable/play-inline-620.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._uix;
  const hero = () => (G.HERO && G.HERO.name) || "the sleeper";

  // text may be a function (resolved when the slide is shown)
  const SLIDES = [
    { art: "black", title: true, text: "New York. 1967." },
    {
      art: "city",
      text: "The World's Fair had promised the future in neon and stainless steel: moving sidewalks, picture-phones, a robot butler for every split-level. Over Times Square a cola girl winked at eight million people who knew exactly who the enemy was.",
    },
    {
      art: "street",
      text: "Everybody knew. The drills were for Moscow. The shelters were stocked against Moscow. And in a basement office on Centre Street, the Office of Civil Defense signed up volunteers for Project Long Winter: sleep through the worst of it, then wake up and help rebuild.",
    },
    {
      art: "pods",
      text: () =>
        hero() +
        " signed on a Tuesday. Records clerk, thirty-six, no family to speak of. On the twentieth of February 1967 they sealed him into Cryo Unit C-9, forty feet under the Municipal Building, for a ninety-day trial, and promised he would be home by Memorial Day.",
    },
    {
      art: "bombs",
      text: "Two weeks later, on Sunday morning, the fifth of March, the bombers came in from the east out of a grey late-winter sky. Not from Moscow. From Europe — the old allies, the Marshall Plan friends. Nobody has ever explained why. One bomb was enough for New York. It fell north of the city, on the Yonkers line, and the sky turned white.",
    },
    {
      art: "ruins",
      text: "Twenty-two years later the survivors call it New Rad City. Liberty still lifts her torch over a harbor the color of weak tea.",
      live: {
        from: [-250, 26, 1112],
        to: [-296, 36, 1166],
        look0: [-420, 62, 1250],
        look1: [-420, 72, 1250],
        hour: 18.35,
        fov: 50,
      },
    },
    {
      art: "ruins",
      text: "Survivors barter under the dead neon of Times Square. The Iron Covenant hoards old machines in Rockefeller Center. And on the radio, a government that never stopped believing it is 1967 still reads the evening news.",
      live: {
        from: [-160, 92, -345],
        to: [-78, 84, -246],
        look0: [70, 104, -80],
        look1: [84, 112, -72],
        hour: 18.6,
        fov: 55,
      },
    },
    {
      art: "pod",
      text: () =>
        "Under the Municipal Building the pods have been failing, one by one. One of them is still humming. The calendar on the wall says 1989, and " +
        hero() +
        " is about to wake up.",
    },
    { art: "standby", text: "", hold: 2.4 },
  ];

  let I = null;
  let ui = null;

  // ------------------------------------------------------------------
  // Procedural illustrations (all drawn in normalized 1600×900 space)
  // ------------------------------------------------------------------
  const ART = {};
  function sky(x, top, bottom) {
    const g = x.createLinearGradient(0, 0, 0, 900);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    x.fillStyle = g;
    x.fillRect(0, 0, 1600, 900);
  }
  function skyline(x, r, baseY, col, opts) {
    opts = opts || {};
    x.fillStyle = col;
    let px = -20;
    while (px < 1620) {
      const w = 40 + r() * 70,
        h = (opts.minH || 80) + r() * (opts.maxH || 260);
      if (opts.ruined && r() < 0.65) {
        // jagged, blown-out roofline with exposed girders
        x.beginPath();
        x.moveTo(px, baseY + 5);
        x.lineTo(px, baseY - h * (0.8 + r() * 0.2));
        const steps = 3 + Math.floor(r() * 4);
        for (let k = 1; k <= steps; k++)
          x.lineTo(px + (w * k) / steps, baseY - h * (0.55 + r() * 0.45));
        x.lineTo(px + w, baseY + 5);
        x.closePath();
        x.fill();
        x.save();
        x.strokeStyle = col;
        x.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          const gx = px + w * (0.2 + r() * 0.6);
          x.beginPath();
          x.moveTo(gx, baseY - h * 0.6);
          x.lineTo(gx + (r() - 0.5) * 16, baseY - h * (0.95 + r() * 0.2));
          x.stroke();
        }
        x.restore();
      } else {
        x.fillRect(px, baseY - h, w, h + 5);
        if (r() < 0.3) x.fillRect(px + w * 0.25, baseY - h - 30, w * 0.5, 32);
      }
      if (opts.windows) {
        x.save();
        for (let wy = baseY - h + 8; wy < baseY - 6; wy += 11)
          for (let wx = px + 5; wx < px + w - 6; wx += 9)
            if (r() < opts.windows) {
              x.fillStyle = opts.winCol;
              x.fillRect(wx, wy, 4, 5);
            }
        x.restore();
        x.fillStyle = col;
      }
      px += w + r() * 6;
    }
  }
  function empire(x, cx, baseY, s, col, lit) {
    x.fillStyle = col;
    const t = [
      [120, 150],
      [96, 90],
      [80, 150],
      [60, 50],
      [44, 40],
      [30, 30],
      [16, 50],
      [6, 70],
    ];
    let y = baseY;
    for (const [w, h] of t) {
      x.fillRect(cx - (w * s) / 2, y - h * s, w * s, h * s + 1);
      y -= h * s;
    }
    x.fillRect(cx - 1.5 * s, y - 60 * s, 3 * s, 60 * s);
    if (lit) {
      x.fillStyle = lit;
      x.beginPath();
      x.arc(cx, y - 60 * s, 4 * s, 0, 6.283);
      x.fill();
    }
  }
  function chrysler(x, cx, baseY, s, col) {
    x.fillStyle = col;
    x.fillRect(cx - 40 * s, baseY - 300 * s, 80 * s, 300 * s);
    x.fillRect(cx - 30 * s, baseY - 360 * s, 60 * s, 60 * s);
    for (let i = 0; i < 6; i++) {
      const w = (30 - i * 5) * s,
        y0 = baseY - (360 + i * 22) * s;
      x.beginPath();
      x.moveTo(cx - w, y0);
      x.quadraticCurveTo(cx, y0 - 40 * s, cx + w, y0);
      x.lineTo(cx + w, y0 + 2);
      x.lineTo(cx - w, y0 + 2);
      x.fill();
    }
    x.beginPath();
    x.moveTo(cx - 3 * s, baseY - 480 * s);
    x.lineTo(cx, baseY - 560 * s);
    x.lineTo(cx + 3 * s, baseY - 480 * s);
    x.fill();
  }
  function liberty(x, cx, baseY, s, col) {
    x.fillStyle = col;
    x.fillRect(cx - 60 * s, baseY - 40 * s, 120 * s, 40 * s); // fort
    x.fillRect(cx - 32 * s, baseY - 150 * s, 64 * s, 112 * s); // pedestal
    x.fillRect(cx - 38 * s, baseY - 160 * s, 76 * s, 14 * s);
    x.beginPath();
    x.moveTo(cx - 22 * s, baseY - 160 * s);
    x.lineTo(cx - 14 * s, baseY - 300 * s);
    x.lineTo(cx + 16 * s, baseY - 300 * s);
    x.lineTo(cx + 24 * s, baseY - 160 * s);
    x.fill(); // robe
    x.beginPath();
    x.arc(cx, baseY - 312 * s, 12 * s, 0, 6.283);
    x.fill();
    for (let i = -3; i <= 3; i++) {
      x.beginPath();
      const a = -Math.PI / 2 + i * 0.3;
      x.moveTo(
        cx + Math.cos(a) * 10 * s,
        baseY - 318 * s + Math.sin(a) * 10 * s,
      );
      x.lineTo(
        cx + Math.cos(a) * 26 * s,
        baseY - 318 * s + Math.sin(a) * 26 * s,
      );
      x.lineWidth = 3 * s;
      x.strokeStyle = col;
      x.stroke();
    }
    x.save();
    x.translate(cx + 12 * s, baseY - 290 * s);
    x.rotate(0.2);
    x.fillRect(-5 * s, -110 * s, 11 * s, 110 * s);
    x.restore(); // raised arm
    x.beginPath();
    x.moveTo(cx + 25 * s, baseY - 402 * s);
    x.lineTo(cx + 45 * s, baseY - 402 * s);
    x.lineTo(cx + 36 * s, baseY - 386 * s);
    x.fill(); // torch cup
    x.beginPath();
    x.moveTo(cx + 28 * s, baseY - 402 * s);
    x.quadraticCurveTo(
      cx + 35 * s,
      baseY - 430 * s,
      cx + 42 * s,
      baseY - 402 * s,
    );
    x.fill(); // flame
    x.fillRect(cx - 30 * s, baseY - 250 * s, 14 * s, 24 * s); // tablet
  }
  function mushroom(x, cx, baseY, s, t) {
    const g = x.createRadialGradient(
      cx,
      baseY - 330 * s,
      10 * s,
      cx,
      baseY - 300 * s,
      240 * s,
    );
    g.addColorStop(0, "rgba(255,248,220," + 0.95 + ")");
    g.addColorStop(0.35, "rgba(255,190,110,.85)");
    g.addColorStop(1, "rgba(120,70,40,0)");
    x.fillStyle = g;
    x.beginPath();
    x.ellipse(
      cx,
      baseY - 320 * s - t * 30 * s,
      200 * s * (0.8 + t * 0.2),
      110 * s,
      0,
      0,
      6.283,
    );
    x.fill();
    const g2 = x.createLinearGradient(cx - 50 * s, 0, cx + 50 * s, 0);
    g2.addColorStop(0, "rgba(160,100,60,.2)");
    g2.addColorStop(0.5, "rgba(255,220,170,.85)");
    g2.addColorStop(1, "rgba(160,100,60,.2)");
    x.fillStyle = g2;
    x.beginPath();
    x.moveTo(cx - 30 * s, baseY);
    x.quadraticCurveTo(
      cx - 60 * s,
      baseY - 160 * s,
      cx - 40 * s,
      baseY - 260 * s,
    );
    x.lineTo(cx + 40 * s, baseY - 260 * s);
    x.quadraticCurveTo(cx + 60 * s, baseY - 160 * s, cx + 30 * s, baseY);
    x.fill();
    x.fillStyle = "rgba(255,220,170,.35)";
    x.beginPath();
    x.ellipse(cx, baseY - 190 * s, 120 * s, 18 * s, 0, 0, 6.283);
    x.fill();
  }
  /** A Long Winter cryo pod (upright capsule with a frosted window), centred at cx, base y. */
  function pod(x, cx, baseY, s, opts) {
    opts = opts || {};
    const w = 90 * s,
      h = 260 * s,
      top = baseY - h;
    x.fillStyle = opts.shell || "#3c4246";
    x.beginPath();
    x.moveTo(cx - w / 2, baseY);
    x.lineTo(cx - w / 2, top + w / 2);
    x.arc(cx, top + w / 2, w / 2, Math.PI, 0);
    x.lineTo(cx + w / 2, baseY);
    x.closePath();
    x.fill();
    // window
    const ww = w * 0.62,
      wy = top + w * 0.35,
      wh = h * 0.62;
    const g = x.createLinearGradient(0, wy, 0, wy + wh);
    g.addColorStop(
      0,
      opts.dead ? "rgba(150,160,160,.75)" : "rgba(200,232,245,.9)",
    );
    g.addColorStop(
      1,
      opts.dead ? "rgba(70,78,80,.85)" : "rgba(120,170,195,.75)",
    );
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(cx - ww / 2, wy + wh);
    x.lineTo(cx - ww / 2, wy + ww / 2);
    x.arc(cx, wy + ww / 2, ww / 2, Math.PI, 0);
    x.lineTo(cx + ww / 2, wy + wh);
    x.closePath();
    x.fill();
    if (opts.figure) {
      x.fillStyle = "rgba(40,46,50,.55)";
      x.beginPath();
      x.arc(cx, wy + ww * 0.55, ww * 0.22, 0, 6.283);
      x.fill();
      x.fillRect(cx - ww * 0.26, wy + ww * 0.8, ww * 0.52, wh * 0.62);
    }
    // frost speckle
    const r = G.util.rng(opts.seed || 3);
    for (let i = 0; i < 60; i++) {
      x.fillStyle = "rgba(240,250,255," + (0.05 + r() * 0.25) + ")";
      x.fillRect(
        cx - ww / 2 + r() * ww,
        wy + r() * wh,
        2 + r() * 4,
        2 + r() * 4,
      );
    }
    // orange collar ring + status lamp
    x.fillStyle = "#c8682a";
    x.fillRect(cx - w / 2, top + w * 0.18, w, 8 * s);
    x.fillStyle = opts.lamp || (opts.dead ? "#5a1d16" : "#ffb347");
    x.beginPath();
    x.arc(cx, baseY - 18 * s, 6 * s, 0, 6.283);
    x.fill();
  }
  /** Office of Civil Defense emblem: a triangle inside a circle, "CD" in the triangle. */
  function cdEmblem(x, cx, cy, R, col, bg) {
    x.fillStyle = bg;
    x.beginPath();
    x.arc(cx, cy, R, 0, 6.283);
    x.fill();
    x.strokeStyle = col;
    x.lineWidth = R * 0.07;
    x.beginPath();
    x.arc(cx, cy, R * 0.92, 0, 6.283);
    x.stroke();
    x.fillStyle = col;
    x.beginPath();
    x.moveTo(cx, cy - R * 0.78);
    x.lineTo(cx + R * 0.68, cy + R * 0.42);
    x.lineTo(cx - R * 0.68, cy + R * 0.42);
    x.closePath();
    x.fill();
    x.fillStyle = bg;
    x.font = "700 " + Math.round(R * 0.42) + "px Oswald, sans-serif";
    x.textAlign = "center";
    x.fillText("CD", cx, cy + R * 0.3);
    x.textAlign = "left";
  }

