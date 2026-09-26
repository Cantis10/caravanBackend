let selectedItem = null;
let cartData = [];
let productsData = [];
let bundlesData = [];
let selectedPaymentMethod = null;
let addresses = [];
let selectedAddress = null;

let vouchers = [
    {
        voucher_id: 1,
        voucher_name: "WELCOME10",
        discount: 10,
        voucher_desc: "Get 10% off your order."
    },
    {
        voucher_id: 2,
        voucher_name: "CARAVAN15",
        discount: 15,
        voucher_desc: "Get 15% off your order."
    },
    {
        voucher_id: 3,
        voucher_name: "SPICE20",
        discount: 20,
        voucher_desc: "Get 20% off your order."
    } /* NOTE: TEMPORARY VOUCHERS JUST FOR SIMULATION, REAL VOUCHERS WILL BE ADDED IN DB LATER */
];
let selectedVoucher = null;

// loading function
function showLoader() {
    document
        .getElementById("loadingOverlay")
        .classList.add("active");
}

function hideLoader() {
    document
        .getElementById("loadingOverlay")
        .classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
    loadCartItems();
    updateNavbarLogin();
    renderVoucherDropdown();
    loadAddresses();

    // Voucher dropdown
    document.addEventListener("change", function(event) {

        if (event.target.id !== "voucherSelect") {
            return;
        }

        const voucherId = parseInt(event.target.value);

        selectedVoucher =
            vouchers.find(v =>
                v.voucher_id === voucherId
            ) || null;

        const desc =
            document.getElementById("voucherDescription");

        desc.textContent =
            selectedVoucher
                ? selectedVoucher.voucher_desc
                : "";

        updatePriceSummary();
    });

    // Address dropdown
    document.addEventListener(
        "change",
        function(event) {

            if (
                event.target.id !==
                "addressSelect"
            ) {
                return;
            }

            const addressId =
                parseInt(
                    event.target.value
                );

            selectedAddress =
                addresses.find(
                    a =>
                    a.Address_id ===
                    addressId
                ) || null;

            console.log(
                "Selected address:",
                selectedAddress
            );
        }
    );

    // Payment selector
    const paymentOptions =
        document.querySelectorAll(".payment-option");

    paymentOptions.forEach(option => {

        option.addEventListener("click", () => {

            paymentOptions.forEach(btn => {
                btn.classList.remove("selected");
            });

            option.classList.add("selected");

            selectedPaymentMethod =
                option.textContent.trim();
        });

    });
});
``

// checks if user Logged in; if so, change login to profile
async function updateNavbarLogin(){

    const response = await fetch("/api/isLoggedIn");

    console.log(response);
        if(!response.ok){
    document.getElementById("accountButton").innerHTML = `
        <a class="nav-link" href="/login">Login</a>
    `;
        }else{
            document.getElementById("accountButton").innerHTML = `
        <a class="nav-link" href="/user/profile">Profile</a>
    `;
        }

}

const delete_modal = document.querySelector(".delete-warning-modal");

/*Warning for delete*/

function deleteWarn(button) {
    selectedItem = button.closest(".item-card");

    delete_modal.style.visibility = "visible";
    delete_modal.style.opacity = "1";
}

function warning_No() {
    delete_modal.style.visibility = "hidden";
    delete_modal.style.opacity = "0";

    selectedItem = null;
}

async function warning_Yes() {
    if (!selectedItem) {
        warning_No();
        return;
    }

    const cartIndex =
        Number(selectedItem.dataset.cartIndex);

    const cartItem =
        cartData[cartIndex];

    if (!cartItem) {
        console.error(
            "Unable to find the selected cart item."
        );

        warning_No();
        return;
    }

    const deleteButton =
        delete_modal.querySelector(
            ".btn-outline-danger"
        );

    try {
        if (deleteButton) {
            deleteButton.disabled = true;
            deleteButton.textContent =
                "Deleting...";
        }

        const response = await fetch(
            `/api/cart/items/${cartItem.product_id}` +
            `?productSize=${encodeURIComponent(
                Number(
                    String(cartItem.cartprod_size)
                        .replace("oz", "")
                )
            )}`,
            {
                method: "DELETE"
            }
        );

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";

        if (!contentType.includes("application/json")) {
            const responseText =
                await response.text();

            console.error(
                "Invalid delete response:",
                responseText
            );

            throw new Error(
                "The server returned an invalid response."
            );
        }

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Unable to remove cart item."
            );
        }

        console.log(
            "Cart item deleted:",
            result
        );

        /*
         * Reload the authoritative cart from the database.
         */
        await loadCartItems();

        warning_No();

    } catch (error) {
        console.error(
            "Delete cart item error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete this item."
        );

    } finally {
        if (deleteButton) {
            deleteButton.disabled = false;
            deleteButton.textContent =
                "Delete";
        }
    }
}

/*warning for checkout*/
const warning_modal = document.querySelector(".checkout-warning-modal");
const checkout_button = document.querySelector(".checkout-btn");

function checkoutWarn() {

    if (!selectedPaymentMethod) {
        alert("Please select a payment method first.");
        return;
    }

    if (!selectedAddress) {
        alert("Please select a delivery address.");
        return;
    }

    warning_modal.style.visibility = "visible";
    warning_modal.style.opacity = "1";
}

function checkout_No() {
    warning_modal.style.visibility = "hidden";
    warning_modal.style.opacity = "0";
}

function checkout_Yes() {
    console.log("processing Checkout");

    // PLACE CHECKOUT SCRIPT FOR BACKEND
}

// Load the logged-in customer's active cart from the database
async function loadCartItems() {
    showLoader();

    try {
        const response = await fetch("/api/cart");

        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            const responseText = await response.text();

            console.error(
                "Invalid cart response:",
                responseText
            );

            throw new Error(
                "The server returned an invalid cart response."
            );
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Unable to load cart."
            );
        }

        /*
         * Convert database rows into the same structure
         * your existing cart functions already use.
         */
        cartData = (result.items || []).map(item => {
            const isBundle =
                Number(item.type_id) === 2;

            const productSize =
                `${Number(item.product_size) || 8}oz`;

            return {
                cart_id:
                    Number(item.cart_id),

                product_id:
                    Number(item.product_id),

                cartprod_id:
                    isBundle
                        ? null
                        : Number(item.product_id),

                cartbundle_id:
                    isBundle
                        ? Number(item.product_id)
                        : null,

                cartprod_size:
                    productSize,

                quantity:
                    Number(item.quantity) || 1,

                isBundle:
                    isBundle,

                product_name:
                    item.product_name,

                product_price:
                    Number(item.product_price) || 0,

                product_image:
                    item.product_image,

                type_id:
                    Number(item.type_id)
            };
        });

        /*
         * Your /api/cart endpoint already provides product
         * information, so create product arrays directly from it.
         */
        productsData = cartData
            .filter(item => !item.isBundle)
            .map(item => ({
                product_id:
                    item.product_id,

                product_name:
                    item.product_name,

                product_price:
                    item.product_price,

                product_image:
                    item.product_image,

                type_id:
                    item.type_id,

                /*
                 * Prevent existing createItemCard()
                 * from failing when reading categories.
                 */
                product_category: []
            }));

        bundlesData = cartData
            .filter(item => item.isBundle)
            .map(item => ({
                product_id:
                    item.product_id,

                product_name:
                    item.product_name,

                product_price:
                    item.product_price,

                product_image:
                    item.product_image,

                type_id:
                    item.type_id,

                product_category: []
            }));

        console.log(
            "Active cart:",
            result.cart
        );

        console.log(
            "Cart items from database:",
            cartData
        );

        updateCheckoutButton();
        displayCartItems();

    } catch (error) {
        console.error(
            "Error loading cart items:",
            error
        );

        cartData = [];
        productsData = [];
        bundlesData = [];

        updateCheckoutButton();

        const cartContainer =
            document.querySelector(".cart-items");

        if (cartContainer) {
            cartContainer.innerHTML =
                "<p>Unable to load cart items.</p>";
        }

        updatePriceSummary();
    } finally {
        hideLoader();
    }
}

// Loads User's Stored addresses from db
async function loadAddresses() {

    try {

        const response =
            await fetch("/api/addresses");

        if (!response.ok) {
            console.error(
                "Failed to load addresses"
            );
            return;
        }

        addresses =
            await response.json();

        renderAddressDropdown();

    } catch (error) {

        console.error(
            "Address load error:",
            error
        );

    }
}

const cartItemsContainer = document.querySelector(".cart-items");

// display cart empty screen when cart empty
function displayCartEmpty() {
    cartItemsContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
                <img
                    src="Images/emptycart.png"
                    alt="empty cart image"
                    style="width: 150px; height: 150px;"
                >
            </div>

            <h4 style="text-align: center; padding: 0px;">
                Your cart is empty.
            </h4>
        `;
}

// Display cart items in the UI
function displayCartItems() {

    // Clear existing items
    cartItemsContainer.innerHTML = "";

    // Check if cart is empty
    if (cartData.length === 0) {
        
        displayCartEmpty();
        updatePriceSummary();
        return;
    }

    // Create item cards for each product/bundle in cart
    cartData.forEach((cartItem, index) => {
        let item = null;
        let itemCard = null;
        
        if (cartItem.isBundle) {
            // Find bundle
            item = bundlesData.find(
                bundle => Number(bundle.product_id) === Number(cartItem.cartbundle_id)
            );
            if (item) {
                itemCard = createBundleCard(item, cartItem, index);
            }
        } else {
            // Find product
            item = productsData.find(
                product => Number(product.product_id) === Number(cartItem.cartprod_id)
            );
            if (item) {
                itemCard = createItemCard(item, cartItem, index);
            }
        }

        if (itemCard) {
            cartItemsContainer.appendChild(itemCard);
        }
    });

    // Update price summary
    updatePriceSummary();
}

// Create a single item card element
function createItemCard(product, cartItem, index) {
    const itemCard = document.createElement("div");
    itemCard.classList.add("item-card");
    itemCard.dataset.productId = product.product_id;
    itemCard.dataset.cartIndex = index;
    itemCard.dataset.index = index;

    const size = cartItem.cartprod_size || "8oz";
    const sizeMultiplier = size === "16oz" ? 16 : 8;
    const quantity = cartItem.quantity || 1;
    const itemPrice = product.product_price * sizeMultiplier;

    // Get first category
    const categories = Array.isArray(product.product_category)
        ? product.product_category
        : [];

    const category = categories.length > 0
        ? categories[0].category_name
        : "Uncategorised";

    itemCard.innerHTML = `
        <div class="product-image">
            <img src="${product.product_image}" alt="${product.product_name}">
        </div>

        <div class="item-info">
            <h4 class="product_name">${product.product_name}</h4>
            <p class="product_size">Size: ${size.replace("oz", " oz")}</p>
            <p class="product_category">Category: ${category}</p>

            <div class="quantity-control">
                <span>Quantity:</span>

                <button
                    type="button"
                    class="quantity-btn"
                    onclick="decreaseQuantity(${index})"
                    ${quantity <= 1 ? "disabled" : ""}
                >
                    −
                </button>

                <input
                    type="number"
                    class="product_quantity quantity-input"
                    data-index="${index}"
                    value="${quantity}"
                    min="1"
                    step="1"
                    inputmode="numeric"
                    onchange="quantityChanged(${index}, this)"
                    onkeydown="handleQuantityKeydown(event)"
                >

                <button
                    type="button"
                    class="quantity-btn"
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>

                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteWarn(this)"
                >
                    🗑 Delete
                </button>
            </div>
        </div>

        <div class="item-price">
            <p class="product_price">Price: ₱${(itemPrice*quantity).toFixed(2)}</p>
        </div>
    `;

    return itemCard;
}

// Create a bundle card element for cart
function createBundleCard(bundle, cartItem, index) {
    const itemCard = document.createElement("div");

    itemCard.classList.add("item-card");
    itemCard.dataset.bundleId = bundle.product_id;
    itemCard.dataset.cartIndex = index;
    itemCard.dataset.index = index;
    
    const size = cartItem.cartprod_size || "8oz";
    const sizeMultiplier =
        size === "16oz" ? 16 : 8;

    const quantity = Number(cartItem.quantity) || 1;
    const basePrice = Number(bundle.product_price) || 0;
    const itemPrice = basePrice * sizeMultiplier;

    itemCard.innerHTML = `
        <div class="product-image">
            <img src="${bundle.product_image}" alt="${bundle.product_name}">
        </div>

        <div class="item-info">
            <h4 class="product_name">
                ${bundle.product_name || "Unnamed Bundle"}
            </h4>

            <p class="product_size">
                Size: ${size.replace("oz", " oz")}
            </p>

            <p class="product_category">
                Bundle
            </p>

            <div class="quantity-control">
                <span>Quantity:</span>

                <button
                    type="button"
                    class="quantity-btn"
                    onclick="decreaseQuantity(${index})"
                    ${quantity <= 1 ? "disabled" : ""}
                >
                    −
                </button>

                <input
                    type="number"
                    class="product_quantity quantity-input"
                    data-index="${index}"
                    value="${quantity}"
                    min="1"
                    step="1"
                    inputmode="numeric"
                    onchange="quantityChanged(${index}, this)"
                    onkeydown="handleQuantityKeydown(event)"
                >

                <button
                    type="button"
                    class="quantity-btn"
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>

                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteWarn(this)"
                >
                    🗑 Delete
                </button>
            </div>
        </div>

        <div class="item-price">
            <p class="product_price">
                Price: ₱${(itemPrice * quantity).toFixed(2)}
            </p>
        </div>
    `;

    return itemCard;
}
``

function updateCheckoutButton() {
    const checkoutButton = document.querySelector(".checkout-btn");

    if (!checkoutButton) return;

    if (cartData.length === 0) {
        checkoutButton.disabled = true;
    } else {
        checkoutButton.disabled = false;
    }
}

async function updateCartItemQuantity(
    index,
    newQuantity
) {
    const cartItem =
        cartData[index];

    if (!cartItem) {
        return;
    }

    const itemCard =
        document.querySelector(
            `.item-card[data-cart-index="${index}"]`
        );

    const quantityButtons = 
        itemCard
            ? itemCard.querySelectorAll(
                ".quantity-btn"
            )
            : [];

    const decreaseButton = quantityButtons.length > 0
        ? quantityButtons[0]
        : null;

    if (decreaseButton) {
        decreaseButton.disabled = newQuantity <= 1;
    }

    try {
        quantityButtons.forEach(button => {
            button.disabled = true;
        });

        const productSize =
            Number(
                String(cartItem.cartprod_size)
                    .replace("oz", "")
            );

        const response = await fetch(
            `/api/cart/items/${cartItem.product_id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    productSize:
                        productSize,

                    quantity:
                        newQuantity
                })
            }
        );

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";

        if (!contentType.includes("application/json")) {
            const responseText =
                await response.text();

            console.error(
                "Invalid quantity response:",
                responseText
            );

            throw new Error(
                "The server returned an invalid response."
            );
        }

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Unable to update quantity."
            );
        }

        console.log(
            "Quantity updated:",
            result
        );

        //Keep the local runtime array synchronised. This is not localStorage.
        cartData[index].quantity =
            newQuantity;

        if (itemCard) {
            const quantityElement =
                itemCard.querySelector(
                    ".product_quantity"
                );

            const priceElement =
                itemCard.querySelector(
                    ".product_price"
                );

            if (quantityElement) {
                quantityElement.value = newQuantity;
            }

            const sizeMultiplier =
                cartItem.cartprod_size ===
                "16oz"
                    ? 16
                    : 8;

            const itemTotal =
                Number(cartItem.product_price) *
                sizeMultiplier *
                newQuantity;

            if (priceElement) {
                priceElement.textContent =
                    `Price: ₱${itemTotal.toFixed(2)}`;
            }
        }

        updatePriceSummary();

    } catch (error) {
        console.error(
            "Quantity update error:",
            error
        );

        alert(
            error.message ||
            "Unable to update quantity."
        );

        //Re-fetch to restore the real database value.
        await loadCartItems();

    } finally {
        quantityButtons.forEach(
            (button, buttonIndex) => {
                if (buttonIndex === 0) {
                    button.disabled = Number(cartData[index]?.quantity) <= 1;
                } else {
                    button.disabled = false;
                }
            }
        );
    }
}

// Increase quantity for a cart item
async function increaseQuantity(index) {
    const cartItem = cartData[index];

    if (!cartItem) {
        return;
    }

    const newQuantity =
        (Number(cartItem.quantity) || 1) + 1;

    await updateCartItemQuantity(
        index,
        newQuantity
    );
}

// Decrease quantity for a cart item
async function decreaseQuantity(index) {
    const cartItem = cartData[index];

    if (!cartItem) {
        return;
    }

    const currentQuantity =
        Number(cartItem.quantity) || 1;

    if (currentQuantity <= 1) {
        return;
    }

    await updateCartItemQuantity(
        index,
        currentQuantity - 1
    );
}

async function quantityChanged(index, inputElement) {
    const cartItem = cartData[index];

    if (!cartItem) {
        return;
    }

    const previousQuantity =
        Number(cartItem.quantity) || 1;

    let newQuantity =
        Number.parseInt(
            inputElement.value,
            10
        );

    if (
        Number.isNaN(newQuantity) ||
        newQuantity < 1
    ) {
        newQuantity = 1;
    }

    
    // Keep the displayed value valid.
    inputElement.value = newQuantity;

    
    // Avoid an unnecessary API request when the value has not changed.
    if (newQuantity === previousQuantity) {
        return;
    }

    inputElement.disabled = true;

    try {
        await updateCartItemQuantity(
            index,
            newQuantity
        );
    } finally {
        inputElement.disabled = false;
    }
}

function handleQuantityKeydown(event) {
    
    // Prevent decimal, negative and scientific notation characters in the number input. 
    if (
        event.key === "-" ||
        event.key === "+" ||
        event.key === "." ||
        event.key.toLowerCase() === "e"
    ) {
        event.preventDefault();
    }

    //Immediately save when Enter is pressed.
    if (event.key === "Enter") {
        event.preventDefault();
        event.target.blur();
    }
}

// voucher dropdown
function renderVoucherDropdown() {

    const select = document.getElementById("voucherSelect");

    if (!select) {
        return;
    }

    select.innerHTML = "";

    if (vouchers.length === 0) {
        select.innerHTML =
            '<option value="">No vouchers available</option>';
        return;
    }
    select.innerHTML =
        '<option value="">Select Voucher</option>';

    vouchers.forEach(voucher => {
        const option = document.createElement("option");

        option.value = voucher.voucher_id;
        option.textContent =
            voucher.voucher_name +
            " (" + voucher.discount + "% OFF)";
        select.appendChild(option);
    });
}

// address dropdown
function renderAddressDropdown() {

    const select =
        document.getElementById(
            "addressSelect"
        );

    if (!select) return;

    select.innerHTML = "";

    if (addresses.length === 0) {

        select.innerHTML =
            `
            <option value="">
                No saved addresses
            </option>
            `;

        return;
    }

    select.innerHTML =
        `
        <option value="">
            Select Address
        </option>
        `;

    addresses.forEach(address => {

        const option =
            document.createElement("option");

        option.value =
            address.Address_id;

        option.textContent =
            `${address.Street_address}, `
            + `${address.City} `
            + `${address.Zip_code}`;

        select.appendChild(option);

    });
}

// Update price summary
function updatePriceSummary() {
    let totalProductCost = 0;

    // Calculate total based on quantities
    document.querySelectorAll(".item-card").forEach((itemCard, index) => {
        const cartIndex = parseInt(itemCard.dataset.cartIndex, 10);
        const cartItem = cartData[cartIndex];
        if (!cartItem) {
            return;
        }
        const quantityElement = itemCard.querySelector(".product_quantity");
        const quantity = quantityElement ? Number.parseInt(quantityElement.value, 10) || 1 : 1;
        const sizeMultiplier = cartItem && cartItem.cartprod_size === "16oz" ? 16 : 8;

            if (cartItem.isBundle) {
                //handle bundle
                const bundleId = Number(itemCard.dataset.bundleId);

                const bundle = bundlesData.find(
                    item => Number(item.product_id) === bundleId
                );

                if (bundle) {
                    totalProductCost +=
                        Number(bundle.product_price) *
                        sizeMultiplier *
                        quantity;
                }
            } else {
            // Handle product
            const productId = parseInt(itemCard.dataset.productId, 10);
            const product = productsData.find(p => p.product_id === productId);
            if (product) {
                totalProductCost += product.product_price * sizeMultiplier * quantity;
            }
        }
    });

    // Update price breakdown
    const shippingFee = 100.00;

    let discount = 0;

    if (selectedVoucher) {

        discount =
            totalProductCost *
            (selectedVoucher.discount / 100);
    }

    const totalCost =
        totalProductCost +
        shippingFee -
        discount;

    // Update the price breakdown display
    const priceBreakdown = document.querySelector(".price-breakdown");
    if (priceBreakdown) {
        const priceRows = priceBreakdown.querySelectorAll(".price-row");
        if (priceRows.length >= 3) {
            priceRows[0].innerHTML = `<span>Products Cost:</span><span>₱${totalProductCost.toFixed(2)}</span>`;
            priceRows[1].innerHTML = `<span>Shipping Fee:</span><span>₱${shippingFee.toFixed(2)}</span>`;
            priceRows[2].innerHTML = `<span>Discount:</span><span>₱${discount.toFixed(2)}</span>`;
        }

        const totalRow = priceBreakdown.querySelector(".total-row");
        if (totalRow) {
            totalRow.innerHTML = `<span>Total Cost:</span><span>₱${totalCost.toFixed(2)}</span>`;
        }
    }
}

