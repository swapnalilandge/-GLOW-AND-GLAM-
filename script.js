let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price) {
    cart.push({ name, price });

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(name + " added to cart!");
}

if (document.getElementById("cartItems")) {
    let cartItems = document.getElementById("cartItems");
    let totalPrice = document.getElementById("totalPrice");

    let total = 0;

    cart.forEach(item => {
        cartItems.innerHTML += `
            <p>${item.name} - ₹${item.price}</p>
        `;
        total += item.price;
    });

    totalPrice.innerHTML = "Total: ₹" + total;
}
function checkout() {
    alert("Order placed successfully!");

    localStorage.removeItem("cart");

    window.location.href = "index.html";
}
function placeOrder() {
    alert("🎉 Order Placed Successfully!");

    localStorage.removeItem("cart");

    window.location.href = "index.html";
}
function login() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (email === "" || password === "") {
        alert("Please fill all fields.");
    } else {
        alert("Login Successful!");
    }
}
function sendMessage(){
    alert("Thank you! Your message has been sent successfully.");
}
function searchProducts() {
    let input = document.getElementById("search").value.toLowerCase();
    let products = document.getElementsByClassName("product");

    for (let i = 0; i < products.length; i++) {
        let name = products[i].getElementsByTagName("h3")[0].innerText.toLowerCase();

        if (name.includes(input)) {
            products[i].style.display = "block";
        } else {
            products[i].style.display = "none";
        }
    }
}
function subscribe() {
    let email = document.getElementById("newsletterEmail").value;

    if(email === ""){
        alert("Please enter your email.");
    }else{
        alert("Thank you for subscribing!");
        document.getElementById("newsletterEmail").value = "";
    }
}

function validatePayment() {

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let address = document.getElementById("address").value.trim();

    if (name === "") {
        alert("Please enter your name.");
        return false;
    }

    if (email === "") {
        alert("Please enter your email.");
        return false;
    }

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email.");
        return false;
    }

    if (phone === "") {
        alert("Please enter your phone number.");
        return false;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Phone number must contain exactly 10 digits.");
        return false;
    }

    if (address === "") {
        alert("Please enter your delivery address.");
        return false;
    }

    // Get existing orders
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// Get cart items
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Create new order
let order = {
    id: "GG" + Math.floor(Math.random() * 1000000),
    date: new Date().toLocaleDateString(),
    items: cart
};

let total = 0;

cart.forEach(item => {
    total += Number(item.price);
});

let userEmail = email;

fetch("https://glow-and-glam-4.onrender.com/orders", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        user_email: userEmail,
        total_amount: total
    })
})
.then(response => response.json())
.then(result => {

    if (result.success) {

        localStorage.removeItem("cart");

        // Save order ID for success page
        localStorage.setItem("lastOrderId", result.order_id);

        window.location.href = "success.html";

    } else {

        alert(result.message);
    }

})
.catch(error => {

    console.log(error);
    alert("Unable to connect to server.");

});

return false;
}
function showPaymentDetails() {

    let paymentElement = document.querySelector('input[name="payment"]:checked');
    if(!paymentElement)return;
    let payment=paymentElement.value;
    let details = document.getElementById("paymentDetails");

    if (payment === "UPI") {
        details.innerHTML = `
            <label>UPI ID</label><br>
            <input type="text" placeholder="example@upi"><br><br>
        `;
    }

    else if (payment === "Card") {
        details.innerHTML = `
            <label>Card Number</label><br>
            <input type="text" placeholder="1234 5678 9012 3456"><br><br>

            <label>Expiry Date</label><br>
            <input type="text" placeholder="MM/YY"><br><br>

            <label>CVV</label><br>
            <input type="password" placeholder="123"><br><br>
        `;
    }

    else if (payment === "NetBanking") {
        details.innerHTML = `
            <label>Select Bank</label><br>
            <select>
                <option>SBI</option>
                <option>HDFC</option>
                <option>ICICI</option>
                <option>Axis Bank</option>
            </select><br><br>
        `;
    }

    else {
        details.innerHTML = "";
    }
}

window.onload = showPaymentDetails;
function displayOrderTotal() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;

    cart.forEach(item => {
        total += item.price;
    });

    let totalElement = document.getElementById("orderTotal");

    if (totalElement) {
        totalElement.innerHTML = "Total Amount: ₹" + total;
    }
}

window.onload = function () {
    showPaymentDetails();
    displayOrderTotal();
};
async function showOrderHistory() {

    const orderHistory = document.getElementById("orderHistory");

    if (!orderHistory) return;

    const email = localStorage.getItem("userEmail");

    if (!email) {

        orderHistory.innerHTML = `
            <h3>Please login to see your orders.</h3>
            <a href="login.html">
                <button>Login</button>
            </a>
        `;

        return;
    }

    try {

        const response = await fetch(
            "https://glow-and-glam-4.onrender.com/orders" + encodeURIComponent(email)
        );

        const data = await response.json();

        if (!data.success) {

            orderHistory.innerHTML =
                "<h3>Unable to load orders.</h3>";

            return;
        }

        if (data.orders.length === 0) {

            orderHistory.innerHTML =
                "<h3>No Orders Yet!</h3>";

            return;
        }

        let output = "";

        data.orders.forEach(order => {

            output += `
                <div class="product">

                    <h3>
                        Order ID: ${order.order_id}
                    </h3>

                    <p>
                        <strong>Total:</strong>
                        ₹${Number(order.total_amount).toFixed(2)}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${new Date(order.order_date).toLocaleString()}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${order.status}
                    </p>

                </div>

                <br>
            `;
        });

        orderHistory.innerHTML = output;

    } catch (error) {

        console.log(error);

        orderHistory.innerHTML =
            "<h3>Unable to connect to server.</h3>";
    }
}
window.onload = function () {

    showPaymentDetails();
    displayOrderTotal();
    showOrderHistory();

};
function logout() {
    localStorage.removeItem("userEmail");
    alert("Logged out successfully!");
    window.location.href = "login.html";
}
function showLoggedInUser() {
    const email = localStorage.getItem("userEmail");
    const userElement = document.getElementById("loggedInUser");

    if (userElement && email) {
        userElement.textContent = email;
    }
}

showLoggedInUser();