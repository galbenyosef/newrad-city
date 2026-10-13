// play-inline-332 11 — ctx
// Lines 3122-3471 of readable/play-inline-332.pretty.js (statement-aligned).
  K.signCell = function (key, text, w, h, o) {
    o = o || {};
    return K.paint("art", key, w, h, function (x, X, Y, W, H) {
      if (o.bg !== null) {
        x.fillStyle = o.bg || "#1e2a24";
        x.fillRect(X, Y, W, H);
      }
      if (o.border) {
        x.strokeStyle = o.border;
        x.lineWidth = Math.max(3, H * 0.05);
        x.strokeRect(X + H * 0.06, Y + H * 0.06, W - H * 0.12, H - H * 0.12);
      }
      x.fillStyle = o.fg || "#e8dcb8";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const lines = String(text).split("\n");
      const fs =
        o.size ||
        Math.min(
          (H * 0.62) / lines.length,
          (W * 0.9) / Math.max(1, lines[0].length * 0.55),
        );
      x.font =
        (o.italic ? "italic " : "") +
        (o.weight || "bold") +
        " " +
        Math.round(fs) +
        "px " +
        (o.font || "Georgia, serif");
      if (o.vertical) {
        const chars = String(text).replace(/\n/g, "").split("");
        const step = H / (chars.length + 0.6);
        x.font =
          (o.weight || "bold") +
          " " +
          Math.round(Math.min(step * 0.85, W * 0.8)) +
          "px " +
          (o.font || "Georgia, serif");
        chars.forEach((ch, i) =>
          x.fillText(ch, X + W / 2, Y + step * (i + 0.8)),
        );
      } else {
        lines.forEach((ln, i) =>
          x.fillText(
            ln,
            X + W / 2,
            Y + H / 2 + (i - (lines.length - 1) / 2) * fs * 1.1,
            W * 0.92,
          ),
        );
      }
      if (o.sub) {
        x.font = Math.round(H * 0.14) + "px " + (o.font || "Georgia, serif");
        x.fillText(o.sub, X + W / 2, Y + H * 0.86, W * 0.9);
      }
      if (o.weather !== false) {
        const r = K.rng(key);
        for (let k = 0; k < 40; k++) {
          x.fillStyle = rgba(25, 20, 15, (r() * 0.4).toFixed(2));
          x.fillRect(X + r() * W, Y + r() * H, 2 + r() * 14, 1 + r() * 5);
        }
        K.streaks(x, X, Y, W, H, 6, U.hashStr(key) % 97, 0.3);
      }
    });
  };
  /** Neon cell (additive; black background). o: {color, font, size, vertical, glow, tube} */
  K.neonCell = function (key, text, w, h, o) {
    o = o || {};
    return K.paint("neon", key, w, h, function (x, X, Y, W, H) {
      x.fillStyle = "#000";
      x.fillRect(X, Y, W, H);
      const col = o.color || "#ff3030";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const draw = (blur, lw, style) => {
        x.shadowColor = col;
        x.shadowBlur = blur;
        x.strokeStyle = style;
        x.fillStyle = style;
        x.lineWidth = lw;
        if (o.vertical) {
          const chars = String(text).split("");
          const step = H / (chars.length + 0.4);
          x.font =
            (o.weight || "bold") +
            " " +
            Math.round(Math.min(step * 0.82, W * 0.78)) +
            "px " +
            (o.font || "Arial, sans-serif");
          chars.forEach((ch, i) => {
            if (o.outline) x.strokeText(ch, X + W / 2, Y + step * (i + 0.7));
            else x.fillText(ch, X + W / 2, Y + step * (i + 0.7));
          });
        } else {
          const lines = String(text).split("\n");
          const fs =
            o.size ||
            Math.min(
              (H * 0.66) / lines.length,
              (W * 1.3) / Math.max(1, lines[0].length * 0.62),
            );
          x.font =
            (o.italic ? "italic " : "") +
            (o.weight || "bold") +
            " " +
            Math.round(fs) +
            "px " +
            (o.font || "Arial, sans-serif");
          lines.forEach((ln, i) => {
            const yy = Y + H / 2 + (i - (lines.length - 1) / 2) * fs * 1.08;
            if (o.outline) x.strokeText(ln, X + W / 2, yy, W * 0.94);
            else x.fillText(ln, X + W / 2, yy, W * 0.94);
          });
        }
      };
      draw(Math.max(6, H * 0.12), Math.max(3, H * 0.05), col);
      draw(Math.max(2, H * 0.03), Math.max(1.5, H * 0.02), o.core || "#fff4f0");
      x.shadowBlur = 0;
      if (o.border) {
        x.shadowColor = col;
        x.shadowBlur = 10;
        x.strokeStyle = col;
        x.lineWidth = 4;
        x.strokeRect(X + 8, Y + 8, W - 16, H - 16);
        x.shadowBlur = 0;
      }
      if (o.broken) {
        // dead letters: dark blotches
        const r = K.rng(key + "b");
        for (let k = 0; k < o.broken; k++) {
          x.fillStyle = "rgba(0,0,0,0.85)";
          x.fillRect(X + r() * W, Y, W * 0.08, H);
        }
      }
    });
  };

  // ------------------------------------------------------------------
  // Exterior helpers
  // ------------------------------------------------------------------
  /**
   * Window on a façade plane facing (nx,nz): centre (x,y,z) on the wall surface, w×h.
   * o: {state:'glass'|'broken'|'boarded'|'dark'|'lit', frame, sill, lintel, arch}
   */
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

  // ------------------------------------------------------------------
  // Gameplay records
  // ------------------------------------------------------------------
  /**
   * Per-POI context: {id, key (interior key), O (origin), anchors, loot, notes, terminals, gaps}
   */
  K.ctx = function (id, interiorKey) {
    const L = G.LAYOUT;
    const it = interiorKey ? L.INTERIORS[interiorKey] : null;
    const O = it ? it.origin : { x: 0, y: 0, z: 0 };
    return {
      id,
      key: interiorKey,
      O: { x: O.x, y: O.y || 0, z: O.z },
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
  /** Note / tape reel pickup (static, persisted by rpg). def: {name, title, text, type} */
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
      G.reportError("poi_eastvillage:door " + ctx.id, e);
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
      G.reportError("poi_eastvillage:" + where, e);
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
