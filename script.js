// Configuração do endpoint da API (usa localhost em desenvolvimento, ou a URL do Railway em produção)
const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : "https://urlcds.up.railway.app"; // Substitua com a URL gerada pelo Railway (ex: https://urlcondenser-production.up.railway.app)

// Controle de sessão e Token JWT
let token = localStorage.getItem("token");

// Elementos do DOM
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const urlForm = document.getElementById("urlForm");
const logoutBtn = document.getElementById("logoutBtn");
const showRegisterLink = document.getElementById("showRegisterLink");
const showLoginLink = document.getElementById("showLoginLink");

// Gerenciamento e alternância de telas
function checkSession() {
    if (token) {
        loginSection.classList.add("hidden");
        registerSection.classList.add("hidden");
        dashboardSection.classList.remove("hidden");
        logoutBtn.classList.remove("hidden");
        loadUrls();
    } else {
        loginSection.classList.remove("hidden");
        registerSection.classList.add("hidden");
        dashboardSection.classList.add("hidden");
        logoutBtn.classList.add("hidden");
    }
}

// Alternar para tela de Cadastro
showRegisterLink.addEventListener("click", (event) => {
    event.preventDefault();
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
});

// Alternar para tela de Login
showLoginLink.addEventListener("click", (event) => {
    event.preventDefault();
    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});

// Handler para expiração ou falta de autorização (403 Forbidden)
function handleUnauthorized() {
    token = null;
    localStorage.removeItem("token");
    checkSession();
    alert("Sua sessão expirou ou é inválida. Por favor, faça login novamente.");
}

// Evento de Envio do Formulário de Login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const loginVal = document.getElementById("loginInput").value.trim();
    const senhaVal = document.getElementById("senhaInput").value.trim();

    try {
        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login: loginVal, senha: senhaVal })
        });

        if (!response.ok) {
            if (response.status === 403 || response.status === 401) {
                throw new Error("Usuário ou senha incorretos.");
            }
            throw new Error("Erro ao tentar realizar login.");
        }

        const data = await response.json();
        token = data.token;
        localStorage.setItem("token", token);

        document.getElementById("loginInput").value = "";
        document.getElementById("senhaInput").value = "";
        checkSession();
    } catch (error) {
        console.error(error);
        alert(error.message || "Não foi possível realizar o login.");
    }
});

// Evento de Envio do Formulário de Cadastro
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const loginVal = document.getElementById("registerLoginInput").value.trim();
    const senhaVal = document.getElementById("registerSenhaInput").value.trim();
    const confirmSenhaVal = document.getElementById("registerConfirmSenhaInput").value.trim();

    if (senhaVal !== confirmSenhaVal) {
        alert("As senhas não coincidem.");
        return;
    }

    try {
        const response = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login: loginVal, senha: senhaVal })
        });

        if (response.status === 409) {
            throw new Error("Este usuário já está cadastrado.");
        }

        if (!response.ok) {
            throw new Error("Erro ao realizar o cadastro.");
        }

        alert("Cadastro realizado com sucesso! Faça login para continuar.");

        // Limpa campos do formulário
        document.getElementById("registerLoginInput").value = "";
        document.getElementById("registerSenhaInput").value = "";
        document.getElementById("registerConfirmSenhaInput").value = "";

        // Redireciona para tela de login
        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
    } catch (error) {
        console.error(error);
        alert(error.message || "Não foi possível realizar o cadastro.");
    }
});

// Evento de Sair (Logout)
logoutBtn.addEventListener("click", () => {
    token = null;
    localStorage.removeItem("token");
    document.getElementById("result").innerHTML = ""; // Limpa resultados anteriores
    checkSession();
});

// Evento de Envio do Formulário de Encurtamento de URL (Autenticado)
urlForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = document.getElementById("urlInput");
    const url = input.value.trim();

    try {
        const response = await fetch(`${API}/api/urls`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ originalUrl: url })
        });

        if (response.status === 403) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) throw new Error("Erro ao criar URL");

        const data = await response.json();
        exibirUrlCriada(data.shortUrl);

        input.value = "";
        loadUrls();
    } catch (error) {
        console.error(error);
        alert("Não foi possível encurtar a URL.");
    }
});

// Carregar URLs Cadastradas (Autenticado)
async function loadUrls() {
    if (!token) return;

    try {
        const response = await fetch(`${API}/api/urls`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 403) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) throw new Error("Erro ao buscar URLs");

        const urls = await response.json();
        renderizarTabela(urls);
    } catch (error) {
        console.error("Erro ao carregar a tabela:", error);
    }
}

// Excluir URL (Autenticado)
async function deleteUrl(id) {
    if (!token) return;

    try {
        const response = await fetch(`${API}/api/urls/${id}`, { 
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 403) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) throw new Error("Erro ao deletar");
        loadUrls();
    } catch (error) {
        console.error(error);
        alert("Erro ao excluir a URL.");
    }
}

// --- FUNÇÕES DE INTERAÇÃO COM O DOM (Manipulação da Tela) ---

function exibirUrlCriada(shortUrl) {
    const resultContainer = document.getElementById("result");
    resultContainer.innerHTML = "";

    const p = document.createElement("p");
    p.textContent = "Sua URL curta:";

    const a = document.createElement("a");
    a.href = shortUrl;
    a.target = "_blank";
    a.textContent = shortUrl;

    const button = document.createElement("button");
    button.className = "copy btn-primary";
    button.textContent = "Copiar";
    button.addEventListener("click", () => copyUrl(shortUrl));

    resultContainer.appendChild(p);
    resultContainer.appendChild(a);
    resultContainer.appendChild(button);
}

function renderizarTabela(urls) {
    const table = document.getElementById("urlTable");
    table.innerHTML = "";

    const payload = parseJwt(token);
    const isAdmin = payload && payload.role === "ADMIN";

    const theadTr = document.querySelector("#dashboardSection table thead tr");
    if (theadTr) {
        if (isAdmin) {
            theadTr.innerHTML = `
                <th scope="col">Original</th>
                <th scope="col">Código</th>
                <th scope="col">Cliques</th>
                <th scope="col">Criador</th>
                <th scope="col">Ações</th>
            `;
        } else {
            theadTr.innerHTML = `
                <th scope="col">Original</th>
                <th scope="col">Código</th>
                <th scope="col">Cliques</th>
                <th scope="col">Ações</th>
            `;
        }
    }

    const fragment = document.createDocumentFragment();

    urls.forEach(url => {
        const tr = document.createElement("tr");

        let criadorTd = "";
        if (isAdmin) {
            criadorTd = `<td>${escapeHtml(url.criador || "-")}</td>`;
        }

        tr.innerHTML = `
            <td>
                <a href="${escapeHtml(url.originalUrl)}" target="_blank">${escapeHtml(url.originalUrl)}</a>
            </td>
            <td>
                <a href="${API}/${url.shortCode}" target="_blank">${url.shortCode}</a>
            </td>
            <td>${url.clicks}</td>
            ${criadorTd}
            <td>
                <button class="copy" data-url="${API}/${url.shortCode}">Copiar</button>
                <button class="delete" data-id="${url.id}">Excluir</button>
            </td>
        `;

        tr.querySelector(".copy").addEventListener("click", () => copyUrl(`${API}/${url.shortCode}`));
        tr.querySelector(".delete").addEventListener("click", () => deleteUrl(url.id));

        fragment.appendChild(tr);
    });

    table.appendChild(fragment);
}

// --- UTILITÁRIOS ---

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function copyUrl(url) {
    navigator.clipboard.writeText(url)
        .then(() => alert("URL copiada!"))
        .catch(() => alert("Erro ao copiar URL."));
}

function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
}

// --- INICIALIZAÇÃO ---
checkSession();