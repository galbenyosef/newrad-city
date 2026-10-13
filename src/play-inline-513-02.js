// play-inline-513 02 — math
// Lines 368-685 of readable/play-inline-513.pretty.js (statement-aligned).
  function signTexture() {
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 160;
    const x = cv.getContext("2d");
    x.fillStyle = "#6b5236";
    x.fillRect(0, 0, 256, 160);
    for (let i = 0; i < 14; i++) {
      x.fillStyle = "rgba(40,26,14," + (0.15 + Math.random() * 0.2) + ")";
      x.fillRect(0, i * 12 + Math.random() * 4, 256, 2);
    }
    x.save();
    x.translate(128, 62);
    x.rotate(-0.04);
    x.fillStyle = "#b21b12";
    x.font = 'bold 58px Impact, "Arial Black", sans-serif';
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText("DANGER", 0, 0);
    x.font = 'bold 22px "Courier New", monospace';
    x.fillStyle = "#e8dcc0";
    x.fillText("RIPJAWS", 0, 44);
    x.font = 'bold 17px "Courier New", monospace';
    x.fillText("TURN BACK", 0, 68);
    x.restore();
    // drips & grime
    x.fillStyle = "rgba(150,20,10,0.8)";
    for (let i = 0; i < 9; i++) {
      const dx = 40 + Math.random() * 176;
      x.fillRect(dx, 80 - Math.random() * 30, 2, 8 + Math.random() * 22);
    }
    x.fillStyle = "rgba(20,14,8,0.35)";
    for (let i = 0; i < 60; i++)
      x.fillRect(
        Math.random() * 256,
        Math.random() * 160,
        2 + Math.random() * 5,
        2 + Math.random() * 5,
      );
    const tex = new THREE.CanvasTexture(cv);
    if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
    else tex.encoding = THREE.sRGBEncoding;
    return tex;
  }
  function buildSign(x, y, z, yaw) {
    const grp = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({
      color: 0x4a3622,
      roughness: 0.95,
    });
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.13, 2.3, 0.13), wood);
    post.position.y = 1.15;
    post.rotation.z = 0.05;
    grp.add(post);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.06, 0.05), [
      wood,
      wood,
      wood,
      wood,
      new THREE.MeshStandardMaterial({ map: signTexture(), roughness: 0.9 }),
      wood,
    ]);
    board.position.set(0, 1.8, 0.08);
    board.rotation.z = -0.07;
    grp.add(board);
    // a claw-raked corner: three dark gouges
    const gouge = new THREE.MeshBasicMaterial({ color: 0x140c06 });
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.012), gouge);
      g.position.set(0.48 + i * 0.1, 1.72, 0.112);
      g.rotation.z = 0.5;
      grp.add(g);
    }
    grp.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    grp.position.set(x, y, z);
    grp.rotation.y = yaw;
    G.scene.add(grp);
    const col = G.world.addCollider(x, z, 0.25, 0.25, y, y + 2, yaw, {
      tag: "prop",
    });
    return {
      object3d: grp,
      remove() {
        if (grp.parent) grp.parent.remove(grp);
        G.world.removeCollider(col);
        grp.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
        });
      },
    };
  }
  function spawnDenWarning() {
    const loc = G.LAYOUT.LOCATIONS.find((l) => l.id === DEN_ID);
    if (!loc) return;
    // on the side facing the start / the park, just outside the woods
    const VE = G.LAYOUT.cryoExit || { x: 157, z: 623 };
    const vx = VE.x,
      vz = VE.z;
    const base = Math.atan2(vx - loc.x, vz - loc.z);
    let spot = null;
    for (let k = 0; k < 40 && !spot; k++) {
      const ang = base + (k % 2 ? 1 : -1) * Math.floor((k + 1) / 2) * 0.12;
      const rr = loc.r + 8 + (k > 20 ? 8 : 0);
      const x = loc.x + Math.sin(ang) * rr,
        z = loc.z + Math.cos(ang) * rr;
      const y = C.freeSpot(x, z, 1.2, 0, false);
      if (y !== null && y > G.world.waterLevel + 0.3) spot = { x, y, z, ang };
    }
    if (!spot) return;
    const faceOut = spot.ang; // the sign reads toward whoever approaches from the city side
    try {
      C.setPieces.push(buildSign(spot.x, spot.y, spot.z, faceOut));
    } catch (e) {
      G.reportError("combat:denSign", e);
    }
    if (!G.isStub("props") && typeof G.props.spawn === "function") {
      const poses = ["reaching", "curled", "lying"];
      for (let i = 0; i < 3; i++) {
        const a = spot.ang + Math.PI + (i - 1) * 0.35,
          r = 3 + i * 1.6;
        const x = spot.x + Math.sin(a) * r,
          z = spot.z + Math.cos(a) * r;
        const y = C.freeSpot(x, z, 0.6, spot.y, false);
        if (y === null) continue;
        try {
          const h = G.props.spawn("skeleton", {
            x,
            y,
            z,
            yaw: Math.random() * 6.28,
            pose: poses[i],
            persistent: false,
          });
          if (h) C.setPieces.push(h);
        } catch (e) {
          /* ignore */
        }
      }
    }
  }
  function clearSetPieces() {
    for (const h of C.setPieces) {
      try {
        if (h && h.remove) h.remove();
      } catch (e) {
        /* ignore */
      }
    }
    C.setPieces = [];
  }
  /** Pick a spawn point for member i of a location group. */
  function locationSpawnPoint(loc, i, type, used) {
    const td = C.typeDef(type);
    const site = C.siteFor(loc);
    const names = td.boss ? ["boss", "spawn" + (i + 1)] : ["spawn" + (i + 1)];
    for (const n of names) {
      if (used.has(n)) continue;
      const a = anchor(site, n);
      if (a) {
        used.add(n);
        return {
          x: a.x + (Math.random() - 0.5) * 0.6,
          y: a.y || 0,
          z: a.z + (Math.random() - 0.5) * 0.6,
        };
      }
    }
    const r = td.radius || 0.4;
    // Elevated sites (the Brooklyn Bridge deck): sample the deck itself
    const S = G.LAYOUT.getSite(site);
    if (S && S.deckY) {
      for (let k = 0; k < 30; k++) {
        const x = S.x0 + Math.random() * (S.x1 - S.x0),
          z = S.z0 + Math.random() * (S.z1 - S.z0);
        const y = C.freeSpot(x, z, r, S.deckY, true);
        if (y !== null && y > S.deckY - 2) return { x, y, z };
      }
    }
    for (let k = 0; k < 40; k++) {
      const ang = Math.random() * Math.PI * 2;
      const rr = loc.r * (0.2 + Math.random() * 0.75) + (k > 20 ? 10 : 0);
      const x = loc.x + Math.sin(ang) * rr,
        z = loc.z + Math.cos(ang) * rr;
      if (td.amphibious && k < 25 && !nearWater(x, z, 18)) continue;
      const y = C.freeSpot(x, z, r, 0, false);
      if (y === null) continue;
      if (Math.abs(y) > 2.5 && k < 30) continue; // stay near street level unless desperate
      return { x, y, z };
    }
    return { x: loc.x, y: 0, z: loc.z };
  }

  // ------------------------------------------------------------------
  // Groups
  // ------------------------------------------------------------------
  function makeGroup(id, kind, data) {
    const g = {
      id,
      kind,
      data,
      actors: [],
      state: "pending",
      clearedDay: null,
      restore: null,
    };
    const sv = C.groupSave[id];
    if (sv && sv.cleared) {
      g.clearedDay = sv.cleared;
      g.state = gameDay() - sv.cleared >= RESPAWN_DAYS ? "pending" : "cleared";
      // corpses of a cleared (not yet respawned) group come back as searchable bodies
      if (g.state === "cleared" && Array.isArray(sv.m) && sv.m.length)
        g.restore = sv.m;
    } else if (sv && Array.isArray(sv.m) && sv.m.length) {
      // partly fought group: the same members, the dead stay dead
      g.restore = sv.m;
    }
    if (sv && sv.def) g.deferred = sv.def;
    C.groups.set(id, g);
    return g;
  }
  C.populate = function () {
    C.groups.clear();
    for (const loc of G.LAYOUT.LOCATIONS) {
      if (loc.hostile && loc.spawns && loc.spawns.length)
        makeGroup(loc.id, "location", loc);
      else if (!loc.hostile && C.SETTLEMENT_POP[loc.id])
        makeGroup("settle_" + loc.id, "settlement", loc);
    }
    C.roam.nextT = G.time.elapsed + 25;
    clearSetPieces();
    try {
      spawnDenWarning();
    } catch (e) {
      G.reportError("combat:denWarning", e);
    }
    // Roaming encounters that were around when the game was saved
    const rs = C.roamSave || [];
    C.roamSave = [];
    C.roam.n = Math.max(C.roam.n, C.roamSaveN || 0);
    for (const r of rs) {
      const g = {
        id: r.id,
        kind: "roam",
        actors: [],
        state: "active",
        spawnT: G.time.elapsed,
      };
      for (const m of r.m || []) {
        try {
          const a = C.memberRestore(m, g.id);
          if (a) g.actors.push(a);
        } catch (e) {
          G.reportError("combat:restoreRoam", e);
        }
      }
      if (g.actors.length) C.roam.groups.push(g);
    }
  };

  // ------------------------------------------------------------------
  // Member snapshots (save/load of partly fought groups, corpses, roamers)
  // ------------------------------------------------------------------
  const r2 = (v) => Math.round(v * 100) / 100;
  /** Compact, JSON-safe description of a population actor (enough to re-create it). */
  C.memberSnap = function (a) {
    const d = a.def || {};
    const o = {
      t: a.type,
      l: a.level,
      f: a.faction,
      n: a.name,
      x: r2(a.pos.x),
      y: r2(a.pos.y - (a.hover || 0)),
      z: r2(a.pos.z),
      yaw: r2(a.yaw),
      hp: Math.round(a.hp),
      mhp: a.maxHp,
      w: a.weaponId || "none",
      ai: a.aiMode || d.ai || "wander",
    };
    if (a.char && a.char._cmbSeed !== undefined) o.s = a.char._cmbSeed;
    if (a.char && a.char._cmbOutfit) o.o = a.char._cmbOutfit;
    if (d.gender) o.g = d.gender;
    if (d.burn) o.bu = d.burn;
    if (a.voice !== a.td.voice) o.v = a.voice;
    if (a.dr !== (a.td.dr || 0)) o.dr = a.dr;
    if (a.accuracy !== (a.td.accuracy || 1)) o.acc = a.accuracy;
    if (a.xp !== (a.td.xp || 10)) o.xp = a.xp;
    if (a.isBoss) o.boss = 1;
    if (a.holdPos) o.hold = 1;
    if (a.sight !== (a.td.sight || 50)) o.sight = a.sight;
    if (a.home) o.home = { x: r2(a.home.x), z: r2(a.home.z), r: a.home.r };
    if (a.patrol) o.pat = a.patrol.map((p) => ({ x: r2(p.x), z: r2(p.z) }));
    if (a.merchant) o.merch = a.merchant;
    if (a.hostOverride !== undefined) o.host = a.hostOverride;
    if (a.noRespawn) o.nr = 1;
    if (a.roaming) o.roam = 1;
    if (a.dead) o.dead = 1;
    if (a.warden) o.wd = a.warden;
    if (a.state === "dormant" && !a.dead) o.dorm = 1;
    if (a.denWake) o.den = a.denWake;
    if (d.hat) {
      o.hat = d.hat;
      if (d.hatColor) o.hatc = d.hatColor;
    }
    if (d.evil) o.evil = 1;
    if (Array.isArray(a.inventory))
      o.inv = a.inventory
        .filter((e) => Array.isArray(e) && typeof e[0] === "string")
        .map((e) => [e[0], e[1]]);
    return o;
  };
  /** Re-create an actor from C.memberSnap output. */
