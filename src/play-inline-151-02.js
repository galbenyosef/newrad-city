// play-inline-151 02 — ctx
// Lines 21-336 of readable/play-inline-151.pretty.js (statement-aligned).
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  // ---------------------------------------------------------------
  // Textures owned by this POI
  // ---------------------------------------------------------------
  function backdropTex(kind) {
    return P.canvasTex("pu_dio_" + kind, 1024, 256, (ctx, w, h) => {
      const r = P.rng("dio" + kind);
      const sky = {
        savanna: ["#b8c8d0", "#f0d8a0"],
        jungle: ["#8aa8a0", "#b8c8a0"],
        desert: ["#c8b8a0", "#f0c890"],
        ocean: ["#1a4a6a", "#0a2030"],
        mountain: ["#a8b8c8", "#e0d8c8"],
      }[kind];
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, sky[0]);
      g.addColorStop(1, sky[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      if (kind === "ocean") {
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle = "rgba(160,210,230," + r() * 0.12 + ")";
          ctx.beginPath();
          ctx.moveTo(r() * w, 0);
          ctx.lineTo(r() * w + 80, h);
          ctx.lineTo(r() * w + 40, h);
          ctx.fill();
        }
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = "rgba(20,40,50,0.5)";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            h * 0.3 + r() * h * 0.6,
            8 + r() * 14,
            3 + r() * 4,
            0,
            0,
            TAU,
          );
          ctx.fill();
        }
        return;
      }
      // distant hills / mountains
      ctx.fillStyle =
        kind === "mountain"
          ? "#6a7a8a"
          : kind === "jungle"
            ? "#4a6a4a"
            : "#9a8a6a";
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 16)
        ctx.lineTo(
          x,
          h * (kind === "mountain" ? 0.3 : 0.55) +
            Math.sin(x / 90) * 18 +
            Math.sin(x / 31) * 8 +
            (kind === "mountain" ? -Math.abs(Math.sin(x / 200)) * 50 : 0),
        );
      ctx.lineTo(w, h);
      ctx.fill();
      ctx.fillStyle =
        kind === "jungle"
          ? "#2a4a2a"
          : kind === "desert"
            ? "#c8a060"
            : "#b89a58";
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
      if (kind === "savanna" || kind === "desert")
        for (let i = 0; i < 9; i++) {
          const x = r() * w,
            y = h * (0.6 + r() * 0.12),
            s = 0.6 + r() * 0.8;
          ctx.fillStyle = "#3a3020";
          ctx.fillRect(x, y - 30 * s, 3 * s, 30 * s);
          ctx.beginPath();
          ctx.ellipse(x + 1, y - 32 * s, 34 * s, 8 * s, 0, 0, TAU);
          ctx.fill();
        }
      if (kind === "jungle")
        for (let i = 0; i < 70; i++) {
          ctx.fillStyle =
            "rgba(" +
            ((30 + r() * 30) | 0) +
            "," +
            ((60 + r() * 50) | 0) +
            "," +
            ((30 + r() * 20) | 0) +
            ",0.9)";
          ctx.beginPath();
          ctx.arc(r() * w, h * (0.2 + r() * 0.6), 12 + r() * 30, 0, TAU);
          ctx.fill();
        }
      // herds on the horizon
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = "rgba(40,30,20,0.6)";
        ctx.fillRect(r() * w, h * (0.62 + r() * 0.06), 4, 3);
      }
      P.blotches(ctx, w, h, r, 14, 0.2);
    });
  }
  function muralTex() {
    return P.canvasTex("pu_amnh_mural", 1024, 512, (ctx, w, h) => {
      const r = P.rng("mural");
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#c8b890");
      g.addColorStop(1, "#8a7650");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // map lines
      ctx.strokeStyle = "rgba(90,70,40,0.5)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (h * i) / 8);
        ctx.bezierCurveTo(
          w * 0.3,
          (h * i) / 8 + 30,
          w * 0.7,
          (h * i) / 8 - 30,
          w,
          (h * i) / 8,
        );
        ctx.stroke();
      }
      // steamship
      ctx.fillStyle = "#4a3a24";
      ctx.fillRect(w * 0.08, h * 0.62, w * 0.3, h * 0.08);
      ctx.fillRect(w * 0.16, h * 0.46, w * 0.04, h * 0.16);
      ctx.fillRect(w * 0.26, h * 0.46, w * 0.04, h * 0.16);
      // explorers with rifles & pack animals
      for (let i = 0; i < 6; i++) {
        const x = w * (0.46 + i * 0.07),
          y = h * 0.74;
        ctx.fillStyle = "#3a2c18";
        ctx.fillRect(x, y - 70, 14, 70);
        ctx.beginPath();
        ctx.arc(x + 7, y - 80, 11, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#c8b890";
        ctx.fillRect(x - 6, y - 92, 26, 5);
      }
      ctx.fillStyle = "#5a4428";
      ctx.beginPath();
      ctx.ellipse(w * 0.88, h * 0.7, 60, 30, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(w * 0.84, h * 0.7, 8, 50);
      ctx.fillRect(w * 0.92, h * 0.7, 8, 50);
      // sunburst
      ctx.strokeStyle = "rgba(240,220,160,0.5)";
      ctx.lineWidth = 4;
      for (let k = 0; k < 18; k++) {
        const a = PI + (k / 17) * PI;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.3);
        ctx.lineTo(w * 0.5 + Math.cos(a) * 400, h * 0.3 + Math.sin(a) * 400);
        ctx.stroke();
      }
      P.blotches(ctx, w, h, r, 60, 0.3);
      P.speckle(ctx, w, h, r, 2000);
      // water damage run
      for (let i = 0; i < 5; i++) {
        const x = r() * w;
        const gg = ctx.createLinearGradient(0, 0, 0, h);
        gg.addColorStop(0, "rgba(40,30,10,0.5)");
        gg.addColorStop(1, "rgba(40,30,10,0)");
        ctx.fillStyle = gg;
        ctx.fillRect(x, 0, 20 + r() * 50, h);
      }
    });
  }
  // ===================================================================
  // INTERIOR
  // ===================================================================
  function diorama(S, cx, y0, cz, ry, w, dd, h, kind, fill, o) {
    o = o || {};
    const b = S.b;
    const M = P.m4(cx, y0, cz, ry);
    const L = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(M);
    // shell: floor, ceiling, side walls (recess extends to local -z)
    b.geo(
      "concrete_dark",
      new THREE.BoxGeometry(w, 0.2, dd).translate(0, -0.1, -dd / 2),
      M,
      { grime: 0.2 },
    );
    b.geo(
      "plaster",
      new THREE.BoxGeometry(w, 0.2, dd).translate(0, h + 0.1, -dd / 2),
      M,
      { noAO: true },
    );
    for (const s of [-1, 1])
      b.geo(
        "plaster",
        new THREE.BoxGeometry(0.2, h, dd).translate(
          s * (w / 2 + 0.1),
          h / 2,
          -dd / 2,
        ),
        M,
        {},
      );
    b.geo(
      "plaster",
      new THREE.BoxGeometry(w + 0.4, h, 0.2).translate(0, h / 2, -dd - 0.1),
      M,
      {},
    );
    // curved painted cyclorama
    const k = P.texMat("dio_" + kind, backdropTex(kind), { rough: 1 });
    const R = w * 0.62;
    const cyc = new THREE.CylinderGeometry(R, R, h, 16, 1, true, PI - 0.9, 1.8);
    b.geo(k, P.flipGeo(cyc).translate(0, h / 2, -dd + R * 0.97 - 0.05), M, {
      uv: "keep",
      noAO: true,
      grime: 0.05,
    });
    // ground: sculpted terrain lumps
    const gk =
      kind === "jungle" ? "foliage" : kind === "ocean" ? "rubble" : "dirt";
    b.geo(
      gk,
      new THREE.BoxGeometry(w, 0.3, dd).translate(0, 0.15, -dd / 2),
      M,
      { grime: 0.2 },
    );
    const rn = P.rng(cx * 3 + cz);
    for (let i = 0; i < 6; i++) {
      const p = L((rn() - 0.5) * w * 0.9, 0.2, -dd * (0.3 + rn() * 0.6));
      b.rock(
        kind === "jungle" ? "foliage" : "rubble",
        p.x,
        p.y,
        p.z,
        0.25 + rn() * 0.35,
        { flat: 0.5 },
      );
    }
    if (kind === "jungle")
      for (let i = 0; i < 5; i++) {
        const p = L((rn() - 0.5) * w * 0.9, 0.3, -dd * (0.5 + rn() * 0.45));
        b.rod(
          "wood_rotten",
          [p.x, p.y, p.z],
          [p.x + (rn() - 0.5), p.y + h * 0.8, p.z],
          0.12,
          5,
        );
        b.sphere("foliage", p.x, p.y + h * 0.75, p.z, 0.9, { sy: 0.6 });
      }
    // animals
    if (fill) fill(L, ry + 0, (lx, lz) => L(lx, 0.3, lz));
    // warm diorama light
    const lp = L(0, h - 0.4, -dd * 0.35);
    if (!o.dark) {
      S.light(
        lp.x,
        lp.y,
        lp.z,
        o.color || 0xffd8a0,
        Math.max(w, dd) * 1.3,
        o.li || 2.0,
      );
      const fp = L(0, h * 0.4, 1.2);
      S.light(fp.x, fp.y, fp.z, o.color || 0xffd8a0, 7.5, 0.6);
    }
    // glass front
    if (!o.open) {
      b.geo(
        "glass",
        new THREE.PlaneGeometry(w, h),
        M.clone().multiply(P.m4(0, h / 2, 0.02)),
        { uv: "box", noAO: true, grime: 0.4 },
      );
      if (o.cracked) {
        const ck = P.texMat("crack", crackTex(), {
          transparent: true,
          rough: 0.2,
        });
        b.geo(
          ck,
          new THREE.PlaneGeometry(w * 0.7, h * 0.8),
          M.clone().multiply(P.m4(o.cracked * w * 0.2, h * 0.5, 0.04)),
          { uv: "keep", noAO: true },
        );
      }
    }
    // bronze label rail
    b.geo(
      "bronze",
      new THREE.BoxGeometry(w, 0.08, 0.3).translate(0, -0.35, 0.15),
      M,
      { noAO: true },
    );
    if (o.label)
      D.label(
        b,
        "dio_" + kind + "_" + Math.round(cx) + "_" + Math.round(cz),
        o.label,
        L(0, -0.55, 0.32).x,
        L(0, -0.55, 0.32).y,
        L(0, -0.55, 0.32).z,
        1.2,
        0.36,
        ry,
        "label",
      );
  }
