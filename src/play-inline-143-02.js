// play-inline-143 02 — ctx
// Lines 19-172 of readable/play-inline-143.pretty.js (statement-aligned).
  const LB = G._lb;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // --------------------------------------------------------------------
  // Temple of Dendur relief texture: sunk-relief registers of offering
  // scenes, hieroglyph columns, the winged sun disc — and the 1820s graffiti.
  // --------------------------------------------------------------------
  function reliefTex() {
    return LB.canvasTex("lb_dendur_relief", 512, 512, (ctx, w, h) => {
      const r = G.util.rng(77);
      ctx.fillStyle = "#c3a57a";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle =
          "rgba(" +
          (r() < 0.5 ? "90,64,40," : "240,220,180,") +
          r() * 0.12 +
          ")";
        ctx.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3);
      }
      // coursed blocks
      ctx.strokeStyle = "rgba(92,70,46,0.55)";
      ctx.lineWidth = 2;
      for (let y = 0; y <= h; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        for (let x = (y / 64) % 2 ? 0 : 60; x < w; x += 120) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 64);
          ctx.stroke();
        }
      }
      // register lines
      ctx.strokeStyle = "rgba(70,50,30,0.7)";
      ctx.lineWidth = 3;
      for (const y of [150, 330]) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
      }
      // winged sun disc on top
      ctx.fillStyle = "rgba(70,48,28,0.55)";
      ctx.beginPath();
      ctx.arc(w / 2, 60, 18, 0, TAU);
      ctx.fill();
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(w / 2 + sgn * 16, 52);
        ctx.quadraticCurveTo(w / 2 + sgn * 120, 20, w / 2 + sgn * 190, 58);
        ctx.lineTo(w / 2 + sgn * 18, 72);
        ctx.closePath();
        ctx.fill();
      }
      // figures in profile (sunk relief: dark outline + shaded fill)
      const figure = (x, yb, s, crown, facing) => {
        ctx.save();
        ctx.translate(x, yb);
        ctx.scale(facing * s, s);
        ctx.fillStyle = "rgba(110,80,50,0.45)";
        ctx.strokeStyle = "rgba(60,40,22,0.8)";
        ctx.lineWidth = 2.2 / s;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-6, -46);
        ctx.lineTo(-10, -60);
        ctx.lineTo(-9, -92);
        ctx.lineTo(-4, -100);
        ctx.lineTo(8, -100);
        ctx.lineTo(10, -90);
        ctx.lineTo(24, -76);
        ctx.lineTo(22, -72);
        ctx.lineTo(9, -80);
        ctx.lineTo(9, -60);
        ctx.lineTo(6, -46);
        ctx.lineTo(12, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(3, -110, 9, 11, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        if (crown) {
          ctx.beginPath();
          ctx.moveTo(-5, -118);
          ctx.lineTo(0, -142);
          ctx.lineTo(9, -118);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      };
      figure(90, 318, 1.35, true, 1);
      figure(200, 318, 1.35, false, -1);
      figure(330, 318, 1.35, true, 1);
      figure(440, 318, 1.35, false, -1);
      figure(120, 500, 1.3, false, 1);
      figure(250, 500, 1.3, true, -1);
      figure(390, 500, 1.3, false, 1);
      // offering tables between the pairs
      ctx.fillStyle = "rgba(80,58,34,0.5)";
      for (const x of [145, 385]) {
        ctx.fillRect(x - 12, 262, 24, 6);
        ctx.fillRect(x - 3, 268, 6, 44);
        ctx.beginPath();
        ctx.arc(x, 256, 9, Math.PI, 0);
        ctx.fill();
      }
      // hieroglyph columns
      ctx.fillStyle = "rgba(62,42,24,0.7)";
      for (const cx of [40, 262, 480])
        for (let y = 170; y < 318; y += 16) {
          const k = Math.floor(r() * 4);
          if (k === 0) ctx.fillRect(cx - 5, y, 10, 3);
          else if (k === 1) {
            ctx.beginPath();
            ctx.arc(cx, y + 5, 5, 0, TAU);
            ctx.fill();
          } else if (k === 2) {
            ctx.beginPath();
            ctx.moveTo(cx - 6, y + 10);
            ctx.lineTo(cx, y);
            ctx.lineTo(cx + 6, y + 10);
            ctx.fill();
          } else ctx.fillRect(cx - 1.5, y, 3, 11);
        }
      // 19th-century traveller's graffiti, scratched in
      ctx.fillStyle = "rgba(245,232,205,0.55)";
      ctx.font = "italic 17px Georgia, serif";
      ctx.fillText("LEONARDO 1820", 300, 390);
      // weathering: salt bloom low down, a dark water line, chips
      const g = ctx.createLinearGradient(0, h * 0.8, 0, h);
      g.addColorStop(0, "rgba(255,250,235,0)");
      g.addColorStop(1, "rgba(255,250,235,0.28)");
      ctx.fillStyle = g;
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = "rgba(70,50,30," + r() * 0.25 + ")";
        ctx.beginPath();
        ctx.arc(r() * w, r() * h, 2 + r() * 7, 0, TAU);
        ctx.fill();
      }
    });
  }

  const met = LB.interiors.met || (LB.interiors.met = {});
  /** ctx: {root, anchors, FY (hall floor), GX0, GX1 (foot / head x of the raking glass), SZ0, SZ1 (hall z range),
   *  RY (roof underside), DX1 (east wall x), zBr0 (breach start z), zBm (breach centre z)}. */
