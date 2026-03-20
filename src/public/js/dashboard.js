const token = localStorage.getItem("token");
if (!token) window.location.replace("login.html");

/* SIDEBAR NAVIGATION */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const page = btn.dataset.page;
    document.querySelectorAll("[id^='page-']").forEach(p => p.classList.add("hidden"));
    document.getElementById("page-" + page).classList.remove("hidden");
  });
});

/* -------- RESTORED FITBIT + WITHINGS CONNECT -------- */

document.getElementById("connectFitbit").addEventListener("click", () => {
  const popup = window.open(`/connect-fitbit?jwt=${token}`, "fitbitAuth", "width=600,height=600");

  window.addEventListener("message", (event) => {
    if (event.data === "fitbit-connected") {
      popup.close();
      fetchMetrics();
      alert("✅ Fitbit connected!");
    }
  });
});

document.getElementById("connectWithings").addEventListener("click", () => {
  const popup = window.open(`/connect-withings?jwt=${token}`, "withingsAuth", "width=600,height=600");

  window.addEventListener("message", (event) => {
    if (event.data === "withings-connected") {
      popup.close();
      fetchMetrics();
      alert("✅ Withings connected!");
    }
  });
});

/* ------------------ METRICS ------------------ */

async function fetchMetrics() {
  const tbody = document.querySelector("#metricsTable tbody");
  tbody.innerHTML = `<tr><td colspan="4" class="loading">Loading metrics...</td></tr>`;

  try {
    const res = await fetch("/api/metrics", {
      headers: { Authorization: "Bearer " + token }
    });
    const metrics = await res.json();

    tbody.innerHTML = "";

    if (!metrics.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state">
            No metrics yet. Add one above or connect a device.
          </td>
        </tr>
      `;
      return;
    }

    metrics.forEach(m => {
      const row = document.createElement("tr");
      if (m.alert) row.classList.add("alert-row");

      row.innerHTML = `
        <td>${m.metric_type}</td>
        <td>${m.value}</td>
        <td>${m.alert ?? ""}</td>
        <td>${new Date(m.recorded_at).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          Failed to load metrics.
        </td>
      </tr>
    `;
  }
}


function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

async function fetchBpMedicationSubtitle() {
  try {
    const res = await fetch("/api/medications/bp-context", {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) return null;

    const meds = await res.json();
    if (!meds.length) return null;

    const first = meds[0];

    return `All blood pressure measurements shown were recorded while taking ${first.name} (started ${formatDateShort(first.started_at)}).`;
  } catch (e) {
    console.warn("BP medication subtitle failed", e);
    return null;
  }
}



let heartRateChart;
async function drawHeartRateChart() {
  const canvas = document.getElementById("heartRateChart");
  const ctx = canvas.getContext("2d");
  
  // 🔄 Loading message
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Segoe UI";
  ctx.fillStyle = "#777";
  ctx.fillText("Loading heart rate trend...", 20, 40);

  try {
    const res = await fetch("/api/metrics", {
      headers: { Authorization: "Bearer " + token }
    });
    const metrics = await res.json();

    const hr = metrics
      .filter(m => m.metric_type === "heart_rate")
      .sort((a,b)=>new Date(a.recorded_at)-new Date(b.recorded_at));

    if (!hr.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "14px Segoe UI";
      ctx.fillStyle = "#666";
      ctx.fillText("No heart rate data available.", 20, 40);
      return;
    }

    const labels = hr.map(m => new Date(m.recorded_at).toLocaleString());
    const values = hr.map(m => Number(m.value));

    if (heartRateChart) heartRateChart.destroy();

    heartRateChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Heart Rate",
          data: values,
          borderColor: "red",
          fill: false
        }]
      },
      options: { responsive: true }
    });

  } catch (err) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText("Failed to load chart.", 20, 40);
  }
}


let bpChart;

async function drawBloodPressureChart() {
  const canvas = document.getElementById("bpChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Segoe UI";
  ctx.fillStyle = "#777";
  ctx.fillText("Loading blood pressure trend...", 20, 40);

  try {
    const [metricsRes, subtitleText] = await Promise.all([
      fetch("/api/metrics", {
        headers: { Authorization: "Bearer " + token }
      }),
      fetchBpMedicationSubtitle()
    ]);

    const metrics = await metricsRes.json();

    const systolic = metrics
      .filter(m => m.metric_type === "blood_pressure_systolic")
      .sort((a,b)=>new Date(a.recorded_at)-new Date(b.recorded_at));

    const diastolic = metrics
      .filter(m => m.metric_type === "blood_pressure_diastolic")
      .sort((a,b)=>new Date(a.recorded_at)-new Date(b.recorded_at));

    if (!systolic.length && !diastolic.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText("No blood pressure data available.", 20, 40);
      return;
    }

    const labels = systolic.map(m =>
      new Date(m.recorded_at).toLocaleDateString()
    );

    const datasets = [];

    if (systolic.length) {
      datasets.push({
        label: "Systolic (mmHg)",
        data: systolic.map(m => Number(m.value)),
        borderWidth: 2,
        fill: false
      });
    }

    if (diastolic.length) {
      datasets.push({
        label: "Diastolic (mmHg)",
        data: diastolic.map(m => Number(m.value)),
        borderDash: [5,5],
        borderWidth: 2,
        fill: false
      });
    }

    if (bpChart) bpChart.destroy();

    bpChart = new Chart(ctx, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Blood Pressure Trend"
          },
          subtitle: {
            display: !!subtitleText,
            text: subtitleText,
            font: {
              size: 12,
              style: "italic"
            },
            padding: {
              bottom: 10
            }
          },
          legend: {
            position: "top"
          }
        }
      }
    });

  } catch (err) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText("Failed to load blood pressure chart.", 20, 40);
  }
}



/* ------------------ ALERTS ------------------ */

async function fetchAlerts() {
  const tbody = document.querySelector("#alertsTable tbody");

  // 🔄 Loading state
  tbody.innerHTML = `
    <tr>
      <td colspan="4" class="loading">Loading alerts...</td>
    </tr>
  `;

  try {
    const res = await fetch("/api/alerts", {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) throw new Error("Failed to fetch alerts");

    const alerts = await res.json();
    tbody.innerHTML = "";

    // 📭 Empty state
    if (!alerts.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state">
            🎉 No alerts yet. Everything looks good.
          </td>
        </tr>
      `;
      return;
    }

    // 📋 Render alerts
    alerts.forEach(a => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${a.metric_type}</td>
        <td>${a.value}</td>
        <td>${a.reason}</td>
        <td>${new Date(a.created_at).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    // ❌ Error state
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          ❌ Failed to load alerts. Please try again later.
        </td>
      </tr>
    `;
  }
}


/* ------------------ SYMPTOMS ------------------ */

async function fetchSymptoms() {
  const tbody = document.querySelector("#symptomsTable tbody");
  tbody.innerHTML = `<tr><td colspan="4" class="loading">Loading symptoms...</td></tr>`;

  try {
    const res = await fetch("/api/symptoms", {
      headers: { Authorization: "Bearer " + token }
    });
    const symptoms = await res.json();

    tbody.innerHTML = "";

    if (!symptoms.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state">
            No symptoms recorded yet.
          </td>
        </tr>
      `;
      return;
    }

    symptoms.forEach(s => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.symptom}</td>
        <td>${s.severity}</td>
        <td>${s.notes ?? ""}</td>
        <td>${new Date(s.recorded_at).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          Failed to load symptoms.
        </td>
      </tr>
    `;
  }
}

/* ------------------ MEDICATIONS ------------------ */

async function fetchMedications() {
  const tbody = document.querySelector("#medicationsTable tbody");
  tbody.innerHTML = `<tr><td colspan="5" class="loading">Loading medications...</td></tr>`;

  try {
    const res = await fetch("/api/medications", {
      headers: { Authorization: "Bearer " + token }
    });

    const meds = await res.json();
    tbody.innerHTML = "";

    if (!meds.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            No medications recorded.
          </td>
        </tr>
      `;
      return;
    }

    meds.forEach(m => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${m.name}</td>
        <td>${m.dose ?? ""}</td>
        <td>${m.frequency ?? ""}</td>
		<td>${m.started_at ? formatDateShort(m.started_at) : "—"}</td>
		<td>${m.ended_at ? formatDateShort(m.ended_at) : "—"}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          Failed to load medications.
        </td>
      </tr>
    `;
  }
}


/* ------------------ Insights ------------------ */
async function fetchInsights() {
  const loading = document.getElementById("insightsLoading");
  const empty = document.getElementById("insightsEmpty");
  const grid = document.getElementById("insightsGrid");

  loading.style.display = "block";
  empty.classList.add("hidden");
  grid.innerHTML = "";

  try {
    const res = await fetch("/api/insights", {
      headers: { Authorization: "Bearer " + token }
    });
	const data = await res.json();
	const insights = data.insights || [];
   	const clinicalSummary = data.clinicalSummary;

    loading.style.display = "none";

    if (!insights || !insights.length) {
      empty.classList.remove("hidden");
      return;
    }
	
	if (!Array.isArray(insights)) {
	  console.error("Invalid insights payload", insights);
	  empty.classList.remove("hidden");
	  return;
    }

    insights.forEach(i => {
	  const card = document.createElement("div");
	  card.className = "insight-card";

	  // ---------------- CORRELATION ----------------
	  if (i.type === "correlation") {
		const unit = i.metricType === "heart_rate" ? "bpm" : "mmHg";
        const icon = i.metric === "heart_rate" ? "❤️" : "🩸";

		card.innerHTML = `
		  <div class="insight-title">
			  ${icon} ${formatMetric(i.metric)}
		  </div>

		  <div class="insight-subtitle">
			  Symptom: ${formatSymptom(i.symptom)}
		  </div>

		  <div class="insight-confidence">
			  Confidence: ${i.confidence ?? "Low"}
		  </div>

		  <div class="insight-metric">
			  Δ ${i.delta > 0 ? "+" : ""}${i.delta} ${unit}
			  on symptom days
		  </div>
		`;
	  }

	  // ---------------- BP TREND ----------------
	  else if (i.type === "bp_trend") {
		card.innerHTML = `
			<div class="insight-title">📈 Blood Pressure Trend</div>
			<div class="insight-confidence">
			  Confidence: ${i.confidence}
			</div>
			<div class="insight-metric">
			  Trend Window: Last ${i.windowDays} days
			</div>
			<div class="insight-metric">
			  ${i.message}
			</div>
		`;
	  }
	  
	  // ---------------- BP STATUS ----------------
	  else if (i.type === "bp_status") {
		card.innerHTML = `
			<div class="insight-title">📈 Blood Pressure Status</div>			
			<div class="insight-metric">
			  Trend Window: Last ${i.details.windowDays} days
			</div>
			<div class="insight-metric">
			  ${i.icon} ${i.status}
			</div>
			<div class="insight-metric">
			  ${i.message}
			</div>
		`;
	  }
	  
	  
	  else if (i.type === "bp_variability") {
		  card.innerHTML = `
			<div class="insight-title">📊 BP Variability</div>
			<div class="insight-metric">
			  Standard deviation: ${i.stdDev} mmHg
			</div>
			<div class="insight-metric">
			  ${i.message}
			</div>
		  `;
		}
		
		
	  else if (i.type === "bp_control") {
		  card.innerHTML = `
			<div class="insight-title">🩸 BP Control</div>
			<div class="insight-metric">
			  ${i.message}
			</div>
		  `;
		}
 


	  grid.appendChild(card);
	});


	
	if (clinicalSummary) {
      renderClinicalSummaryCard(clinicalSummary);
    }

  } catch (e) {
    loading.textContent = "Failed to load insights.";
  }
}


async function loadVitalsSummary() {
  const res = await fetch("/api/summary", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await res.json();

  if (data.meanHeartRate) {
    document.getElementById("meanHrValue").innerText =
      `${data.meanHeartRate.mean} bpm (30-day avg)`;
  }

  if (data.steps) {
    document.getElementById("stepsValue").innerText =
      `${data.steps.mean} steps/day (30-day avg)`;
  }
}


function renderClinicalSummaryCard(summary) {
  const container = document.getElementById("clinicalSummaryContainer");
  if (!container || !summary) return;

  container.innerHTML = `
    <div class="clinical-card" id="doctorSummary">

      <div class="clinical-header">
        <p class="clinical-title">Clinical Health Summary</p>
        <p class="clinical-period">
          Reporting Period: ${summary.period.from} – ${summary.period.to}
        </p>
      </div>

      ${summary.bpStats ? `
      <div class="clinical-block">
        <h3>Blood Pressure Overview</h3>
        <ul>
          ${summary.bpStats.mean ? 
            `<li>Mean systolic blood pressure during the reporting period was ${summary.bpStats.mean} mmHg.</li>` 
            : ""}

          ${summary.bpStats.stdDev ? 
            `<li>Observed systolic variability (standard deviation) was ${summary.bpStats.stdDev} mmHg.</li>` 
            : ""}

          ${summary.bpStats.percentUncontrolled !== null ? 
            `<li>${summary.bpStats.percentUncontrolled}% of recorded days exceeded 140 mmHg systolic threshold.</li>` 
            : ""}
        </ul>
      </div>
      ` : ""}

      <div class="clinical-block">
        <h3>Symptom Reporting</h3>
        <ul>
          ${summary.symptoms.map(s =>
            `<li>${formatSymptom(s.name)} was reported on ${s.daysReported} days with severity ≥ 3.</li>`
          ).join("")}
        </ul>
      </div>

      <div class="clinical-block">
        <h3>Key Observations</h3>
        <ul>
          ${summary.findings.map(f =>
            `<li>
              ${formatMetric(f.metric)} demonstrated a 
              ${f.delta > 0 ? "mean increase" : "mean decrease"} 
              of ${Math.abs(f.delta)} ${f.unit} 
              on days when ${formatSymptom(f.symptom)} was reported 
              (confidence level: ${f.confidence}).
            </li>`
          ).join("")}
        </ul>
      </div>

      <div class="clinical-block">
        <h3>Clinical Interpretation</h3>
        <ul>
          ${summary.interpretation.map(i => `<li>${i}</li>`).join("")}
        </ul>
      </div>

      <div class="clinical-block">
        <h3>Recommended Discussion Points</h3>
        <ul>
          ${summary.discussionPoints.map(p => `<li>${p}</li>`).join("")}
        </ul>
        </div>

      <p class="clinical-disclaimer">
        This automated report is generated from patient-recorded health data and is intended 
        to support clinical evaluation. It does not replace medical judgment.
      </p>

      <button id="printSummaryBtn">Print Summary</button>

    </div>
  `;
  
    // Attach event safely (CSP compliant)
    const btn = document.getElementById("printSummaryBtn");
    if (btn) {
		btn.addEventListener("click", printDoctorSummary);
	}
}


function printDoctorSummary() {
  const summary = document.getElementById("doctorSummary");
  if (!summary) return;

  window.print();
}


/* SUBMIT METRICS */
document.getElementById("metricForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    metricType: e.target.metricType.value,
    value: Number(e.target.value.value)
  };

  const res = await fetch("/api/metrics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    e.target.reset();
    fetchMetrics();
    drawHeartRateChart();
    showToast("✅ Metric saved successfully");
  } else {
    showToast("❌ Failed to save metric", "error");
  }
});


/* SUBMIT SYMPTOMS */
document.getElementById("symptomForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    symptom: e.target.symptom.value,
    severity: Number(e.target.severity.value),
    notes: e.target.notes.value
  };

  const res = await fetch("/api/symptoms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    e.target.reset();
    fetchSymptoms();
    showToast("🩺 Symptom added");
  } else {
    showToast("❌ Failed to add symptom", "error");
  }
});


/* SUBMIT MEDICATION */
document.getElementById("medicationForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: e.target.name.value,
    dose: e.target.dose.value,
    frequency: e.target.frequency.value,
    started_at: e.target.started_at.value,
    ended_at: e.target.ended_at.value || null,
    notes: e.target.notes.value
  };

  const res = await fetch("/api/medications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    e.target.reset();
    fetchMedications();
    fetchInsights(); // ⬅️ medication-aware insights later
    showToast("💊 Medication added");
  } else {
    showToast("❌ Failed to add medication", "error");
  }
});


document.getElementById("bloodPressureForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    systolic: Number(e.target.systolic.value),
    diastolic: Number(e.target.diastolic.value),
	timeOfDay: e.target.timeOfDay.value,
	posture: e.target.posture.value,
	device: e.target.device.value
  };

  const res = await fetch("/api/blood-pressure", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    e.target.reset();
    fetchMetrics();
    fetchInsights();
    showToast("🩸 Blood pressure saved");
  } else {
    showToast("❌ Failed to save blood pressure", "error");
  }
});

function formatSymptom(symptom) {
  if (!symptom) return "Unknown";

  return symptom
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatMetric(metric) {
  return metric
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

async function loadBpMedicationEffectiveness() {
  const container =
    document.getElementById("bpMedicationEffectiveness");

  container.innerHTML = "Loading medication analysis...";

  try {
    const res = await fetch(
      "/api/medications/bp-effectiveness",
      {
        headers: { Authorization: "Bearer " + token }
      }
    );

    const data = await res.json();

    if (!data.length) {
      container.innerHTML =
        "Not enough data to evaluate medication effectiveness.";
      return;
    }

    container.innerHTML = "";

    data.forEach(med => {
      const changeText =
        med.systolic_change_from_previous !== null
          ? `<div class="delta">
               Δ ${med.systolic_change_from_previous} mmHg
             </div>`
          : "";

      container.innerHTML += `
        <div class="med-card">
          <h4>${med.name}</h4>
          <p>Avg systolic: <strong>${med.avg_systolic}</strong> mmHg</p>
          <p>Avg diastolic: <strong>${med.avg_diastolic}</strong> mmHg</p>
          <p>Variability (SD): ${med.systolic_sd} mmHg</p>
          <p>Control rate: ${med.control_rate}%</p>
          <p>Readings: ${med.readings_count}</p>
          ${changeText}
        </div>
      `;
    });

  } catch (err) {
    container.innerHTML =
      "Failed to load medication effectiveness.";
  }
}

fetchMetrics();
drawHeartRateChart();
fetchAlerts();
fetchSymptoms();
fetchMedications();
fetchInsights();
drawBloodPressureChart();
loadVitalsSummary();
loadBpMedicationEffectiveness();
loadDoctorList();
loadSettings();

// FEEDBACK PAGE REDIRECT
document.getElementById("feedbackBtn").addEventListener("click", () => {
  window.location.href = "feedback.html";
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;

  toast.style.background = type === "success" ? "#4CAF50" : "#e74c3c";
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}


document.getElementById("logoutBtn").addEventListener("click", logout);
function logout() {
  localStorage.removeItem("token");
  window.location.replace("login.html");
}


/* ------------------ DATA SHARING ------------------ */

document.getElementById("shareDoctorBtn")
  ?.addEventListener("click", shareWithDoctor);

async function shareWithDoctor() {
  const emailInput = document.getElementById("doctorEmailInput");
  const statusDiv = document.getElementById("shareStatus");
  const email = emailInput.value.trim();

  if (!email) {
    statusDiv.innerText = "Please enter a doctor email.";
    return;
  }

  statusDiv.innerText = "Processing...";

  try {
    const res = await fetch("/api/share-with-doctor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ doctorEmail: email })
    });

    const data = await res.json();

    if (!res.ok) {
      statusDiv.innerText = data.message || "Failed to grant access.";
      return;
    }

    emailInput.value = "";
    statusDiv.innerText = "✅ Access granted successfully.";

    loadDoctorList();

  } catch (err) {
    statusDiv.innerText = "❌ Server error.";
  }
}


async function loadDoctorList() {
  const list = document.getElementById("doctorList");
  if (!list) return;

  list.innerHTML = "<li>Loading...</li>";

  try {
    const res = await fetch("/api/my-doctors", {
      headers: { Authorization: "Bearer " + token }
    });
	console.log('res = ', res);

    const doctors = await res.json();

    if (!doctors.length) {
      list.innerHTML = "<li>No doctors connected.</li>";
      return;
    }

    list.innerHTML = "";

    doctors.forEach(doc => {
	  const li = document.createElement("li");

	  // create email text
	  const emailText = document.createTextNode(doc.email + " ");
	  li.appendChild(emailText);

	  // create button
	  const button = document.createElement("button");
	  button.textContent = "❌ Revoke";
	  button.style.marginLeft = "10px";

	  // attach click handler
	  button.addEventListener("click", () => revokeDoctor(doc.id));

	  // add button to li
	  li.appendChild(button);

	  // add li to list
	  list.appendChild(li);
	});

  } catch (err) {
    list.innerHTML = "<li>Failed to load doctors.</li>";
  }
}


async function revokeDoctor(doctorId) {
  if (!confirm("Are you sure you want to revoke access?")) return;

  try {
    const res = await fetch(`/api/revoke-doctor/${doctorId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    if (res.ok) {
      showToast("Access revoked");
      loadDoctorList();
    } else {
      showToast("Failed to revoke access", "error");
    }

  } catch (err) {
    showToast("Server error", "error");
  }
}

async function loadSettings() {
  try {
    const res = await fetch("/api/preferences", {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) return;

    const data = await res.json();

    document.getElementById("weightUnit").value = data.weight_unit;
    document.getElementById("temperatureUnit").value = data.temperature_unit;

  } catch (err) {
    console.error("Failed to load settings", err);
  }
}

document.getElementById("settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const weight_unit = document.getElementById("weightUnit").value;
  const temperature_unit = document.getElementById("temperatureUnit").value;

  try {
    const res = await fetch("/api/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ weight_unit, temperature_unit })
    });
	
	const text = await res.text();

    if (!res.ok) throw new Error();

    document.getElementById("settingsMessage").innerText = "✅ Settings saved";

  } catch (err) {
    document.getElementById("settingsMessage").innerText = "❌ Failed to save";
  }
});