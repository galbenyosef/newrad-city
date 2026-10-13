/* src/poi_civic/08_traps.js */
/* =====================================================================
 * NEW RAD CITY — poi_civic / 08_traps.js
 * Dungeon traps (shared by the three interiors):
 *   tripwire  — a wire across a doorway at shin height, wired to a
 *               GRENADE BOUQUET (three frags taped to a pipe). Walking
 *               through it clicks, 0.9 s later the bouquet goes off;
 *               jumping over it does not trip it. Disarm (E) → 3 frag
 *               grenades.
 *   beartrap  — rusty jaws in the rubble: step in it and it bites
 *               (damage, leg hit). Disarm (E) springs it with a stick.
 *   mine      — frag mine: beeps when you come within 2.4 m, explodes
 *               1.6 s later unless you disarm it while it beeps (E) →
 *               the mine goes into your pockets.
 *   gas       — a sheared gas main hissing into a room (yellow-green
 *               haze): FIRING A GUN inside the cloud ignites it. Close
 *               the valve (E) to make the room safe.
 * State per trap in PC.state ('trap_<id>' = armed | disarmed | tripped),
 * re-applied on newGame / load. Traps only tick while the player is in
 * that interior cell.
 *   K.trap(ctx, def)  def: {id, kind, a:[x,y,z], c:[x,y,z] (tripwire, local),
 *                            pos:[x,y,z] (local), bouquet:[x,y,z], r (gas radius),
 *                            valve:[x,y,z], valveYaw, dmg}
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PC = G._pc;
  const K = PC.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  const state = (t) => PC.flag("trap_" + t.id) || "armed";
  const armed = (t) => state(t) === "armed";

  /** Small lit builder for a trap part (placed in world space). */
  function mk(ctx, name) {
    return K.builder({
      name: "trap_" + name,
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: ctx.gateAmb || [0.55, 0.52, 0.48],
      grime: 0.3,
    });
  }
  function place(ctx, b, x, y, z) {
    const g = b.finish(null);
    g.position.set(x, y, z);
    g.traverse((m) => {
      m.matrixAutoUpdate = true;
    });
    (ctx.dyn = ctx.dyn || new THREE.Group()).add(g);
    return g;
  }

  /** Grenade bouquet: three frags taped round a stub of pipe (local origin = base). */
  function bouquet(b) {
    b.pipe("rust", 0, 0, 0, 0, 0.34, 0, 0.022, 6, { tint: [0.5, 0.4, 0.32] });
    for (let k = 0; k < 3; k++) {
      const a = (k * PI * 2) / 3,
        gx = Math.cos(a) * 0.06,
        gz = Math.sin(a) * 0.06;
      b.geo("paint_green", K.sphereGeo(), {
        x: gx,
        y: 0.2,
        z: gz,
        sx: 0.045,
        sy: 0.058,
        sz: 0.045,
        tint: [0.85, 0.85, 0.7],
      });
      b.cyl("metal", gx, 0.25, gz, 0.014, 0.014, 0.03, 5, {
        tint: [0.6, 0.6, 0.55],
      });
      b.box("metal", gx + 0.02, 0.2, gz, 0.012, 0.08, 0.02, {
        tint: [0.55, 0.55, 0.5],
      }); // spoon
    }
    b.cyl("fabric", 0, 0.16, 0, 0.085, 0.085, 0.07, 10, {
      tint: [0.55, 0.52, 0.42],
      top: false,
    }); // duct tape band
    b.cyl("fabric", 0, 0.26, 0, 0.083, 0.083, 0.03, 10, {
      tint: [0.55, 0.52, 0.42],
      top: false,
    });
  }
  function jaws(b, open) {
    b.cyl("rust", 0, 0.005, 0, 0.21, 0.21, 0.02, 14, {
      tint: [0.5, 0.36, 0.26],
    });
    b.cyl("rust", 0, 0.02, 0, 0.05, 0.05, 0.035, 8, { tint: [0.6, 0.6, 0.55] });
    for (const s of [-1, 1]) {
      b.geo("rust", new THREE.TorusGeometry(0.2, 0.013, 4, 14, PI), {
        x: 0,
        y: open ? 0.025 : 0.13,
        z: open ? s * 0.02 : 0,
        rx: open ? s * HP * 0.98 : s * 0.22,
        tint: [0.55, 0.4, 0.3],
      });
      for (let k = 1; k < 8; k++) {
        const a = (k / 8) * PI,
          lx = Math.cos(a) * 0.2;
        const ly = open ? 0.03 : 0.13 + Math.sin(a) * 0.18;
        const lz = open
          ? s * (0.02 + Math.sin(a) * 0.2)
          : s * Math.sin(a) * 0.05;
        b.box(
          "rust",
          lx,
          ly,
          lz,
          0.012,
          open ? 0.045 : 0.012,
          open ? 0.012 : 0.04,
          { tint: [0.6, 0.45, 0.32] },
        );
      }
    }
    b.box("rust", 0.18, 0.01, 0, 0.18, 0.02, 0.04, { tint: [0.5, 0.36, 0.26] }); // spring arm
    for (let k = 0; k < 5; k++)
      b.box(
        "black_iron",
        0.32 + k * 0.07,
        0.01,
        0.05 + k * 0.03,
        0.06,
        0.02,
        0.025,
        { yaw: k % 2 ? 0.5 : -0.3, tint: [0.4, 0.38, 0.35] },
      ); // chain
  }

  K.trap = function (ctx, def) {
    const O = ctx.O;
    const t = Object.assign({ dmg: 0 }, def);
    const W = (p) => V(O.x + p[0], O.y + p[1], O.z + p[2]);
    t.ctx = ctx;
    if (t.kind === "tripwire") {
      t.A = W(t.a);
      t.C = W(t.c);
      t.B = W(t.bouquet || t.a);
      // wire (stretched along x in local, rotated into place)
      const b = mk(ctx, t.id + "_w");
      const dx = t.C.x - t.A.x,
        dz = t.C.z - t.A.z,
        len = Math.hypot(dx, dz);
      b.box("steel", len / 2, -0.004, 0, len, 0.008, 0.008, {
        tint: [0.85, 0.85, 0.8],
      });
      for (const e of [0, len]) {
        b.box("rust", e, -0.06, 0, 0.03, 0.12, 0.03, {
          tint: [0.45, 0.35, 0.28],
        });
      }
      t.gWire = place(ctx, b, t.A.x, t.A.y, t.A.z);
      t.gWire.rotation.y = -Math.atan2(dz, dx);
      const bb = mk(ctx, t.id + "_b");
      bouquet(bb);
      t.gBouquet = place(ctx, bb, t.B.x, t.B.y, t.B.z);
      t.mid = t.A.clone().lerp(t.C, 0.5);
      t.dmg = t.dmg || 70;
      t.radius = 4.5;
    } else if (t.kind === "beartrap") {
      t.P = W(t.pos);
      const bo = mk(ctx, t.id + "_o");
      jaws(bo, true);
      bo.glow(0.12, 0.06, 0.1, [0.3, 0.27, 0.22], 0.4);
      t.gOpen = place(ctx, bo, t.P.x, t.P.y, t.P.z); // a glint on the teeth, so a careful player can spot it
      const bs = mk(ctx, t.id + "_s");
      jaws(bs, false);
      t.gShut = place(ctx, bs, t.P.x, t.P.y, t.P.z);
      t.gOpen.rotation.y = t.gShut.rotation.y = t.yaw || 0;
      t.mid = t.P.clone();
      t.dmg = t.dmg || 25;
    } else if (t.kind === "mine") {
      t.P = W(t.pos);
      const b = mk(ctx, t.id + "_m");
      b.cyl("paint_green", 0, 0, 0, 0.13, 0.12, 0.06, 12, {
        tint: [0.8, 0.8, 0.7],
      });
      b.cyl("metal", 0, 0.06, 0, 0.04, 0.04, 0.02, 8, {
        tint: [0.55, 0.55, 0.5],
      });
      b.geo("lamp", K.sphereGeo(), {
        x: 0.07,
        y: 0.065,
        z: 0,
        s: 0.014,
        tint: [1, 0.15, 0.1],
      });
      t.gMine = place(ctx, b, t.P.x, t.P.y, t.P.z);
      t.mid = t.P.clone();
      t.dmg = t.dmg || 80;
      t.radius = 4;
    } else if (t.kind === "gas") {
      t.P = W(t.pos);
      t.VP = W(t.valve || t.pos);
      // the haze: overlapping faint glow sprites filling the room
      const b = mk(ctx, t.id + "_g");
      const r = K.rng("gas" + t.id),
        R = t.r || 4;
      for (let k = 0; k < 16; k++) {
        const a = r() * PI * 2,
          d = Math.sqrt(r()) * R * 0.85;
        b.glow(
          Math.cos(a) * d,
          0.3 + r() * 1.4,
          Math.sin(a) * d,
          [0.2, 0.23, 0.09],
          2.6 + r() * 1.6,
        );
      }
      for (let k = 0; k < 6; k++)
        b.glow(
          (r() - 0.5) * 0.6,
          0.2 + k * 0.25,
          (r() - 0.5) * 0.6,
          [0.55, 0.6, 0.3],
          1.1,
        ); // the jet at the break
      t.gHaze = place(ctx, b, t.P.x, t.P.y, t.P.z);
      // the sheared gas main itself (always there): floor stub + hanging upper run with torn, flared ends
      const bp = mk(ctx, t.id + "_p"),
        top = t.ceil || 3.3;
      bp.pipe("paint_yellow", 0, 0, 0, 0, 0.95, 0, 0.07, 10, {
        tint: [0.8, 0.7, 0.45],
      });
      bp.cyl("rust", 0, 0.95, 0, 0.09, 0.075, 0.06, 10, {
        tint: [0.6, 0.4, 0.3],
      });
      bp.pipe("paint_yellow", 0, 1.32, 0.02, 0.03, top, 0, 0.07, 10, {
        tint: [0.8, 0.7, 0.45],
      });
      bp.cyl("rust", 0.01, 1.28, 0.02, 0.075, 0.095, 0.06, 10, {
        tint: [0.6, 0.4, 0.3],
      });
      bp.box("metal", 0, 0, 0, 0.3, 0.05, 0.3, { tint: [0.45, 0.45, 0.42] });
      bp.plate(
        "art",
        0.08,
        0.6,
        0,
        1,
        0,
        0.1,
        0.3,
        K.signCell("pc_trap_gas", "GAS", 64, 160, {
          bg: "#d8b030",
          fg: "#1a1a1a",
          font: '"Arial Black", sans-serif',
        }),
        { off: 0.001 },
      );
      t.gPipe = place(ctx, bp, t.P.x, t.P.y, t.P.z);
      // valve wheel (on the wall next to the break)
      const bv = mk(ctx, t.id + "_v");
      bv.pipe("rust", 0, 0, 0, 0, 0, 0.25, 0.05, 8, { tint: [0.6, 0.35, 0.2] });
      bv.geo("paint_red", new THREE.TorusGeometry(0.16, 0.02, 5, 14), {
        x: 0,
        y: 0,
        z: 0.27,
      });
      for (let k = 0; k < 3; k++) {
        const a = (k * PI) / 3,
          cx = Math.cos(a) * 0.16,
          cy = Math.sin(a) * 0.16;
        bv.pipe("paint_red", -cx, -cy, 0.27, cx, cy, 0.27, 0.012, 5);
      }
      bv.cyl("metal", 0, -0.03, 0.27, 0.03, 0.03, 0.06, 8, {
        tint: [0.6, 0.6, 0.55],
      });
      t.gValve = place(ctx, bv, t.VP.x, t.VP.y, t.VP.z);
      t.gValve.rotation.y = t.valveYaw || 0;
      t.mid = t.P.clone();
      t.dmg = t.dmg || 90;
      t.radius = (t.r || 4) + 1.5;
    }
    // disarm interactable
    const label =
      t.label ||
      {
        tripwire: "Tripwire (Grenade Bouquet)",
        beartrap: "Bear Trap",
        mine: "Frag Mine",
        gas: "Gas Main Valve",
      }[t.kind];
    const iaPos =
      t.kind === "tripwire"
        ? t.B.clone().add(V(0, 0.25, 0))
        : t.kind === "gas"
          ? t.VP.clone()
          : t.mid.clone().add(V(0, 0.12, 0));
    t.ia = G.world.addInteractable({
      pos: iaPos,
      radius: 0.55,
      range: 2.6,
      priority: 2,
      label,
      verb: t.kind === "gas" ? "Close" : "Disarm",
      enabled: () => !!ctx.inside && armed(t),
      onInteract() {
        disarm(t);
      },
    });
    (ctx.traps = ctx.traps || []).push(t);
    sync(t);
    return t;
  };

  function sync(t) {
    const s = state(t),
      live = s === "armed";
    if (t.kind === "tripwire") {
      t.gWire.visible = live;
      t.gBouquet.visible = s !== "tripped" && s !== "disarmed";
    } else if (t.kind === "beartrap") {
      t.gOpen.visible = live;
      t.gShut.visible = !live;
    } else if (t.kind === "mine") t.gMine.visible = live;
    else if (t.kind === "gas") {
      t.gHaze.visible = live;
      t.gValve.rotation.z = live ? 0 : PI / 3;
    }
    t.fuse = 0;
    t.beep = 0;
  }
  K.trapsSync = function (ctx) {
    for (const t of ctx.traps || []) sync(t);
  };

  function disarm(t) {
    if (!armed(t)) return;
    PC.setFlag("trap_" + t.id, "disarmed");
    if (t.kind === "tripwire") {
      K.give("frag_grenade", 3);
      K.notify("Tripwire disarmed. You pocket the grenade bouquet.");
    } else if (t.kind === "beartrap")
      K.notify(
        "You spring the bear trap with a length of pipe. It bites clean through.",
      );
    else if (t.kind === "mine") {
      K.give("frag_mine", 1);
      K.notify("Frag Mine disarmed.");
    } else if (t.kind === "gas")
      K.notify("You wrench the valve shut. The hissing dies away.");
    K.sfx(t.kind === "beartrap" ? "melee_hit" : "ui_select", t.mid, {
      volume: 0.7,
    });
    K.xp(t.kind === "gas" ? 15 : 10, "Trap disarmed");
    sync(t);
  }

  function boom(t, at, dmg, radius) {
    const p = at || t.mid;
    if (!G.isStub("combat") && G.combat.explode) {
      K.safe("trap explode", () =>
        G.combat.explode(p.clone(), radius, dmg, {
          source: "trap",
          kind: "normal",
        }),
      );
      return;
    }
    K.safe("trap fx", () => {
      if (!G.isStub("fx") && G.fx.explosion)
        G.fx.explosion(p.clone(), radius, "normal");
    });
    K.sfx("explosion", p);
    const d = G.player.pos.distanceTo(p);
    if (d < radius)
      K.safe("trap dmg", () =>
        G.player.damage(dmg * (1 - (d / radius) * 0.7), {
          type: "explosive",
          source: "trap",
        }),
      );
  }
  function trip(t) {
    PC.setFlag("trap_" + t.id, "tripped");
    if (t.kind === "tripwire") {
      K.sfx("empty_click", t.B, { volume: 1 });
      K.notify("*click*");
      t.gWire.visible = false;
      t.fuse = 0.9;
      t.fuseAt = t.B.clone();
    } else if (t.kind === "beartrap") {
      K.sfx("melee_hit", t.P, { volume: 1 });
      K.safe("trap bite", () =>
        G.player.damage(t.dmg, {
          type: "melee",
          source: "trap",
          part: "leftLeg",
        }),
      );
      K.safe("trap shake", () => G.player.shake && G.player.shake(0.4, 0.3));
      K.notify("SNAP! A bear trap bites into your leg.");
      t.gOpen.visible = false;
      t.gShut.visible = true;
    } else if (t.kind === "gas") {
      t.gHaze.visible = false;
      boom(t, G.player.pos.clone().add(V(0, 1, 0)), t.dmg, t.radius);
      K.safe("trap fire", () => {
        if (!G.isStub("fx") && G.fx.explosion)
          G.fx.explosion(t.P.clone(), (t.r || 4) + 1, "normal");
      });
      K.notify("The gas ignites!");
    }
  }

  // ---- per-frame: only for the cell the player is in ----
  const _prev = new THREE.Vector3();
  let havePrev = false;
  function segCross(ax, az, bx, bz, cx, cz, dx, dz) {
    const d1x = bx - ax,
      d1z = bz - az,
      d2x = dx - cx,
      d2z = dz - cz;
    const den = d1x * d2z - d1z * d2x;
    if (Math.abs(den) < 1e-9) return false;
    const s = ((cx - ax) * d2z - (cz - az) * d2x) / den,
      u = ((cx - ax) * d1z - (cz - az) * d1x) / den;
    return s >= 0 && s <= 1 && u >= 0 && u <= 1;
  }
  PC.trapsUpdate = function (dt) {
    const P = G.player;
    if (!P || !P.pos) return;
    const p = P.pos;
    for (const ctx of PC.ctxs || []) {
      if (!ctx.inside || !ctx.traps) continue;
      for (const t of ctx.traps) {
        // fuses run even after the trap left the 'armed' state
        if (t.fuse > 0) {
          t.fuse -= dt;
          if (t.fuse <= 0) {
            t.fuse = 0;
            if (t.gBouquet) t.gBouquet.visible = false;
            if (t.gMine) t.gMine.visible = false;
            boom(t, t.fuseAt || t.mid, t.dmg, t.radius);
          }
          continue;
        }
        if (!armed(t) || !G.worldRunning || !G.worldRunning()) continue;
        if (P.noclip || (G.cheat && G.cheat.noclip)) continue;
        if (t.kind === "tripwire") {
          // feet below the wire (not jumping over it) and the step crosses the wire
          if (
            havePrev &&
            p.y < t.A.y - 0.05 &&
            p.y > t.A.y - 1.2 &&
            segCross(_prev.x, _prev.z, p.x, p.z, t.A.x, t.A.z, t.C.x, t.C.z)
          )
            trip(t);
        } else if (t.kind === "beartrap") {
          if (
            Math.abs(p.y - t.P.y) < 0.4 &&
            Math.hypot(p.x - t.P.x, p.z - t.P.z) < 0.34
          )
            trip(t);
        } else if (t.kind === "mine") {
          const d = Math.hypot(p.x - t.P.x, p.z - t.P.z);
          if (t.beep > 0) {
            t.beep -= dt;
            t.bt = (t.bt || 0) - dt;
            if (t.bt <= 0) {
              t.bt = Math.max(0.12, t.beep * 0.25);
              K.sfx("robot_beep", t.P, { volume: 0.6, pitch: 1.6 });
            }
            if (t.beep <= 0) {
              PC.setFlag("trap_" + t.id, "tripped");
              t.gMine.visible = false;
              boom(t, t.P, t.dmg, t.radius);
            }
          } else if (d < 2.4 && Math.abs(p.y - t.P.y) < 1.5) {
            t.beep = 1.6;
            t.bt = 0;
          }
        }
      }
    }
    _prev.copy(p);
    havePrev = true;
  };
  /** Gas: a gunshot inside the cloud ignites it. */
  G.events.on("weaponFired", (def) => {
    try {
      const w = def && (def.weapon || def);
      const skill = w && w.skill;
      if (skill === "melee") return;
      const p = G.player.pos;
      for (const ctx of PC.ctxs || []) {
        if (!ctx.inside || !ctx.traps) continue;
        for (const t of ctx.traps)
          if (
            t.kind === "gas" &&
            armed(t) &&
            Math.hypot(p.x - t.P.x, p.z - t.P.z) < (t.r || 4) &&
            Math.abs(p.y - t.P.y) < 2.5
          )
            trip(t);
      }
    } catch (e) {
      G.reportError("poi_civic:gas", e);
    }
  });
  G.events.on("teleport", () => {
    havePrev = false;
  });
})();
