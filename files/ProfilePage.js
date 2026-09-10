document.addEventListener("DOMContentLoaded", () => {
  // Sidebar Tab Navigation
  const menuItems = document.querySelectorAll(".menu-item");
  const tabPanes = document.querySelectorAll(".tab-pane");

  menuItems.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      menuItems.forEach((btn) => btn.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      button.classList.add("active");
      const selectedPane = document.getElementById(targetTab);
      if (selectedPane) {
        selectedPane.classList.add("active");
      }
    });
  });

  // Modal Handlers
  const addressModal = document.getElementById("addressModal");
  const openAddressBtn = document.getElementById("openAddressModalBtn");
  const closeAddressBtn = document.getElementById("closeAddressModal");

  const cardModal = document.getElementById("cardModal");
  const openCardBtn = document.getElementById("openCardModalBtn");
  const closeCardBtn = document.getElementById("closeCardModal");

  if (openAddressBtn) openAddressBtn.addEventListener("click", () => addressModal.classList.add("active"));
  if (closeAddressBtn) closeAddressBtn.addEventListener("click", () => addressModal.classList.remove("active"));

  if (openCardBtn) openCardBtn.addEventListener("click", () => cardModal.classList.add("active"));
  if (closeCardBtn) closeCardBtn.addEventListener("click", () => cardModal.classList.remove("active"));

  window.addEventListener("click", (e) => {
    if (e.target === addressModal) addressModal.classList.remove("active");
    if (e.target === cardModal) cardModal.classList.remove("active");
  });

  // Dynamic Address Form Submission
  const addressForm = document.getElementById("addressForm");
  const addressListContainer = document.getElementById("addressListContainer");

  if (addressForm) {
    addressForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName").value;
      const phoneNumber = document.getElementById("phoneNumber").value;
      const streetAddress = document.getElementById("streetAddress").value;
      const city = document.getElementById("city").value;
      const zipCode = document.getElementById("zipCode").value;

      const card = document.createElement("div");
      card.className = "radius-10-box readonly-box";
      card.innerHTML = `
        <strong>${fullName} | ${phoneNumber}</strong><br>
        <span style="color:#666;">${streetAddress}, ${city}, ${zipCode}</span>
      `;

      addressListContainer.appendChild(card);
      addressForm.reset();
      addressModal.classList.remove("active");
    });
  }

  // Dynamic Card Form Submission
  const cardForm = document.getElementById("cardForm");
  const paymentListContainer = document.getElementById("paymentListContainer");

  if (cardForm) {
    cardForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const cardHolder = document.getElementById("cardHolder").value;
      const cardNumber = document.getElementById("cardNumber").value;
      const expiryDate = document.getElementById("expiryDate").value;

      const lastFour = cardNumber.slice(-4) || "0000";

      const card = document.createElement("div");
      card.className = "radius-10-box readonly-box";
      card.innerHTML = `
        <strong>${cardHolder} | **** **** **** ${lastFour}</strong><br>
        <span style="color:#666;">Expires: ${expiryDate}</span>
      `;

      paymentListContainer.appendChild(card);
      cardForm.reset();
      cardModal.classList.remove("active");
    });
  }
});