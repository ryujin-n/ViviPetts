// ====== FUNÇÕES DE MODAL======
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
    const id = btn.dataset.closeModal;
    btn.addEventListener("click", () => fecharModal(id));
});

// ===== SISTEMA DE ALERTAs =====
function alerta(tipo, mensagem) {
    const container = document.getElementById("alert-container");
    if (!container) return;

    let classe = "";
    let icone = "";

    if (tipo === "sucesso") { classe = "alert-success"; icone = "icone-sucesso.svg"; }
    if (tipo === "aviso")    { classe = "alert-warning"; icone = "icone-alerta.svg"; }
    if (tipo === "erro")     { classe = "alert-error"; icone = "icone-erro.svg"; }

    const alerta = document.createElement("div");
    alerta.className = "alert-box " + classe;
    alerta.innerHTML = `
        <img src="${icone}">
        <span>${mensagem}</span>
        <button class="alert-close">×</button>
    `;

    alerta.querySelector(".alert-close").addEventListener("click", () => alerta.remove());
    container.appendChild(alerta);

    setTimeout(() => alerta.remove(), 3500);
}

// =========================
// EXEMPLO(DELETAR DEPOIS)
// =========================
let pessoasData = [
    { id: "001", nome: "Maria Silva Aparecida da Silva Mello Ferreira", telefone: "1199999999", email: "maria@email.com", data: "2024-01-01", tipo: "Adotante", status: "Ativo" },
    { id: "002", nome: "João Ferreira", telefone: "11911112222", email: "joao@email.com", data: "2023-12-12", tipo: "Voluntário", status: "Inativo" }
];

// ====== RENDERIZAÇÃO ======
function renderPessoas(lista = pessoasData) {
    const container = document.getElementById("peopleRows");
    container.innerHTML = "";

    lista.forEach(p => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-pessoas");
        row.innerHTML = `
            <div>${p.id}</div>
            <div>${p.nome}</div>
            <div>${p.telefone}</div>
            <div>${p.email || "-"}</div>
            <div>${p.data || "-"}</div>
            <div>${p.tipo}</div>
            <div>${p.status}</div>
        `;
        container.appendChild(row);
    });

    atualizarContadores();
}

// ====== CONTADORES ======
function atualizarContadores() {
    document.getElementById("total-adotantes").textContent =
        pessoasData.filter(p => p.tipo === "Adotante").length;

    document.getElementById("total-voluntarios").textContent =
        pessoasData.filter(p => p.tipo === "Voluntário").length;

    document.getElementById("total-doadores").textContent =
        pessoasData.filter(p => p.tipo === "Doador").length;
}

// ====== BUSCA ======
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
    const t = searchInput.value.toLowerCase().trim();

    const lista = pessoasData.filter(p =>
        p.id.toLowerCase().includes(t) ||
        p.nome.toLowerCase().includes(t) ||
        p.telefone.toLowerCase().includes(t) ||
        (p.email || "").toLowerCase().includes(t) ||
        p.tipo.toLowerCase().includes(t) ||
        p.status.toLowerCase().includes(t)
    );

    renderPessoas(lista);
});

// ====== ADICIONAR PESSOA ======
function cadastrarPessoa() {
    try {
        const nome     = document.getElementById("add-nome").value.trim();
        const telefone = document.getElementById("add-telefone").value.trim();
        const email    = document.getElementById("add-email").value.trim();
        const data     = document.getElementById("add-data").value.trim();
        const tipo     = document.getElementById("add-tipo").value.trim();
        const status   = document.getElementById("add-status").value.trim();

        if (!nome) return alerta("aviso", "Nome é obrigatório!");
        if (!telefone) return alerta("aviso", "Telefone é obrigatório!");
        if (!tipo) return alerta("aviso", "Selecione o tipo!");

        const novoID = String(pessoasData.length + 1).padStart(3, "0");

        pessoasData.push({
            id: novoID,
            nome,
            telefone,
            email,
            data,
            tipo,
            status
        });

        fecharModal("modal-adicionar-pessoa");
        alerta("sucesso", "Pessoa cadastrada!");
        renderPessoas();

    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='add-person']").addEventListener("click", e => {
    e.preventDefault();
    cadastrarPessoa();
});

// ====== ALTERAR PESSOA ======
document.getElementById("alter-id").addEventListener("keyup", e => {
    if (e.key !== "Enter") return;

    const id = e.target.value.trim();
    const p = pessoasData.find(a => a.id === id);

    if (!p) return alerta("erro", "ID não encontrado!");

    document.getElementById("alter-nome").value     = p.nome;
    document.getElementById("alter-telefone").value = p.telefone;
    document.getElementById("alter-email").value    = p.email;
    document.getElementById("alter-data").value     = p.data;
    document.getElementById("alter-tipo").value     = p.tipo;
    document.getElementById("alter-status").value   = p.status;
});

function alterarPessoa() {
    try {
        const id = document.getElementById("alter-id").value.trim();
        const p = pessoasData.find(a => a.id === id);

        if (!p) return alerta("erro", "ID não encontrado!");

        const nome = document.getElementById("alter-nome").value.trim();
        if (!nome)
            return alerta("aviso", "Carregue uma pessoa antes de alterar (digite o ID e pressione ENTER).");

        p.nome     = nome;
        p.telefone = document.getElementById("alter-telefone").value.trim();
        p.email    = document.getElementById("alter-email").value.trim();
        p.data     = document.getElementById("alter-data").value.trim();
        p.tipo     = document.getElementById("alter-tipo").value.trim();
        p.status   = document.getElementById("alter-status").value.trim();

        fecharModal("modal-alterar-pessoa");
        alerta("sucesso", "Pessoa alterada!");
        renderPessoas();

    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='alter-person']").addEventListener("click", e => {
    e.preventDefault();
    alterarPessoa();
});

// ====== EXCLUIR PESSOA ======
function excluirPessoa() {
    try {
        const id = document.getElementById("delete-id").value.trim();
        const index = pessoasData.findIndex(a => a.id === id);

        if (index === -1) return alerta("erro", "ID não encontrado!");

        pessoasData.splice(index, 1);

        fecharModal("modal-excluir-pessoa");
        alerta("sucesso", "Pessoa removida!");
        renderPessoas();

    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='delete-person']").addEventListener("click", e => {
    e.preventDefault();
    excluirPessoa();
});

// ====== RENDER INICIAL ======
renderPessoas();

