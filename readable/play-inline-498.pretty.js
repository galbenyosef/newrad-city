/* src/weapons/40_tune.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: viewmodel pose tuning table
 * One place to tune how each model sits on screen. Values override the
 * model's own cfg (shallow per key) when the view model is built.
 *   hip: {p:[x,y,z] camera space of the grip, r:[pitch,yaw,roll]}
 *   adsDist: eye -> sight socket distance when aiming
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const P = G.weapons._;
  // Long guns: classic hip framing: drawn ~13 % smaller, low in the bottom-right, nearly parallel
  // to the view (small yaw toward the centre, slight downward cant) so the barrel runs toward the
  // crosshair without the gun filling the corner. viewScale scales the model (not the arms).
  const RIFLE_HIP = { p: [0.165, -0.205, -0.36], r: [0.02, 0.025, -0.04] };
  const SCOPED_HIP = { p: [0.165, -0.222, -0.36], r: [0.02, 0.025, -0.04] };
  const LONG = 0.87;
  // Handguns: fired ONE-HANDED: the right arm extended low-right, the gun toed in toward the
  // crosshair so its left flank and sighting rib face the eye; the left arm rests below
  // the frame and only swings up to swap the magazine / rack the slide (see 50_view oneHanded).
  // (round 2b: less toe-in and a ~7° clockwise cant, so the slide's left flank and top read — not the flat
  //  back face of the slide, which is what made the handguns look like boxes)
  const PISTOL_HIP = { p: [0.122, -0.148, -0.35], r: [0.03, 0.05, -0.12] };
  const H1 = (hip) => ({ hip, oneHanded: true, hintL: [-0.24, -0.82, -0.34] });
  P.TUNE = {
    pistol_10mm: H1(PISTOL_HIP),
    revolver_32: H1(PISTOL_HIP),
    magnum_44: H1({ p: [0.122, -0.152, -0.35], r: [0.03, 0.05, -0.12] }),
    gyrojet_pistol: H1({ p: [0.122, -0.15, -0.35], r: [0.03, 0.05, -0.12] }),
    smg_10mm: {
      hip: { p: [0.13, -0.155, -0.34], r: [0.0, 0.04, 0.0] },
      viewScale: 0.95,
    },
    assault_rifle: { hip: RIFLE_HIP, viewScale: LONG },
    mat49_smg: {
      hip: { p: [0.14, -0.165, -0.36], r: [0.02, 0.16, -0.04] },
      viewScale: 0.95,
    },
    hunting_rifle: { hip: SCOPED_HIP, viewScale: LONG },
    sniper_rifle: { hip: SCOPED_HIP, viewScale: LONG },
    bolt_rifle_32: { hip: RIFLE_HIP, viewScale: LONG },
    bb_gun: { hip: RIFLE_HIP, viewScale: LONG },
    combat_shotgun: { hip: RIFLE_HIP, viewScale: LONG },
    sawed_off: {
      hip: { p: [0.14, -0.175, -0.36], r: [0.02, 0.035, -0.03] },
      viewScale: 0.92,
    },
    gyrojet_carbine: { hip: RIFLE_HIP, viewScale: LONG },
    flamer: {
      hip: { p: [0.16, -0.225, -0.38], r: [0.03, 0.04, -0.04] },
      viewScale: 0.9,
    },
    // heavy weapons ride at the hip: seen from above-right, rear housing below the frame
    minigun: {
      hip: { p: [0.22, -0.28, -0.52], r: [0.14, 0.28, -0.08] },
      viewScale: 0.8,
    },
    belt_fed_mg: {
      hip: { p: [0.19, -0.25, -0.46], r: [0.08, 0.14, -0.06] },
      viewScale: 0.82,
    },
    recoilless_rifle: {
      hip: { p: [0.21, -0.22, -0.42], r: [0.02, 0.05, -0.02] },
      viewScale: 0.86,
    },
    missile_launcher: {
      hip: { p: [0.21, -0.21, -0.4], r: [0.02, 0.04, -0.02] },
      viewScale: 0.9,
    },
    // melee: handle axis is +Y. r = [lean back toward the eye (+), yaw, lean right (-)]
    hunting_knife: { hip: { p: [0.14, -0.15, -0.32], r: [-0.85, 0.2, -0.3] } },
    combat_knife: { hip: { p: [0.14, -0.15, -0.32], r: [-0.85, 0.2, -0.3] } },
    switchblade: { hip: { p: [0.14, -0.15, -0.32], r: [-0.85, 0.2, -0.3] } },
    lead_pipe: { hip: { p: [0.15, -0.19, -0.38], r: [-0.35, 0.2, -0.45] } },
    spud_wrench: { hip: { p: [0.15, -0.19, -0.37], r: [-0.4, 0.2, -0.45] } },
    glowkeeper_censer: {
      hip: { p: [0.15, -0.2, -0.37], r: [-0.35, 0.2, -0.4] },
    },
    // two-handed melee: shouldered diagonally across the lower right — head up in the top-right third,
    // handle running down to both hands at the bottom edge
    // (round 2b: raised ~11 cm so BOTH hands are on screen — right hand above, left hand at the knob — with
    //  the left sleeve entering from the bottom-left, like a batter waiting on deck)
    baseball_bat: { hip: { p: [0.07, -0.1, -0.4], r: [-0.45, 0.3, -0.8] } },
    pool_cue: { hip: { p: [0.09, -0.02, -0.4], r: [-0.6, 0.3, -0.7] } },
    fire_axe: {
      hip: { p: [0.06, -0.1, -0.42], r: [-0.5, 0.3, -0.85] },
      spinY: 0.6,
    },
    // workbench weapons (39_models_schematic.js)
    third_rail_shoe: {
      hip: { p: [0.12, -0.13, -0.44], r: [-1.1, 0.25, -0.55] },
    },
    siren_horn: {
      hip: { p: [0.175, -0.255, -0.47], r: [0.04, 0.07, -0.05] },
      viewScale: 0.8,
    },
    rivet_gun: Object.assign(
      H1({ p: [0.13, -0.165, -0.38], r: [0.03, 0.14, -0.1] }),
      { viewScale: 0.92 },
    ),
    frag_grenade: { hip: { p: [0.14, -0.14, -0.32], r: [0.2, 0.3, 0.2] } },
    riot_gas_grenade: { hip: { p: [0.14, -0.14, -0.32], r: [0.2, 0.3, 0.2] } },
    molotov: { hip: { p: [0.14, -0.15, -0.32], r: [0.2, 0.3, 0.2] } },
    frag_mine: { hip: { p: [0.14, -0.14, -0.32], r: [0.5, 0.3, 0.2] } },
  };
})();
