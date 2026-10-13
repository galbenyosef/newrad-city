// play-inline-241 03 — ctx
// Lines 352-650 of readable/play-inline-241.pretty.js (statement-aligned).
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
