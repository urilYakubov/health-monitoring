const token = localStorage.getItem("token");

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadUsers();
    setupLogout();

  }
);


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


async function loadUsers() {

  const tbody =
    document.querySelector("#usersTable tbody");

  const res = await fetch(
    "/api/admin/users",
    {
      headers: {
        Authorization:
          "Bearer " + token
      }
    }
  );

  const users = await res.json();

  tbody.innerHTML = "";

  users.forEach(user => {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>
        ${user.first_name}
        ${user.last_name}
      </td>

      <td>${user.email}</td>

      <td>
        <select
          class="role-select"
          data-id="${user.id}"
        >
          <option
            value="patient"
            ${user.role === "patient" ? "selected" : ""}
          >
            Patient
          </option>

          <option
            value="doctor"
            ${user.role === "doctor" ? "selected" : ""}
          >
            Doctor
          </option>

          <option
            value="admin"
            ${user.role === "admin" ? "selected" : ""}
          >
            Admin
          </option>

        </select>
      </td>

      <td>
        <button
          class="save-role"
          data-id="${user.id}"
        >
          Save
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  attachRoleButtons();
}


function attachRoleButtons() {

  document
    .querySelectorAll(".save-role")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        async () => {

          const userId =
            btn.dataset.id;

          const role =
            document.querySelector(
              `.role-select[data-id="${userId}"]`
            ).value;

          await fetch(
            `/api/admin/users/${userId}/role`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  "Bearer " + token,

                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                role
              })
            }
          );

          alert("Role updated");
        }
      );

    });
}
