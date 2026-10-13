// play-inline-88 04 — range
// Lines 770-1103 of readable/play-inline-88.pretty.js (statement-aligned).
  M.defineAtlas("weeds", function () {
    const S = 512,
      cv = M.canvas(S, S / 2),
      ctx = cv.getContext("2d");
    const r = M.rng("weeds");
    ctx.clearRect(0, 0, S, S / 2);
    // 4 tuft variants side by side (128×256 each)
    for (let v = 0; v < 4; v++) {
      const x0 = v * 128;
      const n = 30 + v * 8;
      for (let i = 0; i < n; i++) {
        const bx = x0 + 64 + (r() - 0.5) * 70,
          h = (0.35 + r() * 0.65) * 240 * (v === 3 ? 0.55 : 1);
        const lean = (r() - 0.5) * 60;
        // sun-bleached straw with a few darker, damp stems (dead grass reads tan-gold, not black)
        const c =
          r() < 0.45
            ? [176, 152, 96]
            : r() < 0.6
              ? [148, 128, 78]
              : r() < 0.7
                ? [122, 108, 66]
                : [96, 88, 56];
        ctx.strokeStyle = "rgb(" + c.join(",") + ")";
        ctx.lineWidth = 1.6 + r() * 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bx, 254);
        ctx.quadraticCurveTo(
          bx + lean * 0.3,
          254 - h * 0.6,
          bx + lean,
          254 - h,
        );
        ctx.stroke();
        if (v === 2 && r() < 0.25) {
          ctx.fillStyle = "rgb(140,120,70)";
          ctx.beginPath();
          ctx.ellipse(bx + lean, 254 - h, 3, 7, 0.3, 0, 7);
          ctx.fill();
        }
      }
      if (v === 1) {
        ctx.strokeStyle = "rgb(96,82,56)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const bx = x0 + 40 + r() * 50;
          ctx.beginPath();
          ctx.moveTo(bx, 254);
          for (let k = 1; k < 6; k++)
            ctx.lineTo(bx + (r() - 0.5) * 50, 254 - k * 30);
          ctx.stroke();
        }
      }
    }
    // DataTexture with straw-coloured transparent texels: the mip chain no longer fades the tufts to black
    let t;
    try {
      t = M.cutoutTex(cv, [140, 122, 78]);
    } catch (e) {
      t = M.finishTex(new THREE.CanvasTexture(cv));
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    }
    return {
      texture: t,
      transparent: false,
      alphaTest: 0.35,
      roughness: 1,
      side: THREE.DoubleSide,
      keepNormal: true,
    };
  });
  function tuft(x, z, h, r, y) {
    const b = M.buf("my/weeds", x, z, "fine");
    const v = r.int(0, 3),
      u0 = v * 0.25 + 0.005,
      u1 = (v + 1) * 0.25 - 0.005;
    const a = r() * Math.PI,
      w = h * 0.55;
    const c = M.mulc([1, 1, 1], r.range(0.7, 1.05));
    const yy = y === undefined ? Math.max(0, G.world.terrainHeight(x, z)) : y;
    for (let k = 0; k < 2; k++) {
      const aa = a + (k * Math.PI) / 2,
        dx = Math.cos(aa) * w,
        dz = Math.sin(aa) * w;
      // up-facing normals: double-sided tufts are lit like the ground they grow from
      M.quad(
        b,
        [x - dx, yy - 0.02, z - dz],
        [x + dx, yy - 0.02, z + dz],
        [x + dx, yy + h, z + dz],
        [x - dx, yy + h, z - dz],
        [0, 1, 0],
        [u0, 0.01, u1, 0.01, u1, 0.99, u0, 0.99],
        c,
      );
    }
  }
  M.weedTuft = tuft;

  /** Trash heap: split bags, boxes, a tyre, paper litter. */
  function trashHeap(x, z, r) {
    const y = Math.max(0, G.world.terrainHeight(x, z));
    const fb = M.buf("fabric", x, z, "detail");
    const n = r.int(4, 8);
    for (let i = 0; i < n; i++) {
      const px = x + r.range(-1.1, 1.1),
        pz = z + r.range(-1.1, 1.1),
        s = r.range(0.4, 0.75);
      const col = r.pick([
        [0.16, 0.17, 0.15],
        [0.12, 0.13, 0.14],
        [0.28, 0.3, 0.22],
        [0.36, 0.32, 0.24],
      ]);
      M.obox(fb, px, y + s * 0.3, pz, s * 1.2, s * 0.62, s, r() * 6, {
        pitch: r.range(-0.3, 0.3),
        roll: r.range(-0.3, 0.3),
        s: 0.6,
        c: col,
      });
    }
    if (r() < 0.45) {
      const px = x + r.range(-0.7, 0.7),
        pz = z + r.range(-0.7, 0.7);
      M.obox(
        M.buf("wood_rotten", px, pz, "detail"),
        px,
        y + 0.2,
        pz,
        0.6,
        0.4,
        0.45,
        r() * 6,
        { roll: r.range(-0.3, 0.3), s: 0.8, c: [0.75, 0.65, 0.5] },
      );
    }
    if (r() < 0.25) {
      const px = x + r.range(-0.8, 0.8),
        pz = z + r.range(-0.8, 0.8);
      M.pushXF(
        M.mtx(px, y + 0.12, pz, r() * 6, Math.PI / 2 + r.range(-0.2, 0.2), 0),
      );
      M.cyl(
        M.buf("metal_painted", px, pz, "detail"),
        0,
        -0.12,
        0,
        0.36,
        0.36,
        0.24,
        10,
        { c: [0.1, 0.1, 0.1] },
      );
      M.popXF();
    }
    M.decal(
      M.buf("my/markings", x, z, "fine"),
      x,
      y + 0.014,
      z,
      r.range(2.6, 4),
      r.range(2.6, 4),
      r() * 6,
      M.MARK.LITTER,
      M.mulc(M.WHITE, r.range(0.75, 1)),
    );
    if (r() < 0.5)
      M.debrisDrift(
        x + r.range(-0.6, 0.6),
        z + r.range(-0.6, 0.6),
        r.range(1.2, 2.2),
        r.range(0.8, 1.2),
        r.range(0.15, 0.3),
        r() * 3,
        r,
        { y },
      );
  }
  M.trashHeap = trashHeap;

  function curbClutter() {
    const L = G.LAYOUT;
    const r = M.rng("curbclutter");
    const X = M.intersections || [];
    const nearX = (x, z, pad) => {
      for (const q of X)
        if (
          Math.abs(q.x - x) < q.a.road / 2 + pad &&
          Math.abs(q.z - z) < q.s.road / 2 + pad
        )
          return true;
      return false;
    };
    let heaps = 0,
      drifts = 0,
      tufts = 0;
    function along(ax, az, bx, bz, nx, nz) {
      // walk a curb line; (nx,nz) points from the road toward the sidewalk
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 4) return;
      const ux = (bx - ax) / len,
        uz = (bz - az) / len;
      let t = r.range(2, 10);
      while (t < len - 2) {
        const px = ax + ux * t,
          pz = az + uz * t;
        if (!nearX(px, pz, 4) && !L.siteAt(px, pz, 2)) {
          const k = r();
          const inGutter = r() < 0.6; // gutter side (road) or curb side (sidewalk edge)
          const off = inGutter ? -r.range(0.4, 1.1) : r.range(0.5, 1.2);
          const qx = px + nx * off,
            qz = pz + nz * off;
          if (k < 0.38) {
            trashHeap(qx, qz, r);
            heaps++;
          } else if (k < 0.68) {
            M.debrisDrift(
              qx,
              qz,
              r.range(1.6, 4),
              r.range(0.7, 1.4),
              r.range(0.14, 0.34),
              Math.atan2(ux, uz),
              r,
              {},
            );
            drifts++;
          } else {
            const cell = r.pick([
              M.MARK.LEAVES,
              M.MARK.DIRT,
              M.MARK.LEAVES,
              M.MARK.SAND,
            ]);
            M.decal(
              M.buf("my/markings", qx, qz, "fine"),
              qx,
              Math.max(0, G.world.terrainHeight(qx, qz)) + 0.016,
              qz,
              r.range(1, 1.8),
              r.range(2.5, 5),
              Math.atan2(ux, uz),
              cell,
              M.mulc(M.WHITE, r.range(0.75, 1)),
            );
          }
        }
        // weeds along the gutter line
        for (let s = 0; s < 3; s++) {
          const tt = t + r.range(0, 8);
          if (tt > len || r() < 0.45) continue;
          const wx = ax + ux * tt - nx * r.range(0.05, 0.35),
            wz = az + uz * tt - nz * r.range(0.05, 0.35);
          if (nearX(wx, wz, 1)) continue;
          tuft(wx, wz, r.range(0.22, 0.6), r);
          tufts++;
        }
        t += r.range(8, 18);
      }
    }
    for (const a of M.roads.avenues) {
      const hw = a.road / 2;
      along(a.x - hw, a.z0 + 2, a.x - hw, a.z1 - 2, -1, 0);
      along(a.x + hw, a.z0 + 2, a.x + hw, a.z1 - 2, 1, 0);
    }
    for (const s of M.roads.streets) {
      const hw = s.road / 2;
      along(s.x0 + 2, s.z - hw, s.x1 - 2, s.z - hw, 0, -1);
      along(s.x0 + 2, s.z + hw, s.x1 - 2, s.z + hw, 0, 1);
    }
    // weeds in sidewalk cracks and against building walls
    for (let i = 0; i < 2600; i++) {
      const p = G.map.randomStreetPoint
        ? G.map.randomStreetPoint(r, true)
        : null;
      if (!p) continue;
      tuft(p.x, p.z, r.range(0.15, 0.45), r);
      tufts++;
    }
    M.decayStats = Object.assign(M.decayStats || {}, { heaps, drifts, tufts });
  }

  /** Standing water in potholes & low spots (glossy, murky). */
  function puddles() {
    const r = M.rng("puddles");
    const R = M.roads;
    let n = 0;
    for (let i = 0; i < 520; i++) {
      const useAve = r() < 0.5;
      let x, z;
      if (useAve) {
        const a = r.pick(R.avenues);
        x = a.x + r.range(-a.road / 2 + 0.8, a.road / 2 - 0.8);
        z = r.range(a.z0, a.z1);
      } else {
        const s = r.pick(R.streets);
        x = r.range(s.x0, s.x1);
        z = s.z + r.range(-s.road / 2 + 0.8, s.road / 2 - 0.8);
      }
      if (M.rasterAt(x, z) !== M.RC.ROAD || G.LAYOUT.siteAt(x, z, 1)) continue;
      const rds = r.range(0.5, 1.8);
      // broken-edged pothole rim + murky water sheet
      M.decal(
        M.buf("my/markings", x, z, "fine"),
        x,
        0.013,
        z,
        rds * 2.6,
        rds * 2.3,
        r() * 6,
        M.MARK.POTHOLE,
        M.mulc(M.WHITE, r.range(0.8, 1)),
      );
      const pts = [];
      const k = r.int(9, 13);
      for (let j = 0; j < k; j++) {
        const a = (j / k) * Math.PI * 2,
          rr = rds * r.range(0.72, 1.05);
        pts.push([x + Math.cos(a) * rr * 1.1, z + Math.sin(a) * rr]);
      }
      M.poly(M.buf("water@gloss,fwd", x, z, "fine"), pts, 0.03, {
        s: 3,
        c: [0.42, 0.46, 0.38],
        convex: true,
      });
      n++;
    }
    M.decayStats = Object.assign(M.decayStats || {}, { puddles: n });
  }

  // -------------------------------------------------------------------
  // Entry point (after the buildings: needs M.wallLog, M.storefronts, M.lots)
  // -------------------------------------------------------------------
