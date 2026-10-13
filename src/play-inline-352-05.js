// play-inline-352 05 — out
// Lines 700-739 of readable/play-inline-352.pretty.js (statement-aligned).
  function run() {
    done = true;
    const out = { pois: [], errors: [] };
    for (const ctx of PC.ctxs || []) {
      try {
        out.pois.push(probe(ctx));
      } catch (e) {
        out.errors.push(ctx.id + ": " + ((e && e.stack) || e));
      }
    }
    out.gErrors = (G.errors || []).slice(0, 20);
    const pre = document.createElement("pre");
    pre.id = "pc-probe";
    pre.textContent =
      "PCPROBE_" + "BEGIN" + JSON.stringify(out) + "PCPROBE_" + "END";
    document.body.appendChild(pre);
    // also on the console (chunked), so a runner reading Chrome's --enable-logging can stop early
    try {
      const t = JSON.stringify(out);
      for (let k = 0; k < t.length; k += 30000)
        console.log(
          "PCPROBE_CHUNK " + encodeURIComponent(t.slice(k, k + 30000)),
        );
      console.log("[pcprobe] done PCPROBE_FIN");
    } catch (e) {
      /* */
    }
  }
  G.registerModule({
    name: "poi_civic_probe",
    order: 99,
    update() {
      if (done) return;
      if (G.state !== "play" && G.state !== "cutscene") {
        frames = 0;
        return;
      }
      if (++frames === 20) run();
    },
  });
