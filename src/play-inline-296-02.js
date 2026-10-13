// play-inline-296 02 — opts
// Lines 24-71 of readable/play-inline-296.pretty.js (statement-aligned).
  const PM = G._pm2;
  const D = PM.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const FZ = -281.6; // front plane of the facades (53rd Street)
  const F2 = 5.2,
    F3 = 10.2,
    ROOF = 15;

  Object.assign(PM.flagDefaults, {
    moma_storage_code: false,
    moma_critic_dead: false,
    moma_review_read: false,
  });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function curtainWall(b, x0, x1, y0, y1, z, opts) {
    // glass curtain wall on a south-facing plane: panes + black mullion grid + spandrels
    opts = opts || {};
    b.boxMM(opts.glass || "pane", x0, y0, z - 0.25, x1, y1, z, {
      grime: 0.25,
      noAO: true,
      seg: false,
    });
    const bay = opts.bay || 1.6,
      fh = opts.floorH || 4;
    for (let x = x0; x <= x1 + 0.01; x += bay)
      b.box(opts.mull || "black_steel", x, y0, z + 0.06, 0.14, y1 - y0, 0.18, {
        seg: false,
        grime: 0.3,
      });
    for (let y = y0; y <= y1 + 0.01; y += fh)
      b.boxMM(
        opts.mull || "black_steel",
        x0 - 0.05,
        y - 0.35,
        z,
        x1 + 0.05,
        y + 0.35,
        z + 0.2,
        { seg: false, grime: 0.35 },
      );
  }
