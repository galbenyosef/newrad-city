// play-inline-369 09 — math
// Lines 2100-2856 of readable/play-inline-369.pretty.js (statement-aligned).
  P.site = function (id, o) {
    o = o || {};
    const S = {
      id,
      ox: o.ox || 0,
      oy: o.oy || 0,
      oz: o.oz || 0,
      anchors: {},
      colliders: [],
      interiorKey: o.interiorKey || null,
    };
    S.root = new THREE.Group();
    S.root.name = "m3_site_" + id;
    P.sites.push(S);
    S.b = new Batch(id, {
      ox: S.ox,
      oy: S.oy,
      oz: S.oz,
      lit: o.lit,
      ambient: o.ambient,
      ambI: o.ambI,
      segLen: o.segLen,
      grime: o.grime,
      ao: o.ao,
    });
    S.W = (x, y, z) => new THREE.Vector3(x + S.ox, y + S.oy, z + S.oz);
    // ---- colliders ----
    S.col = function (x0, y0, z0, x1, y1, z1, co) {
      co = co || {};
      const c = G.world.addBox(
        Math.min(x0, x1) + S.ox,
        Math.min(y0, y1) + S.oy,
        Math.min(z0, z1) + S.oz,
        Math.max(x0, x1) + S.ox,
        Math.max(y0, y1) + S.oy,
        Math.max(z0, z1) + S.oz,
        {
          tag: co.tag || "poi",
          surface: co.surface || "concrete",
          walkable: co.walkable !== false,
        },
      );
      S.colliders.push(c);
      return c;
    };
    /** Rotated collider: centre, size, ry = THREE rotation.y of the visual (engine yaw = -ry). */
    S.colR = function (cx, cz, w, d, y0, y1, ry, co) {
      co = co || {};
      const c = G.world.addCollider(
        cx + S.ox,
        cz + S.oz,
        w,
        d,
        y0 + S.oy,
        y1 + S.oy,
        -(ry || 0),
        {
          tag: co.tag || "poi",
          surface: co.surface || "concrete",
          walkable: co.walkable !== false,
        },
      );
      S.colliders.push(c);
      return c;
    };
    // ---- slabs ----
    /** Floor slab: top at y, thickness t (default .3), collider walkable. */
    S.floor = function (key, x0, z0, x1, z1, y, fo) {
      fo = fo || {};
      const t = fo.t || 0.3;
      const under =
        fo.under !== undefined ? fo.under : o.lit && y > 0.5 ? "plaster" : null;
      if (!fo.noVis) {
        if (under) {
          S.b.box(
            key,
            x0,
            y - 0.06,
            z0,
            x1,
            y,
            z1,
            Object.assign({ grime: 0.25, ground: y }, fo),
          );
          S.b.box(under, x0, y - t, z0, x1, y - 0.06, z1, {
            grime: 0.2,
            noAO: true,
          });
        } else
          S.b.box(
            key,
            x0,
            y - t,
            z0,
            x1,
            y,
            z1,
            Object.assign({ grime: 0.25, ground: y }, fo),
          );
      }
      if (!fo.noCol)
        S.col(x0, y - (fo.colT || t), z0, x1, y, z1, {
          surface: fo.surface || "concrete",
        });
    };
    S.ceil = function (key, x0, z0, x1, z1, y, fo) {
      fo = fo || {};
      // drawn a hair below y so it never shares a plane with the next level's floor slab
      S.b.box(
        key,
        x0,
        y - 0.09,
        z0,
        x1,
        y - 0.02,
        z1,
        Object.assign({ grime: 0.2, noAO: true, seg: undefined }, fo),
      );
      if (fo.col) S.col(x0, y - 0.02, z0, x1, y + (fo.t || 0.3), z1);
    };
    /**
     * Straight wall along X (constant z) or Z (constant x). holes: [[a0,a1,h0,h1], ...] in the wall's own
     * coordinates (x for wallX, z for wallZ; heights relative to y0). Visual + colliders.
     */
    function wallAlong(axis, key, c, a0, a1, y0, y1, t, holes, wo) {
      wo = wo || {};
      holes = (holes || [])
        .map((h) => [
          Math.max(a0, Math.min(h[0], h[1])),
          Math.min(a1, Math.max(h[0], h[1])),
          h[2] || 0,
          h[3] === undefined ? y1 - y0 : h[3],
        ])
        .filter((h) => h[1] > h[0])
        .sort((p, q) => p[0] - q[0]);
      const H = y1 - y0;
      // Split the wall at every hole edge; each span keeps the vertical intervals NOT covered by any hole over it.
      // (The old sequential version let the lintel piece of one hole fill the openings of other holes stacked on the
      // same span — e.g. the Dakota stair-hall doors on every floor above the basement were walled up.)
      const pieces = [];
      const cuts = [a0, a1];
      for (const h of holes) cuts.push(h[0], h[1]);
      const xs = Array.from(new Set(cuts.map((v) => Math.round(v * 1e4) / 1e4)))
        .filter((v) => v >= a0 - 1e-6 && v <= a1 + 1e-6)
        .sort((p, q) => p - q);
      for (let i = 0; i < xs.length - 1; i++) {
        const u0 = xs[i],
          u1 = xs[i + 1];
        if (u1 - u0 < 1e-4) continue;
        const um = (u0 + u1) / 2;
        const gaps = holes
          .filter((h) => h[0] < um && h[1] > um)
          .map((h) => [Math.max(0, h[2]), Math.min(H, h[3])])
          .sort((p, q) => p[0] - q[0]);
        let v = 0;
        for (const g of gaps) {
          if (g[0] > v) pieces.push([u0, u1, v, g[0]]);
          v = Math.max(v, g[1]);
        }
        if (v < H) pieces.push([u0, u1, v, H]);
      }
      // merge horizontally adjacent pieces with identical vertical extents (keeps the mesh/collider count down)
      pieces.sort((p, q) => p[2] - q[2] || p[3] - q[3] || p[0] - q[0]);
      for (let i = pieces.length - 1; i > 0; i--) {
        const a = pieces[i - 1],
          c2 = pieces[i];
        if (a[2] === c2[2] && a[3] === c2[3] && Math.abs(a[1] - c2[0]) < 1e-6) {
          a[1] = c2[1];
          pieces.splice(i, 1);
        }
      }
      const ht = t / 2,
        off = wo.off || 0;
      for (const pc of pieces) {
        const ya = y0 + pc[2],
          yb = y0 + pc[3];
        if (axis === "x") {
          if (!wo.noVis)
            S.b.box(
              key,
              pc[0],
              ya,
              c - ht + off,
              pc[1],
              yb,
              c + ht + off,
              Object.assign(
                { ground: wo.ground === undefined ? y0 : wo.ground },
                wo,
              ),
            );
          if (!wo.noCol)
            S.col(pc[0], ya, c - ht + off, pc[1], yb, c + ht + off, {
              walkable: false,
            });
        } else {
          if (!wo.noVis)
            S.b.box(
              key,
              c - ht + off,
              ya,
              pc[0],
              c + ht + off,
              yb,
              pc[1],
              Object.assign(
                { ground: wo.ground === undefined ? y0 : wo.ground },
                wo,
              ),
            );
          if (!wo.noCol)
            S.col(c - ht + off, ya, pc[0], c + ht + off, yb, pc[1], {
              walkable: false,
            });
        }
      }
      // door frames / lintels on holes
      if (wo.frame)
        for (const h of holes) {
          const fk = wo.frame,
            fw = wo.frameW || 0.18,
            fd = t / 2 + 0.06;
          if (axis === "x") {
            for (const s of [-1, 1]) {
              S.b.box(
                fk,
                h[0] - fw,
                y0 + h[2],
                c - fd + off,
                h[0],
                y0 + h[3],
                c + fd + off,
                { ground: y0 },
              );
              S.b.box(
                fk,
                h[1],
                y0 + h[2],
                c - fd + off,
                h[1] + fw,
                y0 + h[3],
                c + fd + off,
                { ground: y0 },
              );
              if (h[3] < H)
                S.b.box(
                  fk,
                  h[0] - fw,
                  y0 + h[3],
                  c - fd + off,
                  h[1] + fw,
                  y0 + h[3] + fw,
                  c + fd + off,
                  { ground: y0 },
                );
              void s;
              break;
            }
          } else {
            S.b.box(
              fk,
              c - fd + off,
              y0 + h[2],
              h[0] - fw,
              c + fd + off,
              y0 + h[3],
              h[0],
              { ground: y0 },
            );
            S.b.box(
              fk,
              c - fd + off,
              y0 + h[2],
              h[1],
              c + fd + off,
              y0 + h[3],
              h[1] + fw,
              { ground: y0 },
            );
            if (h[3] < H)
              S.b.box(
                fk,
                c - fd + off,
                y0 + h[3],
                h[0] - fw,
                c + fd + off,
                y0 + h[3] + fw,
                h[1] + fw,
                { ground: y0 },
              );
          }
        }
    }
    S.wallX = (key, z, x0, x1, y0, y1, t, holes, wo) =>
      wallAlong(
        "x",
        key,
        z,
        Math.min(x0, x1),
        Math.max(x0, x1),
        y0,
        y1,
        t || 0.3,
        holes,
        wo,
      );
    S.wallZ = (key, x, z0, z1, y0, y1, t, holes, wo) =>
      wallAlong(
        "z",
        key,
        x,
        Math.min(z0, z1),
        Math.max(z0, z1),
        y0,
        y1,
        t || 0.3,
        holes,
        wo,
      );
    /**
     * Room shell. r: {x0,z0,x1,z1, y, h, t, wall, floor, ceil, holes:{n,s,e,w: [[a0,a1,h0,h1]]}, skip:'nsewfc', frame, wallOpts, floorOpts, ceilOpts}
     * Walls sit ON the rectangle edges (half thickness inside). n = z0 edge, s = z1, w = x0, e = x1.
     */
    S.room = function (r) {
      const y = r.y || 0,
        h = r.h || 3.2,
        t = r.t || 0.3,
        sk = r.skip || "",
        ho = r.holes || {};
      const wk = r.wall || "plaster",
        wo = Object.assign({ frame: r.frame }, r.wallOpts || {});
      if (sk.indexOf("f") < 0)
        S.floor(
          r.floor || "concrete",
          r.x0,
          r.z0,
          r.x1,
          r.z1,
          y,
          Object.assign({ surface: r.surface }, r.floorOpts || {}),
        );
      if (sk.indexOf("c") < 0 && r.ceil !== false)
        S.ceil(r.ceil || "plaster", r.x0, r.z0, r.x1, r.z1, y + h, r.ceilOpts);
      if (sk.indexOf("n") < 0)
        S.wallX(
          r.wallN || wk,
          r.z0,
          r.x0 - t / 2,
          r.x1 + t / 2,
          y,
          y + h,
          t,
          ho.n,
          wo,
        );
      if (sk.indexOf("s") < 0)
        S.wallX(
          r.wallS || wk,
          r.z1,
          r.x0 - t / 2,
          r.x1 + t / 2,
          y,
          y + h,
          t,
          ho.s,
          wo,
        );
      if (sk.indexOf("w") < 0)
        S.wallZ(
          r.wallW || wk,
          r.x0,
          r.z0 + t / 2,
          r.z1 - t / 2,
          y,
          y + h,
          t,
          ho.w,
          wo,
        );
      if (sk.indexOf("e") < 0)
        S.wallZ(
          r.wallE || wk,
          r.x1,
          r.z0 + t / 2,
          r.z1 - t / 2,
          y,
          y + h,
          t,
          ho.e,
          wo,
        );
      // skirting & cornice trims
      if (r.trim) {
        const tk = r.trim,
          e = 0.04 + t / 2;
        const bands = [
          [y, y + 0.18, 0.05],
          [y + h - 0.25, y + h, 0.09],
        ];
        for (const bd of bands) {
          if (sk.indexOf("n") < 0)
            S.b.box(
              tk,
              r.x0,
              bd[0],
              r.z0 + e - 0.01,
              r.x1,
              bd[1],
              r.z0 + e + bd[2],
              { ground: y, seg: false },
            );
          if (sk.indexOf("s") < 0)
            S.b.box(
              tk,
              r.x0,
              bd[0],
              r.z1 - e - bd[2],
              r.x1,
              bd[1],
              r.z1 - e + 0.01,
              { ground: y, seg: false },
            );
          if (sk.indexOf("w") < 0)
            S.b.box(
              tk,
              r.x0 + e - 0.01,
              bd[0],
              r.z0,
              r.x0 + e + bd[2],
              bd[1],
              r.z1,
              { ground: y, seg: false },
            );
          if (sk.indexOf("e") < 0)
            S.b.box(
              tk,
              r.x1 - e - bd[2],
              bd[0],
              r.z0,
              r.x1 - e + 0.01,
              bd[1],
              r.z1,
              { ground: y, seg: false },
            );
        }
      }
      return r;
    };
    /**
     * Straight stair: bottom front edge at (x,z) centred across width, climbing toward dir ('n' = -z, 's' = +z, 'e' = +x, 'w' = -x)
     * from y0 to y1. Returns {x, z} of the top edge (centre). o: {rise=.25 max, run=.3, key, side (stringer key), solid}
     */
    S.stairs = function (key, x, z, dir, width, y0, y1, so) {
      so = so || {};
      const H = y1 - y0,
        n = Math.max(1, Math.ceil(H / (so.rise || 0.24))),
        rise = H / n,
        run = so.run || 0.3;
      const dx = dir === "e" ? 1 : dir === "w" ? -1 : 0,
        dz = dir === "s" ? 1 : dir === "n" ? -1 : 0;
      const hw = width / 2;
      for (let i = 0; i < n; i++) {
        const a = i * run,
          b2 = (i + 1) * run,
          top = y0 + (i + 1) * rise;
        const bot = so.solid === false ? top - Math.max(0.18, rise) : y0 - 0.05;
        let x0, x1, z0, z1;
        if (dx) {
          x0 = x + dx * a;
          x1 = x + dx * b2;
          z0 = z - hw;
          z1 = z + hw;
        } else {
          z0 = z + dz * a;
          z1 = z + dz * b2;
          x0 = x - hw;
          x1 = x + hw;
        }
        S.b.box(
          key,
          Math.min(x0, x1),
          bot,
          Math.min(z0, z1),
          Math.max(x0, x1),
          top,
          Math.max(z0, z1),
          { ground: y0, seg: false, grime: 0.3 },
        );
        if (so.nosing)
          S.b.box(
            so.nosing,
            Math.min(x0, x1) - (dx < 0 ? 0.03 : 0),
            top - 0.04,
            Math.min(z0, z1) - (dz < 0 ? 0.03 : 0),
            Math.max(x0, x1) + (dx > 0 ? 0.03 : 0),
            top + 0.005,
            Math.max(z0, z1) + (dz > 0 ? 0.03 : 0),
            { seg: false, noAO: true },
          );
        S.col(
          Math.min(x0, x1),
          Math.min(bot, top - 0.3),
          Math.min(z0, z1),
          Math.max(x0, x1),
          top,
          Math.max(z0, z1),
          { surface: so.surface || "concrete" },
        );
      }
      const L = n * run;
      // balustrades
      if (so.rail) {
        for (const s of so.railSides || [-1, 1]) {
          const px = dx ? 0 : s * (hw - 0.05),
            pz = dz ? 0 : s * (hw - 0.05);
          const ax = x + (dz ? px : 0),
            az = z + (dx ? pz : 0);
          const A = [ax, y0 + 0.95, az],
            B = [ax + dx * L, y1 + 0.95, az + dz * L];
          S.b.rod(so.rail, A, B, 0.045, 6);
          for (let k = 0; k <= n; k += 2) {
            const t2 = k / n;
            S.b.rod(
              so.rail,
              [ax + dx * L * t2, y0 + H * t2, az + dz * L * t2],
              [ax + dx * L * t2, y0 + H * t2 + 0.95, az + dz * L * t2],
              0.018,
              4,
            );
          }
          if (so.railCol !== false) {
            if (dx)
              S.col(
                Math.min(x, x + dx * L),
                y0,
                az - 0.06,
                Math.max(x, x + dx * L),
                y1 + 1.0,
                az + 0.06,
                { walkable: false },
              );
            else
              S.col(
                ax - 0.06,
                y0,
                Math.min(z, z + dz * L),
                ax + 0.06,
                y1 + 1.0,
                Math.max(z, z + dz * L),
                { walkable: false },
              );
          }
        }
      }
      return { x: x + dx * L, z: z + dz * L, len: L };
    };
    /** Railing (balustrade) along a polyline at height y. pts [[x,z],...]. */
    S.rail = function (key, pts, y, h, ro) {
      ro = ro || {};
      h = h || 1.0;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i],
          b2 = pts[i + 1];
        S.b.rod(
          key,
          [a[0], y + h, a[1]],
          [b2[0], y + h, b2[1]],
          ro.r || 0.05,
          6,
        );
        if (ro.mid !== false)
          S.b.rod(
            key,
            [a[0], y + h * 0.5, a[1]],
            [b2[0], y + h * 0.5, b2[1]],
            (ro.r || 0.05) * 0.6,
            4,
          );
        const L = Math.hypot(b2[0] - a[0], b2[1] - a[1]),
          n = Math.max(1, Math.round(L / (ro.step || 0.3)));
        for (let k = 0; k <= n; k++) {
          const t = k / n,
            px = a[0] + (b2[0] - a[0]) * t,
            pz = a[1] + (b2[1] - a[1]) * t;
          if (ro.baluster)
            S.b.lathe(
              key,
              [
                [0.001, 0],
                [0.06, 0.02],
                [0.035, 0.15],
                [0.07, h * 0.5],
                [0.035, h * 0.8],
                [0.05, h - 0.02],
                [0.001, h],
              ],
              6,
              px,
              y,
              pz,
            );
          else S.b.rod(key, [px, y, pz], [px, y + h, pz], ro.pr || 0.016, 4);
        }
        if (ro.col !== false) {
          const cx = (a[0] + b2[0]) / 2,
            cz = (a[1] + b2[1]) / 2,
            ang = Math.atan2(b2[1] - a[1], b2[0] - a[0]);
          S.colR(cx, cz, L, 0.12, y, y + h, -ang, { walkable: false });
        }
      }
    };
    // ---- anchors, lights, props, pickups, containers, doors ----
    S.anchor = function (name, x, y, z, yaw) {
      const v = S.W(x, y, z);
      v.yaw = yaw || 0;
      S.anchors[name] = v;
      return v;
    };
    S.light = function (x, y, z, color, r, i, glow) {
      S.b.light(x, y, z, color, r, i);
      if (glow) S.glow(x, y, z, color, glow.size || glow, glow.opts);
    };
    S.glows = [];
    S.glow = function (x, y, z, color, size, go) {
      const pos = S.W(x, y, z);
      S.glows.push({ pos, color, size, opts: go });
    };
    S.props = [];
    let propN = 0;
    S.prop = function (type, x, y, z, yaw, po) {
      const w = S.W(x, y, z);
      // props has no 'dresser' prototype; rpg's containers module has a dresser model → build it there
      if (type === "dresser") {
        const c = Object.assign(
          {
            name: "Dresser",
            pos: w,
            yaw: yaw || 0,
            kind: "dresser",
            loot: "dresser",
            model: true,
            id: "m3_" + id + "_dresser_" + ++propN,
          },
          po || {},
        );
        if (!c.items) delete c.items;
        else if (c.loot === "dresser" && c.items) delete c.loot;
        S.containers.push(c);
        return c;
      }
      const opts = Object.assign(
        {
          x: w.x,
          y: w.y,
          z: w.z,
          yaw: yaw || 0,
          persistent: true,
          id: "m3:" + id + ":" + type + ":" + ++propN,
        },
        po || {},
      );
      S.props.push({ type, opts });
      return opts;
    };
    S.pickups = [];
    S.pickup = function (itemId, n, x, y, z, po) {
      S.pickups.push({
        id: itemId,
        n: n || 1,
        pos: S.W(x, y, z),
        opts: po || {},
      });
    };
    S.containers = [];
    S.container = function (name, x, y, z, co) {
      S.containers.push(
        Object.assign(
          {
            name,
            pos: S.W(x, y, z),
            model: false,
            id:
              "m3_" +
              id +
              "_" +
              name.replace(/\W+/g, "_").toLowerCase() +
              "_" +
              S.containers.length,
          },
          co || {},
        ),
      );
    };
    S.doors = [];
    /** Teleport door: pos local, target WORLD {x,y,z,yaw}. Returns the core door (after build: S.doors[i].door). */
    S.door = function (x, y, z, label, target, dopts) {
      const d = Object.assign(
        {
          pos: S.W(x, y, z),
          label,
          target,
          verb: "Enter",
          radius: 1.4,
          sound: "door_open",
        },
        dopts || {},
      );
      const door = G.world.addDoor(d);
      S.doors.push(door);
      return door;
    };
    S.interact = function (x, y, z, def) {
      const it = G.world.addInteractable(
        Object.assign({ pos: S.W(x, y, z), radius: 0.8 }, def),
      );
      return it;
    };
    S.build = function (bo) {
      bo = bo || {};
      if (S.interiorKey && S.b.lit && P.fillCell)
        P.safe("fill:" + S.id, () => P.fillCell(S));
      const lightList = S.b.lights.slice();
      S.b.build(S.root, bo);
      if (bo.interior)
        P.safe("fixtures:" + S.id, () => P.registerFixtureLights(S, lightList));
      for (const g of S.glows) {
        P.safe("glow", () => {
          if (!G.isStub("fx") && G.fx.glowSprite)
            G.fx.glowSprite(
              g.pos,
              g.color,
              g.size,
              Object.assign(
                {
                  parent: S.root,
                  intensity: 1.2,
                  dayFactor: bo.interior ? 1 : 0.35,
                },
                g.opts || {},
              ),
            );
        });
      }
      G.scene.add(S.root);
      return S.root;
    };
    return S;
  };

  // ===================================================================
  // Facade helper — u along the wall (viewer's left → right when looking at
  // the wall from outside), d outward from the wall plane, y up.
  // ===================================================================
  /**
   * P.face(S, side, a0, a1, c): side 'n'|'s'|'e'|'w' = which way the facade faces; the wall plane is at
   * z=c (n/s) or x=c (e/w), spanning a0..a1 (x for n/s, z for e/w). Local coords of the site.
   */
