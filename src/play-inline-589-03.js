// play-inline-589 03 — gateddoor
// Lines 272-479 of readable/play-inline-589.pretty.js (statement-aligned).
  K.addBuild(40, function buildDoors() {
    const W = waldorfSpot(),
      S = subwaySpot(),
      P = parkSpot();
    const A = (n) => K.anchors[n];
    const tgt = (a) => ({ x: a.x, y: a.y, z: a.z, yaw: a.yaw || 0 });
    // Waldorf ⇄ shaft foot
    if (W && A("waldorf_arrival")) {
      gatedDoor(
        "lair_waldorf_in",
        {
          pos: new THREE.Vector3(W.wallX + 0.35, W.y + 1.3, W.z),
          radius: 1.3,
          label: "M-61 Freight Elevator (Track 61)",
          verb: "Ride down",
          sound: "door_metal",
          target: tgt(A("waldorf_arrival")),
          onEnter: () => lairEntered("waldorf"),
        },
        () =>
          outerOpen()
            ? null
            : SEALED + " The cage beyond goes down a long way.",
        HATCH_LOCK,
        "Welded",
      );
      gatedDoor(
        "lair_waldorf_out",
        {
          pos: A("waldorf_exit").clone(),
          radius: 1.4,
          label: "M-61 Freight Elevator (Waldorf)",
          verb: "Ride up",
          sound: "door_metal",
          target: W.arrival,
          onEnter: () => unlockHatch(),
        },
        null,
        null,
      );
    }
    // 42nd St tunnels ⇄ south tunnel
    if (S && A("bulkhead_arrival")) {
      gatedDoor(
        "lair_bulkhead_in",
        {
          pos: new THREE.Vector3(S.x, 1.35, S.wallZ + 0.55),
          radius: 1.4,
          label: "T-61 Bulkhead",
          verb: "Open",
          sound: "door_metal",
          target: tgt(A("bulkhead_arrival")),
          onEnter: () => lairEntered("bulkhead"),
        },
        () =>
          outerOpen()
            ? null
            : "The bulkhead is dogged shut from the other side. Somebody beyond it is humming.",
        HATCH_LOCK,
        "Sealed",
      );
      gatedDoor(
        "lair_bulkhead_out",
        {
          pos: A("bulkhead_exit").clone(),
          radius: 1.4,
          label: "T-61 Bulkhead (42nd Street tunnels)",
          verb: "Open",
          sound: "door_metal",
          target: S.arrival,
          onEnter: () => unlockHatch(),
        },
        null,
        null,
      );
    }
    // Park Avenue ⇄ handcar spur
    if (P && A("spur_arrival")) {
      gatedDoor(
        "lair_spur_in",
        {
          pos: new THREE.Vector3(P.x, P.y + 0.6, P.z),
          radius: 1.3,
          label: "Rusted Hatch (Park Avenue tunnel)",
          verb: "Climb down",
          sound: "door_metal",
          target: tgt(A("spur_arrival")),
          onEnter: () => lairEntered("spur"),
        },
        () => {
          if (!outerOpen())
            return "A rusted hatch in the sidewalk. Somebody has chalked an F with a spark beside it. It will not budge.";
          if (
            K.ms("rose_with_eli") ||
            K.flag("ms_lair_spur_used") ||
            (Q() && Q().isComplete("mq36"))
          )
            return null;
          return "Rusted shut. Rose knows the trick of it. You don't.";
        },
        null,
        "Rusted shut",
      );
      gatedDoor(
        "lair_spur_out",
        {
          pos: A("spur_exit").clone(),
          radius: 1.3,
          label: "Ladder to Park Avenue",
          verb: "Climb",
          sound: "door_metal",
          target: P.arrival,
          onEnter: () => K.setFlag("ms_lair_spur_used", true),
        },
        null,
        null,
      );
    }
    // M42 antechamber ⇄ Sun Room
    if (A("m42_door_face") && A("m42_arrival")) {
      const door = gatedDoor(
        "lair_m42_in",
        {
          pos: A("m42_door_face").clone(),
          radius: 1.9,
          label: "The M42 Door",
          verb: "Open",
          sound: "door_metal",
          target: tgt(A("m42_arrival")),
          onEnter: () => {
            K.safe("m42.enter", () => K.onEnterSunRoom && K.onEnterSunRoom());
          },
        },
        () =>
          m42Open()
            ? null
            : "Behind the steel a dosimeter is clicking and a record is playing. The door does not move.",
        null,
        "Barred",
      );
      // while mq35's own "M42 Door" spot is up, ours stays out of its way
      const en = door.enabled;
      door.enabled = () =>
        (en ? en() : true) &&
        !(Q() && Q().isActive("mq35") && Q().stage("mq35") === "door");
      const out = K.anchors.m42_door;
      gatedDoor(
        "lair_m42_out",
        {
          pos: A("m42_exit").clone(),
          radius: 1.9,
          label: "The M42 Door (to Track 61)",
          verb: "Open",
          sound: "door_metal",
          target: { x: out.x, y: 0, z: out.z, yaw: HP },
        },
        () => (K.finaleLocksDoor && K.finaleLocksDoor()) || null,
        null,
        "Not now",
      );
    }
  });

  function unlockHatch() {
    if (locksLive() && G.locks.unlock && !G.locks.isOpen(HATCH_LOCK.id))
      K.safe("unlock", () => G.locks.unlock(HATCH_LOCK.id));
  }
  function lairEntered(how) {
    K.setFlag("ms_lair_entered", how);
    unlockHatch();
    G.events.emit("lairEntered", how);
  }

  // ------------------------------------------------------------------
  // Register the hatch lock and add our anchors to the Waldorf POI's set (add-only) for the story's examine spots.
  // ------------------------------------------------------------------
  K.onReady(function () {
    if (K.live("locks") && G.locks.register) {
      K.safe("lock.register", () =>
        G.locks.register(Object.assign({}, HATCH_LOCK)),
      );
      if (G.locks.obtainableFrom)
        K.safe("lock.obtainable", () =>
          G.locks.obtainableFrom(HATCH_LOCK.key, HATCH_LOCK.keyFrom),
        );
    }
    try {
      const W = waldorfSpot();
      const rec = G.pois && !G.isStub("pois") && G.pois.waldorf;
      if (W && rec && rec.anchors) {
        for (const n of ["m61_door", "sub_basement", "freight_elevator"])
          if (!rec.anchors[n]) {
            const v = new THREE.Vector3(W.arrival.x, W.y, W.arrival.z);
            v.yaw = -HP;
            v.interior = "waldorf";
            rec.anchors[n] = v;
          }
      }
    } catch (e) {
      /* optional */
    }
  });

  // public: the story reads anchors through G.lair.anchor / getAnchor
  LR.getAnchor = LR.anchor;
  LR.doors = () => Object.keys(K.doors);
  LR.isOuterOpen = outerOpen;
  LR.isM42Open = m42Open;
