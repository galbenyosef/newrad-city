// play-inline-225 11 — three
// Lines 2823-3154 of readable/play-inline-225.pretty.js (statement-aligned).
  F.clutter = function (C, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = o.batch || C.b,
      r = LI.rng(o.seed || (x0 * 13 + z1 * 7 + y * 3) | 0 || 17),
      W = G.world;
    const mix = Object.assign(
      {
        paper: 5,
        crumple: 2,
        can: 2,
        bottle: 1.2,
        chunk: 2.5,
        plank: 0.8,
        box: 0.6,
      },
      o.mix || {},
    );
    const kinds = Object.keys(mix),
      tot = kinds.reduce((a, k) => a + mix[k], 0);
    const n = o.n || 60,
      edge = o.edge === undefined ? 0.8 : o.edge;
    const wx = (lx) => C.O.x + lx,
      wz = (lz) => C.O.z + lz,
      wy = (ly) => (C.O.y || 0) + ly;
    const yLo = y,
      yTop = o.yMax === undefined ? y : o.yMax;
    const blocked = (X, Z, pad, ly) => {
      const cs = W.query(X - pad, Z - pad, X + pad, Z + pad);
      for (const c of cs)
        if (
          !c.walkable &&
          c.minY < wy(ly) + 0.35 &&
          c.maxY > wy(ly) + 0.03 &&
          W.pointInCollider(c, X, Z, pad)
        )
          return true;
      return false;
    };
    let placed = 0;
    for (let tries = 0; tries < n * 6 && placed < n; tries++) {
      const lx = x0 + r() * (x1 - x0),
        lz = z0 + r() * (z1 - z0),
        X = wx(lx),
        Z = wz(lz);
      if (!W.query || !W.groundHeight) break;
      if (o.poly && !inPoly(o.poly, lx, lz)) continue;
      if (o.test && !o.test(lx, lz)) continue;
      const gh = W.groundHeight(X, Z, wy(yTop) + 0.25, 0.05);
      if (gh < wy(yLo) - 0.06 || gh > wy(yTop) + 0.06) continue;
      const y = gh - (C.O.y || 0);
      if (blocked(X, Z, 0.18, y)) continue;
      if (edge > 0 && !blocked(X, Z, 1.3, y) && r() < edge) continue; // prefer the foot of walls & furniture
      placed++;
      let pick = r() * tot,
        kind = kinds[0];
      for (const k of kinds) {
        pick -= mix[k];
        if (pick <= 0) {
          kind = k;
          break;
        }
      }
      const a = r() * TAU;
      switch (kind) {
        case "paper":
          b.flat(
            "paper",
            lx,
            y + 0.006 + r() * 0.01,
            lz,
            0.21 + r() * 0.08,
            0.28 + r() * 0.06,
            a,
            { c: r() < 0.5 ? 0xe0d8c0 : 0xb8ac90 },
          );
          break;
        case "crumple":
          b.sphere("paper", lx, y + 0.04, lz, 0.05 + r() * 0.03, {
            ws: 5,
            hs: 4,
            sy: 0.8,
            rx: r(),
            rz: r(),
            c: 0xd8d0b8,
          });
          break;
        case "can":
          if (r() < 0.7)
            b.cyl("steel", lx, y + 0.033, lz, 0.033, 0.033, 0.12, 8, {
              rz: Math.PI / 2,
              ry: a,
              c: r() < 0.5 ? 0xb0a080 : 0x9a6a4a,
            });
          else
            b.cyl("steel", lx, y, lz, 0.033, 0.033, 0.12, 8, { c: 0xa89070 });
          break;
        case "bottle": {
          const lying = r() < 0.75,
            key = r() < 0.6 ? "glass_dark" : "chrome";
          if (lying) {
            b.cyl(key, lx, y + 0.035, lz, 0.035, 0.035, 0.2, 8, {
              rz: Math.PI / 2,
              ry: a,
            });
          } else {
            b.cyl(key, lx, y, lz, 0.035, 0.035, 0.16, 8);
            b.cyl(key, lx, y + 0.16, lz, 0.012, 0.03, 0.08, 6);
          }
          break;
        }
        case "chunk": {
          const sz = 0.08 + r() * r() * 0.3;
          b.obox(
            o.chunkKey || (r() < 0.6 ? "plaster" : "concrete"),
            lx,
            y + sz * 0.3,
            lz,
            sz * (1 + r()),
            sz * 0.6,
            sz * (0.8 + r() * 0.6),
            a,
            { rx: (r() - 0.5) * 0.5, rz: (r() - 0.5) * 0.5 },
          );
          if (r() < 0.5)
            for (let k = 0; k < 3; k++)
              b.obox(
                "plaster",
                lx + (r() - 0.5) * 0.5,
                y + 0.015,
                lz + (r() - 0.5) * 0.5,
                0.04 + r() * 0.05,
                0.03,
                0.04 + r() * 0.05,
                r() * TAU,
              );
          break;
        }
        case "plank":
          b.obox(
            "wood_rotten",
            lx,
            y + 0.03,
            lz,
            0.9 + r() * 0.8,
            0.03,
            0.09 + r() * 0.06,
            a,
            { rz: (r() - 0.5) * 0.12 },
          );
          break;
        case "box": {
          const w = 0.25 + r() * 0.2;
          b.obox("cardboard", lx, y + w * 0.35, lz, w, w * 0.7, w * 0.8, a, {
            rz: (r() - 0.5) * 0.3,
            c: 0xa89070,
          });
          break;
        }
      }
    }
    return placed;
  };

  // =====================================================================
  // Atmosphere: god-ray light shafts + floating dust (one mesh each per cell)
  // =====================================================================
  let shaftMat = null,
    dustMat = null;
  const dustUniform = { value: 0 };
  function getShaftMat() {
    if (shaftMat) return shaftMat;
    const tex = LI.canvasTex(
      "li_shaft",
      64,
      128,
      (x, W, H) => {
        const g = x.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.3, "rgba(255,255,255,0.8)");
        g.addColorStop(0.5, "rgba(255,255,255,1)");
        g.addColorStop(0.7, "rgba(255,255,255,0.8)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        x.globalCompositeOperation = "destination-in";
        const v = x.createLinearGradient(0, 0, 0, H);
        v.addColorStop(0, "rgba(0,0,0,0.0)");
        v.addColorStop(0.08, "rgba(0,0,0,1)");
        v.addColorStop(0.55, "rgba(0,0,0,0.55)");
        v.addColorStop(1, "rgba(0,0,0,0)");
        x.fillStyle = v;
        x.fillRect(0, 0, W, H);
      },
      { clamp: true },
    );
    shaftMat = new THREE.MeshBasicMaterial({
      map: tex,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
      toneMapped: false,
    });
    shaftMat.userData = { shared: true, liKey: "shaft" };
    return shaftMat;
  }
  /**
   * A soft beam of light (window / oculus / hole in the roof) from p (local, at the opening) along dir, len metres,
   * widening from w0 to w1. Three crossed soft quads so it reads from any angle. color = beam tint × strength.
   */
  A.shaft = function (C, p, dir, len, w0, w1, color, strength) {
    C.shafts = C.shafts || [];
    C.shafts.push({
      p,
      dir,
      len,
      w0,
      w1,
      c: new THREE.Color(color === undefined ? 0xfff0d0 : color).multiplyScalar(
        strength === undefined ? 0.12 : strength,
      ),
    });
  };
  function buildShafts(C) {
    if (!C.shafts || !C.shafts.length) return;
    const P = [],
      U = [],
      Cc = [],
      idx = [];
    const d = new THREE.Vector3(),
      s1 = new THREE.Vector3(),
      s2 = new THREE.Vector3(),
      up = new THREE.Vector3(0, 1, 0);
    for (const sh of C.shafts) {
      d.set(sh.dir[0], sh.dir[1], sh.dir[2]).normalize();
      s1.crossVectors(
        d,
        Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : up,
      ).normalize();
      s2.crossVectors(d, s1).normalize();
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI,
          side = s1
            .clone()
            .multiplyScalar(Math.cos(a))
            .addScaledVector(s2, Math.sin(a));
        const base = P.length / 3;
        for (const [t, u] of [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ]) {
          const w = ((t ? sh.w1 : sh.w0) / 2) * (u ? 1 : -1);
          P.push(
            sh.p[0] + d.x * sh.len * t + side.x * w,
            sh.p[1] + d.y * sh.len * t + side.y * w,
            sh.p[2] + d.z * sh.len * t + side.z * w,
          );
          U.push(u, 1 - t);
          Cc.push(sh.c.r, sh.c.g, sh.c.b);
        }
        idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
    g.setAttribute("color", new THREE.Float32BufferAttribute(Cc, 3));
    g.setIndex(idx);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, getShaftMat());
    m.name = "li_shafts";
    m.renderOrder = 3;
    m.frustumCulled = true;
    C.root.add(m);
    C.shaftMesh = m;
  }
  function getDustMat() {
    if (dustMat) return dustMat;
    const tex = LI.canvasTex(
      "li_mote",
      32,
      32,
      (x, W, H) => {
        const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.4, "rgba(255,255,255,0.35)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
      },
      { clamp: true },
    );
    dustMat = new THREE.PointsMaterial({
      map: tex,
      color: 0xfff0d8,
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    });
    dustMat.onBeforeCompile = function (sh) {
      sh.uniforms.uLiT = dustUniform;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uLiT;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nfloat ph = position.x * 1.7 + position.z * 2.3 + position.y * 0.9;\ntransformed += vec3(sin(uLiT * 0.13 + ph) * 0.35, sin(uLiT * 0.07 + ph * 1.3) * 0.25, cos(uLiT * 0.11 + ph * 0.7) * 0.35);",
        );
    };
    dustMat.customProgramCacheKey = () => "li_dust1";
    dustMat.userData = { shared: true, liKey: "dust" };
    return dustMat;
  }
  LI.dustTick = (t) => {
    dustUniform.value = t;
  };
  /**
   * Window shafts follow the real sky: bright warm-white at midday, amber and long at dawn/dusk, a faint cold
   * moonlight at night; overcast/rain/dust thin them out and rad weather (none currently) tints them green. Dust motes follow.
   */
  const _sc = new THREE.Color(),
    _sw = new THREE.Color(0xfff2dc),
    _sa = new THREE.Color(0xffa860),
    _sm = new THREE.Color(0x7890c0);
