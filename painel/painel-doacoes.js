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
        if (!box) return;
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
        <img src="${icones[tipo] || icones.aviso}" alt="${tipo}">
        <span>${mensagem}</span>
        <button class="alert-close" aria-label="fechar alerta">×</button>
    `;

    alertaEl.querySelector(".alert-close").addEventListener("click", () => alertaEl.remove());
    container.appendChild(alertaEl);
    setTimeout(() => alertaEl.remove(), 3500);
}

// ======================
// VARIÁVEIS / CONFIG
// ======================
const API = "http://127.0.0.1:5000/api/doacoes";// ajuste para o seu backend
let donationsData = []; // Agora será preenchido pelo backend

// ====== HELPERS DE VALOR ======
function parseNumber(valor) {
    if (valor === null || valor === undefined) return NaN;
    const m = String(valor).trim().match(/-?\d+[\d.,]*/);
    return m ? parseFloat(m[0].replace(",", ".")) : NaN;
}

function formatValorPorTipo(tipo, valor) {
    if (valor === null || valor === undefined || valor === "") return "-";
    if (typeof valor === "number") {
        if (String(tipo).toLowerCase() === "dinheiro") return "R$ " + valor.toFixed(2);
        if (String(tipo).toLowerCase() === "ração" || String(tipo).toLowerCase() === "racao")
            return Number.isInteger(valor) ? `${valor} Kg` : `${valor.toFixed(1)} Kg`;
        return String(valor);
    }

    const n = parseNumber(valor);
    if (!isNaN(n)) {
        if (String(tipo).toLowerCase() === "dinheiro") return "R$ " + n.toFixed(2);
        if (String(tipo).toLowerCase() === "ração" || String(tipo).toLowerCase() === "racao")
            return Number.isInteger(n) ? `${n} Kg` : `${n.toFixed(1)} Kg`;
        return String(valor);
    }

    return String(valor);
}

// ======================
// BUSCAR LISTA DO BACKEND
// ======================
async function carregarDoacoes() {
    try {
        const res = await fetch(API + "/");
        if (!res.ok) throw new Error("Falha ao buscar doações");
        donationsData = await res.json();
        renderDonations(donationsData);
    } catch (err) {
        console.error(err);
        alerta("erro", "Falha ao carregar doações do servidor.");
    }
}

// ====== RENDERIZAÇÃO ======
function renderDonations(lista = []) {
    const container = document.getElementById("donationsRows");
    if (!container) return;
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

        row.innerHTML = `
            <div>${d.id}</div>
            <div>${d.pessoa_id ?? "-"}</div>
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

    const elTotalValor = document.getElementById("total-valor");
    if (elTotalValor) elTotalValor.textContent = "R$ " + totalDinheiro.toFixed(2);

    const totalRacao = donationsData.reduce((acc, d) => {
        if (["ração", "racao"].includes(String(d.tipo_doacao || "").toLowerCase())) {
            const n = parseNumber(d.valor_doacao);
            return acc + (isNaN(n) ? 0 : n);
        }
        return acc;
    }, 0);

    const elTotalRacao = document.getElementById("total-racao");
    if (elTotalRacao) {
        elTotalRacao.textContent =
            totalRacao === 0
                ? "0 Kg"
                : (Number.isInteger(totalRacao) ? `${totalRacao}` : totalRacao.toFixed(1)) + " Kg";
    }
}

// ====== DOAÇÃO MAIS RECENTE ======
function atualizarRecentes() {
    const elDonor = document.getElementById("recent-donor");
    const elDate  = document.getElementById("recent-date");
    const elValue = document.getElementById("recent-value");
    if (!elDonor || !elDate || !elValue) return;

    if (!donationsData || donationsData.length === 0) {
        elDonor.textContent = "—";
        elDate.textContent  = "—";
        elValue.textContent = "—";
        return;
    }

    const last = donationsData[donationsData.length - 1];

    elDonor.textContent = last.pessoa_id ?? "—";
    if (last.data_doacao && /^\d{4}-\d{2}-\d{2}$/.test(last.data_doacao)) {
        const p = last.data_doacao.split("-");
        elDate.textContent = `${p[2]}/${p[1]}/${p[0]}`;
    } else {
        elDate.textContent = last.data_doacao || "—";
    }
    elValue.textContent = formatValorPorTipo(last.tipo_doacao, last.valor_doacao);
}

// ====== BUSCA ======
const searchEl = document.getElementById("searchInput");
if (searchEl) {
    searchEl.addEventListener("input", () => {
        const t = searchEl.value.toLowerCase().trim();
        const filtrados = donationsData.filter(d =>
            String(d.id || "").toLowerCase().includes(t) ||
            String(d.pessoa_id || "").toLowerCase().includes(t) ||
            String(d.tipo_doacao || "").toLowerCase().includes(t) ||
            String(d.obs_doacao || "").toLowerCase().includes(t) ||
            String(d.data_doacao || "").toLowerCase().includes(t) ||
            String(d.valor_doacao || "").toLowerCase().includes(t)
        );
        renderDonations(filtrados);
    });
}

// ====== ADICIONAR DOAÇÃO ======
async function cadastrarDoacao() {
    try {
        const pessoa_id = document.getElementById("add-nome-doacao").value.trim(); 
        const data = document.getElementById("add-data-doacao").value;
        const tipo = document.getElementById("add-tipo-doacao").value.trim();
        const valorRaw = document.getElementById("add-valor-doacao").value.trim();
        const obs = document.getElementById("add-obs-doacao").value.trim();

        if (!pessoa_id) return alerta("aviso", "ID da pessoa é obrigatório!");
        if (!tipo) return alerta("aviso", "Tipo obrigatório!");

        const payload = {
            pessoa_id: parseInt(pessoa_id, 10),
            data_doacao: data || null,
            tipo_doacao: tipo,
            valor_doacao: (valorRaw === "" ? null : (() => {
                const num = parseNumber(valorRaw);
                return isNaN(num) ? valorRaw : num;
            })()),
            obs_doacao: obs || null
        };

        const res = await fetch(API + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Falha ao cadastrar doação.");

        alerta("sucesso", "Doação cadastrada!");
        fecharModal("modal-adicionar-doacao");
        await carregarDoacoes();
    } catch (err) {
        console.error(err);
        alerta("erro", err.message || "Ocorreu um erro ao cadastrar.");
    }
}

document.querySelectorAll("[data-submit-form='add-doacao']").forEach(btn => {
    btn.addEventListener("click", e => {
        e.preventDefault();
        cadastrarDoacao();
    });
});

// ====== CARREGAR PARA ALTERAR ======
const alterInput = document.getElementById("alter-id-doacao");
if (alterInput) {
    alterInput.addEventListener("keyup", async e => {
        if (e.key !== "Enter") return;
        const id = e.target.value.trim();
        if (!id) return;

        try {
            const res = await fetch(API + "/" + id);
            if (!res.ok) return alerta("erro", "ID não encontrado!");
            const d = await res.json();

            document.getElementById("alter-nome-doacao").value = d.pessoa_id ?? "";
            if (d.data_doacao && /^\d{4}-\d{2}-\d{2}$/.test(d.data_doacao)) {
                document.getElementById("alter-data-doacao").value = d.data_doacao;
            } else {
                document.getElementById("alter-data-doacao").value = d.data_doacao || "";
            }
            document.getElementById("alter-tipo-doacao").value = d.tipo_doacao || "";
            document.getElementById("alter-valor-doacao").value = (d.valor_doacao === null || d.valor_doacao === undefined) ? "" : String(d.valor_doacao);
            document.getElementById("alter-obs-doacao").value = d.obs_doacao || "";
        } catch (err) {
            console.error(err);
            alerta("erro", "Erro ao buscar doação.");
        }
    });
}

// ====== ALTERAR DOAÇÃO ======
async function alterarDoacao() {
    try {
        const id = document.getElementById("alter-id-doacao").value.trim();
        if (!id) return alerta("aviso", "Informe um ID válido.");

        const pessoa_id = parseInt(document.getElementById("alter-nome-doacao").value.trim(), 10);
        const data = document.getElementById("alter-data-doacao").value;
        const tipo = document.getElementById("alter-tipo-doacao").value.trim();
        const valorRaw = document.getElementById("alter-valor-doacao").value.trim();
        const obs = document.getElementById("alter-obs-doacao").value.trim();

        if (!pessoa_id) return alerta("aviso", "ID da pessoa é obrigatório!");

        const payload = {
            pessoa_id: pessoa_id,
            data_doacao: data || null,
            tipo_doacao: tipo,
            valor_doacao: (valorRaw === "" ? null : (() => {
                const num = parseNumber(valorRaw);
                return isNaN(num) ? valorRaw : num;
            })()),
            obs_doacao: obs || null
        };

        const res = await fetch(API + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Falha ao alterar doação.");

        alerta("sucesso", "Doação alterada!");
        fecharModal("modal-alterar-doacao");
        await carregarDoacoes();
    } catch (err) {
        console.error(err);
        alerta("erro", err.message || "Ocorreu um erro ao alterar.");
    }
}

document.querySelectorAll("[data-submit-form='alter-doacao']").forEach(btn => {
    btn.addEventListener("click", e => {
        e.preventDefault();
        alterarDoacao();
    });
});

// ====== EXCLUIR DOAÇÃO ======
async function excluirDoacao() {
    try {
        const id = document.getElementById("delete-id-doacao").value.trim();
        if (!id) return alerta("aviso", "Informe um ID válido.");

        const res = await fetch(API + "/" + id, { method: "DELETE" });
        if (!res.ok) throw new Error("Falha ao deletar doação.");

        alerta("sucesso", "Doação deletada!");
        fecharModal("modal-excluir-doacao");
        await carregarDoacoes();
    } catch (err) {
        console.error(err);
        alerta("erro", err.message || "Ocorreu um erro ao deletar.");
    }
}

document.querySelectorAll("[data-submit-form='delete-doacao']").forEach(btn => {
    btn.addEventListener("click", e => {
        e.preventDefault();
        excluirDoacao();
    });
});

// ====== RENDER INICIAL ======
carregarDoacoes();





