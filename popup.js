document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["usage"], (res) => {
    const stats = document.getElementById("stats");

    if (!res.usage) {
      stats.innerHTML = "<li>No data yet</li>";
      return;
    }

    for (let site in res.usage) {
      const mins = Math.round(res.usage[site] / 60000);
      const li = document.createElement("li");
      li.textContent = `${site} - ${mins} min`;
      stats.appendChild(li);
    }
  });
});
