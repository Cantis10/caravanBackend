document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".account-tab");
  const panels = {
    customer: document.getElementById("panelCustomer"),
    admin: document.getElementById("panelAdmin"),
  };
  const summaryLine1 = document.getElementById("accountsSummaryLine1");
  const searchInput = document.getElementById("accountSearchInput");
  const inviteBtn = document.getElementById("inviteUserBtn");

  const summaryByTab = {
    customer: "Number of employee accounts: 15",
    admin: "Number of Admin accounts: 5",
  };

  const searchPlaceholderByTab = {
    customer: "Search for a customer",
    admin: "Search for an Employee",
  };

  function setActiveTab(tabName) {
    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.tab === tabName);
    });
    Object.entries(panels).forEach(([name, panel]) => {
      panel.classList.toggle("is-active", name === tabName);
    });

    summaryLine1.textContent = summaryByTab[tabName];
    searchInput.placeholder = searchPlaceholderByTab[tabName];
    searchInput.value = "";
    filterRows(tabName, "");
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
  });

  function filterRows(tabName, query) {
    const body = document.getElementById(
      tabName === "customer" ? "customerBody" : "adminBody"
    );
    const rows = body.querySelectorAll("tr");
    const term = query.trim().toLowerCase();

    rows.forEach((row) => {
      const matches = row.textContent.toLowerCase().includes(term);
      row.style.display = matches ? "" : "none";
    });
  }

  searchInput.addEventListener("input", (e) => {
    const activeTab = document.querySelector(".account-tab.is-active").dataset.tab;
    filterRows(activeTab, e.target.value);
  });

  inviteBtn.addEventListener("click", () => {
    console.log("Invite User clicked");
  });

  // Row actions: view / edit / suspend / activate / message
  document.querySelectorAll(".products-table tbody").forEach((body) => {
    body.addEventListener("click", (e) => {
      const actionLink = e.target.closest("a");
      if (!actionLink) return;
      e.preventDefault();

      const row = actionLink.closest("tr");
      const name = row.querySelector(".name-text").textContent.trim();

      if (actionLink.classList.contains("action-view")) {
        console.log("View account:", name);
      } else if (actionLink.classList.contains("action-edit")) {
        console.log("Edit account:", name);
      } else if (actionLink.classList.contains("action-suspend")) {
        const confirmed = confirm(`Suspend ${name}?`);
        if (confirmed) {
          suspendRow(row, name);
        }
      } else if (actionLink.classList.contains("action-activate")) {
        activateRow(row, name);
      } else if (actionLink.classList.contains("action-message")) {
        console.log("Message account:", name);
      }
    });
  });

  function suspendRow(row, name) {
    const statusPill = row.querySelector(".pill.status-active, .pill.status-pending");
    if (statusPill) {
      statusPill.textContent = "Suspended";
      statusPill.className = "pill status-suspended";
    }
    row.dataset.status = "suspended";

    const actions = row.querySelector(".account-actions");
    const suspendLink = actions.querySelector(".action-suspend");
    if (suspendLink) {
      suspendLink.classList.remove("action-suspend");
      suspendLink.classList.add("action-activate");
      suspendLink.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none"><path d="M6 12h9m0 0-3.5-3.5M15 12l-3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Activate';
    }
    console.log("Suspended:", name);
  }

  function activateRow(row, name) {
    const statusPill = row.querySelector(".pill.status-suspended");
    if (statusPill) {
      statusPill.textContent = "Active";
      statusPill.className = "pill status-active";
    }
    row.dataset.status = "active";

    const actions = row.querySelector(".account-actions");
    const activateLink = actions.querySelector(".action-activate");
    if (activateLink) {
      activateLink.classList.remove("action-activate");
      activateLink.classList.add("action-suspend");
      activateLink.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M12 8v5M12 16.3v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Suspend';
    }
    console.log("Activated:", name);
  }
});