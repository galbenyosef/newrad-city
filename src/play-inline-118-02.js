// play-inline-118 02 — fillstyle
// Lines 31-335 of readable/play-inline-118.pretty.js (statement-aligned).
  const K = G.LMA.kit;
  const PI = Math.PI;
  const T = K.T;
  const nrm = (a) => {
    while (a > PI) a -= 2 * PI;
    while (a <= -PI) a += 2 * PI;
    return a;
  };
  const AY = (f) => nrm(f + PI); // actor yaw for a three.js facing yaw
  // The Speakeasy's street gate (42nd St): a keypad code, chalked on the tiles beside the gate (41_neon_town.js builds the
  // scrawl + its Read interaction, which learns this code; the matchbook inside repeats the knock).
  K.neonSpeakLock = K.neonSpeakLock || {
    id: "lma_neon_speakeasy_gate",
    label: "Speakeasy Gate (42 St subway)",
    code: "20142",
    hint: "Chalk scrawl on the tiles beside the 42nd St subway gate",
    learnedFrom: "Chalk scrawl beside the 42nd St subway gate (Read)",
  };

  // ------------------------------------------------------------------
  // Materials: lamp-lit twins of the base set + a few canvas surfaces
  // ------------------------------------------------------------------
  const WARM = 0xffb878;
  const REMAP = {};
  function materials() {
    if (K.MATDEF.nx_paper) return;
    const twin = (base, key, i, col) => {
      K.litTwin(base, key, col || WARM, i);
      REMAP[base] = key;
    };
    twin("concrete", "nx_concrete", 0.2);
    twin("wood", "nx_wood", 0.3);
    twin("wood_rotten", "nx_woodr", 0.26);
    twin("metal", "nx_metal", 0.26);
    twin("metal_dark", "nx_metald", 0.36);
    twin("rust", "nx_rust", 0.24);
    twin("fabric", "nx_fabric", 0.32);
    twin("plaster_base", "nx_plaster", 0.22);
    twin("brass_base", "nx_brass", 0.45, 0xffc880);
    twin("steel", "nx_steel", 0.26);
    twin("corrugated", "nx_corr", 0.22);
    twin("brick_red", "nx_brick", 0.2);
    twin("brick_brown", "nx_brickb", 0.2);
    twin("marble", "nx_marble", 0.22);
    twin("granite", "nx_granite", 0.2);
    twin("limestone", "nx_lime", 0.2);
    twin("dirt", "nx_dirt", 0.18);
    twin("rubble", "nx_rubble", 0.18);
    const cm = (key, w, h, draw, o) => {
      const c = K.canvas(w, h),
        x = c.getContext("2d");
      draw(x, w, h);
      const t = K.texFromCanvas(c);
      K.defineMat(
        key,
        Object.assign(
          {
            color: 0xffffff,
            map: t,
            emissiveMap: t,
            emissiveColor: 0xffc890,
            emissiveIntensity: 0.2,
            emissiveVC: true,
            rough: 0.8,
            custom: true,
            tile: [2, 2],
          },
          o || {},
        ),
      );
    };
    cm(
      "nx_paper",
      256,
      256,
      (x, W, H) => {
        x.fillStyle = "#d2c4a4";
        x.fillRect(0, 0, W, H);
        x.fillStyle = "rgba(120,90,60,0.28)";
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const cx = i * 64 + (j % 2) * 32 + 16,
              cy = j * 64 + 32;
            x.beginPath();
            x.moveTo(cx, cy - 24);
            x.quadraticCurveTo(cx + 16, cy, cx, cy + 24);
            x.quadraticCurveTo(cx - 16, cy, cx, cy - 24);
            x.fill();
            x.beginPath();
            x.arc(cx, cy, 4, 0, 7);
            x.fill();
          }
        x.fillStyle = "rgba(90,60,40,0.18)";
        for (let i = 0; i < W; i += 32) x.fillRect(i, 0, 2, H);
        K.stains(x, W, H, 10, 5101, 0.45);
        K.streaks(x, W, H, 16, 5102, 0.25);
        K.grain(x, W, H, 18, 5103);
      },
      { tile: [1.8, 1.8], emissiveIntensity: 0.24 },
    );
    cm(
      "nx_tile",
      256,
      256,
      (x, W, H) => {
        x.fillStyle = "#6a665c";
        x.fillRect(0, 0, W, H);
        const r = K.rng(5111);
        for (let j = 0; j < 16; j++)
          for (let i = 0; i < 8; i++) {
            const off = (j % 2) * 16,
              v = (205 + r() * 25) | 0;
            x.fillStyle =
              r() < 0.04
                ? "#4a4840"
                : "rgb(" + v + "," + (v - 4) + "," + (v - 18) + ")";
            x.fillRect(i * 32 + off + 1, j * 16 + 1, 30, 14);
            x.fillRect(i * 32 + off + 1 - W, j * 16 + 1, 30, 14);
          }
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(40,36,28,0.1)");
        g.addColorStop(1, "rgba(40,36,28,0.4)");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        K.streaks(x, W, H, 24, 5112, 0.3);
        K.stains(x, W, H, 8, 5113, 0.3);
      },
      { tile: [1.3, 1.3], rough: 0.35, emissiveIntensity: 0.2 },
    );
    cm(
      "nx_checker",
      256,
      256,
      (x, W, H) => {
        for (let i = 0; i < 8; i++)
          for (let j = 0; j < 8; j++) {
            x.fillStyle = (i + j) % 2 ? "#22201c" : "#c4b89c";
            x.fillRect(i * 32, j * 32, 32, 32);
          }
        K.stains(x, W, H, 14, 5121, 0.55);
        K.grain(x, W, H, 24, 5122);
      },
      { tile: [2.4, 2.4], rough: 0.4, emissiveIntensity: 0.12 },
    );
    cm(
      "nx_tin",
      128,
      128,
      (x, W, H) => {
        x.fillStyle = "#6a6258";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "rgba(230,210,170,0.3)";
        x.lineWidth = 3;
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            x.strokeRect(i * 32 + 4, j * 32 + 4, 24, 24);
            x.beginPath();
            x.arc(i * 32 + 16, j * 32 + 16, 6, 0, 7);
            x.stroke();
          }
        K.stains(x, W, H, 8, 5131, 0.5);
      },
      { tile: [1.2, 1.2], rough: 0.55, metal: 0.3, emissiveIntensity: 0.14 },
    );
    cm(
      "nx_carpet",
      256,
      256,
      (x, W, H) => {
        x.fillStyle = "#6a1418";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "rgba(210,160,70,0.5)";
        x.lineWidth = 3;
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const cx = i * 64 + 32,
              cy = j * 64 + 32;
            x.beginPath();
            x.moveTo(cx, cy - 22);
            x.lineTo(cx + 22, cy);
            x.lineTo(cx, cy + 22);
            x.lineTo(cx - 22, cy);
            x.closePath();
            x.stroke();
            x.beginPath();
            x.arc(cx, cy, 5, 0, 7);
            x.stroke();
          }
        K.stains(x, W, H, 14, 5141, 0.55);
        K.grain(x, W, H, 26, 5142);
      },
      { tile: [1.6, 1.6], rough: 1, emissiveIntensity: 0.16 },
    );
    cm(
      "nx_velvet",
      256,
      256,
      (x, W, H) => {
        for (let i = 0; i < W; i++) {
          const f =
            0.5 +
            0.5 * Math.sin((i / W) * PI * 2 * 9 + Math.sin(i * 0.05) * 0.6);
          x.fillStyle =
            "rgb(" +
            Math.round(70 + 100 * f) +
            "," +
            Math.round(10 + 18 * f) +
            "," +
            Math.round(16 + 16 * f) +
            ")";
          x.fillRect(i, 0, 1, H);
        }
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(0,0,0,0.55)");
        g.addColorStop(0.6, "rgba(0,0,0,0.05)");
        g.addColorStop(1, "rgba(255,190,110,0.3)");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        K.stains(x, W, H, 6, 5151, 0.3);
        K.grain(x, W, H, 14, 5152);
      },
      {
        tile: [8, 6],
        rough: 0.95,
        emissiveIntensity: 0.6,
        side: THREE.DoubleSide,
      },
    );
    cm(
      "nx_backdrop",
      1024,
      512,
      (x, W, H) => {
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#1a1438");
        g.addColorStop(0.55, "#7a2a5a");
        g.addColorStop(1, "#f09a4a");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        x.fillStyle = "#fff4d0";
        x.beginPath();
        x.arc(W * 0.78, H * 0.28, 46, 0, 7);
        x.fill();
        const r = K.rng(5161);
        for (let i = 0; i < 26; i++) {
          const bw = 20 + r() * 60,
            bh = 90 + r() * 280,
            bx = i * 40 + r() * 10;
          x.fillStyle = "#140c1c";
          x.fillRect(bx, H - bh, bw, bh);
          x.fillStyle = "rgba(255,210,120,0.7)";
          for (let k = 0; k < 14; k++)
            if (r() < 0.5)
              x.fillRect(
                bx + 4 + r() * (bw - 10),
                H - bh + 8 + r() * (bh - 16),
                4,
                5,
              );
        }
        x.fillStyle = "#140c1c";
        x.fillRect(W * 0.44, H - 430, 44, 430);
        x.beginPath();
        x.moveTo(W * 0.44, H - 430);
        x.lineTo(W * 0.44 + 22, H - 500);
        x.lineTo(W * 0.44 + 44, H - 430);
        x.fill(); // the ESB
        x.fillStyle = "rgba(255,240,200,0.9)";
        x.font = "italic bold 64px Georgia, serif";
        x.textAlign = "center";
        x.fillText("Neon Nights", W / 2, 90);
        K.stains(x, W, H, 16, 5162, 0.45);
        K.grain(x, W, H, 20, 5163);
      },
      { tile: [1, 1], emissiveIntensity: 0.55, rough: 1 },
    );
    cm(
      "nx_velvet_purple",
      256,
      256,
      (x, W, H) => {
        x.fillStyle = "#2a0e2e";
        x.fillRect(0, 0, W, H);
        x.fillStyle = "rgba(200,90,190,0.18)";
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const cx = i * 64 + (j % 2) * 32 + 16,
              cy = j * 64 + 32;
            x.beginPath();
            x.moveTo(cx, cy - 22);
            x.lineTo(cx + 12, cy);
            x.lineTo(cx, cy + 22);
            x.lineTo(cx - 12, cy);
            x.fill();
          }
        K.stains(x, W, H, 8, 5171, 0.4);
        K.grain(x, W, H, 14, 5172);
      },
      { tile: [2, 2], emissiveColor: 0xff90e0, emissiveIntensity: 0.35 },
    );
  }

  // ------------------------------------------------------------------
  // Signs & posters (tsx atlases from 41_neon_town.js)
  // ------------------------------------------------------------------
