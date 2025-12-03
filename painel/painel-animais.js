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

// =========================
// EXEMPLO (DELETAR DEPOIS)
// =========================
let animalsData = [
    { id: "001", nome: "Felix Mario Matheus", especie: "Gato", sexo: "M", nascimento: "2020", resgate: "2023-01-05", microchip: "12345ABC", status: "Disponível", obs: "Fiv" },
    { id: "002", nome: "Luna", especie: "Cachorro", sexo: "F", nascimento: "2021-03", resgate: "2023-04-12", microchip: "78910XYZ", status: "Adotado", obs: "Nenhuma doença" }
];

// ====== RENDERIZAÇÃO ======
function renderAnimals(lista = animalsData) {
    const container = document.getElementById("animalsRows");
    container.innerHTML = "";

    lista.forEach(a => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-animais");
        row.innerHTML = `
            <div>${a.id}</div>
            <div>${a.nome}</div>
            <div>${a.especie}</div>
            <div>${a.sexo}</div>
            <div>${a.nascimento || "-"}</div>
            <div>${a.resgate}</div>
            <div>${a.microchip}</div>
            <div>${a.status}</div>
            <div>${a.obs}</div>
        `;
        container.appendChild(row);
    });

    atualizarContadores();
}

// ====== CONTADORES ======
function atualizarContadores() {
    document.getElementById("total-gatos").textContent      = animalsData.filter(a => a.especie === "Gato").length;
    document.getElementById("total-cachorros").textContent  = animalsData.filter(a => a.especie === "Cachorro").length;
    document.getElementById("total-animais").textContent    = animalsData.length;
    document.getElementById("total-disponiveis").textContent= animalsData.filter(a => a.status === "Disponível").length;
    document.getElementById("total-adotados").textContent   = animalsData.filter(a => a.status === "Adotado").length;
}

// ====== BUSCA ======
document.getElementById("searchInput").addEventListener("input", () => {
    const t = document.getElementById("searchInput").value.toLowerCase().trim();

    const filtrados = animalsData.filter(a =>
        a.id.toLowerCase().includes(t) ||
        a.nome.toLowerCase().includes(t) ||
        a.microchip.toLowerCase().includes(t) ||
        a.especie.toLowerCase().includes(t.replace("gat", "gato").replace("cach", "cachorro")) ||
        a.status.toLowerCase().includes(t) ||
        (t.includes("macho") && a.sexo === "M") ||
        (t.includes("fêmea") && a.sexo === "F")
    );

    renderAnimals(filtrados);
});

// ====== ADICIONAR ANIMAL ======
function cadastrarAnimal() {
    try {
        const nome       = document.getElementById("add-nome").value.trim();
        const sexo       = document.querySelector("input[name='add-sexo']:checked")?.value;
        const especie    = document.getElementById("add-especie").value.trim();
        const nascimento = document.getElementById("add-nascimento").value.trim();
        const resgate    = document.getElementById("add-resgate").value.trim();
        const microchip  = document.getElementById("add-microchip").value.trim();
        const status     = document.getElementById("add-status").value.trim();
        const obs        = document.getElementById("add-observacao").value.trim();

        if (!nome) return alerta("aviso", "Nome deve ser preenchido!");
        if (!sexo) return alerta("aviso", "Sexo deve ser selecionado!");
        if (!especie) return alerta("aviso", "Espécie deve ser selecionada!");
        if (!resgate) return alerta("aviso", "Data de resgate é obrigatória!");

        const novoID = String(animalsData.length + 1).padStart(3, "0");

        animalsData.push({ id: novoID, nome, especie, sexo, nascimento, resgate, microchip, status, obs });

        fecharModal("modal-adicionar-animal");
        alerta("sucesso", "Animal cadastrado!");
        renderAnimals();
    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='add-animal']").addEventListener("click", e => {
    e.preventDefault();
    cadastrarAnimal();
});

// ====== ALTERAR ANIMAL ======
document.getElementById("alter-id").addEventListener("keyup", e => {
    if (e.key !== "Enter") return;

    const id = e.target.value.trim();
    const animal = animalsData.find(a => a.id === id);

    if (!animal) return alerta("erro", "ID não encontrado!");

    document.getElementById("alter-nome").value        = animal.nome;
    document.getElementById("alter-especie").value     = animal.especie;
    document.getElementById("alter-nascimento").value  = animal.nascimento;
    document.getElementById("alter-resgate").value     = animal.resgate;
    document.getElementById("alter-microchip").value   = animal.microchip;
    document.getElementById("alter-status").value      = animal.status;
    document.getElementById("alter-observacao").value  = animal.obs;

    document.querySelectorAll("input[name='alter-sexo']").forEach(r =>
        r.checked = r.value === animal.sexo
    );
});

function alterarAnimal() {
    try {
        const id = document.getElementById("alter-id").value.trim();
        const animal = animalsData.find(a => a.id === id);

        if (!animal)
            return alerta("erro", "ID não encontrado!");

        const nome = document.getElementById("alter-nome").value.trim();
        if (!nome)
            return alerta("aviso", "Carregue um animal antes de alterar (digite o ID e pressione ENTER).");

        animal.nome        = nome;
        animal.especie     = document.getElementById("alter-especie").value.trim();
        animal.sexo        = sexoAlter;
        animal.nascimento  = document.getElementById("alter-nascimento").value.trim();
        animal.resgate     = document.getElementById("alter-resgate").value.trim();
        animal.microchip   = document.getElementById("alter-microchip").value.trim();
        animal.status      = document.getElementById("alter-status").value.trim();
        animal.obs         = document.getElementById("alter-observacao").value.trim();

        fecharModal("modal-alterar-animal");
        alerta("sucesso", "Animal alterado!");
        renderAnimals();

    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='alter-animal']").addEventListener("click", e => {
    e.preventDefault();
    alterarAnimal();
});

// ====== EXCLUIR ANIMAL ======
function excluirAnimal() {
    try {
        const id = document.getElementById("delete-id").value.trim();
        const index = animalsData.findIndex(a => a.id === id);

        if (index === -1)
            return alerta("erro", "ID não encontrado!");

        animalsData.splice(index, 1);

        fecharModal("modal-excluir-animal");
        alerta("sucesso", "Animal removido!");
        renderAnimals();
    } catch (e) {
        alerta("erro", "Ocorreu um erro ao salvar. Tente novamente.");
    }
}

document.querySelector("[data-submit-form='delete-animal']").addEventListener("click", e => {
    e.preventDefault();
    excluirAnimal();
});

// ====== RENDER INICIAL ======
renderAnimals();

