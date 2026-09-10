document.addEventListener("DOMContentLoaded", () => {

    const sizeSelect = document.getElementById("spiceSize");
    const priceDisplay = document.getElementById("productPrice");

    let basePrice = 0;
    let isBundle = false;
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
        fetch("bundles_list.json")
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
        fetch("products_list.json")
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
                                `productpage.html?productId=${recommendedProduct.product_id}`;

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
                                `productpage.html?productId=${randomProduct.product_id}`;

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

const addtocart_modal = document.querySelector(".addtocart-modal");
const success_modal = document.querySelector(".success-modal");


function addtoCart(button) {
    selectedItem = button.closest(".item-card");

    addtocart_modal.style.visibility = "visible";
    addtocart_modal.style.opacity = "1";
}

function addtocart_close() {
    addtocart_modal.style.visibility = "hidden";
    addtocart_modal.style.opacity = "0";

}

function addtocart_confirm() {
    addtocart_modal.style.visibility = "hidden";
    addtocart_modal.style.opacity = "0";

    // Get existing cart from localStorage or create new array
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Store the selected size so the cart can calculate its price.
    const size = document.getElementById("spiceSize").value;
    
    if (isBundle) {
        // For bundles
        const bundleId = Number(
            new URLSearchParams(window.location.search).get("bundleId")
        );
        if (bundleId) {
            cart.push({
                cartbundle_id: bundleId,
                cartprod_size: size,
                isBundle: true
            });
        }
    } else {
        // For products
        const productId = Number(
            new URLSearchParams(window.location.search).get("productId")
        );
        if (productId) {
            cart.push({
                cartprod_id: productId,
                cartprod_size: size,
                isBundle: false
            });
        }
    }

    // Save updated cart back to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Show success modal
    success_modal.style.visibility = "visible";
    success_modal.style.opacity = "1";
}

function closeModal() {
    success_modal.style.visibility = "hidden";
    success_modal.style.opacity = "0";
}