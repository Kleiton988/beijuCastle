import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { listarFavoritos, removerFavorito, setUsuarioEmail } from "./favoritos.js";

window.voltarHome = () => window.location.href = "home.html";
window.removerFavoritoItem = (nome) => {
  removerFavorito(nome);
  renderFavoritos();
};

function renderFavoritos() {
  const container = document.getElementById("listaFavoritos");
  const vazioMsg = document.getElementById("vazioMsg");
  if (!container) return;
  const favoritos = listarFavoritos();
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    setUsuarioEmail(user.email);
    renderFavoritos();
  } else {
    window.location.href = "index.html";
  }
});