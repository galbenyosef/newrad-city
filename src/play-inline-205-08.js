// play-inline-205 08 — int
// Lines 4624-4799 of readable/play-inline-205.pretty.js (statement-aligned).
  PF.addBuilder(
    "trinity_church",
    function (PF2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PF.cell("trinity_church");
      const int = buildInterior(cell, ext);
      // exterior entrance door → narthex
      PF.door({
        id: "pf_tr_enter",
        pos: V3(TX + TW / 2 + 1.0, 1.6, TZ),
        label: "Trinity Church",
        verb: "Enter",
        radius: 1.6,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      // lookout door back into the belfry (placeholder target filled now that the interior exists)
      for (const d of G.world.doors || [])
        if (d.def && d.def.id === "pf_tr_lookout_in")
          d.def.target = PF.lookoutBack;
      // extra anchors for NPCs / combat / quests
      int.refugee1 = PF.anchor(
        int.entrance.x,
        int.entrance.y,
        int.entrance.z - 16,
        0,
      ); // centre aisle (was inside a pew)
      int.refugee2 = PF.anchor(
        int.entrance.x + 3.3,
        int.entrance.y,
        int.entrance.z - 26.2,
        PI,
      ); // (was 0.2 m from the rail collider)
      int.npc2 = int.doctor;
      int.npc3 = int.refugee1;
      int.merchant = int.doctor;
      int.ext_guard = ext.guard1;
      int.loot3 = PF.anchor(
        int.belfry.x + 1.6,
        int.belfry.y,
        int.belfry.z - 5.8,
        0,
      );
      const all = Object.assign({}, int, {
        exterior_entrance: ext.entrance,
        gate: ext.gate,
        hamilton: ext.hamilton,
        lookout: ext.lookout,
        guard1: ext.guard1,
      });
      PF.register("trinity_church", root, all, {
        interiorRoot: cell.root,
        interiorKey: "trinity_church",
      });
      PF.trNpcs(all);

      // persistent props: terminal, safe, containers, notes (interior y is lifted: always build on the anchor's y)
      PF.prop("terminal", {
        x: int.terminal.x,
        y: int.terminal.y,
        z: int.terminal.z,
        yaw: 0,
        terminalId: "pf_tr_parish",
        id: "pf_tr_terminal",
      });
      PF.prop("safe", {
        x: int.safe.x,
        y: int.safe.y + 0.9,
        z: int.safe.z,
        yaw: -HP,
        lock: TR_LOCKS.safe,
        loot: "wall_safe",
        id: "pf_tr_safe",
        name: "Vestry Safe",
        owner: "settlers",
      });
      PF.prop("first_aid", {
        x: int.clinic.x + 1.9,
        y: int.clinic.y + 1.4,
        z: int.clinic.z - 2.6,
        yaw: -HP,
        id: "pf_tr_firstaid",
        owner: "settlers",
      });
      PF.prop("footlocker", {
        x: int.refugee1.x - 5.6,
        y: int.refugee1.y,
        z: int.refugee1.z - 3,
        yaw: HP,
        loot: "footlocker",
        id: "pf_tr_footlocker",
        owner: "settlers",
      });
      PF.prop("ammo_box", {
        x: int.loot_belfry.x,
        y: int.loot_belfry.y,
        z: int.loot_belfry.z,
        yaw: 0,
        loot: "ammo_box",
        id: "pf_tr_belfry_ammo",
      });
      PF.prop("footlocker", {
        x: int.loot1.x + 1.3,
        y: int.loot1.y,
        z: int.loot1.z,
        yaw: HP,
        loot: "skeleton",
        id: "pf_tr_crypt_chest1",
        name: "Parishioner's Trunk",
      });
      PF.prop("footlocker", {
        x: int.nest.x + 3.5,
        y: int.nest.y,
        z: int.nest.z - 3,
        yaw: -HP,
        loot: "raider_stash",
        id: "pf_tr_nest_stash",
        name: "Scavenger's Pack",
      });
      PF.prop("scrip_stash", {
        x: int.loot2.x + 0.2,
        y: int.loot2.y,
        z: int.loot2.z,
        yaw: 0,
        id: "pf_tr_crypt_scrip",
      });
      PF.prop("lamp", {
        x: int.vestry.x - 0.3,
        y: int.vestry.y,
        z: int.vestry.z - 7.0,
        kind: "desk",
        id: "pf_tr_lamp1",
      });
      PF.pickup(
        "pf_note_organist",
        1,
        V3(int.organ.x + 0.5, int.organ.y + 1.15, int.organ.z + 1.6),
      );
      PF.pickup(
        "pf_note_lookout",
        1,
        V3(int.belfry.x - 4.2, int.belfry.y + 0.3, int.belfry.z + 0.6),
      );
      PF.pickup(
        "pf_reel_rector",
        1,
        V3(int.vestry.x - 1.2, int.vestry.y + 0.56, int.vestry.z - 8.6),
      ); // on the rector's cot
      PF.pickup(
        "rally_tonic",
        1,
        V3(int.loot1.x - 0.3, int.loot1.y + 1.1, int.loot1.z + 0.4),
      );
      // the scratching: eerie sounds near the crypt gate at night while the quest is unresolved
      let scratchT = 8;
      PF.updaters.push((dt) => {
        if (PF.flag("tr_breach")) return;
        scratchT -= dt;
        if (scratchT > 0) return;
        scratchT = 9 + Math.random() * 10;
        const p = G.player.pos,
          cd = int.crypt_door;
        if (Math.hypot(p.x - cd.x, p.z - cd.z) < 16 && Math.abs(p.y - cd.y) < 3)
          PF.sfx("maniac_growl", V3(cd.x, cd.y - 3, cd.z), {
            volume: 0.35,
            pitch: 0.7,
          });
      });
    },
    10,
  );
