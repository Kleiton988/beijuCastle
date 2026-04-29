import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let usuarioEmail = null;

// ================= INICIALIZAÇÃO =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioEmail = user.email;
  } else {
    usuarioEmail = null;
  }
});

// ================= STORAGE =================
function getKey() {
  return usuarioEmail ? `favoritos_${usuarioEmail}` : "favoritos_anonimo";
}

function getFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(getKey())) || [];
  } catch {
    return [];
  }
}

function salvarFavoritos(lista) {
  localStorage.setItem(getKey(), JSON.stringify(lista));
}

// ================= OPERAÇÕES BÁSICAS =================
export function favoritarItem(item) {
  if (!item || !item.nome) return;
  const favoritos = getFavoritos();
  const existe = favoritos.find(f => f.nome === item.nome);
  if (!existe) {
    favoritos.push({ nome: item.nome, preco: item.preco });
    salvarFavoritos(favoritos);
  }
}

export function removerFavorito(nome) {
  let favoritos = getFavoritos();
  favoritos = favoritos.filter(f => f.nome !== nome);
  salvarFavoritos(favoritos);
}

export function listarFavoritos() {
  return getFavoritos();
}

export function toggleFavorito(item) {
  const favoritos = getFavoritos();
  const existe = favoritos.find(f => f.nome === item.nome);
  if (existe) {
    removerFavorito(item.nome);
    return false;
  } else {
    favoritarItem(item);
    return true;
  }
}

// ================= NOVA FUNCIONALIDADE: LIMPAR TODOS =================
export function limparTodosFavoritos() {
  salvarFavoritos([]);
}

// ================= UI (usada na página de favoritos) =================
function renderFavoritos() {
  const container = document.getElementById("listaFavoritos");
  const vazioMsg = document.getElementById("vazioMsg");
  if (!container) return;

  const favoritos = getFavoritos();
  container.innerHTML = "";

  if (favoritos.length === 0) {
    if (vazioMsg) vazioMsg.style.display = "block";
    return;
  }
  if (vazioMsg) vazioMsg.style.display = "none";

  favoritos.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <span>${item.nome} - R$ ${item.preco.toFixed(2)}</span>
      <div>
        <button class="btn-comprar" data-nome="${item.nome}" data-preco="${item.preco}">🛒</button>
        <button class="btn-remover" data-nome="${item.nome}">❌</button>
      </div>
    `;
    container.appendChild(div);
  });

  // Eventos delegados
  container.querySelectorAll(".btn-comprar").forEach(btn => {
    btn.addEventListener("click", () => {
      const nome = btn.dataset.nome;
      const preco = parseFloat(btn.dataset.preco);
      if (window.addCarrinho) {
        window.addCarrinho(nome, preco);
        alert("Adicionado ao carrinho!");
      } else {
        alert("Carrinho indisponível");
      }
    });
  });

  container.querySelectorAll(".btn-remover").forEach(btn => {
    btn.addEventListener("click", () => {
      const nome = btn.dataset.nome;
      removerFavorito(nome);
      renderFavoritos();
    });
  });
}

// ================= INICIALIZAÇÃO AUTOMÁTICA =================
document.addEventListener("DOMContentLoaded", () => {
  // Aguarda o Firebase determinar o usuário e então renderiza
  onAuthStateChanged(auth, (user) => {
    if (user) {
      usuarioEmail = user.email;
      renderFavoritos();
    }
  });
});

// Botão de limpar todos (adicione no HTML um botão com onclick="limparTodos()")
window.limparTodos = () => {
  if (confirm("Deseja realmente remover todos os favoritos?")) {
    limparTodosFavoritos();
    renderFavoritos();
  }
};

window.voltarHome = () => window.location.href = "home.html";