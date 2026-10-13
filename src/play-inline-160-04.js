// play-inline-160 04 — kind
// Lines 417-763 of readable/play-inline-160.pretty.js (statement-aligned).
  const TRAP_DEFS = [
    // ---- Tiffany & Co. (raiders) ----
    {
      id: "tif_chime_gate",
      cell: "tiffany",
      kind: "chime",
      a: [-0.85, 0, 23.5],
      c: [1.95, 0, 23.5],
      h: 0.35,
      spot: 30,
    },
    {
      id: "tif_bouquet_stairs",
      cell: "tiffany",
      kind: "tripwire",
      a: [12.6, 6.8, 11.1],
      c: [15.4, 6.8, 11.1],
      h: 0.22,
      bouquet: [15.55, 6.8, 11.4],
      dmg: 60,
      spot: 45,
    },
    {
      id: "tif_bear_stock",
      cell: "tiffany",
      kind: "beartrap",
      pos: [-10.3, 0, -10],
      spot: 35,
    },
    {
      id: "tif_shotgun_vault",
      cell: "tiffany",
      kind: "shotgun",
      a: [-3.5, -5, -15.9],
      c: [-3.5, -5, -14.1],
      h: 0.25,
      gun: [1.8, -5, -15],
      gunAt: [-4.5, -5, -15],
      dmg: 45,
      spot: 50,
    },
    {
      id: "tif_mine_tunnel1",
      cell: "tiffany",
      kind: "mine",
      pos: [11.8, -5, -10.6],
      dmg: 65,
      spot: 40,
    },
    {
      id: "tif_mine_tunnel2",
      cell: "tiffany",
      kind: "mine",
      pos: [17.6, -5, -11.0],
      dmg: 65,
      spot: 40,
    },
    // ---- The Dakota: Mr. Ruiz the superintendent barricaded his office in March '67 ----
    {
      id: "dak_shotgun_super",
      cell: "dakota",
      kind: "shotgun",
      a: [-11.95, -4.5, 2.6],
      c: [-10.55, -4.5, 2.6],
      h: 0.25,
      gun: [-11.2, -4.5, -1.6],
      gunAt: [-11.2, -4.5, 3.8],
      dmg: 40,
      spot: 45,
    },
    {
      id: "dak_bear_boiler",
      cell: "dakota",
      kind: "beartrap",
      pos: [-14.2, -4.5, 7.7],
      spot: 35,
    },
    {
      id: "dak_chime_nest",
      cell: "dakota",
      kind: "chime",
      a: [-15, 4.5, -3.3],
      c: [-15, 4.5, -5.2],
      h: 0.35,
      spot: 30,
    },
    // ---- AMNH: the Pinkerton crew mined the matriarch's nest before she ate them ----
    // (the hall's door is the hole at x -30..-26 in the south wall z -4; the nest is past the "ripjaw fossil" plinth x -24..-16 z -12..-6)
    {
      id: "amnh_bouquet_dino",
      cell: "amnh",
      kind: "tripwire",
      a: [-33, 6, -7.2],
      c: [-24.15, 6, -7.2],
      h: 0.22,
      bouquet: [-24.4, 6, -6.9],
      dmg: 60,
      spot: 45,
    },
    {
      id: "amnh_mine_nest1",
      cell: "amnh",
      kind: "mine",
      pos: [-26.5, 6, -14.5],
      dmg: 70,
      spot: 40,
    },
    {
      id: "amnh_mine_nest2",
      cell: "amnh",
      kind: "mine",
      pos: [-21, 6, -13.4],
      dmg: 70,
      spot: 40,
    },
    {
      id: "amnh_bear_storage",
      cell: "amnh",
      kind: "beartrap",
      pos: [-30.5, 0, -21.5],
      spot: 35,
    },
  ];

  function makeTrap(def) {
    const key = def.cell;
    const it = P.interiors.find((i) => i.key === key);
    if (!it) return null;
    const t = {
      id: def.id,
      cell: key,
      kind: def.kind,
      dmg: def.dmg || 50,
      spotDC: def.spot || 40,
      fuse: -1,
      beep: 0,
    };
    if (def.pos) {
      const w = W(key, def.pos[0], def.pos[1], def.pos[2]);
      const s = snap(w, 0.3, 1.6);
      if (!s) return null;
      t.pos = s;
      t.floorY = s.y;
      t.mid = s.clone();
    } else {
      const wa = W(key, def.a[0], def.a[1], def.a[2]),
        wc = W(key, def.c[0], def.c[1], def.c[2]);
      const fa = floorOk(wa.x, wa.y, wa.z),
        fc = floorOk(wc.x, wc.y, wc.z);
      if (fa === null || fc === null) return null;
      t.floorY = Math.max(fa, fc);
      t.a = new THREE.Vector3(wa.x, t.floorY + (def.h || 0.25), wa.z);
      t.c = new THREE.Vector3(wc.x, t.floorY + (def.h || 0.25), wc.z);
      t.mid = t.a.clone().lerp(t.c, 0.5);
      if (def.bouquet) {
        const q = W(key, def.bouquet[0], def.bouquet[1], def.bouquet[2]);
        const fq = floorOk(q.x, q.y, q.z);
        t.bouquet = new THREE.Vector3(q.x, fq === null ? t.floorY : fq, q.z);
      }
      if (def.gun) {
        const g = W(key, def.gun[0], def.gun[1], def.gun[2]);
        const s = snap(g, 0.3, 1.2);
        if (!s) return null;
        t.gun = s;
        const at = W(key, def.gunAt[0], def.gunAt[1], def.gunAt[2]);
        t.gunDir = new THREE.Vector3(at.x - s.x, 0, at.z - s.z).normalize();
      }
    }
    buildTrapMeshes(t, it.root);
    // disarm / take interactable
    G.world.addInteractable({
      pos:
        t.kind === "shotgun"
          ? t.gun.clone().setY(t.gun.y + 0.7)
          : t.mid.clone().setY(Math.max(t.mid.y, t.floorY + 0.25)),
      radius: t.kind === "shotgun" ? 0.7 : 0.55,
      range: 2.6,
      priority: 3,
      label: () => (t.kind === "shotgun" ? "Rigged Shotgun" : LABEL[t.kind]),
      verb: () =>
        t.kind === "shotgun" && stateOf(t) === "tripped" ? "Take" : "Disarm",
      enabled: () =>
        stateOf(t) === "armed" ||
        (t.kind === "shotgun" && stateOf(t) === "tripped"),
      onInteract() {
        disarm(t);
      },
    });
    // a second focus point on the wire itself for the shotgun (you meet the wire before the gun)
    if (t.kind === "shotgun")
      G.world.addInteractable({
        pos: t.mid.clone(),
        radius: 0.5,
        range: 2.4,
        priority: 3,
        label: "Tripwire",
        verb: "Disarm",
        enabled: () => stateOf(t) === "armed",
        onInteract() {
          disarm(t);
        },
      });
    traps.push(t);
    return t;
  }

  function disarm(t) {
    const st = stateOf(t);
    if (t.kind === "shotgun" && st === "tripped") {
      TS[t.id] = "taken";
      give("sawed_off_shotgun", 1);
      refresh(t);
      sfx("pickup_weapon", t.gun);
      return;
    }
    if (st !== "armed") return;
    // a beeping mine can still be disarmed — FO3 rules — but it is a close thing with low Explosives
    TS[t.id] = "disarmed";
    t.fuse = -1;
    t.beep = 0;
    sfx("ui_select", t.mid);
    if (t.kind === "tripwire") {
      give("frag_grenade", 3);
      G.notify("You cut the wire and pocket the grenade bouquet.");
    } else if (t.kind === "shotgun") {
      give("sawed_off_shotgun", 1);
      give("ammo_12ga", 4);
      G.notify("You untie the trigger string and take the shotgun.");
    } else if (t.kind === "mine") {
      give("frag_mine", 1);
      G.notify("Frag mine disarmed.");
    } else if (t.kind === "beartrap") {
      sfx("melee_hit", t.pos, { volume: 0.5 });
      G.notify("You spring the bear trap with the butt of your weapon.");
    } else G.notify("You unhook the cans without a sound.");
    refresh(t);
  }

  function refresh(t) {
    const st = stateOf(t);
    if (t.gArmed) t.gArmed.visible = st === "armed";
    if (t.gSprung) t.gSprung.visible = st === "tripped";
    if (t.gGun) t.gGun.visible = st !== "taken" && st !== "disarmed";
    if (t.led) t.led.visible = st === "armed";
  }
  function refreshAll() {
    for (const t of traps) refresh(t);
  }

  function trip(t) {
    TS[t.id] = "tripped";
    const pp = G.player.pos;
    if (t.kind === "tripwire") {
      sfx("empty_click", t.bouquet, { volume: 1 });
      G.notify("*click*");
      t.fuse = 1.1;
      t.boomAt = t.bouquet.clone().setY(t.bouquet.y + 0.2);
    } else if (t.kind === "mine") {
      TS[t.id] = "armed"; // still disarmable while it beeps; becomes 'tripped' when it blows
      t.fuse = 1.25;
      t.beep = 0;
      t.boomAt = t.pos.clone().setY(t.pos.y + 0.15);
      return;
    } else if (t.kind === "beartrap") {
      sfx("melee_hit", t.pos, { volume: 1, pitch: 0.7 });
      try {
        G.player.damage(t.dmg ? Math.min(t.dmg, 22) : 20, {
          type: "melee",
          part: "leftLeg",
          source: null,
        });
      } catch (e) {
        /* */
      }
      try {
        if (live("rpg") && typeof G.rpg.damageLimb === "function")
          G.rpg.damageLimb("leftLeg", 55);
      } catch (e) {
        /* */
      }
      try {
        G.player.shake(0.4, 0.3);
      } catch (e) {
        /* */
      }
      G.notify("SNAP! A bear trap bites into your leg.");
    } else if (t.kind === "shotgun") {
      sfx("empty_click", t.mid);
      const g = t.gun.clone().setY(t.gun.y + 0.7),
        d = t.gunDir;
      setTimeout(() => {
        if (G.state === "title") return;
        sfx("gun_shotgun", g, { volume: 1.2 });
        try {
          if (G.fx && G.fx.muzzleFlash)
            G.fx.muzzleFlash(
              g.clone().addScaledVector(d, 0.45),
              d.clone(),
              "shotgun",
            );
        } catch (e) {
          /* */
        }
        try {
          if (G.fx && G.fx.flash) G.fx.flash(g, 0xffc070, 2.5, 0.08);
        } catch (e) {
          /* */
        }
        const p = G.player.pos,
          to = new THREE.Vector3(p.x - g.x, 0, p.z - g.z),
          dist = to.length();
        to.normalize();
        const inCone =
          dist < 11 && to.dot(d) > 0.9 && Math.abs(p.y - t.floorY) < 1.2;
        let los = true;
        try {
          los =
            !G.world.lineOfSight ||
            G.world.lineOfSight(g, new THREE.Vector3(p.x, p.y + 1.0, p.z));
        } catch (e) {
          los = true;
        }
        if (inCone && los && G.player.alive) {
          const dmg = Math.round(t.dmg * (dist < 4 ? 1 : 0.7));
          try {
            G.player.damage(dmg, {
              type: "ballistic",
              part: Math.random() < 0.5 ? "leftLeg" : "rightLeg",
              source: null,
            });
          } catch (e) {
            /* */
          }
        }
      }, 180);
    } else if (t.kind === "chime") {
      sfx("ricochet", t.mid, { volume: 1, pitch: 1.6 });
      setTimeout(
        () => sfx("ricochet", t.mid, { volume: 0.8, pitch: 1.9 }),
        140,
      );
      G.notify("Tin cans clatter along the wire!");
      alertHouse(t.mid, 32);
    }
    refresh(t);
  }
  /** Everyone hostile within r hears the cans. Uses combat's hearing when it is there, else walks them over. */
