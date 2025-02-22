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

// Fetch Cart Items
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

        displayCart(cart);
    } catch (error) {
        console.error("❌ Error fetching cart:", error);
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
            <button onclick="addToCart('${product._id}')">🛒 Add to Cart</button>
        `;
        productList.appendChild(productItem);
    });
}

// ✅ **Fix: Add Product to Cart**
async function addToCart(productId) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("❌ Please log in first!");
        window.location.href = "login.html";
        return;
    }

    let quantity = prompt("Enter quantity:", "1");
    quantity = parseInt(quantity);

    if (isNaN(quantity) || quantity < 1) {
        alert("❌ Please enter a valid quantity (1 or more).");
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/cart/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, productId, quantity })
        });

        const data = await response.json();
        if (response.ok) {
            alert(`✅ ${quantity} item(s) added to cart!`);
            fetchCart(); // Refresh cart
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
    }
}

// ✅ **Display Cart Items**
function displayCart(cart) {
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
                <p>Quantity: ${item.quantity}</p>
                <button onclick="removeFromCart('${item._id}')">❌ Remove</button>
            </div>
        `;
    });

    totalPriceElement.innerText = `Total Price: $${totalPrice.toFixed(2)}`;
}

// ✅ **Remove Product from Cart**
async function removeFromCart(productId) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Please log in first!");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/cart/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, productId })
        });

        if (response.ok) {
            alert("✅ Item removed from cart!");
            fetchCart(); // Refresh cart
        } else {
            const data = await response.json();
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Error removing item from cart:", error);
    }
}

// Event Listeners
checkAuth();
if (document.getElementById("registerForm")) document.getElementById("registerForm").addEventListener("submit", registerUser);
if (document.getElementById("loginForm")) document.getElementById("loginForm").addEventListener("submit", loginUser);
if (document.getElementById("productList")) fetchProducts();
if (document.getElementById("cart")) fetchCart();
