// play-inline-21 08 — shader
// Lines 1892-2241 of readable/play-inline-21.pretty.js (statement-aligned).
  function winPatch(mat, shader, win) {
    const rect = win.rect,
      pg = win.proc;
    shader.uniforms.uTxWinMask = { value: win.mask };
    shader.uniforms.uTxWinRect = {
      value: new THREE.Vector4(rect[0], rect[1], rect[2], rect[3]),
    };
    let ws = null;
    try {
      ws =
        !pg && X.facadeWallSpec ? X.facadeWallSpec(mat.userData.txWin) : null;
    } catch (e) {
      ws = null;
    }
    shader.uniforms.uTxWall = {
      value: ws
        ? new THREE.Vector4(ws.a[0], ws.a[1], ws.a[2], ws.a[3])
        : new THREE.Vector4(0, 1, 1, 0),
    };
    shader.uniforms.uTxWall2 = {
      value: ws
        ? new THREE.Vector4(ws.b[0], ws.b[1], ws.b[2], ws.b[3])
        : new THREE.Vector4(0, 0, 0, 0),
    };
    const rec = /^facade_([a-z]+)_/.exec(mat.userData.txWin || "");
    // glass set back behind the wall face (m): NYC masonry walls are 30–60 cm thick, sashes sit 20–30 cm in
    shader.uniforms.uTxRecess = {
      value: pg
        ? +pg.recess || 0
        : rec
          ? { tenement: 0.24, brownstone: 0.28, artdeco: 0.2, warehouse: 0.22 }[
              rec[1]
            ] || 0
          : 0,
    };
    shader.uniforms.uTxGrid = {
      value: pg
        ? new THREE.Vector4(pg.cells[0], pg.cells[1], 1, 0)
        : new THREE.Vector4(4, 6, 0, 0),
    };
    shader.uniforms.uTxProc = {
      value: pg
        ? new THREE.Vector4(pg.mullions, pg.transom, pg.bar, pg.lit ? 1 : 0)
        : new THREE.Vector4(0, -9, 0, 0),
    };
    const lin = (hex, srgb) => {
      const c = new THREE.Color();
      c.setHex(hex, srgb ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace);
      return new THREE.Vector3(c.r, c.g, c.b);
    };
    const srgbMap = !!(mat.map && mat.map.colorSpace === THREE.SRGBColorSpace);
    shader.uniforms.uTxProcG = {
      value: pg ? lin(pg.glass, srgbMap) : new THREE.Vector3(0.1, 0.1, 0.1),
    };
    shader.uniforms.uTxProcL = {
      value: pg && pg.lit ? lin(pg.lit, srgbMap) : new THREE.Vector3(1, 1, 1),
    };
    const env = new THREE.Vector2(
      1,
      pg ? (pg.office ? 1 : 0) : /office/.test(mat.userData.txWin) ? 1 : 0,
    );
    shader.uniforms.uTxWinEnv = {
      get value() {
        env.x = 1 - curNight;
        return env;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxWinK = WIN_K; // shared: room gain / night lanterns (X.winK, live-tunable)
    let fs = shader.fragmentShader.replace(
      MACRO_FRAG_PARS,
      MACRO_FRAG_PARS + "\n" + WIN_FRAG_PARS + failTest("win"),
    );
    fs = fs.replace(
      "void main() {",
      "void main() {\n  vec3 txWinRad = vec3( 0.0 ); float txWinM = 0.0, txWinHole = 0.0; vec3 txWinLitK = vec3( 1.0 ); vec2 txDH = vec2( 0.0 ); float txWallN = 0.0; vec3 txRevN = vec3( 0.0, 0.0, 1.0 ); float txRevK = 0.0;",
    );
    fs = fs.replace("#include <normal_fragment_maps>", WALL_NORMAL);
    fs = fs.replace(MACRO_FRAG, MACRO_FRAG + "\n" + WIN_FRAG);
    fs = fs.replace("#include <roughnessmap_fragment>", WIN_ROUGH);
    fs = fs.replace("#include <emissivemap_fragment>", WIN_EMIS);
    if (X.winDebug)
      fs = fs.replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\n" + X.winDebug,
      ); // dev: GLSL override, e.g. 'gl_FragColor = vec4( txWinRad * 6.0, 1.0 );'
    // dev (perf A/B in one session, X.perfLvl): 1 no rooms, 2 + no wall detail, 3 + no recess / reveals, 4 + no window branch
    // + the live perf tier (quality setting / dynamic resolution): tier 2 drops the room ray-cast (no recompile)
    shader.uniforms.uTxWinLvl = {
      get value() {
        return Math.max(X.perfLvl || 0, Q.winLvl);
      },
      set value(v) {
        /* read-only */
      },
    };
    // live sky for the glass reflections (shared objects, written once per frame in updateSky)
    shader.uniforms.uTxSkyZ = SKY.z;
    shader.uniforms.uTxSkyH = SKY.h;
    shader.uniforms.uTxSunC = SKY.sc;
    shader.uniforms.uTxSkyG = SKY.g;
    shader.uniforms.uTxSunD = SKY.sd;
    shader.uniforms.uTxSkyK = SKY.k;
    shader.fragmentShader = fs;
  }
  /** Mask texture + window rect for a material tagged userData.txWin (façade name), or null. */
  let dummyMask = null;
  function winInfo(mat) {
    const g = mat.userData && mat.userData.txWinGrid;
    if (g && mat.map && winOK()) {
      if (!dummyMask) {
        dummyMask = new THREE.DataTexture(new Uint8Array(4), 1, 1);
        dummyMask.needsUpdate = true;
      }
      return { mask: dummyMask, rect: g.rect, proc: g };
    }
    const n = mat.userData && mat.userData.txWin;
    if (!n || !mat.map || !X.facadeMask || !winOK()) return null;
    let mask = null,
      rect = null;
    try {
      mask = X.facadeMask(n);
      rect = X.facadeWinRect(n);
    } catch (e) {
      return null;
    }
    return mask && rect ? { mask, rect } : null;
  }
  let winSupport = null;
  function winOK() {
    if (winSupport === null) {
      try {
        winSupport =
          !G.renderer ||
          !G.renderer.capabilities ||
          G.renderer.capabilities.isWebGL2 !== false;
      } catch (e) {
        winSupport = false;
      }
      if (G.QS && G.QS.get && G.QS.get("txwin") === "0") winSupport = false; // dev: A/B the façade shader (perf)
    }
    return winSupport;
  }
  X.macroCount = 0;
  /**
   * Inject the macro-variation code. Uniform values are live getters on userData, so changing
   * mat.userData.txMacro / txBand later takes effect without a recompile.
   */
  function macroPatch(mat, shader) {
    shader.uniforms.uTxMacro = {
      get value() {
        return (mat.userData && +mat.userData.txMacro) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxBand = {
      get value() {
        return (mat.userData && +mat.userData.txBand) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxGround = {
      get value() {
        return (mat.userData && +mat.userData.txGround) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxBrick = {
      get value() {
        return (mat.userData && +mat.userData.txBrick) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxQ = uTxQ; // shared object: one live quality vector for every patched program
    shader.uniforms.uTxWet = uTxWet; // shared: rain wetness + time + falling rain
    shader.uniforms.uTxDetail = {
      get value() {
        return DETAIL_OFF ? 0 : (mat.userData && +mat.userData.txDetail) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    // live sky for the standing-water reflections (the same shared objects the façade glass uses)
    shader.uniforms.uTxSkyZ = SKY.z;
    shader.uniforms.uTxSkyH = SKY.h;
    shader.uniforms.uTxSunC = SKY.sc;
    shader.uniforms.uTxSkyG = SKY.g;
    shader.uniforms.uTxSunD = SKY.sd;
    shader.uniforms.uTxSkyK = SKY.k;
    shader.vertexShader =
      "varying vec3 vTxW;\n" +
      shader.vertexShader.replace("#include <project_vertex>", MACRO_VERT);
    shader.fragmentShader =
      MACRO_FRAG_PARS +
      failTest("macro") +
      "\n" +
      shader.fragmentShader
        .replace("#include <map_fragment>", MACRO_FRAG)
        .replace(
          "void main() {",
          "void main() {\n  vec2 txBDH = vec2( 0.0 ); float txDustK = 0.0, txWetK = 0.0, txPudW = 0.0, txDetR = 0.0; vec3 txPudRad = vec3( 0.0 ), txPudN = vec3( 0.0, 1.0, 0.0 ), txDetG = vec3( 0.0 );",
        )
        .replace("#include <normal_fragment_maps>", MACRO_NORMAL)
        .replace("#include <roughnessmap_fragment>", MACRO_ROUGH)
        .replace("#include <emissivemap_fragment>", MACRO_EMIS)
        .replace("#include <opaque_fragment>", MACRO_OPQ);
    if (MACRO_DBG)
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\n" + MACRO_DBG,
      );
  }
  // dev: ?txdet=0 switches the close-range detail layer off (A/B screenshots, no recompile)
  const DETAIL_OFF = !!(G.QS && G.QS.get && G.QS.get("txdet") === "0");
  // dev: ?txdbg=wet|dust shows the rain / dust layer weights of the macro shader in false colour
  const MACRO_DBG = (() => {
    const q = G.QS && G.QS.get && G.QS.get("txdbg");
    return q === "wet"
      ? "gl_FragColor = vec4( txWetK, uTxWet.x, 0.0, 1.0 );"
      : q === "dust"
        ? "gl_FragColor = vec4( txDustK, 0.0, 0.0, 1.0 );"
        : "";
  })();

  // ------------------------------------------------------------------
  // Neon / fire flicker in the shader, per OBJECT (not per shared material)
  // ------------------------------------------------------------------
  // Every sign that shares G.mats.get('neon_red') used to dim in lock-step (the CPU wrote one emissiveIntensity per
  // material). The phase now comes from the object's world origin (instance origin for InstancedMesh), so one shared
  // material gives every sign its own tube behaviour: most hum steadily with a faint breathing, ~30 % are faulty and
  // stutter in short 18 Hz on/off bursts every few seconds, ~6 % are dying (dark, with rare sputters). Fire (mode 1)
  // gets a smooth, non-periodic flame flicker instead. The CPU only writes the day/night base intensity.
  const uTxTime = { value: 0 };
  const uTxWet = { value: new THREE.Vector4(0, 0, 0, 0) }; // x: wetness (G.atmos.wetness(), outdoors), y: time for running water, z: falling rain
  // dev: ?txwet=0..1 overrides the wetness the façade rain layer sees (A/B screenshots)
  const WET_DEV = (() => {
    const q = G.QS && G.QS.get && G.QS.get("txwet");
    const v = q === null || q === undefined || q === "" ? -1 : +q;
    return isFinite(v) ? v : -1;
  })();
  // dev: ?txfail=win|macro|flk plants a compile error in that patch to exercise the driver fallback (installShaderGuard)
  const FAILTEST = (G.QS && G.QS.get && G.QS.get("txfail")) || "";
  const failTest = (k) => (FAILTEST === k ? "\n#error txfail test\n" : "");
  // The seed is the object's world origin (instance origin) plus the ~2.2 m world cell of the fragment: signs merged into
  // one static batch (all geometry in world space, origin 0,0,0) no longer flicker in lock-step, and big signs behave like
  // real ones — each run of tubes (its own transformer) hums, stutters or dies on its own.
  const FLK_VERT = [
    "#include <project_vertex>",
    "{ vec4 txO = vec4( 0.0, 0.0, 0.0, 1.0 ); vec4 txP = vec4( transformed, 1.0 );",
    "#ifdef USE_INSTANCING",
    "  txO = instanceMatrix * txO; txP = instanceMatrix * txP;",
    "#endif",
    "  vTxFk = ( modelMatrix * txO ).xyz; vTxFkP = ( modelMatrix * txP ).xyz; }",
  ].join("\n");
  const FLK_FRAG_PARS = [
    "varying vec3 vTxFk;",
    "varying vec3 vTxFkP;",
    "uniform float uTxTime;",
    "uniform float uTxFkMode;",
    "float txFkH( float n ) { return fract( sin( n ) * 43758.5453 ); }",
    "float txFlicker( vec3 o, float t ) {",
    "  float s = fract( sin( dot( floor( o * 2.0 + 0.5 ), vec3( 12.9898, 78.233, 37.719 ) ) ) * 43758.5453 );",
    "  if ( uTxFkMode > 0.5 ) {", // fire: layered, never periodic
    "    float f = sin( t * 9.1 + s * 30.0 ) * 0.5 + sin( t * 15.7 + s * 11.0 ) * 0.3 + sin( t * 23.3 + s * 57.0 ) * 0.2;",
    "    return 0.9 + 0.14 * f + 0.1 * ( txFkH( floor( t * 11.0 ) + s * 7.0 ) - 0.5 ); }",
    "  float v = 0.955 + 0.03 * sin( t * ( 1.3 + 1.7 * s ) + s * 40.0 ) + 0.015 * sin( t * 31.0 + s * 90.0 );", // healthy hum
    "  float per = 3.0 + 9.0 * txFkH( s * 17.0 );",
    "  float cyc = t / per + s * 7.0; float ci = floor( cyc ), cf = fract( cyc ) * per;",
    "  float burst = step( cf, 0.2 + 0.9 * txFkH( ci + s * 13.0 ) ) * step( s, 0.3 ) * step( 0.35, txFkH( ci * 1.7 + s ) );",
    "  v = mix( v, mix( 0.1, 1.0, step( 0.45, txFkH( floor( t * 18.0 ) + s * 31.0 ) ) ), burst );",
    "  if ( s > 0.94 ) v = mix( 0.05, 0.85, step( 0.75, txFkH( floor( t * 9.0 ) + s * 5.0 ) ) * step( 0.6, sin( t * 0.7 + s * 20.0 ) ) );",
    "  return v; }",
  ].join("\n");
  const FLK_EMIS = [
    "#include <emissivemap_fragment>",
    "totalEmissiveRadiance *= txFlicker( vTxFk + floor( vTxFkP / 2.2 ) * 1.37, uTxTime );",
  ].join("\n");
  const flkPatched = new WeakSet();
  function flkPatch(mat, shader) {
    shader.uniforms.uTxTime = uTxTime;
    const fire =
      /fire|flame|burn/i.test(mat.name || "") ||
      !!(mat.userData.txGlow && mat.userData.txGlow.fire);
    shader.uniforms.uTxFkMode = { value: fire ? 1 : 0 };
    shader.vertexShader =
      "varying vec3 vTxFk;\nvarying vec3 vTxFkP;\n" +
      shader.vertexShader.replace("#include <project_vertex>", FLK_VERT);
    shader.fragmentShader =
      FLK_FRAG_PARS +
      failTest("flk") +
      "\n" +
      shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        FLK_EMIS,
      );
    flkPatched.add(mat);
  }

  // ------------------------------------------------------------------
  // Procedural env map follows the time of day
  // ------------------------------------------------------------------
  // X.envMap() is one static hazy-noon city panorama: chrome, glass, steel and paints used to reflect a bright daytime sky
  // at midnight and inside the bunkers. The image-based part of their lighting (radiance + irradiance from the env map,
  // nothing else) is scaled by the live sky: uTxEnvK = atmosphere horizon colour / the panorama's noon horizon (dusk turns
  // it amber, night nearly black, lightning flashes it), × 0.4 indoors. One shared uniform, no per-material CPU work.
  const uTxEnvK = { value: new THREE.Color(1, 1, 1) };
  const ENV_H0 = new THREE.Color(0.52, 0.53, 0.42);
  const ENV_FRAG = [
    "#include <lights_fragment_maps>",
    "#if defined( USE_ENVMAP ) && defined( RE_IndirectDiffuse )",
    "iblIrradiance *= uTxEnvK;",
    "#endif",
    "#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )",
    "radiance *= uTxEnvK;",
    "#endif",
  ].join("\n");
  function envOurs(m) {
    return !!(envTex && m.envMap && m.envMap === envTex);
  }
  function envPatch(shader) {
    shader.uniforms.uTxEnvK = uTxEnvK;
    shader.fragmentShader =
      "uniform vec3 uTxEnvK;\n" +
      shader.fragmentShader.replace(
        "#include <lights_fragment_maps>",
        ENV_FRAG,
      );
  }

  // ------------------------------------------------------------------
  // Quality tiers + shader-failure fallback
  // ------------------------------------------------------------------
  // Compile level (program key): quality 'low' drops the macro / façade / dust patches entirely (recompile once when the
  // setting changes). Uniform level (no recompile): the live perf tier (quality + dynamic resolution, G.atmos.perfTier)
  // narrows the window-detail radius (tier 1) or removes the room ray-cast and dust (tier 2).
  const Q = { low: false, tier: 0, winLvl: 0, quality: "" };
  const uTxQ = { value: new THREE.Vector4(1, 0, 1, 1) };
  const fail = { macro: false, win: false, flk: false, env: false };
  X.shaderFallback = fail;
