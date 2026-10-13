// play-inline-550 01 — free
// Lines 28-223 of readable/play-inline-550.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const LOCK_ID = "q_cryo_blast_door";
  const CODE = "0220";
  const HERO = () => L.heroName().toUpperCase();
  const safeCall = (where, fn) => {
    try {
      return fn();
    } catch (e) {
      G.reportError("quests:cryo:" + where, e);
      return undefined;
    }
  };
  const mapLive = () => !G.isStub("map") && !!G.map;
  const locksLive = () => !G.isStub("locks") && !!G.locks;

  // ------------------------------------------------------------------
  // Cryo geometry (anchors from the map, else derived fallbacks)
  // ------------------------------------------------------------------
  const C = {}; // resolved spots for this session
  function cryoAnchor(name) {
    const tries = [
      () => G.map.getAnchor && G.map.getAnchor("cryo_c9", name),
      () => G.map.cryoAnchors && G.map.cryoAnchors[name],
      () => G.landmarks.getAnchor && G.landmarks.getAnchor("cryo_c9", name),
    ];
    for (const t of tries) {
      let a = null;
      try {
        a = t();
      } catch (e) {
        a = null;
      }
      if (a && isFinite(a.x) && isFinite(a.z))
        return { x: a.x, y: a.y || 0, z: a.z };
    }
    return null;
  }
  /** Yaw that turns a prop's +Z face (a terminal screen) toward t. */
  const faceTo = (p, t) => (p && t ? Math.atan2(t.x - p.x, t.z - p.z) : 0);
  function computeSpots() {
    const S = G.LAYOUT.playerStart;
    const yaw = S.yaw || 0;
    const f = { x: -Math.sin(yaw), z: -Math.cos(yaw) },
      r = { x: Math.cos(yaw), z: -Math.sin(yaw) };
    const at = (fw, rt) => ({
      x: S.x + f.x * fw + r.x * rt,
      z: S.z + f.z * fw + r.z * rt,
    });
    const y0 = S.y || 0;
    const free = (p, y, opts) =>
      L.freeSpot(
        p.x,
        p.z,
        y !== undefined ? y : y0,
        Object.assign({ maxR: 6 }, opts || {}),
      );
    const A = (name) => cryoAnchor(name);
    const door = L.cryoExitDoor();
    C.start = { x: S.x, y: y0, z: S.z };
    C.goggles = A("goggles_cradle") || A("prep_room") || free(at(3.0, 2.4));
    C.office = A("director_office");
    C.desk =
      A("director_desk") ||
      (C.office
        ? free(C.office, C.office.y)
        : free(at(9, -3), y0, { maxR: 8 }));
    C.directorTerm =
      A("director_terminal") ||
      (C.desk
        ? free(
            { x: C.desk.x + 1.2, z: C.desk.z },
            C.desk.y !== undefined ? C.desk.y : y0,
          )
        : null);
    C.directorTermYaw = faceTo(C.directorTerm, C.office || C.start);
    C.securityLocker =
      A("security_locker") ||
      A("security") ||
      free(at(6, 4.2), y0, { maxR: 8 });
    C.roach =
      A("roach_nest") ||
      A("maintenance") ||
      A("corridor") ||
      free(at(14, 0), y0, { maxR: 10 });
    C.zekePod = A("zeke_pod") || free(at(0.5, 2.4));
    C.zekeLocker =
      A("zeke_locker") || A("lockers") || free(at(2.0, -3.2), y0, { maxR: 8 });
    // Locker 7 (the hero's own): the map's anchor, else one locker along from Zeke's.
    C.locker7 =
      A("locker7") ||
      A("hero_locker") ||
      (C.zekeLocker
        ? free(
            { x: C.zekeLocker.x - r.x * 1.3, z: C.zekeLocker.z - r.z * 1.3 },
            C.zekeLocker.y,
            { maxR: 4 },
          )
        : free(at(2.0, -1.8), y0, { maxR: 8 }));
    C.custodianTerm = A("computer_terminal") || null;
    C.custodianTermYaw = faceTo(C.custodianTerm, A("computer_core") || C.start);
    C.speaker = A("custodian_speaker") || C.start;
    C.blastDoor =
      A("blast_door") || A("door_keypad") || free(at(22, 0), y0, { maxR: 8 });
    C.keypad = A("door_keypad") || C.blastDoor;
    C.stair = A("stair_bottom") || C.blastDoor;
    C.exit = door
      ? { x: door.def.pos.x, y: door.def.pos.y || 0, z: door.def.pos.z }
      : A("exit_door") || A("stair_top") || free(at(28, 0), y0, { maxR: 8 });
    C.zekeHome = C.zekePod
      ? free({ x: C.zekePod.x + 1.2, z: C.zekePod.z + 0.8 }, C.zekePod.y)
      : C.start;
    C.locker = C.zekeLocker; // other files place things beside Zeke's locker
    return C;
  }

  // ------------------------------------------------------------------
  // CUSTODIAN (the facility computer): teletype lines, text only
  // ------------------------------------------------------------------
  function custodian(line, dur) {
    L.notify(line, {
      sub: "CUSTODIAN",
      speaker: "CUSTODIAN",
      teletype: true,
      duration: dur || 5.5,
    });
    L.sfx("teletype_print", { volume: 0.35 });
  }

  // ------------------------------------------------------------------
  // MQ01 definition
  // ------------------------------------------------------------------
  const ORDER = [
    "wake",
    "director",
    "locker7",
    "armory",
    "roaches",
    "zeke",
    "door",
    "leave",
  ];
  const ROACH_IDS = ["cryo_roach_1", "cryo_roach_2", "cryo_roach_3"];
  function roachesLeft() {
    return ROACH_IDS.filter((id) => !L.flag("dead_" + id)).length;
  }
  function pistolId() {
    return L.item("winter_service_pistol", "pistol_10mm");
  }
  function codeKnown() {
    return !!L.flag("cryo_code_known");
  }
  function blastOpen() {
    if (L.flag("cryo_blast_open")) return true;
    if (mapLive() && typeof G.map.isBlastDoorOpen === "function")
      return !!safeCall("isBlastDoorOpen", () => G.map.isBlastDoorOpen());
    return false;
  }
  /** Has the player already done what a stage asks (so the stage can be skipped)? */
  function met(stageId) {
    switch (stageId) {
      case "wake":
        return !!L.flag("got_goggles");
      case "director":
        return !!L.flag("cryo_logs_read");
      case "locker7":
        return !!L.flag("ms_locker7_opened");
      case "armory":
        return !!L.flag("got_service_pistol") || !pistolId();
      case "roaches":
        return roachesLeft() === 0 || !!L.flag("cryo_roaches_skipped");
      case "zeke":
        return !!L.flag("zeke_locker_looted");
      case "door":
        return blastOpen();
      default:
        return false;
    }
  }
  function firstUnmet(from) {
    for (let i = Math.max(0, from); i < ORDER.length; i++)
      if (!met(ORDER[i])) return ORDER[i];
    return "leave";
  }
  /** Move MQ01 on to the first stage the player has not already done. */
  function advance() {
    if (!Q.isActive("mq01")) return;
    const cur = Q.stage("mq01"),
      ci = ORDER.indexOf(cur);
    if (ci < 0 || !met(cur)) return;
    const next = firstUnmet(ci + 1);
    if (next !== cur) Q.setStage("mq01", next);
  }

