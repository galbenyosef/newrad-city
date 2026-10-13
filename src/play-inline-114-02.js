// play-inline-114 02 — math
// Lines 18-212 of readable/play-inline-114.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  const CX = 310,
    CZ = -207.5;

  function textures() {
    // White glazed brick, small paired windows in vertical columns joined by dark-grey brick spandrels,
    // grey brick piers every other bay (the classic Chrysler striping), grey band at every 4th floor.
    K.facade("fac_chrysler", {
      bays: 6,
      floors: 8,
      bayW: 2.6,
      floorH: 3.4,
      wall: "#e2dfd6",
      brick: true,
      glass: "#1c2224",
      frame: "#34383a",
      spandrel: "#6a6d70",
      win: { x0: 0.36, x1: 0.64, y0: 0.3, y1: 0.76 },
      broken: 0.22,
      boarded: 0.06,
      mullions: 1,
      transom: false,
      seed: 1930,
      deco: (x, W, H, fy, y0, fh, bw) => {
        // brick texture on the grey spandrel columns
        x.fillStyle = "rgba(40,42,44,0.28)";
        for (let bx = 0; bx < 6; bx++)
          for (let k = 0; k < 6; k++)
            x.fillRect(bx * bw + bw * 0.36, y0 + (k * fh) / 6, bw * 0.28, 1);
        // darker grey piers between window pairs
        for (let bx = 0; bx <= 6; bx += 2) {
          x.fillStyle = "#8e9092";
          x.fillRect(bx * bw - bw * 0.05, y0, bw * 0.1, fh);
        }
        if (fy % 4 === 3) {
          x.fillStyle = "#5c5f62";
          x.fillRect(0, y0, W, fh * 0.16);
          x.fillStyle = "rgba(255,255,255,0.18)";
          x.fillRect(0, y0 + fh * 0.16, W, 2);
        }
      },
    });
    K.ALIASES.brick_grey = ["brick_tan", 0x75787c];
    K.ALIASES.brick_white = ["brick_tan", 0xe0ddd4];
    // Crown arch face: stainless scales + radiating triangular windows (map + emissive)
    const S = 512,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      ec = K.canvas(S, S),
      e = ec.getContext("2d");
    const g = x.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, "#c8ccd0");
    g.addColorStop(0.5, "#9aa0a6");
    g.addColorStop(1, "#d8dce0");
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
    e.fillStyle = "#000";
    e.fillRect(0, 0, S, S);
    // fish-scale cladding
    x.strokeStyle = "rgba(60,64,70,0.35)";
    x.lineWidth = 2;
    for (let row = 0; row < 26; row++)
      for (let col = -1; col < 18; col++) {
        const px = col * 30 + (row % 2) * 15,
          py = S - row * 20;
        x.beginPath();
        x.arc(px, py, 15, Math.PI, 0);
        x.stroke();
      }
    // radiating triangular windows (sunburst) centred at the bottom middle (spring line at v=0.2)
    const cx0 = S / 2,
      cy0 = S * 0.8,
      r = K.rng(1929);
    for (const ring of [
      [0.3, 0.58, 7],
      [0.62, 0.95, 11],
    ]) {
      for (let i = 0; i < ring[2]; i++) {
        const a = Math.PI + ((i + 0.5) * Math.PI) / ring[2],
          da = (Math.PI / ring[2]) * 0.42;
        const r0 = ring[0] * S * 0.62,
          r1 = ring[1] * S * 0.62;
        const p = [
          [cx0 + Math.cos(a - da) * r0, cy0 + Math.sin(a - da) * r0 * 1.2],
          [cx0 + Math.cos(a + da) * r0, cy0 + Math.sin(a + da) * r0 * 1.2],
          [cx0 + Math.cos(a) * r1, cy0 + Math.sin(a) * r1 * 1.2],
        ];
        x.fillStyle = "#1c2024";
        x.beginPath();
        x.moveTo(p[0][0], p[0][1]);
        x.lineTo(p[1][0], p[1][1]);
        x.lineTo(p[2][0], p[2][1]);
        x.fill();
        x.strokeStyle = "#e8ecf0";
        x.lineWidth = 3;
        x.stroke();
        if (r() < 0.55) {
          e.fillStyle = r() < 0.7 ? "#fff4d8" : "#ffd890";
          e.beginPath();
          e.moveTo(p[0][0], p[0][1]);
          e.lineTo(p[1][0], p[1][1]);
          e.lineTo(p[2][0], p[2][1]);
          e.fill();
        }
      }
    }
    // arch outline ribs
    x.strokeStyle = "#2a2e32";
    x.lineWidth = 14;
    x.beginPath();
    x.ellipse(cx0, cy0, S * 0.47, S * 0.76, 0, Math.PI, 0);
    x.stroke();
    x.strokeStyle = "#f4f8fc";
    x.lineWidth = 6;
    x.beginPath();
    x.ellipse(cx0, cy0, S * 0.44, S * 0.72, 0, Math.PI, 0);
    x.stroke();
    x.fillStyle = "#8a9096";
    x.fillRect(0, cy0, S, S - cy0);
    K.streaks(x, S, S, 40, 1928, 0.28);
    K.stains(x, S, S, 6, 1927, 0.3);
    const map = K.texFromCanvas(c, { clamp: true }),
      em = K.texFromCanvas(ec, { clamp: true });
    K.defineMat("chrysler_crown", {
      map,
      emissiveMap: em,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.1,
      color: 0xffffff,
      rough: 0.35,
      metal: 0.35,
      side: THREE.DoubleSide,
    });

    K.paint("chrysler_portal", 256, 256, (x2, W, H) => {
      x2.fillStyle = "#141414";
      x2.fillRect(0, 0, W, H);
      x2.strokeStyle = "#c8b070";
      x2.lineWidth = 4;
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + ((i + 0.5) * Math.PI) / 9;
        x2.beginPath();
        x2.moveTo(W / 2, H);
        x2.lineTo(W / 2 + Math.cos(a) * W, H + Math.sin(a) * H);
        x2.stroke();
      }
      x2.fillStyle = "#c8b070";
      x2.beginPath();
      x2.arc(W / 2, H, 40, Math.PI, 0);
      x2.fill();
      K.stains(x2, W, H, 4, 12, 0.4);
    });
    K.interior("chrysler:paints_mural"); // lobby ceiling mural — 30_chrysler_interior.js
    K.paint("raider_keepout", 256, 128, (x2, W, H) => {
      x2.fillStyle = "#6a5a42";
      x2.fillRect(0, 0, W, H);
      x2.fillStyle = "#b01a10";
      x2.font = "bold 40px Impact, sans-serif";
      x2.textAlign = "center";
      x2.save();
      x2.translate(W / 2, H / 2 + 14);
      x2.rotate(0.05);
      x2.fillText("TURN BACK", 0, -14);
      x2.font = "bold 26px Impact, sans-serif";
      x2.fillText("OR GET SPIKED", 0, 22);
      x2.restore();
      K.skull(x2, 30, 40, 16, "#e8e0d0");
    });
    K.interior("chrysler:paints_elev"); // lobby elevator doors
  }

  function archFace(b, mat, cx, cz, face, w, y0, ys, ah) {
    const sh = new THREE.Shape();
    sh.moveTo(-w, y0);
    sh.lineTo(w, y0);
    sh.lineTo(w, ys);
    sh.absellipse(0, ys, w, ah, 0, Math.PI, false);
    sh.lineTo(-w, y0);
    const g = new THREE.ShapeGeometry(sh, 14);
    const uv = g.attributes.uv,
      pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i),
        py = pos.getY(i);
      uv.setXY(
        i,
        (px + w) / (2 * w),
        K.clamp(((py - ys) / ah) * 0.8 + 0.2, 0, 1),
      );
    }
    b.geo(mat, g, { x: cx, y: 0, z: cz, ry: face, uv: "keep", grime: 0.15 });
    g.dispose();
  }

