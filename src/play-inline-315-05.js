// play-inline-315 05 — tint
// Lines 832-3325 of readable/play-inline-315.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "ny_int",
      off: O,
      lit: true,
      amb: [0.1, 0.092, 0.08],
      floors: [0, MY],
      grime: 0.45,
    });
    const r = K.rng("ny_int");
    ctx.dyn = {};
    const cream = [0.86, 0.8, 0.66];

    // ------------------------------------------------------------------
    // LOBBY
    // ------------------------------------------------------------------
    const LB = [-16.1, -0.3, -24.1, 16.1, LH + 0.2, 0.1];
    K.gap(ctx, 0, -24, 3.2, MY, 3.2); // mezzanine → ballroom
    K.gap(ctx, -16, -3, 1.4, 0, 2.4); // lobby → staff room
    K.room(b, ctx, {
      x0: -16,
      z0: -24,
      x1: 16,
      z1: 0,
      y: 0,
      h: LH,
      floor: "marble",
      fc: [0.86, 0.8, 0.72],
      wall: "plaster",
      wc: cream,
      wain: "deco_wall",
      wainC: [0.95, 0.85, 0.8],
      wainH: 2.6,
      ceil: "plaster",
      cc: [0.8, 0.74, 0.6],
      cornice: true,
      corniceMat: "brass",
      trimMat: "bronze",
    });
    coffers(b, -16, -24, 16, 0, LH, 4, "gold", [0.75, 0.6, 0.35]);
    // floor inlay + terrazzo border
    b.hplate("decal", 0, 0.012, -4.5, 6, 6, 0, inlayCell());
    for (const z of [-0.6, -23.4])
      b.hplate("flat", 0, 0.008, z, 31.6, 0.5, 0, null, {
        tint: [0.35, 0.2, 0.14],
      });
    // entrance: bronze & glass doors on the south wall (the way out)
    for (const dx of [-1.9, 0, 1.9]) {
      b.boxMM("bronze", dx - 0.85, 0, -0.16, dx + 0.85, 3.4, -0.1, {
        tint: [0.5, 0.36, 0.2],
      });
      b.plate("glass_dark", dx, 1.9, -0.17, 0, -1, 1.2, 2.4, null, {
        tint: [0.35, 0.38, 0.36],
      });
      b.light(dx, 2, -0.8, [0.55, 0.62, 0.5], 0.35, 5, { box: LB });
    }
    b.plate("art", 0, 5.3, -0.12, 0, -1, 5.6, 2.6, NY.sunburstCell(), {
      tint: [0.8, 0.7, 0.5],
    });
    // deco columns
    for (const cx of [-10, 10])
      for (const cz of [-6, -15]) {
        b.boxMM("deco_wall", cx - 0.6, 0, cz - 0.6, cx + 0.6, LH, cz + 0.6, {
          tint: [0.9, 0.8, 0.75],
        });
        b.boxMM("bronze", cx - 0.7, 0, cz - 0.7, cx + 0.7, 0.3, cz + 0.7, {
          tint: [0.5, 0.36, 0.2],
        });
        for (let k = 0; k < 3; k++)
          b.boxMM(
            "brass",
            cx - 0.7 - k * 0.12,
            LH - 1.2 + k * 0.35,
            cz - 0.7 - k * 0.12,
            cx + 0.7 + k * 0.12,
            LH - 1.05 + k * 0.35,
            cz + 0.7 + k * 0.12,
            { tint: [0.7, 0.55, 0.3] },
          );
        b.col(cx - 0.6, 0, cz - 0.6, cx + 0.6, LH, cz + 0.6, {});
      }
    // FRONT DESK (west): marble counter with bronze band, key cubbies behind
    b.boxMM("marble", -13.4, 0, -19, -12.2, 1.1, -7, {
      tint: [0.75, 0.62, 0.55],
    });
    b.boxMM("bronze", -12.22, 0.2, -19, -12.16, 0.35, -7, {
      tint: [0.6, 0.45, 0.25],
    });
    b.boxMM("marble", -13.5, 1.1, -19.1, -12.1, 1.18, -6.9, {
      tint: [0.35, 0.3, 0.3],
    });
    b.col(-13.5, 0, -19.1, -12.1, 1.18, -6.9, { tag: "counter" });
    b.plate(
      "art",
      -12.15,
      0.72,
      -13,
      1,
      0,
      4.5,
      0.5,
      K.signCell("ny_reception", "R E C E P T I O N", 512, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
        font: "Georgia, serif",
      }),
    );
    // key wall: wooden cubbies with brass keys
    b.boxMM("wood_dark", -15.9, 1.3, -18, -15.5, 3.6, -8, {
      tint: [0.5, 0.32, 0.2],
    });
    for (let j = 0; j < 7; j++)
      for (let i = 0; i < 24; i++) {
        const zz = -17.8 + i * 0.4,
          yy = 1.4 + j * 0.3;
        b.boxMM("paint_black", -15.51, yy, zz, -15.49, yy + 0.24, zz + 0.34, {
          tint: [0.08, 0.06, 0.05],
        });
        if (r() < 0.55) {
          b.box("brass", -15.46, yy + 0.05, zz + 0.17, 0.04, 0.14, 0.03, {
            tint: [0.8, 0.65, 0.35],
          });
        }
      }
    b.plate(
      "art",
      -15.45,
      4.3,
      -13,
      1,
      0,
      1.2,
      1.2,
      K.paint("art", "ny_clock", 128, 128, (x, X, Y, W, H) => {
        x.fillStyle = "#e8dcc0";
        x.beginPath();
        x.arc(X + W / 2, Y + H / 2, W * 0.46, 0, 6.3);
        x.fill();
        x.strokeStyle = "#2a1a0c";
        x.lineWidth = 5;
        x.stroke();
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(X + W / 2, Y + H / 2);
        x.lineTo(X + W / 2 + 18, Y + H / 2 - 30);
        x.moveTo(X + W / 2, Y + H / 2);
        x.lineTo(X + W / 2 - 26, Y + H / 2 + 8);
        x.stroke();
        for (let k = 0; k < 12; k++) {
          const a = (k * PI) / 6;
          x.fillStyle = "#2a1a0c";
          x.fillRect(
            X + W / 2 + Math.cos(a) * 50 - 2,
            Y + H / 2 + Math.sin(a) * 50 - 2,
            4,
            4,
          );
        }
      }),
      {},
    );
    b.cyl("brass", -12.8, 1.18, -9, 0.07, 0.09, 0.08, 10); // desk bell
    K.terminal(
      ctx,
      "ph_ny_term_desk",
      -12.85,
      1.18,
      -14.2,
      -HP,
      termDesk(),
      "bare",
    );
    K.skel(ctx, -14.4, 0, -12.5, HP, "seated");
    b.box("wood_dark", -14.4, 0, -12.5, 0.5, 0.45, 0.5, {}); // stool under him
    // lamps on the desk
    for (const z of [-17.5, -8.5]) {
      b.cyl("bronze", -12.8, 1.18, z, 0.1, 0.06, 0.4, 8);
      b.cyl("glass", -12.8, 1.58, z, 0.12, 0.2, 0.22, 10, {
        tint: [0.9, 0.8, 0.55],
      });
      b.light(-12.8, 1.7, z, [1, 0.75, 0.45], 0.8, 4.5, { box: LB });
      b.glow(-12.8, 1.7, z, [0.8, 0.55, 0.3], 0.9);
    }
    // ELEVATOR BANK (east wall)
    const elevLabel = K.signCell("ny_elev_3", "CAR 3 · 33", 128, 64, {
      bg: "#1c140c",
      fg: "#d8b060",
      font: "Georgia, serif",
    });
    for (const [z, open] of [
      [-20, false],
      [-15, true],
      [-10, false],
      [-5, false],
    ])
      elevatorDoor(b, 15.9, 0, z, -1, 0, open, z === -10 ? elevLabel : null);
    b.plate(
      "art",
      15.88,
      4.4,
      -12.5,
      -1,
      0,
      4.0,
      0.5,
      K.signCell("ny_elev_sign", "ELEVATORS", 512, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
        font: "Georgia, serif",
      }),
    );
    b.light(14.6, 3.6, -10, [1, 0.25, 0.15], 0.6, 4, { box: LB });
    b.glow(15.6, 3.35, -10, [1, 0.2, 0.1], 0.6); // car 3 red call light
    // grand staircase to the mezzanine (x −4.5..4.5, rising north)
    K.stairs(b, -4.5, -21, 4.5, -8.6, 0, MY, "-z", {
      mat: "marble",
      tint: [0.8, 0.74, 0.66],
      rail: "both",
      railMat: "bronze",
      handMat: "brass",
    });
    {
      // red carpet runner on the stair
      const n = Math.ceil(MY / 0.24),
        run = 12.4 / n;
      for (let i = 0; i < n; i++) {
        const top = (MY * (i + 1)) / n,
          z1 = -8.6 - run * i;
        b.boxMM(
          "carpet",
          -2.2,
          top - MY / n,
          z1 - run,
          2.2,
          top + 0.015,
          z1 + 0.012,
          { tint: [0.9, 0.5, 0.45], grime: 0.3, faces: "st" },
        );
      }
    }
    // newel lamps
    for (const x of [-4.4, 4.4]) {
      b.cyl("bronze", x, 0, -8.4, 0.18, 0.14, 1.4, 10, {
        tint: [0.5, 0.36, 0.2],
      });
      b.geo("lamp", K.sphereGeo(), {
        x,
        y: 1.6,
        z: -8.4,
        s: 0.2,
        tint: [1, 0.85, 0.6],
      });
      b.light(x, 1.8, -8.2, [1, 0.8, 0.55], 0.6, 5, { box: LB });
      b.glow(x, 1.6, -8.4, [0.8, 0.6, 0.35], 1.1);
    }
    // MEZZANINE gallery
    b.boxMM("marble", -16, MY - 0.35, -24, 16, MY, -21, {
      tint: [0.78, 0.72, 0.64],
      faces: "nsewtb",
    });
    b.col(-16, MY - 0.35, -24, 16, MY, -21, { tag: "floor" });
    for (let x = -15.5; x < 16; x += 1.2)
      b.boxMM("brass", x, MY - 0.55, -21.05, x + 0.9, MY - 0.4, -20.95, {
        tint: [0.6, 0.45, 0.25],
      }); // fascia fret
    K.railing(b, -16, -21, -4.5, -21, MY, {
      h: 1.05,
      mat: "bronze",
      handMat: "brass",
    });
    K.railing(b, 4.5, -21, 16, -21, MY, {
      h: 1.05,
      mat: "bronze",
      handMat: "brass",
    });
    b.hplate("carpet", 0, MY + 0.01, -22.5, 31.6, 2.8, 0, null, {
      tint: [0.8, 0.45, 0.4],
    });
    b.plate(
      "art",
      0,
      MY + 3.7,
      -23.88,
      0,
      1,
      5.2,
      0.55,
      K.signCell("ny_ballroom_sign", "GRAND BALLROOM", 512, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
        font: "Georgia, serif",
      }),
    );
    b.light(0, MY + 2.4, -22.5, [1, 0.7, 0.45], 0.5, 7, { box: LB });
    // lobby lounge: sofas, armchairs, palms, luggage
    K.sofa(b, 8, 0, -1.4, 3.0, 0, { mat: "velvet", tint: [0.5, 0.22, 0.2] });
    armchair(b, 5.6, 0, -5.2, -HP);
    armchair(b, 10.4, 0, -5.4, HP + 0.3);
    K.table(b, 8, 0, -5.3, 1.4, 0.7, { mat: "mahogany", h: 0.45 });
    K.sofa(b, -8, 0, -1.4, 3.0, 0, { mat: "velvet", tint: [0.5, 0.22, 0.2] });
    armchair(b, -5.6, 0, -5.4, HP, [0.3, 0.3, 0.4]);
    K.skel(ctx, -8.3, 0.45, -1.6, 0, "seated");
    K.note(ctx, "ph_ny_note_complaint", -7.4, 0.47, -1.5, {
      name: "Guest Complaint (Room 3324)",
      title: "Letter to the Management — Hotel New Yorker",
      text: 'To the Management,\n\nI have now stayed at your fine hotel for eleven nights and must register three complaints.\n\n1. Pigeons. There are pigeons in the corridor of the 33rd floor. There are pigeons in the ICE MACHINE.\n2. My hair stands on end every evening at nine o\'clock precisely. So does my wife\'s. So does the cat\'s, and the cat is bald.\n3. The "Tesla Suite" next door is supposedly a museum exhibit and closed to guests. Then who is humming? Who is feeding the pigeons? Why does my radio play only one note?\n\nYour bellhop, a Mr. Pembroke, told me "not to worry about the gentleman in 3327." The gentleman in 3327 has been dead since 1943.\n\nP.S. The Foundation men shout "PIGEON POST" at the robot by the 33rd-floor teletype and it lets them by. I have tried it. It does not let ME by.\n\nRespectfully,\nH. Voorhees, Room 3324\n\n(stamped: RECEIVED — MAR 4 1967 — NO ACTION)',
      learn: "ph_ny_term_security",
    });
    deadPalm(b, -14.5, 0, -1.4, r);
    deadPalm(b, 14.5, 0, -1.4, r);
    deadPalm(b, -14.5, 0, -22.5, r);
    deadPalm(b, 14.5, 0, -22.5, r);
    luggageCart(b, 3.2, 0, -2.2, 0.4, r, false);
    luggageCart(b, -6.5, 0, -18.5, 1.2, r, true);
    for (let k = 0; k < 5; k++)
      b.box("leather", -6 + r() * 2.5, 0, -19.5 + r() * 2, 0.6, 0.3, 0.45, {
        yaw: r() * 3,
        tint: r.pick([
          [0.5, 0.3, 0.2],
          [0.3, 0.3, 0.35],
        ]),
      });
    // bell captain's podium with the lockbox
    b.boxMM("mahogany", 11.6, 0, -1.6, 12.6, 1.2, -0.9, {});
    b.col(11.6, 0, -1.6, 12.6, 1.2, -0.9, {});
    b.plate(
      "art",
      12.1,
      1.35,
      -1.62,
      0,
      -1,
      0.9,
      0.22,
      K.signCell("ny_bellcap", "BELL CAPTAIN", 256, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
      }),
    );
    K.loot(ctx, "safe", 13.2, 0, -1.3, 0, {
      name: "Bell Captain's Lockbox",
      locked: 0,
      lock: PH.LOCKS.ny_lockbox,
      items: [
        ["ph_ny_elev_key", 1],
        ["scrip", 35],
        ["scrap_metal", 3],
      ],
    });
    // Patrolman bellhop pod (empty — its occupant wandered off)
    b.cyl("metal_dark", 14.2, 0, -21, 0.9, 0.9, 0.2, 14, {
      tint: [0.3, 0.32, 0.34],
    });
    b.cyl("glass_clear", 14.2, 0.2, -21, 0.85, 0.85, 2.6, 14, {
      top: false,
      tint: [0.7, 0.8, 0.8],
    });
    b.cyl("metal_dark", 14.2, 2.8, -21, 0.95, 0.7, 0.35, 14, {
      tint: [0.3, 0.32, 0.34],
    });
    b.plate(
      "art",
      14.2,
      3.4,
      -20.1,
      0,
      1,
      1.3,
      0.3,
      K.signCell("ny_pod", "MERIDIAN BELLHOP", 256, 64, {
        bg: "#10202a",
        fg: "#80d0ff",
        font: "Arial, sans-serif",
      }),
    );
    b.light(14.2, 2.5, -21, [0.3, 0.6, 1.0], 0.5, 3.5, { box: LB });
    b.glow(14.2, 2.9, -21, [0.2, 0.45, 0.8], 1.2);
    b.col(13.3, 0, -21.9, 15.1, 3.1, -20.1, {});
    // newsstand
    b.boxMM("wood_dark", -3.2, 0, -1.4, -1.8, 1.1, -0.4, {
      tint: [0.5, 0.34, 0.2],
    });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "flat",
        -2.5 + (r() - 0.5) * 1,
        1.11 + k * 0.004,
        -0.9 + (r() - 0.5) * 0.5,
        0.35,
        0.45,
        r() * 0.6,
        null,
        { tint: [0.8, 0.78, 0.7] },
      );
    b.plate(
      "art",
      -2.5,
      1.5,
      -1.42,
      0,
      -1,
      1.2,
      0.35,
      K.signCell(
        "ny_news",
        'THE FIRST JOURNAL — "REDS DENY EVERYTHING"',
        512,
        96,
        { bg: "#e8e0cc", fg: "#1a1a1a", font: "Georgia, serif" },
      ),
    );
    b.col(-3.2, 0, -1.4, -1.8, 1.1, -0.4, {});
    // chandeliers (one dead) + wall sconces
    chandelier(b, -8, 6.2, -12, 1.0, LH, [1, 0.78, 0.5], 1.2, 12, LB, false);
    chandelier(b, 8, 6.2, -12, 1.0, LH, [1, 0.78, 0.5], 0, 0, LB, true);
    chandelier(b, 0, 6.6, -3.5, 0.8, LH, [1, 0.8, 0.55], 1.0, 10, LB, false);
    for (const z of [-4, -20])
      for (const [x, nx] of [
        [-15.85, 1],
        [15.85, -1],
      ]) {
        b.cyl("brass", x + nx * 0.1, 3.4, z, 0.12, 0.2, 0.4, 8, {
          tint: [0.7, 0.55, 0.3],
        });
        b.light(x + nx * 0.4, 3.6, z, [1, 0.7, 0.4], 0.5, 4, { box: LB });
        b.glow(x + nx * 0.15, 3.7, z, [0.8, 0.55, 0.3], 0.8);
      }
    // debris
    K.litter(b, -15, -23, 15, -1, 0, 36, 3);
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -12 + r() * 24,
        0.014 + k * 0.0004,
        -22 + r() * 20,
        1 + r() * 1.5,
        1 + r() * 1.5,
        r() * 6,
        K.decal(k % 3 === 0 ? "puddle" : "grime", k + 3),
      );
    b.hplate("decal", 12.5, 0.016, -10, 2.2, 1.6, 0.3, K.decal("scorch", 2)); // laser scorch
    b.plate("decal", 15.88, 1.5, -12.5, -1, 0, 2.0, 1.2, K.decal("scorch", 4));
    b.plate(
      "decal",
      -15.88,
      3.2,
      -3.2,
      1,
      0,
      2.6,
      0.9,
      K.tag("33 = DEATH", "#e03a2a", 256, 96),
    );

    // ---- staff room / freight elevator (x −22..−16, z −6..0) ----
    const SB = [-22.1, -0.3, -6.1, -15.9, 3.3, 0.1];
    K.room(b, ctx, {
      x0: -22,
      z0: -6,
      x1: -16,
      z1: 0,
      y: 0,
      h: 3.0,
      floor: "concrete",
      fc: [0.6, 0.58, 0.54],
      wall: "plaster_stained",
      wc: [0.7, 0.68, 0.6],
      ceil: "concrete",
      cc: [0.5, 0.48, 0.45],
      trim: false,
    });
    b.boxMM("metal_dark", -21.95, 0, -4.2, -21.85, 2.8, -1.8, {
      tint: [0.4, 0.4, 0.38],
    }); // freight gate
    for (let k = 0; k < 8; k++)
      b.boxMM(
        "metal",
        -21.84,
        0.1,
        -4.1 + k * 0.3,
        -21.8,
        2.7,
        -4.05 + k * 0.3,
        { tint: [0.5, 0.5, 0.46] },
      );
    b.plate(
      "art",
      -21.82,
      3.0,
      -3,
      1,
      0,
      1.6,
      0.3,
      K.signCell("ny_freight", "FREIGHT — STAFF ONLY", 384, 64, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial, sans-serif",
      }),
    );
    K.lamp(b, -19, 2.6, -3, "cage", [1, 0.7, 0.4], 0.7, 5, {
      ceil: 3.0,
      lightOpts: { box: SB },
    });
    K.shelf(b, -19, 0, -5.7, 0, 3.4, {
      mat: "metal",
      items: ["box", "can", "box"],
      seed: 51,
    });
    K.loot(ctx, "locker", -16.6, 0, -5.2, HP, {
      loot: "locker",
      name: "Staff Locker",
    });
    K.note(ctx, "ph_ny_note_pembroke", -19.2, 1.02, -5.5, {
      name: "Bellhop Schedule",
      title: "Bellhop Roster — Night Shift, Mar. 4–9, 1967",
      text: "PEMBROKE, A. — Floors 30–35. Room service to 3327 at 9 PM sharp (seed, NOT crackers — see memo).\nDIAZ, R. — Ballroom setup, Shamrock Ball.\nKOWALSKI, T. — sick (radiation? he says sunburn).\n\nMEMO: Staff are reminded that the Tesla Suite is an EXHIBIT maintained by the Stanhope Foundation. Staff are NOT to enter, are NOT to feed the pigeons, and are NOT to ask about the humming. Pembroke, this means you.\n\nNIGHT CODES: front-desk teletype password MOONBALL. Bell captain's lockbox 1-9-3-0 (the year we opened). Stair B fire door keypad 3-3-0-0.",
      learn: ["ph_ny_term_desk", "ph_ny_lockbox", "ph_ny_stairs"],
    });

    // ------------------------------------------------------------------
    // GRAND BALLROOM (y 5.2)
    // ------------------------------------------------------------------
    const BB = [-16.1, MY - 0.3, -52.1, 16.1, MY + BH + 0.2, -23.9];
    K.gap(ctx, -16, -48, 1.4, MY, 2.4); // → service hall
    K.gap(ctx, 16, -33, 2.0, MY, 2.6); // → terrace bar
    K.room(b, ctx, {
      x0: -16,
      z0: -52,
      x1: 16,
      z1: -24,
      y: MY,
      h: BH,
      floor: "carpet",
      fc: [0.45, 0.4, 0.55],
      wall: "plaster",
      wc: [0.8, 0.74, 0.64],
      wain: "wood_dark",
      wainC: [0.5, 0.32, 0.22],
      wainH: 1.2,
      ceil: "plaster",
      cc: [0.78, 0.72, 0.62],
      cornice: true,
      corniceMat: "gold",
    });
    coffers(b, -16, -52, 16, -24, MY + BH, 4, "gold", [0.8, 0.62, 0.35]);
    // parquet dance floor
    b.boxMM("parquet", -8, MY, -42, 8, MY + 0.03, -28, {
      tint: [0.9, 0.8, 0.7],
      faces: "nsewt",
    });
    // pilasters + mirrors + side boxes
    for (let z = -48; z <= -28; z += 5)
      for (const [x, nx] of [
        [-15.9, 1],
        [15.9, -1],
      ]) {
        b.boxMM(
          "deco_wall",
          x - (nx < 0 ? 0.5 : 0),
          MY,
          z - 0.4,
          x + (nx > 0 ? 0.5 : 0),
          MY + BH,
          z + 0.4,
          { tint: [0.85, 0.8, 0.75] },
        );
        b.boxMM(
          "gold",
          x - (nx < 0 ? 0.6 : 0),
          MY + BH - 1.0,
          z - 0.5,
          x + (nx > 0 ? 0.6 : 0),
          MY + BH - 0.7,
          z + 0.5,
          { tint: [0.8, 0.6, 0.3] },
        );
      }
    for (let z = -45.5; z <= -30; z += 5)
      for (const [x, nx] of [
        [-15.88, 1],
        [15.88, -1],
      ]) {
        if (nx < 0 && Math.abs(z - -33) < 2) continue;
        b.plate("glass", x, MY + 2.9, z, nx, 0, 2.6, 3.2, null, {
          tint: [0.45, 0.48, 0.5],
          off: 0.02,
        });
        frameOnly(b, x, MY + 2.9, z, nx, 0, 2.6, 3.2, "gold", 0.12);
        // opera box above
        b.boxMM(
          "gold",
          x + (nx > 0 ? 0 : -1.4),
          MY + 4.8,
          z - 1.4,
          x + (nx > 0 ? 1.4 : 0),
          MY + 5.3,
          z + 1.4,
          { tint: [0.7, 0.55, 0.3] },
        );
        b.boxMM(
          "velvet",
          x + (nx > 0 ? 1.3 : -1.4),
          MY + 5.3,
          z - 1.4,
          x + (nx > 0 ? 1.4 : -1.3),
          MY + 6.2,
          z + 1.4,
          { tint: [0.6, 0.18, 0.15] },
        );
      }
    // stage (x −9..9, z −52..−45.5, top MY+1)
    const ST = MY + 1.0;
    b.boxMM("wood_dark", -9, MY, -52, 9, ST, -45.5, {
      tint: [0.45, 0.3, 0.2],
      faces: "nsewt",
    });
    b.col(-9, MY, -52, 9, ST, -45.5, { tag: "stage", surface: "wood" });
    for (let k = 0; k < 4; k++) {
      const top = MY + (k + 1) * 0.25;
      b.boxMM(
        "wood_dark",
        -2.5,
        MY,
        -45.5 + (3 - k) * 0.32,
        2.5,
        top,
        -45.5 + (4 - k) * 0.32,
        { tint: [0.45, 0.3, 0.2] },
      );
      b.col(
        -2.5,
        MY,
        -45.5 + (3 - k) * 0.32,
        2.5,
        top,
        -45.5 + (4 - k) * 0.32,
        { tag: "stairs", surface: "wood" },
      );
    }
    // proscenium + moon backdrop + curtains
    b.boxMM("gold", -9.6, MY, -45.7, -8.8, MY + BH - 0.5, -45.2, {
      tint: [0.7, 0.55, 0.3],
    });
    b.boxMM("gold", 8.8, MY, -45.7, 9.6, MY + BH - 0.5, -45.2, {
      tint: [0.7, 0.55, 0.3],
    });
    b.boxMM("gold", -9.6, MY + BH - 1.4, -45.7, 9.6, MY + BH - 0.5, -45.2, {
      tint: [0.7, 0.55, 0.3],
    });
    b.plate("art", 0, ST + 3.2, -51.88, 0, 1, 16, 6.2, moonBackdrop(), {
      tint: [1.1, 1.1, 1.1],
    });
    for (const sx of [-1, 1])
      for (let k = 0; k < 7; k++) {
        const x = sx * (8.6 - k * 0.32);
        b.box("velvet", x, ST, -46 - k * 0.05, 0.36, BH - 2.4, 0.2, {
          tint: [0.55, 0.12, 0.1],
        });
      }
    b.boxMM("velvet", -9, MY + BH - 2.2, -46.2, 9, MY + BH - 1.4, -45.9, {
      tint: [0.55, 0.12, 0.1],
    });
    // bandstand: piano, drums, bass, mic — and the band
    b.boxMM("paint_black", 3.5, ST, -50.5, 6.5, ST + 1.0, -49, {
      tint: [0.06, 0.05, 0.05],
    });
    b.quad(
      "paint_black",
      [3.5, ST + 1.0, -49],
      [6.5, ST + 1.0, -49],
      [6.5, ST + 2.0, -50.4],
      [3.5, ST + 2.0, -50.4],
      { tint: [0.06, 0.05, 0.05] },
    );
    b.boxMM("ceramic", 3.6, ST + 0.75, -49.05, 6.4, ST + 0.85, -48.8, {
      tint: [0.9, 0.88, 0.8],
    });
    b.col(3.5, ST, -50.5, 6.5, ST + 1.0, -48.8, {});
    for (const [dx, dz, rr2] of [
      [-4, -50, 0.35],
      [-3.3, -49.6, 0.25],
      [-4.6, -49.4, 0.22],
    ]) {
      b.cyl("paint_red", dx, ST, dz, rr2, rr2, 0.4, 12, {
        tint: [0.6, 0.12, 0.1],
      });
      b.cyl("ceramic", dx, ST + 0.4, dz, rr2, rr2, 0.01, 12);
    }
    b.cyl("brass", -3.7, ST + 0.9, -50.2, 0.3, 0.3, 0.01, 12);
    b.pipe("chrome", -3.7, ST, -50.2, -3.7, ST + 0.9, -50.2, 0.01, 4);
    b.geo("wood", K.sphereGeo(), {
      x: -1.2,
      y: ST + 0.8,
      z: -50.3,
      sx: 0.35,
      sy: 0.6,
      sz: 0.2,
      tint: [0.55, 0.3, 0.15],
    });
    b.pipe("wood_dark", -1.2, ST + 1.2, -50.3, -1.2, ST + 2.0, -50.3, 0.03, 4);
    b.pipe("chrome", 0, ST, -46.8, 0, ST + 1.6, -46.8, 0.012, 4);
    b.geo("chrome", K.sphereGeo(), { x: 0, y: ST + 1.65, z: -46.8, s: 0.06 });
    K.skel(ctx, 5, ST, -48.2, PI, "seated");
    K.skel(ctx, -3.9, ST, -49.0, PI, "seated");
    K.skel(ctx, 0.5, ST, -47.2, 0.4, "lying");
    b.plate("pics", 0, MY + 5.6, -24.12, 0, -1, 22, 4.2, muralCell(), {
      tint: [1.05, 1.0, 0.95],
    });
    frameOnly(b, 0, MY + 5.6, -24.12, 0, -1, 22, 4.2, "gold", 0.2);
    b.light(0, MY + 5.0, -26.5, [1, 0.8, 0.5], 0.9, 10, { box: BB });
    b.plate(
      "art",
      0,
      MY + BH - 0.95,
      -45.1,
      0,
      1,
      12,
      0.8,
      K.signCell(
        "ny_hmb",
        "SHAMROCK BALL · MARCH 5, 1967 · DANCING TILL DAWN",
        1024,
        80,
        {
          bg: "#1c1030",
          fg: "#f0d890",
          font: "Georgia, serif",
          border: "#c8a050",
        },
      ),
    );
    // stage footlights
    for (let x = -8; x <= 8; x += 1)
      b.glow(x, ST + 0.08, -45.7, [0.6, 0.45, 0.25], r() < 0.3 ? 0.2 : 0.5);
    b.light(0, ST + 1.5, -47, [0.5, 0.45, 0.9], 1.2, 9, { box: BB });
    b.light(0, ST + 4, -50, [0.9, 0.75, 0.45], 0.8, 8, { box: BB });
    b.light(0, ST + 3.5, -47, [0.75, 0.75, 1.0], 1.3, 9, { box: BB });
    // banquet tables around the dance floor
    for (const x of [-12.2, 12.2])
      for (let z = -43; z <= -28; z += 5) {
        if (x > 0 && Math.abs(z - -33) < 2.5) continue;
        banquetTable(b, x, MY, z, 0.9, r);
        b.glow(x, MY + 1.1, z, [0.8, 0.5, 0.25], 0.45);
        b.light(x, MY + 1.2, z, [1, 0.6, 0.3], 0.35, 3, { box: BB });
      }
    for (const [x, z] of [
      [-4.5, -26],
      [4.5, -26],
    ])
      banquetTable(b, x, MY, z, 0.8, r);
    // chandeliers: two up, one crashed onto the dance floor
    chandelier(
      b,
      0,
      MY + 6.0,
      -30,
      1.5,
      MY + BH,
      [0.95, 0.8, 0.55],
      1.1,
      14,
      BB,
      false,
    );
    chandelier(
      b,
      0,
      MY + 6.0,
      -44,
      1.5,
      MY + BH,
      [0.95, 0.8, 0.55],
      0,
      0,
      BB,
      true,
    );
    fallenChandelier(b, 1.2, MY + 0.03, -37, 1.5, r);
    b.pipe("brass", 0, MY + 4.5, -37, 0, MY + BH, -37, 0.02, 4); // snapped chain
    b.light(0, MY + 6, -37, [0.45, 0.5, 0.9], 0.5, 12, { box: BB }); // cold "moonlight" fill
    // the last dance: a couple on the floor, and a waiter
    K.skel(ctx, -3.2, MY + 0.03, -35.5, 0.6, "lying");
    K.skel(ctx, -2.6, MY + 0.03, -35.1, 3.7, "lying");
    K.skel(ctx, 6.5, MY, -41, 2.4, "reaching");
    K.note(ctx, "ph_ny_note_dancecard", -3.0, MY + 0.05, -34.4, {
      name: "Dance Card (Shamrock Ball)",
      title: 'Dance card — "Miss D. Ferraro"',
      text: "1. Foxtrot — Tommy\n2. Waltz — Tommy\n3. Lindy — Tommy (he insists)\n4. Rumba — Mr. Pembroke (the bellhop!! he's cute)\n5. Slow dance — ???\n\n(scrawled across the bottom in a shaking hand:)\nThey told us to stay put. Tommy says the band will play till the all-clear. The band is still playing. There is no all-clear. Tommy won't let go and I don't want him to. Last dance, then.",
    });
    for (let k = 0; k < 10; k++)
      b.hplate(
        "decal",
        -14 + r() * 28,
        MY + 0.035 + k * 0.0004,
        -50 + r() * 24,
        1 + r() * 1.4,
        1 + r() * 1.4,
        r() * 6,
        K.decal(k % 4 === 0 ? "scorch" : "grime", k + 11),
      );
    K.litter(b, -15, -45, 15, -25, MY, 30, 9);
    K.loot(ctx, "cash_register", 14.3, MY + 1.1, -46.6, PI, {
      loot: "cash_register",
      name: "Coat Check Till",
    });
    b.boxMM("mahogany", 12.8, MY, -50, 15.9, MY + 1.1, -46, {
      tint: [0.5, 0.3, 0.2],
    });
    b.col(12.8, MY, -50, 15.9, MY + 1.1, -46, {});
    b.plate(
      "art",
      14.3,
      MY + 2.4,
      -50.1,
      0,
      1,
      1.8,
      0.35,
      K.signCell("ny_coat", "COAT CHECK", 256, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
      }),
    );
    for (let k = 0; k < 8; k++)
      b.box("fabric", 13.2 + (k % 4) * 0.7, MY + 1.2, -50.8, 0.5, 1.3, 0.25, {
        tint: r.pick([
          [0.2, 0.2, 0.25],
          [0.4, 0.3, 0.25],
          [0.5, 0.2, 0.2],
        ]),
      });

    // ---- service hall (x −28..−16, z −50..−46) + stair landing (x −32..−28) ----
    const SH = [-32.1, MY - 0.3, -52.1, -15.9, MY + 3.4, -43.9];
    K.gap(ctx, -28, -48, 1.6, MY, 2.4);
    K.room(b, ctx, {
      x0: -28,
      z0: -50,
      x1: -16,
      z1: -46,
      y: MY,
      h: 3.0,
      floor: "checker",
      fc: [0.6, 0.58, 0.54],
      wall: "subway_tile",
      wc: [0.8, 0.8, 0.74],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.45],
    });
    K.room(b, ctx, {
      x0: -32,
      z0: -52,
      x1: -28,
      z1: -44,
      y: MY,
      h: 3.2,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "concrete",
      wc: [0.6, 0.58, 0.54],
      ceil: "concrete",
      cc: [0.4, 0.38, 0.36],
      trim: false,
    });
    // decorative stair flights in the shaft (up into darkness, down into rubble)
    K.stairs(b, -31.8, -51.8, -30.2, -46.8, MY, MY + 1.9, "+z", {
      mat: "concrete",
      rail: "l",
      railMat: "rust",
      handMat: "rust",
      tint: [0.55, 0.53, 0.5],
    });
    K.rubble(b, -30.8, MY, -45.2, 1.1, 1.0, { seed: 12 });
    b.boxMM("metal_dark", -31.95, MY, -48.8, -31.85, MY + 2.3, -47.2, {
      tint: [0.35, 0.36, 0.3],
    }); // fire door
    b.plate(
      "art",
      -31.83,
      MY + 2.6,
      -48,
      1,
      0,
      1.2,
      0.3,
      K.signCell("ny_stair33", "STAIR B · FLOORS 3–40", 256, 64, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial, sans-serif",
      }),
    );
    b.plate("lamp", -30, MY + 2.9, -44.12, 0, -1, 0.6, 0.2, null, {
      tint: [0.9, 0.2, 0.15],
    });
    b.plate(
      "neon",
      -30,
      MY + 2.9,
      -44.14,
      0,
      -1,
      0.6,
      0.2,
      K.neonCell("ny_exit", "EXIT", 128, 48, { color: "#ff3020" }),
    );
    K.lamp(b, -22, MY + 2.6, -48, "bulb", [1, 0.7, 0.4], 0.6, 6, {
      ceil: MY + 3.0,
      lightOpts: { box: SH },
    });
    K.lamp(b, -30, MY + 2.8, -48, "cage", [1, 0.3, 0.2], 0.5, 5, {
      ceil: MY + 3.2,
      lightOpts: { box: SH },
    });
    for (const x of [-25, -19]) {
      b.boxMM("steel", x - 0.5, MY, -49.8, x + 0.5, MY + 0.9, -49.2, {
        tint: [0.7, 0.7, 0.7],
      });
      b.cyl("ceramic", x, MY + 0.9, -49.5, 0.2, 0.2, 0.15, 10);
      b.col(x - 0.5, MY, -49.8, x + 0.5, MY + 0.9, -49.2, {});
    } // room-service carts
    K.skel(ctx, -21.5, MY, -47.2, 1.2, "lying");
    b.hplate(
      "decal",
      -21.5,
      MY + 0.013,
      -47.4,
      1.8,
      1.4,
      0.4,
      K.decal("blood", 6),
    );
    K.loot(ctx, "locker", -17, MY, -49.6, PI, {
      loot: "locker",
      name: "Linen Locker",
    });
    K.loot(ctx, "first_aid", -24, MY + 1.3, -46.15, 0, { loot: "first_aid" });

    // ---- terrace bar (x 16..26, z −40..−26) ----
    const TB = [15.9, MY - 0.3, -40.1, 26.1, MY + 3.8, -25.9];
    K.room(b, ctx, {
      x0: 16,
      z0: -40,
      x1: 26,
      z1: -26,
      y: MY,
      h: 3.6,
      floor: "checker",
      fc: [0.5, 0.45, 0.42],
      wall: "wallpaper_green",
      wc: [0.55, 0.6, 0.5],
      wain: "wood_dark",
      wainC: [0.45, 0.28, 0.18],
      ceil: "tin",
      cc: [0.6, 0.5, 0.35],
    });
    b.boxMM("mahogany", 22.8, MY, -38.5, 23.8, MY + 1.1, -28, {
      tint: [0.5, 0.3, 0.2],
    });
    b.boxMM("brass", 22.7, MY + 1.1, -38.6, 23.9, MY + 1.16, -27.9, {
      tint: [0.7, 0.55, 0.3],
    });
    b.col(22.7, MY, -38.6, 23.9, MY + 1.16, -27.9, { tag: "counter" });
    K.shelf(b, 25.7, MY, -33, -HP, 6, {
      mat: "wood_dark",
      items: ["bottle", "bottle", "bottle", "jar"],
      seed: 61,
      h: 2.4,
    });
    b.plate("glass", 25.88, MY + 2.2, -33, -1, 0, 5.6, 1.2, null, {
      tint: [0.5, 0.5, 0.55],
    });
    for (let z = -37.5; z <= -29; z += 1.4) {
      b.cyl("chrome", 22.1, MY, z, 0.05, 0.05, 0.75, 6);
      b.cyl("vinyl_red", 22.1, MY + 0.75, z, 0.22, 0.22, 0.08, 10);
    }
    for (const z of [-38.6, -35.2]) {
      K.sofa(b, 16.6, MY, z + 1.2, 1.6, -HP, { mat: "leather_red", d: 0.7 });
      K.table(b, 18.2, MY, z + 1.2, 0.7, 1.3, { mat: "mahogany" });
    }
    b.plate(
      "neon",
      20.8,
      MY + 2.6,
      -39.88,
      0,
      1,
      3.6,
      0.8,
      K.neonCell("ny_terrace", "Terrace Room", 512, 110, {
        color: "#40e0ff",
        font: "Georgia, serif",
        italic: true,
      }),
    );
    b.glow(20.8, MY + 2.6, -39.4, [0.2, 0.6, 0.8], 3);
    b.light(20.8, MY + 2.4, -38.5, [0.3, 0.8, 1.0], 0.7, 6, { box: TB });
    K.lamp(b, 23.3, MY + 2.8, -33, "pendant", [1, 0.75, 0.45], 0.7, 6, {
      ceil: MY + 3.6,
      shade: "paint_green",
      lightOpts: { box: TB },
    });
    K.loot(ctx, "cash_register", 23.3, MY + 1.16, -30, -HP, {
      loot: "cash_register",
      name: "Bar Till",
    });
    K.loot(ctx, "fridge", 25.4, MY, -27, HP, {
      loot: "fridge",
      name: "Ice Box",
      items: [
        ["beer", 2],
        ["whiskey", 1],
        ["fizzo_cola", 1],
      ],
    });
    K.skel(ctx, 17.4, MY + 0.45, -37.4, HP, "seated");

    // ------------------------------------------------------------------
    // 33rd FLOOR
    // ------------------------------------------------------------------
    const F33 = [-36.1, -0.3, 69.9, 30.1, FH + 0.2, 90.1];
    const wallp = {
      floor: "carpet_deco",
      fc: [0.8, 0.7, 0.66],
      wall: "wallpaper",
      wc: [0.82, 0.76, 0.66],
      wain: "wood_dark",
      wainC: [0.45, 0.3, 0.2],
      wainH: 0.9,
      ceil: "plaster",
      cc: [0.6, 0.58, 0.54],
      h: FH,
      y: 0,
    };
    // doors from the corridor
    const NDOORS = { 3323: -26, 3325: -18, 3327: -10, 3333: 24 };
    const SDOORS = { 3322: -25, linen: -7, lift: 0, 3326: 9, 3330: 26 };
    for (const k in NDOORS) K.gap(ctx, NDOORS[k], 78, 1.2, 0, 2.3);
    for (const k in SDOORS)
      K.gap(ctx, SDOORS[k], 82, k === "lift" ? 4 : 1.2, 0, 2.3);
    K.gap(ctx, -30, 80, 1.6, 0, 2.3); // corridor → stairwell
    K.gap(ctx, -6, 74.5, 1.1, 0, 2.3); // parlor → bedroom
    K.gap(ctx, -2, 70, 1.3, 0, 2.3); // bedroom → LAB (hidden by the wardrobe)
    K.room(b, ctx, Object.assign({ x0: -30, z0: 78, x1: 30, z1: 82 }, wallp));
    // closed doors (plates) with numbers + corridor dressing
    const doorPlate = (x, z, nz, n, state) => {
      b.boxMM(
        "wood_dark",
        x - 0.6,
        0,
        z + nz * 0.1,
        x + 0.6,
        2.25,
        z + nz * 0.14,
        { tint: state === "boarded" ? [0.35, 0.28, 0.2] : [0.5, 0.33, 0.22] },
      );
      b.cyl("brass", x + 0.42, 1.0, z + nz * 0.17, 0.04, 0.04, 0.05, 6);
      if (state === "boarded")
        for (let k = 0; k < 3; k++)
          b.beam(
            "wood_rotten",
            x - 0.9,
            0.6 + k * 0.6,
            z + nz * 0.2,
            x + 0.9,
            0.8 + k * 0.55,
            z + nz * 0.2,
            0.18,
            0.04,
          );
      if (n)
        b.plate("art", x, 2.5, z + nz * 0.11, 0, nz, 0.36, 0.18, roomNo(n));
    };
    for (const [n, x] of [
      [3329, 6],
      [3331, 14],
    ])
      doorPlate(x, 78, 1, n, n === 3331 ? "boarded" : "closed");
    for (const [n, x] of [
      [3324, -15],
      [3328, 18],
    ])
      doorPlate(x, 82, -1, n, "closed");
    for (const n in NDOORS)
      if (n !== "3327")
        b.plate(
          "art",
          NDOORS[n] + 0.9,
          1.9,
          78.12,
          0,
          1,
          0.36,
          0.18,
          roomNo(n),
        );
    for (const n of ["3322", "3326", "3330"])
      b.plate("art", SDOORS[n] + 0.9, 1.9, 81.88, 0, -1, 0.36, 0.18, roomNo(n));
    b.plate(
      "art",
      -10,
      2.6,
      78.12,
      0,
      1,
      1.6,
      0.4,
      plaqueCell("ny_suite_door", "THE TESLA SUITE · 3327", 512, 128),
    );
    // velvet rope stanchions at the suite door
    for (const dx of [-0.9, 0.9]) {
      b.cyl("brass", -10 + dx, 0, 79.1, 0.12, 0.12, 0.05, 10);
      b.pipe("brass", -10 + dx, 0, 79.1, -10 + dx, 1.0, 79.1, 0.03, 6);
      b.geo("brass", K.sphereGeo(), { x: -10 + dx, y: 1.04, z: 79.1, s: 0.05 });
    }
    b.beam("velvet", -10.9, 0.9, 79.1, -10.4, 0.55, 79.1, 0.05, 0.05, {
      tint: [0.6, 0.12, 0.1],
    });
    // corridor lights (sconces, flickery), pigeons' mess, the downed cable
    for (let x = -26; x <= 26; x += 6.5) {
      const dead = r() < 0.35;
      b.cyl("brass", x, 2.2, 78.15, 0.1, 0.15, 0.3, 8, {
        tint: [0.65, 0.5, 0.3],
      });
      if (!dead) {
        b.light(x, 2.3, 79, [1, 0.72, 0.42], 0.7, 5.5, { box: F33 });
        b.glow(x, 2.35, 78.3, [0.8, 0.55, 0.3], 0.7);
      }
    }
    b.light(28, 2.3, 80, [1, 0.25, 0.15], 0.6, 6, { box: F33 }); // red emergency lamp by the far end
    b.glow(29.8, 2.6, 80, [1, 0.2, 0.1], 0.8);
    for (let k = 0; k < 16; k++)
      b.hplate(
        "decal",
        -29 + r() * 58,
        0.012 + k * 0.0004,
        78.4 + r() * 3.2,
        0.5 + r() * 0.8,
        0.5 + r() * 0.8,
        r() * 6,
        K.decal(k % 5 === 0 ? "blood" : "grime", k + 40),
      );
    for (let k = 0; k < 30; k++)
      b.box(
        "ceramic",
        -28 + r() * 56,
        0.01,
        78.3 + r() * 3.4,
        0.08,
        0.01,
        0.05,
        { yaw: r() * 3, tint: [0.9, 0.9, 0.88] },
      ); // feathers
    K.litter(b, -29, 78.3, 29, 81.7, 0, 18, 33);
    // the sparking cable (hazard) hanging from a broken ceiling panel by 3329
    b.boxMM("paint_black", 3.4, FH - 0.02, 79.2, 5.2, FH, 80.8, {
      tint: [0.03, 0.03, 0.03],
      faces: "b",
    });
    b.pipe("rubber", 4.3, FH, 80, 4.1, 1.2, 80.3, 0.03, 5);
    b.pipe("rubber", 4.1, 1.2, 80.3, 3.6, 0.05, 80.9, 0.03, 5);
    ctx.dyn.spark = { x: 3.6, y: 0.2, z: 80.9 };
    b.hplate("decal", 3.7, 0.014, 80.8, 1.4, 1.4, 0, K.decal("scorch", 8));
    // stairwell (x −36..−30, z 76..84)
    K.room(b, ctx, {
      x0: -36,
      z0: 76,
      x1: -30,
      z1: 84,
      y: 0,
      h: 3.2,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "concrete",
      wc: [0.6, 0.58, 0.54],
      ceil: "concrete",
      cc: [0.4, 0.38, 0.36],
      trim: false,
    });
    K.stairs(b, -35.8, 76.2, -34.2, 81.5, 0, 1.9, "-z", {
      mat: "concrete",
      rail: "r",
      railMat: "rust",
      handMat: "rust",
      tint: [0.55, 0.53, 0.5],
    });
    b.boxMM("metal_dark", -35.95, 0, 82.2, -35.85, 2.3, 83.8, {
      tint: [0.35, 0.36, 0.3],
    });
    b.plate(
      "art",
      -35.83,
      2.6,
      83,
      1,
      0,
      1.2,
      0.3,
      K.signCell("ny_stairb33", "STAIR B · 33", 256, 64, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial, sans-serif",
      }),
    );
    b.plate(
      "art",
      -30.12,
      2.4,
      77.4,
      -1,
      0,
      0.8,
      0.8,
      K.signCell("ny_33", "33", 128, 128, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial Black, sans-serif",
      }),
    );
    K.lamp(b, -33, 2.8, 80, "cage", [1, 0.3, 0.2], 0.6, 5, {
      ceil: 3.2,
      lightOpts: { box: [-36.1, -0.3, 75.9, -29.9, 3.4, 84.1] },
    });
    // window plates (skyline) for south rooms
    const skyWin = (x, z, w) => {
      b.plate("paint_black", x, 1.7, z - 0.11, 0, -1, w, 1.7, null, {
        tint: [0.02, 0.02, 0.02],
        off: 0.005,
      });
      b.plate(
        "neon",
        x,
        1.7,
        z - 0.12,
        0,
        -1,
        w - 0.05,
        1.65,
        skylineCell(((x * 7) | 0) & 3),
        { tint: [0.85, 0.85, 0.85], off: 0.006 },
      );
      b.boxMM(
        "paint_cream",
        x - w / 2 - 0.08,
        0.8,
        z - 0.2,
        x + w / 2 + 0.08,
        0.86,
        z - 0.1,
        { tint: [0.7, 0.65, 0.55] },
      );
      b.boxMM(
        "paint_cream",
        x - 0.03,
        0.86,
        z - 0.16,
        x + 0.03,
        2.55,
        z - 0.12,
        { tint: [0.7, 0.65, 0.55] },
      );
      b.light(x, 1.8, z - 1.2, [0.4, 0.55, 0.5], 0.45, 4.5, { box: F33 });
    };
    // ---- 3322 (x −30..−20, z 82..90): the treasure hunter's camp ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -30, z0: 82, x1: -20, z1: 90 }, wallp, {
        wc: [0.7, 0.72, 0.6],
      }),
    );
    skyWin(-27, 90, 1.6);
    skyWin(-23, 90, 1.6);
    K.bed(b, -28.3, 0, 85, -HP, { w: 1.4, l: 2.0 });
    K.table(b, -21.4, 0, 88.6, 1.0, 0.6, { mat: "wood_dark" });
    b.box("cloth_green", -23.2, 0, 84, 1.8, 0.1, 0.8, {
      yaw: 0.2,
      tint: [0.4, 0.5, 0.3],
    }); // bedroll
    b.cyl("rust", -24.5, 0, 85.5, 0.25, 0.25, 0.3, 8);
    b.glow(-24.5, 0.4, 85.5, [0.8, 0.4, 0.15], 0.6);
    b.light(-24.5, 0.6, 85.5, [1, 0.5, 0.2], 0.6, 4, { box: F33 }); // camp stove
    K.skel(ctx, -22.8, 0, 85.2, 2.6, "curled");
    K.note(ctx, "ph_ny_reel_vance", -21.3, 0.78, 88.5, {
      type: "tape",
      name: "Tape reel: Vance's Notes",
      title: 'Vance Obi — "The Tesla Job"',
      text: "Entry one. Room 3322, 33rd floor, Hotel New Yorker. Everybody in Grand Central knows the story: old Tesla lived next door till '43, and somebody kept working in there after he died. Death ray. Wireless power. Every scavver's dream.\n\nEntry four. The suite's an exhibit — velvet ropes, a plaque, bird cages. Too clean. The floorboards by the wardrobe are worn in a half-circle. Wardrobes don't move. This one does.\n\nEntry five. The big robot on this floor patrols corridor, corridor, suite, corridor. I can hear something humming behind the wall. Every forty seconds the lights dim like something big is breathing in.\n\nEntry six. It saw me. Leg's bad. If anyone finds this: the wardrobe in the BEDROOM. Push it. And whatever you do, don't stand near the coils when they sing.",
    });
    K.loot(ctx, "duffle_bag", -21.2, 0, 86.5, 0.4, {
      loot: "skeleton",
      name: "Vance's Pack",
      items: [
        ["rally_tonic", 1],
        ["ammo_gyrojet", 12],
        ["scrap_metal", 4],
      ],
    });
    K.lamp(b, -25, 2.5, 86, "bulb", [1, 0.75, 0.45], 0.4, 5, {
      ceil: FH,
      dead: false,
      lightOpts: { box: [-30.1, -0.3, 81.9, -19.9, 3.2, 90.1] },
    });
    // ---- linen closet / ice machine (x −10..−4) ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -10, z0: 82, x1: -4, z1: 90 }, wallp, {
        floor: "checker",
        fc: [0.6, 0.58, 0.54],
        wall: "subway_tile",
        wc: [0.8, 0.8, 0.74],
        wain: null,
      }),
    );
    K.shelf(b, -9.7, 0, 86, HP, 5, {
      mat: "metal",
      items: ["box", "box", "box"],
      seed: 71,
    });
    b.boxMM("stainless", -5.8, 0, 88.6, -4.2, 1.6, 89.9, {
      tint: [0.85, 0.88, 0.9],
    });
    b.plate(
      "art",
      -5,
      1.35,
      88.58,
      0,
      -1,
      1.2,
      0.3,
      K.signCell("ny_ice", "ICE", 128, 48, {
        bg: "#1a3a6a",
        fg: "#e8f0ff",
        font: "Arial Black, sans-serif",
      }),
    );
    b.col(-5.8, 0, 88.6, -4.2, 1.6, 89.9, {});
    for (let k = 0; k < 6; k++) {
      const px = -5 + (r() - 0.5) * 1.2,
        pz = 87.8 + (r() - 0.5) * 1;
      b.geo("ceramic", K.sphereGeo(), {
        x: px,
        y: 0.09,
        z: pz,
        sx: 0.12,
        sy: 0.08,
        sz: 0.2,
        tint: [0.75, 0.75, 0.72],
      });
    } // pigeons (dead, dusty)
    K.lamp(b, -7, 2.7, 86, "tube", [0.8, 0.9, 1.0], 0.5, 5, {
      ceil: FH,
      len: 1.2,
      lightOpts: { box: [-10.1, -0.3, 81.9, -3.9, 3.2, 90.1] },
    });
    K.loot(ctx, "footlocker", -8.6, 0, 89.2, 0, {
      loot: "footlocker",
      name: "Housekeeping Chest",
    });
    // ---- elevator lobby (x −4..4, z 82..90) ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -4, z0: 82, x1: 4, z1: 90 }, wallp, {
        floor: "marble",
        fc: [0.75, 0.7, 0.64],
        wain: "deco_wall",
        wainC: [0.85, 0.75, 0.7],
        wainH: 1.4,
      }),
    );
    elevatorDoor(
      b,
      -1.6,
      0,
      89.9,
      0,
      -1,
      false,
      K.signCell("ny_elev_33", "33", 128, 64, { bg: "#1c140c", fg: "#d8b060" }),
    );
    elevatorDoor(b, 1.6, 0, 89.9, 0, -1, true, null);
    b.light(0, 2.6, 86, [1, 0.7, 0.45], 0.8, 6, {
      box: [-4.1, -0.3, 81.9, 4.1, 3.2, 90.1],
    });
    b.glow(0, 2.9, 86, [0.8, 0.6, 0.35], 1.0);
    b.cyl("brass", 0, 2.95, 86, 0.3, 0.15, 0.05, 12);
    b.plate(
      "decal",
      3.88,
      1.5,
      86,
      -1,
      0,
      1.6,
      0.8,
      K.tag("TURN BACK", "#e04030", 256, 96),
    );
    // ---- 3326 (x 4..14): collapsed ceiling ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: 4, z0: 82, x1: 14, z1: 90 }, wallp, {
        wc: [0.75, 0.66, 0.6],
        noCeil: true,
      }),
    );
    b.face("plaster", 4, FH, 82, 1, 0, 0, 0, 0, 1, 5, 8, {
      uv: "top",
      tint: [0.6, 0.58, 0.54],
    });
    b.face("plaster", 9, FH, 82, 1, 0, 0, 0, 0, 1, 5, 3, {
      uv: "top",
      tint: [0.6, 0.58, 0.54],
    });
    b.boxMM("paint_black", 9, FH + 1.5, 85, 14, FH + 1.6, 90, {
      tint: [0.03, 0.03, 0.03],
      faces: "b",
    });
    K.rubble(b, 11.2, 0, 87.2, 2.2, 1.4, { seed: 21 });
    for (let k = 0; k < 4; k++)
      b.beam(
        "rust",
        9.2 + k * 1.2,
        FH + 0.3,
        85.2,
        10 + k * 1.1,
        0.3,
        88 + r(),
        0.12,
        0.2,
      );
    skyWin(6.2, 90, 1.6);
    K.bed(b, 6, 0, 84.5, -HP, { w: 1.4, l: 2.0 });
    K.loot(ctx, "desk", 5, 0, 88.9, 0, { loot: "desk" });
    b.light(8, 2.2, 86, [0.5, 0.6, 0.55], 0.5, 6, {
      box: [3.9, -0.3, 81.9, 14.1, 4.8, 90.1],
    });
    // ---- 3330 (x 22..30): robots' charging bay ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: 22, z0: 82, x1: 30, z1: 90 }, wallp, {
        wall: "metal",
        wc: [0.55, 0.6, 0.6],
        wain: null,
        floor: "metal",
        fc: [0.5, 0.52, 0.5],
      }),
    );
    for (const x of [24, 27.5]) {
      b.boxMM("metal_dark", x - 0.9, 0, 89.2, x + 0.9, 2.6, 89.9, {
        tint: [0.35, 0.38, 0.4],
      });
      b.plate("lamp", x, 2.2, 89.18, 0, -1, 1.2, 0.12, null, {
        tint: [0.3, 0.9, 0.4],
      });
      b.glow(x, 2.2, 89, [0.2, 0.7, 0.3], 0.8);
      b.light(x, 1.6, 88.2, [0.3, 0.9, 0.4], 0.5, 4, {
        box: [21.9, -0.3, 81.9, 30.1, 3.2, 90.1],
      });
      b.pipe("rubber", x, 1.2, 89.2, x + 0.4, 0.05, 87.8, 0.03, 5);
    }
    b.plate(
      "art",
      26,
      2.6,
      82.12,
      0,
      1,
      2.2,
      0.35,
      K.signCell("ny_meridian_bay", "MERIDIAN SECURITY — CHARGING", 384, 64, {
        bg: "#10202a",
        fg: "#80d0ff",
        font: "Arial, sans-serif",
      }),
    );
    K.terminal(
      ctx,
      "ph_ny_term_security",
      29.3,
      0,
      85.6,
      HP,
      termSecurity(),
      "own_desk",
    );
    K.loot(ctx, "toolbox", 23, 0, 83, PI, { loot: "toolbox" });
    K.loot(ctx, "ammo_box", 29.3, 0, 83.2, HP, {
      loot: "ammo_box",
      name: "Battery Crate",
      items: [
        ["ammo_dry_cell", 6],
        ["ammo_gyrojet", 12],
        ["dry_cell", 1],
      ],
    });
    // ---- 3323 (x −30..−22, z 70..78): stripped room ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -30, z0: 70, x1: -22, z1: 78 }, wallp, {
        wc: [0.6, 0.62, 0.55],
      }),
    );
    K.bed(b, -28.5, 0, 72.2, -HP, {});
    K.loot(ctx, "desk", -23, 0, 71, PI, { loot: "dresser", name: "Dresser" });
    b.plate("art", -26, 1.6, 70.12, 0, 1, 1.4, 1.0, K.painting(3, 128, 96), {});
    K.lamp(b, -26, 2.5, 74, "bulb", [1, 0.7, 0.4], 0.45, 5, {
      ceil: FH,
      lightOpts: { box: [-30.1, -0.3, 69.9, -21.9, 3.2, 78.1] },
    });
    // ---- 3325 (x −22..−14): pigeon roost ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -22, z0: 70, x1: -14, z1: 78 }, wallp, {
        wc: [0.72, 0.7, 0.6],
      }),
    );
    for (let k = 0; k < 40; k++)
      b.hplate(
        "decal",
        -21.5 + r() * 7,
        0.012 + k * 0.0003,
        70.5 + r() * 7,
        0.4 + r() * 0.6,
        0.4 + r() * 0.6,
        r() * 6,
        droppingsCell(k % 3),
      );
    for (let k = 0; k < 18; k++) {
      const px = -21 + r() * 6,
        pz = 71 + r() * 6;
      b.geo("ceramic", K.sphereGeo(), {
        x: px,
        y: 0.1,
        z: pz,
        sx: 0.12,
        sy: 0.08,
        sz: 0.2,
        ry: r() * 6,
        tint: r() < 0.3 ? [0.9, 0.9, 0.88] : [0.5, 0.52, 0.55],
      });
    }
    K.bed(b, -20.6, 0, 72.2, -HP, { tint: [0.6, 0.6, 0.55] });
    K.lamp(b, -18, 2.5, 74, "bulb", [1, 0.7, 0.4], 0, 0, {
      ceil: FH,
      dead: true,
    });
    b.light(-18, 2.0, 76, [0.6, 0.55, 0.45], 0.35, 5, {
      box: [-22.1, -0.3, 69.9, -13.9, 3.2, 78.1],
    });
    K.loot(ctx, "file_cabinet", -14.6, 0, 71.2, HP, { loot: "file_cabinet" });
    // ---- 3333 (x 18..30, z 70..78): security office ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: 18, z0: 70, x1: 30, z1: 78 }, wallp, {
        wall: "plaster_stained",
        wc: [0.65, 0.62, 0.55],
        wain: null,
        floor: "concrete",
        fc: [0.55, 0.53, 0.5],
      }),
    );
    for (let k = 0; k < 4; k++) {
      b.boxMM(
        "metal_dark",
        19 + k * 1.4,
        1.2,
        70.12,
        20.2 + k * 1.4,
        2.2,
        70.6,
        { tint: [0.3, 0.32, 0.3] },
      );
      b.plate("lamp", 19.6 + k * 1.4, 1.7, 70.62, 0, 1, 1.0, 0.75, null, {
        tint: k === 2 ? [0.05, 0.05, 0.05] : [0.25, 0.5, 0.35],
      });
    }
    b.light(22, 1.8, 72, [0.3, 0.8, 0.5], 0.6, 5, {
      box: [17.9, -0.3, 69.9, 30.1, 3.2, 78.1],
    });
    K.table(b, 22, 0, 71.6, 4, 0.8, { mat: "metal", tint: [0.5, 0.52, 0.5] });
    K.chair(b, 22, 0, 72.6, 0, { mat: "metal" });
    K.loot(ctx, "locker", 29.6, 0, 74, HP, {
      loot: "locker",
      name: "Security Locker",
      locked: 0,
      lock: PH.LOCKS.ny_sec_locker,
      items: [
        ["ph_ny_elev_key", 1],
        ["rally_tonic", 2],
        ["ammo_10mm", 24],
      ],
    });
    K.lamp(b, 26, 2.6, 75, "tube", [0.8, 0.9, 1.0], 0.5, 5, {
      ceil: FH,
      len: 1.2,
      lightOpts: { box: [17.9, -0.3, 69.9, 30.1, 3.2, 78.1] },
    });
    b.plate("decal", 29.88, 1.4, 76, -1, 0, 1.8, 1.0, K.decal("scorch", 12));

    // ---- THE TESLA SUITE: parlor (x −14..−6) ----
    const PB = [-14.1, -0.3, 69.9, -5.9, 3.2, 78.1];
    K.room(
      b,
      ctx,
      Object.assign({ x0: -14, z0: 70, x1: -6, z1: 78 }, wallp, {
        wall: "wallpaper_green",
        wc: [0.62, 0.66, 0.52],
        floor: "wood",
        fc: [0.6, 0.45, 0.32],
        cornice: true,
      }),
    );
    b.hplate("carpet", -10, 0.012, 74, 5, 3.6, 0, null, {
      tint: [0.6, 0.35, 0.3],
    });
    // pigeon cages along the west wall (three tiers)
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 4; i++) {
        const cz = 71 + i * 1.6,
          cy = 0.1 + j * 0.85;
        b.boxMM("wood_dark", -13.95, cy, cz - 0.7, -13.1, cy + 0.06, cz + 0.7, {
          tint: [0.5, 0.35, 0.22],
        });
        for (let k = 0; k <= 6; k++)
          b.pipe(
            "brass",
            -13.15,
            cy,
            cz - 0.7 + k * 0.23,
            -13.15,
            cy + 0.75,
            cz - 0.7 + k * 0.23,
            0.006,
            3,
            { tint: [0.6, 0.5, 0.3] },
          );
        b.boxMM(
          "brass",
          -13.95,
          cy + 0.74,
          cz - 0.7,
          -13.1,
          cy + 0.78,
          cz + 0.7,
          { tint: [0.6, 0.5, 0.3] },
        );
        if (r() < 0.5)
          b.geo("ceramic", K.sphereGeo(), {
            x: -13.5,
            y: cy + 0.14,
            z: cz + (r() - 0.5) * 0.6,
            sx: 0.12,
            sy: 0.08,
            sz: 0.2,
            tint: [0.85, 0.85, 0.82],
          });
      }
    b.col(-14, 0, 70.2, -13.1, 2.7, 77.8, {});
    for (let k = 0; k < 3; k++)
      b.box("fabric", -12.6, 0, 76.9 - k * 0.6, 0.5, 0.5, 0.4, {
        tint: [0.75, 0.66, 0.48],
        yaw: r() * 0.4,
      }); // seed sacks
    b.plate(
      "art",
      -12.6,
      0.3,
      76.69,
      0,
      -1,
      0.4,
      0.12,
      K.signCell("ny_seed", "HEMP SEED", 128, 40, {
        bg: "#d8c8a0",
        fg: "#4a3020",
      }),
    );
    // Tesla's writing desk + chair, papers, a bulb held in a stand
    const dy = K.table(b, -9.6, 0, 71.0, 1.8, 0.8, { mat: "mahogany" });
    K.chair(b, -9.6, 0, 72.0, 0, {
      mat: "mahogany",
      seatMat: "velvet",
      seatTint: [0.4, 0.15, 0.12],
    });
    for (let k = 0; k < 7; k++)
      b.hplate(
        "flat",
        -9.6 + (r() - 0.5) * 1.4,
        dy + 0.004 + k * 0.001,
        71 + (r() - 0.5) * 0.5,
        0.21,
        0.29,
        r() * 0.8,
        null,
        { tint: [0.85, 0.82, 0.72] },
      );
    b.cyl("brass", -10.2, dy, 70.7, 0.08, 0.06, 0.25, 8);
    b.geo("lamp", K.sphereGeo(), {
      x: -10.2,
      y: dy + 0.35,
      z: 70.7,
      s: 0.09,
      tint: [0.7, 0.85, 1.0],
    });
    b.light(-10.2, dy + 0.4, 71, [0.6, 0.8, 1.0], 0.8, 4, { box: PB });
    b.glow(-10.2, dy + 0.35, 70.7, [0.4, 0.55, 0.8], 0.7); // the bulb still glows — wirelessly
    K.note(ctx, "ph_ny_note_tesla", -9.2, dy + 0.01, 70.9, {
      name: "Letter in a Spidery Hand",
      title: "A letter, never sent (dated 1942)",
      text: "My dear Kenneth,\n\nYou ask why an old man spends his last dollars on bird seed. You would not understand; the young never do. There is a white one who comes to my window every night. When she is ill I know it before she does. When she flies, the whole room hums like a transformer.\n\nThey call me finished. They say the Tower is scrap and the ray a fantasy. Let them. Everything I have designed is in the notebook, and the notebook is where no bank and no general will find it — behind the clothes a man no longer needs.\n\nIf I am gone when you come, feed her.\n\n— N.T.",
    });
    // portrait, exhibit cases, velvet rope, plaque
    K.framed(b, -6.12, 1.8, 74, -1, 0, 1.0, 1.35, portraitCell(), {
      frame: "gold",
      fw: 0.08,
    });
    b.plate(
      "art",
      -6.1,
      0.85,
      74,
      -1,
      0,
      1.0,
      0.32,
      plaqueCell(
        "ny_plaque",
        "NIKOLA TESLA · 1856–1943\nResided in this suite 1933–1943",
        512,
        160,
      ),
    );
    for (const [x, z] of [
      [-11.5, 76.6],
      [-8, 76.6],
    ]) {
      b.boxMM("wood_dark", x - 0.5, 0, z - 0.4, x + 0.5, 0.9, z + 0.4, {
        tint: [0.45, 0.3, 0.2],
      });
      b.boxMM("glass_clear", x - 0.48, 0.9, z - 0.38, x + 0.48, 1.4, z + 0.38, {
        tint: [0.7, 0.8, 0.8],
      });
      b.geo("glass", K.sphereGeo(), {
        x,
        y: 1.02,
        z,
        s: 0.1,
        tint: [0.8, 0.85, 0.7],
      });
      b.cyl("brass", x, 0.9, z, 0.04, 0.04, 0.08, 6);
      b.col(x - 0.5, 0, z - 0.4, x + 0.5, 1.4, z + 0.4, {});
    }
    b.plate(
      "art",
      -9.75,
      1.2,
      77.2,
      0,
      -1,
      0.9,
      0.22,
      K.signCell("ny_exh1", "ORIGINAL AC MOTOR PATENT BULB", 256, 64, {
        bg: "#e8e0c8",
        fg: "#2a2a2a",
      }),
    );
    b.plate("pics", -13.1, 1.9, 72.2, 1, 0, 0.9, 0.68, schematicCell(0), {});
    b.plate("pics", -9.6, 1.9, 70.12, 0, 1, 1.1, 0.82, schematicCell(1), {});
    K.lamp(b, -10, 2.6, 74.5, "globe", [1, 0.8, 0.55], 0.6, 5.5, {
      ceil: FH,
      size: 0.2,
      lightOpts: { box: PB },
    });
    K.loot(ctx, "safe", -6.6, 0, 71.2, HP, {
      loot: "safe",
      locked: 0,
      lock: PH.LOCKS.ny_exhibit_safe,
      name: "Exhibit Safe",
      items: [
        ["scrip", 120],
        ["ph_ny_pigeon_feather", 1],
        ["focus_pills", 1],
      ],
    });
    // ---- bedroom (x −6..2) ----
    const BR = [-6.1, -0.3, 69.9, 2.1, 3.2, 78.1];
    K.room(
      b,
      ctx,
      Object.assign({ x0: -6, z0: 70, x1: 2, z1: 78 }, wallp, {
        wall: "wallpaper_green",
        wc: [0.6, 0.64, 0.5],
        floor: "wood",
        fc: [0.6, 0.45, 0.32],
      }),
    );
    K.bed(b, 0.6, 0, 75.5, HP, {
      w: 1.0,
      l: 2.0,
      frame: "brass",
      tint: [0.75, 0.72, 0.65],
    });
    b.geo("ceramic", K.sphereGeo(), {
      x: 1.15,
      y: 0.66,
      z: 75.5,
      sx: 0.05,
      sy: 0.01,
      sz: 0.14,
      tint: [0.95, 0.95, 0.95],
    }); // white feather on the pillow
    b.boxMM("mahogany", 1.3, 0, 77, 1.9, 0.6, 77.8, {});
    b.col(1.3, 0, 77, 1.9, 0.6, 77.8, {});
    b.boxMM("ceramic", -5.9, 0.8, 76.4, -5.4, 0.95, 77.6, {
      tint: [0.9, 0.9, 0.86],
    });
    b.col(-5.9, 0, 76.4, -5.4, 0.95, 77.6, {}); // washbasin
    b.plate("glass", -5.88, 1.6, 77, 1, 0, 0.5, 0.7, null, {
      tint: [0.5, 0.52, 0.55],
    });
    // worn half-circle on the floor in front of the wardrobe (Vance's clue)
    b.hplate("decal", -2, 0.013, 71.2, 2.6, 1.4, 0, K.decal("grime", 77), {
      tint: [0.9, 0.85, 0.8],
    });
    K.lamp(b, -2, 2.6, 74, "globe", [1, 0.8, 0.55], 0.55, 5, {
      ceil: FH,
      size: 0.18,
      lightOpts: { box: BR },
    });
    // the secret: a hole knocked through the wall behind the wardrobe (lab side)
    for (let k = 0; k < 8; k++)
      b.box(
        "brick_red",
        -2 + (r() - 0.5) * 1.8,
        0,
        69.6 - r() * 0.8,
        0.25,
        0.12,
        0.12,
        { yaw: r() * 3 },
      );

    // ------------------------------------------------------------------
    // TESLA'S LABORATORY
    // ------------------------------------------------------------------
    const LBX = [
      LAB.x0 - 0.1,
      -0.3,
      LAB.z0 - 0.1,
      LAB.x1 + 0.1,
      LAB.h + 0.2,
      LAB.z1 + 0.1,
    ];
    K.room(b, ctx, {
      x0: LAB.x0,
      z0: LAB.z0,
      x1: LAB.x1,
      z1: LAB.z1,
      y: 0,
      h: LAB.h,
      floor: "concrete",
      fc: [0.55, 0.55, 0.56],
      wall: "brick_brown",
      wc: [0.55, 0.5, 0.46],
      ceil: "metal_dark",
      cc: [0.3, 0.3, 0.32],
      trim: false,
      surface: "concrete",
    });
    // copper ground rings around each coil + rubber mats
    for (const [cx, cz] of COILS) {
      b.cyl("copper", cx, 0.005, cz, 3.2, 3.2, 0.02, 32, {
        tint: [0.8, 0.5, 0.3],
      });
      b.cyl("concrete", cx, 0.01, cz, 3.0, 3.0, 0.02, 32, {
        tint: [0.45, 0.45, 0.46],
      });
      coil(b, cx, cz, r);
      // safety rail (octagon) with a gap facing the centre
      for (let k = 0; k < 8; k++) {
        const a0 = (k / 8) * PI * 2,
          a1 = ((k + 1) / 8) * PI * 2;
        if (k === 3) continue;
        const R2 = 3.6;
        K.railing(
          b,
          cx + Math.cos(a0) * R2,
          cz + Math.sin(a0) * R2,
          cx + Math.cos(a1) * R2,
          cz + Math.sin(a1) * R2,
          0,
          { h: 1.0, mat: "paint_yellow", handMat: "paint_yellow", col: true },
        );
      }
      b.plate(
        "art",
        cx,
        0.7,
        cz + 3.62,
        0,
        1,
        0.8,
        0.5,
        K.signCell("ny_danger", "DANGER\n1,000,000 VOLTS", 256, 160, {
          bg: "#e8c020",
          fg: "#1a1a1a",
          font: "Arial Black, sans-serif",
        }),
      );
      b.light(cx, COIL_TOP, cz, [0.45, 0.6, 1.0], 2.2, 14, { box: LBX });
      b.light(cx, 1.5, cz, [0.4, 0.5, 1.0], 0.8, 6, { box: LBX });
      b.glow(cx, COIL_TOP, cz, [0.35, 0.45, 0.9], 5);
      for (let k = 0; k < 4; k++) {
        const a = k * HP + 0.4,
          gx = cx + Math.cos(a) * 3.4,
          gz = cz + Math.sin(a) * 3.4;
        b.pipe("copper", gx, 0, gz, gx, 2.4, gz, 0.04, 6);
        b.geo("copper", K.sphereGeo(), { x: gx, y: 2.45, z: gz, s: 0.1 });
      }
      b.hplate(
        "decal",
        cx + 1.5,
        0.03,
        cz - 1.2,
        2.2,
        2.2,
        r() * 6,
        K.decal("scorch", (30 + cx) | 0),
      );
    }
    // cables from the dynamos to each coil
    for (const [cx, cz] of COILS) {
      b.pipe(
        "rubber",
        -15.5,
        0.06,
        cz < 50 ? 44 : 58,
        cx - 2.2,
        0.06,
        cz,
        0.07,
        6,
      );
    }
    // dynamos along the west wall
    for (const z of [42, 50, 58, 65]) {
      b.boxMM("metal_dark", -17.8, 0, z - 1.8, -14.2, 0.4, z + 1.8, {
        tint: [0.25, 0.26, 0.24],
      });
      b.geo("paint_green", K.unitCyl(18), {
        x: -16,
        y: 1.6,
        z,
        sx: 1.2,
        sy: 2.8,
        sz: 1.2,
        rz: HP,
        tint: [0.25, 0.35, 0.28],
      });
      b.geo("copper", K.unitCyl(18), {
        x: -16,
        y: 1.6,
        z,
        sx: 1.25,
        sy: 1.2,
        sz: 1.25,
        rz: HP,
        tint: [0.7, 0.45, 0.28],
      });
      b.geo("black_iron", K.unitCyl(20), {
        x: -14.1,
        y: 1.6,
        z,
        sx: 1.0,
        sy: 0.12,
        sz: 1.0,
        rz: HP,
      }); // flywheel
      b.pipe("steel", -17.6, 1.6, z, -13.8, 1.6, z, 0.08, 8);
      b.col(-17.8, 0, z - 1.8, -14, 2.9, z + 1.8, {});
      b.plate(
        "art",
        -14.19,
        0.8,
        z - 1.2,
        1,
        0,
        0.7,
        0.25,
        K.signCell("ny_dyn", "WESTINGHOUSE", 256, 64, {
          bg: "#2a2a20",
          fg: "#d8c890",
        }),
      );
      b.glow(-14.4, 2.8, z + 1.2, [1, 0.3, 0.15], 0.4);
    }
    // bus bars on the ceiling trusses
    for (let z = 38; z <= 68; z += 6)
      b.beam("rust", LAB.x0, LAB.h - 0.6, z, LAB.x1, LAB.h - 0.6, z, 0.3, 0.5, {
        tint: [0.45, 0.35, 0.28],
      });
    for (const x of [-10, 0, 10])
      b.pipe("copper", x, LAB.h - 1.0, LAB.z0, x, LAB.h - 1.0, LAB.z1, 0.06, 6);
    // high clerestory windows (north wall) — night skyline
    for (const x of [-12, -6, 6, 12]) {
      b.plate("paint_black", x, 8.6, LAB.z0 + 0.11, 0, 1, 3, 1.6, null, {
        tint: [0.02, 0.02, 0.02],
      });
      b.plate(
        "neon",
        x,
        8.6,
        LAB.z0 + 0.12,
        0,
        1,
        2.95,
        1.55,
        skylineCell(x & 3),
        { tint: [0.7, 0.7, 0.7] },
      );
    }
    // workbenches (east floor), oscilloscopes, Wardenclyffe model
    for (const z of [62, 66]) {
      const ty = K.table(b, 11.5, 0, z, 3.0, 1.0, {
        mat: "wood",
        tint: [0.6, 0.48, 0.35],
      });
      for (let k = 0; k < 2; k++) {
        const x = 10.6 + k * 1.6;
        b.boxMM(
          "metal_dark",
          x - 0.3,
          ty,
          z - 0.35,
          x + 0.3,
          ty + 0.4,
          z + 0.1,
          { tint: [0.3, 0.3, 0.28] },
        );
        b.plate("lamp", x, ty + 0.22, z - 0.36, 0, -1, 0.4, 0.26, null, {
          tint: [0.2, 0.9, 0.4],
        });
        b.glow(x, ty + 0.22, z - 0.5, [0.1, 0.6, 0.25], 0.4);
      }
      for (let k = 0; k < 5; k++)
        b.hplate(
          "flat",
          11.5 + (r() - 0.5) * 2.4,
          ty + 0.003 + k * 0.001,
          z + 0.2 + (r() - 0.5) * 0.3,
          0.21,
          0.29,
          r(),
          null,
          { tint: [0.85, 0.82, 0.72] },
        );
      b.light(11.5, ty + 1.2, z - 0.4, [0.3, 0.9, 0.5], 0.4, 3.5, { box: LBX });
    }
    // Wardenclyffe tower model on a plinth (NW)
    {
      const mx = -9.5,
        mz = 38.5;
      b.boxMM("wood_dark", mx - 1.2, 0, mz - 1.2, mx + 1.2, 0.9, mz + 1.2, {
        tint: [0.45, 0.3, 0.2],
      });
      b.col(mx - 1.2, 0, mz - 1.2, mx + 1.2, 0.9, mz + 1.2, {});
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2;
        b.beam(
          "wood",
          mx + Math.cos(a) * 0.9,
          0.9,
          mz + Math.sin(a) * 0.9,
          mx + Math.cos(a) * 0.3,
          2.9,
          mz + Math.sin(a) * 0.3,
          0.04,
          0.04,
          { tint: [0.7, 0.55, 0.35] },
        );
      }
      for (const y of [1.4, 1.9, 2.4])
        b.cyl(
          "wood",
          mx,
          y,
          mz,
          0.9 - (y - 0.9) * 0.3,
          0.9 - (y - 0.9) * 0.3,
          0.03,
          8,
          { top: false, tint: [0.7, 0.55, 0.35] },
        );
      b.geo("copper", K.sphereGeo(), {
        x: mx,
        y: 3.05,
        z: mz,
        sx: 0.8,
        sy: 0.35,
        sz: 0.8,
        tint: [0.75, 0.5, 0.3],
      });
      b.plate(
        "art",
        mx,
        0.6,
        mz + 1.22,
        0,
        1,
        1.4,
        0.3,
        plaqueCell("ny_wardenclyffe", "WARDENCLYFFE — 1:40", 384, 80),
      );
    }
    // blueprint wall (south)
    for (let k = 0; k < 6; k++)
      b.plate(
        "pics",
        -14 + k * 2.2,
        2.4 + (k % 2) * 0.3,
        LAB.z1 - 0.12,
        0,
        -1,
        1.7,
        1.25,
        schematicCell(k + 3),
        {},
      );
    b.plate(
      "art",
      6,
      3.8,
      LAB.z1 - 0.12,
      0,
      -1,
      7,
      0.8,
      K.signCell(
        "ny_lab_banner",
        "STANHOPE FOUNDATION — PROJECT TELEFORCE",
        1024,
        96,
        { bg: "#1a2230", fg: "#c8d8f0", font: "Arial, sans-serif" },
      ),
    );
    // CATWALK + stairs + control booth (east side)
    K.stairs(b, 15.6, 58, 17.9, 68.5, 0, CAT_Y, "-z", {
      mat: "metal",
      tint: [0.45, 0.46, 0.44],
      rail: "l",
      railMat: "paint_yellow",
      handMat: "paint_yellow",
      solid: false,
      thick: 0.2,
      surface: "metal",
    });
    b.boxMM("metal", 12.6, CAT_Y - 0.15, 34.2, 17.95, CAT_Y, 58, {
      tint: [0.42, 0.43, 0.42],
      faces: "nsewtb",
    });
    b.col(12.6, CAT_Y - 0.15, 34.2, 17.95, CAT_Y, 58, {
      tag: "floor",
      surface: "metal",
    });
    K.railing(b, 12.6, 44, 12.6, 58, CAT_Y, {
      h: 1.05,
      mat: "paint_yellow",
      handMat: "paint_yellow",
    });
    K.railing(b, 12.6, 58, 15.5, 58, CAT_Y, {
      h: 1.05,
      mat: "paint_yellow",
      handMat: "paint_yellow",
    });
    for (let z = 36; z <= 56; z += 5)
      b.pipe("rust", 12.7, 0, z, 12.7, CAT_Y - 0.15, z, 0.07, 6);
    // booth: glass-fronted room on the catwalk (x 12.6..18, z 34..44)
    const BO = [12.5, CAT_Y - 0.2, 34, 18.1, CAT_Y + 3.2, 44.2];
    b.boxMM("metal_dark", 12.6, CAT_Y, 34.2, 12.75, CAT_Y + 0.9, 44, {
      tint: [0.3, 0.32, 0.3],
    });
    b.boxMM("glass_clear", 12.62, CAT_Y + 0.9, 34.2, 12.68, CAT_Y + 2.6, 44, {
      tint: [0.6, 0.75, 0.8],
    });
    b.boxMM("metal_dark", 12.6, CAT_Y + 2.6, 34.2, 18, CAT_Y + 2.9, 44, {
      tint: [0.3, 0.32, 0.3],
      faces: "nsewtb",
    });
    b.boxMM("metal_dark", 12.6, CAT_Y, 43.9, 16.2, CAT_Y + 2.6, 44.05, {
      tint: [0.3, 0.32, 0.3],
    });
    b.col(12.55, CAT_Y, 34.2, 12.8, CAT_Y + 2.6, 44, { tag: "wall" });
    b.col(12.6, CAT_Y, 43.9, 16.2, CAT_Y + 2.6, 44.05, { tag: "wall" });
    const cty = K.table(b, 15.2, CAT_Y, 35.2, 4.2, 1.0, {
      mat: "metal",
      tint: [0.4, 0.42, 0.4],
    });
    for (let k = 0; k < 5; k++) {
      b.plate("lamp", 13.6 + k * 0.8, cty + 0.5, 34.35, 0, 1, 0.6, 0.4, null, {
        tint: k === 2 ? [0.4, 0.6, 1.0] : [0.2, 0.8, 0.35],
      });
    }
    b.boxMM("metal_dark", 13.2, cty, 34.25, 17.4, cty + 0.9, 34.4, {
      tint: [0.25, 0.27, 0.25],
    });
    b.light(15.2, cty + 1.0, 36, [0.3, 0.9, 0.5], 0.9, 5, { box: BO });
    b.glow(15.2, cty + 0.5, 34.6, [0.15, 0.6, 0.3], 1.4);
    K.terminal(ctx, "ph_ny_term_lab", 14.4, cty, 35.4, PI, termLab(), "bare");
    K.anchor(ctx, "notebook", 16.4, cty + 0.02, 35.6);
    K.anchor(ctx, "booth", 15.2, CAT_Y, 38.5);
    K.chair(b, 14.4, CAT_Y, 36.4, 0, { mat: "metal" });
    K.skel(ctx, 16.8, CAT_Y, 38, 2.2, "lying");
    K.note(ctx, "ph_ny_reel_stanhope", 17.0, CAT_Y + 0.02, 38.8, {
      type: "tape",
      name: "Tape reel: Dr. Stanhope, Final Log",
      title: "Dr. Marguerite Stanhope — Project Teleforce, log 211",
      text: "March fifth. The sirens started at 9:41. The coils are at full charge — I had the whole 33rd floor humming for tonight's demonstration. The Army liaison never arrived. Nobody is coming to see the ray.\n\nFor the record, since there will be no other record: Nikola was right. The Teleforce works. It works beautifully. I have spent eleven years proving that a dead man was right, in a hotel room, feeding his pigeons.\n\nI've set the security robots to guard the floor until the Foundation sends someone with the discharge code. The code is on the booth terminal. The notebook stays on my desk, where it belongs.\n\nIf you are not from the Foundation: please don't touch the coils. Please feed the birds. And please — please tell someone he was right.",
    });
    // FARADAY CAGE with the TELEFORCE pedestal (north centre)
    {
      const { x0, x1, z0, z1 } = CAGE;
      for (let x = x0; x <= x1 + 0.01; x += 0.3)
        if (Math.abs(x) > 1.0)
          b.pipe("steel", x, 0, z1, x, 3.6, z1, 0.02, 4, {
            tint: [0.6, 0.62, 0.64],
          });
      for (let z = z0; z <= z1; z += 0.3) {
        b.pipe("steel", x0, 0, z, x0, 3.6, z, 0.02, 4, {
          tint: [0.6, 0.62, 0.64],
        });
        b.pipe("steel", x1, 0, z, x1, 3.6, z, 0.02, 4, {
          tint: [0.6, 0.62, 0.64],
        });
      }
      for (const y of [0.05, 1.2, 2.4, 3.6]) {
        b.beam("steel", x0, y, z1, -1.0, y, z1, 0.05, 0.05);
        b.beam("steel", 1.0, y, z1, x1, y, z1, 0.05, 0.05);
        b.beam("steel", x0, y, z0, x0, y, z1, 0.05, 0.05);
        b.beam("steel", x1, y, z0, x1, y, z1, 0.05, 0.05);
      }
      b.boxMM("steel", x0, 3.6, z0, x1, 3.7, z1, { tint: [0.55, 0.57, 0.6] });
      b.col(x0 - 0.05, 0, z1 - 0.05, -1.0, 3.7, z1 + 0.05, { walkable: false });
      b.col(1.0, 0, z1 - 0.05, x1 + 0.05, 3.7, z1 + 0.05, { walkable: false });
      b.col(x0 - 0.05, 0, z0, x0 + 0.05, 3.7, z1, { walkable: false });
      b.col(x1 - 0.05, 0, z0, x1 + 0.05, 3.7, z1, { walkable: false });
      // pedestal
      b.cyl("marble", 0, 0, 36.6, 0.45, 0.35, 1.05, 12, {
        tint: [0.85, 0.82, 0.78],
      });
      b.cyl("brass", 0, 1.05, 36.6, 0.55, 0.55, 0.06, 14);
      b.col(-0.4, 0, 36.2, 0.4, 1.1, 37.0, {});
      b.light(0, 2.6, 37.5, [0.5, 0.7, 1.0], 1.2, 5, {
        box: [x0, -0.3, z0, x1, 3.8, z1],
      });
      b.glow(0, 1.5, 36.6, [0.3, 0.45, 0.9], 1.6);
      // the white pigeon in her gilded cage, beside the Teleforce
      b.cyl("gold", 2.6, 0, 36.2, 0.2, 0.2, 1.2, 8, { tint: [0.8, 0.65, 0.3] });
      b.cyl("gold", 2.6, 1.2, 36.2, 0.3, 0.3, 0.04, 12);
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * PI * 2;
        b.pipe(
          "gold",
          2.6 + Math.cos(a) * 0.3,
          1.2,
          36.2 + Math.sin(a) * 0.3,
          2.6 + Math.cos(a) * 0.1,
          1.85,
          36.2 + Math.sin(a) * 0.1,
          0.006,
          3,
          { tint: [0.8, 0.65, 0.3] },
        );
      }
      b.geo("ceramic", K.sphereGeo(), {
        x: 2.6,
        y: 1.34,
        z: 36.2,
        sx: 0.1,
        sy: 0.08,
        sz: 0.16,
        tint: [0.97, 0.97, 0.95],
      });
      b.geo("ceramic", K.sphereGeo(), {
        x: 2.6,
        y: 1.43,
        z: 36.08,
        s: 0.05,
        tint: [0.97, 0.97, 0.95],
      });
      b.plate(
        "art",
        0,
        0.55,
        37.06,
        0,
        1,
        0.7,
        0.2,
        plaqueCell("ny_ped", "TELEFORCE — PROTOTYPE 7", 384, 80),
      );
      K.anchor(ctx, "teleforce", 0, 1.12, 36.6);
      K.anchor(ctx, "boss", 0, 0, 52);
    }
    // freight elevator (NW corner): steel gate on the west wall
    b.boxMM("metal_dark", LAB.x0 + 0.05, 0, 35.2, LAB.x0 + 0.15, 3.2, 38.8, {
      tint: [0.4, 0.4, 0.38],
    });
    for (let k = 0; k < 11; k++)
      b.boxMM(
        "metal",
        LAB.x0 + 0.16,
        0.1,
        35.3 + k * 0.33,
        LAB.x0 + 0.2,
        3.1,
        35.36 + k * 0.33,
        { tint: [0.5, 0.5, 0.46] },
      );
    b.plate(
      "art",
      LAB.x0 + 0.22,
      3.6,
      37,
      1,
      0,
      1.8,
      0.35,
      K.signCell("ny_freight2", "FREIGHT — LOBBY", 384, 64, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial, sans-serif",
      }),
    );
    b.glow(LAB.x0 + 0.4, 3.1, 38.8, [0.2, 0.9, 0.3], 0.5);
    // shelves & crates under the catwalk
    K.shelf(b, 17.6, 0, 40, -HP, 4, {
      mat: "metal",
      items: ["box", "jar", "can"],
      seed: 81,
    });
    K.loot(ctx, "ammo_box", 16.8, 0, 46, HP, {
      loot: "ammo_box",
      name: "Rocket Crate",
      items: [
        ["ammo_gyrojet", 30],
        ["ammo_dry_cell", 4],
      ],
    });
    K.loot(ctx, "first_aid", 17.9, 1.3, 50, HP, { loot: "first_aid" });
    K.loot(ctx, "file_cabinet", -17.5, 0, 36, -HP, {
      loot: "file_cabinet",
      name: "Foundation Files",
    });
    K.loot(ctx, "toolbox", 9.5, 0, 68.8, 0, { loot: "toolbox" });
    // burnt scientist near coil 3 + lab lighting
    K.skel(ctx, 3.8, 0, 49.8, 0.9, "reaching");
    b.hplate("decal", 3.6, 0.03, 49.6, 2.4, 2.4, 0, K.decal("scorch", 44));
    for (const [x, z] of [
      [-10, 66],
      [10, 40],
      [-4, 64],
    ])
      K.lamp(b, x, 6.5, z, "pendant", [1, 0.8, 0.55], 0.7, 9, {
        ceil: LAB.h,
        shade: "paint_green",
        lightOpts: { box: LBX },
      });
    b.light(0, 5, 52, [0.3, 0.35, 0.6], 0.6, 20, { box: LBX });
    K.litter(b, -16, 36, 16, 69, 0, 30, 101);

    // ------------------------------------------------------------------
    // DOORS & ANCHORS
    // ------------------------------------------------------------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const W = (x, y, z) => new THREE.Vector3(OX + x, OY + y, OZ + z);
    const disc = () => K.safe("disc", () => G.discover("hotel_new_yorker"));
    K.door(ctx, {
      id: "ph_ny_in",
      pos: new THREE.Vector3(NY.X1 + 1.2, 1.3, NY.DOOR_Z),
      label: "Hotel New Yorker",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.8, yaw: 0 },
      onEnter: disc,
    });
    K.door(ctx, {
      id: "ph_ny_out",
      pos: W(0, 1.3, -0.4),
      label: "8th Avenue",
      verb: "Leave",
      target: { x: NY.X1 + 3.2, y: 0, z: NY.DOOR_Z, yaw: -HP },
    });
    // elevator car 3 ⇄ 33rd floor (locked until power is restored or the key is used)
    ctx.elevDoor = K.door(ctx, {
      id: "ph_ny_elev_up",
      pos: W(15.6, 1.3, -10),
      label: "Elevator Car 3 — 33rd Floor",
      verb: "Ride",
      lock: PH.lockReg(PH.LOCKS.ny_elev),
      sound: "door_open",
      target: { x: OX, y: OY, z: OZ + 88.6, yaw: 0 },
      onEnter: () => PH.nyOnFloor33(),
    });
    K.door(ctx, {
      id: "ph_ny_elev_down",
      pos: W(-1.6, 1.3, 89.6),
      label: "Elevator Car 3 — Lobby",
      verb: "Ride",
      target: { x: OX + 14.2, y: OY, z: OZ - 10, yaw: HP },
    });
    // emergency stairs (ballroom landing ⇄ 33) — the long way up, jammed fire door
    K.door(ctx, {
      id: "ph_ny_stairs_up",
      pos: W(-31.6, MY + 1.3, -48),
      label: "Stair B — 33rd Floor",
      verb: "Climb",
      lock: PH.lockReg(PH.LOCKS.ny_stairs),
      target: { x: OX - 33, y: OY, z: OZ + 80, yaw: -HP },
      onEnter: () => PH.nyOnFloor33(),
    });
    K.door(ctx, {
      id: "ph_ny_stairs_down",
      pos: W(-35.6, 1.3, 83),
      label: "Stair B — Mezzanine",
      verb: "Descend",
      target: { x: OX - 29.5, y: OY + MY, z: OZ - 48, yaw: -HP },
    });
    // freight elevator lab ⇄ lobby staff room (lobby side opens once used from above)
    K.door(ctx, {
      id: "ph_ny_freight_down",
      pos: W(LAB.x0 + 0.5, 1.4, 37),
      label: "Freight Elevator — Lobby",
      verb: "Ride",
      target: { x: OX - 20.5, y: OY, z: OZ - 3, yaw: -HP },
      onEnter: () => {
        PH.setFlag("ny_freight", true);
        if (ctx.freightUp) ctx.freightUp.unbar(true);
      },
    });
    // one-way: the freight car is called from the lab only, until it has been ridden down once (not a lock)
    ctx.freightUp = PH.barDoor(
      K.door(ctx, {
        id: "ph_ny_freight_up",
        pos: W(-21.5, 1.4, -3),
        label: "Freight Elevator — 33",
        verb: "Ride",
        target: { x: OX + LAB.x0 + 2, y: OY, z: OZ + 37, yaw: -HP },
      }),
      {
        lockText: "Called from above only",
        message: "The freight car is parked upstairs. The call button is dead.",
      },
    );

    K.anchor(ctx, "entrance", 0, 0, -1.8);
    K.anchor(ctx, "mezzanine", 0, MY, -22.5);
    K.anchor(ctx, "ballroom", 0, MY, -36);
    K.anchor(ctx, "floor33", 0, 0, 80);
    K.anchor(ctx, "suite", -10, 0, 74);
    K.anchor(ctx, "wardrobe", -2, 0, 71.5);
    K.anchor(ctx, "lab", 0, 0, 60);
    const sp = [
      [24, 0, 80],
      [0, MY, -40],
      [-20, 0, 80],
      [10, MY, -30],
      [21, MY, -33],
      [8, 0, -14],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 13.2, 0, -1.3);
    K.anchor(ctx, "loot2", -6.6, 0, 71.2);
    K.anchor(ctx, "loot3", 16.8, 0, 46);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_newyorker_int";
    ctx.labLocal = LAB;
    // dynamic pieces: the wardrobe (slides aside), the cage gate, the arcs
    buildWardrobe(ctx);
    buildCageGate(ctx);
    buildArcs(ctx);
  }

  /** One Tesla coil (static): base, primary spiral, secondary, toroid. */
