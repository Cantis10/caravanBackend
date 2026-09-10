document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const bellBtn = document.getElementById("bellBtn");
  const bellDot = document.getElementById("bellDot");
  const signOutBtn = document.getElementById("signOutBtn");

  if (bellDot) bellDot.classList.add("show");

  const currentPage = location.pathname.split("/").pop() || "dashboard.html";
  navLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === currentPage;
    link.classList.toggle("is-active", isCurrent);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
        console.log(`${link.dataset.page} hasn't been built yet.`);
      }
    });
  });

  if (bellBtn && bellDot) {
    bellBtn.addEventListener("click", () => {
      bellDot.classList.remove("show");
    });
  }

  document.querySelectorAll(".see-more").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("See more clicked:", link.closest(".concern-row").querySelector("p").textContent);
    });
  });

  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      const confirmed = confirm("Are you sure you want to sign out?");
      if (confirmed) {
        console.log("Signed out");
      }
    });
  }
});