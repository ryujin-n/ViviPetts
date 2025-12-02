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
        if (modalId.includes("adicionar")) box.style.maxWidth = "520px";           //
    });
});

document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => fecharModal(btn.dataset.closeModal));
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
let donationsData = [
    { id: "001", doador: "Maria Silva",   data: "12/09/2025", tipo: "Ração",    valor: "20", obs: "" },
    { id: "002", doador: "Carlos Almeida", data: "01/02/2024", tipo: "Dinheiro", valor: "50",   obs: "Nota exemplo" }
];

// ====== HELPERS DE VALOR ======
function formatarValor(tipo, valor) {
    if (valor === null || valor === undefined) return "";
    valor = String(valor).trim();
    if (!valor) return "";

    if (valor.includes("R$") || valor.toLowerCase().includes("kg")) return valor;

    if (tipo === "Dinheiro") {
        const n = parseNumber(valor);
        return isNaN(n) ? valor : "R$ " + n.toFixed(2);
    }

    if (tipo.toLowerCase() === "ração" || tipo.toLowerCase() === "racao") {
        const n = parseNumber(valor);
        return isNaN(n) ? valor : (Number.isInteger(n) ? String(n) + " Kg" : n.toFixed(1) + "Kg");
    }

    return valor;
}

function parseNumber(valor) {
    if (valor === null || valor === undefined) return NaN;
    const s = String(valor).trim();
    const m = s.match(/-?\d+[\d.,]*/);
    if (!m) return NaN;
    const num = parseFloat(m[0].replace(",", "."));
    return isNaN(num) ? NaN : num;
}

// ====== RENDERIZAÇÃO ======
function renderDonations(lista = donationsData) {
    const c = document.getElementById("donationsRows");
    if (!c) return;
    c.innerHTML = "";

    lista.forEach(d => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-doacoes");
        row.innerHTML = `
            <div>${d.id}</div>
            <div>${d.doador}</div>
            <div>${d.data}</div>
            <div>${d.tipo}</div>
            <div>${d.valor}</div>
            <div>${d.obs || "-"}</div>
        `;
        c.appendChild(row);
    });

    atualizarContadoresDoacoes();
    atualizarRecentes();
}

// ====== CONTADORES ======
function parseKg(v) {
    if (!v) return NaN;
    const m = String(v).match(/-?\d+[\d.,]*/);
    if (!m) return NaN;
    return parseFloat(m[0].replace(",", "."));
}

function parseMoney(v) {
    if (!v) return NaN;
    const s = String(v).replace(/\s/g, "");
    const m = s.match(/-?\d+[\d.,]*/);
    if (!m) return NaN;
    return parseFloat(m[0].replace(",", "."));
}

function atualizarContadoresDoacoes() {
    const dinheiro = donationsData.reduce((t, d) => {
        if (String(d.tipo).toLowerCase() === "dinheiro") {
            const n = parseMoney(d.valor);
            return t + (isNaN(n) ? 0 : n);
        }
        return t;
    }, 0);

    const elTotalValor = document.getElementById("total-valor");
    if (elTotalValor) elTotalValor.textContent = "R$ " + dinheiro.toFixed(2);

    const racao = donationsData.reduce((t, d) => {
        if (String(d.tipo).toLowerCase() === "ração" || String(d.tipo).toLowerCase() === "racao") {
            const n = parseKg(d.valor);
            return t + (isNaN(n) ? 0 : n);
        }
        return t;
    }, 0);

    const elTotalRacao = document.getElementById("total-racao");
    if (elTotalRacao) {
        if (racao === 0) elTotalRacao.textContent = "0 Kg";
        else elTotalRacao.textContent = (Number.isInteger(racao) ? racao.toString() : racao.toFixed(1)) + " Kg";
    }
}

// ====== DOAÇÃO MAIS RECENTE ======
function atualizarRecentes() {
    const elDonor = document.getElementById("recent-donor");
    const elDate  = document.getElementById("recent-date");
    const elValue = document.getElementById("recent-value");
    if (!elDonor || !elDate || !elValue) return;

    if (donationsData.length === 0) {
        elDonor.textContent = "—";
        elDate.textContent = "—";
        elValue.textContent = "—";
        return;
    }

    const last = donationsData[donationsData.length - 1];

    elDonor.textContent = last.doador || "—";
    elDate.textContent  = last.data || "—";

    if (String(last.valor).includes("R$") || String(last.valor).toLowerCase().includes("kg")) {
        elValue.textContent = last.valor;
    } else {
        elValue.textContent = formatarValor(last.tipo, last.valor);
    }
}

// ====== BUSCA ======
const search = document.getElementById("searchInput");
if (search) {
    let timer;
    search.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const t = search.value.toLowerCase().trim();
            if (!t) return renderDonations();

            const list = donationsData.filter(d =>
                String(d.id).toLowerCase().includes(t) ||
                String(d.doador || "").toLowerCase().includes(t) ||
                String(d.tipo || "").toLowerCase().includes(t) ||
                String(d.data || "").toLowerCase().includes(t) ||
                String(d.valor || "").toLowerCase().includes(t)
            );

            renderDonations(list);
        }, 150);
    });
}

// ====== GERAR ID ======
function gerarNovoID() {
    const nums = donationsData.map(d => Number(d.id)).filter(n => !isNaN(n));
    const maior = nums.length ? Math.max(...nums) : 0;
    return String(maior + 1).padStart(3, "0");
}

// ====== ADICIONAR DOAÇÃO ======
function cadastrarDoacao() {
    const doador = document.getElementById("add-nome-doacao").value.trim();
    const data   = document.getElementById("add-data-doacao").value;
    const tipo   = document.getElementById("add-tipo-doacao").value.trim();
    const valor  = document.getElementById("add-valor-doacao").value.trim();
    const obs    = document.getElementById("add-obs-doacao").value.trim();

    if (!doador) return alerta("aviso", "Nome obrigatório!");
    if (!tipo)   return alerta("aviso", "Tipo obrigatório!");
    if (!valor)  return alerta("aviso", "Valor obrigatório!");

    let dataFormat = "";
    if (data) {
        const p = data.split("-");
        if (p.length === 3) dataFormat = `${p[2]}/${p[1]}/${p[0]}`;
    }

    donationsData.push({
        id: gerarNovoID(),
        doador,
        data: dataFormat,
        tipo,
        valor: formatarValor(tipo, valor),
        obs
    });

    fecharModal("modal-adicionar-doacao");
    alerta("sucesso", "Doação cadastrada!");
    renderDonations();
}

// ====== ALTERAR DOAÇÃO ======
const alterID = document.getElementById("alter-id-doacao");
if (alterID) {
    alterID.addEventListener("keyup", e => {
        if (e.key !== "Enter") return;

        const d = donationsData.find(x => x.id === alterID.value.trim());
        if (!d) return alerta("erro", "ID não encontrado!");

        document.getElementById("alter-nome-doacao").value = d.doador || "";

        if (d.data && d.data.includes("/")) {
            const p = d.data.split("/");
            if (p.length === 3) document.getElementById("alter-data-doacao").value = `${p[2]}-${p[1]}-${p[0]}`;
        }

        document.getElementById("alter-tipo-doacao").value  = d.tipo || "";
        let rawValor = String(d.valor || "");
        rawValor = rawValor.replace("R$ ", "").replace("R$", "").replace(/kg/i, "").trim();
        document.getElementById("alter-valor-doacao").value = rawValor;
        document.getElementById("alter-obs-doacao").value   = d.obs || "";
    });
}


function alterarDoacao() {
    const id = document.getElementById("alter-id-doacao").value.trim();
    const d  = donationsData.find(x => x.id === id);
    if (!d) return alerta("erro", "ID não encontrado!");

    const doador = document.getElementById("alter-nome-doacao").value.trim();
    const data   = document.getElementById("alter-data-doacao").value;
    const tipo   = document.getElementById("alter-tipo-doacao").value.trim();
    const valor  = document.getElementById("alter-valor-doacao").value.trim();
    const obs    = document.getElementById("alter-obs-doacao").value.trim();

    if (!doador) return alerta("aviso", "Nome obrigatório!");
    if (!tipo)   return alerta("aviso", "Tipo obrigatório!");
    if (!valor)  return alerta("aviso", "Valor obrigatório!");

    let dataFormat = "";
    if (data) {
        const p = data.split("-");
        if (p.length === 3) dataFormat = `${p[2]}/${p[1]}/${p[0]}`;
    }

    d.doador = doador;
    d.data   = dataFormat;
    d.tipo   = tipo;
    d.valor  = formatarValor(tipo, valor);
    d.obs    = obs;

    fecharModal("modal-alterar-doacao");
    alerta("sucesso", "Doação alterada!");
    renderDonations();
}

// ====== EXCLUIR DOAÇÃO ======
function excluirDoacao() {
    const id = document.getElementById("delete-id-doacao").value.trim();
    const i  = donationsData.findIndex(x => x.id === id);

    if (i === -1) return alerta("erro", "ID não encontrado!");

    donationsData.splice(i, 1);

    fecharModal("modal-excluir-doacao");
    alerta("sucesso", "Doação removida!");
    renderDonations();
}

// ======  BOTÕES DE SUBMIT ====== 
document.querySelectorAll("[data-submit-form]").forEach(btn => {
    btn.addEventListener("click", e => {
        e.preventDefault();
        const t = btn.dataset.submitForm;
        if (t === "add-doacao")    cadastrarDoacao();
        if (t === "alter-doacao")  alterarDoacao();
        if (t === "delete-doacao") excluirDoacao();
    });
});

// ====== RENDER INICIAL ======
renderDonations();




