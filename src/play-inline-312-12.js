// play-inline-312 12 — ctx
// Lines 3521-3814 of readable/play-inline-312.pretty.js (statement-aligned).
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
      G.reportError("poi_herald:door " + ctx.id, e);
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
      G.reportError("poi_herald:" + where, e);
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
  K.take = (id, n) => {
    if (!G.isStub("inventory") && G.inventory.remove)
      K.safe("take " + id, () => G.inventory.remove(id, n || 1));
  };
  K.scrip = (n) => {
    if (!G.isStub("inventory"))
      K.safe("scrip", () =>
        G.inventory.addScrip
          ? G.inventory.addScrip(n)
          : G.inventory.add("scrip", n),
      );
  };
  K.scripCount = () =>
    !G.isStub("inventory") && G.inventory.scrip ? G.inventory.scrip() : 0;
  K.standing = (n, why) => {
    if (!G.isStub("rpg") && G.rpg.addStanding)
      K.safe("standing", () => G.rpg.addStanding(n, why));
  };
  K.xp = (n, why) => {
    if (!G.isStub("rpg") && G.rpg.addXP)
      K.safe("xp", () => G.rpg.addXP(n, why));
  };
  K.skill = (id) => {
    try {
      return !G.isStub("rpg") && G.rpg.skill ? G.rpg.skill(id) : 0;
    } catch (e) {
      return 0;
    }
  };
  K.notify = (t) => {
    try {
      G.notify(t);
    } catch (e) {
      /* */
    }
  };
  K.sfx = (name, pos, o) => {
    try {
      if (!G.isStub("sfx"))
        return G.sfx.play(name, Object.assign({ pos }, o || {}));
    } catch (e) {
      /* */
    }
    return null;
  };
  K.itemExists = (id) => {
    try {
      return !G.isStub("items") && !!(G.items.get && G.items.get(id));
    } catch (e) {
      return false;
    }
  };
  /** Define an item only if missing. */
  K.defineItem = (def) => {
    if (G.isStub("items") || !G.items.define) return;
    if (!K.itemExists(def.id))
      K.safe("item " + def.id, () => G.items.define(def));
  };
  /** Merchant stock: explicit entries that exist + rolled table. */
  K.stock = function (list, table, lvl) {
    const out = [];
    for (const [id, n] of list) if (K.itemExists(id)) out.push([id, n]);
    if (table && !G.isStub("items") && G.items.rollLoot) {
      try {
        const r = G.items.rollLoot(table, lvl || 3);
        if (Array.isArray(r)) for (const e of r) out.push([e[0], e[1]]);
      } catch (e) {
        /* */
      }
    }
    return out;
  };
  K.qflag = (n) => {
    try {
      return !G.isStub("quests") && G.quests.flag
        ? G.quests.flag(n)
        : undefined;
    } catch (e) {
      return undefined;
    }
  };
  K.setQFlag = (n, v) => {
    try {
      if (!G.isStub("quests") && G.quests.setFlag) G.quests.setFlag(n, v);
    } catch (e) {
      /* */
    }
  };
