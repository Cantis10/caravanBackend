let ordersData = [];

function showLoader(show = true) {
    const loader = document.getElementById("loadingOverlay");

    if (!loader) return;

    if (show) {
        loader.classList.add("active");
    } else {
        loader.classList.remove("active");
    }
}

function hideLoader() {
    showLoader(false);
}

document.addEventListener("DOMContentLoaded", () => {
    updateNavbarLogin();
    loadOrders();
});

document.addEventListener("click", async event => {
    if (event.target.classList.contains("track-order-btn")) {
        const orderId = event.target.dataset.orderId;
        openReceiptModal(orderId);
    }
});

document.getElementById("closeReceiptModal")
    .addEventListener("click", () => {
        document.getElementById("receiptModal")
            .classList.remove("active");

    });

// opens refund modal when refund button is clicked
document.getElementById("openRefundModalBtn")
    .addEventListener("click", () => {
        document.getElementById("refundModal")
            .classList.add("active");
    });

// closes refund modal when close button is clicked
document.getElementById("closeRefundModal")
    .addEventListener("click", closeRefundModal);

document.getElementById("cancelRefundBtn")
    .addEventListener("click", closeRefundModal);

function closeRefundModal() {
    document.getElementById("refundModal")
        .classList.remove("active");
}

document.getElementById("refundForm")
    .addEventListener("submit", event => {
        event.preventDefault();
        alert("Refund requests are not available yet.");
            closeRefundModal();
    });

async function loadOrders() {
    const container = document.getElementById("orderHistoryContainer");

    try {
        showLoader();
        const response = await fetch("/orders");
        if (!response.ok) {
            throw new Error(`Failed to load orders: ${response.status}`);
        }

        ordersData = await response.json();
        console.log("Orders:", ordersData);
        container.innerHTML = "";
        if (!ordersData.length) {
            container.innerHTML = `
                <div class="orderhistory-card">
                    <div class="order-card-body">
                        No orders found.
                    </div>
                </div>
            `;

            return;
        }

        ordersData.forEach(order => {
            const card = document.createElement("div");
            card.className = "orderhistory-card";
            card.innerHTML = `
                <div class="order-card-header">
                    <strong>
                        Order #${order.Order_id}
                    </strong>
                    <span>
                        ${new Date(order.Order_date).toLocaleDateString()}
                    </span>
                </div>
                <div class="order-card-body">

                    <div class="order-status">

                        <p>
                            Status:
                            <strong>
                                [${order.Order_status}]
                            </strong>
                        </p>

                        <p>
                            Order Total:
                            ₱${Number(order.Total_cost).toFixed(2)}
                        </p>

                    </div>

                    <div class="order-actions">

                        <button
                            class="track-order-btn"
                            data-order-id="${order.Order_id}"
                        >
                            Track Order
                        </button>

                    </div>

                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {

        console.error("Error loading orders:", error);

        container.innerHTML = `
            <div class="orderhistory-card">
                <div class="order-card-body">
                    Failed to load orders. Please try again.
                </div>
            </div>
        `;

    } finally {
        // Always hide the loader, even if there is an error
        showLoader(false);
    }
}

// shows receipt modal when track order button is clicked
async function openReceiptModal(orderId) {
    const receiptModal = document.getElementById("receiptModal");
    const receiptContent = document.getElementById("receiptContent");

    try {

        showLoader();
        const response = await fetch(`/orders/${orderId}`);
        const orderItems = await response.json();

        hideLoader();

        if (!orderItems.length) {

            receiptContent.innerHTML = `
                <p>No order details found.</p>
            `;

            receiptModal.classList.add("active");
            return;
        }

        const firstOrder = orderItems[0];
        let productsHtml = "";

        orderItems.forEach(item => {

            productsHtml += `
                <div class="receipt-item">
                    <strong>
                        ${item.Prod_name}
                    </strong>
                    <div>
                        Quantity:
                        ${item.Quantity}
                    </div>
                    <div>
                        Unit Price:
                        ₱${Number(item.Unit_price).toFixed(2)}
                    </div>
                    <hr>
                </div>
            `;
        });
        receiptContent.innerHTML = `
            <div class="receipt-section">
                <div class="receipt-header">
                    <strong>
                        Order #${firstOrder.Order_id}
                    </strong>
                    <span>
                        ${firstOrder.Order_status}
                    </span>
                </div>
                <hr>
                ${productsHtml}
                <p>
                    Shipping Fee:
                    ₱${Number(firstOrder.Shipping_fee).toFixed(2)}
                </p>
                <p>
                    Discount:
                    ₱0.00
                </p>
                <p>
                    Address:
                    ${firstOrder.Street_address},
                    ${firstOrder.City},
                    ${firstOrder.Zip_code}
                </p>
                <hr>
                <h4>
                    Total:
                    ₱${Number(firstOrder.Total_cost).toFixed(2)}
                </h4>
            </div>
        `;
        receiptModal.classList.add("active");
    } catch(error) {
        hideLoader();
        console.error(error);
        receiptContent.innerHTML = `
            <p>
                Failed to load order details.
            </p>
        `;
        receiptModal.classList.add("active");
    }
}

async function updateNavbarLogin() {
    const response = await fetch("/api/isLoggedIn");
    if (!response.ok) {
        document.getElementById("accountButton").innerHTML = `
            <a class="nav-link" href="/login">
                Login
            </a>
        `;
    } else {
        document.getElementById("accountButton").innerHTML = `
            <a class="nav-link" href="/user/profile">
                Profile
            </a>
        `;
    }
}