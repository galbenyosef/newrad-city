// play-inline-119 03 — fillstyle
// Lines 332-679 of readable/play-inline-119.pretty.js (statement-aligned).
  K.dclInit = function () {
    if (K.atlases.lma_decal) return K.atlases.lma_decal;
    const at = (K.atlases.lma_decal = new K.Atlas(
      "lma_decal",
      2048,
      null,
      1024,
    ));
    K.defineMat("dcl", {
      map: at.tex,
      color: 0xffffff,
      rough: 0.92,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      noShadow: true,
    });
    K.defineMat("dcl_soft", {
      map: at.tex,
      color: 0xffffff,
      rough: 0.95,
      transparent: true,
      noShadow: true,
    });
    // board overlays are floodlit at night like the ads under them (else the tears read as black splats after dark)
    K.defineMat("dcl_board", {
      map: at.tex,
      color: 0xffffff,
      rough: 0.9,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      noShadow: true,
      emissiveMap: at.tex,
      emissiveColor: 0xfff0dc,
      emissiveIntensity: 0.1,
    });
    K.nightEmissive("dcl_board", 0.04, 0.42);
    /** weathered backing board (steel sheet + plywood panels, seams, rivets, water runs) as a canvas */
    const backing = (W, H, seed) => {
      const c = K.canvas(W, H),
        x = c.getContext("2d"),
        r = K.rng(seed);
      x.fillStyle = "#7a6e5c";
      x.fillRect(0, 0, W, H);
      for (let i = 0; i < W; i += 64) {
        const v = (112 + r() * 44) | 0;
        x.fillStyle = "rgb(" + (v + 12) + "," + (v + 2) + "," + (v - 14) + ")";
        x.fillRect(i + 2, 0, 60, H);
      } // weathered plywood / sun-bleached sheet
      x.fillStyle = "rgba(20,16,12,0.8)";
      for (let i = 0; i < W; i += 64) x.fillRect(i, 0, 2, H);
      for (let j = 0; j < H; j += 96) {
        x.fillRect(0, j, W, 2);
        for (let i = 6; i < W; i += 32) {
          x.fillStyle = "rgba(140,90,50,0.8)";
          x.fillRect(i, j + 5, 3, 3);
          x.fillStyle = "rgba(20,16,12,0.8)";
        }
      }
      for (let i = 0; i < 26; i++) {
        const px = r() * W,
          g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(90,50,24,0.55)");
        g.addColorStop(1, "rgba(90,50,24,0)");
        x.fillStyle = g;
        x.fillRect(px, r() * H * 0.3, 2 + r() * 5, H);
      }
      K.stains(x, W, H, 10, seed + 1, 0.5);
      K.grain(x, W, H, 20, seed + 2);
      return c;
    };
    /** jagged polygon around (cx,cy) with radii (rx,ry) → point list */
    const blob = (cx, cy, rx, ry, r, n) => {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2,
          k = 0.55 + r() * 0.6;
        pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
      }
      return pts;
    };
    const path = (x, pts) => {
      x.beginPath();
      pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
      x.closePath();
    };
    const tear = (x, W, H, bk, holes, r) => {
      for (const h of holes) {
        const pts = blob(h[0] * W, h[1] * H, h[2] * W, h[3] * H, r, 28);
        x.save();
        path(x, pts);
        x.clip();
        x.drawImage(bk, 0, 0);
        x.lineWidth = 7;
        x.strokeStyle = "rgba(10,8,6,0.55)";
        x.stroke(); // shadow of the paper edge inside the hole
        x.restore();
        x.save();
        path(x, pts);
        x.lineWidth = 3;
        x.strokeStyle = "rgba(214,204,178,0.97)";
        x.stroke();
        x.restore(); // curled paper lip
        if (r() < 0.7) {
          // a flap hanging off the lower edge
          const fx = (h[0] + (r() - 0.5) * h[2]) * W,
            fy = (h[1] + h[3] * 0.45) * H,
            fw = 18 + r() * 40,
            fh = 20 + r() * 50;
          x.fillStyle = "rgba(200,190,164,0.97)";
          x.beginPath();
          x.moveTo(fx - fw / 2, fy - 6);
          x.lineTo(fx + fw / 2, fy - 4);
          x.lineTo(fx + fw * 0.3, fy + fh);
          x.lineTo(fx - fw * 0.25, fy + fh * 0.8);
          x.closePath();
          x.fill();
          x.fillStyle = "rgba(120,110,90,0.6)";
          x.fillRect(fx - fw * 0.2, fy + 4, 2, fh * 0.6);
        }
      }
    };
    const torn = (key, seed, holes) =>
      at.alloc(key, 512, 256, (x) => {
        const r = K.rng(seed);
        tear(x, 512, 256, backing(512, 256, seed + 5), holes, r);
      });
    // (alloc() draws in slot-local coordinates: the kit clips + translates the context to the slot)
    torn("torn1", 7101, [
      [0.12, 0.85, 0.34, 0.6],
      [0.78, 0.1, 0.22, 0.3],
      [0.5, 0.55, 0.06, 0.1],
    ]);
    torn("torn2", 7102, [
      [0.46, 0.5, 0.13, 0.95],
      [0.9, 0.2, 0.16, 0.45],
      [0.2, 0.2, 0.05, 0.08],
      [0.28, 0.75, 0.04, 0.07],
    ]);
    torn("torn3", 7103, [
      [0.15, 0.3, 0.07, 0.12],
      [0.35, 0.72, 0.09, 0.16],
      [0.62, 0.36, 0.08, 0.14],
      [0.84, 0.74, 0.1, 0.18],
      [0.72, 0.12, 0.05, 0.1],
      [0.05, 0.9, 0.12, 0.22],
    ]);
    // a stripped board: backing panels, some panels gone (see-through to the frame), scraps of the old poster
    at.alloc("bare", 512, 256, (x) => {
      const W = 512,
        H = 256,
        r = K.rng(7110);
      x.drawImage(backing(W, H, 7111), 0, 0);
      for (const p of [
        [128, 0, 64, 96],
        [320, 96, 64, 96],
        [384, 96, 64, 96],
        [0, 192, 64, 64],
        [448, 0, 64, 96],
      ])
        x.clearRect(p[0] + 2, p[1] + 2, p[2] - 2, p[3] - 2);
      const cols = ["#b8563c", "#d8c070", "#5a86a8", "#e8e0c8", "#8a3a58"];
      for (let i = 0; i < 9; i++) {
        x.save();
        x.translate(r() * W, r() * H);
        x.rotate((r() - 0.5) * 0.3);
        x.fillStyle = cols[i % cols.length];
        x.globalAlpha = 0.85;
        x.fillRect(
          -20 - r() * 40,
          -10 - r() * 20,
          40 + r() * 70,
          18 + r() * 34,
        );
        x.restore();
      }
      x.globalAlpha = 1;
      K.stains(x, W, H, 8, 7112, 0.5);
    });
    // rust / water streaks (soft), 128 x 256
    at.alloc("streaks", 128, 256, (x) => {
      const r = K.rng(7120);
      for (let i = 0; i < 16; i++) {
        const px = 4 + r() * 118,
          w = 2 + r() * 7,
          len = 80 + r() * 176,
          col = r() < 0.6 ? "90,48,20" : "24,20,16";
        const g = x.createLinearGradient(0, 0, 0, len);
        g.addColorStop(0, "rgba(" + col + ",0.75)");
        g.addColorStop(0.3, "rgba(" + col + ",0.45)");
        g.addColorStop(1, "rgba(" + col + ",0)");
        x.fillStyle = g;
        x.fillRect(px, 0, w, len);
      }
    });
    // concertina wire (cut-out), 512 x 128: overlapping coils + barbs
    at.alloc("wire", 512, 128, (x) => {
      x.strokeStyle = "rgba(150,146,136,1)";
      x.lineWidth = 2.2;
      for (let i = -1; i < 22; i++) {
        x.beginPath();
        x.ellipse(i * 24 + 12, 64, 26, 56, 0.35, 0, Math.PI * 2);
        x.stroke();
      }
      x.strokeStyle = "rgba(110,104,96,1)";
      x.lineWidth = 2;
      for (let i = 0; i < 90; i++) {
        const a = i * 0.7,
          px = (i * 5.7) % 512,
          py = 64 + Math.sin(a) * 52;
        x.beginPath();
        x.moveTo(px - 4, py - 4);
        x.lineTo(px + 4, py + 4);
        x.moveTo(px + 4, py - 4);
        x.lineTo(px - 4, py + 4);
        x.stroke();
      }
    });
    // litter drifts (cut-out): newspapers, cans, bottle tops, cardboard, cigarette packs
    const litter = (key, seed) =>
      at.alloc(key, 256, 256, (x) => {
        const r = K.rng(seed);
        for (let i = 0; i < 26; i++) {
          x.save();
          x.translate(20 + r() * 216, 20 + r() * 216);
          x.rotate(r() * 6.3);
          const k = r();
          if (k < 0.35) {
            x.fillStyle = ["#cfc8b4", "#bdb49c", "#d8d0bc"][i % 3];
            x.fillRect(-18, -12, 36 + r() * 12, 24 + r() * 8);
            x.fillStyle = "rgba(60,56,50,0.55)";
            for (let l = 0; l < 5; l++) x.fillRect(-14, -8 + l * 5, 26, 2);
          } else if (k < 0.55) {
            x.fillStyle = ["#a02a22", "#2a5a8a", "#c8a030", "#5a6a4a"][i % 4];
            x.fillRect(-4, -8, 8, 16);
            x.fillStyle = "#b8b8b0";
            x.fillRect(-4, -8, 8, 2);
          } else if (k < 0.75) {
            x.fillStyle = "#8a6a42";
            x.fillRect(-16, -14, 30 + r() * 10, 26);
            x.strokeStyle = "rgba(60,40,20,0.8)";
            x.strokeRect(-16, -14, 30, 26);
          } else if (k < 0.88) {
            x.fillStyle = "#b89a4a";
            x.beginPath();
            x.arc(0, 0, 3.5, 0, 7);
            x.fill();
          } else {
            x.fillStyle = "#e8e0d0";
            x.fillRect(-6, -9, 12, 18);
            x.fillStyle = "#b02a22";
            x.fillRect(-6, -9, 12, 6);
          }
          x.restore();
        }
      });
    litter("litter1", 7131);
    litter("litter2", 7132);
    // oil / soot stain (soft) and cracks (soft)
    at.alloc("stain", 256, 256, (x) => {
      const r = K.rng(7140);
      for (let i = 0; i < 14; i++) {
        const px = 60 + r() * 136,
          py = 60 + r() * 136,
          rds = 20 + r() * 70;
        const g = x.createRadialGradient(px, py, 0, px, py, rds);
        g.addColorStop(0, "rgba(14,12,10,0.55)");
        g.addColorStop(0.7, "rgba(20,16,12,0.25)");
        g.addColorStop(1, "rgba(20,16,12,0)");
        x.fillStyle = g;
        x.fillRect(px - rds, py - rds, rds * 2, rds * 2);
      }
    });
    at.alloc("crack", 256, 256, (x) => {
      const r = K.rng(7150);
      x.strokeStyle = "rgba(14,12,10,0.85)";
      x.lineCap = "round";
      for (let i = 0; i < 5; i++) {
        let px = 128 + (r() - 0.5) * 60,
          py = 128 + (r() - 0.5) * 60;
        x.lineWidth = 3.5;
        x.beginPath();
        x.moveTo(px, py);
        for (let k = 0; k < 9; k++) {
          px += (r() - 0.5) * 60;
          py += (r() - 0.5) * 60;
          x.lineTo(px, py);
          x.lineWidth = Math.max(1, x.lineWidth - 0.3);
        }
        x.stroke();
      }
    });
    // paste-up posters layered on walls and posts (cut-out, ragged edges)
    at.alloc("pasteups", 512, 256, (x) => {
      const r = K.rng(7160),
        cols = [
          ["#e8dcb8", "#8a1010"],
          ["#f0c820", "#111"],
          ["#1a2a4a", "#f4f0e8"],
          ["#e0d8c8", "#2a4a2a"],
          ["#c83a2a", "#f4f0e0"],
        ];
      const words = [
        "WANTED",
        "VOTE CROWE",
        "NEON OPRY",
        "IODINE 20c",
        "LOST DOG",
        "BOXING FRI",
        "REPENT",
        "JOBS",
      ];
      for (let i = 0; i < 9; i++) {
        const w = 80 + r() * 60,
          h = 100 + r() * 50,
          px = 10 + (i % 5) * 100 + r() * 10,
          py = 10 + Math.floor(i / 5) * 120 + r() * 10,
          c = cols[i % cols.length];
        x.save();
        x.translate(px + w / 2, py + h / 2);
        x.rotate((r() - 0.5) * 0.12);
        x.fillStyle = c[0];
        x.beginPath();
        x.moveTo(-w / 2, -h / 2);
        for (let k = 0; k <= 8; k++)
          x.lineTo(-w / 2 + (w * k) / 8, -h / 2 + (r() - 0.5) * 6);
        for (let k = 0; k <= 8; k++)
          x.lineTo(w / 2 + (r() - 0.5) * 5, -h / 2 + (h * k) / 8);
        for (let k = 8; k >= 0; k--)
          x.lineTo(
            -w / 2 + (w * k) / 8,
            h / 2 + (r() - 0.5) * 8 - (k === 3 ? 22 : 0),
          );
        x.closePath();
        x.fill();
        x.fillStyle = c[1];
        x.font =
          "bold " + Math.round(w / 6) + 'px "Arial Black", Impact, sans-serif';
        x.textAlign = "center";
        x.fillText(words[i % words.length], 0, -h / 4);
        for (let l = 0; l < 4; l++)
          x.fillRect(-w / 2 + 10, -h / 8 + l * 12, w - 20 - r() * 20, 4);
        x.restore();
      }
      K.stains(x, 512, 256, 12, 7161, 0.35);
    });
    return at;
  };
  /** Decal quad lying on the ground (world rect centred at x,z, yaw), soft or cut-out. */
