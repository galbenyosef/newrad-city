// play-inline-451 07 — rng
// Lines 1692-1965 of readable/play-inline-451.pretty.js (statement-aligned).
  function barricade(p, style, l) {
    const w = p.corr.width,
      across = p.along === "ns" ? 0 : PI / 2; // yaw so the prop's local x runs across the road
    const dirx = p.along === "ns" ? 1 : 0,
      dirz = p.along === "ns" ? 0 : 1;
    const gap = (rng() - 0.5) * (w * 0.4);
    const pos = (t) => ({ x: p.x + dirx * t, z: p.z + dirz * t });
    for (
      let t = -w / 2 + 1.5;
      t < w / 2 - 1;
      t +=
        style === "raider" || style === "settler"
          ? 3.4
          : style === "brute"
            ? 5.5
            : 3.0
    ) {
      if (Math.abs(t - gap) < 2.2) continue;
      const q = pos(t);
      if (style === "raider" || style === "settler") {
        if (rng() < 0.3)
          putCar(
            pickCarKind("x", "traffic"),
            q.x,
            q.z,
            across + PI / 2 + (rng() - 0.5) * 0.3,
            { burnt: true, stripped: true },
          );
        else
          put(
            "raider_wall",
            (rng() * 4) | 0,
            q.x,
            q.z,
            across + (rng() - 0.5) * 0.12,
            { r: 1.2 },
          );
      } else if (style === "brute") {
        putCar(
          pickCarKind("x", "traffic"),
          q.x,
          q.z,
          across + PI / 2 + (rng() - 0.5) * 0.5,
          { burnt: true, stripped: true },
        );
      } else if (style === "covenant") {
        put(
          rng() < 0.6 ? "sandbags" : "jersey_barrier",
          rng() < 0.3 ? 3 : 0,
          q.x,
          q.z,
          across,
          { r: 1.2 },
        );
      } else {
        put("jersey_barrier", 0, q.x, q.z, across, { r: 1.2 });
      }
    }
    // decoration on both sides of the line
    const sideSpot = (k) => {
      const t = (rng() - 0.5) * (w - 3);
      const s2 = rng() < 0.5 ? -1 : 1;
      return {
        x: p.x + dirx * t + (p.along === "ew" ? s2 * k : 0),
        z: p.z + dirz * t + (p.along === "ns" ? s2 * k : 0),
      };
    };
    if (style === "raider") {
      for (let i = 0; i < 2; i++) {
        const q = sideSpot(3 + rng() * 3);
        put("skull_pike", 0, q.x, q.z, rng() * 6, { r: 0.3 });
      }
      {
        const q = sideSpot(4);
        spawnDyn("barrel", { x: q.x, z: q.z, burning: true, r: 0.5 });
      }
      {
        const q = sideSpot(5);
        put("mattress", 0, q.x, q.z, rng() * 6, { r: 1.0 });
      }
      {
        const q = sideSpot(4.5);
        put("tire", 1, q.x, q.z, 0, { r: 0.5 });
      }
      {
        const q = sideSpot(6);
        spawnDyn(rng() < 0.5 ? "footlocker" : "ammo_box", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.5,
          owner: "raiders",
        });
      }
      if (rng() < 0.5) {
        const q = sideSpot(7);
        spawnDyn("barrel", { x: q.x, z: q.z, explosive: true, r: 0.5 });
      }
    } else if (style === "brute") {
      for (let i = 0; i < 3; i++) {
        const q = sideSpot(3 + rng() * 5);
        put("gore_bag", 0, q.x, q.z, rng() * 6, { r: 0.4 });
      }
      for (let i = 0; i < 2; i++) {
        const q = sideSpot(4 + rng() * 4);
        put("skeleton", (rng() * 4) | 0, q.x, q.z, rng() * 6, { r: 0.6 });
      }
      {
        const q = sideSpot(5);
        spawnDyn("barrel", { x: q.x, z: q.z, burning: true, r: 0.5 });
      }
      {
        const q = sideSpot(6);
        spawnDyn("footlocker", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.5,
          owner: "brutes",
        });
      }
    } else if (style === "covenant") {
      {
        const q = sideSpot(4);
        put("crate", 2, q.x, q.z, rng() * 6, { r: 0.8 });
      }
      {
        const q = sideSpot(5);
        spawnDyn("ammo_box", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.4,
          owner: "covenant",
        });
      }
      {
        const q = sideSpot(3.5);
        spawnDyn("turret", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.8,
          faction: "covenant",
          hostile: false,
        });
      }
      {
        const q = sideSpot(6);
        put("lamp_post", 3, q.x, q.z, rng() * 6, { r: 0.5 });
      }
      {
        const q = sideSpot(2.5);
        put("poster_board", 0, q.x, q.z, across, { r: 1.2 });
      }
    } else if (style === "continuity") {
      {
        const q = sideSpot(3.5);
        spawnDyn("turret", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.8,
          faction: "continuity",
          hostile: true,
          continuity: true,
        });
      }
      {
        const q = sideSpot(5);
        put("crate", 2, q.x, q.z, rng() * 6, { r: 0.8 });
      }
      {
        const q = sideSpot(5);
        spawnDyn("ammo_box", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.4,
          large: true,
          owner: "continuity",
        });
      }
    } else if (style === "settler") {
      {
        const q = sideSpot(3);
        spawnDyn("barrel", { x: q.x, z: q.z, burning: true, r: 0.5 });
      }
      {
        const q = sideSpot(4);
        put("lamp", 3, q.x, q.z, rng() * 6, { r: 0.4 });
      }
      {
        const q = sideSpot(5);
        put("sandwich_board", 1, q.x, q.z, rng() * 6, { r: 0.4 });
      }
    }
    // hand-painted signs facing whoever approaches (away from the location)
    if (l && (style === "raider" || style === "settler")) {
      const outYaw = (q) =>
        Math.atan2(-(q.x - l.x), -(q.z - l.z)) + (rng() - 0.5) * 0.3;
      const texts =
        style === "raider"
          ? [0, 0]
          : GREETING_TOWNS.has(l.id)
            ? [5, 2]
            : [2, rng() < 0.5 ? 1 : 5];
      for (const t of texts) {
        const q = sideSpot(2 + rng() * 3);
        put("scav_sign", t, q.x, q.z, outYaw(q), { r: 0.3 });
      }
      // settlers warn travellers away from raider turf further out
      if (style === "raider") {
        const q = { x: p.x + (p.x - l.x) * 0.35, z: p.z + (p.z - l.z) * 0.35 };
        if (ok(q.x, q.z) && !L.isRoad(q.x, q.z))
          put("scav_sign", 3, q.x, q.z, outYaw(q), { r: 0.3 });
      }
    }
  }
  function dressLocations() {
    for (const l of L.LOCATIONS) {
      if (l.interior || l.id === "cryo_c9") continue;
      const pts = approachPoints(l);
      if (!pts.length) continue;
      let style = null;
      const f = fac(l);
      if (f === "raiders") style = "raider";
      else if (f === "brutes") style = "brute";
      else if (f === "covenant") style = "covenant";
      else if (f === "continuity") style = "continuity";
      else if (f === "settlers") style = "settler";
      if (style) {
        const n = Math.min(pts.length, style === "settler" ? 2 : 3);
        // pick spread-out approach points
        const chosen = pts.sort(() => rng() - 0.5).slice(0, n);
        for (const p of chosen) barricade(p, style, l);
      }
      // faction flavour scattered around the location
      if (f === "glowkeepers") {
        for (let i = 0; i < 7; i++) {
          const a = rng() * PI * 2,
            d = l.r + 4 + rng() * 14;
          const x = l.x + Math.cos(a) * d,
            z = l.z + Math.sin(a) * d;
          if (L.isRoad(x, z)) put("barrel", 1, x, z, rng() * 6, { r: 0.8 });
        }
      }
      if (f === "maniacs") {
        for (let i = 0; i < 6; i++) {
          const a = rng() * PI * 2,
            d = l.r + 3 + rng() * 15;
          const x = l.x + Math.cos(a) * d,
            z = l.z + Math.sin(a) * d;
          if (L.isRoad(x, z))
            put("skeleton", (rng() * 4) | 0, x, z, rng() * 6, { r: 0.6 });
        }
        const p = pts[0];
        if (p)
          for (let i = -1; i <= 1; i++)
            put(
              "sawhorse",
              i === 0 ? 2 : 0,
              p.x + (p.along === "ns" ? i * 2.5 : 0),
              p.z + (p.along === "ew" ? i * 2.5 : 0),
              p.along === "ns" ? 0 : PI / 2,
              { r: 1.1 },
            );
      }
    }
  }

  // ------------------------------------------------------------------
  // Environmental storytelling vignettes (on sidewalks/roads)
  // ------------------------------------------------------------------
