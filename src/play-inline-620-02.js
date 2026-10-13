// play-inline-620 02 — fillrect
// Lines 362-693 of readable/play-inline-620.pretty.js (statement-aligned).
  ART.black = (x) => {
    x.fillStyle = "#000";
    x.fillRect(0, 0, 1600, 900);
  };
  ART.city = (x, t) => {
    const r = G.util.rng(77);
    sky(x, "#2a2016", "#c38a4c");
    // searchlights
    x.save();
    x.globalCompositeOperation = "lighter";
    [
      [380, 0.25],
      [1120, -0.3],
      [800, 0.05],
    ].forEach(([sx, a], i) => {
      const aa = a + Math.sin(t * 0.4 + i) * 0.15;
      const g = x.createLinearGradient(sx, 900, sx + Math.sin(aa) * 900, 0);
      g.addColorStop(0, "rgba(255,240,200,.18)");
      g.addColorStop(1, "rgba(255,240,200,0)");
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(sx - 6, 760);
      x.lineTo(sx + Math.sin(aa) * 900 - 60, -50);
      x.lineTo(sx + Math.sin(aa) * 900 + 60, -50);
      x.lineTo(sx + 6, 760);
      x.fill();
    });
    x.restore();
    // airship
    x.fillStyle = "#3a2a1a";
    x.beginPath();
    x.ellipse(1250 - t * 8, 190, 120, 32, 0, 0, 6.283);
    x.fill();
    x.fillRect(1230 - t * 8, 218, 40, 12);
    skyline(x, r, 800, "#4a3522", {
      minH: 60,
      maxH: 180,
      windows: 0.25,
      winCol: "rgba(255,214,140,.7)",
    });
    empire(x, 560, 800, 1.35, "#2a1d12", "rgba(255,90,60,1)");
    chrysler(x, 1030, 800, 1.0, "#2a1d12");
    skyline(x, r, 900, "#1d140c", {
      minH: 60,
      maxH: 170,
      windows: 0.35,
      winCol: "rgba(255,200,120,.85)",
    });
    // cola billboard (tall ribbed bottle) and the Unisphere on the skyline
    x.fillStyle = "#120c07";
    x.fillRect(180, 610, 260, 130);
    x.fillStyle = "#b8321e";
    x.fillRect(188, 618, 244, 114);
    x.fillStyle = "#f4e4c1";
    x.font = "700 34px Oswald, sans-serif";
    x.fillText("FIZZO COLA", 200, 668);
    x.font = "18px Oswald, sans-serif";
    x.fillText("BUBBLES FOR TOMORROW", 212, 700);
    x.fillStyle = "#f4e4c1";
    x.fillRect(400, 632, 12, 70);
    x.fillRect(403, 622, 6, 12);
    x.save();
    x.strokeStyle = "rgba(244,228,193,.6)";
    x.lineWidth = 3;
    x.beginPath();
    x.arc(1350, 560, 70, 0, 6.283);
    x.stroke();
    x.beginPath();
    x.ellipse(1350, 560, 70, 24, 0.3, 0, 6.283);
    x.stroke();
    x.beginPath();
    x.ellipse(1350, 560, 26, 70, 0, 0, 6.283);
    x.stroke();
    x.restore();
  };
  ART.street = (x, t) => {
    const r = G.util.rng(12);
    sky(x, "#3b3024", "#8e7453");
    // buildings both sides (one-point perspective street)
    x.fillStyle = "#2b2118";
    x.beginPath();
    x.moveTo(0, 0);
    x.lineTo(620, 330);
    x.lineTo(620, 700);
    x.lineTo(0, 900);
    x.fill();
    x.beginPath();
    x.moveTo(1600, 0);
    x.lineTo(980, 330);
    x.lineTo(980, 700);
    x.lineTo(1600, 900);
    x.fill();
    x.fillStyle = "#4a3a2a";
    x.fillRect(620, 330, 360, 370);
    for (let i = 0; i < 60; i++) {
      x.fillStyle = "rgba(255,210,150," + r() * 0.4 + ")";
      const yy = 60 + r() * 600,
        xx = r() < 0.5 ? 40 + r() * 500 : 1060 + r() * 500;
      x.fillRect(xx, yy, 14, 20);
    }
    // Civil Defense billboard
    x.fillStyle = "#16110b";
    x.fillRect(660, 360, 280, 150);
    x.fillStyle = "#e8e0c8";
    x.fillRect(668, 368, 264, 134);
    cdEmblem(x, 716, 435, 40, "#b8321e", "#e8e0c8");
    x.fillStyle = "#1e2a3a";
    x.font = "700 22px Oswald, sans-serif";
    x.fillText("PROJECT LONG WINTER", 764, 410);
    x.font = "15px Oswald, sans-serif";
    x.fillText("SLEEP SAFE. WAKE TO", 768, 440);
    x.fillText("A BETTER TOMORROW.", 768, 462);
    x.font = "12px Oswald, sans-serif";
    x.fillText("OFFICE OF CIVIL DEFENSE", 768, 488);
    // road
    x.fillStyle = "#1c1611";
    x.beginPath();
    x.moveTo(0, 900);
    x.lineTo(620, 700);
    x.lineTo(980, 700);
    x.lineTo(1600, 900);
    x.fill();
    x.strokeStyle = "rgba(230,200,120,.4)";
    x.setLineDash([30, 40]);
    x.lineWidth = 6;
    x.beginPath();
    x.moveTo(800, 900);
    x.lineTo(800, 700);
    x.stroke();
    x.setLineDash([]);
    // queue of people silhouettes & a National Guardsman
    for (let i = 0; i < 16; i++) {
      const px = 150 + i * 36 + Math.sin(i * 7) * 6,
        sc = 1 - i * 0.03,
        py = 860 - i * 12;
      x.fillStyle = "#0e0a07";
      x.beginPath();
      x.arc(px, py - 108 * sc, 11 * sc, 0, 6.283);
      x.fill();
      x.fillRect(px - 13 * sc, py - 96 * sc, 26 * sc, 58 * sc);
      x.fillRect(px - 10 * sc, py - 40 * sc, 8 * sc, 40 * sc);
      x.fillRect(px + 2 * sc, py - 40 * sc, 8 * sc, 40 * sc);
      if (i % 3 === 0) {
        x.fillRect(px - 16 * sc, py - 120 * sc, 32 * sc, 5 * sc);
        x.fillRect(px - 9 * sc, py - 132 * sc, 18 * sc, 12 * sc);
      } // hats
    }
    const sx = 1230,
      sy = 870,
      s = 1.5; // guardsman: steel pot helmet, field jacket, rifle at port arms
    x.fillStyle = "#0b0806";
    x.fillRect(sx - 18 * s, sy - 140 * s, 36 * s, 72 * s);
    x.beginPath();
    x.arc(sx, sy - 152 * s, 11 * s, 0, 6.283);
    x.fill();
    x.beginPath();
    x.ellipse(sx, sy - 160 * s, 17 * s, 9 * s, 0, Math.PI, 0);
    x.fill();
    x.fillRect(sx - 18 * s, sy - 161 * s, 36 * s, 3 * s);
    x.fillRect(sx - 15 * s, sy - 70 * s, 12 * s, 70 * s);
    x.fillRect(sx + 3 * s, sy - 70 * s, 12 * s, 70 * s);
    x.save();
    x.translate(sx, sy - 112 * s);
    x.rotate(-0.6);
    x.fillRect(-48 * s, -3 * s, 96 * s, 6 * s);
    x.restore();
    void t;
  };
  ART.pods = (x, t) => {
    // the pod bay of Cryo Unit C-9: two rows of upright pods under cold strip lights, frost on everything
    sky(x, "#0d1418", "#1c272c");
    const g = x.createRadialGradient(800, 380, 40, 800, 380, 700);
    g.addColorStop(0, "rgba(180,220,235,.28)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 1600, 900);
    x.fillStyle = "#10171a";
    x.fillRect(0, 760, 1600, 140);
    for (let i = 0; i < 6; i++)
      ((x.fillStyle = "rgba(200,235,250,.5)"),
        x.fillRect(220 + i * 220, 70, 120, 8));
    const far = [260, 470, 1130, 1340],
      near = [120, 1480];
    far.forEach((px, i) =>
      pod(x, px, 700, 0.8, { dead: true, figure: i % 2 === 0, seed: 11 + i }),
    );
    near.forEach((px, i) =>
      pod(x, px, 820, 1.15, { dead: true, figure: true, seed: 21 + i }),
    );
    pod(x, 800, 760, 1.05, {
      figure: true,
      seed: 7,
      lamp: Math.sin(t * 3) > 0 ? "#ffb347" : "#6a4a1c",
    });
    x.fillStyle = "rgba(207,238,250,.55)";
    x.font = '700 22px "Share Tech Mono", monospace';
    x.textAlign = "center";
    x.fillText("CRYO UNIT C-9  ·  PROJECT LONG WINTER", 800, 52);
    x.textAlign = "left";
  };
  ART.bombs = (x, t) => {
    const flash = Math.max(0, 1 - t * 0.6);
    sky(x, "#6b3a1c", "#ffcf8a");
    mushroom(x, 1180, 760, 1.25, Math.min(1, t * 0.25));
    mushroom(x, 360, 780, 0.8, Math.min(1, t * 0.2));
    const r = G.util.rng(31);
    skyline(x, r, 820, "#1d120a", { minH: 90, maxH: 260 });
    empire(x, 760, 820, 1.2, "#140c06");
    chrysler(x, 980, 820, 0.8, "#140c06");
    x.fillStyle = "#0c0704";
    x.fillRect(0, 820, 1600, 80);
    if (flash > 0) {
      x.fillStyle = "rgba(255,255,245," + flash + ")";
      x.fillRect(0, 0, 1600, 900);
    }
  };
  ART.ruins = (x, t) => {
    sky(x, "#2a2218", "#a88a5e");
    const r = G.util.rng(99);
    // tea-brown harbor
    const g = x.createLinearGradient(0, 640, 0, 900);
    g.addColorStop(0, "#6b5a3c");
    g.addColorStop(1, "#2a2116");
    x.fillStyle = g;
    x.fillRect(0, 640, 1600, 260);
    for (let i = 0; i < 40; i++) {
      x.strokeStyle = "rgba(200,230,150," + (0.05 + r() * 0.1) + ")";
      x.beginPath();
      const yy = 660 + r() * 230;
      x.moveTo(r() * 1600, yy);
      x.lineTo(r() * 1600, yy);
      x.stroke();
    }
    skyline(x, r, 640, "#33291c", { minH: 80, maxH: 280, ruined: true });
    empire(x, 1050, 640, 1.1, "#251d14");
    liberty(x, 380, 760, 1.25, "#18130c");
    // torch glow
    x.save();
    x.globalCompositeOperation = "lighter";
    const tg = x.createRadialGradient(424, 238, 2, 424, 238, 70);
    tg.addColorStop(
      0,
      "rgba(255,200,130," + (0.6 + Math.sin(t * 3) * 0.1) + ")",
    );
    tg.addColorStop(1, "rgba(255,200,130,0)");
    x.fillStyle = tg;
    x.fillRect(334, 148, 180, 180);
    x.restore();
    // a twin-rotor helicopter crossing the bay
    const hx = 1300 - t * 20;
    x.fillStyle = "#15110b";
    x.beginPath();
    x.ellipse(hx, 200, 46, 10, 0, 0, 6.283);
    x.fill();
    x.fillRect(hx - 40, 186, 6, 12);
    x.fillRect(hx + 34, 184, 6, 14);
    x.fillRect(hx - 70, 184, 64, 2);
    x.fillRect(hx + 6, 182, 64, 2);
  };
  ART.pod = (x, t) => {
    // close on one pod: frost creeping off the glass, the status lamp blinking amber
    sky(x, "#0b1013", "#182226");
    const g = x.createRadialGradient(800, 430, 40, 800, 430, 640);
    g.addColorStop(0, "rgba(190,225,240,.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 1600, 900);
    pod(x, 800, 900, 3.1, {
      figure: true,
      seed: 5,
      lamp: Math.sin(t * 4) > 0 ? "#ffb347" : "#5a3a10",
    });
    // breath fog on the glass
    x.fillStyle = "rgba(235,248,255," + (0.1 + 0.08 * Math.sin(t * 1.4)) + ")";
    x.beginPath();
    x.ellipse(800, 360, 60, 40, 0, 0, 6.283);
    x.fill();
    x.fillStyle = "rgba(207,238,250,.7)";
    x.font = '700 26px "Share Tech Mono", monospace';
    x.textAlign = "center";
    x.fillText("POD 07 · THAW CYCLE ENGAGED", 800, 90);
    x.textAlign = "left";
  };
  ART.standby = (x, t) => {
    // Office of Civil Defense test card
    x.fillStyle = "#111";
    x.fillRect(0, 0, 1600, 900);
    const cols = [
      "#d8d8d0",
      "#d8cf3a",
      "#3ac8cf",
      "#8a8a84",
      "#cf3ab8",
      "#cf3a3a",
      "#3a4acf",
    ];
    cols.forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect(160 + i * 183, 90, 183, 520);
    });
    cdEmblem(x, 800, 350, 250, "#e6e6de", "#1b1b1b");
    x.fillStyle = "#e6e6de";
    x.font = "700 64px Oswald, sans-serif";
    x.textAlign = "center";
    x.fillText("OFFICE OF CIVIL DEFENSE", 800, 700);
    x.font = "700 54px Oswald, sans-serif";
    x.fillText("PLEASE STAND BY", 800, 800);
    x.textAlign = "left";
    void t;
  };

  // film look: grain + scratches + gate weave
  let grain = null;
  function makeGrain() {
    grain = document.createElement("canvas");
    grain.width = 256;
    grain.height = 256;
    const g = grain.getContext("2d"),
      im = g.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = Math.random() * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      im.data[i + 3] = 34;
    }
    g.putImageData(im, 0, 0);
  }

  // The procedural art is re-painted into an offscreen 1600×900 layer at ~20 fps
  // (it only animates slowly); the per-frame work is the camera drift + film look.
  let artLayer = null,
    artSlide = null,
    artT = -1;
