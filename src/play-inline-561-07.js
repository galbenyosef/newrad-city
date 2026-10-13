// play-inline-561 07 — netmats
// Lines 2229-2361 of readable/play-inline-561.pretty.js (statement-aligned).
  let netMats = null;
  function netMaterials() {
    if (netMats) return netMats;
    const T = window.THREE;
    netMats = {
      body: new T.MeshStandardMaterial({
        color: 0x5d6b62,
        roughness: 0.8,
        metalness: 0.55,
      }),
      rust: new T.MeshStandardMaterial({
        color: 0x7a4a2a,
        roughness: 0.95,
        metalness: 0.3,
      }),
      lamp: new T.MeshStandardMaterial({
        color: 0x331a10,
        emissive: 0xff5a1a,
        emissiveIntensity: 0.4,
        roughness: 0.4,
      }),
    };
    for (const k in netMats) netMats[k].userData.shared = true;
    return netMats;
  }
  function netLamp(on) {
    const m = netMaterials().lamp;
    m.color.setHex(on ? 0x103318 : 0x331a10);
    m.emissive.setHex(on ? 0x39ff6a : 0xff5a1a);
    m.emissiveIntensity = on ? 1.4 : 0.4;
  }
  function repairNet() {
    if (L.flag("shell_net")) {
      L.notify(
        "The shark-net generator hums contentedly. Out on the water, something with too many legs changes its mind.",
      );
      return;
    }
    if (!Q.isActive("sq_shellshock") || Q.stage("sq_shellshock") !== "hunt") {
      L.notify(
        'An old-world harbour shark-net generator, "PROPERTY OF THE PORT AUTHORITY". Dead as a doornail.',
      );
      return;
    }
    const mech = L.skill("mechanics"),
      elec = L.skill("electronics");
    if (mech < 50 && elec < 65) {
      L.notify(
        "[Mechanics 50 / Electronics 65] The windings are corroded solid. You can't make sense of it — yet.",
      );
      L.sfx("ui_error");
      return;
    }
    L.setFlag("shell_net");
    L.setFlag("ossie_net_known");
    netLamp(true);
    L.sfx("hum_electric", { volume: 0.8 });
    if (G.player.shake) G.player.shake(0.15, 0.6);
    L.xp(
      75,
      mech >= 50
        ? "Mechanics: Harbour defence"
        : "Electronics: Harbour defence",
    );
    L.notify(
      "You scrape the contacts, bridge the dead relay and throw the lever. Out in the harbour the old net lights up in a line of blue sparks, and the water starts to boil with retreating shellbacks.",
    );
    Q.setStage("sq_shellshock", "report");
    L.news(
      "Harbour news: the old Port Authority shark nets off Battery Park are LIVE again for the first time since the Bombing. Ossie says the crabs are furious. Ossie says that's the best part.",
    );
  }
  L.hook("spawn", function () {
    const pier = batteryPier();
    if (!pier) return;
    const p = L.freeSpot(pier.x + 6, pier.z - 3, pier.y, {
      maxR: 8,
      radius: 0.8,
    });
    if (!p) return;
    const T = window.THREE,
      M = netMaterials();
    const g = new T.Group();
    const body = new T.Mesh(new T.BoxGeometry(1.3, 1.1, 0.8), M.body);
    body.position.y = 0.55;
    g.add(body);
    const coil = new T.Mesh(
      new T.CylinderGeometry(0.26, 0.26, 0.9, 10),
      M.rust,
    );
    coil.rotation.z = Math.PI / 2;
    coil.position.set(0, 1.28, 0);
    g.add(coil);
    const lever = new T.Mesh(new T.BoxGeometry(0.06, 0.45, 0.06), M.rust);
    lever.position.set(0.52, 1.25, 0.3);
    lever.rotation.z = -0.4;
    g.add(lever);
    const lamp = new T.Mesh(new T.SphereGeometry(0.07, 8, 6), M.lamp);
    lamp.position.set(-0.45, 1.16, 0.41);
    g.add(lamp);
    g.position.set(p.x, p.y, p.z);
    g.rotation.y = Math.atan2(-(pier.x - p.x), -(pier.z - p.z));
    G.scene.add(g);
    netLamp(!!L.flag("shell_net"));
    const collider = G.world.addCollider(
      p.x,
      p.z,
      1.3,
      0.8,
      p.y,
      p.y + 1.5,
      g.rotation.y,
      { tag: "prop" },
    );
    const interactable = G.world.addInteractable({
      pos: L.V3(p.x, p.y + 1.1, p.z),
      radius: 1.0,
      label: "Shark-Net Generator",
      verb: "Repair",
      onInteract: repairNet,
    });
    L.dyn({
      object3d: g,
      collider,
      interactable,
      dispose() {
        g.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
        });
      },
    });
    L.world.sharkNet = { x: p.x, z: p.z };
  });
