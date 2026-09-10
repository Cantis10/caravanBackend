//fade-in/out animation for product cards
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            } else {
                entry.target.classList.remove("show");
            }
        });
    },
    {
        threshold: 0.2
    }
);

// State management for current tab
let currentTab = "products";

// Tab switching functionality
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.getElementById("productsTab").classList.toggle("active", tab === "products");
    document.getElementById("bundlesTab").classList.toggle("active", tab === "bundles");
    
    // Update content visibility
    document.getElementById("productsContent").classList.toggle("active", tab === "products");
    document.getElementById("bundlesContent").classList.toggle("active", tab === "bundles");
    
    // Update navbar for bundles
    updateNavbarForTab(tab);
    
    // Render appropriate content
    if (tab === "products") {
        renderProducts();
    } else {
        renderBundles();
    }
}

// Update navbar based on tab
function updateNavbarForTab(tab) {
    const verticalNavbar = document.querySelector(".vertical-navbar");
    
    if (tab === "bundles") {
        // Show only bundles category
        const categories = verticalNavbar.querySelectorAll(".category");
        categories.forEach(category => {
            const categoryTitle = category.querySelector(".category-title span:first-child").textContent.trim();
            if (categoryTitle === "Bundles") {
                category.style.display = "block";
            } else {
                category.style.display = "none";
            }
        });
        
        // If Bundles category doesn't exist, create it
        if (!verticalNavbar.querySelector(".category")) {
            verticalNavbar.innerHTML = `
                <div class="category-header">
                    <span style="font-size: 20px"><b>Categories</b></span>
                </div>
                <div class="category">
                    <div class="category-title" onclick="toggleSubcategories(this)">
                        <span>Bundles</span>
                        <span class="toggle-icon">&#9660;</span>
                    </div>
                    <div class="subcategories">
                        <div class="subcategory" onclick="filterBundlesByCategory(this)">All Bundles</div>
                        <div class="subcategory" onclick="filterBundlesByCategory(this)">Cooking</div>
                        <div class="subcategory" onclick="filterBundlesByCategory(this)">Baking</div>
                        <div class="subcategory" onclick="filterBundlesByCategory(this)">Garnishing</div>
                    </div>
                </div>
            `;
        }
    } else {
        // Show all product categories
        const categories = verticalNavbar.querySelectorAll(".category");
        categories.forEach(category => {
            category.style.display = "block";
        });
    }
}

function toggleCategoryMenu() {
    const sidebar = document.querySelector(".vertical-navbar");
    const overlay = document.getElementById("sidebarOverlay");
    const hamburger = document.getElementById("categoryMenuToggle");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    hamburger.classList.toggle("active");
}

function toggleSubcategories(element) {
    const subcategories = element.nextElementSibling;
    const arrow = element.querySelector(".toggle-icon");

    subcategories.classList.toggle("hidden");
    arrow.classList.toggle("rotate");
}

let products = [];
let bundles = [];
let selectedCategory = "";
let selectedBundleCategory = "";

function renderProducts() {
    const productsection = document.getElementById("productsSection");
    const noItemContainer = productsection.querySelector(".noitem-container");
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
    const selectedCountry = document.getElementById("product_country").value;

    productsection.querySelectorAll(".product-card").forEach(card => card.remove());

    const filteredProducts = products
        .filter(product => {
            const matchesCategory = !selectedCategory || product.product_category.some(category =>
                category.category_name === selectedCategory
            );
            const matchesCountry = !selectedCountry || product.product_country === selectedCountry;
            const matchesSearch = product.product_name.toLowerCase().includes(searchTerm);

            return matchesCategory && matchesCountry && matchesSearch;
        })
        .sort((firstProduct, secondProduct) =>
            firstProduct.product_name.localeCompare(secondProduct.product_name)
        );

    filteredProducts.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.dataset.productId = product.product_id;

        productCard.innerHTML = `
            <img
                src="${product.product_image}"
                alt="${product.product_name}"
                class="product-image"
            >

            <div class="product-info">
                <h3 class="product-name">${product.product_name}</h3>
                <p class="product-price">₱${product.product_price.toFixed(2)}/oz.</p>
            </div>
        `;

        productCard.addEventListener("click", () => {
            window.location.href = `productpage.html?productId=${product.product_id}`;
        });

        productsection.appendChild(productCard);

        observer.observe(productCard);
    });

    noItemContainer.style.display = filteredProducts.length ? "none" : "block";
}

function renderBundles() {
    const bundleSection = document.getElementById("bundlesSection");
    const noItemContainer = bundleSection.querySelector(".noitem-container");
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();

    bundleSection.querySelectorAll(".product-card").forEach(card => card.remove());

    const filteredBundles = bundles
        .filter(bundle => {
            const matchesCategory = !selectedBundleCategory || selectedBundleCategory === "All Bundles" || bundle.bundle_category === selectedBundleCategory;
            const matchesSearch = bundle.bundle_name.toLowerCase().includes(searchTerm);

            return matchesCategory && matchesSearch;
        })
        .sort((firstBundle, secondBundle) =>
            firstBundle.bundle_name.localeCompare(secondBundle.bundle_name)
        );

    filteredBundles.forEach(bundle => {
        const bundleCard = document.createElement("div");
        bundleCard.classList.add("product-card");
        bundleCard.dataset.bundleId = bundle.bundle_id;

        bundleCard.innerHTML = `
            <img
                src="${bundle.bundle_image}"
                alt="${bundle.bundle_name}"
                class="product-image"
            >

            <div class="product-info">
                <h3 class="product-name">${bundle.bundle_name}</h3>
                <p class="product-price">₱${bundle.bundle_price.toFixed(2)}</p>
            </div>
        `;

        bundleCard.addEventListener("click", () => {
            window.location.href = `productpage.html?bundleId=${bundle.bundle_id}`;
        });

        bundleSection.appendChild(bundleCard);

        observer.observe(bundleCard);
    });

    noItemContainer.style.display = filteredBundles.length ? "none" : "block";
}

function filterBundlesByCategory(element) {
    const categoryName = element.textContent.trim();

    selectedBundleCategory = categoryName;

    // Highlight selected category
    document.querySelectorAll(".subcategory").forEach(item => {
        item.classList.toggle(
            "active",
            item === element
        );
    });

    // Re-render bundles
    renderBundles();
}

// fetches all the products inside products_list.json
fetch("products_list.json") 
    .then(response => response.json())
    .then(loadedProducts => {
        products = loadedProducts;
        const countrySelect = document.getElementById("product_country");
        const countries = [...new Set(products.map(product => product.product_country))].sort();

        countries.forEach(country => {
            const option = document.createElement("option");
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });

        renderProducts();
    })
    .catch(error => {
        console.error("Error loading products:", error);
    });

// fetches all the bundles inside bundles_list.json
fetch("bundles_list.json") 
    .then(response => response.json())
    .then(loadedBundles => {
        bundles = loadedBundles;
    })
    .catch(error => {
        console.error("Error loading bundles:", error);
    });

const form = document.getElementById("Searchbar");
const countrySelect = document.getElementById("product_country");

form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page on submit
    SearchProducts();
});

countrySelect.addEventListener("change", () => {
    if (currentTab === "products") {
        renderProducts();
    }
});

document.querySelectorAll(".subcategory").forEach(subcategory => {
    subcategory.addEventListener("click", () => {

        const categoryName = subcategory.textContent.trim();

        if (currentTab === "products") {
            if (categoryName === "All Products") {
                selectedCategory = "";
                console.log("selected category: " + categoryName);
            }
            else {
                selectedCategory = categoryName;
                console.log("selected category: " + categoryName);
            }

            // Highlight selected category
            document.querySelectorAll(".subcategory").forEach(item => {
                item.classList.toggle(
                    "active",
                    item === subcategory
                );
            });

            // Re-render products
            renderProducts();
        }
    });
});

const allProducts = document.querySelector(".subcategory");
if (allProducts) {
    allProducts.classList.add("active");
}
selectedCategory = "";

function SearchProducts() {
    if (currentTab === "products") {
        renderProducts();
    } else {
        renderBundles();
    }
}


