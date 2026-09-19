
let isBundle = false;

document.addEventListener("DOMContentLoaded", () => {

    updateNavbarLogin();

    const sizeSelect = document.getElementById("spiceSize");
    const priceDisplay = document.getElementById("productPrice");

    let basePrice = 0;
    let currentItem = null;
    let allProducts = [];

    const productId = Number(
        new URLSearchParams(window.location.search).get("productId")
    );
    
    const bundleId = Number(
        new URLSearchParams(window.location.search).get("bundleId")
    );

    // Load all products for bundle items lookup
    fetch("products_list.json")
        .then((response) => response.json())
        .then((products) => {
            allProducts = products;
        })
        .catch((error) => console.error("Error loading products:", error));

    // LOAD PRODUCTS OR BUNDLES

    if (bundleId) {
        isBundle = true;
        fetch("/bundles_list.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Unable to load bundles: ${response.status}`
                    );
                }
                return response.json();
            })
            .then((bundles) => {
                // FIND CURRENT BUNDLE
                const bundle = bundles.find(
                    item => item.bundle_id === bundleId
                );

                if (!bundle) {
                    throw new Error(
                        `Bundle with ID ${bundleId} was not found`
                    );
                }

                currentItem = bundle;

                // DISPLAY CURRENT BUNDLE

                basePrice = bundle.bundle_price;

                document.getElementById("mainProductImg").src =
                    bundle.bundle_image;

                document.getElementById("mainProductImg").alt =
                    bundle.bundle_name;

                document.getElementById("productTitle").textContent =
                    bundle.bundle_name;

                document.getElementById("likeCount").textContent =
                    bundle.bundle_likes;

                // Show bundle items instead of origin
                const bundleItemsNames = bundle.bundle_items_id
                    .map(itemId => {
                        const product = allProducts.find(p => p.product_id === itemId);
                        return product ? product.product_name : `Product ${itemId}`;
                    })
                    .join(", ");

                document.getElementById("productOrigin").textContent =
                    `Bundle includes: ${bundleItemsNames}`;

                document.getElementById("productDesc").textContent =
                    `Description: ${bundle.bundle_description}`;

                updatePrice();
            })
            .catch((error) => {
                console.error("Error loading bundle:", error);
                document.querySelector(".product-container").innerHTML =
                    "<p>Unable to load this bundle.</p>";
            });
    } else {
        // Load as product
        fetch("/products_list.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Unable to load products: ${response.status}`
                    );
                }
                return response.json();
            })
            .then((products) => {
                // FIND CURRENT PRODUCT
                const product = products.find(
                    item => item.product_id === productId
                );

                if (!product) {
                    throw new Error(
                        `Product with ID ${productId} was not found`
                    );
                }

                currentItem = product;

                // DISPLAY CURRENT PRODUCT
                basePrice = product.product_price;

                document.getElementById("mainProductImg").src =
                    product.product_image;

                document.getElementById("mainProductImg").alt =
                    product.product_name;

                document.getElementById("productTitle").textContent =
                    product.product_name;

                document.getElementById("likeCount").textContent =
                    product.product_likes;

                document.getElementById("productOrigin").textContent =
                    `Origin: ${product.product_country}`;

                document.getElementById("productDesc").textContent =
                    `Description: ${product.product_desc}`;

                updatePrice();

                // SIMILAR SPICES

                const recommendationsContainer =
                document.querySelector(
                    ".recommendations-similar .product-grid"
                );


            const similarProducts = products.filter(
                otherProduct => {

                    // Don't recommend current product
                    if (
                        otherProduct.product_id ===
                        product.product_id
                    ) {
                        return false;
                    }


                    // Same country
                    const sameCountry =
                        otherProduct.product_country ===
                        product.product_country;


                    // Share at least one category
                    const sameCategory =
                        otherProduct.product_category.some(
                            otherCategory =>
                                product.product_category.some(
                                    currentCategory =>
                                        currentCategory.category_id ===
                                        otherCategory.category_id
                                )
                        );
                    return sameCountry || sameCategory;
                }
            );

            // Shuffle
            const shuffledSimilarProducts =
                [...similarProducts].sort(
                    () => Math.random() - 0.5
                );


            // Maximum of 7
            const recommendedProducts =
                shuffledSimilarProducts.slice(0, 7);

            // Create cards
            recommendedProducts.forEach(
                recommendedProduct => {

                    const recommendationCard =
                        document.createElement("div");

                    recommendationCard.classList.add(
                        "recommendation-card"
                    );
                    recommendationCard.dataset.productId =
                        recommendedProduct.product_id;


                    recommendationCard.innerHTML = `
                        <div class="cardImg">
                            <img
                                src="${recommendedProduct.product_image}"
                                alt="${recommendedProduct.product_name}"
                            />
                        </div>

                        <div class="card-details">
                            <h4 class="card-title">
                                ${recommendedProduct.product_name}
                            </h4>

                            <p class="art-price">
                                ₱${recommendedProduct.product_price.toFixed(2)}
                            </p>
                        </div>
                    `;

                    // Click → product page
                    recommendationCard.addEventListener(
                        "click",
                        () => {
                            window.location.href =
                                `product?productId=${recommendedProduct.product_id}`;
                        }
                    );

                    recommendationsContainer.appendChild(
                        recommendationCard
                    );
                }
            );

            // SPICES YOU MAY LIKE
            const likedContainer =
                document.querySelector(
                    ".recommendations-like .product-grid"
                );

            // Get all products except current product
            const otherProducts =
                products.filter(
                    otherProduct =>
                        otherProduct.product_id !==
                        product.product_id
                );

            // Shuffle
            const shuffledRandomProducts =
                [...otherProducts].sort(
                    () => Math.random() - 0.5
                );

            // Maximum of 7
            const randomProducts =
                shuffledRandomProducts.slice(0, 7);

            // Create cards
            randomProducts.forEach(
                randomProduct => {

                    const recommendationCard =
                        document.createElement("div");

                    recommendationCard.classList.add(
                        "recommendation-card"
                    );

                    recommendationCard.dataset.productId =
                        randomProduct.product_id;

                    recommendationCard.innerHTML = `
                        <div class="cardImg">
                            <img
                                src="${randomProduct.product_image}"
                                alt="${randomProduct.product_name}"
                            />
                        </div>

                        <div class="card-details">
                            <h4 class="card-title">
                                ${randomProduct.product_name}
                            </h4>

                            <p class="art-price">
                                ₱${randomProduct.product_price.toFixed(2)}
                            </p>
                        </div>
                    `;

                    // Click → product page
                    recommendationCard.addEventListener(
                        "click",
                        () => {
                            window.location.href =
                                `product?productId=${randomProduct.product_id}`;
                        }
                    );

                    likedContainer.appendChild(
                        recommendationCard
                    );
                }
            );
        })
        .catch((error) => {
            console.error("Error loading product:", error);
            document.querySelector(".product-container").innerHTML =
                "<p>Unable to load this product.</p>";
        });
    }
    // PRICE

    function updatePrice() {
        const multiplier =
            sizeSelect.value === "8oz"
                ? 8
                : 16;
        const calculatedPrice =
            (basePrice * multiplier).toFixed(2);
        priceDisplay.textContent =
            `Price: ₱${calculatedPrice}`;
    }


    if (sizeSelect && priceDisplay) {
        sizeSelect.addEventListener(
            "change",
            updatePrice
        );
    }

    // LIKE BUTTON

    const likeBtn =
        document.getElementById("likeBtn");

    const likeCount =
        document.getElementById("likeCount");


    if (likeBtn && likeCount) {

        likeBtn.addEventListener(
            "click",
            () => {

                let count =
                    parseInt(
                        likeCount.textContent,
                        10
                    );
                likeBtn.classList.toggle("liked");
                const heartIcon =
                    likeBtn.querySelector(".heart-icon");
                if (
                    likeBtn.classList.contains("liked")
                ) {
                    heartIcon.innerHTML =
                        "&#9829;";
                    likeCount.textContent =
                        count + 1;
                    // place the code to update the like count in the database here
                } else {
                    heartIcon.innerHTML =
                        "&#9825;";
                    likeCount.textContent =
                        count - 1;
                    // place the code to update the like count in the database here
                }
            }
        );
    }

    const addToCartBtn =
        document.getElementById("addToCartBtn");
    if (addToCartBtn) {

        addToCartBtn.addEventListener(
            "click",
            () => {
                addToCartBtn.style.transform =
                    "scale(1.2)";
                setTimeout(
                    () => {

                        addToCartBtn.style.transform =
                            "scale(1)";
                    },
                    200
                );
            }
        );
    }
});

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

const addtocart_modal = document.querySelector(".addtocart-modal");
const success_modal = document.querySelector(".success-modal");
const login_required_modal = document.querySelector(".login-required-modal");

async function addtoCart(button) {

    try {

        const response = await fetch("/api/isLoggedIn");

        if (!response.ok) {

            login_required_modal.style.visibility = "visible";
            login_required_modal.style.opacity = "1";

            return;
        }

        const data = await response.json();

        if (!data.loggedIn) {

            login_required_modal.style.visibility = "visible";
            login_required_modal.style.opacity = "1";

            return;
        }

        // User is logged in
        selectedItem = button.closest(".item-card");

        addtocart_modal.style.visibility = "visible";
        addtocart_modal.style.opacity = "1";

    } catch (error) {

        console.error("Login check failed:", error);

        login_required_modal.style.visibility = "visible";
        login_required_modal.style.opacity = "1";
    }
}

function closeLoginRequiredModal() {
    login_required_modal.style.visibility = "hidden";
    login_required_modal.style.opacity = "0";
}

function goToLogin() {
    window.location.href = "/login";
}

function addtocart_confirm() {

    addtocart_modal.style.visibility = "hidden";
    addtocart_modal.style.opacity = "0";

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const size = document.getElementById("spiceSize").value;

    const params = new URLSearchParams(window.location.search);

    const productId = Number(params.get("productId"));
    const bundleId = Number(params.get("bundleId"));

    let existingItem;

    if (isBundle) {

        // Check if the same bundle AND same size is already in cart
        existingItem = cart.find(item =>
            item.isBundle === true &&
            Number(item.cartbundle_id) === bundleId &&
            item.cartprod_size === size
        );

        if (existingItem) {
            // Already in cart
            showAlreadyInCartModal();
            return;
        }
        // Add new bundle
        cart.push({
            cartbundle_id: bundleId,
            cartprod_size: size,
            quantity: 1,
            isBundle: true
        });
    } else {
        // Check if the same product AND same size is already in cart
        existingItem = cart.find(item =>
            item.isBundle === false &&
            Number(item.cartprod_id) === productId &&
            item.cartprod_size === size
        );

        if (existingItem) {
            // Already in cart
            showAlreadyInCartModal();
            return;
        }

        // Add new product
        cart.push({
            cartprod_id: productId,
            cartprod_size: size,
            quantity: 1,
            isBundle: false
        });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Cart saved:", cart);

    // Show normal success modal
    showSuccessModal();
}

function addtocart_close() {
        
    addtocart_modal.style.visibility = "hidden";
    addtocart_modal.style.opacity = "0";
}

function showSuccessModal() {
    const successModal = document.querySelector(".success-modal");
    successModal.querySelector(".warning-title").textContent = "SUCCESS";
    successModal.querySelector(".warning-desc").textContent = "Your Product has been added to your cart";

    successModal.style.visibility = "visible";
    successModal.style.opacity = "1";
}

function showAlreadyInCartModal() {
    const successModal = document.querySelector(".success-modal");
    successModal.querySelector(".warning-title").textContent = "ALREADY IN CART";
    successModal.querySelector(".warning-desc").textContent = "This product is already inside your cart";

    successModal.style.visibility = "visible";
    successModal.style.opacity = "1";
}

function closeModal() {
    success_modal.style.visibility = "hidden";
    success_modal.style.opacity = "0";
}