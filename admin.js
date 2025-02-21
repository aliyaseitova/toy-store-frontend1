const backendUrl = "http://localhost:9664/api";

// Fetch Analytics Data
async function fetchAnalytics() {
    try {
        // ✅ Fetch Total Orders
        const salesResponse = await fetch(`${backendUrl}/analytics/sales`);
        const salesData = await salesResponse.json();
        document.getElementById("totalOrders").innerText = `Total Orders: ${salesData.totalRevenue}`;

        // ✅ Fetch Most Ordered Products
        const productsResponse = await fetch(`${backendUrl}/analytics/popular-products`);
        const products = await productsResponse.json();

        const productList = document.getElementById("popularProducts");
        productList.innerHTML = "";

        products.forEach(product => {
            const productItem = document.createElement("div");
            productItem.classList.add("grid-item");
            productItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p><strong>Orders:</strong> ${product.count}</p>
            `;
            productList.appendChild(productItem);
        });

    } catch (error) {
        console.error("❌ Error fetching analytics:", error);
    }
}

// Call function on page load
fetchAnalytics();

