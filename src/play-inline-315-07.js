// play-inline-315 07 — math
// Lines 3657-3954 of readable/play-inline-315.pretty.js (statement-aligned).
  function updateArcs(ctx, dt) {
    const A = ctx.arcs;
    if (!A) return;
    const P = G.player && G.player.pos;
    if (!P) return;
    const O = ctx.O;
    const lx = P.x - O.x,
      lz = P.z - O.z;
    const inLab =
      ctx.inside &&
      lz > LAB.z0 - 6 &&
      lz < LAB.z1 + 10 &&
      lx > LAB.x0 - 4 &&
      lx < LAB.x1 + 4;
    const live = coilsLive();
    A.core.visible = A.halo.visible = inLab && live;
    // ambient hum
    if (inLab && live) {
      if (!A.hum)
        A.hum = K.sfx(
          "hum_electric",
          new THREE.Vector3(O.x, O.y + 4, O.z + 52),
          { loop: true, volume: 0.8 },
        );
    } else if (A.hum) {
      K.safe("hum", () => A.hum.stop && A.hum.stop());
      A.hum = null;
    }
    if (!inLab || !live) return;
    const tops = COILS.map(
      ([cx, cz]) => new THREE.Vector3(O.x + cx, O.y + COIL_TOP, O.z + cz),
    );
    for (let i = 0; i < NB; i++) {
      const bo = A.bolts[i];
      bo.life -= dt;
      if (bo.life <= 0) {
        if (Math.random() < 0.55) {
          const ci = i % 3,
            top = tops[ci];
          const ang = Math.random() * PI * 2;
          const a = new THREE.Vector3(
            top.x + Math.cos(ang) * 1.3,
            top.y + (Math.random() - 0.5) * 0.3,
            top.z + Math.sin(ang) * 1.3,
          );
          let target,
            jag = 1.2;
          const k = Math.random();
          const pd = Math.hypot(
            P.x - (O.x + COILS[ci][0]),
            P.z - (O.z + COILS[ci][1]),
          );
          if (pd < 5.5 && Math.random() < 0.45) {
            target = new THREE.Vector3(P.x, P.y + 1.2, P.z);
            jag = 0.9;
            zapPlayer(ctx, pd);
          } else if (k < 0.3) {
            const o = tops[(ci + 1 + (Math.random() < 0.5 ? 1 : 0)) % 3];
            target = o
              .clone()
              .add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * 1.5,
                  0,
                  (Math.random() - 0.5) * 1.5,
                ),
              );
            jag = 2.0;
          } else if (k < 0.65) {
            const g = ang + (Math.random() - 0.5) * 0.8;
            target = new THREE.Vector3(
              O.x + COILS[ci][0] + Math.cos(g) * 3.4,
              O.y + 2.45,
              O.z + COILS[ci][1] + Math.sin(g) * 3.4,
            );
            jag = 0.9;
          } else {
            target = a
              .clone()
              .add(
                new THREE.Vector3(
                  Math.cos(ang) * (1 + Math.random() * 2),
                  (Math.random() - 0.3) * 2.2,
                  Math.sin(ang) * (1 + Math.random() * 2),
                ),
              );
            jag = 0.8;
          }
          bo.pts = makeBolt(a, target, jag);
          bo.life = 0.05 + Math.random() * 0.12;
          bo.max = bo.life;
          if (Math.random() < 0.06)
            K.safe("sparks", () => {
              if (!G.isStub("fx") && G.fx.sparks) G.fx.sparks(target);
            });
        } else {
          bo.pts = null;
          bo.life = 0.04 + Math.random() * 0.15;
          bo.max = bo.life;
        }
      }
      writeBolt(
        ctx,
        i,
        bo.pts,
        bo.pts ? 0.6 + 0.4 * (bo.life / (bo.max || 1)) : 1,
      );
    }
    A.core.instanceMatrix.needsUpdate = true;
    A.halo.instanceMatrix.needsUpdate = true;
    A.flashT -= dt;
    A.crackT -= dt;
    if (A.flashT <= 0) {
      A.flashT = 0.35 + Math.random() * 0.9;
      const t = tops[(Math.random() * 3) | 0];
      K.safe("flash", () => {
        if (!G.isStub("fx") && G.fx.flash) G.fx.flash(t, 0x8aa8ff, 2.2, 0.09);
      });
    }
    if (A.crackT <= 0) {
      A.crackT = 0.25 + Math.random() * 0.6;
      K.sfx("laser_impact", tops[(Math.random() * 3) | 0], {
        volume: 0.35,
        pitch: 0.6 + Math.random() * 0.6,
      });
    }
  }
  function zapPlayer(ctx, dist) {
    const A = ctx.arcs;
    if (A.zapT > 0 || !G.player || !G.player.alive) return;
    A.zapT = 0.6;
    const dmg = Math.round(6 + (5.5 - dist) * 3);
    K.safe("zap", () => {
      G.player.damage(dmg, { type: "energy", source: "tesla_coil" });
      if (G.player.shake) G.player.shake(0.4, 0.25);
    });
    K.sfx("hurt_player", null, { volume: 0.6 });
  }
  function setCoilsOff(ctx, silent) {
    if (PH.flag("ny_coils_off")) return;
    PH.setFlag("ny_coils_off", true);
    if (!silent)
      K.notify(
        "Discharge sequence complete. The coils wind down with a long, dying whine.",
      );
    K.sfx("terminal_success");
    K.xp(75, "Shut down the Teleforce coils");
    PH.nyQuestTo("notebook");
  }

  // ==================================================================
  // TERMINALS
  // ==================================================================
  function termDesk() {
    return {
      title: "HOTEL NEW YORKER — FRONT DESK",
      header:
        'MERIDIAN TELELINK · HOSPITALITY SUITE 4.1\n"2,500 ROOMS — A RADIO IN EVERY ROOM"',
      lock: PH.LOCKS.ny_term_desk,
      entries: [
        {
          title: "Guest Register — Floor 33",
          text: "3321  Mr. & Mrs. Delacroix (honeymoon)\n3322  Mr. V. Obi — NOTE: registered 2 days AFTER the bombs? (system error)\n3324  Mr. H. Voorhees — complaint on file (pigeons, static, radio)\n3325  VACANT — pigeons\n3327  ** THE TESLA SUITE ** — EXHIBIT. Not for let. Maintained by the Stanhope Foundation. Staff access prohibited.\n3329–3335  Stanhope Foundation (long-term block booking, paid through 1989)",
        },
        {
          title: "Memo: The Tesla Suite",
          text: 'From the General Manager:\n\nThe Stanhope Foundation has again asked that the 33rd floor be "left alone." They pay for eleven rooms they never sleep in. They bring their own robots. They reinforce our floors. They drain enough current each evening at nine to dim the Times Square signs.\n\nThey also pay in cash. Leave them alone.',
        },
        {
          title: "Memo: Shamrock Ball",
          text: 'Grand Ballroom, Sunday, March 5th, 8 PM till dawn (St. Patrick\'s week starts early at the New Yorker). The Stanhope Foundation has "requested" that the ballroom lights be kept low from 9 PM, when they will be "running a demonstration" upstairs. Tell the band to play louder.',
        },
        {
          title: "Elevator Service — Car 3",
          cond: () => !PH.flag("ny_elev"),
          text: "CAR 3 (express to 33): LOCKED OUT — Foundation request.\nMaintenance override available.",
          action: () => restoreElevator(),
        },
        {
          title: "Elevator Service — Car 3",
          cond: () => !!PH.flag("ny_elev"),
          text: "CAR 3: IN SERVICE. Express to floor 33. Please mind the pigeons.",
        },
      ],
    };
  }
  function restoreElevator() {
    if (PH.flag("ny_elev")) return;
    PH.setFlag("ny_elev", true);
    PH.safe("unlock", () => {
      if (PH.locksLive()) G.locks.unlock(PH.LOCKS.ny_elev.id);
    });
    K.notify("Elevator car 3 grinds back to life.");
    K.sfx("terminal_success");
  }
  function termSecurity() {
    return {
      title: "MERIDIAN SECURITY — FLOOR 33",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK PROTOCOL\nSECURITY DETAIL: STANHOPE FOUNDATION",
      lock: PH.LOCKS.ny_term_security,
      entries: [
        {
          title: "Access Codes",
          learn: ["ph_ny_sec_locker", "ph_ny_term_lab"],
          text: "SECURITY LOCKER (spare car-3 key): 7-6-3-3.\nCOIL ROOM TELETYPE: password SMILJAN (the founder's birthplace — Dr. Stanhope is sentimental).",
        },
        {
          title: "Standing Orders",
          text: 'PRIORITY 1: Guard floor 33. No entry to the Tesla Suite without Foundation credentials.\nPRIORITY 2: Maintain coil room security until the discharge code is entered.\nPRIORITY 3: Feed the birds at 21:00. (Order issued by Dr. Stanhope. Rationale: "sentiment." Complied.)',
        },
        {
          title: "Unit Log",
          text: 'UNIT 7 (Sentry): 76,511 patrol loops completed. 1 intruder neutralised (room 3322). Birds fed: 0 (supply exhausted 1969).\nUNIT 9 (Valet-M): requests permission to "go outside and shoot something." DENIED.',
        },
        {
          title: "Set Security Detail to PASSIVE",
          cond: () => !PH.flag("ny_bots_passive"),
          text: "Credential override accepted. All floor-33 units stand down.",
          action: () => pacifyRobots(),
        },
      ],
    };
  }
  function pacifyRobots() {
    PH.setFlag("ny_bots_passive", true);
    const ctx = PH.nyCtx;
    if (!ctx || G.isStub("actors") || !G.actors.list) return;
    let n = 0;
    K.safe("pacify", () => {
      for (const a of G.actors.list()) {
        if (!a || a.dead) continue;
        if (
          Math.abs(a.pos.x - ctx.O.x) > 150 ||
          Math.abs(a.pos.z - ctx.O.z) > 150
        )
          continue;
        const info =
          !G.isStub("chars") && G.chars.info ? G.chars.info(a.type) : null;
        if ((info && info.isRobot) || a.faction === "robots") {
          if (a.setHostile) a.setHostile(false);
          n++;
        }
      }
    });
    K.notify(
      n
        ? "The hotel's security robots power down to PASSIVE."
        : "Security detail set to PASSIVE.",
    );
    K.xp(50, "Robot security overridden");
  }
  function termLab() {
    return {
      title: "PROJECT TELEFORCE — CONTROL",
      header:
        "STANHOPE FOUNDATION · MAGNIFYING TRANSMITTER CONTROL\nCOIL BANK: 3 × 1.1 MV   STATUS: " +
        "▮▮▮ CHARGED",
      lock: PH.LOCKS.ny_term_lab,
      entries: [
        {
          title: "Exhibit Safe",
          learn: "ph_ny_exhibit_safe",
          text: "The exhibit safe holds the founder's papers and the feather. Combination: his birthday, 0-7-1-0.",
        },
        {
          title: "Log: Year One",
          text: 'The notebook is real. Everything the old man claimed — resonant transmission, the charged-particle "Teleforce" beam — is in it, in a hand so small I need a loupe. He hid it behind his own clothes. The hotel thinks we run a museum.',
        },
        {
          title: "Log: Year Nine",
          text: "Prototype 7 fires. A beam of charged tungsten particles that drops a target like a pole-axed steer and leaves the air smelling of thunder. The Army wants a demonstration. I want to publish. We compromise: they fund, I stay silent.",
        },
        {
          title: "Log: The Pigeons",
          text: "A white pigeon has started coming to the lab window. The robots have been instructed to feed her. I am aware of the irony. I have decided not to be embarrassed by it.",
        },
        {
          title: "Discharge Coils (Safe Mode)",
          cond: () => !PH.flag("ny_coils_off"),
          text: "DISCHARGE SEQUENCE INITIATED.\nBleeding 3.3 MV to ground... Interlock released: FARADAY ENCLOSURE.",
          action: () => {
            const c = PH.nyCtx;
            if (c) setCoilsOff(c);
          },
        },
        {
          title: "Coil Status",
          cond: () => !!PH.flag("ny_coils_off"),
          text: "COIL BANK DISCHARGED. Enclosure interlock: RELEASED.",
        },
      ],
    };
  }

  // ==================================================================
  // DATA (items, quest) — initDone
  // ==================================================================
