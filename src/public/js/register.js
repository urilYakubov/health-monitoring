const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
	const first_name = document.getElementById('first_name').value.trim();
	const last_name = document.getElementById('last_name').value.trim();

    try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, first_name, last_name})
    });

    const data = await res.json();

    if (!res.ok) {
        errorMessage.textContent = data.message || 'Registration failed';
        return;
    }

    alert('✅ Registration successful! Please login.');
    window.location.href = 'login.html';
    } catch (err) {
        console.error(err);
        errorMessage.textContent = 'An error occurred. Please try again.';
    }
});