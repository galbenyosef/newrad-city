// play-inline-67 04 — three
// Lines 628-701 of readable/play-inline-67.pretty.js (statement-aligned).
  function init() {
    A.onPrewarm(() => {
      const g = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      g.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(
          new Array(g.attributes.position.count * 3).fill(0.2),
          3,
        ),
      );
      g.userData.prewarmTemp = true;
      const mk = (m) => {
        const me = new THREE.Mesh(g, m);
        me.castShadow = true;
        me.receiveShadow = true;
        return me;
      };
      return [
        mk(
          new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 1,
            metalness: 0,
            emissive: new THREE.Color(0xff4a10),
            emissiveIntensity: 0.0,
          }),
        ),
        mk(new THREE.MeshStandardMaterial({ color: 0x8a8274, roughness: 0.9 })),
        mk(
          new THREE.MeshStandardMaterial({
            color: 0x2c6a12,
            roughness: 0.12,
            metalness: 0.2,
            emissive: new THREE.Color(0x3aff1a),
            emissiveIntensity: 0.3,
          }),
        ),
      ];
    });
    if (G.save && G.save.register) {
      G.save.register("atmos_piles", {
        save: () =>
          piles.map((p) => ({
            k: p.kind,
            x: +p.pos.x.toFixed(2),
            y: +p.pos.y.toFixed(2),
            z: +p.pos.z.toFixed(2),
            w: +p.w.toFixed(2),
          })),
        load: (d) => {
          if (!Array.isArray(d)) return;
          for (const e of d.slice(-MAX_PILES)) {
            if (
              !e ||
              (e.k !== "ash" && e.k !== "goo") ||
              !isFinite(e.x) ||
              !isFinite(e.z)
            )
              continue;
            const p = makePile(
              e.k,
              new THREE.Vector3(e.x, e.y || 0, e.z),
              e.w || 0.8,
            );
            p.t = 40; // long cooled
            if (p.glow)
              p.glow.glowIntensity = e.k === "ash" ? 0 : p.glow.glowIntensity;
          }
        },
      });
    }
  }

  A.addSystem({ name: "disintegrate", order: 66, init, update, reset });
