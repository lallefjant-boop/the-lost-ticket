// The Lost Ticket download page. No tracking, no network requests: this only
// picks the right download for your computer and shows the matching steps.
(function () {
  "use strict";

  // Edit these if the files are hosted elsewhere (e.g. GitHub Releases).
  var DOWNLOADS = {
    mac: { href: "https://github.com/lallefjant-boop/the-lost-ticket/releases/download/v1.2.5/TheLostTicket-mac.dmg", label: "Download for Mac", sub: "Free · 75 MB · macOS 11 or newer" },
    win: { href: "https://github.com/lallefjant-boop/the-lost-ticket/releases/download/v1.2.5/TheLostTicket-windows.exe", label: "Download for Windows", sub: "Free · 115 MB · Windows 10/11 64-bit" }
  };

  function detectOS() {
    var uaData = navigator.userAgentData;
    var platform = (uaData && uaData.platform) || navigator.platform || "";
    var ua = navigator.userAgent || "";
    var touchMac = /Mac/i.test(platform) && navigator.maxTouchPoints > 1; // iPadOS reports "MacIntel"
    if (/Android|iPhone|iPad|iPod/i.test(ua) || touchMac || (uaData && uaData.mobile)) return "mobile";
    if (/Win/i.test(platform) || /Windows/i.test(ua)) return "win";
    if (/Mac/i.test(platform) || /Mac OS X/i.test(ua)) return "mac";
    return "other";
  }

  function $(id) { return document.getElementById(id); }

  function selectTab(os) {
    var mac = os !== "win";
    $("tab-mac").setAttribute("aria-selected", mac ? "true" : "false");
    $("tab-win").setAttribute("aria-selected", mac ? "false" : "true");
    $("steps-mac").hidden = !mac;
    $("steps-win").hidden = mac;
  }

  function started(os) {
    selectTab(os);
    var s = $("started");
    s.hidden = false;
    window.setTimeout(function () { s.scrollIntoView({ block: "start" }); }, 150);
  }

  var os = detectOS();
  var main = $("dl-main");
  $("dl-mac").href = DOWNLOADS.mac.href;
  $("dl-win").href = DOWNLOADS.win.href;

  if (os === "mac" || os === "win") {
    var d = DOWNLOADS[os];
    main.href = d.href;
    $("dl-main-label").textContent = d.label;
    $("dl-main-sub").textContent = d.sub;
    selectTab(os);
  } else if (os === "mobile") {
    main.hidden = true;
    $("mobile-note").hidden = false;
  } else {
    // Linux or unknown: offer both explicitly.
    main.href = DOWNLOADS.win.href;
    $("dl-main-label").textContent = "Download for Windows";
    $("dl-main-sub").textContent = "Mac link below · no Linux build yet";
  }

  main.addEventListener("click", function () { started(os === "win" ? "win" : "mac"); });
  $("dl-mac").addEventListener("click", function () { started("mac"); });
  $("dl-win").addEventListener("click", function () { started("win"); });
  $("tab-mac").addEventListener("click", function () { selectTab("mac"); });
  $("tab-win").addEventListener("click", function () { selectTab("win"); });
})();
