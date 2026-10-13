// play-inline-583 03 — kind
// Lines 702-925 of readable/play-inline-583.pretty.js (statement-aligned).
  QX.hook("spawn", function () {
    if (
      !QX.started(LH) &&
      !QX.has("qx_lh_scorecard") &&
      SP.table.y !== undefined
    )
      QX.pickup("lh_card", "qx_lh_scorecard", 1, {
        x: SP.table.x + 0.18,
        y: SP.table.y + 0.78,
        z: SP.table.z - 0.12,
      });
    if (!QX.started(CH) && !QX.has("qx_chalk_note") && SP.lunch.y !== undefined)
      QX.pickup("chalk_note", "qx_chalk_note", 1, {
        x: SP.lunch.x,
        y: SP.lunch.y + 0.23,
        z: SP.lunch.z,
      });
  });
  G.events.on("itemAdded", (id) => {
    if (id === "qx_lh_scorecard" && !QX.started(LH)) {
      U.lhStart();
      QX.notify(
        '"Winner of the LAST HAND takes the pot... Key goes in the MIDDLE OF THE TABLE." The middle of the table is empty.',
        { quiet: true },
      );
    }
    if (id === "qx_chalk_note" && !QX.started(CH)) {
      U.chalkStart();
    }
  });
  G.events.on("containerOpened", (c) => {
    if (c && c.id === "qx_lh_skullbox") U.boxOpened();
  });

  // Walking over an arrow counts it (once the hunt is known; before, it's just graffiti).
  SP.arrows.forEach((a, i) => {
    QX.trigger({
      id: "chalk_arrow_" + i,
      pos: () => a,
      r: 2.6,
      once: false,
      cooldown: 2,
      cond: () => QX.started(CH) && !QX.done(CH) && !QX.flag("chalk_" + i),
      fire: () => U.arrow(i),
    });
  });
  // Seeing the arrows first: the lunchbox is right there.
  QX.trigger({
    id: "chalk_hint",
    pos: () => SP.arrows[0],
    r: 3,
    cond: () => !QX.started(CH),
    fire: () =>
      QX.notify(
        'A chalk arrow on the sidewalk, in a child\'s hand: "1 — THIS WAY DAD". Somebody has gone over it again and again in fresher chalk, for years by the look of it. It starts at a red lunchbox by the kerb.',
        { quiet: true },
      ),
  });
  QX.trigger({
    id: "lh_hint",
    pos: () => SP.table,
    r: 9,
    cond: () => !QX.started(LH),
    fire: () =>
      QX.notify(
        "Four people died playing cards in the middle of 9th Avenue. None of them got up to run.",
        { quiet: true },
      ),
  });

  // ------------------------------------------------------------------
  // Canvas art: chalk arrows and the stencilled skull
  // ------------------------------------------------------------------
  const texCache = {};
  function chalkTexture(kind) {
    if (texCache[kind]) return texCache[kind];
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const x = c.getContext("2d");
    const col =
      kind === "x"
        ? "240,120,140"
        : kind === "start"
          ? "150,200,255"
          : "245,242,225";
    // a chalk stroke = many jittered, semi-transparent short lines
    let seed = 7 + kind.charCodeAt(0);
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed & 0xffff) / 0xffff;
    };
    const stroke = (pts, w) => {
      for (let pass = 0; pass < 5; pass++) {
        x.strokeStyle = "rgba(" + col + "," + (0.18 + rnd() * 0.22) + ")";
        x.lineWidth = w * (0.5 + rnd() * 0.7);
        x.lineCap = "round";
        x.beginPath();
        pts.forEach((p, i) => {
          const jx = p[0] + (rnd() - 0.5) * 5,
            jy = p[1] + (rnd() - 0.5) * 5;
          if (i) x.lineTo(jx, jy);
          else x.moveTo(jx, jy);
        });
        x.stroke();
      }
    };
    if (kind === "x") {
      stroke(
        [
          [60, 60],
          [196, 196],
        ],
        16,
      );
      stroke(
        [
          [196, 60],
          [60, 196],
        ],
        16,
      );
      stroke(
        [
          [128, 20],
          [150, 40],
          [128, 60],
          [106, 40],
          [128, 20],
        ],
        6,
      ); // a little heart-ish flourish
    } else {
      // arrow pointing up the canvas (+Y of the plane → forward)
      stroke(
        [
          [128, 236],
          [128, 50],
        ],
        14,
      );
      stroke(
        [
          [76, 104],
          [128, 40],
          [180, 104],
        ],
        14,
      );
      x.fillStyle = "rgba(" + col + ",0.85)";
      x.font = 'bold 54px "Comic Sans MS", "Chalkboard", cursive';
      x.textAlign = "center";
      x.fillText(kind === "start" ? "DAD" : kind, 196, 200);
      if (kind === "4") {
        x.font = 'bold 30px "Comic Sans MS", cursive';
        x.fillText("HOT!!", 62, 214);
      }
      if (kind === "2" || kind === "3") {
        x.font = 'bold 26px "Comic Sans MS", cursive';
        x.fillText("WARMER", 64, 226);
      }
    }
    const t = new THREE.CanvasTexture(c);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    texCache[kind] = t;
    return t;
  }
  const decalMats = {};
  function decal(xw, y, zw, yaw, kind) {
    const m =
      decalMats[kind] ||
      (decalMats[kind] = new THREE.MeshStandardMaterial({
        map: chalkTexture(kind),
        transparent: true,
        depthWrite: false,
        roughness: 1,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
      }));
    const g = new THREE.Group();
    g.position.set(xw, y + 0.02, zw);
    g.rotation.y = yaw;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.renderOrder = 2;
    g.add(mesh);
    G.scene.add(g);
    if (G.world.addLOD) G.world.addLOD(g, 60);
    return g;
  }
  function skullTexture() {
    if (texCache.skull) return texCache.skull;
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const x = c.getContext("2d");
    x.fillStyle = "rgba(236,232,220,0.92)";
    x.beginPath();
    x.arc(64, 54, 38, 0, Math.PI * 2);
    x.fill();
    x.fillRect(40, 70, 48, 30);
    x.globalCompositeOperation = "destination-out";
    x.beginPath();
    x.arc(48, 56, 11, 0, Math.PI * 2);
    x.arc(80, 56, 11, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.moveTo(64, 66);
    x.lineTo(57, 80);
    x.lineTo(71, 80);
    x.closePath();
    x.fill();
    for (let i = 0; i < 4; i++) x.fillRect(46 + i * 10, 88, 4, 12);
    x.globalCompositeOperation = "source-over";
    // drips
    x.fillStyle = "rgba(236,232,220,0.8)";
    for (const dx of [44, 70, 86]) x.fillRect(dx, 98, 3, 10 + (dx % 7) * 2);
    const t = new THREE.CanvasTexture(c);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    texCache.skull = t;
    return t;
  }
