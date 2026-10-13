// play-inline-412 04 — ctx
// Lines 2184-2523 of readable/play-inline-412.pretty.js (statement-aligned).
  function setDoorClosed(ctx, closed) {
    const O = ctx.O;
    if (closed && !ctx.btDoorCol)
      ctx.btDoorCol = G.world.addBox(
        O.x - 2.4,
        O.y + VY,
        O.z - 62.4,
        O.x + 2.4,
        O.y + VY + 3.9,
        O.z - 61.5,
        { tag: "poi_fidi3", surface: "metal", walkable: false },
      );
    if (!closed && ctx.btDoorCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.btDoorCol));
      ctx.btDoorCol = null;
    }
    // the swung-open door is a 4 m steel slab: give it a collider along its open position
    if (!closed && !ctx.btDoorOpenCol) {
      const a = DOOR.open,
        L = DOOR.r * 2 + 0.2,
        lx = -L / 2,
        lz = DOOR.t / 2;
      const cx = O.x + DOOR.hx + lx * Math.cos(a) + lz * Math.sin(a),
        cz = O.z + DOOR.hz - lx * Math.sin(a) + lz * Math.cos(a);
      ctx.btDoorOpenCol =
        K.safe("opencol", () =>
          G.world.addCollider(
            cx,
            cz,
            L,
            DOOR.t + 0.3,
            O.y + VY,
            O.y + VY + 3.9,
            -a,
            { tag: "poi_fidi3", surface: "metal", walkable: false },
          ),
        ) || null;
    }
    if (closed && ctx.btDoorOpenCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.btDoorOpenCol));
      ctx.btDoorOpenCol = null;
    }
  }
  const H = {
    ctx: null,
    t: 0,
    anim: 0,
    target: 0,
    alarm: null,
    halonT: 0,
    ui: null,
    last: -1,
  };
  function inVault(p) {
    const O = H.ctx.O;
    return (
      p.x > O.x + VAULT.x0 &&
      p.x < O.x + VAULT.x1 &&
      p.z > O.z + VAULT.z0 &&
      p.z < O.z + VAULT.z1 &&
      Math.abs(p.y - (O.y + VY)) < 3
    );
  }
  function ui() {
    if (H.ui) return H.ui;
    const d = document.createElement("div");
    d.id = "pf3-heist";
    d.className = "pf3-heist";
    d.innerHTML =
      '<div class="pf3-heist-t">VAULT TIME LOCK</div><div class="pf3-heist-c">1:30</div>';
    (document.getElementById("hud") || document.body).appendChild(d);
    return (H.ui = d);
  }
  function stopAlarm() {
    if (H.alarm && H.alarm.stop) K.safe("alarm", () => H.alarm.stop());
    H.alarm = null;
  }
  PV.btStartHeist = function (withCode) {
    const ctx = H.ctx;
    if (!ctx || PV.flag("bt_state")) return;
    const calm = !!PV.flag("bt_robots_off");
    const t = 90 + (withCode ? 45 : 0) + (calm ? 45 : 0);
    PV.setFlag("bt_state", "open");
    PV.setFlag("bt_t", t);
    H.target = DOOR.open;
    if (ctx.btDoorCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.btDoorCol));
      ctx.btDoorCol = null;
    }
    const O = ctx.O,
      at = new THREE.Vector3(O.x, O.y + VY + 2, O.z - 61);
    K.sfx("cryo_door", at, { volume: 1 });
    if (!calm) {
      H.alarm = K.sfx("cryo_alarm", at, { loop: true, volume: 0.7 });
      const types = ["bulwark", "patrolman", "patrolman"];
      (ctx.btBays || []).forEach((p, i) =>
        PV.spawnActor(ctx, {
          id: "pf3_bt_resp" + (i + 1),
          type: types[i],
          name: i ? "Vault Response Patrolman" : "Vault Response Bulwark",
          faction: "robots",
          hostile: true,
          level: 10,
          pos: { x: O.x + p.x, y: O.y + p.y, z: O.z + p.z },
          yaw: p.yaw,
          ai: "guard",
          home: { x: O.x + p.x, z: O.z + p.z - (i ? 0 : 2), r: 9 },
          loot: i ? "patrolman" : "bulwark",
          noRespawn: true,
          barks: [
            "UNSCHEDULED WITHDRAWAL DETECTED.",
            "PLEASE REMAIN WHERE YOU ARE, VALUED CUSTOMER.",
            "YOUR ACCOUNT HAS BEEN FLAGGED.",
          ],
        }),
      );
    }
    K.notify(
      withCode
        ? "Override accepted. The time lock disengages — the clock is running."
        : "The time lock disengages. The vault door begins to swing open — the clock is running.",
    );
    if (K.q.active("pf3_bt_heist")) K.q.set("pf3_bt_heist", "loot");
  };
  function sealVault() {
    const ctx = H.ctx;
    H.target = 0;
    PV.setFlag("bt_state", "sealed");
    stopAlarm();
    const O = ctx.O;
    K.sfx("cryo_door", new THREE.Vector3(O.x, O.y + VY + 2, O.z - 61), {
      volume: 1,
    });
    const P = G.player;
    if (P && P.pos && inVault(P.pos)) {
      PV.setFlag("bt_trapped", true);
      H.halonT = 8;
      K.notify(
        "The door booms shut. The time lock re-engages for seventy-two hours. HALON PURGE IN 8 SECONDS.",
      );
      if (K.q.active("pf3_bt_heist")) K.q.set("pf3_bt_heist", "escape");
    } else {
      K.notify(
        "Behind you, the vault door booms shut. The time lock re-engages.",
      );
      if (K.q.active("pf3_bt_heist")) K.q.complete("pf3_bt_heist");
    }
  }
  PV.btUpdate = function (dt, realDt, ctx) {
    H.ctx = ctx;
    // door animation (also runs paused-safe on realDt)
    if (ctx.btDoor) {
      const cur = ctx.btDoor.rotation.y;
      if (Math.abs(cur - H.target) > 1e-3) {
        const sp = 0.55 * (realDt || 0.016);
        ctx.btDoor.rotation.y =
          H.target > cur
            ? Math.min(H.target, cur + sp)
            : Math.max(H.target, cur - sp * 1.6);
        if (H.target === 0 && ctx.btDoor.rotation.y < 0.4)
          setDoorClosed(ctx, true);
        else if (
          H.target > 0 &&
          ctx.btDoor.rotation.y > 1.2 &&
          !ctx.btDoorOpenCol
        )
          setDoorClosed(ctx, false);
      }
    }
    const st = PV.flag("bt_state");
    // a save loaded mid-heist seals the vault (btLoaded): settle the quest the way sealVault() would have
    if (
      st === "sealed" &&
      dt > 0 &&
      K.q.active("pf3_bt_heist") &&
      K.q.stage("pf3_bt_heist") === "loot" &&
      G.player &&
      G.player.pos
    ) {
      if (inVault(G.player.pos)) {
        K.q.set("pf3_bt_heist", "escape");
        K.notify("The vault door is sealed. Find the ventilation duct.");
      } else K.q.complete("pf3_bt_heist");
    }
    const show = st === "open" && G.state === "play";
    if (show || H.ui) {
      const d = ui();
      d.style.display = show ? "block" : "none";
    }
    if (st === "open" && dt > 0) {
      let t = (PV.flag("bt_t") || 0) - dt;
      PV.setFlag("bt_t", t);
      const s = Math.max(0, Math.ceil(t));
      if (s !== H.last && H.ui) {
        H.last = s;
        H.ui.querySelector(".pf3-heist-c").textContent =
          Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
        H.ui.classList.toggle("pf3-heist-warn", s <= 15);
      }
      if (s === 30 || s === 10) {
        if (!H["w" + s]) {
          H["w" + s] = true;
          K.notify(s + " SECONDS UNTIL THE TIME LOCK RE-ENGAGES.");
        }
      }
      if (t <= 0) sealVault();
    }
    // halon purge while sealed inside
    if (PV.flag("bt_trapped") && dt > 0) {
      const P = G.player;
      if (!P || !P.pos || !inVault(P.pos)) {
        PV.setFlag("bt_trapped", false);
        return;
      }
      H.halonT -= dt;
      if (H.halonT <= 0) {
        H.halonAcc = (H.halonAcc || 0) + dt;
        if (H.halonAcc >= 1) {
          H.halonAcc = 0;
          K.safe("halon", () =>
            P.damage(4, { type: "poison", source: "halon" }),
          );
          if (Math.random() < 0.3)
            K.notify("The halon burns your lungs. Find the ventilation duct!");
        }
      }
    }
  };
  PV.btReset = function (ctx) {
    H.ctx = ctx;
    stopAlarm();
    H.target = 0;
    H.w30 = H.w10 = false;
    H.last = -1;
    if (ctx.btDoor) ctx.btDoor.rotation.y = 0;
    setDoorClosed(ctx, true);
    if (H.ui) H.ui.style.display = "none";
  };
  PV.btLoaded = function (ctx) {
    H.ctx = ctx;
    stopAlarm();
    // a heist interrupted by a save/load: the time lock won the race
    if (PV.flag("bt_state") === "open") PV.setFlag("bt_state", "sealed");
    H.target = 0;
    if (ctx.btDoor) ctx.btDoor.rotation.y = 0;
    setDoorClosed(ctx, true);
  };

  // ------------------------------------------------------------------
  // Terminals
  // ------------------------------------------------------------------
  function termTimeLock() {
    return {
      title: "MOSLER TIME-LOCK CONSOLE",
      header:
        "BANKERS TRUST COMPANY — SAFE DEPOSIT DEPARTMENT\nMOSLER CHRONO-LOCK MODEL 61 — 72 HOUR MOVEMENT",
      lock: BT_LOCKS.console,
      entries: [
        {
          title: "Lock Status",
          text: () => {
            const st = PV.flag("bt_state");
            return st === "open"
              ? "MOVEMENT: DISENGAGED\nDOOR: OPEN\nRE-ENGAGE IN: " +
                  Math.max(0, Math.ceil(PV.flag("bt_t") || 0)) +
                  " s"
              : st
                ? "MOVEMENT: ENGAGED\nDOOR: SEALED\nNEXT OPENING: 72:00:00\n\n(the clock resets itself every time it reaches zero; it has done so 2,678 times)"
                : "MOVEMENT: ENGAGED\nDOOR: SEALED\nNEXT OPENING: 72:00:00\n\nEMERGENCY OVERRIDE AVAILABLE.";
          },
        },
        {
          title: "Emergency Override — Open Vault",
          text: "OVERRIDE ACCEPTED. MOVEMENT DISENGAGED FOR ONE (1) CYCLE.\nVAULT RESPONSE UNITS NOTIFIED.\nHAVE A PROSPEROUS DAY.",
          action: () => {
            if (!PV.flag("bt_state")) PV.btStartHeist(false);
            else K.notify("The movement is engaged. Nothing happens.");
          },
        },
        {
          title: "Maintenance Log",
          text: '03.01.67 — Vault response units recalibrated. Unit 2 still greets the vault as "valued customer."\n03.02.67 — Halon suppression tested. Please warn Mr. Ashcombe before the next test. Mr. Ashcombe has asked for his eyebrows back.\n03.05.67 — Ventilation grate in the vault latches from the inside only. Per code. Do not "fix" it.',
        },
      ],
    };
  }
  function termSecurity() {
    return {
      title: "SECURITY CONTROL",
      header:
        "KESTREL TELETYPE CORP. SECURITY SUITE — BANKERS TRUST, 14 WALL ST\nUNITS ONLINE: 6",
      lock: BT_LOCKS.security,
      entries: [
        {
          title: "Unit Roster",
          text: 'LOBBY: 1× Bulwark "Greeter", 2× Patrolman "Tellers" — STATUS: OPEN FOR BUSINESS\nVAULT RESPONSE: 1× Bulwark, 2× Patrolman — STATUS: STANDBY (activates on unscheduled vault opening)',
        },
        {
          title: "Disable Vault Response Units",
          text: "VAULT RESPONSE UNITS: OFFLINE.\nALARM ANNUNCIATOR: MUTED.",
          action: () => {
            if (!PV.flag("bt_robots_off")) {
              PV.setFlag("bt_robots_off", true);
              K.notify(
                "The vault response units power down. The alarm is muted.",
              );
              K.xp(40, "Disabled vault security");
            }
          },
        },
        {
          title: "Close Branch (Lobby Units Shutdown)",
          text: "BRANCH CLOSED. LOBBY UNITS RETURNING TO CHARGING ALCOVES.\n...\nCHARGING ALCOVES NOT FOUND. UNITS POWERING DOWN IN PLACE.",
          action: () => {
            if (PV.flag("bt_lobby_off")) return;
            PV.setFlag("bt_lobby_off", true);
            const O = H.ctx ? H.ctx.O : null;
            if (!O || G.isStub("actors")) return;
            K.safe("lobbyoff", () => {
              for (const a of G.actors.list())
                if (
                  a &&
                  !a.dead &&
                  a.faction === "robots" &&
                  Math.abs(a.pos.x - O.x) < 150 &&
                  Math.abs(a.pos.z - O.z) < 150 &&
                  !/^pf3_bt_resp/.test(a.id || "")
                )
                  a.kill();
            });
            K.notify("Across the banking hall, the robots slump and go dark.");
          },
        },
        {
          title: "Incident Report 03.05.67",
          text: "At 09:47 all human staff called in for the Sunday emergency session attempted to exit the branch. Per policy 12-C, units asked each customer to complete a satisfaction survey before exiting. Survey completion rate: 0%. Units are awaiting completed surveys.",
        },
      ],
    };
  }
