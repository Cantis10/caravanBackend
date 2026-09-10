const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const successMessage = document.getElementById("success-message");
const loginButton = document.getElementById("loginButton");


function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";

  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 2000);
}


loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get values
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Hide previous messages
  errorMessage.style.display = "none";
  successMessage.style.display = "none";


  // Check if email is empty
  if (email === "") {
    showError("Please enter your email address.");
    return;
  }


  // Validate email
  if (!validateEmail(email)) {
    showError("That isn't a valid email address.");
    return;
  }


  // Check if password is empty
  if (password === "") {
    showError("Please enter your password.");
    return;
  }


  // Validate password length
  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    return;
  }


  // Loading state
  loginButton.textContent = "Signing In...";
  loginButton.disabled = true;


  // Successful login simulation
  setTimeout(() => {

    successMessage.textContent = "Login successful!";
    successMessage.style.display = "block";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  }, 1000);

});