/* src/poi_park/00_kit.js */
/* =====================================================================
 * NEW RAD CITY — poi_park / 00_kit.js
 * Construction kit shared by the two Central Park POIs
 * (Central Park Zoo & the Arsenal, Tavern on the Green).
 * (Own copy of the poi_eastvillage / poi_village3 kit, own namespace G._ppk.)
 *
 *  - materials: G.tex surfaces when present (procedural fallbacks), plus
 *    this module's own canvases (damask wallpaper, hex & checker tile,
 *    pressed tin, iron lace, glazed roof tile, lacquer, marble …)
 *  - two texture ATLASES painted at init: 'art' (signs, paintings,
 *    posters, photos, decals with alpha) and 'neon' (additive tubes)
 *  - BUILDER: batches primitives per material into ONE merged mesh per
 *    material with vertex colours = tint × grime/AO × BAKED LIGHT
 *    (interior builders: a list of point "lamps" is evaluated per vertex
 *    and the material is patched to be self-lit, so every room has its
 *    own mood with zero runtime lights)
 *  - rooms with door gaps, stairs (≤0.25 m risers), rails, colliders
 *  - gameplay records: anchors, loot/prop spawns, notes, terminals
 * Everything lives on G._ppk (never a top-level global).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const U = G.util;

  const PV = (G._ppk = G._ppk || {});

  // ---- Locks: every locked door, container, safe and terminal is declared to G.locks and opened through it
  // (a key item, a keypad code or a terminal passcode, always placed somewhere in this module's content).
  PV.locksLive = () =>
    !!(G.locks && !G.isStub("locks") && typeof G.locks.open === "function");
  /** Declare a lock spec {id, label, key?|code?|passcode?, hint?} for the audit (queued until the locks module is up); returns the spec. */
  PV._lockQueue = PV._lockQueue || [];
  PV.lockReg = function (spec) {
    if (!PV.locksLive() || !G.locks.register) {
      PV._lockQueue.push(spec);
      if (!PV._lockQueueHooked) {
        PV._lockQueueHooked = true;
        G.events.on("initDone", () => {
          const q = PV._lockQueue.splice(0);
          for (const s of q) PV.lockReg(s);
        });
      }
      return spec;
    }
    try {
      G.locks.register(spec);
    } catch (e) {
      G.reportError("poi_park:lockReg:" + spec.id, e);
    }
    return spec;
  };
  /** Open through G.locks: onOpen runs once it is open (key held, code typed, or already open). */
  PV.lockOpen = function (spec, onOpen) {
    if (!PV.locksLive()) {
      onOpen();
      return;
    } // the locks module is not loaded in this build
    if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
      onOpen();
      return;
    }
    G.locks.open(spec, onOpen);
  };
  PV.lockIsOpen = (id) =>
    !PV.locksLive() || !G.locks.isOpen || !!G.locks.isOpen(id);
  /** The player has read / heard the code or passcode of lock id (logged in Goggles → NOTES → CODES). */
  PV.lockLearn = function (id) {
    try {
      if (PV.locksLive() && G.locks.learn) G.locks.learn(id);
    } catch (e) {
      G.reportError("poi_park:lockLearn:" + id, e);
    }
  };
  /** Learn lock(s) when the player picks up or reads the note / tape reel item that carries the code. */
  PV.learnFromItem = function (itemId, lockId) {
    const m = (PV._learnMap = PV._learnMap || {});
    (m[itemId] = m[itemId] || []).push(lockId);
    if (PV._learnHooked) return;
    PV._learnHooked = true;
    const fire = (id) => {
      const l = m[id];
      if (l) l.forEach(PV.lockLearn);
    };
    G.events.on("itemAdded", fire);
    G.events.on("noteRead", fire);
  };
  /** Attach the lock spec to a spawned container handle (props / containers) when the owner did not copy it. */
  PV.lockContainer = function (handle, spec) {
    if (!spec) return;
    PV.lockReg(spec);
    const c =
      handle &&
      (handle.container || (handle.items !== undefined ? handle : null));
    if (c && !c.lock) c.lock = spec;
  };
  /**
   * One-way door, barred from the far side: shows "Barred", opens for good once the player comes through
   * from the other side (door.unbar()). It is not a lock (there is no key or code); the unbarred state is
   * saved per door id under 'poi_park:bars' and reset on a new game.
   */
  PV.bars = PV.bars || {};
  PV.barDoor = function (door, o) {
    if (!door) return door;
    o = o || {};
    const id = String(
      o.id || (door.def && door.def.id) || "bar" + Object.keys(PV.bars).length,
    );
    const inner = door.onInteract;
    door._barred = !PV.bars[id];
    door.locked = () =>
      door._barred ? o.lockText || "Barred from the other side" : null;
    door.onInteract = function () {
      if (door._barred) {
        if (G.sfx && G.sfx.play) G.sfx.play("door_locked");
        G.notify(o.message || "This door is barred from the other side.");
        return;
      }
      return inner.apply(door, arguments);
    };
    door.unbar = function (silent) {
      if (!door._barred) return false;
      door._barred = false;
      PV.bars[id] = true;
      if (o.unbarMessage && !silent) G.notify(o.unbarMessage);
      return true;
    };
    door.rebar = function () {
      door._barred = true;
      delete PV.bars[id];
    };
    (PV._barDoors = PV._barDoors || []).push({ id, door });
    if (!PV._barHooked) {
      PV._barHooked = true;
      const rebarAll = () => {
        for (const b of PV._barDoors) b.door.rebar();
      };
      G.events.on("newGame", rebarAll);
      G.events.on("reset", rebarAll);
      if (G.save && G.save.register)
        G.save.register("poi_park:bars", {
          save: () => Object.keys(PV.bars),
          load: (d) => {
            for (const b of PV._barDoors)
              if ((d || []).indexOf(b.id) >= 0) b.door.unbar(true);
          },
        });
    }
    return door;
  };
  PV.defs = PV.defs || [];
  /** POI definition: {id, order, build(K), data(K) (initDone), spawn(K) (newGame/loaded), update(dt, K)} */
  PV.define = (def) => {
    PV.defs.push(def);
  };
  const K = (PV.kit = {});
  K.PI = Math.PI;
  K.HP = Math.PI / 2;
  K.V = (x, y, z) => new THREE.Vector3(x, y, z);
  K.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  K.clamp = U.clamp;
  K.lerp = U.lerp;

  // ------------------------------------------------------------------
  // Canvas helpers
  // ------------------------------------------------------------------
  K.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  K.texFromCanvas = function (c, o) {
    o = o || {};
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = o.clamp
      ? THREE.ClampToEdgeWrapping
      : THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    let an = 4;
    try {
      an = Math.min(8, G.renderer.capabilities.getMaxAnisotropy());
    } catch (e) {
      /* */
    }
    t.anisotropy = an;
    if (o.nomip) {
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
    }
    t.needsUpdate = true;
    return t;
  };
  function rgba(r, g, b, a) {
    return "rgba(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + "," + a + ")";
  }
  K.rgba = rgba;
  /** Speckle / grain on a canvas region. */
  K.grain = function (x, X, Y, W, H, amt, seed) {
    const r = K.rng(seed || 7);
    const n = Math.floor((W * H) / 60);
    for (let i = 0; i < n; i++) {
      const v = r() < 0.5 ? 0 : 255;
      x.fillStyle = rgba(v, v, v, ((r() * amt) / 255).toFixed(3));
      x.fillRect(X + r() * W, Y + r() * H, 1 + r() * 2, 1 + r() * 2);
    }
  };
  K.stains = function (x, X, Y, W, H, n, seed, a, col) {
    const r = K.rng(seed || 3);
    col = col || [40, 32, 22];
    for (let i = 0; i < n; i++) {
      const px = X + r() * W,
        py = Y + r() * H,
        rad = (0.05 + r() * 0.3) * Math.min(W, H);
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(
        0,
        rgba(col[0], col[1], col[2], ((a || 0.3) * r()).toFixed(3)),
      );
      g.addColorStop(1, rgba(col[0], col[1], col[2], 0));
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
  };
  K.streaks = function (x, X, Y, W, H, n, seed, a) {
    const r = K.rng(seed || 5);
    for (let i = 0; i < n; i++) {
      const px = X + r() * W,
        py = Y + r() * H * 0.5,
        len = H * (0.15 + r() * 0.6);
      const g = x.createLinearGradient(0, py, 0, py + len);
      g.addColorStop(0, rgba(25, 20, 15, a || 0.2));
      g.addColorStop(1, rgba(25, 20, 15, 0));
      x.fillStyle = g;
      x.fillRect(px, py, 1 + r() * 4, len);
    }
  };

  // ------------------------------------------------------------------
  // Custom surface textures (this module's own)
  // ------------------------------------------------------------------
  const CUSTOM = {};
  const customPaint = {
    wallpaper(x, S, r) {
      // faded damask
      x.fillStyle = "#b8a48a";
      x.fillRect(0, 0, S, S);
      x.fillStyle = "rgba(120,70,60,0.55)";
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const cx = (i * S) / 4 + ((j % 2) * S) / 8 + S / 8,
            cy = (j * S) / 4 + S / 8;
          x.beginPath();
          x.ellipse(cx, cy, S / 22, S / 12, 0, 0, Math.PI * 2);
          x.fill();
          x.beginPath();
          x.ellipse(
            cx - S / 18,
            cy + S / 30,
            S / 40,
            S / 22,
            0.6,
            0,
            Math.PI * 2,
          );
          x.fill();
          x.beginPath();
          x.ellipse(
            cx + S / 18,
            cy + S / 30,
            S / 40,
            S / 22,
            -0.6,
            0,
            Math.PI * 2,
          );
          x.fill();
        }
      x.fillStyle = "rgba(90,60,40,0.18)";
      for (let i = 0; i < S; i += S / 16) x.fillRect(i, 0, 2, S);
      K.stains(x, 0, 0, S, S, 18, 11, 0.4, [70, 50, 30]);
      K.streaks(x, 0, 0, S, S, 30, 12, 0.25);
    },
    wallpaper_green(x, S, r) {
      x.fillStyle = "#6f7a5c";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < S; i += S / 8) {
        x.fillStyle = "rgba(40,50,30,0.35)";
        x.fillRect(i, 0, S / 32, S);
        x.fillStyle = "rgba(200,190,140,0.2)";
        x.fillRect(i + S / 16, 0, 3, S);
      }
      K.stains(x, 0, 0, S, S, 16, 21, 0.45, [50, 40, 25]);
      K.streaks(x, 0, 0, S, S, 24, 22, 0.3);
    },
    hextile(x, S, r) {
      // Katz's small white hex floor
      x.fillStyle = "#6f6a60";
      x.fillRect(0, 0, S, S);
      const R = S / 16,
        h = (R * Math.sqrt(3)) / 2;
      for (let j = -1; j < S / h + 1; j++)
        for (let i = -1; i < S / (R * 1.5) + 1; i++) {
          const cx = i * R * 1.5,
            cy = j * h * 2 + (i % 2 ? h : 0);
          const dark = r() < 0.05;
          x.fillStyle = dark
            ? "#3c3a36"
            : "rgb(" +
              ((205 + r() * 30) | 0) +
              "," +
              ((200 + r() * 28) | 0) +
              "," +
              ((188 + r() * 25) | 0) +
              ")";
          x.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3;
            const px = cx + Math.cos(a) * (R - 1.5),
              py = cy + Math.sin(a) * (R - 1.5);
            if (k) x.lineTo(px, py);
            else x.moveTo(px, py);
          }
          x.fill();
        }
      K.stains(x, 0, 0, S, S, 22, 31, 0.5, [70, 55, 30]);
    },
    checker(x, S, r) {
      const n = 8,
        c = S / n;
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const w = (i + j) % 2 === 0;
          const v = w ? 200 + r() * 30 : 30 + r() * 20;
          x.fillStyle =
            "rgb(" +
            (v | 0) +
            "," +
            ((v * 0.97) | 0) +
            "," +
            ((v * 0.9) | 0) +
            ")";
          x.fillRect(i * c, j * c, c, c);
        }
      x.strokeStyle = "rgba(0,0,0,0.3)";
      for (let i = 0; i <= n; i++) {
        x.beginPath();
        x.moveTo(i * c, 0);
        x.lineTo(i * c, S);
        x.stroke();
        x.beginPath();
        x.moveTo(0, i * c);
        x.lineTo(S, i * c);
        x.stroke();
      }
      K.stains(x, 0, 0, S, S, 20, 41, 0.5, [60, 45, 25]);
    },
    mosaic(x, S, r) {
      // lobby mosaic floor: border + rosettes
      x.fillStyle = "#c9bca2";
      x.fillRect(0, 0, S, S);
      const c = S / 32;
      for (let j = 0; j < 32; j++)
        for (let i = 0; i < 32; i++) {
          const v = 180 + r() * 50;
          x.fillStyle =
            "rgb(" +
            (v | 0) +
            "," +
            ((v * 0.93) | 0) +
            "," +
            ((v * 0.8) | 0) +
            ")";
          x.fillRect(i * c + 0.5, j * c + 0.5, c - 1, c - 1);
        }
      x.strokeStyle = "#6e2a22";
      x.lineWidth = c;
      x.strokeRect(c * 2, c * 2, S - c * 4, S - c * 4);
      x.strokeStyle = "#2e4a3c";
      x.lineWidth = c * 0.6;
      x.strokeRect(c * 3.5, c * 3.5, S - c * 7, S - c * 7);
      x.fillStyle = "#7a3026";
      x.beginPath();
      x.arc(S / 2, S / 2, S / 7, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#c8a050";
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        x.beginPath();
        x.ellipse(
          S / 2 + (Math.cos(a) * S) / 11,
          S / 2 + (Math.sin(a) * S) / 11,
          S / 40,
          S / 90,
          a,
          0,
          Math.PI * 2,
        );
        x.fill();
      }
      K.stains(x, 0, 0, S, S, 20, 51, 0.45, [60, 45, 25]);
    },
    tin(x, S, r) {
      // pressed tin ceiling
      x.fillStyle = "#b8b2a2";
      x.fillRect(0, 0, S, S);
      const c = S / 4;
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const X = i * c,
            Y = j * c;
          const g = x.createRadialGradient(
            X + c / 2,
            Y + c / 2,
            c * 0.05,
            X + c / 2,
            Y + c / 2,
            c * 0.5,
          );
          g.addColorStop(0, "#dcd6c6");
          g.addColorStop(0.6, "#9c9686");
          g.addColorStop(1, "#c4beae");
          x.fillStyle = g;
          x.fillRect(X + 3, Y + 3, c - 6, c - 6);
          x.strokeStyle = "#7a7466";
          x.lineWidth = 3;
          x.strokeRect(X + 6, Y + 6, c - 12, c - 12);
          x.beginPath();
          x.arc(X + c / 2, Y + c / 2, c * 0.18, 0, Math.PI * 2);
          x.stroke();
        }
      K.stains(x, 0, 0, S, S, 20, 61, 0.55, [90, 60, 30]);
    },
    lace(x, S, r) {
      // cast-iron lace (alpha cut-out): Hotel Chelsea balconies & stair balusters
      x.clearRect(0, 0, S, S);
      x.strokeStyle = "#fff";
      x.fillStyle = "#fff";
      x.lineWidth = S / 40;
      x.strokeRect(0, S * 0.02, S, S * 0.96); // top/bottom rails
      x.fillRect(0, 0, S, S * 0.07);
      x.fillRect(0, S * 0.93, S, S * 0.07);
      const n = 2,
        w = S / n;
      for (let i = 0; i < n; i++) {
        const cx = i * w + w / 2;
        x.lineWidth = S / 64;
        x.beginPath();
        x.moveTo(i * w + 2, S * 0.07);
        x.lineTo(i * w + 2, S * 0.93);
        x.stroke(); // posts
        // central flower
        x.beginPath();
        x.arc(cx, S * 0.5, w * 0.16, 0, Math.PI * 2);
        x.stroke();
        x.beginPath();
        x.arc(cx, S * 0.5, w * 0.05, 0, Math.PI * 2);
        x.fill();
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + Math.PI / 4;
          x.beginPath();
          x.ellipse(
            cx + Math.cos(a) * w * 0.28,
            S * 0.5 + Math.sin(a) * w * 0.28,
            w * 0.12,
            w * 0.05,
            a,
            0,
            Math.PI * 2,
          );
          x.stroke();
        }
        // C-scrolls top & bottom
        for (const yy of [0.2, 0.8]) {
          x.beginPath();
          x.arc(cx - w * 0.18, S * yy, w * 0.12, -Math.PI * 0.5, Math.PI * 0.9);
          x.stroke();
          x.beginPath();
          x.arc(cx + w * 0.18, S * yy, w * 0.12, Math.PI * 0.1, Math.PI * 1.5);
          x.stroke();
        }
        // diamond frame
        x.beginPath();
        x.moveTo(cx, S * 0.1);
        x.lineTo(i * w + w * 0.95, S * 0.5);
        x.lineTo(cx, S * 0.9);
        x.lineTo(i * w + w * 0.05, S * 0.5);
        x.closePath();
        x.stroke();
      }
    },
    rooftile(x, S, r) {
      // glazed Chinese roof tiles (tinted by vertex colour)
      x.fillStyle = "#3a3a34";
      x.fillRect(0, 0, S, S);
      const n = 8,
        c = S / n;
      for (let i = 0; i < n; i++) {
        const g = x.createLinearGradient(i * c, 0, i * c + c, 0);
        g.addColorStop(0, "#5a5a52");
        g.addColorStop(0.5, "#e8e8d8");
        g.addColorStop(1, "#4a4a42");
        x.fillStyle = g;
        x.fillRect(i * c + 2, 0, c - 4, S);
        for (let j = 0; j < 6; j++) {
          x.fillStyle = "rgba(20,20,15,0.5)";
          x.fillRect(i * c, (j * S) / 6, c, 3);
        }
      }
      K.stains(x, 0, 0, S, S, 14, 71, 0.5, [40, 50, 30]);
      K.streaks(x, 0, 0, S, S, 20, 72, 0.3);
    },
    lacquer(x, S, r) {
      // red lacquered panel with gold fret border
      x.fillStyle = "#8a1a12";
      x.fillRect(0, 0, S, S);
      x.strokeStyle = "#c89a3a";
      x.lineWidth = S / 40;
      x.strokeRect(S * 0.06, S * 0.06, S * 0.88, S * 0.88);
      x.lineWidth = S / 80;
      for (let i = 0; i < 6; i++) {
        const X = S * 0.12 + i * S * 0.13;
        x.beginPath();
        x.moveTo(X, S * 0.12);
        x.lineTo(X + S * 0.08, S * 0.12);
        x.lineTo(X + S * 0.08, S * 0.2);
        x.lineTo(X + S * 0.03, S * 0.2);
        x.stroke();
      }
      K.stains(x, 0, 0, S, S, 18, 81, 0.45, [30, 10, 5]);
      K.grain(x, 0, 0, S, S, 30, 82);
    },
    plaster(x, S, r) {
      // subtle stained plaster (no big blotches)
      x.fillStyle = "#cbc3b1";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 60; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 20 + r() * 90,
          g = x.createRadialGradient(px, py, 0, px, py, rad);
        const t = r() < 0.5 ? "150,140,120" : "225,218,200";
        g.addColorStop(0, "rgba(" + t + ",0.16)");
        g.addColorStop(1, "rgba(" + t + ",0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      x.strokeStyle = "rgba(70,60,50,0.35)";
      x.lineWidth = 0.8;
      for (let i = 0; i < 5; i++) {
        x.beginPath();
        let px = r() * S,
          py = r() * S;
        x.moveTo(px, py);
        for (let k = 0; k < 5; k++) {
          const qx = px + (r() - 0.5) * 70,
            qy = py + (r() - 0.3) * 60;
          x.quadraticCurveTo(
            px + (r() - 0.5) * 30,
            py + (r() - 0.5) * 30,
            qx,
            qy,
          );
          px = qx;
          py = qy;
        }
        x.stroke();
      }
      K.streaks(x, 0, 0, S, S, 14, 7, 0.12);
      K.grain(x, 0, 0, S, S, 22, 8);
    },
    marble(x, S, r) {
      x.fillStyle = "#e4ded0";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 30; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 30 + r() * 110,
          g = x.createRadialGradient(px, py, 0, px, py, rad);
        const t = r() < 0.5 ? "200,194,180" : "245,242,232";
        g.addColorStop(0, "rgba(" + t + ",0.35)");
        g.addColorStop(1, "rgba(" + t + ",0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      for (let i = 0; i < 14; i++) {
        x.strokeStyle =
          "rgba(120,112,100," + (0.12 + r() * 0.22).toFixed(2) + ")";
        x.lineWidth = 0.6 + r() * 1.6;
        x.beginPath();
        let px = r() * S,
          py = r() * S;
        x.moveTo(px, py);
        for (let k = 0; k < 5; k++) {
          const qx = px + (r() - 0.3) * 120,
            qy = py + (r() - 0.5) * 80;
          x.bezierCurveTo(
            px + (r() - 0.5) * 60,
            py + (r() - 0.5) * 60,
            qx + (r() - 0.5) * 60,
            qy + (r() - 0.5) * 60,
            qx,
            qy,
          );
          px = qx;
          py = qy;
        }
        x.stroke();
      }
      x.strokeStyle = "rgba(60,55,50,0.35)";
      x.lineWidth = 2;
      x.strokeRect(1, 1, S - 2, S - 2);
      K.stains(x, 0, 0, S, S, 6, 91, 0.2);
    },
    terrazzo(x, S, r) {
      x.fillStyle = "#9a948a";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 1600; i++) {
        const v = r();
        x.fillStyle =
          v < 0.3
            ? "#5a5650"
            : v < 0.6
              ? "#c8c2b4"
              : v < 0.8
                ? "#8a6a52"
                : "#3a3a3a";
        x.fillRect(r() * S, r() * S, 2 + r() * 5, 2 + r() * 5);
      }
      K.stains(x, 0, 0, S, S, 20, 101, 0.45);
    },
    padded(x, S, r) {
      // padded / tiled cell wall
      x.fillStyle = "#a8a494";
      x.fillRect(0, 0, S, S);
      const c = S / 4;
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const g = x.createRadialGradient(
            i * c + c / 2,
            j * c + c / 2,
            2,
            i * c + c / 2,
            j * c + c / 2,
            c * 0.7,
          );
          g.addColorStop(0, "#c4c0ae");
          g.addColorStop(1, "#6e6a5c");
          x.fillStyle = g;
          x.fillRect(i * c + 1, j * c + 1, c - 2, c - 2);
        }
      K.stains(x, 0, 0, S, S, 24, 111, 0.6, [70, 50, 30]);
    },
    celltile(x, S, r) {
      // glazed institutional wall tile: green dado
      x.fillStyle = "#b8b8a6";
      x.fillRect(0, 0, S, S);
      const c = S / 8;
      for (let j = 0; j < 8; j++)
        for (let i = 0; i < 8; i++) {
          const v = 170 + r() * 30;
          x.fillStyle =
            "rgb(" +
            ((v * 0.8) | 0) +
            "," +
            (v | 0) +
            "," +
            ((v * 0.85) | 0) +
            ")";
          x.fillRect(i * c + 1, j * c + 1, c - 2, c - 2);
        }
      K.stains(x, 0, 0, S, S, 20, 121, 0.55, [60, 50, 30]);
      K.streaks(x, 0, 0, S, S, 20, 122, 0.3);
    },
    carpet(x, S, r) {
      x.fillStyle = "#6a2020";
      x.fillRect(0, 0, S, S);
      x.strokeStyle = "#b08a40";
      x.lineWidth = 3;
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const cx = (i * S) / 4 + S / 8,
            cy = (j * S) / 4 + S / 8;
          x.beginPath();
          x.moveTo(cx, cy - S / 12);
          x.lineTo(cx + S / 12, cy);
          x.lineTo(cx, cy + S / 12);
          x.lineTo(cx - S / 12, cy);
          x.closePath();
          x.stroke();
        }
      K.grain(x, 0, 0, S, S, 40, 131);
      K.stains(x, 0, 0, S, S, 20, 132, 0.5, [30, 20, 10]);
    },
    velvet(x, S, r) {
      x.fillStyle = "#7a1c1c";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < S; i += 6) {
        x.fillStyle =
          "rgba(0,0,0," + (0.1 + 0.1 * Math.sin(i * 0.3)).toFixed(2) + ")";
        x.fillRect(i, 0, 3, S);
      }
      K.grain(x, 0, 0, S, S, 30, 141);
      K.stains(x, 0, 0, S, S, 12, 142, 0.4, [20, 10, 5]);
    },
    sawdust(x, S, r) {
      // O'Rourke's: worn floorboards under a drift of sawdust
      x.fillStyle = "#6a4a2e";
      x.fillRect(0, 0, S, S);
      const n = 8,
        w = S / n;
      for (let i = 0; i < n; i++) {
        const v = 0.8 + r() * 0.3;
        x.fillStyle =
          "rgb(" +
          ((110 * v) | 0) +
          "," +
          ((78 * v) | 0) +
          "," +
          ((48 * v) | 0) +
          ")";
        x.fillRect(i * w + 1, 0, w - 2, S);
        x.fillStyle = "rgba(30,18,8,0.6)";
        x.fillRect(i * w, 0, 2, S);
        for (let k = 0; k < 3; k++) {
          const y = r() * S;
          x.fillRect(i * w, y, w, 1.5);
        }
        for (let k = 0; k < 8; k++) {
          x.strokeStyle = "rgba(40,25,12,0.25)";
          x.beginPath();
          const yy = r() * S;
          x.moveTo(i * w + 3, yy);
          x.bezierCurveTo(
            i * w + w * 0.3,
            yy + 20,
            i * w + w * 0.7,
            yy - 20,
            i * w + w - 3,
            yy + 6,
          );
          x.stroke();
        }
      }
      // sawdust: thousands of pale flecks, clumped
      for (let c = 0; c < 26; c++) {
        const cx = r() * S,
          cy = r() * S,
          rad = 20 + r() * 80;
        for (let k = 0; k < 220; k++) {
          const a = r() * 6.283,
            d = Math.pow(r(), 0.6) * rad;
          const v = 170 + r() * 60;
          x.fillStyle =
            "rgba(" +
            (v | 0) +
            "," +
            ((v * 0.82) | 0) +
            "," +
            ((v * 0.55) | 0) +
            "," +
            (0.35 + r() * 0.5).toFixed(2) +
            ")";
          x.fillRect(
            cx + Math.cos(a) * d,
            cy + Math.sin(a) * d,
            1 + r() * 3,
            1 + r() * 2,
          );
        }
      }
      K.stains(x, 0, 0, S, S, 14, 151, 0.45, [40, 25, 10]);
    },
    slate(x, S, r) {
      // roof slates (Tammany's hipped roof)
      x.fillStyle = "#3a3e42";
      x.fillRect(0, 0, S, S);
      const rows = 16,
        h = S / rows;
      for (let j = 0; j < rows; j++) {
        const w = S / 8,
          off = ((j % 2) * w) / 2;
        for (let i = -1; i < 9; i++) {
          const v = 50 + r() * 30;
          x.fillStyle =
            "rgb(" +
            (v | 0) +
            "," +
            ((v * 1.05) | 0) +
            "," +
            ((v * 1.12) | 0) +
            ")";
          x.fillRect(i * w + off + 1, j * h + 1, w - 2, h - 1);
        }
        x.fillStyle = "rgba(0,0,0,0.5)";
        x.fillRect(0, j * h, S, 2);
      }
      K.stains(x, 0, 0, S, S, 14, 161, 0.4, [60, 70, 40]);
      K.streaks(x, 0, 0, S, S, 24, 162, 0.3);
    },
    parquet(x, S, r) {
      // herringbone parquet
      x.fillStyle = "#5a3a22";
      x.fillRect(0, 0, S, S);
      const c = S / 8;
      for (let j = 0; j < 8; j++)
        for (let i = 0; i < 8; i++) {
          const v = 0.75 + r() * 0.35;
          x.fillStyle =
            "rgb(" +
            ((120 * v) | 0) +
            "," +
            ((80 * v) | 0) +
            "," +
            ((46 * v) | 0) +
            ")";
          if ((i + j) % 2)
            for (let k = 0; k < 4; k++)
              x.fillRect(i * c + (k * c) / 4 + 1, j * c + 1, c / 4 - 2, c - 2);
          else
            for (let k = 0; k < 4; k++)
              x.fillRect(i * c + 1, j * c + (k * c) / 4 + 1, c - 2, c / 4 - 2);
        }
      K.stains(x, 0, 0, S, S, 18, 171, 0.5, [40, 25, 10]);
      K.grain(x, 0, 0, S, S, 25, 172);
    },
    brownstone(x, S, r) {
      // Cooper Union's brown sandstone ashlar
      x.fillStyle = "#7a5a46";
      x.fillRect(0, 0, S, S);
      const rows = 6,
        h = S / rows;
      for (let j = 0; j < rows; j++) {
        const w = S / 3,
          off = ((j % 2) * w) / 2;
        for (let i = -1; i < 4; i++) {
          const v = 0.85 + r() * 0.25;
          x.fillStyle =
            "rgb(" +
            ((122 * v) | 0) +
            "," +
            ((90 * v) | 0) +
            "," +
            ((70 * v) | 0) +
            ")";
          x.fillRect(i * w + off + 2, j * h + 2, w - 4, h - 4);
        }
      }
      for (let i = 0; i < 900; i++) {
        x.fillStyle =
          r() < 0.5 ? "rgba(60,40,30,0.25)" : "rgba(180,150,120,0.18)";
        x.fillRect(r() * S, r() * S, 2 + r() * 4, 1 + r() * 2);
      }
      K.stains(x, 0, 0, S, S, 16, 181, 0.45, [40, 28, 20]);
      K.streaks(x, 0, 0, S, S, 30, 182, 0.3);
    },
    flemish(x, S, r) {
      // Flemish-bond red brick (Tammany)
      x.fillStyle = "#d8d0c0";
      x.fillRect(0, 0, S, S);
      const rows = 16,
        h = S / rows,
        L = S / 5.33,
        Hd = L / 2;
      for (let j = 0; j < rows; j++) {
        let px = j % 2 ? -Hd * 0.75 : 0,
          k = 0;
        while (px < S) {
          const hdr = k % 2 === 1;
          const w = hdr ? Hd : L;
          const v = hdr ? 0.55 + r() * 0.15 : 0.8 + r() * 0.2;
          x.fillStyle =
            "rgb(" +
            ((150 * v) | 0) +
            "," +
            ((62 * v) | 0) +
            "," +
            ((44 * v) | 0) +
            ")";
          x.fillRect(px + 1.5, j * h + 1.5, w - 3, h - 3);
          px += w;
          k++;
        }
      }
      K.stains(x, 0, 0, S, S, 16, 191, 0.4, [40, 25, 18]);
      K.streaks(x, 0, 0, S, S, 30, 192, 0.3);
    },
    chalkboard(x, S, r) {
      x.fillStyle = "#23302a";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 40; i++) {
        const g = x.createRadialGradient(
          r() * S,
          r() * S,
          0,
          r() * S,
          r() * S,
          60,
        );
        g.addColorStop(0, "rgba(200,210,200,0.08)");
        g.addColorStop(1, "rgba(200,210,200,0)");
        x.fillStyle = g;
        x.fillRect(0, 0, S, S);
      }
      K.grain(x, 0, 0, S, S, 20, 201);
    },
  };
  function customTex(name) {
    if (CUSTOM[name]) return CUSTOM[name];
    const S = name === "lace" ? 256 : 512;
    const c = K.canvas(S, S),
      x = c.getContext("2d");
    try {
      customPaint[name](x, S, K.rng(name));
    } catch (e) {
      G.reportError("poi_park:tex " + name, e);
    }
    return (CUSTOM[name] = K.texFromCanvas(c));
  }
  // Fallback for G.tex surfaces when textures module is absent
  const FB = {};
  function fallbackTex(key, base) {
    if (FB[key]) return FB[key];
    const S = 128,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    x.fillStyle = "#" + new THREE.Color(base).getHexString();
    x.fillRect(0, 0, S, S);
    K.grain(x, 0, 0, S, S, 50, U.hashStr(key) % 1000);
    K.stains(x, 0, 0, S, S, 6, 3, 0.3);
    return (FB[key] = K.texFromCanvas(c));
  }

  // ------------------------------------------------------------------
  // Materials. key → {tex (G.tex name) | custom, fb colour, tile [m per repeat u,v], rough, metal, ...}
  // ------------------------------------------------------------------
  const MATDEF = {
    brick_red: {
      tex: "brick_red",
      fb: 0xa0604a,
      tile: [2.5, 2.5],
      rough: 0.95,
    },
    brick_brown: {
      tex: "brick_brown",
      fb: 0x7a5a48,
      tile: [2.5, 2.5],
      rough: 0.95,
    },
    brick_tan: {
      tex: "brick_tan",
      fb: 0xb09a7a,
      tile: [2.5, 2.5],
      rough: 0.95,
    },
    limestone: {
      tex: "stone_limestone",
      fb: 0xd8d0bc,
      tile: [3, 3],
      rough: 0.9,
    },
    granite: { tex: "granite", fb: 0x8a8680, tile: [3, 3], rough: 0.8 },
    concrete: { tex: "concrete", fb: 0xa8a49a, tile: [3.5, 3.5], rough: 0.95 },
    concrete_dark: {
      tex: "concrete_dark",
      fb: 0x6a6660,
      tile: [3.5, 3.5],
      rough: 0.95,
    },
    sidewalk: { tex: "sidewalk", fb: 0x9a968c, tile: [3, 3], rough: 0.95 },
    metal: {
      tex: "metal_painted",
      fb: 0x8a8d86,
      tile: [2, 2],
      rough: 0.65,
      metal: 0.3,
    },
    metal_dark: {
      tex: "metal_panel",
      fb: 0x4a4d4c,
      tile: [2, 2],
      rough: 0.6,
      metal: 0.4,
    },
    rust: { tex: "rust", fb: 0x7a4a2a, tile: [2, 2], rough: 0.9, metal: 0.2 },
    corrugated: {
      tex: "corrugated",
      fb: 0x8a7a62,
      tile: [2, 2],
      rough: 0.85,
      metal: 0.25,
      side: THREE.DoubleSide,
    },
    wood: { tex: "wood_planks", fb: 0x7a5a3a, tile: [2, 2], rough: 0.85 },
    wood_rotten: {
      tex: "wood_rotten",
      fb: 0x5a4a38,
      tile: [2, 2],
      rough: 0.95,
    },
    plaster: { custom: "plaster", tile: [3.2, 3.2], rough: 0.92 },
    plaster_stained: {
      tex: "plaster_stained",
      fb: 0xc0b8a4,
      tile: [3, 3],
      rough: 0.92,
    },
    tile: { tex: "tile_cryo", fb: 0xc8c8c0, tile: [2, 2], rough: 0.5 },
    fabric: {
      tex: "fabric",
      fb: 0xb0a488,
      tile: [1.2, 1.2],
      rough: 1,
      side: THREE.DoubleSide,
    },
    dirt: { tex: "dirt", fb: 0x6a5a44, tile: [3, 3], rough: 1 },
    rubble: { tex: "rubble", fb: 0x847e72, tile: [3, 3], rough: 1 },
    asphalt: { tex: "asphalt", fb: 0x3a3a38, tile: [4, 4], rough: 0.95 },
    glass: {
      tex: "glass_dirty",
      fb: 0x2a3434,
      tile: [2, 2],
      rough: 0.15,
      metal: 0.6,
    },
    // own canvases
    wallpaper: { custom: "wallpaper", tile: [1.6, 1.6], rough: 0.9 },
    wallpaper_green: {
      custom: "wallpaper_green",
      tile: [1.6, 1.6],
      rough: 0.9,
    },
    hextile: { custom: "hextile", tile: [1.4, 1.4], rough: 0.5 },
    checker: { custom: "checker", tile: [2.4, 2.4], rough: 0.45 },
    mosaic: { custom: "mosaic", tile: [6, 6], rough: 0.5 },
    tin: { custom: "tin", tile: [2.4, 2.4], rough: 0.5, metal: 0.4 },
    lace: {
      custom: "lace",
      tile: [1.8, 1.0],
      rough: 0.6,
      metal: 0.4,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      noGrimeUV: true,
    },
    rooftile: { custom: "rooftile", tile: [1.6, 1.6], rough: 0.35, metal: 0.1 },
    lacquer: { custom: "lacquer", tile: [2, 2], rough: 0.4 },
    marble: { custom: "marble", tile: [2.5, 2.5], rough: 0.3 },
    terrazzo: { custom: "terrazzo", tile: [3, 3], rough: 0.45 },
    padded: { custom: "padded", tile: [2, 2], rough: 0.9 },
    celltile: { custom: "celltile", tile: [1.6, 1.6], rough: 0.45 },
    carpet: { custom: "carpet", tile: [3, 3], rough: 1 },
    velvet: {
      custom: "velvet",
      tile: [1.5, 1.5],
      rough: 0.9,
      side: THREE.DoubleSide,
    },
    sawdust: { custom: "sawdust", tile: [2.4, 2.4], rough: 1 },
    slate: { custom: "slate", tile: [3, 3], rough: 0.7 },
    parquet: { custom: "parquet", tile: [2, 2], rough: 0.6 },
    brownstone: { custom: "brownstone", tile: [3, 1.8], rough: 0.95 },
    flemish: { custom: "flemish", tile: [2.2, 1.2], rough: 0.95 },
    chalkboard: { custom: "chalkboard", tile: [4, 4], rough: 0.9 },
    flat: { flat: true, rough: 0.7 }, // untextured painted surfaces (colour from tint)
    shiny: { flat: true, rough: 0.28, metal: 0.75 }, // brass, chrome, gold
    // atlases (filled at init)
    art: { atlas: "art", rough: 0.75, alphaTest: 0.4 },
    decal: { atlas: "art", rough: 0.9, transparent: true },
    pics: { atlas: "pics", rough: 0.75 },
    glass_clear: {
      tex: "glass_dirty",
      fb: 0x8a9a9a,
      tile: [2, 2],
      rough: 0.1,
      metal: 0.3,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    },
    neon: { atlas: "neon", neon: true },
    lamp: { lamp: true }, // emissive bulbs / tubes (colour from tint)
  };
  K.MATDEF = MATDEF;
  // Colour aliases share a base material (tint baked into vertex colours → one draw call)
  const ALIAS = {
    black_iron: ["metal_dark", 0x2a2826],
    paint_red: ["flat", 0x9a2a22],
    paint_green: ["flat", 0x3e5a3e],
    paint_cream: ["flat", 0xd8ceb4],
    paint_black: ["flat", 0x1e1c1a],
    paint_white: ["flat", 0xe0dccc],
    paint_blue: ["flat", 0x2c4a6a],
    paint_yellow: ["flat", 0xd0a030],
    brass: ["shiny", 0xb08a42],
    chrome: ["shiny", 0xc8ccd0],
    gold: ["shiny", 0xd8a840],
    steel: ["shiny", 0x8a9096],
    wood_dark: ["wood", 0x5a3c26],
    mahogany: ["wood", 0x6a2c1c],
    leather: ["flat", 0x4a2a1a],
    leather_red: ["flat", 0x7a1e18],
    bone: ["plaster", 0xd8ccb0],
    meat: ["flat", 0x8a3a2a],
    salami: ["flat", 0x6a2a1e],
    glass_dark: ["glass", 0x1a2222],
    cloth_red: ["fabric", 0xa02a20],
    cloth_white: ["fabric", 0xe0dcd0],
    cloth_green: ["fabric", 0x4a6a44],
    rubber: ["metal_dark", 0x1a1a1a],
    jade: ["shiny", 0x3a8a6a],
    ceramic: ["flat", 0xe8e4da],
    copper: ["shiny", 0xb06a3a],
    bronze: ["shiny", 0x6a5a38],
    cast_iron: ["metal_dark", 0x3a3834],
    green_paint: ["flat", 0x2f5a3a],
    oak: ["wood", 0x8a6440],
    felt: ["fabric", 0x2a5a32],
  };
  K.ALIAS = ALIAS;
  const aliasMul = {};
  function resolve(key) {
    const al = ALIAS[key];
    if (!al) return { base: key, mul: null };
    if (!aliasMul[key]) {
      const bd = MATDEF[al[0]] || {};
      const bc = new THREE.Color(bd.flat || bd.lamp ? 0xffffff : 0xffffff),
        ac = new THREE.Color(al[1]);
      aliasMul[key] = {
        base: al[0],
        mul: [ac.r / bc.r, ac.g / bc.g, ac.b / bc.b],
      };
    }
    return aliasMul[key];
  }
  K.resolve = resolve;
  K.tileOf = (key) => {
    const d = MATDEF[resolve(key).base];
    return (d && d.tile) || [3, 3];
  };

  // Atlases (painted during init)
  const ATLAS = {};
  function atlasInit(name, size) {
    if (ATLAS[name]) return ATLAS[name];
    const c = K.canvas(size, size),
      x = c.getContext("2d");
    if (name === "neon") {
      x.fillStyle = "#000";
      x.fillRect(0, 0, size, size);
    }
    const A = {
      name,
      c,
      x,
      size,
      shelfY: 0,
      shelfH: 0,
      curX: 0,
      cells: {},
      tex: null,
    };
    ATLAS[name] = A;
    return A;
  }
  /**
   * Paint a cell into an atlas; returns uv rect [u0,v0,u1,v1] (v up).
   * draw(ctx, x, y, w, h) — cache by key.
   */
  const CELLKEY = {};
  K.paint = function (atlas0, key, w, h, draw) {
    if (CELLKEY[atlas0 + "|" + key]) return CELLKEY[atlas0 + "|" + key];
    // overflow chain: art → art2 → art3 …
    let atlas = atlas0,
      A = atlasInit(atlas, 2048),
      n = 1;
    const fits = (B) =>
      B.curX + w <= B.size
        ? B.shelfY + Math.max(B.shelfH, h) <= B.size
        : B.shelfY + B.shelfH + 2 + h <= B.size;
    while (!fits(A) && n < 6) {
      n++;
      atlas = atlas0 + n;
      A = atlasInit(atlas, 2048);
      ensureAtlasMats(atlas0, atlas);
    }
    const rect = paintInto(A, key, w, h, draw);
    rect.atlas = atlas;
    return (CELLKEY[atlas0 + "|" + key] = rect);
  };
  function ensureAtlasMats(base, name) {
    if (MATDEF[name]) return;
    if (base === "neon") MATDEF[name] = { atlas: name, neon: true };
    else {
      MATDEF[name] = { atlas: name, rough: 0.75, alphaTest: 0.4 };
      MATDEF[name + "_decal"] = { atlas: name, rough: 0.9, transparent: true };
    }
  }
  /** Map a generic atlas material key to the atlas that actually holds the rect. */
  K.atlasMat = function (mat, rect) {
    if (!rect || !rect.atlas) return mat;
    if (mat === "art" || mat === "pics") return rect.atlas;
    if (mat === "decal")
      return rect.atlas === "art"
        ? "decal"
        : MATDEF[rect.atlas + "_decal"]
          ? rect.atlas + "_decal"
          : rect.atlas;
    if (mat === "neon") return rect.atlas;
    return mat;
  };
  function paintInto(A, key, w, h, draw) {
    if (A.cells[key]) return A.cells[key];
    if (A.curX + w > A.size) {
      A.shelfY += A.shelfH + 2;
      A.curX = 0;
      A.shelfH = 0;
    }
    if (A.shelfY + h > A.size) {
      console.warn("[poi_park] atlas full: " + A.name);
      return (A.cells[key] = [0, 0, 0.01, 0.01]);
    }
    const X = A.curX,
      Y = A.shelfY;
    A.x.save();
    A.x.beginPath();
    A.x.rect(X, Y, w, h);
    A.x.clip();
    try {
      draw(A.x, X, Y, w, h);
    } catch (e) {
      G.reportError("poi_park:paint " + key, e);
    }
    A.x.restore();
    A.curX += w + 2;
    A.shelfH = Math.max(A.shelfH, h);
    if (A.tex) A.tex.needsUpdate = true;
    const S = A.size;
    return (A.cells[key] = [
      (X + 0.5) / S,
      1 - (Y + h - 0.5) / S,
      (X + w - 0.5) / S,
      1 - (Y + 0.5) / S,
    ]);
  }
  function atlasTex(name) {
    const A = atlasInit(name, 2048);
    if (!A.tex) {
      A.tex = K.texFromCanvas(A.c, { clamp: true });
    }
    return A.tex;
  }
  K.refreshAtlases = function () {
    for (const k in ATLAS) if (ATLAS[k].tex) ATLAS[k].tex.needsUpdate = true;
  };

  const MATS = {};
  const SELF_LIT = 1.0;
  /** Material for key. lit=true → interior self-lit variant (vertex colour = baked light). */
  K.mat = function (key, lit) {
    const base = resolve(key).base;
    const d = MATDEF[base] || MATDEF.concrete;
    const ck = base + (lit ? ":lit" : "");
    if (MATS[ck]) return MATS[ck];
    let m;
    if (d.neon) {
      m = new THREE.MeshBasicMaterial({
        map: atlasTex(d.atlas),
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        fog: !lit,
        side: THREE.DoubleSide,
      });
    } else if (d.lamp) {
      m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        toneMapped: false,
        fog: !lit,
      });
    } else {
      let map = null;
      if (d.atlas) map = atlasTex(d.atlas);
      else if (d.custom) map = customTex(d.custom);
      else if (d.tex) {
        if (!G.isStub("tex")) {
          try {
            const t = G.tex.get(d.tex);
            if (t && t.isTexture) map = t;
          } catch (e) {
            map = null;
          }
        }
        if (!map) map = fallbackTex(d.tex, d.fb || 0x999999);
      } else if (d.flat) map = fallbackTex("flat_white", 0xf4f2ee); // same shader path as textured surfaces (map-less + vertex colours rendered unlit-white in interiors)
      m = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map,
        vertexColors: true,
        roughness: d.rough !== undefined ? d.rough : 0.85,
        metalness: d.metal || 0,
        side: d.side || THREE.FrontSide,
      });
      if (d.alphaTest) m.alphaTest = d.alphaTest;
      if (d.transparent) {
        m.transparent = true;
        m.depthWrite = false;
        if (d.opacity) m.opacity = d.opacity;
        else {
          m.polygonOffset = true;
          m.polygonOffsetFactor = -2;
          m.polygonOffsetUnits = -2;
        }
      }
      if (!lit && d.tex && !d.custom && !G.isStub("tex") && G.tex.normal) {
        try {
          const n = G.tex.normal(d.tex);
          if (n && n.isTexture) {
            m.normalMap = n;
            m.normalScale = new THREE.Vector2(0.5, 0.5);
          }
        } catch (e) {
          /* */
        }
      }
      if (lit) {
        m.onBeforeCompile = function (sh) {
          sh.fragmentShader = sh.fragmentShader.replace(
            "#include <emissivemap_fragment>",
            "#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += diffuseColor.rgb * " +
              SELF_LIT.toFixed(2) +
              ";",
          );
        };
        m.customProgramCacheKey = function () {
          return "ppk_selflit";
        };
      }
    }
    m.name = "ppk_" + ck;
    m.userData.shared = true;
    return (MATS[ck] = m);
  };

  // ------------------------------------------------------------------
  // BUILDER
  // ------------------------------------------------------------------
  /**
   * K.builder({name, off:{x,y,z} (local→world), lit (interior baked light), amb [r,g,b], grime, floors:[y...] (local floor levels for AO)})
   */
  function Builder(o) {
    o = o || {};
    this.name = o.name || "ppk";
    this.off = o.off || { x: 0, y: 0, z: 0 };
    this.lit = !!o.lit;
    this.amb = o.amb || [0.12, 0.12, 0.13];
    this.grime = o.grime !== undefined ? o.grime : 0.5;
    this.floors = (o.floors || [0]).slice().sort((a, b) => a - b);
    this.bk = new Map();
    this.lights = [];
    this.glows = [];
    this.burns = [];
    this.colliders = [];
    this.shadows = o.shadows !== undefined ? o.shadows : !o.lit;
    this.seg = o.seg || (this.lit ? 1.4 : 5);
  }
  K.builder = (o) => new Builder(o);
  const BP = Builder.prototype;
  BP._b = function (mat) {
    const r = resolve(mat);
    this._mul = r.mul;
    let b = this.bk.get(r.base);
    if (!b) {
      b = { p: [], n: [], uv: [], c: [], i: [], vc: 0 };
      this.bk.set(r.base, b);
    }
    return b;
  };
  /** Floor level below local y (for ground AO). */
  BP._floorBelow = function (ly) {
    let f = this.floors[0];
    for (const v of this.floors) if (v <= ly + 0.05) f = v;
    return f;
  };
  /** Base colour for a vertex (local coords): tint × grime/AO. */
  BP._col = function (lx, ly, lz, ny, tint, grime) {
    let s = 1;
    if (grime > 0) {
      const gy = ly - this._floorBelow(ly);
      const ao = U.clamp(1 - gy / (this.lit ? 1.6 : 4.5), 0, 1);
      const streak = U.noise2(lx * 0.31 + lz * 0.27, ly * 0.07);
      const blotch = U.noise2(
        lx * 0.09 + 11.3 + ly * 0.02,
        lz * 0.09 - ly * 0.04,
      );
      s =
        1 -
        grime *
          (0.4 * ao * ao + 0.22 * streak * streak + 0.24 * blotch * blotch);
      if (ny < -0.6) s *= 1 - grime * 0.15;
    }
    for (const bn of this.burns) {
      const dx = lx - bn.x,
        dy = ly - bn.y,
        dz = lz - bn.z,
        d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bn.r * bn.r)
        s *= 1 - bn.amt * Math.min(1, (1 - Math.sqrt(d2) / bn.r) * 1.6);
    }
    const m = this._mul;
    return m
      ? [tint[0] * s * m[0], tint[1] * s * m[1], tint[2] * s * m[2]]
      : [tint[0] * s, tint[1] * s, tint[2] * s];
  };
  function tintArr(t) {
    if (t === undefined || t === null) return [1, 1, 1];
    if (Array.isArray(t)) return t;
    const c = new THREE.Color(t);
    return [c.r, c.g, c.b];
  }
  K.tint = tintArr;
  /** Scorch / soot darkening sphere (local coords). */
  BP.burn = function (x, y, z, r, amt) {
    this.burns.push({ x, y, z, r, amt: amt === undefined ? 0.7 : amt });
    return this;
  };
  /** Baked point light (local coords). o: {box:[x0,y0,z0,x1,y1,z1] local limits, wrap} */
  BP.light = function (x, y, z, color, intensity, radius, o) {
    o = o || {};
    const c = tintArr(color);
    const off = this.off;
    const L = {
      x: x + off.x,
      y: y + off.y,
      z: z + off.z,
      c,
      i: intensity,
      r: radius,
      r2: radius * radius,
      wrap: o.wrap !== undefined ? o.wrap : 0.35,
    };
    if (o.box)
      L.box = [
        o.box[0] + off.x,
        o.box[1] + off.y,
        o.box[2] + off.z,
        o.box[3] + off.x,
        o.box[4] + off.y,
        o.box[5] + off.z,
      ];
    this.lights.push(L);
    return this;
  };
  /** Glow sprite (fake light halo). size in metres. */
  BP.glow = function (x, y, z, color, size) {
    this.glows.push({
      x: x + this.off.x,
      y: y + this.off.y,
      z: z + this.off.z,
      c: tintArr(color),
      s: size || 1,
    });
    return this;
  };

  /** push one vertex (local coords in; stored in world coords) */
  BP._v = function (b, x, y, z, nx, ny, nz, u, v, tint, grime) {
    const o = this.off;
    b.p.push(x + o.x, y + o.y, z + o.z);
    b.n.push(nx, ny, nz);
    b.uv.push(u, v);
    const c = this._col(x, y, z, ny, tint, grime);
    b.c.push(c[0], c[1], c[2]);
    b.vc++;
  };
  /**
   * Planar grid face. origin (ox,oy,oz), U axis (ux,uy,uz) length ul, V axis (vx,vy,vz) length vl. Normal = U×V.
   * o: {uv:'side'|'top'|'plane'|'rect', rect, tint, grime, uo, vo, seg, tile}
   */
  BP.face = function (mat, ox, oy, oz, ux, uy, uz, vx, vy, vz, ul, vl, o) {
    o = o || {};
    if (o.rect) mat = K.atlasMat(mat, o.rect);
    if (ul <= 1e-4 || vl <= 1e-4) return this;
    const b = this._b(mat);
    const nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const seg = o.seg || this.seg;
    const su = Math.max(1, Math.min(32, Math.ceil(ul / seg))),
      sv = Math.max(1, Math.min(32, Math.ceil(vl / seg)));
    const tile = o.tile || K.tileOf(mat);
    const mode = o.uv || "side";
    const tint = tintArr(o.tint);
    const base = b.vc;
    for (let j = 0; j <= sv; j++) {
      const bb = (vl * j) / sv;
      for (let i = 0; i <= su; i++) {
        const a = (ul * i) / su;
        const x = ox + ux * a + vx * bb,
          y = oy + uy * a + vy * bb,
          z = oz + uz * a + vz * bb;
        let u, v;
        if (mode === "rect") {
          const r = o.rect;
          u = r[0] + (r[2] - r[0]) * (a / ul);
          v = r[1] + (r[3] - r[1]) * (bb / vl);
        } else if (mode === "top") {
          u = (x + this.off.x) / tile[0];
          v = -(z + this.off.z) / tile[1];
        } else if (mode === "plane") {
          u = ((o.uo || 0) + a) / tile[0];
          v = ((o.vo || 0) + bb) / tile[1];
        } else {
          u = ((o.uo || 0) + a) / tile[0];
          v = y / tile[1];
        }
        this._v(b, x, y, z, nx, ny, nz, u, v, tint, grime);
      }
    }
    const row = su + 1;
    for (let j = 0; j < sv; j++)
      for (let i = 0; i < su; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    return this;
  };
  /** Quad from 4 corner points (counter-clockwise seen from the front). o: {rect, tint, grime, uv} */
  BP.quad = function (mat, p0, p1, p2, p3, o) {
    o = o || {};
    if (o.rect) mat = K.atlasMat(mat, o.rect);
    const b = this._b(mat);
    const ax = p1[0] - p0[0],
      ay = p1[1] - p0[1],
      az = p1[2] - p0[2];
    const bx = p3[0] - p0[0],
      by = p3[1] - p0[1],
      bz = p3[2] - p0[2];
    let nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl;
    ny /= nl;
    nz /= nl;
    const tint = tintArr(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = o.tile || K.tileOf(mat);
    const base = b.vc;
    const pts = [p0, p1, p2, p3];
    const R = o.rect;
    const ruv = R
      ? [
          [R[0], R[1]],
          [R[2], R[1]],
          [R[2], R[3]],
          [R[0], R[3]],
        ]
      : null;
    for (let k = 0; k < 4; k++) {
      const p = pts[k];
      let u, v;
      if (ruv) {
        u = ruv[k][0];
        v = ruv[k][1];
      } else {
        const aX = Math.abs(nx),
          aY = Math.abs(ny),
          aZ = Math.abs(nz);
        if (aY >= aX && aY >= aZ) {
          u = p[0] / tile[0];
          v = -p[2] / tile[1];
        } else if (aX >= aZ) {
          u = p[2] / tile[0];
          v = p[1] / tile[1];
        } else {
          u = p[0] / tile[0];
          v = p[1] / tile[1];
        }
      }
      this._v(b, p[0], p[1], p[2], nx, ny, nz, u, v, tint, grime);
    }
    b.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    return this;
  };
  /** Subdivided (bilinear) quad p0→p1 = U, p0→p3 = V; normal (p1−p0)×(p3−p0). o: {tint, grime, seg, uv:'top'|'side'} */
  BP.quadGrid = function (mat, p0, p1, p2, p3, o) {
    o = o || {};
    const b = this._b(mat);
    const ax = p1[0] - p0[0],
      ay = p1[1] - p0[1],
      az = p1[2] - p0[2];
    const bx = p3[0] - p0[0],
      by = p3[1] - p0[1],
      bz = p3[2] - p0[2];
    let nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl;
    ny /= nl;
    nz /= nl;
    const seg = o.seg || this.seg;
    const lu = Math.max(
      Math.hypot(ax, ay, az),
      Math.hypot(p2[0] - p3[0], p2[1] - p3[1], p2[2] - p3[2]),
    );
    const lv = Math.max(
      Math.hypot(bx, by, bz),
      Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]),
    );
    const su = Math.max(1, Math.min(32, Math.ceil(lu / seg))),
      sv = Math.max(1, Math.min(32, Math.ceil(lv / seg)));
    const tint = tintArr(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tileOf(mat);
    const top = o.uv ? o.uv === "top" : Math.abs(ny) > 0.7;
    const base = b.vc;
    for (let j = 0; j <= sv; j++) {
      const v = j / sv;
      for (let i = 0; i <= su; i++) {
        const u = i / su;
        const x =
          (p0[0] * (1 - u) + p1[0] * u) * (1 - v) +
          (p3[0] * (1 - u) + p2[0] * u) * v;
        const y =
          (p0[1] * (1 - u) + p1[1] * u) * (1 - v) +
          (p3[1] * (1 - u) + p2[1] * u) * v;
        const z =
          (p0[2] * (1 - u) + p1[2] * u) * (1 - v) +
          (p3[2] * (1 - u) + p2[2] * u) * v;
        const U = top ? (x + this.off.x) / tile[0] : (u * lu) / tile[0],
          V = top ? -(z + this.off.z) / tile[1] : y / tile[1];
        this._v(b, x, y, z, nx, ny, nz, U, V, tint, grime);
      }
    }
    const row = su + 1;
    for (let j = 0; j < sv; j++)
      for (let i = 0; i < su; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    return this;
  };
  /** Quad whose winding is flipped if needed so its normal points along n. */
  BP.quadN = function (mat, p0, p1, p2, p3, n, o) {
    const ax = p1[0] - p0[0],
      ay = p1[1] - p0[1],
      az = p1[2] - p0[2];
    const bx = p3[0] - p0[0],
      by = p3[1] - p0[1],
      bz = p3[2] - p0[2];
    const nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx;
    if (nx * n[0] + ny * n[1] + nz * n[2] >= 0)
      return this.quad(mat, p0, p1, p2, p3, o);
    return this.quad(mat, p1, p0, p3, p2, o);
  };
  /**
   * Box: bottom-centre (cx,y0,cz), w (local x), h, d (local z).
   * o: {yaw (three.js), faces 'nsewtb' (default 'nsewt'), tint, grime, uv, seg, tile, rect}
   */
  BP.box = function (mat, cx, y0, cz, w, h, d, o) {
    o = o || {};
    const yaw = o.yaw || 0,
      c = Math.cos(yaw),
      s = Math.sin(yaw);
    const faces = o.faces || "nsewt";
    const fo = {
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
      seg: o.seg,
      uv: o.uv,
      rect: o.rect,
    };
    const hw = w / 2,
      hd = d / 2;
    const R = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
    const D = (lx, lz) => [lx * c + lz * s, -lx * s + lz * c];
    let p, u;
    if (faces.indexOf("s") >= 0) {
      p = R(-hw, hd);
      u = D(1, 0);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, w, h, fo);
    }
    if (faces.indexOf("n") >= 0) {
      p = R(hw, -hd);
      u = D(-1, 0);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, w, h, fo);
    }
    if (faces.indexOf("e") >= 0) {
      p = R(hw, hd);
      u = D(0, -1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, d, h, fo);
    }
    if (faces.indexOf("w") >= 0) {
      p = R(-hw, -hd);
      u = D(0, 1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, d, h, fo);
    }
    const to = {
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
      seg: o.seg,
      uv: o.uv === "rect" ? "rect" : o.uvTop || "top",
      rect: o.rect,
    };
    if (faces.indexOf("t") >= 0) {
      p = R(-hw, hd);
      u = D(1, 0);
      const v = D(0, -1);
      this.face(
        mat,
        p[0],
        y0 + h,
        p[1],
        u[0],
        0,
        u[1],
        v[0],
        0,
        v[1],
        w,
        d,
        to,
      );
    }
    if (faces.indexOf("b") >= 0) {
      p = R(-hw, -hd);
      u = D(1, 0);
      const v = D(0, 1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], v[0], 0, v[1], w, d, to);
    }
    return this;
  };
  BP.boxMM = function (mat, x0, y0, z0, x1, y1, z1, o) {
    return this.box(
      mat,
      (x0 + x1) / 2,
      Math.min(y0, y1),
      (z0 + z1) / 2,
      Math.abs(x1 - x0),
      Math.abs(y1 - y0),
      Math.abs(z1 - z0),
      o,
    );
  };
  /** Vertical cylinder/cone. o: {top(true), bottom, arc0, arc, tint, grime, rows} */
  BP.cyl = function (mat, cx, y0, cz, rb, rt, h, seg, o) {
    o = o || {};
    const b = this._b(mat);
    seg = seg || 10;
    const tint = tintArr(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = K.tileOf(mat);
    const a0 = o.arc0 || 0,
      arc = o.arc || Math.PI * 2;
    const rows = o.rows || Math.max(1, Math.min(16, Math.ceil(h / this.seg)));
    const slope = (rb - rt) / (h || 1);
    const base = b.vc;
    for (let j = 0; j <= rows; j++) {
      const t = j / rows,
        y = y0 + h * t,
        r = rb + (rt - rb) * t;
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg,
          ca = Math.cos(ang),
          sa = Math.sin(ang);
        let nx = ca,
          ny = slope,
          nz = -sa;
        const nl = Math.hypot(nx, ny, nz);
        nx /= nl;
        ny /= nl;
        nz /= nl;
        this._v(
          b,
          cx + ca * r,
          y,
          cz - sa * r,
          nx,
          ny,
          nz,
          (((arc * i) / seg) * Math.max(rb, rt, 0.2)) / tile[0],
          y / tile[1],
          tint,
          grime,
        );
      }
    }
    const row = seg + 1;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < seg; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + row + 1, a + row, a, a + 1, a + row + 1);
      }
    const cap = (y, r, up) => {
      if (r <= 1e-4) return;
      const cb = b.vc;
      this._v(b, cx, y, cz, 0, up ? 1 : -1, 0, 0.5, 0.5, tint, grime);
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg;
        this._v(
          b,
          cx + Math.cos(ang) * r,
          y,
          cz - Math.sin(ang) * r,
          0,
          up ? 1 : -1,
          0,
          0.5 + Math.cos(ang) * 0.5,
          0.5 + Math.sin(ang) * 0.5,
          tint,
          grime,
        );
      }
      for (let i = 0; i < seg; i++) {
        if (up) b.i.push(cb, cb + 1 + i, cb + 2 + i);
        else b.i.push(cb, cb + 2 + i, cb + 1 + i);
      }
    };
    if (o.top !== false) cap(y0 + h, rt, true);
    if (o.bottom) cap(y0, rb, false);
    return this;
  };
  const _m4 = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _v1 = new THREE.Vector3(),
    _s = new THREE.Vector3(),
    _n3 = new THREE.Matrix3();
  /** Arbitrary BufferGeometry with transform (local coords). o: {x,y,z,rx,ry,rz,s,sx,sy,sz,matrix,tint,grime,uv:'keep'|'rect',rect} */
  BP.geo = function (mat, geom, o) {
    o = o || {};
    const b = this._b(mat);
    let m = o.matrix;
    if (!m) {
      _e.set(o.rx || 0, o.ry || 0, o.rz || 0, "YXZ");
      _q.setFromEuler(_e);
      const sc = o.s !== undefined ? o.s : 1;
      _s.set(
        o.sx !== undefined ? o.sx : sc,
        o.sy !== undefined ? o.sy : sc,
        o.sz !== undefined ? o.sz : sc,
      );
      m = _m4.compose(_v1.set(o.x || 0, o.y || 0, o.z || 0), _q, _s);
    }
    _n3.getNormalMatrix(m);
    const pos = geom.attributes.position,
      nor = geom.attributes.normal,
      uva = geom.attributes.uv;
    const tint = tintArr(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = K.tileOf(mat);
    const e = m.elements,
      ne = _n3.elements;
    const base = b.vc,
      n = pos.count;
    for (let i = 0; i < n; i++) {
      const px = pos.getX(i),
        py = pos.getY(i),
        pz = pos.getZ(i);
      const x = e[0] * px + e[4] * py + e[8] * pz + e[12],
        y = e[1] * px + e[5] * py + e[9] * pz + e[13],
        z = e[2] * px + e[6] * py + e[10] * pz + e[14];
      let nx = 0,
        ny = 1,
        nz = 0;
      if (nor) {
        const qx = nor.getX(i),
          qy = nor.getY(i),
          qz = nor.getZ(i);
        nx = ne[0] * qx + ne[3] * qy + ne[6] * qz;
        ny = ne[1] * qx + ne[4] * qy + ne[7] * qz;
        nz = ne[2] * qx + ne[5] * qy + ne[8] * qz;
        const l = Math.hypot(nx, ny, nz) || 1;
        nx /= l;
        ny /= l;
        nz /= l;
      }
      let u, v;
      if (o.uv === "keep" && uva) {
        u = uva.getX(i);
        v = uva.getY(i);
      } else if (o.uv === "rect" && uva) {
        const r = o.rect;
        u = r[0] + (r[2] - r[0]) * uva.getX(i);
        v = r[1] + (r[3] - r[1]) * uva.getY(i);
      } else {
        const ax = Math.abs(nx),
          ay = Math.abs(ny),
          az = Math.abs(nz);
        if (ay >= ax && ay >= az) {
          u = x / tile[0];
          v = -z / tile[1];
        } else if (ax >= az) {
          u = z / tile[0];
          v = y / tile[1];
        } else {
          u = x / tile[0];
          v = y / tile[1];
        }
      }
      this._v(b, x, y, z, nx, ny, nz, u, v, tint, grime);
    }
    if (geom.index) {
      const ix = geom.index;
      for (let i = 0; i < ix.count; i++) b.i.push(base + ix.getX(i));
    } else for (let i = 0; i < n; i++) b.i.push(base + i);
    return this;
  };
  /** Square-section beam from A to B (w across, h up-ish). */
  BP.beam = function (mat, ax, ay, az, bx, by, bz, w, h, o) {
    const dx = bx - ax,
      dy = by - ay,
      dz = bz - az,
      len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) return this;
    const g = K.unitBox();
    const yaw = Math.atan2(dx, dz),
      pitch = -Math.atan2(dy, Math.hypot(dx, dz));
    _e.set(pitch, yaw, 0, "YXZ");
    _q.setFromEuler(_e);
    _s.set(w, h, len);
    const m = new THREE.Matrix4().compose(
      _v1.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2),
      _q,
      _s,
    );
    return this.geo(mat, g, Object.assign({}, o || {}, { matrix: m }));
  };
  /** Round pipe/bar from A to B. */
  BP.pipe = function (mat, ax, ay, az, bx, by, bz, r, seg, o) {
    const dx = bx - ax,
      dy = by - ay,
      dz = bz - az,
      len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) return this;
    const g = K.unitCyl(seg || 6);
    const dir = new THREE.Vector3(dx / len, dy / len, dz / len);
    _q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    _s.set(r, len, r);
    const m = new THREE.Matrix4().compose(
      _v1.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2),
      _q,
      _s,
    );
    return this.geo(mat, g, Object.assign({}, o || {}, { matrix: m }));
  };
  /** Vertical plate facing (nx,nz) centred (cx,cy,cz) size w×h, optional atlas rect. */
  BP.plate = function (mat, cx, cy, cz, nx, nz, w, h, rect, o) {
    o = o || {};
    const rx = nz,
      rz = -nx,
      hw = w / 2,
      hh = h / 2,
      off = o.off !== undefined ? o.off : 0.015;
    const px = cx + nx * off,
      pz = cz + nz * off;
    return this.quad(
      mat,
      [px - rx * hw, cy - hh, pz - rz * hw],
      [px + rx * hw, cy - hh, pz + rz * hw],
      [px + rx * hw, cy + hh, pz + rz * hw],
      [px - rx * hw, cy + hh, pz - rz * hw],
      Object.assign({ rect, grime: 0 }, o),
    );
  };
  /** Horizontal plate (rug, decal, puddle) at height y, yaw rotation. */
  BP.hplate = function (mat, cx, y, cz, w, d, yaw, rect, o) {
    o = o || {};
    const c = Math.cos(yaw || 0),
      s = Math.sin(yaw || 0);
    const P = (lx, lz) => [cx + lx * c + lz * s, y, cz - lx * s + lz * c];
    const hw = w / 2,
      hd = d / 2;
    return this.quad(
      mat,
      P(-hw, hd),
      P(hw, hd),
      P(hw, -hd),
      P(-hw, -hd),
      Object.assign({ rect, grime: 0 }, o),
    );
  };

  let _ubox = null,
    _ucyl = {};
  K.unitBox = () => _ubox || (_ubox = new THREE.BoxGeometry(1, 1, 1));
  K.unitCyl = (seg) =>
    _ucyl[seg] ||
    (_ucyl[seg] = new THREE.CylinderGeometry(1, 1, 1, seg, 1, false));

  /** Colliders (local coords → world). */
  BP.col = function (x0, y0, z0, x1, y1, z1, o) {
    const off = this.off;
    const c = G.world.addBox(
      Math.min(x0, x1) + off.x,
      Math.min(y0, y1) + off.y,
      Math.min(z0, z1) + off.z,
      Math.max(x0, x1) + off.x,
      Math.max(y0, y1) + off.y,
      Math.max(z0, z1) + off.z,
      Object.assign({ tag: "poi_park", surface: "concrete" }, o || {}),
    );
    this.colliders.push(c);
    return c;
  };
  /** Rotated collider: centre, size, three.js yaw (core yaw is the negative). */
  BP.ocol = function (cx, cz, w, d, y0, y1, yaw, o) {
    const off = this.off;
    const c = G.world.addCollider(
      cx + off.x,
      cz + off.z,
      w,
      d,
      y0 + off.y,
      y1 + off.y,
      -(yaw || 0),
      Object.assign({ tag: "poi_park", surface: "concrete" }, o || {}),
    );
    this.colliders.push(c);
    return c;
  };

  // ------------------------------------------------------------------
  // Finish: bake lights into vertex colours, create one mesh per material
  // ------------------------------------------------------------------
  BP.lightAt = function (x, y, z, nx, ny, nz, out) {
    let r = this.amb[0],
      g = this.amb[1],
      b = this.amb[2];
    for (let k = 0; k < this.lights.length; k++) {
      const L = this.lights[k];
      if (
        L.box &&
        (x < L.box[0] ||
          x > L.box[3] ||
          y < L.box[1] ||
          y > L.box[4] ||
          z < L.box[2] ||
          z > L.box[5])
      )
        continue;
      const dx = L.x - x,
        dy = L.y - y,
        dz = L.z - z,
        d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= L.r2) continue;
      const d = Math.sqrt(d2) || 1e-3,
        f = 1 - d / L.r,
        att = f * f;
      const ndl = (dx * nx + dy * ny + dz * nz) / d;
      const k2 = att * (L.wrap + (1 - L.wrap) * Math.max(0, ndl)) * L.i;
      r += L.c[0] * k2;
      g += L.c[1] * k2;
      b += L.c[2] * k2;
    }
    out[0] = r;
    out[1] = g;
    out[2] = b;
    return out;
  };
  BP.finish = function (parent) {
    const group = new THREE.Group();
    group.name = "ppk_" + this.name;
    const tmp = [0, 0, 0];
    for (const [key, b] of this.bk) {
      if (!b.vc) continue;
      if (this.lit && !MATDEF[key].neon && !MATDEF[key].lamp) {
        for (let i = 0; i < b.vc; i++) {
          this.lightAt(
            b.p[i * 3],
            b.p[i * 3 + 1],
            b.p[i * 3 + 2],
            b.n[i * 3],
            b.n[i * 3 + 1],
            b.n[i * 3 + 2],
            tmp,
          );
          b.c[i * 3] *= tmp[0];
          b.c[i * 3 + 1] *= tmp[1];
          b.c[i * 3 + 2] *= tmp[2];
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
      geo.setAttribute("normal", new THREE.Float32BufferAttribute(b.n, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(b.c, 3));
      geo.setIndex(
        b.vc > 65535
          ? new THREE.Uint32BufferAttribute(b.i, 1)
          : new THREE.Uint16BufferAttribute(b.i, 1),
      );
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
      const mesh = new THREE.Mesh(geo, K.mat(key, this.lit));
      mesh.name = "ppk_" + this.name + "_" + key;
      const d = MATDEF[key];
      if (
        this.shadows &&
        !d.neon &&
        !d.lamp &&
        !d.transparent &&
        key !== "glass"
      ) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      } else if (!this.lit && !d.neon && !d.lamp) mesh.receiveShadow = true;
      if (d.transparent || d.neon) mesh.renderOrder = 2;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      group.add(mesh);
    }
    this.bk.clear();
    // glow sprites: one Points per size class
    if (this.glows.length) {
      const classes = {};
      for (const gl of this.glows) {
        const k = gl.s < 0.8 ? 0.5 : gl.s < 2 ? 1.4 : gl.s < 4 ? 3 : 6;
        (classes[k] = classes[k] || []).push(gl);
      }
      for (const k in classes) {
        const list = classes[k];
        const pos = new Float32Array(list.length * 3),
          col = new Float32Array(list.length * 3);
        list.forEach((gl, i) => {
          pos[i * 3] = gl.x;
          pos[i * 3 + 1] = gl.y;
          pos[i * 3 + 2] = gl.z;
          col[i * 3] = gl.c[0];
          col[i * 3 + 1] = gl.c[1];
          col[i * 3 + 2] = gl.c[2];
        });
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("color", new THREE.BufferAttribute(col, 3));
        g.computeBoundingSphere();
        const m = new THREE.PointsMaterial({
          size: +k,
          map: K.glowTex(),
          vertexColors: true,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
          toneMapped: false,
          fog: !this.lit,
        });
        m.userData.shared = true;
        const pts = new THREE.Points(g, m);
        pts.name = "ppk_glow_" + this.name;
        pts.renderOrder = 3;
        pts.frustumCulled = true;
        pts.matrixAutoUpdate = false;
        group.add(pts);
      }
    }
    if (parent) parent.add(group);
    return group;
  };
  let glowTex = null;
  K.glowTex = function () {
    if (glowTex) return glowTex;
    const S = 64,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.55)");
    g.addColorStop(0.5, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
    return (glowTex = K.texFromCanvas(c, { clamp: true }));
  };

  // ------------------------------------------------------------------
  // Architectural helpers (all local coords, on a builder `b`)
  // ------------------------------------------------------------------
  const T = 0.2; // interior wall thickness
  K.WALL_T = T;
  /**
   * Interior room. R: {x0,z0,x1,z1, y, h, floor, wall, ceil, fc, wc, cc (tints), wain, wainC, wainH,
   *   open:{n,s,e,w}, noCeil, noFloor, surface, slab (floor collider thickness), trim}
   * Door gaps are read from ctx.gaps (added with K.gap on the same context).
   */
  K.room = function (b, ctx, R) {
    R = Object.assign(
      {
        y: 0,
        h: 3.4,
        floor: "concrete",
        wall: "plaster",
        ceil: "plaster",
        fc: [0.8, 0.78, 0.74],
        wc: [0.85, 0.82, 0.76],
        cc: [0.7, 0.68, 0.64],
        open: {},
        surface: "concrete",
        slab: 0.3,
      },
      R,
    );
    const { x0, z0, x1, z1, y, h } = R;
    if (!R.noFloor) {
      b.face(R.floor, x0, y, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: R.fc,
      });
      b.col(x0, y - R.slab, z0, x1, y, z1, {
        tag: "floor",
        surface: R.surface,
      });
    }
    if (!R.noCeil) {
      b.face(R.ceil, x0, y + h, z0, 1, 0, 0, 0, 0, 1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: R.cc,
        grime: 0.3,
      });
      if (R.ceilCol)
        b.col(x0, y + h, z0, x1, y + h + 0.3, z1, { tag: "ceiling" });
    }
    const sides = [
      { s: "n", alongX: true, line: z0, a: x0, e: x1, nx: 0, nz: 1 },
      { s: "s", alongX: true, line: z1, a: x0, e: x1, nx: 0, nz: -1 },
      { s: "w", alongX: false, line: x0, a: z0, e: z1, nx: 1, nz: 0 },
      { s: "e", alongX: false, line: x1, a: z0, e: z1, nx: -1, nz: 0 },
    ];
    for (const sd of sides) if (!R.open[sd.s]) K.wallRun(b, ctx, R, sd);
    return R;
  };
  /** Point on a side at along-coordinate t, offset into the room. */
  function PT(sd, t, off) {
    return sd.alongX ? [t, sd.line + sd.nz * off] : [sd.line + sd.nx * off, t];
  }
  function wallFace(b, mat, sd, t0, t1, y0, y1, off, tint, grime) {
    if (t1 - t0 < 0.005 || y1 - y0 < 0.005) return;
    // U axis along the wall such that U × V(up) = inner normal
    const A = PT(sd, t0, off),
      B = PT(sd, t1, off);
    // inner normal n; U must satisfy U×Y = n → U = (−nz, 0, nx)?  check: (ux,0,uz)×(0,1,0) = (−uz, 0, ux) = n → uz = −nx, ux = nz
    const ux = sd.nz,
      uz = -sd.nx;
    // choose origin so that the face spans t0..t1 in +U direction
    const dirT = sd.alongX ? ux : uz; // how U moves t
    const O = dirT > 0 ? A : B;
    b.face(mat, O[0], y0, O[1], ux, 0, uz, 0, 1, 0, t1 - t0, y1 - y0, {
      tint,
      grime,
      uo: dirT > 0 ? t0 : -t1,
    });
  }
  K.wallRun = function (b, ctx, R, sd) {
    const gaps = (ctx.gaps || [])
      .filter((g) => {
        const on = sd.alongX
          ? Math.abs(g.z - sd.line) < 0.12
          : Math.abs(g.x - sd.line) < 0.12;
        if (!on) return false;
        const t = sd.alongX ? g.x : g.z;
        if (t + g.w / 2 < sd.a + 0.01 || t - g.w / 2 > sd.e - 0.01)
          return false;
        return g.y >= R.y - 0.3 && g.y <= R.y + R.h - 0.5;
      })
      .map((g) => {
        const t = sd.alongX ? g.x : g.z;
        return {
          t0: Math.max(sd.a, t - g.w / 2),
          t1: Math.min(sd.e, t + g.w / 2),
          y0: g.y,
          y1: g.y + g.h,
          g,
        };
      })
      .sort((p, q) => p.t0 - q.t0);
    const Y0 = R.y,
      Y1 = R.y + R.h,
      off = T / 2;
    const segs = [];
    let t = sd.a;
    for (const g of gaps) {
      if (g.t0 > t) segs.push([t, g.t0, Y0, Y1]);
      if (g.y1 < Y1) segs.push([g.t0, g.t1, g.y1, Y1]);
      if (g.y0 > Y0 + 0.02) segs.push([g.t0, g.t1, Y0, g.y0]);
      t = Math.max(t, g.t1);
    }
    if (t < sd.e) segs.push([t, sd.e, Y0, Y1]);
    const wainH = R.wain ? R.wainH || 1.0 : 0;
    for (const [a, c, ya, yb] of segs) {
      if (wainH && ya < Y0 + wainH) {
        wallFace(
          b,
          R.wain,
          sd,
          a,
          c,
          ya,
          Math.min(yb, Y0 + wainH),
          off,
          R.wainC || R.wc,
        );
        if (yb > Y0 + wainH)
          wallFace(b, R.wall, sd, a, c, Y0 + wainH, yb, off, R.wc);
        const P0 = PT(sd, a, off + 0.025),
          P1 = PT(sd, c, off + 0.025);
        if (yb > Y0 + wainH)
          b.beam(
            "wood_dark",
            P0[0],
            Y0 + wainH,
            P0[1],
            P1[0],
            Y0 + wainH,
            P1[1],
            0.05,
            0.06,
          );
      } else wallFace(b, R.wall, sd, a, c, ya, yb, off, R.wc);
      if (ya <= Y0 + 0.01 && R.trim !== false) {
        const P0 = PT(sd, a, off + 0.02),
          P1 = PT(sd, c, off + 0.02);
        b.beam(
          R.trimMat || "wood_dark",
          P0[0],
          Y0 + 0.08,
          P0[1],
          P1[0],
          Y0 + 0.08,
          P1[1],
          0.04,
          0.16,
        );
      }
      if (R.cornice && yb >= Y1 - 0.01) {
        const P0 = PT(sd, a, off + 0.05),
          P1 = PT(sd, c, off + 0.05);
        b.beam(
          R.corniceMat || "plaster",
          P0[0],
          Y1 - 0.1,
          P0[1],
          P1[0],
          Y1 - 0.1,
          P1[1],
          0.12,
          0.2,
          { tint: R.cc },
        );
      }
      const L0 = PT(sd, a, 0),
        L1 = PT(sd, c, 0);
      if (R.noWallCol) continue;
      if (sd.alongX)
        b.col(L0[0], ya, L0[1] - T / 2, L1[0], yb, L1[1] + T / 2, {
          tag: "wall",
        });
      else
        b.col(L0[0] - T / 2, ya, L0[1], L1[0] + T / 2, yb, L1[1], {
          tag: "wall",
        });
    }
    // jambs & lintel soffit + casing
    for (const g of gaps) {
      const top = Math.min(g.y1, Y1);
      for (const [tt, dir] of [
        [g.t0, 1],
        [g.t1, -1],
      ]) {
        const A = PT(sd, tt, 0),
          B = PT(sd, tt, off);
        const n = sd.alongX ? [dir, 0, 0] : [0, 0, dir];
        // jamb face: quad from wall line to inner face
        const pA = [A[0], g.y0, A[1]],
          pB = [B[0], g.y0, B[1]],
          pC = [B[0], top, B[1]],
          pD = [A[0], top, A[1]];
        b.quadN(R.wall, pA, pB, pC, pD, n, { tint: R.wc });
      }
      if (g.y1 < Y1) {
        const A = PT(sd, g.t0, 0),
          B = PT(sd, g.t1, 0),
          C = PT(sd, g.t1, off),
          D = PT(sd, g.t0, off);
        b.quadN(
          R.wall,
          [A[0], g.y1, A[1]],
          [D[0], g.y1, D[1]],
          [C[0], g.y1, C[1]],
          [B[0], g.y1, B[1]],
          [0, -1, 0],
          { tint: R.wc },
        );
      }
      if (g.g.casing !== false && R.casing !== false) {
        const cm = R.casingMat || "wood_dark";
        const cL = PT(sd, g.t0 - 0.04, off + 0.03),
          cR = PT(sd, g.t1 + 0.04, off + 0.03);
        b.beam(cm, cL[0], g.y0, cL[1], cL[0], top, cL[1], 0.08, 0.05);
        b.beam(cm, cR[0], g.y0, cR[1], cR[0], top, cR[1], 0.08, 0.05);
        if (g.y1 < Y1 - 0.05) {
          const c0 = PT(sd, g.t0 - 0.08, off + 0.03),
            c1 = PT(sd, g.t1 + 0.08, off + 0.03);
          b.beam(
            cm,
            c0[0],
            top + 0.05,
            c0[1],
            c1[0],
            top + 0.05,
            c1[1],
            0.1,
            0.05,
          );
        }
      }
    }
  };
  /**
   * Free wall segment A→B (any angle) from y0 to y1, face on side s (+1: normal = (dz,−dx), −1: opposite).
   * o: {mat, tint, gaps:[{t (centre, metres from A), w, y0, y1}], col (default true), both (draw both faces), wain, wainC, wainH, trim}
   */
  K.segWall = function (b, ax, az, bx, bz, y0, y1, s, o) {
    o = o || {};
    const dx = bx - ax,
      dz = bz - az,
      len = Math.hypot(dx, dz);
    if (len < 0.01) return;
    const ux = dx / len,
      uz = dz / len;
    const nx = uz * s,
      nz = -ux * s;
    const off = o.off !== undefined ? o.off : T / 2;
    const mat = o.mat || "plaster";
    const segs = [];
    let t = 0;
    const gaps = (o.gaps || []).slice().sort((p, q) => p.t - q.t);
    for (const g of gaps) {
      const g0 = g.t - g.w / 2,
        g1 = g.t + g.w / 2;
      if (g0 > t) segs.push([t, g0, y0, y1]);
      if ((g.y1 || y0 + 2.3) < y1) segs.push([g0, g1, g.y1 || y0 + 2.3, y1]);
      if ((g.y0 || y0) > y0) segs.push([g0, g1, y0, g.y0]);
      t = g1;
    }
    if (t < len) segs.push([t, len, y0, y1]);
    const faceOf = (side) => {
      const fx = uz * side,
        fz = -ux * side,
        oo = off;
      for (const [a, c, ya, yb] of segs) {
        const P = (tt, yy) => [
          ax + ux * tt + fx * oo,
          yy,
          az + uz * tt + fz * oo,
        ];
        const wainH = o.wain ? o.wainH || 1.0 : 0;
        if (wainH && ya < y0 + wainH) {
          b.quadN(
            o.wain,
            P(a, ya),
            P(c, ya),
            P(c, Math.min(yb, y0 + wainH)),
            P(a, Math.min(yb, y0 + wainH)),
            [fx, 0, fz],
            { tint: o.wainC },
          );
          if (yb > y0 + wainH)
            b.quadGrid(
              mat,
              ...orient(
                P(a, y0 + wainH),
                P(c, y0 + wainH),
                P(c, yb),
                P(a, yb),
                fx,
                fz,
              ),
              { tint: o.tint, uv: "side" },
            );
          b.beam(
            "wood_dark",
            P(a, 0)[0] + fx * 0.02,
            y0 + wainH,
            P(a, 0)[2] + fz * 0.02,
            P(c, 0)[0] + fx * 0.02,
            y0 + wainH,
            P(c, 0)[2] + fz * 0.02,
            0.05,
            0.06,
          );
        } else
          b.quadGrid(
            mat,
            ...orient(P(a, ya), P(c, ya), P(c, yb), P(a, yb), fx, fz),
            { tint: o.tint, uv: "side" },
          );
        if (ya <= y0 + 0.01 && o.trim !== false)
          b.beam(
            o.trimMat || "wood_dark",
            P(a, 0)[0] + fx * 0.02,
            y0 + 0.08,
            P(a, 0)[2] + fz * 0.02,
            P(c, 0)[0] + fx * 0.02,
            y0 + 0.08,
            P(c, 0)[2] + fz * 0.02,
            0.04,
            0.16,
          );
      }
    };
    faceOf(s);
    if (o.both) faceOf(-s);
    if (o.col !== false)
      for (const [a, c, ya, yb] of segs) {
        const mx = ax + (ux * (a + c)) / 2,
          mz = az + (uz * (a + c)) / 2;
        b.ocol(mx, mz, c - a, T, ya, yb, Math.atan2(-uz, ux), { tag: "wall" });
      }
    void nx;
    void nz;
  };
  /** Return quad corners in an order whose normal matches (fx,0,fz). */
  function orient(p0, p1, p2, p3, fx, fz) {
    const ax = p1[0] - p0[0],
      az = p1[2] - p0[2],
      by = p3[1] - p0[1];
    const nx = -az * by,
      nz = ax * by; // (p1−p0)×(p3−p0) for vertical quads
    return nx * fx + nz * fz >= 0 ? [p0, p1, p2, p3] : [p1, p0, p3, p2];
  }
  K.orient = orient;
  /** Door gap on a wall line (x,z = centre on the line, w wide, from y up h). */
  K.gap = function (ctx, x, z, w, y, h, o) {
    ctx.gaps = ctx.gaps || [];
    const g = Object.assign(
      { x, z, w: w || 1.2, y: y || 0, h: h || 2.3 },
      o || {},
    );
    ctx.gaps.push(g);
    return g;
  };

  /**
   * Straight stair flight. Footprint x0..x1 / z0..z1, rising from y0 to y1 in direction dir ('+x','-x','+z','-z').
   * o: {mat, riserMat, tint, solid (collider down to y0; default true), rail:'l'|'r'|'both', railMat, thick, nosing}
   */
  K.stairs = function (b, x0, z0, x1, z1, y0, y1, dir, o) {
    o = o || {};
    const mat = o.mat || "concrete";
    const rise = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.abs(rise) / (o.maxRise || 0.24)));
    const along = dir === "+x" || dir === "-x";
    const len = along ? x1 - x0 : z1 - z0;
    const run = len / n;
    for (let i = 0; i < n; i++) {
      const top = y0 + (rise * (i + 1)) / n;
      const bot = o.solid === false ? top - (o.thick || 0.35) : y0;
      let sx0, sx1, sz0, sz1;
      if (dir === "+x") {
        sx0 = x0 + run * i;
        sx1 = sx0 + run;
        sz0 = z0;
        sz1 = z1;
      } else if (dir === "-x") {
        sx1 = x1 - run * i;
        sx0 = sx1 - run;
        sz0 = z0;
        sz1 = z1;
      } else if (dir === "+z") {
        sz0 = z0 + run * i;
        sz1 = sz0 + run;
        sx0 = x0;
        sx1 = x1;
      } else {
        sz1 = z1 - run * i;
        sz0 = sz1 - run;
        sx0 = x0;
        sx1 = x1;
      }
      b.boxMM(mat, sx0, bot, sz0, sx1, top, sz1, {
        tint: o.tint,
        grime: o.grime,
        faces: "nsewtb",
      });
      if (o.nosing)
        b.boxMM(
          o.nosing,
          sx0 - (dir === "-x" ? 0.03 : 0),
          top - 0.04,
          sz0 - (dir === "-z" ? 0.03 : 0),
          sx1 + (dir === "+x" ? 0.03 : 0),
          top + 0.01,
          sz1 + (dir === "+z" ? 0.03 : 0),
          { grime: 0.2 },
        );
      b.col(sx0, bot, sz0, sx1, top, sz1, {
        tag: "stairs",
        surface: o.surface || "concrete",
      });
    }
    // rails
    const railMat = o.railMat || "black_iron";
    const rh = 0.95;
    const railLine = (side) => {
      // side: 'l' / 'r' relative to climbing direction
      let ax, az, bx, bz;
      const e = 0.06;
      if (dir === "+x") {
        const zz = side === "l" ? z0 + e : z1 - e;
        ax = x0;
        bx = x1;
        az = bz = zz;
      } else if (dir === "-x") {
        const zz = side === "l" ? z1 - e : z0 + e;
        ax = x1;
        bx = x0;
        az = bz = zz;
      } else if (dir === "+z") {
        const xx = side === "l" ? x1 - e : x0 + e;
        az = z0;
        bz = z1;
        ax = bx = xx;
      } else {
        const xx = side === "l" ? x0 + e : x1 - e;
        az = z1;
        bz = z0;
        ax = bx = xx;
      }
      b.beam(
        o.handMat || "mahogany",
        ax,
        y0 + rh,
        az,
        bx,
        y1 + rh,
        bz,
        0.07,
        0.06,
      );
      const posts = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5));
      for (let k = 0; k <= posts; k++) {
        const t = k / posts,
          px = ax + (bx - ax) * t,
          pz = az + (bz - az) * t,
          py = y0 + rise * Math.min(1, (Math.floor(t * n) + 1) / n);
        b.beam(railMat, px, py, pz, px, y0 + rise * t + rh, pz, 0.025, 0.025);
      }
      if (o.lace) {
        // lace panel under the handrail (Chelsea)
        const pL = [ax, y0 + 0.1, az],
          pR = [bx, y1 + 0.1, bz],
          pRT = [bx, y1 + rh - 0.05, bz],
          pLT = [ax, y0 + rh - 0.05, az];
        b.quad("lace", pL, pR, pRT, pLT, {
          tint: [0.2, 0.19, 0.18],
          grime: 0,
          rect: [0, 0, Math.hypot(bx - ax, bz - az) / 1.8, 1],
        });
      }
      // thin collider along the rail
      const cx = (ax + bx) / 2,
        cz = (az + bz) / 2;
      if (o.railCol !== false)
        K.lineCol(
          b,
          ax,
          az,
          bx,
          bz,
          Math.min(y0, y1),
          Math.max(y0, y1) + rh,
          0.1,
          { tag: "rail", walkable: false },
        );
      void cx;
      void cz;
    };
    if (o.rail === "l" || o.rail === "both") railLine("l");
    if (o.rail === "r" || o.rail === "both") railLine("r");
  };
  /** Thin collider along a line A→B (axis-aligned box when the line is, else an oriented box — never an AABB round a diagonal). */
  K.lineCol = function (b, ax, az, bx, bz, y0, y1, thick, o) {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.02) return null;
    if (Math.abs(ax - bx) < 0.01 || Math.abs(az - bz) < 0.01)
      return b.col(
        Math.min(ax, bx) - thick / 2,
        y0,
        Math.min(az, bz) - thick / 2,
        Math.max(ax, bx) + thick / 2,
        y1,
        Math.max(az, bz) + thick / 2,
        o,
      );
    const ux = (bx - ax) / len,
      uz = (bz - az) / len;
    return b.ocol(
      (ax + bx) / 2,
      (az + bz) / 2,
      len + thick,
      thick,
      y0,
      y1,
      Math.atan2(-uz, ux),
      o,
    );
  };
  /** Level railing (posts + handrail [+ lace]) from A to B at floor y. */
  K.railing = function (b, ax, az, bx, bz, y, o) {
    o = o || {};
    const h = o.h || 1.0,
      mat = o.mat || "black_iron";
    b.beam(o.handMat || "mahogany", ax, y + h, az, bx, y + h, bz, 0.08, 0.06);
    const len = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.ceil(len / (o.step || 0.5)));
    if (o.lace)
      b.quad(
        "lace",
        [ax, y + 0.05, az],
        [bx, y + 0.05, bz],
        [bx, y + h - 0.04, bz],
        [ax, y + h - 0.04, az],
        {
          tint: o.laceTint || [0.2, 0.19, 0.18],
          grime: 0,
          rect: [0, 0, len / 1.8, 1],
        },
      );
    else
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        b.beam(
          mat,
          ax + (bx - ax) * t,
          y,
          az + (bz - az) * t,
          ax + (bx - ax) * t,
          y + h,
          az + (bz - az) * t,
          0.03,
          0.03,
        );
      }
    if (!o.lace) b.beam(mat, ax, y + 0.1, az, bx, y + 0.1, bz, 0.03, 0.03);
    if (o.col !== false)
      K.lineCol(b, ax, az, bx, bz, y, y + h + 0.05, 0.12, {
        tag: "rail",
        walkable: false,
      });
  };

  // ------------------------------------------------------------------
  // Furniture & dressing (local coords, interior builder)
  // ------------------------------------------------------------------
  K.table = function (b, x, y, z, w, d, o) {
    o = o || {};
    const h = o.h || 0.76,
      mat = o.mat || "wood_dark",
      yaw = o.yaw || 0;
    b.box(mat, x, y + h - 0.05, z, w, 0.05, d, {
      yaw,
      tint: o.tint,
      faces: "nsewtb",
    });
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    if (o.pedestal) {
      b.cyl(o.legMat || "black_iron", x, y, z, 0.05, 0.05, h - 0.05, 6);
      b.cyl(o.legMat || "black_iron", x, y, z, 0.28, 0.2, 0.05, 8);
    } else
      for (const [lx, lz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        const px = x + lx * (w / 2 - 0.06) * c + lz * (d / 2 - 0.06) * s,
          pz = z - lx * (w / 2 - 0.06) * s + lz * (d / 2 - 0.06) * c;
        b.box(o.legMat || mat, px, y, pz, 0.05, h - 0.05, 0.05, {
          yaw,
          tint: o.tint,
        });
      }
    if (o.col !== false)
      b.ocol(x, z, w, d, y, y + h, yaw, { tag: "furniture", surface: "wood" });
    return y + h;
  };
  K.roundTable = function (b, x, y, z, r, o) {
    o = o || {};
    const h = o.h || 0.76;
    b.cyl(o.mat || "wood_dark", x, y + h - 0.05, z, r, r, 0.05, 14, {
      tint: o.tint,
      bottom: true,
    });
    if (o.cloth)
      b.cyl("cloth_white", x, y + h - 0.35, z, r + 0.06, r + 0.02, 0.32, 14, {
        tint: o.cloth,
        top: false,
      });
    b.cyl("black_iron", x, y, z, 0.05, 0.05, h - 0.05, 6);
    b.cyl("black_iron", x, y, z, 0.3, 0.22, 0.05, 8);
    if (o.col !== false)
      b.col(x - r * 0.75, y, z - r * 0.75, x + r * 0.75, y + h, z + r * 0.75, {
        tag: "furniture",
        surface: "wood",
      });
    return y + h;
  };
  K.chair = function (b, x, y, z, yaw, o) {
    o = o || {};
    const mat = o.mat || "wood_dark";
    if (o.fallen) {
      b.box(mat, x, y, z, 0.42, 0.42, 0.06, { yaw, tint: o.tint });
      b.box(mat, x, y + 0.02, z + 0.25, 0.42, 0.05, 0.42, {
        yaw,
        tint: o.tint,
      });
      return;
    }
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    b.box(o.seatMat || mat, x, y + 0.43, z, 0.44, 0.05, 0.44, {
      yaw,
      tint: o.seatTint || o.tint,
    });
    for (const [lx, lz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const px = x + lx * 0.19 * c + lz * 0.19 * s,
        pz = z - lx * 0.19 * s + lz * 0.19 * c;
      b.box(mat, px, y, pz, 0.04, 0.43, 0.04, { yaw, tint: o.tint });
    }
    // back (on local +z side → facing -z when yaw 0 ... chair faces local -z)
    const bx = x + 0.2 * s,
      bz = z + 0.2 * c;
    b.box(mat, bx, y + 0.45, bz, 0.44, 0.5, 0.04, { yaw, tint: o.tint });
  };
  /** Banquette / sofa: length along local x, seat facing local -z. */
  K.sofa = function (b, x, y, z, len, yaw, o) {
    o = o || {};
    const mat = o.mat || "leather_red",
      d = o.d || 0.7;
    b.box(mat, x, y, z, len, 0.45, d, { yaw, tint: o.tint });
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    b.box(
      mat,
      x + (d / 2 - 0.1) * s,
      y + 0.45,
      z + (d / 2 - 0.1) * c,
      len,
      o.backH || 0.5,
      0.2,
      { yaw, tint: o.tint },
    );
    if (o.arms !== false)
      for (const e of [-1, 1])
        b.box(
          mat,
          x + e * (len / 2 - 0.08) * c,
          y + 0.45,
          z - e * (len / 2 - 0.08) * s,
          0.16,
          0.22,
          d,
          { yaw, tint: o.tint },
        );
    if (o.col !== false)
      b.ocol(x, z, len, d, y, y + 0.5, yaw, {
        tag: "furniture",
        surface: "carpet",
      });
  };
  /** Bed: head at local +z. */
  K.bed = function (b, x, y, z, yaw, o) {
    o = o || {};
    const w = o.w || 1.4,
      L = o.l || 2.0;
    b.box(o.frame || "black_iron", x, y, z, w, 0.35, L, { yaw });
    b.box(o.sheet || "cloth_white", x, y + 0.35, z, w - 0.06, 0.18, L - 0.06, {
      yaw,
      tint: o.tint || [0.7, 0.66, 0.58],
    });
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    b.box(
      o.frame || "black_iron",
      x + (L / 2) * s,
      y,
      z + (L / 2) * c,
      w,
      1.1,
      0.06,
      { yaw },
    );
    b.box(
      "cloth_white",
      x + (L / 2 - 0.3) * s,
      y + 0.53,
      z + (L / 2 - 0.3) * c,
      w * 0.7,
      0.12,
      0.35,
      { yaw, tint: [0.8, 0.78, 0.7] },
    );
    if (o.col !== false)
      b.ocol(x, z, w, L, y, y + 0.55, yaw, {
        tag: "furniture",
        surface: "fabric",
      });
  };
  /** Shelf unit against a wall, facing (nx,nz). Items: cans/jars/bottles. */
  K.shelf = function (b, x, y, z, yaw, w, o) {
    o = o || {};
    const h = o.h || 2.0,
      d = o.d || 0.4,
      mat = o.mat || "metal",
      r = K.rng(o.seed || (x * 13 + z * 7) | 0);
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    for (const e of [-1, 1])
      b.box(mat, x + e * (w / 2) * c, y, z - e * (w / 2) * s, 0.04, h, d, {
        yaw,
        tint: o.tint,
      });
    const levels = o.levels || 4;
    for (let k = 0; k < levels; k++) {
      const yy =
        y + 0.12 + ((k * (h - 0.2)) / (levels - 1 || 1)) * (levels > 1 ? 1 : 0);
      b.box(mat, x, yy, z, w, 0.03, d, { yaw, tint: o.tint, faces: "nsewtb" });
      if (o.empty) continue;
      const items = o.items || ["can", "jar", "bottle", "box"];
      let t = -w / 2 + 0.08;
      while (t < w / 2 - 0.1) {
        if (r() < 0.25) {
          t += 0.15;
          continue;
        }
        const kind = r.pick(items);
        const px = x + t * c + (r() - 0.5) * 0.1 * s,
          pz = z - t * s + (r() - 0.5) * 0.1 * c;
        if (kind === "can") {
          b.cyl(
            r() < 0.5 ? "rust" : "metal",
            px,
            yy + 0.03,
            pz,
            0.04,
            0.04,
            0.12,
            6,
            {
              tint: r.pick([
                [0.8, 0.3, 0.2],
                [0.8, 0.7, 0.4],
                [0.5, 0.6, 0.7],
                [0.7, 0.7, 0.7],
              ]),
            },
          );
          t += 0.1;
        } else if (kind === "jar") {
          b.cyl("glass", px, yy + 0.03, pz, 0.06, 0.06, 0.16, 8, {
            tint: r.pick([
              [0.6, 0.8, 0.4],
              [0.8, 0.6, 0.3],
              [0.5, 0.7, 0.5],
            ]),
          });
          t += 0.14;
        } else if (kind === "bottle") {
          b.cyl("glass", px, yy + 0.03, pz, 0.035, 0.035, 0.22, 6, {
            tint: r.pick([
              [0.3, 0.5, 0.3],
              [0.5, 0.3, 0.15],
              [0.7, 0.7, 0.6],
            ]),
          });
          b.cyl("glass", px, yy + 0.25, pz, 0.012, 0.012, 0.07, 5);
          t += 0.09;
        } else if (kind === "box") {
          const bw = 0.15 + r() * 0.15;
          b.box("fabric", px, yy + 0.03, pz, bw, 0.12 + r() * 0.15, 0.2, {
            yaw: yaw + (r() - 0.5) * 0.3,
            tint: r.pick([
              [0.7, 0.6, 0.4],
              [0.6, 0.5, 0.35],
              [0.8, 0.75, 0.6],
            ]),
          });
          t += bw + 0.03;
        } else if (kind === "book") {
          const bw = 0.04 + r() * 0.04;
          b.box("flat", px, yy + 0.03, pz, bw, 0.18 + r() * 0.1, 0.22, {
            yaw,
            tint: r.pick([
              [0.5, 0.15, 0.1],
              [0.15, 0.25, 0.4],
              [0.2, 0.35, 0.2],
              [0.55, 0.45, 0.3],
              [0.3, 0.2, 0.15],
            ]),
          });
          t += bw + 0.005;
        } else if (kind === "paint") {
          b.cyl("metal", px, yy + 0.03, pz, 0.08, 0.08, 0.14, 8, {
            tint: r.pick([
              [0.8, 0.2, 0.15],
              [0.2, 0.3, 0.7],
              [0.9, 0.8, 0.2],
              [0.9, 0.9, 0.85],
            ]),
          });
          t += 0.18;
        }
      }
    }
    if (o.col !== false)
      b.ocol(x, z, w, d, y, y + h, yaw, { tag: "furniture", surface: "metal" });
  };
  /** Rubble pile (local), with rebar. */
  K.rubble = function (b, x, y, z, r, h, o) {
    o = o || {};
    const rr = K.rng(o.seed || (x * 31 + z * 17) | 0);
    b.cyl(o.mat || "rubble", x, y, z, r, r * 0.25, h, 9, {
      tint: o.tint || [0.8, 0.78, 0.74],
    });
    for (let i = 0; i < (o.n || 7); i++) {
      const a = rr() * Math.PI * 2,
        d = rr() * r * 0.9,
        s = 0.2 + rr() * 0.5;
      b.box(
        rr() < 0.3 ? "brick_red" : "concrete",
        x + Math.cos(a) * d,
        y + rr() * h * 0.5,
        z + Math.sin(a) * d,
        s,
        s * 0.6,
        s * 0.8,
        { yaw: rr() * 3 },
      );
    }
    for (let i = 0; i < 3; i++) {
      const a = rr() * 6.28;
      b.pipe(
        "rust",
        x + Math.cos(a) * r * 0.3,
        y + h * 0.4,
        z + Math.sin(a) * r * 0.3,
        x + Math.cos(a) * r * 0.9,
        y + h + rr() * 0.8,
        z + Math.sin(a) * r * 0.9,
        0.015,
        4,
      );
    }
    if (o.col !== false)
      b.col(
        x - r * 0.6,
        y,
        z - r * 0.6,
        x + r * 0.6,
        y + h * 0.55,
        z + r * 0.6,
        { tag: "rubble", surface: "rubble" },
      );
  };
  /** Litter on a floor rect: papers, cans, debris. */
  K.litter = function (b, x0, z0, x1, z1, y, n, seed) {
    const r = K.rng(seed || (x0 * 7 + z0 * 3) | 0);
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0),
        z = z0 + r() * (z1 - z0),
        k = r();
      if (k < 0.45)
        b.hplate(
          "flat",
          x,
          y + 0.012 + i * 0.0005,
          z,
          0.2 + r() * 0.15,
          0.25 + r() * 0.15,
          r() * 6,
          null,
          { tint: [0.75 + r() * 0.15, 0.72, 0.6] },
        );
      else if (k < 0.65)
        b.pipe(
          "rust",
          x,
          y + 0.04,
          z,
          x + 0.1,
          y + 0.04,
          z + (r() - 0.5) * 0.1,
          0.035,
          6,
          {
            tint: r.pick([
              [0.8, 0.3, 0.2],
              [0.7, 0.7, 0.7],
            ]),
          },
        );
      else if (k < 0.85)
        b.box(
          "concrete",
          x,
          y,
          z,
          0.1 + r() * 0.3,
          0.05 + r() * 0.12,
          0.1 + r() * 0.25,
          { yaw: r() * 3 },
        );
      else
        b.box("wood_rotten", x, y, z, 0.8 + r() * 0.6, 0.05, 0.12, {
          yaw: r() * 3,
        });
    }
  };
  /** Hanging lamp fixture: cord + shade + bulb, and a baked light + glow. kind: 'bulb'|'pendant'|'lantern'|'tube'|'globe'|'cage' */
  K.lamp = function (b, x, y, z, kind, color, intensity, radius, o) {
    o = o || {};
    const col = K.tint(color || [1, 0.8, 0.55]);
    const ceil = o.ceil !== undefined ? o.ceil : y + 0.6;
    if (kind === "tube") {
      const L = o.len || 1.2,
        al = o.alongX !== false;
      b.box(
        "metal",
        x,
        y + 0.04,
        z,
        al ? L + 0.1 : 0.16,
        0.06,
        al ? 0.16 : L + 0.1,
        { grime: 0.3 },
      );
      if (!o.dead)
        b.box("lamp", x, y, z, al ? L : 0.06, 0.04, al ? 0.06 : L, {
          tint: col,
        });
      else
        b.box("glass", x, y, z, al ? L : 0.06, 0.04, al ? 0.06 : L, {
          tint: [0.4, 0.4, 0.4],
        });
      if (ceil > y + 0.1) {
        b.pipe(
          "black_iron",
          x - (al ? L / 3 : 0),
          y + 0.07,
          z - (al ? 0 : L / 3),
          x - (al ? L / 3 : 0),
          ceil,
          z - (al ? 0 : L / 3),
          0.006,
          3,
        );
        b.pipe(
          "black_iron",
          x + (al ? L / 3 : 0),
          y + 0.07,
          z + (al ? 0 : L / 3),
          x + (al ? L / 3 : 0),
          ceil,
          z + (al ? 0 : L / 3),
          0.006,
          3,
        );
      }
    } else if (kind === "lantern") {
      // Chinese paper lantern
      b.pipe("black_iron", x, y + 0.3, z, x, ceil, z, 0.008, 3);
      const g = K.lanternGeo();
      b.geo("lamp", g, {
        x,
        y,
        z,
        s: o.size || 0.35,
        tint: [col[0] * 0.9, col[1] * 0.35, col[2] * 0.25],
      });
      b.cyl("gold", x, y + (o.size || 0.35) * 0.72, z, 0.08, 0.08, 0.05, 8);
      b.cyl("gold", x, y - (o.size || 0.35) * 0.78, z, 0.08, 0.08, 0.05, 8);
      b.pipe(
        "cloth_red",
        x,
        y - (o.size || 0.35) * 0.8,
        z,
        x,
        y - (o.size || 0.35) * 1.4,
        z,
        0.02,
        4,
      );
    } else if (kind === "globe") {
      b.pipe("brass", x, y + 0.15, z, x, ceil, z, 0.012, 4);
      b.geo("lamp", K.sphereGeo(), { x, y, z, s: o.size || 0.18, tint: col });
    } else if (kind === "cage") {
      b.cyl("black_iron", x, y - 0.1, z, 0.1, 0.08, 0.22, 6, { top: false });
      b.geo("lamp", K.sphereGeo(), { x, y, z, s: 0.07, tint: col });
    } else if (kind === "pendant") {
      // green enamel shade
      b.pipe("black_iron", x, y + 0.18, z, x, ceil, z, 0.006, 3);
      b.cyl(o.shade || "paint_green", x, y, z, 0.28, 0.06, 0.18, 10, {
        top: true,
        grime: 0.2,
      });
      if (!o.dead)
        b.geo("lamp", K.sphereGeo(), { x, y: y - 0.02, z, s: 0.06, tint: col });
    } else {
      // bare bulb
      b.pipe("black_iron", x, y + 0.06, z, x, ceil, z, 0.005, 3);
      if (!o.dead)
        b.geo("lamp", K.sphereGeo(), { x, y, z, s: 0.05, tint: col });
    }
    if (!o.dead) {
      if (intensity > 0)
        b.light(x, y - 0.1, z, col, intensity, radius || 7, o.lightOpts);
      if (o.glow !== false)
        b.glow(
          x,
          y,
          z,
          [col[0] * 0.7, col[1] * 0.7, col[2] * 0.7],
          o.glowSize ||
            (kind === "tube" ? 1.4 : kind === "lantern" ? 1.6 : 0.9),
        );
    }
  };
  let _sph = null,
    _lant = null;
  K.sphereGeo = () => _sph || (_sph = new THREE.SphereGeometry(1, 10, 7));
  K.lanternGeo = function () {
    if (_lant) return _lant;
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10,
        a = (t - 0.5) * Math.PI;
      pts.push(
        new THREE.Vector2(
          Math.cos(a) * 1.0 * (0.7 + 0.3 * Math.cos(a)),
          Math.sin(a) * 0.8,
        ),
      );
    }
    return (_lant = new THREE.LatheGeometry(pts, 10));
  };

  // ------------------------------------------------------------------
  // Text painting helpers for the atlas
  // ------------------------------------------------------------------
  /** Painted sign cell. o: {bg, fg, font, border, size, sub, weather, align, vertical, italic} */
  K.signCell = function (key, text, w, h, o) {
    o = o || {};
    return K.paint("art", key, w, h, function (x, X, Y, W, H) {
      if (o.bg !== null) {
        x.fillStyle = o.bg || "#1e2a24";
        x.fillRect(X, Y, W, H);
      }
      if (o.border) {
        x.strokeStyle = o.border;
        x.lineWidth = Math.max(3, H * 0.05);
        x.strokeRect(X + H * 0.06, Y + H * 0.06, W - H * 0.12, H - H * 0.12);
      }
      x.fillStyle = o.fg || "#e8dcb8";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const lines = String(text).split("\n");
      const fs =
        o.size ||
        Math.min(
          (H * 0.62) / lines.length,
          (W * 0.9) / Math.max(1, lines[0].length * 0.55),
        );
      x.font =
        (o.italic ? "italic " : "") +
        (o.weight || "bold") +
        " " +
        Math.round(fs) +
        "px " +
        (o.font || "Georgia, serif");
      if (o.vertical) {
        const chars = String(text).replace(/\n/g, "").split("");
        const step = H / (chars.length + 0.6);
        x.font =
          (o.weight || "bold") +
          " " +
          Math.round(Math.min(step * 0.85, W * 0.8)) +
          "px " +
          (o.font || "Georgia, serif");
        chars.forEach((ch, i) =>
          x.fillText(ch, X + W / 2, Y + step * (i + 0.8)),
        );
      } else {
        lines.forEach((ln, i) =>
          x.fillText(
            ln,
            X + W / 2,
            Y + H / 2 + (i - (lines.length - 1) / 2) * fs * 1.1,
            W * 0.92,
          ),
        );
      }
      if (o.sub) {
        x.font = Math.round(H * 0.14) + "px " + (o.font || "Georgia, serif");
        x.fillText(o.sub, X + W / 2, Y + H * 0.86, W * 0.9);
      }
      if (o.weather !== false) {
        const r = K.rng(key);
        for (let k = 0; k < 40; k++) {
          x.fillStyle = rgba(25, 20, 15, (r() * 0.4).toFixed(2));
          x.fillRect(X + r() * W, Y + r() * H, 2 + r() * 14, 1 + r() * 5);
        }
        K.streaks(x, X, Y, W, H, 6, U.hashStr(key) % 97, 0.3);
      }
    });
  };
  /** Neon cell (additive; black background). o: {color, font, size, vertical, glow, tube} */
  K.neonCell = function (key, text, w, h, o) {
    o = o || {};
    return K.paint("neon", key, w, h, function (x, X, Y, W, H) {
      x.fillStyle = "#000";
      x.fillRect(X, Y, W, H);
      const col = o.color || "#ff3030";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const draw = (blur, lw, style) => {
        x.shadowColor = col;
        x.shadowBlur = blur;
        x.strokeStyle = style;
        x.fillStyle = style;
        x.lineWidth = lw;
        if (o.vertical) {
          const chars = String(text).split("");
          const step = H / (chars.length + 0.4);
          x.font =
            (o.weight || "bold") +
            " " +
            Math.round(Math.min(step * 0.82, W * 0.78)) +
            "px " +
            (o.font || "Arial, sans-serif");
          chars.forEach((ch, i) => {
            if (o.outline) x.strokeText(ch, X + W / 2, Y + step * (i + 0.7));
            else x.fillText(ch, X + W / 2, Y + step * (i + 0.7));
          });
        } else {
          const lines = String(text).split("\n");
          const fs =
            o.size ||
            Math.min(
              (H * 0.66) / lines.length,
              (W * 1.3) / Math.max(1, lines[0].length * 0.62),
            );
          x.font =
            (o.italic ? "italic " : "") +
            (o.weight || "bold") +
            " " +
            Math.round(fs) +
            "px " +
            (o.font || "Arial, sans-serif");
          lines.forEach((ln, i) => {
            const yy = Y + H / 2 + (i - (lines.length - 1) / 2) * fs * 1.08;
            if (o.outline) x.strokeText(ln, X + W / 2, yy, W * 0.94);
            else x.fillText(ln, X + W / 2, yy, W * 0.94);
          });
        }
      };
      draw(Math.max(6, H * 0.12), Math.max(3, H * 0.05), col);
      draw(Math.max(2, H * 0.03), Math.max(1.5, H * 0.02), o.core || "#fff4f0");
      x.shadowBlur = 0;
      if (o.border) {
        x.shadowColor = col;
        x.shadowBlur = 10;
        x.strokeStyle = col;
        x.lineWidth = 4;
        x.strokeRect(X + 8, Y + 8, W - 16, H - 16);
        x.shadowBlur = 0;
      }
      if (o.broken) {
        // dead letters: dark blotches
        const r = K.rng(key + "b");
        for (let k = 0; k < o.broken; k++) {
          x.fillStyle = "rgba(0,0,0,0.85)";
          x.fillRect(X + r() * W, Y, W * 0.08, H);
        }
      }
    });
  };

  // ------------------------------------------------------------------
  // Exterior helpers
  // ------------------------------------------------------------------
  /**
   * Window on a façade plane facing (nx,nz): centre (x,y,z) on the wall surface, w×h.
   * o: {state:'glass'|'broken'|'boarded'|'dark'|'lit', frame, sill, lintel, arch}
   */
  K.window = function (b, x, y, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz,
      rz = -nx; // U (to the viewer's right when facing the wall)
    const P = (u, v, d) => [x + rx * u + nx * d, y + v, z + rz * u + nz * d];
    const yaw = Math.atan2(-rz, rx);
    const st = o.state || "glass";
    const dep = o.inset !== undefined ? o.inset : 0.14; // frame depth (proud of the wall → reads as a recess)
    const d0 = 0.012;
    const back =
      st === "glass"
        ? "glass"
        : st === "lit"
          ? "lamp"
          : st === "boarded"
            ? "wood_rotten"
            : "paint_black";
    const tint =
      st === "glass"
        ? [0.5, 0.56, 0.55]
        : st === "lit"
          ? [0.95, 0.66, 0.36]
          : st === "boarded"
            ? [0.55, 0.47, 0.4]
            : [0.04, 0.04, 0.04];
    b.quad(
      back,
      P(-w / 2, -h / 2, d0),
      P(w / 2, -h / 2, d0),
      P(w / 2, h / 2, d0),
      P(-w / 2, h / 2, d0),
      { tint, grime: st === "glass" ? 0.4 : 0.15 },
    );
    if (st === "broken") {
      // jagged shards left in the frame
      const r = K.rng((x * 17 + y * 5 + z * 3) | 0);
      for (let k = 0; k < 3; k++) {
        const u = (r() - 0.5) * w * 0.8;
        b.quad(
          "glass",
          P(u - 0.15, -h / 2, d0 + 0.004),
          P(u + 0.2, -h / 2, d0 + 0.004),
          P(u + 0.05, -h / 2 + 0.3 + r() * 0.5, d0 + 0.004),
          P(u, -h / 2 + 0.3 + r() * 0.5, d0 + 0.004),
          { tint: [0.5, 0.56, 0.55] },
        );
      }
    }
    const fm = o.surround || o.reveal || "brick_red",
      ft = o.surroundTint || [0.62, 0.5, 0.44],
      fw = o.fw || 0.1;
    const box = (u, v, W, H, D, mat, tint2) => {
      const c = P(u, v, D / 2);
      b.box(mat, c[0], c[1], c[2], W, H, D, { yaw, tint: tint2 });
    };
    box(-w / 2 - fw / 2, -h / 2 - fw, fw, h + fw * 2, dep, fm, ft);
    box(w / 2 + fw / 2, -h / 2 - fw, fw, h + fw * 2, dep, fm, ft);
    if (st === "glass" || st === "lit" || st === "dark") {
      const fr = o.frame || "paint_white";
      box(0, -0.025, w, 0.05, 0.05, fr);
      box(0, -h / 2, 0.045, h, 0.05, fr);
    }
    if (st === "boarded") {
      const r = K.rng((x * 13 + y * 7 + z * 5) | 0);
      for (let i = 0; i < 3; i++) {
        const yy = -h / 2 + 0.25 + (i * (h - 0.5)) / 2 + (r() - 0.5) * 0.15;
        const a = P(-w / 2 - 0.08, yy + (r() - 0.5) * 0.25, dep + 0.02),
          c = P(w / 2 + 0.08, yy + (r() - 0.5) * 0.25, dep + 0.02);
        b.beam("wood_rotten", a[0], a[1], a[2], c[0], c[1], c[2], 0.22, 0.03, {
          tint: [0.7, 0.6, 0.5],
        });
      }
    }
    if (o.sill !== false)
      box(
        0,
        -h / 2 - fw - 0.07,
        w + 0.3,
        0.09,
        dep + 0.08,
        o.sillMat || "limestone",
        o.trimTint,
      );
    else box(0, -h / 2 - fw, w + fw * 2, fw, dep, fm, ft);
    if (o.lintel)
      box(
        0,
        h / 2,
        w + 0.3,
        o.lintel,
        dep + 0.04,
        o.lintelMat || "limestone",
        o.trimTint,
      );
    else box(0, h / 2, w + fw * 2, fw, dep, fm, ft);
  };

  // ------------------------------------------------------------------
  // Gameplay records
  // ------------------------------------------------------------------
  /**
   * Per-POI context: {id, key (interior key), O (origin), anchors, loot, notes, terminals, gaps}
   */
  K.ctx = function (id, interiorKey) {
    const L = G.LAYOUT;
    const it = interiorKey ? L.INTERIORS[interiorKey] : null;
    const O = it ? it.origin : { x: 0, y: 0, z: 0 };
    return {
      id,
      key: interiorKey,
      O: { x: O.x, y: O.y || 0, z: O.z },
      anchors: {},
      loot: [],
      notes: [],
      terminals: [],
      gaps: [],
      doors: [],
      interactables: [],
      anim: [],
    };
  };
  /** Anchor: interior anchors in LOCAL coords when local=true (default for interior contexts). */
  K.anchor = function (ctx, name, x, y, z, local) {
    const v =
      local === false
        ? new THREE.Vector3(x, y, z)
        : new THREE.Vector3(x + ctx.O.x, y + ctx.O.y, z + ctx.O.z);
    ctx.anchors[name] = v;
    return v;
  };
  /** Prop/container spawned on newGame/loaded (local coords unless world:true). */
  K.loot = function (ctx, type, x, y, z, yaw, o) {
    o = o || {};
    const w = o.world
      ? { x, y, z }
      : { x: x + ctx.O.x, y: y + ctx.O.y, z: z + ctx.O.z };
    ctx.loot.push(Object.assign({ type, yaw: yaw || 0 }, o, w));
  };
  K.skel = function (ctx, x, y, z, yaw, pose, o) {
    K.loot(
      ctx,
      "skeleton",
      x,
      y,
      z,
      yaw,
      Object.assign({ pose: pose || "lying", container: false }, o || {}),
    );
  };
  /** Note / tape reel pickup (static, persisted by rpg). def: {name, title, text, type} */
  K.note = function (ctx, id, x, y, z, def, o) {
    const w =
      o && o.world
        ? { x, y, z }
        : { x: x + ctx.O.x, y: y + ctx.O.y, z: z + ctx.O.z };
    ctx.notes.push(Object.assign({ id }, def, w));
  };
  /** Terminal: registered at initDone, prop spawned with the loot. */
  K.terminal = function (ctx, id, x, y, z, yaw, def, mount, o) {
    ctx.terminals.push({ id, def });
    K.loot(
      ctx,
      "terminal",
      x,
      y,
      z,
      yaw,
      Object.assign(
        { terminalId: id, mount: mount || "own_desk", container: false },
        o || {},
      ),
    );
  };
  /** World door (teleport). pos/target WORLD coords. */
  K.door = function (ctx, def) {
    try {
      const d = G.world.addDoor(
        Object.assign({ radius: 1.3, sound: "door_open" }, def),
      );
      ctx.doors.push(d);
      return d;
    } catch (e) {
      G.reportError("poi_park:door " + ctx.id, e);
      return null;
    }
  };
  K.world = (ctx, x, y, z) =>
    new THREE.Vector3(x + ctx.O.x, y + ctx.O.y, z + ctx.O.z);

  /** Safe wrappers around other modules (call time). */
  K.safe = function (where, fn) {
    try {
      return fn();
    } catch (e) {
      G.reportError("poi_park:" + where, e);
      return undefined;
    }
  };
  K.has = (id) =>
    !G.isStub("inventory") && G.inventory.count && G.inventory.count(id) > 0;
  K.give = (id, n, silent) => {
    if (!G.isStub("inventory") && G.inventory.add)
      K.safe("give " + id, () =>
        G.inventory.add(id, n || 1, { silent: !!silent }),
      );
  };
  K.take = (id, n) => {
    if (!G.isStub("inventory") && G.inventory.remove)
      K.safe("take " + id, () => G.inventory.remove(id, n || 1));
  };
  K.scrip = (n) => {
    if (!G.isStub("inventory"))
      K.safe("scrip", () =>
        G.inventory.addScrip
          ? G.inventory.addScrip(n)
          : G.inventory.add("scrip", n),
      );
  };
  K.scripCount = () =>
    !G.isStub("inventory") && G.inventory.scrip ? G.inventory.scrip() : 0;
  K.standing = (n, why) => {
    if (!G.isStub("rpg") && G.rpg.addStanding)
      K.safe("standing", () => G.rpg.addStanding(n, why));
  };
  K.xp = (n, why) => {
    if (!G.isStub("rpg") && G.rpg.addXP)
      K.safe("xp", () => G.rpg.addXP(n, why));
  };
  K.skill = (id) => {
    try {
      return !G.isStub("rpg") && G.rpg.skill ? G.rpg.skill(id) : 0;
    } catch (e) {
      return 0;
    }
  };
  K.notify = (t) => {
    try {
      G.notify(t);
    } catch (e) {
      /* */
    }
  };
  K.sfx = (name, pos, o) => {
    try {
      if (!G.isStub("sfx"))
        return G.sfx.play(name, Object.assign({ pos }, o || {}));
    } catch (e) {
      /* */
    }
    return null;
  };
  K.itemExists = (id) => {
    try {
      return !G.isStub("items") && !!(G.items.get && G.items.get(id));
    } catch (e) {
      return false;
    }
  };
  /** Define an item only if missing. */
  K.defineItem = (def) => {
    if (G.isStub("items") || !G.items.define) return;
    if (!K.itemExists(def.id))
      K.safe("item " + def.id, () => G.items.define(def));
  };
  /** Merchant stock: explicit entries that exist + rolled table. */
  K.stock = function (list, table, lvl) {
    const out = [];
    for (const [id, n] of list) if (K.itemExists(id)) out.push([id, n]);
    if (table && !G.isStub("items") && G.items.rollLoot) {
      try {
        const r = G.items.rollLoot(table, lvl || 3);
        if (Array.isArray(r)) for (const e of r) out.push([e[0], e[1]]);
      } catch (e) {
        /* */
      }
    }
    return out;
  };
  K.qflag = (n) => {
    try {
      return !G.isStub("quests") && G.quests.flag
        ? G.quests.flag(n)
        : undefined;
    } catch (e) {
      return undefined;
    }
  };
  K.setQFlag = (n, v) => {
    try {
      if (!G.isStub("quests") && G.quests.setFlag) G.quests.setFlag(n, v);
    } catch (e) {
      /* */
    }
  };
  K.q = {
    active: (id) => {
      try {
        return !G.isStub("quests") && G.quests.isActive(id);
      } catch (e) {
        return false;
      }
    },
    done: (id) => {
      try {
        return !G.isStub("quests") && G.quests.isComplete(id);
      } catch (e) {
        return false;
      }
    },
    stage: (id) => {
      try {
        return !G.isStub("quests") ? G.quests.stage(id) : null;
      } catch (e) {
        return null;
      }
    },
    start: (id, o) =>
      K.safe("qstart " + id, () => {
        if (
          !G.isStub("quests") &&
          !G.quests.isActive(id) &&
          !G.quests.isComplete(id)
        )
          G.quests.start(id, o);
      }),
    set: (id, st) =>
      K.safe("qstage " + id, () => {
        if (!G.isStub("quests") && G.quests.isActive(id))
          G.quests.setStage(id, st);
      }),
    complete: (id) =>
      K.safe("qdone " + id, () => {
        if (!G.isStub("quests") && G.quests.isActive(id)) G.quests.complete(id);
      }),
    fail: (id) =>
      K.safe("qfail " + id, () => {
        if (!G.isStub("quests") && G.quests.isActive(id)) G.quests.fail(id);
      }),
    started: (id) => {
      try {
        return (
          !G.isStub("quests") &&
          (G.quests.isActive(id) ||
            G.quests.isComplete(id) ||
            (G.quests.stage && G.quests.stage(id) != null))
        );
      } catch (e) {
        return false;
      }
    },
  };
})();
