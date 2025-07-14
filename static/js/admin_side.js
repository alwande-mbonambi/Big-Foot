document.addEventListener('DOMContentLoaded', () => {
    // --- Access Control (VERY IMPORTANT: Keep at the top) ---
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');

    if (isLoggedIn !== 'true' || userRole !== 'admin') {
        alert('Access Denied. Please log in as an administrator.');
        window.location.href = 'login.html'; // Redirect to login page
        return; // Stop further execution of admin.js
    }

    // --- DOM Elements ---
    const adminNavButtons = document.querySelectorAll('.admin-nav-btn');
    const adminSections = document.querySelectorAll('.admin-section');
    const adminLogoutButton = document.getElementById('admin-logout-button'); // Ensure your admin logout button has this ID

    // Dashboard Elements
    const totalProductsDisplay = document.getElementById('total-products');
    const totalOrdersDisplay = document.getElementById('total-orders');
    const registeredUsersDisplay = document.getElementById('registered-users');

    // Product Management Elements
    const addProductBtn = document.getElementById('add-product-btn');
    const productListContainer = document.getElementById('product-list-container');
    const noProductsMessage = document.getElementById('no-products-message');
    const productModal = document.getElementById('product-modal');
    const productModalCloseButton = document.getElementById('product-close-button');
    const modalTitle = document.getElementById('modal-title');
    const productForm = document.getElementById('product-form'); // The form inside the modal
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');

    // Order Management Elements
    const orderListContainer = document.getElementById('order-list-container');
    const noAdminOrdersMessage = document.getElementById('no-admin-orders-message');

    // User Management Elements
    const userListContainer = document.getElementById('user-list-container');
    const noUsersMessage = document.getElementById('no-users-message');


    // --- Data Persistence (Load from localStorage, or initialize empty) ---
    // Make sure 'bigfootProducts', 'bigfootOrders', and 'bigfootUsers' keys are consistent
    // with login.js and client_side.js
    let products = JSON.parse(localStorage.getItem('bigfootProducts')) || [];
    let orders = JSON.parse(localStorage.getItem('bigfootOrders')) || [];
    let users = JSON.parse(localStorage.getItem('bigfootUsers')) || [];

    // Save data to localStorage
    function saveProducts() {
        localStorage.setItem('bigfootProducts', JSON.stringify(products));
    }

    function saveOrders() {
        localStorage.setItem('bigfootOrders', JSON.stringify(orders));
    }

    function saveUsers() {
        localStorage.setItem('bigfootUsers', JSON.stringify(users));
    }

    // --- Section Switching Logic ---
    function showAdminSection(sectionId) {
        adminSections.forEach(section => {
            section.style.display = 'none'; // Hide all sections
        });
        document.getElementById(sectionId).style.display = 'block'; // Show the target section

        adminNavButtons.forEach(button => {
            button.classList.remove('active'); // Deactivate all nav buttons
        });
        document.querySelector(`.admin-nav-btn[data-section="${sectionId}"]`).classList.add('active'); // Activate current button

        // Re-render data and update dashboard stats when switching to relevant sections
        if (sectionId === 'dashboard-section') {
            updateDashboardStats();
        } else if (sectionId === 'products-section') {
            renderProducts();
        } else if (sectionId === 'orders-section') {
            renderAdminOrders();
        } else if (sectionId === 'users-section') {
            renderUsers();
        }
    }

    // --- Dashboard Stats Update ---
    function updateDashboardStats() {
        totalProductsDisplay.textContent = products.length;
        totalOrdersDisplay.textContent = orders.length;
        // Filter out admin user from count if desired, or count all users
        registeredUsersDisplay.textContent = users.filter(user => user.role === 'customer').length;
    }


    // --- Product Management Functions ---

    function renderProducts() {
        productListContainer.innerHTML = ''; // Clear existing products
        if (products.length === 0) {
            noProductsMessage.style.display = 'block';
            return;
        } else {
            noProductsMessage.style.display = 'none';
        }

        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.classList.add('data-item', 'product-item');
            productItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-thumbnail">
                <div class="data-item-details">
                    <h4>${product.name}</h4>
                    <p>ID: ${product.id}</p>
                    <p>Price: R${product.price.toFixed(2)}</p>
                </div>
                <div class="data-item-actions">
                    <button class="edit-button" data-id="${product.id}">Edit</button>
                    <button class="delete-button" data-id="${product.id}">Delete</button>
                </div>
            `;
            productListContainer.appendChild(productItem);
        });

        // Add event listeners for edit and delete buttons after rendering
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (event) => editProduct(event.target.dataset.id));
        });
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (event) => deleteProduct(event.target.dataset.id));
        });
    }

    // Add/Edit Product Form Submission
    productForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        const id = productIdInput.value;
        const name = productNameInput.value;
        const price = parseFloat(productPriceInput.value);
        const image = productImageInput.value;

        if (!name || isNaN(price) || !image) {
            alert('Please fill in all product fields correctly.');
            return;
        }

        if (id) {
            // Edit existing product
            const productIndex = products.findIndex(p => p.id == id);
            if (productIndex > -1) {
                products[productIndex] = { id: parseInt(id), name, price, image };
                alert('Product updated successfully!');
            }
        } else {
            // Add new product
            const newProductId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            const newProduct = { id: newProductId, name, price, image };
            products.push(newProduct);
            alert('Product added successfully!');
        }

        saveProducts(); // Save changes to localStorage
        renderProducts(); // Re-render the product list
        productModal.style.display = 'none'; // Close the modal
        productForm.reset(); // Clear the form
        updateDashboardStats(); // Update dashboard stats after product change
    });

    // Open Add Product Modal
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            modalTitle.textContent = 'Add New Product';
            productForm.reset(); // Clear previous data
            productIdInput.value = ''; // Ensure ID is empty for new product
            productModal.style.display = 'block';
        });
    }

    // Open Edit Product Modal
    function editProduct(productId) {
        const productToEdit = products.find(p => p.id == productId);
        if (productToEdit) {
            modalTitle.textContent = 'Edit Product';
            productIdInput.value = productToEdit.id;
            productNameInput.value = productToEdit.name;
            productPriceInput.value = productToEdit.price;
            productImageInput.value = productToEdit.image;
            productModal.style.display = 'block';
        }
    }

    // Delete Product
    function deleteProduct(productId) {
        if (confirm(`Are you sure you want to delete product ID: ${productId}?`)) {
            products = products.filter(p => p.id != productId);
            saveProducts();
            renderProducts();
            alert('Product deleted successfully!');
            updateDashboardStats(); // Update dashboard stats after product change
        }
    }

    // --- Order Management Functions ---
    function renderAdminOrders() {
        orderListContainer.innerHTML = ''; // Clear existing orders
        if (orders.length === 0) {
            noAdminOrdersMessage.style.display = 'block';
            return;
        } else {
            noAdminOrdersMessage.style.display = 'none';
        }

        // Sort orders by date descending (most recent first)
        const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('data-item', 'order-item');
            orderItem.innerHTML = `
                <div class="data-item-details">
                    <h4>Order #${order.orderId}</h4>
                    <p>Customer: ${order.customerEmail}</p>
                    <p>Total: R${order.total.toFixed(2)}</p>
                    <p>Date: ${order.date}</p>
                    <p>Status: <span class="order-status ${order.status.toLowerCase()}">${order.status}</span></p>
                    <h6>Items:</h6>
                    <ul>
                        ${order.items.map(item => `<li>${item.name} (x${item.quantity})</li>`).join('')}
                    </ul>
                </div>
                <div class="data-item-actions">
                    <select class="order-status-select" data-id="${order.orderId}">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            `;
            orderListContainer.appendChild(orderItem);
        });

        // Add event listeners for status change
        document.querySelectorAll('.order-status-select').forEach(select => {
            select.addEventListener('change', (event) => updateOrderStatus(event.target.dataset.id, event.target.value));
        });
    }

    function updateOrderStatus(orderId, newStatus) {
        const orderIndex = orders.findIndex(o => o.orderId == orderId);
        if (orderIndex > -1) {
            orders[orderIndex].status = newStatus;
            saveOrders();
            renderAdminOrders(); // Re-render to update status display
            alert(`Order #${orderId} status updated to ${newStatus}`);
        }
    }


    // --- User Management Functions ---
    function renderUsers() {
        userListContainer.innerHTML = ''; // Clear existing users
        if (users.length === 0) {
            noUsersMessage.style.display = 'block';
            return;
        } else {
            noUsersMessage.style.display = 'none';
        }

        // Filter out admin user if you don't want to display them in the general user list
        const customerUsers = users.filter(user => user.role === 'customer');

        customerUsers.forEach(user => {
            const userItem = document.createElement('div');
            userItem.classList.add('data-item', 'user-item');
            userItem.innerHTML = `
                <div class="data-item-details">
                    <h4>${user.name || 'N/A'}</h4>
                    <p>Email: ${user.email}</p>
                    <p>Role: ${user.role}</p>
                </div>
                `;
            userListContainer.appendChild(userItem);
        });
    }


    // --- General Event Listeners ---

    // Admin Navigation
    adminNavButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = event.target.dataset.section;
            if (sectionId) {
                showAdminSection(sectionId);
            }
        });
    });

    // Close product modal when clicking close button
    if (productModalCloseButton) {
        productModalCloseButton.addEventListener('click', () => {
            productModal.style.display = 'none';
            productForm.reset();
        });
    }

    // Close product modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === productModal) {
            productModal.style.display = 'none';
            productForm.reset();
        }
    });

    // Admin Logout
    if (adminLogoutButton) {
        adminLogoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (confirm('Are you sure you want to log out from the admin panel?')) {
                sessionStorage.clear(); // Clear session storage
                localStorage.removeItem('userEmail'); // Clear specific user data if stored separately
                alert('Admin logged out successfully.');
                window.location.href = 'login.html'; // Redirect to login page
            }
        });
    }

    // --- Initial Render on Page Load ---
    updateDashboardStats(); // Update dashboard stats on load
    showAdminSection('dashboard-section'); // Show dashboard by default when admin page loads

});