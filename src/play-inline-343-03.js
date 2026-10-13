// play-inline-343 03 — player
// Lines 357-511 of readable/play-inline-343.pretty.js (statement-aligned).
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
