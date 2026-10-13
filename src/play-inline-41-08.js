// play-inline-41 08 — math
// Lines 2068-2233 of readable/play-inline-41.pretty.js (statement-aligned).
  function spotPos(o) {
    const L = S.listenerPos,
      pr = SP.probe;
    if (o.near) {
      const a = nearPerson(G.player.pos, 16);
      if (a)
        return {
          x: a.pos.x + S.rand(-0.6, 0.6),
          y: a.pos.y + 1.1,
          z: a.pos.z + S.rand(-0.6, 0.6),
        };
      return null;
    }
    const i = (Math.random() * 8) | 0,
      ang = (i * Math.PI) / 4 + S.rand(-0.3, 0.3);
    const dWall = pr.valid ? pr.d[i] : 18;
    let dist;
    if (o.far) dist = Math.min(dWall, 45) + S.rand(5, 20);
    else if (o.wall) dist = Math.max(1.5, dWall - S.rand(0.3, 1.2));
    else dist = clamp(S.rand(0.35, 0.92) * dWall, 1.5, o.maxD || 40);
    const ceil = pr.valid ? pr.ceil : 10;
    const y = o.high
      ? L.y +
        S.rand(
          Math.min(3, ceil * 0.5),
          Math.max(2, Math.min(16, ceil - 1.7 - 0.4)),
        )
      : o.wall
        ? L.y - 1.5
        : L.y + S.rand(-1.2, 1.5);
    return { x: L.x + Math.cos(ang) * dist, y, z: L.z + Math.sin(ang) * dist };
  }
  /** Spot sounds for the current interior (called from the ambience update in play/goggles). */
  SP.spots = function (c, dt) {
    if (S.isStartLab(c.interior)) return;
    const A = ARCH[SP.arch] || ARCH.generic;
    // the first seconds after a door: let the space settle in before things start happening
    if (SP.entered) {
      SP.entered = false;
      SP.quietUntil = G.time.real + 4;
    }
    if (G.time.real < (SP.quietUntil || 0)) return;
    const small = SP.probe.valid && SP.cls === 0;
    for (const s of A.spots) {
      const name = s[0],
        rate = s[1] * (small && s[2] && s[2].high ? 0.3 : 1),
        o = s[2] || {};
      if (Math.random() >= (rate / 60) * dt) continue;
      if (S.R[name] && S.R[name].lazy && !S.cache[name]) {
        S.hintBake(name, 2);
        continue;
      } // never live-synthesise a lazy spot
      const pos = spotPos(o);
      if (!pos) continue;
      try {
        S.play(name, {
          pos,
          volume: (o.vol || 1) * (o.far ? 0.8 : 1) * S.rand(0.7, 1),
          pitch: o.pitch,
          noOcclusion: !o.far,
          distant: !!o.far,
        });
        // pigeons: a coo often answers another, flutters startle the others into cooing
        if (name === "pigeon_flutter" && Math.random() < 0.4)
          S.play("pigeon_coo", {
            pos: spotPos({ high: 1 }),
            delay: S.rand(1.5, 4),
            noOcclusion: true,
            volume: 0.7,
          });
        if (name === "pigeon_coo" && Math.random() < 0.35)
          S.play("pigeon_coo", {
            pos: {
              x: pos.x + S.rand(-3, 3),
              y: pos.y,
              z: pos.z + S.rand(-3, 3),
            },
            delay: S.rand(0.8, 2.2),
            noOcclusion: true,
            volume: 0.6,
            pitch: S.rand(0.92, 1.08),
          });
      } catch (e) {
        G.reportError("sound:space:" + name, e);
      }
    }
  };
  /** Outdoor extras: pigeons clapping off ledges in the street canyons by day; cooing under cover. */
  SP.outdoorSpots = function (c, dt) {
    const canyon =
      c.district === "midtown" ||
      c.district === "financial_district" ||
      c.district === "midtown_south" ||
      c.district === "lower_east_side" ||
      c.district === "village";
    const day =
      !c.night && c.weather !== "rain" && c.weather !== "thunderstorm";
    let rf = 0,
      rc = 0;
    if (day && canyon && c.alt < 12) rf = 0.35;
    if (day && c.covered) {
      rc = 0.9;
      rf += 0.15;
    }
    if (S.neonNear && S.neonNear(c.px, c.pz) > 0.5) {
      rf *= 0.3;
      rc *= 0.3;
    }
    const L = S.listenerPos;
    if (rf && Math.random() < (rf / 60) * dt) {
      if (!S.cache.pigeon_flutter) S.hintBake("pigeon_flutter", 3);
      else {
        const a = Math.random() * 6.283,
          d = S.rand(12, 40);
        S.play("pigeon_flutter", {
          pos: {
            x: L.x + Math.cos(a) * d,
            y: L.y + S.rand(8, 22),
            z: L.z + Math.sin(a) * d,
          },
          noOcclusion: true,
          volume: 0.8,
        });
      }
    }
    if (rc && Math.random() < (rc / 60) * dt) {
      if (!S.cache.pigeon_coo) S.hintBake("pigeon_coo", 3);
      else {
        const a = Math.random() * 6.283,
          d = S.rand(4, 14);
        S.play("pigeon_coo", {
          pos: {
            x: L.x + Math.cos(a) * d,
            y: L.y + S.rand(2, Math.max(2.5, c.roofH - 0.5)),
            z: L.z + Math.sin(a) * d,
          },
          noOcclusion: true,
          volume: 0.8,
        });
      }
    }
  };
  /** Leaving interiors: forget the room so the next door starts fresh. */
  SP.outside = function () {
    SP.key = null;
    SP.cls = -1;
    SP.probe.valid = false;
  };
  /** Diagnostics: current archetype, room size class, reverb. */
  SP.info = function () {
    return {
      key: SP.key,
      arch: SP.arch,
      span: +SP.probe.span.toFixed(1),
      ceil: +SP.probe.ceil.toFixed(1),
      cls: SP.cls,
      valid: SP.probe.valid,
      env: S.env.name,
      people: SP.people,
    };
  };
  SP.archOf = archOf;
  SP.NEW_BEDS = NEW_BEDS;

  // register the new beds with the ambience system
  if (S.amb && S.amb.addBeds) S.amb.addBeds(NEW_BEDS);
