/* src/poi_uptown/50_tiffany.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 50 Tiffany & Co.
 *
 * EXTERIOR (site x 130..190, z -403..-372; Fifth Avenue & 57th Street):
 *   the 1940 limestone flagship — polished granite base, stainless-steel
 *   show windows (smashed), the recessed entrance with ATLAS holding the
 *   clock above it, bronze TIFFANY & CO. letters, the upper window grid;
 *   the raiders' fort: scrap walls, spiked car, skull pikes, fire drums,
 *   graffiti, and the collapsed building next door with their lookout.
 * INTERIOR: see 50_tiffany_interior.js (cell geometry, lighting, props, anchors and the
 *   street<->interior doors; it also registers the G.pois entry).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pu) return;
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  function clockTex() {
    return P.canvasTex(
      "pu_tif_clock",
      256,
      256,
      (ctx, w, h) => {
        const g = ctx.createRadialGradient(
          w / 2,
          h / 2,
          10,
          w / 2,
          h / 2,
          w / 2,
        );
        g.addColorStop(0, "#f0e8d0");
        g.addColorStop(1, "#c8b890");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#2a2418";
        ctx.font = "bold 22px " + P.FONTS.SERIF;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const R = [
          "XII",
          "I",
          "II",
          "III",
          "IIII",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
        ];
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU - HP;
          ctx.fillText(
            R[i],
            w / 2 + Math.cos(a) * 96,
            h / 2 + Math.sin(a) * 96,
          );
        }
        // stopped at 9:47 — the moment the bombs fell
        ctx.strokeStyle = "#1a1410";
        ctx.lineCap = "round";
        ctx.lineWidth = 7;
        const ah = ((9 + 47 / 60) / 12) * TAU - HP;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(ah) * 55, h / 2 + Math.sin(ah) * 55);
        ctx.stroke();
        ctx.lineWidth = 4;
        const am = (47 / 60) * TAU - HP;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(am) * 80, h / 2 + Math.sin(am) * 80);
        ctx.stroke();
        ctx.strokeStyle = "rgba(40,30,20,0.6)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 9; i++) {
          ctx.beginPath();
          ctx.moveTo(w * 0.55, h * 0.3);
          ctx.lineTo(w * 0.55 + Math.cos(i) * 60, h * 0.3 + Math.sin(i) * 60);
          ctx.stroke();
        }
      },
      { clamp: true },
    );
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function buildExterior() {
    const S = P.site("tiffany_ext", { grime: 0.5 });
    const b = S.b;
    const X0 = 132,
      X1 = 168,
      Z0 = -401,
      Z1 = -374,
      H = 34;
    b.box("sidewalk", 130.1, 0, -402.9, 189.9, 0.03, -372.1, {
      segLen: 8,
      grime: 0.6,
      noAO: true,
    });
    b.box("granite_dark", X0, 0, Z0, X1, 6, Z1);
    b.box("limestone", X0, 6, Z0, X1, H, Z1);
    S.col(X0, 0, Z0, X1, H, Z1);
    const DZ = -387.5; // entrance centre on Fifth Avenue
    // Upper facade (1940 Cross & Cross): plain limestone with the windows set in recessed vertical strips —
    // stainless frames, dark polished-granite spandrels between the floors, limestone piers between the bays,
    // a setback attic course and a plain coping (Art Moderne verticality instead of a punched grid).
    const grid = (F, skipU) => {
      F.band("limestone_dark", 5.8, 6.3, 0, 0.3);
      F.box("limestone", -0.3, F.len + 0.3, H - 0.6, H + 0.4, 0, 0.35);
      F.band("limestone_dark", H - 3.3, H - 3.0, 0, 0.14);
      const n = Math.round(F.len / 3.6),
        bw = F.len / n;
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) * bw;
        if (skipU && skipU(u)) continue;
        for (let k = 0; k < 6; k++) {
          const y = 7.4 + k * 4.4;
          F.window(u, y, 1.7, 2.7, {
            style:
              (i * 5 + k * 3) % 7 === 0
                ? "broken"
                : (i + k) % 9 === 4
                  ? "boarded"
                  : "dark",
            frame: "steel",
            sill: false,
            mull: true,
            ft: 0.06,
            fd: 0.06,
            d: 0.04,
          });
          if (k < 5)
            F.box(
              "granite_dark",
              u - 0.91,
              u + 0.91,
              y + 2.76,
              y + 4.4,
              0.0,
              0.03,
              { seg: false, grime: 0.3 },
            );
        }
        F.box("granite_dark", u - 0.91, u + 0.91, 6.3, 7.28, 0.0, 0.03, {
          seg: false,
          grime: 0.3,
        });
      }
      // piers between the bays (and at the corners) stand proud of the window strips
      for (let i = 0; i <= n; i++) {
        const pu = i * bw,
          w0 = i === 0 ? 0 : pu - 0.42,
          w1 = i === n ? F.len : pu + 0.42;
        if (skipU && skipU(pu) && i > 0 && i < n) continue;
        F.box("limestone", w0, w1, 6.3, H - 3.3, 0, 0.24);
      }
    };
    const FW = P.face(S, "w", Z0, Z1, X0); // u runs from z = Z0 (north) southward
    const FS = P.face(S, "s", X0, X1, Z1);
    grid(FW, (u) => Math.abs(u - (DZ - Z0)) < 2.6);
    grid(FS);
    // show windows (stainless frames, smashed) with Tiffany-blue awnings
    const showWin = (F, u) => {
      F.box("steel", u - 1.9, u + 1.9, 1.0, 1.15, 0, 0.3, { seg: false });
      F.box("steel", u - 1.9, u + 1.9, 4.55, 4.7, 0, 0.3, { seg: false });
      F.box("steel", u - 1.9, u - 1.75, 1.0, 4.7, 0, 0.3, { seg: false });
      F.box("steel", u + 1.75, u + 1.9, 1.0, 4.7, 0, 0.3, { seg: false });
      F.box("glass_broken", u - 1.75, u + 1.75, 1.15, 4.55, -0.02, 0.0, {
        seg: false,
      });
      F.box("velvet", u - 1.7, u + 1.7, 1.15, 1.3, -0.6, 0.0, { seg: false });
      // sloped Tiffany-blue awning with a scalloped-looking valance
      b.geo(
        "tiffany",
        new THREE.BoxGeometry(4.1, 0.06, 1.5)
          .translate(0, 0, 0.75)
          .rotateX(0.38),
        F.mat(u, 5.15, 0.05),
        { seg: false },
      );
      F.box("tiffany", u - 2.05, u + 2.05, 4.3, 4.62, 1.36, 1.42, {
        seg: false,
      });
      F.box("steel", u - 2.05, u + 2.05, 5.12, 5.2, 0.0, 0.1, { seg: false });
      D.shards(b, F.pt(u, 0.8)[0], 0, F.pt(u, 0.8)[1], 1.2, 12);
    };
    for (const u of [3.5, 8.5, 18.5, 23.5]) showWin(FW, u);
    for (const u of [5, 11, 24, 31]) showWin(FS, u);
    FS.box("steel", 16.5, 18.5, 0, 2.5, 0, 0.12, { seg: false });
    FS.box("granite_dark", 16.3, 18.7, 2.5, 2.8, 0, 0.3, { seg: false });
    // entrance: polished-granite portal (jambs + lintel stand 0.45 m proud → the doors read as a recess),
    // three pairs of stainless-steel glass doors under a gridded transom, brass push bars, kick plates
    const du = DZ - Z0;
    for (const s of [-1, 1])
      FW.box(
        "granite_dark",
        du + s * 1.95 - 0.45,
        du + s * 1.95 + 0.45,
        0,
        5.0,
        0,
        0.45,
      );
    FW.box("granite_dark", du - 2.4, du + 2.4, 5.0, 6.0, 0, 0.45);
    FW.box("granite_dark", du - 1.5, du + 1.5, 0, 0.04, 0, 0.45, {
      seg: false,
    }); // threshold
    b.box("glass_dark", X0 - 0.05, 0.05, DZ - 1.5, X0 - 0.03, 4.95, DZ + 1.5, {
      seg: false,
    });
    for (const z of [-1.5, -0.5, 0.5, 1.5])
      b.box(
        "steel",
        X0 - 0.12,
        0,
        DZ + z - 0.05,
        X0 - 0.02,
        3.3,
        DZ + z + 0.05,
        { seg: false },
      ); // stiles
    for (const z of [-1.0, 0, 1.0])
      b.box(
        "steel",
        X0 - 0.1,
        0,
        DZ + z - 0.025,
        X0 - 0.02,
        3.2,
        DZ + z + 0.025,
        { seg: false },
      ); // meeting stiles
    b.box("steel", X0 - 0.14, 3.2, DZ - 1.5, X0 - 0.02, 3.36, DZ + 1.5, {
      seg: false,
    }); // transom bar
    b.box("steel", X0 - 0.12, 0, DZ - 1.5, X0 - 0.03, 0.35, DZ + 1.5, {
      seg: false,
    }); // kick plates
    for (let k = 1; k < 10; k++)
      b.box(
        "steel",
        X0 - 0.08,
        3.36,
        DZ - 1.5 + k * 0.3 - 0.02,
        X0 - 0.03,
        5.0,
        DZ - 1.5 + k * 0.3 + 0.02,
        { seg: false },
      ); // transom grille
    b.box("steel", X0 - 0.08, 4.15, DZ - 1.5, X0 - 0.03, 4.2, DZ + 1.5, {
      seg: false,
    });
    for (const z of [-1.0, 0, 1.0])
      for (const s of [-1, 1])
        b.box(
          "gold",
          X0 - 0.2,
          1.05,
          DZ + z + s * 0.12 - 0.02,
          X0 - 0.12,
          1.12,
          DZ + z + s * 0.12 + s * 0.3,
          { seg: false },
        ); // push bars
    // ATLAS holding the clock
    b.box("granite_dark", X0 - 0.9, 5.2, DZ - 1.3, X0 - 0.1, 5.8, DZ + 1.3, {
      seg: false,
    });
    D.figure(b, "verdigris", X0 - 0.6, 5.8, DZ, -HP, 1.8, "atlas", {
      grime: 0.5,
    });
    const ck = P.texMat("tif_clock", clockTex(), { rough: 0.6 });
    b.torus("verdigris", X0 - 0.8, 10.2, DZ, 0.95, 0.14, TAU, {
      ry: HP,
      ts: 24,
      rs: 6,
    });
    b.cyl(ck, X0 - 0.8, 10.2, DZ, 0.9, 0.9, 0.06, 24, { rz: HP });
    // bronze TIFFANY & CO. letters
    const nm = P.texMat(
      "tif_name",
      P.signTex("tif_name", ["TIFFANY & CO."], "bronze", 1024, 128, {
        font: P.FONTS.SERIF,
        c0: "#f6dc98",
        c1: "#9a7438",
      }),
      { transparent: true, metal: 0.6, rough: 0.35 },
    );
    FW.box("granite_dark", du - 3.6, du + 3.6, 11.35, 12.55, 0, 0.12, {
      seg: false,
    }); // polished granite name band
    FW.quad(nm, du, 11.95, 6.8, 0.86, 0.14);
    FS.quad(nm, FS.len / 2, 10.3, 7.5, 0.95, 0.05);
    // ---- raider fort: scrap walls on the sidewalk, spiked car, skull pikes, drums, graffiti ----
    const scrap = (x0, z0, x1, z1) => {
      const L = Math.hypot(x1 - x0, z1 - z0),
        n = Math.ceil(L / 1.2),
        ang = Math.atan2(z1 - z0, x1 - x0),
        rn = P.rng(x0 * 3 + z0);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n,
          x = x0 + (x1 - x0) * t,
          z = z0 + (z1 - z0) * t,
          h = 2.0 + rn() * 0.9;
        b.boxC(
          rn() < 0.4 ? "rust" : rn() < 0.5 ? "corrugated" : "panel",
          x,
          0,
          z,
          1.25,
          h,
          0.08,
          { ry: -ang + (rn() - 0.5) * 0.12, seg: false, grime: 0.8 },
        );
        if (i % 2 === 0)
          b.rod(
            "rust",
            [x, 0, z],
            [x + (rn() - 0.5) * 0.3, h + 0.5, z + (rn() - 0.5) * 0.3],
            0.03,
            3,
          );
      }
      S.colR((x0 + x1) / 2, (z0 + z1) / 2, L, 0.3, 0, 2.2, -ang, {
        walkable: false,
      });
    };
    scrap(130.8, -400.5, 130.8, DZ - 3.2);
    scrap(130.8, DZ + 3.2, 130.8, -374.5);
    for (const s of [-1, 1]) {
      const z = DZ + s * 3.4;
      b.cyl("rust", 130.7, 0, z, 0.08, 0.08, 3.0, 5);
      b.sphere("bone", 130.7, 3.1, z, 0.13, { sy: 1.1 });
    }
    const gr1 = P.texMat(
      "tif_graf1",
      P.signTex("tif_graf1", ["BREAKFAST", "IS OVER"], "raider", 512, 256),
      { transparent: true },
    );
    b.quad(gr1, 130.72, 1.4, DZ - 8.5, 3.4, 1.7, { ry: -HP });
    const gr2 = P.texMat(
      "tif_graf2",
      P.signTex(
        "tif_graf2",
        ["TIFFANYS BOYS", "KEEP OUT"],
        "raider",
        512,
        256,
        { fg: "#e8d020" },
      ),
      { transparent: true },
    );
    FS.quad(gr2, 14.4, 2.4, 2.6, 1.3, 0.05);
    S.prop("barrel", 131.3, 0, DZ - 4.4, 0, { burning: true });
    S.prop("barrel", 131.3, 0, DZ + 4.4, 0, { burning: true });
    // spiked planks flank the gate (the middle 3 m stay open — the doorway must read as the way in)
    for (const k of [0, 1, 5, 6])
      b.rod(
        "wood_rotten",
        [131.2, 0.2, DZ - 2.9 + k * 0.97],
        [130.1, 1.6, DZ - 2.9 + k * 0.97],
        0.05,
        4,
      );
    // worn path of flattened cardboard + a hand-painted sign pointing in
    b.box("paper", X0 - 2.6, 0.005, DZ - 1.2, X0 - 0.5, 0.02, DZ + 1.2, {
      seg: false,
      grime: 0.8,
    });
    const gin = P.texMat(
      "tif_gate",
      P.signTex("tif_gate", ["SHOP", "OPEN", "→"], "raider", 256, 256, {
        fg: "#e84020",
      }),
      { transparent: true },
    );
    b.quad(gin, 130.72, 1.5, DZ - 3.9, 1.1, 1.1, { ry: -HP });
    // ---- the collapsed building next door + the raiders' lookout ----
    D.rubble(S, 178, 0, -387, 9, {
      n: 40,
      slab: true,
      rebar: true,
      scale: 2.2,
      col: true,
      colH: 1.5,
    });
    for (const [x, z, h] of [
      [171, -399, 14],
      [171, -376, 10],
      [187, -399, 18],
      [187, -376, 7],
      [179, -399, 12],
    ]) {
      b.box("steel", x - 0.3, 0, z - 0.3, x + 0.3, h, z + 0.3, { seg: false });
      S.col(x - 0.3, 0, z - 0.3, x + 0.3, h, z + 0.3, { walkable: false });
    }
    for (const y of [5, 9.5]) {
      b.box("steel", 170.7, y, -399.3, 187.3, y + 0.5, -398.7, { seg: false });
      b.box("steel", 170.7, y, -399.3, 171.3, y + 0.5, -376, { seg: false });
    }
    b.box("brick_red", 169, 0, -401, 170.5, 16, -374.5);
    S.col(169, 0, -401, 170.5, 16, -374.5);
    b.box("brick_red", 170.5, 0, -401, 189, 5 + 3, -399.8, { rz: 0 });
    S.col(170.5, 0, -401, 189, 8, -399.8);
    // lookout platform on the girders
    b.box("wood_rotten", 178, 9.9, -399, 186, 10.1, -393);
    S.col(178, 9.8, -399, 186, 10.1, -393, { surface: "wood" });
    for (let k = 0; k < 8; k++)
      b.box("corrugated", 178 + k, 10.1, -393.2, 179 + k, 11.1, -393.1, {
        seg: false,
      });
    const ladder = [180, -392.5];
    for (let k = 0; k < 20; k++)
      b.box(
        "rust",
        ladder[0] - 0.3,
        k * 0.5,
        ladder[1] - 0.03,
        ladder[0] + 0.3,
        k * 0.5 + 0.05,
        ladder[1] + 0.03,
        { seg: false },
      );
    S.anchor("lookout", 182, 10.1, -396, -HP);
    S.anchor("exterior_entrance", X0 - 3.0, 0, DZ, -HP);
    S.anchor("service_exit", 149.5, 0, -371.2, PI);
    S.build({ shadow: true, lod: 280 });
    return { S, DZ, X0, Z1 };
  }

  // ===================================================================
  // Registration: right after the exterior is built, 50_tiffany_interior.js
  // (P.interiorBuilders.tiffany) builds the interior cell, the street<->interior doors
  // and registers the G.pois entry (see P.finishSite in 00_kit.js).
  // ===================================================================
  P.addBuilder(
    "tiffany",
    function () {
      P.finishSite("tiffany", buildExterior());
    },
    50,
  );
})();
