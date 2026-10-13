// play-inline-111 02 — math
// Lines 16-134 of readable/play-inline-111.pretty.js (statement-aligned).
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
