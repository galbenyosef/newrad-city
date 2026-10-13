// play-inline-570 02 — the
// Lines 32-191 of readable/play-inline-570.pretty.js (statement-aligned).
  const first = () => String(L.heroName()).split(" ")[0];
  const rose = ms.rose;
  const stage = (id) => (Q.isActive(id) ? Q.stage(id) : null);
  const inStage = (id, list) => {
    const s = stage(id);
    return !!s && list.indexOf(s) >= 0;
  };
  const pl = () => (G.player ? G.player.pos : null);
  const dist2 = (p) => {
    const P = pl();
    return P && p ? Math.hypot(P.x - p.x, P.z - p.z) : 1e9;
  };
  const plain = (p, label) =>
    p ? { x: p.x, z: p.z, y: p.y || 0, label } : null;
  const captive = () => !!ms.f("rose_captive");
  const rosePresent = () =>
    !captive() && rose.mode() !== "gone" && !L.flag("ms_rose_released");
  const zekePlace = (spec) => {
    if (ms.zekePlace) {
      try {
        ms.zekePlace(spec);
      } catch (e) {
        G.reportError("quests:ms5:zeke", e);
      }
    }
  };
  const zekeNear = (r) => {
    const a = L.npc("lib_zeke");
    return !!(a && !a.dead && dist2(a.pos) < (r || 25));
  };
  const fade = (fn, d) => {
    if (typeof G.fadeTransition === "function") G.fadeTransition(fn, d || 1.0);
    else fn();
  };
  /** Pass game time to hour h (sleep=true: a real night's sleep). */
  function passTo(h, sleep) {
    const Tm = G.time;
    if (!Tm) return;
    const dh = (((h - (Tm.hour || 0)) % 24) + 24) % 24;
    if (dh < 0.05) return;
    try {
      if (
        !G.isStub("rpg") &&
        sleep &&
        typeof G.rpg.sleep === "function" &&
        dh >= 1
      ) {
        G.rpg.sleep(dh);
        return;
      }
      if (!G.isStub("rpg") && typeof G.rpg.wait === "function") {
        G.rpg.wait(dh);
        return;
      }
      if (G.atmos && typeof G.atmos.advanceHours === "function") {
        G.atmos.advanceHours(dh);
        return;
      }
    } catch (e) {
      G.reportError("quests:ms5:time", e);
    }
    Tm.hour = h;
  }
  /** An actor set to a quest-scripted essential state (another module's NPC): guarded. */
  function setEssential(id, v) {
    const a = L.npc(id);
    if (a && !a.dead) a.essential = !!v;
  }

  // ==================================================================
  // NOTES / ITEMS
  // ==================================================================
  ms.note({
    id: "ms_note_sirocco_plate",
    name: "Rubbing: Sirocco Two Weapon Plate",
    title:
      "Pencil rubbing of a brass plate (North Woods wreck), with Zeke's translation",
    text: "SIROCCO 2 — CHARGE SPÉCIALE\nARMEMENT : DEUX CLÉS TOURNÉES ENSEMBLE\n   CLÉ A — PILOTE        CLÉ B — NAVIGATEUR\nMOT D'ARMEMENT : RÉGLER LA ROUE CHIFFRANTE (VOIR CARNET SIROCCO)\nALIMENTATION DU BLOC DE MISE À FEU : 28 V CONTINU\n\n(Zeke, in carpenter's pencil, underneath:)\nTwo keys turned TOGETHER. A = pilot. B = navigator.\nA word set on the cipher wheel. Word is in their codebook.\n28 volts DC to the firing set = a rig battery, near enough.\nTake away any ONE of the three and it's scrap.\nPilot's key chain cut, not torn. Navigator taken out by the OCD in '67.\nYield: battery to Harlem. Don't let it.",
  });
  ms.note({
    id: "ms_note_sirocco_codebook",
    name: "SIROCCO Codebook (Poste Dragon copy)",
    title: "CARNET SIROCCO — Bureau Sept, copy No. 2 of 2",
    text: 'A water-stained ledger bound in grey card, stamped TRÈS SECRET and, below it, POSTE DRAGON.\n\nColumns of dates, March 1967 onward, and against each date a single word in capitals: the arming word for the cipher wheel of each SIROCCO aircraft. Most are ordinary French words. Some pages are blank where the flight never flew.\n\nOn the flyleaf, in pencil: "Copy 1 to the field officer (C.). Copy 2 stays below. If the post is lost, burn it."\n\nAs long as this book is out of the Glowkeepers\' hands, they cannot know which word the wheel wants.',
  });
  ms.note({
    id: "ms_note_brault_1970",
    name: "Sgt. Brault's Diary (a loose page)",
    title:
      "Carnet — Sgt. Ph. Brault, a page torn out and kept loose (English, cramped)",
    text: "October 1970.\n\nA woman came down the dumbwaiter shaft today. Nobody comes down the dumbwaiter shaft. She had a girl of three on her hip and burns on her neck under a scarf, and she spoke French like Montréal, quick and polite.\n\nShe did not want food. She wanted to know whether anything she had said in 1966, to anyone, had helped bring the bombers. She asked it as if she already knew the answer and needed someone to say it out loud.\n\nI told her the truth: we do not know anything here. We only listen. A whole sky is nobody's fault.\n\nShe did not believe me. While we talked she drew on the dust of my desk with one finger: a little sun, with too many rays. The Commandant gave the girl the last sugar cube from his tin. She held it like a jewel and would not eat it.\n\nThey went back up the shaft at dusk. The girl waved. I have not told Paris. There is no Paris.",
  });
  ms.note({
    id: "ms_note_journal_lantern",
    name: "Journal: The Ledge",
    title: "Your journal, the night of the raid",
    text: "They came for the battery at dusk and we held it. We held it, and while we were holding it they went up the stairs at Tudor City and took {ROSE} below. Sol says she shot two of them on the way down. Of course she did.\n\nWhen it was over there was a woman on the ledge of One Times Square. Grey robes. A gilt mask like a sun, twelve rays. A lantern held up at arm's length, the way you hold a light for someone coming down a dark stair. She wasn't looking at the battery. She was looking at me.\n\nThen the lantern went out.\n\nSomething about the way she held the lantern.",
  });
  ms.item({
    id: "q_track61_key",
    type: "key",
    name: "Track 61 Hatch Key",
    weight: 0,
    value: 0,
    quest: true,
    desc: "A long brass key on a loop of altar cord, stamped N.Y.C.R.R. — M-61. It opens the welded hatch of the Waldorf's freight shaft and the bulkhead under 42nd Street: the two doors down to Track 61.",
  });

  // ==================================================================
  // MQ30 — SIROCCO TWO (the North Woods wreck)
  // ==================================================================
  const WRECK = { x: 6, z: -950 };
  /** The wreck's centre: a POI owner's `sirocco_wreck` anchor, else a free spot near WRECK. */
  const wc = () =>
    L.anchor("north_woods", ["sirocco_wreck"], WRECK, { maxR: 16 }) || {
      x: WRECK.x,
      y: 0,
      z: WRECK.z,
    };
  const terrainY = (x, z, fb) => {
    const W = G.world;
    return W && W.terrainHeight ? W.terrainHeight(x, z) : fb || 0;
  };
  /** A point relative to the wreck centre, resolved when read (spots / markers / pickups). */
  function rel(dx, dz, dy) {
    return {
      get x() {
        return wc().x + dx;
      },
      get z() {
        return wc().z + dz;
      },
      get y() {
        const c = wc();
        return (
          (c.anchored ? c.y : terrainY(c.x + dx, c.z + dz, c.y)) + (dy || 0)
        );
      },
    };
  }
  const P_PLATE = rel(2.4, 2.6),
    P_COCKPIT = rel(-6.4, 1.8),
    P_INSCR = rel(15, 14),
    P_ROSE = rel(3.5, 5.2),
    P_ZEKE = rel(0.2, 5.4);

  // ---- set dressing: the fuselage, the empty cradle, the drag marks, the slab ----
  let wreckGen = -1;
  const WMAT = {};
  function wmat(k, c, r, m) {
    if (!WMAT[k]) {
      WMAT[k] = new window.THREE.MeshStandardMaterial({
        color: c,
        roughness: r,
        metalness: m,
      });
      WMAT[k].userData.shared = true;
    }
    return WMAT[k];
  }
