document.getElementById("logoutBtn").addEventListener("click", logout);
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
	