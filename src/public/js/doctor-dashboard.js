const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
  console.log("Doctor dashboard loaded");
  loadPatientList();
});

async function loadPatientList() {

  console.log("loadPatientList");

  const list = document.getElementById("patientList");
  list.innerHTML = "<li>Loading...</li>";

  try {

    const res = await fetch("/api/my-patients", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    console.log("Response:", res.status);

    const patients = await res.json();

    if (!patients.length) {
      list.innerHTML = "<li>No patients connected.</li>";
      return;
    }

    list.innerHTML = "";

    patients.forEach(patient => {

      const li = document.createElement("li");

      li.textContent =
        patient.email +
        " (granted " +
        new Date(patient.granted_at).toLocaleDateString() +
        ")";

      list.appendChild(li);
    });

  } catch (err) {

    console.error(err);
    list.innerHTML = "<li>Failed to load patients</li>";

  }
}