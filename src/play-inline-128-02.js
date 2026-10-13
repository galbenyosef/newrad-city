// play-inline-128 02 — lineto
// Lines 26-105 of readable/play-inline-128.pretty.js (statement-aligned).
  const K = G.LMA.kit;
  const PI = Math.PI;

  // Block between the corridor edges (7th Ave x -30, 6th Ave/Broadway x 30, 34th St z -88, 32nd St z -57).
  const BLD = { x0: -29.6, x1: 29.6, z0: -87.6, z1: -57.4, h: 40 };
  const HOLD = { x0: 20.4, x1: BLD.x1, z0: BLD.z0, z1: -78.2, h: 15 }; // the 34th St / Broadway holdout
  const FL = { x0: -27.4, x1: 18.2, z0: -85.4, z1: -59.6, h: 6 }; // sales floor (walk-in)
  const FZ = BLD.z0; // main (north) front
  const DOORS = [-17, -3, 11];
  // The interior was laid out facing south; the front is now on 34th St (north): mirror interior z about the block centre.
  const ZC = BLD.z0 + BLD.z1; // z' = ZC - z
  const Z = (z) => ZC - z;
  const R = (yaw) => PI - yaw;

  /**
   * The Sterling's crown (the store's mark): a five-point royal crown — jewelled
   * band, pearl-tipped points, an orb-and-cross on the centre point. cx/cy = centre
   * of the crown, s = half its width. Solid in `col`, the jewels cut out in `gem`.
   */
  function crown(x, cx, cy, s, col, gem) {
    const top = cy - s * 0.62,
      base = cy + s * 0.42,
      band = s * 0.26;
    x.save();
    x.fillStyle = col;
    // the body: band + five points (outer, inner, centre)
    x.beginPath();
    x.moveTo(cx - s, base);
    x.lineTo(cx - s * 0.98, cy - s * 0.08);
    x.lineTo(cx - s * 0.92, top + s * 0.22);
    x.lineTo(cx - s * 0.62, cy - s * 0.02);
    x.lineTo(cx - s * 0.46, top + s * 0.04);
    x.lineTo(cx - s * 0.24, cy - s * 0.06);
    x.lineTo(cx, top - s * 0.06);
    x.lineTo(cx + s * 0.24, cy - s * 0.06);
    x.lineTo(cx + s * 0.46, top + s * 0.04);
    x.lineTo(cx + s * 0.62, cy - s * 0.02);
    x.lineTo(cx + s * 0.92, top + s * 0.22);
    x.lineTo(cx + s * 0.98, cy - s * 0.08);
    x.lineTo(cx + s, base);
    x.closePath();
    x.fill();
    // pearls on the points, orb + cross over the centre point
    for (const [px, py, pr] of [
      [-0.92, top / s - cy / s + 0.22, 0.1],
      [-0.46, top / s - cy / s + 0.04, 0.1],
      [0.46, top / s - cy / s + 0.04, 0.1],
      [0.92, top / s - cy / s + 0.22, 0.1],
    ]) {
      x.beginPath();
      x.arc(cx + px * s, cy + py * s - s * 0.06, pr * s, 0, Math.PI * 2);
      x.fill();
    }
    x.beginPath();
    x.arc(cx, top - s * 0.2, s * 0.13, 0, Math.PI * 2);
    x.fill();
    x.fillRect(cx - s * 0.035, top - s * 0.52, s * 0.07, s * 0.24);
    x.fillRect(cx - s * 0.12, top - s * 0.45, s * 0.24, s * 0.07);
    // the band under the points (a step lower and wider), jewels cut out of it
    x.fillRect(cx - s * 1.06, base - band, s * 2.12, band + s * 0.06);
    if (gem) {
      x.fillStyle = gem;
      for (let i = -2; i <= 2; i++) {
        const gx = cx + i * s * 0.42,
          gy = base - band / 2 + s * 0.03;
        x.beginPath();
        if (i % 2) x.ellipse(gx, gy, s * 0.07, s * 0.05, 0, 0, Math.PI * 2);
        else {
          x.moveTo(gx, gy - s * 0.08);
          x.lineTo(gx + s * 0.08, gy);
          x.lineTo(gx, gy + s * 0.08);
          x.lineTo(gx - s * 0.08, gy);
          x.closePath();
        }
        x.fill();
      }
    }
    x.restore();
  }

