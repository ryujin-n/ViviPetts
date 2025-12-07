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

    const alertaEl = document.createElement("div");
    alertaEl.className = "alert-box " + (classes[tipo] || classes.aviso);

    alertaEl.innerHTML = `
        <img src="${icones[tipo] || icones.aviso}">
        <span>${mensagem}</span>
        <button class="alert-close">×</button>
    `;

    alertaEl
        .querySelector(".alert-close")
        .addEventListener("click", () => alertaEl.remove());

    container.appendChild(alertaEl);
    setTimeout(() => alertaEl.remove(), 3500);
}

// ======================
// VARIÁVEIS
// ======================
const API = "http://127.0.0.1:5000/api/tratamentos";
let tratamentosData = [];
let tratamentoCarregado = false;

// ======================
// BUSCAR DO BACKEND
// ======================
async function carregarTratamentos() {
    try {
        const res = await fetch(API + "/");
        tratamentosData = await res.json();
        renderTratamentos(tratamentosData);
    } catch {
        alerta("erro", "Falha ao carregar tratamentos do servidor.");
    }
}

// ====== RENDER ======
function renderTratamentos(lista) {
    const container = document.getElementById("tratamentosRows");
    container.textContent = "";

    lista.forEach(t => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-tratamentos");

        const valorFmt = t.valor_tratamento
            ? "R$ " + Number(t.valor_tratamento).toFixed(2)
            : "-";

        const animalNome = t.animal_nome || `ID ${t.animal_id}`;

        row.innerHTML = `
            <div>${t.id}</div>
            <div>${animalNome}</div>
            <div>${t.data_tratamento || "-"}</div>
            <div>${t.tipo_tratamento || "-"}</div>
            <div>${valorFmt}</div>
            <div>${t.status_tratamento || "-"}</div>
        `;

        container.appendChild(row);
    });

    atualizarContadores();
}

// ====== CONTADORES ======
function atualizarContadores() {
    document.getElementById("total-tratamento").textContent =
        tratamentosData.filter(t => t.status_tratamento === "Tratamento").length;

    document.getElementById("total-observacao").textContent =
        tratamentosData.filter(t => t.status_tratamento === "Observação").length;

    document.getElementById("total-alta").textContent =
        tratamentosData.filter(t => t.status_tratamento === "Alta").length;
}

// ====== BUSCA ======
document.getElementById("searchInput").addEventListener("input", () => {
    const txt = document.getElementById("searchInput").value.toLowerCase().trim();

    const filtrados = tratamentosData.filter(t =>
        t.id.toString().includes(txt) ||
        (t.animal_nome || "").toLowerCase().includes(txt) ||
        t.animal_id.toString().includes(txt) ||
        (t.tipo_tratamento || "").toLowerCase().includes(txt) ||
        (t.status_tratamento || "").toLowerCase().includes(txt) ||
        (t.data_tratamento || "").toLowerCase().includes(txt)
    );

    renderTratamentos(filtrados);
});

// ====== ADICIONAR ======
async function cadastrarTratamento() {
    const animal = document.getElementById("add-animal").value.trim();
    const data   = document.getElementById("add-data").value.trim();
    const tipo   = document.getElementById("add-tipo").value.trim();
    const valor  = document.getElementById("add-valor").value.trim();
    const status = document.getElementById("add-status").value.trim();

    if (!animal) return alerta("aviso", "Animal deve ser preenchido!");
    if (!data)   return alerta("aviso", "Data é obrigatória!");
    if (!tipo)   return alerta("aviso", "Tipo é obrigatório!");
    if (!valor)  return alerta("aviso", "Valor é obrigatório!");
    if (!status) return alerta("aviso", "Status é obrigatório!");

    const payload = {
        animal_id: parseInt(animal),
        data_tratamento: data,
        tipo_tratamento: tipo,
        valor_tratamento: Number(valor.replace(",", ".")),
        status_tratamento: status
    };

    try {
        const res = await fetch(API + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Tratamento cadastrado!");
        fecharModal("modal-adicionar-tratamento");
        carregarTratamentos();
    } catch {
        alerta("erro", "Falha ao cadastrar.");
    }
}

document.querySelector("[data-submit-form='add-tratamento']")
    .addEventListener("click", cadastrarTratamento);

// ====== CARREGAR PARA ALTERAR ======
document.getElementById("alter-id-tratamento")
    .addEventListener("keyup", async e => {

        if (e.key !== "Enter") return;

        const id = e.target.value.trim();
        if (!id) return alerta("aviso", "Informe um ID!");

        try {
            const res = await fetch(API + "/" + id);
            if (!res.ok) return alerta("erro", "ID não encontrado!");

            const t = await res.json();

            document.getElementById("alter-animal").value = t.animal_id;
            document.getElementById("alter-data").value   = t.data_tratamento;
            document.getElementById("alter-tipo").value   = t.tipo_tratamento;
            document.getElementById("alter-valor").value  = t.valor_tratamento;
            document.getElementById("alter-status").value = t.status_tratamento;

            tratamentoCarregado = true;

        } catch {
            alerta("erro", "Erro ao buscar tratamento.");
        }
    });

// ====== ALTERAR ======
async function alterarTratamento() {
    if (!tratamentoCarregado)
        return alerta("aviso", "Carregue o tratamento pelo ID (ENTER) antes de alterar!");

    const id = document.getElementById("alter-id-tratamento").value.trim();

    const payload = {
        animal_id: parseInt(document.getElementById("alter-animal").value.trim()),
        data_tratamento: document.getElementById("alter-data").value.trim(),
        tipo_tratamento: document.getElementById("alter-tipo").value.trim(),
        valor_tratamento: Number(document.getElementById("alter-valor").value.replace(",", ".")),
        status_tratamento: document.getElementById("alter-status").value.trim()
    };

    try {
        const res = await fetch(API + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Tratamento alterado!");
        tratamentoCarregado = false;
        fecharModal("modal-alterar-tratamento");
        carregarTratamentos();
    } catch {
        alerta("erro", "Falha ao alterar.");
    }
}

// ✅ ÚNICA CORREÇÃO APLICADA (IGUAL AO ADOÇÕES)
document.querySelector("[data-submit-form='alter-tratamento']")
    .addEventListener("click", e => {
        e.preventDefault();
        alterarTratamento();
    });

// ====== EXCLUIR ======
async function excluirTratamento() {
    const id = document.getElementById("delete-id-tratamento").value.trim();

    if (!id) return alerta("aviso", "Informe um ID válido.");

    try {
        const res = await fetch(API + "/" + id, { method: "DELETE" });
        if (!res.ok) throw new Error();

        alerta("sucesso", "Tratamento removido!");
        fecharModal("modal-excluir-tratamento");
        carregarTratamentos();
    } catch {
        alerta("erro", "Falha ao deletar.");
    }
}

document.querySelector("[data-submit-form='delete-tratamento']")
    .addEventListener("click", excluirTratamento);

// ====== INICIAL ======
carregarTratamentos();

