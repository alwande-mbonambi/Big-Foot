document.addEventListener('DOMContentLoaded', () => {
    // Initialize Stripe.js with the public key passed from the template
    const stripe = Stripe(STRIPE_PUBLIC_KEY);

    // --- Data Persistence ---
    // Load products from localStorage, falling back to an EMPTY array
    let products = JSON.parse(localStorage.getItem('bigfootProducts')) || [];

    // Load orders from localStorage or initialize empty
    let orders = JSON.parse(localStorage.getItem('bigfootOrders')) || [];

    // Load users from localStorage or initialize empty
    let users = JSON.parse(localStorage.getItem('bigfootUsers')) || [];

    // Load cart from localStorage or initialize empty
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
    const checkoutButton = document.querySelector('.checkout-button');

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
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');


    // --- Helper Functions for Local Storage ---
    function saveOrders() {
        localStorage.setItem('bigfootOrders', JSON.stringify(orders));
    }

    function saveCart() {
        localStorage.setItem('bigfootCart', JSON.stringify(cart));
    }
    
    function saveUsers() {
        localStorage.setItem('bigfootUsers', JSON.stringify(users));
    }

    // --- Product Display Logic ---
    function renderProducts() {
        // Ensure productGrid exists before trying to modify it
        if (!productGrid) return; 
        
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
            alert(`${product.name} added to cart!`);
        }
    }

    function updateCartUI() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutButton.style.display = 'none';
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutButton.style.display = 'block';
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
                changeQuantity(parseInt(event.target.dataset.id), 1);
            });
        });
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                changeQuantity(parseInt(event.target.dataset.id), -1);
            });
        });
        document.querySelectorAll('.remove-item-button').forEach(button => {
            button.addEventListener('click', (event) => {
                removeFromCart(parseInt(event.target.dataset.id));
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

    // --- STRIPE CHECKOUT LOGIC ---
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: cart }),
        })
        .then(response => response.json())
        .then(session => {
            if (session.error) {
                alert(session.error);
                return;
            }
            return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .then(result => {
            if (result.error) {
                alert(result.error.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });

    // --- Modal and General Event Listeners ---
    if(cartIcon) cartIcon.addEventListener('click', (event) => {
        event.preventDefault();
        cartModal.style.display = 'flex';
        updateCartUI();
    });

    if(cartCloseButton) cartCloseButton.addEventListener('click', () => cartModal.style.display = 'none');

    if(profileIcon) profileIcon.addEventListener('click', (event) => {
        event.preventDefault();
        profileModal.style.display = 'flex';
        showProfileSection('details');
        updateProfileDetails();
    });

    if(profileCloseButton) profileCloseButton.addEventListener('click', () => profileModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target === cartModal) cartModal.style.display = 'none';
        if (event.target === profileModal) profileModal.style.display = 'none';
    });

    if(logoutButton) logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
            sessionStorage.clear();
            cart = [];
            saveCart();
            updateCartUI();
            alert('You have been logged out.');
            window.location.href = 'login.html';
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

    function updateProfileDetails() {
        const userName = sessionStorage.getItem('userName') || 'Guest User';
        const userEmail = sessionStorage.getItem('userEmail') || 'guest@example.com';
        if (profileUsername) profileUsername.textContent = userName;
        if (profileEmail) profileEmail.textContent = userEmail;
    }

    if(profileNavButtons) profileNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            showProfileSection(button.dataset.section);
        });
    });

    if(passwordChangeForm) passwordChangeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        if (newPassword !== confirmNewPassword) {
            alert('New passwords do not match!');
            return;
        }
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long.');
            return;
        }
        
        let userEmail = sessionStorage.getItem('userEmail');
        if (userEmail) {
            let userIndex = users.findIndex(u => u.email === userEmail);
            if (userIndex > -1 && users[userIndex].password === currentPassword) {
                users[userIndex].password = newPassword;
                saveUsers();
                alert('Password changed successfully!');
            } else {
                alert('Incorrect current password.');
            }
        }
        passwordChangeForm.reset();
    });

    function renderOrderHistory() {
        if (!orderHistoryContainer) return;
        orderHistoryContainer.innerHTML = '';
        const userEmail = sessionStorage.getItem('userEmail');
        const userOrders = orders.filter(order => order.customerEmail === userEmail);

        if (userOrders.length === 0) {
            noOrdersMessage.style.display = 'block';
        } else {
            noOrdersMessage.style.display = 'none';
            userOrders.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(order => {
                const orderItemDiv = document.createElement('div');
                orderItemDiv.classList.add('order-item');
                orderItemDiv.innerHTML = `
                    <h5>Order #${order.orderId}</h5>
                    <p><strong>Date:</strong> ${order.date}</p>
                    <p><strong>Total:</strong> R${order.total.toFixed(2)}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <h6>Items:</h6>
                    <ul>
                        ${order.items.map(item => `<li>${item.name} (x${item.quantity})</li>`).join('')}
                    </ul>
                `;
                orderHistoryContainer.appendChild(orderItemDiv);
            });
        }
    }

    // --- Initial Render on Page Load ---
    renderProducts();
    updateCartUI();
    updateProfileDetails();
});