// play-inline-451 02 — pad
// Lines 358-451 of readable/play-inline-451.pretty.js (statement-aligned).
  function putTruck(v, x, z, yaw, o) {
    o = o || {};
    if (!ok(x, z) || noCarZone(x, z, 4)) return null;
    const fx = -Math.sin(yaw),
      fz = -Math.cos(yaw),
      len = 7.4;
    for (let i = 0; i < 4; i++) {
      const t = (i / 3 - 0.5) * (len - 1.6),
        px = x + fx * t,
        pz = z + fz * t;
      if (!ok(px, pz) || !occFree(px, pz, 1.15) || blocked(px, pz, 1.0))
        return null;
    }
    const placed = put("army_truck", v, x, z, yaw, {
      force: true,
      r: 0,
      lootChance: o.lootChance !== undefined ? o.lootChance : 0.5,
      rz: v === 2 ? (rng() - 0.5) * 0.05 : 0,
    });
    if (placed)
      for (let i = 0; i < 4; i++) {
        const t = (i / 3 - 0.5) * (len - 1.6);
        occMark(x + fx * t, z + fz * t, 1.2);
      }
    return placed;
  }
  function pickCarKind(district, lane) {
    const t = rng();
    const taxiP =
      district === "midtown" || district === "midtown_south" ? 0.2 : 0.08;
    if (lane === "traffic" && t < 0.05) return "bus";
    if (t < taxiP) return "taxi";
    const u = rng();
    if (u < 0.36) return "sedan";
    if (u < 0.68) return "coupe";
    if (u < 0.78) return "van";
    if (u < 0.86) return "pickup";
    if (u < 0.92) return "police";
    return lane === "parking" && rng() < 0.6 ? "fizzo_truck" : "sedan";
  }
  /** Is (x,z) inside some OTHER corridor (intersection zone)? pad in metres. */
  function inCrossing(x, z, self, pad) {
    pad = pad || 0;
    for (const s of L.streets)
      if (
        s !== self &&
        x >= s.x0 - pad &&
        x <= s.x1 + pad &&
        Math.abs(z - s.z) <= s.width / 2 + pad
      )
        return true;
    for (const a of L.avenues)
      if (
        a !== self &&
        z >= a.z0 - pad &&
        z <= a.z1 + pad &&
        Math.abs(x - a.x) <= a.width / 2 + pad
      )
        return true;
    return false;
  }
  function nearLocation(x, z, pad, pred) {
    for (const l of L.LOCATIONS) {
      if (l.interior) continue;
      if (pred && !pred(l)) continue;
      if (Math.hypot(x - l.x, z - l.z) < l.r + pad) return l;
    }
    return null;
  }
  /** Per-instance shade of old enamel for the tintable Patrolman shells. */
  const robotTint = () =>
    [0xffffff, 0xf4ecd8, 0xece2c2, 0xe0d8c8, 0xfff2d0, 0xd8ccb0][
      (rng() * 6) | 0
    ];
  /** A location's faction id. */
  const fac = (l) => l.faction;
  /** Trade towns that greet travellers with FRIENDLY / TRADE boards (the Neon and its sister towns). */
  const GREETING_TOWNS = new Set([
    "times_square",
    "chelsea_hotel",
    "ellis_island",
    "gracie_mansion",
    "lyceum_theatre",
  ]);
  const isSettlement = (l) =>
    !l.hostile &&
    (l.type === "settlement" || fac(l) === "settlers" || fac(l) === "covenant");

  // ------------------------------------------------------------------
  // A generic sidewalk dresser. Works in corridor-local coordinates:
  //   along = distance along the corridor, across = signed offset from the
  //   corridor centre line. frame(along, across) → {x, z}; faceYaw(side)
  //   gives the yaw that makes a prop's front (-z) face the roadway.
  // ------------------------------------------------------------------
