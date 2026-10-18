(function initializeInvitation() {
  const config = weddingConfig;
  const strings = config.strings;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const englishOpening = document.body.classList.contains("opening-page") && config.groomNameEnglish;
  const displayGroomName = englishOpening ? config.groomNameEnglish : config.groomName;
  const displayBrideName = englishOpening ? config.brideNameEnglish : config.brideName;
  document.documentElement.lang = englishOpening ? "en" : config.language;
  document.querySelectorAll("[data-config]").forEach((element) => {
    const key = element.dataset.config;
    if (config[key] !== undefined) element.textContent = config[key];
  });
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const key = element.dataset.copy;
    if (strings[key] !== undefined) element.textContent = strings[key];
  });
  document.querySelectorAll("[data-image]").forEach((image) => {
    const key = image.dataset.image;
    if (!config[key]) return;
    image.src = config[key];
    image.alt = config[key + "Alt"] || "";
  });
  document.querySelectorAll("[data-href]").forEach((link) => {
    const key = link.dataset.href;
    if (config[key]) link.href = config[key];
  });
  const sceneImage = document.querySelector(".scene-image");
  if (sceneImage && config.backgroundImage) {
    sceneImage.style.setProperty("--configured-scene-image", `url("${new URL(config.backgroundImage, location.href).href}")`);
  }

  const weddingDate = new Date(config.weddingDate);
  let formattedWeddingDate = "";
  let dateComponents = {};
  if (!Number.isNaN(weddingDate.getTime())) {
    const dateParts = new Intl.DateTimeFormat(config.dateLocale, {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).formatToParts(weddingDate);
    dateComponents = Object.fromEntries(dateParts.map((part) => [part.type, part.value]));
    document.querySelectorAll('[data-date="day"]').forEach((element) => { element.textContent = dateComponents.day; });
    document.querySelectorAll('[data-date="month"]').forEach((element) => { element.textContent = dateComponents.month; });
    document.querySelectorAll('[data-date="year"]').forEach((element) => { element.textContent = dateComponents.year; });
  }
  formattedWeddingDate = [dateComponents.day, dateComponents.month, dateComponents.year].filter(Boolean).join(" ");
  document.querySelectorAll('[data-copy="countdownEyebrow"]').forEach((element) => {
    const dateLabel = config.language === "en" ? formattedWeddingDate.toLocaleUpperCase(config.dateLocale) : formattedWeddingDate;
    const cityLabel = config.language === "en" ? config.city.toLocaleUpperCase(config.dateLocale) : config.city;
    element.textContent = dateLabel + " · " + cityLabel;
  });

  document.title = displayGroomName + " ♥ " + displayBrideName + " — " + (englishOpening ? (strings.openingTitle || strings.eventTitle) : strings.eventTitle);
  const description = strings.whatsappIntro + " " + formattedWeddingDate + " · " + config.city + ".";
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", new URL(config.coupleImage, location.href).href);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", location.href);

  const openingLink = document.querySelector(".open-button");
  if (openingLink) {
    openingLink.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      try { sessionStorage.setItem("weddingMusicRequested", "yes"); } catch (_) {}
      document.body.classList.add("is-opening");
      const delay = reducedMotion ? 0 : 650;
      window.setTimeout(() => { window.location.href = openingLink.href; }, delay);
    });
  }

  const audio = document.getElementById("weddingMusic");
  const musicButton = document.getElementById("musicToggle");
  if (audio && musicButton && config.music) {
    audio.src = config.music;
    musicButton.hidden = false;
    const updateMusicButton = () => {
      const label = audio.paused ? strings.playMusic : strings.pauseMusic;
      musicButton.setAttribute("aria-label", label);
      musicButton.title = label;
      musicButton.classList.toggle("is-playing", !audio.paused);
    };
    audio.addEventListener("play", updateMusicButton);
    audio.addEventListener("pause", updateMusicButton);
    audio.addEventListener("error", () => {
      musicButton.disabled = true;
      musicButton.title = strings.playMusic;
      musicButton.setAttribute("aria-label", strings.playMusic);
      musicButton.classList.add("music-unavailable");
    });
    musicButton.addEventListener("click", async () => {
      if (audio.paused) {
        try { await audio.play(); } catch (_) { musicButton.classList.add("music-unavailable"); }
      } else {
        audio.pause();
      }
    });
    updateMusicButton();
    let shouldStartMusic = false;
    try {
      shouldStartMusic = sessionStorage.getItem("weddingMusicRequested") === "yes";
      sessionStorage.removeItem("weddingMusicRequested");
    } catch (_) {}
    if (shouldStartMusic) audio.play().catch(() => {});
  }

  const saveDateButton = document.getElementById("saveDateButton");
  if (saveDateButton) {
    saveDateButton.addEventListener("click", () => {
      const dateParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
      }).formatToParts(weddingDate);
      const parts = Object.fromEntries(dateParts.map((part) => [part.type, part.value]));
      const startDate = parts.year + parts.month + parts.day;
      const nextDate = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + 1));
      const endDate = nextDate.toISOString().slice(0, 10).replaceAll("-", "");
      const escapeCalendarText = (value) => String(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
      const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const eventTitle = config.groomName + " & " + config.brideName + " " + strings.eventTitle;
      const location = config.venueName + ", " + config.venueAddress;
      const calendar = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT", "UID:wedding-" + Date.now() + "@invitation", "DTSTAMP:" + timestamp,
        "DTSTART;VALUE=DATE:" + startDate, "DTEND;VALUE=DATE:" + endDate,
        "SUMMARY:" + escapeCalendarText(eventTitle), "LOCATION:" + escapeCalendarText(location),
        "DESCRIPTION:" + escapeCalendarText(config.city), "END:VEVENT", "END:VCALENDAR"
      ].join("\r\n");
      const file = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
      const download = document.createElement("a");
      download.href = URL.createObjectURL(file);
      download.download = "wedding-invitation.ics";
      document.body.appendChild(download);
      download.click();
      download.remove();
      window.setTimeout(() => URL.revokeObjectURL(download.href), 1000);
    });
  }

  const shareButton = document.getElementById("shareButton");
  if (shareButton) {
    const message = [
      strings.whatsappIntro,
      "",
      config.groomName + " & " + config.brideName,
        formattedWeddingDate,
        config.city,
      "",
      strings.whatsappClosing,
      location.href
    ].join("\n");
    shareButton.href = "https://wa.me/?text=" + encodeURIComponent(message);
  }

  if ("IntersectionObserver" in window && !reducedMotion) {
    document.body.classList.add("has-reveal");
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  }

  if (typeof startWeddingCountdown === "function") startWeddingCountdown();
})();
