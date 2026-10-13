// play-inline-111 03 — addcolorstop
// Lines 135-730 of readable/play-inline-111.pretty.js (statement-aligned).
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
