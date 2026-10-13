// play-inline-258 02 — ctx
// Lines 25-136 of readable/play-inline-258.pretty.js (statement-aligned).
  const PF = G._pbr;
  const BK = PF.bk,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2;
  const KEY = "manhattan_bridge";
  const BASE = 10;
  const O = { x: 7400, y: BASE, z: 1200 };
  const W = (x, y, z) => V3(O.x + x, O.y + y, O.z + z);
  const A = (x, y, z, yaw) => PF.anchor(O.x + x, O.y + y, O.z + z, yaw || 0);
  const L = (x, y, z, color, r, i) => ({
    x: O.x + x,
    y: O.y + y,
    z: O.z + z,
    color,
    r,
    i,
  });

  Object.assign(PF.flagDefaults, {
    mb_freed: false,
    mb_found: false,
    mb_hoard: false,
  });

  /** Blood-splatter decal texture (transparent). */
  function bloodTex() {
    return PF.canvasTex(
      "pbr_blood",
      256,
      256,
      (ctx, w, h) => {
        const r = PF.rng(13);
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < 26; i++) {
          const x = w / 2 + (r() - 0.5) * w * 0.6,
            y = h / 2 + (r() - 0.5) * h * 0.6,
            rr = 6 + r() * 34;
          ctx.fillStyle =
            "rgba(" +
            ((70 + r() * 40) | 0) +
            ",8,6," +
            (0.55 + r() * 0.4) +
            ")";
          ctx.beginPath();
          ctx.ellipse(
            x,
            y,
            rr,
            rr * (0.5 + r() * 0.5),
            r() * 3,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = "rgba(80,10,8,0.8)";
          ctx.beginPath();
          ctx.arc(r() * w, r() * h, 1 + r() * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      { clamp: true },
    );
  }

  // ===================================================================
  // GEOMETRY
  // ===================================================================
  /** Eyebar chain from p0 (low end) along unit dir for n links of len; bars per link alternate 4/3. */
  function chain(b, p0, dir, n, len, width) {
    const side = V3(1, 0, 0);
    for (let i = 0; i < n; i++) {
      const a = p0.clone().addScaledVector(dir, i * len),
        c = p0.clone().addScaledVector(dir, (i + 1) * len);
      const bars = i % 2 ? 3 : 4;
      for (let k = 0; k < bars; k++) {
        const o = (k - (bars - 1) / 2) * (width / 3.2);
        const oa = a.clone().addScaledVector(side, o),
          oc = c.clone().addScaledVector(side, o);
        BK.beamOriented(
          b,
          "rust",
          oa,
          oc,
          0.62,
          0.12,
          BK.perpUp(oa, oc, side),
          0.6,
        );
        // eye bosses at both ends
        b.cyl("rust", oa.x, oa.y - 0.02, oa.z, 0.42, 0.42, 0.14, 10, {
          rz: HP,
          hSeg: 1,
        });
      }
      b.cyl(
        "iron",
        a.x - width / 2 - 0.25,
        a.y,
        a.z,
        0.26,
        0.26,
        width + 0.5,
        10,
        { rz: HP, hSeg: 1 },
      ); // pin
    }
  }

