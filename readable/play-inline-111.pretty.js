/* src/landmarks_a/10_empire_state_interior.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 10_empire_state_interior.js
 * EMPIRE STATE BUILDING — INTERIOR (interior stream): the art-deco lobby
 * cell (INTERIORS.empire_lobby) with the gold sunburst relief, lobby-only
 * materials, dust motes, fixture lights, lobby anchors and the doors
 * Fifth Avenue <-> lobby and lobby express elevator <-> 86th-floor deck.
 * Called from 10_empire_state.js through K.interior('empire_state', ctx)
 * with ctx = { rec, DECK_Y }.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const K = G.LMA.kit;
  let DECK_Y = 163; // set from ctx (10_empire_state.js) before use

  // Lobby paints (atlas slots are packed in call order: called from the exterior textures() at the same point)
  K.defineInterior("empire_state:paints", function () {
    K.paint("esb_relief", 512, 640, (x, W, H) => {
      // dark marble backdrop
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#3a2418");
      g.addColorStop(1, "#23140c");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      // sunburst rays
      x.save();
      x.translate(W / 2, H * 0.3);
      for (let i = 0; i < 36; i++) {
        const a = (i * Math.PI) / 18;
        x.strokeStyle =
          i % 2 ? "rgba(230,190,90,0.9)" : "rgba(200,200,200,0.6)";
        x.lineWidth = i % 2 ? 6 : 3;
        x.beginPath();
        x.moveTo(Math.cos(a) * 40, Math.sin(a) * 40);
        x.lineTo(Math.cos(a) * 320, Math.sin(a) * 320);
        x.stroke();
      }
      x.fillStyle = "#e8c060";
      x.beginPath();
      x.arc(0, 0, 40, 0, 7);
      x.fill();
      x.restore();
      // the building in aluminium relief
      const bx = W / 2;
      x.fillStyle = "#d8d8d0";
      const tiers = [
        [150, 620, 470],
        [110, 470, 300],
        [80, 300, 230],
        [60, 230, 205],
        [40, 205, 180],
        [22, 180, 140],
        [12, 140, 110],
        [4, 110, 40],
      ];
      for (const t of tiers) x.fillRect(bx - t[0], t[2], t[0] * 2, t[1] - t[2]);
      x.fillStyle = "#9a9a92";
      for (let i = -140; i < 150; i += 16) x.fillRect(bx + i, 470, 4, 150);
      for (let i = -100; i < 110; i += 12) x.fillRect(bx + i, 300, 3, 170);
      x.strokeStyle = "#e8c060";
      x.lineWidth = 6;
      x.strokeRect(10, 10, W - 20, H - 20);
      x.fillStyle = "#e8c060";
      x.font = "bold 30px Georgia, serif";
      x.textAlign = "center";
      x.fillText("EMPIRE STATE", W / 2, 60);
      K.stains(x, W, H, 8, 81, 0.35);
      // gore smears (Brute squatters)
      x.fillStyle = "rgba(90,20,10,0.55)";
      x.beginPath();
      x.ellipse(W * 0.3, H * 0.8, 60, 20, 0.3, 0, 7);
      x.fill();
    });
    K.paint("esb_ceiling", 512, 512, (x, W, H) => {
      x.fillStyle = "#5a3a1a";
      x.fillRect(0, 0, W, H);
      const g = x.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.7);
      g.addColorStop(0, "#c8963a");
      g.addColorStop(1, "#6a4418");
      x.fillStyle = g;
      x.fillRect(8, 8, W - 16, H - 16);
      x.strokeStyle = "#f0d27a";
      x.lineWidth = 5;
      // gears + stars (art deco "machine age")
      const gear = (cx, cy, r) => {
        x.beginPath();
        x.arc(cx, cy, r, 0, 7);
        x.stroke();
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI) / 6;
          x.beginPath();
          x.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          x.lineTo(cx + Math.cos(a) * (r + 14), cy + Math.sin(a) * (r + 14));
          x.stroke();
        }
      };
      gear(W / 2, H / 2, 70);
      gear(W / 2, H / 2, 30);
      for (const c of [
        [80, 80],
        [W - 80, 80],
        [80, H - 80],
        [W - 80, H - 80],
      ])
        K.star(x, c[0], c[1], 40, 16, "#f0d27a");
      x.beginPath();
      x.moveTo(0, H / 2);
      x.lineTo(W, H / 2);
      x.moveTo(W / 2, 0);
      x.lineTo(W / 2, H);
      x.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        x.beginPath();
        x.moveTo(W / 2 + Math.cos(a) * 110, H / 2 + Math.sin(a) * 110);
        x.lineTo(W / 2 + Math.cos(a) * 240, H / 2 + Math.sin(a) * 240);
        x.stroke();
      }
      K.stains(x, W, H, 12, 91, 0.45);
      K.grain(x, W, H, 14, 92);
    });
  });

  // ------------------------------------------------------------------
  // Lobby interior (INTERIORS.empire_lobby) — the art-deco hall
  // ------------------------------------------------------------------
  /**
   * Lobby-only materials. They share a small procedural equirect environment (gold ceiling, lamp-lit amber
   * walls, pale floor) so the polished marble, the aluminium relief and the gold leaf actually REFLECT —
   * the gloss is what sells a 1931 lobby. None of these are used outdoors.
   */
  function lobbyMaterials() {
    if (K.MATDEF.esb_marble) return;
    // --- environment (512×256 equirect) ---
    const ev = K.canvas(512, 256),
      ex = ev.getContext("2d");
    let g = ex.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#e8b860");
    g.addColorStop(0.2, "#a87434");
    g.addColorStop(0.3, "#5a3418");
    g.addColorStop(0.5, "#6a4222");
    g.addColorStop(0.56, "#3a2412");
    g.addColorStop(0.75, "#8a6a48");
    g.addColorStop(1, "#4a3a2a");
    ex.fillStyle = g;
    ex.fillRect(0, 0, 512, 256);
    const spot = (x, y, r, c) => {
      const q = ex.createRadialGradient(x, y, 0, x, y, r);
      q.addColorStop(0, c);
      q.addColorStop(1, "rgba(255,220,160,0)");
      ex.fillStyle = q;
      ex.fillRect(x - r, y - r, r * 2, r * 2);
    };
    for (let i = 0; i < 16; i++)
      spot(i * 32 + 16, 100, 10, "rgba(255,236,190,1)"); // sconces
    for (let i = 0; i < 6; i++)
      spot(i * 85 + 40, 40, 16, "rgba(255,240,200,1)"); // lanterns
    spot(128, 118, 40, "rgba(255,248,230,0.9)");
    spot(384, 118, 30, "rgba(230,236,240,0.8)"); // relief / daylight transom
    const envTex = K.texFromCanvas(ev, { clamp: false });
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    // --- warm book-matched marble (1024², one texture = 3.6 m of wall) ---
    const mc = K.canvas(1024, 1024),
      mx = mc.getContext("2d"),
      r = K.rng(1931);
    const q = K.canvas(512, 512),
      qx = q.getContext("2d");
    g = qx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, "#c08a52");
    g.addColorStop(0.5, "#a86c3c");
    g.addColorStop(1, "#c49058");
    qx.fillStyle = g;
    qx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++) {
      const px = r() * 512,
        py = r() * 512,
        rds = 30 + r() * 140,
        t = r();
      const cc = t < 0.4 ? "122,62,30" : t < 0.75 ? "216,160,98" : "150,84,44";
      const gg = qx.createRadialGradient(px, py, 0, px, py, rds);
      gg.addColorStop(0, "rgba(" + cc + ",0.4)");
      gg.addColorStop(1, "rgba(" + cc + ",0)");
      qx.fillStyle = gg;
      qx.fillRect(px - rds, py - rds, rds * 2, rds * 2);
    }
    const vein = (col, w, n, drift) => {
      for (let i = 0; i < n; i++) {
        qx.strokeStyle = col;
        qx.lineWidth = w * (0.4 + r());
        qx.beginPath();
        let px = r() * 512,
          py = -20;
        qx.moveTo(px, py);
        while (py < 530) {
          const nx = px + (r() - 0.5) * 60 + drift,
            ny = py + 20 + r() * 50;
          qx.quadraticCurveTo(px + (r() - 0.5) * 40, (py + ny) / 2, nx, ny);
          px = nx;
          py = ny;
        }
        qx.stroke();
      }
    };
    vein("rgba(90,40,18,0.35)", 3, 10, 8);
    vein("rgba(248,222,176,0.55)", 1.6, 14, -6);
    vein("rgba(255,236,200,0.8)", 0.7, 18, 4);
    vein("rgba(60,26,10,0.5)", 0.8, 8, 12);
    K.grain(qx, 512, 512, 10, 1932);
    // book-match: mirror the quadrant into 4 panels (the veins meet at the joints like real bookmatched slabs)
    for (const f of [
      [0, 0, 1, 1],
      [1024, 0, -1, 1],
      [0, 1024, 1, -1],
      [1024, 1024, -1, -1],
    ]) {
      mx.save();
      mx.translate(f[0], f[1]);
      mx.scale(f[2], f[3]);
      mx.drawImage(q, 0, 0);
      mx.restore();
    }
    mx.strokeStyle = "rgba(40,18,6,0.55)";
    mx.lineWidth = 2;
    mx.strokeRect(1, 1, 1022, 1022);
    mx.beginPath();
    mx.moveTo(512, 0);
    mx.lineTo(512, 1024);
    mx.moveTo(0, 512);
    mx.lineTo(1024, 512);
    mx.stroke();
    K.stains(mx, 1024, 1024, 5, 1933, 0.12);
    const marbleTex = K.texFromCanvas(mc);
    const mk = (key, o) => {
      const m = new THREE.MeshStandardMaterial(
        Object.assign({ vertexColors: true, envMap: envTex }, o.m),
      );
      m.name = "lma_" + key;
      m.userData.shared = true;
      K.defineMat(key, Object.assign({ material: m }, o.def || {}));
      return m;
    };
    mk("esb_marble", {
      m: {
        map: marbleTex,
        roughness: 0.24,
        metalness: 0.0,
        envMapIntensity: 0.9,
      },
      def: { tile: [3.6, 3.6] },
    });
    // --- floor: polished cream / honey marble squares, brass fillets, dark diamonds (1024² = 4.4 m) ---
    const fc = K.canvas(1024, 1024),
      fx = fc.getContext("2d");
    const tileCol = ["#ccb690", "#b48c5e"];
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        const x0 = i * 512,
          y0 = j * 512;
        fx.fillStyle = tileCol[(i + j) % 2];
        fx.fillRect(x0, y0, 512, 512);
        for (let k = 0; k < 16; k++) {
          const px = x0 + r() * 512,
            py = y0 + r() * 512,
            rds = 20 + r() * 80,
            gg = fx.createRadialGradient(px, py, 0, px, py, rds);
          gg.addColorStop(
            0,
            (i + j) % 2 ? "rgba(120,70,36,0.3)" : "rgba(190,170,130,0.35)",
          );
          gg.addColorStop(1, "rgba(0,0,0,0)");
          fx.fillStyle = gg;
          fx.fillRect(px - rds, py - rds, rds * 2, rds * 2);
        }
        fx.strokeStyle =
          (i + j) % 2 ? "rgba(250,220,170,0.35)" : "rgba(140,120,90,0.35)";
        fx.lineWidth = 1;
        for (let k = 0; k < 6; k++) {
          fx.beginPath();
          let px = x0 + r() * 512,
            py = y0;
          fx.moveTo(px, py);
          while (py < y0 + 512) {
            px += (r() - 0.5) * 50;
            py += 30 + r() * 40;
            fx.lineTo(px, py);
          }
          fx.stroke();
        }
      }
    fx.strokeStyle = "#8a6a2a";
    fx.lineWidth = 7;
    for (const t of [0, 512, 1024]) {
      fx.beginPath();
      fx.moveTo(t, 0);
      fx.lineTo(t, 1024);
      fx.moveTo(0, t);
      fx.lineTo(1024, t);
      fx.stroke();
    }
    fx.strokeStyle = "rgba(255,220,140,0.6)";
    fx.lineWidth = 2;
    for (const t of [0, 512, 1024]) {
      fx.beginPath();
      fx.moveTo(t - 1, 0);
      fx.lineTo(t - 1, 1024);
      fx.moveTo(0, t - 1);
      fx.lineTo(1024, t - 1);
      fx.stroke();
    }
    for (const c of [
      [0, 0],
      [512, 0],
      [0, 512],
      [512, 512],
      [1024, 0],
      [0, 1024],
      [1024, 512],
      [512, 1024],
      [1024, 1024],
    ]) {
      fx.fillStyle = "#3a2416";
      fx.beginPath();
      fx.moveTo(c[0], c[1] - 44);
      fx.lineTo(c[0] + 44, c[1]);
      fx.lineTo(c[0], c[1] + 44);
      fx.lineTo(c[0] - 44, c[1]);
      fx.fill();
      fx.strokeStyle = "#c8a050";
      fx.lineWidth = 3;
      fx.stroke();
    }
    K.grain(fx, 1024, 1024, 8, 1934);
    mk("esb_floor", {
      m: {
        map: K.texFromCanvas(fc),
        roughness: 0.14,
        metalness: 0.0,
        envMapIntensity: 1.1,
      },
      def: { tile: [4.4, 4.4] },
    });
    mk("esb_alu", {
      m: {
        color: 0xdfe3e6,
        roughness: 0.26,
        metalness: 0.9,
        envMapIntensity: 1.3,
        emissive: new THREE.Color(0x1a1a1c),
      },
    });
    mk("esb_gold", {
      m: {
        color: 0xe0b050,
        roughness: 0.3,
        metalness: 0.92,
        envMapIntensity: 1.3,
        emissive: new THREE.Color(0x2a1a06),
      },
    });
    // relief-only twins that ignore the interior fog: the spot-lit relief must read crisply down the whole 44 m hall
    for (const k of ["esb_alu", "esb_gold", "esb_marble"]) {
      const m = K.mat(k).clone();
      m.fog = false;
      m.name = "lma_" + k + "_r";
      m.userData.shared = true;
      K.defineMat(k + "_r", { material: m, tile: (K.MATDEF[k] || {}).tile });
    }
    mk("esb_bronze", {
      m: {
        color: 0x8a5a2e,
        roughness: 0.36,
        metalness: 0.85,
        envMapIntensity: 1.1,
        emissive: new THREE.Color(0x120a04),
      },
    });
    // --- gold- and aluminium-leaf ceiling mural (1024², one per coffer): machine-age sky of gears, rays, stars ---
    const cc = K.canvas(1024, 1024),
      cx = cc.getContext("2d");
    g = cx.createRadialGradient(512, 512, 40, 512, 512, 760);
    g.addColorStop(0, "#f2c668");
    g.addColorStop(0.55, "#c08a36");
    g.addColorStop(1, "#6a4418");
    cx.fillStyle = g;
    cx.fillRect(0, 0, 1024, 1024);
    for (let y = 0; y < 1024; y += 32)
      for (let x = 0; x < 1024; x += 32) {
        cx.fillStyle =
          "rgba(" +
          (r() < 0.5 ? "255,230,160" : "90,56,16") +
          "," +
          (0.05 + r() * 0.08) +
          ")";
        cx.fillRect(x, y, 32, 32);
      } // leaf squares
    cx.save();
    cx.translate(512, 512);
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      cx.strokeStyle =
        i % 2 ? "rgba(236,240,244,0.85)" : "rgba(255,226,140,0.9)";
      cx.lineWidth = i % 2 ? 5 : 10;
      cx.beginPath();
      cx.moveTo(Math.cos(a) * 190, Math.sin(a) * 190);
      cx.lineTo(Math.cos(a) * 700, Math.sin(a) * 700);
      cx.stroke();
    }
    const gear = (R, teeth, col, lw) => {
      cx.strokeStyle = col;
      cx.lineWidth = lw;
      cx.beginPath();
      for (let i = 0; i <= teeth * 4; i++) {
        const a = (i / (teeth * 4)) * Math.PI * 2,
          rr = i % 4 < 2 ? R + 22 : R;
        cx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      cx.closePath();
      cx.stroke();
      cx.beginPath();
      cx.arc(0, 0, R * 0.62, 0, 7);
      cx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cx.beginPath();
        cx.moveTo(Math.cos(a) * R * 0.2, Math.sin(a) * R * 0.2);
        cx.lineTo(Math.cos(a) * R * 0.62, Math.sin(a) * R * 0.62);
        cx.stroke();
      }
    };
    cx.fillStyle = "#7a4c16";
    cx.beginPath();
    cx.arc(0, 0, 186, 0, 7);
    cx.fill();
    gear(160, 18, "#eef2f4", 10);
    gear(70, 10, "#ffe08a", 8);
    cx.fillStyle = "#fff2c0";
    cx.beginPath();
    cx.arc(0, 0, 26, 0, 7);
    cx.fill();
    cx.restore();
    for (const c of [
      [130, 130],
      [894, 130],
      [130, 894],
      [894, 894],
    ]) {
      K.star(cx, c[0], c[1], 70, 24, "#f4f6f8");
      K.star(cx, c[0], c[1], 40, 14, "#ffd870");
    }
    for (const c of [
      [512, 90],
      [512, 934],
      [90, 512],
      [934, 512],
    ])
      K.star(cx, c[0], c[1], 30, 11, "#eef0f2");
    // stepped deco border (aluminium zig-zag between gold fillets)
    cx.strokeStyle = "#3a2408";
    cx.lineWidth = 26;
    cx.strokeRect(13, 13, 998, 998);
    cx.strokeStyle = "#f0d27a";
    cx.lineWidth = 6;
    cx.strokeRect(30, 30, 964, 964);
    cx.strokeStyle = "#e8ecef";
    cx.lineWidth = 4;
    cx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = 44 + i * 23.4,
        o = i % 2 ? 44 : 62;
      cx.lineTo(t, o);
    }
    cx.stroke();
    cx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = 44 + i * 23.4,
        o = i % 2 ? 980 : 962;
      cx.lineTo(t, o);
    }
    cx.stroke();
    cx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = 44 + i * 23.4,
        o = i % 2 ? 44 : 62;
      cx.lineTo(o, t);
    }
    cx.stroke();
    cx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = 44 + i * 23.4,
        o = i % 2 ? 980 : 962;
      cx.lineTo(o, t);
    }
    cx.stroke();
    K.stains(cx, 1024, 1024, 10, 1935, 0.3); // soot from the Brutes' fires
    const ceilTex = K.texFromCanvas(cc, { clamp: true });
    mk("esb_ceiling", {
      m: {
        map: ceilTex,
        emissiveMap: ceilTex,
        emissive: new THREE.Color(0xffe0b0),
        emissiveIntensity: 0.62,
        roughness: 0.34,
        metalness: 0.55,
        envMapIntensity: 0.7,
      },
    });
    // --- door / dial / directory / frieze / mailbox sheet (1024×512) ---
    const dc = K.canvas(1024, 512),
      dx = dc.getContext("2d");
    // bronze elevator door with floor dial: cell [0..256]×[0..512]
    g = dx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "#5a3818");
    g.addColorStop(0.25, "#b08048");
    g.addColorStop(0.5, "#6a4420");
    g.addColorStop(0.75, "#b08048");
    g.addColorStop(1, "#5a3818");
    dx.fillStyle = g;
    dx.fillRect(0, 128, 256, 384);
    dx.fillStyle = "#1c1008";
    dx.fillRect(126, 128, 4, 384);
    dx.strokeStyle = "#f0d088";
    dx.lineWidth = 3;
    for (const sx of [64, 192]) {
      for (let k = 0; k < 5; k++) {
        dx.beginPath();
        dx.moveTo(sx - 44 + k * 22, 470);
        dx.lineTo(sx, 300);
        dx.stroke();
      }
      dx.beginPath();
      dx.moveTo(sx, 170);
      dx.lineTo(sx - 40, 240);
      dx.lineTo(sx, 300);
      dx.lineTo(sx + 40, 240);
      dx.closePath();
      dx.stroke();
      dx.beginPath();
      dx.arc(sx, 240, 14, 0, 7);
      dx.stroke();
      dx.strokeRect(sx - 52, 140, 104, 360);
    }
    // dial (semicircle floor indicator, arrow stuck at 86)
    dx.fillStyle = "#2a1a0c";
    dx.fillRect(0, 0, 256, 128);
    dx.fillStyle = "#d8b060";
    dx.beginPath();
    dx.arc(128, 116, 100, Math.PI, 0);
    dx.fill();
    dx.fillStyle = "#1e140a";
    dx.beginPath();
    dx.arc(128, 116, 88, Math.PI, 0);
    dx.fill();
    dx.fillStyle = "#f4e0a8";
    dx.font = "bold 14px Georgia, serif";
    dx.textAlign = "center";
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI + (i / 8) * Math.PI;
      dx.fillText(
        String(i * 10 + (i === 8 ? 6 : 0)),
        128 + Math.cos(a) * 74,
        120 + Math.sin(a) * 74,
      );
    }
    dx.strokeStyle = "#f4e0a8";
    dx.lineWidth = 4;
    dx.beginPath();
    dx.moveTo(128, 116);
    dx.lineTo(128 + Math.cos(-0.25) * 70, 116 + Math.sin(-0.25) * 70);
    dx.stroke();
    // directory board: [256..512]×[0..512]
    dx.fillStyle = "#141210";
    dx.fillRect(256, 0, 256, 512);
    dx.strokeStyle = "#d8dcde";
    dx.lineWidth = 8;
    dx.strokeRect(262, 6, 244, 500);
    dx.fillStyle = "#e8e4d8";
    dx.font = "bold 22px Georgia, serif";
    dx.fillText("DIRECTORY", 384, 44);
    dx.font = "13px monospace";
    dx.textAlign = "left";
    [
      "CIVIL DEFENSE NY . 20",
      "MERIDIAN TELETYPE  34",
      "UNITED REACTOR .. 41",
      "FIZZO COLA EXEC .. 55",
      "US ARMY LIAISON .. 61",
      "WNYC RADIO ....... 72",
      "OBSERVATORY ...... 86",
      "",
      "   ** NO HUMANS **",
    ].forEach((t, i) => {
      dx.fillStyle = i === 8 ? "#b02a1a" : "#e8e4d8";
      dx.fillText(t, 276, 90 + i * 34);
    });
    // deco frieze: [512..1024]×[0..128]
    dx.fillStyle = "#2a1608";
    dx.fillRect(512, 0, 512, 128);
    for (let i = 0; i < 8; i++) {
      const x0 = 512 + i * 64;
      dx.fillStyle = "#d8a848";
      dx.beginPath();
      dx.moveTo(x0, 110);
      dx.lineTo(x0 + 32, 18);
      dx.lineTo(x0 + 64, 110);
      dx.lineTo(x0 + 52, 110);
      dx.lineTo(x0 + 32, 50);
      dx.lineTo(x0 + 12, 110);
      dx.fill();
      dx.fillStyle = "#e4e8ea";
      dx.fillRect(x0 + 29, 70, 6, 40);
    }
    dx.fillStyle = "#e8c068";
    dx.fillRect(512, 0, 512, 8);
    dx.fillRect(512, 120, 512, 8);
    // EMPIRE STATE letters: [512..1024]×[128..256]
    dx.fillStyle = "#1e120a";
    dx.fillRect(512, 128, 512, 128);
    dx.textAlign = "center";
    dx.font = 'bold 62px Georgia, "Times New Roman", serif';
    try {
      dx.letterSpacing = "8px";
    } catch (e) {
      /* ignore */
    }
    g = dx.createLinearGradient(0, 150, 0, 240);
    g.addColorStop(0, "#fff0b8");
    g.addColorStop(0.5, "#e0b050");
    g.addColorStop(1, "#9a6a20");
    dx.fillStyle = g;
    dx.fillText("EMPIRE STATE", 768, 214);
    try {
      dx.letterSpacing = "0px";
    } catch (e) {
      /* ignore */
    }
    // brass mailbox: [512..768]×[256..512]
    g = dx.createLinearGradient(512, 0, 768, 0);
    g.addColorStop(0, "#7a5424");
    g.addColorStop(0.5, "#d8a858");
    g.addColorStop(1, "#7a5424");
    dx.fillStyle = g;
    dx.fillRect(512, 256, 256, 256);
    dx.fillStyle = "#2a1a0a";
    dx.fillRect(580, 300, 120, 14);
    dx.font = "bold 20px Georgia, serif";
    dx.fillText("U.S. MAIL", 640, 350);
    dx.strokeStyle = "#3a2410";
    dx.lineWidth = 4;
    dx.beginPath();
    dx.moveTo(600, 460);
    dx.lineTo(640, 380);
    dx.lineTo(680, 460);
    dx.stroke();
    dx.beginPath();
    dx.moveTo(560, 420);
    dx.lineTo(640, 400);
    dx.lineTo(720, 420);
    dx.stroke();
    // warning daub over the relief niche: [768..1024]×[256..512]
    dx.clearRect(768, 256, 256, 256);
    dx.fillStyle = "rgba(0,0,0,0)";
    dx.fillRect(768, 256, 256, 256);
    dx.fillStyle = "rgba(140,20,10,0.9)";
    dx.font = "bold 44px Impact, sans-serif";
    dx.fillText("OURS", 896, 360);
    dx.font = "bold 30px Impact, sans-serif";
    dx.fillText("KEEP OUT", 896, 410);
    K.stains(dx, 1024, 512, 10, 1936, 0.25);
    const sheet = K.texFromCanvas(dc, { clamp: true });
    mk("esb_sheet", {
      m: {
        map: sheet,
        emissiveMap: sheet,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.18,
        roughness: 0.34,
        metalness: 0.6,
        envMapIntensity: 0.9,
        alphaTest: 0.4,
        side: THREE.DoubleSide,
      },
    });
    // additive helpers: uplight fan wash, relief hot-spot, dust shafts (interior: never fade with the time of day)
    const wc = K.canvas(64, 128),
      wx = wc.getContext("2d");
    for (let y = 0; y < 128; y++) {
      const t = y / 127,
        w = 6 + (1 - t) * 26,
        a = Math.pow(t, 1.4) * 0.9;
      const gg = wx.createLinearGradient(32 - w, 0, 32 + w, 0);
      gg.addColorStop(0, "rgba(255,255,255,0)");
      gg.addColorStop(0.5, "rgba(255,255,255," + a + ")");
      gg.addColorStop(1, "rgba(255,255,255,0)");
      wx.fillStyle = gg;
      wx.fillRect(0, 127 - y, 64, 1);
    }
    K.defineMat("esb_wash", {
      basic: true,
      map: K.texFromCanvas(wc, { clamp: true }),
      color: 0xffffff,
      transparent: true,
      additive: true,
      side: THREE.DoubleSide,
      noShadow: true,
      fog: false,
    });
    K.defineMat("esb_hot", {
      basic: true,
      map: K.glowTex(),
      color: 0xffffff,
      transparent: true,
      additive: true,
      side: THREE.DoubleSide,
      noShadow: true,
      fog: false,
    });
    K.defineMat("esb_shaft", {
      basic: true,
      map: K.mat("shaft").map,
      color: 0xffffff,
      transparent: true,
      additive: true,
      side: THREE.DoubleSide,
      noShadow: true,
      fog: false,
    });
  }
  const SHEET = {
    door: [0.002, 0.004, 0.248, 0.996],
    directory: [0.252, 0.004, 0.498, 0.996],
    frieze: [0.502, 0.754, 0.998, 0.996],
    name: [0.502, 0.504, 0.998, 0.746],
    mailbox: [0.502, 0.004, 0.748, 0.496],
    daub: [0.752, 0.004, 0.998, 0.496],
  };

  /** Additive light shaft: two crossed quads from p along dir for len, widening w0 → w1. */
  function shaft(b, p, dir, len, w0, w1, tint) {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const up =
      Math.abs(d.y) > 0.95
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0);
    const s1 = new THREE.Vector3().crossVectors(d, up).normalize(),
      s2 = new THREE.Vector3().crossVectors(d, s1).normalize();
    const e = [p[0] + d.x * len, p[1] + d.y * len, p[2] + d.z * len];
    for (const sv of [s1, s2]) {
      const a0 = [p[0] - sv.x * w0, p[1] - sv.y * w0, p[2] - sv.z * w0],
        a1 = [p[0] + sv.x * w0, p[1] + sv.y * w0, p[2] + sv.z * w0];
      const b1 = [e[0] + sv.x * w1, e[1] + sv.y * w1, e[2] + sv.z * w1],
        b0 = [e[0] - sv.x * w1, e[1] - sv.y * w1, e[2] - sv.z * w1];
      b.quad("esb_shaft", b0, b1, a1, a0, { rect: [0, 0, 1, 1], tint });
    }
  }

  function lobby(rec) {
    lobbyMaterials();
    const O = G.LAYOUT.INTERIORS.empire_lobby.origin;
    const ox = O.x,
      oz = O.z;
    const b = K.builder("esb_lobby", { grime: 0.22 });
    const fxb = K.builder("esb_lobby_fx", { grime: 0 });
    const glows = K.glowSet("esb_lobby");
    const spill = K.spillSet("esb_lobby"),
      refl = K.reflSet("esb_lobby");
    const P = K.parts,
      T = K.T;
    const X0 = ox - 22,
      X1 = ox + 22,
      Z0 = oz - 7,
      Z1 = oz + 7,
      H = 11;
    const fixtures = [];
    const M = "esb_marble",
      MD = 0x6a3a1e; // dark (base / frames) tint of the same marble
    // ---------------- floor ----------------
    b.boxMM("esb_floor", X0 - 8, -0.3, Z0 - 8, X1, 0.02, Z1 + 8, {
      faces: "t",
      grime: 0.18,
    });
    // ---------------- walls (3 archways each side into the elevator bays) ----------------
    const archs = [
      { at: 10, w: 4, h: 6.5, arch: true },
      { at: 22, w: 4, h: 6.5, arch: true },
      { at: 34, w: 4, h: 6.5, arch: true },
    ];
    b.wall(M, X0, Z0, X1, Z0, 0, H, 0.6, archs, {});
    b.wall(
      M,
      X1,
      Z1,
      X0,
      Z1,
      0,
      H,
      0.6,
      archs.map((a) => ({ ...a, at: 44 - a.at })),
      {},
    );
    b.wall(M, X1, Z0, X1, Z1, 0, H, 0.8, [{ at: 7, w: 5, h: 7.5 }], {});
    b.wall(M, X0, Z1, X0, Z0, 0, H, 0.8, [], {});
    // side-wall dressing, per wall: s = +1 north wall (inner face z = Z0 + 0.3, facing +z), -1 south wall
    const PIL = [6.4, 13.6, 18.4, 25.6, 30.4, 37.6],
      ELEV = [16, 28];
    for (const sgn of [1, -1]) {
      const zi = sgn > 0 ? Z0 + 0.3 : Z1 - 0.3,
        face = sgn > 0 ? 0 : Math.PI,
        n = sgn; // n: +z or -z into the hall
      const inArch = (x) =>
        archs.some((a) => Math.abs(x - (X0 + a.at)) < a.w / 2 + 0.05);
      // dark marble skirting + bronze cap, broken at the arches
      let segStart = X0 + 0.4;
      const bounds = [];
      const gaps = archs
        .map((a) => [X0 + a.at - a.w / 2, X0 + a.at + a.w / 2])
        .concat(ELEV.map((p) => [X0 + p - 1.28, X0 + p + 1.28]))
        .sort((a, c) => a[0] - c[0]);
      for (const gp of gaps) {
        bounds.push([segStart, gp[0]]);
        segStart = gp[1];
      }
      bounds.push([segStart, X1 - 0.4]);
      for (const bd of bounds) {
        b.boxMM(
          M,
          bd[0],
          0,
          Math.min(zi, zi + n * 0.08),
          bd[1],
          0.55,
          Math.max(zi, zi + n * 0.08),
          { tint: MD, grime: 0.3 },
        );
        b.boxMM(
          "esb_bronze",
          bd[0],
          0.55,
          Math.min(zi, zi + n * 0.1),
          bd[1],
          0.62,
          Math.max(zi, zi + n * 0.1),
          { grime: 0.1 },
        );
        // deco frieze above the arch heads
        if (bd[1] - bd[0] < 0.05) continue;
        for (let x = bd[0]; x < bd[1] - 0.05; x += 4) {
          const x2 = Math.min(bd[1], x + 4);
          b.panel(
            "esb_sheet",
            (x + x2) / 2,
            7.55,
            zi + n * 0.02,
            x2 - x,
            0.5,
            face,
            {
              rect: [
                SHEET.frieze[0],
                SHEET.frieze[1],
                SHEET.frieze[0] +
                  ((SHEET.frieze[2] - SHEET.frieze[0]) * (x2 - x)) / 4,
                SHEET.frieze[3],
              ],
            },
          );
        }
      }
      for (const p of ELEV)
        b.panel("esb_sheet", X0 + p, 7.55, zi + n * 0.02, 2.56, 0.5, face, {
          rect: [
            SHEET.frieze[0],
            SHEET.frieze[1],
            SHEET.frieze[0] + (SHEET.frieze[2] - SHEET.frieze[0]) * 0.64,
            SHEET.frieze[3],
          ],
        });
      b.boxMM(
        "esb_gold",
        X0 + 0.4,
        7.22,
        Math.min(zi, zi + n * 0.06),
        X1 - 0.4,
        7.3,
        Math.max(zi, zi + n * 0.06),
        { grime: 0.05 },
      );
      b.boxMM(
        "esb_gold",
        X0 + 0.4,
        7.8,
        Math.min(zi, zi + n * 0.06),
        X1 - 0.4,
        7.88,
        Math.max(zi, zi + n * 0.06),
        { grime: 0.05 },
      );
      // slim aluminium mullions between the book-matched slabs
      for (let x = X0 + 1.8; x < X1 - 0.5; x += 3.6)
        if (
          !inArch(x) &&
          !PIL.some((p) => Math.abs(X0 + p - x) < 0.8) &&
          !ELEV.some((p) => Math.abs(X0 + p - x) < 1.5)
        )
          b.boxMM(
            "esb_alu",
            x - 0.03,
            0.62,
            Math.min(zi, zi + n * 0.04),
            x + 0.03,
            7.22,
            Math.max(zi, zi + n * 0.04),
            { grime: 0.05 },
          );
      // arch surrounds: aluminium architrave ring + radiating sunburst grille in the lunette
      for (const a of archs) {
        const ax = X0 + a.at,
          hw = a.w / 2,
          spring = a.h - hw;
        const ring = new THREE.Shape();
        ring.moveTo(-hw - 0.28, 0);
        ring.lineTo(-hw - 0.28, spring);
        ring.absarc(0, spring, hw + 0.28, Math.PI, 0, true);
        ring.lineTo(hw + 0.28, 0);
        ring.lineTo(hw, 0);
        ring.lineTo(hw, spring);
        ring.absarc(0, spring, hw, 0, Math.PI, false);
        ring.lineTo(-hw, 0);
        ring.lineTo(-hw - 0.28, 0);
        b.extrude("esb_alu", ring, 0.1, {
          x: ax,
          y: 0,
          z: zi + n * 0.05,
          ry: 0,
          curveSegments: 16,
          grime: 0.05,
        });
        b.box("esb_alu", ax, spring - 0.06, zi - n * 0.3, a.w, 0.12, 0.08, {
          grime: 0.05,
        });
        for (let k = 1; k < 12; k++) {
          const ang = (Math.PI * k) / 12;
          b.beam(
            "esb_gold",
            ax + Math.cos(ang) * 0.35,
            spring + Math.sin(ang) * 0.35,
            zi - n * 0.3,
            ax + Math.cos(ang) * (hw - 0.05),
            spring + Math.sin(ang) * (hw - 0.05),
            zi - n * 0.3,
            0.045,
            { grime: 0 },
          );
        }
        b.cyl(
          "esb_gold",
          ax,
          spring - 0.02,
          zi - n * 0.3,
          0.36,
          0.36,
          0.06,
          12,
          { arc0: 0, arc: Math.PI, grime: 0 },
        );
      }
      // fluted pilasters (between the arches) with stepped aluminium capitals and deco uplight sconces
      for (const p of PIL) {
        const x = X0 + p,
          z = zi + n * 0.25;
        b.box(M, x, 0, z, 1.1, 10.0, 0.5, { grime: 0.2 });
        for (const fl of [-0.3, -0.1, 0.1, 0.3])
          b.box(M, x + fl, 0.8, zi + n * 0.52, 0.08, 8.6, 0.06, {
            tint: 0xd8b088,
            grime: 0.1,
          });
        b.box(M, x, 0, z + n * 0.02, 1.3, 0.62, 0.62, {
          tint: MD,
          grime: 0.25,
        });
        for (let k = 0; k < 3; k++)
          b.box(
            "esb_alu",
            x,
            9.4 + k * 0.2,
            z + n * 0.03 * k,
            1.2 + k * 0.2,
            0.2,
            0.56 + k * 0.08,
            { grime: 0.05 },
          );
        // sconce: aluminium half-bowl with a glowing rim, throwing a fan of light up the pilaster
        const sz = zi + n * 0.56;
        b.cyl("esb_alu", x, 5.6, sz, 0.14, 0.42, 0.42, 10, {
          arc0: sgn > 0 ? Math.PI : 0,
          arc: Math.PI,
          top: false,
          grime: 0,
        });
        b.cyl("lit_warm", x, 6.0, sz, 0.4, 0.4, 0.03, 10, {
          arc0: sgn > 0 ? Math.PI : 0,
          arc: Math.PI,
          tint: 0xffe2b0,
        });
        fxb.panel("esb_wash", x, 7.6, zi + n * 0.575, 1.9, 3.2, face, {
          tint: 0x8a6a3e,
        });
        glows.add(x, 6.15, zi + n * 0.8, 0xffd8a0, "m");
        spill.add(x, sz + n * 0.6, 0xffc080, 1.8, { y: 0.04, i: 0.22 });
      }
      // elevator doors on the hall walls: bronze leaves, aluminium jamb + fan head, floor dial
      for (const p of ELEV) {
        const x = X0 + p,
          zf = zi + n * 0.02;
        b.panel("esb_sheet", x, 1.65, zf, 2.0, 3.3, face, {
          rect: [
            SHEET.door[0],
            SHEET.door[1],
            SHEET.door[2],
            SHEET.door[1] + (SHEET.door[3] - SHEET.door[1]) * 0.75,
          ],
        });
        b.panel("esb_sheet", x, 4.05, zf, 1.6, 0.8, face, {
          rect: [
            SHEET.door[0],
            SHEET.door[1] + (SHEET.door[3] - SHEET.door[1]) * 0.75,
            SHEET.door[2],
            SHEET.door[3],
          ],
        });
        for (const dx2 of [-1.15, 1.15])
          b.box("esb_alu", x + dx2, 0, zi + n * 0.08, 0.26, 3.5, 0.16, {
            grime: 0.05,
          });
        b.box("esb_alu", x, 3.35, zi + n * 0.08, 2.56, 0.18, 0.18, {
          grime: 0.05,
        });
        b.box("esb_bronze", x, 4.5, zi + n * 0.07, 2.2, 0.12, 0.14, {
          grime: 0.05,
        });
        glows.add(x, 4.1, zi + n * 0.35, 0xffc070, "s");
        refl.add(x, zi + n * 0.3, 2.2, 0xc89050, 1.4, { i: 0.35, y: 0.05 });
      }
      // end bays: directory board (north, by the relief) / brass mail chute (south); near the entrance: fire-alarm & a torn banner
      const ex2 = X0 + 3.2;
      if (sgn > 0) {
        b.panel("esb_sheet", ex2, 2.9, zi + n * 0.05, 1.3, 2.6, face, {
          rect: SHEET.directory,
        });
        b.boxMM(
          "esb_alu",
          ex2 - 0.72,
          1.55,
          Math.min(zi, zi + n * 0.1),
          ex2 + 0.72,
          4.25,
          Math.max(zi, zi + n * 0.1),
          { faces: "tb", grime: 0 },
        );
        glows.add(ex2, 4.35, zi + n * 0.3, 0xfff0d0, "s");
      } else {
        b.panel("esb_sheet", ex2, 1.3, zi + n * 0.34, 0.8, 0.8, face, {
          rect: SHEET.mailbox,
        });
        b.box("esb_bronze", ex2, 0.9, zi + n * 0.17, 0.82, 0.82, 0.32, {
          grime: 0.1,
        });
        b.box("esb_bronze", ex2, 1.72, zi + n * 0.05, 0.12, 5.4, 0.1, {
          grime: 0.05,
        });
      }
      // cove ledge along the top of the wall: hidden uplight trough washes the gold ceiling
      b.boxMM(
        "esb_alu",
        X0 + 0.4,
        H - 1.25,
        Math.min(zi, zi + n * 0.95),
        X1 - 0.4,
        H - 1.05,
        Math.max(zi, zi + n * 0.95),
        { grime: 0.05 },
      );
      b.boxMM(
        M,
        X0 + 0.4,
        H - 1.05,
        Math.min(zi + n * 0.85, zi + n * 0.95),
        X1 - 0.4,
        H - 0.8,
        Math.max(zi + n * 0.85, zi + n * 0.95),
        { tint: MD, grime: 0.1 },
      );
      b.boxMM(
        "lit_warm",
        X0 + 0.6,
        H - 1.05,
        Math.min(zi + n * 0.3, zi + n * 0.55),
        X1 - 0.6,
        H - 0.98,
        Math.max(zi + n * 0.3, zi + n * 0.55),
        { faces: "t", tint: 0xffe0a8 },
      );
      for (let x = X0 + 2; x < X1 - 1; x += 4) {
        spill.add(x, zi + n * 1.6, 0xffc070, 2.6, {
          y: H - 0.03,
          i: 0.38,
          sx: 2.6,
          sz: 2.2,
        });
        glows.add(x, H - 0.85, zi + n * 0.45, 0xffd090, "m");
      }
    }
    // ---------------- ceiling: three gold-leaf coffers between deep stepped beams ----------------
    const CW = (X1 - X0) / 3;
    for (let k = 0; k < 3; k++) {
      const x = X0 + k * CW;
      b.quad(
        "esb_ceiling",
        [x, H, Z0 + 1],
        [x + CW, H, Z0 + 1],
        [x + CW, H, Z1 - 1],
        [x, H, Z1 - 1],
        { rect: [0, 0, 1, 1] },
      );
      spill.add(x + CW / 2, oz, 0xffe0a0, 6.2, { y: H - 0.03, i: 0.16 });
    }
    b.boxMM("esb_ceiling", X0, H - 0.02, Z0, X1, H, Z0 + 1, {
      faces: "b",
      uv: "rect",
      rect: [0.02, 0.02, 0.98, 0.05],
    });
    b.boxMM("esb_ceiling", X0, H - 0.02, Z1 - 1, X1, H, Z1, {
      faces: "b",
      uv: "rect",
      rect: [0.02, 0.95, 0.98, 0.98],
    });
    for (let k = 1; k < 3; k++) {
      const x = X0 + k * CW;
      b.box("esb_gold", x, H - 0.9, oz, 0.5, 0.9, 14, { grime: 0.05 });
      b.box("esb_alu", x, H - 0.55, oz, 0.9, 0.55, 14, { grime: 0.05 });
      b.box("esb_gold", x, H - 0.3, oz, 1.3, 0.3, 14, { grime: 0.05 });
    }
    b.box("esb_gold", X1 - 0.5, H - 0.6, oz, 1.0, 0.6, 14, { grime: 0.05 });
    b.boxMM("plaster", X0, H, Z0, X1, H + 0.3, Z1, { faces: "t" });
    // ---------------- the aluminium relief (west wall) ----------------
    const RX = X0 + 0.4,
      RY = 5.6,
      RZ = oz,
      RW = 8.4,
      RH = 8.0,
      rb = RY - RH / 2; // panel centre / size
    b.boxMM(
      "esb_marble_r",
      RX,
      rb,
      RZ - RW / 2,
      RX + 0.12,
      rb + RH,
      RZ + RW / 2,
      { faces: "e", tint: 0x4a2412, grime: 0.15 },
    );
    for (const e of [
      [rb - 0.25, rb, -RW / 2 - 0.25, RW / 2 + 0.25],
      [rb + RH, rb + RH + 0.25, -RW / 2 - 0.25, RW / 2 + 0.25],
      [rb, rb + RH, -RW / 2 - 0.25, -RW / 2],
      [rb, rb + RH, RW / 2, RW / 2 + 0.25],
    ])
      b.boxMM("esb_alu_r", RX, e[0], RZ + e[2], RX + 0.3, e[1], RZ + e[3], {
        grime: 0.03,
      });
    for (const e of [
      [rb - 0.45, rb - 0.25],
      [rb + RH + 0.25, rb + RH + 0.45],
    ])
      b.boxMM(
        "esb_gold_r",
        RX,
        e[0],
        RZ - RW / 2 - 0.45,
        RX + 0.22,
        e[1],
        RZ + RW / 2 + 0.45,
        { grime: 0.03 },
      );
    // sunburst: rays from behind the mooring mast out to the frame (alternating aluminium / gold)
    const SY = 7.8,
      sx0 = RX + 0.16;
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * Math.PI * 2,
        ca = Math.cos(a),
        sa = Math.sin(a);
      let tMax = 99;
      if (Math.abs(ca) > 1e-3)
        tMax = Math.min(tMax, (RW / 2 - 0.1) / Math.abs(ca));
      if (sa > 1e-3) tMax = Math.min(tMax, (rb + RH - 0.1 - SY) / sa);
      if (sa < -1e-3) tMax = Math.min(tMax, (SY - rb - 0.1) / -sa);
      b.beam(
        k % 2 ? "esb_alu_r" : "esb_gold_r",
        sx0,
        SY + sa * 0.95,
        RZ + ca * 0.95,
        sx0,
        SY + sa * tMax,
        RZ + ca * tMax,
        k % 2 ? 0.05 : 0.09,
        { d: 0.05, grime: 0 },
      );
    }
    b.geo("esb_gold_r", T.cyl12, {
      x: RX + 0.2,
      y: SY,
      z: RZ,
      rz: Math.PI / 2,
      sx: 0.9,
      sy: 0.08,
      sz: 0.9,
      grime: 0,
    });
    b.geo("esb_alu_r", T.torus, {
      x: RX + 0.25,
      y: SY,
      z: RZ,
      ry: Math.PI / 2,
      s: 1.15,
      grime: 0,
    });
    // the tower in stepped aluminium, standing proud of the panel, with vertical fins
    const tiers = [
      [rb + 0.1, 3.3, 4.6, 0.46],
      [3.3, 5.9, 3.2, 0.56],
      [5.9, 6.7, 2.4, 0.62],
      [6.7, 7.2, 1.8, 0.66],
      [7.2, 7.6, 1.2, 0.7],
      [7.6, 8.0, 0.74, 0.74],
      [8.0, 8.7, 0.42, 0.76],
      [8.7, 9.2, 0.2, 0.78],
    ];
    for (const t of tiers) {
      b.boxMM(
        "esb_alu_r",
        RX,
        t[0],
        RZ - t[2] / 2,
        RX + t[3],
        t[1],
        RZ + t[2] / 2,
        { grime: 0.02 },
      );
      for (let z = -t[2] / 2 + 0.12; z < t[2] / 2 - 0.05; z += 0.2)
        b.boxMM(
          "esb_gold_r",
          RX + t[3],
          t[0] + 0.05,
          RZ + z - 0.018,
          RX + t[3] + 0.03,
          t[1] - 0.05,
          RZ + z + 0.018,
          { grime: 0 },
        );
      b.boxMM(
        "esb_gold_r",
        RX,
        t[1] - 0.06,
        RZ - t[2] / 2 - 0.04,
        RX + t[3] + 0.04,
        t[1],
        RZ + t[2] / 2 + 0.04,
        { grime: 0 },
      );
    }
    b.beam("esb_alu_r", RX + 0.6, 9.2, RZ, RX + 0.6, rb + RH - 0.05, RZ, 0.07, {
      grime: 0,
    });
    b.panel("esb_sheet", RX + 0.34, rb + RH + 0.9, RZ, 4.8, 0.8, Math.PI / 2, {
      rect: SHEET.name,
    });
    b.panel("esb_sheet", RX + 0.3, 2.2, RZ + 3.1, 1.3, 1.3, Math.PI / 2, {
      rect: SHEET.daub,
    }); // the Brutes' claim, daubed on the panel
    // spotlight on the relief: gold fixture on the first beam, visible dusty cone, hot-spot, floor reflection, real light
    const FX = X0 + CW - 0.2,
      FY = H - 1.1;
    b.cyl("esb_gold", FX, FY, RZ, 0.28, 0.2, 0.5, 10, { grime: 0 });
    b.geo("lit_warm", T.sphereLo, {
      x: FX - 0.12,
      y: FY - 0.05,
      z: RZ,
      s: 0.2,
      tint: 0xfff2d8,
    });
    glows.add(FX - 0.25, FY - 0.08, RZ, 0xfff0d0, "l");
    shaft(
      fxb,
      [FX - 0.2, FY - 0.1, RZ],
      [RX + 0.5 - FX, RY + 0.4 - FY, 0],
      Math.hypot(RX + 0.5 - FX, RY + 0.4 - FY) - 0.4,
      0.2,
      3.4,
      0x5a4c38,
    );
    fxb.panel("esb_hot", RX + 1.0, RY + 0.6, RZ, 9.5, 10.5, Math.PI / 2, {
      tint: 0x948468,
    });
    fxb.panel("esb_hot", RX + 1.05, SY, RZ, 3.6, 3.6, Math.PI / 2, {
      tint: 0x7a6044,
    });
    refl.add(RX + 0.6, RZ, 5.5, 0xffe2b8, 5.0, { len: 9, i: 0.55, y: 0.05 });
    refl.add(RX + 0.6, RZ, 8.3, 0xffc860, 1.6, { len: 12, i: 0.45, y: 0.05 });
    spill.add(RX + 3, RZ, 0xffe0b0, 4.2, { y: 0.04, i: 0.3, sx: 3.6, sz: 5.2 });
    fixtures.push([
      RX + 2.2,
      RY + 1,
      RZ,
      0xfff0d8,
      { intensity: 1.6, range: 12, glow: false },
    ]);
    // information desk (half-round, marble with aluminium bands and a gold rail), two deco desk lamps
    const deskX = X0 + 5.2;
    b.cyl(M, deskX, 0, oz, 2.6, 2.6, 1.1, 20, {
      arc0: -Math.PI / 2,
      arc: Math.PI,
      tint: 0x8a5230,
      grime: 0.15,
    });
    for (const y of [0.1, 0.5, 0.9])
      b.cyl("esb_alu", deskX, y, oz, 2.63, 2.63, 0.06, 20, {
        arc0: -Math.PI / 2,
        arc: Math.PI,
        top: false,
        grime: 0,
      });
    b.cyl("esb_gold", deskX, 1.1, oz, 2.72, 2.72, 0.07, 20, {
      arc0: -Math.PI / 2,
      arc: Math.PI,
      grime: 0,
    });
    b.boxMM(M, deskX - 0.3, 0, oz - 2.6, deskX, 1.1, oz + 2.6, {
      tint: 0x8a5230,
      grime: 0.15,
    });
    K.colBox(deskX - 0.3, 0, oz - 2.6, deskX + 2.7, 1.1, oz + 2.6, {
      surface: "wood",
    });
    for (const dz of [-2.0, 2.0]) {
      b.cyl("esb_alu", deskX + 0.9, 1.17, oz + dz, 0.12, 0.08, 0.45, 8, {
        grime: 0,
      });
      b.cyl("lit_warm", deskX + 0.9, 1.6, oz + dz, 0.2, 0.26, 0.24, 8, {
        tint: 0xffe0b0,
      });
      glows.add(deskX + 0.9, 1.72, oz + dz, 0xffd8a0, "m");
    }
    // ---------------- deco lanterns: four tiered aluminium-and-frosted-glass pendants on the axis ----------------
    for (const lxr of [11, 19, 27, 35]) {
      const x = X0 + lxr,
        z = oz;
      b.beam("esb_bronze", x, H, z, x, 9.95, z, 0.05, { grime: 0 });
      b.cyl("esb_alu", x, 9.82, z, 0.62, 0.34, 0.14, 8, {
        grime: 0,
        yaw: Math.PI / 8,
      });
      const tiersL = [
        [9.2, 9.82, 0.56],
        [8.62, 9.2, 0.46],
        [8.16, 8.62, 0.34],
      ];
      for (const tl of tiersL) {
        b.cyl("lit_warm", x, tl[0], z, tl[2], tl[2], tl[1] - tl[0], 8, {
          tint: 0xffe8c4,
          yaw: Math.PI / 8,
        });
        b.cyl(
          "esb_alu",
          x,
          tl[0] - 0.03,
          z,
          tl[2] + 0.04,
          tl[2] + 0.04,
          0.06,
          8,
          { grime: 0, yaw: Math.PI / 8 },
        );
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          b.box(
            "esb_alu",
            x + Math.cos(a) * (tl[2] + 0.02),
            tl[0],
            z - Math.sin(a) * (tl[2] + 0.02),
            0.05,
            tl[1] - tl[0],
            0.05,
            { grime: 0 },
          );
        }
      }
      b.geo("esb_gold", T.cone8, {
        x,
        y: 7.96,
        z,
        rx: Math.PI,
        sx: 0.2,
        sy: 0.4,
        sz: 0.2,
        grime: 0,
      });
      glows.add(x, 9.0, z, 0xffd9a0, "l");
      glows.add(x, 9.5, z, 0xffe8c0, "m");
      glows.add(x, 8.4, z, 0xffe8c0, "m");
      spill.add(x, z, 0xffd090, 5.2, { y: 0.04, i: 0.3 });
      spill.add(x, z, 0xffe0b0, 2.8, { y: H - 0.03, i: 0.3 });
      refl.add(x, z, 9.0, 0xffe0b0, 1.3, { len: 11, i: 0.7, y: 0.05 });
      shaft(fxb, [x, 8.0, z], [0, -1, 0], 7.9, 0.45, 2.3, 0x3a3022);
      fixtures.push([
        x,
        8.7,
        z,
        0xffd9a0,
        { intensity: 1.3, range: 13, glow: false },
      ]);
    }
    // ---------------- entrance vestibule (east): sealed by the interactable door ----------------
    b.panel("glass_broken", X1 - 0.5, 3.75, oz, 5, 7.5, -Math.PI / 2);
    K.colBox(X1 - 0.7, 0, oz - 2.6, X1 + 0.4, H, oz + 2.6, {
      surface: "metal",
    });
    for (const dz of [-2.5, -1.25, 0, 1.25, 2.5])
      b.box("esb_bronze", X1 - 0.56, 0, oz + dz, 0.14, 7.5, 0.14, {
        grime: 0.2,
      });
    for (const y of [0, 2.7, 3.2, 7.35])
      b.box("esb_bronze", X1 - 0.56, y, oz, 0.16, 0.15, 5.1, { grime: 0.2 });
    for (const dz of [-1.25, 1.25]) {
      b.cyl("esb_bronze", X1 - 1.2, 0, oz + dz, 0.62, 0.62, 2.6, 12, {
        arc0: Math.PI / 2,
        arc: Math.PI,
        grime: 0.2,
      });
      b.cyl("esb_bronze", X1 - 1.2, 2.55, oz + dz, 0.66, 0.66, 0.12, 12, {
        arc0: Math.PI / 2,
        arc: Math.PI,
        grime: 0.1,
      });
    }
    K.colBox(X1 - 1.9, 0, oz - 2, X1 - 0.6, 2.6, oz + 2, { surface: "metal" });
    b.panel("lit_warm", X1 - 0.52, 5.2, oz, 4.6, 3.6, -Math.PI / 2, {
      tint: 0x7a7058,
    }); // grimy daylight in the transom
    for (let k = 1; k < 8; k++)
      b.box(
        "esb_bronze",
        X1 - 0.55,
        3.4,
        oz - 2.3 + k * 0.575,
        0.06,
        3.6,
        0.05,
        { grime: 0.1 },
      );
    glows.add(X1 - 1.4, 5.0, oz, 0xfff0d0, "l");
    b.panel("atlas_paint", X1 - 0.45, 9.1, oz, 6, 0.75, -Math.PI / 2, {
      rect: K.paint("esb_sign", 1024, 128),
    });
    // dusty daylight shafts from the transom, slanting down the hall
    for (const dz of [-1.5, 0, 1.5])
      shaft(
        fxb,
        [X1 - 0.7, 5.6, oz + dz],
        [-1, -0.34, dz * 0.02],
        15,
        0.7,
        1.6,
        0x2e2a22,
      );
    spill.add(X1 - 13, oz, 0xfff0d0, 3.2, { y: 0.04, i: 0.22, sx: 4.5, sz: 3 });
    refl.add(X1 - 0.8, oz, 5.2, 0xfff0d8, 3.6, { len: 12, i: 0.4, y: 0.05 });
    // ---------------- elevator bays (north & south) ----------------
    const bay = (zWall, dir) => {
      const zb = zWall + dir * 7;
      b.boxMM(
        M,
        X0 + 6,
        0,
        Math.min(zWall, zb) - 0.3,
        X0 + 6.6,
        7.5,
        Math.max(zWall, zb) + 0.3,
        { grime: 0.2 },
      );
      b.boxMM(
        M,
        X1 - 6.6,
        0,
        Math.min(zWall, zb) - 0.3,
        X1 - 6,
        7.5,
        Math.max(zWall, zb) + 0.3,
        { grime: 0.2 },
      );
      K.colBox(
        X0 + 6,
        0,
        Math.min(zWall, zb),
        X0 + 6.6,
        7.5,
        Math.max(zWall, zb),
      );
      K.colBox(
        X1 - 6.6,
        0,
        Math.min(zWall, zb),
        X1 - 6,
        7.5,
        Math.max(zWall, zb),
      );
      b.wall(M, X0 + 6, zb, X1 - 6, zb, 0, 7.5, 0.6, [], {});
      b.boxMM(
        "esb_ceiling",
        X0 + 6,
        7.5,
        Math.min(zWall, zb),
        X1 - 6,
        7.8,
        Math.max(zWall, zb),
        { faces: "b", uv: "rect", rect: [0.3, 0.3, 0.7, 0.45] },
      );
      b.boxMM(
        "esb_floor",
        X0 + 6,
        0.02,
        Math.min(zWall, zb),
        X1 - 6,
        0.04,
        Math.max(zWall, zb),
        { faces: "t", grime: 0.25 },
      );
      const zf = zb - dir * 0.32,
        face = dir > 0 ? Math.PI : 0;
      for (let x = X0 + 9; x < X1 - 8; x += 4.5) {
        b.panel("esb_sheet", x, 1.65, zf, 1.9, 3.3, face, {
          rect: [
            SHEET.door[0],
            SHEET.door[1],
            SHEET.door[2],
            SHEET.door[1] + (SHEET.door[3] - SHEET.door[1]) * 0.75,
          ],
        });
        b.panel("esb_sheet", x, 3.75, zf, 1.4, 0.7, face, {
          rect: [
            SHEET.door[0],
            SHEET.door[1] + (SHEET.door[3] - SHEET.door[1]) * 0.75,
            SHEET.door[2],
            SHEET.door[3],
          ],
        });
        for (const dx2 of [-1.08, 1.08])
          b.box("esb_alu", x + dx2, 0, zf - dir * 0.06, 0.22, 3.45, 0.14, {
            grime: 0.05,
          });
        b.box("esb_alu", x, 3.3, zf - dir * 0.06, 2.4, 0.16, 0.14, {
          grime: 0.05,
        });
        glows.add(x, 4.2, zb - dir * 0.5, 0xffc070, "s");
      }
      for (let x = X0 + 11; x < X1 - 8; x += 9) {
        b.panel("lit_warm", x, 5.5, zb - dir * 0.34, 0.6, 1.0, face);
        glows.add(x, 5.5, zb - dir * 0.7, 0xffc880, "m");
        fxb.panel("esb_wash", x, 6.6, zb - dir * 0.33, 1.4, 1.8, face, {
          tint: 0x6a5230,
        });
      }
    };
    bay(Z0, -1);
    bay(Z1, 1);
    // ---------------- Brute squat (kept off the axis so the relief reads down the hall) ----------------
    for (const gx of [-12, -6, 2, 9, 15])
      P.meatBag(b, ox + gx, H, oz + (gx % 2 ? 4.6 : -4.6), { len: 3.2 });
    P.cage(b, ox - 10, oz + 4.2, 2, 2.5, {});
    P.cage(b, ox - 13, oz + 4.2, 2, 2.5, {});
    for (const m of [
      [-2, -4.5, 0.2],
      [0, -4.2, 1.4],
      [5, 4.5, 0.4],
      [-15, -4.8, 1.2],
    ])
      P.mattress(b, ox + m[0], 0.02, oz + m[1], m[2]);
    P.barrel(b, ox + 3, 0, oz + 3.2, "fire", { glows, collide: true });
    spill.add(ox + 3, oz + 3.2, 0xff7a28, 3.2, { y: 0.04, i: 0.45 });
    refl.add(ox + 3, oz + 3.2, 1.4, 0xff8a30, 1.2, { len: 4, i: 0.6, y: 0.05 });
    P.scrapWall(b, X1 - 5, Z0 + 1, X1 - 5, oz - 3, 2.4, { seed: 51 });
    P.scrapWall(b, X1 - 5, oz + 3, X1 - 5, Z1 - 1, 2.4, { seed: 52 });
    P.rubblePile(b, ox + 8, oz - 4, 1.8, 1.1, { seed: 53 });
    for (let k = 0; k < 6; k++)
      P.skeleton(b, ox - 16 + k * 2.2, 0.03, oz - 5 + (k % 2) * 9.5, k * 1.3);
    P.crate(b, ox - 18, 0, oz - 5, 1.0, 0.2);
    P.crate(b, ox - 18, 1.0, oz - 5, 0.8, 0.5);
    P.crate(b, ox - 16.6, 0, oz - 5.4, 0.9, 0.9);
    b.burn(ox + 3, 0.5, oz + 3.2, 4, 0.45);
    b.finish(rec.root, { cast: false });
    fxb.finish(rec.root, { cast: false, receive: false });
    glows.finish(rec.root, { interior: true, nightOpacity: 0.9 });
    spill.finish(rec.root, { interior: true, night: 1 });
    refl.finish(rec.root, { interior: true, night: 1, wet: 0 });
    // dust motes drifting through the light (one Points draw call, only animated while you're in here)
    {
      const N = 220,
        pos = new Float32Array(N * 3),
        seed = [],
        rr = K.rng(1937);
      for (let i = 0; i < N; i++) {
        seed.push([
          X0 + 2 + rr() * 40,
          0.5 + rr() * 9.5,
          oz + (rr() - 0.5) * 11,
          rr() * 6.28,
        ]);
        pos[i * 3] = seed[i][0];
        pos[i * 3 + 1] = seed[i][1];
        pos[i * 3 + 2] = seed[i][2];
      }
      const g2 = new THREE.BufferGeometry();
      g2.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const pm = new THREE.PointsMaterial({
        size: 0.05,
        map: K.glowTex(),
        color: 0xffe6b8,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.55,
        sizeAttenuation: true,
      });
      const motes = new THREE.Points(g2, pm);
      motes.name = "lma_esb_dust";
      motes.frustumCulled = false;
      rec.root.add(motes);
      K.animate((dt, t) => {
        const cam = G.camera;
        if (!cam || cam.position.x < G.LAYOUT.INTERIOR_X_MIN) {
          motes.visible = false;
          return;
        }
        motes.visible = true;
        for (let i = 0; i < N; i++) {
          const s0 = seed[i];
          pos[i * 3] = s0[0] + Math.sin(t * 0.13 + s0[3]) * 0.8;
          pos[i * 3 + 1] = 0.5 + ((s0[1] - t * 0.05 + 20) % 9.5);
          pos[i * 3 + 2] = s0[2] + Math.cos(t * 0.11 + s0[3] * 1.7) * 0.8;
        }
        g2.attributes.position.needsUpdate = true;
      });
    }
    // real (borrowed) pools of light for the nearest lanterns / the relief spot (atmosphere's fixture pool)
    try {
      if (!G.isStub("atmos") && G.atmos && G.atmos.addFixtureLight)
        for (const f of fixtures)
          G.atmos.addFixtureLight(
            new THREE.Vector3(f[0], f[1], f[2]),
            f[3],
            f[4],
          );
    } catch (e) {
      G.reportError("landmarks_a:esb_fixtures", e);
    }

    // --- doors ---
    const deckT = rec.anchors.deck_elevator;
    // (the exit sits on the face of the revolving drums: the drum collider X1-1.9…X1-0.6 hid a door placed behind it
    //  from the interaction line-of-sight test, so the lobby could not be left — round 2 door audit)
    G.world.addDoor({
      pos: new THREE.Vector3(X1 - 2.0, 1.6, oz),
      radius: 1.4,
      label: "Fifth Avenue",
      verb: "Exit to",
      target: { x: 112.4, y: 0, z: -72.5, yaw: -Math.PI / 2 },
      sound: "door_open",
    });
    // outside → lobby
    G.world.addDoor({
      pos: new THREE.Vector3(110.9, 1.6, -72.5),
      label: "Empire State Building — Lobby",
      verb: "Enter",
      target: { x: X1 - 3.4, y: 0, z: oz, yaw: Math.PI / 2 },
      sound: "door_open",
    });
    // express elevator (south bay, first door) ↔ observation deck
    const elevX = X0 + 9,
      elevZ = Z1 + 7 - 0.9;
    G.world.addDoor({
      pos: new THREE.Vector3(elevX, 1.6, elevZ),
      label: "Express Elevator — 86th Floor Observatory",
      verb: "Ride",
      target: { x: deckT.x + 1.2, y: DECK_Y, z: deckT.z, yaw: -Math.PI / 2 },
      sound: "door_open",
    });
    G.world.addDoor({
      pos: new THREE.Vector3(86.4, DECK_Y + 1.6, -72.5),
      label: "Elevator — Lobby",
      verb: "Ride",
      target: { x: elevX, y: 0, z: elevZ - 1.4, yaw: 0 },
      sound: "door_open",
    });
    const ir = K.paint("observatory_sign", 512, 96);
    const s2 = K.builder("esb_lobby_sign", { grime: 0 });
    s2.panel("atlas_paint", elevX, 4.3, elevZ + 0.52, 2.4, 0.45, Math.PI, {
      rect: ir,
    });
    s2.finish(rec.root, { cast: false });

    rec.anchor("lobby_entrance", X1 - 3.4, 0, oz, Math.PI / 2);
    rec.anchor("lobby_boss", X0 + 9, 0, oz, -Math.PI / 2);
    rec.anchor("lobby_spawn1", ox - 4, 0, oz - 3, 0);
    rec.anchor("lobby_spawn2", ox + 6, 0, oz + 3, 0);
    rec.anchor("lobby_spawn3", ox - 12, 0, oz, 0);
    rec.anchor("terminal", deskX + 1.0, 1.1, oz + 0.5, -Math.PI / 2);
    rec.anchor("lobby_loot", X0 + 2, 0, oz - 5, 0);
    rec.anchor("elevator", elevX, 0, elevZ - 1.4, 0);
  }

  K.defineInterior("empire_state", function (ctx) {
    DECK_Y = ctx.DECK_Y;
    lobby(ctx.rec);
  });
})();
