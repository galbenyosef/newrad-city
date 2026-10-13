// play-inline-216 04 — ctx
// Lines 567-657 of readable/play-inline-216.pretty.js (statement-aligned).
  PH.neonLineMat = function (key, text, dead, back) {
    const W = 2048,
      H = 256;
    const tex = PH.canvasTex(
      "ph_neonline_" + key + (back ? "_b" : ""),
      W,
      H,
      (ctx) => {
        ctx.clearRect(0, 0, W, H);
        const cw = W / text.length;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font =
          '900 232px "Arial Black", "Helvetica Neue", Arial, sans-serif';
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === " ") continue;
          const x = (i + 0.5) * cw,
            y = H / 2 + 12,
            d = !!dead[i];
          ctx.save();
          // squeeze wide glyphs into their cell
          const mw = ctx.measureText(ch).width,
            sx = Math.min(1, (cw * 0.9) / mw);
          ctx.translate(x, y);
          ctx.scale(sx, 1);
          if (back) {
            ctx.fillStyle = "#5a4012";
            ctx.fillText(ch, 0, 0);
            ctx.restore();
            continue;
          }
          ctx.fillStyle = d ? "#7a6224" : "#e8b420";
          ctx.fillText(ch, 0, 0); // painted sheet-metal face
          ctx.lineWidth = 5;
          ctx.strokeStyle = d ? "#4a3a18" : "#8a5a10";
          ctx.strokeText(ch, 0, 0); // rim
          // neon tube: inset stroke
          ctx.globalCompositeOperation = "source-atop";
          if (!d) {
            ctx.shadowColor = "#fff2a0";
            ctx.shadowBlur = 18;
          }
          ctx.lineWidth = 9;
          ctx.strokeStyle = d ? "#6a6050" : "#fffbe0";
          ctx.setLineDash(d ? [18, 26] : []);
          ctx.strokeText(ch, 0, 0);
          ctx.restore();
        }
        // rust streaks and bird-droppings grime on the faces
        if (!back) {
          ctx.globalCompositeOperation = "source-atop";
          for (let k = 0; k < 90; k++) {
            const x = Math.random() * W,
              y = Math.random() * H * 0.6,
              l = 20 + Math.random() * 90;
            ctx.fillStyle =
              "rgba(90,40,10," + (0.12 + Math.random() * 0.2) + ")";
            ctx.fillRect(x, y, 2 + Math.random() * 3, l);
          }
          ctx.globalCompositeOperation = "source-over";
        }
      },
      { clamp: true },
    );
    return back
      ? PH.texMat("neonline_" + key + "_b", tex, {
          transparent: true,
          double: true,
          rough: 0.7,
          metal: 0.3,
        })
      : PH.texMat("neonline_" + key, tex, {
          transparent: true,
          double: true,
          emissive: 1.6,
          glow: [0.35, 2.0],
          name: "ph_neon_sign",
        });
  };

  PH.addBuilder(
    "domino_ext",
    function () {
      const root = new THREE.Group();
      root.name = "poi_domino_sugar";
      G.scene.add(root);
      PH.dominoExt = { root, anchors: buildDomino(root) };
    },
    20,
  );
