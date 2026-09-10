document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const rows = document.querySelectorAll("#contentBody tr");
  const addContentBtn = document.getElementById("addContentBtn");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      const filter = tab.dataset.filter;
      rows.forEach((row) => {
        const show = filter === "all" || row.dataset.type === filter;
        row.style.display = show ? "" : "none";
      });
    });
  });

  document.querySelectorAll('[data-action="unpublish"], [data-action="publish"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const row = link.closest("tr");
      const pill = row.querySelector(".status-pill");
      const isUnpublish = link.dataset.action === "unpublish";

      pill.textContent = isUnpublish ? "Unpublished" : "Published";
      pill.classList.remove("status-published", "status-unpublished");
      pill.classList.add(isUnpublish ? "status-unpublished" : "status-published");

      link.dataset.action = isUnpublish ? "publish" : "unpublish";
      link.classList.toggle("action-unpublish", !isUnpublish);
      link.classList.toggle("action-publish", isUnpublish);
      link.childNodes[0].textContent = isUnpublish ? "Publish" : "Unpublish";
    });
  });

  document.querySelectorAll('[data-action="view"], [data-action="edit"], [data-action="delete"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      console.log(`${link.dataset.action} clicked for content row`);
    });
  });

  if (addContentBtn) {
    addContentBtn.addEventListener("click", () => {
      console.log("Add content clicked");
    });
  }
});