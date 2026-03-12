const token = localStorage.getItem("token");
if (!token) window.location.replace("login.html");

/* ------------------ Navigation ------------------ */

document.querySelectorAll(".nav-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    const page = btn.dataset.page;

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

    const target = document.getElementById(page + "Page");
    if (target) target.classList.add("active");

  });

});

document.addEventListener("DOMContentLoaded", () => {

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  loadPatientList();
  setupLogout();

});


/* ------------------ Logout ------------------ */

function setupLogout() {
  const btn = document.getElementById("logoutBtn");

  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    window.location.href = "login.html";
  });
}


/* ------------------ Patient List ------------------ */

async function loadPatientList() {

  const list = document.getElementById("patientList");

  if (!list) return;

  list.innerHTML = "<li>Loading...</li>";

  try {

    const res = await fetch("/api/my-patients", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) {
      list.innerHTML = "<li>Failed to load patients</li>";
      return;
    }

    const patients = await res.json();

    if (!patients.length) {
      list.innerHTML = "<li>No patients connected.</li>";
      return;
    }

    list.innerHTML = "";

    patients.forEach(patient => {

      const li = document.createElement("li");
	  li.className = "patient-row";
	  
	  li.innerHTML = `
		<div class="patient-info">
		  <strong>${patient.email}</strong>
		  <span class="granted-date">
			Granted ${new Date(patient.granted_at).toLocaleDateString()}
		  </span>
		</div>
		<div class="patient-arrow">→</div>
	  `;

      li.addEventListener("click", () => {
		  window.location.href = `patient-details.html?id=${patient.id}`;
		});

      list.appendChild(li);

    });

  } catch (err) {

    console.error(err);
    list.innerHTML = "<li>Failed to load patients</li>";

  }

}
