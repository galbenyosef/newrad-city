// play-inline-292 08 — fillstyle
// Lines 1851-2159 of readable/play-inline-292.pretty.js (statement-aligned).
  PM.labelKey = function (key, lines, style, w, h) {
    w = w || 512;
    h = h || 256;
    const tex = PM.canvasTex(
      "pm2_lbl_" + key,
      w,
      h,
      (c) => {
        const r = rnd("lbl" + key);
        if (style === "brute") {
          c.fillStyle = "#b8ac90";
          c.fillRect(0, 0, w, h);
          for (let i = 0; i < 20; i++) {
            c.fillStyle = "rgba(90,20,10," + r() * 0.3 + ")";
            c.beginPath();
            c.arc(r() * w, r() * h, 4 + r() * 20, 0, TAU);
            c.fill();
          }
          c.fillStyle = "#5a0a06";
          c.textAlign = "center";
          c.textBaseline = "middle";
          let fs = Math.floor((h * 0.75) / lines.length);
          c.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
          let mw = 0;
          for (const t of lines) mw = Math.max(mw, c.measureText(t).width);
          if (mw > w * 0.92) {
            fs = Math.floor((fs * w * 0.92) / mw);
            c.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
          }
          lines.forEach((t, i) => {
            c.save();
            c.translate(
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.05,
            );
            c.rotate((r() - 0.5) * 0.1);
            c.fillText(t, 0, 0);
            c.restore();
          });
        } else if (style === "brass") {
          c.fillStyle = "#6a5428";
          c.fillRect(0, 0, w, h);
          c.strokeStyle = "#c8a860";
          c.lineWidth = 8;
          c.strokeRect(6, 6, w - 12, h - 12);
          c.fillStyle = "#e8d090";
          c.textAlign = "center";
          c.textBaseline = "middle";
          const fs = Math.floor((h * 0.6) / lines.length);
          c.font = "bold " + fs + "px Georgia, serif";
          lines.forEach((t, i) =>
            c.fillText(
              t,
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.15,
            ),
          );
          grime(c, w, h, r, 0.5);
        } else {
          c.fillStyle = "#f2efe6";
          c.fillRect(0, 0, w, h);
          c.fillStyle = "#1a1a1a";
          c.textAlign = "left";
          c.textBaseline = "top";
          let y = 16;
          lines.forEach((t, i) => {
            const fs = i === 0 ? Math.floor(h * 0.16) : Math.floor(h * 0.1);
            c.font =
              (i === 0 ? "bold " : "") +
              fs +
              'px "Helvetica Neue", Helvetica, Arial, sans-serif';
            c.fillText(t, 18, y);
            y += fs * 1.35;
          });
          grime(c, w, h, r, 0.3);
        }
      },
      { clamp: true },
    );
    return PM.texMat("pm2_lbl_" + key, tex, { rough: 0.8 });
  };

  // -------------------------------------------------------------------
  // Furniture helpers
  // -------------------------------------------------------------------
  /**
   * Bookcase run against a wall: face centre line from (x0,z0) to (x1,z1) (the face looks toward ry),
   * y0..y1, depth d. Uprights every ~1.2 m, cornice on top. Books are texture (world-projected).
   */
  PM.bookcase = function (b, x0, z0, x1, z1, y0, y1, ry, opts) {
    opts = opts || {};
    const d = opts.depth || 0.45,
      key = opts.books || "books",
      frame = opts.frame || "walnut";
    const len = Math.hypot(x1 - x0, z1 - z0),
      ang = Math.atan2(-(z1 - z0), x1 - x0);
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const mx = (x0 + x1) / 2 - (s * d) / 2,
      mz = (z0 + z1) / 2 - (c * d) / 2;
    // the book face: a thin box (books texture on its front)
    b.box(
      key,
      mx + s * (d / 2 - 0.03),
      y0,
      mz + c * (d / 2 - 0.03),
      len,
      y1 - y0,
      0.06,
      { ry: ang, seg: false, grime: 0.25, noAO: true },
    );
    b.box(frame, mx, y0, mz, len, y1 - y0, d - 0.08, {
      ry: ang,
      seg: false,
      grime: 0.3,
    });
    b.box(frame, mx + s * 0.03, y1, mz + c * 0.03, len + 0.1, 0.16, d + 0.06, {
      ry: ang,
      seg: false,
      grime: 0.3,
    });
    b.box(frame, mx + s * 0.02, y0, mz + c * 0.02, len, 0.12, d + 0.02, {
      ry: ang,
      seg: false,
    });
    const n = Math.max(1, Math.round(len / 1.2));
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        px = x0 + (x1 - x0) * t - s * (d / 2 - 0.02),
        pz = z0 + (z1 - z0) * t - c * (d / 2 - 0.02);
      b.box(frame, px, y0, pz, 0.08, y1 - y0, d, {
        ry: ang,
        seg: false,
        grime: 0.3,
      });
    }
    if (opts.collide !== false)
      PM.colWall(
        x0 - (s * d) / 2,
        z0 - (c * d) / 2,
        x1 - (s * d) / 2,
        z1 - (c * d) / 2,
        d,
        y0,
        y1,
        { walkable: false },
      );
  };
  /** Club armchair (leather). */
  PM.armchair = function (b, x, y, z, ry, key) {
    key = key || "leather_brown";
    const M = PM.m4(x, y, z, ry);
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.45,
      });
    add(new THREE.BoxGeometry(0.85, 0.42, 0.8), PM.m4(0, 0.21, 0));
    add(
      new THREE.BoxGeometry(0.85, 0.55, 0.2),
      PM.m4(0, 0.62, -0.32, 0, -0.12),
    );
    for (const sg of [-1, 1])
      add(
        new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8),
        PM.m4(sg * 0.37, 0.56, 0, 0, Math.PI / 2),
      );
    add(
      new THREE.BoxGeometry(0.72, 0.12, 0.62),
      PM.m4(0, 0.47, 0.05),
      "fabric",
    );
  };
  /** Table lamp with emissive shade and a glow sprite in the given parent. */
  PM.tableLamp = function (b, x, y, z, parent, col) {
    b.cyl("brass", x, y, z, 0.07, 0.1, 0.05, 8, { hSeg: 1 });
    b.cyl("brass", x, y + 0.05, z, 0.02, 0.02, 0.35, 6, { hSeg: 1 });
    b.cyl("lamp_shade", x, y + 0.35, z, 0.12, 0.2, 0.22, 10, {
      hSeg: 1,
      noAO: true,
      open: true,
    });
    PM.glow(V3(x, y + 0.45, z), col || 0xffc070, 0.9, parent, {
      intensity: 1.1,
      flicker: 0.05,
    });
  };
  /** Display vitrine (glass case on a plinth). */
  PM.vitrine = function (b, x, y, z, w, d, h, ry) {
    b.box("walnut", x, y, z, w, 0.9, d, { ry, seg: false, grime: 0.3 });
    b.box("glass_dark", x, y + 0.9, z, w - 0.04, h, d - 0.04, {
      ry,
      seg: false,
      noAO: true,
      grime: 0.1,
    });
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const c = Math.cos(ry || 0),
        s = Math.sin(ry || 0),
        lx = dx * (w / 2 - 0.02),
        lz = dz * (d / 2 - 0.02);
      b.box(
        "brass",
        x + lx * c + lz * s,
        y + 0.9,
        z - lx * s + lz * c,
        0.03,
        h,
        0.03,
        { seg: false },
      );
    }
    PM.col(x, z, w, d, y, y + 0.9 + h, ry || 0, { walkable: false });
  };

  /** Turn a geometry inside-out (for domes seen from within): flips triangle winding and normals. */
  PM.invertGeo = function (geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    for (const name of ["position", "normal", "uv"]) {
      const at = g.attributes[name];
      if (!at) continue;
      const n = at.itemSize,
        arr = at.array;
      for (let t = 0; t < at.count; t += 3)
        for (let k = 0; k < n; k++) {
          const i1 = (t + 1) * n + k,
            i2 = (t + 2) * n + k;
          const tmp = arr[i1];
          arr[i1] = arr[i2];
          arr[i2] = tmp;
        }
    }
    const nr = g.attributes.normal;
    if (nr)
      for (let i = 0; i < nr.array.length; i++) nr.array[i] = -nr.array[i];
    return g;
  };
  /** Painted dome: u around, v up — gilded frieze, a ring of robed figures on clouds, sky, an oculus of light. */
  PM.domeTex = function () {
    return PM.canvasTex("pm2_dome", 1024, 512, (c, w, h) => {
      const r = rnd("dome");
      const g = c.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, "#c8a868");
      g.addColorStop(0.12, "#8a6a3a");
      g.addColorStop(0.2, "#5a7aa0");
      g.addColorStop(0.75, "#8aa8c8");
      g.addColorStop(0.92, "#e8e0c0");
      g.addColorStop(1, "#fff8e0");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      for (let i = 0; i < 50; i++) {
        c.fillStyle = "rgba(240,232,215," + (0.2 + r() * 0.3) + ")";
        c.beginPath();
        c.ellipse(
          r() * w,
          h * (0.4 + r() * 0.35),
          30 + r() * 60,
          10 + r() * 18,
          0,
          0,
          TAU,
        );
        c.fill();
      }
      for (let k = 0; k < 8; k++) {
        const x = ((k + 0.5) * w) / 8,
          y = h * 0.62;
        c.fillStyle = ["#8a2a1e", "#2a4a8a", "#c8a040", "#4a6a3a"][k % 4];
        c.beginPath();
        c.moveTo(x - 26, y + 60);
        c.quadraticCurveTo(x, y - 30, x + 26, y + 60);
        c.fill();
        c.fillStyle = "#e8c8a0";
        c.beginPath();
        c.arc(x, y - 16, 11, 0, TAU);
        c.fill();
        c.strokeStyle = "#e8d090";
        c.lineWidth = 3;
        c.beginPath();
        c.arc(x, y - 16, 16, 0, TAU);
        c.stroke();
      }
      c.fillStyle = "#c8a050";
      c.fillRect(0, h * 0.86, w, h * 0.05);
      for (let x = 0; x < w; x += 24) {
        c.fillStyle = "#6a4a20";
        c.fillRect(x, h * 0.87, 10, h * 0.03);
      }
      for (let k = 0; k < 16; k++) {
        c.fillStyle = "rgba(200,160,80,0.8)";
        c.fillRect((k * w) / 16, 0, 4, h * 0.86);
      } // gilded ribs
      crackle(c, 0, 0, w, h, r, 120);
      grime(c, w, h, r, 1.0);
      c.fillStyle = "rgba(30,24,16,0.6)";
      c.beginPath();
      c.ellipse(w * 0.3, h * 0.45, 70, 40, 0.3, 0, TAU);
      c.fill(); // water stain
    });
  };

  // -------------------------------------------------------------------
  // The Algonquin cat (a small procedural tabby, animated tail)
  // -------------------------------------------------------------------
