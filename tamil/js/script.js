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
  if (config.backgroundImage) {
    const backgroundImage = `url("${new URL(config.backgroundImage, location.href).href}")`;
    document.documentElement.style.setProperty("--configured-scene-image", backgroundImage);
    if (sceneImage) sceneImage.style.setProperty("--configured-scene-image", backgroundImage);
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
      const formatConfiguredDate = (dateValue, options) => {
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return "";
        return new Intl.DateTimeFormat(config.dateLocale, {
          timeZone: "Asia/Kolkata", day: "numeric", month: "long", ...options
        }).format(date);
      };
      const formattedReceptionDate = formatConfiguredDate(config.receptionDate);
      document.querySelectorAll("[data-event-date]").forEach((element) => {
        const dateValue = config[element.dataset.eventDate];
        element.textContent = formatConfiguredDate(dateValue);
      });
    const openingDate = document.querySelector('[data-copy="openingDate"]');
    if (openingDate && !Number.isNaN(weddingDate.getTime())) {
      openingDate.textContent = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric"
      }).format(weddingDate).toLocaleUpperCase("en-IN");
    }
  document.querySelectorAll('[data-copy="countdownEyebrow"]').forEach((element) => {
    const dateLabel = config.language === "en" ? formattedWeddingDate.toLocaleUpperCase(config.dateLocale) : formattedWeddingDate;
    const cityLabel = config.language === "en" ? config.city.toLocaleUpperCase(config.dateLocale) : config.city;
    element.textContent = dateLabel + " · " + cityLabel;
  });

  document.title = displayGroomName + " ♥ " + displayBrideName + " — " + (englishOpening ? (strings.openingTitle || strings.eventTitle) : strings.eventTitle);
  const description = strings.whatsappIntro + " " + formattedWeddingDate + " · " + strings.weddingTime + " · " + config.city + ".";
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
      const escapeCalendarText = (value) => String(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
      const toCalendarTimestamp = (dateValue) => new Date(dateValue).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const toCalendarDate = (dateValue) => {
        const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
        }).formatToParts(new Date(dateValue)).map((part) => [part.type, part.value]));
        return { stamp: parts.year + parts.month + parts.day, parts };
      };
      const reception = toCalendarDate(config.receptionDate);
      const nextReceptionDay = new Date(Date.UTC(
        Number(reception.parts.year), Number(reception.parts.month) - 1, Number(reception.parts.day) + 1
      )).toISOString().slice(0, 10).replaceAll("-", "");
      const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const location = config.venueName + ", " + config.venueAddress;
      const coupleName = config.groomName + " & " + config.brideName;
      const weddingEvent = [
        "BEGIN:VEVENT", "UID:wedding-" + Date.now() + "@invitation", "DTSTAMP:" + stamp,
        "DTSTART:" + toCalendarTimestamp(config.weddingDate), "DTEND:" + toCalendarTimestamp(config.weddingEndDate),
        "SUMMARY:" + escapeCalendarText(coupleName + " " + strings.weddingCalendarLabel),
        "LOCATION:" + escapeCalendarText(location), "DESCRIPTION:" + escapeCalendarText(config.city), "END:VEVENT"
      ];
      const receptionEvent = [
        "BEGIN:VEVENT", "UID:reception-" + Date.now() + "@invitation", "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + reception.stamp, "DTEND;VALUE=DATE:" + nextReceptionDay,
        "SUMMARY:" + escapeCalendarText(coupleName + " " + strings.receptionCalendarLabel),
        "LOCATION:" + escapeCalendarText(location), "DESCRIPTION:" + escapeCalendarText(strings.receptionTime), "END:VEVENT"
      ];
      const calendar = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN", "CALSCALE:GREGORIAN",
        ...weddingEvent, ...receptionEvent, "END:VCALENDAR"
      ].join("\r\n");
      const file = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
      const download = document.createElement("a");
      download.href = URL.createObjectURL(file);
      download.download = "wedding-and-reception.ics";
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
        formattedWeddingDate + " · " + strings.weddingTime,
        strings.whatsappReceptionIntro + " · " + formattedReceptionDate + " · " + strings.receptionTime,
        config.city,
      "",
      strings.whatsappClosing,
      location.href
    ].join("\n");
    shareButton.href = "https://wa.me/?text=" + encodeURIComponent(message);
  }

  const heartRain = document.querySelector(".heart-rain");
  if (heartRain && !reducedMotion) {
    const hearts = document.createDocumentFragment();
    for (let index = 0; index < 16; index += 1) {
      const heart = document.createElement("span");
      heart.textContent = "♥";
      heart.style.left = `${(index * 37) % 100}%`;
      heart.style.setProperty("--fall-duration", `${14 + (index % 5) * 2}s`);
      heart.style.setProperty("--fall-delay", `${-(index * 1.7)}s`);
      heart.style.fontSize = `${8 + (index % 4) * 2}px`;
      hearts.append(heart);
    }
    heartRain.append(hearts);
  }

  if ("IntersectionObserver" in window && !reducedMotion) {
    const segmenter = typeof Intl.Segmenter === "function"
      ? new Intl.Segmenter(config.language, { granularity: "grapheme" })
      : null;
    const animatedText = document.querySelectorAll(
      ".date-content .eyebrow > span:nth-child(2), .date-content .couple-names > span, .date-content .date-line > span, .date-content .city-line, .love-note, .venue-inner h2, .venue-inner .venue-name, .venue-inner .venue-address, .countdown-inner h2"
    );
    animatedText.forEach((element) => {
      const originalText = element.textContent;
      if (!originalText.trim() || (!segmenter && config.language !== "en")) return;
      const parts = segmenter
        ? Array.from(segmenter.segment(originalText), (part) => part.segment)
        : Array.from(originalText);
      const letters = document.createDocumentFragment();
      let letterIndex = 0;
      parts.forEach((part) => {
        if (part === "\n") {
          const lineBreak = document.createElement("br");
          lineBreak.setAttribute("aria-hidden", "true");
          letters.append(lineBreak);
          return;
        }
        const letter = document.createElement("span");
        letter.className = part.trim() ? "letter" : "letter-space";
        letter.setAttribute("aria-hidden", "true");
        letter.textContent = part;
        if (part.trim()) letter.style.setProperty("--letter-index", letterIndex++);
        letters.append(letter);
      });
      element.setAttribute("aria-label", originalText);
      element.dataset.letterReveal = "";
      element.replaceChildren(letters);
    });
    document.body.classList.add("has-reveal");
    const revealTargets = Array.from(document.querySelectorAll(".reveal"));
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealTargets.forEach((element) => observer.observe(element));
    const revealVisibleInViewport = () => {
      revealTargets.forEach((element) => {
        if (element.classList.contains("is-visible")) return;
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight * 0.95 && bounds.bottom > 0) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      });
    };
    window.addEventListener("scroll", revealVisibleInViewport, { passive: true });
    window.addEventListener("resize", revealVisibleInViewport);
    revealVisibleInViewport();
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  }

  if (typeof startWeddingCountdown === "function") startWeddingCountdown();
})();
