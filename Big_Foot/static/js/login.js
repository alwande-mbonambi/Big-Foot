document.addEventListener('DOMContentLoaded', function() {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const switchSignup = document.getElementById('switchSignup');
    const switchLogin = document.getElementById('switchLogin');
    const noAccountText = document.querySelector('.no-account');
    const hasAccountText = document.querySelector('.has-account');

    // Load users from localStorage or initialize with dummy data
    let users = JSON.parse(localStorage.getItem('bigfootUsers')) || [
        { email: 'admin@bigfoot.com', password: 'adminpassword', role: 'admin', name: 'Big Foot Admin' },
        { email: 'user@example.com', password: 'userpassword', role: 'customer', name: 'Demo User' }
    ];

    // Save users to localStorage
    function saveUsers() {
        localStorage.setItem('bigfootUsers', JSON.stringify(users));
    }

    function showLoginForm() {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        noAccountText.style.display = 'block';
        hasAccountText.style.display = 'none';
    }

    function showSignupForm() {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        noAccountText.style.display = 'none';
        hasAccountText.style.display = 'block';
    }

    // Event Listeners for the tab buttons
    if (loginTab) loginTab.addEventListener('click', showLoginForm);
    if (signupTab) signupTab.addEventListener('click', showSignupForm);

    // Event Listeners for the text links below the form
    if (switchSignup) switchSignup.addEventListener('click', showSignupForm);
    if (switchLogin) switchLogin.addEventListener('click', showLoginForm);

    // Handle Login Form Submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Store login status and user role in sessionStorage
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userRole', user.role);
            sessionStorage.setItem('userName', user.name);
            sessionStorage.setItem('userEmail', user.email); // Store email for potential profile display

            alert(`Login successful! Welcome, ${user.name}.`);

            if (user.role === 'admin') {
                window.location.href = 'admin_side.html'; // Redirect to admin panel
            } else {
                window.location.href = 'client_side.html'; // Redirect to client side
            }
        } else {
            alert('Invalid email or password.');
        }
    });

    // Handle Signup Form Submission
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (users.some(u => u.email === email)) {
            alert('An account with this email already exists.');
            return;
        }

        // Add new user
        const newUser = {
            email: email,
            password: password, // In a real app, hash this password!
            role: 'customer', // New users are customers by default
            name: name
        };
        users.push(newUser);
        saveUsers(); // Save updated users array to localStorage

        alert('Account created successfully! Please log in.');
        loginForm.reset(); // Clear login form
        signupForm.reset(); // Clear signup form
        showLoginForm(); // Switch back to login tab
    });

    // Initial state: show login form when the page loads
    // Ensure elements exist before trying to manipulate them
    if (loginForm && signupForm && loginTab && signupTab && noAccountText && hasAccountText) {
        showLoginForm();
    }
});