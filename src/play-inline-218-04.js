// play-inline-218 04 — ctx
// Lines 1336-1406 of readable/play-inline-218.pretty.js (statement-aligned).
  function railPts(b, pts) {
    if (pts.length < 2) return;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az, ay] = pts[i],
        [bx, bz, by] = pts[i + 1];
      b.rod("iron", PH.v3(ax, ay + 1.0, az), PH.v3(bx, by + 1.0, bz), 0.03, 4);
      b.rod("iron", PH.v3(ax, ay + 0.5, az), PH.v3(bx, by + 0.5, bz), 0.02, 4);
      b.rod("iron", PH.v3(ax, ay, az), PH.v3(ax, ay + 1.0, az), 0.035, 4);
      PH.colWall(
        ax,
        az,
        bx,
        bz,
        0.2,
        Math.min(ay, by) - 0.5,
        Math.max(ay, by) + 1.2,
      );
    }
  }

  function jollyRogerTex() {
    return PH.canvasTex("ph_jolly", 256, 160, (ctx, w, h) => {
      ctx.fillStyle = "#141414";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8d0bc";
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.42, 30, 0, TAU);
      ctx.fill();
      ctx.fillRect(w / 2 - 18, h * 0.5, 36, 22);
      ctx.fillStyle = "#141414";
      ctx.beginPath();
      ctx.arc(w / 2 - 11, h * 0.4, 8, 0, TAU);
      ctx.arc(w / 2 + 11, h * 0.4, 8, 0, TAU);
      ctx.fill();
      ctx.fillRect(w / 2 - 12, h * 0.62, 3, 8);
      ctx.fillRect(w / 2 - 3, h * 0.62, 3, 8);
      ctx.fillRect(w / 2 + 6, h * 0.62, 3, 8);
      ctx.strokeStyle = "#d8d0bc";
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(w / 2 - 60, h * 0.2);
      ctx.lineTo(w / 2 + 60, h * 0.9);
      ctx.moveTo(w / 2 + 60, h * 0.2);
      ctx.lineTo(w / 2 - 60, h * 0.9);
      ctx.stroke();
      ctx.fillStyle = "#c8a020";
      ctx.font = "bold 20px Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NYP", w / 2, h * 0.14);
      ctx.globalCompositeOperation = "destination-out";
      const r = PH.rng("jolly");
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(w - r() * 40, r() * h, 5 + r() * 14, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    });
  }

  PH.addBuilder(
    "navy_ext",
    function () {
      const root = new THREE.Group();
      root.name = "poi_navy_yard";
      G.scene.add(root);
      PH.navyExt = { root, anchors: buildNavy(root) };
    },
    30,
  );
