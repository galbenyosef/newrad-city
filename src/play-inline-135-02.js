// play-inline-135 02 — anchors
// Lines 18-111 of readable/play-inline-135.pretty.js (statement-aligned).
  const LB = G._lb;
  const TAU = Math.PI * 2;
  // command-post teletype: its pages are registered by src/quests under this id
  const CMD_TERMINAL = "liberty_command"; // registered by src/quests/60_finale.js

  LB.interiors.statue_of_liberty = {
    /** Street <-> interior doors. ctx: {W (island local → world), yawFacing, FORT_H, balY}. */
    doors(ctx) {
      const { W, yawFacing, FORT_H, balY } = ctx;
      const INT = G.LAYOUT.INTERIORS.liberty_pedestal.origin;
      // Pedestal door (exterior → interior)
      const [dx, dz] = W(0, 14.7);
      const [ox, oz] = W(0, 18.5);
      const outYaw = yawFacing(ox - dx, oz - dz);
      LB.libertyDoorOut = { x: ox, y: FORT_H + 0.05, z: oz, yaw: outYaw };
      G.world.addDoor({
        pos: new THREE.Vector3(dx, FORT_H + 1.6, dz),
        label: "Statue of Liberty — Pedestal",
        verb: "Enter",
        radius: 1.6,
        target: { x: INT.x, y: INT.y + 0.05, z: INT.z + 12, yaw: 0 },
        sound: "door_open",
      });
      // balcony (exterior, front) arrival point for the gallery door
      const [bx, bz] = W(0, 9.5);
      // face along the balcony (east): straight ahead is only ~0.8 m to the balustrade
      const [bfx, bfz] = W(3, 9.5);
      LB.libertyBalcony = {
        x: bx,
        y: balY + 0.05,
        z: bz,
        yaw: yawFacing(bfx - bx, bfz - bz),
      };
      const [bdx, bdz] = W(0, 7.4);
      G.world.addDoor({
        pos: new THREE.Vector3(bdx, balY + 1.6, bdz),
        label: "Pedestal — Upper Gallery",
        verb: "Enter",
        radius: 1.3,
        target: {
          x: INT.x + 0,
          y: INT.y + 7.05,
          z: INT.z - 14.2,
          yaw: Math.PI,
        },
        sound: "door_open",
      });
    },
    /** The pedestal hall; merges its anchors into the landmark's. ctx: {root, anchors}. */
    hall(ctx) {
      const { root, anchors } = ctx;
      const INT = G.LAYOUT.INTERIORS.liberty_pedestal.origin;
      const ia = buildInterior(LB, root, INT, anchors);
      Object.assign(anchors, ia);
      if (anchors.commander) anchors.commander.yaw = Math.PI; // interior: faces the entrance (south)
    },
    /** Hall props (run inside the landmark's initDone hook, after the fort turrets). ctx: {anchors}. */
    props(ctx) {
      const { anchors } = ctx;
      const fl = anchors.footlocker;
      if (fl)
        LB.spawnProp("footlocker", {
          x: fl.x,
          y: fl.y,
          z: fl.z,
          yaw: 0,
          loot: "continuity_crate",
          owner: "continuity",
          name: "Federal Footlocker",
        });
      const am = anchors.ammo_box;
      if (am)
        LB.spawnProp("ammo_box", {
          x: am.x,
          y: am.y,
          z: am.z,
          yaw: 0,
          loot: "ammo",
        });
      const te = anchors.terminal;
      if (te)
        LB.spawnProp("terminal", {
          x: te.x,
          y: te.y,
          z: te.z,
          yaw: Math.PI / 2,
          terminalId: CMD_TERMINAL,
        });
    },
  };

  // ====================================================================
  // Interior: granite pedestal hall (INTERIORS.liberty_pedestal)
  // ====================================================================
