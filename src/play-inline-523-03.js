// play-inline-523 03 — pos
// Lines 631-811 of readable/play-inline-523.pretty.js (statement-aligned).
  function updateFlight(dt, realDt) {
    const f = RC;
    if (!f) return;
    const P = G.player;
    if (dt > 0) {
      f.t += dt;
      if (f.mode === "flyover") {
        f.pos.addScaledVector(f.vel, dt);
        const toEnd = Math.hypot(f.end.x - f.pos.x, f.end.z - f.pos.z);
        if (toEnd < 30 || f.t > 80) {
          endFlight();
          return;
        }
      } else {
        const H = f.hover;
        if (f.phase === "cruise") {
          const dx = H.x - f.pos.x,
            dz = H.z - f.pos.z,
            d = Math.hypot(dx, dz);
          const sp = Math.min(40, d * 0.35 + 1.5);
          f.vel.set(
            (dx / d) * sp,
            (H.y + 60 * K.clamp(d / 300, 0, 1) - f.pos.y) * 0.4,
            (dz / d) * sp,
          );
          f.pos.addScaledVector(f.vel, dt);
          if (d < 3) {
            f.phase = "hover";
            f.hoverT = 0;
          }
        } else if (f.phase === "hover") {
          f.hoverT += dt;
          f.vel.set(0, (H.y - f.pos.y) * 1.2, 0);
          f.pos.addScaledVector(f.vel, dt);
          f.pos.x = H.x + Math.sin(f.t * 0.8) * 0.4;
          f.pos.z = H.z + Math.cos(f.t * 0.6) * 0.4;
          // downwash dust + shake (two discs: a wider dust ring)
          f.dustT -= dt;
          if (
            f.dustT <= 0 &&
            !G.isStub("fx") &&
            typeof G.fx.dust === "function"
          ) {
            f.dustT = 0.3;
            _tmp.set(
              H.x + (Math.random() - 0.5) * 9,
              H.gy + 0.2,
              H.z + (Math.random() - 0.5) * 9,
            );
            try {
              G.fx.dust(_tmp);
            } catch (e) {
              /* ignore */
            }
          }
          if (
            Math.hypot(P.pos.x - H.x, P.pos.z - H.z) < 30 &&
            P.shake &&
            Math.random() < dt * 2
          )
            P.shake(0.08, 0.3);
          // drop the fire team down the rear ramp
          if (
            f.hoverT > 2.2 &&
            f.spawned < 3 &&
            f.hoverT > 2.2 + f.spawned * 0.9
          ) {
            f.spawned++;
            const s = K.freeSpotNear(
              H.x + (Math.random() - 0.5) * 5,
              H.z + (Math.random() - 0.5) * 5,
              3,
              10,
            );
            if (s) {
              const lvl = Math.max(8, K.level() + K.randInt(0, 2));
              const a = K.spawnActor({
                type: "continuity_soldier",
                faction: "continuity",
                voice: "continuity",
                name:
                  f.spawned === 1
                    ? "Continuity Sergeant"
                    : "Continuity Trooper",
                level: lvl,
                pos: s,
                yaw: K.yawTo(s.x, s.z, P.pos.x, P.pos.z),
                ai: "patrol",
                patrol: [{ x: P.pos.x, z: P.pos.z }],
                noRespawn: true,
              });
              if (a) {
                f.soldiers.push(a);
                if (f.spawned === 1)
                  K.say(
                    a,
                    K.pick([
                      "Boots on the ground! By the book, people!",
                      "Unregistered civilian sighted. Weapons free.",
                      "Deploying. Restore order to the sector.",
                    ]),
                    3.5,
                  );
              }
            }
          }
          if (f.hoverT > 7.5) {
            f.phase = "leave";
            f.leaveT = 0;
            if (K.encounters) K.encounters.adopt(f.soldiers, "rotorcraft_drop");
            f.soldiers = [];
          }
        } else {
          f.leaveT += dt;
          const up = f.leaveT < 4 ? 7 : 1;
          const fw = K.clamp((f.leaveT - 2) * 12, 0, 45);
          f.vel.set(f.dir.x * fw, up, f.dir.z * fw);
          f.pos.addScaledVector(f.vel, dt);
          if (f.leaveT > 30) {
            endFlight();
            return;
          }
        }
      }
      placeRC(dt);
    }
    // rotor wash (fades out in menus via the synth handle)
    _pos.copy(f.pos);
    _vel.copy(f.vel);
    const d = Math.hypot(
      P.pos.x - f.pos.x,
      P.pos.y - f.pos.y,
      P.pos.z - f.pos.z,
    );
    f.sound.update(
      _pos,
      _vel,
      K.clamp(1.3 - d / 1100, 0, 1) * (K.isInterior(P.pos.x) ? 0.25 : 1),
      realDt,
    );
  }

  function schedule(dt) {
    if (dt <= 0 || RC) return;
    const t = K.now();
    if (!nextFlyT) nextFlyT = t + K.rand(70, 200);
    if (t < nextFlyT) return;
    nextFlyT = t + K.rand(180, 420);
    if (!K.playerOutdoors() || K.isStormy() || G.state !== "play") return;
    const kind = pickFaction();
    if (kind === "continuity" && canDeploy() && Math.random() < 0.35) {
      lastDeployDay = K.day();
      startFlight("continuity", "deploy");
    } else startFlight(kind, "flyover");
  }

  K.system({
    name: "rotorcraft",
    order: 40,
    reset() {
      endFlight();
      nextFlyT = 0;
      lastDeployDay = -99;
    },
    update(dt, realDt) {
      schedule(dt);
      updateFlight(dt, realDt);
    },
    save: () => ({ deploy: lastDeployDay }),
    load(d) {
      lastDeployDay = d && typeof d.deploy === "number" ? d.deploy : -99;
    },
  });

  K.rotorcraft = {
    create: createRotorcraft,
    fly: (kind, mode, opts) =>
      startFlight(kind || "continuity", mode || "flyover", opts),
    end: endFlight,
    active: () => RC,
  };
