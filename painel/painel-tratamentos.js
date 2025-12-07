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
    btn.addEventListener("click", () => {
        const modalId = btn.dataset.closeModal;
        fecharModal(modalId);
    });
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


// ====== RENDERIZAÇÃO ======
function renderTratamentos(lista = tratamentosData) {
    const container = document.getElementById("tratamentosRows");
    container.innerHTML = "";

    lista.forEach(t => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-tratamentos");
        row.innerHTML = `
            <div>${t.id}</div>
            <div>${t.animal}</div>
            <div>${t.data}</div>
            <div>${t.tipo}</div>
            <div>R$ ${parseFloat(t.valor).toFixed(2)}</div>
            <div>${t.status}</div>
        `;
        container.appendChild(row);
    });

    atualizarContadores();
}

// ====== CONTADORES ======
function atualizarContadores() {
    document.getElementById("total-tratamento").textContent =
        tratamentosData.filter(t => t.status === "Tratamento").length;

    document.getElementById("total-observacao").textContent =
        tratamentosData.filter(t => t.status === "Observação").length;

    document.getElementById("total-alta").textContent =
        tratamentosData.filter(t => t.status === "Alta").length;
}

// ====== BUSCA ======
document.getElementById("searchInput").addEventListener("input", () => {
    const t = document.getElementById("searchInput").value.toLowerCase().trim();

    const filtrados = tratamentosData.filter(tr =>
        tr.id.toLowerCase().includes(t) ||
        tr.animal.toLowerCase().includes(t) ||
        tr.tipo.toLowerCase().includes(t) ||
        tr.status.toLowerCase().includes(t) ||
        tr.valor.toLowerCase().includes(t) ||
        tr.data.toLowerCase().includes(t)
    );

    renderTratamentos(filtrados);
});

// ====== ADICIONAR TRATAMENTO ======
function cadastrarTratamento() {
    try {
        const animal = document.getElementById("add-animal").value.trim();
        const data   = document.getElementById("add-data").value.trim();
        const tipo   = document.getElementById("add-tipo").value.trim();
        const valor  = document.getElementById("add-valor").value.trim();
        const status = document.getElementById("add-status").value.trim();

        if (!animal) return alerta("aviso", "Animal deve ser preenchido!");
        if (!data)   return alerta("aviso", "Data é obrigatória!");
        if (!tipo)   return alerta("aviso", "Tipo deve ser preenchido!");
        if (!valor)  return alerta("aviso", "Valor obrigatório!");
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
    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='add-tratamento']").addEventListener("click", e => {
    e.preventDefault();
    cadastrarTratamento();
});

// ====== ALTERAR TRATAMENTO ======
document.getElementById("alter-id-tratamento").addEventListener("keyup", e => {
    if (e.key !== "Enter") return;

    const id = e.target.value.trim();
    const tr = tratamentosData.find(t => t.id === id);

    if (!tr) return alerta("erro", "ID não encontrado!");

    document.getElementById("alter-animal").value = tr.animal;
    document.getElementById("alter-data").value   = tr.data;
    document.getElementById("alter-tipo").value   = tr.tipo;
    document.getElementById("alter-valor").value  = tr.valor;
    document.getElementById("alter-status").value = tr.status;
});

function alterarTratamento() {
    try {
        const id = document.getElementById("alter-id-tratamento").value.trim();
        const tr = tratamentosData.find(t => t.id === id);

        if (!tr)
            return alerta("erro", "ID não encontrado!");

        const animal = document.getElementById("alter-animal").value.trim();
        if (!animal)
            return alerta("aviso", "Carregue um tratamento antes de alterar (digite o ID e pressione ENTER).");

        tr.animal = animal;
        tr.data   = document.getElementById("alter-data").value.trim();
        tr.tipo   = document.getElementById("alter-tipo").value.trim();
        tr.valor  = document.getElementById("alter-valor").value.trim();
        tr.status = document.getElementById("alter-status").value.trim();

        fecharModal("modal-alterar-tratamento");
        alerta("sucesso", "Tratamento alterado!");
        renderTratamentos();

    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='alter-tratamento']").addEventListener("click", e => {
    e.preventDefault();
    alterarTratamento();
});

// ====== EXCLUIR TRATAMENTO ======
function excluirTratamento() {
    try {
        const id = document.getElementById("delete-id-tratamento").value.trim();
        const index = tratamentosData.findIndex(t => t.id === id);

        if (index === -1)
            return alerta("erro", "ID não encontrado!");

        tratamentosData.splice(index, 1);

        fecharModal("modal-excluir-tratamento");
        alerta("sucesso", "Tratamento removido!");
        renderTratamentos();
    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='delete-tratamento']").addEventListener("click", e => {
    e.preventDefault();
    excluirTratamento();
});

// ====== RENDER INICIAL ======
renderTratamentos();
