// play-inline-179 02 — three
// Lines 24-273 of readable/play-inline-179.pretty.js (statement-aligned).
  const A = G.PMID,
    K = A.kit,
    F = K.f,
    T = K.T;
  const PI = Math.PI,
    HP = PI / 2;
  const OFF = 13.2; // Penn's interior is authored below 0 and lifted by this much (see 30_penn.js)
  const QID = "pmid_q_lastcall";
  let lampRed = null,
    lampGreen = null,
    leverArm = null,
    leverPos = null;

  function signalOn() {
    return !!A.state.lastcall_signal;
  }
  function applySignal() {
    const on = signalOn();
    if (lampRed) lampRed.material.color.setHex(on ? 0x2a0806 : 0xff3020);
    if (lampGreen) lampGreen.material.color.setHex(on ? 0x50ff70 : 0x061a0a);
    if (leverArm) leverArm.rotation.z = on ? -0.55 : 0.55;
  }

  K.defineSite("penn_lastcall", 31, function () {
    const rec = A.records.penn_station,
      I = A.pennInt;
    if (!rec || !I) return;
    const { ox, oz, BEDY, TX0 } = I;
    const Y = BEDY + OFF; // tunnel floor, world y (0)
    const TX1 = TX0 + 22,
      ZS0 = oz - 69; // south bore: z oz-69..-61, closed at x = TX1
    const b = K.builder("penn_signal", { grime: 0.6 });
    const glows = K.glowSet("penn_signal");
    // --- searchlight signal on a lattice mast, against the bore's south wall near the dead end ---
    const mx = TX1 - 2.4,
      mz = ZS0 + 1.0;
    b.box("concrete", mx, Y, mz, 0.9, 0.35, 0.9, { tint: 0x6a6860 });
    for (const c of [
      [-0.18, -0.18],
      [0.18, -0.18],
      [-0.18, 0.18],
      [0.18, 0.18],
    ])
      b.beam(
        "black_metal",
        mx + c[0],
        Y + 0.35,
        mz + c[1],
        mx + c[0] * 0.5,
        Y + 4.2,
        mz + c[1] * 0.5,
        0.05,
      );
    for (let y = 0.9; y < 4.1; y += 0.55)
      b.beam(
        "black_metal",
        mx - 0.16,
        Y + y,
        mz - 0.16,
        mx + 0.16,
        Y + y + 0.4,
        mz + 0.16,
        0.025,
      );
    b.box("black_metal", mx, Y + 3.3, mz, 0.7, 1.2, 0.5, { tint: 0x1e1e1c }); // signal head backplate
    for (const ly of [3.55, 3.05]) {
      // lamp hoods, facing west (up the track)
      b.cyl("black_metal", mx - 0.35, Y + ly, mz, 0.2, 0.2, 0.3, 10, {
        rz: HP,
        tint: 0x1a1a18,
      });
    }
    b.box("paint_white", mx + 0.1, Y + 2.5, mz, 0.04, 0.35, 0.5, {
      tint: 0xd8d4c8,
      grime: 0.6,
    }); // number plate
    // --- trackside lever stand (the interactable) ---
    const lx = TX1 - 5.0,
      lz = ZS0 + 1.1;
    b.box("black_metal", lx, Y, lz, 1.4, 0.9, 0.5, { tint: 0x3a3a34 });
    b.box("paint_yellow", lx, Y + 0.9, lz, 1.45, 0.06, 0.55, {
      tint: 0xb89830,
      grime: 0.5,
    });
    b.box("paint_white", lx, Y + 0.45, lz + 0.26, 0.9, 0.25, 0.02, {
      faces: "s",
      tint: 0xd0ccc0,
      grime: 0.6,
    });
    K.colBox(lx - 0.7, Y, lz - 0.25, lx + 0.7, Y + 0.9, lz + 0.25, {
      surface: "metal",
    }); // K.yOff is 0 again here: world y
    // conduit from lever to mast
    F.pipe(b, lx + 0.7, Y + 0.3, lz, mx - 0.45, Y + 0.3, mz, 0.04, {
      mat: "rust",
    });
    b.finish(rec.interiorRoot, { cast: false });
    glows.add(mx - 0.55, Y + 3.3, mz, 0x60ff60, "s");
    glows.finish(rec.interiorRoot, { interior: true, nightOpacity: 0.9 });
    // --- the two lamps (separate so they can switch) + lever arm ---
    const mk = (y, col) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 10, 6),
        new THREE.MeshBasicMaterial({ color: col, toneMapped: false }),
      );
      m.position.set(mx - 0.52, Y + y, mz);
      rec.interiorRoot.add(m);
      return m;
    };
    lampRed = mk(3.55, 0xff3020);
    lampGreen = mk(3.05, 0x061a0a);
    leverArm = new THREE.Group();
    leverArm.position.set(lx, Y + 0.95, lz);
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 1.1, 6),
      new THREE.MeshStandardMaterial({
        color: 0x9a2a1c,
        roughness: 0.6,
        metalness: 0.4,
      }),
    );
    arm.position.y = 0.55;
    leverArm.add(arm);
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x1a1a18, roughness: 0.5 }),
    );
    knob.position.y = 1.1;
    leverArm.add(knob);
    rec.interiorRoot.add(leverArm);
    leverPos = new THREE.Vector3(lx, Y + 1.3, lz);
    rec.anchor("signal", lx, Y, lz + 1.2, 0); // stand here facing the lever (−z)
    applySignal();
    G.world.addInteractable({
      pos: leverPos,
      radius: 0.8,
      priority: 1,
      label: "Track 3 Home Signal",
      verb: "Throw lever",
      enabled: () => !signalOn(),
      onInteract() {
        throwSignal();
      },
    });
  });

  function throwSignal() {
    if (signalOn()) return;
    A.state.lastcall_signal = 1;
    applySignal();
    try {
      G.sfx.play("ui_select");
    } catch (e) {
      /* ignore */
    }
    try {
      if (G.fx && G.fx.flash && leverPos)
        G.fx.flash(
          leverPos.clone().add(new THREE.Vector3(2.6, 2.2, -0.1)),
          0x60ff70,
          3,
          0.4,
        );
    } catch (e) {
      /* ignore */
    }
    K.say("The signal clunks over. Red... to green.");
    setTimeout(
      () =>
        K.say(
          'PA: "...Train twenty-nine, the Broadway Limited... now departing, Track Three... All aboard."',
        ),
      2200,
    );
    if (!K.q.started(QID)) K.q.start(QID);
    K.q.complete(QID);
    K.standing(10, "Cleared the Broadway Limited");
    K.news(
      "Scavengers swear the old signal lamps under Penn Station burn green now. Nobody knows who threw the switch — or who they cleared the line for.",
    );
  }

  K.questDef({
    id: QID,
    name: "Last Call",
    giver: "Conductor Amos Whitlock (tape reel)",
    location: "Pennsylvania Station",
    desc: 'Conductor Amos Whitlock of the Broadway Limited recorded one last message on March 5th, 1967, then walked down the east tunnel "to see about the signal". Somebody has to.',
    stages: [
      {
        id: "find",
        text: "Follow Conductor Whitlock's trail down the east tunnel beyond Track 4.",
        markers: () => {
          const v = K.anchor("penn_station", "boss");
          return v
            ? [
                {
                  x: v.x,
                  y: v.y,
                  z: v.z,
                  label: "East Tunnel",
                  interior: "penn_station",
                },
              ]
            : [];
        },
      },
      {
        id: "signal",
        text: "Whitlock never made it back. Throw the Track 3 home signal at the end of the south tunnel and clear the Broadway Limited. (His watch key opens the payroll box in the baggage car.)",
        markers: () => {
          const v = K.anchor("penn_station", "signal");
          return v
            ? [
                {
                  x: v.x,
                  y: v.y,
                  z: v.z,
                  label: "Track 3 Home Signal",
                  interior: "penn_station",
                },
              ]
            : [];
        },
      },
    ],
    rewards: { xp: 200 },
  });

  function advance() {
    if (K.q.active(QID) && K.q.stage(QID) === "find") K.q.set(QID, "signal");
  }
  G.events.on("itemAdded", (id) => {
    if (id === "pmid_penn_conductor" && !signalOn()) K.q.start(QID);
    if (id === "q_pmid_penn_key" && !signalOn()) {
      K.q.start(QID);
      advance();
    }
  });
  G.events.on("actorKilled", (a) => {
    try {
      if (a && a.id === "pmid_penn_conductor") advance();
    } catch (e) {
      /* ignore */
    }
  });
  G.events.on("loaded", () => applySignal());
  (A.resets = A.resets || []).push(() => {
    setTimeout(applySignal, 0);
  });
