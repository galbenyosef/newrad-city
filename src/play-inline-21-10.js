// play-inline-21 10 — color
// Lines 2591-2999 of readable/play-inline-21.pretty.js (statement-aligned).
  function specialSpec(name) {
    // neon_<color> or neon_<hex>
    let m = /^neon_(.+)$/.exec(name);
    if (m) {
      const c =
        NEON_COLORS[m[1]] !== undefined
          ? NEON_COLORS[m[1]]
          : /^[0-9a-f]{6}$/i.test(m[1])
            ? parseInt(m[1], 16)
            : 0xff3366;
      const col = new THREE.Color(c);
      return {
        type: "neon",
        params: {
          color: col.clone().multiplyScalar(0.4),
          emissive: col,
          emissiveIntensity: 2.6,
          roughness: 0.35,
          metalness: 0,
        },
        night: [1.5, 3.6],
        flicker: true,
      };
    }
    switch (name) {
      case "glass":
        return {
          params: {
            color: 0x6f8886,
            roughness: 0.08,
            metalness: 0.6,
            transparent: true,
            opacity: 0.38,
            envMapIntensity: 1.2,
            depthWrite: false,
            map: "glass_dirty",
          },
          env: true,
        };
      case "glass_clean":
        return {
          params: {
            color: 0x9fb8b6,
            roughness: 0.03,
            metalness: 0.7,
            transparent: true,
            opacity: 0.25,
            envMapIntensity: 1.4,
            depthWrite: false,
          },
          env: true,
        };
      case "glass_broken":
        return {
          params: {
            color: 0x3c4744,
            roughness: 0.2,
            metalness: 0.5,
            transparent: true,
            opacity: 0.55,
            map: "glass_dirty",
            depthWrite: false,
          },
          env: true,
        };
      case "glass_green":
        return {
          params: {
            color: 0x3f7a4a,
            roughness: 0.1,
            metalness: 0.3,
            transparent: true,
            opacity: 0.6,
            envMapIntensity: 1,
          },
          env: true,
        };
      case "emissive_window":
        return {
          params: {
            color: 0x3a2a14,
            map: "window_lit",
            emissiveMap: "window_lit",
            emissive: 0xffc070,
            emissiveIntensity: 1.3,
            roughness: 0.5,
          },
          night: [0.35, 2.0],
        };
      case "window_dark":
        return {
          params: {
            color: 0x1a1d1c,
            roughness: 0.15,
            metalness: 0.6,
            envMapIntensity: 0.9,
          },
          env: true,
        };
      case "blood":
        return { params: { color: 0x5a0a08, roughness: 0.25, metalness: 0.1 } };
      case "blood_green":
        return {
          params: {
            color: 0x3a5a10,
            roughness: 0.25,
            metalness: 0.1,
            emissive: 0x1a3a05,
            emissiveIntensity: 0.3,
          },
        };
      case "cryo_grey":
        return {
          params: {
            color: 0xffffff,
            map: "paint_cryo_grey",
            roughness: 0.5,
            metalness: 0.3,
            normalMap: "metal_panel",
          },
        };
      case "cryo_orange":
        return {
          params: {
            color: 0xffffff,
            map: "paint_cryo_orange",
            roughness: 0.5,
            metalness: 0.25,
          },
        };
      case "cryo_suit_grey":
        return {
          params: {
            color: 0xffffff,
            map: "cryo_suit",
            normalMap: "cryo_suit",
            roughness: 0.85,
            metalness: 0,
          },
        };
      case "cryo_suit_orange":
        return {
          params: {
            color: 0xe0702a,
            map: "fabric",
            roughness: 0.75,
            metalness: 0,
          },
        };
      case "blast_door":
        return {
          params: {
            color: 0x9aa2a8,
            map: "metal_panel",
            normalMap: "metal_panel",
            roughness: 0.45,
            metalness: 0.85,
            envMapIntensity: 0.8,
          },
          env: true,
        };
      case "chrome":
        return {
          params: {
            color: 0xe8e8e8,
            roughness: 0.14,
            metalness: 1.0,
            envMapIntensity: 1.3,
          },
          env: true,
        };
      case "chrome_dirty":
        return {
          params: {
            color: 0xb8b4a8,
            roughness: 0.32,
            metalness: 0.95,
            envMapIntensity: 1.0,
            map: "metal_scratched",
          },
          env: true,
        };
      case "steel":
        return {
          params: {
            color: 0x9a9c9c,
            roughness: 0.4,
            metalness: 0.9,
            map: "metal_scratched",
            envMapIntensity: 0.8,
          },
          env: true,
        };
      case "iron":
        return {
          params: {
            color: 0x55504a,
            roughness: 0.7,
            metalness: 0.75,
            map: "rust",
            envMapIntensity: 0.5,
          },
          env: true,
        };
      case "gold":
        return {
          params: {
            color: 0xe0b050,
            roughness: 0.28,
            metalness: 1.0,
            map: "gold",
            envMapIntensity: 1.2,
          },
          env: true,
        };
      case "bronze":
        return {
          params: {
            color: 0xffffff,
            map: "bronze",
            roughness: 0.45,
            metalness: 0.85,
            envMapIntensity: 0.9,
          },
          env: true,
        };
      case "copper_patina":
        return {
          params: {
            color: 0xffffff,
            map: "copper_patina",
            normalMap: "copper_patina",
            roughness: 0.75,
            metalness: 0.25,
          },
        };
      case "rubber":
        return { params: { color: 0x1c1c1c, roughness: 0.95, metalness: 0 } };
      case "tire":
        return {
          params: {
            color: 0xffffff,
            map: "rubber",
            roughness: 0.95,
            metalness: 0,
          },
        };
      case "plastic_white":
        return { params: { color: 0xe0ddd2, roughness: 0.45, metalness: 0 } };
      case "plastic_black":
        return { params: { color: 0x1e1e1e, roughness: 0.4, metalness: 0 } };
      case "emissive_green":
      case "glow_green":
        return {
          params: {
            color: 0x1a5a1a,
            emissive: 0x4dff5a,
            emissiveIntensity: 2.2,
            roughness: 0.4,
          },
          night: [1.6, 2.6],
        };
      case "glow_sun":
        return {
          params: {
            color: 0x6a4a1a,
            emissive: 0xffc860,
            emissiveIntensity: 2.8,
            roughness: 0.3,
          },
          flicker: true,
        };
      case "glow_red":
        return {
          params: {
            color: 0x5a1010,
            emissive: 0xff3020,
            emissiveIntensity: 2.2,
            roughness: 0.4,
          },
          flicker: true,
        };
      case "glow_blue":
        return {
          params: {
            color: 0x10205a,
            emissive: 0x40a0ff,
            emissiveIntensity: 2.2,
            roughness: 0.4,
          },
        };
      case "glow_fizzo_blue":
        return {
          params: {
            color: 0x1a2a5a,
            emissive: 0x5ad8ff,
            emissiveIntensity: 2.6,
            roughness: 0.2,
          },
        };
      case "lamp_warm":
        return {
          params: {
            color: 0xfff0d0,
            emissive: 0xffd9a0,
            emissiveIntensity: 2.0,
            roughness: 0.3,
          },
          night: [0.2, 2.6],
        };
      case "lamp_cold":
        return {
          params: {
            color: 0xe0f0ff,
            emissive: 0xc8e4ff,
            emissiveIntensity: 2.0,
            roughness: 0.3,
          },
          night: [0.2, 2.4],
        };
      case "fire":
        return {
          params: {
            color: 0x401000,
            emissive: 0xff7a1a,
            emissiveIntensity: 3,
            roughness: 1,
          },
          flicker: true,
        };
      case "screen_green":
        return {
          params: {
            color: 0x0a1a0a,
            map: "screen_green",
            emissiveMap: "screen_green",
            emissive: 0x6aff8a,
            emissiveIntensity: 1.4,
            roughness: 0.2,
          },
        };
      case "screen_amber":
      case "terminal_screen":
        return {
          params: {
            color: 0x1a0e04,
            map: "screen_amber",
            emissiveMap: "screen_amber",
            emissive: 0xffb347,
            emissiveIntensity: 1.4,
            roughness: 0.2,
          },
        };
      case "water":
        return {
          params: {
            color: 0xffffff,
            map: "water",
            normalMap: "water",
            roughness: 0.12,
            metalness: 0.2,
            transparent: true,
            opacity: 0.88,
            envMapIntensity: 0.9,
          },
          env: true,
        };
      case "wire":
      case "cable":
        return { params: { color: 0x151515, roughness: 0.7, metalness: 0.3 } };
      case "skeleton":
      case "bone":
        return {
          params: {
            color: 0xffffff,
            map: "bone",
            roughness: 0.75,
            metalness: 0,
          },
        };
      case "shadow_blob":
        return {
          params: {
            color: 0x000000,
            transparent: true,
            opacity: 0.45,
            depthWrite: false,
            alphaMap: "shadow_blob",
          },
        };
    }
    m = /^paint_(.+)$/.exec(name);
    if (m)
      return {
        params: {
          color: 0xffffff,
          map: name,
          normalMap: "metal_painted",
          roughness: 0.62,
          metalness: 0.25,
          envMapIntensity: 0.4,
        },
        env: true,
        macro: 0.35,
      };
    return null;
  }

  /** Default macro-variation strength for a surface def (0 = off). Large, repeating world surfaces get most. */
