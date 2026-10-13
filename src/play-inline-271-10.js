// play-inline-271 10 — key
// Lines 2583-2932 of readable/play-inline-271.pretty.js (statement-aligned).
  P.face = function (S, side, a0, a1, c) {
    const F = { S, side, c, len: Math.abs(a1 - a0) };
    // viewer looking at the facade: facing south (n side) → viewer's right is west
    let ox, oz, dx, dz, nx, nz;
    if (side === "s") {
      ox = Math.min(a0, a1);
      oz = c;
      dx = 1;
      dz = 0;
      nx = 0;
      nz = 1;
    } else if (side === "n") {
      ox = Math.max(a0, a1);
      oz = c;
      dx = -1;
      dz = 0;
      nx = 0;
      nz = -1;
    } else if (side === "e") {
      ox = c;
      oz = Math.max(a0, a1);
      dx = 0;
      dz = -1;
      nx = 1;
      nz = 0;
    } else {
      ox = c;
      oz = Math.min(a0, a1);
      dx = 0;
      dz = 1;
      nx = -1;
      nz = 0;
    }
    Object.assign(F, { ox, oz, dx, dz, nx, nz });
    F.pt = (u, d) => [ox + dx * u + nx * (d || 0), oz + dz * u + nz * (d || 0)];
    F.ry = side === "s" ? 0 : side === "n" ? PI : side === "e" ? HP : -HP; // quad facing outward
    /** Axis aligned box in facade coords. */
    F.box = function (key, u0, u1, y0, y1, d0, d1, o) {
      const p0 = F.pt(u0, d0),
        p1 = F.pt(u1, d1);
      return S.b.box(
        key,
        Math.min(p0[0], p1[0]),
        y0,
        Math.min(p0[1], p1[1]),
        Math.max(p0[0], p1[0]),
        y1,
        Math.max(p0[1], p1[1]),
        o,
      );
    };
    F.quad = function (key, u, y, w, h, d, o) {
      const p = F.pt(u, d || 0.02);
      return S.b.quad(
        key,
        p[0],
        y,
        p[1],
        w,
        h,
        Object.assign({ ry: F.ry }, o || {}),
      );
    };
    /** Matrix placing a local XY shape (x → u, y → up, z → outward) at (u, y, d). */
    F.mat = function (u, y, d) {
      const p = F.pt(u, d);
      return new THREE.Matrix4()
        .makeBasis(
          new THREE.Vector3(dx, 0, dz),
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(nx, 0, nz),
        )
        .setPosition(p[0], y, p[1]);
    };
    /** Arch ring (voussoirs) centred at u, springing at y, inner radius r, thickness th, depth d0..d1. */
    F.arch = function (key, u, y, r, th, d0, d1, o) {
      const sh = new THREE.Shape();
      sh.absarc(0, 0, r + th, 0, PI, false);
      sh.lineTo(-r, 0);
      sh.absarc(0, 0, r, PI, 0, true);
      sh.lineTo(r + th, 0);
      return S.b.extrude(
        key,
        sh,
        d1 - d0,
        F.mat(u, y, d0),
        Object.assign({ curve: 12 }, o || {}),
      );
    };
    /** Filled half-disc (arched glass / tympanum). */
    F.halfDisc = function (key, u, y, r, d, o) {
      const g = new THREE.CircleGeometry(r, 14, 0, PI);
      return S.b.geo(
        key,
        g,
        F.mat(u, y, d),
        Object.assign({ uv: "box" }, o || {}),
      );
    };
    /**
     * Window: glass pane on the wall + frame + sill + head. o: {style:'dark'|'broken'|'lit'|'boarded'|'glass', frame key, arch (bool),
     * sill key, hood key ('pediment'|'cornice'|'flat'), mull (glazing bars), depth, keystone}
     */
    F.window = function (u, y, w, h, o) {
      o = o || {};
      const fk = o.frame || "paint_white",
        gk =
          o.style === "broken"
            ? "glass_broken"
            : o.style === "lit"
              ? "window_lit"
              : o.style === "glass"
                ? "glass"
                : "glass_dark";
      const d = o.d || 0.02;
      const archR = o.arch ? w / 2 : 0;
      const hr = h - archR;
      // glass
      F.box(gk, u - w / 2, u + w / 2, y, y + hr, d - 0.05, d, {
        seg: false,
        grime: 0.1,
        noAO: true,
      });
      if (o.arch)
        F.halfDisc(gk, u, y + hr, w / 2, d + 0.005, { grime: 0.1, noAO: true });
      if (o.style === "boarded") {
        const r = P.rng(u * 7.3 + y * 1.3 + c);
        for (let i = 0; i < 4; i++) {
          const yy = y + 0.3 + (i * (hr - 0.4)) / 3;
          F.box(
            "wood_rotten",
            u - w / 2 - 0.05,
            u + w / 2 + 0.05,
            yy - 0.1,
            yy + 0.1,
            d,
            d + 0.05,
            { seg: false, rz: 0 },
          );
          void r;
        }
      }
      // frame
      const ft = o.ft || 0.1,
        fd = o.fd || 0.12;
      F.box(fk, u - w / 2 - ft, u - w / 2, y, y + hr, d - 0.02, d + fd, {
        seg: false,
      });
      F.box(fk, u + w / 2, u + w / 2 + ft, y, y + hr, d - 0.02, d + fd, {
        seg: false,
      });
      if (!o.arch)
        F.box(
          fk,
          u - w / 2 - ft,
          u + w / 2 + ft,
          y + hr,
          y + hr + ft,
          d - 0.02,
          d + fd,
          { seg: false },
        );
      else F.arch(fk, u, y + hr, w / 2, ft, d - 0.02, d + fd);
      if (o.mull !== false) {
        F.box(fk, u - 0.025, u + 0.025, y, y + hr, d, d + 0.04, { seg: false });
        F.box(
          fk,
          u - w / 2,
          u + w / 2,
          y + hr * 0.55,
          y + hr * 0.55 + 0.05,
          d,
          d + 0.04,
          { seg: false },
        );
      }
      // sill
      if (o.sill !== false)
        F.box(
          o.sill || fk,
          u - w / 2 - ft - 0.08,
          u + w / 2 + ft + 0.08,
          y - 0.12,
          y,
          d - 0.02,
          d + fd + 0.12,
          { seg: false },
        );
      // head
      const hk = o.hoodKey || o.sill || fk;
      if (o.hood === "cornice")
        F.box(
          hk,
          u - w / 2 - 0.3,
          u + w / 2 + 0.3,
          y + h + ft,
          y + h + ft + 0.18,
          d,
          d + 0.3,
          { seg: false },
        );
      else if (o.hood === "pediment") {
        const sh = new THREE.Shape();
        const hw = w / 2 + 0.35;
        sh.moveTo(-hw, 0);
        sh.lineTo(hw, 0);
        sh.lineTo(0, 0.55);
        sh.closePath();
        S.b.extrude(hk, sh, 0.25, F.mat(u, y + h + ft + 0.05, d), {
          seg: false,
        });
        F.box(
          hk,
          u - hw,
          u + hw,
          y + h + ft - 0.05,
          y + h + ft + 0.08,
          d,
          d + 0.3,
          { seg: false },
        );
      } else if (o.hood === "flat")
        F.box(
          hk,
          u - w / 2 - 0.15,
          u + w / 2 + 0.15,
          y + h + ft,
          y + h + ft + 0.3,
          d,
          d + 0.14,
          { seg: false },
        );
      if (o.arch && o.keystone)
        F.box(
          o.keystone,
          u - 0.18,
          u + 0.18,
          y + h - 0.05,
          y + h + ft + 0.35,
          d,
          d + fd + 0.06,
          { seg: false },
        );
    };
    /** Horizontal band (string course / cornice) across the whole facade. */
    F.band = function (key, y0, y1, d0, d1, o) {
      return F.box(
        key,
        -(o && o.ext !== undefined ? o.ext : 0),
        F.len + (o && o.ext !== undefined ? o.ext : 0),
        y0,
        y1,
        d0,
        d1,
        o,
      );
    };
    /** Classical cornice: stepped profile + modillion blocks. */
    F.cornice = function (key, y, proj, o) {
      o = o || {};
      const e = o.ext === undefined ? proj : o.ext;
      F.box(key, -e * 0.4, F.len + e * 0.4, y, y + 0.25, 0, proj * 0.4, {
        seg: false,
      });
      F.box(key, -e * 0.7, F.len + e * 0.7, y + 0.25, y + 0.55, 0, proj * 0.7, {
        seg: false,
      });
      F.box(key, -e, F.len + e, y + 0.55, y + 0.85, 0, proj, { seg: false });
      if (o.mods !== false) {
        const n = Math.floor(F.len / (o.step || 0.9));
        for (let i = 0; i <= n; i++) {
          const u = (i * F.len) / n;
          F.box(
            key,
            u - 0.09,
            u + 0.09,
            y + 0.12,
            y + 0.55,
            proj * 0.3,
            proj * 0.85,
            { seg: false },
          );
        }
      }
    };
    return F;
  };

  // ===================================================================
  // Registry (G.pois) + anchors
  // ===================================================================
  P.register = function (id, rec) {
    if (!G.pois || G.pois.__stub) G.pois = {};
    G.pois[id] = Object.assign({ id, owner: "poi_uws" }, rec);
    if (typeof G.pois.getAnchor !== "function") {
      G.pois.getAnchor = function (idOrKey, name) {
        const scan = (p) => {
          if (!p || typeof p !== "object" || !p.anchors) return null;
          const v = p.anchors[name];
          if (!v) return null;
          const c = v.clone();
          c.yaw = v.yaw || 0;
          return c;
        };
        const direct = G.pois[idOrKey];
        const a = scan(direct);
        if (a) return a;
        for (const k in G.pois) {
          const p = G.pois[k];
          if (
            p &&
            typeof p === "object" &&
            (p.interiorKey === idOrKey || p.id === idOrKey)
          ) {
            const r = scan(p);
            if (r) return r;
          }
        }
        return null;
      };
    }
    return G.pois[id];
  };
  P.anchor = (poiId, name) => {
    const p = G.pois && G.pois[poiId];
    const v = p && p.anchors ? p.anchors[name] : null;
    if (!v) return null;
    const c = v.clone();
    c.yaw = v.yaw || 0;
    return c;
  };
  /** Interior root visibility registry. */
  P.addInterior = function (key, root) {
    const o = G.LAYOUT.INTERIORS[key].origin;
    P.interiors.push({ key, root, ox: o.x, oz: o.z });
  };
  P.animate = function (x, z, r, fn) {
    P.animators.push({ c: { x, z }, r2: r * r, fn });
  };
  P.inCell = function (key, pos) {
    const I = G.LAYOUT.INTERIORS[key];
    if (!I) return false;
    pos = pos || (G.player && G.player.pos);
    if (!pos) return false;
    return (
      Math.abs(pos.x - I.origin.x) < 170 && Math.abs(pos.z - I.origin.z) < 170
    );
  };
  P.I = (key) => G.LAYOUT.INTERIORS[key].origin;
  P.site_ = (id) => G.LAYOUT.getSite(id);
