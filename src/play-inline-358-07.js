// play-inline-358 07 — ctx
// Lines 1551-1872 of readable/play-inline-358.pretty.js (statement-aligned).
  PF.posterKey = function () {
    return PF.texMat(
      "posters",
      PF.canvasTex(
        "pws_posters",
        512,
        256,
        (ctx) => {
          const r = PF.rng("posters");
          const panel = (i, bg) => {
            ctx.fillStyle = bg;
            ctx.fillRect(i * 128 + 2, 2, 124, 252);
          };
          // 0: pin-up (silhouette in a swimsuit on a sun-yellow ground)
          panel(0, "#e8c05a");
          ctx.fillStyle = "#c83a2a";
          ctx.beginPath();
          ctx.arc(64, 70, 16, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#f0d0b0";
          ctx.beginPath();
          ctx.ellipse(64, 104, 18, 26, 0, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(58, 160, 14, 38, 0.2, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(76, 160, 12, 36, -0.35, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#1e4a8a";
          ctx.fillRect(48, 112, 32, 26);
          ctx.fillStyle = "#3a2a1a";
          ctx.beginPath();
          ctx.arc(64, 72, 14, PI, 0);
          ctx.fill();
          ctx.fillStyle = "#7a1a14";
          ctx.font = "bold 20px Georgia, serif";
          ctx.textAlign = "center";
          ctx.fillText("ATOMIC", 64, 226);
          ctx.font = "italic 14px Georgia, serif";
          ctx.fillText("Bombshell", 64, 244);
          // 1: Fizzo Cola
          panel(1, "#a81c18");
          ctx.fillStyle = "#f0e8d8";
          ctx.font = "bold italic 22px Georgia, serif";
          ctx.fillText("Fizzo Cola", 192, 46);
          ctx.fillStyle = "#2a1a14";
          ctx.beginPath();
          ctx.moveTo(182, 90);
          ctx.lineTo(202, 90);
          ctx.lineTo(206, 120);
          ctx.quadraticCurveTo(214, 150, 208, 210);
          ctx.lineTo(176, 210);
          ctx.quadraticCurveTo(170, 150, 178, 120);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#e8e0d0";
          ctx.fillRect(176, 150, 32, 20);
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "#f0e8d8";
          ctx.fillText("ZAP THAT THIRST!", 192, 240);
          // 2: WANTED
          panel(2, "#d8c8a0");
          ctx.fillStyle = "#2a1a10";
          ctx.font = "bold 26px Georgia, serif";
          ctx.fillText("WANTED", 320, 40);
          ctx.fillStyle = "#6a5a44";
          ctx.fillRect(282, 56, 76, 90);
          ctx.fillStyle = "#3a2a1a";
          ctx.beginPath();
          ctx.arc(320, 92, 20, 0, TAU);
          ctx.fill();
          ctx.fillRect(296, 112, 48, 34);
          ctx.fillStyle = "#2a1a10";
          ctx.font = "bold 13px Georgia, serif";
          ctx.fillText("MADAME BOBBIN", 320, 170);
          ctx.font = "11px Georgia, serif";
          ctx.fillText("Stitchers gang", 320, 188);
          ctx.font = "bold 16px Georgia, serif";
          ctx.fillText("500 SCRIP", 320, 216);
          ctx.font = "10px Georgia, serif";
          ctx.fillText("— H. Fenwick, C.H.T.P.", 320, 238);
          // 3: Civil Defense (circle-and-triangle insignia)
          panel(3, "#e4dcc6");
          ctx.fillStyle = "#24305a";
          ctx.beginPath();
          ctx.arc(448, 100, 40, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#f4f0e4";
          ctx.beginPath();
          ctx.moveTo(448, 68);
          ctx.lineTo(476, 118);
          ctx.lineTo(420, 118);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#b8241c";
          ctx.font = "bold 18px Arial";
          ctx.fillText("CD", 448, 110);
          ctx.fillStyle = "#24305a";
          ctx.font = "bold 15px Arial";
          ctx.fillText("CIVIL DEFENSE", 448, 176);
          ctx.font = "bold 11px Arial";
          ctx.fillText("KNOW YOUR", 448, 200);
          ctx.fillText("SHELTER!", 448, 216);
          for (let i = 0; i < 260; i++) {
            ctx.fillStyle = "rgba(60,40,20," + r() * 0.18 + ")";
            ctx.beginPath();
            ctx.arc(r() * 512, r() * 256, 1 + r() * 8, 0, TAU);
            ctx.fill();
          }
          for (let i = 0; i < 4; i++) {
            ctx.fillStyle = "rgba(230,220,190,0.5)";
            ctx.beginPath();
            ctx.moveTo(i * 128 + 128, 256);
            ctx.lineTo(i * 128 + 100, 256);
            ctx.lineTo(i * 128 + 128, 226);
            ctx.fill();
          } // torn corners
        },
        { clamp: true },
      ),
      { rough: 0.9, noShadow: true },
    );
  };
  PF.poster = function (b, i, x, y, z, w, h, ry, tilt) {
    b.quad(PF.posterKey(), x, y, z, w, h, {
      ry,
      rz: tilt || 0,
      uvRect: [i * 0.25, 0, i * 0.25 + 0.25, 1],
      grime: 0.25,
      noAO: true,
    });
  };

  // -------------------------------------------------------------------
  // Bank strongroom dressing: bullion shelves, cash bricks, money carts, coin sacks
  // -------------------------------------------------------------------
  /** Steel shelving (w wide along local x, 0.6 deep) stacked with gold bars (pyramids) and strapped cash bricks. */
  PF.bullionShelf = function (b, x, y, z, ry, w, rows, seed, opts) {
    opts = opts || {};
    const r = PF.rng("bullion" + seed);
    const M = PF.m4(x, y, z, ry);
    const add = (k, g, m) =>
      b.add(k, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: k === "goldbar" ? 0.1 : 0.35,
      });
    const H = rows * 0.5 + 0.2;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        add(
          "vault_ws",
          new THREE.BoxGeometry(0.05, H, 0.05),
          PF.m4(sx * (w / 2 - 0.03), H / 2, sz * 0.27),
        );
    for (let k = 0; k < rows; k++) {
      const sy = 0.15 + k * 0.5;
      add("vault_ws", new THREE.BoxGeometry(w, 0.03, 0.6), PF.m4(0, sy, 0));
      const cash = opts.cash && k % 2 === 1;
      for (let xx = -w / 2 + 0.2; xx < w / 2 - 0.15; xx += 0.36) {
        if (r() < 0.15) continue;
        if (cash) {
          for (let l = 0; l < 3; l++)
            for (let zz = 0; zz < 2; zz++)
              add(
                "money",
                new THREE.BoxGeometry(0.16, 0.06, 0.07),
                PF.m4(
                  xx,
                  sy + 0.045 + l * 0.062,
                  -0.1 + zz * 0.18,
                  (r() - 0.5) * 0.1,
                ),
              );
        } else {
          // bar pyramid: 3 + 2 + 1, each bar a trapezoid prism
          for (let l = 0; l < 3; l++)
            for (let i = 0; i < 3 - l; i++) {
              const g = new THREE.CylinderGeometry(0.05, 0.068, 0.045, 4, 1);
              g.rotateY(PI / 4);
              g.scale(1.45, 1, 0.8);
              add(
                "goldbar",
                g,
                PF.m4(
                  xx,
                  sy + 0.038 + l * 0.046,
                  -0.1 + (i - (2 - l) / 2) * 0.1,
                ),
              );
            }
        }
      }
    }
    PF.col(x, z, w, 0.62, y, y + H, ry, { walkable: false, surface: "metal" });
  };
  /** Canvas coin sack: upright, or burst open with coins spilled around it. */
  PF.coinSack = function (b, x, y, z, burst, seed) {
    const r = PF.rng("sack" + seed);
    if (!burst) {
      b.sphere("canvas_ws", x, y + 0.24, z, 0.26, {
        ws: 8,
        hs: 6,
        sy: 1.1,
        c: 0xc8b890,
        deform: (v) => {
          v.x *= 1 + 0.1 * Math.sin(v.y * 20);
        },
      });
      b.cyl("rope", x, y + 0.5, z, 0.06, 0.08, 0.08, 6, { hSeg: 1 });
      b.cyl("canvas_ws", x, y + 0.56, z, 0.1, 0.05, 0.1, 6, {
        hSeg: 1,
        c: 0xc8b890,
      });
      return;
    }
    b.sphere("canvas_ws", x, y + 0.1, z, 0.3, {
      ws: 8,
      hs: 6,
      sy: 0.4,
      c: 0xc0b088,
    });
    for (let k = 0; k < 26; k++) {
      const a = r() * TAU,
        d = 0.2 + Math.pow(r(), 0.7) * 0.9;
      b.cyl(
        r() < 0.3 ? "brass_ws" : "vault_ws",
        x + Math.cos(a) * d,
        y + 0.004,
        z + Math.sin(a) * d,
        0.022,
        0.022,
        0.006,
        8,
        { hSeg: 1, rx: (r() - 0.5) * 0.3, noAO: true, grime: 0.2 },
      );
    }
    for (let k = 0; k < 4; k++)
      b.cyl(
        "brass_ws",
        x + 0.15 + k * 0.01,
        y + 0.01 + k * 0.007,
        z - 0.2,
        0.022,
        0.022,
        0.006,
        8,
        { hSeg: 1, noAO: true },
      );
  };
  /** Steel money cart: wire basket on four castors, cash bricks and a ledger inside. */
  PF.moneyCart = function (b, x, y, z, ry, seed, tipped) {
    const r = PF.rng("cart" + seed);
    const M = PF.m4(
      x,
      y + (tipped ? 0.45 : 0),
      z,
      ry,
      0,
      tipped ? HP - 0.1 : 0,
    );
    const add = (k, g, m) =>
      b.add(k, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.4,
      });
    add("vault_dk", new THREE.BoxGeometry(1.0, 0.04, 0.6), PF.m4(0, 0.25, 0));
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      add(
        "vault_ws",
        new THREE.BoxGeometry(0.03, 0.62, 0.03),
        PF.m4(sx * 0.48, 0.55, sz * 0.28),
      );
      add(
        "tire",
        new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8),
        PF.m4(sx * 0.42, 0.06, sz * 0.24, 0, 0, HP),
      );
    }
    for (let k = 0; k < 7; k++) {
      add(
        "vault_ws",
        new THREE.BoxGeometry(1.0, 0.02, 0.02),
        PF.m4(0, 0.3 + k * 0.09, 0.29),
      );
      add(
        "vault_ws",
        new THREE.BoxGeometry(1.0, 0.02, 0.02),
        PF.m4(0, 0.3 + k * 0.09, -0.29),
      );
    }
    add(
      "vault_ws",
      new THREE.BoxGeometry(0.03, 0.03, 0.62),
      PF.m4(0.62, 0.95, 0),
    );
    for (let k = 0; k < 10; k++)
      add(
        "money",
        new THREE.BoxGeometry(0.16, 0.06, 0.07),
        PF.m4(
          -0.35 + (k % 5) * 0.17,
          0.3 + Math.floor(k / 5) * 0.065,
          (r() - 0.5) * 0.3,
          r() * 0.3,
        ),
      );
    if (!tipped)
      PF.col(x, z, 1.1, 0.7, y, y + 0.9, ry, {
        walkable: false,
        surface: "metal",
      });
  };

  // -------------------------------------------------------------------
  // Decals: bullet-hole clusters, water stains, blood, scorch, graffiti arrows (transparent atlas 4×2)
  // -------------------------------------------------------------------
