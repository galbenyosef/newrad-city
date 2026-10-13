// play-inline-536 04 — res
// Lines 663-681 of readable/play-inline-536.pretty.js (statement-aligned).
  function report(res) {
    const fails = res.filter((r) => r[1] !== "ok");
    const summary =
      "[crafttest] " +
      (res.length - fails.length) +
      "/" +
      res.length +
      " passed" +
      (fails.length
        ? " — " + fails.map((f) => f[0] + ": " + f[1]).join("; ")
        : "");
    console.log(summary);
    if (G.warnings) G.warnings.unshift(summary);
    X.testResult = {
      passed: res.length - fails.length,
      total: res.length,
      results: res,
    };
  }
