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

        const box = document
            .getElementById(modalId)
            .querySelector(".modal-box");

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
const API = "http://127.0.0.1:5000/api/adocoes";
let adocoesData = [];
let adocaoCarregada = false; 

// ======================
// BUSCAR LISTA DO BACKEND
// ======================
async function carregarAdocoes() {
    try {
        const res = await fetch(API + "/");
        adocoesData = await res.json();
        renderAdocoes(adocoesData);
    } catch (err) {
        alerta("erro", "Falha ao carregar adoções do servidor.");
        console.error(err);
    }
}

// ====== RENDERIZAÇÃO ======
function renderAdocoes(lista) {
    const container = document.getElementById("adocoesRows");
    if (!container) return;
    container.textContent = "";

    lista.forEach(a => {
        const row = document.createElement("div");
        row.classList.add("table-row", "grid-adocoes");

        const animalNome = a.animal_nome || `ID ${a.animal_id}`;
        const pessoaNome = a.pessoa_nome || `ID ${a.pessoa_id}`;

        row.innerHTML = `
            <div>${a.id}</div>
            <div>${animalNome}</div>
            <div>${pessoaNome}</div>
            <div>${a.data_adocao || "-"}</div>

            <div>
                <input 
                    type="checkbox" 
                    class="check-termo"
                    data-id="${a.id}"
                    ${a.termo ? "checked" : ""}
                >
            </div>

            <div>${a.status_adocao || "-"}</div>
        `;

        container.appendChild(row);
    });

    ativarCheckboxes();
    atualizarContadores();
}

// ====== CHECKBOX DA TABELA  ======
function ativarCheckboxes() {
    document.querySelectorAll("#adocoesRows .check-termo").forEach(cb => {
        cb.onchange = async () => {
            const id = cb.dataset.id;
            const novoValor = cb.checked;

            const adocao = adocoesData.find(a => a.id == id);
            if (!adocao) return alerta("erro", "Adoção não encontrada!");

            const payload = {
                animal_id: adocao.animal_id,
                pessoa_id: adocao.pessoa_id,
                data_adocao: adocao.data_adocao,
                status_adocao: adocao.status_adocao,
                termo: novoValor
            };

            try {
                const res = await fetch(API + "/" + id, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error();

                alerta("sucesso", novoValor ? "Termo marcado!" : "Termo desmarcado!");
                carregarAdocoes();

            } catch (err) {
                alerta("erro", "Falha ao atualizar no servidor.");
                cb.checked = !novoValor;
                console.error(err);
            }
        };
    });
}

// ====== CONTADORES ======
function atualizarContadores() {
    document.getElementById("total-analise").textContent =
        adocoesData.filter(a => a.status_adocao === "Análise").length;

    document.getElementById("total-em-processo").textContent =
        adocoesData.filter(a => a.status_adocao === "Em Processo").length;

    document.getElementById("total-adotados").textContent =
        adocoesData.filter(a => a.status_adocao === "Adotado").length;
}

// ====== BUSCA ======
const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const t = searchInput.value.toLowerCase().trim();

        const filtrados = adocoesData.filter(a =>
            a.id.toString().includes(t) ||
            (a.animal_nome || "").toLowerCase().includes(t) ||
            a.animal_id.toString().includes(t) ||
            (a.pessoa_nome || "").toLowerCase().includes(t) ||
            a.pessoa_id.toString().includes(t) ||
            (a.status_adocao || "").toLowerCase().includes(t) ||
            (a.data_adocao || "").toLowerCase().includes(t)
        );

        renderAdocoes(filtrados);
    });
}

// ====== ADICIONAR ADOÇÃO ======
async function cadastrarAdocao() {
    const animalRaw = document.getElementById("add-animal").value.trim();
    const tutorRaw  = document.getElementById("add-tutor").value.trim();
    const dataAd    = document.getElementById("add-data").value.trim();
    const status    = document.getElementById("add-status").value.trim();
    const termo     = document.getElementById("add-termo").checked;

    if (!animalRaw) return alerta("aviso", "Animal deve ser preenchido!");
    if (!tutorRaw)  return alerta("aviso", "Tutor deve ser preenchido!");
    if (!dataAd)    return alerta("aviso", "Data é obrigatória!");
    if (!status)    return alerta("aviso", "Status é obrigatório!");

    const payload = {
        animal_id: parseInt(animalRaw),
        pessoa_id: parseInt(tutorRaw),
        data_adocao: dataAd,
        termo,
        status_adocao: status
    };

    try {
        const res = await fetch(API + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Falha ao cadastrar.");

        alerta("sucesso", "Adoção cadastrada!");
        fecharModal("modal-adicionar-adocao");
        carregarAdocoes();
    } catch (err) {
        alerta("erro", err.message);
        console.error(err);
    }
}

document.querySelector("[data-submit-form='add-adocao']")
    .addEventListener("click", e => {
        e.preventDefault();
        cadastrarAdocao();
    });

// ====== CARREGAR PARA ALTERAR ======
document.getElementById("alter-id-adocao")
    .addEventListener("keyup", async e => {

        if (e.key !== "Enter") return;
        const id = e.target.value.trim();
        if (!id) return;

        try {
            const res = await fetch(API + "/" + id);
            if (!res.ok) return alerta("erro", "ID não encontrado!");

            const ado = await res.json();

            document.getElementById("alter-animal").value = ado.animal_id;
            document.getElementById("alter-tutor").value  = ado.pessoa_id;
            document.getElementById("alter-data").value   = ado.data_adocao;
            document.getElementById("alter-status").value = ado.status_adocao;
            document.getElementById("alter-termo").checked = ado.termo;

            adocaoCarregada = true; 

        } catch (err) {
            alerta("erro", "Erro ao buscar adoção.");
            console.error(err);
        }
    });

// ====== ALTERAR ADOÇÃO  ======
async function alterarAdocao() {
    const id = document.getElementById("alter-id-adocao").value.trim();

    if (!id) return alerta("aviso", "Informe um ID válido!");

    if (!adocaoCarregada)
        return alerta("aviso", "Carregue a adoção primeiro (digite o ID e pressione ENTER).");

    const animal = document.getElementById("alter-animal").value.trim();
    const tutor  = document.getElementById("alter-tutor").value.trim();
    const data   = document.getElementById("alter-data").value.trim();
    const status = document.getElementById("alter-status").value.trim();

    if (!animal) return alerta("aviso", "Animal não pode ficar vazio!");
    if (!tutor)  return alerta("aviso", "Tutor não pode ficar vazio!");
    if (!data)   return alerta("aviso", "Data é obrigatória!");
    if (!status) return alerta("aviso", "Status é obrigatório!");

    const payload = {
        animal_id: parseInt(animal),
        pessoa_id: parseInt(tutor),
        data_adocao: data,
        status_adocao: status,
        termo: document.getElementById("alter-termo").checked
    };

    try {
        const res = await fetch(API + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Falha ao alterar.");

        alerta("sucesso", "Adoção alterada!");
        fecharModal("modal-alterar-adocao");
        adocaoCarregada = false;
        carregarAdocoes();
    } catch (err) {
        alerta("erro", err.message);
        console.error(err);
    }
}

document.querySelector("[data-submit-form='alter-adocao']")
    .addEventListener("click", e => {
        e.preventDefault();
        alterarAdocao();
    });

// ====== EXCLUIR ADOÇÃO ======
async function excluirAdocao() {
    const id = document.getElementById("delete-id-adocao").value.trim();

    if (!id) return alerta("aviso", "Informe um ID válido.");

    try {
        const res = await fetch(API + "/" + id, { method: "DELETE" });

        if (!res.ok) throw new Error("Falha ao deletar.");

        alerta("sucesso", "Adoção deletada!");
        fecharModal("modal-excluir-adocao");
        carregarAdocoes();
    } catch (err) {
        alerta("erro", err.message);
        console.error(err);
    }
}

document.querySelector("[data-submit-form='delete-adocao']")
    .addEventListener("click", e => {
        e.preventDefault();
        excluirAdocao();
    });

// ====== RENDER INICIAL ======
carregarAdocoes();
