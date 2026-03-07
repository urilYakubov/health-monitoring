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
  setupLogout();

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

  } catch (err) {

    console.error(err);
    loading.textContent = "Failed to load insights.";

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