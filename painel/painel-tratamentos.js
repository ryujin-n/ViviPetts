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
        if (modalId.includes("adicionar")) box.style.maxWidth = "520px";
    });
});

document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
        fecharModal(btn.dataset.closeModal);
    });
});

// ===== SISTEMA DE ALERTA =====
function alerta(tipo, mensagem) {
    const container = document.getElementById("alert-container");
    if (!container) return;

    let classe = "";
    let icone = "";

    if (tipo === "sucesso") { classe = "alert-success"; icone = "icone-sucesso.svg"; }
    if (tipo === "aviso") { classe = "alert-warning"; icone = "icone-alerta.svg"; }
    if (tipo === "erro") { classe = "alert-error"; icone = "icone-erro.svg"; }

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
let tratamentosData = [
    {id: "001", animal: "Luna (ID: 002)", data: "2024-01-05", tipo: "Vacina", valor: "R$ 120.00", status: "Tratamento"},
    {id: "002", animal: "Felix (ID: 001)", data: "2024-01-20", tipo: "Exames", valor: "R$ 60.00", status: "Observação"}
];

// ===== FORMATAR VALOR  =====
function formatarValorRS(v) {
    if (!v) return "";
    let n = parseFloat(String(v).replace(",", ".").replace(/[^0-9.]/g, ""));
    if (isNaN(n)) return v;
    return "R$ " + n.toFixed(2);
}

// ===== RENDERIZAÇÃO =====
function renderTratamentos(lista = tratamentosData) {
    const container = document.getElementById("tratamentosRows");
    if (!container) return;
    container.innerHTML = "";

    lista.forEach(t => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-tratamentos");

        row.innerHTML = `
            <div>${t.id}</div>
            <div>${t.animal}</div>
            <div>${t.data}</div>
            <div>${t.tipo}</div>
            <div>${formatarValorRS(t.valor)}</div>
            <div>${t.status}</div>
        `;

        container.appendChild(row);
    });

    atualizarContadores();
}

// ===== CONTADORES =====
function atualizarContadores() {
    document.getElementById("total-tratamento").textContent =
        tratamentosData.filter(t => t.status === "Tratamento").length;

    document.getElementById("total-observacao").textContent =
        tratamentosData.filter(t => t.status === "Observação").length;

    document.getElementById("total-alta").textContent =
        tratamentosData.filter(t => t.status === "Alta").length;
}

// ===== BUSCA =====
const search = document.getElementById("searchInput");
search.addEventListener("input", () => {
    const t = search.value.toLowerCase().trim();

    const filtrados = tratamentosData.filter(tr => {
        return (
            tr.id.toLowerCase().includes(t) ||
            tr.animal.toLowerCase().includes(t) ||
            tr.tipo.toLowerCase().includes(t) ||
            tr.status.toLowerCase().includes(t) ||
            tr.valor.toLowerCase().includes(t) ||
            tr.data.toLowerCase().includes(t)
        );
    });

    renderTratamentos(filtrados);
});

// ===== CADASTRAR TRATAMENTO =====
function cadastrarTratamento() {
    const animal = document.getElementById("add-animal").value.trim();
    const data = document.getElementById("add-data").value.trim();
    const tipo = document.getElementById("add-tipo").value.trim();
    const valor = formatarValorRS(document.getElementById("add-valor").value.trim());
    const status = document.getElementById("add-status").value.trim();

    if (!animal) return alerta("aviso", "Animal deve ser preenchido!");
    if (!data) return alerta("aviso", "Data é obrigatória!");
    if (!tipo) return alerta("aviso", "Tipo deve ser preenchido!");
    if (!valor) return alerta("aviso", "Valor obrigatório!");
    if (!status) return alerta("aviso", "Status obrigatório!");

    const novoID = String(tratamentosData.length + 1).padStart(3, "0");

    tratamentosData.push({
        id: novoID,
        animal,
        data,
        tipo,
        valor,
        status
    });

    fecharModal("modal-adicionar-tratamento");
    alerta("sucesso", "Tratamento cadastrado!");
    renderTratamentos();
}

document.querySelector("[data-submit-form='add-tratamento']").addEventListener("click", e => {
    e.preventDefault();
    cadastrarTratamento();
});

// ===== BUSCAR PARA ALTERAR =====
document.getElementById("alter-id-tratamento").addEventListener("keyup", function (e) {
    if (e.key !== "Enter") return;

    const id = this.value.trim();
    const tr = tratamentosData.find(t => t.id === id);

    if (!tr) return alerta("erro", "ID não encontrado!");

    document.getElementById("alter-animal").value = tr.animal;
    document.getElementById("alter-data").value = tr.data;
    document.getElementById("alter-tipo").value = tr.tipo;
    document.getElementById("alter-valor").value = tr.valor.replace("R$ ", "");
    document.getElementById("alter-status").value = tr.status;
});

// ===== ALTERAR =====
function alterarTratamento() {
    const id = document.getElementById("alter-id-tratamento").value.trim();
    const tr = tratamentosData.find(t => t.id === id);

    if (!tr) return alerta("erro", "ID não encontrado!");

    tr.animal = document.getElementById("alter-animal").value.trim();
    tr.data = document.getElementById("alter-data").value.trim();
    tr.tipo = document.getElementById("alter-tipo").value.trim();
    tr.valor = formatarValorRS(document.getElementById("alter-valor").value.trim());
    tr.status = document.getElementById("alter-status").value.trim();

    fecharModal("modal-alterar-tratamento");
    alerta("sucesso", "Tratamento alterado!");
    renderTratamentos();
}

document.querySelector("[data-submit-form='alter-tratamento']").addEventListener("click", e => {
    e.preventDefault();
    alterarTratamento();
});

// ===== EXCLUIR =====
function excluirTratamento() {
    const id = document.getElementById("delete-id-tratamento").value.trim();
    const index = tratamentosData.findIndex(t => t.id === id);

    if (index === -1) return alerta("erro", "ID não encontrado!");

    tratamentosData.splice(index, 1);

    fecharModal("modal-excluir-tratamento");
    alerta("sucesso", "Tratamento removido!");

    renderTratamentos();
}

document.querySelector("[data-submit-form='delete-tratamento']").addEventListener("click", e => {
    e.preventDefault();
    excluirTratamento();
});

// ===== RENDER INICIAL =====
renderTratamentos();
