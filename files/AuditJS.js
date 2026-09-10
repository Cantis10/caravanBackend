document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll("#actionTabs .tab");
  const rows = document.querySelectorAll("#logList .log-row");
  const searchInput = document.getElementById("logSearch");
  const exportBtn = document.getElementById("exportBtn");
  const sortBtn = document.getElementById("sortBtn");

  function applyFilters() {
    const activeTab = document.querySelector("#actionTabs .tab.is-active");
    const filter = activeTab ? activeTab.dataset.filter : "all";
    const query = searchInput.value.trim().toLowerCase();

    rows.forEach((row) => {
      const matchesFilter = filter === "all" || row.dataset.type === filter;
      const matchesSearch = !query || row.querySelector(".log-text").textContent.toLowerCase().includes(query);
      row.style.display = matchesFilter && matchesSearch ? "" : "none";
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      console.log("Export audit log clicked");
    });
  }

  if (sortBtn) {
    sortBtn.addEventListener("click", () => {
      console.log("Sort menu clicked");
    });
  }
});