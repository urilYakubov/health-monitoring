async function submitFeedback(e) {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const category = e.target.category.value;
      const message = e.target.message.value;

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ category, message })
      });

      const msg = document.getElementById('feedbackMsg');
      if (res.ok) {
        msg.textContent = "✅ Thank you for your feedback!";
        e.target.reset();
      } else {
        msg.textContent = "❌ Failed to send feedback. Please try again.";
      }
}

document.getElementById('feedbackForm').addEventListener('submit', submitFeedback);

document.getElementById("logoutBtn").addEventListener("click", logout);
function logout() {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
}