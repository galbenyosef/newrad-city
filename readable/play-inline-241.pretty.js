/* src/poi_roosevelt/04_roos.js */
/* =====================================================================
 * NEW RAD CITY — POI ROOSEVELT — 04_roos.js
 * Module-specific materials, canvas textures and small helpers shared by
 * the island, the Octagon and the Renwick Smallpox Hospital:
 *   - gneiss (the island's own grey rubble stone), asylum tiles, checker
 *     linoleum, padded-cell quilting, vines (alpha), chain-link (alpha)
 *   - octagon polygon, gate objects (open/close with collider + flag),
 *     simple hull/skiff builder, light-shaft sprites, anchorOf.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pr) return;
  const PR = G._pr;
  const U = G.util;
  const TAU = Math.PI * 2;
  const HP = Math.PI / 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // -------------------------------------------------------------------
  // Custom canvas textures (world-projected materials)
  // -------------------------------------------------------------------
  function tileWall(ctx, w, h) {
    const r = U.rng(771);
    const n = 16,
      s = w / n;
    ctx.fillStyle = "#8a8676";
    ctx.fillRect(0, 0, w, h); // grout
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const miss = r() < 0.035;
        const base = miss ? 70 : 200 + (r() - 0.5) * 22;
        const g = miss ? 60 : base - 4,
          bl = miss ? 52 : base - 16;
        ctx.fillStyle =
          "rgb(" + (base | 0) + "," + (g | 0) + "," + (bl | 0) + ")";
        ctx.fillRect(i * s + 1.5, j * s + 1.5, s - 3, s - 3);
        if (!miss && r() < 0.12) {
          ctx.strokeStyle = "rgba(40,36,30,0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(i * s + r() * s, j * s);
          ctx.lineTo(i * s + r() * s, j * s + s);
          ctx.stroke();
        }
        // glaze highlight
        if (!miss) {
          ctx.fillStyle = "rgba(255,255,250,0.18)";
          ctx.fillRect(i * s + 3, j * s + 3, s * 0.4, 2);
        }
      }
    // rust tears & mildew
    for (let k = 0; k < 26; k++) {
      const x = r() * w,
        y = r() * h * 0.6,
        len = 40 + r() * 200;
      const gr = ctx.createLinearGradient(x, y, x, y + len);
      gr.addColorStop(0, "rgba(110,70,30,0.45)");
      gr.addColorStop(1, "rgba(110,70,30,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(x, y, 3 + r() * 6, len);
    }
    for (let k = 0; k < 40; k++) {
      ctx.fillStyle = "rgba(50,60,30," + (0.05 + r() * 0.15) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        h - r() * h * 0.5,
        10 + r() * 50,
        6 + r() * 30,
        0,
        0,
        TAU,
      );
      ctx.fill();
    }
  }
  function checker(ctx, w, h) {
    const r = U.rng(4411);
    const n = 8,
      s = w / n;
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const dark = (i + j) % 2 === 0;
        const v = dark ? 38 + r() * 14 : 176 + r() * 20;
        ctx.fillStyle = dark
          ? "rgb(" + (v | 0) + "," + ((v + 6) | 0) + "," + ((v + 2) | 0) + ")"
          : "rgb(" + (v | 0) + "," + ((v - 4) | 0) + "," + ((v - 20) | 0) + ")";
        ctx.fillRect(i * s, j * s, s, s);
        if (r() < 0.1) {
          ctx.fillStyle = "rgba(90,80,60,0.6)";
          ctx.fillRect(
            i * s + r() * s * 0.5,
            j * s + r() * s * 0.5,
            s * 0.5,
            s * 0.4,
          );
        } // lifted tile
      }
    for (let k = 0; k < 60; k++) {
      ctx.fillStyle = "rgba(30,24,16," + (0.05 + r() * 0.2) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        8 + r() * 60,
        6 + r() * 40,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
  }
  function padded(ctx, w, h) {
    const r = U.rng(1839);
    ctx.fillStyle = "#b8b09a";
    ctx.fillRect(0, 0, w, h);
    const s = 64;
    for (let y = 0; y < h; y += s)
      for (let x = 0; x < w; x += s) {
        const g = ctx.createRadialGradient(
          x + s / 2,
          y + s / 2,
          4,
          x + s / 2,
          y + s / 2,
          s * 0.72,
        );
        g.addColorStop(0, "rgba(235,228,205,0.9)");
        g.addColorStop(1, "rgba(110,100,80,0.9)");
        ctx.fillStyle = g;
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = "#4a4232";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, TAU);
        ctx.fill(); // button
      }
    for (let k = 0; k < 30; k++) {
      ctx.fillStyle = "rgba(70,40,20," + (0.08 + r() * 0.25) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        6 + r() * 40,
        4 + r() * 60,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
    // scratch marks
    ctx.strokeStyle = "rgba(60,30,20,0.55)";
    ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) {
      const x = r() * w,
        y = r() * h;
      for (let f = 0; f < 4; f++) {
        ctx.beginPath();
        ctx.moveTo(x + f * 7, y);
        ctx.lineTo(x + f * 7 + 10, y + 50 + r() * 30);
        ctx.stroke();
      }
    }
  }
  function gneissDraw(o) {
    // coursed rubble of the island's own grey gneiss, bigger & paler than schist
    return function (ctx, w, h) {
      const r = U.rng(o.seed || 7);
      ctx.fillStyle = o.mortar;
      ctx.fillRect(0, 0, w, h);
      const rows = o.rows;
      const rh = h / rows;
      for (let j = 0; j < rows; j++) {
        let x = -r() * 60;
        while (x < w) {
          const bw = 50 + r() * 90,
            bh = rh * (0.78 + r() * 0.18);
          const v = (r() - 0.5) * o.vary;
          const c = [
            o.base[0] * (1 + v),
            o.base[1] * (1 + v),
            o.base[2] * (1 + v * 1.1),
          ];
          ctx.fillStyle =
            "rgb(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + ")";
          const y = j * rh + (rh - bh) / 2 + (r() - 0.5) * 3;
          ctx.beginPath();
          ctx.moveTo(x + 3 + r() * 4, y + r() * 3);
          ctx.lineTo(x + bw - 3 - r() * 4, y + r() * 4);
          ctx.lineTo(x + bw - 1 - r() * 3, y + bh - r() * 4);
          ctx.lineTo(x + 2 + r() * 4, y + bh - r() * 3);
          ctx.closePath();
          ctx.fill();
          // mica banding
          ctx.strokeStyle = "rgba(30,30,32,0.18)";
          ctx.lineWidth = 1;
          for (let k = 0; k < 3; k++) {
            const yy = y + bh * (0.2 + r() * 0.6);
            ctx.beginPath();
            ctx.moveTo(x + 4, yy);
            ctx.lineTo(x + bw - 4, yy + (r() - 0.5) * 6);
            ctx.stroke();
          }
          x += bw + 3;
        }
      }
      // soot & rain streaks
      for (let k = 0; k < 60; k++) {
        ctx.fillStyle = "rgba(20,20,18," + (0.04 + r() * 0.12) + ")";
        ctx.beginPath();
        ctx.ellipse(r() * w, r() * h, 10 + r() * 50, 8 + r() * 40, 0, 0, TAU);
        ctx.fill();
      }
      for (let k = 0; k < 40; k++) {
        const x = r() * w;
        ctx.fillStyle = "rgba(20,20,18," + (0.06 + r() * 0.08) + ")";
        ctx.fillRect(x, r() * h * 0.5, 2 + r() * 4, 60 + r() * 200);
      }
    };
  }
  function brickInt(ctx, w, h) {
    const r = U.rng(99);
    ctx.fillStyle = "#5a4a3e";
    ctx.fillRect(0, 0, w, h);
    const rows = 16,
      rh = h / rows,
      bw = w / 4;
    for (let j = 0; j < rows; j++) {
      const off = ((j % 2) * bw) / 2;
      for (let i = -1; i < 5; i++) {
        const v = (r() - 0.5) * 0.3;
        ctx.fillStyle =
          "rgb(" +
          ((120 + v * 120) | 0) +
          "," +
          ((66 + v * 60) | 0) +
          "," +
          ((48 + v * 40) | 0) +
          ")";
        ctx.fillRect(i * bw + off + 2, j * rh + 2, bw - 4, rh - 4);
      }
    }
    for (let k = 0; k < 40; k++) {
      ctx.fillStyle = "rgba(210,206,190," + (0.03 + r() * 0.06) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        h * (0.6 + r() * 0.4),
        10 + r() * 30,
        4 + r() * 12,
        0,
        0,
        TAU,
      );
      ctx.fill();
    } // efflorescence (low on the wall)
    for (let k = 0; k < 40; k++) {
      ctx.fillStyle = "rgba(15,12,10," + (0.06 + r() * 0.2) + ")";
      ctx.beginPath();
      ctx.ellipse(r() * w, r() * h, 10 + r() * 50, 6 + r() * 30, 0, 0, TAU);
      ctx.fill();
    }
  }
  function plasterOld(ctx, w, h) {
    const r = U.rng(5150);
    ctx.fillStyle = "#c9c3b2";
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h),
      d = img.data;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const n = U.fbm2(x / 70, y / 70, 4),
          m = U.fbm2(x / 9 + 50, y / 9, 2);
        const k = (n - 0.5) * 40 + (m - 0.5) * 14,
          i = (y * w + x) * 4;
        d[i] += k;
        d[i + 1] += k;
        d[i + 2] += k * 0.9;
      }
    ctx.putImageData(img, 0, 0);
    // water stains: soft tide rings running down from the top
    for (let k = 0; k < 5; k++) {
      const x = r() * w,
        ww = 30 + r() * 90,
        hh = 80 + r() * 260;
      const g = ctx.createLinearGradient(0, 0, 0, hh);
      g.addColorStop(0, "rgba(120,96,60,0.22)");
      g.addColorStop(0.8, "rgba(120,96,60,0.07)");
      g.addColorStop(1, "rgba(120,96,60,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, 0, ww / 2, hh, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(90,70,40,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, 0, ww / 2, hh * 0.92, 0, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
    // hairline cracks
    ctx.strokeStyle = "rgba(60,54,44,0.55)";
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 10; k++) {
      let x = r() * w,
        y = r() * h,
        a = r() * TAU;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 12; j++) {
        a += (r() - 0.5) * 0.9;
        x += Math.cos(a) * 12;
        y += Math.sin(a) * 12;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // a few spalled patches showing the lath / brick behind
    for (let k = 0; k < 1; k++) {
      const x = r() * w,
        y = r() * h,
        rw = 14 + r() * 20,
        rh = 10 + r() * 14;
      ctx.fillStyle = "rgba(110,82,62,0.9)";
      ctx.beginPath();
      ctx.ellipse(x, y, rw, rh, r() * 3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(70,52,40,0.9)";
      ctx.lineWidth = 2;
      for (let j = -3; j <= 3; j++) {
        ctx.beginPath();
        ctx.moveTo(x - rw * 0.8, y + j * 6);
        ctx.lineTo(x + rw * 0.8, y + j * 6);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(230,224,208,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, rw + 2, rh + 2, 0, 0, TAU);
      ctx.stroke();
    }
    // dado grime at the bottom
    const g2 = ctx.createLinearGradient(0, h * 0.75, 0, h);
    g2.addColorStop(0, "rgba(40,34,26,0)");
    g2.addColorStop(1, "rgba(40,34,26,0.3)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
  }
  Object.assign(PR.CUSTOM_TEX, {
    plaster_old: [512, 512, plasterOld],
    tile_wall: [512, 512, tileWall],
    checker: [512, 512, checker],
    padded: [256, 256, padded],
    gneiss: [
      512,
      512,
      gneissDraw({
        base: [150, 148, 140],
        mortar: "#6c6a62",
        rows: 7,
        vary: 0.34,
        seed: 17,
      }),
    ],
    gneiss_dk: [
      512,
      512,
      gneissDraw({
        base: [104, 102, 96],
        mortar: "#4a4842",
        rows: 7,
        vary: 0.3,
        seed: 29,
      }),
    ],
    brick_int: [512, 512, brickInt],
  });
  Object.assign(PR.MAT_DEFS, {
    plaster_w: {
      custom: "plaster_old",
      prefer: "custom",
      color: 0xc8c2b0,
      rough: 0.95,
      uv: 3.2,
      bump: 0.25,
    },
    gneiss: {
      custom: "gneiss",
      prefer: "custom",
      color: 0x96948c,
      rough: 0.95,
      uv: 3.4,
      bump: 1.1,
    },
    gneiss_dk: {
      custom: "gneiss_dk",
      prefer: "custom",
      color: 0x686660,
      rough: 0.95,
      uv: 3.4,
      bump: 1.1,
    },
    tile_wall: {
      custom: "tile_wall",
      prefer: "custom",
      color: 0xc8c4b4,
      rough: 0.35,
      uv: 2.4,
      bump: 0.3,
    },
    checker: {
      custom: "checker",
      prefer: "custom",
      color: 0x807a70,
      rough: 0.6,
      uv: 2.6,
    },
    padded: {
      custom: "padded",
      prefer: "custom",
      color: 0xb8b09a,
      rough: 1,
      uv: 1.4,
      bump: 0.8,
    },
    brick_int: {
      custom: "brick_int",
      prefer: "custom",
      color: 0x7a4a38,
      rough: 0.95,
      uv: 2.2,
      bump: 0.8,
    },
    enamel_w: {
      src: "metal_painted",
      color: 0xc8c6bc,
      tint: 0xe8e6dc,
      rough: 0.45,
      metal: 0.15,
      uv: 2,
    },
    rad_water: {
      color: 0x3a6a18,
      emissive: 0x58ff20,
      emissiveIntensity: 0.55,
      rough: 0.1,
      metal: 0.2,
      uv: 4,
      plain: true,
      noShadow: true,
    },
    fev_goo: {
      color: 0x4a8a20,
      emissive: 0x7aff30,
      emissiveIntensity: 1.2,
      rough: 0.15,
      metal: 0.1,
      uv: 3,
      plain: true,
      noShadow: true,
    },
    sky_patch: {
      color: 0x90a080,
      emissive: 0xa8b890,
      emissiveIntensity: 0.9,
      rough: 1,
      uv: 10,
      plain: true,
      noShadow: true,
    },
    oculus: {
      color: 0xd0e0c0,
      emissive: 0xd8f0c8,
      emissiveIntensity: 1.6,
      rough: 1,
      uv: 4,
      plain: true,
      noShadow: true,
    },
    beacon: {
      color: 0xfff0b0,
      emissive: 0xffe890,
      emissiveIntensity: 2.6,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    char: {
      src: "wood_rotten",
      color: 0x1e1a16,
      tint: 0x3a322a,
      rough: 1,
      uv: 2,
    },
    straw: { src: "fabric", color: 0x9a8a5a, tint: 0xc8b478, rough: 1, uv: 1 },
    canvas_w: {
      src: "fabric",
      color: 0xb0a88e,
      tint: 0xd8d0b4,
      rough: 1,
      uv: 1.4,
    },
    leaf_dead: {
      src: "grass_dead",
      color: 0x6a5a34,
      tint: 0x8a7440,
      rough: 1,
      uv: 2,
    },
  });

  // -------------------------------------------------------------------
  // Alpha textures: vines, chain-link
  // -------------------------------------------------------------------
  PR.vineKey = function (variant) {
    variant = variant || 0;
    const tex = PR.canvasTex(
      "pr_vines_" + variant,
      256,
      512,
      (ctx, w, h) => {
        const r = U.rng(300 + variant * 17);
        ctx.clearRect(0, 0, w, h);
        // strands hang from the top edge and wander down, leaves clustered
        for (let s = 0; s < 14; s++) {
          let x = r() * w,
            y = 0;
          const len = h * (0.35 + r() * 0.65);
          ctx.strokeStyle = "rgba(58,44,30,0.95)";
          ctx.lineWidth = 2 + r() * 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          const pts = [];
          while (y < len) {
            x += (r() - 0.5) * 16;
            y += 8 + r() * 10;
            ctx.lineTo(x, y);
            pts.push([x, y]);
          }
          ctx.stroke();
          for (const p of pts) {
            if (r() < 0.25) continue;
            for (let k = 0; k < 3; k++) {
              const a = r() * TAU,
                d = 3 + r() * 9;
              const shade = r();
              ctx.fillStyle =
                shade < 0.5
                  ? "rgba(78,86,40,0.95)"
                  : shade < 0.8
                    ? "rgba(104,98,48,0.95)"
                    : "rgba(120,80,40,0.95)";
              ctx.beginPath();
              ctx.ellipse(
                p[0] + Math.cos(a) * d,
                p[1] + Math.sin(a) * d,
                4 + r() * 5,
                2.5 + r() * 3,
                a,
                0,
                TAU,
              );
              ctx.fill();
            }
          }
        }
      },
      { clamp: true },
    );
    return PR.texMat("vines_" + variant, tex, {
      transparent: true,
      side: THREE.DoubleSide,
      rough: 1,
      noShadow: true,
    });
  };
  PR.chainKey = function () {
    const tex = PR.canvasTex("pr_chainlink", 128, 128, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(120,118,110,1)";
      ctx.lineWidth = 3;
      const s = 32;
      for (let k = -4; k < 8; k++) {
        ctx.beginPath();
        ctx.moveTo(k * s, 0);
        ctx.lineTo(k * s + h, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(k * s + h, 0);
        ctx.lineTo(k * s, h);
        ctx.stroke();
      }
    });
    return PR.texMat("chainlink", tex, {
      transparent: true,
      side: THREE.DoubleSide,
      rough: 0.7,
      metal: 0.5,
      noShadow: true,
    });
  };

  // -------------------------------------------------------------------
  // Geometry helpers
  // -------------------------------------------------------------------
  /** Regular octagon (flat faces toward ±X/±Z) around (cx,cz), circumradius R. */
  PR.octPoly = function (cx, cz, R) {
    const out = [];
    for (let k = 0; k < 8; k++) {
      const a = Math.PI / 8 + (k * Math.PI) / 4;
      out.push([cx + Math.cos(a) * R, cz + Math.sin(a) * R]);
    }
    return out;
  };
  /** Rectangle polygon (clockwise in screen x/z). */
  PR.rectPoly = (x0, z0, x1, z1) => [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ];
  /** Anchor lookup through the shared POI registry. */
  PR.anchorOf = function (poi, name) {
    try {
      return G.pois.getAnchor(poi, name);
    } catch (e) {
      return null;
    }
  };
  /** Is it night now (atmosphere optional). */
  PR.isNight = function () {
    try {
      if (!G.isStub("atmos") && G.atmos.isNight) return !!G.atmos.isNight();
    } catch (e) {
      /* ignore */
    }
    const h = G.time ? G.time.hour : 12;
    return h < 6 || h > 19.5;
  };

  /**
   * Sliding/swinging gate: a mesh (group) + blocking collider + interactable. Opening hides the leaf,
   * removes the collider and sets PR flag. opts: {x,y,z (bottom centre), w, h, ry, flag, label,
   * lock ({id, key?|code?} — opened through G.locks), parent, key (material), bars:true,
   * canUse(p) → bool (e.g. a chain only reachable from one side), denyText}
   */
  PR.gate = function (opts) {
    const g = new THREE.Group();
    g.name = "pr_gate_" + opts.flag;
    const b = PR.batch("gate_" + opts.flag);
    const c = Math.cos(opts.ry || 0),
      s = Math.sin(opts.ry || 0);
    const key = opts.key || "iron";
    if (opts.bars !== false) {
      const n = Math.max(3, Math.round(opts.w / 0.14));
      for (let i = 0; i <= n; i++) {
        const lx = -opts.w / 2 + (i * opts.w) / n;
        b.box(
          key,
          opts.x + lx * c,
          opts.y,
          opts.z - lx * s,
          0.035,
          opts.h,
          0.035,
          { seg: false, grime: 0.3 },
        );
      }
      for (const yy of [0.12, opts.h * 0.5, opts.h - 0.1])
        b.box(key, opts.x, opts.y + yy, opts.z, opts.w, 0.06, 0.06, {
          ry: opts.ry,
          seg: false,
        });
      if (opts.chain) {
        for (let k = 0; k < 7; k++)
          b.add("chrome", new THREE.TorusGeometry(0.05, 0.012, 3, 8), {
            m: PR.m4(
              opts.x + (k - 3) * 0.08 * c,
              opts.y + opts.h * 0.5 + Math.sin(k) * 0.03,
              opts.z - (k - 3) * 0.08 * s + 0.04 * c,
              opts.ry + ((k % 2) * Math.PI) / 2,
            ),
            noAO: true,
          });
        b.box(
          "iron",
          opts.x + 0.04 * s,
          opts.y + opts.h * 0.5 - 0.22,
          opts.z + 0.06 * c,
          0.12,
          0.16,
          0.06,
          { ry: opts.ry, seg: false },
        );
      }
    } else {
      b.box(key, opts.x, opts.y, opts.z, opts.w, opts.h, 0.12, {
        ry: opts.ry,
        seg: false,
        grime: 0.6,
      });
    }
    b.build(g, { noLOD: true });
    (opts.parent || G.scene).add(g);
    const rec = { g, col: null, open: false, opts };
    const L =
      opts.lock && typeof opts.lock === "object"
        ? PR.lockReg(
            Object.assign({ kind: "door", label: opts.label }, opts.lock),
          )
        : null;
    const isLocked = () =>
      !!L &&
      !PR.flag(opts.flag + "_picked") &&
      !(PR.locksLive() && G.locks.isOpen && G.locks.isOpen(L.id));
    const close = () => {
      if (!rec.col)
        rec.col = PR.col(
          opts.x,
          opts.z,
          opts.w,
          0.3,
          opts.y,
          opts.y + opts.h,
          opts.ry || 0,
          { walkable: false, surface: "metal" },
        );
      g.visible = true;
      rec.open = false;
    };
    const open = () => {
      if (rec.col) {
        try {
          G.world.removeCollider(rec.col);
        } catch (e) {
          /* ignore */
        }
        rec.col = null;
      }
      g.visible = false;
      rec.open = true;
    };
    rec.setOpen = (v) => {
      if (v) open();
      else close();
    };
    close();
    PR.flagDefaults[opts.flag] = false;
    PR.flagWatch.push((k, v) => {
      if (k === "*" || k === opts.flag) rec.setOpen(!!PR.flag(opts.flag));
    });
    PR.onReset.push(() => rec.setOpen(false));
    PR.use({
      pos: V3(opts.x, opts.y + 1.2, opts.z),
      radius: Math.max(0.9, opts.w * 0.4),
      range: 2.8,
      label: opts.label || "Gate",
      verb: () => (rec.open ? "Close" : opts.verbOpen || "Open"),
      locked: () => (rec.open || !isLocked() ? null : "Locked"),
      onInteract() {
        if (rec.open) {
          PR.setFlag(opts.flag, false);
          PR.sfx("door_open", V3(opts.x, opts.y + 1, opts.z));
          return;
        }
        if (opts.canUse && !opts.canUse(G.player.pos)) {
          G.notify(opts.denyText || "It won't open from this side.");
          PR.sfx("door_locked");
          return;
        }
        const doOpen = () => {
          PR.setFlag(opts.flag + "_picked", true);
          PR.setFlag(opts.flag, true);
          PR.sfx("door_open", V3(opts.x, opts.y + 1, opts.z));
          if (opts.onOpen) PR.safe("gate", opts.onOpen);
        };
        if (isLocked()) {
          if (!PR.locksLive() && !(L.key && PR.inv.count(L.key) > 0)) {
            G.notify(opts.lockedText || "Locked.");
            PR.sfx("door_locked");
            return;
          }
          PR.lockOpen(L, doOpen);
          return;
        }
        doOpen();
      },
    });
    return rec;
  };

  /**
   * Small wooden rowing skiff (bow toward local -Z). (x,y,z) = waterline centre.
   */
  PR.skiff = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PR.m4(x, y, z, ry);
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.6 },
          o || {},
        ),
      );
    const hull = new THREE.SphereGeometry(
      1,
      14,
      7,
      0,
      TAU,
      Math.PI / 2,
      Math.PI / 2,
    );
    // pointed bow: pinch the front half
    const p = hull.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const zz = p.getZ(i);
      if (zz < 0) p.setX(i, p.getX(i) * (1 + zz * 0.55));
    }
    hull.computeVertexNormals();
    add(
      opts.paint || "paint_teal",
      hull,
      PR.m4(0, 0.25, 0, 0, 0, 0, 0.75, 0.55, 2.1),
    );
    const rim = new THREE.TorusGeometry(1, 0.05, 4, 20);
    rim.rotateX(Math.PI / 2);
    add("rotten", rim, PR.m4(0, 0.25, 0, 0, 0, 0, 0.72, 1, 2.05));
    for (const zz of [-0.8, 0.1, 0.9])
      add(
        "rotten",
        new THREE.BoxGeometry(1.2 - Math.abs(zz) * 0.35, 0.05, 0.28),
        PR.m4(0, 0.12, zz),
      );
    add(
      "rotten",
      new THREE.BoxGeometry(0.06, 0.06, 2.6),
      PR.m4(0.35, 0.3, 0.2, 0.2, 0, 0.3),
    ); // oar
    add(
      "rotten",
      new THREE.BoxGeometry(0.2, 0.02, 0.5),
      PR.m4(0.62, 0.34, 1.35, 0.2, 0, 0.3),
    );
    if (opts.water)
      add(
        "dirty_water_k",
        new THREE.BoxGeometry(1.0, 0.02, 2.6),
        PR.m4(0, -0.05, 0),
      );
  };
  PR.MAT_DEFS.dirty_water_k = {
    color: 0x3a3a24,
    rough: 0.2,
    metal: 0.2,
    uv: 2,
    plain: true,
  };

  /**
   * Straight flight of thin treads (open riser stair) with matching thin colliders.
   * Starts at (x,z) at y0 and climbs toward local +Z (rotated by ry) to y1 over `run` metres.
   * opts: {maxRise (0.25), thick (0.12), surface, noCollide, c}
   */
  PR.treads = function (b, key, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const n = Math.max(
      1,
      Math.ceil(Math.abs(y1 - y0) / (opts.maxRise || 0.25)),
    );
    const sr = run / n,
      sh = (y1 - y0) / n,
      th = opts.thick || 0.12;
    for (let i = 0; i < n; i++) {
      const top = y0 + sh * (i + 1);
      const [wx, wz] = PR.rot(x, z, ry, 0, sr * (i + 0.5));
      b.box(key, wx, top - th, wz, width, th, sr + 0.04, {
        ry,
        seg: false,
        grime: opts.grime === undefined ? 0.4 : opts.grime,
        c: opts.c,
      });
      if (!opts.noCollide)
        PR.col(wx, wz, width, sr + 0.06, top - Math.max(th, 0.3), top, ry, {
          surface: opts.surface || "concrete",
        });
    }
    return n;
  };
  /**
   * Helical (spiral) stair: wedge treads between radius rIn..rOut around (cx,cz), starting at angle a0
   * (radians, measured like atan2(dz, dx)) and y0, climbing `rise` per full turn for `turns` turns, `perTurn`
   * treads per turn. dir +1 = counter-clockwise seen from above (increasing angle). Returns {n, endAngle, endY}.
   * opts: {thick, surface, underside key, noCollide, rail: key (inner rail), railH}
   */
  PR.spiral = function (
    b,
    key,
    cx,
    cz,
    y0,
    rIn,
    rOut,
    a0,
    turns,
    rise,
    perTurn,
    opts,
  ) {
    opts = opts || {};
    const dir = opts.dir || 1;
    const n = Math.round(turns * perTurn),
      da = (TAU / perTurn) * dir,
      dy = rise / perTurn,
      th = opts.thick || 0.16;
    const rm = (rIn + rOut) / 2;
    for (let i = 0; i < n; i++) {
      const a = a0 + da * (i + 0.5),
        top = y0 + dy * (i + 1);
      if (opts.noVisual) {
        // colliders only (the caller builds its own treads)
        const arc = Math.abs(da) * rOut + 0.1;
        PR.col(
          cx + Math.cos(a) * rm,
          cz + Math.sin(a) * rm,
          rOut - rIn,
          arc,
          top - 0.35,
          top,
          -a,
          { surface: opts.surface || "concrete" },
        );
        if (opts.rail && !opts.noRailCol) {
          const rx = cx + Math.cos(a) * (rIn + 0.08),
            rz = cz + Math.sin(a) * (rIn + 0.08);
          PR.col(
            rx,
            rz,
            0.1,
            Math.abs(da) * rIn + 0.1,
            top - 0.2,
            top + (opts.railH || 1.0),
            -a,
            { walkable: false, surface: "metal" },
          );
        }
        continue;
      }
      const sh = new THREE.Shape();
      const aA = -Math.abs(da) / 2 - 0.02,
        aB = Math.abs(da) / 2 + 0.02;
      sh.moveTo(Math.cos(aA) * rIn, Math.sin(aA) * rIn);
      sh.lineTo(Math.cos(aA) * rOut, Math.sin(aA) * rOut);
      sh.absarc(0, 0, rOut, aA, aB, false);
      sh.lineTo(Math.cos(aB) * rIn, Math.sin(aB) * rIn);
      sh.absarc(0, 0, rIn, aB, aA, true);
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: th,
        bevelEnabled: false,
        curveSegments: 3,
      });
      // shape XY → world XZ: rotate so shape +Y maps to world +Z, extrusion to +Y
      g.rotateX(HP);
      g.translate(0, th, 0);
      // rotateX(+90°) maps shape y → z; extrusion (z) → -y, translated up by th
      b.add(key, g, {
        m: PR.m4(cx, top - th, cz, -a),
        grime: opts.grime === undefined ? 0.35 : opts.grime,
      });
      if (opts.under)
        b.box(
          opts.under,
          cx + Math.cos(a) * rm,
          top - th - 0.22,
          cz + Math.sin(a) * rm,
          rOut - rIn - 0.1,
          0.22,
          0.25,
          { ry: -a, seg: false },
        );
      if (!opts.noCollide) {
        const arc = Math.abs(da) * rOut + 0.1;
        PR.col(
          cx + Math.cos(a) * rm,
          cz + Math.sin(a) * rm,
          rOut - rIn,
          arc,
          top - 0.35,
          top,
          -a,
          { surface: opts.surface || "concrete" },
        );
      }
      if (opts.rail) {
        const rx = cx + Math.cos(a) * (rIn + 0.08),
          rz = cz + Math.sin(a) * (rIn + 0.08);
        b.box(opts.rail, rx, top, rz, 0.035, opts.railH || 1.0, 0.035, {
          seg: false,
          grime: 0.2,
        });
        const a2 = a + da,
          rx2 = cx + Math.cos(a2) * (rIn + 0.08),
          rz2 = cz + Math.sin(a2) * (rIn + 0.08);
        b.beam(
          opts.rail,
          V3(rx, top + (opts.railH || 1.0), rz),
          V3(rx2, top + dy + (opts.railH || 1.0), rz2),
          0.05,
          0.05,
        );
        if (!opts.noCollide && !opts.noRailCol)
          PR.col(
            rx,
            rz,
            0.1,
            Math.abs(da) * rIn + 0.1,
            top - 0.2,
            top + (opts.railH || 1.0),
            -a,
            { walkable: false, surface: "metal" },
          );
      }
    }
    return { n, endAngle: a0 + da * n, endY: y0 + dy * n };
  };

  /** Soft vertical light shaft (additive cone), parented; returns mesh. */
  PR.shaftMat = null;
  PR.lightShaft = function (parent, x, y, z, rTop, rBot, h, color, opacity) {
    const mat = new THREE.MeshBasicMaterial({
      color: color || 0xd8f0c0,
      transparent: true,
      opacity: opacity || 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
    const geo = new THREE.CylinderGeometry(rTop, rBot, h, 16, 1, true);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y - h / 2, z);
    m.renderOrder = 5;
    m.castShadow = false;
    m.receiveShadow = false;
    parent.add(m);
    return m;
  };

  /** Iron hospital bed (frame, mattress, optional skeleton), local facing ry (head toward -Z local). */
  PR.bed = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PR.m4(x, y, z, ry);
    const add = (key, geo, m) =>
      b.add(key, geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    const L2 = 1.0,
      W2 = 0.46;
    for (const sx of [-W2, W2])
      for (const sz of [-L2, L2])
        add(
          "iron",
          new THREE.BoxGeometry(0.04, sz < 0 ? 1.05 : 0.8, 0.04),
          PR.m4(sx, sz < 0 ? 0.525 : 0.4, sz),
        );
    add("iron", new THREE.BoxGeometry(0.96, 0.04, 0.04), PR.m4(0, 1.0, -L2));
    add("iron", new THREE.BoxGeometry(0.96, 0.04, 0.04), PR.m4(0, 0.75, L2));
    for (let i = 1; i < 5; i++)
      add(
        "iron",
        new THREE.BoxGeometry(0.02, 0.45, 0.02),
        PR.m4(-W2 + i * 0.184, 0.78, -L2),
      );
    for (const sx of [-W2, W2])
      add("iron", new THREE.BoxGeometry(0.04, 0.04, 2.0), PR.m4(sx, 0.4, 0));
    if (opts.mattress !== false)
      add(
        opts.sheet || "canvas_w",
        new THREE.BoxGeometry(0.88, 0.14, 1.9),
        PR.m4(0, 0.49, 0, 0, (opts.tilt || 0) * 0.1, 0),
      );
    if (opts.straps)
      for (const sz of [-0.5, 0.3])
        add(
          "fabric",
          new THREE.BoxGeometry(0.98, 0.03, 0.08),
          PR.m4(0, 0.58, sz),
        );
    if (opts.skeleton) {
      add("bone", new THREE.SphereGeometry(0.1, 7, 5), PR.m4(0, 0.66, -0.75));
      for (let i = 0; i < 5; i++)
        add(
          "bone",
          new THREE.TorusGeometry(0.12 - i * 0.008, 0.012, 3, 8, Math.PI),
          PR.m4(0, 0.6, -0.5 + i * 0.07, 0, Math.PI / 2),
        );
      for (const sx of [-0.1, 0.1])
        add(
          "bone",
          new THREE.CylinderGeometry(0.02, 0.016, 0.85, 4),
          PR.m4(sx, 0.6, 0.45, 0, Math.PI / 2),
        );
    }
    if (opts.collide !== false)
      PR.col(x, z, 1.0, 2.1, y, y + 0.62, ry, { surface: "metal" });
  };
  /** Wheelchair (optionally tipped). */
  PR.wheelchair = function (b, x, y, z, ry, tipped) {
    const M = PR.m4(x, y + (tipped ? 0.32 : 0), z, ry, 0, tipped ? 1.45 : 0);
    const add = (key, geo, m) =>
      b.add(key, geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.4,
      });
    for (const sx of [-0.32, 0.32]) {
      const w = new THREE.TorusGeometry(0.3, 0.02, 4, 14);
      w.rotateY(Math.PI / 2);
      add("chrome", w, PR.m4(sx, 0.32, 0.05));
    }
    add("fabric", new THREE.BoxGeometry(0.5, 0.05, 0.45), PR.m4(0, 0.5, 0));
    add("fabric", new THREE.BoxGeometry(0.5, 0.5, 0.05), PR.m4(0, 0.78, 0.24));
    add(
      "chrome",
      new THREE.BoxGeometry(0.55, 0.03, 0.03),
      PR.m4(0, 1.02, 0.28),
    );
  };
})();
