// Substitua o início do script por isto:

const API = "http://localhost:8080";
const urlForm = document.getElementById("urlForm");

// Escuta o envio do formulário (funciona ao clicar no botão ou dar Enter)
urlForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede a página de recarregar com o envio do form

    const input = document.getElementById("urlInput");
    const url = input.value.trim();

    try {
        const response = await fetch(`${API}/api/urls`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ originalUrl: url })
        });

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

async function loadUrls() {
    try {
        const response = await fetch(`${API}/api/urls`);
        if (!response.ok) throw new Error("Erro ao buscar URLs");

        const urls = await response.json();
        renderizarTabela(urls);
    } catch (error) {
        console.error("Erro ao carregar a tabela:", error);
    }
}

async function deleteUrl(id) {
    try {
        const response = await fetch(`${API}/api/urls/${id}`, { method: "DELETE" });
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

    // Limpa o container
    resultContainer.innerHTML = "";

    // Cria os elementos de forma limpa e segura
    const p = document.createElement("p");
    p.textContent = "Sua URL curta:";

    const a = document.createElement("a");
    a.href = shortUrl;
    a.target = "_blank";
    a.textContent = shortUrl;

    const button = document.createElement("button");
    button.className = "copy";
    button.textContent = "Copiar";
    // Evita usar 'onclick' inline no HTML, usa event listener direto no JS
    button.addEventListener("click", () => copyUrl(shortUrl));

    resultContainer.appendChild(p);
    resultContainer.appendChild(a);
    resultContainer.appendChild(button);
}

function renderizarTabela(urls) {
    const table = document.getElementById("urlTable");
    table.innerHTML = ""; // Limpa a tabela uma única vez

    // Criamos um fragmento em memória para renderizar tudo de uma vez (melhor performance)
    const fragment = document.createDocumentFragment();

    urls.forEach(url => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <a href="${escapeHtml(url.originalUrl)}" target="_blank">${escapeHtml(url.originalUrl)}</a>
            </td>
            <td>
                <a href="${API}/${url.shortCode}" target="_blank">${url.shortCode}</a>
            </td>
            <td>${url.clicks}</td>
            <td>
                <button class="copy" data-url="${API}/${url.shortCode}">Copiar</button>
                <button class="delete" data-id="${url.id}">Excluir</button>
            </td>
        `;

        // Adiciona eventos aos botões recém-criados de forma elegante
        tr.querySelector(".copy").addEventListener("click", () => copyUrl(`${API}/${url.shortCode}`));
        tr.querySelector(".delete").addEventListener("click", () => deleteUrl(url.id));

        fragment.appendChild(tr);
    });

    table.appendChild(fragment); // Injeta todos os registros na tela de uma só vez
}

// --- UTILITÁRIOS ---

function copyUrl(url) {
    navigator.clipboard.writeText(url)
        .then(() => alert("URL copiada!"))
        .catch(() => alert("Erro ao copiar URL."));
}

// Função simples para mitigar ataques XSS limpando caracteres perigosos
function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
}

// --- INICIALIZAÇÃO ---
loadUrls();