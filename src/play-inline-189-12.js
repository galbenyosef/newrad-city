// play-inline-189 12 — ctx
// Lines 3170-3516 of readable/play-inline-189.pretty.js (statement-aligned).
  K.window = function (b, x, y, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz,
      rz = -nx; // U (to the viewer's right when facing the wall)
    const P = (u, v, d) => [x + rx * u + nx * d, y + v, z + rz * u + nz * d];
    const yaw = Math.atan2(-rz, rx);
    const st = o.state || "glass";
    const dep = o.inset !== undefined ? o.inset : 0.14; // frame depth (proud of the wall → reads as a recess)
    const d0 = 0.012;
    const back =
      st === "glass"
        ? "glass"
        : st === "lit"
          ? "lamp"
          : st === "boarded"
            ? "wood_rotten"
            : "paint_black";
    const tint =
      st === "glass"
        ? [0.5, 0.56, 0.55]
        : st === "lit"
          ? [0.95, 0.66, 0.36]
          : st === "boarded"
            ? [0.55, 0.47, 0.4]
            : [0.04, 0.04, 0.04];
    b.quad(
      back,
      P(-w / 2, -h / 2, d0),
      P(w / 2, -h / 2, d0),
      P(w / 2, h / 2, d0),
      P(-w / 2, h / 2, d0),
      { tint, grime: st === "glass" ? 0.4 : 0.15 },
    );
    if (st === "broken") {
      // jagged shards left in the frame
      const r = K.rng((x * 17 + y * 5 + z * 3) | 0);
      for (let k = 0; k < 3; k++) {
        const u = (r() - 0.5) * w * 0.8;
        b.quad(
          "glass",
          P(u - 0.15, -h / 2, d0 + 0.004),
          P(u + 0.2, -h / 2, d0 + 0.004),
          P(u + 0.05, -h / 2 + 0.3 + r() * 0.5, d0 + 0.004),
          P(u, -h / 2 + 0.3 + r() * 0.5, d0 + 0.004),
          { tint: [0.5, 0.56, 0.55] },
        );
      }
    }
    const fm = o.surround || o.reveal || "brick_red",
      ft = o.surroundTint || [0.62, 0.5, 0.44],
      fw = o.fw || 0.1;
    const box = (u, v, W, H, D, mat, tint2) => {
      const c = P(u, v, D / 2);
      b.box(mat, c[0], c[1], c[2], W, H, D, { yaw, tint: tint2 });
    };
    box(-w / 2 - fw / 2, -h / 2 - fw, fw, h + fw * 2, dep, fm, ft);
    box(w / 2 + fw / 2, -h / 2 - fw, fw, h + fw * 2, dep, fm, ft);
    if (st === "glass" || st === "lit" || st === "dark") {
      const fr = o.frame || "paint_white";
      box(0, -0.025, w, 0.05, 0.05, fr);
      box(0, -h / 2, 0.045, h, 0.05, fr);
    }
    if (st === "boarded") {
      const r = K.rng((x * 13 + y * 7 + z * 5) | 0);
      for (let i = 0; i < 3; i++) {
        const yy = -h / 2 + 0.25 + (i * (h - 0.5)) / 2 + (r() - 0.5) * 0.15;
        const a = P(-w / 2 - 0.08, yy + (r() - 0.5) * 0.25, dep + 0.02),
          c = P(w / 2 + 0.08, yy + (r() - 0.5) * 0.25, dep + 0.02);
        b.beam("wood_rotten", a[0], a[1], a[2], c[0], c[1], c[2], 0.22, 0.03, {
          tint: [0.7, 0.6, 0.5],
        });
      }
    }
    if (o.sill !== false)
      box(
        0,
        -h / 2 - fw - 0.07,
        w + 0.3,
        0.09,
        dep + 0.08,
        o.sillMat || "limestone",
        o.trimTint,
      );
    else box(0, -h / 2 - fw, w + fw * 2, fw, dep, fm, ft);
    if (o.lintel)
      box(
        0,
        h / 2,
        w + 0.3,
        o.lintel,
        dep + 0.04,
        o.lintelMat || "limestone",
        o.trimTint,
      );
    else box(0, h / 2, w + fw * 2, fw, dep, fm, ft);
  };

  /**
   * NYC zig-zag fire escape on a wall: platforms (grate + railing + brackets) at each level in `ys`, a steep stair
   * between consecutive platforms (alternating direction), and a counterweighted drop ladder under the lowest one.
   * (x, z) = point on the wall surface at the escape's centre line; (nx, nz) = outward wall normal; w = width.
   * Decorative only (no colliders — everything is above head height). o: {depth, mat, tint, seed, ladder:false}
   */
  K.fireEscape = function (b, x, z, nx, nz, w, ys, o) {
    o = o || {};
    const rx = nz,
      rz = -nx;
    const D = o.depth || 1.3,
      mat = o.mat || "black_iron",
      tint = o.tint || [0.34, 0.29, 0.26];
    const P = (u, d, y) => [x + rx * u + nx * d, y, z + rz * u + nz * d];
    const yaw = Math.atan2(-rz, rx);
    const r = K.rng(o.seed || (x * 31 + z * 17) | 0);
    const beam = (a, c, t, h) =>
      b.beam(
        mat,
        a[0],
        a[1],
        a[2],
        c[0],
        c[1],
        c[2],
        t || 0.045,
        h || t || 0.045,
        { tint },
      );
    ys.forEach((y, k) => {
      // grate platform
      const c = P(0, D / 2, y - 0.06);
      b.box(mat, c[0], c[1], c[2], w, 0.06, D, { yaw, tint });
      // angle-iron brackets into the wall
      for (const u of [-w / 2 + 0.25, w / 2 - 0.25])
        beam(P(u, 0.05, y - 0.95), P(u, D - 0.1, y - 0.07), 0.05);
      // railing: top & mid rails on the outer edge + ends, balusters
      for (const h of [1.0, 0.5]) {
        beam(P(-w / 2, D, y + h), P(w / 2, D, y + h), h === 1 ? 0.05 : 0.03);
        beam(P(-w / 2, 0.05, y + h), P(-w / 2, D, y + h), 0.035);
        beam(P(w / 2, 0.05, y + h), P(w / 2, D, y + h), 0.035);
      }
      const nb = Math.max(2, Math.round(w / 0.55));
      for (let i = 0; i <= nb; i++) {
        const u = -w / 2 + (w * i) / nb;
        beam(P(u, D, y), P(u, D, y + 1.0), 0.022);
      }
      // rust drip / sag: a bent rail here and there
      if (r() < 0.25)
        beam(
          P(w * 0.1, D + 0.05, y + 0.6),
          P(w * 0.35, D + 0.12, y + 0.35),
          0.03,
        );
      // stair up to the next platform (alternating)
      if (k < ys.length - 1) {
        const rise = ys[k + 1] - y,
          dir = k % 2 ? 1 : -1;
        const run = Math.min(w - 0.9, rise * 0.95);
        const u0 = dir * (w / 2 - 0.35),
          u1 = u0 - dir * run;
        for (const d of [D - 0.12, D - 0.72])
          beam(P(u0, d, y), P(u1, d, ys[k + 1]), 0.05, 0.14);
        beam(P(u0, D - 0.08, y + 0.9), P(u1, D - 0.08, ys[k + 1] + 0.9), 0.035);
        const nt = Math.max(4, Math.round(rise / 0.28));
        for (let t = 1; t < nt; t++) {
          const f = t / nt,
            tc = P(u0 + (u1 - u0) * f, D - 0.42, y + rise * f - 0.03);
          b.box(mat, tc[0], tc[1], tc[2], 0.2, 0.035, 0.62, { yaw, tint });
        }
      }
    });
    // drop ladder under the lowest platform (stowed ~2.8 m off the pavement)
    if (o.ladder !== false && ys.length) {
      const y = ys[0],
        u = -(w / 2 - 0.5);
      for (const du of [-0.22, 0.22])
        beam(P(u + du, D - 0.15, y - 0.1), P(u + du, D - 0.15, y - 2.6), 0.035);
      for (let yy = y - 0.45; yy > y - 2.6; yy -= 0.32)
        beam(P(u - 0.22, D - 0.15, yy), P(u + 0.22, D - 0.15, yy), 0.02);
      // counterweight arm
      beam(P(u, D - 0.15, y + 1.3), P(u + 0.9, D - 0.15, y + 1.9), 0.04);
      const cw = P(u + 0.9, D - 0.15, y + 1.55);
      b.box(mat, cw[0], cw[1], cw[2], 0.18, 0.35, 0.18, { yaw, tint });
    }
  };

  /**
   * Painted "ghost sign" on a blank brick wall (faded lettering straight on the brick). Face centre (x, y, z),
   * outward normal (nx, nz), size w × h. lines: [text…]; o: {fg, bg, font, key}
   */
  K.ghostSign = function (b, x, y, z, nx, nz, w, h, lines, o) {
    o = o || {};
    const key =
      o.key || "ghost_" + lines.join("_").replace(/\W+/g, "").slice(0, 24);
    const rect = K.paint(
      "art",
      key,
      1024,
      Math.max(128, Math.round((1024 * h) / w / 32) * 32),
      function (x2, X, Y, W, H) {
        if (o.bg) {
          x2.fillStyle = o.bg;
          x2.fillRect(X + W * 0.02, Y + H * 0.03, W * 0.96, H * 0.94);
        }
        x2.fillStyle = o.fg || "rgba(236,226,196,0.78)";
        x2.textAlign = "center";
        x2.textBaseline = "middle";
        const n = lines.length;
        lines.forEach((t, i) => {
          const big = i === 0;
          const fs = Math.floor(
            (H / (n + (big ? 0.2 : 0.8))) * (big ? 0.78 : 0.5),
          );
          x2.font =
            (big ? "bold " : "") + fs + "px " + (o.font || "Georgia, serif");
          x2.fillText(t, X + W / 2, Y + (H * (i + 0.5)) / n, W * 0.92);
        });
        // weathering: knock the paint back out of the mortar lines and in blotches
        x2.globalCompositeOperation = "destination-out";
        const r = K.rng(key);
        for (let k = 0; k < 90; k++) {
          x2.fillStyle = "rgba(0,0,0," + (0.15 + r() * 0.5).toFixed(2) + ")";
          const rr = 6 + r() * 40;
          x2.beginPath();
          x2.arc(X + r() * W, Y + r() * H, rr, 0, Math.PI * 2);
          x2.fill();
        }
        x2.fillStyle = "rgba(0,0,0,0.35)";
        for (let yy = 0; yy < H; yy += 9) x2.fillRect(X, Y + yy, W, 2);
        x2.globalCompositeOperation = "source-over";
      },
    );
    b.plate("decal", x + nx * 0.03, y, z + nz * 0.03, nx, nz, w, h, rect);
  };

  // ------------------------------------------------------------------
  // Gameplay records
  // ------------------------------------------------------------------
  /**
   * Per-POI context: {id, key (interior key), O (origin), anchors, loot, notes, terminals, gaps}
   */
  K.INTERIOR_LIFT = 20;
  K.ctx = function (id, interiorKey) {
    const L = G.LAYOUT;
    const it = interiorKey ? L.INTERIORS[interiorKey] : null;
    const O = it ? it.origin : { x: 0, y: 0, z: 0 };
    // Interior cells are LIFTED: core/map terrain is y=0 everywhere at x ≥ INTERIOR_X_MIN, so any walkable floor
    // below 0 (the Vanguard club & cellar, Katz's basement, the Chinatown relay station…) was unreachable — ground snap put the
    // player on the invisible y=0 plane. Every interior is authored relative to O, so one offset fixes all of them.
    const lift = it ? K.INTERIOR_LIFT : 0;
    return {
      id,
      key: interiorKey,
      O: { x: O.x, y: (O.y || 0) + lift, z: O.z },
      anchors: {},
      loot: [],
      notes: [],
      terminals: [],
      gaps: [],
      doors: [],
      interactables: [],
      anim: [],
    };
  };
  /** Anchor: interior anchors in LOCAL coords when local=true (default for interior contexts). */
  K.anchor = function (ctx, name, x, y, z, local) {
    const v =
      local === false
        ? new THREE.Vector3(x, y, z)
        : new THREE.Vector3(x + ctx.O.x, y + ctx.O.y, z + ctx.O.z);
    ctx.anchors[name] = v;
    return v;
  };
  /** Prop/container spawned on newGame/loaded (local coords unless world:true). */
  K.loot = function (ctx, type, x, y, z, yaw, o) {
    o = o || {};
    const w = o.world
      ? { x, y, z }
      : { x: x + ctx.O.x, y: y + ctx.O.y, z: z + ctx.O.z };
    ctx.loot.push(Object.assign({ type, yaw: yaw || 0 }, o, w));
  };
  K.skel = function (ctx, x, y, z, yaw, pose, o) {
    K.loot(
      ctx,
      "skeleton",
      x,
      y,
      z,
      yaw,
      Object.assign({ pose: pose || "lying", container: false }, o || {}),
    );
  };
  /** Note / tape reel pickup (static, persisted by rpg). def: {name, title, text, type, learn?: lockId|[lockIds]} */
  K.note = function (ctx, id, x, y, z, def, o) {
    const w =
      o && o.world
        ? { x, y, z }
        : { x: x + ctx.O.x, y: y + ctx.O.y, z: z + ctx.O.z };
    ctx.notes.push(Object.assign({ id }, def, w));
  };
  /** Terminal: registered at initDone, prop spawned with the loot. */
  K.terminal = function (ctx, id, x, y, z, yaw, def, mount, o) {
    ctx.terminals.push({ id, def });
    K.loot(
      ctx,
      "terminal",
      x,
      y,
      z,
      yaw,
      Object.assign(
        { terminalId: id, mount: mount || "own_desk", container: false },
        o || {},
      ),
    );
  };
  /** World door (teleport). pos/target WORLD coords. */
  K.door = function (ctx, def) {
    try {
      const d = G.world.addDoor(
        Object.assign({ radius: 1.3, sound: "door_open" }, def),
      );
      ctx.doors.push(d);
      return d;
    } catch (e) {
      G.reportError("poi_village:door " + ctx.id, e);
      return null;
    }
  };
  K.world = (ctx, x, y, z) =>
    new THREE.Vector3(x + ctx.O.x, y + ctx.O.y, z + ctx.O.z);

  /** Safe wrappers around other modules (call time). */
  K.safe = function (where, fn) {
    try {
      return fn();
    } catch (e) {
      G.reportError("poi_village:" + where, e);
      return undefined;
    }
  };
  K.has = (id) =>
    !G.isStub("inventory") && G.inventory.count && G.inventory.count(id) > 0;
  K.give = (id, n, silent) => {
    if (!G.isStub("inventory") && G.inventory.add)
      K.safe("give " + id, () =>
        G.inventory.add(id, n || 1, { silent: !!silent }),
      );
  };
