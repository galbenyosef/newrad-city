// play-inline-192 07 — cyl
// Lines 1983-2134 of readable/play-inline-192.pretty.js (statement-aligned).
  function drumKit(b, x, y, z) {
    b.cyl("paint_white", x, y + 0.36, z - 0.25, 0.36, 0.36, 0.34, 14, {
      tint: [0.8, 0.15, 0.12],
      bottom: true,
    }); // (bass drum as a vertical short drum, reads fine)
    b.cyl("chrome", x + 0.45, y + 0.55, z + 0.1, 0.2, 0.2, 0.15, 12, {
      bottom: true,
    }); // snare
    b.cyl("chrome", x + 0.45, y, z + 0.1, 0.02, 0.02, 0.55, 5);
    b.cyl("paint_white", x - 0.1, y + 0.78, z - 0.1, 0.16, 0.16, 0.18, 12, {
      tint: [0.8, 0.15, 0.12],
      bottom: true,
    }); // rack tom
    b.cyl("paint_white", x - 0.55, y, z + 0.1, 0.22, 0.22, 0.45, 12, {
      tint: [0.8, 0.15, 0.12],
    }); // floor tom
    for (const [cx, cz, h] of [
      [x + 0.7, z - 0.35, 1.25],
      [x - 0.6, z - 0.45, 1.35],
      [x + 0.75, z + 0.35, 0.95],
    ]) {
      b.cyl("chrome", cx, y, cz, 0.018, 0.018, h, 5);
      b.cyl("brass", cx, y + h, cz, 0.28, 0.02, 0.03, 14, {
        bottom: true,
        tint: [0.9, 0.7, 0.3],
      });
    }
    b.col(x - 0.8, y, z - 0.6, x + 0.9, y + 0.9, z + 0.4, {
      tag: "instrument",
      walkable: false,
    });
  }
  function piano(b, x, y, z) {
    b.boxMM("paint_black", x - 0.75, y, z - 0.35, x + 0.75, y + 1.3, z + 0.1, {
      tint: [0.14, 0.1, 0.08],
    });
    b.boxMM(
      "paint_black",
      x - 0.75,
      y + 0.68,
      z + 0.1,
      x + 0.75,
      y + 0.74,
      z + 0.4,
      { tint: [0.14, 0.1, 0.08] },
    );
    b.boxMM(
      "ceramic",
      x - 0.7,
      y + 0.74,
      z + 0.12,
      x + 0.7,
      y + 0.77,
      z + 0.34,
      { tint: [0.92, 0.9, 0.84] },
    );
    for (let k = 0; k < 20; k++)
      b.boxMM(
        "paint_black",
        x - 0.68 + k * 0.07,
        y + 0.77,
        z + 0.12,
        x - 0.64 + k * 0.07,
        y + 0.8,
        z + 0.25,
        {},
      );
    b.box("wood_dark", x, y, z + 0.8, 0.6, 0.48, 0.35, {}); // bench
    b.col(x - 0.75, y, z - 0.35, x + 0.75, y + 1.3, z + 0.4, {
      tag: "instrument",
      walkable: false,
    });
  }
  function bass(b, x, y, z) {
    b.geo("wood", K.sphereGeo(), {
      x,
      y: y + 0.55,
      z,
      sx: 0.32,
      sy: 0.5,
      sz: 0.14,
      tint: [0.6, 0.32, 0.16],
    });
    b.geo("wood", K.sphereGeo(), {
      x,
      y: y + 0.95,
      z,
      sx: 0.24,
      sy: 0.3,
      sz: 0.13,
      tint: [0.6, 0.32, 0.16],
    });
    b.beam(
      "paint_black",
      x,
      y + 1.0,
      z + 0.1,
      x,
      y + 1.85,
      z + 0.05,
      0.05,
      0.04,
    );
    b.cyl("paint_black", x, y + 1.85, z + 0.05, 0.03, 0.02, 0.15, 5);
    b.cyl("chrome", x, y, z, 0.01, 0.01, 0.1, 4);
  }

  function termOffice() {
    return {
      title: "VILLAGE VANGUARD — MANAGEMENT",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-Booking & Payroll-",
      entries: [
        {
          title: "Booking Calendar — Mar. 1967",
          text: 'Mon — Trio (house)\nTue — Trio (house)\nFri — "LAST SET BEFORE THE END OF THE WORLD" (promoter\'s title, not mine. Sells tickets though.)\nSat — Big band night. 16 players, 1 stage. Pray.\nSun — ',
        },
        {
          title: "Memo: The Robots",
          text: 'Bought three used Ardent Robotics Valet units from a bankrupt hotel. Programmed them to TIDY UP between sets.\n\nThey have learned to play. I did not teach them. Nobody taught them. The drummer one keeps time better than any human I have ever paid.\n\nI am not paying the robots. Legal says I "should probably start."',
        },
        {
          title: "1989 — Mags's Notes",
          learn: LK.reserve.id,
          text: () => {
            K.learn(LK.reserve.id);
            return "Takings this week: 311 scrip, 2 bottles of Fizzo Blue, a working toaster.\nThe Trio has played every night for twenty-two years. Sir Hi-Hat says they will stop \"when the audience stops.\" The audience has never stopped.\nKitchen: still no meat worth serving. Katz's had a family brine ledger — the real pastrami recipe. Basement office. Roaches. Big ones.\nReserve chest in the cellar: 0-5-2-9. Mama's birthday. If a bottle's missing I WILL know.";
          },
        },
        {
          title: "Club Safe — Combination",
          learn: LK.safe.id,
          text: () => {
            K.learn(LK.safe.id);
            return "Office safe: 1-9-3-5, the year Max opened the room. Payroll Fridays only.";
          },
        },
        {
          title: "Open Club Safe",
          text: "The safe clicks open.",
          action: () => {
            PV.unlockTagged("vanguard", "safe");
            K.notify("The club safe is unlocked.");
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA
  // ==================================================================
