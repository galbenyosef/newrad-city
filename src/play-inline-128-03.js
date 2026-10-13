// play-inline-128 03 — fillstyle
// Lines 106-422 of readable/play-inline-128.pretty.js (statement-aligned).
  function textures() {
    K.facade("fac_sterlings", {
      bays: 8,
      floors: 8,
      bayW: 3.0,
      floorH: 3.8,
      wall: "#8e4c3a",
      brick: true,
      glass: "#242a2a",
      frame: "#3a3430",
      win: { x0: 0.22, x1: 0.78, y0: 0.2, y1: 0.82 },
      broken: 0.35,
      boarded: 0.12,
      mullions: 1,
      sill: "#d0c4ae",
      lintel: true,
      seed: 1902,
      deco: (x, W, H, fy, y0, fh, bw) => {
        x.fillStyle = "rgba(210,196,174,0.9)";
        for (let i = 0; i <= 8; i++) x.fillRect(i * bw - 3, y0, 6, fh);
      },
    });
    K.facade("fac_sterlings_hold", {
      bays: 3,
      floors: 4,
      bayW: 3.0,
      floorH: 3.6,
      wall: "#6e4a3a",
      brick: true,
      glass: "#1e2424",
      frame: "#2e2a26",
      win: { x0: 0.2, x1: 0.8, y0: 0.22, y1: 0.8 },
      broken: 0.5,
      boarded: 0.3,
      mullions: 1,
      sill: "#b8ab94",
      lintel: true,
      seed: 1903,
    });
    K.paint("sterlings_sign", 1024, 256, (x, W, H) => {
      x.clearRect(0, 0, W, H);
      crown(x, 140, H / 2 + 6, 100, "#d0161e", "rgba(0,0,0,0)");
      x.fillStyle = "#d0161e";
      x.font = 'italic bold 150px Georgia, "Times New Roman", serif';
      x.textAlign = "left";
      x.textBaseline = "middle";
      x.fillText("Sterling's", 262, H / 2 + 10, W - 280);
    });
    K.paint("sterlings_band", 1024, 96, (x, W, H) =>
      K.signText(x, W, H, "SHOP LIKE ROYALTY", {
        bg: "#e8e0cc",
        fg: "#8a1a1a",
        size: 56,
        spacing: 6,
        font: "Georgia, serif",
      }),
    );
    K.interior("sterlings:paints"); // SALE + SPRING PREVIEW signs (sales floor) — 95_sterlings_interior.js
    K.paint("awning_stripe", 256, 256, (x, W, H) => {
      for (let i = 0; i < 8; i++) {
        x.fillStyle = i % 2 ? "#e8e0cc" : "#b01a1a";
        x.fillRect(i * 32, 0, 32, H);
      }
      K.stains(x, W, H, 10, 73, 0.45);
      K.grain(x, W, H, 20, 74);
      x.globalCompositeOperation = "destination-out";
      const r = K.rng(75);
      for (let k = 0; k < 10; k++) {
        x.beginPath();
        x.moveTo(r() * W, H);
        x.lineTo(r() * W, H * (0.3 + r() * 0.5));
        x.lineTo(r() * W, H);
        x.fill();
      }
      x.globalCompositeOperation = "source-over";
    });
    // the giant shopping bag that wraps the holdout building (paper bag, handles, the red crown, script)
    K.paint("sterlings_bag", 512, 640, (x, W, H) => {
      x.fillStyle = "#2a2622";
      x.fillRect(0, 0, W, H);
      const bx = 36,
        by = 120,
        bw = W - 72,
        bh = H - 150;
      x.strokeStyle = "#d8d0c0";
      x.lineWidth = 16;
      for (const hx of [bx + bw * 0.28, bx + bw * 0.72]) {
        x.beginPath();
        x.ellipse(hx, by, bw * 0.12, 95, 0, PI, 2 * PI);
        x.stroke();
      }
      x.fillStyle = "#ece6d8";
      x.fillRect(bx, by, bw, bh);
      x.fillStyle = "rgba(0,0,0,0.08)";
      x.fillRect(bx + bw * 0.86, by, bw * 0.14, bh);
      crown(x, W / 2, by + bh * 0.3, 96, "#d0161e", "#ece6d8");
      x.fillStyle = "#d0161e";
      x.font = 'italic bold 96px Georgia, "Times New Roman", serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("Sterling's", W / 2, by + bh * 0.62, bw - 30);
      x.font = "italic bold 30px Georgia, serif";
      x.fillStyle = "#5a1a1a";
      x.fillText("Shop like royalty.", W / 2, by + bh * 0.8, bw - 40);
      x.font = "bold 16px Georgia, serif";
      x.fillText("OF HERALD SQUARE", W / 2, by + bh * 0.88, bw - 40);
      K.stains(x, W, H, 14, 76, 0.55);
      K.grain(x, W, H, 22, 77);
      x.globalCompositeOperation = "destination-out";
      const r = K.rng(78); // torn vinyl
      for (let k = 0; k < 7; k++) {
        const tx = bx + r() * bw,
          ty = by + bh * (0.5 + r() * 0.5);
        x.beginPath();
        x.moveTo(tx, ty);
        x.lineTo(tx + (r() - 0.5) * 90, ty + 40 + r() * 80);
        x.lineTo(tx + (r() - 0.5) * 40, H);
        x.fill();
      }
      x.globalCompositeOperation = "source-over";
    });
    K.neon("sterlings_neon", "Sterling's", 0xff2a2a, {
      font: 'italic bold 96px Georgia, "Times New Roman", serif',
      h: 140,
    });
    // lit display-window backdrops (warm, emissive through atlas_paint_glow): the Easter Parade + the spring fashions (March 1967)
    K.paint("sterlings_disp_xmas", 256, 256, (x, W, H) => {
      const g = x.createRadialGradient(
        W / 2,
        H * 0.45,
        10,
        W / 2,
        H * 0.45,
        W * 0.75,
      );
      g.addColorStop(0, "#fff2c8");
      g.addColorStop(0.55, "#e8b0b8");
      g.addColorStop(1, "#6a4a5a");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      const r = K.rng(311),
        eggs = ["#f0c0d0", "#c0d8f0", "#f0e0a0", "#c8e8c0", "#e0c8f0"];
      for (let i = 0; i < 14; i++) {
        x.fillStyle = eggs[i % 5];
        x.beginPath();
        x.ellipse(
          20 + r() * (W - 40),
          H * (0.45 + r() * 0.3),
          12,
          16,
          (r() - 0.5) * 0.6,
          0,
          7,
        );
        x.fill();
      }
      x.fillStyle = "#5a2a3a";
      x.font = "bold 26px Georgia, serif";
      x.textAlign = "center";
      x.fillText("EASTER PARADE", W / 2, H * 0.84);
      x.font = "bold 18px Georgia, serif";
      x.fillText("SUNDAY, MARCH 26", W / 2, H * 0.93);
      K.stains(x, W, H, 8, 312, 0.35);
    });
    K.paint("sterlings_disp_fall", 256, 256, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#f4e4c0");
      g.addColorStop(1, "#b8a0b0");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      x.fillStyle = "rgba(200,120,150,0.5)";
      for (let i = 0; i < 9; i++) {
        x.beginPath();
        x.arc(20 + i * 28, 40 + (i % 3) * 22, 14, 0, 7);
        x.fill();
      }
      x.fillStyle = "#3a1a2a";
      x.font = "italic bold 30px Georgia, serif";
      x.textAlign = "center";
      x.fillText("Spring Preview", W / 2, H * 0.78);
      x.font = "bold 22px Georgia, serif";
      x.fillText("~ 1967 ~", W / 2, H * 0.9);
      K.stains(x, W, H, 8, 313, 0.35);
    });
    K.paint("sterlings_graf", 512, 256, (x, W, H) => {
      x.clearRect(0, 0, W, H);
      x.save();
      x.rotate(-0.05);
      x.fillStyle = "rgba(200,30,20,0.92)";
      x.font = 'bold 86px Impact, "Arial Black", sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("DEAD INSIDE", W / 2, H * 0.36);
      x.restore();
      K.skull(x, W * 0.5, H * 0.74, 42, "rgba(240,235,220,0.9)");
      x.fillStyle = "rgba(200,30,20,0.85)";
      for (let i = 0; i < 8; i++)
        x.fillRect(60 + i * 52, H * 0.46, 4, 14 + (i % 3) * 14);
    });
    K.paint("sterlings_warn", 512, 192, (x, W, H) => {
      x.fillStyle = "#d8c89a";
      x.fillRect(0, 0, W, H);
      x.strokeStyle = "#1a1a1a";
      x.lineWidth = 10;
      x.strokeRect(8, 8, W - 16, H - 16);
      K.skull(x, 80, H / 2, 46, "#1a1a1a");
      x.fillStyle = "#9a1a10";
      x.font = 'bold 56px Impact, "Arial Black", sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("MANIACS INSIDE", W / 2 + 50, H * 0.36, W - 150);
      x.fillStyle = "#1a1a1a";
      x.font = "bold 30px Impact, sans-serif";
      x.fillText("SCAVS: EARLY BIRD CREW", W / 2 + 50, H * 0.7);
      K.stains(x, W, H, 10, 314, 0.5);
      K.streaks(x, W, H, 16, 315, 0.3);
    });
    K.paint("sterlings_clock", 256, 256, (x, W, H) => {
      x.clearRect(0, 0, W, H);
      K.clockFace(x, W, H, { rim: "#b8902a", face: "#f0e6c4" });
    });
    // the second face of the holdout: a torn St. Patrick's Day Parade poster instead of a second bag
    K.paint("sterlings_parade", 512, 640, (x, W, H) => {
      // a torn St. Patrick's Day Parade poster (Fifth Avenue, Friday 17 March 1967: the parade that never marched)
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#2a7a3a");
      g.addColorStop(1, "#d8e8c8");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      const leaf = (cx, cy, s2, a) => {
        x.save();
        x.translate(cx, cy);
        x.rotate(a);
        x.beginPath();
        x.moveTo(0, 0);
        x.bezierCurveTo(
          -s2 * 0.9,
          -s2 * 0.3,
          -s2 * 0.7,
          -s2 * 1.3,
          0,
          -s2 * 0.75,
        );
        x.bezierCurveTo(s2 * 0.7, -s2 * 1.3, s2 * 0.9, -s2 * 0.3, 0, 0);
        x.fill();
        x.restore();
      };
      x.fillStyle = "#1a5a26";
      for (let k = 0; k < 3; k++) leaf(W / 2, H * 0.38, 120, k * 2.094);
      x.strokeStyle = "#1a5a26";
      x.lineWidth = 14;
      x.beginPath();
      x.moveTo(W / 2, H * 0.38);
      x.quadraticCurveTo(W / 2 + 30, H * 0.5, W / 2 + 10, H * 0.58);
      x.stroke();
      // a row of marching pipers in silhouette
      x.fillStyle = "#123a1a";
      for (let k = 0; k < 7; k++) {
        const px = 50 + k * 68,
          py = H * 0.7;
        x.beginPath();
        x.arc(px, py - 52, 9, 0, 7);
        x.fill();
        x.fillRect(px - 9, py - 44, 18, 34);
        x.fillRect(px - 8, py - 10, 6, 26);
        x.fillRect(px + 2, py - 10, 6, 26);
        x.beginPath();
        x.moveTo(px + 9, py - 40);
        x.lineTo(px + 24, py - 64);
        x.lineWidth = 3;
        x.stroke();
      }
      x.fillStyle = "#f4f0e0";
      x.font = "bold 40px Georgia, serif";
      x.textAlign = "center";
      x.fillText("ST. PATRICK'S DAY PARADE", W / 2, H * 0.82);
      x.fillStyle = "#1a1a1a";
      x.font = "bold 24px Georgia, serif";
      x.fillText("FIFTH AVENUE · FRIDAY, MARCH 17, 1967", W / 2, H * 0.88);
      x.fillStyle = "#c0161e";
      x.font = "italic bold 44px Georgia, serif";
      x.fillText("Sterling's salutes the marchers", W / 2, H * 0.95);
      K.stains(x, W, H, 16, 316, 0.6);
      K.grain(x, W, H, 22, 317);
      x.globalCompositeOperation = "destination-out";
      const r = K.rng(318);
      for (let k = 0; k < 9; k++) {
        const tx = r() * W,
          ty = r() * H * 0.9;
        x.beginPath();
        x.moveTo(tx, ty);
        x.lineTo(tx + (r() - 0.5) * 140, ty + 60 + r() * 120);
        x.lineTo(tx + (r() - 0.5) * 60, H);
        x.fill();
      }
      x.beginPath();
      x.moveTo(W, 0);
      x.lineTo(W * 0.62, 0);
      x.lineTo(W, H * 0.3);
      x.fill(); // the top corner peeled away
      x.globalCompositeOperation = "source-over";
    });
  }

  /** Mannequin (smooth pale statue-figure), optionally toppled. */
  function mannequin(d, x, y, z, yaw, fallen) {
    if (fallen) {
      K.parts.figure(d, "paint_white", x, y + 0.2, z, yaw, 0.9, "reclined", {
        grime: 0.5,
      });
      return;
    }
    K.parts.figure(d, "paint_white", x, y, z, yaw, 0.9, "stand", {
      grime: 0.4,
    });
  }

