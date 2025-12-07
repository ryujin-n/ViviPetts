// ====== FUNÇÕES DE MODAL ======
function abrirModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = "flex";
}

function fecharModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = "none";
}

document.querySelectorAll(".action-btn").forEach(btn => {
    const modalId = btn.dataset.openModal;
    if (!modalId) return;

    btn.addEventListener("click", () => {
        abrirModal(modalId);

        const box = document.getElementById(modalId).querySelector(".modal-box");
        if (modalId.includes("alterar")) box.style.maxWidth = "520px";
        if (modalId.includes("excluir")) box.style.maxWidth = "400px";
    });
});

document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => fecharModal(btn.dataset.closeModal));
});

// ===== SISTEMA DE ALERTAS =====
function alerta(tipo, mensagem) {
    const container = document.getElementById("alert-container");
    if (!container) return;

    const classes = {
        sucesso: "alert-success",
        aviso: "alert-warning",
        erro: "alert-error"
    };

    const icones = {
        sucesso: "icone-sucesso.svg",
        aviso: "icone-alerta.svg",
        erro: "icone-erro.svg"
    };

    const alerta = document.createElement("div");
    alerta.className = "alert-box " + classes[tipo];

    alerta.innerHTML = `
        <img src="${icones[tipo]}">
        <span>${mensagem}</span>
        <button class="alert-close">×</button>
    `;

    alerta.querySelector(".alert-close").addEventListener("click", () => alerta.remove());

    container.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3500);
}

// ======================
// VARIÁVEIS
// ======================
const API = "/api/pessoas"; 
let pessoasData = []; 

// ======================
// BUSCAR LISTA DO BACKEND
// ======================
async function carregarPessoas() {
    try {
        const res = await fetch(API + "/");
        pessoasData = await res.json();
        renderPessoas(pessoasData);
    } catch (err) {
        alerta("erro", "Falha ao carregar pessoas do servidor.");
    }
}

// ====== RENDERIZAÇÃO ======
function renderPessoas(lista) {
    const container = document.getElementById("peopleRows");
    container.textContent = "";

    lista.forEach(p => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-pessoas");

        row.innerHTML = `
            <div>${p.id}</div>
            <div>${p.nome}</div>
            <div>${p.telefone || "-"}</div>
            <div>${p.email || "-"}</div>
            <div>${p.data || "-"}</div>
            <div>${p.tipo || "-"}</div>
            <div>${p.status || "-"}</div>
        `;

        container.appendChild(row);
    });

    atualizarContadores();
}

// ====== CONTADORES ======
function atualizarContadores() {
    document.getElementById("total-adotantes").textContent   = pessoasData.filter(p => p.tipo === "Adotante").length;
    document.getElementById("total-voluntarios").textContent = pessoasData.filter(p => p.tipo === "Voluntário").length;
    document.getElementById("total-doadores").textContent    = pessoasData.filter(p => p.tipo === "Doador").length;
}

// ====== BUSCA ======
document.getElementById("searchInput").addEventListener("input", () => {
    const txt = document.getElementById("searchInput").value.toLowerCase().trim();

    const filtrados = pessoasData.filter(p =>
        p.nome.toLowerCase().includes(txt) ||
        p.id.toString().includes(txt) ||
        p.telefone?.toLowerCase().includes(txt) ||
        p.email?.toLowerCase().includes(txt) ||
        p.tipo?.toLowerCase().includes(txt)
    );

    renderPessoas(filtrados);
});

// ====== ADICIONAR PESSOA ======
async function cadastrarPessoa() {
    const nome     = document.getElementById("add-nome").value.trim();
    const telefone = document.getElementById("add-telefone").value.trim();
    const email    = document.getElementById("add-email").value.trim();
    const data     = document.getElementById("add-data").value.trim();
    const tipo     = document.getElementById("add-tipo").value.trim();
    const status   = document.getElementById("add-status").value.trim();

    if (!nome) return alerta("aviso", "Nome é obrigatório!");

    try {
        const res = await fetch(API + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, telefone, email, data, tipo, status })
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Pessoa cadastrada!");
        fecharModal("modal-adicionar-pessoa");
        carregarPessoas();
    } catch (err) {
        alerta("erro", "Falha ao cadastrar.");
    }
}

document.querySelector("[data-submit-form='add-person']")
    .addEventListener("click", cadastrarPessoa);

// ====== CARREGAR ALTERAR PESSOA ======
document.getElementById("alter-id").addEventListener("keyup", async e => {
    if (e.key !== "Enter") return;

    const id = e.target.value.trim();
    if (!id) return;

    try {
        const res = await fetch(API + "/" + id);
        if (!res.ok) return alerta("erro", "ID não encontrado!");

        const p = await res.json();

        document.getElementById("alter-nome").value     = p.nome;
        document.getElementById("alter-telefone").value = p.telefone;
        document.getElementById("alter-email").value    = p.email;
        document.getElementById("alter-data").value     = p.data;
        document.getElementById("alter-tipo").value     = p.tipo;
        document.getElementById("alter-status").value   = p.status;

    } catch {
        alerta("erro", "Erro ao buscar pessoa.");
    }
});


// ====== ALTERAR PESSOA ======
async function alterarPessoa() {
    const id = document.getElementById("alter-id").value.trim();
    if (!id) return alerta("aviso", "Informe um ID válido.");

    const nome     = document.getElementById("alter-nome").value.trim();
    const telefone = document.getElementById("alter-telefone").value.trim();
    const email    = document.getElementById("alter-email").value.trim();
    const data     = document.getElementById("alter-data").value.trim();
    const tipo     = document.getElementById("alter-tipo").value.trim();
    const status   = document.getElementById("alter-status").value.trim();

    try {
        const res = await fetch(API + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, telefone, email, data, tipo, status })
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Pessoa alterada!");
        fecharModal("modal-alterar-pessoa");
        carregarPessoas();
    } catch {
        alerta("erro", "Falha ao alterar.");
    }
}

document.querySelector("[data-submit-form='alter-person']")
    .addEventListener("click", alterarPessoa);

// ====== EXCLUIR PESSOA ======
async function excluirPessoa() {
    const id = document.getElementById("delete-id").value.trim();
    if (!id) return alerta("aviso", "Informe um ID válido.");

    try {
        const res = await fetch(API + "/" + id, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Pessoa removida!");
        fecharModal("modal-excluir-pessoa");
        carregarPessoas();
    } catch {
        alerta("erro", "Falha ao deletar.");
    }
}

document.querySelector("[data-submit-form='delete-person']")
    .addEventListener("click", excluirPessoa);

// ====== RENDER INICIAL ======
carregarPessoas();


