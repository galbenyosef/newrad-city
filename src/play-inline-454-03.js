// play-inline-454 03 — fillstyle
// Lines 216-934 of readable/play-inline-454.pretty.js (statement-aligned).
  function buildAtlas() {
    const cv = document.createElement("canvas");
    cv.width = cv.height = ATLAS_SIZE;
    const g = cv.getContext("2d");
    const R = L.rng(9001);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, ATLAS_SIZE, ATLAS_SIZE);
    const region = (name, fn) => {
      const r = REG[name];
      g.save();
      g.beginPath();
      g.rect(r[0], r[1], r[2], r[3]);
      g.clip();
      g.translate(r[0], r[1]);
      fn(r[2], r[3]);
      g.restore();
    };
    const speckle = (w, h, n, lo, hi, sz) => {
      for (let i = 0; i < n; i++) {
        const v = Math.floor(lo + (hi - lo) * R());
        g.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
        g.fillRect(R() * w, R() * h, sz || 1 + R() * 2, sz || 1 + R() * 2);
      }
    };
    const blotches = (w, h, n, color, rmin, rmax, alpha) => {
      for (let i = 0; i < n; i++) {
        g.globalAlpha = alpha * (0.4 + 0.6 * R());
        g.fillStyle = color;
        g.beginPath();
        g.ellipse(
          R() * w,
          R() * h,
          rmin + R() * (rmax - rmin),
          rmin + R() * (rmax - rmin),
          R() * 3,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
      g.globalAlpha = 1;
    };
    // Detail from the textures module (fabric / leather), used as greyscale
    // luminance so vertex colour still defines the hue. Optional.
    let curW = 0,
      curH = 0;
    const texDetail = (name, alpha, filter) => {
      try {
        if (G.isStub && G.isStub("tex")) return;
        const t = G.tex && G.tex.get && G.tex.get(name);
        const img = t && t.image;
        if (!img || !img.width) return;
        g.save();
        g.globalCompositeOperation = "multiply";
        g.globalAlpha = alpha;
        g.filter = filter || "grayscale(1) contrast(1.3) brightness(1.55)";
        g.drawImage(img, 0, 0, img.width, img.height, 0, 0, curW, curH);
        g.restore();
      } catch (e) {
        /* optional */
      }
    };
    const regionWH = (name, fn) =>
      region(name, (w, h) => {
        curW = w;
        curH = h;
        fn(w, h);
      });
    /** Stitched seam along x = const (runs ALONG a limb/torso in lathe & loft uvs). */
    const seamV = (x, h, dark) => {
      g.fillStyle = "rgba(0,0,0," + (dark || 0.22) + ")";
      g.fillRect(x - 1, 0, 2, h);
      g.fillStyle = "rgba(255,255,255,0.16)";
      g.fillRect(x + 1, 0, 1, h);
      g.fillStyle = "rgba(40,30,20,0.35)";
      for (let y = 0; y < h; y += 5) {
        g.fillRect(x - 3, y, 1, 3);
        g.fillRect(x + 3, y + 2, 1, 3);
      }
    };
    const patch = (x, y, pw, ph, tone) => {
      g.fillStyle = "rgba(" + tone + "," + tone + "," + (tone - 8) + ",0.55)";
      g.fillRect(x, y, pw, ph);
      g.strokeStyle = "rgba(30,24,18,0.55)";
      g.lineWidth = 1;
      g.setLineDash([2, 2]);
      g.strokeRect(x + 1.5, y + 1.5, pw - 3, ph - 3);
      g.setLineDash([]);
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(x, y + ph - 2, pw, 2);
    };
    const wear = (w, h, n) => {
      // frayed / thinning spots (lighter) and small holes (dark)
      blotches(w, h, n, "#ffffff", 3, 9, 0.22);
      for (let i = 0; i < n / 3; i++) {
        g.fillStyle = "rgba(20,16,12,0.7)";
        g.beginPath();
        g.ellipse(
          R() * w,
          R() * h,
          1 + R() * 2.5,
          1 + R() * 1.5,
          R() * 3,
          0,
          7,
        );
        g.fill();
      }
    };
    // cloth: fine weave, stitched seams running along the limbs, a sewn-on
    // patch or two, wear & grime (hue comes from vertex colour)
    /**
     * Soft garment FOLDS (painted shadow crease + highlight ridge, blurred):
     * mostly across the limb/torso axis, denser around the middle of the
     * region (elbows / knees on limb tubes, the waist on torsos) and bunched
     * near the bottom (cuffs & ankles). Also drives the bump relief.
     */
    const folds = (w, h, n, strength) => {
      g.save();
      g.filter = "blur(1.6px)";
      g.lineCap = "round";
      for (let i = 0; i < n; i++) {
        const zone = R();
        const y =
          zone < 0.45
            ? h * (0.38 + R() * 0.26)
            : zone < 0.75
              ? h * (0.82 + R() * 0.16)
              : h * R();
        const x0 = R() * w,
          len = w * (0.18 + R() * 0.4),
          tilt = (R() - 0.5) * 0.7,
          bow = (R() - 0.5) * 10;
        const x1 = x0 + len,
          y1 = y + Math.sin(tilt) * len;
        const a = strength * (0.55 + R() * 0.45);
        for (const [dy, col, lw] of [
          [2.2, "rgba(0,0,0," + 0.22 * a + ")", 3 + R() * 3],
          [-1.6, "rgba(255,255,255," + 0.2 * a + ")", 2 + R() * 2],
        ]) {
          for (const off of [0, -w]) {
            // wrap around the limb seam
            g.strokeStyle = col;
            g.lineWidth = lw;
            g.beginPath();
            g.moveTo(x0 + off, y + dy);
            g.quadraticCurveTo(
              (x0 + x1) / 2 + off,
              (y + y1) / 2 + bow + dy,
              x1 + off,
              y1 + dy,
            );
            g.stroke();
          }
        }
      }
      g.restore();
    };
    L._folds = folds;
    regionWH("cloth", (w, h) => {
      g.fillStyle = "#f4f4f4";
      g.fillRect(0, 0, w, h);
      texDetail(
        "fabric",
        0.3,
        "grayscale(1) contrast(1.1) brightness(1.7) blur(0.6px)",
      );
      // fine plain weave (sub-pixel at normal viewing distances: reads as a soft grain, not a basket)
      for (let y = 0; y < h; y++) {
        g.fillStyle = "rgba(0,0,0," + (0.015 + R() * 0.025) + ")";
        g.fillRect(0, y, w, 1);
        y++;
      }
      speckle(w, h, 2500, 215, 255, 1);
      folds(w, h, 34, 1);
      blotches(w, h, 40, "#8a7a60", 6, 30, 0.12);
      speckle(w, h, 900, 200, 255);
      seamV(w * 0.25, h);
      seamV(w * 0.75, h, 0.18);
      patch(w * 0.52, h * 0.3, 30, 24, 205);
      patch(w * 0.06, h * 0.68, 22, 26, 225);
      wear(w, h, 18);
      // grime collects toward the hems (bottom of the region = cuffs/ankles)
      const gr = g.createLinearGradient(0, h * 0.7, 0, h);
      gr.addColorStop(0, "rgba(90,75,55,0)");
      gr.addColorStop(1, "rgba(90,75,55,0.3)");
      g.fillStyle = gr;
      g.fillRect(0, h * 0.7, w, h * 0.3);
    });
    // denim: diagonal twill, faded wear lines ("whiskers"), double-stitched seams
    regionWH("denim", (w, h) => {
      g.fillStyle = "#e6e6e6";
      g.fillRect(0, 0, w, h);
      for (let i = -h; i < w + h; i += 2) {
        g.strokeStyle = "rgba(0,0,0," + (0.08 + R() * 0.06) + ")";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + h * 0.6, h);
        g.stroke();
      }
      speckle(w, h, 700, 225, 255, 1);
      blotches(w, h, 14, "#ffffff", 5, 18, 0.2); // faded patches
      g.strokeStyle = "rgba(255,255,255,0.28)";
      g.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) {
        const y = h * (0.45 + R() * 0.2);
        g.beginPath();
        g.moveTo(w * 0.35, y);
        g.quadraticCurveTo(w * 0.5, y - 3, w * 0.65, y + (R() - 0.5) * 6);
        g.stroke();
      }
      seamV(w * 0.25, h, 0.25);
      seamV(w * 0.75, h, 0.25);
      folds(w, h, 16, 0.9);
      patch(w * 0.55, h * 0.72, 20, 16, 180);
      wear(w, h, 10);
    });
    // leather: grain, creases, stitching, scuffs
    regionWH("leather", (w, h) => {
      g.fillStyle = "#f0f0f0";
      g.fillRect(0, 0, w, h);
      texDetail("leather", 0.6, "grayscale(1) contrast(1.2) brightness(2.1)");
      blotches(w, h, 80, "#9a9a9a", 3, 16, 0.25);
      blotches(w, h, 40, "#ffffff", 4, 14, 0.2);
      g.strokeStyle = "rgba(40,40,40,0.35)";
      g.lineWidth = 1;
      for (let i = 0; i < 60; i++) {
        g.beginPath();
        const x = R() * w,
          y = R() * h;
        g.moveTo(x, y);
        g.quadraticCurveTo(
          x + R() * 20 - 10,
          y + R() * 20 - 10,
          x + R() * 30 - 15,
          y + R() * 30 - 15,
        );
        g.stroke();
      }
      g.setLineDash([4, 3]);
      g.strokeStyle = "rgba(250,240,210,0.6)";
      g.strokeRect(8, 8, w - 16, h - 16);
      g.setLineDash([]);
      seamV(w * 0.5, h, 0.28);
      blotches(w, h, 25, "#ffffff", 2, 6, 0.3); // scuffs
    });
    // metal: brushed + scratches + rust
    region("metal", (w, h) => {
      g.fillStyle = "#ececec";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y++) {
        g.fillStyle =
          "rgba(" +
          (R() > 0.5 ? "255,255,255" : "0,0,0") +
          "," +
          R() * 0.07 +
          ")";
        g.fillRect(0, y, w, 1);
      }
      g.strokeStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 70; i++) {
        g.beginPath();
        const x = R() * w,
          y = R() * h;
        g.moveTo(x, y);
        g.lineTo(x + R() * 40 - 20, y + R() * 8 - 4);
        g.stroke();
      }
      blotches(w, h, 30, "#8a5a3a", 3, 18, 0.35);
      blotches(w, h, 20, "#5a3a22", 2, 8, 0.4);
      // rivets along the edge
      for (let x = 10; x < w; x += 24) {
        g.fillStyle = "#909090";
        g.beginPath();
        g.arc(x, 8, 3, 0, 7);
        g.fill();
        g.beginPath();
        g.arc(x, h - 8, 3, 0, 7);
        g.fill();
      }
    });
    region("skin", (w, h) => {
      g.fillStyle = "#fafafa";
      g.fillRect(0, 0, w, h);
      speckle(w, h, 700, 225, 255, 1);
      blotches(w, h, 25, "#c8a8a0", 3, 10, 0.18);
    });
    region("rubber", (w, h) => {
      g.fillStyle = "#d8d8d8";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 6) {
        g.fillStyle = "rgba(0,0,0,0.25)";
        g.fillRect(0, y, w, 2);
      }
      speckle(w, h, 300, 150, 220);
    });
    region("grime", (w, h) => {
      g.fillStyle = "#f6f6f6";
      g.fillRect(0, 0, w, h);
      blotches(w, h, 120, "#8a8070", 4, 26, 0.18);
      speckle(w, h, 1500, 190, 255);
    });
    region("scales", (w, h) => {
      g.fillStyle = "#e0e0e0";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h + 12; y += 10)
        for (let x = 0; x < w + 12; x += 12) {
          const ox = (y / 10) % 2 ? 6 : 0;
          const v = 150 + Math.floor(R() * 100);
          g.fillStyle = "rgb(" + v + "," + v + "," + (v - 10) + ")";
          g.beginPath();
          g.ellipse(x + ox, y, 6.5, 5.5, 0, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = "rgba(30,25,20,0.5)";
          g.lineWidth = 1;
          g.stroke();
        }
    });
    region("shell", (w, h) => {
      g.fillStyle = "#ececec";
      g.fillRect(0, 0, w, h);
      blotches(w, h, 70, "#7a7a60", 6, 28, 0.35);
      blotches(w, h, 50, "#ffffff", 3, 12, 0.3);
      g.strokeStyle = "rgba(30,30,20,0.45)";
      g.lineWidth = 2;
      for (let i = 0; i < 16; i++) {
        g.beginPath();
        g.moveTo(R() * w, 0);
        g.bezierCurveTo(R() * w, h * 0.3, R() * w, h * 0.6, R() * w, h);
        g.stroke();
      }
      speckle(w, h, 600, 90, 200);
    });
    // Cryo-unit patch: "C-9" stencil on a grey-white square with an orange stripe
    region("unitpatch", (w, h) => {
      g.fillStyle = "#d6d8d2";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#" + L.col(L.PAL.cryoOrange).getHexString();
      g.fillRect(0, h * 0.78, w, h * 0.12);
      g.strokeStyle = "#4a4e4c";
      g.lineWidth = 4;
      g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = "#2c302e";
      g.font = 'bold 82px "Courier New", monospace';
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("C-9", w / 2, h * 0.42);
      g.fillStyle = "#d6d8d2";
      for (const x of [w / 2 - 50, w / 2 + 2, w / 2 + 52])
        g.fillRect(x - 2, h * 0.2, 4, h * 0.45); // stencil bridges
      g.globalAlpha = 0.25;
      speckle(w, h, 800, 40, 120);
      g.globalAlpha = 1;
    });
    // Iron Covenant: an anvil inside a ring (cream on rust red)
    region("covenant", (w, h) => {
      g.fillStyle = "#5e605a";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;
      g.fillStyle = "#" + L.col(L.PAL.covRed).getHexString();
      g.beginPath();
      g.arc(cx, cy, 54, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#d8c89a";
      g.lineWidth = 7;
      g.beginPath();
      g.arc(cx, cy, 46, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = "#d8c89a";
      g.beginPath(); // anvil: horn left, face, heel right, waist, foot
      g.moveTo(cx - 34, cy - 14);
      g.quadraticCurveTo(cx - 20, cy - 4, cx - 14, cy - 2);
      g.lineTo(cx - 10, cy - 2);
      g.lineTo(cx - 10, cy + 6);
      g.lineTo(cx - 18, cy + 18);
      g.lineTo(cx + 18, cy + 18);
      g.lineTo(cx + 10, cy + 6);
      g.lineTo(cx + 10, cy - 2);
      g.lineTo(cx + 24, cy - 2);
      g.lineTo(cx + 24, cy - 14);
      g.closePath();
      g.fill();
      g.fillRect(cx - 22, cy + 18, 44, 6);
    });
    // Project Long Winter: hexagonal snow crystal + lettering, orange on grey-white
    region("longwinter", (w, h) => {
      g.fillStyle = "#d6d8d2";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h * 0.44,
        col = "#" + L.col(L.PAL.cryoOrange).getHexString();
      g.strokeStyle = col;
      g.lineWidth = 6;
      g.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2,
          ux = Math.cos(a),
          uy = Math.sin(a);
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + ux * 38, cy + uy * 38);
        g.stroke();
        for (const k of [-1, 1]) {
          const b2 = a + k * 0.7;
          g.beginPath();
          g.moveTo(cx + ux * 22, cy + uy * 22);
          g.lineTo(
            cx + ux * 22 + Math.cos(b2) * 12,
            cy + uy * 22 + Math.sin(b2) * 12,
          );
          g.stroke();
        }
      }
      g.lineWidth = 4;
      g.beginPath();
      for (let i = 0; i <= 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        g[i ? "lineTo" : "moveTo"](
          cx + Math.cos(a) * 48,
          cy + Math.sin(a) * 48,
        );
      }
      g.stroke();
      g.fillStyle = "#3a3e3c";
      g.font = "bold 15px Arial, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("LONG WINTER", cx, h * 0.9);
    });
    // Glowkeepers: the TWELVE-RAY sun (Nicole's doodle on the blackout candle box) — used with emissive vertices
    region("sundisc", (w, h) => {
      g.fillStyle = "#3a2410";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;
      g.fillStyle = "#ffcf6a";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2,
          r1 = 58;
        g.beginPath();
        g.moveTo(cx + Math.cos(a - 0.12) * 26, cy + Math.sin(a - 0.12) * 26);
        g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        g.lineTo(cx + Math.cos(a + 0.12) * 26, cy + Math.sin(a + 0.12) * 26);
        g.fill();
      }
      g.fillStyle = "#fff0b8";
      g.beginPath();
      g.arc(cx, cy, 24, 0, 7);
      g.fill();
      g.strokeStyle = "#b8701e";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, 15, 0, 7);
      g.stroke();
    });
    region("redcross", (w, h) => {
      g.fillStyle = "#e8e4d8";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#b01e18";
      g.fillRect(w / 2 - 14, 18, 28, h - 36);
      g.fillRect(18, h / 2 - 14, w - 36, 28);
      g.globalAlpha = 0.3;
      speckle(w, h, 400, 90, 160);
      g.globalAlpha = 1;
    });
    region("grille", (w, h) => {
      g.fillStyle = "#909090";
      g.fillRect(0, 0, w, h);
      for (let y = 6; y < h; y += 12) {
        g.fillStyle = "#1a1a1a";
        g.fillRect(4, y, w - 8, 6);
        g.fillStyle = "#d8d8d8";
        g.fillRect(4, y + 6, w - 8, 1);
      }
    });
    region("hazard", (w, h) => {
      g.fillStyle = "#e8c020";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#1a1a1a";
      for (let i = -h; i < w + h; i += 32) {
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + 16, 0);
        g.lineTo(i + 16 - h, h);
        g.lineTo(i - h, h);
        g.fill();
      }
    });
    region("maker", (w, h) => {
      g.fillStyle = "#b8b09a";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#3a2a1a";
      g.lineWidth = 4;
      g.strokeRect(5, 5, w - 10, h - 10);
      // American Automaton Co. maker plate
      g.fillStyle = "#5a1f1a";
      g.font = "bold 40px Georgia, serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("AMERICAN", w / 2, h * 0.36, w - 24);
      g.fillStyle = "#2a2a24";
      g.font = "bold 21px Arial, sans-serif";
      g.fillText("A U T O M A T O N   C O .", w / 2, h * 0.72, w - 20);
      g.globalAlpha = 0.3;
      speckle(w, h, 600, 60, 140);
      g.globalAlpha = 1;
    });
    // The Continuity: a stylised capitol dome inside a circle (grey on charcoal)
    region("continuity", (w, h) => {
      g.fillStyle = "#2a2c2e";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2,
        R0 = Math.min(w, h) * 0.44;
      g.strokeStyle = "#d8d6ce";
      g.lineWidth = 6;
      g.beginPath();
      g.arc(cx, cy, R0, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = "#d8d6ce";
      g.beginPath();
      g.arc(cx, cy + 8, 24, Math.PI, 0);
      g.fill(); // dome
      g.fillRect(cx - 2, cy - 30, 4, 16);
      g.fillRect(cx - 6, cy - 22, 12, 4); // lantern & spire
      g.fillRect(cx - 30, cy + 8, 60, 5); // drum ledge
      for (let i = 0; i < 7; i++) g.fillRect(cx - 27 + i * 8.6, cy + 13, 4, 14); // colonnade
      g.fillRect(cx - 34, cy + 27, 68, 6); // base
    });
    region("fur", (w, h) => {
      // hair / fur: clumped strands running down the region (crown → nape on
      // hair shells, along the limb on fur), dark partings between clumps,
      // lighter strand tips — the bump pass turns it into strand relief
      g.fillStyle = "#cfcfcf";
      g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 3 + R() * 5) {
        g.fillStyle = "rgba(0,0,0," + (0.08 + R() * 0.14) + ")";
        g.fillRect(x, 0, 1 + R() * 1.5, h);
      } // partings
      g.lineCap = "round";
      for (let i = 0; i < 4200; i++) {
        const v = 110 + Math.floor(R() * 145),
          x = R() * w,
          y = R() * h,
          len = 6 + R() * 22,
          bend = (R() - 0.5) * 4;
        g.strokeStyle =
          "rgba(" + v + "," + v + "," + v + "," + (0.35 + R() * 0.5) + ")";
        g.lineWidth = 0.6 + R() * 0.8;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(
          x + bend,
          y + len * 0.5,
          x + bend * 0.5 + (R() - 0.5) * 2,
          y + len,
        );
        g.stroke();
      }
    });
    region("rags", (w, h) => {
      g.fillStyle = "#eeeeee";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) {
        g.fillStyle = "rgba(0,0,0," + R() * 0.08 + ")";
        g.fillRect(0, y, w, 2);
      }
      blotches(w, h, 50, "#6a5a40", 6, 30, 0.25);
      blotches(w, h, 12, "#3a2a1a", 3, 10, 0.5);
      // patches
      for (let i = 0; i < 6; i++) {
        g.fillStyle =
          "rgba(" +
          ((120 + R() * 100) | 0) +
          "," +
          ((110 + R() * 90) | 0) +
          "," +
          ((90 + R() * 70) | 0) +
          ",0.55)";
        const x = R() * w,
          y = R() * h,
          s = 18 + R() * 26;
        g.fillRect(x, y, s, s * 0.8);
        g.setLineDash([3, 3]);
        g.strokeStyle = "rgba(20,20,20,0.6)";
        g.strokeRect(x, y, s, s * 0.8);
        g.setLineDash([]);
      }
    });
    // Cracked hide detail (creature flesh): light base, a crazed network of fine cracks with lit
    // ridges, a few faded blotches and soot specks.
    region("crackskin", (w, h) => {
      g.fillStyle = "#c4c0bc";
      g.fillRect(0, 0, w, h);
      blotches(w, h, 30, "#a08a80", 6, 22, 0.18); // faded old burns
      blotches(w, h, 40, "#dad6d0", 3, 14, 0.35); // pale ash dust
      blotches(w, h, 30, "#3a3836", 2, 6, 0.35); // soot
      g.lineCap = "round";
      for (let i = 0; i < 420; i++) {
        let x = R() * w,
          y = R() * h;
        const ang = R() * Math.PI,
          n = 3 + ((R() * 4) | 0);
        g.beginPath();
        g.moveTo(x, y);
        const pts = [[x, y]];
        for (let k = 0; k < n; k++) {
          x += Math.cos(ang + (R() - 0.5) * 1.8) * 6;
          y += Math.sin(ang + (R() - 0.5) * 1.8) * 6;
          g.lineTo(x, y);
          pts.push([x, y]);
        }
        g.strokeStyle = "rgba(40,36,34," + (0.35 + R() * 0.35) + ")";
        g.lineWidth = 0.6 + R() * 0.9;
        g.stroke();
        g.beginPath();
        g.moveTo(pts[0][0] + 1, pts[0][1] + 1);
        for (const p of pts) g.lineTo(p[0] + 1, p[1] + 1);
        g.strokeStyle = "rgba(235,232,226,0.25)";
        g.lineWidth = 0.8;
        g.stroke(); // lit ridge beside each crack
      }
    });
    // generic analogue gauge face (dials on machinery)
    region("gauge", (w, h) => {
      g.fillStyle = "#1a1814";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h * 0.6,
        r0 = Math.min(w, h) * 0.42;
      g.fillStyle = "#e4dcc4";
      g.beginPath();
      g.arc(cx, cy, r0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#2a2620";
      g.lineWidth = 3;
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * (0.8 + i * 0.14);
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r0 * 0.78, cy + Math.sin(a) * r0 * 0.78);
        g.lineTo(cx + Math.cos(a) * r0 * 0.92, cy + Math.sin(a) * r0 * 0.92);
        g.stroke();
      }
      g.strokeStyle = "#b02a1a";
      g.lineWidth = 6;
      g.beginPath();
      g.arc(cx, cy, r0 * 0.85, Math.PI * 2.0, Math.PI * 2.2);
      g.stroke();
      g.strokeStyle = "#1a1814";
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(
        cx + Math.cos(Math.PI * 1.35) * r0 * 0.75,
        cy + Math.sin(Math.PI * 1.35) * r0 * 0.75,
      );
      g.stroke();
    });
    region("raidpaint", (w, h) => {
      g.fillStyle = "#d0d0d0";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#8e1d17";
      g.lineWidth = 7;
      g.lineCap = "round";
      for (let i = 0; i < 7; i++) {
        g.beginPath();
        g.moveTo(R() * w, R() * h);
        g.lineTo(R() * w, R() * h);
        g.stroke();
      }
      g.fillStyle = "#e8e0c8";
      g.font = "bold 44px Impact, sans-serif";
      g.fillText("X", w * 0.6, h * 0.7);
      blotches(w, h, 30, "#503020", 4, 16, 0.3);
    });
    region("wood", (w, h) => {
      g.fillStyle = "#c8b090";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        g.fillStyle =
          "rgba(60,40,20," + (0.1 + 0.15 * Math.sin(y * 0.3 + R())) + ")";
        g.fillRect(0, y, w, 1);
      }
    });
    region("tire", (w, h) => {
      g.fillStyle = "#909090";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#3a3a3a";
      for (let x = 0; x < w; x += 16) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x + 8, h / 2);
        g.lineTo(x, h);
        g.lineTo(x + 6, h);
        g.lineTo(x + 14, h / 2);
        g.lineTo(x + 6, 0);
        g.fill();
      }
    });
    region("numplate", (w, h) => {
      g.fillStyle = "#d8d0b8";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#20304a";
      g.font = "bold 40px Arial Black, sans-serif";
      g.textAlign = "center";
      g.fillText("N.Y.P.D.", w / 2, h * 0.35);
      g.font = "bold 30px monospace";
      g.fillText("UNIT 07", w / 2, h * 0.7);
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }
