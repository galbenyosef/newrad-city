// play-inline-358 09 — kind
// Lines 2167-2434 of readable/play-inline-358.pretty.js (statement-aligned).
  PF.trap = function (def) {
    const t = Object.assign({ dmg: 40, fuse: -1 }, def);
    const mk = (name) => {
      const mb = PF.batch("trap_" + t.id + name);
      mb.ground = t.floorY;
      mb.aoH = 1;
      mb.setLights([], 0xb0a898, 0.45);
      return mb;
    };
    const armedB = mk("a"),
      sprungB = t.kind === "beartrap" ? mk("s") : null;
    const a = t.a,
      c = t.c;
    if (t.kind === "tripwire" || t.kind === "chime") {
      armedB.rod("steel", a, c, 0.005, 3, { noAO: true, grime: 0 });
      for (const p of [a, c])
        armedB.cyl(
          "iron",
          p.x,
          t.floorY,
          p.z,
          0.015,
          0.02,
          p.y - t.floorY + 0.08,
          4,
          { hSeg: 1 },
        ); // stakes
      if (t.kind === "tripwire") {
        const q = t.bouquet || a;
        for (let k = 0; k < 3; k++) {
          // grenade bouquet: three frags wired to the stake
          const gx = q.x + Math.cos(k * 2.1) * 0.07,
            gz = q.z + Math.sin(k * 2.1) * 0.07;
          armedB.sphere("army", gx, q.y + 0.02, gz, 0.045, {
            ws: 7,
            hs: 5,
            sy: 1.25,
            noAO: true,
          });
          armedB.cyl("iron", gx, q.y + 0.07, gz, 0.012, 0.012, 0.03, 5, {
            hSeg: 1,
          });
        }
        armedB.cyl("rope", q.x, q.y - 0.01, q.z, 0.08, 0.08, 0.05, 8, {
          hSeg: 1,
          open: true,
        });
      } else {
        const n = 7;
        for (let k = 1; k < n; k++) {
          // tin cans strung along the wire
          const p = a.clone().lerp(c, k / n);
          p.y -= 0.12 + Math.sin((k / n) * PI) * 0.05;
          armedB.cyl(
            k % 2 ? "rust" : "chrome",
            p.x,
            p.y,
            p.z,
            0.035,
            0.035,
            0.1,
            7,
            { hSeg: 1, open: true, rz: ((k % 3) - 1) * 0.2 },
          );
          armedB.rod(
            "steel",
            V3(p.x, p.y + 0.1, p.z),
            V3(p.x, p.y + 0.14, p.z),
            0.003,
            3,
            { noAO: true },
          );
        }
      }
    } else if (t.kind === "laser") {
      for (const p of [a, c]) {
        armedB.box("vault_dk", p.x, p.y - 0.12, p.z, 0.14, 0.24, 0.14, {
          seg: false,
        });
      }
      armedB.rod("laser", a, c, 0.008, 4, { noAO: true, grime: 0 });
    } else if (t.kind === "beartrap") {
      const p = t.pos;
      const jaws = (bb, open) => {
        bb.cyl("rust", p.x, t.floorY + 0.005, p.z, 0.2, 0.2, 0.02, 12, {
          hSeg: 1,
          grime: 0.5,
        });
        bb.cyl("rust", p.x, t.floorY + 0.02, p.z, 0.04, 0.04, 0.03, 8, {
          hSeg: 1,
        });
        for (const sg of [-1, 1]) {
          const g = new THREE.TorusGeometry(0.2, 0.012, 4, 12, PI);
          bb.add("rust", g, {
            m: PF.m4(
              p.x,
              t.floorY + (open ? 0.02 : 0.12),
              p.z + (open ? sg * 0.02 : 0),
              0,
              open ? sg * HP * 0.98 : sg * 0.25,
              0,
            ),
          });
          for (let k = 1; k < 8; k++) {
            const aa = (k / 8) * PI,
              lx = Math.cos(aa) * 0.2;
            const ly = open ? 0.02 : 0.12 + Math.sin(aa) * 0.2 * Math.cos(0.25);
            const lz = open
              ? sg * (0.02 + Math.sin(aa) * 0.2)
              : sg * Math.sin(aa) * 0.2 * Math.sin(0.25);
            bb.cyl(
              "rust",
              p.x + lx,
              t.floorY + ly,
              p.z + lz,
              0.001,
              0.012,
              0.05,
              3,
              { hSeg: 1, rx: open ? -sg * HP : -sg * 0.3 },
            );
          }
        }
        bb.rod(
          "iron",
          V3(p.x + 0.2, t.floorY + 0.01, p.z),
          V3(p.x + 0.55, t.floorY + 0.01, p.z + 0.2),
          0.006,
          3,
          { noAO: true },
        ); // chain
      };
      jaws(armedB, true);
      jaws(sprungB, false);
    }
    const gA = new THREE.Group();
    gA.name = "pws_trap_" + t.id;
    armedB.build(gA, { noLOD: true, castShadow: false });
    (t.parent || G.scene).add(gA);
    t.gArmed = gA;
    if (sprungB) {
      const gS = new THREE.Group();
      sprungB.build(gS, { noLOD: true, castShadow: false });
      (t.parent || G.scene).add(gS);
      t.gSprung = gS;
    }
    t.mid = t.pos ? t.pos.clone() : a.clone().lerp(c, 0.5);
    // disarm / disable
    const label =
      t.label ||
      {
        tripwire: "Tripwire",
        beartrap: "Bear Trap",
        laser: "Photoelectric Tripwire",
        chime: "Can Alarm",
      }[t.kind];
    PF.use({
      pos: t.mid.clone().setY(Math.max(t.mid.y, t.floorY + 0.3)),
      radius: 0.6,
      range: 2.4,
      priority: 2,
      label,
      verb: t.kind === "laser" ? "Disable" : "Disarm",
      enabled: () => trapArmed(t),
      onInteract() {
        if (!trapArmed(t)) return;
        if (t.kind === "laser") {
          const sci = PF.live("rpg") ? PF.skill("electronics") : 100;
          if (sci < (t.skill || 35)) {
            G.notify(
              "The emitter's housing is sealed with a tamper circuit. (Electronics " +
                (t.skill || 35) +
                ")",
            );
            PF.sfx("ui_error");
            return;
          }
        }
        PF.setFlag("trap_" + t.id, "disarmed");
        PF.sfx("ui_select", t.mid);
        if (t.kind === "tripwire") {
          PF.inv.add("frag_grenade", 3);
          G.notify("Tripwire disarmed. You pocket the grenade bouquet.");
        } else if (t.kind === "beartrap")
          G.notify(
            "You spring the bear trap with a stick. It bites the stick in half.",
          );
        else if (t.kind === "laser")
          G.notify("Emitter bypassed. The beam flickers and dies.");
        else G.notify("You unhook the cans without a sound.");
        PF.xp(t.kind === "laser" ? 20 : 10, "Trap disarmed");
      },
    });
    PF.trapList.push(t);
    return t;
  };
  function tripTrap(t, p) {
    PF.setFlag("trap_" + t.id, "tripped");
    if (t.kind === "tripwire") {
      PF.sfx("empty_click", t.bouquet || t.a);
      G.notify("*click*", { duration: 1.2 });
      t.fuse = 0.85;
    } else if (t.kind === "beartrap") {
      PF.sfx("melee_hit", t.pos);
      try {
        G.player.damage(t.dmg || 25, { type: "trap" });
      } catch (e) {
        /* optional */
      }
      G.notify("SNAP! A bear trap bites into your leg.");
    } else if (t.kind === "laser") {
      PF.sfx("alarm", t.mid);
      try {
        G.player.damage(t.dmg || 12, { type: "energy" });
      } catch (e) {
        /* optional */
      }
      G.notify("INTRUDER DETECTED. Security response dispatched.");
      if (t.onTrip) PF.safe("trap:onTrip", t.onTrip);
    } else {
      PF.sfx("ricochet", t.mid);
      G.notify("Tin cans clatter along the wire!");
      if (t.onTrip) PF.safe("trap:onTrip", t.onTrip);
    }
    void p;
  }
  PF.updaters.push(function (dt) {
    const p = G.player && G.player.pos;
    for (const t of PF.trapList) {
      const armed = trapArmed(t);
      if (t.gArmed) t.gArmed.visible = armed;
      if (t.gSprung) t.gSprung.visible = trapState(t) === "tripped";
      if (t.fuse > 0) {
        t.fuse -= dt;
        if (t.fuse <= 0) {
          const q = t.bouquet || t.a;
          PF.safe("trap:boom", () => {
            if (PF.live("combat") && G.combat.explode)
              G.combat.explode(q.clone(), 3.4, t.dmg, {
                source: "trap",
                kind: "normal",
              });
            else {
              G.player.damage(t.dmg, { type: "explosive" });
              try {
                G.fx.explosion(q.clone(), 3);
              } catch (e) {
                /* optional */
              }
            }
          });
        }
      }
      if (!armed || !p) continue;
      if (Math.abs(p.x - t.mid.x) > 12 || Math.abs(p.z - t.mid.z) > 12)
        continue;
      if (Math.abs(p.y - t.floorY) > (t.kind === "laser" ? 1.4 : 0.9)) continue;
      const hit =
        t.kind === "beartrap"
          ? (p.x - t.pos.x) ** 2 + (p.z - t.pos.z) ** 2 < 0.45 * 0.45
          : segDist2(p, t.a, t.c) <
            (t.kind === "laser" ? 0.3 * 0.3 : 0.32 * 0.32);
      if (hit) tripTrap(t, p);
    }
  });
  PF.onReset.push(() => {
    for (const t of PF.trapList) t.fuse = -1;
  });
