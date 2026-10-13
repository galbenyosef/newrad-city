// play-inline-15 04 — ctx
// Lines 869-1218 of readable/play-inline-15.pretty.js (statement-aligned).
  X.EXTRA_POSTERS = {
    wanted(ctx, v, r) {
      K.bg(ctx, 400, 600, "solid", "#e0d0a8");
      X.text(ctx, "WANTED", 200, 70, {
        font: "slab",
        size: 84,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "DEAD OR ALIVE", 200, 130, {
        font: "slab",
        size: 30,
        color: "#8a1a10",
        spacing: 4,
      });
      ctx.fillStyle = "#b8a888";
      ctx.fillRect(90, 160, 220, 240);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.strokeRect(90, 160, 220, 240);
      A.dad(ctx, 200, 260, 55, { hat: true, suit: "#4a3a2a", tie: "#2a2a2a" });
      X.text(ctx, v % 2 ? '"MAD" MICKEY FLYNN' : "BIG TONY DELUCA", 200, 440, {
        font: "slab",
        size: 34,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "REWARD", 200, 495, {
        font: "slab",
        size: 40,
        color: "#8a1a10",
      });
      X.text(ctx, (v % 2 ? 300 : 500) + " SCRIP", 200, 545, {
        font: "slab",
        size: 50,
        color: INK,
      });
    },
    covenant_recruit(ctx) {
      K.bg(ctx, 400, 600, "sunburst", "#4a4440", "#3e3834", {
        cx: 200,
        cy: 250,
      });
      A.covenant(ctx, 200, 235, 260, {});
      X.text(ctx, "THE IRON COVENANT", 200, 55, {
        font: "copper",
        size: 34,
        color: "#e8e0cc",
        maxW: 370,
      });
      X.text(ctx, "IRON ENDURES", 200, 425, {
        font: "impact",
        size: 58,
        color: "#e8e0cc",
        stroke: INK,
        strokeW: 6,
        maxW: 370,
      });
      X.text(ctx, "Acolytes wanted — report to the Warden", 200, 490, {
        font: "typewriter",
        size: 20,
        color: "#e8e0cc",
        maxW: 370,
      });
      X.text(ctx, "Rockefeller Center", 200, 540, {
        font: "serif",
        size: 26,
        italic: true,
        color: "#c8b890",
      });
    },
    continuity(ctx) {
      K.bg(ctx, 400, 600, "solid", "#e8e4d8");
      ctx.fillStyle = "#1e3266";
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = "#a8231c";
      for (let k = 0; k < 4; k++) ctx.fillRect(0, 312 + k * 22, 400, 11);
      A.continuity(ctx, 200, 155, 120, {});
      X.text(ctx, "THE GOVERNMENT", 200, 430, {
        font: "deco",
        size: 40,
        color: "#1e3266",
        maxW: 370,
      });
      X.text(ctx, "NEVER STOPPED.", 200, 478, {
        font: "deco",
        size: 40,
        color: "#a8231c",
        maxW: 370,
      });
      X.text(ctx, "Tune to Continuity Radio · Obey curfew", 200, 540, {
        font: "condensed",
        size: 22,
        color: INK,
        spacing: 2,
        maxW: 370,
      });
    },
    missing(ctx, v, r) {
      K.bg(ctx, 400, 600, "solid", "#f0ece0");
      X.text(ctx, "MISSING", 200, 70, {
        font: "marker",
        size: 80,
        color: "#1a1a1a",
      });
      ctx.fillStyle = "#cfc8b8";
      ctx.fillRect(100, 130, 200, 220);
      A.kid(ctx, 200, 210, 55, { shirt: "#3a7ad0" });
      X.text(
        ctx,
        v % 2 ? "Have you seen our Timmy?" : "Our dog RUFUS",
        200,
        400,
        { font: "marker", size: 30, color: "#1a1a1a", maxW: 370 },
      );
      X.text(ctx, "Last seen near Grand Central", 200, 450, {
        font: "marker",
        size: 24,
        color: "#3a3a3a",
        maxW: 370,
      });
      X.text(ctx, "Please ask for Martha", 200, 520, {
        font: "marker",
        size: 26,
        color: "#8a1a1a",
        maxW: 370,
      });
      ctx.save();
      ctx.translate(200, 580);
      for (let k = 0; k < 8; k++) {
        ctx.fillStyle = "#e8e4d8";
        ctx.fillRect(-190 + k * 48, -30, 40, 40);
      }
      ctx.restore();
    },
    propaganda(ctx) {
      K.bg(ctx, 400, 600, "sunburst", "#1c2e52", "#24386a", {
        cx: 200,
        cy: 600,
      });
      ctx.strokeStyle = "rgba(232,240,246,0.5)";
      ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(60 + k * 30, 80 + k * 40);
        ctx.lineTo(300 + k * 20, 40 + k * 30);
        ctx.stroke();
      }
      A.dad(ctx, 200, 230, 70, {
        hat: true,
        suit: "#3a4a5a",
        hatColor: "#2a3440",
      });
      X.text(ctx, "WATCH THE", 200, 430, {
        font: "impact",
        size: 58,
        color: "#fff",
        stroke: INK,
        strokeW: 6,
      });
      X.text(ctx, "SKIES!", 200, 500, {
        font: "impact",
        size: 70,
        color: "#e8742a",
        stroke: INK,
        strokeW: 6,
      });
      X.text(ctx, "Report unknown aircraft to your Block Warden", 200, 560, {
        font: "condensed",
        size: 18,
        color: "#fff",
        maxW: 380,
      });
      A.ocd(ctx, 350, 60, 32, {});
    },
    long_winter_recruit(ctx) {
      K.bg(ctx, 400, 600, "solid", "#eef4f6");
      A.cryoPod(ctx, 120, 260, 70, {});
      A.longWinter(ctx, 285, 200, 90, {});
      X.text(ctx, "ONE WINTER’S SLEEP", 200, 430, {
        font: "deco",
        size: 36,
        color: "#1c2e52",
        maxW: 370,
      });
      X.text(ctx, "A LIFETIME OF SPRINGS", 200, 475, {
        font: "deco",
        size: 30,
        color: "#e8742a",
        maxW: 370,
      });
      X.text(ctx, "Volunteer at the Municipal Building · Room 1967", 200, 540, {
        font: "condensed",
        size: 20,
        color: "#1c2e52",
        spacing: 1,
        maxW: 370,
      });
    },
    glowkeepers(ctx) {
      K.bg(ctx, 400, 600, "radial", "#8a4a1a", "#1a0a04", { cx: 200, cy: 250 });
      ctx.save();
      ctx.shadowColor = "#ffc860";
      ctx.shadowBlur = 40;
      A.sunDisc(ctx, 200, 240, 140, { color: "#f2b23a" });
      ctx.restore();
      X.text(ctx, "THE BOMB", 200, 435, {
        font: "copper",
        size: 46,
        color: "#fff2c8",
        glow: "#ffc860",
      });
      X.text(ctx, "WAS A SUNRISE", 200, 490, {
        font: "copper",
        size: 40,
        color: "#fff2c8",
        glow: "#ffc860",
      });
      X.text(ctx, "Walk in the Glow · The Glowkeepers", 200, 555, {
        font: "typewriter",
        size: 20,
        color: "#f2b23a",
        maxW: 380,
      });
    },
    radio_free(ctx) {
      K.bg(ctx, 400, 600, "solid", "#1a1a1a");
      ctx.strokeStyle = "#f2c43a";
      ctx.lineWidth = 6;
      for (let k = 1; k < 5; k++) {
        ctx.beginPath();
        ctx.arc(200, 220, k * 40, -Math.PI * 0.85, -Math.PI * 0.15);
        ctx.stroke();
      }
      ctx.fillStyle = "#c8c8c0";
      ctx.beginPath();
      ctx.moveTo(200, 220);
      ctx.lineTo(160, 360);
      ctx.lineTo(240, 360);
      ctx.closePath();
      ctx.fill();
      X.text(ctx, "RADIO FREE", 200, 420, {
        font: "impact",
        size: 58,
        color: "#f2c43a",
      });
      X.text(ctx, "MANHATTAN", 200, 485, {
        font: "impact",
        size: 58,
        color: "#fff",
      });
      X.text(ctx, "The Voice of the Big Apple · Radio City", 200, 545, {
        font: "condensed",
        size: 20,
        color: "#c8c8c0",
        maxW: 380,
      });
    },
    rally_tonic(ctx) {
      // Dr. Halloran's Rally Tonic: a patent-medicine broadside — a brown bottle in a sunburst, a doctor's endorsement
      K.bg(ctx, 400, 600, "radial", "#f6e6b8", "#d8a858", { cx: 200, cy: 230 });
      ctx.save();
      ctx.strokeStyle = "rgba(160,60,20,0.25)";
      ctx.lineWidth = 10;
      for (let k = 0; k < 18; k++) {
        const a = (k * Math.PI) / 9;
        ctx.beginPath();
        ctx.moveTo(200 + Math.cos(a) * 70, 230 + Math.sin(a) * 70);
        ctx.lineTo(200 + Math.cos(a) * 190, 230 + Math.sin(a) * 190);
        ctx.stroke();
      }
      ctx.restore();
      A.amberBottle(ctx, 200, 90, 290, {
        label: "#f2e2b4",
        band: "#b0281a",
        text: "RALLY",
      });
      X.text(ctx, "DR. HALLORAN'S", 200, 400, {
        font: "serif",
        size: 26,
        color: "#5a2a0a",
        maxW: 360,
      });
      X.text(ctx, "RALLY TONIC", 200, 445, {
        font: "impact",
        size: 64,
        color: "#b0281a",
        maxW: 370,
      });
      X.text(ctx, "Doctor recommended!", 200, 495, {
        font: "serif",
        size: 30,
        italic: true,
        color: INK,
        maxW: 370,
      });
      K.fine(
        ctx,
        "Restores the vital spirits · 22% alc. · Civil Defense first-aid kits",
        200,
        545,
        "rgba(0,0,0,0.6)",
        15,
      );
    },
    prussian_blue(ctx) {
      // Prussian Blue capsules: a cool public-health notice in the pigment's own colour
      K.bg(ctx, 400, 600, "gradient", "#1c3c7a", "#0c1a3c");
      X.trefoil(ctx, 200, 220, 120, "rgba(255,255,255,0.08)");
      A.pillBottle(ctx, 200, 225, 130, 210, (c, x, y, w, h) => {
        c.fillStyle = "#123a7a";
        c.fillRect(x, y + h * 0.18, w, h * 0.4);
        X.text(c, "PRUSSIAN", x + w / 2, y + h * 0.38, {
          font: "impact",
          size: w * 0.17,
          color: "#fff",
          maxW: w * 0.9,
          noSafe: true,
        });
        X.text(c, "500 mg", x + w / 2, y + h * 0.78, {
          font: "condensed",
          size: w * 0.13,
          color: "#123a7a",
          maxW: w * 0.9,
          noSafe: true,
        });
      });
      X.text(ctx, "PRUSSIAN BLUE", 200, 420, {
        font: "impact",
        size: 58,
        color: "#f4f0e0",
        maxW: 370,
      });
      X.text(ctx, "It works while you wait.", 200, 478, {
        font: "serif",
        size: 30,
        italic: true,
        color: "#c8d8f0",
        maxW: 370,
      });
      K.fine(
        ctx,
        "Office of Civil Defense · Two capsules after exposure",
        200,
        540,
        "rgba(255,255,255,0.65)",
        17,
      );
    },
  };
