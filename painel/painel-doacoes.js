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
const API = "http://127.0.0.1:5000/api/doacoes";
let donationsData = [];
let doacaoCarregada = false;

// ====== HELPERS ======
function parseNumber(valor) {
    if (valor === null || valor === undefined) return NaN;
    const m = String(valor).trim().match(/-?\d+[\d.,]*/);
    return m ? parseFloat(m[0].replace(",", ".")) : NaN;
}

function formatValorPorTipo(tipo, valor) {
    if (valor === null || valor === undefined || valor === "") return "-";

    const n = typeof valor === "number" ? valor : parseNumber(valor);

    if (!isNaN(n)) {
        if (String(tipo).toLowerCase() === "dinheiro")
            return "R$ " + n.toFixed(2);

        if (["ração", "racao"].includes(String(tipo).toLowerCase()))
            return Number.isInteger(n) ? `${n} Kg` : `${n.toFixed(1)} Kg`;
    }

    return String(valor);
}

// ======================
// BUSCAR DO BACKEND
// ======================
async function carregarDoacoes() {
    try {
        const res = await fetch(API + "/");
        donationsData = await res.json();
        renderDonations(donationsData);
    } catch {
        alerta("erro", "Erro ao carregar doações.");
    }
}

// ====== RENDER ======
function renderDonations(lista = []) {
    const container = document.getElementById("donationsRows");
    container.textContent = "";

    lista.forEach(d => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-doacoes");

        let dataText = d.data_doacao || "-";
        if (typeof dataText === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dataText)) {
            const p = dataText.split("-");
            dataText = `${p[2]}/${p[1]}/${p[0]}`;
        }

        const valorText = formatValorPorTipo(d.tipo_doacao, d.valor_doacao);
        const nomePessoa = d.pessoa_nome || `ID ${d.pessoa_id}`;

        row.innerHTML = `
            <div>${d.id}</div>
            <div>${nomePessoa}</div>
            <div>${dataText}</div>
            <div>${d.tipo_doacao ?? "-"}</div>
            <div>${valorText}</div>
            <div>${d.obs_doacao ?? "-"}</div>
        `;

        container.appendChild(row);
    });

    atualizarContadoresDoacoes();
    atualizarRecentes();
}

// ====== CONTADORES ======
function atualizarContadoresDoacoes() {
    const totalDinheiro = donationsData.reduce((acc, d) => {
        if (String(d.tipo_doacao || "").toLowerCase() === "dinheiro") {
            const n = parseNumber(d.valor_doacao);
            return acc + (isNaN(n) ? 0 : n);
        }
        return acc;
    }, 0);

    document.getElementById("total-valor").textContent =
        "R$ " + totalDinheiro.toFixed(2);
}

// ====== MAIS RECENTE ======
function atualizarRecentes() {
    if (!donationsData.length) return;

    const last = donationsData[donationsData.length - 1];
    document.getElementById("recent-donor").textContent =
        last.pessoa_nome || `ID ${last.pessoa_id}`;

    document.getElementById("recent-value").textContent =
        formatValorPorTipo(last.tipo_doacao, last.valor_doacao);
}

// ====== BUSCA ======
document.getElementById("searchInput")?.addEventListener("input", e => {
    const t = e.target.value.toLowerCase();

    const filtrados = donationsData.filter(d =>
        Object.values(d).join(" ").toLowerCase().includes(t)
    );

    renderDonations(filtrados);
});

// ====== ADICIONAR DOAÇÃO ======
async function cadastrarDoacao(e) {
    e.preventDefault();

    const pessoaId = document.getElementById("add-id-pessoa").value.trim();
    const tipo     = document.getElementById("add-tipo-doacao").value.trim();

    if (!pessoaId) return alerta("aviso", "Informe a pessoa!");
    if (!tipo)     return alerta("aviso", "Informe o tipo da doação!");

    const payload = {
        pessoa_id: parseInt(pessoaId),
        data_doacao: document.getElementById("add-data-doacao").value || null,
        tipo_doacao: tipo,
        valor_doacao: parseNumber(document.getElementById("add-valor-doacao").value),
        obs_doacao: document.getElementById("add-obs-doacao").value || null
    };

    try {
        const res = await fetch(API + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Doação cadastrada!");
        fecharModal("modal-adicionar-doacao");
        carregarDoacoes();
    } catch {
        alerta("erro", "Falha ao cadastrar.");
    }
}

document.querySelector("[data-submit-form='add-doacao']")
    .addEventListener("click", cadastrarDoacao);

// ====== CARREGAR PARA ALTERAR  ======
document.getElementById("alter-id-doacao").addEventListener("keyup", async e => {
    if (e.key !== "Enter") return;

    const id = e.target.value.trim();
    if (!id) return alerta("aviso", "Informe um ID!");

    try {
        const res = await fetch(API + "/" + id);
        if (!res.ok) return alerta("erro", "ID não encontrado!");

        const d = await res.json();
        doacaoCarregada = true;

        document.getElementById("alter-id-pessoa").value   = d.pessoa_id ?? "";
        document.getElementById("alter-data-doacao").value = d.data_doacao || "";
        document.getElementById("alter-tipo-doacao").value = d.tipo_doacao || "";
        document.getElementById("alter-valor-doacao").value = d.valor_doacao ?? "";
        document.getElementById("alter-obs-doacao").value  = d.obs_doacao || "";

        alerta("sucesso", "Doação carregada para alteração.");
    } catch {
        alerta("erro", "Erro ao buscar doação.");
    }
});

// ====== ALTERAR DOAÇÃO ======
async function alterarDoacao(e) {
    e.preventDefault();

    if (!doacaoCarregada)
        return alerta("aviso", "Carregue a doação pelo ID (ENTER) antes de alterar.");

    const id = document.getElementById("alter-id-doacao").value.trim();

    const payload = {
        pessoa_id: parseInt(document.getElementById("alter-id-pessoa").value),
        data_doacao: document.getElementById("alter-data-doacao").value || null,
        tipo_doacao: document.getElementById("alter-tipo-doacao").value,
        valor_doacao: parseNumber(document.getElementById("alter-valor-doacao").value),
        obs_doacao: document.getElementById("alter-obs-doacao").value || null
    };

    try {
        const res = await fetch(API + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Doação alterada!");
        doacaoCarregada = false;
        fecharModal("modal-alterar-doacao");
        carregarDoacoes();
    } catch {
        alerta("erro", "Falha ao alterar.");
    }
}

document.querySelector("[data-submit-form='alter-doacao']")
    .addEventListener("click", alterarDoacao);

// ====== EXCLUIR DOAÇÃO ======
async function excluirDoacao(e) {
    e.preventDefault();

    const id = document.getElementById("delete-id-doacao").value.trim();
    if (!id) return alerta("aviso", "Informe um ID válido.");

    try {
        const res = await fetch(API + "/" + id, { method: "DELETE" });
        if (!res.ok) throw new Error();

        alerta("sucesso", "Doação deletada!");
        fecharModal("modal-excluir-doacao");
        carregarDoacoes();
    } catch {
        alerta("erro", "Falha ao deletar.");
    }
}

// ====== INICIAL ======
carregarDoacoes();
