document.addEventListener("DOMContentLoaded", () => {
  const filterPills = document.querySelectorAll(".filter-pill");
  const rows = document.querySelectorAll("#stockBody tr");
  const searchInput = document.getElementById("stockSearch");
  const exportBtn = document.getElementById("exportBtn");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  function applyFilters() {
    const activeFilter = document.querySelector(".filter-pill.is-active").dataset.filter;
    const query = searchInput.value.trim().toLowerCase();

    rows.forEach((row) => {
      const matchesFilter = activeFilter === "all" || row.dataset.status === activeFilter;
      const matchesQuery = row.children[1].textContent.toLowerCase().includes(query);
      row.style.display = matchesFilter && matchesQuery ? "" : "none";
    });
  }

  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      applyFilters();
    });
  });

  searchInput.addEventListener("input", applyFilters);

  exportBtn.addEventListener("click", () => {
    console.log("Export hasn't been built yet.");
  });

  document.querySelectorAll(".action-adjust").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = link.closest("tr").querySelector(".mono").textContent;
      console.log(`Adjust Stocks requested for ${productId}`);
    });
  });

  document.querySelectorAll(".row-actions .action-edit").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = link.closest("tr").querySelector(".mono").textContent;
      console.log(`Order Stocks requested for ${productId}`);
    });
  });

  document.querySelectorAll(".row-actions .action-delete").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = link.closest("tr").querySelector(".mono").textContent;
      console.log(`Log a return requested for ${productId}`);
    });
  });

  prevPageBtn.addEventListener("click", () => {
    console.log("Previous page hasn't been built yet.");
  });

  nextPageBtn.addEventListener("click", () => {
    console.log("Next page hasn't been built yet.");
  });
});