// play-inline-451 08 — yaw
// Lines 1966-2545 of readable/play-inline-451.pretty.js (statement-aligned).
  const VIGNETTES = {
    // a survivor's lean-to against the wall: bedroll, fire, a footlocker of their things
    squat(x, z, yaw, wp, self) {
      if (!wp) return false;
      const bx = Math.sin(yaw),
        bz = Math.cos(yaw); // toward the wall
      const ox = wp.x - bx * 0.95,
        oz = wp.z - bz * 0.95;
      const fire = { x: ox - bx * 1.75, z: oz - bz * 1.75 };
      if (
        !ok(ox, oz) ||
        !ok(fire.x, fire.z) ||
        inCrossingRoad(fire.x, fire.z, self) ||
        !storefrontDoorClear(ox, oz, 3) ||
        !occFree(ox, oz, 1.6) ||
        !occFree(fire.x, fire.z, 0.7) ||
        blocked(fire.x, fire.z, 0.5) ||
        blocked(ox - bx * 0.4, oz - bz * 0.4, 0.4)
      )
        return false;
      const v = (rng() * 6) | 0;
      if (!put("squat_camp", v, ox, oz, yaw, { force: true, r: 0 }))
        return false;
      occMark(ox, oz, 1.6);
      occMark(fire.x, fire.z, 0.7);
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      P.spawn(rng() < 0.5 ? "footlocker" : "duffle_bag", {
        x: ox - 0.8 * c + 0.5 * s,
        y: groundAt(ox, oz),
        z: oz + 0.8 * s + 0.5 * c,
        yaw: yaw + (rng() - 0.5) * 0.3,
        persistent: true,
        name: rng() < 0.5 ? "Squatter's Footlocker" : undefined,
      });
      if (rng() < 0.6)
        put(
          "shopping_cart",
          rng() < 0.5 ? 1 : 0,
          ox + 2.2 * c - 0.6 * s,
          oz - 2.2 * s - 0.6 * c,
          yaw + 1.2,
          { r: 0.6 },
        );
      if (rng() < 0.35)
        put("skeleton", 1, ox - 0.5 * c, oz + 0.5 * s, yaw + PI, {
          r: 0,
          noCollide: true,
          force: true,
        }); // didn't make it
      return true;
    },
    // old-world Army convoy stopped dead in the traffic lane: trucks nose to tail, a jeep-less crew of skeletons
    convoy(x, z, yaw, wp, self) {
      const ty = yaw + PI / 2,
        fx = -Math.sin(ty),
        fz = -Math.cos(ty);
      const n = 2 + (rng() < 0.5 ? 1 : 0);
      let placed = 0;
      for (let i = 0; i < n; i++) {
        const t = i * 8.4 + (rng() - 0.5) * 0.8;
        if (
          putTruck(
            rng() < 0.35 ? 0 : rng() < 0.55 ? 1 : 2,
            x + fx * t,
            z + fz * t,
            ty + (rng() - 0.5) * 0.18,
            { lootChance: 0.6 },
          )
        )
          placed++;
      }
      if (!placed) return false;
      if (self && self.x !== undefined) {
        // keep the far lane of the avenue open past the convoy
        const farLane = self.x - (Math.sign(x - self.x) || 1) * 2.2,
          zEnd = z + fz * (n - 1) * 8.4;
        CLEAR.push([
          farLane - 1.5,
          Math.min(z, zEnd) - 6,
          farLane + 1.5,
          Math.max(z, zEnd) + 6,
        ]);
      }
      const c = Math.cos(yaw),
        s = Math.sin(yaw),
        mid = n * 4.2;
      put(
        "quarantine_sign",
        1,
        x + fx * mid + 2.8 * s,
        z + fz * mid + 2.8 * c,
        yaw,
        { r: 1.0 },
      );
      put(
        "skeleton",
        0,
        x + fx * (mid - 2) - 2.2 * s,
        z + fz * (mid - 2) - 2.2 * c,
        rng() * 6,
        { r: 0.6 },
      );
      put(
        "skeleton",
        2,
        x + fx * (mid + 5) + 1.9 * s,
        z + fz * (mid + 5) + 1.9 * c,
        rng() * 6,
        { r: 0.6 },
      );
      put("jersey_barrier", 0, x - fx * 6, z - fz * 6, ty + PI / 2, { r: 1.2 });
      spawnDyn("ammo_box", {
        x: x + fx * (mid + 1) - 2.3 * s,
        z: z + fz * (mid + 1) - 2.3 * c,
        yaw: rng() * 6,
        r: 0.4,
        name: "Army Ammo Box",
      });
      for (let k = 0; k < 3; k++)
        put(
          "car_debris",
          (rng() * 3) | 0,
          x + fx * rng() * mid * 2 + (rng() - 0.5) * 4 * s,
          z + fz * rng() * mid * 2 + (rng() - 0.5) * 4 * c,
          rng() * 6,
          { r: 0.3, noCollide: true },
        );
      return true;
    },
    // a cordon: quarantine board, sawhorses, and the people it held back
    quarantine(x, z, yaw) {
      if (!put("quarantine_sign", rng() < 0.4 ? 1 : 0, x, z, yaw, { r: 1.1 }))
        return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      for (const d of [-2.6, 2.6])
        put(
          "sawhorse",
          rng() < 0.3 ? 2 : 0,
          x + d * c,
          z - d * s,
          yaw + (rng() - 0.5) * 0.3,
          { r: 1.0 },
        );
      put(
        "skeleton",
        rng() < 0.5 ? 0 : 3,
        x - 1.8 * s + (rng() - 0.5) * 2 * c,
        z - 1.8 * c,
        rng() * 6,
        { r: 0.6 },
      );
      put(
        "luggage",
        0,
        x - 2.6 * s + 1.4 * c,
        z - 2.6 * c - 1.4 * s,
        rng() * 6,
        { r: 0.5 },
      );
      if (rng() < 0.5)
        put(
          "pram",
          1,
          x - 2.2 * s - 1.6 * c,
          z - 2.2 * c + 1.6 * s,
          rng() * 6,
          { r: 0.6 },
        );
      return true;
    },
    // a Patrolman that ran down on its beat: slumped against the wall (visor still flickering) or face-down on the pavement
    robot_down(x, z, yaw, wp) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      if (wp && rng() < 0.65) {
        const bx = Math.sin(yaw),
          bz = Math.cos(yaw);
        const ox = wp.x - bx * 0.55,
          oz = wp.z - bz * 0.55;
        if (
          !ok(ox, oz) ||
          !storefrontDoorClear(ox, oz, 2.5) ||
          blocked(ox - bx * 0.3, oz - bz * 0.3, 0.35)
        )
          return false;
        if (
          !put(
            "robot_wreck",
            rng() < 0.6 ? 0 : 3,
            ox,
            oz,
            yaw + (rng() - 0.5) * 0.3,
            { r: 0.9, force: true, lootChance: 0.85, tint: robotTint() },
          )
        )
          return false;
      } else {
        // out in the open: face-down, kneeling where it powered down, or sitting hunched over its knees
        const t = rng(),
          v = t < 0.45 ? 1 : t < 0.75 ? 4 : 5;
        if (
          !put(
            "robot_wreck",
            v,
            x,
            z,
            v === 1
              ? yaw + PI / 2 + (rng() - 0.5) * 1.2
              : yaw + (rng() - 0.5) * 1.4,
            { r: 1.3, lootChance: 0.85, tint: robotTint() },
          )
        )
          return false;
      }
      // what it was guarding: a police cordon, or a citizen it had just "protected"
      if (rng() < 0.5)
        put(
          "sawhorse",
          rng() < 0.5 ? 0 : 2,
          x - 2.2 * c,
          z + 2.2 * s,
          yaw + (rng() - 0.5) * 0.4,
          { r: 1.0 },
        );
      if (rng() < 0.5)
        put(
          "skeleton",
          rng() < 0.5 ? 0 : 2,
          x + 1.8 * c - 0.8 * s,
          z - 1.8 * s - 0.8 * c,
          rng() * 6,
          { r: 0.6 },
        );
      for (let i = 0; i < 2; i++)
        put(
          "car_debris",
          0,
          x + (rng() - 0.5) * 3,
          z + (rng() - 0.5) * 3,
          rng() * 6,
          { r: 0, noCollide: true },
        );
      return true;
    },
    // a Valet that ran its errand into the street and tipped over: shopping everywhere
    valet_crash(x, z, yaw) {
      if (!put("robot_wreck", 2, x, z, rng() * 6, { r: 1.0, lootChance: 0.85 }))
        return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("shopping_cart", 1, x + 1.6 * c, z - 1.6 * s, yaw + 1.9, { r: 0.6 });
      put(
        "luggage",
        0,
        x - 1.4 * c - 0.6 * s,
        z + 1.4 * s - 0.6 * c,
        rng() * 6,
        { r: 0.5 },
      );
      put("litter", 2, x - 0.4 * s, z - 0.4 * c, rng() * 6, {
        r: 0,
        noCollide: true,
      });
      spawnDyn(rng() < 0.5 ? "fizzo_cola" : "duffle_bag", {
        x: x + 0.9 * c - 1.1 * s,
        z: z - 0.9 * s - 1.1 * c,
        yaw: rng() * 6,
        r: 0.3,
      });
      return true;
    },
    // an Army aid station pitched in the parking lane: a triage tent of cots and body bags, the overflow lined up on the kerb
    triage(x, z, yaw, wp, self) {
      if (!self || self.x === undefined) return false; // avenues only
      const rx = -Math.sin(yaw),
        rz = -Math.cos(yaw); // toward the roadway
      // tent centre 1.5 m inside the kerb: walls span the parking lane + the near half of the near lane,
      // sandbag weights on the kerb side; the far lane is reserved (no wrecks) so the avenue stays passable
      const across = self.road / 2 - 1.5,
        sideSign = Math.sign(x - self.x) || 1;
      const tx = self.x + sideSign * across,
        tz = z,
        ty = yaw + PI / 2; // tent long axis along the road
      const ax = Math.sin(ty),
        az = Math.cos(ty); // tent-local +z (back) in world
      for (const u of [-1, 0, 1])
        for (const t of [-1, 0, 1]) {
          const qx = tx + u * 2.1 * az + t * 2.6 * ax,
            qz = tz - u * 2.1 * ax + t * 2.6 * az;
          if (
            !ok(qx, qz) ||
            inCrossingRoad(qx, qz, self) ||
            !occFree(qx, qz, 1.0) ||
            blocked(qx, qz, 0.5) ||
            noCarZone(qx, qz, 1)
          )
            return false;
        }
      if (
        !put("triage_tent", rng() < 0.5 ? 1 : 0, tx, tz, ty, {
          r: 0,
          force: true,
        })
      )
        return false;
      for (const u of [-1, 0, 1])
        for (const t of [-1, 0, 1])
          occMark(
            tx + u * 2.1 * az + t * 2.6 * ax,
            tz - u * 2.1 * ax + t * 2.6 * az,
            1.4,
          );
      {
        const farLane = self.x - sideSign * 2.2;
        CLEAR.push([farLane - 1.5, tz - 10, farLane + 1.5, tz + 10]);
      }
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      // the overflow: body bags lined up along the building wall behind the tent
      if (wp) {
        const bx = Math.sin(yaw),
          bz = Math.cos(yaw); // toward the wall
        const wx = wp.x - bx * 1.35,
          wz = wp.z - bz * 1.35;
        put(
          "body_bag",
          2,
          wx + 1.2 * c,
          wz - 1.2 * s,
          yaw + (rng() - 0.5) * 0.08,
          { r: 0.5 },
        );
        if (rng() < 0.7)
          put(
            "body_bag",
            rng() < 0.5 ? 1 : 0,
            wx - 1.6 * c,
            wz + 1.6 * s,
            yaw + (rng() - 0.5) * 0.25,
            { r: 0.45 },
          );
      }
      put("sandbags", 0, tx - ax * 3.6, tz - az * 3.6, ty + PI / 2, { r: 1.2 });
      put("quarantine_sign", 0, x + 3.8 * c, z - 3.8 * s, yaw, { r: 0.9 });
      // tent-local (lx, lz) → world: local x = road direction (rx, rz), local z = (ax, az)
      const at = (lx, lz) => ({
        x: tx + rx * lx + ax * lz,
        z: tz + rz * lx + az * lz,
      });
      {
        const q = at(0.2, -1.95);
        P.spawn("first_aid", {
          x: q.x,
          y: groundAt(q.x, q.z),
          z: q.z,
          yaw: ty,
          persistent: true,
          name: "Army Medical Kit",
        });
      }
      if (rng() < 0.6) {
        const q = at(-0.42, -0.8);
        P.spawn("footlocker", {
          x: q.x,
          y: groundAt(q.x, q.z),
          z: q.z,
          yaw: ty + PI / 2,
          persistent: true,
          name: "Medical Supplies",
          loot: "medical_cabinet",
        });
      }
      return true;
    },
    // a sidewalk souvenir seller who stayed at his table
    vendor(x, z, yaw, wp, self) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw),
        rx = -Math.sin(yaw),
        rz = -Math.cos(yaw);
      const tx = x + rx * 0.6,
        tz = z + rz * 0.6; // toward the kerb
      if (
        !storefrontDoorClear(tx, tz, 2.5) ||
        !put(
          "vendor_table",
          rng() < 0.3 ? 1 : 0,
          tx,
          tz,
          yaw + PI + (rng() - 0.5) * 0.15,
          { r: 1.2, lootChance: 0.8 },
        )
      )
        return false;
      if (rng() < 0.6)
        put(
          "skeleton",
          4,
          tx + rx * 1.0 + 0.55 * c,
          tz + rz * 1.0 - 0.55 * s,
          yaw,
          { r: 0, noCollide: true, force: true },
        ); // still in his lawn chair
      put("litter", (rng() * 3) | 0, tx - rx * 1.2, tz - rz * 1.2, rng() * 6, {
        r: 0,
        noCollide: true,
      });
      return true;
    },
    bench_couple(x, z, yaw) {
      if (!put("bench", 0, x, z, yaw, { r: 1.2 })) return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("skeleton", 4, x - 0.45 * c, z + 0.45 * s, yaw, {
        r: 0,
        noCollide: true,
        force: true,
      });
      put("skeleton", 4, x + 0.45 * c, z - 0.45 * s, yaw + 0.1, {
        r: 0,
        noCollide: true,
        force: true,
      });
      return true;
    },
    phone_call(x, z, yaw) {
      if (!put("phone_booth", 0, x, z, yaw, { r: 0.9 })) return false;
      put("skeleton", 1, x, z, yaw + PI, {
        r: 0,
        noCollide: true,
        force: true,
      });
      return true;
    },
    mother_child(x, z, yaw) {
      if (!put("skeleton", 3, x, z, yaw, { r: 0.8 })) return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("skeleton", 6, x + 0.35 * c, z - 0.35 * s, yaw + 0.3, {
        r: 0,
        noCollide: true,
        force: true,
      });
      put("pram", 1, x - 1.4 * c + 0.6 * s, z + 1.4 * s + 0.6 * c, yaw + 1.2, {
        r: 0.6,
      });
      spawnDyn("teddy_bear", {
        x: x + 0.9 * c,
        z: z - 0.9 * s,
        yaw: yaw + 2,
        r: 0.2,
      });
      return true;
    },
    evacuation(x, z, yaw) {
      if (!put("bus_stop", 1, x, z, yaw, { r: 1.8 })) return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      for (let i = 0; i < 3; i++)
        put(
          "luggage",
          0,
          x + (-2 + i * 2) * c - 1.2 * s,
          z - (-2 + i * 2) * s - 1.2 * c,
          rng() * 6,
          { r: 0.6 },
        );
      put("skeleton", 4, x - 0.6 * c, z + 0.6 * s, yaw, {
        r: 0,
        noCollide: true,
        force: true,
      });
      put(
        "skeleton",
        0,
        x + 2.6 * c - 2.2 * s,
        z - 2.6 * s - 2.2 * c,
        yaw + 1.3,
        { r: 0.6 },
      );
      spawnDyn("duffle_bag", {
        x: x + 1.2 * c - 1.4 * s,
        z: z - 1.2 * s - 1.4 * c,
        yaw: rng() * 6,
        r: 0.4,
      });
      return true;
    },
    hobo_camp(x, z, yaw) {
      if (!spawnDyn("barrel", { x, z, burning: true, r: 0.6 })) return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("mattress", 0, x + 1.5 * s, z + 1.5 * c, yaw + 0.3, { r: 0.8 });
      put("shopping_cart", 0, x - 1.4 * c, z + 1.4 * s, yaw + 0.7, { r: 0.6 });
      put("garbage_bags", 2, x + 1.6 * c + 0.8 * s, z - 1.6 * s + 0.8 * c, 0, {
        r: 0.8,
      });
      put("skeleton", 1, x - 1.0 * c + 1.2 * s, z + 1.0 * s + 1.2 * c, yaw, {
        r: 0.5,
      });
      spawnDyn("scrip_stash", {
        x: x + 0.9 * s - 0.4 * c,
        z: z + 0.9 * c + 0.4 * s,
        yaw: rng() * 6,
        r: 0.3,
      });
      return true;
    },
    rad_dump(x, z, yaw) {
      if (!put("barrel", 1, x, z, yaw, { r: 0.6 })) return false;
      for (let i = 0; i < 4; i++)
        put(
          "barrel",
          rng() < 0.7 ? 1 : 5,
          x + (rng() - 0.5) * 3,
          z + (rng() - 0.5) * 3,
          rng() * 6,
          { r: 0.45 },
        );
      put("skeleton", 3, x + 1.8, z + 1.2, rng() * 6, { r: 0.6 });
      put("sawhorse", 0, x - 2.2, z, yaw, { r: 1.1 });
      return true;
    },
    last_stand(x, z, yaw) {
      const car = putCar("police", x, z, yaw + PI / 2, {
        burnt: false,
        stripped: true,
      });
      if (!car) return false;
      car.scene = true;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("sandbags", 0, x - 2.8 * s, z - 2.8 * c, yaw, { r: 1.2 });
      put(
        "skeleton",
        1,
        x - 1.6 * s + 1.2 * c,
        z - 1.6 * c - 1.2 * s,
        yaw + PI,
        { r: 0.5 },
      );
      put("skeleton", 2, x - 4.5 * s, z - 4.5 * c, yaw, { r: 0.6 });
      spawnDyn("ammo_box", {
        x: x - 1.8 * s - 1.2 * c,
        z: z - 1.8 * c + 1.2 * s,
        yaw,
        r: 0.4,
      });
      return true;
    },
    fizzo_spill(x, z, yaw) {
      const car = putCar("fizzo_truck", x, z, yaw, {
        burnt: rng() < 0.5,
        stripped: true,
        roll: 0.05,
      });
      if (!car) return false;
      car.scene = true;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      for (let i = 0; i < 5; i++)
        put(
          "crate",
          0,
          x + (2.5 + rng() * 2) * c + (rng() - 0.5) * 5 * s,
          z - (2.5 + rng() * 2) * s + (rng() - 0.5) * 5 * c,
          rng() * 6,
          { r: 0.5, rx: rng() < 0.4 ? PI / 2 : 0 },
        );
      spawnDyn("fizzo_cola", {
        x: x + 3 * c,
        z: z - 3 * s,
        yaw: rng() * 6,
        r: 0.2,
      });
      return true;
    },
  };
