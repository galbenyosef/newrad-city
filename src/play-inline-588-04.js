// play-inline-588 04 — the
// Lines 1357-1370 of readable/play-inline-588.pretty.js (statement-aligned).
  K.sunDress = function () {
    const S = K.sun;
    if (!S || !S.lamp) return;
    const st = K.ms("second_sun"); // 'disarmed' | 'walled' | 'risen'
    const dark = st === "disarmed" || st === "walled" || st === "risen";
    S.lamp.material.color.setHex(dark ? 0x201810 : 0xffa020);
    if (S.lampPts) S.lampPts.visible = !dark;
    if (S.wall) S.wall.visible = st === "walled";
    // the battery is here when the cult took it (Eli defended Rose's roof in mq32), else the converter tap feeds the set
    const batteryHere = !K.ms("rose_captive") && !K.ms("battery_pulled");
    if (S.battery) S.battery.visible = batteryHere;
    if (S.tap) S.tap.visible = !batteryHere;
    if (S.lever) S.lever.rotation.x = K.ms("breaker_tripped") ? -1.2 : 0;
  };
