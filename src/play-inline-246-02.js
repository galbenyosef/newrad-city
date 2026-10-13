// play-inline-246 02 — face
// Lines 26-122 of readable/play-inline-246.pretty.js (statement-aligned).
  const PR = G._pr;
  const K = PR.kit,
    D = PR.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;
  const BASE = 6; // interior lift (cellar floor at world y = 1.5)
  const CY = -4.5; // cellar level (local)

  // footprint (exterior)
  const MB = { x0: 399.5, x1: 412.5, z0: -395, z1: -371 }; // main range
  const PV = { x0: 395.5, x1: 399.5, z0: -387.5, z1: -378.5 }; // central pavilion (west)
  const WN = { x0: 397, x1: 413, z0: -399.8, z1: -395 }; // north wing
  const WS = { x0: 397, x1: 413, z0: -371, z1: -366.4 }; // south wing
  const DOOR = { x: PV.x0, z: (PV.z0 + PV.z1) / 2 };

  PR.flagDefaults.ren_hatch = false;
  PR.flagDefaults.ren_purged = false;
  PR.flagDefaults.ren_seal = false;

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function lancetRow(b, face, a0, a1, fixed, ys, spacing, opts) {
    // face: 'w'|'e'|'n'|'s' outward normal; windows along the run a0..a1 at the given ys
    const ry = { w: -HP, e: HP, n: PI, s: 0 }[face];
    const n = Math.max(1, Math.floor((a1 - a0) / spacing));
    const start = (a1 - a0 - (n - 1) * spacing) / 2 + a0;
    for (const y of ys)
      for (let i = 0; i < n; i++) {
        const t = start + i * spacing;
        const out = face === "w" || face === "n" ? -0.04 : 0.04;
        const x = face === "w" || face === "e" ? fixed + out : t,
          z = face === "w" || face === "e" ? t : fixed + out;
        PR.lancetWindow(b, x, y, z, ry, opts.w || 1.1, opts.h || 2.8, {
          glass: "glass_broken",
          frame: "limestone",
          frameW: 0.18,
          sill: true,
          mullion: opts.mullion,
        });
        // hood mould
        const c = Math.cos(ry),
          s = Math.sin(ry);
        b.box(
          "limestone",
          x + s * 0.12,
          y + (opts.h || 2.8) + 0.15,
          z + c * 0.12,
          (opts.w || 1.1) + 0.7,
          0.14,
          0.2,
          { ry, seg: false, grime: 0.4 },
        );
        if (opts.inner) {
          // same opening seen from inside the roofless shell
          const ix =
              face === "w" ? fixed + 0.78 : face === "e" ? fixed - 0.78 : x,
            iz = face === "n" ? fixed + 0.78 : face === "s" ? fixed - 0.78 : z;
          b.add(
            "glass_broken",
            PR.shapeGeo(PR.lancetShape(opts.w || 1.1, opts.h || 2.8), 6),
            { m: PR.m4(ix, y, iz, ry + PI), uv: "keep", noAO: true },
          );
        }
      }
  }
  function crenelRect(b, R, y, key, skip) {
    const i = 0.375,
      x0 = R.x0 + i,
      x1 = R.x1 - i,
      z0 = R.z0 + i,
      z1 = R.z1 - i;
    const e = [
      [x0, z0, x1, z0],
      [x1, z0, x1, z1],
      [x1, z1, x0, z1],
      [x0, z1, x0, z0],
    ];
    e.forEach((q, k) => {
      if (!skip || skip.indexOf(k) < 0)
        PR.crenels(
          b,
          key || "gneiss",
          q[0],
          q[1],
          q[2],
          q[3],
          y,
          0.75,
          1.4,
          0.8,
          0.6,
        );
    });
  }
