const backendUrl = "https://toy-store-backend.onrender.com/api";

// Redirect Unauthenticated Users to Login
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token && !window.location.pathname.includes("login") && !window.location.pathname.includes("register")) {
        window.location.href = "login.html";
    }
}

// Register User
async function registerUser(event) {
    event.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch(`${backendUrl}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert("✅ Registration successful! Please log in.");
            window.location.href = "login.html";
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Registration error:", error);
        alert("❌ Failed to register. Try again later.");
    }
}

// Login User
async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);
            alert("✅ Login successful!");
            window.location.href = "products.html";
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        alert("❌ Failed to log in. Try again later.");
    }
}

// Logout Function
function logout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "login.html";
    }
}

// Fetch Products (Default)
async function fetchProducts() {
    try {
        const response = await fetch(`${backendUrl}/products`);
        if (!response.ok) throw new Error("Failed to fetch products");

        const products = await response.json();
        console.log("✅ Products received:", products);

        displayProducts(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
    }
}

// Fetch Filtered Products (Category removed)
async function fetchFilteredProducts() {
    const query = document.getElementById("searchQuery").value;
    const minPrice = document.getElementById("minPrice").value;
    const maxPrice = document.getElementById("maxPrice").value;
    const inStock = document.getElementById("inStock").checked ? "true" : "";

    let apiUrl = `${backendUrl}/products/search?`;
    if (query) apiUrl += `query=${query}&`;
    if (minPrice) apiUrl += `minPrice=${minPrice}&`;
    if (maxPrice) apiUrl += `maxPrice=${maxPrice}&`;
    if (inStock) apiUrl += `inStock=true&`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch filtered products");

        const products = await response.json();
        console.log("✅ Filtered Products received:", products);

        displayProducts(products);
    } catch (error) {
        console.error("❌ Error fetching filtered products:", error);
    }
}

// Display Products in Grid
function displayProducts(products) {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    products.forEach(product => {
        const productItem = document.createElement("div");
        productItem.classList.add("grid-item");
        productItem.innerHTML = `
            <h3>${product.name}</h3>
            <img src="${product.image}" width="150" height="150">
            <p><strong>Description:</strong> ${product.description}</p>
            <p><strong>Price:</strong> $${product.price}</p>
            <button onclick="addToCart('${product._id}')">Add to Cart</button>
        `;
        productList.appendChild(productItem);
    });
}

// Fetch Cart Items & Display Product Names with Total Price
async function fetchCart() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Please log in first!");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/cart/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch cart");

        const cart = await response.json();
        console.log("🛒 Cart Items Received:", cart);

        const cartDiv = document.getElementById("cart");
        const totalPriceElement = document.getElementById("totalPrice");

        cartDiv.innerHTML = "";
        let totalPrice = 0;

        if (!cart.items || cart.items.length === 0) {
            cartDiv.innerHTML = "<p>Your cart is empty.</p>";
            totalPriceElement.innerText = "Total Price: $0.00";
            return;
        }

        cart.items.forEach(item => {
            totalPrice += item.quantity * item.price;

            cartDiv.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" width="50" height="50">
                    <p><strong>${item.name}</strong></p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <p>Quantity: 
                        <input type="number" id="qty-${item._id}" value="${item.quantity}" min="1" style="width: 50px;">
                        <button onclick="updateCartQuantity('${item._id}')">Update</button>
                    </p>
                    <button onclick="removeFromCart('${item._id}')">❌ Remove</button>
                </div>
            `;
        });

        totalPriceElement.innerText = `Total Price: $${totalPrice.toFixed(2)}`;
    } catch (error) {
        console.error("❌ Error fetching cart:", error);
    }
}

// Function to Add Product to Cart
async function addToCart(productId) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Please log in first!");
        window.location.href = "login.html";
        return;
    }

    let quantity = prompt("Enter quantity:", "1");
    quantity = parseInt(quantity);

    if (isNaN(quantity) || quantity < 1) {
        alert("Please enter a valid quantity (1 or more).");
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/cart/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, productId, quantity })
        });

        if (response.ok) {
            alert(`✅ ${quantity} item(s) added to cart!`);
        } else {
            const data = await response.json();
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
    }
}

// Event Listeners
checkAuth();
if (document.getElementById("registerForm")) document.getElementById("registerForm").addEventListener("submit", registerUser);
if (document.getElementById("loginForm")) document.getElementById("loginForm").addEventListener("submit", loginUser);
if (document.getElementById("searchButton")) document.getElementById("searchButton").addEventListener("click", fetchFilteredProducts);
if (document.getElementById("productList")) fetchProducts();
if (document.getElementById("cart")) fetchCart();
