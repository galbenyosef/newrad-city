/* src/ui_interact/50_intro.js */
/* =====================================================================
 * NEW RAD CITY — ui_interact / 50_intro.js
 * The opening (state 'chargen' is the pre-game state: New Game → intro →
 * play; there is no character creation — the hero is fixed, G.HERO).
 * Text-only narration (typewriter, no voice) over procedurally painted,
 * sepia-toned illustrations (Ken-Burns drift, film grain, scratches, gate
 * weave): 1967, the World's Fair city, Project Long Winter, the European
 * bombers, then two LIVE beats over the real game world (Liberty from the
 * bay at dusk, Times Square toward the Empire State Building), ending on
 * an Office of Civil Defense test card. SPACE/ENTER/click advances,
 * ESC skips. When it ends, G.newGame starts the hero in his cryo pod.
 * ===================================================================== */
(function () {
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

  ART.black = (x) => {
    x.fillStyle = "#000";
    x.fillRect(0, 0, 1600, 900);
  };
  ART.city = (x, t) => {
    const r = G.util.rng(77);
    sky(x, "#2a2016", "#c38a4c");
    // searchlights
    x.save();
    x.globalCompositeOperation = "lighter";
    [
      [380, 0.25],
      [1120, -0.3],
      [800, 0.05],
    ].forEach(([sx, a], i) => {
      const aa = a + Math.sin(t * 0.4 + i) * 0.15;
      const g = x.createLinearGradient(sx, 900, sx + Math.sin(aa) * 900, 0);
      g.addColorStop(0, "rgba(255,240,200,.18)");
      g.addColorStop(1, "rgba(255,240,200,0)");
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(sx - 6, 760);
      x.lineTo(sx + Math.sin(aa) * 900 - 60, -50);
      x.lineTo(sx + Math.sin(aa) * 900 + 60, -50);
      x.lineTo(sx + 6, 760);
      x.fill();
    });
    x.restore();
    // airship
    x.fillStyle = "#3a2a1a";
    x.beginPath();
    x.ellipse(1250 - t * 8, 190, 120, 32, 0, 0, 6.283);
    x.fill();
    x.fillRect(1230 - t * 8, 218, 40, 12);
    skyline(x, r, 800, "#4a3522", {
      minH: 60,
      maxH: 180,
      windows: 0.25,
      winCol: "rgba(255,214,140,.7)",
    });
    empire(x, 560, 800, 1.35, "#2a1d12", "rgba(255,90,60,1)");
    chrysler(x, 1030, 800, 1.0, "#2a1d12");
    skyline(x, r, 900, "#1d140c", {
      minH: 60,
      maxH: 170,
      windows: 0.35,
      winCol: "rgba(255,200,120,.85)",
    });
    // cola billboard (tall ribbed bottle) and the Unisphere on the skyline
    x.fillStyle = "#120c07";
    x.fillRect(180, 610, 260, 130);
    x.fillStyle = "#b8321e";
    x.fillRect(188, 618, 244, 114);
    x.fillStyle = "#f4e4c1";
    x.font = "700 34px Oswald, sans-serif";
    x.fillText("FIZZO COLA", 200, 668);
    x.font = "18px Oswald, sans-serif";
    x.fillText("BUBBLES FOR TOMORROW", 212, 700);
    x.fillStyle = "#f4e4c1";
    x.fillRect(400, 632, 12, 70);
    x.fillRect(403, 622, 6, 12);
    x.save();
    x.strokeStyle = "rgba(244,228,193,.6)";
    x.lineWidth = 3;
    x.beginPath();
    x.arc(1350, 560, 70, 0, 6.283);
    x.stroke();
    x.beginPath();
    x.ellipse(1350, 560, 70, 24, 0.3, 0, 6.283);
    x.stroke();
    x.beginPath();
    x.ellipse(1350, 560, 26, 70, 0, 0, 6.283);
    x.stroke();
    x.restore();
  };
  ART.street = (x, t) => {
    const r = G.util.rng(12);
    sky(x, "#3b3024", "#8e7453");
    // buildings both sides (one-point perspective street)
    x.fillStyle = "#2b2118";
    x.beginPath();
    x.moveTo(0, 0);
    x.lineTo(620, 330);
    x.lineTo(620, 700);
    x.lineTo(0, 900);
    x.fill();
    x.beginPath();
    x.moveTo(1600, 0);
    x.lineTo(980, 330);
    x.lineTo(980, 700);
    x.lineTo(1600, 900);
    x.fill();
    x.fillStyle = "#4a3a2a";
    x.fillRect(620, 330, 360, 370);
    for (let i = 0; i < 60; i++) {
      x.fillStyle = "rgba(255,210,150," + r() * 0.4 + ")";
      const yy = 60 + r() * 600,
        xx = r() < 0.5 ? 40 + r() * 500 : 1060 + r() * 500;
      x.fillRect(xx, yy, 14, 20);
    }
    // Civil Defense billboard
    x.fillStyle = "#16110b";
    x.fillRect(660, 360, 280, 150);
    x.fillStyle = "#e8e0c8";
    x.fillRect(668, 368, 264, 134);
    cdEmblem(x, 716, 435, 40, "#b8321e", "#e8e0c8");
    x.fillStyle = "#1e2a3a";
    x.font = "700 22px Oswald, sans-serif";
    x.fillText("PROJECT LONG WINTER", 764, 410);
    x.font = "15px Oswald, sans-serif";
    x.fillText("SLEEP SAFE. WAKE TO", 768, 440);
    x.fillText("A BETTER TOMORROW.", 768, 462);
    x.font = "12px Oswald, sans-serif";
    x.fillText("OFFICE OF CIVIL DEFENSE", 768, 488);
    // road
    x.fillStyle = "#1c1611";
    x.beginPath();
    x.moveTo(0, 900);
    x.lineTo(620, 700);
    x.lineTo(980, 700);
    x.lineTo(1600, 900);
    x.fill();
    x.strokeStyle = "rgba(230,200,120,.4)";
    x.setLineDash([30, 40]);
    x.lineWidth = 6;
    x.beginPath();
    x.moveTo(800, 900);
    x.lineTo(800, 700);
    x.stroke();
    x.setLineDash([]);
    // queue of people silhouettes & a National Guardsman
    for (let i = 0; i < 16; i++) {
      const px = 150 + i * 36 + Math.sin(i * 7) * 6,
        sc = 1 - i * 0.03,
        py = 860 - i * 12;
      x.fillStyle = "#0e0a07";
      x.beginPath();
      x.arc(px, py - 108 * sc, 11 * sc, 0, 6.283);
      x.fill();
      x.fillRect(px - 13 * sc, py - 96 * sc, 26 * sc, 58 * sc);
      x.fillRect(px - 10 * sc, py - 40 * sc, 8 * sc, 40 * sc);
      x.fillRect(px + 2 * sc, py - 40 * sc, 8 * sc, 40 * sc);
      if (i % 3 === 0) {
        x.fillRect(px - 16 * sc, py - 120 * sc, 32 * sc, 5 * sc);
        x.fillRect(px - 9 * sc, py - 132 * sc, 18 * sc, 12 * sc);
      } // hats
    }
    const sx = 1230,
      sy = 870,
      s = 1.5; // guardsman: steel pot helmet, field jacket, rifle at port arms
    x.fillStyle = "#0b0806";
    x.fillRect(sx - 18 * s, sy - 140 * s, 36 * s, 72 * s);
    x.beginPath();
    x.arc(sx, sy - 152 * s, 11 * s, 0, 6.283);
    x.fill();
    x.beginPath();
    x.ellipse(sx, sy - 160 * s, 17 * s, 9 * s, 0, Math.PI, 0);
    x.fill();
    x.fillRect(sx - 18 * s, sy - 161 * s, 36 * s, 3 * s);
    x.fillRect(sx - 15 * s, sy - 70 * s, 12 * s, 70 * s);
    x.fillRect(sx + 3 * s, sy - 70 * s, 12 * s, 70 * s);
    x.save();
    x.translate(sx, sy - 112 * s);
    x.rotate(-0.6);
    x.fillRect(-48 * s, -3 * s, 96 * s, 6 * s);
    x.restore();
    void t;
  };
  ART.pods = (x, t) => {
    // the pod bay of Cryo Unit C-9: two rows of upright pods under cold strip lights, frost on everything
    sky(x, "#0d1418", "#1c272c");
    const g = x.createRadialGradient(800, 380, 40, 800, 380, 700);
    g.addColorStop(0, "rgba(180,220,235,.28)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 1600, 900);
    x.fillStyle = "#10171a";
    x.fillRect(0, 760, 1600, 140);
    for (let i = 0; i < 6; i++)
      ((x.fillStyle = "rgba(200,235,250,.5)"),
        x.fillRect(220 + i * 220, 70, 120, 8));
    const far = [260, 470, 1130, 1340],
      near = [120, 1480];
    far.forEach((px, i) =>
      pod(x, px, 700, 0.8, { dead: true, figure: i % 2 === 0, seed: 11 + i }),
    );
    near.forEach((px, i) =>
      pod(x, px, 820, 1.15, { dead: true, figure: true, seed: 21 + i }),
    );
    pod(x, 800, 760, 1.05, {
      figure: true,
      seed: 7,
      lamp: Math.sin(t * 3) > 0 ? "#ffb347" : "#6a4a1c",
    });
    x.fillStyle = "rgba(207,238,250,.55)";
    x.font = '700 22px "Share Tech Mono", monospace';
    x.textAlign = "center";
    x.fillText("CRYO UNIT C-9  ·  PROJECT LONG WINTER", 800, 52);
    x.textAlign = "left";
  };
  ART.bombs = (x, t) => {
    const flash = Math.max(0, 1 - t * 0.6);
    sky(x, "#6b3a1c", "#ffcf8a");
    mushroom(x, 1180, 760, 1.25, Math.min(1, t * 0.25));
    mushroom(x, 360, 780, 0.8, Math.min(1, t * 0.2));
    const r = G.util.rng(31);
    skyline(x, r, 820, "#1d120a", { minH: 90, maxH: 260 });
    empire(x, 760, 820, 1.2, "#140c06");
    chrysler(x, 980, 820, 0.8, "#140c06");
    x.fillStyle = "#0c0704";
    x.fillRect(0, 820, 1600, 80);
    if (flash > 0) {
      x.fillStyle = "rgba(255,255,245," + flash + ")";
      x.fillRect(0, 0, 1600, 900);
    }
  };
  ART.ruins = (x, t) => {
    sky(x, "#2a2218", "#a88a5e");
    const r = G.util.rng(99);
    // tea-brown harbor
    const g = x.createLinearGradient(0, 640, 0, 900);
    g.addColorStop(0, "#6b5a3c");
    g.addColorStop(1, "#2a2116");
    x.fillStyle = g;
    x.fillRect(0, 640, 1600, 260);
    for (let i = 0; i < 40; i++) {
      x.strokeStyle = "rgba(200,230,150," + (0.05 + r() * 0.1) + ")";
      x.beginPath();
      const yy = 660 + r() * 230;
      x.moveTo(r() * 1600, yy);
      x.lineTo(r() * 1600, yy);
      x.stroke();
    }
    skyline(x, r, 640, "#33291c", { minH: 80, maxH: 280, ruined: true });
    empire(x, 1050, 640, 1.1, "#251d14");
    liberty(x, 380, 760, 1.25, "#18130c");
    // torch glow
    x.save();
    x.globalCompositeOperation = "lighter";
    const tg = x.createRadialGradient(424, 238, 2, 424, 238, 70);
    tg.addColorStop(
      0,
      "rgba(255,200,130," + (0.6 + Math.sin(t * 3) * 0.1) + ")",
    );
    tg.addColorStop(1, "rgba(255,200,130,0)");
    x.fillStyle = tg;
    x.fillRect(334, 148, 180, 180);
    x.restore();
    // a twin-rotor helicopter crossing the bay
    const hx = 1300 - t * 20;
    x.fillStyle = "#15110b";
    x.beginPath();
    x.ellipse(hx, 200, 46, 10, 0, 0, 6.283);
    x.fill();
    x.fillRect(hx - 40, 186, 6, 12);
    x.fillRect(hx + 34, 184, 6, 14);
    x.fillRect(hx - 70, 184, 64, 2);
    x.fillRect(hx + 6, 182, 64, 2);
  };
  ART.pod = (x, t) => {
    // close on one pod: frost creeping off the glass, the status lamp blinking amber
    sky(x, "#0b1013", "#182226");
    const g = x.createRadialGradient(800, 430, 40, 800, 430, 640);
    g.addColorStop(0, "rgba(190,225,240,.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 1600, 900);
    pod(x, 800, 900, 3.1, {
      figure: true,
      seed: 5,
      lamp: Math.sin(t * 4) > 0 ? "#ffb347" : "#5a3a10",
    });
    // breath fog on the glass
    x.fillStyle = "rgba(235,248,255," + (0.1 + 0.08 * Math.sin(t * 1.4)) + ")";
    x.beginPath();
    x.ellipse(800, 360, 60, 40, 0, 0, 6.283);
    x.fill();
    x.fillStyle = "rgba(207,238,250,.7)";
    x.font = '700 26px "Share Tech Mono", monospace';
    x.textAlign = "center";
    x.fillText("POD 07 · THAW CYCLE ENGAGED", 800, 90);
    x.textAlign = "left";
  };
  ART.standby = (x, t) => {
    // Office of Civil Defense test card
    x.fillStyle = "#111";
    x.fillRect(0, 0, 1600, 900);
    const cols = [
      "#d8d8d0",
      "#d8cf3a",
      "#3ac8cf",
      "#8a8a84",
      "#cf3ab8",
      "#cf3a3a",
      "#3a4acf",
    ];
    cols.forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect(160 + i * 183, 90, 183, 520);
    });
    cdEmblem(x, 800, 350, 250, "#e6e6de", "#1b1b1b");
    x.fillStyle = "#e6e6de";
    x.font = "700 64px Oswald, sans-serif";
    x.textAlign = "center";
    x.fillText("OFFICE OF CIVIL DEFENSE", 800, 700);
    x.font = "700 54px Oswald, sans-serif";
    x.fillText("PLEASE STAND BY", 800, 800);
    x.textAlign = "left";
    void t;
  };

  // film look: grain + scratches + gate weave
  let grain = null;
  function makeGrain() {
    grain = document.createElement("canvas");
    grain.width = 256;
    grain.height = 256;
    const g = grain.getContext("2d"),
      im = g.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = Math.random() * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      im.data[i + 3] = 34;
    }
    g.putImageData(im, 0, 0);
  }

  // The procedural art is re-painted into an offscreen 1600×900 layer at ~20 fps
  // (it only animates slowly); the per-frame work is the camera drift + film look.
  let artLayer = null,
    artSlide = null,
    artT = -1;
  function paintArt(slide, t) {
    if (!artLayer) {
      artLayer = document.createElement("canvas");
      artLayer.width = 1600;
      artLayer.height = 900;
    }
    if (artSlide === slide && t - artT < 0.05 && t >= artT) return;
    artSlide = slide;
    artT = t;
    const a = artLayer.getContext("2d");
    a.setTransform(1, 0, 0, 1, 0, 0);
    a.globalCompositeOperation = "source-over";
    a.globalAlpha = 1;
    a.clearRect(0, 0, 1600, 900);
    try {
      (ART[slide.art] || ART.black)(a, t);
    } catch (e) {
      G.reportError("intro:art", e);
    }
  }
  /** Film look over the live 3D world: transparent canvas with a fade-up from black, vignette, band, grain, scratches. */
  function drawLiveFilm(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    const up = Math.max(0, 1 - t / 1.1);
    if (up > 0) {
      ctx.fillStyle = "rgba(0,0,0," + up.toFixed(3) + ")";
      ctx.fillRect(0, 0, w, h);
    }
    const v = ctx.createRadialGradient(
      w / 2,
      h / 2,
      h * 0.34,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.78,
    );
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,.7)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    const lb = ctx.createLinearGradient(0, h * 0.58, 0, h);
    lb.addColorStop(0, "rgba(0,0,0,0)");
    lb.addColorStop(1, "rgba(0,0,0,.66)");
    ctx.fillStyle = lb;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);
    if (!grain) makeGrain();
    const ox = Math.random() * 256,
      oy = Math.random() * 256;
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.translate(-ox, -oy);
    ctx.fillStyle = ctx.createPattern(grain, "repeat");
    ctx.fillRect(ox, oy, w, h);
    ctx.restore();
    if (Math.random() < 0.25) {
      ctx.strokeStyle =
        "rgba(255,250,230," + (0.04 + Math.random() * 0.08) + ")";
      ctx.lineWidth = 1;
      const sx = Math.random() * w;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + (Math.random() - 0.5) * 20, h);
      ctx.stroke();
    }
  }
  function drawSlide(cv, slide, t) {
    const ctx = cv.getContext("2d");
    const w = cv.width,
      h = cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (I && I.live && I.slide === slide) {
      drawLiveFilm(ctx, w, h, t);
      return;
    }
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    // cover-fit the 1600x900 art with a slow Ken Burns push + gate weave
    const scale = Math.max(w / 1600, h / 900) * (1.02 + t * 0.006);
    const weaveX = Math.sin(t * 13.1) * 0.8,
      weaveY = Math.sin(t * 9.7) * 1.1;
    paintArt(slide, t);
    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      (w - 1600 * scale) / 2 + weaveX,
      (h - 900 * scale) / 2 + weaveY,
    );
    ctx.drawImage(artLayer, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (slide.art !== "black") {
      // sepia wash & vignette
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle =
        slide.art === "ruins" ? "rgba(200,220,170,1)" : "rgba(236,214,170,1)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      const v = ctx.createRadialGradient(
        w / 2,
        h / 2,
        h * 0.3,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.75,
      );
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,.78)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
      // darken the lower third so the narration stays readable
      const lb = ctx.createLinearGradient(0, h * 0.55, 0, h);
      lb.addColorStop(0, "rgba(0,0,0,0)");
      lb.addColorStop(1, "rgba(0,0,0,.72)");
      ctx.fillStyle = lb;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
      // grain
      if (!grain) makeGrain();
      const ox = Math.random() * 256,
        oy = Math.random() * 256;
      ctx.save();
      ctx.translate(-ox, -oy);
      ctx.fillStyle = ctx.createPattern(grain, "repeat");
      ctx.fillRect(ox, oy, w, h);
      ctx.restore();
      // scratches & dust
      if (Math.random() < 0.35) {
        ctx.strokeStyle =
          "rgba(255,250,230," + (0.05 + Math.random() * 0.12) + ")";
        ctx.lineWidth = 1;
        const sx = Math.random() * w;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + (Math.random() - 0.5) * 20, h);
        ctx.stroke();
      }
      for (let i = 0; i < 3; i++)
        if (Math.random() < 0.3) {
          ctx.fillStyle = "rgba(0,0,0,.5)";
          ctx.fillRect(
            Math.random() * w,
            Math.random() * h,
            2 + Math.random() * 3,
            2 + Math.random() * 3,
          );
        }
      // flicker
      ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.06 + ")";
      ctx.fillRect(0, 0, w, h);
    }
  }

  // ------------------------------------------------------------------
  // Live world shots (the render gate in 90_module lets the world draw while one is up)
  // ------------------------------------------------------------------
  function canLive() {
    return !!(
      G.camera &&
      G.player &&
      G.player.pos &&
      !G.isStub("map") &&
      G.state === "chargen" &&
      window.THREE
    );
  }
  function liveBegin(spec) {
    const P = G.player;
    if (!I.saved)
      I.saved = {
        pos: P.pos.clone(),
        cam: !!P.camOverride,
        fov: G.camera.fov,
        hour: G.time && G.time.hour,
      };
    P.camOverride = true;
    I.live = spec;
    try {
      if (spec.hour != null) {
        if (X.live("atmos") && G.atmos.setHour) G.atmos.setHour(spec.hour);
        else if (G.time) G.time.hour = spec.hour;
      }
    } catch (e) {
      /* ignore */
    }
    liveCamera(0);
  }
  function liveEnd() {
    if (!I || !I.saved) {
      if (I) I.live = null;
      return;
    }
    const s = I.saved,
      P = G.player;
    I.live = null;
    I.saved = null;
    try {
      P.pos.copy(s.pos);
      P.camOverride = s.cam;
      if (G.camera && G.camera.fov !== s.fov) {
        G.camera.fov = s.fov;
        G.camera.updateProjectionMatrix();
      }
    } catch (e) {
      /* ignore */
    }
  }
  const _lp = window.THREE ? new window.THREE.Vector3() : null,
    _ll = window.THREE ? new window.THREE.Vector3() : null;
  function liveCamera(u) {
    const L = I.live,
      C = G.camera;
    if (!L || !C || !_lp) return;
    const k = G.util.smoothstep(0, 1, X.clamp(u, 0, 1));
    const lerp3 = (out, a, b) =>
      out.set(
        a[0] + (b[0] - a[0]) * k,
        a[1] + (b[1] - a[1]) * k,
        a[2] + (b[2] - a[2]) * k,
      );
    lerp3(_lp, L.from, L.to);
    lerp3(_ll, L.look0, L.look1);
    C.position.copy(_lp);
    C.up.set(0, 1, 0);
    C.lookAt(_ll);
    const fov = L.fov || 55;
    if (Math.abs(C.fov - fov) > 0.01) {
      C.fov = fov;
      C.updateProjectionMatrix();
    }
    G.player.pos.set(_lp.x, 0, _lp.z); // LOD, shadow camera and ambience follow the shot (as the title flyover does)
  }

  // ------------------------------------------------------------------
  // Flow
  // ------------------------------------------------------------------
  function show(i) {
    if (!I) return;
    if (i >= SLIDES.length) {
      finish();
      return;
    }
    I.i = i;
    I.t = 0;
    I.chars = 0;
    const s = SLIDES[i];
    I.slide = s;
    I.text = typeof s.text === "function" ? String(s.text()) : s.text || "";
    if (s.live && canLive()) liveBegin(s.live);
    else liveEnd();
    ui.root.classList.toggle("live", !!I.live);
    ui.text.className = "cg-intro-text" + (s.title ? " title" : "");
    ui.root.classList.toggle("band", !!s.text && !s.title); // legibility band only under narrated art slides
    ui.text.innerHTML = "";
    // crossfade between two canvases
    const next = ui.cvs[I.front ^ 1];
    I.front ^= 1;
    next.classList.add("on");
    ui.cvs[I.front ^ 1].classList.remove("on");
    I.hold = s.hold || (s.title ? 3.8 : 2.8);
    if (s.art === "bombs") X.sfx("explosion", { volume: 0.8 });
    if (s.art === "pod") X.sfx("steam_hiss", { volume: 0.5 });
    if (s.art === "standby") X.sfx("hum_electric", { volume: 0.3 });
  }
  function advance() {
    if (!I) return;
    if (I.chars < I.text.length) {
      I.chars = I.text.length;
      paintText();
      return;
    }
    show(I.i + 1);
  }
  function paintText() {
    const s = I.slide,
      txt = I.text;
    const n = Math.floor(I.chars);
    ui.text.innerHTML =
      X.esc(txt.slice(0, n)) +
      (n < txt.length || s.title ? '<span class="cg-caret"></span>' : "");
  }
  function finish() {
    if (!I) return;
    const cb = I.onDone;
    stop();
    if (cb) cb();
  }
  function stop() {
    if (!I) return;
    liveEnd();
    I = null;
    X.popScreen(screen);
    if (ui) {
      const r = ui.root;
      ui = null;
      r.style.transition = "opacity .6s";
      r.style.opacity = "0";
      setTimeout(() => r.remove(), 650);
    }
  }

  const screen = {
    id: "intro",
    onKey(code) {
      if (!I) return false;
      if (code === "Escape") {
        finish();
        return true;
      }
      if (
        code === "Space" ||
        code === "Enter" ||
        code === "NumpadEnter" ||
        code === "KeyE"
      ) {
        advance();
        return true;
      }
      return true;
    },
  };

  X.intro = {
    /** Play the intro; onDone called when finished or skipped. */
    play(onDone, opts) {
      opts = opts || {};
      if (I) stop();
      const root = G.ui.el("div", "ui-screen cg-intro");
      root.innerHTML =
        '<canvas></canvas><canvas></canvas><div class="cg-intro-text"></div><div class="cg-intro-skip">SPACE continue &nbsp;·&nbsp; ESC skip</div>';
      const cvs = Array.from(root.querySelectorAll("canvas"));
      ui = { root, cvs, text: root.querySelector(".cg-intro-text") };
      const fit = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        cvs.forEach((c) => {
          c.width = Math.round(window.innerWidth * dpr);
          c.height = Math.round(window.innerHeight * dpr);
        });
      };
      fit();
      ui.fit = fit;
      root.addEventListener("click", advance);
      I = {
        i: 0,
        t: 0,
        chars: 0,
        front: 0,
        onDone,
        slide: SLIDES[0],
        text: "",
      };
      X.pushScreen(screen);
      try {
        if (X.live("music") && G.music.setMood) G.music.setMood("title");
      } catch (e) {
        /* ignore */
      }
      show(opts.start || 0);
      if (opts.chars !== undefined) {
        I.chars = opts.chars;
      }
    },
    stop,
    isActive: () => !!I,
    /** Fully covers the screen (painted card) — false during a live world shot, so the world renders. */
    isOpaque: () => !!I && !I.live,
    update(realDt) {
      if (!I) return;
      const s = I.slide,
        len = I.text.length;
      I.t += realDt;
      const cps = s.title ? 9 : 34;
      if (I.t > (s.title ? 0.8 : 0.9) && I.chars < len) {
        I.chars = Math.min(len, I.chars + cps * realDt);
        paintText();
      }
      const cv = ui.cvs[I.front];
      // auto advance after the text has typed out + hold
      const typedAt = (s.title ? 0.8 : 0.9) + len / cps;
      if (I.live) liveCamera(I.t / (typedAt + I.hold + 1.5));
      drawSlide(cv, s, I.t);
      if (I.t > typedAt + I.hold) show(I.i + 1);
    },
    SLIDES,
  };
  function refit() {
    if (ui && ui.fit) {
      ui.fit();
      if (I) drawSlide(ui.cvs[I.front], I.slide, I.t);
    }
  }
  G.events.on("resize", refit); // core re-emits window resizes
  if (X.testMode())
    X._introChars = (n) => {
      if (I) {
        I.chars = Math.min(n, I.text.length);
        paintText();
      }
    };

  // ------------------------------------------------------------------
  // Start the game. There is no character creation: the hero is G.HERO
  // (core/player.js). A short fade to black, then G.newGame puts him in
  // his pod in Cryo Unit C-9.
  // ------------------------------------------------------------------
  let starting = false;
  function startGame() {
    if (starting) return;
    starting = true;
    const H = G.HERO || { name: "Eli Wayte" };
    const opts = {
      name: H.name,
      appearance: H.appearance ? Object.assign({}, H.appearance) : undefined,
    };
    const go = () => {
      starting = false;
      try {
        G.newGame(opts);
      } catch (e) {
        G.reportError("intro:newGame", e);
      }
    };
    if (G.SHOT || G.SMOKE) {
      go();
      return;
    }
    const fade = G.ui.el("div", "", document.body);
    fade.style.cssText =
      "position:fixed;inset:0;background:#000;opacity:0;transition:opacity .7s;z-index:990;pointer-events:none";
    requestAnimationFrame(() => {
      fade.style.opacity = "1";
    });
    setTimeout(() => {
      go();
      setTimeout(() => {
        fade.style.opacity = "0";
        setTimeout(() => fade.remove(), 800);
      }, 250);
    }, 750);
  }
  X.intro.startGame = startGame;
  /** New Game flow: intro (unless skipped) → the hero wakes in his pod. */
  X.intro.begin = function (data) {
    if (X.intro.isActive()) return;
    if (data && data.skipIntro) {
      startGame();
      return;
    }
    X.intro.play(() => {
      if (G.state === "chargen") startGame();
    });
  };
  G.events.on("state", (st) => {
    if (st !== "chargen") starting = false;
  });
  /** Public entry for the title screen's New Game: the pre-game state plays the intro, then the hero wakes. */
  G.intro = {
    start(opts) {
      if (opts && opts.skipIntro) {
        startGame();
        return;
      }
      G.setState("chargen", opts || {});
    },
    isActive: () => X.intro.isActive(),
    skip: () => {
      if (X.intro.isActive()) X.intro.stop();
      startGame();
    },
  };
})();
