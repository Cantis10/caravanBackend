
let isBundle = false;

// loeading screen mechanism
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
    showLoader();
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

    // LOAD PRODUCTS OR BUNDLES

    if (bundleId) {
        isBundle = true;

        Promise.all([
            fetch("/bundles_list.json"),
            fetch("/api/fetchProducts")
        ])
        .then(async ([bundlesResponse, productsResponse]) => {

            if (!bundlesResponse.ok) {
                throw new Error(
                    `Unable to load bundles: ${bundlesResponse.status}`
                );
            }

            if (!productsResponse.ok) {
                throw new Error(
                    `Unable to load products: ${productsResponse.status}`
                );
            }

            const bundles = await bundlesResponse.json();
            const products = await productsResponse.json();

            allProducts = products;

            const bundle = bundles.find(
                item =>
                    Number(item.bundle_id) === bundleId
            );

            if (!bundle) {
                throw new Error(
                    `Bundle with ID ${bundleId} was not found`
                );
            }

            currentItem = bundle;
            basePrice = Number(bundle.bundle_price);

            document.getElementById("mainProductImg").src =
                bundle.bundle_image;

            document.getElementById("mainProductImg").alt =
                bundle.bundle_name;

            document.getElementById("productTitle").textContent =
                bundle.bundle_name;

            document.getElementById("likeCount").textContent =
                bundle.bundle_likes;

            const bundleItemsNames =
                bundle.bundle_items_id
                    .map(itemId => {
                        const product = allProducts.find(
                            product =>
                                Number(product.product_id) === Number(itemId)
                        );

                        return product
                            ? product.product_name
                            : `Product ${itemId}`;
                    })
                    .join(", ");

            document.getElementById("productOrigin").textContent =
                `Bundle includes: ${bundleItemsNames}`;

            document.getElementById("productDesc").textContent =
                `Description: ${bundle.bundle_description}`;

            updatePrice();
            hideLoader();

        })
        .catch(error => {
            console.error("Error loading bundle:", error);

            document.querySelector(".product-container").innerHTML =
                "<p>Unable to load this bundle.</p>";

            hideLoader();
        });
    } else {
        Promise.all([
            fetch(
                `/api/fetchProducts?productId=${encodeURIComponent(productId)}`
            ),
            fetch("/api/fetchProducts")
        ])
        .then(async ([productResponse, productsResponse]) => {

            if (!productResponse.ok) {
                if (productResponse.status === 404) {
                    throw new Error(
                        `Product with ID ${productId} was not found`
                    );
                }

                throw new Error(
                    `Unable to load product: ${productResponse.status}`
                );
            }

            if (!productsResponse.ok) {
                throw new Error(
                    `Unable to load recommendations: ${productsResponse.status}`
                );
            }

            const product = await productResponse.json();
            const products = await productsResponse.json();

            allProducts = products;
            currentItem = product;
            basePrice = Number(product.product_price);

            document.getElementById("mainProductImg").src =
                product.product_image;

            document.getElementById("mainProductImg").alt =
                product.product_name;

            document.getElementById("productTitle").textContent =
                product.product_name;

            document.getElementById("likeCount").textContent =
                product.product_likes;

            document.getElementById("productOrigin").textContent =
                `Origin: ${product.product_country || "Unknown"}`;

            document.getElementById("productDesc").textContent =
                `Description: ${product.product_desc}`;

            updatePrice();
            hideLoader();

            renderSimilarProducts(product, products);
            renderRandomProducts(product, products);
        })
        .catch(error => {
            console.error("Error loading product:", error);

            document.querySelector(".product-container").innerHTML =
                "<p>Unable to load this product.</p>";

            hideLoader();
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

    function renderSimilarProducts(product, products) {
        const recommendationsContainer =
            document.querySelector(
                ".recommendations-similar .product-grid"
            );

        if (!recommendationsContainer) {
            return;
        }

        recommendationsContainer.innerHTML = "";

        const currentCategories =
            Array.isArray(product.product_category)
                ? product.product_category
                : [];

        const similarProducts = products.filter(
            otherProduct => {
                if (
                    Number(otherProduct.product_id) ===
                    Number(product.product_id)
                ) {
                    return false;
                }

                const sameCountry =
                    otherProduct.product_country ===
                    product.product_country;

                const otherCategories =
                    Array.isArray(otherProduct.product_category)
                        ? otherProduct.product_category
                        : [];

                const sameCategory =
                    otherCategories.some(otherCategory =>
                        currentCategories.some(currentCategory =>
                            Number(currentCategory.category_id) ===
                            Number(otherCategory.category_id)
                        )
                    );

                return sameCountry || sameCategory;
            }
        );

        const recommendedProducts =
            shuffleArray(similarProducts).slice(0, 7);

        recommendedProducts.forEach(product => {
            recommendationsContainer.appendChild(
                createRecommendationCard(product)
            );
        });
    }

    // Randomize products
    function renderRandomProducts(currentProduct, products) {
        const likedContainer =
            document.querySelector(
                ".recommendations-like .product-grid"
            );

        if (!likedContainer) {
            return;
        }

        likedContainer.innerHTML = "";

        const otherProducts = products.filter(
            product =>
                Number(product.product_id) !==
                Number(currentProduct.product_id)
        );

        const randomProducts =
            shuffleArray(otherProducts).slice(0, 7);

        randomProducts.forEach(product => {
            likedContainer.appendChild(
                createRecommendationCard(product)
            );
        });
    }

    // Random recommendations card
    function createRecommendationCard(product) {
        const recommendationCard =
            document.createElement("div");

        recommendationCard.classList.add(
            "recommendation-card"
        );

        recommendationCard.dataset.productId =
            product.product_id;

        const productPrice =
            Number(product.product_price) || 0;

        recommendationCard.innerHTML = `
            <div class="cardImg">
                <img 
                    src="${product.product_image}"
                    alt="${product.product_name}"
                ">
            </div>

            <div class="card-details">
                <h4 class="card-title">
                    ${product.product_name}
                </h4>

                <p class="art-price">
                    ₱${productPrice.toFixed(2)}
                </p>
            </div>
        `;

        recommendationCard.addEventListener(
            "click",
            () => {
                showLoader();

                window.location.href =
                    `/product?productId=${product.product_id}`;
            }
        );

        return recommendationCard;
    }

    function shuffleArray(items) {
        const shuffled = [...items];

        for (
            let index = shuffled.length - 1;
            index > 0;
            index--
        ) {
            const randomIndex =
                Math.floor(Math.random() * (index + 1));

            [
                shuffled[index],
                shuffled[randomIndex]
            ] = [
                shuffled[randomIndex],
                shuffled[index]
            ];
        }

        return shuffled;
    }

    // LIKE BUTTON
    const likeBtn = document.getElementById("likeBtn");
    const likeCount = document.getElementById("likeCount");

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