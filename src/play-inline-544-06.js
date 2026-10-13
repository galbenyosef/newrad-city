// play-inline-544 06 — world
// Lines 1683-1992 of readable/play-inline-544.pretty.js (statement-aligned).
  function place() {
    if (WORLD.placed || !G.scene || !G.LAYOUT) return;
    WORLD.placed = true;
    buildShared();
    const t0 = performance.now();
    let n = 0;
    const add = (kind, id, spot, label, item, setId, skel, at) => {
      const SET = SETS[setId] || SETS.case;
      const s = at || findSpot(spot.hint, !!spot.allowSite, SET.clear);
      const yaw = isFinite(s.yaw) ? s.yaw : (G.util.hashStr(id) % 628) / 100;
      const root = new THREE.Group();
      root.position.set(s.x, s.y, s.z);
      root.rotation.y = yaw;
      root.name = "arc_" + kind + "_" + id;
      root.add(SET.build());
      const holder = new THREE.Group();
      holder.position.set(SET.item[0], SET.item[1], SET.item[2]);
      if (SET.tilt) holder.rotation.x = SET.tilt;
      holder.add(item);
      root.add(holder);
      G.scene.add(root);
      G.world.addLOD(
        root,
        s.interior ? 60 : kind === "mini" ? 150 : 140,
        root.position,
      );
      let collider = null;
      if (SET.box) {
        try {
          collider = G.world.addCollider(
            s.x,
            s.z,
            SET.box[0],
            SET.box[1],
            s.y,
            s.y + SET.box[2],
            yaw,
            {
              tag: "interactable_self",
              surface: setId === "cart" ? "metal" : "wood",
              walkable: false,
            },
          );
        } catch (e) {
          /* core */
        }
      }
      root.updateMatrixWorld(true);
      const lp = new THREE.Vector3(0, 0.16, 0);
      holder.localToWorld(lp);
      const labelPos = new THREE.Vector3(lp.x, lp.y, lp.z);
      const entry = {
        kind,
        id,
        set: setId,
        x: s.x,
        y: s.y,
        z: s.z,
        ok: s.ok,
        root,
        item: holder,
        collider,
        labelPos,
        area: spot.area || "",
        interactable: null,
        spin: item,
        glint: item.userData.glint || null,
        skeleton: null,
        anchor: s.anchor || null,
        interior: !!s.interior,
      };
      entry.interactable = G.world.addInteractable({
        pos: labelPos,
        radius: 0.5,
        range: 3,
        priority: 0.6,
        label,
        verb: kind === "flyer" ? "Take flyer" : "Take",
        enabled: () => !isFound(entry),
        onInteract: () => {
          if (isFound(entry)) return;
          if (kind === "flyer") takeFlyer();
          else AR.collect(kind, id);
        },
      });
      // a little story: a skeleton from the props kit (static, persistent)
      const sk = skel || SET.skel;
      if (sk && !G.isStub("props") && G.props.spawn) {
        const c = Math.cos(yaw),
          sn = Math.sin(yaw);
        const wx = s.x + sk.dx * c + sk.dz * sn,
          wz = s.z - sk.dx * sn + sk.dz * c;
        try {
          entry.skeleton = G.props.spawn("skeleton", {
            x: wx,
            y: s.y,
            z: wz,
            yaw: yaw + (sk.yaw || 0),
            pose: sk.pose,
            persistent: true,
            collide: false,
            id: "arc_skel_" + id,
          });
        } catch (e) {
          G.reportError("arcade:skeleton", e);
        }
      }
      WORLD.entries.push(entry);
      n++;
      return entry;
    };
    for (const c of AR.CABINETS) {
      try {
        if (addCabinet(c)) n++;
      } catch (e) {
        G.reportError("arcade:cabinet:" + c.id, e);
      }
    }
    for (let i = 0; i < AR.MINIS.length; i++) {
      const gl = AR.MINIS[i];
      const obj = mini(gl.id);
      obj.scale.setScalar(1.8);
      add(
        "mini",
        gl.id,
        gl,
        "Landmark Miniature - " + gl.name,
        obj,
        "cart",
        i % 3 === 1
          ? { pose: "sitting", dx: 1.05, dz: 0.2, yaw: -PI / 2 }
          : null,
      );
    }
    // the Keys to the City: each where its recipient left it
    for (const q of AR.KEYS) {
      const SET = SETS[q.set] || SETS.case;
      let at = null;
      try {
        at = keySpot(q, SET);
      } catch (e) {
        G.reportError("arcade:keySpot:" + q.id, e);
      }
      const e = add(
        "key",
        q.id,
        { hint: AR.keyHint(q), area: q.area },
        "Key to the City No. " + q.no + " (" + q.who + ")",
        keyObj(),
        q.set,
        null,
        at,
      );
      e.def = q;
    }
    // the flyers that start the hunt: Chambers Street by the cryo exit, and Gracie Mansion's front hall
    const ex = G.LAYOUT.cryoExit || { x: 157, z: 623 };
    add(
      "flyer",
      "flyer_chambers",
      { hint: { x: ex.x + 7, z: ex.z - 3 }, area: "Chambers Street" },
      'Flyer: "The Keys Come Home"',
      new THREE.Group(),
      "board",
    );
    const hall = {
      site: "gracie_mansion",
      anchors: ["hall", "entrance"],
      hint: AR.keyHint({ site: "gracie_mansion" }),
    };
    let hs = null;
    try {
      hs = keySpot(hall, SETS.board);
    } catch (e) {
      hs = null;
    }
    add(
      "flyer",
      "flyer_gracie",
      { hint: hall.hint, area: "Gracie Mansion" },
      'Flyer: "The Keys Come Home"',
      new THREE.Group(),
      "board",
      null,
      hs,
    );
    refresh();
    WORLD.placeMs = Math.round(performance.now() - t0);
    const bad = WORLD.entries.filter((e) => !e.ok).map((e) => e.id);
    if (bad.length)
      console.warn(
        "[arcade] no free spot found near hint for: " +
          bad.join(", ") +
          " (placed at hint)",
      );
    return n;
  }
  WORLD.place = place;

  function isFound(e) {
    const S = AR.STATE;
    if (e.kind === "flyer")
      return AR.quests && AR.quests.flyerTaken ? AR.quests.flyerTaken() : false;
    return e.kind === "mini"
      ? S.minis.has(e.id)
      : e.kind === "key"
        ? S.keys.has(e.id)
        : false;
  }
  /** The flyer board: hand over the note (the quest starts with it). The board itself stays. */
  function takeFlyer() {
    if (AR.quests && AR.quests.takeFlyer) AR.quests.takeFlyer();
    try {
      G.sfx.play("pickup_note", { volume: 0.7 });
    } catch (e) {
      /* stub */
    }
  }
  function refresh() {
    for (const e of WORLD.entries)
      if (e.kind !== "cabinet" && e.kind !== "flyer")
        e.item.visible = !isFound(e);
  }
  WORLD.refresh = refresh;
  WORLD.isFound = isFound;
  WORLD.placedCount = () => WORLD.entries.length;
  WORLD.entry = (kind, id) =>
    WORLD.entries.find((e) => e.kind === kind && e.id === id) || null;

  /**
   * Nearest not-yet-found collectible of a kind → {dist, dir, area, entry, def}. A key inside an interior
   * counts from its site's street location while the player is outdoors (and from the real spot when the
   * player is in the same interior cell).
   */
  const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  function proxyPos(e, P) {
    const IXM = G.LAYOUT.INTERIOR_X_MIN;
    if (!e.interior) return e;
    if (P.x >= IXM && Math.abs(e.x - P.x) < 200 && Math.abs(e.z - P.z) < 200)
      return e; // same cell
    const h = e.def ? AR.keyHint(e.def) : e;
    return { x: h.x, z: h.z };
  }
  WORLD.nearestUnfound = function (kind) {
    const P = G.player && G.player.pos;
    if (!P || !G.LAYOUT) return null;
    const inside = P.x >= G.LAYOUT.INTERIOR_X_MIN;
    let best = null,
      bd = 1e12,
      bp = null;
    for (const e of WORLD.entries) {
      if (e.kind !== kind || isFound(e)) continue;
      const q = proxyPos(e, P);
      if (inside && !(Math.abs(q.x - P.x) < 200 && Math.abs(q.z - P.z) < 200))
        continue; // indoors: only this cell's keys
      const d = (q.x - P.x) * (q.x - P.x) + (q.z - P.z) * (q.z - P.z);
      if (d < bd) {
        bd = d;
        best = e;
        bp = q;
      }
    }
    if (!best) return null;
    const ang = Math.atan2(bp.x - P.x, -(bp.z - P.z)); // 0 = north, clockwise
    const i = ((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8;
    return {
      dist: Math.sqrt(bd),
      dir: DIRS[i],
      area: best.def ? best.def.area : best.area,
      entry: best,
      def: best.def || null,
    };
  };
  /** Nearest missing key for the quest marker: the real spot (the quest engine routes through doors). */
  WORLD.nearestKeyEntry = function () {
    const P = G.player && G.player.pos;
    if (!P || !G.LAYOUT) return null;
    let best = null,
      bd = 1e18;
    for (const e of WORLD.entries) {
      if (e.kind !== "key" || isFound(e)) continue;
      const q = proxyPos(e, P);
      const d = (q.x - P.x) * (q.x - P.x) + (q.z - P.z) * (q.z - P.z);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  };
  /** Nearest cabinet (optionally of a game) → entry */
  WORLD.nearestCabinet = function (game, from) {
    const P = from || (G.player && G.player.pos);
    if (!P) return null;
    let best = null,
      bd = 1e18;
    for (const e of WORLD.entries) {
      if (e.kind !== "cabinet" || (game && e.game !== game)) continue;
      const d = (e.x - P.x) * (e.x - P.x) + (e.z - P.z) * (e.z - P.z);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  };

  /** Per-frame: glint pulse and the live attract demo on the nearest cabinet monitor. */
  const LIVE_R2 = 10 * 10,
    LIVE_DT = 1 / 12;
