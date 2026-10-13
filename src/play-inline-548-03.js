// play-inline-548 03 — slides
// Lines 719-764 of readable/play-inline-548.pretty.js (statement-aligned).
  function playEnding(id) {
    let slides = null;
    const fn = ENDINGS.get(id) || ENDINGS.get("default");
    if (fn) slides = safe("ending:" + id, fn);
    // slides: [{title, text, art}]
    if (!slides || !slides.length)
      slides = [
        {
          title: "THE END",
          text: "The sirens stopped in 1967. The city never did.",
          art: "skyline",
        },
      ];
    setFlag("ending_played", id);
    G.events.emit("ending", slides, id);
    if (G.isStub("hud")) fallbackSlideshow(slides);
    return slides;
  }
  /** Minimal slideshow used only when ui_hud is absent. */
  function fallbackSlideshow(slides) {
    const el = document.createElement("div");
    el.style.cssText =
      'position:fixed;inset:0;background:#000;color:#d8c9a0;z-index:950;display:flex;flex-direction:column;align-items:center;justify-content:center;font:20px/1.5 "Special Elite","Courier New",monospace;padding:10vh 15vw;text-align:center;cursor:pointer';
    document.body.appendChild(el);
    let i = 0;
    const show = () => {
      if (i >= slides.length) {
        el.remove();
        return;
      }
      el.innerHTML =
        '<div style="font-size:30px;letter-spacing:4px;margin-bottom:28px">' +
        slides[i].title +
        "</div><div>" +
        slides[i].text +
        '</div><div style="margin-top:40px;font-size:13px;opacity:.6">[click to continue]</div>';
      i++;
    };
    el.onclick = show;
    show();
  }

  // ------------------------------------------------------------------
  // The content library (G.quests.lib)
  // ------------------------------------------------------------------
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
