// play-inline-118 19 — build
// Lines 4775-5001 of readable/play-inline-118.pretty.js (statement-aligned).
  K.defineInterior("times_square:neon_cell", function (ctx) {
    const rec = ctx.rec;
    P = ctx.P || K.parts;
    const E = K.neonEntrances;
    if (!E || !G.LAYOUT.INTERIORS || !G.LAYOUT.INTERIORS.neon_interiors) return;
    const O = G.LAYOUT.INTERIORS.neon_interiors.origin;
    K.tsxInit();
    materials();
    paints();
    CELL = new THREE.Group();
    CELL.name = "lma_neon_interiors";
    CELL.visible = false;
    G.scene.add(CELL);
    rec.interiorRoot = CELL;
    rec.interiorKey = "neon_interiors";
    const build = (fn, name) => {
      try {
        return fn(rec, O);
      } catch (e) {
        G.reportError("init:landmarks_a/neon_" + name, e);
        return null;
      }
    };
    const R = {
      clinic: build(clinic, "clinic"),
      gallery: build(gallery, "gallery"),
      robo: build(robo, "robo"),
      pawn: build(pawn, "pawn"),
      opry: build(opry, "opry"),
      oracle: build(oracle, "oracle"),
      mayor: build(mayor, "mayor"),
      power: build(power, "power"),
      depot: build(depot, "depot"),
      bunk: build(bunk, "bunk"),
      barracks: build(barracks, "barracks"),
      club: build(club, "club"),
      speak: build(speakeasy, "speak"),
    };
    const lab = {
      clinic: "Doc Broadway's Clinic",
      gallery: "Ammo Annie's Shooting Gallery",
      robo: "Radio Repair & Robo-Shop",
      pawn: "The Pawn Palace",
      opry: "The Neon Opry",
      oracle: "The Ticker Oracle",
      mayor: "Mayor's Office",
      power: "Neon Power Plant",
      depot: "Neon Freight Depot",
      bunk: "The Bunkhouse Hotel",
      barracks: "Neon Guard Barracks",
      club: "The Cinder Club",
      speak: "Subway — 42 St (closed)",
    };
    for (const k in R) {
      const r = R[k];
      if (!r || !E[k]) continue;
      try {
        if (k === "speak")
          doors(rec, r, E[k], lab[k], {
            lock: K.neonSpeakLock,
            exitLabel: "42nd Street",
          });
        else doors(rec, r, E[k], lab[k], {});
      } catch (e) {
        G.reportError("init:landmarks_a/neon_door_" + k, e);
      }
    }
    // club: the street door sits at the club_door anchor; quests gate it (Big Sal) — nothing else to do here
    // the snipers' nest service stairs (street ↔ roof, both in the world)
    try {
      const n = E.nest,
        nx = Math.sin(n.f),
        nz = Math.cos(n.f);
      G.world.addDoor({
        pos: new THREE.Vector3(n.x + nx * 0.35, 1.5, n.z + nz * 0.35),
        radius: 1.2,
        label: "Snipers' Nest (roof)",
        verb: "Climb to",
        target: { x: -66.6, y: 42.05, z: -264.5, yaw: -PI / 2 },
        sound: "door_open",
      });
      G.world.addDoor({
        pos: new THREE.Vector3(-67.5, 43.4, -264.5),
        radius: 1.2,
        label: "Marquee Market",
        verb: "Go down to",
        target: { x: n.x + nx * 1.7, y: 0, z: n.z + nz * 1.7, yaw: AY(n.f) },
        sound: "door_open",
      });
    } catch (e) {
      G.reportError("init:landmarks_a/neon_nest_doors", e);
    }
    // show only the room the camera is in (and nothing from the street)
    const IX = O.x - 150;
    let last = null;
    K.animate(() => {
      const cam = G.camera;
      if (!cam) return;
      const p = cam.getWorldPosition ? cam.getWorldPosition(_v) : cam.position;
      if (p.x < IX || p.x > O.x + 150 || Math.abs(p.z - O.z) > 150) {
        if (CELL.visible) CELL.visible = false;
        last = null;
        return;
      }
      CELL.visible = true;
      let cur = null;
      for (const r of ROOMS)
        if (
          p.x > r.x0 - 3 &&
          p.x < r.x1 + 3 &&
          p.z > r.z0 - 3 &&
          p.z < r.z1 + 3
        ) {
          cur = r;
          break;
        }
      if (cur === last) return;
      last = cur;
      for (const r of ROOMS) r.grp.visible = !cur || r === cur;
    });
    // walk audit routes (99_main.js, shot/smoke only): arrival → somewhere deep in each room; the two stair halls leg by leg
    const deep = {
      clinic: [-4.5, 2.5],
      gallery: [0, 6.6],
      robo: [0, -1.5],
      pawn: [0, 0.8],
      opry: [0, 1.0],
      oracle: [0, 0.1],
      mayor: [1.0, 0.6],
      depot: [0, 0],
      bunk: [0, -4.0],
      barracks: [-2.0, 0.8],
      club: [0, 0.2],
    };
    for (const k in R) {
      const r = R[k];
      if (!r) continue;
      const a = [r.doorX, r.entryY, r.z1 - 1.5];
      if (deep[k])
        K.walkChecks &&
          K.walkChecks.push({
            label: "Neon " + k + ": arrival → room",
            pts: [a, [r.X(deep[k][0]), 0, r.Z(deep[k][1])], a],
          });
    }
    if (R.speak) {
      const r = R.speak;
      K.walkChecks &&
        K.walkChecks.push({
          label: "Neon speak: landing → stair → platform → bar → back up",
          pts: [
            [r.doorX, 3, r.z1 - 1.5],
            [r.X(-4.4), 3, r.Z(5.4)],
            [r.X(4.6), 0, r.Z(5.4)],
            [r.X(5.9), 0, r.Z(2.6)],
            [r.X(5.8), 0, r.Z(-0.4)],
            [r.X(5.9), 0, r.Z(2.6)],
            [r.X(4.6), 0, r.Z(5.4)],
            [r.X(-4.6), 3, r.Z(5.4)],
            [r.doorX, 3, r.z1 - 1.5],
          ],
        });
    }
    if (R.power) {
      const r = R.power;
      K.walkChecks &&
        K.walkChecks.push({
          label:
            "Neon power: landing → stair → generator floor → panel → back up",
          pts: [
            [r.doorX, 3, r.z1 - 1.5],
            [r.X(3.8), 3, r.Z(6.2)],
            [r.X(-3.4), 0, r.Z(6.2)],
            [r.X(-2.0), 0, r.Z(4.7)],
            [r.X(0.5), 0, r.Z(4.7)],
            [r.X(0.5), 0, r.Z(1.0)],
            [r.X(7.0), 0, r.Z(1.6)],
            [r.X(7.4), 0, r.Z(-1.35)],
            [r.X(0.5), 0, r.Z(1.0)],
            [r.X(0.5), 0, r.Z(4.7)],
            [r.X(-2.0), 0, r.Z(4.7)],
            [r.X(-3.4), 0, r.Z(6.2)],
            [r.X(3.8), 3, r.Z(6.2)],
            [r.doorX, 3, r.z1 - 1.5],
          ],
        });
    }
    if (R.barracks) {
      const r = R.barracks;
      K.walkChecks &&
        K.walkChecks.push({
          label: "Neon barracks: into the armory cage",
          pts: [
            [r.doorX, 0, r.z1 - 1.5],
            [r.X(-3.0), 0, r.Z(0.9)],
            [r.X(6.9), 0, r.Z(0.9)],
            [r.X(7.3), 0, r.Z(-0.9)],
            [r.X(7.3), 0, r.Z(-2.2)],
            [r.X(4.6), 0, r.Z(-2.6)],
          ],
        });
    }
    K.neonRooms = R;
    // public room list (sound: per-room ambience; quests / ambient_life: "is the player inside place X")
    const ROOMLIST = Object.keys(R)
      .filter((k) => R[k])
      .map((k) => {
        const r = R[k];
        return {
          key: k,
          name: lab[k],
          x0: r.x0,
          x1: r.x1,
          z0: r.z0,
          z1: r.z1,
          h: Math.max(r.h, r.o.split ? r.o.split.h2 : 0),
          entrance: { x: r.doorX, y: r.entryY, z: r.z1 - 1.5, yaw: r.entryYaw },
        };
      });
    rec.neonRooms = () => ROOMLIST.slice();
    rec.neonRoomAt = (x, z) => {
      for (const q of ROOMLIST)
        if (x >= q.x0 && x <= q.x1 && z >= q.z0 && z <= q.z1) return q.key;
      return null;
    };
  });
  const _v = new THREE.Vector3();
