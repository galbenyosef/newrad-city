// play-inline-531 02 — dim
// Lines 21-378 of readable/play-inline-531.pretty.js (statement-aligned).
  const ART = {
    blade: {
      d: `<rect x="26" y="84" width="62" height="18" rx="7" ${F}/><path d="M34 84v18M44 84v18M54 84v18M64 84v18M74 84v18" ${T}/>
        <path d="M88 78h12v30H88z"/><path d="M100 86 L262 72 L296 88 L262 102 L100 98 Z"/><path d="M108 92 L270 84" ${H}/>
        <circle cx="120" cy="92" r="3"/><circle cx="170" cy="88" r="3"/><circle cx="220" cy="84" r="3"/>
        <path d="M40 102 q-6 18 10 22 h34 v-22" ${T}/><rect x="56" y="112" width="26" height="12" rx="3"/>
        <path d="M298 86 q14-10 4-26 q-1 12-10 14 q6-12-2-20" ${T}/>`,
      a: [
        [70, 118],
        [58, 92],
        [96, 84],
        [180, 88],
        [120, 92],
      ],
      dim: [26, 296, 140, "0.96 m"],
    },
    launcher: {
      d: `<path d="M40 96 h150 l30-12 h70 v40 h-70 l-30-12 H40z"/><circle cx="110" cy="80" r="26"/><circle cx="110" cy="80" r="16" ${T}/>
        <path d="M110 64v32M94 80h32" ${T}/><path d="M60 108 l-12 32 h22 l10-28" /><path d="M150 108 v24 h14 v-20" ${T}/>
        <path d="M220 84 v40" ${H}/><rect x="250" y="80" width="40" height="48" rx="4" ${F}/><path d="M290 88 l18-8 v48 l-18-8" />
        <path d="M84 54 q26-22 52 0" ${T}/>`,
      a: [
        [110, 80],
        [270, 104],
        [60, 120],
        [157, 120],
        [300, 104],
      ],
      dim: [40, 308, 150, "1.22 m"],
    },
    dartgun: {
      d: `<path d="M60 70 h170 v22 H60z"/><path d="M230 76 h60 v10 h-60" ${T}/><path d="M92 92 l-14 44 h26 l12-44"/>
        <path d="M126 92 q6 18 22 18" ${T}/><rect x="150" y="54" width="44" height="16" rx="5" ${F}/><circle cx="162" cy="62" r="4"/><circle cx="182" cy="62" r="4"/>
        <path d="M60 80 h-24 v28 h18" ${T}/><path d="M236 81 h70" ${H}/><path d="M296 76 l14 5 l-14 5z"/>`,
      a: [
        [172, 62],
        [44, 94],
        [140, 81],
        [100, 110],
      ],
      dim: [36, 310, 150, "0.54 m"],
    },
    grenade: {
      d: `<path d="M150 46 h20 v14 h-20z"/><path d="M146 60 h28 q4 20 16 32 q10 12 10 34 q0 24-40 24 q-40 0-40-24 q0-22 10-34 q12-12 16-32z"/>
        <path d="M132 100 h56 M128 120 h64" ${H}/><circle cx="160" cy="112" r="10" ${T}/><path d="M154 112 h12 M160 106 v12" ${T}/>
        <path d="M170 50 q30-10 40 10" ${T}/><circle cx="214" cy="64" r="6" ${T}/>`,
      a: [
        [160, 112],
        [160, 52],
        [140, 100],
        [180, 128],
      ],
      dim: [120, 200, 160, "0.25 m"],
    },
    rifle: {
      d: `<path d="M24 92 l40-10 h60 l10 8 h150 v10 H134 l-10 8 H64 z"/><rect x="134" y="66" width="60" height="22" rx="10"/>
        <path d="M144 66 v22 M160 66 v22 M176 66 v22" ${T}/><path d="M194 76 h24 q10 0 10 10" ${T}/><circle cx="118" cy="70" r="9" ${T}/>
        <path d="M118 61 v-10 h6" ${T}/><path d="M80 108 l-6 26 h18 l6-26" /><path d="M284 95 h26" ${H}/>`,
      a: [
        [164, 77],
        [118, 70],
        [250, 95],
        [86, 120],
        [60, 95],
      ],
      dim: [24, 310, 150, "1.10 m"],
    },
    mine: {
      d: `<rect x="100" y="62" width="120" height="70" rx="10"/><path d="M100 76 q60-26 120 0" ${T}/><rect x="146" y="50" width="28" height="12" rx="4"/>
        <circle cx="160" cy="100" r="18" ${T}/><circle cx="160" cy="100" r="4"/><path d="M160 82 v-6 M160 118 v6 M142 100 h-6 M178 100 h6" ${T}/>
        <g ${T}><circle cx="118" cy="120" r="5"/><circle cx="132" cy="124" r="5"/><circle cx="196" cy="122" r="5"/><circle cx="208" cy="116" r="5"/><circle cx="188" cy="112" r="5"/></g>
        <path d="M220 90 q24 0 30-20" ${H}/><circle cx="252" cy="66" r="5"/>`,
      a: [
        [160, 100],
        [120, 72],
        [252, 66],
        [200, 120],
      ],
      dim: [100, 220, 150, "0.30 m"],
    },
    pistol: {
      d: `<path d="M70 70 h170 v24 H130 l-8 10 H70z"/><path d="M84 104 l-12 40 h28 l10-40"/><path d="M122 104 q4 16 18 16" ${T}/><path d="M240 76 h30 v12 h-30" ${T}/>`,
      a: [
        [160, 80],
        [90, 120],
        [255, 82],
      ],
      dim: [70, 270, 156, "0.30 m"],
    },
    spikes: {
      d: `<g><path d="M60 70 h180 l20 6 l-20 6 H60z"/><path d="M60 66 v20 h-10 v-20z"/><path d="M60 100 h180 l20 6 l-20 6 H60z"/><path d="M60 96 v20 h-10 v-20z"/></g>
        <path d="M70 130 h190" ${H}/>`,
      a: [[150, 76]],
      dim: [50, 260, 150, "0.15 m"],
    },
    dart: {
      d: `<path d="M60 88 h170" /><path d="M230 84 l30 4 l-30 4z"/><path d="M60 88 l-24-14 v28z" ${F}/><path d="M60 88 l-24-14 M60 88 l-24 14" ${T}/>
        <circle cx="130" cy="88" r="10" ${T}/><path d="M124 88 h12" ${T}/>`,
      a: [
        [130, 88],
        [200, 88],
        [44, 88],
      ],
      dim: [36, 260, 140, "0.08 m"],
    },
    silencer: {
      d: `<rect x="80" y="72" width="170" height="36" rx="12"/><path d="M110 72 v36 M140 72 v36 M170 72 v36 M200 72 v36 M230 72 v36" ${T}/>
        <path d="M60 82 h20 v16 h-20z"/><path d="M250 90 h30" ${H}/>`,
      a: [
        [120, 90],
        [200, 72],
        [70, 90],
      ],
      dim: [60, 250, 140, "0.20 m"],
    },
    mag: {
      d: `<path d="M130 40 h50 l6 100 h-50z"/><path d="M136 60 h46 M138 80 h45 M139 100 h45 M140 120 h45" ${T}/><path d="M150 40 v-10 h24 v10" ${T}/>`,
      a: [
        [160, 60],
        [162, 120],
        [160, 34],
      ],
      dim: [130, 186, 156, "0.22 m"],
    },
    scope: {
      d: `<path d="M50 78 h40 l20 -10 h110 l20 10 h40 v24 h-40 l-20 10 H110 l-20-10 H50z"/><circle cx="68" cy="90" r="10" ${T}/><circle cx="262" cy="90" r="10" ${T}/>
        <path d="M130 112 v18 h10 v-18 M200 112 v18 h10 v-18" /><path d="M160 68 v-12 h10 v12" ${T}/>`,
      a: [
        [262, 90],
        [135, 122],
        [165, 62],
      ],
      dim: [50, 280, 150, "0.30 m"],
    },
    lens: {
      d: `<ellipse cx="160" cy="90" rx="20" ry="46"/><ellipse cx="160" cy="90" rx="10" ry="34" ${T}/><path d="M80 60 q30 30 0 60 M240 60 q-30 30 0 60" ${T}/>
        <path d="M60 90 h80 M180 90 h80" ${H}/><path d="M110 60 v60 M210 60 v60" />`,
      a: [
        [160, 90],
        [110, 70],
        [210, 110],
      ],
      dim: [60, 260, 150, "f = 42 mm"],
    },
    kit: {
      d: `<rect x="80" y="66" width="160" height="70" rx="6"/><path d="M80 84 h160" ${T}/><path d="M140 58 h40 v8 h-40z"/>
        <path d="M96 100 l40 20 M100 120 l30-18" ${T}/><rect x="170" y="96" width="50" height="10" rx="3" ${T}/><circle cx="190" cy="120" r="6" ${T}/>`,
      a: [
        [116, 110],
        [195, 101],
        [190, 120],
        [160, 75],
      ],
      dim: [80, 240, 154, "0.40 m"],
    },
    cell: {
      d: `<rect x="110" y="50" width="100" height="80" rx="8"/><rect x="136" y="40" width="48" height="10"/><path d="M130 70 h60 M130 90 h60 M130 110 h60" ${T}/>
        <path d="M150 64 l-10 22 h16 l-8 24 l22-32 h-16 l8-14z" ${F}/>`,
      a: [
        [160, 90],
        [160, 44],
      ],
      dim: [110, 210, 150, "0.12 m"],
    },
    shells: {
      d: `<g><rect x="90" y="50" width="30" height="80" rx="4"/><rect x="90" y="118" width="30" height="12" ${F}/><rect x="145" y="50" width="30" height="80" rx="4"/>
        <rect x="145" y="118" width="30" height="12" ${F}/><rect x="200" y="50" width="30" height="80" rx="4"/><rect x="200" y="118" width="30" height="12" ${F}/></g>
        <path d="M95 64 h20 M150 64 h20 M205 64 h20" ${H}/>`,
      a: [
        [105, 90],
        [160, 124],
      ],
      dim: [90, 230, 150, "0.07 m"],
    },
    rounds: {
      d: `<g><path d="M100 130 v-60 q10-24 20 0 v60z"/><path d="M150 130 v-60 q10-24 20 0 v60z"/><path d="M200 130 v-60 q10-24 20 0 v60z"/></g>
        <path d="M100 82 h20 M150 82 h20 M200 82 h20" ${T}/>`,
      a: [
        [110, 110],
        [160, 64],
      ],
      dim: [100, 220, 150, "0.03 m"],
    },
    syringe: {
      d: `<rect x="90" y="78" width="120" height="24" rx="4"/><path d="M110 78 v24 M130 78 v24 M150 78 v24 M170 78 v24" ${T}/><path d="M210 86 h20 v8 h-20"/>
        <path d="M230 90 h50" /><path d="M60 82 h30 v16 h-30z" ${F}/><path d="M50 72 v36" /><path d="M120 102 q40 30 80 0" ${H}/>`,
      a: [
        [150, 90],
        [70, 90],
        [255, 90],
        [160, 115],
      ],
      dim: [50, 280, 150, "0.14 m"],
    },
    iv: {
      d: `<path d="M110 40 h100 q10 0 10 10 v70 q0 20-20 20 h-80 q-20 0-20-20 v-70 q0-10 10-10z"/><path d="M120 60 h80" ${H}/>
        <rect x="140" y="80" width="40" height="30" ${T}/><path d="M160 140 v20 q0 8 20 8 h60" /><path d="M150 40 v-12 h20 v12" ${T}/>`,
      a: [
        [160, 95],
        [200, 168],
        [160, 60],
      ],
      dim: [100, 220, 172, "0.25 m"],
    },
    pills: {
      d: `<rect x="120" y="54" width="80" height="90" rx="10"/><rect x="114" y="40" width="92" height="16" rx="4"/><rect x="130" y="80" width="60" height="40" ${T}/>
        <g ${F}><ellipse cx="236" cy="120" rx="10" ry="6"/><ellipse cx="258" cy="130" rx="10" ry="6"/><ellipse cx="244" cy="138" rx="10" ry="6"/></g>`,
      a: [
        [160, 100],
        [248, 128],
        [160, 48],
      ],
      dim: [114, 206, 160, "0.10 m"],
    },
    inhaler: {
      d: `<path d="M120 60 h60 q14 0 14 14 v50 q0 14-14 14 h-60 q-14 0-14-14 v-50 q0-14 14-14z"/><path d="M180 70 h40 v30 h-40" /><path d="M220 78 h24 v14 h-24" ${T}/>
        <path d="M130 80 h40 M130 96 h40 M130 112 h40" ${H}/>`,
      a: [
        [150, 96],
        [232, 85],
        [200, 85],
      ],
      dim: [106, 244, 156, "0.12 m"],
    },
    bag: {
      d: `<path d="M80 80 q0-20 20-20 h120 q20 0 20 20 v50 H80z"/><path d="M130 60 q0-24 30-24 q30 0 30 24" /><path d="M150 90 h20 M160 80 v20" />
        <path d="M80 104 h160" ${H}/>`,
      a: [
        [160, 90],
        [120, 116],
        [200, 116],
        [160, 44],
      ],
      dim: [80, 240, 150, "0.45 m"],
    },
    stealth: {
      d: `<rect x="100" y="56" width="120" height="72" rx="8"/><circle cx="130" cy="92" r="16"/><circle cx="130" cy="92" r="6" ${F}/>
        <path d="M160 70 h44 M160 82 h44 M160 94 h44" ${T}/><rect x="164" y="104" width="36" height="14" ${T}/><path d="M220 72 h24 v30 h-24" /><path d="M110 56 v-14 h14 v14" ${T}/>`,
      a: [
        [130, 92],
        [182, 111],
        [232, 88],
        [117, 46],
      ],
      dim: [100, 244, 150, "0.20 m"],
    },
    powder: {
      d: `<path d="M110 100 q50-60 100 0 q-6 30-50 30 q-44 0-50-30z"/><path d="M120 100 h80" ${T}/><path d="M160 70 v-26" ${T}/>
        <path d="M140 44 q20-14 40 0" /><g ${F}><circle cx="150" cy="110" r="3"/><circle cx="166" cy="116" r="3"/><circle cx="178" cy="106" r="3"/></g>`,
      a: [
        [140, 108],
        [182, 108],
        [160, 50],
      ],
      dim: [110, 210, 156, "0.12 m"],
    },
    pot: {
      d: `<path d="M100 70 h120 v50 q0 20-20 20 h-80 q-20 0-20-20z"/><path d="M92 70 h136" /><path d="M100 80 h-16 M220 80 h16" />
        <path d="M110 64 q10-18 0-30 M160 64 q10-18 0-30 M210 64 q10-18 0-30" ${T}/><path d="M110 150 q50 20 100 0" ${H}/>`,
      a: [
        [130, 110],
        [160, 96],
        [190, 110],
      ],
      dim: [84, 236, 164, "0.36 m"],
    },
    steak: {
      d: `<path d="M100 90 q0-40 60-40 q70 0 70 40 q0 40-70 40 q-60 0-60-40z"/><path d="M130 90 q30-22 70 0" ${T}/><circle cx="130" cy="96" r="10" ${T}/>
        <path d="M120 70 l90 40 M140 60 l80 36" ${H}/><path d="M160 30 q8-12 0-22 M190 34 q8-12 0-22" ${T}/>`,
      a: [[170, 90]],
      dim: [100, 230, 150, "0.24 m"],
    },
    skewer: {
      d: `<path d="M40 90 h250" /><circle cx="36" cy="90" r="6"/><ellipse cx="110" cy="90" rx="28" ry="16"/><ellipse cx="180" cy="90" rx="28" ry="16"/>
        <path d="M92 82 q18 10 36 0 M162 82 q18 10 36 0" ${T}/><path d="M100 60 q8-12 0-22 M170 60 q8-12 0-22" ${T}/>`,
      a: [
        [110, 90],
        [180, 90],
      ],
      dim: [30, 290, 140, "0.45 m"],
    },
    bottle: {
      d: `<path d="M150 30 h20 v24 q20 12 20 36 v50 q0 10-10 10 h-40 q-10 0-10-10 v-50 q0-24 20-36z"/><rect x="146" y="22" width="28" height="8" ${F}/>
        <rect x="134" y="90" width="52" height="30" ${T}/><path d="M136 70 h48" ${H}/>`,
      a: [
        [160, 105],
        [160, 70],
        [160, 26],
      ],
      dim: [130, 190, 160, "0.25 m"],
    },
    mug: {
      d: `<path d="M120 60 h70 v60 q0 16-16 16 h-38 q-16 0-16-16z"/><path d="M190 74 q26 0 26 22 q0 22-26 22" /><path d="M126 76 h58" ${H}/>
        <path d="M140 52 q8-12 0-24 M166 52 q8-12 0-24" ${T}/>`,
      a: [
        [155, 100],
        [150, 76],
      ],
      dim: [120, 216, 156, "0.12 m"],
    },
    pan: {
      d: `<ellipse cx="150" cy="96" rx="70" ry="26"/><ellipse cx="150" cy="92" rx="58" ry="18" ${T}/><path d="M220 96 h80 v8 h-80" />
        <g ${F}><ellipse cx="130" cy="90" rx="16" ry="7"/><ellipse cx="168" cy="92" rx="16" ry="7"/></g><path d="M130 60 q8-12 0-22 M168 60 q8-12 0-22" ${T}/>`,
      a: [
        [130, 90],
        [168, 92],
        [260, 100],
      ],
      dim: [80, 300, 150, "0.40 m"],
    },
    bun: {
      d: `<path d="M90 80 q70-50 140 0 z"/><path d="M86 86 h148 v12 h-148z" ${F}/><path d="M90 104 h140 q-10 22-70 22 q-60 0-70-22z"/>
        <path d="M120 66 l4 4 M150 58 l4 4 M180 60 l4 4 M204 70 l4 4" ${T}/>`,
      a: [
        [160, 92],
        [160, 114],
      ],
      dim: [86, 234, 150, "0.12 m"],
    },
    breakdown: {
      // exploded cartridge: case, primer, powder charge, bullet along one centre line
      d: `<path d="M30 90 H300" ${H}/><path d="M60 72 h78 l10 6 v24 l-10 6 H60 z"/><path d="M60 72 v36 M66 72 v36" ${T}/><path d="M138 78 h10 M138 102 h10" ${T}/>
        <rect x="26" y="80" width="10" height="20" rx="2" ${F}/><path d="M31 80 v20" ${T}/>
        <path d="M176 104 q20-26 40 0 z" ${F}/><g ${T}><circle cx="186" cy="100" r="1.6"/><circle cx="196" cy="96" r="1.6"/><circle cx="205" cy="101" r="1.6"/><circle cx="194" cy="102" r="1.4"/></g>
        <path d="M240 76 h30 q24 0 34 14 q-10 14-34 14 h-30 z"/><path d="M246 76 v28" ${T}/>
        <path d="M100 60 v-14 M31 70 v-14 M196 82 v-26 M270 66 v-10" ${T}/>`,
      a: [
        [100, 90],
        [31, 90],
        [196, 98],
        [272, 90],
      ],
      dim: [26, 304, 138, "0.07 m"],
    },
    generic: {
      d: `<rect x="100" y="54" width="120" height="80" rx="4"/><path d="M100 54 l120 80 M220 54 l-120 80" ${H}/><circle cx="160" cy="94" r="18" ${T}/>
        <path d="M160 70 v-8 M160 118 v8 M136 94 h-8 M184 94 h8" ${T}/>`,
      a: [
        [160, 94],
        [120, 70],
        [200, 120],
        [120, 120],
      ],
      dim: [100, 220, 154, "—"],
    },
  };
  X.ART = ART;

  // ------------------------------------------------------------------
  // Parameterised cartridge drawings (reloading bench). Real proportions
  // from the cartridge's millimetre dimensions; one callout anchor per
  // component, in the order the recipes list them: case, primer, powder,
  // bullet (a caseless break-down drops the case).
  //   spec: {len (case mm), oal (mm), dia (body mm), neck (mm), rim (mm),
  //          shoulder (mm from base, bottleneck only), nose: 'round'|'spire'|'flat',
  //          shot: true (shotshell), label}
  //   mode: 'load' (assembled, X-ray section) | 'explode' (break-down) | 'explode_nc'
  // ------------------------------------------------------------------
