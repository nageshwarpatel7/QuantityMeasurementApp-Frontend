// DOM Elements
const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');

// Tab Switching
function showLoginForm() {
    loginBox.style.display = 'block';
    signupBox.style.display = 'none';
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
}

function showSignupForm() {
    loginBox.style.display = 'none';
    signupBox.style.display = 'block';
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
}

// =============================================
// SIGNUP - POST /auth/user/register
// Backend expects: { username, email, password, role }
// Backend returns: { token, message }
// =============================================
async function handleSignupAPI(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const signupData = {
        username: username,
        email: email,
        password: password,
        role: "USER"
    };

    try {
        const response = await fetch("http://localhost:8080/auth/user/register", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Server error: ${response.status}`);
        }

        console.log('Signup success:', result);
        alert(result.message || 'Registration successful! Please login.');
        showLoginForm();

    } catch (error) {
        console.error('Error during signup:', error);
        alert('Signup failed: ' + error.message);
    }
}

// =============================================
// LOGIN - POST /auth/user/login
// Backend expects: { email, password }
// Backend returns: { token, message }
// =============================================
async function handleLoginAPI(event) {
    event.preventDefault();

    const emailInput = document.querySelector('#login-box input[type="email"]');
    const passwordInput = document.querySelector('#login-box input[type="password"]');

    const loginData = {
        email: emailInput.value,
        password: passwordInput.value
    };

    try {
        const response = await fetch("http://localhost:8080/auth/user/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Server error: ${response.status}`);
        }

        console.log('Login success:', result);

        if (result.token) {
            localStorage.setItem("token", result.token);
            // AuthResponse has no username field, store email instead
            localStorage.setItem("userEmail", loginData.email);
            window.location.href = "../html/dashboard.html";
        } else {
            throw new Error("Token not received in response.");
        }

    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed: ' + error.message);
    }
}

// Event Listeners
document.getElementById('formSignup').addEventListener('submit', handleSignupAPI);
document.getElementById('formLogin').addEventListener('submit', handleLoginAPI);