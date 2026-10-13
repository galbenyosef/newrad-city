// play-inline-214 04 — ext
// Lines 929-946 of readable/play-inline-214.pretty.js (statement-aligned).
  PH.addBuilder(
    "ellis_grounds",
    function () {
      const ext = PH.ellisExt;
      const root =
        ext && ext.root
          ? ext.root
          : (() => {
              const g = new THREE.Group();
              g.name = "poi_ellis_grounds";
              G.scene.add(g);
              return g;
            })();
      const anchors = build(root);
      if (ext && ext.anchors) Object.assign(ext.anchors, anchors);
    },
    11,
  );
