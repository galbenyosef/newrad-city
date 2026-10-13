// play-inline-389 02 — fillstyle
// Lines 26-177 of readable/play-inline-389.pretty.js (statement-aligned).
  const PV = G._ppn;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const rgba = K.rgba;

  const HO = (PV.ho = {
    X0: 51,
    X1: 81,
    Z0: -132,
    Z1: -106,
    BASE: 16,
    CORN: 64,
    TOP: 70,
    PX: 57.4, // portico back wall (doors) — 6.4 m deep recess: a clear walk between the columns and the revolving door
    PY: 0.9, // portico floor
    CZ0: -123,
    CZ1: -115,
    CX: 62, // light court (west side), recessed to x 62 above the base
  });
  // the street door's interact point stands just IN FRONT of the revolving drum (its collider starts at PX − 2.2), so the
  // focus ray is never occluded by the door's own collider
  HO.door = new THREE.Vector3(HO.PX - 2.3, HO.PY + 1.3, -119);

  // ------------------------------------------------------------------
  // Brick shaft façade texture: 4 bays × 4 storeys per repeat (12.8 m square),
  // paired sash windows with limestone sills/lintels; dark, broken, boarded,
  // curtains blowing out, soot above a few burnt rooms.
  // ------------------------------------------------------------------
  function paintBrick(x, S, r, dmg) {
    x.fillStyle = "#7a4634";
    x.fillRect(0, 0, S, S);
    // brick courses
    for (let j = 0; j < S; j += 5) {
      const off = (j / 5) % 2 ? 6 : 0;
      for (let i = -12; i < S; i += 12) {
        const v = 0.82 + r() * 0.3;
        x.fillStyle = rgba(122 * v, 68 * v, 50 * v, 1);
        x.fillRect(i + off + 1, j + 1, 10, 3.4);
      }
    }
    const n = 4,
      bw = S / n,
      sh = S / n;
    for (let j = 0; j < n; j++) {
      // limestone band at every floor line (thin)
      x.fillStyle = "rgba(190,180,160,0.25)";
      x.fillRect(0, j * sh + sh - 3, S, 2);
      for (let i = 0; i < n; i++) {
        for (const k of [0, 1]) {
          const W = bw * 0.26,
            H = sh * 0.58,
            X = i * bw + bw * 0.2 + k * bw * 0.34,
            Y = j * sh + sh * 0.18;
          const u = r();
          x.fillStyle = "#d0c6b0";
          x.fillRect(X - 4, Y - 7, W + 8, 6); // lintel
          x.fillStyle = "#d6ccb6";
          x.fillRect(X - 5, Y + H, W + 10, 5); // sill
          x.fillStyle = "#3a2a22";
          x.fillRect(X - 2, Y - 1, W + 4, H + 2); // reveal
          if (u < 0.12 + dmg * 0.1) {
            // broken: black void, shards, soot plume above
            x.fillStyle = "#0a0808";
            x.fillRect(X, Y, W, H);
            for (let q = 0; q < 3; q++) {
              x.fillStyle = "rgba(150,165,165,0.55)";
              x.beginPath();
              x.moveTo(X + r() * W, Y + H);
              x.lineTo(X + r() * W, Y + H - r() * H * 0.5);
              x.lineTo(X + r() * W, Y + H);
              x.fill();
            }
            if (r() < 0.5 + dmg) {
              const g = x.createLinearGradient(0, Y, 0, Y - sh * 0.8);
              g.addColorStop(0, "rgba(15,10,8,0.7)");
              g.addColorStop(1, "rgba(15,10,8,0)");
              x.fillStyle = g;
              x.beginPath();
              x.moveTo(X - 4, Y);
              x.lineTo(X + W + 4, Y);
              x.lineTo(X + W + 14, Y - sh * 0.8);
              x.lineTo(X - 14, Y - sh * 0.8);
              x.fill();
            }
          } else if (u < 0.2 + dmg * 0.1) {
            // boarded
            x.fillStyle = "#6a5642";
            x.fillRect(X, Y, W, H);
            x.fillStyle = "rgba(30,20,12,0.6)";
            for (let q = 0; q < 5; q++)
              x.fillRect(X, Y + (q * H) / 5 + 2, W, 2);
          } else {
            const g = x.createLinearGradient(X, Y, X + W, Y + H);
            g.addColorStop(0, "#263030");
            g.addColorStop(0.5, "#3c4846");
            g.addColorStop(1, "#1a1e1e");
            x.fillStyle = g;
            x.fillRect(X, Y, W, H);
            x.fillStyle = "rgba(200,215,210,0.10)";
            x.fillRect(X + W * 0.12, Y, W * 0.14, H);
            if (u > 0.8) {
              x.fillStyle =
                r() < 0.5 ? "rgba(200,190,160,0.75)" : "rgba(120,40,30,0.7)";
              x.fillRect(
                X + (r() < 0.5 ? 0 : W * 0.55),
                Y,
                W * 0.45,
                H * (0.6 + r() * 0.4),
              );
            } // drawn curtain
            if (u > 0.93) {
              x.fillStyle = "rgba(220,210,190,0.8)";
              x.beginPath();
              x.moveTo(X + W * 0.3, Y + H);
              x.quadraticCurveTo(
                X + W * 0.6,
                Y + H + sh * 0.3,
                X + W * 0.2,
                Y + H + sh * 0.45,
              );
              x.lineTo(X + W * 0.05, Y + H + sh * 0.3);
              x.fill();
            } // curtain blowing out
          }
          x.fillStyle = "#2a2420";
          x.fillRect(X, Y + H * 0.5, W, 3); // meeting rail
        }
      }
    }
    K.stains(x, 0, 0, S, S, 24, 991 + dmg * 10, 0.35, [30, 22, 16]);
    K.streaks(x, 0, 0, S, S, 70, 992, 0.3);
    K.grain(x, 0, 0, S, S, 22, 993);
  }
  K.customPaint.hotelbrick = (x, S, r) => paintBrick(x, S, r, 0);
  K.customPaint.hotelbrick2 = (x, S, r) => paintBrick(x, S, r, 0.35);
  K.MATDEF.hotelbrick = {
    custom: "hotelbrick",
    tile: [12.8, 12.8],
    rough: 0.92,
  };
  K.MATDEF.hotelbrick2 = {
    custom: "hotelbrick2",
    tile: [12.8, 12.8],
    rough: 0.92,
  };

  const LIME = [0.86, 0.83, 0.76];

  // ==================================================================
  // EXTERIOR
  // ==================================================================
