// play-inline-276 03 — box
// Lines 109-759 of readable/play-inline-276.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("bellamys_ext", { grime: 0.55 });
    const b = S.b;
    b.box("sidewalk", 210.1, 0, -454.9, 269.9, 0.03, -417.1, {
      segLen: 8,
      grime: 0.6,
      noAO: true,
    });
    // base core is inset 1.6 m behind the two show fronts so the display windows can be real recesses
    b.box("deco_black", X0 - 0.15, 0, Z0 - 0.15, X1 - 1.6, BASE, Z1 - 1.6, {
      segLen: 6,
    });
    b.box("brick_roman", X0, BASE, Z0, X1, TOP, Z1, { segLen: 6 });
    S.col(X0, 0, Z0, X1, CROWN, Z1);
    // ---------- limestone-pier facades (south + east are the show fronts) ----------
    const deco = (side, a0, a1, c, o) => {
      o = o || {};
      const F = P.face(S, side, a0, a1, c);
      F.band("limestone_warm", BASE - 0.1, BASE + 0.6, 0, 0.5);
      // piers + window strips + spandrels
      const step = 2.9,
        n = Math.floor((F.len - 1) / step);
      const u0 = (F.len - n * step) / 2;
      for (let i = 0; i <= n; i++) {
        const u = u0 + i * step;
        if (o.skip && o.skip(u)) continue;
        F.box(
          "limestone_warm",
          u - 0.36,
          u + 0.36,
          BASE + 0.6,
          TOP + (i % 2 ? 0.8 : 1.6),
          0,
          0.42,
          { segLen: 4 },
        );
        F.box(
          "limestone_warm",
          u - 0.46,
          u + 0.46,
          TOP + (i % 2 ? 0.8 : 1.6),
          TOP + (i % 2 ? 1.1 : 2.4),
          0,
          0.5,
          { seg: false },
        );
        if (i === n) break;
        const um = u + step / 2;
        if (o.skip && o.skip(um)) continue;
        for (let f = 0; f < 8; f++) {
          const y = BASE + 1.2 + f * 3.3,
            q = P.rng(um * 3 + f + c)();
          F.box(
            q < 0.18 ? "glass_broken" : q < 0.24 ? "wood_rotten" : "glass_dark",
            um - 1.08,
            um + 1.08,
            y,
            y + 2.2,
            -0.05,
            0.02,
            { seg: false, grime: 0.1, noAO: true },
          );
          F.box("iron", um - 0.02, um + 0.02, y, y + 2.2, 0.02, 0.06, {
            seg: false,
          });
          F.box("spandrel", um - 1.1, um + 1.1, y + 2.2, y + 3.3, 0.0, 0.08, {
            seg: false,
            uv: "box",
          });
        }
      }
      // zig-zag frieze + parapet
      F.box("frieze", -0.2, F.len + 0.2, TOP - 1.2, TOP, 0, 0.3, { segLen: 4 });
      F.box("limestone_warm", -0.3, F.len + 0.3, TOP, TOP + 0.35, 0, 0.6, {
        seg: false,
      });
      F.box(
        "limestone_warm",
        -0.1,
        F.len + 0.1,
        TOP + 0.35,
        CROWN - 0.6,
        -0.4,
        0.1,
        { segLen: 4 },
      );
      F.box(
        "limestone_warm",
        -0.2,
        F.len + 0.2,
        CROWN - 0.6,
        CROWN - 0.3,
        -0.4,
        0.3,
        { seg: false },
      );
      return F;
    };
    const FS = deco("s", X0, X1, Z1, { seed: 3 });
    const FE = deco("e", Z0, Z1, X1, { seed: 5 });
    /** Polished-granite base skin along a show front, leaving the given openings [u0,u1] as recesses. */
    const baseSkin = (F, openings) => {
      const ops = openings.slice().sort((a, c) => a[0] - c[0]);
      let cur = -0.15;
      for (const [a, c] of ops) {
        if (a > cur)
          F.box("deco_black", cur, a, 0, BASE, -1.6, 0.15, { segLen: 3 });
        F.box("deco_black", a, c, 0, 0.6, -1.6, 0.15, { seg: false });
        F.box("deco_black", a, c, 4.75, BASE, -1.6, 0.15, { seg: false });
        cur = c;
      }
      if (cur < F.len + 0.15)
        F.box("deco_black", cur, F.len + 0.15, 0, BASE, -1.6, 0.15, {
          segLen: 3,
        });
    };
    baseSkin(FS, [
      [2.5, 7.5],
      [9, 14],
      [15.5, 20.5],
      [23.5, 34.5],
      [37.5, 42.5],
      [44, 49],
    ]);
    baseSkin(FE, [
      [11, 16],
      [17.5, 22.5],
      [24, 29],
      [30.5, 35.5],
    ]);
    // north + west (plainer brick, punched windows)
    for (const [side, a0, a1, c] of [
      ["n", X0, X1, Z0],
      ["w", Z0, Z1, X0],
    ]) {
      const F = P.face(S, side, a0, a1, c);
      F.band("limestone_warm", BASE - 0.1, BASE + 0.4, 0, 0.3);
      F.box("limestone_warm", -0.2, F.len + 0.2, TOP, TOP + 0.4, 0, 0.4, {
        seg: false,
      });
      const bays = [];
      for (let u = 2.2; u < F.len - 2; u += 3.2) bays.push(u);
      P.windowGrid(
        F,
        bays,
        [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({
          y: BASE + 1.4 + f * 3.3,
          h: 1.9,
        })),
        {
          sill: "limestone_warm",
          frame: "iron",
          broken: 0.3,
          boarded: 0.1,
          seed: c,
          w: 1.4,
        },
      );
      // painted wall ad (faded)
      if (side === "w") {
        const ad = P.texMat(
          "bl_wallad",
          P.signTex(
            "bl_wallad",
            ["Bellamy's", "WHERE NEW YORK", "DRESSES UP"],
            "plain",
            512,
            256,
            {
              bg: "#5a4a3a",
              fg: "rgba(230,220,200,0.75)",
              font: P.FONTS.SERIF,
            },
          ),
          {},
        );
        F.quad(ad, 18, 24, 16, 8, 0.05);
      }
    }
    // ---------- stepped corner tower (Lex & 59th) ----------
    const CX = X1 - 5.5,
      CZ = Z1 - 5.5;
    b.box("limestone_warm", CX - 6, TOP, CZ - 6, CX + 6.2, 39.5, CZ + 6.2, {
      segLen: 3,
    });
    b.box("limestone_warm", CX - 4, 39.5, CZ - 4, CX + 4.2, 44, CZ + 4.2, {
      segLen: 3,
    });
    b.box("limestone_warm", CX - 2.5, 44, CZ - 2.5, CX + 2.7, 46.5, CZ + 2.7, {
      seg: false,
    });
    for (const [W, y0, y1] of [
      [6.2, TOP, 39.5],
      [4.2, 39.5, 44],
    ]) {
      for (let k = -2; k <= 2; k++) {
        const t = (k / 2) * (W - 0.8);
        b.box(
          "limestone_warm",
          CX + t - 0.25,
          y0,
          CZ + W,
          CX + t + 0.25,
          y1 + 0.8,
          CZ + W + 0.35,
          { seg: false },
        );
        b.box(
          "limestone_warm",
          CX + W,
          y0,
          CZ + t - 0.25,
          CX + W + 0.35,
          y1 + 0.8,
          CZ + t + 0.25,
          { seg: false },
        );
        if (Math.abs(k) < 2) {
          b.box(
            "glass_dark",
            CX + t + 0.35,
            y0 + 1,
            CZ + W - 0.02,
            CX + t + (W - 0.8) / 2 - 0.35,
            y1 - 1,
            CZ + W + 0.02,
            { seg: false },
          );
          b.box(
            "glass_dark",
            CX + W - 0.02,
            y0 + 1,
            CZ + t + 0.35,
            CX + W + 0.02,
            y1 - 1,
            CZ + t + (W - 0.8) / 2 - 0.35,
            { seg: false },
          );
        }
      }
    }
    S.col(CX - 6, TOP, CZ - 6, CX + 6.2, 46.5, CZ + 6.2, { walkable: false });
    b.rod("iron", [CX, 46.5, CZ], [CX, 54, CZ], 0.07, 5);
    const flag = P.texMat(
      "bl_flag",
      P.signTex("bl_flag", ["MANNEQUINS"], "raider", 256, 128, {
        fg: "#c42a1e",
      }),
      { double: true, transparent: true },
    );
    b.quad("canvas", CX + 1.1, 52.7, CZ, 2.2, 1.4, { ry: 0, uv: "box" });
    b.quad(flag, CX + 1.1, 52.7, CZ + 0.01, 2.2, 1.4, {});
    // chamfered corner at street level: the Lex & 59th doors
    // ---------- vertical blade sign on the corner ----------
    {
      const tex = P.canvasTex(
        "bl_blade",
        128,
        1024,
        (ctx, w, h) => {
          ctx.fillStyle = "#121214";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#e8e4dc";
          ctx.lineWidth = 6;
          ctx.strokeRect(8, 8, w - 16, h - 16);
          const L = "BELLAMY'S".split("");
          ctx.fillStyle = "#f0ece2";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "bold 64px " + P.FONTS.DECO;
          L.forEach((ch, i) =>
            ctx.fillText(ch, w / 2, 60 + i * ((h - 120) / (L.length - 1))),
          );
          const r = P.rng("blade");
          for (let i = 0; i < 60; i++) {
            ctx.fillStyle = "rgba(0,0,0," + r() * 0.5 + ")";
            ctx.fillRect(r() * w, r() * h, 6 + r() * 20, 4 + r() * 30);
          }
        },
        { clamp: true },
      );
      const bm = P.texMat("bl_blade", tex, { emissive: 0.55 });
      const bx = X1 + 1.3,
        bz = Z1 + 1.3,
        ry = PI / 4;
      void ry;
      b.box("iron", bx - 1.15, 8.5, bz - 0.14, bx + 1.15, 30.5, bz + 0.14, {
        ry: -PI / 4,
        seg: false,
      });
      const k = Math.SQRT1_2 * 0.16;
      b.quad(bm, bx - k, 19.5, bz + k, 2.2, 20, { ry: -PI / 4, noBake: true });
      b.quad(bm, bx + k, 19.5, bz - k, 2.2, 20, {
        ry: PI * 0.75,
        noBake: true,
      });
      for (let y = 10; y < 30; y += 4)
        b.rod("iron", [X1 - 0.2, y, Z1 - 0.2], [bx, y, bz], 0.05, 4);
      S.glow(bx, 20, bz, 0xf0f0ff, 3.2, { dayFactor: 0.2 });
    }
    // ---------- the logo on the roof: a script "B" in a black circle ----------
    {
      const tex = P.canvasTex(
        "bl_bdisc",
        512,
        512,
        (ctx, w, h) => {
          ctx.fillStyle = "#101012";
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#f2eee6";
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 26, 0, TAU);
          ctx.stroke();
          // the script capital B (slanted serif, a swash tail sweeping under it)
          ctx.fillStyle = "#f2eee6";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = 'italic 330px Georgia, "Times New Roman", serif';
          ctx.fillText("B", w / 2 + 6, h / 2 - 4);
          ctx.strokeStyle = "#f2eee6";
          ctx.lineCap = "round";
          ctx.lineWidth = 13;
          ctx.beginPath();
          ctx.moveTo(w * 0.25, h * 0.73);
          ctx.bezierCurveTo(
            w * 0.42,
            h * 0.81,
            w * 0.6,
            h * 0.67,
            w * 0.79,
            h * 0.75,
          );
          ctx.stroke();
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(w * 0.34, h * 0.27);
          ctx.bezierCurveTo(
            w * 0.28,
            h * 0.2,
            w * 0.2,
            h * 0.24,
            w * 0.22,
            h * 0.31,
          );
          ctx.stroke();
          const r = P.rng("bdisc");
          for (let i = 0; i < 40; i++) {
            ctx.fillStyle = "rgba(40,30,20," + r() * 0.5 + ")";
            ctx.fillRect(r() * w, r() * h, 10 + r() * 40, 6 + r() * 20);
          }
        },
        { clamp: true },
      );
      const dm = P.texMat("bl_bdisc", tex, {
        emissive: 0.6,
        transparent: true,
        alphaTest: 0.2,
      });
      const x = 236,
        z = -433,
        y = CROWN + 5.5;
      for (const s of [-1, 1]) {
        b.rod(
          "rust",
          [x + s * 3, TOP, z + 1],
          [x + s * 2.5, y + 1, z + 0.2],
          0.1,
          4,
          { square: true },
        );
        b.rod(
          "rust",
          [x + s * 3, TOP, z - 2],
          [x + s * 2.5, y, z + 0.2],
          0.08,
          4,
          { square: true },
        );
      }
      b.rod("rust", [x - 3, y - 3, z + 0.2], [x + 3, y - 3, z + 0.2], 0.08, 4, {
        square: true,
      });
      b.quad(dm, x, y, z + 0.35, 9, 9, { rz: 0.12, noBake: true });
      b.torus("neon_b", x, y, z + 0.4, 4.3, 0.07, TAU * 0.78, {
        rz: 0.6,
        ts: 40,
        rs: 4,
      });
      S.glow(x, y, z + 1.0, 0xffe8f0, 5.5, { dayFactor: 0.15 });
    }
    // ---------- street level: display windows, awnings, entrances ----------
    const shopfront = (F, u, w, o) => {
      o = o || {};
      // deep display box behind the glass: back wall, floor, lamp strip, mannequins
      const dd = 1.4;
      F.box("deco_black", u - w / 2 - 0.25, u + w / 2 + 0.25, 0, 0.6, 0, 0.12, {
        seg: false,
      });
      F.box(
        o.boarded ? "wood_rotten" : "glass",
        u - w / 2,
        u + w / 2,
        0.6,
        4.6,
        -0.02,
        0.02,
        { seg: false, noAO: true, grime: 0.2 },
      );
      if (o.broken)
        F.box("glass_broken", u - w / 2, u + w / 2, 0.6, 4.6, -0.03, -0.01, {
          seg: false,
        });
      F.box("bronze", u - w / 2 - 0.1, u + w / 2 + 0.1, 4.6, 4.75, -0.05, 0.1, {
        seg: false,
      });
      for (const s of [-1, 1])
        F.box(
          "bronze",
          u + s * (w / 2 + 0.05) - 0.06,
          u + s * (w / 2 + 0.05) + 0.06,
          0.6,
          4.6,
          -0.05,
          0.08,
          { seg: false },
        );
      F.box("parquet", u - w / 2, u + w / 2, 0.55, 0.6, -dd, 0, { seg: false });
      F.box(
        o.back || "velvet",
        u - w / 2,
        u + w / 2,
        0.6,
        4.6,
        -dd - 0.05,
        -dd,
        { seg: false },
      );
      F.box(
        "lamp_warm",
        u - w / 2 + 0.2,
        u + w / 2 - 0.2,
        4.5,
        4.56,
        -dd + 0.2,
        -0.3,
        { seg: false },
      );
      const r = P.rng(u * 7 + F.c);
      for (let k = 0; k < (o.n || 2); k++) {
        const p = F.pt(
          u - w / 2 + ((k + 0.7) * w) / ((o.n || 2) + 0.4),
          -dd * 0.55,
        );
        const poses = ["stand", "hip", "wave", "headless"];
        X.mannequin(b, p[0], 0.6, p[1], F.ry + (r() - 0.5) * 0.6, {
          pose: poses[Math.floor(r() * 4)],
          dress: ["velvet", "fabric", "fabric_pink", "awning"][
            Math.floor(r() * 4)
          ],
          skirt: r() < 0.5,
          wig: r() < 0.4 ? "hide_dark" : null,
        });
      }
      const lp = F.pt(u, -0.6);
      S.glow(lp[0], 3.8, lp[1], 0xffe0b0, 1.3, { dayFactor: 0.3 });
      X.awning(S, F, u, 5.6, w + 0.6, {
        text: "bellamy's",
        depth: 1.7,
        drop: 0.95,
      });
    };
    // south front (59th St): 5 display windows + the main entrance in the middle
    {
      const F = FS,
        uc = 29;
      for (const u of [5, 11.5, 18, 40, 46.5])
        shopfront(F, u, 5.0, { broken: u === 11.5, boarded: u === 46.5, n: 2 });
      // main entrance: deco surround, bronze revolving door, marquee
      F.box("limestone_warm", uc - 5.5, uc + 5.5, 0, BASE + 0.6, 0, 0.7);
      for (let k = -4; k <= 4; k++)
        F.box(
          "limestone_warm",
          uc + k * 1.2 - 0.18,
          uc + k * 1.2 + 0.18,
          0,
          BASE,
          0.7,
          0.85,
          { seg: false },
        );
      F.box("glass_dark", uc - 4.2, uc + 4.2, 0.02, 4.6, 0.7, 0.72, {
        seg: false,
      });
      const rp = F.pt(uc, 1.8);
      b.cyl("glass", rp[0], 0, rp[1], 1.3, 1.3, 2.8, 16, {
        open: true,
        noAO: true,
      });
      b.cyl("bronze", rp[0], 2.8, rp[1], 1.4, 1.4, 0.3, 16);
      b.cyl("bronze", rp[0], 0, rp[1], 1.4, 1.4, 0.08, 16);
      for (let k = 0; k < 4; k++) {
        const a = k * HP + 0.4;
        b.box(
          "bronze",
          rp[0] - 0.03,
          0.05,
          rp[1] - 1.25,
          rp[0] + 0.03,
          2.8,
          rp[1],
          { ry: a, seg: false },
        );
      }
      S.colR(rp[0], rp[1], 2.4, 2.4, 0, 2.8, 0, { walkable: false });
      for (const s of [-1, 1]) {
        const p = F.pt(uc + s * 3, 0.9);
        b.box(
          "bronze",
          p[0] - 0.8,
          0.02,
          p[1] - 0.05,
          p[0] + 0.8,
          3.0,
          p[1] + 0.05,
          { seg: false },
        );
      }
      // marquee
      F.box("deco_black", uc - 6, uc + 6, 4.9, 5.9, 0.7, 3.4, { seg: false });
      F.box("bronze", uc - 6.1, uc + 6.1, 5.9, 6.05, 0.6, 3.5, { seg: false });
      const mq = P.texMat(
        "bl_marquee",
        P.signTex("bl_marquee", ["BELLAMY'S"], "gilt", 1024, 96, {
          font: P.FONTS.DECO,
        }),
        { emissive: 0.35 },
      );
      F.quad(mq, uc, 5.4, 11.4, 0.85, 3.42);
      const lx = F.pt(uc, 3.42);
      S.glow(lx[0], 5.4, lx[1], 0xffd890, 2.6, { dayFactor: 0.2 });
      // raider additions: scrap wall wings, spikes with mannequin heads, burning drums, red paint
      for (const s of [-1, 1]) {
        for (let i = 0; i < 4; i++) {
          const p = F.pt(uc + s * (6.5 + i * 1.2), 3.8);
          const r = P.rng(i * 3 + s)();
          b.box(
            r < 0.5 ? "corrugated" : "rust",
            p[0] - 0.6,
            0,
            p[1] - 0.05,
            p[0] + 0.6,
            2.2 + r * 0.8,
            p[1] + 0.05,
            { seg: false, rz: (r - 0.5) * 0.1 },
          );
        }
        const q0 = F.pt(uc + s * 6.5, 3.8),
          q1 = F.pt(uc + s * 11.3, 3.8);
        S.col(
          Math.min(q0[0], q1[0]) - 0.1,
          0,
          Math.min(q0[1], q1[1]) - 0.15,
          Math.max(q0[0], q1[0]) + 0.1,
          2.8,
          Math.max(q0[1], q1[1]) + 0.15,
          { walkable: false },
        );
        for (let i = 0; i < 3; i++) {
          const p = F.pt(uc + s * (5.5 + i * 2.2), 4.4);
          b.rod("rust", [p[0], 0, p[1]], [p[0], 2.6, p[1]], 0.03, 4);
          b.sphere("mannequin", p[0], 2.72, p[1], 0.11, {
            sy: 1.2,
            ws: 8,
            hs: 6,
          });
          b.box(
            "blood",
            p[0] - 0.05,
            2.5,
            p[1] - 0.12,
            p[0] + 0.05,
            2.62,
            p[1] - 0.1,
            { seg: false },
          );
        }
      }
      S.prop("barrel", XC - 7.5, 0, Z1 + 5.2, 0, { burning: true });
      S.prop("barrel", XC + 7.5, 0, Z1 + 5.2, 0, { burning: true });
      S.glow(XC - 7.5, 1.4, Z1 + 5.2, 0xff8a30, 1.5);
      S.glow(XC + 7.5, 1.4, Z1 + 5.2, 0xff8a30, 1.5);
      const g1 = P.texMat(
        "bl_graf1",
        P.signTex(
          "bl_graf1",
          ["WHERE NEW YORK", "BLEEDS OUT"],
          "raider",
          512,
          192,
          { fg: "#c42a1e" },
        ),
        { transparent: true },
      );
      F.quad(g1, 18, 2.4, 5.2, 1.9, 0.03);
      const g2 = P.texMat(
        "bl_graf2",
        P.signTex("bl_graf2", ["EVERYTHING", "MUST GO"], "raider", 512, 192, {
          fg: "#e8d8b8",
        }),
        { transparent: true },
      );
      F.quad(g2, 40, 2.4, 4.6, 1.7, 0.03);
      S.anchor("exterior_entrance", XC, 0, Z1 + 4.5, PI);
      S.anchor("street", XC + 8, 0, Z1 + 7, PI);
    }
    // east front (Lexington): display windows + a boarded side entrance
    for (const u of [13.5, 20, 26.5, 33])
      shopfront(FE, u, 5.0, {
        n: u === 26.5 ? 3 : 2,
        boarded: u === 33,
        back: "damask",
      });
    // corner (SE) canted doors + sign
    {
      const x = X1 - 1.2,
        z = Z1 - 1.2;
      b.box("deco_black", x - 1.6, 0, z - 1.6, x + 1.6, 4.8, z + 1.6, {
        ry: PI / 4,
        seg: false,
      });
      b.box("wood_rotten", x + 0.6, 0.05, z + 0.6, x + 0.75, 3.0, z + 0.8, {
        ry: PI / 4,
        seg: false,
      });
    }
    // street clutter
    D.rubble(S, X0 + 3, 0, Z1 + 3, 1.4, { n: 6 });
    D.papers(b, XC - 14, 0.03, Z1 + 3, 3, 14);
    S.prop("car", XC - 16, 0, Z1 + 6.5, HP + 0.1, {});
    S.prop("car", X1 + 6.5, 0, Z0 + 9, 0.08, {});
    S.prop("skeleton", XC + 12, 0, Z1 + 2.2, 0.4, { pose: "lying" });
    S.build({ shadow: true, lod: 280 });
    return S;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
