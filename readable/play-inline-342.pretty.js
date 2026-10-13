/* src/poi_civic/07_gates.js */
/* =====================================================================
 * NEW RAD CITY — poi_civic / 07_gates.js
 * Openable barriers (cell doors, armory cage, crypt grilles): a small
 * separate mesh + one collider + an interactable. Opening is saved as a
 * PC.state flag and re-applied on newGame / load.
 *   K.gate(ctx, def) → gate record
 *     def: {id, flag, label, x, z (local centre), w (along), axis 'x'|'z',
 *           y0, h, lock ({id, key?, code?, hint} — a G.locks spec; omit for
 *           an unlocked barrier), terminalOnly (released from a terminal),
 *           style 'bars'|'cage'|'grille'|'strongroom'|'barricade',
 *           slide (m; default w), tint, onOpen(ctx), lockedMsg}
 *   K.gateOpen(ctx, id, silent) / K.gatesSync(ctx)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PC = G._pc;
  const K = PC.kit;

  K.gate = function (ctx, def) {
    const O = ctx.O;
    const g = Object.assign(
      { w: 1.2, axis: "x", y0: 0, h: 2.3, lock: null, style: "bars" },
      def,
    );
    if (g.lock)
      K.regLock(Object.assign({ label: g.label, kind: "door" }, g.lock));
    const b = K.builder({
      name: "gate_" + g.id,
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: ctx.gateAmb || [0.55, 0.52, 0.48],
      grime: 0.3,
    });
    // build in gate-local space (centre at origin, along +x), then place the group
    const hw = g.w / 2,
      H = g.h;
    const solid = g.style === "strongroom" || g.style === "barricade";
    const mat = solid ? "metal_dark" : "black_iron";
    const tint =
      g.tint || (g.style === "cage" ? [0.55, 0.55, 0.52] : [0.3, 0.29, 0.27]);
    if (g.style === "barricade") {
      // a pair of oak doors wedged shut with planks and a filing cabinet (solid; slides aside)
      b.box("wood", 0, 0, 0, g.w, H, 0.1, {
        tint: [0.42, 0.32, 0.22],
        faces: "nsewtb",
      });
      for (let k = 0; k < 4; k++)
        b.box(
          "wood",
          0,
          0.35 + (k * (H - 0.6)) / 3,
          0.09,
          g.w + 0.3,
          0.16,
          0.05,
          { yaw: k % 2 ? 0.08 : -0.06, tint: [0.55, 0.45, 0.32] },
        );
      b.box("metal", -hw * 0.5, 0, 0.32, 0.5, 1.3, 0.6, {
        tint: [0.42, 0.46, 0.4],
      });
    } else if (g.style === "strongroom") {
      b.box(mat, 0, 0, 0, g.w, H, 0.25, {
        tint: [0.45, 0.47, 0.48],
        faces: "nsewtb",
      });
      for (let k = 0; k < 4; k++)
        b.box(
          "steel",
          -hw + 0.3 + (k * (g.w - 0.6)) / 3,
          H * 0.15,
          0.14,
          0.08,
          H * 0.7,
          0.05,
          { tint: [0.6, 0.6, 0.6] },
        );
      b.cyl("steel", 0, H * 0.5, 0.15, 0.3, 0.3, 0.08, 12);
      b.box("enamel_red", 0, H * 0.82, 0.14, g.w * 0.6, 0.2, 0.02, {
        tint: [0.7, 0.15, 0.1],
      });
    } else {
      b.box(mat, 0, 0, 0, g.w, 0.08, 0.08, { tint });
      b.box(mat, 0, H - 0.08, 0, g.w, 0.08, 0.08, { tint });
      b.box(mat, 0, H * 0.45, 0, g.w, 0.06, 0.06, { tint });
      for (const s of [-1, 1])
        b.box(mat, s * (hw - 0.04), 0, 0, 0.08, H, 0.08, { tint });
      const step = g.style === "cage" ? 0.08 : 0.14;
      for (let x = -hw + step; x < hw - 0.05; x += step) {
        if (g.style === "cage") {
          b.box(mat, x, 0.08, 0, 0.012, H - 0.16, 0.012, { tint });
        } else
          b.cyl(mat, x, 0.08, 0, 0.018, 0.018, H - 0.16, 5, {
            tint,
            top: false,
          });
      }
      if (g.style === "cage")
        for (let y = 0.12; y < H - 0.1; y += 0.08)
          b.box(mat, 0, y, 0, g.w - 0.1, 0.012, 0.012, { tint });
      if (g.style === "grille")
        for (let k = 0; k < 3; k++) {
          const y = 0.6 + k * 0.6;
          b.box(mat, 0, y, 0, g.w, 0.04, 0.04, { tint });
        }
      b.box("brass", hw - 0.2, H * 0.45 - 0.08, 0.06, 0.12, 0.18, 0.06, {
        tint: [0.5, 0.4, 0.25],
      });
    }
    const grp = b.finish(null);
    const wx = O.x + g.x,
      wy = O.y + g.y0,
      wz = O.z + g.z;
    grp.position.set(wx, wy, wz);
    if (g.axis === "z") grp.rotation.y = -Math.PI / 2;
    grp.traverse((m) => {
      m.matrixAutoUpdate = true;
    });
    (ctx.dyn = ctx.dyn || new THREE.Group()).add(grp);
    g.group = grp;
    g.closedPos = grp.position.clone();
    // collider
    const t = 0.25;
    // bars / cage / grille are see-through: tagged like the Tombs' cell bars ('interactable_self'), so you can
    // talk to a prisoner, see and shoot through them; a strongroom door or a barricade is solid
    const tag = solid ? "gate" : "interactable_self";
    g.makeCol = () =>
      g.axis === "x"
        ? G.world.addBox(wx - hw, wy, wz - t / 2, wx + hw, wy + H, wz + t / 2, {
            tag,
            walkable: false,
          })
        : G.world.addBox(wx - t / 2, wy, wz - hw, wx + t / 2, wy + H, wz + hw, {
            tag,
            walkable: false,
          });
    g.col = g.makeCol();
    g.open = false;
    g.ctx = ctx;
    g.ia = G.world.addInteractable({
      pos: new THREE.Vector3(wx, wy + 1.2, wz),
      radius: Math.max(0.8, hw),
      priority: 0.4,
      label: () =>
        g.open
          ? g.label
          : g.label +
            (g.terminalOnly
              ? " [Controlled by terminal]"
              : g.lock && !K.lockIsOpen(g.lock.id)
                ? " [Locked]"
                : ""),
      verb: () =>
        g.open
          ? "Open"
          : g.terminalOnly
            ? "Examine"
            : g.lock && g.lock.key && K.has(g.lock.key)
              ? "Unlock"
              : "Open",
      enabled: () => !g.open && !!ctx.inside,
      onInteract() {
        tryOpen(g);
      },
    });
    (ctx.gates = ctx.gates || {})[g.id] = g;
    return g;
  };

  function tryOpen(g) {
    if (g.open) return;
    if (g.cond && !g.cond()) {
      K.notify(g.condMsg || "It won't open.");
      return;
    }
    if (g.terminalOnly) {
      K.notify(g.lockedMsg || "The lock is controlled from a terminal.");
      K.sfx("ui_error");
      return;
    }
    if (!g.lock || K.lockIsOpen(g.lock.id)) {
      K.gateOpen(g.ctx, g.id);
      return;
    }
    K.lockOpen(g.lock, () => K.gateOpen(g.ctx, g.id));
  }

  const solid = (g) => g.style === "strongroom" || g.style === "barricade";
  /** Open a gate (slides it into the wall and removes the collider). */
  K.gateOpen = function (ctx, id, silent) {
    const g = ctx.gates && ctx.gates[id];
    if (!g || g.open) return;
    g.open = true;
    if (g.flag) PC.setFlag(g.flag, true);
    if (g.col) {
      K.safe("gatecol", () => G.world.removeCollider(g.col));
      g.col = null;
    }
    const slide = g.slide !== undefined ? g.slide : g.w * 0.92;
    if (g.axis === "x") g.group.position.x = g.closedPos.x + slide;
    else g.group.position.z = g.closedPos.z + slide;
    if (solid(g)) g.group.position.y = g.closedPos.y + 0.001;
    if (!silent) {
      K.sfx(
        g.style === "strongroom" ? "cryo_door" : "door_open",
        new THREE.Vector3(g.closedPos.x, g.closedPos.y + 1, g.closedPos.z),
        { volume: 0.6 },
      );
      if (g.onOpen) K.safe("gate onOpen", () => g.onOpen(ctx, g));
    }
  };
  /** Close a gate (reset). */
  K.gateClose = function (ctx, id) {
    const g = ctx.gates && ctx.gates[id];
    if (!g || !g.open) return;
    g.open = false;
    g.group.position.copy(g.closedPos);
    if (!g.col) g.col = g.makeCol();
  };
  /** Re-apply saved state for all gates of a context. */
  K.gatesSync = function (ctx) {
    for (const id in ctx.gates || {}) {
      const g = ctx.gates[id];
      if (g.flag && PC.flag(g.flag)) K.gateOpen(ctx, id, true);
      else K.gateClose(ctx, id);
    }
  };
})();
