document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("reportsSearch");
  const rows = document.querySelectorAll("#reportsBody tr");
  const categoryFilterBtn = document.getElementById("categoryFilterBtn");
  const exportBtn = document.getElementById("exportBtn");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    rows.forEach((row) => {
      const orderId = row.children[0].textContent.toLowerCase();
      const customerId = row.children[1].textContent.toLowerCase();
      const matches = orderId.includes(query) || customerId.includes(query);
      row.style.display = matches ? "" : "none";
    });
  });

  categoryFilterBtn.addEventListener("click", () => {
    console.log("Category Filter hasn't been built yet.");
  });

  exportBtn.addEventListener("click", () => {
    console.log("Export hasn't been built yet.");
  });

  document.querySelectorAll(".action-return").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const orderId = link.closest("tr").querySelector(".mono.strong").textContent;
      console.log(`Return requested for order ${orderId}`);
    });
  });

  document.querySelectorAll(".action-refund").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const orderId = link.closest("tr").querySelector(".mono.strong").textContent;
      console.log(`Refund requested for order ${orderId}`);
    });
  });

  prevPageBtn.addEventListener("click", () => {
    console.log("Previous page hasn't been built yet.");
  });

  nextPageBtn.addEventListener("click", () => {
    console.log("Next page hasn't been built yet.");
  });
});