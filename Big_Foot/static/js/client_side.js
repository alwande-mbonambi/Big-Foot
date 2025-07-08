document.addEventListener('DOMContentLoaded', () => {
    // --- Data Persistence (Load from localStorage, or use initial dummy data) ---
    // Products: Load from 'bigfootProducts' (managed by admin), or use initial dummy data if empty
    let products = JSON.parse(localStorage.getItem('bigfootProducts')) || [
        {
            id: 1,
            name: "Classic Runner",
            price: 1200.00,
            image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/7b2c9c44-da5b-478a-9e67-908b5c350ab6/AIR+JORDAN+1+LOW.png"
        },
        {
            id: 2,
            name: "Urban Stride",
            price: 1550.00,
            image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/cd845740-9e8f-4f87-b2b0-bb9c4617bba9/AIR+JORDAN+4+RM.png"
        },
        {
            id: 3,
            name: "High-Top Pro",
            price: 1800.00,
            image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/31a10807-e6f9-4d5e-98c8-a55d33b6c820/JORDAN+LUKA+4+Q54.png"
        },
        {
            id: 4,
            name: "Retro Style",
            price: 980.00,
            image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/89235dab-3047-41d2-af7b-d0a77f43fe6a/AIR+JORDAN+1+HIGH+G.png"
        },
        {
            id: 5,
            name: "Sport Glide",
            price: 1300.00,
            image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a72a7c2d-0d61-499a-9042-58a2a022083b/JORDAN+MVP.png"
        },
        {
            id: 6,
            name: "Minimalist Flex",
            price: 1100.00,
            image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/222ae0d1-043e-448a-989c-7b618939d99b/JORDAN+CMFT+ERA.png"
        }
    ];

    // Orders: Load from 'bigfootOrders' (shared with admin), or use initial dummy data if empty
    let orders = JSON.parse(localStorage.getItem('bigfootOrders')) || [
        {
            orderId: "BF-2025001",
            date: "2025-06-15",
            total: 2750.00,
            status: "Delivered",
            items: [
                { name: "Urban Stride", quantity: 1, price: 1550.00 },
                { name: "Retro Style", quantity: 1, price: 980.00 },
                { name: "Sneaker Care Kit", quantity: 1, price: 220.00 }
            ],
            customerEmail: "user@example.com"
        },
        {
            orderId: "BF-2025002",
            date: "2025-07-01",
            total: 1200.00,
            status: "Processing",
            items: [
                { name: "Classic Runner", quantity: 1, price: 1200.00 }
            ],
            customerEmail: "user@example.com"
        }
    ];

    // Users: This client-side file doesn't currently manage users, but initialize for future use
    let users = JSON.parse(localStorage.getItem('bigfootUsers')) || [];

    // Cart: Remains separate as it's client-specific session/browser data
    let cart = JSON.parse(localStorage.getItem('bigfootCart')) || [];

    // --- DOM Elements ---
    const productGrid = document.getElementById('product-grid');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const cartCloseButton = document.getElementById('cart-close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutButton = document.querySelector('.checkout-button'); // Corrected from getElementById if it's a class

    const profileIcon = document.getElementById('profile-icon');
    const profileModal = document.getElementById('profile-modal');
    const profileCloseButton = document.getElementById('profile-close-button');

    const logoutButton = document.getElementById('logout-button');

    // Profile Modals Elements
    const profileNavButtons = document.querySelectorAll('.profile-nav-btn');
    const profileSections = document.querySelectorAll('.profile-section');
    const passwordChangeForm = document.getElementById('password-change-form');
    const orderHistoryContainer = document.getElementById('order-history');
    const noOrdersMessage = document.getElementById('no-orders-message');

    // Elements for profile details
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');


    // --- Helper Functions for Local Storage ---
    function saveProducts() {
        localStorage.setItem('bigfootProducts', JSON.stringify(products));
    }

    function saveOrders() {
        localStorage.setItem('bigfootOrders', JSON.stringify(orders));
    }

    function saveUsers() { // For future use if client side modifies users (e.g., profile updates)
        localStorage.setItem('bigfootUsers', JSON.stringify(users));
    }

    function saveCart() {
        localStorage.setItem('bigfootCart', JSON.stringify(cart));
    }

    // --- Product Display Logic ---
    function renderProducts() {
        productGrid.innerHTML = ''; // Clear existing products
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">R${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            `;
            productGrid.appendChild(productCard);
        });

        // Add event listeners to "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                addToCart(productId);
            });
        });
    }

    // --- Cart Logic ---
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            updateCartUI();
            saveCart();
            alert(`${product.name} added to cart!`); // Simple confirmation
        }
    }

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutButton.style.display = 'none'; // Hide checkout button if cart is empty
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutButton.style.display = 'block'; // Show checkout button
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="price">R${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="decrease-quantity" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item-button" data-id="${item.id}">Remove</button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
                total += item.price * item.quantity;
            });
        }

        cartTotalSpan.textContent = total.toFixed(2);
        cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        // Add event listeners for quantity and remove buttons
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                changeQuantity(itemId, 1);
            });
        });

        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                changeQuantity(itemId, -1);
            });
        });

        document.querySelectorAll('.remove-item-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                removeFromCart(itemId);
            });
        });
    }

    function changeQuantity(itemId, change) {
        const itemIndex = cart.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                removeFromCart(itemId);
            } else {
                updateCartUI();
                saveCart();
            }
        }
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        updateCartUI();
        saveCart();
    }

    // --- Checkout Logic (New/Modified) ---
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before checking out.');
            return;
        }

        if (confirm('Proceed to checkout?')) {
            const newOrder = {
                orderId: "BF-" + Date.now().toString().slice(-7), // Simple unique ID
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                total: parseFloat(cartTotalSpan.textContent),
                status: "Processing", // Initial status for new orders
                items: cart.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                customerEmail: sessionStorage.getItem('userEmail') || 'guest' // Associate order with logged-in user
            };

            orders.push(newOrder); // Add to the shared orders array
            saveOrders(); // Save to localStorage

            cart = []; // Clear cart after checkout
            saveCart(); // Update cart in localStorage

            updateCartUI(); // Refresh cart display
            cartModal.style.display = 'none'; // Close cart modal
            alert('Order placed successfully! You can view it in your profile.');
            showProfileSection('orders'); // Immediately show order history
            profileModal.style.display = 'flex'; // Open profile modal
        }
    });

    // --- Modal Event Listeners ---
    cartIcon.addEventListener('click', (event) => {
        event.preventDefault();
        cartModal.style.display = 'flex';
        updateCartUI();
    });

    cartCloseButton.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    profileIcon.addEventListener('click', (event) => {
        event.preventDefault();
        profileModal.style.display = 'flex';
        showProfileSection('details'); // Show details section by default
        updateProfileDetails(); // Update profile name/email on open
    });

    profileCloseButton.addEventListener('click', () => {
        profileModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (event.target === profileModal) {
            profileModal.style.display = 'none';
        }
    });

    // --- Logout ---
    logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
            sessionStorage.clear(); // Clear all session data
            cart = [];
            saveCart();
            updateCartUI();
            alert('You have been logged out.');
            window.location.href = 'login.html'; // Redirect to login page
        }
    });

    // --- Profile Section Logic ---
    function showProfileSection(sectionId) {
        profileNavButtons.forEach(button => button.classList.remove('active'));
        profileSections.forEach(section => section.style.display = 'none');

        const targetButton = document.querySelector(`.profile-nav-btn[data-section="${sectionId}"]`);
        const targetSection = document.getElementById(`${sectionId}-section`);

        if (targetButton && targetSection) {
            targetButton.classList.add('active');
            targetSection.style.display = 'block';
        }

        if (sectionId === 'orders') {
            renderOrderHistory();
        }
    }

    // Function to update profile details based on session storage
    function updateProfileDetails() {
        const userName = sessionStorage.getItem('userName') || 'Guest User';
        const userEmail = sessionStorage.getItem('userEmail') || 'guest@example.com';

        if (profileUsername) profileUsername.textContent = userName;
        if (profileEmail) profileEmail.textContent = userEmail;
    }


    profileNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            showProfileSection(section);
        });
    });

    passwordChangeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        if (newPassword !== confirmNewPassword) {
            alert('New password and confirm new password do not match!');
            return;
        }

        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long.');
            return;
        }

        console.log('Attempting to change password:');
        console.log('Current:', currentPassword);
        console.log('New:', newPassword);

        // In a real app, you would validate currentPassword and update in users array in localStorage
        // For this demo, we'll just simulate success
        let userEmail = sessionStorage.getItem('userEmail');
        if (userEmail) {
            let userIndex = users.findIndex(u => u.email === userEmail);
            if (userIndex > -1 && users[userIndex].password === currentPassword) { // Basic check
                users[userIndex].password = newPassword;
                saveUsers(); // Save updated users to localStorage
                alert('Password changed successfully!');
            } else {
                alert('Incorrect current password or user not found.');
            }
        } else {
            alert('Not logged in. Cannot change password.');
        }

        passwordChangeForm.reset();
        showProfileSection('details');
    });

    function renderOrderHistory() {
        orderHistoryContainer.innerHTML = '';

        const userEmail = sessionStorage.getItem('userEmail');
        // Filter orders: If user is logged in, show their orders. Otherwise, show all (guest) orders.
        // In a more robust system, guest orders wouldn't be displayed in a user's profile history.
        const userOrders = orders.filter(order => order.customerEmail === userEmail || userEmail === null || userEmail === 'guest');

        if (userOrders.length === 0) {
            noOrdersMessage.style.display = 'block';
        } else {
            noOrdersMessage.style.display = 'none';
            userOrders.forEach(order => {
                const orderItemDiv = document.createElement('div');
                orderItemDiv.classList.add('order-item');
                orderItemDiv.innerHTML = `
                    <h5>Order #${order.orderId}</h5>
                    <p><strong>Date:</strong> ${order.date}</p>
                    <p><strong>Total:</strong> R${order.total.toFixed(2)}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <h6>Items:</h6>
                    <ul>
                        ${order.items.map(item => `<li>${item.name} (x${item.quantity}) - R${(item.quantity * item.price).toFixed(2)}</li>`).join('')}
                    </ul>
                `;
                orderHistoryContainer.appendChild(orderItemDiv);
            });
        }
    }

    // Initial render on page load
    renderProducts();
    updateCartUI();
    updateProfileDetails(); // Call this to set initial profile name/email
});