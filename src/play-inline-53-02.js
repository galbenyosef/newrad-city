// play-inline-53 02 — atmos
// Lines 27-98 of readable/play-inline-53.pretty.js (statement-aligned).
  const A = G.atmos._;

  // same uniforms as the old AO shader (uN = total samples budget: 8 / 12 / 16 → 2 slices × 2 sides × N/4 steps)
  const FS = `
    uniform sampler2D tDepth; uniform mat4 uProj, uInvProj; uniform vec2 uCamNF, uDTexel;
    uniform float uRadius, uN, uFar, uInt, uFogD, uMaxUV;
    varying vec2 vUv;
    const float PI = 3.14159265, HPI = 1.5707963;
    vec3 viewAt(vec2 uv, float d){ vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return v.xyz / v.w; }
    vec3 posAt(vec2 uv){ return viewAt(uv, texture2D(tDepth, uv).r); }
    float fastAcos(float x){ float a = abs(x); float r = (-0.156583 * a + HPI) * sqrt(max(0.0, 1.0 - a)); return x >= 0.0 ? r : PI - r; }
    void main(){
      float d = texture2D(tDepth, vUv).r;
      if (d >= 0.99999) { gl_FragColor = vec4(1.0, 60000.0, 0.0, 1.0); return; }
      vec3 P = viewAt(vUv, d);
      float z = -P.z;
      float rad = uRadius * (1.25 + z * 0.012);
      vec2 rUV = rad * 0.5 / z * vec2(uProj[0][0], uProj[1][1]);
      float fade = exp(-(uFogD * z) * (uFogD * z) * 1.4) * (1.0 - smoothstep(uFar * 0.55, uFar, z)) * smoothstep(1.2, 2.5, rUV.y / uDTexel.y);
      if (fade < 0.01) { gl_FragColor = vec4(1.0, z, 0.0, 1.0); return; }
      rUV *= min(1.0, uMaxUV / rUV.y);
      // normal from the flatter depth neighbours (no smearing across silhouettes)
      vec3 pr = posAt(vUv + vec2(uDTexel.x, 0.0)), pl = posAt(vUv - vec2(uDTexel.x, 0.0));
      vec3 pu = posAt(vUv + vec2(0.0, uDTexel.y)), pd = posAt(vUv - vec2(0.0, uDTexel.y));
      vec3 dx = abs(pr.z - P.z) < abs(P.z - pl.z) ? pr - P : P - pl;
      vec3 dy = abs(pu.z - P.z) < abs(P.z - pd.z) ? pu - P : P - pd;
      vec3 N = normalize(cross(dx, dy));
      vec3 V = normalize(-P);
      // interleaved gradient noise: slice rotation + step jitter (the 7-tap bilateral blur averages it out)
      float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      float ign2 = fract(ign * 7.13 + 0.37);
      int steps = int(max(2.0, floor(uN / 4.0)));
      float R2 = rad * rad;
      float vis = 0.0, wsum = 0.0;
      for (int s = 0; s < 2; s++) {
        float phi = (float(s) + ign) * (PI / 2.0);
        vec2 dir = vec2(cos(phi), sin(phi));
        // slice plane (view space) spanned by the screen direction and V
        vec3 d3 = normalize(vec3(dir.x, dir.y, 0.0) - V * dot(vec3(dir.x, dir.y, 0.0), V));
        vec3 axis = normalize(cross(d3, V));
        vec3 pN = N - axis * dot(N, axis);
        float pL = length(pN);
        if (pL < 1e-4) continue;
        float cn = clamp(dot(pN / pL, V), -1.0, 1.0);
        float n = (dot(pN, d3) >= 0.0 ? 1.0 : -1.0) * fastAcos(cn);   // normal tilt inside the slice (+ = toward +dir)
        float h0 = -1.0, h1 = -1.0;                                     // cos of the horizons on both sides
        for (int i = 0; i < 4; i++) {
          if (i >= steps) break;
          float t = (float(i) + ign2) / float(steps);
          t = t * t * 0.85 + 0.15 * t;                                  // denser near the pixel (contact)
          vec2 o = dir * rUV * max(t, 1.5 * uDTexel.y / max(rUV.y, 1e-5));
          vec3 v0 = posAt(vUv + o) - P, v1 = posAt(vUv - o) - P;
          float l0 = dot(v0, v0), l1 = dot(v1, v1);
          float c0 = dot(v0, V) * inversesqrt(l0 + 1e-6), c1 = dot(v1, V) * inversesqrt(l1 + 1e-6);
          // distance falloff: far samples (a background behind a pole) sink back to the horizon floor
          float f0 = clamp(l0 / R2 - 0.4, 0.0, 1.0), f1 = clamp(l1 / R2 - 0.4, 0.0, 1.0);
          h0 = max(h0, mix(c0, -1.0, f0));
          h1 = max(h1, mix(c1, -1.0, f1));
        }
        // horizon angles (side 0 = +dir, measured toward -n), clamped to the normal's hemisphere
        float a0 = n + max(-fastAcos(h1) - n, -HPI);
        float a1 = n + min(fastAcos(h0) - n, HPI);
        float iarc = 0.25 * (-cos(2.0 * a0 - n) + cn + 2.0 * a0 * sin(n)) + 0.25 * (-cos(2.0 * a1 - n) + cn + 2.0 * a1 * sin(n));
        vis += pL * iarc; wsum += pL;
      }
      float ao = wsum > 0.0 ? clamp(vis / wsum, 0.0, 1.0) : 1.0;
      ao = pow(ao, 0.55 * uInt);                                       // artistic strength (uInt ≈ 2.1–2.4)
      gl_FragColor = vec4(mix(1.0, ao, fade), z, 0.0, 1.0);
    }
  `;

  A.postGTAO = { FS };
