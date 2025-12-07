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
    btn.addEventListener("click", () => fecharModal(btn.dataset.closeModal));
});

// ===== SISTEMA DE ALERTAs =====
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

    alertaEl.querySelector(".alert-close").addEventListener("click", () => alertaEl.remove());

    container.appendChild(alertaEl);
    setTimeout(() => alertaEl.remove(), 3500);
}

// ======================
// VARIÁVEIS
// ======================
const API = "http://127.0.0.1:5000/api/tratamentos"; 
let tratamentosData = []; 

// ======================
// BUSCAR LISTA DO BACKEND
// ======================
async function carregarTratamentos() {
    try {
        const res = await fetch(API + "/");
        if (!res.ok) throw new Error("Erro ao buscar tratamentos");
        tratamentosData = await res.json();
        renderTratamentos(tratamentosData);
    } catch (err) {
        alerta("erro", "Falha ao carregar tratamentos do servidor.");
        console.error(err);
    }
}

// ====== RENDERIZAÇÃO ======
function renderTratamentos(lista) {
    const container = document.getElementById("tratamentosRows");
    container.textContent = "";

    lista.forEach(t => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-tratamentos");

        const valorFmt = (t.valor_tratamento !== undefined && t.valor_tratamento !== null && t.valor_tratamento !== "")
            ? Number(t.valor_tratamento).toFixed(2)
            : "-";

        row.innerHTML = `
            <div>${t.id}</div>
            <div>${t.animal_id}</div>
            <div>${t.data_tratamento || "-"}</div>
            <div>${t.tipo_tratamento || "-"}</div>
            <div>${valorFmt !== "-" ? "R$ " + valorFmt : "-"}</div>
            <div>${t.status_tratamento || "-"}</div>
        `;

        container.appendChild(row);
    });

    atualizarContadores();
}

// ====== CONTADORES ======
function atualizarContadores() {
    // total por status exibidos no HTML: Tratamento / Observação / Alta
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
        String(t.id).toLowerCase().includes(txt) ||
        String(t.animal_id).toLowerCase().includes(txt) ||
        (t.tipo_tratamento || "").toLowerCase().includes(txt) ||
        (String(t.valor_tratamento || "")).toLowerCase().includes(txt) ||
        (t.status_tratamento || "").toLowerCase().includes(txt) ||
        (t.data_tratamento || "").toLowerCase().includes(txt)
    );

    renderTratamentos(filtrados);
});

// ====== ADICIONAR TRATAMENTO ======
async function cadastrarTratamento() {
    const animal_id = document.getElementById("add-animal").value.trim();
    const data_tratamento = document.getElementById("add-data").value.trim();
    const tipo_tratamento = document.getElementById("add-tipo").value.trim();
    const valorRaw = document.getElementById("add-valor").value.trim();
    const status_tratamento = document.getElementById("add-status").value.trim();

    if (!animal_id) return alerta("aviso", "Animal (ID) é obrigatório!");
    if (!data_tratamento) return alerta("aviso", "Data é obrigatória!");
    if (!tipo_tratamento) return alerta("aviso", "Tipo é obrigatório!");
    if (!valorRaw) return alerta("aviso", "Valor é obrigatório!");
    if (!status_tratamento) return alerta("aviso", "Status é obrigatório!");

    const valor_tratamento = Number(String(valorRaw).replace(/[^\d\-,.]/g, "").replace(",", "."));

    try {
        const res = await fetch(API + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ animal_id, data_tratamento, tipo_tratamento, valor_tratamento, status_tratamento })
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Tratamento cadastrado!");
        fecharModal("modal-adicionar-tratamento");
        carregarTratamentos();
    } catch (err) {
        alerta("erro", "Falha ao cadastrar.");
        console.error(err);
    }
}

document.querySelector("[data-submit-form='add-tratamento']")
    .addEventListener("click", e => { e.preventDefault(); cadastrarTratamento(); });

// ====== CARREGAR PARA ALTERAR ======
document.getElementById("alter-id-tratamento").addEventListener("keyup", async e => {
    if (e.key !== "Enter") return;

    const id = e.target.value.trim();
    if (!id) return;

    try {
        const res = await fetch(API + "/" + id);
        if (!res.ok) return alerta("erro", "ID não encontrado!");

        const t = await res.json();

        document.getElementById("alter-animal").value = t.animal_id || "";
        document.getElementById("alter-data").value = t.data_tratamento || "";
        document.getElementById("alter-tipo").value = t.tipo_tratamento || "";
        document.getElementById("alter-valor").value = t.valor_tratamento !== undefined && t.valor_tratamento !== null ? t.valor_tratamento : "";
        document.getElementById("alter-status").value = t.status_tratamento || "";

    } catch (err) {
        alerta("erro", "Erro ao buscar tratamento.");
        console.error(err);
    }
});

// ====== ALTERAR TRATAMENTO ======
async function alterarTratamento() {
    const id = document.getElementById("alter-id-tratamento").value.trim();
    if (!id) return alerta("aviso", "Informe um ID válido.");

    const animal_id = document.getElementById("alter-animal").value.trim();
    const data_tratamento = document.getElementById("alter-data").value.trim();
    const tipo_tratamento = document.getElementById("alter-tipo").value.trim();
    const valorRaw = document.getElementById("alter-valor").value.trim();
    const status_tratamento = document.getElementById("alter-status").value.trim();

    if (!animal_id) return alerta("aviso", "Animal (ID) é obrigatório!");

    const valor_tratamento = Number(String(valorRaw).replace(/[^\d\-,.]/g, "").replace(",", "."));

    try {
        const res = await fetch(API + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ animal_id, data_tratamento, tipo_tratamento, valor_tratamento, status_tratamento })
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Tratamento alterado!");
        fecharModal("modal-alterar-tratamento");
        carregarTratamentos();
    } catch (err) {
        alerta("erro", "Falha ao alterar.");
        console.error(err);
    }
}

document.querySelector("[data-submit-form='alter-tratamento']")
    .addEventListener("click", e => { e.preventDefault(); alterarTratamento(); });

// ====== EXCLUIR TRATAMENTO ======
async function excluirTratamento() {
    const id = document.getElementById("delete-id-tratamento").value.trim();
    if (!id) return alerta("aviso", "Informe um ID válido.");

    try {
        const res = await fetch(API + "/" + id, { method: "DELETE" });
        if (!res.ok) throw new Error();

        alerta("sucesso", "Tratamento removido!");
        fecharModal("modal-excluir-tratamento");
        carregarTratamentos();
    } catch (err) {
        alerta("erro", "Falha ao deletar.");
        console.error(err);
    }
}

document.querySelector("[data-submit-form='delete-tratamento']")
    .addEventListener("click", e => { e.preventDefault(); excluirTratamento(); });

// ====== RENDER INICIAL ======
carregarTratamentos();
