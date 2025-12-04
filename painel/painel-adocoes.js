// ====== FUNÇÕES DE MODAL ======
function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
}

function fecharModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
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

    let classe = "";
    let icone = "";

    if (tipo === "sucesso") { classe = "alert-success"; icone = "icone-sucesso.svg"; }
    if (tipo === "aviso")    { classe = "alert-warning"; icone = "icone-alerta.svg"; }
    if (tipo === "erro")     { classe = "alert-error"; icone = "icone-erro.svg"; }

    const box = document.createElement("div");
    box.className = "alert-box " + classe;

    box.innerHTML = `
        <img src="${icone}">
        <span>${mensagem}</span>
        <button class="alert-close">×</button>
    `;

    box.querySelector(".alert-close").addEventListener("click", () => box.remove());
    container.appendChild(box);

    setTimeout(() => box.remove(), 3500);
}

// =========================
// EXEMPLO(DELETAR DEPOIS)
// =========================
let adocoesData = [
    { id: "001", animal: "Felix (ID: 001)", tutor: "Maria Silva (ID: 001)", data: "2024-01-01", termo: true,  status: "Adotado" },
    { id: "002", animal: "Luna (ID: 002)",  tutor: "João Ferreira (ID: 002)", data: "2023-12-10", termo: false, status: "Em Processo" }
];

// ====== RENDERIZAÇÃO DA TABELA ======
function renderAdocoes(lista = adocoesData) {
    const container = document.getElementById("adocoesRows");
    container.innerHTML = "";

    lista.forEach(a => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-adocoes");

        const termoHTML = `
            <div class="termo-col">
                <input type="checkbox" class="check-termo" data-id="${a.id}" ${a.termo ? "checked" : ""}>
            </div>
        `;

        row.innerHTML = `
            <div>${a.id}</div>
            <div>${a.animal}</div>
            <div>${a.tutor}</div>
            <div>${a.data}</div>
            ${termoHTML}
            <div>${a.status}</div>
        `;

        container.appendChild(row);
    });

    ativarCheckboxes();
    atualizarContadores();
}

// ====== CHECKBOX DA TABELA ======
function ativarCheckboxes() {
    document.querySelectorAll("#adocoesRows .check-termo").forEach(cb => {
        cb.onchange = () => {
            const id = cb.dataset.id;
            const obj = adocoesData.find(a => a.id === id);
            if (!obj) return alerta("erro", "ID não encontrado!");

            obj.termo = cb.checked;

            alerta("sucesso", cb.checked ? "Termo marcado!" : "Termo desmarcado!");
        };
    });
}

// ====== CONTADORES ======
function atualizarContadores() {
    document.getElementById("total-analise").textContent =
        adocoesData.filter(a => a.status === "Análise").length;

    document.getElementById("total-em-processo").textContent =
        adocoesData.filter(a => a.status === "Em Processo").length;

    document.getElementById("total-adotados").textContent =
        adocoesData.filter(a => a.status === "Adotado").length;
}

// ====== BUSCA ======
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
    const t = searchInput.value.toLowerCase().trim();

    const lista = adocoesData.filter(a =>
        a.id.toLowerCase().includes(t) ||
        a.animal.toLowerCase().includes(t) ||
        a.tutor.toLowerCase().includes(t) ||
        a.status.toLowerCase().includes(t) ||
        a.data.toLowerCase().includes(t)
    );

    renderAdocoes(lista);
});

// ====== ADICIONAR ADOÇÃO ======
function cadastrarAdocao() {
    try {
        const animal = document.getElementById("add-animal").value.trim();
        const tutor  = document.getElementById("add-tutor").value.trim();
        const data   = document.getElementById("add-data").value.trim();
        const status = document.getElementById("add-status").value.trim();
        const termo  = document.getElementById("add-termo").checked;

        if (!animal) return alerta("aviso", "Animal deve ser preenchido!");
        if (!tutor) return alerta("aviso", "Tutor deve ser preenchido!");
        if (!status) return alerta("aviso", "Status é obrigatório!");
        if (!data) return alerta("aviso", "Data é obrigatória!");

        const novoID = String(adocoesData.length + 1).padStart(3, "0");

        adocoesData.push({ id: novoID, animal, tutor, data, termo, status });

        fecharModal("modal-adicionar-adocao");
        alerta("sucesso", "Adoção registrada!");
        renderAdocoes();

    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='add-adocao']")
    .addEventListener("click", e => {
        e.preventDefault();
        cadastrarAdocao();
    });

// ====== ALTERAR ADOÇÃO ======
document.getElementById("alter-id-adocao").addEventListener("keyup", e => {
    if (e.key !== "Enter") return;

    const id = e.target.value.trim();
    const ado = adocoesData.find(a => a.id === id);

    if (!ado) return alerta("erro", "ID não encontrado!");

    document.getElementById("alter-animal").value = ado.animal;
    document.getElementById("alter-tutor").value  = ado.tutor;
    document.getElementById("alter-data").value   = ado.data;
    document.getElementById("alter-status").value = ado.status;
    document.getElementById("alter-termo").checked = ado.termo;
});

function alterarAdocao() {
    try {
        const id = document.getElementById("alter-id-adocao").value.trim();
        const ado = adocoesData.find(a => a.id === id);

        if (!ado) return alerta("erro", "ID não encontrado!");

        const animal = document.getElementById("alter-animal").value.trim();
        if (!animal)
            return alerta("aviso", "Carregue a adoção antes de alterar (digite o ID e pressione ENTER).");

        ado.animal = animal;
        ado.tutor  = document.getElementById("alter-tutor").value.trim();
        ado.data   = document.getElementById("alter-data").value.trim();
        ado.status = document.getElementById("alter-status").value.trim();
        ado.termo  = document.getElementById("alter-termo").checked;

        fecharModal("modal-alterar-adocao");
        alerta("sucesso", "Adoção alterada!");
        renderAdocoes();

    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='alter-adocao']")
    .addEventListener("click", e => {
        e.preventDefault();
        alterarAdocao();
    });

// ====== EXCLUIR ADOÇÃO ======
function excluirAdocao() {
    try {
        const id = document.getElementById("delete-id-adocao").value.trim();
        const index = adocoesData.findIndex(a => a.id === id);

        if (index === -1)
            return alerta("erro", "ID não encontrado!");

        adocoesData.splice(index, 1);

        fecharModal("modal-excluir-adocao");
        alerta("sucesso", "Adoção excluída!");
        renderAdocoes();

    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='delete-adocao']")
    .addEventListener("click", e => {
        e.preventDefault();
        excluirAdocao();
    });

// ====== RENDER INICIAL ======
renderAdocoes();


