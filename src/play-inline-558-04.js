// play-inline-558 04 — the
// Lines 975-1102 of readable/play-inline-558.pretty.js (statement-aligned).
  function buildWorld() {
    if (W.built) return;
    W.built = true;
    const T = N();
    // Notice board: the exterior stream may build the board itself (anchor notice_board) — then only the interaction.
    const nb = T.has(["notice_board"]);
    const bp = nb
      ? T.spot(["notice_board"], null, { maxR: 2 }) || nb
      : T.spot([], {
          near: ["mayor", "mayor_office", "center"],
          dx: 2.6,
          dz: 2.6,
        });
    if (bp) {
      if (!nb) {
        let yaw = 0;
        const c = T.has(["plaza_centre", "center"]);
        if (c) yaw = Math.atan2(c.x - bp.x, c.z - bp.z);
        bp.yaw = yaw;
        W.board = buildBoard(bp);
      }
      G.world.addInteractable({
        pos: L.V3(bp.x, (bp.y || 0) + 1.5, bp.z),
        radius: 1.1,
        label: "Neon Notice Board",
        verb: "Read",
        priority: 0.8,
        onInteract() {
          L.startDialogue("dlg_neon_board", null);
        },
      });
      W.boardPos = bp;
    }
    // Ticker Oracle
    const ob = T.has(["oracle_booth", "ticker_oracle"]);
    const op = ob
      ? { x: ob.x, y: ob.y, z: ob.z, yaw: ob.yaw }
      : T.spot([], {
          near: ["one_times_square", "ball_base", "entrance_south"],
          dx: 3.5,
          dz: 4,
        });
    if (op) {
      if (!ob) {
        const c = T.has(["plaza_centre", "center"]);
        if (c) op.yaw = Math.atan2(c.x - op.x, c.z - op.z);
        W.oracle = buildOracle(op);
      }
      G.world.addInteractable({
        pos: L.V3(op.x, (op.y || 0) + 1.3, op.z),
        radius: 0.9,
        label: "Ticker Oracle",
        verb: "Insert 5 Scrip",
        priority: 0.8,
        onInteract() {
          L.startDialogue("dlg_neon_oracle", null);
        },
      });
      W.oraclePos = op;
    }
    // Bunkhouse storage locker (rented: key lock) — only once the Bunkhouse exists
    if (
      !G.isStub("containers") &&
      G.containers.create &&
      T.place("bunkhouse")
    ) {
      const lk = T.has(["bunk_locker"]);
      const lp =
        lk ||
        T.spot([], {
          near: ["bunk_keeper", "bunk_door", "settler6", "entrance"],
          dx: -1.6,
          dz: 1.2,
        });
      if (lp) {
        try {
          const locksLive = !G.isStub("locks") && !!G.locks;
          const c = G.containers.create({
            id: "neon_bunk_locker",
            name: "Bunkhouse Locker",
            kind: "locker",
            pos: { x: lp.x, y: lp.y, z: lp.z },
            yaw: lp.yaw || 0,
            model: lk ? false : undefined,
            items: [],
            lock: locksLive ? Object.assign({}, LOCKER_LOCK) : undefined,
          });
          // without the locks module the key cannot be checked: the rent flag gates the locker instead
          if (c && c.interactable && !locksLive) {
            const en = c.interactable.enabled;
            c.interactable.enabled = () =>
              !!L.flag("neon_locker") && (!en || en());
          }
          W.locker = c;
        } catch (e) {
          G.reportError("quests:neon locker", e);
        }
      }
    }
  }

  // ==================================================================
  // Dialogues
  // ==================================================================
  L.hook("init", function () {
    L.defineItem({
      id: "q_neon_deadeye",
      name: "Annie's Deadeye Ribbon",
      type: "misc",
      weight: 0,
      value: 50,
      mesh: "paper",
      desc: 'A blue ribbon cut from an old-world county-fair banner. "DEADEYE — ANNIE\'S GALLERY" in shaky red paint. Annie gives you 15% off for the rest of your life. Hers or yours, whichever ends first.',
    });
    L.defineItem({
      id: LOCKER_LOCK.key,
      type: "key",
      name: "Bunkhouse Locker Key",
      weight: 0,
      value: 0,
      quest: true,
      noLoot: true,
      mesh: "key",
      tags: ["key"],
      desc: 'A small steel key on a brass hotel fob stamped "BUNKHOUSE — LOCKER 3". Dottie swears there is no other copy. Dottie also swears she was twenty-nine in 1967.',
    });
  });

