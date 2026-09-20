document.addEventListener("DOMContentLoaded", () => {
  // Calls loadProfile function
  loadProfile();

  // Sidebar Tab Navigation
  const menuItems = document.querySelectorAll(".menu-item");
  const tabPanes = document.querySelectorAll(".tab-pane");

  const profileFields = [
      document.getElementById("userEmail"),
      document.getElementById("userBirthdate"),
      document.getElementById("userFirstName"),
      document.getElementById("userLastName"),
      document.getElementById("userPassword")
  ];

  const editBtn = document.getElementById("editProfileBtn");
  const saveBtn = document.getElementById("saveProfileBtn");
  const cancelBtn = document.getElementById("cancelProfileBtn");

  let originalValues = {};

  function hasChanges() {
    return profileFields.some(field =>
        field.value !== (originalValues[field.id] || "")
    );
  }

  function updateSaveButtonState() {
      saveBtn.disabled = !hasChanges();

      if (saveBtn.disabled) {
          saveBtn.style.opacity = "0.5";
          saveBtn.style.cursor = "not-allowed";
      } else {
          saveBtn.style.opacity = "1";
          saveBtn.style.cursor = "pointer";
      }
  }

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

  // get items from db and insert in profile page
  async function loadProfile() {
      try {

          const response = await fetch("/api/profile");

          if (!response.ok) {
              console.error("Failed to load profile:", response.status);
              return;
          }

          const data = await response.json();

          console.log("Profile information:", data);

          document.getElementById("userEmail").value =
              data.email || "";

          document.getElementById("userFirstName").value =
              data.firstName || "";

          document.getElementById("userLastName").value =
              data.lastName || "";

          document.getElementById("userBirthdate").value =
              data.birthdate || "";

          document.querySelector(".user-name").textContent =
              `${data.firstName || ""} ${data.lastName || ""}`.trim();

      } catch (error) {

          console.error("Error loading profile:", error);

      }
  }

  editBtn.addEventListener("click", () => {

      profileFields.forEach(field => {
          originalValues[field.id] = field.value;
          field.removeAttribute("readonly");

          field.addEventListener("input", updateSaveButtonState);
      });

      editBtn.style.display = "none";
      saveBtn.style.display = "inline-block";
      cancelBtn.style.display = "inline-block";

      updateSaveButtonState();
  });

  cancelBtn.addEventListener("click", () => {

    profileFields.forEach(field => {
        field.value = originalValues[field.id];
        field.setAttribute("readonly", true);
    });

    editBtn.style.display = "inline-block";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";
  });

  const saveModal = document.getElementById("saveProfileModal");

  const confirmSaveBtn = document.getElementById("confirmSaveBtn");

  const cancelSaveBtn = document.getElementById("cancelSaveBtn");

  saveBtn.addEventListener("click", () => {

      if (!hasChanges()) {
        return;
      }

      saveModal.classList.add("active");
  });


  // Saves the user changes to profile
  confirmSaveBtn.addEventListener("click", async () => {

      if (confirmSaveBtn.disabled) {
          return;
      }

      confirmSaveBtn.disabled = true;
      confirmSaveBtn.textContent = "Saving...";

      const payload = {
          email: document.getElementById("userEmail").value,
          birthdate: document.getElementById("userBirthdate").value,
          firstName: document.getElementById("userFirstName").value,
          lastName: document.getElementById("userLastName").value,
          password: document.getElementById("userPassword").value
      };

      console.log("Saving profile...", payload);
      
      //PUTS new items inside db (replacing old)
      try {
          const response = await fetch("/api/profile", {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
          });

          const result = await response.json();

          console.log(result);

          if (!response.ok) {
              throw new Error(result.message || "Save failed");
          }

      } catch (err) {
          console.error("Save error:", err);

          confirmSaveBtn.disabled = false;
          confirmSaveBtn.textContent = "Save";

          alert("Failed to save profile.");
          return;
      }


      profileFields.forEach(field => {
          field.setAttribute("readonly", true);
      });

      editBtn.style.display = "inline-block";
      saveBtn.style.display = "none";
      cancelBtn.style.display = "none";

      saveModal.classList.remove("active");

      alert("Profile updated successfully.");

      profileFields.forEach(field => {
          originalValues[field.id] = field.value;
      });

      confirmSaveBtn.disabled = false;
      confirmSaveBtn.textContent = "Save";

      saveBtn.disabled = true;
      saveBtn.style.opacity = "0.5";
      saveBtn.style.cursor = "not-allowed";
  });

  cancelSaveBtn.addEventListener("click", () => {

    saveModal.classList.remove("active");

  });

  //logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      window.location.href = "/login";
    });
  }

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
    if (e.target === saveModal) saveModal.classList.remove("active");
    
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