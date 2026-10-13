// play-inline-7 03 — appendchild
// Lines 26-42 of readable/play-inline-7.pretty.js (statement-aligned).
  const el = document.createElement("div");
  el.id = "mobile-notice";
  el.style.cssText =
    "position:fixed;inset:0;z-index:5000;display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    'padding:24px 16px;text-align:center;background:#050b06;color:#ffcc33;font:22px/1.4 "VT323","Courier New",monospace;' +
    "text-shadow:0 0 6px rgba(255,204,51,.5)";
  el.innerHTML =
    '<div style="font-size:40px;letter-spacing:4px;color:#cfeefa;text-shadow:0 0 10px rgba(150,220,240,.6)">' +
    (G.GAME_NAME || "New Rad City").toUpperCase() +
    "</div>" +
    '<div style="margin:22px 0 8px;font-size:32px;letter-spacing:3px">DESKTOP ONLY</div>' +
    '<div style="max-width:520px">This game is played on a desktop or laptop computer with a mouse and keyboard. ' +
    "It doesn't work on phones or tablets.<br><br>Open this page on your computer to play.</div>" +
    '<button type="button" style="margin-top:28px;font:inherit;font-size:18px;color:#ffcc33;background:transparent;' +
    'border:1px solid rgba(255,204,51,.5);padding:6px 14px">Try anyway (not supported)</button>';
  el.querySelector("button").onclick = () => el.remove();
  (document.body || document.documentElement).appendChild(el);
