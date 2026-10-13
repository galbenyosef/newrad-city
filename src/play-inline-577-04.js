// play-inline-577 04 — spot
// Lines 796-962 of readable/play-inline-577.pretty.js (statement-aligned).
  QX.hook("world", function () {
    const k = K();
    const gy = (x, z) => G.world.groundHeight(x, z, 1.5, 0.3);
    // hot-dog carts (the vendors stand on the building side, facing the street)
    k.hotdogCart(
      SPOT.iggyCart.x,
      gy(SPOT.iggyCart.x, SPOT.iggyCart.z),
      SPOT.iggyCart.z,
      0,
      "FOREVER FRANKS\nIGGY'S CONEY ISLAND",
      0xc8c0a8,
      0xb02a1e,
    );
    k.hotdogCart(
      SPOT.mortCart.x,
      gy(SPOT.mortCart.x, SPOT.mortCart.z),
      SPOT.mortCart.z,
      0,
      "FOREVER FRANKS\nMORT'S KOSHER-STYLE",
      0xa8b8b0,
      0x1e5a8a,
    );
    // Scoop's newsstand
    k.newsStand(
      SPOT.scoop.x + 1.2,
      gy(SPOT.scoop.x + 1.2, SPOT.scoop.z + 0.8),
      SPOT.scoop.z + 0.8,
      Math.PI / 2,
    );
    // bus stop (bench faces the avenue, east)
    k.busStop(
      SPOT.busStop.x,
      gy(SPOT.busStop.x, SPOT.busStop.z),
      SPOT.busStop.z,
      -Math.PI / 2,
    );
    // the crashed M42 and its driver
    QX.prop("car", {
      x: SPOT.busWreck.x,
      z: SPOT.busWreck.z,
      yaw: 0.35,
      kind: "bus",
      wreck: true,
      burnt: false,
      persistent: true,
    });
    QX.prop("skeleton", {
      x: SPOT.busWreck.x - 2.6,
      z: SPOT.busWreck.z - 3.5,
      yaw: 1.2,
      pose: "sitting",
      persistent: true,
    });
    // parking meters + impound locker on 5th Avenue
    k.meters(
      SPOT.muni.x - 0.7,
      gy(SPOT.muni.x - 0.7, SPOT.muni.z + 8),
      SPOT.muni.z + 8,
      Math.PI / 2,
      5,
    );
    QX.registerLock(IMPOUND);
    if (QX.live("containers") && G.containers.create) {
      QX.world.impound = QX.safe("impound", () =>
        G.containers.create({
          id: "qx_impound_locker",
          kind: "locker",
          name: "City Impound Locker",
          pos: {
            x: SPOT.impound.x,
            y: gy(SPOT.impound.x, SPOT.impound.z),
            z: SPOT.impound.z,
          },
          yaw: -Math.PI / 2,
          lock: IMPOUND,
          items: [
            [QX.SCRIP_ID, 120],
            ["hunting_rifle", 1],
            ["ammo_308", 18],
            [MED_JET, 2],
            ["motorcycle_helmet", 1],
            [OLD_DOLLARS, 6],
            ["sunglasses", 1],
          ].filter((e) => e[0] === QX.SCRIP_ID || QX.itemExists(e[0])),
        }),
      );
    }
    // Buttons' hiding place: a wrecked taxi
    QX.prop("car", {
      x: SPOT.buttons.x + 2.2,
      z: SPOT.buttons.z - 1.5,
      yaw: 0.5,
      kind: "taxi",
      wreck: true,
      persistent: true,
    });
    // Bixby's stage (audience to the south)
    k.stage(
      SPOT.stage.x,
      gy(SPOT.stage.x, SPOT.stage.z),
      SPOT.stage.z,
      Math.PI,
    );
  });

  // Evil MUNI-7: daily "collections" deposited in the impound locker (max 1 per game day).
  QX.hook("update", function () {
    if (!QX.reached("qx_parking", "done_evil") || !QX.world.impound) return;
    const day = G.time.day | 0;
    if (QX.flag("muni_day") === day) return;
    QX.setFlag("muni_day", day);
    if (QX.dist(SPOT.impound.x, SPOT.impound.z) < 60) return; // don't pop items in front of the player
    QX.safe("collect", () =>
      QX.world.impound.put
        ? QX.world.impound.put(QX.SCRIP_ID, 18 + ((day * 7) % 13))
        : null,
    );
  });

  // ==================================================================
  // Pickups & quest actions
  // ==================================================================
  function spawnPages() {
    SPOT.pages.forEach((p, i) => {
      const n = i + 1;
      if (
        QX.has("qx_script_page_" + n) ||
        QX.flag("bix_page_" + n) ||
        QX.pickups["bix_page_" + n]
      )
        return;
      const s = QX.freeSpot(p.x, p.z, undefined, { maxR: 5 });
      QX.pickup("bix_page_" + n, "qx_script_page_" + n, 1, {
        x: s.x,
        y: s.y + 0.02,
        z: s.z,
      });
    });
  }
  function spawnTimetable() {
    if (
      QX.has("qx_m42_timetable") ||
      QX.flag("got_penn_timetable") ||
      QX.pickups.penn_timetable
    )
      return;
    const s = QX.freeSpot(
      SPOT.busWreck.x - 2.2,
      SPOT.busWreck.z - 4.6,
      undefined,
      { maxR: 4 },
    );
    QX.pickup("penn_timetable", "qx_m42_timetable", 1, {
      x: s.x,
      y: s.y + 0.02,
      z: s.z,
    });
  }
  G.events.on("itemAdded", (id) => {
    if (/^qx_script_page_/.test(id) && QX.stage("qx_bixby") === "pages") {
      if (QX.misc.pagesHave() >= 3) QX.setStage("qx_bixby", "return");
      else QX.refresh("qx_bixby");
    }
    if (id === "qx_m42_timetable" && QX.stage("qx_commute") === "find")
      QX.setStage("qx_commute", "tell");
  });

