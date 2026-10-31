
document.addEventListener("DOMContentLoaded", function () {

    // REGISTER FORM
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("fullName").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const message = document.getElementById("registerMessage");

            if (!name || !email || !phone || !password || !confirmPassword) {
                message.textContent = "Please fill in all fields.";
                message.style.color = "red";
                return;
            }

            if (password.length < 8) {
                message.textContent =
                    "Password must contain at least 8 characters.";
                message.style.color = "red";
                return;
            }

            if (password !== confirmPassword) {
                message.textContent = "Passwords do not match.";
                message.style.color = "red";
                return;
            }

            if (!document.getElementById("terms").checked) {
                message.textContent =
                    "Please accept the Terms and Privacy Policy.";
                message.style.color = "red";
                return;
            }

            // Demo registration only; no password is stored.
            sessionStorage.setItem("rhDemoName", name);
            sessionStorage.setItem("rhDemoEmail", email);

            message.textContent =
                "Registration successful! Redirecting...";
            message.style.color = "green";

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);
        });
    }

    // LOGIN FORM
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const message = document.getElementById("loginMessage");

            if (!email || !password) {
                message.textContent = "Please enter email and password.";
                message.style.color = "red";
                return;
            }

            // Demo login only; no account is verified.
            sessionStorage.setItem("rhDemoEmail", email);

            message.textContent =
                "Demo login successful! Redirecting...";
            message.style.color = "green";

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);
        });
    }

    // FORGOT PASSWORD
    const forgotPassword = document.getElementById("forgotPassword");

    if (forgotPassword) {
        forgotPassword.addEventListener("click", function (event) {
            event.preventDefault();
            alert("Password recovery is not available yet.");
        });
    }

});
