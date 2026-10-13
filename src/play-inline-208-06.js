// play-inline-208 06 — deck
// Lines 2077-2325 of readable/play-inline-208.pretty.js (statement-aligned).
  function roundArch(w, h) {
    const s = new THREE.Shape(),
      r = w / 2,
      sp = h - r;
    s.moveTo(-r, 0);
    s.lineTo(r, 0);
    s.lineTo(r, sp);
    s.absarc(0, sp, r, 0, PI, false);
    s.lineTo(-r, 0);
    return s;
  }
  /** A ship's ladder up to a lit deck hatch (visual; the hatch is a load door). ry: facing of the climber. */
  function ladder(b, x, y, z, h, ry) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    for (const sg of [-1, 1])
      b.beam(
        "oak",
        V3(x + c * sg * 0.35 - s * 0.3, y, z - s * sg * 0.35 - c * 0.3),
        V3(x + c * sg * 0.35 + s * 0.15, y + h, z - s * sg * 0.35 + c * 0.15),
        0.07,
        0.07,
        {},
      );
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      b.beam(
        "oak",
        V3(
          x - c * 0.35 + s * (-0.3 + 0.45 * t),
          y + h * t,
          z + s * 0.35 + c * (-0.3 + 0.45 * t),
        ),
        V3(
          x + c * 0.35 + s * (-0.3 + 0.45 * t),
          y + h * t,
          z - s * 0.35 + c * (-0.3 + 0.45 * t),
        ),
        0.05,
        0.05,
        {},
      );
    }
    b.quad("lamp_blue", x + s * 0.2, y + h + 0.17, z + c * 0.2, 1.1, 1.1, {
      rx: HP,
      noAO: true,
    });
    PF.glow(V3(x + s * 0.2, y + h, z + c * 0.2), 0xd8e4ff, 1.4, null, {
      intensity: 0.8,
    });
  }
  /** A torn, sagging square sail hanging from a yard (double-sided, alpha-tested rags). */
  function tornSail(b, x, y, zc, w, h) {
    const tex = PF.canvasTex(
      "pf_sp_sail",
      256,
      256,
      (ctx, W, H) => {
        ctx.clearRect(0, 0, W, H);
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#cfc6b0");
        g.addColorStop(1, "#8a826c");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(60,50,40,0.4)";
        ctx.lineWidth = 2;
        for (let x = 0; x < W; x += 24) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "destination-out";
        const r = PF.rng(5);
        for (let i = 0; i < 9; i++) {
          ctx.beginPath();
          const cx = r() * W,
            cy = H * (0.3 + r() * 0.7);
          ctx.moveTo(cx, cy);
          for (let k = 0; k < 7; k++)
            ctx.lineTo(cx + (r() - 0.5) * 90, cy + (r() - 0.3) * 90);
          ctx.fill();
        }
        for (let x = 0; x < W; x += 6) {
          ctx.fillRect(x, H - r() * 60, 6, 60);
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { clamp: true },
    );
    const k = PF.texMat("sp_sail", tex, {
      transparent: true,
      side: THREE.DoubleSide,
      rough: 1,
    });
    const g = new THREE.PlaneGeometry(w, h, 6, 4);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const yy = p.getY(i),
        xx = p.getX(i);
      p.setZ(
        i,
        Math.sin((0.5 - yy / h) * PI) * 1.4 + Math.cos((xx / w) * PI) * 0.3,
      );
    }
    g.computeVertexNormals();
    b.add(k, g, {
      m: PF.m4(x, y - h / 2 - 0.2, zc, HP),
      uv: "keep",
      grime: 0.3,
      noAO: true,
    });
  }

  function ambrose(b, anchors, r) {
    const S = AM;
    hull(b, "hull_red", S, { nu: 14, nv: 28 });
    deck(b, "deck_wood", S, S.deck, 0.12, true);
    bulwark(b, S, S.deck, 0.9, [[0.5, 0.58, 1]], "hull_white", "iron");
    for (const s of [-1, 1])
      hullName(
        b,
        "AMBROSE",
        (S.x0 + S.x1) / 2,
        S.top - 1.6,
        S.zc + s * (S.hb + 0.06),
        s > 0 ? 0 : PI,
        9,
        1.6,
      );
    hullName(
      b,
      "No. 87",
      S.x1 - 4,
      S.top - 0.9,
      S.zc - S.hb * wf(0.85) - 0.06,
      PI - 0.2,
      2.2,
      0.5,
    );
    // deckhouse + wheelhouse, funnel, the light mast with its lantern, foremast
    b.boxMM(
      "hull_white",
      288,
      S.deck,
      S.zc - 1.9,
      298,
      S.deck + 2.4,
      S.zc + 1.9,
      { grime: 0.5 },
    );
    b.boxMM(
      "hull_white",
      289,
      S.deck + 2.4,
      S.zc - 1.5,
      293,
      S.deck + 4.4,
      S.zc + 1.5,
      { grime: 0.5 },
    );
    for (let x = 289.6; x < 293; x += 0.9)
      b.quad("glass_dark", x, S.deck + 3.6, S.zc - 1.51, 0.6, 0.8, {
        ry: PI,
        noAO: true,
      });
    PF.colMM(288, S.deck, S.zc - 1.9, 298, S.deck + 4.4, S.zc + 1.9, {
      walkable: false,
    });
    b.cyl("paint_cream", 295.5, S.deck + 2.4, S.zc, 0.55, 0.6, 3.2, 12, {
      hSeg: 1,
      c: 0xd8b830,
    });
    b.cyl("hull_black", 295.5, S.deck + 5.6, S.zc, 0.56, 0.56, 0.6, 12, {
      hSeg: 1,
    });
    b.cyl("mahogany", 286, S.deck, S.zc, 0.2, 0.25, 12, 8, { hSeg: 2 });
    b.cyl("iron", 286, S.deck + 10, S.zc, 0.9, 0.9, 0.12, 12, { hSeg: 1 });
    PF.railing(
      b,
      Array.from({ length: 13 }, (_, i) => [
        286 + Math.cos((i / 12) * TAU) * 0.9,
        S.zc + Math.sin((i / 12) * TAU) * 0.9,
      ]),
      S.deck + 10.1,
      0.6,
      "iron",
    );
    b.cyl("lamp_warm", 286, S.deck + 10.1, S.zc, 0.5, 0.5, 1.0, 10, {
      hSeg: 1,
      noAO: true,
    });
    b.cyl("hull_black", 286, S.deck + 11.1, S.zc, 0.1, 0.6, 0.6, 10, {
      hSeg: 1,
    });
    PF.glow(V3(286, S.deck + 10.6, S.zc), 0xffd070, 4.5, null, {
      intensity: 1.6,
      flicker: 0.05,
    });
    PF.col(286, S.zc, 0.6, 0.6, S.deck, S.deck + 10, 0, { walkable: false });
    b.cyl("mahogany", 302, S.deck, S.zc, 0.16, 0.2, 8, 8, { hSeg: 1 });
    for (const s of [-1, 1]) {
      b.beam(
        "iron",
        V3(284, S.top, S.zc + s * S.hb),
        V3(286, S.deck + 9.8, S.zc),
        0.03,
        0.03,
        { noAO: true },
      );
      b.beam(
        "iron",
        V3(302, S.top, S.zc + s * S.hb * 0.8),
        V3(302, S.deck + 7.5, S.zc),
        0.03,
        0.03,
        { noAO: true },
      );
    }
    // gangway from Pier 16 (south side of the lightship is the pier's north edge)
    {
      const gx = S.x0 + 0.54 * (S.x1 - S.x0),
        zS = S.zc + S.hb * wf(0.54),
        zP = P16.z0 + 0.8;
      PF.stepPath(
        gx,
        zP,
        PI,
        1.2,
        zP - zS - 0.4,
        (t) => 0.3 + (S.deck - 0.3) * t,
        { maxRise: 0.3, thick: 0.3 },
      );
      b.beam(
        "deck_wood",
        V3(gx, 0.3, zP),
        V3(gx, S.deck, zS + 0.4),
        1.2,
        0.1,
        {},
      );
      anchors.ambrose_gangway = PF.anchor(gx, 0.3, zP + 1.2, 0);
    }
    anchors.ambrose_locker = PF.anchor(299.5, S.deck, S.zc - 1.2, 0);
  }

  // ===================================================================
  // INTERIOR (two sub-areas)
  // ===================================================================
