const loadPage = (page) => {
  const content = document.getElementById("content");
  fetch(page)
    .then((response) => {
      if (!response.ok) throw new Error("Página não encontrada");
      return response.text();
    })
    .then((html) => {
      content.innerHTML = html;

      if (isAuthenticated()) {
        defaultHeader.style.display = "block";
      } else {
        defaultHeader.style.display = "none";
      }

      initializePageScripts(page);
    })
    .catch((error) => {
      content.innerHTML = `<h1>Erro</h1><p>${error.message}</p>`;
      console.error("Erro ao carregar a página:", error);
    });
};

const initializePageScripts = (page) => {
  if (page === "home.html") {
    initializeHomePage();
  }

  if (page === "admin.html") {
    initializeAdminPage();
  }

  if (page === "login.html") {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
          const response = await fetch("http://localhost:3333/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();
          if (response.ok) {
            document.cookie = `token=${data.token}; path=/`;
            document.cookie = `user=${data.user}; path=/`;
            loadPage("home.html");
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error("Erro ao logar:", error);
        }
      });
    }
  }
};

const initializeHomePage = async () => {
  const actorsList = document.getElementById("actors-list");

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    console.error("Token não encontrado. Redirecionando para login...");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3333/api/actors", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      actorsList.innerHTML = "";

      data.results.forEach((actor) => {
        const actorCard = document.createElement("div");
        actorCard.className = "col-md-3 mb-4";
        actorCard.innerHTML = `
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column align-items-center">
              <div
                class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center"
                style="width: 80px; height: 80px; font-size: 24px;"
              >
                ${actor.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
              </div>
              <h5 class="mt-3 text-center">${actor.name}</h5>
              <p class="text-muted mb-0">Altura: ${actor.height} cm</p>
              <p class="text-muted">Peso: ${actor.mass} kg</p>
            </div>
          </div>
        `;
        actorsList.appendChild(actorCard);
      });
    } else {
      actorsList.innerHTML = `<p>Erro ao carregar os atores. Tente novamente mais tarde.</p>`;
    }
  } catch (error) {
    console.error("Erro ao buscar atores:", error);
    actorsList.innerHTML = `<p>Erro ao buscar atores. Verifique sua conexão.</p>`;
  }
};

const initializeAdminPage = async () => {
  const loadUsers = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      console.error("Token não encontrado. Redirecionando para login...");
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch("http://localhost:3333/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const users = await response.json();

      if (response.ok) {
        const table = document.getElementById("usersTable");
        table.innerHTML = "";

        users.forEach((user) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${user.fullName}</td>
            <td class="text-center">${user.email}</td>
            <td class="d-flex gap-4 align-items-center justify-content-center">
              <button class="btn btn-danger btn-sm" onclick="deleteUser('${
                user._id
              }')">Apagar</button>
              <button class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal" onclick="editUser('${encodeURIComponent(
                JSON.stringify(user)
              )}')">Editar</button>
            </td>
          `;
          table.appendChild(row);
        });
      } else {
        console.error("Erro ao carregar usuários.");
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  await loadUsers();
  initializeEditUserForm();
};

const initializeEditUserForm = () => {
  const editUserForm = document.getElementById("editUserForm");

  editUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const userId = document.getElementById("userId").value;

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      console.error("Token não encontrado. Redirecionando para login...");
      window.location.href = "login.html";
      return;
    }

    const updatedData = {
      fullName,
      email,
    };

    if (password.trim() !== "") {
      updatedData.password = password;
    }

    try {
      const response = await fetch(
        `http://localhost:3333/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        alert("Usuário atualizado com sucesso!");
        document
          .getElementById("exampleModal")
          .querySelector(".btn-close")
          .click();
        initializeAdminPage();
      } else {
        const errorData = await response.json();
        alert(`Erro ao atualizar usuário: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      alert("Erro ao atualizar usuário. Tente novamente.");
    }
  });
};

const isAuthenticated = () => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return !!token;
};

document.addEventListener("DOMContentLoaded", () => {
  const defaultHeader = document.getElementById("defaultHeader");

  loadPage();

  const navLinks = document.querySelectorAll("[data-page]");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");

      if (page === "admin.html" && !isAuthenticated()) {
        loadPage("login.html");
      } else {
        loadPage(page);
      }
    });
  });

  if (isAuthenticated()) {
    defaultHeader.style.display = "block";
    loadPage("home.html");
  } else {
    defaultHeader.style.display = "none";
    loadPage("login.html");
  }
});

const editUser = (userString) => {
  const user = JSON.parse(decodeURIComponent(userString));

  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const userIdInput = document.getElementById("userId");

  fullNameInput.value = user.fullName;
  emailInput.value = user.email;
  passwordInput.value = "";
  userIdInput.value = user._id;
};

const deleteUser = async (userId) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  try {
    const response = await fetch(`http://localhost:3333/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);

    if (response.ok) {
      alert("Usuário DELETADO com sucesso!");
      loadPage("admin.html");
    } else {
      const errorData = await response.json();
      alert(`Erro ao deletar usuário: ${errorData.message}`);
    }
  } catch (error) {
    console.log(error);
    alert("Erro ao deletar usuário. Tente novamente.");
  }
};

const logout = () => {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  window.location.href = "index.html";
};

document.getElementById("logoutButton").addEventListener("click", () => {
  logout();
});
