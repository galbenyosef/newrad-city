// play-inline-78 07 — ctx
// Lines 1942-2190 of readable/play-inline-78.pretty.js (statement-aligned).
  M.MARK = {
    WHITE: 0,
    YELLOW: 1,
    CRACKS: 2,
    POTHOLE: 3,
    SCORCH: 4,
    PUDDLE: 5,
    DIRT: 6,
    ONLY: 7,
    ARROW: 8,
    GRIME: 9,
    LITTER: 10,
    STAIN: 11,
    LEAVES: 12,
    BLOOD: 13,
    MOSS: 14,
    SAND: 15,
  };
  M.defineAtlas("markings", function () {
    const S = 1024,
      C = 256,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("markings");
    ctx.clearRect(0, 0, S, S);
    function cell(i) {
      return [(i % 4) * C, Math.floor(i / 4) * C];
    }
    function paint(i, col) {
      const [x, y] = cell(i);
      ctx.fillStyle = col;
      ctx.fillRect(x + 2, y + 2, C - 4, C - 4);
      // weathering: punch holes via destination-out
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 760; k++) {
        ctx.globalAlpha = 0.25 + r() * 0.7;
        ctx.fillRect(x + r() * C, y + r() * C, 2 + r() * 14, 1 + r() * 6);
      }
      for (let k = 0; k < 10; k++) {
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x + r() * C, y + r() * C, 5 + r() * 22, 0, 7);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    paint(M.MARK.WHITE, "rgba(214,208,190,0.85)");
    paint(M.MARK.YELLOW, "rgba(200,160,50,0.85)");
    {
      // cracks
      const [x, y] = cell(M.MARK.CRACKS);
      ctx.strokeStyle = "rgba(12,11,9,0.85)";
      ctx.lineCap = "round";
      for (let k = 0; k < 7; k++) {
        let px = x + C / 2,
          py = y + C / 2;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        const ang0 = r() * 7;
        for (let s = 0; s < 9; s++) {
          const a = ang0 + (r() - 0.5) * 1.3;
          px += Math.cos(a) * 14;
          py += Math.sin(a) * 14;
          px = M.clamp(px, x + 4, x + C - 4);
          py = M.clamp(py, y + 4, y + C - 4);
          ctx.lineTo(px, py);
          ctx.lineWidth = Math.max(1, ctx.lineWidth - 0.3);
        }
        ctx.stroke();
      }
    }
    {
      // pothole
      const [x, y] = cell(M.MARK.POTHOLE);
      const g = ctx.createRadialGradient(
        x + C / 2,
        y + C / 2,
        10,
        x + C / 2,
        y + C / 2,
        C / 2 - 8,
      );
      g.addColorStop(0, "rgba(15,13,10,0.95)");
      g.addColorStop(0.55, "rgba(30,26,20,0.9)");
      g.addColorStop(0.8, "rgba(60,55,45,0.6)");
      g.addColorStop(1, "rgba(60,55,45,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      for (let a = 0; a < 6.3; a += 0.3) {
        const rr = (C / 2 - 12) * (0.75 + r() * 0.25);
        ctx.lineTo(x + C / 2 + Math.cos(a) * rr, y + C / 2 + Math.sin(a) * rr);
      }
      ctx.fill();
      ctx.fillStyle = "rgba(90,85,70,0.7)";
      for (let k = 0; k < 40; k++)
        ctx.fillRect(
          x + C / 2 + (r() - 0.5) * 120,
          y + C / 2 + (r() - 0.5) * 120,
          3 + r() * 6,
          3 + r() * 5,
        );
    }
    function radial(i, inner, outer, rds) {
      const [x, y] = cell(i);
      const g = ctx.createRadialGradient(
        x + C / 2,
        y + C / 2,
        4,
        x + C / 2,
        y + C / 2,
        rds || C / 2 - 4,
      );
      g.addColorStop(0, inner);
      g.addColorStop(1, outer);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
    }
    radial(M.MARK.SCORCH, "rgba(8,7,6,0.9)", "rgba(20,18,14,0)");
    {
      const [x, y] = cell(M.MARK.SCORCH);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      for (let k = 0; k < 30; k++) {
        const a = r() * 7,
          d = r() * 110;
        ctx.beginPath();
        ctx.arc(
          x + C / 2 + Math.cos(a) * d,
          y + C / 2 + Math.sin(a) * d,
          3 + r() * 10,
          0,
          7,
        );
        ctx.fill();
      }
    }
    radial(M.MARK.PUDDLE, "rgba(22,28,24,0.85)", "rgba(22,28,24,0)");
    radial(M.MARK.DIRT, "rgba(78,64,44,0.85)", "rgba(78,64,44,0)");
    {
      const [x, y] = cell(M.MARK.DIRT);
      for (let k = 0; k < 200; k++) {
        ctx.fillStyle =
          "rgba(" +
          ((60 + r() * 40) | 0) +
          "," +
          ((50 + r() * 30) | 0) +
          ",30," +
          r() * 0.6 +
          ")";
        ctx.fillRect(
          x + 20 + r() * (C - 40),
          y + 20 + r() * (C - 40),
          2 + r() * 6,
          2 + r() * 6,
        );
      }
    }
    {
      const [x, y] = cell(M.MARK.ONLY);
      ctx.fillStyle = "rgba(214,208,190,0.8)";
      ctx.font = "bold 120px Arial Narrow, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.save();
      ctx.translate(x + C / 2, y + C / 2);
      ctx.scale(0.55, 1.6);
      ctx.fillText("ONLY", 0, 0);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 200; k++) {
        ctx.globalAlpha = r();
        ctx.fillRect(x + r() * C, y + r() * C, 3 + r() * 10, 2 + r() * 4);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    {
      const [x, y] = cell(M.MARK.ARROW);
      ctx.fillStyle = "rgba(214,208,190,0.8)";
      ctx.beginPath();
      ctx.moveTo(x + C / 2, y + 10);
      ctx.lineTo(x + C / 2 + 60, y + 90);
      ctx.lineTo(x + C / 2 + 20, y + 90);
      ctx.lineTo(x + C / 2 + 20, y + C - 10);
      ctx.lineTo(x + C / 2 - 20, y + C - 10);
      ctx.lineTo(x + C / 2 - 20, y + 90);
      ctx.lineTo(x + C / 2 - 60, y + 90);
      ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 200; k++) {
        ctx.globalAlpha = r();
        ctx.fillRect(x + r() * C, y + r() * C, 3 + r() * 10, 2 + r() * 4);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    {
      const [x, y] = cell(M.MARK.GRIME);
      const g = ctx.createLinearGradient(x, y, x, y + C);
      g.addColorStop(0, "rgba(20,18,14,0.0)");
      g.addColorStop(1, "rgba(20,18,14,0.75)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
      for (let k = 0; k < 30; k++) {
        ctx.fillStyle = "rgba(15,13,10," + r() * 0.35 + ")";
        ctx.fillRect(x + r() * C, y + r() * C * 0.5, 2 + r() * 5, C);
      }
    }
    {
      const [x, y] = cell(M.MARK.LITTER);
      for (let k = 0; k < 140; k++) {
        const v = (66 + r() * 60) | 0;
        ctx.fillStyle = "rgba(" + v + "," + (v - 8) + "," + (v - 22) + ",0.85)";
        /* integration: darker, reads as grime not confetti */ ctx.save();
        ctx.translate(x + 10 + r() * (C - 20), y + 10 + r() * (C - 20));
        ctx.rotate(r() * 7);
        ctx.fillRect(-4 - r() * 6, -3 - r() * 4, 6 + r() * 12, 4 + r() * 8);
        ctx.restore();
      }
    }
    radial(M.MARK.STAIN, "rgba(12,12,10,0.7)", "rgba(12,12,10,0)", C / 2 - 30);
    {
      const [x, y] = cell(M.MARK.LEAVES);
      for (let k = 0; k < 260; k++) {
        ctx.fillStyle =
          r() < 0.5 ? "rgba(90,70,40,0.85)" : "rgba(60,50,30,0.85)";
        ctx.save();
        ctx.translate(x + 8 + r() * (C - 16), y + 8 + r() * (C - 16));
        ctx.rotate(r() * 7);
        ctx.beginPath();
        ctx.ellipse(0, 0, 5 + r() * 3, 2.5, 0, 0, 7);
        ctx.fill();
        ctx.restore();
      }
    }
    radial(M.MARK.BLOOD, "rgba(70,10,8,0.85)", "rgba(50,8,6,0)", C / 2 - 40);
    radial(M.MARK.MOSS, "rgba(62,70,40,0.75)", "rgba(62,70,40,0)");
    radial(M.MARK.SAND, "rgba(120,108,84,0.8)", "rgba(120,108,84,0)");
    const t = finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, transparent: true, roughness: 0.95 };
  });
  M.markUV = (i) => M.cellUV(i, 4, 4);

  // --- Manhattan schist (natural rock, tileable): foliated grey-brown bands, mica glints, cracks, lichen ---
