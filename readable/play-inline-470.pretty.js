/* src/characters/90_module.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: module registration, auto-update,
 * gib simulation and the debug LINEUP (?charlineup=all|humans|creatures|
 * robots|<type,type,…>  &anim=walk  &t=0.4  &lyaw=0  &weapons=1).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.chars || !G.chars._lib) return;
  const C = G.chars,
    L = C._lib;

  /** Debug helper: pose a character at a fixed animation time (frozen). */
  L.Character.prototype.poseAt = function (name, t, opts) {
    opts = Object.assign({ inPlace: true }, opts || {});
    const n = this._resolveName(name);
    this.prev = null;
    this.fade = 1;
    if (n === "death" || n === "dead") {
      this._die(n === "dead" ? "dead" : "death", opts);
      this.prev = null;
      this.fade = 1;
      this.rigYaw = this.rigYawTarget;
      this.anim.t = t;
    } else if (L.anim.ONESHOT[n] && n !== "talk") {
      this.anim = {
        name: "idle",
        t: 0,
        speed: 1,
        loop: true,
        opts: { inPlace: true },
      };
      this.playOneShot(n, opts);
      if (this.one) this.one.t = Math.min(t, this.one.dur * 0.999);
    } else {
      this.anim = { name: n, t, speed: 1, loop: true, opts };
      if (n === "aim") this.aimFlag = true;
    }
    this.animT = t;
    const g = this.gait;
    const v = this._nominalSpeed(this.anim.name);
    this._v = v;
    this._k =
      this.anim.name === "sneak"
        ? 0
        : L.smooth(g.walkSpeed * 1.05, g.runSpeed * 0.85, v);
    const step =
      L.lerp(g.walkStep, g.runStep, this._k) *
      (this.anim.name === "sneak" ? 0.7 : 1);
    this.phase = ((v * t) / (2 * step)) * Math.PI * 2;
    this._back = false;
    this.autoUpdate = false;
    this.ikW = this.weapon ? 1 : 0;
    this._camD2 = 0;
    this._evaluate(0.016);
  };

  // ------------------------------------------------------------------
  // Dummy weapons for the lineup (the weapons module supplies real ones)
  // ------------------------------------------------------------------
  function dummyWeapon(kind) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({
      color: 0x3a3a38,
      metalness: 0.6,
      roughness: 0.4,
    });
    const w = new THREE.MeshStandardMaterial({
      color: 0x5a3a20,
      roughness: 0.8,
    });
    const box = (x, y, z, sx, sy, sz, mat) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
      b.position.set(x, y, z);
      g.add(b);
      return b;
    };
    if (kind === "pistol") {
      box(0, 0.06, -0.08, 0.035, 0.05, 0.22, m);
      box(0, -0.01, 0, 0.03, 0.1, 0.045, w).rotation.x = 0.25;
    } else if (kind === "heavy") {
      box(0, 0.05, -0.3, 0.2, 0.2, 0.8, m);
      box(0, -0.02, 0.05, 0.04, 0.1, 0.05, m);
      box(0, 0.18, -0.2, 0.03, 0.08, 0.03, m);
    } else if (kind === "melee2h") {
      box(0, 0, -0.35, 0.04, 0.04, 0.9, w);
      box(0, 0, -0.8, 0.12, 0.12, 0.2, m);
    } else if (kind === "melee1h") {
      box(0, 0, -0.25, 0.03, 0.03, 0.6, m);
    } else {
      box(0, 0.05, -0.25, 0.04, 0.06, 0.62, m);
      box(0, 0.03, 0.18, 0.04, 0.09, 0.28, w);
      box(0, -0.02, 0, 0.03, 0.09, 0.04, w).rotation.x = 0.3;
      box(0, -0.02, -0.12, 0.025, 0.1, 0.05, m);
    }
    g.userData.hold = kind;
    return g;
  }
  C._dummyWeapon = dummyWeapon;

  const LINEUPS = {
    humans: [
      ["cryo_suit", {}],
      ["cryo_suit", { gender: "f", seed: 3 }],
      ["director_suit", {}],
      ["raider", { seed: 1, variant: 0 }],
      ["raider", { seed: 2, variant: 1 }],
      ["raider_heavy", { seed: 5 }],
      ["settler", { seed: 4 }],
      ["drifter", { seed: 6 }],
      ["merchant", { seed: 7 }],
      ["doctor", { seed: 8 }],
      ["lab_coat", { seed: 9, gender: "f" }],
      ["glowkeeper_robes", { seed: 10 }],
      ["combat_armor", { seed: 11 }],
      ["leather_armor", { seed: 12 }],
      ["survivor_layers", { seed: 13 }],
      ["dj", { seed: 14 }],
      ["covenant_lancer", { seed: 15 }],
      ["covenant_warden", { seed: 16 }],
      ["continuity_soldier", { seed: 17 }],
      ["continuity_officer", { seed: 18 }],
    ],
    creatures: [
      ["maniac", {}],
      ["maniac_bruiser", {}],
      ["brute", {}],
      ["colossus", {}],
      ["ripjaw", {}],
      ["dog", {}],
      ["burrow_rat", {}],
      ["giant_roach", {}],
      ["gasfly", {}],
      ["shellback", {}],
      ["shellback_stalker", {}],
      ["shellback_spawn", {}],
      ["shellback_matriarch", {}],
      ["small_stinger", {}],
      ["stinger", {}],
      ["giant_stinger", {}],
      ["giant_ant", {}],
      ["fire_ant", {}],
      ["ash_bear", {}],
      ["lurcher", {}],
      ["pack_ox", {}],
      ["pack_ox", { pack: true, variant: 1, seed: 4 }],
      ["coyote", {}],
      ["coyote", { variant: "dark", seed: 5 }],
      ["stag", {}],
      ["crawler", {}],
      ["sandhog", {}],
    ],
    robots: [
      ["patrolman", {}],
      ["valet", {}],
      ["valet_m", {}],
      ["sky_eye", {}],
      ["bulwark", {}],
      ["thinker", {}],
      ["striker", {}],
    ],
  };
  const WEAPON_FOR = {
    raider: "pistol",
    raider_heavy: "heavy",
    settler: "rifle",
    drifter: "rifle",
    combat_armor: "rifle",
    leather_armor: "melee1h",
    covenant_lancer: "rifle",
    covenant_warden: "rifle",
    continuity_soldier: "rifle",
    continuity_officer: "pistol",
    merchant: "pistol",
    brute: "rifle",
  };
  const lineupChars = [];
  function spawnLineup() {
    const QS = G.QS || new URLSearchParams(location.search);
    if (!QS.has("charlineup")) return;
    for (const c of lineupChars) c.dispose();
    lineupChars.length = 0;
    const which = QS.get("charlineup") || "all";
    let list = [];
    if (which === "all" || which === "1" || which === "")
      list = LINEUPS.humans.concat(LINEUPS.creatures, LINEUPS.robots);
    else if (LINEUPS[which]) list = LINEUPS[which];
    else if (/^crowd/.test(which) && C.crowdLook) {
      // &charlineup=crowd[:role]&n=12 — G.chars.crowdLook samples
      const roles = which.split(":")[1]
        ? [which.split(":")[1]]
        : [
            "survivor",
            "stall_keeper",
            "town_guard",
            "trader",
            "survivor",
            "wagoneer",
            "town_doctor",
            "townsfolk",
            "town_bartender",
            "drifter",
          ];
      const n = Number(QS.get("n")) || 12;
      for (let i = 0; i < n; i++) {
        const lk = C.crowdLook(roles[i % roles.length], 100 + i * 17);
        const tp = lk.type;
        delete lk.type;
        list.push([tp, lk]);
      }
    } else
      list = which.split(",").map((t) => {
        const [type, v] = t.split(":");
        return [
          type,
          v === "pack"
            ? { pack: true, seed: 2 }
            : v
              ? { variant: v, seed: Number(v) || 1 }
              : {},
        ];
      });
    if (QS.has("lcrowd"))
      for (const it of list) it[1] = Object.assign({ crowd: true }, it[1]); // exercise the crowd far tier
    if (QS.has("nohud")) {
      // debug screenshots: hide HUD + viewmodel
      const ui = document.getElementById("ui-root");
      if (ui) ui.style.visibility = "hidden";
      G.viewmodelVisible = false;
      const st = document.createElement("style");
      st.textContent =
        "body > div:not(#game-root){visibility:hidden!important}";
      document.head.appendChild(st);
    }
    const anim = QS.get("anim") || "idle";
    const t = QS.has("t") ? Number(QS.get("t")) : null;
    const yaw = QS.has("lyaw") ? Number(QS.get("lyaw")) : 0;
    const weapons = QS.has("weapons");
    const cx = QS.has("lx") ? Number(QS.get("lx")) : -65,
      cz = QS.has("lz") ? Number(QS.get("lz")) : -690;
    const gap = QS.has("gap") ? Number(QS.get("gap")) : 0.6;
    // spacing from radii
    const infos = list.map(([type]) => C.info(type) || { radius: 0.5 });
    let total = 0;
    for (const inf of infos) total += inf.radius * 2 + gap;
    let x = cx - total / 2;
    list.forEach(([type, o], i) => {
      const inf = infos[i];
      x += inf.radius + gap / 2;
      try {
        const ch = C.create(type, Object.assign({ seed: i + 1 }, o));
        const y =
          G.world && G.world.groundHeight ? G.world.groundHeight(x, cz, 50) : 0;
        ch.root.position.set(x, y, cz);
        ch.root.rotation.y = yaw;
        ch._lastPos.set(NaN, 0, 0);
        if (weapons && WEAPON_FOR[type])
          ch.setWeapon(dummyWeapon(WEAPON_FOR[type]));
        if (QS.has("idlestyle")) {
          // &idlestyle=crossed|hips|behind|hip1|cycle — hold an idle attitude
          const names = (L.anim && L.anim.IDLE_STYLES) || [];
          const v = QS.get("idlestyle");
          const vl = v.split(",");
          ch._idleStyle =
            v === "cycle"
              ? i % names.length
              : Math.max(0, names.indexOf(vl[i % vl.length]));
          ch._idleHold = true;
        }
        if (t !== null) ch.poseAt(anim, t);
        else ch.setAnim(anim, { inPlace: true });
        lineupChars.push(ch);
        focusFrames = 0;
      } catch (e) {
        G.reportError("chars.lineup:" + type, e);
      }
      x += inf.radius + gap / 2;
    });
    // no map module? give them a floor to stand on
    if (G.isStub("map") && !spawnLineup.floor) {
      const fl = new THREE.Mesh(
        new THREE.PlaneGeometry(400, 400),
        new THREE.MeshStandardMaterial({ color: 0x6a6252, roughness: 0.95 }),
      );
      fl.rotation.x = -Math.PI / 2;
      fl.position.set(cx, 0, cz);
      fl.receiveShadow = true;
      G.scene.add(fl);
      spawnLineup.floor = fl;
    }
    G.chars._lineup = lineupChars;
    // debug: &lfar=12 (crowd far-tier distance), &lbudget=4 (live budget), &lstats=1 (crowd stats into the DOM)
    if (QS.has("lfar") || QS.has("lbudget"))
      C.setCrowdBudget({
        farDist: QS.has("lfar") ? Number(QS.get("lfar")) : undefined,
        live: QS.has("lbudget") ? Number(QS.get("lbudget")) : undefined,
      });
    if (QS.has("lstats") && !spawnLineup.stats) {
      const pre = document.createElement("pre");
      pre.id = "chars-debug";
      pre.style.display = "none";
      document.body.appendChild(pre);
      spawnLineup.stats = setInterval(() => {
        try {
          pre.textContent = JSON.stringify({
            crowd: C.crowdStats(),
            stats: C.stats(),
            faces: L.faceTexCount ? L.faceTexCount() : 0,
          });
        } catch (e) {
          /* ignore */
        }
      }, 500);
    }
  }

  // Debug close-ups (shot mode only): &lfocus=i&ldist=0.8&lang=0.4 puts the
  // camera in front of lineup character i's head (lang = orbit angle, radians),
  // looking at it. The shot's y still sets the eye height (eye = y + 1.64).
  // (query parsed once; the camera is placed for the first ~2 s of the shot
  // only, so other shot-mode camera logic isn't fought every frame)
  const _fv = new THREE.Vector3();
  let FOCUS = null,
    focusFrames = 0;
  function parseFocus() {
    const QS = G.QS || new URLSearchParams(location.search);
    FOCUS = QS.has("lfocus")
      ? {
          i: Number(QS.get("lfocus")) | 0,
          d: Number(QS.get("ldist") || 0.8),
          ang: Number(QS.get("lang") || 0),
          eyes: QS.has("leyes"),
        }
      : false;
  }
  function focusLineupCam() {
    if (FOCUS === null) parseFocus();
    if (!FOCUS || !G.player || !G.player.pos || focusFrames > 120) return;
    const ch = lineupChars[FOCUS.i];
    if (!ch || !ch.parts || !ch.parts.head) return;
    focusFrames++;
    const ry = ch.root.rotation.y + FOCUS.ang;
    ch.parts.head.getWorldPosition(_fv);
    G.player.pos.x = _fv.x - Math.sin(ry) * FOCUS.d;
    G.player.pos.z = _fv.z - Math.cos(ry) * FOCUS.d;
    G.player.yaw = ry + Math.PI;
    if (
      ch.face &&
      ch.face.lookAtEyes &&
      FOCUS.eyes &&
      G.camera &&
      focusFrames === 1
    )
      ch.face.lookAtEyes(G.camera);
  }

  // ------------------------------------------------------------------
  // Rim light follows the world's ambient (hemisphere) light so dark
  // armour keeps a silhouette by day and doesn't glow at night.
  // ------------------------------------------------------------------
  const _rc = new THREE.Color();
  function updateRim() {
    const u = L.shared.uRim.value;
    let hemi = null;
    try {
      hemi = G.baseLights && G.baseLights.hemi;
    } catch (e) {
      hemi = null;
    }
    if (hemi && hemi.color && hemi.visible !== false) {
      _rc
        .copy(hemi.color)
        .multiplyScalar(Math.min(2.5, hemi.intensity || 0) * 0.085);
      const indoor =
        G.player &&
        G.player.pos &&
        G.LAYOUT &&
        G.LAYOUT.INTERIOR_X_MIN &&
        G.player.pos.x >= G.LAYOUT.INTERIOR_X_MIN;
      if (indoor) _rc.multiplyScalar(0.7);
      u.lerp(_rc, 0.1);
    }
  }

  // ------------------------------------------------------------------
  // Module
  // ------------------------------------------------------------------
  G.registerModule({
    name: "characters",
    order: 35,
    init() {
      L.atlas();
      L.envMap();
      // warm the template cache with the most common spawns (keeps first-contact hitch-free)
      const t0 = performance.now();
      for (const t of [
        "raider",
        "maniac",
        "giant_roach",
        "brute",
        "burrow_rat",
      ]) {
        if (performance.now() - t0 > 700) break;
        try {
          C.preload([t], 1);
        } catch (e) {
          G.reportError("init:characters", e);
        }
      }
      if (L.hookFaceEvents) L.hookFaceEvents(); // dialogue lip-sync / eye contact
      G.events.on("reset", () => {
        L.gibs.clear();
        // our own debug lineup never outlives a game
        for (const c of lineupChars) c.dispose();
        lineupChars.length = 0;
        L.resetGen = (L.resetGen || 0) + 1;
      });
      G.events.on("newGame", () => {
        try {
          spawnLineup();
        } catch (e) {
          G.reportError("chars.lineup", e);
        }
        // leak check: characters from the previous game that nobody disposed
        setTimeout(() => {
          let leaked = 0;
          for (const ch of L.live)
            if (!ch.disposed && (ch._gen || 0) < (L.resetGen || 0)) leaked++;
          if (leaked)
            console.warn(
              "[characters] " +
                leaked +
                " Character(s) from a previous game were never dispose()d (still in G.chars.list()).",
            );
        }, 0);
      });
    },
    update(dt) {
      L.gibs.update(dt);
      if (G.SHOT && lineupChars.length) focusLineupCam();
    },
    lateUpdate(dt, realDt) {
      updateRim();
      // crowd far tier (frozen per-template instances) + shadow-caster budget
      if (L.crowdUpdate) {
        try {
          L.crowdUpdate();
        } catch (e) {
          G.reportError("chars.crowd", e);
        }
      }
      // Face-cache bookkeeping + idle-frame prefetch. Every face within the
      // prefetch radius counts as "needed" (refreshed every 30 frames, well
      // inside the cache's 120-frame staleness window), so the soft-cap LRU
      // never evicts a prefetched face that prefetch would then repaint (the
      // old evict → repaint → evict wave through the 16–28 m band).
      const PREFETCH_D2 = 28 * 28;
      const fr = G.time ? G.time.frame : 0;
      if (fr % 30 === 0)
        for (const ch of L.live) {
          const t = ch.tpl;
          if (
            ch.face &&
            t &&
            t.faceTex &&
            !ch.disposed &&
            ch._visD2 !== undefined &&
            ch._visD2 < PREFETCH_D2
          )
            t._faceNeed = fr;
        }
      // Prefetch: when no face map was built this frame and the frame is cheap,
      // paint the nearest RENDERED faced character within 28 m so faces are
      // ready before anyone reaches dialogue distance (no pop-in / hitch at
      // 16 m). Never past the hard cap (that would evict a needed face).
      if (
        L.faceBuiltThisFrame &&
        !L.faceBuiltThisFrame() &&
        (realDt || dt) < 1 / 45 &&
        G.camera &&
        fr % 3 === 0 &&
        (!L.faceTexCount || L.faceTexCount() < L.MAX_FACE_TEX_HARD)
      ) {
        let best = null,
          bd = PREFETCH_D2,
          crowdBest = null,
          cbd = 60 * 60;
        const roomSoft = !L.faceTexCount || L.faceTexCount() < L.MAX_FACE_TEX;
        for (const ch of L.live) {
          if (!ch.face || ch.disposed || ch.dead || !ch.tpl || ch.tpl.faceTex)
            continue;
          const d2 = ch._visD2 === undefined ? Infinity : ch._visD2;
          if (ch.tpl.faceTexLo) {
            if (d2 < L.FACE_HI_D2 && d2 < bd) {
              bd = d2;
              best = ch;
            }
            continue;
          } // lo copy is enough beyond 8 m
          if (d2 < bd) {
            bd = d2;
            best = ch;
          }
          // crowd members out to 60 m are queued too (faces painted while the player walks up,
          // only into free soft-cap room so nothing needed is evicted)
          else if (roomSoft && ch.crowd && d2 < cbd) {
            cbd = d2;
            crowdBest = ch;
          }
        }
        if (best) best.ensureFaceTexture();
        else if (crowdBest) crowdBest.ensureFaceTexture(false, 0);
        else if (L.crowdWarmStep) L.crowdWarmStep(); // spare frame: crowd archetype templates (G.chars.warmCrowd)
      }
      // Auto-update characters nobody else is driving (lineups, cutscene props, stubs).
      // Detached / hidden rigs (streamed-out actors, unused stand-in avatars) cost nothing.
      const frame = G.time ? G.time.frame : 0;
      for (const ch of L.live) {
        if (!ch.autoUpdate || ch.disposed) continue;
        if (!ch.root.parent || !ch.root.visible) continue;
        if (frame - ch._extFrame > 2) ch._tick(dt);
      }
    },
  });
})();
