// play-inline-110 04 — paint
// Lines 977-989 of readable/play-inline-110.pretty.js (statement-aligned).
  K.defineSite("empire_state", 10, function () {
    textures();
    const rec = K.record("empire_state");
    // elevator frame material (bronze paint) uses the paint atlas
    K.defineMat("elevator_frame", {
      map: K.atlases.paint.tex,
      color: 0xffffff,
      rough: 0.5,
      metal: 0.3,
    });
    exterior(rec);
    K.interior("empire_state", { rec, DECK_Y }); // lobby cell + doors — 10_empire_state_interior.js
  });
