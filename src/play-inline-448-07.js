// play-inline-448 07 — car
// Lines 1779-1908 of readable/play-inline-448.pretty.js (statement-aligned).
  function explodeCar(car) {
    stopCarFx(car);
    car.state = "burnt";
    car.exploded = true;
    const c = new THREE.Vector3(car.x, car.y + car.size[2] * 0.6, car.z);
    const K = car.K;
    X.explosion(c, K.radius, K.dmg, {
      source: "car",
      kind: "normal",
      big: true,
    });
    // launch animation
    car.anim = {
      t: 0,
      vy: 5.5 + Math.random() * 2.5,
      y: 0,
      roll: 0,
      pitch: 0,
      vr: (Math.random() - 0.5) * 1.6,
      vp: (Math.random() - 0.5) * 1.2,
      restRoll: (Math.random() - 0.5) * 0.12,
      restPitch: (Math.random() - 0.5) * 0.08,
    };
    // lingering wreck fire + smoke column
    car.fire = X.flames
      ? X.flames.add(car.x, car.y + car.size[2] * 0.55, car.z, 1.5, {
          flames: 14,
          smokeCount: 8,
          smokeScale: 1.4,
          smokeHeight: 1.6,
          spread: 2.2,
        })
      : null;
    car.fireGlow = X.glow
      ? X.glow.add(car.x, car.y + car.size[2] + 0.5, car.z, 0xff7a2a, 9, 0.35)
      : -1;
    car.burnT = 22 + Math.random() * 10;
    car.sound = X.sfx("fire_loop", { pos: c, loop: true, volume: 0.9 });
    // lingering radiation from the ruptured micro-fusion cell
    car.radSrc = G.world.addRadSource({
      x: car.x,
      y: car.y + 1,
      z: car.z,
      radius: 7,
      strength: 2.2,
    });
    car.radT = 60;
    writeInstance(car);
    G.emit("propExploded", { type: "car", kind: car.kind, id: car.id, pos: c });
  }
  X.explodeCar = explodeCar;

  /** Per-frame car simulation (fuses, launch animation, wreck fires). */
  X.updateCars = function (dt) {
    if (!CARS.active.size) return;
    for (const car of Array.from(CARS.active)) {
      if (car.removed) {
        CARS.active.delete(car);
        continue;
      }
      if (car.state === "burning") {
        car.fuse -= dt;
        if (car.fuse <= 0) explodeCar(car);
        continue;
      }
      if (car.anim) {
        const a = car.anim;
        a.t += dt;
        a.vy -= 19 * dt;
        a.y += a.vy * dt;
        a.roll += a.vr * dt;
        a.pitch += a.vp * dt;
        if (a.y <= 0 && a.vy < 0) {
          if (Math.abs(a.vy) > 3) {
            a.vy = -a.vy * 0.25;
            a.vr *= 0.3;
            a.vp *= 0.3;
            X.sfx("land", {
              pos: new THREE.Vector3(car.x, car.y, car.z),
              volume: 1,
            });
          } else {
            a.y = 0;
            car.roll = (car.roll || 0) + a.restRoll;
            car.pitch = (car.pitch || 0) + a.restPitch;
            car.anim = null;
          }
        }
        writeInstance(car);
      }
      if (car.burnT !== undefined) {
        car.burnT -= dt;
        if (car.fire && car.burnT < 8 && car.fire.setScale)
          car.fire.setScale(Math.max(0.01, (1.5 * car.burnT) / 8));
        if (car.burnT <= 0) {
          stopCarFx(car);
          car.burnT = undefined;
        }
      }
      if (car.radSrc) {
        car.radT -= dt;
        if (car.radT <= 0) {
          G.world.removeRadSource(car.radSrc);
          car.radSrc = null;
        }
      }
      if (!car.anim && car.burnT === undefined && !car.radSrc)
        CARS.active.delete(car);
    }
  };
  /** Reset all cars (new game): un-burn, restore hp, stop fx. Burnt-at-start cars stay burnt. */
  X.resetCars = function () {
    for (const car of CARS.list) {
      if (car.removed) continue;
      stopCarFx(car);
      if (car.radSrc) {
        G.world.removeRadSource(car.radSrc);
        car.radSrc = null;
      }
      car.anim = null;
      car.burnT = undefined;
      car.state = car.startBurnt ? "burnt" : "intact";
      car.hp = car.maxHp;
      car.exploded = false;
      car.roll = car.baseRoll;
      car.pitch = car.basePitch;
      writeInstance(car);
    }
    CARS.active.clear();
  };
