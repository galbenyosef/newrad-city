// play-inline-451 10 — rng
// Lines 2848-3036 of readable/play-inline-451.pretty.js (statement-aligned).
  function dressBrooklyn() {
    const xs = [550, 620, 690, 760],
      zs = [460, 520, 580, 640, 700, 760, 820, 880, 940];
    // lanes between warehouse blocks: cars, trucks, clutter
    for (const x of xs)
      for (let z = 400; z < 980; z += 7 + rng() * 10) {
        if (!L.isBrooklyn(x, z)) continue;
        const t = rng();
        if (t < 0.08)
          putCar(
            rng() < 0.3 ? "fizzo_truck" : rng() < 0.5 ? "pickup" : "van",
            x + (rng() < 0.5 ? -3.5 : 3.5),
            z,
            (rng() < 0.5 ? 0 : PI) + (rng() - 0.5) * 0.2,
          );
        else if (t < 0.3)
          put(
            "barrel",
            rng() < 0.15 ? 1 : rng() < 0.5 ? 0 : 5,
            x + (rng() - 0.5) * 10,
            z,
            rng() * 6,
            { r: 0.5 },
          );
        else if (t < 0.4)
          put("pallet", (rng() * 3) | 0, x + (rng() - 0.5) * 10, z, rng() * 6, {
            r: 0.9,
          });
        else if (t < 0.47)
          put(
            "crate_stack",
            (rng() * 2) | 0,
            x + (rng() < 0.5 ? -5 : 5),
            z,
            PI / 2,
            { r: 1.6 },
          );
        else if (t < 0.52)
          put("garbage_bags", 1, x + (rng() - 0.5) * 10, z, rng() * 6, {
            r: 0.8,
          });
        else if (t < 0.55)
          put("litter", 1, x + (rng() - 0.5) * 8, z, rng() * 6, {
            r: 0,
            noCollide: true,
          });
      }
    for (const z of zs)
      for (let x = 480; x < 800; x += 8 + rng() * 12) {
        if (!L.isBrooklyn(x, z)) continue;
        const t = rng();
        if (t < 0.22)
          put(
            "shipping_container",
            (rng() * 4) | 0,
            x,
            z + (rng() < 0.5 ? -3 : 3),
            (rng() - 0.5) * 0.1,
            { r: 3.2 },
          );
        else if (t < 0.27)
          putCar(
            pickCarKind("brooklyn", "parking"),
            x,
            z + (rng() < 0.5 ? -3.5 : 3.5),
            (rng() < 0.5 ? PI / 2 : -PI / 2) + (rng() - 0.5) * 0.2,
          );
        else if (t < 0.4)
          put("chainlink", rng() < 0.5 ? 1 : 2, x, z + 6.5, 0, { r: 1.6 });
        else if (t < 0.46)
          put(
            "dumpster",
            (rng() * 3) | 0,
            x,
            z + (rng() < 0.5 ? -5.5 : 5.5),
            (PI / 2) * (rng() < 0.5 ? 1 : -1),
            { r: 1.2, lootChance: 1 },
          );
        else if (t < 0.52)
          put("crate", (rng() * 5) | 0, x, z + (rng() - 0.5) * 8, rng() * 6, {
            r: 0.6,
          });
        else if (t < 0.56)
          put("tire", 1, x, z + (rng() - 0.5) * 8, 0, { r: 0.5 });
      }
    // stacked containers (two-high) near the navy yard
    for (let i = 0; i < 6; i++) {
      const x = 700 + rng() * 80,
        z = 640 + rng() * 120;
      if (!L.isBrooklyn(x, z)) continue;
      const yaw = rng() < 0.5 ? 0 : PI / 2;
      if (put("shipping_container", (rng() * 4) | 0, x, z, yaw, { r: 3.4 }))
        put(
          "shipping_container",
          (rng() * 4) | 0,
          x,
          z,
          yaw + (rng() - 0.5) * 0.08,
          { r: 0, y: groundAt(x, z) + 2.6, force: true, noCollide: false },
        );
    }
  }

  // ------------------------------------------------------------------
  // Landmark anchors & map storefronts → containers
  // ------------------------------------------------------------------
  function anchorContainers() {
    const LM = G.landmarks;
    if (!LM || G.isStub("landmarks")) return;
    let n = 0;
    for (const id of Object.keys(LM)) {
      const lm = LM[id];
      if (!lm || typeof lm !== "object" || !lm.anchors) continue;
      for (const name of Object.keys(lm.anchors)) {
        const p = lm.anchors[name];
        if (!p || typeof p.x !== "number") continue;
        const nm = name.toLowerCase();
        let type = null,
          extra = {};
        if (/safe/.test(nm)) type = "safe";
        else if (/ammo/.test(nm)) type = "ammo_box";
        else if (/locker/.test(nm)) type = "locker";
        else if (/first_?aid|medkit|medic/.test(nm)) {
          type = "first_aid";
          extra.floor = true;
        } else if (/stash/.test(nm)) type = "scrip_stash";
        else if (/fridge/.test(nm)) type = "fridge";
        else if (/desk/.test(nm)) type = "desk";
        else if (/loot|container|cache|chest|crate|footlocker/.test(nm))
          type =
            n % 3 === 0 ? "footlocker" : n % 3 === 1 ? "toolbox" : "duffle_bag";
        if (!type) continue;
        P.spawn(
          type,
          Object.assign(
            {
              x: p.x,
              y: p.y !== undefined ? p.y : undefined,
              z: p.z,
              yaw: p.yaw !== undefined ? p.yaw : rng() * 6,
              persistent: true,
              id: "lm:" + id + ":" + name,
            },
            extra,
          ),
        );
        n++;
      }
    }
    stats.anchorContainers = n;
  }
  /**
   * Furnish the map's enterable storefront shells (G.map.getStorefronts():
   * {id,x,z,yaw,w,d,y,door,loot}). The frame is derived from the door point so
   * it doesn't depend on the map's yaw convention: v+ runs toward the street
   * door, u is lateral. The map spawns its own loot spots (back-corner safe /
   * cabinet, a container behind the counter, maybe a Fizzo machine on the back
   * wall); the counter goes on the same side as the behind-counter loot so the
   * clerk area reads right, shelves line the opposite wall, and everything
   * keeps clear of the map's loot points and the doorway.
   * Static furniture goes into the chunk batches (a shell costs no extra draw
   * calls); the cash register becomes a scatter container.
   */
  function storefrontDressing() {
    let list = null;
    try {
      if (!G.isStub("map")) {
        if (typeof G.map.getStorefronts === "function")
          list = G.map.getStorefronts();
        else if (Array.isArray(G.map.storefronts)) list = G.map.storefronts;
      }
    } catch (e) {
      list = null;
    }
    if (!Array.isArray(list)) {
      stats.storefronts = 0;
      return;
    }
    let n = 0;
    for (const sf of list) {
      if (!sf || typeof sf.x !== "number" || typeof sf.z !== "number") continue;
      if (sf.dressed) continue; // the map furnished it itself
      X.safe(() => {
        if (dressShell(sf)) n++;
      }, "shell");
      if (n > 80) break;
    }
    stats.storefronts = n;
  }
