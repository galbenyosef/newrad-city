// play-inline-119 04 — math
// Lines 680-753 of readable/play-inline-119.pretty.js (statement-aligned).
  K.dclGround = function (b, key, x, z, w, d, yaw, o) {
    o = o || {};
    const at = K.dclInit(),
      s = at.slots[key];
    if (!s || s.full) return;
    const c = Math.cos(yaw || 0),
      sn = Math.sin(yaw || 0),
      y = (o.y || 0.13) + (o.lift || 0);
    const P2 = (lx, lz) => [x + lx * c + lz * sn, y, z - lx * sn + lz * c];
    b.quad(
      o.soft === false
        ? "dcl"
        : o.soft || /stain|crack|streak/.test(key)
          ? "dcl_soft"
          : "dcl",
      P2(-w / 2, d / 2),
      P2(w / 2, d / 2),
      P2(w / 2, -d / 2),
      P2(-w / 2, -d / 2),
      { rect: s.rect, grime: 0, tint: o.tint },
    );
  };
  /** Decay state of a façade billboard (stable per position): 'bare' (stripped), 'torn1..3' (overlay) or null. */
  K.tsBoardDecay = function (x, y, z) {
    const h = U.hash2(
      Math.round(x * 3.1 + y * 0.7),
      Math.round(z * 2.9 - y * 1.3),
    );
    if (h < 0.11) return "bare";
    if (h < 0.4) return ["torn1", "torn2", "torn3"][Math.floor(h * 100) % 3];
    return null;
  };
  /** Dress a billboard (centre cx/cz on the board face, facing `face`, width w, height h, bottom y): decay overlay + streaks. */
  K.tsBoardDress = function (d, cx, y, cz, w, h, face, state, o) {
    o = o || {};
    const at = K.dclInit();
    const nx = Math.sin(face),
      nz = Math.cos(face);
    if (state && at.slots[state])
      d.panel(
        "dcl_board",
        cx + nx * 0.02,
        y + h / 2,
        cz + nz * 0.02,
        w,
        h,
        face,
        { rect: at.slots[state].rect },
      );
    // rust / water runs from the frame down the façade
    const hv = U.hash2(Math.round(cx * 1.7), Math.round(cz * 1.3 + y));
    if (o.streaks !== false && hv > 0.3) {
      const sl = at.slots.streaks,
        n = 1 + Math.floor(hv * 3),
        wall = o.wallOff !== undefined ? o.wallOff : 0.5;
      for (let k = 0; k < n; k++) {
        // (runs stop above the storefront cornice at 5.9 m: never over the shopfront panels)
        const t = (k + 0.5) / n - 0.5 + (hv - 0.5) * 0.2,
          lx = t * w * 0.8,
          sw = 1.2 + hv * 1.4,
          sh = Math.min(
            y - 0.3 - (o.floor !== undefined ? o.floor : 5.9),
            3 + hv * 5,
          );
        if (sh < 1.2) continue;
        const px = cx + Math.cos(face) * lx - nx * wall + nx * 0.06,
          pz = cz - Math.sin(face) * lx - nz * wall + nz * 0.06;
        d.panel("dcl_soft", px, y - 0.3 - sh / 2, pz, sw, sh, face, {
          rect: sl.rect,
        });
      }
    }
  };

