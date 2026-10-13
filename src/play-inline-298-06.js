// play-inline-298 06 — int
// Lines 1964-2265 of readable/play-inline-298.pretty.js (statement-aligned).
  PM.addBuilder(
    "morgan_library",
    function (PM2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PM.cell("morgan_library");
      const int = buildInterior(cell);
      const O = cell.origin;
      PM.door({
        id: "pm2_morgan_enter",
        pos: V3((MX0 + MX1) / 2, PL + 1.6, FZ - 2.8),
        label: "The Morgan Library",
        verb: "Enter",
        radius: 1.5,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      PM.door({
        id: "pm2_morgan_exit",
        pos: int.exit_door,
        label: "Madison Avenue",
        verb: "Exit",
        radius: 1.4,
        target: { x: ext.door.x, y: ext.door.y + 0.05, z: ext.door.z, yaw: PI },
        sound: "door_open",
      });
      // the secret bookcase: pivots on its centre to reveal the spiral stair tower
      {
        const mesh = new THREE.Group();
        const bk = new THREE.BoxGeometry(2.1, 2.55, 0.3);
        const addPart = (key, geo, x, y, z) => {
          const n = geo.attributes.position.count;
          geo.setAttribute(
            "color",
            new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3),
          );
          const uv = geo.attributes.uv;
          for (let i = 0; i < uv.count; i++)
            uv.setXY(i, (uv.getX(i) * 2.1) / 1.2, (uv.getY(i) * 2.55) / 1.2);
          const mm = new THREE.Mesh(geo, PM.mat(key));
          mm.position.set(x, y, z);
          mesh.add(mm);
        };
        addPart("walnut", bk, 0, 1.275, 0);
        addPart("books", new THREE.BoxGeometry(1.9, 2.3, 0.04), 0, 1.25, -0.17);
        addPart("books", new THREE.BoxGeometry(1.9, 2.3, 0.04), 0, 1.25, 0.17);
        PM.swingDoor({
          id: "pm2_morgan_bookcase",
          x: O.x + 22.3,
          y: O.y + MY,
          z: O.z + 7.1,
          ry: HP,
          w: 2.2,
          h: 2.6,
          t: 0.3,
          mesh,
          pivot: "centre",
          openAngle: 1.35,
          label: "Suspicious Bookcase",
          parent: cell.root,
          sound: "door_open",
          onOpen: () => {
            if (!PM.flag("morgan_bookcase")) {
              PM.setFlag("morgan_bookcase", true);
              PM.xp(25, "Found the hidden stair");
              G.notify(
                "The bookcase swings aside. A spiral stair climbs into the dark.",
              );
            }
          },
        });
      }
      // the West Room vault door (round steel): the combination card / its code, or the Director's teletype release
      {
        const mesh = new THREE.Group();
        const disc = new THREE.CylinderGeometry(1.25, 1.25, 0.35, 24);
        disc.rotateX(HP);
        const mk = (key, g, x, y, z) => {
          const n = g.attributes.position.count;
          g.setAttribute(
            "color",
            new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3),
          );
          const mm = new THREE.Mesh(g, PM.mat(key));
          mm.position.set(x, y, z);
          mesh.add(mm);
        };
        mk("vault_steel", disc, 1.25, 1.3, 0);
        mk("iron", new THREE.TorusGeometry(0.45, 0.05, 6, 16), 1.25, 1.3, 0.22);
        for (let k = 0; k < 3; k++) {
          const g = new THREE.BoxGeometry(0.9, 0.06, 0.06);
          g.rotateZ((k * PI) / 3);
          mk("iron", g, 1.25, 1.3, 0.22);
        }
        mk(
          "brass",
          new THREE.CylinderGeometry(0.12, 0.12, 0.1, 10).rotateX(HP),
          0.6,
          1.3,
          0.22,
        );
        PM.swingDoor({
          id: "pm2_morgan_vault",
          x: O.x - 21.0,
          y: O.y + MY,
          z: O.z - 9.0,
          ry: 0,
          w: 2.5,
          h: 2.6,
          t: 0.4,
          mesh,
          openAngle: 1.45,
          lock: PM.LOCKS.morgan_vault,
          label: "Morgan's Private Vault",
          parent: cell.root,
          sound: "cryo_door",
        });
      }
      const all = Object.assign({}, int, { exterior_entrance: ext.door });
      all.spawn1 = int.rotunda;
      all.spawn2 = int.east_room;
      all.spawn3 = int.study;
      all.spawn4 = int.stacks_w;
      all.spawn5 = int.stacks_c;
      all.spawn6 = int.stacks_e;
      all.loot1 = int.vault_loot;
      all.loot2 = int.upper_tier;
      all.loot3 = int.study_safe;
      all.terminal = int.north_terminal;
      PM.register("morgan_library", root, all, {
        interiorRoot: cell.root,
        interiorKey: "morgan_library",
      });

      // props & pickups
      PM.prop("terminal", {
        x: int.north_terminal.x,
        y: int.north_terminal.y,
        z: int.north_terminal.z,
        yaw: PI,
        terminalId: "pm2_term_morgan",
        id: "pm2_morgan_term",
        name: "Director's Terminal",
      });
      PM.prop("safe", {
        x: int.study_safe.x,
        y: int.study_safe.y + 0.6,
        z: int.study_safe.z + 0.1,
        yaw: PI,
        locked: 0,
        lock: PM.LOCKS.morgan_safe,
        loot: "wall_safe",
        items: [
          ["pm2_reel_greene", 1],
          ["old_dollars", 8],
        ],
        id: "pm2_morgan_study_safe",
        name: "Mr. Morgan's Safe",
      });
      PM.prop("footlocker", {
        x: int.vault_loot.x,
        y: int.vault_loot.y,
        z: int.vault_loot.z,
        yaw: -HP,
        loot: "wall_safe",
        items: [
          ["gold_bar", 1],
          ["book_popular_circuits", 1],
          ["rally_tonic", 2],
          ["prussian_blue", 1],
        ],
        id: "pm2_morgan_vault_chest",
        name: "Rare Book Vault Strongbox",
      });
      PM.prop("footlocker", {
        x: O.x - 17,
        y: O.y + MY,
        z: O.z - 19.3,
        yaw: 0,
        loot: "luggage",
        id: "pm2_morgan_treasure",
        name: "Morgan's Curio Chest",
      });
      PM.prop("desk", {
        x: O.x + 12,
        y: O.y + MY + T3,
        z: O.z + 8.2,
        yaw: 0,
        loot: "books",
        id: "pm2_morgan_tier_desk",
        name: "Reading Desk",
      });
      PM.prop("first_aid", {
        x: O.x + 25.7,
        y: O.y + BY + 1.4,
        z: O.z - 8,
        yaw: -HP,
        loot: "first_aid",
        id: "pm2_morgan_stacks_aid",
        name: "First Aid Box",
      });
      PM.prop("file_cabinet", {
        x: O.x + 4.8,
        y: O.y + MY,
        z: O.z - 19.2,
        yaw: 0,
        loot: "file_cabinet",
        id: "pm2_morgan_files",
        name: "Acquisitions Files",
      });
      PM.pickup("pm2_gutenberg", 1, V3(int.bible.x, int.bible.y, int.bible.z));
      PM.pickup(
        "pm2_morgan_combo",
        1,
        V3(int.combo_note.x, int.combo_note.y, int.combo_note.z),
      );
      PM.pickup(
        "pm2_morgan_glasses",
        1,
        V3(O.x + 16, O.y + MY + T3 + 0.05, O.z - 8.1),
      );
      PM.pickup(
        "book_bellevue_manual",
        1,
        V3(O.x + 9, O.y + MY + T2 + 0.05, O.z + 8.2),
      );
      PM.pickup("pm2_note_page", 1, V3(O.x + 20.4, O.y + MY + 0.82, O.z + 0.2));
      PM.pickup("prussian_blue", 1, V3(O.x - 13, O.y + BY + 0.05, O.z - 12));

      // hostiles: named Maniacs + Dewey, the night librarian (a Maniac Bruiser)
      const MAN = {
        type: "maniac",
        faction: "maniacs",
        hostile: true,
        ai: "guard",
        noRespawn: true,
      };
      const at = (a, dx, dz) => ({
        x: a.x + (dx || 0),
        y: a.y + 0.05,
        z: a.z + (dz || 0),
      });
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_dewey",
          type: "maniac_bruiser",
          name: "Dewey, the Night Librarian",
          level: 10,
          hp: 320,
          pos: at(int.boss),
          yaw: PI,
          home: { x: int.boss.x, z: int.boss.z, r: 6 },
          when: () => !PM.flag("morgan_dewey_dead"),
          barks: ["Shhhhhh...", "[a low, rattling hiss]"],
          onDeath: () => {
            PM.setFlag("morgan_dewey_dead", true);
          },
        }),
      );
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_borrower",
          name: "The Borrower",
          level: 6,
          pos: at(int.east_room, 3, -3),
          home: { x: int.east_room.x, z: int.east_room.z, r: 7 },
        }),
      );
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_overdue",
          name: "Overdue",
          level: 6,
          pos: at(int.stacks_c),
          home: { x: int.stacks_c.x, z: int.stacks_c.z, r: 8 },
        }),
      );
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_latefee",
          name: "Late Fee",
          level: 5,
          pos: at(int.study, -3, 3),
          home: { x: int.study.x, z: int.study.z, r: 6 },
        }),
      );
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_reader",
          name: "Silent Reader",
          level: 6,
          pos: at(int.upper_tier, 2, 0.3),
          home: { x: int.upper_tier.x, z: int.upper_tier.z, r: 5 },
        }),
      );
    },
    30,
  );
