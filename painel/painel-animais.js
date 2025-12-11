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

    const alerta = document.createElement("div");
    alerta.className = "alert-box " + classes[tipo];

    alerta.innerHTML = `
        <img src="${icones[tipo]}">
        <span>${mensagem}</span>
        <button class="alert-close">×</button>
    `;

    alerta.querySelector(".alert-close").addEventListener("click", () => alerta.remove());
    container.appendChild(alerta);

    setTimeout(() => alerta.remove(), 3500);
}

// ======================
// VARIÁVEIS
// ======================
const API = "http://127.0.0.1:5000/api/animais"; 
let animalsData = [];
let animalCarregadoAlterar = false;

// ======================
// BUSCAR LISTA DO BACKEND
// ======================
async function carregarAnimais() {
    try {
        const res = await fetch(API + "/");
        animalsData = await res.json();
        renderAnimals(animalsData);
    } catch {
        alerta("erro", "Falha ao carregar animais.");
    }
}

// ====== RENDERIZAÇÃO ======
function renderAnimals(lista) {
    const container = document.getElementById("animalsRows");
    container.textContent = "";

    lista.forEach(a => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-animais");

        row.innerHTML = `
            <div>${a.id}</div>
            <div>${a.nome}</div>
            <div>${a.especie}</div>
            <div>${a.sexo}</div>
            <div>${a.nascimento || "-"}</div>
            <div>${a.resgate || "-"}</div>
            <div>${a.microchip || "-"}</div>
            <div>${a.status}</div>
            <div>${a.obs || "-"}</div>
        `;

        container.appendChild(row);
    });

    atualizarContadores();
}

// ====== CONTADORES ======
function atualizarContadores() {
    document.getElementById("total-gatos").textContent       = animalsData.filter(a => a.especie === "Gato").length;
    document.getElementById("total-cachorros").textContent   = animalsData.filter(a => a.especie === "Cachorro").length;
    document.getElementById("total-animais").textContent     = animalsData.length;
    document.getElementById("total-disponiveis").textContent = animalsData.filter(a => a.status === "Disponível").length;
    document.getElementById("total-adotados").textContent    = animalsData.filter(a => a.status === "Adotado").length;
}

// ====== BUSCA ======
document.getElementById("searchInput").addEventListener("input", () => {
    const txt = document.getElementById("searchInput").value.toLowerCase().trim();

    const filtrados = animalsData.filter(a =>
        a.nome.toLowerCase().includes(txt) ||
        a.id.toString().includes(txt) ||
        a.microchip?.toLowerCase().includes(txt) ||
        a.especie.toLowerCase().includes(txt) ||
        a.status.toLowerCase().includes(txt)
    );

    renderAnimals(filtrados);
});

// ====== ADICIONAR ANIMAL ======
async function cadastrarAnimal() {
    const nome = document.getElementById("add-nome").value.trim();
    const sexo = document.querySelector("input[name='add-sexo']:checked")?.value;
    const especie = document.getElementById("add-especie").value.trim();
    const status = document.getElementById("add-status").value.trim(); 
    const resgate = document.getElementById("add-resgate").value.trim();

    if (!nome)    return alerta("aviso", "Nome é obrigatório!");
    if (!sexo)    return alerta("aviso", "Sexo é obrigatório!");
    if (!especie) return alerta("aviso", "Espécie é obrigatória!");
    if (!status)  return alerta("aviso", "Status é obrigatório!");
    
    try {
        const res = await fetch(API + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome,
                sexo,
                especie,
                nascimento: document.getElementById("add-nascimento").value.trim(),
                resgate: resgate || null, // opcional
                microchip: document.getElementById("add-microchip").value.trim(),
                status,
                obs: document.getElementById("add-obs").value.trim()
            })
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Animal cadastrado!");
        fecharModal("modal-adicionar-animal");
        carregarAnimais();
    } catch {
        alerta("erro", "Falha ao cadastrar.");
    }
}

document.querySelector("[data-submit-form='add-animal']")
    .addEventListener("click", cadastrarAnimal);


// ====== CARREGAR PARA ALTERAR  ======
document.getElementById("alter-id").addEventListener("keyup", async e => {
    if (e.key !== "Enter") return;

    const id = e.target.value.trim();
    if (!id) return alerta("aviso", "Informe um ID!");

    try {
        const res = await fetch(API + "/" + id);
        if (!res.ok) return alerta("erro", "ID não encontrado!");

        const animal = await res.json();
        animalCarregadoAlterar = true;

        document.getElementById("alter-nome").value        = animal.nome;
        document.getElementById("alter-especie").value     = animal.especie;
        document.getElementById("alter-nascimento").value  = animal.nascimento;
        document.getElementById("alter-resgate").value     = animal.resgate;
        document.getElementById("alter-microchip").value   = animal.microchip;
        document.getElementById("alter-status").value      = animal.status;
        document.getElementById("alter-obs").value         = animal.obs;

        document.querySelectorAll("input[name='alter-sexo']").forEach(r =>
            r.checked = r.value === animal.sexo
        );

        alerta("sucesso", "Animal carregado para alteração.");
    } catch {
        alerta("erro", "Erro ao buscar animal.");
    }
});

// ====== ALTERAR ANIMAL  ======
async function alterarAnimal() {
    if (!animalCarregadoAlterar)
        return alerta("aviso", "Carregue o animal pelo ID (ENTER) antes de alterar!");

    const id = document.getElementById("alter-id").value.trim();

    try {
        const res = await fetch(API + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: document.getElementById("alter-nome").value.trim(),
                sexo: document.querySelector("input[name='alter-sexo']:checked")?.value,
                especie: document.getElementById("alter-especie").value.trim(),
                nascimento: document.getElementById("alter-nascimento").value.trim(),
                resgate: document.getElementById("alter-resgate").value.trim(),
                microchip: document.getElementById("alter-microchip").value.trim(),
                status: document.getElementById("alter-status").value.trim(),
                obs: document.getElementById("alter-obs").value.trim()
            })
        });

        if (!res.ok) throw new Error();

        alerta("sucesso", "Animal alterado!");
        animalCarregadoAlterar = false;
        fecharModal("modal-alterar-animal");
        carregarAnimais();
    } catch {
        alerta("erro", "Falha ao alterar.");
    }
}

document.querySelector("[data-submit-form='alter-animal']")
    .addEventListener("click", alterarAnimal);

// ====== EXCLUIR ANIMAL  ======
async function excluirAnimal() {
    const id = document.getElementById("delete-id").value.trim();
    if (!id) return alerta("aviso", "Informe um ID válido.");

    try {
        const res = await fetch(API + "/" + id, { method: "DELETE" });
        if (!res.ok) throw new Error();

        alerta("sucesso", "Animal removido!");
        fecharModal("modal-excluir-animal");
        carregarAnimais();
    } catch {
        alerta("erro", "Falha ao deletar.");
    }
}

document.querySelector("[data-submit-form='delete-animal']")
    .addEventListener("click", excluirAnimal);

// ====== RENDER INICIAL ======
carregarAnimais();
