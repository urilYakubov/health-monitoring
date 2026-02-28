document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const API_BASE = window.env?.BASE_URL || "";

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMessage.textContent = data.message || "Login failed";
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      errorMessage.textContent = "An error occurred. Please try again.";
    }
  });
});