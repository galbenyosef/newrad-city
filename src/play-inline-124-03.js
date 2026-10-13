// play-inline-124 03 — math
// Lines 25-412 of readable/play-inline-124.pretty.js (statement-aligned).
  function textures() {
    // Stained-glass lancet (pointed arch cut-out, alpha outside)
    const c = K.canvas(256, 512),
      x = c.getContext("2d");
    const r = K.rng(1879);
    x.clearRect(0, 0, 256, 512);
    x.save();
    x.beginPath();
    x.moveTo(8, 512);
    x.lineTo(8, 170);
    x.quadraticCurveTo(8, 20, 128, 4);
    x.quadraticCurveTo(248, 20, 248, 170);
    x.lineTo(248, 512);
    x.closePath();
    x.clip();
    const cols = [
      "#3a5aa8",
      "#a82a2a",
      "#d8a830",
      "#2a8a4a",
      "#7a3a9a",
      "#2a6a8a",
      "#e0d0a0",
    ];
    for (let yy = 0; yy < 512; yy += 32)
      for (let xx = 0; xx < 256; xx += 32) {
        x.fillStyle = cols[Math.floor(r() * cols.length)];
        x.fillRect(xx, yy, 32, 32);
      }
    // figure medallions
    for (const my of [140, 300, 430]) {
      x.fillStyle = "#e8d8a8";
      x.beginPath();
      x.arc(128, my, 48, 0, 7);
      x.fill();
      x.fillStyle = cols[Math.floor(r() * 5)];
      x.beginPath();
      x.arc(128, my - 14, 14, 0, 7);
      x.fill();
      x.fillRect(114, my, 28, 40);
    }
    x.strokeStyle = "#141414";
    x.lineWidth = 5;
    for (let yy = 0; yy < 512; yy += 32) {
      x.beginPath();
      x.moveTo(0, yy);
      x.lineTo(256, yy);
      x.stroke();
    }
    for (let xx = 0; xx < 256; xx += 32) {
      x.beginPath();
      x.moveTo(xx, 0);
      x.lineTo(xx, 512);
      x.stroke();
    }
    // broken panes
    x.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 10; k++) {
      x.beginPath();
      x.moveTo(r() * 256, r() * 512);
      x.lineTo(r() * 256, r() * 512);
      x.lineTo(r() * 256, r() * 512);
      x.fill();
    }
    x.restore();
    x.globalCompositeOperation = "source-over";
    x.strokeStyle = "#d8d2c4";
    x.lineWidth = 14;
    x.beginPath();
    x.moveTo(8, 512);
    x.lineTo(8, 170);
    x.quadraticCurveTo(8, 20, 128, 4);
    x.quadraticCurveTo(248, 20, 248, 170);
    x.lineTo(248, 512);
    x.stroke();
    x.lineWidth = 8;
    x.beginPath();
    x.moveTo(128, 60);
    x.lineTo(128, 512);
    x.stroke();
    const st = K.texFromCanvas(c, { clamp: true });
    K.defineMat("stained", {
      map: st,
      emissiveMap: st,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.55,
      color: 0xffffff,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      rough: 0.3,
      noShadow: true,
    });
    // Rose window: gothic tracery — 16 pointed petal lights radiating from a cusped centre, a ring of
    // quatrefoil oculi and an outer ring of trefoils, all in thick marble mullions over deep jewel glass.
    const rc = K.canvas(512, 512),
      rx = rc.getContext("2d"),
      rr2 = K.rng(1880);
    rx.clearRect(0, 0, 512, 512);
    rx.save();
    rx.translate(256, 256);
    const glassCols = [
      "#1c2c6a",
      "#6a1418",
      "#243c8a",
      "#7a5a14",
      "#1a4a2a",
      "#4a1c5a",
      "#8a1c1c",
      "#14305a",
    ];
    const stone = "#d4cebf",
      stoneDk = "#8a8478";
    // glass disc (deep, mottled)
    rx.fillStyle = "#101a3a";
    rx.beginPath();
    rx.arc(0, 0, 246, 0, 7);
    rx.fill();
    for (let k = 0; k < 900; k++) {
      const a = rr2() * 6.283,
        r = Math.sqrt(rr2()) * 244;
      rx.fillStyle = glassCols[Math.floor(rr2() * glassCols.length)];
      rx.fillRect(Math.cos(a) * r - 7, Math.sin(a) * r - 7, 14, 14);
    }
    // lead came grid
    rx.strokeStyle = "rgba(10,10,12,0.8)";
    rx.lineWidth = 1.5;
    for (let r = 20; r < 246; r += 14) {
      rx.beginPath();
      rx.arc(0, 0, r, 0, 7);
      rx.stroke();
    }
    for (let k = 0; k < 64; k++) {
      const a = (k / 64) * 6.283;
      rx.beginPath();
      rx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
      rx.lineTo(Math.cos(a) * 246, Math.sin(a) * 246);
      rx.stroke();
    }
    const petal = (a, r0, r1, wid) => {
      // pointed-arch petal outline from r0 to r1
      const ca = Math.cos(a),
        sa = Math.sin(a),
        px = -sa,
        py = ca;
      rx.beginPath();
      rx.moveTo(ca * r0 + px * wid * 0.3, sa * r0 + py * wid * 0.3);
      rx.quadraticCurveTo(
        ca * (r0 + r1) * 0.5 + px * wid,
        sa * (r0 + r1) * 0.5 + py * wid,
        ca * r1,
        sa * r1,
      );
      rx.quadraticCurveTo(
        ca * (r0 + r1) * 0.5 - px * wid,
        sa * (r0 + r1) * 0.5 - py * wid,
        ca * r0 - px * wid * 0.3,
        sa * r0 - py * wid * 0.3,
      );
      rx.closePath();
    };
    const foil = (cx, cy, r, n) => {
      rx.beginPath();
      for (let k = 0; k < n; k++) {
        const a = (k / n) * 6.283;
        rx.moveTo(cx + Math.cos(a) * r * 0.5 + r * 0.5, cy);
        rx.arc(
          cx + Math.cos(a) * r * 0.5,
          cy + Math.sin(a) * r * 0.5,
          r * 0.5,
          0,
          6.283,
        );
      }
    };
    // stone: everything that is NOT a light
    rx.lineJoin = "round";
    for (let k = 0; k < 16; k++) {
      petal((k / 16) * 6.283, 46, 168, 24);
      rx.strokeStyle = stone;
      rx.lineWidth = 9;
      rx.stroke();
      rx.strokeStyle = stoneDk;
      rx.lineWidth = 2;
      rx.stroke();
    }
    for (let k = 0; k < 16; k++) {
      const a = ((k + 0.5) / 16) * 6.283,
        cx = Math.cos(a) * 150,
        cy = Math.sin(a) * 150;
      rx.strokeStyle = stone;
      rx.lineWidth = 7;
      rx.beginPath();
      rx.arc(cx, cy, 17, 0, 7);
      rx.stroke();
    }
    for (let k = 0; k < 32; k++) {
      const a = (k / 32) * 6.283,
        cx = Math.cos(a) * 212,
        cy = Math.sin(a) * 212;
      rx.strokeStyle = stone;
      rx.lineWidth = 6;
      rx.beginPath();
      rx.arc(cx, cy, 19, 0, 7);
      rx.stroke();
      foil(cx, cy, 16, 3);
      rx.lineWidth = 2.5;
      rx.stroke();
    }
    rx.strokeStyle = stone;
    rx.lineWidth = 12;
    for (const r of [44, 176, 190, 238]) {
      rx.beginPath();
      rx.arc(0, 0, r, 0, 7);
      rx.stroke();
    }
    rx.lineWidth = 6;
    for (let k = 0; k < 32; k++) {
      const a = (k / 32) * 6.283;
      rx.beginPath();
      rx.moveTo(Math.cos(a) * 190, Math.sin(a) * 190);
      rx.lineTo(Math.cos(a) * 238, Math.sin(a) * 238);
      rx.stroke();
    }
    // cusped centre repainted by the faithful as a gold sun disc
    rx.fillStyle = stone;
    rx.beginPath();
    rx.arc(0, 0, 40, 0, 7);
    rx.fill();
    K.sunDisc(rx, 0, 0, 30, "#ffc040", 3);
    // shattered lights (alpha holes) + outer moulding
    rx.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 7; k++) {
      const a = rr2() * 6.283,
        r = 60 + rr2() * 170;
      rx.beginPath();
      rx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      rx.lineTo(Math.cos(a + 0.08) * (r + 22), Math.sin(a + 0.08) * (r + 22));
      rx.lineTo(Math.cos(a - 0.06) * (r + 14), Math.sin(a - 0.06) * (r + 14));
      rx.fill();
    }
    rx.globalCompositeOperation = "source-over";
    rx.strokeStyle = stone;
    rx.lineWidth = 14;
    rx.beginPath();
    rx.arc(0, 0, 248, 0, 7);
    rx.stroke();
    rx.restore();
    K.grain(rx, 512, 512, 12, 1881);
    const rt = K.texFromCanvas(rc, { clamp: true });
    K.defineMat("rose", {
      map: rt,
      emissiveMap: rt,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.5,
      color: 0xffffff,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      noShadow: true,
    });
    K.paint("glowkeeper_banner", 256, 640, (x2, W, H) => {
      x2.fillStyle = "#e8e2d0";
      x2.fillRect(0, 0, W, H);
      x2.fillStyle = "#b8701a";
      x2.fillRect(0, 0, W, 30);
      x2.fillRect(0, H - 30, W, 30);
      K.sunDisc(x2, W / 2, H * 0.32, 90, "#d8901a", 9);
      x2.fillStyle = "#5a3008";
      x2.font = "bold 34px Georgia, serif";
      x2.textAlign = "center";
      x2.fillText("KEEP THE", W / 2, H * 0.6);
      x2.fillText("LIGHT ON", W / 2, H * 0.67);
      x2.font = "italic 21px Georgia, serif";
      x2.fillText("the Sun does not choose", W / 2, H * 0.78);
      K.stains(x2, W, H, 8, 51, 0.3);
      K.streaks(x2, W, H, 16, 52, 0.25);
    });
    K.paint("stpat_door", 128, 256, (x2, W, H) => {
      const g = x2.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "#4a3218");
      g.addColorStop(0.5, "#8a6232");
      g.addColorStop(1, "#4a3218");
      x2.fillStyle = g;
      x2.fillRect(0, 0, W, H);
      // six figure panels (saints in niches) in raised bronze frames, verdigris running down from the bosses
      for (let r = 0; r < 3; r++) {
        const y0 = 14 + r * 80,
          x0 = 14,
          w = W - 28,
          h = 70;
        x2.fillStyle = "#3a2610";
        x2.fillRect(x0, y0, w, h);
        x2.strokeStyle = "#c89a52";
        x2.lineWidth = 3;
        x2.strokeRect(x0 + 2, y0 + 2, w - 4, h - 4);
        x2.fillStyle = "#9a7040";
        x2.beginPath();
        x2.moveTo(W / 2 - 16, y0 + h - 6);
        x2.lineTo(W / 2 - 12, y0 + 24);
        x2.quadraticCurveTo(W / 2, y0 + 8, W / 2 + 12, y0 + 24);
        x2.lineTo(W / 2 + 16, y0 + h - 6);
        x2.fill();
        x2.fillStyle = "#b88a4a";
        x2.beginPath();
        x2.arc(W / 2, y0 + 20, 7, 0, 7);
        x2.fill();
        x2.strokeStyle = "rgba(210,190,120,0.5)";
        x2.lineWidth = 1.5;
        x2.beginPath();
        x2.arc(W / 2, y0 + 19, 11, Math.PI, 0);
        x2.stroke();
      }
      for (let k = 0; k < 14; k++) {
        const x = 10 + ((k * 37) % (W - 20)),
          y = 10 + ((k * 53) % (H - 40));
        const gg = x2.createLinearGradient(0, y, 0, y + 60);
        gg.addColorStop(0, "rgba(80,160,130,0.55)");
        gg.addColorStop(1, "rgba(80,160,130,0)");
        x2.fillStyle = gg;
        x2.fillRect(x, y, 3 + (k % 3), 60);
      }
      x2.fillStyle = "#c8a060";
      x2.beginPath();
      x2.arc(W - 20, H * 0.55, 5, 0, 7);
      x2.fill();
    });
    K.paint("stpat_tymp", 256, 160, (x2, W, H) => {
      x2.clearRect(0, 0, W, H);
      x2.save();
      x2.beginPath();
      x2.moveTo(0, H);
      x2.lineTo(0, H * 0.72);
      x2.quadraticCurveTo(0, H * 0.12, W / 2, 0);
      x2.quadraticCurveTo(W, H * 0.12, W, H * 0.72);
      x2.lineTo(W, H);
      x2.closePath();
      x2.clip();
      x2.fillStyle = "#b8b2a4";
      x2.fillRect(0, 0, W, H);
      // carved relief: a seated central figure under a canopy flanked by standing figures (shadowed carving)
      const fig = (cx, cy, s, seated) => {
        x2.fillStyle = "rgba(60,56,48,0.55)";
        x2.beginPath();
        x2.arc(cx + 2, cy - s * 1.4 + 2, s * 0.35, 0, 7);
        x2.fill();
        x2.fillRect(
          cx - s * 0.45 + 2,
          cy - s + 2,
          s * 0.9,
          seated ? s * 0.8 : s * 1.2,
        );
        x2.fillStyle = "#d8d2c2";
        x2.beginPath();
        x2.arc(cx, cy - s * 1.4, s * 0.35, 0, 7);
        x2.fill();
        x2.beginPath();
        x2.moveTo(cx - s * 0.5, cy + (seated ? -0.2 : 0.2) * s);
        x2.lineTo(cx - s * 0.3, cy - s);
        x2.lineTo(cx + s * 0.3, cy - s);
        x2.lineTo(cx + s * 0.5, cy + (seated ? -0.2 : 0.2) * s);
        x2.fill();
      };
      fig(W / 2, H * 0.86, 38, true);
      fig(W * 0.24, H * 0.98, 30, false);
      fig(W * 0.76, H * 0.98, 30, false);
      fig(W * 0.1, H * 1.02, 22, false);
      fig(W * 0.9, H * 1.02, 22, false);
      x2.strokeStyle = "rgba(70,64,54,0.6)";
      x2.lineWidth = 3;
      x2.beginPath();
      x2.moveTo(W * 0.36, H * 0.6);
      x2.quadraticCurveTo(W / 2, H * 0.22, W * 0.64, H * 0.6);
      x2.stroke();
      // the Glowkeepers painted their sun over it
      K.sunDisc(x2, W / 2, H * 0.44, 26, "rgba(255,180,60,0.85)", 4);
      K.stains(x2, W, H, 6, 1882, 0.35);
      K.streaks(x2, W, H, 10, 1883, 0.3);
      x2.restore();
    });
    K.paint("glowkeeper_graffiti", 512, 256, (x2, W, H) => {
      x2.clearRect(0, 0, W, H);
      K.sunDisc(x2, W * 0.3, H / 2, 90, "rgba(255,170,50,0.9)", 12);
      x2.fillStyle = "rgba(255,170,50,0.9)";
      x2.font = "bold 34px Impact, sans-serif";
      x2.textAlign = "left";
      x2.fillText("KEEP THE LIGHT ON", W * 0.5, H * 0.58);
    });
  }

