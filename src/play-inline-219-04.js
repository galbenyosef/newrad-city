// play-inline-219 04 — ext
// Lines 455-472 of readable/play-inline-219.pretty.js (statement-aligned).
  PH.addBuilder(
    "navy_dress",
    function () {
      const ext = PH.navyExt; // built by 30_navy_ext (order 30); 32_navy_int registers it with these anchors
      const root =
        ext && ext.root
          ? ext.root
          : (() => {
              const g = new THREE.Group();
              g.name = "poi_navy_dress";
              G.scene.add(g);
              return g;
            })();
      const anchors = build(root);
      if (ext && ext.anchors) Object.assign(ext.anchors, anchors);
    },
    31,
  );
