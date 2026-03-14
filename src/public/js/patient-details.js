const token = localStorage.getItem("token");

const params = new URLSearchParams(window.location.search);
const patientId = params.get("id");

document.addEventListener("DOMContentLoaded", () => {

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  if (!patientId) {
    alert("Patient not specified");
    window.location.href = "doctor-dashboard.html";
    return;
  }

  fetchPatientInsights();
  loadVitalsSummary();
  drawHeartRateChart(patientId);
  drawBloodPressureChart(patientId);
  loadBpMedicationEffectiveness(patientId);
  fetchSymptoms(patientId);
  fetchMedications(patientId);
  setupLogout();

});

/* ------------------ Navigation ------------------ */

document.querySelectorAll(".nav-btn[data-page]").forEach(btn => {

  btn.addEventListener("click", () => {

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const page = btn.dataset.page;

    // Hide all sections
    document.getElementById("insightsSection").classList.add("hidden");
    document.getElementById("clinicalSummaryContainer").classList.add("hidden");
    document.getElementById("vitals-summary").classList.add("hidden");
    document.querySelectorAll("[id^='page-']").forEach(p => p.classList.add("hidden"));

    // Show selected page
    if (page === "insights") {
      document.getElementById("insightsSection").classList.remove("hidden");
      document.getElementById("clinicalSummaryContainer").classList.remove("hidden");
      document.getElementById("vitals-summary").classList.remove("hidden");
    } else {
      document.getElementById("page-" + page).classList.remove("hidden");
    }

  });

});


/* ---------------- Fetch Insights ---------------- */

async function fetchPatientInsights() {

  const grid = document.getElementById("insightsGrid");
  const loading = document.getElementById("insightsLoading");
  const empty = document.getElementById("insightsEmpty");

  loading.style.display = "block";
  grid.innerHTML = "";
  empty.classList.add("hidden");

  try {

    const res = await fetch(`/api/patients/${patientId}/insights`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) {
      loading.textContent = "Failed to load insights";
      return;
    }

    const data = await res.json();
    const insights = data.insights || [];
	const clinicalSummary = data.clinicalSummary;

    loading.style.display = "none";

    if (!insights.length) {
      empty.classList.remove("hidden");
      return;
    }

    insights.forEach(i => {

      const card = document.createElement("div");
      card.className = "insight-card";

      /* -------- CORRELATION -------- */

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
            Δ ${i.delta > 0 ? "+" : ""}${i.delta} ${unit} on symptom days
          </div>
        `;
      }

      /* -------- BP TREND -------- */

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

      /* -------- BP VARIABILITY -------- */

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

      /* -------- BP CONTROL -------- */

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

  } catch (err) {

    console.error(err);
    loading.textContent = "Failed to load insights.";

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

      <button onclick="printDoctorSummary()">Print Summary</button>

    </div>
  `;
}

function printDoctorSummary() {
  const summary = document.getElementById("doctorSummary");
  if (!summary) return;

  window.print();
}

async function loadVitalsSummary() {
  const res = await fetch(`/api/summary/patients/${patientId}`, {
    headers: {
      Authorization: "Bearer " + token
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


/* ---------------- Helpers ---------------- */

function formatMetric(metric) {

  if (metric === "heart_rate") return "Heart Rate";
  if (metric === "bp_systolic") return "Blood Pressure (Systolic)";
  if (metric === "bp_diastolic") return "Blood Pressure (Diastolic)";

  return metric;
}


function formatSymptom(symptom) {

  if (!symptom) return "Unknown";

  return symptom
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

}


/* ---------------- Navigation ---------------- */

function goBack() {
  window.location.href = "doctor-dashboard.html";
}


/* ---------------- Logout ---------------- */

function setupLogout() {

  const btn = document.getElementById("logoutBtn");

  if (!btn) return;

  btn.addEventListener("click", () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "login.html";

  });

}

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}


async function fetchBpMedicationSubtitle(patientId) {
  try {
    const res = await fetch(`/api/medications/patient/${patientId}/bp-context`, {
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
async function drawHeartRateChart(patientId) {
  const canvas = document.getElementById("heartRateChart");
  const ctx = canvas.getContext("2d");
  
  // 🔄 Loading message
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Segoe UI";
  ctx.fillStyle = "#777";
  ctx.fillText("Loading heart rate trend...", 20, 40);

  try {
	const res = await fetch(`/api/patients/${patientId}/metrics`, {
      headers: {
        Authorization: "Bearer " + token
      }
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

async function drawBloodPressureChart(patientId) {
  const canvas = document.getElementById("bpChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Segoe UI";
  ctx.fillStyle = "#777";
  ctx.fillText("Loading blood pressure trend...", 20, 40);

  try {
    const [metricsRes, subtitleText] = await Promise.all([
      fetch(`/api/patients/${patientId}/metrics`, {
        headers: { Authorization: "Bearer " + token }
      }),
      fetchBpMedicationSubtitle(patientId)
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

async function loadBpMedicationEffectiveness(patientId) {
  const container =
    document.getElementById("bpMedicationEffectiveness");

  container.innerHTML = "Loading medication analysis...";

  try {
	const res = await fetch(`/api/medications/patient/${patientId}/bp-effectiveness`, {
      headers: { Authorization: "Bearer " + token }
    });

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

/* ------------------ SYMPTOMS ------------------ */

async function fetchSymptoms(patientId) {
  const tbody = document.querySelector("#symptomsTable tbody");
  tbody.innerHTML = `<tr><td colspan="4" class="loading">Loading symptoms...</td></tr>`;

  try {
    const res = await fetch(`/api/symptoms/patient/${patientId}`, {
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

async function fetchMedications(patientId) {
  const tbody = document.querySelector("#medicationsTable tbody");
  tbody.innerHTML = `<tr><td colspan="5" class="loading">Loading medications...</td></tr>`;

  try {
    const res = await fetch(`/api/medications/patient/${patientId}`, {
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