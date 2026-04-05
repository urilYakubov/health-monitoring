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
	
	patients.sort((a, b) => b.risk_score - a.risk_score);

    list.innerHTML = "";

    patients.forEach(patient => {

      const li = document.createElement("li");
	  li.className = "patient-card";

	  const status = getStatus(patient.risk_score);

	  li.innerHTML = `
		<div class="card-left ${status.color}"></div>

		<div class="card-content">
		  
		  <div class="card-header">
			<div>
			  <strong>${patient.first_name} ${patient.last_name}</strong>
			  <span>
				${patient.sex || ""}, ${getAge(patient.date_of_birth)} · NYHA ${patient.nyha_class || "-"}
			  </span>
			  <div class="sub">
				${patient.email} · Granted ${formatDate(patient.granted_at)}
			  </div>
			</div>

			<div class="risk-box">
			  <div class="risk-score">${patient.risk_score}</div>
			  <div class="risk-label">risk / 100</div>
			  <div class="risk-action">${status.label}</div>
			</div>
		  </div>
		  
		  <div class="metrics">
			  <span>Systolic <b>${patient.systolic || "-"}</b> mmHg</span>

			  <span>
				Weight 
				<b>${getWeightDisplay(patient.current_weight, patient.baseline_weight)}</b>
				vs baseline
			  </span>

			  <span>HR <b>${patient.heart_rate || "-"}</b> bpm</span>
			  
			  <span><b>${patient.alerts_count}</b> alerts</span>
			  
			  ${
				patient.alerts_count > 0
				  ? `<button class="ack-btn" data-id="${patient.id}">
					   ✅ Acknowledge Alerts
					 </button>`
				  : ""
			  }
			  
		  </div>

		</div>
	  `;
	  
	  // attach button event 
	  li.querySelectorAll(".ack-btn").forEach(btn => {
		btn.addEventListener("click", async (e) => {
		  e.stopPropagation();

		  const patientId = btn.dataset.id;
		  await acknowledgePatientAlerts(patientId);
		});
	  });

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

function getAge(dob) {
  if (!dob) return "-";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function getStatus(score) {
  if (score >= 70) return { label: "Call today", color: "red" };
  if (score >= 40) return { label: "Monitor", color: "orange" };
  return { label: "Stable", color: "green" };
}

function getWeightDisplay(current, baseline) {
  if (!current || !baseline) return "-";

  const curr = Number(current);
  const base = Number(baseline);

  if (isNaN(curr) || isNaN(base)) return "-";

  const diff = curr - base;
  const sign = diff >= 0 ? "+" : "";

  return `${sign}${diff.toFixed(1)} kg`;
}

async function acknowledgePatientAlerts(patientId) {
  try {
    const res = await fetch(`/api/patients/${patientId}/acknowledge-alerts`, {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error();

    alert("✅ Alerts acknowledged");

    loadPatientList(); // 🔄 refresh UI

  } catch (err) {
    console.error(err);
    alert("❌ Failed to acknowledge alerts");
  }
}


