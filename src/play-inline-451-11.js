// play-inline-451 11 — rng
// Lines 3037-3373 of readable/play-inline-451.pretty.js (statement-aligned).
  function dressShell(sf) {
    const w = Math.max(3, sf.w || 6),
      d = Math.max(3, sf.d || 6);
    const hw = w / 2,
      hd = d / 2;
    // forward (toward door/street) and lateral axes
    let fx, fz;
    if (sf.door && typeof sf.door.x === "number") {
      fx = sf.door.x - sf.x;
      fz = sf.door.z - sf.z;
    } else {
      const yw = sf.yaw || 0;
      fx = Math.sin(yw);
      fz = Math.cos(yw);
    }
    // the door may sit off-centre: snap the street direction to the room's axes (yaw ± k·90°)
    {
      const base = sf.yaw || 0,
        a = Math.atan2(fx, fz);
      const k = Math.round((a - base) / (PI / 2));
      const snapped = base + k * (PI / 2);
      fx = Math.sin(snapped);
      fz = Math.cos(snapped);
    }
    const lx = -fz,
      lz = fx;
    const at = (u, v) => ({
      x: sf.x + lx * u + fx * v,
      z: sf.z + lz * u + fz * v,
    });
    const toUV = (p) => {
      const dx = p.x - sf.x,
        dz = p.z - sf.z;
      return { u: dx * lx + dz * lz, v: dx * fx + dz * fz };
    };
    const yawFacing = (dx, dz) => Math.atan2(-dx, -dz);
    const faceStreet = yawFacing(fx, fz),
      faceBack = faceStreet + PI;
    const floorY =
      sf.floorY !== undefined
        ? sf.floorY
        : sf.y !== undefined
          ? sf.y
          : groundAt(sf.x, sf.z);
    const loot = (Array.isArray(sf.loot) ? sf.loot : [])
      .filter((l) => l && typeof l.x === "number")
      .map(toUV);
    const taken = loot.map((p) => ({ u: p.u, v: p.v, r: 0.9 }));
    const doorUV = sf.door ? toUV(sf.door) : { u: 0, v: hd + 1 };
    taken.push({ u: doorUV.u, v: hd - 0.6, r: 1.4 }); // keep the doorway clear
    const free = (u, v, r) => {
      if (Math.abs(u) > hw - 0.25 || Math.abs(v) > hd - 0.25) return false;
      for (const t of taken)
        if (Math.hypot(t.u - u, t.v - v) < t.r + r) return false;
      return true;
    };
    const take = (u, v, r) => taken.push({ u, v, r });
    const log = ((X.shellLog = X.shellLog || {})[sf.id || "shell"] = []);
    const place = (name, variant, u, v, yaw, o) => {
      const p = at(u, v);
      log.push([name, +p.x.toFixed(1), +p.z.toFixed(1), +yaw.toFixed(2)]);
      return put(
        name,
        variant,
        p.x,
        p.z,
        yaw,
        Object.assign({ force: true, r: 0, y: floorY }, o || {}),
      );
    };
    // counter side = lateral side of the map's behind-counter loot (2nd spot), else random
    const s = loot.length > 1 ? (loot[1].u < 0 ? -1 : 1) : rng() < 0.5 ? -1 : 1;
    const cLen = Math.min(0.5 * w, w - 2.2);
    const cv = [2.0, 2.6, 3.2, 3.8].reduce(
      (bi, L, i, arr) =>
        Math.abs(L - cLen) < Math.abs(arr[bi] - cLen) ? i : bi,
      0,
    );
    const CL = [2.0, 2.6, 3.2, 3.8][cv];
    const cu = s * (hw - 0.8 - CL / 2),
      cvv = Math.min(0.3, hd - 1.8);
    // counter faces the street; its local +x (display-case end) is the +u direction
    const cYaw = faceStreet;
    if (CL + 1.2 < w && hd > 1.8) {
      place("shop_counter", cv, cu, cvv, cYaw, { r: 0 });
      take(cu, cvv, CL / 2);
      // cash register on the countertop (lootable)
      const caseW = Math.min(1.1, CL * 0.38),
        bodyW = CL - caseW;
      const ru = cu - CL / 2 + bodyW * 0.62;
      // keys toward the clerk (behind the counter)
      place(
        "cash_register",
        0,
        ru,
        cvv + 0.02,
        faceBack + (rng() - 0.5) * 0.3,
        { y: floorY + 1.0, noCollide: true },
      );
      // a stool or overturned chair behind the counter
      if (rng() < 0.6)
        place(
          "chair",
          rng() < 0.5 ? 0 : 1,
          cu + (rng() - 0.5) * CL * 0.5,
          cvv - 0.9,
          faceStreet + (rng() - 0.5) * 1.2,
          { r: 0, rz: rng() < 0.3 ? PI / 2 : 0 },
        );
    }
    const shelfV = () => {
      const t = rng();
      return t < 0.58 ? 0 : t < 0.94 ? 1 : 2;
    };
    // shelving along the opposite wall (fronts facing the room), toppled now and then
    const su = -s * (hw - 0.3);
    const sideYaw = yawFacing(lx * s, lz * s); // face toward the counter side (room centre)
    for (let v = hd - 1.3; v > -hd + 1.0; v -= 1.95) {
      if (!free(su, v, 0.7)) continue;
      const topple = rng() < 0.15;
      if (topple) {
        place("shelf", 1, su + s * 0.9, v, sideYaw, {
          rx: -PI / 2 + 0.05,
          y: floorY + 0.28,
        });
        place("floor_goods", 1, su + s * 1.9, v, rng() * 6, {
          noCollide: true,
        });
      } else {
        place("shelf", shelfV(), su, v, sideYaw + (rng() - 0.5) * 0.05);
        if (rng() < 0.55)
          place(
            "floor_goods",
            0,
            su + s * 0.95,
            v + (rng() - 0.5) * 0.8,
            rng() * 6,
            { noCollide: true },
          );
      }
      take(su, v, 0.9);
    }
    // a centre gondola (two shelves back to back) in wider shops
    if (w > 7.5) {
      const gu = -s * (hw * 0.15),
        gv = hd * 0.05;
      if (free(gu, gv, 0.9)) {
        place("shelf", shelfV(), gu, gv + 0.26, faceStreet);
        place("shelf", shelfV(), gu, gv - 0.26, faceBack); // back to back, fronts outward
        take(gu, gv, 1.0);
        if (rng() < 0.6) {
          const fv = gv - 1.0;
          if (free(gu, fv, 0.5)) {
            place("floor_goods", (rng() * 2) | 0, gu, fv, rng() * 6, {
              noCollide: true,
            });
            take(gu, fv, 0.5);
          }
        }
      }
    }
    // back-wall shelf on the counter side, if the map left it free
    const bu = s * (hw - 1.2),
      bv = -hd + 0.35;
    if (free(bu, bv, 0.6)) {
      place("shelf", shelfV(), bu, bv, faceStreet);
      take(bu, bv, 0.9);
    }
    // signage: CHECKOUT above the till on the back wall, sale / price / poster sheets on the walls
    place("wall_sign", 0, cu, -hd + 0.02, faceStreet, { noCollide: true });
    for (let i = 0, n = 1 + ((rng() * 3) | 0); i < n; i++) {
      const wv = (rng() - 0.5) * (d - 2),
        wsg = rng() < 0.5 ? -1 : 1;
      place(
        "wall_sign",
        1 + ((rng() * (X.WALL_SIGNS - 1)) | 0),
        wsg * (hw - 0.02),
        wv,
        yawFacing(lx * -wsg, lz * -wsg),
        { noCollide: true },
      );
    }
    // pendant lamp over the till (most still glow faintly — somebody keeps the generator ticking) + one mid-room
    place("shop_lamp", rng() < 0.75 ? 1 : 2, cu, cvv - 0.2, 0, {
      noCollide: true,
    });
    if (d > 5 && rng() < 0.6)
      place("shop_lamp", rng() < 0.5 ? 0 : 2, -s * hw * 0.3, -hd * 0.2, 0, {
        noCollide: true,
      });
    // a Fizzo Cola machine or Civil Defense kiosk against the front wall, beside the door
    {
      const nu = doorUV.u > 0 ? doorUV.u - 1.9 : doorUV.u + 1.9,
        nv = hd - 0.45;
      if (Math.abs(nu) < hw - 0.5 && free(nu, nv, 0.5)) {
        if (rng() < 0.7)
          place(
            "fizzo_machine",
            rng() < 0.15 ? 2 : rng() < 0.5 ? 1 : 0,
            nu,
            nv,
            faceBack,
            { lootChance: 0.6 },
          );
        else place("ocd_kiosk", 0, nu, nv, faceBack);
        take(nu, nv, 0.7);
      }
    }
    // clutter: litter, a garbage pile, a fallen crate, spilled goods, maybe a skeleton by the till
    for (let i = 0, nc = 6 + (((w * d) / 22) | 0); i < nc; i++) {
      const u = (rng() - 0.5) * (w - 1.2),
        v = (rng() - 0.5) * (d - 1.2);
      if (!free(u, v, 0.4)) continue;
      const t = rng();
      if (t < 0.38)
        place("litter", (rng() * 3) | 0, u, v, rng() * 6, { noCollide: true });
      else if (t < 0.52)
        place("floor_goods", (rng() * 2) | 0, u, v, rng() * 6, {
          noCollide: true,
        });
      else if (t < 0.64)
        place("garbage_bags", (rng() * 2) | 0, u, v, rng() * 6);
      else if (t < 0.76)
        place("crate", (rng() * 3) | 0, u, v, rng() * 6, { container: false });
      else if (t < 0.84) {
        const tip = rng() < 0.5;
        place("trash_can", 0, u, v, rng() * 6, {
          rx: tip ? PI / 2 : 0,
          y: floorY + (tip ? 0.28 : 0),
        });
      } else if (t < 0.92)
        place("debris", 0, u, v, rng() * 6, { noCollide: true });
      else place("rubble", 0, u, v, rng() * 6, { noCollide: true });
      take(u, v, 0.5);
    }
    if (rng() < 0.35) {
      const u = cu + (rng() - 0.5) * 0.8,
        v = cvv + 0.9;
      if (free(u, v, 0.5)) {
        place("skeleton", rng() < 0.5 ? 0 : 3, u, v, rng() * 6, {
          noCollide: true,
        });
        take(u, v, 0.6);
      }
    }
    return true;
  }

  // ------------------------------------------------------------------
  // Scatter containers lifecycle (created once G.containers exists)
  // ------------------------------------------------------------------
  // Loot tables for props' own set pieces, registered with rpg's public G.items API the first time the
  // containers are made (rpg loads after props). If rpg lacks the API, each container falls back to its
  // defLoot (a stock rpg table). rpg is welcome to take these over (see NOTES.md).
  let lootDefined = false;
  function defineOwnLoot() {
    if (lootDefined) return;
    try {
      if (
        G.isStub("items") ||
        typeof G.items.defineLootTable !== "function" ||
        typeof G.items.hasLootTable !== "function"
      )
        return;
      lootDefined = true;
      const T = (id, t) => {
        if (!G.items.hasLootTable(id)) G.items.defineLootTable(id, t);
      };
      const R = (chance, picks, entries) => ({ chance, picks, entries });
      // an open, picked-over newsstand: paper, smokes, candy, a little scrip — no training manuals
      T("props_newsstand", {
        rolls: [
          R(
            0.85,
            [1, 2],
            [
              { id: "old_world_book", w: 3 },
              { id: "ruined_book", w: 4 },
              { id: "cigarettes", w: 2 },
              { id: "bubblegum", w: 1.5 },
              { id: "licorice_twists", w: 1 },
              { id: "fizzo_cola", w: 1 },
              { id: "old_dollars", w: 1 },
            ],
          ),
          R(0.35, 1, [{ scrip: [2, 9] }]),
        ],
      });
      // the shuttered ones were never looted: more of the same, a carton, and the only newsstand manuals (~8%)
      T("props_newsstand_shut", {
        rolls: [
          R(1, [1, 3], [{ table: "props_newsstand" }]),
          R(0.6, 1, [{ scrip: [4, 18] }, { id: "cigarette_carton", w: 0.6 }]),
          R(0.08, 1, [{ tag: "skill_book" }]),
        ],
      });
      T("props_vendor", {
        rolls: [
          R(
            0.9,
            [1, 2],
            [
              { id: "souvenir_paperweight", w: 1 },
              { id: "souvenir_statue", w: 2 },
              { id: "sunglasses", w: 1.5 },
              { id: "baseball_cap", w: 1 },
              { id: "toy_car", w: 1 },
              { id: "cigarettes", w: 1 },
            ],
          ),
          R(0.4, 1, [{ scrip: [3, 15] }, { id: "old_dollars", w: 1 }]),
        ],
      });
      T("props_car_trunk", {
        rolls: [
          R(
            0.8,
            [1, 2],
            [
              { table: "luggage", w: 3 },
              { table: "junk_household", w: 2 },
              { id: "tin_can", w: 1 },
              { id: "scrap_metal", w: 1.5 },
              { id: "duct_tape", w: 0.6 },
            ],
          ),
          R(0.2, 1, [
            { id: "dry_cell", w: 1 },
            { id: "gas_igniter", w: 0.6 },
            { table: "toolbox", w: 1 },
          ]),
        ],
      });
    } catch (e) {
      G.reportError("props:loot", e);
    }
  }
