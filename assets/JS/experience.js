// Count both the starting month and the current month in Vietnam.
(() => {
  const labels = document.querySelectorAll("[data-experience-start]");
  if (!labels.length) return;

  function updateExperienceDuration() {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "numeric"
    }).formatToParts(new Date());
    const year = Number(parts.find(part => part.type === "year").value);
    const month = Number(parts.find(part => part.type === "month").value);

    labels.forEach(label => {
      const start = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(label.dataset.experienceStart);
      if (!start) return;
      const months = Math.max(0, (year - Number(start[1])) * 12 + month - Number(start[2]) + 1);
      const unit = window.portfolioI18n?.language === "vi" ? "tháng" : (months === 1 ? "month" : "months");
      label.textContent = ` · ${months} ${unit}`;
    });
  }

  updateExperienceDuration();
  document.addEventListener("languagechange", updateExperienceDuration);
  window.setInterval(updateExperienceDuration, 60000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateExperienceDuration();
  });
})();
