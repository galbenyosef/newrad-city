// play-inline-441 06 — txt
// Lines 1627-1978 of readable/play-inline-441.pretty.js (statement-aligned).
  R("sign_keepout", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#6a5a44";
    c.fillRect(0, 0, w, h);
    txt(c, "KEEP OUT", w / 2, 30, 26, "#e8e0d0", {
      font: F_SCRIPT,
      weight: "normal",
    });
    txt(c, "OR ELSE", w / 2, 66, 22, "#b01a10", {
      font: F_SCRIPT,
      weight: "normal",
    });
    weather(c, w, h, r, 1);
  });
  R("sign_toll", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#5a5044";
    c.fillRect(0, 0, w, h);
    txt(c, "TOLL", w / 2, 28, 28, "#e8d8b0", {
      font: F_SCRIPT,
      weight: "normal",
    });
    txt(c, "20 SCRIP", w / 2, 64, 24, "#e8c040", {
      font: F_SCRIPT,
      weight: "normal",
    });
    weather(c, w, h, r, 1);
  });
  R("sign_danger", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#e8c030";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#111";
    c.fillRect(0, 0, w, 30);
    txt(c, "DANGER", w / 2, 15, 22, "#e8c030");
    txt(c, "RADIATION", w / 2, 52, 18, "#111");
    txt(c, "AREA", w / 2, 76, 18, "#111");
    weather(c, w, h, r, 0.9);
  });
  R("sign_restricted", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#3a3a3a";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c8b070";
    c.beginPath();
    c.moveTo(w / 2, 8);
    c.lineTo(w / 2 + 28, 36);
    c.lineTo(w / 2, 64);
    c.lineTo(w / 2 - 28, 36);
    c.closePath();
    c.fill();
    txt(c, "!", w / 2, 37, 34, "#3a3a3a");
    txt(c, "RESTRICTED", w / 2, 78, 15, "#c8b070");
    weather(c, w, h, r, 0.7);
  });
  R("sign_scrip", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#6a4a2a";
    c.fillRect(0, 0, w, h);
    txt(c, "TRADE", w / 2, 30, 24, "#f0e0b0", {
      font: F_SCRIPT,
      weight: "normal",
    });
    txt(c, "SCRIP ONLY", w / 2, 66, 18, "#e8c040");
    weather(c, w, h, r, 1);
  });
  const STALLS = [
    ["JUNK & SALVAGE", "#c8a060"],
    ["CLEAN WATER", "#6ab0d0"],
    ["GUNS · AMMO", "#b05a3a"],
    ["PIGEON BITS", "#8ab050"],
    ["DOC'S CHEMS", "#d0d0d0"],
    ["FIZZO COLA", "#d03030"],
  ];
  STALLS.forEach((s, i) =>
    R("stall_" + i, 256, 64, (c, w, h, r) => {
      c.fillStyle = "#4a3a2a";
      c.fillRect(0, 0, w, h);
      c.strokeStyle = "#2a1a10";
      c.lineWidth = 6;
      c.strokeRect(0, 0, w, h);
      txt(c, s[0], w / 2, h / 2, 32, s[1], {
        font: F_SCRIPT,
        weight: "normal",
        maxW: w - 20,
      });
      weather(c, w, h, r, 1);
    }),
  );
  X.STALL_SIGNS = STALLS.length;
  const GRAF = [
    (c, w, h) => {
      txt(c, "TRESPASSERS", w / 2, 40, 34, "#c01a14", {
        font: F_SCRIPT,
        weight: "normal",
      });
      txt(c, "EAT LEAD", w / 2, 88, 40, "#c01a14", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
    (c, w, h) => {
      txt(c, "THE END IS", w / 2, 40, 30, "#e8e0d0", {
        font: F_SCRIPT,
        weight: "normal",
      });
      txt(c, "NIGH!!", w / 2, 90, 44, "#e8e0d0", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
    (c, w, h) => {
      c.strokeStyle = "#b01a14";
      c.lineWidth = 8;
      c.beginPath();
      c.arc(70, 64, 40, 0, X.TAU);
      c.stroke();
      c.beginPath();
      c.moveTo(40, 40);
      c.lineTo(100, 90);
      c.moveTo(100, 40);
      c.lineTo(40, 90);
      c.stroke();
      txt(c, "KEEP OUT", 180, 64, 32, "#b01a14", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
    (c, w, h) => {
      c.fillStyle = "#f0a020";
      c.beginPath();
      c.arc(60, 64, 26, 0, X.TAU);
      c.fill();
      rays(c, 60, 64, 12, 48, "rgba(240,160,32,0.8)");
      txt(c, "THE GLOW", 172, 50, 30, "#f0a020", {
        font: F_SCRIPT,
        weight: "normal",
      });
      txt(c, "IS HOLY", 172, 92, 30, "#f0a020", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
    (c, w, h) => {
      txt(c, "THEY WERE", w / 2, 40, 26, "#f0d040", {
        font: F_SCRIPT,
        weight: "normal",
        maxW: 240,
      });
      txt(c, "PEOPLE TOO", w / 2, 88, 32, "#f0d040", {
        font: F_SCRIPT,
        weight: "normal",
      });
    },
  ];
  GRAF.forEach((fn, i) =>
    R("graffiti_" + i, 256, 128, (c, w, h, r) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = "rgba(80,70,60,1)";
      c.fillRect(0, 0, w, h);
      fn(c, w, h);
      weather(c, w, h, r, 0.8);
    }),
  );
  X.GRAFFITI = GRAF.length;
  const CONT = [
    ["EMPIRE BREW HOUSE", "BROOKLYN, N.Y.", "#1e4a34", "#f0e0b0"],
    ["KESSLER-AMES", "ELECTRIC", "#8a3a2a", "#f0e8d0"],
    ["FIZZO COLA", "BOTTLING CO.", "#a01418", "#fff"],
    ["HI-OCTANE HARRY'S", "FUEL OIL", "#c86a20", "#fff"],
  ];
  CONT.forEach((cc, i) =>
    R("container_" + i, 256, 96, (c, w, h, r) => {
      c.fillStyle = cc[2];
      c.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 8) {
        c.fillStyle = "rgba(0,0,0,0.18)";
        c.fillRect(x, 0, 3, h);
        c.fillStyle = "rgba(255,255,255,0.08)";
        c.fillRect(x + 4, 0, 2, h);
      }
      txt(c, cc[0], w / 2, 34, 30, cc[3], { maxW: w - 16 });
      txt(c, cc[1], w / 2, 66, 20, cc[3], { maxW: w - 16 });
      weather(c, w, h, r, 1);
    }),
  );
  X.CONTAINER_LIVERIES = CONT.length;

  // ---------- US Army vehicle markings & old-world checkpoint signs (26_ruins.js) ----------
  const OLIVE = "#4a5236";
  R("army_star", 128, 128, (c, w, h, r) => {
    c.fillStyle = OLIVE;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#dcd6c0";
    c.lineWidth = 7;
    c.beginPath();
    c.arc(w / 2, h / 2, 54, 0, X.TAU);
    c.stroke();
    c.fillStyle = "#dcd6c0";
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5,
        rr = i % 2 ? 19 : 48;
      c.lineTo(w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr);
    }
    c.closePath();
    c.fill();
    weather(c, w, h, r, 1.1);
  });
  R("army_door", 256, 64, (c, w, h, r) => {
    c.fillStyle = OLIVE;
    c.fillRect(0, 0, w, h);
    stencil(c, "U.S. ARMY", w / 2, 24, 30, "#dcd6c0");
    stencil(c, "4A-19671  2ND ID", w / 2, 50, 15, "#c8c2aa");
    weather(c, w, h, r, 1.1);
  });
  R("quarantine", 256, 160, (c, w, h, r) => {
    c.fillStyle = "#e4dcc4";
    c.fillRect(0, 0, w, h);
    for (let x = -h; x < w; x += 28) {
      c.fillStyle = "#d8a818";
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x + 14, 0);
      c.lineTo(x + 14 + 22, 22);
      c.lineTo(x + 22, 22);
      c.fill();
      c.fillStyle = "#1a1a18";
      c.beginPath();
      c.moveTo(x + 14, 0);
      c.lineTo(x + 28, 0);
      c.lineTo(x + 50, 22);
      c.lineTo(x + 36, 22);
      c.fill();
    }
    c.fillStyle = "#1a1a18";
    c.fillRect(0, 22, w, 3);
    c.fillRect(0, h - 25, w, 3);
    txt(c, "QUARANTINE ZONE", w / 2, 50, 30, "#a01a14", { maxW: 236 });
    txt(c, "AUTHORIZED PERSONNEL ONLY", w / 2, 80, 15, "#1a1a18", {
      maxW: 236,
    });
    txt(c, "Violators will be shot", w / 2, 102, 15, "#1a1a18", {
      font: F_SERIF,
      weight: "normal",
    });
    txt(c, "BY ORDER OF THE U.S. ARMY — MAR. 1967", w / 2, 124, 10, "#3a3a36", {
      maxW: 236,
    });
    for (let x = -h; x < w; x += 28) {
      c.fillStyle = "#d8a818";
      c.fillRect(x + 40, h - 22, 14, 22);
    }
    weather(c, w, h, r, 1.2);
  });
  R("evac_route", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#1d4f8a";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#e8e4d8";
    c.lineWidth = 4;
    c.strokeRect(6, 6, w - 12, h - 12);
    txt(c, "EVACUATION", w / 2, 28, 18, "#e8e4d8", { maxW: 108 });
    txt(c, "ROUTE", w / 2, 50, 20, "#e8e4d8");
    c.fillStyle = "#e8e4d8";
    c.beginPath();
    c.moveTo(24, 82);
    c.lineTo(78, 82);
    c.lineTo(78, 68);
    c.lineTo(106, 92);
    c.lineTo(78, 116);
    c.lineTo(78, 102);
    c.lineTo(24, 102);
    c.closePath();
    c.fill();
    weather(c, w, h, r, 1.2);
  });
  // US Army checkpoint board over the guard booth (28_military.js)
  R("checkpoint_sign", 256, 128, (c, w, h, r) => {
    c.fillStyle = "#e8e2cc";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#a01a14";
    c.fillRect(0, 0, w, 40);
    txt(c, "HALT", w / 2, 22, 30, "#f4eee0");
    txt(c, "U.S. ARMY CHECKPOINT", w / 2, 60, 20, "#1a1a18", { maxW: 236 });
    txt(c, "ALL VEHICLES STOP FOR INSPECTION", w / 2, 84, 12, "#1a1a18", {
      maxW: 236,
    });
    txt(c, "Present evacuation papers", w / 2, 104, 12, "#3a3a36", {
      font: F_SERIF,
      weight: "normal",
    });
    c.strokeStyle = "#1a1a18";
    c.lineWidth = 4;
    c.strokeRect(2, 2, w - 4, h - 4);
    weather(c, w, h, r, 1.3);
  });
  // hand-painted scavenger signs on salvaged planks
  const SCAV = [
    ["KEEP OUT", "#b01a14"],
    ["WATER 5 SCRIP", "#e8e0c8"],
    ["TRADE", "#e8c040"],
    ["DANGER RAIDERS", "#b01a14"],
    ["NO MANIACS", "#e8e0c8"],
    ["FRIENDLY", "#6ab04a"],
  ];
  SCAV.forEach((sc, i) =>
    R("scav_sign_" + i, 256, 80, (c, w, h, r) => {
      const planks = 3;
      for (let p = 0; p < planks; p++) {
        const t = (70 + r() * 40) | 0;
        c.fillStyle =
          "rgb(" + t + "," + ((t * 0.78) | 0) + "," + ((t * 0.55) | 0) + ")";
        c.fillRect(0, (p * h) / planks, w, h / planks - 2);
        c.strokeStyle = "rgba(20,12,4,0.35)";
        c.lineWidth = 1;
        for (let g = 0; g < 6; g++) {
          const y = (p * h) / planks + r() * (h / planks);
          c.beginPath();
          c.moveTo(0, y);
          c.bezierCurveTo(
            w * 0.3,
            y + r() * 4 - 2,
            w * 0.7,
            y + r() * 4 - 2,
            w,
            y,
          );
          c.stroke();
        }
        c.fillStyle = "#2a2a26";
        c.fillRect(8, (p * h) / planks + 10, 4, 4);
        c.fillRect(w - 12, (p * h) / planks + 10, 4, 4);
      }
      c.save();
      c.translate(w / 2, h / 2);
      c.rotate((r() - 0.5) * 0.08);
      txt(c, sc[0], 0, 2, 38, sc[1], {
        font: F_SCRIPT,
        weight: "bold",
        maxW: 230,
        stroke: "rgba(0,0,0,0.3)",
      });
      c.restore();
      // drips of paint under the letters
      c.fillStyle = sc[1];
      for (let d = 0; d < 7; d++) {
        c.globalAlpha = 0.7;
        c.fillRect(30 + r() * 196, 52, 2, 6 + r() * 14);
      }
      c.globalAlpha = 1;
      weather(c, w, h, r, 0.9);
    }),
  );
  X.SCAV_SIGNS = SCAV.length;

  // ---------- Hi-Octane Harry's filling station (29_filling_station.js) ----------
  /** The Hi-Octane Harry's mark: a spoked wheel with swept wings either side and a bold H on its hub. s = wheel radius. */
