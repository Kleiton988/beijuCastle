import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let usuarioEmail = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioEmail = user.email;
  } else {
    usuarioEmail = null;
  }
});

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

export function favoritarItem(item) {
  if (!item || !item.nome) return;
  const favoritos = getFavoritos();
  if (!favoritos.find(f => f.nome === item.nome)) {
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

export function limparTodosFavoritos() {
  salvarFavoritos([]);
}

// UI
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
      <button onclick="removerFavoritoItem('${item.nome}')">❌</button>
    `;
    container.appendChild(div);
  });
}

window.removerFavoritoItem = (nome) => {
  removerFavorito(nome);
  renderFavoritos();
};

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      usuarioEmail = user.email;
      renderFavoritos();
    }
  });
});