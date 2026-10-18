function startWeddingCountdown() {
  const targetTime = new Date(weddingConfig.weddingDate).getTime();
  const values = {
    days: document.getElementById("countDays"),
    hours: document.getElementById("countHours"),
    minutes: document.getElementById("countMinutes"),
    seconds: document.getElementById("countSeconds")
  };
  const todayMessage = document.getElementById("todayMessage");
  if (!values.days || Number.isNaN(targetTime)) return;

  let timer;
  function update() {
    const remaining = Math.max(0, targetTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const nextValues = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };

    Object.keys(nextValues).forEach((unit) => {
      const value = String(nextValues[unit]).padStart(2, "0");
      if (values[unit].textContent !== value) {
        values[unit].textContent = value;
        values[unit].classList.remove("count-tick");
        void values[unit].offsetWidth;
        values[unit].classList.add("count-tick");
      }
    });
    if (remaining === 0) {
      if (todayMessage) todayMessage.hidden = false;
      if (timer) window.clearInterval(timer);
    }
  }

  update();
  timer = window.setInterval(update, 1000);
}
