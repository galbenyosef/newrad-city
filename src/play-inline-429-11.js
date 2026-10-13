// play-inline-429 11 — math
// Lines 3139-3413 of readable/play-inline-429.pretty.js (statement-aligned).
  K.lamp = function (b, x, y, z, kind, color, intensity, radius, o) {
    o = o || {};
    const col = K.tint(color || [1, 0.8, 0.55]);
    const ceil = o.ceil !== undefined ? o.ceil : y + 0.6;
    if (kind === "tube") {
      const L = o.len || 1.2,
        al = o.alongX !== false;
      b.box(
        "metal",
        x,
        y + 0.04,
        z,
        al ? L + 0.1 : 0.16,
        0.06,
        al ? 0.16 : L + 0.1,
        { grime: 0.3 },
      );
      if (!o.dead)
        b.box("lamp", x, y, z, al ? L : 0.06, 0.04, al ? 0.06 : L, {
          tint: col,
        });
      else
        b.box("glass", x, y, z, al ? L : 0.06, 0.04, al ? 0.06 : L, {
          tint: [0.4, 0.4, 0.4],
        });
      if (ceil > y + 0.1) {
        b.pipe(
          "black_iron",
          x - (al ? L / 3 : 0),
          y + 0.07,
          z - (al ? 0 : L / 3),
          x - (al ? L / 3 : 0),
          ceil,
          z - (al ? 0 : L / 3),
          0.006,
          3,
        );
        b.pipe(
          "black_iron",
          x + (al ? L / 3 : 0),
          y + 0.07,
          z + (al ? 0 : L / 3),
          x + (al ? L / 3 : 0),
          ceil,
          z + (al ? 0 : L / 3),
          0.006,
          3,
        );
      }
    } else if (kind === "lantern") {
      // Chinese paper lantern
      b.pipe("black_iron", x, y + 0.3, z, x, ceil, z, 0.008, 3);
      const g = K.lanternGeo();
      b.geo("lamp", g, {
        x,
        y,
        z,
        s: o.size || 0.35,
        tint: [col[0] * 0.9, col[1] * 0.35, col[2] * 0.25],
      });
      b.cyl("gold", x, y + (o.size || 0.35) * 0.72, z, 0.08, 0.08, 0.05, 8);
      b.cyl("gold", x, y - (o.size || 0.35) * 0.78, z, 0.08, 0.08, 0.05, 8);
      b.pipe(
        "cloth_red",
        x,
        y - (o.size || 0.35) * 0.8,
        z,
        x,
        y - (o.size || 0.35) * 1.4,
        z,
        0.02,
        4,
      );
    } else if (kind === "globe") {
      b.pipe("brass", x, y + 0.15, z, x, ceil, z, 0.012, 4);
      b.geo("lamp", K.sphereGeo(), { x, y, z, s: o.size || 0.18, tint: col });
    } else if (kind === "cage") {
      b.cyl("black_iron", x, y - 0.1, z, 0.1, 0.08, 0.22, 6, { top: false });
      b.geo("lamp", K.sphereGeo(), { x, y, z, s: 0.07, tint: col });
    } else if (kind === "pendant") {
      // green enamel shade
      b.pipe("black_iron", x, y + 0.18, z, x, ceil, z, 0.006, 3);
      b.cyl(o.shade || "paint_green", x, y, z, 0.28, 0.06, 0.18, 10, {
        top: true,
        grime: 0.2,
      });
      if (!o.dead)
        b.geo("lamp", K.sphereGeo(), { x, y: y - 0.02, z, s: 0.06, tint: col });
    } else {
      // bare bulb
      b.pipe("black_iron", x, y + 0.06, z, x, ceil, z, 0.005, 3);
      if (!o.dead)
        b.geo("lamp", K.sphereGeo(), { x, y, z, s: 0.05, tint: col });
    }
    if (!o.dead) {
      if (intensity > 0)
        b.light(x, y - 0.1, z, col, intensity, radius || 7, o.lightOpts);
      if (o.glow !== false)
        b.glow(
          x,
          y,
          z,
          [col[0] * 0.7, col[1] * 0.7, col[2] * 0.7],
          o.glowSize ||
            (kind === "tube" ? 1.4 : kind === "lantern" ? 1.6 : 0.9),
        );
    }
  };
  let _sph = null,
    _lant = null;
  K.sphereGeo = () => _sph || (_sph = new THREE.SphereGeometry(1, 10, 7));
  K.lanternGeo = function () {
    if (_lant) return _lant;
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10,
        a = (t - 0.5) * Math.PI;
      pts.push(
        new THREE.Vector2(
          Math.cos(a) * 1.0 * (0.7 + 0.3 * Math.cos(a)),
          Math.sin(a) * 0.8,
        ),
      );
    }
    return (_lant = new THREE.LatheGeometry(pts, 10));
  };

  // ------------------------------------------------------------------
  // Text painting helpers for the atlas
  // ------------------------------------------------------------------
  /** Painted sign cell. o: {bg, fg, font, border, size, sub, weather, align, vertical, italic} */
  K.signCell = function (key, text, w, h, o) {
    o = o || {};
    return K.paint("art", key, w, h, function (x, X, Y, W, H) {
      if (o.bg !== null) {
        x.fillStyle = o.bg || "#1e2a24";
        x.fillRect(X, Y, W, H);
      }
      if (o.border) {
        x.strokeStyle = o.border;
        x.lineWidth = Math.max(3, H * 0.05);
        x.strokeRect(X + H * 0.06, Y + H * 0.06, W - H * 0.12, H - H * 0.12);
      }
      x.fillStyle = o.fg || "#e8dcb8";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const lines = String(text).split("\n");
      const fs =
        o.size ||
        Math.min(
          (H * 0.62) / lines.length,
          (W * 0.9) / Math.max(1, lines[0].length * 0.55),
        );
      x.font =
        (o.italic ? "italic " : "") +
        (o.weight || "bold") +
        " " +
        Math.round(fs) +
        "px " +
        (o.font || "Georgia, serif");
      if (o.vertical) {
        const chars = String(text).replace(/\n/g, "").split("");
        const step = H / (chars.length + 0.6);
        x.font =
          (o.weight || "bold") +
          " " +
          Math.round(Math.min(step * 0.85, W * 0.8)) +
          "px " +
          (o.font || "Georgia, serif");
        chars.forEach((ch, i) =>
          x.fillText(ch, X + W / 2, Y + step * (i + 0.8)),
        );
      } else {
        lines.forEach((ln, i) =>
          x.fillText(
            ln,
            X + W / 2,
            Y + H / 2 + (i - (lines.length - 1) / 2) * fs * 1.1,
            W * 0.92,
          ),
        );
      }
      if (o.sub) {
        x.font = Math.round(H * 0.14) + "px " + (o.font || "Georgia, serif");
        x.fillText(o.sub, X + W / 2, Y + H * 0.86, W * 0.9);
      }
      if (o.weather !== false) {
        const r = K.rng(key);
        for (let k = 0; k < 40; k++) {
          x.fillStyle = rgba(25, 20, 15, (r() * 0.4).toFixed(2));
          x.fillRect(X + r() * W, Y + r() * H, 2 + r() * 14, 1 + r() * 5);
        }
        K.streaks(x, X, Y, W, H, 6, U.hashStr(key) % 97, 0.3);
      }
    });
  };
  /** Neon cell (additive; black background). o: {color, font, size, vertical, glow, tube} */
  K.neonCell = function (key, text, w, h, o) {
    o = o || {};
    return K.paint("neon", key, w, h, function (x, X, Y, W, H) {
      x.fillStyle = "#000";
      x.fillRect(X, Y, W, H);
      const col = o.color || "#ff3030";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const draw = (blur, lw, style) => {
        x.shadowColor = col;
        x.shadowBlur = blur;
        x.strokeStyle = style;
        x.fillStyle = style;
        x.lineWidth = lw;
        if (o.vertical) {
          const chars = String(text).split("");
          const step = H / (chars.length + 0.4);
          x.font =
            (o.weight || "bold") +
            " " +
            Math.round(Math.min(step * 0.82, W * 0.78)) +
            "px " +
            (o.font || "Arial, sans-serif");
          chars.forEach((ch, i) => {
            if (o.outline) x.strokeText(ch, X + W / 2, Y + step * (i + 0.7));
            else x.fillText(ch, X + W / 2, Y + step * (i + 0.7));
          });
        } else {
          const lines = String(text).split("\n");
          const fs =
            o.size ||
            Math.min(
              (H * 0.66) / lines.length,
              (W * 1.3) / Math.max(1, lines[0].length * 0.62),
            );
          x.font =
            (o.italic ? "italic " : "") +
            (o.weight || "bold") +
            " " +
            Math.round(fs) +
            "px " +
            (o.font || "Arial, sans-serif");
          lines.forEach((ln, i) => {
            const yy = Y + H / 2 + (i - (lines.length - 1) / 2) * fs * 1.08;
            if (o.outline) x.strokeText(ln, X + W / 2, yy, W * 0.94);
            else x.fillText(ln, X + W / 2, yy, W * 0.94);
          });
        }
      };
      draw(Math.max(6, H * 0.12), Math.max(3, H * 0.05), col);
      draw(Math.max(2, H * 0.03), Math.max(1.5, H * 0.02), o.core || "#fff4f0");
      x.shadowBlur = 0;
      if (o.border) {
        x.shadowColor = col;
        x.shadowBlur = 10;
        x.strokeStyle = col;
        x.lineWidth = 4;
        x.strokeRect(X + 8, Y + 8, W - 16, H - 16);
        x.shadowBlur = 0;
      }
      if (o.broken) {
        // dead letters: dark blotches
        const r = K.rng(key + "b");
        for (let k = 0; k < o.broken; k++) {
          x.fillStyle = "rgba(0,0,0,0.85)";
          x.fillRect(X + r() * W, Y, W * 0.08, H);
        }
      }
    });
  };

  // ------------------------------------------------------------------
  // Exterior helpers
  // ------------------------------------------------------------------
  /**
   * Window on a façade plane facing (nx,nz): centre (x,y,z) on the wall surface, w×h.
   * o: {state:'glass'|'broken'|'boarded'|'dark'|'lit', frame, sill, lintel, arch}
   */
