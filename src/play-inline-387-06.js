// play-inline-387 06 — ctx
// Lines 1733-1877 of readable/play-inline-387.pretty.js (statement-aligned).
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    if (A.miles)
      PV.spawnActor(ctx, {
        id: "ppn_miles",
        type: "patrolman",
        variant: "police",
        name: "M.I.L.E.S.",
        faction: "postal",
        level: 6,
        hostile: false,
        essential: true,
        pos: v(A.miles),
        yaw: 0,
        ai: "static",
        home: "here",
        homeR: 0.5,
        dialogue: "ppn_dlg_miles",
        noRespawn: true,
        lookYaw: 0,
        barks: [
          "NEXT CUSTOMER, PLEASE.",
          "NOW SERVING: NUMBER 77.",
          "PLEASE HAVE YOUR PARCEL READY.",
          "THANK YOU FOR USING THE UNITED STATES MAIL.",
        ],
      });
    // three sorter units walking their routes on the workroom floor (neutral unless shot)
    const routes = ctx.routes || [];
    routes.forEach((route, i) => {
      if (!route || route.length < 2) return;
      PV.spawnActor(ctx, {
        id: "ppn_sorter" + (i + 1),
        type: "patrolman",
        variant: i === 1 ? "utility" : "police",
        name: "Postal Patrolman",
        faction: "postal",
        level: 4,
        hostile: false,
        pos: { x: route[0].x, y: route[0].y, z: route[0].z },
        yaw: 0,
        ai: "patrol",
        patrol: route.map((p) => ({ x: p.x, z: p.z })),
        home: { x: route[0].x, z: route[0].z, r: 30 },
        noRespawn: true,
        loot: "patrolman",
        speed: 0.8,
        barks: [
          "SORTING. SORTING.",
          "ADDRESSEE UNKNOWN. FORWARD TO DEAD LETTER OFFICE.",
          "ROUTE 14 COMPLETE. BEGIN ROUTE 14.",
          "ZONE NUMBERS SAVE TIME.",
          "NEITHER SNOW NOR RAIN.",
        ],
      });
    });
    if (PV.flag("fa_carrier")) PV.faPacify && PV.faPacify(false);
  }

  /** Is the actor one of the location's security robots (inside our interior cell)? */
  function inCell(a) {
    const it = G.LAYOUT.INTERIORS.farley_post_office;
    if (!it || !a || !a.pos) return false;
    return (
      Math.abs(a.pos.x - it.origin.x) < 150 &&
      Math.abs(a.pos.z - it.origin.z) < 150
    );
  }
  /** Carrier badge: the location's security robots stand down (until provoked). */
  PV.faPacify = function (announce) {
    if (PV.flag("fa_provoked") || G.isStub("actors") || !G.actors.list) return;
    let n = 0;
    for (const a of G.actors.list()) {
      if (!a || a.dead || a.faction !== "robots" || !inCell(a)) continue;
      if (a.hostile && a.hostile()) {
        K.safe("pacify", () => a.setHostile(false));
        n++;
      }
    }
    if (announce && n) K.notify("Security units: carrier recognised.");
  };
  G.events.on("actorDamaged", (actor, amt, info) => {
    if (
      !actor ||
      PV.flag("fa_provoked") ||
      G.isStub("actors") ||
      !G.actors.list
    )
      return;
    const src = info && info.source;
    if (src !== "player" && !(src && src.following === "player")) return;
    if (!(
      (actor.faction === "robots" || actor.faction === "postal") &&
      inCell(actor)
    ))
      return;
    PV.setFlag("fa_provoked", true);
    for (const a of G.actors.list())
      if (
        a &&
        !a.dead &&
        inCell(a) &&
        (a.faction === "robots" ||
          (a.faction === "postal" && a.id !== "ppn_miles"))
      )
        K.safe("provoke", () => a.setHostile(true));
    K.notify("SECURITY ALERT: ASSAULT ON A POSTAL EMPLOYEE.");
  });

  let pacT = 0;
  function update(dt, realDt, ctx) {
    if (PV.faInteriorUpdate) PV.faInteriorUpdate(dt, realDt, ctx);
    if (!ctx.inside) return;
    pacT -= realDt;
    if (pacT <= 0) {
      pacT = 1.0;
      if (PV.flag("fa_carrier")) PV.faPacify(false);
    }
  }
  // the letter picked up → quest advances (also starts the quest if found before meeting MILES)
  G.events.on("itemAdded", (id) => {
    if (id !== "ppn_special_letter") return;
    if (!K.q.started("ppn_rounds")) K.q.start("ppn_rounds");
    K.q.set("ppn_rounds", "deliver");
  });

  PV.define({
    id: "farley_post_office",
    name: "James A. Farley Post Office",
    interior: "farley_post_office",
    order: 10,
    build(ctx) {
      exterior(ctx);
      if (PV.faInterior) PV.faInterior(ctx);
    },
    data,
    spawn,
    update,
    reset() {
      pacT = 0;
    },
  });
