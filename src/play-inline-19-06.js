// play-inline-19 06 — ctx
// Lines 1669-2237 of readable/play-inline-19.pretty.js (statement-aligned).
  const DECALS = {
    blood_splat(ctx, s, r) {
      bloodSplat(ctx, s, r, "rgba(90,6,4,0.92)", false);
    },
    blood_pool(ctx, s, r) {
      ctx.fillStyle = "rgba(70,4,2,0.9)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.4, s * 0.3, r, 16, 0.35);
      ctx.fill();
      ctx.fillStyle = "rgba(40,0,0,0.5)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.25, s * 0.18, r, 12, 0.4);
      ctx.fill();
      ctx.fillStyle = "rgba(255,220,220,0.15)";
      X.smoothBlob(ctx, s * 0.4, s * 0.42, s * 0.12, s * 0.05, r, 10, 0.3);
      ctx.fill();
    },
    blood_smear(ctx, s, r) {
      ctx.strokeStyle = "rgba(80,6,4,0.8)";
      ctx.lineCap = "round";
      for (let k = 0; k < 4; k++) {
        ctx.lineWidth = s * (0.03 + r() * 0.04);
        ctx.beginPath();
        ctx.moveTo(s * 0.15, s * (0.35 + k * 0.08));
        ctx.bezierCurveTo(
          s * 0.4,
          s * (0.3 + k * 0.1),
          s * 0.6,
          s * (0.45 + k * 0.05),
          s * 0.88,
          s * (0.4 + k * 0.08 + r() * 0.05),
        );
        ctx.stroke();
      }
    },
    blood_drips(ctx, s, r) {
      bloodSplat(ctx, s, r, "rgba(90,6,4,0.9)", false);
      ctx.fillStyle = "rgba(80,6,4,0.85)";
      for (let k = 0; k < 7; k++) {
        const x = s * (0.35 + r() * 0.3),
          l = s * (0.1 + r() * 0.35);
        ctx.fillRect(x, s / 2, s * 0.012, l);
        ctx.beginPath();
        ctx.arc(x + s * 0.006, s / 2 + l, s * 0.012, 0, TAU);
        ctx.fill();
      }
    },
    blood_green(ctx, s, r) {
      bloodSplat(ctx, s, r, "rgba(70,110,20,0.9)", false);
    },
    scorch(ctx, s, r) {
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(8,6,4,0.95)");
      g.addColorStop(0.5, "rgba(20,14,10,0.7)");
      g.addColorStop(1, "rgba(30,20,12,0)");
      ctx.fillStyle = g;
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.48, s * 0.48, r, 18, 0.35);
      ctx.fill();
      ctx.strokeStyle = "rgba(10,8,6,0.6)";
      for (let k = 0; k < 24; k++) {
        const a = r() * TAU;
        ctx.lineWidth = 1 + r() * 3;
        ctx.beginPath();
        ctx.moveTo(
          s / 2 + Math.cos(a) * s * 0.2,
          s / 2 + Math.sin(a) * s * 0.2,
        );
        ctx.lineTo(
          s / 2 + Math.cos(a) * s * 0.48,
          s / 2 + Math.sin(a) * s * 0.48,
        );
        ctx.stroke();
      }
    },
    // a burst / scatter of strikes (varied calibre, soft craters in irregular lighter spalls), kept inside the decal
    bullet_holes(ctx, s, r) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(s * 0.08, s * 0.08, s * 0.84, s * 0.84);
      ctx.clip();
      X.bulletStrikes(ctx, s, s, r, {
        count: 1,
        cx: s * (0.4 + r() * 0.2),
        cy: s * (0.4 + r() * 0.2),
        spread: s * 0.55,
        size: s * 0.011,
      });
      ctx.restore();
    },
    bullet_hole(ctx, s, r) {
      X.bulletHole(ctx, s / 2, s / 2, s * 0.08, r, false);
    },
    cracks(ctx, s, r) {
      X.cracks(ctx, s, s, r, {
        count: 3,
        width: 2,
        seg: s * 0.03,
        steps: 16,
        color: "rgba(20,16,12,0.85)",
        highlight: "rgba(230,220,200,0.3)",
      });
      radialFade(ctx, s, 0.3);
    },
    crack_ground(ctx, s, r) {
      for (let k = 0; k < 5; k++) {
        let x = s / 2,
          y = s / 2,
          a = (k / 5) * TAU + r() * 0.5;
        ctx.strokeStyle = "rgba(15,12,10,0.85)";
        ctx.lineWidth = s * 0.012;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let q = 0; q < 12; q++) {
          a += (r() - 0.5) * 0.7;
          x += Math.cos(a) * s * 0.035;
          y += Math.sin(a) * s * 0.035;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      radialFade(ctx, s, 0.25);
    },
    puddle(ctx, s, r) {
      ctx.fillStyle = "rgba(30,34,28,0.75)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.44, s * 0.3, r, 18, 0.4);
      ctx.fill();
      ctx.fillStyle = "rgba(160,170,150,0.18)";
      X.smoothBlob(ctx, s * 0.45, s * 0.45, s * 0.25, s * 0.1, r, 10, 0.4);
      ctx.fill();
    },
    rad_puddle(ctx, s, r) {
      const g = ctx.createRadialGradient(
        s / 2,
        s / 2,
        0,
        s / 2,
        s / 2,
        s * 0.45,
      );
      g.addColorStop(0, "rgba(140,255,90,0.95)");
      g.addColorStop(0.6, "rgba(60,200,40,0.8)");
      g.addColorStop(1, "rgba(30,120,20,0)");
      ctx.fillStyle = g;
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.45, s * 0.34, r, 16, 0.4);
      ctx.fill();
    },
    oil_stain(ctx, s, r) {
      ctx.fillStyle = "rgba(12,12,12,0.7)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.35, s * 0.28, r, 14, 0.5);
      ctx.fill();
      ctx.fillStyle = "rgba(12,12,12,0.4)";
      for (let k = 0; k < 6; k++) {
        X.smoothBlob(
          ctx,
          s * (0.2 + r() * 0.6),
          s * (0.2 + r() * 0.6),
          s * 0.06,
          s * 0.05,
          r,
          8,
          0.5,
        );
        ctx.fill();
      }
      radialFade(ctx, s, 0.35);
    },
    rust_stain(ctx, s, r) {
      const g = ctx.createLinearGradient(0, s * 0.1, 0, s);
      g.addColorStop(0, "rgba(130,60,20,0.8)");
      g.addColorStop(1, "rgba(130,60,20,0)");
      ctx.fillStyle = g;
      for (let k = 0; k < 6; k++) {
        const x = s * (0.3 + r() * 0.4),
          ww = s * (0.02 + r() * 0.06);
        ctx.fillRect(x, s * 0.1, ww, s * (0.4 + r() * 0.5));
      }
    },
    water_stain(ctx, s, r) {
      ctx.fillStyle = "rgba(90,70,40,0.25)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.4, s * 0.4, r, 14, 0.4);
      ctx.fill();
      ctx.strokeStyle = "rgba(80,55,25,0.5)";
      ctx.lineWidth = s * 0.012;
      ctx.stroke();
    },
    dirt_patch(ctx, s, r) {
      ctx.fillStyle = "rgba(70,56,36,0.8)";
      X.smoothBlob(ctx, s / 2, s / 2, s * 0.45, s * 0.4, r, 18, 0.5);
      ctx.fill();
      X.speckle(ctx, s, s, r, {
        count: 400,
        colors: ["#3a2c1a", "#8a7454"],
        min: 0.5,
        max: 2,
        alpha: 0.7,
      });
      radialFade(ctx, s, 0.2);
    },
    moss(ctx, s, r) {
      X.speckle(ctx, s, s, r, {
        count: 900,
        colors: ["#3a4a1e", "#4e5a26", "#2a3614"],
        min: 1,
        max: 4,
        alpha: 0.8,
      });
      radialFade(ctx, s, 0.1);
    },
    leaves(ctx, s, r) {
      for (let k = 0; k < 60; k++) {
        const x = s * (0.1 + r() * 0.8),
          y = s * (0.1 + r() * 0.8);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r() * TAU);
        ctx.fillStyle = X.css(
          ["#6a4a22", "#8a6a30", "#5a3a1a", "#7a5a2a"][(r() * 4) | 0],
          0.9,
        );
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.03, s * 0.015, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      radialFade(ctx, s, 0.3);
    },
    paper_litter(ctx, s, r) {
      for (let k = 0; k < 14; k++) {
        const x = s * (0.15 + r() * 0.7),
          y = s * (0.15 + r() * 0.7);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r() * TAU);
        ctx.fillStyle = X.css(
          ["#d8cca8", "#c8bc98", "#e8e0c8"][(r() * 3) | 0],
          0.95,
        );
        ctx.fillRect(-s * 0.04, -s * 0.05, s * 0.08, s * 0.1);
        ctx.fillStyle = "rgba(40,36,30,0.4)";
        for (let l = 0; l < 5; l++)
          ctx.fillRect(-s * 0.03, -s * 0.04 + l * s * 0.018, s * 0.06, 1);
        ctx.restore();
      }
    },
    footprints(ctx, s, r) {
      ctx.fillStyle = "rgba(40,30,20,0.5)";
      for (let k = 0; k < 6; k++) {
        const y = s * (0.9 - k * 0.15),
          x = s * 0.5 + (k % 2 ? 0.08 : -0.08) * s;
        ctx.beginPath();
        ctx.ellipse(x, y, s * 0.03, s * 0.055, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x, y + s * 0.07, s * 0.025, s * 0.02, 0, 0, TAU);
        ctx.fill();
      }
    },
    chalk_outline(ctx, s, r) {
      ctx.strokeStyle = "rgba(235,235,225,0.85)";
      ctx.lineWidth = s * 0.012;
      ctx.lineJoin = "round";
      ctx.beginPath();
      A.spline(
        ctx,
        [
          [0.5, 0.12],
          [0.58, 0.2],
          [0.56, 0.3],
          [0.78, 0.28],
          [0.82, 0.34],
          [0.6, 0.4],
          [0.6, 0.6],
          [0.7, 0.85],
          [0.62, 0.88],
          [0.5, 0.65],
          [0.4, 0.88],
          [0.32, 0.85],
          [0.4, 0.6],
          [0.4, 0.4],
          [0.2, 0.45],
          [0.16, 0.38],
          [0.42, 0.3],
          [0.42, 0.2],
        ].map((p) => [p[0] * s, p[1] * s]),
        true,
      );
      ctx.stroke();
    },
    hopscotch(ctx, s, r) {
      ctx.strokeStyle = "rgba(220,200,210,0.75)";
      ctx.lineWidth = s * 0.01;
      const b = s * 0.12,
        cx = s / 2;
      let y = s * 0.9;
      const rows = [1, 1, 2, 1, 2, 1];
      rows.forEach((n, i) => {
        for (let k = 0; k < n; k++)
          ctx.strokeRect(cx - (n * b) / 2 + k * b, y - b, b, b);
        X.text(ctx, String(i + 1), cx, y - b / 2, {
          font: "marker",
          size: b * 0.5,
          color: "rgba(220,200,210,0.75)",
        });
        y -= b;
      });
      ctx.beginPath();
      ctx.arc(cx, y - b * 0.2, b * 0.6, Math.PI, 0);
      ctx.stroke();
    },
    manhole(ctx, s, r) {
      const c = s / 2;
      ctx.beginPath();
      ctx.arc(c, c, s * 0.46, 0, TAU);
      ctx.fillStyle = "#3a3632";
      ctx.fill();
      ctx.strokeStyle = "#1a1816";
      ctx.lineWidth = s * 0.02;
      ctx.stroke();
      ctx.strokeStyle = "rgba(120,110,100,0.8)";
      ctx.lineWidth = s * 0.012;
      for (let k = 0; k < 7; k++) {
        ctx.beginPath();
        ctx.arc(c, c, s * (0.08 + k * 0.05), 0, TAU);
        ctx.stroke();
      }
      X.text(ctx, "N.Y.C. SEWER", c, c, {
        font: "slab",
        size: s * 0.07,
        color: "rgba(140,130,120,0.9)",
      });
      X.blotches(ctx, s, s, r, {
        count: 6,
        color: "#6a3a14",
        alpha: 0.4,
        rmin: s * 0.05,
        rmax: s * 0.15,
      });
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(c, c, s * 0.47, 0, TAU);
      ctx.fill();
      ctx.restore();
    },
    drain_grate(ctx, s, r) {
      ctx.fillStyle = "#2a2826";
      ctx.fillRect(s * 0.15, s * 0.3, s * 0.7, s * 0.4);
      ctx.fillStyle = "#0a0a08";
      for (let k = 0; k < 9; k++)
        ctx.fillRect(s * 0.18 + k * s * 0.072, s * 0.33, s * 0.04, s * 0.34);
      ctx.strokeStyle = "#4a4440";
      ctx.lineWidth = s * 0.015;
      ctx.strokeRect(s * 0.15, s * 0.3, s * 0.7, s * 0.4);
    },
    long_winter_emblem(ctx, s, r) {
      A.longWinter(ctx, s / 2, s * 0.46, s * 0.4, {});
      X.text(ctx, "O · C · D", s / 2, s * 0.93, {
        font: "deco",
        size: s * 0.07,
        color: "#1c2e52",
        spacing: 4,
        maxW: s * 0.8,
      });
    },
    cryo_c9(ctx, s, r) {
      // facility door stencil: crystal in a ring + fitted "C-9" + CRYO UNIT caption
      A.longWinter(ctx, s / 2, s * 0.42, s * 0.36, { text: false });
      ctx.beginPath();
      ctx.arc(s / 2, s * 0.42, s * 0.2, 0, TAU);
      ctx.fillStyle = "#1c2e52";
      ctx.fill();
      X.text(ctx, "C-9", s / 2, s * 0.43, {
        font: "stencil",
        size: s * 0.15,
        color: "#eef4f6",
        maxW: s * 0.34,
      });
      X.text(ctx, "CRYO UNIT", s / 2, s * 0.88, {
        font: "stencil",
        size: s * 0.1,
        color: "#e8742a",
        stroke: "#1c2e52",
        strokeW: s * 0.01,
        maxW: s * 0.8,
        spacing: 4,
      });
      X.blotches(ctx, s, s, r, {
        count: 5,
        color: "#1a1410",
        alpha: 0.3,
        rmin: s * 0.04,
        rmax: s * 0.1,
      });
    },
    radiation(ctx, s, r) {
      X.trefoil(ctx, s / 2, s / 2, s * 0.36, "#1a1a1a", "#f0c020");
      X.blotches(ctx, s, s, r, {
        count: 6,
        color: "#5a3a10",
        alpha: 0.35,
        rmin: s * 0.04,
        rmax: s * 0.12,
      });
    },
    radiation_sign(ctx, s, r) {
      ctx.fillStyle = "#f0c020";
      ctx.beginPath();
      ctx.moveTo(s / 2, s * 0.05);
      ctx.lineTo(s * 0.95, s * 0.85);
      ctx.lineTo(s * 0.05, s * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = s * 0.04;
      ctx.stroke();
      X.trefoil(ctx, s / 2, s * 0.58, s * 0.18, "#1a1a1a");
      X.text(ctx, "CAUTION", s / 2, s * 0.93, {
        font: "impact",
        size: s * 0.1,
        color: "#f0c020",
        stroke: "#1a1a1a",
        strokeW: s * 0.02,
      });
    },
    fizzo_logo(ctx, s, r) {
      const c = s / 2;
      ctx.beginPath();
      ctx.arc(c, c, s * 0.44, 0, TAU);
      A.fs(ctx, "#f6eed8", s * 0.03, "#c8241c");
      ctx.beginPath();
      ctx.arc(c, c, s * 0.37, 0, TAU);
      ctx.strokeStyle = "#2a8a84";
      ctx.lineWidth = s * 0.02;
      ctx.stroke();
      X.text(ctx, "Fizzo", c, c - s * 0.03, {
        font: "script",
        size: s * 0.22,
        weight: "normal",
        color: "#c8241c",
        maxW: s * 0.62,
      });
      X.text(ctx, "COLA", c, c + s * 0.17, {
        font: "condensed",
        size: s * 0.08,
        color: "#2a8a84",
        spacing: 4,
      });
      ctx.strokeStyle = "rgba(42,138,132,0.6)";
      ctx.lineWidth = s * 0.008;
      for (let k = 0; k < 7; k++) {
        ctx.beginPath();
        ctx.arc(
          c + (r() - 0.5) * s * 0.5,
          c - s * 0.25 + r() * s * 0.06,
          s * (0.01 + r() * 0.015),
          0,
          TAU,
        );
        ctx.stroke();
      }
    },
    covenant_emblem(ctx, s, r) {
      A.covenant(ctx, s / 2, s * 0.5, s * 0.92);
      X.blotches(ctx, s, s, r, {
        count: 5,
        color: "#3a2a18",
        alpha: 0.25,
        rmin: s * 0.03,
        rmax: s * 0.1,
      });
    },
    continuity_seal(ctx, s, r) {
      A.continuity(ctx, s / 2, s / 2, s * 0.44);
      X.blotches(ctx, s, s, r, {
        count: 4,
        color: "#2a2018",
        alpha: 0.2,
        rmin: s * 0.03,
        rmax: s * 0.09,
      });
    },
    sun_glow(ctx, s, r) {
      ctx.save();
      ctx.shadowColor = "#ffc860";
      ctx.shadowBlur = s * 0.06;
      A.sunDisc(ctx, s / 2, s / 2, s * 0.4, {
        color: "#ffd27a",
        ink: null,
        core: "#fff8e0",
      });
      ctx.restore();
    },
    graffiti_skull(ctx, s, r) {
      X.skullTag(ctx, s / 2, s * 0.35, s * 0.4, "rgba(210,30,20,0.9)");
    },
    graffiti_sleeper(ctx, s, r) {
      ctx.globalAlpha = 0.85;
      A.snowflake(ctx, s * 0.5, s * 0.36, s * 0.22, "#e8eef2", s * 0.03);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(216,38,26,0.9)";
      ctx.lineWidth = s * 0.035;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s * 0.25, s * 0.12);
      ctx.lineTo(s * 0.75, s * 0.6);
      ctx.stroke();
      X.spray(
        ctx,
        "THEY KNEW",
        s * 0.5,
        s * 0.85,
        s * 0.12,
        "#d8261a",
        r,
        -0.1,
      );
    },
    graffiti_arrow(ctx, s, r) {
      ctx.save();
      ctx.strokeStyle = "rgba(240,200,40,0.9)";
      ctx.shadowColor = "#f0c828";
      ctx.shadowBlur = s * 0.02;
      ctx.lineWidth = s * 0.05;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s * 0.12, s * 0.5);
      ctx.lineTo(s * 0.82, s * 0.5);
      ctx.moveTo(s * 0.6, s * 0.3);
      ctx.lineTo(s * 0.85, s * 0.5);
      ctx.lineTo(s * 0.6, s * 0.7);
      ctx.stroke();
      ctx.restore();
      X.spray(ctx, "SAFE", s * 0.45, s * 0.28, s * 0.12, "#f0c828", r, 0);
    },
    graffiti_raiders(ctx, s, r) {
      X.skullTag(ctx, s * 0.5, s * 0.3, s * 0.25, "rgba(20,20,20,0.9)");
      X.spray(ctx, "FIENDS", s / 2, s * 0.78, s * 0.16, "#d8261a", r, -0.08);
    },
    graffiti_sun(ctx, s, r) {
      ctx.save();
      ctx.shadowColor = "#f2b23a";
      ctx.shadowBlur = s * 0.02;
      A.sunDisc(ctx, s / 2, s * 0.38, s * 0.24, {
        color: "rgba(242,178,58,0.9)",
        ink: null,
      });
      ctx.restore();
      X.spray(
        ctx,
        "WALK IN THE GLOW",
        s / 2,
        s * 0.84,
        s * 0.1,
        "#f2b23a",
        r,
        0,
      );
    },
    graffiti_covenant(ctx, s, r) {
      X.spray(
        ctx,
        "IRON ENDURES",
        s / 2,
        s * 0.5,
        s * 0.11,
        "#e8e0d0",
        r,
        -0.05,
      );
    },
  };
