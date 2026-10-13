// play-inline-206 06 — math
// Lines 3375-3676 of readable/play-inline-206.pretty.js (statement-aligned).
  function cylinderDoor(root, x, y, z) {
    const grp = new THREE.Group();
    grp.name = "pf_fed_cylinder";
    const R = 1.95,
      H = 3.9,
      SW = 0.75; // radius, height, half slot width
    const gb = PF.batch("fed_cyl");
    // two thick "D" halves separated by the slot (slot runs along local Z when open)
    for (const sg of [-1, 1]) {
      const sh = new THREE.Shape();
      const a0 = Math.asin(SW / R);
      sh.moveTo(sg * SW, -Math.sqrt(R * R - SW * SW));
      sh.absarc(
        0,
        0,
        R,
        sg > 0 ? -HP + a0 : HP + a0,
        sg > 0 ? HP - a0 : PI * 1.5 - a0,
        false,
      );
      sh.lineTo(sg * SW, -Math.sqrt(R * R - SW * SW));
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: H,
        bevelEnabled: false,
        curveSegments: 20,
      });
      g.rotateX(-HP);
      gb.add("vault_steel", g, { m: PF.m4(0, 0, 0), grime: 0.25 });
    }
    // bolt heads & rim bands
    for (const yy of [0.15, H - 0.15])
      gb.add("chrome", new THREE.TorusGeometry(R + 0.02, 0.06, 4, 32), {
        m: PF.m4(0, yy, 0, 0, HP),
      });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      if (Math.abs(Math.cos(a)) * R < SW + 0.1) continue;
      gb.sphere(
        "chrome",
        Math.cos(a) * (R + 0.02),
        H / 2,
        Math.sin(a) * (R + 0.02),
        0.08,
        { ws: 5, hs: 4 },
      );
    }
    // horizontal reinforcing bands and a stencilled weight plate on the drum
    for (const yy of [0.9, 1.9, 2.9])
      gb.add(
        "vault_dark",
        new THREE.CylinderGeometry(R + 0.03, R + 0.03, 0.14, 32, 1, true),
        { m: PF.m4(0, yy, 0) },
      );
    for (const sg of [-1, 1]) {
      gb.box("brass", sg * (SW + 0.3), 1.2, 0, 0.1, 0.5, 1.2, { seg: false });
      gb.cyl("chrome", sg * (R - 0.05), 1.95, 0, 0.18, 0.18, 0.12, 12, {
        hSeg: 1,
        rz: HP,
      });
    }
    // the slot floor + lintel plate
    gb.box("vault_dark", 0, 0, 0, SW * 2, 0.08, R * 2 - 0.2, { seg: false });
    gb.box("vault_steel", 0, 2.8, 0, SW * 2, H - 2.8, R * 2 - 0.3, {
      seg: false,
    });
    gb.build(grp, { noLOD: true });
    grp.position.set(x, y, z);
    root.add(grp);
    // colliders: closed = solid disc; open = two slabs beside the slot
    const cols = [];
    const setCols = (open) => {
      for (const c of cols) G.world.removeCollider(c);
      cols.length = 0;
      if (!open)
        cols.push(
          PF.col(x, z, R * 2, R * 2, y, y + H, 0, {
            walkable: false,
            surface: "metal",
          }),
        );
      else
        for (const sg of [-1, 1])
          cols.push(
            PF.col(
              x + sg * (SW + (R - SW) / 2),
              z,
              R - SW,
              R * 2,
              y,
              y + H,
              0,
              { walkable: false, surface: "metal" },
            ),
          );
    };
    // closed: slot runs east-west (rotation 90°); open: slot north-south (rotation 0)
    let ang = HP,
      target = HP,
      moving = false;
    const apply = (instant) => {
      target = PF.flag("fed_vault") ? 0 : HP;
      if (instant) {
        ang = target;
        grp.rotation.y = ang;
        setCols(!!PF.flag("fed_vault"));
      }
    };
    apply(true);
    PF.flagWatch.push((k) => {
      if (k === "*") apply(true);
      else if (k === "fed_vault") {
        apply(false);
        moving = true;
        setCols(false);
        PF.sfx("cryo_door", V3(x, y + 2, z), { volume: 1.0 });
        try {
          G.player.shake(0.25, 5.5);
        } catch (e) {
          /* ignore */
        }
      }
    });
    PF.onReset.push(() => {
      ang = HP;
      target = HP;
      grp.rotation.y = HP;
      setCols(false);
      moving = false;
    });
    PF.updaters.push((dt) => {
      if (!moving) return;
      const d = target - ang,
        step = dt * (HP / 6); // 6 seconds for the quarter turn
      if (Math.abs(d) <= step) {
        ang = target;
        moving = false;
        setCols(!!PF.flag("fed_vault"));
        if (PF.flag("fed_vault")) {
          PF.q.advance(
            "pf_gold",
            ["meet", "enter", "power", "descend", "door"],
            "ledger",
          );
          G.notify(
            "The cylinder door grinds into alignment. The Gold Vault is open.",
          );
        }
      } else ang += Math.sign(d) * step;
      grp.rotation.y = ang;
    });
  }

  // ===================================================================
  // CONTENT
  // ===================================================================
  PF.item({
    id: "pf_fed_keycard",
    type: "key",
    name: "Fed Security Keycard",
    weight: 0,
    value: 25,
    desc: 'A laminated keycard: "CHIEF OF SECURITY — ALL AREAS, GROUND FLOOR". The photo has been bitten off.',
  });
  PF.item({
    id: "pf_fed_override",
    type: "key",
    name: "Vault Override Card",
    weight: 0,
    value: 50,
    desc: "A gold-edged override card for the Level V vault control system. It still smells faintly of cigars.",
  });
  PF.item({
    id: "pf_reserve_ledger",
    type: "misc",
    name: "Reserve Ledger",
    weight: 2,
    value: 10,
    quest: true,
    desc: 'A leather-bound bullion ledger: every bar in the vault, every owner, every country. The last page is a transfer order dated March 5, 1967, marked "EXPEDITE — O.C.D. / LONG WINTER".',
  });
  PF.item({
    id: "pf_reel_heist",
    type: "tape",
    name: 'Tape reel: "Liberty Street Job"',
    title: 'Crew Recording — "Gus" Madigan',
    text: "[Wind. Whispering.]\n\nGUS: Okay, listen up. Front door's got turrets, lobby's got bolts-for-brains. Security office controls the elevator — that's the only way down to Level Five. Five floors of dirt and then the cylinder. Ninety tons. Turns like a lazy Susan when you ask it nice from the control room.\n\nVOICE 2: And the Sentinel?\n\nGUS: Big, tank-treaded, twin machine guns, very polite. We don't fight the Sentinel. We shut it off from the control room, or we run.\n\nVOICE 2: The control room wants a card. We ain't got a — \n\nGUS: Then we find the override card. Old Vane at the tavern swears there's one in the barracks safe.\n\n[A turret spins up nearby.]\n\nGUS: ...Run. RUN —\n\n[Recording ends.]",
  });
  PF.item({
    id: "pf_note_chief",
    type: "note",
    name: "Chief of Security's Memo",
    title: "MEMO — Ground Floor Security, 4 Mar 1967",
    text: 'To all ground-floor staff:\n\nEffective immediately the VAULT ELEVATOR is on SECURITY OFFICE POWER ONLY. Nobody rides without my say-so. That includes Civil Defense "auditors."\n\nThe security terminal takes MY keycard and nothing else. It is not "gold." Stop asking.\n\nThe records room keypad is now 3-9-0-6. Nobody but me needs in there.\n\nIf the sirens go: seal the checkpoint, power down the car, and for God\'s sake do not let anyone take the ledger.\n\n— R. Ostrowski, Chief of Security',
    learn: "pf_lk_fed_records",
  });
  PF.item({
    id: "pf_note_manager",
    type: "note",
    name: "Vault Manager's Note",
    title: "To whoever opens the vault",
    text: "If you are reading this you got past the Sentinel, which means you are either very clever or very well armed. Either way: congratulations.\n\nThe gold is real. All of it. Five hundred thousand bars at the last count, the property of forty-odd nations that no longer exist. Take what you can carry. You will find it is not very much. Gold is heavy. That is rather the point of gold.\n\nThe ledger in my desk is the only thing here worth more than the bullion. The Office of Civil Defense wanted it very badly. I would rather they didn't get it.\n\nThe office teletype answers to my wife's name, NANETTE. She would be mortified.\n\n— E. Whitlock, Vault Manager, Level V",
    learn: "pf_lk_fed_office_term",
  });
  PF.item({
    id: "pf_fed_reserve_key",
    type: "key",
    name: "Reserve Compartment Key",
    weight: 0,
    value: 0,
    desc: "A long steel key with a red enamel tag: COMPARTMENT 024 — RESERVE — MANAGER ONLY.",
  });
  PF.item({
    id: "pf_gold_standard",
    build() {
      const base = PF.live("items") ? G.items.get("pistol_10mm") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 12) * 1.6),
              critChance: 1.8,
              critMult: 1.6,
              skin: "gold",
              condDecay: (base.weapon.condDecay || 0.002) * 0.5,
              spread: (base.weapon.spread || 0.03) * 0.75,
            })
          : undefined;
      return {
        id: "pf_gold_standard",
        type: w ? "weapon" : "misc",
        name: "The Gold Standard",
        weight: 3,
        value: 1500,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: 'A presentation 10mm pistol plated in 24-karat gold, from the Vault Manager\'s display case. Engraved on the slide: "BACKED BY THE FULL FAITH AND CREDIT." Hits hard, criticals often, and never tarnishes.',
        weapon: w,
      };
    },
  });

  // --- terminals ---
  PF.terminal("pf_fed_security", {
    title: "FEDERAL RESERVE — GROUND SECURITY",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — FRBNY PHYSICAL SECURITY v4.0",
    lock: FED_LOCKS.security,
    entries: [
      {
        title: () =>
          PF.flag("fed_power")
            ? "Vault Elevator: ONLINE"
            : "Restore Power: Vault Elevator",
        action: () => {
          if (!PF.flag("fed_power")) {
            PF.setFlag("fed_power", true);
            PF.q.advance("pf_gold", ["meet", "enter", "power"], "descend");
            return "Vault elevator power restored. Car standing by at GROUND.";
          }
          return "Vault elevator already online.";
        },
      },
      {
        title: () =>
          PF.flag("fed_gate")
            ? "Checkpoint Gate: OPEN"
            : "Open Checkpoint Gate",
        action: () => {
          PF.setFlag("fed_gate", true);
          return "Checkpoint gate raised.";
        },
      },
      {
        title: () =>
          PF.flag("fed_turrets_off")
            ? "Turrets: OFFLINE"
            : "Deactivate Perimeter & Checkpoint Turrets",
        action: () => {
          PF.setFlag("fed_turrets_off", true);
          try {
            G.props.setTurrets("pf_fed_security", "off");
            G.props.setTurrets("pf_fed_vault", "off");
          } catch (e) {
            /* ignore */
          }
          return "All security turrets placed in standby.";
        },
      },
      {
        title: () =>
          PF.flag("fed_grid")
            ? "Disable Level V Beam Grid"
            : "Level V Beam Grid: OFFLINE",
        action: () => {
          PF.setFlag("fed_grid", false);
          return "Checkpoint 2 photoelectric beam grid disabled.";
        },
      },
      {
        title: "Incident Log",
        text: 'MAR 5 1967 (SUN) 09:31 — AIR RAID SIRENS. PROTOCOL OMEGA ENGAGED.\n09:47 — DETONATION, NORTH. Seismic alarm, all vaults.\n09:52 — Sunday duty staff evacuated to Level V shelter. Civil Defense "auditors" refused entry at gunpoint.\n10:14 — Chief Ostrowski: elevator on office power.\nMAR 1971 — Unauthorized entry (raiders, 6). Resolved by turrets.\nAUG 1978 — Unauthorized entry (raiders, 11). Resolved by turrets.\nNOV 1988 — Unauthorized entry ("Madigan crew", 4). 3 resolved. 1 reached Level V. Status unknown.',
      },
    ],
  });
