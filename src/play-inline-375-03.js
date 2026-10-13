// play-inline-375 03 — ctx
// Lines 79-1760 of readable/play-inline-375.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("helmsley");
    const S = P.site("helmsley_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x585e66,
      ambI: 0.32,
      interiorKey: "helmsley",
    });
    const b = S.b;
    const r = P.rng("helmsley_int");

    // =================== LOBBY ===================
    const LH = 7.2;
    // vestibule (bronze revolving door)
    S.room({
      x0: -3.5,
      z0: 30,
      x1: 3.5,
      z1: 33.5,
      y: 0,
      h: 4.6,
      wall: "marble_rouge",
      floor: "terrazzo",
      ceil: "gilt_dull",
      skip: "n",
      holes: { s: [[-1.2, 1.2, 0, 3.2]] },
    });
    b.box("bronze", -1.25, 0, 33.3, 1.25, 3.3, 33.4, { seg: false });
    b.box("glass_dark", -1.15, 0.1, 33.25, 1.15, 3.2, 33.3, { seg: false });
    b.cyl("glass", 0, 0, 32.2, 1.1, 1.1, 2.8, 16, { open: true });
    b.cyl("bronze", 0, 2.8, 32.2, 1.15, 1.15, 0.2, 16);
    for (let k = 0; k < 4; k++)
      b.box("bronze", -0.03, 0, 32.2 - 1.05, 0.03, 2.8, 32.2 + 1.05, {
        ry: (k * PI) / 4,
        seg: false,
      });
    S.col(-1.15, 0, 31.1, 1.15, 2.8, 33.3, { walkable: false });
    S.anchor("entrance", 0, 0, 29.6, 0);
    // the long lobby hall
    S.floor("terrazzo_polish", -7, -6, 7, 30, 0);
    for (let z = -5; z < 30; z += 2.5)
      b.box("marble_rouge", -6.6, 0.001, z, 6.6, 0.012, z + 0.3, {
        seg: false,
        noAO: true,
      }); // floor bands
    b.box("marble_rouge", -6.6, 0.001, -5.8, -6.3, 0.012, 29.8, {
      seg: false,
      noAO: true,
    });
    b.box("marble_rouge", 6.3, 0.001, -5.8, 6.6, 0.012, 29.8, {
      seg: false,
      noAO: true,
    });
    // rouge-and-brass inlay medallions down the hall (compass star)
    for (const z of [4, 20.5, 26.5]) {
      b.cyl("marble_rouge", 0, 0.002, z, 1.6, 1.6, 0.012, 32, { noAO: true });
      b.torus("gold", 0, 0.016, z, 1.6, 0.03, TAU, {
        rx: HP,
        ts: 40,
        rs: 3,
        noAO: true,
      });
      b.cyl("terrazzo_polish", 0, 0.004, z, 1.1, 1.1, 0.012, 32, {
        noAO: true,
      });
      for (let k = 0; k < 8; k++)
        b.box(
          k % 2 ? "marble_dark" : "gold",
          -0.08,
          0.005,
          z - 1.05,
          0.08,
          0.018,
          z + 1.05,
          { ry: (k * PI) / 8, seg: false, noAO: true },
        );
    }
    S.wallX("travertine_v", 30, -7.15, 7.15, 0, LH, 0.3, [[-3.5, 3.5, 0, 4.6]]);
    S.wallX("travertine_v", -6, -7.15, 7.15, 0, LH, 0.3, []);
    S.wallZ("travertine_v", -7, -6, 30, 0, LH, 0.3, []);
    S.wallZ("travertine_v", 7, -6, 30, 0, LH, 0.3, [[4.2, 6.8, 0, 3.0]]);
    // rouge marble dado + pilasters
    for (const sx of [-1, 1]) {
      b.box(
        "marble_rouge",
        sx * 6.84 - 0.02,
        0,
        -5.8,
        sx * 6.84 + 0.02,
        1.4,
        29.8,
        { seg: false },
      );
      for (let z = -4; z <= 28; z += 4) {
        b.box(
          "marble_rouge",
          sx * 6.8 - 0.25,
          0,
          z - 0.4,
          sx * 6.8 + 0.25,
          LH - 0.8,
          z + 0.4,
          { seg: false },
        );
        b.box(
          "gilt_dull",
          sx * 6.8 - 0.3,
          LH - 0.8,
          z - 0.5,
          sx * 6.8 + 0.3,
          LH - 0.5,
          z + 0.5,
          { seg: false },
        );
      }
    }
    // bronze frieze (railway motifs) running both walls above the elevator heads
    const frieze = P.texMat(
      "helms_frieze",
      P.canvasTex("m3_helms_frieze", 1024, 64, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#6a4a20");
        g.addColorStop(0.5, "#c8963c");
        g.addColorStop(1, "#5a3c18");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(40,24,8,0.8)";
        ctx.lineWidth = 3;
        for (let x = 0; x < w; x += 64) {
          ctx.beginPath();
          ctx.moveTo(x + 8, h - 8);
          ctx.lineTo(x + 32, 8);
          ctx.lineTo(x + 56, h - 8);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x + 32, h / 2 + 4, 8, 0, TAU);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(255,230,160,0.35)";
        ctx.fillRect(0, 4, w, 2);
        ctx.fillRect(0, h - 6, w, 2);
      }),
      { rough: 0.35, metal: 0.3 },
    );
    for (const sx of [-1, 1]) {
      const x = sx * 6.83;
      b.quad(frieze, x, 4.6, 12, 35.6, 0.55, { ry: -sx * HP, us: 9, uo: 0 });
      b.box("bronze", x - 0.04, 4.28, -5.8, x + 0.04, 4.33, 29.8, {
        seg: false,
      });
      b.box("bronze", x - 0.04, 4.87, -5.8, x + 0.04, 4.92, 29.8, {
        seg: false,
      });
    }
    // bronze sconces between the pilasters (every other one alive)
    for (const sx of [-1, 1])
      for (let z = -2; z <= 26; z += 4) {
        if (
          (z === 6 && sx < 0) ||
          [11, 17, 23].some((e) => Math.abs(z - e) < 1.8)
        )
          continue;
        D.sconce(S, sx * 6.83, 2.9, z, sx < 0 ? HP : -HP, {
          dark: ((z + 2) / 4 + (sx > 0 ? 1 : 0)) % 2 === 1,
          r: 5,
          i: 0.6,
          color: 0xffd090,
        });
      }
    // coffered gilt ceiling, painted panels between the coffers (sky & clouds, railway allegory)
    S.ceil("plaster_cream", -7, -6, 7, 30, LH);
    const cp = P.texMat(
      "helms_ceilpanel",
      P.canvasTex(
        "m3_helms_ceil",
        256,
        256,
        (ctx, w, h) => {
          const rr = P.rng("hceil");
          const g = ctx.createRadialGradient(
            w / 2,
            h / 2,
            10,
            w / 2,
            h / 2,
            w * 0.7,
          );
          g.addColorStop(0, "#9ab0b8");
          g.addColorStop(1, "#4a6068");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 14; i++) {
            const cg = ctx.createRadialGradient(
              rr() * w,
              rr() * h,
              0,
              rr() * w,
              rr() * h,
              30 + rr() * 50,
            );
            cg.addColorStop(0, "rgba(240,230,210,0.5)");
            cg.addColorStop(1, "rgba(240,230,210,0)");
            ctx.fillStyle = cg;
            ctx.fillRect(0, 0, w, h);
          }
          ctx.strokeStyle = "#b8903a";
          ctx.lineWidth = 8;
          ctx.strokeRect(4, 4, w - 8, h - 8);
          ctx.strokeStyle = "rgba(60,40,10,0.6)";
          ctx.lineWidth = 2;
          ctx.strokeRect(14, 14, w - 28, h - 28);
          ctx.fillStyle = "rgba(200,160,70,0.8)";
          ctx.beginPath();
          for (let k = 0; k < 16; k++) {
            const a = (k / 16) * TAU,
              rad = k % 2 ? 10 : 26;
            ctx.lineTo(w / 2 + Math.cos(a) * rad, h / 2 + Math.sin(a) * rad);
          }
          ctx.fill();
          for (let i = 0; i < 200; i++) {
            ctx.fillStyle = "rgba(40,30,20," + rr() * 0.3 + ")";
            ctx.fillRect(rr() * w, rr() * h, 2 + rr() * 6, 1 + rr() * 3);
          }
        },
        { clamp: true },
      ),
      { rough: 0.8 },
    );
    for (let x = -6; x <= 6; x += 3)
      for (let z = -2.5; z <= 26.5; z += 3)
        b.quad(cp, x, LH - 0.1, z, 2.6, 2.6, { rx: HP });
    for (let x = -4.5; x <= 4.5; x += 3)
      b.box("gilt_dull", x - 0.2, LH - 0.5, -5.8, x + 0.2, LH, 29.8, {
        seg: false,
      });
    for (let z = -4; z <= 28; z += 3)
      b.box("gilt_dull", -6.8, LH - 0.5, z - 0.2, 6.8, LH, z + 0.2, {
        seg: false,
      });
    for (let x = -6; x <= 6; x += 3)
      for (let z = -2.5; z <= 26.5; z += 3)
        b.box(
          "gilt",
          x - 0.12,
          LH - 0.55,
          z - 0.12,
          x + 0.12,
          LH - 0.48,
          z + 0.12,
          { seg: false, noAO: true },
        );
    D.chandelier(S, 0, LH - 1.2, 4, 0.9, {
      tiers: 2,
      broken: true,
      lr: 9,
      li: 0.7,
    });
    D.chandelier(S, 0, LH - 1.2, 14.8, 1.0, { tiers: 3, lr: 11, li: 0.85 }); // over the checkpoint: the Continuity keep this one lit
    D.chandelier(S, 0, LH - 1.2, 23, 0.9, { tiers: 2, dark: true });
    // elevator banks: bronze doors with gilt relief panels (one pried open)
    const elev = [];
    const relief = P.texMat(
      "helms_relief",
      P.canvasTex(
        "m3_helms_relief",
        512,
        128,
        (ctx, w, h) => {
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#e8c070");
          g.addColorStop(1, "#8a6224");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(60,36,8,0.85)";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(w / 2, h, h * 0.8, PI, TAU);
          ctx.stroke();
          for (let k = 0; k < 13; k++) {
            const a = PI + (k / 12) * PI;
            ctx.beginPath();
            ctx.moveTo(
              w / 2 + Math.cos(a) * h * 0.3,
              h + Math.sin(a) * h * 0.3,
            );
            ctx.lineTo(
              w / 2 + Math.cos(a) * h * 0.78,
              h + Math.sin(a) * h * 0.78,
            );
            ctx.stroke();
          }
          for (const sx of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(w / 2 + sx * 90, h * 0.5);
            ctx.bezierCurveTo(
              w / 2 + sx * 150,
              h * 0.1,
              w / 2 + sx * 210,
              h * 0.9,
              w / 2 + sx * 250,
              h * 0.4,
            );
            ctx.stroke();
          }
          ctx.fillStyle = "rgba(255,240,200,0.3)";
          ctx.fillRect(0, 3, w, 3);
        },
        { clamp: true },
      ),
      { rough: 0.35, metal: 0.3 },
    );
    for (const sx of [-1, 1])
      for (const z of [11, 17, 23]) {
        const x = sx * 6.82,
          open = sx > 0 && z === 17;
        b.box(
          "bronze",
          x - 0.05 * sx,
          0,
          z - 1.3,
          x + 0.05 * sx,
          3.2,
          z + 1.3,
          { seg: false },
        );
        if (!open) {
          b.box(
            "gilt_dull",
            x - 0.08 * sx,
            0.1,
            z - 1.05,
            x - 0.07 * sx,
            3.0,
            z + 1.05,
            { seg: false },
          );
          b.box(
            "bronze",
            x - 0.09 * sx,
            0,
            z - 0.02,
            x - 0.08 * sx,
            3.0,
            z + 0.02,
            { seg: false },
          );
          for (const dz of [-0.55, 0.55])
            b.box(
              "gilt",
              x - 0.1 * sx,
              1.9,
              z + dz - 0.3,
              x - 0.09 * sx,
              2.6,
              z + dz + 0.3,
              { seg: false },
            );
        } else {
          b.box("glass_dark", x - 0.02, 0, z - 1.0, x + 0.02, 3.0, z + 1.0, {
            seg: false,
          });
          b.box("bronze", x - 0.09, 0, z - 1.25, x - 0.06, 3.0, z - 1.0, {
            seg: false,
          });
        }
        b.box("gilt", x - 0.1 * sx, 3.2, z - 1.5, x - 0.05 * sx, 3.9, z + 1.5, {
          seg: false,
        });
        b.quad(relief, x - 0.11 * sx, 3.55, z, 2.8, 0.62, { ry: -sx * HP });
        b.box(
          open ? "lamp_red" : "glass_dark",
          x - 0.12 * sx,
          3.45,
          z - 0.2,
          x - 0.1 * sx,
          3.6,
          z + 0.2,
          { seg: false },
        );
        elev.push([x, z, open]);
      }
    // directory board
    const dir = P.canvasTex(
      "m3_helms_dir",
      256,
      384,
      (ctx, w, h) => {
        const rr = P.rng("dir");
        ctx.fillStyle = "#141414";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#8a7030";
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, w - 8, h - 8);
        ctx.fillStyle = "#e8e0c8";
        ctx.textAlign = "center";
        ctx.font = "bold 18px " + P.FONTS.SERIF;
        ctx.fillText("230 PARK AVENUE", w / 2, 34);
        ctx.font = "12px " + P.FONTS.SANS;
        ctx.textAlign = "left";
        const L = [
          "NEW YORK CENTRAL SYSTEM ....... 2-10",
          "EXECUTIVE OFFICES ............... 21-34",
          "PULLMAN CO. ........................ 11",
          "ATOMIC FREIGHT DIV. ............. 12",
          "CIVIL DEFENSE SALES (N.E.) .......... 14",
          "MERIDIAN RAIL SIGNAL ............... 15",
          "LAW OFFICES ....................... 16-19",
          "OBSERVATION LOUNGE ........... CLOSED",
          "",
          "CONTINUITY — DETACHMENT 7",
          "ALL FLOORS ..................... RESTRICTED",
        ];
        L.forEach((t, i) => {
          ctx.fillStyle = i >= 9 ? "#8ab0ff" : "#e8e0c8";
          if (rr() < 0.15 && i < 8) ctx.globalAlpha = 0.4;
          ctx.fillText(t, 16, 70 + i * 26);
          ctx.globalAlpha = 1;
        });
      },
      { clamp: true },
    );
    const dk = P.texMat("helms_dir", dir, { rough: 0.5 });
    b.box("bronze", -6.95, 1.0, 4.9, -6.8, 3.5, 6.9, { seg: false });
    b.quad(dk, -6.79, 2.25, 5.9, 1.8, 2.4, { ry: HP });
    // ---- Continuity Checkpoint 7 across the lobby ----
    const CZ = 14;
    for (const [x0, x1] of [
      [-6.8, -1.6],
      [1.6, 6.8],
    ]) {
      for (let x = x0; x < x1 - 0.1; x += 1.3) {
        b.box(
          "continuity_black",
          x,
          0,
          CZ - 0.25,
          Math.min(x1, x + 1.25),
          1.3,
          CZ + 0.25,
          { seg: false },
        );
        b.box(
          "paint_white",
          x + 0.2,
          0.9,
          CZ + 0.26,
          Math.min(x1, x + 1.25) - 0.2,
          1.0,
          CZ + 0.27,
          { seg: false, noAO: true },
        );
      }
      S.col(x0, 0, CZ - 0.25, x1, 1.3, CZ + 0.25, { walkable: false });
    }
    b.box("continuity_black", -1.6, 2.5, CZ - 0.2, 1.6, 2.8, CZ + 0.2, {
      seg: false,
    });
    for (const sx of [-1, 1]) {
      b.box(
        "continuity_panel",
        sx * 1.6 - 0.2,
        0,
        CZ - 0.3,
        sx * 1.6 + 0.2,
        2.8,
        CZ + 0.3,
        { seg: false },
      );
      b.box(
        "core_blue",
        sx * 1.6 - 0.05,
        0.3,
        CZ - 0.32,
        sx * 1.6 + 0.05,
        2.5,
        CZ - 0.3,
        { seg: false },
      );
    }
    S.glow(0, 2.6, CZ - 0.3, 0x5aa0ff, 0.8);
    const cps = P.texMat(
      "helms_cps",
      P.signTex(
        "helms_cps",
        ["CHECKPOINT 7", "HALT — PRESENT CLEARANCE"],
        "label",
        512,
        160,
        { bg: "#d8d8d0" },
      ),
      { rough: 0.7 },
    );
    b.quad(cps, 0, 3.15, CZ + 0.22, 2.4, 0.75, { ry: 0 });
    // guard desk + terminal, sandbags, floodlight on a tripod
    b.box("continuity_black", 3, 0, CZ - 2.4, 5.4, 0.9, CZ - 1.5, {
      seg: false,
    });
    S.col(3, 0, CZ - 2.4, 5.4, 0.9, CZ - 1.5, { walkable: false });
    S.prop("terminal", 4.2, 0.9, CZ - 2.0, PI, {
      terminalId: "m3_helms_checkpoint",
      mount: "bare",
    });
    S.prop("sandbags", -4, 0, CZ - 1.4, 0, { low: true });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      b.rod(
        "continuity_black",
        [-5.4, 0, CZ - 3.2],
        [-5.4 + Math.cos(a) * 0.5, 0, CZ - 3.2 + Math.sin(a) * 0.5],
        0.03,
        4,
      );
      b.rod(
        "continuity_black",
        [-5.4 + Math.cos(a) * 0.5, 0, CZ - 3.2 + Math.sin(a) * 0.5],
        [-5.4, 1.9, CZ - 3.2],
        0.03,
        4,
      );
    }
    b.box("continuity_black", -5.8, 1.9, CZ - 3.5, -5.0, 2.4, CZ - 2.9, {
      seg: false,
    });
    b.box("lamp", -5.75, 1.95, CZ - 2.9, -5.05, 2.35, CZ - 2.88, {
      seg: false,
    });
    S.light(-5.4, 2.1, CZ - 0.5, 0xe8f0ff, 11, 1.2);
    S.glow(-5.4, 2.15, CZ - 2.85, 0xe8f0ff, 0.9);
    // a Continuity banner over the north doors, dead civilians' skeletons by the south doors (the first week)
    const vflag = P.texMat("helms_eflag_v", P.continuityFlagTex(true), {
      double: true,
      rough: 0.95,
    });
    b.quad(vflag, 0, 4.4, -5.83, 2.2, 4.4, { ry: 0 });
    S.prop("skeleton", -4.8, 0, 27.5, 0.6, { pose: "lying" });
    S.prop("skeleton", 5.2, 0, 26.2, 2.1, { pose: "reaching" });
    S.pickup("m3_note_eviction", 1, 4.6, 0.02, 25.4);
    D.papers(b, 0, 0, 24, 5, 18);
    S.light(0, 5.4, 26, 0xffd8a0, 10, 0.55);
    S.light(0, 5.4, 9, 0xffd8a0, 10, 0.4);
    // north end: freight elevator (west) — the loop arrival point
    b.box("steel", -6.5, 0, -5.84, -4, 3.0, -5.8, { seg: false });
    for (let k = 0; k < 6; k++)
      b.box(
        "steel",
        -6.4 + k * 0.42,
        0.05,
        -5.78,
        -6.3 + k * 0.42,
        2.95,
        -5.74,
        { seg: false, rz: 0.5 },
      );
    const fe = P.texMat(
      "helms_freight",
      P.signTex(
        "helms_freight",
        ["FREIGHT", "SERVICE ONLY"],
        "label",
        256,
        128,
      ),
      { rough: 0.8 },
    );
    b.quad(fe, -5.25, 3.35, -5.78, 1.0, 0.5, { ry: 0 });
    S.anchor("freight_lobby", -5.25, 0, -4.4, PI);
    S.anchor("lobby", 0, 0, 20, 0);
    S.anchor("checkpoint", 0, 0, CZ - 1, PI);
    S.anchor("spawn1", -3.5, 0, CZ - 4, PI);
    S.anchor("loot1", 4.2, 0, CZ - 2.0, 0);

    // =================== STAIR CORE (x 7..12.5, z -2..7) ===================
    const SX0 = 7,
      SX1 = 12.5,
      SZ0 = -2,
      SZ1 = 7;
    S.floor("concrete", SX0, SZ0, SX1, SZ1, 0);
    S.wallZ("concrete", SX1, SZ0, SZ1, 0, F3 + 4.4, 0.3, []);
    S.wallX("concrete", SZ0, SX0 - 0.15, SX1 + 0.15, 0, F3 + 4.4, 0.3, []);
    S.wallX("concrete", SZ1, SX0 - 0.15, SX1 + 0.15, 0, F3 + 4.4, 0.3, []);
    S.wallZ("concrete", SX0, SZ0, SZ1, LH, F2, 0.3, []);
    S.wallZ("concrete", SX0, SZ0, SZ1, F2 + 4.4, F3, 0.3, []);
    // flights & landings
    S.stairs("concrete", 11.3, 5.6, "n", 2.2, 0, 3.8, {
      rail: "iron",
      railSides: [-1],
      nosing: "steel",
    });
    S.floor("concrete", 7.3, -1.9, 12.4, 0.8, 3.8, { t: 0.25 });
    S.stairs("concrete", 8.6, 0.8, "s", 2.2, 3.8, F2, {
      rail: "iron",
      railSides: [1],
      nosing: "steel",
    });
    S.floor("concrete", 7.3, 5.6, 12.4, 6.9, F2, { t: 0.25 });
    S.floor("concrete", 6.85, 5.3, 7.5, 5.6, F2, { t: 0.25 });
    S.stairs("concrete", 11.3, 5.6, "n", 2.2, F2, F2 + 2.5, {
      rail: "iron",
      railSides: [-1],
      nosing: "steel",
    });
    S.floor("concrete", 7.3, -1.9, 12.4, 2.3, F2 + 2.5, { t: 0.25 });
    S.stairs("concrete", 8.6, 2.3, "s", 2.2, F2 + 2.5, F3, {
      rail: "iron",
      railSides: [1],
      nosing: "steel",
    });
    S.floor("concrete", 7.3, 5.6, 12.4, 6.9, F3, { t: 0.25 });
    S.floor("concrete", 6.85, 5.3, 7.5, 5.6, F3, { t: 0.25 });
    S.ceil("concrete", SX0, SZ0, SX1, SZ1, F3 + 4.4);
    // steel door frames + big floor numbers on the room side of both landing doors
    for (const [y, fk] of [
      [F2, "helms_fl2"],
      [F3, "helms_fl3"],
    ]) {
      for (const z of [5.22, 6.98])
        b.box("steel", 6.78, y, z - 0.08, 6.9, y + 2.7, z + 0.08, {
          seg: false,
        });
      b.box("steel", 6.78, y + 2.6, 5.14, 6.9, y + 2.75, 7.06, { seg: false });
      b.box("paint_red", 6.77, y + 1.2, 4.4, 6.79, y + 2.4, 5.05, {
        seg: false,
        noAO: true,
      });
    }
    for (const y of [2.8, 6.4, F2 + 2.2, F3 + 3.4]) {
      b.box("lamp_dim", 9.6, y + 0.9, 2.3, 10.2, y + 0.95, 2.7, { seg: false });
      S.light(9.9, y + 0.5, 2.5, 0xffe0b0, 7, 0.6);
    }
    const fl2 = P.texMat(
      "helms_fl2",
      P.signTex("helms_fl2", ["2"], "engraved", 128, 128),
      { rough: 0.8 },
    );
    const fl3 = P.texMat(
      "helms_fl3",
      P.signTex("helms_fl3", ["3"], "engraved", 128, 128),
      { rough: 0.8 },
    );
    b.quad(fl2, 12.33, F2 + 1.8, 6.2, 0.5, 0.5, { ry: -HP });
    b.quad(fl3, 12.33, F3 + 1.8, 6.2, 0.5, 0.5, { ry: -HP });
    b.quad(fl2, 6.76, F2 + 1.8, 4.72, 0.55, 0.55, { ry: -HP });
    b.quad(fl3, 6.76, F3 + 1.8, 4.72, 0.55, 0.55, { ry: -HP });
    S.anchor("stairs", 9.8, 0, 6, 0);

    // =================== FLOOR 2: railroad offices → barracks ===================
    const H2 = 4.4;
    S.room({
      x0: -12,
      z0: -6,
      x1: 7,
      z1: 24,
      y: F2,
      h: H2,
      wall: "plaster_green",
      floor: "linoleum",
      ceil: "plaster",
      trim: "wood_dark",
      skip: "e",
      surface: "wood",
    });
    const sky = skyCard();
    // private offices along the west windows: oak dado + reeded glass fronts (x -6), partitions at z 3 and 9
    for (const z of [3, 9])
      S.wallX("wood_oak", z, -11.85, -6, F2, F2 + 3.0, 0.12, []);
    S.wallZ("wood_oak", -6, -0.5, 13.5, F2, F2 + 1.1, 0.12, [
      [0.7, 1.7, 0, 1.1],
      [5.3, 6.3, 0, 1.1],
      [11.3, 12.3, 0, 1.1],
    ]);
    for (const [z0, z1] of [
      [-0.5, 0.7],
      [1.7, 5.3],
      [6.3, 11.3],
      [12.3, 13.5],
    ]) {
      b.box("glass", -6.03, F2 + 1.1, z0, -5.97, F2 + 2.7, z1, {
        seg: false,
        noAO: true,
      });
      S.col(-6.06, F2 + 1.1, z0, -5.94, F2 + 2.7, z1, { walkable: false });
    }
    b.box("wood_oak", -6.08, F2 + 2.7, -0.5, -5.92, F2 + 3.0, 13.5, {
      seg: false,
    });
    for (const [z0, z1] of [
      [-0.5, 0.7],
      [1.7, 5.3],
      [6.3, 11.3],
      [12.3, 13.5],
    ])
      for (let z = z0 + 0.6; z < z1; z += 0.6)
        b.box(
          "wood_oak",
          -6.05,
          F2 + 1.1,
          z - 0.03,
          -5.95,
          F2 + 2.7,
          z + 0.03,
          { seg: false },
        );
    for (const z of [3, 9, 13.5]) {
      const pl = P.texMat(
        "helms_door" + z,
        P.signTex(
          "helms_door" + z,
          [
            z === 3
              ? "SUPERINTENDENT"
              : z === 9
                ? "CHIEF DISPATCHER"
                : "TRAINMASTER",
          ],
          "engraved",
          256,
          64,
          { bg: "#c8c0a8" },
        ),
        { rough: 0.6 },
      );
      b.quad(
        pl,
        -5.9,
        F2 + 2.85,
        z === 3 ? 1.2 : z === 9 ? 5.8 : 11.8,
        0.8,
        0.2,
        { ry: HP },
      );
    }
    S.wallZ("plaster_green", 7, -6, 24, F2, F2 + H2, 0.3, [[5.3, 6.9, 0, 2.6]]);
    // windows (west & south): dark glass with daylight
    for (let z = -3; z <= 21; z += 4) {
      b.quad(sky, -11.83, F2 + 2.15, z, 1.6, 2.3, { ry: HP });
      b.box("wood_dark", -11.85, F2 + 0.9, z - 0.9, -11.7, F2 + 1.0, z + 0.9, {
        seg: false,
      });
      S.light(-10.8, F2 + 2.2, z, 0xd8dcc8, 6, 0.55);
    }
    for (let x = -9; x <= 4; x += 4.2) {
      b.quad(sky, x, F2 + 2.15, 23.83, 1.6, 2.3, { ry: PI });
      b.box("wood_dark", x - 0.9, F2 + 0.9, 23.7, x + 0.9, F2 + 1.0, 23.85, {
        seg: false,
      });
      S.light(x, F2 + 2.2, 22.8, 0xd8dcc8, 6, 0.6);
    }
    // the rail map & dispatch board (north wall)
    const rm = P.texMat("helms_railmap", P.railMapTex(), { rough: 0.8 });
    b.box("wood_dark", -9.2, F2 + 0.9, -5.86, 0.2, F2 + 4.0, -5.8, {
      seg: false,
    });
    b.quad(rm, -4.5, F2 + 2.45, -5.78, 9.0, 3.0, { ry: 0 });
    const disp = P.canvasTex(
      "m3_helms_disp",
      512,
      256,
      (ctx, w, h) => {
        const rr = P.rng("disp");
        ctx.fillStyle = "#10140e";
        ctx.fillRect(0, 0, w, h);
        ctx.font = "bold 18px monospace";
        ctx.fillStyle = "#e0c060";
        ctx.fillText("TRAIN   DEST          TRACK  STATUS", 12, 26);
        const rows = [
          ["20TH C LTD", "CHICAGO", "34", "CANCELLED"],
          ["EMPIRE ST", "BUFFALO", "27", "CANCELLED"],
          ["BERKSHIRE", "PITTSFIELD", "19", "CANCELLED"],
          ["ATOMIC 9", "NEWPORT NEWS", "41", "DIVERTED"],
          ["C.D. SPL", "SHELTER 9", "S-1", "BOARDING"],
          ["LAKE SHORE", "CLEVELAND", "30", "CANCELLED"],
        ];
        rows.forEach((row, i) => {
          ctx.fillStyle = row[3] === "BOARDING" ? "#80ff90" : "#e0c060";
          ctx.fillText(
            row[0].padEnd(8) +
              " " +
              row[1].padEnd(13) +
              " " +
              row[2].padEnd(6) +
              " " +
              row[3],
            12,
            60 + i * 30,
          );
        });
        for (let i = 0; i < 400; i++) {
          ctx.fillStyle = "rgba(0,0,0," + rr() * 0.5 + ")";
          ctx.fillRect(rr() * w, rr() * h, 3, 3);
        }
      },
      { clamp: true },
    );
    const dpk = P.texMat("helms_disp", disp, { rough: 0.6, emissive: 0.35 });
    b.box("continuity_black", 1.4, F2 + 1.4, -5.86, 6.2, F2 + 3.8, -5.8, {
      seg: false,
    });
    b.quad(dpk, 3.8, F2 + 2.6, -5.78, 4.6, 2.3, { ry: 0 });
    // desks in rows (old typewriters), file cabinets along the east wall
    // clerks' pool: desks spread through the open floor, typewriters, in-trays, fallen paper
    const DESKS = [
      [-3.8, 0.4],
      [-0.6, 0.4],
      [2.6, 0.8],
      [-3.8, 4.4],
      [-0.6, 4.6],
      [2.8, 4.8],
      [-3.6, 8.6],
      [-0.2, 9.0],
      [3.0, 9.4],
      [-9.2, 0.6],
      [-9.2, 6.2],
      [-9.4, 11.2],
    ];
    DESKS.forEach(([x, z], i) => {
      S.prop("desk", x, F2, z, PI, {
        loot: i % 2 ? "desk" : "file_cabinet",
        name: i >= 9 ? "Officer's Desk" : "Clerk's Desk",
      });
      if (i % 4 !== 1) {
        b.box(
          "iron",
          x - 0.3,
          F2 + 0.78,
          z - 0.2,
          x + 0.3,
          F2 + 0.95,
          z + 0.15,
          { seg: false },
        );
        b.box(
          "paper",
          x - 0.12,
          F2 + 0.95,
          z - 0.1,
          x + 0.12,
          F2 + 1.1,
          z - 0.08,
          { seg: false, rx: -0.3 },
        );
      }
      b.box(
        i % 3 ? "paper" : "steel",
        x + 0.35,
        F2 + 0.78,
        z - 0.25,
        x + 0.65,
        F2 + 0.84 + (i % 3) * 0.05,
        z + 0.05,
        { seg: false },
      );
      D.chair(b, x, F2, z + 0.8, PI + (r() - 0.5), {
        seat: "leather",
        wood: "wood_dark",
        toppled: i % 3 === 2,
      });
    });
    for (let k = 0; k < 6; k++)
      D.papers(b, -3 + (k % 3) * 3.5, F2, 2 + Math.floor(k / 3) * 6, 1.6, 10);
    for (const [x, z, ry] of [
      [-2.2, 6.8, 0.3],
      [1.2, 2.6, -1.2],
    ])
      S.prop("file_cabinet", x, F2, z, ry, { loot: "file_cabinet" });
    for (let k = 0; k < 5; k++)
      S.prop("file_cabinet", 6.4, F2, 9 + k * 0.9, -HP, {
        loot: "file_cabinet",
      });
    // barracks: bunks along the south, footlockers, mess table, Continuity flag
    for (let k = 0; k < 4; k++) {
      S.prop("bed", -10 + k * 3, F2, 21.8, 0, {});
      S.prop("footlocker", -10 + k * 3, F2, 20.2, PI, {
        loot: "continuity_crate",
        name: "Continuity Footlocker",
      });
    }
    b.box("continuity_black", 1, F2 + 0.74, 16, 5.6, F2 + 0.8, 18, {
      seg: false,
    });
    for (const x of [1.2, 5.4])
      for (const z of [16.2, 17.8])
        b.box("steel", x - 0.05, F2, z - 0.05, x + 0.05, F2 + 0.74, z + 0.05, {
          seg: false,
        });
    S.col(1, F2, 16, 5.6, F2 + 0.8, 18, { walkable: false });
    for (let k = 0; k < 6; k++)
      b.box(
        "steel",
        1.4 + k * 0.7,
        F2 + 0.8,
        16.8 + (k % 2) * 0.3,
        1.7 + k * 0.7,
        F2 + 0.84,
        17.1 + (k % 2) * 0.3,
        { seg: false },
      );
    for (let k = 0; k < 4; k++)
      D.chair(b, 1.8 + k * 1.2, F2, 15.4, 0, {
        seat: "continuity_black",
        wood: "steel",
      });
    b.quad(vflag, -11.82, F2 + 2.4, 15, 1.4, 3.0, { ry: HP });
    S.prop("radio", 3.2, F2 + 0.8, 17.6, 0, {});
    S.pickup("m3_reel_duty", 1, 4.8, F2 + 0.82, 16.4);
    S.prop("terminal", -9.2, F2 + 0.78, 6.0, PI, {
      terminalId: "m3_helms_barracks",
      mount: "bare",
    });
    for (const [x, z, on] of [
      [-6, 3, 1],
      [0, 3, 0],
      [-6, 12, 1],
      [0, 12, 1],
      [-6, 19, 0],
      [3, 19, 1],
    ]) {
      b.box(
        on ? "lamp" : "glass_dark",
        x - 1.0,
        F2 + H2 - 0.1,
        z - 0.1,
        x + 1.0,
        F2 + H2 - 0.04,
        z + 0.1,
        { seg: false },
      );
      if (on) S.light(x, F2 + H2 - 0.7, z, 0xe8f0e0, 8, 0.6);
    }
    S.anchor("barracks", -2, F2, 12, 0);
    S.anchor("spawn2", -4, F2, 14, 0);
    S.anchor("spawn3", 2.5, F2, 1.5, PI);
    S.anchor("loot2", -7, F2, 20.2, 0);

    // =================== FLOOR 3: command post ===================
    const H3 = 4.4;
    S.room({
      x0: -12,
      z0: -6,
      x1: 7,
      z1: 24,
      y: F3,
      h: H3,
      wall: "continuity_panel",
      floor: "panel",
      ceil: "panel",
      skip: "e",
      surface: "metal",
    });
    // old-world railroad office under the Continuity retrofit: oak dado and a wainscot rail survive below the steel panels
    for (const [x0, z0, x1, z1] of [
      [-11.85, -5.8, -11.75, 23.8],
      [-11.8, 23.75, 6.8, 23.85],
      [-11.8, -5.85, 6.8, -5.75],
    ])
      b.box("wood_oak", x0, F3, z0, x1, F3 + 1.0, z1, { seg: false });
    // power conduits and cable trays along the ceiling (Continuity install)
    for (const x of [-9, -3, 3]) {
      b.box(
        "continuity_black",
        x - 0.3,
        F3 + H3 - 0.35,
        -5.8,
        x + 0.3,
        F3 + H3 - 0.25,
        23.8,
        { seg: false },
      );
      b.rod(
        "rubber",
        [x - 0.15, F3 + H3 - 0.4, -5.8],
        [x - 0.15, F3 + H3 - 0.4, 23.8],
        0.04,
        5,
      );
      b.rod(
        "rubber",
        [x + 0.12, F3 + H3 - 0.42, -5.8],
        [x + 0.12, F3 + H3 - 0.42, 23.8],
        0.05,
        5,
      );
    }
    for (const z of [-1, 7, 15])
      b.rod(
        "continuity_black",
        [-11.8, F3 + H3 - 0.3, z],
        [6.8, F3 + H3 - 0.3, z],
        0.06,
        5,
      );
    const sky3 = skyCard();
    // tactical map wall (south of the radio bank): Manhattan with Continuity grease-pencil sectors
    const tac = P.texMat(
      "helms_tac",
      P.canvasTex(
        "m3_helms_tac",
        512,
        512,
        (ctx, w, h) => {
          const rr = P.rng("htac");
          ctx.fillStyle = "#d8d0b0";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = "#8aa0a0";
          ctx.fillRect(0, 0, w * 0.12, h);
          ctx.fillRect(w * 0.82, 0, w * 0.18, h);
          ctx.fillStyle = "#e8e0c4";
          ctx.beginPath();
          ctx.moveTo(w * 0.3, 0);
          ctx.lineTo(w * 0.7, 0);
          ctx.lineTo(w * 0.78, h * 0.6);
          ctx.lineTo(w * 0.55, h);
          ctx.lineTo(w * 0.25, h * 0.85);
          ctx.lineTo(w * 0.18, h * 0.3);
          ctx.fill();
          ctx.strokeStyle = "rgba(60,50,40,0.4)";
          ctx.lineWidth = 1;
          for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(w * 0.15, (i * h) / 20);
            ctx.lineTo(w * 0.85, (i * h) / 20 + 10);
            ctx.stroke();
          }
          for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(w * (0.25 + i * 0.07), 0);
            ctx.lineTo(w * (0.22 + i * 0.07), h);
            ctx.stroke();
          }
          ctx.fillStyle = "#6a8a50";
          ctx.fillRect(w * 0.36, h * 0.05, w * 0.2, h * 0.22);
          ctx.strokeStyle = "rgba(200,30,20,0.85)";
          ctx.lineWidth = 4;
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(
              w * (0.3 + rr() * 0.4),
              h * (0.2 + rr() * 0.6),
              14 + rr() * 20,
              0,
              TAU,
            );
            ctx.stroke();
          }
          ctx.strokeStyle = "rgba(30,50,160,0.9)";
          ctx.beginPath();
          ctx.arc(w * 0.52, h * 0.42, 50, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "rgba(30,50,160,0.9)";
          ctx.font = "bold 20px " + P.FONTS.SANS;
          ctx.fillText("RELAY 7", w * 0.46, h * 0.36);
          ctx.fillStyle = "rgba(200,30,20,0.9)";
          ctx.font = "bold 16px " + P.FONTS.SANS;
          ctx.fillText("BoS PATROL", w * 0.3, h * 0.75);
          ctx.fillText("MUTANTS", w * 0.58, h * 0.2);
          P.speckle(ctx, w, h, rr, 900);
        },
        { clamp: true },
      ),
      { rough: 0.8 },
    );
    b.box("continuity_black", 6.82, F3 + 0.9, 14.5, 6.9, F3 + 3.9, 21.5, {
      seg: false,
    });
    b.quad(tac, 6.8, F3 + 2.4, 18, 6.6, 2.9, { ry: -HP });
    // briefing area in front of the map: folding chairs in rows, a lectern
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 4; j++)
        D.chair(b, 1.2 + i * 1.1, F3, 15.8 + j * 1.1, HP + (r() - 0.5) * 0.3, {
          seat: "continuity_black",
          wood: "steel",
          toppled: i === 2 && j === 1,
        });
    b.box("continuity_black", 5.2, F3, 17.6, 5.8, F3 + 1.15, 18.4, {
      seg: false,
    });
    S.col(5.2, F3, 17.6, 5.8, F3 + 1.15, 18.4, { walkable: false });
    // cots along the west windows, Continuity crates with stencils
    for (let k = 0; k < 4; k++) {
      const z = 3.2 + k * 2.2;
      b.box("steel", -11.5, F3 + 0.4, z - 0.4, -9.5, F3 + 0.45, z + 0.4, {
        seg: false,
      });
      b.box(
        "canvas_green",
        -11.45,
        F3 + 0.45,
        z - 0.38,
        -9.55,
        F3 + 0.55,
        z + 0.38,
        { seg: false, c: 0x5a6a5a },
      );
      for (const [dx, dz] of [
        [-11.45, -0.35],
        [-9.55, -0.35],
        [-11.45, 0.35],
        [-9.55, 0.35],
      ])
        b.box(
          "steel",
          dx - 0.02,
          F3,
          z + dz - 0.02,
          dx + 0.02,
          F3 + 0.4,
          z + dz + 0.02,
          { seg: false },
        );
      S.col(-11.5, F3, z - 0.4, -9.5, F3 + 0.55, z + 0.4, { walkable: false });
    }
    const stencil = P.texMat(
      "helms_stencil",
      P.signTex(
        "helms_stencil",
        ["CONTINUITY", "MUNITIONS — HANDLE W/ CARE"],
        "label",
        256,
        96,
        { bg: "#3a4038" },
      ),
      { rough: 0.8 },
    );
    for (const [x, z, h] of [
      [-5.5, -1.8, 0.9],
      [-4.6, -1.8, 0.9],
      [-5.05, -1.8, 1.8],
    ]) {
      b.box(
        "continuity_panel",
        x - 0.42,
        F3 + h - 0.9,
        z - 0.4,
        x + 0.42,
        F3 + h,
        z + 0.4,
        { seg: false },
      );
      b.quad(stencil, x, F3 + h - 0.45, z + 0.41, 0.7, 0.26, { ry: 0 });
    }
    S.col(-5.95, F3, -2.2, -4.15, F3 + 1.8, -1.4, { walkable: false });
    for (let z = 1; z <= 21; z += 4)
      b.quad(sky3, -11.83, F3 + 2.15, z, 1.6, 2.3, { ry: HP });
    S.wallZ("continuity_panel", 7, -6, 24, F3, F3 + H3, 0.3, [
      [5.3, 6.9, 0, 2.6],
    ]);
    for (let z = 1; z <= 21; z += 4)
      S.light(-10.8, F3 + 2.2, z, 0xd8dcc8, 6, 0.45);
    // holographic tactical table (Manhattan in green light)
    b.box("continuity_black", -3.5, F3, 8.5, 1.5, F3 + 0.9, 12.5, {
      seg: false,
    });
    S.col(-3.5, F3, 8.5, 1.5, F3 + 0.95, 12.5, { walkable: false });
    b.box("holo", -3.3, F3 + 0.9, 8.7, 1.3, F3 + 0.95, 12.3, {
      seg: false,
      noAO: true,
    });
    for (let k = 0; k < 40; k++) {
      const x = -3.1 + r() * 4.2,
        z = 8.9 + r() * 3.2,
        h = 0.05 + r() * r() * 0.6;
      b.box(
        "holo",
        x - 0.07,
        F3 + 0.95,
        z - 0.07,
        x + 0.07,
        F3 + 0.95 + h,
        z + 0.07,
        { seg: false, noAO: true, noBake: true },
      );
    }
    b.box("lamp_red", -0.6, F3 + 0.95, 10.1, -0.4, F3 + 1.8, 10.3, {
      seg: false,
    });
    S.light(-1, F3 + 1.8, 10.5, 0x40ff90, 7, 0.9);
    S.glow(-1, F3 + 1.3, 10.5, 0x40ff90, 2.2);
    // radio bank along the north wall: consoles with screens & reels
    for (let k = 0; k < 6; k++) {
      const x = -10 + k * 2.3;
      b.box("continuity_black", x - 1.0, F3, -5.8, x + 1.0, F3 + 2.2, -5.0, {
        seg: false,
      });
      b.box(
        "continuity_black",
        x - 1.0,
        F3 + 0.8,
        -5.0,
        x + 1.0,
        F3 + 0.9,
        -4.5,
        { seg: false },
      );
      b.box(
        k % 3 === 1 ? "glass_dark" : "screen",
        x - 0.5,
        F3 + 1.25,
        -4.99,
        x + 0.5,
        F3 + 1.9,
        -4.97,
        { seg: false },
      );
      for (const dx of [-0.7, 0.7])
        b.cyl("steel", x + dx, F3 + 1.6, -4.96, 0.16, 0.16, 0.03, 12, {
          rx: HP,
        });
      D.chair(b, x, F3, -3.8, PI, { seat: "continuity_black", wood: "steel" });
    }
    S.col(-11.2, F3, -5.8, 3.8, F3 + 2.2, -4.5, { walkable: false });
    S.light(-4, F3 + 2, -4, 0x60ff90, 10, 0.7);
    S.prop("terminal", 4.6, F3 + 0.9, -5.1, 0, {
      terminalId: "m3_helms_comms",
      mount: "bare",
    });
    b.box("continuity_black", 3.8, F3, -5.8, 5.4, F3 + 0.9, -4.6, {
      seg: false,
    });
    S.col(3.8, F3, -5.8, 5.4, F3 + 0.9, -4.6, { walkable: false });
    // officer's office (south-west, glass partition)
    S.wallX("continuity_panel", 16, -12.15, -4, F3, F3 + H3, 0.2, [
      [-6.5, -5, 0, 2.5],
    ]);
    S.wallZ("continuity_panel", -4, 16, 24, F3, F3 + H3, 0.2, []);
    S.prop("desk", -8, F3, 20.5, 0, { loot: "desk", name: "Officer's Desk" });
    S.prop("terminal", -8, F3 + 0.78, 20.3, 0, {
      terminalId: "m3_helms_officer",
      mount: "bare",
    });
    S.prop("safe", -11.4, F3, 23.3, HP, {
      locked: 0,
      lock: P.LOCKS.officer_safe,
      name: "Officer's Safe",
      items: [
        ["scrip", 120],
        ["rally_tonic", 2],
        ["rally_tonic_extra", 1],
        ["focus_pills", 1],
      ],
    });
    b.quad(vflag, -8, F3 + 2.6, 23.82, 1.4, 2.8, { ry: PI });
    D.chair(b, -8, F3, 21.4, PI, {
      seat: "leather",
      wood: "steel",
      arms: true,
    });
    S.light(-8, F3 + 3.2, 19.5, 0xffe0b0, 7, 0.7);
    // armory cage (east side, x 2.8..6.8, z -2.5..3.5; gap in the west fence)
    for (let x = 2.8; x <= 6.8; x += 0.25)
      for (const z of [-2.5, 3.5])
        b.rod("iron", [x, F3, z], [x, F3 + 3, z], 0.01, 3);
    for (let z = -2.5; z <= 3.5; z += 0.25) {
      if (z > 1.3 && z < 2.6) continue;
      b.rod("iron", [2.8, F3, z], [2.8, F3 + 3, z], 0.01, 3);
    }
    b.rod("iron", [2.8, F3 + 3, -2.5], [6.8, F3 + 3, -2.5], 0.02, 3);
    b.rod("iron", [2.8, F3 + 3, 3.5], [6.8, F3 + 3, 3.5], 0.02, 3);
    b.rod("iron", [2.8, F3 + 3, -2.5], [2.8, F3 + 3, 3.5], 0.02, 3);
    S.col(2.8, F3, -2.55, 6.8, F3 + 3, -2.45, { walkable: false });
    S.col(2.8, F3, 3.45, 6.8, F3 + 3, 3.55, { walkable: false });
    S.col(2.75, F3, -2.5, 2.85, F3 + 3, 1.3, { walkable: false });
    S.col(2.75, F3, 2.6, 2.85, F3 + 3, 3.5, { walkable: false });
    S.prop("locker", 6.3, F3, 0, -HP, {
      locked: 0,
      lock: P.LOCKS.armory_locker,
      name: "Armory Locker",
      items: [
        ["m3_park_ave_express", 1],
        ["ammo_gyrojet", 24],
        ["riot_gas_grenade", 2],
      ],
    });
    S.prop("ammo_box", 6.1, F3, 2.7, -HP, { loot: "ammo_box", large: true });
    S.prop("crate", 6.1, F3, -1.7, 0.1, { kind: "military" });
    S.anchor("armory", 6.3, F3, 0, 0);
    // express elevator doors (west wall, north end) — to the crown
    b.box("bronze", -11.84, F3, -3.4, -11.8, F3 + 3.0, -0.6, { seg: false });
    b.box("gilt", -11.84, F3 + 3.0, -3.6, -11.78, F3 + 3.5, -0.4, {
      seg: false,
    });
    const ex = P.texMat(
      "helms_express",
      P.signTex(
        "helms_express",
        ["EXPRESS", "OBSERVATION · CROWN"],
        "brass",
        512,
        128,
      ),
      { rough: 0.5, metal: 0.4 },
    );
    b.quad(ex, -11.78, F3 + 3.25, -2, 1.9, 0.45, { ry: HP });
    S.anchor("express", -10.8, F3, -2, -HP);
    S.anchor("command", -1, F3, 14, 0);
    S.anchor("spawn4", -6, F3, 12, 0);
    S.anchor("spawn5", 3, F3, 8, PI);
    S.anchor("loot3", -11.4, F3, 23.3, 0);
    for (const [x, z] of [
      [-6, 3],
      [0, 5],
      [-6, 13],
      [3, 13],
    ]) {
      b.box(
        "lamp",
        x - 1.0,
        F3 + H3 - 0.1,
        z - 0.1,
        x + 1.0,
        F3 + H3 - 0.04,
        z + 0.1,
        { seg: false },
      );
      S.light(x, F3 + H3 - 0.7, z, 0xdde8ff, 8, 0.5);
    }

    // =================== CROWN: the relay room (y 60) ===================
    const RX = 9,
      RZ = 7,
      RWH = 3.2,
      RTOP = 13;
    S.floor("panel", -RX, -RZ, RX, RZ, CRY, { surface: "metal" });
    S.wallX("limestone", -RZ, -RX - 0.15, RX + 0.15, CRY, CRY + RWH, 0.3, []);
    S.wallX("limestone", RZ, -RX - 0.15, RX + 0.15, CRY, CRY + RWH, 0.3, []);
    S.wallZ("limestone", -RX, -RZ, RZ, CRY, CRY + RWH, 0.3, []);
    S.wallZ("limestone", RX, -RZ, RZ, CRY, CRY + RWH, 0.3, []);
    // the pyramid seen from inside: sloped copper-sheathed timber faces up to the lantern well
    b.inside(
      "wood",
      P.frustum(-RX, -RZ, RX, RZ, CRY + RWH, -2.6, -2.6, 2.6, 2.6, CRY + RTOP),
      null,
      { grime: 0.5 },
    );
    // work lights clamped to the rafters so the pyramid's timber underside reads (it was a black void)
    for (const [x, z] of [
      [-5.2, -4.2],
      [5.2, -4.2],
      [-5.2, 4.2],
      [5.2, 4.2],
    ]) {
      S.light(x, CRY + 6.5, z, 0xffd8a8, 9, 0.7);
      b.box(
        "lamp_dim",
        x - 0.15,
        CRY + 6.4,
        z - 0.15,
        x + 0.15,
        CRY + 6.6,
        z + 0.15,
        { seg: false },
      );
    }
    for (let k = 0; k < 6; k++) {
      const t = (k + 0.5) / 6;
      const hx = RX + (2.6 - RX) * t,
        hz = RZ + (2.6 - RZ) * t,
        y = CRY + RWH + (RTOP - RWH) * t;
      b.box("wood_dark", -hx, y - 0.15, -hz, hx, y + 0.15, -hz + 0.25, {
        seg: false,
      });
      b.box("wood_dark", -hx, y - 0.15, hz - 0.25, hx, y + 0.15, hz, {
        seg: false,
      });
      b.box("wood_dark", -hx, y - 0.15, -hz, -hx + 0.25, y + 0.15, hz, {
        seg: false,
      });
      b.box("wood_dark", hx - 0.25, y - 0.15, -hz, hx, y + 0.15, hz, {
        seg: false,
      });
    }
    // dormer windows set in the slopes: framed openings (reveal, sill, gilt mullions) with the city beyond, gold floodlight spill
    const sky4 = skyCard();
    for (const [x, z, ry] of [
      [-3.5, 5.6, 0],
      [3.5, 5.6, 0],
      [-3.5, -5.6, PI],
      [3.5, -5.6, PI],
      [7.4, 0, HP],
      [-7.4, 0, -HP],
    ]) {
      const m = P.m4(x, CRY + 4.2, z, ry);
      b.geo(
        "limestone",
        new THREE.BoxGeometry(1.5, 0.12, 0.55).translate(0, 0, 0.12),
        m,
      ); // sill
      b.geo(
        "limestone",
        new THREE.BoxGeometry(1.5, 0.12, 0.55).translate(0, 1.7, 0.12),
        m,
      ); // head
      for (const sx of [-1, 1])
        b.geo(
          "limestone",
          new THREE.BoxGeometry(0.14, 1.8, 0.55).translate(
            sx * 0.68,
            0.85,
            0.12,
          ),
          m,
        ); // cheeks
      b.geo(
        sky4,
        new THREE.PlaneGeometry(1.22, 1.6).rotateY(PI).translate(0, 0.85, 0.38),
        m,
        { uv: "keep", noAO: true },
      );
      b.geo(
        "gilt",
        new THREE.BoxGeometry(0.05, 1.6, 0.05).translate(0, 0.85, 0.34),
        m,
        { noAO: true },
      );
      b.geo(
        "gilt",
        new THREE.BoxGeometry(1.22, 0.05, 0.05).translate(0, 1.05, 0.34),
        m,
        { noAO: true },
      );
      S.light(x * 0.85, CRY + 4.6, z * 0.85, 0xffc860, 6, 0.55);
    }
    // catwalk ring around the core at the springing of the slopes, hip rafters up to the lantern well
    for (const [a, c] of [
      [
        [-RX + 0.2, CRY + RWH, -RZ + 0.2],
        [-2.6, CRY + RTOP, -2.6],
      ],
      [
        [RX - 0.2, CRY + RWH, -RZ + 0.2],
        [2.6, CRY + RTOP, -2.6],
      ],
      [
        [-RX + 0.2, CRY + RWH, RZ - 0.2],
        [-2.6, CRY + RTOP, 2.6],
      ],
      [
        [RX - 0.2, CRY + RWH, RZ - 0.2],
        [2.6, CRY + RTOP, 2.6],
      ],
    ])
      b.rod("wood_dark", a, c, 0.16, 5, { square: true });
    const CW = CRY + 6.2;
    for (const [x0, z0, x1, z1] of [
      [-3.2, -3.2, 3.2, -2.4],
      [-3.2, 2.4, 3.2, 3.2],
      [-3.2, -2.4, -2.4, 2.4],
      [2.4, -2.4, 3.2, 2.4],
    ])
      b.box("panel", x0, CW - 0.06, z0, x1, CW, z1, { seg: false, grime: 0.7 });
    for (const [x, z] of [
      [-3.1, -3.1],
      [3.1, -3.1],
      [-3.1, 3.1],
      [3.1, 3.1],
    ])
      b.rod("steel", [x, CRY, z], [x, CW, z], 0.05, 5);
    for (const q of [
      [
        [-3.2, -3.2],
        [3.2, -3.2],
      ],
      [
        [3.2, -3.2],
        [3.2, 3.2],
      ],
      [
        [3.2, 3.2],
        [-3.2, 3.2],
      ],
      [
        [-3.2, 3.2],
        [-3.2, -3.2],
      ],
    ])
      b.rod(
        "steel",
        [q[0][0], CW + 1.0, q[0][1]],
        [q[1][0], CW + 1.0, q[1][1]],
        0.025,
        4,
      );
    // limestone pilasters + cable trays on the drum walls (the room read as a plain box)
    for (const x of [-6, -3, 3, 6])
      for (const sz of [-1, 1])
        b.box(
          "limestone",
          x - 0.25,
          CRY,
          sz * RZ - sz * 0.22,
          x + 0.25,
          CRY + RWH,
          sz * RZ - sz * 0.02,
          { seg: false },
        );
    for (const z of [-3.5, 3.5])
      for (const sx of [-1, 1])
        b.box(
          "limestone",
          sx * RX - sx * 0.22,
          CRY,
          z - 0.25,
          sx * RX - sx * 0.02,
          CRY + RWH,
          z + 0.25,
          { seg: false },
        );
    for (const sz of [-1, 1])
      b.box(
        "continuity_black",
        -8.6,
        CRY + 2.75,
        sz * (RZ - 0.35) - 0.12,
        8.6,
        CRY + 2.85,
        sz * (RZ - 0.35) + 0.12,
        { seg: false },
      );
    // lantern well: gold light pouring down
    b.box("lamp_gold", -2.6, CRY + RTOP - 0.05, -2.6, 2.6, CRY + RTOP, 2.6, {
      seg: false,
    });
    S.light(0, CRY + RTOP - 2, 0, 0xffd080, 14, 0.8);
    // the transmitter core: plinth, column, glowing coil rings, cable fan
    b.cyl("continuity_black", 0, CRY, 0, 2.0, 2.2, 0.5, 16);
    S.col(-2, CRY, -2, 2, CRY + 0.5, 2, { surface: "metal" });
    b.cyl("steel", 0, CRY + 0.5, 0, 0.7, 0.9, 5.5, 14);
    b.cyl("continuity_black", 0, CRY + 6.0, 0, 0.4, 0.7, 2.0, 12);
    b.rod("steel", [0, CRY + 8, 0], [0, CRY + RTOP, 0], 0.12, 6);
    S.col(-0.9, CRY + 0.5, -0.9, 0.9, CRY + 6, 0.9, { walkable: false });
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU;
      b.rod(
        "rubber",
        [Math.cos(a) * 0.8, CRY + 4.5, Math.sin(a) * 0.8],
        [Math.cos(a) * 7.5, CRY + 0.05, Math.sin(a) * 5.5],
        0.05,
        4,
        { noAO: true },
      );
    }
    // equipment racks around the walls, blinking panels
    for (const [x, z, ry] of [
      [-6.5, -6.3, 0],
      [-3.5, -6.3, 0],
      [3.5, -6.3, 0],
      [6.5, -6.3, 0],
      [8.3, -3.5, -HP],
      [8.3, 3.5, -HP],
      [-8.3, 4, HP],
      [5.5, 6.3, PI],
      [-5.5, 6.3, PI],
    ]) {
      const m = P.m4(x, CRY, z, ry);
      b.geo(
        "continuity_black",
        new THREE.BoxGeometry(1.8, 2.6, 0.8).translate(0, 1.3, 0),
        m,
      );
      for (let k = 0; k < 5; k++)
        b.geo(
          r() < 0.3 ? "lamp_red" : r() < 0.6 ? "screen" : "glass_dark",
          new THREE.BoxGeometry(1.2, 0.18, 0.02).translate(
            0,
            0.5 + k * 0.4,
            0.41,
          ),
          m,
          { noAO: true },
        );
      S.colR(x, z, 1.8, 0.8, CRY, CRY + 2.6, ry, { walkable: false });
    }
    // relay console (south of the core) + a warning placard
    b.box("continuity_black", -1.6, CRY, 3.6, 1.6, CRY + 1.0, 4.4, {
      seg: false,
    });
    S.col(-1.6, CRY, 3.6, 1.6, CRY + 1.0, 4.4, { walkable: false });
    b.box("continuity_panel", -1.6, CRY + 1.0, 3.6, 1.6, CRY + 1.25, 4.2, {
      seg: false,
      rx: -0.3,
    });
    S.prop("terminal", 0, CRY + 1.0, 4.0, PI, {
      terminalId: "m3_helms_relay",
      mount: "bare",
    });
    const warn = P.texMat(
      "helms_warn",
      P.signTex(
        "helms_warn",
        ["RELAY 7 — CONTINUITY SIGNALS", "DANGER: HIGH VOLTAGE / RF"],
        "label",
        512,
        160,
        { bg: "#e0c030" },
      ),
      { rough: 0.7 },
    );
    b.quad(warn, 0, CRY + 2.2, 0.92, 1.5, 0.47, { ry: 0 });
    // emergency lights + the core glow (P.helmsRelay animates/changes them)
    S.light(0, CRY + 3, 0, 0x5aa0ff, 12, 1.1);
    S.light(-7, CRY + 2.8, -5, 0xff3020, 7, 0.6);
    S.light(7, CRY + 2.8, 5, 0xff3020, 7, 0.6);
    // door housings: express elevator (north), terrace hatch (south), freight elevator (west)
    b.box("bronze", -1.3, CRY, -6.84, 1.3, CRY + 2.6, -6.8, { seg: false });
    b.box("steel", -1.0, CRY, 6.8, 1.0, CRY + 2.4, 6.84, { seg: false });
    b.box("lamp_red", -0.1, CRY + 2.5, 6.8, 0.1, CRY + 2.62, 6.84, {
      seg: false,
    });
    b.box("steel", -8.84, CRY, -1.2, -8.8, CRY + 2.6, 1.2, { seg: false });
    const tr = P.texMat(
      "helms_terrace",
      P.signTex(
        "helms_terrace",
        ["CROWN TERRACE", "AUTHORIZED PERSONNEL"],
        "label",
        512,
        128,
      ),
      { rough: 0.8 },
    );
    b.quad(tr, 0, CRY + 2.85, 6.82, 1.6, 0.4, { ry: PI });
    b.quad(fe, -8.82, CRY + 2.9, 0, 1.0, 0.5, { ry: HP });
    S.anchor("relay", 0, CRY, 3, PI);
    S.anchor("relay_console", 0, CRY, 5.1, PI);
    S.anchor("boss", -3, CRY, 2.5, PI);
    S.anchor("spawn6", 4.5, CRY, 2, PI);
    S.anchor("crown_guard", 2.2, CRY, -4.6, PI);
    S.anchor("crown_express", 0, CRY, -5.6, PI);
    S.anchor("crown_terrace_door", 0, CRY, 5.8, 0);
    S.anchor("crown_freight", -7.7, CRY, 0, -HP);
    S.anchor("loot4", 6.5, CRY, -5.4, 0);
    S.prop("ammo_box", 6.5, CRY, -5.2, PI, { loot: "ammo_box" });
    S.prop("first_aid", 8.7, CRY + 1.2, 1.0, -HP, {
      wall: true,
      loot: "first_aid",
    });

    S.build({ interior: true });
    P.addInterior("helmsley", S.root);

    // ---- animated relay core: rotating coil rings (own materials so the content file can power them down / re-tune) ----
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a40,
      emissive: 0x5aa0ff,
      emissiveIntensity: 1.8,
      roughness: 0.3,
      metalness: 0.4,
    });
    const rings = new THREE.Group();
    rings.position.set(S.ox, S.oy + CRY, S.oz);
    rings.name = "m3_helms_rings";
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(1.05 + k * 0.08, 0.07, 6, 32),
        ringMat,
      );
      m.rotation.x = HP;
      m.position.y = 1.4 + k * 1.1;
      rings.add(m);
    }
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), ringMat);
    orb.position.y = 7.4;
    rings.add(orb);
    S.root.add(rings);
    let glow = null;
    P.safe("relayGlow", () => {
      if (!G.isStub("fx") && G.fx.glowSprite)
        glow = G.fx.glowSprite(
          new THREE.Vector3(S.ox, S.oy + CRY + 4, S.oz),
          0x5aa0ff,
          5,
          { parent: S.root, intensity: 1.2, dayFactor: 1 },
        );
    });
    P.helmsRelay = { rings, ringMat, orb, glow, elev };
    return S;
  }

  // ===================================================================
  // Doors & registration (called from 20_helmsley.js via P.finishSite)
  // ===================================================================
